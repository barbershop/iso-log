const Log = require('./src/Log');

module.exports = new Log();
// module.exports = options => {
// 	return new Log(options);
// };
// module.exports.setLevel = () => {
// 	// console.debug(arguments);
// };
// module.exports.debug = (obj) => {
// 	console.log('debug');
// 	console.log.apply(this, arguments);
// };
// module.exports.warn = () => {
// 	console.warn.apply(this, arguments);
// };
// module.exports.log = () => {
// 	console.log.apply(this, arguments);
// };

// /*! loglevel - v1.4.1 - https://github.com/pimterry/loglevel - (c) 2017 Tim Perry - licensed MIT */
// (function(root, definition) {
// 	'use strict';
// 	if (typeof define === 'function' && define.amd) {
// 		define(definition);
// 	} else if (typeof module === 'object' && module.exports) {
// 		module.exports = definition();
// 	} else {
// 		root.log = definition();
// 	}
// })(this, function() {
// 	const Log = require('./src/Log');
// 	const log = new Log();
// 	// return new Log(this);
// 	return {
// 		warn: () => {
// 			log.warn(this);
// 		}
// 	};
// });
