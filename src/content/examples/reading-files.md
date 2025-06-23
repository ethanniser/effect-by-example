---
title: Reading Files
tags: ["platform", "core"]
---

_Note: All examples on this page require the `FileSystem` service to be provided, you can do this by providing the implementation of `FileSystem` for your platform at any point in your program_

```ts twoslash
import { Effect } from "effect";
import { FileSystem } from "@effect/platform";
import { NodeFileSystem } from "@effect/platform-node";

declare const main: Effect.Effect<
  void,
  never,
  FileSystem.FileSystem
>;
const runnable = main.pipe(
  Effect.provide(NodeFileSystem.layer),
);
```

## Reading a File as Bytes

```ts twoslash withOutput collapse={10-15}
import { Effect, Console } from "effect";
import { FileSystem } from "@effect/platform";

const main = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  yield* fs.writeFileString("file.txt", "Hello, world!");
  const bytes = yield* fs.readFile("file.txt");
  console.log(bytes);
});

import { NodeContext } from "@effect/platform-node";
await main.pipe(
  Effect.provide(NodeContext.layer),
  Effect.runPromise,
);
```

## Reading a File as Text

```ts twoslash withOutput collapse={10-15}
import { Effect, Console } from "effect";
import { FileSystem } from "@effect/platform";

const main = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  yield* fs.writeFileString("file.txt", "Hello, world!");
  const string = yield* fs.readFileString("file.txt");
  console.log(string);
});

import { NodeContext } from "@effect/platform-node";
await main.pipe(
  Effect.provide(NodeContext.layer),
  Effect.runPromise,
);
```

## Reading a File Incrementally

```ts twoslash withOutput collapse={25-30}
import { Effect } from "effect";
import { FileSystem } from "@effect/platform";

const main = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  yield* fs.writeFileString("file.txt", "Hello, world!");
  // opening a file is a scoped operation
  const file = yield* fs.open("file.txt");

  // seek 4 bytes from the start
  yield* file.seek(4, "start");
  // read into a buffer
  const buffer = new Uint8Array(5);
  const sizeRead = yield* file.read(buffer);
  console.log(buffer);

  // seek 2 bytes from the current position
  yield* file.seek(2, "current");
  // read and allocate a buffer for result
  const buffer2 = yield* file.readAlloc(5);
  console.log(buffer2);

  // ensures the file is closed after the effect ends
}).pipe(Effect.scoped);

import { NodeContext } from "@effect/platform-node";
await main.pipe(
  Effect.provide(NodeContext.layer),
  Effect.runPromise,
);
```
