# ORBITECH AI MOVIE WORLD

A movie-only catalog and AI film-production workflow prototype.

## What is included
- `index.html` — responsive movie-only dashboard.
- `css/style.css` — dark cinematic UI, responsive layout and modal styles.
- `data/movies.js` — initializes the browser's `window.ORBITECH_MOVIES` reference (the app currently generates the full 10,000-entry catalog deterministically in `js/app.js` so it can be searched and exported without a huge static source file).
- `js/app.js` — catalog generation, movie channels, search, genre filters, favorites, detail modal, local production-job tracker and exports.
- `backend/` — starter Node.js API contract and secure provider integration notes.
- `docs/PRODUCTION_PIPELINE.md` — staged AI movie production plan.

## Run locally
1. Extract the ZIP.
2. Open `index.html` in a modern browser. For best results, use a local static server:
   - Python: `python -m http.server 8000`
   - Then open `http://localhost:8000`.
3. Click **Watch demo preview** on the home screen, or open any movie concept, to play the bundled 30-second MP4. The player includes play/pause, seek, volume and fullscreen controls. It is muted initially; use the speaker control to turn on the sample soundtrack.
4. The site works without external APIs for the catalog, filters, favorites, and local production briefs.

## Important: catalog versus finished films
The 10,000 records are original, fictional **movie concepts with metadata**, not 10,000 completed rendered films. No fabricated playback URLs are included. The dashboard reports zero completed films until real video masters and verified URLs are registered by a connected backend. Every completed film must have a real rendered master with a verified duration of at least 30 minutes.

## Connect production providers
- Implement a server-side API using the starter contract in `backend/`.
- Add authenticated endpoints for creating jobs, checking status, uploading final masters and publishing metadata.
- Store provider API keys in environment variables/secrets manager, never in client JavaScript or the ZIP.
- Integrate licensed AI video generation, voice, music, subtitles and editing services according to their current API documentation and terms.
- Plan around provider clip-duration limits: a 30-minute film is normally assembled from many generated shots/clips, then edited and checked.
- Implement retries, idempotency, quotas, callbacks/webhooks, moderation, storage permissions and cost controls.
- Mark a film `completed` only after a real final master has been rendered, duration checked, rights reviewed, and playback tested.

## Prototype limitations
- Production jobs are saved to this browser's local storage and do not start a remote render.
- The “Save local endpoint” control stores an endpoint string only; it does not call the server.
- No admin authentication or production backend is enabled in this static ZIP.
- Poster artwork is generated CSS illustration, not a claim of completed movie art.

## v1.1 production API upgrade

The backend now persists production briefs to `backend/data/jobs.json`, exposes queue/status endpoints, reports whether server-side provider credentials are present, and enforces a 30-minute QA gate before publishing. The Production Studio attempts to submit briefs to `http://localhost:8787`; if the API is offline, it safely keeps the brief in browser storage.

Run the site from `http://localhost:8000` and the API on port `8787`:
1. In the project folder, run `npm start`.
2. In a second terminal, run `python -m http.server 8000`.
3. Open `http://localhost:8000`.

This is a functional orchestration starter, not a video rendering service. A vendor-specific adapter and credentials are still required to render actual films.


## v1.2 playable preview
The homepage now includes a direct Watch demo preview action. Opening a movie concept shows the bundled 30-second MP4 player; it attempts muted autoplay after the click and always leaves native playback controls available. Closing the movie dialog pauses playback. The demo reel is clearly labeled as a sample and does not count as a completed movie master.
