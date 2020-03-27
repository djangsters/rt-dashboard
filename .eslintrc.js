module.exports = {
  extends: [
    'standard',
  ],

  parserOptions: {
    sourceType: 'module',
  },

  env: {
    browser: true,
    es2020: true,
  },

  rules: {
    'comma-dangle': ['error', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'always-multiline',
    }],
  },
}
