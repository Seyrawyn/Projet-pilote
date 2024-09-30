<script lang="ts">
  // import { PageData } from './$types';
  import { getFormatDate, getFormatDuration, getFormatTime } from '$lib/plannedActivity/activity';
  import type { PlannedActivity } from '$lib/types/plannedActivity.js';
  import { CheckCircleIcon } from 'svelte-feather-icons';
  import { page } from '$app/stores';
  import { invalidateAll } from '$app/navigation';
  import { API_URL } from '../../../../../constants';

  const { userId } = $page.params;

  export let data;
  $: ({ activities } = data);

  function isCompleted(pActivity: PlannedActivity) {
    return pActivity.activity_id !== null;
  }

  async function deletePlannedActivity(selectedActivity: number) {
    const response = await fetch(`${API_URL}/trainer/plannedActivity/${userId}/` + selectedActivity, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('Failed to delete activity');
    } else {
      invalidateAll();
    }
  }
</script>

<section>
  <div class="btn-go-back">
    <a href={'/trainer/clients/'}>Go Back</a>
  </div>
  <h1>Client's planned activities</h1>
  {#each activities as activity}
    <div class="activity-card">
      <div>
        <p class="activity-date">{getFormatDate(activity.date)} - {getFormatTime(activity.date)}</p>
        <p class="activity-title">{activity.name}</p>
        {#if activity.comment}
          <p class="activity-comment">{activity.comment}</p>
        {/if}
      </div>
      <div>
        <div>
          {#if isCompleted(activity)}
            <div class="activity-done">
              <CheckCircleIcon class="icon"></CheckCircleIcon>
            </div>
          {/if}
        </div>
        <div class="column">
          <p class="activity-duration">{getFormatDuration(activity.duration)}</p>
          <!-- <button class="delete-btn" on:click={deletePlannedActivity(activity.id)}> Delete </button> -->
          <button class="delete-btn" on:click={() => activity.id !== null && deletePlannedActivity(activity.id)}> Delete </button>
        </div>
      </div>
    </div>
  {/each}
</section>

<style>
  :root {
    --card-height: 25.2rem;
  }

  section {
    padding: 1rem 1.5rem 3rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  h1 {
    /* margin: 0 auto; */
    width: 100%;
    text-align: center;
    padding: 1rem;
  }

  .column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .delete-btn {
    all: unset;
    background-color: var(--danger-button);
    color: var(--text-button);
    padding: 0.6rem;
    margin: auto 0;
    border-radius: 4px;
    transition: background-color 0.2s ease-in-out;
  }

  .delete-btn:hover {
    background-color: var(--danger-darker);
  }

  /* default style */
  :root {
    /* planning-container */
    --planning-container-margin-top: 60px;
    --planning-container-max-width: 1000px;
    --planning-container-padding: 20px;

    /* activity general */
    --activity-color: var(--text);
    --font-weight: bold;

    /* activity-card */
    --activity-card-height: 70px;
    --activity-card-margin-bottom: 0.5rem;
    --activity-card-max-height: 100px;
    --activity-card-padding-top: 20px;
    --activity-card-padding: 10px;
    --activity-card-width: 100%;

    /* activity-title */
    --activity-title-font-size: 20px;

    /* activity-date */
    --activity-date-font-size: 20px;

    /* activity-duration & activity-comment*/
    --activity-comment-color: var(--text-light);
    --activity-comment-font-size: 15px;

    /* no-activity-card */
    --no-activity-card-background-color: rgba(85, 85, 85, 0.3);
    --no-activity-card-height: auto;
    --no-activity-card-margin-bottom: 0.4rem;
    --no-activity-card-max-height: 80px;
    --no-activity-card-padding-top: 15px;
    --no-activity-card-padding: 10px;
    --no-activity-card-width: 100%;
  }

  @media (max-width: 600px) {
    /* Small screens */

    .activity-card {
      --activity-card-height: auto;
      --activity-card-margin-bottom: 0.2rem;
      --activity-card-max-height: 60px;
      --activity-card-padding-top: 10px;
      --activity-card-padding: 5px;
      --activity-card-width: 100%;
    }

    .activity-title {
      --activity-title-font-size: 12px;
    }

    .activity-date {
      --activity-date-font-size: 12px;
    }

    .activity-duration,
    .activity-comment {
      --activity-comment-font-size: 9px;
    }
  }

  @media (min-width: 601px) and (max-width: 1024px) {
    /* Medium screens */

    .activity-card {
      --activity-card-height: auto;
      --activity-card-margin-bottom: 0.4rem;
      --activity-card-max-height: 80px;
      --activity-card-padding-top: 15px;
      --activity-card-padding: 10px;
      --activity-card-width: 99%;
    }

    .activity-title {
      --activity-title-font-size: 15px;
    }

    .activity-duration,
    .activity-comment {
      --activity-comment-font-size: 12px;
    }
  }

  .activity-card {
    height: var(--activity-card-height);
    margin-bottom: var(--activity-card-margin-bottom);
    max-height: var(--activity-card-max-height);
    padding-top: var(--activity-card-padding-top);
    padding: var(--activity-card-padding);
    width: var(--activity-card-width);
    display: flex;
    justify-content: space-between;
  }

  .activity-card:nth-of-type(odd) {
    background: rgba(114, 176, 249, 0.3);
  }

  .activity-card:nth-of-type(even) {
    background: rgba(253, 99, 43, 0.3);
  }

  .activity-title {
    color: var(--activity-color);
    font-size: var(--activity-title-font-size);
    font-weight: var(--font-weight);
  }

  .activity-date {
    font-size: var(--activity-date-font-size);
    font-weight: var(--font-weight);
    margin-bottom: 0.25rem;
  }

  .activity-duration {
    color: var(--activity-comment-color);
    font-size: var(--activity-comment-font-size);
    text-align: right;
  }

  .activity-comment {
    color: var(--activity-comment-color);
    font-size: var(--activity-comment-font-size);
  }

  .activity-done {
    color: var(--primary);
    display: inline-block;
    padding-right: 10px;
  }

  .btn-go-back {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .btn-go-back > a {
    all: unset;
    background-color: var(--bg-3);
    text-align: center;
    font-size: 1.1em;
    border: none;
    border-radius: 4px;
    min-width: 8rem;
    justify-self: center;
    padding: 1rem;
    margin: 1rem;
    transition: 0.2s ease-in-out;
  }

  .btn-go-back > a:hover {
    background-color: var(--success);
    padding: 1.4rem;
  }
</style>
