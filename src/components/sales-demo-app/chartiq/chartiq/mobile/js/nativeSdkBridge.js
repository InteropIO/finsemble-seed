/**
 *	8.1.0
 *	Generation date: 2020-12-14T16:21:56.817Z
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


import { CIQ } from "../../js/chartiq.js";
//disable undeclared globals
/*jshint -W117 */
/* global webkit, QuoteFeed */
let stxx = null;
let quoteFeedNativeBridge = null;
Object.assign(window, { CIQ }); // webview only has access to CIQ when it's on the window object
/**
 * Contains calls that allow a native iOS and Android application to interface with the charting library
 * without having to clutter either Swift/Objective C or Java source with unnecessary Javascript.
 *
 * Please note that all functions and variables are exposed globally on the webview.
 *
 * All methods were designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * @namespace CIQ.MobileBridge
 */
CIQ.MobileBridge = CIQ.MobileBridge || function () {};
/**
 * Object that with a unique string:function mapping that will ensure the quotefeed calls the correct callback.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * @Object
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.quoteFeedCallbacks = {};
/**
 * Will be set to `true` when an Android device is bring used.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * @boolean
 * @default false
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.isAndroid = false;
/**
 * String representing the class for CIQ's default light theme.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * @string
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.dayCss = "ciq-day";
/**
 * String representing the class for CIQ's default dark theme.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * @string
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.nightCss = "ciq-night";
/**
 * Boolean that will be set to true when the chart has been created, ensuring to the native mobile side that it is okay to interact
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * @Boolean
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.chartAvailable = false;
/**
 * DOM object of the cq-undo component. This is needed in order to relay undo/redo states to the mobile SDK.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * @Object
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.undoObject = document.querySelector("cq-undo");
/**
 * Sets the state of the loaded chart
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * @param {boolean} finished the current chart available state
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.setChartAvailable = function (finished) {
	this.chartAvailable = finished;
};
/**
 * Checks the chart availability
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * @returns {boolean} the current chart available state
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.isChartAvailable = function () {
	return this.chartAvailable;
};
/**
 * Helper function that will set the chart engine variable for all necessary functions
 * By default the sample template uses stxx, but just in case the user changes the name
 * @param {CIQ.ChartEngine} chartEngine The chart instance
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.setChartEngineInBridge = function (chartEngine) {
	stxx = chartEngine;
	Object.assign(window, { stxx }); // webview only has access to the chart engine when it's on the window object
};
/**
 * Helper function that will set the quotefeed variable for all necessary functions
 * By default the sample template uses quoteFeedNativeBridge, but just in case the user changes the name
 * @param quoteFeed
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.setQuoteFeedInBridge = function (quoteFeed) {
	quoteFeedNativeBridge = quoteFeed;
};
/**
 * Determines where the chart is being loaded based on the userAgent.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * If not loaded on Android then enables proxy logging automatically.
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.determineOs = function () {
	var userAgent = navigator.userAgent;
	if (/android/i.test(userAgent)) {
		this.isAndroid = true;
	} else {
		// Logging works automatically in Android native apps, so no proxyLogger necessary.
		this.proxyLogger();
	}
};
/**
 * Allow console logging in iOS. This will overwrite the default console logging on iOS to return messages via webkit.messageHandlers.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.proxyLogger = function () {
	var originals = {
		log: console.log,
		warn: console.warn,
		error: console.error
	};
	console.log = function () {
		webkit.messageHandlers.logHandler.postMessage({
			method: "LOG",
			arguments: JSON.parse(JSON.stringify(arguments))
		});
		return originals.log.apply(this, arguments);
	};
	console.warn = function () {
		webkit.messageHandlers.logHandler.postMessage({
			method: "WARN",
			arguments: JSON.parse(JSON.stringify(arguments))
		});
		return originals.warn.apply(this, arguments);
	};
	console.error = function () {
		webkit.messageHandlers.logHandler.postMessage({
			method: "ERROR",
			arguments: JSON.parse(JSON.stringify(arguments))
		});
		return originals.error.apply(this, arguments);
	};
};
/**
 * A simple quotefeed with data parsing functions.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 * @param {Object} parameters
 * @param {Date} parameters.start A starting date for requesting data
 * @param {Date} [parameters.end] An ending date for requesting data
 * @param {string} parameters.symbol The symbol to fetch data for
 * @param {Number} parameters.period period from a chart layout
 * @param {string} [parameters.timeUnit] timeUnit from a chart layout
 * @param {Function} cb Function passed in to handle data after it is parsed.
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.nativeQuoteFeed = function (parameters, cb) {
	var id = CIQ.uniqueID();
	if (parameters.func === "pullInitialData") {
		this.quoteFeedCallbacks[id] = cb;
		if (this.isAndroid) {
			QuoteFeed.pullInitialData(
				parameters.symbol,
				parameters.period,
				parameters.timeUnit,
				parameters.start.toISOString(),
				parameters.end.toISOString(),
				parameters,
				id
			);
		} else {
			webkit.messageHandlers.pullInitialDataHandler.postMessage({
				cb: id,
				symbol: parameters.symbol,
				startDate: parameters.start.toISOString(),
				endDate: parameters.end.toISOString(),
				interval: parameters.timeUnit,
				period: parameters.period
			});
		}
	}
	if (parameters.func === "pullUpdate") {
		this.quoteFeedCallbacks[id] = cb;
		if (this.isAndroid) {
			QuoteFeed.pullUpdate(
				parameters.symbol,
				parameters.period,
				parameters.timeUnit,
				parameters.start.toISOString(),
				parameters,
				id
			);
		} else {
			webkit.messageHandlers.pullUpdateDataHandler.postMessage({
				cb: id,
				symbol: parameters.symbol,
				startDate: parameters.start.toISOString(),
				interval: parameters.timeUnit,
				period: parameters.period
			});
		}
	}
	if (parameters.func === "pullPagination") {
		this.quoteFeedCallbacks[id] = cb;
		if (this.isAndroid) {
			QuoteFeed.pullPagination(
				parameters.symbol,
				parameters.period,
				parameters.timeUnit,
				parameters.start.toISOString(),
				parameters.end.toISOString(),
				parameters,
				id
			);
		} else {
			webkit.messageHandlers.pullPaginationDataHandler.postMessage({
				cb: id,
				symbol: parameters.symbol,
				startDate: parameters.start.toISOString(),
				endDate: parameters.end.toISOString(),
				interval: parameters.timeUnit,
				period: parameters.period
			});
		}
	}
};
/**
 * Parses JSON data into an array of new OHLC quotes and updates the chart with them.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * Will call {@link CIQ.ChartEngine#updateChartData} if no callback is provided to automatically update.
 * @param {String} data JSON object of your data from a query
 * @param {Function} [callbackID] A custom function to update
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.parseData = function (data, callbackId) {
	var feeddata = JSON.parse(data);
	var newQuotes = [];
	for (var i = 0; i < feeddata.length; i++) {
		newQuotes[i] = {};
		newQuotes[i].DT = new Date(feeddata[i].DT);
		newQuotes[i].Open = feeddata[i].Open;
		newQuotes[i].High = feeddata[i].High;
		newQuotes[i].Low = feeddata[i].Low;
		newQuotes[i].Close = feeddata[i].Close;
		newQuotes[i].Volume = feeddata[i].Volume;
	}
	if (callbackId) {
		// pull method
		var quoteFeedCb = this.quoteFeedCallbacks[callbackId];
		quoteFeedCb({ quotes: newQuotes, moreAvailable: true });
		delete this.quoteFeedCallbacks[callbackId];
	} else {
		// push method
		stxx.updateChartData(newQuotes);
	}
};
/**
 * Gathers the necessary information for any HUD based on cursor position and returns that data.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * This function will provide Open, High, Low, Close and Volume for a given quote.
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.getHudDetails = function () {
	var data = {};
	var tick = stxx.barFromPixel(stxx.cx);
	var prices = stxx.chart.xaxis[tick];
	if (prices !== null) {
		if (prices.data) {
			data.price = stxx.formatPrice(prices.data[stxx.chart.defaultPlotField]);
			data.open = stxx.formatPrice(prices.data.Open);
			data.close = stxx.formatPrice(prices.data.Close);
			data.high = stxx.formatPrice(prices.data.High);
			data.low = stxx.formatPrice(prices.data.Low);
			data.volume = CIQ.condenseInt(prices.data.Volume);
		}
	}
	if (this.isAndroid) {
		return data;
	}
	return JSON.stringify(data);
};
/**
 * Helper function that will retrieve a chart layout value from the given property.
 * @param {string} property field name to retrieve a value for
 * @returns JSON string or a Java object representation of the field value
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.getLayoutProperty = function (property) {
	var layoutProperty = stxx.layout[property];
	if (this.isAndroid) {
		return layoutProperty;
	}
	return JSON.stringify(layoutProperty);
};
/**
 * Helper function that will retrieve a Chart value from the given property.
 * @param {string} property field name to retrieve a value for
 * @returns JSON string or a Java object representation of the field value
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.getChartProperty = function (property) {
	var chartProperty = stxx.chart[property];
	if (this.isAndroid) {
		return chartProperty;
	}
	return JSON.stringify(chartProperty);
};
/**
 * Helper function that will retrieve a Chart Engine value from the given property.
 * @param {string} property field name to retrieve a value for
 * @returns JSON string or a Java object representation of the field value
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.getEngineProperty = function (property) {
	var engineProperty = stxx[property];
	if (this.isAndroid) {
		return engineProperty;
	}
	return JSON.stringify(engineProperty);
};
//////////////////////////
/*** Chart functions ***/
////////////////////////
/**
 * Native wrapper for {@link CIQ.ChartEngine#setPeriodicity}.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * Only accepts arguments individually and passes them into a params object
 *
 * @param {number} params.period The number of elements from masterData to roll-up together into one data point on the chart (candle,bar, etc). If set to 30 in a candle chart, for example, each candle will represent 30 raw elements of `interval/timeUnit` type.
 * @param {string} [params.timeUnit] Type of data requested. Valid values are "millisecond","second","minute","day","week", "month" or 'tick'. If not set, will default to "minute". **"hour" is NOT a valid timeUnit. Use `timeUnit:"minute", interval:60` instead**
 * @param {string} [params.interval] Further qualifies pre-rolled details of intra-day `timeUnits` ("millisecond","second","minute") and will be converted to “1” if used with "day","week" or  "month" 'timeUnit'. Some feeds provide data that is already rolled up. For example, there may be a feed that provides 5 minute bars. To let the chart know you want that 5-minute bar from your feed instead of having the chart get individual 1 minute bars and roll them up, you would set the `interval` to '5' and `timeUnit` to 'minute'
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.setPeriodicity = function (period, interval, timeUnit) {
	var params = {
		period: period,
		interval: interval,
		timeUnit: timeUnit
	};
	var loader = document.querySelector("cq-loader");
	if (loader) loader.show();
	stxx.setPeriodicity(params, function () {
		if (loader) loader.hide();
	});
};
/**
 * Native wrapper for {@link CIQ.ChartEngine#loadChart}.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * Unlike {@link CIQ.ChartEngine#loadChart}, this function only accepts a symbol and data. If you need more functionality you to manually call the library implementation of loadChart.
 *
 * If a push method is supplying data to callNewChart you will need to make use of the chartIQView.isChartAvailable()
 * method for your initial data push. The pseudocode in the example gives one instance on how to use the flag.
 * @param {string} symbol The new symbol for your chart
 * @param {array} data Static data in an array to load the chart with
 * @memberof CIQ.MobileBridge
 * @example
 * if(chartIQView.isChartAvailable() {
 * 	pushData = retrievePushData()
 * 	chartIQView.push(pushData)
 * } else{ repeat check via polling for the isChartAvailable flag }
 */
