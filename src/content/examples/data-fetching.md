---
title: Making HTTP Requests
tags: ["core", "http"]
---

This is a simple demonstration of making an HTTP request and handling the various error types for different failure scenarios.

```ts twoslash withOutput
import { Effect, Data, Schema } from "effect";

class NetworkError extends Data.TaggedError("NetworkError")<{ cause: unknown }> {}
class HttpError extends Data.TaggedError("HttpError")<{ status: number; cause: string }> {}
class ParseError extends Data.TaggedError("ParseError")<{ cause: unknown }> {}

const User = Schema.Struct({
  id: Schema.Number,
  name: Schema.String
});

function fetchUser(
  id: number
) {
  return Effect.gen(function*() {
    const response = yield* Effect.tryPromise({
      try: () => fetch(`https://jsonplaceholder.typicode.com/users/${id}`),
      catch: (unknown) => new NetworkError({ cause: unknown })
    });

    if (!response.ok) {
      return yield* Effect.fail(new HttpError({ cause: response.statusText, status: response.status }));
    }

    const userData = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: (unknown) => new ParseError({ cause: unknown })
    });

    const user = yield* Schema.decodeUnknown(User)(userData);

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

- `NetworkError` for network-related failures when making the HTTP request
- `HttpError` for HTTP status code errors
- `ParseError` for JSON parsing failures
- `ParseResult.ParseError` (Schema's built-in error) for validation failures

