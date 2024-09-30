import { fail } from '@sveltejs/kit';
import type { RequestEvent } from '../$types';
import { API_URL } from '../../../constants';
import type { PlannedActivity } from '$lib/types/plannedActivity';
import { formatPActivityForBackend } from '$lib/plannedActivity/activity';


export const actions: object = {
  default: async ({ cookies, fetch, request }: RequestEvent) => {
    const data = await request.formData();

    if (!data.get('date') || !data.get('time') ||
      !data.get('duration') || !data.get('type')) {
      return fail(400, {
        success: false,
        message: 'Please fill all mandatory fields',
      });
    }

    const pActivity: PlannedActivity = formatPActivityForBackend(data);
    const res = await fetch(`${API_URL}/plannedactivities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cookies.get('token')}`,
      },

      body: JSON.stringify(pActivity),
    });


    if (res.status === 400) {
      return fail(res.status, {
        success: false,
        message: 'Invalid request: could not create planned activity.',
      });
    }


    if (res.status === 401) {
      return fail(res.status, {
        success: false,
        message: 'User not logged in. Please log in to continue.',
      });
    }

    if (res.ok) {
      const id = (await res.json()).id;
      return { submitted: true, id };
    }

    return fail(500, {
      success: false,
      message: 'Internal server error',
    });
  },
};
