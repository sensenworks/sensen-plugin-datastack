/**
 * Système Utilities
 */
 const path = require('path');

 const HtmlWebpackPlugin = require('html-webpack-plugin');
 

module.exports = {

	target: ['web'],

	mode: 'development',
	
	devtool: 'inline-source-map',

    resolve: {
        fallback: {
            "fs": false,
            "path": false,
        },
    },

	entry: {
		
		basic: './sandbox/sandbox.js',
	
	},


	module:{

		rules:[

			{

				test: /\.js$/,
				
				exclude: /(node_modules)/,
				
				use: { loader: 'babel-loader', }	

			}

		]
		
	},
	
	devServer: {

        open: true,
	
		hot: true,
	
		compress: true,
	
		port: 19629,
	
	},


    
	plugins: [

		new HtmlWebpackPlugin({  
		
			filename: 'index.html',
		
			title: 'Sensen Jutsu',
		
			template: './sandbox/index.htm',
		
			viewport: 'user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height, target-densitydpi=device-dpi, viewport-fit=cover',
		
			themeColor: '#4285f4',

			port: '19629',
		
			// inject: 'body',
		
		}),

	],




	output: {
    
		filename: 'sensen.[name].js',
    
		path: path.resolve(__dirname, './sandbox-build'),
    
		clean: false,
    
	},



    optimization: {
		
        runtimeChunk: 'multiple',
		
    },


    performance: {

        hints: false,
        
		maxEntrypointSize: 512000,
        
		maxAssetSize: 512000

    },



};
