/***********************************************************************************************************************
	Copyright 2017-2020 by ChartIQ, Inc.
	Licensed under the ChartIQ, Inc. Developer License Agreement https://www.chartiq.com/developer-license-agreement
 **********************************************************************************************************************/
var finWindow;
var defaultSettings = {
	"search": {
		"maxResults": 50
	},
	"dataSource": "xignite",
	"mainWidget": "Markets Overview",
	"items": {
		"chart1": {
			"itemType": "BasicChart",
			"symbol": "SPY",
			"name": "S&P 500 SPDR ETF",
			"range": "1D",
			height: 150
			//quoteDiv: "quote1"
		},

		"chart2": {
			"itemType": "BasicChart",
			"symbol": "QQQ",
			"name": "QQQ Nasdaq ETF",
			"range": "1D",
			height: 150
			//quoteDiv: "quote2"
		},

		"chart3": {
			"itemType": "BasicChart",
			"symbol": "DIA",
			"name": "DIA Dow Jones ETF",
			"range": "1D",
			height: 150
			//quoteDiv: "quote3"
		},

		"widget1": {
			"itemType": "ScrollingTicker",
			"symbolList": [
				["QQQ", "Nasdaq ETF (QQQ)"],
				["SPY", "S&P 500 ETF (SPY)"],
				["DIA", "Dow Jones ETF (DIA)"],
				["USDJPY", "Yen"],
				["USDEUR", "Euro"],
				["XAUUSD", "Gold"],

			]
		},

		"widget2": {
			"itemType": "MarketsNews",
			"numberOfItems": 4,
			"showImages": true
		},

		"widget3": {
			"itemType": "TopMovers",
			"numberOfItems": 10,
			"Headlines": true,
			"title": ""
		},

		"widget4": {
			"itemType": "SectorPerformance",
		},

		"rates": {
			"itemType": "Rates",
			"title": ""
		},

		"widget6": {
			"itemType": "TickerNews",
			"dependsOn": "widget3",
			"numberOfItems": 3,
			"showImages": true
		},

		"widget7": {
			"itemType": "BasicChart",
			"dependsOn": "widget3"
		},

		"rateschart": {
			"itemType": "RatesChart",
			"dependsOn": "rates",
			"height": 150
		},

		"srch": {
			itemType: "Search"
		},

		"carousel": {
			itemType: "Carousel",
			symbolList: [
				["QQQ", "Nasdaq ETF (QQQ)"],
				["SPY", "S&P 500 ETF (SPY)"],
				["DIA", "Dow Jones ETF (DIA)"],
			],
			chartType: 'baseline_delta',
			height: 75
		},

	},
	"layout": [

		[
			["widget1"]
		],
		/*[
			["chart1", "chart2", "chart3"]
		],*/
		[["carousel"]],
		[["widget4", "rates"]],
		/*[{
			title: 'Rates',
			items: ["rates", "rateschart"]
		}],*/
		[{
			title: 'Top Movers',
			class: 'TopMovers',
			items: ["widget3", "widget6", "widget7"]
		}]
	]
};

const init = function () {
	finWindow = fin.desktop.Window.getCurrent();
	requirejs(['../widgetBase']);
};

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", init);
} else {
	window.addEventListener("FSBLReady", init);
}