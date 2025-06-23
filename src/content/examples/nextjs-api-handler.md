---
title: Next.js API Handler (App Router)
tags: ["nextjs"]
---

```ts twoslash
interface User {}

declare const doThing: (id: string) => Effect.Effect<User, Error>;

//---cut---

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

// everything interesting happens in this effect
// Which is of type Effect<HttpServerResponse, _, HttpServerRequest>
// it consumes the request from context anywhere
// and ultimately produces some http response
const exampleEffectHandler = Effect.gen(function* () {
  const request = yield* HttpServerRequest.HttpServerRequest;
  const params = yield* request.urlParamsBody;
  const id = yield* UrlParams.getFirst(params, "id").pipe(
    Effect.mapError(() => new Error("no id param found")),
  );
  const data = yield* doThing(id);
  return yield* HttpServerResponse.json(data);
});

const webHandler = HttpApp.toWebHandlerRuntime(runtime)(exampleEffectHandler);

type Handler = (req: Request) => Promise<Response>;
export const GET: Handler = webHandler;
```
