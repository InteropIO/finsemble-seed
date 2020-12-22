// Copyright 2014-2016 by ChartIQ, Inc
// This file is a placeholder for development purposes. Production builds will always be called chartiq.js
// and will replace this file with a single concatenation of all of the modules a customer has selected
// from the license server.
// 
// This file only needs to exist to support regression testing using require.

(function (definition) {
    "use strict";

	var dependencies=[
		'core/master',
		'intl',
		'span',
		'quoteFeed',
		//'quoteFeedSamples',
		'studies',
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
		'advanced/studiesAdvanced'
	];

	define(dependencies, definition);

})(function() {
	console.log("chartiq.js",arguments);
	var _exports={};

	// Consolidate our globals
	for(var arg=0;arg<arguments.length;arg++){
		for(var i in arguments[arg]){
			if(!_exports[i]) _exports[i]=arguments[arg][i];
		}
	}

	return _exports;
});