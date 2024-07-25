const config = (body?: Record<string, unknown>) => {
    return {
        headers: {
            Accept: 'application/json',
            'content-type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
    }
}

const request = <TData = unknown>(url: string, bodyData?: Record<string, unknown>): Promise<TData> => {
    return window.fetch(url, config(bodyData)).then((response) => {
        const data = response.json()

        if (response.ok) {
            return data
        } else {
            return Promise.reject(data)
        }
    })
}

const HttpClient = {
    get: <TData = unknown>(url: string) => request<TData>(url),
    post: <TData = unknown>(url: string, bodyData: Record<string, unknown>) => request<TData>(url, bodyData)
}