import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10B981',
          dark: '#059669',
          light: '#34D399',
        },
        surface: {
          DEFAULT: '#ffffff',
          dark: '#121212',
        },
        card: {
          DEFAULT: '#f3f4f6',
          dark: '#1e1e1e',
        },
        sidebar: {
          DEFAULT: '#f9fafb',
          dark: '#0a0a0a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
