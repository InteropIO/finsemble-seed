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


var lockImg;
if (
	typeof define === "undefined" &&
	typeof module === "object" &&
	typeof require === "function"
) {
	lockImg = require("./images/lock.svg");
	// If the image comes back an an ES module, retrieve the file path.
	if (lockImg.default) lockImg = lockImg.default;
} else if (typeof define === "function" && define.amd) {
	define(["./images/lock.svg"], function (m) {
		lockImg = m;
	});
}

import { CIQ } from "../../js/componentUI.js";
import "./core.js";

var glyphPath = CIQ.ChartEngine.pluginBasePath + "crosssection/images/";

/**
 * Timeline controls web component `<cq-timeline-controls>`.
 *
 * Creates the spread selection tooling for the top toolbar of the timeline date selector. The top
 * toolbar contains dropdown menus used to specify the spread plotted by the timeline date selector.
 *
 * **Note:** The `cq-timeline-controls` element is created programmatically as part of
 * {@link CIQ.CrossSection.TimelineDateSelector}.
 *
 * @example <caption>Default markup.</caption>
 * <cq-timeline-controls>
 *     <div class="ciq-dropdowns">
 *         <cq-menu class="ciq-menu">
 *             <span></span>
 *             <cq-menu-dropdown></cq-menu-dropdown>
 *         </cq-menu>
 *         <div class="ciq-dropdown-divider">minus</div>
 *         <cq-menu class="ciq-menu">
 *             <span></span>
 *             <cq-menu-dropdown></cq-menu-dropdown>
 *         </cq-menu>
 *     </div>
 *     <cq-close></cq-close>
 * </cq-timeline-controls>
 *
 * @namespace WebComponents.cq-timeline-controls
 * @since 8.3.0
 */
class TimelineControls extends CIQ.UI.BaseComponent {
	initialize({ stx }) {
		const self = this;
		this.stx = stx;
		this.addDefaultMarkup();
		const [firstMenu, secondMenu] = Array.from(
			this.querySelectorAll(".ciq-dropdowns cq-menu")
		);

		this.labelEls = {
			first: firstMenu.querySelector("span"),
			second: secondMenu.querySelector("span")
		};

		this.dropdowns = {
			first: firstMenu.querySelector("cq-menu-dropdown"),
			second: secondMenu.querySelector("cq-menu-dropdown")
		};

		this.closeButton = this.querySelector("cq-close");

		CIQ.UI.stxtap(this.dropdowns.first, (e) => tap(e, "first"));
		CIQ.UI.stxtap(this.dropdowns.second, (e) => tap(e, "second"));
		CIQ.UI.stxtap(this.closeButton, () => {
			const { stx } = this;
			stx.layout.timelineDateSelector = false;
			stx.changeOccurred("layout");
		});

		function tap({ target }, whichMenu) {
			const { timelineDateSelector } = self.stx.crossSection;
			const menuOption = target.innerHTML;
			timelineDateSelector[whichMenu + "SpreadInstrument"] = menuOption;
			self.display();
			timelineDateSelector.copyData();
		}
	}

	display() {
		const {
			instruments,
			timelineDateSelector,
			timelineDateSelector: { firstSpreadInstrument, secondSpreadInstrument }
		} = this.stx.crossSection;

		if (!(instruments && firstSpreadInstrument)) return;

		const instrumentsInMenu = {
			first: instruments
				.slice(instruments.indexOf(secondSpreadInstrument) + 1)
				.filter((instrument) => instrument !== firstSpreadInstrument)
				.reverse(),
			second: instruments
				.slice(0, instruments.indexOf(firstSpreadInstrument))
				.filter((instrument) => instrument !== secondSpreadInstrument)
		};

		["first", "second"].forEach((whichMenu) => {
			const label = this.labelEls[whichMenu];
			const dropdown = this.dropdowns[whichMenu];

			label.innerHTML = timelineDateSelector[whichMenu + "SpreadInstrument"];
			dropdown.innerHTML = instrumentsInMenu[whichMenu].reduce(
				(acc, val) => acc + `<cq-item>${val}</cq-item>`,
				""
			);
		});
	}
}

