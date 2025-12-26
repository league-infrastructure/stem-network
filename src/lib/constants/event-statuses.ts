export const EVENT_STATUSES = [
  'draft',
  'published',
  'cancelled',
  'completed',
  'active',
  'inactive',
] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export const EVENT_STATUS_SET = new Set<EventStatus>(EVENT_STATUSES);
