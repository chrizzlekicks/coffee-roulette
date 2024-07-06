import { defineConfig, presetUno, presetWebFonts } from "unocss";

export default defineConfig({
  presets: [presetUno(), presetWebFonts({
    provider: "google",
    fonts: {
      sans: "Roboto",
      mono: "Fira Code",
      lobster: "Lobster"
    }
  })]
});
