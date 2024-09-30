<script lang="ts">
  import Modal from '$lib/components/informative-modal.svelte';
  import { ActivityIcon, UserIcon, ListIcon, BarChartIcon } from 'svelte-feather-icons';
  import { isTrainer } from '$lib/stores/trainer';
</script>

{#if $isTrainer}
  <Modal href="/trainer/clients">
    <div class="nav-item">
      <span class="clients"><UserIcon /></span>
      <UserIcon />
      <p>Clients</p>
    </div>
  </Modal>
{:else}
  <Modal href="/activity">
    <div class="nav-item">
      <span class="activity"><ActivityIcon /></span>
      <p>Activities</p>
    </div>
  </Modal>
  <Modal href="/plannedActivities">
    <div class="nav-item">
      <span class="plannedActivities"><ListIcon /></span>
      <p>Planned Activities</p>
    </div>
  </Modal>
  <Modal href="/statistics">
    <div class="nav-item">
      <span class="stats"><BarChartIcon /></span>
      <p>Statistics</p>
    </div>
  </Modal>
{/if}

<style>
  .nav-item {
    padding: 1rem;
    color: var(--text);
    background-color: var(--bg-3);
    display: flex;
  }

  p {
    position: relative;
    margin-left: 1rem;
  }

  span {
    max-height: 1.5rem;
  }

  .nav-item:hover > .activity {
    animation-name: pulse;
    animation-duration: 0.9s;
    animation-iteration-count: infinite;
  }

  .nav-item:hover > .plannedActivities {
    animation-name: horizontal-wiggle;
    animation-duration: 0.4s;
  }

  .nav-item:hover > .stats {
    transform: translate();
    animation-name: vertical-wiggle;
    animation-duration: 0.4s;
  }

  .nav-item > .clients {
    position: absolute;
    transform: translateX(0px);
    transition: transform 0.2s ease-in-out;
  }

  .nav-item:hover > .clients {
    transform: translateX(-10px);
  }
</style>
