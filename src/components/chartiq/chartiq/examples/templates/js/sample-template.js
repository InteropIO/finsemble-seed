(function(definition) {
	"use strict";
	if (typeof exports === "object" && typeof module === "object") {
		module.exports = definition(
			require("chartiq/js/chartiq"),
			require("chartiq/examples/feeds/quoteFeedSimulator"),
			require("chartiq/examples/feeds/quoteFeedForecastSimulator"),
			require("chartiq/examples/markers/markersSample"),
			require("chartiq/examples/templates/js/sample-config")
		);
	} else if (typeof define === "function" && define.amd) {
		define([
			"chartiq/js/chartiq",
			"chartiq/examples/feeds/quoteFeedSimulator",
			"chartiq/examples/feeds/quoteFeedForecastSimulator",
			"chartiq/examples/markers/markersSample",
			"chartiq/examples/templates/js/sample-config"
		], definition);
	} else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition(global, global, global, global, global);
	} else {
		throw new Error(
			"Only CommonJS, RequireJS, and <script> tags supported for sample-template.js."
		);
	}
})(function(_exports, quotefeed, forecastQuoteFeed, marker, config ) {
	const CIQ = _exports.CIQ;
	// Create and customize default configuration
	function initConfig() {
		const config = CIQ.getDefaultConfig();
		 // Set to an initial symbol to load, or leave null
		config.initialSymbol = {
			symbol: "AAPL",
			name: "Apple Inc",
			exchDisp: "NASDAQ"
		};
		return config;
	}
	function createChart(paramInput, callbacks, root) {
		if (!configAvailable(paramInput && paramInput.config, root)) return;
		const params = paramInput || {
			extendedHours: true,
			forecasting: false,
			marketDepth: true,
			rangeSlider: true,
			inactivityTimer: true,
			continuousZoom: false,
			animation: false,
			tooltip: false,
			fullScreen: true,
			outliers: false
		};
		// flag for enabling persistence of settings
		if (params.storage !== false) params.storage = true;
		if (!root) root = document.body;
		const config = params.config || initConfig();
		// transfer initial symbol and term structure and disabled addOns to config
		if (params.initialSymbol) config.initialSymbol = params.initialSymbol;
		if (params.termStructure) config.termStructure = params.termStructure;
		for (let name in config.addOns) {
			if (!params[name]) {
				config.addOns[name] = null;
			}
		}
		for (let name in config.plugins) {
			if (params[name] === false) {
				config.plugins[name] = null;
			}
		}
		if (!config.chartId) config.chartId = root.id;
		config.callbacks = callbacks || {};
		const chart = new CIQ.UI.Chart();
		const { stx } = chart.createChartAndUI({ container: root, config });
		return stx;
	}

	// The following code will handle creation of a chart from a component, e.g. instant-chart.
	// We need to capture both the event and test for the attribute since the chart-component loads asynchronously
	// and we don't know whether the event was dispatched before this script file was loaded.
	function chartReadyHandler(e) {
		e.detail.node.stx = createChart(
			e.detail.params,
			e.detail.callbacks,
			e.detail.node
		);
	}
	$("body").on("signal-chart-ready", chartReadyHandler);
	$("[cq-event-flag]").each(function() {
		chartReadyHandler(this.signalEvent);
	});
	if (!_exports.createChart) _exports.createChart = createChart;
	return _exports;
	function configAvailable(config, root) {
		if (!(config || CIQ.getDefaultConfig)) {
			(root || document.body).innerHTML = `
			<div class="ciq-terminal-error">
				<h3>Error while instantiating chart</h3>
				<p>
				The chart configuration was not included in the paramInput argument of the 
				createChart function in sample-template.js, and the CIQ.getDefaultConfig function 
				(see the initConfig function) is not available in this version of the library.
				</p>
				<p>
				Please include the sample chart configuration by adding the following script tag to the template file:
				&lt;script src="examples/templates/js/sample-config.js"&gt;&lt;/script&gt;
				</p>
				<p>
				Add the tag before the script tag that loads sample-template.js. For example:<br>
				&lt;script src="examples/templates/js/sample-config.js"&gt;&lt;/script&gt;<br>
				&lt;script src="examples/templates/js/sample-template.js"&gt;&lt;/script&gt;
				</p>
			</div>
		`;
			return false;
		}
		return true;
	}
});
