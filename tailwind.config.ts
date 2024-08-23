/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';

export default {
  content: [
    './app/javascript/**/*.{js,ts,jsx,tsx}',
    './app/views/**/*',
  ],
  daisyui: {
    themes: [
      {
        coffeeroulette: {
          primary: '#0ea5e9',
          secondary: '#7dd3fc',
          accent: '#0369a1',
          neutral: '#e0f2fe',
          'base-100': '#f3f4f6',
          info: '#fef9c3',
          success: '#00ff00',
          warning: '#f59e0b',
          error: '#ff0000',
        },
      },
    ],
  },
  plugins: [
    daisyui,
  ],
};
