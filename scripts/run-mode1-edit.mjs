import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const generatedDir = join(scriptDir, ".generated");
const implPath = join(generatedDir, "run-mode1-edit.impl.mjs");

if (!existsSync(implPath)) {
  await mkdir(generatedDir, { recursive: true });
  const encoded = await readEncodedImplementation();
  await writeFile(implPath, Buffer.from(encoded.replace(/\s/g, ""), "base64"));
}

await import(`file://${implPath}`);

async function readEncodedImplementation() {
  const chunks = await readSequentialFiles("run-mode1-edit.impl.b64.chunk", 2);
  if (chunks.length) return chunks.join("");

  const singleFile = join(scriptDir, "run-mode1-edit.impl.b64");
  if (existsSync(singleFile)) return await readFile(singleFile, "utf8");

  const parts = await readSequentialFiles("run-mode1-edit.impl.b64.part", 2);
  if (parts.length) return parts.join("");

  throw new Error("Missing run-mode1-edit implementation: expected .impl.b64, .chunkNN, or .partNN files.");
}

async function readSequentialFiles(prefix, width) {
  const files = [];
  for (let index = 1; ; index += 1) {
    const suffix = String(index).padStart(width, "0");
    const path = join(scriptDir, `${prefix}${suffix}`);
    if (!existsSync(path)) break;
    files.push(await readFile(path, "utf8"));

    const tailPath = join(scriptDir, `${prefix}${suffix}.tail`);
    if (existsSync(tailPath)) files.push(await readFile(tailPath, "utf8"));
  }
  return files;
}