TimelineControls.markup = `
	<div class="ciq-dropdowns">
		<cq-menu class="ciq-menu">
			<span></span>
			<cq-menu-dropdown></cq-menu-dropdown>
		</cq-menu>
		<div class="ciq-dropdown-divider">minus</div>
		<cq-menu class="ciq-menu">
			<span></span>
			<cq-menu-dropdown></cq-menu-dropdown>
		</cq-menu>
	</div>
	<cq-close></cq-close>
`;

/**
 * Curve controls web component `<cq-curve-controls>`.
 *
 * Creates the add, remove, show, hide, unlock, and lock buttons for the bottom toolbar of the
 * timeline date selector.
 *
 * **Note:** The `cq-curve-controls` element is created programmatically as part of
 * {@link CIQ.CrossSection.TimelineDateSelector}.
 *
 * @example <caption>Default markup.</caption>
 * <cq-curve-controls>
 *     <div class="ciq-curve-control ciq-curve-controls-add"><span></span>Add</div>
 *     <div class="ciq-curve-control ciq-curve-controls-remove"><span></span>Remove</div>
 *     <div class="ciq-curve-control ciq-curve-controls-show"><span></span>Show</div>
 *     <div class="ciq-curve-control ciq-curve-controls-hide"><span></span>Hide</div>
 *     <div class="ciq-curve-control ciq-curve-controls-unlock"><span></span>Unlock</div>
 *     <div class="ciq-curve-control ciq-curve-controls-lock"><span></span>Lock</div>
 * </cq-curve-controls>
 *
 * @namespace WebComponents.cq-curve-controls
 * @since 8.3.0
 */
class CurveControls extends CIQ.UI.BaseComponent {
	initialize({ stx }) {
		const self = this;
		this.stx = stx;
		this.addDefaultMarkup();
		this.buttons = {
			add: this.querySelector(".ciq-curve-controls-add"),
			remove: this.querySelector(".ciq-curve-controls-remove"),
			show: this.querySelector(".ciq-curve-controls-show"),
			hide: this.querySelector(".ciq-curve-controls-hide"),
			unlock: this.querySelector(".ciq-curve-controls-unlock"),
			lock: this.querySelector(".ciq-curve-controls-lock")
		};

		this.addDialog = document.querySelector("cq-historical-comparison-dialog");
		CIQ.UI.stxtap(this, tap);

		function tap({ target }) {
			const { addDialog } = self;
			const { crossSection, uiContext: context } = stx;
			const { selectedCurve } = crossSection;

			const actions = {
				add: () => addDialog.open({ context }),
				remove: () => crossSection.removeCurve(selectedCurve),
				show: () => crossSection.showCurve(selectedCurve),
				hide: () => crossSection.hideCurve(selectedCurve),
				unlock: () => crossSection.unlockCurve(selectedCurve),
				lock: () => crossSection.lockCurve(selectedCurve)
			};

			const [button] =
				Object.entries(self.buttons).find(([_, el]) => el === target) || [];

			if (button) actions[button]();
		}
	}

	display() {
		const { buttons } = this;
		const { add, remove, show, hide, unlock, lock } = buttons;
		const { curves, selectedCurve } = this.stx.crossSection;
		const setDisplay = (el, val = "") => (el.style.display = val);
		Object.values(buttons).forEach((button) => setDisplay(button, "none"));
		if (!selectedCurve) {
			setDisplay(add);
		} else {
			if (!curves[selectedCurve] || selectedCurve === "_main_curve") return;
			setDisplay(remove);
			setDisplay(curves[selectedCurve].hidden ? show : hide);
			setDisplay(curves[selectedCurve].relativeDate ? unlock : lock);
		}
	}
}

CurveControls.markup = `
	<div class="ciq-curve-control ciq-curve-controls-add"><span></span>Add</div>
	<div class="ciq-curve-control ciq-curve-controls-remove"><span></span>Remove</div>
	<div class="ciq-curve-control ciq-curve-controls-show"><span></span>Show</div>
	<div class="ciq-curve-control ciq-curve-controls-hide"><span></span>Hide</div>
	<div class="ciq-curve-control ciq-curve-controls-unlock"><span></span>Unlock</div>
	<div class="ciq-curve-control ciq-curve-controls-lock"><span></span>Lock</div>
`;

