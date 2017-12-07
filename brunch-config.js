module.exports = {
  files: {
    javascripts: {
      joinTo: {
        'bundle.js': /^app\//,
        'vendor.js': /^node_modules\//,
      },
    },
    stylesheets: {
      joinTo: 'bundle.css',
    },
  },
  npm: {
    enabled: true,
  },
  plugins: {
    babel: {
      presets: ['latest'],
    },
    postcss: {
      processors: [require('autoprefixer')]
    }
  }
};