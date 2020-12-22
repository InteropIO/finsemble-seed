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
		module.exports = definition(require('chartiq/js/componentUI'),
		                            require('chartiq/plugins/tfc/tfc'),
		                            require('chartiq/plugins/tfc/tfc.html'),
		                            require('chartiq/plugins/tfc/tfc.scss'));
	} else if (typeof define === "function" && define.amd) {
		define([
			'chartiq/js/componentUI',
			'chartiq/plugins/tfc/tfc',
			'chartiq/plugins/tfc/tfc.html',
			'chartiq/plugins/tfc/tfc.scss'
		], definition);
	} else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition(global);
	} else {
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for tfc/tfc-loader.js.");
	}
})(function(_exports, _tfc, _html, _css) {
	var CIQ = _exports.CIQ;
	var realTFC=CIQ.TFC;

	function start(config){
		var stx=config.stx;
		if(typeof(config.account)=="function") config.account=new config.account();
		CIQ.TFC=realTFC;
		stx.tfc=new CIQ.TFC(config);   // This is the *real* CIQ.TFC.

		stx.addEventListener("newChart",function(){
			stx.tfc.changeSymbol();
		});

		var topNode=config.context ? config.context.topNode : document;

		stx.tfc.selectSymbol=function(symbol){
			if(config.context) config.context.changeSymbol({symbol:symbol.toUpperCase()});
		};

		var sidePanel=topNode.querySelector("cq-side-panel"), tradePanel=topNode.querySelector(".stx-trade-panel");
		sidePanel.appendChild(tradePanel);
		if(sidePanel.getAttribute("cq-active")=="true"){
			sidePanel.open({selector:".stx-trade-panel",className:"active"});
			CIQ.unappendClassName(tradePanel,"closed");
		}

		CIQ.safeClickTouch(topNode.querySelector(".stx-trade-nav .stx-trade-ticket-toggle"), function(){
			CIQ.unappendClassName(topNode.querySelector(".stx-trade-nav"),"active");
			CIQ.appendClassName(topNode.querySelector(".stx-trade-info"),"active");
			topNode.querySelector("cq-side-panel").resizeMyself();
		});
		CIQ.safeClickTouch(topNode.querySelector(".stx-trade-info .stx-trade-ticket-toggle"), function(){
			CIQ.unappendClassName(topNode.querySelector(".stx-trade-info"),"active");
			CIQ.appendClassName(topNode.querySelector(".stx-trade-nav"),"active");
			topNode.querySelector("cq-side-panel").resizeMyself();
		});

		if(config.account.Poller) config.account.Poller.startPolling(stx.tfc);

		var contextConfig = config.context.config;
		if (!contextConfig) return;

		CIQ.UI.BaseComponent.prototype.channelSubscribe(
			contextConfig.channels.tfc,
			handleActive,
			stx
		);
		function handleActive(isActive) {
			tradePanel.classList[isActive ? "remove" : "add"]("closed");
			tradePanel.classList[isActive ? "add" : "remove"]("active");
		}
	}

	// Stub function to allow child classes to be defined by the user
	if(!CIQ.Account) CIQ.Account=function(){};

	// Stub function to allow us to create the object on the page before the class is loaded
	CIQ.TFC=function(config){
		var tfcConfig={
			stx: config.stx,
			account: config.account,
			chart: config.chart,
			context: config.context
		};
		var basePath="plugins/tfc/";
		function cb(err) {
			function cbDemo(){
				tfcConfig.account=CIQ.Account.Demo;
				start(tfcConfig);
			}
			if (err) return console.log(err);
			if(!realTFC) realTFC=CIQ.TFC;
			if(!tfcConfig.account) {
				if(_tfc){
					cbDemo();
				}else{
					CIQ.loadScript(basePath + "tfc-demo.js", cbDemo);
				}
			}else{
				for (var key in CIQ.Account.prototype)  {
					if(!tfcConfig.account.prototype[key]) {
						tfcConfig.account.prototype[key] = CIQ.Account.prototype[key];
					}
				}
				start(tfcConfig);
			}
		}
		var topNode=config.context ? config.context.topNode : document.body;
		if(_html){
			var div = document.createElement("div");
			CIQ.innerHTML(div, _html);
			for (var j = 0; j < div.children.length; j++) {
				var ch = div.children[j].cloneNode(true);
				topNode.appendChild(ch);
			}
			cb();
		}else{
			CIQ.loadWidget(basePath + "tfc", topNode, cb);
		}
	};

	return _exports;
});
