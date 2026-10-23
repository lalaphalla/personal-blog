const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export function apiUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/+$/, '')
  return `${base}/${path.replace(/^\/+/, '')}`
}

export { API_BASE_URL }
