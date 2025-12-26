import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { AppwriteAdmin } from '$lib/server/appwrite-admin';
import { EVENT_STATUS_SET } from '$lib/constants/event-statuses';
import type { EventStatus } from '$lib/constants/event-statuses';
import { APPWRITE_DATABASE_ID } from '$env/static/private';

export const load: PageServerLoad = async ({ params }) => {
  const admin = new AppwriteAdmin();

  try {
    const event = await admin.tables.getRow({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: 'events',
      rowId: params.id,
    });

    const resolvedStatus =
      typeof event.status === 'string' && EVENT_STATUS_SET.has(event.status as EventStatus)
        ? (event.status as EventStatus)
        : 'draft';

    return {
      event: {
        id: event.$id,
        title: event.title ?? 'Untitled Event',
        blurb: event.blurb ?? null,
        description: event.description ?? null,
        status: resolvedStatus,
        eventDate: event.event_date ?? null,
        startTime: event.start_time ?? null,
        endTime: event.end_time ?? null,
        capacity: event.capacity ?? null,
        createdAt: event.$createdAt,
        updatedAt: event.$updatedAt,
      },
    };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Event not found';
      throw error(404, message);
    }
};
