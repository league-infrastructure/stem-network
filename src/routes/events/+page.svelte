<script>
  import { enhance } from '$app/forms';

  /** @type {import('./$types').PageData} */
  export let data;

  const STATUS_CLASSES = {
    published: 'bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200',
    draft: 'bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200',
    cancelled: 'bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-200',
    completed: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200'
  };

  function formatDate(dateString) {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function statusClasses(status) {
    if (!status) return 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200';
    return STATUS_CLASSES[status] ?? 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200';
  }
</script>

<div class="min-h-screen bg-slate-100">
  <header class="border-b border-slate-200 bg-gradient-to-b from-white/90 to-white/70 backdrop-blur">
    <div class="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
      <div class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Stem network</p>
        <h1 class="text-3xl font-semibold text-slate-900 sm:text-4xl">Event roster</h1>
        <p class="max-w-xl text-sm text-slate-600">
          Track upcoming programs, workshops, and sessions in one place. Use the roster to review readiness,
          capacity, and status before sharing with partners or families.
        </p>
      </div>
      <a
        href="/events/new"
        class="inline-flex items-center gap-2 self-start rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-700"
      >
        <span aria-hidden="true" class="text-base">＋</span>
        <span>New event</span>
      </a>
    </div>
  </header>

  <main class="mx-auto max-w-5xl px-4 py-12 sm:px-6">
    {#if data.error}
      <div class="mb-10 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-800 shadow-sm">
        <p class="font-semibold">We hit a snag loading events.</p>
        <p class="mt-1">{data.error}</p>
      </div>
    {/if}

    {#if data.events.length === 0}
      <section class="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/80 px-8 py-16 text-center shadow-sm">
        <h2 class="text-2xl font-semibold text-slate-900">No events scheduled yet</h2>
        <p class="mt-3 max-w-md text-sm text-slate-600">
          Create your first event to share with students, families, and partners. You can always edit the details later.
        </p>
        <a
          href="/events/new"
          class="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-900 hover:text-white"
        >
          Start planning
        </a>
      </section>
    {:else}
      <section class="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {#each data.events as event (event.$id)}
          <article class="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
            <header class="flex items-start justify-between gap-4">
              <a href="/events/{event.$id}" class="flex-1 space-y-2">
                <h3 class="text-lg font-semibold text-slate-900 transition-colors group-hover:text-slate-700">
                  {event.title}
                </h3>
                {#if event.blurb}
                  <p class="text-sm leading-relaxed text-slate-600 line-clamp-3">{event.blurb}</p>
                {/if}
              </a>
              <span class={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClasses(event.status)}`}>
                {event.status || 'draft'}
              </span>
            </header>

            <dl class="mt-6 grid grid-cols-1 gap-4 text-sm text-slate-600">
              <div>
                <dt class="text-[0.65rem] font-semibold uppercase tracking-wide text-slate-500">Date</dt>
                <dd class="mt-1 text-slate-800">{formatDate(event.event_date)}</dd>
              </div>
              {#if event.start_time}
                <div>
                  <dt class="text-[0.65rem] font-semibold uppercase tracking-wide text-slate-500">Time</dt>
                  <dd class="mt-1 text-slate-800">
                    {event.start_time}
                    {#if event.end_time}
                      – {event.end_time}
                    {/if}
                  </dd>
                </div>
              {/if}
              {#if event.registration_type}
                <div>
                  <dt class="text-[0.65rem] font-semibold uppercase tracking-wide text-slate-500">Registration</dt>
                  <dd class="mt-1 text-slate-800">{event.registration_type}</dd>
                </div>
              {/if}
              {#if event.capacity}
                <div>
                  <dt class="text-[0.65rem] font-semibold uppercase tracking-wide text-slate-500">Capacity</dt>
                  <dd class="mt-1 text-slate-800">{event.capacity} seats</dd>
                </div>
              {/if}
            </dl>

            <footer class="mt-auto flex items-center justify-between gap-3 border-t border-slate-200 pt-6 text-sm">
              <a href="/events/{event.$id}" class="inline-flex items-center gap-2 font-semibold text-slate-800 transition-colors hover:text-slate-600">
                <span>View summary</span>
                <span aria-hidden="true">→</span>
              </a>
              <div class="flex items-center gap-3">
                <a href="/events/{event.$id}/edit" class="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900">
                  Edit
                </a>
                <form method="POST" action="?/delete" use:enhance>
                  <input type="hidden" name="eventId" value={event.$id} />
                  <button
                    type="submit"
                    class="inline-flex items-center gap-2 rounded-full border border-rose-300 px-3 py-1.5 text-rose-700 transition-colors hover:border-rose-400 hover:text-rose-800"
                    onclick={(e) => {
                      if (!confirm('Delete this event?')) {
                        e.preventDefault();
                      }
                    }}
                  >
                    Remove
                  </button>
                </form>
              </div>
            </footer>
          </article>
        {/each}
      </section>
    {/if}
  </main>
</div>
