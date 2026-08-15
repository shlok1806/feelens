'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      className="relative w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 flex items-center justify-center transition-all duration-200 group"
      aria-label="Toggle theme"
    >
      <Sun className="w-4 h-4 text-amber-500 absolute transition-all duration-300 group-hover:scale-110 dark:opacity-0 dark:rotate-90 dark:scale-50 opacity-100 rotate-0 scale-100" />
      <Moon className="w-4 h-4 text-indigo-300 absolute transition-all duration-300 group-hover:scale-110 opacity-0 -rotate-90 scale-50 dark:opacity-100 dark:rotate-0 dark:scale-100" />
    </button>
  )
}
