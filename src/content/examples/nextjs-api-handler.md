---
title: Next.js API Handler (App Router)
tags: ["Next.js"]
---

```ts twoslash
import {
  HttpApp,
  HttpServerRequest,
  HttpServerResponse,
  UrlParams,
} from "@effect/platform";
import { Effect, Layer, ManagedRuntime } from "effect";

// your main layer representing all of the services your handler needs (db, auth, etc.)
declare const mainLive: Layer.Layer<void>;

const managedRuntime = ManagedRuntime.make(mainLive);
const runtime = await managedRuntime.runtime();

// everything interesting happens in this effect- it consumes the request from context anywhere and ultimately produces some http response
declare const effectHandler: Effect.Effect<
  HttpServerResponse.HttpServerResponse,
  never,
  HttpServerRequest.HttpServerRequest
>;

// example:
declare const doThing: (
  id: string,
) => Effect.Effect<{ readonly _tag: "user" }, Error>;
const exampleEffectHandler = Effect.gen(function* () {
  const request = yield* HttpServerRequest.HttpServerRequest;
  const params = yield* request.urlParamsBody;
  const id = yield* UrlParams.getFirst(params, "id").pipe(
    Effect.mapError(() => new Error("no id param found")),
  );
  const data = yield* doThing(id);
  return yield* HttpServerResponse.json(data);
}).pipe(
  // probably want some kind of catch all (defects too)
  // although the `toWebHandlerRuntime` already does quite a bit for you: https://github.com/Effect-TS/effect/blob/main/packages/platform/src/Http/App.ts#L134
  Effect.catchAllCause((e) =>
    HttpServerResponse.empty().pipe(HttpServerResponse.setStatus(500)),
  ),
);

const webHandler = HttpApp.toWebHandlerRuntime(runtime)(effectHandler);

export const GET: (req: Request) => Promise<Response> = webHandler;
```
