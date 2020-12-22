var insiderChartWrappers = {};

function insidersCallback(error, data, containerObject) {
	//debugger;
	var settings = data.settings;
	data = data.items;

	var containerId = containerObject.attr('id');

	if (settings.chart)
		require(['googlecharts'], function () {

			google.charts.load('45.1', {
				'packages': ['corechart']
			});
			google.charts.setOnLoadCallback(drawFundamentalChart);

			function drawFundamentalChart() {
				//process the data
				var chartData = {};
				_.each(data, function (value) {
					var date = new Date(value.Date);
					date.setDate(1);
					var time = date.getTime();
					if (!chartData[time]) {
						chartData[time] = {};
						chartData[time].buy = 0;
						chartData[time].sell = 0;
						chartData[time].buyt = 0;
						chartData[time].sellt = 0;

					}
					if (value.Amount < 0) {
						chartData[time].sell -= value.Amount;
						chartData[time].sellt++;
					}
					if (value.Amount > 0) {
						chartData[time].buy += value.Amount;
						chartData[time].buyt++;
					}
				});

				var gChartData = new google.visualization.DataTable();
				gChartData.addColumn('date', 'Date');
				//gChartData.addColumn('number', 'Buys');
				//gChartData.addColumn('number', 'Sells');
				gChartData.addColumn('number', 'Shares Bought');
				gChartData.addColumn('number', 'Shares Sold');

				_.each(chartData, function (value, key) {
					var row = [];
					row.push(new Date(parseInt(key)));
					//row.push(value.buyt);
					//row.push(value.sellt);
					row.push(value.buy);
					row.push(value.sell);

					gChartData.addRow(row);
				});

				var chartDiv = $('#' + containerId + '-chart');
				if (!chartDiv.length) {
					chartDiv = $('<div>').attr('id', containerId + '-chart').css('width', '100%');
					containerObject.prepend(chartDiv);
				}

				var xAxisTextColor = PortalCore.getStyleRuleValue('color', '.ciq-Insiders-chart-xAxis');
				if (!xAxisTextColor) xAxisTextColor = $('body').css('color');

				var yAxisTextColor = PortalCore.getStyleRuleValue('color', '.ciq-Insiders-chart-yAxis');
				if (!yAxisTextColor) yAxisTextColor = $('body').css('color');

				var upColor = PortalCore.getStyleRuleValue('color', '.ciq-Insiders-chart-up');
				if (!upColor || upColor == xAxisTextColor) upColor = PortalCore.getStyleRuleValue('color', '.stockup');
				if (!upColor || upColor == xAxisTextColor) upColor = 'green';

				var downColor = PortalCore.getStyleRuleValue('color', '.ciq-Insiders-chart-down');
				if (!downColor || downColor == xAxisTextColor) downColor = PortalCore.getStyleRuleValue('color', '.stockdown');
				if (!downColor || downColor == xAxisTextColor) downColor = 'red';

				var chartOptions = {
					vAxis: //{
					{
						format: 'short',
						textStyle: {
							color: yAxisTextColor
							//},
						},
						gridlines: {
							color: 'transparent'
						}
						/*0: {
							textStyle: {
								color: yAxisTextColor
							},
						}*/
					},
					hAxis: {
						textStyle: {
							color: xAxisTextColor
						},
						gridlines: {
							color: 'transparent'
						}
					},
					//interpolateNulls: true,
					legend: {
						'position': 'bottom',
						textStyle: {
							color: xAxisTextColor
						}
					},
					chartArea: {
						width: '90%',
						heignt: '85%',
						top: '5%',
					},
					series: {
						0: {
							//targetAxisIndex: 0,
							color: upColor
						},
						1: {
							//targetAxisIndex: 0
							color: downColor
						},
						/*2: {
							targetAxisIndex: 1
						},
						3: {
							targetAxisIndex: 1
						}*/

					},
					backgroundColor: {
						fill: 'transparent'
					},
					animation: {
						"startup": true, 
						duration: 1000,
						easing: 'out',
					}
				}

				//if (settings.fundamentals.length == 1) {
				//	chartOptions.legend = {position: 'none'}
				//}

				var wrapper = new google.visualization.ChartWrapper({
					chartType: 'ColumnChart',
					dataTable: gChartData,
					options: chartOptions,
					containerId: chartDiv.attr('id'),
				});

				insiderChartWrappers[containerId] = wrapper;

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

	if (settings.table)
		require(['moment', 'datatablesresponsive', 'datatablesdatetime'], function (moment) {
			window.moment = moment;

			if (!$('#' + containerId + '-table').length) {
				var dataTable = $('<table>').attr('id', containerId + '-table').css('width', '100%').addClass('display responsive');
				containerObject.append(dataTable);
				$('#' + containerId + '-table').dataTable({
					'data': data,
					"columns": [
						{
							"data": "Name",
							title: "Name"
						},
						{
							"data": "Amount",
							title: "Amount"
						},
						{
							"data": "Price",
							title: "Price"
						},
						{
							"data": "Date",
							title: "Date",
							type: 'datetime',
							render: $.fn.dataTable.render.moment('MM/DD/YYYY')
						},
						{
							"data": "Description",
							title: "Description"
						},
						{
							"data": "Owned",
							title: "Owned"
						}
					],
					order: [[3, 'desc']]
				});
			} else {
				var dataTable = $('#' + containerId + '-table').DataTable();
				dataTable.clear();
				dataTable.rows.add(data);
				dataTable.draw();
			}
		});


}

function insiders(list) { //function is intentionally not camelcase
	list = JSON.parse(list);
	_.each(list, function (value, key) {
		var container = 'ciq-' + value;
		var settings = defaultSettings.items[value];
		if (settings.message && settings.message.data && settings.message.data.symbol) {
			settings.symbol = settings.message.data.symbol;
		}
		var containerObject = $('#' + container);
		settings.id = key;
		if (!settings.symbol) settings.symbol = portalSettings.defaultSymbol;
		dataSources[portalSettings.dataSource].fetchSecurityInsiders(settings, insidersCallback, containerObject);
		containerObject.show();
	});
	PortalCore.addStyleSheet('https://cdn.jsdelivr.net/jquery.datatables/1.10.10/css/jquery.dataTables.min.css');
	PortalCore.addStyleSheet('https://cdn.jsdelivr.net/jquery.datatables/1.10.10/plugins/responsive/css/responsive.dataTables.min.css');
	//PortalCore.addStyleSheet(cssUrl + 'modules/insiders.css');
}

$(window).resize(function () {
	_.each(insiderChartWrappers, function (value) {
		var chartContainer = $(value.KL);
		var height = chartContainer.width() * 9 / 16;
		chartContainer.css('height', height);
		//chartContainer.parent().height(chartContainer.height());
		value.draw();
	});
});