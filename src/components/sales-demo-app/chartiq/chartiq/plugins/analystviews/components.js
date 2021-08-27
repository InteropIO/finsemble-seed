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
	_json = require("./line-info.json");
	_css = require("./ui.css");
} else if (typeof define === "function" && define.amd) {
	define(["./line-info.json", "./ui.css"], function (m1, m2) {
		_json = m1;
		_css = m2;
	});
}

let AnalystViewsController; // loaded dynamically via XHR
const UI = CIQ.UI;

class BasicAnalystViewsDetails extends HTMLElement {
	static get observedAttributes() {
		return ["open"];
	}

	constructor() {
		super();
		var self = this;

		setTimeout(function () {
			self.innerHTML = BasicAnalystViewsDetails.markup;
			var summary = self.querySelector("cq-summary");
			summary.addEventListener("click", function () {
				if (self.hasAttribute("open")) {
					self.removeAttribute("open");
				} else {
					self.setAttribute("open", "open");
				}
			});
		});
	}

	attributeChangedCallback(name, oldVal, newVal) {
		// if the open attribute was added or removed
		if (
			name === "open" &&
			((oldVal === null && typeof newVal == "string") ||
				(newVal === null && typeof oldVal == "string"))
		) {
			this.dispatchEvent(new Event("toggle"));
		}
	}
}

BasicAnalystViewsDetails.markup = `
		<cq-summary>
			<cq-analystviews-left>
				<cq-analystviews-icon-chart></cq-analystviews-icon-chart>
				<cq-analystviews-symbol></cq-analystviews-symbol>
				<!-- previous place for active button Chris 7-14 -->
				<cq-analystviews-story>Select Technical Analysis Term</cq-analystviews-story>
				<cq-analystviews-age></cq-analystviews-age>
				<cq-analystviews-term-active></cq-analystviews-term-active>
				|
				<cq-analystviews-term-button value="Intraday">30M</cq-analystviews-term-button>
				<cq-analystviews-term-button value="ST">1D</cq-analystviews-term-button>
				<cq-analystviews-term-button value="MT">1W</cq-analystviews-term-button>
			</cq-analystviews-left>
			<cq-analystviews-right>
				<analystviews-brand>Trading Central&trade; Methodology</analystviews-brand>
			</cq-analystviews-right>
		</cq-summary>
		<cq-analystviews-left>
			<cq-analystviews-section>
				<cq-analystviews-title>Our Preference</cq-analystviews-title>
				<cq-analystviews-preference></cq-analystviews-preference>
			</cq-analystviews-section>
			<cq-analystviews-section>
				<cq-analystviews-title>Alternative</cq-analystviews-title>
				<cq-analystviews-alternative></cq-analystviews-alternative>
			</cq-analystviews-section>
			<cq-analystviews-section>
				<cq-analystviews-title>Comments</cq-analystviews-title>
				<cq-analystviews-comments></cq-analystviews-comments>
				<cq-analystviews-indicator-toggle>Show Indicators</cq-analystviews-indicator-toggle>
			</cq-analystviews-section>
		</cq-analystviews-left>
		<cq-analystviews-right>
			<analystviews-method>
				Our team of technical analysts use a chartist approach to assess directional moves and price targets.
				Find out more <a href="//tradingcentral.com">about our methodology</a>.
			</analystviews-method>
		</cq-analystviews-right>
	`;

/**
 * AnalystViews tag to create a box around an analysis line when the mouse enters this element.
 *
 * @private
 */
class CqAnalystViewsNumber extends UI.ContextTag {
	constructor() {
		super();
	}

	connectedCallback() {
		if (this.attached) return;
		super.connectedCallback();
	}

	get number() {
		return this.textContent.trim();
	}

	set number(newVal) {
		this.textContent = newVal;
	}

	initialize() {
		var self = this;

		this.addEventListener("mouseenter", function () {
			var node = document.createElement("cq-analystviews-number-line-selector");

			node.innerHTML = "&nbsp;";

			new CIQ.Marker({
				stx: self.context.stx,
				node: node,
				yPositioner: "value",
				y: self.number,
				xPositioner: "none",
				label: "cq-analystviews-number-line-selector"
			});

			self.context.stx.draw();
		});

		this.addEventListener("mouseleave", function () {
			CIQ.Marker.removeByLabel(
				self.context.stx,
				"cq-analystviews-number-line-selector"
			);
		});
	}

	setContext(context) {
		context.advertiseAs(this, "CqAnalystViewsNumber");
		this.initialize();
	}
}

