import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E84545',
          50: '#FEF2F2',
          100: '#FDE8E8',
          500: '#E84545',
          600: '#D93535',
          700: '#B82828',
        },
        secondary: {
          DEFAULT: '#2B2D42',
          50: '#F0F0F3',
          500: '#2B2D42',
          600: '#22243A',
          700: '#1A1B2E',
        },
        accent: {
          DEFAULT: '#F4A261',
          50: '#FEF6EE',
          500: '#F4A261',
          600: '#E8863D',
        },
        success: {
          DEFAULT: '#2EC4B6',
          50: '#EBF9F8',
          500: '#2EC4B6',
          600: '#25A99D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}

export default config
