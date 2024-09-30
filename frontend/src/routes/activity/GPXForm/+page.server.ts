/* eslint-disable no-unused-vars */
import { fail, redirect } from '@sveltejs/kit';
import type { RequestEvent } from '../$types';
import { API_URL } from '../../../constants';
import type { ActivityData } from '$lib/types/ActivityData';
import { _extractFormData } from '$lib/activity/formData';
import { _validateDefault, _validateGPX } from '$lib/activity/validForm';

/**
 * Adds an activity to the system.
 *
 * @param {Object} RequestEvent - The request event object.
 * @returns {Object} - The response object.
 */
export const actions: object = {
  /**
   * Handles adding an activity with GPX data to the system through a form submission.
   *
   * @param {Object} requestEvent - The event object containing the request details and associated utilities like cookies and fetch.
   * @returns {Object} - The response object which could be an error message or a success message along with a redirect command.
   */
  ajouterActiviteGPX: async ({ cookies, fetch, request }: RequestEvent) => {
    const activityData: ActivityData = await _extractFormData(request);

    const defaultValidationResult = _validateDefault(activityData);
    if (defaultValidationResult) {
      return defaultValidationResult;
    }
    const gpxValidationResult = _validateGPX(activityData);
    if (gpxValidationResult) {
      return gpxValidationResult;
    }

    const token = cookies.get('token');

    const formData = new FormData();
    if (activityData.name) {
      formData.append('name', activityData.name);
    }
    if (activityData.type) {
      formData.append('type', activityData.type);
    }
    if (activityData.comment) {
      formData.append('comment', activityData.comment);
    }
    if (activityData.segments) {
      formData.append('file', activityData.segments);
    }

    const res = await fetch(`${API_URL}/activity/gpxForm`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (res.status === 400 || res.status === 401) {

      const errorData = await res.json();
      return fail(res.status, {
        success: false,
        message: errorData.message,
      });
    }

    if (res.ok) {
      redirect(302, '../activity');
    }

    return {
      status: 200,
      body: {
        success: true,
        message: 'Activity successfully added!',
      },
    };
  },
};
