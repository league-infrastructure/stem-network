import { Client, Account, type Models } from 'node-appwrite';
import { PUBLIC_APPWRITE_ENDPOINT, PUBLIC_APPWRITE_PROJECT_ID } from '$env/static/public';

/**
 * Creates an Appwrite client authenticated with a user's session.
 * Use this for server-side operations that need to act as the logged-in user.
 */
export function createSessionClient(sessionCookie: string | undefined) {
  const client = new Client()
    .setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
    .setProject(PUBLIC_APPWRITE_PROJECT_ID);

  if (sessionCookie) {
    client.setSession(sessionCookie);
  }

  return {
    client,
    account: new Account(client)
  };
}

/**
 * Gets the current user from a session cookie.
 * Returns null if no valid session exists.
 */
export async function getUserFromSession(
  sessionCookie: string | undefined
): Promise<Models.User<Models.Preferences> | null> {
  if (!sessionCookie) {
    return null;
  }

  try {
    const { account } = createSessionClient(sessionCookie);
    return await account.get();
  } catch {
    return null;
  }
}
