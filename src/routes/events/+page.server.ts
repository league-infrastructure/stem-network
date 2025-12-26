import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { AppwriteAdmin, Query } from '$lib/server/appwrite-admin';
import { APPWRITE_DATABASE_ID } from '$env/static/private';
import { EVENT_STATUS_SET } from '$lib/constants/event-statuses';
import type { EventStatus } from '$lib/constants/event-statuses';

type EventSummary = {
  id: string;
  title: string;
  status: EventStatus;
  eventDate?: string;
  createdAt: string;
};

export const load: PageServerLoad = async () => {
  const admin = new AppwriteAdmin();
  const events = await admin.databases.listDocuments(
    APPWRITE_DATABASE_ID,
    'events',
    [Query.orderDesc('event_date'), Query.limit(100)]
  );

  const summaries: EventSummary[] = events.documents.map((doc) => {
    const normalizedStatus =
      typeof doc.status === 'string' && EVENT_STATUS_SET.has(doc.status as EventStatus)
        ? (doc.status as EventStatus)
        : 'draft';

    return {
      id: doc.$id,
      title: doc.title ?? 'Untitled Event',
      status: normalizedStatus,
      eventDate: doc.event_date ?? undefined,
      createdAt: doc.$createdAt,
    };
  });

  return {
    events: summaries,
  };
};

export const actions: Actions = {
  delete: async ({ request }) => {
    const data = await request.formData();
    const eventId = data.get('eventId');

    if (typeof eventId !== 'string' || !eventId) {
      return fail(400, { error: 'Missing event id' });
    }

    const admin = new AppwriteAdmin();

    try {
      await admin.databases.deleteDocument(APPWRITE_DATABASE_ID, 'events', eventId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete event';
      return fail(500, { error: message });
    }

    throw redirect(303, '/events');
  },
};
