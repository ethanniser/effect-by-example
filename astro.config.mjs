// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { transformerTwoslash } from "@shikijs/twoslash";

// https://astro.build/config
export default defineConfig({
  site: "https://effectbyexample.com",
  markdown: {
    shikiConfig: {
      transformers: [transformerTwoslash()],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
