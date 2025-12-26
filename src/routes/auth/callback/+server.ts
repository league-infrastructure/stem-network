import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { adminAccount } from '$lib/server/appwrite-admin';

const SESSION_COOKIE = 'appwrite_session';

// Handle OAuth2 callback from Appwrite (GET request with userId and secret)
export const GET: RequestHandler = async ({ url, cookies }) => {
  const userId = url.searchParams.get('userId');
  const secret = url.searchParams.get('secret');

  if (!userId || !secret) {
    throw redirect(302, '/login?error=missing_params');
  }

  let session;
  try {
    // Create a session from the OAuth2 token using admin client
    session = await adminAccount.createSession(userId, secret);
  } catch (error) {
    console.error('OAuth callback error:', error);
    throw redirect(302, '/login?error=session_failed');
  }

  // Set the session cookie on our domain
  cookies.set(SESSION_COOKIE, session.secret, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // Set to true in production with HTTPS
    maxAge: 60 * 60 * 24 * 365 // 1 year
  });

  throw redirect(302, '/profile');
};
