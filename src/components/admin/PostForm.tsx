import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import MarkdownEditor from './MarkdownEditor'
import type { Post } from '../../types/blog'

const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z
    .string()
    .max(200, 'Slug must be 200 characters or fewer')
    .regex(/^[\w-]*$/, 'Only letters, numbers, hyphens, and underscores')
    .optional()
    .or(z.literal('')),
  description: z.string().max(500, 'Description must be 500 characters or fewer').optional(),
  category: z.string().max(100, 'Category must be 100 characters or fewer').optional(),
  cover_url: z
    .string()
    .max(500, 'Cover URL must be 500 characters or fewer')
    .refine((v) => v === '' || /^https?:\/\/\S+$/.test(v), 'Must be a valid http(s) URL')
    .optional(),
  tags: z.string().optional(),
  content: z.string().optional(),
})

export type PostFormValues = z.infer<typeof postSchema>

export interface PostFormSubmit {
  title: string
  slug?: string
  description?: string
  category?: string
  cover_url?: string
  tags: string[]
  content: string
}

interface PostFormProps {
  post?: Post
  onSubmit: (values: PostFormSubmit) => void
  submitLabel: string
  isSubmitting: boolean
  error?: string | null
}

function parseTags(value?: string): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function PostForm({ post, onSubmit, submitLabel, isSubmitting, error }: PostFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post?.title ?? '',
      slug: post?.slug ?? '',
      description: post?.description ?? '',
      category: post?.category ?? '',
      cover_url: post?.cover_url ?? '',
      tags: post?.tags.join(', ') ?? '',
      content: post?.content ?? '',
    },
  })

  return (
    <Box component="form" onSubmit={handleSubmit((values) => {
      onSubmit({
        title: values.title,
        slug: values.slug || undefined,
        description: values.description || undefined,
        category: values.category || undefined,
        cover_url: values.cover_url || undefined,
        tags: parseTags(values.tags),
        content: values.content ?? '',
      })
    })}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2}>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Title"
              fullWidth
              required
              error={Boolean(errors.title)}
              helperText={errors.title?.message}
            />
          )}
        />

        <Controller
          name="slug"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Slug"
              fullWidth
              placeholder="auto-generated from title if empty"
              error={Boolean(errors.slug)}
              helperText={errors.slug?.message}
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Description"
              fullWidth
              multiline
              minRows={2}
              error={Boolean(errors.description)}
              helperText={errors.description?.message}
            />
          )}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Category"
                fullWidth
                error={Boolean(errors.category)}
                helperText={errors.category?.message}
              />
            )}
          />
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Tags"
                fullWidth
                placeholder="comma, separated"
                error={Boolean(errors.tags)}
                helperText={errors.tags?.message}
              />
            )}
          />
        </Stack>

        <Controller
          name="cover_url"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Cover image URL"
              fullWidth
              placeholder="https://…"
              error={Boolean(errors.cover_url)}
              helperText={errors.cover_url?.message}
            />
          )}
        />

        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <MarkdownEditor
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.content?.message}
            />
          )}
        />

        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}

export default PostForm