/**
 * Tag that inserts the Analyst Views plug-in above a chart.
 *
 * @example
 * <cq-analystviews partner="000" token="Mk4r34"></cq-analystviews>
 *
 * @namespace WebComponents.cq-analystviews
 */
class AnalystViews extends UI.ContextTag {
	static get observedAttributes() {
		return ["disabled"];
	}

	constructor() {
		super();
	}

	connectedCallback() {
		if (this.attached) return;
		super.connectedCallback();
	}

	attributeChangedCallback(name, oldVal, newVal) {
		if (name !== "disabled") return;
		if (typeof this.context === "undefined") return; // Avoid throwing errors when we initialize

		var offset =
			38 + (this.querySelector("cq-analystviews-details[open]") ? 76 : 0);

		// disabled attribute added
		if (oldVal === null && typeof newVal == "string") {
			if (this.context.events) {
				if (this.context.events.layout)
					this.context.stx.removeEventListener(this.context.events.layout);
				if (this.context.events.symbolChange)
					this.context.stx.removeEventListener(
						this.context.events.symbolChange
					);
			}
			if (this.context.updateAgeTimer)
				clearInterval(this.context.updateAgeTimer);

			this.context.events = null;
			this.context.updateAgeTimer = null;
			this.context.controller.removeInjections();
			this.adjustChartArea(offset * -1);
		}

		// disabled attribute removed
		if (newVal === null && typeof oldVal == "string") {
			this.adjustChartArea(offset);
			this.run();
		}
	}

	/**
	 * Use this method to create/remove display space above the chart.
	 *
	 * @param {Number} pixels pass a negative number to remove space or a positive number to create space
	 * @example
	 * // move chart area down 38 pixels
	 * tcElement.adjustChartArea(38);
	 *
	 * @example
	 * // move chart area up 38 pixels
	 * tcElement.adjustChartArea(-38);
	 */
	adjustChartArea(pixels) {
		if (this.notifyChannel(pixels)) return; // Height change informed in channel

		var chartArea = document.querySelector(".ciq-chart-area");
		var top = parseInt(window.getComputedStyle(chartArea).top, 10);

		chartArea.style.top = top + pixels + "px";

		// force a resize event to correct the chart-area's height
		window.dispatchEvent(new Event("resize"));
	}

	notifyChannel(pixelChange) {
		if (!this.context.config) return false;

		// Translate pixel change to panel height.If subscriber joins late
		// it needs the value as previous changes are will not be available
		this.panelHeight = (this.panelHeight || 0) + pixelChange;

		const { config = {} } = this.context;
		const channel =
			(config.channels || {}).pluginPanelHeight || "channel.pluginPanelHeight";
		this.channelMergeObject(channel, {
			tc: this.panelHeight
		});
		return true;
	}

	initialize() {
		var self = this;
		var basePath = CIQ.ChartEngine.pluginBasePath + "analystviews/";

		var lineInfoDone = function (err) {
			if (err) return console.error(err);
			return self.lineHoverListen();
		};

		if (_css) {
			CIQ.addInternalStylesheet(_css, "analystviews/ui.css");
			uiLoaded();
		} else {
			CIQ.loadStylesheet(basePath + "ui.css", uiLoaded);
		}

		function uiLoaded(err) {
			if (err) return;

			var details = document.querySelector("cq-analystviews-details");
			if (details) {
				details.remove();
			} else {
				details = document.createElement("cq-analystviews-details");
			}

			details.addEventListener("toggle", function () {
				var offset = 76;

				self.adjustChartArea(this.hasAttribute("open") ? offset : offset * -1);
			});

			self.appendChild(details);

			if (!self.hasAttribute("disabled")) {
				self.adjustChartArea(38 + (details.hasAttribute("open") ? 76 : 0));
			}

			AnalystViewsController = CIQ.AnalystViews;
			self.context.controller = new AnalystViewsController(
				self.context.stx,
				self.getAttribute("token"),
				self.getAttribute("partner")
			);
			self.run();
		}

		if (_json) {
			self.context.buildText = _json;
			self.lineHoverListen();
		} else {
			CIQ.postAjax({
				url: basePath + "line-info.json",
				cb: function (status, response, headers) {
					if (status != 200)
						return lineInfoDone(response || "unknown server error");

					try {
						self.context.buildText = JSON.parse(response);
					} catch (e) {
						return lineInfoDone(e);
					}

					lineInfoDone(null);
				}
			});
		}
	}

