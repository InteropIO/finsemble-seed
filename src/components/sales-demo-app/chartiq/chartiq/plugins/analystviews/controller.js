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
var qs = {
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
			var kv = part
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
 * XHR GET request to retreive a XML document.
 *
 * @example
 * request('/create.xml', {day: 0}, function(err, xmlDocument) {
 * 	// do something with the `xmlDocument`
 * });
 *
 * @param {DOMString} url	the entire URL for the request
 * @param {Object} query a flat object that is is stringify'd into a query string
 * @param {function} callback to receive the XML document
 *
 * @private
 */
function request(url, query, callback) {
	var xhr = new XMLHttpRequest();
	var doCallback = function (err, result) {
		if (!callback) return;
		callback(err, result);
		callback = null;
	};

	xhr.addEventListener("load", function () {
		if (this.status != 200) {
			return doCallback(this.statusText);
		}

		var xmlDoc = this.responseXML || parseXml(this.responseText);
		var nsResolver = xmlDoc.createNSResolver(xmlDoc.documentElement);
		var error = xmlDoc.evaluate(
			"/errors/error_message",
			xmlDoc,
			nsResolver,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null
		).singleNodeValue;

		if (error) {
			doCallback(error.textContent);
		} else {
			doCallback(null, xmlDoc);
		}
	});
	xhr.addEventListener("error", doCallback);
	xhr.addEventListener("abort", doCallback);

	xhr.open("GET", url + "?" + qs.stringify(query), true);
	xhr.send();
}

/**
 * Convert the given string into a traversable XML document.
 *
 * @param {DOMString} xmlString	string containing the document to parseXml
 * @return {Document} a XPath traversable document
 *
 * @private
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DOMParser#Parsing_XML}
 */
function parseXml(xmlString) {
	var parser = new DOMParser();
	return parser.parseFromString(xmlString, "text/xml");
}

/**
 * Controller class to assist in the creation and processing of
 * Trading Central™ API requests.
 *
 * @param {CIQ.ChartEngine} stx	A chart instance to modify
 * @param {string} token	Trading Central API token
 * @param {number} partner	Trading Central API parnter number
 */
CIQ.AnalystViews = function (stx, token, partner) {
	if (!token) throw new Error("CIQ.AnalystViews: No token provided");
	if (!partner) throw new Error("CIQ.AnalystViews: No partner number provided");

	this.stx = stx;
	this.token = token;
	this.partner = partner;

	/**
	 * Display lines and labels of the analysis on the primary chart.
	 */
	this.panel = stx.chart.panel;

	/**
	 * Study descriptor handles.
	 */
	this.rsi = null;
	this.bollingerBands = null;

	/**
	 * Colors used for displaying the lines and labels of the analysis.
	 */
	this.colors = {
		resistance: "#30aa0b",
		pivot: "#4169e1",
		support: "#ff2f22"
	};

	/**
	 * Injections handles for displaying the lines and labels of the analysis.
	 */
	this.injections = {
		/**
		 * Use `stxx.append('draw', fucntion() { })` to render the labels.
		 */
		draw: null,
		/**
		 * Use `stxx.append('drawXAxis', function() { })` to render the lines.
		 */
		drawXAxis: null,
		/**
		 * Use `stxx.append('mousemove', function() { })` to create popup events.
		 */
		mousemove: null
	};

	/**
	 * setPeriodicity interval values with AnalystViews term as the key.
	 */
	this.interval = {
		Intraday: 30,
		ST: "day",
		MT: "week"
	};
};

/**
 * A technical analysis request.
 *
 * @param {Object} [options]	endpoint inputs (token & partner populated from instance)
 * @param {string} [options.type_product]	catagory of product
 * @param {string} [options.product]	name of symbol
 * @param {string} [options.culture=en-US]	language
 * @param {string} [options.term] span context
 * @param {Number} [options.days=1]	how many days
 * @param {Boolean} [options.last_ta=true]	get only the last analysis when true
 * @param {function} callback to receive the XML analysis document
 * @see Trading Central specification document.
 */
CIQ.AnalystViews.prototype.analysis = function (options, callback) {
	if (!callback && typeof options == "function") {
		callback = options;
		options = null;
	}

	var url = "https://feed.tradingcentral.com/ws_ta.asmx/GetFeed";
	var query = {
		type_product: null,
		product: null,
		culture: "en-US",
		term: null,
		days: 1,
		last_ta: true,
		splitSubTitles: true
	};

	if (options) {
		for (var k in options) {
			query[k] = options[k];
		}
	}

	query.token = this.token;
	query.partner = this.partner;

	request(url, query, callback);
};

/**
 * Parse the nessary fields from a TA response (XML).
 *
 * @param {Document} xmlDoc	the XML analysis
 * @returns {Object} an object with dereferenced values
 */
CIQ.AnalystViews.parse = function (xmlDoc) {
	var nsResolver = xmlDoc.createNSResolver(xmlDoc.documentElement);
	var getElementByXPath = function (path) {
		return xmlDoc.evaluate(
			path,
			xmlDoc,
			nsResolver,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null
		).singleNodeValue;
	};
	var story = getElementByXPath("/items/article/analysis/content/story");
	var result = {
		header: {
			date: getElementByXPath("/items/article/analysis/content/header/date")
				.textContent,
			hour: getElementByXPath("/items/article/analysis/content/header/hour")
				.textContent,
			/**
			 * Parses the document's date & hour fields.
			 * @returns {Date} instance.
			 */
			get $date() {
				var year = this.date.slice(0, 4);
				var month = this.date.slice(4, 6);
				var day = this.date.slice(6, 8);
				var isoString =
					year + "-" + month + "-" + day + "T" + this.hour + ":00.000Z";

				return new Date(isoString);
			},
			/**
			 * The age of the document.
			 * @returns {string} time span description
			 */
			get $age() {
				var minute = 60 /*seconds*/ * 1000; /*milliseconds*/
				var minutes1 = this.$date.getTime() / minute;
				var minutes2 = Math.floor(Date.now() / minute);
				var age = minutes2 - minutes1;

				if (age <= 180 /*minutes*/) {
					return age + " min ago";
				} else if (age <= 2880 /*minutes (48 hours)*/) {
					return Math.floor(age / 60) + " hr, " + (age % 60) + " min ago";
				}
				return (
					Math.floor(age / 1440) +
					" days, " +
					Math.floor((age % 1440) / 60) +
					" hr ago"
				);
			},
			term: getElementByXPath("/items/article/analysis/content/header/term")
				.textContent,
			option: {
				chartlevels: {
					resistance3: getElementByXPath(
						"/items/article/analysis/content/header/option/chartlevels/resistance3"
					).textContent,
					resistance2: getElementByXPath(
						"/items/article/analysis/content/header/option/chartlevels/resistance2"
					).textContent,
					resistance1: getElementByXPath(
						"/items/article/analysis/content/header/option/chartlevels/resistance1"
					).textContent,
					pivot: getElementByXPath(
						"/items/article/analysis/content/header/option/chartlevels/pivot"
					).textContent,
					support1: getElementByXPath(
						"/items/article/analysis/content/header/option/chartlevels/support1"
					).textContent,
					support2: getElementByXPath(
						"/items/article/analysis/content/header/option/chartlevels/support2"
					).textContent,
					support3: getElementByXPath(
						"/items/article/analysis/content/header/option/chartlevels/support3"
					).textContent
				},
				watch: {
					opinionIntraday: getElementByXPath(
						'/items/article/analysis/content/header/option/watch[@type="opinionIntraday"]'
					).textContent,
					opinionST: getElementByXPath(
						'/items/article/analysis/content/header/option/watch[@type="opinionST"]'
					).textContent,
					opinionMT: getElementByXPath(
						'/items/article/analysis/content/header/option/watch[@type="opinionMT"]'
					).textContent,
					deltaST: getElementByXPath(
						'/items/article/analysis/content/header/option/watch[@type="deltaST"]'
					).textContent,
					deltaMT: getElementByXPath(
						'/items/article/analysis/content/header/option/watch[@type="deltaMT"]'
					).textContent
				}
			},
			get directionArrow() {
				var key = {
					ST: "opinionST",
					MT: "opinionMT",
					INTRADAY: "opinionIntraday"
				}[this.term];
				return this.option.watch[key];
			},
			get directionName() {
				return this.directionArrow > 0
					? "bullish"
					: this.directionArrow < 0
					? "bearish"
					: "neutral";
			}
		},
		story: {
			keywords: getElementByXPath(
				"/items/article/analysis/content/story/keywords"
			).textContent,
			title: getElementByXPath("/items/article/analysis/content/story/title")
				.textContent,
			summary: getElementByXPath(
				"/items/article/analysis/content/story/summary"
			).textContent,
			subsections: Array.prototype.map
				.call(
					story.children || story.childNodes,
					function (element, index, arr) {
						// the final "end" index to use with Array.slice later
						if (index + 1 == arr.length) return arr.length;

						return element.nodeName == "subtitle" ? index : null;
					}
				)
				.filter(Number.isInteger)
				.reduce(function (memo, end, index, arr) {
					if (index === 0) return memo;

					var start = arr[index - 1];
					var section = Array.prototype.slice
						.call(story.children || story.childNodes, start, end)
						.reduce(
							function (m, e) {
								if (e.nodeName == "subtitle") {
									m.subtitle = e.textContent;
								} else if (e.nodeName == "paragraph" && e.textContent) {
									m.paragraphs.push(e.textContent);
								}

								return m;
							},
							{ paragraphs: [] }
						);

					memo.push(section);
					return memo;
				}, [])
		}
	};

	return result;
};

/**
 * Remove previously shown studies used to aid in the analysis.
 */
CIQ.AnalystViews.prototype.hideIndicators = function () {
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
CIQ.AnalystViews.prototype.showIndicators = function () {
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
 * @return {*} a Y-axis number value or null if the price would not be displayed on the panel
 * @private
 */
CIQ.AnalystViews.prototype.getY = function (price) {
	var y = Math.floor(this.stx.pixelFromPrice(price, this.panel) + 0.5) + 0.5;
	return y < this.panel.top || y > this.panel.bottom ? null : y;
};

/**
 * Draw a line on the chart panel for the given price.
 *
 * @param {Number} price the value to display
 * @param {string} colorName name in `this.colors` to use when drawing the line
 * @param {boolean} [emphasize=false] if the price line should be thicker than normal
 */
CIQ.AnalystViews.prototype.priceLine = function (price, colorName, emphasize) {
	var y = this.getY(price);
	if (y === null) return;
	this.stx.plotLine(
		this.panel.left,
		this.panel.right,
		y,
		y,
		this.colors[colorName],
		"line",
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
CIQ.AnalystViews.prototype.priceLabel = function (price, colorName) {
	var y = this.getY(price);
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
CIQ.AnalystViews.prototype.removeInjections = function () {
	if (this.injections.drawXAxis) {
		this.stx.removeInjection(this.injections.drawXAxis);
		this.injections.drawXAxis = null;
	}

	if (this.injections.draw) {
		this.stx.removeInjection(this.injections.draw);
		this.injections.draw = null;
	}

	if (this.injections.mousemove) {
		this.stx.removeInjection(this.injections.mousemove);
		this.injections.mousemove = null;
	}
};

/**
 * Create injections to display lines and labels of the analysis.
 *
 * @param {Object} levels the chartlevels section of the analysis
 * @param {Number} direction a trend of bullish (positive) or bearish (negative)
 */
CIQ.AnalystViews.prototype.createDrawInjections = function (levels, direction) {
	var self = this;

	this.injections.drawXAxis = this.stx.append("drawXAxis", function () {
		var dataSet = self.panel.chart[self.panel.yAxis.whichSet || "dataSet"];
		if (!dataSet || !dataSet.length) return;
		var current = dataSet[dataSet.length - 1].Close;

		self.priceLine(
			levels.resistance3,
			"resistance",
			direction > 0 &&
				current > levels.resistance2 &&
				current < levels.resistance3
		);
		self.priceLine(
			levels.resistance2,
			"resistance",
			direction > 0 &&
				current > levels.resistance1 &&
				current < levels.resistance2
		);
		if (parseFloat(levels.resistance1) > levels.pivot) {
			self.priceLine(
				levels.resistance1,
				"resistance",
				direction > 0 && current < levels.resistance1
			);
		}
		self.priceLine(levels.pivot, "pivot");
		if (parseFloat(levels.support1) < levels.pivot) {
			self.priceLine(
				levels.support1,
				"support",
				direction < 0 && current > levels.support1
			);
		}
		self.priceLine(
			levels.support2,
			"support",
			direction < 0 && current < levels.support1 && current > levels.support2
		);
		self.priceLine(
			levels.support3,
			"support",
			direction < 0 && current < levels.support2 && current > levels.support3
		);
	});

	this.injections.draw = this.stx.append("draw", function () {
		self.priceLabel(levels.resistance3, "resistance");
		self.priceLabel(levels.resistance2, "resistance");
		if (parseFloat(levels.resistance1) > levels.pivot) {
			self.priceLabel(levels.resistance1, "resistance");
		}
		self.priceLabel(levels.pivot, "pivot");
		if (parseFloat(levels.support1) < levels.pivot) {
			self.priceLabel(levels.support1, "support");
		}
		self.priceLabel(levels.support2, "support");
		self.priceLabel(levels.support3, "support");
	});
};

/**
 * Create an injection to create events based on cursor position over analysis lines.
 *
 * @param {Object} levels the chartlevels section of the analysis
 * @param {string} trend a trend of 'bullish' or 'bearish'
 * @param {HTMLElement} node element to dispatch events from
 * @example
 * // create injection
 * analystviews.createMouseInjections({}, 1, analystviewsElement);
 *
 * // use this event to setup hover response
 * analystviewsElement.addEventListener('linehoverbegin', function(e) {
 * 	// e.detail.line;
 * 	// e.detail.lineY;
 * 	// e.detail.price;
 * });
 *
 * // use this event to teardown hover response
 * analystviewsElement.addEventListener('linehoverend', function(e) {
 * 	// e.detail.line;
 * });
 */
CIQ.AnalystViews.prototype.createMouseInjections = function (
	levels,
	trend,
	node
) {
	var getY = CIQ.AnalystViews.prototype.getY.bind(this);
	var lineHoverMargins = 10;
	var lineHoverCurrent;

	this.injections.mousemove = this.stx.append("mousemove", function () {
		var cy = this.cy; // `this` is the CIQ.ChartEngine instance
		var lineY;
		var eventParams;
		var lineYValues = {
			resistance3: getY(levels.resistance3),
			resistance2: getY(levels.resistance2),
			resistance1: getY(levels.resistance1),
			pivot: getY(levels.pivot),
			support1: getY(levels.support1),
			support2: getY(levels.support2),
			support3: getY(levels.support3)
		};

		if (levels.resistance1 == levels.pivot) delete lineYValues.resistance1;
		if (levels.support1 == levels.pivot) delete lineYValues.support1;

		for (var key in lineYValues) {
			lineY = lineYValues[key];

			if (lineY - lineHoverMargins < cy && cy < lineY + lineHoverMargins) {
				eventParams = {
					line: key,
					lineY: lineY,
					price: levels[key],
					trend: trend
				};
				break;
			}
		}

		if (!eventParams) {
			// cursor in blank space between lines
			if (lineHoverCurrent) {
				eventParams = { line: lineHoverCurrent };
				node.dispatchEvent(
					new CustomEvent("linehoverend", { detail: eventParams })
				);
			}

			lineHoverCurrent = null;
			return;
		}

		if (lineHoverCurrent == eventParams.line) return;

		// cursor left one hover and is starting a new one because the two lines are "touching"
		if (lineHoverCurrent) {
			node.dispatchEvent(
				new CustomEvent("linehoverend", { detail: { line: lineHoverCurrent } })
			);
		}

		// done in a zero timeout to ensure 'linehoverend' happens before 'linehoverbegin'
		setTimeout(function () {
			lineHoverCurrent = eventParams.line;
			node.dispatchEvent(
				new CustomEvent("linehoverbegin", { detail: eventParams })
			);
		});
	});
};

/**
 * Determine the current term from the layout.
 *
 * @returns {string} the name of the term or undefined
 */
CIQ.AnalystViews.prototype.getCurrentTerm = function () {
	var termMap = {
		30: "Intraday",
		day: "ST",
		week: "MT"
	};

	return termMap[this.stx.layout.interval];
};
