import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/coverage/**', '**/.svelte-kit/**'],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: false,
    braceStyle: 'stroustrup',
    arrowParens: true,
  }),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    },
  },
  {
    files: ['packages/react/**/*.{ts,tsx}', 'apps/playground/**/*.{ts,tsx}'],
    ...reactHooks.configs.flat.recommended,
  },
  {
    // these run on the server, at build time (Vike pre-rendering): no DOM, no framework runtimes, nothing from the browser entries
    // every Vike file but the +client entries, the shell, and the build plugins next to vite.config.ts
    files: ['apps/playground/pages/**/+*.ts', 'apps/playground/src/shell/**/*.ts', 'apps/playground/*.ts'],
    ignores: ['apps/playground/pages/**/+client.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          // `jquery` also matches `@passcore/jquery`; `@passcore/vanilla/element` defines a custom element on import
          { group: ['jquery', 'react-dom/client', 'vue', 'svelte', 'svelte/*', '@passcore/vanilla/element'], message: 'Server-side code can\'t import client runtimes: mount them from the page\'s +client file.' },
          { group: ['**/lib/**'], message: 'src/lib holds the browser code: import it from a +client file.' },
        ],
      }],
    },
  },
  {
    files: ['**/*.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
)
