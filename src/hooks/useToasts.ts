import { useState } from 'react'
import type { ToastMessage, ToastTone } from '../components'

export function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const pushToast = (message: string, tone: ToastTone = 'info') => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((current) => [...current, { id, message, tone }])
  }

  const closeToast = (id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }

  return { closeToast, pushToast, toasts }
}
