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
  const singleFile = join(scriptDir, "run-mode1-edit.impl.b64");
  if (existsSync(singleFile)) return await readFile(singleFile, "utf8");

  const parts = [];
  for (let index = 1; ; index += 1) {
    const partPath = join(scriptDir, `run-mode1-edit.impl.b64.part${String(index).padStart(2, "0")}`);
    if (!existsSync(partPath)) break;
    parts.push(await readFile(partPath, "utf8"));
  }

  if (!parts.length) {
    throw new Error("Missing run-mode1-edit implementation: expected .impl.b64 or .impl.b64.partNN files.");
  }

  return parts.join("");
}
