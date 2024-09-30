<script lang="ts">
  import { enhance } from '$app/forms';
  import { activityType } from '$lib/plannedActivity/activity.js';
  import type { FrontPlannedActivity } from '$lib/types/plannedActivity';

  export let form;
  export let data;
  export let deleteMsg;
  let fPActivity: FrontPlannedActivity;

  $: ({ fPActivity } = data);  

  $: hasActivity = () => {
    return fPActivity.activity_id !== null;
  };

  // Start activity
  function startActivity() {
    document.querySelector('form').action = '/activity/geolocation';
    document.querySelector('form').submit();
  }

  // Delete dialog
  let dialog;

  function confirmDelete() {
    document.querySelector('form').action = '?/delete';
    document.querySelector('form').submit();
  }
</script>

<svelte:head>
  <title>Planned activity</title>
</svelte:head>

<h2 class="header">Planned activity</h2>

{#if $deleteMsg}
  <p>Deletion successfull. Redirecting now</p>
{/if}

<section>
  <div class="activity-info">
    {#if form?.deleted === false}
      <div class="submit-box">
        <p class="danger">{form?.message}</p>
        <a class="btn" href="/plannedActivities">Back to planned activities</a>
      </div>
    {:else if form?.deleted === true}
      <div class="submit-box">
        <h3>{form?.message}</h3>
        <a class="btn" href="/plannedActivities">See planned activities</a>
      </div>
    {:else}
      <form method="POST" action="?/save" use:enhance>
        <fieldset disabled={hasActivity()}>
            <input hidden name="id" bind:value={fPActivity.id} />
            <label for="type">Type<span class="danger">*</span></label>
            <select id="type" name="type">
            {#each activityType as type}
                {#if type === fPActivity.type}
                <option selected value={type}>{type}</option>
                {:else}
                <option value={type}>{type}</option>
                {/if}
            {/each}
            </select>

            <label for="date">Date<span class="danger">*</span></label>
            <input id="date" type="date" name="date" bind:value={fPActivity.date} />

            <label for="time">Time<span class="danger">*</span></label>
            <input id="time" type="time" name="time" step="60" bind:value={fPActivity.time} />

            <label for="duration">Duration (in minutes)<span class="danger">*</span></label>
            <input id="duration" type="number" name="duration" min="1" bind:value={fPActivity.duration} />

            <label for="name">Name</label>
            <input id="name" name="name" bind:value={fPActivity.name} />

            <label for="comment">Comment</label>
            <textarea id="comment" name="comment" bind:value={fPActivity.comment}></textarea>

            {#if form?.updated === false}
            <p class="danger">{form?.message}</p>
            {:else if form?.updated === true}
            <p class="success">{form?.message}</p>
            {/if}
            <button on:click={() => startActivity()} type="button" class=btn-start>Start activity</button>
            <div class="even-columns">
              <button type="submit">Save</button>
              <button on:click={() => dialog.showModal()} type="button" class="btn-danger">Delete</button>
            </div>
        </fieldset>
      </form>
    {/if}
  </div>
  <dialog bind:this={dialog}>
    <h1>Are you sure you want to delete this planned activity?</h1>
    <div class="dialog-buttons">
      <button on:click={confirmDelete} type="button" class="btn-danger">Confirm</button>
      <button on:click={() => dialog.close()}>Cancel</button>
    </div>
  </dialog>
</section>

<style>
  .even-columns {
    display: flex;
    justify-content: space-between;
    gap: var(--padding-xs);
  }

  fieldset,
  .submit-box {
    display: flex;
    flex-direction: column;
    gap: var(--padding-md);
    margin: auto;
    padding: var(--padding-md);
    box-shadow: var(--shadow-md);
    border-radius: 8px;
    border: none;
  }

  input,
  select,
  textarea {
    padding: var(--padding-xs);
    border-radius: 4px;
    border: 1px solid #ccc;
    font-size: var(--font-size-md);
  }

  .success,
  .danger {
    color: var(--text-success); /* Assume .danger is defined elsewhere */
  }

  button,
  .btn {
    padding: var(--padding-sm);
    width: 100%;
    background-color: var(--bg-primary-button);
    color: var(--text-button-secondary);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: var(--font-size-md);
  }

  button:hover {
    background-color: var(--bg-button-hover);
  }

  button:disabled, button:hover:disabled {
    background-color: var(--bg-empty-button);
    cursor: not-allowed;
  }

  .btn-danger {
    background-color: var(--danger);
  }

  .btn-danger:hover {
    background-color: var(--danger-darker);
  }

  .btn-danger:disabled, .btn-danger:hover:disabled {
    background-color: color-mix(in srgb, var(--danger), #9c9c9c 75%);
    cursor: not-allowed;
  }

  .btn-start {
    background-color: var(--secondary-color);
  }

  .btn-start:hover {
    background-color: color-mix(in srgb, var(--secondary-color), #000 15%);;
  }

  .dialog-buttons {
    padding-top: var(--padding-lg);
    text-align: end;
  }

  .header {
    text-align: center;
    font-family: var(--font-family);
    margin: var(--padding-md);
  }

  .danger {
    color: var(--danger);
  }

  /* Small screens */
  @media (max-width: 600px) {
    .even-columns {
      flex-direction: column;
    }

    fieldset,
    .submit-box {
      padding: var(--padding-sm);
      max-width: calc(var(--container-max-width-sm) / 2);
    }

    button, .btn {
      font-size: var(--font-size-xs);
    }
  }

  /* Medium screens */
  @media (min-width: 601px) and (max-width: 1024px) {
    fieldset,
    .submit-box {
      max-width: calc(var(--container-max-width-md) / 2);
      padding: var(--padding-md);
    }

    button, .btn {
      font-size: var(--font-size-sm);
    }
  }

  /* Large screens */
  @media (min-width: 1025px) {
    fieldset,
    .submit-box {
      max-width: calc(var(--container-max-width-lg) / 2);
      padding: var(--padding-lg);
    }

    button, .btn {
      font-size: var(--font-size-md);
    }
  }
</style>
