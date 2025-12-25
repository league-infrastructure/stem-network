<script>
  import { enhance } from '$app/forms';

  /** @type {import('./$types').ActionData} */
  export let form;

  function formatDateForInput(date) {
    const d = date ?? new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  const titles = [
    'Intro to Python Workshop',
    'JavaScript Game Jam',
    'Robotics Kickoff Session',
    'Web Basics for Teens',
    'Data Science Day'
  ];
  const blurbs = [
    'Hands-on coding with friendly mentors.',
    'Build and share a simple project.',
    'Learn by doing in a fun environment.',
    'Great for beginners and curious minds.',
    'Small group, high support.'
  ];
  const descriptions = [
    'Agenda: icebreaker, fundamentals, project build, showcase. Bring a laptop if possible; loaners available. Parents welcome for check-in.',
    'We will cover variables, loops, and functions, then apply them in a mini-project. No prior experience required.',
    'Participants will form small teams and collaborate on a beginner-friendly challenge with mentor guidance.'
  ];

  let fields = {
    title: form?.data?.title || '',
    slug: form?.data?.slug || '',
    blurb: form?.data?.blurb || '',
    short_description: form?.data?.short_description || '',
    description: form?.data?.description || '',
    event_date: form?.data?.event_date || '',
    start_time: form?.data?.start_time || '',
    end_time: form?.data?.end_time || '',
    capacity: form?.data?.capacity || '',
    status: form?.data?.status || 'draft',
    registration_type: form?.data?.registration_type || 'open'
  };

  function fillExample() {
    const title = pick(titles);
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Math.floor(Math.random() * 1000)}`;
    const start = pick(['10:00', '13:00', '17:30']);
    const end = pick(['12:00', '15:00', '19:30']);
    const capacity = pick(['16', '24', '30']);
    fields = {
      title,
      slug,
      blurb: pick(blurbs),
      short_description: pick(descriptions),
      description: pick(descriptions),
      event_date: formatDateForInput(new Date(Date.now() + 1000 * 60 * 60 * 24 * pick([3, 7, 14]))),
      start_time: start,
      end_time: end,
      capacity,
      status: 'published',
      registration_type: 'open'
    };
  }
</script>

<div class="min-h-screen bg-slate-100">
  <div class="mx-auto max-w-4xl px-4 py-12 sm:px-6">
    <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
      <header class="border-b border-slate-200 bg-white/80 px-8 py-10">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="space-y-3">
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Create event</p>
            <h1 class="text-3xl font-semibold text-slate-900 sm:text-4xl">New event</h1>
            <p class="max-w-xl text-sm text-slate-600">
              Capture the essentials for this session. You can enrich it later with venue assignments, instructors, and marketing details.
            </p>
          </div>
          <div class="flex items-center gap-3">
            <button type="button" on:click={fillExample} class="inline-flex items-center gap-2 self-start rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-700">
              Fill example
            </button>
            <a href="/events" class="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-800">
              Cancel
            </a>
          </div>
        </div>
      </header>

      {#if form?.error}
        <div class="mx-8 mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800">
          <p class="font-semibold">Unable to create event</p>
          <p class="mt-1">{form.error}</p>
        </div>
      {/if}

      <form method="POST" use:enhance class="px-8 py-10 space-y-12">
      <section class="space-y-6">
          <h2 class="text-lg font-semibold text-slate-900">Event basics</h2>
          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-2">
              <label for="title" class="text-sm font-medium text-slate-700">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                required
                bind:value={fields.title}
                class="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Intro to Python Workshop"
              />
            </div>
            <div class="space-y-2">
              <label for="slug" class="text-sm font-medium text-slate-700">Slug *</label>
              <input
                type="text"
                id="slug"
                name="slug"
                required
                bind:value={fields.slug}
                class="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="python-workshop-2025"
              />
              <p class="text-xs text-slate-500">Used in URLs. Lowercase letters, numbers, and hyphens only.</p>
            </div>
          </div>
          <div class="space-y-2">
            <label for="blurb" class="text-sm font-medium text-slate-700">Blurb</label>
            <input
              type="text"
              id="blurb"
              name="blurb"
              bind:value={fields.blurb}
              class="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="One-line summary for cards"
            />
          </div>
          <div class="space-y-2">
            <label for="short_description" class="text-sm font-medium text-slate-700">Short description</label>
            <textarea
              id="short_description"
              name="short_description"
              rows="3"
              bind:value={fields.short_description}
              class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="High-level overview for partners and families"
            ></textarea>
          </div>
          <div class="space-y-2">
            <label for="description" class="text-sm font-medium text-slate-700">Detailed description</label>
            <textarea
              id="description"
              name="description"
              rows="6"
              bind:value={fields.description}
              class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="Agenda, learning outcomes, logistics, etc."
            ></textarea>
          </div>
      </section>

      <section class="space-y-6">
          <h2 class="text-lg font-semibold text-slate-900">Schedule & capacity</h2>
          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-2">
              <label for="event_date" class="text-sm font-medium text-slate-700">Event date</label>
              <input
                type="date"
                id="event_date"
                name="event_date"
                bind:value={fields.event_date}
                class="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div class="space-y-2">
              <label for="capacity" class="text-sm font-medium text-slate-700">Capacity</label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                min="0"
                bind:value={fields.capacity}
                class="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="How many seats?"
              />
            </div>
          </div>
          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-2">
              <label for="start_time" class="text-sm font-medium text-slate-700">Start time</label>
              <input
                type="time"
                id="start_time"
                name="start_time"
                bind:value={fields.start_time}
                class="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div class="space-y-2">
              <label for="end_time" class="text-sm font-medium text-slate-700">End time</label>
              <input
                type="time"
                id="end_time"
                name="end_time"
                bind:value={fields.end_time}
                class="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>
      </section>

      <section class="space-y-6">
          <h2 class="text-lg font-semibold text-slate-900">Registration settings</h2>
          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-2">
              <label for="status" class="text-sm font-medium text-slate-700">Status</label>
              <select
                id="status"
                name="status"
                bind:value={fields.status}
                class="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div class="space-y-2">
              <label for="registration_type" class="text-sm font-medium text-slate-700">Registration type</label>
              <select
                id="registration_type"
                name="registration_type"
                bind:value={fields.registration_type}
                class="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="open">Open</option>
                <option value="invite-only">Invite only</option>
                <option value="waitlist">Waitlist</option>
              </select>
            </div>
          </div>
      </section>

        <footer class="flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-slate-500">
            You can revisit this record any time to add supporting documents, venues, or staffing assignments.
          </p>
          <button
            type="submit"
            class="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-700"
          >
            Create event
          </button>
        </footer>
      </form>
    </div>
  </div>
</div>
