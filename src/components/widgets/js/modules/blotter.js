if (!window.quoteBoardData) window.quoteBoardData = {};
window.grid = {};
var flashMap = {
	red: function (v) {
		return 'rgba(255, 0, 0, ' + v + ')';
	},
	green: function (v) {
		return 'rgba(0, 255, 0, ' + v + ')';
	}
};



/**
 * @summary Renders single line text.
 * @param {CanvasRenderingContext2D} gc
 * @param {object} config
 * @param {Rectangle} config.bounds - The clipping rect of the cell to be rendered.
 * @param {*} val - The text to render in the cell.
 * @memberOf SimpleCell.prototype
 */
function renderSingleLineText(gc, config, val, leftPadding, rightPadding) {
	var x = config.bounds.x,
		y = config.bounds.y,
		width = config.bounds.width,
		halignOffset = leftPadding,
		halign = config.halign,
		minWidth,
		metrics;

	if (config.columnAutosizing) {
		metrics = gc.getTextWidthTruncated(val, width - leftPadding, config.truncateTextWithEllipsis);
		minWidth = metrics.width;
		val = metrics.string || val;
		switch (halign) {
			case 'right':
				halignOffset = width - rightPadding - metrics.width;
				break;
			case 'center':
				halignOffset = (width - metrics.width) / 2;
				break;
		}
	} else {
		metrics = gc.getTextWidthTruncated(val, width - leftPadding, config.truncateTextWithEllipsis, true);
		minWidth = 0;
		if (metrics.string !== undefined) {
			val = metrics.string;
		} else {
			switch (halign) {
				case 'right':
					halignOffset = width - rightPadding - metrics.width;
					break;
				case 'center':
					halignOffset = (width - metrics.width) / 2;
					break;
			}
		}
	}

	if (val !== null) {
		x += Math.max(leftPadding, halignOffset);
		y += config.bounds.height / 2;

		gc.cache.textAlign = 'left';
		gc.cache.textBaseline = 'middle';
		gc.simpleText(val, x, y);
	}

	return minWidth;
}

function RGBArrayToString(RGBArray) {
	var alpha = RGBArray.length > 3 ? RGBArray[3] : 1;
	return 'rgba(' + RGBArray[0] + ',' + RGBArray[1] + ',' + RGBArray[2] + ',' + alpha + ')';
}
function getDarkenedColor(gc, color, factor) {
	var rgba = getRGBA(color);
	return 'rgba(' + Math.round(factor * rgba[0]) + ',' + Math.round(factor * rgba[1]) + ',' + Math.round(factor * rgba[2]) + ',' + (rgba[3] || 1) + ')';
}

function getRGBA(colorSpec) {
	var rgba = colorSpec.match(REGEXP_CSS_HEX6);
	if (rgba) {
		rgba.shift(); // remove whole match
		rgba.forEach(function (val, index) {
			rgba[index] = parseInt(val, 16);
		});
	} else {
		rgba = colorSpec.match(REGEXP_CSS_RGB);
		if (!rgba) {
			throw 'Unexpected format getting CanvasRenderingContext2D.fillStyle';
		}
		rgba.shift(); // remove whole match
	}

	return rgba;
}
function paintLastRenderer(gc, config) {
	var x = config.bounds.x,
		y = config.bounds.y,
		width = config.bounds.width,
		height = config.bounds.height,
		options = config.value,
		domain = options.domain || config.domain || 100,
		sizeFactor = options.sizeFactor || config.sizeFactor || 0.65,
		darkenFactor = options.darkenFactor || config.darkenFactor || 0.75,
		color = options.color || config.color || 'white',
		shadowColor = options.shadowColor || config.shadowColor || 'transparent',
		font = options.font || config.font || '14px Roboto',
		middle = height / 2,
		val = config.dataRow[config.columnName];
	//config.columnAutosizing = true;
	gc.cache.shadowColor = 'transparent';

	gc.cache.lineJoin = 'round';
	if (val) {
		var textColor = '#fff';
		if (!config.dataRow.cellColors) {
			config.dataRow.cellColors = {};
		}
		config.dataRow.cellColors[config.columnName] = textColor;
		if (config.dataRow.PreviousRow) {
			if (Number(config.dataRow.PreviousRow[config.columnName]) < Number(config.dataRow[config.columnName])) {
				textColor = '#0ccd87';
				config.dataRow.cellColors[config.columnName] = textColor;
			} else if (Number(config.dataRow.PreviousRow[config.columnName]) > Number(config.dataRow[config.columnName])) {
				textColor = '#ee5c5c';
				config.dataRow.cellColors[config.columnName] = textColor;
			} else if (config.dataRow.PreviousRow.cellColors && config.dataRow.PreviousRow.cellColors[config.columnName]) {
				textColor = config.dataRow.PreviousRow.cellColors[config.columnName];
			}
		}
		gc.cache.font = '14px Roboto';
		if (config.isCellSelected) {
			gc.cache.fillStyle = 'rgba(37, 44, 87, 0.7)';
			gc.fillRect(x, y, width, height);
			gc.cache.font = 'bold 14px Roboto';
		}
		if (config.isRowHovered) {
			gc.cache.fillStyle = 'rgba(93, 95, 97, 0.7)';
			gc.fillRect(x, y, width, height);
		}

		gc.cache.fillStyle = textColor;
		renderSingleLineText(gc, config, val, config.leftPadding, config.rightPadding);
	}
}

