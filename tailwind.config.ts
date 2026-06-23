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
          DEFAULT: '#009FE3',
          dark: '#007BC5',
          light: '#33B5EA',
        },
        accent: {
          DEFAULT: '#00A550',
          dark: '#007A3D',
          light: '#4DC98A',
        },
        surface: {
          DEFAULT: '#ffffff',
          dark: '#0D0F14',
        },
        card: {
          DEFAULT: '#f0f6fc',
          dark: '#141928',
        },
        sidebar: {
          DEFAULT: '#EAF4FB',
          dark: '#08090F',
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
