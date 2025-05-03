/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'neon-pink': '#FF00FF',
        'neon-blue': '#00F0FF',
        'neon-purple': '#9900FF',
        'neon-green': '#39FF14',
        'neon-yellow': '#FFFF00',
        'cyber-black': '#0D0221',
        'cyber-dark': '#190B28',
        'cyber-darkblue': '#150E56',
        'cyber-text': '#D1D7E0',
      },
      fontFamily: {
        'cyber': ['Share Tech Mono', 'monospace'],
        'display': ['Rajdhani', 'Orbitron', 'sans-serif'],
        'heading': ['Audiowide', 'Orbitron', 'sans-serif'],
        'body': ['Titillium Web', 'sans-serif'],
        'accent': ['Exo 2', 'sans-serif'],
      },
      boxShadow: {
        'neon-pink': '0 0 0.25px #FF00FF, 0 0 0.5px #FF00FF, 0 0 1px #FF00FF',
        'neon-blue': '0 0 0.25px #00F0FF, 0 0 0.5px #00F0FF, 0 0 1px #00F0FF',
        'neon-purple': '0 0 0.25px #9900FF, 0 0 0.5px #9900FF, 0 0 1px #9900FF',
        'neon-green': '0 0 0.25px #39FF14, 0 0 0.5px #39FF14, 0 0 1px #39FF14',
      },
      backgroundImage: {
        'cyber-grid': "linear-gradient(rgba(20, 20, 20, 0.8), rgba(20, 20, 20, 0.8)), url('/images/grid-bg.png')",
      }
    },
  },
  plugins: [],
} 