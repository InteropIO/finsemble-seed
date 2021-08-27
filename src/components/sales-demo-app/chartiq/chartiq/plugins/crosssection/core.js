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


import {
	CIQ,
	createCrossSectionDataSegment,
	pivotRecordFields
} from "./render.js";

let _css;
if (
	typeof define === "undefined" &&
	typeof module === "object" &&
	typeof require === "function"
) {
	_css = require("./crosssection.css");
} else if (typeof define === "function" && define.amd) {
	define(["./crosssection.css"], function (m) {
		_css = m;
	});
}

/**
 * Creates a cross-sectional chart; meaning, a chart of fields stored within a matrix object in a
 * data set record. A popular use case for this would be a term structure chart.
 *
 * ![Yield Curve](./img-Term-Structure.png)
 * <span class="figure-caption"><b>Figure.</b> Term structure chart with comparison and historical
 * curves, crosshairs, and heads up display.</span>
 *
 * A term structure compares the value of related financial instruments. For example, the U.S.
 * Treasury yield curve is a term structure that compares the interest rates of Treasury
 * securities that have different maturity dates (see image above).
 *
 * A cross section chart shows one data field on the x&#8209;axis &mdash; with either
 * uniform or scaled spacing &mdash; and another (typically a value) on the y&#8209;axis. A chart
 * consists of a main curve for a primary entity (such as the U.S. Treasury) and optional
 * comparison curves for other entities or historical curves for the primary entity. (Entities
 * create or provide instruments or serve as a means of relating instruments.) In addition to a
 * main curve, an entity may also produce subcurves, such as a series of instruments with different
 * terms.
 *
 * The chart supports daily data for historical points and intra-day data for the current date.
 * The chart expects data to be in `masterData`. If the `useQuotefeed` parameter is specified, the
 * chart leverages the quote feed to update `masterData` with the required date range. If for any
 * reason the requested date is not present in `masterData`, the chart attempts to find a nearby
 * point, such as a weekday if the requested date is a weekday. Otherwise, the chart displays an
 * error to the user. If using a quote feed, the chart sets the refresh interval to five seconds.
 *
 * Cross section charts support "live" dates and, for historical curves, relative dates (see
 * [setCurveDate]{@link CIQ.CrossSection#setCurveDate}).
 *
 * Cross section charts can be linked to time series charts for in-depth data analysis (see
 * {@link CIQ.UI.CurveEdit}).
 *
 * For more information on term structures, see the {@tutorial Term Structures Introduction}
 * tutorial.
 *
 * @param {object} params Configuration parameters.
 * @param {CIQ.ChartEngine} params.stx A reference to the chart engine.
 * @param {string} [params.dataSetField="termStructure"] Field in the data set record to be used
 * 		as the source of data for the cross section chart.
 * @param {string} [params.spacingType="scaled"] Initial spacing type, either "scaled" or
 * 		"uniform".
 * @param {string} [params.yaxisField="yield"] Initial y-axis data field. See also
 * 		[setYaxisField]{@link CIQ.CrossSection#setYaxisField}.
 * @param {string} [params.xaxisField] Initial x-axis data field. See also
 * 		[setXaxisField]{@link CIQ.CrossSection#setXaxisField}.
 * @param {string} [params.groupField] Initial grouping field. See
 * 		[setGroupField]{@link CIQ.CrossSection#setGroupField} for more information.
 * @param {string} [params.aggOperator="first"] Initial aggregation operator. See
 * 		[setYaxisfield]{@link CIQ.CrossSection#setYaxisField} for more information.
 * @param {object} [params.filter] Initial filtering object. See
 * 		[setFilters]{@link CIQ.CrossSection#setFilters} for more information.
 * @param {function|boolean} [params.sortFunction] Custom function to sort results, overriding the
 * 		default lexical/numeric sort. Set to false to turn off sorting; true, to use the default
 * 		sort.
 * @param {function} [params.formatter=CIQ.capitalize] Function to format labels in dropdowns and
 * 		heads-up display (HUD).
 * @param {function} [params.decimalPlaces] Function to determine the number of decimal places for
 * 		a numeric value. Function can take a `field` argument to allow more customization per field.
 * @param {string[]} [params.fieldsToFormatAsPercent=["yield"]] Fields for which values are
 * 		formatted as percentages.
 * @param {boolean} [params.drawShading=true] Specifies whether to draw the chart background
 * 		shading which visually groups instruments.
 * @param {boolean} [params.useQuotefeed=true] Specifies whether this cross section should use
 * 		the quote feed to attempt to find any quotes not present in `masterData`.
 * @param {boolean} [params.showcaseFreshPoints=true] Specifies whether fresh data point updates
 * 		should be highlighted to call attention to the update. Data point updates are fresh if
 * 		they occur within the current time minus `params.pointFreshnessTimeout`.
 * @param {number} [params.pointFreshnessTimeout=10] The amount of time in minutes after which
 * 		data points go stale.
 * @param {boolean} [params.showUpdateAnimations=true] Specifies whether to animate changes to
 * 		data point values.
 * @param {boolean} [params.showUpdateStamp=true] Specifies whether an update time stamp should
 * 		appear when the mouse hovers over data points.
 * @param {boolean} [params.showUpdateStampSeconds=true] Specifies whether the update time
 * 		stamp should display seconds (see `params.showUpdateStamp`).
 * @param {string} [params.symbolInputType="Entity"] The type of "symbol" being entered into the
 *  	lookup.
 * @param {number} [params.maxZoom=5] The maximum multiple to which the chart scales when
 * 		zooming. **Note:** Setting this number arbitrarily high does not enable arbitrary
 * 		zooming. Chart internals do not allow zooming beyond a (high) multiple based on the
 * 		computed maximum candle width.
 *
 * @constructor
 * @name CIQ.CrossSection
 * @since
 * - 7.3.0
 * - 7.4.0 Added the `showcaseFreshPoints`, `pointFreshnessTimeout`, `showUpdateAnimations`,
 * 		`showUpdateStamp`, `showUpdateStampSeconds`, and `maxZoom` parameters.
 * - 8.3.0 Renamed the class from `CIQ.TermStructure`. Added the `dataSetField`, `yaxisField`,
 * 		`xaxisField`, `groupField`, `aggOperator`, `filter`, `sortFunction`, `formatter`, and
 * 		`decimalPlaces` parameters. Removed the `dataField` parameter.
 */
