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
import "./timespanevent-marker.js";
import lceConstants from "./constants.js";
import "./studies/projectedVolume.js";

var _css;
if (
	typeof define === "undefined" &&
	typeof module === "object" &&
	typeof require === "function"
) {
	_css = require("./timespanevent.scss");
} else if (typeof define === "function" && define.amd) {
	define(["./timespanevent.css"], function (m) {
		_css = m;
	});
}

let SPACING,
	SPACING_BUFFER,
	LCE_FOLDER,
	TIME_SPAN_EVENT,
	TIME_SPAN_EVENT_PANEL,
	TIME_SPAN_EVENT_CLASS,
	TIME_SPAN_EVENT_IMPLEMENTATION;

/**
 * The time span events panel that contains and displays all the time span events created by
 * the user.
 *
 * **Note:** Time span events are also known as life cycle events.
 *
 * @param {object} params Configuration parameters.
 * @param {CIQ.ChartEngine}	params.stx The chart object.
 * @param {number} params.height The static height of the time span events panel in pixels. If
 * 		this parameter is set, the panel remains at the specified height regardless of the number
 * 		of event swim lanes in the panel. If this parameter is not set, the height of the panel
 * 		is calculated based on the number of swim lanes and the swim lane spacing specified in
 * 		`params.customConstants` and the *plugins/timespanevent/constants.js* file.
 * @param {CIQ.UI.Context} [params.context] The chart user interface context.
 * 		**Note:** Required when {@link CIQ.UI} is non-null.
 * @param {string} [params.menuItemSelector] The CSS selector used to identify menu items for
 * 		selecting time span events.
 * @param {boolean} [params.loadSample] If true, load the built-in time span events sample.
 * @param {object} [params.infoPanel] Specifies the panel where pop-up displays appear when a
 * 		marker is selected. Can also specify that a pop-up display should not appear. Pop-up
 * 		displays contain information about time span events or sub-events. The value of the
 * 		object properties &mdash; `spanEvent`, `durationEvent`, and `singleEvent` (see below)
 * 		&mdash; must be "panel" or "main" for the displays to appear in the time span events
 * 		panel or main chart area, respectively. To prevent pop-up displays from appearing,
 * 		omit the `spanEvent`, `durationEvent`, or `singleEvent` property or set the property
 * 		value to null or a string other than "panel" or "main". **Note:** The properties of
 * 		this object are overridden by the `infoPanel` property of swim lane data objects
 * 		passed to the {@link CIQ.TimeSpanEventPanel#showTimeSpanEvent} function.
 * @param {string} [params.infoPanel.spanEvent] Location for span event pop-up displays.
 * @param {string} [params.infoPanel.durationEvent] Location for duration event pop-up
 * 		displays.
 * @param {string} [params.infoPanel.singleEvent] Location for single event pop-up displays.
 * @param {boolean} [params.showTooltip] If true, shows a tooltip on hover over a span event
 * 		or single event marker.
 * @param {object} [params.customConstants] Modifies the values of the contants in
 * 		*plugins/timespanevent/constants.js* or establishes new time span event constants.
 * 		The object properties can be the names of constants in *constants.js* or new constant
 * 		names. If the name of a property in this object matches the name of a constant in
 * 		*constant.js*, the value of the constant is overwritten by the property value. If a
 * 		property name in this object does not match the name of a constant in *constant.js*,
 * 		a new time span event constant is created. The new constant is assigned the property
 * 		value. See example below.
 * @param {function} [params.cb] Callback function to execute upon completion of this
 * 		constructor.
 * @param {boolean} [params.alwaysZoom] Sets the
 * 		[alwaysZoom]{@link CIQ.TimeSpanEventPanel#alwaysZoom} property.
 *
 * @constructor
 * @name CIQ.TimeSpanEventPanel
 * @since
 * - 7.2.0
 * - 8.0.0 Added `params.customConstants`, `params.cb`, `params.infoPanel`, `params.showTooltip`,
 * 		and `params.alwaysZoom`. Added the `alwaysZoom` property.
 *
 * @example <caption>Declare a time span event panel and enable/disable using commands to be
 * 		triggered from a menu.</caption>
 * var stxx=new CIQ.ChartEngine({container:document.querySelector(".chartContainer")});
 *
 * // Instantiate the time span event panel.
 * new CIQ.TimeSpanEventPanel({
 *     stx: stxx,
 *     infoPanel: {
 *         durationEvent: "main",
 *         spanEvent: "panel",
 *         singleEvent: null
 *     },
 *     customConstants: {
 *         SPACING: 35,
 *         RECT_HEIGHT: 25,
 *         RADIUS_DEFAULT: 13,
 *         RADIUS_HIGHLIGHT: 16,
 *         MY_NEW_CONSTANT: 99
 *     }
 * });
 *
 * // To display the panel from a menu, use:
 * stxx.layout.timeSpanEventPanel = true // Show the panel.
 * stxx.changeOccurred("layout"); // Signal the change to force a redraw.
 *
 * // To hide the panel from a menu, use:
 * stxx.layout.timeSpanEventPanel = false; // Hide the panel.
 * stxx.changeOccurred("layout"); // Signal the change to force a redraw.
 */
