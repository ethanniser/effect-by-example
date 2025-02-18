---
title: Reading Files
tags: ["platform", "file system"]
---

_Note: All examples on this page require the `FileSystem` service to be provided, you can do this by providing the implementation of `FileSystem` for your platform at any point in your program_

```ts
import { Effect } from "effect";
import { FileSystem } from "@effect/platform";
import { NodeFileSystem } from "@effect/platform-node";

declare const main: Effect.Effect<void, never, FileSystem.FileSystem>;
const runnable = main.pipe(Effect.provide(NodeFileSystem.layer));
```

## Reading a File as Bytes

```ts
import { Effect, Console } from "effect";
import { FileSystem } from "@effect/platform";

const main = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const bytes = yield* fs.readFile("file.txt");
});
```

## Reading a File as Text

```ts
import { Effect, Console } from "effect";
import { FileSystem } from "@effect/platform";

const main = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const string = yield* fs.readFileString("file.txt");
});
```

## Reading a File Incrementally

```ts
import { Effect } from "effect";
import { FileSystem } from "@effect/platform";

const main = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  // opening a file is a scoped operation
  const file = yield* fs.open("file.txt");

  // seek 4 bytes from the start
  yield* file.seek(4, "start");
  // read into a buffer
  const buffer = new Uint8Array(5);
  const sizeRead = yield* file.read(buffer);

  // seek 2 bytes from the current position
  yield* file.seek(2, "current");
  // read and allocate a buffer for result
  const buffer2 = yield* file.readAlloc(5);
}).pipe(Effect.scoped);
// ensures the file is closed after the effect ends
```
