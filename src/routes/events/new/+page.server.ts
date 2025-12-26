import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { AppwriteAdmin, ID } from '$lib/server/appwrite-admin';
import { APPWRITE_DATABASE_ID } from '$env/static/private';
import { EVENT_STATUS_SET } from '$lib/constants/event-statuses';
import type { EventStatus } from '$lib/constants/event-statuses';

const parseNumber = (value: FormDataEntryValue | null) => {
  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const actions: Actions = {
  default: async ({ request }) => {
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

    let newEventId = '';

    try {
      const created = await admin.tables.createRow({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: 'events',
        rowId: ID.unique(),
        data: payload,
      });

      newEventId = created.$id;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create event';
      return fail(500, {
        error: message,
        values: Object.fromEntries(data),
      });
    }

    throw redirect(303, `/events/${newEventId}`);
  },
};
