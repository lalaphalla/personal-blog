import { useState, type FormEvent } from 'react'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { PlusIcon } from '../DocIcons'
import type { TaskCreateInput, TaskPriority } from '../../services/taskApi'

interface TaskQuickAddProps {
  onAdd: (input: TaskCreateInput) => Promise<void>
  defaultDueDate?: string | null
  defaultProject?: string
  existingProjects?: string[]
  isSubmitting?: boolean
}

function isoToday(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function TaskQuickAdd({
  onAdd,
  defaultDueDate = null,
  defaultProject = 'Inbox',
  existingProjects = [],
  isSubmitting = false,
}: TaskQuickAddProps) {
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState<string>(defaultDueDate ?? isoToday(0))
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [project, setProject] = useState(defaultProject)

  const todayStr = isoToday(0)
  const tomorrowStr = isoToday(1)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    await onAdd({
      title: title.trim(),
      due_date: dueDate || null,
      priority,
      project: project.trim() || 'Inbox',
    })
    setTitle('')
  }

  const projectSuggestions = Array.from(
    new Set(['Inbox', 'Personal', 'Blog', 'Dev', ...existingProjects]),
  ).slice(0, 6)

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            fullWidth
            placeholder="Quick add a task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            startIcon={<PlusIcon />}
            disabled={!title.trim() || isSubmitting}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, flexShrink: 0 }}
          >
            Add
          </Button>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}
        >
          <Chip
            size="small"
            label="Today"
            variant={dueDate === todayStr ? 'filled' : 'outlined'}
            color={dueDate === todayStr ? 'primary' : 'default'}
            onClick={() => setDueDate(todayStr)}
          />
          <Chip
            size="small"
            label="Tomorrow"
            variant={dueDate === tomorrowStr ? 'filled' : 'outlined'}
            color={dueDate === tomorrowStr ? 'primary' : 'default'}
            onClick={() => setDueDate(tomorrowStr)}
          />
          <Chip
            size="small"
            label="No Date"
            variant={!dueDate ? 'filled' : 'outlined'}
            color={!dueDate ? 'primary' : 'default'}
            onClick={() => setDueDate('')}
          />

          <TextField
            type="date"
            size="small"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            sx={{ width: 140 }}
          />

          {(
            [
              { value: 'low', label: 'Low', color: 'default' },
              { value: 'medium', label: 'Med', color: 'warning' },
              { value: 'high', label: 'High', color: 'error' },
            ] as const
          ).map((p) => (
            <Chip
              key={p.value}
              size="small"
              label={p.label}
              variant={priority === p.value ? 'filled' : 'outlined'}
              color={priority === p.value ? p.color : 'default'}
              onClick={() => setPriority(p.value)}
            />
          ))}

          {projectSuggestions.map((proj) => (
            <Chip
              key={proj}
              size="small"
              label={proj}
              variant={project === proj ? 'filled' : 'outlined'}
              color={project === proj ? 'secondary' : 'default'}
              onClick={() => setProject(proj)}
            />
          ))}
        </Stack>
      </Stack>
    </Paper>
  )
}
