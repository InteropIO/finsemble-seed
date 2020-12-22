if (!PortalCore.optionData) PortalCore.optionData = {};
if (!PortalCore.expirationDateData) PortalCore.expirationDateData = {};
PortalCore.optionChartWrappers = [];

function showPainOverTime(containerObject, symbol) {
	var containerId = containerObject.attr('id');
	var widgetId = containerId.split('-')[1];
	var settings = defaultSettings.items[widgetId];

	require(['googlecharts'], function () {

		google.charts.load('45.1', {
			'packages': ['corechart']
		});
		google.charts.setOnLoadCallback(drawPainOverTime);

		function drawPainOverTime() {
			var chartData = new google.visualization.DataTable();
			chartData.addColumn('date', 'Date');
			chartData.addColumn('number', 'Maximum Pain Price');

			_.each(PortalCore.expirationDateData[settings.symbol], function (value, key) {
				if (value.maxPainPrice) {
					var dateParts = value.expirationDate.split("/");
					var row = [new Date(dateParts[2], dateParts[0] - 1, dateParts[1]), value.maxPainPrice];
					chartData.addRow(row);
				}

			});

			var chartDivId = containerId + '-paintrendchart' + settings.id;
			var chartDiv;

			if (!$('#' + chartDivId).length) {
				chartDiv = $('<div>').attr('id', chartDivId).css('width', '100%');
				containerObject.append(chartDiv);
			} else {
				chartDiv = $('#' + chartDivId);
			}

			var xAxisTextColor = PortalCore.getStyleRuleValue('color', '.ciq-OptionChart-chart-xAxis');
			if (!xAxisTextColor) xAxisTextColor = $('body').css('color');

			var yAxisTextColor = PortalCore.getStyleRuleValue('color', '.ciq-OptionChart-chart-yAxis');
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
				animation: {
					duration: 300,
					easing: 'out',
				},
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
				},
				pointSize: 5
			}

			/*if (settings.fundamentals.length == 1) {
				chartOptions.legend = {
					position: 'none'
				}
			}*/

			var wrapper = new google.visualization.ChartWrapper({
				chartType: 'LineChart',
				dataTable: chartData,
				options: chartOptions,
				containerId: chartDivId,
			});

			PortalCore.optionChartWrappers.push(wrapper);

			containerObject.show();
			wrapper.draw();
			chartDiv.css('height', chartDiv.width() * 9 / 16);


		}


	});

}

function showOptionChart(containerObject, symbol, id) {
	var containerId = containerObject.attr('id');
	var widgetId = containerId.split('-')[1];
	var settings = defaultSettings.items[widgetId];

	require(['googlecharts'], function () {

		google.charts.load('45.1', {
			'packages': ['corechart']
		});
		google.charts.setOnLoadCallback(drawOptionPainChart);

		function drawOptionPainChart() {
			var chartData = new google.visualization.DataTable();
			chartData.addColumn('number', 'Price');
			chartData.addColumn('number', 'Call');
			chartData.addColumn('number', 'Put');

			_.each(PortalCore.expirationDateData[settings.symbol][id].cashByStrikePrice, function (value, key) {
				var row = [value.price, value.callCash, value.putCash];
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

			var xAxisTextColor = PortalCore.getStyleRuleValue('color', '.ciq-OptionChart-chart-xAxis');
			if (!xAxisTextColor) xAxisTextColor = $('body').css('color');

			var yAxisTextColor = PortalCore.getStyleRuleValue('color', '.ciq-OptionChart-chart-yAxis');
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
				animation: {
					duration: 300,
					easing: 'out',
				},
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
				},
				isStacked: true,
				title: "Maximum Pain Price: " + PortalCore.expirationDateData[settings.symbol][id].maxPainPrice,
				titleTextStyle: {
					color: xAxisTextColor
				}
			}

			/*if (settings.fundamentals.length == 1) {
				chartOptions.legend = {
					position: 'none'
				}
			}*/

			var wrapper = new google.visualization.ChartWrapper({
				chartType: 'ColumnChart',
				dataTable: chartData,
				options: chartOptions,
				containerId: chartDivId,
			});

			PortalCore.optionChartWrappers.push(wrapper);

			containerObject.show();
			wrapper.draw();
			chartDiv.css('height', chartDiv.width() * 9 / 16);

			/*var parent=chartDiv.parent();
			while (parent.prop('tagName') != 'BODY') {
				if (parent.height() < containerObject.height()) {
					parent.height(containerObject.height());
				}
				parent=parent.parent();
			}*/
		}

	});

}

