// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import ecTwoSlash from "expressive-code-twoslash";
import alpinejs from "@astrojs/alpinejs";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { pluginOpenInPlayground } from "./src/plugins/expressive-code/open-in-playground";

import expressiveCode from "astro-expressive-code";

// https://astro.build/config
export default defineConfig({
  site: "https://effectbyexample.com",

  output: "static",

  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    alpinejs(),
    expressiveCode({
      plugins: [
        pluginCollapsibleSections(),
        pluginLineNumbers(),
        pluginOpenInPlayground(),
        ecTwoSlash(),
      ],
      themes: ["github-light", "github-dark"],
    }),
  ],
});
