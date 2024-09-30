<script lang="ts">
  import { enhance } from '$app/forms';

  export let form: { success?: boolean, message?: string } = {};

  function formatLocalDateTime() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now.getTime() - offset)).toISOString().slice(0, -1);
    return localISOTime.substring(0, 16); 
  }

  let name = '';
  let city = '';
  let type: 'Running' | 'Biking' | 'Walking' = 'Running';
  let date = formatLocalDateTime(); 
  let duration = '00:00:00';
  let distance = 0;
  let metric: 'm' | 'km' | 'mi' = 'km';
  let comment = '';

</script>

<h1>ManualForm</h1>
<p>Choose your form</p>

<a href="/activity/GPXForm"> GPX registration</a>
<a href="/activity/geolocation"> Geolocation registration </a>

<form method="POST" action="?/ajouterActiviteManuel" use:enhance>
  <label for="name">Activity Name:</label>
  <input name="name" type="text" bind:value={name}>

  <label for="city">City:</label>
  <input name="city" type="text" bind:value={city}>

  <label for="type">Type of activity:</label>
  <select name="type" bind:value={type}>
    <option value="Running">Running</option>
    <option value="Biking">Biking</option>
    <option value="Walking">Walking</option>
  </select>

  <label for="date">Date:</label>
  <input type="datetime-local" name="date" bind:value={date}>

  <label for="durationTotal">Duration:</label>
  <input id="durationTotal" type="time" name="durationTotal" step="1" bind:value={duration}>

  <label for="distanceTotal">Distance:</label>
  <input name="distanceTotal" type="number" bind:value={distance}>

  <select name="metric" bind:value={metric}>
    <option value="m">meters</option>
    <option value="km">kilometers</option>
    <option value="mi">miles</option>
  </select>

  <label for="comment">Comment:</label>
  <input name="comment" type="text" bind:value={comment}>
  
  <button class="link" type="submit">Add activity</button>
</form>

{#if form?.success === false}<p class="danger">{form?.message}</p>{/if}
