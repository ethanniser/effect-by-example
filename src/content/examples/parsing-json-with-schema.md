---
title: Parsing JSON with Schema
tags: ["schema"]
---

Effect has a powerful type validation library (like Zod) called Schema.

## Basic Example

Here is a basic example:

```ts twoslash withOutput
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
console.log("string:", string);
const decoded = Schema.decodeUnknownSync(testSchema)(
  JSON.parse(string),
);
console.log("decoded:", decoded);
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

```ts twoslash withOutput
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

const encoded = Schema.encodeSync(testSchemaJson)(data);
console.log("encoded:", encoded);
const decoded = Schema.decodeSync(testSchemaJson)(encoded);
console.log("decoded:", decoded);
```

## Consuming Schema from Effects

All of the examples so far on this page have been using the `*Sync` variants of the Schema functions. These all return synchronously, but throw if the validation fails, or a transformation is asynchronous.

To consume these apis as `Effect`s, just drop the `Sync` suffix.

```ts twoslash withOutput
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

  const encoded = yield* Schema.encode(schema)(data);
  console.log("encoded:", encoded);
  const decoded = yield* Schema.decode(schema)(encoded);
  console.log("decoded:", decoded);
});

Effect.runSync(main);
```

## Different field names when encoding/decoding to/from JSON

```ts twoslash withOutput
import { Schema, Effect } from "effect";

const schema = Schema.parseJson(
  Schema.Struct({
    CamelCase: Schema.propertySignature(Schema.String).pipe(
      Schema.fromKey("snake_case"),
    ),
  }),
);

const data = {
  CamelCase: "hi",
};

const encoded = Schema.encodeSync(schema)(data);
console.log("encoded:", encoded);
const decoded = Schema.decodeSync(schema)(encoded);
console.log("decoded:", decoded);
```
