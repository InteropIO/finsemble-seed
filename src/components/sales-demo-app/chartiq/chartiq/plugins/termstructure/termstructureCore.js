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


import { CIQ, createTermStructureDataSegment } from "./termstructureRender.js";

let _css;
if (
	typeof define === "undefined" &&
	typeof module === "object" &&
	typeof require === "function"
) {
	_css = require("./termstructure.css");
} else if (typeof define === "function" && define.amd) {
	define(["./termstructure.css"], function (m) {
		_css = m;
	});
}

/**
 * Creates a term structure chart.
 *
 * ![Yield Curve](./img-Term-Structure.png)
 *
 * The chart shows the different instruments along the x-axis, either with uniform or scaled
 * spacing, and the values (ask, bid, yield, etc.) along the y-axis.
 *
 * The chart supports daily data for historical points and intra-day for the current day. The
 * chart expects data to be in `masterData` (and if the `useQuotefeed` parameter is specified,
 * leverages the quote feed to accomplish this). If for any reason the requested date is not
 * present in `masterData`, the chart attempts to find a nearby point (such as a weekday if the
 * requested day is a weekday). Otherwise, it displays an error to the user. If using a quote
 * feed, the chart sets the refresh interval to five seconds.
 *
 * There are also complementary UI elements that can be used on a term structure chart if you wish
 * to link it to a time series. See {@link CIQ.UI.CurveEdit} for instructions.
 *
 * See the {@tutorial Term Structures Introduction} tutorial for more details.
 *
 * @param {Object} params Configuration parameters.
 * @param {CIQ.ChartEngine} params.stx A reference to the chart engine.
 * @param {String} [params.spacingType] Initial spacing type, either "scaled" or "uniform".
 * 		Defaults to "scaled".
 * @param {String} [params.dataField] Initial data field. Defaults to "yield".
 * @param {Array} [params.fieldsToFormatAsPercent] Fields where the value should be formatted
 * 		as a percent. Defaults to `["yield"]`.
 * @param {Boolean} [params.drawShading] Specifies whether shading should initially be set or
 * 		not. Defaults to true.
 * @param {Boolean} [params.useQuotefeed] Specifies whether this `TermStructure` should use the
 * 		quote feed to attempt to find any quotes not present in `masterData`. Defaults to true.
 * @param {String} [params.initialDate] Initial curve will be the current chart symbol for the
 * 		current date. Specify a different starting date here.
 * @param {Boolean} [params.showcaseFreshPoints=true] Indicates whether recent data point
 * 		updates should be highlighted to call attention to the update. Recency is based on
 * 		whether the data point has been updated within the time span of the freshness timeout.
 * @param {Number} [params.pointFreshnessTimeout=10] The amount of time in minutes after which
 * 		data points go stale.
 * @param {Boolean} [params.showUpdateAnimations=true] Indicates whether to animate changes to
 * 		data point values.
 * @param {Boolean} [params.showUpdateStamp=true] Indicates whether an update time stamp should
 * 		appear when the mouse hovers over data points.
 * @param {Boolean} [params.showUpdateStampSeconds=true] Indicates whether the update time
 * 		stamp should display seconds.
 * @param {Number} [params.maxZoom=5] The maximum multiple to which the chart scales when
 * 		zooming. **Note:** Setting this number arbitrarily high does not enable arbitrary
 * 		zooming. Chart internals do not allow zooming beyond a (high) multiple based on the
 * 		computed maximum candle width.
 *
 * @constructor
 * @name CIQ.TermStructure
 * @since
 * - 7.3.0
 * - 7.4.0 Added the `showcaseFreshPoints`, `pointFreshnessTimeout`, `showUpdateAnimations`,
 * 		`showUpdateStamp`, `showUpdateStampSeconds`, and `maxZoom` parameters.
 */
