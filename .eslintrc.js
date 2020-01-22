module.exports = {
  root: true,
  env: {
    browser: true
  },
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint'
  ],
  ignorePatterns: ['lib/', 'node_modules/'],
  overrides: [
    {
      files: ["*.spec.*"],
      env: {
        jest: true,
        es6: true
      },
      rules: {
        "@typescript-eslint/camelcase": ["error", { "properties": "never" }]
      }
    },
    {
      files: ['jest.config.js'],
      env: {
        node: true
      }
    }
  ]
}
