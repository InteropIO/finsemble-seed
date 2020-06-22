/***********************************************************************************************************************
	Copyright 2017-2020 by ChartIQ, Inc.
	Licensed under the ChartIQ, Inc. Developer License Agreement https://www.chartiq.com/developer-license-agreement
 **********************************************************************************************************************/
var finWindow;
var defaultSettings = {
	"newSearch": {
		"maxResults": 25
	},
	"mainWidget": "News",
	"dataSource": "xignite",
	"isSymbolDriven": true,
	"items": {
		"newSearch": {
			"itemType": "Search"
		},
		"finsemble": {
			"itemType": "Finsemble",
			dependsOn: 'newSearch'
		},
		"news": {
			"itemType": "TickerNews",
			dependsOn: 'finsemble'
		},
	},
	"layout": [
		[
			["newSearch"]
		],
		[
			["news"]
		],
		[
			["finsemble"]
		]
	]
};

const init = function () {
	finWindow = fin.desktop.Window.getCurrent();
	requirejs(['../widgetBase']);

	FSBL.Clients.DataTransferClient.addReceivers({
		receivers: [
			{
				type: "symbol", //for drag and drop
				handler: function (err, response) {
					var message = {
						sender: "newSearch",
						subject: 'symbolChange',
						data: {
							symbol: response.data.symbol.symbol
						}
					}
					PortalCore.sendMessage(message);

				}
			}
		]
	})

	FSBL.Clients.DataTransferClient.setEmitters({
		emitters: [
			{
				type: "symbol", //for drag and drop
				data: function (err, response) {
					return {
						'symbol': portalSettings.items.news.symbol,
						'description': 'Symbol ' + portalSettings.items.news.symbol
					};
				}
			}
		]
	})
};

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", init);
} else {
	window.addEventListener("FSBLReady", init);
}