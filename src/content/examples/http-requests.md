---
title: Making HTTP Requests
tags: ["platform", "http"]
---

A very common task in any application is to make HTTP requests to fetch data.

First we'll look at how to wrap `fetch` yourself, then we'll look at how to use `@effect/platform`'s HTTP client.

## Wrapping `fetch` ourselves

```ts twoslash withOutput
import { Data, Effect, Schema } from "effect";

class RequestError extends Data.TaggedError("RequestError")<{
  cause: unknown;
}> {}
class ResponseError extends Data.TaggedError("ResponseError")<{
  status: number;
  cause: string;
  response: Response;
}> {}
class BodyJsonError extends Data.TaggedError("BodyJsonError")<{
  cause: unknown;
}> {}

const User = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
});

function fetchUser(id: number) {
  return Effect.gen(function* () {
    const response = yield* Effect.tryPromise({
      try: (signal) =>
        fetch(`https://jsonplaceholder.typicode.com/users/${id}`, { signal }),
      catch: (cause) => new RequestError({ cause }),
    });

    if (!response.ok) {
      return yield* Effect.fail(
        new ResponseError({
          cause: response.statusText,
          status: response.status,
          response,
        }),
      );
    }

    const body = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: (cause) => new BodyJsonError({ cause }),
    });

    const user = yield* Schema.decodeUnknown(User)(body);

    return user;
  });
}

const program = Effect.gen(function* () {
  const user = yield* fetchUser(1);
  console.log("Fetched user:", user);
});

await Effect.runPromise(program);
```

In this example, we use different error types for different failure scenarios:

- `RequestError` for failures when making the HTTP request
- `ResponseError` for response errors (non-2xx status codes)
- `BodyJsonError` for JSON parsing failures
- `ParseResult.ParseError` (Schema's built-in error) for validation failure

## Using `@effect/platform`

```ts twoslash withOutput
import { Effect, Schema } from "effect";
import {
  FetchHttpClient,
  HttpClient,
  HttpClientResponse,
} from "@effect/platform";
import { NodeHttpClient } from "@effect/platform-node";

const User = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
});

const fetchUser = Effect.fn(function* (id: number) {
  const client = yield* HttpClient.HttpClient.pipe(
    Effect.map(HttpClient.filterStatusOk), // error if non 2xx
  );

  const response = yield* client.get(
    `https://jsonplaceholder.typicode.com/users/${id}`,
  );

  const user = yield* HttpClientResponse.schemaBodyJson(User)(response);
  return user;
});

const program = Effect.gen(function* () {
  const user = yield* fetchUser(1);
  console.log("Fetched user:", user);
});

await program.pipe(
  // provide fetch implementation of HttpClient
  // (available on all platforms)
  Effect.provide(FetchHttpClient.layer),
  Effect.runPromise,
);

// also available are platform-specific implementations
NodeHttpClient.layer;
//                  ^|
```
