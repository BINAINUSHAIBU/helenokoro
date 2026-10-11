# ORBITECH production API v1.1

Node.js 18+; built-in modules only. Start with `npm start`. The API stores jobs in `backend/data/jobs.json` and survives process restarts. This is a single-instance starter, not a production database.

## Endpoints
- `GET /api/health` — API and provider-credential presence (never returns secrets)
- `GET /api/production-jobs` — all queued jobs
- `POST /api/production-jobs` — create a brief (`title`, `genre`, `runtimeTarget` >= 30, optional `language`, `brief`)
- `GET /api/production-jobs/:id` — job details
- `POST /api/production-jobs/:id/qa` — register a finished HTTPS master, actual runtime >= 30, and `rightsConfirmed: true`
- `POST /api/production-jobs/:id/publish` — publish only after QA passes

Example create request:
```json
{"title":"The Glass Horizon","genre":"Science Fiction","runtimeTarget":35,"language":"English","brief":"Original story; define characters, visual style, and ending."}
```

Example QA request (only after the actual file exists and has been measured):
```json
{"masterUrl":"https://media.example.org/finished-film.mp4","actualRuntimeMinutes":35.2,"rightsConfirmed":true}
```

## Honest production status
The API queues and tracks briefs; it does **not** render video by itself. A real provider adapter must be implemented for your chosen video service, plus voice/music and editing/storage integrations. Video generation APIs often return short clips, so assembling a 30+ minute film requires a storyboard/shot plan, multiple clips, voice/audio, editing, and quality control. Never register a planned duration as actual runtime. Use a real media probe or trusted render report before QA.

Before public deployment add authentication/authorization, per-user quotas, rate limits, CSRF protections if cookie auth is used, secure database/object storage, signed webhook verification, audit logs, retention policy, monitoring, and HTTPS. The QA endpoint is an internal admin operation and must be protected before exposure to the internet.
