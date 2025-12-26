<script lang="ts">
  import type { ActionData } from './$types';
  import { enhance } from '$app/forms';
  import { EVENT_STATUSES, EVENT_STATUS_SET } from '$lib/constants/event-statuses';
  import type { EventStatus } from '$lib/constants/event-statuses';

  export let form: ActionData;

  const statusOptions = EVENT_STATUSES;

  const resolveStatus = (value: string | null | undefined): EventStatus =>
    value && EVENT_STATUS_SET.has(value as EventStatus)
      ? (value as EventStatus)
      : 'draft';

  let title = form?.values?.title ?? '';
  let status: EventStatus = resolveStatus(form?.values?.status);
  let eventDate = form?.values?.event_date ?? '';
  let startTime = form?.values?.start_time ?? '';
  let endTime = form?.values?.end_time ?? '';
  let capacity = form?.values?.capacity ?? '';
  let blurb = form?.values?.blurb ?? '';
  let description = form?.values?.description ?? '';

  let lastForm = form;

  $: if (form !== lastForm) {
    title = form?.values?.title ?? '';
    status = resolveStatus(form?.values?.status);
    eventDate = form?.values?.event_date ?? '';
    startTime = form?.values?.start_time ?? '';
    endTime = form?.values?.end_time ?? '';
    capacity = form?.values?.capacity ?? '';
    blurb = form?.values?.blurb ?? '';
    description = form?.values?.description ?? '';
    lastForm = form;
  }

  function toLocalDateString(date: Date) {
    const offsetMinutes = date.getTimezoneOffset();
    const adjusted = new Date(date.getTime() - offsetMinutes * 60_000);
    return adjusted.toISOString().slice(0, 10);
  }

  function applyExampleValues() {
    title = 'Intro to Robotics Workshop';
    status = 'published';
    eventDate = toLocalDateString(new Date());
    startTime = '10:00';
    endTime = '12:00';
    capacity = '25';
    blurb = 'Build and program simple robots in a two-hour session.';
    description =
      'Students collaborate in small teams to assemble robots, learn basic programming, and present their projects.';
  }
</script>

<svelte:head>
  <title>Create Event</title>
</svelte:head>

<main class="new-event">
  <h1>Create Event</h1>

  {#if form?.error}
    <p class="error">{form.error}</p>
  {/if}

  <form method="post" use:enhance>
    <div class="helper">
      <button type="button" class="secondary" on:click={applyExampleValues}>
        Fill with Example Data
      </button>
    </div>

    <label>
      <span>Title</span>
      <input name="title" type="text" required bind:value={title} />
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
      <input name="event_date" type="date" bind:value={eventDate} />
    </label>

    <label>
      <span>Start Time</span>
      <input name="start_time" type="time" bind:value={startTime} />
    </label>

    <label>
      <span>End Time</span>
      <input name="end_time" type="time" bind:value={endTime} />
    </label>

    <label>
      <span>Capacity</span>
      <input name="capacity" type="number" min="0" bind:value={capacity} />
    </label>

    <label>
      <span>Blurb</span>
      <textarea name="blurb" rows="3" bind:value={blurb}></textarea>
    </label>

    <label>
      <span>Description</span>
      <textarea name="description" rows="6" bind:value={description}></textarea>
    </label>

    <div class="actions">
      <a class="link" href="/events">Cancel</a>
      <button type="submit">Create Event</button>
    </div>
  </form>
</main>

<style>
  .new-event {
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

  .helper {
    display: flex;
    justify-content: flex-end;
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

  .secondary {
    background: transparent;
    color: #2563eb;
    border: 1px solid #2563eb;
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
