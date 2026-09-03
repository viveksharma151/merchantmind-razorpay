import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        razorpay: {
          blue: '#2563EB',
          'blue-dark': '#1D4ED8',
          gold: '#F59E0B',
          'gold-light': '#FCD34D',
          dark: '#0A0A0F',
          'dark-card': '#111118',
          'dark-border': '#1E1E2E',
          'dark-hover': '#1A1A2A',
          muted: '#6B7280',
          success: '#10B981',
          danger: '#EF4444',
          warning: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-razorpay': 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
        'gradient-card': 'linear-gradient(145deg, #111118 0%, #0A0A0F 100%)',
      },
    },
  },
  plugins: [],
}
export default config
