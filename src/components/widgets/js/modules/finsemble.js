
function finsemble(list) { //function is intentionally not camelcase
	list = JSON.parse(list);
	_.each(list, function (widgetId, key) {
		var settings = portalSettings.items[widgetId];
		if (settings.message && settings.message.data && settings.message.data.symbol) {
			settings.symbol = settings.message.data.symbol;
		}

		var hasAChartDependency = false;
		var windowTitle = '';
		if (dependencies[widgetId]) {
			var message = {
				sender: widgetId,
				subject: 'symbolChange',
				data: {
					symbol: settings.symbol
				}
			}
			PortalCore.sendMessage(message);
			_.each(dependencies[widgetId].items, function (dependency) {
				if (portalSettings.items[dependency].itemType.toLowerCase().includes('chart')) {
					hasAChartDependency = true
				}
				if (!['Finsemble', 'Search'].includes(portalSettings.items[dependency].itemType)) {
					if (windowTitle != '') windowTitle += ', ';
					windowTitle += portalSettings.items[dependency].itemType;
				}
			})
		}

		var symbolToShare = settings.symbol || portalSettings.defaultSymbol;
		var instrumentToShare = {
			name: symbolToShare,
			id: {
				ticker: symbolToShare
			}
		};
		FSBL.Clients.LinkerClient.publish({ dataType: "symbol", data: symbolToShare });

		if (hasAChartDependency) {
			require(['modules/quote'], function () {
				dataSources[portalSettings.dataSource].fetchQuotes([symbolToShare], updateTitle, null);
				quoteSymbolList[widgetId] = [symbolToShare];
				function updateTitle(err, quotes) {
					_.each(quotes, function (quote) {
						if (quote.Symbol == symbolToShare) {
							var arrow = '';
							if (quote.Change > 0) arrow = '▲';
							if (quote.Change < 0) arrow = '▼';
							var newTitle = quote.Symbol + ' \u200b \u200b ' + quote.Last + ' \u200b \u200b \u200b ' + arrow + ' \u200b' + quote.Change;
							FSBL.Clients.WindowClient.setWindowTitle(newTitle);
						}
					});
				}
				quoteDependencyList[widgetId] = {
					quoteCallback: updateTitle,
					extraParams: widgetId
				}
				updateQuote();
			});
		} else {
			FSBL.Clients.WindowClient.setWindowTitle(windowTitle + ' - ' + symbolToShare);
		}

		FSBL.Clients.WindowClient.setComponentState({
			field: 'symbol',
			value: symbolToShare,
			containerID: fin.desktop.Window.getCurrent().name
		});
	});
	//PortalCore.addStyleSheet('https://cdn.jsdelivr.net/jquery.ui/1.11.4/jquery-ui.min.css');
	//PortalCore.addStyleSheet(cssUrl + 'modules/rates.css');
};