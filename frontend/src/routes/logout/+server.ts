import { redirect } from '@sveltejs/kit';

export const GET = async ({ cookies }) => {
  cookies.delete('token', {
    path: '/',
    secure: false,
  });

  cookies.delete('in_sess', {
    path: '/',
    secure: false,
  });

  cookies.delete('is_trainer', {
    path: '/',
    secure: false,
  });

  return redirect(303, '/login');
};
