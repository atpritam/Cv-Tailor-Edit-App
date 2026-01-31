const react = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");
const next = require("@next/eslint-plugin-next");
const tsEslint = require("typescript-eslint");
const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  {
    ignores: [".next/**"],
  },
  js.configs.recommended,
  ...tsEslint.configs.recommended,
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    plugins: {
      react: react,
      "react-hooks": reactHooks,
      "@next/next": next,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...next.configs.recommended.rules,
      ...next.configs["core-web-vitals"].rules,
    },
  },
];