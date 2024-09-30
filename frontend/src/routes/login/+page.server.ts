import { redirect, fail } from '@sveltejs/kit';
import type { RequestEvent } from '../$types';
import { API_URL } from '../../constants';

export const actions: object = {
  default: async ({ cookies, fetch, request, url }: RequestEvent) => {
    const data = await request.formData();
    const username = data.get('username');
    const password = data.get('password');
    const isTrainer = data.get('isTrainer') === 'on'; // checkbox

    if (!username) return fail(400, {
      success: false,
      message: 'Please enter a username',
      username,
    });

    if (!password) return fail(400, {
      success: false,
      message: 'Please enter a password',
      username,
    });

    const res = await fetch(isTrainer ? `${API_URL}/auth/trainer` : `${API_URL}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (res.status === 400 || res.status === 401) return fail(res.status, {
      success: false,
      message: 'Your credentials are invalid',
      username,
    });

    if (res.ok) {
      const resData = await res.json();

      cookies.set('token', resData.token, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: false,
        maxAge: 60 * 60, // 1h
      });

      cookies.set('in_sess', '1', {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: false,
        maxAge: 60 * 60, // 1h
      });

      cookies.set('is_trainer', isTrainer ? '1' : '0', {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: false,
        maxAge: 60 * 60, // 1h
      });

      const next = url.searchParams.get('next');
      if (next) {
        redirect(302, `/${next.slice(1)}`);
      }
      redirect(302, isTrainer ? '/trainer' : '/');
    }

    return fail(500, {
      success: false,
      message: 'Internal server error',
      username,
    });
  },
};
