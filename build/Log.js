'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var chalk = require('chalk');
var sourceMap = require('source-map');
var request = require('superagent');

var fs = void 0;
var CLIENT = typeof window !== 'undefined';

if (!CLIENT) {
	fs = require('fs');
}

module.exports = function () {
	function Log() {
		_classCallCheck(this, Log);

		this.levels = {
			trace: {
				i: 0,
				hex: '#404040',
				hexFallBack: 'gray',
				bgHex: null,
				bgHexFallBack: null
			},
			debug: {
				i: 1,
				hex: '#009933',
				hexFallBack: 'green',
				bgHex: null,
				bgHexFallBack: null
			},
			log: {
				i: 2,
				hex: '#404040',
				hexFallBack: 'gray',
				bgHex: null,
				bgHexFallBack: null
			},
			info: {
				i: 3,
				hex: '#0033cc',
				hexFallBack: 'cyan',
				bgHex: null,
				bgHexFallBack: null
			},
			warn: {
				i: 4,
				hex: '#ff6600',
				hexFallBack: 'red',
				bgHex: null,
				bgHexFallBack: null
			},
			error: {
				i: 5,
				hex: '#cc3300',
				hexFallBack: 'red',
				bgHex: null,
				bgHexFallBack: null
			},
			superInfo: {
				i: 6,
				hex: '#0033cc',
				hexFallBack: 'cyan',
				bgHex: null,
				bgHexFallBack: null
			}
		};

		this.useTrace = true;
		this.useSourcemaps = true;
		this.sources = [];
		this.sourceMaps = [];
		this.originalPositionQueue = [];
		global.sources = this.sources;
		global.sourceMaps = this.sourceMaps;
	}

	_createClass(Log, [{
		key: 'setOptions',
		value: function setOptions(options) {
			if (options.level) {
				this.setLevel(options.level);
			}

			if (options.useTrace === false) {
				this.useTrace = false;
			} else {
				this.useTrace = true;
			}

			if (options.useSourcemaps === false) {
				this.useSourcemaps = false;
			} else {
				this.useSourcemaps = true;
			}
		}
	}, {
		key: 'setLevel',
		value: function setLevel(level) {
			switch (level) {
				case 'trace':
				case 'debug':
				case 'info':
				case 'warn':
				case 'error':
					this.level = level;
					break;
				default:
					this.level = 'warn';
					break;
			}
		}
	}, {
		key: 'doLog',
		value: function doLog(level, args) {
			var _this = this;

			if (this.levels[level] && this.levels[level].i >= this.levels[this.level].i) {
				var thingToLog = void 0;

				if (args && args.length === 1) {
					if (typeof args[0] !== 'string') {
						thingToLog = [args[0]];
					} else {
						thingToLog = args[0];
					}
				} else {
					thingToLog = [];
					for (var i = 0, len = args.length; i < len; i += 1) {
						thingToLog.push(args[i]);
					}
				}

				var now = this.getDatetimeString();

				var thingType = typeof thingToLog === 'undefined' ? 'undefined' : _typeof(thingToLog);
				this.getLine().then(function (callerFunc) {
					var isString = false;
					if (thingType === 'string') {
						thingToLog = _this.colorize(level, thingToLog, true);
						isString = true;
					}

					// default noop
					var consoleMethod = function consoleMethod() {};
					if (typeof console !== 'undefined') {
						if (!CLIENT && level === 'debug' && typeof console.log !== 'undefined') {
							// Node has a dummy 'debug' console method (in v8) that doesn't print anything to console.  Use console.log instead
							consoleMethod = console.log;
						} else if (typeof console[level] !== 'undefined') {
							consoleMethod = console[level];
						} else if (typeof console.log !== 'undefined') {
							consoleMethod = console.log;
						}
					}

					var aboutStr = callerFunc ? '(' + level.toUpperCase() + ' | ' + now + ' | ' + callerFunc + ' | ' + thingType + '): ' : '(' + level.toUpperCase() + ' | ' + now + ' | ' + thingType + '): ';

					aboutStr = _this.decorateLogMessage(level, aboutStr);

					var colorizedLevel = _this.colorize(level, aboutStr);

					if (isString) {
						if (CLIENT) {
							thingToLog[0] = colorizedLevel[0] + thingToLog[0];
							thingToLog[2] = thingToLog[1];
							thingToLog[1] = colorizedLevel[1];
						} else {
							thingToLog = colorizedLevel + thingToLog;
						}
					} else if (CLIENT) {
						console.log.apply(_this, colorizedLevel);
					} else {
						console.log.call(_this, colorizedLevel);
					}

					if (!CLIENT && thingType === 'string') {
						consoleMethod.call(_this, thingToLog);
					} else {
						consoleMethod.apply(_this, thingToLog);
					}
				}).catch(function (e) {
					console.warn(e);
				});
			} else {
				// console.log('**** LOG LEVEL NOT MET');
			}
		}
	}, {
		key: 'getDatetimeString',
		value: function getDatetimeString() {
			var now = new Date();
			var year = now.getFullYear();
			var month = now.getMonth() + 1;
			if (month < 10) {
				month = '0' + month;
			}
			var day = now.getDate() + 1;
			if (day < 10) {
				day = '0' + day;
			}
			var hour = now.getHours();
			if (hour < 10) {
				hour = '0' + hour;
			}
			var minute = now.getMinutes();
			if (minute < 10) {
				minute = '0' + minute;
			}
			var second = now.getSeconds();
			if (second < 10) {
				second = '0' + second;
			}
			var millisecond = now.getMilliseconds();
			var nowStr = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second + ':' + millisecond;

			return nowStr;
		}
	}, {
		key: 'colorize',
		value: function colorize(level, str, bold) {
			var colorizedStr = str;
			if (CLIENT) {
				var style = '';
				if (this.levels[level].bgHex) {
					style += 'background: ' + this.levels[level].bgHex + ';';
				}
				if (this.levels[level].hex) {
					style += 'color: ' + this.levels[level].hex + ';';
				}
				if (bold) {
					style += 'font-weight: bold;';
				}

				colorizedStr = ['%c' + str, style];
			} else {
				// if (chalk.hex) {
				// 	if (this.levels[level].bgHex) {
				// 		colorizedStr = chalk.bgHex(this.levels[level].bgHex)(colorizedStr);
				// 	}
				// 	if (this.levels[level].hex) {
				// 		colorizedStr = chalk.hex(this.levels[level].hex)(colorizedStr);
				// 	}
				// } else {
				if (this.levels[level].bgHexFallBack) {
					colorizedStr = chalk[this.levels[level].bgHexFallBack](colorizedStr);
				}
				if (this.levels[level].hexFallBack) {
					colorizedStr = chalk[this.levels[level].hexFallBack](colorizedStr);
				}
				// }
				if (bold) {
					colorizedStr = chalk.bold(colorizedStr);
				}
			}
			return colorizedStr;
		}
	}, {
		key: 'getLine',
		value: function getLine() {
			var _this2 = this;

			return new Promise(function (resolve) {
				if (!_this2.useTrace) {
					resolve();
				}

				var callerFunc = '';
				try {
					throw new Error();
				} catch (e) {
					var matches = e.stack.match(/\sat[^\n]*\n/g);
					var depth = 0;

					for (var i = 0, len = matches.length; i < len; i += 1) {
						if (matches[i].indexOf('at Log.getLine') > -1) {
							depth = i + 3;
							break;
						}
					}

					if (matches && matches[depth]) {
						var matches2 = matches[depth].match(/at (.*)\((.*\/)(.*\.js):([^:]*):([^:]*)\)\n$/);
						if (matches2 && matches2[1]) {
							var sourceRoot = matches2[2];
							var sourceFile = matches2[3];
							var mapFile = sourceFile + '.map';
							var lineNumber = matches2[4];
							var position = matches2[5];

							if (!_this2.useSourcemaps) {
								// Do not try to resolve from sourcemap.  Just use
								callerFunc = sourceFile + ':' + lineNumber + ':}';
								return resolve(callerFunc);
							}

							_this2.getSource({
								sourceRoot: sourceRoot,
								sourceFile: sourceFile,
								mapFile: mapFile,
								lineNumber: lineNumber,
								position: position
							}).then(function (original) {
								if (original) {
									var originalMatches = original.source.match(/([^/]+)$/);
									var originalFile = '';
									if (originalMatches && originalMatches[1]) {
										originalFile = originalMatches[1];
									}

									callerFunc = originalFile + ':' + original.line + ':' + original.column;
									return resolve(callerFunc);
								}

								callerFunc = matches2[1] + ' | ' + matches2[2];
								return resolve(callerFunc);
							});
						} else {
							return resolve();
						}
					} else {
						return resolve();
					}
				}
			});
		}
	}, {
		key: 'trace',
		value: function trace() {
			this.doLog('trace', arguments);
		}
	}, {
		key: 'debug',
		value: function debug() {
			this.doLog('debug', arguments);
		}
	}, {
		key: 'log',
		value: function log() {
			this.doLog('log', arguments);
		}
	}, {
		key: 'info',
		value: function info() {
			this.doLog('info', arguments);
		}
	}, {
		key: 'warn',
		value: function warn() {
			this.doLog('warn', arguments);
		}
	}, {
		key: 'error',
		value: function error() {
			this.doLog('error', arguments);
		}
	}, {
		key: 'crit',
		value: function crit() {
			this.doLog('error', arguments);
		}
	}, {
		key: 'fatal',
		value: function fatal() {
			this.doLog('error', arguments);
		}
	}, {
		key: 'superInfo',
		value: function superInfo() {
			this.doLog('superInfo', arguments);
		}
	}, {
		key: 'getSource',
		value: function getSource(_ref) {
			var _this3 = this;

			var sourceRoot = _ref.sourceRoot,
			    sourceFile = _ref.sourceFile,
			    mapFile = _ref.mapFile,
			    lineNumber = _ref.lineNumber,
			    position = _ref.position;

			return new Promise(function (resolve) {
				var fullSource = '' + sourceRoot + sourceFile;
				var fullMapSource = '' + sourceRoot + mapFile;
				if (!_this3.sources[fullSource]) {
					_this3.sources[fullSource] = true;

					if (CLIENT) {
						request.get(fullMapSource).end(function (err, res) {
							if (err || !res.ok) {
								console.warn(err);
								return resolve();
							}
							_this3.sources[fullSource] = res.body;
							_this3.sourceMaps[fullSource] = new sourceMap.SourceMapConsumer(_this3.sources[fullSource]);
							var original = _this3.sourceMaps[fullSource].originalPositionFor({
								line: parseInt(lineNumber, 10),
								column: parseInt(position, 10)
							});

							resolve(original);
							_this3.resolveQueue(fullSource);
						});
					} else {
						// Server
						if (!fs) {
							return resolve();
						}
						fs.readFile(fullMapSource, 'utf8', function (err, data) {
							if (err) {
								resolve();
								_this3.resolveQueue(fullSource);
								return;
							}
							_this3.sources[fullSource] = data;
							_this3.sourceMaps[fullSource] = new sourceMap.SourceMapConsumer(_this3.sources[fullSource]);
							var original = _this3.sourceMaps[fullSource].originalPositionFor({
								line: parseInt(lineNumber, 10),
								column: parseInt(position, 10)
							});

							resolve(original);
							_this3.resolveQueue(fullSource);
						});
					}
				} else if (!_this3.sourceMaps[fullSource]) {
					if (!_this3.originalPositionQueue[fullSource]) {
						_this3.originalPositionQueue[fullSource] = [];
					}
					_this3.originalPositionQueue[fullSource].push({
						resolve: resolve,
						line: lineNumber,
						column: position
					});
				} else {
					var original = _this3.sourceMaps[fullSource].originalPositionFor({
						line: parseInt(lineNumber, 10),
						column: parseInt(position, 10)
					});

					return resolve(original);
				}
			});
		}
	}, {
		key: 'resolveQueue',
		value: function resolveQueue(fullSource) {
			var _this4 = this;

			if (this.originalPositionQueue[fullSource]) {
				this.originalPositionQueue[fullSource].forEach(function (queueItem) {
					var queueOriginal = _this4.sourceMaps[fullSource].originalPositionFor({
						line: parseInt(queueItem.line, 10),
						column: parseInt(queueItem.column, 10)
					});
					queueItem.resolve(queueOriginal);
				});
			}

			this.originalPositionQueue[fullSource] = [];
		}
	}, {
		key: 'decorateLogMessage',
		value: function decorateLogMessage(level, msg) {
			var logStr = msg;
			switch (level) {
				case 'info':
					logStr = 'ℹ️  ' + msg;
					break;

				case 'debug':
					logStr = '❇️  ' + msg;
					break;

				case 'warn':
					logStr = '⚠️  ' + msg;
					break;

				case 'error':
				case 'crit':
				case 'fatal':
					logStr = '💥  ' + msg;
					break;

				case 'superInfo':
					logStr = '💈 💈 💈  ' + msg;
					break;

				default:
					break;
			}
			return logStr;
		}
	}]);

	return Log;
}();