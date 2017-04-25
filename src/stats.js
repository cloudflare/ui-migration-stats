#!/usr/bin/env node
'use strict';
/* ----- Imports ----- */
const fs = require('fs');
const chalk = require('chalk');
const prettyjson = require('prettyjson');
const sloc = require('sloc');
const args = require('commander');
const path = require('path');
const {
  getChildren,
  getFolderTree,
  getPercentage,
  ifModuleNameIncludes,
  ifPathExists,
  makeDir,
  print,
  sortByKeyFunctionBuilder,
  statsBuilder
} = require('./utils/helpers.js');

/* ----- ARGS ----- */
args
  .version(process.env.npm_package_version)
  .option('-s, --subdirectories', 'Display subdirectories')
  .option('-S, --silent', 'Be silent')
  .option(
    '-c, --config <path>',
    'Set config path, defualts to ./stats.conf.js',
    './stats.conf.js'
  )
  .parse(process.argv);

/* ----- Config File ----- */
// This defaults to stats.conf.js if no argument is specified
const configPath = path.isAbsolute(args.config)
  ? args.config
  : path.join(process.cwd(), args.config);
const config = require(configPath);
console.log(configPath);
/* ----- CONSTANTS ----- */
const CONSTANTS = require('./stats-constants.js');
const CONFIG_KEYS = CONSTANTS.CONFIG_KEYS;
const OPTIONS_KEYS = CONSTANTS.CONFIG_KEYS.OPTIONS_KEYS;
const STATS_KEYS = CONSTANTS.STATS_KEYS;
const WEBPACK_KEYS = CONSTANTS.WEBPACK_KEYS;
const COMMON_KEYS = CONSTANTS.COMMON_KEYS;

// Get framework info
const options = config[CONFIG_KEYS.OPTIONS] || '';
const framework1Config = config[CONFIG_KEYS.FRAMEWORK1];
const framework2Config = config[CONFIG_KEYS.FRAMEWORK2];

const framework1Name = framework1Config[CONFIG_KEYS.NAME];
const framework2Name = framework2Config[CONFIG_KEYS.NAME];

// Init our stats
let webpackStats = {};
let stats = {};

// Exception variable
let hadWarning = false;

// Timestamp
const timestamp = new Date();

// Get webpack config if it exists
let webpackInputFile = {};
if (options[OPTIONS_KEYS.WEBPACK_STATS]) {
  webpackInputFile = require(path.join(
    process.cwd(),
    options[OPTIONS_KEYS.WEBPACK_STATS]
  ));
}

const prettyjsonOptions = {
  numberColor: COMMON_KEYS.NUMBER_COLOR
};

// Checm if we have to be silent
const silent = options[OPTIONS_KEYS.SILENT] || args.silent;

// Check if we need to include subdirectories
const includeSubdirectories =
  options[OPTIONS_KEYS.SUBDIRECTORIES] || args.subdirectories;

// A nice pretty heading
const headingText = chalk.cyan.underline(
  `Comparing ${framework1Name} with ${framework2Name}\n`
);

/* ----- Lets do some real things now ---- */

// Build our stats object
stats = Object.assign(
  { [STATS_KEYS.TIMESTAMP]: timestamp },
  statsBuilder(CONFIG_KEYS.FRAMEWORK1, framework1Config, includeSubdirectories),
  statsBuilder(CONFIG_KEYS.FRAMEWORK2, framework2Config, includeSubdirectories)
);

// Print our pretty heading
if (!silent) {
  print(headingText);
}

