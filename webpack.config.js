const path = require('path');
const nodeExternals = require('webpack-node-externals');
const ShebangPlugin = require('webpack-shebang-plugin');

module.exports = {
    mode: 'production',
    target: 'node',
    externals: [nodeExternals()],
    entry: './target/unbundled/main.js',
    output: {
        path: path.join(__dirname, 'target/js'),
        filename: 'main.js',
    },
    optimization: {
        minimize: false,
    },
    plugins: [
        new ShebangPlugin()
    ]
};
