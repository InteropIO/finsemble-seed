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
		module.exports = definition(require('chartiq/js/chartiq'),
		                            require('chartiq/plugins/cryptoiq/marketdepth'),
		                            require('chartiq/plugins/cryptoiq/orderbook'),
		                            require('chartiq/plugins/cryptoiq/tradehistory'),
		                            require('chartiq/plugins/cryptoiq/cryptoiq.scss'));
	} else if (typeof define === "function" && define.amd) {
		define([
			'chartiq/js/chartiq',
			'chartiq/plugins/cryptoiq/marketdepth',
			'chartiq/plugins/cryptoiq/orderbook',
			'chartiq/plugins/cryptoiq/tradehistory',
			'chartiq/plugins/cryptoiq/cryptoiq.scss'
		], definition);
	} else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition(global);
	} else {
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for cryptoiq/cryptoiq.js.");
	}
})(function(_exports, md, ob, th, css) {
	var CIQ = _exports.CIQ;

	if(CIQ.UI && CIQ.UI.Layout){
		/**
		 * @memberof CIQ.UI.Layout
		 * @param {HTMLElement} node
		 * @private
		 */
		CIQ.UI.Layout.prototype.getMarketDepth=function(node){
			var stx=this.context.stx, className=this.params.activeClassName;
			var listener=function(obj){
				if(obj.value) node.classList.add(className);
				else node.classList.remove(className);
			};
			CIQ.UI.observeProperty("marketDepth", stx.layout, listener);
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
		 * @private
		 */
		CIQ.UI.Layout.prototype.getL2Heatmap=function(node){
			var stx=this.context.stx, className=this.params.activeClassName;
			var listener=function(obj){
				if(obj.value) node.classList.add(className);
				else node.classList.remove(className);
			};
			CIQ.UI.observeProperty("l2heatmap", stx.layout, listener);
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
	
	if(!md && !ob && !th){
		var needsLoading={
			orderBook: !!CIQ.UI,
			tradeHistory: !!CIQ.UI,
			marketDepth: true
		};

		var loaderCallBack=function(component){
			needsLoading[component]=false;
			begin();
		};

		if(CIQ.UI){
			CIQ.loadScript('plugins/cryptoiq/orderbook.js', function(){
				loaderCallBack("orderBook");
			});
			CIQ.loadScript('plugins/cryptoiq/tradehistory.js', function(){
				loaderCallBack("tradeHistory");
			});
		}

		var marketDepthArgs=null;
		// Stub function to allow us to create the object on the page before the class is loaded
		CIQ.MarketDepth=function(){
			marketDepthArgs=[].slice.call(arguments);
		};

		var begin=function(){
			if(needsLoading.orderBook || needsLoading.tradeHistory || needsLoading.marketDepth) return;
			if(marketDepthArgs) {
				var arg0=marketDepthArgs[0];
				if(arg0 && arg0.stx){
					new CIQ.MarketDepth(marketDepthArgs[0]);
					arg0.stx.marketDepth.display(arg0.stx.layout.marketDepth);
				}
			}
		};

		var finishLoading=function(css){
			if(css){
				var style = document.createElement("style");
				style.type = "text/css";
				style.appendChild(document.createTextNode(css));
				document.head.appendChild(style);
			}
			CIQ.loadScript('plugins/cryptoiq/marketdepth.js', function(){
				loaderCallBack("marketDepth");
			});
		};
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
				"panelName":{hidden:true},
				"flippedEnabled":{hidden:true}
			}
		}});
	}

	return _exports;
});
