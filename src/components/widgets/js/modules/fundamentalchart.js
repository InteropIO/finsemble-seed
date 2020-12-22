var fundamentalChartWrappers = [];

function get52WeekHTML(low, high, last) {
	var width = (100 * (Number(last) - Number(low)) / (Number(high) - Number(low))).toString() + "%";
	return '<div class="ciq-range"><div class="ciq-range-fill" style="width:' + width + '"><div class="ciq-range-tab"></div></div><div class="ciq-range-low"><span>' + low + '</span></div><div class="ciq-range-high"><span>' + high + '</span></div></div>';
}

function fundamentalchartsCallback(err, fundamentalsData, containerObject) {
	//for(var key in itemList) {
	if (!fundamentalsData || (fundamentalsData && !_.size(fundamentalsData.fundamentals))) {
		containerObject.html('');
		return;
	}
	var containerId = containerObject.attr('id');
	var widgetId = containerId.split('-')[1];
	var settings = defaultSettings.items[widgetId];
	if (settings.message && settings.message.data && settings.message.data.symbol) {
		settings.symbol = settings.message.data.symbol;
	}
	require(['googlecharts'], function () {

		google.charts.load('45', {
			'packages': ['corechart']
		});
		google.charts.setOnLoadCallback(drawFundamentalChart);

		function drawFundamentalChart() {
			var sortedData = _.sortBy(fundamentalsData.fundamentals, ['Date']);


			var chartData = new google.visualization.DataTable();
			chartData.addColumn('date', 'Date');
			_.each(settings.fundamentals, function (value) {
				chartData.addColumn('number', value.label);
			});
			/*
				var row = [];
				row.push(new Date(parseInt(key)));
				_.each(settings.fundamentals, function (fundamental) {
					row.push(value[fundamental.label]);
				});
				chartData.addRow(row);
			});*/
			_.each(settings.fundamentals, function (value, key) {
				if (value.term == 'Annual' && value.calculate == 'Growth') {
					for (var i = sortedData.length - 1; i >= 0; i--) {
						if (sortedData[i][value.label] && i - 4 > 0) {
							sortedData[i][value.label] = (sortedData[i][value.label] - sortedData[i - 4][value.label]) / sortedData[i - 4][value.label] * 100;
						} else {
							sortedData[i][value.label] = null;
						}
					}
				} else if ((value.term == 'Quarterly' || value.term == 'TTM') && (value.calculate == 'YoY' || value.calculate == 'Growth')) {
					for (var i = sortedData.length - 1; i >= 0; i--) {
						if (sortedData[i][value.label] && i - 4 > 0) {
							sortedData[i][value.label] = (sortedData[i][value.label] - sortedData[i - 4][value.label]) / sortedData[i - 4][value.label] * 100;
						} else {
							sortedData[i][value.label] = null;
						}
					}
				} else if ((value.term == 'Quarterly' || value.term == 'TTM') && value.calculate == 'QoQ') {
					for (var i = sortedData.length - 1; i >= 0; i--) {
						if (sortedData[i][value.label] && i - 1 > 0) {
							sortedData[i][value.label] = (sortedData[i][value.label] - sortedData[i - 1][value.label]) / sortedData[i - 1][value.label] * 100;
						} else {
							sortedData[i][value.label] = null;
						}
					}
				}
			});

			_.each(sortedData, function (value, key) {
				var row = [];
				row.push(new Date(parseInt(value.Date)));
				_.each(settings.fundamentals, function (fundamental) {
					row.push(value[fundamental.label]);
				});
				chartData.addRow(row);
			});

			var chartDivId = containerId + '-chart' + settings.id;
			var chartDiv;

			if (!$('#' + chartDivId).length) {
				chartDiv = $('<div>').attr('id', chartDivId).css('width', '100%');
				containerObject.append(chartDiv);
			} else {
				chartDiv = $('#' + chartDivId);
			}

			var xAxisTextColor = PortalCore.getStyleRuleValue('color', '.ciq-FundamentalChart-chart-xAxis');
			if (!xAxisTextColor) xAxisTextColor = $('body').css('color');

			var yAxisTextColor = PortalCore.getStyleRuleValue('color', '.ciq-FundamentalChart-chart-yAxis');
			if (!yAxisTextColor) yAxisTextColor = $('body').css('color');

			var chartOptions = {
				vAxis: {
					format: 'short',
					textStyle: {
						color: yAxisTextColor
					}
				},
				hAxis: {

					textStyle: {
						color: xAxisTextColor
					}

				},
				/*animation: {
					duration: 300,
					easing: 'out',
				},*/
				interpolateNulls: true,
				legend: {
					'position': 'bottom',
					textStyle: {
						color: yAxisTextColor
					}
				},
				chartArea: {
					width: '70%'
				},
				backgroundColor: {
					fill: 'transparent'
				}
			};

			if (settings.fundamentals.length == 1) {
				chartOptions.legend = {
					position: 'none'
				}
			}

			var chartType = settings.chartType?settings.chartType:'LineChart'

			var wrapper = new google.visualization.ChartWrapper({
				chartType: chartType,
				dataTable: chartData,
				options: chartOptions,
				containerId: chartDivId,
			});

			fundamentalChartWrappers.push(wrapper);

			containerObject.show();
			//wrapper.draw();
			//chartDiv.css('height', chartDiv.width() * 9 / 16);

			/*var parent=chartDiv.parent();
			while (parent.prop('tagName') != 'BODY') {
				if (parent.height() < containerObject.height()) {
					parent.height(containerObject.height());
				}
				parent=parent.parent();
			}*/
		}

	});


	//jQuery('#ciq-content').css('display','');

	//containerObject.show();	  
	//}
}

function fundamentalsQuoteCallback(err, quoteData, containerObject) {

}

function fundamentalchart(list) {
	list = JSON.parse(list);
	symbolList = [];
	_.each(list, function (value, key) {
		var container = 'ciq-' + value;
		var settings = defaultSettings.items[value];
		var containerObject = $('#' + container);
		settings.id = key;
		if (!settings.symbol) settings.symbol = portalSettings.defaultSymbol;
		//function fetchDetailedQuote(symbol, fundamentalList, quoteCB, fundamentalsCB, extraParams) {
		dataSources[portalSettings.dataSource].fetchFundamentalsFiscalRange(settings, fundamentalchartsCallback, containerObject);
	});
	//PortalCore.addStyleSheet(cssUrl + 'fundamentals.css');
	symbolList = _.uniq(symbolList);
}

$(window).resize(_.debounce(function () {
	if (!window.prevWidth) window.prevWidth = 0;

	newWidth = $(window).width();
	if (newWidth > prevWidth && newWidth - prevWidth < 30) return;

	_.each(fundamentalChartWrappers, function (value, key) {
		if (fundamentalChartWrappers[key].getDataTable().getNumberOfRows() == 0) return;
		_.each(value, function (value2) {
			if (_.isString(value2) && _.startsWith(value2, 'ciq-')) {
				var chartContainer = $('#' + value2);
				var height = chartContainer.width() * 9 / 16;
				chartContainer.css('height', height);
				//parent = chartContainer.parent();
				//parentHeight += chartContainer.height();
				value.draw();
			}
		})
	});

}, 250));