'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'dark' | 'light' | 'system'
type ResolvedTheme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')

  // Detect system theme preference
  const getSystemTheme = (): ResolvedTheme => {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  // Resolve the actual theme based on user preference
  const resolveTheme = (userTheme: Theme): ResolvedTheme => {
    if (userTheme === 'system') {
      return getSystemTheme()
    }
    return userTheme
  }

  // Apply theme styles and Tailwind dark class
  useEffect(() => {
    const root = document.documentElement
    const resolved = resolveTheme(theme)
    setResolvedTheme(resolved)

    if (resolved === 'dark') {
      root.classList.add('dark')
      root.style.setProperty('--site-bg', '#000000')
      root.style.setProperty('--site-fg', '#ffffff')
    } else {
      root.classList.remove('dark')
      root.style.setProperty('--site-bg', '#ffffff')
      root.style.setProperty('--site-fg', '#000000')
    }
  }, [theme])

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      setResolvedTheme(resolved)
      const root = document.documentElement
      
      if (resolved === 'dark') {
        root.classList.add('dark')
        root.style.setProperty('--site-bg', '#000000')
        root.style.setProperty('--site-fg', '#ffffff')
      } else {
        root.classList.remove('dark')
        root.style.setProperty('--site-bg', '#ffffff')
        root.style.setProperty('--site-fg', '#000000')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme])

  // Load theme from localStorage on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem('v2u-theme') as Theme | null
    if (storedTheme === 'dark' || storedTheme === 'light' || storedTheme === 'system') {
      setTheme(storedTheme)
    }
  }, [])

  // Persist theme to localStorage on change
  useEffect(() => {
    localStorage.setItem('v2u-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'light') return 'dark'
      if (prev === 'dark') return 'system'
      return 'light' // system -> light
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}