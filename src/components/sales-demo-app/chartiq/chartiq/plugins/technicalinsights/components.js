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
import "./controller.js";

let _json, _css;

if (
	typeof define === "undefined" &&
	typeof module === "object" &&
	typeof require === "function"
) {
	_json = require("./lexicon.json");
	_css = require("./ui.css");
} else if (typeof define === "function" && define.amd) {
	define(["./lexicon.json", "./ui.css"], function (m1, m2) {
		_json = m1;
		_css = m2;
	});
}

const offset = 48;
const basePath = CIQ.ChartEngine.pluginBasePath + "technicalinsights/";

/**
 * Tag that activates the Technical Insights plug-in module in a chart.
 *
 * Setup  instructions:
 * - Your package must include the module in the **plugin** directory.
 * - In  **sample-template-advanced.html**, un-comment the following line: <br>`import "./plugins/technicalinsights/components.js";`
 * - Set the `uid` provided by vendor in this component's tag. See example.
 *   - Tag is located in **`/examples/templates/partials/sample-template-advanced-context.html`**.
 *   - If the `uid` is not properly set, the following error will be visible in the browser's' console: <br>**CIQ.TechnicalInsights: No Authorization token (auth) provided**
 *
 * @example <cq-technicalinsights uid="id-here" lang="en"></cq-technicalinsights>
 *
 * @namespace WebComponents.cq-technicalinsights
 */
class TechnicalInsights extends CIQ.UI.ContextTag {
	static get observedAttributes() {
		return ["disabled"];
	}

	constructor() {
		super();
		this.dom = {};
		this.initialized = false;
	}

	attributeChangedCallback(name, oldVal, newVal) {
		const { controller, initialized } = this;

		if (!(initialized && controller)) return; // avoid throwing errors when we initialize

		// DISABLE plugin
		if (oldVal === null && typeof newVal === "string") {
			controller.removeInjections();
			controller.removeListeners();
			this.adjustChartArea(offset * -1);
		}

		// ENABLE plugin
		if (newVal === null && typeof oldVal === "string") {
			controller.addListeners();
			this.adjustChartArea(offset);
			this.run();
		}
	}

	setContext(context) {
		this.stx = context.stx;
		this.addDefaultMarkup();
		context.advertiseAs(this, "TechnicalInsights");
		this.initialize();
		CIQ.UI.activatePluginUI(this.stx, "technicalinsights");

		if (!context.config) return;

		const { config = {} } = context;
		const channel =
			(config.channels || {}).technicalinsights || "channel.technicalinsights";
		this.channelSubscribe(channel, (isActive) => {
			if (isActive) {
				this.removeAttribute("disabled");
				this.registerLookupDriver();
			} else this.setAttribute("disabled", "");
		});
	}

	initialize() {
		const self = this;
		const { stx, dom } = this;

		dom.shortterm = this.qs("cq-technicalinsights-shortterm-label");
		dom.oscillators = this.qs("cq-technicalinsights-oscillators-label");
		dom.indicators = this.qs("cq-technicalinsights-indicators-label");
		dom.classics = this.qs("cq-technicalinsights-classics-label");
		dom.instructions = this.qs("cq-technicalinsights-instructions");
		dom.eventselect = this.qs("cq-technicalinsights-event-select");
		dom.eventstitle = this.qs("cq-technicalinsights-eventtypes-title");
		dom.educationselect = this.qs("cq-technicalinsights-education-select");
		dom.srbarstext = this.qs("cq-technicalinsights-sr-bars");
		dom.showeducationtext = this.qs("cq-technicalinsights-education-title");
		dom.srselect = this.qs("cq-technicalinsights-sr-select");

		if (_css) {
			CIQ.addInternalStylesheet(_css, "technicalinsights/ui.css");
			uiLoaded();
		} else {
			CIQ.loadStylesheet(basePath + "ui.css", uiLoaded);
		}

		function uiLoaded(err) {
			if (err) return console.error(err);
			if (!self.hasAttribute("disabled")) self.adjustChartArea(offset);

			// add listeners for interactivity
			dom.eventselect.addEventListener("click", () => self.run());
			dom.educationselect.addEventListener("click", () => self.run());
			dom.srselect.addEventListener("change", () => self.run());

			const controller = new CIQ.TechnicalInsights(
				stx,
				self.getAttribute("uid"),
				self.getAttribute("lang") || "en" // default to English if lang not specified
			);

			self.controller = controller;
			self.registerLookupDriver();

			// load the educational materials from the JSON (async)
			loadEducationData(function (response) {
				// extract and save the lexicon for the language being used.
				controller.lexiconfile = response;
				controller.lexicon = controller.lexiconfile[controller.lang];

				// if an eventid is passed in, auto-enable the plugin
				controller.eventid = self.getAttribute("eid");
				if (controller.eventid) self.removeAttribute("disabled");

				// set text to chosen correct language
				dom.shortterm.innerHTML = controller.lexicon.shortterm;
				dom.oscillators.innerHTML = controller.lexicon.oscillators;
				dom.indicators.innerHTML = controller.lexicon.indicators;
				dom.classics.innerHTML = controller.lexicon.classics;
				dom.instructions.innerHTML = controller.lexicon.instructions;
				dom.eventstitle.innerHTML = controller.lexicon.eventstitle;
				dom.srbarstext.innerHTML = controller.lexicon.bars;
				dom.showeducationtext.innerHTML = controller.lexicon.showeducation;

				// set the 'None' text for the language in S/R dropdown.
				dom.srselect.children[2].children[0].innerHTML = controller.lexicon.none; // prettier-ignore

				controller.addListeners();
				self.initialized = true;
				self.run();
			});
		}

		function loadEducationData(loadedCallback) {
			if (_json) return loadedCallback(_json);
			CIQ.postAjax({
				url: basePath + "lexicon.json",
				cb: function (status, response) {
					if (status !== 200) throw new Error(response);
					else loadedCallback(JSON.parse(response));
				}
			});
		}
	}