CIQ.TermStructure = function (params) {
	if (!params || !params.stx) return;
	const stx = params.stx;
	const { layout } = stx;
	layout.candleWidth = 1; // initialize chart at base level zoom

	stx.termStructure = this;
	stx.plugins.termstructure = this;
	stx.allowScroll = true;
	stx.lineTravelSpacing = true;
	stx.maximumCandleWidth = params.maxZoom !== 0 ? params.maxZoom || 5 : 0;
	stx.controls.home = null; // currently only confuses things to have active
	stx.chart.defaultPlotField = "termStructure"; // ensure that methods in core respect `termStructure` as meaningful data field

	this.instrumentSpacing = {};
	this.stx = stx;
	this.subholder = stx.chart.panel.subholder; // area to absolute position updates on
	this.fieldsToFormatAsPercent = params.fieldsToFormatAsPercent || ["yield"];
	this.useQuotefeed = params.useQuotefeed !== false; // specifies to use quotefeed to try to fetch ticks not in masterData
	this.highlighted = { curve: null, instrument: null }; // remember the highlighted vertex point
	this.selectedPoints = [];
	this.showUpdateStampSeconds = params.showUpdateStampSeconds !== false;
	this.initialSettings = {
		spacingType: params.spacingType || "scaled",
		dataField: params.dataField || "yield",
		drawShading: params.drawShading !== false, // default to true
		showcaseFreshPoints: params.showcaseFreshPoints !== false, // default to true
		pointFreshnessTimeout: params.pointFreshnessTimeout || 10,
		showUpdateAnimations: params.showUpdateAnimations !== false,
		showUpdateStamp: params.showUpdateStamp !== false
	};
	CIQ.ensureDefaults(layout, this.initialSettings);

	// Keeps track of curves stored like so:
	// _main_curve: {
	// 	symbol: symbol,
	// 	Date: date,
	// },
	// [uuid] : { ... },
	this.curves = {};

	if (_css) {
		CIQ.addInternalStylesheet(_css, "termstructure.css");
		stx.clearStyles(); // clear out any cached shading values
		stx.draw();
	} else {
		const basePath = CIQ.ChartEngine.pluginBasePath + "termstructure/";
		CIQ.loadStylesheet(basePath + "termstructure.css", function () {
			stx.clearStyles(); // clear out any cached shading values
			stx.draw();
		});
	}

	// Overwrite default zoomSet but make it reversible. No injection used because this is an override, not an augmentation,
	// and since there is no injection point an app dev might already be making use of.
	const coreZoomSet = CIQ.ChartEngine.prototype.zoomSet;
	CIQ.ChartEngine.prototype.zoomSet = function (...args) {
		if (this.termStructure) this.termStructure.zoomSet(...args);
		else coreZoomSet.call(this, ...args);
	};

	if (this.useQuotefeed) stx.quoteDriver.resetRefreshInterval(5);
	stx.container.classList.add("stx-crosshair-on"); // turn on crosshair by default

	stx.callbackListeners.curveEdit = []; // instantiate to enable listening for and dispatching curveEdit events

	// override default createDataSegment with term structure version
	stx.prepend("createDataSegment", createTermStructureDataSegment);

	stx.prepend("correctIfOffEdge", () => true); // disable default behavior

	stx.prepend("renderYAxis", function (chart) {
		// don't need to reassign priceFormatter on every renderYAxis
		chart.yAxis.priceFormatter = function (stx, panel, price) {
			let { dataField } = stx.layout;
			let { fieldsToFormatAsPercent: fieldsToFormat } = stx.termStructure;
			if (!fieldsToFormat.includes(dataField)) return price;
			return price.toFixed(stx.chart.decimalPlaces) + "%";
		};
	});

	stx.prepend("headsUpHR", function () {
		return true; // disable default functionality
	});

	// Make sure main curve gets initialized
	stx.prepend("draw", function () {
		if (!this.termStructure.curves._main_curve && stx.chart.symbol) {
			this.termStructure.setMainCurve(this.chart.symbol);
			return true; // setMainCurve will invoke draw, cancel this one
		}
	});

	stx.append("draw", () => this.animateUpdates()); // arrow for lexical scoping

	stx.append("updateChartData", function (
		appendQuotes,
		chart,
		{ secondarySeries }
	) {
		if (!chart) chart = this.chart;
		const mostRecent = Array.isArray(appendQuotes)
			? appendQuotes.slice(-1)[0]
			: appendQuotes; // in case single quote
		const { dataSegment, symbol: chartSymbol } = chart;
		const { dataField, showUpdateAnimations } = layout;
		const {
			curves,
			updates: previousUpdates,
			calculatedPoints,
			pointToQuoteMap
		} = this.termStructure;

		if (!showUpdateAnimations) return;

		let currentDateTime = new Date();
		let updateData = {};

		for (let curve in curves) {
			let points = calculatedPoints[curve];
			if (!points || !points.length) continue;
			let updates = Array(points.length).fill(0); // default case is no changes
			let { symbol, Date: dateObj } = curves[curve];

			// only worry about curves that match the update
			if (
				(!secondarySeries && symbol !== chartSymbol) ||
				(secondarySeries && symbol !== secondarySeries)
			)
				continue;

			// only worry about today's curves
			if (dateObj.toDateString() === currentDateTime.toDateString()) {
				let newData = mostRecent.termStructure;

				for (let i = 0; i < points.length; i++) {
					let { instrument, [curve]: oldValue } = dataSegment[
						pointToQuoteMap[curve][i]
					];
					if (!newData[instrument]) continue; // instrument does not apply to curve
					// let oldValue = dataSegment[i][curve];
					let newValue =
						newData[instrument][dataField].value ||
						newData[instrument][dataField]; // backwards compatible
					let difference = oldValue - newValue;

					if (difference < 0) updates[i] = 1;
					if (difference > 0) updates[i] = -1;
				}
			}

			updateData[curve] = updates;
		}

		this.termStructure.updates = Object.assign({}, previousUpdates, updateData);
	});

	stx.append("rightClickHighlighted", function () {
		const { curve, instrument } = this.termStructure.highlighted;
		if (curve && instrument) {
			this.dispatch("curveEdit", {});
		}
	});

	// make sure line style stays up to date with theme changes
	stx.addEventListener("theme", function () {
		for (let curve in this.termStructure.curves) {
			delete this.termStructure.curves[curve].desaturatedColor;
		}
		this.draw();
	});

	// ensure chart stays up to date with symbol changes
	stx.addEventListener("symbolChange", function ({ symbol, action }) {
		if (this.termStructure.curves._main_curve && action === "master") {
			this.termStructure.setMainCurve(
				symbol,
				this.termStructure.curves._main_curve.Date
			);
		}
	});

	stx.addEventListener("tap", function () {
		const { termStructure } = this;
		const { highlighted, selectedPoints } = termStructure;
		if (highlighted.curve && highlighted.instrument) {
			let anyRemoved = false;
			termStructure.selectedPoints = selectedPoints.filter(
				({ curve, instrument }) => {
					if (
						curve === highlighted.curve &&
						instrument === highlighted.instrument
					) {
						anyRemoved = true;
						return false;
					}
					return true;
				}
			);
			if (!anyRemoved)
				termStructure.selectedPoints.push(Object.assign({}, highlighted));
			this.draw();
		}
	});

	stx.addEventListener("symbolChange", function () {
		this.termStructure.recordCurves();
	});

	stx.addEventListener("symbolImport", function ({ symbol }) {
		const { termStructure, layout, chart } = this;
		const { curves } = layout;
		if (!curves) return;
		const { main, secondary } = curves;

		const parseDate = (date) => (date === "live" ? new Date() : date);
		const isMainSymbol = symbol === chart.symbol;

		if (isMainSymbol) {
			termStructure.setCurveDate(parseDate(main.Date), "_main_curve", {
				noRecord: true
			});
		}

		secondary.forEach((record) => {
			for (let id in termStructure.curves) {
				let existingCurve = termStructure.curves[id];
				// Due to the load order of importLayout only call addCurve once secondary symbols have been "symbolImport"ed
				if (isMainSymbol && existingCurve.symbol !== chart.symbol) return;
				if (
					record.symbol === symbol &&
					!(
						record.symbol === existingCurve.symbol &&
						record.Date === existingCurve.Date.toDateString()
					)
				) {
					termStructure.addCurve(record.symbol, parseDate(record.Date), {
						color: record.color,
						noRecord: true
					});
				}
			}
		});

		// Make sure that unused series don't hang around
		const secondaryMatches = (series) => ({ symbol }) => series === symbol;

		for (let series in chart.series) {
			let seriesUsed = secondary.some(secondaryMatches(series));
			if (!seriesUsed) this.removeSeries(series);
		}
	});
};

