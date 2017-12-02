module.exports = {
  files: {
    javascripts: {
      joinTo: {
        'bundle.js': /^app\//,
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