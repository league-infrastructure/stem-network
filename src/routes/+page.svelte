<svelte:head>
  <title>Hello World</title>
</svelte:head>

<main class="hello-world">
  <h1>Hello, World!</h1>
  <p>Welcome to the minimal STEM Network app.</p>
  <a class="link" href="/events">Manage events</a>
</main>

<style>
  .hello-world {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    font-family: sans-serif;
  }

  h1 {
    margin: 0;
    font-size: 2.5rem;
  }

  p {
    margin: 0;
    font-size: 1.125rem;
    color: #555;
  }

  .link {
    color: #2563eb;
    text-decoration: none;
    font-weight: 600;
  }
</style>
