module.exports = {
  automock: false,
  testPathIgnorePatterns: ['node_modules'],
  setupFiles: ['babel-polyfill'],
  testMatch: ['**/tests/**/*.js'],
};