/**
 * Copies the data of the current curve to the chart layout so that the curve information can
 * be reloaded from CIQ.ChartEngine.prototype.importLayout.
 *
 * @memberOf CIQ.TermStructure
 * @private
 * @since 7.5.0
 */
CIQ.TermStructure.prototype.recordCurves = function () {
	const { layout } = this.stx;
	const currentDateTime = new Date();

	let curves = { main: {}, secondary: [] };

	for (let id in this.curves) {
		let curve = this.curves[id];
		let date =
			curve.Date.toDateString() === currentDateTime.toDateString()
				? "live"
				: curve.Date.toDateString();

		if (id === "_main_curve") {
			curves.main.Date = date;
		} else {
			let secondaryCurve = {};
			secondaryCurve.symbol = curve.symbol;
			secondaryCurve.Date = date;
			secondaryCurve.color = curve.color;
			curves.secondary.push(secondaryCurve);
		}
	}

	layout.curves = curves;
	this.stx.changeOccurred("layout");
};

/**
 * Determines whether the user has either tapped or moused over a data point and, if so,
 * includes in the return object the time stamp of the last update of the data point. Called
 * by {@link CIQ.ChartEngine#findHighlights}.
 *
 * @param {CIQ.ChartEngine} stx The chart engine instance.
 * @param {Boolean} isTap If true, indicates that the user tapped the screen on a touch device,
 * 		and thus a wider radius is used to determine which objects have been highlighted.
 * @param {Boolean} clearOnly Clears highlights when set to true.
 * @return {Object} Object that specifies boolean values for `somethingChanged`,
 * 		`anyHighlighted`, and `stickyArgs` properties.
 *
 * @memberOf CIQ.TermStructure
 * @since 7.4.0
 */
CIQ.TermStructure.prototype.findHighlights = function (stx, isTap, clearOnly) {
	const { cx, cy, chart, layout } = stx;
	const { dataSegment } = chart;
	const { showUpdateStamp } = layout;
	const {
		highlighted,
		instruments,
		calculatedPoints,
		curves,
		pointToQuoteMap
	} = this;
	const radius =
		stx.preferences[isTap ? "highlightsTapRadius" : "highlightsRadius"]; // 30:10
	let somethingChanged = false;
	let anyHighlighted = false;
	let stickyArgs = null;

	function intersects(cx, cy, px, py) {
		return (
			cx - radius <= px &&
			cx + radius >= px &&
			cy - radius <= py &&
			cy + radius >= py
		);
	}

	// make sure coordinates of highlighted point are in scope to get consistent positioning
	function positionerWithCoordinates(px, py) {
		// custom positioner will get called with engine as context
		return function stickyPositioner(m) {
			let top = py + 10;
			let left = px + 10;

			if (top + m.offsetHeight > this.chart.canvasHeight - this.xaxisHeight)
				top = py - m.offsetHeight - 10;
			if (left + m.offsetWidth > this.chart.canvasWidth)
				left = px - m.offsetWidth - 10;

			m.style.top = top + "px";
			m.style.left = left + "px";
		};
	}

	if (!clearOnly) {
		let curveKeys = Object.keys(curves);
		for (let i = curveKeys.length - 1; i >= 0; i--) {
			let curve = curveKeys[i];
			let points = calculatedPoints[curve]; // Check more recently added curves first
			if (!points || !points.length) continue;
			for (let i = 0; i < points.length; i++) {
				let [px, py] = points[i];
				let { instrument } = dataSegment[pointToQuoteMap[curve][i]];

				if (intersects(cx, cy, px, py)) {
					anyHighlighted = true;
					if (
						curve !== highlighted.curve ||
						instrument !== highlighted.instrument
					) {
						somethingChanged = true;
						this.highlighted = { curve, instrument };

						let pointData = dataSegment[instruments.indexOf(instrument)];
						let timeStamp = pointData.timeStamps[curve];

						if (showUpdateStamp && timeStamp) {
							let message = this.formatTimeStamp(timeStamp);

							stickyArgs = {
								message,
								type: "termStructurePoint",
								noDelete: true,
								positioner: positionerWithCoordinates(px, py)
							};
						}
					}
					break;
				}
			}
			if (anyHighlighted) break;
		}
	}

	if (!anyHighlighted && highlighted.curve && highlighted.instrument) {
		this.highlighted = { curve: null, instrument: null };
		somethingChanged = true;
	}

	return { somethingChanged, anyHighlighted, stickyArgs };
};

