var path = require('path');
module.exports = {
    entry: {
        index: "./src/index.js"
    },
    output: {
        path: path.resolve(__dirname, "build"),
        filename: "[name].js"
    },
    module: {
        loaders: [{
            test: /\.jsx?$/,
            //exclude: /node_modules/,
            loaders: ['babel']
        }]
    },
    resolve:{
        extensions:['','.js','.jsx']
    }
};
