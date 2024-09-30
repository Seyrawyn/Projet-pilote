<script lang="ts">
  import { onDestroy } from 'svelte';
  import { mapPlannedActivityToActivity, sendDataToBackend } from '$lib/activity/geolocation/geolocation';
  import { goto } from '$app/navigation';
  import { activityType } from '$lib/plannedActivity/activity.js';

  export let form;

  // Use plannedActivity value if they are set
  let pActivityId = form?.pActivityId ?? null;
  let name = form?.name ?? '';
  let type =  form?.type ?? '';
  let comment = form?.comment ?? '';

  // Tracking related data
  const watchId: number | null = null;
  let getPositionInterval;
  let sendInterval;
  let positions: { latitude: number; longitude: number; accuracy: number; timestamp: number }[] = [];

  // Timer related data
  let time = 0;
  let isTracking = false;
  let isPaused = false;
  let timer;

  // Not needed anymore it seems
  function resetData() {
    pActivityId = null;
    name = '';
    type = '';
    comment = '';
  }
  

  async function startTracking() {
    console.log('startTracking');

    /* DO NOT RESET DATA -- This prevents linking PlannedActivity and Activity!
    ** Instead reset data when user cancel or after submit if it needs to be done
    resetData();
    */

    // Start timer
    time = 0;
    timer = setInterval(() => {
      time++;
    }, 1000);
    isTracking = true;
    isPaused = false;

    // Start geolocation
    function getCurrentPosition() {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            const timestamp = position.timestamp;
            positions.push({ latitude, longitude, accuracy, timestamp });
          },
          (error) => {
            // eslint-disable-next-line no-console
            console.error('Geolocation error:', error);
          },
          {
            enableHighAccuracy: false,
            maximumAge: 0,
            timeout: 5000,
          },
        );
      } else {
        // eslint-disable-next-line no-console
        console.error('Geolocation is not supported by this browser.');
      }

    }

    if (getPositionInterval) {
      clearInterval(getPositionInterval);
    }

    getPositionInterval = setInterval(getCurrentPosition, 5000);

    if (sendInterval) {
      clearInterval(sendInterval);
    }

    sendInterval = setInterval(async () => {
      if (positions.length > 0) {
        await sendDataToBackend(positions, 'start',name, type, comment);
        positions = [];
      }
    }, 30000);
  }

  async function pauseTracking() {
    if (timer) {
      clearInterval(timer);
      timer = null;
      isPaused = true;
    }
  }

  async function continueTracking() {
    // Resume timer
    timer = setInterval(() => {
      time++;
    }, 1000);
    isPaused = false;
  }

  async function stopTracking() {
    console.log('stopTracking');

    // Stop timer
    if (timer || isPaused) {
      clearInterval(timer);
      timer = null;
      isTracking = false;
      isPaused = false;
    }

    if (getPositionInterval) {
      clearInterval(getPositionInterval);
      getPositionInterval = null;
    }

    if (sendInterval) {
      clearInterval(sendInterval);
      sendInterval = null;
    }

  }

  async function handleSubmit() {
    const sel = document.getElementById('activity-type') as HTMLSelectElement;
    const selectedtype = sel?.options[sel.selectedIndex].value;
    const activityId = await sendDataToBackend(positions, 'end', name, selectedtype, comment);
    positions = [];

    // Map activity id to planned activity id
    if (pActivityId) {
      try {
        mapPlannedActivityToActivity(pActivityId, activityId);
      } catch (error) {
        console.log(error);
      }
    }
    goto('/activity');
  }

  async function handleCancel() {
    await sendDataToBackend(positions, 'cancel', '', '', '');
    // Not sure that resetting data is usefull, goto will do that anyways...
    positions = [];
    resetData();
    goto('/activity');
  }


  onDestroy(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
  });
</script>

<main>
  <h1>Geolocation Tracker</h1>
  <section>
    <h2>Status: {isTracking ? 'Tracking' : 'Not Tracking'}</h2>
    <div class="button-container">
      {#if !isTracking}
        <button class="start" on:click={startTracking}>Start Tracking</button>
      {:else if isPaused}
        <button class="continue" on:click={continueTracking}>Continue Tracking</button>
        <button class="stop" on:click={stopTracking}>End Tracking</button>
      {:else}
        <button class="pause" on:click={pauseTracking}>Pause Tracking</button>
        <button class="stop" on:click={stopTracking}>End Tracking</button>
      {/if}
    </div>
    <div class="timer">
      <span>Time Elapsed:</span>
      <span>{new Date(time * 1000).toISOString().substr(11, 8)}</span>
    </div>

    {#if !isTracking && time > 0}
      <form on:submit|preventDefault={handleSubmit}>
        <div class="form-group">
          <label for="activity-name">Activity Name:</label>
          <input id="activity-name" bind:value={name} required>
        </div>
        <div class="form-group">
          <label for="activity-type">Activity Type:</label>
          <select id="activity-type" name="activity-type">
            <option hidden value="">-- select an option --</option>
            {#each activityType as aType}
              {#if type === aType}
                <option selected value={aType}>{aType}</option>
              {:else}
                <option value={aType}>{aType}</option>
              {/if}
            {/each}
          </select>
        </div>
        <div class="form-group">
          <label for="comment">Comment:</label>
          <textarea id="comment" bind:value={comment}></textarea>
        </div>
        <div class="action-group">
          <button type="submit">Submit</button>
          <button type="button" on:click={handleCancel}>Cancel</button>
        </div>
      </form>
    {/if}
  </section>
</main>

<style>
    .button-container {
        display: flex;
        justify-content: space-around;
        margin-bottom: 20px;
    }

    button {
        padding: 10px;
        border: none;
        border-radius: 5px;
        font-size: 16px;
        cursor: pointer;
        color: white;
    }

    button.start {
        background-color: #4CAF50; /* green */
    }

    button.pause {
        background-color: #FF9800; /* orange */
    }

    button.continue {
        background-color: #2196F3; /* blue */
    }

    button.stop {
        background-color: #f44336; /* red */
    }

    .timer {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 20px;
        font-size: 24px;
        font-weight: bold;
        letter-spacing: 1px;
        color: #333;
    }

    .timer span {
        margin: 0 5px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        margin-bottom: 1rem;
    }

    .form-group label {
        margin-bottom: 0.5rem;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
        padding: 0.5rem;
        font-size: 1rem;
    }

    .action-group {
        display: flex;
        gap: 1rem;
    }

    .action-group button {
        padding: 0.5rem 1rem;
        font-size: 1rem;
        cursor: pointer;
    }

    .action-group button[type="submit"] {
        background-color: #4CAF50; /* Green */
        border: none;
        color: white;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        transition-duration: 0.4s;
    }

    .action-group button[type="submit"]:hover {
        background-color: #45a049;
    }

    .action-group button[type="button"] {
        background-color: #f44336; /* Red */
        border: none;
        color: white;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        transition-duration: 0.4s;
    }

    .action-group button[type="button"]:hover {
        background-color: #da190b;
    }
</style>
