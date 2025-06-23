// .prettierrc.mjs
/** @type {import("prettier").Config} */
export default {
  plugins: ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
  overrides: [
    // {
    //   // Target TypeScript code blocks in markdown files
    //   files: "*.md",
    //   options: {
    //     printWidth: 65,
    //   },
    // },
  ],
};
