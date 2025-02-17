import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const examples = defineCollection({
  loader: glob({ pattern: "*.md", base: "src/content/examples" }),
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { examples };
