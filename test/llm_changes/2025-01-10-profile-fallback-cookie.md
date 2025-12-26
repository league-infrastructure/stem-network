# Test: Server-side profile uses Appwrite session cookie via X-Fallback-Cookies

## Goal
Verify `/profile` server load can fetch the current user/session using the browser session cookie forwarded to Appwrite.

## Prereqs
- Appwrite running locally (`http://localhost:8080/v1`) with project `jtl-stem-net` and Google OAuth configured.
- Web platform origin includes `http://localhost:5173` in Appwrite console.
- `.env` populated with PUBLIC_APPWRITE_ENDPOINT and PUBLIC_APPWRITE_PROJECT_ID.
- Dev server running: `npm install` (once), then `npm run dev`.

## Steps
1. Visit `http://localhost:5173/login` and click **Continue with Google**. Complete OAuth.
2. When redirected to `/auth-callback`, wait until it redirects to `/profile`.
3. On `/profile`, confirm user info renders (id/email) without redirecting back to `/login`.

## Expected
- `/auth-callback` completes without error countdown.
- `/profile` shows the authenticated user and session details, proving server load can read the Appwrite session via `X-Fallback-Cookies`.
