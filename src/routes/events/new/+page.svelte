<script>
  import { enhance } from '$app/forms';

  /** @type {import('./$types').ActionData} */
  export let form;
</script>

<div class="container mx-auto px-4 py-8 max-w-2xl">
  <h1 class="text-3xl font-bold mb-6">Create New Event</h1>

  {#if form?.error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      Error: {form.error}
    </div>
  {/if}

  <form method="POST" use:enhance class="space-y-4">
    <div>
      <label for="title" class="block font-medium mb-1">Title *</label>
      <input 
        type="text" 
        id="title" 
        name="title" 
        required 
        value={form?.data?.title || ''}
        class="w-full border rounded px-3 py-2"
      />
    </div>

    <div>
      <label for="slug" class="block font-medium mb-1">Slug *</label>
      <input 
        type="text" 
        id="slug" 
        name="slug" 
        required 
        value={form?.data?.slug || ''}
        class="w-full border rounded px-3 py-2"
        placeholder="event-name-2025"
      />
      <p class="text-sm text-gray-600 mt-1">URL-friendly identifier (e.g., python-workshop-2025)</p>
    </div>

    <div>
      <label for="blurb" class="block font-medium mb-1">Blurb</label>
      <input 
        type="text" 
        id="blurb" 
        name="blurb" 
        value={form?.data?.blurb || ''}
        class="w-full border rounded px-3 py-2"
        placeholder="Short one-line description"
      />
    </div>

    <div>
      <label for="short_description" class="block font-medium mb-1">Short Description</label>
      <textarea 
        id="short_description" 
        name="short_description" 
        rows="3"
        class="w-full border rounded px-3 py-2"
      >{form?.data?.short_description || ''}</textarea>
    </div>

    <div>
      <label for="description" class="block font-medium mb-1">Full Description</label>
      <textarea 
        id="description" 
        name="description" 
        rows="6"
        class="w-full border rounded px-3 py-2"
      >{form?.data?.description || ''}</textarea>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="event_date" class="block font-medium mb-1">Event Date</label>
        <input 
          type="date" 
          id="event_date" 
          name="event_date" 
          value={form?.data?.event_date || ''}
          class="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label for="capacity" class="block font-medium mb-1">Capacity</label>
        <input 
          type="number" 
          id="capacity" 
          name="capacity" 
          value={form?.data?.capacity || ''}
          class="w-full border rounded px-3 py-2"
        />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="start_time" class="block font-medium mb-1">Start Time</label>
        <input 
          type="time" 
          id="start_time" 
          name="start_time" 
          value={form?.data?.start_time || ''}
          class="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label for="end_time" class="block font-medium mb-1">End Time</label>
        <input 
          type="time" 
          id="end_time" 
          name="end_time" 
          value={form?.data?.end_time || ''}
          class="w-full border rounded px-3 py-2"
        />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="status" class="block font-medium mb-1">Status</label>
        <select 
          id="status" 
          name="status" 
          class="w-full border rounded px-3 py-2"
        >
          <option value="draft" selected={form?.data?.status === 'draft'}>Draft</option>
          <option value="published" selected={form?.data?.status === 'published'}>Published</option>
          <option value="cancelled" selected={form?.data?.status === 'cancelled'}>Cancelled</option>
          <option value="completed" selected={form?.data?.status === 'completed'}>Completed</option>
        </select>
      </div>

      <div>
        <label for="registration_type" class="block font-medium mb-1">Registration Type</label>
        <select 
          id="registration_type" 
          name="registration_type" 
          class="w-full border rounded px-3 py-2"
        >
          <option value="open" selected={form?.data?.registration_type === 'open'}>Open</option>
          <option value="waitlist" selected={form?.data?.registration_type === 'waitlist'}>Waitlist</option>
          <option value="closed" selected={form?.data?.registration_type === 'closed'}>Closed</option>
          <option value="invite_only" selected={form?.data?.registration_type === 'invite_only'}>Invite Only</option>
        </select>
      </div>
    </div>

    <div class="flex gap-4 pt-4">
      <button 
        type="submit" 
        class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Create Event
      </button>
      <a 
        href="/events" 
        class="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300"
      >
        Cancel
      </a>
    </div>
  </form>
</div>
