/**
 *	8.0.0
 *	Generation date: 2020-10-08T11:28:10.884Z
 *	Client name: finsemble
 *	Package Type: Technical Analysis
 *	License type: annual
 *	Expiration date: "2021/07/20"
 *	Domain lock: ["127.0.0.1","localhost","chartiq.com","finsemble.com"]
 *	iFrame lock: true
 */

/***********************************************************
 * Copyright by ChartIQ, Inc.
 * Licensed under the ChartIQ, Inc. Developer License Agreement https://www.chartiq.com/developer-license-agreement
*************************************************************/
/*************************************** DO NOT MAKE CHANGES TO THIS LIBRARY FILE!! **************************************/
/* If you wish to overwrite default functionality, create a separate file with a copy of the methods you are overwriting */
/* and load that file right after the library has been loaded, but before the chart engine is instantiated.              */
/* Directly modifying library files will prevent upgrades and the ability for ChartIQ to support your solution.          */
/*************************************************************************************************************************/
/* eslint-disable no-extra-parens */


/*
	Request Limiter
	===============
	Including this file will allow you to limit the number of outbound requests to any specific domain.
	Set CIQ.RequestLimiter.outboundAjaxLimit to a non-zero value to limit the requests per second to that value.
	When a limit is exceeded, the callback function is passed an status=429,
	Set CIQ.RequestLimiter.logToConsole to have the requests made that second, output to the console.
	Set CIQ.RequestLimiter.logToServer to a URL to have the requests made that second, POSTed there.
*/
import { CIQ } from "../../js/chartiq.js";
/**
 * Rate limiter for outbound AJAX queries. Can limit the number of outbound requests per second
 * per domain.
 *
 * @namespace CIQ.RequestLimiter
 * @since
 * - 3.0.0
 * - 8.0.0 Removed the `CIQ.Extras` namespace.
 */
CIQ.RequestLimiter = function () {};
/**
 * Outbound Ajax rate limit
 * Set to 0 or null to turn off limit
 * @type {number}
 * @default
 * @alias outboundAjaxLimit
 * @memberof CIQ.RequestLimiter
 * @since 3.0.0
 */
CIQ.RequestLimiter.outboundAjaxLimit = 25;
/**
 * Logging switch
 * @type {boolean}
 * @default
 * @alias logToConsole
 * @memberof CIQ.RequestLimiter
 * @since 3.0.0
 */
CIQ.RequestLimiter.logToConsole = true;
/**
 * Remote Logging URL
 * Set to complete URL of server to POST the exceeded limit requests to
 * @type {string}
 * @default
 * @alias logToServer
 * @memberof CIQ.RequestLimiter
 * @example
 * 	CIQ.RequestLimiter.logToServer="https://log.myserver.com/logging/limits/postHandler";
 * @since 3.0.0
 */
CIQ.RequestLimiter.logToServer = null;
/**
 * Rate limiter test for outbound AJAX queries.  If rate is exceeded, request is not made and a 429 error status is returned.
 * @param  {string} url    The url to send the ajax query to
 * @return {boolean}       Whether rate is exceeded
 * @memberof CIQ.RequestLimiter
 * @private
 * @since 3.0.0
 */
CIQ.RequestLimiter.hitRequestLimit = function (url) {
	if (!CIQ.RequestLimiter.outboundAjaxLimit) return false;
	var urlParts = url.split("/");
	if (urlParts.length < 2) return false;
	var domain = urlParts[2];
	if (!CIQ.RequestLimiter.ajaxRequestLog)
		CIQ.RequestLimiter.ajaxRequestLog = {};
	var log = CIQ.RequestLimiter.ajaxRequestLog;
	if (!log[domain]) log[domain] = [];
	log = log[domain];
	var entry = { url: url, time: new Date().getTime() };
	while (log.length && log[0].time + 1000 <= entry.time) log.shift();
	log.push(entry);
	if (log.length < CIQ.RequestLimiter.outboundAjaxLimit) return false;
	//print results
	var text = "Ajax Request Limit Exceeded: " + domain + "\n";
	for (var i = 0; i < log.length; i++) {
		text += (i + 1).toString() + ". " + log[i].time + "   " + log[i].url + "\n";
	}
	if (CIQ.RequestLimiter.logToConsole) console.log(text);
	if (CIQ.RequestLimiter.logToServer) {
		CIQ.postAjax({
			url: CIQ.RequestLimiter.logToServer,
			payload: text,
			ungovernable: true
		});
	}
	return true;
};
