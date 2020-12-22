// -------------------------------------------------------------------------------------------
// Copyright 2014 by ChartIQ LLC
// -------------------------------------------------------------------------------------------

var searchSetup = false;

if (!window.SymbolLookupModule) {
	window.SymbolLookupModule = {

		subscribedExchanges: [],
		fastLookupMap: [], //use for fast lookup of description by symbol (this is parsed with dashes to fit in the headsup)
		fastLookupShareMap: [], //use for fast lookup of description for sharing (this is raw)

		source: "Xignite",
		currentRequest: 0,
		maxResults: 50, //default search results count
		searchExchanges: [],

		cache: [],
		cacheIt: function (body, data) {
			this.cache.push({
				body: body,
				data: data
			});
			while (this.cache.length > 100) this.cache.shift();
		},

		ready: false,
		loadSymbolLookupTables: function (useDefaults) {
			if (this.ready) return;
			if (!useDefaults) this.internalSubscribedExchanges = {};
			for (var i = 0; i < this.subscribedExchanges.length; i++) {
				this.internalSubscribedExchanges[this.subscribedExchanges[i]] = true;
			}
			this.searchExchanges = [];
			for (var j in this.internalSubscribedExchanges) {
				if (this.internalSubscribedExchanges[j]) this.searchExchanges.push(j);
			}
			this.ready = true;
		},

		doSymbolLookup: function (type, keyword, maxResults, cb) {
			var self = this;
			if (!keyword) {
				if (cb) cb({});
				return;
			}
			if (!maxResults) maxResults = this.maxResults;
			var url = "https://services.chartiq.com/symbol_lookup_service/";
			var body = "t=" + encodeURIComponent(keyword) + "&m=" + parseInt(maxResults, 10);
			if (type && type != "ALL") body += "&e=" + encodeURIComponent(type);
			body += "&x=" + encodeURIComponent(JSON.stringify(this.searchExchanges));
			for (var i = 0; i < self.cache.length; i++) {
				if (self.cache[i].body == body) {
					cb(self.cache[i].data);
					return;
				}
			}
			if (body.length < 1800) {
				url += "?" + body;
			}
			window.SymbolLookupModule.currentRequest++;
			var thisRequest = window.SymbolLookupModule.currentRequest;
			setTimeout(function () {
				if (thisRequest != window.SymbolLookupModule.currentRequest) return; // another keystroke happened in the timeout period
				PortalCore.serverFetch(url, body.length < 1800 ? null : body, null, function (status, response) {
					if (thisRequest != window.SymbolLookupModule.currentRequest) return; // An older request got ahead of a newer request.
					if (status != 200) {
						if (cb) cb({});
						return;
					}
					//populate the map
					var results = response.split("\r\n");
					var filteredResults = [];
					var names;
					for (var r = 1; r < results.length; r++) {
						if (r == 1) {
							names = results[0].split("|");
							headers = {};
							for (var h = 0; h < names.length; h++) {
								headers[names[h]] = h;
							}
						}
						var fields = results[r].split("|");
						if (!self.internalSubscribedExchanges[fields[headers.source]]) continue;
						self.fastLookupShareMap[fields[headers.symbol]] = fields[headers.name];
						filteredResults.push({
							"symbol": fields[headers.symbol],
							"name": fields[headers.name],
							"exchDisp": fields[headers.exchDisp]
						});
					}
					if (filteredResults.length > 10) self.cacheIt(body, filteredResults); // Only cache "heavy" results
					if (cb) cb(filteredResults);
				});
			}, 100);
		}
	};

	if (portalSettings.searchExchanges) {
		SymbolLookupModule.internalSubscribedExchanges = {};
		_.each(portalSettings.searchExchanges, function (exchange) {
			SymbolLookupModule.internalSubscribedExchanges[exchange] = true;
		});
	} else {
		SymbolLookupModule.internalSubscribedExchanges = {
			"XNYS": true,
			"XASE": true,
			"ARCX": true,
			"XNAS": true,
			"OOTC": true,
			"metals": true,
			"forex": true,
			"mutualfund": true,
			"INDCBSX": true,
			"INDARCX": true,
			"INDXASE": true,
			"INDXNAS": true,
			"IND_DJI": true
		};
	}
};

