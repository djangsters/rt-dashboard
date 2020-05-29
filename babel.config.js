module.exports = {
  env: {
    production: {
      presets: [
        [
          '@babel/preset-env',
          {
            useBuiltIns: 'entry',
          },
        ],
      ],
    },
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current',
            },
          },
        ],
      ],
    },
  },
  plugins: [
    '@babel/plugin-proposal-nullish-coalescing-operator',
  ],
}
