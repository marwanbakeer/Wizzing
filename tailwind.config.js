/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wizz: {
          cyan: '#00f2fe',
          blue: '#4facfe',
          purple: '#a855f7',
          magenta: '#f43f5e',
          amber: '#f59e0b',
          emerald: '#10b981',
          dark: '#0a0d14',
          darker: '#05070a',
          surface: '#121826',
          border: '#1e293b',
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(0, 242, 254, 0.4), inset 0 0 10px rgba(0, 242, 254, 0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(0, 242, 254, 0.8), inset 0 0 15px rgba(0, 242, 254, 0.5)' },
        }
      }
    },
  },
  plugins: [],
}
