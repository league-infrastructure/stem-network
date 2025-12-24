<script>
  /** @type {import('./$types').PageData} */
  export let data;

  function formatDate(dateString) {
    if (!dateString) return 'No date set';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
</script>

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <div class="mb-4">
    <a href="/events" class="text-blue-600 hover:underline">← Back to Events</a>
  </div>

  <div class="bg-white rounded-lg shadow-lg p-8">
    <div class="flex justify-between items-start mb-6">
      <div>
        <h1 class="text-4xl font-bold mb-2">{data.event.title}</h1>
        {#if data.event.blurb}
          <p class="text-xl text-gray-600">{data.event.blurb}</p>
        {/if}
      </div>
      <div class="flex gap-2">
        <a 
          href="/events/{data.event.$id}/edit" 
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Edit
        </a>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded">
      <div>
        <span class="font-semibold">Date:</span> {formatDate(data.event.event_date)}
      </div>
      {#if data.event.start_time}
        <div>
          <span class="font-semibold">Time:</span> {data.event.start_time}
          {#if data.event.end_time}
            - {data.event.end_time}
          {/if}
        </div>
      {/if}
      {#if data.event.capacity}
        <div>
          <span class="font-semibold">Capacity:</span> {data.event.capacity}
        </div>
      {/if}
      {#if data.event.available_slots !== undefined}
        <div>
          <span class="font-semibold">Available Slots:</span> {data.event.available_slots}
        </div>
      {/if}
      <div>
        <span class="font-semibold">Status:</span>
        <span class="px-2 py-1 rounded text-sm ml-2"
          class:bg-green-100={data.event.status === 'published'}
          class:bg-yellow-100={data.event.status === 'draft'}
          class:bg-red-100={data.event.status === 'cancelled'}
          class:bg-gray-100={data.event.status === 'completed'}
        >
          {data.event.status || 'draft'}
        </span>
      </div>
      <div>
        <span class="font-semibold">Registration:</span> {data.event.registration_type || 'open'}
      </div>
    </div>

    {#if data.event.short_description}
      <div class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">Overview</h2>
        <p class="text-gray-700">{data.event.short_description}</p>
      </div>
    {/if}

    {#if data.event.description}
      <div class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">Description</h2>
        <div class="prose max-w-none">
          {data.event.description}
        </div>
      </div>
    {/if}

    {#if data.event.instructions}
      <div class="mb-6">
        <h2 class="text-2xl font-semibold mb-3">Instructions</h2>
        <div class="prose max-w-none">
          {data.event.instructions}
        </div>
      </div>
    {/if}

    <div class="mt-8 text-sm text-gray-500 border-t pt-4">
      <p>Event ID: {data.event.$id}</p>
      {#if data.event.slug}
        <p>Slug: {data.event.slug}</p>
      {/if}
      <p>Created: {new Date(data.event.$createdAt).toLocaleString()}</p>
      <p>Updated: {new Date(data.event.$updatedAt).toLocaleString()}</p>
    </div>
  </div>
</div>
