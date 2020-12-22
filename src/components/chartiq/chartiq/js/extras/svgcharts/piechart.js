/**
 *	8.0.0
 *	Generation date: 2020-10-08T11:28:10.884Z
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


/*
	Pie chart
	=========
	Creates an SVG pie chart using D3
*/
import { CIQ } from "../../../js/chartiq.js";
/* global d3 */
/**
 * Namespace for SVG Charts.
 *
 * @namespace CIQ.SVGChart
 */
if (!CIQ.SVGChart) CIQ.SVGChart = {};
let warned = false;
/**
 * Draws a pie or donut chart SVG graphic using D3.
 *
 * This method should rarely if ever be called directly. Use {@link CIQ.Visualization} instead. This method should be passed in as the `renderFunction` attribute.
 * The data array for this method takes an object with a `name` and a `value` property for each segment of the pie.
 *
 * The attributes supported for this specific method are documented as parameters below.
 *
 * This method attaches the following class names, allowing styles to be assigned to them:
 * - arc: Attaches to each `<g>` element containing a `<path>` element defining a pie wedge.
 * - name: Attaches to the `<tspan>` element containing the text fill of the `name` property of the data.
 * - value: Attaches to the `<tspan>` element containing the text fill of the `value` property of the data.
 * - title: Attaches to the `<g>` element containing the chart's title text.
 *
 * @param {array} data Array of objects representing the data to use when generating the SVG graphic.
 * @param {object} attributes Parameters to be used when creating the SVG graphic.
 * @param {HTMLElement} attributes.container Element in which to place the SVG graphic. This element must have a height and width defined in its CSS.
 * @param {boolean} [attributes.printLabels=true] Set to false to suppress the printing of the data's name property on the chart.
 * @param {boolean} [attributes.printValues=true] Set to false to suppress the printing of the data's value property on the chart.
 * @param {function} [attributes.valueFormatter] Optional formatting function for values. If omitted, formats `toLocaleString`.
 * @param {function} [attributes.translator] Optional translation function for text. If omitted, uses the chart engine's translation function if available.
 * @param {function} [attributes.onclick] Optional click handler to be placed on each SVG path (each pie wedge). The function takes a D3 record `d`, in which
 * 		one can find the data record (`d.data`).
 * @param {function} [attributes.sorter] Optional sorting function for the wedges in the pie, beginning clockwise from top.
 * @param {function|array} [attributes.colorRange] Optional function or array for setting the range of colors. The function should return an array.
 * 		The colors are assigned to the data array's elements *before* the sorting function is called. The default array is produced by the D3 function
 * 		`d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse()`. A function is useful for generating a color based on a scale.
 * 		An array is useful for assigning a color to a specific data record based on its location within the data array.
 * @param {function} [attributes.legend] Optional legend function. If set to `true`, will use the built in legend creator. If passed a function, will use that.
 * 		Function has the following signature: `legendFunc(svg, pieData, color)` where:
 * 		- svg is the D3 SVG graphic being created
 * 		- pieData is the D3 data being rendered
 * 		- color is the D3 color function
 * @param {string} [attributes.type=pie] Valid values are "pie" or "donut".
 * @param {function} [attributes.padAngle=0.005] Function that returns radians of blank space between each wedge; takes a D3 record `d`.
 * @param {function} [attributes.showValueAngle=0.25] Function that returns radians below which a wedge would not display the value; takes a D3 record `d`.
 * @param {string} [attributes.className] Optional class name for the chart. This is attached to the <svg> tag.
 * @param {string} [attributes.title] Optional title for the chart; appears above the chart if specified.
 * @return {HTMLElement} An SVG element.
 *
 * @example
 * ```
 * // Minimal example -- creates a container 300 x 300 pixels
 * let pie=new CIQ.Visualization({ renderFunction: CIQ.SVGChart.renderPieChart });
 * pie.updateData({"Low":{name:"low", value:30}, "High":{name:"high", value:70}});
 * CIQ.extend(pie.container.style, {position:"absolute",top:0,zIndex:500});  // style container
 * ```
 *
 * ```
 * <!-- Puts chart into canvas shim. -->
 * <style>
 * 	#pie {
 * 		height: 250px;
 * 		width: 250px;
 * 		position: absolute;
 * 		bottom: 150px;
 * 		left: 200px;
 * 		opacity: 0.8;
 * 		display : block;
 * 		pointer-events: auto;  // set to none if the chart is blocking chart interaction
 * 		z-index: 500;
 * 	}
 * 	.pie-chart {
 * 		fill: #000;
 * 	}
 * 	.ciq-night .pie-chart {
 * 		fill: #fff;
 * 	}
 * 	.pie-chart .arc {
 * 		font-size: 12px;
 * 		text-anchor: middle;
 * 	}
 * 	.pie-chart .arc tspan {
 * 		fill: #333;
 * 		}
 * 	.pie-chart .arc tspan.name {
 * 		font-weight: bold;
 * 	}
 * 	.pie-chart .arc tspan.value {
 * 		fill-opacity: 0.8;
 * 	}
 * 	.pie-chart .title {
 * 		font-size: 14px;
 * 		font-weight: bold;
 * 	}
 * 	.pie-chart .title text {
 * 		text-anchor: middle;
 * 		text-align: center;
 * 		dominant-baseline: hanging;
 *  }
 * </style>
 * ...
 * var attributes={
 * 		title: "My Donut Chart",
 * 		type: "donut",
 * 		container: "#pie",
 * 		className: "pie-chart",
 * 		useCanvasShim: true,
 * 		stx: stxx,
 * 		renderFunction: CIQ.SVGChart.renderPieChart
 * };
 * (new CIQ.Visualization(attributes)).updateData(data);
 * ```
 *
 * @memberof CIQ.SVGChart
 * @since 7.4.0
 */
