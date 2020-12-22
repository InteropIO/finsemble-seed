var pieChartWrappers = {};

function pieChartCallback(err, fundamentalsData, containerObject) {
	//for(var key in itemList) {
	var containerId = containerObject.attr('id');
	var widgetId = containerId.split('-')[1];
	var settings = defaultSettings.items[widgetId];
	containerObject.html('');

	fundamentalsData = fundamentalsData[settings.fundamental];
	if (!fundamentalsData) {
		return;
	}

	require(['googlecharts'], function () {

		google.charts.load('45', {
			'packages': ['corechart']
		});
		google.charts.setOnLoadCallback(drawFundamentalPie);

		function drawFundamentalPie() {

			_.each(fundamentalsData, function (data, key) {
				var chartType = "PieChart";
				var chartDivId = containerId + '-chart-' + key;
				var chartDiv = $('#' + chartDivId);
				if (!_.size(data)) {
					chartDiv.remove;
					$('#' + chartDivId + '-' + key).remove();
					return;
				}
				var chartData = new google.visualization.DataTable();
				chartData.addColumn('string', 'Type');
				chartData.addColumn('number', 'Allocation');
				var total = 0;
				_.each(data, function (value, label) {
					var numberVal = parseFloat(value);
					chartData.addRow([label, numberVal]);
					total += numberVal;
					if (numberVal < 0) chartType = "BarChart"
				});

				if (total != 0) {
					if (!chartDiv.length) {
						chartDiv = $('<div>').attr('id', chartDivId).css('width', '100%');
						containerObject.append('<h3 id="' + chartDivId + '-' + key + '">' + key + ': ' + total.toFixed(2) + '%</h3>');
						containerObject.append(chartDiv);

					} else {
						chartDiv = $('#' + chartDivId);
						$('#' + chartDivId + '-' + key).html(key + ': ' + total.toFixed(2));
					}

					var xAxisTextColor = PortalCore.getStyleRuleValue('color', '.ciq-PieChart-chart-xAxis');
					if (!xAxisTextColor) xAxisTextColor = $('body').css('color');

					var yAxisTextColor = PortalCore.getStyleRuleValue('color', '.ciq-PieChart-chart-yAxis');
					if (!yAxisTextColor) yAxisTextColor = $('body').css('color');

					var chartOptions = {
						legend: {
							'position': 'right',
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
						hAxis: {
							textStyle: {
								color: xAxisTextColor
							}
						},
						vAxis: {
							textStyle: {
								color: yAxisTextColor
							}
						}
					}

					/*if (chartType=='BarChart') {
						chartOptions.isStacked = 'percent';
					}*/

					var wrapper = new google.visualization.ChartWrapper({
						chartType: chartType,
						dataTable: chartData,
						options: chartOptions,
						containerId: chartDivId,
					});




					pieChartWrappers[chartDivId] = wrapper;

					containerObject.show();
					//wrapper.draw();
					//chartDiv.css('height', chartDiv.width() * 9 / 16);

				}





				containerObject.show();
				//wrapper.draw();
				//chartDiv.css('height', chartDiv.width() * 9 / 16);

			});








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

function pieChartQuoteCallback(err, quoteData, containerObject) {

}

function piechart(list) {
	list = JSON.parse(list);
	symbolList = [];
	_.each(list, function (value, key) {
		var container = 'ciq-' + value;
		var settings = defaultSettings.items[value];
		if (settings.message && settings.message.data && settings.message.data.symbol) {
			settings.symbol = settings.message.data.symbol;
		}
		var containerObject = $('#' + container);
		settings.id = key;
		if (!settings.symbol) settings.symbol = portalSettings.defaultSymbol;
		//function fetchDetailedQuote(symbol, fundamentalList, quoteCB, fundamentalsCB, extraParams) {
		var fundamentalSettings = {
			stock: {},
			fund: {},
			etf: {}
		};

		fundamentalSettings.stock[settings.fundamental] = settings.fundamental;
		fundamentalSettings.fund[settings.fundamental] = settings.fundamental;
		fundamentalSettings.etf[settings.fundamental] = settings.fundamental;

		dataSources[portalSettings.dataSource].fetchDetailedQuote(settings.symbol, fundamentalSettings, pieChartQuoteCallback, pieChartCallback, containerObject);
	});
	PortalCore.addStyleSheet(cssUrl + 'modules/fundamentals.css');
	symbolList = _.uniq(symbolList);
}


$(window).resize(_.debounce(function () {
	if (!window.prevWidth) window.prevWidth = 0;

	newWidth = $(window).width();
	if (newWidth > prevWidth && newWidth - prevWidth < 30) return;

	_.each(pieChartWrappers, function (value, key) {
		if (pieChartWrappers[key].getDataTable().getNumberOfRows() == 0) return;
		var chartContainer = $(value.ZL);
		var height = chartContainer.width() * 9 / 16;
		chartContainer.css('height', height);
		//chartContainer.parent().height(chartContainer.height());
		value.draw();
	});

}, 250));