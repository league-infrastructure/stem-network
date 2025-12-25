<script>
  import { enhance } from '$app/forms';

  /** @type {import('./$types').PageData} */
  export let data;

  /** @type {import('./$types').ActionData} */
  export let form;

  function formatDateForInput(dateString) {
    if (!dateString) return '';
    return dateString.split('T')[0];
  }

  const formData = {
    title: form?.data?.title ?? data.event.title ?? '',
    slug: form?.data?.slug ?? data.event.slug ?? '',
    blurb: form?.data?.blurb ?? data.event.blurb ?? '',
    short_description: form?.data?.short_description ?? data.event.short_description ?? '',
    instructions: form?.data?.instructions ?? data.event.instructions ?? '',
    description: form?.data?.description ?? data.event.description ?? '',
    event_date: form?.data?.event_date ?? formatDateForInput(data.event.event_date) ?? '',
    start_time: form?.data?.start_time ?? data.event.start_time ?? '',
    end_time: form?.data?.end_time ?? data.event.end_time ?? '',
    capacity: form?.data?.capacity ?? data.event.capacity ?? '',
    available_slots: form?.data?.available_slots ?? data.event.available_slots ?? '',
    status: form?.data?.status ?? data.event.status ?? 'draft',
    registration_type: form?.data?.registration_type ?? data.event.registration_type ?? 'open'
  };
</script>

<svelte:head>
  <title>Edit Event</title>
</svelte:head>

<div class="min-h-screen bg-slate-100">
  <div class="mx-auto max-w-4xl px-4 py-12 sm:px-6">
    <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
      <header class="border-b border-slate-200 bg-white/80 px-8 py-10">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="space-y-3">
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Update event</p>
            <h1 class="text-3xl font-semibold text-slate-900 sm:text-4xl">{data.event.title}</h1>
            <p class="max-w-xl text-sm text-slate-600">
              Refresh details, add context, or adjust logistics. Save when you are ready to publish changes.
            </p>
          </div>
          <a href="/events/{data.event.$id}" class="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-800">
            View event
          </a>
        </div>
      </header>

      {#if form?.error}
        <div class="mx-8 mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800">
          <p class="font-semibold">Unable to update event</p>
          <p class="mt-1">{form.error}</p>
        </div>
      {/if}

      <form method="POST" use:enhance class="space-y-12 px-8 py-10">
        <section class="space-y-6">
          <h2 class="text-lg font-semibold text-slate-900">Event basics</h2>
          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-2">
              <label for="title" class="text-sm font-medium text-slate-700">Title *</label>
              <input
                id="title"
                type="text"
                name="title"
                class="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                value={formData.title}
                required
              />
            </div>
            <div class="space-y-2">
              <label for="slug" class="text-sm font-medium text-slate-700">Slug *</label>
              <input
                id="slug"
                type="text"
                name="slug"
                class="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                value={formData.slug}
                required
              />
              <p class="text-xs text-slate-500">Lowercase letters, numbers, and hyphens only.</p>
            </div>
          </div>
          <div class="space-y-2">
            <label for="blurb" class="text-sm font-medium text-slate-700">Blurb</label>
            <input
              id="blurb"
              type="text"
              name="blurb"
              class="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              value={formData.blurb}
              placeholder="One-line summary for cards"
            />
          </div>
          <div class="space-y-2">
            <label for="short_description" class="text-sm font-medium text-slate-700">Short description</label>
            <textarea
              id="short_description"
              name="short_description"
              rows="3"
              class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >{formData.short_description}</textarea>
          </div>
          <div class="space-y-2">
            <label for="description" class="text-sm font-medium text-slate-700">Detailed description</label>
            <textarea
              id="description"
              name="description"
              rows="6"
              class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >{formData.description}</textarea>
          </div>
        </section>

        <section class="space-y-6">
          <h2 class="text-lg font-semibold text-slate-900">Participant guidance</h2>
          <div class="space-y-2">
            <label for="instructions" class="text-sm font-medium text-slate-700">Instructions</label>
            <textarea
              id="instructions"
              name="instructions"
              rows="3"
              class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="Arrival notes, supply checklists, or communications"
            >{formData.instructions}</textarea>
          </div>
        </section>

        <section class="space-y-6">
          <h2 class="text-lg font-semibold text-slate-900">Schedule & capacity</h2>
          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-2">
              <label for="event_date" class="text-sm font-medium text-slate-700">Event date</label>
              <input
                id="event_date"
                type="date"
                name="event_date"
                value={formData.event_date}
                class="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div class="space-y-2">
              <label for="capacity" class="text-sm font-medium text-slate-700">Capacity</label>
              <input
                id="capacity"
                type="number"
                name="capacity"
                min="0"
                value={formData.capacity}
                class="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>
          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-2">
              <label for="start_time" class="text-sm font-medium text-slate-700">Start time</label>
              <input
                id="start_time"
                type="time"
                name="start_time"
                value={formData.start_time}
                class="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div class="space-y-2">
              <label for="end_time" class="text-sm font-medium text-slate-700">End time</label>
              <input
                id="end_time"
                type="time"
                name="end_time"
                value={formData.end_time}
                class="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>
          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-2">
              <label for="available_slots" class="text-sm font-medium text-slate-700">Available slots</label>
              <input
                id="available_slots"
                type="number"
                name="available_slots"
                min="0"
                value={formData.available_slots}
                class="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div class="space-y-2">
              <label for="registration_type" class="text-sm font-medium text-slate-700">Registration type</label>
              <select
                id="registration_type"
                name="registration_type"
                class="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="open" selected={formData.registration_type === 'open'}>Open</option>
                <option value="invite-only" selected={formData.registration_type === 'invite-only'}>Invite only</option>
                <option value="waitlist" selected={formData.registration_type === 'waitlist'}>Waitlist</option>
              </select>
            </div>
          </div>
        </section>

        <section class="space-y-6">
          <h2 class="text-lg font-semibold text-slate-900">Publishing</h2>
          <div class="space-y-2">
            <label for="status" class="text-sm font-medium text-slate-700">Status</label>
            <select
              id="status"
              name="status"
              class="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="draft" selected={formData.status === 'draft'}>Draft</option>
              <option value="published" selected={formData.status === 'published'}>Published</option>
              <option value="cancelled" selected={formData.status === 'cancelled'}>Cancelled</option>
              <option value="completed" selected={formData.status === 'completed'}>Completed</option>
            </select>
          </div>
        </section>

        <footer class="flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-slate-500">
            Changes go live immediately. Double-check timing and capacity when updating active events.
          </p>
          <div class="flex items-center gap-3">
            <a href="/events/{data.event.$id}" class="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-800">
              Cancel
            </a>
            <button type="submit" class="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-700">
              Save changes
            </button>
          </div>
        </footer>
      </form>
    </div>
  </div>
</div>
