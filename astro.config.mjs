// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { rendererClassic, transformerTwoslash } from "@shikijs/twoslash";

// https://astro.build/config
export default defineConfig({
  site: "https://effectbyexample.com",
  markdown: {
    shikiConfig: {
      transformers: [transformerTwoslash()],
    },
  },

  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },
});
