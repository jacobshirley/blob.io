const path = require('path');

module.exports = {
    watch: true,
    entry: './src/index.js',
    mode: "development",
    output: {
      filename: 'build.js',
      path: path.resolve(__dirname, 'public'),
    },
};
