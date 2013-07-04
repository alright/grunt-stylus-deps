/*
 * grunt-stylus-deps
 * https://github.com/alright/grunt-stylus-deps
 *
 * Copyright (c) 2013 Alright
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
	// Modules
	var fs = require('fs');
	var _ = require('underscore');
    var path = require('path');

	// List of dependencies
	var deps = {};

	grunt.registerMultiTask('stylusdeps', 'stylus-deps is a node module for generation dependency trees of Stylus files. Used mostly for grunt-contrib-watch.', function() {
		var done = this.async();

		/**
		 * Available options:
		 * paths
		 * savedir
		 */
		var options = this.options();

		if (typeof options.paths === 'undefined' || ! options.paths) {
			options.paths = [];
		}

		if (typeof options.savedir === 'undefined' || ! options.savedir) {
			grunt.warn('You must specify savedir option.');
		}

		grunt.util.async.forEachSeries(this.files, function (file, next) {
			var srcFile = Array.isArray(file.src) ? file.src[0] : file.src;

			if ( ! grunt.file.exists(srcFile)) {
				// Warn on invalid source file
				grunt.warn('Source file "' + srcFile + '" not found.');
			}

			// Proceed task
			getImports(srcFile, options, function () {
				next();
			});
		}, function () {
			// Save results
			saveToFile(options.savedir, function() {
				done();
			});
		});
	});

	// Search for imports
	var getImports = function (srcFile, options, callback) {
		var regex = '@import "*([^?*:;{}"]+)"*';

		fs.readFile(srcFile, function (err, data) {
			var search = String(data).match(new RegExp(regex, 'g'));

			if ( ! search) {
				callback(null);
				return;
			}

			var value;
			var filename;

			for (var key in search) {
				if ( ! search.hasOwnProperty(key)) {
					continue;
				}

				value = search[key];
				filename = value.match(new RegExp(regex))[1];

                if (options.paths.length > 0) {
                    // Traverse by paths
                    for (var item in options.paths) {
                        if ( ! options.paths.hasOwnProperty(item)) {
                            continue;
                        }

                        item = options.paths[item];
                        filename = filename +'.styl';

                        filename = path.join(item, filename);
                        addDep(filename);
                    }
                }
                else {
                    addDep(filename);
                }
			}

			callback();
		});

        var addDep = function (filename) {
            if (filename === 'nib') {
                return;
            }

            if ( ! deps[filename]) {
                // File hasn't been imported yet
                deps[filename] = [];
            }

            srcFile = path.resolve(srcFile);

            if (deps[filename].indexOf(srcFile) === -1) {
                // File hasn't used this dependency yet
                deps[filename].push(srcFile);
            }
        };
	};

	var saveToFile = function (dirname, callback) {
		if (typeof dirname === 'undefined' || ! dirname) {
			return;
		}

		if (_.isEmpty(deps)) {
			grunt.log.ok('No deps are found');
			return;
		}

		var filename = path.join(dirname, 'stylus-tree.json');
		var json = JSON.stringify(deps); // (deps, null, "\t") to beautiful output

		fs.writeFile(filename, json, callback);
	};
};
