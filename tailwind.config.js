/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gt: {
          purple: '#473460',
          accent: '#792af6',
          'accent-hover': '#8b3dff',
          'accent-dark': '#6b22d9',
          'accent-darker': '#5c1db8',
          'accent-darkest': '#4a1896',
          'accent-light': '#8b3dff',
          'accent-lighter': '#9d5eff',
          'accent-lightest': '#c9a6ff',
          'bg-primary': '#f9f8f7',
          'bg-surface': '#ffffff',
          'border': '#e6e3dd',
          'purple-bg': '#e5d5f7',
          'code-bg': '#473460',
          'code-text': '#f5f0ff',
          'footer': '#6b5b7a',
          'muted': '#9d96a8',
        },
      },
      fontFamily: {
        sans: ['Geist', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
