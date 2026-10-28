import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { getErrorMessage } from '../../config/queryClient'
import { login } from '../../services/authApi'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  const loginMutation = useMutation({
    mutationFn: ({ username, password }: LoginForm) => login(username, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      const from = (location.state as { from?: string } | null)?.from ?? '/admin'
      navigate(from, { replace: true })
    },
    onError: (error) => setFormError(getErrorMessage(error)),
  })

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'grey.50',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 380 }}>
        <Box component="form" onSubmit={handleSubmit((values) => {
          setFormError(null)
          loginMutation.mutate(values)
        })} sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h5" component="h1" sx={{ mb: 1 }}>
            Blog Admin
          </Typography>

          {formError ? (
            <Alert severity="error" role="alert">
              {formError}
            </Alert>
          ) : null}

          <TextField
            label="Username"
            autoComplete="username"
            autoFocus
            error={Boolean(errors.username)}
            helperText={errors.username?.message}
            {...register('username')}
          />
          <TextField
            type="password"
            label="Password"
            autoComplete="current-password"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            {...register('password')}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loginMutation.isPending}
            sx={{ mt: 1 }}
          >
            {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </Box>
      </Card>
    </Box>
  )
}

export default LoginPage
