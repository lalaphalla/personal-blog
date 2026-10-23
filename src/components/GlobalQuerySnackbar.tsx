import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import { subscribeGlobalErrors, type GlobalErrorEvent } from '../config/queryClient'

function GlobalQuerySnackbar() {
  const [event, setEvent] = useState<GlobalErrorEvent | null>(null)

  useEffect(() => subscribeGlobalErrors(setEvent), [])

  const close = () => setEvent(null)

  const retry = () => {
    if (!event) return
    event.retry()
    close()
  }

  return (
    <Snackbar
      open={event !== null}
      autoHideDuration={6000}
      onClose={close}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        severity="error"
        variant="filled"
        onClose={close}
        action={
          event ? (
            <Button color="inherit" size="small" onClick={retry}>
              Retry
            </Button>
          ) : null
        }
      >
        {event?.message}
      </Alert>
    </Snackbar>
  )
}

export default GlobalQuerySnackbar
