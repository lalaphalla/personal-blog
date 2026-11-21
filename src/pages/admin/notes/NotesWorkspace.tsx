import { useState } from 'react'
import { Outlet, useSearchParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import { useMediaQuery, useTheme } from '@mui/material'
import { useNotesScope } from '../../../hooks/useNotesScope'
import {
  getNotesSummary,
  listNotebooks,
} from '../../../services/notesApi'
import NotesListPane from './NotesListPane'
import NotesSidebar from './NotesSidebar'

const RAIL_STORAGE_KEY = 'notes.sidebar.collapsed'

function readRailCollapsed(): boolean {
  try {
    return window.localStorage.getItem(RAIL_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * Desktop notes workspace:
 *   ≥1280px  → rail + list + note
 *   900–1279 → rail + list, note replaces the list when selected
 *   <900px   → list (rail in a drawer) or full-screen note/editor
 */
export default function NotesWorkspace() {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const isWide = useMediaQuery('(min-width:1280px)')
  const [searchParams, setSearchParams] = useSearchParams()
  const [collapsed, setCollapsed] = useState(readRailCollapsed)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const scopeInfo = useNotesScope()
  const { scope, noteId, isEditing, isCreating, scopePath } = scopeInfo
  const activeTag = searchParams.get('tag')

  const { data: summary } = useQuery({
    queryKey: ['admin', 'notes', 'summary'],
    queryFn: getNotesSummary,
    staleTime: 30_000,
  })

  const { data: notebooks } = useQuery({
    queryKey: ['admin', 'notebooks'],
    queryFn: listNotebooks,
  })

  const toggleRail = () => {
    setCollapsed((value) => {
      const next = !value
      try {
        window.localStorage.setItem(RAIL_STORAGE_KEY, next ? '1' : '0')
      } catch {
        // Storage can be unavailable in private modes; collapsing still works.
      }
      return next
    })
  }

  const clearTag = () => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        next.delete('tag')
        return next
      },
      { replace: true },
    )
  }

  const notebook = scope.kind === 'notebook'
    ? notebooks?.find((item) => item.id === scope.id)
    : undefined
  const scopeLabel = notebook?.name ?? scopeInfo.scopeLabel

  const noteOpen = Boolean(noteId) || isEditing || isCreating
  const showRail = isDesktop && !collapsed
  const showList = !isDesktop || isWide || !noteOpen

  const sidebar = (
    <NotesSidebar
      scope={scope}
      summary={summary}
      notebooks={notebooks ?? []}
      activeTag={activeTag}
      onNavigate={isDesktop ? undefined : () => setDrawerOpen(false)}
    />
  )

  const listPane = (
    <NotesListPane
      key={scopePath}
      scope={scope}
      scopeLabel={scopeLabel}
      scopePath={scopePath}
      selectedNoteId={noteId}
      notebooks={notebooks ?? []}
      summary={summary}
      activeTag={activeTag}
      onClearTag={clearTag}
      showSidebarToggle
      onToggleSidebar={() => (isDesktop ? toggleRail() : setDrawerOpen(true))}
    />
  )

  if (!isDesktop) {
    return (
      <Box sx={{ height: { xs: 'calc(100dvh - 56px)', sm: 'calc(100dvh - 64px)' }, minHeight: 0 }}>
        {noteOpen ? (
          <Outlet />
        ) : (
          <Box sx={{ height: '100%', minHeight: 0 }}>{listPane}</Box>
        )}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          slotProps={{
            paper: {
              sx: { width: 288, maxWidth: '85vw' },
            },
          }}
        >
          <Box sx={{ height: '100%' }}>{sidebar}</Box>
        </Drawer>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        height: 'calc(100dvh - 64px)',
        minHeight: 0,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      {showRail ? (
        <Box
          sx={{
            width: 240,
            flexShrink: 0,
            minHeight: 0,
            borderRight: '1px solid',
            borderColor: 'divider',
          }}
        >
          {sidebar}
        </Box>
      ) : null}

      {showList ? (
        <Box
          sx={{
            width: 320,
            flexShrink: 0,
            minHeight: 0,
            borderRight: '1px solid',
            borderColor: 'divider',
          }}
        >
          {listPane}
        </Box>
      ) : null}

      <Box sx={{ flex: 1, minWidth: 0, minHeight: 0 }}>
        <Outlet />
      </Box>
    </Box>
  )
}
