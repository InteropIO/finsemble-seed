if (!window.chartWrappers) {
	window.chartWrappers = {};

	$(window).resize(function () {
		_.each(chartWrappers, function (value) {
			value.draw();
		});
	});

}
if (!window.chartDataTablesGlobal) {
	window.chartDataTablesGlobal = {};
}

var selectedRange = {};

function sectorPerformanceCallback(err, data, containerObject) {
	//console.log(data);
	require(['googlecharts'], function () {
		google.charts.load('45', {
			'packages': ['corechart']
		});
		google.charts.setOnLoadCallback(drawChart);

		function drawChart() {

			var containerId = containerObject.attr('id');
			var chartDiv = $('#' + containerId + '-chart');

			var xAxisTextColor = PortalCore.getStyleRuleValue('color', '.ciq-SectorPerformance-chart-xAxis');
			if (!xAxisTextColor) xAxisTextColor = $('body').css('color');

			var yAxisTextColor = PortalCore.getStyleRuleValue('color', '.ciq-SectorPerformance-chart-yAxis');
			if (!yAxisTextColor) yAxisTextColor = $('body').css('color');

			var upColor = PortalCore.getStyleRuleValue('color', '.ciq-SectorPerformance-chart-up');
			if (!upColor || upColor == xAxisTextColor) upColor = PortalCore.getStyleRuleValue('color', '.stockup');
			if (!upColor || upColor == xAxisTextColor) upColor = 'green';

			var downColor = PortalCore.getStyleRuleValue('color', '.ciq-SectorPerformance-chart-down');
			if (!downColor || downColor == xAxisTextColor) downColor = PortalCore.getStyleRuleValue('color', '.stockdown');
			if (!downColor || downColor == xAxisTextColor) downColor = 'red';


			var chartDataTables = chartDataTablesGlobal[containerId];
			if (!chartDataTables) {
				chartDataTables = {};
				var i = 0;
				_.each(data, function (value, key) {
					if (i == 0) {
						_.each(value.historicals, function (value2, key2) {
							chartDataTables[key2] = new google.visualization.DataTable();
							chartDataTables[key2].addColumn('string', 'Sector');
							chartDataTables[key2].addColumn('number', 'Performance');
							chartDataTables[key2].addColumn({
								type: 'string',
								role: 'style'
							});
							chartDataTables[key2].addColumn({
								type: 'number',
								role: 'annotation'
							});

						});
					}
					_.each(value.historicals, function (value2, key2) {
						var percentChange;
						if (key2 == "Last") {
							percentChange = ((value.Last ? value.Last : value2) - value.Previous) / value.Previous;
						} else {
							percentChange = value2 / 100;
						}
						var cClass = 'stockup';

						if (percentChange < 0) {
							cClass = 'stockdown';
						}
						chartDataTables[key2].addRows([[key, percentChange, 'color:' + (percentChange < 0 ? downColor : upColor), percentChange]]);
					});

					i++;
				});
				chartDataTablesGlobal[containerId] = chartDataTables;

			} else {
				var i = 0;
				_.each(data, function (value, key) {
					if (i == 0) {
						_.each(value.historicals, function (value2, key2) {
							chartDataTables[key2].removeRows(0, chartDataTables[key2].getNumberOfRows());
						});
					}
					_.each(value.historicals, function (value2, key2) {
						var percentChange;
						if (key2 == "Last") {
							percentChange = ((value.Last ? value.Last : value2) - value.Previous) / value.Previous;
						} else {
							percentChange = value2 / 100;
						}
						var cClass = 'stockup';

						if (percentChange < 0) {
							cClass = 'stockdown';
						}
						chartDataTables[key2].addRows([[key, percentChange, 'color:' + (percentChange < 0 ? downColor : upColor), percentChange]]);
					});

					i++;
				});



				/*var formatter = new google.visualization.NumberFormat({
					pattern: '0.00%'
				});
				var cFormatter = new google.visualization.ColorFormat();
				cFormatter.addRange(-1000000, 0, downColor);
				cFormatter.addRange(0, 1000000, upColor);

				_.each(chartDataTables, function (value, key) {
					formatter.format(value, 1);
					formatter.format(value, 3);
					cFormatter.format(chartDataTables[key], 1);

				});*/

			}

			var formatter = new google.visualization.NumberFormat({
				pattern: '0.00%',
				negativeColor: downColor
			});
			var cFormatter = new google.visualization.ColorFormat();
			cFormatter.addRange(-1000000, 0, downColor);
			cFormatter.addRange(0, 1000000, upColor);

			_.each(chartDataTablesGlobal[containerId], function (value, key) {

				formatter.format(value, 1);
				cFormatter.format(value, 1);
				formatter.format(value, 3);

			});


			var wrapper = chartWrappers[containerId];

			if (!wrapper) {

				wrapper = new google.visualization.ChartWrapper({
					chartType: 'BarChart',
					dataTable: chartDataTables['Last'],
					options: {
						allowHtml: true,
						legend: {
							position: 'none'
						},
						hAxis: {
							format: 'percent',
							textStyle: {
								color: xAxisTextColor,
								fontName: 'Roboto',
								fontSize: 13
							}
						},
						vAxis: {
							textStyle: {
								color: yAxisTextColor,
								fontName: 'Roboto',
								fontSize: 13
							}
						},
						bar: {
							groupWidth: '80%'
						},
						/*animation: {
							duration: 1000,
							easing: 'out',
						},*/
						backgroundColor: {
							fill: 'transparent'
						},
						annotations: {
							alwaysOutside: true,
							textStyle: {
								fontName: 'Roboto',
								fontSize: 13,
								bold: false,
								italic: false
							}
						},
						chartArea: {
							top: 20,
							height: _.size(data) * 35
						}
					},
					containerId: chartDiv.attr('id')



				});

				chartWrappers[containerId] = wrapper;
				selectedRange[containerId] = 'Last';
				containerObject.show();
				chartDiv.css('height', ((_.size(data) + 1) * 35) + 'px').css('clear', 'both');
				//wrapper.draw();

			} else {
				wrapper.setDataTable(chartDataTablesGlobal[containerId][selectedRange[containerId]]);
				//wrapper.draw();
			}




		}



	});
}