CIQ.TimeSpanEventPanel = function (params) {
	let {
		stx,
		height,
		context,
		menuItemSelector: menuSelector,
		loadSample,
		customConstants,
		cb
	} = params;
	if (height) this.staticHeight = height;
	this.eventData = []; // order selected matters
	this.activeMarkers = {};
	stx.timeSpanEventPanel = this;

	let modifiedConstants = (this.modifiedConstants = CIQ.extend(
		lceConstants,
		customConstants
	));
	({
		SPACING,
		SPACING_BUFFER,
		LCE_FOLDER,
		TIME_SPAN_EVENT,
		TIME_SPAN_EVENT_PANEL,
		TIME_SPAN_EVENT_CLASS,
		TIME_SPAN_EVENT_IMPLEMENTATION
	} = modifiedConstants);

	var basePath = CIQ.ChartEngine.pluginBasePath + LCE_FOLDER;

	/**
	 * Enables event zoom on any time span event regardless of whether the event has
	 * sub-children.
	 *
	 * **Note:** Individual event markers can set their own `alwaysZoom` property for more
	 * granular control (see {@link CIQ.Marker.TimeSpanEvent}). If a marker sets its
	 * `alwaysZoom` property to false, the marker's property takes precedence, and the marker
	 * zooms only if it has sub-children.
	 *
	 * @alias alwaysZoom
	 * @memberof CIQ.TimeSpanEventPanel.prototype
	 * @default true
	 * @since 8.0.0
	 */
	this.alwaysZoom =
		typeof params.alwaysZoom !== "undefined" ? params.alwaysZoom : true;

	let callback = function () {
		if (CIQ.UI) {
			new CIQ.UI.TimeSpanEvent(context, {
				menuItemSelector: menuSelector,
				loadSample: loadSample
			});
		}
	};

	if (_css) {
		CIQ.addInternalStylesheet(_css, "timespanevent.scss");
		callback();
	} else {
		CIQ.loadStylesheet(basePath + "timespanevent.css", callback);
	}

	this.infoPanel = params.infoPanel || {}; // where to display info box for an eventType
	this.showTooltip = params.showTooltip;

	/**
	 * Creates and displays the panel or destroys the panel depending on the state.
	 *
	 * @param {Boolean} on State boolean that determines whether to show or destroy the panel; `true` = display, `false` = destroy.
	 * @memberOf CIQ.TimeSpanEventPanel.prototype
	 * @alias display
	 * @since 7.2.0
	 */
	this.display = function (on) {
		if (!on) {
			stx.panelClose(stx.panels[TIME_SPAN_EVENT_PANEL]);
			return;
		}

		var panelHeight =
			this.staticHeight ||
			this.calculatePanelHeight(stx.timeSpanEventPanel.eventData.length);

		var yAxis = null;
		if (!stx.panels.timeSpanEventPanel) {
			yAxis = new CIQ.ChartEngine.YAxis();
			yAxis.name = TIME_SPAN_EVENT;
			var noExport = true;
			stx.timeSpanEventPanel.panel = stx.createPanel(
				"Life Cycle Events",
				TIME_SPAN_EVENT_PANEL,
				panelHeight,
				stx.chart.name,
				yAxis,
				noExport
			);
		} else {
			var panel = stx.panels.timeSpanEventPanel;
			yAxis = stx.getYAxisByName(panel, TIME_SPAN_EVENT);
			stx.timeSpanEventPanel.panel = panel;
		}

		yAxis.max = stx.timeSpanEventPanel.panel.height;
		yAxis.min = 0;
		yAxis.displayGridLines = false;
		yAxis.noDraw = true;

		stx.resizeChart();

		// add markers to the panel if they already exist
		var eventData = stx.timeSpanEventPanel.eventData;
		for (var i = 0; i < eventData.length; i++) {
			this.showTimeSpanEvent(eventData[i], true);
		}
		stx.layout.timeSpanEventPanel = true;
	};

	/**
	 * Displays time span events in the panel.
	 *
	 * @param {object} spanEvent Defines a swim lane (horizontal row) of time span events.
	 * @param {string} spanEvent.type Identifies the swim lane and the type of events
	 * 		contained in the swim lane; for example, "Reports", "Weather", "Filings". Values
	 * 		are implementation specific.
	 * @param {object[]} spanEvent.events An array of objects that define the individual
	 * 		time span events that appear in the swim lane.
	 * @param {string} spanEvent.spanType Categorizes the time span events contained in the
	 * 		swim lane. Must be one of the following: "spanEvent", "durationEvent", or
	 * 		"singleEvent".
	 * @param {string} [spanEvent.infoPanel] Specifies the panel where infromation pop-up
	 * 		displays appear when a marker is selected. Must be "panel" or "main" for the
	 * 		pop-up displays to appear in the time span events panel or main chart area,
	 * 		respectively. To prevent pop-up displays from appearing, set the value to null or
	 * 		a string other than "panel" or "main". **Note:** This parameter overrides the
	 * 		respective value in the `infoPanel` parameter of {@link CIQ.TimeSpanEventPanel}.
	 * @param {boolean} [preLoad] If `true`, the event data already exists, which is the case
	 * 		when time span event data is loaded before the panel is active.
	 *
	 * @alias showTimeSpanEvent
	 * @memberOf CIQ.TimeSpanEventPanel.prototype
	 * @since
	 * - 7.2.0
	 * - 8.0.0 Added the `infoPanel` parameter.
	 */
	this.showTimeSpanEvent = function (spanEvent, preLoad) {
		var tsePanel = stx.timeSpanEventPanel;
		var eventData = tsePanel.eventData;
		var type = spanEvent.type;

		if (!tsePanel.panel) tsePanel.display(true);

		if (!preLoad) {
			spanEvent.spacingModifier = this.calculateSpacingModifier(
				eventData.length
			);
			eventData.push(spanEvent);
		}

		this.checkSetPanelHeight();

		var activeMarker = {
			label: type,
			injections: [],
			uniqueMarkerIds: []
		};
		this.activeMarkers[type] = activeMarker;

		stx.timeSpanEventPanel.renderTimeSpanEvent(spanEvent);
		stx.draw();
	};

	/**
	 * Removes time span events from the panel.
	 *
	 * @param {string} type The type of time span events to remove from the panel; for
	 * 		example, "News" or "CEO". See the `spanEvent.type` property in
	 * 		[showTimeSpanEvent]{@link CIQ.TimeSpanEventPanel#showTimeSpanEvent}.
	 *
	 * @memberOf CIQ.TimeSpanEventPanel.prototype
	 * @alias removeTimeSpanEvent
	 * @since 7.2.0
	 */
	this.removeTimeSpanEvent = function (type) {
		var tsePanel = stx.timeSpanEventPanel;
		var tsePanelVisible = tsePanel.panel;
		var eventData = tsePanel.eventData;
		var spacingModifierDeleted = null;
		var indexToSplice = null;
		// remove the markers on the time span panel and modify the event data
		for (var i = 0; i < eventData.length; i++) {
			var spacingModifier = eventData[i].spacingModifier;
			if (eventData[i].type === type) {
				indexToSplice = i;
				spacingModifierDeleted = spacingModifier;
				if (tsePanelVisible) CIQ.Marker.removeByLabel(stx, type);
			}
			// event data is in order of selected, so anything below the removed event needs a new spacing
			if (spacingModifierDeleted && spacingModifier >= spacingModifierDeleted) {
				eventData[i].spacingModifier -= SPACING + SPACING_BUFFER;
			}
		}

		this.removeChartArtifacts(type);

		if (indexToSplice >= 0) eventData.splice(indexToSplice, 1);
		if (!eventData.length && stx.layout.timeSpanEventPanel) {
			tsePanel.display(false);
			tsePanelVisible = tsePanel.panel = null;
		}

		if (tsePanelVisible) this.checkSetPanelHeight();
		else return; // no need to remove/modify drawings that do not exist

		// go through the existing time span markers and move the "rows" that was below the deleted type
		var markers =
			stx.markerHelper.classMap["CIQ.Marker." + TIME_SPAN_EVENT][
				TIME_SPAN_EVENT_PANEL
			];
		for (i = 0; i < markers.length; i++) {
			if (markers[i].params.datum.spacingModifier >= spacingModifierDeleted) {
				markers[i].params.datum.spacingModifier -= SPACING + SPACING_BUFFER;
			}
		}

		stx.draw();
	};

	/**
	 * Helper function used to dynamically calculate the height of the time span events panel
	 * based on the number of swim lanes.
	 *
	 * @param {number} lanes The number of swim lanes to be rendered in the panel.
	 * @return {number} The panel height in pixels.
	 *
	 * @alias calculatePanelHeight
	 * @memberOf CIQ.TimeSpanEventPanel.prototype
	 * @since 8.0.0
	 */
	this.calculatePanelHeight = function (lanes) {
		return lanes * SPACING + (lanes + 1) * SPACING_BUFFER;
	};

	/**
	 * Helper function used to check and set the required height of the time span events panel.
	 *
	 * Typically called when the chart is resized, the layout changes, or a swim lane is added
	 * or removed from the time span events panel.
	 *
	 * Does nothing if the `params.height` parameter is provided to the
	 * {@link CIQ.TimeSpanEventPanel} constructor function.
	 *
	 * @alias checkSetPanelHeight
	 * @memberOf CIQ.TimeSpanEventPanel.prototype
	 * @since 8.0.0
	 */
	this.checkSetPanelHeight = () => {
		if (this.staticHeight) return;
		if (!(this.panel && stx.panels[TIME_SPAN_EVENT_PANEL])) {
			if (this.eventData.length)
				this.removeTimeSpanEvent(this.eventData[0].type);
			return;
		}
		const newHeight = this.calculatePanelHeight(this.eventData.length);
		stx.setPanelHeight(this.panel, newHeight);
	};

	/**
	 * Helper function used to calculate the `spacingModifier` for a swim lane (see the
	 * `spanEvent` parameters of
	 * [renderTimeSpanEvent]{@link CIQ.TimeSpanEventPanel#renderTimeSpanEvent}).
	 *
	 * @param {number} index The index of the swim lane for which the spacing modifier is
	 * 		calculated. Swim lanes are indexed from top to bottom in the time span events
	 * 		panel, starting with index zero.
	 * @return {number} The number of pixels of the spacing modifier.
	 *
	 * @alias calculateSpacingModifier
	 * @memberOf CIQ.TimeSpanEventPanel.prototype
	 * @since 8.0.0
	 */
	this.calculateSpacingModifier = function (index) {
		return index * SPACING + (index + 1) * SPACING_BUFFER + SPACING / 2;
	};

	/**
	 * Helper function to remove all the injection and markers from the main chart.
	 *
	 * @param {string} type The type of marker that needs its injections and markers removed.
	 * @memberOf CIQ.TimeSpanEventPanel.prototype
	 * @alias removeChartArtifacts
	 * @since 7.2.0
	 */
	this.removeChartArtifacts = function (type) {
		// now remove all the injections and relevant markers on the main chart
		var activeMarker = this.activeMarkers[type];
		if (!activeMarker) return;
		var markerInjections = activeMarker.injections;
		var markerIds = activeMarker.uniqueMarkerIds;
		for (var i = 0; i < markerInjections.length; i++) {
			stx.removeInjection(markerInjections[i]);
		}

		for (i = 0; i < markerIds.length; i++) {
			CIQ.Marker.removeByLabel(stx, markerIds[i]);
		}
		delete this.activeMarkers[type];
		stx.draw();
	};

	/**
	 * Creates time span event markers.
	 *
	 * @param {object} spanEvents Defines a swim lane (horizontal row) of time span events.
	 * @param {string} spanEvents.type Identifies the swim lane and the type of events
	 * 		contained in the swim lane; for example, "News" or "CEO". Values are
	 * 		implementation specific.
	 * @param {object[]} spanEvents.events An array of objects that define the individual
	 * 		time span events that appear in the swim lane.
	 * @param {string} spanEvents.spanType Categorizes the time span events contained in the
	 * 		swim lane. Must be one of the following: "spanEvent", "durationEvent", or
	 * 		"singleEvent".
	 * @param {string} [spanEvents.infoPanel] Specifies the panel where pop-up displays appear
	 * 		when a marker is selected. Must be "panel" or "main" for the pop-up displays to
	 * 		appear in the time span events panel or main chart area, respectively. To prevent
	 * 		pop-up displays from appearing, set the value to null or a string that is not
	 * 		"panel" or "main". **Note:** This parameter overrides the respective value in the
	 * 		`infoPanel`	parameter of {@link CIQ.TimeSpanEventPanel}.
	 * @param {number} spanEvents.spacingModifier Specifies the amount of space between time
	 * 		span event swim lanes.
	 *
	 * @memberOf CIQ.TimeSpanEventPanel.prototype
	 * @alias renderTimeSpanEvent
	 * @since
	 * - 7.2.0
	 * - 8.0.0 Added the `infoPanel` parameter.
	 */
	this.renderTimeSpanEvent = function (spanEvents) {
		if (stx.timeSpanEventPanel.panel) {
			var panel = stx.timeSpanEventPanel.panel;
			var dataSet = stx.chart.dataSet;
			var yPixel = spanEvents.yPixel;
			var spanType = spanEvents.spanType;
			var modifiedConstants = this.modifiedConstants;

			/**
			 * Helper function that actually creates the TimeSpanEvent marker
			 */
			var createTimeSpanMarker = function (event, eventType, spacingModifier) {
				var datum = {
					startDate: new Date(event.startDate),
					endDate: new Date(event.endDate),
					headline: event.headline,
					story: event.story || null,
					category: event.category || null,
					markerShape: event.markerShape || null,
					bgColor: event.bgColor,
					textColor: event.textColor,
					spanLabel: event.spanLabel,
					img: event.img,
					subChildren: event.subChildren,
					isActive: event.isActive,
					showPriceLines: event.showPriceLines,
					spacing: SPACING,
					spacingModifier: spacingModifier,
					eventZoomPeriodicity: event.eventZoomPeriodicity
				};

				let marker = new CIQ.Marker[TIME_SPAN_EVENT]({
					stx: stx,
					label: event.label,
					spanType: eventType,
					infoPanel: event.infoPanel,
					xPositioner: "date",
					yPositioner: "value",
					panelName: panel.name,
					alwaysZoom: event.alwaysZoom,
					datum: datum
				});
			};

			// Make the yAxis label a marker for the moment. Need more time to figure out how to achieve mockup prototype.
			createTimeSpanMarker(
				spanEvents.events[0],
				"yAxisLabel",
				spanEvents.spacingModifier
			);

			for (var i = 0; i < spanEvents.events.length; i++) {
				var event = spanEvents.events[i];
				var glyph = event.glyph;

				if (!event.startDate) {
					// no start date supplied, take first DT in dataSet
					event.startDate = dataSet[0].DT;
				}

				if (!event.endDate) {
					// no end date supplied, take last DT in dataSet
					event.endDate = dataSet[dataSet.length - 1].DT;
				}

				if (glyph) {
					event.img = new Image();
					event.img.src = glyph;
				}

				event.infoPanel =
					spanEvents.infoPanel !== undefined
						? spanEvents.infoPanel
						: this.infoPanel[spanType];

				createTimeSpanMarker(event, spanType, spanEvents.spacingModifier);
			}
		}
	};

	/**
	 * Creates the information pop-up display that appears when a time span event marker is
	 * selected.
	 *
	 * @param {CIQ.ChartEngine} params.stx The chart object to which the pop-up display is
	 * 		added.
	 *
	 * @alias createEventDetailPanel
	 * @memberOf CIQ.TimeSpanEventPanel.prototype
	 * @since 8.0.0
	 */
	this.createEventDetailPanel = function (stx) {
		const node = document.createElement("div");
		node.className = "ciq-lce-descripton";
		node.style.display = "none";
		node.innerHTML = "<h4></h4><p></p>";
		node.header = node.querySelector("h4");
		node.body = node.querySelector("p");
		new CIQ.Marker({
			stx,
			chartContainer: true,
			label: "LCEeventDescription",
			xPositioner: "none",
			yPositioner: "none",
			node
		});

		this.eventDetailNode = node;

		stx.addEventListener("layout", hideDetail);
		stx.addEventListener("scroll", hideDetail);
		stx.addEventListener("symbolChange", hideDetail);
		function hideDetail() {
			node.marker = null;
			node.style.display = "none";
		}
	};

	/**
	 * Sets the position and shows or hides the information pop-up display for a time span
	 * event marker.
	 *
	 * @param {object} marker The selected time span event marker for which the pop-up display
	 * 		is shown or hidden.
	 * @param {object} panel The panel containing the selected marker.
	 * @param {number} cx The x-axis coordinate used to calculate the position of the left
	 * 		edge of the pop-up display for a `spanEvent` type marker.
	 * @returns {boolean} true, if the function has processed and responded to selection of a
	 * 		`singleEvent` type marker.
	 *
	 * @alias showEventDetail
	 * @memberOf CIQ.TimeSpanEventPanel.prototype
	 * @since 8.0.0
	 */
	this.showEventDetail = function (marker, panel, cx, cy) {
		const {
			params: {
				type,
				infoPanel,
				box: { x0, x1, y0, y1 },
				datum: { headline, story, spanLabel }
			}
		} = marker;
		const { eventDetailNode: nd } = this;

		if (infoPanel !== "panel") return;
		const processed = type === "singleEvent";
		marker.node.style.display = "none"; // hide marker nodes tooltip
		const top = (y1 + y0) / 2;
		const left = type === "spanEvent" ? cx : (x1 + x0) / 2;
		const offset = Math.min((x1 - x0) * 1.8, 20);
		if (nd.marker === marker) {
			nd.marker = null;
			nd.style.display = "none";
			return processed;
		}

		nd.style.display = "block";
		nd.header.innerText = headline || spanLabel;
		nd.body.innerText = story || "";
		nd.marker = marker;
		const { offsetWidth: w, offsetHeight: h } = nd;
		const posLeft =
			left - offset - w > panel.left ? left - offset - w : left + offset;

		let posTop = type === "spanEvent" ? top : top - h / 2;
		if (posTop + h > panel.bottom) {
			posTop -= posTop + h - panel.bottom;
		}
		nd.style.transform = `translate(${posLeft}px, ${posTop}px)`;
		this.showingDetail = true;
		return processed;
	};

	this.createEventDetailPanel(stx);

	stx.addEventListener("layout", ({ stx, layout }) => {
		const { panels, timeSpanEventPanel } = stx;

		if (timeSpanEventPanel && timeSpanEventPanel.panel) {
			let prevPosition = this.panelPosition;
			let position = Object.keys(panels).indexOf(TIME_SPAN_EVENT_PANEL);
			this.panelPosition = position;

			if (prevPosition !== position) this.checkSetPanelHeight();
		}

		if (panels.timeSpanEventPanel) return;
		if (timeSpanEventPanel.activeMarkers) {
			for (let active in timeSpanEventPanel.activeMarkers)
				timeSpanEventPanel.removeChartArtifacts(active);

			const helper = stx.uiContext.getAdvertised("TimeSpanEvent");
			if (helper && helper.menuItemSelector) {
				let nodes = stx.uiContext.topNode.querySelectorAll(
					helper.menuItemSelector
				);
				nodes.forEach((n) => n.classList.remove("ciq-active"));
			}
		}

		if (timeSpanEventPanel) timeSpanEventPanel.panel = null;
		if (layout.timeSpanEventPanel) layout.timeSpanEventPanel = false;
	});

	stx.append("resizeChart", function () {
		const {
			panel,
			lastResizeHeight,
			checkSetPanelHeight
		} = this.timeSpanEventPanel;

		if (panel && lastResizeHeight !== this.height) {
			this.timeSpanEventPanel.lastResizeHeight = this.height;
			checkSetPanelHeight();
		}
	});

	stx.append("createPanel", () => this.checkSetPanelHeight());
	stx.append("panelClose", () => this.checkSetPanelHeight());
	if (cb) cb();
};

