import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addMilestone,
  createGoal,
  deleteGoal,
  deleteMilestone,
  listGoals,
  toggleMilestone,
  updateGoal,
  type GoalCreateInput,
  type GoalMilestoneCreateInput,
  type GoalStatus,
  type GoalUpdateInput,
} from '../services/goalApi'

export const goalKeys = {
  all: ['goals'] as const,
  list: (status: GoalStatus | 'all') => [...goalKeys.all, status] as const,
}

export function useGoals(status: GoalStatus | 'all' = 'all') {
  return useQuery({
    queryKey: goalKeys.list(status),
    queryFn: () => listGoals(status),
  })
}

export function useGoalMutations() {
  const qc = useQueryClient()

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: goalKeys.all })
  }

  const create = useMutation({
    mutationFn: (input: GoalCreateInput) => createGoal(input),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: GoalUpdateInput }) =>
      updateGoal(id, input),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: number) => deleteGoal(id),
    onSuccess: invalidate,
  })

  const createMilestone = useMutation({
    mutationFn: ({
      goalId,
      input,
    }: {
      goalId: number
      input: GoalMilestoneCreateInput
    }) => addMilestone(goalId, input),
    onSuccess: invalidate,
  })

  const toggle = useMutation({
    mutationFn: ({ goalId, milestoneId }: { goalId: number; milestoneId: number }) =>
      toggleMilestone(goalId, milestoneId),
    onSuccess: invalidate,
  })

  const removeMilestone = useMutation({
    mutationFn: ({ goalId, milestoneId }: { goalId: number; milestoneId: number }) =>
      deleteMilestone(goalId, milestoneId),
    onSuccess: invalidate,
  })

  return {
    create,
    update,
    remove,
    createMilestone,
    toggle,
    removeMilestone,
  }
}
