<script lang="ts">
  import { theme } from '$lib/stores/theme';
  import { SunIcon, MoonIcon, BoxIcon } from 'svelte-feather-icons';
  import { Theme } from '$lib/types/theme';

  const themeValues = Object.values(Theme);
  let index = themeValues.indexOf($theme);
  const toggleTheme = () => {
    index = (index + 1) % themeValues.length;
    $theme = themeValues[index];
    document.cookie = `theme=${$theme}; path=/; SameSite=Lax`;
  };
</script>

<button on:click={toggleTheme}>
  {#if $theme === Theme.System}
    Automatic
    <BoxIcon />
  {:else if $theme === Theme.Dark}
    Dark
    <MoonIcon />
  {:else if $theme === Theme.Light}
    Light
    <SunIcon />
  {/if}
</button>

<style>
  button {
    font-family: inherit;
    font-size: 1.25rem;
    color: var(--text-button);
    border: 1px solid transparent;
    border-radius: 4px;
    background-color: var(--blue);
    align-self: center;
    padding: 0.47em 1em;
    border: none;
    display: flex;
    flex-wrap: wrap column;
    gap: 0.5em;
    align-items: center;
  }
</style>
