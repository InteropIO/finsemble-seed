/**
 *	8.3.99
 *	Generation date: 2021-05-21T20:54:02.745Z
 *	Client name: finsemble
 *	Package Type: Technical Analysis
 *	License type: annual
 *	Expiration date: "2022/07/20"
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

/**
 * A query string helper class.
 *
 * @private
 */
const qs = {
	/**
	 * Convert the given object into a query string.
	 *
	 * @param {Object} obj	a flat object containing the keys and values of the query
	 * @param {string} [sep='&']	query string separator
	 * @param {string} [eq='=']	query string key, value separator
	 * @return {string} uri safe query string
	 */
	stringify: function (obj, sep, eq) {
		if (!obj) return "";

		sep = sep || "&";
		eq = eq || "=";

		return Object.keys(obj)
			.map(function (k) {
				if (Array.isArray(obj[k])) {
					return obj[k]
						.map(function (v) {
							return [k, typeof v === "object" ? "" : v]
								.map(window.encodeURIComponent)
								.join(eq);
						})
						.join(sep);
				}

				return [k, typeof obj[k] === "object" ? "" : obj[k]]
					.map(window.encodeURIComponent)
					.join(eq);
			})
			.join(sep);
	},

	/**
	 * Convert the given query string into an object.
	 *
	 * @param {string} str	a uri encoded query
	 * @param {string} [sep='&']	the query string separator
	 * @param {string} [eq='=']	query string key, value separator
	 * @return {Object} a decoded query object, all values are strings
	 */
	parse: function (str, sep, eq) {
		if (!str) return {};

		sep = sep || "&";
		eq = eq || "=";

		return str.split(sep).reduce(function (memo, part) {
			let kv = part
					.replace(/\+/g, "%20")
					.split(eq)
					.map(window.decodeURIComponent),
				key = kv[0],
				value = kv[1] || "";

			// Array.concat does not care if `memo[key]` is a String or Array
			memo[key] = key in memo ? [].concat(memo[key], value) : value;

			return memo;
		}, {});
	}
};

/**
 * Wrapper for CIQ.postAJax to request and handle JSON responses.
 *
 * @param {DOMString} url the entire URL for the request
 * @param {Object} query a flat object that is stringify'd into a query string
 * @param {function} cb to be called when response is returned
 *
 * @private
 */
function requestJSON(url, query, cb) {
	CIQ.postAjax({
		url: url + "?" + qs.stringify(query),
		cb: function (status, response) {
			if (status !== 200) return cb(response.message);
			let json = JSON.parse(response);
			let hasErrors = json.hasOwnProperty("errors");
			if (hasErrors) {
				cb("Error: Something went wrong");
			} else {
				cb(json);
			}
		}
	});
}

/**
 * Helper function to make sure requested language maps to the lexicon file.
 *
 * @param {string} language The requested language ID.
 * @return {string} The converted language ID.
 *
 * @private
 */
function getRestApiLanguage(language) {
	if (language == "cs") {
		return "zh-hans";
	} else if (language == "ct") {
		return "zh-hant";
	} else if (language == "ff") {
		return "fr-fr";
	}
	return language;
}

/**
 * Helper function: skip certain event types for some time frames.
 *
 * @param {string} interval
 * @param {string} pricePeriod
 * @param {string} eventTypeId
 * @return {boolean}
 *
 * @private
 */
function skipEvent(interval, pricePeriod, eventTypeId) {
	if (eventTypeId.match(/wave/)) return true; // skip elliott waves

	// Daily Chart
	if (interval === "day") {
		if (
			pricePeriod !== "day" ||
			eventTypeId.match(/intermediatekst/) ||
			eventTypeId.match(/longkst/)
		) {
			return true;
		}
		// Weekly chart
	} else if (interval === "week") {
		if (pricePeriod !== "week" && !eventTypeId.match(/intermediatekst/)) {
			return true;
		}
	}

	return false;
}

/**
 * Helper function: get the Y coordinate for an event
 *
 * @param {Object} event
 * @param {Map} bullishEvents
 * @param {Map} bearishEvents
 * @param {CIQ.ChartEngine} stx
 * @return {number}
 *
 * @private
 */
function getYPixelForEvent(event, bullishEvents, bearishEvents, stx) {
	let y0 = 0;
	// high/low not available in events API, only close price.
	// Set the high/low to close as starting point then look in chart
	// pricing data for the date and actual high/low for event date.
	let high = event.endPrices.close;
	let low = event.endPrices.close;

	// get the chart pricing data
	let priceData = stx.masterData;
	let eventDate = event.dates.eventEnd;
	eventDate = eventDate.replace(/[-T:]/g, "");

	for (let i = priceData.length - 1; i >= 0; --i) {
		let priceDate = CIQ.yyyymmddhhmmssmmm(priceData[i].DT).substring(0, 14);
		if (priceDate === eventDate) {
			// found the date, get values and break
			high = priceData[i].High;
			low = priceData[i].Low;
			break;
		}
		if (priceDate < eventDate) {
			// didn't find date, don't search more (optimization)
			break;
		}
	}

	let eventLowPrice = low;
	let eventHighPrice = high;
	let eventDateString = event.dates.eventEnd;

	if (event.eventType.tradeType === "long") {
		let bullishCountForDate = 1;
		if (bullishEvents.has(eventDateString)) {
			bullishCountForDate = bullishEvents.get(eventDateString);
			bullishCountForDate++;
		}
		bullishEvents.set(eventDateString, bullishCountForDate);
		y0 = stx.pixelFromPrice(eventHighPrice) - 20 * bullishCountForDate;
	} else if (
		event.eventType.tradeType === "short" ||
		event.eventType.tradeType === "undefined"
	) {
		let bearishCountForDate = 1;
		if (bearishEvents.has(eventDateString)) {
			bearishCountForDate = bearishEvents.get(eventDateString);
			bearishCountForDate++;
		}
		bearishEvents.set(eventDateString, bearishCountForDate);
		y0 = stx.pixelFromPrice(eventLowPrice) + 20 * bearishCountForDate;
	}

	return y0;
}

/**
 * Controller class to assist in the creation and processing of TechnicalInsights API requests.
 *
 * @param {CIQ.ChartEngine} stx	A chart instance to modify
 * @param {string} auth	A valid TechnicalInsights authentication token
 * @param {string} lang Language identifier, eg "en". Must match an option in lexicon.json
 */
CIQ.TechnicalInsights = function (stx, auth, lang) {
	if (!auth)
		throw new Error(
			"CIQ.TechnicalInsights: No Authorization token (auth) provided"
		);

	this.stx = stx;
	this.auth = auth;
	this.lang = getRestApiLanguage(lang);
	this.showEducation = true;

	// initially set to null.
	this.iid = null;

	// Display lines and labels of the analysis on the primary chart.
	this.panel = stx.chart.panel;

	// Events to show
	this.activeEvents = {};

	// Study descriptor handles.
	this.rsi = null;
	this.bollingerBands = null;
	this.interval = stx.layout.interval;

	// Colors used for displaying the lines and labels of the analysis.
	this.colors = {
		resistance: "#30aa0b",
		pivot: "#4169e1",
		support: "#ff2f22"
	};

	// set the component interval to the chart interval

	// List of the draw injections being used for event markup.
	this.eventDotsInjection = null;
	this.eventMarkupInjections = new Map();
	this.eventMarkupDrawInjections = new Map();
	this.drawnStudies = new Map();
	// track event hover and support/resistance hover labels
	this.drawnLabels = new Map();
	// track if event has been clicked/drawn so we can highlight event dot
	this.drawnEvents = new Map();
	// track the number of times a study has been invoked (can be multiple e.g. sma 50)
	this.studyInstances = new Map();

	// mouse related injections
	this.mouseMoveInjections = new Map();
	this.mouseDownInjections = new Map();
};

/**
 * Adds symbol change and layout listeners to the chart, which will allow the plugin to respond
 * and load new events as appropriate. This method should be called after initializing the plugin.
 */
CIQ.TechnicalInsights.prototype.addListeners = function () {
	const controller = this;
	const { stx, symbolChangeListener, layoutListener } = this;
	if (symbolChangeListener || layoutListener) return;

	// add a listener to check for symbol change
	this.symbolChangeListener = stx.addEventListener("symbolChange", () => {
		controller.getActiveEvents();
	});

	// detect the change of Chart Period and Reload Events
	this.layoutListener = stx.addEventListener("layout", () => {
		const { interval } = stx.layout;

		if (interval !== controller.interval) {
			controller.interval = interval;
			controller.getActiveEvents();
		}
	});
};

/**
 * Removes symbol changes and layout listeners from the chart. This method should be called after
 * disabling the plugin.
 */
