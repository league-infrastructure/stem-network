import { Client, Databases } from 'node-appwrite';
import { error, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { 
  PUBLIC_APPWRITE_ENDPOINT, 
  PUBLIC_APPWRITE_PROJECT_ID 
} from '$env/static/public';
import { APPWRITE_API_KEY, APPWRITE_DATABASE_ID } from '$env/static/private';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }: { params: { id: string } }) {
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

export const actions: Actions = {
  default: async ({ request, params }) => {
    const client = new Client()
      .setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
      .setProject(PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(APPWRITE_API_KEY);

    const databases = new Databases(client);
    const data = await request.formData();

    const eventData: Record<string, FormDataEntryValue | undefined> = {
      slug: data.get('slug') ?? undefined,
      title: data.get('title') ?? undefined,
      blurb: data.get('blurb') ?? undefined,
      short_description: data.get('short_description') ?? undefined,
      description: data.get('description') ?? undefined,
      event_date: data.get('event_date') ?? undefined,
      start_time: data.get('start_time') ?? undefined,
      end_time: data.get('end_time') ?? undefined,
      capacity: data.get('capacity') ?? undefined,
      status: data.get('status') || 'draft',
      registration_type: data.get('registration_type') || 'open'
    };

    // Remove undefined values
    Object.keys(eventData).forEach(key => {
      if (eventData[key] === undefined) {
        delete eventData[key];
      }
    });

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
      const errorMessage = err instanceof Error ? err.message : String(err);
      return { 
        success: false, 
        error: errorMessage,
        data: Object.fromEntries(data)
      };
    }
  }
};
