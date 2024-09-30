import type { PageServerLoad, RequestEvent } from './$types';
import { API_URL } from '../../../constants';
import type { Trainer } from '$lib/types/trainer';
import { fail, redirect } from '@sveltejs/kit';


export const load: PageServerLoad = async ({ fetch, locals }) => {
  if (!locals.basicAuth) redirect(302, '/admin');
  const res = await fetch(`${API_URL}/admin/trainers`, {
    method: 'GET',
    headers: { Authorization: `${locals.basicAuth}` },
  });

  if (!res.ok) {
    throw new Error(`HTTP error! Status: ${await res.status}}`);
  }

  const trainers: Trainer[] = await res.json();
  return { trainers };
};


export const actions: object = {
  createTrainer: async ({ fetch, request, locals }: RequestEvent) => {
    const data = await request.formData();

    const username = data.get('username');
    const name = data.get('name');
    const email = data.get('email');
    const password = data.get('password');
    
    if (!username) return fail(400, {
      success: false,
      message: 'Please enter a username',
      username,
    });

    if (!name) return fail(400, {
      success: false,
      message: 'Please enter the trainer\'s name',
      name,
    });

    if (!email) return fail(400, {
      success: false,
      message: 'Please enter the trainer\'s email',
      email,
    });

    if (!password) return fail(400, {
      success: false,
      message: 'Please enter a password',
      password,
    });

    const res = await fetch(`${API_URL}/admin/trainer`, {
      method: 'POST',
      headers: { Authorization: locals.basicAuth as string, 'Content-Type': 'application/json' },
      body: JSON.stringify({username, name, email, password}),
    });
    
    if (res.status === 400 || res.status === 401) return fail(res.status, {
      success: false,
      message: 'Your credentials are invalid',
    });

    if (res.status === 409) return fail(res.status, {
      success: false,
      message: 'Conflict, email or username already in use',
    });

    if (res.ok) {
      return {
        success: true,
        message: 'Trainer added successfully',
      };
    }

    return fail(500, {
      success: false,
      message: 'Internal server error',
      username,
    });
  },
};