CIQ.TechnicalInsights.prototype.removeListeners = function () {
	const { stx, symbolChangeListener, layoutListener } = this;

	stx.removeEventListener(symbolChangeListener);
	stx.removeEventListener(layoutListener);

	this.symbolChangeListener = null;
	this.layoutListener = null;
};

/**
 * Executes the relevant logic when the user hovers over an event
 *
 * @param {Object} params
 * @param {string} params.eventLabel
 * @param {string} params.eventid
 * @param {number} params.eventTypeCode
 * @param {Date} params.date
 * @param {number} params.price
 */
CIQ.TechnicalInsights.prototype.eventHoverBegin = function ({
	eventLabel,
	eventid,
	eventTypeCode,
	date,
	price
}) {
	const { stx } = this;
	const controller = this;
	const hoverId = "cq-technicalinsights-label-" + eventid;
	const educationId = "cq-technicalinsights-education-" + eventid;

	if (!this.drawnLabels.has(hoverId)) {
		this.drawnLabels.set(hoverId);

		const hoverNode = document.createElement(
			"cq-technicalinsights-event-hover-element"
		);
		hoverNode.innerHTML = "&nbsp;" + eventLabel;

		new CIQ.Marker({
			stx: stx,
			node: hoverNode,
			x: date,
			y: price,
			yPositioner: "value",
			xPositioner: "date",
			label: hoverId
		});

		stx.draw();
		this.drawnLabels.set(hoverId);
	}

	if (this.showEducation) {
		if (!this.drawnLabels.has(educationId)) {
			this.drawnLabels.set(educationId);

			const educationNode = document.createElement(
				"cq-technicalinsights-education"
			);
			educationNode.innerHTML =
				"<cq-technicalinsights-education-title>" +
				eventLabel +
				"</cq-technicalinsights-education-title>";

			let url =
				"https://global.tradingcentral.com/education/events/" +
				this.lang +
				"/short/event-" +
				eventTypeCode +
				".html";

			CIQ.postAjax({
				url,
				cb: function (status, response) {
					if (status !== 200) throw new Error(response);

					educationNode.innerHTML +=
						response +
						"<cq-technicalinsights-education-source>Source: Technical Insights</cq-technicalinsights-education-source>";

					new CIQ.Marker({
						stx: stx,
						node: educationNode,
						x: 10,
						xPositioner: "bar",
						label: educationId
					});

					controller.drawnLabels.set(educationId);
					stx.draw();
				}
			});
		}
	}
};

/**
 * Executes the relevant logic for when the user stops hovering over an event
 */
CIQ.TechnicalInsights.prototype.eventHoverEnd = function () {
	const controller = this;
	const { stx } = this;
	// remove ALL 'event Markers' that exist (event & education)
	if (this.drawnLabels.size > 0) {
		this.drawnLabels.forEach(function (mapdata, mapkey, mapObj) {
			let markerId = mapkey;
			// don't touch the support/resistance markers
			if (markerId != "support" && markerId != "resistance") {
				controller.drawnLabels.delete(markerId);
				CIQ.Marker.removeByLabel(stx, markerId);
			}
		});
	}
};

/**
 * Executes the relevant logic when the user hovers over a support or resistance line
 *
 * @param {Object} params
 * @param {string} params.srtype "support" or "resistance"
 * @param {number} params.markerprice The price for where to intersect the price on the y-axis
 * @param {string} params.term The number of bars used
 * @param {number} params.price
 */
CIQ.TechnicalInsights.prototype.supportAndResistanceHoverBegin = function ({
	srtype,
	markerprice,
	term,
	price
}) {
	const { stx } = this;
	const { bar } = this.lexicon;
	const supportresistance = this.lexicon[srtype];

	let node;
	if (srtype == "support") {
		node = document.createElement("cq-technicalinsights-support-hover-element");
	} else {
		node = document.createElement(
			"cq-technicalinsights-resistance-hover-element"
		);
	}

	node.innerHTML = `${term} ${bar} ${supportresistance} (${price})`;

	// if label not already drawn on chart, add it and track it
	if (!this.drawnLabels.has(srtype)) {
		new CIQ.Marker({
			stx: stx,
			node: node,
			y: markerprice,
			yPositioner: "value",
			xPositioner: "none",
			label: srtype
		});

		stx.draw();

		// keep track of labels drawn to avoid multiple draws
		this.drawnLabels.set(srtype);
	}
};

/**
 * Executes the relevant logic when the user stops hovering over a support or resistance line
 *
 * @param {Object} params
 * @param {string} params.srtype "support" or "resistance"
 */
CIQ.TechnicalInsights.prototype.supportAndResistanceHoverEnd = function ({
	srType
}) {
	const { stx } = this;

	CIQ.Marker.removeByLabel(stx, srType);
	if (this.drawnLabels.has(srType)) {
		this.drawnLabels.delete(srType);
	}
};

/**
 * Handles when a user clicks on an event
 *
 * @param {Object} params
 * @param {Object} params.eventobj
 */
CIQ.TechnicalInsights.prototype.eventClick = function ({ eventobj }) {
	const { stx } = this;
	const { eventId } = eventobj;

	if (this.drawnEvents.has(eventId)) {
		// remove the event from the tracking Map
		this.drawnEvents.delete(eventId);
		// remove pattern lines & target regions
		this.removeMarkupForEvent(eventobj);
	} else {
		// track event draw in Map
		this.drawEventMarkup(eventobj);
		this.drawnEvents.set(eventId, 1);
	}

	stx.draw();
};

/**
 * Creates an injection on the draw loop that renders TechnicalInsights events to the chart.
 *
 * @param {array} events Array of events to be retrieved from the TechnicalInsights API
 */
CIQ.TechnicalInsights.prototype.drawActiveEventLabels = function (events) {
	if (!events || this.eventDotsInjection) return;

	const controller = this;
	const { stx } = this;

	this.eventDotsInjection = stx.append("draw", function () {
		let xmouse = this.cx;
		let ymouse = this.cy;
		let bullishEvents = new Map();
		let bearishEvents = new Map();

		for (let i = 0; i < events.length; i++) {
			const event = events[i];
			const { eventId, pricePeriod, eventType } = event;
			const { eventTypeId, eventClass } = eventType;
			const { interval } = stx.layout;

			// certain events/time frame combinations not displayed
			if (skipEvent(interval, pricePeriod, eventTypeId)) continue;
			// Skip if event class not selected
			if (!controller.activeEvents[eventClass]) continue;

			const eventTradeType = event.eventType.tradeType;
			const eventDateString = event.dates.eventEnd;
			const eventDate = CIQ.strToDateTime(eventDateString);
			const labelStartDate = new Date(eventDate.getTime());

			// make date CIQ style and then change to pixel coordinate
			let x0 = CIQ.yyyymmddhhmmssmmm(labelStartDate);
			x0 = stx.pixelFromDate(x0, stx.chart) - 5;
			let y0 = getYPixelForEvent(event, bullishEvents, bearishEvents, stx);

			// don't draw/activate any events that may be outside chart y/x boundaries
			if (y0 + 5 > this.chart.bottom || x0 + 5 > this.chart.right) continue;

			let whiteColor = this.backgroundColor;
			let bullishColor = "#00CC00";
			let bearishColor = "#CC0000";
			let otherColor = this.defaultColor === "#000000" ? "#333333" : "#DDDDDD";

			// if event is being hovered, use hover color (note: match hover math with addEventLabelMouseInjections)
			if (
				(eventTradeType !== "long" &&
					ymouse > y0 - 2 &&
					ymouse < y0 + 10 &&
					xmouse > x0 - 5 &&
					xmouse < x0 + 10 + 5) ||
				(eventTradeType === "long" &&
					ymouse > y0 - 10 &&
					ymouse < y0 + 2 &&
					xmouse > x0 - 5 &&
					xmouse < x0 + 10 + 5)
			) {
				// to retain altered hover color on click--do this
				//|| stx.drawnEvents.has(event.id) ){
				bullishColor = "#00EE00";
				bearishColor = "#EE0000";
				otherColor = this.defaultColor;
			}

			// Actually draw the Event 'icon' on the chart.
			const { context } = stx.chart;
			if (eventTradeType === "long") {
				// extra markup for classic icons to differentiate them
				if (eventClass === "classic" && !controller.drawnEvents.has(eventId)) {
					// draw bigger green square
					context.fillStyle = bullishColor;
					let radius = 8;
					context.beginPath();
					context.arc(x0 + 6, y0, radius, 0, 2 * Math.PI, false);
					context.lineWidth = 2;
					context.fill();
					context.closePath();
					// add white triangle inside
					context.fillStyle = whiteColor;
					context.beginPath();
					context.moveTo(x0 + 6, y0 - 5);
					context.lineTo(x0 + 11, y0 + 3);
					context.lineTo(x0 + 1, y0 + 3);
					context.lineTo(x0 + 6, y0 - 5);
					context.fill();
					context.closePath();
				} else {
					// draw the Bullish Event Circle
					context.fillStyle = bullishColor;
					let radius = 5.5;
					context.beginPath();
					context.arc(x0 + 6, y0, radius, 0, 2 * Math.PI, false);
					context.lineWidth = 0;
					context.fill();
					context.closePath();
				}

				// if event has been drawn on chart, Highlight the event label
				if (controller.drawnEvents.has(eventId)) {
					let radius = 9.0;
					context.strokeStyle = bullishColor;
					context.beginPath();
					context.arc(x0 + 6, y0, radius, 0, 2 * Math.PI, false);
					context.lineWidth = 2;
					context.stroke();
					context.closePath();
				}
			} else if (eventTradeType === "short") {
				// extra markup for classic icons to differentiate them
				if (eventClass === "classic" && !controller.drawnEvents.has(eventId)) {
					// draw the Bearish Event Rectangle
					context.beginPath();
					context.fillStyle = bearishColor;
					context.fillRect(x0 - 1.2, y0 - 1.2, 14, 14);
					context.closePath();

					// add white triangle inside
					context.fillStyle = whiteColor;
					context.beginPath();
					context.moveTo(x0 + 6, y0 + 10);
					context.lineTo(x0 + 11, y0 + 3);
					context.lineTo(x0 + 1, y0 + 3);
					context.lineTo(x0 + 6, y0 + 10);
					context.fill();
					context.closePath();
				} else {
					// draw the Bearish Event Rectangle
					context.beginPath();
					context.fillStyle = bearishColor;
					context.fillRect(x0, y0, 10, 10);
					context.closePath();
				}
				// if event has been drawn on chart, Highlight the event label
				if (controller.drawnEvents.has(eventId)) {
					// draw the Bearish Event Rectangle
					context.rect(x0 - 3, y0 - 3, 16, 16);
					context.lineWidth = 2;
					context.strokeStyle = bearishColor;
					context.stroke();
				}
			} else if (eventTradeType === "undefined") {
				// draw the Other Events Diamond (Gap Up/Down)
				context.fillStyle = otherColor;
				context.beginPath();
				context.moveTo(x0 + 5, y0);
				context.lineTo(x0, y0 + 5);
				context.lineTo(x0 + 5, y0 + 10);
				context.lineTo(x0 + 10, y0 + 5);
				context.lineTo(x0 + 5, y0);
				context.fill();
				context.closePath();
				// if event has been drawn on chart, Highlight the event label
				if (controller.drawnEvents.has(eventId)) {
					context.lineWidth = 2;
					context.strokeStyle = otherColor;
					context.beginPath();
					context.moveTo(x0 + 5, y0 - 4);
					context.lineTo(x0 - 4, y0 + 5);
					context.lineTo(x0 + 5, y0 + 10 + 4);
					context.lineTo(x0 + 10 + 4, y0 + 5);
					context.lineTo(x0 + 5, y0 - 4);
					context.stroke();
					context.closePath();
				}
			}
		}
	});
};

