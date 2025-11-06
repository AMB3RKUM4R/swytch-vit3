// functions/.eslintrc.js
module.exports = {
  // --- THIS IS THE FIX ---
  ignorePatterns: [".eslintrc.js"],
  // --- END OF FIX ---
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
    project: ["tsconfig.json"], // This line was correct
    sourceType: "module",
  },
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    // ... (your other rules)
  },
};