// Travese the config object
Object.keys(config).forEach(frameworkNumber => {
  // Do this only if the current key is FW1 or FW2
  if (
    frameworkNumber === CONFIG_KEYS.FRAMEWORK1 ||
    frameworkNumber === CONFIG_KEYS.FRAMEWORK2
  ) {
    // Traverse the subkeys of the framework

    Object.keys(config[frameworkNumber]).forEach(typeOfCode => {
      // Do this only if a typeOfCode is a src or a test
      if (typeOfCode === CONFIG_KEYS.SRC || typeOfCode === CONFIG_KEYS.TEST) {
        // These variables helps us figure out if
        // we're on FW1,FW2 or a test path
        let framework = CONFIG_KEYS.FRAMEWORK1;
        let type = STATS_KEYS.SRC_FILES;
        let subtype = STATS_KEYS.SRC_SUBDIRECTORY;
        let path = config[frameworkNumber][typeOfCode][CONFIG_KEYS.PATH];

        // Fail if path doesnt exist
        if (!ifPathExists(path)) {
          print(
            `ui-migration-stats ${chalk.red('PATH ERROR!:')} ${path} is not a valid path, also make sure you have access permissions!`
          );
          process.exit(1);
        }

        // If this is the second FW, set the variable
        if (frameworkNumber === CONFIG_KEYS.FRAMEWORK2) {
          framework = CONFIG_KEYS.FRAMEWORK2;
        }

        // If this is a test path set these types
        if (typeOfCode === CONFIG_KEYS.TEST) {
          type = STATS_KEYS.TEST_FILES;
          subtype = STATS_KEYS.TEST_SUBDIRECTORY;
        }

        // Get regex for exclude
        let excludeRegExp =
          config[frameworkNumber][typeOfCode][CONFIG_KEYS.EXCLUDE];

        // Get regex for include
        let includeOnlyRegExp =
          config[frameworkNumber][typeOfCode][CONFIG_KEYS.INCLUDE_ONLY];
        // Get the tree and count the total numbe of files
        // This increments the stats for the current FW and
        // its type i.e src or test
        let tree = getFolderTree(
          path,
          config[frameworkNumber][typeOfCode][STATS_KEYS.FILETYPES],
          item => {
            // If this path matches the exclude regex then return
            if (excludeRegExp && excludeRegExp.test(item[COMMON_KEYS.PATH])) {
              return;
            }
            // If this path does not matches the include regex then return
            if (
              includeOnlyRegExp &&
              !includeOnlyRegExp.test(item[COMMON_KEYS.PATH])
            ) {
              return;
            }

            stats[framework][type]++;
          }
        );

        // Recursively traverse the tree
        let subdirectoryTree = getChildren(tree, { children: [], files: [] });

        // Check if we have to do subdirectories too
        if (includeSubdirectories) {
          // Set sub directories in our stats object
          stats[framework][subtype] = subdirectoryTree.children;
        }

        // Get lines of code for each path
        // This reduces the sloc.keys from the sloc package to give us a sloc stats object
        // So we don't have to create one manually
        let slocStats = sloc.keys.reduce(function(acc, cur) {
          acc[cur] = 0;
          return acc;
        }, {});
        // For each subdirectory, get LOC
        subdirectoryTree.files.forEach(file => {
          // Read the file and get back the contents
          if (excludeRegExp && excludeRegExp.test(file[COMMON_KEYS.PATH])) {
            return;
          }

          // If this path does not matches the include regex then return
          if (
            includeOnlyRegExp &&
            !includeOnlyRegExp.test(file[COMMON_KEYS.PATH])
          ) {
            return;
          }

          let code = fs.readFileSync(file[COMMON_KEYS.PATH], 'utf8', function(
            err
          ) {
            if (err) {
              print(chalk.red(err));
            }
          });
          //Check if we support this language
          if (sloc.extensions.indexOf(file[COMMON_KEYS.EXTENSION]) !== -1) {
            // Oh yay! we do support it, check LOC and add to our slocStats
            let resultSloc = sloc(code, file[COMMON_KEYS.EXTENSION]);
            for (let i in sloc.keys) {
              if (sloc.keys.hasOwnProperty(i)) {
                let k = sloc.keys[i];
                slocStats[k] += resultSloc[k];
              }
            }
          } else {
            // We dont know what language this is. Boo
            // If we should Unconditionally read the file based on options
            if (options[OPTIONS_KEYS.UNCONDITIONAL_LOC]) {
              let line_count = 0;
              slocStats[STATS_KEYS.UNRECOGNIZED] = 0;
              // Unconditionally add to total and source
              code.toString().split('\n').forEach(() => {
                line_count++;
              });
              slocStats[STATS_KEYS.TOTAL] += line_count;
              slocStats[STATS_KEYS.UNRECOGNIZED] += line_count;
            } else {
              // Else show a warning, we're skipping this file
              hadWarning = true;
              print(
                `ui-migration-stats ${chalk.yellow('WARNING:')} Unsupported language ${file.extension}, skipped ${file.path}. Set unconditionalLoc in config to include this file.`
              );
            }
          }
        });
        // Figure out what type of key we're attaching to stats loc object
        let typeOfLocKey = `${typeOfCode}${[COMMON_KEYS.LOC_CAPS]}`;
        // Add loc to particular type
        stats[framework][typeOfLocKey] = slocStats;
      } // End IF for SRC || TEST
    }); // End forEach typeOfCode
  } // End IF for CONFIG_KEYS.FRAMEWORK1  || CONFIG_KEYS.FRAMEWORK2
}); // End forEach key

