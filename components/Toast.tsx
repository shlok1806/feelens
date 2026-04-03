'use client'

import { useEffect, useState, createContext, useContext, useCallback } from 'react'
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(onRemove, 200)
    }, 4000)
    return () => clearTimeout(timer)
  }, [onRemove])

  const iconMap = {
    success: <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--fl-green)' }} />,
    error: <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--fl-red)' }} />,
    info: <Info className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--fl-indigo)' }} />,
  }

  const bgMap = {
    success: 'var(--fl-green-light)',
    error: 'var(--fl-red-light)',
    info: 'var(--fl-indigo-light)',
  }

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm shadow-lg transition-all duration-200 ${isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}
      style={{
        background: 'var(--fl-surface-raised)',
        border: '1px solid var(--fl-border)',
        boxShadow: 'var(--fl-shadow-lg)',
      }}
    >
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: bgMap[toast.type] }}>
        {iconMap[toast.type]}
      </div>
      <span style={{ color: 'var(--fl-text-primary)' }}>{toast.message}</span>
      <button onClick={() => { setIsExiting(true); setTimeout(onRemove, 200) }} className="ml-auto flex-shrink-0 p-1 rounded-md transition-colors" style={{ color: 'var(--fl-text-tertiary)' }}>
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={() => removeToast(t.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
