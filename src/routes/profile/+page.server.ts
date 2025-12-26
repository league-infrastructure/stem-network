import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { Client, Account } from "appwrite";



export const load: PageServerLoad = async ({ locals }) => {

  console.log('Loading profile for user:', locals);

  if (!locals.user) {
    throw redirect(302, '/login');
  }

  return {
    user: {
      id: locals.user.$id,
      name: locals.user.name,
      email: locals.user.email,
      emailVerification: locals.user.emailVerification,
      createdAt: locals.user.$createdAt
    }
  };
};
