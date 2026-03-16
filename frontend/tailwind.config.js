/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        prom: {
          pink: {
            50: '#fff0f8',
            100: '#ffd6ef',
            200: '#ffadd8',
            300: '#ff80be',
            400: '#ff4da4',
            500: '#ff1a91',
            600: '#e6007a',
            700: '#b30060',
            800: '#800045',
            900: '#4d002a',
          },
          purple: {
            50: '#f5f0ff',
            100: '#e8d9ff',
            200: '#d0b3ff',
            300: '#b98cff',
            400: '#9c65ff',
            500: '#7c3aed',
            600: '#6d28d9',
            700: '#5b21b6',
            800: '#4c1d95',
            900: '#2e1065',
          },
          gold: {
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
          },
          dark: {
            900: '#0f0720',
            800: '#1a0533',
            700: '#2d1b69',
            600: '#3b2087',
          }
        },
      },
      backgroundImage: {
        'prom-gradient': 'linear-gradient(135deg, #ff1a91 0%, #7c3aed 50%, #1a0533 100%)',
        'sunset-gradient': 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%)',
        'card-gradient': 'linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.95) 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0f0720 0%, #1a0533 40%, #2d1b69 100%)',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'celebration': 'celebration 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'shimmer': 'shimmer 2s linear infinite',
        'bounce-slow': 'bounce 2.5s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'count-up': 'countUp 0.5s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-12px) rotate(3deg)' },
          '66%': { transform: 'translateY(-6px) rotate(-2deg)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(1.3) rotate(15deg)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        celebration: {
          '0%': { transform: 'scale(0.4) rotate(-15deg)', opacity: '0' },
          '60%': { transform: 'scale(1.15) rotate(8deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        countUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255,26,145,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255,26,145,0.6), 0 0 60px rgba(124,58,237,0.3)' },
        },
      },
    },
  },
  plugins: [],
}
