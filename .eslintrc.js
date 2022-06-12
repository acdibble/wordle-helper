module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['airbnb-base', 'airbnb-typescript', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint'],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.ts'],
      },
    },
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        'import/extensions': [
          'error',
          'ignorePackages',
          {
            ts: 'never',
          },
        ],
        '@typescript-eslint/no-unused-vars': 'error',
        semi: 'off',
        '@typescript-eslint/semi': 'error',
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': 'error',
        indent: 'off',
        '@typescript-eslint/indent': 'off',
        'max-len': ['error', 120],
        camelcase: 'off',
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: ['src/**/*.test.ts'],
          },
        ],
        'no-restricted-syntax': 'off',
        'react/jsx-props-no-spreading': 'off',
      },
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  ],
};
