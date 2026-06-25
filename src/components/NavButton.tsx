import type { ReactNode } from 'react'

type NavButtonProps = {
  active: boolean
  icon: ReactNode
  label: string
  compact?: boolean
  onClick: () => void
}

function NavButton({ active, compact = false, icon, label, onClick }: NavButtonProps) {
  return (
    <button className={`nav-button group relative ${compact ? 'nav-button-compact' : ''} ${active ? 'nav-button-active' : ''}`} onClick={onClick} aria-label={label}>
      {icon}
      {!compact && <span>{label}</span>}
      {compact && <span className="sidebar-tooltip">{label}</span>}
    </button>
  )
}

export default NavButton
