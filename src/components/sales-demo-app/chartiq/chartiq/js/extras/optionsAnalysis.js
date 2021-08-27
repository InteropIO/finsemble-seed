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


import { CIQ } from "../../js/components.js";
const OptionsAnalysis = {
	configure: (config) => {
		const root = config.root || document;
		Object.assign(config.plugins.crossSection, {
			dataSetField: "optionChain",
			yaxisField: "strike",
			xaxisField: "delta",
			groupField: "expiration,callorput",
			aggOperator: "newest",
			filter: {
				callorput: ["C", "P"]
			},
			symbolInputType: "Underlying",
			formatter: (label) => {
				const node = root.querySelector(
					`[cq-name="menuXaxisField"] [stxtap*="${label}"]`
				);
				return node
					? node.textContent
					: label === "callorput"
					? "Call/Put"
					: CIQ.capitalize(label);
			}
		});
		config.menuXaxisField = [
			{ type: "item", label: "Strike", cmd: "Layout.setXaxisField('strike')" },
			{
				type: "item",
				label: "Lifespan",
				cmd: "Layout.setXaxisField('lifespan')"
			},
			{ type: "item", label: "Price", cmd: "Layout.setXaxisField('price')" },
			{ type: "item", label: "Bid", cmd: "Layout.setXaxisField('bid')" },
			{ type: "item", label: "Ask", cmd: "Layout.setXaxisField('ask')" },
			{ type: "item", label: "Volume", cmd: "Layout.setXaxisField('volume')" },
			{
				type: "item",
				label: "Open Interest",
				cmd: "Layout.setXaxisField('openinterest')"
			},
			{
				type: "item",
				label: "Implied Volatility",
				cmd: "Layout.setXaxisField('impliedvolatility')"
			},
			{ type: "item", label: "Delta", cmd: "Layout.setXaxisField('delta')" },
			{ type: "item", label: "Theta", cmd: "Layout.setXaxisField('theta')" },
			{ type: "item", label: "Vega", cmd: "Layout.setXaxisField('vega')" }
		];
		config.menuYaxisField = [
			{
				type: "item",
				label: "Strike",
				cmd: "Layout.setYaxisField('strike','newest')"
			},
			{
				type: "item",
				label: "Lifespan",
				cmd: "Layout.setYaxisField('lifespan','newest')"
			},
			{
				type: "item",
				label: "Price",
				cmd: "Layout.setYaxisField('price','newest')"
			},
			{
				type: "item",
				label: "Bid",
				cmd: "Layout.setYaxisField('bid','newest')"
			},
			{
				type: "item",
				label: "Ask",
				cmd: "Layout.setYaxisField('ask','newest')"
			},
			{
				type: "item",
				label: "Volume",
				cmd: "Layout.setYaxisField('volume','sum')"
			},
			{
				type: "item",
				label: "Open Interest",
				cmd: "Layout.setYaxisField('openinterest','sum')"
			},
			{
				type: "item",
				label: "Implied Volatility",
				cmd: "Layout.setYaxisField('impliedvolatility','avg')"
			},
			{
				type: "item",
				label: "Delta",
				cmd: "Layout.setYaxisField('delta','avg')"
			},
			{
				type: "item",
				label: "Theta",
				cmd: "Layout.setYaxisField('theta','avg')"
			},
			{
				type: "item",
				label: "Vega",
				cmd: "Layout.setYaxisField('vega','avg')"
			}
		];
		config.menuGroupField = [
			{
				type: "item",
				label: "Strike, Call/Put",
				cmd: "Layout.setGroupField('strike,callorput')"
			},
			{
				type: "item",
				label: "Expiration, Call/Put",
				cmd: "Layout.setGroupField('expiration,callorput')"
			},
			{ type: "item", label: "Strike", cmd: "Layout.setGroupField('strike')" },
			{
				type: "item",
				label: "Expiration",
				cmd: "Layout.setGroupField('expiration')"
			}
		];
		config.menuFilterField = [
			{
				type: "checkbox",
				label: "Calls",
				cmd: "Layout.Filter('callorput','C')"
			},
			{
				type: "checkbox",
				label: "Puts",
				cmd: "Layout.Filter('callorput','P')"
			},
			{ type: "doubleslider", label: "Strike", attrs: "name='strike'" },
			{ type: "doubleslider", label: "Days Out", attrs: "name='lifespan'" }
		];
		config.menuChartPreferences = [
			{
				type: "checkbox",
				label: "X-Axis Scaling",
				cmd: "Layout.XAxisScaling()"
			},
			{
				type: "checkbox",
				label: "Update Animations",
				cmd: "Layout.UpdateAnimations()"
			},
			{
				type: "checkbox",
				label: "Show Update Stamp",
				cmd: "Layout.UpdateStamp()"
			},
			{
				type: "checkboxOptions",
				label: "Recent Updates",
				cmd: "Layout.FreshPoints()",
				options: "Layout.showFreshnessEdit()"
			}
		];
		config.onChartReady = OptionsAnalysis.ready;
		config.onWebComponentsReady = OptionsAnalysis.ready;
		OptionsAnalysis.config = config;
	},
	setUI: () => {
		const { config } = OptionsAnalysis;
		const root = config.root || document;
		const dropdownsToReplace = root.querySelector("cq-context .ciq-dropdowns");
		const newDropdown = document.createElement("div");
		newDropdown.className = "ciq-dropdowns";
		newDropdown.setAttribute("cq-analytics-fields", "");
		const menuMarkup = (label) => `
			<span class="ciq-menu-label">${label.replace("axis", "")}:</span>
			<cq-menu class="ciq-menu ciq-${label.toLowerCase()}">
				<cq-clickable stxbind="Layout.${label.toLowerCase()}Field" class="ciq-menu-field"></cq-clickable>
				<cq-menu-dropdown class="ciq-value-dropdown">
					<cq-menu-container cq-name="menu${label}Field"></cq-menu-container>
				</cq-menu-dropdown>
			</cq-menu>`;
		if (config.menuXaxisField) newDropdown.innerHTML += menuMarkup("Xaxis");
		if (config.menuYaxisField) newDropdown.innerHTML += menuMarkup("Yaxis");
		if (config.menuGroupField) newDropdown.innerHTML += menuMarkup("Group");
		if (config.menuFilterField) {
			let markup = menuMarkup("Filter");
			markup = markup
				.replace("Layout.filterField", "")
				.replace("</cq-clickable>", "Set</cq-clickable>")
				.replace("cq-menu-dropdown", "cq-menu-dropdown cq-no-close");
			newDropdown.innerHTML += markup;
		}
		dropdownsToReplace.parentNode.replaceChild(newDropdown, dropdownsToReplace);
	},
	ready: (stx) => {
		if (stx) OptionsAnalysis.chartReady = true;
		else OptionsAnalysis.slidersReady = true;
		if (!OptionsAnalysis.chartReady || !OptionsAnalysis.slidersReady) return;
		const { config } = OptionsAnalysis;
		const root = config.root || document;
		Array.from(root.querySelectorAll("cq-lookup-filters cq-filter")).forEach(
			(el) => {
				if (el.innerHTML === "BONDS") el.innerHTML = "STOCKS";
				if (el.innerHTML === "FUTURES") el.innerHTML = "INDEXES";
			}
		);
		Array.from(root.querySelectorAll("cq-lookup")).forEach((el) => {
			el.setAttribute(
				"cq-exchanges",
				"XNYS,XASE,XNAS,XASX,INDCBSX,INDXASE,INDXNAS,IND_DJI,ARCX,INDARCX"
			);
		});
		const histPrice = document.createElement("cq-chart-title-date");
		histPrice.className = "ciq-chart-title-hist-price";
		document
			.querySelector("cq-chart-title cq-chart-price")
			.appendChild(histPrice);
		stx.chart.xAxis.minimumLabelWidth = 20;
		stx.tapForHighlighting = false;
		const sliderArray = Array.from(root.querySelectorAll("cq-double-slider"));
		stx.append("draw", () => {
			sliderArray.forEach((el) => {
				const bounds = stx.crossSection.findExtrema(el.name);
				if (bounds.min) {
					if (bounds.min < 30) bounds.step = 1;
					else if (bounds.min < 100) bounds.step = 5;
					else if (bounds.min < 1000) bounds.step = 10;
					else bounds.step = 25;
				}
				el.setBounds(bounds);
			});
		});
		sliderArray.forEach((el) => {
			stx.addEventListener("symbolChange", function () {
				let value = this.layout.filter[el.name];
				if (el.name === "strike") value = {};
				el.setValue(value);
			});
			el.setValue(stx.layout.filter[el.name]);
			CIQ.UI.observeProperty("value", el, (obj) => {
				if (!stx.currentlyImporting) {
					let filter = stx.layout.filter;
					filter[el.name] = obj[obj.property];
					stx.crossSection.setFilters(filter);
				}
			});
			CIQ.UI.observeProperty(el.name, stx.layout.filter, (obj) =>
				el.setValue(obj.value)
			);
		});
	}
};
export default OptionsAnalysis;
