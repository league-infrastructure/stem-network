<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<svelte:head>
  <title>{data.event.title}</title>
</svelte:head>

<main class="event-detail">
  <header>
    <div>
      <h1>{data.event.title}</h1>
      <p class="status">Status: {data.event.status}</p>
      <p>
        {#if data.event.eventDate}
          Date: {data.event.eventDate}
        {:else}
          Date: To be announced
        {/if}
      </p>
    </div>
    <a class="btn" href={`/events/${data.event.id}/edit`}>Edit</a>
  </header>

  {#if data.event.blurb}
    <p class="blurb">{data.event.blurb}</p>
  {/if}

  {#if data.event.description}
    <section>
      <h2>Details</h2>
      <p>{data.event.description}</p>
    </section>
  {/if}

  <section class="meta">
    <h2>Meta</h2>
    <ul>
      <li>Created: {new Date(data.event.createdAt).toLocaleString()}</li>
      <li>Updated: {new Date(data.event.updatedAt).toLocaleString()}</li>
      {#if data.event.startTime}
        <li>Start: {data.event.startTime}</li>
      {/if}
      {#if data.event.endTime}
        <li>End: {data.event.endTime}</li>
      {/if}
      {#if data.event.capacity}
        <li>Capacity: {data.event.capacity}</li>
      {/if}
    </ul>
  </section>
</main>

<style>
  .event-detail {
    max-width: 720px;
    margin: 2rem auto;
    padding: 0 1.5rem;
    font-family: system-ui, sans-serif;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1.5rem;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    background: #2563eb;
    color: #fff;
    text-decoration: none;
    font-weight: 600;
  }

  .status {
    margin: 0.5rem 0 0;
    font-weight: 600;
    color: #2563eb;
  }

  .blurb {
    font-size: 1.125rem;
    line-height: 1.6;
  }

  section {
    background: #fff;
    padding: 1.5rem;
    border-radius: 0.75rem;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  }

  .meta ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 0.5rem;
  }
</style>
