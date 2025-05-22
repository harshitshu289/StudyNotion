import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["backend/**/*.{js,mjs,cjs}"],
    languageOptions: { globals: globals.node },
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["frontend/**/*.{js,jsx}"],
    languageOptions: { globals: globals.browser },
    plugins: { js, react: pluginReact },
    ...pluginReact.configs.flat.recommended,
  },
]);
