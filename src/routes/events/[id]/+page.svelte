<script>
  /** @type {import('./$types').PageData} */
  export let data;

  const STATUS_CLASSES = {
    published: 'bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200',
    draft: 'bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200',
    cancelled: 'bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-200',
    completed: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200'
  };

  function formatDate(dateString) {
    if (!dateString) return 'Date to be confirmed';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function statusClasses(status) {
    if (!status) return 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200';
    return STATUS_CLASSES[status] ?? 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200';
  }
</script>

<div class="min-h-screen bg-slate-100">
  <div class="mx-auto max-w-4xl px-4 py-12 sm:px-6">
    <a href="/events" class="inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-800">
      <span aria-hidden="true" class="mr-2">←</span> Back to roster
    </a>

    <article class="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
      <header class="border-b border-slate-200 bg-gradient-to-b from-white/80 to-white/60 px-8 py-10">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div class="space-y-4">
            <div class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Event overview
            </div>
            <h1 class="text-3xl font-semibold text-slate-900 sm:text-4xl">{data.event.title}</h1>
            {#if data.event.blurb}
              <p class="max-w-2xl text-base leading-relaxed text-slate-600">{data.event.blurb}</p>
            {/if}
          </div>
          <div class="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <span class={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClasses(data.event.status)}`}>
              {data.event.status || 'draft'}
            </span>
            <a
              href="/events/{data.event.$id}/edit"
              class="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-700"
            >
              Edit details
            </a>
          </div>
        </div>

        <dl class="mt-10 grid gap-6 text-sm text-slate-600 sm:grid-cols-2">
          <div>
            <dt class="text-[0.65rem] font-semibold uppercase tracking-wide text-slate-500">Date</dt>
            <dd class="mt-1 text-slate-800">{formatDate(data.event.event_date)}</dd>
          </div>
          <div>
            <dt class="text-[0.65rem] font-semibold uppercase tracking-wide text-slate-500">Registration</dt>
            <dd class="mt-1 text-slate-800">{data.event.registration_type || 'open'}</dd>
          </div>
          {#if data.event.start_time}
            <div>
              <dt class="text-[0.65rem] font-semibold uppercase tracking-wide text-slate-500">Time</dt>
              <dd class="mt-1 text-slate-800">
                {data.event.start_time}
                {#if data.event.end_time}
                  – {data.event.end_time}
                {/if}
              </dd>
            </div>
          {/if}
          {#if data.event.capacity}
            <div>
              <dt class="text-[0.65rem] font-semibold uppercase tracking-wide text-slate-500">Capacity</dt>
              <dd class="mt-1 text-slate-800">{data.event.capacity} seats</dd>
            </div>
          {/if}
        </dl>
      </header>

      <section class="space-y-12 px-8 py-10">
        {#if data.event.short_description}
          <section class="space-y-3">
            <h2 class="text-xl font-semibold text-slate-900">Overview</h2>
            <p class="max-w-none text-base leading-relaxed text-slate-700">{data.event.short_description}</p>
          </section>
        {/if}

        {#if data.event.description}
          <section class="space-y-3">
            <h2 class="text-xl font-semibold text-slate-900">Description</h2>
            <div class="prose prose-slate max-w-none text-slate-700">
              {data.event.description}
            </div>
          </section>
        {/if}

        {#if data.event.instructions}
          <section class="space-y-3">
            <h2 class="text-xl font-semibold text-slate-900">Logistics & instructions</h2>
            <div class="prose prose-slate max-w-none text-slate-700">
              {data.event.instructions}
            </div>
          </section>
        {/if}

        <section class="grid gap-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-6 sm:grid-cols-2">
          <div>
            <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-500">Event identifiers</h3>
            <p class="mt-2 text-sm font-mono text-slate-700 break-all">{data.event.$id}</p>
            {#if data.event.slug}
              <p class="mt-2 text-sm font-mono text-slate-700">{data.event.slug}</p>
            {/if}
          </div>
          <div>
            <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-500">Audit trail</h3>
            <p class="mt-2 text-sm text-slate-700">Created {new Date(data.event.$createdAt).toLocaleString()}</p>
            <p class="mt-1 text-sm text-slate-700">Updated {new Date(data.event.$updatedAt).toLocaleString()}</p>
          </div>
        </section>
      </section>
    </article>
  </div>
</div>