CIQ.UI.addComponentDefinition("cq-timeline-controls", TimelineControls);
CIQ.UI.addComponentDefinition("cq-curve-controls", CurveControls);

/**
 * Creates a timeline date selector for a cross section chart, including the
 * [cq-timeline-controls]{@link WebComponents.cq-timeline-controls} and
 * [cq-curve-controls]{@link WebComponents.cq-curve-controls} web components.
 *
 * @param {object} params Constructor parameters.
 * @param {CIQ.CrossSection} params.crossSection A reference to the cross section object.
 * @param {number} [params.height=95] The height in pixels to assign to the timeline date selector
 * 		chart (which plots spreads over time).
 * @param {boolean} [params.useNotifications=true] Alerts the user to events using toast messages.
 * 		Requires the [cq-message-toaster]{@link WebComponents.cq-message-toaster} web component.
 * @param {object} [params.glyphs={}] Allows configuration override of image source paths.
 * 		Currently the only valid property of this parameter is `lockImg`.
 *
 * @name CIQ.CrossSection.TimelineDateSelector
 * @class
 * @since 8.3.0
 */
class TimelineDateSelector {
	constructor({
		crossSection,
		height = 95,
		useNotifications = true,
		glyphs = {}
	}) {
		const { stx } = crossSection;
		const { container: chartContainer } = stx;
		crossSection.timelineDateSelector = this;

		this.height = height;
		this.handleLocations = {};
		this.lockIcon = new Image();
		this.lockIcon.src = glyphs.lockImg || lockImg || glyphPath + "lock.svg";
		this.stx = stx;
		this.useNotifications = useNotifications;
		this.adjustRangeRequired = true;

		this.timelineContainer = document.createElement("div");
		this.timelineContainer.className = "ciq-timeline-container";
		this.timelineContainer.innerHTML = `
			<cq-timeline-controls></cq-timeline-controls>
			<div class="ciq-chart">
				<div class="chartContainer"></div>
			</div>
			<cq-curve-controls></cq-curve-controls>
		`;

		const qs = (s) => this.timelineContainer.querySelector(s);
		this.selectorContainerOuter = qs(".ciq-chart");
		this.selectorContainerInner = qs(".chartContainer");
		this.timelineControls = qs("cq-timeline-controls");
		this.curveControls = qs("cq-curve-controls");

		this.selectorContainerInner.dimensionlessCanvas = true;
		this.selectorContainerOuter.style.height = height + "px";
		chartContainer.parentElement.parentElement.insertBefore(
			this.timelineContainer,
			chartContainer.parentElement.nextSibling
		);

		const selector = new CIQ.ChartEngine({
			container: this.selectorContainerInner,
			preferences: { labels: false, whitespace: 0 }
		});

		this.selector = selector;
		selector.loadChart("", { masterData: [] });

		const { yAxis } = selector.chart;
		selector.manageTouchAndMouse = false;
		selector.chart.defaultPlotField = "spread";
		yAxis.drawCurrentPriceLabel = false;

		selector.setChartType("mountain");
		selector.initializeChart();
		this.timelineControls.initialize({ stx });
		this.curveControls.initialize({ stx });
		this.synchronizeYAxis();
		this.installInjectionsAndListeners();
	}

	/**
	 * Synchronizes the y-axis of the timeline date selector with the y-axis of the main chart.
	 *
	 * @alias synchronizeYAxis
	 * @memberof CIQ.CrossSection.TimelineDateSelector#
	 * @private
	 * @since 8.3.0
	 */
	synchronizeYAxis() {
		const { stx, selector } = this;
		const { yAxis } = selector.chart;
		const { get, set } = Object.getOwnPropertyDescriptor(
			CIQ.ChartEngine.YAxis.prototype,
			"width"
		);

		Object.defineProperty(yAxis, "width", {
			get: () => Math.max(get.call(yAxis), stx.chart.yAxis.width),
			set: (width) => set.call(yAxis, width)
		});

		Object.defineProperty(yAxis, "priceFormatter", {
			get: () => {
				const chartAxis = stx.chart.yAxis;
				return chartAxis.priceFormatter
					? (_, panel, price) => chartAxis.priceFormatter(stx, panel, price)
					: null;
			}
		});
	}

