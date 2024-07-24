import {
  defineConfig,
  presetUno,
} from "unocss";

export default defineConfig({
  presets: [
    presetUno({
      dark: {
        dark: '[data-kb-theme="dark"]',
        light: '[data-kb-theme="light"]',
      },
    }),
  ],
});
