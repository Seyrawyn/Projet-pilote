<script lang="ts">
  import Modal from '$lib/components/informative-modal.svelte';
  import { UserIcon } from 'svelte-feather-icons';
  import NavbarPages from './navbar-pages.svelte';
  import Settings from './navItems/settings.svelte';
  import Notification from '../notification-bell.svelte';
</script>

<div class="display-navbar">
  <NavbarPages />
  <hr />
</div>

<Notification/>

<Modal info="Profile" href="/profile">
  <div class="nav-item">
    <span class="profil">
      <UserIcon class="icon" />
    </span>
    <p>Profile</p>
  </div>
</Modal>

<Settings href="/settings" />

<hr class="display-navbar" />

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

  .display-navbar {
    display: none;
  }

  span {
    max-height: 1.5rem;
  }

  .nav-item:hover > .profil {
    animation-name: happy-dance;
    animation-duration: 0.6s;
    animation-iteration-count: infinite;
  }

  @media (max-width: 680px) {
    p {
      display: block;
      margin-left: 1rem;
    }

    .display-navbar {
      display: block;
    }
  }
</style>
