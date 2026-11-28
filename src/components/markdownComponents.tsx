import Box from '@mui/material/Box'
import type { Components } from 'react-markdown'

/** Shared react-markdown components (wraps tables for mobile horizontal scrolling). */
export const sharedMarkdownComponents: Components = {
  table: ({ children, ...props }) => (
    <Box
      sx={{
        width: '100%',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        my: 2,
      }}
    >
      <table {...props}>{children}</table>
    </Box>
  ),
}