CIQ.MobileBridge.loadChart = function (symbol, data) {
	if (!symbol) symbol = stxx.chart.symbol;
	var loader = document.querySelector("cq-loader");
	if (loader) loader.show();
	var cb = function () {
		if (loader) loader.hide();
		if (!this.isAndroid)
			webkit.messageHandlers.newSymbolCallbackHandler.postMessage(symbol);
	};
	stxx.loadChart(symbol, { masterData: data }, cb);
};
/**
 * Native wrapper for {@link CIQ.ChartEngine#setChartType}.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 *  Will remove any aggregation type and switch your chart to display the new chartType.
 *
 * Valid chartTypes include: Candle, Bar, Colored Bar, Line, Hollow Candle, Mountain and Baseline.
 *
 * This function should not be used for setting Aggregations. Instead use setAggregationType
 * @see {@tutorial Chart Styles and Types}
 * @param {string} chartType Type of chart to display
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.setChartType = function (chartType) {
	stxx.setChartType(chartType);
};
/**
 * Native wrapper for {@link CIQ.ChartEngine#setAggregationType}.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * Valid aggregation types include: Heikin Ashi, Kagi, Renko, Range Bars, Point & Figure.
 *
 * This function should not be used to set chartTypes. Instead use setChartType
 * @see {@tutorial Chart Styles and Types}
 * @param {string} aggregationType Type of chart to display
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.setAggregationType = function (aggregationType) {
	stxx.setAggregationType(aggregationType);
};
/**
 * Returns the chart's main symbol.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * @return {string} symbol
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.getSymbol = function () {
	return stxx.chart.symbol;
};
/**
 * Will toggle the crosshairs on or off.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * @param boolean
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.enableCrosshairs = function (active) {
	stxx.layout.crosshair = active;
	stxx.doDisplayCrosshairs();
	stxx.changeOccurred("layout");
};
/**
 * Will return currentVectorParameters of the engine instance.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * @return {CIQ.ChartEngine#currentVectorParameters}
 * @see {@link CIQ.ChartEngine.currentVectorParameters} for documentation of parameters
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.getCurrentVectorParameters = function () {
	return stxx.currentVectorParameters;
};
/**
 * Used to set currentVectorParameters of the engine instance and any values for it.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 * @param parameter
 * @param value
 * @see {@link CIQ.ChartEngine.currentVectorParameters} for documentation of parameters
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.setCurrentVectorParameters = function (parameter, value) {
	stxx.currentVectorParameters[parameter] = value;
};
/**
 * Native wrapper for {@link CIQ.ChartEngine#addSeries}.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * Can set a Series as a comparison and specify line color.
 * @param {string} symbol Symbol to set
 * @param {string} hexColor Color for your symbol to be displayed as
 * @param {boolean} isComparison Boolean telling the chart whether the symbol should be compared to the main symbol
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.addSeries = function (symbol, hexColor, isComparison) {
	var parameters = {
		color: hexColor,
		isComparison: isComparison
	};
	stxx.addSeries(symbol, parameters);
};
/**
 * Native wrapper for {@link CIQ.ChartEngine#removeSeries}.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * Removes a selected symbol from the chart's series
 * @param {string} symbol Symbol to remove OR the series ojbect itself
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.removeSeries = function (symbol) {
	stxx.removeSeries(symbol);
};
/**
 * Sets the chart theme between 'day' or 'night' or none by adding in CSS classes to the chart's context.
 * Also clears the chart containers backgroundColor and resets the engines styles.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * Adding one class will remove the other, to remove both set the theme to none
 * @param {String}  theme Theme to set either 'day', 'night' or none
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.setTheme = function (theme) {
	var classList = document.querySelector("cq-context").classList;
	var nightCss = this.nightCss;
	var dayCss = this.dayCss;
	if (theme.toLowerCase() === "day") {
		classList.remove(nightCss);
		classList.add(dayCss);
	} else if (theme.toLowerCase() === "night") {
		classList.remove(dayCss);
		classList.add(nightCss);
	} else if (theme.toLowerCase() === "none") {
		classList.remove(nightCss);
		classList.remove(dayCss);
	} else {
		return;
	}
	stxx.chart.container.style.backgroundColor = "";
	stxx.styles = {};
	stxx.draw();
};
/**
 * Turns the extendedHours functionality on/off
 * @param status Boolean true for on, false for off
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.toggleExtendedHours = function (status) {
	stxx.extendedHours.set(status);
};
/**
 * Gets the translated list for a given language.
 * @param {String} langCode The I18N language code that is to be retrieved. If no language code is given all translations are returned.
 * @returns JSON string of the translations
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.getTranslations = function (langCode) {
	if (langCode) {
		return JSON.stringify(CIQ.I18N.wordLists[langCode]);
	}
	return JSON.stringify(CIQ.I18N.wordLists);
};
/**
 * Set the language for the chart
 * @param {String} langCode The I18N language code
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.setLanguage = function (langCode) {
	stxx.preferences.language = langCode;
	stxx.changeOccurred("preferences");
	CIQ.I18N.localize(stxx, langCode);
	stxx.draw();
};
///////////////////////////
/*** Drawing functions ***/
///////////////////////////
/**
 * Helper function to restore the drawing tool to its default settings.
 * @param {String} toolName Name of the drawing tool
 * @param {Boolean} all set to true if you want to restore all drawings configs
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.restoreDefaultDrawingConfig = function (toolName, all) {
	CIQ.Drawing.restoreDefaultConfig(stxx, toolName, all);
};
/**
 * Helper function to retrieve the drawing parameters for the given tool
 * @param {String} toolName Name of the drawing tool
 * @returns {String} JSON string of the current drawing parameters
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.getDrawingParameters = function (toolName) {
	var toolParameters = CIQ.clone(
		CIQ.Drawing.getDrawingParameters(stxx, toolName)
	);
	if (toolParameters.waveParameters) {
		toolParameters.waveParameters.corrective = toolParameters.waveParameters.corrective.join(
			" "
		);
		toolParameters.waveParameters.impulse = toolParameters.waveParameters.impulse.join(
			" "
		);
	}
	return JSON.stringify(toolParameters);
};
/**
 * Wrapper to set vector parameters according to what is selected on the client side
 * @param {String} parameterName Name of the drawing field to change
 * @param {String} value The value of the field to change
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.setDrawingParameters = function (parameterName, value) {
	if (parameterName == "color") parameterName = "currentColor";
	stxx.currentVectorParameters[parameterName] = value;
};
/**
 * Helper function to find the current highlighted drawing and delete it
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.deleteDrawing = function () {
	let drawingObjects = stxx.drawingObjects;
	for (let i = 0; i < drawingObjects.length; i++) {
		const drawing = drawingObjects[i];
		if (drawing.highlighted) {
			if (drawing.permanent) continue;
			const before = stxx.exportDrawings();
			stxx.removeDrawing(drawing);
			stxx.undoStamp(before, stxx.exportDrawings());
			break;
		}
	}
};
/**
 * Helper function to find the current highlighted drawing and clone it
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.cloneDrawing = function () {
	let drawingObjects = stxx.drawingObjects;
	for (let i = 0; i < drawingObjects.length; i++) {
		const drawing = drawingObjects[i];
		if (drawing.highlighted) {
			const clone = new CIQ.Drawing[drawing.name]();
			let dehydrate = drawing.serialize();
			clone.reconstruct(stxx, dehydrate);
			clone.repositioner = drawing.repositioner;
			clone.highlighted = true;
			drawing.highlighted = false;
			stxx.addDrawing(clone);
			stxx.activateRepositioning(clone);
			break;
		}
	}
};
/**
 * Helper function to find the current highlighted drawing and change the layer of the drawing
 * @param {String} layer The layer to assign to the drawing (top, bottom, up, down)
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.layerDrawing = function (layer) {
	let drawingObjects = stxx.drawingObjects;
	for (let i = 0; i < drawingObjects.length; i++) {
		const drawing = drawingObjects[i];
		if (drawing.highlighted) {
			let lastIndex = drawingObjects.length - 1;
			let removeIndex = i;
			let insertIndex = NaN;
			if (removeIndex === -1) return;
			switch (layer) {
				case "up":
					if (removeIndex < lastIndex) {
						insertIndex = removeIndex + 1;
					}
					break;
				case "down":
					if (removeIndex > 0) {
						insertIndex = removeIndex - 1;
					}
					break;
				case "top":
					if (removeIndex < lastIndex) {
						insertIndex = lastIndex;
					}
					break;
				case "bottom":
					if (removeIndex > 0) {
						insertIndex = 0;
					}
					break;
			}
			if (isNaN(insertIndex)) return; // NaN check
			let before = stxx.exportDrawings();
			stxx.drawingObjects.splice(removeIndex, 1);
			stxx.drawingObjects.splice(insertIndex, 0, drawing);
			stxx.undoStamp(before, stxx.exportDrawings());
			stxx.draw();
			stxx.changeOccurred("vector");
			break;
		}
	}
};
/**
 * Helper function that determines whether there are any drawings on the undostack
 * @returns {String} JSON string of true/false to determine whether there is any drawings to undo
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.undo = function () {
	this.undoObject.undo();
	let moreUndo = this.undoObject.undostack.length > 0;
	return JSON.stringify(moreUndo);
};
/**
 * Helper function that determines whether there are any drawings on the redostack
 * @returns {String} JSON string of true/false to determine whether there is any drawings to redo
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.redo = function () {
	this.undoObject.redo();
	let moreRedo = this.undoObject.redostack.length > 0;
	return JSON.stringify(moreRedo);
};
//////////////////////////
/*** Study functions ***/
/////////////////////////
/**
 * Native wrapper for {@link CIQ.Studies.addStudy}.
 *
 * Adds a specific study to the chart.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * @param {String} studyName Study to add from the {@link CIQ.Studies.studyLibrary}
 * @param {Object} [inputs] Object containing custom inputs for instantiating the study
 * @param {Object} [outputs] Object containing custom outputs for instantiating the study
 * @param {Object} [parameters] Object containing custom parameters if supported/required by the study
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.addStudy = function (studyName, inputs, outputs, parameters) {
	CIQ.Studies.addStudy(stxx, studyName, inputs, outputs, parameters);
};
/**
 * Removes an active study in the chart engine's layout from the chart.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * @param {String} studyName The name of the study as it appears in the chart engines layout
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.removeStudy = function (studyName) {
	var studyList = stxx.layout.studies;
	for (var study in studyList) {
		var sd = studyList[study];
		if (sd.name === studyName) {
			if (CIQ.Studies) CIQ.Studies.removeStudy(stxx, sd);
		}
	}
};
/**
 * Convenience function to remove all studies on the chart at once.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.removeAllStudies = function () {
	var studyList = stxx.layout.studies;
	for (var study in studyList) {
		var sd = studyList[study];
		if (CIQ.Studies) CIQ.Studies.removeStudy(stxx, sd);
	}
};
/**
 * Returns an array of all the studies in the {@link CIQ.Studies.studyLibrary} with a shortName derived from the key.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * Used for gathering all available studies a user can access
 * @return {Array} Array of studies with shortName of study
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.getStudyList = function () {
	var result = [];
	/*
	 * If an array is part of the study inputs then Android and iOS just transforms the object to a string when the JSON transform happens.
	 * That "array" string is then passed back to the library when the study is added and the app breaks.
	 * By default just make sure the first option in the array is chosen and sent to the client side.
	 * This will not affect the study options selection inputs as that is being handled by getStudyParameters.
	 */
	function changeInputArray(inputs) {
		for (var input in inputs) {
			var values = inputs[input];
			if (Array.isArray(values) && values.length > 0) {
				inputs[input] = inputs[input][0];
			}
		}
		return inputs;
	}
	for (var key in CIQ.Studies.studyLibrary) {
		CIQ.Studies.studyLibrary[key].shortName = key;
		var study = CIQ.clone(CIQ.Studies.studyLibrary[key]);
		if (study.inputs) study.inputs = changeInputArray(study.inputs);
		result.push(study);
	}
	return result;
};
/**
 * Returns the active studies in the chart engine's layout.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * *Note:* For Android devices this will return a raw, unstringified, array of studies
 * @return {String} The JSON stringified list of studies
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.getActiveStudies = function () {
	var results = [];
	// we don't need the whole study object. Just the name, type, and study options
	// if you pass the whole study stringified back to Java don't be surprised if there are issues
	for (var key in stxx.layout.studies) {
		var trimObject = {};
		var study = stxx.layout.studies[key];
		trimObject.shortName = key;
		trimObject.name = study.name;
		trimObject.type = study.type;
		trimObject.inputs = study.inputs;
		trimObject.outputs = study.outputs;
		trimObject.parameters = study.parameters;
		results.push(trimObject);
	}
	if (this.isAndroid) {
		return results;
	}
	// iOS has issue with circular references in javascript objects, we must avoid those references.
	function isUnique(arr) {
		return function (key, value) {
			if (typeof value === "object" && value !== null) {
				if (arr.indexOf(value) !== -1) {
					// Circular reference found, discard key
					return;
				}
				// Store value in our collection
				arr.push(value);
			}
			return value;
		};
	}
	var list = [];
	var seen1 = [];
	var seen2 = [];
	var seen3 = [];
	for (var n in results) {
		var sd = results[n];
		var inputs = JSON.stringify(sd.inputs, isUnique(seen1));
		var outputs = JSON.stringify(sd.outputs, isUnique(seen2));
		var parameters = JSON.stringify(sd.parameters, isUnique(seen3));
		list.push(
			sd.name +
				"___" +
				sd.type +
				"___" +
				inputs +
				"___" +
				outputs +
				"___" +
				parameters
		);
	}
	var joinedList = list.join("|||");
	return joinedList;
};
/**
 * Given an active study name this will update the study based on key value pair you pass in to a {@link CIQ.Studies.DialogHelper}.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * If the given key is not found in the DialogHelpers inputs then the key will be searched for in DialogHelper.outputs and try to update them instead
 *
 * @param {String} name Name of the study from the chart engine's layout
 * @param {String} key Key to set in the studies corresponding DialogHelper
 * @param {String} value Value to set in the studies corresponding DialogHelper
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.setStudy = function (name, key, value) {
	var s = stxx.layout.studies;
	var selectedSd = {};
	for (var n in s) {
		var sd = s[n];
		if (sd.name === name) {
			selectedSd = sd;
		}
	}
	var helper = new CIQ.Studies.DialogHelper({ sd: selectedSd, stx: stxx });
	var isFound = false;
	var newInputParameters = {};
	var newOutputParameters = {};
	for (var x in helper.inputs) {
		var input = helper.inputs[x];
		if (input.name === key) {
			isFound = true;
			if (input.type === "text" || input.type === "select") {
				newInputParameters[key] = value;
			} else if (input.type === "number") {
				newInputParameters[key] = parseInt(value);
			} else if (input.type === "checkbox") {
				newInputParameters[key] = value == "false" ? false : true;
			}
		}
	}
	if (isFound === false) {
		for (x in helper.outputs) {
			var output = helper.outputs[x];
			if (output.name === key) {
				newOutputParameters[key] = value;
			}
		}
	}
	isFound = false;
	helper.updateStudy({
		inputs: newInputParameters,
		outputs: newOutputParameters
	});
};
/**
 * Will return the default parameters of a study if it is not active, or actual parameters for an active study.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * *Note:* For Android devices this will return the raw unstringified parameters
 * @param {string} studyName Study to get parameters for
 * @param {string} prop What to return for the study.  Valid values: "inputs", "outputs", "parameters".  Default is "outputs".
 * @returns {String} JSON stringified parameters from the DialogHelper
 * @memberof CIQ.MobileBridge
 * @since 6.1.0 second argument changed from boolean isInputs to string prop.  If prop==true, will return inputs, as before.
 */
