import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createMindmap,
  deleteMindmap,
  getMindmap,
  listMindmaps,
  purgeMindmap,
  restoreMindmap,
  toggleMindmapFavorite,
  updateMindmap,
  type MindmapCreateInput,
  type MindmapListParams,
  type MindmapUpdateInput,
} from '../services/mindmapApi'

export const mindmapKeys = {
  all: ['mindmaps'] as const,
  lists: () => [...mindmapKeys.all, 'list'] as const,
  list: (params: MindmapListParams) => [...mindmapKeys.lists(), params] as const,
  details: () => [...mindmapKeys.all, 'detail'] as const,
  detail: (id: number) => [...mindmapKeys.details(), id] as const,
}

export function useMindmapList(params: MindmapListParams = {}) {
  return useQuery({
    queryKey: mindmapKeys.list(params),
    queryFn: () => listMindmaps(params),
  })
}

export function useMindmap(id?: number) {
  return useQuery({
    queryKey: mindmapKeys.detail(id!),
    queryFn: () => getMindmap(id!),
    enabled: Boolean(id),
  })
}

export function useMindmapMutations() {
  const qc = useQueryClient()

  const invalidateLists = () => {
    qc.invalidateQueries({ queryKey: mindmapKeys.lists() })
  }

  const create = useMutation({
    mutationFn: (input?: MindmapCreateInput) => createMindmap(input),
    onSuccess: (created) => {
      qc.setQueryData(mindmapKeys.detail(created.id), created)
      invalidateLists()
    },
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: MindmapUpdateInput }) =>
      updateMindmap(id, input),
    onSuccess: (updated) => {
      qc.setQueryData(mindmapKeys.detail(updated.id), updated)
      invalidateLists()
    },
  })

  const toggleFavorite = useMutation({
    mutationFn: (id: number) => toggleMindmapFavorite(id),
    onSuccess: (updated) => {
      qc.setQueryData(mindmapKeys.detail(updated.id), updated)
      invalidateLists()
    },
  })

  const softDelete = useMutation({
    mutationFn: (id: number) => deleteMindmap(id),
    onSuccess: (_void, id) => {
      qc.removeQueries({ queryKey: mindmapKeys.detail(id) })
      invalidateLists()
    },
  })

  const restore = useMutation({
    mutationFn: (id: number) => restoreMindmap(id),
    onSuccess: () => invalidateLists(),
  })

  const purge = useMutation({
    mutationFn: (id: number) => purgeMindmap(id),
    onSuccess: () => invalidateLists(),
  })

  return {
    create,
    update,
    toggleFavorite,
    softDelete,
    restore,
    purge,
  }
}
