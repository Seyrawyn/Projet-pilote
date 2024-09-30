<script lang="ts">
  import type { PageData } from './$types';
  import UserCardStatic from '$lib/components/user-card-static.svelte';
  import UserInfo from '$lib/components/user-info.svelte';
  import UserCard from '$lib/components/user-card.svelte';

  export let data: PageData;
</script>

<svelte:head>
  <title>Profile</title>
</svelte:head>

<section>
  <h1>Profile</h1>
  <article class="profile">
    <UserCardStatic user={data.user} />
    <UserInfo user={data.user} />
  </article>
  <article>
    {#if data.user.trainer}
      <div>
        <h2>Trainer</h2>
        <div class="card-holder">
          <UserCard user={data.user.trainer} />
        </div>
      </div>
    {/if}
  </article>
</section>

<style>
  :root {
    --card-height: 25.2rem;
  }

  section {
    padding: 0rem 1.5rem 3rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  article {
    display: grid;
    grid-template-columns: 20rem 1fr;
    gap: 1rem;
  }

  h1 {
    font-size: 2.5rem;
    padding-top: 1rem;
    text-align: center;
  }

  h2 {
    font-size: 2rem;
    padding-top: 1rem;
    text-align: center;
  }

  .card-holder {
    display: flex;
    height: var(--card-height);
  }

  .profile {
    grid-template-rows: var(--card-height);
  }

  @media (width <= 712px) {
    article {
      grid-template-columns: 100%;
    }
  }
</style>
