import { readFileSync, unlinkSync } from "node:fs";
import { join, basename } from "node:path";
import { serializeStringWithSingleQuotes, writeFileLines } from "./utils";

async function main() {
  const moduleFilePath = process.argv[2];
  if (!moduleFilePath) throw new Error("Module file path is required");
  const outputBaseFilePath = join(
    process.cwd(),
    "dist",
    basename(moduleFilePath, ".ts"),
  );

  // Run tsup to build and minify the JS module
  await Bun.build({
    entrypoints: [moduleFilePath],
    outdir: "dist",
    format: "iife",
    target: "browser",
    minify: true,
  });

  // Read the built JS module and generate a `.min.ts` file that exports it as a string
  let builtJsModule = readFileSync(`${outputBaseFilePath}.js`, "utf-8");
  builtJsModule = builtJsModule.replace(/^"use strict";\r?\n?/, "").trim();
  // Wrap the code into a try...catch block to prevent errors from affecting other scripts
  builtJsModule = `try{${builtJsModule}}catch(e){console.error("[EC] ${basename(moduleFilePath, ".ts")} failed:",e)}`;
  const jsModuleAsString = `
/*
	GENERATED FILE - DO NOT EDIT
	----------------------------
	This JS module code was built from the source file "${basename(moduleFilePath)}".
	To change it, modify the source file and then re-run the build script.
*/

export default ${serializeStringWithSingleQuotes(builtJsModule)}
`.trimStart();
  writeFileLines(moduleFilePath.replace(/\.ts$/, ".min.ts"), jsModuleAsString);

  // Cleanup: Remove temporary files
  unlinkSync(`${outputBaseFilePath}.js`);
}

main();
