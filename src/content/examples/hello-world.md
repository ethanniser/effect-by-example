---
title: Hello World
tags: ["core"]
---

The most basic effect program

```ts twoslash
import { Effect } from "effect";

const main = Effect.sync(() => console.log("Hello World"));

Effect.runSync(main);
```
