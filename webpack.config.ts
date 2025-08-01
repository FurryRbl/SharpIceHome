import path from 'node:path';
import webpack from 'webpack';
import WebpackBar from 'webpackbar';
import TerserPlugin from 'terser-webpack-plugin';
import localPostcssOptions from './postcss.config';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import fontsMinify from '@sharpice_home/webpack-fonts-minify';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import type { WebpackConfiguration } from 'webpack-dev-server';
import HtmlMinimizerPlugin from 'html-minimizer-webpack-plugin';
import { VueLoaderPlugin, type VueLoaderOptions } from 'vue-loader';
import type { LoaderOptions as ESBuildLoaderOptions } from 'esbuild-loader';
import type { LoaderOptions as svgToVueLoaderOptions } from 'svg-to-vue-loader';

export default (env: Record<string, unknown>) => {
	const isDevelopmentMode = env.WEBPACK_SERVE?.toString() === 'true';

	const esbuildOption: ESBuildLoaderOptions = {
		format: 'esm',
		charset: 'utf8',
		target: 'ES2022',
		logLevel: 'info',
		treeShaking: true,
		platform: 'browser',
		legalComments: 'none',
	};

	return {
		entry: path.resolve('./src/main.ts'),
		output: {
			clean: true,
			path: path.resolve('./dist'),
			filename: isDevelopmentMode ? 'assets/js/[name].js' : 'assets/js/[name].[contenthash].js',
			module: !isDevelopmentMode,
			library: {
				type: isDevelopmentMode ? 'umd2' : 'module',
			},
		},
		experiments: {
			outputModule: !isDevelopmentMode,
		},
		cache: {
			type: isDevelopmentMode ? 'filesystem' : 'memory',
		},
		devServer: {
			hot: true,
			port: 8600,
			open: false,
			host: '127.0.0.1',
			historyApiFallback: true,
			static: [path.resolve('./public')],
			client: {
				overlay: false,
			},
		},
		resolve: {
			extensions: ['.ts', '.js'],
			alias: [
				{
					name: 'vue$',
					alias: 'vue/dist/vue.runtime.esm-bundler.js',
				},
				{
					name: '@',
					alias: path.resolve('./node_modules'),
				},
				{
					name: '$',
					alias: path.resolve('./src'),
				},
			],
		},
		module: {
			rules: [
				{
					test: /\.css$/,
					use: [
						MiniCssExtractPlugin.loader,
						{
							loader: 'css-loader',
							options: {
								url: {
									filter: (url: string): boolean => {
										if (url.startsWith('/')) {
											return false;
										}

										return true;
									},
								},
								esModule: false,
								importLoaders: 1,
							},
						},
						{
							loader: 'postcss-loader',
							options: {
								postcssOptions: localPostcssOptions,
							},
						},
					],
				},
				{
					test: /\.less$/,
					use: [
						MiniCssExtractPlugin.loader,
						{
							loader: 'css-loader',
							options: {
								url: {
									filter: (url: string): boolean => {
										if (url.startsWith('/')) {
											return false;
										}

										return true;
									},
								},
								esModule: false,
								importLoaders: 2,
							},
						},
						{
							loader: 'postcss-loader',
							options: {
								postcssOptions: localPostcssOptions,
							},
						},
						'less-loader',
					],
				},
				{
					test: /\.ts$/,
					loader: 'esbuild-loader',
					exclude: /node_modules/,
					options: {
						loader: 'ts',
						...esbuildOption,
					},
				},
				{
					test: /\.js$/,
					loader: 'esbuild-loader',
					exclude: /node_modules/,
					options: {
						loader: 'js',
						...esbuildOption,
					},
				},
				{
					test: /\.vue$/,
					loader: 'vue-loader',
					options: {
						hotReload: isDevelopmentMode,
					} satisfies VueLoaderOptions,
				},
				{
					test: /\.svg$/,
					use: [
						{
							loader: 'vue-loader',
							options: {
								hotReload: isDevelopmentMode,
							} satisfies VueLoaderOptions,
						},
						{
							loader: 'svg-to-vue-loader',
							options: {
								defaultSize: 20,
								enableSvgo: true,
								removeAllFill: true,
								useFillCurrentColor: true,
								svgoConfig: {
									multipass: true,
								},
							} satisfies svgToVueLoaderOptions,
						},
					],
				},
				{
					test: /\.(png|webp)$/i,
					type: 'asset/resource',
					generator: {
						filename: 'assets/images/[contenthash][ext]',
					},
				},
				{
					test: /\.ttf$/i,
					type: 'asset/resource',
					generator: {
						filename: 'assets/fonts/[contenthash][ext]',
					},
				},
			],
		},
		plugins: [
			new VueLoaderPlugin(),
			new WebpackBar({
				color: '#72C9FF',
				name: 'SharpIce Home',
				profile: !isDevelopmentMode,
			}),
			new webpack.DefinePlugin({
				__VUE_OPTIONS_API__: true,
				__VUE_PROD_DEVTOOLS__: isDevelopmentMode,
				__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,

				// 开发环境特殊变量
				__DEV__: JSON.stringify(isDevelopmentMode),
			}),
			new CopyWebpackPlugin({
				patterns: [
					{
						from: path.resolve('./public'),
						to: path.resolve('./dist'),
					},
				],
			}),
			new HtmlWebpackPlugin({
				scriptLoading: 'module',
				template: path.resolve('./template/index.html'),
			}),
			new MiniCssExtractPlugin({
				filename: isDevelopmentMode ? 'assets/css/[name].css' : 'assets/css/[name].[contenthash].css',
			}),

			isDevelopmentMode ? new webpack.optimize.ModuleConcatenationPlugin() : undefined,

			env.analyze ? new BundleAnalyzerPlugin() : undefined,
		],
		optimization: {
			innerGraph: true,
			usedExports: true,
			sideEffects: true,
			runtimeChunk: true,
			avoidEntryIife: true,
			providedExports: true,
			removeEmptyChunks: true,
			flagIncludedChunks: true,
			removeAvailableModules: true,
			minimize: !isDevelopmentMode,
			splitChunks: {
				chunks: 'all',
			},
			minimizer: [
				new fontsMinify({
					scanPaths: [path.resolve('./src'), path.resolve('./template')],
				}),
				new TerserPlugin({
					parallel: true,
					extractComments: false,
					terserOptions: {
						ecma: 2020,
						module: true,
						toplevel: true,
						keep_fnames: false,
						keep_classnames: false,
						compress: {
							passes: 4,
							unsafe: true,
							unsafe_arrows: true,
							unsafe_methods: true,
							unsafe_proto: true,
							unsafe_undefined: true,
							hoist_props: true,
							hoist_vars: true,
							reduce_funcs: true,
							reduce_vars: true,
							collapse_vars: true,
							pure_getters: true,
							drop_console: true,
							drop_debugger: true,
							arguments: true,
							unused: true,
							dead_code: true,
							booleans_as_integers: true,
						},
						output: {
							comments: false,
							beautify: false,
						},
					},
				}),
				new HtmlMinimizerPlugin({
					parallel: true,
					minimizerOptions: {
						minifyJS: true,
						minifyCSS: true,
						sortClassName: true,
						removeComments: true,
						sortAttributes: true,
						caseSensitive: false,
						useShortDoctype: true,
						keepClosingSlash: false,
						collapseWhitespace: true,
						removeEmptyAttributes: true,
						removeRedundantAttributes: true,
						collapseBooleanAttributes: true,
					},
				}),
				new CssMinimizerPlugin({
					parallel: true,
					minimizerOptions: {
						preset: [
							'default',
							{
								mergeRules: true,
								mergeMedia: true,
								discardDuplicates: true,
								discardComments: {
									removeAll: true,
								},
								level: {
									1: {
										all: true,
									},
									2: {
										removeUnused: true,
										reduceNonAdjacentRules: true,
										removeDuplicateFontRules: true,
										removeDuplicateMediaBlocks: true,
									},
								},
							},
						],
					},
				}),
			],
		},
		stats: isDevelopmentMode ? 'minimal' : 'detailed',
		devtool: isDevelopmentMode ? 'eval-cheap-module-source-map' : false,
	} satisfies WebpackConfiguration;
};
