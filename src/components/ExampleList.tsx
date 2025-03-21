import type { CollectionEntry } from "astro:content";
import { useState } from "preact/hooks";

export function ExampleList({
  examples,
}: {
  examples: CollectionEntry<"examples">[];
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredExamples = examples.filter((example) =>
    example.data.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search examples"
        value={searchQuery}
        onInput={(e) => setSearchQuery(e.currentTarget.value)}
        class="border-input bg-background ring-offset-background file:text-foreground
          placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full
          rounded-md border px-3 py-2 text-base file:border-0 file:bg-transparent
          file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2
          focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50
          md:text-sm"
      />
      <div class="py-3"></div>
      <ul>
        {filteredExamples.map((example) => (
          <a href={`/${example.id}`} class="underline">
            <li>{example.data.title}</li>
          </a>
        ))}
      </ul>
    </div>
  );
}
