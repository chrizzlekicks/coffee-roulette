const config = (body?: Record<string, unknown>) => {
    return {
        headers: {
            "content-type": "application/json"
        },
        body: body ? JSON.stringify(body) : null
    }
}

const fetcher = <T>(url: string, bodyData?: Record<string, unknown>): Promise<T> => {
    return fetch(url, config(bodyData)).then((response) => {
        const data = response.json()

        if (response.ok) {
            return data
        } else {
            return Promise.reject(data)
        }
    })
}

const HttpClient = {
    get: <T>(url: string) => fetcher<T>(url),
    post: (url: string, bodyData: Record<string, unknown>) => fetcher(url, bodyData)
}