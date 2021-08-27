/**
 *	8.3.99
 *	Generation date: 2021-05-21T20:54:02.745Z
 *	Client name: finsemble
 *	Package Type: Technical Analysis
 *	License type: annual
 *	Expiration date: "2022/07/20"
 *	Domain lock: ["127.0.0.1","localhost","chartiq.com","finsemble.com"]
 *	iFrame lock: true
 */

/***********************************************************
 * Copyright by ChartIQ, Inc.
 * Licensed under the ChartIQ, Inc. Developer License Agreement https://www.chartiq.com/developer-license-agreement
*************************************************************/
/*************************************** DO NOT MAKE CHANGES TO THIS LIBRARY FILE!! **************************************/
/* If you wish to overwrite default functionality, create a separate file with a copy of the methods you are overwriting */
/* and load that file right after the library has been loaded, but before the chart engine is instantiated.              */
/* Directly modifying library files will prevent upgrades and the ability for ChartIQ to support your solution.          */
/*************************************************************************************************************************/
/* eslint-disable no-extra-parens */


/*
 *
 * Active Trader package.  This loads up the market depth and orderbook modules.
 *
 */

import { CIQ } from "../../js/chartiq.js";
import "./marketdepth.js";
import "./orderbook.js";
import "./tradehistory.js";

var _css;
if (
	typeof define === "undefined" &&
	typeof module === "object" &&
	typeof require === "function"
) {
	_css = require("./cryptoiq.scss");
} else if (typeof define === "function" && define.amd) {
	define(["./cryptoiq.scss"], function (m1) {
		_css = m1;
	});
}

const basePath = CIQ.ChartEngine.pluginBasePath + "activetrader/";

if (_css) {
	CIQ.addInternalStylesheet(_css, "cryptoiq.scss");
} else {
	CIQ.loadStylesheet(basePath + "cryptoiq.css", function () {
		if (CIQ.MarketDepth) {
			CIQ.MarketDepth.mdStyleSheetLoaded = true;
			CIQ.MarketDepth.hmStyleSheetLoaded = true;
		}
	});
}

if (CIQ.UI && CIQ.UI.Layout) {
	/**
	 * @memberof CIQ.UI.Layout
	 * @param {HTMLElement} node The `cq-item` user interface element that enables users to enable the Market-Depth chart panel.
	 * @private
	 */
	CIQ.UI.Layout.prototype.getMarketDepth = function (node) {
		var stx = this.context.stx,
			className = this.params.activeClassName;
		var listener = function (obj) {
			if (obj.value) node.classList.add(className);
			else node.classList.remove(className);
		};
		CIQ.UI.observeProperty("marketDepth", stx.layout, listener);
	};

	/**
	 * @memberof CIQ.UI.Layout
	 * @param {HTMLElement} [node] The `cq-item` user interface element that enables users to enable the Market-Depth chart panel.
	 */
	CIQ.UI.Layout.prototype.setMarketDepth = function (node) {
		var stx = this.context.stx;
		stx.layout.marketDepth = !stx.layout.marketDepth;
		if (stx.marketDepth) stx.marketDepth.display(stx.layout.marketDepth);
		stx.changeOccurred("layout");
	};

	/**
	 * @memberof CIQ.UI.Layout
	 * @param {HTMLElement} node The `cq-item` user interface element that enables users to enable the L2 Heat Map.
	 * @private
	 */
	CIQ.UI.Layout.prototype.getL2Heatmap = function (node) {
		var stx = this.context.stx,
			className = this.params.activeClassName;
		var listener = function (obj) {
			if (obj.value) node.classList.add(className);
			else node.classList.remove(className);
		};
		CIQ.UI.observeProperty("l2heatmap", stx.layout, listener);
	};

	/**
	 * @memberof CIQ.UI.Layout
	 * @param {HTMLElement} node The `cq-item` user interface element that enables users to enable the L2 Heat Map.
	 */
	CIQ.UI.Layout.prototype.setL2Heatmap = function (node) {
		var stx = this.context.stx;
		stx.layout.l2heatmap = !stx.layout.l2heatmap;
		stx.changeOccurred("layout");
		stx.draw();
	};
}

// Depth of Market underlay for the chart.
// NOTE: Depth of Market will only display on the chart panel sharing the yAxis.
CIQ.Studies = CIQ.Studies || function () {};
if (!CIQ.Studies.studyLibrary) CIQ.Studies.studyLibrary = {};
CIQ.extend(CIQ.Studies.studyLibrary, {
	DoM: {
		name: "Depth of Market",
		underlay: true,
		seriesFN: function (stx, sd, quotes) {
			if (CIQ.Studies.displayDepthOfMarket)
				CIQ.Studies.displayDepthOfMarket(stx, sd, quotes);
		},
		calculateFN: null,
		inputs: { "Bar Count": 20, "Width Percentage": 100 },
		outputs: { Bid: "#8cc176", Ask: "#b82c0c" },
		parameters: {
			init: { displayBorder: false, displaySize: true }
		},
		attributes: {
			yaxisDisplayValue: { hidden: true },
			panelName: { hidden: true },
			flippedEnabled: { hidden: true }
		}
	}
});
