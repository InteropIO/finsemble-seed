// -------------------------------------------------------------------------------------------
// Copyright 2012-2017 by ChartIQ, Inc
// -------------------------------------------------------------------------------------------
// SAMPLE QUOTEFEED IMPLEMENTATION -- Connects charts to ChartIQ Simulator
///////////////////////////////////////////////////////////////////////////////////////////////////////////
var quoteFeedSimulator = {}; // the quotefeed object
// local, non-dependent implementation of XmlHttpRequest
quoteFeedSimulator.postAjax = function (url, cb) {
	var server = new XMLHttpRequest();
	url += (url.indexOf("?") == -1 ? "?" : "&") + new Date().getTime();
	server.open("GET", url);
	server.onload = function () {
		cb(this.status, this.responseText);
	};
	server.onerror = function () {
		cb(500);
	};
	server.send();
};
quoteFeedSimulator.maxTicks = 20000;
quoteFeedSimulator.url = "https://simulator.chartiq.com/datafeed";
// called by chart to fetch initial data
quoteFeedSimulator.fetchInitialData = function (
	symbol,
	suggestedStartDate,
	suggestedEndDate,
	params,
	cb
) {
	var queryUrl =
		quoteFeedSimulator.url +
		"?session=" +
		params.quoteDriverID + // add on unique sessionID required by ChartIQ simulator;
		"&identifier=" +
		symbol +
		"&startdate=" +
		suggestedStartDate.toISOString() +
		"&enddate=" +
		suggestedEndDate.toISOString() +
		"&interval=" +
		params.interval +
		"&period=" +
		params.period +
		"&extended=" +
		(params.extended ? 1 : 0); // using filter:true for after hours
	quoteFeedSimulator.postAjax(queryUrl, function (status, response) {
		// process the HTTP response from the datafeed
		if (status == 200) {
			// if successful response from datafeed
			var newQuotes = quoteFeedSimulator.formatChartData(response, symbol);
			cb({
				quotes: newQuotes,
				moreAvailable: true,
				attribution: { source: "simulator", exchange: "RANDOM" }
			}); // return the fetched data; init moreAvailable to enable pagination
		} else {
			// else error response from datafeed
			cb({ error: response ? response : status }); // specify error in callback
		}
	});
};
// called by chart to fetch update data
quoteFeedSimulator.fetchUpdateData = function (symbol, startDate, params, cb) {
	var queryUrl =
		quoteFeedSimulator.url +
		"?session=" +
		params.quoteDriverID + // add on unique sessionID required by ChartIQ simulator;
		"&identifier=" +
		symbol +
		"&startdate=" +
		startDate.toISOString() +
		"&interval=" +
		params.interval +
		"&period=" +
		params.period +
		"&extended=" +
		(params.extended ? 1 : 0); // using filter:true for after hours
	quoteFeedSimulator.postAjax(queryUrl, function (status, response) {
		// process the HTTP response from the datafeed
		if (status == 200) {
			// if successful response from datafeed
			var newQuotes = quoteFeedSimulator.formatChartData(response, symbol);
			cb({
				quotes: newQuotes,
				attribution: { source: "simulator", exchange: "RANDOM" }
			}); // return the fetched data
		} else {
			// else error response from datafeed
			cb({ error: response ? response : status }); // specify error in callback
		}
	});
};
// called by chart to fetch pagination data
quoteFeedSimulator.fetchPaginationData = function (
	symbol,
	suggestedStartDate,
	endDate,
	params,
	cb
) {
	var queryUrl =
		quoteFeedSimulator.url +
		"?session=" +
		params.quoteDriverID + // add on unique sessionID required by ChartIQ simulator;
		"&identifier=" +
		symbol +
		"&startdate=" +
		suggestedStartDate.toISOString() +
		"&enddate=" +
		endDate.toISOString() +
		"&interval=" +
		params.interval +
		"&period=" +
		params.period +
		"&extended=" +
		(params.extended ? 1 : 0); // using filter:true for after hours
	quoteFeedSimulator.postAjax(queryUrl, function (status, response) {
		// process the HTTP response from the datafeed
		if (status == 200) {
			// if successful response from datafeed
			var newQuotes = quoteFeedSimulator.formatChartData(response, symbol);
			cb({
				quotes: newQuotes,
				moreAvailable: suggestedStartDate.getTime() > 0,
				upToDate: endDate.getTime() > Date.now(),
				attribution: { source: "simulator", exchange: "RANDOM" }
			}); // return fetched data (and set moreAvailable)
		} else {
			// else error response from datafeed
			cb({ error: response ? response : status }); // specify error in callback
		}
	});
};
// utility function to format data for chart input; given simulator was designed to work with library, very little formatting is needed
// symbol argument can be used to further refine simulated data
quoteFeedSimulator.formatChartData = function (response, symbol) {
	var feeddata = JSON.parse(response);
	var newQuotes = [];
	for (var i = 0; i < feeddata.length; i++) {
		var newQuote = {};
		newQuote.DT = new Date(feeddata[i].DT); // DT is a string in ISO format, make it a Date instance
		newQuote.Open = feeddata[i].Open;
		newQuote.High = feeddata[i].High;
		newQuote.Low = feeddata[i].Low;
		newQuote.Close = feeddata[i].Close;
		newQuote.Volume = feeddata[i].Volume;
		newQuotes.push(newQuote);
	}
	return newQuotes;
};
export default quoteFeedSimulator;
