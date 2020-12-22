// Copyright 2014-2016 by ChartIQ, Inc

(function (definition) {
    "use strict";

	var dependencies=[
	    //'core/master',
		//'intl',
		'span',
		//'quoteFeed',
		quoteFeed,
		/*'studies',
		'drawing',
		'i18n',
		'customCharts',
		'markers',
		'thirdparty/splines',
		'advanced/aggregations',
		'advanced/drawingAdvanced',
		'advanced/equations',
		'advanced/renderers',
		'advanced/share',
		'advanced/studiesAdvanced'*/
	];

	if (typeof exports === "object" && typeof module === "object") {
		module.exports = definition(require(dependencies));
	} else if (typeof define === "function" && define.amd) {
		define(dependencies, definition);
	} else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition();
	} else {
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for stxMaster.js.");
	}

})(function() {
	console.log("chartiq.js",arguments);

	// Copy our globals (STX,STXChart,etc) out of the module export and into the window
	for(var arg=0;arg<arguments.length;arg++){
		for(var i in arguments[arg]){
			if(!window[i]) window[i]=arguments[arg][i];
		}
	}
	//scriptsAreLoaded();

	return arguments;
});