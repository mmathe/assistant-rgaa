'use strict';

const webpack = require('webpack');
const config = require('./webpack.config');



/**
 *
 */
config.plugins.push(
	new webpack.DefinePlugin({
		'process.env.NODE_ENV': JSON.stringify('production')
	}),
	new webpack.optimize.DedupePlugin(),
	new webpack.optimize.OccurrenceOrderPlugin()
	// UglifyJsPlugin désactivé car incompatible avec ES6
	// Si vous avez besoin de minification, utilisez babel-minify-webpack-plugin
	/* new webpack.optimize.UglifyJsPlugin({
		compress: {
			warnings: false
		}
	}) */
);



module.exports = config;
