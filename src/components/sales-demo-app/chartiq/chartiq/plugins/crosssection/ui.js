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


import { CIQ } from "../../js/componentUI.js";
import "./core.js";

const swatchColors = [
	"#8ec648",
	"#00afed",
	"#ee652e",
	"#912a8e",
	"#fff126",
	"#e9088c",
	"#ea1d2c",
	"#00a553",
	"#00a99c",
	"#0056a4",
	"#f4932f",
	"#0073ba",
	"#66308f",
	"#323390"
];

/**
 * UI Helper for cross section curve interaction by means of context menu options.
 *
 * When the `enableTimeSeries` property of the `plugins.crossSection` object in the chart
 * configuration object is set to true, users can right&#8209;click data points on the curve to
 * open a context menu:
 *
 * ![Launch Time Series](img-cq-time-series.png)
 *
 * If **Launch Time Series** is then selected, a time series chart for that instrument opens in a
 * new browser tab.
 *
 * See the context menu markup example below.
 *
 * For information about the `plugins.crossSection` configuration object, see the
 * <a href="tutorial-Chart%20Configuration.html" target="_blank">Chart Configuration</a> tutorial.
 *
 * @param {HTMLElement} [node=context.topNode] Automatically attaches to the top node of the
 * 		context. Not currently used.
 * @param {CIQ.UI.Context} context The context for the chart.
 * @param {boolean} [params.enableTimeSeries=false] Specifies whether a link to a time series
 * 		chart should appear when right-clicking on a point on the chart.
 * @param {function} [params.timeSeriesSymbologyEncoder={@link CIQ.Market.Symbology.encodeTermStructureInstrumentSymbol}]
 * 	 	Function that converts an instrument to a market ticker. Takes an `entity` and an
 * 		`instrument` as parameters.
 * @param {object} [params={pathToTimeSeries:"plugins/crosssection/sample-time-series-instant-chart.html"}]
 * 		Provides the path to a template used by the
 * 		[launchTimeSeries]{@link CIQ.UI.CurveEdit.launchTimeSeries} method to load a time series
 * 		chart.
 *
 * @name CIQ.UI.CurveEdit
 * @constructor
 * @since
 * - 7.4.0
 * - 8.3.0 Added the `timeSeriesSymbologyEncoder` parameter. The `enableTimeSeries` property of
 * 		the `plugins.crossSection` object in the chart configuration object overrides the
 * 		`cq-time-series` attribute of the `cq-curve-context` element.
 *
 * @example
 * <caption>Context menu for time series options.</caption>
 * <cq-dialog>
 *     <cq-curve-context>
 *         <div stxtap="CurveEdit.launchTimeSeries()">Launch Time Series</div>
 *     </cq-curve-context>
 * </cq-dialog>
 */
function CurveEdit(node, context, params = {}) {
	const stx = context.stx;
	const $node = CIQ.UI.$(node || context.topNode);

	this.node = $node[0];
	this.context = context;
	this.curveContext = document.querySelector("cq-curve-context");
	if (this.curveContext) this.curveContext.classList.add("ciq-context-menu");
	const basePath = CIQ.ChartEngine.pluginBasePath + "crosssection/";
	const defaultPathToTimeSeries =
		basePath + "sample-time-series-instant-chart.html";
	this.pathToTimeSeries = params.pathToTimeSeries || defaultPathToTimeSeries;

	// Time-series chart needs to be enabled in the plugin config.
	// If it is, we initialize the other time-series related options.
	if (params.enableTimeSeries) {
		this.curveContext.setAttribute("cq-time-series", "true");
		stx.addEventListener("curveEdit", (params) => this.showContext(params));
		if (params.timeSeriesSymbologyEncoder)
			this.timeSeriesSymbologyEncoder = params.timeSeriesSymbologyEncoder;
		else if (CIQ.Market && CIQ.Market.Symbology)
			this.timeSeriesSymbologyEncoder =
				CIQ.Market.Symbology.encodeTermStructureInstrumentSymbol;
		else this.timeSeriesSymbologyEncoder = (s, i) => s + " " + i;
	}
	context.advertiseAs(this, "CurveEdit");
}

CIQ.inheritsFrom(CurveEdit, CIQ.UI.Helper);

/**
 * Opens the curve context menu at the current cursor position. The menu contains options such
 * as loading a time series chart for a cross section instrument.
 *
 * Used internally by the `CurveEdit` instance.
 *
 * @param {Object} params Parameters supplied to the context menu.
 *
 * @memberof CIQ.UI.CurveEdit
 * @private
 * @since 7.4.0
 */
CurveEdit.prototype.showContext = function (params) {
	// use crosshairX and crosshairY and not cx and cy to work with downstream positioner
	params.x = CIQ.ChartEngine.crosshairX;
	params.y = CIQ.ChartEngine.crosshairY;
	params.context = this.context;

	this.curveContext.open(params);
};

/**
 * Opens a window and loads a time series chart for a selected cross section instrument.
 *
 * @memberof CIQ.UI.CurveEdit
 * @alias CIQ.UI.CurveEdit.launchTimeSeries
 * @since 7.4.0
 */
