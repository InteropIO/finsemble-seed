var eventCalendarTypeMap = null;
var timeframeCalendarTypeMap = null;
var eventTypes = ['Bonds', 'Business Surveys', 'Central Bank', 'Consumer Surveys', 'Employment', 'Growth', 'Holidays', 'Housing', 'Inflation', 'Misc'];
var timeframes = ['Today', 'This week', 'This month', 'Last week', 'Next week', 'Last month', 'Next month'];
if (!window.economicCalendarData) window.economicCalendarData = {};

function EventCalendarTypes(eventName) {
	if (!eventCalendarTypeMap) {
		eventCalendarTypeMap = {
			"10-Yr Note Announcement": "Bonds",
			"10-Yr Note Auction": "Bonds",
			"10-Yr Note Settlement": "Bonds",
			"10-Yr TIPS Announcement": "Bonds",
			"10-Yr TIPS Auction": "Bonds",
			"10-Yr TIPS Settlement": "Bonds",
			"2-Yr FRN Note Announcement": "Bonds",
			"2-Yr FRN Note Auction": "Bonds",
			"2-Yr FRN Note Settlement": "Bonds",
			"2-Yr Note Announcement": "Bonds",
			"2-Yr Note Auction": "Bonds",
			"2-Yr Note Settlement": "Bonds",
			"20-Yr TIPS Announcement": "Bonds",
			"20-Yr TIPS Auction": "Bonds",
			"20-Yr TIPS Settlement": "Bonds",
			"3-Month Bill Announcement": "Bonds",
			"3-Month Bill Auction": "Bonds",
			"3-Yr Note Announcement": "Bonds",
			"3-Yr Note Auction": "Bonds",
			"3-Yr Note Settlement": "Bonds",
			"30-Yr Bond Announcement": "Bonds",
			"30-Yr Bond Auction": "Bonds",
			"30-Yr Bond Settlement": "Bonds",
			"30-Yr TIPS Announcement": "Bonds",
			"30-Yr TIPS Auction": "Bonds",
			"30-Yr TIPS Settlement": "Bonds",
			"4-Week Bill Announcement": "Bonds",
			"4-Week Bill Auction": "Bonds",
			"5-Yr Note Announcement": "Bonds",
			"5-Yr Note Auction": "Bonds",
			"5-Yr Note Settlement": "Bonds",
			"5-Yr TIPS Announcement": "Bonds",
			"5-Yr TIPS Auction": "Bonds",
			"5-Yr TIPS Settlement": "Bonds",
			"52-Week Bill Announcement": "Bonds",
			"52-Week Bill Auction": "Bonds",
			"52-Week Bill Settlement": "Bonds",
			"6-Month Bill Announcement": "Bonds",
			"6-Month Bill Auction": "Bonds",
			"7-Yr Note Announcement": "Bonds",
			"7-Yr Note Auction": "Bonds",
			"7-Yr Note Settlement": "Bonds",
			"Adjusted real retail sales": "Growth",
			"Atlanta Fed Business Inflation Expectations": "Central Bank",
			"ADP Employment Report": "Employment",
			"All Industry Index": "Growth",
			"Average Earnings": "Employment",
			"Bank of Canada Announcement": "Central Bank",
			"Bank of Canada Monetary Policy Report": "Central Bank",
			"Bank of Japan Announcement": "Central Bank",
			"Bank Reserve Settlement": "Central Bank",
			"Beige Book": "Central Bank",
			"Bloomberg Consumer Comfort Index": "Consumer Surveys",
			"BOC Business Outlook Survey": "Business Surveys",
			"BOE Announcement": "Central Bank",
			"BoE Inflation Report": "Inflation",
			"BoE MPC Minutes": "Central Bank",
			"BoJ MPB Minutes": "Central Bank",
			"Business and Consumer Confidence": "Business Surveys",
			"Business Climate Indicator": "Business Surveys",
			"Business Inventories": "Business Surveys",
			"CBI Distributive Trades": "Growth",
			"CBI Industrial Trends Survey": "Business Surveys",
			"CFLP Manufacturing PMI": "Business Surveys",
			"Chain Store Sales": "Growth",
			"Challenger Job-Cut Report": "Employment",
			"Chicago Fed National Activity Index": "Central Bank",
			"Chicago PMI": "Business Surveys",
			"CIPS Manufacturing PMI": "Business Surveys",
			"CIPS Services PMI": "Business Surveys",
			"CIPS/PMI Manufacturing Index": "Business Surveys",
			"CIPS/PMI Services Index": "Business Surveys",
			"Claimant Unemployment Rate": "Employment",
			"Construction Spending": "Housing",
			"Consumer Confidence": "Consumer Surveys",
			"Consumer Credit": "Consumer Surveys",
			"Consumer Mfgd Goods Consumption": "Consumer Surveys",
			"Consumer Price Index": "Consumer Surveys",
			"Consumer Sentiment": "Consumer Surveys",
			"Corporate Profits": "Business Surveys",
			"CPI": "Inflation",
			"CPI Core": "Inflation",
			"Current Account": "Growth",
			"Dallas Fed Mfg Survey": "Central Bank",
			"Durable Goods Orders": "Growth",
			"E-Commerce Retail Sales": "Growth",
			"EC Consumer Confidence Flash": "Consumer Surveys",
			"EC Economic Sentiment": "Business Surveys",
			"ECB Announcement": "Central Bank",
			"ECB Lending Survey": "Central Bank",
			"EIA Natural Gas Report": "Misc",
			"EIA Petroleum Status Report": "Misc",
			"Empire State Mfg Survey": "Business Surveys",
			"Employment": "Employment",
			"Employment Cost Index": "Employment",
			"Employment Situation": "Employment",
			"Existing Home Sales": "Housing",
			"Exports": "Growth",
			"Factory Orders": "Business Surveys",
			"Farm Prices": "Inflation",
			"Fed Balance Sheet": "Central Bank",
			"Fed Chair Press Conference": "Central Bank",
			"Federal Reserve Bank Speech": "Central Bank",
			"Federal Reserve Chair Janet Yellen Speech": "Central Bank",
			"Federal Reserve Vice Chair Stanley Fischer Speech": "Central Bank",
			"FHFA House Price Index": "Housing",
			"FOMC Forecasts": "Central Bank",
			"FOMC Meeting Announcement": "Central Bank",
			"FOMC Meeting Begins": "Central Bank",
			"FOMC Minutes": "Central Bank",
			"Gallup US Consumer Spending Measure": "Consumer Surveys",
			"Gallup US ECI": "Consumer Surveys",
			"Gallup US Payroll to Population": "Consumer Surveys",
			"Gallup U.S. Job Creation Index": "Consumer Surveys",
			"GDP": "Growth",
			"GDP Flash": "Growth",
			"GfK Consumer Climate": "Consumer Surveys",
			"Global Composite PMI": "Business Surveys",
			"Global Manufacturing PMI": "Business Surveys",
			"Global Services PMI": "Business Surveys",
			"Gross Domestic Product": "Growth",
			"Halifax HPI": "Housing",
			"Help Wanted Index": "Employment",
			"HICP": "Central Bank",
			"HICP Flash": "Central Bank",
			"Home Loans": "Housing",
			"Household Spending": "Consumer Surveys",
			"Housing Market Index": "Housing",
			"Housing Starts": "Housing",
			"ICSC-Goldman Store Sales": "Growth",
			"Ifo Survey": "Business Surveys",
			"ILO Unemployment Rate": "Employment",
			"Import and Export Prices": "Growth",
			"Imports": "Growth",
			"Industrial Production": "Growth",
			"International Trade": "Growth",
			"IPPI": "Inflation",
			"ISM Mfg Index": "Business Surveys",
			"ISM Non-Mfg Index": "Business Surveys",
			"ISM Non-Mfg Survey": "Business Surveys",
			"Ivey Purchasing Managers' Index": "Business Surveys",
			"Jobless Claims": "Employment",
			"JOLTS": "Employment",
			"Kansas City Fed Manufacturing Index": "Central Bank",
			"KOF Swiss Leading Indicator": "Growth",
			"Labour cost index": "Employment",
			"Labour Force Survey": "Employment",
			"Labor Market Conditions Index": "Employment",
			"Labour Market Report": "Employment",
			"Leading Indicators": "Growth",
			"M3 Money Supply": "Central Bank",
			"M4 Money Supply": "Central Bank",
			"Machine Orders": "Growth",
			"Manufacturers' Orders": "Growth",
			"Manufacturing and mining survey": "Business Surveys",
			"Manufacturing Output": "Growth",
			"Manufacturing Sales": "Growth",
			"MBA Mortgage Applications": "Housing",
			"MBA Purchase Applications": "Growth",
			"Merchandise Trade": "Growth",
			"Merchandise trade": "Growth",
			"Merchandise Trade Balance": "Growth",
			"Money Supply": "Central Bank",
			"Monster Employment Index": "Employment",
			"Monthly GDP": "Growth",
			"Motor Vehicle Sales": "Growth",
			"Nationwide HPI": "Housing",
			"New Home Sales": "Housing",
			"NFIB Small Business Optimism Index": "Business Surveys",
			"Pending Home Sales Index": "Housing",
			"Peoples Bank of China": "Central Bank",
			"Personal Income and Outlays": "Consumer Surveys",
			"Philadelphia Fed Survey": "Central Bank",
			"Philadelphia Fed Business Outlook Survey": "Central Bank",
			"PMI Composite": "Business Surveys",
			"PMI Composite FLASH": "Business Surveys",
			"PMI Construction": "Business Surveys",
			"PMI Flash Mfg Index": "Business Surveys",
			"PMI Manufacturing Index": "Business Surveys",
			"PMI Manufacturing Index Flash": "Business Surveys",
			"PMI Services Flash": "Business Surveys",
			"PMI Services Index": "Business Surveys",
			"PMI Services Index Flash": "Business Surveys",
			"POP": "Misc",
			"PPI": "Inflation",
			"PPI-FD": "Inflation",
			"Producer and Import Price Index": "Inflation",
			"Producer Input Price Index": "Inflation",
			"Producer Price Index": "Inflation",
			"Productivity and Costs": "Growth",
			"Public Sector Finances": "Misc",
			"Quarterly Services Survey": "Business Surveys",
			"RBA  Announcement": "Central Bank",
			"RBA Meeting Minutes": "Central Bank",
			"RBC CASH Index": "Central Bank",
			"RBNZ Announcement": "Central Bank",
			"Redbook": "Business Surveys",
			"Reserve Bank of India": "Central Bank",
			"Residential Property Prices": "Housing",
			"Retail Sales": "Growth",
			"Retail Trade": "Growth",
			"Reuters Manufacturing PMI": "Business Surveys",
			"Reuters Services PMI": "Business Surveys",
			"Richmond Fed Manufacturing Index": "Central Bank",
			"RMPI": "Business Surveys",
			"S&P Case-Shiller HPI": "Housing",
			"SECO Consumer Climate": "Consumer Surveys",
			"SNB Monetary Policy Assessment": "Central Bank",
			"Speech": "Central Bank",
			" Speech": "Central Bank",
			"State Street Investor Confidence Index": "Consumer Surveys",
			"SVME Purchasing Managers' Index": "Business Surveys",
			"Tankan": "Business Surveys",
			"Tankan Small Mfrs": "Business Surveys",
			"Tertiary Index": "Growth",
			"Treasury Budget": "Central Bank",
			"Treasury International Capital": "Central Bank",
			"Treasury STRIPS": "Central Bank",
			"UBS Consumption Index": "Consumer Surveys",
			"Unemployment": "Employment",
			"Unemployment Rate": "Employment",
			"Unemployment Rate - East": "Employment",
			"Unemployment Rate - West": "Employment",
			"Wholesale Trade": "Growth",
			"WPI": "Inflation",
			"ZEW Survey": "Misc"
		};
	}
	return eventCalendarTypeMap[eventName];
}

