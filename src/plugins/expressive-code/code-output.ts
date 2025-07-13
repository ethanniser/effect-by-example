// https://github.com/FujoWebDev/fujocoded-plugins/tree/main/expressive-code-output

import { definePlugin, AttachedPluginData } from "@expressive-code/core";
import { h } from "@expressive-code/core/hast";
import { Sandbox } from "@vercel/sandbox";
import ms from "ms";

interface OutputData {
  output: string | null;
}
const outputData = new AttachedPluginData<OutputData>(() => ({ output: null }));

async function executeCodeInSandbox(code: string): Promise<string> {
  const sandbox = await Sandbox.create({
    source: {
      url: "https://github.com/ethanniser/effect-sandbox-template.git",
      type: "git",
    },
    resources: { vcpus: 4 },
    timeout: ms("30s"),
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

  await sandbox.writeFiles([
    {
      path: "index.ts",
      content: Buffer.from(code),
    },
  ]);

  const run = await sandbox.runCommand({
    cmd: "./bun-linux-x64/bun",
    args: ["run", "index.ts"],
  });

  const output = await run.output("both");
  return output;
}

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
        const output = await executeCodeInSandbox(code);
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
          h(
            "pre.output",
            blockData.output.split("\n").map((line) => h("div", line)),
          ),
          ...currentChildren.slice(lastPre + 1),
        ];
        context.renderData.blockAst.children = newChildren;
      },
    },
  });
}
