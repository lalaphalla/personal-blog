import { request } from './http'

export interface ExpenseItem {
  id: number
  amount: number
  currency: string
  category: string
  note: string | null
  expense_date: string
  payment_method: string
  created_at: string
  updated_at: string
}

export interface ExpenseCategorySummary {
  category: string
  total: number
  count: number
  percent: number
}

export interface ExpenseSummary {
  month_total: number
  today_total: number
  count: number
  avg_per_day: number
}

export interface ExpenseListOut {
  month: string
  summary: ExpenseSummary
  by_category: ExpenseCategorySummary[]
  items: ExpenseItem[]
}

export interface ExpenseCreateInput {
  amount: number
  currency?: string
  category?: string
  note?: string | null
  expense_date?: string | null
  payment_method?: string
}

export interface ExpenseUpdateInput {
  amount?: number
  currency?: string
  category?: string
  note?: string | null
  expense_date?: string | null
  payment_method?: string
}

export function listExpenses(params: { month?: string; category?: string } = {}): Promise<ExpenseListOut> {
  const search = new URLSearchParams()
  if (params.month) search.set('month', params.month)
  if (params.category && params.category !== 'all') search.set('category', params.category)
  const query = search.toString()
  return request<ExpenseListOut>(`/admin/expenses${query ? `?${query}` : ''}`)
}

export function createExpense(input: ExpenseCreateInput): Promise<ExpenseItem> {
  return request<ExpenseItem>('/admin/expenses', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateExpense(id: number, input: ExpenseUpdateInput): Promise<ExpenseItem> {
  return request<ExpenseItem>(`/admin/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function deleteExpense(id: number): Promise<void> {
  return request<void>(`/admin/expenses/${id}`, {
    method: 'DELETE',
  })
}
