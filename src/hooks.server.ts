import type { Handle } from '@sveltejs/kit';
import { getUserFromSession } from '$lib/server/appwrite-session';

const SESSION_COOKIE = 'appwrite_session';

export const handle: Handle = async ({ event, resolve }) => {
  // Read our custom session cookie (set during OAuth callback)
  const sessionCookie = event.cookies.get(SESSION_COOKIE);

  // Try to get the user from the session
  event.locals.user = await getUserFromSession(sessionCookie);

  return resolve(event);
};