	/**
	 * Installs the injections and listeners that are necessary for the timeline date selector to
	 * function.
	 *
	 * @alias installInjectionsAndListeners
	 * @memberof CIQ.CrossSection.TimelineDateSelector#
	 * @private
	 * @since 8.3.0
	 */
	installInjectionsAndListeners() {
		const self = this;
		const {
			stx,
			selector,
			timelineContainer,
			curveControls,
			useNotifications
		} = this;
		const { crossSection } = stx;
		const { chart } = selector;
		const { subholder } = chart.panel;
		const proximitySensitivity = 10;

		function withinProximity(a, b) {
			return a - proximitySensitivity < b && a + proximitySensitivity > b;
		}

		function getHovered({ hoveredCurve, handleLocations }, cx) {
			const [hovered] = Object.entries(handleLocations).find(([, xVal]) =>
				withinProximity(cx, xVal)
			) || [null];
			return [hoveredCurve, hovered];
		}

		function handleMoveStart({ pageX, button, touches = [] }) {
			if (touches.length) ({ pageX } = touches[0]);
			else if (button !== 0) return;

			const cx = selector.backOutX(pageX);
			const [, hoveredCurve] = getHovered(self, cx);

			self.hoveredCurve = hoveredCurve;
			self.clickStartedOn = hoveredCurve;
			self.clickLocation = cx;
			self.startLocation = cx;

			if (hoveredCurve) {
				self.dragging = true;
				return true; // disable normal grabbing
			}
		}

		function handleMove(x, y) {
			const cx = selector.backOutX(x);
			const cy = selector.backOutY(y);
			const { clickStartedOn, clickLocation, dragging } = self;
			const { xaxisHeight, bottom, top } = selector;
			const { candleWidth } = selector.layout;
			const { curves } = crossSection;
			let prevHovered, hovered;

			if (clickStartedOn) {
				self.dragDiff = clickLocation - cx;
			}

			if (dragging) {
				if (
					curves[self.hoveredCurve] &&
					curves[self.hoveredCurve].relativeDate &&
					useNotifications &&
					!self.warnedAboutLockedCurve
				) {
					self.warnedAboutLockedCurve = true;
					stx.dispatch("notification", {
						message: "Locked curves cannot be dragged",
						type: "warning",
						displayTime: 3
					});
				}

				if (!self.timeout) {
					// consolidate draw calls and execute on next tick
					// this prevents unnecessary calls that could otherwise build up based on mousemove
					// event callbacks scheduled during the current draw
					self.timeout = setTimeout(() => {
						if (Math.round(self.dragDiff / candleWidth)) {
							selector.draw();
						}
						self.timeout = clearTimeout(self.timeout);
					});
				}
			} else {
				// cancel curve hover state if mouse moves over x-axis
				if (top + cy > bottom - xaxisHeight && !dragging) {
					self.hoveredCurve = null;
					selector.draw();
					return;
				}

				[prevHovered, hovered] = getHovered(self, cx);
				self.hoveredCurve = hovered;
				subholder.style.cursor = hovered ? "ew-resize" : "pointer";
				if (prevHovered !== hovered) selector.draw();
			}

			if (hovered) return true; // no need for mousemoveinner to run
		}

		function handleMoveEnd({ pageX, button, changedTouches: touches = [] }) {
			if (touches.length) ({ pageX } = touches[0]);
			else if (button !== 0) return;

			const cx = selector.backOutX(pageX);
			const { startLocation } = self;
			const [prevHovered, hovered] = getHovered(self, cx);
			const clickNotSwipe = withinProximity(startLocation, cx);
			let shouldRedrawSelector = false;

			if (clickNotSwipe) {
				const alreadySelected = crossSection.selectedCurve === hovered;
				crossSection.selectedCurve = alreadySelected ? null : hovered;
			}

			if (touches.length) {
				self.hoveredCurve = null;
				if (prevHovered) shouldRedrawSelector = true;
			} else {
				self.hoveredCurve = hovered;
			}

			self.dragging = false;
			self.clickStartedOn = null;
			self.dragDiff = 0;
			self.warnedAboutLockedCurve = false;

			if (self.snapBackToLive) {
				self.snapBackToLive();
				stx.draw(); // stx draw will trigger selector draw
			} else if (shouldRedrawSelector) {
				selector.draw();
			}

			curveControls.display();
			if (hovered) return true; // performance
		}

		stx.prepend("resizeChart", function () {
			self.display();
		});

		stx.append("createDataSet", function () {
			self.copyData(this.chart);
		});

		stx.append("draw", function () {
			if (!this.layout.timelineDateSelector) return;

			if (self.ignoreNextDraw) {
				self.ignoreNextDraw = false;
				return;
			}

			selector.draw();
		});

		stx.addEventListener("theme", function ({ stx }) {
			selector.clearPixelCache();
			selector.styles = {};
			selector.chart.container.style.backgroundColor = "";
			if (CIQ.ThemeHelper) {
				const helper = new CIQ.ThemeHelper({ stx });
				helper.params.stx = selector;
				helper.update();

				const backgroundColor = helper.settings.chart.Background.color;
				timelineContainer.style.backgroundColor = backgroundColor;
			}
		});

		stx.addEventListener("layout", function () {
			self.display();
		});

		selector.append("draw", function () {
			stx.chart.scroll = this.chart.scroll; // ensure main engine will load pagination
			self.drawSelector();

			if (
				stx.layout.timelineDateSelector &&
				!self.notifiedAboutMarketGaps &&
				useNotifications &&
				self.anyNullInDataSet &&
				stx.getSymbols().length > 1
			) {
				stx.dispatch("notification", {
					message:
						"Comparing entities with different market hours may lead to gaps in the timeline date selector spread line",
					type: "warning"
				});
				self.notifiedAboutMarketGaps = true;
			}
		});

		selector.prepend("mousedown", handleMoveStart);
		selector.prepend("touchstart", handleMoveStart);
		selector.prepend("mousemoveinner", handleMove);
		selector.prepend("mouseup", handleMoveEnd);
		selector.prepend("touchend", handleMoveEnd);

		subholder.addEventListener("mouseout", () => {
			if (self.hoveredCurve && !self.dragging) {
				self.hoveredCurve = null;
				selector.draw();
			}
		});
	}