/**
 * Creates an injection on the draw loop that renders support and resistance lines to the chart.
 *
 * @param {number} support The price value for the support line
 * @param {number} resistance The price value for the resistance line
 * @param {string} term The number of ticks in the support and resistance term
 * @param {string} interval The chart interval
 */
CIQ.TechnicalInsights.prototype.drawSupportAndResistance = function (
	support,
	resistance,
	term,
	interval
) {
	const { stx } = this;
	const { chart } = stx;
	const { context } = chart;
	const label = interval + "-" + term;

	if (this.eventMarkupInjections.has(label)) return; // make sure we don't launch more than once

	const supportResistanceDrawInjection = stx.append("draw", function () {
		const panel = stx.chart.panel;
		const panelLeft = panel.left;
		const panelRight = panel.right;
		const sColor = "#339933";
		const rColor = "#3D9DCD";
		const rLevel = stx.pixelFromPrice(resistance, panel);
		const sLevel = stx.pixelFromPrice(support, panel);
		const startDateBar = Math.max(stx.masterData.length - term, 0);
		const srStartDate = stx.masterData[startDateBar];
		const srEndDate = stx.masterData[stx.masterData.length - 1];
		const srStart = stx.pixelFromDate(srStartDate.Date, chart);
		const srEnd = stx.pixelFromDate(srEndDate.Date, chart);
		let params = {};

		// Draw left dotted support/resistance lines
		params = { pattern: "dotted", lineWidth: "2" };
		stx.plotLine(panelLeft, srStart, rLevel, rLevel, rColor, "segment", context, true, params); // prettier-ignore
		stx.plotLine(panelLeft, srStart, sLevel, sLevel, sColor, "segment", context, true, params); // prettier-ignore

		// Draw solid support/resistance lines
		params = { pattern: "solid", lineWidth: "2" };
		stx.plotLine(srStart, srEnd, rLevel, rLevel, rColor, "segment", context, true, params); // prettier-ignore
		stx.plotLine(srStart, srEnd, sLevel, sLevel, sColor, "segment", context, true, params); // prettier-ignore

		// Draw right dotted support/resistance lines
		params = { pattern: "dotted", lineWidth: "2" };
		stx.plotLine(srEnd, panelRight, rLevel, rLevel, rColor, "segment", context, true, params); // prettier-ignore
		stx.plotLine(srEnd, panelRight, sLevel, sLevel, sColor, "segment", context, true, params); // prettier-ignore
	});

	// store the injection in a Map by eventid key to we can lookup and delete it later.
	this.eventMarkupInjections.set(label, supportResistanceDrawInjection);
};

/**
 * Adds support and resistance mouse injections
 *
 * @param params
 * @param {string|number} interval
 * @param {string} termMap
 * @param {number} supportprice
 * @param {number} resistanceprice
 */
CIQ.TechnicalInsights.prototype.addSupportAndResistanceMouseInjections = function ({
	interval,
	term,
	supportprice,
	resistanceprice
}) {
	const controller = this;
	const { stx } = this;
	const label = "supportresistance-" + interval + "-" + term;

	if (this.mouseMoveInjections.has(label)) return; // don't launch injections more then once.

	const mouseMoveSupportResistance = stx.append("mousemove", function () {
		const panel = stx.chart.panel;
		const resistanceLevelPx = stx.pixelFromPrice(resistanceprice, panel);
		const supportLevelPx = stx.pixelFromPrice(supportprice, panel);
		const ymouse = this.cy;
		const mousePx = 5; // px distance to line for a trigger.

		const markerSupportPrice = stx.priceFromPixel(ymouse + 20);
		const markerResistancePrice = stx.priceFromPixel(ymouse - 20);

		// format the price numbers
		const supportPrice = parseFloat(supportprice).toFixed(2);
		const resistancePrice = parseFloat(resistanceprice).toFixed(2);

		let srParams = {
			srtype: "support",
			price: supportPrice,
			markerprice: markerSupportPrice,
			term: term
		};

		// is user mouse hovering over support line
		if (
			ymouse >= supportLevelPx - mousePx &&
			ymouse <= supportLevelPx + mousePx
		) {
			controller.supportAndResistanceHoverBegin(srParams);
		} else {
			// only send a dispatchEvent if there is a label drawn
			if (controller.drawnLabels.has("support")) {
				controller.supportAndResistanceHoverEnd(srParams);
			}
		}

		srParams = {
			srtype: "resistance",
			price: resistancePrice,
			markerprice: markerResistancePrice,
			term: term
		};

		// is user mouse hovering over resistance line
		if (
			ymouse >= resistanceLevelPx - mousePx &&
			ymouse <= resistanceLevelPx + mousePx
		) {
			controller.supportAndResistanceHoverBegin(srParams);
		} else {
			// only send a dispatchEvent if there is a label drawn
			if (controller.drawnLabels.has("resistance")) {
				controller.supportAndResistanceHoverEnd(srParams);
			}
		}
	});

	this.mouseMoveInjections.set(label, mouseMoveSupportResistance);
};

/**
 * Creates an injection on the mousemove method to create events based on cursor position over event labels.
 *
 * @param {array} events Array of events to be retrieved from the TechnicalInsights API
 */
