'use strict';

var path = require('path');
var utils = module.exports;

utils.getDependency = function (deps, file) {
	var currentDeps = deps[file];
	var result = [];

	if (typeof currentDeps !== 'undefined' && Array.isArray(currentDeps) && currentDeps.length > 0) {
		for (var index in currentDeps) {
			if ( ! currentDeps.hasOwnProperty(index)) {
				continue;
			}

			// Recursion
			result = result.concat(utils.getDependency(deps, currentDeps[index]));
		}

		result = result.concat(currentDeps);
	}

	return result;
};

utils.watchAction = function (filepath, taskConfig, taskOptions) {
	var treeFileDir = taskOptions.savedir;

	if ( ! treeFileDir) {
		throw new Error('savedir option is required');
	}

	// Get full path of changed file
	var file = path.resolve(filepath);

	// Get all dependencies
	var treeFile = path.resolve(treeFileDir, 'stylus-tree.json');
	var data = JSON.parse(require('fs').readFileSync(treeFile));

	// Get dependency for current file
	var currentDeps = [];
	var childDeps = utils.getDependency(data, file);

	if (childDeps.length > 0) {
		// Merge into deps
		currentDeps = currentDeps.concat(childDeps);
	}

	// Append current file into dependencies, to process it too
	currentDeps.push(file);

	// Reverse order of changes, from origin to it's dependencies
	currentDeps.reverse();

	// Remove cwd from paths
	var cwdPath = path.resolve(taskConfig.cwd) + '/';

	for (var dep in currentDeps) {
		if ( ! currentDeps.hasOwnProperty(dep)) {
			continue;
		}

		currentDeps[dep] = currentDeps[dep].replace(cwdPath, '');
	}

	return currentDeps;
};

utils.fullWatch = function (grunt, stylusConfigPath, depsOptionsPath) {
    grunt.event.on('watch', function (action, filepath) {
	    // Supports only dynamic files object
        var config = grunt.config(stylusConfigPath)[0];
	    var options = grunt.config(depsOptionsPath);
		var currentDeps = utils.watchAction(filepath, config, options);

	    if ( ! currentDeps) {
		    return;
	    }

        // Update file
        config.src = currentDeps;

        grunt.config(stylusConfigPath, [config]);
    });
};