const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const autoprefixer = require('autoprefixer');
const OfflinePlugin = require('offline-plugin');

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

const cssloader = require('./package').cssloader;

// This file is written in ES5 because it is run via Node.js and is not transpiled by babel. We want to support constious versions of node, so it is best to not use any ES6 features even if newer versions support ES6 features out of the box.

const plugins = [
	new webpack.LoaderOptionsPlugin({
    minimize: isProd ? true : false,
    debug: isProd ? false : true,
    options: {
      postcss: [
        autoprefixer({
        	browsers: ['last 2 version']
        })
      ],
      eslint: {
				configFile: path.join(__dirname, '.eslintrc'),
        failOnWarning: false,
        failOnError: true,
				quiet: true,
      }
    }
  }),
	new LodashModuleReplacementPlugin( {
		shorthands: true,
		collections: true
	}),
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    minChunks: Infinity,
    filename: 'vendor.bundle.js'
  }),
	new webpack.DefinePlugin( {
		// NODE_ENV is used inside React to enable/disable features that should only
		// be used in development
		'process.env': { NODE_ENV: JSON.stringify(nodeEnv) }
	} ),
	new ExtractTextPlugin({ 
    filename: 'bundle.css', 
    disable: false,
    allChunks: true 
  }),
  new webpack.NoEmitOnErrorsPlugin()
];

if (isProd) {
	// When running in production, we want to use the minified script so that the file is smaller
	plugins.push( 
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: false,
			compress: {
        drop_debugger: true,
        drop_console: true,
        warnings: false,
        screw_ie8: true,
        conditionals: true,
        unused: true,
        comparisons: true,
        sequences: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        join_vars: true,
      },
      output: {
        comments: false
      }
		}), // Minify everything
    new webpack.optimize.AggressiveMergingPlugin() // Merge chunks
    // new OfflinePlugin()
	);
} else {
  plugins.push(
    new webpack.HotModuleReplacementPlugin()
  );
}

module.exports = {
	// Entry points point to the javascript module that is used to generate the script file.
	// The key is used as the name of the script.
	entry: {
		assets: './src/index.js',
		vendor: ['react','react-dom','react-router','redux']
	},
	output: {
		path: path.join(__dirname, '../../../assets/build'),
		filename: 'bundle.js'
	},
	resolve: {
		extensions: ['.js', '.jsx'],
		alias: {
			data: path.join(__dirname, 'src/data'),
			components: path.join(__dirname, 'src/components'),
			utils: path.resolve(__dirname, 'src/utils'),
		},
		modules: ['node_modules', 'src']
	},
	devtool: isProd ? '' : 'eval',
	module: {
		// Webpack loaders are applied when a resource matches the test case
		rules: [      
      {
        test: /\.html$/,
        exclude: [/node_modules/, /public/],
        use: {
          loader: 'file-loader',
          query: {
            name: '[name].[ext]'
          }
        }
      },
      {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract({ use: ['css-loader', 'postcss-loader', 'less-loader'], fallback: 'style-loader' })
      },
			{
				test: /\.scss$/,
				loader: ExtractTextPlugin.extract({ use: ['css-loader', 'sass-loader'], 
				fallback: 'style-loader'})
			},
      // Files
      { test: /\.gif$/, use: 'url-loader?limit=10000&mimetype=image/gif' },
      { test: /\.jpg$/, use: 'url-loader?limit=10000&mimetype=image/jpg' },
      { test: /\.png$/, use: 'url-loader?limit=10000&mimetype=image/png' },
      { test: /\.svg/, use: 'url-loader?limit=26000&mimetype=image/svg+xml' },
      { test: /\.(woff|woff2|ttf|eot)/, use: 'url-loader?limit=1' },
      { test: /\.pdf/, use: 'url-loader?limit=1&mimetype=application/pdf' },
      // JSON 
      {
        test: /\.json$/,
        use: 'json-loader'
      },
			{
        enforce: "pre",
				test: /\.(js|jsx)$/,
				exclude: [/node_modules/, /query-components/, /build/, '/bin/'],
				use: 'eslint-loader',
			},
      {
        test: /\.(js|jsx)$/,
        exclude: [/node_modules/, /query-components/],
        use: [
          'babel-loader'
        ],
      }
    ],
	},
	node: {
		fs: 'empty',
		process: true
	},
	plugins
}
