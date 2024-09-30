<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import FormNotification from '$lib/components/form-notification.svelte';
  import { isTrainer } from '$lib/stores/trainer';

  $: message = $page.url.searchParams.get('message') ?? '';

  export let form;
</script>

<svelte:head>
  <title>Log in</title>
</svelte:head>

<section>
  {#if message && form?.success !== false}
    <FormNotification>{message}</FormNotification>
  {/if}
  {#if form?.success === false}
    <FormNotification danger>{form?.message}</FormNotification>
  {/if}
  <div class="container">
    <h1>Log in</h1>
    <form method="POST" use:enhance>
      <input
        type="text"
        placeholder="Enter your username"
        name="username"
        value={form?.username ?? ''}
      />
      <input type="password" placeholder="Enter your password" name="password" />
      <label>
        <input type="checkbox" name="isTrainer" bind:checked={$isTrainer} />
        Log in as a trainer
      </label>
      <button type="submit">Log in</button>
      <hr />
      <span>
        Don't have an account?
        <a href="/register">Register</a>
      </span>
    </form>
  </div>
</section>

<style>
  label {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

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
    text-align: center;
  }

  form {
    display: flex;
    margin: 1.5rem 0 0 0;
    flex-direction: column;
    gap: 0.7rem;
  }

  input {
    font-size: 1.15rem;
    box-sizing: border-box;
    height: 3.125rem;
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid var(--text-light);
    background-color: inherit;
  }

  input:focus-visible {
    outline: var(--blue) solid 1px;
    border-color: var(--blue);
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
