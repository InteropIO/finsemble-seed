/**
 *	8.0.0
 *	Generation date: 2020-10-06T17:11:13.549Z
 *	Client name: sonyl test
 *	Package Type: Technical Analysis
 *	License type: annual
 *	Expiration date: "2020/12/31"
 *	Domain lock: ["127.0.0.1","localhost","chartiq.com","codepen.io","codepen.plumbing","staging53.com"]
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


import { CIQ } from "../../js/chartiq.js";
import "../../js/extras/svgcharts/piechart.js";
import "../../plugins/activetrader/cryptoiq.js";
import "../../plugins/tfc/tfc-loader.js";

var startActiveTrader = function (stxx) {
	$("cq-tradehistory-table cq-scroll").prop(
		"reduceMenuHeight",
		45 - parseFloat($("#flexContainer").css("top"))
	); // take into account -15 margin on the flex container

	if (CIQ.MarketDepth)
		new CIQ.MarketDepth({
			stx: stxx,
			volume: true,
			mountain: true,
			step: true,
			record: true,
			height: "40%",
			precedingContainer: "#marketDepthBookmark"
		});

	// Set defaults for initial load
	function overrideLayoutSettings(obj) {
		var stx = obj.stx;
		stx.setChartType("line");
		CIQ.extend(stx.layout, {
			crosshair: true,
			headsUp: "static",
			l2heatmap: true,
			rangeSlider: true,
			marketDepth: true,
			extended: false
		});
		stx.changeOccurred("layout");
		var tradeToggle = $(".stx-trade")[0];
		if (tradeToggle) tradeToggle.set(true); // open the TFC sidepanel
	}

	overrideLayoutSettings({ stx: stxx });
	stxx.addEventListener("symbolImport", overrideLayoutSettings);

	function moneyFlowChart(stx) {
		var initialPieData = {
			Up: { index: 1 },
			Down: { index: 2 },
			Even: { index: 3 }
		};

		var pieChart = new CIQ.Visualization({
			container: "cq-tradehistory-table div[pie-chart] div",
			renderFunction: CIQ.SVGChart.renderPieChart,
			colorRange: ["#8cc176", "#b82c0c", "#7c7c7c"],
			className: "pie",
			valueFormatter: CIQ.condenseInt
		}).updateData(CIQ.clone(initialPieData));
		var last = 0;
		stx.append("updateCurrentMarketData", function (
			data,
			chart,
			symbol,
			params
		) {
			if (symbol) return;
			var items = document.querySelectorAll("cq-tradehistory-body cq-item");
			var d = {};
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				if (item == last) break;
				var dir = item.getAttribute("dir");
				if (!dir) dir = "even";
				dir = CIQ.capitalize(dir);
				if (!d[dir]) d[dir] = 0;
				d[dir] += parseFloat(
					item.querySelector("[col=amount]").getAttribute("rawval")
				);
			}
			if (i) pieChart.updateData(d, "add");
			last = items[0];
		});
		stx.addEventListener("symbolChange", function (obj) {
			pieChart.updateData(CIQ.clone(initialPieData));
		});
		return pieChart;
	}
	stxx.moneyFlowChart = moneyFlowChart(stxx);

	return stxx;
};

export default startActiveTrader;
