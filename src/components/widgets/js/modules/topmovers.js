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

var selectedTopMovers = {};
var shouldIUpdate = {};

function topMoversCallback(err, data, containerObject) {
	if (data.items.length) {
		//containerObject.show(); //.css('visibility', 'hidden')
		require(['googlecharts'], function () {
			google.charts.load('45', {
				'packages': ['corechart']
			});
			google.charts.setOnLoadCallback(drawChart);

			function drawChart() {
				var chartDataTables = {};

				var i = 0;
				var containerId = containerObject.attr('id');
				var widgetId = containerId.split('-')[1];
				var chartDiv = $('#' + containerId + '-chart');
				var firstSymbol = '';

				var key2 = data.moverType;

				var xAxisTextColor = PortalCore.getStyleRuleValue('color', '.ciq-TopMovers-chart-xAxis');
				if (!xAxisTextColor) xAxisTextColor = $('body').css('color');

				var yAxisTextColor = PortalCore.getStyleRuleValue('color', '.ciq-TopMovers-chart-yAxis');
				if (!yAxisTextColor) yAxisTextColor = $('body').css('color');

				var upColor = PortalCore.getStyleRuleValue('color', '.ciq-TopMovers-chart-up');
				if (!upColor || upColor == xAxisTextColor) upColor = PortalCore.getStyleRuleValue('color', '.stockup');
				if (!upColor || upColor == xAxisTextColor) upColor = 'green';

				var downColor = PortalCore.getStyleRuleValue('color', '.ciq-TopMovers-chart-down');
				if (!downColor || downColor == xAxisTextColor) downColor = PortalCore.getStyleRuleValue('color', '.stockdown');
				if (!downColor || downColor == xAxisTextColor) downColor = 'red';

				_.each(data.items, function (value, key) {
					if (i == 0) {
						if (!chartDataTables[key2]) {
							chartDataTables[key2] = new google.visualization.DataTable();
							chartDataTables[key2].addColumn('string', 'Ticker');
							chartDataTables[key2].addColumn('number', 'Performance');
							chartDataTables[key2].addColumn('number', 'Last');
							chartDataTables[key2].addColumn({
								type: 'string',
								role: 'style'
							});
							chartDataTables[key2].addColumn({
								type: 'string',
								role: 'annotation'
							});
						} else {
							chartDataTables[key2].removeRows(0, chartDataTables[key2].getNumberOfRows());
						}
						firstSymbol = value.Symbol;
					}

					var cClass = 'stockup';

					if (value.PercentChange < 0) {
						cClass = 'stockdown';
					}

					chartDataTables[key2].addRow([
						value.Symbol,
						{
							v: value.PercentChange / 100,
							f: '<div class="' + cClass + '">' + (value.PercentChange / 100) + '</div>'
						},
						parseFloat(value.Last.toFixed(2)),
						'color:' + (value.PercentChange < 0 ? downColor : upColor),
						value.PercentChange.toFixed(2) + '%'
					]);

					i++;
				});

				var cFormatter = new google.visualization.ColorFormat();
				cFormatter.addRange(-1000000, 0, downColor);
				cFormatter.addRange(0, 1000000, upColor);
				cFormatter.format(chartDataTables[key2], 1);

				var formatter = new google.visualization.NumberFormat({
					pattern: '0.00%'
				});

				formatter.format(chartDataTables[key2], 1);

				if (!chartDataTablesGlobal[containerId]) {
					chartDataTablesGlobal[containerId] = {};
					shouldIUpdate[containerId] = true;
				}

				chartDataTablesGlobal[containerId][key2] = chartDataTables[key2];

				if (!selectedTopMovers[containerId]) selectedTopMovers[containerId] = 'advancers';
				if (data.moverType == selectedTopMovers[containerId]) {
					var wrapper;
					if (!chartWrappers[containerId]) {
						wrapper = new google.visualization.ChartWrapper({
							chartType: 'BarChart',
							dataTable: chartDataTables[key2],
							options: {
								legend: {
									position: 'none'
								},
								hAxis: {
									textStyle: {
										fontName: 'Roboto',
										fontSize: 13,
										color: xAxisTextColor
									},
									format: 'percent'
								},
								vAxis: {
									textStyle: {
										fontName: 'Roboto',
										fontSize: 13,
										color: yAxisTextColor
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
								allowHtml: true,
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
									top: 10,
									height: data.items.length * 35

								}

							},
							containerId: chartDiv.attr('id'),

						});

						chartWrappers[containerId] = wrapper;

						//containerObject.css('visibility', '');
						chartDiv.css('height', ((data.items.length + 1) * 35) + 'px').css('width', '100%').css('clear', 'both');
						containerObject.show();
						wrapper.setView({
							columns: [0, 1, 3, 4]
						});

						//wrapper.draw();

						google.visualization.events.addListener(wrapper, 'select', function () {
							try {
								var chart = wrapper.getChart();
								//console.log(chart.getSelection());
								var widgetId = $(chart.getContainer()).attr('id').split('-')[1];
								var dataTable = chartWrappers['ciq-' + widgetId].getDataTable();
								var message = {
									sender: widgetId,
									subject: 'symbolChange',
									data: {
										symbol: dataTable.getValue(chart.getSelection()[0].row, 0)
									}
								}

								PortalCore.sendMessage(message);
								//debugger;
							} catch (e) {
								debugger;

							}
						});

					} else {
						wrapper = chartWrappers[containerId];
						chartWrappers[containerId].setDataTable(chartDataTablesGlobal[containerId][selectedTopMovers[containerId]]);
						//wrapper.draw();
					}







					if (shouldIUpdate[containerId]) {
						var message = {
							sender: widgetId,
							subject: 'symbolChange',
							data: {
								symbol: firstSymbol
							}
						}
						PortalCore.sendMessage(message);
						shouldIUpdate[containerId] = false;
					}

				}




			}
		});

	} else {
		if (containerObject.html() != '<h3>Top Movers</h3>Markets Not Open') containerObject.html('<h3>Top Movers</h3>Markets Not Open');
		//containerObject.css('visibility', ''); 
		containerObject.show();
	}


}



function topmovers(list) { //function is intentionally not camelcase
	list = JSON.parse(list);
	_.each(list, function (value) {
		var container = 'ciq-' + value;
		var settings = defaultSettings.items[value];
		var containerObject = $('#' + container);
		var containerId = containerObject.attr('id');

		if (!settings.title && settings.title != '') settings.title = '<h3>Top Movers</h3>';
		if (settings.title != '') containerObject.append('<h3>Top Movers</h3>');

		var moverDiv = '<div class="ciq-range-nav ciq-topmovers-nav-movertype" id="' + containerId + '-movertype"><ul><li type="advancers" class="active">Advancers</li><li type="decliners">Decliners</li><li type="actives">Most Active</li></ul></div>';
		var chartTypeDiv = '<div class="ciq-range-nav ciq-topmovers-nav-charttype" id="' + containerId + '-charttype"><ul><li type="BarChart" class="active">Bar</li><li type="Table">Table</li></ul></div>';
		containerObject.append(moverDiv);
		containerObject.append(chartTypeDiv);

		$('#' + containerId + '-movertype li').on('click', function () {
			var parentUL = $(this).parent();
			parentUL.children().removeClass('active');
			$(this).addClass('active');
			var parentDiv = $(this).parent().parent().parent();
			var id = parentDiv.attr('id');
			selectedTopMovers[id] = $(this).attr('type');
			shouldIUpdate[id] = true;
			chartWrappers[id].setDataTable(chartDataTablesGlobal[id][selectedTopMovers[id]]);
			chartWrappers[id].draw();
		});

		$('#' + containerId + '-charttype li').on('click', function () {
			var parentUL = $(this).parent();
			parentUL.children().removeClass('active');
			$(this).addClass('active');
			var parentDiv = $(this).parent().parent().parent();
			var id = parentDiv.attr('id');
			var chartType = $(this).attr('type');
			chartWrappers[id].setChartType(chartType);
			if (chartType == 'Table') {

				chartWrappers[id].setView({
					columns: [0, 1, 2]
				});
			} else {
				chartWrappers[id].setView({
					columns: [0, 1, 3, 4]
				});
			}
			chartWrappers[id].draw();
		});

		var chartDiv = $('<div>').attr('id', containerId + '-chart');
		containerObject.append(chartDiv);

		function updateTopMovers() {
			dataSources[portalSettings.dataSource].fetchTopMovers(settings, 'advancers', topMoversCallback, settings.markets, containerObject);
			dataSources[portalSettings.dataSource].fetchTopMovers(settings, 'decliners', topMoversCallback, settings.markets, containerObject);
			dataSources[portalSettings.dataSource].fetchTopMovers(settings, 'actives', topMoversCallback, settings.markets, containerObject);
		}
		updateTopMovers();

		setInterval(updateTopMovers, portalSettings.quoteRefreshRate * 1000);


	});



	//PortalCore.addStyleSheet(cssUrl + 'modules/topmovers.css');

}