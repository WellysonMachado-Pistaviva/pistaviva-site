import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Ignora build output e vendored — eslint estava varrendo bundles do .next
  // (require/_N_E/Deno/module) e gerando milhares de no-undef falsos.
  globalIgnores(['dist', 'legacy', 'test-*.mjs', '.next', '.netlify', '.vercel', 'out', 'build', 'next-env.d.ts', 'public/**']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      // browser (window/document) + node (process/Buffer) — Next roda nos dois
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Regra do Vite HMR — irrelevante no Next (pages exportam metadata + componente).
      'react-refresh/only-export-components': 'off',
      // Var com prefixo _ = intencionalmente ignorada.
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
])
