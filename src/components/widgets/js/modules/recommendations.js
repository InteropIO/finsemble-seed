var recSymbolList = [];
var recContainerList = {};

function recommendationsCallback(err, recData) {
	_.each(recData, function (rec, symbol) {
		_.each(recContainerList[symbol], function (containerObject, key) {
			containerId = containerObject.attr('id');
			settings = defaultSettings.items[containerId.substring(4)];
			containerObject.html('<h3>Analyst Recommendations for ' + symbol + '</h3>');
			containerObject.append('<p>Mean Recommendation: ' + rec.Recommendation + '</p>');
			var table = $('<table>');
			_.each(rec.Recommendations, function(recommendation) {
				var tr = $('<tr>');
				tr.append('<td>' + recommendation[0] + '</td><td>' + recommendation[1] + '</td>');
				table.append(tr);
			});
			containerObject.append(table);
			containerObject.show();
		});
	});
}


function recommendations(list1) {
	var list;
	try {
		list = JSON.parse(list1);
	} catch (e) {
		list = list1;
	}
	//var symbolList = [];
	_.each(list, function (value, key) {
		var containerId = 'ciq-' + value;
		var settings = defaultSettings.items[value];
		var containerObject = $('#' + containerId);
		containerObject.addClass('ciq-quote-info');
		settings.id = key;
		if (settings.message && settings.message.data && settings.message.data.symbol) {
			settings.symbol = settings.message.data.symbol;
		}
		if (!settings.symbol) settings.symbol = portalSettings.defaultSymbol;
		recSymbolList.push(settings.symbol);
		if (!recContainerList[settings.symbol]) recContainerList[settings.symbol] = [];
		
		//remove this quote from everywhere else
		_.each(recContainerList, function(containerList) {
			_.each(containerList, function(container, cKey) {
				if (container.attr('id') == containerId) {
					_.pullAt(containerList, cKey);
				}
			});
		});
		
		
		recContainerList[settings.symbol].push(containerObject);
		if (settings.symbol.indexOf(':') !== -1) {
			var symbol = settings.symbol.split(':')[1];
			if (!recContainerList[symbol]) recContainerList[symbol] = [];
			recContainerList[symbol].push(containerObject); //deal with requests in the form of MARKET:SYMBOL and response in the form of SYMBOL
		}

	});

	recSymbolList = _.uniq(recSymbolList);
	
	
	dataSources[portalSettings.dataSource].fetchAnalystRecommendations(recSymbolList, recommendationsCallback);

	//PortalCore.addStyleSheet(cssUrl + 'modules/recommendations.css');
}