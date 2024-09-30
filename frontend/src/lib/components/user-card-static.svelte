<script lang="ts">
  import type { User } from '$lib/types/user';
  import question from '$lib/assets/question-mark.png';

  export let user: User;
</script>

<div class="user-card">
  {#if user?.img}
    <img src={user.img} alt="profile" />
  {:else}
    <img src={question} alt="profile" />
  {/if}
  <hr />
  <div class="name">{user?.name}</div>
  <div class="username">{user?.username}</div>
</div>

<style>
  .user-card {
    display: flex;
    flex-direction: column;
    border-radius: var(--box-rounded);
    background: var(--bg-2);
    padding: 1rem;
    max-height: 100%;
  }

  img {
    align-self: center;
    height: 100%;
    max-width: min(100%, 17rem);
    max-height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  hr {
    margin: 1rem 0;
    width: 100%;
  }

  .name {
    flex-shrink: 0;
    font-size: 2rem;
    font-weight: bold;
    overflow-x: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .username {
    flex-shrink: 0;
    font-size: 1.5rem;
    overflow-x: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-light);
  }
</style>
