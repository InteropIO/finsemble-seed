function get52WeekHTML(low, high, last) {
	var width = (100 * (Number(last) - Number(low)) / (Number(high) - Number(low))).toString() + "%";
	return '<div class="ciq-range"><div class="ciq-range-fill" style="width:' + width + '"><div class="ciq-range-tab"></div></div><div class="ciq-range-low"><span>' + low + '</span></div><div class="ciq-range-high"><span>' + high + '</span></div></div>';
}

function fundamentalsCallback(err, fundamentalsData, containerObject) {
	//for(var key in itemList) {
	var container = containerObject.attr('id');
	var widgetId = container.split('-')[1];
	var settings = defaultSettings.items[widgetId];
	if (settings.message && settings.message.data && settings.message.data.symbol) {
		settings.symbol = settings.message.data.symbol;
	}
	var tables = [];
	var displayNames = {};
	if (fundamentalsData.isMutual) {
		tables = settings.display.fund;
		displayNames = settings.fundamentals.fund;
	} else if (fundamentalsData.isETF || fundamentalsData.isCEF) {
		tables = settings.display.etf;
		displayNames = settings.fundamentals.etf;
	} else {
		tables = settings.display.stock;
		displayNames = settings.fundamentals.stock;
	}
	var tableContainer = containerObject;
	tableContainer.html('');

	var fCount = 0;
	var exists = false;
	_.each(tables, function (tableDetails, tKey) {
		tableContainer.append('<h3>' + tableDetails[0] + '</h3>');
		_.each(tableDetails[1], function (table, tSubKey) {
			tableId = '#ciq-additional-table-' + tKey + '-' + tSubKey;
			if (!jQuery(tableId).length) {
				var width = 100 / tableDetails[1].length;
				var float = (width < 100) ? 'left' : '';
				var fdiv = $('<div>').addClass('ciq-col ciq-quote-fundamental').css('width', width + '%').css('float', float);
				fdiv.append('<table id="ciq-additional-table-' + tKey + '-' + tSubKey + '" class="ciq-table"><tbody></tbody></table>');

				tableContainer.append(fdiv);
				exists = false;
			} else {
				exists = true;
			}

			_.each(table, function (row) {
				if (!exists) {
					// special cases
					if (_.isObject(displayNames[row])) {
						switch (displayNames[row].Type) {
							case 'Ratio':
								fundamentalsData[row] = fundamentalsData[displayNames[row].Value1] / fundamentalsData[displayNames[row].Value2];
							case 'Range':
								fundamentalsData[row] = get52WeekHTML(fundamentalsData[displayNames[row].Value1], fundamentalsData[displayNames[row].Value2], fundamentalsData.Last);
						}
					}
					if (_.isArray(fundamentalsData[row])) {
						var rowItems = _.keys(fundamentalsData[row][0]);
						var rowTable = $('<table>');
						//						if (_.size(rowItems)>1) {
						var headerRow = $('<tr>');
						_.each(rowItems, function (key) {
							headerRow.append('<th>' + key + '</th>');
						});
						rowTable.append(headerRow);
						//						} else {
						_.each(fundamentalsData[row], function (value) {
							var row = $('<tr>');
							_.each(rowItems, function (key) {
								row.append('<td>' + value[key] + '</td>');
							});
							rowTable.append(row);
						});

						//						}
						$(tableId + '  > tbody:last-child').append('<tr><td>' + (displayNames[row].TitleText ? displayNames[row].TitleText : displayNames[row]) + '</td><td id="ciq-additional-row' + fCount + '"></td></tr>');
						$('#ciq-additional-row' + fCount).append(rowTable);


					} else {
						$(tableId + '  > tbody:last-child').append('<tr><td>' + (displayNames[row].TitleText ? displayNames[row].TitleText : displayNames[row]) + '</td><td id="ciq-additional-row' + fCount + '">' + fundamentalsData[row] + '</td></tr>');
					}
				} else {
					if (_.isArray(fundamentalsData[row])) {
						var rowItems = _.keys(fundamentalsData[row][0]);
						var rowTable = $('<table>');
						//						if (_.size(rowItems)>1) {
						var headerRow = $('<tr>');
						_.each(rowItems, function (key) {
							headerRow.append('<th>' + key + '</th>');
						});
						rowTable.append(headerRow);
						//						} else {
						_.each(fundamentalsData[row], function (value) {
							var row = $('<tr>');
							_.each(rowItems, function (key) {
								row.append('<td>' + value[key] + '</td>');
							});
							rowTable.append(row);
						});

						//						}
						jQuery('#ciq-additional-row' + fCount).html('');
						jQuery('#ciq-additional-row' + fCount).append(rowTable);

					} else {
						jQuery('#ciq-additional-row' + fCount).html(fundamentalsData[row]);
					}
				}
				fCount++;
			});
		});
	});

	containerObject.show();

	$(window).on('resize', _.debounce(function () {
		if (!window.prevWidth) window.prevWidth = 0;

		newWidth = $(window).width();
		if (newWidth > prevWidth && newWidth - prevWidth < 30) return;

		prevWidth = newWidth;

		_.each(tables, function (tableDetails, tKey) {
			_.each(tableDetails[1], function (table, tSubKey) {
				tableId = '#ciq-additional-table-' + tKey + '-' + tSubKey;
				var div = $(tableId).parent();

				var width = 100 / tableDetails[1].length;
				var float = (width < 100) ? 'left' : '';
				div.css('width', width + '%');
				if (div.width() < 250) {
					width = 100;
				}
				div.css('width', width + '%').css('float', float);



			});
		});


	}, 250));



}

function fundamentalsQuoteCallback(err, quoteData, containerObject) {
	//debugger;
}

function fundamentals(list) {
	list = JSON.parse(list);
	// symbolList = [];
	_.each(list, function (widgetId, key) {
		var container = 'ciq-' + widgetId;
		var settings = portalSettings.items[widgetId];
		if (settings.message && settings.message.data && settings.message.data.symbol) {
			settings.symbol = settings.message.data.symbol;
		}
		var containerObject = $('#' + container);
		settings.id = key;
		if (!settings.symbol) settings.symbol = portalSettings.defaultSymbol;
		//function fetchDetailedQuote(symbol, fundamentalList, quoteCB, fundamentalsCB, extraParams) {
		dataSources[portalSettings.dataSource].fetchDetailedQuote(settings.symbol, settings.fundamentals, fundamentalsQuoteCallback, fundamentalsCallback, containerObject);
		// send messages?
		var message = {
			sender: widgetId,
			subject: 'symbolChange',
			data: {
				symbol: settings.symbol
			}

		}
		PortalCore.sendMessage(message);

	});
	//PortalCore.addStyleSheet(cssUrl + 'modules/fundamentals.css');
	// symbolList = _.uniq(symbolList);
}