import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const generatedDir = join(scriptDir, ".generated");
const implPath = join(scriptDir, "validate-edit-qa.impl.mjs");

if (!existsSync(implPath)) {
  await mkdir(generatedDir, { recursive: true });
  const encoded = await readFile(join(scriptDir, "validate-edit-qa.impl.b64"), "utf8");
  await writeFile(implPath, Buffer.from(encoded.replace(/\s/g, ""), "base64"));
}

await import(`file://${implPath}`);