/**
 * Formats a date and time for the time stamp that appears when the user's mouse hovers over a
 * data point on the chart. The time stamp shows the date and time when the data point was most
 * recently updated.
 *
 * Default formatting is "Updated YYYY-MM-dd HH:mm". Override this function to specify your own
 * date/time formatting.
 *
 * @param date A `Date` object or a value that can be accepted by the `Date` contructor
 * 		function.
 *
 * @memberOf CIQ.TermStructure
 * @since 7.4.0
 *
 * @example
 * var dt = new Date(date);
 * return "Last update at: " + (dt.getMonth() + 1) + "/" + dt.getDate() + "/" + dt.getFullYear();
 */
CIQ.TermStructure.prototype.formatTimeStamp = function (date) {
	if (typeof date !== "object") date = new Date(date);
	const formatUnit = (unit) => ("0" + unit).slice(-2);

	let month = formatUnit(date.getMonth() + 1);
	let day = formatUnit(date.getDate());
	let year = date.getFullYear();
	let hour = formatUnit(date.getHours());
	let minute = formatUnit(date.getMinutes());
	let second = formatUnit(date.getSeconds());

	let baseText = `${this.stx.translateIf("Updated")} ${year}-${month}-${day}`;
	let UTCHour = date.getUTCHours();
	if (UTCHour === 0 && minute === "00") return baseText;
	let displaySeconds = this.showUpdateStampSeconds;
	let textWithTime = `${baseText} ${hour}:${minute}`;
	if (displaySeconds) textWithTime += `:${second}`;
	return textWithTime;
};

/**
 * Sorts term structure instruments by their names.
 *
 * Instrument names take the form "n Category", where "n" is a number and "Category" is one of
 * DY, WK, MO, YR, ST, MT, and LT (day, week, month, year, short term, medium term, and long
 * term, respectively); for example, 30 DY, 3 MO, 10 YR.
 *
 * Categories sort in the order shown above; DY is lower in the sort order than WK, which is
 * lower than MO, and so forth. Within categories, instruments are sorted by the numerical
 * portion of the instrument name.
 *
 * The current sorting implementation supports yield curves and other common financial
 * instruments. However, term structures can include a wide variety of instruments and
 * instrument naming conventions.
 *
 * Depending on the instruments you are working with, you may wish to replace this function
 * with your own custom sorting function. Expect the function to be called with an unsorted
 * list of all instruments (no duplicates) from all active curves. Return an array sorted
 * however you desire.
 *
 * @param {Array} instruments The instruments to be rendered.
 * @return {Array} The instruments in sorted order.
 *
 * @memberOf CIQ.TermStructure
 * @since 8.0.0
 */
CIQ.TermStructure.sortInstruments = function (instruments) {
	return instruments.sort((l, r) => {
		let weight = ["DY", "WK", "MO", "YR", "ST", "MT", "LT"];
		let l1 = l.split(" "),
			r1 = r.split(" ");
		let diff =
			weight.indexOf(l1[l1.length - 1]) - weight.indexOf(r1[r1.length - 1]);
		if (diff) return diff > 0 ? 1 : -1;

		if (isNaN(l1[0])) return 1;
		if (isNaN(r1[0])) return -1;
		if (Number(l1[0]) < Number(r1[0])) return -1;
		if (Number(r1[0]) < Number(l1[0])) return 1;
		return 0;
	});
};

/**
 * Zooms the chart in and out. Overrides the default {@link CIQ.ChartEngine#zoomSet} method.
 * Called in response to user interaction.
 *
 * @memberOf CIQ.TermStructure
 * @since 7.4.0
 */
CIQ.TermStructure.prototype.zoomSet = function (newCandleWidth, chart) {
	const { stx, maxZoom } = this;
	const x = stx.cx;
	newCandleWidth = stx.constrainCandleWidth(newCandleWidth);
	CIQ.clearCanvas(stx.chart.tempCanvas, stx);
	if (newCandleWidth > maxZoom) newCandleWidth = maxZoom; // need better solution (that works better with ease machine)

	let points = this.calculatedPoints._main_curve; // just main curve for now
	let leftXBound = points[0][0];
	let rightXBound = points[points.length - 1][0];
	let curveTravel = rightXBound - leftXBound;
	let oldCandleWidth = stx.layout.candleWidth;
	let candleWidthDelta = newCandleWidth - oldCandleWidth;
	let originalTravel = curveTravel / oldCandleWidth; // aka travel with no zoom
	let previousTravel = originalTravel * oldCandleWidth; // aka travel with last zoom
	let newTravel = originalTravel * newCandleWidth;
	let travelDelta = newTravel - previousTravel;

	// three cases: mouse is left of curve, inside curve, or right of curve
	// if left: maintain left edge aka do nothing here (maintain micropixels)
	// if inside: keep curve relative to starting mouse position
	// if to right: maintain right edge (factor all travel delta into micropixels)
	if (candleWidthDelta) {
		if (x >= leftXBound && x <= rightXBound) {
			let relativePosition = x - leftXBound;
			let percentOfCurve = relativePosition / curveTravel;
			let pixelsToShift = travelDelta * percentOfCurve;
			if (candleWidthDelta) stx.micropixels -= pixelsToShift;
		} else if (x > rightXBound) {
			if (candleWidthDelta) stx.micropixels -= travelDelta;
		}
	}

	stx.setCandleWidth(newCandleWidth);
	chart.spanLock = false;
	stx.draw();
	stx.doDisplayCrosshairs();
	stx.updateChartAccessories();
	return true; // disable default behavior
};

