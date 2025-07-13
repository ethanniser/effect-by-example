// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import expressiveCode from "astro-expressive-code";
import ogImages from "@reunmedia/astro-og-images";
import { readFile } from "node:fs/promises";
import preact from "@astrojs/preact";
import { effectCodeOutputHooks } from "./src/plugins/expressive-code/code-output";

// https://astro.build/config
export default defineConfig({
  site: "https://effectbyexample.com",

  output: "static",

  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    expressiveCode(),
    effectCodeOutputHooks(),
    preact(),
    ogImages({
      fonts: [
        {
          name: "Inter",
          data: await readFile(
            "./node_modules/@fontsource/inter/files/inter-latin-400-normal.woff",
          ),
        },
        {
          name: "Inter Bold",
          data: await readFile(
            "./node_modules/@fontsource/inter/files/inter-latin-700-normal.woff",
          ),
        },
      ],
    }),
  ],
});