function round(value, decimals) {
	return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}
function getRandom(min, max) {
	return round(Math.random() * (max - min) + min, 2);
}
// CUSTOM CELL RENDERER
var REGEXP_CSS_HEX6 = /^#(..)(..)(..)$/,
	REGEXP_CSS_RGB = /^rgba\((\d+),(\d+),(\d+),\d+\)$/;


var blotterCallback = function (err, quoteData, list) {

	require(['//globalwidgets.xignite.com/ChartIQ/ChartIQCDNv1/v2/finsemble/js/thirdparty/openfin-hypergrid.js'], function () {
		_.each(list, function (widgetId, key) {
			var containerId = 'ciq-' + widgetId;
			var settings = portalSettings.items[widgetId];
			var containerObject = $('#' + containerId);
			if (!grid[containerId]) {
				grid[containerId] = new fin.Hypergrid('#' + containerId, {
					data: [{
						'Symbol': '',
						'PreviousClose': '',
						'Last': '',
						'Bid': '',
						'Ask': '',
						'Volume': ''
					}]
				});

				//Extend HyperGrid's base Renderer
				var lastRenderer = grid[containerId].cellRenderers.get('simplecell').constructor.extend({
					paint: paintLastRenderer
				});
				//Register your renderer
				grid[containerId].cellRenderers.add('Last', lastRenderer);
				grid[containerId].behavior.dataModel.getCell = function (config, declaredRendererName) {
					config.leftPadding = 5;
					config.rightPadding = 5;
					if (['Last', 'Bid', 'Ask'].indexOf(config.columnName) > -1) {
						if (config.dataRow[config.columnName]) {
							declaredRendererName = 'Last';
						}
					}
					config.font = '14px Roboto';
					if (config.columnName === 'Symbol') {
						config.font = '600 14px Roboto'
					}
					config.halign = 'left';
					return grid[containerId].cellRenderers.get(declaredRendererName);
				};
				grid[containerId].behavior.setHeaders(['Symbol', 'Close', 'Last', 'Bid', 'Ask', 'Volume',]);
				grid[containerId].behavior.setFields(['Symbol', 'PreviousClose', 'Last', 'Bid', 'Ask', 'Volume']);
				grid[containerId].addProperties({
					showRowNumbers: false,
					gridLinesH: true,
					gridLinesV: false,
					backgroundColor: '#1c2a35',
					backgroundSelectionColor: 'rgba(37, 44, 87, 0.7)',
					foregroundSelectionColor: '#fff',
					foregroundSelectionFont: 'bold 14px Roboto',
					color: '#fff',
					defaultRowHeight: 45,
					checkboxOnlyRowSelection: false,
					columnHeaderBackgroundColor: '#000',
					columnHeaderBackgroundSelectionColor: 'rgba(37, 44, 49, 0.7)',
					columnHeaderForegroundSelectionColor: 'white',
					columnHeaderColor: '#fff',
					hoverColumnHighlight: {
						enabled: false
					},
					hoverRowHighlight: {
						enabled: true,
						backgroundColor: 'rgba(93, 95, 97, 0.7)'
					},
					hoverCellHighlight: {
						enabled: false
					},
					rowSelection: false
				});
				document.dispatchEvent(new CustomEvent('fin-grid-ready'));
			}

			var gridInstance = grid[containerId];

			var cellRenderers = gridInstance.cellRenderers;



			if (!verifyQuoteData(quoteData)) {
				dataSources[portalSettings.dataSource].fetchQuotes(_.uniq(_(quoteSymbolList).values().join().split(',')), updateQuoteCallback);
				return;
			}

			var data = [];
			//compare symbols from settings to what's in quoteData.
			_.each(settings.symbolList, function (symbols, listId) {
				symbols[1] = _.uniqWith(symbols[1], function (a, b) {
					return a[0] == b[0];
				});
				_.each(symbols[1], function (symbol, key2) {
					var d = quoteData[symbol[0]];
					if (!d) d = quoteData[symbol[0].slice(1)];
					if (d == null || d.Symbol == null) return;
					d.Symbol = symbol[0];
					var PreviousRow = gridInstance.getRow(key2);
					//The 2nd time data comes in you can end up with PreviousRow.PreviousRow.
					//3rd time, you get PreviousRow.PreviousRow.PreviousRow...etc.
					if (PreviousRow && PreviousRow.PreviousRow) {
						delete PreviousRow.PreviousRow;
					}
					data.push({
						Symbol: d.Symbol,
						PreviousClose: d.PreviousClose || d.Close,
						Last: d.Last,
						Bid: d.Bid,
						Ask: d.Ask,
						Volume: PortalCore.condenseInt(d.Volume),
						PreviousRow: PreviousRow
					});
				});
			});
			gridInstance.behavior.setData({
				data: data
			});

			containerObject.show();

		})
	});

}