	lineHoverListen() {
		var buildText = this.context.buildText;
		var stxx = this.context.stx;

		this.addEventListener("linehoverbegin", function (hover) {
			var newNode = CIQ.UI.makeFromTemplate(
				"template[analystviews-line-info-tmpl]"
			)[0];
			var parts = buildText[hover.detail.line];

			newNode.className = hover.detail.line;
			newNode.appendChild(
				document.createTextNode(
					parts.description + parts.trend[hover.detail.trend]
				)
			);

			new CIQ.Marker({
				stx: stxx,
				node: newNode,
				yPositioner: "value",
				y: hover.detail.price,
				xPositioner: "none",
				label: "analystviews-line-info-" + hover.detail.line
			});

			stxx.draw();
		});

		this.addEventListener("linehoverend", function (hover) {
			CIQ.Marker.removeByLabel(
				stxx,
				"analystviews-line-info-" + hover.detail.line
			);
		});
	}

	run() {
		if (this.hasAttribute("disabled")) return;

		this.context.events = {};
		this.context.updateAgeTimer = null;

		var controller = this.context.controller;
		var selfNode = this;
		var dom = {
			symbol: this.querySelector("cq-analystviews-symbol"),
			story: this.querySelector("cq-analystviews-story"),
			age: this.querySelector("cq-analystviews-age"),
			preference: this.querySelector("cq-analystviews-preference"),
			alternative: this.querySelector("cq-analystviews-alternative"),
			comments: this.querySelector("cq-analystviews-comments"),
			indicatorToggle: this.querySelector("cq-analystviews-indicator-toggle"),
			activeTerm: this.querySelector("cq-analystviews-term-active"),
			termButtons: {
				Intraday: this.querySelector(
					'cq-analystviews-term-button[value="Intraday"]'
				),
				ST: this.querySelector('cq-analystviews-term-button[value="ST"]'),
				MT: this.querySelector('cq-analystviews-term-button[value="MT"]')
			}
		};
		var goBackButton;
		var numberRE = /[0-9]+\.?[0-9]*/g;
		var appendSubsection = function (element, subsection) {
			element.innerHTML = "";
			subsection.paragraphs
				.map(function (fulltext) {
					var p = document.createElement("p");
					var text = fulltext.split(numberRE);
					var number = fulltext.match(numberRE);
					var nElement;
					var i = 0;
					for (; number && i < number.length; ++i) {
						nElement = document.createElement("cq-analystviews-number");
						nElement.innerHTML = number[i];

						p.appendChild(document.createTextNode(text[i]));
						p.appendChild(nElement);
					}
					p.appendChild(document.createTextNode(text[i]));
					return p;
				})
				.forEach(function (p) {
					element.appendChild(p);
				});
		};
		var buttonSelected = false;
		var changingTerm = false;
		var currentTerm = controller.getCurrentTerm();
		var loader = this.context.loader;
		var changeTerm = function (info) {
			info.stopPropagation();

			// The selected button just needs to stop propagation
			if (this.hasAttribute("selected")) return;
			if (loader) loader.show();

			changingTerm = true;

			var term = this.getAttribute("value");

			if (buttonSelected) {
				for (var k in dom.termButtons) {
					if (dom.termButtons[k].hasAttribute("selected")) {
						dom.termButtons[k].removeAttribute("selected");
						break;
					}
				}
			}

			dom.termButtons[term].setAttribute("selected", "selected");
			buttonSelected = true;

			updateAnalysis({ symbolObject: controller.stx.chart.symbolObject }, term);

			controller.stx.setPeriodicity(1, controller.interval[term], function () {
				var parent = dom.activeTerm.parentNode;
				var moveChild = dom.activeTerm.childNodes[0];

				if (moveChild) parent.appendChild(moveChild);

				dom.activeTerm.innerHTML = "";
				dom.activeTerm.appendChild(dom.termButtons[term]);

				if (goBackButton) {
					goBackButton.remove();
					goBackButton = null;
				}

				if (loader) loader.hide();

				changingTerm = false;
				currentTerm = term;
			});
		};

		dom.termButtons.Intraday.addEventListener("click", changeTerm);
		dom.termButtons.ST.addEventListener("click", changeTerm);
		dom.termButtons.MT.addEventListener("click", changeTerm);

		if (currentTerm) {
			dom.termButtons[currentTerm].setAttribute("selected", "selected");
			buttonSelected = true;
			dom.activeTerm.appendChild(dom.termButtons[currentTerm]);
		}

		this.context.events.layout = controller.stx.addEventListener(
			"layout",
			function () {
				if (changingTerm || !currentTerm) return;
				if (!dom.termButtons[currentTerm].hasAttribute("selected")) return;
				if (currentTerm === controller.getCurrentTerm()) return;

				dom.termButtons[currentTerm].removeAttribute("selected");
				buttonSelected = false;

				var node = document.createElement("cq-analystviews-term-button");
				node.setAttribute("cq-marker", "cq-marker");
				node.setAttribute(
					"value",
					dom.termButtons[currentTerm].getAttribute("value")
				);
				node.appendChild(
					document.createTextNode(
						"Go back to " + dom.termButtons[currentTerm].textContent
					)
				);
				node.addEventListener("click", changeTerm);
				node.addEventListener("click", function () {
					this.setAttribute("selected", "selected");
				});

				goBackButton = new CIQ.Marker({
					stx: controller.stx,
					node: node,
					xPositioner: "none",
					yPositioner: "none"
				});
			}
		);

		if (dom.indicatorToggle) {
			dom.indicatorToggle.addEventListener("click", function () {
				if (controller.displayingIndicators) {
					this.innerHTML = "Show Indicators";
					controller.hideIndicators();
				} else {
					this.innerHTML = "Hide Indicators";
					controller.showIndicators();
				}
			});
		}

		this.context.events.symbolChange = controller.stx.addEventListener(
			"symbolChange",
			updateAnalysis
		);
		updateAnalysis({ symbolObject: controller.stx.chart.symbolObject });

		function updateAnalysis(info, term) {
			if (info.action && info.action !== "master") return;
			if (!term) term = currentTerm;
			if (!term) return;
			if (selfNode.context.updateAgeTimer) {
				clearInterval(selfNode.context.updateAgeTimer);
				selfNode.context.updateAgeTimer = null;
			}
			let isForex = CIQ.Market.Symbology.isForexSymbol(
				controller.stx.chart.symbol
			);
			controller.analysis(
				{
					type_product: isForex ? "forex" : null,
					product: info.symbolObject.symbol.replace(/^\^/, ""),
					term: term
				},
				function (error, xmlDocument) {
					if (error) {
						controller.removeInjections();

						dom.symbol.innerHTML = "";
						dom.story.innerHTML = "No TA Found";
						dom.story.className = "";
						dom.age.innerHTML = "";
						dom.preference.innerHTML = "";
						dom.alternative.innerHTML = "";
						dom.comments.innerHTML = "";

						console.error(error);
						return;
					}

					var fields = AnalystViewsController.parse(xmlDocument);

					controller.removeInjections();

					dom.symbol.innerHTML = info.symbolObject.symbol;

					dom.story.innerHTML = "";
					var img = document.createElement("span");
					img.className =
						"analystviews-arrow " +
						fields.header.directionName +
						"-" +
						Math.abs(fields.header.directionArrow);
					dom.story.appendChild(img);
					dom.story.appendChild(
						document.createTextNode(" " + fields.story.title)
					);
					dom.story.className = fields.header.directionName;

					dom.age.innerHTML = fields.header.$age;
					selfNode.context.updateAgeTimer = setInterval(function () {
						dom.age.innerHTML = fields.header.$age;
					}, 25000 /*25 seconds*/);

					appendSubsection(dom.preference, fields.story.subsections[1]);
					appendSubsection(dom.alternative, fields.story.subsections[2]);
					appendSubsection(dom.comments, fields.story.subsections[3]);

					controller.createDrawInjections(
						fields.header.option.chartlevels,
						fields.header.directionArrow
					);
					controller.createMouseInjections(
						fields.header.option.chartlevels,
						fields.header.directionName,
						selfNode
					);
				}
			);
		}
	}

