<script lang="ts">
  import { enhance } from '$app/forms';
  import { activityType, getISOFromDate, get24hFormatFromDate } from '$lib/plannedActivity/activity.js';
  
  export let form;
  const today:Date = new Date();
  const date: string = getISOFromDate(today);
  const time: string = get24hFormatFromDate(roundTimeToNextHour(today));

  function roundTimeToNextHour(date: Date): Date {
    date.setHours(date.getHours() + 1);
    date.setMinutes(0);
    return date;
  }
</script>

<svelte:head>
  <title>Create Planned Activity</title>
</svelte:head>

<body>  
  <h2 class="header">Plan a new activity</h2>
    {#if form?.submitted}
      <div class=submit-box>
        <h3>Activity planned!</h3>
        <a class="btn" href="/plannedActivities" data-sveltekit-reload>See planned activities</a>
      </div> 
    {:else}
      <form method="POST" use:enhance>
      <label for="type">Type<span class="danger">*</span></label>
      <select id="type" name="type">
        {#each activityType as type}
          <option value={type}>{type}</option>
        {/each}
        </select>

      <label for="date">Date<span class="danger">*</span></label>
      <input id="date" type="date" name="date" value="{date}"/>

      <label for="time">Time<span class="danger">*</span></label>
      <input id="time" type="time" name="time" step="60" value="{time}"/>

      <label for="duration">Duration (in minutes)<span class="danger">*</span></label>
      <input id="duration" type="number" name="duration" min="1"/>

      <label for="name">Name</label>
      <input id="name" name="name"/>

      <label for="comment">Comment</label>
      <textarea id="comment" name="comment"></textarea>
      {#if form?.success === false}
        <p class="danger">{form?.message}</p>
      {/if}
    <button type="submit">Submit</button>
  </form>
  {/if}
</body>


<style>
  form, .submit-box {
    display: flex;
    flex-direction: column;
    gap: var(--padding-md);
    margin: auto;
    padding: var(--padding-md);
    box-shadow: var(--shadow-md);
    border-radius: 8px;
  }

  label {
    font-size: var(--font-size-md);
    color: var(--text-primary);
  }

  input, select, textarea {
    padding: var(--padding-sm);
    border-radius: var(--padding-xs);
    border: var(--border);
    font-size: var(--font-size-md);
  }

  button, .btn {
    padding: var(--padding-sm);
    background-color: var(--bg-primary-button);
    color: var(--text-button-secondary);
    border: none;
    border-radius: var(--padding-xs);
    cursor: pointer;
    font-size: var(--font-size-md);
  }

  button:hover {
    background-color: var(--bg-button-hover);
    color: var(--text-button-hover);
  }

  .header {
    text-align: center;
    font-family: var(--font-family);
    margin: var(--padding-md);
  }

  /* Responsive Design */
  @media (max-width: 600px) {
    form, .submit-box {
      padding: var(--padding-sm);
      gap: var(--padding-xs);
      max-width: calc(var(--container-max-width-sm) / 2);
    }

    label, input, select, textarea, button, .btn {
      font-size: var(--font-size-sm);
    }

    .header {
      margin: var(--padding-sm);
    }
  }

  @media (min-width: 601px) and (max-width: 1024px) {
    form, .submit-box {
      padding: var(--padding-md);
      gap: var(--padding-sm);
      max-width: calc(var(--container-max-width-md) / 2);
    }

    label, input, select, textarea, button, .btn {
      font-size: var(--font-size-md);
    }

    .header {
      margin: var(--padding-md);
    }
  }

  @media (min-width: 1025px) {
    form, .submit-box {
      padding: var(--padding-lg);
      gap: var(--padding-md);
      max-width: calc(var(--container-max-width-lg) / 2);
    }

    label, input, select, textarea, button, .btn {
      font-size: var(--font-size-lg);
    }

    .header {
      margin: var(--padding-lg);
    }
  }
</style>