function getDaysInWeek(date, which) {
	var first = date.getDate() - date.getDay();

	//account for last and next week options
	if (which) {
		if (which == "last")
			first = first - 7;
		else if (which == "next")
			first = first + 7;
	}

	date.setDate(first);
	var counter = 0;
	var days = [];
	while (counter < 7) {
		days.push(new Date(date));
		date.setDate(date.getDate() + 1);
		counter++;
	}
	return days;
}

function getDaysInMonth(month, which) {
	var date = new Date();
	var days = [];

	//account for last and next week options
	if (which) {
		if (which == "last") {
			month = ((month - 1 == -1) ? 11 : month - 1);
			date.setMonth(month);
			date.setFullYear(date.getFullYear() - 1);
		}
		else if (which == "next") {
			month = ((month + 1 == 12) ? 0 : month + 1);
			date.setMonth(month);
			date.setFullYear(date.getFullYear() + 1);
		}
	}
	date.setDate(1);

	while (date.getMonth() == month) {
		days.push(new Date(date));
		date.setDate(date.getDate() + 1);
	}
	return days;
}

function TimeframeCalendarTypes(timeframe) {
	if (!timeframeCalendarTypeMap) {
		timeframeCalendarTypeMap = {
			"Today": [new Date()],
			"This week": getDaysInWeek(new Date()),
			"This month": getDaysInMonth(new Date().getMonth()),
			"Last week": getDaysInWeek(new Date(), "last"),
			"Next week": getDaysInWeek(new Date(), "next"),
			"Last month": getDaysInMonth(new Date().getMonth(), "last"),
			"Next month": getDaysInMonth(new Date().getMonth(), "next")
		}
	}
	return timeframeCalendarTypeMap[timeframe];
}

