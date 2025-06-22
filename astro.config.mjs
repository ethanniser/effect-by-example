// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";


import expressiveCode from "astro-expressive-code";

import preact from "@astrojs/preact";

// https://astro.build/config
export default defineConfig({
	site: "https://effectbyexample.com",

	output: "static",

	vite: {
		plugins: [tailwindcss()],
	},
	integrations: [
		expressiveCode(),
		preact(),
	],
});