	/**
	 * Shows, hides, or updates the timeline date selector.
	 *
	 * Shows or hides the timeline date selector depending on the `stx.layout.timelineDateSelector`
	 * property. Shows the selector when the property is true; hides the selector, when the
	 * property is false.
	 *
	 * Updates the timeline date selector in response to resize events and layout events such as a
	 * curve handle being dragged or a curve control (see
	 * [cq-curve-controls]{@link WebComponents.cq-curve-controls}) being selected.
	 *
	 * @alias display
	 * @memberof CIQ.CrossSection.TimelineDateSelector#
	 * @since 8.3.0
	 */
	display() {
		if (this.ignoreNextDisplay) {
			this.ignoreNextDisplay = false;
			return;
		}

		const {
			stx,
			selector,
			timelineContainer,
			timelineControls,
			curveControls
		} = this;
		const { chart, container } = selector;
		const doDisplay = stx.layout.timelineDateSelector;
		const alreadyDisplayed = CIQ.trulyVisible(container);

		if (doDisplay) {
			if (chart.breakpoint !== stx.chart.breakpoint) {
				selector.notifyBreakpoint(stx.chart.breakpoint);
			}

			if (!alreadyDisplayed) {
				timelineContainer.style.display = "";

				selector.resizeChart(false);
				this.adjustRange();

				this.ignoreNextDisplay = true;
				stx.resizeChart();
			}

			timelineControls.display();
			curveControls.display();
		} else {
			timelineContainer.style.display = "none";
		}
	}

