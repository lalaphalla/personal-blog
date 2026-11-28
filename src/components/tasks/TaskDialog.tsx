import { useState } from 'react'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import type { TaskItem, TaskPriority, TaskUpdateInput } from '../../services/taskApi'

interface TaskDialogProps {
  open: boolean
  onClose: () => void
  task: TaskItem | null
  existingProjects?: string[]
  onSave: (id: number, input: TaskUpdateInput) => Promise<void>
  isSubmitting?: boolean
}

function TaskFormBody({
  onClose,
  task,
  existingProjects = [],
  onSave,
  isSubmitting = false,
}: Omit<TaskDialogProps, 'open'> & { task: TaskItem }) {
  const [title, setTitle] = useState(task.title)
  const [notes, setNotes] = useState(task.notes ?? '')
  const [dueDate, setDueDate] = useState(task.due_date ?? '')
  const [priority, setPriority] = useState<TaskPriority>(task.priority)
  const [project, setProject] = useState(task.project || 'Inbox')
  const [tagsRaw, setTagsRaw] = useState((task.tags ?? []).join(', '))

  const projectSuggestions = Array.from(
    new Set(['Inbox', 'Personal', 'Blog', 'Dev', ...existingProjects]),
  ).slice(0, 8)

  const handleSubmit = async () => {
    if (!title.trim()) return
    const tags = tagsRaw
      .split(/[,\s]+/)
      .map((t) => t.trim().replace(/^#/, '').toLowerCase())
      .filter(Boolean)

    await onSave(task.id, {
      title: title.trim(),
      notes: notes.trim() || null,
      due_date: dueDate || null,
      priority,
      project: project.trim() || 'Inbox',
      tags,
    })
    onClose()
  }

  return (
    <>
      <DialogTitle sx={{ fontWeight: 700 }}>Edit Task</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Title"
            fullWidth
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <TextField
            label="Notes (optional)"
            multiline
            minRows={3}
            maxRows={8}
            fullWidth
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              label="Due Date"
              type="date"
              size="small"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ flex: 1 }}
            />
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              {(
                [
                  { value: 'low', label: 'Low', color: 'default' },
                  { value: 'medium', label: 'Medium', color: 'warning' },
                  { value: 'high', label: 'High', color: 'error' },
                ] as const
              ).map((p) => (
                <Chip
                  key={p.value}
                  label={p.label}
                  variant={priority === p.value ? 'filled' : 'outlined'}
                  color={priority === p.value ? p.color : 'default'}
                  onClick={() => setPriority(p.value)}
                />
              ))}
            </Stack>
          </Stack>

          <Stack spacing={1}>
            <TextField
              label="Project"
              size="small"
              fullWidth
              value={project}
              onChange={(e) => setProject(e.target.value)}
            />
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
              {projectSuggestions.map((proj) => (
                <Chip
                  key={proj}
                  size="small"
                  label={proj}
                  variant={project === proj ? 'filled' : 'outlined'}
                  color={project === proj ? 'primary' : 'default'}
                  onClick={() => setProject(proj)}
                />
              ))}
            </Stack>
          </Stack>

          <TextField
            label="Tags (comma or space separated)"
            size="small"
            fullWidth
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!title.trim() || isSubmitting}
          onClick={handleSubmit}
          sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </>
  )
}

export default function TaskDialog({ open, task, ...props }: TaskDialogProps) {
  return (
    <Dialog open={open} onClose={props.onClose} maxWidth="sm" fullWidth>
      {open && task && <TaskFormBody key={task.id} task={task} {...props} />}
    </Dialog>
  )
}
