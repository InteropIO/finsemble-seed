function earningsCalendarCallback(error, data, containerObject) {
	//debugger;
	require(['moment', 'jqueryui', 'datatablesdatetime', 'datatablesresponsive'], function (moment) {
		window.moment = moment;
		var containerId = containerObject.attr('id');
		var widgetId = containerId.split('-')[1];
		var settings = defaultSettings.items[widgetId];

		var dataTable = $('#' + containerId + '-table');

		if (dataTable.length) {
			//$('#' + containerId + '-title').html('Earnings for ' + PortalCore.mmddyyyy($('#' + containerId + '-datepicker').datepicker('getDate')));

			dataTable = dataTable.DataTable();
			dataTable.clear();
			dataTable.rows.add(data);
			dataTable.draw();
		} else {
			var title = $('<div>').attr('id', containerId + '-title');
			containerObject.append(title);
			title.html('<h2>Earnings For <input type="text" id="' + containerId + '-datepicker"></h2>');
			$('#' + containerId + '-datepicker').datepicker({
				onSelect: function (d, i) {
					if (d !== i.lastVal) {
						$(this).change();
					}
				}
			});

			$('#' + containerId + '-datepicker').datepicker('setDate', new Date());

			//containerObject.append('<h3 id="' + containerId + '-title">Earnings for ' + PortalCore.mmddyyyy(new Date()) + '</h3>');
			$('#' + containerId + '-datepicker').change(function () {
				settings.date = $(this).datepicker('getDate');
				dataTable.clear();
				dataTable.draw();
				dataSources[portalSettings.dataSource].fetchEarningsCalendar(settings, earningsCalendarCallback, containerObject);

			});
			dataTable = $('<table>').attr('id', containerId + '-table').css('width', '100%').addClass('display responsive');
			containerObject.append(dataTable);
			$('#' + containerId + '-table').dataTable({
				'data': data,
				"columns": [
					{
						"data": "Name", title: "Security", render: function (val, type, row, meta) {
							if (type == 'display') {
								return PortalCore.buildLink(portalSettings.searchURL, row.Symbol, val);
							} else {
								return val;
							}
						}
					},
					{ "data": "EarningsQuarter", title: "Quarter" },
					{ "data": "EarningsDate", title: "Earnings Date" },
					{ "data": "TimeType", title: "Earnings Time" },
					{
						"data": "ConferenceCallDateTime", 
						title: "Conference Call", 
						type: 'datetime',
						render: function(val, type, row, meta) {
							if (type== 'display') {
								var displayDate = moment(val).format('MM/DD/YYYY hh:mm:ss A');
								if (displayDate == 'Invalid date') displayDate='';
								if (row['ConferenceCallLink']) {
									displayDate = '<a href="' + row['ConferenceCallLink'] + '" target="_blank">' + displayDate + '</a>';
								}
								return displayDate;
							} else {
								return val;
							}
						}	
					}

				],
				order: [[0, 'asc']]
			});
			dataTable = dataTable.DataTable();
			containerObject.show();

		}

	});
}

function earningscalendar(list) { //function is intentionally not camelcase
	list = JSON.parse(list);
	//PortalCore.addStyleSheet(cssUrl + 'modules/marketsnews.css');
	_.each(list, function (widgetId) {
		var container = 'ciq-' + widgetId;
		var settings = defaultSettings.items[widgetId];
		var containerObject = $('#' + container);

		dataSources[portalSettings.dataSource].fetchEarningsCalendar(settings, earningsCalendarCallback, containerObject);
	});

	PortalCore.addStyleSheet('https://cdn.jsdelivr.net/jquery.datatables/1.10.10/css/jquery.dataTables.min.css');
	PortalCore.addStyleSheet('https://cdn.jsdelivr.net/jquery.datatables/1.10.10/plugins/responsive/css/responsive.dataTables.min.css');
	//PortalCore.addStyleSheet(cssUrl + 'modules/earningscalendar.css');

}
