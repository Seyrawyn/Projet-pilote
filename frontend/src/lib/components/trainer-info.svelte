<script lang="ts">
  import Item from '$lib/components/userinfo-field.svelte';
  import type { Trainer } from '$lib/types/trainer';

  export let trainer: Trainer;
</script>

<div class="row desktop">
  <div class="column">
    <Item name="Username" value={trainer?.username} />
    <!-- <Item name="Age" value={trainer?.age} /> -->
    <!-- <Item name="Height" value={trainer?.height && trainer?.height + ' cm'} /> -->
  </div>
  <div class="column">
    <Item name="Email" value={trainer?.email} />
    <!-- <Item name="Sex" value={trainer?.sex} /> -->
    <!-- <Item name="Weight" value={trainer?.weight && trainer?.weight + ' kg'} /> -->
  </div>

  <!-- <Item name="Description" value={trainer?.description} /> -->
</div>

<div class="column mobile">
  <Item name="Username" value={trainer?.username} />
  <Item name="Email" value={trainer?.email} />
  <!-- <Item name="Age" value={trainer?.age} /> -->
  <!-- <Item name="Sex" value={trainer?.sex} /> -->
  <!-- <Item name="Height" value={trainer?.height && trainer?.height + ' cm'} /> -->
  <!-- <Item name="Weight" value={trainer?.weight && trainer?.weight + ' kg'} /> -->
  <!-- <Item name="Description" value={trainer?.description && trainer.description} /> -->
</div>

<style>
  .column {
    border-radius: 0.35rem;
    background-color: var(--bg-2);
    display: flex;
    flex-flow: column wrap;
  }
  .row {
    display: flex;
    flex-flow: row wrap;
    max-width: 40rem;
    margin: 0 auto;
    padding: 1rem;
    border-radius: 6px;
    background-color: var(--bg-2);
  }

  @media (width >= 576px) {
    .mobile {
      display: none;
    }
    .column {
      margin: 0 auto;
    }
  }

  @media (max-width: 576px) {
    .desktop {
      display: none;
    }
  }
</style>
