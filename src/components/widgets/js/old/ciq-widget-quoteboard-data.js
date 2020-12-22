(function($) {
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
		window.setTimeout = function(vCallback, nDelay /*
														 * , argumentToPass1,
														 * argumentToPass2, etc.
														 */) {
			var aArgs = Array.prototype.slice.call(arguments, 2);
			return __nativeST__(vCallback instanceof Function ? function() {
				vCallback.apply(null, aArgs);
			} : vCallback, nDelay);
		};
		window.setTimeout.isPolyfill = true;
	}

	if (document.all && !window.setInterval.isPolyfill) {
		var __nativeSI__ = window.setInterval;
		window.setInterval = function(vCallback, nDelay /*
														 * , argumentToPass1,
														 * argumentToPass2, etc.
														 */) {
			var aArgs = Array.prototype.slice.call(arguments, 2);
			return __nativeSI__(vCallback instanceof Function ? function() {
				vCallback.apply(null, aArgs);
			} : vCallback, nDelay);
		};
		window.setInterval.isPolyfill = true;
	}

	var columnNames = [ {
		title : "Symbol",
		"targets" : 0
	}, {
		title : "Price",
		"targets" : 1
	}, {
		title : "Change",
		"targets" : 2
	}, {
		title : "% Change",
		"targets" : 3
	}, {
		title : "Volume",
		"targets" : 4
	} ];

	var table;
	var table2;
	var alertDialog;
	var isTyping = false;
	var doubleClicked = false;
	var searchAndDelete;

	var quoteRefreshRate = getStyle(".quote-refresher", "z-index");
	var identifierType = "symbol";
	var symbols = [];
	var symbols2 = [];
	var alertIdArray = [];

	var arr = [];

	var apiTypes = {
			FOREX : "XigniteGlobalCurrencies",
			INDEX : "XigniteGlobalIndices",
			SUPERQUOTES : "XigniteGlobalQuotes"
	};
	
	var urls = {
			SEARCH: XigniteMultiSnapshot.makeUrl("/alerts_xignite/xAlerts.json/SearchAlerts?Pattern={pattern}"),
			CREATE: XigniteMultiSnapshot.makeUrl("/alerts_xignite/xAlerts.json/CreateAlert?IdentifierType=Symbol&Identifier={identifier}&API={api}&Condition={condition}&Reset=Daily&StartDate=&EndDate=&CallbackURL={callbackUrl}"),
			DELETE: XigniteMultiSnapshot.makeUrl("/alerts_xignite/xAlerts.json/DeleteAlerts?AlertIdentifiers={identifiers}")
	};

	alertDialog = $("#dialog-form").dialog({
		autoOpen : false,
		draggable : false,
		resizeable : false,
		height : 350,
		width : 550,
		modal : true,
		buttons : {
			"Save" : function() {
				// first delete current alerts and then create
				deleteCreateAlerts(true);
				alertDialog.dialog("close");
			},
			"Clear All Alerts" : clearAlertFields,
			Cancel : function() {
				alertDialog.dialog("close");
				clearAlertFields();
				alertIdArray = [];
			}
		},
		close : function() {
		}
	});
	
	// create first watchlist table
	function createTableOne(){
		table = $('#watchlist1')
				.DataTable(
						{
							data : null,
							columnDefs : columnNames,
							columns : [
									{
										data : null,
										render : function(data,
												type, row) {
											if (type === 'display') {
												return '<span class="menuToolTip"><span apitype="' + data.apiType + '" class="nameTooltip">'
														+ data.symbol
														+ ' <i class="fa fa-caret-down menuImg"></i></span></span>';
											} else if (type === 'sort') {
												return data.symbol;
											}
											return data;
										}
									}, {
										data : 'price',
										class : "numberAlign"
									}, {
										data : 'change',
										class : "numberAlign"
									}, {
										data : 'changePct',
										class : "numberAlign"
									}, {
										data : 'volume',
										class : "numberAlign"
									} ],
							bFilter : false,
							lengthChange : false,
							bPaginate : false,
							bInfo : false,
							pageLength : 25,
							order : [],
							"autoWidth" : false,

							// add hover and tooltip
							// functionality
							createdRow : function(nRow, aData,
									iDataIndex) {
							},

							// add title attribute and update
							// row data
							fnRowCallback : function(nRow,
									aData, iDisplayIndex,
									iDisplayIndexFull) {

								if (aData.cssClass == "positive") {
									$('td:eq(1)', nRow)
											.addClass('blink');
								} else {
									$('td:eq(1)', nRow)
											.removeClass(
													'blink');
								}

								$(nRow).attr(
										'id',
										aData.symbol.replace(
												/\./g, '_')
												.replace(/\^/,
														""));
								
								// hack to ensure that changing the symbol manually still has the apiType
								$('td:eq(0)', nRow).attr(
										'apiType', aData.apiType);

								addTooltipMenu($(nRow).find(
										'.menuToolTip'),
										aData.symbol,
										aData.name, true,
										aData.apiType);
								addTooltipSymbol(
										$(nRow).find(
												'.nameTooltip'),
										aData.name != null ? aData.name
												: "Unknown Symbol",
										true);

								return nRow;
							},

						});

		$('#watchlist1 thead tr th').click(
				function() {
					var order = table.order();

					if (order[0]) {
						var sortOrder = order[0][0] + ","
								+ order[0][1];
						parentSetStorageValue("sortOrder1",
								sortOrder);
					}
				});

		$(".quoteboard .ciq-search .stx-btn2").on("click",
				function() {
					addSymbolsTableOne();
				});

	}
	
	// create second watchlist table
	function createTableTwo(){
		table2 = $('#watchlist2')
				.DataTable(
						{
							data : null,
							columnDefs : columnNames,
							columns : [
									{
										data : null,
										render : function(data,
												type, row) {
											if (type === 'display') {
												return '<span class="menuToolTip"><span class="nameTooltip">'
														+ data.symbol
														+ ' <i class="fa fa-caret-down menuImg"></i></span></span>';
											} else if (type === 'sort') {
												return data.symbol;
											}
											return data;
										}
									}, {
										data : 'price',
										class : "numberAlign"
									}, {
										data : 'change',
										class : "numberAlign"
									}, {
										data : 'changePct',
										class : "numberAlign"
									}, {
										data : 'volume',
										class : "numberAlign"
									} ],
							bFilter : false,
							lengthChange : false,
							bPaginate : false,
							bInfo : false,
							pageLength : 25,
							order : [],
							"autoWidth" : false,

							// add hover and tooltip
							// functionality
							createdRow : function(nRow, aData,
									iDataIndex) {

							},

							// add title attribute and update
							// row data
							fnRowCallback : function(nRow,
									aData, iDisplayIndex,
									iDisplayIndexFull) {
								if (aData.cssClass == "positive") {
									$('td:eq(1)', nRow)
											.addClass('blink');
								} else {
									$('td:eq(1)', nRow)
											.removeClass(
													'blink');
								}

								$(nRow).attr(
										'id',
										aData.symbol.replace(
												/\./g, '_')
												.replace(/\^/,
														""));
								
								// hack to ensure that changing the symbol manually still has the apiType
								$('td:eq(0)', nRow).attr(
										'apiType', aData.apiType);

								addTooltipMenu($(nRow).find(
										'.menuToolTip'),
										aData.symbol,
										aData.name, false,
										aData.apiType);
								addTooltipSymbol(
										$(nRow).find(
												'.nameTooltip'),
										aData.name != null ? aData.name
												: "Unknown Symbol",
										false);

								return nRow;
							},
						});

		$('#watchlist2 thead tr th').click(
				function() {
					var order = table2.order();

					if (order[0]) {
						var sortOrder = order[0][0] + ","
								+ order[0][1];
						parentSetStorageValue("sortOrder2",
								sortOrder);
					}
				});

		$(".quoteboard .ciq-search2 .stx-btn2").on("click",
				function() {
					addSymbolsTableTwo();
				});
	}
	

	// watchlist 1 creation
	$(document)
			.ready(
					function() {
				createTableOne();
				createTableTwo();
				init();
	});

	// get the quotes for the watchlist tables
	function getQuotes(tableToFill, symbolArray, useSuperQuotes,
			addSymbol, initialLoad) {
		
		if (getStyle(".quoteboard-access", "display").indexOf("none") == 0){
			console.log("Feature not entitled");
			return;
		}

		XigniteMultiSnapshot
				.getQuotes(
						symbolArray,
						null,
						function(err, response) {
							if (quoteRefreshRate > 0 && !addSymbol) {
								setTimeout(getQuotes, 1000 * quoteRefreshRate,
										tableToFill, symbolArray,
										useSuperQuotes);
							}
							if (err) {
								console.log(err);
								return;
							}

							// initial load or user adding symbol manually
							if (initialLoad || addSymbol) {
								for (var i = 0; i < symbolArray.length; i++) {
									var quote = response[symbolArray[i]];

									// just in case a blank symbol gets into the
									// array
									if (quote) {
										var quoteSymbol;
										var change;
										var price;
										var name;
										var changePct;
										var volume;
										var apiType;

										if (quote.UseSuperQuotes) {
											change = quote.Change > 0 ? "+"
													+ quote.Change.toFixed(2)
													+ ' <i class="fa fa-arrow-up"></i>'
													: quote.Change.toFixed(2)
															+ ' <i class="fa fa-arrow-down"></i>';
											quoteSymbol = quote.Symbol;
											price = quote.Last;
											name = quote.Name;
											volume = commaInt(quote.Volume);
											changePct = quote.PercentChange > 0 ? "+"
													+ quote.PercentChange
															.toFixed(2) + "%"
													: quote.PercentChange
															.toFixed(2)
															+ "%";
											apiType = "SUPERQUOTES";
										} else {
											if (quote.Value) {
												change = quote.Change > 0 ? "+"
														+ quote.Change.toFixed(2)
														+ ' <i class="fa fa-arrow-up"></i>'
														: quote.Change.toFixed(2)
																+ ' <i class="fa fa-arrow-down"></i>';
												quoteSymbol = quote.Symbol;
												if(quote.Del){
													price = quote.Last
													+ "*";
												}
												else if (quote.Eod) {
													price = quote.Last
															+ "**";
												} else {
													price = quote.Last;
												}
												name = quote.Index.IndexName;
												volume = commaInt(quote.Volume);
												changePct = quote.PercentChange > 0 ? "+"
														+ quote.PercentChange.toFixed(2)
														+ "%"
														: quote.PercentChange.toFixed(2)
																+ "%";
												apiType = "INDEX";
											} else if(quote.Security) {
												change = quote.Change > 0 ? "+"
														+ quote.Change.toFixed(2)
														+ ' <i class="fa fa-arrow-up"></i>'
														: quote.Change.toFixed(2)
														+ ' <i class="fa fa-arrow-down"></i>';
												quoteSymbol = quote.Symbol;
												price = quote.Last;
												name = quote.Security.Name;
												volume = quote.Volume;
												changePct = quote.PercentChange > 0 ? "+"
														+ quote.PercentChange.toFixed(2)
														+ "%"
														: quote.PercentChange.toFixed(2)
														+ "%";
												apiType = "EQUITY";
											} else {
												change = quote.Change > 0 ? "+"
														+ quote.Change.toFixed(2)
														+ ' <i class="fa fa-arrow-up"></i>'
														: quote.Change.toFixed(2)
														+ ' <i class="fa fa-arrow-down"></i>';
												quoteSymbol = quote.Symbol;
												price = quote.Last;
												name = quote.Symbol;
												volume = 0;
												changePct = quote.PercentChange > 0 ? "+"
														+ quote.PercentChange.toFixed(2)
														+ "%"
														: quote.PercentChange.toFixed(2)
														+ "%";
												apiType = "FOREX";
											}
										}

										tableToFill.row.add({
											"symbol" : quoteSymbol,
											"price" : price,
											"change" : change,
											"changePct" : changePct,
											"volume" : volume,
											"name" : name,
											"apiType" : apiType
										}).draw();
									}
								}
							}
							// updating quotes already in the table
							else {
								for (var i = 0; i < symbolArray.length; i++) {
									var quote = response[symbolArray[i]];
									var quoteSymbol;
									var change;
									var price;
									var name;
									var changePct;
									var volume;

									if (quote) {
										var row;

										// grab the correct row using the symbol id and update all the values
										if (quote.UseSuperQuotes) {
											row = tableToFill.row('#'
													+ quote.Symbol.replace(
															/\./g, '_'));

											if (row.data()) {
												if (quote.Last != row.data().price) {
													row.data().cssClass = "positive";
												} else {
													row.data().cssClass = "";
												}

												row.data().change = quote.Change > 0 ? "+"
														+ quote.Change
																.toFixed(2)
														+ ' <i class="fa fa-arrow-up"></i>'
														: quote.Change
																.toFixed(2)
																+ ' <i class="fa fa-arrow-down"></i>';
												row.data().price = quote.Last;
												row.data().changePct = quote.PercentChange > 0 ? "+"
														+ quote.PercentChange
																.toFixed(2)
														+ "%"
														: quote.PercentChange
																.toFixed(2)
																+ "%";
												row.data().volume = commaInt(quote.Volume);
												row.data().name = quote.Name;
											}
										} else {
											if (quote.Value) {
												row = tableToFill.row('#'
														+ quote.Symbol.replace(
																/\./g, '_'));

												if (row.data()) {

													var dataPrice = row.data().price;

													// check for historical or
													// delayed indicators
													if (typeof dataPrice === 'string') {
														dataPrice = dataPrice
																.replace(/\*/g,
																		'');
													}

													if (quote.Last != dataPrice) {
														row.data().cssClass = "positive";
													} else {
														row.data().cssClass = "";
													}

													row.data().change = quote.Change > 0 ? "+"
															+ quote.Change.toFixed(2)
															+ ' <i class="fa fa-arrow-up"></i>'
															: quote.Change.toFixed(2)
																	+ ' <i class="fa fa-arrow-down"></i>';
																	
													if (quote.Del){
														row.data().price = quote.Last
																+ "*";
													} else if (quote.Eod) {
														row.data().price = quote.Last
																+ "**";
													} else {
														row.data().price = quote.Last;
													}
													row.data().changePct = quote.PercentChange > 0 ? "+"
															+ quote.PercentChange.toFixed(2)
															+ "%"
															: quote.PercentChange.toFixed(2)
																	+ "%";
													row.data().volume = commaInt(quote.Volume);
													row.data().name = quote.Index.IndexName;
												}

											} else {
												row = tableToFill.row('#'
														+ quote.Symbol.replace(
																/\^/, ""));

												if (row.data()) {
													if (quote.Last != row.data().price) {
														row.data().cssClass = "positive";
													} else {
														row.data().cssClass = "";
													}

													row.data().change = quote.Change > 0 ? "+"
															+ quote.Change.toFixed(2)
															+ ' <i class="fa fa-arrow-up"></i>'
															: quote.Change.toFixed(2)
															+ ' <i class="fa fa-arrow-down"></i>';
													row.data().price = quote.Last;
													row.data().changePct = quote.PercentChange > 0 ? "+"
															+ quote.PercentChange.toFixed(2)
															+ "%"
															: quote.PercentChange.toFixed(2)
																	+ "%";
													row.data().volume = 0;
													row.data().name = quote.Symbol;
												}
											}
										}

										// update the data
										row.invalidate().draw();
									}
								}
							}
						}, identifierType, useSuperQuotes);
	};

	function addSymbolsTableOne(symbolToAdd) {
		var symbolArray;
		var addWlOne = [];
		var addWlTwo = [];

		// table 2 is full, symbol passed to table 1
		if (symbolToAdd) {
			symbolArray = symbolToAdd.toUpperCase().split(',');
		} else {
			// get value from symbol lookup
			var textValue = $(".ciq-search input[name=wl1]").val();

			// don't allow empty textbox values
			if (textValue || textValue.length > 0) {
				symbolArray = textValue.toUpperCase().split(',');
			}
		}

		if (symbolArray) {
			for (var i = 0; i < symbolArray.length; i++) {
				var exists = checkSymbolExists(symbolArray[i], true);

				if (exists) {
					return;
				} else {
					// if user wants functionality to impose quote limit and
					// push quotes to other watchlist uncomment if/else block
					// if (checkTableSize(table)) {

					var symbol = symbolArray[i].trim();
					if (symbol.length == 7 && symbol.indexOf("^") == 0) {
						symbols.push(symbol.replace(/\^/, ""));
						addWlOne.push(symbol.replace(/\^/, ""));
					} else {
						symbols.push(symbol);
						addWlOne.push(symbol);
					}
				}
			}
		}

		parentSetStorageValue("watchlist1", symbols.toString());

		if (addWlOne.length > 0) {
			getQuotes(table, addWlOne, true, false, true);
		}

		/**
		 * * if user wants functionality to impose quote limit and push quotes
		 * to other watchlist uncomment if block **
		 */
		// if (addWlTwo.length > 0) {
		// parentSetStorageValue("watchlist2", symbols2.toString());
		// //CIQStorage.set("watchlist2", symbols2.toString());
		// //STX.NameValueStore.prototype.set("watchlist2",
		// symbols2.toString());
		// getQuotes(table2, addWlTwo, true);
		// }
	}

	function addSymbolsTableTwo(symbolToAdd) {
		var symbolArray;
		var addWlTwo = [];

		// table 1 is full, symbol passed to table 2
		if (symbolToAdd) {
			symbolArray = symbolToAdd.toUpperCase().split(',');
		} else {
			// get value from symbol lookup
			var textValue = $(".ciq-search2 input[name=wl2]").val();

			// don't allow empty textbox values
			if (textValue || textValue.length > 0) {
				symbolArray = textValue.toUpperCase().split(',');
			}
		}

		for (var i = 0; i < symbolArray.length; i++) {
			var exists = checkSymbolExists(symbolArray[i], false);

			if (exists) {
				return;
			} else {
				// if user wants functionality to impose quote limit and push
				// quotes to other watchlist uncomment if/else block
				// if (checkTableSize(table2)) {

				var symbol = symbolArray[i].trim();
				if (symbol.length == 7 && symbol.indexOf("^") == 0) {
					symbols2.push(symbol.replace(/\^/, ""));
					addWlTwo.push(symbol.replace(/\^/, ""));
				} else {
					symbols2.push(symbol);
					addWlTwo.push(symbol);
				}
				// } else if (checkTableSize(table)) {
				// symbols.push(symbolArray[i].trim());
				// addWlOne.push(symbolArray[i].trim());
				// }
			}
		}

		/**
		 * * if user wants functionality to impose quote limit and push quotes
		 * to other watchlist uncomment if block **
		 */
		// if (addWlOne.length > 0) {
		// parentSetStorageValue("watchlist1", symbols.toString());
		// //CIQStorage.set("watchlist1", symbols.toString());
		// //STX.NameValueStore.prototype.set("watchlist1", symbols.toString());
		// getQuotes(table, addWlOne, true);
		// }
		parentSetStorageValue("watchlist2", symbols2.toString());

		if (addWlTwo.length > 0) {
			getQuotes(table2, addWlTwo, true, true);
		}
	}

	function checkTableSize(tableToCheck) {
		var tableCount = tableToCheck.data().count();

		// increase to 25 for production
		if (tableCount <= 5) {
			return true;
		}

		return false;
	}

	function deleteFromWatchlistOne(rowId) {

		// row.id for tr html, row.symbol for Datatables row api
		// check for indices and currency special characters
		table.row("#" + rowId.replace(/\./g, '_').replace(/\^/, "")).remove()
				.draw();

		for (var i = 0; i < symbols.length; i++) {
			// check for ^ as xignite doesn't return that character with the
			// symbol
			if (symbols[i].replace(/\^/, "").trim() === rowId.trim()) {
				symbols.splice(i, 1);
				break;
			}
		}

		if (sUser.length > 0) {
			searchAndDelete = true;
			searchForAlerts(sUser.toString(), rowId.trim().toLowerCase(),
					"wl1");
		}
		parentSetStorageValue("watchlist1", symbols.toString());
	}

	function deleteFromWatchlistTwo(rowId) {
		// row.id for tr html, row.symbol for Datatables row api
		// check for indices and currency special characters
		table2.row("#" + rowId.replace(/\./g, '_').replace(/\^/, "")).remove()
				.draw();

		for (var i = 0; i < symbols2.length; i++) {
			// check for ^ as xignite doesn't return that character with the
			// symbol
			if (symbols2[i].replace(/\^/, "").trim() === rowId.trim()) {
				symbols2.splice(i, 1);
				break;
			}
		}

		if (sUser.length > 0) {
			searchAndDelete = true;
			searchForAlerts(sUser.toString(), rowId.trim().toLowerCase(),
					"wl2");
		}
		parentSetStorageValue("watchlist2", symbols2.toString());
	}

	function updateSymbolTableOne(element) {
		var idValue = element[0].innerText;
		var htmlValue = element[0].innerHTML;
		var apiType = element[0].getAttribute("apitype");

		try {
			element.html('<input class="thVal inputStyle" type="text" value="'
					+ idValue + '" />');
			$(".thVal").select();
			$(".thVal").focus();

			// capture enter and escape key
			$(".thVal").keyup(
					function(event) {
						if (event.keyCode == 13) {
							$(".thVal").blur();
						} else if (event.keyCode == 27) {
							element.html(htmlValue);
							addTooltipMenu(element.find('.menuToolTip'), idValue,
									null, true, apiType);
						}
					});

			$(".thVal").focusout(
					function() {
						if (idValue.trim() != $(".thVal").val().trim()) {
							var valueToAdd = $(".thVal").val().trim();

							if (valueToAdd.length <= 0) {
								deleteFromWatchlistOne(idValue);
							} else {
								deleteFromWatchlistOne(idValue);
								addSymbolsTableOne(valueToAdd);
							}
						} else {
							element.html(htmlValue);
							addTooltipMenu(element.find('.menuToolTip'), idValue,
									null, true, apiType);
						}
					});
		} catch (exception) {
			console.log(exception);
		}
	}

	function updateSymbolTableTwo(element) {
		var idValue = element[0].innerText;
		var htmlValue = element[0].innerHTML;
		var apiType = element[0].getAttribute("apitype");

		try {
			element.html('<input class="thVal inputStyle" type="text" value="'
					+ idValue + '" />');
			$(".thVal").select();
			$(".thVal").focus();

			// capture enter and escape key
			$(".thVal").keyup(
					function(event) {
						if (event.keyCode == 13) {
							$(".thVal").blur();
						} else if (event.keyCode == 27) {
							element.html(htmlValue);
							addTooltipMenu(element.find('.menuToolTip'), idValue,
									null, false, apiType);
						}
					});

			$(".thVal").focusout(
					function() {
						if (idValue.trim() != $(".thVal").val().trim()) {
							var valueToAdd = $(".thVal").val().trim();

							if (valueToAdd.length <= 0) {
								deleteFromWatchlistTwo(idValue);
							} else {
								deleteFromWatchlistTwo(idValue);
								addSymbolsTableTwo(valueToAdd);
							}
						} else {
							element.html(htmlValue);
							addTooltipMenu(element.find('.menuToolTip'), idValue,
									null, false, apiType);
						}
					});
		} catch (exception) {
			console.log(exception);
		}
	}

	function updateTitle(element) {
		var childValue = element[0].firstChild;

		try {
			element.html('<input class="inputStyleTitle" type="text" value="'
					+ childValue.innerHTML + '" />');
			element[0].firstChild.select();

			$(".inputStyleTitle").focus();
			$(".inputStyleTitle").keyup(function(event) {
				if (event.keyCode == 13) {
					$(".inputStyleTitle").blur();
				} else if (event.keyCode == 27) {
					element.html("<label>" + childValue.innerHTML + "</label>")
				}
			});

			$(".inputStyleTitle")
					.focusout(
							function() {
								if (childValue.innerHTML.trim() != $(
										".inputStyleTitle").val().trim()) {
									var valueToAdd = $(".inputStyleTitle")
											.val().trim();
									element.html("<label>" + valueToAdd
											+ "</label>");
									parentSetStorageValue(element[0].id,
											valueToAdd);
								} else {
									element
											.html("<label>"
													+ childValue.innerHTML
													+ "</label>");
								}
							});
		} catch (exception) {
			console.log(exception);
		}
	}

	function launchChart(symbol) {
		location.href = "chart.html?sym=" + symbol;
	}

	/**
	 * Opens alert dialog
	 * 
	 * @param {string}
	 *            idValue The id of the table row
	 * @param {string}
	 *            idDescription The symbol description
	 * @param {string}
	 *            watchlistSrc The originating watchlist table
	 * @param {string}
	 *            apiType Xignite api to call for symbol
	 */
	function addEditAlert(idValue, idDescription, watchlistSrc, apiType) {
		$("#modalSymbol").text(idValue);
		$("#modalSymbolDescription").text(idDescription);
		$("#watchlistSrc").val(watchlistSrc);
		$("#apiType").val(apiType);

		// search for existing alerts and display results
		if (sUser.length > 0) {
			searchAndDelete = false;
			searchForAlerts(sUser.toString(), idValue.toLowerCase(),
					watchlistSrc);
		} else {
			console.log("user id query string not defined");
		}
	}

	/**
	 * Searches for existing alerts
	 * 
	 * @param {string}
	 *            userId The unique user id
	 * @param {string}
	 *            symbol The symbol to create an alert
	 * @param {string}
	 *            watchlistSrc The originating watchlist table
	 * @param {boolean}
	 *            searchAndDelete Trigger to determine if alerts just need to be
	 *            deleted
	 */
	function searchForAlerts(userId, symbol, watchlistSrc) {

		// disable buttons and show loading icon until alerts are returned
		$(":button:contains('Save')").prop("disabled", true).addClass(
				"ui-state-disabled");
		$(":button:contains('Clear')").prop("disabled", true).addClass(
				"ui-state-disabled");
		$("#alert-content").css("display", "none");
		$("#loading").css("display", "inline");

		// create unique string that allow for easy search of alerts
		// unique string = user id + symbol selected + watchlist table of origin
		var searchAlertUrl = urls["SEARCH"].replace("{pattern}", userId + symbol
				+ watchlistSrc);

		serverFetch(searchAlertUrl, null, null, processSearchResults);

		if (!searchAndDelete) {
			alertDialog.dialog("open");
		}
	}
	
	function processSearchResults(status, data) {

		if (status == 200) {
			data = JSON.parse(data);
	
			for (var i = 0; i < data.length; i++) {
				var condition = data[i].Condition
				alertIdArray.push(data[i].AlertIdentifier);
	
				// populate the alert dialog
				if (!searchAndDelete) {
					if (condition && condition.indexOf("Last<=") > -1) {
						var split = condition.split("<=");
	
						if (split.length > 1) {
							$("#modalLastPrice").val(split[1]);
						}
					} else if (condition
							&& condition
									.indexOf("PercentChangeFromPreviousClose>=") > -1) {
						var split = condition.split(">=");
	
						if (split.length > 1) {
							$("#modalPctUp").val(split[1]);
						}
					} else if (condition
							&& condition
									.indexOf("PercentChangeFromPreviousClose<") > -1) {
						var split = condition.split("<");
	
						if (split.length > 1) {
							$("#modalPctDown").val(split[1]);
						}
					} else if (condition
							&& condition.indexOf("High52Weeks") > -1) {
						$("#weeklyHigh").prop('checked', true);
					} else if (condition
							&& condition.indexOf("Low52Weeks") > -1) {
						$("#weeklyLow").prop('checked', true);
					}
				}
			}
	
			// if deleting a symbol from the table
			if (searchAndDelete) {
				deleteCreateAlerts(false);
			} else{
				// enable buttons and hide loading icon after a successful retrieval
				$("#alert-content").css("display", "inline");
				$("#loading").css("display", "none");
				$(":button:contains('Save')").removeAttr('disabled').removeClass("ui-state-disabled");
				$(":button:contains('Clear')").removeAttr('disabled').removeClass("ui-state-disabled");
				$(".loading-alerts").hide();
			}
		} else{
			console.log("Error retrieving alerts: status=" + status);
		}
	}

	/**
	 * Deletes alerts and can kick off create alerts process
	 * 
	 * @param {boolean}
	 *            searchAndDelete Trigger to determine if alerts just need to be
	 *            deleted
	 */
	function deleteCreateAlerts(createAlerts) {
		var alertIds;

		if (alertIdArray.length > 0) {
			alertIds = alertIdArray.toString();
		}

		// existing alerts need to be deleted even if creating new alerts so
		// duplicates don't exist
		// if no existing alerts then go ahead and create new alerts
		if (alertIds) {
			var deleteAlertUrl = urls["DELETE"].replace("{identifiers}", alertIds);
			serverFetch(deleteAlertUrl, null, null, function(status, data){
				
				if (status == 200) {
					data = JSON.parse(data);
					alertIdArray = [];

					if (createAlerts) {
						// now create alerts where necessary
						retrieveCreateFields();
					}
				} else{
					console.log("Error deleting alerts: status=" + status);
				}
			});
		} else if (createAlerts) {
			retrieveCreateFields();
		}
	}

	/**
	 * Gets all valid input values and creates an alert for each one. Xignite
	 * api ver. 2 might fix having to create muliple alerts at one time.
	 */
	function retrieveCreateFields() {
		if ($("#modalLastPrice").val().length > 0) {
			createAlert("Last>=" + $("#modalLastPrice").val() + " and "
					+ "Last<=" + $("#modalLastPrice").val());
		}

		if ($("#modalPctUp").val().length > 0) {
			createAlert("PercentChangeFromPreviousClose>="
					+ $("#modalPctUp").val());
		}

		if ($("#modalPctDown").val().length > 0) {
			createAlert("PercentChangeFromPreviousClose<"
					+ $("#modalPctDown").val());
		}

		// have to make another xignite call to get the 52 week high/low since superquotes doesn't return that value
		if ($("#weeklyHigh").prop('checked')) {
			
			XigniteMultiSnapshot
			.getQuotes(
					[$("#modalSymbol").text()],
					null,
					function(err, response) {
						var quote = response[$("#modalSymbol").text()];
						
						if(quote.Outcome === "Success"){
							if(quote.High52Weeks){
								createAlert("High52Weeks>" + quote.High52Weeks);
							}
						}
					}, identifierType, false);
		}

		if ($("#weeklyLow").prop('checked')) {
			
			XigniteMultiSnapshot
			.getQuotes(
					[$("#modalSymbol").text()],
					null,
					function(err, response) {
						var quote = response[$("#modalSymbol").text()];
						
						if(quote.Outcome === "Success"){
							if(quote.Low52Weeks){
								createAlert("Low52Weeks<" + quote.Low52Weeks);
							}
						}
					}, identifierType, false);
		}

		// clear alert fields after creation
		clearAlertFields();
	}

	/**
	 * Creates an alert
	 * 
	 * @param {string}
	 *            condition Query that will trigger an alert
	 */
	function createAlert(condition) {
		// create unique string that allow for easy search of alerts
		// unique string = user id + symbol selected + watchlist table of origin
		var uniqueId = sUser.toString()
				+ $("#modalSymbol").text().toLowerCase()
				+ $("#watchlistSrc").val();
		var xigniteApi = apiTypes[$("#apiType").val()];

		var createAlertUrl = urls["CREATE"].replace("{identifier}",
			$("#modalSymbol").text()).replace("{api}", xigniteApi).replace(
			"{condition}", condition).replace("{callbackUrl}",
			"http://chartiq.com/" + uniqueId);
		
		serverFetch(createAlertUrl, null, null, function(status, data){
			
			if (status == 200) {
				if (data.Message) {
					console.log(data.Message);
				}
			} else{
				console.log("Error creating alerts: status=" + status);
			}
		});
	}

	/**
	 * Clear all the alert dialog field values
	 */
	function clearAlertFields() {
		$("#modalLastPrice").val('');
		$("#modalPctUp").val('');
		$("#modalPctDown").val('');
		$("#weeklyHigh").prop('checked', false);
		$("#weeklyLow").prop('checked', false);
		count = 0;
	}

	/**
	 * helper function to add qtip onto the symbol text
	 * 
	 * @param tooltipFind
	 * @param fullSymbol
	 */
	function addTooltipSymbol(tooltipFind, fullSymbol, isTableOne) {

		tooltipFind.qtip({
			overwrite : false,
			content : {
				text : fullSymbol
			},
			position : {
				my : 'center left',
				at : 'right center',
				target : tooltipFind
			},
			hide : {
				fixed : true,
				delay : 0,
				effect : true,
				event : 'mouseleave click'
			}
		});

		tooltipFind.dblclick(function(e) {
			// check to catch empty string case
			if (tooltipFind[0].innerText.length > 0) {
				if (isTableOne) {
					updateSymbolTableOne(tooltipFind);
				} else {
					updateSymbolTableTwo(tooltipFind);
				}
			}
		});
	}

	/**
	 * helper function to add qtip onto the menu image ultimately this fixes the
	 * issue where user backs out of a symbol edit, before the tooltip would not
	 * appear again
	 * 
	 * @param menuFind
	 * @param idValue
	 * @param idDescription
	 * @param isTableOne
	 * @param apiType
	 */
	function addTooltipMenu(menuFind, idValue, idDescription, isTableOne, apiType) {
		var watchlistSrc = isTableOne ? "wl1" : "wl2";
		var deleteMethod = isTableOne ? 'deleteFromWatchlistOne'
				: 'deleteFromWatchlistTwo';
		var alertsTab = '<div class="linkSection"><a href="#" class="links" onclick="quoteboardFunctions.addEditAlert(\''
				+ idValue
				+ '\',\''
				+ idDescription
				+ '\',\''
				+ watchlistSrc
				+ '\',\''
				+ apiType + '\')">Add/Edit Alert</a></div>';
		var launchChartTab = '<div class="linkSection"><a href="#" class="links" onclick="quoteboardFunctions.launchChart(\''
				+ idValue + '\')">View Chart Tab</a></div>';
		
		// version 1 of xignite alert api doesn't support forex or indices, so don't even give the option
		// also don't show alert option if there is no user id
		if(apiType !== "SUPERQUOTES" || sUser.length <= 0){
			alertsTab = '';
		}

		menuFind.qtip({
					overwrite : true,
					content : {
						text : (getStyle(".quoteboard-alerts", "display")
								.indexOf("none") == 0 ? '' : alertsTab)
								+ (getStyle(".chart-access", "display")
										.indexOf("none") == 0 ? ''
										: launchChartTab)
								+ '<div><a href="#" class="links" onclick="quoteboardFunctions.'
								+ deleteMethod
								+ '(\''
								+ idValue
								+ '\')">Delete Symbol</a></div><div>'
					},
					position : {
						my : 'top left',
						at : 'top left',
						target : menuFind
					},
					style : {
						tip : {
							corner : false
						},
						classes : 'qtip-custom'
					},
					show: {
						event : 'click', // Can't use click event for this, sorry!
						delay : 300
					},
				    events: {
				        show: function(event, api) {
				        	// if user double clicks cancel single click
				        	if(doubleClicked){
				        		event.preventDefault();
				        		doubleClicked = false;
				        	}
				        }},
					hide : {
						fixed : true,
						delay : 0,
						effect : true,
						event : 'mouseleave click'
					}
		});
		
		// trick to make sure double click is caught
		menuFind.dblclick(function(e) {
			doubleClicked = true;
		});
	}

	function checkSymbolExists(symbolToCheck, wlOne) {
		var check;

		if (wlOne) {
			check = $.inArray(symbolToCheck.toUpperCase().replace(/\^/, ""),
					symbols);
		} else {
			check = $.inArray(symbolToCheck.toUpperCase().replace(/\^/, ""),
					symbols2);
		}

		// symbol already exists
		if (check > -1) {
			return true;
		}

		return false;
	}

	// initialize symbol lookup and create watchlists
	function init() {
		
		// retrive all values in local storage
		CIQWidgetStorage.get("watchlist1", localStorageWlOne);
		CIQWidgetStorage.get("watchlist2", localStorageWlTwo);
		CIQWidgetStorage.get("sortOrder1", sortOrderOne);
		CIQWidgetStorage.get("sortOrder2", sortOrderTwo);
		CIQWidgetStorage.get("label1", labelWlOne);
		CIQWidgetStorage.get("label2", labelWlTwo);

		// Search results hack to allow certain number of results
		for (var r = 1; r < PageLimits.searchResults; r++) {
			$('.ciq-search ul').first().append(
					$('.ciq-search li').first().clone());
			$('.ciq-search2 ul').first().append(
					$('.ciq-search2 li').first().clone());
		}

		$('#label1').dblclick(function(e) {
			e.stopPropagation();
			updateTitle($('#label1'));
		});

		$('#label2').dblclick(function(e) {
			e.stopPropagation();
			updateTitle($('#label2'));
		});
	}

	function parentSetStorageValue(storageKey, storageValue) {
		CIQWidgetStorage.set(storageKey, storageValue);
	}

	// Symbol searching for 1st watchlist table
	$('.ciq-search input[name=wl1]').on('focus', function() {
		window.SymbolLookupModule.loadSymbolLookupTables(true);
	});

	$(".ciq-search input[name=wl1]").focusout(function() {
		// get symbol value for adding, potential problem if clear of the
		// text field happens before adding, setTimeout a temporary solution
		setTimeout(function() {
			$(".ciq-search-results").hide();
			$(".ciq-search input[name=wl1]").val("");
		}, 500);
	});

	$('.ciq-search input[name=wl1]')
			.on(
					'keyup',
					function(event) {
						var input = $(this);

						// enter key pressed
						if (event.keyCode == 13) {
							addSymbolsTableOne(input.val());
							input.val("");
							isTyping = false;
							$(".ciq-search-results").hide();
							return;
						}

						// esc key pressed
						if (event.keyCode == 27) {
							input.val("");
							return;
						}

						if (input.val() && input.val().indexOf(',') <= 0) {
							isTyping = true;
							window.SymbolLookupModule
									.doSymbolLookup(
											"",
											input.val(),
											PageLimits.searchResults,
											function(results) {
												if (results.length) {
													$(".ciq-search-results li")
															.each(
																	function(
																			index) {
																		$(this)
																				.hide();
																		if (results[index]) {
																			$(
																					this)
																					.show();
																			$(
																					this)
																					.children(
																							"span")
																					.eq(
																							0)
																					.html(
																							results[index].symbol);
																			$(
																					this)
																					.children(
																							"span")
																					.eq(
																							1)
																					.html(
																							results[index].exchDisp);
																			$(
																					this)
																					.children(
																							"span")
																					.eq(
																							2)
																					.html(
																							results[index].name);
																			$(
																					this)
																					.attr(
																							"id",
																							results[index].symbol);
																			$(
																					this)
																					.on(
																							"click tap",
																							function(
																									event) {
																								if (event.currentTarget.id == results[index].symbol) {
																									input
																											.val('');
																									$(
																											".ciq-search-results")
																											.hide();
																									addSymbolsTableOne(results[index].symbol);
																								}
																								return false;
																							});
																		}
																	});

													if (isTyping) {
														$(".ciq-search-results")
																.show();
														setTimeout(
																function() {
																	if (myScroll
																			&& myScroll.searchWizardScroll)
																		myScroll.searchWizardScroll
																				.refresh();
																}, 0);
														isTyping = false;
													}

												} else {
													$(".ciq-search-results")
															.hide();
												}
											});
						} else {
							$(".ciq-search-results").hide();
						}
					});

	// Symbol searching for 2nd watchlist table
	$('.ciq-search2 input[name=wl2]').on('focus', function() {
		window.SymbolLookupModule.loadSymbolLookupTables(true);
	});

	$(".ciq-search2 input[name=wl2]").focusout(function() {
		// get symbol value for adding, potential problem if clear of the
		// text field happens before adding, setTimeout a temporary solution
		setTimeout(function() {
			$(".ciq-search-results2").css("display", "none");
			$(".ciq-search2 input[name=wl2]").val("");
		}, 500);
	});

	$('.ciq-search2 input[name=wl2]')
			.on(
					'keyup',
					function(event) {
						var input = $(this);

						// enter key pressed
						if (event.keyCode == 13) {
							addSymbolsTableTwo(input.val());
							input.val("");
							isTyping = false;
							$(".ciq-search-results2").hide();
							return;
						}

						// esc key pressed
						if (event.keyCode == 27) {
							input.val("");
							return;
						}

						if (input.val() && input.val().indexOf(',') <= 0) {
							isTyping = true;
							window.SymbolLookupModule
									.doSymbolLookup(
											"",
											input.val(),
											PageLimits.searchResults,
											function(results) {
												if (results.length) {
													$(".ciq-search-results2 li")
															.each(
																	function(
																			index) {
																		$(this)
																				.hide();
																		if (results[index]) {
																			$(
																					this)
																					.show();
																			$(
																					this)
																					.children(
																							"span")
																					.eq(
																							0)
																					.html(
																							results[index].symbol);
																			$(
																					this)
																					.children(
																							"span")
																					.eq(
																							1)
																					.html(
																							results[index].exchDisp);
																			$(
																					this)
																					.children(
																							"span")
																					.eq(
																							2)
																					.html(
																							results[index].name);
																			$(
																					this)
																					.attr(
																							"id",
																							results[index].symbol);
																			$(
																					this)
																					.on(
																							"click tap",
																							function(
																									event) {
																								if (event.currentTarget.id == results[index].symbol) {
																									input
																											.val('');
																									$(
																											".ciq-search-results2")
																											.hide();
																									addSymbolsTableTwo(results[index].symbol);
																								}
																								return false;
																							});
																		}
																	});

													if (isTyping) {
														$(
																".ciq-search-results2")
																.show();
														setTimeout(
																function() {
																	if (myScroll2
																			&& myScroll2.searchWizardScroll)
																		myScroll2.searchWizardScroll
																				.refresh();
																}, 0);
														isTyping = false;
													}
												} else {
													$(".ciq-search-results2")
															.hide();
												}
											});
						} else {
							$(".ciq-search-results2").hide();
						}
					});

	// watchlist one values
	function localStorageWlOne(value) {
		if (value) {
			var symbolSplit = value.split(',');

			for (var i = 0; i < symbolSplit.length; i++) {
				var symbol = symbolSplit[i];
				if (symbol.trim().length == 7 && symbol.indexOf("^") == 0) {
					symbols.push(symbol.replace(/\^/, ""));
				} else {
					symbols.push(symbol);
				}
			}
			
			if (symbols.length > 0) {
				getQuotes(table, symbols, true, false, true);
			}
		}
	}

	// watchlist two values
	function localStorageWlTwo(value) {
		if (value) {
			var symbolSplit = value.split(',');

			for (var i = 0; i < symbolSplit.length; i++) {
				var symbol = symbolSplit[i];
				if (symbol.trim().length == 7 && symbol.indexOf("^") == 0) {
					symbols2.push(symbol.replace(/\^/, ""));
				} else {
					symbols2.push(symbol);
				}
			}

			if (symbols2.length > 0) {
				getQuotes(table2, symbols2, true, false, true);
			}
		}
	}

	// watchlist one sort order column#,asc format
	// ex: 1,asc
	function sortOrderOne(value) {
		if (value) {
			var tableOrder = value.split(',');

			if (tableOrder.length == 2) {
				table.order([ [ tableOrder[0], tableOrder[1] ] ]).draw();
			} else {
				table.order([ 1, "asc" ]).draw();
			}
		}
	}

	// watchlist two sort order in column#,asc format
	// ex: 1,desc
	function sortOrderTwo(value) {
		if (value) {
			var tableOrder = value.split(',');

			if (tableOrder.length == 2) {
				table2.order([ [ tableOrder[0], tableOrder[1] ] ]).draw();
			} else {
				table.order([ 1, "asc" ]).draw();
			}
		}
	}

	// set title label for the first watchlist
	function labelWlOne(value) {
		if (value) {
			$("#wlOneLabel").text(value);
		} else {
			$("#wlOneLabel").text('Watchlist 1');
		}
	}

	// set title label for the second watchlist
	function labelWlTwo(value) {
		if (value) {
			$("#wlTwoLabel").text(value);
		} else {
			$("#wlTwoLabel").text('Watchlist 2');
		}
	}

	function getQuoteURL() {
		if (getStyle(".mn-quotes-overview", "display") != "none")
			return pageName("overview");
		else if (getStyle(".mn-quotes-news", "display") != "none")
			return pageName("news");
		else if (getStyle(".mn-quotes-company", "display") != "none")
			return pageName("company");
		else if (getStyle(".mn-quotes-financials", "display") != "none")
			return pageName("financials");
		else if (getStyle(".mn-quotes-filings", "display") != "none")
			return pageName("filings");
		else if (getStyle(".mn-quotes-insiders", "display") != "none")
			return pageName("insiders");
		return "javascript:void(0);";
	}

	var symbol = "";
	var sArr = queryStringValues("sym", location.search);
	var sUser = queryStringValues("userid", location.search);
	if (sArr.length)
		symbol = sArr[0].toUpperCase();
	var menu = document.getElementsByClassName("ciq-nav")[0];
	var options = menu.getElementsByTagName("A");
	for (var o = 0; o < options.length; o++) {
		if (hasClass(options[o].parentNode, "quotes"))
			options[o].href = getQuoteURL() + "?sym="
					+ encodeURIComponent(symbol);
		else
			options[o].href += "?sym=" + encodeURIComponent(symbol);
	}

	if (window.quoteboardFunctions)
		quoteboardFunctions = {
			"deleteFromWatchlistOne" : deleteFromWatchlistOne,
			"deleteFromWatchlistTwo" : deleteFromWatchlistTwo,
			"launchChart" : launchChart,
			"addEditAlert" : addEditAlert
		}
	
})(jQuery);