CIQ.TechnicalInsights.prototype.addEventLabelMouseInjections = function (
	events
) {
	if (!events) return; // if events is not defined, return (no events found for symbol/exchange)

	const mouseMoveLabel = "eventdotmousemove";
	const mouseDownLabel = "eventdotmousedown";
	const controller = this;
	const { stx } = this;

	if (this.mouseMoveInjections.has(mouseMoveLabel)) return;

	const mouseMoveEventDots = stx.append("mousemove", function () {
		stx.draw(); // re-draw the labels so we can change event hover color

		const xmouse = this.cx;
		const ymouse = this.cy;
		const bullishEvents = new Map();
		const bearishEvents = new Map();
		let hoveringOverLabel = 0;

		for (let i = 0; i < events.length; i++) {
			const event = events[i];
			const { eventId, pricePeriod, eventType } = event;
			const { eventTypeId, eventClass, eventTypeCode } = eventType;
			const eventName = eventType.name;
			const { interval } = stx.layout;

			if (skipEvent(interval, pricePeriod, eventTypeId)) continue;
			if (!controller.activeEvents[eventClass]) continue; // Skip if event class not selected

			const eventTradeType = eventType.tradeType;
			const eventDateString = event.dates.eventEnd;
			const eventDate = CIQ.strToDateTime(eventDateString);
			const labelStartDate = new Date(eventDate.getTime());

			// make date CIQ style and then change to pixel coordinate
			let x0 = CIQ.yyyymmddhhmmssmmm(labelStartDate);
			x0 = stx.pixelFromDate(x0, stx.chart) - 5;
			let y0 = getYPixelForEvent(event, bullishEvents, bearishEvents, stx);

			// see if the cursor is over an event. If so trigger.
			if (
				(eventTradeType != "long" &&
					ymouse > y0 - 2 &&
					ymouse < y0 + 10 &&
					xmouse > x0 - 5 &&
					xmouse < x0 + 10 + 5) ||
				(eventTradeType === "long" &&
					ymouse > y0 - 10 &&
					ymouse < y0 + 2 &&
					xmouse > x0 - 5 &&
					xmouse < x0 + 10 + 5)
			) {
				let eventLabel = eventName;
				if (eventClass === "indicator") {
					let smas = new Map();
					let smaPeriod;
					// single moving average cross
					if (eventTypeId.match(/singlemovingaverage/)) {
						smaPeriod = event.additionalTimeseries[0];
						smaPeriod = smaPeriod.replace("sma", "");
						smas.set(smaPeriod);
					} else if (
						eventTypeId.match(/doublemovingaverage/) ||
						eventTypeId.match(/triplemovingaverage/)
					) {
						// Double or Triple moving average: loop through sma periods
						// in the event_specific information.
						for (let i = 0; i < event.additionalTimeseries.length; i++) {
							smaPeriod = event.additionalTimeseries[i];
							smaPeriod = smaPeriod.replace("sma", "");
							smas.set(smaPeriod);
						}
					}
					// add the SMA to the label so we know which SMA cross it is
					/* jshint ignore:start */
					smas.forEach(function (mavginfo, mavg, mapObj) {
						let mavgInfo = " (" + mavg + ")";
						eventLabel = eventLabel.concat(mavgInfo);
					});
					/* jshint ignore:end */
				}

				// Event Label (hover) Position math
				let markerPrice;
				if (eventTradeType === "long") {
					markerPrice = stx.priceFromPixel(y0 - 20);
				} else if (
					eventTradeType === "short" ||
					eventTradeType === "undefined"
				) {
					markerPrice = stx.priceFromPixel(y0 + 40);
				}

				// find the price to draw the event label at. Use mouse y-position converted to price.
				let eventParams = {
					eventid: eventId,
					eventTypeId: eventTypeId,
					eventTypeCode: eventTypeCode,
					date: labelStartDate,
					price: markerPrice,
					eventLabel: eventLabel
				};

				hoveringOverLabel = 1;
				controller.eventHoverBegin(eventParams);
				break;
			}
			// now we have the x0,y0 of the event label. Create event based on position of mouse
		}

		if (!hoveringOverLabel) {
			let eventParams = {};
			controller.eventHoverEnd(eventParams);
		}
	});

	// track the injection for mousing over event dots
	this.mouseMoveInjections.set(mouseMoveLabel, mouseMoveEventDots);

	// make sure we don't launch injection more than once.
	if (this.mouseDownInjections.has(mouseDownLabel)) return;

	const mouseDownEventDots = stx.append("mousedown", function () {
		const xmouse = this.cx;
		const ymouse = this.cy;
		const bullishEvents = new Map();
		const bearishEvents = new Map();
		let clickedOnEvent = null;

		for (let i = 0; i < events.length; i++) {
			const event = events[i];
			const { pricePeriod, eventType } = event;
			const { eventTypeId, eventClass } = eventType;
			const { interval } = stx.layout;

			if (skipEvent(interval, pricePeriod, eventTypeId)) continue;
			if (!controller.activeEvents[eventClass]) continue; // Skip if event class not selected

			const eventDateString = event.dates.eventEnd;
			const eventDate = CIQ.strToDateTime(eventDateString);
			const labelStartDate = new Date(eventDate.getTime());

			// make date CIQ style and then change to pixel coordinate
			let x0 = CIQ.yyyymmddhhmmssmmm(labelStartDate);
			x0 = stx.pixelFromDate(x0, stx.chart) - 5;
			let y0 = getYPixelForEvent(event, bullishEvents, bearishEvents, stx);

			// don't draw/activate any events that may be outside chart y/x boundaries
			if (y0 + 5 > this.chart.bottom || x0 + 5 > this.chart.right) continue;

			// see if the cursor is over an event. If so trigger.
			// (note 5 is bigger clickable area for ease of use)
			if (
				ymouse > y0 - 5 &&
				ymouse < y0 + 10 + 5 &&
				xmouse > x0 - 5 &&
				xmouse < x0 + 10 + 5
			) {
				// event dot was clicked on. Save event and break.
				clickedOnEvent = event;
				break;
			}
			// now we have the x0,y0 of the event label. Create event based on position of mouse
		} //for

		// if an event box was clicked on
		if (clickedOnEvent) {
			let eventParams = {
				eventobj: clickedOnEvent
			};

			controller.eventClick(eventParams);
		}
	});

	// track the injection for clicking on any of the event dots
	this.mouseDownInjections.set(mouseDownLabel, mouseDownEventDots);
};

/**
 * Calls the appropriate draw method based on the event passed in.
 *
 * @param {Object} event Object containing information about a specific event
 */
CIQ.TechnicalInsights.prototype.drawEventMarkup = function (event) {
	const { eventClass } = event.eventType;

	// f or Classic events draw the Target Region
	if (eventClass === "classic") {
		// draw markup for classic events.
		this.drawClassicEventMarkup(event);
	} else if (eventClass === "oscillator") {
		// oscillator
		this.drawOscillatorEventMarkup(event);
	} else if (eventClass === "indicator") {
		// Indicator (moving average)
		this.drawIndicatorEventMarkup(event);
	} else if (eventClass === "shortterm") {
		// Indicator (moving average)
		this.drawShortTermEventMarkup(event);
	}
};

/**
 * Create chart changes and markup for Indicators (Moving Average)
 *
 * @param {Object} event Object containing information about a specific event
 */
