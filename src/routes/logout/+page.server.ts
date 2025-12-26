import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createSessionClient } from '$lib/server/appwrite-session';

const SESSION_COOKIE = 'appwrite_session';

export const actions: Actions = {
  default: async ({ cookies }) => {
    const sessionCookie = cookies.get(SESSION_COOKIE);

    if (sessionCookie) {
      try {
        const { account } = createSessionClient(sessionCookie);
        await account.deleteSession('current');
      } catch (error) {
        // Session might already be invalid, continue with logout
        console.error('Error deleting session:', error);
      }

      // Clear the session cookie
      cookies.delete(SESSION_COOKIE, { path: '/' });
    }

    throw redirect(302, '/');
  }
};
