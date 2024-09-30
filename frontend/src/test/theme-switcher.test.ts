import ThemeSwitcher from '$lib/components/theme-switcher.svelte';
import { render } from '@testing-library/svelte';
import { describe, test } from 'vitest';

describe('ThemeSwitcher', () => {
  test('Shows the ThemeSwitcher is rendered', () => {
    render(ThemeSwitcher);
  });
});