CIQ.TechnicalInsights.prototype.drawIndicatorEventMarkup = function (event) {
	const { stx } = this;
	const { eventId } = event;
	const { eventTypeId } = event.eventType;

	let study;
	let smaPeriod;
	let inputs;
	let outputs;

	// single moving average cross
	if (eventTypeId.match(/singlemovingaverage/)) {
		smaPeriod = event.additionalTimeseries[0];
		smaPeriod = smaPeriod.replace("sma", "");
		inputs = { Period: smaPeriod, Field: "field", Type: "ma" };
		outputs = { MA: "blue" };

		// Track total general count of times SMA  is added
		if (this.studyInstances.has(smaPeriod)) {
			// already added to chart, increase instance
			let studyCount = this.studyInstances.get(smaPeriod);
			// don't add a study (already there, just increase Map count)
			this.studyInstances.set(smaPeriod, studyCount + 1);
		} else {
			// track the addition of study to chart so we can remove later.
			this.studyInstances.set(smaPeriod, 1);
			// Actually add the study to the chart as not there yet.
			study = CIQ.Studies.addStudy(stx, "ma", inputs, outputs);
			this.drawnStudies.set(smaPeriod, study);
		}
	} else if (
		eventTypeId.match(/doublemovingaverage/) ||
		eventTypeId.match(/triplemovingaverage/)
	) {
		// Double or Triple moving average: loop through sma periods
		// in the event_specific information.
		for (let i = 0; i < event.additionalTimeseries.length; i++) {
			smaPeriod = event.additionalTimeseries[i];
			smaPeriod = smaPeriod.replace("sma", "");
			inputs = { Period: smaPeriod, Field: "field", Type: "ma" };

			if (i === 0) {
				outputs = { MA: "blue" };
			} else if (i === 1) {
				outputs = { MA: "red" };
			} else {
				outputs = { MA: "green" };
			}

			// Track total general count of times SMA  is added
			if (this.studyInstances.has(smaPeriod)) {
				// already added to chart, increase instance, but don't actually add study
				let studyCount = this.studyInstances.get(smaPeriod);
				this.studyInstances.set(smaPeriod, studyCount + 1);
			} else {
				// track addition of SMA by this event, and ADD the study to chart
				this.studyInstances.set(smaPeriod, 1);
				study = CIQ.Studies.addStudy(stx, "ma", inputs, outputs);
				this.drawnStudies.set(smaPeriod, study);
			}
		}
	}

	const markupId = "indicatormarkupbox-" + eventId;
	if (this.eventMarkupInjections.has(markupId)) return;

	const indicatorEventBoxDrawInjection = stx.append("draw", function () {
		const parameters = { pattern: "solid", lineWidth: 1 };
		const chartPanel = stx.chart.panel;
		const studyContext = chartPanel.chart.context;
		const color = "#FF0000";

		const startDate = event.markup[0].points[0].time;
		const lowPrice = event.markup[0].points[1].value;
		const endDate = event.markup[0].points[1].time;
		const highPrice = event.markup[0].points[1].value;

		let x0 = stx.pixelFromDate(startDate, stx.chart);
		let x1 = stx.pixelFromDate(endDate, stx.chart);
		let y0 = stx.pixelFromPrice(lowPrice, chartPanel);
		let y1 = stx.pixelFromPrice(highPrice, chartPanel);

		// add some padding to the vertical event box
		y0 = y0 + stx.layout.candleWidth;
		y1 = y1 - stx.layout.candleWidth;

		// make sure the padding doesn't exceed chart boundary
		if (y1 < chartPanel.top) {
			y1 = chartPanel.top + chartPanel.height * 0.05;
		}
		if (y0 > chartPanel.bottom) {
			y0 = chartPanel.bottom - chartPanel.height * 0.05;
		}

		// add some padding to horizontal of eventbox
		x1 = x1 + stx.layout.candleWidth;
		x0 = x0 - stx.layout.candleWidth;

		// draw the box around the event in the Oscillator Panel (or chart for bollingers)
		stx.plotLine(x0, x1, y0, y0, color, "segment", studyContext, chartPanel, parameters); // prettier-ignore
		stx.plotLine(x0, x1, y1, y1, color, "segment", studyContext, chartPanel, parameters); // prettier-ignore
		stx.plotLine(x0, x0, y0, y1, color, "segment", studyContext, chartPanel, parameters); // prettier-ignore
		stx.plotLine(x1, x1, y0, y1, color, "segment", studyContext, chartPanel, parameters); // prettier-ignore
	});
	// store the injection in a Map by eventid key to we can lookup and delete it later.
	this.eventMarkupInjections.set(markupId, indicatorEventBoxDrawInjection);
};

/**
 * Create chart changes and markup for Short-term events (Candlestick patterns)
 *
 * @param {Object} event Object containing information about a specific event
 */
CIQ.TechnicalInsights.prototype.drawShortTermEventMarkup = function (event) {
	const { stx } = this;
	const { eventId } = event;
	const { eventTypeId } = event.eventType;
	const markupId = "shorttermmarkup-" + eventId;

	if (this.eventMarkupInjections.has(markupId)) return;

	const shortTermMarkupDrawInjection = stx.append("draw", function () {
		// draw the Candlestick Pattern Trend Lines and Candlestick Markup
		const { markup } = event;
		let regionPos = 0;

		for (let i = 0; i < markup.length; i++) {
			const line = markup[i];
			const lineType = line.markupType;
			const lineCategory = line.category;
			const lineRepresents = line.represents;

			if (lineType === "region") {
				// keep track of position in array of event region info
				regionPos = i;
				continue;
			}

			if (lineCategory === "trend" && lineRepresents === "pattern") continue;

			const startDate = line.points[0].time;
			const startPrice = line.points[0].value;
			const endPrice = line.points[1].value;
			const endDate = line.points[1].time;

			let x0 = stx.pixelFromDate(startDate, stx.chart);
			let x1 = stx.pixelFromDate(endDate, stx.chart);
			let y0 = stx.pixelFromPrice(startPrice);
			let y1 = stx.pixelFromPrice(endPrice);

			// get the line type and set properties of line
			let width = 1;
			let style = "solid"; // options: "solid", "dashed", "dotted"
			let color = "#FF0000";

			if (lineCategory === "pattern") {
				width = 2;
			} else if (lineCategory === "boundary") {
				width = 1;
			} else if (lineCategory === "trend") {
				color = "#C4C4C4";
				width = 1;
			}

			let parameters = { pattern: style, lineWidth: width };
			stx.plotLine(x0, x1, y0, y1, color, "segment", stx.chart.context, true, parameters); // prettier-ignore
		}

		// don't draw event box for gaps- but not for a couple event types.
		if (!eventTypeId.match(/gap/) && !eventTypeId.match(/engulfingline/)) {
			// Draw the box around the Candlestick bars
			const parameters = { pattern: "solid", lineWidth: 1 };
			const chartPanel = stx.chart.panel;
			const studyContext = chartPanel.chart.context;
			const color = "#FF0000";

			const startDate = event.markup[regionPos].points[0].time;
			const lowPrice = event.markup[regionPos].points[0].value;
			const endDate = event.markup[regionPos].points[1].time;
			const highPrice = event.markup[regionPos].points[1].value;

			let x0 = stx.pixelFromDate(startDate, stx.chart);
			let x1 = stx.pixelFromDate(endDate, stx.chart);
			let y0 = stx.pixelFromPrice(lowPrice, chartPanel);
			let y1 = stx.pixelFromPrice(highPrice, chartPanel);

			// add some padding to the event box
			y0 = y0 + stx.layout.candleWidth;
			y1 = y1 - stx.layout.candleWidth;
			// make sure the padding doesn't exceed chart boundary
			if (y1 < chartPanel.top) {
				y1 = chartPanel.top;
			}
			if (y0 > chartPanel.bottom) {
				y0 = chartPanel.bottom;
			}

			// add padding to the horizontal width of the event box
			x1 = x1 + Number(stx.layout.candleWidth * 0.5);
			x0 = x0 - Number(stx.layout.candleWidth * 0.5);

			// draw the box around the event in the Candle Pattern
			stx.plotLine(x0, x1, y0, y0, color, "segment", studyContext, chartPanel, parameters); // prettier-ignore
			stx.plotLine(x0, x1, y1, y1, color, "segment", studyContext, chartPanel, parameters); // prettier-ignore
			stx.plotLine(x0, x0, y0, y1, color, "segment", studyContext, chartPanel, parameters); // prettier-ignore
			stx.plotLine(x1, x1, y0, y1, color, "segment", studyContext, chartPanel, parameters); // prettier-ignore
		}
	});
	// store the injection in a Map by eventId key to we can lookup and delete it later.
	this.eventMarkupInjections.set(markupId, shortTermMarkupDrawInjection);
};

/**
 * Create chart changes and markup for Oscillators
 *
 * @param {Object} event Object containing information about a specific event
 */
