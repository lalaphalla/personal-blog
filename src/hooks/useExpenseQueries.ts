import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createExpense,
  deleteExpense,
  listExpenses,
  updateExpense,
  type ExpenseCreateInput,
  type ExpenseUpdateInput,
} from '../services/expenseApi'

export const expenseKeys = {
  all: ['expenses'] as const,
  list: (month?: string, category?: string) =>
    [...expenseKeys.all, month ?? 'current', category ?? 'all'] as const,
}

export function useExpenses(month?: string, category?: string) {
  return useQuery({
    queryKey: expenseKeys.list(month, category),
    queryFn: () => listExpenses({ month, category }),
  })
}

export function useExpenseMutations() {
  const qc = useQueryClient()

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: expenseKeys.all })
  }

  const create = useMutation({
    mutationFn: (input: ExpenseCreateInput) => createExpense(input),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: ExpenseUpdateInput }) =>
      updateExpense(id, input),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: number) => deleteExpense(id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
