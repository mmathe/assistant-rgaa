const path = require('path');
const fullPath = path.resolve.bind(null, __dirname);
const {executablePath} = require('puppeteer');
process.env.CHROME_BIN = executablePath();



/**
 *
 */
module.exports = function(config) {
	config.set({
		files: [
			'src/**/*.test.js'
		],
		frameworks: [
			'mocha',
			'chai'
		],
		reporters: [
			'mocha'
		],
                browsers: [
                        'ChromeHeadlessNoSandbox'
                ],
                customLaunchers: {
                        ChromeHeadlessNoSandbox: {
                                base: 'ChromeHeadless',
                                flags: [
                                        '--no-sandbox',
                                        '--disable-setuid-sandbox',
                                        '--disable-dev-shm-usage',
                                        '--single-process',
                                        '--remote-debugging-address=0.0.0.0',
                                        '--remote-debugging-port=9222'
                                ]
                        }
                },
		preprocessors: {
			'src/**/*.js': ['webpack']
		},
		webpack: {
			devtool: 'inline-source-map',
			resolve: {
				alias: {
					'assistant-rgaa': fullPath('src')
				}
			},
			module: {
				loaders: [
					{
						test: /\.js$/,
						include: fullPath('src'),
						loader: 'babel'
					},
					{
						// @see lelandrichardson/enzyme-example-karma-webpack
						test: /\.json$/,
						loader: 'json'
					}
				]
			},
			externals: {
				// @see lelandrichardson/enzyme-example-karma-webpack
				'react/lib/ExecutionEnvironment': true,
				'react/lib/ReactContext': true
			}
		},
		webpackMiddleware: {
			noInfo: true
		}
	});
};
