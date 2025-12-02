// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const copyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const isProduction = process.env.NODE_ENV == "production";

/*const stylesHandler = isProduction
  ? MiniCssExtractPlugin.loader
  : "style-loader";*/

const stylesHandler = "style-loader";

const config = {
  entry: "./src/main.tsx",
  output: {
    path: path.resolve(__dirname, "dist"),
  },
  externals: {
    "react": "React",
    "react-dom": "ReactDOM"
  },
  devServer: {
    open: true,
    host: "localhost",
  },
  plugins: [
    new copyWebpackPlugin({
        patterns: [
            {
              from: path.resolve(__dirname, "src", "manifest.json"),
              to: path.resolve(__dirname, "dist", "manifest.json"),
            },
            {
              from: path.resolve(__dirname, "src", "preview.webp"),
              to: path.resolve(__dirname, "dist", "preview.webp"),
            }
        ]
    }),
    // new BundleAnalyzerPlugin()

    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
    {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('CopyBuildToBetterNCM', (compilation) => {
          const fs = require('fs');
          const path = require('path');
          const targetPath = "C:\\betterncm\\plugins_dev\\refine";
          const outputPath = compilation.outputOptions.path;
          
          console.log(`[CopyBuildToBetterNCM] Starting copy from ${outputPath} to ${targetPath}`);

          if (!fs.existsSync(targetPath)) {
             console.log(`[CopyBuildToBetterNCM] Creating directory ${targetPath}`);
             try {
               fs.mkdirSync(targetPath, { recursive: true });
             } catch (err) {
               console.error(`[CopyBuildToBetterNCM] Failed to create directory: ${err.message}`);
               return;
             }
          }

          for (const assetName in compilation.assets) {
            const srcPath = path.join(outputPath, assetName);
            const destPath = path.join(targetPath, assetName);
            const destDir = path.dirname(destPath);
            
            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }

            try {
              if (fs.existsSync(srcPath)) {
                fs.copyFileSync(srcPath, destPath);
                console.log(`[CopyBuildToBetterNCM] Copied ${assetName}`);
              } else {
                 // Fallback for memory assets
                 const asset = compilation.assets[assetName];
                 const content = asset.source();
                 fs.writeFileSync(destPath, content);
                 console.log(`[CopyBuildToBetterNCM] Copied ${assetName} from memory`);
              }
            } catch (e) {
              console.error(`[CopyBuildToBetterNCM] Error copying ${assetName}:`, e);
            }
          }
          console.log(`[CopyBuildToBetterNCM] Copy complete.`);
        });
      }
    },
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      "path": require.resolve("path-browserify")
    }
  },
  module: {
    rules: [
      {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
      },
      {
        test: /\.(js|jsx)$/i,
        loader: "babel-loader",
      },
      {
        test: /\.css$/i,
        use: [stylesHandler, "css-loader"],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [stylesHandler, "css-loader", "sass-loader"],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },
      {
        test: /settings-menu\.html/i,
        type: "asset/source"
      }

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  
  experiments: {
      topLevelAwait: true
  },

  devtool: 'source-map',

  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },

  optimization: {
    minimizer: [new TerserPlugin({
      terserOptions: {
        format: {
          comments: false,
          beautify: false,
        },
        compress: {
          drop_console: false,
        },
      },
      extractComments: false,
    })],
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = "production";

    //config.plugins.push(new MiniCssExtractPlugin());
  } else {
    config.mode = "development";
  }
  
  
  return config;
};
