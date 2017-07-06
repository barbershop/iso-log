# iso-log

An isomorphic logger with sugar on top.

In browser console:

![Console](https://raw.githubusercontent.com/kengoldfarb/iso-log/master/screenshots/console.png)

And in terminal:

![Terminal](https://raw.githubusercontent.com/kengoldfarb/iso-log/master/screenshots/terminal.png)

### Features

* Works both client and server side

* Log levels

* Outputs logs using native ```console``` methods

* Trace log statements to files and lines

* Sourcemap support

## Installation

```
yarn add iso-log
```

## Usage

```javascript
const log = require('iso-log');
log.setOptions({
	level: 'debug',
	useTrace: true,
	useSourcemaps: true
});

log.debug('All set!');
```

### Options

```level``` - The log level to use.  Default: 'debug'

Valid levels are:

```
trace
debug
log
info
warn
error
superInfo
```

If the level specified is ```info```, then ```info```, ```warn```, ```error```, and ```superInfo``` logs would be written to the console.  ```trace``` and ```debug``` logs would NOT be written to the console.

```useTrace``` - Whether to run a trace which will add the file and line number.  Default: true

```useSourcemaps``` - Whether to try to resolve the original file and line number.  Will look for the sourcemap in the corresponding ```.map``` file.  For example, ```/some/js/file.js.map```.  Default: true

### Logging Examples

```javascript
log.trace('log at level trace');
log.debug('log at level debug');
log.log('log at level log');
log.info('log at level info');
log.warn('log at level warn');
log.error('log at level error');
log.superInfo('log at level error');

log.crit('log at level error'); // alias of 'error'
log.fatal('log at level error'); // alias of 'error'

// Anything that can be passed to console.log can be passed to the logger
log.debug({some: 'object here'});
log.debug('multiple things', 'getting logged here', {some: 'object here'});
```

### Sourcemaps and Webpack

For source maps to properly work you'll need to make sure you're generating them (with the original source info).  If you're using webpack you can add this to your config:

```javascript
{
	devtool: 'cheap-module-source-map';
}
```

If you're using webpack and receive a ```Module not found: Error: Can't resolve 'fs'```, just add the following to your webpack config:

```javascript
node: {
	fs: 'empty'
};
```