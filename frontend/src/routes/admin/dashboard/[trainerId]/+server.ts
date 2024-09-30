import { json } from '@sveltejs/kit';
import { API_URL } from '../../../../constants';
import type { Trainer } from '$lib/types/trainer';
import type { JsonBodyResponse } from '$lib/types/JsonBodyResponse';


export const DELETE = async ({ locals, params }) => {
  const { trainerId } = params;

  const res = await fetch(`${API_URL}/admin/trainer/${trainerId}`, {
    method: 'DELETE',
    headers: { Authorization: locals.basicAuth as string },
  });

  if (res.ok) return json({trainerId}, {status: 200});
  return json({trainerId}, {status: res.status});
};


export const PATCH = async ({ request, locals, params }) => {
  const trainer: Trainer = await request.json();
  if (trainer.username === '') delete trainer.username;
  if (trainer.name === '') delete trainer.name;
  if (trainer.email === '') delete trainer.email;
  if (trainer.password === '') delete trainer.password;

  const { trainerId } = params;

  const res = await fetch(`${API_URL}/admin/trainer/${trainerId}`, {
    method: 'PATCH',
    headers: { Authorization: locals.basicAuth as string, 'Content-Type': 'application/json' },
    body: JSON.stringify(trainer),
  });


  if (res.status === 409) {
    const data: JsonBodyResponse = await res.json();
    return json({
      success: false,
      message: data.error,
    });
  }

  if (!res.ok) {
    throw new Error(`HTTP error! Status: ${await res.status}}`);
  }
    
  if (res.ok) return json({success: true, message: 'Mise à jour avec succès'});
  return json({trainerId}, {status: res.status});
};
