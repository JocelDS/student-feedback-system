// All communication with the Express backend goes through this file.
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export const CATEGORIES = ['Suggestion', 'Complaint', 'Appreciation', 'General Feedback'];
export const STATUSES = ['Pending', 'Reviewed', 'Resolved'];

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

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

// filters: { search, category, status } (empty values are ignored)
export const getFeedback = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value && String(value).trim()) params.set(key, String(value).trim());
  });
  const qs = params.toString();
  return request(`/api/feedback${qs ? `?${qs}` : ''}`);
};
export const createFeedback = (payload) => request('/api/feedback', { method: 'POST', body: payload });
export const deleteFeedback = (id, token) => request(`/api/feedback/${id}`, { method: 'DELETE', token });
export const updateStatus = (id, status, token) =>
  request(`/api/feedback/${id}/status`, { method: 'PATCH', body: { status }, token });
export const getStats = (token) => request('/api/feedback/stats', { token });
export const login = (username, password) =>
  request('/api/auth/login', { method: 'POST', body: { username, password } });
export const checkSession = (token) => request('/api/auth/me', { token });