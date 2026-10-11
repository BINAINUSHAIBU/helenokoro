(() => {
  "use strict";
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const STORAGE = {favs:"orbitech_movie_favorites_v1", jobs:"orbitech_movie_jobs_v1", config:"orbitech_movie_config_v1"};
  const genres = ["All","African Cinema","Action & Adventure","Science Fiction","Drama","Romance","Comedy","Horror & Thriller","Fantasy","Animation & Family","Mystery & Crime","Documentary","Historical Epic"];
  const channels = [
    ["African Originals","🎬","Original stories inspired by African settings, futures and cultures","African Cinema"],
    ["Action Arena","⚡","High-energy adventures, missions and heroic journeys","Action & Adventure"],
    ["Beyond Tomorrow","🚀","Space, technology, alternate futures and cosmic discovery","Science Fiction"],
    ["Heart & Story","♥","Romance, family, relationships and emotional drama","Romance"],
    ["Laugh Lab","☻","Original comedy, satire and light-hearted adventures","Comedy"],
    ["Dark Screen","◐","Mystery, suspense and atmospheric horror concepts","Horror & Thriller"],
    ["Mythic Realms","✧","Fantasy worlds, folklore-inspired quests and magic","Fantasy"],
    ["Family Animation","❖","All-ages animated adventures and imaginative tales","Animation & Family"],
    ["Case Files","⌕","Detective stories, mysteries and fictional investigations","Mystery & Crime"],
    ["World & Time","⌛","Historical epics, future histories and documentary concepts","Historical Epic"],
    ["Learning Cinema","◎","Educational narratives and documentary-style concepts","Documentary"],
    ["Human Drama","✦","Character-led stories about choices, community and change","Drama"]
  ];
  const palettes = ["","p2","p3","p4","p5","p6","p7","p8"];
  const templates = [
    ["The Last {Noun} of {Place}","A {Hero} discovers a secret that could transform {Place}, but the truth demands a difficult choice."],
    ["{Place}: Beyond the {Noun}","When an unexpected event changes everything, a determined {Hero} races to protect the people they love."],
    ["The {Adjective} {Noun}","An unlikely alliance uncovers a hidden history and faces a future no one could have predicted."],
    ["A Promise in {Place}","Two very different lives intersect, revealing the power of courage, memory and belonging."],
    ["The {Noun} Protocol","A bold experiment spirals into a race against time, testing loyalty and the limits of imagination."],
    ["Echoes of {Place}","A forgotten story resurfaces and challenges a new generation to rewrite its destiny."]
  ];
  const words = {
    Noun:["Starlight","Kingdom","Signal","Crown","Horizon","Archive","Dream","River","Machine","Secret","Phoenix","Moon","Legacy","Compass","Mirror","Empire","Garden","Storm","Code","Lantern"],
    Place:["Lagos","New Abuja","the Red Coast","Kigali","a floating city","the Silver Desert","Nairobi","the Moon Colony","an ancient valley","Port Harcourt","the Glass Islands","a hidden kingdom","the Atlantic Frontier","tomorrow's Accra","the Cloud Forest"],
    Hero:["young engineer","reluctant detective","village storyteller","space navigator","ambitious filmmaker","brilliant inventor","exiled heir","community doctor","fearless journalist","quiet musician","retired pilot","curious student"],
    Adjective:["Silent","Infinite","Forgotten","Golden","Electric","Hidden","Midnight","Unwritten","Last","Crimson","Eternal","Invisible"]
  };
  const genreSets = [
    ["Science Fiction","Beyond Tomorrow","Futuristic"],
    ["African Cinema","African Originals","Cultural"],
    ["Action & Adventure","Action Arena","Adventure"],
    ["Drama","Human Drama","Character-driven"],
    ["Romance","Heart & Story","Romantic"],
    ["Comedy","Laugh Lab","Comedy"],
    ["Horror & Thriller","Dark Screen","Suspense"],
    ["Fantasy","Mythic Realms","Fantasy"],
    ["Animation & Family","Family Animation","Family"],
    ["Mystery & Crime","Case Files","Mystery"],
    ["Documentary","Learning Cinema","Documentary"],
    ["Historical Epic","World & Time","Historical"]
  ];
  const firstNames = ["Amara","Tobi","Zuri","Kelechi","Mina","Dayo","Nia","Sola","Ife","Kairo","Lena","Jabari","Adaeze","Malik","Imani","Noah","Ayo","Mariam","Chidi","Laila"];
  function hash(n){let h=2166136261;for(let i=0;i<n.length;i++){h^=n.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
  function pick(arr, seed, offset=0){return arr[(seed+offset*17)%arr.length]}
  function replaceTokens(s, seed){return s.replace(/\{(Noun|Place|Hero|Adjective)\}/g,(_,k)=>pick(words[k],seed, k.length))}
  function getGenre(i, seed){
    if(i<12)return genreSets[i];
    return genreSets[(seed+i*7)%genreSets.length];
  }
  function makeMovie(i){
    const id = i+1, seed=hash("ORBITECH-"+id);
    const g=getGenre(i,seed), tmpl=templates[seed%templates.length];
    let title=replaceTokens(tmpl[0],seed);
    if(i>=templates.length) title += [""," — Chapter "+(1+(seed%9)),": "+pick(["First Light","New Dawn","The Reckoning","Hidden Truth","Final Signal","Lost Horizon"],seed,3)][seed%3];
    title = title.replace(/\s+/g," ").trim();
    const lead=pick(firstNames,seed,2), place=pick(words.Place,seed,5);
    const desc=replaceTokens(tmpl[1],seed)+` Led by ${lead}, this original ${g[0].toLowerCase()} concept explores identity, sacrifice and the choices that shape a world.`;
    const runtime=30+((seed%7)*15);
    return {id, code:"OMW-"+String(id).padStart(5,"0"), title, genre:g[0], channel:g[1], tag:g[2], description:desc, runtimeTarget:Math.max(30,runtime), language:pick(["English","Nigerian Pidgin","Yoruba","Igbo","Hausa","French"],seed,6), year:2026+(seed%3), rating:(6.4+((seed%35)/10)).toFixed(1), status:"Concept", completed:false, videoUrl:"", posterKey:seed%palettes.length, cast:[lead,pick(firstNames,seed,7)], customization:{visualStyle:pick(["Cinematic realism","Stylized 3D","Afrofuturist","Neo-noir","Painterly fantasy"],seed,8), music:"Original licensed or generated score", subtitles:["English"], ending:"Emotionally satisfying"}};
  }
  const allMovies = Array.from({length:10000},(_,i)=>makeMovie(i));
  let activeView="home", activeGenre="All", visibleCount=12, selectedMovie=null;
  let favorites = new Set(readJSON(STORAGE.favs,[]));
  let jobs = readJSON(STORAGE.jobs,[]);
  const byId = id => allMovies.find(m=>m.id===Number(id));
  function readJSON(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
  function saveJSON(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch(e){console.warn("Storage unavailable",e)}}
  function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2900)}
  function posterClass(m){return palettes[m.posterKey]||""}
  function card(m){
    const fav=favorites.has(m.id);
    return `<article class="movie-card" data-id="${m.id}" tabindex="0" role="button" aria-label="View ${esc(m.title)} details">
      <div class="poster ${posterClass(m)}"><span class="poster-symbol">${m.code}</span><span class="poster-id">AI CONCEPT • ${m.year}</span></div>
      <div class="movie-info"><div class="movie-topline"><span>${esc(m.genre)}</span><span>${fav?"★ ":""}★ ${m.rating}</span></div><h3>${esc(m.title)}</h3><p>${esc(m.description.slice(0,106))}…</p><div class="movie-tags"><span class="tag">${m.runtimeTarget}+ min target</span><span class="tag status">${m.completed?"Completed":"Concept only"}</span></div></div></article>`;
  }
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
  function currentList(){
    let list=allMovies;
    if(activeView==="favorites") list=list.filter(m=>favorites.has(m.id));
    if(activeGenre!=="All")list=list.filter(m=>m.genre===activeGenre);
    const q=$("#searchInput").value.trim().toLowerCase();
    if(q)list=list.filter(m=>[m.title,m.genre,m.description,m.channel,m.code].some(v=>v.toLowerCase().includes(q)));
    return list;
  }
  function renderMovies(reset=false){
    if(reset)visibleCount=12;
    const list=currentList();
    const shown=list.slice(0,visibleCount);
    $("#movieGrid").innerHTML=shown.length?shown.map(card).join(""):'<div class="panel"><h3>No matching titles</h3><p class="muted-text">Try another search or add movies to favorites.</p></div>';
    $("#resultCount").textContent=`Showing ${shown.length.toLocaleString()} of ${list.length.toLocaleString()} matching catalog entries`;
    $("#loadMoreBtn").classList.toggle("hidden",shown.length>=list.length);
    $("#totalCount").textContent=allMovies.length.toLocaleString();
    $("#completedCount").textContent=allMovies.filter(m=>m.completed).length.toLocaleString();
    $$(".movie-card").forEach(el=>{el.addEventListener("click",()=>openMovie(el.dataset.id));el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openMovie(el.dataset.id)}})});
  }
  function renderFilters(){
    $("#genreFilters").innerHTML=genres.map(g=>`<button class="filter-chip ${activeGenre===g?"active":""}" data-genre="${esc(g)}">${esc(g)}</button>`).join("");
    $$(".filter-chip").forEach(b=>b.addEventListener("click",()=>{activeGenre=b.dataset.genre;renderFilters();renderMovies(true)}));
  }
  function renderChannels(){
    $("#channelGrid").innerHTML=channels.map((c,i)=>{
      const count=allMovies.filter(m=>m.channel===c[0]||m.genre===c[3]).length;
      return `<article class="channel-card" data-channel-genre="${esc(c[3])}" tabindex="0" role="button"><span class="channel-count">${count.toLocaleString()} concepts</span><div class="channel-icon">${c[1]}</div><h3>${esc(c[0])}</h3><p>${esc(c[2])}</p></article>`;
    }).join("");
    $$(".channel-card").forEach(el=>el.addEventListener("click",()=>{activeGenre=el.dataset.channelGenre;showView("catalog");renderFilters();renderMovies(true)}));
  }
  function showView(view){
    activeView=view;
    const sections={home:$("#dashboardSection"),catalog:$("#dashboardSection"),favorites:$("#dashboardSection"),channels:$("#channelsSection"),production:$("#productionSection"),admin:$("#adminSection")};
    Object.values(sections).forEach(s=>s.classList.add("hidden"));
    (sections[view]||sections.home).classList.remove("hidden");
    $("#hero").classList.toggle("hidden",!["home"].includes(view));
    const names={home:"Discover",catalog:"All Movies",favorites:"My Favorites",channels:"Movie Channels",production:"AI Production Studio",admin:"Admin & Settings"};
    $("#pageCrumb").textContent=names[view]||"Discover";
    $("#sectionTitle").textContent=view==="favorites"?"My favorites":view==="catalog"?"All movie concepts":"Featured concepts";
    if(view==="favorites"||view==="catalog")activeGenre="All";
    $$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
    renderFilters();renderMovies(true);renderJobs();renderAdmin();
    $("#sidebar").classList.remove("open");
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function openMovie(id){
    selectedMovie=byId(id);if(!selectedMovie)return;
    const m=selectedMovie;
    $("#modalPoster").className="modal-poster "+posterClass(m);
    $("#modalGenre").textContent=`${m.code} • ${m.genre.toUpperCase()}`;
    $("#modalTitle").textContent=m.title;$("#modalDescription").textContent=m.description;
    $("#modalMeta").innerHTML=[`${m.year}`,`${m.runtimeTarget}+ min target`,`Language: ${m.language}`,`★ ${m.rating}`,`Status: ${m.completed?"Completed":"Concept only"}`].map(x=>`<span>${esc(x)}</span>`).join("");
    $("#favoriteToggle").textContent=favorites.has(m.id)?"★ Remove favorite":"☆ Add to favorites";
    $("#playbackNotice").textContent=m.completed&&m.videoUrl?"A completed master is registered. Playback URL is available to your configured deployment.":"Concept only — the playable clip above is a demo preview, not this full-length movie.";
    const player=$("#demoVideo");
    player.pause(); player.currentTime=0;
    player.load();
    $("#movieModal").classList.remove("hidden");
    // Attempt muted playback after the user's click; if browser policy blocks it, controls remain available.
    const startPreview=player.play(); if(startPreview&&typeof startPreview.catch==="function")startPreview.catch(()=>{});
  }
  function closeModal(){$("#demoVideo").pause();$("#movieModal").classList.add("hidden")}
  async function addJob(title,genre,runtime,language,brief,movieId=null){
    const job={id:"JOB-"+Date.now().toString(36).toUpperCase(),title,genre,runtimeTarget:Number(runtime),language,brief,movieId,status:"Saved locally — API not connected",createdAt:new Date().toISOString(),stages:["Screenplay","Storyboard","Video generation","Voice & music","Edit & QA","Publish"],completed:false};
    try{
      const response=await fetch("http://localhost:8787/api/production-jobs",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({title,genre,runtimeTarget:Number(runtime),language,brief})});
      if(response.ok){const payload=await response.json();Object.assign(job,{id:payload.job.id,status:"Queued on production API — provider setup required",apiJobId:payload.job.id});toast("Production brief queued on the local API. Rendering still requires a configured provider.");}
      else toast("API rejected the brief; saved locally instead.");
    }catch{toast("Production API not detected. Brief saved in this browser; start the backend to enable queue sync.");}
    jobs.unshift(job);saveJSON(STORAGE.jobs,jobs);renderJobs();renderAdmin();
  }
  function renderJobs(){
    const box=$("#jobsList");if(!box)return;
    if(!jobs.length){box.innerHTML='<div class="muted-text">No production jobs yet. Create a brief above to begin planning.</div>';return}
    box.innerHTML=jobs.slice(0,30).map(j=>`<div class="job-row"><div class="job-mark">✦</div><div class="job-detail"><strong>${esc(j.title)}</strong><small>${esc(j.genre)} • ${j.runtimeTarget} min target • ${new Date(j.createdAt).toLocaleString()}</small><small>${esc(j.status)}</small></div><span class="job-badge">${j.completed?"Completed":"Planning"}</span></div>`).join("");
  }
  function renderAdmin(){
    const done=allMovies.filter(m=>m.completed).length;
    const data=[["Catalog entries",allMovies.length.toLocaleString(),"Generated fictional metadata"],["Completed films",done.toLocaleString(),"Only verified rendered masters"],["Favorites",favorites.size.toLocaleString(),"Saved in this browser"],["Production jobs",jobs.length.toLocaleString(),"Planning queue"]];
    $("#adminStats").innerHTML=data.map(d=>`<div class="stat-card"><span>${d[0]}</span><strong>${d[1]}</strong><small>${d[2]}</small></div>`).join("");
  }
  function download(name,content,type="application/json"){
    const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function exportCatalog(){download("orbitech-ai-movie-catalog-10000.json",JSON.stringify({brand:"ORBITECH AI MOVIE WORLD",generatedAt:new Date().toISOString(),notice:"Catalog entries are original fictional concepts, not completed films.",count:allMovies.length,movies:allMovies},null,2))}
  function exportM3u(){
    const completed=allMovies.filter(m=>m.completed&&m.videoUrl);
    const lines=["#EXTM3U",`# ORBITECH AI MOVIE WORLD — ${completed.length} verified completed films`];
    completed.forEach(m=>lines.push(`#EXTINF:-1 group-title="${m.genre.replace(/"/g,"")}",${m.title.replace(/"/g,"")}`,m.videoUrl));
    download("orbitech-completed-films.m3u",lines.join("\n"),"audio/x-mpegurl");
    if(!completed.length)toast("No completed film masters are registered yet. The exported M3U contains no fake stream URLs.");
  }
  function init(){
    $("#totalCount").textContent=allMovies.length.toLocaleString();
    renderFilters();renderMovies();renderChannels();renderJobs();renderAdmin();
    $$(".nav-item").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
    $$("[data-open-view]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.openView)));
    $("#exploreBtn").addEventListener("click",()=>{showView("catalog");$("#dashboardSection").scrollIntoView({behavior:"smooth"})});
    $("#watchDemoBtn").addEventListener("click",()=>openMovie(1));
    $("#searchInput").addEventListener("input",()=>{if(activeView==="channels"||activeView==="production"||activeView==="admin")showView("catalog");renderMovies(true)});
    $("#loadMoreBtn").addEventListener("click",()=>{visibleCount+=12;renderMovies()});
    $("#menuToggle").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
    $("#modalClose").addEventListener("click",closeModal);
    $("#movieModal").addEventListener("click",e=>{if(e.target.id==="movieModal")closeModal()});
    document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
    $("#favoriteToggle").addEventListener("click",()=>{if(!selectedMovie)return;if(favorites.has(selectedMovie.id))favorites.delete(selectedMovie.id);else favorites.add(selectedMovie.id);saveJSON(STORAGE.favs,[...favorites]);$("#favoriteToggle").textContent=favorites.has(selectedMovie.id)?"★ Remove favorite":"☆ Add to favorites";renderMovies();renderAdmin();toast(favorites.has(selectedMovie.id)?"Added to favorites":"Removed from favorites")});
    $("#productionFromMovie").addEventListener("click",()=>{if(!selectedMovie)return;const m=selectedMovie;closeModal();$("#prodTitle").value=m.title;$("#prodGenre").value=m.genre;$("#prodRuntime").value=String(Math.max(30,m.runtimeTarget));$("#prodLanguage").value=m.language;$("#prodBrief").value=m.description;showView("production");toast("Concept copied into a production brief")});
    $("#productionForm").addEventListener("submit",e=>{e.preventDefault();addJob($("#prodTitle").value.trim(),$("#prodGenre").value,$("#prodRuntime").value,$("#prodLanguage").value,$("#prodBrief").value.trim())});
    $("#exportJobsBtn").addEventListener("click",()=>download("orbitech-production-jobs.json",JSON.stringify(jobs,null,2)));
    $("#exportCatalogBtn").addEventListener("click",exportCatalog);
    $("#exportM3uBtn").addEventListener("click",exportM3u);
    $("#saveConfigBtn").addEventListener("click",()=>{const endpoint=$("#apiBase").value.trim();saveJSON(STORAGE.config,{apiBase:endpoint});toast("Endpoint saved locally. No connection has been tested.")});
    const cfg=readJSON(STORAGE.config,{});if(cfg.apiBase)$("#apiBase").value=cfg.apiBase;
  }
  init();
})();