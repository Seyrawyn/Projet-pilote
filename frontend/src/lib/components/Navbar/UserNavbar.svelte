<script lang="ts">
  import NavbarItems from './user-navbar-items.svelte';
  import Navburger from './navburger.svelte';
  import NavbarPages from './navbar-pages.svelte';
  import Home from './navItems/home.svelte';
</script>

<div class="navbar">
  <Home href="/" />

  <div class="pages-icon">
    <NavbarPages />
  </div>

  <div class="pages-icon">
    <NavbarItems />
  </div>
  <div class="nav-burger">
    <Navburger>
      <NavbarItems />
    </Navburger>
  </div>
</div>

<slot />

<style>
  .navbar {
    background-color: var(--bg-3);
    display: flex;
    justify-content: space-between;
    width: 100%;
    position: -webkit-sticky; /* Safari */
    position: sticky;
    top: 0;
    height: 3.7rem;
  }

  .pages-icon {
    display: flex;
  }

  .nav-burger {
    display: none;
  }

  @media (max-width: 680px) {
    .navbar {
      height: auto;
    }

    .pages-icon {
      display: none;
    }

    .nav-burger {
      display: block;
    }
  }
</style>
