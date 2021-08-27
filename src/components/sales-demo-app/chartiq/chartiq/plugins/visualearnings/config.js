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


export default {
	markup: `
<cq-menu class="ciq-menu stx-visualearnings collapse">
	<span></span>
	<cq-menu-dropdown>
	  <cq-menu-container cq-name="menuEstimize"></cq-menu-container>
	</cq-menu-dropdown>
</cq-menu>
`,
	menu: [
		{
			type: "checkbox",
			label: "Price Horizon: EPS",
			cmd: "Layout.VisualEarningsFlag('ph_eps')"
		},
		{
			type: "checkbox",
			label: "Price Horizon: REV",
			cmd: "Layout.VisualEarningsFlag('ph_rev')"
		},
		{
			type: "checkbox",
			label: "Historical",
			cmd: "Layout.VisualEarningsFlag('ph_historical')"
		},
		{
			type: "item",
			label: "Miss/Beat: EPS",
			cmd: "VisualEarnings.toggle('earnings')"
		},
		{
			type: "item",
			label: "Miss/Beat: REV",
			cmd: "VisualEarnings.toggle('revenue')"
		},
		{ type: "item", label: "Data Table", cmd: "VisualEarnings.toggle('data')" }
	]
};
