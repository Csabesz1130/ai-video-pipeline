module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true, // If you want ESLint to recognize Jest globals
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from @typescript-eslint/eslint-plugin
  ],
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions: {
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
    ecmaVersion: 'latest', // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    project: './tsconfig.json', // Default project for src files
  },
  plugins: [
    'react',
    '@typescript-eslint',
  ],
  settings: {
    react: {
      version: 'detect', // Automatically detects the React version
    },
  },
  rules: {
    // Add or override rules here
    // For example:
    // 'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform
    // '@typescript-eslint/no-explicit-any': 'warn',
  },
  ignorePatterns: ["dist/", "node_modules/", "src/frontend/vite.config.ts"],
  overrides: [
    {
      files: ['tests/**/*.ts', 'tests/**/*.tsx'], // Target test files
      parserOptions: {
        project: './tests/tsconfig.json', // Use the test-specific tsconfig
      },
      rules: {
        // You can override or add rules specifically for tests here
        // For example, it's common to allow more `any` types in test utility functions
        // '@typescript-eslint/no-explicit-any': 'off',
      }
    }
  ]
}; 