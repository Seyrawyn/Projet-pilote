<script lang="ts">
  import TrainerNavbar from './TrainerNavbar.svelte';
  import UserNavbar from './UserNavbar.svelte';
  import { isTrainer } from '$lib/stores/trainer';
</script>

{#if $isTrainer}
  <TrainerNavbar />
{:else}
  <UserNavbar />
{/if}

<slot />
