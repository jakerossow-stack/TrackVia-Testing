/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0F1923', 2: '#2A3A4A', 3: '#4A6070', 4: '#7A9AB0' },
        surface: { DEFAULT: '#F4F7FA', 2: '#FFFFFF' },
        bdr: { DEFAULT: '#DCE4EC', 2: '#C8D4DE' },
        red: { DEFAULT: '#D93025', bg: '#FDF1F0', bdr: '#F5C5C2', border: '#F5C5C2' },
        amber: { DEFAULT: '#C47B00', bg: '#FDF8EC', bdr: '#F2DFA0', border: '#F2DFA0' },
        green: { DEFAULT: '#1A7A4A', bg: '#EDF7F2', bdr: '#A8D9BF', border: '#A8D9BF' },
        blue: { DEFAULT: '#1155CC', bg: '#EEF2FF', bdr: '#C5D0F5', border: '#C5D0F5' },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        btn: '7px',
        badge: '5px',
        pill: '20px',
        avatar: '8px',
      },
      boxShadow: {
        modal: '0 8px 24px rgba(0,0,0,0.12)',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.8)' },
        },
        highlightFlash: {
          '0%': { backgroundColor: '#FDF1F0' },
          '100%': { backgroundColor: '#FFFFFF' },
        },
        slideOutRight: {
          to: { transform: 'translateX(120%)', opacity: '0' },
        },
        slideUp: {
          from: { transform: 'translateY(12px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        pulseDot: 'pulseDot 1.6s ease-in-out infinite',
        highlightFlash: 'highlightFlash 1.4s ease-out',
        slideOutRight: 'slideOutRight 0.35s ease-in forwards',
        slideUp: 'slideUp 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
