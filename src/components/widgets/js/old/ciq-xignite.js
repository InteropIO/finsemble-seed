/**
 * XigniteMultiSnapshot
 *
 * Singleton that can be used to fetch an array of snapshot quotes for varying
 * security types. The results are normalized and then returned via callback.
 */


var XigniteMultiSnapshot = function() {};

XigniteMultiSnapshot.isIndexSymbol = function(symbol) {
	if (symbol && symbol.indexOf(".IND") > 0) return true;
	if (symbol && symbol.charAt(0) == "^" && symbol.length < 6) return true;
	return false;
};

XigniteMultiSnapshot.hasExchange = function(symbol) {
	if(symbol){
		// split on '.' to check for exchange
		var exchangeSplit = symbol.split('.');
		
		if(exchangeSplit.length > 1){
			// exchange code will only be 4 characters
			// index length will always be more than 4
			if(exchangeSplit[1].length == 4){
				return true;
			}
		}
	}
	
	return false;
};

XigniteMultiSnapshot.isFuturesSymbol = function(symbol) {
	if (!symbol) return false;
	if (symbol.indexOf("/") == 0) return true;
	return false;
};

XigniteMultiSnapshot.isForexSymbol = function(symbol) {
	if (!symbol) return false;
	if (symbol.indexOf(".") != -1) return false;
	if (symbol.indexOf("/") != -1) return false;
	if (symbol.length < 6 || symbol.length > 7) return false;
	if (/\^?[A-Za-z]{6}$/.test(symbol)) return true;
	return false;
};

XigniteMultiSnapshot.isForexMetal = function(symbol) {
	if (!symbol) return false;
	if (!XigniteMultiSnapshot.isForexSymbol(symbol)) return false;
	var tSym=symbol;
	if (tSym.charAt(0) != "^") tSym = "^" + tSym;
	if (",XAU,XPD,XPT,XAG,".indexOf("," + tSym.substr(4, 3) + ",") != -1) return true;
	else if (",XAU,XPD,XPT,XAG,".indexOf("," + tSym.substr(1, 3) + ",") != -1) return true;
	return false;
};

XigniteMultiSnapshot.securityType = function(symbol, useSuperQuotes) {
	if (XigniteMultiSnapshot.isIndexSymbol(symbol)) return "INDEX_REALTIME";
	if (XigniteMultiSnapshot.isForexMetal(symbol)) return "METAL";
	if (XigniteMultiSnapshot.isForexSymbol(symbol)) return "CURRENCY";
	if (XigniteMultiSnapshot.isFuturesSymbol(symbol)) return "FUTURE";
	if (XigniteMultiSnapshot.hasExchange(symbol)) return "EXCHANGE";
	if (useSuperQuotes) return "SUPERQUOTES";
	return "EQUITY";
};

