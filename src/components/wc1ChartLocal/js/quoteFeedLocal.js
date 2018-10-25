// -------------------------------------------------------------------------------------------
// Copyright 2012-2018 by ChartIQ, Inc
// -------------------------------------------------------------------------------------------
// SAMPLE QUOTEFEED IMPLEMENTATION -- Connects charts to ChartIQ Simulator
///////////////////////////////////////////////////////////////////////////////////////////////////////////

/*jshint esversion: 6 */

(function (definition) {
	"use strict";

	if (typeof exports === "object" && typeof module === "object") {
		module.exports = definition( require('./chartiq'), require('../SimulatorServer/DataGenerator') );
	} else if (typeof define === "function" && define.amd) {
		define(["chartiq", "../SimulatorServer/DataGenerator"], definition);
	} else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition(global, global);
	} else {
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for quoteFeedSimulator.js.");
	}
})(function(_exports, DataGenerator){
	const CIQ = _exports.CIQ;
	const DG = DataGenerator.DG;

	let quoteFeedLocal = _exports.quoteFeedLocal = {};

	/**
	 * Convenience function for generating a globally unique id (GUID).
	 * See http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
	 * @return {string} An RFC4122 version 4 compliant UUID
	 * @private
	 */
	quoteFeedLocal.generateGUID = function(){
		var d = new Date().getTime();
		if(window.performance && typeof window.performance.now === "function"){
			d += window.performance.now(); //use high-precision timer if available
		}
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (d + Math.random()*16)%16 | 0;
			d = Math.floor(d/16);
			return (c=='x' ? r : (r&0x3|0x8)).toString(16);
		});
		return uuid;
	};

	quoteFeedLocal.maxTicks=50000;
	quoteFeedLocal.url= "?session=" + quoteFeedLocal.generateGUID(); // add on unique sessionID required by ChartIQ simulator;


	quoteFeedLocal.fetchInitialData = function(symbol, suggestedStartDate, suggestedEndDate, params, cb){
		var queryUrl = this.url +
			"&identifier=" + symbol +
			"&startdate=" + suggestedStartDate.toISOString()  +
			"&enddate=" + suggestedEndDate.toISOString()  +
			"&interval=" + params.interval +
			"&period=" + params.period +
			"&extended=" + (params.stx.extendedHours?1:0);   // using filter:true for after hours

		var reqParams = DG.ensureDefaults(DG.parseRequest(queryUrl));
		var newQuotes = DG.generateData(params.stx.chart.market,reqParams);
		cb({quotes:newQuotes, moreAvailable:suggestedStartDate.getTime()>0, attribution:{source:"simulator", exchange:"RANDOM"}}); // return fetched data (and set moreAvailable)
	};

	quoteFeedLocal.fetchUpdateData = function(symbol, suggestedStartDate, params, cb){
		var queryUrl = this.url +
			"&identifier=" + symbol +
			"&startdate=" + suggestedStartDate.toISOString()  +
			"&interval=" + params.interval +
			"&period=" + params.period +
			"&extended=" + (params.stx.extendedHours?1:0);   // using filter:true for after hours

		var reqParams = DG.ensureDefaults(DG.parseRequest(queryUrl));
		var newQuotes = DG.generateData(params.stx.chart.market,reqParams);
		cb({quotes:newQuotes, moreAvailable:suggestedStartDate.getTime()>0, attribution:{source:"simulator", exchange:"RANDOM"}}); // return fetched data (and set moreAvailable)
	};

	quoteFeedLocal.fetchPaginationData = function(symbol, suggestedStartDate, endDate, params, cb){
		var queryUrl = this.url +
			"&identifier=" + symbol +
			"&startdate=" + suggestedStartDate.toISOString()  +
			"&enddate=" + endDate.toISOString()  +
			"&interval=" + params.interval +
			"&period=" + params.period +
			"&extended=" + (params.stx.extendedHours?1:0);   // using filter:true for after hours

		var reqParams = DG.ensureDefaults(DG.parseRequest(queryUrl));
		var newQuotes = DG.generateData(params.stx.chart.market,reqParams);
		cb({quotes:newQuotes, moreAvailable:suggestedStartDate.getTime()>0, attribution:{source:"simulator", exchange:"RANDOM"}}); // return fetched data (and set moreAvailable)
	};

	return (_exports.default = quoteFeedLocal);

});
