<script lang="ts">
  import type { LayoutServerData } from './$types';
  import { Theme } from '$lib/types/theme';
  import { theme } from '$lib/stores/theme';
  import Navbar from '$lib/components/Navbar/navbar.svelte';
  import { page } from '$app/stores';
  import { isTrainer } from '$lib/stores/trainer';

  export let data: LayoutServerData;

  theme.set(data.theme);
  const noNavPage = ['/login', '/register', '/admin', '/admin/dashboard'];
  isTrainer.set(data.isTrainer);
</script>

<svelte:head>
  <meta name="color-scheme" content={$theme === Theme.System ? 'light dark' : $theme} />
  <link rel="stylesheet" href={`/themes/${$theme}.css`} />
</svelte:head>

{#if !noNavPage.find((url) => url === $page.url.pathname)}
  <Navbar />
{/if}

<slot />
