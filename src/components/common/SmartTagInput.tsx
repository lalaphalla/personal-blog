import { useState, type ClipboardEvent, type KeyboardEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import Autocomplete from '@mui/material/Autocomplete'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import { request } from '../../services/http'

export interface SmartTagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  label?: string
  disabled?: boolean
  size?: 'small' | 'medium'
  fullWidth?: boolean
}

function cleanTag(raw: string): string {
  return raw
    .replace(/^#+/, '')
    .replace(/^tags?:/i, '')
    .replace(/[:]+$/, '')
    .trim()
    .toLowerCase()
}

function cleanTags(list: string[]): string[] {
  const result: string[] = []
  const seen = new Set<string>()
  for (const item of list) {
    const t = cleanTag(item)
    if (t && !seen.has(t)) {
      seen.add(t)
      result.push(t)
    }
  }
  return result
}

export default function SmartTagInput({
  value = [],
  onChange,
  placeholder = 'Add tags (e.g. #book, #fiction)…',
  label = 'Tags',
  disabled = false,
  size = 'small',
  fullWidth = true,
}: SmartTagInputProps) {
  const [inputValue, setInputValue] = useState('')

  const { data: tagData } = useQuery({
    queryKey: ['admin', 'notes', 'tags'],
    queryFn: () => request<{ tags: string[] }>('/admin/notes/tags'),
    staleTime: 60_000,
  })

  const availableTags = tagData?.tags || []

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    const text = e.clipboardData.getData('text')
    if (text.includes('#') || text.includes(',') || text.includes(' ')) {
      e.preventDefault()
      const rawTokens = text.split(/[\s,]+/)
      const nextTags = cleanTags([...value, ...rawTokens])
      onChange(nextTags)
      setInputValue('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ',') {
      e.preventDefault()
      if (inputValue.trim()) {
        const nextTags = cleanTags([...value, inputValue])
        onChange(nextTags)
        setInputValue('')
      }
    }
  }

  return (
    <Autocomplete<string, true, false, true>
      multiple
      freeSolo
      disabled={disabled}
      size={size}
      fullWidth={fullWidth}
      options={availableTags}
      value={value}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
      onChange={(_, nextValues) => {
        const values = Array.isArray(nextValues)
          ? nextValues.map((v) => (typeof v === 'string' ? v : String(v)))
          : []
        onChange(cleanTags(values))
      }}
      renderValue={(selected, getItemProps) =>
        selected.map((option, index) => {
          const { key, ...itemProps } = getItemProps({ index })
          return (
            <Chip
              key={key}
              {...itemProps}
              label={`#${option}`}
              size={size}
              sx={{
                height: 24,
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 1.5,
              }}
            />
          )
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={value.length === 0 ? placeholder : undefined}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
        />
      )}
    />
  )
}
