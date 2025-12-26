import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { AppwriteAdmin } from '$lib/server/appwrite-admin';
import { APPWRITE_DATABASE_ID } from '$env/static/private';
import { EVENT_STATUS_SET } from '$lib/constants/event-statuses';
import type { EventStatus } from '$lib/constants/event-statuses';

export const load: PageServerLoad = async ({ params }) => {
  const admin = new AppwriteAdmin();
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
      title: event.title ?? '',
      blurb: event.blurb ?? '',
      description: event.description ?? '',
      status: resolvedStatus,
      eventDate: event.event_date ?? '',
      startTime: event.start_time ?? '',
      endTime: event.end_time ?? '',
      capacity: event.capacity ?? '',
    },
  };
};

const parseNumber = (value: FormDataEntryValue | null) => {
  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const data = await request.formData();
    const title = data.get('title');
    const status = data.get('status');

    if (typeof title !== 'string' || title.trim().length === 0) {
      return fail(400, {
        error: 'Title is required',
        values: Object.fromEntries(data),
      });
    }

    if (typeof status !== 'string' || status.trim().length === 0) {
      return fail(400, {
        error: 'Status is required',
        values: Object.fromEntries(data),
      });
    }

    const normalizedStatus = status.trim();

    if (!EVENT_STATUS_SET.has(normalizedStatus as EventStatus)) {
      return fail(400, {
        error: 'Status must be one of draft, published, cancelled, completed, active, or inactive.',
        values: Object.fromEntries(data),
      });
    }

    const admin = new AppwriteAdmin();

    const resolvedStatus = normalizedStatus as EventStatus;

    const payload: Record<string, unknown> = {
      title: title.trim(),
      status: resolvedStatus,
      blurb: typeof data.get('blurb') === 'string' ? data.get('blurb') : null,
      description:
        typeof data.get('description') === 'string' ? data.get('description') : null,
      event_date:
        typeof data.get('event_date') === 'string' ? data.get('event_date') : null,
      start_time:
        typeof data.get('start_time') === 'string' ? data.get('start_time') : null,
      end_time: typeof data.get('end_time') === 'string' ? data.get('end_time') : null,
      capacity: parseNumber(data.get('capacity')),
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === null || payload[key] === '') {
        delete payload[key];
      }
    });

    try {
      await admin.tables.updateRow({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: 'events',
        rowId: params.id,
        data: payload,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update event';
      return fail(500, {
        error: message,
        values: Object.fromEntries(data),
      });
    }

    throw redirect(303, `/events/${params.id}`);
  },
};
