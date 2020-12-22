if (!window.quoteBoardData) window.quoteBoardData = {};
var clickEvents = false; //prevent multiple click events for the same click causing instabilities.

var quoteboardCallback = function (err, quoteData, list) {

	if (!verifyQuoteData(quoteData)) {
		dataSources[portalSettings.dataSource].fetchQuotes(_.uniq(_(quoteSymbolList).values().join().split(',')), updateQuoteCallback);
		return;
	}

	require(['moment', 'datatablesresponsive', 'datatablesdatetime'], function (moment) {
		_.each(list, function (widgetId, key) {
			var containerId = 'ciq-' + widgetId;
			var settings = portalSettings.items[widgetId];
			var containerObject = $('#' + containerId);
			containerObject.show();
			var carouselDiv = $('#' + 'quote-' + containerId);
			carouselDiv.html('');
			var data = [];

			var lists = [];

			_.each(settings.symbolList, function (symbols, listId) {
				symbols[1] = _.uniqWith(symbols[1], function (a, b) {
					return a[0] == b[0];
				});

				_.each(symbols[1], function (symbol, key2) {
					var d = quoteData[symbol[0]];
					if (!d) d = quoteData[symbol[0].slice(1)];
					if (d == null || d.Symbol == null) return;
					d = _.clone(d); // prevents same item in multiple lists from causing problems
					d.Symbol = symbol[0];
					d.Name = symbol[1];
					d.List = listId;
					d.Link = PortalCore.buildLink(settings.quoteURL ? settings.quoteURL : portalSettings.quoteURL, d.Symbol, d.Name);
					d.Delete = '<span class="delete">X</span>';
					data.push(d);
				});

				lists.push(symbols[0]);
			});

			quoteBoardData[containerId] = {
				data: data,
				lists: lists,
				activeList: settings.activeList
			};

			var visibleData = _.filter(quoteBoardData[containerId].data, function (o) {
				return o.List == settings.activeList;
			});

			/*_.each(settings.symbolList, function (symbol, key2) {
				var d = quoteData[symbol[0]];
				if (!d) d = quoteData[symbol[0].slice(1)];
				if (d == null || d.Symbol == null) return;
				d.Symbol = symbol[0];
				d.Name = symbol[1];
				data.push(d);
			});*/

			//var widgetId = containerId.split('-')[1];

			if ($('#' + containerId + '-table').length) {
				var dataTable = $('#' + containerId + '-table').DataTable();
				dataTable.clear();
				dataTable.rows.add(visibleData);
				dataTable.draw();

			} else {
				var navigation = $('<ul>').addClass('ciq-range-nav');
				var activeList = settings.activeList ? parseInt(settings.activeList) : 0;
				_.each(lists, function (listName, listIndex) {
					navigation.append('<li value="' + listIndex + '" ' + (listIndex == activeList ? 'class="active"' : '') + '>' + listName + '</li>');
				});

				if (settings.dependsOn) {
					navigation.append('<li value="ciq_createNewList">+ Add</li>')
				}

				containerObject.append(navigation);
				var table = $('<table>').attr('id', containerId + '-table').css('width', '100%').addClass('display responsive');
				containerObject.append(table);

				var dataTableColumns = [
					{
						"data": "Name",
						title: "Name",
						render: function (val, type, row, meta) {
							if (type == 'display' && val !== 'Name') {
								return row.Link;
							}
							return val;

						},
						className: "link"
					}, /*{
							"data": "Symbol",
							title: "Symbol"
						},*/ {
						"data": "Last",
						title: "Last",
						className: "right"
					}, {
						"data": "Change",
						title: "Change",
						render: function (val, type, row, meta) {
							if (val == 'N/A') {
								return 'N/A';
							}
							if (type == "display") {

								if (!val) val = 0;
								val = parseFloat(val).toFixed(2);
								if (val < 0) {
									return '<span class="stockdown">' + val + '</span>';
								} else if (val > 0) {
									return '<span class="stockup">' + val + '</span>';
								}
								return val;
							} else {
								return val;
							}
						},
						className: "right"
					}, {
						"data": "PercentChange",
						title: "%Change",
						render: function (val, type, row, meta) {
							if (val == 'N/A') {
								return 'N/A';
							}
							if (type == "display") {

								val = parseFloat(val).toFixed(2);
								if (val < 0) {
									return '<span class="stockdown">' + val + '%</span>';
								} else if (val > 0) {
									return '<span class="stockup">' + val + '%</span>';
								}
								return val;
							} else {
								return val;
							}
						},
						className: "right"
					}
				];

				if (settings.dependsOn) {
					dataTableColumns.push({
						data: 'Delete',
						title: '',
						orderable: false,
						className: "all delete",
						width: "20px"
					});
				}

				var dataTable = $('#' + containerId + '-table').dataTable({
					'data': visibleData,
					"columns": dataTableColumns,
					responsive: {
						details: false
					},
					paging: false,
					searching: false,
					bInfo: false,
					language: {
						"emptyTable": "Use the search to add items to this list"
					}
				});
				dataTable = $('#' + containerId + '-table').DataTable();
				var filteredRows = dataTable.rows({
					filter: 'applied'
				});
				if (dataTable.rows().count()) {
					var message = {
						sender: widgetId,
						subject: 'symbolChange',
						data: {
							symbol: dataTable.row(filteredRows[0][0]).data().Symbol,
							name: dataTable.row(filteredRows[0][0]).data().Name
						}

					}
					PortalCore.sendMessage(message);
				}


			}

			var addNewList = function (e) {
				e.stopPropagation();
				var listName = $('#' + containerId + '-newListName').val();
				if (listName.trim() == "") {
					return;
				}
				settings.symbolList.push([listName, []]);
				settings.activeList = settings.symbolList.length - 1;
				if (settings.useLocalStorage) {
					localStorage.setItem(widgetId, JSON.stringify(settings.symbolList));
				}
				var listItem = $($(e.target).parent());
				listItem.attr('value', settings.activeList).html(listName);
				listItem.trigger('click');
				listItem.parent().append($('<li>').attr('value', 'ciq_createNewList').html('+ Add'))


				//quoteboard(JSON.stringify([widgetId]));
			}

			var cancelNewList = function (e) {
				$($(e.target).parent()).attr('value', 'ciq_createNewList').html('+ Add');
				e.stopPropagation();
				e.preventDefault();
			}

			var listNameChange = function (e) {
				var listItem = $(this).parent();
				var newListName = listItem.children('input[type="text"]').val();
				if (newListName.trim() == "") return;
				var index = parseInt(listItem.attr("value"));
				settings.symbolList[index][0] = newListName;
				if (settings.useLocalStorage) {
					localStorage.setItem(widgetId, JSON.stringify(settings.symbolList));
				}
				listItem.html(newListName);

			}

			var cancelListNameChange = function (e) {
				var listItem = $(this).parent();
				var index = parseInt(listItem.attr("value"));
				var listName = settings.symbolList[index][0];
				listItem.html(listName);
			}

			var deleteList = function (e) {
				var listItem = $(this).parent();
				var index = parseInt(listItem.attr("value"));
				settings.symbolList.splice(index, 1);
				settings.activeList = 0;
				if (settings.useLocalStorage) {
					localStorage.setItem(widgetId, JSON.stringify(settings.symbolList));
				}
				listItem.remove();
				var last = $('#' + containerId + ' ul li').length - 1;
				_.each($('#' + containerId + ' ul li'), function (li, listIndex) {
					if (listIndex != last) $(li).attr('value', listIndex);
				})
				$($('#' + containerId + ' ul li')[0]).trigger('click');


			}

			if (!clickEvents) {
				$(document).on('dblclick', '#' + containerId + ' ul li', function (e) {
					if ($(this).attr('clickedon') == '1' || $(this).attr('value') == 'ciq_creatingNewList') {
						return;
					}
					$(this).attr('clickedon', '1');
					e.stopPropagation();
					e.preventDefault();
					var listName = $(this).html();
					var nameChangeButton = $('<button>').attr('id', containerId + '-addNewList').click(listNameChange).html('&#10003;').attr('title', 'Change Name');
					var cancelNameChangeButton = $('<button>').attr('id', containerId + '-cancelNewList').click(cancelListNameChange).html('x').attr('title', 'Cancel');
					var deleteListButton = $('<button>').attr('id', containerId + '-cancelNewList').click(deleteList).html('-').attr('title', 'Delete List');

					$(this).html('<input type="text" value="' + listName + '">');
					$(this).append(nameChangeButton).append(cancelNameChangeButton);
					if (settings.symbolList.length > 1) $(this).append(deleteListButton);
					if (document.selection) document.selection.empty();
					if (window.getSelection) window.getSelection().removeAllRanges();
					$(this).children('input[type="text"]').focus();
				});

				$(document).on('click', '#' + containerId + ' ul li', function (e) {
					// deal with adding new list
					if ($(this).attr('value') == 'ciq_createNewList') {
						$(this).attr('value', 'ciq_creatingNewList');
						var listAddButton = $('<button>').attr('id', containerId + '-addNewList').click(addNewList).html('+').attr('title', 'Add');
						var cancelAddButton = $('<button>').attr('id', containerId + '-cancelNewList').click(cancelNewList).html('x').attr('title', 'Cancel');
						$(this).html('<input id="' + containerId + '-newListName" type="text">');
						$(this).append(listAddButton).append(cancelAddButton);
						return;
					}

					if ($(this).attr('value') == 'ciq_creatingNewList') {
						return;
					}

					$(this).parent().children().removeClass('active');
					$(this).addClass('active');
					settings.activeList = $(this).attr('value');
					quoteBoardData[containerId].activeList = settings.activeList;
					visibleData = _.filter(quoteBoardData[containerId].data, function (o) {
						return o.List == settings.activeList;
					});
					var dataTable = $('#' + containerId + '-table').DataTable();
					dataTable.clear();
					dataTable.rows.add(visibleData);
					dataTable.draw();
					var filteredRows = dataTable.rows({
						filter: 'applied'
					});
					if (dataTable.rows().count()) {
						var message = {
							sender: widgetId,
							subject: 'symbolChange',
							data: {
								symbol: dataTable.row(filteredRows[0][0]).data().Symbol,
								name: dataTable.row(filteredRows[0][0]).data().Name
							}

						}
						PortalCore.sendMessage(message);
					}


					$('#' + containerId + '-table td').on('click', function (e) {
						var dataTable = $('#' + containerId + '-table').DataTable();
						var row = dataTable.row(dataTable.cell(this)[0][0].row);
						if ($(this.children[0]).hasClass('delete')) {
							_.remove(settings.symbolList[settings.activeList][1], function (o) { return o[0] == row.data().Symbol });
							if (settings.useLocalStorage) localStorage.setItem(widgetId, JSON.stringify(settings.symbolList));


							row.remove().draw();
							return;
						}

						var message = {
							sender: widgetId,
							subject: 'symbolChange',
							data: {
								symbol: row.data().Symbol,
								name: row.data().Name
							}

						}
						PortalCore.sendMessage(message, true);



					});

				});
				clickEvents = true;

			}
			$('#' + containerId + '-table td').on('click', function (e) {
				var dataTable = $('#' + containerId + '-table').DataTable();
				var row = dataTable.row(dataTable.cell(this)[0][0].row);
				if ($(this.children[0]).hasClass('delete')) {
					_.remove(settings.symbolList[settings.activeList][1], function (o) { return o[0] == row.data().Symbol });
					if (settings.useLocalStorage) localStorage.setItem(widgetId, JSON.stringify(settings.symbolList));


					row.remove().draw();
					return;
				}
				var message = {
					sender: widgetId,
					subject: 'symbolChange',
					data: {
						symbol: row.data().Symbol,
						name: row.data().Name
					}

				}
				PortalCore.sendMessage(message, true);
			});







		});
	});
}

