globalRatesTable = {}

function ratesCallback(err, data, containerObject) {

	var containerId = containerObject.attr('id');
	var widgetId = containerId.split('-')[1];

	//debugger;
	/*require(['jqueryui'], function () {


		var tabsDiv = $('<div>').attr('id', 'jquery-rates-tab-' + data.id);
		var tabList = $('<ul>');
		_.each(data.rates, function (rates, family) {
			tabList.append('<li><a href="#rates-tabs-' + data.id + '-' + family + '">' + family + '</a></li>');
			var tabBody = $('<div>').attr('id', 'rates-tabs-' + data.id + '-' + family);
			var tabTable = $('<table>');
			_.each(rates, function (rateDetails) {
				var tabRow = $('<tr>');
				var rateChange = ((rateDetails.Last - rateDetails.Previous) / rateDetails.Previous * 100).toFixed(2);
				tabRow.append('<td>' + rateDetails.Symbol + '</td><td>' + rateDetails.Last + '</td><td class="' + (rateChange<0 ? 'down' : 'up') + '">' + rateChange + '%</td>');
				tabTable.append(tabRow);
			});
			tabBody.append(tabTable);
			tabsDiv.append(tabBody);
		});
		tabsDiv.prepend(tabList);
		containerObject.append(tabsDiv);
		tabsDiv.tabs({
			activate: function (event, ui) {
				if (dependencies[widgetId]) {
					dependencies[widgetId].data.familyName = ui.newTab.text();
					PortalCore.loadDependencies(widgetId);
				}
			}
		});

		if (dependencies[widgetId]) {
			dependencies[widgetId].data.familyName = "Mortgage";
			PortalCore.loadDependencies(widgetId);
		}



	});*/

	var menu = $('#' + containerId + ' ul');
	var i = 0;
	_.each(data.rates, function (rates, family) {
		var menuItem = $('<li>')
		if (i == 0) menuItem.addClass('active');
		menuItem.attr('family', family);
		menuItem.html(family);
		menu.append(menuItem);
		var tabTable = $('<table>');
		_.each(rates, function (rateDetails) {
			var tabRow = $('<tr>');
			var rateChange = ((rateDetails.Last - rateDetails.Previous) / rateDetails.Previous * 100).toFixed(2);
			tabRow.append('<td>' + rateDetails.Symbol + '</td><td>' + rateDetails.Last + '</td><td class="' + (rateChange < 0 ? 'stockdown' : 'stockup') + '">' + rateChange + '%</td>');
			tabTable.append(tabRow);
		});
		globalRatesTable[family] = tabTable;
		if (i == 0) {
			containerObject.append('<div class="ciq-rates-table-div" id="' + containerId + '-ratesTableDiv"></div>');
			$('#' + containerId + '-ratesTableDiv').html(tabTable);
			var message = {
				sender: widgetId,
				subject: 'ratesFamily',
				data: {
					ratesFamily: family
				}
			}
			PortalCore.sendMessage(message);
		}
		i++;
	});

	$('#' + containerId + ' ul li').click(function() {
		var self = $(this);
		self.parent().children().removeClass('active')
		var family = self.html()
		$('#' + containerId + '-ratesTableDiv').html(globalRatesTable[family])
		var message = {
			sender: widgetId,
			subject: 'ratesFamily',
			data: {
				ratesFamily: family
			}
		}
		PortalCore.sendMessage(message);
		self.addClass('active')
	});




	containerObject.css('display', '');
}

function rates(list) { //function is intentionally not camelcase
	list = JSON.parse(list);
	_.each(list, function (widgetId, key) {
		var containerId = 'ciq-' + widgetId;
		var settings = defaultSettings.items[widgetId];
		var containerObject = $('#' + containerId);
		if (!settings.title) settings.title = 'Rates';
		if (settings.title != '') containerObject.html('<h3>' + settings.title + '</h3><div class="ciq-range-nav ciq-rates-nav" id="' + containerId + '-rates"><ul></ul></div>');
		settings.id = key;
		dataSources[portalSettings.dataSource].fetchRates(settings, ratesCallback, containerObject);
	});
	//PortalCore.addStyleSheet('https://cdn.jsdelivr.net/jquery.ui/1.11.4/jquery-ui.min.css');
	//PortalCore.addStyleSheet(cssUrl + 'modules/rates.css');
}