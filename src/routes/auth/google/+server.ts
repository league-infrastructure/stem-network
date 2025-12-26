import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { OAuthProvider } from 'node-appwrite';
import { adminAccount } from '$lib/server/appwrite-admin';

export const GET: RequestHandler = async ({ url }) => {
  const successUrl = `${url.origin}/auth/callback`;
  const failureUrl = `${url.origin}/login?error=auth_failed`;

  // Generate the OAuth2 URL using admin client
  const oauthUrl = await adminAccount.createOAuth2Token({
    provider: OAuthProvider.Google,
    success: successUrl,
    failure: failureUrl,
  });

  throw redirect(302, oauthUrl);
};
