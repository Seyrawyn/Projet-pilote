/* eslint-disable no-unused-vars */
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, RequestEvent } from '../$types';
import { API_URL } from '../../constants';
import { _getErrorMessage, ErrorCode } from '$lib/activity/errorCode';
import { _extractFormData } from '$lib/activity/formData';
import {
  _convertDistance,
  _convertDureeToSecondes,
  _validateDefault,
  _validateManual,
  formatDate,
  formatDuration,
} from '$lib/activity/validForm';
import type { ActivityData } from '$lib/types/ActivityData';

/**
 * Adds an activity to the system.
 *
 * @param {Object} RequestEvent - The request event object.
 * @returns {Object} - The response object.
 */
export const actions: object = {
/**
 * Modifies an existing activity in the system by processing and updating form data.
 *
 * @param {Object} requestEvent - Contains properties like cookies, fetch, and request, necessary for handling the form data and API interaction.
 * @returns {Object} - Returns an error object or a success message with a redirection command.
 */
  modifierActivite: async ({ cookies, fetch, request }: RequestEvent) => {
    const activityData: ActivityData = await _extractFormData(request);

    const defaultValidationResult = _validateDefault(activityData);
    if (defaultValidationResult) {
      return defaultValidationResult;
    }
    if (activityData.segments === '{}' || activityData.segments === null || activityData.segments === '') {
      const manualValidationResult = _validateManual(activityData);
      if (manualValidationResult) {
        return manualValidationResult;
      }
    }
    

    const durationTotal = _convertDureeToSecondes(<string>activityData.duration);
    const distanceTotal = _convertDistance(Number(activityData.distance), activityData.metric, 'm');
    const name = activityData.name;
    const city = activityData.city;
    const type = activityData.type;
    const date = activityData.date;
    const comment = activityData.comment;
    const segments = activityData.segments;

    const token = cookies.get('token');
    const updateRes = await fetch(`${API_URL}/activity/updateActivity/${activityData.activityId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, city , type, date, durationTotal, distanceTotal, comment, segments }),
    });

    if (updateRes.status === 400 || updateRes.status === 401) {
      const errorData = await updateRes.json();
      return fail(updateRes.status, {
        success: false,
        message: errorData.message,
      });
    }

    if (updateRes.ok) {
      redirect(302, '/activity');
    }

    return {
      status: 200,
      body: {
        success: true,
        message: 'Activity successfully modified!',
      },
    };
  },

  /**
   * Deletes an activity based on its ID.
   *
   * @param {Object} requestEvent - Contains properties like cookies, fetch, and request, necessary for processing the deletion request.
   * @returns {Object} - Depending on the response from the API, it returns either a success message or an error object.
   */
  supprimerActivite: async ({ cookies, fetch, request }: RequestEvent) => {
    const data = await request.formData();
    const activityId = data.get('activityId');
    if (!activityId) {
      return fail(400, {
        success: false,
        message: _getErrorMessage(ErrorCode.InvalidName, 'id'),
      });
    }

    const token = cookies.get('token');
    const res = await fetch(`${API_URL}/activity/suppression/${activityId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (res.status === 400 || res.status === 401) {
      const errorData = await res.json();
      return fail(res.status, {
        success: false,
        message: errorData.message,
      });
    }

    if (res.ok) {
      return {
        status: 200,
        body: {
          success: true,
          message: 'Activity successfully deleted!',
        },
      };
    }

    return fail(500, {
      success: false,
      message: 'An error occurred while deleting the activity.',
    });
  },
};

/**
 * Loads activities from the server.
 *
 * @param {Object} options - The options for making the API request.
 * @param {Function} options.fetch - The fetch function for making network requests.
 * @param {Object} options.cookies - The cookies object for accessing cookies.
 * @returns {Promise<Object>} - The promise that resolves to the activities object from the server.
 * @throws {Error} - Returns an error if the API request fails.
 */
export const load: PageServerLoad = async ({ fetch, cookies }) => {
  const token = cookies.get('token');
  const res = await fetch(`${API_URL}/activity/getActivity`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    return error(404, { message: 'Could not get activities'});
  }
  const activities = await res.json();

  if (activities.userActivities.length > 0) {
    for (let i = 0; i < activities.userActivities.length; i++) {
      activities.userActivities[i].date = formatDate(activities.userActivities[i].date);
      activities.userActivities[i].durationTotal = formatDuration(activities.userActivities[i].durationTotal);
      activities.userActivities[i].distanceTotal = _convertDistance(Number(activities.userActivities[i].distanceTotal), 'm', 'km');
    }
  }
  return { activities };
};
