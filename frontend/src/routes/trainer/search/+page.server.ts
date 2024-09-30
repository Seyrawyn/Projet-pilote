
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  try {
    if (!locals.token) return;
    const { trainerId } = JSON.parse(atob(locals.token?.split('.')[1]));

    return {
      trainerId,
    };
    // eslint-disable-next-line no-empty
  } catch (error: unknown) { }
};
