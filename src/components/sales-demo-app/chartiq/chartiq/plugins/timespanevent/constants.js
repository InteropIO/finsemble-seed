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


let lceConstants = {
	SPACING: 20, // spacing modifier in pixels between event lanes
	SPACING_BUFFER: 20, // spacing modifier in pixels between event lanes
	LCE_FOLDER: "timespanevent/", // name of your lce plugin folder
	TIME_SPAN_EVENT: "TimeSpanEvent", // name space for the lce, controls which markers to use and y-axis naming
	TIME_SPAN_EVENT_PANEL: "timeSpanEventPanel", // the name of the panel to be referenced in the chart engine
	TIME_SPAN_EVENT_CLASS: "span-event", // css class name for lce events
	TIME_SPAN_EVENT_IMPLEMENTATION: "TimeSpanEventSample", // Name for implementation used by UI helper

	RECT_HEIGHT: 18, // height in pixels of a span event
	RADIUS_DEFAULT: 10, // radius of a single or duration event
	RADIUS_HIGHLIGHT: 13, // RADIUS_DEFAULT + 3
	RADIUS_TAIL: 2, // size of end point for a single or duration event
	RADIUS_SUBCHILDREN: 2.5, // size of the subchildren events
	DASHED_LINE_PATTERN: [5, 3], // standard pattern array for drawing dashed lines
	LINE_WIDTH_DEFAULT: 1, // line width of your shapes
	LINE_WIDTH_HIGHLIGHT: 2, // line width of your shapes highlighted
	HIGHLIGHT_OPACITY: 0.3, // opacity of the highlight shape when hovered
	ACTIVE_OPACITY: 0.5, // opacity of the highlight shape when clicked
	IMAGE_HEIGHT: 20, // pixel height of image icons
	IMAGE_WIDTH: 20, // pixel width of image icons

	CHART_SHAPE_COLOR: "#C950D7", // color of the markers on the chart
	X_AXIS_LABEL_TEXT_COLOR: "#FFFFFF", // text color of the floating x-axis labels
	DEFAULT_TSE_BG_COLOR: "#BBBBBB", // default color of the shaded background color
	DEFAULT_TSE_TEXT_COLOR: "#FFFFFF", // default text color of the span event text
	ONGOING_ARROW_COLOR: "#A6A6A6", // color of the icon that shows more data is available
	ONGOING_ARROW_BUFFER: 10, // spacing buffer for the ongoing data icon to not interfere with click events
	ACTIVE_ARROW_BUFFER: 5, // spacing buffer for the active arrow icon to not interfere with click events
	CHART_ALPHA: 0.2, // opacity of the shaded background color
	CHART_PRICE_LINE_PATTERN: "dashed", // line pattern for events pointing to price points
	CHART_PRICE_LINE_WIDTH: 1, // width of line pointing to price points
	CHART_PRICE_LINE_OPACITY: 1, // opacity of line pointing to price points

	TSE_PANEL_ALPHA: 0.7, // opacity of events on the lce panel
	TSE_PANEL_DEFAULT_ALPHA: 1, // default opacity of the events on the lce panel
	TSE_CLASS_NAME: "CIQ.Marker.TimeSpanEvent", // name space for the lce marker to use

	DEFAULT_TOOLTIP_LEFT: "-50000px", // default lce tooltip placement, off the screen by default
	DEFAULT_TOOLTIP_BUFFER: 5, // spacing buffer for the tooltip to not interfere with click events

	INFO_BOX_OFFSET: 5 // distance to offset info box
};

export default lceConstants;
