/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,tsx,ts,jsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#effdf5',
          100: '#d8fbea',
          200: '#b5f5d3',
          300: '#81ebb7',
          400: '#46d899',
          500: '#16a34a', // Malaabi Main Green
          600: '#139765',
          700: '#117852',
          800: '#125e42',
          900: '#104d37',
          950: '#082b1f',
        },
        success: '#22c55e',
        info: '#3b82f6',
        warning: '#f59e0b',
        error: '#ef4444',
        theme: {
          light: {
            text: '#0F172A',
            background: '#F8FAFC',
            tint: '#22C55E',
            icon: '#64748B',
            tabIconDefault: '#64748B',
            tabIconSelected: '#22C55E',
            card: '#FFFFFF',
          },
          dark: {
            text: '#F1F5F9',
            background: '#0F172A',
            tint: '#4ADE80',
            icon: '#94A3B8',
            tabIconDefault: '#94A3B8',
            tabIconSelected: '#4ADE80',
            card: '#1E293B',
          },
        },
      },
      fontSize: {
        'title-xl': '24px',
        'title-lg': '20px',
        'title-md': '18px',
        'title-sm': '16px',
      },
    },
  },
  plugins: [],
}