	setContext(context) {
		this.addDefaultMarkup();
		context.advertiseAs(this, "AnalystViews");
		this.initialize();

		// Backwards compatibility in case `cq-tradingcentral tagname is still being used
		const pluginName =
			this.tagName === "CQ-ANALYSTVIEWS" ? "analystviews" : "tc";
		const { config = {} } = context;

		const channel =
			(config.channels || {})[pluginName] || `channel.${pluginName}`;
		this.channelSubscribe(channel, (isActive) => {
			if (isActive) this.removeAttribute("disabled");
			else this.setAttribute("disabled", "");
		});

		CIQ.UI.activatePluginUI(this.stx, "tc");
		CIQ.UI.activatePluginUI(this.stx, "analystviews");
	}
}

AnalystViews.markup = `
		<div class="analystviews-line-info">
			<template analystviews-line-info-tmpl>
			<analystviews-line-info></analystviews-line-info>
			</template>
		</div>
	`;

customElements.define("cq-analystviews", AnalystViews);
customElements.define("cq-analystviews-details", BasicAnalystViewsDetails);
customElements.define("cq-analystviews-number", CqAnalystViewsNumber);

// Backwards compatibility in case `cq-tradingcentral tagname is still being used
class TradingCentral extends AnalystViews {}
customElements.define("cq-tradingcentral", TradingCentral);
