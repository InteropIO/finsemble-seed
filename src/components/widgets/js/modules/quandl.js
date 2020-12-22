var apiKey = 'z4cakZBjNPyodxTSnsno';


var QuandlMultiSnapshot = function () {};
if (!window.dataSources) window.dataSources = {};

var quandl = function () {};

QuandlMultiSnapshot.isIndexSymbol = function (symbol) {
	if (symbol && symbol.indexOf(".IND") > 0) return true;
	if (symbol && symbol.charAt(0) == "^" && symbol.length < 6) return true;
	return false;
};

QuandlMultiSnapshot.hasExchange = function (symbol) {
	if (symbol) {
		// split on '.' to check for exchange
		var exchangeSplit = symbol.split('.');

		if (exchangeSplit.length > 1) {
			// exchange code will only be 4 characters
			// index length will always be more than 4
			if (exchangeSplit[1].length == 4) {
				return true;
			}
		}
	}

	return false;
};

QuandlMultiSnapshot.isFuturesSymbol = function (symbol) {
	if (!symbol) return false;
	if (symbol.indexOf("/") == 0) return true;
	return false;
};

QuandlMultiSnapshot.isForexSymbol = function (symbol) {
	if (!symbol) return false;
	if (symbol.indexOf(".") != -1) return false;
	if (symbol.indexOf("/") != -1) return false;
	if (symbol.length < 6 || symbol.length > 7) return false;
	if (/\^?[A-Za-z]{6}$/.test(symbol)) return true;
	return false;
};

QuandlMultiSnapshot.isForexMetal = function (symbol) {
	if (!symbol) return false;
	if (!QuandlMultiSnapshot.isForexSymbol(symbol)) return false;
	var tSym = symbol;
	if (tSym.charAt(0) != "^") tSym = "^" + tSym;
	if (",XAU,XPD,XPT,XAG,".indexOf("," + tSym.substr(4, 3) + ",") != -1) return true;
	else if (",XAU,XPD,XPT,XAG,".indexOf("," + tSym.substr(1, 3) + ",") != -1) return true;
	return false;
};

QuandlMultiSnapshot.securityType = function (symbol, useSuperQuotes) {
	if (QuandlMultiSnapshot.isIndexSymbol(symbol)) return "INDEX_REALTIME";
	if (QuandlMultiSnapshot.isForexMetal(symbol)) return "METAL";
	if (QuandlMultiSnapshot.isForexSymbol(symbol)) return "CURRENCY";
	if (QuandlMultiSnapshot.isFuturesSymbol(symbol)) return "FUTURE";
	if (QuandlMultiSnapshot.hasExchange(symbol)) return "EXCHANGE";
	if (useSuperQuotes) return "SUPERQUOTES";
	return "EQUITY";
};

QuandlMultiSnapshot.makeUrl = function (path) {
	function getHostName() {
		var url = document.location.href;
		try {
			return url.match(/:\/\/(.[^/]+)/)[1];
		} catch (e) {
			return "";
		}
	}

	function urlBase(topDir) {
		var hostname = getHostName();
		var base = "data";
		if (apiToken) base = "https://devservices.chartiq.com" + (topDir ? "/" + topDir : "");
		else if (needsEncryption) {
			var baseParts = topDir.split('_');
			if (baseParts[0] == 'www' || baseParts[0] == 'chartiq') {
				base = "https://" + topDir.replace(/_/, ".") + ".com";
			} else {
				base = "https://" + topDir.replace(/_/, "-chartiq.") + ".com";
			}
		} else if (hostname == "127.0.0.1" || hostname == "localhost") base = "https://devservices.chartiq.com/data" + (topDir ? "/" + topDir : "");
		else base += "/" + topDir;
		return base;
	}
	if (path[0] == "/") path = path.substr(1);
	var dirs = path.split("/");
	var url;
	/*if (dirs[0]=='historical_currencies_bugfix') {
		dirs.shift();
		url = 'https://globalcurrencies.quandl.com'
	} else {*/
	url = urlBase(dirs.shift());
	//}
	url += "/" + dirs.join("/");
	if (apiToken) {
		if (url.indexOf('?') == -1) url += "?_Token=" + apiToken;
		else url += "&_Token=" + apiToken;
	} else if (needsEncryption && encryptedToken.token) {
		if (url.indexOf('?') == -1) url += "?_Token=" + encryptedToken.token;
		else url += "&_Token=" + encryptedToken.token;
		url += "&_Token_Userid=" + encryptedToken.tokenUser;
	}
	return url;
};


// Looks like Quandl only has EOD.
/**
 * Gets snapshot quotes for an array of symbols
 * @param  {Array}   symbols        Array of symbol names
 * @param  {Object}   [entitlements]   Entitlement object.  Set {BATS:true} if BATS is entitled for the user.
 * @param  {Function} cb             Callback function to receive symbol data. function(err, arr)
 * @param  {String}   [identifierType="symbol"] Optional identifier type, will apply to all securities that support it. "cusip","sedol", etc as supported by Quandl
 * @param  {Boolean}   [useSuperQuotes=false] Optional use Quandl super quotes API
 */
