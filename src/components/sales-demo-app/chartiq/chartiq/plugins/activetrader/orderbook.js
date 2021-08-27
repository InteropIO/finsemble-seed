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

/**
 * Order Book web component `<cq-orderbook>`.
 *
 * Displays a table of Level 2 Bid/Ask information from {@link CIQ.ChartEngine.Chart#currentMarketData}.
 *
 * **Requires [Active Trader]{@link CIQ.MarketDepth} plugin. See {@link CIQ.ChartEngine#updateCurrentMarketData} for data requirements**
 *
 * Optional Attributes:
 * - `cq-close`  : Adds a cq-close component to control visibility.
 * - `cq-show-totals` : Displays Total Size and Total Amount columns.  Omit this attribute for a more condensed book.
 *
 * This component will take up 100% of its parent element.
 *
 * There are two ways to proportionally shade the rows with the size magnitude:
 * 1. Use attribute `cq-size-shading` which uses a linear-gradient (used in our sample).
 * 2. If that does not work on your required browsers, the second method is to include the `<div col="shading"></div>` cell within the template.
 *
 * Working example:<br>
 * <iframe width="100%" height="500" scrolling="no" seamless="seamless" align="top" style="float:top" src="https://jsfiddle.net/chartiq/L30hna2s/embedded/result,js,html/" allowfullscreen="allowfullscreen" frameborder="1"></iframe>
 *
 * @namespace WebComponents.cq-orderbook
 * @since 6.1.0
 *
 * @example
 * <!-- Define your chart context. -->
 * <cq-context>
 * <!-- Define your UI manager component. -->
 * <cq-ui-manager></cq-ui-manager>
 * <!-- This is your chart container. Position it anywhere and in any way that you wish on your webpage. Make position style=relative. -->
 * <div class="chartContainer" style="width:800px;height:460px;position:relative;">
 *     <cq-orderbook cq-active>
 *     <cq-orderbook-table reverse>
 *         <cq-scroll>
 *             <cq-orderbook-bids></cq-orderbook-bids>
 *         </cq-scroll>
 *     </cq-orderbook-table>
 *     <cq-orderbook-table>
 *         <cq-scroll>
 *             <cq-orderbook-asks></cq-orderbook-asks>
 *         </cq-scroll>
 *     </cq-orderbook-table>
 *     <template>
 *         <cq-item cq-size-shading>
 *             <div col="price">Price</div>
 *             <div col="size">Size</div>
 *             <div col="cum_size">Total Size</div>
 *             <div col="amount">Amount</div>
 *             <div col="cum_amount">Total Amount</div>
 *             <div col="shading"></div>
 *         </cq-item>
 *     </template>
 *     </cq-orderbook>
 * </div>
 * </cq-context>
 *
 * @example
 * // Once the component is added to the HTML it can be activated and data loaded as follows:
 * let stxx = new CIQ.ChartEngine({container:document.querySelector(".chartContainer")});
 * new CIQ.UI.Context(stxx, document.querySelector("cq-context,[cq-context]"));
 * stxx.updateCurrentMarketData(yourL2Data); // Call this every time you want refresh.
 */
class Orderbook extends CIQ.UI.ModalTag {
	connectedCallback() {
		if (this.attached) return;
		super.connectedCallback();
	}

	disconnectedCallback() {
		if (this.context) {
			var stx = this.context.stx;
			CIQ.UI.unobserveProperty(
				"touched",
				stx.chart.currentMarketData,
				this.listener
			);
		}
		super.disconnectedCallback();
	}

	close() {
		this.node.removeAttr("cq-active");
	}

	createMatrix(data) {
		var res = [],
			lastRecord;
		for (var i = 0; i < data.length; i++) {
			var d = data[i];
			if (!d[1]) continue;
			var amt = d[0] * d[1];
			lastRecord = {
				price: d[0],
				size: d[1],
				cum_size: d[1] + (lastRecord ? lastRecord.cum_size : 0),
				amount: amt,
				cum_amount: amt + (lastRecord ? lastRecord.cum_amount : 0)
			};
			res.push(lastRecord);
		}
		return res;
	}

