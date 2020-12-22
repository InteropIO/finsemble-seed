// This file is intended for training purposes. Do not use it as is in your production environment.
var quoteFeed = {};
quoteFeed.url = "https://simulator.chartiq.com/datafeed";
quoteFeed.url += "?session=" + Date.now(); // Add a unique session ID, which is required by the ChartIQ data feed simulator.
/**
 * Fetches the data required when a chart loads.
 */
quoteFeed.fetchInitialData = function (symbol, startDate, endDate, params, cb) {
	var queryUrl =
		this.url +
		"&identifier=" +
		symbol +
		"&startdate=" +
		startDate +
		"&enddate=" +
		endDate +
		"&interval=" +
		params.interval +
		"&period=" +
		params.period +
		"&extended=" +
		1;
	this.sendAjax(queryUrl, function (status, response) {
		if (status == 200) {
			var newQuotes = quoteFeed.formatChartData(response);
			cb({ quotes: newQuotes });
		} else {
			cb({ error: response ? response : status });
		}
	});
};
/**
 * Fetches the data required for real-time chart updates.
 */
quoteFeed.fetchUpdateData = function (symbol, startDate, params, cb) {
	var queryUrl =
		this.url +
		"&identifier=" +
		symbol +
		"&startdate=" +
		startDate +
		"&interval=" +
		params.interval +
		"&period=" +
		params.period +
		"&extended=" +
		1;
	this.sendAjax(queryUrl, function (status, response) {
		if (status == 200) {
			var newQuotes = quoteFeed.formatChartData(response);
			cb({ quotes: newQuotes });
		} else {
			cb({ error: response ? response : status });
		}
	});
};
/**
 * Fetches the historical data required when a chart scrolls into past dates.
 */
quoteFeed.fetchPaginationData = function (
	symbol,
	startDate,
	endDate,
	params,
	cb
) {
	var queryUrl =
		this.url +
		"&identifier=" +
		symbol +
		"&startdate=" +
		startDate +
		"&enddate=" +
		endDate +
		"&interval=" +
		params.interval +
		"&period=" +
		params.period +
		"&extended=" +
		1;
	this.sendAjax(queryUrl, function (status, response) {
		if (status == 200) {
			var newQuotes = quoteFeed.formatChartData(response);
			cb({
				quotes: newQuotes,
				moreAvailable: startDate.getTime() > Date.now() - 86400000 * 5
			}); // Provide five days of historical data.
		} else {
			cb({ error: response ? response : status });
		}
	});
};
/**
 * Makes an HTTP request.
 * Sends the response text or an HTTP 500 Internal Server Error to the chart engine by means of the cb (callback) parameter.
 */
quoteFeed.sendAjax = function (url, cb) {
	var server = new XMLHttpRequest();
	server.onload = function () {
		cb(this.status, this.responseText);
	};
	server.onerror = function () {
		cb(500);
	};
	url += "&" + Date.now(); // Add a cache buster to the URL.
	server.open("GET", url);
	server.send();
};
/**
 * Converts the data from an HTTP response into the format required by ChartIQ charts.
 * For illustrative purposes only. The simulator data is in the correct format.
 * The call to JSON.parse() is required to convert the response JSON data to an array
 * of JavaScript objects.
 */
quoteFeed.formatChartData = function (response) {
	var data = JSON.parse(response);
	var newQuotes = [];
	for (var i = 0; i < data.length; i++) {
		newQuotes[i] = {};
		newQuotes[i].DT = data[i].DT;
		newQuotes[i].Open = data[i].Open;
		newQuotes[i].High = data[i].High;
		newQuotes[i].Low = data[i].Low;
		newQuotes[i].Close = data[i].Close;
		newQuotes[i].Volume = data[i].Volume;
	}
	return newQuotes;
};