/* ----- Get percentages of each framework by number of files and loc ---- */

//Set to LOC 0 if we didnt find any lines of code for tests
if (!stats[CONFIG_KEYS.FRAMEWORK1][STATS_KEYS.TEST_LOC]) {
  stats[CONFIG_KEYS.FRAMEWORK1][STATS_KEYS.TEST_LOC] = {
    [STATS_KEYS.TOTAL]: 0
  };
}
if (!stats[CONFIG_KEYS.FRAMEWORK2][STATS_KEYS.TEST_LOC]) {
  stats[CONFIG_KEYS.FRAMEWORK2][STATS_KEYS.TEST_LOC] = {
    [STATS_KEYS.TOTAL]: 0
  };
}

let totalFiles =
  stats[CONFIG_KEYS.FRAMEWORK1][STATS_KEYS.SRC_FILES] +
  stats[CONFIG_KEYS.FRAMEWORK1][STATS_KEYS.TEST_FILES] +
  stats[CONFIG_KEYS.FRAMEWORK2][STATS_KEYS.SRC_FILES] +
  stats[CONFIG_KEYS.FRAMEWORK2][STATS_KEYS.TEST_FILES];

// Get totals
let totalLoc =
  stats[CONFIG_KEYS.FRAMEWORK1][STATS_KEYS.SRC_LOC][STATS_KEYS.TOTAL] +
  stats[CONFIG_KEYS.FRAMEWORK1][STATS_KEYS.TEST_LOC][STATS_KEYS.TOTAL] +
  stats[CONFIG_KEYS.FRAMEWORK2][STATS_KEYS.SRC_LOC][STATS_KEYS.TOTAL] +
  stats[CONFIG_KEYS.FRAMEWORK2][STATS_KEYS.TEST_LOC][STATS_KEYS.TOTAL];

// Get percentages
stats[CONFIG_KEYS.FRAMEWORK1][STATS_KEYS.PERCENTAGE_FILES] = getPercentage(
  stats[CONFIG_KEYS.FRAMEWORK1][STATS_KEYS.SRC_FILES],
  stats[CONFIG_KEYS.FRAMEWORK1][STATS_KEYS.TEST_FILES],
  totalFiles
);
stats[CONFIG_KEYS.FRAMEWORK2][STATS_KEYS.PERCENTAGE_FILES] = getPercentage(
  stats[CONFIG_KEYS.FRAMEWORK2][STATS_KEYS.SRC_FILES],
  stats[CONFIG_KEYS.FRAMEWORK2][STATS_KEYS.TEST_FILES],
  totalFiles
);

stats[CONFIG_KEYS.FRAMEWORK1][STATS_KEYS.PERCENTAGE_LOC] = getPercentage(
  stats[CONFIG_KEYS.FRAMEWORK1][STATS_KEYS.SRC_LOC][STATS_KEYS.TOTAL],
  stats[CONFIG_KEYS.FRAMEWORK1][STATS_KEYS.TEST_LOC][STATS_KEYS.TOTAL],
  totalLoc
);
stats[CONFIG_KEYS.FRAMEWORK2][STATS_KEYS.PERCENTAGE_LOC] = getPercentage(
  stats[CONFIG_KEYS.FRAMEWORK2][STATS_KEYS.SRC_LOC][STATS_KEYS.TOTAL],
  stats[CONFIG_KEYS.FRAMEWORK2][STATS_KEYS.TEST_LOC][STATS_KEYS.TOTAL],
  totalLoc
);