function economicCalendarCallback(error, data, containerObject) {
	//debugger;
	var containerId = containerObject.attr('id');
	containerObject.append('<div class="filter" id="' + containerId + '-showFilters">Filter<div style="display:none" id="' + containerId + '-filters"></div></div>');
	var filterDiv = $('#' + containerId + '-filters');

	_.each(eventTypes, function (value) {
		filterDiv.append(' <input type="checkbox" checked="true" id="' + value + '"> ' + value);
	});


	containerObject.append('<div class="timeframes" id="' + containerId + '-timeframes"></div>');
	var timeframeDiv = $('#' + containerId + '-timeframes');
	_.each(timeframes, function (value) {
		timeframeDiv.append(' <a id="' + value + '">' + value + '</a>&nbsp;&nbsp; ');
	});

	$('#' + containerId + '-showFilters').on('click', function () {
		if (filterDiv.css('display') == 'none') {
			filterDiv.show();
		} else {
			filterDiv.hide();
		}
	});

	economicCalendarData[containerId] = data;

	require(['moment', 'datatablesdatetime', 'datatablesresponsive'], function (moment) {
		window.moment = moment;


		var table = $('<table>').attr('id', containerId + '-table').css('width', '100%').addClass('display responsive');
		containerObject.append(table);
		var dataTable = $('#' + containerId + '-table').dataTable({
			'data': data,
			"columns": [
				{
					"data": "CountryCode",
					title: "Country"
				},
				{
					"data": "Subject",
					title: "Subject"
				},
				{
					"data": "Date",
					title: "Date",
					type: 'datetime',
					render: $.fn.dataTable.render.moment('MM/DD/YYYY hh:mm:ss')
				},
				{
					"data": "Values",
					title: '<table style="width:100%"><tr><th style="width:40%">Data</th><th style="width:30%">Actual</th><th style="width:30%">Consensus</th></tr></table>',
					responsivePriority: 20000,
					render: function (values) {
						if (values.length) {
							var table = '<table style="width:100%; background:transparent">';
							_.each(values, function (value) {
								table += '<tr style="background:transparent"><td style="width:40%">' + value['ValueName'] + '</td><td style="width:30%">' + value['Actual'] + '</td><td style="width:30%">' + value['Consensus'] + '</td></tr>';
							});
							table += '</table>'
							return table;
						} else {
							return '';
						}
					}
				}
			],
			order: [[2, 'asc']],
			responsive: true
		});


		$('#' + containerId + '-filters input').on('click', function () {
			var filters = [];

			$(this.parentElement.children).each(function () {
				var $this = $(this);

				if ($this.is(":checked")) {
					filters.push($this.attr("id"));
				}
			});

			var newData = _.filter(economicCalendarData[containerId], function (o) {
				return _.includes(filters, EventCalendarTypes(o.Subject));
			});

			var dataTable = $('#' + containerId + '-table').DataTable();
			dataTable.clear();
			dataTable.rows.add(newData);
			dataTable.draw();

		});

		$('#' + containerId + '-timeframes a').on('click', function () {

			var filters = TimeframeCalendarTypes(arguments[0].target.firstChild.data); // The specific acceptable dates

			var newData = _.filter(economicCalendarData[containerId], function (o) {
				for (var i = 0; i < filters.length; i++) {
					if (filters[i].getDate() == o.Date.getDate() && filters[i].getMonth() == o.Date.getMonth() && filters[i].getFullYear() == o.Date.getFullYear()) return o;
				}
			});

			var dataTable = $('#' + containerId + '-table').DataTable();
			dataTable.clear();
			dataTable.rows.add(newData);
			dataTable.draw();

		});

		$($('#' + containerId + '-timeframes a')[0]).click()

		containerObject.show();
	});
}

function economiccalendar(list) { //function is intentionally not camelcase
	list = JSON.parse(list);
	//PortalCore.addStyleSheet(cssUrl + 'modules/marketsnews.css');
	_.each(list, function (value) {
		var container = 'ciq-' + value;
		var settings = defaultSettings.items[value];
		var containerObject = $('#' + container);
		dataSources[portalSettings.dataSource].fetchEconomicCalendar(settings, economicCalendarCallback, containerObject);
	});

	PortalCore.addStyleSheet('https://cdn.jsdelivr.net/jquery.datatables/1.10.10/css/jquery.dataTables.min.css');
	PortalCore.addStyleSheet('https://cdn.jsdelivr.net/jquery.datatables/1.10.10/plugins/responsive/css/responsive.dataTables.min.css');
	//PortalCore.addStyleSheet(cssUrl + 'modules/economiccalendar.css');

}