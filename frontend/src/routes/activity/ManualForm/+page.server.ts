/* eslint-disable no-unused-vars */
import { fail, redirect } from '@sveltejs/kit';
import type { RequestEvent } from '../$types';
import { API_URL } from '../../../constants';
import type { ActivityData } from '$lib/types/ActivityData';
import {
  _convertDateFuseau,
  _convertDistance,
  _convertDureeToSecondes,
  _validateDefault,
  _validateManual,
} from '$lib/activity/validForm';
import { _extractFormData } from '$lib/activity/formData';

//formulaire manuelle
/**
 * Adds an activity to the system.
 *
 * @param {Object} RequestEvent - The request event object.
 * @returns {Object} - The response object.
 */
export const actions: object = {
  /**
   * Adds a manually submitted activity to the system by processing and validating form data.
   *
   * @param {Object} requestEvent - The request event object containing the cookies, fetch, and request properties.
   *                                It is used to extract form data, validate it, and handle the API submission.
   * @returns {Object} - The response object containing the status code and body, which may include error messages or success confirmation.
   */
  ajouterActiviteManuel: async ({ cookies, fetch, request }: RequestEvent) => {
    const activityData: ActivityData = await _extractFormData(request);

    const defaultValidationResult = _validateDefault(activityData);
    if (defaultValidationResult) {
      return defaultValidationResult;
    }
    const manualValidationResult = _validateManual(activityData);
    if (manualValidationResult) {
      return manualValidationResult;
    }
    
    const durationTotal = _convertDureeToSecondes(<string>activityData.duration);
    const distanceTotal = _convertDistance(Number(activityData.distance), activityData.metric, 'm');
    const name = activityData.name;
    const city = activityData.city;
    const type = activityData.type;
    const date = _convertDateFuseau(<string>activityData.date);
    const comment = activityData.comment;
    const segments = activityData.segments;

    const token = cookies.get('token');

    const res = await fetch(`${API_URL}/activity/manual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, city , type, date, durationTotal, distanceTotal, comment, segments }),
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