/**
 * Calculates scaled spacing units. Because scaling the x-axis linearly with respect to time
 * can (depending on the term structure) result in a tight clustering of points near the
 * left-hand side of the chart, you may wish to "smooth" the differences. In the default
 * version, this has been done by calculating the time between the previous and current
 * instrument and raising that value to a 0.5 exponent.
 *
 * You may wish to replace this with your own scaling. To do so, simply overwrite this method
 * with your own version. It will be called with an array of instruments and should return an
 * object with each instrument as a key corresponding to a unit spacing value. The relative
 * differences between the units will be used to determine positioning along the x-axis. The
 * first instrument should have a unit spacing of 0.
 *
 * @param {Array} instruments An array of instruments for which the scaled spacing is
 * 		calculated.
 * @return {Object} An object containing the spacing units for the instruments.
 *
 * @memberOf CIQ.TermStructure
 * @since 7.3.0
 */
CIQ.TermStructure.prototype.calculateScaledSpacingUnits = function (
	instruments
) {
	let spacingUnits = {};

	function calculateValue(instrument) {
		let [value, type] = instrument.split(" ");
		value = parseInt(value);
		if (type === "WK") value *= 7;
		if (type === "MO") value *= 30;
		if (type === "YR") value *= 30 * 12;
		if (isNaN(value)) {
			// instrument might be "Short-Term, "Mid-Term", "Long-Term" rather than X MO, X YR, etc
			if (instrument[0] == "S") value = 3 * 360;
			if (instrument[0] == "M") value = 9 * 360;
			if (instrument[0] == "L") value = 20 * 360;
		}
		return value;
	}

	for (let i = 0; i < instruments.length; i++) {
		let instrument = instruments[i];
		let previousInstrument = instruments[i - 1];
		// no spacing for first entry
		if (i === 0) {
			spacingUnits[instrument] = 0;
			continue;
		}

		let value = calculateValue(instrument) - calculateValue(previousInstrument);
		value += 10; // adding constant prior to square root transformation adds subtle weighting to lhs instruments
		value = Math.pow(value, 0.5);
		spacingUnits[instrument] = value;
	}

	return spacingUnits;
};

/**
 * Calculates instrument spacing. If the `TermStructure` instance has a `spacingType` of
 * "uniform", instruments are spaced uniformly. If `spacingType` is set to "scaled", the
 * spacing is calculated from the "spacing units" returned from calling
 * `[calculateScaledSpacingUnits]{@link CIQ.TermStructure#calculateScaledSpacingUnits}`.
 *
 * @param {Object} chart The chart engine.
 * @param {Array} instruments An array of instruments for which the spacing units are
 * 		calculated.
 * @param {Number} bufferPercent The percentage by which the available display width for
 * 		spacing instruments is reduced on both sides of the chart.
 * @return {Object} An object containing the instrument spacing and curve width.
 *
 * @memberOf CIQ.TermStructure
 * @since 7.3.0
 */
CIQ.TermStructure.prototype.calculateInstrumentSpacing = function (
	chart,
	instruments,
	bufferPercent
) {
	let width = chart.width;
	let spacing = {};

	const type = this.stx.layout.spacingType;
	const zoom = this.stx.layout.candleWidth;

	spacing._curve_width = 0; // initialize aggregation value

	if (bufferPercent) {
		let buffer = width * bufferPercent;
		spacing._buffer = buffer;
		width = width - buffer * 2;
	}

	if (type === "uniform") {
		let candleWidth = width / (instruments.length - 1); // don't count first instrument
		for (let i = 0; i < instruments.length; i++) {
			let instrument = instruments[i];
			if (i === 0) spacing[instrument] = 0;
			else spacing[instrument] = candleWidth * zoom;
			spacing._curve_width += spacing[instrument];
		}
	}

	if (type === "scaled") {
		const treasurySpacingUnits = this.calculateScaledSpacingUnits(instruments);
		const totalUnits = Object.values(treasurySpacingUnits).reduce(
			(a, b) => a + b,
			0
		);

		for (let i = 0; i < instruments.length; i++) {
			let instrument = instruments[i];
			let spacingPercentage = treasurySpacingUnits[instrument] / totalUnits;
			spacing[instrument] = width * spacingPercentage * zoom;
			spacing._curve_width += spacing[instrument];
		}
	}

	return spacing;
};

