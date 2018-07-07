
module.exports = {
    entry:  ["babel-polyfill",__dirname + "/front_end/main.js"],
    output: {
        path: __dirname + "/public",
        filename: "bundle.js"
    },

    module: {
        loaders: [
                    {
                        test: /\.json$/,
                        loader: "json-loader",
                        test: /\.jsx$/, loader: 'jsx-loader?harmony'
                    },
                    {
                        test: /\.md$/,
                        loader: "html!markdown"
                    },
                    {
                        test: /\.js$/,
                        exclude: /node_modules/,
                        loader: 'babel-loader',
                        query: {
                            presets: ['es2015','react']
                        }
                    },
                    // Less/ CSS
                    {
                        test: /\.(less)$/,
                        loader: 'style-loader!css-loader'
                    },
                    // Load images.
                    {
                        test: /\.(gif|jpe?g|png)$/,
                        loader: 'url-loader?limit=25000',
                        query: {
                            limit: 10000,
                            name: './images/[name].[ext]'
                        }
                    }
                ],
            },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    devServer: {
        contentBase: "./public",
        historyApiFallback: true,
        inline: true,
        disableHostCheck: true,
        //public: 'ec2-52-89-96-234.us-west-2.compute.amazonaws.com', // That solved it
        port:8009
    }

}
