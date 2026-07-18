import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "blockchain/tests/**",
      "blockchain/cache/**",
      "blockchain/artifacts/**",
      "blockchain/typechain-types/**",
    ],
  },

  js.configs.recommended,

  {
    files: ["frontend/**/*.{js,jsx}"],

    languageOptions: {
      globals: globals.browser,
    },

    plugins: {
      react,
    },

    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "no-unused-vars": "warn",
      "no-console": "off",
    },

    settings: {
      react: {
        version: "detect",
      },
    },
  },
];