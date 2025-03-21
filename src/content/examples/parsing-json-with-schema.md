---
title: Parsing JSON with Schema
tags: ["Schema"]
---

Effect has a powerful type validation library (like Zod) called Schema.

## Basic Example

Here is a basic example:

```ts twoslash
import { Schema } from "effect";

const testSchema = Schema.Struct({
  name: Schema.String,
  age: Schema.Number,
});

const data = {
  name: "Bob",
  age: 30,
};

const string = JSON.stringify(data);
const decoded = Schema.decodeUnknownSync(testSchema)(JSON.parse(string));
```

Here, the last line will throw if the validation fails.

## Transformations

Schema's superpower is its ability to describe two-way transformations.

The type of a Schema has two type parameters: the input type and the output type.

```ts twoslash
type Schema<Decoded, Encoded> = {};
```

We can then use such a schema to transform between the two types.

Consider the `Schema.parseJson` function, which takes a schema and returns a new schema which transforms between JSON and the schema's type.

Combined with other schemas, which can serialize/deserialize types that are not JSON-compatible, we can build a complex schema capable of encoding/decoding any type.

```ts twoslash
import { Schema } from "effect";

const testSchema = Schema.Struct({
  name: Schema.Set(Schema.String),
  age: Schema.Date,
});
const testSchemaJson = Schema.parseJson(testSchema);

const data = {
  name: new Set(["Bob", "Alice"]),
  age: new Date(),
};

const string = Schema.encodeSync(testSchemaJson)(data);
const decoded = Schema.decodeSync(testSchemaJson)(string);
```

## Consuming Schema from Effects

All of the examples so far on this page have been using the `*Sync` variants of the Schema functions. These all return synchronously, but throw if the validation fails, or a transformation is asynchronous.

To consume these apis as `Effect`s, just drop the `Sync` suffix.

```ts twoslash
import { Schema, Effect } from "effect";

const schema = Schema.parseJson(
  Schema.Struct({
    name: Schema.String,
    age: Schema.Number,
  }),
);

const main = Effect.gen(function* () {
  const data = {
    name: "Bob",
    age: 30,
  };

  const string = yield* Schema.encode(schema)(data);
  const decoded = yield* Schema.decode(schema)(string);
});
```
