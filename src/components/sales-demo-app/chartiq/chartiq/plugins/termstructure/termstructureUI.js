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


import { CIQ } from "../../js/componentUI.js";
import "./termstructureCore.js";

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
 * UI Helper to enable term structure curve interaction by means of context menu options.
 *
 * When the `cq-time-series` attribute is set to true in the chart markup (see example below),
 * users can right-click data points on the curve to open a context menu:
 *
 * ![Launch Time Series](img-cq-time-series.png)
 *
 * If **Launch Time Series** is then selected, a time series chart for that instrument opens in a
 * new tab.
 *
 * @param {HTMLElement} [node=context.topNode] Automatically attaches to the top node of the
 * 		context. Not currently used.
 * @param {CIQ.UI.Context} context The context for the chart.
 * @param {object} [params={pathToTimeSeries:"plugins/termstructure/sample-time-series-instant-chart.html"}]
 * 		Provides the path to a template used by the
 * 		[launchTimeSeries]{@link CIQ.UI.CurveEdit.launchTimeSeries} method to load a time series
 * 		chart.
 *
 * @name CIQ.UI.CurveEdit
 * @constructor
 * @since 7.4.0
 *
 * @example
 * <caption>If a time series chart is available, set the <code>cq-time-series</code> attribute to
 * true to enable time series&ndash;related options.</caption>
 * <cq-dialog>
 *     <cq-curve-context cq-time-series="true">
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
	const basePath = CIQ.ChartEngine.pluginBasePath + "termstructure/";
	const defaultPathToTimeSeries =
		basePath + "sample-time-series-instant-chart.html";
	this.pathToTimeSeries = params.pathToTimeSeries || defaultPathToTimeSeries;

	// Time-series chart may not be available in all packages. We need to specify in the HTML whether it is. Only if it
	// is should we initialize time-series related options.
	let timeSeriesAvailable =
		this.curveContext.getAttribute("cq-time-series") === "true";

	context.advertiseAs(this, "CurveEdit");
	if (timeSeriesAvailable)
		stx.addEventListener("curveEdit", (params) => this.showContext(params));
}

CIQ.inheritsFrom(CurveEdit, CIQ.UI.Helper);

/**
 * Opens the curve context menu at the current cursor position. The menu contains options such
 * as loading a time series chart for a term structure instrument.
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
 * Opens a window and loads a time series chart for a selected term structure instrument.
 *
 * @memberof CIQ.UI.CurveEdit
 * @alias CIQ.UI.CurveEdit.launchTimeSeries
 * @since 7.4.0
 */
CurveEdit.prototype.launchTimeSeries = function () {
	const { highlighted, curves } = this.context.stx.termStructure;
	const { curve, instrument } = highlighted;
	const { symbol } = curves[curve];

	let instrumentSymbol = CIQ.Market.Symbology.encodeTermStructureInstrumentSymbol(
		symbol,
		instrument
	);

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

		const { termStructure, layout } = this.context.stx;
		const prop = "pointFreshnessTimeout";
		if (!layout[prop]) layout[prop] = termStructure.initialSettings[prop];
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
 * @param {Object} params
 * @param {String} [field] Indicates whether the time-out should be set automatically.
 *
 * @alias setFreshnessEdit
 * @memberof CIQ.UI.Layout.prototype
 * @private
 * @since 7.4.0
 */
CIQ.UI.Layout.prototype.setFreshnessEdit = function ({ node }, field) {
	const dialog = CIQ.UI.BaseComponent.selfOrParentElement(node, "cq-dialog");
	const inputElement = dialog.querySelector("input");
	const { termStructure } = this.context.stx;

	if (field === "auto") {
		inputElement.value = 10; // set to default value
	}

	let { value } = inputElement; // grab after possibly setting to default
	termStructure.setPointFreshnessTimeout(parseFloat(value));
	dialog.close();
};

/**
 * The historical comparison dialog box web component, `<cq-historical-comparison-dialog>`, is
 * used to add secondary curves to a term structure chart. The secondary curves plot the
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
 *          <h4 class="title">Set Historical Comparison</h4>
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
		this.custom = false;

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

		Array.from(this.querySelectorAll("cq-item")).forEach((item) => {
			item.classList.remove("ciq-active");
		});

		this.firstOption.classList.add("ciq-active");

		const { termStructure } = this.context.stx;
		const { swatchColors } = this;
		let currentColor = this.swatch.style.backgroundColor;

		let usedColors = new Set();
		for (let i in termStructure.curves) {
			let curve = termStructure.curves[i];
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
		let { innerText: option } =
			Array.from(this.querySelectorAll("cq-item")).find((item) => {
				return item.classList.contains("ciq-active");
			}) || {};
		if (!option) return null;

		let [quantity, unit] = option.split(" ");
		let date = new Date();

		if (unit.includes("Day")) date.setDate(date.getDate() - quantity);
		if (unit.includes("Week")) date.setDate(date.getDate() - quantity * 7);
		if (unit.includes("Month")) date.setMonth(date.getMonth() - quantity);
		if (unit.includes("Year")) date.setFullYear(date.getFullYear() - quantity);

		return date;
	}

	/**
	 * Closes the dialog box and adds a curve to the chart for the selected date.
	 *
	 * @alias done
	 * @memberof WebComponents.cq-historical-comparison-dialog
	 * @since 7.5.0
	 */
	done() {
		const { termStructure } = this.context.stx;
		const { symbol } = this.context.stx.chart;

		let date = this.custom ? this.datepicker.picker.getDate() : this.calcDate();
		let color = this.swatch.style.backgroundColor;

		termStructure.addCurve(symbol, date, { color });
		this.custom = false;
		this.close();
	}
}

