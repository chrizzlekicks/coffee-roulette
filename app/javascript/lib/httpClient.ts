const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
};

type HttpRequestOptions = RequestInit & {
  headers: HeadersInit;
};

const optionsConfig = (
  body?: Record<string, unknown>,
  method?: string,
): HttpRequestOptions => ({
  headers: {
    Accept: 'application/json',
    'content-type': 'application/json',
    'X-CSRF-Token': document.querySelector<HTMLMetaElement>(
      'meta[name="csrf-token"]',
    ).content,
  },
  method: method ?? HTTP_METHODS.GET,
  body: body ? JSON.stringify(body) : undefined,
});

const request = <TData = unknown>(
  url: string,
  bodyData?: Record<string, unknown>,
  method?: string,
): Promise<TData> => fetch(url, optionsConfig(bodyData, method)).then(async (response) => {
    const data = await response.json();

    if (!response.ok) {
      return Promise.reject(data);
    }

    return data;
  });

const HttpClient = {
  get: <TData = unknown>(url: string) => request<TData>(url),
  post: <TData = unknown>(url: string, bodyData: Record<string, unknown>) => request<TData>(url, bodyData, HTTP_METHODS.POST),
  delete: (url: string) => request(url, undefined, HTTP_METHODS.DELETE),
};

export default HttpClient;
