import { defineConfig } from 'vite'
import RubyPlugin from 'vite-plugin-ruby'
import solidPlugin from 'vite-plugin-solid'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [
    RubyPlugin(),
    UnoCSS(),
    solidPlugin(),
  ],
  build: {
    target: 'esnext',
  }
})
