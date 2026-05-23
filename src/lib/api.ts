const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const TOKEN_KEY = 'shop_token';

let onAuthError: (() => void) | null = null;

export function setAuthErrorHandler(handler: () => void) {
  onAuthError = handler;
}

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

function isTokenExpired(): boolean {
  const token = getToken();
  if (!token) return true;
  try {
    const payloadB64 = token.split('.')[1];
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    return payload.exp && payload.exp < Date.now() / 1000;
  } catch {
    return true;
  }
}

async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    if (isTokenExpired()) {
      onAuthError?.();
      return { data: null, error: 'Session expired' };
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const body = await res.json();

    if (res.status === 401) {
      onAuthError?.();
      return { data: null, error: body.error || 'Session expired' };
    }

    if (!res.ok) {
      return { data: null, error: body.error || `Request failed (${res.status})` };
    }
    return { data: body as T, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Network error' };
  }
}

async function uploadFile<T = any>(
  path: string,
  file: File
): Promise<{ data: T | null; error: string | null }> {
  const token = getToken();
  const headers: Record<string, string> = {};

  if (token) {
    if (isTokenExpired()) {
      onAuthError?.();
      return { data: null, error: 'Session expired' };
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const body = await res.json();

    if (res.status === 401) {
      onAuthError?.();
      return { data: null, error: body.error || 'Session expired' };
    }

    if (!res.ok) {
      return { data: null, error: body.error || `Upload failed (${res.status})` };
    }
    return { data: body as T, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Network error' };
  }
}

export const api = {
  get: <T = any>(path: string) => request<T>(path),
  post: <T = any>(path: string, body?: any) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T = any>(path: string, body?: any) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T = any>(path: string, body?: any) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T = any>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
  upload: <T = any>(path: string, file: File) => uploadFile<T>(path, file),
};
