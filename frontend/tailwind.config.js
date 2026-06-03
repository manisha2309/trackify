/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:       '#080b14',
        surface:  '#141c2e',
        surface2: '#1a2540',
        cyan:     '#00d4ff',
        magenta:  '#ff2d9f',
        purple:   '#7c3aed',
        ngreen:   '#10d87b',
        amber:    '#ffb020',
        muted:    '#7a8aa8',
        faint:    '#3a4a65',
      },
      fontFamily: {
        sans:    ['Space Grotesk', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
    },
  },
  plugins: [],
}