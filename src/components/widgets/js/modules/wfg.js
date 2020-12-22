var WfgMultiSnapshot = function () {};
if (!window.dataSources) window.dataSources = {};

var wfg = function () {};
wfg.username = 'chart_iq';
wfg.password = 'fegot461';


wfg.fetchQuotes = function (symbols, cb, extraParams) {

	function processResponse(status, result, cb, extraParams) {
		if (status == 200) {
			require(['https://cdnjs.cloudflare.com/ajax/libs/x2js/1.2.0/xml2json.min.js'], function (X2JS) {
				var x2js = new X2JS();
				result = x2js.xml_str2json(result);
				var arr = {};
				var results;
				if (!result.quote_feed.price_snapshot) {
					results = [result.quote_feed];
				} else {
					results = result.quote_feed.price_snapshot;
				}
				_.each(results, function (value) {
					arr[value.identifier.value] = {};
					arr[value.identifier.value].Last = Number(value.latest_price.close_price);
					arr[value.identifier.value].Change = Number(value.latest_price.change_today);
					arr[value.identifier.value].PercentChange = Number(value.latest_price.change_pcent_today);

				});
				cb(null, arr, extraParams);

			});


		}
	}


	var url = 'http://localhost/wfg_prices/?username=' + wfg.username + '&password=' + wfg.password + '&type=intraday_price&code=' + _.join(symbols);
	PortalCore.serverFetch(url, null, null, function (status, result) {
		processResponse(status, result, cb, extraParams);
	});

};

//settings -> numberOfItems
wfg.fetchMarketHeadlines = function (settings, cb, extraParams) {
	var limit = settings.numberOfItems ? settings.numberOfItems : 5;
	var url = 'http://localhost/wfg_news/?username=' + wfg.username + '&password=' + wfg.password + '&timestamp=' + PortalCore.yyyymmdd(new Date()) + 'T000000&limit=' + limit;
	PortalCore.serverFetch(url, null, null, function (status, result) {
		if (status == 200) {
			require(['https://cdnjs.cloudflare.com/ajax/libs/x2js/1.2.0/xml2json.min.js'], function (X2JS) {
				var x2js = new X2JS();
				result = x2js.xml2json(PortalCore.xmlToDom(result));
				var items = [];
				_.each(result.rss.channel.article_content, function (value) {
					var item = value;
					item.Subject = item.title;
					item.Summary = item.introduction;
					if (item.related_company) {
						item.Securities = [{
							Symbol: item.related_company._ticker + ':' + item.related_company._exchange
						}];
					}
					items.push(item);
				});
				cb(null, items, extraParams);

			});


		}
	});
}

wfg.fetchTopMovers = function (settings, moverType, moversCB, newsCB, extraParams) {
	
	var limit = 5;
	if (settings) {
		if (settings.numberOfItems) limit = settings.numberOfItems;
	}

	var moverTypeCodeMap = {
		'advancers': 'PercentGainers',
		'decliners': 'PercentLosers',
		'actives': 'MostActive'
	}


	var url = XigniteMultiSnapshot.makeUrl("/globalquotes_xignite/v3/xGlobalQuotes.json/GetTopMarketMovers?MarketMoverType=" + moverTypeCodeMap[moverType] + "&NumberOfMarketMovers=50&Exchanges=XNYS,XNAS,XASE,ARCX&_fields=Movers.Symbol,Movers.Last,Movers.ChangeFromPreviousClose");
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
				var url2 = XigniteMultiSnapshot.makeUrl("/globalnews_xignite/xGlobalNews.json/GetTopSecuritySummaries?IdentifierType=Symbol&Identifier=" + items[s].Symbol + "&Count=1&_fields=Security.Symbol,HeadlineSummaries.Title,HeadlineSummaries.Date,HeadlineSummaries.Time,HeadlineSummaries.UTCOffset,HeadlineSummaries.Source,HeadlineSummaries.Url,HeadlineSummaries.Summary");
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

window.dataSources.wfg = wfg;