'use strict';
/* ----- Imports ----- */
const dirTree = require('directory-tree');
const fs = require('fs');
// /* ----- CONSTANTS ----- */
const CONSTANTS = require('../stats-constants.js');

const CONFIG_KEYS = CONSTANTS.CONFIG_KEYS;
const STATS_KEYS = CONSTANTS.STATS_KEYS;
const COMMON_KEYS = CONSTANTS.COMMON_KEYS;

/* ----- Helper Functions ----- */

/** Traverses the children of a tree 
 * @param  {object} parent Object containing the children 
 * @param  {object} currentChildren Object containg the current directory tree
 * @return {object} currentChildren Updated object with new children added
 */
let getChildren = (parent, currentChildren) => {
  //If it has children, it is a directory
  if (parent.children) {
    //Push it into our directory array
    currentChildren.children.push({
      [COMMON_KEYS.PATH]: parent.path,
      [COMMON_KEYS.LENGTH]: parent.children.length
    });
    // For each of it's children recurse
    parent.children.forEach(child => {
      getChildren(child, currentChildren);
    });
  } else {
    // Else it's a file, add it to our file array
    currentChildren.files.push({
      [COMMON_KEYS.PATH]: parent.path,
      //remove the . from the extension
      [COMMON_KEYS.EXTENSION]: parent.extension.replace('.', '')
    });
  }
  return currentChildren;
};

/**
 * Traverses the tree 
 * @param  {string} path Path to traverse
 * @param  {array} filetypes Array of filetypes to include
 * @param  {function} callback Function to execute for each item
 * @return {object} object Tree containing the directory tree
 */
let getFolderTree = (path, filetypes, callback) => {
  return dirTree(path, filetypes, item => {
    callback(item);
  });
};

/**
 * Returns percentage
 * @param  {number} firstValue The first number 
 * @param  {number} secondValue The second number
 * @param  {number} total Total 
 * @return {number} Percentage
 */
let getPercentage = (firstValue, secondValue, total) => {
  return Math.round((firstValue + secondValue) * 100 / total);
};

/**
 * Returns true if component name is present in the array of modules
 * @param  {string} moduleName Name of module
 * @param  {array} modulesList Array of substrings to compare with module name
 * @return {boolean} True if moduleName includes a substring from the list
 */
let ifModuleNameIncludes = (moduleName, modulesList) => {
  for (let i = 0; i < modulesList.length; i++) {
    if (moduleName.includes(modulesList[i])) {
      return true;
    }
  }
  return false;
};

/**
 * Checks if a path exists
 * @param  {string} path The path string
 * @return {boolean} false if path does not exist
 */
let ifPathExists = path => {
  if (!fs.existsSync(path)) {
    return false;
  }
  return true;
};

/**
 * Create a directory if it doesn't exist
 * @param  {string} path to directory to create
 * @return {boolean} true if directory created, else false
 * It also returns false if the directory already exists 
 */
let makeDir = path => {
  if (!ifPathExists(path)) {
    fs.mkdirSync(path);
    return true;
  }
  return false;
};

/**
 * Prints to console
 * @param  {string} text The text to be printed
 * @return {undefined} Doesn't return anything
 */
let print = text => {
  /*eslint no-console: "off"*/
  console.log(text);
  return;
};

/**
 * Builds a comparefunction for Array.sort(comparefunction)
 * @param  {string} The key of the two objects that should be compared
 * @return {function} The compare function
 * Example:
 * (first, second) => {
 *  if (first[key] < second[key]) {
 *     return 1;
 *  }
 *  if (first[key] > second[key]) {
 *     return -1;
 *  }
 *  return 0;
 * }
 */
let sortByKeyFunctionBuilder = key => {
  return (first, second) => {
    if (first[key] < second[key]) {
      return 1;
    }
    if (first[key] > second[key]) {
      return -1;
    }
    return 0;
  };
};

/**
 * Generates the stats objects with the correct keys
 * @param  {string} framework The key of the framework 
 * @param  {object} frameworkConfig The Config for the framework
 * @param  {boolean} includeSubdirectories Flag to include subdirectories
 * @return {object} stats The final generated stats object
 */

let statsBuilder = (framework, frameworkConfig, includeSubdirectories) => {
  let stats = {
    [framework]: {
      [STATS_KEYS.NAME]: frameworkConfig[CONFIG_KEYS.NAME],
      [STATS_KEYS.SRC_PATH]: frameworkConfig[CONFIG_KEYS.SRC][CONFIG_KEYS.PATH],
      [STATS_KEYS.SRC_FILETYPES]: frameworkConfig[CONFIG_KEYS.SRC][
        CONFIG_KEYS.FILETYPES
      ],
      [STATS_KEYS.TEST_PATH]: frameworkConfig[CONFIG_KEYS.TEST][
        CONFIG_KEYS.PATH
      ],
      [STATS_KEYS.TEST_FILETYPES]: frameworkConfig[CONFIG_KEYS.TEST][
        CONFIG_KEYS.FILETYPES
      ],
      [STATS_KEYS.SRC_FILES]: 0,
      [STATS_KEYS.TEST_FILES]: 0,
      [STATS_KEYS.PERCENTAGE_FILES]: 0
    }
  };
  //Include subdirectories if the option is true
  if (includeSubdirectories) {
    Object.assign(stats[framework], {
      [STATS_KEYS.SRC_SUBDIRECTORY]: [],
      [STATS_KEYS.TEST_SUBDIRECTORY]: []
    });
  }
  return stats;
};

module.exports = {
  getChildren,
  getFolderTree,
  getPercentage,
  ifModuleNameIncludes,
  ifPathExists,
  makeDir,
  print,
  sortByKeyFunctionBuilder,
  statsBuilder
};
