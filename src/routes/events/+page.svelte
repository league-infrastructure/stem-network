<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<svelte:head>
  <title>Events</title>
</svelte:head>

<main class="events">
  <header>
    <h1>Events</h1>
    <a class="btn" href="/events/new">Create Event</a>
  </header>

  {#if data.events.length === 0}
    <p>No events found. Create your first event to get started.</p>
  {:else}
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Status</th>
          <th>Date</th>
          <th>Created</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each data.events as event}
          <tr>
            <td>
              <a href={`/events/${event.id}`}>{event.title}</a>
            </td>
            <td>{event.status}</td>
            <td>{event.eventDate ?? 'TBD'}</td>
            <td>{new Date(event.createdAt).toLocaleDateString()}</td>
            <td>
              <div class="actions">
                <a class="link" href={`/events/${event.id}/edit`}>Edit</a>
                <form method="post" action="?/delete">
                  <input type="hidden" name="eventId" value={event.id} />
                  <button class="link destructive" type="submit">
                    Delete
                  </button>
                </form>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</main>

<style>
  .events {
    max-width: 960px;
    margin: 2rem auto;
    padding: 0 1.5rem;
    font-family: system-ui, sans-serif;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
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

  table {
    width: 100%;
    border-collapse: collapse;
    background: #fff;
    border-radius: 0.75rem;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  }

  th,
  td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .link {
    background: none;
    border: none;
    color: #2563eb;
    text-decoration: none;
    cursor: pointer;
    font-weight: 600;
    padding: 0;
  }

  .link.destructive {
    color: #dc2626;
  }

  form {
    margin: 0;
  }
</style>
