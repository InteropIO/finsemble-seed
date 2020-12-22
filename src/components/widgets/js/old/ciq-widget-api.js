/* jshint shadow:true */
/*jshint -W117 */
var requestToXigniteFundamentalsMap = {
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

var requestToXigniteFundFundamentalsMap = {
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

function urlBase(topDir) {
	var base = "data";
	if (apiToken) base = "https://services.chartiq.com" + (topDir ? "/" + topDir : "");
	else if (needsEncryption) {
		var baseParts = topDir.split('_');
		if (baseParts[0] == 'www' || baseParts[0] == 'chartiq') {
			base = "https://" + topDir.replace(/_/, ".") + ".com";
		} else {
			base = "https://" + topDir.replace(/_/, "-chartiq.") + ".com";
		}
	} else if (location.hostname == "127.0.0.1" || location.hostname == "localhost") base = "https://devservices.chartiq.com/data" + (topDir ? "/" + topDir : "");
	else base += "/" + topDir;
	return base;
}

function makeUrl(path) {
	if (path[0] == "/") path = path.substr(1);
	var dirs = path.split("/");
	var url = urlBase(dirs.shift());
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
}

//Returns true if it has a valid token already
function setXigniteEncryptedToken(override, testOnly, polling) {
	if (polling) {
		setTimeout(function (o) {
			return function () {
				setXigniteEncryptedToken(o, testOnly, polling);
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
	serverFetch(url, null, null, function (status, response) {
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
}

if (!apiToken && needsEncryption) setXigniteEncryptedToken(encryptedToken, false, true);

function JSONparse(string) {
	try {
		return JSON.parse(string);
	} catch (e) {}
	return [];
}

function fetchQuotes(indicesSection, tickerSection, iLimit, tLimit, flags, cb) {
	var limit = iLimit + tLimit;
	if (!limit) return;
	if (needsEncryption && !setXigniteEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				fetchQuotes.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}
	if (flags & Market.Flags.DATA) {
		var results = {}; {
			var realtimeplaces = tickerSymbolAccessor("*", "INDEX", "realtime");
			var delayedplaces = tickerSymbolAccessor("*", "INDEX", "delayed");
			var eodplaces = tickerSymbolAccessor("*", "INDEX", "eod");
			var realtimesymbols = [];
			var delayedsymbols = [];
			var eodsymbols = [];
			for (var s = 0; s < realtimeplaces.length; s++) {
				realtimesymbols.push(tickerSymbolAccessor(realtimeplaces[s]).symbol);
			}
			for (var s = 0; s < delayedplaces.length; s++) {
				delayedsymbols.push(tickerSymbolAccessor(delayedplaces[s]).symbol);
			}
			for (var s = 0; s < eodplaces.length; s++) {
				eodsymbols.push(tickerSymbolAccessor(eodplaces[s]).symbol);
			}
			if (realtimesymbols.length) {
				var url = makeUrl("/globalindicesrealtime_xignite/xglobalindicesrealtime.json/GetRealTimeIndicesValue?IdentifierType=Symbol&Identifiers=" + realtimesymbols.join(",") + "&_fields=Index.Symbol,Index.IndexGroup,Value.Last,Value.PreviousClose");
				(function (places) {
					serverFetch(url, null, null, function (status, result) {
						if (status != 200) return;
						result = JSONparse(result);
						var count = 0;
						for (var s = 0; s < result.length; s++) {
							//if(count==limit) break;
							var requestData = tickerSymbolAccessor(places[count]);
							var item = result[s];
							if (!item.Index || !item.Value) {
								results[places[count]] = {
									"Symbol": requestData.name,
									"Ticker": requestData.symbol,
									"Delay": requestData.delay,
									"ListIndex": places[count],
									"Last": "N/A"
								};
								count++;
								continue;
							}
							item.Last = item.Value.Last;
							item.Previous = item.Value.PreviousClose;
							delete item.Value;
							item.Symbol = requestData.name;
							delete item.Index;
							item.Delay = requestData.delay;
							item.Ticker = requestData.symbol;
							item.ListIndex = places[count];
							results[places[count]] = item;
							count++;
						}
						for (var c = 0; c < limit; c++) {
							if (results[c] && !results[c].SortKey) {
								results[c].SortKey = -results[c].ListIndex;
								if (c < iLimit) setSectionData(indicesSection, results[c]);
								else setSectionData(tickerSection, results[c]);
							}
						}
						cb();
					});
				}(realtimeplaces));
			}
			if (delayedsymbols.length) {
				var url = makeUrl("/globalindices_xignite/xglobalindices.json/GetDelayedIndicesValue?IdentifierType=Symbol&Identifiers=" + delayedsymbols.join(",") + "&_fields=Index.Symbol,Index.IndexGroup,Value.Last,Value.PreviousClose");
				(function (places) {
					serverFetch(url, null, null, function (status, result) {
						if (status != 200) return;
						result = JSONparse(result);
						var count = 0;
						for (var s = 0; s < result.length; s++) {
							//if(count==limit) break;
							var requestData = tickerSymbolAccessor(places[count]);
							var item = result[s];
							if (!item.Index || !item.Value) {
								results[places[count]] = {
									"Symbol": requestData.name,
									"Ticker": requestData.symbol,
									"Delay": requestData.delay,
									"ListIndex": places[count],
									"Last": "N/A"
								};
								count++;
								continue;
							}
							item.Last = item.Value.Last;
							item.Previous = item.Value.PreviousClose;
							delete item.Value;
							item.Symbol = requestData.name;
							delete item.Index;
							item.Delay = requestData.delay;
							item.Ticker = requestData.symbol;
							item.ListIndex = places[count];
							results[places[count]] = item;
							count++;
						}
						for (var c = 0; c < limit; c++) {
							if (results[c] && !results[c].SortKey) {
								results[c].SortKey = -results[c].ListIndex;
								if (c < iLimit) setSectionData(indicesSection, results[c]);
								else setSectionData(tickerSection, results[c]);
							}
						}
						cb();
					});
				}(delayedplaces));
			}
			if (eodsymbols.length) {
				var url = makeUrl("/globalindiceshistorical_xignite/xglobalindiceshistorical.json/GetLastClosingIndicesValue?IdentifierType=Symbol&Identifiers=" + eodsymbols.join(",") + "&_fields=Index.Symbol,Index.IndexGroup,Value.Last,Value.PreviousClose");
				(function (places) {
					serverFetch(url, null, null, function (status, result) {
						if (status != 200) return;
						result = JSONparse(result);
						var count = 0;
						for (var s = 0; s < result.length; s++) {
							//if(count==limit) break;
							var requestData = tickerSymbolAccessor(places[count]);
							var item = result[s];
							if (!item.Index || !item.Value) {
								results[places[count]] = {
									"Symbol": requestData.name,
									"Ticker": requestData.symbol,
									"Delay": requestData.delay,
									"ListIndex": places[count],
									"Last": "N/A"
								};
								count++;
								continue;
							}
							item.Last = item.Value.Last;
							item.Previous = item.Value.PreviousClose;
							delete item.Value;
							item.Symbol = requestData.name;
							delete item.Index;
							item.Delay = requestData.delay;
							item.Ticker = requestData.symbol;
							item.ListIndex = places[count];
							results[places[count]] = item;
							count++;
						}
						for (var c = 0; c < limit; c++) {
							if (results[c] && !results[c].SortKey) {
								results[c].SortKey = -results[c].ListIndex;
								if (c < iLimit) setSectionData(indicesSection, results[c]);
								else setSectionData(tickerSection, results[c]);
							}
						}
						cb();
					});
				}(eodplaces));
			}
		} {
			var places = tickerSymbolAccessor("*", "STOCK");
			var symbols = [];
			for (var s = 0; s < places.length; s++) {
				var symbol = tickerSymbolAccessor(places[s]).symbol;
				if (symbol != "") symbols.push(symbol);
			}
			if (symbols.length) {
				var url = makeUrl("/globalquotes_xignite/v3/xGlobalQuotes.json/GetGlobalExtendedQuotes?IdentifierType=Symbol&Identifiers=" + symbols.join(",") + "&_fields=Security.Symbol,Last,PreviousClose");
				(function (places) {
					serverFetch(url, null, null, function (status, result) {
						if (status != 200) return;
						result = JSONparse(result);
						var count = 0;
						for (var s = 0; s < result.length; s++) {
							//if(count==limit) break;
							var requestData = tickerSymbolAccessor(places[count]);
							var item = result[s];
							if (!item.Security) continue;
							item.Previous = item.PreviousClose;
							delete item.PreviousClose;
							item.Symbol = requestData.name;
							delete item.Security;
							item.Delay = requestData.delay;
							item.Ticker = requestData.symbol;
							item.ListIndex = places[count];
							results[places[count]] = item;
							count++;
						}
						for (var c = 0; c < limit; c++) {
							if (results[c] && !results[c].SortKey) {
								results[c].SortKey = -results[c].ListIndex;
								if (c < iLimit) setSectionData(indicesSection, results[c]);
								else setSectionData(tickerSection, results[c]);
							}
						}
						cb();
					});
				}(places));
			}
		} {
			var places = tickerSymbolAccessor("*", "FOREX");
			var symbols = [];
			for (var s = 0; s < places.length; s++) {
				symbols.push(tickerSymbolAccessor(places[s]).symbol.substr(1));
			}
			var fixingTime = "21:00";
			if (getETUTCOffset(new Date()) == -300) fixingTime = "22:00";
			var endDate = new Date();
			endDate.setDate(endDate.getDate() + 1);
			var startDate = new Date(endDate);
			startDate.setDate(startDate.getDate() - 7);
			endDate = (endDate.getMonth() + 1) + "/" + endDate.getDate() + "/" + endDate.getFullYear() + " " + fixingTime;
			startDate = (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear() + " " + fixingTime;
			if (symbols.length) {
				for (var currCount = 0; currCount < symbols.length; currCount++) {
					var url = makeUrl("/chartiq_xignite/xGlobalCurrencies.json/GetChartBars?Symbol=" + symbols[currCount] + "&FixingTime=" + fixingTime + "&StartTime=" + startDate + "&EndTime=" + endDate + "&Period=1440&Precision=Minutes&PriceType=Bid&_fields=ChartBars.EndDate,ChartBars.Close");
					(function (places, currCount) {
						serverFetch(url, null, null, function (status, result) {
							if (status != 200) return;
							result = JSONparse(result);
							var item = {};
							for (var s = 0; s < result.ChartBars.length; s++) {
								var requestData = tickerSymbolAccessor(places[currCount]);
								var dateParts = result.ChartBars[s].EndDate.split("/");
								var d = new Date(dateParts[2], dateParts[0] - 1, dateParts[1], 0, 0, 0, 0);
								if (d.getDay() != 6) item.Previous = item.Last;
								item.Last = result.ChartBars[s].Close;
								item.Symbol = requestData.name;
								item.Delay = requestData.delay;
								item.Ticker = requestData.symbol;
								item.ListIndex = places[currCount];
							}
							if (item) {
								results[places[currCount]] = item;
							}
							for (var c = 0; c < limit; c++) {
								if (results[c] && !results[c].SortKey) {
									results[c].SortKey = -results[c].ListIndex;
									if (c < iLimit) setSectionData(indicesSection, results[c]);
									else setSectionData(tickerSection, results[c]);
								}
							}
							cb();
						});
					}(places, currCount));
				}
			}
		} {
			var places = tickerSymbolAccessor("*", "METAL");
			var symbols = [];
			for (var s = 0; s < places.length; s++) {
				symbols.push(tickerSymbolAccessor(places[s]).symbol.substr(1));
			}
			var fixingTime = "22:00";
			if (getETUTCOffset(new Date()) == -300) fixingTime = "23:00";
			var endDate = new Date();
			endDate.setDate(endDate.getDate() + 1);
			var startDate = new Date(endDate);
			startDate.setDate(startDate.getDate() - 7);
			endDate = (endDate.getMonth() + 1) + "/" + endDate.getDate() + "/" + endDate.getFullYear() + " " + fixingTime;
			startDate = (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear() + " " + fixingTime;
			if (symbols.length) {
				for (var metalCount = 0; metalCount < symbols.length; metalCount++) {
					var url = makeUrl("/globalmetals_xignite/xGlobalMetals.json/GetChartBars?Currency=&Symbol=" + symbols[metalCount] + "&FixingTime=" + fixingTime + "&StartTime=" + startDate + "&EndTime=" + endDate + "&Period=1440&Precision=Minutes&PriceType=Bid&_fields=ChartBars.EndDate,ChartBars.Close");
					(function (places, metalCount) {
						serverFetch(url, null, null, function (status, result) {
							if (status != 200) return;
							result = JSONparse(result);
							var item = {};
							for (var s = 0; s < result.ChartBars.length; s++) {
								var requestData = tickerSymbolAccessor(places[metalCount]);
								item.Previous = item.Last;
								item.Last = result.ChartBars[s].Close;
								item.Symbol = requestData.name;
								item.Delay = requestData.delay;
								item.Ticker = requestData.symbol;
								item.ListIndex = places[metalCount];
							}
							if (item) {
								results[places[metalCount]] = item;
							}
							for (var c = 0; c < limit; c++) {
								if (results[c] && !results[c].SortKey) {
									results[c].SortKey = -results[c].ListIndex;
									if (c < iLimit) setSectionData(indicesSection, results[c]);
									else setSectionData(tickerSection, results[c]);
								}
							}
							cb();
						});
					}(places, metalCount));
				}
			}
		} {
			var places = tickerSymbolAccessor("*", "FUTURE");
			var symbols = [];
			for (var s = 0; s < places.length; s++) {
				symbols.push(tickerSymbolAccessor(places[s]).symbol.substr(1));
			}
			if (symbols.length) {
				var url = makeUrl("/www_xignite/xFutures.json/GetDelayedSpots?Symbols=" + symbols.join(",") + "&_fields=Future.Symbol,Last,PreviousClose");
				(function (places) {
					serverFetch(url, null, null, function (status, result) {
						if (status != 200) return;
						result = JSONparse(result);
						var count = 0;
						for (var s = 0; s < result.length; s++) {
							//if(count==limit) break;
							var requestData = tickerSymbolAccessor(places[count]);
							var item = result[s];
							if (!item.Future) continue;
							item.Previous = item.PreviousClose;
							delete item.PreviousClose;
							item.Symbol = requestData.name;
							delete item.Future;
							item.Delay = requestData.delay;
							item.Ticker = requestData.symbol;
							item.ListIndex = places[count];
							results[places[count]] = item;
							count++;
						}
						for (var c = 0; c < limit; c++) {
							if (results[c] && !results[c].SortKey) {
								results[c].SortKey = -results[c].ListIndex;
								if (c < iLimit) setSectionData(indicesSection, results[c]);
								else setSectionData(tickerSection, results[c]);
							}
						}
						cb();
					});
				}(places));
			}
		}
	}
}

function fetchMarketHeadlines(section, limit, flags, cb) {
	if (!limit) return;
	if (needsEncryption && !setXigniteEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				fetchMarketHeadlines.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}
	if (flags & Market.Flags.HEADLINE) {
		var url = makeUrl("/globalnews_xignite/xGlobalNews.json/GetTopMarketSummaries?Count=" + limit + "&_fields=HeadlineSummaries.Title,HeadlineSummaries.Date,HeadlineSummaries.Time,HeadlineSummaries.UTCOffset,HeadlineSummaries.Source,HeadlineSummaries.Url,HeadlineSummaries.Images,HeadlineSummaries.Images.string,HeadlineSummaries.Summary");
		serverFetch(url, null, null, function (status, result) {
			if (status != 200) return;
			result = JSONparse(result);
			if (!result.HeadlineSummaries) return;
			var count = 0;
			for (var s = 0; s < result.HeadlineSummaries.length; s++) {
				var item = result.HeadlineSummaries[s];
				item.Subject = entityDecode(item.Title);
				delete item.Title;
				if (item.Images.length) item.Image = item.Images[0];
				delete item.Images;
				if (item.Image && location.protocol == "https:" && item.Image.indexOf("http:") == 0) {
					item.Image = "https:" + item.Image.substr(5);
				}
				if (item.Image) item.Image = entityDecode(item.Image);
				item.Date = new Date(item.Date + " " + item.Time);
				if (item.Time) item.Date.setMinutes(item.Date.getMinutes() - item.UTCOffset * 60 - item.Date.getTimezoneOffset());
				delete item.Time;
				setSectionHeadline(section, item);
				cb(++count == result.HeadlineSummaries.length);
				/*var url2=makeUrl("/globalnews_xignite/xGlobalNews.json/GetMarketNewsDetails?Reference="+encodeURI(item.Url)+"&_fields=Time");
				(function(item,stop){
					serverFetch(url2,null,null,function(status,result){
						if(status==200){
							result=JSONparse(result);
							if(result.Time) {
								item.Date=new Date(result.Time);
								item.Date.setMinutes(item.Date.getMinutes()-item.UTCOffset*60-item.Date.getTimezoneOffset());
							}
							delete item.UTCOffset;
							setSectionHeadline(section,item);
						}
						cb(++count==stop);
					});
				}(item,result.HeadlineSummaries.length));*/
			}
		});
	}
}

function fetchAdvanceDeclines(section, limit, flags, decliner, cb) {
	if (!limit) return;
	if (needsEncryption && !setXigniteEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				fetchAdvanceDeclines.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}
	if (flags & Market.Flags.DATA) {
		var url = makeUrl("/globalquotes_xignite/v3/xGlobalQuotes.json/GetTopMarketMovers?MarketMoverType=" + (decliner ? "PercentLosers" : "PercentGainers") + "&NumberOfMarketMovers=50&Exchanges=XNYS,XNAS,XASE,ARCX&_fields=Movers.Symbol,Movers.Last,Movers.ChangeFromPreviousClose");
		serverFetch(url, null, null, function (status, result) {
			if (status != 200) return;
			result = JSONparse(result);
			var count = 0;
			var items = [];
			if (result.Movers) {
				for (var s = 0; s < result.Movers.length; s++) {
					if (count == limit) break;
					var item = result.Movers[s];
					if (item.Last < 5) continue;
					item.Previous = item.Last - item.ChangeFromPreviousClose;
					if (decliner && item.Previous <= item.Last) continue; //error
					else if (!decliner && item.Previous >= item.Last) continue; //error
					delete item.ChangeFromPreviousClose;
					setSectionData(section, item, decliner);
					items.push(item.Symbol);
					count++;
				}
			}
			cb(flags);
			if (flags & Market.Flags.HEADLINE) {
				for (var s = 0; s < items.length; s++) {
					var url2 = makeUrl("/globalnews_xignite/xGlobalNews.json/GetTopSecuritySummaries?IdentifierType=Symbol&Identifier=" + items[s] + "&Count=1&_fields=Security.Symbol,HeadlineSummaries.Title,HeadlineSummaries.Date,HeadlineSummaries.Time,HeadlineSummaries.UTCOffset,HeadlineSummaries.Source,HeadlineSummaries.Url,HeadlineSummaries.Summary");
					(function (symbol) {
						serverFetch(url2, null, null, function (status, result) {
							if (status != 200) return;
							result = JSONparse(result);
							if (!result.HeadlineSummaries) {
								setSectionHeadline(section, {
									Symbol: symbol
								}, decliner);
								return;
							}
							for (var s = 0; s < result.HeadlineSummaries.length; s++) {
								var item = result.HeadlineSummaries[s];
								item.Symbol = result.Security.Symbol;
								item.Subject = entityDecode(item.Title);
								delete item.Title;
								item.Date = new Date(item.Date + " " + item.Time);
								if (item.Time) item.Date.setMinutes(item.Date.getMinutes() - item.UTCOffset * 60 - item.Date.getTimezoneOffset());
								delete item.Time;
								setSectionHeadline(section, item, decliner);
								cb(Market.Flags.HEADLINE);
								/*var url3=makeUrl("/globalnews_xignite/xGlobalNews.json/GetMarketNewsDetails?Reference="+encodeURI(item.Url)+"&_fields=Time,Summary");
								(function(item){
									serverFetch(url3,null,null,function(status,result){
										if(status!=200) return;
										result=JSONparse(result);
										//item.Summary=result.Summary;
										if(result.Time) {
											item.Date=new Date(result.Time);
											item.Date.setMinutes(item.Date.getMinutes()-item.UTCOffset*60-item.Date.getTimezoneOffset());
										}
										delete item.UTCOffset;
										setSectionHeadline(section,item,decliner);
										cb(Market.Flags.HEADLINE);
									});
								}(item));*/
							}
						});
					}(items[s]));
				}
			}
		});
	}
}

function fetchSectors(section, hSection, sLimit, mLimit, flags, cb) {
	if (!(sLimit + mLimit)) return;
	if (needsEncryption && !setXigniteEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				fetchSectors.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}
	if (flags & Market.Flags.DATA) {
		var sectorTickers = sectorSymbolTransform("*");
		var lasts = {}; //will need this later
		var url = makeUrl("/superquotes_xignite/xSuperQuotes.json/GetQuotes?IdentifierType=Symbol&Identifiers=" + sectorTickers + "&_fields=Identifier,Last,PreviousClose,DateTime,PreviousCloseDate");
		serverFetch(url, null, null, function (status, result) {
			if (status != 200) return;
			result = JSONparse(result);
			var count = 0;
			for (var s = 0; s < result.length; s++) {
				if (count == sLimit) break;
				var item = result[s];
				item.Previous = item.PreviousClose;
				delete item.PreviousClose;
				if (item.Identifier) item.Symbol = sectorSymbolTransform(item.Identifier);
				lasts[item.Symbol] = item.Last;
				delete item.Identifier;
				item.IsOpen = (item.DateTime.split(" ")[0] != item.PreviousCloseDate);
				delete item.PreviousCloseDate;
				delete item.DateTime;
				setSectionData(section, item);
				count++;
			}
			cb(false);
			var url2 = makeUrl("/globalquotes_xignite/v3/xGlobalQuotes.json/GetTopMarketMovers?MarketMoverType=MostActive&NumberOfMarketMovers=50&Exchanges=XNYS,XNAS,XASE,ARCX&_fields=Movers.Symbol,Movers.Last,Movers.ChangeFromPreviousClose");
			serverFetch(url2, null, null, function (status, result) {
				if (status != 200) return;
				result = JSONparse(result);
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
				var url3 = makeUrl("/factsetfundamentals_xignite/xFactSetFundamentals.json/GetLatestFundamentals?IdentifierType=Symbol&Identifiers=" + symbols.join(",") + "&FundamentalTypes=Industry&UpdatedSince=&_fields=Company.Symbol,Company.Sector,Company.Industry");
				(function (items) {
					serverFetch(url3, null, null, function (status, result) {
						if (status != 200) return;
						result = JSONparse(result);

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
							for (var s2 in section) {
								if (section[s2].Movers[mLimit - 1].Symbol == null && section[s2].Data.Symbol == sector) {
									setSectionData(section[s2].Movers, items[symbol]);
									break;
								}
							}
						}
						cb(true);
					});
				}(items));
			});
			var url4 = makeUrl("/factsetfundamentals_xignite/xFactSetFundamentals.json/GetLatestFundamentals?IdentifierType=Symbol&Identifiers=" + sectorTickers + "&FundamentalTypes=LastClose,PercentPriceChange1Week,PercentPriceChange4Weeks,PercentPriceChange13Weeks,PercentPriceChange26Weeks,PercentPriceChange52Weeks&UpdatedSince=&_fields=Company.Symbol,FundamentalsSets.Fundamentals.Type,FundamentalsSets.Fundamentals.Value");
			serverFetch(url4, null, null, function (status, result) {
				if (status != 200) return;
				result = JSONparse(result);

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
					if (result[s].Company) var symbol = sectorSymbolTransform(result[s].Company.Symbol);
					var historicals = {
						"52W": {},
						"26W": {},
						"13W": {},
						"4W": {},
						"1W": {}
					};
					var fs = result[s].FundamentalsSets;
					if (!fs) continue;
					for (var f = 0; f < fs.length; f++) {
						var fund = fs[f].Fundamentals;
						if (!fund) continue;
						for (var d = 0; d < fund.length; d++) {
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
								for (var h in historicals) {
									set(historicals[h], "last", fund[d].Value);
									historicals[h].Symbol = symbol;
								}
							}
						}
					}
					for (var h in historicals) {
						historicals[h].Last = lasts[historicals[h].Symbol];
						if (hSection[h] && historicals[h].Previous) setSectionData(hSection[h], historicals[h]);
					}
				}
				cb(true);
			});
		});
	}
}

function fetchEvents(section, limit, flags, cb) {
	if (!limit) return;
	if (needsEncryption && !setXigniteEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				fetchEvents.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}
	if (flags & Market.Flags.HEADLINE) {
		var start = new Date();
		start.setDate(start.getDate() - 1);
		var end = new Date(start);
		end.setDate(end.getDate() + 8);
		var url = makeUrl("/www_xignite/xCalendar.json/GetEventsByCountryCode?CountryCode=US&ReleasedOnStart=" + mmddyyyy(start) + "&ReleasedOnEnd=" + mmddyyyy(end) + "&_fields=Summaries.EventID,Summaries.EventName,Summaries.ReleasedOn");
		serverFetch(url, null, null, function (status, result) {
			if (status != 200) return;
			result = JSONparse(result);
			if (!result.Summaries) return;
			var count = 0;
			for (var s = 0; s < result.Summaries.length; s++) {
				if (count == limit) break;
				var item = result.Summaries[s];
				item.Subject = item.EventName;
				item.Summary = item.Description;
				delete item.EventName;
				item.Date = new Date(item.ReleasedOn);
				item.Date.setMinutes(item.Date.getMinutes() - getETUTCOffset(item.Date));
				if (isNaN(item.Date)) { //IE8 nonsense
					datePart = item.ReleasedOn.split("T")[0].split("-");
					timePart = item.ReleasedOn.split("T")[1].split(":");
					item.Date = new Date(datePart[0], datePart[1] - 1, datePart[2], timePart[0], timePart[1], 0, 0);
					item.Date.setMinutes(item.Date.getMinutes() - getETUTCOffset(item.Date) - item.Date.getTimezoneOffset());
				}
				var topOfHour = new Date(today);
				topOfHour.setHours(topOfHour.getHours(), 0, 0, 0);
				if (topOfHour > item.Date) continue;
				delete item.ReleasedOn;
				item.Symbol = item.EventID;
				delete item.EventID;
				if (item.Symbol.indexOf("SPK") == 0 && (item.Subject.indexOf("Federal ") != -1 || item.Subject.indexOf("Fed ") != -1)) { //fed speeches have wrong speakers!
					item.Subject = "Federal Reserve Bank Speech";
				}
				item.Url = null;
				item.SortKey = -item.Date.valueOf();
				item.Summary = "";
				setSectionHeadline(section, item);
				count++;
			}
			cb();
		});
	}
}

function fetchEventDetail(id, cb) {
	if (needsEncryption && !setXigniteEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				fetchEventDetail.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}
	var url = makeUrl("/www_xignite/xCalendar.json/GetEventDetails?EventID=" + id + "&_fields=Description");
	serverFetch(url, null, null, function (status, result) {
		if (status != 200) {
			cb();
			return;
		}
		result = JSONparse(result);
		cb(result.Description.replace(/''''/g, "'"));
	});
}

function fetchRates(section, limit, flags, cb) {
	if (!limit) return;
	if (needsEncryption && !setXigniteEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				fetchRates.apply(self, args);
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
	if (flags & Market.Flags.DATA) {
		var start = new Date();
		var end = new Date();
		var oneWeekAgo = new Date();
		start.setDate(start.getDate() - 12);
		start.setHours(0, 0, 0, 0);
		end.setDate(end.getDate() - 5);
		end.setHours(0, 0, 0, 0);
		oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
		oneWeekAgo.setMinutes(oneWeekAgo.getMinutes() + oneWeekAgo.getTimezoneOffset() - 60 * 4.5);
		for (var f in section) {
			var family = familyNames[f];
			if (!family) continue;
			(function (ciqfamily, xifamily) {
				var items = {};
				var url = makeUrl("/www_xignite/xRates.json/GetLatestRateFamily?RateFamilyType=" + xifamily + "&_fields=Type,Text");
				serverFetch(url, null, null, function (status, result) {
					if (status != 200) return;
					result = JSONparse(result);
					var count = 0;
					if (!result || !result.length) return;
					for (var s = 0; s < result.length; s++) {
						var r = result[s];
						if (count == limit) break;
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
					var url2 = makeUrl("/www_xignite/xRates.json/GetHistoricalRateFamily?RateFamilyType=" + xifamily + "&FromDate=" + mmddyyyy(start) + "&ToDate=" + mmddyyyy(end) + "&_fields=HistoricalInterestRate.Type,HistoricalInterestRate.Rates.Date,HistoricalInterestRate.Rates.Text");
					serverFetch(url2, null, null, function (status, result) {
						if (status != 200) return;
						result = JSONparse(result);
						//var count=0;
						if (!result.HistoricalInterestRate) return;
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
							setSectionData(section[ciqfamily], item);
							//count++;
						}
						cb();
					});
				});
			}(f, family));
		}
	}
}

function fetchForexQuote(section, hSection, item, cb) {
	if (needsEncryption && !setXigniteEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				fetchForexQuote.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}
	var symbol = item.Symbol.replace(/\^/, "");
	if ("XAU,XAG,XPT,XPD".indexOf(symbol.substr(0, 3)) > -1) {
		fetchMetalsQuote(section, hSection, item, cb);
		return;
	}
	var fixingTime = "9:00:00 PM";
	if (getETUTCOffset(new Date()) == -300) fixingTime = "10:00:00 PM";
	var endDate = new Date();
	endDate.setDate(endDate.getDate() + 1);
	var startDate = new Date(endDate);
	startDate.setDate(startDate.getDate() - 4);
	endDate = (endDate.getMonth() + 1) + "/" + endDate.getDate() + "/" + endDate.getFullYear() + " 23:59:59";
	startDate = (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear() + " 00:00:00";

	var url = makeUrl("/chartiq_xignite/xGlobalCurrencies.json/GetChartBars?Precision=Hours&PriceType=Bid&_fields=ChartBars.StartDate,ChartBars.StartTime,ChartBars.EndDate,ChartBars.EndTime,ChartBars.Close&Symbol=" + encodeURIComponent(symbol) + "&StartTime=" + encodeURIComponent(startDate) + "&EndTime=" + encodeURIComponent(endDate) + "&Period=1");
	serverFetch(url, null, null, function (status, result) {
		if (status != 200) return;
		result = JSONparse(result);
		var now = new Date();
		if (result.ChartBars) {
			for (var b = 0; b < result.ChartBars.length; b++) {
				var bar = result.ChartBars[b];
				if (b === 0) item.Previous = bar.Close;
				else if (bar.StartTime == fixingTime) item.Previous = item.Last;
				item.Last = bar.Close;
				item.Change = item.Last - item.Previous;
				item.PercentChange = 100 * item.Change / item.Previous;
			}
			var lastBar = result.ChartBars[result.ChartBars.length - 1];
			if (lastBar.EndDate) {
				var dateParts = lastBar.EndDate.split("/");
				item.Date = new Date(dateParts[2], dateParts[0] - 1, dateParts[1]);
			}
			if (item.Date && lastBar.EndTime) {
				var timeParts = lastBar.EndTime.split(" ")[0].split(":");
				var ampm = lastBar.EndTime.split(" ")[1];
				if (timeParts[0] % 12 == 0) timeParts[0] = Number(timeParts[0]) - 12;
				if (ampm == "PM") timeParts[0] = Number(timeParts[0]) + 12;
				item.Date.setHours(timeParts[0]);
				item.Date.setMinutes(timeParts[1]);
				item.Date.setSeconds(timeParts[2]);
				item.Date.setMilliseconds(0);
				item.Date.setMinutes(item.Date.getMinutes() - item.Date.getTimezoneOffset());
			}
			if (item.Date.getTime() > now.getTime()) item.Date = now;
		}
		var url2 = makeUrl("/chartiq_xignite/xGlobalCurrencies.json/ConvertRealTimeValue?From=" + symbol.substr(0, 3) + "&To=" + symbol.substr(3, 3) + "&Amount=0&_fields=FromCurrencyName,ToCurrencyName");
		serverFetch(url2, null, null, function (status, result) {
			if (status != 200) return;
			result = JSONparse(result);
			if (result && result.FromCurrencyName && result.ToCurrencyName) {
				item.Name = item.Description = result.FromCurrencyName + " / " + result.ToCurrencyName;
			}
			if (!hSection) {
				setSectionData(section, item);
				cb();
				return;
			}
			endDate = new Date();
			startDate = (endDate.getMonth() + 1) + "/" + endDate.getDate() + "/" + (endDate.getFullYear() - 1) + " " + fixingTime;
			endDate.setDate(endDate.getDate() + 1);
			endDate = (endDate.getMonth() + 1) + "/" + endDate.getDate() + "/" + endDate.getFullYear() + " " + fixingTime;
			var url3 = makeUrl("/chartiq_xignite/xGlobalCurrencies.json/GetChartBars?Precision=Hours&PriceType=Bid&_fields=ChartBars.High,ChartBars.Low&Symbol=" + encodeURIComponent(symbol) + "&StartTime=" + encodeURIComponent(startDate) + "&EndTime=" + encodeURIComponent(endDate) + "&Period=8784");
			serverFetch(url3, null, null, function (status, result) {
				if (status != 200) return;
				result = JSONparse(result);
				if (result && result.ChartBars) {
					var bar52 = result.ChartBars[0];
					if (bar52 && bar52.High) item.FiftyTwoWeekHigh = bar52.High;
					if (bar52 && bar52.Low) item.FiftyTwoWeekLow = bar52.Low;
				}
				setSectionData(section, item);
				cb();
			});
		});
	});
}

function fetchMetalsQuote(section, hSection, item, cb) {
	if (needsEncryption && !setXigniteEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				fetchMetalsQuote.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}
	var fixingTime = "10:00:00 PM";
	if (getETUTCOffset(new Date()) == -300) fixingTime = "11:00:00 PM";
	var endDate = new Date();
	endDate.setDate(endDate.getDate() + 1);
	var startDate = new Date(endDate);
	startDate.setDate(startDate.getDate() - 4);
	endDate = (endDate.getMonth() + 1) + "/" + endDate.getDate() + "/" + endDate.getFullYear();
	startDate = (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear();
	var symbol = item.Symbol.replace(/\^/, "");

	var url = makeUrl("/chartiq_xignite/xGlobalMetals.json/GetChartBars?Precision=Hours&PriceType=Bid&_fields=ChartBars.StartDate,ChartBars.StartTime,ChartBars.EndDate,ChartBars.EndTime,ChartBars.Close&Currency=&Symbol=" + encodeURIComponent(symbol) + "&StartTime=" + encodeURIComponent(startDate + " 00:00:00") + "&EndTime=" + encodeURIComponent(endDate + " 23:59:59") + "&Period=1");
	if (symbol.substr(3, 3) != "USD") url = makeUrl("/globalmetals_xignite/xGlobalMetals.json/GetHistoricalMetalQuotesRange?Symbol=" + encodeURIComponent(symbol) + "&Currency=&StartDate=" + encodeURIComponent(startDate) + "&EndDate=" + encodeURIComponent(endDate) + "&FixingTime=" + encodeURIComponent(fixingTime) + "&PeriodType=Daily&PriceType=Bid&_fields=EndDate,EndTime,Close");
	serverFetch(url, null, null, function (status, result) {
		if (status != 200) return;
		result = JSONparse(result);
		var now = new Date();
		var lastBar = null;
		if (result.ChartBars) {
			for (var b = 0; b < result.ChartBars.length; b++) {
				var bar = result.ChartBars[b];
				if (b === 0) item.Previous = bar.Close;
				else if (bar.StartTime == fixingTime) item.Previous = item.Last;
				item.Last = bar.Close;
				item.Change = item.Last - item.Previous;
				item.PercentChange = 100 * item.Change / item.Previous;
			}
			lastBar = result.ChartBars[result.ChartBars.length - 1];
		} else if (result) {
			lastBar = result[result.length - 1];
			if (lastBar) item.Last = lastBar.Close;
			if (result[result.length - 2]) item.Previous = result[result.length - 2].Close;
			item.Change = item.Last - item.Previous;
			item.PercentChange = 100 * item.Change / item.Previous;
		}
		if (lastBar) {
			if (lastBar.EndDate) {
				var dateParts = lastBar.EndDate.split("/");
				item.Date = new Date(dateParts[2], dateParts[0] - 1, dateParts[1]);
			}
			if (item.Date && lastBar.EndTime) {
				var timeParts = lastBar.EndTime.split(" ")[0].split(":");
				var ampm = lastBar.EndTime.split(" ")[1];
				if (timeParts[0] % 12 == 0) timeParts[0] = Number(timeParts[0]) - 12;
				if (ampm == "PM") timeParts[0] = Number(timeParts[0]) + 12;
				item.Date.setHours(timeParts[0]);
				item.Date.setMinutes(timeParts[1]);
				item.Date.setSeconds(timeParts[2]);
				item.Date.setMilliseconds(0);
				item.Date.setMinutes(item.Date.getMinutes() - item.Date.getTimezoneOffset());
			}
			if (item.Date.getTime() > now.getTime()) item.Date = now;
		}
		var url2 = makeUrl("/chartiq_xignite/xGlobalCurrencies.json/ConvertRealTimeValue?From=USD&To=" + symbol.substr(3, 3) + "&Amount=0&_fields=FromCurrencyName,ToCurrencyName");
		serverFetch(url2, null, null, function (status, result) {
			if (status != 200) return;
			result = JSONparse(result);
			if (result && result.FromCurrencyName && result.ToCurrencyName) {
				item.Name = item.Description = symbol.substr(0, 3) + " / " + result.ToCurrencyName;
			}
			//only xxxUSD available in this api, so use GetHistoricalMetalQuotesRange otherwise
			endDate = new Date();
			startDate = (endDate.getMonth() + 1) + "/" + endDate.getDate() + "/" + (endDate.getFullYear() - 1);
			endDate.setDate(endDate.getDate() + 1);
			endDate = (endDate.getMonth() + 1) + "/" + endDate.getDate() + "/" + endDate.getFullYear();
			var url3 = makeUrl("/chartiq_xignite/xGlobalMetals.json/GetChartBars?&Precision=Hours&PriceType=Bid&_fields=ChartBars.High,ChartBars.Low&Currency=&Symbol=" + encodeURIComponent(symbol) + "&StartTime=" + encodeURIComponent(startDate + " " + fixingTime) + "&EndTime=" + encodeURIComponent(endDate + " " + fixingTime) + "&Period=8784");
			if (symbol.substr(3, 3) != "USD") url3 = makeUrl("/globalmetals_xignite/xGlobalMetals.json/GetHistoricalMetalQuotesRange?Symbol=" + encodeURIComponent(symbol) + "&Currency=&StartDate=" + encodeURIComponent(startDate) + "&EndDate=" + encodeURIComponent(endDate) + "&FixingTime=" + encodeURIComponent(fixingTime) + "&PeriodType=Yearly&PriceType=Bid&_fields=Name,High,Low");
			serverFetch(url3, null, null, function (status, result) {
				if (status != 200) return;
				result = JSONparse(result);
				if (result && result.ChartBars) {
					var bar52 = result.ChartBars[0];
					if (bar52 && bar52.High) item.FiftyTwoWeekHigh = bar52.High;
					if (bar52 && bar52.Low) item.FiftyTwoWeekLow = bar52.Low;
				} else if (result && result[0]) {
					if (result[0].High) item.FiftyTwoWeekHigh = result[0].High;
					if (result[0].Low) item.FiftyTwoWeekLow = result[0].Low;
					if (result[0].Name) {
						var name = item.Name.split(" / ");
						name[0] = result[0].Name;
						item.Name = item.Description = name.join(" / ");
					}
					setSectionData(section, item);
					cb();
					return;
				}
				var url4 = makeUrl("/chartiq_xignite/xGlobalMetals.json/GetRealTimeMetalQuote?Symbol=" + symbol + "&Currency=&_fields=Name");
				serverFetch(url4, null, null, function (status, result) {
					if (status != 200) return;
					result = JSONparse(result);
					if (result && result.Name) {
						var name = item.Name.split(" / ");
						name[0] = result.Name;
						item.Name = item.Description = name.join(" / ");
					}
					setSectionData(section, item);
					cb();
				});
			});
		});
	});
}

function fetchIndexQuote(section, hSection, item, cb, delay) {
	if (needsEncryption && !setXigniteEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				fetchIndexQuote.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}
	var url = delay == 0 ? makeUrl("/globalindiceshistorical_xignite/xglobalindiceshistorical.json/GetLastClosingIndexValue?IdentifierType=Symbol&_fields=Index.IndexName,Value.Date,Value.UTCOffset,Value.Close,Value.Volume,Value.PreviousClose,Value.ChangeFromPreviousClose,Value.PercentChangeFromPreviousClose&Identifier=" + encodeURIComponent(symbol)) : delay == 1 ? makeUrl("/globalindices_xignite/xglobalindices.json/GetDelayedIndexValue?IdentifierType=Symbol&_fields=Index.IndexName,Value.Date,Value.Time,Value.UTCOffset,Value.Last,Value.High,Value.Low,Value.Volume,Value.PreviousClose,Value.ChangeFromPreviousClose,Value.PercentChangeFromPreviousClose&Identifier=" + encodeURIComponent(symbol)) : makeUrl("/globalindicesrealtime_xignite/xglobalindicesrealtime.json/GetRealTimeIndexValue?IdentifierType=Symbol&_fields=Index.IndexName,Value.Date,Value.Time,Value.UTCOffset,Value.Last,Value.High,Value.Low,Value.Volume,Value.PreviousClose,Value.ChangeFromPreviousClose,Value.PercentChangeFromPreviousClose&Identifier=" + encodeURIComponent(symbol));

	serverFetch(url, null, null, function (status, result) {
		if (delay && status != 200) {
			fetchIndexQuote(section, hSection, item, cb, --delay);
			return;
		}
		result = JSONparse(result);
		var now = new Date();
		if (result.Index) item.Name = result.Index.IndexName;
		if (result.Value) {
			item.Last = result.Value.Close || result.Value.Last;
			item.Volume = result.Value.Volume;
			item.Change = result.Value.ChangeFromPreviousClose;
			item.PercentChange = result.Value.PercentChangeFromPreviousClose;
			if (result.Value.High) item.FiftyTwoWeekHigh = result.Value.High;
			if (result.Value.Low) item.FiftyTwoWeekLow = result.Value.Low;

			if (result.Value.Date) {
				var dateParts = result.Value.Date.split("/");
				item.Date = new Date(dateParts[2], dateParts[0] - 1, dateParts[1]);
				var timeParts = [23, 59, 59];
				if (result.Value.Time) {
					timeParts = result.Value.Time.split(" ")[0].split(":");
					var ampm = result.Value.Time.split(" ")[1];
					if (timeParts[0] % 12 == 0) timeParts[0] = Number(timeParts[0]) - 12;
					if (ampm == "PM") timeParts[0] = Number(timeParts[0]) + 12;
				}
				result.Value.Date.split("/");
				item.Date.setHours(timeParts[0]);
				item.Date.setMinutes(timeParts[1]);
				item.Date.setSeconds(timeParts[2]);
				item.Date.setMilliseconds(0);
				item.Date.setMinutes(item.Date.getMinutes() - item.Date.getTimezoneOffset() - result.Value.UTCOffset * 60);
			}
			if (!hSection) {
				setSectionData(section, item);
				cb();
				return;
			}
			if (item.Date.getTime() > now.getTime()) item.Date = now;
			var url2 = makeUrl("/globalindiceshistorical_xignite/xglobalindiceshistorical.json/GetHistoricalIndexValuesTrailing?IdentifierType=Symbol&PeriodType=Day&_fields=Values.High,Values.Low,Values.Volume&Identifier=" + encodeURIComponent(symbol) + "&EndDate=" + encodeURIComponent(result.Value.Date) + "&Periods=366");
			serverFetch(url2, null, null, function (status, result) {
				if (status != 200) return;
				result = JSONparse(result);
				if (result && result.Values && result.Values.length) {
					for (var b = 0; b < result.Values.length; b++) {
						var bar = result.Values[b];
						item.FiftyTwoWeekHigh = Math.max(bar.High, item.FiftyTwoWeekHigh ? item.FiftyTwoWeekHigh : bar.High);
						item.FiftyTwoWeekLow = Math.min(bar.Low, item.FiftyTwoWeekLow ? item.FiftyTwoWeekLow : bar.Low);
						//Last volume is second to last bar, or last bar if it differs from current bar
						if (b >= result.Values.length - 2 && bar.Volume != item.Volume) {
							item.VolumePrevious = bar.Volume;
							item.VolumeChange = Number(item.Volume) - Number(item.VolumePrevious);
							item.VolumePercentChange = 100 * (Number(item.Volume) / Number(item.VolumePrevious) - 1);
						}
					}
				}
				setSectionData(section, item);
				cb();
			});
		} else {
			if (delay) {
				fetchIndexQuote(section, hSection, item, cb, --delay);
				return;
			} else {
				setSectionData(section, item);
				cb();
			}
		}
	});
}

function processXigniteFundamentals(stock) {
	if (stock) {
		_.each(XigniteFundamentals.FundamentalDescriptions, function (value) {
			XF[value.Type] = value;
		});
	} else {
		_.each(XigniteFundFundamentals.FundamentalDescriptions, function (value) {
			XFF[value.Type] = value;
		});
	}
}


// if stock == false, builds for fund
function buildFundamentalList(stock, data) {
	var fundamentals;
	if (stock) fundamentals = requestToXigniteFundamentalsMap;
	else fundamentals = requestToXigniteFundFundamentalsMap;

	var data2 = {};

	// special cases
	_.each(data, function(value, key) {
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
		processXigniteFundamentals(stock);
		var F = {};
		if (stock) F = XF;
		else F = XFF;
		var moreFundamentals = _.intersection(_.keys(F), unmappedFundamentals);
		mappedFundamentals = _.concat(mappedFundamentals, moreFundamentals);
	}

	return _.join(mappedFundamentals);

	// TODO - for everything else, check if the request matches the Xignite list above and add it. TODO - tried to add everything and the request bombed 9000 character long url :). Need to find limits.

}

function isMutual(symbol) {
	if (symbol.length < 5 || symbol.length > 6) return false;
	if (symbol[symbol.length - 1] != "X") return false;
	for (var j = 0; j < symbol.length; j++) {
		if (symbol[j] < 'A' || symbol[j] > 'Z') return false;
	}
	return true;
}

function fetchStockFundamentals(symbol, fundamentalList, item, cb) {
	if(!item) item = {};
	fundamentalList = fundamentalList.stock;
	var url4 = makeUrl("/factsetfundamentals_xignite/xFactSetFundamentals.json/GetLatestFundamentals?IdentifierType=Symbol&Identifiers=" + encodeURIComponent(symbol) + "&FundamentalTypes=" + buildFundamentalList(true, fundamentalList) + "&UpdatedSince=&_fields=FundamentalsSets.Fundamentals.Type,FundamentalsSets.Fundamentals.Value,FundamentalsSets.Fundamentals.Unit");
	serverFetch(url4, null, null, function (status, result) {
		result = JSONparse(result);

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
						fund[d].Value = commaInt(fund[d].Value);
					}
					if (fund[d].Unit == 'Percent') {
						fund[d].Value += '%';
					}

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
						var key = _.findKey(requestToXigniteFundamentalsMap, _.partial(_.isEqual, fund[d].Type));
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
		cb(item);
	});

}

function fetchFundFundamentals(symbol, instrumentType, fundamentalList, item, cb) {
	if (!item) item = {};
	if (instrumentType == "Fund" || instrumentType == "ExchangeTradedFund") {
		item.isMutual = isMutual(symbol);
		item.isETF = (instrumentType == "ExchangeTradedFund");
		if (!item.isMutual && !item.isETF) item.isCEF = true;
		if (item.isETF || item.isCEF) fList = fundamentalList.etf;
		else fList = fundamentalList.fund;
		var url3 = makeUrl("/fundfundamentals_xignite/xFundFundamentals.json/GetFundFundamentalList?IdentifierType=Symbol&Identifier=" + encodeURIComponent(symbol) + "&FundamentalTypes=" + buildFundamentalList(false, fList) + "&UpdatedSince=&_fields=Fundamentals.Type,Fundamentals.Value");

		serverFetch(url3, null, null, function (status, result) {
			result = JSONparse(result);
			var fund = result.Fundamentals;
			if (fund) {
				for (var d = 0; d < fund.length; d++) {
					if (fund[d].Type == "FundManagersProfile") {
						var xmlDom = xmlToDom(fund[d].Value);
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
						var xmlDom = xmlToDom(fund[d].Value);
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
						var key = _.findKey(requestToXigniteFundFundamentalsMap, _.partial(_.isEqual, fund[d].Type));
						if (typeof key !== 'undefined') {
							item[key] = fund[d].Value;
						} else {
							item[fund[d].Type] = fund[d].Value;
						}
					}
				}
			}
			if (item.isMutual) cb(item);
			else fetchStockFundamentals(symbol, fundamentalList, item, cb);
		});
	}

}

function fetchDetailedQuotev2(symbol, fundamentalList, quoteCB, fundamentalsCB) {
	if (symbol == "") return;
	if (needsEncryption && !setXigniteEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				fetchDetailedQuote.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}

	if (symbol.length == 7 && symbol.indexOf("^") == 0) {
		fetchForexQuote(section, hSection, {
			Symbol: symbol,
			Name: "[No Description Found]"
		}, cb);
		return;
	} else if (symbol.indexOf(".IND") > 0 || symbol.indexOf("^") == 0) {
		fetchIndexQuote(section, hSection, {
			Symbol: symbol,
			Name: "[No Description Found]"
		}, cb, getIndexEntitlement(symbol));
		return;
	}

	var url = makeUrl("/superquotes_xignite/xSuperQuotes.json/GetQuote?IdentifierType=Symbol&Identifier=" + encodeURIComponent(symbol) + "&_fields=Name,Identifier,DateTime,UTCOffset,Last,Volume,PreviousClose,Change,PercentChange,High,Low,InstrumentType");
	serverFetch(url, null, null, function (status, result) {
		if (status != 200) return;
		result = JSONparse(result);
		var item = {};
		item.Symbol = symbol;
		if (!result.Identifier) return;
		item.Last = result.Last;
		//Note on these next 5 values: they do not reflect splits which happen today.
		//The fundamentals reflect the splits but they do daily reset too early.
		//Maybe Xignite can take a look.
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
			item.Date.setMinutes(item.Date.getMinutes() - getETUTCOffset(item.Date));
			if (isNaN(item.Date)) { //IE8 nonsense
				datePart = result.DateTime.split(" ")[0].split("-");
				timePart = result.DateTime.split(" ")[1].split(":");
				item.Date = new Date(datePart[0], datePart[1] - 1, datePart[2], timePart[0], timePart[1], 0, 0);
				if (result.InstrumentType && result.InstrumentType == "Fund" && item.Date.getHours() === 0) //12:00 am reported
					item.Date.setHours(20);
				item.Date.setMinutes(item.Date.getMinutes() - getETUTCOffset(item.Date) - item.Date.getTimezoneOffset());
			}
		} else if (symbol.length == 6) {
			fetchForexQuote(section, hSection, item, cb);
			return;
		}

		if (result.InstrumentType == "Fund" && isMutual(symbol)) {
			var endDate = new Date();
			var startDate = (endDate.getMonth() + 1) + "/" + endDate.getDate() + "/" + (endDate.getFullYear() - 1);
			endDate.setDate(endDate.getDate() + 1);
			endDate = (endDate.getMonth() + 1) + "/" + endDate.getDate() + "/" + endDate.getFullYear();
			item.FiftyTwoWeekHigh = item.FiftyTwoWeekLow = item.Last;
			var url2 = makeUrl("/www_xignite/xglobalhistorical.json/GetGlobalHistoricalQuotesRange?IdentifierType=Symbol&_fields=GlobalQuotes.Last&Identifier=" + encodeURIComponent(symbol) + "&StartDate=" + encodeURIComponent(startDate) + "&EndDate=" + encodeURIComponent(endDate) + "&AdjustmentMethod=None");
			serverFetch(url2, null, null, function (status, result) {
				if (status != 200) return;
				result = JSONparse(result);
				if (result && result.GlobalQuotes && result.GlobalQuotes.length) {
					for (var l = 0; l < result.GlobalQuotes.length; l++) {
						var last = result.GlobalQuotes[l].Last;
						item.FiftyTwoWeekHigh = Math.max(last, item.FiftyTwoWeekHigh ? item.FiftyTwoWeekHigh : last);
						item.FiftyTwoWeekLow = Math.min(last, item.FiftyTwoWeekLow ? item.FiftyTwoWeekLow : last);
					}
				}
				quoteCB(item);
			});
		} else {
			quoteCB(item);
		}

		if (fundamentalList) {
			if (fundamentalList.fund && (result.InstrumentType=="Fund" || result.InstrumentType=="ExchangeTradedFund")) fetchFundFundamentals(symbol, result.InstrumentType, fundamentalList, item, fundamentalsCB);
			else if (fundamentalList.stock && result.InstrumentType!="Fund" && result.InstrumentType!="ExchangeTradedFund") fetchStockFundamentals(symbol, fundamentalList, item, fundamentalsCB);
		}
	});
}

function fetchDetailedQuote(section, hSection, symbol, limit, ilimit, flags, cb) {
	if (!limit || symbol == "") return;
	if (needsEncryption && !setXigniteEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				fetchDetailedQuote.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}

	if (symbol.length == 7 && symbol.indexOf("^") == 0) {
		fetchForexQuote(section, hSection, {
			Symbol: symbol,
			Name: "[No Description Found]"
		}, cb);
		return;
	} else if (symbol.indexOf(".IND") > 0 || symbol.indexOf("^") == 0) {
		fetchIndexQuote(section, hSection, {
			Symbol: symbol,
			Name: "[No Description Found]"
		}, cb, getIndexEntitlement(symbol));
		return;
	}
	var url = makeUrl("/superquotes_xignite/xSuperQuotes.json/GetQuote?IdentifierType=Symbol&Identifier=" + encodeURIComponent(symbol) + "&_fields=Name,Identifier,DateTime,UTCOffset,Last,Volume,PreviousClose,Change,PercentChange,High,Low,InstrumentType");
	serverFetch(url, null, null, function (status, result) {
		if (status != 200) return;
		result = JSONparse(result);
		var item = {};
		item.Symbol = symbol;
		if (!result.Identifier) return;
		item.Last = result.Last;
		//Note on these next 5 values: they do not reflect splits which happen today.
		//The fundamentals reflect the splits but they do daily reset too early.
		//Maybe Xignite can take a look.
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
			item.Date.setMinutes(item.Date.getMinutes() - getETUTCOffset(item.Date));
			if (isNaN(item.Date)) { //IE8 nonsense
				datePart = result.DateTime.split(" ")[0].split("-");
				timePart = result.DateTime.split(" ")[1].split(":");
				item.Date = new Date(datePart[0], datePart[1] - 1, datePart[2], timePart[0], timePart[1], 0, 0);
				if (result.InstrumentType && result.InstrumentType == "Fund" && item.Date.getHours() === 0) //12:00 am reported
					item.Date.setHours(20);
				item.Date.setMinutes(item.Date.getMinutes() - getETUTCOffset(item.Date) - item.Date.getTimezoneOffset());
			}
		} else if (symbol.length == 6) {
			fetchForexQuote(section, hSection, item, cb);
			return;
		}
		setSectionData(section, item);
		if (!hSection) {
			item.FiftyTwoWeekHigh = item.FiftyTwoWeekLow = null;
			cb();
			return;
		}
		if (result.InstrumentType == "Fund" || result.InstrumentType == "ExchangeTradedFund") {
			item.isETF = (result.InstrumentType == "ExchangeTradedFund");
			if (!isETF) item.isCEF = true;
			var endDate = new Date();
			var startDate = (endDate.getMonth() + 1) + "/" + endDate.getDate() + "/" + (endDate.getFullYear() - 1);
			endDate.setDate(endDate.getDate() + 1);
			endDate = (endDate.getMonth() + 1) + "/" + endDate.getDate() + "/" + endDate.getFullYear();
			item.FiftyTwoWeekHigh = item.FiftyTwoWeekLow = item.Last;
			var url2 = makeUrl("/www_xignite/xglobalhistorical.json/GetGlobalHistoricalQuotesRange?IdentifierType=Symbol&_fields=GlobalQuotes.Last&Identifier=" + encodeURIComponent(symbol) + "&StartDate=" + encodeURIComponent(startDate) + "&EndDate=" + encodeURIComponent(endDate) + "&AdjustmentMethod=None");
			serverFetch(url2, null, null, function (status, result) {
				if (status != 200) return;
				result = JSONparse(result);
				if (result && result.GlobalQuotes && result.GlobalQuotes.length) {
					for (var l = 0; l < result.GlobalQuotes.length; l++) {
						var last = result.GlobalQuotes[l].Last;
						item.FiftyTwoWeekHigh = Math.max(last, item.FiftyTwoWeekHigh ? item.FiftyTwoWeekHigh : last);
						item.FiftyTwoWeekLow = Math.min(last, item.FiftyTwoWeekLow ? item.FiftyTwoWeekLow : last);
					}
				}
				setSectionData(section, item);
				var url3 = makeUrl("/fundfundamentals_xignite/xFundFundamentals.json/GetFundFundamentalList?IdentifierType=Symbol&Identifier=" + encodeURIComponent(symbol) + "&FundamentalTypes=" + buildFundamentalList(false, section[0].Data) + "&UpdatedSince=&_fields=Fundamentals.Type,Fundamentals.Value");
				(function (item) {
					serverFetch(url3, null, null, function (status, result) {
						result = JSONparse(result);
						var fund = result.Fundamentals;
						if (fund) {
							for (var d = 0; d < fund.length; d++) {
								if (fund[d].Type == "FundManagersProfile") {
									var xmlDom = xmlToDom(fund[d].Value);
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
									var xmlDom = xmlToDom(fund[d].Value);
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
									var key = _.findKey(requestToXigniteFundFundamentalsMap, _.partial(_.isEqual, fund[d].Type));
									if (typeof key !== 'undefined') {
										item[key] = fund[d].Value;
									} else {
										item[fund[d].Type] = fund[d].Value;
									}
								}
							}
						}
						setSectionData(section, item);
						cb();
					});
				}(item));
			});
			return;
		}
		var url4 = makeUrl("/factsetfundamentals_xignite/xFactSetFundamentals.json/GetLatestFundamentals?IdentifierType=Symbol&Identifiers=" + encodeURIComponent(symbol) + "&FundamentalTypes=" + buildFundamentalList(true, section[0].Data) + "&UpdatedSince=&_fields=FundamentalsSets.Fundamentals.Type,FundamentalsSets.Fundamentals.Value,FundamentalsSets.Fundamentals.Unit");
		(function (item) {
			serverFetch(url4, null, null, function (status, result) {
				result = JSONparse(result);

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
								var key = _.findKey(requestToXigniteFundamentalsMap, _.partial(_.isEqual, fund[d].Type));
								if (typeof key !== 'undefined') {
									item[key] = fund[d].Value;
								} else {
									item[fund[d].Type] = fund[d].Value;
								}
							}
						}
					}
					setSectionData(section, item);
					if (item.Last) {
						for (var h in historicals) {
							historicals[h].Last = item.Last;
							historicals[h].Change = historicals[h].Last - historicals[h].Previous;
							historicals[h].PercentChange = 100 * historicals[h].Change / historicals[h].Previous;
							if (hSection[h]) setSectionData(hSection[h], historicals[h]);
						}
					}
					/* removed - works well for splits but resets at midnight - too early
					//override in case of split
					item.Change=historicals["1D"].Change;
					item.PercentChange=historicals["1D"].PercentChange;
					*/
					if (!ilimit) {
						setSectionData(section, item);
						cb();
						return;
					}
				}
				cb();
			});
		}(item));
	});
}

function fetchSecurityEvents(section, symbol, limit, flags, cb) {
	if (!limit) return;
	if (needsEncryption && !setXigniteEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				fetchSecurityEvents.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}
	if (flags & Quote.Flags.HEADLINE) {
		var url = makeUrl("/www_xignite/xEarningsCalendar.json/GetEarningCalendarItemsAsString?Types=NextEarningDate,NextEarningTime,EarningConfirmationDate,LastEarningUpdateDate,Q1EarningDate,Q2EarningDate,Q3EarningDate,Q4EarningDate,ConferenceCallTime,ReplayDate,ReplayEndDate,ReplayWebcastEndDate,BoardOfDirectorMeetingDate,DividendAnnouncementDate,DividendRecordDate,DividendPayDate,LastXDividendDate&IdentifierType=Symbol&Identifier=" + encodeURIComponent(symbol) + "&_fields=Items.Name,Items.ValueType,Items.Value");
		serverFetch(url, null, null, function (status, result) {
			if (status != 200) return;
			result = JSONparse(result);
			if (!result.Items) {
				cb();
				return;
			}
			var count = 0;
			var midnight = new Date(today);
			midnight.setHours(0, 0, 0, 0);
			for (var s = 0; s < result.Items.length; s++) {
				//if(count==limit) break;
				var item = result.Items[s];
				if (item.Value == null) continue;
				item.Symbol = item.Name;
				item.Subject = item.Name;
				delete item.Name;
				if (item.ValueType != "Date") continue;
				delete item.ValueType;
				var dateParts = item.Value.split("/");
				item.Date = new Date(dateParts[2], dateParts[0] - 1, dateParts[1]);
				if (isNaN(item.Date) || midnight > item.Date) continue;
				delete item.Value;
				item.Url = null;
				item.SortKey = -item.Date;
				setSectionHeadline(section, item);
				count++;
			}
			cb();
		});
	}
}

function fetchSecurityHeadlines(section, symbol, limit, flags, cb) {
	if (!limit) return;
	if (needsEncryption && !setXigniteEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				fetchSecurityHeadlines.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}
	if (flags & Quote.Flags.HEADLINE) {
		var url = makeUrl("/globalnews_xignite/xGlobalNews.json/GetTopSecuritySummaries?IdentifierType=Symbol&Identifier=" + encodeURIComponent(symbol) + "&Count=" + limit + "&_fields=HeadlineSummaries.Title,HeadlineSummaries.Date,HeadlineSummaries.Time,Headlines.UTCOffset,HeadlineSummaries.Source,HeadlineSummaries.Url,HeadlineSummaries.Images,HeadlineSummaries.Images.string,HeadlineSummaries.Summary");
		serverFetch(url, null, null, function (status, result) {
			if (status != 200) return;
			result = JSONparse(result);
			if (!result.HeadlineSummaries) {
				cb(true);
				return;
			}
			var count = 0;
			for (var s = 0; s < result.HeadlineSummaries.length; s++) {
				var item = result.HeadlineSummaries[s];
				item.Subject = entityDecode(item.Title);
				delete item.Title;
				if (item.Images.length) item.Image = item.Images[0];
				delete item.Images;
				if (item.Image && location.protocol == "https:" && item.Image.indexOf("http:") == 0) {
					item.Image = "https:" + item.Image.substr(5);
				}
				if (item.Image) item.Image = entityDecode(item.Image);
				item.Date = new Date(item.Date + " " + item.Time);
				if (item.Time) item.Date.setMinutes(item.Date.getMinutes() - item.UTCOffset * 60 - item.Date.getTimezoneOffset());
				delete item.Time;
				setSectionHeadline(section, item);
				cb(++count == result.HeadlineSummaries.length);
				/*var url2=makeUrl("/globalnews_xignite/xGlobalNews.json/GetMarketNewsDetails?Reference="+encodeURI(item.Url)+"&_fields=Time");
				(function(item,stop){
					serverFetch(url2,null,null,function(status,result){
						if(status==200){
							result=JSONparse(result);
							if(result.Time) {
								item.Date=new Date(result.Time);
								item.Date.setMinutes(item.Date.getMinutes()-item.UTCOffset*60-item.Date.getTimezoneOffset());
							}
							delete item.UTCOffset;
							setSectionHeadline(section,item);
						}
						cb(++count==stop);
					});
				}(item,result.HeadlineSummaries.length));*/
			}
		});
	}
}

function fetchSecurityInsiders(section, symbol, limit, flags, cb) {
	if (!limit) return;
	if (needsEncryption && !setXigniteEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				fetchSecurityInsiders.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}
	if (flags & Insider.Flags.DATA) {
		var start = new Date();
		var end = new Date(start);
		start.setFullYear(end.getFullYear() - 1);
		var url = makeUrl("/www_xignite/xInsider.json/GetIssuerTransactions?IssuerIdentifier=" + encodeURIComponent(symbol) + "&IssuerIdentifierType=Symbol&FromDate=" + mmddyyyy(start) + "&ToDate=" + mmddyyyy(end) + "&TransactionCode=All&SecurityType=Stock&OwnershipType=Both&_fields=Transactions.Insider.Name,Transactions.TransactionDate,Transactions.TransactionDescription,Transactions.StockAmount,Transactions.Price,Transactions.AmountOwnedAfter");
		serverFetch(url, null, null, function (status, result) {
			function isSell(desc) {
				if (desc.indexOf("Sale") > -1) return true;
				//else if(desc.indexOf("Gift")>-1) return true;
				else if (desc.indexOf("Disposition") > -1) return true; //Note: "Other Acquisition or Disposition" description may eval incorrectly
				else if (desc.indexOf("Same Day Exercise") > -1) return true; //Note: "Other Acquisition or Disposition" description may eval incorrectly
				return false;
			}
			if (status != 200) return;
			result = JSONparse(result);
			if (!result.Transactions) {
				cb();
				return;
			}
			var count = 0;
			for (var t = 0; t < result.Transactions.length; t++) {
				if (count > limit) break;
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
				setSectionTrade(section, item);
			}
			cb();
		});
	}
}

function fetchSecurityFilings(section, symbol, limit, flags, cb) {
	if (!limit) return;
	if (needsEncryption && !setXigniteEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				fetchSecurityFilings.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}
	if (flags & Filings.Flags.DATA) {
		var end = new Date();
		end.setDate(end.getDate() + 1);
		var url = makeUrl("/www_xignite/xEdgar.json/SearchFilings?Identifier=" + encodeURIComponent(symbol) + "&IdentifierType=Symbol&PriorToDate=" + mmddyyyy(end) + "&OwnershipForms=Include&Form=&OutputType=AllMatches&_fields=Filings.Date,Filings.Type,Filings.Description,Filings.HtmlFileUrl");
		serverFetch(url, null, null, function (status, result) {
			if (status != 200) return;
			result = JSONparse(result);
			if (!result.Filings) {
				cb();
				return;
			}
			var count = 0;
			for (var f = 0; f < result.Filings.length; f++) {
				if (count > limit) break;
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
				setSectionFiling(section, item);
			}
			cb();
		});
	}
}

function fetchRelevantDates(symbol, limit, reportType, cb) {
	if (needsEncryption && !setXigniteEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				fetchRelevantDates.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}
	var dates = [];
	var start = new Date();
	var end = new Date(start);
	start.setFullYear(end.getFullYear() - 2 * limit);
	var url = makeUrl("/factsetfundamentals_xignite/xFactSetFundamentals.json/GetFundamentalsFiscalRange?IdentifierType=Symbol&Identifiers=" + encodeURIComponent(symbol) + "&FundamentalTypes=FiscalPeriodEndDate&ReportType=" + (reportType == "A" ? "Annual" : "Quarterly") + "&ExcludeRestated=false&StartDate=" + mmddyyyy(start) + "&EndDate=" + mmddyyyy(end) + "&UpdatedSince=&_fields=FundamentalsSets.Fundamentals.Date,FundamentalsSets.Fundamentals.IsRestated");
	serverFetch(url, null, null, function (status, result) {
		if (status != 200) return;
		result = JSONparse(result);
		if (!result.length || !result[0].FundamentalsSets || !result[0].FundamentalsSets.length) {
			cb(dates);
			return;
		}
		var count = 0;
		var now = new Date();
		var lastdate = null;
		for (var r = 0; r < result[0].FundamentalsSets.length; r++) {
			if (count > limit) break;
			var res = result[0].FundamentalsSets[r].Fundamentals[0];
			var date = res.Date;
			if (date == lastdate && !res.IsRestated) continue;
			var dateParts = date.split("/");
			var reportDate = new Date(dateParts[2], dateParts[0] - 1, dateParts[1]);
			if (isNaN(reportDate)) continue;
			else if (reportDate > now) continue;
			dates.push(reportDate);
			lastdate = date;
			count++;
		}
		cb(dates);
	});
}

function fetchFinancialStatement(section, symbol, limit, flags, dates, cb) {
	if (needsEncryption && !setXigniteEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				fetchFinancialStatement.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}
	var statement = null,
		term = null;
	var myflags = flags.split("/");
	switch (myflags[0]) {
	case "A":
		term = "Annual";
		break;
	case "Q":
		term = "Quarterly";
		break;
	}
	switch (myflags[1]) {
	case "B":
		statement = "BalanceSheet";
		break;
	case "C":
		statement = "CashFlowStatement";
		break;
	case "I":
		statement = "IncomeStatement";
		break;
	}
	if (!statement || !term) return;
	var date = new Date();
	var count = 0;
	while (count < limit) {
		var url = makeUrl("/factsetfundamentals_xignite/xFactSetFundamentals.json/Get" + statement + "s?IdentifierType=Symbol&Identifiers=" + encodeURIComponent(symbol) + "&ReportType=" + term + "&AsOfDate=" + mmddyyyy(date) + "&ExcludeRestated=false&UpdatedSince=");
		serverFetch(url, null, null, function (status, result) {
			if (status != 200) return;
			result = JSONparse(result);
			var r = result[0][statement];
			if (!r) {
				cb("");
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
			setSectionStatement(section, item);
			cb(myflags[0]);
		});
		count++;
		if (dates.length > count) date = dates[count];
		else {
			if (myflags[0] == "A") date.setFullYear(date.getFullYear() - 1);
			else date.setDate(date.getDate() - 100);
		}
	}
}

function fetchEconomicCalendar(section, range, offset, global, limit, flags, cb) {
	if (!limit) return;
	if (needsEncryption && !setXigniteEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				fetchEconomicCalendar.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}
	if (flags & Calendar.Flags.HEADLINE) {
		var start = new Date();
		start.setHours(0, 0, 0, 0);
		var end = new Date();
		end.setHours(23, 59, 59, 0);
		if (range == "all") {
			start.setMonth(start.getMonth() - 3);
			end.setFullYear(end.getFullYear() + 1);
		} else if (range == "month") {
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
		}
		var startOffset = getETUTCOffset(start) + start.getTimezoneOffset();
		var endOffset = getETUTCOffset(end) + end.getTimezoneOffset();
		start.setMinutes(start.getMinutes() + startOffset);
		end.setMinutes(end.getMinutes() + endOffset);

		var url = makeUrl("/www_xignite/xCalendar.json/GetEventsForRange?ReleasedOnStart=" + mmddyyyy(start) + "%20" + hhmmss(start) + "&ReleasedOnEnd=" + mmddyyyy(end) + "%20" + hhmmss(end) + "&_fields=Summaries.EventID,Summaries.EventName,Summaries.CountryCode,Summaries.ReleasedOn,Summaries.Value.ValueName,Summaries.Values.Consensus,Summaries.Values.Actual");
		serverFetch(url, null, null, function (status, result) {
			var count = 0;
			if (status == 200) {
				result = JSONparse(result);
				if (!result.Summaries) return;
				for (var s = 0; s < result.Summaries.length; s++) {
					if (count == limit) break;
					var item = result.Summaries[s];
					item.Subject = item.EventName.replace(/''''/g, "'");
					delete item.EventName;
					item.Date = new Date(item.ReleasedOn);
					item.Date.setMinutes(item.Date.getMinutes() - getETUTCOffset(item.Date));
					if (isNaN(item.Date)) { //IE8 nonsense
						datePart = item.ReleasedOn.split("T")[0].split("-");
						timePart = item.ReleasedOn.split("T")[1].split(":");
						item.Date = new Date(datePart[0], datePart[1] - 1, datePart[2], timePart[0], timePart[1], 0, 0);
						item.Date.setMinutes(item.Date.getMinutes() - getETUTCOffset(item.Date) - item.Date.getTimezoneOffset());
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
					setSectionHeadline(section, item);
					count++;
				}
			}
			if (currentCalendarPointer && range + offset != currentCalendarPointer) return;

			var holidayExchanges = {
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
				var url2 = makeUrl("/globalholidays_xignite/xGlobalHolidays.json/GetHolidays?Location=" + holidayExchanges[hol] + "&LocationType=Exchange&StartDate=" + mmddyyyy(start) + "%20" + hhmmss(start) + "&EndDate=" + mmddyyyy(end) + "%20" + hhmmss(end) + "&_fields=Date,Name,FullHoliday,EarlyClose");
				(function (country) {
					serverFetch(url2, null, null, function (status, result) {
						if (status == 200) {
							result = JSONparse(result);
							if (!result.length) return;
							for (var s = 0; s < result.length; s++) {
								if (count == limit) break;
								var item = result[s];
								if (!item.Name) continue;
								item.Subject = item.Name.replace(/\*/g, " (projected)");
								delete item.Name;
								item.CountryCode = country;
								item.Symbol = "HOL-" + item.CountryCode + "-" + item.Date;
								var dateParts = item.Date.split("/");
								var d = new Date(dateParts[2], dateParts[0] - 1, dateParts[1], 0, 0, 0, 0);
								item.Date = d;

								//item.Date.setMinutes(item.Date.getMinutes()-getETUTCOffset(item.Date)-item.Date.getTimezoneOffset());
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
			}
		});
	}
}

function fetchEconomicCalendarDetail(section, id, cb) {
	if (needsEncryption && !setXigniteEncryptedToken(encryptedToken, true)) {
		setTimeout(function (self, args) {
			return function () {
				fetchEconomicCalendarDetail.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}
	var url = makeUrl("/www_xignite/xCalendar.json/GetEventDetails?EventID=" + id + "&_fields=Description");
	serverFetch(url, null, null, function (status, result) {
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