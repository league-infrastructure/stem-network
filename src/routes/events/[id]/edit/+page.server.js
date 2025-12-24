import { Client, Databases } from 'node-appwrite';
import { error, redirect } from '@sveltejs/kit';
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

/** @type {import('./$types').Actions} */
export const actions = {
  default: async ({ request, params }) => {
    const client = new Client()
      .setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
      .setProject(PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(APPWRITE_API_KEY);

    const databases = new Databases(client);
    const data = await request.formData();

    const eventData = {
      slug: data.get('slug'),
      title: data.get('title'),
      blurb: data.get('blurb') || undefined,
      short_description: data.get('short_description') || undefined,
      description: data.get('description') || undefined,
      event_date: data.get('event_date') || undefined,
      start_time: data.get('start_time') || undefined,
      end_time: data.get('end_time') || undefined,
      capacity: data.get('capacity') ? parseInt(data.get('capacity')) : undefined,
      status: data.get('status') || 'draft',
      registration_type: data.get('registration_type') || 'open'
    };

    // Remove undefined values
    Object.keys(eventData).forEach(key => 
      eventData[key] === undefined && delete eventData[key]
    );

    try {
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        'events',
        params.id,
        eventData
      );

      throw redirect(303, `/events/${params.id}`);
    } catch (err) {
      console.error('Error updating event:', err);
      return { 
        success: false, 
        error: err.message,
        data: Object.fromEntries(data)
      };
    }
  }
};
