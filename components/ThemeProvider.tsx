'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggle: () => void
}

const STORAGE_KEY = 'fl-theme'

const ThemeContext = createContext<ThemeContextType>({ theme: 'light', toggle: () => {} })

export function useTheme() {
  return useContext(ThemeContext)
}

/**
 * Applies the stored (or system) theme to <html> before the first paint.
 * Injected as a blocking inline script in the root layout.
 *
 * This replaces a `mounted` flag that only applied the theme after mount, which
 * still let a light-themed frame paint first for dark-mode users. Keep the logic
 * here identical to initialTheme() below - the two must agree or hydration will
 * read back a different value than the one that was painted.
 */
export const themeInitScript = `(function(){try{
var s=localStorage.getItem('${STORAGE_KEY}');
var t=(s==='light'||s==='dark')?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
document.documentElement.classList.toggle('dark',t==='dark');
}catch(e){}})();`

function initialTheme(): Theme {
  // No DOM during SSR. On the client the script above has already applied the
  // real theme, so we read it back off <html> rather than guessing.
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  // Effects sync React state *out* to external systems (the DOM and localStorage).
  // Nothing calls setState here, so there is no cascading render.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}
