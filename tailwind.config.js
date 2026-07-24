/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tattoo: {
          primary: '#FF6B35',     // Laranja Quente
          primaryDark: '#E63946', // Vermelho
          accent: '#FFB703',      // Amarelo Ouro
          bg: '#1C1C1C',          // Preto Profundo
          bgLight: '#2A2A2A',     // Cinza Escuro
          surface: '#242424',     // Card surface
          card: '#2D2D2D',
          border: '#3A3A3A',
          muted: '#999999',
          light: '#F5F5F5',
        }
      }
    },
  },
  plugins: [],
}