CurveEdit.prototype.launchTimeSeries = function () {
	const { highlighted, curves } = this.context.stx.crossSection;
	const { curve, instrument, subcurve } = highlighted;
	const { symbol, subcurves } = curves[curve];

	let instrumentSymbol = this.timeSeriesSymbologyEncoder(symbol, instrument);

	if (subcurves) instrumentSymbol = subcurves[subcurve].symbol;

	if (this.pathToTimeSeries.match(/:\/\//i)) {
		console.error(
			"Error: Cannot specify an external path for time series chart"
		);
	} else {
		const loadSymbol = () => {
			if (newWindow.document.title === instrumentSymbol) return;

			const { stx } = newWindow.document.querySelector("cq-instant-chart");
			stx.addEventListener("symbolChange", function ({ symbol }) {
				newWindow.document.title = symbol;
			});
			stx.setChartType("line");
			stx.loadChart(instrumentSymbol, { interval: "day" });
		};

		const newWindow = window.open(this.pathToTimeSeries);
		newWindow.addEventListener("pageshow", loadSymbol, true);

		// Also try to call loadChart immediately in case pageshow has already fired
		try {
			loadSymbol();
		} catch (e) {}

		newWindow.focus();
	}

	this.curveContext.close();
};

CIQ.UI.CurveEdit = CurveEdit;

/**
 * The freshness dialog web component `<cq-freshness-dialog>` enables users to set the amount
 * of time within which data point updates are considered recent, or fresh. For example, if the
 * freshness is set to 10 minutes, data points must have updated within the last 10 minutes to
 * be considered fresh.
 *
 * @namespace WebComponents.cq-freshness-dialog
 * @since 7.4.0
 *
 * @example
 * <cq-dialog>
 *     <cq-freshness-dialog>
 *         <h4 class="title">Set Highlight Duration</h4>
 *         <cq-close></cq-close>
 *         <div style="text-align:center;margin-top:10px;">
 *             <div>
 *                 <i>Enter number of minutes and hit "Enter"</i>
 *                 <p>
 *                     <input name="freshness" stxtap="Layout.setFreshnessEdit()">
 *                 </p>
 *             </div>
 *             <p>or</p>
 *             <p>
 *                 <div class="ciq-btn" stxtap="Layout.setFreshnessEdit('auto')">Auto Select</div>
 *             </p>
 *         </div>
 *     </cq-freshness-dialog>
 * </cq-dialog>
 */
class FreshnessDialog extends CIQ.UI.DialogContentTag {
	constructor() {
		super();
	}

	/**
	 * Opens the nearest {@link WebComponents.cq-dialog} to display the freshness dialog.
	 *
	 * @alias open
	 * @memberof WebComponents.cq-freshness-dialog
	 */
	open(params) {
		super.open(params);
		const node = this.node[0];
		const inputElement = node.querySelector("input");

		const { crossSection, layout } = this.context.stx;
		const prop = "pointFreshnessTimeout";
		if (!layout[prop]) layout[prop] = crossSection.initialSettings[prop];
		inputElement.value = layout[prop];
	}
}

/**
 * Opens the `cq-freshness-dialog` component.
 *
 * @param {HTMLElement} node
 *
 * @memberof CIQ.UI.Layout
 * @private
 * @since 7.4.0
 */
CIQ.UI.Layout.prototype.showFreshnessEdit = function (node) {
	let dialog = document.querySelector("cq-freshness-dialog");
	if (dialog) dialog.open({ context: this.context });
};

/**
 * Sets the fresh data point time-out.
 *
 * @param {object} params Function parameters.
 * @param {HTMLElement} params.node The UI element that has set the freshness time-out value.
 * @param {string} [field] Indicates whether the time-out should be set automatically.
 *
 * @alias setFreshnessEdit
 * @memberof CIQ.UI.Layout.prototype
 * @private
 * @since 7.4.0
 */
CIQ.UI.Layout.prototype.setFreshnessEdit = function ({ node }, field) {
	const dialog = CIQ.UI.BaseComponent.selfOrParentElement(node, "cq-dialog");
	const inputElement = dialog.querySelector("input");
	const { crossSection } = this.context.stx;

	if (field === "auto") {
		inputElement.value = crossSection.initialSettings.pointFreshnessTimeout; // set to default value
	}

	let { value } = inputElement; // grab after possibly setting to default
	crossSection.setPointFreshnessTimeout(parseFloat(value));
	dialog.close();
};

/**
 * Sets a criterion for filtering the data that defines the chart curves. The filtering criterion
 * is stored in the layout filter object.
 *
 * @param {HTMLElement} arguments[0].node The user interface element where the click or tap that
 * 		calls this function originated.
 * @param {object} arguments[0].params Additional information about where the click or tap
 * 		originated, including the parent element.
 * @param {string} name Filter name.
 * @param {string} value Filter value.
 * @param {string} [type] Data type of filter.
 *
 * @alias setFilter
 * @memberof CIQ.UI.Layout.prototype
 * @private
 * @since 8.3.0
 */
CIQ.UI.Layout.prototype.setFilter = function (
	{ node, params },
	name,
	value,
	type
) {
	let obj = this.context.stx.layout.filter || {};

	if (type === "boolean") value = value === "true";
	else if (type === "number") value = Number(value);
	else if (type === "date") value = new Date(value);
	else if (type === "object") value = JSON.parse(value);

	if (obj[name] instanceof Array) {
		if (obj[name].includes(value)) {
			obj[name].splice(obj[name].indexOf(value), 1);
		} else obj[name].push(value);
		obj[name] = obj[name].slice(); // trigger observer
	} else obj[name] = value;

	this.context.stx.crossSection.setFilters(obj);
};

/**
 * Gets the value of the filter property from the layout.
 *
 * @param {HTMLElement} node The user interface element that sets the filter.
 * @param {string} name Filter name.
 * @param {string} value Filter value.
 *
 * @memberof CIQ.UI.Layout
 * @private
 * @since 8.3.0
 */
CIQ.UI.Layout.prototype.getFilter = function (node, name, value) {
	let { layout } = this.context.stx;
	let { filter } = layout;
	if (!filter) layout.filter = {};
	const className = this.params.activeClassName;

	function listener(obj) {
		if (obj.property === name) {
			if (
				obj.value === value ||
				(obj.value instanceof Array && obj.value.includes(value))
			) {
				node.classList.add(className);
			} else node.classList.remove(className);
		}
	}
	CIQ.UI.observeProperty(name, filter, listener);
};

/**
 * The historical comparison dialog box web component, `<cq-historical-comparison-dialog>`, is
 * used to add secondary curves to a cross section chart. The secondary curves plot the
 * instruments of the main curve using data from past dates.
 *
 * The dialog box enables users to select past dates; it includes the following elements:
 * - Options group &mdash; Creates a group of radio buttons, each of which specifies a
 * specific past date
 * - Date picker &mdash; Enables selection of custom dates
 * - Color swatch &mdash; Accesses a color picker used to select a color for the secondary curve
 *
 * See the example below.
 *
 * @namespace WebComponents.cq-historical-comparison-dialog
 * @since 7.5.0
 *
 * @example
 * <caption><img src="./img-Historical-Comparison-Dialog.png"/></caption>
 * <cq-dialog>
 *      <cq-historical-comparison-dialog>
 *          <h4 class="title">Add Historical Comparison</h4>
 *          <cq-close></cq-close>
 *          <div class="ciq-dialog-color-option">
 *              <div class="ciq-heading">Color</div>
 *              <cq-swatch></cq-swatch>
 *          </div>
 *          <hr>
 *          <div class="ciq-options-group" style="margin-top:10px;">
 *              <cq-item stxtap="select()" class="ciq-active">1 Day Ago<span class="ciq-radio"><span></span></span></cq-item>
 *              <cq-item stxtap="select()">1 Week Ago<span class="ciq-radio"><span></span></span></cq-item>
 *              <cq-item stxtap="select()">1 Month Ago<span class="ciq-radio"><span></span></span></cq-item>
 *              <cq-item stxtap="select()">1 Year Ago<span class="ciq-radio"><span></span></span></cq-item>
 *              <cq-item stxtap="select()">3 Years Ago<span class="ciq-radio"><span></span></span></cq-item>
 *              <cq-item stxtap="select('custom')">Custom...</cq-item>
 *          </div>
 *          <cq-datepicker>
 *              <div class="datepicker comparison-datepicker"></div>
 *          </cq-datepicker>
 *          <div stxtap="done()" style="display:flex;justify-content:center;"><div class="ciq-btn">Done</div></div>
 *      </cq-historical-comparison-dialog>
 * </cq-dialog>
 */
class HistoricalComparisonDialog extends CIQ.UI.DialogContentTag {
	constructor() {
		super();
		this.radioOptions = this.querySelector(".ciq-options-group");
		this.firstOption = this.querySelector("cq-item");
		this.datepicker = this.querySelector("cq-datepicker");
		this.swatch = this.querySelector("cq-swatch");

		this.swatchColors = swatchColors;
		for (let i = 0; i < this.swatchColors.length; i++) {
			this.swatchColors[i] = CIQ.convertToNativeColor(this.swatchColors[i]);
		}
	}

	/**
	 * Opens the dialog box.
	 *
	 * @param {Object} [params] Optional parameters.
	 * @param {CIQ.UI.Context} [params.context] The chart context.
	 *
	 * @alias open
	 * @memberof WebComponents.cq-historical-comparison-dialog
	 * @since 7.5.0
	 */
	open(params) {
		super.open(params);
		this.radioOptions.style.display = "block";
		this.datepicker.style.display = "none";
		this.custom = false;

		Array.from(this.querySelectorAll("cq-item")).forEach((item) => {
			item.classList.remove("ciq-active");
		});

		this.firstOption.classList.add("ciq-active");

		const { crossSection } = this.context.stx;
		const { swatchColors } = this;
		let currentColor = this.swatch.style.backgroundColor;

		let usedColors = new Set();
		for (let i in crossSection.curves) {
			let curve = crossSection.curves[i];
			usedColors.add(curve.color);
		}

		if (currentColor.length && !usedColors.has(currentColor)) return;

		// Newly added curves will use the color of this swatch. For that reason whenever we open
		// the menu we make sure the color is unique so as to make it easy to distinguish curves
		for (let i = 0; i < swatchColors.length; i++) {
			let swatchColor = swatchColors[i];
			if (!usedColors.has(swatchColor)) {
				this.swatch.style.backgroundColor = swatchColor;
				return;
			}
		}
	}

	/**
	 * Processes the `cq-item` options group member selected by the user. Sets the selected
	 * radio button as active or, if the custom date option has been selected, opens a date
	 * picker.
	 *
	 * @param {Object} node The selected `cq-item` options group member. Passed to the
	 * 		function by default.
	 * @param {String} [type] Indicates the type of option selected. If equal to "custom",
	 * 		indicates that the custom date option has been selected.
	 *
	 * @alias select
	 * @memberof WebComponents.cq-historical-comparison-dialog
	 * @since 7.5.0
	 */
	select({ node }, type) {
		if (type === "custom") {
			this.custom = true;
			this.radioOptions.style.display = "none";
			this.datepicker.style.display = "flex";
			this.datepicker.picker.show();
		}

		Array.from(this.querySelectorAll("cq-item")).forEach((item) => {
			item.classList.remove("ciq-active");
		});

		node.classList.add("ciq-active");
	}

	/**
	 * Calculates the date specified by a radio button. Typically called when the dialog box
	 * closes and a radio button has been selected.
	 *
	 * @alias calcDate
	 * @memberof WebComponents.cq-historical-comparison-dialog
	 * @since 7.5.0
	 */
	calcDate() {
		const option = Array.from(this.querySelectorAll("cq-item")).find((item) =>
			item.classList.contains("ciq-active")
		);
		if (!option) return null;

		const [multiplier, timeUnit] = (option.getAttribute("cq-name") || "").split(
			"-"
		);
		if (!(multiplier && timeUnit)) return null;

		// negative multiplier signals relative date in the past
		return { multiplier: multiplier * -1, timeUnit: timeUnit.toLowerCase() };
	}

	/**
	 * Closes the dialog box and adds a curve to the chart for the selected date.
	 *
	 * @alias done
	 * @memberof WebComponents.cq-historical-comparison-dialog
	 * @since 7.5.0
	 */
	done() {
		const { crossSection } = this.context.stx;
		const { symbol } = this.context.stx.chart;

		let date = this.custom ? this.datepicker.picker.getDate() : this.calcDate();
		let color = this.swatch.style.backgroundColor;

		crossSection.addCurve(symbol, date, { color });
		this.close();
	}
}

/**
 * The curve comparison web component, `<cq-curve-comparison>`, enables the addition of
 * secondary curves to cross section charts. The secondary curves plot instrument data for
 * entities that are comparable to the chart's primary entity (such as the U.K. sovereign bond
 * in comparison to the U.S. Treasury benchmark).
 *
 * A typical implementation of the component includes:
 * - A drop-down menu that enables the addition of entity curves
 * - An entity lookup dialog box which is opened from the drop-down menu
 *
 * See the example below.
 *
 * @namespace WebComponents.cq-curve-comparison
 * @since 7.5.0
 *
 * @see WebComponents.cq-comparison-tap-capture
 *
 * @example
 * <!-- Add the cq-marker attribute to make the component a visual element of the chart. -->
 * <cq-curve-comparison cq-marker class="ciq-comparison ciq-entity-comparison">
 *     <cq-menu class="cq-comparison-new">
 *         <cq-comparison-tap-capture>
 *             <!-- Add the component label. -->
 *             <cq-comparison-add-label class="ciq-no-share">
 *                 <cq-comparison-plus></cq-comparison-plus><span>Compare</span><span>...</span>
 *             </cq-comparison-add-label>
 *             <!-- Create the drop-down menu that appears when the component is selected. -->
 *             <cq-menu class="ciq-comparison-curve-menu">
 *                 <cq-menu-dropdown class="ciq-value-dropdown">
 *                     <cq-item stxtap="Layout.showEntityComparison()">Add Entity</cq-item>
 *                     <cq-item stxtap="Layout.showHistoricalComparisonDialog()">Add Historical</cq-item>
 *                 </cq-menu-dropdown>
 *             </cq-menu>
 *             <!-- Add the entity lookup dialog box which is opened by the call to Layout.showentityComparison() from the drop-down menu. -->
 *             <cq-comparison-add>
 *                 <cq-comparison-lookup-frame>
 *                     <cq-lookup cq-keystroke-claim cq-keystroke-default cq-uppercase cq-exchanges="futures,govt,muni,corp">
 *                         <cq-lookup-input cq-no-close>
 *                             <input type="text" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="none"
 *                                    name="symbol" placeholder="">
 *                             <cq-lookup-icon></cq-lookup-icon>
 *                         </cq-lookup-input>
 *                         <cq-lookup-results>
 *                             <cq-lookup-filters cq-no-close>
 *                                 <cq-filter class="true">ALL</cq-filter>
 *                                 <cq-filter>BONDS</cq-filter>
 *                                 <cq-filter>FUTURES</cq-filter>
 *                             </cq-lookup-filters>
 *                             <cq-scroll></cq-scroll>
 *                         </cq-lookup-results>
 *                     </cq-lookup>
 *                 </cq-comparison-lookup-frame>
 *                 <cq-swatch cq-no-close></cq-swatch>
 *                 <span><cq-accept-btn class="stx-btn">ADD</cq-accept-btn></span>
 *             </cq-comparison-add>
 *         </cq-comparison-tap-capture>
 *     </cq-menu>
 * </cq-curve-comparison>
 */
class CurveComparison extends CIQ.UI.ModalTag {
	constructor() {
		super();
		this.swatchColors = [];
		this.loading = [];
	}

	/**
	 * Called automatically when the component is instantiated.
	 *
	 * @memberof WebComponents.cq-curve-comparison#
	 * @private
	 * @since 7.5.0
	 */
	connectedCallback() {
		if (this.attached) return;
		super.connectedCallback();
		this.swatchColors = swatchColors;
	}

	/**
	 * Initializes the curve legend UI element.
	 *
	 * @memberof WebComponents.cq-curve-comparison#
	 * @private
	 * @since 7.5.0
	 */
	configureUI() {
		var node = this.node;
		var addNew = node.find("cq-accept-btn");
		this.template = node.find("*[cq-comparison-item]");
		var swatchColors = node.find("cq-swatch").attr("cq-colors");
		if (swatchColors) this.swatchColors = swatchColors.split(",");
		for (var i = 0; i < this.swatchColors.length; i++) {
			this.swatchColors[i] = CIQ.convertToNativeColor(this.swatchColors[i]);
		}
		var lookup = node.find("cq-lookup");
		if (lookup.length)
			lookup[0].setCallback(
				(function (self) {
					return function () {
						self.selectItem.apply(self, arguments);
					};
				})(this)
			);
		CIQ.UI.stxtap(addNew[0], function (e) {
			lookup[0].forceInput();
			e.stopPropagation();
		});
		this.template = this.parentElement.querySelector(
			"template[cq-comparison-item]"
		);
	}

	/**
	 * Sets the background color of a [cq-swatch]{@link WebComponents.cq-swatch} element
	 * contained in a [cq-curve-comparison]{@link WebComponents.cq-curve-comparison}.
	 *
	 * @alias pickSwatchColor
	 * @memberof WebComponents.cq-curve-comparison#
	 * @since 7.5.0
	 */
	pickSwatchColor() {
		const { crossSection } = this.context.stx;
		const { swatchColors } = this;
		const swatch = this.querySelector("cq-swatch");
		if (!swatch) return;
		let currentColor = swatch.style.backgroundColor;

		let usedColors = new Set();
		for (let i in crossSection.curves) {
			let curve = crossSection.curves[i];
			usedColors.add(curve.color);
		}

		if (currentColor.length && !usedColors.has(currentColor)) return;

		for (let i = 0; i < swatchColors.length; i++) {
			let swatchColor = swatchColors[i];
			if (!usedColors.has(swatchColor)) {
				swatch.style.backgroundColor = swatchColor;
				return;
			}
		}
	}

	/**
	 * Removes a secondary curve from the chart. Responds to selection of the
	 * ![Delete control](./img-X-Control.png) control associated with the curve in the
	 * [cq-study-legend]{@link WebComponents.cq-study-legend}, which displays the list of
	 * secondary curves.
	 *
	 * @param {String} curveId Identifies the curve to be removed.
	 *
	 * @alias removeCurve
	 * @memberof WebComponents.cq-curve-comparison#
	 * @since 7.5.0
	 */
	removeCurve(curveId) {
		const { crossSection } = this.context.stx;
		crossSection.removeCurve(curveId);
	}

	/**
	 * Creates the list of secondary curves displayed in the
	 * [cq-study-legend]{@link WebComponents.cq-study-legend}.
	 *
	 * @alias renderLegend
	 * @memberof WebComponents.cq-curve-comparison#
	 * @since 7.5.0
	 */
	renderLegend() {
		const { stx } = this.context;
		const { crossSection } = stx;

		function tapFunction(self, curveId) {
			return function () {
				self.nomore = true;
				self.removeCurve(curveId);
				self.modalEnd(); // tricky, we miss mouseout events when we remove items from under ourselves
			};
		}

		this.pickSwatchColor();
		stx.getDefaultColor();

		let key = CIQ.cqvirtual(this.querySelector("cq-curve-comparison-key"));
		if (!key) return;

		var keyAppend = (i) => key.appendChild(i);
		for (let curveId in crossSection.curves) {
			if (curveId === "_main_curve") continue;
			let curve = crossSection.curves[curveId];
			let frag = CIQ.UI.makeFromTemplate(this.template);
			let comparisonSwatch = frag.find("cq-comparison-swatch");
			let swatch = frag.find("cq-swatch");
			let label = frag.find("cq-comparison-label");
			let loader = frag.find("cq-comparison-loader");
			let btn = frag.find(".ciq-close");

			let { color, symbol, Date: dateObj, error, live, hidden } = curve;

			if (error) frag.attr("cq-error", true);

			let isAuto = color == "auto";
			if (isAuto) color = stx.defaultColor;

			comparisonSwatch.css({ background: color });

			if (swatch.length) {
				swatch[0].curveId = curveId;
				swatch[0].setColor(color, false, isAuto);
			}

			let labelText = "";
			if (curve.relativeDate) {
				const { timeUnit, multiplier } = curve.relativeDate;
				if (multiplier === 0) {
					const mainCurve = crossSection.curves._main_curve;
					if (mainCurve.live) labelText += "LATEST";
					else labelText += mainCurve.Date.toLocaleDateString();
				} else {
					labelText += `(${multiplier < 0 ? "-" : "+"}${Math.abs(
						multiplier
					)}${timeUnit.slice(0, 1)})`.toUpperCase();
				}
			} else if (live) {
				labelText += "LATEST";
			} else {
				labelText += dateObj.toLocaleDateString();
			}
			labelText += ` ${symbol}`;

			if (hidden) label.css("opacity", 0.5);

			label.text(stx.translateIf(labelText));
			frag.attr("cq-symbol", curveId);

			if (this.loading[symbol]) loader.addClass("stx-show");
			else loader.removeClass("stx-show");

			CIQ.UI.stxtap(btn[0], tapFunction(this, curveId));

			Array.from(frag).forEach(keyAppend);
		}

		let legendParent = CIQ.climbUpDomTree(CIQ.cqrender(key), "cq-study-legend");
		legendParent.forEach((i) => {
			if (i.displayLegendTitle) i.displayLegendTitle();
		});
	}

	/**
	 * Sets the color of a curve. Responds to a change in the color of the swatch associated
	 * with the curve in the [cq-study-legend]{@link WebComponents.cq-study-legend}, which
	 * displays the list of secondary curves.
	 *
	 * @param {String} color The color to apply to the curve.
	 * @param {Object} swatch Represents the color swatch associated with the curve in the
	 * 		[cq-study-legend]{@link WebComponents.cq-study-legend}. Identifies the curve.
	 *
	 * @alias setColor
	 * @memberof WebComponents.cq-curve-comparison#
	 * @since 7.5.0
	 */
	setColor(color, swatch) {
		const { crossSection } = this.context.stx;
		if (swatch.curveId) crossSection.modifyCurve(swatch.curveId, { color });
	}

	/**
	 * Adds a secondary curve to the chart based on the selection of a symbol from the entity
	 * lookup dialog box. Sets the curve color to that of the entity lookup's color swatch.
	 *
	 * @param {object} obj Contains information about the selected entity.
	 * @param {string} obj.symbol The symbol of the selected entity.
	 *
	 * @alias selectItem
	 * @memberof WebComponents.cq-curve-comparison#
	 * @since
	 * - 7.5.0
	 * - 8.2.0 Removed the `context` parameter. The context is now accessed from the base
	 * 		component class.
	 */
	selectItem(obj) {
		const self = this;
		const { stx } = this.context;
		const { crossSection } = stx;
		const { _main_curve } = crossSection.curves;
		let color = this.querySelector("cq-swatch").style.backgroundColor;
		let date = _main_curve.live ? "live" : _main_curve.Date;
		let newCurveDate = date === "live" ? new Date() : date;

		for (let i in crossSection.curves) {
			let curve = crossSection.curves[i];
			if (
				curve.symbol.toLowerCase() === obj.symbol.toLowerCase() &&
				curve.Date.getTime() === newCurveDate.getTime()
			) {
				return; // curve already exists
			}
		}

		function cb() {
			self.loading[obj.symbol] = false;
			self.renderLegend();
		}

		crossSection.addCurve(
			obj.symbol,
			{ timeUnit: "day", multiplier: 0 },
			{ color },
			cb
		);
		this.loading[obj.symbol] = true;
	}

	/**
	 * Sets the component context when the chart context is constructed.
	 *
	 * @memberof WebComponents.cq-curve-comparison#
	 * @private
	 * @since 7.5.0
	 */
	setContext() {
		const self = this;
		const { stx } = this.context;

		this.node.attr("cq-show", "true");
		this.configureUI();

		function renderIfChanged() {
			self.renderLegend();
		}

		this.eventListeners.push(stx.addEventListener("layout", renderIfChanged));
		this.eventListeners.push(stx.addEventListener("theme", renderIfChanged));
		this.eventListeners.push(
			stx.addEventListener("curveChange", renderIfChanged)
		);

		stx.append("modifySeries", function () {
			self.renderLegend();
		});

		this.renderLegend();
	}
}
/**
 * The comparison tap capture web component, `cq-comparison-tap-capture`, surrounds `cq-menu`
 * and `cq-comparison-lookup-frame` components to handle the selection of items from menus and
 * lookup dialog boxes that are part of a comparison control. The control enables the addition
 * of secondary curves to a cross section chart.
 *
 * @namespace WebComponents.cq-comparison-tap-capture
 * @since 7.5.0
 *
 * @see WebComponents.cq-curve-comparison
 *
 * @example
 * <cq-curve-comparison cq-marker class="ciq-comparison ciq-entity-comparison">
 *     <cq-menu class="cq-comparison-new">
 *         <cq-comparison-tap-capture>
 *             <cq-comparison-add-label class="ciq-no-share">
 *                 <cq-comparison-plus></cq-comparison-plus><span>Compare</span><span>...</span>
 *             </cq-comparison-add-label>
 *             <cq-menu class="ciq-comparison-curve-menu">
 *                 <cq-menu-dropdown class="ciq-value-dropdown">
 *                     <cq-item stxtap="Layout.showEntityComparison()">Add Entity</cq-item>
 *                     <cq-item stxtap="Layout.showHistoricalComparisonDialog()">Add Historical</cq-item>
 *                 </cq-menu-dropdown>
 *             </cq-menu>
 *             <cq-comparison-add>
 *                 <cq-comparison-lookup-frame>
 *                     <cq-lookup cq-keystroke-claim cq-keystroke-default cq-uppercase cq-exchanges="futures,govt,muni,corp">
 *                         <cq-lookup-input cq-no-close>
 *                             <input type="text" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="none"
 *                                    name="symbol" placeholder="">
 *                             <cq-lookup-icon></cq-lookup-icon>
 *                         </cq-lookup-input>
 *                         <cq-lookup-results>
 *                             <cq-lookup-filters cq-no-close>
 *                                 <cq-filter class="true">ALL</cq-filter>
 *                                 <cq-filter>BONDS</cq-filter>
 *                                 <cq-filter>FUTURES</cq-filter>
 *                             </cq-lookup-filters>
 *                             <cq-scroll></cq-scroll>
 *                         </cq-lookup-results>
 *                     </cq-lookup>
 *                 </cq-comparison-lookup-frame>
 *                 <cq-swatch cq-no-close></cq-swatch>
 *                 <span><cq-accept-btn class="stx-btn">ADD</cq-accept-btn></span>
 *             </cq-comparison-add>
 *         </cq-comparison-tap-capture>
 *     </cq-menu>
 * </cq-curve-comparison>
 */
class ComparisonTapCapture extends CIQ.UI.ContextTag {
	constructor() {
		super();
		this.handleTap = this.handleTap.bind(this);
	}

	/**
	 * Called automatically when the component is instantiated.
	 *
	 * @memberof WebComponents.cq-comparison-tap-capture
	 * @private
	 * @since 7.5.0
	 */
	connectedCallback() {
		if (this.attached) return;
		super.connectedCallback();
		this.attached = true;

		this.addEventListener("stxtap", this.handleTap, true);
	}

	/**
	 * Sets the component context when the chart context is constructed.
	 *
	 * @param {CIQ.UI.Context} context The chart context.
	 *
	 * @memberof WebComponents.cq-comparison-tap-capture
	 * @private
	 * @since 7.5.0
	 */
	setContext(context) {
		this.symbolEntry = context.topNode.querySelector(".cq-comparison-new");
		this.dropdown = context.topNode.querySelector(
			"cq-menu.ciq-comparison-curve-menu"
		);
	}

	/**
	 * Responds to selection events on elements contained within the `cq-comparison-tap-capture`
	 * component.
	 *
	 * @param {Object} e The selection event object.
	 *
	 * @memberof WebComponents.cq-comparison-tap-capture
	 * @private
	 * @since 7.5.0
	 */
	handleTap(e) {
		let targetType = e.target.tagName;
		let dropdownActive = this.dropdown.classList.contains("stxMenuActive");
		let symbolEntryActive = this.symbolEntry.classList.contains(
			"stxMenuActive"
		);

		// if neither menu is open OR dropdown is open and click was not on dropdown, stop propagation
		if (
			(!dropdownActive && !symbolEntryActive) ||
			(dropdownActive && targetType !== "CQ-ITEM")
		) {
			e.stopPropagation();
		}

		// don't open options dropdown if symbol entry is open
		if (!symbolEntryActive) {
			if (dropdownActive) {
				this.dropdown.close();
			} else {
				this.dropdown.open();
			}
		}
	}
}

/**
 * Opens the historical comparison dialog box.
 *
 * @param {Object} e Event object.
 *
 * @memberof CIQ.UI.Layout
 * @private
 * @since 7.5.0
 */
CIQ.UI.Layout.prototype.showHistoricalComparisonDialog = function ({ e }) {
	const dialog = document.querySelector("cq-historical-comparison-dialog");
	dialog.open({ context: this.context });
};

/**
 * Opens the entity comparison lookup dialog box.
 *
 * @param {Object} e Event object.
 *
 * @memberof CIQ.UI.Layout
 * @private
 * @since 7.5.0
 */
CIQ.UI.Layout.prototype.showEntityComparison = function ({ e }) {
	e.stopPropagation(); // prevent menu from closing as event propagates
	const menu = document.querySelector(".ciq-entity-comparison cq-menu");
	const detachedDropdown = document.querySelector(
		"cq-comparison-tap-capture cq-menu"
	);
	detachedDropdown.close();
	menu.open();
};

/**
 * **Deprecated.** Use {@link CIQ.UI.Layout#setYaxisField} instead.
 *
 * Helper function that exposes {@link CIQ.CrossSection#setYaxisField} to the layout for access
 * in the web components.
 *
 * @param {HTMLElement} arguments[0].node The user interface element where the click or tap that
 * 		calls this function originated.
 * @param {object} arguments[0].params Additional information about where the click or tap
 * 		originated, including the parent element.
 * @param {string} field Specifies the type of values plotted on the y-axis of the cross section
 * 		chart; for example, "yield", "bid", or "ask", which are the interest rate and trading
 * 		prices of instruments in a term structure of interest rates.
 *
 * @memberof CIQ.UI.Layout
 * @deprecated Use {@link CIQ.UI.Layout#setYaxisField}.
 * @since
 * - 7.3.0
 * - 8.3.0 Deprecated.
 */
CIQ.UI.Layout.prototype.setDataField = function ({ node, params }, field) {
	this.setYaxisField({ node, params }, field);
};

/**
 * **Deprecated.** Use yaxisField instead.
 *
 * Helper function for binding the value of the data field drop-down menu.
 *
 * @param {HTMLElement} node The HTML element bound to the helper.
 *
 * @memberof CIQ.UI.Layout
 * @private
 * @deprecated Use yaxisField.
 * @since
 * - 7.3.0
 * - 8.3.0 Deprecated.
 */
CIQ.UI.Layout.prototype.dataField = function (node) {
	this.yaxisField(node);
};

/**
 * Helper function that exposes {@link CIQ.CrossSection#setYaxisField} to the layout for access
 * by the web components.
 *
 * @param {HTMLElement} arguments[0].node The user interface element where the click or tap that
 * 		calls this function originated.
 * @param {object} arguments[0].params Additional information about where the click or tap
 * 		originated, including the parent element.
 * @param {string} field Specifies the type of values plotted on the y-axis of the cross section
 * 		graph; for example, "yield", "bid", "mid", or "ask", which are the interest rate and
 * 		trading prices for instruments in a term structure of interest rates.
 * @param {string} [aggOperator] Specifies how multiple values for the same record are aggregated.
 * 		The value plotted on the y-axis is the result of the aggregation operation. See
 * 		{@link CIQ.CrossSection#setYaxisField} for valid values.
 *
 * @memberof CIQ.UI.Layout
 * @since 8.3.0
 *
 * @example
 * 	<div class="ciq-dropdowns">
 *      <cq-menu class="ciq-menu">
 *          <cq-clickable stxbind="Layout.yaxisField" class="ciq-yaxisField-span">Yield</cq-clickable>
 *          <cq-menu-dropdown class="ciq-value-dropdown">
 *              <cq-item stxtap="Layout.setYaxisField('yield')">Yield</cq-item>
 *              <cq-item stxtap="Layout.setYaxisField('bid')">Bid</cq-item>
 *              <cq-item stxtap="Layout.setYaxisField('mid')">Mid</cq-item>
 *              <cq-item stxtap="Layout.setYaxisField('ask')">Ask</cq-item>
 *          </cq-menu-dropdown>
 *      </cq-menu>
 * 	</div>
 */
CIQ.UI.Layout.prototype.setYaxisField = function (
	{ node, params },
	field,
	aggOperator
) {
	this.context.stx.crossSection.setYaxisField(field, aggOperator);
};

/**
 * Helper function that exposes {@link CIQ.CrossSection#setXaxisField} to the layout for access
 * by the web components.
 *
 * @param {HTMLElement} arguments[0].node The user interface element where the click or tap that
 * 		calls this function originated.
 * @param {object} arguments[0].params Additional information about where the click or tap
 * 		originated, including the parent element.
 * @param {string} field Specifies the type of values plotted on the x-axis of the cross section
 * 		chart; for example, "strike" or "expiration" for the strike price and expiration date of
 * 		options.
 *
 * @memberof CIQ.UI.Layout
 * @since 8.3.0
 */
CIQ.UI.Layout.prototype.setXaxisField = function ({ node, params }, field) {
	this.context.stx.crossSection.setXaxisField(field);
};

/**
 * Helper function that exposes {@link CIQ.CrossSection#setGroupField} to the layout for access by
 * the web components.
 *
 * @param {HTMLElement} arguments[0].node The user interface element where the click or tap that
 * 		calls this function originated.
 * @param {object} arguments[0].params Additional information about where the click or tap
 * 		originated, including the parent element.
 * @param {string} field Specifies the field used to group items into subcurves; for example,
 * 		"strike" or "expiration" for the strike price and expiration date of options.
 *
 * @memberof CIQ.UI.Layout
 * @since 8.3.0
 */
CIQ.UI.Layout.prototype.setGroupField = function ({ node, params }, field) {
	this.context.stx.crossSection.setGroupField(field);
};

/**
 * Helper function for binding the value of the y-axis field drop-down menu.
 *
 * @param {HTMLElement} node The user interface element bound to the helper.
 *
 * @memberof CIQ.UI.Layout
 * @private
 * @since 8.3.0
 */
CIQ.UI.Layout.prototype.yaxisField = function (node) {
	const { crossSection, layout } = this.context.stx;
	function listener() {
		let field = layout.yaxisField;
		node.innerHTML = crossSection.formatter(field);
	}
	const prop = "yaxisField";
	if (typeof layout[prop] !== "string")
		layout[prop] = crossSection.initialSettings[prop];
	CIQ.UI.observeProperty(prop, layout, listener);
};

/**
 * Helper function for binding the value of the x-axis field drop-down menu.
 *
 * @param {HTMLElement} node The user interface element bound to the helper.
 *
 * @memberof CIQ.UI.Layout
 * @private
 * @since 8.3.0
 */
CIQ.UI.Layout.prototype.xaxisField = function (node) {
	const { crossSection, layout } = this.context.stx;
	function listener() {
		let field = layout.xaxisField;
		node.innerHTML = crossSection.formatter(field);
	}
	const prop = "xaxisField";
	if (typeof layout[prop] !== "string")
		layout[prop] = crossSection.initialSettings[prop];
	CIQ.UI.observeProperty(prop, layout, listener);
};

/**
 * Helper function for binding the value of the grouping field drop-down menu.
 *
 * @param {HTMLElement} node The user interface element bound to the helper.
 *
 * @memberof CIQ.UI.Layout
 * @private
 * @since 8.3.0
 */
CIQ.UI.Layout.prototype.groupField = function (node) {
	const { crossSection, layout } = this.context.stx;
	function listener() {
		let field = layout.groupField;
		let innerHTML = field.split(",");
		innerHTML.forEach((f, i) => {
			innerHTML[i] = crossSection.formatter(f);
		});
		node.innerHTML = innerHTML.join(", ");
	}
	const prop = "groupField";
	if (typeof layout[prop] !== "string")
		layout[prop] = crossSection.initialSettings[prop];
	CIQ.UI.observeProperty(prop, layout, listener);
};

// Utility to update element class names contingent on the value returned from the observer
function observerCallback(node, className) {
	return function listener({ value }) {
		if (value) node.classList.add(className);
		else node.classList.remove(className);
	};
}

/**
 * Gets the value of the cross section shading property.
 *
 * @param {HTMLElement} node The shading control, which turns shading on or off.
 *
 * @memberof CIQ.UI.Layout
 * @private
 * @since 7.4.0
 */
CIQ.UI.Layout.prototype.getShading = function (node) {
	const { crossSection, layout } = this.context.stx;
	const className = this.params.activeClassName;
	const prop = "drawShading";
	if (typeof layout[prop] !== "boolean")
		layout[prop] = crossSection.initialSettings[prop];
	CIQ.UI.observeProperty(prop, layout, observerCallback(node, className));
};

/**
 * Sets the value of the cross section shading property.
 *
 * @param {HTMLElement} node
 * @param {String} field
 *
 * @memberof CIQ.UI.Layout
 * @private
 * @since 7.4.0
 */
CIQ.UI.Layout.prototype.setShading = function (node, field) {
	const { crossSection, layout } = this.context.stx;
	crossSection.setShading(!layout.drawShading);
};

/**
 * Gets the value of the cross section x-axis scaling property.
 *
 * @param {HTMLElement} node The x-axis scaling control, which turns scaling on or off.
 *
 * @memberof CIQ.UI.Layout
 * @private
 * @since 7.4.0
 */
CIQ.UI.Layout.prototype.getXAxisScaling = function (node) {
	const { crossSection, layout } = this.context.stx;
	const className = this.params.activeClassName;

	function listener(obj) {
		if (obj.value === "scaled") node.classList.add(className);
		else node.classList.remove(className);
	}
	const prop = "spacingType";
	if (typeof layout[prop] !== "string")
		layout[prop] = crossSection.initialSettings[prop];
	CIQ.UI.observeProperty(prop, layout, listener);
};

/**
 * Sets the value of the cross section x-axis scaling property.
 *
 * @param {HTMLElement} node
 * @param {String} field
 *
 * @memberof CIQ.UI.Layout
 * @private
 * @since 7.4.0
 */
CIQ.UI.Layout.prototype.setXAxisScaling = function (node, field) {
	const { layout, crossSection } = this.context.stx;
	let newSpacingType = layout.spacingType === "scaled" ? "uniform" : "scaled";
	crossSection.setSpacingType(newSpacingType);
};

/**
 * Gets the value of the property that determines whether cross section fresh data points are
 * highlighted.
 *
 * @param {HTMLElement} node The recent updates control, which turns recent update highlighting
 * 		on or off.
 *
 * @memberof CIQ.UI.Layout
 * @private
 * @since 7.4.0
 */
CIQ.UI.Layout.prototype.getFreshPoints = function (node) {
	const { crossSection, layout } = this.context.stx;
	const className = this.params.activeClassName;
	const prop = "showcaseFreshPoints";
	if (typeof layout[prop] !== "boolean")
		layout[prop] = crossSection.initialSettings[prop];
	CIQ.UI.observeProperty(prop, layout, observerCallback(node, className));
};

/**
 * Sets the value of the property that determines whether cross section fresh data points are
 * highlighted.
 *
 * @param {HTMLElement} node
 * @param {String} field
 *
 * @memberof CIQ.UI.Layout
 * @private
 * @since 7.4.0
 */
CIQ.UI.Layout.prototype.setFreshPoints = function (node, field) {
	const { layout, crossSection } = this.context.stx;
	crossSection.setShowcaseFreshPoints(!layout.showcaseFreshPoints);
};

/**
 * Gets the value of the property that determines whether cross section data points display an
 * update time stamp when the data point is tapped or moused over.
 *
 * @param {HTMLElement} node The update timestamp control, which turns update timestamps on
 * 		or off.
 *
 * @memberof CIQ.UI.Layout
 * @private
 * @since 7.4.0
 */
CIQ.UI.Layout.prototype.getUpdateStamp = function (node) {
	const { crossSection, layout } = this.context.stx;
	const className = this.params.activeClassName;
	const prop = "showUpdateStamp";
	if (typeof layout[prop] !== "boolean")
		layout[prop] = crossSection.initialSettings[prop];
	CIQ.UI.observeProperty(prop, layout, observerCallback(node, className));
};

/**
 * Sets the value of the property that determines whether cross section data points display an
 * update time stamp when the data point is tapped or moused over.
 *
 * @param {HTMLElement} node
 * @param {String} field
 *
 * @memberof CIQ.UI.Layout
 * @private
 * @since 7.4.0
 */
CIQ.UI.Layout.prototype.setUpdateStamp = function (node, field) {
	const { layout, crossSection } = this.context.stx;
	crossSection.setShowUpdateStamp(!layout.showUpdateStamp);
};

/**
 * Gets the value of the property that determines whether an animation is displayed when cross
 * section data points are updated.
 *
 * @param {HTMLElement} node The update animations control, which turns update animations on
 * 		or off.
 *
 * @memberof CIQ.UI.Layout
 * @private
 * @since 7.4.0
 */
CIQ.UI.Layout.prototype.getUpdateAnimations = function (node) {
	const { crossSection, layout } = this.context.stx;
	const className = this.params.activeClassName;
	const prop = "showUpdateAnimations";
	if (typeof layout[prop] !== "boolean")
		layout[prop] = crossSection.initialSettings[prop];
	CIQ.UI.observeProperty(prop, layout, observerCallback(node, className));
};

/**
 * Sets the value of the property that determines whether an animation is displayed when cross
 * section data points are updated.
 *
 * @param {HTMLElement} node
 * @param {String} field
 *
 * @memberof CIQ.UI.Layout
 * @private
 * @since 7.4.0
 */
CIQ.UI.Layout.prototype.setUpdateAnimations = function (node, field) {
	const { layout, crossSection } = this.context.stx;
	crossSection.setUpdateAnimations(!layout.showUpdateAnimations);
};

/**
 * Gets the value of the property that determines whether the timeline date selector is displayed
 * when the control (typically a check box) that opens and closes the selector is selected or
 * de-selected.
 *
 * @param {HTMLElement} node The DOM element that serves as the control that opens and closes the
 * 		timeline date selector.
 *
 * @memberof CIQ.UI.Layout
 * @private
 * @since 8.3.0
 */
CIQ.UI.Layout.prototype.getTimelineDateSelector = function (node) {
	const { layout } = this.context.stx;
	const className = this.params.activeClassName;
	const prop = "timelineDateSelector";
	CIQ.UI.observeProperty(prop, layout, observerCallback(node, className));
};

/**
 * Sets the value of the property that determines whether the timeline date selector is displayed
 * when the control (typically a check box) that opens and closes the selector is selected or
 * de-selected.
 *
 * @param {HTMLElement} node The DOM element that servse as the control that opens and closes the
 * 		timeline date selector.
 * @param {string} [field] Unused.
 *
 * @memberof CIQ.UI.Layout
 * @private
 * @since 8.3.0
 */
CIQ.UI.Layout.prototype.setTimelineDateSelector = function (node, field) {
	const { stx } = this.context;
	const { layout } = stx;
	layout.timelineDateSelector = !layout.timelineDateSelector;
	stx.changeOccurred("layout");
};

// cq-curve-context needs no special behavior we just want it to be semantically named
CIQ.UI.addComponentDefinition("cq-curve-context", CIQ.UI.DialogContentTag);
CIQ.UI.addComponentDefinition("cq-freshness-dialog", FreshnessDialog);
CIQ.UI.addComponentDefinition(
	"cq-historical-comparison-dialog",
	HistoricalComparisonDialog
);
CIQ.UI.addComponentDefinition(
	"cq-comparison-tap-capture",
	ComparisonTapCapture
);
CIQ.UI.addComponentDefinition("cq-curve-comparison", CurveComparison);

/**
 * Creates a heads-up display (HUD) of cross section data for the data point selected by the chart
 * crosshairs.
 *
 * @param {HTMLElement} [node=context.topNode] The HUD is automatically attached to the DOM node
 * 		that contains the chart; and so, this parameter is not used. See
 * 		[getContainer]{@link CIQ.CrossSection.HUD#getContainer}.
 * @param {CIQ.UI.Context} context The chart context.
 *
 * @name CIQ.CrossSection.HUD
 * @class
 * @since
 * - 8.2.0
 * - 8.3.0 Renamed from `CIQ.TermStructure.HUD`. Changed constructor signature from
 * 		`constructor({ stx })`.
 */
class HUD {
	constructor(node, context) {
		const stx = (this.stx = context.stx);
		const $node = CIQ.UI.$(node || context.topNode);
		this.node = $node[0];

		this.title = stx.container.querySelector("cq-chart-title");
		this.el = this.getContainer(stx.container);

		const show = this.show.bind(this);
		const hide = this.hide.bind(this);

		stx.prepend("headsUpHR", () => {
			show();
			return true;
		});
		stx.append("handleMouseOut", hide);
		stx.addEventListener("layout", show);

		this.node.setAttribute("crosssection-hud-active", "");

		stx.crossSection.hud = this;
	}

	/**
	 * Shows the heads-up display.
	 *
	 * @alias show
	 * @memberof CIQ.CrossSection.HUD#
	 * @since 8.2.0
	 */
	show() {
		const { stx } = this;
		if (!stx.layout.headsUp || !stx.layout.headsUp.crosssection) {
			this.hide();
			return;
		}

		const content = this.getContent(stx);

		if (content) {
			Object.assign(this.el.style, {
				left: this.title.offsetWidth + 40 + "px"
			});
			this.render(content, this.el);
		} else {
			this.hide();
		}
	}

	/**
	 * Hides the heads-up display.
	 *
	 * @alias hide
	 * @memberof CIQ.CrossSection.HUD#
	 * @since 8.2.0
	 */
	hide() {
		if (this.el) this.el.style.display = "none";
	}

	/**
	 * Renders the heads-up display as HTML.
	 *
	 * @param {object} content The data that constitutes the heads-up display. See
	 * 		[getContent]{@link CIQ.CrossSection.HUD#getContent}.
	 * @param {string} content.dataField The data element, such as yield, on which the cross
	 * 		section is based.
	 * @param {string} content.symbol The market symbol of the entity for which the cross section
	 * 		is constructed; for example, "US-T BENCHMARK" for the U.S. Treasury yield curve.
	 * @param {string} content.color The color of the swatch in the HUD for the main curve. Can be
	 * 		any of the forms supported by the
	 * 		<a href="https://developer.mozilla.org/en-US/docs/Web/CSS/color_value"
	 * 		target="_blank"> CSS color data type</a>.
	 * @param {string} content.instrument The instrument of the cross section
	 * 		(such as 6&nbsp;MO or 1&nbsp;YR for the yield curve) for which information is
	 * 		displayed in the HUD.
	 * @param {Date} content.date The date for which the main curve of the cross section is
	 * 		graphed.
	 * @param {boolean} content.live Indicates whether the cross section applies to the current
	 * 		date. When true, the chart can be reloaded at a later date and the cross section will
	 * 		be reconstructed for that date (the current date) regardless of when the cross
	 * 		section was created.
	 * @param {object} content.mainData Data for the main curve for the instrument specified by
	 * 		`content.instrument` (see above); for example, yield, bid, ask, and mid for a yield curve
	 * 		term structure.
	 * @param {object[]} content.secondary Data for the cross section secondary curves
	 * 		(comparison and historical curves) for the instrument specified by `content.instrument`
	 * 		(see above). Each object in the array represents a secondary curve and has the properties
	 * 		below.
	 * @param {string} content.secondary.color The color of the swatch in the HUD for the
	 * 		secondary curve. Can be any of the forms supported by the
	 * 		<a href="https://developer.mozilla.org/en-US/docs/Web/CSS/color_value"
	 * 		target="_blank"> CSS color data type</a>.
	 * @param {string} content.secondary.date If the curve is an entity (or comparison) curve, the
	 * 		date of the curve. If the curve is an historical curve, the reference date for the
	 * 		relative date of the curve. Equal to the date of the main curve.
	 * @param {object} content.secondary.relativeDate A time unit and multiplier that specifies
	 * 		a date relative to the date of the main curve (see
	 * 		{@link CIQ.CrossSection.calculateRelativeDate}).
	 * @param {string} [content.secondary.relativeDate.timeUnit] Unit of time by which a relative
	 * 		date is offset from the date of the main curve.
	 * @param {number} [content.secondary.relativeDate.multiplier] Number of time units a relative
	 * 		date is offset from the date of the main curve.
	 * @param {string} content.secondary.symbol The symbol of the entity for which the cross
	 * 		section represented by the secondary curve is constructed.
	 * @param {string} content.secondary.value The value for the secondary curve for the instrument
	 * 		specified by `content.instrument` (see above).
	 * @param {string[]} [content.fieldsToFormatAsPercent=[]] The data fields (see
	 * 		`content.mainData`) formatted as percentages in the heads-up display.
	 * @param {function} [params.decimalPlaces] Function to determine number of decimal places for a
	 * 		 numeric value.
	 * @param {HTMLElement} el The DOM element that contains the rendered content of the
	 * 		heads-up display.
	 *
	 * @alias render
	 * @memberof CIQ.CrossSection.HUD#
	 * @since 8.2.0
	 */
	render(content, el) {
		const {
			dataField,
			symbol,
			color,
			instrument,
			date,
			relativeDate,
			live,
			mainData,
			secondary,
			fieldsToFormatAsPercent = [],
			decimalPlaces
		} = content;

		const formatDate = (dt) => CIQ.dateToStr(dt, "MM/dd/YYYY");
		const usePercent = fieldsToFormatAsPercent.includes(dataField) ? "%" : "";
		const { getValueFromMaybeObject } = CIQ.CrossSection;

		const getValueFrom = (rawValue, name) => {
			const value = getValueFromMaybeObject(rawValue);
			const formattedValue =
				typeof value === "number"
					? value.toFixed(decimalPlaces(name))
					: value instanceof Date
					? CIQ.friendlyDate(value)
					: value;
			return formattedValue;
		};
		const curveField = ({
			date,
			symbol,
			value,
			color,
			isMain,
			relativeDate: { timeUnit, multiplier } = {},
			hidden
		}) => {
			value = getValueFrom(value, dataField);
			if (!value && value !== 0) return "";
			const displayDate =
				(live && isMain) || (live && multiplier === 0)
					? this.latestLabel || "LATEST"
					: multiplier && timeUnit
					? this.getRelativeDateLabel(multiplier, timeUnit)
					: formatDate(date);

			return `<tr class="ciq-curve-field">
					<td style="opacity: ${hidden ? 0.5 : 1}">
					<div style="background-color: ${color}"></div>
					<b>${symbol || ""}</b>
					${displayDate}
					</td>
					<td>${value}${usePercent}</td>
				</tr>
			`;
		};

		const fields = secondary.length
			? []
			: Object.entries(mainData || {})
					.filter(([name]) => name !== dataField && name[0] !== "_")
					.map(([name, obj]) => {
						const usePercent = fieldsToFormatAsPercent.includes(name)
							? "%"
							: "";
						const value = getValueFrom(obj, name);
						if (!value && value !== 0) return "";
						return `
					<tr class="ciq-info-field">
						<td>${this.stx.crossSection.formatter(name)}</td>
						<td>${value}${usePercent}</td>
					</tr>
				`;
					})
					.join("");
		const otherCurves = secondary.map(curveField).join("");
		let value = (mainData || {})[dataField];
		if (!value && value !== 0) value = {};
		value = getValueFromMaybeObject(value);
		el.innerHTML = `
			<strong>${instrument} - ${this.stx.crossSection.formatter(dataField)}</strong>
			<table>
			${curveField({ date, relativeDate, symbol, value, color, isMain: true })}
			${fields}
			${otherCurves}
			</table>
		`;
		if (el) el.style.display = "block";
	}

	/**
	 * Returns a label for a date that is relative to the date of the main curve.
	 *
	 * Override this method in a subclass of {@link CIQ.CrossSection.HUD} or in the `postInstall`
	 * function of the `crossSection` property of the chart configuration object (see the example
	 * below).
	 *
	 * @param {string} timeUnit Unit of time by which a relative date is offset from the date of
	 * 		the main curve. See {@link CIQ.CrossSection.calculateRelativeDate} for valid values.
	 * @param {number} multiplier Number of time units a relative date is offset from the date of
	 * 		the main curve. A negative number offsets the date into the past; a positive number,
	 * 		the future. Zero locks the date of the historical curve to the date of the main curve.
	 * @return {string} A string composed of the multiplier and time unit; for example, "-1 MONTH".
	 *
	 * @alias getRelativeDateLabel
	 * @memberof CIQ.CrossSection.HUD#
	 * @since 8.2.0
	 *
	 * @example <caption>Customize the cross section <code>postInstall</code> function of the
	 * chart configuration object. See the {@tutorial Chart Configuration} tutorial.</caption>
	 * crossSection: {
	 *     postInstall ({ uiContext, extension }) {
	 *         // Change the relative label display for all time units; for example, from "-1 MONTH" to "1 Month Ago".
	 *         extension.hud.getRelativeDateLabel = (multiplier, timeUnit) =>
	 *             Math.abs(multiplier) +
	 *             " " +
	 *             CIQ.capitalize(timeUnit) + (Math.abs(multiplier) > 1 ? "s" : "") +
	 *             " Ago";
	 *     }
	 * }
	 */
	getRelativeDateLabel(multiplier, timeUnit) {
		return `${multiplier} ${timeUnit.toUpperCase()}`;
	}

	/**
	 * Extracts content from the chart engine for the heads-up display.
	 *
	 * @param {CIQ.ChartEngine} stx A reference to the chart engine.
	 * @return {object} Contains the data for the heads-up display.
	 *
	 * @alias getContent
	 * @memberof CIQ.CrossSection.HUD#
	 * @since 8.2.0
	 */
	getContent(stx) {
		const {
			cx,
			cy,
			chart: { left, right, top, bottom, dataSegment },
			insideChart,
			crossSection: {
				cx: tscx,
				cy: tscy,
				curves,
				curveData,
				instruments,
				fieldsToFormatAsPercent,
				highlighted,
				pointToQuoteMap,
				decimalPlaces
			}
		} = stx;

		const x = cx !== undefined ? cx : tscx;
		const y = cy !== undefined ? cy : tscy;
		if (!insideChart || x < left || x > right || y < top || y > bottom) {
			return;
		}
		const hasSubcurves = curves._main_curve.subcurves;
		let { curve, instrument } = highlighted;
		if (!curve && hasSubcurves) return;

		const bar = Math.min(stx.barFromPixel(x), dataSegment.length - 1);
		const dSeg = dataSegment[x < stx.pixelFromBar(bar) ? bar - 1 : bar];
		if (dSeg && !instrument && !hasSubcurves) {
			instrument = dSeg.instrument;
		}
		if (!instrument) return;
		if (!hasSubcurves) curve = Object.keys(curveData)[0];

		let mainData = curveData[curve][instrument];
		if (hasSubcurves) {
			if (mainData) mainData = mainData[highlighted.subcurve];
			if (!mainData) return;
		} else {
			if (curve !== "_main_curve") mainData = null;
		}

		const {
			Date: date,
			relativeDate,
			live,
			symbol,
			color = stx.defaultColor
		} = curves[curve];

		const curveSymbol =
			!mainData || typeof mainData._originalKey === "undefined"
				? symbol
				: mainData._originalKey;

		let secondary = [];
		if (!hasSubcurves) {
			secondary = Object.entries(curves)
				.filter(([name]) => name !== "_main_curve" && pointToQuoteMap[name])
				.map(([name, { symbol, Date: date, color, relativeDate, hidden }]) => {
					const value = dSeg[name];
					return { date, relativeDate, symbol, value, color, hidden };
				});
		}

		return {
			dataField: stx.layout.yaxisField,
			instrument,
			date,
			relativeDate,
			live,
			symbol: curveSymbol,
			color,
			mainData,
			secondary,
			fieldsToFormatAsPercent,
			decimalPlaces
		};
	}

	/**
	 * Gets the DOM element within `container` that represents the heads-up display. If an element
	 * does not exist, creates one within `container`.
	 *
	 * @param {HTMLElement} container The DOM element that contains the chart. The heads-up
	 * 		display is a sub-element of this element.
	 * @return {HTMLElement} The heads-up display DOM element.
	 *
	 * @alias getContainer
	 * @memberof CIQ.CrossSection.HUD#
	 * @since 8.2.0
	 */
	getContainer(container) {
		let el = container.querySelector("cq-hud-crosssection");
		if (el) return el;

		const holder = container.querySelector(".stx-subholder");
		el = document.createElement("cq-hud-crosssection");
		if (this.title) {
			this.title.after(el);
		} else {
			holder.append(el);
		}
		Object.assign(el.style, { position: "absolute", top: 0, padding: "8px" });
		return el;
	}
}

CIQ.CrossSection.HUD = HUD;
