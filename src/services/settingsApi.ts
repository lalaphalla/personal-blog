import { request } from './http'

export type AppSettingsMap = Record<string, unknown>

export function listAppSettings(): Promise<AppSettingsMap> {
  return request<AppSettingsMap>('/admin/settings')
}

export function upsertAppSetting(
  key: string,
  value: unknown,
): Promise<{ key: string; value: unknown; updated_at: string }> {
  return request<{ key: string; value: unknown; updated_at: string }>(
    `/admin/settings/${encodeURIComponent(key)}`,
    {
      method: 'PUT',
      body: JSON.stringify({ value }),
    },
  )
}
