const API = '';

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function clearToken() {
  localStorage.removeItem('token');
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (res.status === 401) { clearToken(); window.location.reload(); throw new Error('Unauthorized'); }
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Request failed');
  return data;
}

export const api = {
  login: (email, password) => request('POST', '/auth/login', { email, password }),
  register: (email, password) => request('POST', '/auth/register', { email, password }),

  shorten: (target_url) => request('POST', `/urls/shorten?target_url=${encodeURIComponent(target_url)}`),
  myUrls: () => request('GET', '/urls/my'),
  deleteUrl: (code) => request('DELETE', `/urls/${code}`),
  stats: (code) => request('GET', `/urls/${code}/stats`),

  getToken,
  setToken,
  clearToken,
};