function quoteboard(list) {
	list = JSON.parse(list);
	var allSymbols = [];

	_.each(list, function (widgetId, key) {
		var container = 'ciq-' + widgetId;
		var settings = defaultSettings.items[widgetId];
		var containerObject = $('#' + container);

		if (settings.message && settings.message.data && settings.message.data.symbolName) {
			settings.symbolName = settings.message.data.symbolName;
		}

		if (settings.message && settings.message.data && settings.message.data.symbol) {
			settings.symbol = settings.message.data.symbol;
		}

		var symbol = settings.symbol;
		var symbolName = settings.symbolName;

		if (!symbolName) symbolName = symbol;

		if (settings.useLocalStorage) {
			savedSymbolList = localStorage.getItem(widgetId);
			if (savedSymbolList) {
				settings.symbolList = JSON.parse(savedSymbolList);
				defaultSettings.items[widgetId] = settings;
			} else {
				localStorage.setItem(widgetId, JSON.stringify(settings.symbolList));
			}
		}

		if (!settings.activeList) settings.activeList = 0;

		if (symbol) {
			settings.symbolList[settings.activeList][1].push([symbol, symbolName]);
			if (settings.useLocalStorage) localStorage.setItem(widgetId, JSON.stringify(settings.symbolList));
		}

		_.each(settings.symbolList, function (symbols) {
			_.each(symbols[1], function (symbol, key2) {
				allSymbols.push(symbol);
			});
		});

		//settings.symbolList = _.uniq(_.map(settings.symbolList, 0));
		//allSymbols = _.union(allSymbols, settings.symbolList);

		var carouselDiv = $('<div>').attr('id', 'quote-' + container).css('width', '100%');

		containerObject.append(carouselDiv);
		containerObject.addClass('ciq-mkt-ticker').css('width', '100%');


	});
	allSymbols = _.uniq(_.map(allSymbols, 0));
	//dataSources[portalSettings.dataSource].fetchQuotes(allSymbols, quoteboardCallback, list);

	require(['modules/quote'], function () {
		dataSources[portalSettings.dataSource].fetchQuotes(allSymbols, quoteboardCallback, list);
		//quoteSymbolList = _.union(quoteSymbolList, allSymbols);
		quoteSymbolList[_.join(list)] = allSymbols;
		quoteDependencyList[_.join(list)] = {
			quoteCallback: quoteboardCallback,
			extraParams: list
		};
		updateQuote();
	});

	PortalCore.addStyleSheet('https://cdn.jsdelivr.net/jquery.datatables/1.10.10/css/jquery.dataTables.min.css');
	PortalCore.addStyleSheet('https://cdn.jsdelivr.net/jquery.datatables/1.10.10/plugins/responsive/css/responsive.dataTables.min.css');
	//PortalCore.addStyleSheet(cssUrl + 'modules/quoteboard.css');
}