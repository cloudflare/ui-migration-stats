const assert = require('assert');
const shell = require('shelljs');

/* ----- CONSTANTS ----- */
const CONSTANTS = require('../lib/stats-constants.js');
const STATS_KEYS = CONSTANTS.STATS_KEYS;
const WEBPACK_KEYS = CONSTANTS.WEBPACK_KEYS;
const COMMON_KEYS = CONSTANTS.COMMON_KEYS;
const CONFIG_KEYS = CONSTANTS.CONFIG_KEYS;

/* ----- Outputs -----*/

describe('Stats tests', function() {
  shell.rm('-r', './out');
  shell.exec(`yarn demo -- --config="${__dirname}/stats-test.conf.js"`, {
    silent: true,
    async: false
  });

  const output = require('../out/stats-out.json');
  const webpack_output = require('../out/webpack-stats-out.json');

  describe('Number of files should be correct', function() {
    describe('Backbone src files', function() {
      it('It should have 6 backbone src files', function() {
        assert.equal(6, output[CONFIG_KEYS.FRAMEWORK1][STATS_KEYS.SRC_FILES]);
      });
    });
    describe('Backbone test files', function() {
      it('It should have 2 backbone test files', function() {
        assert.equal(2, output[CONFIG_KEYS.FRAMEWORK1][STATS_KEYS.TEST_FILES]);
      });
    });
    describe('React test files', function() {
      it('It should have 3 react src files', function() {
        assert.equal(3, output[CONFIG_KEYS.FRAMEWORK2][STATS_KEYS.SRC_FILES]);
      });
    });
    describe('React test files', function() {
      it('It should have 5 react test files', function() {
        assert.equal(5, output[CONFIG_KEYS.FRAMEWORK2][STATS_KEYS.TEST_FILES]);
      });
    });
  });

  describe('Subdirectories should be correct', function() {
    describe('Backbone subdirectories', function() {
      it('It should have 3 subdirectories in javascripts', function() {
        assert.equal(
          './example/javascripts/',
          output[CONFIG_KEYS.FRAMEWORK1][STATS_KEYS.SRC_SUBDIRECTORY][0][
            COMMON_KEYS.PATH
          ]
        );
        assert.equal(
          3,
          output[CONFIG_KEYS.FRAMEWORK1][STATS_KEYS.SRC_SUBDIRECTORY][0][
            COMMON_KEYS.LENGTH
          ]
        );
      });
    });
    describe('React subdirectories', function() {
      it('It should have 3 subdirectories in react/src', function() {
        assert.equal(
          './example/react/src/',
          output[CONFIG_KEYS.FRAMEWORK2][STATS_KEYS.SRC_SUBDIRECTORY][0][
            COMMON_KEYS.PATH
          ]
        );
        assert.equal(
          3,
          output[CONFIG_KEYS.FRAMEWORK2][STATS_KEYS.SRC_SUBDIRECTORY][0][
            COMMON_KEYS.LENGTH
          ]
        );
      });
    });
  });

  describe('File percentage should be correct', function() {
    describe('Backbone percentage', function() {
      it('It should be 50 percent', function() {
        assert.equal(
          50,
          output[CONFIG_KEYS.FRAMEWORK1][STATS_KEYS.PERCENTAGE_FILES]
        );
      });
    });
    describe('React percentage', function() {
      it('It should be 50 percent', function() {
        assert.equal(
          50,
          output[CONFIG_KEYS.FRAMEWORK2][STATS_KEYS.PERCENTAGE_FILES]
        );
      });
    });
  });

  describe('LOC stats should be correct', function() {
    describe('Backbone LOC', function() {
      it('It should have correct LOC stats', function() {
        assert.deepEqual(
          {
            total: 143,
            source: 100,
            comment: 16,
            single: 16,
            block: 0,
            mixed: 0,
            empty: 18,
            todo: 0,
            unrecognized: 9
          },
          output[CONFIG_KEYS.FRAMEWORK1][STATS_KEYS.SRC_LOC]
        );
        assert.deepEqual(
          {
            total: 133,
            source: 91,
            comment: 17,
            single: 17,
            block: 0,
            mixed: 0,
            empty: 25,
            todo: 0
          },
          output[CONFIG_KEYS.FRAMEWORK1][STATS_KEYS.TEST_LOC]
        );
      });
    });
    describe('React LOC', function() {
      it('It should have correct LOC stats', function() {
        assert.deepEqual(
          {
            total: 220,
            source: 167,
            comment: 30,
            single: 3,
            block: 27,
            mixed: 0,
            empty: 23,
            todo: 1
          },
          output[CONFIG_KEYS.FRAMEWORK2][STATS_KEYS.SRC_LOC]
        );
        assert.deepEqual(
          {
            total: 469,
            source: 316,
            comment: 74,
            single: 42,
            block: 32,
            mixed: 0,
            empty: 79,
            todo: 0
          },
          output[CONFIG_KEYS.FRAMEWORK2][STATS_KEYS.TEST_LOC]
        );
      });
    });
  });

  describe('LOC percentage should be correct', function() {
    describe('Backbone percentage', function() {
      it('It should be 29 percent', function() {
        assert.equal(
          29,
          output[CONFIG_KEYS.FRAMEWORK1][STATS_KEYS.PERCENTAGE_LOC]
        );
      });
    });
    describe('React percentage', function() {
      it('It should be 60 percent', function() {
        assert.equal(
          71,
          output[CONFIG_KEYS.FRAMEWORK2][STATS_KEYS.PERCENTAGE_LOC]
        );
      });
    });
  });

  describe('Web pack stats should be correct', function() {
    describe('Cell', function() {
      it('Cell should be named correctly', function() {
        assert.equal(
          './Cell',
          webpack_output[WEBPACK_KEYS.WEBPACK_STATS][0][WEBPACK_KEYS.MODULE]
        );
      });
    });
    describe('Cell count', function() {
      it('Cell should have 41 instances', function() {
        assert.equal(
          2,
          webpack_output[WEBPACK_KEYS.WEBPACK_STATS][0][WEBPACK_KEYS.COUNT]
        );
      });
    });
    describe('Cell issuers', function() {
      it('Cell should have correct issuers', function() {
        assert.deepEqual(
          ['./components/Grid/index.js', './components/Grid/Grid.js'],
          webpack_output[WEBPACK_KEYS.WEBPACK_STATS][0][WEBPACK_KEYS.ISSUERS]
        );
      });
    });
  });
});
