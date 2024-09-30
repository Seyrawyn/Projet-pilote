<script lang="ts">
  import { page } from '$app/stores';

  export let href = '#';
  export let info = '';
</script>

<a {href} class:active={$page.url.pathname === href}>
  <slot />
  {#if info}
    <div class="modal">{info}</div>
  {/if}
</a>

<style>
  .modal {
    position: absolute;
    color: var(--text);
    background-color: var(--bg-2);
    border-radius: 0.2rem;
    padding: 0.3rem;
    display: none;
  }

  .active {
    filter: invert(100%);
  }

  .active:hover {
    background-color: var(--bg-3);
  }

  .active:hover > .modal {
    visibility: hidden;
  }
  a {
    background-color: var(--bg-3);
  }

  a:link {
    text-decoration: none;
    color: var(--text);
  }

  a:hover > .modal {
    top: 4rem;
    display: block;
    background-color: var(--bg-2);
    filter: invert(100%);
  }

  @media (width >= 680px) {
    a:hover {
      background-color: var(--blue);
    }
  }

  @media (max-width: 680px) {
    .modal {
      display: none;
      visibility: hidden;
    }
  }
</style>
