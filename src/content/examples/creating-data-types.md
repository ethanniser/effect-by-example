---
title: Creating Data Types
tags: ["core", "schema"]
---

You can create your own data types using the `Data` module. While `Data` provides many different ways to do this, the most common way is to used `Data.TaggedClass`.

Why use classes? It's the only way to create both a new type and a constructor function for that type in one go.

```ts twoslash withOutput
import { Data, Equal, HashMap } from "effect";

class User extends Data.TaggedClass("User")<{ name: string; age: number }> {}

const user = new User({ name: "John", age: 30 });
console.log(user);

// compare by value (via Effect's `Equal` "trait")
console.log(Equal.equals(user, new User({ name: "John", age: 30 })));

// value based hashing (via Effect's `Hash` "trait")
let hm = HashMap.empty<User, string>();
hm = HashMap.set(hm, user, "foo");
console.log(HashMap.unsafeGet(hm, new User({ name: "John", age: 30 })));
```

For error types, you can use `Data.TaggedError`. This has the benefit of being compatible with the global `Error` type, as well as being able to be used in `Effect` contexts, which can save you a `Effect.fail`.

```ts twoslash withOutput
import { Effect, Data } from "effect";

class FooError extends Data.TaggedError("FooError")<{
  bar: number;
  cause: unknown;
}> {}

const error = new FooError({ bar: 1, cause: new Error("boom") });
console.log(error instanceof Error); // extends global Error type
console.log(error); // cause interpreted like a global Error

const a = Effect.gen(function* () {
  yield* Effect.fail(new FooError({ bar: 1, cause: new Error("boom") }));
});

const b = Effect.gen(function* () {
  // yield error directly
  yield* new FooError({ bar: 1, cause: new Error("boom") });
});

const c = a.pipe(
  // use tag
  Effect.catchTag("FooError", (e) => Effect.logError(e)),
);
```

If you need your data types to be serializable, you can use the `Schema` variants of these classes:

```ts twoslash withOutput
import { Schema } from "effect";

class Bar extends Schema.TaggedClass<Bar>()("Bar", {
  date: Schema.DateFromString,
}) {}

const bar = new Bar({ date: new Date("2025-01-01") });
console.log(bar);

const encodedBar = Schema.encodeSync(Bar)(bar);
console.log(encodedBar);

const decodedBar = Schema.decodeSync(Bar)(encodedBar);
console.log(decodedBar);
```
