<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import ThemeSwitcher from '$lib/components/theme-switcher.svelte';
  import UserinfoField from '$lib/components/userinfo-field.svelte';
  import type { JsonBodyResponse } from '$lib/types/JsonBodyResponse.js';
  import type { Trainer } from '$lib/types/trainer.js';
  import type { formDataTrainer, trainerFields } from '$lib/types/trainerField.js';
  import { Trash2Icon, PlusIcon, MinusIcon, Edit2Icon, XIcon } from 'svelte-feather-icons';

  export let form: formDataTrainer;

  export let data;

  $: ({ trainers } = data);
  let currentTrainer: Trainer | null;

  /** Trainer list related**/
  const setCurrentTrainer = (trainer: Trainer) => {
    currentTrainer = currentTrainer === trainer ? null : trainer;
  };

  const deleteTrainer = async (trainerId: number | undefined) => {
    await fetch(`/admin/dashboard/${trainerId}`, { method: 'DELETE' });

    invalidateAll();
  };

  /** Infos related**/
  let editing = false;
  let editForm: HTMLFormElement;
  let dataEdited: JsonBodyResponse = {
    message: '',
    success: true,
  };

  const editTrainer = async () => {
    const formData = new FormData(editForm);
    const data = Object.fromEntries(formData);

    const res = await fetch(`/admin/dashboard/${currentTrainer?.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    dataEdited = await res.json();

    invalidateAll();
  };

  /** ADD trainer related**/
  const formData: trainerFields = {
    username: '',
    name: '',
    email: '',
    password: '',
  };
  let trainerFormFilled = false;
  const fillTemplateTrainer = () => {
    if (!trainerFormFilled) {
      formData.username = `trainer-${trainers.length}`;
      formData.name = `trainer numero ${trainers.length}`;
      formData.email = `trainer${trainers.length}@delicieux.jambon.com`;
      formData.password = '1234';
    } else {
      formData.username = '';
      formData.name = '';
      formData.email = '';
      formData.password = '';
    }
    trainerFormFilled = !trainerFormFilled;
  };
</script>

<svelte:head>
  <title>Admin-Dashboard</title>
</svelte:head>

<section>
  <div class="grid-container">
    <div class="top">
      <div></div>
      <h1>Admin Dashboard</h1>
      <!-- <div> -->
      <ThemeSwitcher />
      <!-- </div> -->
    </div>

    <div class="list">
      <h3>Entraîneurs:</h3>
      <!-- <h3>Trainers:</h3> -->
      <div class="list-content">
        {#each trainers as trainer}
          <button class="list-item" on:click={() => setCurrentTrainer(trainer)}>
            <p id="name">{trainer.username}</p>
            <button class="delete-btn" on:click={() => deleteTrainer(trainer.id)}>
              <Trash2Icon size="20" />
            </button>
          </button>
        {/each}
      </div>
    </div>

    <div class="main">
      <div class="top-section">
        <h3>Info:</h3>
        {#if currentTrainer && !editing}
          <button class="edit-btn" on:click={() => (editing = !editing)}><Edit2Icon /></button>
        {:else if editing}
          <button class="edit-btn close" on:click={() => (editing = !editing)}><XIcon /></button>
        {/if}
      </div>
      {#if !editing && currentTrainer}
        <UserinfoField name="Id" value={currentTrainer?.id} />
        <UserinfoField name="Nom d'utilisateur" value={currentTrainer?.username} />
        <UserinfoField name="Nom" value={currentTrainer?.name} />
        <UserinfoField name="Email" value={currentTrainer?.email} />
        <!-- <UserinfoField name="Username" value={currentTrainer?.username} />
        <UserinfoField name="Name" value={currentTrainer?.name} />
        <UserinfoField name="email" value={currentTrainer?.email} /> -->
      {:else if currentTrainer}
        <div class="container">
          <form method="PUT" bind:this={editForm} on:submit={editTrainer}>
            <label for="username">
              <!-- Username: -->
              Nom d'utilisateur:
              <input type="text" placeholder={currentTrainer.username} name="username" />
            </label>
            <label for="name">
              <!-- Name: -->
              Nom:
              <input type="text" placeholder={currentTrainer.name} name="name" />
            </label>
            <label for="email">
              Email:
              <input type="email" placeholder={currentTrainer.email} name="email" />
            </label>
            <label for="password">
              <!-- Password: -->
              <!-- <input type="password" placeholder="New password" name="password" /> -->
              Mot de passe:
              <input type="password" placeholder="Nouveau mot de passe" name="password" />
            </label>

            {#if dataEdited.success === false}<p class="danger">{dataEdited.message}</p>{/if}
            <button class="" type="submit">Modifier</button>
            <hr />
          </form>
        </div>
      {/if}
    </div>

    <div class="new">
      <div class="top-section">
        <h3>Ajouter entraîneur:</h3>
        <button class="add-trainer-template" class:trainerFormFilled on:click={fillTemplateTrainer}>
          {#if trainerFormFilled}
            <MinusIcon size="20" />
          {:else}
            <PlusIcon size="20" />
          {/if}
        </button>
      </div>
      <div class="container">
        <form
          method="POST"
          use:enhance
          action="?/createTrainer"
          on:submit={() => {
            if (trainerFormFilled) fillTemplateTrainer();
            trainerFormFilled = false;
          }}
        >
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            name="username"
            value={form?.username ?? formData?.username}
          />
          <input type="text" placeholder="Nom" name="name" value={form?.name ?? formData?.name} />
          <input
            type="email"
            placeholder="email@exemple.com"
            name="email"
            value={form?.email ?? formData?.email}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            name="password"
            value={formData?.password}
          />

          {#if form?.success === false}<p class="danger">{form?.message}</p>{/if}
          <button type="submit">Ajouter</button>
          <hr />
        </form>
      </div>
    </div>
  </div>
</section>

<style>
  section {
    padding: 1.5rem;
    max-width: 60rem;
    max-height: 40rem;
    margin: 0 auto;
  }

  /* TOP/TITLE section */
  .top {
    grid-area: top;
    display: inline-grid;
    grid-template-columns: 1fr 4fr 1fr;
    text-align: center;
  }

  @media (max-width: 576px) {
    .top {
      display: flex;
      flex-direction: column;
    }
  }

  h1 {
    padding: 1rem;
  }

  /* LIST TRAINER */
  .list {
    grid-area: list;
    display: flex;
    flex-wrap: column;
    flex-direction: column;
    background-color: var(--bg-3);
  }

  .list-content {
    display: flex;
    flex-wrap: column;
    flex-direction: column;
    overflow-y: auto;
    min-width: 4rem;
    height: 40rem;
  }

  .list-item {
    border: 2px solid var(--bg-3);
    border-radius: 6px;
    border-color: --var(--text);
    color: var(--text);
    padding: 1.25rem;
    display: flex;
    flex: row;
    justify-content: space-between;
    align-items: center;
    min-width: 2rem;
  }

  .list-item:hover {
    background-color: inherit;
    border-color: var(--success);
    color: var(--text);
  }

  .delete-btn {
    color: var(--text-button);
    border-color: var(--text);
    background-color: var(--danger-button);
    border-radius: 4px;
    border: none;
  }

  .delete-btn:hover {
    background-color: var(--danger-darker);
  }

  /* MAIN/INFO */
  .main {
    grid-area: main;
    background-color: var(--bg-3);
    height: auto;
  }

  /* .main::-webkit-resizer */

  .edit-btn {
    all: unset;
    border-radius: 50%;
    border-color: var(--text);
    padding: 0.3rem;
  }

  .edit-btn:hover {
    background-color: var(--success);
  }
  .edit-btn.close:hover {
    background-color: var(--danger);
  }

  /* NEW TRAINER */
  .new {
    grid-area: new;
    background-color: var(--bg-3);
  }

  .add-trainer-template {
    all: unset;
    height: 20px;
    border: 3px solid var(--text);
    border-radius: 6px;
  }

  .add-trainer-template:hover {
    background-color: var(--success);
  }
  .trainerFormFilled:hover {
    background-color: var(--danger);
  }

  /* LAYOUT */
  .grid-container {
    background-color: var(--bg-2);
    display: grid;
    grid-template-columns: 2fr 2fr 2fr;
    grid-template-rows: 0fr 1.1fr 2fr;
    grid-template-areas:
      'top  top top'
      'list main main'
      'list new new';
    gap: 2rem;
    padding: 1rem;
  }

  :global(html, body) {
    overflow: auto;
  }

  .top-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    height: 1.3rem;
  }
  @media (max-width: 700px) {
    .grid-container {
      display: flex;
      flex-direction: column;
    }

    .main {
      min-width: 0;
    }

    :global(html, body) {
      overflow: scroll;
    }
  }
  .grid-container > .list,
  .main,
  .new {
    border-radius: 6px;
    padding: 1rem;
  }

  /* OTHER */
  .container {
    max-width: 30rem;
    margin: 0 auto;
    border-radius: 0.35rem;
    background-color: inherit;
  }

  @media (width >= 576px) {
    .container {
      padding: 2rem;
    }
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
    height: 3.125rem;
    width: 100%;
    padding: 0.5rem 0.5rem;
    border-radius: 4px;
    border: 1px solid var(--text-light);
    background-color: var(--bg-2);
  }

  input:focus-visible {
    outline: var(--link) solid 1px;
    border-color: var(--link);
  }

  form > button {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-button);
    width: 100%;
    padding: 0.47em 1em;
    border: 1px solid transparent;
    border-radius: 4px;
    cursor: pointer;
    background-color: var(--blue);
    transition: 0.2s;
  }

  button:hover {
    background-color: var(--blue-darker);
  }
</style>
