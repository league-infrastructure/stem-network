<script lang="ts">
  import type { ActionData, PageData } from './$types';
  import { enhance } from '$app/forms';
  import { EVENT_STATUSES, EVENT_STATUS_SET } from '$lib/constants/event-statuses';
  import type { EventStatus } from '$lib/constants/event-statuses';

  export let data: PageData;
  export let form: ActionData;

  const statusOptions = EVENT_STATUSES;

  const resolveStatus = (value: string | null | undefined): EventStatus =>
    value && EVENT_STATUS_SET.has(value as EventStatus)
      ? (value as EventStatus)
      : 'draft';

  let status: EventStatus = resolveStatus(form?.values?.status ?? data.event.status);
  let lastForm = form;

  $: if (form !== lastForm) {
    status = resolveStatus(form?.values?.status ?? data.event.status);
    lastForm = form;
  }
</script>

<svelte:head>
  <title>Edit {data.event.title}</title>
</svelte:head>

<main class="edit-event">
  <h1>Edit Event</h1>

  {#if form?.error}
    <p class="error">{form.error}</p>
  {/if}

  <form method="post" use:enhance>
    <label>
      <span>Title</span>
      <input name="title" type="text" required value={form?.values?.title ?? data.event.title} />
    </label>

    <label>
      <span>Status</span>
      <select name="status" bind:value={status} required>
        {#each statusOptions as option}
          <option value={option}>{option}</option>
        {/each}
      </select>
    </label>

    <label>
      <span>Event Date</span>
      <input name="event_date" type="date" value={form?.values?.event_date ?? data.event.eventDate} />
    </label>

    <label>
      <span>Start Time</span>
      <input name="start_time" type="time" value={form?.values?.start_time ?? data.event.startTime} />
    </label>

    <label>
      <span>End Time</span>
      <input name="end_time" type="time" value={form?.values?.end_time ?? data.event.endTime} />
    </label>

    <label>
      <span>Capacity</span>
      <input
        name="capacity"
        type="number"
        min="0"
        value={form?.values?.capacity ?? data.event.capacity}
      />
    </label>

    <label>
      <span>Blurb</span>
      <textarea name="blurb" rows="3">{form?.values?.blurb ?? data.event.blurb}</textarea>
    </label>

    <label>
      <span>Description</span>
      <textarea name="description" rows="6">{form?.values?.description ?? data.event.description}</textarea>
    </label>

    <div class="actions">
      <a class="link" href={`/events/${data.event.id}`}>Cancel</a>
      <button type="submit">Save Changes</button>
    </div>
  </form>
</main>

<style>
  .edit-event {
    max-width: 720px;
    margin: 2rem auto;
    padding: 0 1.5rem;
    font-family: system-ui, sans-serif;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  form {
    display: grid;
    gap: 1.25rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  input,
  select,
  textarea {
    border: 1px solid #cbd5f5;
    border-radius: 0.5rem;
    padding: 0.6rem 0.75rem;
    font-size: 1rem;
    font-family: inherit;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    align-items: center;
  }

  button {
    background: #2563eb;
    color: #fff;
    border: none;
    border-radius: 0.5rem;
    padding: 0.6rem 1.4rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
  }

  .link {
    text-decoration: none;
    color: #2563eb;
    font-weight: 600;
  }

  .error {
    color: #dc2626;
    font-weight: 600;
  }
</style>
