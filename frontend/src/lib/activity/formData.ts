import type { ActivityData } from '$lib/types/ActivityData';

/**
 * Extracts activity data from a form submission and constructs an `ActivityData` object.
 *
 * This function retrieves various pieces of activity-related data (like activity ID, name, city, etc.) from the request's form data. 
 *
 * @param {Request} request - The HTTP request object containing the form data.
 * @return {Promise<ActivityData>} A promise that resolves with an `ActivityData` object populated with the extracted data.
 */
export async function _extractFormData(request: Request): Promise<ActivityData> {
  const data = await request.formData();
  return {
    activityId: data.get('activityId') as string | null,
    name: data.get('name') as string | null,
    city: data.get('city') as string | null,
    type: data.get('type') as string | null,
    date: data.get('date') as string | null,
    duration: data.get('durationTotal') as string | null,
    distance: data.get('distanceTotal') as string | null,
    metric: data.get('metric') as string,
    comment: data.get('comment') as string | null, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    segments: data.get('segments') as any | null, 
  };
}
