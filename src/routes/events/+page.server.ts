import { Client, Databases, Query } from 'node-appwrite';
import { 
  PUBLIC_APPWRITE_ENDPOINT, 
  PUBLIC_APPWRITE_PROJECT_ID 
} from '$env/static/public';
import { APPWRITE_API_KEY, APPWRITE_DATABASE_ID } from '$env/static/private';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
  const client = new Client()
    .setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
    .setProject(PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    const events = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      'events',
      [
        Query.orderDesc('event_date'),
        Query.limit(100)
      ]
    );

    return {
      events: events.documents
    };
  } catch (error) {
    console.error('Error loading events:', error);
    return {
      events: [],
      error: error.message
    };
  }
}

export const actions: Actions = {
  delete: async ({ request }) => {
    const client = new Client()
      .setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
      .setProject(PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(APPWRITE_API_KEY);

    const databases = new Databases(client);
    const data = await request.formData();
    const eventId = data.get('eventId');

    try {
      await databases.deleteDocument(
        APPWRITE_DATABASE_ID,
        'events',
        eventId
      );

      return { success: true };
    } catch (error) {
      console.error('Error deleting event:', error);
      return { success: false, error: error.message };
    }
  }
};