function sectorperformance(list) { //function is intentionally not camelcase
	list = JSON.parse(list);
	_.each(list, function (value) {
		var container = 'ciq-' + value;
		var settings = defaultSettings.items[value];
		var containerObject = $('#' + container);
		var containerId = containerObject.attr('id');
		var rangeDiv = '<h3>Sector Performance</h3><div class="ciq-range-nav ciq-sector-nav-range" id="' + containerId + '-range"><ul><li range="Last" class="active">Today</li><li range="1W">5D</li><li range="4W">1M</li><li range="13W">3M</li><li range="26W">6M</li><li range="52W">1Y</li></ul></div>';
		var chartTypeDiv = '<div class="ciq-range-nav ciq-sector-nav-type" id="' + containerId + '-type"><ul><li type="BarChart" class="active">Bar</li><li type="Table">Table</li></ul></div>';
		containerObject.append(rangeDiv);
		containerObject.append(chartTypeDiv);

		$('#' + containerId + '-range li').on('click', function () {
			var parentUL = $(this).parent();
			parentUL.children().removeClass('active');
			$(this).addClass('active');
			var parentDiv = $(this).parent().parent().parent();
			var id = parentDiv.attr('id');
			selectedRange[containerId] = $(this).attr('range');
			chartWrappers[id].setDataTable(chartDataTablesGlobal[id][selectedRange[containerId]]);
			chartWrappers[id].draw();
			//activeChart[id].range = $(this).attr('range');
		});

		$('#' + containerId + '-type li').on('click', function () {
			var parentUL = $(this).parent();
			parentUL.children().removeClass('active');
			$(this).addClass('active');
			var parentDiv = $(this).parent().parent().parent();
			var id = parentDiv.attr('id');
			var chartType = $(this).attr('type');
			chartWrappers[id].setChartType(chartType);
			//var view = new google.visualization.DataView(chartWrappers[id].getDataTable());
			//view.setColumns([0,1]);
			if (chartType == 'Table') {
				chartWrappers[id].setView({
					columns: [0, 1]
				});
			} else {
				chartWrappers[id].setView(null);
			}
			chartWrappers[id].draw();
			//activeChart[id].chartType = chartType;

		});

		var chartDiv = $('<div>').attr('id', containerId + '-chart');
		containerObject.append(chartDiv);
		function updateSectorPerformance() {
			dataSources[portalSettings.dataSource].fetchSectorPerformance(settings, sectorPerformanceCallback, containerObject);
		}
		updateSectorPerformance();

		setInterval(updateSectorPerformance, portalSettings.quoteRefreshRate * 1000);

	});
	//PortalCore.addStyleSheet(cssUrl + 'modules/sectorperformance.css');



}