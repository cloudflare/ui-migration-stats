const assert = require('assert');
const shell = require('shelljs');

/* ----- CONSTANTS ----- */
const {
  getChildren,
  getFolderTree,
  getPercentage,
  ifModuleNameIncludes,
  ifPathExists,
  makeDir,
  sortByKeyFunctionBuilder,
  statsBuilder
} = require('../../lib/utils/helpers.js');

describe('Helper functions', function() {
  describe('statsBuilder', function() {
    let frameworkNumber = 'framework1';
    let frameworkConfig = {
      name: 'Backbone',
      src: {
        excludes: [''],
        filetypes: ['.js', '.handlebars', '.json'],
        path: './lib/example/javascripts/'
      },
      test: {
        excludes: [''],
        filetypes: ['.js', '.handlebars', '.json'],
        path: './lib/example/tests/'
      }
    };

    it('It should return stats without subdirectories', function() {
      let includeSubdirectories = false;
      assert.deepEqual(
        {
          framework1: {
            name: 'Backbone',
            srcPath: './lib/example/javascripts/',
            srcFiletypes: ['.js', '.handlebars', '.json'],
            testPath: './lib/example/tests/',
            testFiletypes: ['.js', '.handlebars', '.json'],
            srcFiles: 0,
            testFiles: 0,
            percentageFiles: 0
          }
        },
        statsBuilder(frameworkNumber, frameworkConfig, includeSubdirectories)
      );
    });

    it('It should return stats with subdirectories', function() {
      let includeSubdirectories = true;
      assert.deepEqual(
        {
          framework1: {
            name: 'Backbone',
            srcPath: './lib/example/javascripts/',
            srcFiletypes: ['.js', '.handlebars', '.json'],
            testPath: './lib/example/tests/',
            testFiletypes: ['.js', '.handlebars', '.json'],
            srcFiles: 0,
            testFiles: 0,
            percentageFiles: 0,
            srcSubdirectories: [],
            testSubdirectories: []
          }
        },
        statsBuilder(frameworkNumber, frameworkConfig, includeSubdirectories)
      );
    });
  });

  describe('getPercentage', function() {
    it('It should return correct percentage', function() {
      assert.equal(50, getPercentage(5, 5, 20));
    });
  });

  describe('ifPathExists,', function() {
    it('It should return false for non existent path', function() {
      assert.equal(false, ifPathExists('./somepath/'));
    });
    it('It should return true for an existent path', function() {
      assert.equal(true, ifPathExists('./src'));
    });
  });

  describe('makeDir,', function() {
    it('It should return true after creating the directory', function() {
      assert.equal(true, makeDir('./test/created/'));
      assert.equal(true, ifPathExists('./test/created/'));
    });
    it('It should return false for failure on an existent path', function() {
      assert.equal(false, makeDir('./test/created/'));
      shell.rm('-r', './test/created/');
    });
  });

  describe('sortByKeyFunctionBuilder', function() {
    let sortFunction = sortByKeyFunctionBuilder('key');
    it('It should return 1 for a<b', function() {
      assert.equal(1, sortFunction({ key: 4 }, { key: 5 }));
    });
    it('It should return -1 for a>b', function() {
      assert.equal(-1, sortFunction({ key: 5 }, { key: 4 }));
    });
    it('It should return 0 for a=b', function() {
      assert.equal(0, sortFunction({ key: 4 }, { key: 4 }));
    });
  });

  describe('ifModuleNameIncludes', function() {
    it('It should return true if module name is included', function() {
      assert.equal(
        true,
        ifModuleNameIncludes('componentName', ['Name', 'somethingElse'])
      );
    });
    it('It should return false if module name not is included', function() {
      assert.equal(
        false,
        ifModuleNameIncludes('other', ['component', 'somethingElse'])
      );
    });
  });

  describe('Folder structures', function() {
    let callbackIncrement = 0;
    let tree = getFolderTree(
      './example/javascripts/common',
      ['.js', '.json'],
      () => {
        callbackIncrement++;
      }
    );
    describe('getFolderTree', function() {
      it('should return correct folder tree', function() {
        assert.deepEqual(
          {
            path: './example/javascripts/common',
            name: 'common',
            children: [
              {
                path: 'example/javascripts/common/templates',
                name: 'templates',
                children: [
                  {
                    path: 'example/javascripts/common/templates/locations.json',
                    name: 'locations.json',
                    size: 152,
                    extension: '.json'
                  }
                ],
                size: 152
              },
              {
                path: 'example/javascripts/common/translator.js',
                name: 'translator.js',
                size: 563,
                extension: '.js'
              }
            ],
            size: 715
          },
          tree
        );
      });
      it('should execute callback for each file', function() {
        assert.equal(2, callbackIncrement);
      });
    });
    describe('getChildren', function() {
      it('It should return correct children', function() {
        assert.deepEqual(
          {
            children: [
              { path: './example/javascripts/common', length: 2 },
              { path: 'example/javascripts/common/templates', length: 1 }
            ],
            files: [
              {
                path: 'example/javascripts/common/templates/locations.json',
                extension: 'json'
              },
              {
                path: 'example/javascripts/common/translator.js',
                extension: 'js'
              }
            ]
          },
          getChildren(tree, { children: [], files: [] })
        );
      });
    });
  });
});