	createTable(data, selector, reverseOrder) {
		var myTemplate = this.node.find("template");
		var side = this.node.find(selector);
		if (!side.length) return;
		var self = this;
		function setHtml(i) {
			return function () {
				var myCol = this.getAttribute("col");
				if (myCol && data[i][myCol] !== undefined) {
					var val = Number(data[i][myCol].toFixed(8)); // remove roundoff error
					var stx = self.context.stx;
					if (stx.marketDepth) stx = stx.marketDepth.marketDepth;
					val = stx.formatPrice(val, stx.chart.panel);
					this.innerHTML = val;
				}
			};
		}
		function order(selector) {
			return function (e) {
				var price = e.currentTarget.getAttribute("price");
				if (!price && price !== 0) return;
				var tfc = self.context.stx.tfc;
				if (tfc) {
					if (selector == "cq-orderbook-bids") tfc.newTrade("enableBuy");
					else if (selector == "cq-orderbook-asks") tfc.newTrade("enableSell");
					tfc.positionCenterLine(Number(price));
				}
			};
		}
		var setWidth = function (childCount) {
			return function (child) {
				child.style.width =
					CIQ.elementDimensions(child.parentElement, { padding: 1 }).width /
						childCount +
					"px";
			};
		};
		for (var d = 0; d < data.length; d++) {
			var row = side.find("cq-item")[d];
			var children;
			if (row) {
				row = CIQ.UI.$(row);
			} else {
				row = CIQ.UI.makeFromTemplate(myTemplate, side);
				if (reverseOrder) {
					var reverseRow = Array.from(row.children()).reverse();
					row.empty().append(reverseRow);
				}
				children = row.children().not('[col="shading"]');
				var childCount = children.length;
				children.css(
					"width",
					CIQ.elementDimensions(row[0], { padding: 1 }).width / childCount +
						"px"
				);
				if (d === 0) {
					// readjust headers only if there's data
					var headers = this.node.find("[cq-orderbook-header]");
					Array.from(headers.children().not('[col="shading"]')).forEach(
						setWidth(childCount)
					);
				}
				row[0].selectFC = order(selector);
				CIQ.UI.stxtap(row[0], row[0].selectFC);
			}
			children = row.children().not('[col="shading"]');
			children.each(setHtml(d));
			row.attr("price", data[d].price);

			var percentSize =
				(100 * data[d].size) / data[data.length - 1].cum_size + "%";
			// using linear-gradient is ideal, but it doesn't shade the row in IE Edge or Safari - the cells get the shading instead.  Too bad.
			if (row[0].hasAttribute("cq-size-shading")) {
				row.css(
					"background",
					"linear-gradient(" +
						(reverseOrder
							? "to right, " + row.css("border-left-color")
							: "to left, " + row.css("border-right-color")) +
						" " +
						percentSize +
						", transparent " +
						percentSize +
						", transparent)"
				);
			}
			// use absolutely positioned cell instead
			var shadeCell = row.find('[col="shading"]');
			shadeCell.css("width", percentSize);
		}
		// this removes any extra rows from the end.
		side
			.find(
				"cq-item:nth-last-child(-n+" +
					(side.children().length - data.length).toString() +
					")"
			)
			.remove();
		var scroll = this.node.find("cq-scroll");
		scroll.each(function () {
			this.resize();
		});
	}

	open() {
		this.node.attr("cq-active", true);
	}

	setContext({ config }) {
		var self = this,
			stx = this.context.stx;
		this.listener = function (obj) {
			self.update({ obj: stx.chart.currentMarketData });
		};
		CIQ.UI.observeProperty(
			"touched",
			stx.chart.currentMarketData,
			this.listener
		);
		this.addDefaultMarkup(this, this.getMarkup());

		var myTemplate = this.node.find("template");
		var tables = this.node.find("cq-orderbook-table");
		tables.each(function () {
			var header = CIQ.UI.makeFromTemplate(myTemplate);
			if (!header.length) return;
			if (this.hasAttribute("reverse")) {
				var reverseRow = Array.from(header.children()).reverse();
				header.empty().append(reverseRow);
			}
			header.attr("cq-orderbook-header", true);
			this.insertBefore(header[0], this.firstChild);
			// initialize header width at 100/n% width where n is number of columns
			var children = header.children(),
				childCount = children.not('[col="shading"]').length;
			children.css("width", 100 / childCount + "%");
		});
	}

	update(params) {
		if (!CIQ.trulyVisible(this)) return;
		var bids = params.obj.BidL2,
			asks = params.obj.AskL2;
		if (!bids && !asks) return;
		var sortFcn = function (a, b) {
			return a[0] < b[0] ? -1 : 1;
		};
		var bidData = this.createMatrix(
			bids.Price_Size.slice().sort(sortFcn).reverse()
		);
		var askData = this.createMatrix(asks.Price_Size.slice().sort(sortFcn));
		var tables = this.node.find("cq-orderbook-table");
		var self = this;
		tables.each(function () {
			if (this.querySelectorAll("cq-orderbook-bids").length) {
				self.createTable(
					bidData,
					"cq-orderbook-bids",
					this.hasAttribute("reverse")
				);
			}
			if (this.querySelectorAll("cq-orderbook-asks").length) {
				self.createTable(
					askData,
					"cq-orderbook-asks",
					this.hasAttribute("reverse")
				);
			}
		});
	}

	getMarkup() {
		const close = this.hasAttribute("cq-close");
		const includeTotals = this.hasAttribute("cq-show-totals");
		return this.constructor.markup
			.replace("{{close}}", close ? "<cq-close></cq-close>" : "")
			.replace(
				"{{totalsize}}",
				includeTotals ? '<div col="cum_size">Total Size</div>' : ""
			)
			.replace(
				"{{totalamount}}",
				includeTotals ? '<div col="cum_amount">Total Amount</div>' : ""
			);
	}
}

Orderbook.markup = `
		{{close}}
		<cq-orderbook-table reverse>
			<cq-scroll cq-no-claim>
				<cq-orderbook-bids></cq-orderbook-bids>
			</cq-scroll>
		</cq-orderbook-table>
		<cq-orderbook-table>
			<cq-scroll cq-no-claim>
				<cq-orderbook-asks></cq-orderbook-asks>
			</cq-scroll>
		</cq-orderbook-table>
		<template>
			<cq-item cq-size-shading>
				<div col="price">Price</div>
				<div col="size">Size</div>
				{{totalsize}}
				<div col="amount">Amount</div>
				{{totalamount}}
				<!--<div col="shading"></div>-->
			</cq-item>
		</template>
	`;

CIQ.UI.addComponentDefinition("cq-orderbook", Orderbook);
