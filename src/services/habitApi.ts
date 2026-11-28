import { request } from './http'

export type HabitColor = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'purple'

export interface HabitDayStatus {
  date: string
  count: number
  completed: boolean
  scheduled: boolean
}

export interface HabitItem {
  id: number
  name: string
  description: string | null
  emoji: string
  color: HabitColor
  target_per_day: number
  schedule_days: number[]
  is_archived: boolean
  today_count: number
  completed_today: boolean
  is_scheduled_today: boolean
  current_streak: number
  best_streak: number
  completion_rate_30d: number
  last_7_days: HabitDayStatus[]
  last_30_days: HabitDayStatus[]
  created_at: string
  updated_at: string
}

export interface HabitSummary {
  total_active: number
  scheduled_today: number
  completed_today: number
  best_active_streak: number
  avg_rate_30d: number
}

export interface HabitListOut {
  summary: HabitSummary
  items: HabitItem[]
}

export interface HabitCreateInput {
  name: string
  description?: string | null
  emoji?: string
  color?: HabitColor
  target_per_day?: number
  schedule_days?: number[]
}

export interface HabitUpdateInput {
  name?: string
  description?: string | null
  emoji?: string
  color?: HabitColor
  target_per_day?: number
  schedule_days?: number[]
  is_archived?: boolean
}

export function listHabits(includeArchived = false): Promise<HabitListOut> {
  const qs = includeArchived ? '?include_archived=true' : ''
  return request<HabitListOut>(`/admin/habits${qs}`)
}

export function createHabit(input: HabitCreateInput): Promise<HabitItem> {
  return request<HabitItem>('/admin/habits', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateHabit(id: number, input: HabitUpdateInput): Promise<HabitItem> {
  return request<HabitItem>(`/admin/habits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function checkinHabit(
  id: number,
  input: { log_date?: string; delta?: number; count?: number } = {},
): Promise<HabitItem> {
  return request<HabitItem>(`/admin/habits/${id}/checkin`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function deleteHabit(id: number): Promise<void> {
  return request<void>(`/admin/habits/${id}`, { method: 'DELETE' })
}
