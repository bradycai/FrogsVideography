/* Minimal, low-noise lint setup: base JS + TypeScript + Astro. */
import js from '@eslint/js';
import globals from 'globals';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import astro from 'eslint-plugin-astro';

export default [
  {
    ignores: ['dist/', '.astro/', '.netlify/', 'current-site.html', '**/*.d.ts'],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
  },
  // TypeScript rules apply to .ts files only, as before.
  ...tsPlugin.configs['flat/recommended'].map((config) => ({ ...config, files: ['**/*.ts'] })),
  ...astro.configs['flat/recommended'],
];
