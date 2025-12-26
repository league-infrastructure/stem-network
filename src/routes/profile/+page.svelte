<script lang="ts">
  export let data;
</script>

<svelte:head>
  <title>Profile</title>
</svelte:head>

<div class="profile-container">
  <h1>Profile</h1>

  <div class="profile-card">
    <div class="field">
      <label>Name</label>
      <p>{data.user.name || 'Not set'}</p>
    </div>

    <div class="field">
      <label>Email</label>
      <p>{data.user.email}</p>
    </div>

    <div class="field">
      <label>Email Verified</label>
      <p>{data.user.emailVerification ? 'Yes' : 'No'}</p>
    </div>

    <div class="field">
      <label>Member Since</label>
      <p>{new Date(data.user.createdAt).toLocaleDateString()}</p>
    </div>
  </div>

  <form method="POST" action="/logout">
    <button type="submit" class="logout-btn">Logout</button>
  </form>
</div>

<style>
  .profile-container {
    max-width: 600px;
    margin: 2rem auto;
    padding: 1rem;
  }

  h1 {
    margin-bottom: 1.5rem;
  }

  .profile-card {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .field {
    margin-bottom: 1rem;
  }

  .field:last-child {
    margin-bottom: 0;
  }

  .field label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
    margin-bottom: 0.25rem;
  }

  .field p {
    margin: 0;
    font-size: 1rem;
    color: #111827;
  }

  .logout-btn {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    color: #dc2626;
    background: white;
    border: 1px solid #dc2626;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .logout-btn:hover {
    background: #fef2f2;
  }
</style>
