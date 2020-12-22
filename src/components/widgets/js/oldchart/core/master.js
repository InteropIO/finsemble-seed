// Copyright 2014-2016 by ChartIQ, Inc

(function (definition) {
    "use strict";

	if (typeof exports === "object" && typeof module === "object") {
		module.exports = definition(
			require('./polyfills'), require('./utility'), 
			require('./timezone'), require('./core'), 
			require('./market'), require('./engine'), 
			require('./microkernel'));
	} else if (typeof define === "function" && define.amd) {
		define(['core/polyfills', 'core/utility', 'core/timezone', 'core/core', 'core/market', 'core/engine', 'core/microkernel'], definition);
	} else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition(global,global,global,global,global,global,global);
	} else {
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for stxMaster.js.");
	}

})(function(polyfills, utility, timezone, core, market, engine, microkernel) {
	console.log("core/master.js",arguments);

	var exports={};
	exports.CIQ=utility.CIQ;
	exports.STX=utility.STX;
	exports.STXChart=utility.CIQ.ChartEngine;
	exports.$$=utility.$$;
	exports.$$$=utility.$$$;
	exports.timezoneJS=timezone.timezoneJS;
	return exports;
});