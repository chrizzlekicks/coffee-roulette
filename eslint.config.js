import { FlatCompat } from '@eslint/eslintrc';
import globals from 'globals';
import path from 'path';
import { fileURLToPath } from 'url';
import * as tsParser from '@typescript-eslint/parser';

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
  ...compat.extends('airbnb-base', 'plugin:@typescript-eslint/recommended', 'plugin:solid/typescript'),
  ...compat.plugins('@typescript-eslint', 'import', 'solid'),
  {
    languageOptions: {
      globals: {
        ...globals.es2024,
      },
      parser: tsParser,
      parserOptions: {
        project: 'tsconfig.json',
      },
    },
    files: ['*.{js,ts}', 'app/javascript/**/*.{js,ts,tsx}'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
      'max-len': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],
    },
    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
  },
];