CIQ.CrossSection = function (params) {
	if (!params || !params.stx) return;
	const stx = params.stx;
	const { layout } = stx;
	layout.candleWidth = 1; // initialize chart at base level zoom

	stx.crossSection = this;
	stx.plugins.crossSection = this;
	stx.allowScroll = true;
	stx.lineTravelSpacing = true;
	stx.maximumCandleWidth = params.maxZoom !== 0 ? params.maxZoom || 5 : 0;
	stx.controls.home = null; // currently only confuses things to have active
	stx.chart.defaultPlotField = params.dataSetField || "termStructure"; // ensure that methods in core respect field as meaningful data field
	stx.dontRoll = true;

	this.instrumentSpacing = {};
	this.stx = stx;
	this.subholder = stx.chart.panel.subholder; // area to absolute position updates on
	this.fieldsToFormatAsPercent = params.fieldsToFormatAsPercent || ["yield"];
	this.sortFunction = params.sortFunction || params.sortFunction !== false;
	this.useQuotefeed = params.useQuotefeed !== false; // specifies to use quotefeed to try to fetch ticks not in masterData
	this.highlighted = { curve: null, instrument: null }; // remember the highlighted vertex point
	this.selectedPoints = [];
	this.showUpdateStampSeconds = params.showUpdateStampSeconds !== false;
	this.symbolInputType = params.symbolInputType || "Entity";
	this.formatter = params.formatter || CIQ.capitalize;
	this.decimalPlaces = params.decimalPlaces || (() => 2);
	this.initialSettings = {
		spacingType: params.spacingType || "scaled",
		yaxisField: params.yaxisField || "yield",
		xaxisField: params.xaxisField || "",
		groupField: params.groupField || "",
		aggOperator: params.aggOperator || "first",
		filter: Object.assign({}, params.filter),
		drawShading: params.drawShading !== false, // default to true
		showcaseFreshPoints: params.showcaseFreshPoints !== false, // default to true
		pointFreshnessTimeout: params.pointFreshnessTimeout || 10,
		showUpdateAnimations: params.showUpdateAnimations !== false,
		showUpdateStamp: params.showUpdateStamp !== false
	};
	this.currentDate = new Date(); // for checking for date rollover
	CIQ.ensureDefaults(layout, this.initialSettings);
	if (CIQ.UI) CIQ.UI.activatePluginUI(stx, "crosssection");

	// Keeps track of curves stored like so:
	// _main_curve: {
	// 	symbol: symbol,
	// 	Date: date,
	// },
	// [uuid] : { ... },
	this.curves = {};

	if (_css) {
		CIQ.addInternalStylesheet(_css, "crosssection.css");
		stx.clearStyles(); // clear out any cached shading values
		stx.draw();
	} else {
		const basePath = CIQ.ChartEngine.pluginBasePath + "crosssection/";
		CIQ.loadStylesheet(basePath + "crosssection.css", function () {
			stx.clearStyles(); // clear out any cached shading values
			stx.draw();
		});
	}

	stx.callbackListeners.curveChange = [];

	// Overwrite default zoomSet but make it reversible. No injection used because this is an override, not an augmentation,
	// and since there is no injection point an app dev might already be making use of.
	const coreZoomSet = CIQ.ChartEngine.prototype.zoomSet;
	CIQ.ChartEngine.prototype.zoomSet = function (...args) {
		if (this.crossSection) this.crossSection.zoomSet(...args);
		else coreZoomSet.call(this, ...args);
	};

	if (this.useQuotefeed) stx.quoteDriver.resetRefreshInterval(5);
	stx.container.classList.add("stx-crosshair-on"); // turn on crosshair by default

	stx.callbackListeners.curveEdit = []; // instantiate to enable listening for and dispatching curveEdit events

	// override default createDataSegment with custom version
	stx.prepend("createDataSegment", createCrossSectionDataSegment);

	stx.prepend("correctIfOffEdge", () => true); // disable default behavior

	stx.prepend("renderYAxis", function (chart) {
		// need to reassign priceFormatter on every renderYAxis
		chart.yAxis.priceFormatter = function (stx, panel, price) {
			let { yaxisField } = stx.layout;
			let { fieldsToFormatAsPercent: fieldsToFormat } = stx.crossSection;
			if (!fieldsToFormat.includes(yaxisField)) {
				if (typeof price === "number")
					return stx.formatYAxisPrice(price, chart.panel, null, chart.yAxis);
				return price;
			}
			return price.toFixed(stx.chart.decimalPlaces) + "%";
		};
	});

	// Make sure main curve gets initialized
	stx.prepend("draw", function () {
		const { crossSection } = this;
		const currentDate = new Date();

		if (crossSection.currentDate.getDate() !== currentDate.getDate()) {
			const { curves } = crossSection;
			crossSection.currentDate = currentDate;
			let anyChanges = false;

			for (let i in curves) {
				let curve = curves[i];

				if (curve.live) {
					curve.Date = currentDate;
					anyChanges = true;
				}
			}

			if (anyChanges) {
				crossSection.recalculateRelativeDates({ noDraw: true });
				stx.dispatch("curveChange");
			}
		}

		if (!crossSection.curves._main_curve && stx.chart.symbol) {
			crossSection.setMainCurve(this.chart.symbol);
			return true; // setMainCurve will invoke draw, cancel this one
		}
	});

	stx.append("draw", () => stx.crossSection.animateUpdates()); // arrow for lexical scoping

	stx.append(
		"updateChartData",
		function (appendQuotes, chart, { secondarySeries }) {
			if (!chart) chart = this.chart;
			const mostRecent = Array.isArray(appendQuotes)
				? appendQuotes.slice(-1)[0]
				: appendQuotes; // in case single quote
			const { dataSegment, symbol: chartSymbol } = chart;
			const { yaxisField, showUpdateAnimations } = layout;
			const {
				curves,
				updates: previousUpdates,
				calculatedPoints,
				pointToQuoteMap
			} = this.crossSection;

			if (!showUpdateAnimations) return;

			let currentDateTime = new Date();
			let updateData = {};

			for (let curve in curves) {
				let points = calculatedPoints[curve];
				if (!points || !points.length || !pointToQuoteMap[curve]) continue;
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
					let newData = this.crossSection.pivotRecord(
						mostRecent[chart.defaultPlotField],
						curve
					);

					for (let i = 0; i < points.length; i++) {
						let { instrument, [points[i][2]]: oldValue } = dataSegment[
							pointToQuoteMap[curve][i]
						];
						if (!newData[instrument]) continue; // instrument does not apply to curve
						// let oldValue = dataSegment[i][curve];
						let newValue = newData[instrument][yaxisField];
						if (typeof newValue === "undefined") {
							newValue = newData[instrument][points[i][2]];
							if (newValue) newValue = newValue[yaxisField];
						}
						if (typeof newValue === "object") newValue = newValue.value;

						let difference = oldValue - newValue;

						if (difference < 0) updates[i] = 1;
						if (difference > 0) updates[i] = -1;
					}
				}

				updateData[curve] = updates;
			}

			this.crossSection.updates = Object.assign(
				{},
				previousUpdates,
				updateData
			);
		}
	);

	stx.append("rightClickHighlighted", function () {
		const { curve, subcurve, instrument } = this.crossSection.highlighted;
		if (curve && instrument) {
			const myCurve = this.crossSection.curves[curve];
			if (!myCurve.subcurves || myCurve.subcurves[subcurve].symbol)
				this.dispatch("curveEdit", {});
		}
	});

	// make sure line style stays up to date with theme changes
	stx.addEventListener("theme", function () {
		for (let curve in this.crossSection.curves) {
			delete this.crossSection.curves[curve].desaturatedColor;
		}
		this.draw();
	});

	// ensure chart stays up to date with symbol changes
	stx.addEventListener("symbolChange", function ({ symbol, action }) {
		const { crossSection } = this;
		const { curves } = crossSection;
		if (curves._main_curve && action === "master") {
			crossSection.setMainCurve(
				symbol,
				!curves._main_curve.live && curves._main_curve.Date
			);
		}
		crossSection.recordCurves();
	});

	stx.addEventListener("tap", function () {
		const { crossSection } = this;
		const { highlighted, selectedPoints } = crossSection;
		if (highlighted.curve && highlighted.instrument) {
			let anyRemoved = false;
			crossSection.selectedPoints = selectedPoints.filter(
				({ curve, subcurve, instrument }) => {
					if (
						curve === highlighted.curve &&
						subcurve === highlighted.subcurve &&
						instrument === highlighted.instrument
					) {
						anyRemoved = true;
						return false;
					}
					return true;
				}
			);
			if (!anyRemoved)
				crossSection.selectedPoints.push(Object.assign({}, highlighted));
			this.draw();
		}
	});

	stx.addEventListener("symbolImport", function ({ symbol }) {
		const { crossSection, layout, chart } = this;
		const { curves, filter } = layout;
		if (!curves) return;
		const { main, secondary } = curves;

		CIQ.CrossSection.formatFilter(filter);

		const isMainSymbol = symbol === chart.symbol;

		if (isMainSymbol) {
			crossSection.setCurveDate(main.Date, "_main_curve", {
				noRecord: true
			});
			if (main.color) {
				crossSection.modifyCurve("_main_curve", {
					color: main.color,
					noRecord: true
				});
			}
		}

		secondary.forEach((record) => {
			for (let id in crossSection.curves) {
				let existingCurve = crossSection.curves[id];
				// Due to the load order of importLayout only call addCurve once secondary symbols have been "symbolImport"ed
				if (isMainSymbol && existingCurve.symbol !== chart.symbol) return;
				if (
					record.symbol === symbol &&
					!(
						record.symbol === existingCurve.symbol &&
						record.Date === existingCurve.Date.toDateString()
					)
				) {
					crossSection.addCurve(record.symbol, record.Date, {
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
 * @memberof CIQ.CrossSection
 * @private
 * @since
 * - 7.5.0
 * - 8.3.0 Renamed from `CIQ.TermStructure.prototype.recordCurves`.
 */
CIQ.CrossSection.prototype.recordCurves = function () {
	const { layout } = this.stx;
	let curves = { main: {}, secondary: [] };

	for (let id in this.curves) {
		let curve = this.curves[id];
		let date = curve.live ? "live" : curve.Date.toDateString();

		if (id === "_main_curve") {
			curves.main.Date = date;
			curves.main.color = curve.color;
		} else {
			let secondaryCurve = {};
			secondaryCurve.symbol = curve.symbol;
			secondaryCurve.Date = curve.relativeDate || date;
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
 * @param {boolean} isTap If true, indicates that the user tapped the screen on a touch device,
 * 		and thus a wider radius is used to determine which objects have been highlighted.
 * @param {boolean} clearOnly Clears highlights when set to true.
 * @return {object} Object that specifies boolean values for `somethingChanged`,
 * 		`anyHighlighted`, and `stickyArgs` properties.
 *
 * @memberof CIQ.CrossSection
 * @since
 * - 7.4.0
 * - 8.3.0 Renamed from `CIQ.TermStructure.prototype.findHighlights`.
 */
CIQ.CrossSection.prototype.findHighlights = function (stx, isTap, clearOnly) {
	const { cx, cy, chart, layout, openDialog } = stx;
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
		if (
			cx - radius <= px &&
			cx + radius >= px &&
			cy - radius <= py &&
			cy + radius >= py
		)
			return Math.pow(px - cx, 2) + Math.pow(py - cy, 2);
		return -1;
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

	if (!clearOnly && openDialog === "") {
		let proximityValue = radius * radius * layout.candleWidth;
		let curveKeys = Object.keys(curves);
		for (let j = curveKeys.length - 1; j >= 0; j--) {
			let curve = curveKeys[j];
			let points = calculatedPoints[curve]; // Check more recently added curves first
			if (!points || !points.length || !pointToQuoteMap[curve]) continue;
			for (let i = 0; i < points.length; i++) {
				let [px, py, subcurve] = points[i];
				let { instrument } = dataSegment[pointToQuoteMap[curve][i]];

				let intersection = intersects(cx, cy, px, py);
				if (intersection !== -1 && intersection < proximityValue) {
					proximityValue = intersection;
					anyHighlighted = true;

					somethingChanged = true;
					this.highlighted = { curve, subcurve, instrument };

					let pointData = dataSegment[instruments.indexOf(instrument)];
					let timeStamp = pointData.timeStamps[subcurve || curve];

					if (showUpdateStamp && timeStamp) {
						let message = this.formatTimeStamp(timeStamp);

						stickyArgs = {
							message,
							type: "crossSectionPoint",
							noDelete: true,
							positioner: positionerWithCoordinates(px, py)
						};
					}
					if (proximityValue === 0) break;
				}
			}
			if (proximityValue === 0) break;
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
 * @param {Date|string|number} date A `Date` object or a value that can be accepted by the
 * 		`Date` constructor function.
 *
 * @memberof CIQ.CrossSection
 * @since
 * - 7.4.0
 * - 8.3.0 Renamed from `CIQ.TermStructure.prototype.formatTimeStamp`.
 *
 * @example
 * var dt = new Date(date);
 * return "Last update at: " + (dt.getMonth() + 1) + "/" + dt.getDate() + "/" + dt.getFullYear();
 */
CIQ.CrossSection.prototype.formatTimeStamp = function (date) {
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
 * **Deprecated.** Use `config.plugins.crossSection.sortFunction`, which is contained in the chart
 * configuration object. See the *sample-template-term-structure.html* template for an example. See
 * also the <a href="tutorial-Chart%20Configuration.html" target="_blank">Chart Configuration</a>
 * tutorial.
 *
 * Sorts cross section instruments by their names.
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
 * instruments. However, cross sections can include a wide variety of instruments and
 * instrument naming conventions.
 *
 * Depending on the instruments you are working with, you may wish to replace this function
 * with your own custom sorting function. Expect the function to be called with an unsorted
 * list of all instruments (no duplicates) from all active curves. Return an array sorted
 * however you desire.
 *
 * @param {array} instruments The instruments to be rendered.
 * @return {array} The instruments in sorted order.
 *
 * @memberof CIQ.CrossSection
 * @static
 * @deprecated Use `config.plugins.crossSection.sortFunction`, which is contained in the chart
 * 		configuration object.
 * @since
 * - 8.0.0
 * - 8.3.0 Renamed from `CIQ.TermStructure.sortInstruments`. Deprecated.
 */
CIQ.CrossSection.sortInstruments = function (instruments) {
	console.log(
		"CIQ.CrossSection.sortInstruments() has been deprecated.  Use CIQ.CrossSection#sortFunction defined in config in term structure template instead."
	);
	return instruments.sort((l, r) => {
		let weight = ["DY", "WK", "MO", "YR", "ST", "MT", "LT"];
		let l1 = l.split("\u200c")[0].split(" "),
			r1 = r.split("\u200c")[0].split(" ");
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
 * Helper function for getting the "value" property of an object or number. Used for backwards
 * compatibility.
 *
 * @param {object|number} maybeObj The object or number for which the "value" property is returned.
 * @return The "value" property of `maybeObj`. If the property doesn't exist, `maybeObj` is
 * 		returned unchanged.
 *
 * @memberof CIQ.CrossSection
 * @private
 * @since 8.3.0
 */
CIQ.CrossSection.getValueFromMaybeObject = function (maybeObj) {
	if (maybeObj === undefined) return;
	return maybeObj.hasOwnProperty("value") ? maybeObj.value : maybeObj;
};

/**
 * Zooms the chart in and out. Overrides the default {@link CIQ.ChartEngine#zoomSet} method.
 * Called in response to user interaction.
 *
 * @memberof CIQ.CrossSection
 * @since
 * - 7.4.0
 * - 8.3.0 Renamed from `CIQ.TermStructure.prototype.zoomSet`.
 */
CIQ.CrossSection.prototype.zoomSet = function (newCandleWidth, chart) {
	const { stx, maxZoom } = this;
	const x = stx.cx;
	newCandleWidth = stx.constrainCandleWidth(newCandleWidth);
	CIQ.clearCanvas(stx.chart.tempCanvas, stx);
	if (newCandleWidth > maxZoom) newCandleWidth = maxZoom; // need better solution (that works better with ease machine)

	let points = this.calculatedPoints._main_curve; // just main curve for now
	if (!points || !points.length) return;
	let leftXBound = points[0][0];
	if (!points || !points.length || !points[0] || !points[0].length) return true;
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
 * can result in a tight clustering of points at certain points along the axis, you may wish
 * to "smooth" the differences. In the default version, this has been done by calculating the
 * time between the previous and current instrument and raising that value to a 0.5 exponent.
 *
 * You may wish to replace this with your own scaling. To do so, simply overwrite this method
 * with your own version. It will be called with an array of instruments and should return an
 * object with each instrument as a key corresponding to a unit spacing value. The relative
 * differences between the units will be used to determine positioning along the x-axis. The
 * first instrument should have a unit spacing of 0.
 *
 * @param {array} instruments An array of instruments for which the scaled spacing is
 * 		calculated.
 * @return {object} An object containing the spacing units for the instruments.
 *
 * @memberof CIQ.CrossSection
 * @since
 * - 7.3.0
 * - 8.3.0 Renamed from `CIQ.TermStructure.prototype.calculateScaledSpacingUnits`.
 */
CIQ.CrossSection.prototype.calculateScaledSpacingUnits = function (
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

	let isDate = false;
	for (let i = 0; i < instruments.length; i++) {
		let instrument = instruments[i];
		let previousInstrument = instruments[i - 1];
		// no spacing for first entry
		if (i === 0) {
			spacingUnits[instrument] = 0;
			if (new Date(instrument).toLocaleDateString() === instrument)
				isDate = true;
			continue;
		}

		if (isDate) {
			instrument = new Date(instrument).getTime();
			previousInstrument = new Date(previousInstrument).getTime();
		}
		let value = parseFloat(instrument) - parseFloat(previousInstrument);
		if (this.stx.chart.defaultPlotField === "termStructure") {
			value = calculateValue(instrument) - calculateValue(previousInstrument);
			value += 10; // adding constant prior to square root transformation adds subtle weighting to lhs instruments
			value = Math.pow(value, 0.5);
		}
		spacingUnits[instruments[i]] = value || 1;
	}

	return spacingUnits;
};

/**
 * Calculates instrument spacing. If the `CrossSection` instance has a `spacingType` of
 * "uniform", instruments are spaced uniformly. If `spacingType` is set to "scaled", the
 * spacing is calculated from the "spacing units" returned from calling
 * `[calculateScaledSpacingUnits]{@link CIQ.CrossSection#calculateScaledSpacingUnits}`.
 *
 * @param {object} chart The chart engine.
 * @param {array} instruments An array of instruments for which the spacing units are
 * 		calculated.
 * @param {number} bufferPercent The percentage by which the available display width for
 * 		spacing instruments is reduced on both sides of the chart.
 * @return {object} An object containing the instrument spacing and curve width.
 *
 * @memberof CIQ.CrossSection
 * @since
 * - 7.3.0
 * - 8.3.0 Renamed from `CIQ.TermStructure.prototype.calculateInstrumentSpacing`.
 */
CIQ.CrossSection.prototype.calculateInstrumentSpacing = function (
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
		const spacingUnits = this.calculateScaledSpacingUnits(instruments);
		const totalUnits = Object.values(spacingUnits).reduce((a, b) => a + b, 0);

		for (let i = 0; i < instruments.length; i++) {
			let instrument = instruments[i];
			let spacingPercentage = spacingUnits[instrument];
			if (spacingPercentage) spacingPercentage /= totalUnits;
			spacing[instrument] = width * spacingPercentage * zoom;
			spacing._curve_width += spacing[instrument];
		}
	}

	return spacing;
};

/**
 * Returns the shading color for an instrument. Called once for each instrument (or instrument
 * shorthand) stored in `instruments` property of the defaultPlotField (e.g., "1 MO", "2 MO", etc.
 * for treasury bills). By default, this method uses the canvasStyle` engine method to find a
 * CSS class with the name `stx_shading_` concatenated with the instrument or instrument shorthand
 * with spaces removed (e.g., `stx_shading_1MO`). As a result, shading styles can be defined in
 * your stylesheets.
 *
 * Feel free to override this method with your own color method. The shading renderer calls
 * `[getInstrumentShadingColor]{@link CIQ.CrossSection#getInstrumentShadingColor}` for each
 * instrument and expects an RBGA color to be returned.
 *
 * @param {string} instrument The instrument identifier.
 * @return {string} A color code.
 *
 * @memberof CIQ.CrossSection
 * @since
 * - 7.3.0
 * - 8.3.0 Renamed from `CIQ.TermStructure.prototype.getInstrumentShadingColor`.
 */
CIQ.CrossSection.prototype.getInstrumentShadingColor = function (instrument) {
	let { backgroundColor } = this.stx.canvasStyle(
		`stx_shading_${instrument.replace(" ", "")}`
	);
	return backgroundColor;
};

/**
 * Updates the date in the chart title with the time the most recent update was received.
 *
 * @memberof CIQ.CrossSection
 * @since
 * - 7.3.0
 * - 8.3.0 Renamed from `CIQ.TermStructure.prototype.updateTitleDate`.
 */
CIQ.CrossSection.prototype.updateTitleDate = function () {
	const { Date: date, live } = this.curves._main_curve;
	const { stx } = this;
	const dateElement = document.querySelector(
		"cq-chart-title-date.ciq-chart-title-date"
	);
	const timeElement = document.querySelector(
		"cq-chart-title-date.ciq-chart-title-time"
	);
	const priceElement = document.querySelector(
		"cq-chart-title-date.ciq-chart-title-hist-price"
	);
	// probably need to replace these with more to spec formatting later
	const formattedDate = date.toDateString();

	// check if day is same
	const showIntraday = formattedDate === new Date().toDateString();

	if (dateElement) dateElement.innerHTML = live ? "LATEST" : formattedDate;
	if (timeElement) {
		if (showIntraday) {
			// currently just displaying the time the update was processed, not when it originated
			timeElement.innerHTML = new Date().toLocaleTimeString();
			timeElement.style.visibility = "visible";
		} else {
			timeElement.style.visibility = "hidden";
		}
	}
	if (priceElement)
		priceElement.innerHTML =
			(live
				? stx.getFirstLastDataRecord(stx.chart.dataSet, "Close", true)
				: stx.chart.dataSet[stx.tickFromDate(date)] || {}
			).Close || "";
};

/**
 * Animates chart updates.
 *
 * @memberof CIQ.CrossSection
 * @since
 * - 7.3.0
 * - 8.3.0 Renamed from `CIQ.TermStructure.prototype.animateUpdates`.
 */
CIQ.CrossSection.prototype.animateUpdates = function () {
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
		iconContainer.classList.add("ciq-crosssection-price-change-container");
		let icon = document.createElement("div");
		icon.classList.add("ciq-crosssection-price-change");
		icon.classList.add(`ciq-crosssection-price-${update > 0 ? "up" : "down"}`);
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
 * See {@link CIQ.CrossSection#setUpdateAnimations}.
 *
 * @memberof CIQ.CrossSection
 * @since
 * - 7.4.0
 * - 8.3.0 Renamed from `CIQ.TermStructure.prototype.cancelUpdateAnimations`.
 */
CIQ.CrossSection.prototype.cancelUpdateAnimations = function () {
	const { updateIcons } = this;
	if (!updateIcons) return;
	updateIcons.forEach((icon) => icon.remove());
	this.updateIcons = [];
};

/**
 * Sets the spacing type and triggers a redraw. Use this instead of setting the value manually.
 *
 * @param {string} type Spacing type, should be either "scaled" or "uniform". If this parameter
 * 		is undefined, the function returns without doing anything.
 *
 * @memberof CIQ.CrossSection
 * @since
 * - 7.3.0
 * - 8.3.0 Renamed from `CIQ.TermStructure.prototype.setSpacingType`.
 */
CIQ.CrossSection.prototype.setSpacingType = function (type) {
	if (!type) return;
	this.stx.layout.spacingType = type;
	this.stx.changeOccurred("layout");
	this.stx.draw();
};

/**
 * Sets the shading flag to the value of the `bool` parameter and triggers a redraw. Use this
 * function instead of setting the value manually.
 *
 * @param {boolean} bool When true, a background color (shading) is drawn on the chart to
 * 		highlight horizontal sections of the graph; when false, the background color is not
 * 		drawn.
 *
 * @memberof CIQ.CrossSection
 * @since
 * - 7.3.0
 * - 8.3.0 Renamed from `CIQ.TermStructure.prototype.setShading`.
 *
 * @example
 * var shadingCheckbox = topNode.querySelector(".ciq-checkbox-shading");
 * if (shadingCheckbox) {
 *     shadingCheckbox.registerCallback(function(value) {
 *         stx.crossSection.setShading.call(stx.crossSection, value);
 *         shadingCheckbox.classList.toggle("ciq-active");
 *      });
 *     shadingCheckbox.currentValue = true; // Initially set check box to checked.
 * }
 */
CIQ.CrossSection.prototype.setShading = function (bool) {
	this.stx.layout.drawShading = bool;
	this.stx.changeOccurred("layout");
	this.stx.draw();
};

/**
 * **Deprecated.** Use {@link CIQ.CrossSection#setYaxisField} instead.
 *
 * Sets the data field for which values are plotted on the y-axis of the chart and
 * then triggers a redraw of the chart. Use this function instead of setting the data field
 * manually. See {@link CIQ.UI.Layout#setDataField}.
 *
 * @param {string} field Defines the type of values plotted on the y-axis of the cross section
 * 		graph; for example, instrument yield or volatility.
 *
 * @memberof CIQ.CrossSection
 * @deprecated Use {@link CIQ.CrossSection#setYaxisField}.
 * @since
 * - 7.3.0
 * - 8.3.0 Renamed from `CIQ.TermStructure.prototype.setDataField`. Deprecated.
 */
CIQ.CrossSection.prototype.setDataField = function (field) {
	this.setYaxisField(field, this.initialSettings.aggOperator);
};

/**
 * Sets the data field that is plotted on the y-axis of the chart, and then triggers a redraw of
 * the chart.
 *
 * Use this function instead of setting the y-axis field manually.
 *
 * See also {@link CIQ.UI.Layout#setYaxisField}.
 *
 * @param {string} field Specifies the type of values plotted on the y-axis of the cross section
 * 		chart; for example, "yield", "bid", or "ask", which are the interest rate and trading
 * 		prices of instruments in a term structure of interest rates.
 * @param {string} [aggOperator] Specifies how multiple values for the same record are aggregated.
 * 		The value plotted on the y-axis is the result of the aggregation operation.
 * 		Valid values include:
 * - "sum" &mdash; Adds the values to create a single result
 * - "newest" &mdash; Selects the most recent value chronologically
 * - "first" &mdash; Selects the first value in order of position in the set of values
 * - "last" &mdash; Selects the last value in order of position in the set of values
 * - "count" &mdash; Gets a count of the values
 * - "avg" &mdash; Averages the values
 * - "max" &mdash; Gets the value that has the greatest magnitude
 *
 * @memberof CIQ.CrossSection
 * @since 8.3.0
 */
CIQ.CrossSection.prototype.setYaxisField = function (field, aggOperator) {
	const { stx } = this;
	stx.layout.yaxisField = field;
	stx.layout.aggOperator = aggOperator;
	stx.changeOccurred("layout");
	stx.home();
};

/**
 * Sets the data field that is plotted on the x-axis of the chart, and then triggers a redraw of
 * the chart.
 *
 * Use this function instead of setting the x-axis field manually.
 *
 * See also {@link CIQ.UI.Layout#setXaxisField}.
 *
 * @param {string} field Specifies the type of values plotted on the x-axis of the chart; for
 * 		example, "strike" or "expiration" for the strike price and expiration date of options.
 *
 * @memberof CIQ.CrossSection
 * @since 8.3.0
 */
CIQ.CrossSection.prototype.setXaxisField = function (field) {
	const { stx } = this;
	stx.layout.xaxisField = field;
	stx.changeOccurred("layout");
	stx.home();
};

/**
 * Sets the data field for which values are grouped together to create chart subcurves, and then
 * triggers a redraw of the chart.
 *
 * Use this function instead of setting the group field manually.
 *
 * See also {@link CIQ.UI.Layout#setGroupField}.
 *
 * @param {string} field The field for which data values are grouped to create subcurves; for
 * 		example, "strike" or "expiration" for the strike price and expiration date of options.
 *
 * @memberof CIQ.CrossSection
 * @since 8.3.0
 */
CIQ.CrossSection.prototype.setGroupField = function (field) {
	const { stx } = this;
	stx.layout.groupField = field;
	stx.changeOccurred("layout");
	stx.home();
};

/**
 * Sets criteria used to filter the data that defines the chart curves, and then triggers a redraw
 * of the chart.
 *
 * Use this function instead of setting the filtering manually.
 *
 * @param {object} obj Contains properties that filter the data that defines the chart curves.
 *
 * @memberof CIQ.CrossSection
 * @since 8.3.0
 */
CIQ.CrossSection.prototype.setFilters = function (obj) {
	const { stx } = this;
	stx.layout.filter = obj;
	stx.changeOccurred("layout");
	stx.home();
};

/**
 * Sets the value of the chart engine layout parameter (see {@link CIQ.ChartEngine}) that indicates
 * whether or not to highlight fresh data points.
 *
 * @param {boolean} value If true, highlight fresh data points; otherwise, do not highlight fresh
 * 		data points.
 *
 * @memberof CIQ.CrossSection
 * @since
 * - 7.4.0
 * - 8.3.0 Renamed from `CIQ.TermStructure.prototype.setShowcaseFreshPoints`.
 */
CIQ.CrossSection.prototype.setShowcaseFreshPoints = function (value) {
	this.stx.layout.showcaseFreshPoints = value;
	this.stx.changeOccurred("layout");
	this.stx.draw();
};

/**
 * Sets the value of the chart engine layout parameter (see {@link CIQ.ChartEngine}) that
 * specifies the amount of time after which data points go stale.
 *
 * @param {number} number The number of minutes for the time out.
 *
 * @memberof CIQ.CrossSection
 * @since
 * - 7.4.0
 * - 8.3.0 Renamed from `CIQ.TermStructure.prototype.setPointFreshnessTimeout`.
 */
CIQ.CrossSection.prototype.setPointFreshnessTimeout = function (number) {
	this.stx.layout.pointFreshnessTimeout = number;
	this.stx.changeOccurred("layout");
	this.stx.draw();
};

/**
 * Sets the value of the chart engine layout parameter (see {@link CIQ.ChartEngine}) that
 * specifies whether to animate changes to data point values.
 *
 * @param {boolean} value If true, animate changes; otherwise, do not animate changes.
 *
 * @memberof CIQ.CrossSection
 * @since
 * - 7.4.0
 * - 8.3.0 Renamed from `CIQ.TermStructure.prototype.setUpdateAnimations`.
 */
CIQ.CrossSection.prototype.setUpdateAnimations = function (value) {
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
 * @param {boolean} value If true, show the time stamp; otherwise, do not show the time stamp.
 *
 * @memberof CIQ.CrossSection
 * @since
 * - 7.4.0
 * - 8.3.0 Renamed from `CIQ.TermStructure.prototype.setShowUpdateStamp`.
 */
CIQ.CrossSection.prototype.setShowUpdateStamp = function (value) {
	this.stx.layout.showUpdateStamp = value;
	this.stx.changeOccurred("layout");
	this.stx.draw();
};

/**
 * Deselects all data points that have been selected on a curve. Typically, data points are
 * selected to show curve spreads (see {@link CIQ.ChartEngine#drawCrossSectionSpreads}).
 *
 * Called whenever a curve is removed or substantively modified; for example, when a new date
 * is selected for the curve.
 *
 * Defaults to the main curve.
 *
 * @param {string} [curveId="_main_curve"] Identifies the curve for which points are deselected.
 * 		If not specified, points are deselected on the main curve.
 *
 * @memberof CIQ.CrossSection
 * @since
 * - 7.5.0
 * - 8.3.0 Renamed from `CIQ.TermStructure.prototype.deselectCurvePoints`.
 */
CIQ.CrossSection.prototype.deselectCurvePoints = function (
	curveId = "_main_curve"
) {
	const { selectedPoints } = this;
	this.selectedPoints = selectedPoints.filter(({ curve }) => curve !== curveId);
};

/**
 * Sets the date for which a cross sectional curve is drawn. If the value specified in `date` is
 * not found in `masterData` and, if `useQuotefeed` is set in this cross section,
 * the function attempts to use the quote feed to load the requested date.
 *
 * For cross sections that have multiple curves, the date is applied to the main curve if a
 * value is not specified in `curve`.
 *
 * @param {Date|string|object} date The date for which the cross section curve is created. Can be a
 * 		<a href="https://developer.mozilla.org/en-US/docs/web/javascript/reference/global_objects/date" target="_blank">
 * 		Date</a> object, a string acceptable by the
 * 		<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse" target="_blank">
 * 		Date.parse()</a> method, an object that represents a relative date (for example,
 * 		`{ timeUnit: "day", multiplier: -1 }`, see `timeUnit` and `multiplier` below), or the
 * 		value "live", which specifies the current date.
 * 		<p>When a cross section is "live", the chart can be reloaded at a later date and the cross
 * 		section will be reconstructed for that date (the current date) regardless of when the
 * 		cross section was created.
 * 		<p>Relative dates apply to historical curves, which are primary entity curves created for
 * 		dates in the past.
 * @param {string} [date.timeUnit] Unit of time by which a relative date is offset from the date
 * 		of the main curve. See
 * 		[calculateRelativeDate]{@link CIQ.CrossSection.calculateRelativeDate} for valid values.
 * @param {number} [date.multiplier] Number of time units a relative date is offset from the date
 * 		of the main curve. A negative number offsets the date into the past; a positive number,
 * 		the future. Zero locks the date of the secondary curve to the date of the main curve.
 * @param {string} [curve] Identifies the curve to which `date` applies. If this parameter is not
 * 		provided, defaults to the main curve.
 * @param {object} [params={}] Curve specifications.
 * @param {boolean} [params.noRecord] When true, prevents recording of the curve data to the chart
 * 		layout, {@link CIQ.ChartEngine#layout}. This parameter is set to true when importing
 * 		curves (for example, when reloading the chart), which prevents the state of the curve
 * 		midway through loading from becoming the new source of layout data.
 * @param {boolean} [params.noDraw] When true, prevents the chart from being redrawn when the
 * 		curve date is set.
 * @param {boolean} [params.noLayoutChange] When true, prevents a dispatch informing the chart of
 * 		a layout change. This can be used to improve performance when calling `setCurveDate` on
 * 		multiple curves sequentially.
 *
 * @memberof CIQ.CrossSection
 * @since
 * - 7.3.0
 * - 7.5.0 Added `params` and `params.noRecord` parameters.
 * - 8.2.0 Added `params.noDraw` parameter. Added `date.timeUnit` and `date.multiplier` parameters
 * 		to enable relative dates. Added support for the value "live" when `date` is a string to
 * 		enable specification of the current date.
 * - 8.3.0 Renamed the function from `CIQ.TermStructure.prototype.setCurveDate`. Added the
 * 		`params.noLayoutChange` parameter.
 *
 * @example
 *  var datepicker = topNode.querySelector("cq-datepicker");
 *  if (datepicker && stx.crossSection) {
 *      datepicker.registerCallback(function(date) {
 *          stx.crossSection.setCurveDate(date);
 *      });
 *  }
 */
CIQ.CrossSection.prototype.setCurveDate = function (date, curve, params = {}) {
	const { noRecord, noDraw, noLayoutChange } = params;
	const self = this;
	const { curves, stx } = self;
	const { masterData } = stx;
	const isMainCurve = !curve || curve === "_main_curve";
	const isLive = date === "live";
	const { timeUnit, multiplier } = date;
	const isRelativeDate = (multiplier || multiplier === 0) && timeUnit;

	if (isLive) {
		date = new Date();
	} else if (isRelativeDate) {
		date = CIQ.CrossSection.calculateRelativeDate({
			timeUnit,
			multiplier,
			reference: curves._main_curve.Date
		});
	} else {
		date = new Date(date.valueOf());
	}

	const updateDate = () => {
		if (isMainCurve) {
			curves._main_curve.Date = date;
			curves._main_curve.live = isLive;
			this.recalculateRelativeDates({ noDraw, noLayoutChange, noRecord });
		} else {
			curves[curve].Date = date;
			curves[curve].live = isLive;
		}

		if (isRelativeDate) curves[curve].relativeDate = { timeUnit, multiplier };

		self.deselectCurvePoints(curve);
		if (!noRecord) self.recordCurves();
		if (!noDraw) stx.draw();
		if (!noLayoutChange) stx.changeOccurred("layout");
	};

	// if something is wrong with masterData warn and don't do anything
	// if date isn't in masterData try to fetch it before switching values
	if (!(masterData && masterData[0] && masterData[0].DT)) {
		console.warn(
			"Cannot set curve date. `masterData` is missing or malformed."
		);
		return;
	} else if (
		this.useQuotefeed &&
		date.getTime() < this.stx.chart.masterData[0].DT.getTime()
	) {
		stx.setRange(
			{ dtLeft: date, periodicity: { period: 1, timeUnit: "day" } },
			function () {
				updateDate();
			}
		);
	} else {
		updateDate();
	}
};

/**
 * Used internally to set the main curve for the cross section chart. Called as an injection
 * on `symbolChange` events and as an injection on the draw loop (if `_main_curve` is not set).
 *
 * This method should rarely if ever be called directly.
 *
 * @param {string} symbol The main curve symbol. Set to whatever the main symbol is.
 * @param {string} date Date to use for the main curve. If no date is specified, the current date
 * 		is used, and the curve is set to "live", meaning the date rolls over into the next day as
 * 		the time changes.
 *
 * @memberof CIQ.CrossSection
 * @private
 * @since
 * - 7.3.0
 * - 8.2.0 Added support for relative and "live" dates.
 * - 8.3.0 Renamed from `CIQ.TermStructure.prototype.setMainCurve`.
 */
CIQ.CrossSection.prototype.setMainCurve = function (symbol, date) {
	this.curves = {
		_main_curve: {
			symbol: symbol,
			Date: date ? new Date(date) : new Date(),
			live: !date
		}
	};
	this.recalculateRelativeDates();
	this.stx.draw();
};

/**
 * Calculates a date relative to a reference date. For example, calculates the date that is 10
 * days prior to the current date.
 *
 * @param {object} params Function parameters.
 * @param {Date} params.reference The date from which the relative date is calculated.
 * @param {string} params.timeUnit The unit of time by which the relative date is offset from the
 * 		reference date. Must be "day", "week", "month", or "year".
 * @param {number} params.multiplier The number of time units the relative date is offset from the
 * 		reference date. A negative number offsets the date into the past; for example, -10
 * 		specifies a date 10 time units (days, weeks, months, or years) in the past. A positive
 * 		number offsets the date into the future; for example, 2 specifies a date two days, weeks,
 * 		months, or years in the future. Zero makes the relative date the same as the reference
 * 		date regardless of time unit.
 * @return {Date} The calculated relative date.
 *
 * @memberof CIQ.CrossSection
 * @static
 * @since
 * - 8.2.0
 * - 8.3.0 Renamed from `CIQ.TermStructure.calculateRelativeDate`.
 */
CIQ.CrossSection.calculateRelativeDate = function ({
	reference,
	timeUnit,
	multiplier
}) {
	const date = new Date(reference);
	if (timeUnit === "day") date.setDate(date.getDate() + multiplier);
	if (timeUnit === "week") date.setDate(date.getDate() + multiplier * 7);
	if (timeUnit === "month") date.setMonth(date.getMonth() + multiplier);
	if (timeUnit === "year") date.setFullYear(date.getFullYear() + multiplier);
	return date;
};

/**
 * Formats the filtering criteria of a data filter. If the filter object contains filtering
 * criteria (object properties) that are date strings, the strings are converted to Date objects.
 *
 * @param {object} obj Filter for which date strings are converted to Date objects.
 *
 * @memberof CIQ.CrossSection
 * @private
 * @since 8.3.0
 */
CIQ.CrossSection.formatFilter = function (obj) {
	function convertToDate(value) {
		const dateCandidate = new Date(value);
		if (
			dateCandidate.toString() !== "Invalid Date" &&
			value === dateCandidate.toISOString()
		)
			return dateCandidate;
		return value;
	}
	if (!obj) return;
	for (var field in obj) {
		const value = obj[field];
		if (typeof value === "object") {
			value.high = convertToDate(value.high);
			value.low = convertToDate(value.low);
		} else {
			obj[field] = convertToDate(obj[field]);
		}
	}
};

/**
 * Adds a secondary curve to the cross section chart.
 *
 * @param {string} symbol Market symbol that identifies the instrument depicted by the secondary
 * 		curve.
 * @param {Date|string|object} date Date for the secondary curve. Can be a
 * 		<a href="https://developer.mozilla.org/en-US/docs/web/javascript/reference/global_objects/date"
 * 		target="_blank"> Date</a> object, a string acceptable by the
 * 		<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse"
 * 		target="_blank"> Date.parse()</a> method, an object that represents a relative date (for
 * 		example, `{ timeUnit: "day", multiplier: -1 }`, see `timeUnit` and `multiplier` below), or
 * 		the value "live", which specifies the current date.
 * 		<p>When a cross section is "live", the chart can be reloaded at a later date and the
 * 		cross section will be reconstructed for that date (the current date) regardless of when
 * 		the cross section was created.
 * 		<p>Relative dates apply to historical curves, which are primary entity curves created for
 * 		dates in the past.
 * @param {string} [date.timeUnit] Unit of time by which a relative date is offset from the date
 * 		of the main curve. See
 * 		[calculateRelativeDate]{@link CIQ.CrossSection.calculateRelativeDate} for valid values.
 * @param {number} [date.multiplier] Number of time units a relative date is offset from the date
 * 		of the main curve. A negative number offsets the date into the past; a positive number,
 * 		the future. Zero locks the date of the secondary curve to the date of the main curve.
 * @param {object} params Specifications for the secondary curve.
 * @param {string} [params.color] Color of the secondary curve. Must be an RGB, RBGA, or
 * 		six&#8209;digit hexadecimal color number; for example, "rgb(255, 255, 255)",
 * 		"rgba(255, 255, 255, 0.5)", or "#FFFFFF".
 * 		<p>**Note:** Three&#8209;digit hexadecimal color numbers and CSS color keywords, such as
 * 		"white", are not valid.
 * @param {boolean} [params.noRecord] When true, prevents recording of the secondary curve
 * 		data to the chart layout, {@link CIQ.ChartEngine#layout}. This parameter is set to true
 * 		when importing curves (for example, when reloading a chart that has secondary curves),
 * 		which prevents the state of the curve midway through loading from becoming the new source
 * 		of layout data.
 * @param {function} [cb] Function called when the curve has been added to the chart and the data
 * 		for the curve is available.
 *
 * @memberof CIQ.CrossSection
 * @since
 * - 7.5.0
 * - 8.2.0 Added `date.timeUnit` and `date.multiplier` parameters to enable relative dates. Added
 * 		support for the value "live" when `date` is a string to enable specification of the
 * 		current date.
 * - 8.3.0 Renamed from `CIQ.TermStructure.prototype.addCurve`.
 */
CIQ.CrossSection.prototype.addCurve = function (symbol, date, params, cb) {
	const { stx, curves } = this;
	const { color, noRecord } = params;
	const isLive = date === "live";
	const { timeUnit, multiplier } = date;
	const isRelativeDate = (multiplier || multiplier === 0) && timeUnit;

	if (isLive) {
		date = new Date();
	} else if (isRelativeDate) {
		date = CIQ.CrossSection.calculateRelativeDate({
			timeUnit,
			multiplier,
			reference: curves._main_curve.Date
		});
	} else {
		date = new Date(date.valueOf());
	}

	for (let i in curves) {
		let curve = curves[i];
		if (
			curve.symbol === symbol &&
			curve.Date.toDateString() === date.toDateString()
		) {
			if (curve.hidden) curve.hidden = false;
			return; // don't add duplicate curves
		}
	}

	let newId = CIQ.uniqueID();
	this.curves[newId] = {
		symbol,
		color,
		Date: date,
		loading: true,
		live: isLive
	};
	if (isRelativeDate) {
		this.curves[newId].relativeDate = { timeUnit, multiplier };
	}

	const dataPresent = () => {
		this.curves[newId].loading = false;
		this.setCurveDate(isLive ? "live" : date, newId, { noRecord });
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
 * Recalculates any relative dates if necessary; for example, when the main curve date has
 * changed.
 *
 * @param {object} [params] Function parameters.
 * @param {boolean} [params.noRecord] When true, prevents recording of the curve data to the chart
 * 		layout, {@link CIQ.ChartEngine#layout}. This parameter is set to true when importing
 * 		curves (for example, when reloading the chart), which prevents the state of the curve
 * 		midway through loading from becoming the new source of layout data.
 * @param {boolean} [params.noDraw] When true, prevents the chart from being redrawn when the
 * 		curve date is set.
 * @param {boolean} [params.noLayoutChange] When true, prevents a dispatch informing the chart of
 * 		a layout change. This can be used to improve performance when calling `setCurveDate` on
 * 		multiple curves sequentially.
 *
 * @memberof CIQ.CrossSection
 * @private
 * @since
 * - 8.2.0
 * - 8.3.0 Renamed from `CIQ.TermStructure.prototype.recalculateRelativeDates`.
 */
CIQ.CrossSection.prototype.recalculateRelativeDates = function ({
	noDraw,
	noLayoutChange,
	noRecord
} = {}) {
	const { curves } = this;

	for (let id in curves) {
		const { relativeDate: prevRelativeDate, Date: dateObj } = curves[id];
		if (!prevRelativeDate || id === "_main_curve") continue;

		const { timeUnit, multiplier } = prevRelativeDate;
		const newRelativeDate = CIQ.CrossSection.calculateRelativeDate({
			timeUnit,
			multiplier,
			reference: curves._main_curve.Date
		});

		if (dateObj.getTime() !== newRelativeDate.getTime()) {
			this.setCurveDate(newRelativeDate, id, {
				noDraw,
				noLayoutChange,
				noRecord
			});
		}
	}
};

/**
 * Removes a secondary curve from the cross section chart.
 *
 * @param {string} [curveId] Identifies the curve to be removed. If the parameter is undefined
 * 		or identifies the main curve, this function returns without doing anything.
 *
 * @memberof CIQ.CrossSection
 * @since
 * - 7.5.0
 * - 8.3.0 Renamed from `CIQ.TermStructure.prototype.removeCurve`.
 */
CIQ.CrossSection.prototype.removeCurve = function (curveId) {
	if (!curveId || curveId === "_main_curve") return;
	const { stx, curves, selectedCurve } = this;
	let curveSymbol = curves[curveId].symbol;
	let preserveSeries = false;

	for (let i in curves) {
		let curve = curves[i];
		if (i !== curveId && curve.symbol === curveSymbol) {
			preserveSeries = true;
		}
	}

	if (curveId === selectedCurve) this.selectedCurve = null;
	if (!preserveSeries) stx.removeSeries(curveSymbol);
	delete this.curves[curveId];
	this.deselectCurvePoints(curveId);
	this.recordCurves();
	stx.draw();
	stx.changeOccurred("layout");
};

/**
 * Modifies a curve on the cross section chart.
 *
 * @param {string} curveId Identifies the curve to be modified.
 * @param {object} [params] Parameters that specify curve modifications. If this parameter is
 * 		undefined, the function returns without doing anything.
 * @param {string} [params.color] A new color to apply to the curve. Must be an RGB, RBGA, or
 * 		six&#8209;digit hexadecimal color number; for example, "rgb(255, 255, 255)",
 * 		"rgba(255, 255, 255, 0.5)", or "#FFFFFF".
 * 		<p>**Note:** Three&#8209;digit hexadecimal color numbers and CSS color keywords, such as
 * 		"white", are not valid.
 * @param {boolean} [params.noRecord] When true, prevents recording of the curve modifications to
 * 		the chart layout, {@link CIQ.ChartEngine#layout}.
 *
 * @memberof CIQ.CrossSection
 * @since
 * - 7.5.0
 * - 8.2.0 Added `params.noRecord`.
 * - 8.3.0 Renamed from `CIQ.TermStructure.prototype.modifyCurve`.
 */
CIQ.CrossSection.prototype.modifyCurve = function (curveId, params) {
	if (!params) return;
	const { curves, stx } = this;
	const { color, noRecord } = params;
	if (!color) return;
	const curveToModify = curves[curveId];
	if (!curveToModify) return;
	curveToModify.color = color;
	curveToModify.desaturatedColor = null; // ensure it will get recalculated in draw method
	if (!noRecord) this.recordCurves();
	stx.draw();
	stx.changeOccurred("layout");
};

/**
 * Shows or hides a curve.
 *
 * @param {string} curveId Identifies the curve to be shown.
 * @param {boolean} [doShow=true] The curve is shown by default. Pass `false` to hide the curve.
 *
 * @memberof CIQ.CrossSection
 * @since 8.3.0
 */
CIQ.CrossSection.prototype.showCurve = function (curveId, doShow = true) {
	const { curves, stx } = this;
	if (!curves[curveId] || curveId === "_main_curve") return;
	curves[curveId].hidden = !doShow;
	stx.draw();
	stx.changeOccurred("layout");
};

/**
 * Hides a curve.
 *
 * @param {string} curveId Identifies the curve to be hidden.
 *
 * @memberof CIQ.CrossSection
 * @since 8.3.0
 */
CIQ.CrossSection.prototype.hideCurve = function (curveId) {
	this.showCurve(curveId, false);
};

/**
 * Unlocks a curve. Makes the curve no longer relative to the main curve. The curve can now be set
 * independent of the main curve. The date of the curve will not change when the date of the main
 * curve changes.
 *
 * @param {string} curveId Identifies the curve to be unlocked.
 *
 * @memberof CIQ.CrossSection
 * @since 8.3.0
 */
CIQ.CrossSection.prototype.unlockCurve = function (curveId) {
	const { curves } = this;
	const curve = curves[curveId];
	if (!(curve && curve.relativeDate)) return;
	delete curve.relativeDate;
	this.setCurveDate(curve.Date, curveId);
};

/**
 * Locks the specified curve to the main curve.
 *
 * **Limitation:** The time difference between the locked curve and main curve will be a number of
 * days, which may change the relative time difference of a previously unlocked curve. For example,
 * if you add a curve locked at minus one month, then unlock it and re-lock it, the time difference
 * from the main curve will now be a number of days instead of one month, which may not yield the
 * same results.
 *
 * @param {string} curveId Identifies the curve to be locked.
 *
 * @memberof CIQ.CrossSection
 * @since 8.3.0
 */
CIQ.CrossSection.prototype.lockCurve = function (curveId) {
	const { curves } = this;
	const curve = curves[curveId];
	const mainCurve = curves._main_curve;
	if (!curve || curve.relativeDate || curve === mainCurve) return;

	const msDiff = curve.Date - mainCurve.Date;
	const daysDiff = Math.trunc(msDiff / (1000 * 60 * 60 * 24));
	this.setCurveDate({ timeUnit: "day", multiplier: daysDiff }, curveId);
};

/**
 * Finds the maximum and minimum values of a field in the curve data.
 *
 * @param {string} field Field to check for maximum and minimum values.
 * @return {object} An object containing the maximum and minimum values of `field`; property names
 * 		are `max` and `min` respectively.
 *
 * @memberof CIQ.CrossSection
 * @since 8.3.0
 */
CIQ.CrossSection.prototype.findExtrema = function (field) {
	var minMax = {};
	this.records.forEach((record) => {
		Object.values(record).forEach((instrument) => {
			let value = CIQ.CrossSection.getValueFromMaybeObject(instrument[field]);
			if (typeof value !== "undefined") {
				if (typeof minMax.min === "undefined" || minMax.min > value)
					minMax.min = value;
				if (typeof minMax.max === "undefined" || minMax.max < value)
					minMax.max = value;
			}
		});
	});
	return minMax;
};

/**
 * Pivots a curve data record.
 *
 * @param {object} record Record to pivot.
 * @param {string} curveName Name of the curve for which the data is pivoted.
 * @return {object} Pivoted record.
 *
 * @memberof CIQ.CrossSection
 * @private
 * @since 8.3.0
 */
CIQ.CrossSection.prototype.pivotRecord = function (record, curveName) {
	function aggregate(accum, value, index, length, operator) {
		switch (operator) {
			case "sum":
				accum += value;
				return accum;
			case "avg":
				accum += value;
				if (index === length - 1) accum /= length;
				return accum;
			case "count":
				return accum++;
			case "max":
				return Math.max(accum, value);
			case "first":
				if (!index) accum = value;
				return accum;
			case "last":
				accum = value;
				return accum;
			default:
				return accum;
		}
	}
	const {
		yaxisField,
		xaxisField,
		groupField,
		aggOperator,
		filter
	} = this.stx.layout;
	if (xaxisField) {
		return pivotRecordFields(
			record,
			filter,
			xaxisField,
			null, //yaxisField,
			this.sortFunction,
			(key, value) => {
				const gFields = groupField.split(",");
				let res = "";
				gFields.forEach((fld, i) => {
					if (i) res += ",";
					let rec = CIQ.CrossSection.getValueFromMaybeObject(value[fld]);
					if (rec instanceof Date) rec = rec.getTime();
					res += rec;
				});
				if (res.length) res = curveName + " (" + res + ")";
				return res;
			},
			(acc, val, i, arr) => {
				if (arr.length === 1) {
					Object.assign(acc, val);
					return acc;
				}
				if (!acc[yaxisField]) acc[yaxisField] = { value: 0, timeStamp: 0 };
				if (typeof val[yaxisField] == "object") {
					acc[yaxisField].value = aggregate(
						acc[yaxisField].value,
						val[yaxisField].value,
						i,
						arr.length,
						aggOperator
					);
					if (val[yaxisField].timeStamp >= acc[yaxisField].timeStamp) {
						acc[yaxisField].timeStamp = val[yaxisField].timeStamp;
						if (aggOperator === "newest") {
							acc[yaxisField].value = val[yaxisField].value;
						}
					}
				} else {
					acc[yaxisField].value = aggregate(
						acc[yaxisField].value,
						val[yaxisField],
						i,
						arr.length,
						aggOperator
					);
					if (aggOperator === "newest") {
						acc[yaxisField].value = val[yaxisField];
					}
				}
				if (typeof acc._originalKey === "undefined")
					acc._originalKey = val._originalKey;
				else acc._originalKey = null;
				return acc;
			}
		);
	}

	return record;
};