CIQ.TechnicalInsights.prototype.drawOscillatorEventMarkup = function (event) {
	const { stx } = this;
	const eventName = event.eventType.name;
	const eventTypeId = event.eventType.eventTypeId;
	const eventId = event.eventId;
	let study;

	// Track count of times study is added
	if (this.drawnStudies.has(eventName)) {
		// already added to chart, increase instance
		let studyCount = this.studyInstances.get(eventName);
		this.studyInstances.set(eventName, studyCount + 1);
	} else {
		// not on chart yet, add instance=1, and add to CIQ chart
		this.studyInstances.set(eventName, 1);

		if (eventTypeId.match(/macd/)) {
			study = CIQ.Studies.addStudy(this.stx, "macd");
		} else if (eventTypeId.match(/rsi/)) {
			study = CIQ.Studies.addStudy(this.stx, "rsi");
		} else if (eventTypeId.match(/momentum/)) {
			// Momentum (ROC)
			// make sure we use the 10 period Momentum (not default 14)
			study = CIQ.Studies.addStudy(this.stx, "Momentum", { Period: 10 });
		} else if (eventTypeId.match(/shortkst/)) {
			// Short-Term KST
			// SHORT-TERM KST PARAMETERS
			// @ROCParameters = (10,15,20,30);
			// @MAParameters = (10,10,10,15);
			const parameters = {
				"Heaviest Rate of Change Period": 30,
				"Heavy Rate of Change Period": 20,
				"Light Rate of Change Period": 15,
				"Lightest Rate of Change Period": 10,
				"Heaviest SMA Period": 15,
				"Heavy SMA Period": 10,
				"Light SMA Period": 10,
				"Lightest SMA Period": 10,
				"Signal Period": 9
			};

			study = CIQ.Studies.addStudy(this.stx, "Pring KST", parameters);
		} else if (eventTypeId.match(/intermediatekst/)) {
			// Intermediate-Term KST
			// TechnicalInsights Parameters (weekly bars)
			// @ROCParameters = (10,13,15,20);
			// @MAParameters = (10,13,15,20);
			const parameters = {
				"Heaviest Rate of Change Period": 20,
				"Heavy Rate of Change Period": 15,
				"Light Rate of Change Period": 13,
				"Lightest Rate of Change Period": 10,
				"Heaviest SMA Period": 20,
				"Heavy SMA Period": 15,
				"Light SMA Period": 13,
				"Lightest SMA Period": 10,
				"Signal Period": 9
			};

			study = CIQ.Studies.addStudy(this.stx, "Pring KST", parameters);
		} else if (eventTypeId.match(/longkst/)) {
			// Long Term KST
			// TechnicalInsights Parameters (monthly bars)
			// @ROCParameters = (9,12,18,24);
			// @MAParameters = (6,6,6,9);
			const parameters = {
				"Heaviest Rate of Change Period": 24,
				"Heavy Rate of Change Period": 18,
				"Light Rate of Change Period": 12,
				"Lightest Rate of Change Period": 9,
				"Heaviest SMA Period": 9,
				"Heavy SMA Period": 6,
				"Light SMA Period": 6,
				"Lightest SMA Period": 6,
				"Signal Period": 9
			};

			study = CIQ.Studies.addStudy(this.stx, "Pring KST", parameters);
		} else if (eventTypeId.match(/williams/)) {
			study = CIQ.Studies.addStudy(this.stx, "Williams %R");
		} else if (eventTypeId.match(/cci/)) {
			study = CIQ.Studies.addStudy(this.stx, "CCI");
		} else if (eventTypeId.match(/bollinger/)) {
			study = CIQ.Studies.addStudy(this.stx, "Bollinger Bands");
		} else if (eventTypeId.match(/faststochastic/)) {
			study = CIQ.Studies.addStudy(this.stx, "stochastics", {
				Period: 14,
				Smooth: false
			});
		} else if (eventTypeId.match(/slowstochastic/)) {
			study = CIQ.Studies.addStudy(this.stx, "stochastics", {
				Period: 14,
				Smooth: true
			});
		}

		// track the addition of study to chart so we can remove later.
		this.drawnStudies.set(eventName, study);
	}

	if (!study) return;

	const markupId = "oscillator-" + eventId;
	if (this.eventMarkupInjections.has(markupId)) return;

	const oscilatorMarkupDrawInjection = stx.append("draw", function () {
		const parameters = { pattern: "solid", lineWidth: 1 };
		const color = "#FF0000";
		const studyPanelName = study.panel;
		const studyPanel = stx.panels[studyPanelName];
		if (!studyPanel) return;
		const studyContext = studyPanel.chart.context;

		const startDate = event.markup[0].points[0].time;
		const lowPrice = event.markup[0].points[1].value;
		const endDate = event.markup[0].points[1].time;
		const highPrice = event.markup[0].points[1].value;

		let x0 = stx.pixelFromDate(startDate, stx.chart);
		let x1 = stx.pixelFromDate(endDate, stx.chart);
		let y0 = stx.pixelFromPrice(lowPrice, studyPanel);
		let y1 = stx.pixelFromPrice(highPrice, studyPanel);

		// add some padding to the event box (but not for bollingers: 1017)
		if (!eventTypeId.match(/bollinger/)) {
			y0 = studyPanel.top + 5; //y0 + stx.layout.candleWidth;
			y1 = studyPanel.bottom - 5; //y1 - stx.layout.candleWidth;
		}

		// make sure the padding doesn't exceed chart boundary at top
		if (y1 < studyPanel.top) {
			y1 = studyPanel.top + studyPanel.height * 0.05;
		}

		// Make sure both y axis points are on the drawable chart, not cut off at bottom.
		let lastPanelBottomHeight = stx.height - 30;
		if (y1 > lastPanelBottomHeight) {
			y1 = lastPanelBottomHeight - 5;
		} else if (y1 > studyPanel.bottom) {
			y1 = studyPanel.bottom - 5;
		}
		if (y0 > lastPanelBottomHeight) {
			y0 = lastPanelBottomHeight - 5;
		} else if (y0 > studyPanel.bottom) {
			y0 = studyPanel.bottom - 5;
		}

		x1 = x1 + stx.layout.candleWidth;

		// draw the box around the event in the Oscillator Panel (or chart for bollingers)
		stx.plotLine(x0, x1, y0, y0, color, "segment", studyContext, studyPanel, parameters); // prettier-ignore
		stx.plotLine(x0, x1, y1, y1, color, "segment", studyContext, studyPanel, parameters); // prettier-ignore
		stx.plotLine(x0, x0, y0, y1, color, "segment", studyContext, studyPanel, parameters); // prettier-ignore
		stx.plotLine(x1, x1, y0, y1, color, "segment", studyContext, studyPanel, parameters); // prettier-ignore
	});
	// store the injection in a Map by eventid key to we can lookup and delete it later.
	this.eventMarkupInjections.set(markupId, oscilatorMarkupDrawInjection);
};

/*
 * Create injections to display Lines and Regions of the TechnicalInsights Event.
 *
 * @param {Object} event Object containing information about a specific event
 */
CIQ.TechnicalInsights.prototype.drawClassicEventMarkup = function (event) {
	const { stx } = this;
	const { context } = stx.chart;
	const { eventId } = event;
	const { eventClass } = event.eventType;

	const markupId = "classicmarkup-" + eventId;
	if (this.eventMarkupInjections.has(markupId)) return;

	const classicMarkupDrawInjection = stx.append("draw", function () {
		const { markup } = event;

		for (let i = 0; i < markup.length; i++) {
			const line = markup[i];
			const lineType = line.markupType;
			const lineCategory = line.category;
			const lineRepresents = line.represents;

			if (lineType === "region") continue;
			if (lineCategory === "trend" && lineRepresents === "pattern") continue;

			// handle rounded bottom/top patterns
			if (lineType === "curve") {
				let startDate = line.points[0].time;
				let startPrice = line.points[0].value;
				let midPrice = line.points[1].value;
				let endDate = line.points[2].time;

				let x0 = stx.pixelFromDate(startDate, stx.chart);
				let y0 = stx.pixelFromPrice(startPrice);
				let y1 = stx.pixelFromPrice(midPrice);
				let x2 = stx.pixelFromDate(endDate, stx.chart);

				context.beginPath();
				context.moveTo(x0, y0);
				context.bezierCurveTo(x0, y1, x2, y1, x2, y0);
				context.strokeStyle = "#FF0000";
				context.lineWidth = 2;
				context.stroke();
				context.closePath();
			} else {
				let startDate = line.points[0].time;
				let startPrice = line.points[0].value;
				let endPrice = line.points[1].value;
				let endDate = line.points[1].time;

				let x0 = stx.pixelFromDate(startDate, stx.chart);
				let x1 = stx.pixelFromDate(endDate, stx.chart);
				let y0 = stx.pixelFromPrice(startPrice);
				let y1 = stx.pixelFromPrice(endPrice);

				// get the line type and set properties of line
				let width = 1;
				let style = "solid"; // options: "solid","dashed","dotted"
				let color = "#FF0000";
				if (lineCategory === "pattern") {
					width = 1;
				} else if (lineCategory === "boundary") {
					width = 1;
				} else if (lineCategory === "trend") {
					color = "#C4C4C4";
					width = 1;
				}

				let parameters = { pattern: style, lineWidth: width };

				stx.plotLine(x0, x1, y0, y1, color, "segment", context, true, parameters); // prettier-ignore
			}
		}
	});

	this.eventMarkupInjections.set(markupId, classicMarkupDrawInjection);

	// for Classic events draw the Target Region
	if (eventClass === "classic") {
		// default bullish colors for target range.
		let finalTargetColor = "#00FF00";
		let mainTargetColor = "#77FF77";

		// if Bearish event, change colors
		if (event.eventType.tradeType === "short") {
			finalTargetColor = "#FF0000";
			mainTargetColor = "#FF7777";
		}

		// do the Date Price Math for the Regions to Draw
		const eventDateString = event.dates.eventEnd;
		const rangeStartDate = CIQ.strToDateTime(eventDateString);
		const rangeEndDate = CIQ.strToDateTime(event.lastPossibleActive);
		const targetLower = event.targetPrice.lower;
		const targetUpper = event.targetPrice.upper;
		const closePrice = event.endPrices.breakout;
		const targetStartDate = CIQ.yyyymmddhhmmssmmm(rangeStartDate);
		const targetEndDate = CIQ.yyyymmddhhmmssmmm(rangeEndDate);

		const finalTargetRange = stx.createDrawing("rectangle", {
			fc: finalTargetColor,
			pnl: "chart",
			ptrn: "none",
			v0: targetLower,
			v1: targetUpper,
			d0: targetStartDate,
			d1: targetEndDate
		});

		finalTargetRange.permanent = true; // set drawing instance to permanent
		const finalTargetId = "classicfinaltarget-" + eventId;
		this.eventMarkupDrawInjections.set(finalTargetId, finalTargetRange);

		const mainTargetRange = stx.createDrawing("rectangle", {
			fc: mainTargetColor,
			pnl: "chart",
			ptrn: "none",
			v0: closePrice,
			v1: targetLower,
			d0: targetStartDate,
			d1: targetEndDate
		});

		mainTargetRange.permanent = true; // set drawing instance to permanent
		const mainTargetId = "classicmaintarget-" + eventId;
		this.eventMarkupDrawInjections.set(mainTargetId, mainTargetRange);
	}
};

