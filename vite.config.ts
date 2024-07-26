import { defineConfig } from 'vite';
import RubyPlugin from 'vite-plugin-ruby';
import solidPlugin from 'vite-plugin-solid';
import eslintPlugin from 'vite-plugin-eslint';

export default defineConfig({
  plugins: [
    RubyPlugin(),
    solidPlugin(),
    eslintPlugin(),
  ],
  build: {
    target: 'esnext',
  },
});
