var regionChartWrappers = [];

function regionchartCallback(err, fundamentalsData, containerObject) {
	//for(var key in itemList) {
	var containerId = containerObject.attr('id');
	var settings = fundamentalsData.settings;

	require(['googlecharts'], function () {

		google.charts.load('current', {
			'packages': ['corechart']
		});
		google.charts.setOnLoadCallback(drawRegionChart);

		function drawRegionChart() {
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
			
			_.each (sortedData, function(value, key) {
				var row = [];
				row.push(new Date(parseInt(value.Date)));
				_.each(settings.fundamentals, function (fundamental) {
					row.push(value[fundamental.label]);
				});
				chartData.addRow(row);
			});
			
			var chartDivId = containerId + '-chart' + settings.id;
			var chartDiv;
			
			if (!$( '#' + chartDivId).length) {
				chartDiv = $('<div>').attr('id', '#' + chartDivId).css('width', '100%');
				containerObject.append(chartDiv);
			} else {
				chartDiv = $( '#' + chartDivId);
			}

			var chartOptions = {
				vAxis: {
					format: 'short'
				},
				animation: {
					duration: 300,
					easing: 'out',
				},
				interpolateNulls: true,
				legend: {
					'position': 'bottom'
				},
				chartArea: {
					width: '70%'
				},
				backgroundColor: {
					fill: 'transparent'
				}
			}

			if (settings.fundamentals.length == 1) {
				chartOptions.legend = {
					position: 'none'
				}
			}

			var wrapper = new google.visualization.ChartWrapper({
				chartType: 'LineChart',
				dataTable: chartData,
				options: chartOptions,
				containerId: chartDiv.attr('id'),
			});

			fundamentalChartWrappers.push(wrapper);

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


	//jQuery('#ciq-content').css('display','');

	//containerObject.show();	  
	//}
}


function regionchart(list) {
	list = JSON.parse(list);
	symbolList = [];
	_.each(list, function (value, key) {
		var container = 'ciq-' + value;
		var settings = defaultSettings.items[value];
		var containerObject = $('#' + container);
		settings.id = key;
		if (!settings.symbol) settings.symbol = portalSettings.defaultSymbol;
		//function fetchDetailedQuote(symbol, fundamentalList, quoteCB, fundamentalsCB, extraParams) {
		dataSources[portalSettings.dataSource].fetchFundFundamentals(settings.symbol, "Fund", {fund: {'RegionBreakdown': "Region Breakdown"}}, null, regionchartCallback, containerObject);
	});
	//PortalCore.addStyleSheet(cssUrl + 'fundamentals.css');
	symbolList = _.uniq(symbolList);
}

$(window).resize(function () {
	_.each(regionChartWrappers, function (value) {
		var chartContainer = $(value.ZL);
		var height = chartContainer.width() * 9 / 16;
		chartContainer.css('height', height);
		chartContainer.parent().height(chartContainer.height());
		value.draw();
	});
});