	/**
	 * Adjusts the visible range of the timeline date selector to display all curve handles. Called
	 * when the timeline date selector opens.
	 *
	 * @alias adjustRange
	 * @memberof CIQ.CrossSection.TimelineDateSelector#
	 * @since 8.3.0
	 */
	adjustRange() {
		const { selector, stx, selectorContainerInner } = this;
		const { layout, chart } = selector;
		const { dataSet, yAxis } = chart;
		const { crossSection } = stx;
		const { curves } = crossSection;
		const curveDates = Object.values(curves)
			.map(({ Date: curveDate }) => curveDate)
			.sort((a, b) => (a > b ? 1 : -1));
		const { 0: leftDate, [curveDates.length - 1]: rightDate } = curveDates;
		const leftTick = selector.tickFromDate(leftDate);
		const rightTick = selector.tickFromDate(rightDate);
		const spread = rightTick - leftTick;
		const minRange = 30;
		const range = Math.max(spread, minRange);
		const { width } = CIQ.elementDimensions(selectorContainerInner); // chart width may not exist yet
		const relevantWidth = width - yAxis.width;
		const gutterSize = 3;
		const newScroll = dataSet.length - rightTick + gutterSize + range;
		const newCandleWidth = relevantWidth / (range + gutterSize * 2);

		chart.scroll = newScroll;
		chart.maxTicks = Math.ceil(width / newCandleWidth); // ensure all ticks draw
		layout.candleWidth = newCandleWidth;
		selector.draw();
	}

	/**
	 * Copies data from the main chart, including quotes and instruments, to enable the timeline
	 * date selector to calculate spreads and populate the spread dropdown menus (see
	 * [cq-timeline-controls]{@link WebComponents.cq-timeline-controls}).
	 *
	 * @alias copyData
	 * @memberof CIQ.CrossSection.TimelineDateSelector#
	 * @private
	 * @since 8.3.0
	 */
	copyData() {
		const { selector, stx, timelineControls } = this;
		const { chart, layout, crossSection } = stx;
		const { yaxisField } = layout;
		const { defaultPlotField } = chart;
		const { getValueFromMaybeObject } = CIQ.CrossSection;

		// run on next tick to account for cross section instruments not populating until createDataSegment
		setTimeout(() => {
			const { instruments } = crossSection;
			if (!(chart.dataSet && instruments)) return;
			selector.masterData = chart.dataSet;
			selector.chart.tickCache = {};
			this.anyNullInDataSet = false;

			this.firstSpreadInstrument =
				this.firstSpreadInstrument || instruments[instruments.length - 1];
			this.secondSpreadInstrument =
				this.secondSpreadInstrument || instruments[0];

			selector.chart.dataSet = chart.dataSet.map((quote) => {
				const values = quote[defaultPlotField];
				let spread = null;

				if (values) {
					let first = values[this.firstSpreadInstrument];
					let second = values[this.secondSpreadInstrument];

					if (first && second) {
						first = getValueFromMaybeObject(first[yaxisField]);
						second = getValueFromMaybeObject(second[yaxisField]);
						spread = first - second;
					}
				}

				if (spread === null) this.anyNullInDataSet = true;
				return Object.assign({}, quote, { spread });
			});

			if (this.adjustRangeRequired) {
				this.adjustRange();
				this.adjustRangeRequired = false;
			} else {
				selector.draw(); // adjustRange calls draw
			}

			timelineControls.display();
		});
	}

