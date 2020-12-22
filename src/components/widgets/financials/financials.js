/***********************************************************************************************************************
	Copyright 2017-2020 by ChartIQ, Inc.
	Licensed under the ChartIQ, Inc. Developer License Agreement https://www.chartiq.com/developer-license-agreement
 **********************************************************************************************************************/
var finWindow;
var defaultSettings = {
	"newSearch": {
		"maxResults": 50
	},
	"isSymbolDriven": true,
	"dataSource": "xignite",
	"mainWidget": "Financials",
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
		"financials": {
			"itemType": "Financials",
			dependsOn: 'finsemble'
		},
		"finsemble": {
			"itemType": "Finsemble",
			dependsOn: 'newSearch'
		}
	},
	"layout": [
		[
			["newSearch"]
		],
		[
			["financials"]
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
						'symbol': portalSettings.items.financials.symbol,
						'description': 'Symbol ' + portalSettings.items.financials.symbol
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