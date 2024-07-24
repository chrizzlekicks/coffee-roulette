/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui'

export default {
  content: [
    './app/javascript/**/*.{js,ts,jsx,tsx}',
    './app/views/**/*',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    daisyui
  ],
}

