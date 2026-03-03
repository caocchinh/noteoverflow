import { includeIgnoreFile } from "@eslint/compat";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import { fileURLToPath } from "url";

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
