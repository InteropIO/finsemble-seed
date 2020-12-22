/*jshint -W117 */
(function ($) {
	/*
	 * \ |*| |*| IE-specific polyfill which enables the passage of arbitrary
	 * arguments to the |*| callback functions of JavaScript timers (HTML5
	 * standard syntax). |*| |*|
	 * https://developer.mozilla.org/en-US/docs/DOM/window.setInterval |*| |*|
	 * Syntax: |*| var timeoutID = window.setTimeout(func, delay, [param1,
	 * param2, ...]); |*| var timeoutID = window.setTimeout(code, delay); |*|
	 * var intervalID = window.setInterval(func, delay[, param1, param2, ...]);
	 * |*| var intervalID = window.setInterval(code, delay); |*| \
	 */

	if (document.all && !window.setTimeout.isPolyfill) {
		var __nativeST__ = window.setTimeout;
		window.setTimeout = function (vCallback, nDelay) {
			var aArgs = Array.prototype.slice.call(arguments, 2);
			return __nativeST__(vCallback instanceof Function ? function () {
				vCallback.apply(null, aArgs);
			} : vCallback, nDelay);
		};
		window.setTimeout.isPolyfill = true;
	}

	if (document.all && !window.setInterval.isPolyfill) {
		var __nativeSI__ = window.setInterval;
		window.setInterval = function (vCallback, nDelay) {
			var aArgs = Array.prototype.slice.call(arguments, 2);
			return __nativeSI__(vCallback instanceof Function ? function () {
				vCallback.apply(null, aArgs);
			} : vCallback, nDelay);
		};
		window.setInterval.isPolyfill = true;
	}

	var columnNames = [{
		title: "", //Stock
		"targets": 0,
		"visible": true
	}, {
		title: "", //Price
		"targets": 1,
		"visible": true
	}, {
		title: "", //Change
		"targets": 2,
		"visible": true
	}, {
		title: "", //%Change
		"targets": 3,
		"visible": true
	}, {
		title: "", //Volume
		"targets": 4,
		"visible": false
	}];

	//var table;
	var tables = {};
	var doubleClicked = false;
	var searchAndDelete;

	//firefox security error fix - cannot use the function getStyle()
	var quoteRefreshRate = getStyleValue('quote-refresher', 'z-index');
	var identifierType = "symbol";
	var symbolToNameMap = {};

	var arr = [];

	var apiTypes = {
		FOREX: "XigniteGlobalCurrencies",
		INDEX: "XigniteGlobalIndices",
		SUPERQUOTES: "XigniteGlobalQuotes"
	};

	function getStyleValue(className, style) {
		var p = document.createElement('p');
		$(p).addClass(className);
		return $(p).css(style);
	}


	// create first watchlist table
	function createTable(tableId) {
		var table = $(tableId)
			.DataTable({
				data: null,
				columnDefs: columnNames,
				columns: [
					{
						data: null,
						render: function (data, type, row) {
							var symbol = data.symbol;
							if (type === 'display' || type === 'sort') {
								if (symbolToNameMap[tableId][symbol]) {
									return symbolToNameMap[tableId][symbol];
								} else {
									return symbolToNameMap[tableId]['^' + symbol];
								}
							}
							return data;
						}
                    }, {
						data: 'price',
						class: "numberAlign"
					}, {
						data: 'change',
						class: "numberAlign"
					}, {
						data: 'changePct',
						class: "numberAlign"
					}, {
						data: 'volume',
						class: "numberAlign"
					}],
				bFilter: false,
				lengthChange: false,
				bPaginate: false,
				bInfo: false,
				pageLength: 25,
				order: [],
				"autoWidth": true,

				// add title attribute and update
				// row data
				fnRowCallback: function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
					var symbol = aData.symbol;

					if (aData.cssClass === "positive") {
						$('td:eq(1)', nRow)
							.addClass('blink');
					} else {
						$('td:eq(1)', nRow)
							.removeClass('blink');
					}

					if (iDisplayIndex === 0 && $(tableId + ' tr.selected').length === 0) {
						$(nRow).addClass('selected');
					}

					var id = symbol.replace(/\./g, '_').replace(/[\^\/]/, "");
					var name = symbolToNameMap[tableId][symbol];
					if (!name) name = symbolToNameMap[tableId]['^' + symbol];

					$(nRow).attr('id', id);

					$(nRow).attr('onclick', 'javscript:launchChart("' + tableId + '", "' + encodeURIComponent(symbol) + '", "' + name + '")');

					// hack to ensure that changing the symbol manually still has the apiType
					$('td:eq(0)', nRow).attr('apiType', aData.apiType);



					return nRow;
				}
			});

		tables[tableId] = table;

	}

	// watchlist 1 creation
	$(document)
		.ready(
			function () {
				var numTables = $('.watchlist').length;
				for (var i = 0; i < numTables; i++) {
					createTable('#watchlist' + i);
				}
				init();
			});

	// get the quotes for the watchlist tables
	function getQuotes(tableToFill, symbolArray, useSuperQuotes,
		addSymbol, initialLoad) {

		/*if (getStyleValue("quoteboard-access", "display").indexOf("none") === 0) {
			console.log("Feature not entitled");
			return;
		}*/

		var quote;
		var quoteSymbol;
		var change;
		var price;
		var name;
		var changePct;
		var volume;
		var apiType;

		XigniteMultiSnapshot
			.getQuotes(
				symbolArray,
				null,
				function (err, response) {
					if (quoteRefreshRate > 0 && !addSymbol) {
						setTimeout(getQuotes, 1000 * quoteRefreshRate,
							tableToFill, symbolArray,
							useSuperQuotes);
					}
					if (err) {
						console.log(err);
						return;
					}

					for (var i = 0; i < symbolArray.length; i++) {
						quote = response[symbolArray[i].replace(/[\^\/]/g, '')];
						if (quote === undefined) {
							quote = response[symbolArray[i]];
						}
						if (quote.Last === undefined) {
							quote.Last = "NA";
						} else {
							quote.Last = quote.Last.toFixed(2);
						}

						change = quote.Change > 0 ? '<span class="ciq-green">' + '+' + quote.Change.toFixed(2) + '</span>' :
							'<span class="ciq-red">' + quote.Change.toFixed(2) + '</span>';
						quoteSymbol = quote.Symbol;
						price = quote.Last;
						//name = quote.Name;
						volume = commaInt(quote.Volume);
						changePct = quote.PercentChange > 0 ? '<span class="ciq-green">' + '+' + quote.PercentChange.toFixed(2) + "%</span>" : '<span class="ciq-red">' + quote.PercentChange.toFixed(2) + "%</span>";

						try { // already exists
							row = tableToFill.row('#' + quote.Symbol.replace(/\./g, '_'));
							row.data().change = quote.Change > 0 ? '<span class="ciq-green">' + '+' + quote.Change.toFixed(2) + '</span>' :
								'<span class="ciq-red">' + quote.Change.toFixed(2) + '</span>';
							row.data().price = quote.Last;
							row.data().changePct = quote.PercentChange > 0 ? '<span class="ciq-green">' + '+' + quote.PercentChange.toFixed(2) + "%</span>" : '<span class="ciq-red">' + quote.PercentChange.toFixed(2) + "%</span>";
							row.data().volume = 0;
						} catch (err) { //add new
							tableToFill.row.add({
								"symbol": quoteSymbol,
								"price": price,
								"change": change,
								"changePct": changePct,
								"volume": volume,
								//"name": name,
								//"apiType": apiType
							}).draw();
						}
						
						$(window).trigger('resize');

					}
				}, identifierType, useSuperQuotes);
	}


	// initialize symbol lookup and create watchlists
	function init() {
		$(settings.tabs).each(function (key, value) {
			var tableId = '#watchlist' + key;
			symbolToNameMap[tableId] = [];
			var names = [];
			var symbols = [];
			$.each(value[1], function (key1, value1) {
				names.push(key1);
				symbols.push(value1);
			});
			$(names).each(function (key1, value1) {
				symbolToNameMap[tableId][symbols[key1]] = names[key1];
			});
			loadDataTable(tableId, symbols);


			var chartId = '#ciq-chart' + key;
			if ($(chartId).length > 0) {
				if ($(chartId).prop('tagName') == 'DIV') {
					launchChart('watchlist' + key, encodeURIComponent(symbols[0]), symbolToNameMap[tableId][symbols[0]]);
				} else { //using frames
					$(chartId).attr('src', 'chart/sidebar-chart.html');

					$(chartId).load(function () {
						launchChart('watchlist' + key, encodeURIComponent(symbols[0]), symbolToNameMap[tableId][symbols[0]]);
					});

				}
			} else {
				chartId = '#ciq-chart-div';
				if (key == 0 && $(chartId).prop('tagName') == 'DIV') {				
					launchChart('watchlist' + key, encodeURIComponent(symbols[0]), symbolToNameMap[tableId][symbols[0]]);
				}

			}

			$(chartId).css('visibility', '');
		});
	}

	// watchlist one values
	function loadDataTable(tableId, value) {
		if (value) {
			if (value.length > 0) {
				getQuotes(tables[tableId], value, true, false, true);
			}
		}
	}



})(jQuery);