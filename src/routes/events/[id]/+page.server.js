import { Client, Databases } from 'node-appwrite';
import { error } from '@sveltejs/kit';
import { 
  PUBLIC_APPWRITE_ENDPOINT, 
  PUBLIC_APPWRITE_PROJECT_ID 
} from '$env/static/public';
import { APPWRITE_API_KEY, APPWRITE_DATABASE_ID } from '$env/static/private';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const client = new Client()
    .setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
    .setProject(PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    const event = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      'events',
      params.id
    );

    return { event };
  } catch (err) {
    console.error('Error loading event:', err);
    throw error(404, 'Event not found');
  }
}
