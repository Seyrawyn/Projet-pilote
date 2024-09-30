import { error } from '@sveltejs/kit';
import { API_URL } from '../../../constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  try {
    const res = await fetch(`${API_URL}/trainer/users`, {
      credentials: 'include',
    });

    if (res.status === 401) throw error(401);

    const { users } = await res.json();
    return {
      users,
    };
    
  } catch (err: unknown) { 
    if (typeof err === 'object' && err !== null && 'status' in err) {
      const httpError = err as { status: number; message: string };
      if (httpError.status === 401) {
        throw error(401, 'Unauthorized');
      }
    }
  }
};