/**
 * The curve comparison web component, `<cq-curve-comparison>`, enables the addition of
 * secondary curves to term structure charts. The secondary curves plot instrument data for
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
	 * @memberof WebComponents.cq-curve-comparison
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
	 * @memberof WebComponents.cq-curve-comparison
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
	 * @memberof WebComponents.cq-curve-comparison
	 * @since 7.5.0
	 */
	pickSwatchColor() {
		const { termStructure } = this.context.stx;
		const { swatchColors } = this;
		const swatch = this.querySelector("cq-swatch");
		if (!swatch) return;
		let currentColor = swatch.style.backgroundColor;

		let usedColors = new Set();
		for (let i in termStructure.curves) {
			let curve = termStructure.curves[i];
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
	 * @memberof WebComponents.cq-curve-comparison
	 * @since 7.5.0
	 */
	removeCurve(curveId) {
		const { termStructure } = this.context.stx;
		termStructure.removeCurve(curveId);
	}

	/**
	 * Creates the list of secondary curves displayed in the
	 * [cq-study-legend]{@link WebComponents.cq-study-legend}.
	 *
	 * @alias renderLegend
	 * @memberof WebComponents.cq-curve-comparison
	 * @since 7.5.0
	 */
	renderLegend() {
		const { stx } = this.context;
		const { termStructure } = stx;

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
		for (let curveId in termStructure.curves) {
			if (curveId === "_main_curve") continue;
			let curve = termStructure.curves[curveId];
			let frag = CIQ.UI.makeFromTemplate(this.template);
			let comparisonSwatch = frag.find("cq-comparison-swatch");
			let swatch = frag.find("cq-swatch");
			let label = frag.find("cq-comparison-label");
			let loader = frag.find("cq-comparison-loader");
			let btn = frag.find(".ciq-close");

			let { color, symbol, Date: dateObj, error } = curve;

			if (error) frag.attr("cq-error", true);

			let isAuto = color == "auto";
			if (isAuto) color = stx.defaultColor;

			comparisonSwatch.css({ background: color });

			if (swatch.length) {
				swatch[0].curveId = curveId;
				swatch[0].setColor(color, false, isAuto);
			}

			let labelText = `${dateObj.toLocaleDateString()} ${symbol}`;

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
	 * @memberof WebComponents.cq-curve-comparison
	 * @since 7.5.0
	 */
	setColor(color, swatch) {
		const { termStructure } = this.context.stx;
		if (swatch.curveId) termStructure.modifyCurve(swatch.curveId, { color });
	}

	/**
	 * Adds a secondary curve to the chart based on the selection of a symbol from the entity
	 * lookup dialog box. Sets the curve color to that of the entity lookup's color swatch.
	 *
	 * @param {CIQ.UI.Context} [context] The chart context. Unused.
	 * @param {Object} obj A data access object containing information about the selected
	 * 		entity.
	 *
	 * @alias selectItem
	 * @memberof WebComponents.cq-curve-comparison
	 * @since 7.5.0
	 */
	selectItem(context, obj) {
		const self = this;
		const { stx } = this.context;
		const { termStructure } = stx;
		let color = this.querySelector("cq-swatch").style.backgroundColor;
		let date = termStructure.curves._main_curve.Date;

		for (let i in termStructure.curves) {
			let curve = termStructure.curves[i];
			if (
				curve.symbol.toLowerCase() === obj.symbol.toLowerCase() &&
				curve.Date.getTime() === date.getTime()
			) {
				return; // curve already exists
			}
		}

		function cb() {
			self.loading[obj.symbol] = false;
			self.renderLegend();
		}

		termStructure.addCurve(obj.symbol, date, { color }, cb);
		this.loading[obj.symbol] = true;
	}

	/**
	 * Sets the component context when the chart context is constructed.
	 *
	 * @memberof WebComponents.cq-curve-comparison
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

		this.context.stx.append("modifySeries", function () {
			self.renderLegend();
		});

		this.renderLegend();
	}
}
/**
 * The comparison tap capture web component, `cq-comparison-tap-capture`, surrounds `cq-menu`
 * and `cq-comparison-lookup-frame` components to handle the selection of items from menus and
 * lookup dialog boxes that are part of a comparison control. The control enables the addition
 * of secondary curves to a term structure chart.
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
 * Helper function that exposes {@link CIQ.TermStructure#setDataField} to the layout for access
 * in the web components.
 *
 * @param {HTMLElement} arguments[0].node The HTML element where the click originated.
 * @param {Object} arguments[0].params Additional information about where the click originated,
 * 		including the parent element.
 * @param {String} field Defines the type of values plotted on the y-axis of the term structure
 * 		graph; for example, instrument yield, bid or ask price, or the mid point of the bid
 * 		and ask.
 *
 * @memberof CIQ.UI.Layout
 * @since 7.3.0
 *
 * @example
 * 	<div class="ciq-dropdowns">
 *      <cq-menu class="ciq-menu">
 *          <cq-clickable stxbind="Layout.dataField" class="ciq-datafield-span">Yield</cq-clickable>
 *          <cq-menu-dropdown class="ciq-value-dropdown">
 *              <cq-item stxtap="Layout.setDataField('yield')">Yield</cq-item>
 *              <cq-item stxtap="Layout.setDataField('bid')">Bid</cq-item>
 *              <cq-item stxtap="Layout.setDataField('mid')">Mid</cq-item>
 *              <cq-item stxtap="Layout.setDataField('ask')">Ask</cq-item>
 *          </cq-menu-dropdown>
 *      </cq-menu>
 * 	</div>
 */
CIQ.UI.Layout.prototype.setDataField = function ({ node, params }, field) {
	this.context.stx.termStructure.setDataField(field);
};

/**
 * Helper function for binding the value of the data field drop-down menu.
 *
 * @param {HTMLElement} node The HTML element bound to the helper.
 *
 * @memberof CIQ.UI.Layout
 * @private
 * @since 7.3.0
 */
CIQ.UI.Layout.prototype.dataField = function (node) {
	const { termStructure, layout } = this.context.stx;
	function listener() {
		let field = layout.dataField;
		node.innerHTML = field.charAt(0).toUpperCase() + field.slice(1);
	}
	const prop = "dataField";
	if (typeof layout[prop] !== "string")
		layout[prop] = termStructure.initialSettings[prop];
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
 * Gets the value of the term structure shading property.
 *
 * @param {HTMLElement} node The shading control, which turns shading on or off.
 *
 * @memberof CIQ.UI.Layout
 * @private
 * @since 7.4.0
 */
CIQ.UI.Layout.prototype.getShading = function (node) {
	const { termStructure, layout } = this.context.stx;
	const className = this.params.activeClassName;
	const prop = "drawShading";
	if (typeof layout[prop] !== "boolean")
		layout[prop] = termStructure.initialSettings[prop];
	CIQ.UI.observeProperty(prop, layout, observerCallback(node, className));
};

/**
 * Sets the value of the term structure shading property.
 *
 * @param {HTMLElement} node
 * @param {String} field
 *
 * @memberof CIQ.UI.Layout
 * @private
 * @since 7.4.0
 */
CIQ.UI.Layout.prototype.setShading = function (node, field) {
	const { termStructure, layout } = this.context.stx;
	termStructure.setShading(!layout.drawShading);
};

/**
 * Gets the value of the term structure x-axis scaling property.
 *
 * @param {HTMLElement} node The x-axis scaling control, which turns scaling on or off.
 *
 * @memberof CIQ.UI.Layout
 * @private
 * @since 7.4.0
 */
CIQ.UI.Layout.prototype.getXAxisScaling = function (node) {
	const { termStructure, layout } = this.context.stx;
	const className = this.params.activeClassName;

	function listener(obj) {
		if (obj.value === "scaled") node.classList.add(className);
		else node.classList.remove(className);
	}
	const prop = "spacingType";
	if (typeof layout[prop] !== "string")
		layout[prop] = termStructure.initialSettings[prop];
	CIQ.UI.observeProperty(prop, layout, listener);
};

/**
 * Sets the value of the term structure x-axis scaling property.
 *
 * @param {HTMLElement} node
 * @param {String} field
 *
 * @memberof CIQ.UI.Layout
 * @private
 * @since 7.4.0
 */
CIQ.UI.Layout.prototype.setXAxisScaling = function (node, field) {
	const { layout, termStructure } = this.context.stx;
	let newSpacingType = layout.spacingType === "scaled" ? "uniform" : "scaled";
	termStructure.setSpacingType(newSpacingType);
};

/**
 * Gets the value of the property that determines whether term structure fresh data points are
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
	const { termStructure, layout } = this.context.stx;
	const className = this.params.activeClassName;
	const prop = "showcaseFreshPoints";
	if (typeof layout[prop] !== "boolean")
		layout[prop] = termStructure.initialSettings[prop];
	CIQ.UI.observeProperty(prop, layout, observerCallback(node, className));
};

/**
 * Sets the value of the property that determines whether term structure fresh data points are
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
	const { layout, termStructure } = this.context.stx;
	termStructure.setShowcaseFreshPoints(!layout.showcaseFreshPoints);
};

/**
 * Gets the value of the property that determines whether term structure data points display an
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
	const { termStructure, layout } = this.context.stx;
	const className = this.params.activeClassName;
	const prop = "showUpdateStamp";
	if (typeof layout[prop] !== "boolean")
		layout[prop] = termStructure.initialSettings[prop];
	CIQ.UI.observeProperty(prop, layout, observerCallback(node, className));
};

/**
 * Sets the value of the property that determines whether term structure data points display an
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
	const { layout, termStructure } = this.context.stx;
	termStructure.setShowUpdateStamp(!layout.showUpdateStamp);
};

/**
 * Gets the value of the property that determines whether an animation is displayed when term
 * structure data points are updated.
 *
 * @param {HTMLElement} node The update animations control, which turns update animations on
 * 		or off.
 *
 * @memberof CIQ.UI.Layout
 * @private
 * @since 7.4.0
 */
CIQ.UI.Layout.prototype.getUpdateAnimations = function (node) {
	const { termStructure, layout } = this.context.stx;
	const className = this.params.activeClassName;
	const prop = "showUpdateAnimations";
	if (typeof layout[prop] !== "boolean")
		layout[prop] = termStructure.initialSettings[prop];
	CIQ.UI.observeProperty(prop, layout, observerCallback(node, className));
};

/**
 * Sets the value of the property that determines whether an animation is displayed when term
 * structure data points are updated.
 *
 * @param {HTMLElement} node
 * @param {String} field
 *
 * @memberof CIQ.UI.Layout
 * @private
 * @since 7.4.0
 */
CIQ.UI.Layout.prototype.setUpdateAnimations = function (node, field) {
	const { layout, termStructure } = this.context.stx;
	termStructure.setUpdateAnimations(!layout.showUpdateAnimations);
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
