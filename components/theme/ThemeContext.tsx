'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'

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
  // Detect system theme preference
  const getSystemTheme = (): ResolvedTheme => {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  const [theme, setTheme] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(getSystemTheme)

  // Resolve the actual theme based on user preference
  const resolveTheme = useCallback((userTheme: Theme): ResolvedTheme => {
    if (userTheme === 'system') {
      return getSystemTheme()
    }
    return userTheme
  }, [])

  // Apply theme styles and Tailwind dark class
  const applyThemeStyles = useCallback((resolved: ResolvedTheme) => {
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
  }, [])

  useEffect(() => {
    const resolved = resolveTheme(theme)
    setResolvedTheme(resolved)
    applyThemeStyles(resolved)
  }, [theme, resolveTheme, applyThemeStyles])

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      setResolvedTheme(resolved)
      applyThemeStyles(resolved)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, applyThemeStyles])

  // Load theme from localStorage on mount, default to system if not set
  useEffect(() => {
    const storedTheme = localStorage.getItem('v2u-theme') as Theme | null
    if (storedTheme === 'dark' || storedTheme === 'light' || storedTheme === 'system') {
      setTheme(storedTheme)
    } else {
      // Default to system preference if no stored theme
      setTheme('system')
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