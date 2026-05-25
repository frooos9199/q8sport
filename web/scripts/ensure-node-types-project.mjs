import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, "..");
const targetDir = path.join(projectRoot, "node_modules", "@types", "node");
const targetFile = path.join(targetDir, "tsconfig.json");

const content = `${JSON.stringify(
  {
    compilerOptions: {
      lib: ["es2020"],
      skipLibCheck: true,
      types: [],
    },
    files: ["index.d.ts"],
  },
  null,
  2,
)}\n`;

await mkdir(targetDir, { recursive: true });
await writeFile(targetFile, content, "utf8");
