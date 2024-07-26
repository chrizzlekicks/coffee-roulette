import { FlatCompat } from '@eslint/eslintrc';
import globals from 'globals';
import path from 'path';
import { fileURLToPath } from 'url';

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

const compat = new FlatCompat({
  baseDirectory: dirName,
  resolvePluginsRelativeTo: dirName,
});

export default [
  {
    ignores: ['public/**'],
  },
  ...compat.extends('airbnb-base', 'plugin:solid/typescript'),
  ...compat.plugins('solid'),
  {
    languageOptions: {
      globals: {
        ...globals.es2024,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    files: ['*.{js,ts}', 'app/javascript/**/*.{js,ts,tsx}'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
    settings: {
      'import/parsers': {
        espree: ['.js', '.ts', '.tsx'],
      },
    },
  },
];
