<script lang="ts">
  import Modal from '$lib/components/informative-modal.svelte';
  import { SearchIcon } from 'svelte-feather-icons';
  import NavbarPages from './navbar-pages.svelte';
  import Settings from './navItems/settings.svelte';
</script>

<div class="display-navbar">
  <NavbarPages />
  <hr />
</div>

<Modal info="Search" href="/trainer/search">
  <div class="nav-item">
    <span class="search">
      <SearchIcon />
    </span>
    <p>Search</p>
  </div>
</Modal>

<Settings href="/trainer/settings" />

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

  .nav-item > .search {
    transform: scale(1);
    transition: transform 0.2s ease-in-out;
  }

  .nav-item:hover > .search {
    transform: scale(1.2);
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
