const config = (body?: Record<string, unknown>) => ({
  headers: {
    Accept: 'application/json',
    'content-type': 'application/json',
  },
  body: body ? JSON.stringify(body) : undefined,
});

const request = <TData = unknown>(url: string, bodyData?: Record<string, unknown>): Promise<TData> => fetch(url, config(bodyData)).then((response) => {
  const data = response.json();

  if (response.ok) {
    return data;
  }
  return Promise.reject(data);
});

const HttpClient = {
  get: <TData = unknown>(url: string) => request<TData>(url),
  post: <TData = unknown>(url: string, bodyData: Record<string, unknown>) => request<TData>(url, bodyData),
};

export default HttpClient;
