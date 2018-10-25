// -------------------------------------------------------------------------------------------
// Copyright 2012-2018 by ChartIQ, Inc
// -------------------------------------------------------------------------------------------


/*
 * 
 * TFC package.  This loads up the Trade From Chart module.
 * 
 */

(function (definition) {
	"use strict";

	if (typeof exports === "object" && typeof module === "object") {
		module.exports = definition(require('./componentUI'));
	} else if (typeof define === "function" && define.amd) {
		define(['componentUI'], definition);
	} else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition(global);
	} else {
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for tfc/tfc-loader.js.");
	}
})(function(_exports) {
	var CIQ = _exports.CIQ;

	function start(config){
		var stx=config.stx;
		stx.tfc=new CIQ.TFC(config);   // This is the *real* CIQ.TFC.

		stx.addEventListener("newChart",function(){
			stx.tfc.changeSymbol();
		});

		stx.tfc.selectSymbol=function(symbol){
			if(config.context) config.context.changeSymbol({symbol:symbol.toUpperCase()});
		};

		$$$("cq-side-panel").appendChild($$$(".stx-trade-panel"));

		CIQ.safeClickTouch($$$(".stx-trade-nav .stx-trade-ticket-toggle"), function(){
			CIQ.unappendClassName($$$(".stx-trade-nav"),"active");
			CIQ.appendClassName($$$(".stx-trade-info"),"active");
			$$$("cq-side-panel").resizeMyself();
		});
		CIQ.safeClickTouch($$$(".stx-trade-info .stx-trade-ticket-toggle"), function(){
			CIQ.unappendClassName($$$(".stx-trade-info"),"active");
			CIQ.appendClassName($$$(".stx-trade-nav"),"active");
			$$$("cq-side-panel").resizeMyself();
		});

	}

	// Stub function to allow us to create the object on the page before the class is loaded
	CIQ.TFC=function(config){
		var tfcConfig={
			stx: config.stx,
			account: config.account?new config.account():null,
			chart: config.chart,
			context: config.context
		};

		var basePath="plugins/tfc/";
		CIQ.loadWidget(basePath + "tfc", function(err) {
			if (err) return console.log(err);
			if(!tfcConfig.account) {
				CIQ.loadScript(basePath + "tfc-demo.js", function(){
					tfcConfig.account=new CIQ.Account.Demo();
					start(tfcConfig);
				});
			}else{
				start(tfcConfig);
			}
		});
	};

	return _exports;
});
