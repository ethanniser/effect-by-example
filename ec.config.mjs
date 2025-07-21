import { defineEcConfig } from "astro-expressive-code";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import ecTwoSlash from "expressive-code-twoslash";
import { pluginCodeOutput } from "./src/plugins/expressive-code/code-output";
import { pluginOpenInPlayground } from "./src/plugins/expressive-code/open-in-playground";

export default defineEcConfig({
  plugins: [
    pluginCodeOutput(),
    pluginCollapsibleSections(),
    pluginLineNumbers(),
    pluginOpenInPlayground(),
    ecTwoSlash({
      twoslashOptions: {
        compilerOptions: {
          exactOptionalPropertyTypes: false,
        },
      },
    }),
  ],
  themes: ["github-light", "github-dark"],
  defaultProps: {
    showLineNumbers: true,
    wrap: false,
    collapseStyle: "collapsible-start",
  },
});
