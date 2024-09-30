<script lang="ts">
  import { enhance } from '$app/forms';

  export let form;
</script>

<svelte:head>
  <title>Admin</title>
</svelte:head>

<section>
  <div class="container">
    <h1>Admin</h1>
    <form method="POST" use:enhance>
      <input
        type="text"
        placeholder="Enter your username"
        name="username"
        value={form?.username ?? ''}
      />
      <input type="password" placeholder="Enter your password" name="password" />

      {#if form?.success === false}<p class="danger">{form?.message}</p>{/if}
      <button class="link" type="submit">Log in</button>
      <hr />
    </form>
  </div>
</section>

<style>
  section {
    padding: 3rem 1.5rem;
  }

  .container {
    padding: 1rem;
    max-width: 30rem;
    margin: 0 auto;
    border-radius: 0.35rem;
    background-color: var(--bg-2);
  }

  @media (width >= 576px) {
    .container {
      padding: 2rem;
    }
  }

  h1 {
    font-size: 2.5rem;
    margin: 0 0 1.5rem 0;
    text-align: center;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  input {
    font-size: 1.15rem;
    line-height: 1.5;
    box-sizing: border-box;
    display: inline-flex;
    height: 3.125rem;
    width: 100%;
    max-width: 100%;
    padding: 0.5rem 0.5rem;
    border-radius: 4px;
    border: 1px solid var(--text-light);
    background-color: inherit;
  }

  input:focus-visible {
    outline: var(--link) solid 1px;
    border-color: var(--link);
  }

  button {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-button);
    width: 100%;
    padding: 0.47em 1em;
    border: 1px solid transparent;
    border-radius: 4px;
    cursor: pointer;
    background-color: var(--blue);
    transition: 0.2s;
  }

  button:hover {
    background-color: var(--blue-darker);
  }

  hr {
    color: var(--text-light);
  }
</style>