// CIQ.UI is only needed for sample implementation
if (CIQ.UI && CIQ.UI.Layout) {
	/**
	 * UI helper for managing the time span event options for showing markers on the chart.
	 *
	 * @name CIQ.UI.TimeSpanEvent
	 * @param {CIQ.UI.Context} context The context.
	 * @param {Object} params Initialization parameters.
	 * @param {string} params.menuItemSelector The selector used to identify menu items for selecting markers.
	 * @param {string} [params.activeClassName="ciq-active"] The class name to be added to a node when a layout item is enabled.
	 * @param {boolean} [params.loadSample] Determines whether to use the time span events sample data.
	 * @constructor
	 * @since 7.2.0
	 */
	CIQ.UI.TimeSpanEvent = function (context, params) {
		var self = this;
		self.context = context;
		if (!params) params = {};
		self.menuItemSelector = params.menuItemSelector;
		self.activeClassName = params.activeClassName || "ciq-active";
		var basePath = CIQ.ChartEngine.pluginBasePath + "timespanevent/";

		function init() {
			self.implementation = new CIQ[TIME_SPAN_EVENT_IMPLEMENTATION](
				context.stx
			);
			context.stx.addEventListener("symbolChange", () => {
				context.stx.timeSpanEventPanel.eventData.forEach((i) => {
					self.implementation.removeTimeSpanEvent(i.type);
					self.implementation.showTimeSpanEvent(i.type);
				});
			});
			context.advertiseAs(self, TIME_SPAN_EVENT);
		}

		if (CIQ[TIME_SPAN_EVENT_IMPLEMENTATION]) {
			init();
		} else if (params.loadSample) {
			CIQ.loadScript(basePath + "examples/timeSpanEventSample.js", init, true);
		}
	};

	CIQ.inheritsFrom(CIQ.UI.TimeSpanEvent, CIQ.UI.Helper);

	/**
	 * Shows or hides the time span event markers.
	 *
	 * @param {HTMLElement} node The HTML element clicked.
	 * @param {string} type The type of time span event to show or hide.
	 * @memberOf CIQ.UI.TimeSpanEvent
	 * @since 7.2.0
	 */
	CIQ.UI.TimeSpanEvent.prototype.showMarkers = function (node, type) {
		var activeClassName = this.activeClassName;
		if (node.node.classList.contains(activeClassName)) {
			node.node.classList.remove(activeClassName);
			if (this.implementation) this.implementation.removeTimeSpanEvent(type);
		} else {
			node.node.classList.add(activeClassName);
			if (this.implementation) this.implementation.showTimeSpanEvent(type);
		}
	};
}
