import { request } from './http'

export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskView = 'today' | 'upcoming' | 'all' | 'completed' | 'trash'

export interface TaskItem {
  id: number
  title: string
  notes: string | null
  due_date: string | null
  priority: TaskPriority
  project: string
  tags: string[]
  is_completed: boolean
  completed_at: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface TaskListOut {
  items: TaskItem[]
  total: number
}

export interface TaskProjectCount {
  name: string
  open_count: number
}

export interface TaskStats {
  today: number
  overdue: number
  upcoming: number
  all_open: number
  completed: number
  projects: TaskProjectCount[]
}

export interface TaskCreateInput {
  title: string
  notes?: string | null
  due_date?: string | null
  priority?: TaskPriority
  project?: string
  tags?: string[]
}

export interface TaskUpdateInput {
  title?: string
  notes?: string | null
  due_date?: string | null
  priority?: TaskPriority
  project?: string
  tags?: string[]
  is_completed?: boolean
}

export interface TaskListParams {
  view?: TaskView
  project?: string
  priority?: TaskPriority
  q?: string
}

export function getTaskStats(): Promise<TaskStats> {
  return request<TaskStats>('/admin/tasks/stats')
}

export function listTasks(params: TaskListParams = {}): Promise<TaskListOut> {
  const search = new URLSearchParams()
  if (params.view) search.set('view', params.view)
  if (params.project) search.set('project', params.project)
  if (params.priority) search.set('priority', params.priority)
  if (params.q) search.set('q', params.q)
  const qs = search.toString()
  return request<TaskListOut>(`/admin/tasks${qs ? `?${qs}` : ''}`)
}

export function createTask(input: TaskCreateInput): Promise<TaskItem> {
  return request<TaskItem>('/admin/tasks', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateTask(id: number, input: TaskUpdateInput): Promise<TaskItem> {
  return request<TaskItem>(`/admin/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function toggleTaskComplete(id: number): Promise<TaskItem> {
  return request<TaskItem>(`/admin/tasks/${id}/toggle`, { method: 'POST' })
}

export function deleteTask(id: number): Promise<void> {
  return request<void>(`/admin/tasks/${id}`, { method: 'DELETE' })
}

export function restoreTask(id: number): Promise<TaskItem> {
  return request<TaskItem>(`/admin/tasks/${id}/restore`, { method: 'POST' })
}

export function purgeTask(id: number): Promise<void> {
  return request<void>(`/admin/tasks/${id}/permanent`, { method: 'DELETE' })
}
