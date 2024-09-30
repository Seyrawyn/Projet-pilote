import { API_URL } from '../../constants';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';
import type { FrontPlannedActivity, PlannedActivity } from '$lib/types/plannedActivity';
import { fail } from '@sveltejs/kit';
import type { RequestEvent, ActionData } from '../$types';
import { formatPActivityForBackend, formatPActivityForFrontend } from '$lib/plannedActivity/activity';

// Load data
export const load: PageServerLoad = async ({ fetch, locals, url }) => {
  const activityId = url.searchParams.get('id');

  const response = await fetch(`${API_URL}/plannedactivities/${activityId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${locals.token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return error(404, { message: 'Could not load planned Activity.' });
  }

  const json = await response.json();
  const plannedActivity: PlannedActivity = json.plannedActivity || undefined;
  const fPActivity: FrontPlannedActivity = formatPActivityForFrontend(plannedActivity);
  return { fPActivity };
};


// Start, save or delete planned activity
export const actions: ActionData = {
  save: async ({ cookies, fetch, request }: RequestEvent) => {
    const data = await request.formData();

    if (!data.get('date') || !data.get('time') ||
      !data.get('duration') || !data.get('type')) {
      return fail(400, {
        success: false,
        message: 'Please fill all mandatory fields',
      });
    }

    const pActivity: PlannedActivity = formatPActivityForBackend(data);

    const res = await fetch(`${API_URL}/plannedactivities/${pActivity.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cookies.get('token')}`,
      },
      body: JSON.stringify(pActivity),

    });


    if (res.status === 400) {
      return fail(res.status, {
        updated: false,
        message: 'Invalid request: could not update planned activity.',
      });
    }

    if (res.status === 401) {
      return fail(res.status, {
        updated: false,
        message: 'User not logged in. Please log in to continue.',
      });
    }


    if (res.ok) {
      return {
        updated: true,
        message: 'Planned activity updated successfully!',
      };
    }

    return fail(500, {
      updated: false,
      message: 'Internal server error',
    });
  },

  delete: async ({ cookies, fetch, request }: RequestEvent) => {
    const data = await request.formData();
    const pActivity: PlannedActivity = formatPActivityForBackend(data);
    const res = await fetch(`${API_URL}/plannedactivities/${pActivity.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${cookies.get('token')}` },
    });


    if (res.status === 400 || res.status === 404) {
      return fail(res.status, {
        deleted: false,
        message: 'Could not delete planned activity.',
      });
    }


    if (res.status === 401) {
      return fail(res.status, {
        deleted: false,
        message: 'User not logged in. Please log in to continue.',
      });
    }

    if (res.ok) {
      throw redirect(303, './plannedActivities');
    }

    return fail(500, {
      success: false,
      message: 'Internal server error',
    });
  },
};
