if (!window.quoteSymbolList) window.quoteSymbolList = {};
if (!window.quoteContainerList) window.quoteContainerList = {};
if (!window.quoteDependencyList) window.quoteDependencyList = {};
if (!window.quotesAreUpdating) window.quotesAreUpdating = false;
if (!window.cachedQuotes) window.cachedQuotes = {}

function quoteCallback(err, quoteData) {
	_.each(quoteData, function (quote, key) {
		if (!quote.Last && quote.Mid) {
			quote.Last = quote.Mid;
		}
		if (!quote.Last || !quote.Change) {
			return;
		}
		if (!window.cachedQuotes[key]) window.cachedQuotes[key] = quote;
		else if ((new Date(quote.DateTime).getTime()) > (new Date(window.cachedQuotes[key].DateTime).getTime())) _.assign(window.cachedQuotes[key], quote);
	});
	//window.cachedQuotes = _.assign(window.cachedQuotes, quoteData);
	quoteData = window.cachedQuotes;
	_.each(quoteData, function (quote, symbol) {
		if (!quote.Last || !quote.Change) return;
		//var fullContainerList = _.concat(quoteContainerList[symbol], quoteContainerList['^' + symbol]);
		var fullContainerList = [];
		if (quoteContainerList[symbol]) fullContainerList = quoteContainerList[symbol];
		if (quoteContainerList['^' + symbol]) fullContainerList = _.concat(fullContainerList, quoteContainerList['^' + symbol])
		_.each(fullContainerList, function (containerObject, key) {
			var containerId = containerObject.attr('id');
			var widgetId = containerId.substring(4);
			var settings = portalSettings.items[widgetId];

			quote.Symbol = settings.symbol;
			var displayName = settings.chartName ? settings.chartName : quote.Name;
			if (!displayName) displayName = quote.Symbol;

			if (settings.dontShow) { // for just getting quotes for other uses and not showing them
				quote.Name = displayName;
			} else {
				//if (!settings.name) settings.name = quote.Name;
				containerObject.html('<div><div><h2><span>' + displayName + '</span> <span>(' + settings.symbol + ')</span></h2><p>' + quote.DateTime + '</p>' +
					'</div><div><div class="ciq-sym-price">' + quote.Last + '</div><div class="ciq-sym-change"><div>Today\'s Change</div>' +
					'<div class="arrow ' + (quote.Change >= 0 ? 'up' : 'down') + '"></div><div class="' + (quote.Change >= 0 ? 'up' : 'down') + '"><strong>' + Math.abs(quote.Change.toFixed(2)) + '</strong> (<span>' + quote.PercentChange.toFixed(2) + '%</span>)</div></div></div></div>');
				containerObject.show();
			}

			var message = {
				sender: widgetId,
				subject: 'syncQuote',
				data: quote
			}

			PortalCore.sendMessage(message);
		});
	});
}

function noFetchUpdate(quoteData, sender) {
	_.each(quoteData, function (value, key) {
		//TODO: check if date changed on us to see if we need a new PrevClose;
		if (!window.cachedQuotes[key]) window.cachedQuotes[key] = quoteData[key];
		else if ((new Date(quoteData[key].Date)).getTime() > (new Date(window.cachedQuotes[key].DateTime).getTime())) {
			window.cachedQuotes[key] = _.assign(window.cachedQuotes[key], quoteData[key]);
			var quote = window.cachedQuotes[key];
			quote.Change = quote.Last - quote.PreviousClose;
			quote.PercentChange = quote.Change / quote.PreviousClose * 100;
		}
	});
	quoteData = window.cachedQuotes;
	_.each(quoteDependencyList, function (value, key) {
		if (key != sender) {
			value.quoteCallback(null, quoteData, value.extraParams);
		}
	});
}

function verifyQuoteData(quoteData) {
	var validQuotes = true;
	_.each(quoteData, function (quote) {
		if (!quote.Last && quote.Mid) {
			quote.Last = quote.Mid;
		}
		if (!_.isNumber(quote.Last)) {
			validQuotes = false;
		}
		if (!_.isNumber(quote.Change)) {
			quote.Change = 'N/A';
			quote.PercentChange = 'N/A';
		}
	});
	return validQuotes;
}

function updateQuoteCallback(err, quoteData) {
	if (!verifyQuoteData(quoteData)) {
		dataSources[portalSettings.dataSource].fetchQuotes(_.uniq(_(quoteSymbolList).values().join().split(',')), updateQuoteCallback);
	} else {
		_.each(quoteDependencyList, function (value) {
			value.quoteCallback(err, quoteData, value.extraParams);
		});
	}

}

function updateQuote() {
	if (quotesAreUpdating) return;
	quotesAreUpdating = true;
	setInterval(function () {
		//_.each(quoteDependencyList, function (value) {
		dataSources[portalSettings.dataSource].fetchQuotes(_.uniq(_.join(_.values(quoteSymbolList)).split(',')), updateQuoteCallback);
		//});
	}, portalSettings.quoteRefreshRate * 1000);
}

function quote(list1) {
	var list;
	try {
		list = JSON.parse(list1);
	} catch (e) {
		list = list1;
	}
	//symbolList = [];
	quoteSymbolList[_.join(list)] = []
	_.each(list, function (value, key) {
		var containerId = 'ciq-' + value;
		var settings = portalSettings.items[value];
		var containerObject = $('#' + containerId);
		containerObject.addClass('ciq-quote-info');
		settings.id = key;
		if (settings.message && settings.message.data && settings.message.data.symbol) {
			settings.symbol = settings.message.data.symbol;
		}
		if (!settings.symbol) settings.symbol = portalSettings.defaultSymbol;
		//quoteSymbolList[_.join(list)] = [settings.symbol];
		quoteSymbolList[_.join(list)].push(settings.symbol);
		if (!quoteContainerList[settings.symbol]) quoteContainerList[settings.symbol] = [];

		//remove this container from everywhere else
		_.each(quoteContainerList, function (containerList) {
			_.each(containerList, function (container, cKey) {
				if (container.attr('id') == containerId) {
					_.pullAt(containerList, cKey);
				}
			});
		});


		quoteContainerList[settings.symbol].push(containerObject);
		if (settings.symbol.indexOf(':') !== -1) {
			var symbol = settings.symbol.split(':')[1];
			if (!quoteContainerList[symbol]) quoteContainerList[symbol] = [];
			quoteContainerList[symbol].push(containerObject); //deal with requests in the form of MARKET:SYMBOL and response in the form of SYMBOL
		}

	});

	quoteSymbolList[_.join(list)] = _.uniq(quoteSymbolList[_.join(list)]);

	quoteDependencyList[_.join(list)] = {
		quoteCallback: quoteCallback
	};

	dataSources[portalSettings.dataSource].fetchQuotes(_.uniq(_(quoteSymbolList).values().join().split(',')), quoteCallback);
	updateQuote();

	PortalCore.addStyleSheet(cssUrl + 'modules/quote.css');
}