/**
 * Makes a request to the Trading Central API for TechnicalInsights events.
 *
 * @param {string} params.interval The data interval, ie "day" or "week"
 * @param {string} params.symbol The chart symbol
 * @param {string} params.exchange The exchange for the symbol
 * @param {function} cb The callback function to call after request is complete
 */
CIQ.TechnicalInsights.prototype.getEvents = function (params, cb) {
	let url = "https://api.tradingcentral.com/instrumentevents/v3/";
	url += params.symbol + "%3A" + params.exchange;

	let period = params.interval;

	if (params.interval != "day" && params.interval != "week") {
		//make REST compatible period e.g. '30minute'
		period = period + "minute";
	}

	let query = {
		class: "classic,indicator,oscillator,shortterm",
		priceperiod: period,
		tradetype: "long,short,undefined",
		lang: this.lang,
		token: this.auth
	};

	requestJSON(url, query, cb);
};

/**
 * Gets event education info
 *
 * @param {string} eventTypeId
 * @param {Function} cb
 */
CIQ.TechnicalInsights.prototype.getEventEducation = function (eventTypeId, cb) {
	let url =
		"https://api.tradingcentral.com/events/types/v3/" +
		eventTypeId +
		"/education";

	let query = {
		lang: this.lang,
		token: this.auth
	};

	requestJSON(url, query, cb);
};

/**
 * Gets the data for support and resistance lines
 *
 * @param {Object} params
 * @param {string|number} params.interval The chart interval
 * @param {number} params.periodicity The chart periodicity
 * @param {string} params.symbol The chart symbol
 * @param {string} params.exchange The exchange (symbol.exchDisp)
 * @param {Function} cb
 */
CIQ.TechnicalInsights.prototype.getSupportAndResistance = function (
	params,
	cb
) {
	let period = params.interval;
	if (params.interval != "day" && params.interval != "week") {
		//make REST compatible period e.g. '30minute'
		period = period + "minute";
	}

	let url = "https://api.tradingcentral.com/supportandresistance/v3";

	let query = {
		ids: params.symbol + ":" + params.exchange,
		priceperiod: period,
		lang: this.lang,
		token: this.auth
	};

	requestJSON(url, query, cb);
};

/**
 * Method to get the TechnicalInsights active events, and draw the event 'dots' on the chart. Call this
 * method when instantiating or enabling the plugin.
 */
CIQ.TechnicalInsights.prototype.getActiveEvents = function () {
	const controller = this;
	const { stx, lookupExchange } = this;
	const { symbol } = stx.chart;
	const { exchDisp: exchange } = stx.chart.symbolObject || {};

	if (exchange) {
		getEvents(symbol, exchange);
	} else if (!lookupExchange) {
		throw new Error(
			"TechnicalInsights plugin requires `symbolObject.exchDisp` to be set"
		);
	} else {
		const cb = (exchange) => {
			if (exchange) {
				getEvents(symbol, exchange);
			} else {
				console.error("No `exchDisp` found for symbol"); // don't throw because we might be inside a try block
			}
		};

		lookupExchange(symbol, cb);
	}

	function getEvents(symbol, exchange) {
		// First remove existing markup/studies from the chart. (start clean)
		controller.removeInjections();

		// Once IID has been found for instrument, call TechnicalInsights API to get content
		const { interval, periodicity } = stx.layout;
		exchange = exchange.replace("TSX", "TORONTO");
		exchange = exchange.replace("NYSE MKT", "NYSE");

		let params = {
			interval: interval,
			periodicity: periodicity,
			symbol: symbol,
			exchange: exchange
		};

		controller.getEvents(params, function (response) {
			if (!response) return;
			const { events } = response; // response is the list of events

			controller.drawActiveEventLabels(events);
			controller.addEventLabelMouseInjections(events);

			//-------------------------------------------------------------------------------
			// Auto-Draw Event, If an event(s) id is passed in.
			//-------------------------------------------------------------------------------
			if (controller.eventid) {
				let eventIdParams = String(controller.eventid);
				// may contain multiple event ids
				let eventsToDraw = eventIdParams.split(",");

				for (let i = 0; i < events.length; i++) {
					let eventId = String(events[i].eventId);
					if (eventsToDraw.indexOf(eventId) > -1) {
						let event = events[i];

						// make sure we don't draw if already drawn.
						if (controller.drawnEvents.has(event.eventId)) {
							continue;
						}
						// draw the event markup details.
						controller.drawEventMarkup(event);
						controller.drawnEvents.set(eventId, 1);

						// pricePeriod -> "day", "5minute", "15minute"
						let { pricePeriod } = event;
						let interval = 1;

						if (pricePeriod == "5minute") {
							interval = 5;
							pricePeriod = "minute";
						} else if (pricePeriod == "15minute") {
							interval = 15;
							pricePeriod = "minute";
						} else if (pricePeriod == "30minute") {
							interval = 30;
							pricePeriod = "minute";
						}

						// Find the data day of the event, based on date/time
						const priceData = stx.masterData;
						const eventDate = event.dates.eventEnd.replace(/[-T:]/g, "");
						let eventDataDay = priceData.length - 1;

						for (let j = priceData.length - 1; j >= 0; --j) {
							let priceDate = priceData[j].DT.ciqdate().substring(0, 14);
							if (priceDate === eventDate) {
								eventDataDay = j;
								break;
							}
						}

						// Zoom the chart by setting start/end dates for the events
						let startDate = "";
						let endDate = "";

						// chart end date
						if (event.eventType.eventClass == "classic") {
							// if classic pattern, make last possible end date.
							startDate = event.dates.trendBegin;
							endDate = event.lastPossibleActive;
						} else {
							// for non-classic events start n (10) bars before event, to last bar
							startDate = priceData[eventDataDay - 10].DT.restdate(); // 10 bars before event
							endDate = priceData[priceData.length - 1].DT.restdate(); // last bar
						}

						// Set the chart date range based on the event dates (Zoom)
						stx.setRange({
							dtLeft: startDate,
							dtRight: endDate,
							padding: 10,
							periodicity: {
								interval: interval,
								timeUnit: pricePeriod,
								period: 1
							}
						});

						stx.draw();
						break;
					}
				}
			} else {
				stx.draw(); // no event to draw, just draw event dots
			}
		});

		if (controller.showsr) {
			let term = controller.srterm; // get the support and resistance
			params = {
				interval: interval,
				periodicity: periodicity,
				symbol: symbol,
				exchange: exchange
			};

			controller.getSupportAndResistance(params, function (response) {
				if (!response.supportAndResistance.length) return;
				// response is the list of events
				let supportLevels = response.supportAndResistance[0].support;
				let resistanceLevels = response.supportAndResistance[0].resistance;
				let supportterm = "support" + term;
				let resistanceterm = "resistance" + term;
				let support = supportLevels[supportterm];
				let resistance = resistanceLevels[resistanceterm];

				controller.drawSupportAndResistance(
					support,
					resistance,
					term,
					interval
				);

				stx.draw();

				let params = {
					supportprice: support,
					resistanceprice: resistance,
					interval: interval,
					term: term
				};

				controller.addSupportAndResistanceMouseInjections(params);
			});
		}
	}
};

/**
 * Remove previously shown studies used to aid in the analysis.
 */
CIQ.TechnicalInsights.prototype.hideIndicators = function () {
	if (this.rsi) {
		CIQ.Studies.removeStudy(this.stx, this.rsi);
		this.rsi = null;
	}

	if (this.bollingerBands) {
		CIQ.Studies.removeStudy(this.stx, this.bollingerBands);
		this.bollingerBands = null;
	}

	this.displayingIndicators = false;
};

/**
 * Show studies that aid in the analysis.
 */
CIQ.TechnicalInsights.prototype.showIndicators = function () {
	if (!this.rsi) {
		this.rsi = CIQ.Studies.addStudy(
			this.stx,
			"rsi",
			{ Period: 14 },
			{ RSI: "#8ec648" }
		);
	}

	if (!this.bollingerBands) {
		this.bollingerBands = CIQ.Studies.addStudy(
			this.stx,
			"Bollinger Bands",
			{
				Field: "field",
				Period: 20,
				"Standard Deviations": 2,
				"Moving Average Type": "ma",
				"Channel Fill": false
			},
			{
				"Bollinger Bands Top": "#8ec648",
				"Bollinger Bands Median": "#f38d5b",
				"Bollinger Bands Bottom": "#ea1d2c"
			}
		);
	}

	this.displayingIndicators = true;
};

