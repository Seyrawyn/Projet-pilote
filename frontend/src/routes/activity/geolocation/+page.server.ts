import { fail } from '@sveltejs/kit';
import type { RequestEvent, ActionData } from '../$types';
import { activityType } from '$lib/plannedActivity/activity';

export const actions: ActionData = {
  default: async ({ request }: RequestEvent) => {
    const data = await request.formData();
    if (!data.get('date') || !data.get('time') ||
      !data.get('duration') || !data.get('type')) {
      return fail(400, {
        success: false,
        message: 'Please fill all mandatory fields',
      });
    }

    // No backend validation here. Check if type value
    if (!activityType.includes(<string>data.get('type'))) {
      return fail(400, {
        success: false,
        message: 'Invalid activity type',
      });
    }

    const pActivityId = Number(data?.get('id'));
    const name = String(data?.get('name'));
    const comment = String(data?.get('comment'));
    const type = String(data?.get('type'));

    return { pActivityId, name, comment, type };
  },
};