/**
 * Returns the shading color for an instrument. Called once for each instrument (or instrument
 * shorthand) stored in `termStructure.instruments` (e.g., "1 MO", "2 MO", etc. for treasury
 * bills). By default, this method uses the canvasStyle` engine method to find a CSS class with
 * the name `stx_shading_` concatenated with the instrument or instrument shorthand with spaces
 * removed (e.g., `stx_shading_1MO`). As a result, shading styles can be defined in your
 * stylesheets.
 *
 * Feel free to override this method with your own color method. The shading renderer calls
 * `[getInstrumentShadingColor]{@link CIQ.TermStructure#getInstrumentShadingColor}` for each
 * instrument and expects an RBGA color to be returned.
 *
 * @param  {String} instrument The instrument identifier.
 * @return {String} A color code.
 *
 * @memberOf CIQ.TermStructure
 * @since 7.3.0
 */
CIQ.TermStructure.prototype.getInstrumentShadingColor = function (instrument) {
	let { backgroundColor } = this.stx.canvasStyle(
		`stx_shading_${instrument.replace(" ", "")}`
	);
	return backgroundColor;
};

/**
 * Updates the date in the chart title with the time the most recent update was received.
 *
 * @memberOf CIQ.TermStructure
 * @since 7.3.0
 */
CIQ.TermStructure.prototype.updateTitleDate = function () {
	let date = this.curves._main_curve.Date;
	let dateElement = document.querySelector(
		"cq-chart-title-date.ciq-chart-title-date"
	);
	let timeElement = document.querySelector(
		"cq-chart-title-date.ciq-chart-title-time"
	);
	// probably need to replace these with more to spec formatting later
	let formattedDate = date.toDateString();

	// check if day is same
	let showIntraday = formattedDate === new Date().toDateString();

	if (dateElement) dateElement.innerHTML = formattedDate;
	if (timeElement) {
		if (showIntraday) {
			// currently just displaying the time the update was processed, not when it originated
			timeElement.innerHTML = new Date().toLocaleTimeString();
			timeElement.style.visibility = "visible";
		} else {
			timeElement.style.visibility = "hidden";
		}
	}
};

/**
 * Animates chart updates.
 *
 * @memberOf CIQ.TermStructure
 * @since 7.3.0
 */
CIQ.TermStructure.prototype.animateUpdates = function () {
	if (!this.stx.layout.showUpdateAnimations) return;
	if (!this.updates) return;
	if (!this.updateIcons) this.updateIcons = [];
	this.updateIcons.forEach((icon) => icon.remove());
	this.updateIcons = [];

	const { curves, calculatedPoints, updates } = this;

	let allPoints = [];
	let allUpdates = [];
	Object.keys(curves).forEach((curveId) => {
		let curvePoints = calculatedPoints[curveId];
		let curveUpdates = updates[curveId];
		if (!(curvePoints && curveUpdates)) return;
		allPoints = allPoints.concat(curvePoints);
		allUpdates = allUpdates.concat(curveUpdates);
	});

	const subHolder = this.subholder;
	const left = this.stx.chart.left;

	// on animation end, function to remove icon so we can keep track of active icons
	const removeIcon = (icon) => () => {
		this.updateIcons = this.updateIcons.filter((update) => update !== icon);
		icon.remove();
	};

	for (let i = 0; i < allPoints.length; i++) {
		let update = allUpdates[i];
		if (!update) continue; // covers both 0 and undefined
		let [x, y] = allPoints[i];
		x -= left; // reset to original spacing values
		let iconContainer = document.createElement("div");
		iconContainer.classList.add("ciq-termstructure-price-change-container");
		let icon = document.createElement("div");
		icon.classList.add("ciq-termstructure-price-change");
		icon.classList.add(`ciq-termstructure-price-${update > 0 ? "up" : "down"}`);
		icon.classList.add("ciq-no-share"); // don't share animation divs
		iconContainer.classList.add("ciq-no-share");
		iconContainer.style.top = y + "px";
		iconContainer.style.left = x + "px";

		icon.addEventListener("animationend", removeIcon(icon));

		iconContainer.appendChild(icon);
		subHolder.appendChild(iconContainer);
		this.updateIcons.push(iconContainer);
	}

	this.updates = null; // so each update only gets displayed once
};

/**
 * Removes all active update animations. Call this function to programmatically stop the
 * animations associated with data point updates.
 * See {@link CIQ.TermStructure#setUpdateAnimations}.
 *
 * @memberof CIQ.TermStructure
 * @since 7.4.0
 */
CIQ.TermStructure.prototype.cancelUpdateAnimations = function () {
	const { updateIcons } = this;
	if (!updateIcons) return;
	updateIcons.forEach((icon) => icon.remove());
	this.updateIcons = [];
};

/**
 * Sets the spacing type and triggers a redraw. Use this instead of setting the value manually.
 *
 * @param {String} type Spacing type, should be either "scaled" or "uniform". If this parameter
 * 		is undefined, the function returns without doing anything.
 *
 * @memberOf CIQ.TermStructure
 * @since 7.3.0
 */
CIQ.TermStructure.prototype.setSpacingType = function (type) {
	if (!type) return;
	this.stx.layout.spacingType = type;
	this.stx.changeOccurred("layout");
	this.stx.draw();
};

/**
 * Sets the shading flag to the value of the `bool` parameter and triggers a redraw. Use this
 * function instead of setting the value manually.
 *
 * @param {Boolean} bool When true, a background color (shading) is drawn on the chart to
 * 		highlight horizontal sections of the graph; when false, the background color is not
 * 		drawn.
 *
 * @memberOf CIQ.TermStructure
 * @since 7.3.0
 *
 * @example
 * var shadingCheckbox = topNode.querySelector(".ciq-checkbox-shading");
 * if (shadingCheckbox) {
 *     shadingCheckbox.registerCallback(function(value) {
 *         stx.termStructure.setShading.call(stx.termStructure, value);
 *         shadingCheckbox.classList.toggle("ciq-active");
 *      });
 *     shadingCheckbox.currentValue = true; // Initially set check box to checked.
 * }
 */
