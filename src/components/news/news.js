/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
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

FSBL.addEventListener('onReady', function () {
	finWindow = fin.desktop.Window.getCurrent();
	requirejs(['../../assets/js/widgetBase']);

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
});