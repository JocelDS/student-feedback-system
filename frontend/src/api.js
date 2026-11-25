// All communication with the Express backend goes through this file.
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export const CATEGORIES = ['Suggestion', 'Complaint', 'Appreciation', 'General Feedback'];

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new ApiError('Cannot reach the server. Please try again in a moment.', 0);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data.details ? data.details.join('. ') : data.error || 'Something went wrong';
    throw new ApiError(message, res.status);
  }
  return data;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export const getFeedback = () => request('/api/feedback');
export const createFeedback = (payload) => request('/api/feedback', { method: 'POST', body: payload });
export const deleteFeedback = (id, token) => request(`/api/feedback/${id}`, { method: 'DELETE', token });
export const login = (username, password) =>
  request('/api/auth/login', { method: 'POST', body: { username, password } });
export const checkSession = (token) => request('/api/auth/me', { token });
