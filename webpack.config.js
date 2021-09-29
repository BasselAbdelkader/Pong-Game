const path = require('path');
const fs = require('fs');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const onlyUnique = function (value, index, self) {
    return self.indexOf(value) === index;
}

//Ignore node_modules and non ts files
const files = fs.readdirSync('.')
    .filter(x => x.includes("."))
    .map(x => x.split(".").pop())
    .filter(x => x != "ts")
    .filter(onlyUnique)
    .map(x => path.resolve("**." + x))
    .concat(path.resolve("./node_modules/**"))

module.exports = {
    mode: "development",
    watch: true,
    watchOptions: {
        ignored: files
    },
    entry: {
        pong: './pong.ts',
    },
    devtool: 'inline-source-map',
    stats: {
        version: false,
        hash: false,
        entrypoints: false,
        assets: false,
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.mp3$/,
                loader: 'file-loader',
                query: { name: 'assets/[name].[ext]' }
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'pong.html',
            filename: 'pong.html'
        })
    ]
};