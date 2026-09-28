/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ax: {
          bg: '#0a0a0f',        // Fondo ultra oscuro (casi negro)
          sidebar: '#12121a',   // Sidebar ligeramente más claro
          panel: '#1a1a24',     // Paneles internos
          card: '#22222e',      // Tarjetas y botones
          accent: '#6366f1',    // Índigo/Violeta 
          accentHover: '#818cf8',
          text: '#e4e4e7',      // Texto principal
          muted: '#71717a',     // Texto secundario
          border: '#27272a',    // Bordes sutiles
        }
      }
    },
  },
  plugins: [],
}