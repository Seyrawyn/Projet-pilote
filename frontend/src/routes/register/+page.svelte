<script lang="ts">
  import { enhance } from '$app/forms';
  import type { formDataRegister } from '$lib/types/registerForm.js';
  import type { registerFields } from '$lib/types/registerForm.js';
  import {
    dateOfBirthValidation,
    emailValidation,
    passwordValidation,
  } from '$lib/utils/userValidation';
  // import { error } from '@sveltejs/kit';
  export let form: formDataRegister;

  let username = form?.username ?? '';
  let email = form?.email ?? '';
  let password = '';
  let lastname = form?.lastname ?? '';
  let firstname = form?.firstname ?? '';
  let dateOfBirth: Date | string | null = form?.dateOfBirth ?? null;

  let errors: registerFields = {};

  const validateForm = () => {
    errors = {};

    if (!username.trim()) errors.username = 'Username is required.';

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Email address is not valid.';
    }

    if (!password.trim()) errors.password = 'Password is required.';

    if (!lastname.trim()) errors.lastname = 'Last name is required.';

    if (!firstname.trim()) errors.firstname = 'First name is required.';

    if (!dateOfBirth) errors.dateOfBirth = 'Date of birth is required.';

    return Object.keys(errors).length === 0;
  };

  const handleEmailChange = (event: Event) => {
    event.preventDefault();
    errors.email = emailValidation(email);
  };

  const handlePasswordChange = (event: Event) => {
    event.preventDefault();
    errors.password = passwordValidation(password);
  };

  const handleDateChange = (event: Event) => {
    event.preventDefault();
    if (!dateOfBirth) return (errors.dateOfBirth = undefined);
    else errors.dateOfBirth = dateOfBirthValidation(dateOfBirth);
  };

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    if (!validateForm()) return;
  };
</script>

<svelte:head>
  <title>Register</title>
</svelte:head>

<section>
  <form class="container" method="POST" action="?/register" on:submit={handleSubmit} use:enhance>
    <h1>Register</h1>
    <label>
      Username
      <input type="text" name="username" bind:value={username} />
      {#if errors.username}<p>{errors.username}</p>{/if}
    </label>

    <label>
      Email
      <input type="email" name="email" bind:value={email} on:change={handleEmailChange} />
      {#if errors.email}<p>{errors.email}</p>{/if}
    </label>

    <label>
      Password
      <input
        type="password"
        name="password"
        bind:value={password}
        on:change={handlePasswordChange}
      />
      {#if errors.password}<p>{errors.password}</p>{/if}
    </label>

    <label>
      Last Name
      <input type="text" name="lastname" bind:value={lastname} />
      {#if errors.lastname}<p>{errors.lastname}</p>{/if}
    </label>

    <label>
      First Name
      <input type="text" name="firstname" bind:value={firstname} />
      {#if errors.firstname}<p>{errors.firstname}</p>{/if}
    </label>

    <label>
      Date of Birth
      <input type="date" name="dateOfBirth" bind:value={dateOfBirth} on:change={handleDateChange} />
      {#if errors.dateOfBirth}<p>{errors.dateOfBirth}</p>{/if}
    </label>

    {#if form?.success === false}<p>{form?.message}</p>{/if}
    <button type="submit">Sign up</button>
    <a href="/login">Login</a>
  </form>
</section>

<style>
  section {
    padding: 3rem 1.5rem;
  }

  h1 {
    font-size: 2rem;
    text-align: center;
  }

  .container {
    padding: 1rem;
    max-width: 30rem;
    margin: 0 auto;
    border-radius: 0.35rem;
    background-color: var(--bg-2);
  }

  @media (width >= 500px) {
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
    display: inline-flex;
    height: 3.125rem;
    width: 100%;
    max-width: 100%;
    padding: 0.5rem 0.5rem;
    border-radius: 4px;
    border: 1px solid var(--text-light);
    background-color: inherit;
  }

  input:focus-visible {
    outline: var(--link) solid 1px;
    border-color: var(--link);
  }

  button {
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

  p {
    color: var(--danger);
    white-space: pre-wrap;
  }
</style>
