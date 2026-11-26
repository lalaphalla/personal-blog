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

export function ChevronRightIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="m9 18 6-6-6-6" />
    </StrokeIcon>
  )
}

export function MoreHorizontalIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M5 12h.01M12 12h.01M19 12h.01" />
    </StrokeIcon>
  )
}

export function PanelLeftIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
    </StrokeIcon>
  )
}

export function InboxIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.5 5.5 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.5A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.5Z" />
    </StrokeIcon>
  )
}

export function CloseIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </StrokeIcon>
  )
}

export function SparklesIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="m12 3-1.9 4.8L5.3 9.7l4.8 1.9L12 16.4l1.9-4.8 4.8-1.9-4.8-1.9L12 3Z" />
      <path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
    </StrokeIcon>
  )
}

export function SmileIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth={2.5} />
      <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth={2.5} />
    </StrokeIcon>
  )
}

export function SunIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </StrokeIcon>
  )
}

export function HeartIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </StrokeIcon>
  )
}

export function ChevronLeftIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="m15 18-6-6 6-6" />
    </StrokeIcon>
  )
}

export function RefreshIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </StrokeIcon>
  )
}

export function CameraIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </StrokeIcon>
  )
}

export function QuoteIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 2-1 3-3 4" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 2-1 3-3 4" />
    </StrokeIcon>
  )
}

export function ChevronDownIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="m6 9 6 6 6-6" />
    </StrokeIcon>
  )
}

export function ChevronsLeftIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="m11 17-5-5 5-5m7 10-5-5 5-5" />
    </StrokeIcon>
  )
}

export function ChevronsRightIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="m6 17 5-5-5-5m7 10 5-5-5-5" />
    </StrokeIcon>
  )
}

export function MindmapIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="2" y="9" width="6" height="6" rx="1.5" />
      <rect x="16" y="3" width="6" height="5" rx="1.5" />
      <rect x="16" y="16" width="6" height="5" rx="1.5" />
      <path d="M8 12h4" />
      <path d="M12 5.5v13" />
      <path d="M12 5.5h4" />
      <path d="M12 18.5h4" />
    </StrokeIcon>
  )
}

export function RecallIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="3" y="5" width="14" height="14" rx="2" />
      <path d="M7 5V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2" />
      <path d="M7 10h6" />
      <path d="M7 14h4" />
    </StrokeIcon>
  )
}

export function ReaderIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M4 11a9 9 0 0 1 9 9" />
      <path d="M4 4a16 16 0 0 1 16 16" />
      <circle cx="5" cy="19" r="1" />
    </StrokeIcon>
  )
}

export function BookmarkIcon(props: SvgIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </StrokeIcon>
  )
}



