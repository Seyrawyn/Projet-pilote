// src/routes/plannedActivities/+page.server.ts
import { API_URL } from '../../constants';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';
import type { ActivityStats } from '$lib/types/activityStats';
import { getISOFromDate } from '$lib/plannedActivity/activity';
import { browser } from '$app/environment';


function getUrl(date: string | null, type: string | null) {
  const url = new URL(`${API_URL}/statistics`);

  if (!date) {
    date = getISOFromDate(new Date());
  }
  url.searchParams.set('date', date);

  if (type !== 'All' && type) {
    url.searchParams.set('type', type);
  }
  return url;
}

export const load: PageServerLoad = async ({ url, locals }) => {
  const date = url.searchParams.get('date') || null;
  const type = url.searchParams.get('type') || null;
  const pActivitiesUrl = getUrl(date, type);
  
  let activitiesStats: ActivityStats[] = [];

  const res = await fetch(pActivitiesUrl, {
    method: 'GET',
    headers: { Authorization: `Bearer ${locals.token}` },
  });

  // This might be unncessary later on when default redirect is implemented
  if (res.status === 401) {
    if (browser) {
      goto('/login');
    } else {
      redirect(302, '/login');
    }
    return {};
  }
  if (!res.ok) {
    return { 
      activitiesStats, 
      error: 'Could not load the ressource',
    };
  }

  const json = await res.json();
  activitiesStats = json.activities || [];
  return { activitiesStats };
};
