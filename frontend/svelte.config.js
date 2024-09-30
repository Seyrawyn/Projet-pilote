import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // adapter-node to run as a standalone node server: https://kit.svelte.dev/docs/adapter-node
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter(),
    csrf: {
      checkOrigin: false,
    },
  },
};

export default config;
