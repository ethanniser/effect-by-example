import type { CollectionEntry } from "astro:content";

/**
 * Examples are ordered by their position in this array.
 * Examples not listed here will appear at the end in alphabetical order.
 */
export const EXAMPLE_ORDER = [
  "hello-world",
  "non-effect-interop",
  "creating-data-types",
  "parsing-json-with-schema",
  "reading-files",
  "nextjs-api-handler",
] as const;

export function getExampleOrder(id: string): number {
  const index = EXAMPLE_ORDER.indexOf(id as any);
  return index === -1 ? 1000 : index; // Unlisted examples go to the end
}

export function sortExamples(
  examples: CollectionEntry<"examples">[],
): CollectionEntry<"examples">[] {
  return examples.sort((a, b) => {
    const orderA = getExampleOrder(a.id);
    const orderB = getExampleOrder(b.id);

    // Primary sort by order
    if (orderA !== orderB) {
      return orderA - orderB;
    }

    // Secondary sort by title alphabetically for unlisted examples
    return a.data.title.localeCompare(b.data.title);
  });
}