	/**
	 * Draws all of the draggable curve handles for the timeline date selector.
	 *
	 * @alias drawSelector
	 * @memberof CIQ.CrossSection.TimelineDateSelector#
	 * @since 8.3.0
	 */
	drawSelector() {
		const { selector, stx, dragDiff = 0 } = this;
		if (!selector.masterData.length) return;
		const { crossSection } = stx;
		const { curves, selectedCurve } = crossSection;
		const { defaultColor, xaxisHeight, layout, chart } = selector;
		const { candleWidth } = layout;
		const { top, bottom, context, dataSet } = chart;
		const { 0: firstQuote, [dataSet.length - 1]: lastQuote } = dataSet;
		const upToDate = lastQuote.DT.toDateString() === new Date().toDateString();
		const firstPixel = selector.pixelFromDate(firstQuote.DT) - 1; // compensate for pixel rounding
		const lastPixel = selector.pixelFromDate(lastQuote.DT) + 1; // compensate for pixel rounding
		let handleChange = null;
		this.snapBackToLive = null;
		selector.startClip();
		this.handleLocations = {};

		const setDateChangeFn = (date, curve, pixel) => () => {
			crossSection.setCurveDate(date, curve, {
				noDraw: true,
				noLayoutChange: true,
				noRecord: true
			});

			this.dragDiff = 0;
			this.clickLocation = pixel;
			this.ignoreNextDraw = true; // prevent unnecessary redraw of selector
			this.ignoreNextDisplay = true; // prevent unnecessary re-renders
			crossSection.recordCurves();
			stx.draw();
		};

		Object.entries(curves).forEach(
			([curve, { Date: curveDate, color, _computedColor, relativeDate }]) => {
				if ((curves[curve].relativeDate || {}).multiplier === 0) return; // ignore any locked to same date as main curve
				color = color || _computedColor;
				const curveIsSelected = curve === selectedCurve;
				const curveIsHovered = curve === this.hoveredCurve;
				const curveIsMainCurve = curve === "_main_curve";
				const curveIsRelative = !!curves[curve].relativeDate;
				const { hidden } = curves[curve];
				const mainCurveIsHovered = this.hoveredCurve === "_main_curve";
				const shouldOffSet =
					(curveIsHovered && (curveIsMainCurve || !curveIsRelative)) ||
					(curveIsRelative && mainCurveIsHovered);
				const hoverBorder = curveIsHovered ? 1 : 0;
				const pixelOffset = Math.round(dragDiff / candleWidth) * candleWidth;
				const datePixel = selector.pixelFromDate(curveDate);
				const offSetPixel = datePixel - (shouldOffSet ? pixelOffset : 0);
				const inBounds = firstPixel <= offSetPixel && lastPixel >= offSetPixel;
				const inFuture = upToDate && offSetPixel >= lastPixel;
				const pixel = inBounds || inFuture ? offSetPixel : datePixel;
				const realBottom = bottom - xaxisHeight;
				const rectHeight = (curveIsMainCurve ? 33 : 19) + 2 * hoverBorder;
				const rectWidth = 4 + 2 * hoverBorder;
				const rectElevation = (curveIsMainCurve ? 12 : 19) - hoverBorder;
				const lockSide = 8;
				const lockBuffer = 5;
				const radius = rectWidth / 2;
				const heightMinusEnds = rectHeight - rectWidth;
				const pivotBottom = realBottom - rectElevation - radius;
				const pivotTop = pivotBottom - heightMinusEnds;

				context.beginPath();
				context.strokeStyle = color;
				context.lineWidth = 2;
				if (hidden) context.globalAlpha = 0.5;
				context.moveTo(pixel, top);
				context.lineTo(pixel, realBottom);
				context.stroke();
				context.closePath();

				if (curveIsSelected) {
					const selectedRadius = radius + (2 - hoverBorder);
					context.beginPath();
					context.globalAlpha = 0.7;
					context.strokeStyle = defaultColor;
					context.moveTo(pixel - selectedRadius, pivotTop);
					context.arc(pixel, pivotTop, selectedRadius, Math.PI, 0);
					context.lineTo(pixel + selectedRadius, pivotBottom);
					context.arc(pixel, pivotBottom, selectedRadius, 0, Math.PI);
					context.lineTo(pixel - selectedRadius, pivotTop);
					context.stroke();
					context.globalAlpha = hidden ? 0.5 : 1;
					context.closePath();
				}

				context.beginPath();
				context.strokeStyle = curveIsHovered ? defaultColor : color;
				context.fillStyle = color;
				context.moveTo(pixel - radius, pivotTop);
				context.arc(pixel, pivotTop, radius, Math.PI, 0);
				context.lineTo(pixel + radius, pivotBottom);
				context.arc(pixel, pivotBottom, radius, 0, Math.PI);
				context.lineTo(pixel - radius, pivotTop);
				context.stroke();
				context.fill();
				context.closePath();
				context.globalAlpha = 1;

				if (relativeDate) {
					context.drawImage(
						this.lockIcon,
						pixel + lockBuffer,
						realBottom - lockSide - lockBuffer,
						lockSide,
						lockSide
					);
				}

				this.handleLocations[curve] = pixel;

				if (curveIsHovered && datePixel !== pixel) {
					if (inFuture) {
						this.snapBackToLive = setDateChangeFn("live", curve, pixel);
					} else {
						const tick = selector.tickFromPixel(pixel);
						const date = selector.dateFromTick(tick, chart, true, "dataSet");
						handleChange = setDateChangeFn(date, curve, pixel);
					}
				}
			}
		);

		selector.endClip();
		if (handleChange) handleChange();
	}
}

CIQ.CrossSection.TimelineDateSelector = TimelineDateSelector;
