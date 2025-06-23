import type { CollectionEntry } from "astro:content";
import { Tag } from "./Tag";

export function TagList({
  examples,
  activeTag,
}: {
  examples: CollectionEntry<"examples">[];
  activeTag?: string;
}) {
  // Get all unique tags
  const allTags = new Set<string>();
  examples.forEach((example) => {
    if (example.data.tags) {
      example.data.tags.forEach((tag) => allTags.add(tag));
    }
  });

  const sortedTags = Array.from(allTags).sort();

  // Count examples per tag
  const tagCounts = new Map<string, number>();
  sortedTags.forEach((tag) => {
    const count = examples.filter((example) =>
      example.data.tags?.includes(tag),
    ).length;
    tagCounts.set(tag, count);
  });

  return (
    <div>
      <h2 class="text-xl font-semibold">Browse by Tag</h2>
      <div class="py-1"></div>
      <div class="flex flex-wrap gap-2">
        {activeTag && (
          <Tag
            tag={activeTag}
            count={tagCounts.get(activeTag)!}
            variant="active"
            showRemove={true}
          />
        )}
        {!activeTag &&
          sortedTags.map((tag) => (
            <Tag tag={tag} count={tagCounts.get(tag)!} />
          ))}
      </div>
    </div>
  );
}
