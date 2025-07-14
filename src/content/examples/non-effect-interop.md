---
title: Interop with Non-Effect Code
tags: ["core"]
---

## Consuming non-effect code in Effect

For calling synchronous functions, use `Effect.try`

```ts twoslash withOutput
import { Effect, Data } from "effect";

function doThing() {
  return "Hello World";
}

class DoThingError extends Data.TaggedError("DoThingError")<{
  message: string;
  cause: unknown;
}> {}

const doThingEffect = Effect.try({
  try: () => doThing(),
  // map unknown error to typed error
  catch: (error) =>
    new DoThingError({ message: "Failed to do thing", cause: error }),
});

const main = doThingEffect.pipe(Effect.tap((result) => console.log(result)));

Effect.runSync(main);
```

For calling asynchronous functions, use `Effect.tryPromise`

```ts twoslash withOutput
import { Effect, Data } from "effect";

async function doAsyncThing() {
  return "Hello World";
}

class DoThingError extends Data.TaggedError("DoThingError")<{
  message: string;
  cause: unknown;
}> {}

const doThingEffect = Effect.tryPromise({
  try: () => doAsyncThing(),
  catch: (error) =>
    new DoThingError({ message: "Failed to do thing", cause: error }),
});

const main = doThingEffect.pipe(Effect.tap((result) => console.log(result)));

await Effect.runPromise(main);
```

## Consuming Effect code in non-effect code

To run any effect program to a promise, use `Effect.runPromise`

```ts twoslash withOutput
import { Effect, Context, Console, Layer, pipe } from "effect";

class FooService extends Context.Tag("FooService")<FooService, number>() {
  static layer = Layer.scoped(
    FooService,
    Effect.acquireRelease(
      Console.log("constructing FooService").pipe(Effect.as(10)),
      (foo) => Console.log("destructing FooService"),
    ),
  );
}

const program = Effect.gen(function* () {
  const foo = yield* FooService;
  return foo * 2;
});

async function nonEffectCode() {
  const result = await pipe(
    program,
    // provide all required services
    Effect.provide(FooService.layer),
    Effect.runPromise,
  );
  console.log("result", result);
}

await nonEffectCode();
```

### Managed Runtime

If you are calling `run*` functions multiple times when running Effects with services, you likely want to reuse those services across calls.

You can easily do this with `ManagedRuntime`

```ts twoslash withOutput
import { Effect, Context, Console, Layer, pipe, ManagedRuntime } from "effect";

class FooService extends Context.Tag("FooService")<FooService, number>() {
  static layer = Layer.scoped(
    FooService,
    Effect.acquireRelease(
      Console.log("constructing FooService").pipe(Effect.as(10)),
      (foo) => Console.log("destructing FooService"),
    ),
  );
}

const program = Effect.gen(function* () {
  const foo = yield* FooService;
  return foo * 2;
});

async function nonEffectCodeDefaultRuntime() {
  const result = await pipe(
    program,
    // provide all required services
    Effect.provide(FooService.layer),
    Effect.runPromise,
  );
  console.log("result", result);
}

console.log("--- no managed runtime ---");
await nonEffectCodeDefaultRuntime();
await nonEffectCodeDefaultRuntime();

// create runtime which contains the services produced by the layer
const managedRuntime = ManagedRuntime.make(FooService.layer);

async function nonEffectCodeManagedRuntime() {
  const result = await managedRuntime.runPromise(program);
  console.log("result", result);
}

console.log("--- with managed runtime ---");
await nonEffectCodeManagedRuntime();
await nonEffectCodeManagedRuntime();
await managedRuntime.dispose(); // run service destructors
```

### Running Effects in non-effect code callbacks

There may be times where you are working in an effect context, and have to work with non-effect apis that expect a callback, where you want to run more effect code.

The correct pattern for this is using `Effect.runtime`

```ts twoslash withOutput
import { Effect, Context, Console, Layer, Runtime, pipe } from "effect";

class FooService extends Context.Tag("FooService")<FooService, number>() {
  static layer = Layer.succeed(FooService, 10);
}

const logFoo = Effect.gen(function* () {
  const foo = yield* FooService;
  yield* Console.log(`foo: ${foo}`);
});

async function nonEffectCodeWithCallback(onDone: (result: string) => void) {
  await new Promise((res) => setTimeout(res, 1000));
  console.log("non effect code running callback");
  onDone("done");
}

const main = Effect.gen(function* () {
  // get current runtime (which must contain `FooService`)
  const runtime = yield* Effect.runtime<FooService>();

  const onDone = (result: string) => {
    // use the existing runtime to run effects in the callback
    Runtime.runSync(runtime, logFoo);
  };

  yield* Effect.promise(() => nonEffectCodeWithCallback(onDone));
});

pipe(main, Effect.provide(FooService.layer), Effect.runPromise);
```
