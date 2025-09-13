'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  // Apply theme styles and Tailwind dark class
  useEffect(() => {
    const root = document.documentElement

    if (theme === 'dark') {
      root.classList.add('dark')
      root.style.setProperty('--site-bg', '#000000')
      root.style.setProperty('--site-fg', '#ffffff')
    } else {
      root.classList.remove('dark')
      root.style.setProperty('--site-bg', '#ffffff')
      root.style.setProperty('--site-fg', '#000000')
    }
  }, [theme])

  // Load theme from localStorage on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem('v2u-theme') as Theme | null
    if (storedTheme === 'dark' || storedTheme === 'light') {
      setTheme(storedTheme)
    }
  }, [])

  // Persist theme to localStorage on change
  useEffect(() => {
    localStorage.setItem('v2u-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}