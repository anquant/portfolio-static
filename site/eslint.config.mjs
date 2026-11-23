import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      // `_`-prefixed names are deliberately unused (e.g. omitting a key via rest)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      // Russian copy uses typographic quotes freely
      'react/no-unescaped-entities': 'off',
      // Syncing state from the router query (pagination/category) and the
      // post-hydration browser sniffing in useSafari are intentional.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    // Shared with the AppointmentsApp frontend: same import layout and
    // statement shape across projects
    rules: {
      curly: ['error', 'all'],
      'padding-line-between-statements': ['error', { blankLine: 'always', prev: '*', next: 'return' }],
      'import/newline-after-import': ['error', { count: 1 }],
      'import/order': [
        'error',
        {
          alphabetize: { order: 'asc', caseInsensitive: true },
          groups: ['builtin', 'external', ['internal', 'parent'], ['sibling', 'index']],
          'newlines-between': 'always',
          pathGroups: [{ pattern: '@/**', group: 'internal', position: 'before' }],
          pathGroupsExcludedImportTypes: [],
        },
      ],
    },
  },
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
];

export default eslintConfig;
