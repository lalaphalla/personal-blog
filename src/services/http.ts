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
  let response: Response
  try {
    response = await fetch(apiUrl(path), {
      ...init,
      credentials: 'include',
      headers: {
        // Only set JSON content type when NOT sending FormData (browser sets the multipart boundary).
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...init?.headers,
      },
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error

    // Browsers intentionally hide detailed DNS/network errors from JavaScript.
    console.error(`[API] ${path} request failed`, error)
    if (error instanceof TypeError) {
      throw new ApiError(
        0,
        'Unable to reach the API. Check your connection, API hostname, and DNS settings.',
      )
    }
    throw error
  }

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
