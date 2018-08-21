// -------------------------------------------------------------------------------------------
// Copyright 2012-2018 by ChartIQ, Inc
// -------------------------------------------------------------------------------------------


/*
 * 
 * CryptoIQ package.  This loads up the market depth and orderbook modules.
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
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for cryptoiq/cryptoiq.js.");
	}
})(function(_exports) {
	var CIQ = _exports.CIQ;

	var orderBookNeedsLoading=false, marketDepthNeedsLoading=true;

	if(CIQ.UI){
		orderBookNeedsLoading=true;
		CIQ.loadScript('plugins/cryptoiq/orderbook.js', function(){
			orderBookNeedsLoading=false;
			begin();
		});
		if(CIQ.UI.Layout && CIQ.UI.observe){
			/**
			 * @memberof CIQ.UI.Layout
			 * @param {HTMLElement} node
			 */
			CIQ.UI.Layout.prototype.getMarketDepth=function(node){
				CIQ.UI.observe({
					selector: node,
					obj: this.context.stx.layout,
					member: "marketDepth",
					condition: true,
					action: "class",
					value: this.params.activeClassName
				});
			};
		
			/**
			 * @memberof CIQ.UI.Layout
			 * @param {HTMLElement} node
			 */
			CIQ.UI.Layout.prototype.setMarketDepth=function(node){
				var stx=this.context.stx;
				stx.layout.marketDepth=!stx.layout.marketDepth;
				if(stx.marketDepth) stx.marketDepth.display(stx.layout.marketDepth);
				stx.changeOccurred("layout");
			};
		}
	}

	var marketDepthArgs=null;
	// Stub function to allow us to create the object on the page before the class is loaded
	CIQ.MarketDepth=function(){
		marketDepthArgs=[].slice.call(arguments);
	};

	function begin(){
		if(orderBookNeedsLoading || marketDepthNeedsLoading) return;
		if(marketDepthArgs) {
			CIQ.MarketDepth.apply(null, marketDepthArgs);
			var arg0=marketDepthArgs[0];
			if(arg0 && arg0.stx){
				arg0.stx.marketDepth.display(arg0.stx.layout.marketDepth);
			}
		}
	}
	CIQ.loadStylesheet('plugins/cryptoiq/cryptoiq.css',function(){
		CIQ.loadScript('plugins/cryptoiq/marketdepth.js', function(){
			marketDepthNeedsLoading=false;
			begin();
		});	
	});

	return _exports;
});
