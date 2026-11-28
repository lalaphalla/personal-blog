import { request } from './http'

export type GoalStatus = 'active' | 'completed' | 'paused'
export type GoalColor = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'purple'

export interface GoalMilestone {
  id: number
  goal_id: number
  title: string
  is_done: boolean
  position: number
  due_date: string | null
  completed_at: string | null
  created_at: string
}

export interface GoalItem {
  id: number
  title: string
  description: string | null
  category: string
  color: GoalColor
  timeframe: string | null
  target_date: string | null
  status: GoalStatus
  manual_progress: number | null
  progress: number
  milestones_total: number
  milestones_done: number
  milestones: GoalMilestone[]
  created_at: string
  updated_at: string
}

export interface GoalSummary {
  total: number
  active: number
  completed: number
  paused: number
  avg_progress: number
}

export interface GoalListOut {
  summary: GoalSummary
  items: GoalItem[]
}

export interface GoalMilestoneCreateInput {
  title: string
  due_date?: string | null
  position?: number
}

export interface GoalCreateInput {
  title: string
  description?: string | null
  category?: string
  color?: GoalColor
  timeframe?: string | null
  target_date?: string | null
  status?: GoalStatus
  manual_progress?: number | null
  milestones?: GoalMilestoneCreateInput[]
}

export interface GoalUpdateInput {
  title?: string
  description?: string | null
  category?: string
  color?: GoalColor
  timeframe?: string | null
  target_date?: string | null
  status?: GoalStatus
  manual_progress?: number | null
}

export function listGoals(status: GoalStatus | 'all' = 'all'): Promise<GoalListOut> {
  const query = status === 'all' ? '' : `?status=${encodeURIComponent(status)}`
  return request<GoalListOut>(`/admin/goals${query}`)
}

export function createGoal(input: GoalCreateInput): Promise<GoalItem> {
  return request<GoalItem>('/admin/goals', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateGoal(id: number, input: GoalUpdateInput): Promise<GoalItem> {
  return request<GoalItem>(`/admin/goals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function deleteGoal(id: number): Promise<void> {
  return request<void>(`/admin/goals/${id}`, {
    method: 'DELETE',
  })
}

export function addMilestone(
  goalId: number,
  input: GoalMilestoneCreateInput,
): Promise<GoalItem> {
  return request<GoalItem>(`/admin/goals/${goalId}/milestones`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function toggleMilestone(goalId: number, milestoneId: number): Promise<GoalItem> {
  return request<GoalItem>(`/admin/goals/${goalId}/milestones/${milestoneId}/toggle`, {
    method: 'POST',
  })
}

export function deleteMilestone(goalId: number, milestoneId: number): Promise<GoalItem> {
  return request<GoalItem>(`/admin/goals/${goalId}/milestones/${milestoneId}`, {
    method: 'DELETE',
  })
}
