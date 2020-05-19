module.exports = {
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            useBuiltIns: 'entry',
          },
        ],
      ],
    },
  },
}
