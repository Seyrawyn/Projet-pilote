<script lang="ts">
  import { enhance } from '$app/forms';

  export let form: { success?: boolean, message?: string } = {};


  let name = '';
  let type: 'Running' | 'Biking' | 'Walking' = 'Running';
  let fichierGPX: FileList  | null = null;
  let comment = '';

</script>

<h1>GPXForm</h1>
<p>Choose your form</p>

<a href="/activity/ManualForm"> Manual registration </a>
<a href="/activity/geolocation"> Geolocation registration </a>

<form method="POST" action="?/ajouterActiviteGPX" use:enhance enctype="multipart/form-data">
  <label for="name">Activity Name:</label>
  <input name="name" type="text" bind:value={name} required>

  <label for="type">Type of activity:</label>
  <select name="type" bind:value={type} required>
      <option value="Running">Running</option>
      <option value="Biking">Biking</option>
      <option value="Walking">Walking</option>
  </select>

  <label for="segments">GPX file:</label>
  <input name="segments" type="file" accept=".gpx" bind:files={fichierGPX} required>

  <label for="comment">Comment:</label>
  <textarea name="comment" bind:value={comment} required></textarea>

  <button class="link" type="submit">Add activity</button>
</form>

{#if form?.success === false}<p class="danger">{form?.message}</p>{/if}
