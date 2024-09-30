<script lang="ts">
  import { applyAction, deserialize, enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import ThemeSwitcher from '$lib/components/theme-switcher.svelte';
  import type { ActionResult } from '@sveltejs/kit';
  import type { ActionData, PageServerData } from './$types';
  import { UserIcon } from 'svelte-feather-icons';
  import { API_URL } from '../../constants';
  import imageCompression from 'browser-image-compression';

  export let data: PageServerData;
  export let form: ActionData;

  /**Picture**/
  let picture: File | null;
  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      picture = input.files[0];
    }
  };

  let pictureResponseStatus = true;
  let pictureResponseMsg = '';

  const updatePicture = async () => {
    if (!picture) {
      pictureResponseStatus = false;
      pictureResponseMsg = 'No image uploaded';
      return;
    }

    const originalFileSize = picture.size / 1024 / 1024;

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    const formData = new FormData();
    formData.append(
      'picture',
      originalFileSize < 1 ? picture : await imageCompression(picture, options),
    );

    const res = await fetch(`${API_URL}/user/picture`, {
      method: 'PUT',
      credentials: 'include',
      body: formData,
    });

    if (res.ok) {
      pictureResponseStatus = true;
      pictureResponseMsg = 'Picture updated successfully';
      invalidateAll();
    }
  };

  const deletePicture = async () => {
    if (!data.user.img) {
      pictureResponseStatus = false;
      pictureResponseMsg = 'No image to delete';
      return;
    }
    const res = await fetch(`${API_URL}/user/picture`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (res.ok) {
      pictureResponseStatus = true;
      pictureResponseMsg = 'Picture deleted successfully';
      invalidateAll();
    }
  };

  /**Update form**/
  let deleteConfirmation: string = '';

  const submitUpdateUser = async (event: { currentTarget: EventTarget & HTMLFormElement }) => {
    const data = new FormData(event.currentTarget);

    const response = await fetch(event.currentTarget.action, {
      method: 'POST',
      body: data,
    });

    const result: ActionResult = deserialize(await response.text());

    if (result.type === 'success') {
      await invalidateAll();
    }

    applyAction(result);
  };
</script>

<svelte:head>
  <title>Settings</title>
</svelte:head>

<section>
  <h1>Settings</h1>
  <h2>Update user profile</h2>
  <div class="picture">
    {#if data.user?.img}
      <img src={API_URL + data.user?.img} alt={data.user?.username + 'image'} />
    {:else}
      <span class="user-icon"><UserIcon size="100" /> </span>
    {/if}
    <label>
      Profile Picture
      <input type="file" name="picture" accept="image/*" on:change={handleFileChange} />
    </label>
    <button on:click={() => updatePicture()}> Update Picture</button>
    <button on:click={() => deletePicture()}> Delete Picture</button>
    <p class:pictureResponseStatus>{pictureResponseMsg}</p>
  </div>
  <hr />
  <form method="POST" action="?/user" on:submit|preventDefault={submitUpdateUser}>
    <label>
      Username
      <input type="text" name="username" value={data.user.username} />
    </label>
    <label>
      Email
      <input type="email" name="email" value={data.user.email} />
    </label>
    <label>
      Name
      <input type="text" name="name" value={data.user.name} />
    </label>
    <label>
      Date Of Birth
      <input type="date" name="dateOfBirth" value={data.user.dateOfBirth} />
    </label>
    <label>
      <p>Height <span class="units">cm</span></p>
      <input type="number" step="any" name="height" value={data.user.height} />
    </label>
    <label>
      <p>Weight <span class="units">kg</span></p>
      <input type="number" step="any" name="weight" value={data.user.weight} />
    </label>
    <label>
      Sex
      <select name="sex" bind:value={data.user.sex}>
        <option value="Homme">Homme</option>
        <option value="Femme">Femme</option>
        <option value="Autre">Autre</option>
      </select>
    </label>
    <label>
      Description
      <textarea name="description" placeholder="No description" bind:value={data.user.description}
      ></textarea>
    </label>
    {#if form?.success === false}<p class="danger">{form?.message}</p>{/if}
    {#if form?.success === true}<p class="success">{form?.message}</p>{/if}
    <div>
      <button type="submit">Update</button>
    </div>
  </form>
  <hr />
  <h2>Update password</h2>
  <form method="POST" action="?/password" use:enhance>
    <label>
      Password
      <input type="password" placeholder="Enter new password" name="password" />
    </label>
    <label>
      Confirm Password
      <input type="password" placeholder="Confirm new password" name="confirm-password" />
    </label>
    {#if form?.passwordSuccess === false}<p class="danger">{form?.passwordMessage}</p>{/if}
    {#if form?.passwordSuccess === true}<p class="success">{form?.passwordMessage}</p>{/if}
    <div>
      <button type="submit">Update</button>
    </div>
  </form>
  <hr />
  <h2>Theme</h2>
  <ThemeSwitcher />
  <hr />
  <h2>Logout</h2>
  <a class="button danger" href="/logout">logout</a>
  <hr />
  <h2>Delete account</h2>
  <form method="POST" action="?/delete" use:enhance>
    <label>
      Type "Yes, I agree" to delete your account
      <input
        type="text"
        placeholder="Yes, I agree"
        name="confirmation"
        bind:value={deleteConfirmation}
      />
    </label>
    <p class="danger">This action cannot be undone</p>
    <div>
      <button
        class="button danger {deleteConfirmation.toLowerCase() === 'yes, i agree'
          ? ''
          : 'disabled'}"
        type="submit">delete account</button
      >
    </div>
  </form>
</section>

<style>
  section {
    padding: 2rem 1rem;
    max-width: 1296px;
    margin: 0 auto;
  }

  @media (width >= 576px) {
    section {
      padding: 2rem;
    }
  }

  h1 {
    font-size: 2.5rem;
    margin: 0 0 1.5rem 0;
    text-align: center;
  }

  h2 {
    margin: 0 0 1.5rem 0;
  }

  /**Profil pic**/
  img {
    border-radius: 4px;
    margin: 0 auto;
    height: 100px;
    width: 100px;
    object-fit: cover;
  }

  .picture > button {
    margin: 1rem 1rem 0 0;
  }
  .picture > p {
    margin-top: 1rem;
    color: var(--danger);
  }
  .picture > .pictureResponseStatus {
    color: var(--success);
  }
  /****/

  label {
    display: flex;
    flex-direction: column;
    font-size: 0.85rem;
    font-weight: bold;
    text-transform: uppercase;
    max-width: 30rem; /** MAYBE NOT*/
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  input {
    font-size: 1.15rem;
    line-height: 1.5;
    box-sizing: border-box;
    display: inline-flex;
    height: 3.125rem;
    width: 100%;
    max-width: 100%;
    padding: 0.5rem 0.5rem;
    border-radius: 4px;
    border: 1px solid var(--text-light);
    background-color: inherit;
  }

  select {
    width: 100%;
    font-size: 1.15rem;
    line-height: 1.5;
    width: 100%;
    height: 3.125rem;
    padding: 0.5rem 0.2rem;
    border-radius: 4px;
    border: 1px solid var(--text-light);
    background-color: inherit;
  }

  option {
    font-size: 1.15rem;
    line-height: 1.5;
    background-color: var(--bg-3);
  }

  textarea {
    padding: 0.5rem 0.5rem;
    height: 6rem;
    border-radius: 4px;
    border: 1px solid var(--text-light);
    background-color: inherit;
    font-family: 'Open Sans', sans-serif;
    resize: none;
  }

  .units {
    color: var(--text-light);
  }

  @media (width >= 576px) {
    input {
      width: 100%;
      max-width: 30rem;
    }
  }

  input:focus-visible {
    outline: var(--link) solid 1px;
    border-color: var(--link);
  }

  button,
  .button {
    display: inline-block;
    font-family: inherit;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-button);
    padding: 0.47em 1em;
    border: 1px solid transparent;
    border-radius: 4px;
    cursor: pointer;
    background-color: var(--blue);
    transition: 0.2s;
    text-decoration: none;
    box-sizing: border-box;
  }

  button:hover,
  .button:hover {
    background-color: var(--blue-darker);
  }

  .button.danger {
    background-color: var(--danger-button);
  }

  .button.danger:hover {
    background-color: var(--danger-darker);
  }

  .button.danger.disabled {
    background-color: var(--danger-darker);
    cursor: not-allowed;
  }

  hr {
    margin: 1rem 0;
    color: var(--text-light);
  }

  p {
    white-space: pre-wrap;
  }
</style>
