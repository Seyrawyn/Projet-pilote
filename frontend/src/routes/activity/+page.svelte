<script lang="ts">
  import { enhance } from '$app/forms';
  import Map from '../../lib/components/Map.svelte';

  let isModify = true;
  let modifyButton = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let selectedActivity: any = null;

  export let form: { success?: boolean, message?: string } = {};

  export let data;
  $: activities = data.activities.userActivities;

  function shouldHideInputs() {
    return selectedActivity && selectedActivity.segments && selectedActivity.segments !== '{}' && selectedActivity.segments !== '';
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function toggleModify(activity: any): any {
    isModify = !isModify;
    modifyButton = !modifyButton;
    selectedActivity = activity;
  }

  let metric: 'm' | 'km' | 'mi' = 'km';

  // Les champs à afficher, tous sélectionnés par défaut
  const filtresSelectionnes: Record<string, boolean> = {
    City: true,
    Type: true,
    Date: true,
    Duration: true,
    Distance: true,
    Comment: true,
    Segments: true,
  };

  
</script>

<h1>Activity</h1>
<p>Choose your form</p>

<a href="/activity/GPXForm"> GPX registration </a>
<a href="/activity/ManualForm"> Manual registration </a>
<a href="/activity/geolocation"> Geolocation registration </a>

<fieldset>
  <legend>Choose fields to display</legend>
  {#each Object.keys(filtresSelectionnes) as field}
    <label>
      <input type="checkbox" bind:checked={filtresSelectionnes[field]}>
      {field.charAt(0).toUpperCase() + field.slice(1)} 
    </label>
  {/each}
</fieldset>

{#if activities.length > 0}
  <h2>My activities</h2>
  {#each activities as activity}
    <div class="activity">
      <h3>{activity.name}</h3>
      {#if filtresSelectionnes.City && activity.city}
        <p>City: {activity.city}</p>
      {/if}
      {#if filtresSelectionnes.Type && activity.type}
        <p>Type: {activity.type}</p>
      {/if}
      {#if filtresSelectionnes.Date && activity.date}
        <p>Date: {activity.date}</p>
      {/if}
      {#if filtresSelectionnes.Duration && activity.durationTotal}
        <p>Duration: {activity.durationTotal}</p>
      {/if}
      {#if filtresSelectionnes.Distance && activity.distanceTotal}
        <p>Distance: {activity.distanceTotal} {metric}</p>
      {/if}
      {#if filtresSelectionnes.Comment && activity.comment}
        <p>Comment: {activity.comment}</p>
      {/if}
      {#if filtresSelectionnes.Segments && activity.segments !== '{}'}
        <p>Segments: {activity.segments}</p>
        <Map id="map_{activity.id}" segments={activity.segments} />
      {/if}

      <div class="options">
        {#if selectedActivity && selectedActivity.id === activity.id}
          <form method="POST" action="?/modifierActivite" use:enhance>
              <input name="activityId" type="number" value="{selectedActivity.id}" readonly hidden>
              <input class:isModify name="name" type="text" value="{selectedActivity.name}">
              <input class:isModify name="city" type="text" value="{selectedActivity.city}" readonly={shouldHideInputs()} hidden={shouldHideInputs()}>
              <select class:isModify name="type" value="{selectedActivity.type}">
                <option value="Running">Running</option>
                <option value="Biking">Biking</option>
                <option value="Walking">Walking</option>
              </select>
              <input class:isModify name="date" type="datetime-local" value={selectedActivity.date} readonly={shouldHideInputs()} hidden={shouldHideInputs()}>
              <input class:isModify name="durationTotal" type="time" step="1" value={selectedActivity.durationTotal} readonly={shouldHideInputs()} hidden={shouldHideInputs()}>
              <input class:isModify name="distanceTotal" type="number" value="{selectedActivity.distanceTotal}" readonly={shouldHideInputs()} hidden={shouldHideInputs()}>
              <select class:isModify name="metric" bind:value={metric} disabled={shouldHideInputs()} hidden={shouldHideInputs()}>
                <option value="m">meters</option>
                <option value="km">kilometers</option>
                <option value="mi">miles</option>
              </select>
              <input name="segments" type="any" value="{selectedActivity.segments}" readonly hidden>
              <input class:isModify name="comment" type="text" value="{selectedActivity.comment}">
              <button class:isModify type="submit">Submit changes</button>
          </form>
          <button class:isModify on:click={() => toggleModify(activity)}>Cancel</button>
        {/if}
        <button class:modifyButton on:click={() => toggleModify(activity)}>Modify</button>
        <form method="POST" action="?/supprimerActivite" use:enhance>
          <input type="hidden" name="activityId" value="{activity.id}" readonly>
          <button class:modifyButton type="submit" >Delete</button>
        </form>
      </div>
      {#if form?.success === false && selectedActivity && selectedActivity.id === activity.id}<p class="danger" class:isModify>{form?.message}</p>{/if}
    </div>
  {/each}
{:else}
  <p>No activities registered at the moment</p>
{/if}

<style>
  .options {
    display: flex;
  }

  .options button {
    margin-right: 10px;
    padding: 5px 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  .isModify {
    display: none;
  }

  .modifyButton {
    display: none;
  }
</style>
