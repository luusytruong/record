const path = require("path");

module.exports = {
  webpack: {
    alias: {
      "~": path.resolve(__dirname, "src"),
    },
    configure: (webpackConfig) => {
      webpackConfig.entry = {
        main: "./src/index.js",
        content: "./src/content/content.js",
      };

      webpackConfig.output.filename = (pathData) => {
        return pathData.chunk.name === "content"
          ? "static/js/content.js"
          : "static/js/[name].[contenthash:8].js";
      };

      return webpackConfig;
    },
  },
};
