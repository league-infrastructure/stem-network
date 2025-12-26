import { readFileSync } from 'node:fs';
import assert from 'node:assert';

const read = (relativePath) => readFileSync(new URL(relativePath, import.meta.url), 'utf8');

const constantsFile = read('../../src/lib/constants/event-statuses.ts');
assert(constantsFile.includes("export const EVENT_STATUSES"), 'EVENT_STATUSES export missing.');
for (const status of ['draft', 'published', 'cancelled', 'completed', 'active', 'inactive']) {
  assert(constantsFile.includes(`'${status}'`), `Status option ${status} missing.`);
}

const newServer = read('../../src/routes/events/new/+page.server.ts');
assert(newServer.includes('EVENT_STATUS_SET'), 'New event action must validate statuses against shared set.');
assert(
  newServer.includes('Status must be one of draft, published, cancelled, completed, active, or inactive.'),
  'New event action should surface a clear status validation message.'
);

const editServer = read('../../src/routes/events/[id]/edit/+page.server.ts');
assert(editServer.includes('EVENT_STATUS_SET'), 'Edit event action must validate statuses against shared set.');

const newPage = read('../../src/routes/events/new/+page.svelte');
assert(newPage.includes('<select name="status"'), 'New event form should use a dropdown for status.');
assert(newPage.includes('Fill with Example Data'), 'New event form should keep example data helper.');

const editPage = read('../../src/routes/events/[id]/edit/+page.svelte');
assert(editPage.includes('<select name="status"'), 'Edit event form should use a dropdown for status.');

console.log('Event status validation checks passed.');
