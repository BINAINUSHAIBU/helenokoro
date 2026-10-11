# Production pipeline and 30-minute completion gate

1. **Brief** — original premise, audience, language, genre, runtime target, character/style bible, rights declaration.
2. **Script** — create screenplay, scene list, estimated dialogue/audio duration, continuity review.
3. **Storyboard** — shot list with target seconds per shot, camera, action, visual references and asset provenance.
4. **Video generation** — submit shots to a selected authorized provider adapter; track provider job IDs and retry transient failures.
5. **Voice and sound** — licensed/original voices, music and effects; confirm voice/likeness and music rights.
6. **Assembly** — edit generated shots into a timeline; fill gaps with additional original scenes, transitions and credits. Do not loop a short clip to falsely satisfy duration.
7. **Technical QA** — inspect codec, audio, black frames, sync, continuity, content safety, rights, and actual duration using a media probe.
8. **Publish gate** — require an HTTPS master, actual duration >= 30 minutes, rights confirmation, and passing QA evidence. Only then mark the job published.

## Runtime planning
A 30-minute master is 1,800 seconds. If a provider produces 8-second clips, 225 usable clips would be required before accounting for retakes, transitions, titles, and credits. Plan for additional footage and editing overhead. Provider clip limits vary; verify current documentation and pricing before production.

## Provider adapter contract
Implement a server-side module for the selected vendor with `submitShot(shot)`, `getShotStatus(providerJobId)`, and `downloadCompletedAsset(providerJobId)`. Store keys only in server environment variables. Add idempotency, timeouts, bounded retries, job-state persistence, callback signature verification, and per-user budget controls. This starter intentionally does not invent a vendor endpoint or claim that rendering works without an adapter and credentials.
