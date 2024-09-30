<script lang="ts">
import ThemeSwitcher from '$lib/components/theme-switcher.svelte';
</script>

<svelte:head>
  <title>Settings</title>
</svelte:head>

<section>
  <h1>Settings</h1>
 

  <h2>Theme</h2>
  <ThemeSwitcher />
  <hr />
  <h2>Logout</h2>
  <a class="button danger" href="/logout">logout</a>
  <hr />
</section>

<style>
  section {
    padding: 2rem 1rem;
    max-width: 1296px;
    margin: 0 auto;
  }

  @media (width >= 576px) {
    section {
      padding: 2rem;
    }
  }

  h1 {
    font-size: 2.5rem;
    margin: 0 0 1.5rem 0;
    text-align: center;
  }

  h2 {
    margin: 0 0 1.5rem 0;
  }

  .button {
    display: inline-block;
    font-family: inherit;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-button);
    padding: 0.47em 1em;
    border: 1px solid transparent;
    border-radius: 4px;
    cursor: pointer;
    background-color: var(--blue);
    transition: 0.2s;
    text-decoration: none;
    box-sizing: border-box;
  }

  .button.danger {
    background-color: var(--danger-button);
  }

  .button.danger:hover {
    background-color: var(--danger-darker);
  }

  hr {
    margin: 1rem 0;
    color: var(--text-light);
  }
</style>