XigniteMultiSnapshot.makeUrl = function(path) {
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
			if (baseParts[0]=='www' || baseParts[0]=='chartiq') {
				base="https://"+topDir.replace(/_/,".")+".com";
			} else {
				base="https://"+topDir.replace(/_/,"-chartiq.")+".com";
			}
		}
		else if (hostname == "127.0.0.1" || hostname == "localhost") base = "https://devservices.chartiq.com/data" + (topDir ? "/" + topDir : "");
		else base += "/" + topDir;
		return base;
	}
	if (path[0] == "/") path = path.substr(1);
	var dirs = path.split("/");
	var url;
	/*if (dirs[0]=='historical_currencies_bugfix') {
		dirs.shift();
		url = 'https://globalcurrencies.xignite.com'
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

//Returns true if it has a valid token already
XigniteMultiSnapshot.setXigniteEncryptedToken = function(override, testOnly, polling) {
	if (polling) {
		setTimeout(function(o) {
			return function() {
				XigniteMultiSnapshot.setXigniteEncryptedToken(o, testOnly, polling);
			};
		}(override), 10000);
	}
	var mySite = location.pathname.split("/").slice(1, 3).join("/");
	var token;
	if (!override.token) {
		token = localStorage.getItem("Xignite.token");
		if (token) {
			token = JSON.parse(token);
			if (token.site == mySite) {
				override.token = token.token;
				override.tokenUser = token.userid;
				override.tokenExpiration = token.expires;
			}
		}
	}
	if (override.tokenExpiration) {
		if (override.tokenExpiration - 300000 > Date.now()) return true; // not within 5 minutes of expiration
	}
	if (testOnly) return false;
	var url = "data/xignite_token/";
	serverFetch(url, null, null, function(status, response) {
		if (status == 200) {
			try {
				response = JSON.parse(response);
				override.tokenUser = response.userid;
				override.token = response.token;
				override.tokenExpiration = Date.now() + 1800000; //30 minutes
				token = {
					"token": override.token,
					"userid": override.tokenUser,
					"expires": override.tokenExpiration,
					"site": mySite
				};
				localStorage.setItem("Xignite.token", JSON.stringify(token));
			} catch (e) {}
		}
	});
	return false;
};


/**
 * Gets snapshot quotes for an array of symbols
 * @param  {Array}   symbols        Array of symbol names
 * @param  {Object}   [entitlements]   Entitlement object.  Set {BATS:true} if BATS is entitled for the user.
 * @param  {Function} cb             Callback function to receive symbol data. function(err, arr)
 * @param  {String}   [identifierType="symbol"] Optional identifier type, will apply to all securities that support it. "cusip","sedol", etc as supported by Xignite
 * @param  {Boolean}   [useSuperQuotes=false] Optional use Xignite super quotes API
 */