quandl.getQuotes = function (symbols, entitlements, cb, identifierType, useSuperQuotes, extraParams) {
	if (!apiToken && needsEncryption) {
		if (!QuandlMultiSnapshot.setQuandlEncryptedToken(encryptedToken, true)) {
			setTimeout(function (self, args) {
				return function () {
					quandl.getQuotes.apply(self, args);
				};
			}(this, arguments), 100);
			return;
		}
	}

	//var requestCount = 0;
	//var indiciesNumber = 0;
	//var indiciesCheck = false;
	//arr = [];


	if (!symbols.length) cb("no symbols", null, extraParams);

	var endDate = new Date();
	var asOfDate = new Date();
	asOfDate.setDate(endDate.getDate() - 1);
	if (asOfDate.getDay() == 6) {
		asOfDate.setDate(asOfDate.getDate() - 1);
	}
	if (asOfDate.getDay() == 0) {
		asOfDate.setDate(asOfDate.getDate() - 2);
	}
	var fixingTime = "21:00";
	if (PortalCore.getETUTCOffset(asOfDate) == -300) fixingTime = "22:00";
	asOfDate = (asOfDate.getMonth() + 1) + "/" + asOfDate.getDate() + "/" + asOfDate.getFullYear();

	var urls = {
		METAL: QuandlMultiSnapshot.makeUrl("/globalmetals_quandl/xGlobalMetals.json/GetRealTimeMetalQuotes?Symbols={symbols}&Currency=&_fields=Symbol,Currency,Date,Time,Ask,Bid,Mid,Unit"),
		CURRENCY: QuandlMultiSnapshot.makeUrl("/globalcurrencies_quandl/xGlobalCurrencies.json/GetRealTimeRates?Symbols={symbols}&_fields=Symbol,Date,Time,Ask,Bid,Mid,QuoteCurrency,BaseCurrency,Spread"),
		INDEX_REALTIME: QuandlMultiSnapshot.makeUrl("/globalindicesrealtime_quandl/xglobalindicesrealtime.json/GetRealTimeIndicesValue?IdentifierType={identifierType}&Identifiers={symbols}"),
		FUTURE: QuandlMultiSnapshot.makeUrl("/www_quandl/xFutures.json/GetDelayedFutures?Symbols={symbols}&Month=0&Year=0&_fields=Future.Symbol,Date,Time,Open,High,Low,Last,Volume,PreviousClose,Change,PercentChange"), // todo, determine forward month
		BATS: QuandlMultiSnapshot.makeUrl("/batsrealtime_quandl/v3/xBATSRealTime.json/GetExtendedQuotes?IdentifierType={identifierType}&Identifiers={symbols}&_fields=Security.Symbol,Security.Name,Date,Time,Open,High,Low,Last,Volume,PreviousClose,ChangeFromPreviousClose,PercentChangeFromPreviousClose"),
		//BATS: QuandlMultiSnapshot.makeUrl("/batsrealtime_quandl/xBATSRealTime.json/GetRealQuotes?Symbols={symbols}&_fields=Security.Symbol,Date,Time,Open,High,Low,Last,Volume,PreviousClose,Change,PercentChange"),
		CONSOLIDATED: QuandlMultiSnapshot.makeUrl("/globalrealtime_quandl/v3/xGlobalRealTime.json/GetGlobalExtendedQuotes?IdentifierType={identifierType}&Identifiers={symbols}&_fields=Security.Symbol,Security.Name,Date,Time,Open,High,Low,Last,Volume,PreviousClose,ChangeFromPreviousClose,PercentChangeFromPreviousClose"),
		//CONSOLIDATED: QuandlMultiSnapshot.makeUrl("/globalrealtime_quandl/v3/xGlobalRealTime.json/GetGlobalRealTimeQuotes?Symbols={symbols}&_fields=Security.Symbol,Date,Time,Open,High,Low,Last,Volume,PreviousClose,Change,PercentChange"),
		DELAYED: QuandlMultiSnapshot.makeUrl("/globalquotes_quandl/v3/xGlobalQuotes.json/GetGlobalExtendedQuotes?IdentifierType={identifierType}&Identifiers={symbols}&_fields=Security.Symbol,Security.CUSIP,Security.ISIN,Security.CIK,Security.Valoren,Security.Name,Date,Time,Open,High,Low,Last,Volume,PreviousClose,Currency,UTCOffset,High52Weeks,Low52Weeks,Outcome,ChangeFromPreviousClose,PercentChangeFromPreviousClose"),
		//DELAYED: QuandlMultiSnapshot.makeUrl("/globalquotes_quandl/v3/xGlobalQuotes.json/GetGlobalDelayedQuotes?IdentifierType={identifierType}&Identifiers={symbols}&_fields=Security.Symbol,Security.CUSIP,Security.ISIN,Security.CIK,Security.Valoren,Date,Time,Open,High,Low,Last,Volume,PreviousClose,Currency,UTCDate,UTCTime,High52Weeks,Low52Weeks,Outcome,ChangeFromPreviousClose,PercentChangeFromPreviousClose"),
		SUPERQUOTES: QuandlMultiSnapshot.makeUrl("/superquotes_quandl/xSuperQuotes.json/GetQuotes?IdentifierType={identifierType}&Identifiers={symbols}"),
		METAL_HISTORICAL: QuandlMultiSnapshot.makeUrl("/globalmetals_quandl/xGlobalMetals.json/GetHistoricalMetalQuotes?Symbols={symbols}&Currency=&PriceType=Mid&AsOfDate=" + asOfDate + "&FixingTime=" + fixingTime),
		CURRENCY_HISTORICAL: QuandlMultiSnapshot.makeUrl("/globalcurrencies_quandl/xGlobalCurrencies.json/GetHistoricalRates?Symbols={symbols}&PriceType=Mid&AsOfDate=" + asOfDate + "&FixingTime=" + fixingTime),
	};

	// separate the delayed and historical index urls as they are backup if realtime fails, so no need to execute them without cause.
	// keep index realtime in the other urls list in order to kick off the index search process.
	var indexUrls = {
		INDEX_DELAYED: QuandlMultiSnapshot.makeUrl("/globalindices_quandl/xglobalindices.json/GetDelayedIndicesValue?IdentifierType={identifierType}&Identifiers={symbols}"),
		INDEX_HISTORICAL: QuandlMultiSnapshot.makeUrl("/globalindiceshistorical_quandl/xglobalindiceshistorical.json/GetLastClosingIndicesValue?IdentifierType={identifierType}&Identifiers={symbols}"),
	};

	var isConsolidated = false;

	if (entitlements) {
		// flag if consolidated as that api can also access exchanges
		if (entitlements["EQUITY"] == "CONSOLIDATED") {
			urls["EQUITY"] = urls["CONSOLIDATED"];
			isConsolidated = true;
		} else if (entitlements["EQUITY"] == "BATS") urls["EQUITY"] = urls["BATS"];
	}

	delete urls["CONSOLIDATED"];
	delete urls["BATS"];

	var quotes = {
		METAL: [],
		EQUITY: [],
		DELAYED: [],
		CURRENCY: [],
		INDEX_REALTIME: [],
		FUTURE: [],
		SUPERQUOTES: [],
		METAL_HISTORICAL: [],
		CURRENCY_HISTORICAL: []
	}

	var indexQuotes = {
		INDEX_DELAYED: [],
		INDEX_HISTORICAL: []
	}

	var response = {}; // response values

	for (var i = 0; i < symbols.length; i++) {
		var symbol = symbols[i].toUpperCase();
		var securityType = QuandlMultiSnapshot.securityType(symbol, useSuperQuotes);

		if (securityType === "INDEX_REALTIME") {
			quotes[securityType].push(symbol);
			indexQuotes["INDEX_DELAYED"].push(symbol);
			indexQuotes["INDEX_HISTORICAL"].push(symbol);
		} else {
			if (securityType === "CURRENCY" || securityType === "METAL") {
				// Just in case ^ is still attached to symbol
				quotes[securityType].push(symbol.replace(/\^/, ""));
				quotes[securityType + '_HISTORICAL'].push(symbol.replace(/\^/, ""));
			} else if (securityType === "FUTURE") {
				// Just in case / is still attached to symbol
				quotes[securityType].push(symbol.replace(/\//, ""));
				/*} else if (securityType === "METAL") {
					quotes[securityType].push(symbol.replace(/\^/, ""));
					quotes['METAL_HISTORICAL'].push(symbol);*/
			}
			// if exchange exists for symbol assume it's foreign 
			// as BATs cannot handle foreign exchanges
			// make sure entitlement isn't consolidated as it can take foreign
			else if (securityType === "EXCHANGE") {
				if (isConsolidated) {
					quotes["EQUITY"].push(symbol);
				} else {
					quotes["DELAYED"].push(symbol);
				}
			} else {
				quotes[securityType].push(symbol);
			}
		}

		response[symbol] = {}; // initialize responses
	}

	// if no quotes for delayed delete url
	if (quotes["DELAYED"].length < 1) {
		delete urls["DELAYED"];
	}

	for (var securityType in quotes) {
		var symbols = quotes[securityType];

		if (identifierType && urls[securityType]) {
			urls[securityType] = urls[securityType].replace("{identifierType}", identifierType);
		} else if (urls[securityType]) {
			urls[securityType] = urls[securityType].replace("{identifierType}", "symbol");
		}

		if (symbols.length && urls[securityType]) {
			//requestCount++;
			urls[securityType] = urls[securityType].replace("{symbols}", symbols.join(","));
		} else {
			delete urls[securityType];
		}
	}

	// replace fields in the backup index urls as well
	for (var securityType in indexQuotes) {
		var symbols = indexQuotes[securityType];

		if (identifierType) {
			indexUrls[securityType] = indexUrls[securityType].replace("{identifierType}", identifierType);
		} else {
			indexUrls[securityType] = indexUrls[securityType].replace("{identifierType}", "symbol");
		}

		if (symbols.length) {
			indexUrls[securityType] = indexUrls[securityType].replace("{symbols}", symbols.join(","));
		} else {
			delete indexUrls[securityType];
		}
	}

	/**
	 * Processes the response from quandl
	 * @param  {String}   status		html status code
	 * @param  {Object}   result   	json returned from quandl
	 */

	function processResponse(status, result, remainingUrls, previousResults, cb) {
		var arr = previousResults;
		if (status == 200) {
			result = JSON.parse(result);
			for (var s = 0; s < result.length; s++) {
				var item = result[s];

				// Delayed Quotes
				if (item.Security) {
					if (item.Security.CUSIP) {
						item.Symbol = item.Security.CUSIP;
					} else {
						item.Symbol = item.Security.Symbol;
					}

					// only Change and PercentChange need to be normalized
					var fieldsToChange = {
						"Change": item.ChangeFromPreviousClose,
						"PercentChange": item.PercentChangeFromPreviousClose
					};
					normalizeFields(arr, item, fieldsToChange);
				}
				// Futures
				else if (item.Future) {
					item.Symbol = "/" + item.Future.Symbol;
					arr[item.Symbol] = item;
				}
				// Forex, Metals, BATS
				else if (item.Symbol) {
					// Metals Historical Quotes Have Symbol and Currency separate
					if (item.Currency) {
						item.Symbol = /*"^" +*/ item.Symbol + item.Currency;
						item.BaseCurrency = item.Currency;
					}
					// Combine Metals/Forex Historical and Realtime
					var existingItem;
					if (arr[item.Symbol]) {
						existingItem = arr[item.Symbol];
					}
					if (item.BaseCurrency || item.Unit) {
						if (item.Time) { // RealTime
							var fieldsToChange = {
								"Last": item.Mid,
								"Change": null,
								"PercentChange": null,
								"Volume": null,
								"High": null,
								"Low": null,
								"Open": null,
							};
							if (existingItem) {
								fieldsToChange["Previous"] = existingItem.Previous;
							}
						}
						if (item.StartTime) { //Historical
							var fieldsToChange = {
								"Previous": item.Average ? item.Average : item.Mid,
								"Change": null,
								"PercentChange": null,
								"Volume": null,
								"High": null,
								"Low": null,
								"Open": null
							};
							if (existingItem) {
								fieldsToChange["Last"] = existingItem.Last;
								fieldsToChange["Bid"] = existingItem.Bid;
								fieldsToChange["Ask"] = existingItem.Ask;
								fieldsToChange["Date"] = existingItem.Date;
								fieldsToChange["Time"] = existingItem.Time;
							}
						}
						normalizeFields(arr, item, fieldsToChange);
						if (!item.UTCOffset) item.UTCOffset = 0;
						if (item.Last && item.Previous) {
							item.Change = item.Last - item.Previous;
							item.PercentChange = item.Change / item.Previous * 100;
						}
					}
					// BATS : no fields need to be normalized
					else {
						arr[item.Symbol] = item;
					}
				}
				// Superquotes
				else if (item.Identifier) {
					item.UseSuperQuotes = true;

					// no need to normalize as we are using the
					// superquotes object as a template for the
					// other api responses
					item.Symbol = item.Identifier;
					arr[item.Symbol] = item;
				}

				if (!item.DateTime) item.DateTime = item.Date + ' ' + item.Time;

			}
		}

		if (_.size(remainingUrls)) {
			var key = _.keys(remainingUrls)[0];
			var url = remainingUrls[key];
			delete remainingUrls[key];
			if (key.substring(0, 5) !== "INDEX") {
				PortalCore.serverFetch(url, null, null, function (status, result) {
					processResponse(status, result, remainingUrls, arr, cb);
				});
			} else {
				PortalCore.serverFetch(url, null, null, function (status, result) {
					processIndexResponse(status, result, remainingUrls, arr, cb, 0);
				});
			}
		} else {
			cb(null, arr, extraParams);
		}
	}


	/**
	 * Helper response method to process quandl indicies results. This has
	 * been broken away from processResponse for ease of use/readability
	 * and to make sure the delayed and historical index urls are not
	 * needlessly executed
	 */

	function processIndexResponse(status, result, remainingUrls, previousResults, cb, indiciesNumber) {
		var arr = previousResults;
		var indiciesCheck = false;
		if (status == 200) {
			result = JSON.parse(result);
			for (var s = 0; s < result.length; s++) {
				var item = result[s];
				if (item.Index || item.hasOwnProperty('Index')) {
					if (item.Outcome === "Success") {
						item.Symbol = item.Index.Symbol + "." + item.Index.IndexGroup;
						item.Currency = item.Index.Currency;
						item.UseSuperQuotes = false;

						// only add the symbols that aren't already in the response object
						if (!arr.hasOwnProperty(item.Symbol)) {
							// 1 = Delayed, 2 = Historical
							if (indiciesNumber == 1) {
								item.Eod = false;
								item.Del = true;
							} else if (indiciesNumber == 2) {
								item.Eod = true;
								item.Del = false;
							}

							var fieldsToChange = {
								"Last": item.Value.Last,
								"Change": item.Value.ChangeFromPreviousClose,
								"PercentChange": item.Value.PercentChangeFromPreviousClose,
								"PreviousClose": item.Value.PreviousClose,
								"Volume": item.Value.Volume,
								"High": item.Value.High,
								"Low": item.Value.Low,
								"Open": item.Value.Open,
								"Date": item.Value.Date,
								"Time": item.Value.Time
							};

							normalizeFields(arr, item, fieldsToChange);
							if (!item.DateTime) item.DateTime = item.Date + ' ' + item.Time;
						}
					}
					// failure outcome, quote doesn't exist so try backup urls after processing current results
					else {
						indiciesCheck = true;
					}
				}

			}
		} else {
			indiciesCheck = true;
		}

		// execute backup urls, unfortunately we have to process all the symbols
		// again since quandl doesn't return which symbol failed in a
		// convienient manner
		if (indiciesCheck) {
			if (indiciesNumber == 0) {
				PortalCore.serverFetch(indexUrls["INDEX_DELAYED"], null, null, function (status, result) {
					processIndexResponse(status, result, remainingUrls, arr, cb, 1);
				});
			} else if (indiciesNumber == 1) {
				PortalCore.serverFetch(indexUrls["INDEX_HISTORICAL"], null, null, function (status, result) {
					processIndexResponse(status, result, remainingUrls, arr, cb, 2);
				});
			} else {
				if (_.size(remainingUrls)) {
					var key = _.keys(remainingUrls)[0];
					var url = remainingUrls[key];
					delete remainingUrls[key];
					if (key.substring(0, 5) !== "INDEX") {
						PortalCore.serverFetch(url, null, null, function (status, result) {
							processResponse(status, result, remainingUrls, arr, cb);
						});
					} else {
						PortalCore.serverFetch(url, null, null, function (status, result) {
							processIndexResponse(status, result, remainingUrls, arr, cb, 0);
						});
					}
				} else {
					cb(null, arr, extraParams);
				}
			}
		} else {
			if (_.size(remainingUrls)) {
				var key = _.keys(remainingUrls)[0];
				var url = remainingUrls[key];
				delete remainingUrls[key];
				if (key.substring(0, 5) !== "INDEX") {
					PortalCore.serverFetch(url, null, null, function (status, result) {
						processResponse(status, result, remainingUrls, arr, cb);
					});
				} else {
					PortalCore.serverFetch(url, null, null, function (status, result) {
						processIndexResponse(status, result, remainingUrls, arr, cb, 0);
					});
				}
			} else {
				cb(null, arr, extraParams);
			}
		}

	}

	/**
	 * There is very little consistency in the quandl api calls.
	 * Different field names, locations, no values defined, etc.
	 * This object will normalize the common fields used across multiple applications.
	 * More can be added, just make sure they match up according to the api response.
	 *
	 * Examples:  Metals and Forex don't have Last, Change, Change%, Open, High, Low, or Volume defined
	 * 			Indices have most fields under a Value object
	 * 			Delayed Quotes has a Change and Change% but under different field names than the others
	 * 			Futures and Bats have a similar object structure but different location for symbol field
	 *
	 * Note:	passing in a object that has the fields to change makes sure we don't needlessly
	 * 		overwrite existing values.
	 *
	 * Example: No need to pass in Volume if the field location is the same in the quandl response object
	 */

	function normalizeFields(arr, item, fieldsToChange) {
		// iterate through object entries and write to item object
		for (var field in fieldsToChange) {
			item[field] = typeof fieldsToChange[field] != "undefined" ? fieldsToChange[field] : null;
		}

		arr[item.Symbol] = item;
	}

	// if url is index realtime execute a different response callback
	/*for (var securityType in urls) {
		var url = urls[securityType];
		urls
		if (securityType !== "INDEX_REALTIME") {
			PortalCore.serverFetch(urls[securityType], null, null, processResponse);
		} else {
			PortalCore.serverFetch(urls[securityType], null, null, processIndexResponse);
		}
	}*/
	var key = _.keys(urls)[0];
	var url = urls[key];
	delete urls[key];

	if (key.substring(0, 5) !== "INDEX") {
		PortalCore.serverFetch(url, null, null, function (status, result) {
			processResponse(status, result, urls, {}, cb);
		});
	} else {
		PortalCore.serverFetch(url, null, null, function (status, result) {
			processIndexResponse(status, result, urls, {}, cb, 0);
		});
	}


};

quandl.fetchQuotes = quandl.getQuotes;

quandl.fetchMarketHeadlines = function (settings, cb, extraParams) {
	if (!QuandlMultiSnapshot.setQuandlEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				quandl.fetchMarketHeadlines.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}

	var limit = 5;
	var showImages = false;
	if (settings) {
		if (settings.numberOfItems) limit = settings.numberOfItems;
		if (settings.showImages) showImages = settings.showImages;
	}

	var url = QuandlMultiSnapshot.makeUrl("/globalnews_quandl/xGlobalNews.json/GetTopMarketSummaries?Count=" + limit);
	PortalCore.serverFetch(url, null, null, function (status, result) {
		if (status != 200) cb("Service Unavailable", null, extraParams);
		result = JSON.parse(result);
		if (!result.HeadlineSummaries) {
			cb("No News", null, extraParams);
			return;
		}
		var count = 0;
		var items = [];
		for (var s = 0; s < result.HeadlineSummaries.length; s++) {
			var item = result.HeadlineSummaries[s];
			item.Subject = PortalCore.entityDecode(item.Title);
			delete item.Title;
			if (item.Images.length) item.Image = item.Images[0];
			delete item.Images;
			if (item.Image && location.protocol == "https:" && item.Image.indexOf("http:") == 0) {
				item.Image = "https:" + item.Image.substr(5);
			}
			if (item.Image) item.Image = PortalCore.entityDecode(item.Image);
			item.Date = new Date(item.Date + " " + item.Time);
			if (item.Time) item.Date.setMinutes(item.Date.getMinutes() - item.UTCOffset * 60 - item.Date.getTimezoneOffset());
			delete item.Time;
			items.push(item);
		}
		cb(null, items, extraParams);
	});

}

quandl.fetchSecurityHeadlines = function (settings, cb, extraParams) {
	if (!QuandlMultiSnapshot.setQuandlEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				quandl.fetchSecurityHeadlines.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}

	var url = QuandlMultiSnapshot.makeUrl("/globalnews_quandl/xGlobalNews.json/GetTopSecuritySummaries?IdentifierType=Symbol&Identifier=" + encodeURIComponent(settings.symbol) + "&Count=" + settings.limit + "&_fields=HeadlineSummaries.Title,HeadlineSummaries.Date,HeadlineSummaries.Time,Headlines.UTCOffset,HeadlineSummaries.Source,HeadlineSummaries.Url,HeadlineSummaries.Images,HeadlineSummaries.Images.string,HeadlineSummaries.Summary");
	PortalCore.serverFetch(url, null, null, function (status, result) {
		if (status != 200) {
			cb("Data Source Error", null, extraParams);
			return;
		}
		result = JSON.parse(result);
		if (!result.HeadlineSummaries) {
			cb("No News", {
				'settings': settings,
				items: []
			}, extraParams);
			return;
		}
		var count = 0;
		var items = [];
		for (var s = 0; s < result.HeadlineSummaries.length; s++) {
			var item = result.HeadlineSummaries[s];
			item.Subject = PortalCore.entityDecode(item.Title);
			delete item.Title;
			if (item.Images.length) item.Image = item.Images[0];
			delete item.Images;
			if (item.Image && location.protocol == "https:" && item.Image.indexOf("http:") == 0) {
				item.Image = "https:" + item.Image.substr(5);
			}
			if (item.Image) item.Image = PortalCore.entityDecode(item.Image);
			item.Date = new Date(item.Date + " " + item.Time);
			if (item.Time) item.Date.setMinutes(item.Date.getMinutes() - item.UTCOffset * 60 - item.Date.getTimezoneOffset());
			delete item.Time;
			items.push(item);
		}
		cb(null, {
			'settings': settings,
			'items': items
		}, extraParams);
	});


}

quandl.fetchTopMovers = function (settings, moverType, moversCB, newsCB, extraParams) {
	if (!QuandlMultiSnapshot.setQuandlEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				quandl.fetchTopMovers.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}
	var limit = 5;
	if (settings) {
		if (settings.numberOfItems) limit = settings.numberOfItems;
	}

	var moverTypeCodeMap = {
		'advancers': 'PercentGainers',
		'decliners': 'PercentLosers',
		'actives': 'MostActive'
	}


	var url = QuandlMultiSnapshot.makeUrl("/globalquotes_quandl/v3/xGlobalQuotes.json/GetTopMarketMovers?MarketMoverType=" + moverTypeCodeMap[moverType] + "&NumberOfMarketMovers=50&Exchanges=XNYS,XNAS,XASE,ARCX&_fields=Movers.Symbol,Movers.Last,Movers.ChangeFromPreviousClose");
	PortalCore.serverFetch(url, null, null, function (status, result) {
		if (status != 200) return;
		result = JSON.parse(result);
		var count = 0;
		var items = [];
		if (result.Movers) {
			for (var s = 0; s < result.Movers.length; s++) {
				if (count == limit) break;
				var item = result.Movers[s];
				if (item.Last < 5) continue;
				item.Previous = item.Last - item.ChangeFromPreviousClose;
				/*if (decliner && item.Previous <= item.Last) continue; //error
				else if (!decliner && item.Previous >= item.Last) continue; //error
				*/
				//delete item.ChangeFromPreviousClose;
				//setSectionData(section, item, decliner);
				item.PercentChange = item.ChangeFromPreviousClose / item.Previous * 100
				items.push(item);
				count++;
			}
			moversCB(null, {
				items: items,
				moverType: moverType,
				settings: settings
			}, extraParams);
		}
		//cb(flags);
		if (settings.Headlines) {
			for (var s = 0; s < items.length; s++) {
				var url2 = QuandlMultiSnapshot.makeUrl("/globalnews_quandl/xGlobalNews.json/GetTopSecuritySummaries?IdentifierType=Symbol&Identifier=" + items[s].Symbol + "&Count=1&_fields=Security.Symbol,HeadlineSummaries.Title,HeadlineSummaries.Date,HeadlineSummaries.Time,HeadlineSummaries.UTCOffset,HeadlineSummaries.Source,HeadlineSummaries.Url,HeadlineSummaries.Summary");
				(function (symbol) {
					PortalCore.serverFetch(url2, null, null, function (status, result) {
						if (status != 200) return;
						result = JSON.parse(result);
						if (!result.HeadlineSummaries) {
							/*setSectionHeadline(section, {
								Symbol: symbol
							}, decliner);*/
							return;
						}
						for (var s = 0; s < result.HeadlineSummaries.length; s++) {
							var item = result.HeadlineSummaries[s];
							item.Symbol = result.Security.Symbol;
							item.Subject = PortalCore.entityDecode(item.Title);
							delete item.Title;
							item.Date = new Date(item.Date + " " + item.Time);
							if (item.Time) item.Date.setMinutes(item.Date.getMinutes() - item.UTCOffset * 60 - item.Date.getTimezoneOffset());
							delete item.Time;
							newsCB(null, item, extraParams); //setSectionHeadline(section, item, decliner);
							//cb(Market.Flags.HEADLINE);
						}
					});
				}(items[s].Symbol));
			}
		}
	});

}

quandl.fetchRates = function (settings, cb, extraParams) {
	var ratesObject = {};

	if (!QuandlMultiSnapshot.setQuandlEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				quandl.fetchRates.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}

	var familyNames = {
		"Mortgage": "NationalOvernightAverages",
		"Treasury": "TreasuriesConstant",
		"Commercial": "FederalRates"
			//"LIBOR":"Libors"  <--too expensive to license, will need a solution to implement
	};

	var reverseFamilyNames = {};

	_.each(familyNames, function (value, key) {
		reverseFamilyNames[value] = key;
	});

	function fetchRatesCallback(family, items) {
		ratesObject[reverseFamilyNames[family]] = items;
		if (_.size(ratesObject) == _.size(familyNames)) {
			cb(null, {
				rates: ratesObject,
				id: settings.id
			}, extraParams);
		}

	}


	var rateNames = {
		"NationalOvernightAverage30YearFixed": "30 Year Fixed",
		"NationalOvernightAverage15YearFixed": "15 Year Fixed",
		"NationalOvernightAverage5YearAdjustable": "5 Year Adjustable",
		"TreasuryConstant1Month": "1 Month",
		"TreasuryConstant3Month": "3 Month",
		"TreasuryConstant6Month": "6 Month",
		"TreasuryConstant1Year": "1 Year",
		"TreasuryConstant10Year": "10 Year",
		"TreasuryConstant30Year": "30 Year",
		"Prime": "Prime",
		"FederalFunds": "Federal Funds",
		"DiscountWindowPrimaryCredit": "Discount Window Primary Credit",
		"LiborOvernite": "Overnight",
		"Libor1Week": "1 Week",
		"Libor1Month": "1 Month",
		"Libor3Month": "3 Month",
		"Libor6Month": "6 Month",
		"Libor1Year": "1 Year"
	};
	var start = new Date();
	var end = new Date();
	var oneWeekAgo = new Date();
	start.setDate(start.getDate() - 12);
	start.setHours(0, 0, 0, 0);
	end.setDate(end.getDate() - 5);
	end.setHours(0, 0, 0, 0);
	oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
	oneWeekAgo.setMinutes(oneWeekAgo.getMinutes() + oneWeekAgo.getTimezoneOffset() - 60 * 4.5);
	_.each(familyNames, function (family, ciqfamily) {
		(function (xifamily) {
			var items = {};
			var url = QuandlMultiSnapshot.makeUrl("/www_quandl/xRates.json/GetLatestRateFamily?RateFamilyType=" + xifamily + "&_fields=Type,Text");
			PortalCore.serverFetch(url, null, null, function (status, result) {
				if (status != 200) return;
				result = JSON.parse(result);
				var count = 0;
				if (!result || !result.length) return;
				for (var s = 0; s < result.length; s++) {
					var r = result[s];
					var item = {};
					item.Symbol = rateNames[r.Type];
					if (!item.Symbol) continue;
					item.Last = "N/A";
					var p = parseFloat(r.Text);
					if (!isNaN(p)) item.Last = p;
					//setSectionData(section[ciqfamily],item);
					items[item.Symbol] = item;
					count++;
				}
				//cb();
				var url2 = QuandlMultiSnapshot.makeUrl("/www_quandl/xRates.json/GetHistoricalRateFamily?RateFamilyType=" + xifamily + "&FromDate=" + PortalCore.mmddyyyy(start) + "&ToDate=" + PortalCore.mmddyyyy(end) + "&_fields=HistoricalInterestRate.Type,HistoricalInterestRate.Rates.Date,HistoricalInterestRate.Rates.Text");
				PortalCore.serverFetch(url2, null, null, function (status, result) {
					if (status != 200) return;
					result = JSON.parse(result);
					//var count=0;
					if (result.HistoricalInterestRate) {
						for (var s = 0; s < result.HistoricalInterestRate.length; s++) {
							var r = result.HistoricalInterestRate[s];
							//if(count==limit) break;
							var item = items[rateNames[r.Type]];
							if (!item) continue;
							item.Previous = "N/A";
							for (var c = 0; c < r.Rates.length; c++) {
								var p = parseFloat(r.Rates[c].Text);
								if (p && !isNaN(p)) {
									if (r.Rates[c].Date) {
										var dateParts = r.Rates[c].Date.split("/");
										var d = new Date(dateParts[2], dateParts[0] - 1, dateParts[1], 0, 0, 0, 0);
										if (d.getTime() <= oneWeekAgo.getTime()) item.Previous = p;
									}
								}
							}
							//setSectionData(section[ciqfamily], item);
							//count++;
						}
					}
					fetchRatesCallback(xifamily, items);
				});
			});
		}(family));
	});

}


quandl.fetchHistoricalRates = function (settings, cb, extraParams) {
	if (!QuandlMultiSnapshot.setQuandlEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				quandl.fetchHistoricalRates.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}

	if (!settings.familyName) {
		settings.familyName = "Mortgage";
	}

	var familyNames = {
		"Mortgage": "NationalOvernightAverages",
		"Treasury": "TreasuriesConstant",
		"Commercial": "FederalRates"
			//"LIBOR":"Libors"  <--too expensive to license, will need a solution to implement
	};

	/*var reverseFamilyNames = {};
	
	_.each(familyNames, function(value, key) {
		reverseFamilyNames[value] = key;
	});*/

	var rateNames = {
		"NationalOvernightAverage30YearFixed": "30 Year Fixed",
		"NationalOvernightAverage15YearFixed": "15 Year Fixed",
		"NationalOvernightAverage5YearAdjustable": "5 Year Adjustable",
		"TreasuryConstant1Month": "1 Month",
		"TreasuryConstant3Month": "3 Month",
		"TreasuryConstant6Month": "6 Month",
		"TreasuryConstant1Year": "1 Year",
		"TreasuryConstant10Year": "10 Year",
		"TreasuryConstant30Year": "30 Year",
		"Prime": "Prime",
		"FederalFunds": "Federal Funds",
		"DiscountWindowPrimaryCredit": "Discount Window Primary Credit",
		"LiborOvernite": "Overnight",
		"Libor1Week": "1 Week",
		"Libor1Month": "1 Month",
		"Libor3Month": "3 Month",
		"Libor6Month": "6 Month",
		"Libor1Year": "1 Year"
	};

	var end = settings.endDate ? settings.endDate : new Date();
	var start;
	if (settings.startDate) {
		start = settings.startDate;
	} else {
		var start = new Date();
		start.setDate(start.getDate() - 365);
	}

	var url2 = QuandlMultiSnapshot.makeUrl("/www_quandl/xRates.json/GetHistoricalRateFamily?RateFamilyType=" + familyNames[settings.familyName] + "&FromDate=" + PortalCore.mmddyyyy(start) + "&ToDate=" + PortalCore.mmddyyyy(end));
	PortalCore.serverFetch(url2, null, null, function (status, result) {
		if (status != 200) return;
		result = JSON.parse(result);
		var items = {};
		if (result.HistoricalInterestRate) {
			for (var s = 0; s < result.HistoricalInterestRate.length; s++) {
				var r = result.HistoricalInterestRate[s];
				//if(count==limit) break;
				if (!items[rateNames[r.Type]]) {
					items[rateNames[r.Type]] = [];
				}

				var item = items[rateNames[r.Type]];

				for (var c = 0; c < r.Rates.length; c++) {
					r.Rates[c].Close = r.Rates[c].Value * 100;
					r.Rates[c].Value = r.Rates[c].Close;
					item.push(r.Rates[c]);

					var dateParts = r.Rates[c].Date.split("/");
					var d = new Date(dateParts[2], dateParts[0] - 1, dateParts[1], 0, 0, 0, 0);
					r.Rates[c].DT = d;

				}
			}
		}
		cb(null, items, extraParams);
	});


}

quandl.sectorSymbolTransform = function (item) {
	var sectorNames = ["Materials", "Energy", "Financials", "Industrials", "Technology", "Cons Staples", "Utilities", "Health Care", "Cons Discretionary"];
	var symbols = ["XLB", "XLE", "XLF", "XLI", "XLK", "XLP", "XLU", "XLV", "XLY"];
	if (item == "*") {
		return symbols.join(",");
	} else if (isNaN(item)) {
		for (var x = 0; x < sectorNames.length; x++) {
			if (item == sectorNames[x]) return symbols[x];
			else if (item == symbols[x]) return sectorNames[x];
		}
	} else if (item >= 0 && item < sectorNames.length) {
		return {
			"name": sectorNames[item],
			"symbol": symbols[item]
		};
	}
	return "";
}

quandl.fetchSectorPerformance = function (settings, cb, extraParams) {
	if (!QuandlMultiSnapshot.setQuandlEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				quandl.fetchSectorPerformance.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}
	var sectorTickers = this.sectorSymbolTransform("*");

	var lasts = {}; //will need this later
	var url = QuandlMultiSnapshot.makeUrl("/superquotes_quandl/xSuperQuotes.json/GetQuotes?IdentifierType=Symbol&Identifiers=" + sectorTickers + "&_fields=Identifier,Last,PreviousClose,DateTime,PreviousCloseDate");
	PortalCore.serverFetch(url, null, null, function (status, result) {
		if (status != 200) cb("Error");
		result = JSON.parse(result);
		var count = 0;
		var items = {};
		for (var s = 0; s < result.length; s++) {
			var item = result[s];
			item.Previous = item.PreviousClose;
			delete item.PreviousClose;
			if (item.Identifier) item.Symbol = quandl.sectorSymbolTransform(item.Identifier);
			lasts[item.Symbol] = item.Last;
			delete item.Identifier;
			item.IsOpen = (item.DateTime.split(" ")[0] != item.PreviousCloseDate);
			delete item.PreviousCloseDate;
			delete item.DateTime;
			//setSectionData(section, item);
			items[item.Symbol] = item;
			count++;
		}
		//cb(null, items, extraParams);
		//cb(false);
		var url2 = QuandlMultiSnapshot.makeUrl("/globalquotes_quandl/v3/xGlobalQuotes.json/GetTopMarketMovers?MarketMoverType=MostActive&NumberOfMarketMovers=50&Exchanges=XNYS,XNAS,XASE,ARCX&_fields=Movers.Symbol,Movers.Last,Movers.ChangeFromPreviousClose");
		PortalCore.serverFetch(url2, null, null, function (status, result) {
			if (status != 200) return;
			result = JSON.parse(result);
			var items = {};
			var symbols = [];
			if (result.Movers) {
				for (var s = 0; s < result.Movers.length; s++) {
					var item = result.Movers[s];
					item.Previous = item.Last - item.ChangeFromPreviousClose;
					delete item.ChangeFromPreviousClose;
					symbols.push(item.Symbol);
					items[item.Symbol] = item;
				}
			}
			var url3 = QuandlMultiSnapshot.makeUrl("/factsetfundamentals_quandl/xFactSetFundamentals.json/GetLatestFundamentals?IdentifierType=Symbol&Identifiers=" + symbols.join(",") + "&FundamentalTypes=Industry&UpdatedSince=&_fields=Company.Symbol,Company.Sector,Company.Industry");
			(function (items) {
				PortalCore.serverFetch(url3, null, null, function (status, result) {
					if (status != 200) return;
					result = JSON.parse(result);

					function sectorMapping(company) {
						var sector = company.Sector;
						var industry = company.Industry;
						if (!sector) return "";
						var sectorNames = ["", "Materials", "Energy", "Financials", "Industrials", "Technology", "Cons Staples", "Utilities", "Health Care", "Cons Discretionary"];
						var industryToNameMap = {
							"OilfieldServicesOrEquipment": "Energy",
							"OilAndGasPipelines": "Energy",
							"MedicalDistributors": "Health Care"
						};
						if (industryToNameMap[industry]) return industryToNameMap[industry];
						var sectorToNameMap = {
							"NonEnergyMinerals": "Materials",
							"ProducerManufacturing": "Industrials",
							"ElectronicTechnology": "Technology",
							"ConsumerDurables": "Cons Discretionary",
							"EnergyMinerals": "Energy",
							"ProcessIndustries": "Industrials",
							"HealthTechnology": "Health Care",
							"ConsumerNonDurables": "Cons Staples",
							"IndustrialServices": "Industrials",
							"CommercialServices": "Industrials",
							"DistributionServices": "Technology",
							"TechnologyServices": "Technology",
							"HealthServices": "Health Care",
							"ConsumerServices": "Cons Discretionary",
							"RetailTrade": "Cons Discretionary",
							"Transportation": "Industrials",
							"Utilities": "Utilities",
							"Finance": "Financials",
							"Communications": "Technology",
						};
						if (sectorToNameMap[sector]) return sectorToNameMap[sector];
						return "";
					}
					for (var s = 0; s < result.length; s++) {
						if (!result[s].Company || !result[s].Company.Symbol) continue;
						var symbol = result[s].Company.Symbol;
						var sector = sectorMapping(result[s].Company);
						/*for (var s2 in section) {
							if (section[s2].Movers[mLimit - 1].Symbol == null && section[s2].Data.Symbol == sector) {
								//setSectionData(section[s2].Movers, items[symbol]);
								break;
							}
						}*/
					}
					//cb(true);
				});
			}(items));
		});
		var url4 = QuandlMultiSnapshot.makeUrl("/factsetfundamentals_quandl/xFactSetFundamentals.json/GetLatestFundamentals?IdentifierType=Symbol&Identifiers=" + sectorTickers + "&FundamentalTypes=LastClose,PercentPriceChange1Week,PercentPriceChange4Weeks,PercentPriceChange13Weeks,PercentPriceChange26Weeks,PercentPriceChange52Weeks&UpdatedSince=&_fields=Company.Symbol,FundamentalsSets.Fundamentals.Type,FundamentalsSets.Fundamentals.Value");
		PortalCore.serverFetch(url4, null, null, function (status, result) {
			if (status != 200) return;
			result = JSON.parse(result);

			function set(item, field, value) {
				if (field == "last") {
					if (item.Last) item.Previous *= Number(value) / item.Last;
					item.Last = Number(value);
				} else if (field == "change") {
					if (!item.Last) item.Last = Number(value) + 100;
					item.Previous = 100 * item.Last / (Number(value) + 100);
				} else if (field == "previous") {
					item.Previous = Number(value);
				}
			}
			for (var s = 0; s < result.length; s++) {
				if (result[s].Company) {
					var symbol = quandl.sectorSymbolTransform(result[s].Company.Symbol);
					var fs = result[s].FundamentalsSets;
					if (!fs) continue;
					items[symbol].historicals = {};
					for (var f = 0; f < fs.length; f++) {
						var fund = fs[f].Fundamentals;
						if (!fund) continue;
						for (var d = 0; d < fund.length; d++) {
							if (fund[d].Type == "PercentPriceChange52Weeks") {
								items[symbol].historicals['52W'] = fund[d].Value;
							} else if (fund[d].Type == "PercentPriceChange26Weeks") {
								items[symbol].historicals['26W'] = fund[d].Value;
							} else if (fund[d].Type == "PercentPriceChange13Weeks") {
								items[symbol].historicals['13W'] = fund[d].Value;
							} else if (fund[d].Type == "PercentPriceChange4Weeks") {
								items[symbol].historicals['4W'] = fund[d].Value;
							} else if (fund[d].Type == "PercentPriceChange1Week") {
								items[symbol].historicals['1W'] = fund[d].Value;
							} else if (fund[d].Type == "LastClose") {
								items[symbol].historicals['Last'] = fund[d].Value;
							}
						}
					}
				}
			}
			cb(null, items, extraParams);
			//cb(true);
		});
	});
}

quandl.requestToQuandlFundamentalsMap = {
	Previous: "LastClose",
	PercentChange: "PercentPriceChange52Weeks,PercentPriceChange26Weeks,PercentPriceChange13Weeks,PercentPriceChange4Weeks,PercentPriceChange1Week",
	VolumePrevious: "LastVolume",
	FiftyTwoWeekHigh: "HighPriceLast52Weeks",
	FiftyTwoWeekLow: "LowPriceLast52Weeks",
	MarketCap: "MarketCapitalization",
	ShortInterest: "ShortInterestShares",
	//PERatio: "PERatio",
	//DividendRate: "DividendRate",
	//DividendYield: null,
	SummaryDescription: "BusinessDescription",
	Description: "LongBusinessDescription",
	//Address1: "Address1",
	//Address2: "Address2",
	//City: "City",
	//State: "State",
	Zip: "ZipCode",
	Country: "CorporateLocation",
	Phone: "PhoneNumber",
	Email: "InvestorRelationsEmail",
	//Website: "Website",
	//CEO: "CEO",
	Employees: "NumberOfEmployees",
	Sector: "SectorName",
	Industry: "IndustryName",
};

quandl.requestToQuandlFundFundamentalsMap = {
	Description: "InvestmentSummary",
	Address: "RegistrationCompanyAddress",
	Phone: "RegistrationCompanyPhone",
	Website: "RegistrationCompanyWebsite",
	Manager: "FundManagersProfile",
	//FundObjective: "FundObjective",
	//NetAssets: "NetAssets",
	ExpenseRatio: "ProspectusNetExpenseRatio",
	Yield: "TrailingTwelveMonthYield",
	WeightingTopTen: "WeightingTopTenHoldings",
	Turnover: "TurnoverRatio",
	//InitialInvestment: "InitialInvestment",
	Closed: "ClosedToNewInvestors",
	Family: "FundFamilyName",
	Class: "ShareClass",
	Category: "InvestmentStyle",
	Holdings: "FundHoldings",
	Allocation: "USStockNetAllocation,USStockLongAllocation,USStockShortAllocation,NonUSStockNetAllocation,NonUSStockLongAllocation,NonUSStockShortAllocation,USBondNetAllocation,USBondLongAllocation,USBondShortAllocation,NonUSBondNetAllocation,NonUSBondLongAllocation,NonUSBondShortAllocation,PreferredNetAllocation,PreferredLongAllocation,PreferredShortAllocation,ConvertibleNetAllocation,ConvertibleLongAllocation,ConvertibleShortAllocation,CashNetAllocation,CashLongAllocation,CashShortAllocation,OtherNetAllocation,OtherLongAllocation,OtherShortAllocation",
	SectorWeighting: "BasicMaterials,ConsumerCyclical,FinancialServices,RealEstate,ConsumerDefensive,Healthcare,Utilities,CommunicationServices,Energy,Industrials,Technology,GovernmentNet,MunicipalNet,CorporateNet,SecuritizedNet,CashAndEquivalentsNet,DerivativeNet",
	RegionBreakdown: "RegionUnitedStatesRescaledLong,RegionCanadaRescaledLong,RegionLatinAmericaRescaledLong,RegionUnitedKingdomRescaledLong,RegionEurozoneRescaledLong,RegionEuropeExEuroRescaledLong,RegionEuropeEmergingRescaledLong,RegionAfricaRescaledLong,RegionMiddleEastRescaledLong,RegionJapanRescaledLong,RegionAustralasiaRescaledLong,RegionAsiaDevelopedRescaledLong,RegionAsiaEmergingRescaledLong"
};

var XF = {};
var XFF = {};

quandl.processQuandlFundamentals = function (stock, mappedFundamentals, unmappedFundamentals, dfd) {
	require(['modules/quandl-fundamentallist'], function () {
		if (stock) {
			_.each(QuandlFundamentals.FundamentalDescriptions, function (value) {
				XF[value.Type] = value;
			});
		} else {
			_.each(QuandlFundFundamentals.FundamentalDescriptions, function (value) {
				XFF[value.Type] = value;
			});
		}
		var F = {};
		if (stock) F = XF;
		else F = XFF;
		var moreFundamentals = _.intersection(_.keys(F), unmappedFundamentals);
		mappedFundamentals = _.concat(mappedFundamentals, moreFundamentals);
		//return _.join(mappedFundamentals);
		dfd.resolve(_.join(mappedFundamentals));
	});
}

quandl.buildFundamentalList = function (stock, data, dfd) {
	var fundamentals;
	if (stock) fundamentals = this.requestToQuandlFundamentalsMap;
	else fundamentals = this.requestToQuandlFundFundamentalsMap;

	var data2 = {};

	// special cases
	_.each(data, function (value, key) {
		if (_.isObject(value)) {
			switch (value.Type) {
			case 'Ratio':
			case 'Range':
				data2[value.Value1] = key;
				data2[value.Value2] = key;
			}
		} else if (_.isString(value)) {
			data2[key] = value;
		}
	});

	var dataKeys = _.keys(data);
	var mappedFundamentals = _.intersection(_.keys(fundamentals), dataKeys);
	var unmappedFundamentals = _.filter(dataKeys, function (value) {
		return !_.includes(mappedFundamentals, value);
	});

	mappedFundamentals = _.values(_.pick(fundamentals, mappedFundamentals));

	if (unmappedFundamentals.length) {
		this.processQuandlFundamentals(stock, mappedFundamentals, unmappedFundamentals, dfd);
	} else {
		dfd.resolve(_.join(mappedFundamentals));
	}


}

quandl.isMutual = function (symbol) {
	if (symbol.length < 5 || symbol.length > 6) return false;
	if (symbol[symbol.length - 1] != "X") return false;
	for (var j = 0; j < symbol.length; j++) {
		if (symbol[j] < 'A' || symbol[j] > 'Z') return false;
	}
	return true;
}

quandl.fetchStockFundamentals = function (symbol, fundamentalList, item, cb, extraParams) {
	if (!QuandlMultiSnapshot.setQuandlEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				quandl.fetchStockFundamentals.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}
	if (!item) item = {};
	var dfd = new $.Deferred();
	fundamentalList = fundamentalList.stock;
	this.buildFundamentalList(true, fundamentalList, dfd);

	$.when(dfd).done(function (joinedfundamentalList) {
		var url4 = QuandlMultiSnapshot.makeUrl("/factsetfundamentals_quandl/xFactSetFundamentals.json/GetLatestFundamentals?IdentifierType=Symbol&Identifiers=" + encodeURIComponent(symbol) + "&FundamentalTypes=" + joinedfundamentalList + "&UpdatedSince=&_fields=FundamentalsSets.Fundamentals.Type,FundamentalsSets.Fundamentals.Value,FundamentalsSets.Fundamentals.Unit");
		PortalCore.serverFetch(url4, null, null, function (status, result) {
			result = JSON.parse(result);

			function set(item, field, value) {
				if (field == "last") {
					if (item.Last) item.Previous *= Number(value) / item.Last;
					item.Last = Number(value);
				} else if (field == "change") {
					if (!item.Last) item.Last = Number(value) + 100;
					item.Previous = 100 * item.Last / (Number(value) + 100);
				} else if (field == "previous") {
					item.Previous = Number(value);
				}
			}
			var historicals = {
				"52W": {},
				"26W": {},
				"13W": {},
				"4W": {},
				"1W": {},
				"1D": {}
			};
			set(historicals["1D"], "previous", item.Previous);
			for (var s = 0; s < result.length; s++) {
				var fs = result[s].FundamentalsSets;
				if (!fs) continue;
				for (var f = 0; f < fs.length; f++) {
					var fund = fs[f].Fundamentals;
					if (!fund) continue;
					for (var d = 0; d < fund.length; d++) {
						if (fund[d].Unit == "Trillions") fund[d].Value *= 1000000000000;
						else if (fund[d].Unit == "Billions") fund[d].Value *= 1000000000;
						else if (fund[d].Unit == "Millions") fund[d].Value *= 1000000;
						else if (fund[d].Unit == "Thousands") fund[d].Value *= 1000;
						else if (fund[d].Unit == "Hundreds") fund[d].Value *= 100;
						if (!isNaN(parseFloat(fund[d].Value)) && isFinite(fund[d].Value)) {
							fund[d].Value = Math.abs(fund[d].Value).toFixed(2);
							fund[d].Value = PortalCore.commaInt(fund[d].Value);
						}
						if (fund[d].Unit == 'Percent') {
							fund[d].Value += '%';
						}

						//make sure we get everything in case there is a mapping
						item[fund[d].Type] = fund[d].Value;

						if (fund[d].Type == "PercentPriceChange52Weeks") {
							set(historicals["52W"], "change", fund[d].Value);
						} else if (fund[d].Type == "PercentPriceChange26Weeks") {
							set(historicals["26W"], "change", fund[d].Value);
						} else if (fund[d].Type == "PercentPriceChange13Weeks") {
							set(historicals["13W"], "change", fund[d].Value);
						} else if (fund[d].Type == "PercentPriceChange4Weeks") {
							set(historicals["4W"], "change", fund[d].Value);
						} else if (fund[d].Type == "PercentPriceChange1Week") {
							set(historicals["1W"], "change", fund[d].Value);
						} else if (fund[d].Type == "LastClose") {
							/* removed - works well for splits but resets at midnight - too early
							set(historicals["1D"],"previous",fund[d].Value);
							item.Previous=fund[d].Value;  //override in case of split  */
							for (var h in historicals) {
								set(historicals[h], "last", fund[d].Value);
								historicals[h].Symbol = symbol;
							}

						} else if (fund[d].Type == "LowPriceLast52Weeks") {
							if (!item.FiftyTwoWeekLow) item.FiftyTwoWeekLow = fund[d].Value;
							else if (!fund[d].Value || fund[d].Value < item.FiftyTwoWeekLow) item.FiftyTwoWeekLow = fund[d].Value;
						} else if (fund[d].Type == "HighPriceLast52Weeks") {
							if (!item.FiftyTwoWeekHigh) item.FiftyTwoWeekHigh = fund[d].Value;
							else if (!fund[d].Value || fund[d].Value > item.FiftyTwoWeekHigh) item.FiftyTwoWeekHigh = fund[d].Value;
						} else if (fund[d].Type == "MarketCapitalization") {
							item.MarketCap = fund[d].Value;
						} else if (fund[d].Type == "LastVolume") {
							item.VolumePrevious = 100 * fund[d].Value;
							if (item.VolumePrevious) {
								item.VolumeChange = Number(item.Volume) - Number(item.VolumePrevious);
								item.VolumePercentChange = 100 * (Number(item.Volume) / Number(item.VolumePrevious) - 1);
							}
							if (isNaN(item.VolumePercentChange)) item.VolumePercentChange = null;
						} else if (fund[d].Type == "ShortInterestShares") {
							item.ShortInterest = fund[d].Value;
						} else if (fund[d].Type == "DividendRate") {
							if (fund[d].Value != "") {
								item.DividendRate = fund[d].Value;
								item.DividendYield = 100 * item.DividendRate / item.Last;
							} else {
								item.DividendRate = "N/A";
								item.DividendYield = "N/A";
							}
						} else {
							var key = _.findKey(quandl.requestToQuandlFundamentalsMap, _.partial(_.isEqual, fund[d].Type));
							if (typeof key !== 'undefined') {
								item[key] = fund[d].Value;
							} else {
								item[fund[d].Type] = fund[d].Value;
							}
						}
					}
					/*_.each(item, function(value, key) {
						
					})*/
				}
				if (item.Last) {
					for (var h in historicals) {
						historicals[h].Last = item.Last;
						historicals[h].Change = historicals[h].Last - historicals[h].Previous;
						historicals[h].PercentChange = 100 * historicals[h].Change / historicals[h].Previous;
					}
				}
				item.historicals = historicals;

			}
			cb(null, item, extraParams);
		});
	});
}

quandl.fetchFundFundamentals = function (symbol, instrumentType, fundamentalList, item, cb, extraParams) {
	if (!QuandlMultiSnapshot.setQuandlEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				quandl.fetchFundFundamentals.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}
	if (!item) item = {};
	if (instrumentType == "Fund" || instrumentType == "ExchangeTradedFund") {
		item.isMutual = isMutual(symbol);
		item.isETF = (instrumentType == "ExchangeTradedFund");
		if (!item.isMutual && !item.isETF) item.isCEF = true;
		if (item.isETF || item.isCEF) fList = fundamentalList.etf;
		else fList = fundamentalList.fund;

		var dfd = new $.Deferred();
		this.buildFundamentalList(false, fList, dfd);

		$.when(dfd).done(function (joinedfundamentalList) {

			var url3 = QuandlMultiSnapshot.makeUrl("/fundfundamentals_quandl/xFundFundamentals.json/GetFundFundamentalList?IdentifierType=Symbol&Identifier=" + encodeURIComponent(symbol) + "&FundamentalTypes=" + joinedfundamentalList + "&UpdatedSince=&_fields=Fundamentals.Type,Fundamentals.Value");

			PortalCore.serverFetch(url3, null, null, function (status, result) {
				result = JSON.parse(result);
				var fund = result.Fundamentals;
				if (fund) {
					for (var d = 0; d < fund.length; d++) {
						item[fund[d].Type] = fund[d].Value;
						if (fund[d].Type == "FundManagersProfile") {
							var xmlDom = PortalCore.xmlToDom(fund[d].Value);
							if (xmlDom.children.length) xmlDom = xmlDom.children[0];
							item.Manager = "";
							for (var p = 0; p < xmlDom.children.length; p++) {
								if (item.Manager) item.Manager += ", ";
								for (var m = 0; m < xmlDom.children[p].children.length; m++) {
									if (xmlDom.children[p].children[m].tagName == "FirstName") item.Manager += xmlDom.children[p].children[m].textContent + " ";
									//if(xmlDom.children[p].tagName="MiddleName") item.Manager+=xmlDom.children[p].middlename.textContent+" ";
									if (xmlDom.children[p].children[m].tagName == "LastName") item.Manager += xmlDom.children[p].children[m].textContent;
								}
							}
						} else if (fund[d].Type == "FundHoldings") {
							var xmlDom = PortalCore.xmlToDom(fund[d].Value);
							if (xmlDom.children.length) xmlDom = xmlDom.children[0];
							item.Holdings = [];
							for (var p = 0; p < xmlDom.children.length; p++) {
								var holding = {};
								for (var m = 0; m < xmlDom.children[p].children.length; m++) {
									holding[xmlDom.children[p].children[m].tagName] = xmlDom.children[p].children[m].textContent;
								}
								item.Holdings.push(holding);
							}
						} else if (fund[d].Type.indexOf("Allocation") > 5) {
							if (!item.AssetAllocation) item.AssetAllocation = {};
							var w = fund[d].Type.split("Net");
							if (w.length == 2) {
								w[0] = w[0].replace(/(.)([A-Z])([a-z])/g, "$1 $2$3").replace(/(.)([a-z])([A-Z])(.)/g, "$1$2 $3$4");
								if (!item.AssetAllocation[w[0]]) item.AssetAllocation[w[0]] = {};
								item.AssetAllocation[w[0]].Net = fund[d].Value;
							}
							w = fund[d].Type.split("Long");
							if (w.length == 2) {
								w[0] = w[0].replace(/(.)([A-Z])([a-z])/g, "$1 $2$3").replace(/(.)([a-z])([A-Z])(.)/g, "$1$2 $3$4");
								if (!item.AssetAllocation[w[0]]) item.AssetAllocation[w[0]] = {};
								item.AssetAllocation[w[0]].Long = fund[d].Value;
							}
							w = fund[d].Type.split("Short");
							if (w.length == 2) {
								w[0] = w[0].replace(/(.)([A-Z])([a-z])/g, "$1 $2$3").replace(/(.)([a-z])([A-Z])(.)/g, "$1$2 $3$4");
								if (!item.AssetAllocation[w[0]]) item.AssetAllocation[w[0]] = {};
								item.AssetAllocation[w[0]].Short = fund[d].Value;
							}
						} else if (",BasicMaterials,ConsumerCyclical,FinancialServices,RealEstate,ConsumerDefensive,Healthcare,Utilities,CommunicationServices,Energy,Industrials,Technology,GovernmentNet,MunicipalNet,CorporateNet,SecuritizedNet,CashAndEquivalentsNet,DerivativeNet,".indexOf("," + fund[d].Type + ",") > -1) {
							if (!item.SectorWeighting) item.SectorWeighting = {
								Stock: {},
								Bond: {}
							};
							item.SectorWeighting[fund[d].Type.indexOf("Net") > 0 ? "Bond" : "Stock"][fund[d].Type.replace(/(.)([A-Z])/g, "$1 $2").replace(" Net", "")] = fund[d].Value;
						} else if (",RegionUnitedStatesRescaledLong,RegionCanadaRescaledLong,RegionLatinAmericaRescaledLong,RegionUnitedKingdomRescaledLong,RegionEurozoneRescaledLong,RegionEuropeExEuroRescaledLong,RegionEuropeEmergingRescaledLong,RegionAfricaRescaledLong,RegionMiddleEastRescaledLong,RegionJapanRescaledLong,RegionAustralasiaRescaledLong,RegionAsiaDevelopedRescaledLong,RegionAsiaEmergingRescaledLong,".indexOf("," + fund[d].Type + ",") > -1) {
							if (!item.RegionBreakdown) item.RegionBreakdown = {};
							item.RegionBreakdown[fund[d].Type.substring(6, fund[d].Type.length - 12).replace(/(.)([A-Z])/g, "$1 $2")] = fund[d].Value;
						} else if (fund[d].Type == "RegistrationCompanyAddress") {
							item.Address1 = fund[d].Value;
							if (item.Address1) item.Address1 = item.Address1.split("\r\n");
							if (item.Address1[item.Address1.length - 1].indexOf(",") > 0) item.Address1.pop();
							item.Address1 = item.Address1.join(", ");
						} else if (fund[d].Type == "RegistrationCompanyWebsite") {
							item.Website = fund[d].Value;
							if (item.Website.indexOf("http:") != 0) item.Website = "http://" + item.Website;
						} else {
							var key = _.findKey(requestToQuandlFundFundamentalsMap, _.partial(_.isEqual, fund[d].Type));
							if (typeof key !== 'undefined') {
								item[key] = fund[d].Value;
							} else {
								item[fund[d].Type] = fund[d].Value;
							}
						}
					}
				}
				if (item.isMutual) cb(null, item, extraParams);
				else fetchStockFundamentals(symbol, fundamentalList, item, cb, extraParams);
			});
		});
	}

}

quandl.fetchDetailedQuote = function (symbol, fundamentalList, quoteCB, fundamentalsCB, extraParams) {
	if (symbol == "") return;
	if (!QuandlMultiSnapshot.setQuandlEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				quandl.fetchDetailedQuote.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}

	if (symbol.length == 7 && symbol.indexOf("^") == 0) {
		this.getQuotes([symbol], null, quoteCB, null, true, extraParams);
		return;
	} else if (symbol.indexOf(".IND") > 0 || symbol.indexOf("^") == 0) {
		this.getQuotes([symbol], null, quoteCB, null, true, extraParams);
		return;
	}

	var url = QuandlMultiSnapshot.makeUrl("/superquotes_quandl/xSuperQuotes.json/GetQuote?IdentifierType=Symbol&Identifier=" + encodeURIComponent(symbol) + "&_fields=Name,Identifier,DateTime,UTCOffset,Last,Volume,PreviousClose,Change,PercentChange,High,Low,InstrumentType");
	PortalCore.serverFetch(url, null, null, function (status, result) {
		if (status != 200) return;
		result = JSON.parse(result);
		var item = {};
		item.Symbol = symbol;
		if (!result.Identifier) return;
		item.Last = result.Last;
		//Note on these next 5 values: they do not reflect splits which happen today.
		//The fundamentals reflect the splits but they do daily reset too early.
		//Maybe Quandl can take a look.
		item.Previous = result.PreviousClose;
		item.Change = result.Change;
		item.PercentChange = result.PercentChange;
		item.FiftyTwoWeekHigh = result.High;
		item.FiftyTwoWeekLow = result.Low;
		item.Volume = result.Volume;
		item.Name = result.Name;
		if (!item.Name) item.Name = "[No Description Found]";
		if (!result.DateTime) {
			result.DateTime = result.Date + ' ' + result.Time;
		}
		if (result.DateTime) {
			item.Date = new Date(result.DateTime.replace(/ /, "T") + "Z");
			if (result.InstrumentType == "Fund" && (item.Date.getHours() * 60 + item.Date.getTimezoneOffset()) % 1440 === 0) //12:00 am reported
				item.Date.setHours(item.Date.getHours() + 20);
			item.Date.setMinutes(item.Date.getMinutes() - PortalCore.getETUTCOffset(item.Date));
			if (isNaN(item.Date)) { //IE8 nonsense
				datePart = result.DateTime.split(" ")[0].split("-");
				timePart = result.DateTime.split(" ")[1].split(":");
				item.Date = new Date(datePart[0], datePart[1] - 1, datePart[2], timePart[0], timePart[1], 0, 0);
				if (result.InstrumentType && result.InstrumentType == "Fund" && item.Date.getHours() === 0) //12:00 am reported
					item.Date.setHours(20);
				item.Date.setMinutes(item.Date.getMinutes() - PortalCore.getETUTCOffset(item.Date) - item.Date.getTimezoneOffset());
			}
		} else if (symbol.length == 6) {
			this.getQuotes([symbol], null, quoteCB, null, true, extraParams);
			return;
		}

		if (result.InstrumentType == "Fund" && isMutual(symbol)) {
			var endDate = new Date();
			var startDate = (endDate.getMonth() + 1) + "/" + endDate.getDate() + "/" + (endDate.getFullYear() - 1);
			endDate.setDate(endDate.getDate() + 1);
			endDate = (endDate.getMonth() + 1) + "/" + endDate.getDate() + "/" + endDate.getFullYear();
			item.FiftyTwoWeekHigh = item.FiftyTwoWeekLow = item.Last;
			var url2 = QuandlMultiSnapshot.makeUrl("/www_quandl/xglobalhistorical.json/GetGlobalHistoricalQuotesRange?IdentifierType=Symbol&_fields=GlobalQuotes.Last&Identifier=" + encodeURIComponent(symbol) + "&StartDate=" + encodeURIComponent(startDate) + "&EndDate=" + encodeURIComponent(endDate) + "&AdjustmentMethod=None");
			PortalCore.serverFetch(url2, null, null, function (status, result) {
				if (status != 200) return;
				result = JSON.parse(result);
				if (result && result.GlobalQuotes && result.GlobalQuotes.length) {
					for (var l = 0; l < result.GlobalQuotes.length; l++) {
						var last = result.GlobalQuotes[l].Last;
						item.FiftyTwoWeekHigh = Math.max(last, item.FiftyTwoWeekHigh ? item.FiftyTwoWeekHigh : last);
						item.FiftyTwoWeekLow = Math.min(last, item.FiftyTwoWeekLow ? item.FiftyTwoWeekLow : last);
					}
				}
				quoteCB(null, item, extraParams);
			});
		} else {
			quoteCB(null, item, extraParams);
		}

		if (fundamentalList) {
			if (fundamentalList.fund && (result.InstrumentType == "Fund" || result.InstrumentType == "ExchangeTradedFund")) quandl.fetchFundFundamentals(symbol, result.InstrumentType, fundamentalList, item, fundamentalsCB, extraParams);
			else if (fundamentalList.stock && result.InstrumentType != "Fund" && result.InstrumentType != "ExchangeTradedFund") quandl.fetchStockFundamentals(symbol, fundamentalList, item, fundamentalsCB, extraParams);
		}
	});
}

quandl.fetchFinancialStatementsv2 = function (settings, cb, extraParams) {
	if (!QuandlMultiSnapshot.setQuandlEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				quandl.fetchFinancialStatementsv2.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}
	var terms;
	if (settings.terms) terms = settings.terms; //'Quarterly', 'Annual', 'SemiAnnual', TTM'
	else {
		terms = ['Annual', 'Quarterly'];
		settings.terms = terms;
	}

	_.each(terms, function (term) {
		var termSettings = _.clone(settings);
		termSettings.term = term;
		quandl.fetchFinancialStatementsByTerm(termSettings, cb, extraParams);
	});
}

quandl.fetchFinancialStatementsByTerm = function (settings, cb, extraParams) {
	if (needsEncryption && !QuandlMultiSnapshot.setQuandlEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				quandl.fetchFinancialStatementsByTerm.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}
	var lineTypeToFieldNameMap = {
		"CashShortTermInvestments": "Csh_Csh_Equ",
		"ShortTermReceivables": "Rec",
		"InvestmentSecurities": "Inv_Sec",
		"SecuritiesInCustody": "Sec_Cust",
		"Inventories": "Inv",
		"OtherCurrentAssets": "Oth_Cur_Ass",
		"TotalCurrentAssets": "Tot_Cur_Ass",
		"NetPropertyPlantEquipment": "Net_Fix_Ass",
		"TotalInvestmentsAndAdvances": "Tot_Inv_Adv",
		"LongTermNoteReceivable": "Lng_Trm_Note_Rec",
		"IntangibleAssets": "Intang",
		"TotalCash": "Csh_Csh_Equ",
		"PremiumBalanceReceivables": "Prem_Bal_Rec",
		"InvestmentInUnconsolidatedAffiliates": "Inv_Uncon_Aff",
		"OtherAssets": "Oth_Non_Cur_Ass",
		"TotalCashDueFromBanks": "Tot_Cash_Bnk",
		"TotalInvestmentsBanks": "Tot_Inv_Bnk",
		"NetLoans": "Net_Loans",
		"CustomerLiabilityOnAcceptances": "Cust_Liab_Accept",
		"RealEstateAssets": "Real_Est_Ass",
		"InterestReceivables": "Int_Rec",
		"OtherIntangibleAssets": "Oth_Intang",
		"InsurancePolicyLiabilitiesInsurance": "Ins_Pol_Liab_Ins",
		"TotalDeposits": "Tot_Dep",
		"TotalDebt": "Tot_Debt",
		"ShortTermDebt": "Sht_Trm_Debt",
		"AccountsPayable": "Acc_Pay",
		"IncomeTaxPayable": "",
		"OtherCurrentLiabilities": "Oth_Cur_Liab",
		"TotalCurrentLiabilities": "Tot_Cur_Liab",
		"LongTermDebt": "Lng_Trm_Debt",
		"ProvisionForRisksCharges": "Prov_Risk_Chg",
		"DeferredTaxLiabilities": "Def_Inc_Tax_Liab",
		"OtherLiabilities": "Oth_Non_Cur_Liab",
		"NonEquityReserves": "Non_Equ_Res",
		"PreferredStockCarryingValue": "Prf_Stk_Carry_Val",
		"TotalCommonEquity": "Com_Equ",
		"TotalShareholdersEquity": "Tot_Stk_Equ",
		"AccumulatedMinorityInterest": "Min_Int_Equ",
		"TotalEquity": "Tot_Equ",
		"TotalLiabilitiesStockholdersEquity": "Tot_Liab_Stk_Equ",
		"BookValuePerShare": "Bk_Val_Per_Sh",
		"TangibleBookValuePerShare": "Tang_Bk_Val_Per_Sh",
		"Tier1Capital": "Tier1_Cap",
		"Tier2Capital": "Tier2_Cap",
		"SalesOrRevenue": "Sls_Rev",
		"InterestIncome": "Int_Inc",
		"CostOfGoodsSold": "Cost_Gds_Sld",
		"TotalInterestExpense": "Int_Exp",
		"LossesClaimsReserves": "Loss_Clm_Res",
		"GrossIncome": "Grs_Inc",
		"EBITOperatingIncome": "EBIT_OI",
		"NetInterestIncome": "Net_OI",
		"LoanLossProvision": "LLP",
		"NetInterestIncomeAfterLoanLossProvision": "NII_Aft_LLP",
		"OperatingIncomeBeforeInterestExpense": "OI_Bef_IE",
		"InterestExpense": "IE",
		"OperatingIncomeAfterInterestExpense": "OI_Aft_IE",
		"NonInterestIncome": "Non_Int_Inc",
		"NonInterestExpense": "Non_Int_Exp",
		"TotalExpenses": "Tot_Exp",
		"OperatingIncome": "OI",
		"NonOperatingIncomeExpense": "Non_Oper_Inc_Exp",
		"ReservesChange": "Res_Chg",
		"UnusualExpense": "Un_Exp",
		"PretaxIncome": "Ptx_Inc",
		"IncomeTaxes": "Inc_Tax",
		"EquityInEarningsOfAffiliatesIncome": "Equ_Earn_Aff_Inc",
		"OtherAfterTaxAdjustments": "Oth_Aft_Tax_Adj",
		"ConsolidatedNetIncome": "Cons_New_Inc",
		"MinorityInterestExpense": "Min_Int_Exp",
		"NetIncomeContinuingOperations": "Net_Inc_Cont_Oper",
		"PreferredDividends": "Pref_Div",
		"NetIncomeAvailableToCommonBasic": "Net_Inc_Avail_Comm_Bas",
		"EPSDilutedBeforeUnusualExpense": "EPS_Dil_Bef_Un_Exp",
		"EPSBasicBeforeExtraordinaries": "EPS_Basic_Bef_Extra",
		"EPSFullyDiluted": "EPS_Dil",
		"EBITDA": "EBITDA",
		"OrdinaryIncome": "Ord_Inc",
		"StockOptionCompensationExpense": "Stk_Opt_Comp_Exp",
		"OperatingLeaseExpense": "Oper_Lease_Exp",
		"ForeignCurrencyAdjustment": "Fgn_Curr_Adj",
		"NetIncomeCashFlow": "Net_Inc",
		"DepreciationDepletionAmortizationCashFlow": "Dep_Amort",
		"DeferredTaxesInvestmentTaxCredit": "Def_Tax",
		"OtherFunds": "Oth_Fds",
		"FundsFromOperations": "Fds_Oper",
		"ExtraordinaryItem": "ExtraOrd",
		"ChangesInWorkingCapital": "Working_Cap",
		"NetOperatingCashFlow": "Operating_Total",
		"CapitalExpenditures": "Cap_Exp",
		"NetAssetsfromAcquisitions": "Aquisitions",
		"SaleOfFixedAssetsBusinesses": "Sale_Prop_Plt_Equ",
		"PurchaseOrSaleOfInvestments": "Investments",
		"IncreaseInLoans": "Inc_Loans",
		"DecreaseInLoans": "Dec_Loans",
		"FederalHomeLoanAdvancesChange": "FHL_Adv_Chg",
		"OtherUses": "Other_Uses",
		"OtherSources": "Other_Srcs",
		"NetInvestingCashFlow": "Investing_Total",
		"CashDividendsPaid": "Div_Paid",
		"ChangeInCapitalStock": "Chg_Stock",
		"IssuanceOrReductionOfDebtNet": "Debt_Net",
		"OtherFinancingActivity": "Financing_Other",
		"NetFinancingCashFlow": "Financing_Total",
		"ExchangeRateEffect": "Chg_Eff_Exch_Rate",
		"MiscellaneousFunds": "Misc_Fds",
		"NetChangeInCash": "Chg_Csh_Csh_Equ",
		"FreeCashFlow": "Free_Csh_Flw",
		"DeferredTaxAssets": '',
		"TotalAssets": '',
		"SellingGeneralAdministrativeExpenses": '',
		"SellingGeneralAdministrativeExpensesAndOther": '',
		"OtherOperatingExpense": '',
		"TotalLiabilities": ''
	}

	var fundamentalTypes = _.join(_.keys(lineTypeToFieldNameMap));
	var endDate = new Date();
	if (!settings.number) settings.number = 6;

	//var term = settings.term;

	var startDate = new Date();

	var term = settings.term;

	switch (term) {
	case 'Annual':
	case 'TTM':
		startDate.setYear(startDate.getFullYear() - Math.min(5, settings.number));
		break;
	case 'SemiAnnual':
		startDate.setMonth(startDate.getMonth() - (Math.min(10, settings.number) * 6 + 1), 0);
		break;
	case 'Quarterly':
		startDate.setMonth(startDate.getMonth() - (Math.min(20, settings.number) * 3 + 1), 0);
		break;
	}
	startDate.setDate(startDate.getDate() + 1);

	var url = QuandlMultiSnapshot.makeUrl("/factsetfundamentals_quandl/xFactSetFundamentals.json/GetFundamentalsFiscalRange?IdentifierType=Symbol&Identifiers=" + encodeURIComponent(settings.symbol) + "&FundamentalTypes=" + fundamentalTypes + "&StartDate=" + PortalCore.mmddyyyy(startDate) + "&EndDate=" + PortalCore.mmddyyyy(endDate) + "&ExcludeRestated=false&ReportType=" + term + "&UpdatedSince=");
	PortalCore.serverFetch(url, null, null, function (status, result) {
		if (status != 200) return;
		result = JSON.parse(result);
		result = result[0];
		if (!result.FundamentalsSets || !result.FundamentalsSets.length) {
			cb("Error", null, extraParams);
		}


		var statementType;
		if (result.Company.StatementTemplate == "Industrial") statementType = "a";
		else if (result.Company.StatementTemplate == "Bank") statementType = "b";
		else if (result.Company.StatementTemplate == "Insurance") statementType = "c";
		else if (result.Company.StatementTemplate == "OtherFinancial") statementType = "d";

		var items = [];
		_.each(result.FundamentalsSets, function (value) {
			var fundamentals = value.Fundamentals;
			var item = {};
			item.Fields = {};
			item.Type = statementType;
			var dateParts = value.AsOfDate.split("/");
			item.Date = new Date(dateParts[2], dateParts[0] - 1, dateParts[1]);
			item.Currency = value.Currency;
			_.each(fundamentals, function (line) {
				if (line.Unit == "Trillions") line.Value *= 1000000000000;
				else if (line.Unit == "Billions") line.Value *= 1000000000;
				else if (line.Unit == "Millions") line.Value *= 1000000;
				else if (line.Unit == "Thousands") line.Value *= 1000;
				else if (line.Unit == "Hundreds") line.Value *= 100;
				else line.Value *= 1; //why does this need to be done?
				if (line.Unit != "Actual") line.Value = Number(line.Value.toFixed(0));

				if (lineTypeToFieldNameMap[line.Type] && lineTypeToFieldNameMap[line.Type] != '') item.Fields[lineTypeToFieldNameMap[line.Type]] = line.Value;

				if (line.Type == "DeferredTaxAssets") {
					item.Fields.Non_Cur_Def_Inc_Tax = line.Value;
					item.Fields.Def_Tax_Ass = line.Value;
				} else if (line.Type == "TotalAssets") {
					item.Fields.Tot_Non_Cur_Ass = line.Value - item.Fields.Tot_Cur_Ass;
					item.Fields.Tot_Ass = line.Value;
				} else if (line.Type == "SellingGeneralAdministrativeExpenses") {
					item.Fields.Sell_Gen_Adm_Exp = line.Value;
					item.Fields.Tot_Oper_Exp = line.Value;
				} else if (line.Type == "SellingGeneralAdministrativeExpensesAndOther") {
					item.Fields.Sell_Gen_Adm_Exp_Oth = line.Value;
					item.Fields.Tot_Oper_Exp = line.Value;
				} else if (line.Type == "OtherOperatingExpense") {
					item.Fields.Oth_Oper_Exp = line.Value;
					item.Fields.Tot_Oper_Exp += line.Value;
				} else if (line.Type == "TotalLiabilities") {
					item.Fields.Tot_Non_Cur_Liab = line.Value - item.Fields.Tot_Cur_Liab;
					item.Fields.Tot_Liab = line.Value;
				}
			});
			items.push(item);
		});
		cb(null, {
			settings: settings,
			financials: items
		}, extraParams);

	});

}

quandl.fetchFinancialStatements = function (settings, cb, extraParams) {
	if (!QuandlMultiSnapshot.setQuandlEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				quandl.fetchFinancialStatements.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}
	var terms = ['Quarterly']; //['Quarterly', 'Annual'];
	var statements = ['BalanceSheet']; //, 'CashFlowStatement', 'IncomeStatement'];
	_.each(terms, function (term) {
		_.each(statements, function (statement) {
			if (!settings.number) settings.number = 5;
			var newSettings = _.clone(settings);
			newSettings.term = term;
			newSettings.statement = statement;
			fetchFinancialStatement(newSettings, cb, extraParams);
		})
	});
}

quandl.fetchFinancialStatement = function (settings, cb, extraParams) {
	if (!QuandlMultiSnapshot.setQuandlEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				quandl.fetchFinancialStatement.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}
	var statement = null,
		term = null;

	var symbol = settings.symbol;

	if (settings.term) term = settings.term; //Quarterly or Annual
	else term = 'Quarterly';

	if (settings.statement) statement = settings.statement; //BalanceSheet, CashFlowStatement, IncomeStatement
	else statement = 'IncomeStatement';

	if (!statement || !term) return;

	var date = new Date();
	//var count = 0;


	//var items = {};
	//while (count < settings.number) {
	function fetchStatement(asOfDate) {
		var url = QuandlMultiSnapshot.makeUrl("/factsetfundamentals_quandl/xFactSetFundamentals.json/Get" + statement + "s?IdentifierType=Symbol&Identifiers=" + encodeURIComponent(symbol) + "&ReportType=" + term + "&AsOfDate=" + PortalCore.mmddyyyy(asOfDate) + "&ExcludeRestated=false&UpdatedSince=");
		PortalCore.serverFetch(url, null, null, function (status, result) {
			if (status != 200) return;
			result = JSON.parse(result);
			var r = result[0][statement];
			if (!r) {
				cb("Error", null, extraParams);
				return;
			}
			var item = {};
			var dateParts = r.FiscalPeriodEndDate.split("/");
			item.Date = new Date(dateParts[2], dateParts[0] - 1, dateParts[1]);
			if (r.StatementTemplate == "Industrial") item.Type = "a";
			else if (r.StatementTemplate == "Bank") item.Type = "b";
			else if (r.StatementTemplate == "Insurance") item.Type = "c";
			else if (r.StatementTemplate == "OtherFinancial") item.Type = "d";
			if (isNaN(item.Date)) return;
			if (!r.Items) return;
			item.Fields = {};
			var lineTypeToFieldNameMap = {
				"CashShortTermInvestments": "Csh_Csh_Equ",
				"ShortTermReceivables": "Rec",
				"InvestmentSecurities": "Inv_Sec",
				"SecuritiesInCustody": "Sec_Cust",
				"Inventories": "Inv",
				"OtherCurrentAssets": "Oth_Cur_Ass",
				"TotalCurrentAssets": "Tot_Cur_Ass",
				"NetPropertyPlantEquipment": "Net_Fix_Ass",
				"TotalInvestmentsAndAdvances": "Tot_Inv_Adv",
				"LongTermNoteReceivable": "Lng_Trm_Note_Rec",
				"IntangibleAssets": "Intang",
				"TotalCash": "Csh_Csh_Equ",
				"PremiumBalanceReceivables": "Prem_Bal_Rec",
				"InvestmentInUnconsolidatedAffiliates": "Inv_Uncon_Aff",
				"OtherAssets": "Oth_Non_Cur_Ass",
				"TotalCashDueFromBanks": "Tot_Cash_Bnk",
				"TotalInvestmentsBanks": "Tot_Inv_Bnk",
				"NetLoans": "Net_Loans",
				"CustomerLiabilityOnAcceptances": "Cust_Liab_Accept",
				"RealEstateAssets": "Real_Est_Ass",
				"InterestReceivables": "Int_Rec",
				"OtherIntangibleAssets": "Oth_Intang",
				"InsurancePolicyLiabilitiesInsurance": "Ins_Pol_Liab_Ins",
				"TotalDeposits": "Tot_Dep",
				"TotalDebt": "Tot_Debt",
				"ShortTermDebt": "Sht_Trm_Debt",
				"AccountsPayable": "Acc_Pay",
				"IncomeTaxPayable": "",
				"OtherCurrentLiabilities": "Oth_Cur_Liab",
				"TotalCurrentLiabilities": "Tot_Cur_Liab",
				"LongTermDebt": "Lng_Trm_Debt",
				"ProvisionForRisksCharges": "Prov_Risk_Chg",
				"DeferredTaxLiabilities": "Def_Inc_Tax_Liab",
				"OtherLiabilities": "Oth_Non_Cur_Liab",
				"NonEquityReserves": "Non_Equ_Res",
				"PreferredStockCarryingValue": "Prf_Stk_Carry_Val",
				"TotalCommonEquity": "Com_Equ",
				"TotalShareholdersEquity": "Tot_Stk_Equ",
				"AccumulatedMinorityInterest": "Min_Int_Equ",
				"TotalEquity": "Tot_Equ",
				"TotalLiabilitiesStockholdersEquity": "Tot_Liab_Stk_Equ",
				"BookValuePerShare": "Bk_Val_Per_Sh",
				"TangibleBookValuePerShare": "Tang_Bk_Val_Per_Sh",
				"Tier1Capital": "Tier1_Cap",
				"Tier2Capital": "Tier2_Cap",
				"SalesOrRevenue": "Sls_Rev",
				"InterestIncome": "Int_Inc",
				"CostOfGoodsSold": "Cost_Gds_Sld",
				"TotalInterestExpense": "Int_Exp",
				"LossesClaimsReserves": "Loss_Clm_Res",
				"GrossIncome": "Grs_Inc",
				"EBITOperatingIncome": "EBIT_OI",
				"NetInterestIncome": "Net_OI",
				"LoanLossProvision": "LLP",
				"NetInterestIncomeAfterLoanLossProvision": "NII_Aft_LLP",
				"OperatingIncomeBeforeInterestExpense": "OI_Bef_IE",
				"InterestExpense": "IE",
				"OperatingIncomeAfterInterestExpense": "OI_Aft_IE",
				"NonInterestIncome": "Non_Int_Inc",
				"NonInterestExpense": "Non_Int_Exp",
				"TotalExpenses": "Tot_Exp",
				"OperatingIncome": "OI",
				"NonOperatingIncomeExpense": "Non_Oper_Inc_Exp",
				"ReservesCharge": "Res_Chg",
				"UnusualExpense": "Un_Exp",
				"PretaxIncome": "Ptx_Inc",
				"IncomeTaxes": "Inc_Tax",
				"EquityInEarningsOfAffiliatesIncome": "Equ_Earn_Aff_Inc",
				"OtherAfterTaxAdjustments": "Oth_Aft_Tax_Adj",
				"ConsolidatedNetIncome": "Cons_New_Inc",
				"MinorityInterestExpense": "Min_Int_Exp",
				"NetIncomeContinuingOperations": "Net_Inc_Cont_Oper",
				"PreferredDividends": "Pref_Div",
				"NetIncomeAvailableToCommonBasic": "Net_Inc_Avail_Comm_Bas",
				"EPSDilutedBeforeUnusualExpense": "EPS_Dil_Bef_Un_Exp",
				"EPSBasicBeforeExtraordinaries": "EPS_Basic_Bef_Extra",
				"EPSFullyDiluted": "EPS_Dil",
				"EBITDA": "EBITDA",
				"OrdinaryIncome": "Ord_Inc",
				"StockOptionCompensationExpense": "Stk_Opt_Comp_Exp",
				"OperatingLeaseExpense": "Oper_Lease_Exp",
				"ForeignCurrencyAdjustment": "Fgn_Curr_Adj",
				"NetIncomeCashFlow": "Net_Inc",
				"DepreciationDepletionAmortizationCashFlow": "Dep_Amort",
				"DeferredTaxesInvestmentTaxCredit": "Def_Tax",
				"OtherFunds": "Oth_Fds",
				"FundsFromOperations": "Fds_Oper",
				"ExtraordinaryItem": "ExtraOrd",
				"ChangesInWorkingCapital": "Working_Cap",
				"NetOperatingCashFlow": "Operating_Total",
				"CapitalExpenditures": "Cap_Exp",
				"NetAssetsfromAcquisitions": "Aquisitions",
				"SaleOfFixedAssetsBusinesses": "Sale_Prop_Plt_Equ",
				"PurchaseOrSaleOfInvestments": "Investments",
				"IncreaseInLoans": "Inc_Loans",
				"DecreaseInLoans": "Dec_Loans",
				"FederalHomeLoanAdvancesChange": "FHL_Adv_Chg",
				"OtherUses": "Other_Uses",
				"OtherSources": "Other_Srcs",
				"NetInvestingCashFlow": "Investing_Total",
				"CashDividendsPaid": "Div_Paid",
				"ChangeInCapitalStock": "Chg_Stock",
				"IssuanceOrReductionOfDebtNet": "Debt_Net",
				"OtherFinancingActivity": "Financing_Other",
				"NetFinancingCashFlow": "Financing_Total",
				"ExchangeRateEffect": "Chg_Eff_Exch_Rate",
				"MiscellaneousFunds": "Misc_Fds",
				"NetChangeInCash": "Chg_Csh_Csh_Equ",
				"FreeCashFlow": "Free_Csh_Flw"
			};
			for (var i = 0; i < r.Items.length; i++) {
				var line = r.Items[i];
				if (line.Unit == "Trillions") line.Value *= 1000000000000;
				else if (line.Unit == "Billions") line.Value *= 1000000000;
				else if (line.Unit == "Millions") line.Value *= 1000000;
				else if (line.Unit == "Thousands") line.Value *= 1000;
				else if (line.Unit == "Hundreds") line.Value *= 100;
				else line.Value *= 1; //why does this need to be done?
				if (line.Unit != "Actual") line.Value = Number(line.Value.toFixed(0));

				if (lineTypeToFieldNameMap[line.Type]) item.Fields[lineTypeToFieldNameMap[line.Type]] = line.Value;

				if (line.Type == "DeferredTaxAssets") {
					item.Fields.Non_Cur_Def_Inc_Tax = line.Value;
					item.Fields.Def_Tax_Ass = line.Value;
				} else if (line.Type == "TotalAssets") {
					item.Fields.Tot_Non_Cur_Ass = line.Value - item.Fields.Tot_Cur_Ass;
					item.Fields.Tot_Ass = line.Value;
				} else if (line.Type == "SellingGeneralAdministrativeExpenses") {
					item.Fields.Sell_Gen_Adm_Exp = line.Value;
					item.Fields.Tot_Oper_Exp = line.Value;
				} else if (line.Type == "SellingGeneralAdministrativeExpensesAndOther") {
					item.Fields.Sell_Gen_Adm_Exp_Oth = line.Value;
					item.Fields.Tot_Oper_Exp = line.Value;
				} else if (line.Type == "OtherOperatingExpense") {
					item.Fields.Oth_Oper_Exp = line.Value;
					item.Fields.Tot_Oper_Exp += line.Value;
				} else if (line.Type == "TotalLiabilities") {
					item.Fields.Tot_Non_Cur_Liab = line.Value - item.Fields.Tot_Cur_Liab;
					item.Fields.Tot_Liab = line.Value;
				}
			}

			item.settings = settings;
			item.asOfDate = new Date(asOfDate);
			//setSectionStatement(section, item);
			cb(null, item, extraParams);

			//if (dates.length > count) date = dates[count];
			//else {
			var previousDate = new Date(item.Date);
			if (settings.term == 'Annual') {
				previousDate.setYear(previousDate.getFullYear() - 1);
			} else {
				previousDate.setMonth(previousDate.getMonth() - 2, 0);
			}

			if (_.keys(financialData[settings.symbol][settings.statement + 's'][settings.term]).length < settings.number) {
				fetchStatement(previousDate);
				console.log(previousDate);
			}

		});

	}
	fetchStatement(date, 0);

}



quandl.fetchFundamentalsFiscalRange = function (settings, cb, extraParams) {
	if (!QuandlMultiSnapshot.setQuandlEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				quandl.fetchFundamentalsFiscalRange.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}
	var terms = _.uniq(_.map(settings.fundamentals, 'term'));

	var endDate = new Date();
	var startDate = new Date();
	startDate.setYear(startDate.getFullYear() - Math.min(5, settings.years));
	startDate.setDate(startDate.getDate() + 1);

	var fundamentalData = {};
	var fundamentalDataByDate = {};

	_.each(terms, function (term) {
		var fundamentalTypes = _.map(_.filter(settings.fundamentals, {
			term: term
		}), 'fundamental');

		var url = QuandlMultiSnapshot.makeUrl("/factsetfundamentals_quandl/xFactSetFundamentals.json/GetFundamentalsFiscalRange?IdentifierType=Symbol&Identifiers=" + encodeURIComponent(settings.symbol) + "&FundamentalTypes=" + fundamentalTypes + "&StartDate=" + PortalCore.mmddyyyy(startDate) + "&EndDate=" + PortalCore.mmddyyyy(endDate) + "&ExcludeRestated=false&ReportType=" + term + "&UpdatedSince=");
		PortalCore.serverFetch(url, null, null, function (status, result) {
			if (status != 200) return;
			result = JSON.parse(result);
			result = result[0];
			if (!result.FundamentalsSets || !result.FundamentalsSets.length) {
				cb("Error", null, extraParams);
			}

			var items = [];
			_.each(result.FundamentalsSets, function (value) {
				var fundamentals = value.Fundamentals;
				var item = {};
				item.Fields = {};
				var dateParts = value.AsOfDate.split("/");
				item.Date = new Date(dateParts[2], dateParts[0] - 1, dateParts[1]);
				item.Currency = value.Currency;
				_.each(fundamentals, function (line) {
					if (line.Unit == "Trillions") line.Value *= 1000000000000;
					else if (line.Unit == "Billions") line.Value *= 1000000000;
					else if (line.Unit == "Millions") line.Value *= 1000000;
					else if (line.Unit == "Thousands") line.Value *= 1000;
					else if (line.Unit == "Hundreds") line.Value *= 100;
					else line.Value *= 1; //why does this need to be done?
					if (line.Unit != "Actual") line.Value = Number(line.Value.toFixed(0));
					item.Fields[line.Type] = line.Value;
				});
				items.push(item);
			});
			returnFundamentalsFiscalRange(term, items);

		});

	});

	function returnFundamentalsFiscalRange(term, fundamentals) {
		fundamentalData[term] = fundamentals;
		if (_.size(fundamentalData) == terms.length) {
			termItemLabelMap = {};
			_.each(settings.fundamentals, function (value) {
				if (!termItemLabelMap[value.term]) termItemLabelMap[value.term] = {};
				if (!termItemLabelMap[value.term][value.fundamental]) termItemLabelMap[value.term][value.fundamental] = [];
				termItemLabelMap[value.term][value.fundamental].push(value.label);
			});
			var items = {};
			_.each(terms, function (value) {
				_.each(fundamentalData[value], function (value2) {
					var dateTime = value2.Date.getTime();
					if (!items[dateTime]) items[dateTime] = {
						Date: dateTime,
						Currency: value2.Currency
					};
					_.each(value2.Fields, function (value3, key3) {
						_.each(termItemLabelMap[value][key3], function (value4, key4) {
							items[dateTime][value4] = value3;
						});

					});
				});
			});


			cb(null, {
				'settings': settings,
				'fundamentals': items
			}, extraParams);
		}
	}


}

quandl.fetchSecurityInsiders = function (settings, cb, extraParams) {
	if (!QuandlMultiSnapshot.setQuandlEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				quandl.fetchSecurityInsiders.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}

	var start = new Date();
	var end = new Date(start);
	start.setFullYear(end.getFullYear() - 1);
	var url = QuandlMultiSnapshot.makeUrl("/www_quandl/xInsider.json/GetIssuerTransactions?IssuerIdentifier=" + encodeURIComponent(settings.symbol) + "&IssuerIdentifierType=Symbol&FromDate=" + PortalCore.mmddyyyy(start) + "&ToDate=" + PortalCore.mmddyyyy(end) + "&TransactionCode=All&SecurityType=Stock&OwnershipType=Both&_fields=Transactions.Insider.Name,Transactions.TransactionDate,Transactions.TransactionDescription,Transactions.StockAmount,Transactions.Price,Transactions.AmountOwnedAfter");
	PortalCore.serverFetch(url, null, null, function (status, result) {
		function isSell(desc) {
			if (desc.indexOf("Sale") > -1) return true;
			//else if(desc.indexOf("Gift")>-1) return true;
			else if (desc.indexOf("Disposition") > -1) return true; //Note: "Other Acquisition or Disposition" description may eval incorrectly
			else if (desc.indexOf("Same Day Exercise") > -1) return true; //Note: "Other Acquisition or Disposition" description may eval incorrectly
			return false;
		}
		if (status != 200) {
			cb("Error", null, extraParams);
			return;
		}
		result = JSON.parse(result);
		if (!result.Transactions) {
			cb("No Data", null, extraParams);
			return;
		}
		var items = [];
		for (var t = 0; t < result.Transactions.length; t++) {
			var res = result.Transactions[t];
			var item = {};
			item.Amount = res.StockAmount;
			if (item.Amount == 0) continue;
			var dateParts = res.TransactionDate.split("/");
			item.Date = new Date(dateParts[2], dateParts[0] - 1, dateParts[1]);
			if (isNaN(item.Date)) continue;
			item.Name = res.Insider.Name;
			item.Description = res.TransactionDescription;
			if (isSell(item.Description)) item.Amount *= -1;
			item.Price = res.Price;
			item.Owned = res.AmountOwnedAfter;
			item.SortKey = item.Date.valueOf() + t;
			items.push(item);
		}
		cb(null, {
			'settings': settings,
			'items': items
		}, extraParams);
	});

}

quandl.fetchSecurityFilings = function (settings, cb, extraParams) {
	if (!QuandlMultiSnapshot.setQuandlEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				quandl.fetchSecurityFilings.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}

	var end = new Date();
	end.setDate(end.getDate() + 1);
	var url = QuandlMultiSnapshot.makeUrl("/www_quandl/xEdgar.json/SearchFilings?Identifier=" + encodeURIComponent(settings.symbol) + "&IdentifierType=Symbol&PriorToDate=" + PortalCore.mmddyyyy(end) + "&OwnershipForms=Include&Form=&OutputType=AllMatches&_fields=Filings.Date,Filings.Type,Filings.Description,Filings.HtmlFileUrl");
	PortalCore.serverFetch(url, null, null, function (status, result) {
		if (status != 200) return;
		result = JSON.parse(result);
		if (!result.Filings) {
			cb();
			return;
		}
		var items = [];
		for (var f = 0; f < result.Filings.length; f++) {
			var res = result.Filings[f];
			var item = {};
			var dateParts = res.Date.split("-");
			item.Date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
			if (isNaN(item.Date)) continue;
			item.FormType = res.Type;
			item.Subject = res.Description;
			var accNo = item.Subject.indexOf("Acc-no:");
			if (accNo != -1) item.Subject = item.Subject.substr(0, accNo);
			item.Url = res.HtmlFileUrl;
			items.push(item);
		}
		cb(null, items, extraParams);
	});

}

PortalCore.getETUTCOffset = function(date) {
	switch (date.getMonth()) {
	case 3:
	case 4:
	case 5:
	case 6:
	case 7:
	case 8:
	case 9:
		return -240;
	case 0:
	case 1:
	case 11:
		return -300;
	case 2:
		{
			if (date.getDate() < 8) return -300;
			else if (date.getDate() >= 14) return -240;
			else if (date.getDate() % 7 > date.getDay()) {
				if (date.getDay() != 0) return -240;
				else if (date.getHours() < 3) return -300;
				else return -240;
			} else return -300;
		}
	case 10:
		{
			if (date.getDate() >= 7) return -300;
			else if (date.getDate() % 7 > date.getDay()) {
				if (date.getDay() != 0) return -300;
				else if (date.getHours() == 0) return -240;
				else if (date.getHours() == 1) { //which 1 is it?
					if ((new Date(date.getTime() - 1000 * 60 * 60)).getHours() == 0) return -240;
				}
				return -300;
			} else return -240;
		}
	}
}

quandl.fetchEconomicCalendar = function (settings, cb, extraParams) {
	if (!QuandlMultiSnapshot.setQuandlEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				fetchEconomicCalendar.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}
	var start = new Date();
	start.setHours(0, 0, 0, 0);
	var end = new Date();
	end.setHours(23, 59, 59, 0);
	//if (range == "all") {
	start.setMonth(start.getMonth() - 3);
	end.setFullYear(end.getFullYear() + 1);
	/*} else if (range == "month") {
		start.setDate(1);
		end.setDate(31);
		if (offset) {
			start.setMonth(start.getMonth() + offset);
			end.setMonth(end.getMonth() + offset);
		}
		while (end.getDate() < 5) end.setDate(end.getDate() - 1);
	} else if (range == "monthahead") {
		end.setMonth(end.getMonth() + 1);
		end.setDate(end.getDate() - 1);
	} else if (range == "week") {
		if (offset) {
			start.setDate(start.getDate() + offset * 7);
			end.setDate(end.getDate() + offset * 7);
		}
		while (start.getDay() > 0) start.setDate(start.getDate() - 1);
		while (end.getDay() < 6) end.setDate(end.getDate() + 1);
	} else if (range == "weekahead") {
		end.setDate(end.getDate() + 6);
	} else if (range == "day") {
		if (offset) {
			start.setDate(start.getDate() + offset);
			end.setDate(end.getDate() + offset);
		}
	} else if (range.indexOf("custom-") == 0) {
		var ranges = range.split("-");
		var rangeStart = ranges[1].split("/");
		start = new Date(Number(rangeStart[2]), Number(rangeStart[0]) - 1, Number(rangeStart[1]), 0, 0, 0, 0);
		var rangeEnd = ranges[2].split("/");
		end = new Date(Number(rangeEnd[2]), Number(rangeEnd[0]) - 1, Number(rangeEnd[1]), 0, 0, 0, 0);
	} else {
		cb(range + offset);
		return;
	}*/
	var startOffset = PortalCore.getETUTCOffset(start) + start.getTimezoneOffset();
	var endOffset = PortalCore.getETUTCOffset(end) + end.getTimezoneOffset();
	start.setMinutes(start.getMinutes() + startOffset);
	end.setMinutes(end.getMinutes() + endOffset);

	var url = QuandlMultiSnapshot.makeUrl("/www_quandl/xCalendar.json/GetEventsForRange?ReleasedOnStart=" + PortalCore.mmddyyyy(start) + "%20" + PortalCore.hhmmss(start) + "&ReleasedOnEnd=" + PortalCore.mmddyyyy(end) + "%20" + PortalCore.hhmmss(end) + "&_fields=Summaries.EventID,Summaries.EventName,Summaries.CountryCode,Summaries.ReleasedOn,Summaries.Value.ValueName,Summaries.Values.Consensus,Summaries.Values.Actual");
	PortalCore.serverFetch(url, null, null, function (status, result) {
		if (status == 200) {
			result = JSON.parse(result);
			if (!result.Summaries) return;
			var items = [];
			for (var s = 0; s < result.Summaries.length; s++) {
				var item = result.Summaries[s];
				item.Subject = item.EventName.replace(/''''/g, "'");
				delete item.EventName;
				item.Date = new Date(item.ReleasedOn);
				item.Date.setMinutes(item.Date.getMinutes() - PortalCore.getETUTCOffset(item.Date));
				if (isNaN(item.Date)) { //IE8 nonsense
					datePart = item.ReleasedOn.split("T")[0].split("-");
					timePart = item.ReleasedOn.split("T")[1].split(":");
					item.Date = new Date(datePart[0], datePart[1] - 1, datePart[2], timePart[0], timePart[1], 0, 0);
					item.Date.setMinutes(item.Date.getMinutes() - PortalCore.getETUTCOffset(item.Date) - item.Date.getTimezoneOffset());
				}
				delete item.ReleasedOn;
				item.Symbol = item.EventID;
				delete item.EventID;
				if (item.Symbol.indexOf("SPK") == 0 && (item.Subject.indexOf("Federal ") != -1 || item.Subject.indexOf("Fed ") != -1)) { //fed speeches have wrong speakers!
					item.Subject = "Federal Reserve Bank Speech";
				}
				for (var v = item.Values.length - 1; v >= 0; v--) {
					if (!item.Values[v].Actual && !item.Values[v].Consensus) {
						item.Values.splice(v, 1);
					} else if (item.Values[v].ValueName.toLowerCase() == "change" || item.Values[v].ValueName.toLowerCase() == "merit extra attention") {
						item.Values.splice(v, 1);
					}
				}
				if (item.Values.length == 0) item.Values.push({
					"ValueName": "",
					"Actual": "",
					"Consensus": ""
				});
				item.Values.sort(function (a, b) {
					if (a.ValueName < b.ValueName) return -1;
					else if (a.ValueName > b.ValueName) return 1;
					else return 0;
				});
				item.SortKey = item.Date.valueOf() + item.CountryCode + "-" + item.Subject;
				items.push(item);
			}
			cb(null, items, extraParams);
		}
		if (currentCalendarPointer && range + offset != currentCalendarPointer) return;

		//TODO: deal with Holidays later
		/*var holidayExchanges = {
			"US": "XNYS"
		};
		if (global) holidayExchanges = {
			"US": "XNYS",
			"FR": "XPAR",
			"IT": "MTAA",
			"GB": "XLON",
			"JP": "XTKS",
			"CH": "XSWX",
			"CN": "XSHG",
			"NZ": "XNZE",
			"CA": "XTSE",
			"DE": "XBER",
			"AU": "XASX",
			"EMU": "XBRU",
			"IN": "XBOM"
		};
		var holCount = 0;
		start.setMinutes(start.getMinutes() - startOffset);
		end.setMinutes(end.getMinutes() - endOffset);
		for (var hol in holidayExchanges) holCount++;
		for (hol in holidayExchanges) {
			var url2 = makeUrl("/globalholidays_quandl/xGlobalHolidays.json/GetHolidays?Location=" + holidayExchanges[hol] + "&LocationType=Exchange&StartDate=" + PortalCore.mmddyyyy(start) + "%20" + PortalCore.hhmmss(start) + "&EndDate=" + PortalCore.mmddyyyy(end) + "%20" + PortalCore.hhmmss(end) + "&_fields=Date,Name,FullHoliday,EarlyClose");
			(function (country) {
				PortalCore.serverFetch(url2, null, null, function (status, result) {
					if (status == 200) {
						result = JSONparse(result);
						if (!result.length) return;
						for (var s = 0; s < result.length; s++) {
							if (count == limit) break;
							var item = result[s];
							if (!item.Name) continue;*/
		//item.Subject = item.Name.replace(/\*/g, " (projected)");
		/*delete item.Name;
							item.CountryCode = country;
							item.Symbol = "HOL-" + item.CountryCode + "-" + item.Date;
							var dateParts = item.Date.split("/");
							var d = new Date(dateParts[2], dateParts[0] - 1, dateParts[1], 0, 0, 0, 0);
							item.Date = d;

							//item.Date.setMinutes(item.Date.getMinutes()-PortalCore.getETUTCOffset(item.Date)-item.Date.getTimezoneOffset());
							var status = "open";
							if (item.FullHoliday) status = "closed";
							delete item.FullHoliday;
							if (item.EarlyClose) status = "early closing";
							delete item.EarlyClose;
							item.Values = [{
								"ValueName": "Market Status",
								"Actual": status,
								"Consensus": ""
							}];
							item.SortKey = item.Date.valueOf() + item.CountryCode + "-" + item.Subject;
							setSectionHeadline(section, item);
							count++;
						}
					}
					holCount--;
					if (!holCount) cb(range + offset);
				});
			}(hol));
		}*/
	});
}

quandl.fetchEconomicCalendarDetail = function (settings, cb, extraParams) {
	if (needsEncryption && !setQuandlEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				quandl.fetchEconomicCalendarDetail.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}
	var url = QuandlMultiSnapshot.makeUrl("/www_quandl/xCalendar.json/GetEventDetails?EventID=" + id + "&_fields=Description");
	PortalCore.serverFetch(url, null, null, function (status, result) {
		if (status != 200) return;
		result = JSONparse(result);
		var description = "";
		for (var s in section) {
			if (!section[s] || !section[s].Headline) continue;
			var item = section[s].Headline;
			if (item.Symbol == id) {
				description = result.Description.replace(/''''/g, "'");
				item.Summary = description;
				setSectionHeadline(section, item);
			}
		}
		cb(description);
	});
}



window.dataSources.quandl = quandl;