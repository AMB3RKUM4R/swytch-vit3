// functions/.eslintrc.js
module.exports = {
  // This tells ESLint to not try to lint itself
  ignorePatterns: [".eslintrc.js"],
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json"],
    sourceType: "module",
  },
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  
  // --- THIS IS THE NEW, FINAL FIX ---
  settings: {
    "import/resolver": {
      // This tells eslint-plugin-import to use the package we just installed
      typescript: {}, 
      // This tells eslint-plugin-import to also look for node built-ins
      // (This fixes the 'crypto', 'buffer', etc. errors)
      node: true, 
    },
  },
  // --- END OF FIX ---

  rules: {
    // These are the rules we relaxed last time
    "max-len": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
  },
};