function search(list) {
	list = JSON.parse(list);
	if (searchSetup) {
		//deal with messages
		_.each(list, function (widgetId) {

			var settings = portalSettings.items[widgetId];
			if (settings.message && settings.message.data && settings.message.data.symbol) {
				var message = {
					sender: widgetId,
					subject: 'symbolChange',
					data: {
						symbol: settings.message.data.symbol
					}
				}
				if (settings.message.data.symbolName) message.data.symbolName = settings.message.data.symbolName;
				PortalCore.sendMessage(message);
			}
		});


		return;
	}
	searchSetup = true;
	
	require(['iscroll'], function () {
		var IScroll = IScroll5;

		window.captureEnterKey = function (widgetId) {

			var containerId = 'ciq-' + widgetId;
			var selectedItem = $('.' + containerId + '-search-results li');
			if (!selectedItem.length) return true;

			selectedItem = $(selectedItem[0]);

			var result = {}

			result.symbol = selectedItem.children("span").eq(0).html();
			result.exchDisp = selectedItem.children("span").eq(1).html();
			result.name = selectedItem.children("span").eq(2).html();

			if (!result.symbol) {
				result.symbol = $('#' + containerId + ' input[name=sym]').val().toUpperCase();
			}

			if (!result.symbol) return true;

			if (dependencies[widgetId]) {
				var message = {
					sender: widgetId,
					subject: 'symbolChange',
					data: {
						symbol: result.symbol,
						symbolName: result.symbolName
					}
				}
				PortalCore.sendMessage(message);

				$('.' + containerId + '-search-results').hide();
				$('#' + containerId + ' input[name=sym]').val('');
				$('#' + containerId + ' input[name=sym]').blur();

			} else if (portalSettings.searchCompatible) {
				//check if we have the symbol in the URL, if so replace, otherwise add
				var url = location.href;
				var symbol = PortalCore.queryStringValues('sym', location.search);
				if (symbol[0]) {
					url = PortalCore.updateUrlParameter(url, 'sym', result.symbol);
				} else {
					if (url.indexOf('?') == -1) url += "?sym=" + result.symbol;
					else url += "&sym=" + result.symbol;
				}
				location.href = url;
			} else {
				// go to search url with symbol parameter added
				var url = portalSettings.searchURL;
				if (url.indexOf('?') == -1) url += "?sym=" + result.symbol;
				else url += "&sym=" + result.symbol;
				location.href = url;

			}

			return false;
		}

		if (!portalSettings.search) portalSettings.search = {};
		if (!portalSettings.search.maxResults) portalSettings.search.maxResults = 50;

		_.each(list, function (widgetId) {
			var containerId = 'ciq-' + widgetId;
			var settings = portalSettings.items[widgetId];
			var containerObject = $('#' + containerId);


			containerObject.html('<div><form action="javascript:captureEnterKey(\'' + widgetId + '\')" id="form_' + widgetId + '"><input type="search" autocomplete="off" autocapitalize="off" autocorrect="off" name="sym" placeholder="Enter Symbol"><input type="submit" value="  " class="ciq-SearchButton"></form><div id="' + containerId + '-search-results" class="ciq-search-results ' + containerId + '-search-results"><div class="scroller"><ul><li><span></span><span></span><span></span></li></ul></div></div></div>');
			for (var r = 1; r < portalSettings.search.maxResults; r++) {
				$('#' + containerId + ' ul').first().append($('#' + containerId + ' li').first().clone());
			}

			var myScroll = {};
			myScroll.searchWizardScroll = new IScroll('.' + containerId + '-search-results', {
				mouseWheel: true,
				interactiveScrollbars: true,
				scrollbars: 'custom',
				tap: true
			});

			//$('#ciq-search').css('display', 'block');
			$('#' + containerId + ' input[name=sym]').on('blur', function () {
				$('.' + containerId + '-search-results').hide();
			});

			$('#' + containerId + ' input[name=sym]').on('focus', function () {
				window.SymbolLookupModule.loadSymbolLookupTables(true);
			});
			$('#' + containerId + ' input[name=sym]').on('keyup', function () {
				var input = $(this);
				if ($(this).val()) {
					window.SymbolLookupModule.doSymbolLookup("", $(this).val(), portalSettings.search.maxResults, function (results) {
						if (results.length) {
							$('.' + containerId + '-search-results li').each(function (index) {
								$(this).hide();
								if (results[index]) {
									$(this).show();
									$(this).children("span").eq(0).html(results[index].symbol);
									$(this).children("span").eq(1).html(results[index].exchDisp);
									$(this).children("span").eq(2).html(results[index].name);
									$(this).on(($.support.opacity ? "tap" : "click"), function () {
										//input.val(results[index].symbol);
										if (dependencies[widgetId]) {
											var message = {
												sender: widgetId,
												subject: 'symbolChange',
												data: {
													symbol: results[index].symbol,
													symbolName: results[index].name
												}
											}
											PortalCore.sendMessage(message);
											$('.' + containerId + '-search-results').hide();
											$('#' + containerId + ' input[name=sym]').val('');
											$('#' + containerId + ' input[name=sym]').blur();
										} else if (portalSettings.searchCompatible) {
											//check if we have the symbol in the URL, if so replace, otherwise add
											var url = location.href;
											var symbol = PortalCore.queryStringValues('sym', location.search);
											if (symbol[0]) {
												url = PortalCore.updateUrlParameter(url, 'sym', results[index].symbol);
											} else {
												if (url.indexOf('?') == -1) url += "?sym=" + results[index].symbol;
												else url += "&sym=" + results[index].symbol;
											}
											location.href = url;
										} else {
											// go to search url with symbol parameter added
											var url = portalSettings.searchURL;
											if (url.indexOf('?') == -1) url += "?sym=" + results[index].symbol;
											else url += "&sym=" + results[index].symbol;
											location.href = url;

										}
										//input.parent().submit();
										return false;
									});
								}
							});
							$('.' + containerId + '-search-results').show();
							setTimeout(function () {
								if (myScroll && myScroll.searchWizardScroll) myScroll.searchWizardScroll.refresh();
							}, 0);
						} else {
							$('.' + containerId + '-search-results').hide();
						}
					});
				} else {
					$('.' + containerId + '-search-results').hide();
				}
			});
			$('#' + containerId + ' input[name=sym]').on('click search', function () {
				function fn() {
					if ($('#' + containerId + ' input[name=sym]').val() == "") $('.' + containerId + '-search-results').hide();
				}
				window.setTimeout(fn, 10);
			});
			$('.' + containerId + '-search-results').on('touchstart', function () {
				$('#' + containerId + ' input[type=submit]').focus();
			});

			containerObject.show();
			if (dependencies[widgetId]) {
				PortalCore.loadDependencies(widgetId);
			}


		});
	});
}