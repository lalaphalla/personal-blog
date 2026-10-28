import { apiUrl } from '../config/api'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = init?.body instanceof FormData
  const response = await fetch(apiUrl(path), {
    ...init,
    credentials: 'include',
    headers: {
      // Only set JSON content type when NOT sending FormData (browser sets the multipart boundary).
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...init?.headers,
    },
  })

  if (!response.ok) {
    let message = response.statusText
    try {
      const body = await response.json()
      if (typeof body?.detail === 'string') {
        message = body.detail
      }
    } catch {
      // response had no JSON body
    }
    throw new ApiError(response.status, message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
