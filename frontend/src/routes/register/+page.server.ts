import { redirect, fail } from '@sveltejs/kit';
import type { RequestEvent } from '../$types';
import { API_URL } from '../../constants';
import { dateOfBirthValidation, emailValidation, passwordValidation } from '$lib/utils/userValidation';

export const actions: object = {
  register: async ({ cookies, fetch, request }: RequestEvent) => {
    const data = await request.formData();
    const username = data.get('username');
    const email = data.get('email');
    const password = data.get('password');
    const lastname = data.get('lastname');
    const firstname = data.get('firstname');
    const dateOfBirth = data.get('dateOfBirth');

    if (!username || !email || !password || !lastname || !firstname || !dateOfBirth) {
      return fail(400, {
        success: false,
        message: 'All fields are required',
      });
    }

    const validateEmail = emailValidation(email as string);
    if (validateEmail) return fail(400, {
      success: false,
      message: validateEmail,
    });

    const validatePassword = passwordValidation(password as string);
    if (validatePassword) return fail(400, {
      success: false,
      message: validatePassword,
    });

    const validateDateOfBirth = dateOfBirthValidation(dateOfBirth as string);
    if (validateDateOfBirth) return fail(400, {
      success: false,
      message: validateDateOfBirth,
    });

    const name = `${firstname} ${lastname}`;
   
    const res = await fetch(`${API_URL}/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        email,
        name,
        dateOfBirth,
      }),
    });

    if (res.status === 400) {
      const resData = await res.json();
      return fail(res.status, {
        success: false,
        message: resData.message || 'Error during registration',
      });
    }

    if (res.status === 409) {
      const resData = await res.json();
      return fail(res.status, {
        success: false,
        message: resData.error || 'Username or email already exists',
        color: 'red',
      });
    }

    if (res.ok) {
      const resData = await res.json();

      cookies.set('token', resData.token, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, 
      });

      return redirect(302, '/login?message=Your account was successfully created.'); 
    }

    return fail(500, {
      success: false,
      message: 'Internal server error',
    });
  },
};

