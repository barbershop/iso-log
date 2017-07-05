# iso-log

An isomorphic logger with sugar on top.

In browser console:

![Console](https://raw.githubusercontent.com/kengoldfarb/iso-log/master/screenshots/console.png)

And in terminal:

![Terminal](https://raw.githubusercontent.com/kengoldfarb/iso-log/master/screenshots/terminal.png)

## Installation

```
yarn add iso-log
```

## Usage

```javascript
const log = require('iso-log');
log.setOptions({
	level: 'debug',
	trace: true,
	sourcemaps: true
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
```

If the level specified is ```info```, then ```info```, ```warn```, and ```error``` logs would be written to the console.  ```trace``` and ```debug``` logs would NOT be written to the console.

```trace``` - Whether to run a trace which will add the file and line number.  Default: true

```sourcemaps``` - Whether to try to resolve the original file and line number.  Will look for the sourcemap in the corresponding ```.map``` file.  For example, ```/some/js/file.js.map```.  Default: true

### Logging Examples

```javascript
log.trace('log at level trace');
log.debug('log at level debug');
log.log('log at level log');
log.info('log at level info');
log.warn('log at level warn');
log.error('log at level error');

log.crit('log at level error'); // alias of 'error'
log.fatal('log at level error'); // alias of 'error'

// Anything that can be passed to console.log can be passed to the logger
log.debug({some: 'object here'});
log.debug('multiple things', 'getting logged here', {some: 'object here'});
```
