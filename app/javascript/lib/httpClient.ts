type MethodType = 'GET' | 'POST' | 'PUT' | 'DELETE'

const config = (body?: Record<string, unknown>, method?: MethodType) => ({
  headers: {
    Accept: 'application/json',
    'content-type': 'application/json',
    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
  },
  method: method ?? 'GET',
  body: body ? JSON.stringify(body) : undefined,
});

const request = <TData = unknown>(url: string, bodyData?: Record<string, unknown>, method?: string): Promise<TData> => fetch(url, config(bodyData, method)).then(async (response) => {
  const data = await response.json();

  if (response.ok) {
    return data;
  }

  return Promise.reject(data);
});

const HttpClient = {
  get: <TData = unknown>(url: string) => request<TData>(url),
  post: <TData = unknown>(url: string, bodyData: Record<string, unknown>) => request<TData>(url, bodyData, 'POST'),
};

export default HttpClient;