function optionpainCallback(error, data, containerObject) {
	//debugger;
	var containerId = containerObject.attr('id');
	var widgetId = containerId.substring(4);
	var settings = portalSettings.items[widgetId];
	if (settings.message && settings.message.data && settings.message.data.symbol) {
		settings.symbol = settings.message.data.symbol;
	}
	if (!settings.symbol) settings.symbol = portalSettings.defaultSymbol;
	PortalCore.optionData[settings.symbol] = {};
	var select = $('<select>').attr('id', containerId + '-select');
	_.each(data, function (value, key) {
		var option = $('<option>').attr('value', key).append(value.ExpirationDate);
		select.append(option);
		var Combination = {};
		_.each(value.Calls, function (call) {
			if (!Combination[call.StrikePrice]) Combination[call.StrikePrice] = {};
			_.each(call, function (cvalue, ckey) {
				Combination[call.StrikePrice]['Call_' + ckey] = cvalue;
			});
		});
		_.each(value.Puts, function (put) {
			if (!Combination[put.StrikePrice]) Combination[put.StrikePrice] = {};
			_.each(put, function (cvalue, ckey) {
				Combination[put.StrikePrice]['Put_' + ckey] = cvalue;
			});
		});
		PortalCore.optionData[settings.symbol][key] = {
			'Date': value.ExpirationDate,
			'Calls': value.Calls,
			'Puts': value.Puts,
			'Combination': Combination
		};
	});

	// calculate pain
	var expirationDateData = [];
	_.each(PortalCore.optionData[settings.symbol], function (optionData) {
		var expirationDate = optionData.Date;
		expirationDateData.push({
			expirationDate: expirationDate,
			cashByStrikePrice: []
		})
		var strikePrices = [];
		_.each(optionData.Combination, function (strikePriceData, strikePrice) {
			if ($.isNumeric(strikePriceData.Call_Symbol.slice(settings.symbol.length, settings.symbol.length + 1))) return;
			strikePrices.push(parseFloat(strikePrice));
		})

		_.each(strikePrices, function (price) {
			var callCash = 0;
			var putCash = 0;
			_.each(optionData.Combination, function (data, strikePrice) {
				strikePrice = parseFloat(strikePrice);
				if ($.isNumeric(data.Call_Symbol.slice(settings.symbol.length, settings.symbol.length + 1))) return;
				if (price > strikePrice) {
					callCash += (price - strikePrice) * data.Call_OpenInterest * 100
				}
				if (price < strikePrice) {
					putCash += (strikePrice - price) * data.Put_OpenInterest * 100
				}

			})
			if (putCash + callCash > 0) {
				expirationDateData[expirationDateData.length - 1].cashByStrikePrice.push({
					price: price,
					putCash: putCash,
					callCash: callCash,
					totalCash: putCash + callCash
				});
			}
		})

		_.each(expirationDateData, function (data) {
			var maxPainDataPoint = _.minBy(data.cashByStrikePrice, function (o) {
				return o.totalCash;
			});
			if (maxPainDataPoint) data.maxPainPrice = maxPainDataPoint.price;
			else delete data;
		})

	})

	PortalCore.expirationDateData[settings.symbol] = expirationDateData



	containerObject.html(select);
	$('#' + containerId + '-select').change(function () {
		showOptionChart(containerObject, settings.symbol, this.value);
	});

	showOptionChart(containerObject, settings.symbol, 0);
	showPainOverTime(containerObject, settings.symbol);
}

function optionpain(list) { //function is intentionally not camelcase
	list = JSON.parse(list);
	_.each(list, function (value, key) {
		var container = 'ciq-' + value;
		var settings = defaultSettings.items[value];
		var containerObject = $('#' + container);
		settings.id = key;
		if (!settings.symbol) settings.symbol = portalSettings.defaultSymbol;
		dataSources[portalSettings.dataSource].fetchOptionChain(settings, optionpainCallback, containerObject);
		containerObject.show();
	});
	PortalCore.addStyleSheet('https://cdn.jsdelivr.net/jquery.datatables/1.10.10/css/jquery.dataTables.min.css');
	PortalCore.addStyleSheet('https://cdn.jsdelivr.net/jquery.datatables/1.10.10/plugins/responsive/css/responsive.dataTables.min.css');

}

$(window).resize(_.debounce(function () {
	if (!window.prevWidth) window.prevWidth = 0;

	newWidth = $(window).width();
	if (newWidth > prevWidth && newWidth - prevWidth < 30) return;

	_.each(PortalCore.optionChartWrappers, function (value, key) {
		if (PortalCore.optionChartWrappers[key].getDataTable().getNumberOfRows() == 0) return;
		//var parentHeight = 0;
		//var parent;
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
		//parent.height(parentHeight);

	});

}, 250));