XigniteMultiSnapshot.getQuotes = function(symbols, entitlements, cb, identifierType, useSuperQuotes) {
	var requestCount = 0;
	var indiciesNumber = 0;
	var indiciesCheck = false;
	arr = [];

	if (!apiToken && needsEncryption) {
		if (!XigniteMultiSnapshot.setXigniteEncryptedToken(encryptedToken, true)) {
			setTimeout(function(self, args) {
				return function() {
					XigniteMultiSnapshot.getQuotes.apply(self, args);
				};
			}(this, arguments), 100);
			return;
		}
	}

	if(!symbols.length) cb("no symbols");

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
	if (getETUTCOffset(asOfDate) == -300) fixingTime = "22:00";
	asOfDate = (asOfDate.getMonth() + 1) + "/" + asOfDate.getDate() + "/" + asOfDate.getFullYear();

	var urls = {
		METAL: XigniteMultiSnapshot.makeUrl("/globalmetals_xignite/xGlobalMetals.json/GetRealTimeMetalQuotes?Symbols={symbols}&Currency=&_fields=Symbol,Currency,Date,Time,Ask,Bid,Mid,Unit"),
		CURRENCY: XigniteMultiSnapshot.makeUrl("/globalcurrencies_xignite/xGlobalCurrencies.json/GetRealTimeRates?Symbols={symbols}&_fields=Symbol,Date,Time,Ask,Bid,Mid,QuoteCurrency,BaseCurrency,Spread"),
		INDEX_REALTIME: XigniteMultiSnapshot.makeUrl("/globalindicesrealtime_xignite/xglobalindicesrealtime.json/GetRealTimeIndicesValue?IdentifierType={identifierType}&Identifiers={symbols}"),
		FUTURE: XigniteMultiSnapshot.makeUrl("/www_xignite/xFutures.json/GetDelayedFutures?Symbols={symbols}&Month=0&Year=0&_fields=Future.Symbol,Date,Time,Open,High,Low,Last,Volume,PreviousClose,Change,PercentChange"), // todo, determine forward month
		BATS: XigniteMultiSnapshot.makeUrl("/batsrealtime_xignite/v3/xBATSRealTime.json/GetExtendedQuotes?IdentifierType={identifierType}&Identifiers={symbols}&_fields=Security.Symbol,Security.Name,Date,Time,Open,High,Low,Last,Volume,PreviousClose,ChangeFromPreviousClose,PercentChangeFromPreviousClose"),
		//BATS: XigniteMultiSnapshot.makeUrl("/batsrealtime_xignite/xBATSRealTime.json/GetRealQuotes?Symbols={symbols}&_fields=Security.Symbol,Date,Time,Open,High,Low,Last,Volume,PreviousClose,Change,PercentChange"),
		CONSOLIDATED: XigniteMultiSnapshot.makeUrl("/globalrealtime_xignite/v3/xGlobalRealTime.json/GetGlobalExtendedQuotes?IdentifierType={identifierType}&Identifiers={symbols}&_fields=Security.Symbol,Security.Name,Date,Time,Open,High,Low,Last,Volume,PreviousClose,ChangeFromPreviousClose,PercentChangeFromPreviousClose"),
		//CONSOLIDATED: XigniteMultiSnapshot.makeUrl("/globalrealtime_xignite/v3/xGlobalRealTime.json/GetGlobalRealTimeQuotes?Symbols={symbols}&_fields=Security.Symbol,Date,Time,Open,High,Low,Last,Volume,PreviousClose,Change,PercentChange"),
		DELAYED: XigniteMultiSnapshot.makeUrl("/globalquotes_xignite/v3/xGlobalQuotes.json/GetGlobalExtendedQuotes?IdentifierType={identifierType}&Identifiers={symbols}&_fields=Security.Symbol,Security.CUSIP,Security.ISIN,Security.CIK,Security.Valoren,Security.Name,Date,Time,Open,High,Low,Last,Volume,PreviousClose,Currency,UTCOffset,High52Weeks,Low52Weeks,Outcome,ChangeFromPreviousClose,PercentChangeFromPreviousClose"),
		//DELAYED: XigniteMultiSnapshot.makeUrl("/globalquotes_xignite/v3/xGlobalQuotes.json/GetGlobalDelayedQuotes?IdentifierType={identifierType}&Identifiers={symbols}&_fields=Security.Symbol,Security.CUSIP,Security.ISIN,Security.CIK,Security.Valoren,Date,Time,Open,High,Low,Last,Volume,PreviousClose,Currency,UTCDate,UTCTime,High52Weeks,Low52Weeks,Outcome,ChangeFromPreviousClose,PercentChangeFromPreviousClose"),
		SUPERQUOTES: XigniteMultiSnapshot.makeUrl("/superquotes_xignite/xSuperQuotes.json/GetQuotes?IdentifierType={identifierType}&Identifiers={symbols}"),
		METAL_HISTORICAL: XigniteMultiSnapshot.makeUrl("/globalmetals_xignite/xGlobalMetals.json/GetHistoricalMetalQuotes?Symbols={symbols}&Currency=&PriceType=Mid&AsOfDate=" + asOfDate + "&FixingTime=" + fixingTime),
		CURRENCY_HISTORICAL: XigniteMultiSnapshot.makeUrl("/globalcurrencies_xignite/xGlobalCurrencies.json/GetHistoricalRates?Symbols={symbols}&PriceType=Mid&AsOfDate=" + asOfDate + "&FixingTime=" + fixingTime),
	};

	// separate the delayed and historical index urls as they are backup if realtime fails, so no need to execute them without cause.
	// keep index realtime in the other urls list in order to kick off the index search process.
	var indexUrls = {
		INDEX_DELAYED: XigniteMultiSnapshot.makeUrl("/globalindices_xignite/xglobalindices.json/GetDelayedIndicesValue?IdentifierType={identifierType}&Identifiers={symbols}"),
		INDEX_HISTORICAL: XigniteMultiSnapshot.makeUrl("/globalindiceshistorical_xignite/xglobalindiceshistorical.json/GetLastClosingIndicesValue?IdentifierType={identifierType}&Identifiers={symbols}"),
	};
	
	var isConsolidated = false;

	if (entitlements) {
		// flag if consolidated as that api can also access exchanges
		if (entitlements["EQUITY"] == "CONSOLIDATED"){
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
		var securityType = XigniteMultiSnapshot.securityType(symbol, useSuperQuotes);

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
			else if(securityType ==="EXCHANGE"){
				if(isConsolidated){
					quotes["EQUITY"].push(symbol);
				} else{
					quotes["DELAYED"].push(symbol);
				}
			} 
			else {
				quotes[securityType].push(symbol);
			}
		}

		response[symbol] = {}; // initialize responses
	}
	
	// if no quotes for delayed delete url
	if(quotes["DELAYED"].length < 1){
		delete urls["DELAYED"];
	}

	for (var securityType in quotes) {
		var symbols = quotes[securityType];
		
		if (identifierType && urls[securityType]) {
			urls[securityType] = urls[securityType].replace("{identifierType}", identifierType);
		} else if(urls[securityType]) {
			urls[securityType] = urls[securityType].replace("{identifierType}", "symbol");
		}

		if (symbols.length && urls[securityType]) {
			requestCount++;
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
	 * Processes the response from xignite
	 * @param  {String}   status		html status code
	 * @param  {Object}   result   	json returned from xignite
	 */

	function processResponse(status, result) {
		requestCount--;
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
					normalizeFields(item, fieldsToChange);
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
							if(existingItem) {
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
							if(existingItem) {
								fieldsToChange["Last"] = existingItem.Last;
								fieldsToChange["Bid"] = existingItem.Bid;
								fieldsToChange["Ask"] = existingItem.Ask;
								fieldsToChange["Date"] = existingItem.Date;
								fieldsToChange["Time"] = existingItem.Time;
							}
						}
						normalizeFields(item, fieldsToChange);
						if(!item.UTCOffset) item.UTCOffset=0;
						if (item.Last && item.Previous) {
							item.Change = item.Last - item.Previous;
							item.PercentChange = item.Change/item.Previous * 100;
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
			}
		}

		if (!requestCount)
			cb(null, arr);
	}


	/**
	 * Helper response method to process xignite indicies results. This has
	 * been broken away from processResponse for ease of use/readability
	 * and to make sure the delayed and historical index urls are not
	 * needlessly executed
	 */

	function processIndexResponse(status, result) {
		requestCount--;
		if (status == 200) {
			result = JSON.parse(result);
			for (var s = 0; s < result.length; s++) {
				var item = result[s];
				if (item.Index || item.hasOwnProperty('Index')) {
					if (item.Outcome === "Success") {
						item.Symbol = item.Index.Symbol + "." + item.Index.IndexGroup;
						item.Currency=item.Index.Currency;
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

							normalizeFields(item, fieldsToChange);
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
		// again since xignite doesn't return which symbol failed in a
		// convienient manner
		if (indiciesCheck) {
			requestCount++;
			indiciesNumber++;
			indiciesCheck = false;

			if (indiciesNumber == 1) {
				serverFetch(indexUrls["INDEX_DELAYED"], null, null, processIndexResponse);
			} else if (indiciesNumber == 2) {
				serverFetch(indexUrls["INDEX_HISTORICAL"], null, null, processIndexResponse);
			} else {
				// no more urls to try
				requestCount--;
			}
		}
		if (!requestCount) cb(null, arr);
	}

	/**
	 * There is very little consistency in the xignite api calls.
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
	 * Example: No need to pass in Volume if the field location is the same in the xignite response object
	 */

	function normalizeFields(item, fieldsToChange) {
		// iterate through object entries and write to item object
		for (var field in fieldsToChange) {
			item[field] = typeof fieldsToChange[field] != "undefined" ? fieldsToChange[field] : null;
		}

		arr[item.Symbol] = item;
	}

	// if url is index realtime execute a different response callback
	for (var securityType in urls) {
		if (securityType !== "INDEX_REALTIME") {
			serverFetch(urls[securityType], null, null, processResponse);
		} else {
			serverFetch(urls[securityType], null, null, processIndexResponse);
		}
	}
};

if (!apiToken && needsEncryption) XigniteMultiSnapshot.setXigniteEncryptedToken(encryptedToken, false, true);
