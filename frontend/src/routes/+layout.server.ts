import type { LayoutServerLoad } from './$types';
import { Theme } from '$lib/types/theme';

export const load: LayoutServerLoad = async ({ cookies }) => {
  const themeCookieValue: string | undefined = cookies.get('theme');

  let theme = Theme.System;
  if (themeCookieValue) {
    const themeName = themeCookieValue[0].toUpperCase() + themeCookieValue.slice(1);
    if (themeName in Theme) {
      theme = Theme[themeName as keyof typeof Theme];
    }
  }

  return {
    theme,
    isTrainer: cookies.get('is_trainer') === '1',
  };
};
