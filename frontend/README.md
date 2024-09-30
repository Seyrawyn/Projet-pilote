# Frontend

## Prérequis

Avant de pouvoir développer sur le frontend il faudra que vous installez [nodejs](https://nodejs.org/en). La version LTS est suffisante.

Pour éditer le code, je vous recommande fortement VSCode (ou VSCodium) avec les extensions svelte (svelte.svelte-vscode) et eslint (dbaeumer.vscode-eslint).

Pour que eslint fonctionne dans les fichiers `.svelte`, vous devez ajouter les lignes suivantes dans votre settings.json de VSCode:

```json
"eslint.validate": [
    "javascript",
    "typescript",
    "svelte"
]
```

## Installation

Ouvrez un terminal dans le répertoire `frontend/` du projet et tapez les commandes suivantes pour installer les dépendances puis faire rouler le projet en mode développement.

```sh
npm install
npm run dev
```

## Eslint

Pour valider le style du projet avec eslint dans le terminal (ceci sera utile pour la personne qui s'occupe du pipeline) vous pouvez utiliser la commande:

```sh
npm run lint # ne devrait pas donner d'erreur ou de warnings
```

## Structure du projet

Dans le cadre de notre projet les "components" iront dans le répertoire `src/components` et les types iront dans le répertoire `src/types`. Le reste de la structure reste fidèle à la structure de base de SvelteKit. Si jamais on utilise des tests unitaires, ceux-ci iront dans un répertoire `src/test`.

## Références

- https://svelte.dev/docs/introduction
- https://kit.svelte.dev/docs/introduction

## Tutoriels

Un [tutoriel](https://learn.svelte.dev/tutorial/welcome-to-svelte) vous est offert pour Svelte et SvelteKit. Je vous recommande au moins de survoler la partie 1 (Basic Svelte) et la partie 3 (Basic SvelteKit) pour vous initier aux concepts de base du framework. Si vous avez une question, la réponse est probablement dans la documentation fournie dans la section références.

## Comment fetch?

Il existe différentes façons de procéder.

**Méthode 1 (exemple basé sur les pages admin)**

### GET au début

Supposons que vous désirez charger des données dès le début.

Vous devriez utiliser `load` pour envoyer les données en même temps que la page en envoyé. Cela permettra de réduire le nombre de requêtes que le client enverra.

`src/admin/dashboard/+page.server.ts`

```ts
// +page.server.ts
import type { PageServerLoad, RequestEvent } from './$types';
import { API_URL } from '../../../constants';
import type { Trainer } from '$lib/types/trainer';
import { redirect } from '@sveltejs/kit';

// La fonction load est effectuée dès que sa page +page.svelte est envoyée
export const load: PageServerLoad = async ({ fetch, locals }) => {
  // Il vous est possible de rediriger l'utilisateur vers une autre page au besoin.
  if (!locals.basicAuth) redirect(302, '/admin');

  // La requête faite à l'api
  const res = await fetch(`${API_URL}/admin/trainers`, {
    method: 'GET',
    headers: { Authorization: `${locals.basicAuth}` },
  });

  if (!res.ok) {
    throw new Error(`HTTP error! Status: ${await res.status}}`);
  }

  // trainers sera accessible depuis la page svelte dans l'objet data
  const trainers: Trainer[] = await res.json();
  return { trainers };
};
```

`src/admin/dashboard/+page.svelte`

```svelte
<script lang="ts">
  export let data; // Contient les trainers retourné dans le load

  $: ({ trainers } = data); // Un bind sur les trainers dans data
</script>

<!-- Affichera la liste des entraîneurs-->
<div class="list">
  <h3>Entraîneurs:</h3>
  <div class="list-content">
    {#each trainers as trainer}
      <p id="name">{trainer.username}</p>
    {/each}
  </div>
</div>
```

### Exemple simple avec DELETE

Si nous suivons l'exemple précédent que j'ai une liste de trainer et que je désire en supprimer un lorsque j'appuis sur un bouton:

`src/admin/dashboard/+page.svelte`

```svelte
<script lang="ts">
  export let data;
  $: ({ trainers } = data);

  const deleteTrainer = async (trainerId) => {
    // envoie une requête DELETE à [trainerId]/+server.ts
    await fetch(`/admin/dashboard/${trainerId}`, { method: 'DELETE' });
    return invalidateAll();
    // IMPORTANT invalidateAll() va relancer le load function pour rafraichir les données désirés, soit trainers dans notre cas
  };
</script>

<div class="list">
  <h3>Entraîneurs:</h3>
  <div class="list-content">
    {#each trainers as trainer}
      <p id="name">{trainer.username}</p>
      <button class="delete-btn" on:click={() => deleteTrainer(trainer.id)}> Supprime moi </button>
    {/each}
  </div>
</div>
```

`src/admin/dashboard/[trainerId]/+server.ts`

```ts
import { json } from '@sveltejs/kit';
import { API_URL } from '../../../../constants';
import type { Trainer } from '$lib/types/trainer';
import type { JsonBodyResponse } from '$lib/types/JsonBodyResponse';

export const DELETE = async ({ locals, params }) => {
  const { trainerId } = params; // Le paramètre définit par le nom du folder parent [trainerId]

  // La requête au backend
  const res = await fetch(`${API_URL}/admin/trainer/${trainerId}`, {
    method: 'DELETE',
    headers: { Authorization: locals.basicAuth as string },
  });

  // Ici les réponses envoyer au client.
  if (res.ok) return json({ trainerId }, { status: 200 });
  return json({ trainerId }, { status: res.status });
};
```

> Notez que si vous voulez voir le changement être effectué au niveau client après avoir supprimé, vous pouvez soit invalidate() pour renouveler des données au tous simplement retirer l'élément visuel au frontend sans re-load si votre réponse de fetch à marcher.
