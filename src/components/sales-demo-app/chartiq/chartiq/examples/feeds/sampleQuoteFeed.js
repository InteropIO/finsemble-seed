// This file is intended for training purposes. Do not use it as is in your production environment.
const quoteFeed = {};
quoteFeed.url = "https://simulator.chartiq.com/datafeed";
// Add a unique session ID, which is required by the ChartIQ data feed simulator.
quoteFeed.url += "?session=" + Date.now();
/**
 * Fetches the data required when a chart loads.
 *
 * @param {string} symbol A stock symbol, such as SPY.
 * @param {Date} startDate The starting date of the fetched time series data.
 * @param {Date} endDate The ending date of the fetched time series data.
 * @param {object} params Additional information about the data request.
 * @param {function} cb A callback function that makes the response from the data provider
 * 		available to the chart engine. The function accepts an object as a parameter. The object
 * 		should contain the response from the data provider, which is either an array of data or
 * 		an error message; for example `{ quotes: quotesArray }` or
 * 		`{ error: errorTextOrStatusCode }`.
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
 *
 * @param {string} symbol A stock symbol.
 * @param {Date} startDate The starting date of the fetched time series data.
 * @param {object} params Additional information about the data request.
 * @param {function} cb A callback function that makes the response from the data provider
 * 		available to the chart engine. The function accepts an object as a parameter. The object
 * 		should contain the response from the data provider, which is either an array of data or
 * 		an error message; for example `{ quotes: quotesArray }` or
 * 		`{ error: errorTextOrStatusCode }`.
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
 *
 * @param {string} symbol A stock symbol.
 * @param {Date} startDate The starting date of the fetched time series data.
 * @param {Date} endDate The ending date of the fetched time series data.
 * @param {object} params Additional information about the data request.
 * @param {function} cb A callback function that makes the response from the data provider
 * 		available to the chart engine. The function accepts an object as a parameter. The object
 * 		should contain the response from the data provider, which is either an array of data or
 * 		an error message; for example `{ quotes: quotesArray }` or
 * 		`{ error: errorTextOrStatusCode }`.
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
			// Provide five days of historical data.
			cb({
				quotes: newQuotes,
				moreAvailable: startDate.getTime() > Date.now() - 86400000 * 5
			});
		} else {
			cb({ error: response ? response : status });
		}
	});
};
/**
 * Makes an HTTP request.
 *
 * Sends the response text or an HTTP 500 Internal Server Error to the chart engine by means of
 * the `cb` (callback) parameter.
 *
 * @param {string} url The endpoint of the HTTP request.
 * @param {function} cb A callback function called by event handlers of the HTTP request.
 * 		Function parameters include the status code and response of the HTTP request.
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
 *
 * For illustrative purposes only. The simulator data is in the correct format. The response JSON
 * data is converted to an array of JavaScript objects.
 *
 * @param {string} response The data provider's response in JSON format.
 * @return {Array} The data provider response properly formatted in an array of JavaScript objects.
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
export default quoteFeed;
