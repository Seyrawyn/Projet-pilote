import { browser } from '$app/environment';

const prodUrl = browser ? 'http://tse.info.uqam.ca/api' : 'http://backend:5001';

export const API_URL = process.env.NODE_ENV === 'production' ? prodUrl : 'http://localhost:5001';
export const FRONTEND_API_URL = process.env.NODE_ENV === 'production' ? 'http://tse.info.uqam.ca/api' : 'http://localhost:5001';
