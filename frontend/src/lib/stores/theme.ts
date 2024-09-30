import { Theme } from '$lib/types/theme';
import { writable } from 'svelte/store';

export const theme = writable<Theme>(Theme.System);
