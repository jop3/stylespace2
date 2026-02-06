import { useState, useCallback, createContext, useContext, type ReactNode } from 'react'

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info'

/**
 * Individual toast message
 */
export interface ToastMessage {
  id: string
  type: ToastType
  message: string
  duration?: number
}

/**
 * Toast context for managing notifications
 */
interface ToastContextValue {
  toasts: ToastMessage[]
  addToast: (type: ToastType, message: string, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

/**
 * Hook to access toast functionality
 *
 * @example
 * ```tsx
 * const { addToast } = useToast()
 * addToast('error', 'Please upload a .vrm file')
 * addToast('success', 'Texture applied successfully')
 * ```
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

/**
 * Toast provider component - wrap your app with this
 */
export function ToastProvider({ children }: { children: ReactNode }): ReactNode {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((type: ToastType, message: string, duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
    setToasts((prev) => [...prev, { id, type, message, duration }])

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

/**
 * Container that renders all active toasts
 */
function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}): ReactNode {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

/**
 * Individual toast component
 */
function Toast({
  toast,
  onRemove,
}: {
  toast: ToastMessage
  onRemove: (id: string) => void
}): ReactNode {
  const [isExiting, setIsExiting] = useState(false)

  const handleClose = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => onRemove(toast.id), 200)
  }, [onRemove, toast.id])

  const bgColor = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-600',
    info: 'bg-blue-600',
  }[toast.type]

  const icon = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }[toast.type]

  return (
    <div
      className={`
        ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg
        flex items-center gap-3 min-w-[250px]
        transform transition-all duration-200
        ${isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}
      `}
      role="alert"
    >
      <span className="text-lg">{icon}</span>
      <span className="flex-1 text-sm">{toast.message}</span>
      <button
        onClick={handleClose}
        className="text-white/70 hover:text-white transition-colors"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  )
}

export default ToastProvider
