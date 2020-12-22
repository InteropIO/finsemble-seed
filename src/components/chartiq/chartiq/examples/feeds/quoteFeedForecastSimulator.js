// -------------------------------------------------------------------------------------------
// Copyright 2012-2019 by ChartIQ, Inc
// -------------------------------------------------------------------------------------------
// SAMPLE QUOTEFEED IMPLEMENTATION -- Generates randomized forecast data
///////////////////////////////////////////////////////////////////////////////////////////////////////////
import { CIQ } from "../../js/chartiq.js";
var quoteFeedForecastSimulator = {}; // the quotefeed object
// Some default constants which the simulator works with, they can be overridden
quoteFeedForecastSimulator.valids = ["FOR", "FF", "FTFT", "AIQ", "EURCHF"]; // valid symbols
quoteFeedForecastSimulator.periodsBack = 50; // where the forecast begins
quoteFeedForecastSimulator.periodsForward = 50; // where the forecast ends
quoteFeedForecastSimulator.randomizationFactor = 0.3; // how widely the close will fluctuate in the forecast
quoteFeedForecastSimulator.spreadPercentage = 0.05; // how quickly the high/low spread will be allowed to grow as the forecast progresses
quoteFeedForecastSimulator.certaintyPercentages = [
	0.35,
	0.15,
	0.08,
	0.05,
	0.02,
	0.01,
	0.01
]; // these add up to 100% and help predict the Certainty matrix which can be plotted on a scatterplot.
// each of these certainty percentages will get a price attached to it by the simulator
// Creates the forecast.  In the real world this function is replaced by a call to a remote server which contains the forecast data.
// In this implementation the entire series is returned in one response
quoteFeedForecastSimulator.generateData = function (
	stx,
	symbol,
	interval,
	period
) {
	if (!stx.chart.masterData || !stx.chart.masterData.length) return;
	if (quoteFeedForecastSimulator.valids.indexOf(symbol) == -1) return null; // no data for any symbol outside of defined set
	var endPoints, isSeries;
	if (symbol == stx.chart.symbol) endPoints = stx.chart.endPoints;
	else {
		for (var series in stx.chart.series) {
			if (symbol == stx.chart.series[series].parameters.symbol) {
				isSeries = true;
				endPoints = stx.chart.series[symbol].endPoints;
			}
		}
	}
	if (!endPoints) return;
	var iter_parms = {
		begin: endPoints.end,
		interval: interval,
		periodicity: period
	};
	var market = new CIQ.Market(CIQ.Market.Symbology.factory({ symbol: symbol }));
	var iterator = market.newIterator(iter_parms);
	iterator.previous(
		quoteFeedForecastSimulator.periodsBack * stx.layout.periodicity
	);
	// look for first record before iterator point that has data
	var startTick;
	for (
		startTick = stx.chart.masterData.length - 1;
		startTick >= 0;
		startTick--
	) {
		if (stx.chart.masterData[startTick].DT <= iterator.begin) break;
	}
	if (startTick < 0) startTick = 0;
	var originalStartValue = stx.chart.masterData[startTick],
		startValue,
		startDate,
		startVolume;
	while (startTick < stx.chart.masterData.length) {
		startValue = stx.chart.masterData[startTick];
		startDate = startValue.DT;
		startVolume = startValue.Volume;
		if (startValue) {
			if (isSeries) startValue = startValue[symbol];
			if (startValue) {
				if (typeof startValue == "object") {
					startVolume = startValue.Volume;
					startValue = startValue.Close;
				}
				if (startValue || startValue === 0) break;
			}
		}
		startTick++;
	}
	if (!startValue && startValue !== 0) {
		startValue = originalStartValue.Close;
		startDate = originalStartValue.DT;
		startVolume = originalStartValue.Volume;
	}
	var factor = quoteFeedForecastSimulator.randomizationFactor,
		decimalPlaces = 2;
	if (Math.abs(startValue) < 2) {
		decimalPlaces = 4;
		factor /= 100;
	}
	var pushData = [];
	var totalPeriods =
		(quoteFeedForecastSimulator.periodsBack +
			quoteFeedForecastSimulator.periodsForward) *
		stx.layout.periodicity;
	while (pushData.length < totalPeriods) {
		var lastForecast = pushData[pushData.length - 1];
		var record;
		if (lastForecast) {
			record = {
				DT: iterator.next(),
				Close: Number(
					((Math.random() - 0.5) * factor + lastForecast.Close).toFixed(
						decimalPlaces
					)
				),
				Open: Number(lastForecast.Close),
				Volume: lastForecast.Volume * (1 + (Math.random() - 0.5) / 10),
				Certainty: []
			};
			record.High =
				record.Close *
				(1 +
					(quoteFeedForecastSimulator.spreadPercentage * pushData.length) /
						totalPeriods);
			record.Low =
				record.Close *
				(1 -
					(quoteFeedForecastSimulator.spreadPercentage * pushData.length) /
						totalPeriods);
			var certaintyPercentageLength =
				quoteFeedForecastSimulator.certaintyPercentages.length;
			for (var cp = 0; cp < certaintyPercentageLength; cp++) {
				var v = quoteFeedForecastSimulator.certaintyPercentages[cp];
				if (!cp) record.Certainty.push([record.Close, null, v]);
				else {
					record.Certainty.push([
						record.Close +
							(cp / (certaintyPercentageLength - 1)) *
								(record.High - record.Close),
						null,
						v
					]);
					record.Certainty.push([
						record.Close +
							(cp / (certaintyPercentageLength - 1)) *
								(record.Low - record.Close),
						null,
						v
					]);
				}
			}
		} else {
			record = {
				DT: startDate,
				Close: startValue,
				High: startValue,
				Low: startValue,
				Open: startValue,
				Volume: startVolume
			};
			iter_parms.begin = startDate;
			iterator = market.newIterator(iter_parms);
		}
		pushData.push(record);
	}
	return pushData;
};
// called by chart to fetch initial data.  This implementation returns all the existing data at once, so moreAvailable is set to false.
quoteFeedForecastSimulator.fetchInitialData = function (
	symbol,
	suggestedStartDate,
	suggestedEndDate,
	params,
	cb
) {
	var quotes = quoteFeedForecastSimulator.generateData(
		params.stx,
		symbol,
		params.interval,
		params.period
	);
	if (!quotes) cb({ error: "Not found" });
	else
		cb({
			quotes: quotes,
			moreAvailable: false,
			attribution: { source: "forecaster", exchange: "RANDOM" }
		});
};
// called by chart to fetch update data
quoteFeedForecastSimulator.fetchUpdateData = function (
	symbol,
	startDate,
	params,
	cb
) {
	var quotes = quoteFeedForecastSimulator.generateData(
		params.stx,
		symbol,
		params.interval,
		params.period
	);
	if (!quotes) cb({ error: "Not found" });
	else
		cb({
			quotes: quotes,
			moreAvailable: false,
			attribution: { source: "forecaster", exchange: "RANDOM" }
		});
};
// called by chart to fetch pagination data.  Shouldn't be called since the initial request set moreAvailable to false.
quoteFeedForecastSimulator.fetchPaginationData = function (
	symbol,
	suggestedStartDate,
	endDate,
	params,
	cb
) {
	var quotes = quoteFeedForecastSimulator.generateData(
		params.stx,
		symbol,
		params.interval,
		params.period
	);
	if (!quotes) cb({ error: "Not found" });
	else
		cb({
			quotes: quotes,
			moreAvailable: false,
			attribution: { source: "forecaster", exchange: "RANDOM" }
		});
};
export default quoteFeedForecastSimulator;
