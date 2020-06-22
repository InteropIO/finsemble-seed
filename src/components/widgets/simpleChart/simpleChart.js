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
	"mainWidget": "Simple Chart",
	"items": {
		"widget1": {
			"itemType": "ScrollingTicker",
			"symbolList": [
				["NDX.IND_GIDS", "Nasdaq"],
				["SPX.INDCBSX", "S&P 500"],
				["DJI.IND_DJI", "Dow Jones"],
				["USDJPY", "Yen"],
				["USDEUR", "Euro"],
				["XAUUSD", "Gold"],

			]
		},
		"newSearch": {
			"itemType": "Search"
		},
		"simplechart": {
			"itemType": "SimpleChart",
			dependsOn: ['finsemble']
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
			["simplechart"]
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
						'symbol': portalSettings.items.simplechart.symbol,
						'description': 'Symbol ' + portalSettings.items.simplechart.symbol
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