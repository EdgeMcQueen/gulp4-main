const path = require("path");

module.exports = {
	output: {
		filename: "index.js"
	},

	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: require.resolve("babel-loader"),
					query: {
						presets: [
							["@babel/preset-env", { modules: false }]
						]
					}
				}
			}
		]
	},
};
