import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import {
  BookOpenIcon,
  ExternalLinkIcon,
  ExpensesIcon,
  FileTextIcon,
  GoalsIcon,
  HabitsIcon,
  ImageIcon,
  LayoutDashboardIcon,
  MindmapIcon,
  NewspaperIcon,
  ReaderIcon,
  RecallIcon,
  TasksIcon,
} from './DocIcons'
import { adminListPosts } from '../services/adminApi'
import { listHabits } from '../services/habitApi'
import { listNotes } from '../services/notesApi'
import { listTasks } from '../services/taskApi'

interface CommandItem {
  id: string
  group: 'Quick Actions' | 'Navigation' | 'Notes' | 'Tasks' | 'Habits' | 'Posts'
  label: string
  subtitle?: string
  keywords?: string
  to: string
  icon: ReactNode
}

const STATIC_COMMANDS: CommandItem[] = [
  // Quick Actions
  {
    id: 'action-new-post',
    group: 'Quick Actions',
    label: 'New Blog Post',
    subtitle: 'Create a new article',
    keywords: 'create write article blog',
    to: '/admin/posts/new',
    icon: <AddIcon fontSize="small" />,
  },
  {
    id: 'action-new-note',
    group: 'Quick Actions',
    label: 'New Note',
    subtitle: 'Capture a quick note',
    keywords: 'create write memo',
    to: '/admin/notes/new',
    icon: <AddIcon fontSize="small" />,
  },
  {
    id: 'action-new-journal',
    group: 'Quick Actions',
    label: 'New Journal Entry',
    subtitle: 'Log today’s reflection',
    keywords: 'create diary daily log',
    to: '/admin/journal/new',
    icon: <AddIcon fontSize="small" />,
  },
  {
    id: 'action-recall-review',
    group: 'Quick Actions',
    label: 'Start Recall Review',
    subtitle: 'Review due flashcards',
    keywords: 'flashcards spaced repetition study',
    to: '/admin/recall',
    icon: <RecallIcon />,
  },
  {
    id: 'action-view-blog',
    group: 'Quick Actions',
    label: 'View Public Blog',
    subtitle: 'Open /blog',
    keywords: 'public site preview',
    to: '/blog',
    icon: <ExternalLinkIcon />,
  },
  // Navigation
  {
    id: 'nav-dashboard',
    group: 'Navigation',
    label: 'Dashboard (Today)',
    keywords: 'home overview command center',
    to: '/admin',
    icon: <LayoutDashboardIcon />,
  },
  {
    id: 'nav-posts',
    group: 'Navigation',
    label: 'Posts',
    keywords: 'blog articles drafts',
    to: '/admin/posts',
    icon: <NewspaperIcon />,
  },
  {
    id: 'nav-notes',
    group: 'Navigation',
    label: 'Notes',
    keywords: 'notebooks markdown',
    to: '/admin/notes',
    icon: <FileTextIcon />,
  },
  {
    id: 'nav-journal',
    group: 'Navigation',
    label: 'Journal',
    keywords: 'diary calendar memories',
    to: '/admin/journal',
    icon: <BookOpenIcon />,
  },
  {
    id: 'nav-journal-calendar',
    group: 'Navigation',
    label: 'Journal Calendar',
    keywords: 'month dates entries',
    to: '/admin/journal/calendar',
    icon: <BookOpenIcon />,
  },
  {
    id: 'nav-quotes',
    group: 'Navigation',
    label: 'Quotes',
    keywords: 'daily quote inspiration',
    to: '/admin/journal/quotes',
    icon: <BookOpenIcon />,
  },
  {
    id: 'nav-mindmaps',
    group: 'Navigation',
    label: 'Mindmaps',
    keywords: 'diagrams graph nodes',
    to: '/admin/mindmaps',
    icon: <MindmapIcon />,
  },
  {
    id: 'nav-recall-cards',
    group: 'Navigation',
    label: 'Recall Cards',
    keywords: 'flashcards deck manage',
    to: '/admin/recall/cards',
    icon: <RecallIcon />,
  },
  {
    id: 'nav-reader',
    group: 'Navigation',
    label: 'Reader',
    keywords: 'rss hacker news bookmarks',
    to: '/admin/reader',
    icon: <ReaderIcon />,
  },
  {
    id: 'nav-tasks',
    group: 'Navigation',
    label: 'Tasks',
    keywords: 'todo checklist due',
    to: '/admin/tasks',
    icon: <TasksIcon />,
  },
  {
    id: 'nav-habits',
    group: 'Navigation',
    label: 'Habits',
    keywords: 'streak tracker daily',
    to: '/admin/habits',
    icon: <HabitsIcon />,
  },
  {
    id: 'nav-goals',
    group: 'Navigation',
    label: 'Goals & Milestones',
    keywords: 'quarterly yearly targets progress',
    to: '/admin/goals',
    icon: <GoalsIcon />,
  },
  {
    id: 'nav-expenses',
    group: 'Navigation',
    label: 'Expenses',
    keywords: 'spending money budget finance',
    to: '/admin/expenses',
    icon: <ExpensesIcon />,
  },
  {
    id: 'nav-media',
    group: 'Navigation',
    label: 'Media',
    keywords: 'images uploads gallery',
    to: '/admin/media',
    icon: <ImageIcon />,
  },
]

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const trimmed = query.trim()
  const searchEnabled = open && trimmed.length >= 2

  const notesQuery = useQuery({
    queryKey: ['cmd-palette', 'notes', trimmed],
    queryFn: () => listNotes({ search: trimmed, limit: 5 }),
    enabled: searchEnabled,
    staleTime: 30_000,
  })

  const tasksQuery = useQuery({
    queryKey: ['cmd-palette', 'tasks'],
    queryFn: () => listTasks({ view: 'all' }),
    enabled: searchEnabled,
    staleTime: 30_000,
  })

  const habitsQuery = useQuery({
    queryKey: ['cmd-palette', 'habits'],
    queryFn: () => listHabits(false),
    enabled: searchEnabled,
    staleTime: 30_000,
  })

  const postsQuery = useQuery({
    queryKey: ['cmd-palette', 'posts'],
    queryFn: () => adminListPosts({ limit: 50 }),
    enabled: searchEnabled,
    staleTime: 30_000,
  })

  const items = useMemo<CommandItem[]>(() => {
    const q = trimmed.toLowerCase()
    const staticMatches = q
      ? STATIC_COMMANDS.filter((cmd) => {
          const haystack = `${cmd.label} ${cmd.subtitle ?? ''} ${cmd.keywords ?? ''} ${cmd.group}`.toLowerCase()
          return haystack.includes(q)
        })
      : STATIC_COMMANDS

    if (!searchEnabled) {
      return staticMatches
    }

    const noteItems: CommandItem[] = (notesQuery.data ?? []).slice(0, 5).map((note) => ({
      id: `note-${note.id}`,
      group: 'Notes',
      label: note.title || 'Untitled note',
      subtitle: note.tags.length > 0 ? note.tags.map((t) => `#${t}`).join(' ') : undefined,
      to: `/admin/notes/${note.id}`,
      icon: <FileTextIcon />,
    }))

    const taskItems: CommandItem[] = (tasksQuery.data?.items ?? [])
      .filter((t) => t.title.toLowerCase().includes(q))
      .slice(0, 5)
      .map((task) => ({
        id: `task-${task.id}`,
        group: 'Tasks',
        label: task.title,
        subtitle: task.is_completed ? 'Completed' : task.due_date ? `Due ${task.due_date}` : task.priority,
        to: '/admin/tasks',
        icon: <TasksIcon />,
      }))

    const habitItems: CommandItem[] = (habitsQuery.data?.items ?? [])
      .filter((h) => h.name.toLowerCase().includes(q))
      .slice(0, 5)
      .map((habit) => ({
        id: `habit-${habit.id}`,
        group: 'Habits',
        label: `${habit.emoji} ${habit.name}`,
        subtitle: `${habit.current_streak}d streak`,
        to: '/admin/habits',
        icon: <HabitsIcon />,
      }))

    const postItems: CommandItem[] = (postsQuery.data?.items ?? [])
      .filter((p) => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q))
      .slice(0, 5)
      .map((post) => ({
        id: `post-${post.id}`,
        group: 'Posts',
        label: post.title,
        subtitle: post.status,
        to: `/admin/posts/${post.id}/edit`,
        icon: <NewspaperIcon />,
      }))

    return [...staticMatches, ...noteItems, ...taskItems, ...habitItems, ...postItems]
  }, [trimmed, searchEnabled, notesQuery.data, tasksQuery.data, habitsQuery.data, postsQuery.data])

  const safeIndex = items.length > 0 ? Math.min(activeIndex, items.length - 1) : 0
  const isSearching =
    searchEnabled &&
    (notesQuery.isFetching || tasksQuery.isFetching || habitsQuery.isFetching || postsQuery.isFetching)

  const handleClose = () => {
    setQuery('')
    setActiveIndex(0)
    onClose()
  }

  const handleSelect = (item: CommandItem) => {
    handleClose()
    navigate(item.to)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (items.length > 0) {
        setActiveIndex((prev) => (prev + 1) % items.length)
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (items.length > 0) {
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length)
      }
    } else if (e.key === 'Enter') {
      const target = items[safeIndex]
      if (target) {
        e.preventDefault()
        handleSelect(target)
      }
    }
  }

  const grouped = useMemo(() => {
    const groups: Array<{ title: CommandItem['group']; entries: Array<{ item: CommandItem; flatIndex: number }> }> = []
    const map = new Map<CommandItem['group'], Array<{ item: CommandItem; flatIndex: number }>>()

    items.forEach((item, flatIndex) => {
      const list = map.get(item.group) ?? []
      list.push({ item, flatIndex })
      if (!map.has(item.group)) {
        map.set(item.group, list)
        groups.push({ title: item.group, entries: list })
      }
    })

    return groups
  }, [items])

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      onKeyDown={handleKeyDown}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2.5,
            overflow: 'hidden',
          },
        },
      }}
    >
      <Box sx={{ p: 1.5 }}>
        <TextField
          autoFocus
          fullWidth
          size="small"
          placeholder="Type a command or search notes, tasks, habits, posts…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActiveIndex(0)
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                    {isSearching && <CircularProgress size={14} />}
                    <Chip label="Esc" size="small" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
                  </Stack>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
      <Divider />

      <Box sx={{ maxHeight: 420, overflowY: 'auto', px: 1, py: 0.75 }}>
        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            No matching commands or items.
          </Typography>
        ) : (
          grouped.map((group) => (
            <Box key={group.title} sx={{ mb: 1 }}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ px: 1.5, py: 0.5, display: 'block', lineHeight: 1.4, fontWeight: 700 }}
              >
                {group.title}
              </Typography>
              <List dense disablePadding>
                {group.entries.map(({ item, flatIndex }) => {
                  const selected = flatIndex === safeIndex
                  return (
                    <ListItemButton
                      key={item.id}
                      selected={selected}
                      onMouseEnter={() => setActiveIndex(flatIndex)}
                      onClick={() => handleSelect(item)}
                      sx={{ borderRadius: 1.5, mb: 0.25 }}
                    >
                      <ListItemIcon sx={{ minWidth: 34, color: selected ? 'primary.main' : 'text.secondary' }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        secondary={item.subtitle}
                        slotProps={{
                          primary: { noWrap: true, variant: 'body2', sx: { fontWeight: 500 } },
                          secondary: { noWrap: true, variant: 'caption' },
                        }}
                      />
                    </ListItemButton>
                  )
                })}
              </List>
            </Box>
          ))
        )}
      </Box>

      <Divider />
      <Stack
        direction="row"
        spacing={2}
        sx={{ px: 2, py: 1, bgcolor: 'action.hover', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Typography variant="caption" color="text.secondary">
          ↑↓ Navigate · ↵ Open · Esc Close
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {trimmed.length < 2 ? 'Type 2+ chars to search items' : `${items.length} results`}
        </Typography>
      </Stack>
    </Dialog>
  )
}
