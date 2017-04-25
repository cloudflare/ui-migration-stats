'use strict';
const constants = {
  COMMON_KEYS: {
    EXTENSION: 'extension',
    LENGTH: 'length',
    LOC: 'loc',
    LOC_CAPS: 'Loc',
    NUMBER_COLOR: 'cyan',
    PATH: 'path',
    SAVED: 'Stats saved to file!'
  },
  CONFIG_KEYS: {
    EXCLUDE: 'exclude',
    FILETYPES: 'filetypes',
    FRAMEWORK1: 'framework1',
    FRAMEWORK2: 'framework2',
    INCLUDE_ONLY: 'includeOnly',
    NAME: 'name',
    OPTIONS: 'options',
    OPTIONS_KEYS: {
      FILENAME: 'outputFilename',
      MODULES: 'modules',
      SILENT: 'silent',
      SORT: 'sort',
      SUBDIRECTORIES: 'subdirectories',
      UNCONDITIONAL_LOC: 'unconditionalLoc',
      WEBPACK_STATS: 'webpackStatsFile',
      WEBPACK_STATS_OUTPUT: 'webpackStatsOutputFilename'
    },
    PATH: 'path',
    SRC: 'src',
    TEST: 'test'
  },
  STATS_KEYS: {
    FILETYPES: 'filetypes',
    NAME: 'name',
    PERCENTAGE_FILES: 'percentageFiles',
    PERCENTAGE_LOC: 'percentageLoc',
    SRC: 'src',
    SRC_LOC: 'srcLoc',
    SRC_FILES: 'srcFiles',
    SRC_PATH: 'srcPath',
    SRC_FILETYPES: 'srcFiletypes',
    TEST_FILETYPES: 'testFiletypes',
    SRC_SUBDIRECTORY: 'srcSubdirectories',
    TEST: 'test',
    TEST_FILES: 'testFiles',
    TEST_LOC: 'testLoc',
    TEST_PATH: 'testPath',
    TEST_SUBDIRECTORY: 'testSubdirectories',
    TIMESTAMP: 'timestamp',
    TOTAL: 'total',
    UNRECOGNIZED: 'unrecognized'
  },
  WEBPACK_KEYS: {
    COUNT: 'count',
    ENTRY: 'entry',
    EXPORTS: 'exports',
    ISSUERS: 'issuers',
    MODULE: 'module',
    WEBPACK_STATS: 'webpackStats'
  }
};

module.exports = constants;
