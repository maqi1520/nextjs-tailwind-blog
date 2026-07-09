import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { DEFAULT_THEME, THEME_OPTIONS, THEME_STORAGE_KEY, ThemeKey } from '@/data/homeData'

type ColorThemeContextValue = {
  theme: ThemeKey
  setTheme: (theme: ThemeKey) => void
  themes: typeof THEME_OPTIONS
}

const ColorThemeContext = createContext<ColorThemeContextValue | undefined>(undefined)

function isThemeKey(value: string): value is ThemeKey {
  return THEME_OPTIONS.some((item) => item.key === value)
}

function applyTheme(theme: ThemeKey) {
  if (typeof document === 'undefined') return
  document.body.setAttribute('data-theme', theme)
  document.documentElement.setAttribute('data-theme', theme)
}

export default function ColorThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeKey>(DEFAULT_THEME)

  useEffect(() => {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY)
    const next = saved && isThemeKey(saved) ? saved : DEFAULT_THEME
    setThemeState(next)
    applyTheme(next)
  }, [])

  const setTheme = (next: ThemeKey) => {
    setThemeState(next)
    applyTheme(next)
    window.localStorage.setItem(THEME_STORAGE_KEY, next)
  }

  return (
    <ColorThemeContext.Provider value={{ theme, setTheme, themes: THEME_OPTIONS }}>
      {children}
    </ColorThemeContext.Provider>
  )
}

export function useColorTheme() {
  const context = useContext(ColorThemeContext)
  if (!context) {
    throw new Error('useColorTheme must be used within ColorThemeProvider')
  }
  return context
}
