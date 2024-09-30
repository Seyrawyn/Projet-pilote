<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  onMount(() => {
    const next = $page.route.id as string;
    if ($page.status === 401) {
      goto(
        `/login?next=${encodeURIComponent(next)}&message=${encodeURIComponent('Your session has expired')}`,
      );
    }
  });
</script>

<div class="container">
  <p class="statusCode">{$page.status}</p>
  <h1>{$page.error?.message}</h1>
  <a href="/" class="link">Back to Home</a>
</div>

<style>
  h1 {
    text-align: center;
  }

  .statusCode {
    line-height: 90px;
    font-size: 100px;
    color: #007bff;
  }
  .container {
    width: 100%;
    position: fixed;
    /* center horizontally */
    top: 50%;
    transform: translate(0, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }

  .link {
    /* Remove underline */
    text-decoration: none;
    display: inline-block;
    padding: 10px 20px;
    border-radius: 5px;
    background-color: #007bff;
    color: white;
    margin-top: 15px;
  }

  .link:hover {
    background-color: #0056b3;
  }
</style>
