import { useEffect } from 'react'
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi'

export type ToastTone = 'info' | 'success' | 'error'

export type ToastMessage = {
  id: number
  message: string
  tone: ToastTone
}

type ToastContainerProps = {
  toasts: ToastMessage[]
  onClose: (id: number) => void
}

function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed right-4 top-4 z-50 flex w-[min(420px,calc(100vw-2rem))] flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onClose }: { toast: ToastMessage; onClose: (id: number) => void }) {
  useEffect(() => {
    const timer = window.setTimeout(() => onClose(toast.id), 3000)
    return () => window.clearTimeout(timer)
  }, [onClose, toast.id])

  const toneClass = {
    info: 'border-outline-variant bg-surface-container-low text-on-surface',
    success: 'border-success/40 bg-success/15 text-primary',
    error: 'border-error/30 bg-error-container text-on-error-container',
  }[toast.tone]

  const Icon = toast.tone === 'success' ? FiCheckCircle : toast.tone === 'error' ? FiAlertCircle : FiInfo

  return (
    <div className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-soft ${toneClass}`} role={toast.tone === 'error' ? 'alert' : 'status'}>
      <Icon className="mt-0.5 shrink-0" />
      <span className="min-w-0 flex-1">{toast.message}</span>
      <button className="rounded-full p-1 hover:bg-white/50" onClick={() => onClose(toast.id)} aria-label="Cerrar notificacion">
        <FiX />
      </button>
    </div>
  )
}

export default ToastContainer
