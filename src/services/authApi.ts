import { request } from './http'

export interface AuthUser {
  id: number
  username: string
}

export function login(username: string, password: string): Promise<AuthUser> {
  return request<AuthUser>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function logout(): Promise<{ detail: string }> {
  return request<{ detail: string }>('/auth/logout', { method: 'POST' })
}

export function getMe(): Promise<AuthUser> {
  return request<AuthUser>('/auth/me')
}
