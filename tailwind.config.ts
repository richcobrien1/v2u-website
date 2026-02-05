import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class', // ✅ Enables dark mode via .dark class
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        v2uBlue: '#00CFFF',
        v2uPurple: '#B400FF',
        v2uGlow: '#C0FF00',
        matteDark1: '#121212',
        matteDark2: '#1E1E1E',
        matteLight1: '#FAFAFA',
        matteLight2: '#F0F0F0',
      },
      fontFamily: {
        heading: ['Orbitron', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config