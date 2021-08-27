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
import "./thirdparty/pikaday.js";

const Pikaday = window.Pikaday;
let _datepicker_css;

if (
	typeof define === "undefined" &&
	typeof module === "object" &&
	typeof require === "function"
) {
	_datepicker_css = require("./datepicker.css");
} else if (typeof define === "function" && define.amd) {
	define(["./datepicker.css"], function (m1) {
		_datepicker_css = m1;
	});
}

/**
 * Date picker web component `<cq-datepicker>`.
 *
 * This web component enables users to enter dates. It works as a wrapper for the Pikaday datepicker, and as such,
 * requires Pikaday.js as a dependency. When the web component loads, it looks for a `div` with the ID "datepicker"
 * and loads the Pikaday datepicker on that `div`.
 *
 * @name CIQ.UI.Datepicker
 * @namespace WebComponents.cq-datepicker
 * @since 7.3.0
 *
 * @example
 * <cq-datepicker>
 *     <div id="datepicker"></div>
 * </cq-datepicker>
 */
class Datepicker extends CIQ.UI.ContextTag {
	constructor() {
		super();
		this.callbacks = [];
	}

	connectedCallback() {
		if (this.attached) return;
		const self = this;

		const loadComponent = () => {
			const picker = new Pikaday({
				onSelect: (date) => self.executeCallbacks(date)
			});

			this.picker = picker;
			this.insertBefore(picker.el, this.firstElementChild);

			CIQ.UI.stxtap(
				this,
				() => {
					picker.setDate(new Date());
				},
				".ciq-btn"
			);
		};

		if (_datepicker_css) {
			CIQ.addInternalStylesheet(_datepicker_css, "datepicker.css");
			loadComponent();
		} else {
			const basePath = CIQ.ChartEngine.pluginBasePath + "termstructure/";
			CIQ.loadStylesheet(basePath + "datepicker.css", loadComponent);
		}

		CIQ.UI.stxtap(this, function (event) {
			// prevent datepicker from closing on clicks
			event.stopPropagation();
		});

		super.connectedCallback();
	}

	registerCallback(cb) {
		this.callbacks.push(cb);
	}

	executeCallbacks(date) {
		this.callbacks.forEach(function (cb) {
			cb(date);
		});
	}
}

CIQ.UI.addComponentDefinition("cq-datepicker", Datepicker);
