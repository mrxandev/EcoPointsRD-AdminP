import type { ReactNode } from 'react'

type TableActionButtonProps = {
  children: ReactNode
  danger?: boolean
  disabled?: boolean
  label: string
  onClick: () => void
}

function TableActionButton({ children, danger = false, disabled = false, label, onClick }: TableActionButtonProps) {
  return (
    <button
      className={`table-icon-button table-action-tooltip ${danger ? 'table-icon-danger' : ''}`}
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
      <span>{label}</span>
    </button>
  )
}

export default TableActionButton
