'use strict';
// ORBITECH AI MOVIE WORLD production orchestrator v1.1
// Provider-neutral: no film is represented as rendered until a master URL and QA evidence exist.
const http = require('node:http');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const PORT = Number(process.env.PORT || 8787);
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:8000';
fs.mkdirSync(DATA_DIR, { recursive: true });
let jobs = new Map();
try { const saved = JSON.parse(fs.readFileSync(JOBS_FILE, 'utf8')); jobs = new Map(saved.map(j => [j.id, j])); } catch {}
function persist() { fs.writeFileSync(JOBS_FILE, JSON.stringify([...jobs.values()], null, 2)); }
function send(res, status, body) { res.writeHead(status, {'content-type':'application/json; charset=utf-8','access-control-allow-origin':CORS_ORIGIN,'access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization'}); res.end(JSON.stringify(body)); }
function readBody(req) { return new Promise((resolve,reject)=>{ let data=''; req.on('data',c=>{data+=c; if(data.length>1_000_000){reject(new Error('Body too large'));req.destroy();}}); req.on('end',()=>{try{resolve(data?JSON.parse(data):{});}catch{reject(new Error('Invalid JSON'));}}); req.on('error',reject); }); }
function safeText(v,max=3000){return String(v ?? '').trim().slice(0,max);}
function providerStatus(){return {videoProvider:process.env.AI_VIDEO_PROVIDER||null,videoConfigured:Boolean(process.env.AI_VIDEO_API_KEY),voiceConfigured:Boolean(process.env.AI_VOICE_API_KEY),musicConfigured:Boolean(process.env.AI_MUSIC_API_KEY),storageConfigured:Boolean(process.env.OBJECT_STORAGE_BUCKET&&process.env.OBJECT_STORAGE_ACCESS_KEY&&process.env.OBJECT_STORAGE_SECRET_KEY),note:'Credentials alone do not connect a provider. Implement the matching adapter and verify its API contract.'};}
const server=http.createServer(async(req,res)=>{
 if(req.method==='OPTIONS'){res.writeHead(204,{'access-control-allow-origin':CORS_ORIGIN,'access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization'});return res.end();}
 const url=new URL(req.url,'http://localhost');
 if(req.method==='GET'&&url.pathname==='/api/health')return send(res,200,{ok:true,service:'ORBITECH AI MOVIE WORLD Production API',version:'1.1.0',jobCount:jobs.size,providers:providerStatus()});
 if(req.method==='GET'&&url.pathname==='/api/production-jobs')return send(res,200,{jobs:[...jobs.values()].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)),count:jobs.size});
 if(req.method==='POST'&&url.pathname==='/api/production-jobs'){
  try { const b=await readBody(req); const runtime=Number(b.runtimeTarget); if(!safeText(b.title,120)||!safeText(b.genre,80)||!Number.isFinite(runtime)||runtime<30||runtime>600)return send(res,400,{error:'title and genre are required; runtimeTarget must be between 30 and 600 minutes'});
   const id='JOB-'+crypto.randomBytes(8).toString('hex').toUpperCase(); const job={id,title:safeText(b.title,120),genre:safeText(b.genre,80),runtimeTarget:runtime,language:safeText(b.language||'English',80),brief:safeText(b.brief,5000),status:'queued_for_provider_configuration',stage:'brief',progress:0,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),completed:false,providerJobId:null,masterUrl:null,actualRuntimeMinutes:null,qa:{passed:false,checks:[]},events:[{at:new Date().toISOString(),event:'brief_created'}]}; jobs.set(id,job);persist(); return send(res,202,{job,notice:'Brief safely queued. Rendering will not start until a real provider adapter is configured.'});
  } catch(e){return send(res,400,{error:e.message});}
 }
 const m=url.pathname.match(/^\/api\/production-jobs\/([A-Z0-9-]+)$/);
 if(req.method==='GET'&&m){const j=jobs.get(m[1]);return j?send(res,200,{job:j}):send(res,404,{error:'Job not found'});}
 const qa=url.pathname.match(/^\/api\/production-jobs\/([A-Z0-9-]+)\/qa$/);
 if(req.method==='POST'&&qa){try{const j=jobs.get(qa[1]);if(!j)return send(res,404,{error:'Job not found'});const b=await readBody(req);const actual=Number(b.actualRuntimeMinutes);const master=safeText(b.masterUrl,2000);if(!master||!/^https:\/\//i.test(master))return send(res,400,{error:'A valid HTTPS masterUrl is required'});if(!Number.isFinite(actual)||actual<30)return send(res,400,{error:'Actual rendered runtime must be at least 30 minutes'});if(b.rightsConfirmed!==true)return send(res,400,{error:'rightsConfirmed must be true before QA registration'});j.masterUrl=master;j.actualRuntimeMinutes=actual;j.qa={passed:true,checks:['HTTPS master URL supplied','actual runtime >= 30 minutes','rights confirmation recorded'],checkedAt:new Date().toISOString()};j.stage='qa_passed_waiting_publish';j.progress=95;j.status='QA passed — awaiting publication';j.updatedAt=new Date().toISOString();j.events.push({at:j.updatedAt,event:'qa_passed'});jobs.set(j.id,j);persist();return send(res,200,{job:j,notice:'QA evidence registered. Publication still requires a separate publish action.'});}catch(e){return send(res,400,{error:e.message});}}
 const pub=url.pathname.match(/^\/api\/production-jobs\/([A-Z0-9-]+)\/publish$/);
 if(req.method==='POST'&&pub){const j=jobs.get(pub[1]);if(!j)return send(res,404,{error:'Job not found'});if(!j.qa?.passed||!j.masterUrl||Number(j.actualRuntimeMinutes)<30)return send(res,409,{error:'Cannot publish: completed master and passing 30-minute QA evidence are required'});j.completed=true;j.stage='published';j.progress=100;j.status='Published';j.publishedAt=new Date().toISOString();j.updatedAt=j.publishedAt;j.events.push({at:j.updatedAt,event:'published'});jobs.set(j.id,j);persist();return send(res,200,{job:j});}
 return send(res,404,{error:'Not found'});
});
server.listen(PORT,()=>console.log(`ORBITECH production API v1.1 listening on port ${PORT}`));
