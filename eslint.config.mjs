import { includeIgnoreFile } from "@eslint/compat";
import { fileURLToPath } from "url";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const gitignorePath = fileURLToPath(new URL("./.gitignore", import.meta.url));

const eslintConfig = [
  includeIgnoreFile(gitignorePath),
  // Additional ESLint-only ignores (not in .gitignore)
  {
    ignores: ["public/lib/**"],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default eslintConfig;
