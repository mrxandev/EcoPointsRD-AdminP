import type { ReactNode } from 'react'
import { FiX } from 'react-icons/fi'

type ModalProps = {
  children: ReactNode
  open: boolean
  title: string
  onClose: () => void
}

function Modal({ children, open, title, onClose }: ModalProps) {
  if (!open) return null

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-panel">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="icon-tab" onClick={onClose} aria-label="Cerrar modal"><FiX /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export default Modal