	run() {
		if (!this.initialized || this.hasAttribute("disabled")) return;

		const { controller } = this;
		const { eventselect, educationselect, srselect } = this.dom;

		controller.activeEvents = {
			classic: eventselect.children[0].checked,
			shortterm: eventselect.children[2].checked,
			indicator: eventselect.children[4].checked,
			oscillator: eventselect.children[6].checked
		};

		controller.showEducation = educationselect.children[2].children[0].checked;
		controller.srterm = srselect.children[2].value;
		controller.showsr = controller.srterm === "none" ? false : true;

		controller.getActiveEvents();
	}

	/**
	 * Use this method to create/remove display space above the chart.
	 *
	 * @param {Number}
	 *            pixels pass a negative number to remove space or a positive
	 *            number to create space
	 * @example // move chart area down 38 pixels tcElement.adjustChartArea(38);
	 *
	 * @example // move chart area up 38 pixels tcElement.adjustChartArea(-38);
	 */
	adjustChartArea(pixels) {
		if (this.notifyChannel(pixels)) return; // Height change informed in channel

		let chartArea = document.querySelector(".ciq-chart-area");
		let top = parseInt(window.getComputedStyle(chartArea).top, 10);
		chartArea.style.top = top + pixels + "px";

		// force a resize event to correct the chart-area's height
		window.dispatchEvent(new Event("resize"));
	}

	/**
	 * Notify panel size change in channel
	 *
	 * @param {Number} pixelChange
	 */
	notifyChannel(pixelChange) {
		if (!this.context.config) return false;

		// Translate pixel change to panel height. If subscriber joins late
		// it needs the value as previous changes are will not be available
		this.panelHeight = (this.panelHeight || 0) + pixelChange;

		const { config = {} } = this.context;
		const channel =
			(config.channels || {}).pluginPanelHeight || "channel.pluginPanelHeight";
		this.channelMergeObject(channel, {
			technicalinsights: this.panelHeight
		});

		return true;
	}

	/**
	 * Registers the lookupExchange method on the TechnicalInsights controller. We do this because the exchange
	 * (exchDisp) field is not set under all circumstances but is required for the plugin. By registering the lookup
	 * driver to a controller method, it becomes possible for the controller to execute symbol lookups for any symbols
	 * that do not have an exchange set.
	 */
	registerLookupDriver() {
		const { controller } = this;
		if (!controller || this.lookupDriver) return;

		this.lookupDriver = new CIQ.ChartEngine.Driver.Lookup.ChartIQ();

		controller.lookupExchange = (symbol, cb) => {
			this.lookupDriver.acceptText(symbol, null, null, (results) => {
				const { data } =
					results.find(({ data } = {}) => data.symbol === symbol) || {};
				cb(data.exchDisp);
			});
		};
	}
}

TechnicalInsights.markup = `
	<cq-technicalinsights-details>
		<cq-technicalinsights-summary>
			<cq-technicalinsights-left>
				<cq-technicalinsights-instructions></cq-technicalinsights-instructions>
			</cq-technicalinsights-left>
			<cq-technicalinsights-middle>
				<cq-technicalinsights-eventtypes-title></cq-technicalinsights-eventtypes-title>
				<cq-technicalinsights-event-select>
					<input type="checkbox" value="classics" checked>
					<cq-technicalinsights-classics-label></cq-technicalinsights-classics-label>
					<input type="checkbox" value="short-term" checked>
					<cq-technicalinsights-shortterm-label></cq-technicalinsights-shortterm-label>
					<input type="checkbox" value="indicators" checked>
					<cq-technicalinsights-indicators-label></cq-technicalinsights-indicators-label>
					<input type="checkbox" value="oscillators" checked>
					<cq-technicalinsights-oscillators-label></cq-technicalinsights-oscillators-label>
				</cq-technicalinsights-event-select>
			</cq-technicalinsights-middle>
			<cq-technicalinsights-middle>
				<cq-technicalinsights-education-select>
					<cq-technicalinsights-education-title></cq-technicalinsights-education-title><br>
					<label class="ciq-technicalinsights-switch" name="education">
						<input type="checkbox" name="education" checked>
						<div class="ciq-technicalinsights-tciqslider ciq-technicalinsights-round"></div>
					</label>
				</cq-technicalinsights-education-select>
			</cq-technicalinsights-middle>
			<cq-technicalinsights-right>
				<cq-technicalinsights-sr-select>
					<cq-technicalinsights-sr-title></cq-technicalinsights-sr-title><br>
					<select name="srbars" class="ciq-technicalinsights-srbars">
						<option value="none">
							<cq-technicalinsights-none-label></cq-technicalinsights-none-label>
						</option>
						<option value="100" selected>100</option>
						<option value="250">250</option>
						<option value="500">500</option>
					</select>
					<cq-technicalinsights-sr-bars></cq-technicalinsights-sr-bars>
				</cq-technicalinsights-sr-select>
			</cq-technicalinsights-right>
		</cq-technicalinsights-summary>
	</cq-technicalinsights-details>
`;

customElements.define("cq-technicalinsights", TechnicalInsights);
