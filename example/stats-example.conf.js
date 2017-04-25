'use strict';
const config = {
  framework1: {
    name: 'Backbone',
    src: {
      exclude: /test/,
      filetypes: ['.js', '.handlebars', '.json'],
      path: './example/javascripts/'
    },
    test: {
      filetypes: ['.js', '.handlebars', '.json'],
      path: './example/tests/',
      includeOnly: /overview/
    }
  },
  framework2: {
    name: 'React',
    src: {
      filetypes: ['.js', '.json'],
      path: './example/react/src/'
    },
    test: {
      filetypes: ['.js', '.json'],
      path: './example/react/test/'
    }
  },
  options: {
    modules: ['Cell', 'Header'],
    outputFilename: './out/stats-out.json',
    silent: false,
    sort: true,
    subdirectories: false,
    unconditionalLoc: true,
    webpackStatsFile: './example/webpack-stats-example.json',
    webpackStatsOutputFilename: './out/webpack-stats-out.json'
  }
};

module.exports = config;
