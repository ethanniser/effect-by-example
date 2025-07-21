---
title: Next.js API Handler (App Router)
tags: ["nextjs"]
---

## Raw HTTP APIs

```ts twoslash title="src/app/api/example/route.ts"
import {
  HttpApp,
  HttpServerRequest,
  HttpServerResponse,
} from "@effect/platform";
import { Effect, Layer, ManagedRuntime, Schema } from "effect";

// your main layer representing all of the services your handler needs (db, auth, etc.)
const mainLive = Layer.empty;

const managedRuntime = ManagedRuntime.make(mainLive);
const runtime = await managedRuntime.runtime();

// everything interesting happens in this effect
// Which is of type Effect<HttpServerResponse, _, HttpServerRequest>
// it consumes the request from context anywhere
// and ultimately produces some http response
const exampleEffectHandler = Effect.gen(function* () {
  // consumes request from context
  const { name } = yield* HttpServerRequest.schemaBodyJson(
    Schema.Struct({
      name: Schema.String,
    }),
  );
  return yield* HttpServerResponse.json({
    message: `Hello, ${name}`,
  });
});

const handler = HttpApp.toWebHandlerRuntime(runtime)(exampleEffectHandler);

type Handler = (req: Request) => Promise<Response>;
export const POST: Handler = handler;
```

## Effect `HttpApi` framework

```ts twoslash title="src/app/api/[[...path]]/route.ts"
import {
  FetchHttpClient,
  HttpApi,
  HttpApiBuilder,
  HttpApiClient,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSwagger,
  HttpMiddleware,
  HttpServer,
  OpenApi,
} from "@effect/platform";
import { Config, Effect, Layer, Schema } from "effect";

// ------------------------------------------------
// schema
// ------------------------------------------------

class FooError extends Schema.TaggedError<FooError>("FooError")(
  "FooError",
  {},
) {}

class FooApi extends HttpApiGroup.make("foo")
  .add(
    HttpApiEndpoint.get("bar", "/bar")
      .setHeaders(Schema.Struct({ page: Schema.NumberFromString }))
      .addSuccess(Schema.String),
  )
  .add(
    HttpApiEndpoint.post("baz", "/baz/:id")
      .setPath(Schema.Struct({ id: Schema.NumberFromString }))
      .setPayload(Schema.Struct({ name: Schema.String }))
      .addSuccess(Schema.Struct({ ok: Schema.Boolean }))
      .addError(FooError),
  ) {}

class MyApi extends HttpApi.make("api")
  .add(FooApi)
  .prefix("/api")
  .annotateContext(
    OpenApi.annotations({
      title: "My API",
      description: "API for my endpoints",
    }),
  ) {}

// ------------------------------------------------
// implementation
// ------------------------------------------------

const FooLive = HttpApiBuilder.group(MyApi, "foo", (handlers) =>
  handlers
    .handle("bar", (_) => Effect.succeed(`page: ${_.headers.page}`))
    .handle("baz", (_) =>
      Effect.gen(function* () {
        const id = _.path.id;
        if (id < 0) {
          return yield* new FooError();
        }
        return {
          ok: _.payload.name.length === id,
        };
      }),
    ),
);

const ApiLive = HttpApiBuilder.api(MyApi).pipe(Layer.provide(FooLive));

// ------------------------------------------------
// handler
// ------------------------------------------------

const middleware = Layer.mergeAll(
  HttpApiBuilder.middlewareCors(), // cors
  HttpApiBuilder.middlewareOpenApi({
    path: "/api/openapi.json",
  }), // openapi
  HttpApiSwagger.layer({
    path: "/api/docs",
  }), // swagger
  HttpApiBuilder.middleware(HttpMiddleware.logger), // Standard http middlewares
);

const { handler } = Layer.empty.pipe(
  Layer.merge(middleware),
  Layer.provideMerge(ApiLive),
  Layer.merge(HttpServer.layerContext),
  HttpApiBuilder.toWebHandler,
);

type Handler = (req: Request) => Promise<Response>;
export const GET: Handler = handler;
export const POST: Handler = handler;
export const PUT: Handler = handler;
export const PATCH: Handler = handler;
export const DELETE: Handler = handler;
export const OPTIONS: Handler = handler;

// ------------------------------------------------
// typesafe client
// ------------------------------------------------

const example = Effect.gen(function* () {
  // import schema only
  const client = yield* HttpApiClient.make(MyApi, {
    baseUrl: yield* Config.string("BASE_URL"),
  });

  const res = yield* client.foo.bar({ headers: { page: 1 } });
  const res2 = yield* client.foo.baz({
    path: { id: 1 },
    payload: { name: "test" },
  });
  return { res, res2 };
}).pipe(Effect.provide(FetchHttpClient.layer));
```

## `waitUntil`

```ts twoslash
interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
  props: any;
}
//---cut---
import { Effect, Runtime, Context, Layer } from "effect";

class WaitUntil extends Context.Tag("WaitUntil")<
  WaitUntil,
  (promise: Promise<unknown>) => void
>() {}

const effectWaitUntil = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  abortSignal?: AbortSignal,
) =>
  Effect.runtime<R>().pipe(
    Effect.zip(WaitUntil),
    Effect.flatMap(([runtime, waitUntil]) =>
      Effect.sync(() =>
        waitUntil(Runtime.runPromise(runtime, effect, { signal: abortSignal })),
      ),
    ),
  );

import { waitUntil } from "@vercel/functions";

const VercelWaitUntil = Layer.succeed(WaitUntil, waitUntil);

const CloudflareWaitUntil = (ctx: ExecutionContext) =>
  Layer.succeed(WaitUntil, ctx.waitUntil);
```