CIQ.MobileBridge.getStudyParameters = function (studyName, prop) {
	var params = { stx: stxx };
	if (stxx.layout.studies && stxx.layout.studies[studyName])
		params.sd = stxx.layout.studies[studyName];
	else params.name = studyName;
	var helper = new CIQ.Studies.DialogHelper(params);
	var parameters;
	switch (prop) {
		case "inputs":
		case true:
			parameters = helper.inputs;
			break;
		case "parameters":
			parameters = helper.parameters;
			break;
		default:
			parameters = helper.outputs;
	}
	if (this.isAndroid) {
		return parameters;
	}
	return JSON.stringify(parameters);
};
/**
 * Given an active study name this will update the study based on key value pair you pass in to a {@link CIQ.Studies.DialogHelper}.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * By default this will assume that key belongs to DialogHelper.outputs unless `isInput` is `true`
 *
 * @param {String} studyName  Name of the study from the chart engine's layout
 * @param {String} key Key to set in the studies corresponding DialogHelper
 * @param {String} value Value to set in the studies corresponding DialogHelper
 * @param {Boolean} isInput Boolean telling to update input instead of outputs
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.setStudyParameter = function (studyName, key, value, isInput) {
	var helper = new CIQ.Studies.DialogHelper({
		sd: stxx.layout.studies[studyName],
		stx: stxx
	});
	if (isInput) {
		helper.updateStudy({
			inputs: {
				key: value
			},
			outputs: {}
		});
	} else {
		helper.updateStudy({
			inputs: {},
			outputs: {
				key: value
			}
		});
	}
};
////////////////////////////////
/*** Chart Event Listeners ***/
//////////////////////////////
/**
 * Sets a callbackListener with a type of drawing.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * For more info on adding event callbacks to the chart see {@link CIQ.ChartEngine#addEventListener}.
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.addDrawingListener = function () {
	stxx.addEventListener("drawing", function (drawingObject) {
		var s = drawingObject.drawings;
		var drawings = [];
		for (var n in s) {
			var drawing = s[n];
			drawings.push(drawing.serialize());
		}
		var stringifiedDrawings = JSON.stringify(drawings);
		if (this.isAndroid) {
			QuoteFeed.drawingChange(stringifiedDrawings);
		} else {
			webkit.messageHandlers.drawingHandler.postMessage(stringifiedDrawings);
		}
	});
};
/**
 * Sets a callbackListener to send the mMeasure text to the mobile client side for ease of display.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * For more info on adding event callbacks to the chart see {@link CIQ.ChartEngine#addEventListener}.
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.addMeasureListener = function () {
	document.addEventListener("touchend", function () {
		let m = document.querySelector(".mMeasure");
		m.innerText = "";
		let measureText = JSON.stringify(m.innerText);
		if (this.isAndroid) {
			// tbd
		} else {
			webkit.messageHandlers.measureHandler.postMessage(measureText);
		}
	});
	stxx.addEventListener("move", function () {
		let m = document.querySelector(".mMeasure");
		if (m.innerText.length <= 0) return;
		let measureText = JSON.stringify(m.innerText);
		if (this.isAndroid) {
			// tbd
		} else {
			webkit.messageHandlers.measureHandler.postMessage(measureText);
		}
	});
};
/**
 * Sets a callbackListener with a type of layout.
 *
 * Designed to be used with mobile sample interfaces. See {@tutorial Getting Started on Mobile} for more details.
 *
 * For more info on adding event callbacks to the chart see {@link CIQ.ChartEngine#addEventListener}.
 * @memberof CIQ.MobileBridge
 */
CIQ.MobileBridge.addLayoutListener = function () {
	stxx.addEventListener("layout", function (layoutObject) {
		// Guard against trying to serialize circular objects and filter out duplicates
		var seen = [];
		function replacer(key, val) {
			if (val !== null && typeof val == "object") {
				if (seen.indexOf(val) >= 0) {
					return;
				}
				seen.push(val);
			}
			return val;
		}
		var stringifiedLayout = JSON.stringify(layoutObject.layout, replacer);
		if (this.isAndroid) {
			QuoteFeed.layoutChange(stringifiedLayout);
		} else {
			webkit.messageHandlers.layoutHandler.postMessage(stringifiedLayout);
		}
	});
};
export { CIQ };
