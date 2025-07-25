const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
  outputDir: 'dist',
  assetsDir: 'static',
  // Configuración para SPA routing
  devServer: {
    historyApiFallback: true,
  },
  configureWebpack: {
    optimization: {
      splitChunks: {
        chunks: 'all',
      }
    }
  }
})
