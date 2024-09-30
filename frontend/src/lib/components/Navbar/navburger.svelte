<script lang="ts">
  import { MenuIcon, XIcon } from 'svelte-feather-icons';
  import Modal from '$lib/components/informative-modal.svelte';

  let active = false;
  let heightOffset: number;
  let widthOffset: number;
</script>

<div class="navburger" style={`--heigth-offset: ${heightOffset}px`}>
  <Modal>
    <button class="nav-item" on:click={() => (active = !active)} bind:clientHeight={heightOffset}>
      {#if active}
        <XIcon />
      {:else}
        <MenuIcon />
      {/if}
    </button>
  </Modal>
  <div
    class="navburger-list"
    class:active
    bind:clientWidth={widthOffset}
    style={`--width-offset: -${widthOffset}px`}
  >
    <slot />
  </div>
</div>

<style>
  .navburger {
    display: flex;
    flex-direction: column;
    max-height: 1rem;
  }

  .navburger-list {
    background-color: var(--bg-3);
    position: absolute;
    top: var(--heigth-offset);
    right: var(--width-offset);
    /* rotate: 360deg; */ /** Pour un effet goofy*/
    opacity: 0;
    transition:
      right 0.3s ease-in-out,
      opacity 0.3s ease-in-out;
    /* rotate 0.3s ease-in-out, */ /** Pour un effet goofy*/
  }

  .active {
    top: 0;
    right: 0;
    opacity: 1;
    /* rotate: 0deg; */ /** Pour un effet goofy*/
    position: relative;
  }

  .nav-item {
    padding: 1rem;
    color: var(--text);
    display: flex;
  }

  .nav-item:hover {
    background-color: var(--blue);
  }

  button {
    border: none;
    background-color: inherit;
    margin-left: auto;
  }
</style>
