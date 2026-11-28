import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  checkinHabit,
  createHabit,
  deleteHabit,
  listHabits,
  updateHabit,
  type HabitCreateInput,
  type HabitUpdateInput,
} from '../services/habitApi'

export const habitKeys = {
  all: ['habits'] as const,
  list: (includeArchived: boolean) => [...habitKeys.all, includeArchived] as const,
}

export function useHabits(includeArchived = false) {
  return useQuery({
    queryKey: habitKeys.list(includeArchived),
    queryFn: () => listHabits(includeArchived),
  })
}

export function useHabitMutations() {
  const qc = useQueryClient()

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: habitKeys.all })
  }

  const create = useMutation({
    mutationFn: (input: HabitCreateInput) => createHabit(input),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: HabitUpdateInput }) =>
      updateHabit(id, input),
    onSuccess: invalidate,
  })

  const checkin = useMutation({
    mutationFn: ({
      id,
      log_date,
      delta,
      count,
    }: {
      id: number
      log_date?: string
      delta?: number
      count?: number
    }) => checkinHabit(id, { log_date, delta, count }),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: number) => deleteHabit(id),
    onSuccess: invalidate,
  })

  return {
    create,
    update,
    checkin,
    remove,
  }
}
