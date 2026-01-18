import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "Q8SportApp/**",
      "scripts/**",
      "prisma/**",
      "src/examples/**",
      "src/app/**/page-backup.tsx",
      "src/app/**/page-old-backup.tsx",
      "src/app/**/temp-page.tsx",
      "src/app/auctions/test/**",
      "*.js",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default eslintConfig;
