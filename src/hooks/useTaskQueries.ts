import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTask,
  deleteTask,
  getTaskStats,
  listTasks,
  purgeTask,
  restoreTask,
  toggleTaskComplete,
  updateTask,
  type TaskCreateInput,
  type TaskListParams,
  type TaskUpdateInput,
} from '../services/taskApi'

export const taskKeys = {
  all: ['tasks'] as const,
  stats: () => [...taskKeys.all, 'stats'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (params: TaskListParams) => [...taskKeys.lists(), params] as const,
}

export function useTaskStats() {
  return useQuery({
    queryKey: taskKeys.stats(),
    queryFn: getTaskStats,
  })
}

export function useTaskList(params: TaskListParams = {}) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => listTasks(params),
  })
}

export function useTaskMutations() {
  const qc = useQueryClient()

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: taskKeys.all })
  }

  const create = useMutation({
    mutationFn: (input: TaskCreateInput) => createTask(input),
    onSuccess: invalidateAll,
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: TaskUpdateInput }) =>
      updateTask(id, input),
    onSuccess: invalidateAll,
  })

  const toggle = useMutation({
    mutationFn: (id: number) => toggleTaskComplete(id),
    onSuccess: invalidateAll,
  })

  const softDelete = useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: invalidateAll,
  })

  const restore = useMutation({
    mutationFn: (id: number) => restoreTask(id),
    onSuccess: invalidateAll,
  })

  const purge = useMutation({
    mutationFn: (id: number) => purgeTask(id),
    onSuccess: invalidateAll,
  })

  return {
    create,
    update,
    toggle,
    softDelete,
    restore,
    purge,
  }
}
