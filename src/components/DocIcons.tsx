import type { ReactNode } from 'react'
import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon'

type StrokeIconProps = SvgIconProps & { children: ReactNode }

/** Shared frame for the lightweight stroke icons used by the notes workspace. */
function StrokeIcon({ children, ...props }: StrokeIconProps) {
  return (
    <SvgIcon
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      fontSize="small"
      {...props}
    >
      {children}
    </SvgIcon>
  )
}

const STAR_PATH = 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z'

export function ArrowLeftIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </StrokeIcon>
  )
}

export function StarIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d={STAR_PATH} />
    </StrokeIcon>
  )
}

export function StarFilledIcon(props: SvgIconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" fontSize="small" {...props}>
      <path d={STAR_PATH} />
    </SvgIcon>
  )
}

export function ArchiveIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M21 8v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8" />
      <path d="M2 4h20v4H2z" />
      <path d="M10 12h4" />
    </StrokeIcon>
  )
}

export function EditIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
    </StrokeIcon>
  )
}

export function CopyIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </StrokeIcon>
  )
}

export function BookOpenIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2Z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7Z" />
    </StrokeIcon>
  )
}

export function TagIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8Z" />
      <path d="M7 7h.01" />
    </StrokeIcon>
  )
}

export function CalendarIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </StrokeIcon>
  )
}

export function HashIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" />
    </StrokeIcon>
  )
}

export function ClockIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </StrokeIcon>
  )
}

export function FileTextIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6M8 13h8M8 17h8" />
    </StrokeIcon>
  )
}

export function ListIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </StrokeIcon>
  )
}

export function SearchIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </StrokeIcon>
  )
}

export function TrashIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />
    </StrokeIcon>
  )
}

export function PlusIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M12 5v14M5 12h14" />
    </StrokeIcon>
  )
}

export function CheckIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M20 6 9 17l-5-5" />
    </StrokeIcon>
  )
}

export function EyeIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </StrokeIcon>
  )
}

export function MenuIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </StrokeIcon>
  )
}

export function LayoutDashboardIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </StrokeIcon>
  )
}

export function NewspaperIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V9" />
      <path d="M10 6h8v4h-8zM18 14h-8M18 18h-8" />
    </StrokeIcon>
  )
}

export function ImageIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </StrokeIcon>
  )
}

export function LogOutIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </StrokeIcon>
  )
}

export function ExternalLinkIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6M10 14 21 3" />
    </StrokeIcon>
  )
}
