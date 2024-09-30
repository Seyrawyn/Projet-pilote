<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  onMount(async () => {
    goto('/plannedActivities'); // Redirige vers plannedActivities si login réussi 
  });

</script>

<svelte:head>
  <title>Home</title>
</svelte:head>