CIQ.TermStructure.prototype.setShading = function (bool) {
	this.stx.layout.drawShading = bool;
	this.stx.changeOccurred("layout");
	this.stx.draw();
};

/**
 * Sets the data field for which values are plotted on the y-axis of the term structure and
 * then triggers a redraw of the chart. Use this function instead of setting the data field
 * manually. See {@link CIQ.UI.Layout#setDataField}.
 *
 * @param {String} field Defines the type of values plotted on the y-axis of the term structure
 * 		graph; for example, instrument yield or volatility.
 *
 * @memberOf CIQ.TermStructure
 * @since 7.3.0
 */
CIQ.TermStructure.prototype.setDataField = function (field) {
	this.stx.layout.dataField = field;
	this.stx.changeOccurred("layout");
	this.stx.draw();
};

/**
 * Sets the value of the chart engine layout parameter (see {@link CIQ.ChartEngine}) that
 * indicates whether or not to highlight fresh data points.
 *
 * @param {Boolean} value If true, highlight fresh data points; otherwise, do not highlight
 * 		fresh data points.
 *
 * @memberOf CIQ.TermStructure
 * @since 7.4.0
 */
CIQ.TermStructure.prototype.setShowcaseFreshPoints = function (value) {
	this.stx.layout.showcaseFreshPoints = value;
	this.stx.changeOccurred("layout");
	this.stx.draw();
};

/**
 * Sets the value of the chart engine layout parameter (see {@link CIQ.ChartEngine}) that
 * specifies the amount of time after which data points go stale.
 *
 * @param {Number} number The number of minutes for the time out.
 *
 * @memberOf CIQ.TermStructure
 * @since 7.4.0
 */
CIQ.TermStructure.prototype.setPointFreshnessTimeout = function (number) {
	this.stx.layout.pointFreshnessTimeout = number;
	this.stx.changeOccurred("layout");
	this.stx.draw();
};

/**
 * Sets the value of the chart engine layout parameter (see {@link CIQ.ChartEngine}) that
 * specifies whether to animate changes to data point values.
 *
 * @param {Boolean} value If true, animate changes; otherwise, do not animate changes.
 *
 * @memberOf CIQ.TermStructure
 * @since 7.4.0
 */
CIQ.TermStructure.prototype.setUpdateAnimations = function (value) {
	if (value === false) this.cancelUpdateAnimations();
	this.stx.layout.showUpdateAnimations = value;
	this.stx.changeOccurred("layout");
	this.stx.draw();
};

/**
 * Sets the value of the chart engine layout parameter (see {@link CIQ.ChartEngine}) that
 * specifies whether the update time stamp should appear for data points the user has tapped
 * or moused over.
 *
 * @param {Boolean} value If true, show the time stamp; otherwise, do not show the time stamp.
 *
 * @memberOf CIQ.TermStructure
 * @since 7.4.0
 */
CIQ.TermStructure.prototype.setShowUpdateStamp = function (value) {
	this.stx.layout.showUpdateStamp = value;
	this.stx.changeOccurred("layout");
	this.stx.draw();
};

/**
 * Deselects all data points that have been selected on a curve. Typically, data points are
 * selected to show curve spreads (see {@link CIQ.ChartEngine#drawTermStructureSpreads}).
 *
 * Called whenever a curve is removed or substantively modified; for example, when a new date
 * is selected for the curve.
 *
 * Defaults to the main curve.
 *
 * @param {String} [curveId="_main_curve"] Identifies the curve for which points are delected.
 * 		If not specified, points are deselected on the main curve.
 *
 * @memberOf CIQ.TermStructure
 * @since 7.5.0
 */
CIQ.TermStructure.prototype.deselectCurvePoints = function (
	curveId = "_main_curve"
) {
	const { selectedPoints } = this;
	this.selectedPoints = selectedPoints.filter(({ curve }) => curve !== curveId);
};

/**
 * Sets the date for which a term structure curve is drawn. If the value specified in `date` is
 * not found in `masterData` and, if `useQuotefeed` is set in this
 * [term structure]{@link CIQ.TermStructure}, this function attempts to use the quote feed to
 * load the requested date.
 *
 * For term structures that have multiple curves, the date is applied to the main curve if a
 * value is not specified in `curve`.
 *
 * @param {String} date The date for which the term structure curve is drawn.
 * @param {String} [curve] Identifies the curve to which `date` applies. Defaults to the main
 * 		term structure curve if an argument is not provided.
 * @param {Object} [params={}] Specifications related to the curve.
 * @param {Boolean} [params.noRecord] When true, prevents recording of the curve data.
 * 		This parameter is set to true when importing curves (for example, when reloading the
 * 		chart), which prevents the state of the curve midway through loading from becoming the
 * 		new source of truth.
 *
 * @memberOf CIQ.TermStructure
 * @since
 * - 7.3.0
 * - 7.5.0 Added `params` and `params.noRecord` parameters.
 *
 * @example
 *  var datepicker = topNode.querySelector("cq-datepicker");
 *  if (datepicker && stx.termStructure) {
 *      datepicker.registerCallback(function(date) {
 *          stx.termStructure.setCurveDate(date);
 *      });
 *  }
 */
