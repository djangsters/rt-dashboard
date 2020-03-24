module.exports = {
  "env": {
    "browser": true,
    "commonjs": true,
    "jasmine": true,
    "es6": true
  },
  "extends": ["eslint:recommended", "standard"],
  "parserOptions": {
    "ecmaFeatures": {
        "jsx": true
    },
    "sourceType": "module"
  },
  "rules": {
    "indent": ["error", 2],
    "linebreak-style": ["error", "unix"]
  }
};
