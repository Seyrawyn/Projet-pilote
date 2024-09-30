import { redirect, type Handle, type HandleFetch, type RequestEvent } from '@sveltejs/kit';

const redirectOnInvalidSession = (token: string | undefined, event: RequestEvent<Partial<Record<string, string>>, string | null>) => {
  const unguardedRoutes = ['/login', '/register', '/admin'];

  if (!token && !unguardedRoutes.find((route) => event.url.pathname.startsWith(route))) {
    const inSession = event.cookies.get('in_sess') === '1';
    const message = inSession ? 'Your session has expired.' : 'You need to login to view this content.';
    return redirect(302, `/login?next=${encodeURIComponent(event.url.pathname + event.url.search)}&message=${encodeURIComponent(message)}`);
  }

  if (!event.url.pathname.startsWith('/logout')) {
    const isTrainer = event.cookies.get('is_trainer') === '1';
    if (isTrainer && !event.url.pathname.includes('trainer')) return redirect(302, '/trainer');
    if (!isTrainer && event.url.pathname.includes('trainer')) return redirect(302, '/');
  }
};

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('token');
  const basicAuth = event.cookies.get('basicAuth');

  redirectOnInvalidSession(token, event);

  event.locals.token = token;
  event.locals.basicAuth = basicAuth;

  const response = await resolve(event);
  return response;
};

export const handleFetch: HandleFetch = async ({ event, fetch, request }) => {
  if (request.url.startsWith('http://tse.info.uqam.ca/api')) {
    const token = event.cookies.get('token');
    const requestCookies = event.request.headers.get('cookie');
    
    redirectOnInvalidSession(token, event);

    if (requestCookies) {
      request.headers.set('cookie', requestCookies);
    }

    request = new Request(
      request.url.replace('http://tse.info.uqam.ca/api', 'http://backend:5001'),
      request,
    );
  }

  return fetch(request);
};
