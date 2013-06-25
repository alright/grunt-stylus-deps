# grunt-stylus-deps

> stylus-deps is a node module for generation dependency trees of Stylus files. Used mostly for grunt-contrib-watch.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-stylus-deps --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-stylus-deps');
```

## The "stylus-deps" task

### Overview
In your project's Gruntfile, add a section named `stylusdeps` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  stylusdeps: {
    your_target: {
      options: {
        savedir: '/paths/to/dir/with/tree/file/',
        paths: '<%= stylus.development.options.paths %>'
      },

      files: '<%= stylus.development.files %>'
    },
  },
})
```
After this, at the end of your Gruntfile.js you should place this code:

```js
var gruntStylusDeps = require('grunt-stylus-deps/lib/utils');
gruntStylusDeps.fullWatch(grunt, ['stylus', 'development', 'files'], ['stylusdeps', 'target', 'options']);
```

['stylus', 'development', 'files'] is just a path to files of your stylus task.
Currenly this module supports only dynamic grunt files objects in stylus task, like this:

```js
{ expand: true, cwd: 'srcCSS/', src: ['**/*.styl'], dest: 'destCSS/', ext: '.css' }
```


## Release History
**25.06.2013**: 0.1.0 - Initial version
