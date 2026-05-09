/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['"Playfair Display"', 'Georgia', 'serif'],
        typewriter: ['"Special Elite"', 'monospace'],
        mono: ['"Courier Prime"', 'Courier', 'monospace'],
      },
      colors: {
        parchment: {
          50: '#fdf8f0',
          100: '#f8edd6',
          200: '#f0d9ad',
          300: '#e4be80',
          400: '#d49f53',
          500: '#c4832e',
          600: '#a66824',
          700: '#865020',
          800: '#6e4020',
          900: '#5a341e',
        },
        brass: {
          300: '#e8be4e',
          400: '#dca42c',
          500: '#c8871e',
          600: '#ad6819',
          700: '#8e4f18',
        },
        telegraph: {
          100: '#e8dcc4',
          200: '#d4bc91',
          300: '#bc9559',
          400: '#a67c3a',
          500: '#8c6426',
          600: '#744f1f',
          700: '#5e3d1b',
          800: '#4c3019',
          900: '#3d2614',
        },
        vermillion: {
          300: '#ff9478',
          400: '#ff5a38',
          500: '#f03014',
          600: '#d01d0a',
          700: '#ad180b',
        },
        emerald: {
          telegraph: '#2e6e47',
        },
        ink: {
          50: '#f5f0e8',
          900: '#1a1410',
          800: '#2a2420',
          700: '#3d3530',
          600: '#5a5048',
        },
      },
      animation: {
        'needle-swing': 'needleSwing 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'ticker-scroll': 'tickerScroll 30s linear infinite',
        'pulse-brass': 'pulseBrass 2.5s ease-in-out infinite',
        'stamp-in': 'stampIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'fade-slide': 'fadeSlide 0.5s ease-out forwards',
        'flicker': 'flicker 4s step-end infinite',
        'dial-glow': 'dialGlow 2s ease-in-out infinite',
      },
      keyframes: {
        needleSwing: {
          '0%': { transform: 'rotate(-90deg)' },
          '100%': { transform: 'var(--needle-rotation, rotate(0deg))' },
        },
        tickerScroll: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        pulseBrass: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        stampIn: {
          '0%': { transform: 'scale(1.3) rotate(-2deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        fadeSlide: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '93%': { opacity: '0.8' },
          '94%': { opacity: '1' },
          '97%': { opacity: '0.7' },
          '98%': { opacity: '1' },
        },
        dialGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(200, 135, 30, 0.3), inset 0 0 8px rgba(0,0,0,0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(200, 135, 30, 0.6), inset 0 0 8px rgba(0,0,0,0.4)' },
        },
      },
    },
  },
  plugins: [],
};
