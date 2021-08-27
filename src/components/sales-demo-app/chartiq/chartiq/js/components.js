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


import {CIQ} from "../js/componentUI.js";


let __js_webcomponents_abstractMarker_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * The abstract marker web component `<cq-abstract-marker>`.
 *
 * An encapsulation of a complex marker which can contain HTML, video, images, CSS, and
 * animations.
 *
 * The component can be extended with additional markup types specified as values of the
 * `cq-type` attribute.
 *
 * @namespace WebComponents.cq-abstract-marker
 * @since 7.5.0
 *
 * @example
 * <caption>Abstract markers can be anything you want them to be &mdash; even a helicopter!</caption>
 * <div class="stx-marker-templates" style="left: -1000px; visibility:hidden;">
 *     <div class="abstract">
 *         <div class="stx-marker abstract">
 *             <div class="stx-marker-content">
 *                 <div class="sample">
 *                     <div stage>
 *                         <div helicopter>
 *                             <div propeller style="height: 160px;">
 *                                 <div spinner style="-webkit-transform-origin: 40px 0 0; transform-origin: 40px 0 0;">
 *                                     <div style="-webkit-transform: rotateY(0deg) translateX(40px);
 *                                                 transform: rotateY(0deg) translateX(40px);"></div>
 *                                     <div style="-webkit-transform: rotateY(-90deg) translateX(40px);
 *                                                 transform: rotateY(-90deg) translateX(40px);"></div>
 *                                     <div style="-webkit-transform: rotateY(-180deg) translateX(40px);
 *                                                 transform: rotateY(-180deg) translateX(40px);"></div>
 *                                     <div style="-webkit-transform: rotateY(-270deg) translateX(40px);
 *                                                 transform: rotateY(-270deg) translateX(40px);"></div>
 *                                 </div>
 *                             </div>
 *                             <div heli-body></div>
 *                         </div>
 *                     </div>
 *                     <div class="text">This is an example of a complex marker which can contain HTML, video, images, CSS, and animations.</div>
 *                 </div>
 *             </div>
 *         </div>
 *     </div>
 * </div>
 */
class AbstractMarker extends CIQ.UI.BaseComponent {
	/**
	 * Obtains the type of markup for the component. Called when the tag is instantiated.
	 *
	 * @alias connectedCallback
	 * @memberof WebComponents.cq-abstract-marker
	 * @private
	 * @since 7.5.0
	 */
	connectedCallback() {
		this.type = this.getAttribute("cq-type") || "helicopter";
		this.init();
	}

	/**
	 * Initializes the component.
	 *
	 * @alias init
	 * @memberof WebComponents.cq-abstract-marker
	 * @since 7.5.0
	 */
	init() {
		if (this.attached) return;
		const { markups } = this.constructor;
		this.addDefaultMarkup(this, markups[this.type]);
	}
}

AbstractMarker.markups = {
	helicopter: `
		<div class="stx-marker-templates" style="left: -1000px; visibility:hidden;">
			<!-- Abstract Markers. You can remove this unless you actually need a helicopter. Seriously though, markers can be anything you want them to be! -->
			<div class="abstract">
				<div class="stx-marker abstract">
					<div class="stx-marker-content">
						<div class="sample">
							<div stage>
								<div helicopter>
									<div propeller style="height: 160px;">
										<div spinner style="-webkit-transform-origin: 40px 0 0; transform-origin: 40px 0 0;">
											<div style="-webkit-transform: rotateY(0deg) translateX(40px); transform: rotateY(0deg) translateX(40px);"></div>
											<div style="-webkit-transform: rotateY(-90deg) translateX(40px); transform: rotateY(-90deg) translateX(40px);"></div>
											<div style="-webkit-transform: rotateY(-180deg) translateX(40px); transform: rotateY(-180deg) translateX(40px);"></div>
											<div style="-webkit-transform: rotateY(-270deg) translateX(40px); transform: rotateY(-270deg) translateX(40px);"></div>
										</div>
									</div>
									<div heli-body></div>
								</div>
							</div>
							<div class="text">This is an example of a complex marker which can contain html, video, images, css, and animations.</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		`
};
CIQ.UI.addComponentDefinition("cq-abstract-marker", AbstractMarker);

};


let __js_webcomponents_advertisement_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */


var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

if (!CIQ.Marker) {
	console.error(
		"advertisement component requires first activating markers feature."
	);
} else {
	/**
	 * Advertisement web component `<cq-advertisement>`.
	 *
	 * Displays an advertisement banner as a "marker" (inside the chart, use CSS to position absolutely against the chart panel).
	 * The advertisement should contain content that can be enabled by calling {@link CIQ.UI.Advertisement#show} based on your
	 * business logic.
	 *
	 * The advertisement will automatically adjust the height to accommodate the content (assuming overflow-y: auto)
	 * @namespace WebComponents.cq-advertisement
	 * @example
		<cq-advertisement style="display: block; height: 106px;">
		    <cq-close class="ciq-tight"></cq-close>
			<div class="sample ciq-show">
				<div cq-desktop="">
					<div><translate original="$1 Trades">$1 Trades</translate></div>
					<div><translate original="Use code ">Use code </translate><strong><translate original="Sample">Sample</translate></strong></div>
					<a target="_blank" href="https://yourURL?codeSample&desktop"><translate original="Click to learn more">Click to learn more</translate></a>
				</div>
				<div cq-phone="">
					<div><translate original="$1 Trades">$1 Trades</translate></div>
					<a target="_blank" href="https://yourURL?codeSample&mobile"><translate original="Click to learn more">Click to learn more</translate></a>
				</div>
			</div>
		</cq-advertisement>
	 *
	 */
	class Advertisement extends CIQ.UI.ModalTag {
		constructor() {
			super();
		}

		/**
		 * Hides the advertisement and suppresses it for 24 hours by storing it in local storage.
		 * If the selector itself changes however then the ad will reappear.
		 * @memberof WebComponents.cq-advertisement
		 */
		close() {
			this.node.css({ display: "none" });
			var self = this;
			this.nameValueStore.get("cq-advertisement", function (err, ls) {
				if (err) return;
				var future = new Date();
				if (!self.sleepAmount) self.sleepAmount = { units: 1, unitType: "day" };
				var u = self.sleepAmount.units;
				var ut = self.sleepAmount.unitType;
				if (ut == "minute") future.setMinutes(future.getMinutes() + u);
				else if (ut == "hour") future.setHours(future.getHours() + u);
				else if (ut == "day") future.setDate(future.getDate() + u);
				else if (ut == "week") future.setDate(future.getDate() + u * 7);
				else if (ut == "month") future.setMonth(future.getMonth() + u);
				var ms = future.getTime();
				if (!ls || typeof ls != "object") ls = {};
				ls[self.selector] = ms;
				self.nameValueStore.set("cq-advertisement", ls);
			});
		}

		makeMarker() {
			if (this.markerExists) return;
			new CIQ.Marker({
				stx: this.context.stx,
				xPositioner: "none",
				label: "advertisement",
				permanent: true,
				node: this.node[0]
			});
			this.markerExists = true;
		}

		setContext(context) {
			const {
				config: { nameValueStore }
			} = context;
			this.setNameValueStore(nameValueStore);
		}

		setNameValueStore(nameValueStore) {
			if (!nameValueStore && CIQ.NameValueStore)
				nameValueStore = CIQ.NameValueStore;

			this.nameValueStore = nameValueStore
				? new nameValueStore()
				: {
						get: function () {},
						set: function () {}
				  };
		}

		/**
		 * Sets the sleep time for this amount of time before re-displaying
		 * @param  {Number} units    Units
		 * @param  {string} unitType Unit type. Value values "minute","hour","day","week"
		 * @memberof WebComponents.cq-advertisement
		 */
		setSleepAmount(units, unitType) {
			this.sleepAmount = {
				units: units,
				unitType: unitType
			};
		}

		/**
		 * Show the advertisement. This should be a div inside of the web component.
		 * @param  {Selector} [selector]    A selector. If none specified then the first div will be selected.
		 * @param  {Boolean} [ignoreSleep=false] If true then ignore sleep
		 * @member! CIQ.UI.Advertisement
		 */
		show(selector, ignoreSleep = false) {
			if (this.selector) {
				var priorContent = this.node.find(this.selector);
				priorContent.removeClass("ciq-show");
			}
			this.selector = selector;
			if (!this.selector) {
				var div = this.node.find("div:first-of-type");
				this.selector = "." + div.attr("class");
			}
			this.ignoreSleep = ignoreSleep;
			var self = this;
			function doIt() {
				self.makeMarker();
				self.node.css({ display: "block" });
				var content = self.node.find(self.selector);
				content.addClass("ciq-show");

				// resize content
				self.node.css({ height: "0px" });
				setTimeout(function () {
					self.node.css({ height: self.node[0].scrollHeight + "px" });
				}, 0);
			}
			if (!ignoreSleep) {
				this.nameValueStore.get("cq-advertisement", function (err, ls) {
					if (err) return;
					if (!ls || typeof ls != "object") ls = {};
					var ms = ls[self.selector];
					if (ms && ms > Date.now()) return; // still surpressed
					doIt();
				});
			} else {
				doIt();
			}
		}

		/**
		 * Call this to force the advertisement to monitor the nameValueStore for updates. It will do this by
		 * polling. This is useful when running in multiple windows, do that if the advertisement is closed in one
		 * window then it will automatically close in the other windows.
		 * @param {Number} [ms=1000] Number of milliseconds to poll.
		 * @memberof WebComponents.cq-advertisement
		 */
		watchForRemoteClose(ms) {
			if (!ms) ms = 1000;
			var self = this;
			setInterval(function () {
				if (self.node.css("display") == "none") return; // already closed, do nothing
				self.nameValueStore.get("cq-advertisement", function (err, ls) {
					if (err) return;
					if (!ls || typeof ls != "object") ls = {};
					var ms = ls[self.selector];
					if (ms && ms > Date.now()) self.close();
				});
			}, ms);
		}
	}

	CIQ.UI.addComponentDefinition("cq-advertisement", Advertisement);
}

};


let __js_webcomponents_aggregationDialog_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */



var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Aggregation Dialog web component `<cq-aggregation-dialog>`.
 *
 * @namespace WebComponents.cq-aggregation-dialog
 */
class AggregationDialog extends CIQ.UI.DialogContentTag {
	/**
	 * Opens the nearest {@link WebComponents.cq-dialog} to display your dialog.
	 * @alias open
	 * @memberof WebComponents.cq-aggregation-dialog
	 */
	open(params) {
		this.addDefaultMarkup();
		super.open(params);
		var stx = this.context.stx;
		var aggregationType = params.aggregationType;
		var map = {
			kagi: {
				title: "Set Reversal Percentage"
			},
			renko: {
				title: "Set Brick Size"
			},
			linebreak: {
				title: "Set Price Lines"
			},
			rangebars: {
				title: "Set Range"
			},
			pandf: {
				title: "Set Point & Figure Parameters"
			}
		};
		if (stx.layout.aggregationType != aggregationType)
			stx.setAggregationType(aggregationType);

		var entry = map[aggregationType];
		var node = this.node;
		node.find(".title").text(stx.translateIf(entry.title));

		for (var type in map) {
			node
				.find(".ciq" + type)
				.css(aggregationType === type ? { display: "" } : { display: "none" });
		}
		node.find(".ciq" + aggregationType + " input").each(function () {
			var name = this.name;
			if (name == "box" || name == "reversal") name = "pandf." + name;
			var tuple = CIQ.deriveFromObjectChain(stx.layout, name);
			if (tuple && (tuple.obj[tuple.member] || tuple.obj[tuple.member] === 0)) {
				this.value = tuple.obj[tuple.member];
			} else if (stx.chart.defaultChartStyleConfig[this.name]) {
				this.value = stx.chart.defaultChartStyleConfig[this.name];
			}
		});
	}
}

AggregationDialog.markup = `
		<h4 class="title"></h4>
		<cq-close></cq-close>
		<div style="text-align:center;margin-top:10px;">
			<div class="ciqkagi">
				<i>Enter value and hit "Enter"</i>
				<p>
					<input name="kagi" stxtap="Layout.setAggregationEdit('kagi')">
				</p>
			</div>
			<div class="ciqrenko">
				<i>Enter value and hit "Enter"</i>
				<p>
					<input name="renko" stxtap="Layout.setAggregationEdit('renko')">
				</p>
			</div>
			<div class="ciqlinebreak">
				<i>Enter value and hit "Enter"</i>
				<p>
					<input name="priceLines" stxtap="Layout.setAggregationEdit('priceLines')">
				</p>
			</div>
			<div class="ciqrangebars">
				<i>Enter value and hit "Enter"</i>
				<p>
					<input name="range" stxtap="Layout.setAggregationEdit('rangebars')">
				</p>
			</div>
			<div class="ciqpandf">
				<i>Enter box size and hit "Enter"</i>
				<p>
					<input name="box" stxtap="Layout.setAggregationEdit('pandf.box')">
				</p>
				<p>
					<i>Enter reversal and hit "Enter"</i>
				</p>
				<p>
					<input name="reversal" stxtap="Layout.setAggregationEdit('pandf.reversal')">
				</p>
			</div>
			<p>or</p>
			<div class="ciq-btn" stxtap="Layout.setAggregationEdit('auto')">Auto Select</div>
		</div>

	`;
CIQ.UI.addComponentDefinition("cq-aggregation-dialog", AggregationDialog);

};


let __js_webcomponents_attribution_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */


var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

if (!CIQ.Marker) {
	console.error(
		"attribution component requires first activating markers feature."
	);
} else {
	/**
	 * Attribution web component `<cq-attribution>`.
	 *
	 * This will put a node inside a panel to attribute the data.
	 * Both the main chart panel (for quotes) and a study panel can use an attribution.
	 *
	 * @namespace WebComponents.cq-attribution
	 * @since 2016-07-16
	 * @example
	 * <cq-attribution>
	 * 	<template>
	 * 		<cq-attrib-container>
	 * 			<cq-attrib-source></cq-attrib-source>
	 * 			<cq-attrib-quote-type></cq-attrib-quote-type>
	 * 		</cq-attrib-container>
	 * 	</template>
	 * </cq-attribution>
	 */
	class Attribution extends CIQ.UI.ModalTag {
		constructor() {
			super();
			/**
			 * Contains the attribution messages.
			 *
			 * Override or augment the following properties of the `messages` object:
			 * - `sources` &mdash; An object that contains properties whose values populate
			 *   `<cq-attrib-source>`.
			 * - `exchanges` &mdash; An object that contains properties whose values populate
			 *   `<cq-attrib-quote-type>`.
			 *
			 * For quotes, the source should match the quote source. For studies, the source should
			 * match the study type. If there is no matching source property, the associated
			 * component has no text.
			 *
			 * @type {object}
			 * @alias messages
			 * @memberof WebComponents.cq-attribution#
			 */
			this.messages = {
				sources: {
					simulator: "Simulated data.",
					demo: "Demo data.",
					xignite:
						'<a target="_blank" href="https://www.xignite.com">Market Data</a> by Xignite.',
					fis_mm:
						'<a target="_blank" href="https://www.fisglobal.com/">Market Data</a> by FIS MarketMap.',
					Twiggs:
						'Twiggs MF Formula courtesy <a target="_blank" href="https://www.incrediblecharts.com/indicators/twiggs_money_flow.php">IncredibleCharts</a>.'
				},
				exchanges: {
					RANDOM: "Data is randomized.",
					"REAL-TIME": "Data is real-time.",
					DELAYED: "Data delayed 15 min.",
					RATES: "Yield data latest from source, bid/ask simulated.",
					BATS: "BATS BZX real-time.",
					EOD: "End of day data."
				}
			};
		}

		insert(stx, panel) {
			if (!CIQ.Marker) return;
			var attrib = CIQ.UI.makeFromTemplate(this.template);
			attrib.marker = new CIQ.Marker({
				stx: stx,
				node: attrib[0],
				xPositioner: "none",
				yPositioner: "none",
				label: "component",
				panelName: panel,
				permanent: true
			});
			return attrib;
		}

		setContext(context) {
			this.addDefaultMarkup();
			this.template = this.node.find("template");
			this.marker = this.insert(context.stx, "chart");
			var self = this;
			this.addInjection("append", "createDataSet", function () {
				return self.displayAttribution(this);
			});
			this.displayAttribution();
		}

		/**
		 * Displays an attribution on the chart. Attributions are messages about the chart data
		 * source.
		 *
		 * Called automatically whenever the data set is modified, but may also be called on
		 * demand.
		 *
		 * @param {CIQ.ChartEngine} [stx] The chart engine for which the attribution is displayed.
		 * 		Defaults to the chart engine contained in the context.
		 *
		 * @alias displayAttribution
		 * @memberof WebComponents.cq-attribution#
		 * @since 8.3.0
		 */
		displayAttribution(stx) {
			if (!stx) stx = this.context.stx;
			var chart = stx.chart;
			var layout = stx.layout;
			var chartAttrib = this.marker;
			var source, exchange;
			if (chart.attribution) {
				source = this.messages.sources[chart.attribution.source];
				exchange = this.messages.exchanges[chart.attribution.exchange];
				if (!source) source = "";
				if (!exchange) exchange = "";
				if (source + exchange != chartAttrib.attr("lastAttrib")) {
					chartAttrib.find("cq-attrib-source").html(source);
					chartAttrib.find("cq-attrib-quote-type").html(exchange);
					if (CIQ.I18N && CIQ.I18N.localized)
						CIQ.I18N.translateUI(null, chartAttrib[0]);
					chartAttrib.attr("lastAttrib", source + exchange);
				}
			}
			for (var study in layout.studies) {
				var sd = layout.studies[study];
				var type = sd.type;
				if (this.messages.sources[type]) {
					if (sd.attribution) {
						if (sd.attribution.marker.params.panelName == sd.panel) continue; // already have an attribution
					}
					source = this.messages.sources[type] || "";
					exchange = this.messages.exchanges[type] || "";
					var attrib = this.insert(stx, sd.panel);
					attrib.find("cq-attrib-source").html(source);
					attrib.find("cq-attrib-quote-type").html(exchange);
					if (CIQ.I18N && CIQ.I18N.localized)
						CIQ.I18N.translateUI(null, attrib[0]);
					sd.attribution = attrib;
				}
			}
		}
	}

	Attribution.markup = `
		<template>
			<cq-attrib-container>
				<cq-attrib-source></cq-attrib-source>&nbsp;
				<cq-attrib-quote-type></cq-attrib-quote-type>
			</cq-attrib-container>
		</template>
	`;
	CIQ.UI.addComponentDefinition("cq-attribution", Attribution);
}

};


let __js_webcomponents_chartLegend_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */




var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * The chart legend web component `<cq-chart-legend>`.
 *
 * An encapsulation of the markup for the chart (or study) legend.
 *
 * Use the `cq-marker` attribute to ensure that the legend floats inside the chart. Set the
 * optional `cq-panel-only` attribute so that only studies from the panel containing the
 * legend are displayed. Set the optional `cq-clone-to-panels` attribute to create a legend
 * on each panel.
 *
 * The legend shows both studies and comparisons, so the `cq-content-keys` attribute should
 * include `cq-label` for studies and `cq-comparison-label` for comparisons.
 *
 * @namespace WebComponents.cq-chart-legend
 * @since 7.5.0
 *
 * @example
 * <cq-study-legend cq-chart-legend cq-marker-label="Plots" cq-clone-to-panels="Plots" cq-panel-only cq-marker cq-hovershow
 *     cq-content-keys="cq-label,cq-comparison-label">
 *     <cq-comparison>
 *         <cq-comparison-key cq-panel-only cq-all-series>
 *             <template cq-comparison-item>
 *                 <cq-comparison-item>
 *                     <cq-swatch cq-overrides="auto"></cq-swatch>
 *                     <cq-comparison-label>AAPL</cq-comparison-label>
 *                     <!-- cq-comparison-price displays the current price with color animation -->
 *                     <cq-comparison-price cq-animate></cq-comparison-price>
 *                     <!-- cq-comparison-tick-price displays the price for the active crosshair item -->
 *                     <!-- <cq-comparison-tick-price></cq-comparison-tick-price>    -->
 *                     <cq-comparison-loader></cq-comparison-loader>
 *                     <div class="stx-btn-ico ciq-close"></div>
 *                 </cq-comparison-item>
 *             </template>
 *         </cq-comparison-key>
 *     </cq-comparison>
 *     <template cq-study-legend>
 *         <cq-item>
 *             <cq-label></cq-label>
 *             <span class="ciq-edit"></span>
 *             <div class="ciq-icon ciq-close"></div>
 *         </cq-item>
 *     </template>
 * </cq-study-legend>
 */
class ChartLegend extends CIQ.UI.ContextTag {
	/**
	 * Adds the default markup.
	 *
	 * @alias setContext
	 * @memberof WebComponents.cq-chart-legend
	 * @since 7.5.0
	 */
	setContext() {
		if (this.contextSet) return;
		this.contextSet = true;
		this.addDefaultMarkup();
	}
}

ChartLegend.markup = `
		<cq-study-legend cq-chart-legend cq-marker-label="Plots" cq-clone-to-panels="Plots" cq-panel-only cq-marker cq-hovershow cq-content-keys="cq-label,cq-comparison-label">
			<cq-comparison>
				<cq-comparison-key cq-panel-only cq-all-series>
					<template cq-comparison-item>
						<cq-comparison-item>
							<cq-swatch cq-overrides="auto"></cq-swatch>
							<cq-comparison-label>AAPL</cq-comparison-label>
							<!-- cq-comparison-price displays the current price with color animation -->
							<cq-comparison-price cq-animate></cq-comparison-price>
							<!-- cq-comparison-tick-price displays the price for the active crosshair item -->
							<!-- <cq-comparison-tick-price></cq-comparison-tick-price>	-->
							<cq-comparison-loader></cq-comparison-loader>
							<div class="stx-btn-ico ciq-close" keyboard-selectable-child="true"></div>
						</cq-comparison-item>
					</template>
				</cq-comparison-key>
			</cq-comparison>
			<template cq-study-legend>
				<cq-item>
					<cq-label></cq-label>
					<span class="ciq-edit"></span>
					<div class="ciq-icon ciq-close"></div>
				</cq-item>
			</template>
	</cq-study-legend>
	`;
CIQ.UI.addComponentDefinition("cq-chart-legend", ChartLegend);

};


let __js_webcomponents_chartTitle_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Chart Title web component `<cq-chart-title>`.
 *
 * Note, if the `cq-marker` is added to the element, and it is placed within the
 * chartArea, the element will sit above the chart bars.
 *
 * `<cq-symbol></cq-symbol>` will display `chart.symbol`.<br>
 * `<cq-symbol-description></cq-symbol-description>` will display the `chart.symbolDisplay`. See {@link CIQ.ChartEngine.Chart#symbolDisplay} for details on how to set this value.
 *
 * Set attribute `cq-browser-tab` to true in order to get the stock symbol and latest price to update in the browser tab.
 *
 * Set member `previousClose` to the prior day's closing price in order to calculate and display change.
 * If `previousClose` is not set, then `iqPrevClose` from the `dataSet` will be the default.<br>
 * Remember data is loaded asynchronously.
 * Be sure to reset this value once your initial data has been loaded by using the {@link CIQ.ChartEngine.loadChart} callback function.
 * ```
 * stx.loadChart(symbol, parameters, function(){
 *      document.querySelector("cq-chart-title").previousClose = yesterdays-closing-price;
 * }
 * ```
 *
 * The `cq-animate` attribute in the `cq-current-price` element can be used to change the price color to red or green based on the previous value.
 * Setting the attribute to "fade" will introduce a transition effect on the price which, while attractive, uses considerable CPU when there are rapid updates.
 * @namespace WebComponents.cq-chart-title
 * @example
 * <cq-chart-title>
 * 	<cq-symbol></cq-symbol>
 * 	<cq-chart-price>
 * 		<cq-current-price cq-animate></cq-current-price>
 * 		<cq-change>
 * 			<div class="ico"></div> <cq-todays-change></cq-todays-change> (<cq-todays-change-pct></cq-todays-change-pct>)
 * 		</cq-change>
 * 	</cq-chart-price>
 * </cq-chart-title>
 *
 * @example
 * //You can set a more descriptive name by using http://documentation.chartiq.com/CIQ.ChartEngine.Chart.html#symbolDisplay
 * // and then enabling that on the tile.
 *
 * //In your HTML file look for:
 * <cq-symbol></cq-symbol>
 * //and replace it with :
 * <cq-symbol-description></cq-symbol-description>
 *
 * //In your quote feed add the following line:
 * params.stx.chart.symbolDisplay=response.fullName;
 *
 * //Like so:
 * quotefeed.fetchInitialData=function (symbol, suggestedStartDate, suggestedEndDate, params, cb) {
 *  var queryUrl = this.url; // using filter:true for after hours
 *
 *  CIQ.postAjax(queryUrl, null, function(status, response){
 *   // process the HTTP response from the datafeed
 *   if(status==200){ // if successful response from datafeed
 *    params.stx.chart.symbolDisplay=response.fullName; // specify response name
 *    var newQuotes = quotefeed.formatChartData(response);
 *    cb({quotes:newQuotes, moreAvailable:true, attribution:{source:"simulator", exchange:"RANDOM"}}); // return the fetched data; init moreAvailable to enable pagination
 *   } else { // else error response from datafeed
 *    cb({error:(response?response:status)});	// specify error in callback
 *   }
 *  });
 * };
 *
 * @since
 * - 06-15-16
 * - 4.0.0 Browser tab now updates with stock symbol and latest price using `cq-browser-tab` attribute.
 * - 6.3.0 Negative close values are "N/A" change percentage.
 * - 6.3.0 Child tag `<cq-todays-change-pct>` is now optional.
 */

class ChartTitle extends CIQ.UI.ModalTag {
	constructor() {
		super();
		/**
		 * Keep this value up to date in order to calculate change from yesterday's close
		 * @type {Float}
		 * @alias previousClose
		 * @memberof WebComponents.cq-chart-title
		 */
		this.previousClose = null;
	}

	/**
	 * Begins the Title helper. This observes the chart and updates the title elements as necessary.
	 * @alias begin
	 * @memberof WebComponents.cq-chart-title
	 */
	begin() {
		var self = this;

		this.addDefaultMarkup();
		this.addInjection("append", "createDataSet", function () {
			self.update();
		});
		this.update();
	}

	disconnectedCallback() {
		if (this.context)
			CIQ.UI.unobserveProperty(
				"symbolObject",
				this.context.stx.chart,
				this.listener
			);
		super.disconnectedCallback();
	}

	initialize(params) {
		this.params = params ? params : {};
		if (typeof this.params.autoStart == "undefined")
			this.params.autoStart = true;
		this.marker = null;

		if (this.params.autoStart) this.begin();
	}

	setContext(context) {
		var self = this,
			stx = this.context.stx;
		this.listener = function (obj) {
			self.previousClose = stx.mostRecentClose("iqPrevClose");
		};
		CIQ.UI.observeProperty("symbolObject", stx.chart, this.listener);
		this.initialize();
	}

	/**
	 * Updates the values in the node
	 * @alias update
	 * @memberof WebComponents.cq-chart-title
	 */
	update() {
		var stx = this.context.stx;

		var node = this.node;
		var symbolDiv = node.find("cq-symbol");
		var symbolDescriptionDiv = node.find("cq-symbol-description");
		var currentPriceDiv = node.find("cq-current-price");
		var todaysChangeDiv = node.find("cq-todays-change");
		var todaysChangePctDiv = node.find("cq-todays-change-pct");
		var chartPriceDiv = node.find("cq-chart-price");
		var changeDiv = node.find("cq-change");
		var doUpdateBrowserTab =
			["false", "0", null].indexOf(this.getAttribute("cq-browser-tab")) == -1;
		var doUpdatePrice = chartPriceDiv.length;
		var symbol = stx.chart.symbol,
			symbolDisplay = stx.chart.symbolDisplay;
		var internationalizer = stx.internationalizer;
		var priceChanged = false;

		if (!symbol) node.removeClass("stx-show");
		else node.addClass("stx-show");

		var symbolChanged = symbolDiv.text() !== symbol && !!symbolDiv.text(symbol);

		if (stx.isHistoricalModeSet) {
			if (currentPriceDiv.text() !== "") currentPriceDiv.text("");
			changeDiv.css({ display: "none" });
			// only change the display so that you don't wreck the line spacing and parens
			return;
		}

		var todaysChange = "",
			todaysChangePct = 0,
			todaysChangeDisplay = "";
		var currentQuote = stx.getFirstLastDataRecord(
			stx.chart.dataSet,
			"Close",
			true
		);
		var currentPrice = "";
		var textPrice = "";
		if (currentQuote) currentPrice = currentQuote.Close;
		if (doUpdatePrice) {
			if (currentPrice !== "")
				textPrice = stx.formatYAxisPrice(
					currentPrice,
					stx.chart.panel,
					stx.chart.decimalPlaces
				);
			var oldPrice = parseFloat(currentPriceDiv.text());
			if (
				currentPriceDiv.text() !== textPrice &&
				!!currentPriceDiv.text(textPrice)
			) {
				priceChanged = true;
				var attr = currentPriceDiv.attr("cq-animate");
				if (typeof attr != "undefined") {
					CIQ.UI.animatePrice(
						currentPriceDiv,
						currentPrice,
						oldPrice,
						attr == "fade"
					);
				}
			}
		}

		if (symbolDescriptionDiv.text() !== (symbolDisplay || symbol))
			symbolDescriptionDiv.text(symbolDisplay || symbol);

		if (
			(doUpdatePrice || doUpdateBrowserTab) &&
			symbol &&
			(symbolChanged || priceChanged)
		) {
			// Default to iqPrevClose if the developer hasn't set this.previousClose
			var previousClose = currentQuote && currentQuote.iqPrevClose;
			if (!previousClose && previousClose !== 0)
				previousClose = this.previousClose;

			if (currentPrice || currentPrice === 0) {
				todaysChange = CIQ.fixPrice(currentPrice - previousClose);
				todaysChangePct = (todaysChange / previousClose) * 100;
				if (previousClose <= 0 || currentPrice < 0) {
					todaysChangeDisplay = "N/A";
				} else if (internationalizer) {
					todaysChangeDisplay = internationalizer.percent2.format(
						todaysChangePct / 100
					);
				} else {
					todaysChangeDisplay = todaysChangePct.toFixed(2) + "%";
				}
				changeDiv.css({ display: "block" });
			} else {
				changeDiv.css({ display: "none" });
			}
			var todaysChangeAbs = Math.abs(todaysChange);
			var txtChange = stx.formatYAxisPrice(
				todaysChangeAbs,
				stx.chart.panel,
				stx.chart.decimalPlaces
			);
			if (todaysChangeAbs) {
				if (todaysChangeDiv.text() !== txtChange)
					todaysChangeDiv.text(txtChange);
			}
			if (todaysChangePctDiv.length) {
				if (todaysChangePctDiv.text() !== todaysChangeDisplay)
					todaysChangePctDiv.text(todaysChangeDisplay);
			}
			if (todaysChangeDisplay !== "" && todaysChange > 0) {
				chartPriceDiv.removeClass("stx-down").addClass("stx-up");
			} else if (todaysChangeDisplay !== "" && todaysChange < 0) {
				chartPriceDiv.removeClass("stx-up").addClass("stx-down");
			} else {
				chartPriceDiv.removeClass("stx-down").removeClass("stx-up");
			}

			currentPrice = currentPrice !== undefined ? currentPrice : "";
			todaysChange = todaysChange !== undefined ? todaysChange : "";

			// These strange characters create some spacing so that the title appears
			// correctly in a browser tab
			this.title =
				symbol + " \u200b \u200b " + textPrice + " \u200b \u200b \u200b ";
			if (todaysChange > 0) {
				this.title += "\u25b2 " + txtChange;
			} else if (todaysChange < 0) {
				this.title += "\u25bc " + txtChange;
			}
			if (doUpdateBrowserTab) {
				document.title = this.title;
			}
		}
	}
}

ChartTitle.markup = `
		<cq-symbol></cq-symbol>
		<cq-chart-price>
			<cq-current-price cq-animate></cq-current-price>
			<cq-change>
				<div class="ico"></div>
				<cq-todays-change></cq-todays-change> (
				<cq-todays-change-pct></cq-todays-change-pct>)
			</cq-change>
		</cq-chart-price>
	`;
CIQ.UI.addComponentDefinition("cq-chart-title", ChartTitle);

};


let __js_webcomponents_chartcontrolGroup_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */







var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Creates a `<cq-chartcontrol-group>` web component. The chart control group is a wrapper element for
 * chart UI controls, enabling the controls to be placed on top of the chart.
 *
 * **Note:** The `cq-marker` attribute must be added to the element to place it within the chart area.
 * The element will sit above the chart bars.
 *
 * @namespace WebComponents.cq-chartcontrol-group
 * @example
	<cq-chartcontrol-group cq-marker>
		<cq-menu class="ciq-search">
			<cq-lookup cq-keystroke-claim cq-uppercase>
				<cq-lookup-input cq-no-close>
					<input type="text" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="none" name="symbol" placeholder="">
					<cq-lookup-icon></cq-lookup-icon>
				</cq-lookup-input>
				<cq-lookup-results>
					<cq-lookup-filters cq-no-close>
						<cq-filter class="true">ALL</cq-filter>
						<cq-filter>STOCKS</cq-filter>
						<cq-filter>FX</cq-filter>
						<cq-filter>INDEXES</cq-filter>
						<cq-filter>FUNDS</cq-filter>
						<cq-filter>FUTURES</cq-filter>
					</cq-lookup-filters>
					<cq-scroll></cq-scroll>
				</cq-lookup-results>
			</cq-lookup>
		</cq-menu>
		<cq-toggle class="ciq-draw"><span></span><cq-tooltip>Draw</cq-tooltip></cq-toggle>
		<cq-toggle class="ciq-CH" cq-member="crosshair"><span></span><cq-tooltip>Crosshair</cq-tooltip></cq-toggle>
		<cq-menu class="ciq-menu ciq-period">
			<span><cq-clickable stxbind="Layout.periodicity">1D</cq-clickable></span>
			<cq-menu-dropdown>
				<cq-item stxtap="Layout.setPeriodicity(1,1,'day')">1 D</cq-item>
				<cq-item stxtap="Layout.setPeriodicity(1,1,'week')">1 W</cq-item>
				<cq-item stxtap="Layout.setPeriodicity(1,1,'month')">1 Mo</cq-item>
				<cq-separator></cq-separator>
				<cq-item stxtap="Layout.setPeriodicity(1,1,'minute')">1 Min</cq-item>
				<cq-item stxtap="Layout.setPeriodicity(1,5,'minute')">5 Min</cq-item>
				<cq-item stxtap="Layout.setPeriodicity(1,10,'minute')">10 Min</cq-item>
				<cq-item stxtap="Layout.setPeriodicity(3,5,'minute')">15 Min</cq-item>
				<cq-item stxtap="Layout.setPeriodicity(1,30,'minute')">30 Min</cq-item>
				<cq-item stxtap="Layout.setPeriodicity(2,30,'minute')">1 Hour</cq-item>
				<cq-item stxtap="Layout.setPeriodicity(8,30,'minute')">4 Hour</cq-item>
				<cq-separator></cq-separator>
				<cq-item stxtap="Layout.setPeriodicity(1,1,'second')">1 Sec</cq-item>
				<cq-item stxtap="Layout.setPeriodicity(1,10,'second')">10 Sec</cq-item>
				<cq-item stxtap="Layout.setPeriodicity(1,30,'second')">30 Sec</cq-item>
				<cq-separator></cq-separator>
				<cq-item stxtap="Layout.setPeriodicity(1,250,'millisecond')">250 MSec</cq-item>
			</cq-menu-dropdown>
		</cq-menu>
	</cq-chartcontrol-group>
 *
 * @since 7.3.0
 */
class ChartcontrolGroup extends CIQ.UI.ModalTag {
	connectedCallback() {
		if (this.attached) return;
		super.connectedCallback();
	}

	setContext(context) {
		this.addDefaultMarkup();
		var node = this.node;

		// Prevent interaction events from propagating through the panel to the chart
		node[0].addEventListener(
			"touchstart",
			function (event) {
				event.stopPropagation();
			},
			{ passive: false }
		);
		node[0].addEventListener("mousedown", function (event) {
			event.stopPropagation();
		});

		// Set focus on the input field when tapped to invoke
		// on-screen keyboard.
		var input = node.find("input");
		CIQ.UI.stxtap(input[0], function () {
			this.focus();
		});
	}
}

ChartcontrolGroup.markup = `
		<cq-menu class="ciq-search" keyboard-navigation="false">
			<cq-lookup cq-keystroke-claim cq-uppercase></cq-lookup>
		</cq-menu>
		<cq-toggle class="ciq-draw" cq-member="drawing"><span></span><cq-tooltip>Draw</cq-tooltip></cq-toggle>
		<cq-toggle class="ciq-CH" cq-member="crosshair"><span></span><cq-tooltip>Crosshair</cq-tooltip></cq-toggle>
		<cq-toggle class="ciq-DT" cq-member="tableView"><span></span><cq-tooltip>Table View</cq-tooltip></cq-toggle>
		<cq-menu class="ciq-menu ciq-period">
			<span><cq-clickable stxbind="Layout.periodicity">1D</cq-clickable></span>
			<cq-menu-dropdown>
				<cq-menu-container cq-name="menuPeriodicity"></cq-menu-container>
			</cq-menu-dropdown>
		</cq-menu>
	`;
CIQ.UI.addComponentDefinition("cq-chartcontrol-group", ChartcontrolGroup);

};


let __js_webcomponents_clickable_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Clickable web component `<cq-clickable>`.
 *
 * When tapped/clicked, this component can run a method on any other component. Set the
 * `cq-selector` attribute to a selector for the other component. Set `cq-method` to the method
 * to run on that component. The parameter provided to the method is an object that contains
 * the context (if available) for this clickable component ("context") and a reference to the
 * component ("caller").
 *
 * For example:
 * ```html
 * <cq-clickable cq-selector="cq-sample-dialog" cq-method="open">Settings</cq-clickable>
 * ```
 * runs
 * ```js
 * document.querySelector("cq-sample-dialog").open({context: this.context, caller: this});
 * ```
 *
 * @namespace WebComponents.cq-clickable
 * @since 3.0.9
 */
class Clickable extends CIQ.UI.ContextTag {
	connectedCallback() {
		if (this.attached) return;
		super.connectedCallback();
		var self = this;

		CIQ.UI.stxtap(this, function () {
			self.runMethod();
		});
	}

	/**
	 * Runs a method on the clickable component.
	 *
	 * @alias runMethod
	 * @memberof WebComponents.cq-clickable
	 */
	runMethod() {
		var selector = this.node.attr("cq-selector");
		var method = this.node.attr("cq-method");

		const { context } = this;
		if (/-dialog/.test(selector) && method === "open" && context.config) {
			const channel =
				(context.config.channels || {}).dialog || "channel.dialog";

			this.channelWrite(
				channel,
				{
					type: selector.replace(/cq-|-dialog/g, ""),
					params: { context, caller: this }
				},
				context.stx
			);
			return;
		}

		var clickable = this;
		document.querySelectorAll(selector).forEach(function (i) {
			if (i[method])
				i[method].call(i, {
					context: clickable.context,
					caller: clickable
				});
		});
	}
}

CIQ.UI.addComponentDefinition("cq-clickable", Clickable);

};


let __js_webcomponents_close_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Close web component `<cq-close>`.
 *
 * cq-close web component will close its containing (parent or up) component
 * by calling its close() method
 * @namespace WebComponents.cq-close
 * @example
 * <cq-item>
 * 		<cq-label></cq-label>
 * 		<cq-close></cq-close>
 * </cq-item>
 *
 */
class Close extends CIQ.UI.BaseComponent {
	connectedCallback() {
		if (this.attached) return;
		var self = this;
		function closure(e) {
			self.tap();
			e.stopPropagation();
		}
		CIQ.UI.stxtap(this, closure);
		super.connectedCallback();
	}

	/**
	 * @alias tap
	 * @memberof WebComponents.cq-close
	 */
	tap() {
		CIQ.UI.containerExecute(this, "close");
	}
}

CIQ.UI.addComponentDefinition("cq-close", Close);

};


let __js_webcomponents_comparison_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Symbol comparison component `<cq-comparison>`.
 *
 * Add attribute `cq-marker` to have the component insert itself as a marker on the chart.
 *
 * For `cq-comparison-keys`:
 * - Add `attribute cq-panel-only` to have the component show only series in the panel
 * - Add `attribute cq-all-series` to have the component show even non-comparison series in the legend
 *
 * **Note:**
 * - By default, the comparison web component will not connect gaps in the data to indicate data points are missing due to discrepancies between marker hours or due to thinly traded instruments. If you want it to behave differently, you will need to override these defaults.
 * Do not make the changes directly on *components.js*, but rather create a separate file with a copy of the methods you are overwriting and load that file right after the *components.js* file is loaded, but before any web components are instantiated. This allows for easier upgrades.
 * Look for the `addSeries` call and use the `gapDisplayStyle` parameter (or any other required parameter) as outlined in {@link CIQ.ChartEngine#addSeries}.
 *
 * - To adjust the comparison's automatic color selector, set `document.querySelector('cq-comparison').swatchColors` to an array of colors.
 * To adjust colors from the color picker popup, execute:
 *   ```
 *   const picker = document.querySelector('cq-color-picker');
 *   picker.params.colorMap=[[row 1 of colors],[row 2 of colors],[row 3 of colors],[etc.]]
 *   picker.initialize();
 *   ```
 *
 *   You can use `cq-swatch` rather than `cq-comparison-swatch` to allow user to change the series color.
 *
 * @namespace WebComponents.cq-comparison
 *
 * @example
 * document.querySelector('cq-comparison').swatchColors=["rgb(142, 198, 72)"];
 * const picker = document.querySelector('cq-color-picker');
 * picker.params.colorMap=[["#ffffff", "#e1e1e1", "#cccccc", "#b7b7b7", "#a0a0a5", "#898989", "#707070", "#626262", "#555555", "#464646", "#363636", "#262626", "#1d1d1d", "#000000"]];
 * picker.initialize();
 *
 * @example
 * <cq-comparison cq-marker>
 *     <cq-menu class="cq-comparison-new">
 *         <cq-comparison-add-label>
 *             <cq-comparison-plus></cq-comparison-plus><span>Compare</span><span>...</span>
 *         </cq-comparison-add-label>
 *         <cq-comparison-add>
 *             <cq-comparison-lookup-frame>
 *                 <cq-lookup cq-keystroke-claim>
 *                     <cq-lookup-input cq-no-close>
 *                         <input type="text" cq-focus spellcheck="false" autocomplete="off" autocorrect="off"
 *                                            autocapitalize="none" placeholder="Enter Symbol">
 *                         <cq-lookup-icon></cq-lookup-icon>
 *                     </cq-lookup-input>
 *                     <cq-lookup-results>
 *                         <cq-lookup-filters cq-no-close>
 *                             <cq-filter class="true">ALL</cq-filter>
 *                             <cq-filter>STOCKS</cq-filter>
 *                             <cq-filter>FX</cq-filter>
 *                             <cq-filter>INDEXES</cq-filter>
 *                             <cq-filter>FUNDS</cq-filter>
 *                             <cq-filter>FUTURES</cq-filter>
 *                         </cq-lookup-filters>
 *                         <cq-scroll></cq-scroll>
 *                     </cq-lookup-results>
 *                 </cq-lookup>
 *             </cq-comparison-lookup-frame>
 *             <cq-swatch cq-no-close></cq-swatch>
 *             <span><cq-accept-btn class="stx-btn">ADD</cq-accept-btn></span>
 *         </cq-comparison-add>
 *     </cq-menu>
 *     <cq-comparison-key>
 *         <template cq-comparison-item>
 *             <cq-comparison-item>
 *                 <cq-comparison-swatch></cq-comparison-swatch>
 *                 <cq-comparison-label>AAPL</cq-comparison-label>
 *                 <!-- cq-comparison-price displays the current price with color animation -->
 *                 <cq-comparison-price cq-animate></cq-comparison-price>
 *                 <!-- cq-comparison-tick-price displays the price for the active crosshair item -->
 *                 <!-- <cq-comparison-tick-price></cq-comparison-tick-price>    -->
 *                 <cq-comparison-loader></cq-comparison-loader>
 *                 <div class="stx-btn-ico ciq-close"></div>
 *             </cq-comparison-item>
 *         </template>
 *     </cq-comparison-key>
 * </cq-comparison>
 *
 * @since 7.3.0 Added the ability to set series color using `cq-swatch`.
 */
class Comparison extends CIQ.UI.ModalTag {
	constructor() {
		super();
		this.swatchColors = [];
		this.loading = [];
	}

	connectedCallback() {
		if (this.attached) return;
		super.connectedCallback();
		this.swatchColors = [
			"#8ec648",
			"#00afed",
			"#ee652e",
			"#912a8e",
			"#fff126",
			"#e9088c",
			"#ea1d2c",
			"#00a553",
			"#00a99c",
			"#0056a4",
			"#f4932f",
			"#0073ba",
			"#66308f",
			"#323390"
		];
	}

	/**
	 * Initializes all the children UI elements that make up `<cq-comparison>`.
	 * @alias configureUI
	 * @memberof WebComponents.cq-comparison#
	 */
	configureUI() {
		var node = this.node;
		var addNew = node.find("cq-accept-btn");
		this.template = node.find("*[cq-comparison-item]");
		var swatchColors = node.find("cq-swatch").attr("cq-colors");
		if (swatchColors) this.swatchColors = swatchColors.split(",");
		for (var i = 0; i < this.swatchColors.length; i++) {
			this.swatchColors[i] = CIQ.convertToNativeColor(this.swatchColors[i]);
		}
		var lookup = node.find("cq-lookup");
		if (lookup.length)
			lookup[0].setCallback(
				(function (self) {
					return function () {
						self.selectItem.apply(self, arguments);
					};
				})(this)
			);
		CIQ.UI.stxtap(addNew[0], function (e) {
			lookup[0].forceInput();
			e.stopPropagation();
		});
	}

	/**
	 * Triggers the comparison lookup component and passes keyboard control into the internal
	 * [cq-lookup]{@link WebComponents.cq-lookup} element.
	 *
	 * Called when keyboard navigation activates this element by pressing Return/Enter.
	 *
	 * @alias onKeyboardSelection
	 * @memberof WebComponents.cq-comparison#
	 * @since 8.3.0
	 */
	onKeyboardSelection() {
		let menu = this.querySelector("cq-menu.cq-comparison-new");
		let lookup = this.querySelector("cq-lookup");
		if (menu && lookup) {
			// Trip the menu button
			menu.dispatchEvent(
				new Event("stxtap", {
					bubbles: true,
					cancelable: true
				})
			);
			// Pass control to the lookup component
			lookup.keyboardNavigation = this.keyboardNavigation;
			if (lookup.onKeyboardSelection) lookup.onKeyboardSelection();
		}
	}

	/**
	 * Picks a color to display the new comparison as.
	 * Loops through preset colors and picks the next one on the list.
	 * If the all colors are taken then the last color will be repeated.
	 * @alias pickSwatchColor
	 * @memberof WebComponents.cq-comparison#
	 */
	pickSwatchColor() {
		var stx = this.context.stx;
		var swatch = this.node.find("cq-swatch");
		if (!swatch.length) return;
		var currentColor = swatch[0].style.backgroundColor;

		var usedColors = {};
		for (var s in stx.chart.series) {
			var series = stx.chart.series[s];
			if (!series.parameters.isComparison) continue;
			usedColors[CIQ.convertToNativeColor(series.parameters.color)] = true;
		}

		if (currentColor !== "" && !usedColors[currentColor]) return; // Currently picked color not in use then allow it
		for (var i = 0; i < this.swatchColors.length; i++) {
			// find first unused color from available colors
			if (!usedColors[this.swatchColors[i]]) {
				swatch[0].style.backgroundColor = this.swatchColors[i];
				return;
			}
		}
		//Uh oh, all colors taken. Last color will be used.
	}

	position() {
		var stx = this.context.stx;
		var bar = stx.barFromPixel(stx.cx);
		this.tick = stx.tickFromPixel(stx.cx);
		var prices = stx.chart.xaxis[bar];
		var self = this;

		function printValues() {
			var key;
			self.timeout = null;
			for (var s in stx.chart.series) {
				if (!key) key = self.node.find("cq-comparison-key");
				var price = key.find(
					'cq-comparison-item[cq-symbol="' + s + '"] cq-comparison-tick-price'
				);
				if (price.text() !== "") price.text("");
				if (price.length && prices && prices.data) {
					var symbol = stx.chart.series[s].parameters.symbol;
					var paddedPrice = stx.padOutPrice(prices.data[symbol]);
					if (price.text() !== paddedPrice) price.text(paddedPrice);
					var pdSymbol = prices.data[symbol];
					if (pdSymbol !== null) {
						if (typeof pdSymbol === "object") pdSymbol = pdSymbol.Close;
						paddedPrice = stx.padOutPrice(pdSymbol);
						if (price.text() !== paddedPrice) price.text(paddedPrice);
					}
				}
			}
		}
		if (this.tick != this.prevTick) {
			if (this.timeout) clearTimeout(this.timeout);
			var ms = 0; // IE and FF struggle to keep up with the dynamic heads up.
			this.timeout = setTimeout(printValues, ms);
		}
		this.prevTick = this.tick; // We don't want to update the dom every pixel, just when we cross into a new candle
	}

	/**
	 * Handles removing a series from the comparison.
	 * @param {string} symbol Name of series as a string.
	 * @param {object}  series Object containing info on series.
	 * @alias removeSeries
	 * @memberof WebComponents.cq-comparison#
	 */
	removeSeries(symbol, series) {
		this.context.stx.removeSeries(symbol);
	}

	/**
	 * The legend gets re-rendered whenever we createDataSet() (wherein the series may have changed).
	 * We re-render the entire thing each time, but we use a virtual DOM to determine whether
	 * to actually change anything on the screen (so as to avoid unnecessary flickering)
	 * @alias renderLegend
	 * @memberof WebComponents.cq-comparison#
	 */
	renderLegend() {
		function tapFunction(self, s, series) {
			return function () {
				self.nomore = true;
				if (!series.parameters.permanent) self.removeSeries(s, series);
				self.modalEnd(); // tricky, we miss mouseout events when we remove items from under ourselves
			};
		}
		this.pickSwatchColor();
		var holder = this.closest(".stx-holder");
		var key = CIQ.cqvirtual(this.querySelector("cq-comparison-key"));
		if (!key) return;
		var keyAppend = function (i) {
			key.appendChild(i);
		};
		var stx = this.context.stx;
		stx.getDefaultColor();
		var panelOnly = key.hasAttribute("cq-panel-only");
		var comparisonOnly = !key.hasAttribute("cq-all-series");
		for (var r in stx.chart.seriesRenderers) {
			var renderer = stx.chart.seriesRenderers[r];
			if (renderer == stx.mainSeriesRenderer) continue;
			if (comparisonOnly && !renderer.params.isComparison) continue;
			if (panelOnly && (!holder || renderer.params.panel != holder.panel.name))
				continue;
			for (var s = 0; s < renderer.seriesParams.length; s++) {
				var rSeries = renderer.seriesParams[s];
				var frag = CIQ.UI.makeFromTemplate(this.template);
				var comparisonSwatch = frag.find("cq-comparison-swatch");
				var swatch = frag.find("cq-swatch");
				var label = frag.find("cq-comparison-label");
				var description = frag.find("cq-comparison-description");
				var loader = frag.find("cq-comparison-loader");
				var btn = frag.find(".ciq-close");
				var series = stx.chart.series[rSeries.id];
				var seriesParameters = series.parameters;
				var color = seriesParameters.color || renderer.colors[series.id].color;
				var isAuto = color == "auto";
				if (isAuto) color = stx.defaultColor;
				comparisonSwatch.css({ background: color });
				if (swatch.length) {
					swatch[0].seriesId = rSeries.id;
					swatch[0].setColor(color, false, isAuto);
				}
				if (seriesParameters.opacity) {
					comparisonSwatch.css({ opacity: seriesParameters.opacity });
					swatch.css({ opacity: seriesParameters.opacity });
				}
				label.text(stx.translateIf(series.display));
				description.text(stx.translateIf(series.description));
				frag.attr("cq-symbol", series.id);

				var symbol = seriesParameters.symbol;
				var q = stx.mostRecentClose(symbol);
				if (q || q === 0) {
					var price = frag.find("cq-comparison-price");
					if (price.length) {
						price.text(stx.padOutPrice(q));
					}
				}

				if (this.loading[seriesParameters.symbolObject.symbol])
					loader.addClass("stx-show");
				else loader.removeClass("stx-show");

				if (seriesParameters.error) frag.attr("cq-error", true);
				if (!seriesParameters.color || seriesParameters.permanent) btn.hide();
				else {
					CIQ.UI.stxtap(btn[0], tapFunction(this, series.id, series));
				}
				Array.from(frag).forEach(keyAppend);
			}
		}

		var legendParent = CIQ.climbUpDomTree(CIQ.cqrender(key), "cq-study-legend");
		legendParent.forEach(function (i) {
			if (i.displayLegendTitle) i.displayLegendTitle();
		});
	}

	/**
	 * Changes the color of a series; triggered if using [cq-swatch]{@link WebComponents.cq-swatch} to show the series color.
	 *
	 * @param {string} color New color.
	 * @param {object} swatch Swatch from which the color setting is made.
	 *
	 * @alias setColor
	 * @memberof WebComponents.cq-comparison#
	 * @since 7.3.0
	 */
	setColor(color, swatch) {
		if (swatch.seriesId)
			this.context.stx.modifySeries(swatch.seriesId, { color: color });
	}

	/**
	 * Adds an injection to the ChartEngine that tracks the price of Comparisons.
	 * @param {number} updatePrices
	 * @alias startPriceTracker
	 * @memberof WebComponents.cq-comparison#
	 */
	startPriceTracker(updatePrices) {
		var self = this;
		this.addInjection("append", "createDataSet", function () {
			if (updatePrices) self.updatePrices();
			if (this.chart.dataSet && this.chart.dataSet.length) {
				if (self.node.attr("cq-show") !== "true")
					self.node.attr("cq-show", "true");
			} else if (self.hasAttribute("cq-show")) self.removeAttribute("cq-show");
		});
	}

	startTickPriceTracker() {
		this.prevTick = null;
		this.addInjection(
			"prepend",
			"headsUpHR",
			(function (self) {
				return function () {
					self.position();
				};
			})(this)
		);
	}

	/**
	 * Fires whenever a new security is added as a comparison. Handles all the necessary events
	 * to update the chart with the new comparison.
	 *
	 * @param {object} obj Contains information about the security.
	 * @param {string} obj.symbol The symbol that identifies the security.
	 *
	 * @alias selectItem
	 * @memberof WebComponents.cq-comparison#
	 * @since 8.2.0 Removed the `context` parameter. The context is now accessed from the base
	 * 		component class.
	 */
	selectItem(obj) {
		var context = this.context;
		var self = this;
		function cb(err, series) {
			if (err) {
				series.parameters.error = true;
			}
			self.loading[series.parameters.symbolObject.symbol] = false;
			self.renderLegend();
		}
		var swatch = this.node.find("cq-swatch");
		var color = "auto",
			pattern = null,
			width = 1;
		if (swatch[0]) {
			var style = swatch[0].style;
			color = style.backgroundColor;
			pattern = style.borderTopStyle;
			width = style.width || 1;
		}
		var stx = context.stx;
		this.loading[obj.symbol] = true;
		var params = {
			name: "comparison " + obj.symbol,
			symbolObject: obj,
			isComparison: true,
			color: color,
			pattern: pattern,
			width: width || 1,
			data: { useDefaultQuoteFeed: true },
			forceData: true
		};

		// don't allow symbol if same as main chart, comparison already exists, or just white space
		var exists = stx.getSeries({ symbolObject: obj });
		for (var i = 0; i < exists.length; i++)
			if (exists[i].parameters.isComparison) {
				this.loading[obj.symbol] = false;
				return;
			}

		// don't allow symbol if same as main chart or just white space
		if (
			obj.symbol &&
			obj.symbol.trim().length > 0 &&
			(!context.stx.chart.symbol ||
				context.stx.chart.symbol.toLowerCase() !== obj.symbol.toLowerCase())
		) {
			stx.addSeries(obj.symbol, params, cb);
		} else {
			this.loading[obj.symbol] = false;
		}
	}

	setContext(context) {
		this.node.attr("cq-show", "true");
		// if attribute cq-marker then detach and put ourselves in the chart holder
		this.configureUI();
		var self = this,
			stx = this.context.stx,
			chart = stx.chart;
		function renderIfChanged(obj) {
			self.renderLegend();
		}
		["layout", "symbolImport", "symbolChange", "theme"].forEach(function (ev) {
			stx.addEventListener(ev, renderIfChanged);
		});
		this.context.stx.append("modifySeries", function () {
			self.renderLegend();
		});
		this.renderLegend();
		if (!this.template.length) return;
		var frag = CIQ.UI.makeFromTemplate(this.template);
		this.startPriceTracker(frag.find("cq-comparison-price").length);
		if (frag.find("cq-comparison-tick-price")) {
			this.startTickPriceTracker();
		}
	}

	/**
	 * Loops thru `stxx.chart.series` to update the current price of all comparisons.
	 * @alias updatePrices
	 * @memberof WebComponents.cq-comparison#
	 */
	updatePrices() {
		var key; // lazy eval this to prevent work when no comparisons exist
		var stx = this.context.stx;
		var historical = stx.isHistoricalModeSet;
		var isDaily = CIQ.ChartEngine.isDailyInterval(stx.layout.interval);
		for (var s in stx.chart.series) {
			if (!key) key = this.node.find("cq-comparison-key");
			var price = key.find(
				'cq-comparison-item[cq-symbol="' + s + '"] cq-comparison-price'
			);
			if (price.length) {
				var symbol = stx.chart.series[s].parameters.symbol;
				var q = stx.chart.series[s].lastQuote;
				if (!q || !q.DT || (!q.Close && q.Close !== 0)) continue;
				if (
					!isDaily &&
					stx.chart.market &&
					stx.chart.market.getSession(q.DT) === null
				)
					continue; // don't update when no session
				var newPrice = q.Close;
				var field = stx.chart.series[s].parameters.subField || "Close";
				var oldPrice = parseFloat(price.text());
				if (newPrice && (newPrice[field] || newPrice[field] === 0))
					newPrice = newPrice[field];
				if (!newPrice && newPrice !== 0 && stx.chart.series[s].lastQuote)
					newPrice = stx.chart.series[s].lastQuote[field];
				var priceText = stx.padOutPrice(historical ? "" : newPrice);
				if (price.text() !== priceText) price.text(priceText);
				if (historical) return;
				if (typeof price.attr("cq-animate") != "undefined")
					CIQ.UI.animatePrice(price, newPrice, oldPrice);
			}
		}
	}
}

CIQ.UI.addComponentDefinition("cq-comparison", Comparison);

};


let __js_webcomponents_comparisonLookup_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */





var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * The comparison lookup web component `<cq-comparison-lookup>`.
 *
 * An encapsulation of the markup for the comparison lookup control, **+ Compare...**
 *
 * @namespace WebComponents.cq-comparison-lookup
 * @since 7.5.0
 *
 * @example
 * <cq-comparison cq-marker>
 *     <cq-menu class="cq-comparison-new" cq-focus="input">
 *         <cq-comparison-add-label class="ciq-no-share">
 *             <cq-comparison-plus></cq-comparison-plus><span>Compare</span><span>...</span>
 *         </cq-comparison-add-label>
 *         <cq-comparison-add>
 *             <cq-comparison-lookup-frame>
 *                 <cq-lookup cq-keystroke-claim cq-uppercase></cq-lookup>
 *             </cq-comparison-lookup-frame>
 *             <cq-swatch cq-no-close></cq-swatch>
 *             <span><cq-accept-btn class="stx-btn">ADD</cq-accept-btn></span>
 *         </cq-comparison-add>
 *     </cq-menu>
 * </cq-comparison>
 */
class ComparisonLookup extends CIQ.UI.ContextTag {
	/**
	 * Adds the default markup.
	 *
	 * @alias setContext
	 * @memberof WebComponents.cq-comparison-lookup
	 * @since 7.5.0
	 */
	setContext() {
		if (this.contextSet) return;
		this.contextSet = true;
		this.addDefaultMarkup();
	}
}

ComparisonLookup.markup = `
		<cq-comparison cq-marker>
			<cq-menu class="cq-comparison-new" cq-focus="input">
				<cq-comparison-add-label class="ciq-no-share">
					<cq-comparison-plus></cq-comparison-plus><span>Compare</span><span>...</span>
				</cq-comparison-add-label>
				<cq-comparison-add>
					<cq-comparison-lookup-frame>
						<cq-lookup cq-keystroke-claim cq-uppercase></cq-lookup>
					</cq-comparison-lookup-frame>
					<cq-swatch cq-no-close></cq-swatch>
					<span><cq-accept-btn class="stx-btn">ADD</cq-accept-btn></span>
				</cq-comparison-add>
			</cq-menu>
		</cq-comparison>
	`;

CIQ.UI.addComponentDefinition("cq-comparison-lookup", ComparisonLookup);

};


let __js_webcomponents_cvpController_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Simple web component that allows data binding to arbitrary properties of
 * {@link CIQ.ChartEngine.currentVectorParameters}. Ideal for use as a drawing toolbar extension.
 *
 * @namespace WebComponents.cq-cvp-controller
 *
 * @example
 * <cq-cvp-controller cq-section cq-cvp-header="1">
 *     <div cq-section>
 *         <div class="ciq-heading">Dev 1</div>
 *         <span stxtap="toggleActive()" class="ciq-checkbox">
 *             <span></span>
 *         </span>
 *     </div>
 *     <cq-line-color cq-section class="ciq-color" stxbind="getColor()" stxtap="pickColor()">
 *         <span></span>
 *     </cq-line-color>
 *     <cq-line-style cq-section>
 *         <cq-menu class="ciq-select">
 *             <span cq-cvp-line-style class="ciq-line ciq-selected"></span>
 *             <cq-menu-dropdown class="ciq-line-style-menu">
 *                 <cq-item stxtap="setStyle(1, 'solid')"><span class="ciq-line-style-option ciq-solid-1"></span></cq-item>
 *                 <cq-item stxtap="setStyle(3, 'solid')"><span class="ciq-line-style-option ciq-solid-3"></span></cq-item>
 *                 <cq-item stxtap="setStyle(5, 'solid')"><span class="ciq-line-style-option ciq-solid-5"></span></cq-item>
 *                 <cq-item stxtap="setStyle(1, 'dotted')"><span class="ciq-line-style-option ciq-dotted-1"></span></cq-item>
 *                 <cq-item stxtap="setStyle(3, 'dotted')"><span class="ciq-line-style-option ciq-dotted-3"></span></cq-item>
 *                 <cq-item stxtap="setStyle(5, 'dotted')"><span class="ciq-line-style-option ciq-dotted-5"></span></cq-item>
 *                 <cq-item stxtap="setStyle(1, 'dashed')"><span class="ciq-line-style-option ciq-dashed-1"></span></cq-item>
 *                 <cq-item stxtap="setStyle(3, 'dashed')"><span class="ciq-line-style-option ciq-dashed-3"></span></cq-item>
 *                 <cq-item stxtap="setStyle(5, 'dashed')"><span class="ciq-line-style-option ciq-dashed-5"></span></cq-item>
 *             </cq-menu-dropdown>
 *         </cq-menu>
 *     </cq-line-style>
 * </cq-cvp-controller>
 */
class CVPController extends CIQ.UI.ContextTag {
	get active() {
		return this.context.stx.currentVectorParameters["active" + this._scope];
	}

	set active(value) {
		this.context.stx.currentVectorParameters["active" + this._scope] = value;
	}

	get color() {
		return this.context.stx.currentVectorParameters["color" + this._scope];
	}

	set color(value) {
		this.context.stx.currentVectorParameters["color" + this._scope] = value;
	}

	get lineWidth() {
		return this.context.stx.currentVectorParameters["lineWidth" + this._scope];
	}

	set lineWidth(value) {
		this.context.stx.currentVectorParameters["lineWidth" + this._scope] = value;
	}

	get pattern() {
		return this.context.stx.currentVectorParameters["pattern" + this._scope];
	}

	set pattern(value) {
		this.context.stx.currentVectorParameters["pattern" + this._scope] = value;
	}

	connectedCallback() {
		if (this.attached) return;

		Object.defineProperty(this, "_scope", {
			configurable: true,
			enumerable: false,
			value: this.getAttribute("cq-cvp-header") || "",
			writable: false
		});

		var tmpl = document.querySelector(
			'template[cq-cvp-controller], template[cvp-controller="true"]'
		);

		if (this.children.length === 0 && tmpl) {
			var nodes = CIQ.UI.makeFromTemplate(tmpl, this);
			var heading = this.querySelector(".ciq-heading");
			if (heading) {
				heading.innerHTML = this._scope;
			}
		}

		super.connectedCallback();
	}

	emit(eventName, value) {
		if (this.toolbar) {
			this.toolbar.emit();
		} else {
			this.dispatchEvent(
				new CustomEvent(eventName, {
					bubbles: true,
					cancelable: true,
					detail: value
				})
			);
		}
	}

	getColor(activator) {
		var node = CIQ.UI.$(activator.node || this.node.find("cq-line-color"));
		var color = this.color;

		if (color == "transparent" || color == "auto") {
			color = "";
		}

		node.css({
			background: color
		});

		var bgColor = CIQ.getBackgroundColor(this.parentNode);
		if (!color || Math.abs(CIQ.hsl(bgColor)[2] - CIQ.hsl(color)[2]) < 0.2) {
			var border = CIQ.chooseForegroundColor(bgColor);
			node.css({ border: "solid " + border + " 1px" });
			if (!color)
				node.css({
					background:
						"linear-gradient(to bottom right, " +
						border +
						"," +
						border +
						" 49%, " +
						bgColor +
						" 50%, " +
						bgColor +
						")"
				});
		} else {
			node.css({ border: "" });
		}
	}

	pickColor(activator) {
		var node = CIQ.UI.$(activator.node);
		var colorPicker = document.querySelector("cq-color-picker");
		var cvpController = this;
		var overrides = node.attr("cq-overrides");

		if (!colorPicker)
			return console.error(
				"CVPController.prototype.pickColor: no <cq-color-picker> available"
			);
		if (overrides) activator.overrides = overrides.split(",");

		colorPicker.callback = function (color) {
			cvpController.color = color;
			cvpController.getColor(activator);
			cvpController.emit("change", {
				color: color
			});
		};
		activator.context = this.context;
		colorPicker.display(activator);
	}

	setContext() {
		this.setStyle();
		if (this.toolbar) this.toolbar.dirty(false);
	}

	setStyle(activator, width, pattern) {
		width = width || "1";
		pattern = pattern || "dotted";

		this.lineWidth = parseInt(width, 10);
		this.pattern = pattern;

		var selection = this.node.find("*[cq-cvp-line-style]");

		if (this.lineStyleClassName) {
			selection.removeClass(this.lineStyleClassName);
		}

		if (pattern && pattern !== "none") {
			this.lineStyleClassName = "ciq-" + pattern + "-" + this.lineWidth;
			selection.addClass(this.lineStyleClassName);
		} else {
			this.lineStyleClassName = null;
		}

		this.emit("change", {
			lineWidth: width,
			pattern: pattern
		});
	}

	/**
	 * Update the component state with configuration. May be a drawing instance or
	 * currentVectorParameters.
	 *
	 * @param {Object} config drawing instance or currentVectorParameters
	 */
	sync(config) {
		var active = config["active" + this._scope];
		var color = config["color" + this._scope];
		var lineWidth = config["lineWidth" + this._scope];
		var pattern = config["pattern" + this._scope];

		var className = "ciq-active";
		var checkbox = this.node.find(".ciq-checkbox");

		if (active) {
			checkbox.addClass(className);
		} else {
			checkbox.removeClass(className);
		}

		this.active = !!active;
		this.color = color || "";
		this.getColor({});
		this.setStyle(null, lineWidth, pattern);
	}

	toggleActive(activator) {
		var node = CIQ.UI.$(activator.node);
		var className = "ciq-active";

		if (this.active) {
			this.active = false;
			node.removeClass(className);
		} else {
			this.active = true;
			node.addClass(className);
		}

		this.emit("change", {
			active: this.active
		});
	}
}

CIQ.UI.addComponentDefinition("cq-cvp-controller", CVPController);

};


let __js_webcomponents_dialog_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */


var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Dialog web component `<cq-dialog>`.
 *
 * Manages general dialog interaction such as display, hide, location, size, tap interaction, etc
 *
 * @namespace WebComponents.cq-dialog
 * @example
	<cq-dialog cq-timezone-dialog>
		<cq-timezone-dialog>
			<h4 class="title">Choose Timezone</h4>
			<cq-close></cq-close>
	
			<p>To set your timezone use the location button below, or scroll through the following list...</p>
			<p class="currentUserTimeZone"></p>
	    <div class="detect">
	    <div class="ciq-btn" stxtap="Layout.removeTimezone()">Use My Current Location</div>
	    </div>
	    <div class="timezoneDialogWrapper" style="max-height:360px; overflow: auto;">
		        <ul>
		          <li class="timezoneTemplate" style="display:none;cursor:pointer;"></li>
		        </ul>
	        </div>
	    <div class="instruct">(Scroll for more options)</div>
		</cq-timezone-dialog>
	</cq-dialog>
 */
class Dialog extends CIQ.UI.BaseComponent {
	constructor() {
		super();
		this.activeAttributes = {};
	}

	/**
	 * The attributes that are added to a cq-dialog when it is opened (and removed when closed).
	 * Contains "cq-active" by default.
	 * @memberof WebComponents.cq-dialog
	 * @type {Object}
	 */
	connectedCallback() {
		if (this.attached) return;
		this.isDialog = true;
		super.connectedCallback();
		var self = this;
		function handleTap(e) {
			self.tap(e);
		}
		CIQ.UI.stxtap(this, handleTap);

		var uiManager = CIQ.UI.getUIManager();
		uiManager.registerForResize(this);
		this.uiManager = uiManager;
	}

	disconnectedCallback() {
		this.uiManager.unregisterForResize(this);
		super.disconnectedCallback();
	}

	/**
	 * Creates a new attribute to be activated when the dialog is open. Use
	 * this to style the dialog. This is automatically set by any component
	 * that is derived from DialogContentTag
	 * @param {string} attribute The attribute to add or remove
	 * @memberof WebComponents.cq-dialog
	 * @since  4.1.0
	 * @example
	 * <style> cq-dialog[cq-study-context]{ padding:0; } </style>
	 * <cq-dialog cq-study-context></cq-dialog>
	 */
	addActiveAttribute(attribute) {
		this.activeAttributes[attribute] = true;
	}

	center() {
		var parent = this.parentElement;
		if (parent.tagName == "BODY") parent = window;
		var gSz = CIQ.guaranteedSize(parent);
		var h = gSz.height;
		var outer = CIQ.elementDimensions(this, {
			padding: 1,
			border: 1
		});
		var ch = outer.height;
		var left = 50;
		var top = 50;
		if (h > ch * 2) {
			top = 33; // Position 1/3 down the screen on large screens
		}

		var elementStyle = {
			top: top + "%",
			left: left + "%",
			transform: "translate(-50%, -50%)"
		};
		Object.assign(this.style, elementStyle);
	}

	close() {
		this.uiManager.closeMenu(this);
		if (this.onClose) this.onClose();
	}

	hide() {
		if (this.node.find(":invalid").length) return;
		// Call the "hide()" function for any immediate children. This will allow nested
		// components to clean themselves up when a dialog is removed from outside of their scope.
		this.node.children().each(function () {
			if (typeof this.hide == "function") this.hide();
		});
		this.active = false;
		if (
			this.uiManager.overlay &&
			this.uiManager.overlay.hasAttribute("cq-active")
		)
			this.uiManager.overlay.removeAttribute("cq-active");
		//this.uiManager.overlay=null;
		for (var attribute in this.activeAttributes) {
			if (this.hasAttribute(attribute)) this.removeAttribute(attribute);
		}
		this.activeAttributes = {};

		// blur any input boxes that are inside the dialog we're closing, to get rid of soft keyboard
		this.node.find("input").each(function () {
			if (this == document.activeElement) this.blur();
		});
	}

	open(params) {
		this.uiManager.openMenu(this, params);
		if (CIQ.I18N && CIQ.I18N.localized)
			CIQ.I18N.translateUI(null, this.node[0]);

		// Capture context to be able to later notify dialog closing in channel
		const { context } = params || {};
		if (!context || !context.config) {
			this.onClose = null;
			return;
		}

		const {
			config: { channels },
			stx
		} = context;
		this.onClose = () => {
			this.channelWrite(channels.dialog || "channel.dialog", {}, stx);
			this.onClose = null;
		};
	}

	resize() {
		var scrollers = this.node.find("cq-scroll");
		scrollers.each(function () {
			if (this.resize) this.resize();
		});
		if (this.params && this.params.x) {
			this.stxContextMenu();
		} else {
			this.center();
		}
	}

	/**
	 * Show the dialog. Use X,Y *screen location* (pageX, pageY from an event) for where to display context menus. If the context menu cannot fit on the screen then it will be adjusted leftward and upward
	 * by enough pixels so that it shows.
	 * @param {object} [params] Parameters
	 * @param  {Boolean} [params.bypassOverlay=false] If true will not display the scrim overlay
	 * @param {Number} [params.x] X location of top left corner. Use for context menus, otherwise dialog will be centered.
	 * @param {Number} [params.y] Y location of top left corner. Use for context menus, otherwise dialog will be centered.
	 * @alias show
	 * @memberof WebComponents.cq-dialog
	 */
	show(params) {
		this.params = params;
		if (!params) params = this.params = {};
		var self = this;
		var context = params.context || CIQ.UI.getMyContext(this);
		if (!this.uiManager.overlay && !params.bypassOverlay) {
			this.uiManager.overlay = document.createElement("cq-dialog-overlay");
			if (context) context.node.append(this.uiManager.overlay);
		}
		self.active = true;
		setTimeout(function () {
			// to get the opacity transition effect
			if (self.uiManager.overlay && !params.bypassOverlay) {
				if (self.uiManager.overlay.getAttribute("cq-active") !== "true")
					self.uiManager.overlay.setAttribute("cq-active", "true");
			}
			self.activeAttributes["cq-active"] = true; // cq-active is what css uses to display the dialog
			for (var attribute in self.activeAttributes) {
				if (self.node.attr(attribute) !== "true")
					self.node.attr(attribute, "true");
			}
			self.resize();
		});

		// Add the theme class to the dialog. It exists outside of the theme context so it will not inherit the theme.
		if (context && context.config && context.config.themes) {
			let themes = Object.keys(context.config.themes.builtInThemes);
			// First remove any existing theme classes on the dialog
			this.classList.remove(...themes);
			let activeTheme = themes.find(
				(r) => context.topNode.classList.contains(r) === true
			);
			// Add the active theme class to the dialog
			if (activeTheme) this.classList.add(activeTheme);
		}
	}

	stxContextMenu() {
		var parent = this.parentElement;
		if (parent.tagName == "BODY") parent = window;
		var gSz = CIQ.guaranteedSize(parent);
		var w = gSz.width;
		var h = gSz.height;
		var outer = CIQ.elementDimensions(this, {
			padding: 1,
			border: 1
		});
		var cw = outer.width;
		var ch = outer.height;
		var left = this.params.x;
		var top = this.params.y;
		var saveAdjustedPosition = false;

		this.node.find("cq-menu.stxMenuActive").each(function () {
			if (this.querySelector(".context-menu-right")) {
				var overlapItemCount = CIQ.UI.$(this).nextAll().length + 1;

				var outerMenu = CIQ.elementDimensions(this, {
					padding: 1,
					border: 1
				});
				var outerContext = CIQ.elementDimensions(
					this.querySelector(".context-menu-right"),
					{ padding: 1, border: 1 }
				);
				cw += outer.width;
				ch += outerContext.height - outerMenu.height * overlapItemCount;
				saveAdjustedPosition = true;
			}
		});

		if (left + cw > w) left = w - cw;
		if (top + ch > h) top = h - ch;
		if (top < 0) top = 0;
		if (saveAdjustedPosition) {
			this.params.x = left;
			this.params.y = top;
		}

		Object.assign(this.style, { top: top + "px", left: left + "px" });
	}

	tap(e) {
		var topMenu = this.uiManager.topMenu();
		if (topMenu === this) {
			e.stopPropagation(); // prevent a tap inside the dialog from closing itself
			return;
		}
		if (!e.currentTarget.active) {
			e.stopPropagation(); // If the dialog we tapped on is closed, then we must have closed it manually. Don't allow a body tap otherwise we'll close two dialogs!
		}
	}
}

CIQ.UI.addComponentDefinition("cq-dialog", Dialog);

};


let __js_webcomponents_doubleSlider_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Double range slider web component `<cq-double-slider>`.
 *
 * A double slider has a thumb (slidable control) at each end of the slider track.
 *
 * This web component is an implementation of a low/high range slider. The left thumb sets the low
 * value of the slider; the right thumb, the high value.
 *
 * The value of the slider is an object specifying the high and low values. The component includes
 * a text readout of the values.
 *
 * **Attributes**
 * - min &mdash; Minimum value of the slider
 * - max &mdash; Maximum value of the slider
 * - low &mdash; Preset value for the left thumb
 * - high &mdash; Preset value for the right thumb
 * - step &mdash; The absolute amount (positive or negative) the movement of a thumb changes a
 *   slider setting
 *
 * See the example below.
 *
 * @namespace WebComponents.cq-double-slider
 * @since 8.3.0
 *
 * @example
 * <cq-item>
 *     Strike <cq-double-slider min="0" max="100" low="20" high="80" step="1"></cq-double-slider>
 * </cq-item>
 */
class DoubleSlider extends CIQ.UI.BaseComponent {
	connectedCallback() {
		if (this.attached) return;
		super.connectedCallback();
		this.init();
	}

	init() {
		this.addDefaultMarkup();
		this.textRange = this.querySelector(".ciq-double-slider-text");
		this.lowSlider = this.querySelector(
			".ciq-double-slider-range[range='low']"
		);
		this.highSlider = this.querySelector(
			".ciq-double-slider-range[range='high']"
		);
		this.backing = this.querySelector("cq-double-slider-range");
		this.name = this.getAttribute("name") || CIQ.uniqueID();
		this.min = Number(this.getAttribute("min")) || 0;
		this.max = Number(this.getAttribute("max")) || 100;
		this.step = Number(this.getAttribute("step")) || 1;
		if (this.hasAttribute("low")) this.low = Number(this.getAttribute("low"));
		if (this.hasAttribute("high"))
			this.high = Number(this.getAttribute("high"));

		this.setBounds(this);
		const self = this;

		function slide(slider, event) {
			let value = slider.value;
			if (event) {
				const touch = event.touches[0];
				const boundingClientRect = self.highSlider.getBoundingClientRect();
				let { height, width } = getComputedStyle(self.highSlider);
				height = parseFloat(height);
				width = parseFloat(width);
				let ratio = 1;
				if (height > width) {
					const boundedOffset = Math.max(
						0,
						Math.min(height, touch.pageY - boundingClientRect.top)
					);
					ratio = boundedOffset / height;
				} else {
					const boundedOffset = Math.max(
						0,
						Math.min(width, touch.pageX - boundingClientRect.left)
					);
					ratio = boundedOffset / width;
				}
				value = self.min + ratio * (self.max - self.min);
			}
			// If we are performing an initial slide, figure out whether we are closer to high or to low
			if (!self.whichSlider) {
				self.whichSlider =
					value * 2 >
					(isNaN(self.high) ? self.max : self.high) +
						(isNaN(self.low) ? self.min : self.low) +
						1
						? self.highSlider
						: self.lowSlider;
			}
			if (self.whichSlider === self.lowSlider) {
				self.low = self.lowSlider.value = Math.min(
					typeof self.high === "undefined" ? self.max : self.high,
					value
				);
			} else if (self.whichSlider === self.highSlider) {
				self.high = self.highSlider.value = Math.max(
					typeof self.low === "undefined" ? self.min : self.low,
					value
				);
			}
			self.setValue(self);
		}

		[this.highSlider, this.lowSlider].forEach((slider) => {
			["mousedown", "pointerdown"].forEach((ev) => {
				slider.addEventListener(ev, (evt) => {
					self.whichSlider = null;
				});
			});
			slider.addEventListener("input", () => slide(slider));
			if (CIQ.touchDevice) {
				slider.addEventListener(
					"touchstart",
					(evt) => {
						self.whichSlider = null;
						self.engaged = true;
						slide(slider, evt);
					},
					{
						passive: false
					}
				);
				slider.addEventListener(
					"touchmove",
					(evt) => {
						if (self.engaged) slide(slider, evt);
					},
					{
						passive: false
					}
				);
				slider.addEventListener(
					"touchend",
					(evt) => {
						self.engaged = false;
					},
					{
						passive: false
					}
				);
			}
		});
	}

	/**
	 * Sets the min, max, and step of the slider.
	 *
	 * @param {object} bounds Contains min, max, and step values.
	 *
	 * @alias setBounds
	 * @memberof WebComponents.cq-double-slider#
	 * @since 8.3.0
	 */
	setBounds(bounds) {
		Array.from(this.querySelectorAll('input[type="range"]')).forEach((el) => {
			["min", "max", "step"].forEach((prop) => {
				if (bounds[prop] || bounds[prop] === 0) {
					el.setAttribute(prop, bounds[prop]);
					this[prop] = bounds[prop];
				}
			});
		});
		this.updateVisual();
	}

	/**
	 * Sets the high and low values of the slider.
	 *
	 * The high and low values are restricted to the range of the max and min.
	 *
	 * @param {object} [data] Contains high and low values.
	 *
	 * @alias setValue
	 * @memberof WebComponents.cq-double-slider#
	 * @since 8.3.0
	 */
	setValue(data) {
		const obj = {};
		if (data) {
			if (typeof data.low !== "undefined")
				obj.low = Math.max(this.min, data.low);
			if (typeof data.high !== "undefined")
				obj.high = Math.min(this.max, data.high);
		}
		if (!CIQ.equals(this.value, obj)) this.value = obj;
		this.low = obj.low;
		this.high = obj.high;
		this.updateVisual();
	}

	/**
	 * Updates the slider view based on the slider attributes.
	 *
	 * @alias updateVisual
	 * @memberof WebComponents.cq-double-slider#
	 * @since 8.3.0
	 */
	updateVisual() {
		this.setAttribute("min", this.min);
		this.setAttribute("max", this.max);
		this.setAttribute("low", this.low);
		this.setAttribute("high", this.high);
		this.setAttribute("step", this.step);

		const style = getComputedStyle(this.textRange);
		const inColor = style.color;
		const outColor = style.borderLeftColor;
		let low = this.low;
		if (isNaN(low) || low < this.min) low = this.min;
		let high = this.high;
		if (isNaN(high) || high > this.max) high = this.max;
		this.lowSlider.value = low;
		this.highSlider.value = high;

		// let input element do the rounding for us
		if (typeof low !== "undefined") low = Number(this.lowSlider.value);
		if (typeof high !== "undefined") high = Number(this.highSlider.value);

		const min = low - this.min;
		const max = high - this.min;
		this.textRange.innerHTML = low + "-" + high;
		const range = this.max - this.min;
		const stop = [(min / range) * 100, (max / range) * 100];
		this.backing.style.background = `linear-gradient(to right,
			${outColor} 0% ${stop[0]}%,
			${inColor} ${stop[0]}% ${stop[1]}%,
			${outColor} ${stop[1]}% 100%)`;
	}
}

DoubleSlider.markup = `
		<cq-double-slider-text class="ciq-double-slider-text"></cq-double-slider-text>
		<cq-double-slider-range class="ciq-double-slider-range"></cq-double-slider-range>
		<input type="range" class="ciq-double-slider-range" range="low">
		<input type="range" class="ciq-double-slider-range" range="high">
`;

CIQ.UI.addComponentDefinition("cq-double-slider", DoubleSlider);

};


let __js_webcomponents_drawingContext_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */




var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Drawing Context Dialog web component `<cq-drawing-context>`.
 * Managed by an instance of {CIQ.UI.DrawingEdit}.
 *
 * @namespace WebComponents.cq-drawing-context
 * @since 6.2.0
 */
class DrawingContext extends CIQ.UI.DialogContentTag {
	/**
	 * Open the context menu as a dialog.
	 *
	 * @param {Object} params
	 * @param {number} params.x used to position the dialog
	 * @param {number} params.y used to position the dialog
	 * @param {CIQ.Drawing} params.drawing sets the `drawing` instance property
	 * @param {CIQ.UI.Context} params.context passed to the components setContext method
	 * @since 6.2.0
	 */
	open(params) {
		this.addDefaultMarkup();
		this.classList.add("ciq-context-menu");

		this.drawing = params.drawing;
		var textEdit = this.node.find("[cq-edit-text]");
		if (this.drawing.edit) {
			textEdit.show();
		} else {
			textEdit.hide();
		}
		return super.open(params);
	}
}

DrawingContext.markup = `
		<div stxtap="DrawingEdit.text()" cq-edit-text>Edit Text</div>
		<div stxtap="DrawingEdit.edit()">Edit Settings</div>
		<div stxtap="DrawingEdit.clone()">Clone Drawing</div>
		<cq-menu stxtap="resize()" cq-close-top="cq-dialog[cq-drawing-context]">
			<cq-menu-dropdown cq-no-scroll="true" class="context-menu-right">
				<cq-item stxtap="DrawingEdit.reorderLayer('top')">Bring to Top</cq-item>
				<cq-item stxtap="DrawingEdit.reorderLayer('up')">Bring Forward</cq-item>
				<cq-item stxtap="DrawingEdit.reorderLayer('down')">Send Backward</cq-item>
				<cq-item stxtap="DrawingEdit.reorderLayer('bottom')">Send to Bottom</cq-item>
			</cq-menu-dropdown>
			<!-- element here so that <cq-menu-dropdown> can keep "top: auto;" -->
			<div>Layer Management<div class="context-button-right-arrow"></div></div>
		</cq-menu>
		<div stxtap="DrawingEdit.remove()">Delete Drawing</div>
	`;
CIQ.UI.addComponentDefinition("cq-drawing-context", DrawingContext);

};


let __js_webcomponents_fibSettingsDialog_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */



var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * fibonacci settings dialog web component `<cq-fib-settings-dialog>`.
 *
 * @namespace WebComponents.cq-fib-settings-dialog
 * @example
  <cq-dialog>
  	<cq-fib-settings-dialog>
  		<h4 class="title">Settings</h4>
  		<cq-scroll cq-no-maximize>
  			<cq-fibonacci-settings>
  				<template cq-fibonacci-setting>
  					<cq-fibonacci-setting>
  						<div class="ciq-heading"></div>
  						<div class="stx-data"></div>
  					</cq-fibonacci-setting>
  				</template>
  			</cq-fibonacci-settings>
  		</cq-scroll>
  		<div class="ciq-dialog-cntrls">
  			<div class="ciq-btn" stxtap="close()">Done</div>
  		</div>
  	</cq-fib-settings-dialog>
  </cq-dialog>
 * @since 3.0.9
 */
class FibSettingsDialog extends CIQ.UI.DialogContentTag {
	/**
	 * Adds a custom fib level
	 * @memberOf WebComponents.cq-fib-settings-dialog
	 * @since 5.2.0
	 */
	add() {
		var level = this.node.find("[cq-custom-fibonacci-setting] input").val();
		if (!level) return;
		level = parseFloat(level) / 100;
		if (isNaN(level)) return;
		var defaultFibs =
			this.context.stx.currentVectorParameters.fibonacci.fibs || [];
		var fib, newFib;
		for (var index = 0; index < defaultFibs.length; index++) {
			fib = defaultFibs[index];
			if (fib.level > level) {
				newFib = CIQ.clone(fib);
				newFib.level = level;
				newFib.display = true;
				if (newFib.parameters) newFib.parameters.opacity = 0.25;
				defaultFibs.splice(index, 0, newFib);
				break;
			}
		}
		if (!newFib) {
			if (defaultFibs.length) fib = CIQ.clone(defaultFibs[0]);
			else
				fib = {
					color: "auto",
					parameters: { pattern: "solid", opacity: 0.25, lineWidth: 1 }
				};
			newFib = CIQ.clone(fib);
			newFib.level = level;
			newFib.display = true;
			defaultFibs.push(newFib);
		}
		this.open();
	}

	/**
	 * Fires a "change" event and closes the dialog.
	 *
	 * @memberOf WebComponents.cq-fib-settings-dialog
	 * @since 6.2.0
	 */
	close() {
		if (this.opener) {
			var event = new Event("change", {
				bubbles: true,
				cancelable: true
			});

			this.opener.dispatchEvent(event);
			this.context.stx.currentVectorParameters.fibonacci.fibsAlreadySet = true;
		}

		super.close();
	}

	/**
	 * Opens the cq-fib-settings-dialog
	 * @param  {Object} params Parameters
	 * @memberOf WebComponents.cq-fib-settings-dialog
	 */
	open(params) {
		this.addDefaultMarkup();
		super.open(params);
		if (params) this.opener = params.caller;
		var vectorParameters = this.context.stx.currentVectorParameters;
		var vectorType = vectorParameters.vectorType;
		var dialog = this.node;

		// fibonacci type
		var parameters;
		if (vectorParameters.fibonacci && vectorType != "fibtimezone") {
			dialog.find(".title").text("Fibonacci Settings");
			var defaultFibs = vectorParameters.fibonacci.fibs || [];
			parameters = dialog.find("cq-fibonacci-settings");
			parameters.children(":not(template)").remove();

			for (var index = 0; index < defaultFibs.length; index++) {
				var fib = defaultFibs[index];

				// no negative values for fibonacci arc
				if (vectorType === "fibarc" && fib.level < 0) continue;

				var newParam = CIQ.UI.makeFromTemplate(
					this.node.find("template"),
					parameters
				);
				var convertPercent = fib.level * 100;
				newParam.find(".ciq-heading").text(convertPercent.toFixed(1) + "%");
				var paramInput = newParam.find("input");

				if (fib.display) {
					paramInput.prop("checked", true);
				}

				this.setChangeEvent(paramInput, "fib", fib.level);
				newParam.find(".stx-data").append(paramInput);
			}
		}
		// settings dialog default
		else {
			dialog.find(".title").text("Settings");

			// clear the existing web components
			parameters = dialog.find("cq-fibonacci-settings");
			parameters.children(":not(template)").remove();
		}
		this.node.find("[cq-custom-fibonacci-setting] input").val("");
	}

	/**
	 * Sets up a handler to process changes to fields
	 * @param {HTMLElement} node    The input field
	 * @param {string} section The section that is being updated
	 * @param {string} name    The name of the field being updated
	 * @memberOf WebComponents.cq-fib-settings-dialog
	 * @private
	 */
	setChangeEvent(node, section, item) {
		var self = this;
		function closure() {
			return function () {
				var vectorParameters = self.context.stx.currentVectorParameters;
				var vectorType = vectorParameters.vectorType;

				// fibonacci type
				if (vectorParameters.fibonacci && vectorType != "fibtimezone") {
					var defaultFibs = vectorParameters.fibonacci.fibs || [];
					if (this.type == "checkbox") {
						for (var index = 0; index < defaultFibs.length; index++) {
							var fib = defaultFibs[index];

							if (fib.level === item) {
								fib.display = this.checked ? true : false;
							}
						}
					}
				}
			};
		}
		node[0].addEventListener("change", closure());
	}
}

FibSettingsDialog.markup = `
		<h4 class="title">Settings</h4>
		<cq-scroll cq-no-maximize>
			<cq-fibonacci-settings>
				<template cq-fibonacci-setting>
					<cq-fibonacci-setting>
						<div class="ciq-heading"></div>
						<div class="stx-data">
							<input type="checkbox">
						</div>
					</cq-fibonacci-setting>
				</template>
			</cq-fibonacci-settings>
			<div cq-custom-fibonacci-setting>
				<input class="ciq-heading" type="text">%
				<div class="ciq-btn stx-data" stxtap="add()">Add</div>
			</div>
		</cq-scroll>
		<div class="ciq-dialog-cntrls">
			<div class="ciq-btn" stxtap="close()">Done</div>
		</div>
	`;
CIQ.UI.addComponentDefinition("cq-fib-settings-dialog", FibSettingsDialog);

};


let __js_webcomponents_floatingWindow_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * The floating window component `cq-floating-window`.
 *
 * Creates a floating window that users can move and resize.
 *
 * @namespace WebComponents.cq-floating-window
 * @since 8.2.0
 */
class FloatingWindow extends CIQ.UI.ContextTag {
	/**
	 * Initializes the context of the floating window component. Dynamically adds a listener for
	 * the "floatingWindow" event based on the `type` parameter of the event (see
	 * [floatingWindowEventListener]{@link CIQ.ChartEngine~floatingWindowEventListener}).
	 *
	 * @param {CIQ.UI.Context} context The chart user interface context.
	 *
	 * @alias setContext
	 * @memberof WebComponents.cq-floating-window#
	 * @since 8.2.0
	 */
	setContext(context) {
		const { stx } = context;
		if (!stx.callbackListeners.floatingWindow) {
			stx.callbackListeners.floatingWindow = [];
		}

		stx.addEventListener("floatingWindow", (message) => {
			const exec = this["on" + CIQ.capitalize(message.type)];
			if (exec) {
				exec.call(this, message);
				return true;
			}
		});
	}

	/**
	 * The listener for "floatingWindow" events where the `type` parameter of the event is
	 * "shortcut" (see
	 * [floatingWindowEventListener]{@link CIQ.ChartEngine~floatingWindowEventListener}).
	 *
	 * Creates and positions a floating window.
	 *
	 * @param {object} params Listener parameters.
	 * @param {string} params.content The contents of the floating window, typically an HTML
	 * 		string.
	 * @param {HTMLElement} [params.container] The DOM element that visually contains the floating
	 * 		window. The window is positioned on screen relative to the element (see
	 * 		{@link WebComponents.cq-floating-window.DocWindow#positionRelativeTo}). Defaults to
	 * 		`document.body`.
	 * @param {string} [params.title] Text that appears in the title bar of the floating window.
	 * @param {number} [params.width] The width of the floating window in pixels.
	 * @param {boolean} [params.status] The state of the floating window: true, to open the
	 * 		window; false, to close it. If the parameter is not provided, the floating window is
	 * 		toggled (opened if closed, closed if open).
	 * @param {string} [params.tag] A label that identifies the floating window type; for example,
	 * 		"shortcut", which indicates that the floating window contains the keyboard shortcuts
	 * 		legend. See the `tag` parameter of
	 * 		[floatingWindowEventListener]{@link CIQ.ChartEngine~floatingWindowEventListener}.
	 * @param {function} [params.onClose] A callback to execute when the floating window is
	 * 		closed.
	 *
	 * @alias onShortcut
	 * @memberof WebComponents.cq-floating-window#
	 * @since 8.2.0
	 */
	onShortcut({ container, title, tag, content, width, status, onClose }) {
		if (this.shortcutWindow) {
			this.shortcutWindow.toggle(status).ensureVisible();
			return;
		}
		this.shortcutWindow = this.constructor.windowImplementation.get({
			tag,
			content: content,
			title,
			container: container || document.body,
			onClose
		});
		this.shortcutWindow.toggle(true).update({ width }).positionRelativeTo();
	}
}

/**
 * The window implementation of the [cq-floating-window]{@link WebComponents.cq-floating-window}
 * web component.
 *
 * @name WebComponents.cq-floating-window.DocWindow
 * @class
 * @since 8.2.0
 */
class DocWindow {
	/**
	 * Creates the floating window DOM element and binds event handlers to the window.
	 *
	 * @param {object} params Constructor parameters.
	 * @param {string} params.content The contents of the floating window, typically an HTML
	 * 		string.
	 * @param {HTMLElement} [params.container] The DOM element that visually contains the floating
	 * 		window. The window is positioned on screen relative to the container element.
	 * @param {string} [params.title] Text that appears in the title bar of the floating window.
	 * @param {string} [params.tag] A label that identifies the floating window type; for example,
	 * 		"shortcut", which indicates that the floating window contains the keyboard shortcuts
	 * 		legend.
	 * @param {number} [params.minWidth] The minimum width of the floating window.
	 * @param {number} [params.minHeight] The minimum height of the floating window.
	 * @param {function} [params.onClose] A callback function to execute when the floating window
	 * 		closes.
	 *
	 * @constructor
	 * @private
	 * @since 8.2.0
	 */
	constructor({
		content,
		title,
		tag,
		minWidth,
		minHeight,
		container,
		onClose
	}) {
		const w = document.createElement("div");
		w.innerHTML = this.constructor.markup;
		w.classList.add("ciq-window");
		document.body.append(w);
		w.tag = tag;
		w.docWindow = this;
		Object.assign(this, {
			isDragging: false,
			isResizing: false,
			isOpen: false,
			xDiff: 0,
			yDiff: 0,
			x: 50,
			y: 50,
			w
		});
		this.bindEvents();

		this.titleEl = w.querySelector(".ciq-window-title");
		this.bodyEl = w.querySelector(".ciq-window-body");
		this.titleBarEl = w.querySelector(".ciq-window-bar");

		this.setProps({ title, content, minWidth, minHeight, container, onClose });
		this.render();
	}

	/**
	 * Stores the function parameters as properties of the floating window object.
	 *
	 * @param {object} params Parameters to store as properties.
	 * @param {string} [params.title] Text that appears in the title bar of the floating window.
	 * @param {string} [params.content] The contents of the floating window, typically an HTML
	 * 		string.
	 * @param {HTMLElement} [params.container] The DOM element that visually contains the floating
	 * 		window. The window is positioned on screen relative to the container element (see
	 * 		[positionRelativeTo]{@link WebComponents.cq-floating-window.DocWindow#positionRelativeTo}).
	 * @param {number} [params.minWidth] The minimum width of the floating window.
	 * @param {number} [params.minHeight] The minimum height of the floating window.
	 * @param {function} [params.onClose] A callback function to execute when the floating windows
	 * 		closes.
	 *
	 * @alias setProps
	 * @memberof WebComponents.cq-floating-window.DocWindow#
	 * @since 8.2.0
	 */
	setProps({ title, content, minWidth, minHeight, container, onClose }) {
		const { w, titleEl, bodyEl } = this;
		if (title !== undefined) titleEl.textContent = title;
		if (content !== undefined) bodyEl.innerHTML = content;
		if (minWidth !== undefined) w.style.minWidth = minWidth + "px";
		if (minHeight !== undefined) w.style.minHeight = minHeight + "px";
		if (container) this.container = container;
		if (onClose !== undefined) this.onClose = onClose;
	}

	/**
	 * Adds event listeners to the floating window.
	 *
	 * The listeners enable the window to be moved, resized, collapsed/expanded, and closed.
	 *
	 * @alias bindEvents
	 * @memberof WebComponents.cq-floating-window.DocWindow#
	 * @since 8.2.0
	 */
	bindEvents() {
		const { w } = this;
		const qs = (path) => w.querySelector(path);

		qs(".ciq-window-bar").addEventListener(
			"mousedown",
			this.onStartDrag.bind(this)
		);

		const toggleCollapse = this.toggleCollapse.bind(this);
		qs(".ciq-window-bar").addEventListener("dblclick", toggleCollapse);
		qs(".ciq-window-collapse").addEventListener("click", toggleCollapse);

		const resizeControls = (
			"top, right, bottom, left, " +
			"top-right, bottom-right, bottom-left, top-left"
		).split(/, /);
		resizeControls.forEach((control) => {
			qs(`.ciq-window-resize-${control}`).addEventListener(
				"mousedown",
				startResize()
			);
		});
		document.addEventListener("mousemove", this.onMouseMove.bind(this));
		document.addEventListener("mouseup", this.onMouseUp.bind(this));

		qs(".ciq-window-close").addEventListener(
			"click",
			this.toggle.bind(this, false)
		);

		window.addEventListener("resize", this.ensureVisible.bind(this));

		const self = this;
		function startResize() {
			return function (e) {
				if (e.button !== 0) return;

				const type = e.target.className.replace(/ciq-window-resize-/, "");
				self.isResizing = type;
				self.downX = e.pageX;
				self.downY = e.pageY;
				self.startWidth = self.width;
				self.startHeight = self.height;
				self.startLeft = self.x;
				self.startTop = self.y;
			};
		}
	}

	/**
	 * Updates properties of the floating window.
	 *
	 * @param {object} params Floating window properties.
	 * @param {number} [params.x] The horizontal position of the floating window in pixels.
	 * @param {number} [params.y] The vertical position of the floating window in pixels.
	 * @param {number} [params.width] The width of the floating window in pixels.
	 * @param {number} [params.height] The height of the floating window in pixels.
	 *
	 * @alias update
	 * @memberof WebComponents.cq-floating-window.DocWindow#
	 * @since 8.2.0
	 */
	update({ x, y, width, height }) {
		Object.assign(this, { x, y, width, height });
		this.render();
		return this;
	}

	/**
	 * Positions the floating window relative to the
	 * <a href="https://developer.mozilla.org/en-US/docs/Web/API/DOMRect" target="_blank">
	 * DOMRect</a> of a DOM element.
	 *
	 * @param {object} params Positioning parameters.
	 * @param {HTMLElement} [params.container] The DOM element relative to which the floating
	 * 		window is positioned. Defaults to the `container` parameter of the
	 * 		[floatingWindowEventListener]{@link CIQ.ChartEngine~floatingWindowEventListener} or,
	 * 		if the `container` parameter is not available, `document.body`.
	 * @param {string} [params.location="center"] The location of the floating window within the
	 * 		container element's bounding rectangle. If the value is "center" (the default), the
	 * 		floating window is centered horizontally and vertically within the container
	 * 		rectangle. Otherwise, the window is positioned in the upper left corner of the
	 * 		rectangle.
	 *
	 * @alias positionRelativeTo
	 * @memberof WebComponents.cq-floating-window.DocWindow#
	 * @since 8.2.0
	 */
	positionRelativeTo({ container, location = "center" } = {}) {
		const { x, y, width, height } = (
			container ||
			this.container ||
			document.body
		).getBoundingClientRect();

		if (this.width > width - 20) this.width = width - 20;
		if (this.height > height - 20) this.height = height - 20;

		if (location === "center") {
			this.x = x + width / 2 - this.width / 2;
			this.y = y + height / 2 - this.height / 2;
		}

		this.render();
		return this;
	}

	/**
	 * Repositions the floating window (if necessary) when the display is resized to keep the
	 * window within the document view.
	 *
	 * @alias ensureVisible
	 * @memberof WebComponents.cq-floating-window.DocWindow#
	 * @since 8.2.0
	 */
	ensureVisible() {
		if (!this.isOpen) return;
		const { x, y, width } = this.w.getBoundingClientRect();
		const { innerWidth, innerHeight } = window;

		if (y > innerHeight - 20) {
			this.y = innerHeight - 20;
		}
		if (x > innerWidth - width) {
			this.x = innerWidth - width;
		}
		this.render();
	}

	/**
	 * Renders the position updates and open/close, dragging, and resizing state changes made to
	 * the floating window by other methods of this class.
	 *
	 * @alias render
	 * @memberof WebComponents.cq-floating-window.DocWindow#
	 * @private
	 * @since 8.2.0
	 */
	render() {
		const { x, y } = this;
		Object.assign(this.w.style, {
			display: this.isOpen ? "" : "none",
			transform: "translate(" + x + "px, " + y + "px)"
		});
		this.w.classList.toggle(
			"ciq-wdragging",
			this.isDragging || this.isResizing
		);
	}

	get width() {
		return this.w.offsetWidth;
	}
	set width(value) {
		if (value) {
			this.w.style.width = value + "px";
		}
	}

	get height() {
		return this.w.offsetHeight;
	}
	set height(value) {
		if (value) {
			this.w.style.height = value + "px";
		}
	}

	/**
	 * Helper function that constrains the floating window to the document view when the window
	 * is dragged horizontally.
	 *
	 * Clamps the horizontal position of the floating window between 0 (so the window cannot be
	 * dragged off the left side of the view) and the width of the document view minus the width
	 * of the floating window (so the window cannot be dragged off the right side of the view).
	 *
	 * @param {number} value The position of the mouse relative to the left edge of the floating
	 * 		window.
	 * @return {number} The value for the clamped horizontal position of the floating window:
	 * - `value` if `value` is greater than 0 and less than the width of the document view minus
	 * the width of the floating window
	 * - 0 if `value` is less than 0
	 * - The width of the document view minus the width of the floating window if `value` is
	 * greater than the width of the document view minus the width of the floating window
	 *
	 * @alias clampX
	 * @memberof WebComponents.cq-floating-window.DocWindow#
	 * @since 8.2.0
	 */
	clampX(value) {
		return Math.min(Math.max(value, 0), window.innerWidth - this.w.offsetWidth);
	}

	/**
	 * Helper function that constrains the floating window to the document view when the window
	 * is dragged vertically.
	 *
	 * Clamps the vertical position of the floating window between 0 (so the window cannot be
	 * dragged off the top of the view) and the height of the document view minus the height of
	 * the floating window title bar and a margin (so the window title bar cannot be dragged off
	 * the bottom of the view).
	 *
	 * @param {number} n The position of the mouse relative to the top edge of the floating window.
	 * @return {number} The value for the clamped vertical position of the floating window:
	 * - `n` if `n` is greater than 0 and less than the height of the document view minus the
	 * height of the floating window title bar and margin
	 * - 0 if `n` is less than 0
	 * - The height of the document view minus the height of the floating window title bar and
	 * margin if `n` is greater than the height of the document view minus the height of the
	 * floating window title bar and margin
	 *
	 * @alias clampY
	 * @memberof WebComponents.cq-floating-window.DocWindow#
	 * @since 8.2.0
	 */
	clampY(n) {
		const margin = 8;
		return Math.min(
			Math.max(n, 0),
			window.innerHeight - this.titleBarEl.offsetHeight - margin
		);
	}

	/**
	 * The event listener for mouse move events that occur when a floating window is being dragged
	 * or resized.
	 *
	 * Moves or resizes the floating window.
	 *
	 * @param {MouseEvent} e The
	 * 		<a href="https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent" target="_blank">
	 * 		mouse event</a> object.
	 *
	 * @alias onMouseMove
	 * @memberof WebComponents.cq-floating-window.DocWindow#
	 * @since 8.2.0
	 */
	onMouseMove(e) {
		const { isDragging, isResizing } = this;

		if (!isDragging && !isResizing) return;

		const xDiff = e.pageX - this.downX;
		const yDiff = e.pageY - this.downY;

		if (isDragging) {
			this.x = this.clampX(xDiff);
			this.y = this.clampY(yDiff);
		}
		const { startWidth, startHeight } = this;
		const margin = 2;
		let height, width;

		if (/left/.test(isResizing)) {
			width = this.startWidth - xDiff;
			this.width = width;
			this.x = this.startLeft + xDiff;
		}

		if (/top/.test(isResizing)) {
			height = this.startHeight - yDiff;
			this.height = height;
			this.y = this.startTop + yDiff;
		}

		if (isResizing && /right|bottom/.test(isResizing)) {
			this.width = /right/.test(isResizing)
				? xDiff + startWidth
				: width || startWidth;

			this.height = /bottom/.test(isResizing)
				? yDiff + startHeight
				: height || startHeight;

			if (this.x + this.width - margin > window.innerWidth) {
				this.width = window.innerWidth - this.x - margin;
			}
			if (this.y + this.height - margin > window.innerHeight) {
				this.height = window.innerHeight - this.y - margin;
			}
		}

		this.render();
	}

	/**
	 * The event listener for mouse down events that occur on the floating window's title bar.
	 *
	 * The mouse down event starts a click-and-drag action on the floating window.
	 *
	 * @param {MouseEvent} e The
	 * 		<a href="https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent" target="_blank">
	 * 		mouse event</a> object.
	 *
	 * @alias onStartDrag
	 * @memberof WebComponents.cq-floating-window.DocWindow#
	 * @since 8.2.0
	 */
	onStartDrag(e) {
		if (e.button !== 0) return;

		this.isDragging = true;
		this.downX = e.pageX - this.x;
		this.downY = e.pageY - this.y;
	}

	/**
	 * The event listener for mouse up events that occur on a floating window.
	 *
	 * Stops a dragging or resizing action of the floating window.
	 *
	 * @alias onMouseUp
	 * @memberof WebComponents.cq-floating-window.DocWindow#
	 * @since 8.2.0
	 */
	onMouseUp() {
		this.isDragging = false;
		this.isResizing = false;
		this.render();
	}

	/**
	 * Opens and closes the floating window.
	 *
	 * @param {boolean} [value] If true, the floating window is opened. If false, the
	 * 		floating window is closed. If undefined, the floating window is toggled; that is,
	 * 		opened if it is currently closed, closed if it is currently open.
	 *
	 * @alias toggle
	 * @memberof WebComponents.cq-floating-window.DocWindow#
	 * @since 8.2.0
	 */
	toggle(value) {
		const newValue = value === undefined ? !this.isOpen : value;
		const changed = this.isOpen === newValue;
		this.isOpen = newValue;
		if (changed && !this.isOpen && this.onClose) this.onClose();
		this.render();
		return this;
	}

	/**
	 * Toggles the display state &mdash; expanded or collapsed &mdash; of the floating window.
	 *
	 * In the expanded state, the full floating window is displayed; in the collapsed state, just
	 * the floating window title bar.
	 *
	 * @alias toggleCollapse
	 * @memberof WebComponents.cq-floating-window.DocWindow#
	 * @since 8.2.0
	 */
	toggleCollapse() {
		this.isCollapsed = !this.isCollapsed;
		if (this.isCollapsed) {
			this.prevHeight = this.height;
			this.w.classList.add("ciq-window-collapsed");
			this.height = this.titleBarEl.offsetHeight;
			if (this.onCollapse) this.onCollapse();
		} else {
			this.height = this.prevHeight;
			this.w.classList.remove("ciq-window-collapsed");
		}
		const collapseEl = this.w.querySelector(".ciq-window-collapse");
		collapseEl.title = this.isCollapsed ? "Expand" : "Collapse";
		this.render();
	}
}

DocWindow.markup = `
<div class="ciq-window-bar" title="Drag to reposition. Double click to collapse">
<div class="ciq-window-title"></div>
<span class="ciq-window-collapse" title="Collapse"></span>
<span class="ciq-window-close" title="Click to close">
</span>
</div>
<div class="ciq-window-body"></div>
<div class="ciq-window-resize-left"></div>
<div class="ciq-window-resize-top"></div>
<div class="ciq-window-resize-right"></div>
<div class="ciq-window-resize-bottom"></div>
<div class="ciq-window-resize-bottom-right"></div>
<div class="ciq-window-resize-bottom-left"></div>
<div class="ciq-window-resize-top-left"></div>
<div class="ciq-window-resize-top-right"></div>
`;

/**
 * Gets a floating window instance.
 *
 * If the `tag` parameter is provided, the function checks whether the document already contains
 * a floating window with that tag. If so, the function parameters are stored as properties of the
 * floating window object (see
 * [setProps]{@link WebComponents.cq-floating-window.DocWindow#setProps}), and a reference to the
 * floating window is returned. Otherwise, the function returns a new floating window created with
 * the provided parameters.
 *
 * **Note:** Tags can be used to manage floating windows in multi-chart documents. For more
 * information, see the `tag` parameter of
 * [floatingWindowEventListener]{@link CIQ.ChartEngine~floatingWindowEventListener}.
 *
 * @param {object} params Floating window parameters.
 * @param {string} params.content The contents of the floating window, typically an HTML string.
 * @param {HTMLElement} [params.container] The DOM element that visually contains the floating
 * 		window. The floating window is positioned on screen relative to the container element (see
 * 		[positionRelativeTo]{@link WebComponents.cq-floating-window.DocWindow#positionRelativeTo}).
 * @param {string} [params.title] Text that appears in the title bar of the floating window.
 * @param {string} [params.tag] A label that identifies the floating window type; for example,
 * 		"shortcut", which indicates that the floating window contains the chart keyboard shortcuts
 * 		legend.
 * @param {number} [params.minWidth] The minimum width of the floating window.
 * @param {number} [params.minHeight] The minimum height of the floating window.
 * @param {function} [params.onClose] A callback function to execute when the floating window
 * 		closes.
 * @return {object} A [DocWindow]{@link WebComponents.cq-floating-window.DocWindow} instance.
 *
 * @alias get
 * @memberof WebComponents.cq-floating-window.DocWindow
 * @static
 * @since 8.2.0
 */
DocWindow.get = function (params) {
	let w;
	if (params.tag) {
		w = Array.from(document.querySelectorAll(".ciq-window")).find(
			(el) => el.tag === params.tag
		);
		if (w) {
			w.docWindow.setProps(params);
			return w.docWindow;
		}
	}
	return new this(params);
};

/**
 * A reference to the class that implements the floating window.
 *
 * @alias windowImplementation
 * @memberof WebComponents.cq-floating-window#
 * @default [DocWindow]{@link WebComponents.cq-floating-window.DocWindow}
 * @since 8.2.0
 */
FloatingWindow.windowImplementation = DocWindow;

CIQ.UI.addComponentDefinition("cq-floating-window", FloatingWindow);

};


let __js_webcomponents_gridSizePicker_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Creates a `<cq-grid-size-picker>` web component.
 *
 * Attributes:
 * <ul>
 * 	<li>maxrows: number &mdash; Maximum number of rows allowed</li>
 * 	<li>maxcols: number &mdash; Maximum number of columns allowed</li>
 * </ul>
 * 
 * Please note that this web component uses 'Symbol' and 'Symbol.Iterator' to create the table dynamically.
 * This syntax is not supported on older browsers such as in IE 11 or Chrome 49.
 *
 * @namespace WebComponents.cq-grid-size-picker
 * @example
      <cq-grid-size-picker maxrows="5" maxcols="5"></cq-grid-size-picker>
 * @since 7.2.0
 */
class GridSizePicker extends CIQ.UI.BaseComponent {
	connectedCallback() {
		if (this.attached) return;
		this.innerHTML = this.render();
		this.generateTable(2, 2);
		this.highlightTable(1, 1);
	}

	get maxcols() {
		return this.getAttribute("maxcols") || 4;
	}

	set maxcols(newValue) {
		this.setAttribute("maxcols", newValue);
	}

	get maxrows() {
		return this.getAttribute("maxrows") || 4;
	}

	set maxrows(newValue) {
		this.setAttribute("maxrows", newValue);
	}

	generateTable(columns, rows) {
		var self = this;
		function mouseEnterFcn(event) {
			// Clamp the rows and cols to their max setting before generating the new table
			let newColCt = parseInt(event.target.dataset.column) + 1;
			if (newColCt > self.maxcols) newColCt = self.maxcols;
			let newRowCt = parseInt(event.target.dataset.row) + 1;
			if (newRowCt > self.maxrows) newRowCt = self.maxrows;

			self.generateTable(newColCt, newRowCt);
			// Hilite based on the selected cell, not the expected grid size
			self.highlightTable(
				parseInt(event.target.dataset.column),
				parseInt(event.target.dataset.row)
			);
		}

		let parentElem = this.querySelector("table");

		if (!parentElem) return;
		// Clear out the existing table
		this.cleanTable(columns, rows);

		columns = columns || 1;
		rows = rows || 1;

		for (let idx = 1; idx <= rows; idx++) {
			let tmpRow;
			if (parentElem.childNodes[idx - 1]) {
				tmpRow = parentElem.childNodes[idx - 1];
			} else {
				tmpRow = document.createElement("tr");
				parentElem.appendChild(tmpRow);
			}
			for (let jdx = 1; jdx <= columns; jdx++) {
				if (!tmpRow.childNodes[jdx - 1]) {
					let tmpCell = document.createElement("td");
					tmpCell.dataset.row = idx;
					tmpCell.dataset.column = jdx;
					tmpCell.dataset.rows = rows;
					tmpCell.dataset.columns = columns;
					tmpCell.addEventListener("mouseenter", mouseEnterFcn);
					tmpCell.addEventListener(
						"click",
						function (event) {
							this.triggerUpdateGridEvent(
								event.target.dataset.column,
								event.target.dataset.row
							);
						}.bind(this)
					);

					tmpCell.appendChild(document.createElement("div"));

					tmpRow.appendChild(tmpCell);
				}
			}
		}
	}

	triggerUpdateGridEvent(columns, rows) {
		document.querySelector("body").dispatchEvent(
			new CustomEvent("update-grid", {
				detail: {
					columns: columns,
					rows: rows
				},
				bubbles: true,
				composed: true
			})
		);
	}

	highlightTable(columns, rows) {
		for (let gridCell of this.querySelectorAll("td")) {
			if (gridCell.dataset.column <= columns && gridCell.dataset.row <= rows) {
				gridCell.classList.add("highlight");
			} else {
				gridCell.classList.remove("highlight");
			}
		}
		this.querySelector(".row.count").innerHTML = rows;
		this.querySelector(".column.count").innerHTML = columns;
	}

	cleanTable(columns, rows) {
		let element = this.querySelector("table");
		// Remove unused rows
		while (element.childNodes.length > rows) {
			element.removeChild(element.lastChild);
		}
		// Remove unused columns from remaining rows
		for (let rowNode of element.childNodes) {
			while (rowNode.childNodes.length > columns) {
				rowNode.removeChild(rowNode.lastChild);
			}
		}
	}

	render() {
		return `
				<style>
					cq-grid-size-picker, cq-grid-size-picker tr, cq-grid-size-picker td{
						display: block;
					}

					cq-grid-size-picker tr{
						margin: 0;
						padding: 0;
						white-space: nowrap;
						line-height: 0;
					}

					cq-grid-size-picker td{
						display: inline-block;
						height: 19px;
						width: 19px;
						margin: 0;
						padding: 0;
						text-align: center;
					}

					cq-grid-size-picker td div{
						pointer-events: none;
						display: inline-block;
						height: 15px;
						width: 15px;
						margin: 2px;
						padding: 0;
						border: solid 1px #ccc;
						border-color: var(--grid-size-border-color, #ccc);
						background: #eee; /* keep a hard coded style in case the var function is unavailable */
						background-color: var(--grid-size-background-color, #eee);
						text-align: center;
					}

					cq-grid-size-picker td:hover div, cq-grid-size-picker td.highlight div{
						border-color: #666;
						border-color: var(--grid-size-border-hl-color, #666);
						background: #ccc;
						background-color: var(--grid-size-background-hl-color, #ccc);
					}

					cq-grid-size-picker p{
						width:100%;
						line-height: 1em;
						text-align: center;
						margin: 5px 0;
					}

					cq-grid-size-picker .multiply{
						transform: rotate(45deg);
						display: inline-block;
					}
				</style>

				<table class="grid-size-picker"></table>
				<p><span class="row count">1</span> <span class="multiply">+</span> <span class="column count">1</span></p>
			`;
	}
}

CIQ.UI.addComponentDefinition("cq-grid-size-picker", GridSizePicker);

};


let __js_webcomponents_heading_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Menu web component `<cq-heading>`.
 *
 * Attribute cq-filter adds input for filtering cq-items in
 * cq-heading sibling container based on entered input.
 * Filter is matching input pattern anywhere in cq-item text.
 *
 * Attribute value passed in cq-filter is used for input placeholder.
 * Default placeholder is set to "Search"
 *
 * Attribute cq-filter-min can be used to override the default minimum
 * number of records for filter to show.  The default is 15.
 *
 * @namespace WebComponents.cq-menu-item-filter
 * @example
 * <!-- default "Search" input placeholder -->
 * <cq-heading cq-filter>Studies</cq-heading>
 *
 * <!-- "Filter" placeholder -->
 * <cq-heading cq-filter="Filter">Studies</cq-heading>
 *
 * <!-- No visible placeholder, minimum length for filter set to 20 -->
 * <cq-heading cq-filter=" " cq-filter-min=20>Studies</cq-heading>
 */
class Heading extends CIQ.UI.ContextTag {
	setContext() {
		if (!this.hasAttribute("cq-filter")) return;

		const filter = this.getAttribute("cq-filter") || "Search";
		this.createFilter(filter);
	}

	createFilter(placeholder) {
		const searchWrapper = document.createElement("div");
		searchWrapper.classList.add("searchFilter");
		this.appendChild(searchWrapper);
		const input = document.createElement("input");
		input.type = "search";
		input.placeholder = placeholder;
		searchWrapper.appendChild(input);
		this.searchWrapper = searchWrapper;

		const itemContainer = this.nextElementSibling;

		const updateListVisibility = ({ target: { value } }) => {
			const re = new RegExp(value, "i");

			this.qsa("cq-item", itemContainer).forEach((el) => {
				const visibilityAction =
					value && !re.test(el.textContent) ? "add" : "remove";
				el.classList[visibilityAction]("item-hidden");
			});
		};
		input.addEventListener("input", updateListVisibility);
		input.addEventListener("keyup", updateListVisibility);

		const minItemCount = this.getAttribute("cq-filter-min") || 15;

		const showFilterIfNecessary = () => {
			const itemCount = this.qsa("cq-item", itemContainer).length;
			searchWrapper.classList[itemCount > minItemCount ? "add" : "remove"](
				"active"
			);
		};

		// Delay the execution of the filter activation check until sibling child nodes
		// have been created providing reference to the need for filter
		// based on cq-filter-min setting
		if (typeof MutationObserver === undefined) {
			searchWrapper.classList.add("active");
			return;
		}
		new MutationObserver(showFilterIfNecessary).observe(this.parentElement, {
			childList: true,
			subtree: true
		});

		showFilterIfNecessary();
	}
}
CIQ.UI.addComponentDefinition("cq-heading", Heading);

};


let __js_webcomponents_headsupDynamic_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * The dynamic heads up display web component `<cq-hu-dynamic>`.
 *
 * An encapsulation of the markup of a dynamic heads up display.
 *
 * @namespace WebComponents.cq-hu-dynamic
 * @since 7.5.0
 *
 * @example
 * <cq-hu-dynamic>
 *     <svg version="1.1" x="0px" y="0px" viewBox="0 0 215 140" enableBackground="new 0 0 215 140">
 *         <defs>
 *             <filter id="ciq-hu-shadow" height="130%">
 *                 <feGaussianBlur in="SourceAlpha" stdDeviation="1"></feGaussianBlur>
 *                 <feOffset dx="0" dy="1" result="offsetblur"></feOffset>
 *                 <feComponentTransfer>
 *                     <feFuncA type="linear" slope="0.2"></feFuncA>
 *                 </feComponentTransfer>
 *                 <feMerge>
 *                     <feMergeNode></feMergeNode>
 *                     <feMergeNode in="SourceGraphic"></feMergeNode>
 *                 </feMerge>
 *             </filter>
 *         </defs>
 *         <polygon
 *             class="ciq-hu-bg" style="stroke-width: 1;"
 *             points="198.4,124.4 1,124.4 1,1 214,1 214,137.8"
 *             filter="url(#ciq-hu-shadow)"
 *             />
 *         <path class="ciq-hu-stroke"
 *             fill="#398DFF"
 *             d="M213,2v133.6l-13.7-11.8l-0.6-0.5H198H2V2H213 M215,0H0v125.4h198l17,14.6V0L215,0z">
 *         </path>
 *     </svg>
 *     <div>
 *         <cq-hu-col1>
 *             <cq-hu-date></cq-hu-date>
 *             <cq-hu-price></cq-hu-price>
 *             <cq-volume-grouping>
 *                 <div>Volume</div>
 *                 <div><cq-volume-visual></cq-volume-visual></div>
 *                 <div><cq-hu-volume></cq-hu-volume><cq-volume-rollup></cq-volume-rollup></div>
 *             </cq-volume-grouping>
 *         </cq-hu-col1>
 *         <cq-hu-col2>
 *             <div>Open</div><cq-hu-open></cq-hu-open>
 *             <div>Close</div><cq-hu-close></cq-hu-close>
 *             <div>High</div><cq-hu-high></cq-hu-high>
 *             <div>Low</div><cq-hu-low></cq-hu-low>
 *         </cq-hu-col2>
 *     </div>
 * </cq-hu-dynamic>
 */
class HeadsUpDynamic extends CIQ.UI.ContextTag {
	/**
	 * Creates an instance of {@link CIQ.UI.HeadsUp}. Subscribes to the `headsUp` channel
	 * which provides messages to start and stop the marker.
	 *
	 * @param {CIQ.UI.Context} context The chart user interface context.
	 *
	 * @alias setContext
	 * @memberof WebComponents.cq-hu-dynamic
	 * @since 7.5.0
	 */
	setContext(context) {
		this.addDefaultMarkup();
		const UIHeadsUpDynamic = new CIQ.UI.HeadsUp(this, context, {
			followMouse: true,
			autoStart: false
		});

		let headsUp =
			context.config && context.config.channels
				? context.config.channels.headsUp
				: "layout.headsUp";
		this.channelSubscribe(headsUp, (value) => {
			UIHeadsUpDynamic[
				value === "dynamic" || (value || {}).dynamic ? "begin" : "end"
			]();
		});
	}
}

HeadsUpDynamic.markup = `
		<svg version="1.1" x="0px" y="0px" viewBox="0 0 215 140" enableBackground="new 0 0 215 140">
			<defs>
				<filter id="ciq-hu-shadow" height="130%">
					<feGaussianBlur in="SourceAlpha" stdDeviation="1"></feGaussianBlur>
					<feOffset dx="0" dy="1" result="offsetblur"></feOffset>
					<feComponentTransfer>
						<feFuncA type="linear" slope="0.2"></feFuncA>
					</feComponentTransfer>
					<feMerge>
						<feMergeNode></feMergeNode>
						<feMergeNode in="SourceGraphic"></feMergeNode>
					</feMerge>
				</filter>
			</defs>
			<polygon
				class="ciq-hu-bg" style="stroke-width: 1;"
				points="198.4,124.4 1,124.4 1,1 214,1 214,137.8"
				filter="url(#ciq-hu-shadow)"
				/>
			<path class="ciq-hu-stroke"
				fill="#398DFF"
				d="M213,2v133.6l-13.7-11.8l-0.6-0.5H198H2V2H213 M215,0H0v125.4h198l17,14.6V0L215,0z">
			</path>
		</svg>
		<div>
			<cq-hu-col1>
				<cq-hu-date></cq-hu-date>
				<cq-hu-price></cq-hu-price>
				<cq-volume-grouping>
					<div>Volume</div>
					<div><cq-volume-visual></cq-volume-visual></div>
					<div><cq-hu-volume></cq-hu-volume><cq-volume-rollup></cq-volume-rollup></div>
				</cq-volume-grouping>
			</cq-hu-col1>
			<cq-hu-col2>
				<div>Open</div><cq-hu-open></cq-hu-open>
				<div>Close</div><cq-hu-close></cq-hu-close>
				<div>High</div><cq-hu-high></cq-hu-high>
				<div>Low</div><cq-hu-low></cq-hu-low>
			</cq-hu-col2>
		</div>
	`;
CIQ.UI.addComponentDefinition("cq-hu-dynamic", HeadsUpDynamic);

};


let __js_webcomponents_headsupStatic_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * The static heads up display web component `<cq-hu-static>`.
 *
 * An encapsulation of the markup of a static heads up marker. The static heads up marker does
 * not follow the mouse cursor.
 *
 * @namespace WebComponents.cq-hu-static
 * @since 7.5.0
 *
 * @example
 * <cq-hu-static>
 *     <div>
 *         <div>Price</div><cq-hu-price></cq-hu-price>
 *         <div>Open</div><cq-hu-open></cq-hu-open>
 *         <div>Close</div><cq-hu-close></cq-hu-close>
 *     </div>
 *     <div>
 *         <div>Vol</div>
 *         <cq-volume-section>
 *             <cq-hu-volume></cq-hu-volume>
 *             <cq-volume-rollup></cq-volume-rollup>
 *         </cq-volume-section>
 *         <div>High</div><cq-hu-high></cq-hu-high>
 *         <div>Low</div><cq-hu-low></cq-hu-low>
 *     </div>
 * </cq-hu-static>
 */
class HeadsUpStatic extends CIQ.UI.ContextTag {
	/**
	 * Creates an instance of {@link CIQ.UI.HeadsUp}. Subscribes to the `headsUp` channel
	 * which provides messages to start and stop the marker.
	 *
	 * @param {CIQ.UI.Context} context The chart user interface context.
	 *
	 * @alias setContext
	 * @memberof WebComponents.cq-hu-static
	 * @since 7.5.0
	 */
	setContext(context) {
		this.addDefaultMarkup();
		const UIHeadsUpStatic = new CIQ.UI.HeadsUp(this, context, {
			autoStart: true
		});

		let headsUp =
			context.config && context.config.channels
				? context.config.channels.headsUp
				: "layout.headsUp";
		this.channelSubscribe(headsUp, (value) => {
			UIHeadsUpStatic[
				value === "static" || (value || {}).static ? "begin" : "end"
			]();
		});
	}
}

HeadsUpStatic.markup = `
		<div>
			<div>Price</div><cq-hu-price></cq-hu-price>
			<div>Open</div><cq-hu-open></cq-hu-open>
			<div>Close</div><cq-hu-close></cq-hu-close>
		</div>
		<div>
			<div>Vol</div>
			<cq-volume-section>
				<cq-hu-volume></cq-hu-volume>
				<cq-volume-rollup></cq-volume-rollup>
			</cq-volume-section>
			<div>High</div><cq-hu-high></cq-hu-high>
			<div>Low</div><cq-hu-low></cq-hu-low>
		</div>
	`;
CIQ.UI.addComponentDefinition("cq-hu-static", HeadsUpStatic);

};


let __js_webcomponents_infoToggle_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */




var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * The information toggle web component `<cq-info-toggle>`.
 *
 * Provides toggle management for the three-state heads-up display.
 *
 * By default, the component toggles among three states: `dynamic`, `static`, and `null` (off).
 * States are changed using the `cq-toggles` attribute which can have any of the three toggle
 * values: `dynamic`, `static`, or `null`.
 *
 * The component appends a [cq-hu-dynamic]{@link WebComponents.cq-hu-dynamic} or
 * [cq-hu-static]{@link WebComponents.cq-hu-static} element to the top node of the chart
 * context if one is required and not already present.
 *
 * The info toggle is mobile and crosshairs aware and can change the toggle state to
 * accommodate both conditions; for example, if the crosshairs are active or the chart is on a
 * mobile device, the component automatically makes the heads-up display static.
 *
 * @namespace WebComponents.cq-info-toggle
 * @since 7.5.0
 *
 * @example
 * <cq-toggle
 *     class="ciq-HU"
 *     cq-member="headsUp",
 *     cq-toggles="dynamic,static,null">
 *     <span></span>
 *     <cq-tooltip>Info</cq-tooltip>
 * </cq-toggle>
 */
class InfoToggle extends CIQ.UI.ContextTag {
	/**
	 * Adds the default markup. Sets the toggle tooltip. Subscribes to the `headsUp` and
	 * `crosshair` channels. Appends a [cq-hu-dynamic]{@link WebComponents.cq-hu-dynamic} or
	 * [cq-hu-static]{@link WebComponents.cq-hu-static} element to the top node of the chart
	 * context if one is not already attached.
	 *
	 * @param {CIQ.UI.Context} context The chart user interface context.
	 *
	 * @alias setContext
	 * @memberof WebComponents.cq-info-toggle
	 * @since 7.5.0
	 */
	setContext(context) {
		let markup = this.constructor.markup;
		const toggles = this.getAttribute("cq-toggles");
		if (toggles) {
			markup = markup.replace(/dynamic,static,null/, toggles);
		}

		this.addDefaultMarkup(this, markup);
		this.tooltip = this.querySelector("cq-tooltip");

		let channels = context.config
			? context.config.channels
			: {
					headsUp: "layout.headsUp",
					crosshair: "layout.crosshair"
			  };
		this.channelSubscribe(channels.headsUp, () => this.applyValues(channels));

		this.channelSubscribe(channels.crosshair, (value) => {
			if (
				(CIQ.isMobile || value) &&
				this.channelRead(channels.headsUp) === "dynamic"
			) {
				setTimeout(() => this.channelWrite(channels.headsUp, "static"));
			}
		});

		this.initInfoComponents(context);
	}

	/**
	 * Sets a tooltip on the toggle.
	 *
	 * @param {String} value The text of the tooltip, which is appended to the string "Info ".
	 * 		If a value is not provided, the tooltip is "Info off".
	 *
	 * @alias setTooltip
	 * @memberof WebComponents.cq-info-toggle
	 * @since 7.5.0
	 */
	setTooltip(value) {
		const {
			context: { stx },
			tooltip
		} = this;
		tooltip.innerText = stx.translateIf(`Info ${value ? value : "off"}`);
	}

	/**
	 * Appends a [cq-hu-dynamic]{@link WebComponents.cq-hu-dynamic} or
	 * [cq-hu-static]{@link WebComponents.cq-hu-static} element to the top node of the chart
	 * context if one is not already present.
	 *
	 * @param {CIQ.UI.Context} context The chart user interface context.
	 *
	 * @alias initInfoComponents
	 * @memberof WebComponents.cq-info-toggle
	 * @since 7.5.0
	 */
	initInfoComponents(context) {
		const toggles = this.querySelector("cq-toggle").getAttribute("cq-toggles");
		["dynamic", "static"].forEach(function (i) {
			if (new RegExp(i).test(toggles)) {
				if (!context.topNode.querySelector(`cq-hu-${i}`)) {
					const hu = document.createElement(`cq-hu-${i}`);
					context.topNode.append(hu);
				}
			}
		});
	}

	/**
	 * Sets the toggle state to `static` if on a mobile device or the crosshairs are active.
	 * If on a mobile device and the toggle state is `static`, activates the crosshairs.
	 *
	 * @param {Object} channels The web component communication channels.
	 *
	 * @alias applyValues
	 * @memberof WebComponents.cq-info-toggle
	 * @since 7.5.0
	 */
	applyValues(channels) {
		const crosshair = this.channelRead(channels.crosshair);
		const headsUp = this.channelRead(channels.headsUp);

		if (headsUp === "dynamic" && (crosshair || CIQ.isMobile)) {
			// The dynamic headsUp doesn't make any sense on mobile devices or with crosshair
			// setting the toggle to "static"
			setTimeout(() => this.channelWrite(channels.headsUp, "static"));
		}
		if (CIQ.isMobile && headsUp === "static") {
			setTimeout(() => this.channelWrite(channels.crosshair, true));
		}
		this.setTooltip(headsUp);
	}
}

InfoToggle.markup = `
		<cq-toggle
			class="ciq-HU"
			cq-member="headsUp"
			cq-toggles="dynamic,static,null">
			<span></span>
			<cq-tooltip>Info</cq-tooltip>
		</cq-toggle>
	`;
CIQ.UI.addComponentDefinition("cq-info-toggle", InfoToggle);

};


let __js_webcomponents_infoToggleDropdown_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */




var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * The drop-down toggle web component `<cq-info-toggle-dropdown>`.
 *
 * Provides toggle management for the crosshairs and heads-up display.
 *
 * Typically wraps a [cq-toggle]{@link WebComponents.cq-toggle} component and
 * [cq-menu]{@link WebComponents.cq-menu} component (see the examples below). The
 * [cq-toggle]{@link WebComponents.cq-toggle} web component creates the user interface toggle
 * control, which is similar to a button. The [cq-menu]{@link WebComponents.cq-menu} web component
 * creates a drop-down menu that provides component options. For example, for the heads-up display,
 * the options menu enables activation of either a dynamic callout or floating tooltip; for the
 * crosshairs, activation of a static information display (also referred to as the static heads-up
 * display, or static HUD).
 *
 * The drop-down toggle component appends a <a href="WebComponents.cq-hu-dynamic.html">
 * <code class="codeLink">\<cq-hu-dynamic\></code></a>,
 * `<cq-hu-floating>`, or <a href="WebComponents.cq-hu-static.html">
 * <code class="codeLink">\<cq-hu-static\></code></a> element to the top node of the chart context
 * if one is required and not already present. The elements represent the heads-up dynamic callout,
 * heads-up floating tooltip, and crosshairs static HUD, respectively.
 *
 * The drop-down toggle is mobile aware. On mobile devices, the drop-down menu of the component is
 * hidden, and the following mobile-friendly behavior is set automatically:
 * - The crosshairs drop-down toggle turns the crosshairs and static HUD on and off in unison
 * - The heads-up display drop-down toggle is not available
 *
 * @namespace WebComponents.cq-info-toggle-dropdown
 * @since 8.2.0
 *
 * @example <caption>Heads-up display drop-down toggle:</caption>
 * <cq-info-toggle-dropdown>
 *     <cq-toggle
 *         class="ciq-HU"
 *         cq-member="headsUp">
 *         <span></span>
 *         <cq-tooltip></cq-tooltip> <!-- Tooltip text is added programmatically. -->
 *     </cq-toggle>
 *
 *     <cq-menu class="ciq-menu toggle-options collapse tooltip-ui">
 *         <span></span>
 *         <cq-menu-dropdown>
 *             <cq-item cq-member="headsUp-dynamic">Show Dynamic Callout<span class="ciq-radio"><span></span></span></cq-item>
 *             <cq-item cq-member="headsUp-floating">Show Tooltip<span class="ciq-radio"><span></span></span></cq-item>
 *         </cq-menu-dropdown>
 *     </cq-menu>
 *
 * @example <caption>Crosshairs drop-down toggle:</caption>
 * <cq-info-toggle-dropdown>
 *     <cq-toggle
 *         class="ciq-CH"
 *         cq-member="crosshair">
 *         <span></span>
 *         <cq-tooltip>Crosshair (Alt + \)</cq-tooltip> <!-- Tooltip text is hard coded. -->
 *     </cq-toggle>
 *
 *     <cq-menu class="ciq-menu toggle-options collapse">
 *         <span></span>
 *         <cq-menu-dropdown>
 *             <cq-item cq-member="crosshair">Hide Heads-Up Display<span class="ciq-radio"><span></span></span></cq-item>
 *             <cq-item cq-member="headsUp-static">Show Heads-Up Display<span class="ciq-radio"><span></span></span></cq-item>
 *         </cq-menu-dropdown>
 *     </cq-menu>
 * </cq-info-toggle-dropdown>
 */
class InfoToggleDropdown extends CIQ.UI.ContextTag {
	/**
	 * Sets the status of the drop-down toggle; that is, whether the drop-down toggle is active or
	 * inactive.
	 *
	 * @param {boolean} value The status of the drop-down toggle. If true, the drop-down toggle
	 * is active; if false, inactive.
	 *
	 * @alias set
	 * @memberof WebComponents.cq-info-toggle-dropdown
	 * @since 8.2.0
	 */
	set(value) {
		const { toggleEl, options, selected, stx } = this;
		const { crossX, crossY } = stx.controls;
		const { obj: layout } = toggleEl.params;
		const newLayoutValues = {};

		options.forEach((option) => {
			const [member, type] = option.getAttribute("cq-member").split("-");
			const valueToSet = option === selected && value === true;

			if (type) {
				newLayoutValues[member] = Object.assign(newLayoutValues[member] || {}, {
					[type]: valueToSet
				});
			} else {
				newLayoutValues[member] = valueToSet;
			}
		});

		Object.entries(newLayoutValues).forEach(([key, prop]) => {
			if (typeof prop === "object") {
				// replace reference in order to trigger channelSubscribe
				layout[key] = Object.assign({}, layout[key], prop);
			} else {
				layout[key] = prop;
			}
		});

		if (toggleEl.params.action === "class") {
			toggleEl.classList[value ? "add" : "remove"](toggleEl.params.value);
		}

		toggleEl.currentValue = value;
		toggleEl.updateClass();
		this.applyValues(this.channels);

		if (value && !stx.container.classList.contains("stx-crosshair-on")) {
			const { dataSegment } = stx.chart;
			const x = stx.pixelFromBar(dataSegment.length - 1);
			const y = stx.pixelFromPrice(dataSegment.slice(-1)[0].Close);
			if (!(isNaN(x) || isNaN(y))) stx.mousemoveinner(x, y);
		}
	}

	/**
	 * Sets the currently selected option for the drop-down toggle component. The options are
	 * presented as a list of radio buttons in a drop-down menu associated with the component.
	 *
	 * Selects (or checks) the radio button of the selected option and clears (or unchecks) the
	 * radio buttons of other options.
	 *
	 * @param {HTMLElement} selected The menu option to set as the selected option.
	 *
	 * @alias setSelected
	 * @memberof WebComponents.cq-info-toggle-dropdown
	 * @since 8.2.0
	 */
	setSelected(selected) {
		const { options } = this;
		this.selected = selected;
		options.forEach((option) => {
			option.classList[option === selected ? "add" : "remove"]("ciq-active");
		});
	}

	/**
	 * Subscribes to the `headsUp` channel. References the `crosshair` channel.
	 *
	 * Enables selection of the drop-down toggle options. Sets the initial selected option.
	 * Enables selection of the options using the keyboard. Sets default options on mobile devices
	 * (see `applyValues`). Sets the drop-down toggle tooltip (see `setTooltip`).
	 *
	 * Appends a `<cq-hu-dynamic>`, `<cq-hu-floating>`, or `<cq-hu-static>` element to the top
	 * node of the chart context if one is not already attached (see `initInfoComponents`).
	 *
	 * @param {CIQ.UI.Context} context The chart user interface context.
	 *
	 * @alias setContext
	 * @memberof WebComponents.cq-info-toggle-dropdown
	 * @private
	 * @since 8.2.0
	 */
	setContext(context) {
		this.tooltip = this.querySelector("cq-tooltip");
		this.toggleEl = this.querySelector("cq-toggle");
		this.optionsMenu = this.querySelector("cq-menu-dropdown");
		this.options = Array.from(this.optionsMenu.querySelectorAll("cq-item")); // ciao to NodeList

		let { config: { channels = {} } = {} } = context;
		if (!channels.headsUp) channels.headsUp = "layout.headsUp";
		if (!channels.crosshair) channels.crosshair = "layout.crosshair";
		this.channels = channels;

		this.channelSubscribe(channels.headsUp, () => this.applyValues(channels));
		const initialHUValues = this.channelRead(channels.headsUp) || {};
		const initialCrosshair = this.channelRead(channels.crosshair);
		let crosshairIsOptionAndOn = false;

		const selectItem = (event) => {
			this.setSelected(event.target);
			this.set(true);
			this.stx.changeOccurred("layout");
		};

		// set selection option based on layout
		this.options.forEach((option) => {
			const [, type] = option.getAttribute("cq-member").split("-");
			if (!type && initialCrosshair) crosshairIsOptionAndOn = true;
			if (initialHUValues[type]) this.setSelected(option);
			option.selectFC = function () {
				selectItem({ target: this }); // capture focused element from keyStroke in scroll.js
			};
		});

		this.toggleEl.isInfoToggle = true;
		this.toggleEl.currentValue = this.selected || crosshairIsOptionAndOn;
		if (!this.selected) this.setSelected(this.options[0]); // fallback/for crosshair only

		CIQ.UI.stxtap(this.optionsMenu, selectItem);

		if (CIQ.isMobile) this.querySelector("cq-menu").style.display = "none";
		this.initInfoComponents(context);
		this.applyValues(channels);
	}

	/**
	 * Sets a tooltip on the `cq-toggle` component contained in the drop-down toggle. The tooltip
	 * text is "Info Off" when the drop-down toggle is inactive; "Info On", when the drop-down
	 * toggle is active.
	 *
	 * **Note:** This function does not set a tooltip on the crosshairs drop-down toggle. The
	 * crosshairs drop-down toggle tooltip is set in the markup (see the example in the
	 * `cq-info-toggle-dropdown` description.)
	 *
	 * @param {string} [value] Unused.
	 *
	 * @alias setTooltip
	 * @memberof WebComponents.cq-info-toggle-dropdown
	 * @private
	 * @since 8.2.0
	 */
	setTooltip(value) {
		const {
			context: { stx },
			tooltip
		} = this;

		if (
			!this.options.some(
				(option) => option.getAttribute("cq-member") === "crosshair"
			)
		) {
			const thisState = this.toggleEl.currentValue ? "On" : "Off";
			tooltip.innerText = stx.translateIf(`Info ${thisState}`);
		}
	}

	/**
	 * Appends a `<cq-hu-dynamic>`, `<cq-hu-floating>`, or `<cq-hu-static>` element to the top
	 * node of the chart context if one is not already present. The elements represent the
	 * heads-up dynamic callout, heads-up floating tooltip, and crosshairs static HUD,
	 * respectively.
	 *
	 * @param {CIQ.UI.Context} context The chart user interface context.
	 *
	 * @alias initInfoComponents
	 * @memberof WebComponents.cq-info-toggle-dropdown
	 * @private
	 * @since 8.2.0
	 */
	initInfoComponents(context) {
		this.options.forEach((option) => {
			const [, type] = option.getAttribute("cq-member").split("-");
			if (type && !context.topNode.querySelector(`cq-hu-${type}`)) {
				const hu = document.createElement(`cq-hu-${type}`);
				context.topNode.append(hu);
			}
		});
	}

	/**
	 * Sets the following functionality of the crosshairs and heads-up display drop-down toggles
	 * on mobile devices:
	 * - The crosshairs drop-down toggle turns the crosshairs and static HUD on and off in unison
	 * - The heads-up display drop-down toggle is not available
	 *
	 * Sets the heads-up drop-down toggle tooltip (see `setTooltip`).
	 *
	 * @param {object} channels The web component communication channels.
	 *
	 * @alias applyValues
	 * @memberof WebComponents.cq-info-toggle-dropdown
	 * @private
	 * @since 8.2.0
	 */
	applyValues(channels) {
		const crosshair = this.channelRead(channels.crosshair);
		const headsUp = this.channelRead(channels.headsUp) || {};
		const { dynamic, floating, crosssection } = headsUp;

		if (CIQ.isMobile) {
			const staticHudContainer = this.context.topNode.querySelector(
				"cq-hu-static"
			);
			if (staticHudContainer) {
				staticHudContainer.style.display = floating ? "none" : "";
			}
			const dynamicHudContainer = this.context.topNode.querySelector(
				"cq-hu-dynamic"
			);
			if (dynamicHudContainer) {
				dynamicHudContainer.style.display = "none";
			}

			if (dynamic) {
				this.channelWrite(
					channels.headsUp,
					Object.assign({}, headsUp, { dynamic: false, floating: true })
				);
				this.applyValues(channels);
				return;
			}

			const defaultHud = this.querySelector(
				"cq-item[cq-member*='headsUp-']:not([cq-member*='-dynamic'])"
			);
			if (defaultHud && !Object.values(headsUp).includes(true)) {
				this.setSelected(defaultHud);
				if (crosshair) {
					const [, type] = defaultHud.getAttribute("cq-member").split("-");
					if (type) {
						const obj = {};
						obj[type] = true;
						this.channelWrite(
							channels.headsUp,
							Object.assign({}, headsUp, obj)
						);
						this.applyValues(channels);
						return;
					}
				}
			}
		}

		if (!crosshair && (headsUp.static || crosssection)) {
			this.channelWrite(channels.crosshair, true);
		}

		// No longer adding the on/off state to Info toggle tooltip, the blue underline indicator already shows this.
		//this.setTooltip(headsUp);
	}

	/**
	 * Determines whether the drop-down toggle is active.
	 *
	 * @param {object} params Contains data related to the drop-down toggle.
	 * @param {object} params.obj Contains the status of the drop-down toggle.
	 * @param {boolean} params.obj.crosshair If true, the crosshairs are active.
	 * @param {object} params.obj.headsUp Contains the status of the on screen information
	 * 		displays for the heads-up display and the crosshairs.
	 * @param {boolean} params.obj.headsUp.dynamic If true, the dynamic heads-up display is active.
	 * @param {boolean} params.obj.headsUp.floating If true, the floating heads-up display is
	 * 		active.
	 * @param {boolean} params.obj.headsUp.static If true, the static information display for the
	 * 		crosshairs is active.
	 * @return {boolean} True if the drop-down toggle is active, false otherwise.
	 *
	 * @alias getCurrentValue
	 * @memberof WebComponents.cq-info-toggle-dropdown
	 * @private
	 * @since 8.2.0
	 */
	getCurrentValue(params) {
		const { options } = this;
		const { obj: layout } = params;

		for (let i = 0; i < options.length; i++) {
			const [member, type] = options[i].getAttribute("cq-member").split("-");

			if (
				(!type && layout[member]) ||
				(layout[member] && layout[member][type])
			) {
				return true;
			}
		}

		return false;
	}
}

CIQ.UI.addComponentDefinition("cq-info-toggle-dropdown", InfoToggleDropdown);

};


let __js_webcomponents_instantChart_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

let InstantChart_movedDialogs = false;

/**
 * Container web component `<cq-instant-chart>`. Used to contain charts in multi-chart
 * environments.
 *
 * The `<cq-instant-chart>` element has the following custom attributes:
 * - `tmpl-src` &mdash; Specifies a template source file that contains the chart user interface
 * elements.
 * - `symbol` &mdash; Provides the primary chart symbol.
 * - `env-container` &mdash; Identifies an HTML DOM node (for example "body") that is used to
 * contain transient user interface elements such as dialog boxes and color pickers.
 * - `cq-event-flag` &mdash; Indicates that an instant chart container has dispatched an event.
 * Enables the container element to be identified so that an event handler can be called for the
 * element. See the *sample-template-multi-charts.html* template for an example.
 *
 * Dispatches a `signal-chart-ready` event. Event listeners typically run a handler that
 * configures the chart. See the *sample-template-multi-charts.html* template for an example.
 *
 * @namespace WebComponents.cq-instant-chart
 *
 * @example
 * <div class="column left"><cq-instant-chart tmpl-src="examples/templates/partials/sample-template-advanced-context.html"  id="chart0" symbol="AAPL"></cq-instant-chart></div>
 * <div class="column right"><cq-instant-chart tmpl-src="examples/templates/partials/sample-template-advanced-context.html" id="chart1" symbol="MSFT"></cq-instant-chart></div>
 */
class InstantChart extends HTMLElement {
	connectedCallback() {
		if (this.hasAttribute("attached")) return;
		this.setAttribute("attached", "");

		var self = this;

		const environmentContainer = this.getAttribute("env-container") || "body";
		const tmplSrc = this.getAttribute("tmpl-src");
		var context = this.querySelector("cq-context");
		if (!context)
			context = this.appendChild(document.createElement("cq-context"));
		const noLocalStorage = this.hasAttribute("no-save");

		this.style.visibility = "hidden";

		CIQ.loadUI(tmplSrc, context, function (err) {
			if (err) return;

			var chartTitle = self.querySelector("cq-chart-title");
			if (chartTitle) chartTitle.removeAttribute("cq-browser-tab");

			var elementBlocks = self.querySelectorAll(
				"cq-ui-manager, cq-dialog, cq-color-picker"
			);
			for (var eb = 0; eb < elementBlocks.length; eb++) {
				var elementBlock = elementBlocks[eb];
				elementBlock.parentNode.removeChild(elementBlock);
				if (!InstantChart_movedDialogs)
					document
						.querySelector(environmentContainer)
						.appendChild(elementBlock);
			}
			InstantChart_movedDialogs = true;

			const params = {
				extendedHours: true,
				rangeSlider: true,
				inactivityTimer: true,
				fullScreen: false,
				initialSymbol: self.getAttribute("symbol") || undefined,
				restore: !noLocalStorage
			};

			self.signalEvent = new CustomEvent("signal-chart-ready", {
				detail: { node: self, params }
			});
			self.setAttribute("cq-event-flag", "");
			self.style.visibility = "";

			document.body.dispatchEvent(self.signalEvent);
		});
	}
	disconnectedCallback() {
		this.stx.destroy();
	}
}

customElements.define("cq-instant-chart", InstantChart); // do not use addComponentsDefinition for this component!

};


let __js_webcomponents_languageDialog_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */




var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

if (!CIQ.I18N) {
	console.error(
		"languageDialog component requires first activating i18n feature."
	);
} else {
	/**
	 * Language dialog web component `<cq-language-dialog>`. This creates a dialog that the user can use to change the language.
	 *
	 * The actual language choices are obtained from {@link CIQ.I18N.languages}. Choosing a different language causes the entire
	 * UI to be translated through use of the {@link CIQ.I18N.setLanguage} method.
	 *
	 * @namespace WebComponents.cq-language-dialog
	 * @since
	 * - 4.0.0 New component added added.
	 * - 4.1.0 Now it calls {@link CIQ.I18N.localize} instead of {@link CIQ.I18N.setLocale}.
	 *
	 * @example
	 * <cq-dialog>
	 *    <cq-language-dialog>
	 *    </cq-language-dialog>
	 * </cq-dialog>
	 */
	class LanguageDialog extends CIQ.UI.DialogContentTag {
		/**
		 * Closes dialog box.
		 *
		 * @alias close
		 * @memberof WebComponents.cq-language-dialog
		 * @since 4.0.0
		 */
		close() {
			const langDialog = document.querySelector("cq-language-dialog");
			if (langDialog) langDialog.closest("cq-dialog,cq-menu").close();
		}

		/**
		 * Opens the nearest {@link WebComponents.cq-dialog} to display your dialog.
		 *
		 * @param {Object} [params] Contains the chart context.
		 * @param {CIQ.UI.Context} [params.context] A context to set for the dialog. See
		 * 		{@link CIQ.UI.DialogContentTag#setContext}.
		 *
		 * @alias open
		 * @memberof WebComponents.cq-language-dialog
		 * @since 4.0.0
		 */
		open(params) {
			this.addDefaultMarkup();
			super.open(params);

			const cqLanguages = this.node.find("cq-languages");
			cqLanguages.children(":not(template)").remove();
			const template = this.node.find("template");
			const { languages } = CIQ.I18N;
			if (!languages) return;

			function switchToLanguage(langCode) {
				return function () {
					CIQ.UI.contextsForEach(function () {
						const { stx } = this;
						stx.preferences.language = langCode;
						stx.changeOccurred("preferences");
						CIQ.I18N.localize(stx, langCode);
						stx.draw();
					});
				};
			}
			for (let langCode in languages) {
				const node = CIQ.UI.makeFromTemplate(template, cqLanguages);
				node.find("cq-language-name").text(languages[langCode]);
				node.find("cq-flag").attr("cq-lang", langCode);
				CIQ.UI.stxtap(node[0], switchToLanguage(langCode));
			}
		}
	}

	LanguageDialog.markup = `
		<h4 class="title">Choose language</h4>
		<cq-close></cq-close>
		<cq-languages>
			<template><div><cq-flag></cq-flag><cq-language-name></cq-language-name></div></template>
		</cq-languages>
	`;
	CIQ.UI.addComponentDefinition("cq-language-dialog", LanguageDialog);
}

};


let __js_webcomponents_loader_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Loader web component `<cq-loader>`.
 *
 * CSS loading icon.
 *
 * @namespace WebComponents.cq-loader
 *
 * @example
 * <cq-loader><cq-loader>
 */
class Loader extends CIQ.UI.ContextTag {
	setContext(context) {
		this.context.setLoader(this);
	}
	/**
	 * Shows the loading icon.
	 * @alias show
	 * @memberof WebComponents.cq-loader
	 */
	show() {
		this.classList.add("stx-show");
	}

	/**
	 * Hides the loading icon.
	 * @alias hide
	 * @memberof WebComponents.cq-loader
	 */
	hide() {
		this.classList.remove("stx-show");
	}
}

CIQ.UI.addComponentDefinition("cq-loader", Loader);

};


let __js_webcomponents_lookup_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */



var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

if (!CIQ.ChartEngine.Driver) {
	console.error(
		"lookup component requires first activating quoteFeed feature."
	);
} else if (!CIQ.ChartEngine.Driver.Lookup) {
	console.error(
		"lookup component requires first activating symbolLookupBase feature."
	);
} else {
	/**
	 * Symbol lookup component `<cq-lookup>`.
	 *
	 * A {@link CIQ.ChartEngine.Driver.Lookup} must be connected to this web component. The lookup
	 * driver searches financial exchanges for symbols that match the text entered in the
	 * component's input field.
	 *
	 * The symbol lookup can be toggled using the Ctrl+Alt+S keystroke combination (see the
	 * `symbolLookup` action in `hotkeyConfig.hotkeys` in *js/defaultConfiguration.js*).
	 *
	 * A default lookup driver is specified in the chart configuration object (see the
	 * <a href="tutorial-Chart%20Configuration.html" target="_blank">Chart Configuration</a>
	 * tutorial).
	 *
	 * You can provide a different driver in the following ways:
	 * - Assign the driver to the
	 *   <a href="tutorial-Chart%20Configuration.html#lookupdriver" target="_blank">
	 *   <code class="codeLink">lookupDriver</code></a> property of the chart configuration
	 *   object
	 * - Connect the driver to this component using
	 *   [setDriver]{@link WebComponents.cq-lookup#setDriver}
	 * - Add the driver to the UI context with {@link CIQ.UI.Context#setLookupDriver}
	 *
	 * **Note:** If the lookup component is unable to access a lookup driver, the component's
	 * input field is active, but the component does not produce results.
	 *
	 * **Keyboard control**
	 *
	 * When selected with tab key navigation and activated with Return/Enter, this component has
	 * the following internal controls:
	 * - Up/Down arrow &mdash; Move selection between search input, filters, and search results
	 * - Left/Right arrow &mdash; Switch between search result filters
	 *
	 * **Attributes**
	 * | Name | Description | Valid Values |
	 * | ---- | ----------- | ------------ |
	 * | <code style="white-space: nowrap">cq-keystroke-claim</code> | Enables processing of keyboard input. | <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes#boolean_attributes" target="_blank">Boolean attribute</a> |
	 * | <code style="white-space: nowrap">cq-keystroke-default</code> | Enables the component to respond to keystrokes when the lookup input field does not have focus. <p style="margin-bottom: 0">**Warning:** This feature may conflict with keyboard shortcuts set in other components. | <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes#boolean_attributes" target="_blank">Boolean attribute</a> |
	 * | <code style="white-space: nowrap">cq-uppercase</code> | Forces text to uppercase. | <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes#boolean_attributes" target="_blank">Boolean attribute</a> |
	 * | <code style="white-space: nowrap">cq-exchanges</code> | Specifies a list of financial exchanges searched by the lookup driver. Overrides the `exchanges` parameter of {@link CIQ.ChartEngine.Driver.Lookup}. | Comma-delimited list of exchange names; for example, "futures,govt,muni,corp"|
	 *
	 * **Customization**
	 *
	 * To hide the lookup results window, modify the CSS as follows:
	 * ```css
	 * .stxMenuActive cq-lookup-results { opacity: 0 }
	 * ```
	 *
	 * To preload default results (rather than an empty result pane) on initial load , set an
	 * `onChartReady` handler in the chart configuration object (see the
	 * <a href="tutorial-Chart%20Configuration.html" target="_blank">Chart Configuration</a>
	 * tutorial); for example:
	 *
	 * ```
	 * config.onChartReady = (stx) => {
	 *     const defaultResults = [
	 *         {
	 *             "display": ["KW", "Kennedy - Wilson Holdings Inc", "NYSE"],
	 *             "data": {
	 *                 "symbol": "KW",
	 *                 "name": "Kennedy - Wilson Holdings Inc",
	 *                 "exchDisp ": "NYSE"
	 *             }
	 *         },
	 *         {
	 *             "display": ["RWR", "SPDR Series Trust - SPDR DJ Wilshire REIT ETF", "NYSEArca"],
	 *             "data": {
	 *                 "symbol": "RWR",
	 *                 "name": "SPDR Series Trust - SPDR DJ Wilshire REIT ETF",
	 *                 "exchDisp": "NYSEArca"
	 *             }
	 *         }
	 *     ];
	 *
	 *     const UISymbolLookup = document.querySelector(".ciq-search cq-lookup");
	 *     UISymbolLookup.results(defaultResults);
	 * }
	 * ```
	 *
	 * @namespace WebComponents.cq-lookup
	 * @since
	 * - 4.0.0 Added optional `cq-uppercase` attribute.
	 * - 7.4.0 Added optional `cq-exchanges` attribute.
	 * - 8.3.0 Enabled internal keyboard navigation and selection.
	 *
	 * @example
	 * <cq-lookup cq-keystroke-claim cq-uppercase cq-keystroke-default>
	 *     <cq-lookup-input cq-no-close>
	 *         <input type="text" spellcheck="false" autocomplete="off"
	 *                autocorrect="off" autocapitalize="none" name="symbol"
	 *                placeholder="Enter Symbol">
	 *         <cq-lookup-icon></cq-lookup-icon>
	 *     </cq-lookup-input>
	 *     <cq-lookup-results>
	 *         <cq-lookup-filters cq-no-close>
	 *             <cq-filter class="true">ALL</cq-filter>
	 *             <cq-filter>STOCKS</cq-filter>
	 *             <cq-filter>FX</cq-filter>
	 *             <cq-filter>INDEXES</cq-filter>
	 *             <cq-filter>FUNDS</cq-filter>
	 *             <cq-filter>FUTURES</cq-filter>
	 *         </cq-lookup-filters>
	 *         <cq-scroll></cq-scroll>
	 *     </cq-lookup-results>
	 * </cq-lookup>
	 */
	class Lookup extends CIQ.UI.ContextTag {
		constructor() {
			super();
			this.usingEmptyDriver = false;
			this.currentFilter = null;
			// Will hold references to filter tabs for keyboard navigation
			this.filterElements = null;
			this.params = {};
		}

		/**
		 * With the decoupling of the uiHelper to the Lookup.Driver you must be sure to include both an argument for maxResults and the closure to handle the results.
		 * maxResults must either be a number or a string to result in default value of 100.
		 * @alias acceptText
		 * @memberof WebComponents.cq-lookup#
		 * @since 3.0.0
		 */
		acceptText(value, filter) {
			var self = this;
			if (!this.params.driver) {
				if (this.context.lookupDriver) {
					this.setDriver(this.context.lookupDriver);
				} else {
					this.setDriver(new CIQ.ChartEngine.Driver.Lookup());
					this.usingEmptyDriver = true;
				}
			}
			var restoredExchanges = this.params.driver.exchanges;
			function closure(results) {
				self.params.driver.exchanges = restoredExchanges;
				self.results(results);
			}
			var exchanges = this.getAttribute("cq-exchanges");
			if (exchanges) this.params.driver.exchanges = exchanges.split(",");
			this.params.driver.acceptText(value, filter, null, closure);
		}

		attachDriver(driver) {
			this.driver = driver;
		}

		close() {
			if (this.keyboardNavigation) {
				// Position the highlight over the input to wait for the collapse animation to complete
				this.highlightItem(this.input[0]);
				// Reposition the highlight after css animation is complete.
				setTimeout(this.highlightItem.bind(this, this.input[0]), 250);

				// Remove any focused property from the filter tabs
				this.removeFocused(this.filterElements);
				// Remove keyboard control from scroll
				this.resultList[0].keyboardNavigation = null;
			}
			this.closest("cq-dialog,cq-menu").close();
		}

		forceInput() {
			var input = this.input[0];
			this.selectItem({ symbol: input.value });
			CIQ.blur(input);
			this.close();
			input.value = "";
		}

		initialize() {
			this.addDefaultMarkup();
			var node = this.node;
			this.resultList = node.find("cq-scroll");

			this.input = node.find("input");
			if (!this.input.length) {
				var hiddenInput = document.createElement("input");
				hiddenInput.setAttribute("type", "hidden");
				hiddenInput.value = "";
				this.input = node.append(hiddenInput);
			}
			CIQ.UI.stxtap(this.input[0], function () {
				this.focus();
			});
			var self = this;
			Array.from(this.input).forEach(function (input) {
				input.addEventListener("paste", function (e) {
					var input = e.target;
					setTimeout(function () {
						self.acceptText(input.value, self.currentFilter);
					}, 0);
				});
			});
			var filters = this.querySelector("cq-lookup-filters");
			if (filters) {
				var allFilters = filters.querySelectorAll("cq-filter");
				allFilters.forEach(function (filter) {
					CIQ.UI.stxtap(filter, function () {
						allFilters.forEach(function (f) {
							f.classList.remove("true");
						});
						this.classList.add("true");
						var translate = this.querySelector("translate");
						if (translate) {
							// if the filter text has been translated then it will be in a <translate> tag
							self.currentFilter = translate.getAttribute("original");
						} else {
							self.currentFilter = this.innerHTML;
						}
						self.acceptText(self.input.val(), self.currentFilter);
					});
				});
			}

			if (typeof node.attr("cq-keystroke-claim") != "undefined") {
				// add keyboard claim for entire body
				this.addClaim(this);
			}
		}

		isActive() {
			return this.input[0].value !== "";
		}

		// Note that this captures keystrokes on the body. If the input box is focused then we need to allow the input box itself
		// to handle the strokes but we still want to capture them in order to display the lookup results. We first check
		// activeElement to see if the input is focused. If so then we bypass logic that manipulates the input.value. In order make
		// sure that the lookup menu is responding to an up-to-date input.value therefore we have to put all of those pieces of code
		// in setTimeout(0)
		//
		// Note that when comparisons are enabled, there are two Lookup components on the screen. Each keypress will therefore pass
		// through this function twice, once for each Lookup component. Only the active component will process the keystroke.
		keyStroke(hub, key, e, keystroke) {
			if (keystroke.ctrl || keystroke.cmd) return false;
			if (key == "Meta" || key == "Win") return false;

			var input = this.input[0];
			var result = false;
			var focused = document.activeElement === input; // If focused then we need to allow the input box to get most keystrokes
			// Rejecting alt key combinations only when the input is out of focus because some special chars can be typed with an alt key
			if (
				!focused &&
				(e.altKey ||
					(document.activeElement &&
						(document.activeElement.tagName == "INPUT" ||
							document.activeElement.tagName == "TEXTAREA")))
			) {
				return false; // either an alt key combination was pressed or some other input has focus
			}

			var iAmActive = false,
				iAmDisplayed = false;
			if (CIQ.climbUpDomTree(this, ".stxMenuActive").length) {
				iAmDisplayed = true; // if my menu chain is active then I'm alive
			}
			if (focused || iAmDisplayed) iAmActive = true; // If my input is focused or I'm displayed, then I'm alive
			if (!iAmActive) {
				// Otherwise, I may still be alive under certain conditions
				if (typeof this.node.attr("cq-keystroke-default") == "undefined")
					return; // I'm always alive if I have default body keystrokes
				if (!iAmDisplayed && this.uiManager.topMenu()) return; // unless there's another menu active and it isn't me
			}
			if ((key === " " || key === "Spacebar") && input.value === "") {
				return false;
			}
			var self = this;
			var focusedElements = this.findFocused(this.filterElements);

			switch (key) {
				case "Delete":
				case "Backspace":
				case "Del":
					if (input.value.length) {
						//ctrl-a or highlight all text + delete implies remove all text
						if (window.getSelection().toString()) {
							input.value = "";
						} else {
							if (!focused)
								input.value = input.value.substring(0, input.value.length - 1);
							if (input.value.length) {
								self.acceptText(input.value, self.currentFilter);
							}
						}

						result = true; // only capture delete key if there was something to delete
					}
					if (key == "Backspace") result = true; // always capture backspace because otherwise chrome will navigate back
					break;
				case "Escape":
				case "Esc":
					input.value = "";
					this.close();
					CIQ.blur(input);
					result = true;
					break;
				case "Enter":
					if (input.value === "" || !this.isActive()) break;

					var scrollable = this.resultList;
					focused = scrollable.length && scrollable[0].focused(); // Using cursor keys to maneuver down lookup results
					if (focused && focused.selectFC) {
						focused.selectFC.apply(focused, {});
					} else {
						var val = input.value;
						var toUpperCase =
							["false", "0", null].indexOf(this.getAttribute("cq-uppercase")) ==
							-1;
						if (toUpperCase) val = val.toUpperCase();
						this.selectItem({ symbol: val });
					}

					CIQ.blur(input);
					this.close();
					input.value = "";
					result = true;
					break;
				case "ArrowRight":
				case "Right":
					if (focusedElements.length) {
						// Remove control from the result list
						if (this.resultList[0].keyboardNavigation)
							this.resultList[0].keyboardNavigation = null;
						// Ignore right if a tab is not focused to allow cursor movement in input
						this.focusNextItem(this.filterElements);
						this.clickFocusedItem(this.filterElements, e);
					}
					break;
				case "ArrowLeft":
				case "Left":
					// Remove control from the result list
					if (this.resultList[0].keyboardNavigation)
						this.resultList[0].keyboardNavigation = null;
					// Ignore left if a tab is not focused to allow cursor movement in input
					if (focusedElements.length) {
						this.focusNextItem(this.filterElements, true);
						this.clickFocusedItem(this.filterElements, e);
					}
					break;
				case "ArrowDown":
				case "Down":
					// Up/Down arrows are only used in this component when keyboard navigation is enabled
					if (!this.keyboardNavigation) break;
					// If no tab is focused, then give the first one focus, otherwise, pass control to the resultList
					focusedElements = this.findFocused(this.filterElements);
					if (!focusedElements.length) {
						// If a tab hasn't been focused, highlight the active one.
						for (
							let filterIdx = 0;
							filterIdx < this.filterElements.length;
							filterIdx++
						) {
							let filterElement = this.filterElements[filterIdx];
							if (filterElement.classList.contains("true")) {
								this.focusItem(filterElement);
								break;
							}
						}
					} else if (!this.resultList[0].keyboardNavigation) {
						// Only pass control to the result list if there are results
						var resultItem = this.resultList[0].querySelector("cq-item");
						if (resultItem)
							this.resultList[0].keyboardNavigation = this.keyboardNavigation;
					}
					CIQ.blur(input);
					break;
				case "ArrowUp":
				case "Up":
					// Up/Down arrows are only used in this component when keyboard navigation is enabled
					if (!this.keyboardNavigation) break;
					// resultList has its own up/down control.
					if (this.resultList[0].keyboardNavigation) {
						// If the scroll has control, check for the top item selected and move highlight back to the tabs
						var firstResult = this.resultList[0].querySelector(
							"cq-item:first-of-type"
						);
						if (firstResult && firstResult.hasAttribute("cq-focused")) {
							firstResult.removeAttribute("cq-focused");
							this.resultList[0].keyboardNavigation = null;
							this.highlightFocusedItem(this.filterElements);
						}
					} else if (focusedElements.length) {
						//If a tab has the highlight, reset the highlight back to the input
						this.removeFocused(focusedElements);
						this.highlightItem(input);
						CIQ.focus(input);
					}
					break;
				default:
					// Prevent keys like Control and ArrowLeft from triggering focus
					if (key.length === 1) {
						// Changes the <input> value when keystrokes are registered against the body.
						if (!focused) input.value = input.value + key;
						self.acceptText(input.value, self.currentFilter);
						result = true;
					}
					break;
			}

			if (result) {
				// If we're focused, then keep the lookup open unless we hit escape.
				// Otherwise, if there is no length close it (user hit "escape", "enter", or "backspace/delete" while unfocused)
				if (
					this.usingEmptyDriver ||
					(!input.value.length &&
						(key == "Escape" || key == "Esc" || key == "Enter" || !focused))
				) {
					this.close();
				} else {
					this.open();
				}
				if (focused) return { allowDefault: true };
				return true;
			}
		}

		open() {
			// Reposition the highlight after css animation is complete.
			window.setTimeout(this.highlightItem.bind(this, this.input[0]), 250);
			this.closest("cq-dialog,cq-menu").open();
		}

		onKeyboardDeselection() {
			CIQ.blur(this.input[0]);
			this.close();
			// If we're using keyboard navigation, return the highlight to the tab selected element
			if (this.keyboardNavigation) this.keyboardNavigation.highlightPosition();
			this.resultList[0].keyboardNavigationWait = false;
		}

		onKeyboardSelection() {
			// If we're using keyboard navigation, return the highlight to the tab selected element
			this.highlightItem(this.input[0]);
			CIQ.focus(this.input[0]);
			this.resultList[0].keyboardNavigationWait = true;
			this.open();
		}

		/**
		 * Displays an array of results returned by the {@link CIQ.ChartEngine.Driver.Lookup}.
		 *
		 * Each element in the array should be in the following format (see
		 * {@link CIQ.ChartEngine.Driver.Lookup#acceptText}):
		 * ```
		 * {
		 *     display: ["symbol ID", "symbol description", "exchange"],
		 *     data: {
		 *         symbol: "symbol ID",
		 *         name: "symbol description",
		 *         exchDis: "exchange"
		 *     }
		 * }
		 * ```
		 *
		 * The lookup component by default displays three columns as represented by the array. The
		 * data object can be a format required by your quote feed, or it can be a simple string
		 * if you just need to support a stock symbol.
		 *
		 * @param {array} arr The array of results.
		 *
		 * @alias results
		 * @memberof WebComponents.cq-lookup#
		 */
		results(arr) {
			function closure(self, data) {
				return function (e) {
					CIQ.blur(self.input[0]);
					//self.close();
					self.selectItem(data);
					self.input[0].value = "";
				};
			}

			this.resultList = CIQ.UI.$(this.resultList);
			this.resultList.empty();
			for (var i = 0; i < arr.length; i++) {
				var item = arr[i];
				var nodeText = "";
				for (var j = 0; j < item.display.length; j++) {
					nodeText += "<SPAN>" + item.display[j] + "</SPAN>";
				}
				var node = document.createElement("cq-item");
				node.innerHTML = nodeText;
				this.resultList.append(node);
				node.selectFC = closure(this, item.data);
				CIQ.UI.stxtap(node, node.selectFC);
			}
			var scrollable = this.resultList;
			if (scrollable[0]) scrollable[0].top();

			// Reset the hilight position
			this.highlightFocusedItem(this.filterElements);
		}

		/**
		 * Accepts a new symbol or symbol object.
		 *
		 * @param {object} data Contains a symbol or symbol object in a form accepted by
		 * 		{@link CIQ.ChartEngine#loadChart}.
		 * @param {function} fn Function to execute when the callback set by
		 * 		[setCallback]{@link WebComponents.cq-lookup#setCallback} finishes.
		 *
		 * @alias selectItem
		 * @memberof WebComponents.cq-lookup#
		 * @since 8.2.0 Removed the `params` parameter. Added the `fn` parameter.
		 */
		selectItem(data, fn) {
			if (this.params.cb) {
				this.params.cb(data, fn);
			}
		}

		/**
		 * Sets a callback function to be called when the user selects a symbol.
		 *
		 * @param {function} cb The callback function; for example, an implementation of
		 * 		{@link CIQ.UI.Context#changeSymbol}.
		 *
		 * @alias setCallback
		 * @memberof WebComponents.cq-lookup#
		 */
		setCallback(cb) {
			this.params.cb = cb;
		}

		setContext(context) {
			this.initialize();

			const symbolInput = this.querySelector("cq-lookup-input input");
			const { config, stx } = context;
			if (!config) return;
			const { channels = {} } = config;

			this.channelSubscribe(
				channels.breakpoint || "channel.breakpoint",
				(breakPoint) => {
					var placeholder = stx.crossSection
						? stx.crossSection.symbolInputType
						: "Symbol";
					if (breakPoint === "break-lg") {
						placeholder = "Enter " + placeholder;
					}
					symbolInput.setAttribute(
						"placeholder",
						breakPoint === "break-sm" ? "" : placeholder
					);
				}
			);

			// Get a list of filter tabs for keyboard navigation
			this.filterElements = this.querySelectorAll(
				"cq-lookup-filters cq-filter"
			);

			if (!this.params.cb && context.changeSymbol)
				this.params.cb = context.changeSymbol;
		}

		/**
		 * Connects a {@link CIQ.ChartEngine.Driver.Lookup} to the web component.
		 *
		 * The lookup driver searches financial exchanges for symbols that match the text entered
		 * in the component's input field.
		 *
		 * @param {CIQ.ChartEngine.Driver.Lookup} driver The lookup driver to connect to the web
		 * 		component.
		 *
		 * @alias setDriver
		 * @memberof WebComponents.cq-lookup#
		 */
		setDriver(driver) {
			this.params.driver = driver;
		}
	}

	Lookup.markup = `
		<cq-lookup-input cq-no-close>
			<input type="text" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="none" name="symbol" placeholder="">
			<cq-lookup-icon></cq-lookup-icon>
		</cq-lookup-input>
		<cq-lookup-results>
			<cq-lookup-filters cq-no-close>
				<cq-filter class="true">ALL</cq-filter>
				<cq-filter>STOCKS</cq-filter>
				<cq-filter>FX</cq-filter>
				<cq-filter>INDEXES</cq-filter>
				<cq-filter>FUNDS</cq-filter>
				<cq-filter>FUTURES</cq-filter>
			</cq-lookup-filters>
			<cq-scroll></cq-scroll>
		</cq-lookup-results>
	`;
	CIQ.UI.addComponentDefinition("cq-lookup", Lookup);
}

};


let __js_webcomponents_menu_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Menu web component `<cq-menu>`.
 *
 * Add attribute `cq-focus` to provide a query selector path to the element to focus when the
 * menu is opened.
 *
 * The node is contextually aware of its surroundings. Handles opening and closing
 * {@link WebComponents.cq-menu-dropdown}.
 *
 * @namespace WebComponents.cq-menu
 *
 * @example
 * <cq-menu class="ciq-menu stx-markers collapse">
 * 	   <span>Events</span>
 * 	   <cq-menu-dropdown>
 * 		   <cq-item class="square">Simple Square <span class="ciq-radio"><span></span></span>
 * 		   </cq-item>
 * 		   <cq-item class="circle">Simple Circle <span class="ciq-radio"><span></span></span>
 * 		   </cq-item>
 * 		   <cq-item class="callouts">Callouts <span class="ciq-radio"><span></span></span>
 * 		   </cq-item>
 * 		   <cq-item class="abstract">Abstract <span class="ciq-radio"><span></span></span>
 * 		   </cq-item>
 * 		   <cq-item class="none">None <span class="ciq-radio ciq-active"><span></span></span>
 * 		   </cq-item>
 * 	   </cq-menu-dropdown>
 * </cq-menu>
 */
class Menu extends HTMLElement {
	constructor() {
		super();
		this.activeClassName = "stxMenuActive";
		this.active = false;
	}

	/**
	 * READ ONLY. The value of the `cq-focus` attribute.
	 *
	 * @alias focusElement
	 * @memberof WebComponents.cq-menu
	 * @type String
	 * @since 7.5.0
	 */
	get focusElement() {
		return this.getAttribute("cq-focus");
	}

	connectedCallback() {
		if (this.attached) return;
		this.uiManager = CIQ.UI.getUIManager();

		this.attached = true;

		if (this.hasAttribute("readonly")) return;
		var self = this;
		function handleTap(e) {
			self.tap(e);
		}
		function handleCaptureTap(e) {
			self.captureTap(e);
		}
		this.addEventListener("stxtap", handleCaptureTap, true);
		CIQ.UI.stxtap(this, handleTap);
	}

	/**
	 * Captures a tap event *before* it descends down to what it is clicked on. The key thing this does is determine
	 * whether the thing clicked on was inside of a "cq-no-close" section. We do this on the way down, because the act
	 * of clicking on something may release it from the dom, making it impossible to figure out on propagation.
	 * @param {object} e Element
	 * @private
	 */
	captureTap(e) {
		var domChain = Array.from(CIQ.climbUpDomTree(e.target));
		// Determine if the tapped element, or any of its parents have a cq-no-close attribute
		this.noClose = domChain.filter(function (el) {
			var attr = el.getAttribute("cq-no-close");
			return attr !== null && attr !== false;
		}).length;

		// Determine if the tapped element was inside of something untappable, like a cq-heading or cq-separator
		if (!this.noClose) {
			this.noClose = domChain.filter(function (el) {
				return el.matches("cq-separator,cq-heading");
			}).length;
		}
	}

	close() {
		this.uiManager.closeMenu(this);
	}

	hide() {
		if (!this.active) return;
		this.unlift();
		this.classList.remove(this.activeClassName);
		this.active = false;
		// blur any input boxes that are inside the menu we're closing, to get rid of soft keyboard
		this.querySelectorAll("input").forEach(function (i) {
			if (i == document.activeElement) i.blur();
		});
		// Disable keyboardNavigation controls in the dropdown
		const dropdown = this.querySelector("cq-menu-dropdown");
		if (dropdown) {
			dropdown.disablekeyboardNavigation();
			// Remove focus from any selected menu item
			CIQ.UI.BaseComponent.prototype.removeFocused(
				dropdown.querySelectorAll("[cq-focused]")
			);
		}
		// Close the lookup component
		const lookup = this.querySelector("cq-lookup");
		if (lookup) lookup.close();
	}

	lift() {
		const context = CIQ.UI.getMyContext(this);
		const lifts = (this.lifts = this.uiManager.findLifts(this));
		for (let i = 0; i < lifts.length; i++) {
			// The lifted menu will no longer inherit the active theme class. Attach it directly to the element.
			if (context && context.config && context.config.themes) {
				let themes = Object.keys(context.config.themes.builtInThemes);
				// First remove any existing theme classes on the dialog
				lifts[i].classList.remove(...themes);
				let activeTheme = themes.find(
					(r) => context.topNode.classList.contains(r) === true
				);
				// Add the active theme class to the dialog
				if (activeTheme) lifts[i].classList.add(activeTheme);
			}
			this.uiManager.lift(lifts[i]);
		}
	}

	onKeyboardDeselection() {
		this.close();
	}

	open(params) {
		var stack = this.uiManager.activeMenuStack;
		for (var i = 0; i < stack.length; i++) {
			if (stack[i] === this) return;
		}
		this.uiManager.openMenu(this, params);
	}

	show(params) {
		if (this.active) return;
		this.active = true;
		this.classList.add(this.activeClassName);
		this.lift();
		// For good measure, call resize on any nested scrollables to give them
		// a chance to change their height and scrollbars
		this.querySelectorAll("cq-scroll, cq-menu-dropdown").forEach(function (s) {
			if (s.resize) s.resize();
		});
		// Pass keyboard navigation over to the dropdown if it exists
		if (this.keyboardNavigation) {
			const dropdown = this.querySelector("cq-menu-dropdown");
			if (dropdown)
				this.keyboardNavigation.setKeyControlElement(dropdown, true);
		}
	}

	tap(e) {
		e.stopPropagation();
		var uiManager = this.uiManager;
		if (this.active) {
			// tapping on the menu if it is open will close it
			if (!this.noClose) uiManager.closeMenu(this);
		} else {
			// if we've clicked on the label for the menu, then open the menu

			// If the tap came from within this menu's cq-menu-dropdown then this is probably an accidental
			// "re-open", which occurs when a click on a menu item causes an action that closes the menu, tricking
			// it into thinking it should re-open
			var insideDropdown = e.target.closest("cq-menu-dropdown");
			if (insideDropdown) return;

			var child = false;
			var parents = CIQ.climbUpDomTree(this.parentElement, "cq-menu,cq-dialog");
			for (var i = 0; i < parents.length; i++) {
				if (parents[i].active) child = true;
			}
			if (!child) uiManager.closeMenu(); // close all menus unless we're the child of an active menu (cascading)

			this.open();

			if (this.focusElement && !CIQ.isMobile) {
				const el = this.querySelector(this.focusElement);
				if (el) el.focus();
			}
		}
	}

	unlift() {
		var lifts = this.lifts;
		if (!lifts) return;
		for (var i = 0; i < lifts.length; i++) {
			this.uiManager.restoreLift(lifts[i]);
		}
		this.lifts = null;
	}
}

CIQ.UI.addComponentDefinition("cq-menu", Menu);

};


let __js_webcomponents_menuContainer_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * The menu container web component `<cq-menu-container>`.
 *
 * Generates a menu based on the value of the `cq-name` attribute.
 *
 * @namespace WebComponents.cq-menu-container
 * @since 7.5.0
 *
 * @example
 * <cq-menu class="ciq-menu ciq-period">
 *     <span><cq-clickable stxbind="Layout.periodicity">1D</cq-clickable></span>
 *     <cq-menu-dropdown>
 *         <cq-menu-container cq-name="menuPeriodicity"></cq-menu-container>
 *     </cq-menu-dropdown>
 * </cq-menu>
 */
class MenuContainer extends CIQ.UI.ContextTag {
	/**
	 * Obtains the name of the menu and the items contained in the menu. Adds the default
	 * markup.
	 *
	 * @param {CIQ.UI.Context} context The chart user interface context.
	 *
	 * @alias setContext
	 * @memberof WebComponents.cq-menu-container
	 * @since 7.5.0
	 */
	setContext(context) {
		const setName = this.getAttribute("cq-name");
		if (setName && context.config) {
			// get menu items as array
			const menuItems = context.config.getMenu(setName);
			this.addDefaultMarkup(this, menuItems && menuItems.join(""));
			if (!this.innerHTML) {
				// hide container and heading if there is no content
				const container = CIQ.UI.BaseComponent.selfOrParentElement(
					this,
					"cq-menu-dropdown-section"
				);
				if (container) container.style.display = "none";
			}
			return;
		}
	}
}

CIQ.UI.addComponentDefinition("cq-menu-container", MenuContainer);

};


let __js_webcomponents_messageToaster_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Message toaster web component `<cq-message-toaster>`.
 *
 * Displays pop-up messages, also known as toasts.
 *
 * Listens for a chart engine event of type "notification" and displays the notification as a
 * pop-up message over the chart.
 *
 * To trigger the notification event, call {@link CIQ.ChartEngine#dispatch} with the
 * "notification" type and the required notification listener data (see
 * [notificationEventListener]{@link CIQ.ChartEngine~notificationEventListener}), for example:
 * ```
 * stxx.dispatch("notification", { message: "A toast!" });
 * ```
 *
 * Toasts are displayed immediately unless another toast is already on screen. Concurrent toasts
 * are displayed sequentially, not simultaneously.
 *
 * When a toast is created, it's added to a display queue. The toast at the front of the queue is
 * dequeued and displayed when no other toasts are on screen. Toasts can be prioritized (that is,
 * reordered in the queue) by setting the `priority` parameter of the
 * [notificationEventListener]{@link CIQ.ChartEngine~notificationEventListener} argument.
 *
 * **Attributes**:
 * | Name | Description | Valid Values |
 * | ---- | ----------- | ------------ |
 * | `defaultDisplayTime` | Amount of time, in seconds, toasts are displayed before being automatically dismissed (removed from the display). | Integer numbers >= 0. A value of 0 causes toasts to remain on screen &mdash; blocking the toast display queue &mdash; until selected by the user. |
 * | `defaultPosition` | Vertical on-screen position of toasts relative to the chart. (Toasts are centered horizontally.) | "top" or "bottom" |
 * | `defaultTransition` | Animation used to display and dismiss toasts. | "fade", "slide", "pop" or "drop" |
 *
 * **Note:** All attributes can be overridden by the argument provided to
 * [notificationEventListener]{@link CIQ.ChartEngine~notificationEventListener}.
 *
 * @namespace WebComponents.cq-message-toaster
 * @since 8.2.0
 *
 * @example
 * <cq-message-toaster
 *     defaultDisplayTime="10"
 *     defaultTransition="slide"
 *     defaultPosition="top"
 * </cq-message-toaster>
 */
class MessageToaster extends CIQ.UI.ContextTag {
	constructor() {
		super();
	}

	/**
	 * Initializes the message toaster web component.
	 *
	 * @alias connectedCallback
	 * @memberof WebComponents.cq-message-toaster#
	 * @private
	 * @since 8.2.0
	 */
	connectedCallback() {
		super.connectedCallback();

		this.messageQueue = [];
		this.displayTime = +this.getAttribute("defaultDisplayTime") || 10; // Time in seconds
		this.messagePosition = this.getAttribute("defaultPosition") || "top";
		this.messageTransition = this.getAttribute("defaultTransition") || ""; // Default is no transition
		this.displayTimer = null;
		this.contextNode = null;
	}

	setContext() {
		this.contextNode = this.context.topNode;

		// Listen for notification events from the chartEngine
		this.context.stx.addEventListener("notification", (props) =>
			this.newMessage(props)
		);
		this.context.stx.append("resizeChart", () => this.handleResize());
	}

	/**
	 * Updates the position settings of all toasts (all DOM elements with class
	 * `cq-toast-message`), including those not currently displayed, when the chart is resized.
	 *
	 * @alias handleResize
	 * @memberof WebComponents.cq-message-toaster#
	 * @since 8.2.0
	 */
	handleResize() {
		for (let idx = 0; idx < this.messageQueue.length; idx++) {
			if (this.messageQueue[idx].isDisplayed)
				this.positionElement(this.messageQueue[idx]);
		}
	}

	/**
	 * Sets the display position of the toast identified by `messageElement` within the bounds of
	 * the chart canvas. Centers the toast horizontally and positions it vertically based on the
	 * toast's <a href="WebComponents.cq-message-toaster.html#createMessageElement">
	 * <code class="codeLink">position</code></a> setting.
	 *
	 * @param {HTMLElement} messageElement The toast DOM element to position.
	 *
	 * @alias positionElement
	 * @memberof WebComponents.cq-message-toaster#
	 * @since 8.2.0
	 */
	positionElement(messageElement) {
		const canvasBounds = this.context.stx.chart.canvas.getBoundingClientRect();
		const contextBounds = this.contextNode.getBoundingClientRect();
		const bottomAlign = messageElement.classList.contains("align-bottom");

		let offsetTop = canvasBounds.top - contextBounds.top;
		let offsetLeft = canvasBounds.left - contextBounds.left;

		Object.assign(messageElement.style, {
			top: bottomAlign
				? offsetTop + canvasBounds.height + "px"
				: offsetTop + "px",
			left: offsetLeft + canvasBounds.width * 0.5 + "px"
		});
	}

	/**
	 * Creates a new toast DOM element. Toast elements have the `cq-toast-message` class attribute.
	 *
	 * @param {object} notification Data object from a "notification" event. See
	 * 		[notificationEventListener]{@link CIQ.ChartEngine~notificationEventListener}.
	 * 		<p>**Note:** This parameter does not accommodate the string type specified in
	 * 		[notificationEventListener]{@link CIQ.ChartEngine~notificationEventListener}.
	 * @param {string} notification.message Text to display in the toast notification. Strings
	 * 		longer than 160 characters are truncated.
	 * @param {string} [notification.position="top"] Position of the toast on the chart: "top" or
	 * 		"bottom". Overrides the `defaultPosition` attribute of the
	 * 		[`<cq-message-toaster>`]{@link WebComponents.cq-message-toaster} element.
	 * @param {string} [notification.type="info"] Toast style: "info", "error", "warning", or
	 * 		"confirmation". Overrides the `defaultTransition` attribute of the
	 * 		[`<cq-message-toaster>`]{@link WebComponents.cq-message-toaster} element.
	 * @param {string} [notification.transition] Type of animation used to display and dismiss the
	 * 		toast: "fade", "slide", "pop" or "drop". The default is no transition.
	 * @param {number} [notification.displayTime=10] Number of seconds to display the toast before
	 * 		automatically dismissing it. A value of 0 causes the toast to remain on
	 * 		screen&nbsp;&mdash;&nbsp;preventing other toasts from
	 * 		displaying&nbsp;&mdash;&nbsp;until the toast is selected by the user. Overrides the
	 * 		`defaultDisplayTime` attribute of the
	 * 		[`<cq-message-toaster>`]{@link WebComponents.cq-message-toaster} element.
	 * @param {number} [notification.priority=0] Priority of the toast relative to others in the
	 * 		display queue. Higher priority toasts are displayed before toasts with lower priority.
	 * 		For example, a toast with priority&nbsp;=&nbsp;4 is displayed before a toast with
	 * 		priority&nbsp;=&nbsp;1. Toasts with the same priority are displayed in the order
	 * 		they were created; that is, in the order they entered the display queue.
	 * @param {Function} [notification.callback] Function to call when the toast is selected
	 * 		(dismissed) by the user. If the toast is dismissed automatically (see `displayTime`),
	 * 		this function is not called.
	 * @return {HTMLElement} A toast DOM element.
	 *
	 * @alias createMessageElement
	 * @memberof WebComponents.cq-message-toaster#
	 * @since 8.2.0
	 */
	createMessageElement(notification) {
		if (!notification.message) return;

		let {
			message,
			position,
			type,
			transition,
			displayTime,
			priority,
			callback
		} = notification;

		displayTime = parseInt(displayTime);
		// A value of 0 will prevent the message from removing automatically.
		if (displayTime !== 0) displayTime = displayTime || this.displayTime;
		position = position || this.messagePosition;
		transition = transition || this.messageTransition;
		priority = priority || 0;

		// Truncate a string longer than 160 characters
		if (message.length > 160) {
			message = message.slice(0, 160) + "...";
		}

		let messageElement = document.createElement("div");
		messageElement.innerHTML = `
			<div class="cq-message-container">
				<div class="cq-message-icon"></div>
				<div class="cq-message-text"></div>
			</div>`;
		messageElement
			.querySelector(".cq-message-text")
			.appendChild(CIQ.translatableTextNode(this.context.stx, message));
		messageElement.classList.add("cq-toast-message");
		messageElement.classList.add("type-" + type);
		if (transition)
			messageElement.classList.add("animate", "transition-" + transition);
		if (position == "bottom") messageElement.classList.add("align-bottom");
		messageElement.displayTime = displayTime;
		messageElement.priority = priority;

		CIQ.safeClickTouch(
			messageElement,
			function (messageElement, callback, event) {
				event.stopPropagation();
				if (callback) callback();
				this.removeMessageNode(messageElement);
			}.bind(this, messageElement, callback)
		);

		this.positionElement(messageElement);

		return messageElement;
	}

	/**
	 * Displays the next toast in the display queue and sets a timer based on the toast
	 * <a href="WebComponents.cq-message-toaster.html#newMessage"><code class="codeLink">
	 * displayTime</code></a> property to automatically dismiss the toast.
	 *
	 * @alias displayNextMessage
	 * @memberof WebComponents.cq-message-toaster#
	 * @since 8.2.0
	 */
	displayNextMessage() {
		if (!this.messageQueue.length) return;

		let messageNodes = this.contextNode.querySelector(".cq-toast-message");
		if (!messageNodes) {
			let nextMessage = this.messageQueue[0];
			// Toast Message nodes are added to the body to ensure they appear over all other UI elements (e.g. Dialogs)
			this.contextNode.appendChild(nextMessage);
			nextMessage.isDisplayed = true;
			if (nextMessage.displayTime !== 0) {
				this.displayTimer = window.setTimeout(
					this.removeMessageNode.bind(this, nextMessage),
					nextMessage.displayTime * 1000
				);
			}
		}
	}

	/**
	 * Removes the toast specified by `messageNode` from the display queue and displays the next
	 * message in the queue.
	 *
	 * @param messageNode The toast to remove from the display queue.
	 *
	 * @alias removeMessageNode
	 * @memberof WebComponents.cq-message-toaster#
	 * @since 8.2.0
	 */
	removeMessageNode(messageNode) {
		if (messageNode.classList.contains("hide")) return;

		messageNode.classList.add("hide");
		let delayTime = messageNode.classList.contains("animate") ? 500 : 0;

		window.setTimeout(() => {
			// Remove the node from the dom
			messageNode.remove();
			// Remove the node from the queue
			this.messageQueue.splice(this.messageQueue.indexOf(messageNode), 1);
			if (this.displayTimer)
				this.displayTimer = window.clearTimeout(this.displayTimer);
			this.displayNextMessage();
		}, delayTime);
	}

	/**
	 * Removes the toast specified by `messageNode` from the DOM but not from the display queue.
	 *
	 * Use this function to interrupt a toast and display one of higher priority. The interrupted
	 * toast is re-displayed by the next call to
	 * [displayNextMessage](WebComponents.cq-message-toaster.html#displayNextMessage).
	 *
	 * @param messageNode The toast to recall.
	 *
	 * @alias recallMessageNode
	 * @memberof WebComponents.cq-message-toaster#
	 * @since 8.2.0
	 */
	recallMessageNode(messageNode) {
		if (messageNode.isDisplayed) {
			if (this.displayTimer)
				this.displayTimer = window.clearTimeout(this.displayTimer);
			messageNode.isDisplayed = false;
			this.context.topNode.removeChild(messageNode);
		}
	}

	/**
	 * Creates a new toast and adds it to a queue that determines the display sequence of
	 * concurrent toasts.
	 *
	 * This function is the "notification" event listener. See
	 * [notificationEventListener]{@link CIQ.ChartEngine~notificationEventListener}.
	 *
	 * @param {object|string} notification Either an object containing data relevant to the
	 * 		notification event or a string that identifies a property of the `systemMessages`
	 * 		property of the chart configuration object. The property contained in `systemMessages`
	 * 		is an object literal that specifies data relevant to the notification event (see
	 * 		<a href="tutorial-Chart%20Configuration.html#systemmessages" target="_blank">
	 * 		<code class="codeLink">systemMessages</code></a> in the
	 * 		<a href="tutorial-Chart%20Configuration.html" target="_blank">Chart Configuration</a>
	 * 		tutorial).
	 * @param {string} notification.message Text to display in the toast notification. Strings
	 * 		longer than 160 characters are truncated.
	 * @param {string} [notification.position="top"] Position of the toast on the chart: "top" or
	 * 		"bottom". Overrides the `defaultPosition` attribute of the
	 * 		[`<cq-message-toaster>`]{@link WebComponents.cq-message-toaster} element.
	 * @param {string} [notification.type="info"] Toast style: "info", "error", "warning", or
	 * 		"confirmation". Overrides the `defaultTransition` attribute of the
	 * 		[`<cq-message-toaster>`]{@link WebComponents.cq-message-toaster} element.
	 * @param {string} [notification.transition] Type of animation used to display and dismiss the
	 * 		toast: "fade", "slide", "pop" or "drop". The default is no transition.
	 * @param {number} [notification.displayTime=10] Number of seconds to display the toast before
	 * 		automatically dismissing it. A value of 0 causes the toast to remain on
	 * 		screen&nbsp;&mdash;&nbsp;preventing other toasts from
	 * 		displaying&nbsp;&mdash;&nbsp;until the toast is selected by the user. Overrides the
	 * 		`defaultDisplayTime` attribute of the
	 * 		[`<cq-message-toaster>`]{@link WebComponents.cq-message-toaster} element.
	 * @param {number} [notification.priority=0] Priority of the toast relative to others in the
	 * 		display queue. Higher priority toasts are displayed before toasts with lower priority.
	 * 		For example, a toast with priority&nbsp;=&nbsp;4 is displayed before a toast with
	 * 		priority&nbsp;=&nbsp;1. Toasts with the same priority are displayed in the order
	 * 		they were created; that is, in the order they entered the display queue.
	 * @param {Function} [notification.callback] Function to call when the toast is selected
	 * 		(dismissed) by the user. If the toast is dismissed automatically (see `displayTime`),
	 * 		this function is not called.
	 *
	 * @alias newMessage
	 * @memberof WebComponents.cq-message-toaster#
	 * @since 8.2.0
	 */
	newMessage(notification) {
		if (typeof notification === "string" && this.context.config) {
			if (this.context.config.systemMessages)
				notification = this.context.config.systemMessages[notification];
		}
		if (!notification) return;
		let newMessage = this.createMessageElement(notification);
		if (newMessage) {
			// Determine if the message priority places it ahead of other messages in the queue
			const index = this.messageQueue.findIndex(
				(m) => m.priority < newMessage.priority
			);
			if (index >= 0) {
				// Recall the message if it's already displayed
				if (this.messageQueue[index].isDisplayed)
					this.recallMessageNode(this.messageQueue[index]);
				// Inject the new priority message before the first non-priority message
				this.messageQueue.splice(index, 0, newMessage);
			} else {
				this.messageQueue.push(newMessage);
			}
			this.displayNextMessage();
		}
	}
}

CIQ.UI.addComponentDefinition("cq-message-toaster", MessageToaster);

};


let __js_webcomponents_palette_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */


var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Provides a palette to dock alongside the chart or float above it. Palette components must be
 * placed within a `<cq-palette-dock>` component.
 *
 * @param {Boolean} docked The initial docked state of the palette.
 * @param {String} orientation Accepted values are "horizontal" and "vertical". Horizontal
 * 		palettes dock to the left of the chart. Vertical palettes dock to the top.
 * @param {String} min-height Minimum height to display if not enough content.
 *
 * @namespace WebComponents.cq-palette
 * @since 7.2.0
 *
 * @example
 * <cq-palette docked="true" orientation="horizontal" min-height="40">
 *    <div class="palette-container">
 *        <div class="drag-strip"></div>
 *            ...
 *        <div class="resize-strip"></div>
 *    </div>
 * </cq-palette>
 */
class Palette extends CIQ.UI.ContextTag {
	constructor() {
		super();

		this.dragMargin = 10; // number of px to constrain the draggable area within the chart.
	}

	connectedCallback() {
		if (this.attached) return;
		super.connectedCallback();
	}

	init() {
		this.isDragging = false;
		this.minHeight = parseInt(this.getAttribute("min-height"), 10);
		// If the minimum height is not set, default to 25
		if (isNaN(this.minHeight)) {
			this.minHeight = 25;
		}
		this.paletteDock = this.parentElement.parentElement;
		this.dragStrip = this.querySelector(".drag-strip");
		this.resizeStrip = this.querySelector(".resize-strip");

		// Drag actions are managed by the palette dock
		if (this.dragStrip) {
			this.dragStrip.addEventListener(
				"mousedown",
				this.handleDragResize.bind(this, "dragging")
			);

			this.dragStrip.addEventListener(
				"touchstart",
				this.handleDragResize.bind(this, "dragging"),
				{ passive: false }
			);
		}

		// Resize actions are managed by the palette dock
		if (this.resizeStrip) {
			this.resizeStrip.addEventListener(
				"mousedown",
				this.handleDragResize.bind(this, "resizing")
			);
			this.resizeStrip.addEventListener(
				"touchstart",
				this.handleDragResize.bind(this, "resizing"),
				{ passive: false }
			);
		}

		if (this.paletteDock.paletteSubscribe) {
			this.sendMessage = this.paletteDock.paletteSubscribe(
				this.handleMessage.bind(this)
			);
		}
	}

	get hide() {
		return this.getAttribute("hide");
	}

	set hide(newValue) {
		this.setAttribute("hide", newValue);
	}

	get docked() {
		return this.getAttribute("docked");
	}

	set docked(newValue) {
		this.setAttribute("docked", newValue);
	}

	get orientation() {
		return this.getAttribute("orientation");
	}

	set orientation(newValue) {
		this.setAttribute("orientation", newValue);
	}

	static get observedAttributes() {
		return ["docked", "hide"];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		switch (name) {
			case "docked":
				if (newValue === "false") {
					this.setTransform(100, 70);
					this.setHeightByScale(0.8);
				} else {
					this.style.transform = "";
				}
				break;
		}
	}

	// Sets dragging property in dock for this palette for mouse and touch events.
	handleDragResize(method, event) {
		if (this.paletteDock.hasOwnProperty("dragging")) {
			this.paletteDock.startDrag(this, method);
		}
	}

	// Overloaded by child objects to respond to messaging sent from other palettes
	handleMessage(id, message) {
		return {
			id: id,
			message: message
		};
	}

	detach(xPos, yPos) {
		let breakSm = document.body.classList.contains("break-sm");
		// Never detach on small screens
		if (this.docked === "true" && !breakSm) {
			this.docked = "false";
			// Set a safe default position  when detaching
			xPos = xPos || 10;
			yPos = yPos || 10;

			// Get the parent bounds to check position
			let parentBounds = { top: 0, left: 0, width: 0, height: 0 };
			if (this.paletteDock.getBounds) {
				parentBounds = this.paletteDock.getChartBoundsOffset();
			}
			// When the palette is detached to a location, it should show all or most of its contents even if the location is close to the right edge
			// Check the position of the palette against the right bound of the parent
			if (xPos > parentBounds.left + parentBounds.width - this.clientWidth) {
				xPos = parentBounds.left + parentBounds.width - this.clientWidth;
			}
			// Always set the position for instances where repositioning is necessary.
			this.setTransformPosition(xPos, yPos);
			this.paletteDock.setChartDimensions();
			this.paletteDock.setVerticalPaletteHeight();
		}
	}

	dock() {
		if (this.docked === "false") {
			this.docked = "true";
			this.paletteDock.setChartDimensions();
			this.paletteDock.setVerticalPaletteHeight();
		}
	}

	getHeight() {
		return this.clientHeight;
	}

	getWidth() {
		return this.clientWidth;
	}

	// Get the offset position of the palette and call setTransformPosition
	// to clamp the palette position in the event of a chartContainer resize
	checkPosition() {
		let parentBounds = { top: 0, left: 0, width: 0, height: 0 };
		if (this.paletteDock.getBounds) {
			parentBounds = this.paletteDock.getChartBoundsOffset();
		}
		// Get the xyz values in px
		const transformValue = this.style.transform.split(/\w+\(|\);?/);
		// Parse out the integer values from the style
		const coordinates = transformValue[1].split(/,\s?/g).map(function (val) {
			return parseInt(val);
		});
		// Apply the offsets normally produced by the mouse pointer. Nneeded to satisfy setTransformPosition
		coordinates[0] += parentBounds.left + this.dragStrip.clientWidth * 0.5;
		coordinates[1] += parentBounds.top + this.dragStrip.clientHeight * 0.5;

		this.setTransformPosition(coordinates[0], coordinates[1]);
	}

	// Set the palette transform property based on mouse position
	setTransformPosition(x, y) {
		let parentBounds = { top: 0, left: 0, width: 0, height: 0 };
		if (this.paletteDock.getBounds) {
			parentBounds = this.paletteDock.getChartBoundsOffset();
		}
		let nextTop = Math.floor(
			y - parentBounds.top - this.dragStrip.clientHeight * 0.5
		);
		let nextLeft = Math.floor(
			x - parentBounds.left - this.dragStrip.clientWidth * 0.5
		);

		// Clamp the top position within chart bounds
		nextTop = Math.min(
			Math.max(nextTop, this.dragMargin),
			parentBounds.height - (this.dragStrip.clientHeight + this.dragMargin)
		);
		// Clamp the left position within chart bounds
		nextLeft = Math.min(
			Math.max(nextLeft, this.dragMargin),
			parentBounds.width - (this.dragStrip.clientWidth + this.dragMargin)
		);

		this.setTransform(nextLeft, nextTop);
	}

	// Set the palette transform property explicitly
	setTransform(x, y) {
		this.style.transform = "translate3d(" + x + "px," + y + "px, 0px)";
	}

	// Set the palette height property based on mouse position
	setHeightToPosition(yPosition) {
		let parentBounds = { top: 0, left: 0, width: 0, height: 0 };
		if (this.paletteDock.getBounds) {
			parentBounds = this.paletteDock.getBounds();
		}

		let paletteViewportOffset = this.getBoundingClientRect();
		let nextHeight = yPosition - paletteViewportOffset.top;

		if (this.orientation === "vertical") {
			if (
				nextHeight > this.minHeight &&
				nextHeight + (paletteViewportOffset.top - parentBounds.top) <
					parentBounds.height
			) {
				this.setHeight(nextHeight);
			}
		}
	}

	// Set the palette height property relative to its current height property
	setHeightByScale(scale) {
		this.style.height =
			Math.floor(parseInt(this.style.height, 10) * scale) + "px";
	}

	// Set the palette height property explicitly
	setHeight(nextHeight) {
		this.style.height = nextHeight + "px";
	}
}

CIQ.UI.addComponentDefinition("cq-palette", Palette);

};


let __js_webcomponents_paletteDock_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * A container for `<cq-palette>` components. Provides docking and dragging capabilities to child
 * palettes.
 *
 * The `<cq-palette-dock>` element does not wrap the chart. It must be a sibling of the chart
 * container.
 *
 * @namespace WebComponents.cq-palette-dock
 * @since 7.2.0
 *
 * @example
 * <cq-palette-dock>
 *    <div class="palette-dock-container">
 *        ...
 *    </div>
 * </cq-palette-dock>
 */
class PaletteDock extends CIQ.UI.ContextTag {
	constructor() {
		super();
		//let shadowRoot = this.attachShadow({mode: 'open'});
		//shadowRoot.innerHTML = this.render();

		this.dragging = false; /* pointer to the palette currently dragging */
		this.paletteRegistry = [];
		// Use to store and cancel the mouseout check
		this.mouseOutCk = false;
	}

	connectedCallback() {
		if (this.attached) return;
		super.connectedCallback();
	}

	initListeners() {
		const { stx, config = {} } = this.context;
		const self = this;
		const handleResize = self.handleResize.bind(this);

		this.setVerticalPaletteHeight();

		// palette mouse events are handled here, on the parent, to prevent losing the event if the pointer moves off the palette
		this.addEventListener("touchend", (e) => this.stopDrag(e));
		this.addEventListener("touchmove", handleTouchMove, { passive: false });

		this.addEventListener("mouseup", (e) => this.stopDrag(e));
		this.addEventListener("mouseleave", handleMouseLeave);
		this.addEventListener("mouseenter", handleMouseEnter);
		this.addEventListener("mousemove", handleMouseMove);

		// Close a palette context menu when clicking anywhere over the chart
		this.addEventListener("mousedown", this.stopContext.bind(this));

		// respond to resizes, prevent loops
		stx.append("resizeChart", () => handleResize({ resizeChart: false }));

		const channel = (config.channels || {}).drawing || "channel.drawing";
		this.channelSubscribe(channel, handleEnableDrawing);

		function handleMouseLeave(event) {
			self.context.stx.showCrosshairs();
			// An extra guard against spastic mousing.
			// Mouseout of the draggable area does not immediately cancel in case
			// the user unintentionally leaves the area for a brief moment
			self.mouseOutCk = setTimeout(() => self.stopDrag(), 500);
		}

		function handleMouseEnter(event) {
			self.context.stx.undisplayCrosshairs();
			if (!self.dragging) return;

			// Checking for a re-entry while the mouse button is still down
			if (event.buttons === 1) {
				clearTimeout(self.mouseOutCk);
				return;
			}
			// If all else fails, cancel the drag
			self.stopDrag();
		}

		function handleMouseMove(event) {
			if (self.dragging) {
				event.stopPropagation();
				if (self.dragging.classList.contains("dragging")) {
					self.dragging.setTransformPosition(event.clientX, event.clientY);
				}
				if (self.dragging.classList.contains("resizing")) {
					self.dragging.setHeightToPosition(event.clientY);
				}
			}
		}

		function handleTouchMove(event) {
			if (self.dragging && event.touches[0]) {
				event.stopPropagation();
				if (self.dragging.classList.contains("dragging")) {
					self.dragging.setTransformPosition(
						event.touches[0].clientX,
						event.touches[0].clientY
					);
				}
				if (self.dragging.classList.contains("resizing")) {
					self.dragging.setHeightToPosition(event.touches[0].clientY);
				}
			}
		}

		function handleEnableDrawing(value) {
			self.setChartDimensions();
			// if (value) this.dockAllPalettes();
			stx.resizeChart();
		}
	}

	setContext() {
		this.initListeners();
	}

	// Provide a means for the dispirate palettes to communicate
	palettePublish(id, message) {
		for (
			var paletteIdx = 0;
			paletteIdx < this.paletteRegistry.length;
			paletteIdx++
		) {
			this.paletteRegistry[paletteIdx](id, message);
		}
	}

	paletteSubscribe(paletteCallback) {
		this.paletteRegistry.push(paletteCallback);
		return this.palettePublish.bind(this);
	}

	// Get bounds of the chart container
	getBounds() {
		return this.parentNode.getBoundingClientRect();
	}

	// Get bounds of the chart within the chart container
	getChartBounds() {
		let clientBounds = this.parentNode.getBoundingClientRect();
		let bounds = {
			top: 0,
			left: 0,
			height: clientBounds.height,
			width: clientBounds.width
		};

		var palettes = this.querySelectorAll('[docked="true"]');
		for (var paletteIdx = 0; paletteIdx < palettes.length; paletteIdx++) {
			var palette = palettes[paletteIdx];
			if (palette.orientation === "vertical") {
				bounds.width -= palette.getWidth();
				bounds.left += palette.getWidth();
			} else if (palette.orientation === "horizontal") {
				bounds.height -= palette.getHeight();
				bounds.top += palette.getHeight();
			}
		}
		return bounds;
	}

	getChartBoundsOffset() {
		let clientBounds = this.parentNode.getBoundingClientRect();
		let bounds = this.getChartBounds();

		bounds.top += clientBounds.top;
		bounds.left += clientBounds.left;

		return bounds;
	}

	// Handle the drawing palette contextual menu open state ti allow clicking anywhere over the chart to close
	startContext() {
		this.classList.add("context");
	}

	stopContext() {
		this.classList.remove("context");
		this.palettePublish("context", "stop");
	}

	// Indicate a palette is presently in dragging mode
	// Extends overlay via css in dragging mode to capture mouse position
	startDrag(palette, paletteMode) {
		var palettes = this.querySelectorAll('[docked="false"]');
		for (var paletteIdx = 0; paletteIdx < palettes.length; paletteIdx++) {
			palettes[paletteIdx].style.zIndex = 1; // Drop down any palettes which were previously bumped to the top of the z-index
		}

		// Default to dragging unless resizing is specified
		paletteMode = paletteMode || "dragging";
		this.dragging = palette;
		// The palette dock is always dragging regardless of the palette's mode
		this.classList.add("dragging");
		this.dragging.classList.add(paletteMode);
		this.dragging.style.zIndex = 10; // Bump the active palette to the top of the z-index
	}

	stopDrag(e) {
		if (e) e.preventDefault(); // prevent mouse event from firing if both touch and mouse are supported
		this.classList.remove("dragging");
		this.dragging = false;
		this.resizing = false;
		this.node.find('[docked="false"]').each(function () {
			this.node.removeClass("dragging resizing");
		});
	}

	// Indicate a palette is presently in resize mode
	// Extends overlay via css in dragging mode to capture mouse position
	startResize(palette) {
		this.resizing = palette;
		this.classList.add("dragging");
		this.dragging.classList.add("dragging");
	}

	handleResize({ resizeChart = true } = {}) {
		// Notify palettes that a resize is about to occur
		this.palettePublish("dockWillResize");
		this.setChartDimensions();
		this.setVerticalPaletteHeight();

		let breakSm = document.body.classList.contains("break-sm");
		// Palettes can move out of view or the display context can change to mobile,
		// so adjust the floating palettes on resize
		var palettes = this.querySelectorAll('[docked="false"]');
		for (var paletteIdx = 0; paletteIdx < palettes.length; paletteIdx++) {
			var palette = palettes[paletteIdx];
			if (breakSm) {
				// If in the mobile context, double check that all palettes are docked
				palette.dock();
			} else {
				// Set detached palettes positions equal to themselves. setTransformPosition will
				// check against the chart bounds and move the palette if it will go off-screen
				palette.checkPosition();
			}
		}

		// Notify palettes that a resize has occured
		this.palettePublish("dockDidResize");

		// prevent loop as this function is can be invoked on resizeChart injection
		if (resizeChart) this.context.stx.resizeChart();
	}

	setVerticalPaletteHeight() {
		// Set height of vertically oriented child palettes
		this.node.find("[orientation=vertical]").each(
			function (idx, elem) {
				if (elem.getAttribute("docked") === "true") {
					elem.style.height = this.parentNode.clientHeight + "px";
				}
			}.bind(this)
		);
	}

	// Resize chart to accomodate palette gutters
	setChartDimensions() {
		const chartContainer = this.context.stx.chart.container;
		const { top, left, width, height } = this.getChartBounds();

		const { config } = this.context;
		if (config && config.channels) {
			this.channelWrite(
				config.channels.drawingPalettes || "channel.drawingPalettes",
				{
					top,
					left,
					width,
					height
				}
			);
		} else {
			// configuration not available support previous direct updates (React app using v7.3)
			chartContainer.style.width = width + "px";
			chartContainer.style.height = height + "px";

			chartContainer.style.top = top + "px";
			chartContainer.style.left = left + "px";
		}

		// Align any horizontal docked palettes with the chart left
		var hPalettes = this.querySelectorAll('[orientation="horizontal"]');
		for (var hPaletteIdx = 0; hPaletteIdx < hPalettes.length; hPaletteIdx++) {
			var hPalette = hPalettes[hPaletteIdx];
			// Offset horizontal palettes by the width of the vertical palettes
			// Add 1px for the border
			hPalette.style.left = left + 1 + "px";
			hPalette.style.width = width + "px";
		}
		// Align any vertical docked palettes with the chart left
		var vPalettes = this.querySelectorAll('[orientation="vertical"]');
		for (var vPaletteIdx = 0; vPaletteIdx < vPalettes.length; vPaletteIdx++) {
			var vPalette = vPalettes[vPaletteIdx];
			// Only offset vertical palettes when undocked. Docked vertical palettes are flush with the chart top edge.
			if (vPalette.docked === "false") {
				vPalette.style.top = top + "px";
			} else {
				vPalette.style.top = 0;
			}
		}
	}

	dockAllPalettes() {
		var palettes = this.querySelectorAll('[docked="false"]');
		for (var paletteIdx = 0; paletteIdx < palettes.length; paletteIdx++) {
			palettes[paletteIdx].dock();
		}
	}
}

CIQ.UI.addComponentDefinition("cq-palette-dock", PaletteDock);

};


let __js_webcomponents_redo_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Redo web component `<cq-redo>`.
 *
 * Pairs with {@link WebComponents.cq-undo} to redo changes to a drawing.
 *
 * @namespace WebComponents.cq-redo
 *
 * @example
 * <cq-undo-section>
 *     <cq-undo class="ciq-btn">Undo</cq-undo>
 *     <cq-redo class="ciq-btn">Redo</cq-redo>
 * </cq-undo-section>
 */
class Redo extends CIQ.UI.ContextTag {
	/**
	 * Finds {@link WebComponents.cq-undo} and pairs with it to find the last undo and reverse it.
	 * @param {WebComponents.cq-undo} A cq-undo webcomponent
	 * @alias pairUp
	 * @memberof WebComponents.cq-redo
	 * @example
	 * document.querySelector("cq-redo").pairUp(document.querySelector("cq-undo"));
	 */
	pairUp(undo) {
		this.undo = undo;
		this.undo.redoButton = this;
		var self = this;
		CIQ.UI.stxtap(this, function () {
			self.undo.redo();
		});
	}
}

CIQ.UI.addComponentDefinition("cq-redo", Redo);

};


let __js_webcomponents_scroll_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Scroll web component `<cq-scroll>`.
 *
 * The cq-scroll web component creates a scrollable container, which resizes itself when the screen
 * is resized. If CIQ.UI.scrollbarStyling is initialized to a scrollbar implementation (such as
 * PerfectScrollbar), the scrollbar implementation replaces the native scrollbar.
 *
 * **Keyboard control**
 *
 * When selected with tab key navigation and activated with Return/Enter, this component has the
 * following internal controls:
 * - Up/Down arrow &mdash; Move selection between internal cq-item elements.
 * - Left/Right arrow &mdash; Select a control within a selected cq-item element, such as
 * Remove and Edit buttons. Child elements must have the attribute `keyboard-selectable-child` set
 * to "true" to be selectable with these keys.
 *
 * **Attributes**
 * - cq-no-claim &mdash; Do not apply any keystroke capturing
 * - cq-no-maximize &mdash; Do not automatically maximize the height (but keep it showing on screen)
 * - cq-no-resize &mdash; Do not apply any sizing logic
 *
 * Use `this.dataPortion` to dynamically inject items into the list.
 *
 * @namespace WebComponents.cq-scroll
 * @since
 * - 6.1.0 Added `cq-no-claim` attribute.
 * - 8.3.0 Enabled internal keyboard navigation and selection.
 *
 * @example
 * <cq-lookup-results>
 *     <cq-lookup-filters cq-no-close>
 *         <cq-filter class="true">ALL</cq-filter>
 *         <cq-filter>STOCKS</cq-filter>
 *         <cq-filter>FX</cq-filter>
 *         <cq-filter>INDEXES</cq-filter>
 *         <cq-filter>FUNDS</cq-filter>
 *         <cq-filter>FUTURES</cq-filter>
 *     </cq-lookup-filters>
 *     <cq-scroll></cq-scroll>
 * </cq-lookup-results>
 */
class Scroll extends CIQ.UI.BaseComponent {
	connectedCallback() {
		if (this.attached) return;
		super.connectedCallback();
		if (!this.hasAttribute("cq-no-claim")) this.addClaim(this);
		if (this.hasAttribute("cq-no-scroll")) return;
		// Setting CSS in constructor will throw exception when calling document.createElement (done in plugins)
		// So set default CSS here when connected instead.
		this.style.overflowY = "auto";
		this.uiManager = CIQ.UI.getUIManager();
		if (this.uiManager.length > 0) this.uiManager = this.uiManager[0];

		// prevent mousewheel event from propagating up to parents, such as when embedded
		// in a chart, e.g. comparison lookup component
		this.addEventListener(
			CIQ.wheelEvent,
			function (e) {
				e.stopPropagation();
			},
			{ passive: false }
		);

		var self = this;
		CIQ.UI.addResizeListener(this, function () {
			self.resize();
		});
		this.resize();
	}

	disconnectedCallback() {
		CIQ.UI.removeResizeListener(this);
		super.disconnectedCallback();
	}

	/**
	 * Returns the focused element or null. An item is focused if it has
	 * attribute cq-focused.
	 * @return {HTMLElement} The element or null
	 * @alias focused
	 * @memberof WebComponents.cq-scroll
	 */
	focused() {
		var focused = this.node.find("cq-item[cq-focused]");
		if (focused.length) return focused[0];
		return null;
	}

	/**
	 * Scroll components can handle up and down enter keystrokes.
	 * They do not register for claims directly. Another section of code must
	 * establish the claim on their behalf or proxy the keystroke.
	 *
	 * Up and down arrows will iterate through cq-item tags. The attribute
	 * cq-focused will be added to the currently focused tag. This can then be
	 * queried later, such as when a user hits enter.
	 *
	 * space bar or enter will call the selectFC callback on the cq-item if it exists
	 * @param {undefined} hub Unused parameter
	 * @param {string} key Key that was stroked
	 * @param {object} e The event object
	 * @return {boolean}
	 */
	keyStroke(hub, key, e) {
		const activeElements = document.querySelectorAll(".stxMenuActive *");
		if (!Array.from(activeElements).includes(this)) {
			return;
		}
		if (!CIQ.trulyVisible(this)) return false;
		if (this.keyboardNavigationWait && !this.keyboardNavigation) {
			return;
		}

		const items = this.querySelectorAll(
			"[keyboard-selectable='true'], cq-item:not(.item-hidden)"
		);
		if (!items.length) return;

		if (key == " " || key == "Spacebar" || key == "Enter") {
			const focused = this.findFocused(items);
			if (!focused || !focused.length) return;
			const childItemsSelected = focused[0].querySelectorAll(
				"[keyboard-selectable-child='true'][cq-focused]"
			);
			if (childItemsSelected.length) this.clickItem(childItemsSelected[0], e);
			else this.clickItem(focused[0], e);
		} else if (key == "ArrowDown" || key == "Down") {
			this.focusNextItem(items);
		} else if (key == "ArrowUp" || key == "Up") {
			this.focusNextItem(items, true);
		} else if (key == "ArrowRight" || key == "Right") {
			const focused = this.findFocused(items);
			if (!focused || !focused.length) return;
			const childItems = focused[0].querySelectorAll(
				"[keyboard-selectable-child='true']"
			);
			if (childItems.length) this.focusNextItem(childItems);
		} else if (key == "ArrowLeft" || key == "Left") {
			const focused = this.findFocused(items)[0];
			if (!focused) return;
			const childItems = focused.querySelectorAll(
				"[keyboard-selectable-child='true']"
			);
			// If the end of the child items has been reached select the parent item instead
			if (childItems.length && !this.focusNextItem(childItems, true)) {
				this.removeFocused(childItems);
				this.focusItem(focused);
			}
		}
		return true;
	}

	/**
	 * Overrides [focusItem](CIQ.UI.BaseComponent.html#focusItem) in
	 * [CIQ.UI.BaseComponent]{@link CIQ.UI.BaseComponent}.
	 *
	 * Scrolls to an item and gives the item focus.
	 *
	 * @param {HTMLElement} item The element to scroll to and focus. Must be a child of this
	 * component.
	 *
	 * @alias focusItem
	 * @memberof WebComponents.cq-scroll#
	 * @since 8.3.0
	 */
	focusItem(item) {
		this.scrollToElement(item);
		super.focusItem(item);
	}

	onKeyboardDeselection() {
		// If we're using keyboard navigation, return the highlight to the tab selected element
		if (this.keyboardNavigation && this.keyboardNavigation !== null)
			this.keyboardNavigation.highlightPosition();
	}

	resize() {
		var node = this.node;
		var context = CIQ.UI.getMyContext(this);
		if (node.parents(".sharing").length)
			return; /*share.js appends this class to the body.
			Do not attempt unnecessary resize of scroll
			for a chart about to become a shared image.*/
		if (this.hasAttribute("cq-no-resize")) return;
		if (this.hasAttribute("cq-no-maximize")) this.noMaximize = true;
		var position = this.getBoundingClientRect();
		var reduceMenuHeight = this.reduceMenuHeight || 45; // defaulted to 45 to take into account 15px of padding on menus and then an extra 5px for aesthetics
		var contextHeight, contextTop;
		if (context && context.topNode) {
			var contextRect = context.topNode.getBoundingClientRect();
			contextHeight = contextRect.height;
			contextTop = contextRect.top;
		} else {
			// Fallback to the window height if context element cannot be found
			contextHeight = window.innerHeight;
			contextTop = 0;
		}
		if (!contextHeight) return;
		var height = contextHeight - (position.top - contextTop) - reduceMenuHeight;
		var holders = node.parents(".stx-holder,.stx-subholder,.chartContainer");
		if (holders.length) {
			holders.each(function () {
				var holderBottom =
					this.getBoundingClientRect().top + CIQ.elementDimensions(this).height;
				height = Math.min(height, holderBottom - position.top - 5); // inside a holder we ignore reduceMenuHeight, but take off 5 pixels just for aesthetics
			});
		}

		// If there are subsequent siblings that have a fixed height then make room for them
		var nextAll = node.nextAll();
		for (var i = 0; i < nextAll.length; i++) {
			var sibling = nextAll[i];
			if (sibling && !CIQ.trulyVisible(sibling)) continue; // skip hidden siblings
			height -= CIQ.elementDimensions(sibling, {
				border: 1,
				padding: 1,
				margin: 1
			}).height;
		}
		if (!this.noMaximize) node.css({ height: height + "px" });
		node.css({ "max-height": height + "px" });
		this.refresh();
	}

	/**
	 * Scrolls to an element.
	 *
	 * @param {HTMLElement} item The element to scroll to. Must be a child of this component.
	 *
	 * @alias scrollToElement
	 * @memberof WebComponents.cq-scroll#
	 */
	scrollToElement(item) {
		var bottom = this.clientHeight,
			scrolled = this.scrollTop;
		var itemBottom = item.offsetTop + item.clientHeight;
		if (item.offsetTop > scrolled && itemBottom < bottom + scrolled) return;
		this.scrollTop = Math.max(itemBottom - bottom, 0);
		this.refresh();
	}

	/**
	 * Scroll back to top
	 */
	top() {
		this.scrollTop = 0;
		this.refresh();
	}

	/*
	 * Refreshes the scrollbar, if CIQ.UI.scrollbarStyling is enabled.
	 * @since 7.2.0
	 */
	refresh() {
		if (CIQ.UI.scrollbarStyling) CIQ.UI.scrollbarStyling.refresh(this);
	}
}

CIQ.UI.addComponentDefinition("cq-scroll", Scroll);

};


let __js_webcomponents_shareButton_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Share Button web component `<cq-share-button>`.
 *
 * @namespace WebComponents.cq-share-button
 *
 * @example
 * <cq-share-button>
 *     <div stxtap="tap();">Share</div>
 * </cq-share-button>
 */
class ShareButton extends CIQ.UI.ContextTag {
	setContext() {
		this.addDefaultMarkup();
		CIQ.safeClickTouch(this, () => this.tap());
	}

	/**
	 * Opens a customizable dialog that can share a chart.
	 * @alias tap
	 * @memberof WebComponents.cq-share-button
	 */
	tap(e) {
		const { context } = this;
		if (context.config) {
			this.channelWrite(
				context.config.channels.dialog,
				{ type: "share", params: { context } },
				context.stx
			);
		} else {
			const shareDialog = document.querySelector("cq-share-dialog");
			if (shareDialog && shareDialog.open) shareDialog.open({ context });
		}
	}
}

ShareButton.markup = "<div>Share</div>";
CIQ.UI.addComponentDefinition("cq-share-button", ShareButton);

};


let __js_webcomponents_shareDialog_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */




var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

if (!CIQ.Share) {
	console.error(
		"shareDialog component requires first activating share feature."
	);
} else {
	/**
	 * Share dialog web component `<cq-share-dialog>`.
	 *
	 * @namespace WebComponents.cq-share-dialog
	 *
	 * @example
	 * <cq-dialog>
	 *     <cq-share-dialog>
	 *         <h4 class="title">Share Your Chart</h4>
	 *         <cq-close></cq-close>
	 *         <div cq-share-dialog-div>
	 *             <cq-separator></cq-separator>
	 *             <cq-share-create class="ciq-btn" stxtap="share()">Create Image</cq-share-create>
	 *             <cq-share-generating>Generating Image</cq-share-generating>
	 *             <cq-share-uploading>Uploading Image</cq-share-uploading>
	 *             <div class="share-link-div"></div>
	 *             <cq-share-copy class="ciq-btn" stxtap="copy()">Copy Link to Clipboard</cq-share-copy>
	 *             <cq-share-copied>Link Copied!</cq-share-copied>
	 *         </div>
	 *     </cq-share-dialog>
	 * </cq-dialog>
	 */
	class ShareDialog extends CIQ.UI.DialogContentTag {
		open(params) {
			this.addDefaultMarkup();
			this.setState("share-create");
			super.open(params);
		}

		close() {
			this.setState("share-create");
			super.close();
		}

		setState(state) {
			this.addDefaultMarkup();
			this.node.find("div[cq-share-dialog-div]")[0].className = state;
		}

		/**
		 * Shares a chart with default parameters.
		 *
		 * @alias share
		 * @memberof WebComponents.cq-share-dialog
		 */
		share() {
			var stx = this.context.stx;
			var self = this;
			self.setState("share-generate");
			var shareDialog = document.querySelector(
				"cq-share-dialog .share-link-div"
			);
			if (shareDialog) shareDialog.innerHTML = "";
			// "hide" is a selector list, of DOM elements to be hidden while an image of the chart is created.  "cq-comparison-add-label" and ".chartSize" are hidden by default.
			CIQ.UI.bypassBindings = true;
			CIQ.Share.createImage(
				stx,
				{
					hide: [
						".stx_chart_controls",
						".stx-btn-panel",
						".stx_jump_today",
						".stx-baseline-handle",
						".ciq-edit",
						".ciq-close",
						"cq-marker-label"
					]
				},
				function (data) {
					CIQ.UI.bypassBindings = false;
					var id = CIQ.uniqueID();
					var host = "https://share.chartiq.com";
					var startOffset = stx.getStartDateOffset();
					var metaData = {
						layout: stx.exportLayout(),
						drawings: stx.exportDrawings(),
						xOffset: startOffset,
						startDate: stx.chart.dataSegment[startOffset].Date,
						endDate:
							stx.chart.dataSegment[stx.chart.dataSegment.length - 1].Date,
						id: id,
						symbol: stx.chart.symbol
					};
					var url = host + "/upload/" + id;
					var payload = { id: id, image: data, config: metaData };
					self.setState("share-upload");
					CIQ.Share.uploadImage(data, url, payload, function (err, response) {
						self.setState("share-copy");
						if (err !== null) {
							CIQ.alert("error: " + err);
						} else {
							if (shareDialog) shareDialog.innerHTML = host + response;
						}
					});
				}
			);
		}

		copy() {
			var shareDialog = document.querySelector(
				"cq-share-dialog .share-link-div"
			);
			if (!shareDialog) return;
			var linkToCopy = shareDialog.innerText;
			var tempInputElem = document.createElement("input");
			tempInputElem.type = "text";
			tempInputElem.value = linkToCopy;
			tempInputElem.contentEditable = true;
			tempInputElem.readOnly = true;
			document.body.appendChild(tempInputElem);
			tempInputElem.focus();
			tempInputElem.select();
			if (!CIQ.isIE) {
				var range = document.createRange();
				range.selectNodeContents(tempInputElem);
				var s = window.getSelection();
				s.removeAllRanges();
				s.addRange(range);
				tempInputElem.setSelectionRange(0, linkToCopy.length);
			}
			document.execCommand("copy");
			document.body.removeChild(tempInputElem);
			this.setState("share-copied");
		}
	}

	ShareDialog.markup = `
		<h4 class="title">Share Your Chart</h4>
		<cq-close></cq-close>
		<div cq-share-dialog-div>
			<cq-separator></cq-separator>
			<cq-share-create class="ciq-btn" stxtap="share()">Create Image</cq-share-create>
			<cq-share-generating>Generating Image</cq-share-generating>
			<cq-share-uploading>Uploading Image</cq-share-uploading>
			<div class="share-link-div"></div>
			<cq-share-copy class="ciq-btn" stxtap="copy()">Copy Link to Clipboard</cq-share-copy>
			<cq-share-copied>Link Copied!</cq-share-copied>
	`;
	CIQ.UI.addComponentDefinition("cq-share-dialog", ShareDialog);
}

};


let __js_webcomponents_showRange_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Show Range web component `<cq-show-range>`.
 *
 * @namespace WebComponents.cq-show-range
 *
 * @example
 * <cq-show-range>
 *    <div stxtap="set(1,'today');">1d</div>
 *    <div stxtap="set(5,'day',30,2,'minute');">5d</div>
 *    <div stxtap="set(1,'month',30,8,'minute');">1m</div>
 *    <div class="hide-sm" stxtap="set(3,'month');">3m</div>
 *    <div class="hide-sm" stxtap="set(6,'month');">6m</div>
 *    <div class="hide-sm" stxtap="set(1,'YTD');">YTD</div>
 *    <div stxtap="set(1,'year');">1y</div>
 *    <div class="hide-sm" stxtap="set(5,'year',1,1,'week');">5y</div>
 *    <div class="hide-sm" stxtap="set(1,'all',1,1,'month');">All</div>
 * </cq-show-range>
 */
class ShowRange extends CIQ.UI.ContextTag {
	/**
	 * Proxies UI requests for span changes to the chart engine.
	 *
	 * Usage Examples:
	 * - `set(5,'day',30,2,'minute')` means that you want to combine two 30-minute bars into a single candle.
	 *   - So your quote feed must return one data object for every 30 minutes. A total of 2 data points per hour.
	 * - `set(5,'day',2,30,'minute')` means that you want to combine thirty 2-minute bars into a single candle.
	 *   - So your quote feed must return one data object for every 2 minutes. A total of 30 data points per hour.
	 * - `set(5,'day', 1, 60,'minute')` means that you want to combine sixty 1-minute bars into a single candle.
	 *   - So your quote feed must return one data object for every minute . A total of 60 data points per hour.
	 * - `set(5,'day', 60, 1,'minute')` means that you want to have a single 60 minute bar per period.
	 *   - So your quote feed must return one data object for every 60 minutes . A total of 1 data point per hour.
	 *
	 * @param {Object} activator Activation information
	 * @param {Number} multiplier   The period that will be passed to {@link CIQ.ChartEngine#setSpan}
	 * @param {Number} base The interval that will be passed to {@link CIQ.ChartEngine#setSpan}
	 * @param {Number} [interval] Chart interval to use (leave empty for autodetect)
	 * @param {Number} [period] Chart period to use (leave empty for autodetect)
	 * @param {Number} [timeUnit] Chart timeUnit to use (leave empty for autodetect)
	 * @alias set
	 * @memberof WebComponents.cq-show-range
	 * @since 5.1.1 timeUnit added
	 */
	set(activator, multiplier, base, interval, period, timeUnit) {
		var self = this;
		if (self.context.loader) self.context.loader.show();
		var params = {
			multiplier: multiplier,
			base: base
		};
		if (interval) {
			params.periodicity = {
				interval: interval,
				period: period ? period : 1,
				timeUnit: timeUnit
			};
		}
		self.context.stx.setSpan(params, function () {
			if (self.context.loader) self.context.loader.hide();
		});
	}

	setContext(context) {
		const menuItems = context.config && context.config.getMenu("rangeMenu");
		this.addDefaultMarkup(this, menuItems && menuItems.join(""));
	}
}

ShowRange.markup = `
		<div stxtap="set(1,'today');">1D</div>
		<div stxtap="set(5,'day',30,2,'minute');">5D</div>
		<div stxtap="set(1,'month',30,8,'minute');">1M</div>
		<div class="hide-sm" stxtap="set(3,'month');">3M</div>
		<div class="hide-sm" stxtap="set(6,'month');">6M</div>
		<div class="hide-sm" stxtap="set(1,'YTD');">YTD</div>
		<div stxtap="set(1,'year');">1Y</div>
		<div class="hide-sm" stxtap="set(5,'year',1,1,'week');">5Y</div>
		<div class="hide-sm" stxtap="set(1,'all');">All</div>
	`;
CIQ.UI.addComponentDefinition("cq-show-range", ShowRange);

};


let __js_webcomponents_sideNav_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * The side navigation web component `<cq-side-nav>`.
 *
 * Responds to the `breakpoint` and `sidenav` channels to control side navigation panel
 * availability.
 *
 * @namespace WebComponents.cq-side-nav
 * @since 7.5.0
 */
class SideNav extends CIQ.UI.ContextTag {
	/**
	 * Subscribes to the `sidenav`, `breakpoint`, and `tfc` channels. Sets the side navigation
	 * availability based on the contents of the channels.
	 *
	 * @param {object} params context Function parameters.
	 * @param {object} params.config Chart configuration.
	 * @param {object} params.config.channels The web component communication channels.
	 * @param {CIQ.ChartEngine} [stx] A reference to the chart engine. Unused.
	 *
	 * @alias setContext
	 * @memberof WebComponents.cq-side-nav
	 * @since 7.5.0
	 */
	setContext({ config: { channels = {} } = {}, stx }) {
		const node = this.querySelector("div");
		const isOn = this.getAttribute("cq-on") || "sidenavOn";
		const isOff = this.getAttribute("cq-off") || "sidenavOff";
		const breakpointChannel = channels.breakpoint || "channel.breakpoint";
		const sidenavChannel = channels.sidenav || "layout.sidenav";
		const sidenavSizeChannel = channels.sidenavSize || "channel.sidenavSize";
		const tfcChannel = channels.tfc || "channel.tfc";

		const setActive = () => {
			const available = this.channelRead(breakpointChannel) === "break-sm";
			const show = available && this.channelRead(sidenavChannel) === isOn;

			node.classList.remove("sidenav", "ciq-toggles");
			node.classList.add(available ? "sidenav" : "ciq-toggles");

			node.classList[show ? "add" : "remove"]("active");

			this.channelWrite(sidenavSizeChannel, show ? node.offsetWidth : 0);
		};

		this.channelSubscribe(sidenavChannel, setActive);
		this.channelSubscribe(breakpointChannel, setActive);
		this.channelSubscribe(tfcChannel, (isActive) => {
			if (isActive) this.channelWrite(sidenavChannel, isOff);
		});
	}
}

CIQ.UI.addComponentDefinition("cq-side-nav", SideNav);

};


let __js_webcomponents_sidePanel_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Side Panel web component `<cq-side-panel>`.
 *
 * @namespace WebComponents.cq-side-panel
 *
 * @example
 * <cq-side-panel><cq-side-panel>
 */
class SidePanel extends CIQ.UI.ContextTag {
	constructor() {
		super();
		this.callbacks = [];
	}

	setContext(context) {
		const { config, stx } = context;
		if (!config) return;

		const { channels = {} } = config;
		const resizeHandler = this.resizeMyself.bind(this);
		const { node } = this;

		this.channelSubscribe(
			channels.breakpoint || "channel.breakpoint",
			handleSizeChanges
		);
		this.channelSubscribe(channels.tfc || "channel.tfc", handleTfcOpen, stx);

		function handleSizeChanges() {
			setTimeout(resizeHandler);
		}

		function handleTfcOpen(isOpen) {
			if (isOpen) node.attr("cq-active", true);
			else node.removeAttr("cq-active");

			handleSizeChanges();
		}
	}

	close() {
		this.node.removeAttr("cq-active");
		var children = this.node.children();
		children.each(function () {
			if (this.sidePanelActiveClass)
				this.classList.remove(this.sidePanelActiveClass);
			// turn off a child by removing the class name added to it
			else this.removeAttribute(this.sidePanelActiveAttribute); // turn off a child by removing the attribute name added to it
		});
		var self = this;
		setTimeout(function () {
			self.resizeMyself();
		}, 0);
	}

	/**
	 * Use this method to get the width instead of querying the node directly because the side panel may be animated.
	 * @return {number} The width
	 */
	nonAnimatedWidth() {
		var width = 0;
		Array.from(this.children).forEach(function (child) {
			width += CIQ.elementDimensions(child).width;
		}); // accumulate width of all children
		return width;
	}

	/**
	 * Opens a side panel to show more options in mobile.
	 * @param  {Object} params Parameters
	 * @param {string} params.selector The selector for which child to enable
	 * @param {string} [params.className] The class name to add to turn on the panel
	 * @param {string} [params.attribute] The attribute to add to turn on the panel
	 * @alias open
	 * @memberof WebComponents.cq-side-panel
	 */
	open(params) {
		this.close();
		var children = this.node.find(params.selector);
		if (params.className) {
			children.addClass(params.className);
			children.each(function () {
				this.sidePanelActiveClass = params.className; // store the class name used to turn it on
			});
		} else {
			children.attr(params.attribute, "true");
			children.each(function () {
				this.sidePanelActiveAttribute = params.attribute; // store the attribute name used to turn it on
			});
		}
		this.node.attr("cq-active", "true");
		var self = this;
		setTimeout(function () {
			self.resizeMyself();
		}, 0);
	}

	registerCallback(fc) {
		this.callbacks.push(fc);
	}

	resizeMyself() {
		var width = this.nonAnimatedWidth();
		this.node.css({ width: width + "px" }); // expand the side panel
		for (
			var i = 0;
			i < this.callbacks.length;
			i++ // let any callbacks know that we've been resized
		)
			this.callbacks[i].call(this, width);

		// channel notification
		const { config, stx } = this.context || {};
		if (!config) return;
		const channel =
			(config.channels || {}).sidepanelSize || "channel.sidepanelSize";
		this.channelWrite(channel, width, stx);
	}
}

/**
 * A side panel contains children that should be enabled by calling open({selector:selector}).
 */
CIQ.UI.addComponentDefinition("cq-side-panel", SidePanel);

};


let __js_webcomponents_studies_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Studies list web component `<cq-studies>`.
 *
 * Lists all studies contained in the study library, {@link CIQ.Studies.studyLibrary}.
 *
 * @namespace WebComponents.cq-studies
 * @since 5.2.0
 *
 * @example
 * <cq-menu class="ciq-menu ciq-studies collapse">
 *     <span>Studies</span>
 *     <cq-menu-dropdown cq-no-scroll>
 *         <cq-study-legend cq-no-close>
 *             <cq-section-dynamic>
 *                 <cq-heading>Current Studies</cq-heading>
 *                 <cq-study-legend-content>
 *                     <template>
 *                         <cq-item>
 *                             <cq-label class="click-to-edit"></cq-label>
 *                             <div class="ciq-icon ciq-close"></div>
 *                         </cq-item>
 *                     </template>
 *                 </cq-study-legend-content>
 *                 <cq-placeholder>
 *                     <div stxtap="Layout.clearStudies()" class="ciq-btn sm">Clear All</div>
 *                 </cq-placeholder>
 *             </cq-section-dynamic>
 *         </cq-study-legend>
 *         <cq-scroll>
 *             <cq-studies>
 *                 <cq-studies-content>
 *                     <template>
 *                         <cq-item>
 *                             <cq-label></cq-label>
 *                         </cq-item>
 *                     </template>
 *                 </cq-studies-content>
 *             </cq-studies>
 *         </cq-scroll>
 *     </cq-menu-dropdown>
 * </cq-menu>
 */
class Studies extends CIQ.UI.ContextTag {
	disconnectedCallback() {
		if (this.context)
			CIQ.UI.unobserveProperty(
				"studyLibraryHash",
				this.context.stx.chart,
				this.listener
			);
		super.disconnectedCallback();
	}

	/**
	 * Initializes and displays the list of available studies.
	 *
	 * @param {object} [params] Parameters to control initialization of the studies list.
	 * @param {object} [params.excludedStudies] A map of study names that should be excluded from
	 * 		the studies list, for example: <code>{&nbsp;"macd":&nbsp;true&nbsp;}</code>.
	 * @param {object|boolean} [params.alwaysDisplayDialog=false] If set to boolean true (not
	 * 		truthy), the study edit dialog box is automatically opened for any of the available
	 * 		studies after the study has been added to the chart. If set to boolean false, the
	 * 		study edit dialog box is not opened for any of the available studies after the study
	 * 		has been added to the chart.
	 * 		<p>If set to an object containing a map of study names and boolean values (for example,
	 * 		<code>{&nbsp;"ma":&nbsp;true,&nbsp;"AVWAP":&nbsp;true&nbsp;}</code>), the study edit
	 * 		dialog box is opened after the study has been added to the chart for studies in the
	 * 		map that have a boolean value of true but not for those that have a value of false or
	 * 		for any studies not included in the map.
	 * @param {object|boolean} [params.dialogBeforeAddingStudy=false] If set to boolean true (not
	 * 		truthy), the study edit dialog box is automatically opened for any of the available
	 * 		studies before the study is added to the chart. If set to boolean false, the study
	 * 		edit dialog box is not opened for any of the available studies before the study is
	 * 		added to the chart.
	 * 		<p>If set to an object containing a map of study names and boolean values (for example,
	 * 		<code>{&nbsp;"macd":&nbsp;true&nbsp;}</code>), the study edit dialog box is opened
	 * 		before the study is added to the chart for studies in the map that have a boolean value
	 * 		of true but not for those that have a value of false or for any studies not included
	 * 		in the map.
	 *
	 * @alias initialize
	 * @memberof WebComponents.cq-studies
	 * @since 5.2.0 The `CIQ.UI.StudyMenu` helper has been deprecated. Please call
	 * 		`document.querySelector("cq-studies").initialize()` now.
	 *
	 * @example
	 * let params = {
	 *     excludedStudies: { "macd": true },  // Exclude studies from the list of available studies.
	 *     alwaysDisplayDialog: { "ma": true },  // Show the study preferences dialog after adding studies.
	 *     dialogBeforeAddingStudy: { "rsi": true }  // Show the study preferences dialog before adding studies.
	 * };
	 * document.querySelectorAll("cq-studies").forEach(function(i) {
	 *     i.initialize(params);
	 * });
	 */
	initialize(params) {
		this.addDefaultMarkup();
		this.params = params || {};
		this.alwaysDisplayDialog = this.params.alwaysDisplayDialog || false;
		this.excludedStudies = this.params.excludedStudies || [];
		if (!this.params.template) this.params.template = "template";
		this.params.template = this.node.find(this.params.template);
		this.renderMenu();

		var self = this,
			stx = this.context.stx;
		this.listener = function (obj) {
			self.renderMenu();
		};
		CIQ.UI.observeProperty("studyLibraryHash", stx.chart, this.listener);
	}

	setContext({ config }) {
		if (config && config.menuStudiesConfig) {
			this.initialize(Object.assign({}, config.menuStudiesConfig));
		}
	}

	/**
	 * Creates a list of studies in a `<cq-studies-content>` element.
	 *
	 * You have the option of creating a hardcoded HTML menu and just using {@link CIQ.Studies}
	 * for processing `stxtap` attributes, or you can call this method to automatically generate
	 * the menu.
	 *
	 * @alias renderMenu
	 * @memberof WebComponents.cq-studies
	 */
	renderMenu() {
		if (!CIQ.Studies) return;
		var stx = this.context.stx;
		var alphabetized = [];
		var sd;

		for (var field in CIQ.Studies.studyLibrary) {
			sd = CIQ.Studies.studyLibrary[field];
			if (
				!sd ||
				this.excludedStudies[field] ||
				this.excludedStudies[sd.name] ||
				sd.siqList !== undefined
			)
				continue; // siqList = ScriptIQ entry
			if (!sd.name) sd.name = field; // Make sure there's always a name
			alphabetized.push(field);
		}
		alphabetized.sort(function (lhs, rhs) {
			var lsd = CIQ.Studies.studyLibrary[lhs];
			var rsd = CIQ.Studies.studyLibrary[rhs];
			if (lsd.name < rsd.name) return -1;
			if (lsd.name > rsd.name) return 1;
			return 0;
		});
		var menu = this.node;
		var self = this;
		var tapFn = function (studyName, context) {
			return function (e) {
				pickStudy(e.target, studyName);
				self.dispatchEvent(new Event("resize"));
			};
		};

		var contentNode = menu.find("cq-studies-content");
		while (contentNode.length > 0 && contentNode[0].firstChild) {
			contentNode[0].removeChild(contentNode[0].firstChild);
		}

		for (var i = 0; i < alphabetized.length; i++) {
			var menuItem = CIQ.UI.makeFromTemplate(this.params.template);
			sd = CIQ.Studies.studyLibrary[alphabetized[i]];
			menuItem.append(CIQ.translatableTextNode(stx, sd.name));
			this.makeTap(menuItem[0], tapFn(alphabetized[i], this.context));
			menu.find("cq-studies-content").append(menuItem);
		}

		function studyDialog(params, addWhenDone) {
			const { context } = self;

			if (context.config) {
				self.channelWrite(
					context.config.channels.dialog,
					{
						type: "study",
						params: Object.assign({}, params, { context, addWhenDone })
					},
					context.stx
				);
			} else {
				// legacy use when config is not available
				params.context = self.context;
				const dialog = document.querySelector("cq-study-dialog");
				dialog.addWhenDone = addWhenDone;
				dialog.open(params);
			}
		}

		function pickStudy(node, studyName) {
			var stx = self.context.stx;

			function handleSpecialCase(flag, params, addWhenDone) {
				if (flag === true) {
					studyDialog(params, addWhenDone);
					return true;
				} else if (typeof flag === "object") {
					for (var i in flag) {
						if (i == studyName && flag[i]) {
							studyDialog(params, addWhenDone);
							return true;
						}
					}
				}
			}

			if (
				handleSpecialCase(
					self.params.dialogBeforeAddingStudy,
					{ stx: stx, name: studyName },
					true
				)
			)
				return;
			var sd = CIQ.Studies.addStudy(stx, studyName);
			handleSpecialCase(self.alwaysDisplayDialog, { sd: sd, stx: stx });
		}
	}
}

Studies.markup = `
		<template>
			<cq-item></cq-item>
		</template>
		<cq-studies-content></cq-studies-content>
	`;
CIQ.UI.addComponentDefinition("cq-studies", Studies);

};


let __js_webcomponents_studyContext_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */


var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Study Context Dialog web component `<cq-study-context>`.
 *
 * @namespace WebComponents.cq-study-context
 * @since  4.1.0 cq-study-context is now required (cq-dialog[cq-study-context] no longer works)
 */
class StudyContext extends CIQ.UI.DialogContentTag {
	setContext(context) {
		this.addDefaultMarkup();
		this.classList.add("ciq-context-menu");
		super.setContext(context);
	}
}

StudyContext.markup = `
		<div stxtap="StudyEdit.edit()">Edit Settings...</div>
		<div stxtap="StudyEdit.remove()">Delete Study</div>
	`;
CIQ.UI.addComponentDefinition("cq-study-context", StudyContext);

};


let __js_webcomponents_studyDialog_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */










var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

if (!CIQ.Studies) {
	console.error(
		"studyDialog component requires first activating studies feature."
	);
} else {
	/**
	 * Study dialogs web component `<cq-study-dialog>`.
	 *
	 * Creates and manages study dialogs based on the corresponding study library entry (title,
	 * inputs, outputs, parameters, etc.).
	 *
	 * Requires {@link CIQ.UI.StudyEdit}.
	 *
	 * Optional Attributes:
	 * - `cq-study-axis` &mdash; Displays UI for selecting the Y-axis position (left, right, etc.),
	 *   color and for inverting the y-axis *if not shared with the primary axis*.
	 * - `cq-study-panel` &mdash; Displays UI for selecting the panel for the study (own, shared,
	 *   etc.) and whether it is rendered as an underlay (under the primary chart) or an overlay
	 *   (over the primary chart). Set this attribute to "alias" to have the panel names listed as
	 *   "<Panel 1>", "<Panel 2>", etc.
	 *
	 * @namespace WebComponents.cq-study-dialog
	 * @since
	 * - 5.2.0 Optional Attributes `cq-study-axis` and `cq-study-panel` are now available.
	 * - 6.3.0 `cq-study-axis` now also provides a check box allowing users to invert study y-axis
	 * 		if not shared with the primary axis.
	 *
	 * @example <caption> Here is an example of how to create a study dialog. We add the
	 * <code>cq-study-axis</code> and <code>cq-study-panel</code> attributes to enable form fields
	 * used to control axis position, color, study panel, and underlay/overlay.
	 * </caption>
	 * <cq-dialog>
	 *      <cq-study-dialog cq-study-axis cq-study-panel>
	 *           <h4 class="title">Study</h4>
	 *           <cq-scroll cq-no-maximize>
	 *                <cq-study-inputs>
	 *                     <template cq-study-input>
	 *                          <cq-study-input>
	 *                               <div class="ciq-heading"></div>
	 *                               <div class="stx-data">
	 *                                    <template cq-menu>
	 *                                         <cq-menu class="ciq-select">
	 *                                              <cq-selected></cq-selected>
	 *                                              <cq-menu-dropdown cq-lift></cq-menu-dropdown>
	 *                                         </cq-menu>
	 *                                    </template>
	 *                               </div>
	 *                          </cq-study-input>
	 *                     </template>
	 *                </cq-study-inputs>
	 *                <hr>
	 *                <cq-study-outputs>
	 *                     <template cq-study-output>
	 *                          <cq-study-output>
	 *                               <div class="ciq-heading"></div>
	 *                               <cq-swatch cq-overrides="auto"></cq-swatch>
	 *                          </cq-study-output>
	 *                     </template>
	 *                </cq-study-outputs>
	 *                <hr>
	 *                <cq-study-parameters>
	 *                     <template cq-study-parameters>
	 *                          <cq-study-parameter>
	 *                               <div class="ciq-heading"></div>
	 *                               <div class="stx-data"><cq-swatch cq-overrides="auto"></cq-swatch>
	 *                                    <template cq-menu>
	 *                                         <cq-menu class="ciq-select">
	 *                                              <cq-selected></cq-selected>
	 *                                              <cq-menu-dropdown cq-lift></cq-menu-dropdown>
	 *                                         </cq-menu>
	 *                                    </template>
	 *                               </div>
	 *                          </cq-study-parameter>
	 *                     </template>
	 *                </cq-study-parameters>
	 *           </cq-scroll>
	 *           <div class="ciq-dialog-cntrls">
	 *                <div class="ciq-btn" stxtap="close()">Done</div>
	 *           </div>
	 *      </cq-study-dialog>
	 * </cq-dialog>
	 */
	class StudyDialog extends CIQ.UI.DialogContentTag {
		connectedCallback() {
			if (this.attached) return;
			super.connectedCallback();
			this.queuedUpdates = {};
		}

		close() {
			if (this.addWhenDone) {
				var helper = this.helper;
				var sd = CIQ.Studies.addStudy(helper.stx, helper.name);
				if (!CIQ.isEmpty(this.queuedUpdates)) {
					helper.sd = sd;
					helper.updateStudy(this.queuedUpdates);
					this.queuedUpdates = {};
				}
			}
		}

		disconnectedCallback() {
			CIQ.UI.unobserveProperty("signal", this.helper);
			super.disconnectedCallback();
		}

		formatDateInput(date) {
			date = date.replace(/-/g, "");
			if (!date.search(/^\d{8}$/))
				date =
					date.substring(0, 4) +
					"-" +
					date.substring(4, 6) +
					"-" +
					date.substring(6, 8);
			return date;
		}

		formatTimeInput(time) {
			time = time.replace(/:/g, "");
			if (!time.search(/^\d{4,6}$/))
				time =
					time.substring(0, 2) +
					":" +
					time.substring(2, 4) +
					(time.length == 4 ? "" : ":" + time.substring(4, 6));
			return time;
		}

		hide() {
			if (!CIQ.isEmpty(this.queuedUpdates)) {
				this.helper.updateStudy(this.queuedUpdates);
				this.queuedUpdates = {};
			}
			this.node.find("cq-menu").each(function () {
				if (this.unlift) this.unlift();
			});
			this.node.find("cq-swatch").each(function () {
				if (this.colorPicker) this.colorPicker.close();
			});
		}

		makeMenu(name, currentValue, fields, section) {
			var menu = CIQ.UI.makeFromTemplate(this.menuTemplate);
			var cqMenu = menu.find("cq-menu-dropdown"); // scrollable in menu.
			for (var field in fields) {
				var item = document.createElement("cq-item");
				item.innerText = fields[field];
				item.setAttribute(
					"stxtap",
					"StudyDialog.setSelectOption('" + section + "')"
				); // must call StudyDialog because the item is "lifted" and so doesn't know its parent
				cqMenu.append(item);
				item.cqMenuWrapper = cqMenu.parents("cq-menu")[0];
				item.setAttribute("name", name);
				item.setAttribute("value", field);
				item.context = this.context;
			}
			var inputValue = menu.find("cq-selected");
			inputValue.text(this.helper.stx.translateIf(currentValue));
			return menu[0];
		}

		open(params) {
			this.addDefaultMarkup();
			this.selectTemplates();

			super.open(params);
			params.axisSelect = this.getAttribute("cq-study-axis");
			if (params.axisSelect === "") params.axisSelect = true;
			params.panelSelect = this.getAttribute("cq-study-panel");
			if (params.panelSelect === "") params.panelSelect = true;

			if (typeof params.addWhenDone !== "undefined")
				this.addWhenDone = params.addWhenDone;
			// Generate a "helper" which tells us how to create a dialog
			var self = this,
				stx = this.context.stx;
			CIQ.UI.unobserveProperty("signal", this.helper);
			this.helper = new CIQ.Studies.DialogHelper(params);
			CIQ.UI.observeProperty("signal", this.helper, function (obj) {
				self.refreshInputs();
				self.refreshOutputs();
				self.refreshParameters(params);
			});

			var dialog = this.node;

			dialog.find(".title").text(this.helper.title);

			// Create form elements for all of the inputs
			this.refreshInputs(true);

			// Create form elements for all of the outputs
			this.refreshOutputs(true);

			// Create form elements for all of the parameters
			this.refreshParameters(params, true);
		}

		refreshInputs(empty) {
			var inputs = this.node.find("cq-study-inputs");
			if (empty) inputs.empty();
			for (var i = 0; i < this.helper.inputs.length; i++) {
				var input = this.helper.inputs[i];
				var newInput = CIQ.UI.makeFromTemplate(this.inputTemplate);
				this.menuTemplate = newInput.find("template[cq-menu]");
				newInput.find(".ciq-heading").text(input.heading);
				newInput[0].setAttribute("fieldname", input.name);
				var formField = null;

				var iAttr;
				var attributes = this.helper.attributes[input.name];
				if (input.type == "number") {
					formField = document.createElement("input");
					formField.setAttribute("type", "number");
					formField.value = input.value;
					this.setChangeEvent(formField, "inputs", input.name);
					for (iAttr in attributes) {
						var iAttrVal = attributes[iAttr];
						// poor IE/Edge can't perform decimal step validation properly, so we need to change step to any and give up the neat step effect
						if (
							(CIQ.isIE || CIQ.isEdge) &&
							iAttr == "step" &&
							Math.floor(iAttrVal) != iAttrVal
						)
							iAttrVal = "any";
						if (iAttr !== "hidden") formField.setAttribute(iAttr, iAttrVal);
					}
				} else if (
					input.type == "text" ||
					input.type == "date" ||
					input.type == "time"
				) {
					formField = document.createElement("input");
					formField.setAttribute("type", CIQ.UI.supportedInputType(input.type));
					if (input.type == "date")
						formField.value = this.formatDateInput(input.value);
					else if (input.type == "time")
						formField.value = this.formatTimeInput(input.value);
					else formField.value = input.value;
					this.setChangeEvent(formField, "inputs", input.name);
					for (iAttr in attributes)
						if (iAttr !== "hidden")
							formField.setAttribute(iAttr, attributes[iAttr]);
				} else if (input.type == "select") {
					formField = this.makeMenu(
						input.name,
						input.value,
						input.options,
						"inputs"
					);
					if (attributes && attributes.readonly)
						formField.setAttribute("readonly", attributes.readonly);
				} else if (input.type == "checkbox") {
					formField = document.createElement("input");
					formField.setAttribute("type", "checkbox");
					if (input.value) formField.checked = true;
					this.setChangeEvent(formField, "inputs", input.name);
					for (iAttr in attributes)
						if (iAttr !== "hidden")
							formField.setAttribute(iAttr, attributes[iAttr]);
				}
				if (attributes && attributes.hidden) newInput.hide();
				if (formField) newInput.find(".stx-data").append(formField);

				newInput[0].originalOuterHTML = newInput[0].outerHTML;
				var oldInput = inputs.find("[fieldname='" + input.name + "']");
				if (!oldInput.length) {
					inputs.append(newInput);
				} else if (
					oldInput[0].originalOuterHTML !== newInput[0].originalOuterHTML
				) {
					oldInput[0].replaceWith(newInput[0]);
				}
			}
		}

		refreshOutputs(empty) {
			var outputs = this.node.find("cq-study-outputs");
			if (empty) outputs.empty();
			for (var i = 0; i < this.helper.outputs.length; i++) {
				var output = this.helper.outputs[i];
				var newOutput = CIQ.UI.makeFromTemplate(this.outputTemplate);
				newOutput[0].initialize({
					studyDialog: this,
					output: output.name
				});
				newOutput.find(".ciq-heading").text(output.heading);
				newOutput[0].setAttribute("fieldname", output.name);

				var swatch = newOutput.find("cq-swatch");
				var color = output.color;
				if (typeof color === "object") {
					color = color.color;
				}
				newOutput[0].originalOuterHTML = newOutput[0].outerHTML;
				var oldOutput = outputs.find("[fieldname='" + output.name + "']");
				if (!oldOutput.length) {
					outputs.append(newOutput);
				} else if (
					oldOutput[0].originalOuterHTML !== newOutput[0].originalOuterHTML
				) {
					oldOutput[0].replaceWith(newOutput[0]);
				}
				swatch[0].setColor(color, false); // don't percolate
			}
		}

		refreshParameters(params, empty) {
			var parameters = this.node.find("cq-study-parameters");
			if (empty) parameters.empty();
			for (var i = 0; i < this.helper.parameters.length; i++) {
				var parameter = this.helper.parameters[i];
				var newParam = CIQ.UI.makeFromTemplate(this.parameterTemplate);
				this.menuTemplate = newParam.find("template[cq-menu]");
				if (!this.menuTemplate.length && parameter.options) {
					newParam.remove();
					continue;
				}
				newParam.find(".ciq-heading").text(parameter.heading);
				newParam[0].setAttribute("fieldname", parameter.name);
				var swatch = newParam.find("cq-swatch");
				var paramInput = document.createElement("input");
				var pAttr;
				var setSwatch = false;
				var attributes = {};
				if (parameter.defaultValue.constructor == Boolean) {
					paramInput.setAttribute("type", "checkbox");
					if (parameter.value) paramInput.checked = true;
					this.setChangeEvent(
						paramInput,
						"parameters",
						parameter.name + "Enabled"
					);
					swatch.remove();

					attributes = this.helper.attributes[parameter.name + "Enabled"];
					for (pAttr in attributes)
						if (pAttr !== "hidden")
							paramInput.setAttribute(pAttr, attributes[pAttr]);
				} else if (parameter.defaultValue.constructor == String) {
					var paramName = parameter.name;
					if (parameter.defaultColor) {
						newParam[0].initialize({
							studyDialog: this,
							parameter: parameter.name + "Color",
							params: params
						});
						setSwatch = true;
						paramName = paramName + "Value";
					} else {
						swatch.remove();
					}
					if (parameter.options) {
						paramInput = this.makeMenu(
							paramName,
							parameter.value,
							parameter.options,
							"parameters"
						);
					} else {
						paramInput.value = parameter.value;
					}
					attributes = this.helper.attributes[paramName];
					for (pAttr in attributes)
						if (pAttr !== "hidden")
							paramInput.setAttribute(pAttr, attributes[pAttr]);
				} else if (parameter.defaultValue.constructor == Number) {
					paramInput.setAttribute("type", "number");
					paramInput.value = parameter.value;
					this.setChangeEvent(
						paramInput,
						"parameters",
						parameter.name + "Value"
					);
					newParam[0].initialize({
						studyDialog: this,
						parameter: parameter.name + "Color",
						params: params
					});
					setSwatch = true;

					attributes = this.helper.attributes[parameter.name + "Value"];
					for (pAttr in attributes) {
						var pAttrVal = attributes[pAttr];
						// poor IE/Edge can't perform decimal step validation properly, so we need to change step to any and give up the neat step effect
						if (
							(CIQ.isIE || CIQ.isEdge) &&
							pAttr == "step" &&
							Math.floor(pAttrVal) != pAttrVal
						)
							pAttrVal = "any";
						if (pAttr !== "hidden") paramInput.setAttribute(pAttr, pAttrVal);
					}
				} else continue;

				if (attributes && attributes.hidden) newParam.not("hr").hide();
				newParam.find(".stx-data").append(paramInput);

				newParam[0].originalOuterHTML = newParam[0].outerHTML;
				var oldParam = parameters.find("[fieldname='" + parameter.name + "']");
				if (!oldParam.length) {
					parameters.append(newParam);
				} else if (
					oldParam[0].originalOuterHTML !== newParam[0].originalOuterHTML
				) {
					oldParam[0].replaceWith(newParam[0]);
				}
				if (setSwatch) swatch[0].setColor(parameter.color, false); // don't percolate
			}
		}

		/**
		 * Sets up a handler to process changes to input fields
		 * @param {HTMLElement} node    The input field
		 * @param {string} section The section that is being updated, "inputs","outputs","parameters"
		 * @param {string} name    The name of the field being updated
		 * @memberof! WebComponents.cq-study-dialog
		 * @private
		 */
		setChangeEvent(node, section, name) {
			var self = this;
			function closure() {
				return function () {
					var updates = {};
					updates[section] = {};
					updates[section][name] = this.value;
					if (this.type == "checkbox" || this.type == "radio") {
						updates[section][name] = this.checked;
					}
					self.updateStudy(updates);
				};
			}
			node.addEventListener("change", closure());
		}

		setContext(context) {
			this.context = context;
			context.advertiseAs(this, "StudyDialog");
		}

		/**
		 * Accepts new menu (select box) selections
		 * @param {object} activator
		 * @param {string} section within the dialog ("inputs", "outputs", "parameters")
		 * @memberof! WebComponents.cq-study-dialog
		 * @since 5.2.0 Added `section` parameter.
		 */
		setSelectOption(activator, section) {
			var node = CIQ.UI.$(activator.node);
			var name = node.attr("name");
			var value = node.attr("value");
			var newInput = node[0].cqMenuWrapper;
			newInput.fieldValue = value;
			var inputValue = newInput.querySelector("cq-selected");
			if (inputValue) inputValue.innerText = this.helper.stx.translateIf(value);
			if (!section) section = "inputs";
			var updates = {};
			updates[section] = {};
			updates[section][name] = value;
			this.updateStudy(updates);
		}

		updateStudy(updates) {
			if (this.node.find(":invalid").length) return;
			if (this.addWhenDone) {
				CIQ.extend(this.queuedUpdates, updates);
				return;
			}
			if (this.helper.libraryEntry.deferUpdate) {
				CIQ.extend(this.queuedUpdates, { inputs: updates.inputs });
				this.helper.updateStudy({
					outputs: updates.outputs,
					parameters: updates.parameters
				});
			} else {
				this.helper.updateStudy(updates);
			}
		}

		/**
		 * Selects template elements and attaches them as class properties only once
		 * @memberof! WebComponents.cq-study-dialog
		 */
		selectTemplates() {
			if (this.inputTemplate) return;
			this.inputTemplate = this.querySelector("template[cq-study-input]");
			this.outputTemplate = this.querySelector("template[cq-study-output]");
			this.parameterTemplate = this.querySelector(
				"template[cq-study-parameters]"
			);
		}
	}

	StudyDialog.markup = `
		<h4 class="title">Study here</h4>
		<cq-scroll cq-no-maximize>
			<cq-study-inputs>
				<template cq-study-input>
					<cq-study-input>
						<div class="ciq-heading"></div>
						<div class="stx-data">
							<template cq-menu>
								<cq-menu class="ciq-select">
									<cq-selected></cq-selected>
									<cq-menu-dropdown cq-lift></cq-menu-dropdown>
								</cq-menu>
							</template>
						</div>
					</cq-study-input>
					<hr>
				</template>
			</cq-study-inputs>
			<cq-study-outputs>
				<template cq-study-output>
					<cq-study-output>
						<div class="ciq-heading"></div>
						<cq-swatch cq-overrides="auto"></cq-swatch>
					</cq-study-output>
					<hr>
				</template>
			</cq-study-outputs>
			<cq-study-parameters>
				<template cq-study-parameters>
					<cq-study-parameter>
						<div class="ciq-heading"></div>
						<div class="stx-data"><cq-swatch cq-overrides="auto"></cq-swatch>
							<template cq-menu>
								<cq-menu class="ciq-select">
									<cq-selected></cq-selected>
									<cq-menu-dropdown cq-lift></cq-menu-dropdown>
								</cq-menu>
							</template>
						</div>
					</cq-study-parameter>
					<hr>
				</template>
			</cq-study-parameters>
		</cq-scroll>
		<div class="ciq-dialog-cntrls">
			<div class="ciq-btn" stxtap="close()">Done</div>
		</div>
	`;
	CIQ.UI.addComponentDefinition("cq-study-dialog", StudyDialog);
}

};


let __js_webcomponents_studyInput_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */


var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Study input web component `<cq-study-input>`.
 *
 * See example in {@link WebComponents.cq-study-dialog}.
 *
 * @namespace WebComponents.cq-study-input
 */
class StudyInput extends CIQ.UI.DialogContentTag {}

CIQ.UI.addComponentDefinition("cq-study-input", StudyInput);

};


let __js_webcomponents_studyLegend_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */


var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

if (!CIQ.Studies) {
	console.error(
		"studyLegend component requires first activating studies feature."
	);
} else {
	/**
	 * Study legend web component `<cq-study-legend>`.
	 *
	 * Click on the "X" to remove the study.
	 * Click on the cog to edit the study.
	 * Optionally only show studies needing custom Removal. cq-custom-removal-only
	 * Optionally only show overlays. cq-overlays-only
	 * Optionally only show studies in this panel. cq-panel-only
	 * Optionally clone to all panels. cq-clone-to-panels="Plots" or whatever name you choose
	 * Optionally specify selector for which nodes have content. cq-content-keys
	 *
	 * **Keyboard control**
	 *
	 * When selected with tab key navigation and activated with Return/Enter, this component has
	 * the following internal controls:
	 * - Up/Down arrow &mdash; Move selection between internal cq-item and cq-comparison-item
	 * elements.
	 * - Left/Right arrow &mdash; Select a control within a selected cq-item element, such as
	 * the Remove button. Child elements must have the attribute `keyboard-selectable-child` set to
	 * "true" to be selectable with these keys.
	 *
	 * @namespace WebComponents.cq-study-legend
	 * @since 8.3.0 Enabled internal keyboard navigation and selection.
	 *
	 * @example
	 * <caption>
	 *     Here is an example of how to create a study legend on the chart. We use the
	 *     <code>cq-marker</code> attribute to ensure that it floats inside the chart. We set the
	 *     optional <code>cq-panel-only</code> attribute so that only studies from this panel are
	 *     displayed.
	 * </caption>
	 * <cq-study-legend cq-marker-label="Studies" cq-overlays-only cq-marker cq-hovershow>
	 *     <template>
	 *         <cq-item>
	 *             <cq-label></cq-label>
	 *             <span class="ciq-edit"></span>
	 *             <div class="ciq-icon ciq-close"></div>
	 *         </cq-item>
	 *     </template>
	 * </cq-study-legend>
	 *
	 * @example
	 * <caption>
	 *     Here is an example of how to create a study legend inside a drop down menu. We use the
	 *     <code>cq-no-close</code> attribute so that drop down is not closed when the user removes
	 *     a study from the list.
	 * </caption>
	 * <cq-menu class="ciq-menu ciq-studies collapse">
	 *     <span>Studies</span>
	 *     <cq-menu-dropdown cq-no-scroll>
	 *         <cq-study-legend cq-no-close>
	 *             <cq-section-dynamic>
	 *                 <cq-heading>Current Studies</cq-heading>
	 *                 <cq-study-legend-content>
	 *                     <template cq-study-legend>
	 *                         <cq-item>
	 *                             <cq-label class="click-to-edit"></cq-label>
	 *                             <div class="ciq-icon ciq-close"></div>
	 *                         </cq-item>
	 *                     </template>
	 *                 </cq-study-legend-content>
	 *                 <cq-placeholder>
	 *                     <div stxtap="Layout.clearStudies()" class="ciq-btn sm">Clear All</div>
	 *                 </cq-placeholder>
	 *             </cq-section-dynamic>
	 *         </cq-study-legend>
	 *         <cq-scroll>
	 *             <cq-studies>
	 *                 <cq-studies-content>
	 *                     <template>
	 *                         <cq-item>
	 *                             <cq-label></cq-label>
	 *                         </cq-item>
	 *                     </template>
	 *                 </cq-studies-content>
	 *             </cq-studies>
	 *         </cq-scroll>
	 *     </cq-menu-dropdown>
	 * </cq-menu>
	 */
	class StudyLegend extends CIQ.UI.ModalTag {
		connectedCallback() {
			if (this.attached) return;
			super.connectedCallback();
			if (this.node.attr("cq-clone-to-panels") !== undefined) {
				document.body.classList.add("stx-panel-legend");
			}

			if (!this.hasAttribute("cq-no-claim")) this.addClaim(this);
			// Update the keyboard navigation. New study legend components can be added at runtime.
			if (this.context && this.context.config && this.context.config.channels) {
				this.channelWrite(
					this.context.config.channels.keyboardNavigation ||
						"channel.keyboardNavigation",
					{ action: "registerElements" }
				);
			}
		}

		disconnectedCallback() {
			// Update the keyboard navigation. Need to remove this element from the index now that it's detached
			if (this.context && this.context.config && this.context.config.channels) {
				this.channelWrite(
					this.context.config.channels.keyboardNavigation ||
						"channel.keyboardNavigation",
					{ action: "registerElements" }
				);
			}
		}

		/**
		 * Begins running the StudyLegend.
		 * @memberof! WebComponents.cq-study-legend
		 * @private
		 */
		begin() {
			if (this.init) return;
			var stx = this.context.stx;
			var node = this.node;

			this.template = node.find("template[cq-study-legend]");
			if (!this.template.length) this.template = node.find("template"); // backwards compatibility, this can fail if more than one template is present!
			this.contentKeys = node.attr("cq-content-keys") || "cq-label";

			this.eventListeners.push(
				stx.addEventListener("layout", this.renderLegend.bind(this))
			);

			if (this.hasAttribute("cq-marker")) {
				CIQ.UI.stxtap(this, function () {
					node[0].classList.toggle("ciq-active");
				});
			}

			this.renderLegend();
			this.init = true;
		}

		keyStroke(hub, key, e) {
			if (!this.keyboardNavigation) return;
			const items = this.querySelectorAll(
				"[keyboard-selectable='true'], cq-item:not(.item-hidden), cq-comparison-item"
			);

			if (key == " " || key == "Spacebar" || key == "Enter") {
				const focused = this.findFocused(items);
				if (!focused || !focused.length) return;
				const childItemsSelected = focused[0].querySelectorAll(
					"[keyboard-selectable-child='true'][cq-focused]"
				);
				if (childItemsSelected.length) this.clickItem(childItemsSelected[0], e);
				else this.clickItem(focused[0], e);
			} else if (key == "ArrowDown" || key == "Down") {
				this.focusNextItem(items);
			} else if (key == "ArrowUp" || key == "Up") {
				this.focusNextItem(items, true);
			} else if (key == "ArrowRight" || key == "Right") {
				const focused = this.findFocused(items);
				if (!focused || !focused.length) return;
				const childItems = focused[0].querySelectorAll(
					"[keyboard-selectable-child='true']"
				);
				if (childItems.length) this.focusNextItem(childItems);
			} else if (key == "ArrowLeft" || key == "Left") {
				const focused = this.findFocused(items)[0];
				if (!focused) return;
				const childItems = focused.querySelectorAll(
					"[keyboard-selectable-child='true']"
				);
				// If the end of the child items has been reached select the parent item instead
				if (childItems.length && !this.focusNextItem(childItems, true)) {
					this.removeFocused(childItems);
					this.focusItem(focused);
				}
			} else if (key === "Tab" || key === "Esc" || key === "Escape") {
				this.removeFocused(items);
				this.classList.remove("ciq-active");
				// Wait for transition
				setTimeout(() => this.keyboardNavigation.tabOrderSelect(), 500);
			}
		}

		/**
		 * If a color-picker is opened within this component, this will make sure the component stays active.
		 * @memberof! WebComponents.cq-study-legend
		 */
		launchColorPicker() {
			this.node.addClass("ciq-active");
		}

		/**
		 * Renders the legend based on the current studies in the CIQ.ChartEngine object.
		 * @memberof! WebComponents.cq-study-legend
		 */
		renderLegend() {
			var stx = this.context.stx;

			this.template.nextAll().remove();

			function closeStudy(self, sd) {
				return function (e) {
					e.stopPropagation();
					// Need to run this in the nextTick because the study legend can be removed by this click
					// causing the underlying chart to receive the mousedown (on IE win7)
					setTimeout(function () {
						if (!sd.permanent) CIQ.Studies.removeStudy(self.context.stx, sd);
						if (self.node[0].hasAttribute("cq-marker"))
							self.context.stx.modalEnd();
						self.renderLegend();
					}, 0);
				};
			}
			function editStudy(self, studyId) {
				return function (e) {
					var sd = stx.layout.studies[studyId];
					if (sd.permanent || !sd.editFunction) return;
					e.stopPropagation();
					self.uiManager.closeMenu();
					var studyEdit = self.context.getAdvertised("StudyEdit");
					var params = {
						stx: stx,
						sd: sd,
						inputs: sd.inputs,
						outputs: sd.outputs,
						parameters: sd.parameters
					};
					studyEdit.editPanel(params);
				};
			}
			var overlaysOnly = this.hasAttribute("cq-overlays-only");
			var panelOnly = this.hasAttribute("cq-panel-only");
			var customRemovalOnly = this.hasAttribute("cq-custom-removal-only");
			var markerLabel = this.node.attr("cq-marker-label");
			var panelName = null;
			var holder = this.node.parents(".stx-holder")[0];
			if (holder) panelName = holder.panel.name;

			if (CIQ.Studies) {
				for (var id in stx.layout.studies) {
					var sd = stx.layout.studies[id];
					if (sd.customLegend) continue;
					if (customRemovalOnly && !sd.study.customRemoval) continue;
					if (panelOnly && sd.panel != panelName) continue;
					if (overlaysOnly && !sd.overlay && !sd.underlay) continue;
					var newChild = CIQ.UI.makeFromTemplate(this.template, true);
					newChild.find("cq-label").html(sd.inputs.display);
					var close = newChild.find(".ciq-close");
					if (sd.permanent) {
						close.hide();
					} else {
						close[0].setAttribute("keyboard-selectable-child", "true");
						CIQ.UI.stxtap(close[0], closeStudy(this, sd));
					}
					var edit = newChild.find(".ciq-edit")[0];
					if (edit && !sd.editFunction) {
						edit.style.visibility = "hidden";
					} else if (sd.editFunction) {
						// Put the edit function on the parent so it responds to a keyboard navigation click
						CIQ.UI.stxtap(newChild[0], editStudy(this, id));
					}
				}
			}
			//Only want to display the marker label if at least one study has been
			//rendered in the legend. If no studies are rendered, only the template tag
			//will be in there.
			if (typeof markerLabel != "undefined") {
				if (!this.node.find("cq-marker-label").length) {
					var label = document.createElement("cq-marker-label");
					label.innerText = markerLabel;
					this.insertBefore(label, this.firstChild);
				}
			}

			this.displayLegendTitle();
		}

		displayLegendTitle() {
			if (hasKeys(this, this.contentKeys)) {
				this.node.css("display", "");
				this.node.parents("div.stx-panel-legend").css("width", "");
			} else {
				this.node.css("display", "none");
				this.node.parents("div.stx-panel-legend").css("width", "0px");
			}
			if (CIQ.I18N && CIQ.I18N.localized)
				CIQ.I18N.translateUI(null, this.node[0]);

			function hasKeys(node, keys) {
				// checks if key is not template as in frameworks such as React or Angular
				// templates may be rendered as regular node allowing to inner content queries
				return Array.from(node.querySelectorAll(keys)).some(notInTemplate);
			}

			function notInTemplate(el) {
				while (el) {
					if (el.nodeName.toLowerCase() === "template") return false;
					el = el.parentElement;
				}
				return true;
			}
		}

		setContext(context) {
			if (this.init) return;
			var self = this;
			if (self.node.attr("cq-clone-to-panels") !== undefined) {
				self.spawnPanelLegend();
				context.stx.append("stackPanel", function (display, name) {
					self.spawnPanelLegend();
				});
			}
			this.begin();
		}

		spawnPanelLegend() {
			var stx = this.context.stx;
			function tap(legend) {
				return function (e) {
					legend.classList.toggle("ciq-active");
				};
			}
			for (var p in stx.panels) {
				if (p == stx.chart.panel.name) continue;
				var legendHolder = stx.panels[p].subholder.querySelector(
					".stx-panel-legend"
				);
				if (legendHolder) {
					var panelLegend = legendHolder.querySelector(this.nodeName);
					if (!panelLegend) {
						panelLegend = this.cloneNode(true);
						panelLegend.setAttribute(
							"cq-marker-label",
							this.getAttribute("cq-clone-to-panels")
						);
						panelLegend.removeAttribute("cq-clone-to-panels");
						panelLegend.removeAttribute("cq-overlays-only");
						panelLegend.removeAttribute("cq-marker");
						CIQ.UI.stxtap(panelLegend, tap(panelLegend));
						var mLabel = panelLegend.querySelector("cq-marker-label");
						if (mLabel) mLabel.remove();
						var fixedWrapper = document.createElement(
							"cq-study-legend-fixed-wrapper"
						);
						fixedWrapper.appendChild(panelLegend);
						legendHolder.appendChild(fixedWrapper);
						panelLegend.begin();
					}
				}
			}
		}
	}

	CIQ.UI.addComponentDefinition("cq-study-legend", StudyLegend);
}

};


let __js_webcomponents_studyOutput_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Study output web component `<cq-study-output>`.
 *
 * Set the color of study outputs in the {@link WebComponents.cq-study-dialog}.
 *
 * See example in {@link WebComponents.cq-study-dialog}.
 *
 * @namespace WebComponents.cq-study-output
 */
class StudyOutput extends CIQ.UI.BaseComponent {
	initialize(params) {
		this.params = params;
	}

	setColor(color) {
		if (!this.params) return;
		var updates = {
			outputs: {}
		};
		updates.outputs[this.params.output] = {};
		updates.outputs[this.params.output].color = color;
		this.params.studyDialog.updateStudy(updates);
	}
}

CIQ.UI.addComponentDefinition("cq-study-output", StudyOutput);

};


let __js_webcomponents_studyParameter_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */


var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Study parameters web component `<cq-study-parameter>`.
 *
 * See example in {@link WebComponents.cq-study-dialog}.
 *
 * @namespace WebComponents.cq-study-parameter
 */
class StudyParameter extends CIQ.UI.DialogContentTag {
	initialize(params) {
		this.params = params;
	}

	setColor(color) {
		if (!this.params) return;
		var updates = { parameters: {} };
		updates.parameters[this.params.parameter] = color;
		this.params.studyDialog.updateStudy(updates);
	}
}

CIQ.UI.addComponentDefinition("cq-study-parameter", StudyParameter);

};


let __js_webcomponents_swatch_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */


var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Swatch web component `<cq-swatch>`.
 *
 * An interactive color swatch. Relies on the existence of a {@link CIQ.UI.ColorPicker} component.
 * Interactivity can be disabled by adding cq-static attribute
 *
 * When a color is selected, setColor(color) will get called for any parent component with that
 * method.
 *
 * @namespace WebComponents.cq-swatch
 *
 * @example
 * <cq-section>
 *     <cq-placeholder>Candle Color
 *         <cq-theme-piece cq-piece="cu"><cq-swatch cq-overrides="Hollow"></cq-swatch></cq-theme-piece>
 *         <cq-theme-piece cq-piece="cd"><cq-swatch cq-overrides="Hollow"></cq-swatch></cq-theme-piece>
 *     </cq-placeholder>
 *     <cq-placeholder>Candle Wick
 *         <cq-theme-piece cq-piece="wu"><cq-swatch></cq-swatch></cq-theme-piece>
 *         <cq-theme-piece cq-piece="wd"><cq-swatch></cq-swatch></cq-theme-piece>
 *     </cq-placeholder>
 *     <cq-placeholder>Candle Border
 *         <cq-theme-piece cq-piece="bu"><cq-swatch cq-overrides="No Border"></cq-swatch></cq-theme-piece>
 *         <cq-theme-piece cq-piece="bd"><cq-swatch cq-overrides="No Border"></cq-swatch></cq-theme-piece>
 *     </cq-placeholder>
 *     <cq-separator></cq-separator>
 *     <cq-placeholder>Line/Bar Chart
 *         <cq-theme-piece cq-piece="lc"><cq-swatch></cq-swatch></cq-theme-piece>
 *     </cq-placeholder>
 *     <cq-separator></cq-separator>
 *     <cq-placeholder>Mountain Color
 *         <cq-theme-piece cq-piece="mb"><cq-swatch></cq-swatch></cq-theme-piece>
 *         <cq-theme-piece cq-piece="mc"><cq-swatch></cq-swatch></cq-theme-piece>
 *     </cq-placeholder>
 * </cq-section>
 */
class Swatch extends HTMLElement {
	constructor() {
		super();
		/**
		 * Optionally set the default color for the swatch.
		 * @type {string}
		 * @memberof WebComponents.cq-swatch
		 */
		this.defaultColor = null;
	}

	connectedCallback() {
		if (this.attached) return;
		this.attached = true;

		if (this.getAttribute("cq-static")) {
			this.style.cursor = "default";
			return;
		}
		var self = this;
		CIQ.UI.stxtap(this, function (e) {
			self.launchColorPicker();
			e.stopPropagation();
		});
	}

	/**
	 * Attempts to identify the default color for the associated chart. It does so by traversing
	 * up the parent stack and looking for any component that has a context. Or you can set
	 * the default color manually by setting member variable defaultColor;
	 * @memberof WebComponents.cq-swatch
	 */
	getDefaultColor() {
		if (this.defaultColor) return this.defaultColor;
		var context = CIQ.UI.getMyContext(this);
		if (context) return context.stx.defaultColor; // some parent with a context
		return "transparent";
	}

	/**
	 * @alias setColor
	 * @memberof WebComponents.cq-swatch
	 * @since 6.2.0 Colors strip out the opacity so they are the rgb representation
	 */
	setColor(color, percolate, isAuto) {
		var bgColor = CIQ.getBackgroundColor(this.parentNode);
		var border = CIQ.chooseForegroundColor(bgColor);
		var hslb = CIQ.hsl(bgColor);
		if (color == "auto") isAuto = true;
		if (!color) color = "transparent";
		var fillColor = color;
		if (color == "auto") {
			fillColor = this.getDefaultColor();
		} else if (color.indexOf("rgba(") === 0) {
			// strip out the alpha component
			fillColor = (fillColor.split(",").slice(0, 3).join(",") + ")").replace(
				/rgba/,
				"rgb"
			);
		}
		var hslf = CIQ.hsl(fillColor);
		var isTransparent = CIQ.isTransparent(color);
		this.style.background = fillColor;
		if (isAuto || Math.abs(hslb[2] - hslf[2]) < 0.2 || isTransparent) {
			this.style.border = "solid " + border + " 1px";
			if (isTransparent)
				this.style.background =
					"linear-gradient(to bottom right, transparent, transparent 49%, " +
					border +
					" 50%, transparent 51%, transparent)";
		} else {
			this.style.border = "";
		}

		if (isAuto) {
			bgColor = CIQ.chooseForegroundColor(fillColor);
			this.style.background =
				"linear-gradient(to bottom right, " +
				fillColor +
				", " +
				fillColor +
				" 49%, " +
				bgColor +
				" 50%, " +
				bgColor +
				")";
		}
		if (percolate !== false)
			CIQ.UI.containerExecute(this, "setColor", color, this);
	}

	/**
	 * @alias launchColorPicker
	 * @memberof WebComponents.cq-swatch
	 */
	launchColorPicker() {
		CIQ.UI.containerExecute(this, "launchColorPicker");
		var colorPicker = document.querySelector("cq-color-picker");
		if (colorPicker) {
			colorPicker.callback = (function (self) {
				return function (color) {
					self.setColor(color, null);
				};
			})(this);
			var overrides = this.getAttribute("cq-overrides");
			if (overrides) overrides = overrides.split(",");
			colorPicker.display({
				node: this,
				context: CIQ.UI.getMyContext(this),
				overrides: overrides
			});
			this.colorPicker = colorPicker;
		}
	}
}

CIQ.UI.addComponentDefinition("cq-swatch", Swatch);

};


let __js_webcomponents_themeDialog_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */







var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

if (!CIQ.ThemeHelper) {
	console.error(
		"themeDialog component requires first activating theme feature."
	);
} else {
	/**
	 * Theme dialog web component `<cq-theme-dialog>`.
	 *
	 * Enables creation of custom chart themes.
	 *
	 * @namespace WebComponents.cq-theme-dialog
	 *
	 * @example
	 * <cq-dialog>
	 *     <cq-theme-dialog>
	 *         <h4 class="title">Create Custom Theme</h4>
	 *         <cq-close></cq-close>
	 *         <cq-scroll cq-no-maximize>
	 *             <cq-section>...</cq-section>
	 *             <cq-action>...</cq-action>
	 *         </cq-scroll>
	 *     </cq-theme-dialog>
	 * </cq-dialog>
	 */
	class ThemeDialog extends CIQ.UI.DialogContentTag {
		/**
		 * Applies changes to all charts on the screen.
		 *
		 * @memberof WebComponents.cq-theme-dialog
		 * @private
		 */
		applyChanges() {
			var stx = this.context.stx;
			this.helper.update(stx);
			stx.changeOccurred("theme");
		}

		/**
		 * Closes the theme dialog box.
		 *
		 * @alias close
		 * @memberof WebComponents.cq-theme-dialog
		 */
		close() {
			this.helper.settings = this.revert;
			this.applyChanges();
			super.close();
		}

		/**
		 * Opens the theme dialog box.
		 *
		 * @param {object} params Dialog box parameters.
		 * @param {CIQ.UI.Context} params.context The chart user interface context.
		 * @param {object} [params.initiatingMenu The menu that contains the user interface
		 * 		control that opened the theme dialog box.
		 * @param {string} [params.themeName] Hint text for the name of the custom theme. Used in
		 * 		the theme name input field of the theme dialog box.
		 *
		 * @alias open
		 * @memberof WebComponents.cq-theme-dialog
		 * @since 6.2.0 `basecolor` of mountain chart can be configured with "mb" piece.
		 */
		open(params) {
			this.addDefaultMarkup();
			super.open(params);
			var themeName = params.themeName;

			this.initiatingMenu = params.initiatingMenu;
			this.context = params.context;
			this.helper = new CIQ.ThemeHelper({ stx: this.context.stx });
			this.revert = CIQ.clone(this.helper.settings);

			var self = this;
			function configurePiece(name, obj, field, type) {
				var cu = self.node.find('cq-theme-piece[cq-piece="' + name + '"]');
				if (!cu.length) return;
				cu[0].piece = { obj: obj, field: field };
				if (type == "color") {
					cu.find("cq-swatch")[0].setColor(obj[field], false);
				}
			}
			var settings = this.helper.settings;
			configurePiece(
				"cu",
				settings.chartTypes["Candle/Bar"].up,
				"color",
				"color"
			);
			configurePiece(
				"cd",
				settings.chartTypes["Candle/Bar"].down,
				"color",
				"color"
			);
			configurePiece(
				"wu",
				settings.chartTypes["Candle/Bar"].up,
				"wick",
				"color"
			);
			configurePiece(
				"wd",
				settings.chartTypes["Candle/Bar"].down,
				"wick",
				"color"
			);
			configurePiece(
				"bu",
				settings.chartTypes["Candle/Bar"].up,
				"border",
				"color"
			);
			configurePiece(
				"bd",
				settings.chartTypes["Candle/Bar"].down,
				"border",
				"color"
			);
			configurePiece("lc", settings.chartTypes.Line, "color", "color");
			configurePiece("mb", settings.chartTypes.Mountain, "basecolor", "color");
			configurePiece("mc", settings.chartTypes.Mountain, "color", "color");
			configurePiece("bg", settings.chart.Background, "color", "color");
			configurePiece("gl", settings.chart["Grid Lines"], "color", "color");
			configurePiece("dd", settings.chart["Grid Dividers"], "color", "color");
			configurePiece("at", settings.chart["Axis Text"], "color", "color");

			if (!themeName) themeName = "My Theme";
			this.node.find("cq-action input").val(themeName);
		}

		/**
		 * Saves the custom theme and closes the theme dialog box.
		 *
		 * @alias save
		 * @memberof WebComponents.cq-theme-dialog
		 */
		save() {
			var themeName = this.node.find("cq-action input").val();
			var theme = {
				settings: CIQ.clone(this.helper.settings),
				name: themeName,
				builtIn: null
			};
			CIQ.UI.contextsForEach(function () {
				this.stx.updateListeners("theme");
			});
			var self = this;
			document.querySelectorAll("cq-themes").forEach(function (t) {
				theme.builtIn = t.currentLoadedBuiltIn;
				t.addCustom(theme, self.initiatingMenu);
			});
			super.close();
		}

		/**
		 * Sets a theme property, such as candle color, and applies the new property to all charts
		 * on the screen.
		 *
		 * @param {object} obj Contains the properties of a theme element.
		 * @param {string} field The property for which the new value is set.
		 * @param {string} value The new value for the theme property.
		 *
		 * @alias setValue
		 * @memberof WebComponents.cq-theme-dialog
		 */
		setValue(obj, field, value) {
			obj[field] = value;
			this.applyChanges();
		}
	}

	ThemeDialog.markup = `
		<h4 class="title">Create Custom Theme</h4>
		<cq-close></cq-close>
		<cq-scroll cq-no-maximize>
			<cq-section>
				<cq-placeholder>Candle Color
					<cq-theme-piece cq-piece="cu"><cq-swatch cq-overrides="Hollow"></cq-swatch></cq-theme-piece>
					<cq-theme-piece cq-piece="cd"><cq-swatch cq-overrides="Hollow"></cq-swatch></cq-theme-piece>
				</cq-placeholder>
				<cq-placeholder>Candle Wick
					<cq-theme-piece cq-piece="wu"><cq-swatch></cq-swatch></cq-theme-piece>
					<cq-theme-piece cq-piece="wd"><cq-swatch></cq-swatch></cq-theme-piece>
				</cq-placeholder>
				<cq-placeholder>Candle Border
					<cq-theme-piece cq-piece="bu"><cq-swatch cq-overrides="No Border"></cq-swatch></cq-theme-piece>
					<cq-theme-piece cq-piece="bd"><cq-swatch cq-overrides="No Border"></cq-swatch></cq-theme-piece>
				</cq-placeholder>
				<cq-separator></cq-separator>
				<cq-placeholder>Line/Bar Chart
					<cq-theme-piece cq-piece="lc"><cq-swatch></cq-swatch></cq-theme-piece>
				</cq-placeholder>
				<cq-separator></cq-separator>
				<cq-placeholder>Mountain Base
					<cq-theme-piece cq-piece="mb"><cq-swatch></cq-swatch></cq-theme-piece>
				</cq-placeholder>
				<cq-placeholder>Mountain Peak
					<cq-theme-piece cq-piece="mc"><cq-swatch></cq-swatch></cq-theme-piece>
				</cq-placeholder>
			</cq-section>
			<cq-section>
				<cq-placeholder>Background
					<cq-theme-piece cq-piece="bg"><cq-swatch></cq-swatch></cq-theme-piece>
				</cq-placeholder>
				<cq-placeholder>Grid Lines
					<cq-theme-piece cq-piece="gl"><cq-swatch></cq-swatch></cq-theme-piece>
				</cq-placeholder>
				<cq-placeholder>Date Dividers
					<cq-theme-piece cq-piece="dd"><cq-swatch></cq-swatch></cq-theme-piece>
				</cq-placeholder>
				<cq-placeholder>Axis Text<cq-theme-piece cq-piece="at"><cq-swatch></cq-swatch></cq-theme-piece>
				</cq-placeholder>
			</cq-section>
			<cq-action>
				<input><div stxtap="save()" class="ciq-btn">Save</div>
			</cq-action>
		</cq-scroll>
	`;
	CIQ.UI.addComponentDefinition("cq-theme-dialog", ThemeDialog);
}

};


let __js_webcomponents_themePiece_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Theme Piece web component `<cq-theme-piece>`.
 *
 * Manages themes in for chart layout.
 *
 * @namespace WebComponents.cq-theme-piece
 *
 * @example
 * <cq-section>
 *     <cq-placeholder>Background
 *         <cq-theme-piece cq-piece="bg"><cq-swatch></cq-swatch></cq-theme-piece>
 *     </cq-placeholder>
 *     <cq-placeholder>Grid Lines
 *         <cq-theme-piece cq-piece="gl"><cq-swatch></cq-swatch></cq-theme-piece>
 *     </cq-placeholder>
 *     <cq-placeholder>Date Dividers
 *         <cq-theme-piece cq-piece="dd"><cq-swatch></cq-swatch></cq-theme-piece>
 *     </cq-placeholder>
 *     <cq-placeholder>Axis Text
 *         <cq-theme-piece cq-piece="at"><cq-swatch></cq-swatch></cq-theme-piece>
 *     </cq-placeholder>
 * </cq-section>
 */
class ThemePiece extends CIQ.UI.BaseComponent {
	setBoolean(result) {
		CIQ.UI.containerExecute(
			this,
			"setValue",
			this.piece.obj,
			this.piece.field,
			result
		);
	}

	/**
	 * @alias setColor
	 * @memberof WebComponents.cq-theme-piece
	 */
	setColor(color) {
		if (color == "Hollow" || color == "No Border") {
			color = "transparent";
			this.node.find("cq-swatch")[0].setColor("transparent", false);
		}
		CIQ.UI.containerExecute(
			this,
			"setValue",
			this.piece.obj,
			this.piece.field,
			color
		);
	}
}

CIQ.UI.addComponentDefinition("cq-theme-piece", ThemePiece);

};


let __js_webcomponents_themes_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */


var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Themes web component `<cq-themes>`.
 *
 * This web component has two functions. The first is displaying available themes in a menu.
 * The second is providing a theme dialog for entering a new theme.
 *
 * Built in themes are merely the names of classes that will be added to the top element of the UIContext when
 * selected.
 *
 * @namespace WebComponents.cq-themes
 *
 * @example
 * <cq-themes>
 *     <cq-themes-builtin cq-no-close>
 *         <template>
 *             <cq-item></cq-item>
 *         </template>
 *     </cq-themes-builtin>
 *     <cq-themes-custom cq-no-close>
 *         <template>
 *             <cq-theme-custom>
 *                 <cq-item>
 *                     <cq-label></cq-label>
 *                     <cq-close></cq-close>
 *                 </cq-item>
 *             </cq-theme-custom>
 *         </template>
 *     </cq-themes-custom>
 *     <cq-separator cq-partial></cq-separator>
 *     <cq-item stxtap="newTheme()"><cq-plus></cq-plus> New Theme </cq-item>
 * </cq-themes>
 */
class Themes extends CIQ.UI.ContextTag {
	connectedCallback() {
		if (this.attached) return;
		super.connectedCallback();
	}

	setContext({ config }) {
		if (!config) return; // grid does not provide config
		const {
			chartId: id,
			themes: { builtInThemes, defaultTheme }
		} = config;
		const nameValueStore =
			config.themes.nameValueStore || config.nameValueStore;
		this.initialize({ builtInThemes, defaultTheme, nameValueStore, id });
	}

	/**
	 * Adds a custom theme
	 * @memberof WebComponents.cq-themes
	 * @param {object} theme The theme descriptor
	 * @param {Themes} initiatingMenu The menu which initially called ThemeDialog. This is used in order to save the new theme as the current theme.
	 */
	addCustom(theme, initiatingMenu) {
		this.params.customThemes[theme.name] = theme;
		if (initiatingMenu === this) this.currentTheme = theme.name;
		this.configureMenu();
		this.persist();
	}

	configureMenu() {
		function loadBuiltIn(self, className) {
			return function (e) {
				self.loadBuiltIn(className);
				if (self.params.callback) {
					self.params.callback({ theme: self.currentTheme });
				}
				self.persist("current");
			};
		}
		function loadCustom(self, themeName) {
			return function (e) {
				self.loadCustom(themeName);
				if (self.params.callback) {
					self.params.callback({ theme: self.currentTheme });
				}
				self.persist("current");
			};
		}
		this.builtInMenu.children(":not(template)").remove();
		this.customMenu.children(":not(template)").remove();
		var display, newMenuItem;
		var builtInThemes = this.params.builtInThemes;
		for (var className in builtInThemes) {
			display = builtInThemes[className];
			newMenuItem = CIQ.UI.makeFromTemplate(this.builtInTemplate);
			newMenuItem.text(display);
			this.makeTap(newMenuItem[0], loadBuiltIn(this, className));
			this.builtInMenu.append(newMenuItem);
		}
		if (CIQ.I18N && CIQ.I18N.localized)
			CIQ.I18N.translateUI(null, this.builtInMenu[0]);

		if (this.customMenu.length && this.customTemplate.length) {
			var customThemes = this.params.customThemes;
			for (var themeName in customThemes) {
				display = themeName;
				newMenuItem = CIQ.UI.makeFromTemplate(this.customTemplate);
				newMenuItem.find("cq-label").text(display);
				this.makeTap(
					newMenuItem.find("cq-item")[0],
					loadCustom(this, themeName)
				);
				newMenuItem[0].close = (function (self, themeName) {
					return function () {
						self.removeTheme(themeName);
					};
				})(this, themeName);
				this.customMenu.append(newMenuItem);
			}
		}
	}

	/**
	 * Initialize the web component
	 * @param {Object} params Parameters
	 * @param {Object} [params.builtInThemes] Object map of built in theme names, display names
	 * @param {Object} [params.defaultTheme] The default built in theme to use
	 * @param {Object} [params.nameValueStore] A {@link CIQ.NameValueStore} object for fetching and saving theme state
	 * @param {string} [params.id] id which can be used to disambiguate when multiple charts are on the screen
	 * @memberof WebComponents.cq-themes
	 */
	initialize(params) {
		if (this.initialized) return;
		this.initialized = true;

		this.addDefaultMarkup();
		this.selectTemplates(this);
		this.params = {};
		if (params) this.params = params;
		const isConstructor = (check) => typeof check === "function";
		CIQ.ensureDefaults(this.params, {
			customThemes: {},
			builtInThemes: {},
			nameValueStore: CIQ.NameValueStore && new CIQ.NameValueStore()
		});
		if (this.params.id) this.id = "themes_" + this.params.id;

		let self = this;
		let { nameValueStore } = this.params;
		if (nameValueStore) {
			if (isConstructor(nameValueStore))
				nameValueStore = this.params.nameValueStore = new nameValueStore();
			// Retrieve any custom themes the user has created
			nameValueStore.get("CIQ.Themes.prototype.custom", (err, result) => {
				if (!err && result) {
					self.params.customThemes = result;
				}
				// Set the current theme to the last one selected by user
				nameValueStore.get(
					self.id + "CIQ.Themes.prototype.current",
					(err, result) => {
						if (!err && result && result.theme) {
							self.loadTheme(result.theme);
						} else {
							self.loadTheme(self.params.defaultTheme);
						}
						self.configureMenu();
					}
				);
			});
		} else {
			this.loadTheme(self.params.defaultTheme);
		}
	}

	loadBuiltIn(className) {
		if (this.currentLoadedBuiltIn) {
			this.context.topNode.classList.remove(this.currentLoadedBuiltIn);
		}
		this.context.topNode.classList.add(className);
		this.currentLoadedBuiltIn = this.currentTheme = className;
		this.reinitializeChart();
	}

	loadCustom(themeName) {
		if (this.currentLoadedBuiltIn) {
			this.context.topNode.classList.remove(this.currentLoadedBuiltIn);
		}
		var theme = this.params.customThemes[themeName];
		if (theme.builtIn) this.context.topNode.classList.add(theme.builtIn);
		this.currentLoadedBuiltIn = theme.builtIn;
		this.currentTheme = theme.name;
		this.reinitializeChart(theme);
	}

	loadTheme(themeName) {
		if (this.params.customThemes[themeName]) this.loadCustom(themeName);
		else if (this.params.builtInThemes[themeName]) this.loadBuiltIn(themeName);
		else this.loadBuiltIn(this.params.defaultTheme);
	}

	newTheme() {
		const { context } = this;
		if (context.config) {
			this.channelWrite(
				context.config.channels.dialog,
				{ type: "theme", params: { context, initiatingMenu: this } },
				context.stx
			);
		} else {
			document
				.querySelector("cq-theme-dialog")
				.open({ context: this.context, initiatingMenu: this });
		}
	}

	persist(which) {
		if (!this.params.nameValueStore) return;
		if (!which || which == "current")
			this.params.nameValueStore.set(this.id + "CIQ.Themes.prototype.current", {
				theme: this.currentTheme
			});
		if (!which || which == "custom")
			this.params.nameValueStore.set(
				"CIQ.Themes.prototype.custom",
				this.params.customThemes
			);
	}

	removeTheme(themeName) {
		var saved = false;
		document.querySelectorAll("cq-themes").forEach(function (t) {
			delete t.params.customThemes[themeName];
			t.configureMenu();
			if (!saved) {
				t.persist();
				saved = true;
			}
		});
	}

	selectTemplates() {
		if (this.builtInMenu) return;
		this.builtInMenu = this.node.find("cq-themes-builtin");
		this.builtInTemplate = this.builtInMenu.find("template");
		this.customMenu = this.node.find("cq-themes-custom");
		this.customTemplate = this.customMenu.find("template");
	}

	/**
	 * @private
	 * @param {object} theme
	 * @memberOf WebComponents.cq-themes
	 */
	reinitializeChart(theme) {
		if (this.context.stx.setThemeSettings) {
			this.context.stx.setThemeSettings(theme ? theme.settings : null);
		}
	}
}

Themes.markup = `
		<cq-themes-builtin cq-no-close>
			<template>
				<cq-item></cq-item>
			</template>
		</cq-themes-builtin>
		<cq-themes-custom cq-no-close>
			<template>
				<cq-theme-custom>
					<cq-item>
						<cq-label></cq-label>
						<cq-close></cq-close>
					</cq-item>
				</cq-theme-custom>
			</template>
		</cq-themes-custom>
		<cq-item stxtap="newTheme()"><cq-plus></cq-plus>New Theme</cq-item>
	`;
CIQ.UI.addComponentDefinition("cq-themes", Themes);

};


let __js_webcomponents_timezoneDialog_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */





var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

if (!CIQ.timeZoneMap) {
	console.error(
		"timezoneDialog component requires first activating timezone feature."
	);
} else {
	/**
	 * Time zone dialog web component `<cq-timezone-dialog>`.
	 *
	 * @namespace WebComponents.cq-timezone-dialog
	 */
	class TimezoneDialog extends CIQ.UI.DialogContentTag {
		/**
		 * Opens the dialog and sets the time zone selected by the user.
		 *
		 * @alias open
		 * @memberof WebComponents.cq-timezone-dialog
		 */
		open(params) {
			this.addDefaultMarkup();
			super.open(params);
			var node = this.node;
			var self = this;
			this.context = params.context;
			var stx = this.context.stx;

			function setTimezone(zone) {
				return function (e) {
					self.close();
					var translatedZone = CIQ.timeZoneMap[zone];
					CIQ.ChartEngine.defaultDisplayTimeZone = translatedZone;
					stx.setTimeZone(stx.dataZone, translatedZone);
					if (stx.chart.symbol) stx.draw();
				};
			}

			var ul = node.find("ul, .ciq-ul");
			var button = node.find(".ciq-btn");
			if (!this.template) {
				this.template = ul.find("li.timezoneTemplate")[0].cloneNode(true);
			}

			ul.empty();
			for (var key in CIQ.timeZoneMap) {
				var zone = key;
				var display = stx.translateIf(zone);
				var li = this.template.cloneNode(true);
				li.style.display = "block";
				li.innerHTML = display;
				CIQ.safeClickTouch(li, setTimezone(zone));
				ul.append(li);
			}
			var currentUserTimeZone = node.find(".currentUserTimeZone");
			if (stx.displayZone) {
				var fullZone = stx.displayZone;
				for (var tz in CIQ.timeZoneMap) {
					if (CIQ.timeZoneMap[tz] === stx.displayZone) fullZone = tz;
				}
				currentUserTimeZone.text(
					stx.translateIf("Current Timezone is") +
						" " +
						stx.translateIf(fullZone)
				);
				button.show();
			} else {
				currentUserTimeZone.text(
					stx.translateIf("Your timezone is your current location")
				);
				button.hide();
			}
		}

		/**
		 * Removes any user-selected time zone settings, and sets the time zone to the user's
		 * current location.
		 *
		 * @alias removeTimeZone
		 * @memberof WebComponents.cq-timezone-dialog
		 */
		removeTimezone() {
			CIQ.ChartEngine.defaultDisplayTimeZone = null;
			var stx = this.context.stx;
			stx.displayZone = null;
			stx.setTimeZone();

			if (stx.displayInitialized) stx.draw();

			this.close();
		}
	}

	TimezoneDialog.markup = `
		<h4 class="title">Choose Timezone</h4>
		<cq-close></cq-close>

		<p>To set your timezone use the location button below, or scroll through the following list...</p>
		<p class="currentUserTimeZone"></p>
		<div class="detect">
			<div class="ciq-btn" stxtap="removeTimezone()">Use My Current Location</div>
		</div>
		<div class="timezoneDialogWrapper" style="max-height:360px; overflow: hidden;">
			<cq-scroll cq-no-maximize class="ciq-ul" style="height:360px;">
				<li class="timezoneTemplate" style="display:none;cursor:pointer;"></li>
			</cq-scroll>
		</div>
		<div class="instruct">(Scroll for more options)</div>
	`;
	CIQ.UI.addComponentDefinition("cq-timezone-dialog", TimezoneDialog);
}

};


let __js_webcomponents_toggle_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Creates the `<cq-toggle>` web component.
 *
 * UI Helper that binds a toggle to an object member or to callback functions when toggled.
 *
 * **Attributes**
 * - `cq-member` &mdash; Object member to observe. If not provided, then callbacks are used
 *    exclusively.
 * - `cq-action` &mdash; Action to take. Default is "class".
 * - `cq-value` &mdash; Value for the action (i.e., class name). Default is "active".
 * - `cq-toggles` &mdash; A comma-separated list of values which are toggled through with each
 *    click. The list can include "null". Stringified booleans and "null" are converted to their
 *    primitive values. All other values are passed to the Number constructor. If the result is a
 *    number (not NaN), the number is used. Otherwise the value is left as a string.
 * - `cq-toggle-classes` &mdash; A comma-separated list of classes associated with the toggle
 *    setting. If a setting requires multiple classes, they need to be separated with spaces.
 *
 * Use [registerCallback](WebComponents.cq-toggle.html#registerCallback) to receive a callback
 * every time the toggle changes. When a callback is registered, any automatic class changes are
 * bypassed.
 *
 * @since 2015
 * @namespace WebComponents.cq-toggle
 *
 * @example
 * document.querySelector("cq-toggle").registerCallback(function(value){
 *    console.log("current value is " + value);
 *    if(value!=false) this.node.addClass("active");
 * })
 */
class Toggle extends CIQ.UI.ContextTag {
	constructor() {
		super();
		this.params = {
			member: null,
			obj: null,
			action: "class",
			value: "active",
			toggles: [],
			classes: {},
			callbacks: []
		};
	}

	disconnectedCallback() {
		CIQ.UI.unobserveProperty(
			this.params.member,
			this.params.obj,
			this.listener
		);
		super.disconnectedCallback();
	}

	begin() {
		const self = this;
		const { stx } = this.context;

		if (this.params.member) {
			this.listener = function (obj) {
				self.updateFromBinding(self.params);
			};
			CIQ.UI.observeProperty(
				self.params.member,
				self.params.obj,
				this.listener
			);
		}
		CIQ.UI.stxtap(this, function () {
			var toggles = self.params.toggles;
			var obj = self.params.obj;
			if (toggles.length > 1) {
				// Cycle through each field in the array with each tap
				for (var i = 0; i < toggles.length; i++) {
					var toggle = toggles[i];
					if (self.currentValue == toggle) {
						if (i < toggles.length - 1) self.set(toggles[i + 1]);
						else self.set(toggles[0]);
						break;
					}
				}
				if (i == toggles.length) {
					// default to first item in toggle
					self.set(toggles[0]);
				}
			} else {
				if (self.currentValue) {
					self.set(false);
				} else {
					self.set(true);
				}
			}
			stx.draw();
			if (obj === stx.layout) stx.changeOccurred("layout");
			if (obj === stx.preferences) stx.changeOccurred("preferences");
		});
	}

	/**
	 * Adds a callback function to the toggle.
	 *
	 * @param {function} fc The callback function to add to the toggle. The function accepts the
	 * 		current value of the toggle as a parameter. The value of `this` within the callback
	 * 		function is the toggle component.
	 * @param {boolean} immediate A flag that indicates whether to immediately call the callback
	 * 		function after it has been registered with the toggle.
	 *
	 * @alias registerCallback
	 * @memberof WebComponents.cq-toggle
	 * @since 2015
	 */
	registerCallback(fc, immediate) {
		if (immediate !== false) immediate = true;
		this.params.callbacks.push(fc);
		if (immediate) fc.call(this, this.currentValue);
	}

	set(value) {
		if (this.isInfoToggle) return this.parentElement.set(value);

		if (this.params.member) {
			this.params.obj[this.params.member] = value;
		} else {
			this.currentValue = value;
			for (var i = 0; i < this.params.callbacks.length; i++) {
				this.params.callbacks[i].call(this, this.currentValue);
			}
		}
		this.updateClass();
	}

	setContext({ config }) {
		this.currentValue |= false; // if it were set to true before, leave it
		this.params.obj = this.context.stx.layout;
		var member = this.node.attr("cq-member");
		if (member == "headsUp") this.wrapInInfoToggle();
		if (config && config.channels && config.channels[member]) {
			member = config.channels[member];
		}
		if (member && member.indexOf(".") !== -1) {
			var m = member.split(".");
			this.params.obj = this.context.stx[m[0]];
			if (typeof this.params.obj === "undefined") {
				this.context.stx[m[0]] = this.params.obj = {};
			}
			member = m[1];
		}
		if (member) this.params.member = member;
		var action = this.node.attr("cq-action");
		if (action) this.params.action = action;
		var value = this.node.attr("cq-value");
		if (value) this.params.value = value;
		var toggles = this.node.attr("cq-toggles");
		if (toggles) this.params.toggles = toggles.split(",");
		// By default anything in the toggle attribute will be a string, which can cause issues when observing a member b/c "true"!==true
		// Here we are setting "true", "false", and "null" to be their native alternatives instead of strings.
		// We also check to see if we can cast the number and if it is not NaN we change it to be a number.
		// Be aware this will change an empty string to 0 but you shouldn't be setting an empty string!
		for (var i = 0; i < this.params.toggles.length; i++) {
			toggles = this.params.toggles;
			var toggle = toggles[i];
			if (toggle === "null") toggles[i] = null;
			else if (toggle === "true" || toggle === "false")
				toggles[i] = toggle === "true";
			else if (!isNaN(Number(toggle))) toggles[i] = Number(toggle);
		}
		// associate class with toggle setting
		var toggleClasses = this.node.attr("cq-toggle-classes");
		if (toggleClasses) {
			// extract an array of class settings from comma or comma-space separated class list
			var toggleClassArr = toggleClasses.split(/, |,/);

			// find classes to be cleared when new setting is applied,
			// taking in account that a setting can have more than one  space separated class assigned
			this.params.removeClasses = toggleClasses
				.split(/, | |,/)
				.filter((el) => el);

			// associate each setting with applicable class(es)
			this.params.classes = this.params.toggles.reduce(function (
				classLookup,
				setting,
				index
			) {
				classLookup[setting] = toggleClassArr[index].split(/ /);
				return classLookup;
			},
			{});
		}
		// set default value if object[member] is undefined
		if (member && this.params.obj[member] === undefined) {
			const defaultValue =
				toggles && toggles.length ? toggles[toggles.length - 1] : false;
			this.params.obj[member] = defaultValue;
		}

		this.begin();
	}

	updateFromBinding(params) {
		this.currentValue = this.isInfoToggle
			? this.parentElement.getCurrentValue(params)
			: params.obj[params.member];

		if (!this.params.callbacks.length) {
			if (this.params.action == "class") {
				if (this.currentValue) {
					this.node.addClass(this.params.value);
				} else {
					this.node.removeClass(this.params.value);
				}
			}
		} else {
			for (var i = 0; i < this.params.callbacks.length; i++) {
				this.params.callbacks[i].call(this, this.currentValue);
			}
		}
		this.updateClass();
		if (params.member == "crosshair" && this.currentValue === false)
			this.context.stx.doDisplayCrosshairs();
	}

	updateClass() {
		const { removeClasses, classes } = this.params;
		if (!removeClasses || this.currentValue === undefined) {
			return;
		}

		this.classList.remove(...removeClasses);
		if (classes[this.currentValue][0]) {
			let currentClasses = classes[this.currentValue];
			this.classList.add(...currentClasses);
		}
	}

	wrapInInfoToggle() {
		// inserts a cq-info-toggle around the headsUp cq-toggle if there is none, because it needs it to function
		if (this.closest("cq-info-toggle, cq-info-toggle-dropdown")) return;
		var infoToggle = document.createElement("cq-info-toggle");
		this.parentNode.replaceChild(infoToggle, this);
		infoToggle.appendChild(this);
	}
}

CIQ.UI.addComponentDefinition("cq-toggle", Toggle);

};


let __js_webcomponents_toolbar_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */


var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

if (!CIQ.Drawing) {
	console.error("toolbar component requires first activating drawing feature.");
} else {
	/**
	 * Drawing toolbar web component used to activate and manage available drawings.
	 *
	 * Emits a "change" event when changed.
	 *
	 * @namespace WebComponents.cq-toolbar
	 * @example
	 * <cq-toolbar>
	 *     <cq-menu class="ciq-select">
	 *         <span cq-current-tool>Select Tool</span>
	 *         <cq-menu-dropdown>
	 *             <cq-item stxtap="noTool()">None</cq-item>
	 *             <cq-item stxtap="clearDrawings()">Clear All Drawings</cq-item>
	 *             <cq-item stxtap="restoreDefaultConfig(true)">Restore Default Parameters</cq-item>
	 *             <cq-item stxtap="tool('measure')">Measure</cq-item>
	 *             <cq-separator></cq-separator>
	 *             <cq-item stxtap="tool('annotation')">Annotation</cq-item>
	 *             <cq-item stxtap="tool('average')">Average Line</cq-item>
	 *             <cq-item stxtap="tool('callout')">Callout</cq-item>
	 *             <cq-item stxtap="tool('channel')">Channel</cq-item>
	 *             <cq-item stxtap="tool('continuous')">Continuous</cq-item>
	 *             <cq-item stxtap="tool('crossline')">Crossline</cq-item>
	 *             <cq-item stxtap="tool('freeform')">Doodle</cq-item>
	 *             <cq-item stxtap="tool('ellipse')">Ellipse</cq-item>
	 *             <cq-item stxtap="tool('retracement')">Fib Retracement</cq-item>
	 *             <cq-item stxtap="tool('fibprojection')">Fib Projection</cq-item>
	 *             <cq-item stxtap="tool('fibarc')">Fib Arc</cq-item>
	 *             <cq-item stxtap="tool('fibfan')">Fib Fan</cq-item>
	 *             <cq-item stxtap="tool('fibtimezone')">Fib Time Zone</cq-item>
	 *             <cq-item stxtap="tool('gannfan')">Gann Fan</cq-item>
	 *             <cq-item stxtap="tool('gartley')">Gartley</cq-item>
	 *             <cq-item stxtap="tool('horizontal')">Horizontal</cq-item>
	 *             <cq-item stxtap="tool('line')">Line</cq-item>
	 *             <cq-item stxtap="tool('pitchfork')">Pitchfork</cq-item>
	 *             <cq-item stxtap="tool('quadrant')">Quadrant Lines</cq-item>
	 *             <cq-item stxtap="tool('ray')">Ray</cq-item>
	 *             <cq-item stxtap="tool('rectangle')">Rectangle</cq-item>
	 *             <cq-item stxtap="tool('regression')">Regression Line</cq-item>
	 *             <cq-item stxtap="tool('segment')">Segment</cq-item>
	 *             <cq-item stxtap="tool('arrow')">Shape - Arrow</cq-item>
	 *             <cq-item stxtap="tool('check')">Shape - Check</cq-item>
	 *             <cq-item stxtap="tool('xcross')">Shape - Cross</cq-item>
	 *             <cq-item stxtap="tool('focusarrow')">Shape - Focus</cq-item>
	 *             <cq-item stxtap="tool('heart')">Shape - Heart</cq-item>
	 *             <cq-item stxtap="tool('star')">Shape - Star</cq-item>
	 *             <cq-item stxtap="tool('speedarc')">Speed Resistance Arc</cq-item>
	 *             <cq-item stxtap="tool('speedline')">Speed Resistance Line</cq-item>
	 *             <cq-item stxtap="tool('timecycle')">Time Cycle</cq-item>
	 *             <cq-item stxtap="tool('tirone')">Tirone Levels</cq-item>
	 *             <cq-item stxtap="tool('trendline')">Trend Line</cq-item>
	 *             <cq-item stxtap="tool('vertical')">Vertical</cq-item>
	 *         </cq-menu-dropdown>
	 *     </cq-menu>
	 *     <cq-toolbar-settings>
	 *         <cq-fill-color cq-section class="ciq-color" stxbind="getFillColor()" stxtap="pickFillColor()">
	 *             <span></span>
	 *         </cq-fill-color>
	 *         <div>
	 *             <cq-line-color cq-section cq-overrides="auto" class="ciq-color" stxbind="getLineColor()" stxtap="pickLineColor()"><span></span></cq-line-color>
	 *             <cq-line-style cq-section>
	 *                 <cq-menu class="ciq-select">
	 *                     <span cq-line-style class="ciq-line ciq-selected"></span>
	 *                     <cq-menu-dropdown class="ciq-line-style-menu">
	 *                         <cq-item stxtap="setLine(1,'solid')"><span class="ciq-line-style-option ciq-solid-1"></span></cq-item>
	 *                         <cq-item stxtap="setLine(3,'solid')"><span class="ciq-line-style-option ciq-solid-3"></span></cq-item>
	 *                         <cq-item stxtap="setLine(5,'solid')"><span class="ciq-line-style-option ciq-solid-5"></span></cq-item>
	 *                         <cq-item stxtap="setLine(1,'dotted')"><span class="ciq-line-style-option ciq-dotted-1"></span></cq-item>
	 *                         <cq-item stxtap="setLine(3,'dotted')"><span class="ciq-line-style-option ciq-dotted-3"></span></cq-item>
	 *                         <cq-item stxtap="setLine(5,'dotted')"><span class="ciq-line-style-option ciq-dotted-5"></span></cq-item>
	 *                         <cq-item stxtap="setLine(1,'dashed')"><span class="ciq-line-style-option ciq-dashed-1"></span></cq-item>
	 *                         <cq-item stxtap="setLine(3,'dashed')"><span class="ciq-line-style-option ciq-dashed-3"></span></cq-item>
	 *                         <cq-item stxtap="setLine(5,'dashed')"><span class="ciq-line-style-option ciq-dashed-5"></span></cq-item>
	 *                         <cq-item stxtap="setLine(0,'none')" class="ciq-none">None</cq-item>
	 *                     </cq-menu-dropdown>
	 *                 </cq-menu>
	 *             </cq-line-style>
	 *         </div>
	 *         <cq-axis-label cq-section>
	 *             <div class="ciq-heading">Axis Label:</div>
	 *             <span stxtap="toggleAxisLabel()" class="ciq-checkbox ciq-active"><span></span></span>
	 *         </cq-axis-label>
	 *         <cq-annotation cq-section>
	 *             <cq-annotation-italic stxtap="toggleFontStyle('italic')" class="ciq-btn" style="font-style:italic;">I</cq-annotation-italic>
	 *             <cq-annotation-bold stxtap="toggleFontStyle('bold')" class="ciq-btn" style="font-weight:bold;">B</cq-annotation-bold>
	 *             <cq-menu class="ciq-select">
	 *                 <span cq-font-size>12px</span>
	 *                 <cq-menu-dropdown class="ciq-font-size">
	 *                     <cq-item stxtap="setFontSize('8px')">8</cq-item>
	 *                     <cq-item stxtap="setFontSize('10px')">10</cq-item>
	 *                     <cq-item stxtap="setFontSize('12px')">12</cq-item>
	 *                     <cq-item stxtap="setFontSize('13px')">13</cq-item>
	 *                     <cq-item stxtap="setFontSize('14px')">14</cq-item>
	 *                     <cq-item stxtap="setFontSize('16px')">16</cq-item>
	 *                     <cq-item stxtap="setFontSize('20px')">20</cq-item>
	 *                     <cq-item stxtap="setFontSize('28px')">28</cq-item>
	 *                     <cq-item stxtap="setFontSize('36px')">36</cq-item>
	 *                     <cq-item stxtap="setFontSize('48px')">48</cq-item>
	 *                     <cq-item stxtap="setFontSize('64px')">64</cq-item>
	 *                 </cq-menu-dropdown>
	 *             </cq-menu>
	 *             <cq-menu class="ciq-select">
	 *                 <span cq-font-family>Default</span>
	 *                 <cq-menu-dropdown class="ciq-font-family">
	 *                     <cq-item stxtap="setFontFamily('Default')">Default</cq-item>
	 *                     <cq-item stxtap="setFontFamily('Helvetica')">Helvetica</cq-item>
	 *                     <cq-item stxtap="setFontFamily('Courier')">Courier</cq-item>
	 *                     <cq-item stxtap="setFontFamily('Garamond')">Garamond</cq-item>
	 *                     <cq-item stxtap="setFontFamily('Palatino')">Palatino</cq-item>
	 *                     <cq-item stxtap="setFontFamily('Times New Roman')">Times New Roman</cq-item>
	 *                 </cq-menu-dropdown>
	 *             </cq-menu>
	 *         </cq-annotation>
	 *         <cq-clickable cq-fib-settings cq-selector="cq-fib-settings-dialog" cq-method="open" cq-section><span class="ciq-btn">Settings</span></cq-clickable>
	 *         <div cq-toolbar-action="save" stxtap="saveConfig()" cq-section><div cq-toolbar-dirty></div><cq-tooltip>Save Config</cq-tooltip></div>
	 *         <div cq-toolbar-action="restore" stxtap="restoreDefaultConfig()" cq-section><cq-tooltip>Restore Config</cq-tooltip></div>
	 *     </cq-toolbar-settings>
	 *     <cq-measure><span class="mMeasure"></span></cq-measure>
	 *     <cq-undo-section>
	 *         <cq-undo class="ciq-btn">Undo</cq-undo>
	 *         <cq-redo class="ciq-btn">Redo</cq-redo>
	 *     </cq-undo-section>
	 * </cq-toolbar>
	 */
	class DrawingToolbar extends CIQ.UI.ContextTag {
		connectedCallback() {
			if (this.attached) return;
			super.connectedCallback();
			this.params = {
				toolSelection: this.node.find("*[cq-current-tool]"),
				lineSelection: this.node.find("*[cq-line-style]"),
				fontSizeSelection: this.node.find("*[cq-font-size]"),
				fontFamilySelection: this.node.find("*[cq-font-family]"),
				fontStyleToggle: this.node.find("cq-annotation-italic"),
				fontWeightToggle: this.node.find("cq-annotation-bold"),
				axisLabelToggle: this.node.find("cq-axis-label .ciq-checkbox"),
				fillColor: this.node.find("cq-fill-color").not("cq-cvp-controller"),
				lineColor: this.node.find("cq-line-color").not("cq-cvp-controller"),
				cvpControllers: this.node.find("cq-cvp-controller")
			};
			this.params.cvpControllers.prop("toolbar", this);
			this.noToolSelectedText = "";
		}

		clearDrawings() {
			this.context.stx.clearDrawings(null, false);
		}

		crosshairs(activator) {
			var node = CIQ.UI.$(activator.node);
			var stx = this.context.stx;
			this.params.toolSelection.html(node.html());
			stx.changeVectorType(null);
			stx.layout.crosshair = true;
			stx.doDisplayCrosshairs();
			stx.findHighlights(false, true);
			stx.changeOccurred("layout");
			stx.draw();
			stx.updateChartAccessories();
			this.node.find("*[cq-section]").removeClass("ciq-active");
			this.emit();
		}

		defaultElements(drawingParameters) {
			var arr = [];
			for (var param in drawingParameters) {
				if (param == "color") arr.push("cq-line-color");
				else if (param == "fillColor") arr.push("cq-fill-color");
				else if (param == "pattern" || param == "lineWidth")
					arr.push("cq-line-style");
				else if (param == "axisLabel") arr.push("cq-axis-label");
				else if (param == "font") arr.push("cq-annotation");
				else if (param == "parameters") arr.push("cq-clickable");
			}

			return arr;
		}

		dirty(on) {
			this.node
				.find("*[cq-toolbar-dirty]")
				[on === false ? "removeClass" : "addClass"]("ciq-active");
		}

		emit() {
			var event = new Event("change", {
				bubbles: true,
				cancelable: true
			});
			this.dirty();
			this.dispatchEvent(event);
		}

		getFillColor(activator) {
			var node = CIQ.UI.$(activator.node);
			var color = this.context.stx.currentVectorParameters.fillColor;
			if (color == "transparent" || color == "auto") color = "";
			node.css({ background: color });
			var bgColor = CIQ.getBackgroundColor(this.parentNode);
			if (color && Math.abs(CIQ.hsl(bgColor)[2] - CIQ.hsl(color)[2]) < 0.2) {
				var border = CIQ.chooseForegroundColor(bgColor);
				node.css({ border: "solid " + border + " 1px" });
			} else {
				node.css({ border: "" });
			}
		}

		getLineColor(activator) {
			var node = CIQ.UI.$(activator.node);
			var color = this.context.stx.currentVectorParameters.currentColor;
			if (color == "transparent" || color == "auto") color = "";
			node.css({ background: color });
			var bgColor = CIQ.getBackgroundColor(this.parentNode);
			if (!color || Math.abs(CIQ.hsl(bgColor)[2] - CIQ.hsl(color)[2]) < 0.2) {
				var border = CIQ.chooseForegroundColor(bgColor);
				node.css({ border: "solid " + border + " 1px" });
				if (!color)
					node.css({
						background:
							"linear-gradient(to bottom right, " +
							border +
							", " +
							border +
							" 49%, " +
							bgColor +
							" 50%, " +
							bgColor +
							")"
					});
			} else {
				node.css({ border: "" });
			}
		}

		noTool() {
			var stx = this.context.stx;
			stx.changeVectorType("");
			if (stx.layout.crosshair) {
				stx.layout.crosshair = false;
				stx.changeOccurred("layout");
				stx.doDisplayCrosshairs();
			}
			if (stx.preferences.magnet) {
				this.toggleMagnet(this);
			}
			this.params.toolSelection.text(this.noToolSelectedText);
			this.params.toolSelection.attr("cq-current-tool", "");
			this.node.find("*[cq-section]").removeClass("ciq-active");
			this.emit();
		}

		pickFillColor(activator) {
			var node = CIQ.UI.$(activator.node);
			var colorPicker = document.querySelector("cq-color-picker");
			if (!colorPicker) {
				console.log(
					"DrawingToolbar.prototype.pickFillColor: no ColorPicker available"
				);
				return;
			}
			var self = this;
			colorPicker.callback = function (color) {
				self.context.stx.currentVectorParameters.fillColor = color;
				self.getFillColor({ node });
				self.emit();
			};
			colorPicker.display({ node, context: this.context });
		}

		pickLineColor(activator) {
			var node = CIQ.UI.$(activator.node);
			var colorPicker = document.querySelector("cq-color-picker");
			if (!colorPicker) {
				console.log(
					"DrawingToolbar.prototype.pickLineColor: no ColorPicker available"
				);
				return;
			}
			var self = this;
			colorPicker.callback = function (color) {
				self.context.stx.currentVectorParameters.currentColor = color;
				self.getLineColor({ node });
				self.emit();
			};
			var overrides = node.attr("cq-overrides");
			if (overrides) overrides = overrides.split(",");
			colorPicker.display({ node, context: this.context, overrides });
		}

		restoreDefaultConfig(activator, all) {
			var stx = this.context.stx;
			CIQ.Drawing.restoreDefaultConfig(
				stx,
				stx.currentVectorParameters.vectorType,
				all
			);
			this.node
				.find("*[cq-toolbar-action='restore']")
				.removeClass("ciq-active");
			this.sync();
			this.dirty(false);
		}

		saveConfig() {
			var stx = this.context.stx;
			CIQ.Drawing.saveConfig(stx, stx.currentVectorParameters.vectorType);
			this.node.find("*[cq-toolbar-action='restore']").addClass("ciq-active");
			this.sync();
			this.dirty(false);
		}

		setFibs(width, pattern) {
			var fib = this.context.stx.currentVectorParameters.fibonacci;
			if (fib) {
				for (var i = 0; i < fib.fibs.length; i++) {
					fib.fibs[i].parameters.lineWidth = width;
					fib.fibs[i].parameters.pattern = pattern;
				}
				fib.timezone.parameters.lineWidth = width;
				fib.timezone.parameters.pattern = pattern;
			}
		}

		setFontFamily(activator, fontFamily) {
			var stx = this.context.stx;

			if (stx.currentVectorParameters.annotation) {
				if (fontFamily == "Default") {
					stx.currentVectorParameters.annotation.font.family = null;
				} else {
					stx.currentVectorParameters.annotation.font.family = fontFamily;
				}
			}
			this.params.fontFamilySelection.text(fontFamily);
			this.emit();
		}

		setFontSize(activator, fontSize) {
			var stx = this.context.stx;

			if (stx.currentVectorParameters.annotation)
				stx.currentVectorParameters.annotation.font.size = fontSize;
			this.params.fontSizeSelection.text(fontSize);
			this.emit();
		}

		setContext(context) {
			this.noToolSelectedText = this.params.toolSelection.text();
			this.sync();
			this.dirty(false);
			var self = this;
			this.eventListeners.push(
				context.stx.addEventListener("theme", function (obj) {
					var isDirty = self.node
						.find("*[cq-toolbar-dirty]")
						.hasClass("ciq-active");
					self.sync();
					if (!isDirty) self.dirty(false);
				})
			);
		}

		setLine(activator, width, pattern) {
			var stx = this.context.stx;

			stx.currentVectorParameters.lineWidth = width;
			stx.currentVectorParameters.pattern = pattern;
			this.setFibs(width, pattern);
			if (this.currentLineSelectedClass)
				this.params.lineSelection.removeClass(this.currentLineSelectedClass);
			this.currentLineSelectedClass =
				"ciq-" + pattern + "-" + parseInt(width, 10);
			if (pattern == "none") {
				this.currentLineSelectedClass = null;
			} else {
				this.params.lineSelection.addClass(this.currentLineSelectedClass);
			}
			this.emit();
		}

		/**
		 * Synchronizes the drawing toolbar with stx.currentVectorParameters. Poor man's data binding.
		 * @param {object} [cvp=stx.currentVectorParameters] A new drawing object, otherwise defaults to the current one
		 * @memberof WebComponents.cq-toolbar
		 */
		sync(cvp) {
			var stx = this.context.stx;
			if (!cvp) cvp = stx.currentVectorParameters;
			else
				stx.currentVectorParameters = CIQ.extend(
					stx.currentVectorParameters || {},
					cvp
				);

			var params = this.params;
			this.setLine(null, cvp.lineWidth, cvp.pattern);

			var style = stx.canvasStyle("stx_annotation");

			var font = cvp.annotation && cvp.annotation.font;

			var initialSize = (font && font.size) || style.fontSize;
			this.setFontSize(null, initialSize);

			var initialFamily = (font && font.family) || style.fontFamily;
			this.setFontFamily(null, initialFamily);

			var initialFontStyle = (font && font.style) || style.fontStyle;
			params.fontStyleToggle[
				initialFontStyle === "italic" ? "addClass" : "removeClass"
			]("ciq-active");

			var initialWeight = (font && font.weight) || style.fontWeight;
			params.fontWeightToggle[
				initialWeight === "bold" || initialWeight >= 700
					? "addClass"
					: "removeClass"
			]("ciq-active");

			params.axisLabelToggle[cvp.axisLabel ? "addClass" : "removeClass"](
				"ciq-active"
			);

			this.getFillColor({ node: params.fillColor });
			this.getLineColor({ node: params.lineColor });

			params.cvpControllers.each(function () {
				this.sync(cvp);
			});
		}

		toggleAxisLabel(activator) {
			var stx = this.context.stx;
			var node = CIQ.UI.$(activator.node);

			if (stx.currentVectorParameters.axisLabel === true) {
				stx.currentVectorParameters.axisLabel = false;
				node.removeClass("ciq-active");
			} else {
				stx.currentVectorParameters.axisLabel = true;
				node.addClass("ciq-active");
			}
			this.emit();
		}

		toggleFontStyle(activator, fontStyle) {
			var stx = this.context.stx;
			var node = CIQ.UI.$(activator.node);

			if (fontStyle == "italic") {
				if (stx.currentVectorParameters.annotation.font.style == "italic") {
					stx.currentVectorParameters.annotation.font.style = null;
					node.removeClass("ciq-active");
				} else {
					stx.currentVectorParameters.annotation.font.style = "italic";
					node.addClass("ciq-active");
				}
			} else if (fontStyle == "bold") {
				if (stx.currentVectorParameters.annotation.font.weight == "bold") {
					stx.currentVectorParameters.annotation.font.weight = null;
					node.removeClass("ciq-active");
				} else {
					stx.currentVectorParameters.annotation.font.weight = "bold";
					node.addClass("ciq-active");
				}
			}
			this.emit();
		}

		toggleMagnet(activator) {
			var toggle = CIQ.UI.$(activator.node);
			var stx = this.context.stx;
			if (stx.preferences.magnet) {
				toggle.removeClass("active");
				stx.preferences.magnet = false;
			} else {
				toggle.addClass("active");
				stx.preferences.magnet = true;
			}
			CIQ.clearCanvas(stx.chart.tempCanvas, stx);
		}

		tool(activator, toolName) {
			var node = CIQ.UI.$(activator.node);
			if (!toolName) toolName = node.getAttribute("cq-tool");
			if (!toolName) return;
			var stx = this.context.stx;
			stx.clearMeasure();
			stx.changeVectorType(toolName);
			this.params.toolSelection.html(node.html());
			this.params.toolSelection.attr("cq-current-tool", toolName);

			this.node.find("*[cq-section]").removeClass("ciq-active");
			var removeDirty = !this.node
				.find("*[cq-toolbar-dirty]")
				.hasClass("ciq-active");
			var drawingParameters = CIQ.Drawing.getDrawingParameters(stx, toolName);
			if (drawingParameters) {
				this.node.find("*[cq-toolbar-action='save']").addClass("ciq-active");
				var drawingPrefs = stx.preferences.drawings;
				if (drawingPrefs && drawingPrefs[toolName]) {
					this.node
						.find("*[cq-toolbar-action='restore']")
						.addClass("ciq-active");
					removeDirty = true;
				}
				// fibtimezone has no values to display in the settings dialog
				if (toolName === "fibtimezone") {
					delete drawingParameters.parameters;
				}

				var none = this.params.lineSelection.parent().find(".ciq-none");
				none.hide();
				var elements = this.defaultElements(drawingParameters);
				for (var i = 0; i < elements.length; i++) {
					this.node.find(elements[i]).addClass("ciq-active");
					if (elements[i] == "cq-fill-color") none.show();
				}
				elements = CIQ.Drawing[toolName].prototype.$controls;
				for (i = 0; elements && i < elements.length; i++) {
					this.node.find(elements[i]).addClass("ciq-active");
				}
			}
			this.sync();
			if (removeDirty) this.dirty(false);
		}
	}

	CIQ.UI.addComponentDefinition("cq-toolbar", DrawingToolbar);
}

};


let __js_webcomponents_undo_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Undo web component `<cq-undo>`.
 *
 * @namespace WebComponents.cq-undo
 *
 * @example
 * <cq-undo-section>
 *     <cq-undo class="ciq-btn">Undo</cq-undo>
 *     <cq-redo class="ciq-btn">Redo</cq-redo>
 * </cq-undo-section>
 */
class Undo extends CIQ.UI.ContextTag {
	constructor() {
		super();
		this.redoButton = null;
		this.undostack = [];
		this.redostack = [];
		this.contexts = [];
	}

	connectedCallback() {
		if (this.attached) return;
		super.connectedCallback();
		var self = this;
		CIQ.UI.stxtap(this, function () {
			self.undo();
		});
	}

	/**
	 * Clears the stack of all redo or undo operations for the context
	 * @param  {CIQ.UI.Context} context The context to clear
	 * @alias clear
	 * @memberof WebComponents.cq-undo
	 */
	clear(context) {
		this.setButtonStyle();
	}

	handleEvent(context, type, data) {
		this.undostack.push({ context: context, drawings: data.before });
		this.redostack = [];
		this.setButtonStyle();
	}

	keyStroke(hub, key, e, keystroke) {
		if (key == "z" && (keystroke.ctrl || keystroke.cmd)) {
			// ctrl-z
			if (keystroke.shift) {
				this.redo();
			} else {
				this.undo();
			}
			return true;
		}
		if (key == "y" && (keystroke.ctrl || keystroke.cmd)) {
			// ctrl-y
			this.redo();
			return true;
		}
	}

	manageContext(context) {
		this.addClaim(this);
		var self = this;
		this.eventListeners.push(
			context.stx.addEventListener("undoStamp", function (data) {
				self.handleEvent(context, "undoStamp", data);
			})
		);
		this.contexts.push(context);
	}

	/**
	 * Reverts latest undone drawing.
	 * @alias redo
	 * @memberof WebComponents.cq-undo
	 */
	redo() {
		var state = this.redostack.pop();
		if (state) {
			var context = state.context;
			this.undostack.push({
				context: context,
				drawings: context.stx.exportDrawings()
			});
			var drawings = state.drawings;
			context.stx.abortDrawings(true);
			context.stx.importDrawings(drawings);
			context.stx.changeOccurred("vector");
			context.stx.draw();
		}
		this.setButtonStyle();
	}

	/**
	 * @private
	 */
	setButtonStyle() {
		if (this.undostack.length) {
			this.node.attr("cq-active", "true");
		} else {
			this.node.removeAttr("cq-active");
		}
		if (this.redoButton) {
			if (this.redostack.length) {
				this.redoButton.setAttribute("cq-active", "true");
			} else {
				this.redoButton.removeAttribute("cq-active");
			}
		}
	}

	setContext(context) {
		this.manageContext(this.context);

		var self = this;
		this.addInjection("append", "initializeChart", function () {
			self.undostack = [];
			self.redostack = [];
			self.clear();
		});
	}

	/**
	 * Reverts last drawing made.
	 * @alias undo
	 * @memberof WebComponents.cq-undo
	 */
	undo() {
		// If a drawing tool is in action, then pressing undo will kill the current tool
		var foundOne = false;
		for (var i = 0; i < this.contexts.length; i++) {
			if (this.contexts[i].stx.activeDrawing) {
				this.contexts[i].stx.undo();
				foundOne = true;
			}
		}
		if (foundOne) return;

		// otherwise proceed to popping off the stack
		var state = this.undostack.pop();
		if (state) {
			var context = state.context;
			this.redostack.push({
				context: context,
				drawings: context.stx.exportDrawings()
			});
			var drawings = state.drawings;
			context.stx.abortDrawings(true);
			context.stx.importDrawings(drawings);
			context.stx.changeOccurred("vector");
			context.stx.draw();
		}
		this.setButtonStyle();
	}
}

CIQ.UI.addComponentDefinition("cq-undo", Undo);

};


let __js_webcomponents_viewDialog_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */


var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * View Dialog web component `<cq-view-dialog>`.
 *
 * See {@link WebComponents.cq-views} for more details on menu management for this component.
 *
 * @namespace WebComponents.cq-view-dialog
 *
 * @example
 * <cq-dialog>
 *     <cq-view-dialog>
 *         <h4>Save View</h4>
 *         <div stxtap="close()" class="ciq-icon ciq-close"></div>
 *         <div style="text-align:center;margin-top:10px;">
 *             <i>Enter name of view:</i>
 *             <p>
 *                 <input spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="none" maxlength="40" placeholder="Name"><br>
 *             </p>
 *             <span class="ciq-btn" stxtap="save()">Save</span>
 *         </div>
 *     </cq-view-dialog>
 * </cq-dialog>
 */
class ViewDialog extends CIQ.UI.DialogContentTag {
	open(params) {
		this.addDefaultMarkup();
		this.querySelector("input").value = "";
		super.open(params);
	}

	/**
	 * Saves the new view. This updates all cq-view menus on the screen, and persists the view in the nameValueStore.
	 * @alias save
	 * @memberof WebComponents.cq-view-dialog
	 */
	save() {
		var viewName = this.node.find("input").val();
		if (!viewName) return;

		var self = this;
		var madeChange = false;
		var layout = this.context.stx.exportLayout();
		document.querySelectorAll("cq-views").forEach(function (v) {
			var obj = v.params.viewObj;
			var view;

			for (var i = 0; i < obj.views.length; i++) {
				view = obj.views[i];
				if (viewName == CIQ.first(view)) break;
			}
			if (i == obj.views.length) {
				view = {};
				view[viewName] = {};
				obj.views.push(view);
			}
			view[viewName] = layout;
			delete view[viewName].candleWidth;
			v.renderMenu();
			//this.context.stx.updateListeners("layout");
			if (!madeChange) {
				// We might have a cq-view menu on multiple charts on the screen. Only persist once.
				madeChange = true;
				if (v.params.nameValueStore)
					v.params.nameValueStore.set("stx-views", obj.views);
			}
		});
		this.close();
	}
}

ViewDialog.markup = `
		<h4>Save View</h4>
		<div stxtap="close()" class="ciq-icon ciq-close"></div>
		<div style="text-align:center;margin-top:10px;">
		<i>Enter name of view:</i>
		<p>
			<input spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="none" maxlength="40" placeholder="Name"><br>
		</p>
		<span class="ciq-btn" stxtap="save()">Save</span>
		</div>
	`;
CIQ.UI.addComponentDefinition("cq-view-dialog", ViewDialog);

};


let __js_webcomponents_views_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */


var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Views web component `<cq-views>`.
 *
 * Displays a menu containing available saved chart views and provides a dialog for saving new
 * views.
 *
 * @namespace WebComponents.cq-views
 *
 * @example
 * <cq-menu class="ciq-menu ciq-views collapse">
 *     <span>Views</span>
 *     <cq-menu-dropdown>
 *         <cq-views>
 *             <cq-heading>Saved Views</cq-heading>
 *             <cq-views-content>
 *                 <template cq-view>
 *                     <cq-item>
 *                         <cq-label></cq-label>
 *                         <div class="ciq-icon ciq-close"></div>
 *                     </cq-item>
 *                 </template>
 *             </cq-views-content>
 *             <cq-separator cq-partial></cq-separator>
 *             <cq-view-save>
 *                 <cq-item><cq-plus></cq-plus>Save View</cq-item>
 *             </cq-view-save>
 *         </cq-views>
 *     </cq-menu-dropdown>
 * </cq-menu>
 */
class Views extends CIQ.UI.ContextTag {
	/**
	 * Initializes the views menu.
	 *
	 * @param {object} [params] Parameters used to initialize the menu.
	 * @param {object} [params.viewObj = { views: [] }] Contains the menu items; that is, an array
	 * 		of objects that contain the specifications for saved views of the chart.
	 * @param {object} [params.nameValueStore] The class or constructor function that saves and
	 * 		retrieves the chart views by means of a name/value store. See the custom storage
	 * 		class example below. Defaults to the `nameValueStore` property of the chart
	 * 		configuration if available (see the {@tutorial Chart Configuration} tutorial);
	 * 		otherwise, defaults to {@link CIQ.NameValueStore}.
	 * @param {object} [params.renderCB = null] A callback function executed on the menu after the
	 * 		menu has been rendered. Takes the menu as an argument.
	 * @param {object} [params.cb] A callback function called when the saved views have been
	 * 		retrieved from the name/value store. No arguments are passed to the callback function.
	 *
	 * @memberof WebComponents.cq-views
	 * @since
	 * - 3.0.7 Added the `params.cb` parameter.
	 * - 4.1.0 The `ViewMenu` helper has been deprecated. Call
	 * 		`document.querySelector("cq-views").initialize()` instead.
	 *
	 * @example <caption>Create a custom name/value store for the <code>cq-views</code> web component.</caption>
	 * // Set the custom name/value store as the storage location for the web component.
	 * document.querySelector("cq-views").initialize({ nameValueStore: MyNameValueStore });
	 *
	 * // Create the custom name/value store.
	 * const MyNameValueStore = function() { };
	 *
	 * // Create custom storage functions using the same signatures and callback requirements as those in CIQ.NameValueStore.
	 * // For the cq-views web component, the data that is saved and retrieved is the array represented by params.viewObj.views.
	 *
	 * MyNameValueStore.prototype.set = function(name, value, cb) {
	 *     // Add code here to send the view object (value) to your repository and store it under the provided key (name).
	 *     if (cb) cb(error);
	 * };
	 *
	 * MyNameValueStore.prototype.get = function(name, cb) {
	 *     // Add code here to get the view object for the provided key (name) from your repository and pass it to the callback.
	 *     cb(error, viewObj);
	 * };
	 *
	 * MyNameValueStore.prototype.remove = function(name, cb) {
	 *     // Add code here to remove the view object associated with the provided key (name) from your repository.
	 *     if (cb) cb(error);
	 * };
	 *
	 * @example <caption>Reload the drop-down menu with the latest stored data.<br>
	 * (Useful if you are sharing the data with other applications that may also be modifying the
	 * data in real time.)</caption>
	 * let self = document.querySelector("cq-views");
	 * self.params.nameValueStore.get("stx-views", function(err, obj) {
	 *     if (!err && obj) self.params.viewObj.views = obj;
	 *     else self.params.viewObj = { views: [] };
	 *     if (self.params.cb) self.params.cb.call(self);
	 *     self.renderMenu();
	 * });
	 */
	initialize(params) {
		this.params = Object.assign({}, params);

		const { config } = this.context;
		let { nameValueStore } = config;

		CIQ.ensureDefaults(this.params, {
			viewObj: { views: [] },
			nameValueStore:
				(nameValueStore && new nameValueStore()) ||
				(CIQ.NameValueStore && new CIQ.NameValueStore()),
			template: "template[cq-view]"
		});
		this.params.template = this.querySelector(this.params.template);
		this.params.template.remove();
		var self = this;
		if (this.params.nameValueStore)
			this.params.nameValueStore.get("stx-views", function (err, obj) {
				if (!err && obj) self.params.viewObj.views = obj;
				if (self.params.cb) self.params.cb.call(self);
				self.renderMenu();
			});
	}

	connectedCallback() {
		super.connectedCallback();
		this.addDefaultMarkup();
	}

	setContext({ config }) {
		if (config && config.menuViewConfig) {
			this.initialize(config.menuViewConfig);
		}
	}

	/**
	 * Creates the menu.
	 *
	 * @memberof WebComponents.cq-views
	 */
	renderMenu() {
		var menu = this.node;
		var self = this;
		var stx = self.context.stx;

		function remove(i) {
			return function (e) {
				e.stopPropagation();
				var saved = false;
				document.querySelectorAll("cq-views").forEach(function (v) {
					v.params.viewObj.views.splice(i, 1);
					if (!saved) {
						if (v.params.nameValueStore)
							v.params.nameValueStore.set(
								"stx-views",
								self.params.viewObj.views
							);
						saved = true;
					}
					v.renderMenu();
				});
			};
		}

		function enable(i) {
			return function (e) {
				e.stopPropagation();
				self.uiManager.closeMenu();
				if (self.context.loader) self.context.loader.show();
				var layout = CIQ.first(self.params.viewObj.views[i]);
				function importLayout() {
					var finishImportLayout = function () {
						stx.changeOccurred("layout");
						if (self.context.loader) self.context.loader.hide();
					};
					stx.importLayout(self.params.viewObj.views[i][layout], {
						managePeriodicity: true,
						preserveTicksAndCandleWidth: true,
						cb: finishImportLayout
					});
				}
				setTimeout(importLayout, 10);
			};
		}

		menu.find("cq-views-content cq-item").remove();
		for (var v = 0; v < this.params.viewObj.views.length; v++) {
			var view = CIQ.first(self.params.viewObj.views[v]);
			if (view == "recent") continue;
			var item = CIQ.UI.makeFromTemplate(this.params.template);
			var label = item.find("cq-label");
			var removeView = item.find("div");

			if (label.length) {
				label.addClass("view-name-" + view);
				label.text(view); //using text() here to prevent script injection
			}
			if (removeView.length) CIQ.UI.stxtap(removeView[0], remove(v));
			this.makeTap(item[0], enable(v));
			menu.find("cq-views-content").append(item);
		}

		var addNew = menu.find("cq-view-save");
		if (addNew) {
			const { context } = this;
			const self = this;
			this.makeTap(addNew.find("cq-item")[0], function (e) {
				if (context.config) {
					self.channelWrite(context.config.channels.dialog, {
						type: "view",
						params: { context }
					});
				} else {
					document.querySelector("cq-view-dialog").open({ context });
				}
				const uiManager = CIQ.UI.getUIManager();
				if (uiManager) uiManager.closeMenu();
			});
		}
		if (this.params.renderCB) this.params.renderCB(menu);
	}
}

Views.markup = `
		<cq-heading>Saved Views</cq-heading>
		<cq-views-content>
			<template cq-view>
				<cq-item>
					<cq-label></cq-label>
					<div class="ciq-icon ciq-close" keyboard-selectable-child="true"></div>
				</cq-item>
			</template>
		</cq-views-content>
		<cq-separator cq-partial></cq-separator>
		<cq-view-save>
			<cq-item><cq-plus></cq-plus>Save View</cq-item>
		</cq-view-save>
	`;
CIQ.UI.addComponentDefinition("cq-views", Views);

};


let __js_webcomponents_waveParameters_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

class WaveParameters extends CIQ.UI.ContextTag {
	static get observedAttributes() {
		return ["corrective", "decoration", "impulse", "show-lines"];
	}

	get corrective() {
		return this.getAttribute("corrective");
	}

	set corrective(attribute) {
		if (attribute) this.setAttribute("corrective", attribute.join(" "));
		else this.removeAttribute("corrective");
	}

	get decoration() {
		return this.getAttribute("decoration");
	}

	set decoration(attribute) {
		if (attribute) this.setAttribute("decoration", attribute);
		else this.removeAttribute("decoration");
	}

	get impulse() {
		return this.getAttribute("impulse");
	}

	set impulse(attribute) {
		if (attribute) this.setAttribute("impulse", attribute.join(" "));
		else this.removeAttribute("impulse");
	}

	get showLines() {
		return this.hasAttribute("show-lines");
	}

	set showLines(value) {
		if (value) {
			this.setAttribute("show-lines", "");
			this.lineToggleCheckbox.classList.add("ciq-active");
		} else this.removeAttribute("show-lines");
	}

	get template() {
		return this.getAttribute("template");
	}

	set template(attribute) {
		return this.setAttribute("template", attribute);
	}

	static templates() {
		return {
			"Grand Supercycle": {
				impulse: ["I", "II", "III", "IV", "V"],
				corrective: ["a", "b", "c"],
				decoration: "enclosed"
			},
			Supercycle: {
				impulse: ["I", "II", "III", "IV", "V"],
				corrective: ["a", "b", "c"],
				decoration: "parentheses"
			},
			Cycle: {
				impulse: ["I", "II", "III", "IV", "V"],
				corrective: ["a", "b", "c"],
				decoration: null
			},
			Primary: {
				impulse: ["1", "2", "3", "4", "5"],
				corrective: ["A", "B", "C"],
				decoration: "enclosed"
			},
			Intermediate: {
				impulse: ["1", "2", "3", "4", "5"],
				corrective: ["A", "B", "C"],
				decoration: "parentheses"
			},
			Minor: {
				impulse: ["1", "2", "3", "4", "5"],
				corrective: ["A", "B", "C"],
				decoration: null
			},
			Minute: {
				impulse: ["i", "ii", "iii", "iv", "v"],
				corrective: ["a", "b", "c"],
				decoration: "enclosed"
			},
			Minuette: {
				impulse: ["i", "ii", "iii", "iv", "v"],
				corrective: ["a", "b", "c"],
				decoration: "parentheses"
			},
			"Sub-Minuette": {
				impulse: ["i", "ii", "iii", "iv", "v"],
				corrective: ["a", "b", "c"],
				decoration: null
			}
		};
	}

	attributeChangedCallback(name, oldAttr, newAttr) {
		if (!this.stx) return;
		let vector = this.stx.currentVectorParameters;
		let waveParameters = vector.waveParameters || {};
		let parameters;
		switch (name) {
			case "template":
				let newTemplate = this.templates[newAttr];
				if (newTemplate) {
					parameters = {
						decoration: newTemplate.decoration
					};
				}
				break;
			case "impulse":
				let impulse = newAttr ? newAttr.split(" ") : newAttr;
				parameters = { impulse: impulse };
				break;
			case "corrective":
				let corrective = newAttr ? newAttr.split(" ") : newAttr;
				parameters = { corrective: corrective };
				break;
			case "decoration":
				parameters = { decoration: newAttr };
				break;
			case "show-lines":
				parameters = { showLines: this.showLines };
				break;
			default:
				break;
		}
		vector.waveParameters = Object.assign(waveParameters, parameters);
	}

	constructor() {
		super();
		this.templates = WaveParameters.templates();
	}

	connectedCallback() {
		if (this.attached) return;
		this.template = "Grand Supercycle";
		var tmpl = document.querySelector(
			'template[cq-wave-parameters], template[cq-wave-parameters="true"]'
		);
		CIQ.UI.makeFromTemplate(tmpl, this);
		this.templateHeader = this.querySelector(".ciq-active-template");
		this.impulseHeader = this.querySelector(".ciq-active-impulse");
		this.correctiveHeader = this.querySelector(".ciq-active-corrective");
		this.decorators = {
			blank: this.querySelector(".ciq-btn:nth-of-type(1n)"),
			parentheses: this.querySelector(".ciq-btn:nth-of-type(2n)"),
			enclosed: this.querySelector(".ciq-btn:nth-of-type(3n)")
		};
		this.lineToggleCheckbox = this.querySelector("span.ciq-checkbox");
		super.connectedCallback();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	activate() {
		if (!this.stx) return;
		this.cvp = this.stx.currentVectorParameters;
		this.update(null, "template", this.template);
		this.showLines = true;
	}

	setContext() {
		this.stx = this.context.stx;
	}

	toggleLines() {
		let checkbox = this.lineToggleCheckbox;
		let active = checkbox.classList.contains("ciq-active");
		this.showLines = !active;
		if (active) checkbox.classList.remove("ciq-active");
		else checkbox.classList.add("ciq-active");
	}

	update(node, field, update) {
		let isTemplate = field === "template";

		if (!isTemplate) {
			if (field === "decoration") {
				for (let d in this.decorators) {
					this.decorators[d].classList.remove("ciq-active");
				}
				node.node.classList.add("ciq-active");
				this.decoration = node.node.getAttribute("decoration");
			} else if (field === "showLines") {
			} else {
				let u = update ? update.split(",") : update;
				this[field] = u;
				this[field + "Header"].innerHTML = u ? u.join(" ") : "- - -";
			}
			this.templateHeader.innerHTML = this.template = "Custom";
		} else {
			this.template = update;
			this.templateHeader.innerHTML = update;
			let newTemplate = this.templates[this.template];
			if (newTemplate) {
				this.impulse = newTemplate.impulse;
				this.impulseHeader.innerHTML = newTemplate.impulse.join(" ");

				this.corrective = newTemplate.corrective;
				this.correctiveHeader.innerHTML = newTemplate.corrective.join(" ");

				for (let d in this.decorators) {
					this.decorators[d].classList.remove("ciq-active");
				}
				let decorator = newTemplate.decoration || "blank";
				this.decorators[decorator].classList.add("ciq-active");
				this.decoration = decorator;
			} else
				this.cvp.waveParameters = {
					corrective: this.corrective.split(" "),
					impulse: this.impulse.split(" "),
					decoration: this.decoration
				};
		}
	}
}
CIQ.UI.addComponentDefinition("cq-wave-parameters", WaveParameters);

};


let __js_webcomponents_dialog_colorPicker_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */


var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

const Dialog = CIQ.UI._webcomponents.list["cq-dialog"];
if (!Dialog) {
	console.error(
		"colorPicker component requires first activating dialog component."
	);
} else {
	/**
	 * Color Picker web component `<cq-color-picker>`.
	 *
	 * `cq-colors` attribute can contain a csv list of CSS colors to use
	 * or `params.colorMap` can be set to a two dimensional array of colors as follows:
	 * ```
	 * var myColorPicker = document.querySelector("cq-color-picker");
	 * myColorPicker.params.colorMap=[[row 1 of colors],[row 2 of colors],[row 3 of colors],[etc]]
	 * myColorPicker.initialize();
	 * ```
	 * @namespace WebComponents.cq-color-picker
	 * @example
	 * var myColorPicker = document.querySelector("cq-color-picker");
	 * myColorPicker.params.colorMap=[["#ffffff", "#e1e1e1", "#cccccc", "#b7b7b7", "#a0a0a5", "#898989", "#707070", "#626262", "#555555", "#464646", "#363636", "#262626", "#1d1d1d", "#000000"]];
	 * myColorPicker.initialize();
	 *
	 * @example
		 <cq-color-picker>
			 <cq-colors></cq-colors>
			 <cq-overrides>
				 <template>
					 <div class="ciq-btn"></div>
				 </template>
			 </cq-overrides>
		 </cq-color-picker>
	 */
	class ColorPicker extends Dialog.classDefinition {
		constructor() {
			super();
			this.params = {
				colorMap:[
					["#ffffff", "#e1e1e1", "#cccccc", "#b7b7b7", "#a0a0a5", "#898989", "#707070", "#626262", "#555555", "#464646", "#363636", "#262626", "#1d1d1d", "#000000"],
					["#f4977c", "#f7ac84", "#fbc58d", "#fff69e", "#c4de9e", "#85c99e", "#7fcdc7", "#75d0f4", "#81a8d7", "#8594c8", "#8983bc", "#a187bd", "#bb8dbe", "#f29bc1"],
					["#ef6c53", "#f38d5b", "#f8ae63", "#fff371", "#acd277", "#43b77a", "#2ebbb3", "#00bff0", "#4a8dc8", "#5875b7", "#625da6", "#8561a7", "#a665a7", "#ee6fa9"],
					["#ea1d2c", "#ee652e", "#f4932f", "#fff126", "#8ec648", "#00a553", "#00a99c", "#00afed", "#0073ba", "#0056a4", "#323390", "#66308f", "#912a8e", "#e9088c"],
					["#9b0b16", "#9e4117", "#a16118", "#c6b920", "#5a852d", "#007238", "#00746a", "#0077a1", "#004c7f", "#003570", "#1d1762", "#441261", "#62095f", "#9c005d"],
					["#770001", "#792e03", "#7b4906", "#817a0b", "#41661e", "#005827", "#005951", "#003b5c", "#001d40", "#000e35", "#04002c", "#19002b", "#2c002a", "#580028"],
				] // prettier-ignore
			};
		}

		connectedCallback() {
			if (this.attached) return;
			super.connectedCallback();
			this.build();
		}

		build() {
			this.addDefaultMarkup();
			var node = this.node;
			var colors = node.attr("cq-colors");
			if (colors) {
				// Convert a csv list of colors to a two dimensional array
				colors = colors.split(",");
				var cols = Math.ceil(Math.sqrt(colors.length));
				this.params.colorMap = [];
				var col = 0;
				var row = [];
				for (var i = 0; i < colors.length; i++) {
					if (col >= cols) {
						col = 0;
						this.params.colorMap.push(row);
						row = [];
					}
					row.push(colors[i]);
					col++;
				}
				this.params.colorMap.push(row);
			}

			this.cqOverrides = node.find("cq-overrides");
			this.template = this.cqOverrides.find("template");
			this.initialize();
		}

		/**
		 * Displays the color picker in proximity to the node passed in
		 * @param {object} activator The object representing what caused picker to display
		 * @param {HTMLElement} [activator.node] The node near where to display the color picker
		 * @param {array} [activator.overrides] Array of overrides. For each of these, a button will be created that if pressed
		 * will pass that override back instead of the color
		 * @alias display
		 * @memberof WebComponents.cq-color-picker
		 */
		display(activator) {
			// Algorithm to place the color picker to the right of whichever node was just pressed
			var node = CIQ.UI.$(activator.node)[0];
			var positionOfNode = node.getBoundingClientRect();
			this.node.css({ top: "0px", left: "0px" });
			var positionOfColorPicker = this.parentNode.getBoundingClientRect();
			var oneSwatchDims = CIQ.elementDimensions(node, { border: true });
			var x =
				positionOfNode.left -
				positionOfColorPicker.left +
				oneSwatchDims.width +
				10;
			var y = positionOfNode.top - positionOfColorPicker.top + 15;

			this.cqOverrides.children(":not(template)").remove();
			var context =
				activator.context || this.context || CIQ.UI.getMyContext(this);

			var closure = function (self, override) {
				return function () {
					self.pickColor(override);
				};
			};

			var overrideHeight = 0;
			if (activator.overrides && this.template.length) {
				var n;
				for (var i = 0; i < activator.overrides.length; i++) {
					var override = activator.overrides[i];
					n = CIQ.UI.makeFromTemplate(this.template, true);
					if (context.stx) override = context.stx.translateIf(override);
					n.text(override);
					CIQ.UI.stxtap(n[0], closure(this, override));
				}
				overrideHeight = CIQ.elementDimensions(n[0]).height;
			}

			// ensure color picker doesn't go off right edge of screen
			var dims = CIQ.elementDimensions(this, { border: true });
			var docWidth = CIQ.guaranteedSize(document).width;
			var w =
				dims.width ||
				oneSwatchDims.width * this.colors.children()[0].children.length;
			if (x + w > docWidth) x = docWidth - w - 20; // 20 for a little whitespace and padding

			// or bottom of screen
			var docHeight = CIQ.guaranteedSize(document).height;
			var h =
				dims.height ||
				oneSwatchDims.height * this.colors.children().length + overrideHeight;
			if (y + h > docHeight) y = docHeight - h - 30; // 30 for a little whitespace and padding

			this.node.css({ left: x + "px", top: y + "px" });

			if (!this.classList.contains("stxMenuActive")) {
				this.open({ context: context }); // Manually activate the color picker
			} else {
				if (context.e) context.e.stopPropagation(); // Otherwise the color picker is closed when you swap back and forth between fill and line swatches on the toolbar
			}
		}

		initialize() {
			var self = this;
			this.colors = this.node.find("cq-colors");
			if (!this.colors.length) this.colors = this.node;
			this.colors.empty(); // allow re-initialize, with new colors for instance

			function closure(self, color) {
				return function () {
					self.pickColor(color);
				};
			}
			for (var a = 0; a < this.params.colorMap.length; a++) {
				var lineOfColors = this.params.colorMap[a];
				var ul = document.createElement("ul");
				this.colors[0].appendChild(ul);
				for (var b = 0; b < lineOfColors.length; b++) {
					var li = document.createElement("li");
					ul.appendChild(li);
					var span = document.createElement("span");
					li.appendChild(span);
					span.style.backgroundColor = lineOfColors[b];
					CIQ.UI.stxtap(span, closure(self, lineOfColors[b]));
				}
			}
		}

		/**
		 * @param color
		 * @alias pickColor
		 * @memberof WebComponents.cq-color-picker
		 */
		pickColor(color) {
			if (this.callback) this.callback(color);
			this.close();
		}

		resize() {
			// do nothing for resize, overrides Dialog default which centers
		}

		/**
		 * @param {object} colorMap Object that holds an array of various color arrays.
		 * @alias setColors
		 * @memberof WebComponents.cq-color-picker
		 */
		setColors(colorMap) {
			this.params.colorMap = colorMap;
			this.initialize();
		}
	}

	ColorPicker.markup = `
		<cq-colors></cq-colors>
		<cq-overrides>
			<template>
				<div class="ciq-btn"></div>
			</template>
		</cq-overrides>
	`;
	CIQ.UI.addComponentDefinition("cq-color-picker", ColorPicker);
}

};


let __js_webcomponents_palette_drawingPalette_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */









var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

const Palette = CIQ.UI._webcomponents.list["cq-palette"];
if (!Palette) {
	console.error(
		"drawingPalette component requires first activating palette component."
	);
} else if (!CIQ.Drawing) {
	console.error(
		"drawingPalette component requires first activating drawing feature."
	);
} else {
	/**
	 * Drawing palette web component used to draw and annotate on the chart. Displays a palette
	 * along the left side of the chart for control and management of drawing tools.
	 *
	 * Inherits from `<cq-palette>`. Palette components must be placed within a `<cq-palette-dock>` component.
	 *
	 * This works in conjuction with the [cq-drawing-settings]{@link WebComponents.cq-drawing-settings} component
	 * and replaces the [cq-toolbar]{@link WebComponents.cq-toolbar} component, providing additional functionality
	 * and an improved user experience.
	 *
	 * Drawing tools support keystroke combinations by setting a `cq-tool-shortcut` attribute in the tool
	 * `cq-item` element. Combinations take the form Alt+key (upper- or lowercase); for example, Alt+a or
	 * Alt+A &mdash; in either case, the key combination works whether the key is shifted or not. Users can also
	 * add the modifier Ctrl to the keystroke combination. For example, both Alt+R and Ctrl+Alt+R activate the
	 * Rectangle tool. The added Ctrl modifier helps provide a unique keystoke combination in the event the Alt+key
	 * combination is assigned to a function in the web browser or to an application on the user's system.
	 *
	 * @namespace WebComponents.cq-drawing-palette
	 * @example
		<cq-drawing-palette class="palette-drawing grid" docked="true" orientation="vertical" min-height="300" cq-drawing-edit="none">
			<div class="mini-widget-group">
					<cq-item class="ciq-mini-widget" cq-view="list" stxtap="changeView('list')"><span class="icon"></span><label>List View</label></cq-item>
					<cq-item class="ciq-mini-widget" cq-view="grid" stxtap="changeView('grid')"><span class="icon"></span><label>Grid View</label></cq-item>
					<cq-item class="ciq-mini-widget" cq-view="list" stxtap="detach()"><span class="icon"></span><label>Detach</label></cq-item>
					<cq-separator></cq-separator>
			</div>
			<div class="primary-tool-group">
				<cq-item class="ciq-tool active" cq-tool="notool" stxtap="tool()"><span class="icon pointer"></span><label>No Tool</label></cq-item>
				<cq-item class="ciq-tool" cq-tool="measure" stxtap="tool()"><span class="icon measure"></span><label>Measure</label></cq-item>
				<cq-undo class="ciq-tool"><span class="icon undo"></span><label>Undo</label></cq-undo>
				<cq-redo class="ciq-tool"><span class="icon redo"></span><label>Redo</label></cq-redo>
				<cq-menu class="ciq-select">
					<span cq-tool-group-selection>All</span>
					<cq-menu-dropdown class="ciq-tool-group-selection">
						<cq-item stxtap="setToolGroup('all')">All</cq-item>
						<cq-item stxtap="setToolGroup('text')">Text</cq-item>
						<cq-item stxtap="setToolGroup('statistics')">Statistics</cq-item>
						<cq-item stxtap="setToolGroup('technicals')">Technicals</cq-item>
						<cq-item stxtap="setToolGroup('fibonacci')">Fibonacci</cq-item>
						<cq-item stxtap="setToolGroup('marking')">Markings</cq-item>
						<cq-item stxtap="setToolGroup('line')">Lines</cq-item>
					</cq-menu-dropdown>
				</cq-menu>
			</div>
			<cq-separator></cq-separator>
			<div class="tool-group" tool-group-filter="all">
				<cq-scroll cq-no-resize>
					<cq-item class="ciq-tool" cq-tool="annotation" cq-tool-shortcut="t" cq-tool-group="text" stxtap="tool()"><span class="icon annotation"></span><label>Annotation</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="callout" cq-tool-group="text" stxtap="tool()"><span class="icon callout"></span><label>Callout</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="average" cq-tool-group="statistics" stxtap="tool()"><span class="icon average"></span><label>Average Line</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="channel" cq-tool-group="line" stxtap="tool()"><span class="icon channel"></span><label>Channel</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="continuous" cq-tool-group="line" stxtap="tool()"><span class="icon continuous"></span><label>Continuous</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="crossline" cq-tool-group="line" stxtap="tool()"><span class="icon crossline"></span><label>Crossline</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="freeform" cq-tool-group="line" stxtap="tool()"><span class="icon freeform"></span><label>Doodle</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="ellipse" cq-tool-shortcut="e" cq-tool-group="marking" stxtap="tool()"><span class="icon ellipse"></span><label>Ellipse</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="retracement" cq-tool-group="fibonacci" stxtap="tool()"><span class="icon retracement"></span><label>Fib Retracement</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="fibprojection" cq-tool-group="fibonacci" stxtap="tool()"><span class="icon fibprojection"></span><label>Fib Projection</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="fibarc" cq-tool-group="fibonacci" stxtap="tool()"><span class="icon fibarc"></span><label>Fib Arc</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="fibfan" cq-tool-group="fibonacci" stxtap="tool()"><span class="icon fibfan"></span><label>Fib Fan</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="fibtimezone" cq-tool-group="fibonacci" stxtap="tool()"><span class="icon fibtimezone"></span><label>Fib Time Zone</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="gannfan" cq-tool-group="technicals" stxtap="tool()"><span class="icon gannfan"></span><label>Gann Fan</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="gartley" cq-tool-group="technicals" stxtap="tool()"><span class="icon gartley"></span><label>Gartley</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="horizontal" cq-tool-shortcut="h" cq-tool-group="line" stxtap="tool()"><span class="icon horizontal"></span><label>Horizontal</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="line" cq-tool-shortcut="l" cq-tool-group="line" stxtap="tool()"><span class="icon line"></span><label>Line</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="pitchfork" cq-tool-group="technicals" stxtap="tool()"><span class="icon pitchfork"></span><label>Pitchfork</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="quadrant" cq-tool-group="statistics" stxtap="tool()"><span class="icon quadrant"></span><label>Quadrant Lines</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="ray" cq-tool-group="line" stxtap="tool()"><span class="icon ray"></span><label>Ray</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="rectangle" cq-tool-shortcut="r" cq-tool-group="marking" stxtap="tool()"><span class="icon rectangle"></span><label>Rectangle</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="regression" cq-tool-group="statistics" stxtap="tool()"><span class="icon regression"></span><label>Regression Line</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="segment" cq-tool-group="line" stxtap="tool()"><span class="icon segment"></span><label>Segment</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="arrow" cq-tool-shortcut="a" cq-tool-group="marking" stxtap="tool()"><span class="icon arrow"></span><label>Arrow</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="check" cq-tool-group="marking" stxtap="tool()"><span class="icon check"></span><label>Check</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="xcross" cq-tool-group="marking" stxtap="tool()"><span class="icon xcross"></span><label>Cross</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="focusarrow" cq-tool-group="marking" stxtap="tool()"><span class="icon focusarrow"></span><label>Focus</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="heart" cq-tool-group="marking" stxtap="tool()"><span class="icon heart"></span><label>Heart</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="star" cq-tool-group="marking" stxtap="tool()"><span class="icon star"></span><label>Star</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="speedarc" cq-tool-group="technicals" stxtap="tool()"><span class="icon speedarc"></span><label>Speed Resistance Arc</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="speedline" cq-tool-group="technicals" stxtap="tool()"><span class="icon speedline"></span><label>Speed Resistance Line</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="timecycle" cq-tool-group="technicals" stxtap="tool()"><span class="icon timecycle"></span><label>Time Cycle</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="tirone" cq-tool-group="statistics" stxtap="tool()"><span class="icon tirone"></span><label>Tirone Levels</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="trendline" cq-tool-group="text" stxtap="tool()"><span class="icon trendline"></span><label>Trend Line</label></cq-item>
					<cq-item class="ciq-tool" cq-tool="vertical" cq-tool-shortcut="v" cq-tool-group="line" stxtap="tool()"><span class="icon vertical"></span><label>Vertical</label></cq-item>
				</cq-scroll>
				<cq-separator></cq-separator>
				<cq-item class="ciq-tool" stxtap="clearDrawings()"><span class="icon clear"></span><label>Clear All Drawings</label></cq-item>
				<cq-item class="ciq-tool" stxtap="restoreDefaultConfig(true)"><span class="icon restore"></span><label>Restore Default Parameters</label></cq-item>
			</div>
		</cq-drawing-palette>
	 * @since
	 * - 7.1.0
	 * - 7.2.0 The drawing settings section has been moved into its own component, [cq-drawing-settings]{@link WebComponents.cq-drawing-settings}.
	 * - 7.4.0 Drawing tools now support keystroke combinations by setting a `cq-tool-shortcut` attribute in the tool button.
	 */
	class DrawingPalette extends Palette.classDefinition {
		constructor() {
			super();
			this.mode = "";
			this.callbacks = [];
			// A list of tool names to mark as favorite.
			this.toolSettings = {
				favList: [],
				toolGroup: ""
			};
			// Stores a list of keyboard shortcuts.
			this.toolShortcuts = {};
		}

		setupKeyboardActivation(context) {
			if (typeof this.getAttribute("cq-keystroke-claim") != "undefined") {
				// Define keystrokes
				let toolsWithShortcuts = this.context.topNode.querySelectorAll(
					"*[cq-tool][cq-tool-shortcut]"
				);
				for (let idx = 0; idx < toolsWithShortcuts.length; idx++) {
					let letter = toolsWithShortcuts[idx].getAttribute("cq-tool-shortcut");
					// Test for a single alpha character
					if (/^[A-Za-z]{1}$/g.test(letter)) {
						// Store ref to node and toolname for tool selection
						this.toolShortcuts[letter.toUpperCase()] = {
							toolName: toolsWithShortcuts[idx].getAttribute("cq-tool"),
							node: toolsWithShortcuts[idx]
						};
						// Add keyboard shortcut to button tool tip
						let buttonLabel = toolsWithShortcuts[idx].querySelector("label");
						let shortcutLabel = document.createElement("span");
						shortcutLabel.classList.add("shortcut");
						shortcutLabel.innerHTML = " (Alt+" + letter.toUpperCase() + ")";

						buttonLabel.appendChild(shortcutLabel);
					} else {
						console.warn(
							"cq-tool-shortcut attribute must be a single letter: " +
								letter +
								" ignored."
						);
					}
				}
				// add keyboard claim for entire body
				this.addClaim(this);
			}
		}

		// Handle keystroke event to activate drawing tools
		keyStroke(hub, key, e, keystroke) {
			let toolName = "";
			if (e.altKey && !e.ctrlKey && !e.shiftKey) {
				let selectedKey = String.fromCharCode(e.which).toUpperCase();
				let toolSelection = this.toolShortcuts[selectedKey];

				if (toolSelection) {
					// Activate the drawing palette if it isn't already
					// this.context.stx.layout.drawing=true;
					const drawingChannel = this.channels
						? this.channels.drawing
						: "channel.drawing";
					this.channelWrite(drawingChannel, true);

					// Activate the tool. Pass a reference to the palette button so its activated state is changed.
					this.tool({ node: toolSelection.node }, toolSelection.toolName);
				}
			} else if (e.key === "Escape") {
				let notoolTool = this.context.topNode.querySelector(
					'*[cq-tool="notool"]'
				);
				if (notoolTool) this.noTool({ node: notoolTool });
			}
		}

		handleMessage(id, message) {
			switch (id) {
				case "changeToolSettings":
					this.activateTool(message.activator, message.toolName);
					break;
				case "toggleDrawingPalette":
					this.togglePalette();
					break;
				case "hideDrawingPalette":
					this.hidePalette();
					break;
				case "dockWillResize":
					this.hidePalette();
					break;
				case "dockDidResize":
					this.resetScroller();
					break;
				case "context":
					if (message === "stop") this.toolContextMenu.style.display = "none";
			}
		}

		// Retrieve list of tools from local storage.
		loadToolSettings() {
			if (this.store) {
				let self = this;
				this.store.get(
					"CIQ.DrawingToolSettings",
					function (error, lsDrawingTools) {
						if (!error && lsDrawingTools && lsDrawingTools.favList) {
							self.toolSettings = Object.assign(
								self.toolSettings,
								lsDrawingTools
							);
						}
					}
				);
			}
		}
		// Save tool settings to local storage
		storeToolSettings() {
			if (this.store)
				this.store.set(
					"CIQ.DrawingToolSettings",
					JSON.stringify(this.toolSettings)
				);
		}

		setContext(context) {
			const { config, stx } = context;

			if (config) {
				const { channels = {}, nameValueStore } = config;
				this.store =
					(nameValueStore && new nameValueStore()) ||
					(CIQ.NameValueStore && new CIQ.NameValueStore());
				this.addDefaultMarkup(this, this.getMarkup(config));
				this.channels = { drawing: channels.drawing || "channel.drawing" };
			}
			this.init();
			this.loadToolSettings();
			this.params = {
				toolGroupSelection: this.node.find("*[cq-tool-group-selection]")
			};
			this.setFavorites();
			this.setMode("grid");
			this.setEvenOdd();

			// Inject the right click menu
			this.toolContextMenu = this.createContextMenu();

			this.addEventListener(
				"contextmenu",
				function (event) {
					event.preventDefault();
					if (event.target.getAttribute("cq-tool-group") !== null) {
						// Only concerned with elements that have a cq-tool-group property
						let targetRect = event.target.getBoundingClientRect();
						// Need to position the context menu relative to the parent because the palette can change position
						let parentRect = this.getBoundingClientRect();
						this.showToolContextMenu(
							event.target.getAttribute("cq-tool"),
							targetRect.top + targetRect.height - parentRect.top,
							targetRect.left - parentRect.left
						);
					}
				}.bind(this)
			);

			this.setupKeyboardActivation();
			this.pairUndoRedo();

			// Set the tool group if it has been saved in local storage
			if (this.toolSettings.toolGroup) {
				this.setToolGroup(
					{
						node: this.querySelector(
							'cq-item[cq-tool-group="' + this.toolSettings.toolGroup + '"]'
						)
					},
					this.toolSettings.toolGroup
				);
			}

			if (this.channels) {
				this.channelSubscribe(
					this.channels.drawing || "channel.drawing",
					(value) => {
						if (value) {
							this.resetScroller();
							if (!stx.currentVectorParameters.vectorType) {
								// setting value to "" signals that crosshairs should be disabled
								stx.changeVectorType(this.priorVectorType || "");
							}
						} else {
							// remember what the previous drawing tool was and to re-enable it when the toolbar is reopened
							this.priorVectorType = stx.currentVectorParameters.vectorType;
							// setting value to null signals that normal crosshair behavior should return
							stx.changeVectorType(null);
						}
					}
				);
			}
		}

		pairUndoRedo() {
			const redo = this.qs("cq-redo", this);
			const undo = this.qs("cq-undo", this);
			redo.pairUp(undo);
		}

		changeView(activator, modeName) {
			this.setMode(modeName);
			for (
				var i = 0;
				i < this.callbacks.length;
				i++ // let any callbacks know that the palette mode has changed
			)
				this.callbacks[i].call(this, this.mode);
		}

		createContextMenu() {
			// Add/Remove Favorites menu item
			let addToFavorites = document.createElement("div");
			addToFavorites.className = "menu-item";
			addToFavorites.innerHTML = "Add/Remove Favorite";
			addToFavorites.addEventListener(
				"mousedown",
				function (event) {
					event.stopPropagation();
					if (event.which === 1) {
						// Right click fires this event too so check for a left mouse button event
						this.toggleFavorite(
							event.currentTarget.parentElement.getAttribute("context-tool")
						);
						this.paletteDock.stopContext(this);
					}
				}.bind(this)
			);

			let contextMenu = document.createElement("div");
			contextMenu.appendChild(addToFavorites);
			contextMenu.className = "tool-context-menu";
			this.node.append(contextMenu);
			return contextMenu;
		}

		registerCallback(fc) {
			this.callbacks.push(fc);
		}

		// Resets the tool scrollbar
		// Use if the container size or contents have changes
		resetScroller() {
			const scroller = this.querySelector(".tool-group cq-scroll");
			if (!scroller) {
				return false;
			}
			this.setEvenOdd();
			scroller.refresh();
		}

		setActiveButton(activeNode) {
			this.node.find(".ciq-tool.active").removeClass("active");
			var activeToolLabel = "";
			// Don't show a label in settings for the No Tool tool
			if (activeNode.getAttribute("stxtap") !== "noTool()") {
				var label = activeNode.querySelector("label");
				if (label) activeToolLabel = label.innerHTML + ":";
			}
			activeNode.classList.add("active");
			// Don't want to automatically show the palette when using the mobile menu
			if (
				!CIQ.trulyVisible(document.querySelector(".ciq-mobile-palette-toggle"))
			)
				this.togglePalette();
		}

		setMode(mode) {
			// Default to grid mode unless list is specified
			mode = mode === "list" ? mode : "grid";
			this.mode = mode;
			// Multiple remove calls here because IE supports only one class at a time
			this.classList.remove("list");
			this.classList.remove("grid");
			this.classList.add(this.mode);

			this.resetScroller();
			this.paletteDock.handleResize({ resizeChart: true });
		}

		setEvenOdd(groupName) {
			// Give an 'odd' class to odd number buttons in filtered list.
			var nodes = this.querySelectorAll(".tool-group cq-scroll cq-item");
			var odd = false;
			for (var n = 0; n < nodes.length; n++) {
				if (!CIQ.trulyVisible(nodes[n])) continue;
				nodes[n].classList[odd ? "add" : "remove"]("odd");
				odd = !odd;
			}
		}

		// Add the favorite badge to relevant tools
		// Add a favorite toggle star to each tool for use in list view and mobile layout
		setFavorites() {
			var toolButtons = this.querySelectorAll(".tool-group [cq-tool]");
			for (
				var toolButtonIdx = 0;
				toolButtonIdx < toolButtons.length;
				toolButtonIdx++
			) {
				var toolButton = toolButtons[toolButtonIdx];
				if (toolButton.querySelector(".fav-marker") === null) {
					// All buttons get the div.fav-marker element to click on in list view.
					let favMarker = document.createElement("div");
					favMarker.className = "fav-marker";
					favMarker.addEventListener(
						"click",
						this.handleFavoriteClick.bind(this)
					);
					favMarker.addEventListener(
						"touchstart",
						this.handleFavoriteClick.bind(this),
						{ capture: true, passive: false }
					);
					toolButton.appendChild(favMarker);
				}
				if (toolButton.getAttribute("cq-tool-group").indexOf("favorite") >= 0) {
					// Remove favorite group value if it's there.
					toolButton.setAttribute(
						"cq-tool-group",
						toolButton.getAttribute("cq-tool-group").replace("favorite", "")
					);
				}
				if (
					this.toolSettings.favList.indexOf(
						toolButton.getAttribute("cq-tool")
					) >= 0
				) {
					// Apply the favorite tool group to tools in the favorites list.
					toolButton.setAttribute(
						"cq-tool-group",
						toolButton.getAttribute("cq-tool-group") + " favorite"
					);
				}
			}
		}

		handleFavoriteClick(event) {
			event.stopPropagation();
			event.preventDefault();
			this.toggleFavorite(event.target.parentElement.getAttribute("cq-tool"));
			// The mobile palette is toggled after the tool selection so hide it now so the toggle will show it again
			this.hidePalette();
		}

		// Add the tool to the list of favorites
		addFavorite(toolName) {
			if (this.toolSettings.favList.indexOf(toolName) < 0) {
				this.toolSettings.favList.push(toolName);
				this.storeToolSettings();
				this.setFavorites();
			}
		}

		showToolContextMenu(toolName, top, left) {
			this.toolContextMenu.style.display = "block";
			this.toolContextMenu.style.top = top + "px";
			this.toolContextMenu.style.left = left + "px";
			this.toolContextMenu.setAttribute("context-tool", toolName);
			this.paletteDock.startContext(this);
		}

		toggleFavorite(toolName) {
			let toggleIdx = this.toolSettings.favList.indexOf(toolName);
			if (toggleIdx >= 0) {
				this.toolSettings.favList.splice(toggleIdx, 1);
			} else {
				this.toolSettings.favList.push(toolName);
			}
			this.storeToolSettings();
			this.setFavorites();
		}

		setToolGroup(activator, groupName) {
			// Filter tools by their group.
			this.toolSettings.toolGroup = groupName;
			this.querySelector(".tool-group").setAttribute(
				"tool-group-filter",
				this.toolSettings.toolGroup
			);
			this.querySelector(".tool-group cq-scroll").top();
			this.setEvenOdd(groupName);
			for (
				var i = 0;
				i < this.callbacks.length;
				i++ // let any callbacks know that the palette mode has changed
			)
				this.callbacks[i].call(this, this.mode);
			// The mobile palette will be hidden if resize is called in the callbacks. Show it again afterward
			this.showPalette();
			this.params.toolGroupSelection.html(activator.node.innerHTML);
			this.storeToolSettings();
		}

		/*
		 * Used in break-sm context to show/hide the palette for mobile layout
		 */
		togglePalette() {
			this.classList.toggle("palette-hide");
		}

		/*
		 * Used in break-sm context to hide the palette for mobile layout
		 */
		hidePalette() {
			this.classList.add("palette-hide");
		}

		/*
		 * Used in break-sm context to show the palette for mobile layout
		 */
		showPalette() {
			this.classList.remove("palette-hide");
		}

		activateTool(activator, toolName) {
			let buttonRef = null;
			if (!activator.node && toolName) {
				// Find the tool button by its cq-tool attribute.
				// Necessary for cases then the button is not clicked, such as the drawing context menu "Edit Settings"
				buttonRef = this.querySelector("[cq-tool=" + toolName + "]");
			} else {
				buttonRef = activator.node;
			}
			this.setActiveButton(buttonRef);
			var stx = this.context.stx;
			stx.clearMeasure();
			stx.changeVectorType(toolName);
		}

		noTool(activator, toolName) {
			this.tool(activator, "notool");
		}

		tool(activator, toolName) {
			if (!toolName) toolName = activator.node.getAttribute("cq-tool");
			if (!toolName) return;
			var toolLabel = activator.node.querySelector("label").innerHTML;
			this.activateTool(activator, toolName);
			if (this.sendMessage) {
				this.sendMessage("changeTool", {
					activator: activator,
					toolName: toolName,
					toolLabel: toolLabel
				});
			}
		}

		clearDrawings() {
			if (this.sendMessage) {
				this.sendMessage("clearDrawings");
			}
		}

		restoreDefaultConfig(activator, all) {
			if (this.sendMessage) {
				this.sendMessage("restoreDefaultConfig", {
					activator: activator,
					all: all
				});
			}
		}

		getMarkup(config) {
			const tools = config.getMenu("drawingTools", true).join("");
			const toolGrouping = config.drawingToolGrouping
				.map((tool) => {
					return `<cq-item
					stxtap="setToolGroup('${tool.toLowerCase()}')"
					cq-tool-group="${tool.toLowerCase()}">${tool}
				</cq-item>`;
				})
				.join("");

			return this.constructor.markup
				.replace("{{tools}}", tools)
				.replace("{{toolGrouping}}", toolGrouping);
		}
	}

	DrawingPalette.markup = `
	<div class="palette-container">
		<div class="drag-strip"></div>
			<div class="mini-widget-group">
					<cq-item class="ciq-mini-widget" cq-view="list" stxtap="changeView('list')"><span class="icon"></span><label>List View</label></cq-item>
					<cq-item class="ciq-mini-widget" cq-view="grid" stxtap="changeView('grid')"><span class="icon"></span><label>Grid View</label></cq-item>
					<cq-item class="ciq-mini-widget" cq-view="detach" stxtap="detach()"><span class="icon"></span><label>Detach</label></cq-item>
					<cq-item class="ciq-mini-widget" cq-view="attach" stxtap="dock()"><span class="icon"></span><label>Attach</label></cq-item>
			</div>
			<cq-separator></cq-separator>
			<div class="primary-tool-group">
				<cq-item class="ciq-tool active" cq-tool="notool" stxtap="tool()"><span class="icon pointer"></span><label>No Tool</label></cq-item>
				<cq-item class="ciq-tool" cq-tool="measure" stxtap="tool()"><span class="icon measure"></span><label>Measure</label></cq-item>
				<cq-undo class="ciq-tool"><span class="icon undo"></span><label>Undo</label></cq-undo>
				<cq-redo class="ciq-tool"><span class="icon redo"></span><label>Redo</label></cq-redo>
				<cq-menu class="ciq-select">
					<span cq-tool-group-selection>All</span>
					<cq-menu-dropdown class="ciq-tool-group-selection">
						{{toolGrouping}}
					</cq-menu-dropdown>
				</cq-menu>
			</div>
			<cq-separator></cq-separator>
			<div class="tool-group" tool-group-filter="all">
				<cq-scroll cq-no-resize>
					{{tools}}
				</cq-scroll>
				<cq-separator></cq-separator>
				<div class="mini-widget-group mini-widget-foot">
					<cq-toggle class="ciq-mini-widget ciq-magnet" cq-member="preferences.magnet" cq-toggles="true,75,false" cq-toggle-classes="active strong,active,"><span class="icon magnet"></span><label>Magnet</label></cq-toggle>
					<cq-item class="ciq-mini-widget" stxtap="clearDrawings()"><span class="icon clear"></span><label>Clear All Drawings</label></cq-item>
					<cq-item class="ciq-mini-widget" stxtap="restoreDefaultConfig(true)"><span class="icon restore"></span><label>Restore Default Parameters</label></cq-item>
				</div>
			</div>
		<div class="resize-strip"></div>
	</div>
	`;
	CIQ.UI.addComponentDefinition("cq-drawing-palette", DrawingPalette);
}

};


let __js_webcomponents_palette_drawingSettings_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */








var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

const Palette = CIQ.UI._webcomponents.list["cq-palette"];
if (!Palette) {
	console.error(
		"drawingSettings component requires first activating palette component."
	);
} else if (!CIQ.Drawing) {
	console.error(
		"drawingSettings component requires first activating drawing feature."
	);
} else {
	/**
	 * Drawing Settings palette web component used to draw and annotate on the chart. Displays a palette
	 * along the top of the chart for managing tool settings.
	 *
	 * Inherits from `<cq-palette>`. Palette components must be placed within a `<cq-palette-dock>` component.
	 *
	 * This works in conjuction with the [cq-drawing-palette]{@link WebComponents.cq-drawing-palette} component
	 * and replaces the [cq-toolbar]{@link WebComponents.cq-toolbar} component, providing additional functionality
	 * and an improved user experience.
	 *
	 * Emits a `change` event.
	 *
	 * @namespace WebComponents.cq-drawing-settings
	 * @example
		<cq-drawing-settings class="palette-settings" docked="true" orientation="horizontal" min-height="40">
			<div class="drawing-settings-wrapper">
				<cq-clickable class="ciq-select ciq-mobile-palette-toggle" stxtap="togglePalette()"><span>Select Tool</span></cq-clickable>
				<div class="ciq-active-tool-label ciq-heading"></div>
				<cq-toolbar-settings>
					<cq-fill-color cq-section class="ciq-color" stxbind="getFillColor()" stxtap="pickFillColor()">
						<span></span>
					</cq-fill-color>
					<div>
						<cq-line-color cq-section cq-overrides="auto" class="ciq-color" stxbind="getLineColor()" stxtap="pickLineColor()"><span></span></cq-line-color>
						<cq-line-style cq-section>
							<cq-menu class="ciq-select">
								<span cq-line-style class="ciq-line ciq-selected"></span>
								<cq-menu-dropdown class="ciq-line-style-menu">
									<cq-item stxtap="setLine(1,'solid')"><span class="ciq-line-style-option ciq-solid-1"></span></cq-item>
									<cq-item stxtap="setLine(3,'solid')"><span class="ciq-line-style-option ciq-solid-3"></span></cq-item>
									<cq-item stxtap="setLine(5,'solid')"><span class="ciq-line-style-option ciq-solid-5"></span></cq-item>
									<cq-item stxtap="setLine(1,'dotted')"><span class="ciq-line-style-option ciq-dotted-1"></span></cq-item>
									<cq-item stxtap="setLine(3,'dotted')"><span class="ciq-line-style-option ciq-dotted-3"></span></cq-item>
									<cq-item stxtap="setLine(5,'dotted')"><span class="ciq-line-style-option ciq-dotted-5"></span></cq-item>
									<cq-item stxtap="setLine(1,'dashed')"><span class="ciq-line-style-option ciq-dashed-1"></span></cq-item>
									<cq-item stxtap="setLine(3,'dashed')"><span class="ciq-line-style-option ciq-dashed-3"></span></cq-item>
									<cq-item stxtap="setLine(5,'dashed')"><span class="ciq-line-style-option ciq-dashed-5"></span></cq-item>
									<cq-item stxtap="setLine(0,'none')" class="ciq-none">None</cq-item>
								</cq-menu-dropdown>
							</cq-menu>
						</cq-line-style>
					</div>

					<cq-cvp-controller cq-section cq-cvp-header="1"></cq-cvp-controller>
					<cq-cvp-controller cq-section cq-cvp-header="2"></cq-cvp-controller>
					<cq-cvp-controller cq-section cq-cvp-header="3"></cq-cvp-controller>

					<template cq-cvp-controller>
						<div cq-section>
							<div class="ciq-heading">Dev 1</div>
							<span stxtap="toggleActive()" class="ciq-checkbox">
								<span></span>
							</span>
						</div>
						<cq-line-color cq-section cq-overrides="auto" class="ciq-color" stxbind="getColor()" stxtap="pickColor()">
							<span></span>
						</cq-line-color>
						<cq-line-style cq-section>
							<cq-menu class="ciq-select">
								<span cq-cvp-line-style class="ciq-line ciq-selected"></span>
								<cq-menu-dropdown class="ciq-line-style-menu">
									<cq-item stxtap="setStyle(1, 'solid')"><span class="ciq-line-style-option ciq-solid-1"></span></cq-item>
									<cq-item stxtap="setStyle(3, 'solid')"><span class="ciq-line-style-option ciq-solid-3"></span></cq-item>
									<cq-item stxtap="setStyle(5, 'solid')"><span class="ciq-line-style-option ciq-solid-5"></span></cq-item>
									<cq-item stxtap="setStyle(1, 'dotted')"><span class="ciq-line-style-option ciq-dotted-1"></span></cq-item>
									<cq-item stxtap="setStyle(3, 'dotted')"><span class="ciq-line-style-option ciq-dotted-3"></span></cq-item>
									<cq-item stxtap="setStyle(5, 'dotted')"><span class="ciq-line-style-option ciq-dotted-5"></span></cq-item>
									<cq-item stxtap="setStyle(1, 'dashed')"><span class="ciq-line-style-option ciq-dashed-1"></span></cq-item>
									<cq-item stxtap="setStyle(3, 'dashed')"><span class="ciq-line-style-option ciq-dashed-3"></span></cq-item>
									<cq-item stxtap="setStyle(5, 'dashed')"><span class="ciq-line-style-option ciq-dashed-5"></span></cq-item>
								</cq-menu-dropdown>
							</cq-menu>
						</cq-line-style>
					</template>

					<cq-axis-label cq-section>
						<div class="ciq-heading">Axis Label:</div>
						<span stxtap="toggleAxisLabel()" class="ciq-checkbox ciq-active"><span></span></span>
					</cq-axis-label>
					<cq-annotation cq-section>
						<cq-annotation-italic stxtap="toggleFontStyle('italic')" class="ciq-btn" style="font-style:italic;">I</cq-annotation-italic>
						<cq-annotation-bold stxtap="toggleFontStyle('bold')" class="ciq-btn" style="font-weight:bold;">B</cq-annotation-bold>
						<cq-menu class="ciq-select">
							<span cq-font-size>12px</span>
							<cq-menu-dropdown class="ciq-font-size">
								<cq-item stxtap="setFontSize('8px')">8</cq-item>
								<cq-item stxtap="setFontSize('10px')">10</cq-item>
								<cq-item stxtap="setFontSize('12px')">12</cq-item>
								<cq-item stxtap="setFontSize('13px')">13</cq-item>
								<cq-item stxtap="setFontSize('14px')">14</cq-item>
								<cq-item stxtap="setFontSize('16px')">16</cq-item>
								<cq-item stxtap="setFontSize('20px')">20</cq-item>
								<cq-item stxtap="setFontSize('28px')">28</cq-item>
								<cq-item stxtap="setFontSize('36px')">36</cq-item>
								<cq-item stxtap="setFontSize('48px')">48</cq-item>
								<cq-item stxtap="setFontSize('64px')">64</cq-item>
							</cq-menu-dropdown>
						</cq-menu>
						<cq-menu class="ciq-select">
							<span cq-font-family>Default</span>
							<cq-menu-dropdown class="ciq-font-family">
								<cq-item stxtap="setFontFamily('Default')">Default</cq-item>
								<cq-item stxtap="setFontFamily('Helvetica')">Helvetica</cq-item>
								<cq-item stxtap="setFontFamily('Courier')">Courier</cq-item>
								<cq-item stxtap="setFontFamily('Garamond')">Garamond</cq-item>
								<cq-item stxtap="setFontFamily('Palatino')">Palatino</cq-item>
								<cq-item stxtap="setFontFamily('Times New Roman')">Times New Roman</cq-item>
							</cq-menu-dropdown>
						</cq-menu>
					</cq-annotation>
					<cq-clickable cq-fib-settings cq-selector="cq-fib-settings-dialog" cq-method="open" cq-section><span class="ciq-btn">Settings</span></cq-clickable>
					<div class="ciq-drawing-edit-only" cq-section>
						<div cq-toolbar-action="done_edit" stxtap="DrawingEdit.endEdit('close')" cq-section><cq-tooltip>Done Editing</cq-tooltip></div>
					</div>
					<div class="ciq-drawing-edit-hidden" cq-section>
						<div cq-toolbar-action="save" stxtap="saveConfig()" cq-section><div cq-toolbar-dirty></div><cq-tooltip>Save Config</cq-tooltip></div>
						<div cq-toolbar-action="restore" stxtap="restoreDefaultConfig()" cq-section><cq-tooltip>Restore Config</cq-tooltip></div>
					</div>
				</cq-toolbar-settings>
				<cq-measure><span class="mMeasure"></span></cq-measure>
			</div>
		</cq-drawing-settings>
	 * @since 7.2.0
	 */
	class DrawingSettings extends Palette.classDefinition {
		connectedCallback() {
			if (this.attached) return;
			super.connectedCallback();

			CIQ.UI.stxtap(this, function (e) {
				e.stopPropagation();
			});
		}

		setContext(context) {
			this.addDefaultMarkup();
			this.init();
			this.params = {
				lineSelection: this.node.find("*[cq-line-style]"),
				fontSizeSelection: this.node.find("*[cq-font-size]"),
				fontFamilySelection: this.node.find("*[cq-font-family]"),
				fontStyleToggle: this.node.find("cq-annotation-italic"),
				fontWeightToggle: this.node.find("cq-annotation-bold"),
				axisLabelToggle: this.node.find("cq-axis-label .ciq-checkbox"),
				fillColor: this.node.find("cq-fill-color").not("cq-cvp-controller"),
				lineColor: this.node.find("cq-line-color").not("cq-cvp-controller"),
				cvpControllers: this.node.find("cq-cvp-controller"),
				waveParameters: this.node.find("cq-wave-parameters")
			};
			this.params.cvpControllers.prop("toolbar", this);

			// Add a texture to the drag strip
			//this.querySelector('.drag-strip').style.backgroundImage = "url('css/img/palette-drag-strip.svg')";
			this.sync();
			this.dirty(false);
			if (context.stx.setDrawingContainer)
				context.stx.setDrawingContainer(this);
			var self = this;
			context.stx.addEventListener("theme", function (obj) {
				var isDirty = self.node
					.find("*[cq-toolbar-dirty]")
					.hasClass("ciq-active");
				self.sync();
				if (!isDirty) self.dirty(false);
			});
		}

		// Overridden from palette class
		handleMessage(id, message) {
			switch (id) {
				case "changeTool":
					// The Order is important as tool setting initiates chart repositioning
					// and should be last to make sure that updated height is available
					// A safer approach would be define static label size that may not be
					// as desirable from UI layout perspective
					this.setActiveToolLabel(message.toolLabel);
					this.toolSettings(message.activator, message.toolName);
					break;
				case "clearDrawings":
					this.clearDrawings();
					break;
				case "restoreDefaultConfig":
					this.restoreDefaultConfig(message.activator, message.all);
			}
		}

		clearDrawings() {
			this.context.stx.clearDrawings(null, false);
		}

		crosshairs(activator) {
			var stx = this.context.stx;
			stx.changeVectorType(null);
			stx.layout.crosshair = true;
			stx.doDisplayCrosshairs();
			stx.findHighlights(false, true);
			stx.changeOccurred("layout");
			stx.draw();
			stx.updateChartAccessories();
			this.node.find("*[cq-section]").removeClass("ciq-active");
			this.emit();
		}

		tool(activator, toolName) {
			this.toolSettings(activator, toolName);
			this.setActiveToolLabel(toolName);
			this.sendMessage("changeToolSettings", {
				activator: activator,
				toolName: toolName
			});
		}

		toolSettings(activator, toolName) {
			var stx = this.context.stx;
			this.node.find("*[cq-section]").removeClass("ciq-active");
			var removeDirty = !this.node
				.find("*[cq-toolbar-dirty]")
				.hasClass("ciq-active");
			var drawingParameters = CIQ.Drawing.getDrawingParameters(stx, toolName);
			if (drawingParameters) {
				this.node.find("*[cq-toolbar-action='save']").addClass("ciq-active");
				var drawingPrefs = stx.preferences.drawings;
				if (drawingPrefs && drawingPrefs[toolName]) {
					this.node
						.find("*[cq-toolbar-action='restore']")
						.addClass("ciq-active");
					removeDirty = true;
				}
				// fibtimezone has no values to display in the settings dialog
				if (toolName === "fibtimezone") {
					delete drawingParameters.parameters;
				}

				var none = this.params.lineSelection.parent().find(".ciq-none");
				none.hide();
				var elements = this.defaultElements(drawingParameters);
				for (var i = 0; i < elements.length; i++) {
					this.node.find(elements[i]).addClass("ciq-active");
					if (elements[i] == "cq-fill-color") none.show();
				}
				elements = CIQ.Drawing[toolName].prototype.$controls;
				for (i = 0; elements && i < elements.length; i++) {
					this.node.find(elements[i]).addClass("ciq-active");
				}
			}
			if (toolName === "notool") {
				stx.changeVectorType("");
				if (stx.preferences.magnet) {
					this.toggleMagnet(this);
				}
				this.hide = "true";
			} else {
				this.hide = "false";
			}
			// Resizing the dock because the setting palette is hidden/shown based on the 'no tool' selection
			this.paletteDock.handleResize();
			this.sync();
			if (removeDirty) this.dirty(false);
		}

		defaultElements(drawingParameters) {
			var arr = [];
			for (var param in drawingParameters) {
				if (param == "color") arr.push("cq-line-color");
				else if (param == "fillColor") arr.push("cq-fill-color");
				else if (param == "pattern" || param == "lineWidth")
					arr.push("cq-line-style");
				else if (param == "axisLabel") arr.push("cq-axis-label");
				else if (param == "font") arr.push("cq-annotation");
				else if (param == "parameters") arr.push("cq-clickable");
			}

			return arr;
		}

		dirty(on) {
			this.node
				.find("*[cq-toolbar-dirty]")
				[on === false ? "removeClass" : "addClass"]("ciq-active");
		}

		emit() {
			var event = new Event("change", {
				bubbles: true,
				cancelable: true
			});
			this.dirty();
			this.dispatchEvent(event);
		}

		getFillColor(activator) {
			var node = CIQ.UI.$(activator.node);
			var color = this.context.stx.currentVectorParameters.fillColor;
			if (color == "transparent" || color == "auto") color = "";
			node.css({ background: color });
			var bgColor = CIQ.getBackgroundColor(this.parentNode);
			if (color && Math.abs(CIQ.hsl(bgColor)[2] - CIQ.hsl(color)[2]) < 0.2) {
				var border = CIQ.chooseForegroundColor(bgColor);
				node.css({ border: "solid " + border + " 1px" });
			} else {
				node.css({ border: "" });
			}
		}

		getLineColor(activator) {
			var node = CIQ.UI.$(activator.node);
			var color = this.context.stx.currentVectorParameters.currentColor;
			if (color == "transparent" || color == "auto") color = "";
			node.css({ background: color });
			var bgColor = CIQ.getBackgroundColor(this.parentNode);
			if (!color || Math.abs(CIQ.hsl(bgColor)[2] - CIQ.hsl(color)[2]) < 0.2) {
				var border = CIQ.chooseForegroundColor(bgColor);
				node.css({ border: "solid " + border + " 1px" });
				if (!color)
					node.css({
						background:
							"linear-gradient(to bottom right, " +
							border +
							", " +
							border +
							" 49%, " +
							bgColor +
							" 50%, " +
							bgColor +
							")"
					});
			} else {
				node.css({ border: "" });
			}
		}

		pickFillColor(activator) {
			var node = CIQ.UI.$(activator.node);
			var colorPicker = document.querySelector("cq-color-picker");
			if (!colorPicker) {
				console.log(
					"DrawingToolbar.prototype.pickFillColor: no ColorPicker available"
				);
				return;
			}
			var self = this;
			colorPicker.callback = function (color) {
				self.context.stx.currentVectorParameters.fillColor = color;
				self.getFillColor({ node });
				self.emit();
			};
			colorPicker.display({ node, context: self.context });
		}

		pickLineColor(activator) {
			var node = CIQ.UI.$(activator.node);
			var colorPicker = document.querySelector("cq-color-picker");
			if (!colorPicker) {
				console.log(
					"DrawingToolbar.prototype.pickLineColor: no ColorPicker available"
				);
				return;
			}
			var self = this;
			colorPicker.callback = function (color) {
				self.context.stx.currentVectorParameters.currentColor = color;
				self.getLineColor({ node });
				self.emit();
			};
			var overrides = node.attr("cq-overrides");
			if (overrides) overrides = overrides.split(",");
			colorPicker.display({ node, overrides, context: self.context });
		}

		restoreDefaultConfig(activator, all) {
			var stx = this.context.stx;
			CIQ.Drawing.restoreDefaultConfig(
				stx,
				stx.currentVectorParameters.vectorType,
				all
			);
			this.node
				.find("*[cq-toolbar-action='restore']")
				.removeClass("ciq-active");
			this.sync();
			this.dirty(false);
		}

		saveConfig() {
			var stx = this.context.stx;
			CIQ.Drawing.saveConfig(stx, stx.currentVectorParameters.vectorType);
			this.node.find("*[cq-toolbar-action='restore']").addClass("ciq-active");
			this.sync();
			this.dirty(false);
		}

		setFibs(width, pattern) {
			var fib = this.context.stx.currentVectorParameters.fibonacci;
			if (fib) {
				for (var i = 0; i < fib.fibs.length; i++) {
					fib.fibs[i].parameters.lineWidth = width;
					fib.fibs[i].parameters.pattern = pattern;
				}
				fib.timezone.parameters.lineWidth = width;
				fib.timezone.parameters.pattern = pattern;
			}
		}

		setFontFamily(activator, fontFamily) {
			var stx = this.context.stx;

			if (stx.currentVectorParameters.annotation) {
				if (fontFamily == "Default") {
					stx.currentVectorParameters.annotation.font.family = null;
				} else {
					stx.currentVectorParameters.annotation.font.family = fontFamily;
				}
			}
			this.params.fontFamilySelection.text(fontFamily);
			this.emit();
		}

		setFontSize(activator, fontSize) {
			var stx = this.context.stx;

			if (stx.currentVectorParameters.annotation)
				stx.currentVectorParameters.annotation.font.size = fontSize;
			this.params.fontSizeSelection.text(fontSize);
			this.emit();
		}

		setLine(activator, width, pattern) {
			var stx = this.context.stx;

			stx.currentVectorParameters.lineWidth = width;
			stx.currentVectorParameters.pattern = pattern;
			this.setFibs(width, pattern);
			if (this.currentLineSelectedClass)
				this.params.lineSelection.removeClass(this.currentLineSelectedClass);
			this.currentLineSelectedClass =
				"ciq-" + pattern + "-" + parseInt(width, 10);
			if (pattern == "none") {
				this.currentLineSelectedClass = null;
			} else {
				this.params.lineSelection.addClass(this.currentLineSelectedClass);
			}
			this.emit();
		}

		setActiveToolLabel(activeToolLabel) {
			// Clean up tool labels
			if (activeToolLabel === "No Tool") {
				activeToolLabel = "";
			} else if (activeToolLabel === "freeform") {
				activeToolLabel = "Doodle";
			} else {
				activeToolLabel = activeToolLabel + ":";
			}
			this.querySelector(".ciq-active-tool-label").innerHTML = activeToolLabel;
			this.querySelector(".ciq-mobile-palette-toggle span").innerHTML =
				activeToolLabel || "Select Tool";
		}

		/**
		 * Synchronizes the drawing toolbar with stx.currentVectorParameters. Poor man's data binding.
		 * @param {object} [cvp=stx.currentVectorParameters] A new drawing object, otherwise defaults to the current one
		 * @memberof WebComponents.cq-toolbar
		 */
		sync(cvp) {
			var stx = this.context.stx;
			if (!cvp) cvp = stx.currentVectorParameters;
			else
				stx.currentVectorParameters = CIQ.extend(
					stx.currentVectorParameters || {},
					cvp
				);

			var params = this.params;
			this.setLine(null, cvp.lineWidth, cvp.pattern);

			var style = stx.canvasStyle("stx_annotation");

			var font = cvp.annotation && cvp.annotation.font;

			var initialSize = (font && font.size) || style.fontSize;
			this.setFontSize(null, initialSize);

			var initialFamily = (font && font.family) || style.fontFamily;
			this.setFontFamily(null, initialFamily);

			var initialFontStyle = (font && font.style) || style.fontStyle;
			params.fontStyleToggle[
				initialFontStyle === "italic" ? "addClass" : "removeClass"
			]("ciq-active");

			var initialWeight = (font && font.weight) || style.fontWeight;
			params.fontWeightToggle[
				initialWeight === "bold" || initialWeight >= 700
					? "addClass"
					: "removeClass"
			]("ciq-active");

			params.axisLabelToggle[cvp.axisLabel ? "addClass" : "removeClass"](
				"ciq-active"
			);

			this.getFillColor({ node: params.fillColor });
			this.getLineColor({ node: params.lineColor });

			params.cvpControllers.each(function () {
				this.sync(cvp);
			});

			var waveParameters = params.waveParameters;
			if (waveParameters && waveParameters[0]) {
				waveParameters[0].activate();
			}
		}

		toggleAxisLabel(activator) {
			var stx = this.context.stx;
			var node = CIQ.UI.$(activator.node);

			if (stx.currentVectorParameters.axisLabel === true) {
				stx.currentVectorParameters.axisLabel = false;
				node.removeClass("ciq-active");
			} else {
				stx.currentVectorParameters.axisLabel = true;
				node.addClass("ciq-active");
			}
			this.emit();
		}

		toggleFontStyle(activator, fontStyle) {
			var stx = this.context.stx;
			var node = CIQ.UI.$(activator.node);

			if (fontStyle == "italic") {
				if (stx.currentVectorParameters.annotation.font.style == "italic") {
					stx.currentVectorParameters.annotation.font.style = null;
					node.removeClass("ciq-active");
				} else {
					stx.currentVectorParameters.annotation.font.style = "italic";
					node.addClass("ciq-active");
				}
			} else if (fontStyle == "bold") {
				if (stx.currentVectorParameters.annotation.font.weight == "bold") {
					stx.currentVectorParameters.annotation.font.weight = null;
					node.removeClass("ciq-active");
				} else {
					stx.currentVectorParameters.annotation.font.weight = "bold";
					node.addClass("ciq-active");
				}
			}
			this.emit();
		}

		toggleMagnet(activator) {
			var toggle = CIQ.UI.$(activator.node);
			var stx = this.context.stx;
			if (stx.preferences.magnet) {
				toggle.removeClass("active");
				stx.preferences.magnet = false;
			} else {
				toggle.addClass("active");
				stx.preferences.magnet = true;
			}
			CIQ.clearCanvas(stx.chart.tempCanvas, stx);
		}

		togglePalette() {
			this.sendMessage("toggleDrawingPalette");
		}
	}

	DrawingSettings.markup = `
	<div class="palette-container">
		<div class="drag-strip"></div>
			<div class="drawing-settings-wrapper">
					<div class="mini-widget-group">
						<cq-item class="ciq-mini-widget" cq-view="detach" stxtap="detach()"><span class="icon"></span><label>Detach</label></cq-item>
						<cq-item class="ciq-mini-widget" cq-view="attach" stxtap="dock()"><span class="icon"></span><label>Attach</label></cq-item>
					</div>
				<cq-clickable class="ciq-select ciq-mobile-palette-toggle" stxtap="togglePalette()"><span>Select Tool</span></cq-clickable>
				<cq-toolbar-settings>
					<div class="ciq-active-tool-label ciq-heading"></div>
					<cq-fill-color cq-section class="ciq-color" stxbind="getFillColor()" stxtap="pickFillColor()">
						<span></span>
					</cq-fill-color>
					<div>
						<cq-line-color cq-section cq-overrides="auto" class="ciq-color" stxbind="getLineColor()" stxtap="pickLineColor()"><span></span></cq-line-color>
						<cq-line-style cq-section>
							<cq-menu class="ciq-select">
								<span cq-line-style class="ciq-line ciq-selected"></span>
								<cq-menu-dropdown class="ciq-line-style-menu">
									<cq-item stxtap="setLine(1,'solid')"><span class="ciq-line-style-option ciq-solid-1"></span></cq-item>
									<cq-item stxtap="setLine(3,'solid')"><span class="ciq-line-style-option ciq-solid-3"></span></cq-item>
									<cq-item stxtap="setLine(5,'solid')"><span class="ciq-line-style-option ciq-solid-5"></span></cq-item>
									<cq-item stxtap="setLine(1,'dotted')"><span class="ciq-line-style-option ciq-dotted-1"></span></cq-item>
									<cq-item stxtap="setLine(3,'dotted')"><span class="ciq-line-style-option ciq-dotted-3"></span></cq-item>
									<cq-item stxtap="setLine(5,'dotted')"><span class="ciq-line-style-option ciq-dotted-5"></span></cq-item>
									<cq-item stxtap="setLine(1,'dashed')"><span class="ciq-line-style-option ciq-dashed-1"></span></cq-item>
									<cq-item stxtap="setLine(3,'dashed')"><span class="ciq-line-style-option ciq-dashed-3"></span></cq-item>
									<cq-item stxtap="setLine(5,'dashed')"><span class="ciq-line-style-option ciq-dashed-5"></span></cq-item>
									<cq-item stxtap="setLine(0,'none')" class="ciq-none">None</cq-item>
								</cq-menu-dropdown>
							</cq-menu>
						</cq-line-style>
					</div>

					<cq-cvp-controller cq-section cq-cvp-header="1"></cq-cvp-controller>
					<cq-cvp-controller cq-section cq-cvp-header="2"></cq-cvp-controller>
					<cq-cvp-controller cq-section cq-cvp-header="3"></cq-cvp-controller>

					<template cq-cvp-controller>
						<div cq-section>
							<div class="ciq-heading">Dev 1</div>
							<span stxtap="toggleActive()" class="ciq-checkbox">
								<span></span>
							</span>
						</div>
						<cq-line-color cq-section cq-overrides="auto" class="ciq-color" stxbind="getColor()" stxtap="pickColor()">
							<span></span>
						</cq-line-color>
						<cq-line-style cq-section>
							<cq-menu class="ciq-select">
								<span cq-cvp-line-style class="ciq-line ciq-selected"></span>
								<cq-menu-dropdown class="ciq-line-style-menu">
									<cq-item stxtap="setStyle(1, 'solid')"><span class="ciq-line-style-option ciq-solid-1"></span></cq-item>
									<cq-item stxtap="setStyle(3, 'solid')"><span class="ciq-line-style-option ciq-solid-3"></span></cq-item>
									<cq-item stxtap="setStyle(5, 'solid')"><span class="ciq-line-style-option ciq-solid-5"></span></cq-item>
									<cq-item stxtap="setStyle(1, 'dotted')"><span class="ciq-line-style-option ciq-dotted-1"></span></cq-item>
									<cq-item stxtap="setStyle(3, 'dotted')"><span class="ciq-line-style-option ciq-dotted-3"></span></cq-item>
									<cq-item stxtap="setStyle(5, 'dotted')"><span class="ciq-line-style-option ciq-dotted-5"></span></cq-item>
									<cq-item stxtap="setStyle(1, 'dashed')"><span class="ciq-line-style-option ciq-dashed-1"></span></cq-item>
									<cq-item stxtap="setStyle(3, 'dashed')"><span class="ciq-line-style-option ciq-dashed-3"></span></cq-item>
									<cq-item stxtap="setStyle(5, 'dashed')"><span class="ciq-line-style-option ciq-dashed-5"></span></cq-item>
								</cq-menu-dropdown>
							</cq-menu>
						</cq-line-style>
					</template>

					<cq-axis-label cq-section>
						<div class="ciq-heading">Axis Label:</div>
						<span stxtap="toggleAxisLabel()" class="ciq-checkbox ciq-active"><span></span></span>
					</cq-axis-label>
					<cq-annotation cq-section>
						<cq-annotation-italic stxtap="toggleFontStyle('italic')" class="ciq-btn" style="font-style:italic;">I</cq-annotation-italic>
						<cq-annotation-bold stxtap="toggleFontStyle('bold')" class="ciq-btn" style="font-weight:bold;">B</cq-annotation-bold>
						<cq-menu class="ciq-select">
							<span cq-font-size>12px</span>
							<cq-menu-dropdown class="ciq-font-size">
								<cq-item stxtap="setFontSize('8px')">8</cq-item>
								<cq-item stxtap="setFontSize('10px')">10</cq-item>
								<cq-item stxtap="setFontSize('12px')">12</cq-item>
								<cq-item stxtap="setFontSize('13px')">13</cq-item>
								<cq-item stxtap="setFontSize('14px')">14</cq-item>
								<cq-item stxtap="setFontSize('16px')">16</cq-item>
								<cq-item stxtap="setFontSize('20px')">20</cq-item>
								<cq-item stxtap="setFontSize('28px')">28</cq-item>
								<cq-item stxtap="setFontSize('36px')">36</cq-item>
								<cq-item stxtap="setFontSize('48px')">48</cq-item>
								<cq-item stxtap="setFontSize('64px')">64</cq-item>
							</cq-menu-dropdown>
						</cq-menu>
						<cq-menu class="ciq-select">
							<span cq-font-family>Default</span>
							<cq-menu-dropdown class="ciq-font-family">
								<cq-item stxtap="setFontFamily('Default')">Default</cq-item>
								<cq-item stxtap="setFontFamily('Helvetica')">Helvetica</cq-item>
								<cq-item stxtap="setFontFamily('Courier')">Courier</cq-item>
								<cq-item stxtap="setFontFamily('Garamond')">Garamond</cq-item>
								<cq-item stxtap="setFontFamily('Palatino')">Palatino</cq-item>
								<cq-item stxtap="setFontFamily('Times New Roman')">Times New Roman</cq-item>
							</cq-menu-dropdown>
						</cq-menu>
					</cq-annotation>
					<cq-clickable cq-fib-settings cq-selector="cq-fib-settings-dialog" cq-method="open" cq-section><span class="ciq-icon-btn cq-icon-gear"><cq-tooltip>Settings</cq-tooltip></span></cq-clickable>
					<div class="ciq-drawing-edit-only" cq-section>
						<div cq-toolbar-action="done_edit" stxtap="DrawingEdit.endEdit('close')" cq-section><cq-tooltip>Done Editing</cq-tooltip></div>
					</div>
					<br cq-section cq-wave-parameters><!-- This break is not displayed by default but uses  the .ciq-active class to be displayed and push cq-wave-parameters onto a new line in the toolbar -->
					<cq-wave-parameters cq-section></cq-wave-parameters>
					<template cq-wave-parameters>
						<div class="ciq-wave-template" cq-section>
							<div class="ciq-heading">WAVE TEMPLATE</div>
							<cq-menu class="ciq-select">
								<span class="ciq-active-template">WAVE TEMPLATE</span>
								<cq-menu-dropdown>
									<cq-item stxtap="update('template','Grand Supercycle')">Grand Supercycle</cq-item>
									<cq-item stxtap="update('template','Supercycle')">Supercycle</cq-item>
									<cq-item stxtap="update('template','Cycle')">Cycle</cq-item>
									<cq-item stxtap="update('template','Primary')">Primary</cq-item>
									<cq-item stxtap="update('template','Intermediate')">Intermediate</cq-item>
									<cq-item stxtap="update('template','Minor')">Minor</cq-item>
									<cq-item stxtap="update('template','Minute')">Minute</cq-item>
									<cq-item stxtap="update('template','Minuette')">Minuette</cq-item>
									<cq-item stxtap="update('template','Sub-Minuette')">Sub-Minuette</cq-item>
									<cq-item stxtap="update('template','Custom')">Custom</cq-item>
								</cq-menu-dropdown>
							</cq-menu>
						</div>
						<div class="ciq-wave-impulse" cq-section>
							<div class="ciq-heading">IMPULSE</div>
							<cq-menu  class="ciq-select">
								<span class="ciq-active-impulse">IMPULSE</span>
								<cq-menu-dropdown>
									<cq-item stxTap="update('impulse',null)">- - -</cq-item>
									<cq-item stxtap="update('impulse','I,II,III,IV,V')">I II III IV V</cq-item>
									<cq-item stxtap="update('impulse','i,ii,iii,iv,v')">i ii iii iv v</cq-item>
									<cq-item stxtap="update('impulse','1,2,3,4,5')">1 2 3 4 5</cq-item>
									<cq-item stxtap="update('impulse','A,B,C,D,E')">A B C D E</cq-item>
									<cq-item stxtap="update('impulse','a,b,c,d,e')">a b c d e</cq-item>
									<cq-item stxtap="update('impulse','W,X,Y,X,Z')">W X Y X Z</cq-item>
									<cq-item stxtap="update('impulse','w,x,y,x,z')">w x y x z</cq-item>
								</cq-menu-dropdown>
							</cq-menu>
						</div>
						<div class="ciq-wave-corrective" cq-section>
							<div class="ciq-heading">CORRECTIVE</div>
							<cq-menu class="ciq-select">
								<span class="ciq-active-corrective">CORRECTIVE</span>
								<cq-menu-dropdown>
									<cq-item stxtap="update('corrective',null)">- - -</cq-item>
									<cq-item stxtap="update('corrective','A,B,C')">A B C</cq-item>
									<cq-item stxtap="update('corrective','a,b,c')">a b c</cq-item>
									<cq-item stxtap="update('corrective','W,X,Y')">W X Y</cq-item>
									<cq-item stxtap="update('corrective','w,x,y')">w x y</cq-item>
								</cq-menu-dropdown>
							</cq-menu>
						</div>
						<span class="ciq-icon-btn ciq-btn" decoration="none" stxtap="update('decoration',null)" cq-section>
							<cq-tooltip>None</cq-tooltip>
						</span>
						<span class="ciq-icon-btn ciq-btn" decoration="parentheses" stxtap="update('decoration','parentheses')" cq-section>
							<cq-tooltip>Parentheses</cq-tooltip>
						</span>
						<span class="ciq-icon-btn ciq-btn" decoration="enclosed" stxtap="update('decoration','enclosed')" cq-section>
							<cq-tooltip>Enclosed</cq-tooltip>
						</span>
						<div class="ciq-heading ciq-show-lines"  cq-section>
							Show Lines: <span stxtap="toggleLines()" class="ciq-checkbox ciq-active"><span></span></span>
						</div>
					</template>
					<div class="ciq-drawing-edit-hidden" cq-section>
						<div cq-toolbar-action="save" stxtap="saveConfig()" cq-section><div cq-toolbar-dirty></div><cq-tooltip>Save Config</cq-tooltip></div>
						<div cq-toolbar-action="restore" stxtap="restoreDefaultConfig()" cq-section><cq-tooltip>Restore Config</cq-tooltip></div>
					</div>
				</cq-toolbar-settings>
				<cq-measure><span class="mMeasure"></span></cq-measure>
			</div>
		<div class="resize-strip"></div>
	</div>
	`;
	CIQ.UI.addComponentDefinition("cq-drawing-settings", DrawingSettings);
}

};


let __js_webcomponents_scroll_menuDropdown_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */


var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

const Scroll = CIQ.UI._webcomponents.list["cq-scroll"];
if (!Scroll) {
	console.error(
		"menuDropdown component requires first activating scroll component."
	);
} else {
	/**
	 * Menu DropDown web component `<cq-menu-dropdown>`.
	 *
	 * Menu DropDown handles holding the items that go inside a custom menu component.
	 *
	 * Menu DropDown is a semantic element to be used in menus that has the same functionality as {@link WebComponents.cq-scroll} The main difference is that Menu DropDown sets noMaximize to true which means that the component will not automatically resize.
	 *
	 * @namespace WebComponents.cq-menu-dropdown
	 * @example
	 <cq-menu class="ciq-menu ciq-studies collapse">
		 <span>Studies</span>
		 <cq-menu-dropdown cq-no-scroll>
			 <cq-study-legend cq-no-close>
				 <cq-section-dynamic>
					 <cq-heading>Current Studies</cq-heading>
					 <cq-study-legend-content>
						 <template>
							 <cq-item>
								 <cq-label class="click-to-edit"></cq-label>
								 <div class="ciq-icon ciq-close"></div>
							 </cq-item>
						 </template>
					 </cq-study-legend-content>
					 <cq-placeholder>
						 <div stxtap="Layout.clearStudies()" class="ciq-btn sm">Clear All</div>
					 </cq-placeholder>
				 </cq-section-dynamic>
			 </cq-study-legend>
			 <cq-scroll>
				 <cq-studies>
				 	 <cq-studies-content>
						<template>
							<cq-item>
								<cq-label></cq-label>
							</cq-item>
						</template>
					 </cq-studies-content>
				 </cq-studies>
			 </cq-scroll>
		 </cq-menu-dropdown>
	 * @since 7.0.0 no longer dual inherits CIQ.UI.BaseComponent and CIQ.UI.Scroll. Now directly inherits Scroll which extends BaseComponent.
	 */
	class MenuDropDown extends Scroll.classDefinition {
		constructor() {
			super();
			this.noMaximize = true;
		}

		connectedCallback() {
			super.connectedCallback();
		}

		disablekeyboardNavigation() {
			if (this.keyboardNavigation) {
				this.keyboardNavigation.setKeyControlElement();
			}
		}
	}

	CIQ.UI.addComponentDefinition("cq-menu-dropdown", MenuDropDown);
}

};


let _exports = {CIQ};
export {__js_webcomponents_abstractMarker_ as abstractMarker};
export {__js_webcomponents_advertisement_ as advertisement};
export {__js_webcomponents_aggregationDialog_ as aggregationDialog};
export {__js_webcomponents_attribution_ as attribution};
export {__js_webcomponents_chartLegend_ as chartLegend};
export {__js_webcomponents_chartTitle_ as chartTitle};
export {__js_webcomponents_chartcontrolGroup_ as chartcontrolGroup};
export {__js_webcomponents_clickable_ as clickable};
export {__js_webcomponents_close_ as close};
export {__js_webcomponents_comparison_ as comparison};
export {__js_webcomponents_comparisonLookup_ as comparisonLookup};
export {__js_webcomponents_cvpController_ as cvpController};
export {__js_webcomponents_dialog_ as dialog};
export {__js_webcomponents_doubleSlider_ as doubleSlider};
export {__js_webcomponents_drawingContext_ as drawingContext};
export {__js_webcomponents_fibSettingsDialog_ as fibSettingsDialog};
export {__js_webcomponents_floatingWindow_ as floatingWindow};
export {__js_webcomponents_gridSizePicker_ as gridSizePicker};
export {__js_webcomponents_heading_ as heading};
export {__js_webcomponents_headsupDynamic_ as headsupDynamic};
export {__js_webcomponents_headsupStatic_ as headsupStatic};
export {__js_webcomponents_infoToggle_ as infoToggle};
export {__js_webcomponents_infoToggleDropdown_ as infoToggleDropdown};
export {__js_webcomponents_instantChart_ as instantChart};
export {__js_webcomponents_languageDialog_ as languageDialog};
export {__js_webcomponents_loader_ as loader};
export {__js_webcomponents_lookup_ as lookup};
export {__js_webcomponents_menu_ as menu};
export {__js_webcomponents_menuContainer_ as menuContainer};
export {__js_webcomponents_messageToaster_ as messageToaster};
export {__js_webcomponents_palette_ as palette};
export {__js_webcomponents_paletteDock_ as paletteDock};
export {__js_webcomponents_redo_ as redo};
export {__js_webcomponents_scroll_ as scroll};
export {__js_webcomponents_shareButton_ as shareButton};
export {__js_webcomponents_shareDialog_ as shareDialog};
export {__js_webcomponents_showRange_ as showRange};
export {__js_webcomponents_sideNav_ as sideNav};
export {__js_webcomponents_sidePanel_ as sidePanel};
export {__js_webcomponents_studies_ as studies};
export {__js_webcomponents_studyContext_ as studyContext};
export {__js_webcomponents_studyDialog_ as studyDialog};
export {__js_webcomponents_studyInput_ as studyInput};
export {__js_webcomponents_studyLegend_ as studyLegend};
export {__js_webcomponents_studyOutput_ as studyOutput};
export {__js_webcomponents_studyParameter_ as studyParameter};
export {__js_webcomponents_swatch_ as swatch};
export {__js_webcomponents_themeDialog_ as themeDialog};
export {__js_webcomponents_themePiece_ as themePiece};
export {__js_webcomponents_themes_ as themes};
export {__js_webcomponents_timezoneDialog_ as timezoneDialog};
export {__js_webcomponents_toggle_ as toggle};
export {__js_webcomponents_toolbar_ as toolbar};
export {__js_webcomponents_undo_ as undo};
export {__js_webcomponents_viewDialog_ as viewDialog};
export {__js_webcomponents_views_ as views};
export {__js_webcomponents_waveParameters_ as waveParameters};
export {__js_webcomponents_dialog_colorPicker_ as colorPicker};
export {__js_webcomponents_palette_drawingPalette_ as drawingPalette};
export {__js_webcomponents_palette_drawingSettings_ as drawingSettings};
export {__js_webcomponents_scroll_menuDropdown_ as menuDropdown};

export {CIQ};

/* global __TREE_SHAKE__ */
if (typeof __TREE_SHAKE__ === "undefined" || !__TREE_SHAKE__) {
	(_exports.CIQ || CIQ).activateImports(
		__js_webcomponents_abstractMarker_,
		__js_webcomponents_advertisement_,
		__js_webcomponents_aggregationDialog_,
		__js_webcomponents_attribution_,
		__js_webcomponents_chartLegend_,
		__js_webcomponents_chartTitle_,
		__js_webcomponents_chartcontrolGroup_,
		__js_webcomponents_clickable_,
		__js_webcomponents_close_,
		__js_webcomponents_comparison_,
		__js_webcomponents_comparisonLookup_,
		__js_webcomponents_cvpController_,
		__js_webcomponents_dialog_,
		__js_webcomponents_doubleSlider_,
		__js_webcomponents_drawingContext_,
		__js_webcomponents_fibSettingsDialog_,
		__js_webcomponents_floatingWindow_,
		__js_webcomponents_gridSizePicker_,
		__js_webcomponents_heading_,
		__js_webcomponents_headsupDynamic_,
		__js_webcomponents_headsupStatic_,
		__js_webcomponents_infoToggle_,
		__js_webcomponents_infoToggleDropdown_,
		__js_webcomponents_instantChart_,
		__js_webcomponents_languageDialog_,
		__js_webcomponents_loader_,
		__js_webcomponents_lookup_,
		__js_webcomponents_menu_,
		__js_webcomponents_menuContainer_,
		__js_webcomponents_messageToaster_,
		__js_webcomponents_palette_,
		__js_webcomponents_paletteDock_,
		__js_webcomponents_redo_,
		__js_webcomponents_scroll_,
		__js_webcomponents_shareButton_,
		__js_webcomponents_shareDialog_,
		__js_webcomponents_showRange_,
		__js_webcomponents_sideNav_,
		__js_webcomponents_sidePanel_,
		__js_webcomponents_studies_,
		__js_webcomponents_studyContext_,
		__js_webcomponents_studyDialog_,
		__js_webcomponents_studyInput_,
		__js_webcomponents_studyLegend_,
		__js_webcomponents_studyOutput_,
		__js_webcomponents_studyParameter_,
		__js_webcomponents_swatch_,
		__js_webcomponents_themeDialog_,
		__js_webcomponents_themePiece_,
		__js_webcomponents_themes_,
		__js_webcomponents_timezoneDialog_,
		__js_webcomponents_toggle_,
		__js_webcomponents_toolbar_,
		__js_webcomponents_undo_,
		__js_webcomponents_viewDialog_,
		__js_webcomponents_views_,
		__js_webcomponents_waveParameters_,
		__js_webcomponents_dialog_colorPicker_,
		__js_webcomponents_palette_drawingPalette_,
		__js_webcomponents_palette_drawingSettings_,
		__js_webcomponents_scroll_menuDropdown_,
		null
	);
}