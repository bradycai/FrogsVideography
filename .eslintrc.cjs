/* Minimal, low-noise lint setup: base JS + TypeScript + Astro. */
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  extends: ['eslint:recommended'],
  ignorePatterns: ['dist/', 'node_modules/', '.astro/', 'current-site.html', '**/*.d.ts'],
  overrides: [
    {
      files: ['*.ts'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
    },
    {
      files: ['*.astro'],
      parser: 'astro-eslint-parser',
      parserOptions: { parser: '@typescript-eslint/parser', extraFileExtensions: ['.astro'] },
      plugins: ['@typescript-eslint'],
      extends: ['plugin:astro/recommended'],
    },
  ],
};
