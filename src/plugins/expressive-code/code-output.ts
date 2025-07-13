// https://github.com/FujoWebDev/fujocoded-plugins/tree/main/expressive-code-output

import { definePlugin, AttachedPluginData } from "@expressive-code/core";
import { h } from "@expressive-code/core/hast";
import { Sandbox as VercelSandbox } from "@vercel/sandbox";
import {
  Cause,
  Context,
  Duration,
  Effect,
  Layer,
  ManagedRuntime,
} from "effect";
import { createHash } from "crypto";
import { Command, CommandExecutor, FileSystem } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";

interface OutputData {
  output: string | null;
}
const outputData = new AttachedPluginData<OutputData>(() => ({ output: null }));

async function initVercelSandbox(): Promise<VercelSandbox> {
  const sandbox = await VercelSandbox.create({
    source: {
      url: "https://github.com/ethanniser/effect-sandbox-template.git",
      type: "git",
    },
    resources: { vcpus: 2 },
    timeout: Duration.toMillis("1 minute"),
    runtime: "node22",
  });

  // Download bun
  const download = await sandbox.runCommand({
    cmd: "curl",
    args: [
      "-L",
      "-o",
      "bun-linux-x64.zip",
      "https://github.com/oven-sh/bun/releases/download/bun-v1.2.18/bun-linux-x64.zip",
    ],
    stderr: process.stderr,
    stdout: process.stdout,
  });

  if (download.exitCode != 0) {
    throw new Error("downloading bun failed");
  }

  // Extract bun
  const extract = await sandbox.runCommand({
    cmd: "unzip",
    args: ["bun-linux-x64.zip"],
    stderr: process.stderr,
    stdout: process.stdout,
  });

  if (extract.exitCode != 0) {
    throw new Error("extracting bun failed");
  }

  // Make bun executable and add to PATH
  const makeExecutable = await sandbox.runCommand({
    cmd: "chmod",
    args: ["+x", "bun-linux-x64/bun"],
    stderr: process.stderr,
    stdout: process.stdout,
  });

  if (makeExecutable.exitCode != 0) {
    throw new Error("making bun executable failed");
  }

  const install = await sandbox.runCommand({
    cmd: "./bun-linux-x64/bun",
    args: ["install"],
    stderr: process.stderr,
    stdout: process.stdout,
  });

  if (install.exitCode != 0) {
    throw new Error("installing packages failed");
  }

  return sandbox;
}

const hash = (code: string) => createHash("md5").update(code).digest("hex");

class Sandbox extends Context.Tag("Sandbox")<
  Sandbox,
  {
    runCode: (code: string) => Effect.Effect<string, Cause.UnknownException>;
  }
>() {
  static layerVercel = Layer.scoped(
    this,
    Effect.gen(function* () {
      const sandbox = yield* Effect.acquireRelease(
        Effect.tryPromise(initVercelSandbox),
        (sandbox) => Effect.promise(() => sandbox.stop()),
      );

      const runCode = (code: string) =>
        Effect.tryPromise(async () => {
          const name = hash(code);
          console.log("executing code in sandbox", name);
          await sandbox.writeFiles([
            {
              path: `${name}.ts`,
              content: Buffer.from(code),
            },
          ]);

          const run = await sandbox.runCommand({
            cmd: "./bun-linux-x64/bun",
            args: ["run", `${name}.ts`],
          });

          const output = await run.output("both");
          return output;
        });

      return {
        runCode,
      };
    }),
  );

  static layerLocal = Layer.effect(
    this,
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const cmdEx = yield* CommandExecutor.CommandExecutor;

      console.log("installing packages");
      const installExit = yield* Command.make("bun", "install").pipe(
        Command.workingDirectory("sandbox-template"),
        Command.exitCode,
      );

      if (installExit !== 0) {
        yield* new Cause.UnknownException("installing packages failed");
      }

      const runCode = (code: string) =>
        Effect.gen(function* () {
          const name = hash(code);
          yield* fs.writeFileString(`./sandbox-template/${name}.ts`, code);
          yield* Effect.addFinalizer(() =>
            fs
              .remove(`./sandbox-template/${name}.ts`)
              .pipe(Effect.ignoreLogged),
          );

          console.log(`executing code in sandbox ${name}`);
          const result = yield* Command.make("bun", "run", `${name}.ts`).pipe(
            Command.workingDirectory("sandbox-template"),
            Command.string,
          );

          return result;
        }).pipe(
          Effect.mapError((e) => new Cause.UnknownException(e)),
          Effect.scoped,
          Effect.provideService(CommandExecutor.CommandExecutor, cmdEx),
        );

      return {
        runCode,
      };
    }),
  );
}

const layer = process.env.VERCEL
  ? Sandbox.layerVercel
  : Sandbox.layerLocal.pipe(Layer.provide(NodeContext.layer));

const managedRuntime = ManagedRuntime.make(layer.pipe(Layer.orDie));

export function pluginCodeOutput() {
  return definePlugin({
    name: "Code output",
    baseStyles: `
		  .expressive-code .frame pre.output {
		    background-color: #171a28;
		    display: block;
		    border: var(--ec-brdWd) solid var(--ec-brdCol);
		    border-top: var(--ec-brdWd) dashed var(--ec-brdCol);
		    padding: var(--ec-codePadBlk) 0;
		    padding-inline-start: var(--ec-codePadInl);
		  }
		    `,
    hooks: {
      preprocessCode: async (context) => {
        if (!context.codeBlock.meta.includes("withOutput")) return;

        const blockData = outputData.getOrCreateFor(context.codeBlock);

        // Get the full code content
        const code = context.codeBlock
          .getLines()
          .map((line) => line.text)
          .join("\n");

        // Execute the code in a sandbox and capture output
        const output = await managedRuntime.runPromise(
          Effect.flatMap(Sandbox, (sandbox) => sandbox.runCode(code)),
        );
        blockData.output = output;
      },
      postprocessRenderedBlock: async (context) => {
        if (!context.codeBlock.meta.includes("withOutput")) return;

        const blockData = outputData.getOrCreateFor(context.codeBlock);
        if (!blockData.output) return;

        const lastPre = context.renderData.blockAst.children.findLastIndex(
          (child) => child.type === "element" && child.tagName === "pre",
        );

        if (lastPre === -1) return;

        const currentChildren = context.renderData.blockAst.children;
        const newChildren = [
          ...currentChildren.slice(0, lastPre + 1),
          h("pre.output", blockData.output),
          ...currentChildren.slice(lastPre + 1),
        ];
        context.renderData.blockAst.children = newChildren;
      },
    },
  });
}