/**
 * Get a Y-axis value for the given price.
 *
 * @param {Number} price the value to reference
 * @return a Y-axis number value or null if the price would not be displayed on the panel
 * @private
 */
CIQ.TechnicalInsights.prototype.getY = function (price) {
	let y = Math.floor(this.stx.pixelFromPrice(price, this.panel) + 0.5) + 0.5;
	return y < this.panel.top || y > this.panel.bottom ? null : y;
};

/**
 * Draw a line on the chart panel for the given price.
 *
 * @param {Number} price the value to display
 * @param {string} colorName name in `this.colors` to use when drawing the line
 * @param {boolean} [emphasize=false] if the price line should be thicker than normal
 */
CIQ.TechnicalInsights.prototype.priceLine = function (
	price,
	colorName,
	emphasize
) {
	let y = this.getY(price);
	if (y === null) return;
	this.stx.plotLine(
		this.panel.left,
		this.panel.right,
		y,
		y,
		this.colors[colorName],
		"segment",
		this.panel.chart.context,
		this.panel,
		{
			pattern: "solid",
			lineWidth: emphasize ? 3 : 1,
			opacity: 1
		}
	);
};

/**
 * Draw a label on the chart panel YAxis for the given price.
 *
 * @param {Number} price the value to display
 * @param {string} colorName name in `this.colors` to use when drawing the label
 */
CIQ.TechnicalInsights.prototype.priceLabel = function (price, colorName) {
	let y = this.getY(price);
	if (y === null) return;
	this.stx.createYAxisLabel(
		this.panel,
		price,
		y,
		this.colors[colorName],
		"#ffffff"
	);
};

/**
 * Calls CIQ.ChartEngine.prototype.removeInjection for each display function
 */
CIQ.TechnicalInsights.prototype.removeInjections = function () {
	const stx = this.stx;
	const {
		eventMarkupInjections,
		eventMarkupDrawInjections,
		mouseMoveInjections,
		mouseDownInjections,
		drawnLabels,
		drawnEvents,
		drawnStudies,
		studyInstances
	} = this;

	// remove any Markers left on the chart.
	// (event label, education, support, resistance)
	if (drawnLabels.size > 0) {
		drawnLabels.forEach(function (mapdata, mapkey, mapObj) {
			let markerId = mapkey;
			drawnLabels.delete(markerId);
			CIQ.Marker.removeByLabel(stx, markerId);
		});
	}

	// Clear Map tracking drawn Events on the chart
	if (drawnEvents.size > 0) {
		drawnEvents.forEach(function (mapdata, mapkey, mapObj) {
			let eventId = mapkey;
			drawnEvents.delete(eventId);
		});
	}

	// Clear Map tracking drawn Studies on the chart
	if (drawnStudies.size > 0) {
		drawnStudies.forEach(function (mapdata, mapkey, mapObj) {
			let eventId = mapkey;
			let studyDef = mapdata;
			CIQ.Studies.removeStudy(stx, studyDef);
			drawnStudies.delete(eventId);
		});
	}

	// Clear Map tracking study Instances on the chart
	if (studyInstances.size > 0) {
		studyInstances.forEach(function (mapdata, mapkey, mapObj) {
			let eventId = mapkey;
			studyInstances.delete(eventId);
		});
	}

	// only one instance of this--dots drawn in one shot.
	if (this.eventDotsInjection) {
		stx.removeInjection(this.eventDotsInjection);
		this.eventDotsInjection = null;
	}

	// Loop through and delete all DIRECT DRAW injections
	if (eventMarkupInjections.size > 0) {
		eventMarkupInjections.forEach(function (mapdata, mapkey, mapObj) {
			let label = mapkey;
			let injection = mapdata;
			stx.removeInjection(injection);
			eventMarkupInjections.delete(label);
		});
	}

	// Loop through and delete all DRAWING 'injections'
	if (eventMarkupDrawInjections.size > 0) {
		eventMarkupDrawInjections.forEach(function (mapdata, mapkey, mapObj) {
			let label = mapkey;
			let drawing = mapdata;
			stx.removeDrawing(drawing);
			eventMarkupDrawInjections.delete(label);
		});
	}

	// Loop through and delete all MOUSE MOVE injections
	if (mouseMoveInjections.size > 0) {
		mouseMoveInjections.forEach(function (mapdata, mapkey, mapObj) {
			let label = mapkey;
			let injection = mapdata;
			stx.removeInjection(injection);
			mouseMoveInjections.delete(label);
		});
	}

	// Loop through and delete all MOUSE DOWN injections
	if (mouseDownInjections.size > 0) {
		mouseDownInjections.forEach(function (mapdata, mapkey, mapObj) {
			let label = mapkey;
			let injection = mapdata;
			stx.removeInjection(injection);
			mouseDownInjections.delete(label);
		});
	}
};

/**
 * Calls CIQ.ChartEngine.prototype.removeInjection for a SPECIFIC injection (event markup)
 */
CIQ.TechnicalInsights.prototype.removeMarkupForEvent = function (event) {
	const { stx, eventMarkupDrawInjections, eventMarkupInjections } = this;
	const { eventId, eventType } = event;
	const { eventTypeId } = eventType;
	const eventName = eventType.name;

	// for a regex match with variable, need to pass this in to .match()
	const matchEventId = new RegExp(eventId, "g");

	// there may be multiple markup draw injections
	// check if there are some, and remove them all.
	if (eventMarkupInjections.size > 0) {
		eventMarkupInjections.forEach(function (mapdata, mapkey, mapObj) {
			let markupId = mapkey;
			if (markupId.match(matchEventId)) {
				let injection = mapdata;
				stx.removeInjection(injection);
				eventMarkupInjections.delete(markupId);
			}
		});
	}

	if (eventMarkupDrawInjections.size > 0) {
		eventMarkupDrawInjections.forEach(function (mapdata, mapkey, mapObj) {
			let markupId = mapkey;
			if (markupId.match(matchEventId)) {
				let drawing = mapdata; // mapdata => drawing
				stx.removeDrawing(drawing);
				eventMarkupDrawInjections.delete(markupId);
			}
		});
	}

	// remove the Studies from the chart for Oscillators
	if (event.eventType.eventClass === "oscillator") {
		if (this.studyInstances.size > 0) {
			if (this.studyInstances.has(eventName)) {
				let studyCount = this.studyInstances.get(eventName);
				studyCount--;
				this.studyInstances.set(eventName, studyCount);
				if (studyCount === 0) {
					let study = this.drawnStudies.get(eventName);
					this.drawnStudies.delete(eventName);
					CIQ.Studies.removeStudy(stx, study);
				}
			}
		}
	}

	// remove the SMA Studies from the chart for Indicators
	if (event.eventType.eventClass === "indicator") {
		let smaPeriod;

		// single moving average cross
		if (eventTypeId.match(/singlemovingaverage/)) {
			// remove the single moving average from the chart (maybe)
			smaPeriod = event.additionalTimeseries[0];
			smaPeriod = smaPeriod.replace("sma", "");

			if (this.studyInstances.has(smaPeriod)) {
				let studyCount = this.studyInstances.get(smaPeriod);
				studyCount--;

				if (studyCount === 0) {
					this.studyInstances.delete(smaPeriod);
					let study = this.drawnStudies.get(smaPeriod);
					CIQ.Studies.removeStudy(stx, study);
					this.drawnStudies.delete(smaPeriod);
				} else {
					this.studyInstances.set(smaPeriod, studyCount);
				}
			}
		} else if (
			eventTypeId.match(/doublemovingaverage/) ||
			eventTypeId.match(/triplemovingaverage/)
		) {
			// Double or Triple moving average: loop through sma periods
			// in the event_specific information.
			for (let i = 0; i < event.additionalTimeseries.length; i++) {
				smaPeriod = event.additionalTimeseries[i];
				smaPeriod = smaPeriod.replace("sma", "");
				if (this.studyInstances.has(smaPeriod)) {
					let studyCount = this.studyInstances.get(smaPeriod);
					studyCount--;

					if (studyCount === 0) {
						this.studyInstances.delete(smaPeriod);
						let study = this.drawnStudies.get(smaPeriod);
						CIQ.Studies.removeStudy(stx, study);
						this.drawnStudies.delete(smaPeriod);
					} else {
						this.studyInstances.set(smaPeriod, studyCount);
					}
				}
			}
		}
	}
};

/**
 * Determine the current term from the layout.
 *
 * @return {string} the name of the term or undefined
 */
CIQ.TechnicalInsights.prototype.getCurrentTerm = function () {
	let termMap = {
		30: "Intraday",
		day: "ST",
		week: "MT"
	};

	return termMap[this.stx.layout.interval];
};
