const chalk = require('chalk');
const sourceMap = require('source-map');
const request = require('superagent');

let fs;
const CLIENT = typeof window !== 'undefined';

if (!CLIENT) {
	fs = require('fs');
}

module.exports = class Log {
	constructor() {
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

	setOptions(options) {
		if (options.level) {
			this.setLevel(options.level);
		}

		if (options.useTrace === false) {
			this.useTrace = false;
		} else {
			this.useTrace = true;
		}

		if (options.useTrace === false) {
			this.useTrace = false;
		} else {
			this.useTrace = true;
		}
	}

	setLevel(level) {
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

	doLog(level, args) {
		if (
			this.levels[level] &&
			this.levels[level].i >= this.levels[this.level].i
		) {
			let thingToLog;

			if (args && args.length === 1) {
				if (typeof args[0] !== 'string') {
					thingToLog = [args[0]];
				} else {
					thingToLog = args[0];
				}
			} else {
				thingToLog = [];
				for (let i = 0, len = args.length; i < len; i += 1) {
					thingToLog.push(args[i]);
				}
			}

			const now = this.getDatetimeString();

			const thingType = typeof thingToLog;
			this.getLine()
				.then(callerFunc => {
					let isString = false;
					if (thingType === 'string') {
						thingToLog = this.colorize(level, thingToLog, true);
						isString = true;
					}

					// default noop
					let consoleMethod = () => {};
					if (typeof console !== 'undefined') {
						if (typeof console[level] !== 'undefined') {
							consoleMethod = console[level];
						} else if (typeof console.log !== 'undefined') {
							consoleMethod = console.log;
						}
					}

					const aboutStr = callerFunc
						? `(${level.toUpperCase()} | ${now} | ${callerFunc} | ${thingType}): `
						: `(${level.toUpperCase()} | ${now} | ${thingType}): `;

					const colorizedLevel = this.colorize(level, aboutStr);

					if (isString) {
						if (CLIENT) {
							thingToLog[0] = colorizedLevel[0] + thingToLog[0];
							thingToLog[2] = thingToLog[1];
							thingToLog[1] = colorizedLevel[1];
						} else {
							thingToLog = colorizedLevel + thingToLog;
						}
					} else if (CLIENT) {
						console.log.apply(this, colorizedLevel);
					} else {
						console.log.call(this, colorizedLevel);
					}

					if (!CLIENT && thingType === 'string') {
						consoleMethod.call(this, thingToLog);
					} else {
						consoleMethod.apply(this, thingToLog);
					}
				})
				.catch(e => {
					console.warn(e);
				});
		} else {
			// console.log('**** LOG LEVEL NOT MET');
		}
	}

	getDatetimeString() {
		const now = new Date();
		const year = now.getFullYear();
		let month = now.getMonth() + 1;
		if (month < 10) {
			month = '0' + month;
		}
		let day = now.getDate() + 1;
		if (day < 10) {
			day = '0' + day;
		}
		let hour = now.getHours();
		if (hour < 10) {
			hour = '0' + hour;
		}
		let minute = now.getHours();
		if (minute < 10) {
			minute = '0' + minute;
		}
		let second = now.getSeconds();
		if (second < 10) {
			second = '0' + second;
		}
		const millisecond = now.getMilliseconds();
		const nowStr = `${year}-${month}-${day} ${hour}:${minute}:${second}:${millisecond}`;

		return nowStr;
	}

	colorize(level, str, bold) {
		let colorizedStr = str;
		if (CLIENT) {
			let style = '';
			if (this.levels[level].bgHex) {
				style += `background: ${this.levels[level].bgHex};`;
			}
			if (this.levels[level].hex) {
				style += `color: ${this.levels[level].hex};`;
			}
			if (bold) {
				style += `font-weight: bold;`;
			}

			colorizedStr = [`%c${str}`, style];
		} else {
			if (chalk.hex) {
				if (this.levels[level].bgHex) {
					colorizedStr = chalk.bgHex(this.levels[level].bgHex)(colorizedStr);
				}
				if (this.levels[level].hex) {
					colorizedStr = chalk.hex(this.levels[level].hex)(colorizedStr);
				}
			} else {
				if (this.levels[level].bgHexFallBack) {
					colorizedStr = chalk[this.levels[level].bgHexFallBack](colorizedStr);
				}
				if (this.levels[level].hexFallBack) {
					colorizedStr = chalk[this.levels[level].hexFallBack](colorizedStr);
				}
			}
			if (bold) {
				colorizedStr = chalk.bold(colorizedStr);
			}
		}
		return colorizedStr;
	}

	getLine() {
		return new Promise(resolve => {
			if (!this.useTrace) {
				resolve();
			}

			let callerFunc = '';
			try {
				throw new Error();
			} catch (e) {
				const matches = e.stack.match(/\sat[^\n]*\n/g);
				let depth = 0;

				for (let i = 0, len = matches.length; i < len; i += 1) {
					if (matches[i].indexOf('at Log.getLine') > -1) {
						depth = i + 3;
						break;
					}
				}

				if (matches && matches[depth]) {
					const matches2 = matches[depth].match(
						/at (.*)\((.*\/)(.*\.js):([^:]*):([^:]*)\)\n$/
					);
					if (matches2 && matches2[1]) {
						const sourceRoot = matches2[2];
						const sourceFile = matches2[3];
						const mapFile = `${sourceFile}.map`;
						const lineNumber = matches2[4];
						const position = matches2[5];

						if (!this.useSourcemaps) {
							// Do not try to resolve from sourcemap.  Just use
							callerFunc = `${sourceFile}:${lineNumber}:}`;
							return resolve(callerFunc);
						}

						this.getSource({
							sourceRoot,
							sourceFile,
							mapFile,
							lineNumber,
							position
						}).then(original => {
							if (original) {
								const originalMatches = original.source.match(/([^/]+)$/);
								let originalFile = '';
								if (originalMatches && originalMatches[1]) {
									originalFile = originalMatches[1];
								}

								callerFunc = `${originalFile}:${original.line}:${original.column}`;
								return resolve(callerFunc);
							}

							callerFunc = `${matches2[1]} | ${matches2[2]}`;
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

	trace() {
		this.doLog('trace', arguments);
	}

	debug() {
		this.doLog('debug', arguments);
	}

	log() {
		this.doLog('log', arguments);
	}

	info() {
		this.doLog('info', arguments);
	}

	warn() {
		this.doLog('warn', arguments);
	}

	error() {
		this.doLog('error', arguments);
	}

	crit() {
		this.doLog('error', arguments);
	}

	fatal() {
		this.doLog('error', arguments);
	}

	superInfo() {
		this.doLog('superInfo', arguments);
	}

	getSource({ sourceRoot, sourceFile, mapFile, lineNumber, position }) {
		return new Promise(resolve => {
			const fullSource = `${sourceRoot}${sourceFile}`;
			const fullMapSource = `${sourceRoot}${mapFile}`;
			if (!this.sources[fullSource]) {
				this.sources[fullSource] = true;

				if (CLIENT) {
					request.get(fullMapSource).end((err, res) => {
						if (err || !res.ok) {
							console.warn(err);
							return resolve();
						}
						this.sources[fullSource] = res.body;
						this.sourceMaps[fullSource] = new sourceMap.SourceMapConsumer(
							this.sources[fullSource]
						);
						const original = this.sourceMaps[fullSource].originalPositionFor({
							line: parseInt(lineNumber, 10),
							column: parseInt(position, 10)
						});

						resolve(original);
						this.resolveQueue(fullSource);
					});
				} else {
					// Server
					if (!fs) {
						return resolve();
					}
					fs.readFile(fullMapSource, 'utf8', (err, data) => {
						if (err) {
							resolve();
							this.resolveQueue(fullSource);
							return;
						}
						this.sources[fullSource] = data;
						this.sourceMaps[fullSource] = new sourceMap.SourceMapConsumer(
							this.sources[fullSource]
						);
						const original = this.sourceMaps[fullSource].originalPositionFor({
							line: parseInt(lineNumber, 10),
							column: parseInt(position, 10)
						});

						resolve(original);
						this.resolveQueue(fullSource);
					});
				}
			} else if (!this.sourceMaps[fullSource]) {
				if (!this.originalPositionQueue[fullSource]) {
					this.originalPositionQueue[fullSource] = [];
				}
				this.originalPositionQueue[fullSource].push({
					resolve,
					line: lineNumber,
					column: position
				});
			} else {
				const original = this.sourceMaps[fullSource].originalPositionFor({
					line: parseInt(lineNumber, 10),
					column: parseInt(position, 10)
				});

				return resolve(original);
			}
		});
	}

	resolveQueue(fullSource) {
		if (this.originalPositionQueue[fullSource]) {
			this.originalPositionQueue[fullSource].forEach(queueItem => {
				const queueOriginal = this.sourceMaps[fullSource].originalPositionFor({
					line: parseInt(queueItem.line, 10),
					column: parseInt(queueItem.column, 10)
				});
				queueItem.resolve(queueOriginal);
			});
		}

		this.originalPositionQueue[fullSource] = [];
	}
};