function blotter(list) {
	list = JSON.parse(list);
	var allSymbols = [];

	_.each(list, function (widgetId, key) {
		var container = 'ciq-' + widgetId;
		var settings = defaultSettings.items[widgetId];
		var containerObject = $('#' + container);

		if (settings.message && settings.message.data && settings.message.data.symbol) {
			settings.symbol = settings.message.data.symbol;
		}

		if (settings.message && settings.message.data && settings.message.data.symbolName) {
			settings.symbolName = settings.message.data.symbolName;
		}



		var symbol = settings.symbol;
		var symbolName = settings.symbolName;

		if (settings.useLocalStorage) {
			settingsText = localStorage.getItem(widgetId);
			if (settingsText) {
				settings = JSON.parse(settingsText);
				defaultSettings.items[widgetId] = settings;
			} else {
				localStorage.setItem(widgetId, JSON.stringify(settings));
			}
		}

		if (!settings.activeList) settings.activeList = 0;

		if (symbol) {
			settings.symbolList[settings.activeList][1].push([symbol, symbolName]);
			if (settings.useLocalStorage) localStorage.setItem(widgetId, JSON.stringify(settings));
		}

		_.each(settings.symbolList, function (symbols) {
			_.each(symbols[1], function (symbol, key2) {
				allSymbols.push(symbol);
			});
		});

	});
	allSymbols = _.uniq(_.map(allSymbols, 0));
	dataSources[portalSettings.dataSource].fetchQuotes(allSymbols, blotterCallback, list);

	require(['modules/quote'], function () {
		quoteSymbolList[_.join(list)] = allSymbols;
		//quoteSymbolList = _.union(quoteSymbolList, allSymbols);
		quoteDependencyList[_.join(list)] = {
			quoteCallback: blotterCallback,
			extraParams: list
		};
		updateQuote();
	});

	//PortalCore.addStyleSheet(cssUrl + 'modules/quoteboard.css');
}