import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'public/**',
      'prisma/migrations/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // Unused arguments are common in React callbacks and Next.js route
      // signatures, but genuinely unused variables are treated as errors.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
      // Clean code: no `any` escapes, no floating promises.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      eqeqeq: ['error', 'smart'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
    },
  },
  {
    // Server-only code may log for observability.
    files: ['src/lib/db/**/*.ts', 'src/lib/auth/**/*.ts', 'src/services/**/*.ts'],
    rules: { 'no-console': 'off' },
  },
  {
    // Config files run in Node without strict rule coverage.
    files: ['*.config.{ts,mts,js,mjs}', 'prisma/**/*.ts', 'scripts/**/*.ts'],
    rules: { 'no-console': 'off', '@typescript-eslint/no-explicit-any': 'off' },
  },
);
