const api = '/api';

type ErrorResponse = { error?: string; message?: string };

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${api}${path}`, {
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
    ...init,
  });

  if (response.status === 204) return undefined as T;

  const data = (await response.json().catch(() => ({}))) as T & ErrorResponse;
  if (!response.ok) throw new Error(data.error ?? data.message ?? 'Request failed');

  return data;
};

const httpClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
};

export default httpClient;