// Print our stats :D
if (!silent) {
  print(prettyjson.render(stats, prettyjsonOptions) + '\n');
}

//// Check if we need to output a stats file
if (options[OPTIONS_KEYS.FILENAME]) {
  // Stringify the stats
  let statsString = JSON.stringify(stats, null, 2);

  // Set our filename and directory path
  let statsFilename = options[OPTIONS_KEYS.FILENAME];
  let statsDirectory = path.dirname(statsFilename);

  // Set our callback for success or failure after writing
  let callback = err => {
    if (err) {
      return print(chalk.red(err));
    }
    if (!silent) {
      print(chalk.cyan(`${COMMON_KEYS.SAVED} - ${statsFilename}`));
    }
  };
  // Make a directory if needed
  makeDir(statsDirectory);

  // Write the file
  fs.writeFile(statsFilename, statsString, callback);
}

/* ----- Webpack Stats ----- */

// Start with webpack stuff
if (options[OPTIONS_KEYS.WEBPACK_STATS]) {
  // Traverse our modules
  webpackInputFile.modules.forEach(module => {
    let should_include = false;

    //For each include
    module.reasons.forEach(reason => {
      // Is the module name a string
      // Surprisingly sometimes its not :O
      if (typeof reason.userRequest === 'string') {
        // Check if this is the component we want
        if (
          ifModuleNameIncludes(
            reason.userRequest,
            // use options if provided or include all modules using ['']
            options[OPTIONS_KEYS.MODULES] || ['']
          )
        ) {
          should_include = true;
        } else {
          should_include = false;
        }

        if (should_include) {
          // Check if we've already added this component to our list
          // Note reason.userRequests contains the name of the module
          if (webpackStats.hasOwnProperty(reason.userRequest)) {
            webpackStats[reason.userRequest].count++;
            //This component already exits so we can just push into issuers
            webpackStats[reason.userRequest][WEBPACK_KEYS.ISSUERS].push(
              reason.moduleName
            );
          } else {
            // If the component doesn't exist in our object, add it and set the
            // first issuer
            webpackStats[reason.userRequest] = {
              [WEBPACK_KEYS.MODULE]: reason.userRequest,
              [WEBPACK_KEYS.ENTRY]: module.name,
              [WEBPACK_KEYS.EXPORTS]: module.usedExports,
              [WEBPACK_KEYS.COUNT]: 1,
              [WEBPACK_KEYS.ISSUERS]: [reason.moduleName]
            };
          }
        }
      }
    }); // End reasons forEach
  }); // End main module forEach

  //Are we sorting this, if so sort it?
  let webpackArray = Object.keys(webpackStats).map(key => webpackStats[key]);
  if (options[OPTIONS_KEYS.SORT]) {
    webpackArray.sort(sortByKeyFunctionBuilder([WEBPACK_KEYS.COUNT]));
  }

  // Check if we need to output a webpack stats file
  if (options[OPTIONS_KEYS.WEBPACK_STATS_OUTPUT]) {
    // Add a timestamp to our stats and stringify it
    let webpackString = JSON.stringify(
      {
        [STATS_KEYS.TIMESTAMP]: timestamp,
        [WEBPACK_KEYS.WEBPACK_STATS]: webpackArray
      },
      null,
      2
    );
    // Set our filename and directory path
    let webpackStatsFilename = options[OPTIONS_KEYS.WEBPACK_STATS_OUTPUT];
    let webpackStatsDirectory = path.dirname(webpackStatsFilename);

    // Set our callback for success or failure after writing
    let callback = err => {
      if (err) {
        return print(chalk.red(err));
      }
      if (!silent) {
        print(chalk.cyan(`${COMMON_KEYS.SAVED} - ${webpackStatsFilename}`));
      }
    };

    // Make a directory if needed
    makeDir(webpackStatsDirectory);

    // Write the file
    fs.writeFile(webpackStatsFilename, webpackString, callback);
  } // End check for writing
} // End Webpack stuff check

if (hadWarning) {
  print(chalk.yellow('Done with warnings! Scroll up for more info.'));
}

module.exports = {
  stats: stats,
  webpackStats: webpackStats
};
