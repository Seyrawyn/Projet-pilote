<script lang="ts">
  import Modal from '$lib/components/informative-modal.svelte';
  import { HomeIcon } from 'svelte-feather-icons';

  export let href: string;
</script>

<div style="display: flex;">
  <Modal info="Home" {href}>
    <div class="nav-item">
      <span class="home"><HomeIcon /></span>
    </div>
  </Modal>
</div>

<style>
  .nav-item {
    padding: 1rem;
    color: var(--text);
    background-color: var(--bg-3);
    display: flex;
  }

  span {
    max-height: 1.5rem;
  }

  .nav-item:hover > .home {
    animation-name: wiggle;
    animation-duration: 0.9s;
  }
</style>