CIQ.TermStructure.prototype.setCurveDate = function (date, curve, params = {}) {
	const { noRecord } = params;
	const termStructure = this;
	const { curves, stx } = termStructure;
	const { masterData } = stx;
	let dateObj = new Date(date);

	function updateDate() {
		if (!curve || curve === "_main_curve") {
			curves._main_curve.Date = dateObj;
		} else {
			curves[curve].Date = dateObj;
		}
		termStructure.deselectCurvePoints(curve);
		if (!noRecord) termStructure.recordCurves();
		stx.draw();
		stx.changeOccurred("layout");
	}

	// if something is wrong with masterData warn and don't do anything
	// if date isn't in masterData try to fetch it before switching values
	if (!(masterData && masterData[0] && masterData[0].DT)) {
		console.warn(
			"Cannot set curve date. `masterData` is missing or malformed."
		);
		return;
	} else if (
		this.useQuotefeed &&
		dateObj.getTime() < this.stx.chart.masterData[0].DT.getTime()
	) {
		stx.setRange(
			{ dtLeft: dateObj, periodicity: { period: 1, timeUnit: "day" } },
			function () {
				updateDate();
			}
		);
	} else {
		updateDate();
	}
};

/**
 * Used internally to set the main curve for the term structure chart. Called as an injection
 * on `symbolChange` events and as an injection on the draw loop (if `_main_curve` is not set).
 *
 * This method should rarely if ever be called directly.
 *
 * @param {String} symbol The main curve symbol. Set to whatever the main symbol is.
 * @param {String} date Date to use for the main curve.
 *
 * @memberOf CIQ.TermStructure
 * @private
 * @since 7.3.0
 */
CIQ.TermStructure.prototype.setMainCurve = function (symbol, date) {
	this.curves = {
		_main_curve: {
			symbol: symbol,
			Date: date ? new Date(date) : new Date()
		}
	};
	this.stx.draw();
};

/**
 * Adds a secondary curve to the term structure chart.
 *
 * @param {String} symbol The symbol of the secondary curve that will be added to the chart.
 * @param {Object} date The date for the new secondary curve.
 * @param {Object} params Specifications related to the secondary curve.
 * @param {String} [params.color] The color of the secondary curve.
 * @param {Boolean} [params.noRecord] When true, prevents recording of the secondary curve
 * 		data. This parameter is set to true when importing curves (for example, when reloading
 * 		a chart that has secondary curves), which prevents the state of the curve midway
 * 		through loading from becoming the new source of truth.
 * @param {Function} [cb] Function called when the data for the curve is available.
 *
 * @memberOf CIQ.TermStructure
 * @since 7.5.0
 */
CIQ.TermStructure.prototype.addCurve = function (symbol, date, params, cb) {
	const { stx, curves } = this;
	const { color, noRecord } = params;

	date = new Date(date.valueOf());

	for (let i in curves) {
		let curve = curves[i];
		if (
			curve.symbol === symbol &&
			curve.Date.toDateString() === date.toDateString()
		) {
			return; // don't add duplicate curves
		}
	}

	let newId = CIQ.uniqueID();
	this.curves[newId] = { symbol, color, Date: date, loading: true };

	const dataPresent = () => {
		this.curves[newId].loading = false;
		this.setCurveDate(date, newId, { noRecord });
		stx.createDataSet(); // make sure new series makes it into dataSet immediately
		stx.draw();
		if (cb) cb();
	};

	if (
		symbol !== curves._main_curve.symbol &&
		Object.keys(stx.chart.series).indexOf(symbol) === -1
	) {
		stx.addSeries(symbol, {}, dataPresent);
	} else {
		dataPresent();
	}
};

/**
 * Removes a secondary curve from the term structure chart.
 *
 * @param {String} [curveId] Identifies the curve to be removed. If the parameter is undefined
 * 		or identifies the main curve, this function returns without doing anything.
 *
 * @memberOf CIQ.TermStructure
 * @since 7.5.0
 */
CIQ.TermStructure.prototype.removeCurve = function (curveId) {
	if (!curveId || curveId === "_main_curve") return;
	const { stx, curves } = this;
	let curveSymbol = curves[curveId].symbol;
	let preserveSeries = false;

	for (let i in curves) {
		let curve = curves[i];
		if (i !== curveId && curve.symbol === curveSymbol) {
			preserveSeries = true;
		}
	}

	if (!preserveSeries) stx.removeSeries(curveSymbol);
	delete this.curves[curveId];
	this.deselectCurvePoints(curveId);
	this.recordCurves();
	stx.draw();
	stx.changeOccurred("layout");
};

/**
 * Modifies a curve on the term structure chart.
 *
 * @param {String} curveId Identifies the curve to be modified.
 * @param {Object} [params] Parameters that specify modifications of the curve. If this
 * 		parameter is undefined, the function returns without doing anything.
 * @param {String} [params.color] A new color to apply to the curve.
 *
 * @memberOf CIQ.TermStructure
 * @since 7.5.0
 */
CIQ.TermStructure.prototype.modifyCurve = function (curveId, params) {
	if (!params) return;
	const { curves, stx } = this;
	const { color } = params;
	if (!color) return;
	const curveToModify = curves[curveId];
	if (!curveToModify) return;
	curveToModify.color = color;
	curveToModify.desaturatedColor = null; // ensure it will get recalculated in draw method
	this.recordCurves();
	stx.draw();
	stx.changeOccurred("layout");
};
