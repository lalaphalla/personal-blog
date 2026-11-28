import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listAppSettings, upsertAppSetting } from '../services/settingsApi'

export const settingsKeys = {
  all: ['app-settings'] as const,
}

export function useAppSettings() {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: listAppSettings,
    staleTime: 60_000,
  })
}

export function useUpdateAppSetting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) =>
      upsertAppSetting(key, value),
    onSuccess: (updated) => {
      qc.setQueryData<Record<string, unknown>>(settingsKeys.all, (prev) => ({
        ...(prev ?? {}),
        [updated.key]: updated.value,
      }))
    },
  })
}
