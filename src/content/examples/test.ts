import { Effect } from "effect";
import { FileSystem } from "@effect/platform";

const main = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const file = yield* fs.open("file.txt");

  // seek 4 bytes from the start
  yield* file.seek(4, "start");
  // read into a buffer
  const buffer = new Uint8Array(5);
  const sizeRead = yield* file.read(buffer);

  // seek 2 bytes from the current position
  yield* file.seek(2, "current");
  // read and allocate a buffer for result
  const buffer2 = yield* file.readAlloc(5);
});
