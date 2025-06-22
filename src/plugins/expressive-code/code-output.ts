// https://github.com/FujoWebDev/fujocoded-plugins/tree/main/expressive-code-output

import { definePlugin, AttachedPluginData } from "@expressive-code/core";
import { h } from "@expressive-code/core/hast";
import { mkdtemp, rm, writeFile, access } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";

interface OutputData {
  output: string[];
}
const outputData = new AttachedPluginData<OutputData>(() => ({ output: [] }));

let sandboxDir: string | null = null;

const packageJson = {
  dependencies: {
    "@effect/experimental": "latest",
    "@effect/platform": "latest",
    "@effect/platform-node": "latest",
    "@effect/cli": "latest",
    "@effect/cluster": "latest",
    "@effect/rpc": "latest",
    effect: "latest",
  },
};

function createCodeHash(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

async function ensureSandbox(): Promise<string> {
  if (sandboxDir) {
    try {
      // Check if sandbox still exists and is valid
      await access(join(sandboxDir, "package.json"));
      return sandboxDir;
    } catch {
      // Sandbox is corrupted, recreate it
      sandboxDir = null;
    }
  }

  // Create new sandbox
  sandboxDir = await mkdtemp(join(tmpdir(), "effect-sandbox-"));

  // Write package.json
  await writeFile(
    join(sandboxDir, "package.json"),
    JSON.stringify(packageJson, null, 2),
  );

  // Install dependencies
  const installProc = Bun.spawn(["bun", "install"], {
    cwd: sandboxDir,
    stdout: "pipe",
    stderr: "pipe",
  });

  await installProc.exited;

  if (installProc.exitCode !== 0) {
    const stderr = await new Response(installProc.stderr).text();
    throw new Error(`Failed to install dependencies: ${stderr}`);
  }

  return sandboxDir;
}

async function executeCodeInSandbox(code: string): Promise<string[]> {
  const sandbox = await ensureSandbox();
  const codeHash = createCodeHash(code);
  const snippetFile = join(sandbox, `snippet-${codeHash}.ts`);

  // Write code to file
  await writeFile(snippetFile, code);

  const proc = Bun.spawn(["bun", "run", snippetFile], {
    cwd: sandbox,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 5000, // 5 second timeout
  });

  await proc.exited;

  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();

  if (proc.exitCode !== 0) {
    throw new Error(
      `Code execution failed with exit code ${proc.exitCode}: ${stderr}`,
    );
  }

  const output = [...stdout.split("\n"), ...stderr.split("\n")].filter(
    (line) => line.trim() !== "",
  );

  // Clean up snippet file
  try {
    await rm(snippetFile);
  } catch {
    // Ignore cleanup errors
  }

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
        if (!blockData.output.length) return;

        const lastPre = context.renderData.blockAst.children.findLastIndex(
          (child) => child.type === "element" && child.tagName === "pre",
        );

        if (lastPre === -1) return;

        const currentChildren = context.renderData.blockAst.children;
        const newChildren = [
          ...currentChildren.slice(0, lastPre + 1),
          h(
            "pre.output",
            blockData.output.map((line) => h("div", line)),
          ),
          ...currentChildren.slice(lastPre + 1),
        ];
        context.renderData.blockAst.children = newChildren;
      },
    },
  });
}
