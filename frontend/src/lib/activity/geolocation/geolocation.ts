import {API_URL} from '../../../constants';

export async function sendDataToBackend(positions: {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number
}[], geolocation: string, activityName: string, activityType: string, comment: string) {
  try {
    const res = await fetch(`${API_URL}/activity/geolocation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for cookies to be sent with the request
      body: JSON.stringify({
        geolocation,
        positions,
        activityName,
        activityType,
        comment,
      }),
    });

    if (!res.ok) {
      throw new Error(`Error: ${res.status}`);
    }

    // Return new activity id
    const data = await res.json();
    return data.id;

    
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to send geolocation data:', error);
  }
}

export async function mapPlannedActivityToActivity(pActivityId: number, activityId: number) {
  const res = await fetch(`${API_URL}/plannedactivities/${pActivityId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', 
    body: JSON.stringify({
      activity_id: activityId,
    }),
  });

  if (!res.ok) {
    throw new Error(`Error: ${res.status}`);
  }
}


