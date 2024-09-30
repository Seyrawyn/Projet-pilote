<script lang="ts">
  import Modal from '$lib/components/informative-modal.svelte';
  import { SettingsIcon } from 'svelte-feather-icons';

  export let href: string;
</script>

<Modal info="Settings" {href}>
  <div class="nav-item">
    <span class="settings">
      <SettingsIcon class="icon" />
    </span>
    <p>Settings</p>
  </div>
</Modal>

<style>
  .nav-item {
    padding: 1rem;
    color: var(--text);
    background-color: var(--bg-3);
    display: flex;
  }

  p {
    display: none;
  }

  span {
    max-height: 1.5rem;
  }

  .nav-item:hover > .settings {
    animation-name: spin-me-righ-round-baby-right-round-like-a-record-baby;
    animation-duration: 0.9s;
  }

  @media (max-width: 680px) {
    p {
      display: block;
      margin-left: 1rem;
    }
  }
</style>