CIQ.SVGChart.renderPieChart = (data, attributes) => {
	if (typeof d3 === "undefined") {
		if (!warned)
			console.warn(
				"This svg is created using D3.  Please include D3 in your application."
			);
		warned = true;
		return;
	}
	attributes.forceReplace = true; // This render function expects to always render a fresh svg.
	const containerStyle = getComputedStyle(attributes.container);
	const height = parseFloat(containerStyle.height),
		width = parseFloat(containerStyle.width);
	const printLabels = attributes.printLabels !== false;
	const printValues = attributes.printValues !== false;
	const trans = attributes.translator || ((x) => x);
	const format = attributes.valueFormatter || ((x) => x.toLocaleString());
	const onclick = attributes.onclick || ((d) => false);
	const padAngle = attributes.padAngle || ((d) => (d.value ? 0.005 : 0));
	const showValueAngle = attributes.showValueAngle || ((d) => 0.25);
	const pie = d3
		.pie()
		.padAngle(padAngle)
		.sort(attributes.sorter || null)
		.value((d) => d.value);
	const color = d3
		.scaleOrdinal()
		.domain(data.map((d) => d.name))
		.range(
			attributes.colorRange ||
				(data.length > 1
					? d3
							.quantize(
								(t) => d3.interpolateSpectral(t * 0.8 + 0.1),
								data.length
							)
							.reverse()
					: ["#7f7f7f"])
		);
	const radius = Math.min(width, height) / 2;
	const path = d3
		.arc()
		.padAngle(padAngle)
		.innerRadius(attributes.type == "donut" ? radius * 0.5 : 0)
		.outerRadius(radius * 0.85);
	const label = d3
		.arc()
		.innerRadius(radius * 0.55)
		.outerRadius(radius * 0.75);
	const pieData = pie(data);
	const svg = d3
		.create("svg")
		.attr("xmlns", "http://www.w3.org/2000/svg")
		.attr("width", width)
		.attr("height", height)
		.attr("class", attributes.className);
	const g = svg
		.append("g")
		.attr("transform", `translate(${width / 2},${height / 2})`);
	const arc = g
		.selectAll(".arc")
		.data(pieData)
		.enter()
		.append("g")
		.attr("class", "arc");
	arc
		.append("path")
		.attr("d", path)
		.attr("fill", (d) => color(d.data.name))
		.on("click", onclick);
	arc
		.append("text")
		.attr("transform", (d) =>
			attributes.type == "donut"
				? `translate(${path.centroid(d)})`
				: `translate(${label.centroid(d)})`
		)
		.call((text) =>
			text
				.filter((d) => printLabels && d.endAngle - d.startAngle > padAngle(d))
				.append("tspan")
				.attr("class", "name")
				.attr("y", printValues ? "-0.4em" : 0)
				.text((d) => trans(d.data.name))
		)
		.call((text) =>
			text
				.filter(
					(d) => printValues && d.endAngle - d.startAngle > showValueAngle(d)
				)
				.append("tspan")
				.attr("class", "value")
				.attr("x", 0)
				.attr("y", "0.7em")
				.text((d) => format(d.data.value))
		);
	if (printLabels || printValues) {
		arc
			.append("title")
			.text(
				(d) =>
					(printLabels ? trans(d.data.name) : "") +
					(printLabels && printValues ? ": " : "") +
					(printValues ? format(d.data.value) : "")
			);
	}
	if (attributes.title) {
		svg
			.append("g")
			.attr("class", "title")
			.append("text")
			.attr("transform", `translate(${width / 2}, 0)`)
			.attr("y", height / 2 - radius * 0.9)
			.text(trans(attributes.title));
	}
	if (attributes.legend === true) {
		const legend = svg
			.selectAll(".legend")
			.data(pieData)
			.enter()
			.filter((d) => d.value > 0)
			.append("g")
			.attr("class", "legend");
		legend.attr(
			"transform",
			(d, i) =>
				`translate(${width / 2 + 0.9 * radius},${
					(height + 15 * (2 * i - legend.size())) / 2
				})`
		);
		legend
			.append("rect")
			.attr("width", 10)
			.attr("height", 10)
			.attr("fill", (d, i) => color(d.data.name));
		legend
			.append("text")
			.text((d) => d.data.name)
			.attr("y", 10)
			.attr("x", 11);
	} else if (typeof attributes.legend == "function") {
		attributes.legend(svg, pieData, color);
	}
	return svg.node();
};
