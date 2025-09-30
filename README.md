# YinLove stream page v12
- Frontend calls **/api/twitch-status** every 30s for Twitch live status.
- **No credentials in frontend**; visitors do not need to enter anything.
- Kick live status still uses public Kick API directly.

## Deploy options for backend
### A) Vercel
- Put `backend-vercel/api/twitch-status.js` in your Vercel project.
- Add env vars in Vercel Dashboard → Settings → Environment Variables:
  - `TWITCH_CLIENT_ID` = your client id
  - `TWITCH_APP_ACCESS_TOKEN` = Bearer your_app_token   (paste the one you generated)
  - (Optional) `TWITCH_CLIENT_SECRET` if you prefer the function to obtain its own token
- Deploy, ensure the function is reachable at `/api/twitch-status`.

### B) Cloudflare Worker
- Use `backend-cloudflare-worker/worker.js`.
- Set KV/env bindings:
  - `TWITCH_CLIENT_ID`, `TWITCH_APP_ACCESS_TOKEN` (or `TWITCH_CLIENT_SECRET`)
- Deploy with Wrangler and route it to `/api/twitch-status` path.

## Frontend note
- `app.js` expects the endpoint at **/api/twitch-status** on the same origin.
  If you host the backend elsewhere, change the fetch URL in `isTwitchLive()` to that full URL.

