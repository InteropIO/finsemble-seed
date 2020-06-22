/***********************************************************************************************************************
	Copyright 2017-2020 by ChartIQ, Inc.
	Licensed under the ChartIQ, Inc. Developer License Agreement https://www.chartiq.com/developer-license-agreement
 **********************************************************************************************************************/
var finWindow;
var defaultSettings = {
	"newSearch": {
		"maxResults": 50
	},
	"dataSource": "xignite",
	"mainWidget": "Fundamentals Chart",
	"items": {
		"newSearch": {
			"itemType": "Search"
		},
		"fundamentalchart": {
			"itemType": "FundamentalChart",
			"fundamentals": [
				{
					"fundamental": "EPS",
					"label": "Quarterly EPS",
					"term": "Quarterly"
				},
				{
					"fundamental": "EPS",
					"label": "TTM EPS",
					"term": "TTM"
				}
			],
			"years": 5,
			"dependsOn": "finsemble"
		},
		"finsemble": {
			"itemType": "Finsemble",
			dependsOn: 'newSearch'
		}
	},
	"isSymbolDriven": true,
	"layout": [
		[
			["newSearch"]
		],
		[
			["fundamentalchart"]
		],
		[
			["finsemble"]
		]
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