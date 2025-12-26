<script lang="ts">
  export let data;
</script>

<nav>
  <a href="/">Home</a>
  {#if data.user}
    <a href="/profile">Profile ({data.user.name || data.user.email})</a>
    <form method="POST" action="/logout" style="display: inline;">
      <button type="submit">Logout</button>
    </form>
  {:else}
    <a href="/login">Login</a>
  {/if}
</nav>

<main>
  <slot />
</main>

<style>
  nav {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 1rem;
  }

  nav a {
    color: #2563eb;
    text-decoration: none;
  }

  nav a:hover {
    text-decoration: underline;
  }

  nav button {
    background: none;
    border: none;
    color: #dc2626;
    cursor: pointer;
    font-size: 1rem;
    padding: 0;
  }

  nav button:hover {
    text-decoration: underline;
  }

  main {
    padding: 0 1rem;
  }
</style>
