module.exports = {
  env: {
    jest: true,
  },
  extends: [
    'plugin:flowtype/recommended',
  ],
  parser: 'babel-eslint',
  rules: {
    'import/no-unresolved': 'off',
    'no-await-in-loop': 'off',
    'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
    'no-continue': 'off',
    'function-paren-newline': ['error', 'consistent'],
  },
  settings: {
    flowtype: {
      onlyFilesWithFlowAnnotation: true,
    }
  },
  plugins: [
    'json',
    'flowtype',
  ],
};
