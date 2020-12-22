var estSymbolList = [];
var estContainerList = {};

function analystestimatesCallback(err, data) {
	debugger
}

function analystestimates(list) {
	list = JSON.parse(list);

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

		estSymbolList.push(settings.symbol);
		if (!estContainerList[settings.symbol]) estContainerList[settings.symbol] = [];
		
		//remove this quote from everywhere else
		_.each(estContainerList, function(containerList) {
			_.each(containerList, function(container, cKey) {
				if (container.attr('id') == containerId) {
					_.pullAt(containerList, cKey);
				}
			});
		});
		
		
		estContainerList[settings.symbol].push(containerObject);
		if (settings.symbol.indexOf(':') !== -1) {
			var symbol = settings.symbol.split(':')[1];
			if (!estContainerList[symbol]) estContainerList[symbol] = [];
			estContainerList[symbol].push(containerObject); //deal with requests in the form of MARKET:SYMBOL and response in the form of SYMBOL
		}

	});

	estSymbolList = _.uniq(estSymbolList);
	
	
	dataSources[portalSettings.dataSource].fetchAnalystEstimates(estSymbolList, analystestimatesCallback);

}