<script>
  import { enhance } from '$app/forms';

  /** @type {import('./$types').PageData} */
  export let data;

  function formatDate(dateString) {
    if (!dateString) return 'No date set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Events</h1>
    <a 
      href="/events/new" 
      class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Create Event
    </a>
  </div>

  {#if data.error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      Error loading events: {data.error}
    </div>
  {/if}

  {#if data.events.length === 0}
    <div class="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-3 rounded">
      No events found. <a href="/events/new" class="text-blue-600 underline">Create one</a>
    </div>
  {:else}
    <div class="grid gap-4">
      {#each data.events as event (event.$id)}
        <div class="border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h2 class="text-xl font-semibold mb-2">
                <a href="/events/{event.$id}" class="text-blue-600 hover:underline">
                  {event.title}
                </a>
              </h2>
              {#if event.blurb}
                <p class="text-gray-600 mb-2">{event.blurb}</p>
              {/if}
              <div class="flex gap-4 text-sm text-gray-500">
                <span>📅 {formatDate(event.event_date)}</span>
                {#if event.start_time}
                  <span>🕐 {event.start_time}</span>
                {/if}
                {#if event.capacity}
                  <span>👥 Capacity: {event.capacity}</span>
                {/if}
                {#if event.status}
                  <span class="px-2 py-1 rounded text-xs" 
                    class:bg-green-100={event.status === 'published'}
                    class:bg-yellow-100={event.status === 'draft'}
                    class:bg-red-100={event.status === 'cancelled'}
                    class:bg-gray-100={event.status === 'completed'}
                  >
                    {event.status}
                  </span>
                {/if}
              </div>
            </div>
            <div class="flex gap-2 ml-4">
              <a 
                href="/events/{event.$id}/edit" 
                class="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
              >
                Edit
              </a>
              <form method="POST" action="?/delete" use:enhance>
                <input type="hidden" name="eventId" value={event.$id} />
                <button 
                  type="submit" 
                  class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  onclick={(e) => {
                    if (!confirm('Are you sure you want to delete this event?')) {
                      e.preventDefault();
                    }
                  }}
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
