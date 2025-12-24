import { Client, Databases, ID } from 'node-appwrite';
import { redirect } from '@sveltejs/kit';
import { 
  PUBLIC_APPWRITE_ENDPOINT, 
  PUBLIC_APPWRITE_PROJECT_ID 
} from '$env/static/public';
import { APPWRITE_API_KEY, APPWRITE_DATABASE_ID } from '$env/static/private';

/** @type {import('./$types').Actions} */
export const actions = {
  default: async ({ request }) => {
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
      const event = await databases.createDocument(
        APPWRITE_DATABASE_ID,
        'events',
        ID.unique(),
        eventData
      );

      throw redirect(303, `/events/${event.$id}`);
    } catch (error) {
      console.error('Error creating event:', error);
      return { 
        success: false, 
        error: error.message,
        data: Object.fromEntries(data)
      };
    }
  }
};
