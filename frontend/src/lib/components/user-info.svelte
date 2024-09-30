<script lang="ts">
  import type { User } from '$lib/types/user';

  export let user: User;
</script>

<div class="user-data">
  <div class="user-data-inner">
    {#if user?.dateOfBirth}
      <div class="user-info">
        <strong>Age</strong>
        <span>
          {new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear()}
        </span>
      </div>
    {/if}
    {#if user?.height}
      <div class="user-info">
        <strong>Height</strong>
        <span class="user-height">{user.height}</span>
      </div>
    {/if}
    {#if user?.weight}
      <div class="user-info">
        <strong>Weight</strong>
        <span class="user-weight">{user.weight}</span>
      </div>
    {/if}
    <div class="user-info">
      <strong>Email</strong>
      <span>{user?.email}</span>
    </div>
    {#if user?.sex}
      <div class="user-info">
        <strong>Sex</strong>
        <span>{user?.sex}</span>
      </div>
    {/if}
    <hr />
    <p class="user-description">
      {user?.description ?? 'No information given.'}
    </p>
  </div>
</div>

<style>
  .user-data {
    background-color: var(--bg-2);
    border-radius: var(--box-rounded);
    padding: 1rem;
    overflow: hidden;
  }

  .user-data-inner {
    height: 100%;
    overflow-y: auto;
  }

  .user-info {
    line-height: 1.8rem;
  }

  hr {
    margin: 1rem 0;
    transition: var(--transition-delay);
  }

  .user-height::after {
    content: 'cm';
    color: var(--text-light);
    margin-left: 0.1rem;
  }

  .user-weight::after {
    content: 'kg';
    color: var(--text-light);
    margin-left: 0.1rem;
  }

  .user-description {
    white-space: pre-line;
  }
</style>
