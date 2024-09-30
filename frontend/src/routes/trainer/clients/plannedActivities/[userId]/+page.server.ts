import type { PlannedActivity } from '$lib/types/plannedActivity';
import { API_URL } from '../../../../../constants';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, locals, params }) => {
  const res = await fetch(`${API_URL}/trainer/plannedActivity/${params.userId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${locals.token}` },
  });

  const activities: PlannedActivity[] = await res.json();

  return {
    activities,
  };
};

