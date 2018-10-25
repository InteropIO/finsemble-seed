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
		module.exports = definition(require('chartiq'));
	} else if (typeof define === "function" && define.amd) {
		define(['chartiq'], definition);
	} else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition(global);
	} else {
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for cryptoiq/cryptoiq.js.");
	}
})(function(_exports) {
	var CIQ = _exports.CIQ;

	var needsLoading={
		orderBook: !!CIQ.UI,
		tradeHistory: !!CIQ.UI,
		marketDepth: true
	};

	function loaderCallBack(component){
		needsLoading[component]=false;
		begin();
	}

	if(CIQ.UI){
		if (typeof define === 'function' && define.amd){
			require(['plugins/cryptoiq/orderbook.js','plugins/cryptoiq/tradehistory.js'], function(){
				loaderCallBack("orderBook");
				loaderCallBack("tradeHistory");
			});
		}else if (typeof exports === 'object') {
			require('plugins/cryptoiq/orderbook.js');
			loaderCallBack("orderBook");
			require('plugins/cryptoiq/tradehistory.js');
			loaderCallBack("tradeHistory");				
		}else{
			CIQ.loadScript('plugins/cryptoiq/orderbook.js', function(){
				loaderCallBack("orderBook");
			});
			CIQ.loadScript('plugins/cryptoiq/tradehistory.js', function(){
				loaderCallBack("tradeHistory");
			});
		}

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

			/**
			 * @memberof CIQ.UI.Layout
			 * @param {HTMLElement} node
			 */
			CIQ.UI.Layout.prototype.getL2Heatmap=function(node){
				CIQ.UI.observe({
					selector: node,
					obj: this.context.stx.layout,
					member: "l2heatmap",
					condition: true,
					action: "class",
					value: this.params.activeClassName
				});
			};

			/**
			 * @memberof CIQ.UI.Layout
			 * @param {HTMLElement} node
			 */
			CIQ.UI.Layout.prototype.setL2Heatmap=function(node){
				var stx=this.context.stx;
				stx.layout.l2heatmap=!stx.layout.l2heatmap;
				stx.changeOccurred("layout");
				stx.draw();
			};

			/**
			 * @memberof CIQ.UI.Layout
			 * @param {HTMLElement} node
			 */
			CIQ.UI.Layout.prototype.getL2Heatmap=function(node){
				CIQ.UI.observe({
					selector: node,
					obj: this.context.stx.layout,
					member: "l2heatmap",
					condition: true,
					action: "class",
					value: this.params.activeClassName
				});
			};
		
			/**
			 * @memberof CIQ.UI.Layout
			 * @param {HTMLElement} node
			 */
			CIQ.UI.Layout.prototype.setL2Heatmap=function(node){
				var stx=this.context.stx;
				stx.layout.l2heatmap=!stx.layout.l2heatmap;
				stx.changeOccurred("layout");
				stx.draw();
			};
		}
	}

	var marketDepthArgs=null;
	// Stub function to allow us to create the object on the page before the class is loaded
	CIQ.MarketDepth=function(){
		marketDepthArgs=[].slice.call(arguments);
	};

	function begin(){
		if(needsLoading.orderBook || needsLoading.tradeHistory || needsLoading.marketDepth) return;
		if(marketDepthArgs) {
			CIQ.MarketDepth.apply(null, marketDepthArgs);
			var arg0=marketDepthArgs[0];
			if(arg0 && arg0.stx){
				arg0.stx.marketDepth.display(arg0.stx.layout.marketDepth);
			}
		}
	}

	function finishLoading(css){
		if(css){
			var style = document.createElement("style");
			style.type = "text/css";
			style.appendChild(document.createTextNode(css));
			document.head.appendChild(style);
		}
		if (typeof define === 'function' && define.amd){
			require(['plugins/cryptoiq/marketdepth.js'], function(){
				loaderCallBack("marketDepth");
			});
		}else if (typeof exports === 'object') {
			require('plugins/cryptoiq/marketdepth.js');
			loaderCallBack("marketDepth");
		}else{
			CIQ.loadScript('plugins/cryptoiq/marketdepth.js', function(){
				loaderCallBack("marketDepth");
			});
		}
	}
	if (typeof define === 'function' && define.amd){
		require(['plugins/cryptoiq/cryptoiq.css'], function(css){
			finishLoading(css);
		});
	}else if (typeof exports === 'object') {
		finishLoading(require('plugins/cryptoiq/cryptoiq.css'));
	}else{
		CIQ.loadStylesheet('plugins/cryptoiq/cryptoiq.css',finishLoading);
	}

	/**
	 * Depth of Market underlay for the chart.
	 * NOTE: Depth of Market will only display on the chart panel sharing the yAxis.
	 */
	if(CIQ.Studies){
		CIQ.extend(CIQ.Studies.studyLibrary,{"DoM": {
			"name": "Depth of Market",
			"underlay": true,
			"seriesFN": function(stx, sd, quotes){
				if(CIQ.Studies.displayDepthOfMarket) 
					CIQ.Studies.displayDepthOfMarket(stx, sd, quotes);
			},
			"calculateFN": null,
			"inputs": {"Bar Count": 20, "Width Percentage": 100},
			"outputs": {"Bid":"#8cc176", "Ask":"#b82c0c"},
			"parameters":{
				"init": {displayBorder:false, displaySize:true}
			},
			"attributes": {
				"yaxisDisplayValue":{hidden:true},
				"panelName":{hidden:true}
			}
		}});
	}

	return _exports;
});
