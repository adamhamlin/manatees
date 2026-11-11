module.exports = {
  extends: ['@adamhamlin/eslint-config'],
  parserOptions: {
    ecmaVersion: 13,
    sourceType: 'module',
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['**/dist/*', '**/.svelte-kit/*'],
  rules: {
    // SvelteKit virtual modules aren't resolvable on disk
    'import/no-unresolved': ['error', { ignore: ['^\\$app/'] }],
  },
  overrides: [
    {
      files: ['**/__tests__/**'],
      plugins: ['jest'],
      extends: ['plugin:jest/all'],
      rules: {
        'jest/prefer-expect-assertions': 'off',
        'jest/prefer-lowercase-title': 'off',
        'jest/max-expects': ['error', { max: 8 }],
        'jest/unbound-method': ['error', { ignoreStatic: true }],
        '@typescript-eslint/unbound-method': 'off', // disable in favor of jest/unbound-method
      },
    },
  ],
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.eslint.json',
        alwaysTryTypes: true,
      },
    },
  },
};
