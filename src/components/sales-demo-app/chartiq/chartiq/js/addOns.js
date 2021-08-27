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


import {CIQ} from "../js/chartiq.js";


let __js_addons_standard_extendedHours_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Use this constructor to initialize filtering and visualization styles of extended hours by the use of shading and delimitation lines.
 *
 *  Extended hours can be toggled using the Ctrl+Alt+X keystroke combination (see the
 * `extendedHours` action in `hotkeyConfig.hotkeys` in *js/defaultConfiguration.js*).
 *
 * Requires *addOns.js*.
 *
 * This visualization will only work if data for the corresponding sessions is provided from your quote feed and the market definitions have the corresponding entries.
 * See {@link CIQ.Market} for details on how to define extended (non-default) hours.
 *
 * By default all extended hour sessions are disabled unless explicitly enabled using {@link CIQ.ExtendedHours.prepare} or {@link CIQ.ExtendedHours.set}.
 *
 * All possible market sessions needed to be shaded at any given time should be enabled at once with this method.
 *
 * Your fetch should load the required data based on the `params.stx.layout.extended` and `params.stx.layout.marketSessions` settings.
 *
 * Remember that when `params.filter` is set to true, this module performs a filter of already loaded masterData when {@link CIQ.ExtendedHours.set} is invoked,
 * rather than calling {@link CIQ.ChartEngine#loadChart} to reload the data from the server every time you enable or disable this feature.
 * So you must always return all requested sessions on your fetch responses if this flag is set.
 *
 * CSS info:
 * - The styles for the shading of each session is determined by the corresponding CSS class in the form of "stx_market_session."+session_name (Example: `stx_market_session.pre`)
 * - The divider line is determined by the CSS class "stx_market_session.divider".
 *
 * **Important:** This module must be initialized before {@link CIQ.ChartEngine#importLayout} or the sessions will not be able to be restored.
 *
 * Example:
 * <iframe width="800" height="500" scrolling="no" seamless="seamless" align="top"
 *         style="float:top"
 *         src="https://jsfiddle.net/chartiq/g2vvww67/embedded/result,js,html/"
 *         allowfullscreen="allowfullscreen" frameborder="1">
 * </iframe>
 *
 * @param {object} params The constructor parameters.
 * @param {CIQ.ChartEngine} [params.stx] The chart object.
 * @param {boolean} [params.filter] Setting to true performs a filter of masterData when
 * 		{@link CIQ.ExtendedHours.set} is invoked, rather than calling
 * 		{@link CIQ.ChartEngine#loadChart} to reload the data from the server.
 * @param {string} [params.menuContextClass] A CSS class name used to query the menu DOM
 * 		element that contains the UI control for the extended hours add-on. In a multi-chart
 * 		document, the add-on is available only on charts that have a menu DOM element with
 * 		the value for `menuContextClass` as a class attribute.
 *
 * @constructor
 * @name CIQ.ExtendedHours
 * @since
 * - 06-2016-02
 * - 3.0.0 Changed argument to an object to support `filter`.
 * - 3.0.0 No longer necessary to explicitly call new Chart to reload data. Instead call {@link CIQ.ExtendedHours.set} function.
 * - 5.0.0 No longer necessary to explicitly set `stx.layout.marketSessions` or `1stx.layout.extended` to manage sessions; instead call {@link CIQ.ExtendedHours.prepare} or {@link CIQ.ExtendedHours.set}.
 * - 8.0.0 Added `params.menuContextClass`.
 *
 * @example
 * // Call this only once to initialize the market sessions display manager.
 * new CIQ.ExtendedHours({stx:stxx, filter:true});
 *
 * // By default all sessions are disabled unless explicitly enabled.
 * // This forces the extended hours sessions ["pre","post"] to be enabled when the chart is initially loaded.
 * stxx.extendedHours.prepare(true);
 *
 * // Now display your chart.
 * stxx.loadChart(stxx.chart.symbol, {}, function() {});
 *
 * @example
 * // Once your chart is displayed, you can call this from any UI interface to turn on extended hours.
 * stx.extendedHours.set(true);
 *
 * // Or call this from any UI interface to turn off extended hours.
 * stx.extendedHours.set(false);
 *
 * @example
 * // CSS entries for a session divider and sessions named "pre" and "post".
 * .stx_market_session.divider {
 *     background-color: rgba(0,255,0,0.8);
 *     width: 1px;
 * }
 * .stx_market_session.pre {
 *     background-color: rgba(255,255,0,0.1);
 * }
 * .stx_market_session.post {
 *     background-color: rgba(0,0,255,0.2);
 * }
 */
CIQ.ExtendedHours =
	CIQ.ExtendedHours ||
	function (params) {
		var stx = params.stx;
		this.filter = params.filter;
		if (!stx) {
			// backwards compatibility
			stx = params;
			this.filter = false;
		}
		var styles = {};
		this.stx = stx;
		this.stx.extendedHours = this;
		this.cssRequired = true;

		stx.addEventListener("theme", function (tObject) {
			// reinitialize the session colors after a theme change
			styles = {};
			for (var sess in stx.layout.marketSessions) {
				if (!styles.session) styles.session = {};
				styles.session[sess] = stx.canvasStyle("stx_market_session " + sess);
			}
		});

		stx.addEventListener("symbolChange", function (tObject) {
			// check if extended hours exists for this security
			if (
				tObject.action == "master" &&
				stx.layout.extended &&
				!(stx.chart.market.market_def && stx.chart.market.sessions.length)
			) {
				CIQ.alert("There are no Extended Hours for this instrument.");
			}
		});

		if (CIQ.UI) {
			CIQ.UI.KeystrokeHub.addHotKeyHandler(
				"extendedHours",
				() => {
					document.body.keystrokeHub.context.advertised.Layout.setExtendedHours();
				},
				stx
			);
		}

		/**
		 * Prepares the extended hours settings and classes for the session names enumerated in the arguments without actually displaying or loading the data.
		 *
		 * This method can be used to force a particular session to load by default by calling it before {@link CIQ.ChartEngine#loadChart}.
		 * Otherwise the chart will be loaded with all sessions disabled until {@link CIQ.ExtendedHours.set} is invoked.
		 *
		 * {@link CIQ.ChartEngine#importLayout} will also call this method to ensure the sessions are restored as previously saved.
		 *
		 * @param  {boolean} enable Set to turn on/off the extended-hours visualization.
		 * @param  {array} sessions The sessions to visualize when enable is true.  Any sessions previously visualized will be disabled.  If set to null, will default to ["pre","post"].
		 * @memberof CIQ.ExtendedHours#
		 * @alias prepare
		 * @since 5.0.0
		 */
		this.prepare = function (enable, sessions) {
			stx.layout.extended = enable;
			for (var sess in stx.layout.marketSessions) {
				styles.session = {};
				stx.chart.market.disableSession(sess);
			}
			stx.layout.marketSessions = {};
			if (enable) {
				if (!sessions) sessions = ["pre", "post"];
				if (sessions.length) {
					for (var s = 0; s < sessions.length; s++) {
						stx.layout.marketSessions[sessions[s]] = true;
					}
				} else {
					stx.layout.marketSessions = sessions;
				}
			}
			for (sess in stx.layout.marketSessions) {
				if (!styles.session) styles.session = {};
				styles.session[sess] = stx.canvasStyle("stx_market_session " + sess);
				stx.chart.market.disableSession(sess, true);
			}
		};

		/**
		 * gathers and renders the extended hours for the preset session names enumerated in prepare().
		 * @param  {function} cb Optional callback function to be invoked once chart is reloaded with extended hours data.
		 * @memberof CIQ.ExtendedHours#
		 * @alias complete
		 * @private
		 * @since 5.0.0
		 */
		this.complete = function (cb) {
			stx.changeOccurred("layout");
			if (!stx.chart.market.market_def) {
				// possibly a 24 hours Market. Not necessarily an error but nothing to do for ExtendedHours
				if (cb) cb();
				return;
			}
			if (this.filter) {
				stx.createDataSet();
				stx.draw();
				if (cb) cb();
			} else {
				stx.loadChart(stx.chart.symbol, cb);
			}
		};

		/**
		 * Turns on or off extended hours for the session names enumerated in the arguments.
		 * @param  {boolean} enable Set to turn on/off the extended-hours visualization.
		 * @param  {array} sessions The sessions to visualize when enable is true.  Any sessions previously visualized will be disabled.  If set to null, will default to ["pre","post"].
		 * @param  {function} cb Optional callback function to be invoked once chart is reloaded with extended hours data.
		 * @memberof CIQ.ExtendedHours#
		 * @alias set
		 */
		this.set = function (enable, sessions, cb) {
			this.prepare(enable, sessions);
			this.complete(cb);
		};

		// This injection shades the after hours portion of the chart for each yaxis.
		// Only the panel to which the yaxis belongs will get shading.
		// This means yaxes of overlays will bypass the shading block.
		this.stx.append("drawYAxis", function (panel, parameters) {
			if (!this.layout.extended) return;
			if (
				panel.yAxis != parameters.yAxis ||
				panel.shareChartXAxis === false ||
				panel.hidden
			)
				return;
			var chart = panel.chart;
			if (CIQ.ChartEngine.isDailyInterval(this.layout.interval)) return;
			styles.divider = this.canvasStyle("stx_market_session divider");
			if (styles.session) {
				var m = chart.market;
				var ranges = [];
				var range = {};
				var nextBoundary, thisSession;
				for (var i = 0; i < chart.dataSegment.length; i++) {
					var ds = chart.dataSegment[i];
					if (!ds || !ds.DT) continue;
					var c = null;
					if (m.market_def) {
						if (!nextBoundary || nextBoundary <= ds.DT) {
							thisSession = m.getSession(ds.DT);
							var filterSession =
								thisSession !== "" &&
								(!this.layout.marketSessions ||
									!this.layout.marketSessions[thisSession]);
							nextBoundary = m[filterSession ? "getNextOpen" : "getNextClose"](
								ds.DT
							);
						}
					}

					var s = styles.session[thisSession];
					if (s) c = s.backgroundColor;
					if (range.color && range.color != c) {
						ranges.push({
							start: range.start,
							end: range.end,
							color: range.color
						});
						range = {};
					}
					if (c) {
						var cw = this.layout.candleWidth;
						if (ds.candleWidth) cw = ds.candleWidth;
						range.end = this.pixelFromBar(i, chart) + cw / 2;
						if (!range.start && range.start !== 0)
							range.start = range.end - cw + 1;
						range.color = c;
					} else {
						range = {};
					}
				}
				if (range.start || range.start === 0)
					ranges.push({
						start: range.start,
						end: range.end,
						color: range.color
					});
				var noDashes = CIQ.isTransparent(styles.divider.backgroundColor);
				var dividerLineWidth = styles.divider.width.replace(/px/g, "");
				var dividerStyle = {
					y0: panel.bottom,
					y1: panel.top,
					color: styles.divider.backgroundColor,
					type: "line",
					context: chart.context,
					confineToPanel: panel,
					pattern: "dashed",
					lineWidth: dividerLineWidth,
					deferStroke: true
				};
				this.startClip(panel.name);
				chart.context.beginPath();
				if (stx.highlightedDraggable) chart.context.globalAlpha *= 0.3;
				for (i = 0; i < ranges.length; i++) {
					chart.context.fillStyle = ranges[i].color;
					if (!noDashes && ranges[i].start > chart.left)
						this.plotLine(
							CIQ.extend(
								{ x0: ranges[i].start, x1: ranges[i].start },
								dividerStyle
							)
						);
					chart.context.fillRect(
						ranges[i].start,
						panel.top,
						ranges[i].end - ranges[i].start,
						panel.bottom - panel.top
					);
					if (!noDashes && ranges[i].end < chart.right)
						this.plotLine(
							CIQ.extend({ x0: ranges[i].end, x1: ranges[i].end }, dividerStyle)
						);
				}
				chart.context.stroke();
				this.endClip();
			}
		});
	};

};


let __js_addons_standard_fullScreen_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Creates an add-on that sets the chart UI to full-screen mode. In full-screen mode, a class
 * `full-screen` is added to the context element used for styling. In addition, elements with the
 * class `full-screen-hide` are hidden. Elements with the class `full-screen-show` that are
 * normally hidden are shown.
 *
 * Requires *addOns.js*.
 *
 * ![Full-screen display](./img-Full-Screen-Chart.png)
 *
 * @param {object} params Configuration parameters.
 * @param {CIQ.ChartEngine} [params.stx] The chart object.
 *
 * @constructor
 * @name CIQ.FullScreen
 * @since 7.3.0
 *
 * @example
 * new CIQ.FullScreen({ stx: stxx });
 */
CIQ.FullScreen =
	CIQ.FullScreen ||
	function (params) {
		if (!params) params = {};
		if (!params.stx) {
			console.warn("The Full Screen addon requires an stx parameter");
			return;
		}
		// Check for loading within an iframe from another origin
		try {
			if (window.location.host !== window.top.location.host)
				throw new Error(
					window.location.host + " does not match " + window.top.location.host
				);
		} catch (exception) {
			console.warn("Full screen mode disabled.");
			return;
		}
		this.stx = params.stx;
		this.stx.fullScreen = this;
		this.fullScreenButton = null;
		this.fullScreenState = false;

		//Attaches FullScreen button to HTML DOM inside .chartSize element
		this.addFullScreenButton = function () {
			if (this.stx.registerChartControl)
				this.fullScreenButton = this.stx.registerChartControl(
					"stx-full-screen",
					"Full Screen",
					(function (self) {
						return function (e) {
							self.fullScreenToggle(e);
							e.stopPropagation();
						};
					})(this)
				);
		};

		//Click event handler for the Full Screen button.
		this.fullScreenToggle = function (e) {
			// First check for availability of the requestFullScreen function
			if (
				document.documentElement.requestFullscreen ||
				document.documentElement.webkitRequestFullscreen ||
				document.documentElement.mozRequestFullscreen ||
				document.documentElement.msRequestFullscreen
			) {
				// Check if full screen is already enabled
				if (this.getFullScreenElement()) {
					if (document.exitFullscreen) document.exitFullscreen();
					else if (document.webkitExitFullscreen)
						document.webkitExitFullscreen();
					else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
					else if (document.msExitFullscreen) document.msExitFullscreen();
				} else {
					// requestFullscreen methods need to be checked for again here because the browser will not allow the method to be stored in a local var
					if (document.documentElement.requestFullscreen)
						document.documentElement.requestFullscreen();
					else if (document.documentElement.webkitRequestFullscreen)
						document.documentElement.webkitRequestFullscreen();
					else if (document.documentElement.mozRequestFullscreen)
						document.documentElement.mozRequestFullscreen();
					else if (document.documentElement.msRequestFullscreen)
						document.documentElement.msRequestFullscreen();
				}
			} else {
				//If the full screen api isn't available, manually trigger the fullScreen styling
				this.fullScreenState = !this.fullScreenState;
				this.fullScreenRender();
			}
		};

		// Append/remove full-screen class to context or body and update button state
		this.fullScreenRender = function () {
			var containerElement = null;
			containerElement = this.stx.container.closest(
				"*[cq-context], cq-context, body"
			);
			if (containerElement) {
				if (this.fullScreenState === true) {
					if (this.fullScreenButton)
						this.fullScreenButton.classList.add("active");
					containerElement.classList.add("full-screen");
				} else {
					if (this.fullScreenButton)
						this.fullScreenButton.classList.remove("active");
					containerElement.classList.remove("full-screen");
				}
				// Trigger a resize event to update the chart size
				window.dispatchEvent(new Event("resize"));
			}
		};

		//Handle full screen change
		this.onFullScreenChange = function () {
			if (this.getFullScreenElement()) {
				this.fullScreenState = true;
			} else {
				this.fullScreenState = false;
			}
			this.fullScreenRender();
		};

		this.getFullScreenElement = function () {
			return (
				document.fullscreenElement ||
				document.webkitCurrentFullScreenElement ||
				document.mozFullScreenElement ||
				document.msFullscreenElement
			);
		};

		document.addEventListener(
			"fullscreenchange",
			this.onFullScreenChange.bind(this),
			false
		);
		document.addEventListener(
			"webkitfullscreenchange",
			this.onFullScreenChange.bind(this),
			false
		);
		document.addEventListener(
			"mozfullscreenchange",
			this.onFullScreenChange.bind(this),
			false
		);
		document.addEventListener(
			"MSFullscreenChange",
			this.onFullScreenChange.bind(this),
			false
		);

		// Add the FullScreen button to chartControls
		this.addFullScreenButton();
	};

};


let __js_addons_standard_inactivityTimer_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Add-On that puts the chart into "sleep mode" after a period of inactivity.
 *
 * Requires *addOns.js*.
 *
 * In sleep mode, a class "ciq-sleeping" will be added to the body.  This will dim out the chart.
 * Sleep mode is ended when interaction with the chart is detected.
 *
 * @param {object} params Configuration parameters
 * @param {CIQ.ChartEngine} [params.stx] The chart object
 * @param {number} [params.minutes] Inactivity period in _minutes_.  Set to 0 to disable the sleep mode.
 * @param {number} [params.interval] Sleeping quote update interval in _seconds_.  During sleep mode, this is used for the update loop.
 * 									Set to non-zero positive number or defaults to 60.
 * @param {function} [params.wakeCB] Optional callback function after waking
 * @param {function} [params.sleepCB] Optional callback function after sleeping
 * @constructor
 * @name  CIQ.InactivityTimer
 * @since 3.0.0
 * @example
 * 	new CIQ.InactivityTimer({stx:stxx, minutes:30, interval:15});  //30 minutes of inactivity will put chart into sleep mode, updating every 15 seconds
 *
 */
CIQ.InactivityTimer =
	CIQ.InactivityTimer ||
	function (params) {
		if (!params.minutes) return;
		if (!params.interval || params.interval < 0) params.interval = 60;
		this.stx = params.stx;
		this.timeout = params.minutes;
		this.interval = params.interval;
		this.wakeCB = params.wakeCB;
		this.sleepCB = params.sleepCB;
		this.sleepTimer = null;
		this.sleeping = false;
		this.last = new Date().getTime();
		this.wakeChart = function () {
			clearTimeout(this.sleepTimer);
			this.last = new Date().getTime();
			if (this.sleeping) {
				if (this.stx.quoteDriver) this.stx.quoteDriver.updateChartLoop();
				this.sleeping = false;
				document.body.classList.remove("ciq-sleeping");
			}
			this.sleepTimer = setTimeout(
				this.sleepChart.bind(this),
				this.timeout * 60000
			);
			if (this.wakeCB) this.wakeCB();
		};
		this.sleepChart = function () {
			if (!this.sleeping) {
				if (this.stx.quoteDriver)
					this.stx.quoteDriver.updateChartLoop(this.interval);
				this.sleeping = true;
				document.body.classList.add("ciq-sleeping");
			}
			if (this.sleepCB) this.sleepCB();
		};

		var self = this;
		[
			"mousemove",
			"mousedown",
			"touchstart",
			"touchmove",
			"pointerdown",
			"pointermove",
			"keydown",
			"wheel"
		].forEach(function (ev) {
			document.body.addEventListener(
				ev,
				function (e) {
					self.wakeChart();
				},
				{ passive: false }
			);
		});
		this.wakeChart();
	};

};


let __js_addons_standard_rangeSlider_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Add-on that adds a range slider to the chart.
 *
 * The range slider allows the `dataSegment` to be selectable as a portion of the data set.
 *
 * The range slider can be toggled using the Ctrl+Alt+R keystroke combination (see the
 * `rangeSlider` action in `hotkeyConfig.hotkeys` in *js/defaultConfiguration.js*).
 *
 * Requires *addOns.js*.
 *
 * Also requires additional CSS. Add the following style sheet:
 * ```
 * <link rel="stylesheet" type="text/css" href="css/chartiq.css" media="screen" />
 * ```
 * or directly include this CSS:
 * ```
 * .stx_range_slider.shading {
 *     background-color: rgba(128, 128, 128, 0.3);
 *     border: solid 2px #0090b7;
 *     width: 5px;
 * }
 * ```
 * Once instantiated, the range slider can be displayed or hidden by setting the `rangeSlider`
 * parameter of the primary chart's [layout object]{@link CIQ.ChartEngine#layout} and then issuing
 * a layout change event to trigger the new status. When initialing loading the chart, enable the
 * range slider in a callback function to prevent out&#8209;of&#8209;sequence issues. See the
 * examples below.
 *
 * A range slider is simply another chart. So you configure it and customize it using the same
 * parameters as you would the primary chart. The only difference is that the slider object is a
 * sub&#8209;element of the primary chart, contained in the `slider.slider` object.
 *
 * For example, if you wanted to turn off the x-axis on the slider, assuming a chart instantiated
 * as `stxx`, you would execute:
 * ```
 * stxx.slider.slider.xaxisHeight = 0;
 * ```
 *
 * It is important to note that the range slider chart DOM element creates itself below the
 * primary chart container element, not inside the container. As such, all styling must be on a
 * parent `div` container rather than on the primary chart container itself to ensure styling is
 * shared between the chart and range slider containers.
 *
 * For example, do this:
 * ```
 * <div class="all-charts">
 *     <div style="grid-column: span 6; grid-row: span 2;">
 *         <div class="chartwrap"> <!-- Beginning of wrapper with desired styling. -->
 *             <div class="chartContainer1" style="width:100%;height:100%;position:relative"></div>
 *             <!-- The slider will be added here. -->
 *         </div> <!-- End of wrapper. -->
 *     </div>
 * </div>
 * ```
 *
 * not this:
 * ```
 * <div class="all-charts">
 *     <div class="chartwrap" style="grid-column: span 6; grid-row: span 2;">
 *         <div class="chartContainer1" style="width: 100%; height: 100%; position: relative"></div>
 *     </div>
 * </div>
 * ```
 *
 * Range slider example:
 * <iframe width="800" height="350" scrolling="no" seamless="seamless" align="top"
 *         style="float:top" src="https://jsfiddle.net/chartiq/dtug29yx/embedded/result,js,html/"
 *         allowfullscreen="allowfullscreen" frameborder="1">
 * </iframe>
 *
 * @param {object} params Configuration parameters.
 * @param {CIQ.ChartEngine} [params.stx] The chart object.
 * @param {number} [params.height="95px"] Height of the range slider panel. Must include a CSS
 * 		unit, such as "px".
 * @param {object} [params.yAxis] Y-axis parameters.
 * @param {number} [params.chartContainer] Handle to the main chart container. Defaults to
 * 		`stxx.container`.
 * @param {string} [params.menuContextClass] A CSS class name used to query the menu DOM element
 * 		that contains the UI control for the range slider add-on. In a multi-chart document, the
 * 		add-on is available only on charts that have a menu DOM element with the value for
 * 		`menuContextClass` as a class attribute.
 *
 * @constructor
 * @name CIQ.RangeSlider
 * @since
 * - 4.0.0
 * - 6.1.0 Added `params.yAxis`.
 * - 8.0.0 Added `params.menuContextClass`.
 *
 * @example
 * <caption>
 * 		Create a range slider and enable it by default using the <code>loadChart</code> callback.
 * </caption>
 * const stxx = new CIQ.ChartEngine({ container: document.querySelector(".chartContainer") });
 *
 * stxx.attachQuoteFeed(quoteFeedSimulator,{ refreshInterval: 1, bufferSize: 200 });
 *
 * // Instantiate a range slider.
 * new CIQ.RangeSlider({ stx: stxx });
 *
 * function displayChart(){
 *     stxx.loadChart("SPY", null, function() {
 *         // For smoother visualization, enable after the main chart has completed loading its data.
 *         stxx.layout.rangeSlider = true; // Show the slider.
 *         stxx.changeOccurred("layout"); // Signal the change to force a redraw.
 *     });
 * }
 *
 * @example
 * <caption>
 * 		Create a range slider and enable/disable it using commands to be triggered from a menu.
 * </caption>
 * const stxx = new CIQ.ChartEngine({ container: document.querySelector(".chartContainer") });
 *
 * // Instantiate a range slider.
 * new CIQ.RangeSlider({ stx: stxx });
 *
 * // To display the slider from a menu use:
 * stxx.layout.rangeSlider = true; // Show the slider.
 * stxx.changeOccurred("layout"); // Signal the change to force a redraw.
 *
 * // To hide the slider from a menu use:
 * stxx.layout.rangeSlider = false; // Hide the slider.
 * stxx.changeOccurred("layout"); // Signal the change to force a redraw.
 */
CIQ.RangeSlider =
	CIQ.RangeSlider ||
	function (params) {
		this.cssRequired = true;

		var stx = params.stx;
		stx.slider = this;
		var sliderHeight = params.height ? params.height : "95px";
		var chartContainer = params.chartContainer
			? params.chartContainer
			: params.stx.container;

		var ciqSlider = document.createElement("div");
		ciqSlider.className = "ciq-chart";
		var sliderContainer = document.createElement("div");
		sliderContainer.className = "chartContainer";
		ciqSlider.appendChild(sliderContainer);
		chartContainer.parentElement.parentElement.insertBefore(
			ciqSlider,
			chartContainer.parentElement.nextSibling
		);
		Object.assign(ciqSlider.style, {
			height: sliderHeight,
			paddingTop: "5px",
			display: "none"
		});
		sliderContainer.style.height = "100%";
		sliderContainer.dimensionlessCanvas = true;
		var self = (this.slider = new CIQ.ChartEngine({
			container: sliderContainer,
			preferences: { labels: false, whitespace: 0 }
		}));
		self.xaxisHeight = 30;
		self.manageTouchAndMouse = false;
		self.minimumCandleWidth = 0;
		self.chart.panel.subholder.style.cursor = "ew-resize";
		var yAxis = self.chart.panel.yAxis;
		yAxis.drawCurrentPriceLabel = false;
		Object.defineProperty(yAxis, "position", {
			get: function () {
				return stx.slider.yAxisPosition || stx.chart.panel.yAxis.position;
			},
			set: function (position) {
				stx.slider.yAxisPosition = position;
			}
		});
		const { get, set } = Object.getOwnPropertyDescriptor(
			CIQ.ChartEngine.YAxis.prototype,
			"width"
		);
		Object.defineProperty(yAxis, "width", {
			get: function () {
				return Math.max(get.call(yAxis), stx.chart.yAxis.width);
			},
			set: function (width) {
				set.call(yAxis, width);
			}
		});
		CIQ.extend(yAxis, params.yAxis);
		self.chart.baseline.userLevel = false;
		if (self.controls.home) self.controls.home.style.width = 0;
		self.initializeChart();
		var subholder = self.chart.panel.subholder;

		if (CIQ.UI) {
			CIQ.UI.KeystrokeHub.addHotKeyHandler(
				"rangeSlider",
				() => {
					document.body.keystrokeHub.context.advertised.Layout.setRangeSlider();
				},
				stx
			);
		}

		/**
		 * Dynamically updates the styling of the range slider.
		 *
		 * This method can be used to update CSS styles if you are injecting stylesheets using
		 * JavaScript.
		 *
		 * @param {string} obj The CSS selector for which a style property is changed.
		 * @param {string} attribute The style property changed in the CSS selector rule-set.
		 * @param {string} value The value to apply to the CSS property.
		 *
		 * @alias updateStyles
		 * @memberof CIQ.RangeSlider.prototype
		 * @since 8.0.0
		 *
		 * @example
		 * // Set the shading of the range slider.
		 * stxx.slider.updateStyles(
		 *     'stx_range_slider shading',
		 *     'backgroundColor',
		 *     'rgba(200, 50, 50, 0.45)'
		 * );
		 *
		 * @example
		 * // Set the color of the bars of the range slider to red.
		 * stxx.slider.updateStyles(
		 *     'stx_range_slider shading',
		 *     'borderTopColor',
		 *     'rgba(255, 0, 0)'
		 * );
		 */
		this.updateStyles = function (obj, attribute, value) {
			stx.setStyle(obj, attribute, value);
			this.style = stx.canvasStyle("stx_range_slider shading");
		};

		this.display = function (on) {
			if (stx.layout.rangeSlider !== on) {
				// do this the way it was intended
				stx.layout.rangeSlider = on;
				stx.changeOccurred("layout");
				return;
			}
			ciqSlider.style.display = on ? "" : "none";
			stx.resizeChart();
			window.dispatchEvent(new Event("resize"));
			if (!on) return;
			self.resizeChart();
			self.initializeChart();
			self.draw();
			this.drawSlider();
		};
		this.setSymbol = function (symbol) {
			self.chart.panel.display = self.chart.symbol = symbol;
			self.setMainSeriesRenderer();
			self.resizeChart();
			this.adjustRange(stx.chart);
			self.draw();
			this.drawSlider();
		};
		this.acceptLayoutChange = function (layout) {
			var doDraw = false;
			if (self.layout.rangeSlider !== layout.rangeSlider) {
				stx.slider.display(layout.rangeSlider);
			}
			var relevantLayoutPropertiesForRedraw = [
				"chartType",
				"aggregationType",
				"periodicity",
				"interval",
				"timeUnit",
				"chartScale",
				"rangeSlider",
				"flipped",
				"extended",
				"marketSessions",
				"kagi",
				"rangebars",
				"renko",
				"priceLines",
				"pandf"
			];
			relevantLayoutPropertiesForRedraw.forEach(function (x) {
				if (!CIQ.equals(self.layout[x], layout[x])) {
					self.layout[x] = layout[x];
					doDraw = true;
				}
			});
			if (!CIQ.trulyVisible(ciqSlider)) return;
			if (doDraw) {
				self.setMainSeriesRenderer();
				self.draw();
				this.drawSlider();
			}
		};
		this.adjustRange = function (chart) {
			if (!chart.dataSet) return;
			if (!chart.endPoints || !chart.endPoints.begin) return;
			var myChart = self.chart;
			if (!myChart.width) return;
			var scrollOffset = 0,
				ticksOffset = 0;
			if (stx.quoteDriver) {
				var behaviorParams = {
					symbol: chart.symbol,
					symbolObject: chart.symbolObject,
					interval: stx.layout.interval
				};
				if (
					(behaviorParams.interval == "month" ||
						behaviorParams.interval == "week") &&
					!stx.dontRoll
				) {
					behaviorParams.interval = "day";
				}
				var behavior = stx.quoteDriver.getQuoteFeed(behaviorParams).behavior;
				if (behavior && behavior.bufferSize) {
					if (chart.moreAvailable) scrollOffset = behavior.bufferSize;
					if (stx.isHistoricalMode()) ticksOffset = behavior.bufferSize;
				}
			}
			myChart.baseline.defaultLevel = chart.baseline.actualLevel;
			myChart.scroll =
				Math.max(
					0,
					chart.dataSet.length -
						stx.tickFromDate(chart.endPoints.begin) -
						scrollOffset
				) + 1;
			myChart.maxTicks = myChart.scroll - ticksOffset + 1;
			self.layout.candleWidth = myChart.width / myChart.maxTicks;
		};
		this.copyData = function (chart) {
			if (!chart.dataSet) return;
			var myChart = self.chart;
			myChart.masterData = self.masterData = chart.masterData;
			myChart.dataSet = chart.dataSet;
			myChart.state = chart.state;
			self.draw();
			this.drawSlider();
		};
		this.calculateYAxisPosition = function () {
			var panel = self.chart.panel;
			var currentPosition = self.getYAxisCurrentPosition(panel.yAxis, panel);
			if (currentPosition != panel.yAxis.position)
				self.calculateYAxisPositions();
		};
		this.drawSlider = function () {
			if (!CIQ.trulyVisible(ciqSlider)) return;
			if (!stx.chart.dataSet || !stx.chart.dataSet.length) return;
			var style = this.style;
			if (!style)
				style = this.style = stx.canvasStyle("stx_range_slider shading");
			var chartPanel = stx.chart.panel,
				ctx = self.chart.context,
				segmentImage = self.chart.segmentImage || [],
				halfCandle = self.layout.candleWidth / 2;
			var left = (self.tickLeft = Math.max(
				stx.tickFromPixel(chartPanel.left + halfCandle),
				0
			));
			var right = (self.tickRight = Math.min(
				stx.tickFromPixel(chartPanel.right - halfCandle),
				stx.chart.dataSet.length - 1
			));
			var pLeft = (self.pixelLeft =
				self.pixelFromTick(left) -
				(segmentImage[left] ? segmentImage[left].candleWidth / 2 : halfCandle));
			var pRight = (self.pixelRight =
				self.pixelFromTick(right) +
				(segmentImage[right]
					? segmentImage[right].candleWidth / 2
					: halfCandle));
			var leftBoundary = subholder.offsetLeft,
				rightBoundary = leftBoundary + subholder.offsetWidth;
			ctx.save();
			ctx.beginPath();
			ctx.fillStyle = style.backgroundColor;
			ctx.fillRect(
				leftBoundary,
				subholder.offsetTop,
				pLeft - leftBoundary,
				subholder.offsetHeight
			);
			ctx.fillRect(
				rightBoundary,
				subholder.offsetTop,
				pRight - rightBoundary,
				subholder.offsetHeight
			);
			ctx.strokeStyle = style.borderTopColor;
			ctx.lineWidth = parseInt(style.borderWidth, 10);
			ctx.moveTo(pLeft, subholder.offsetTop);
			ctx.lineTo(pLeft, subholder.offsetTop + subholder.offsetHeight);
			ctx.moveTo(pRight, subholder.offsetTop);
			ctx.lineTo(pRight, subholder.offsetTop + subholder.offsetHeight);
			ctx.stroke();
			ctx.beginPath();
			ctx.lineWidth = parseInt(style.width, 10);
			ctx.lineCap = "round";
			ctx.moveTo(pLeft, subholder.offsetTop + subholder.offsetHeight / 4);
			ctx.lineTo(pLeft, subholder.offsetTop + (3 * subholder.offsetHeight) / 4);
			ctx.moveTo(pRight, subholder.offsetTop + subholder.offsetHeight / 4);
			ctx.lineTo(
				pRight,
				subholder.offsetTop + (3 * subholder.offsetHeight) / 4
			);
			ctx.stroke();
			ctx.restore();
		};
		stx.addEventListener("layout", function (obj) {
			obj.stx.slider.acceptLayoutChange(obj.stx.layout);
		});
		stx.addEventListener("preferences", function (obj) {
			const { language } = obj.stx.preferences;
			if (CIQ.I18N && self.preferences.language != language) {
				CIQ.I18N.setLocale(self, language);
			}
			self.preferences.language = language;
			self.draw();
		});
		stx.addEventListener("symbolChange", function (obj) {
			if (obj.action == "master") obj.stx.slider.setSymbol(obj.symbol);
		});
		stx.addEventListener("symbolImport", function (obj) {
			if (obj.action == "master") obj.stx.slider.setSymbol(obj.symbol);
			obj.stx.slider.acceptLayoutChange(obj.stx.layout);
		});
		stx.addEventListener("theme", function (obj) {
			self.clearPixelCache();
			self.styles = {};
			self.chart.container.style.backgroundColor = "";
			if (CIQ.ThemeHelper) {
				var helper = new CIQ.ThemeHelper({ stx: obj.stx });
				helper.params.stx = self;
				helper.update();
			}
		});
		stx.append("createDataSet", function () {
			this.slider.adjustRange(this.chart);
			this.slider.copyData(this.chart);
		});
		stx.append("draw", function () {
			if (!CIQ.trulyVisible(ciqSlider)) return;
			if (!self.chart.dataSet) return;
			this.slider.adjustRange(this.chart);
			this.slider.calculateYAxisPosition();
			self.draw();
			this.slider.drawSlider();
		});
		stx.prepend("resizeChart", function () {
			var ciqChart = chartContainer.parentElement,
				chartArea = ciqChart.parentElement;
			var totalHeightOfContainers = CIQ.elementDimensions(chartArea).height;
			var chartContainers = chartArea.querySelectorAll(".chartContainer");
			Array.from(chartContainers).forEach(function (container) {
				if (container !== chartContainer && CIQ.trulyVisible(container)) {
					totalHeightOfContainers -= CIQ.elementDimensions(
						container.parentElement,
						{
							border: 1,
							padding: 1,
							margin: 1
						}
					).height;
				}
			});
			ciqChart.style.height = totalHeightOfContainers + "px";
			if (this.layout.rangeSlider) {
				if (self.chart.breakpoint !== this.chart.breakpoint) {
					self.notifyBreakpoint(this.chart.breakpoint);
				}
				ciqSlider.style.display = "";
				self.resizeChart();
				self.initializeChart();
				self.draw();
				this.slider.drawSlider();
			} else {
				ciqSlider.style.display = "none";
			}
		});
		["mousedown", "touchstart", "pointerdown"].forEach(function (ev) {
			subholder.addEventListener(
				ev,
				function (e) {
					var start = self.backOutX(e.pageX);
					if (!start && start !== 0) return; // wrong event
					start -= e.target.offsetLeft;
					self.startDrag = start;
					self.startPixelLeft = self.pixelLeft;
					self.startPixelRight = self.pixelRight;
					var style = stx.slider.style;
					if (!style)
						style = stx.slider.style = stx.canvasStyle(
							"stx_range_slider shading"
						);
					var bw = parseInt(style.borderLeftWidth, 10);
					start += this.offsetLeft;
					if (start < self.pixelRight - bw) self.needsLeft = true;
					if (start > self.pixelLeft + bw) self.needsRight = true;
					if (CIQ.touchDevice) return;
					if (self.needsLeft && self.needsRight) {
						// change to grab only if drag started from viewport
						e.target.classList.add("stx-drag-chart");
					}
				},
				{ passive: false }
			);
		});
		["mouseup", "mouseover", "touchend", "pointerup"].forEach(function (ev) {
			subholder.addEventListener(ev, function (e) {
				const { which, type } = e;
				if (which === 1 && type !== "pointerup" && type !== "mouseup") return;
				e.target.classList.remove("stx-drag-chart");
				self.chart.panel.subholder.style.cursor = "ew-resize";
				self.startDrag = null;
				self.needsLeft = false;
				self.needsRight = false;
			});
		});
		["mousemove", "touchmove", "pointermove"].forEach(function (ev) {
			subholder.addEventListener(
				ev,
				function (e) {
					var startDrag = self.startDrag;
					if (!startDrag && startDrag !== 0) return;
					var touches = e.touches;
					var movement =
						(touches && touches.length
							? self.backOutX(touches[0].pageX)
							: self.backOutX(e.pageX)) - e.target.offsetLeft;
					if (!movement && movement !== 0) return; // wrong event
					movement -= startDrag;
					var tickLeft = self.tickLeft,
						tickRight = self.tickRight;
					var startPixelLeft = self.startPixelLeft,
						startPixelRight = self.startPixelRight;
					var needsLeft = self.needsLeft,
						needsRight = self.needsRight;
					if (needsLeft) {
						if (startPixelLeft + movement < self.chart.left)
							movement = self.chart.left - startPixelLeft;
						if (needsRight && startPixelRight + movement >= self.chart.right) {
							movement = self.chart.right - startPixelRight;
							if (!self.isHome()) movement += self.layout.candleWidth / 2; // force a right scroll
						}
						tickLeft = self.tickFromPixel(startPixelLeft + movement);
						if (needsRight)
							tickRight = tickLeft + self.tickRight - self.tickLeft;
					} else if (needsRight) {
						tickRight = Math.min(
							self.tickFromPixel(startPixelRight + movement),
							stx.chart.dataSet.length - 1
						);
					} else return;

					var newCandleWidth = stx.chart.width / (tickRight - tickLeft + 1);
					if (
						tickRight >= tickLeft &&
						newCandleWidth >= stx.minimumCandleWidth
					) {
						self.tickLeft = tickLeft;
						self.tickRight = tickRight;
						stx.chart.scroll = stx.chart.dataSet.length - tickLeft;
						if (!needsLeft || !needsRight) {
							stx.setCandleWidth(newCandleWidth);
						}
						stx.micropixels = 0;
						stx.draw();
					}
				},
				{ passive: false }
			);
		});
		this.adjustRange(stx.chart);
		this.copyData(stx.chart);
	};

};


let __js_addons_standard_shortcuts_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Displays a legend of keyboard shortcuts and the actions the shortcuts perform.
 *
 * Delegates display of the legend to the
 * [cq-floating-window]{@link WebComponents.cq-floating-window} web component by dispatching a
 * "floatingWindow" event (see
 * [floatingWindowEventListener]{@link CIQ.ChartEngine~floatingWindowEventListener}).
 *
 * Creates the legend from keyboard shortcut specifications contained in a configuration object;
 * for example, the default chart configuration object (see the {@tutorial Chart Configuration}
 * tutorial).
 *
 *  The keyboard shortcuts legend can be toggled using the Ctrl+Alt+K keystroke combination (see the
 * `shortcuts` action in `hotkeyConfig.hotkeys` in *js/defaultConfiguration.js*).
 *
 * Requires *addOns.js*.
 *
 * @param {object} params The constructor parameters.
 * @param {CIQ.ChartEngine} params.stx The chart engine instance for which the keyboard shortcuts
 * 		legend is created.
 * @param {object} params.config A configuration object that includes specifications for hot keys
 * 		and drawing tool keyboard shortcuts. Typically, this object is the chart configuration
 * 		object. See the {@tutorial Chart Configuration} tutorial for the data format for keyboard
 * 		shortcuts.
 * @param {number} [params.width="580"] The width of the floating window that contains the
 * 		keyboard shortcuts legend.
 * @param {boolean} [params.windowForEachChart=true] A flag that indicates whether each chart
 * 		instance in a multi-chart document has its own keyboard shortcuts legend. If false, all
 * 		charts share the same legend.
 *
 * @constructor
 * @name CIQ.Shortcuts
 * @since 8.2.0
 *
 * @example
 * new CIQ.Shortcuts(
 *     stx: stxx,
 *     config: {
 *         drawingTools: [{ label: "line", shortcut: "l" }],
 *         hotkeyConfig: {
 *             hotkeys: [{ label: "Pan chart up", action: "up", commands: ["ArrowUp", "Up"] }]
 *         }
 *     }
 * );
 */
CIQ.Shortcuts =
	CIQ.Shortcuts ||
	function ({ stx, width = 580, windowForEachChart = true, config } = {}) {
		if (!stx) {
			console.warn("The Shortcuts addon requires an stx parameter");
			return;
		}
		/**
		 * The chart engine instance for which the keyboard shortcuts legend is created.
		 *
		 * @type {CIQ.ChartEngine}
		 * @memberof CIQ.Shortcuts#
		 * @alias stx
		 * @since 8.2.0
		 */
		this.stx = stx;
		/**
		 * Width of the floating window that contains the keyboard shortcuts legend.
		 *
		 * @type {number}
		 * @memberof CIQ.Shortcuts#
		 * @alias width
		 * @since 8.2.0
		 */
		this.width = width;
		/**
		 * In a multi-chart document, indicates whether each chart has its own keyboard shortcuts
		 * legend. If false, all charts share the same legend.
		 *
		 * @type {boolean}
		 * @memberof CIQ.Shortcuts#
		 * @alias windowForEachChart
		 * @since 8.2.0
		 */
		this.windowForEachChart = windowForEachChart;
		this.content = this.getShortcutContent(config);
		this.enclosingContainer = stx.container.querySelector(".stx-subholder");

		this.ensureMessagingAvailable(stx);
		this.enableUI(stx);
		this.cssRequired = true;

		stx.shortcuts = this;

		if (CIQ.UI) {
			CIQ.UI.KeystrokeHub.addHotKeyHandler(
				"shortcuts",
				() => {
					document.body.keystrokeHub.context.advertised.Layout.showShortcuts();
				},
				stx
			);
		}
		const container = this.stx.container.closest("cq-context");
		const mo = new MutationObserver(
			() => (this.content = this.getShortcutContent(config))
		);
		mo.observe(container, { attributes: true });
	};

/**
 * Enables the keyboard shortcuts legend user interface.
 *
 * Adds a `showShortCuts` function to the {@link CIQ.UI.Layout} helper. The `showShortCuts`
 * function calls this class's [toggle]{@link CIQ.Shortcuts#toggle} function to show and hide the
 * keyboard shortcuts legend. Call `showShortCuts` in your application's user interface (see
 * example).
 *
 * This function is called when the add-on is instantiated.
 *
 * @param {CIQ.ChartEngine} stx The chart engine that provides the UI context for the keyboard
 * 		shortcuts legend.
 *
 * @memberof CIQ.Shortcuts#
 * @alias enableUI
 * @since 8.2.0
 *
 * @example <caption>Create a button that shows and hides the keyboard shortcuts legend.</caption>
 * <div class="ciq-footer full-screen-hide">
 *     <div class="shortcuts-ui ciq-shortcut-button"
 *          stxtap="Layout.showShortcuts()"
 *          title="Toggle shortcut legend">
 *     </div>
 * </div>
 */
CIQ.Shortcuts.prototype.enableUI = function (stx) {
	if (!(stx && CIQ.UI)) return;
	setTimeout(() => {
		const layout = stx.uiContext.getAdvertised("Layout");
		layout.showShortcuts = (node, value) => this.toggle(value);
	});
};

/**
 * Ensures that an instance of the [cq-floating-window]{@link WebComponents.cq-floating-window}
 * web component is available to handle event messaging and create the shortcuts legend floating
 * window.
 *
 * This function is called when the add-on is instantiated.
 *
 * @param {CIQ.ChartEngine} stx The chart engine that provides the UI context, which contains the
 * [cq-floating-window]{@link WebComponents.cq-floating-window} web component.
 *
 * @memberof CIQ.Shortcuts#
 * @alias ensureMessagingAvailable
 * @since 8.2.0
 */
CIQ.Shortcuts.prototype.ensureMessagingAvailable = function (stx) {
	setTimeout(() => {
		const contextContainer = stx.uiContext.topNode;
		if (!contextContainer.querySelector("cq-floating-window")) {
			contextContainer.append(document.createElement("cq-floating-window"));
		}
	});
};

/**
 * Creates the contents of the keyboard shortcuts legend based on specifications contained in a
 * configuration object. The contents are displayed in a
 * [cq-floating-window]{@link WebComponents.cq-floating-window} web component.
 *
 * This function is called when the add-on is instantiated.
 *
 * @param {object} config A configuration object that includes specifications for drawing tool
 * 		keyboard shortcuts and hot keys. Typically, this object is the chart configuration object
 * 		(see the {@tutorial Chart Configuration} tutorial).
 * @return {string} The keyboard shortcuts legend as HTML.
 *
 * @memberof CIQ.Shortcuts#
 * @alias getShortcutContent
 * @since 8.2.0
 */
CIQ.Shortcuts.prototype.getShortcutContent = function (config) {
	const drawingToolShortcuts = (config.drawingTools || [])
		.filter((tool) => tool.shortcut)
		.map(
			({ label, shortcut }) =>
				`<div class="ciq-shortcut">
					<div>${label}</div>
					<div><span>Alt</span> + <span>${shortcut.toUpperCase()}</span></div>
				</div>`
		)
		.join("");

	// Alt + key combination produces unpredictable accent characters depending on keyboard mapping
	// default hotkeys include them for better coverage, avoid displaying them in legend
	const isAscii = (str) => str.charCodeAt(str.length - 1) < 127;
	const wrapKeys = (str) =>
		str === " + "
			? "<span>+</span>"
			: str
					.split("+")
					.map((el) => (el && el !== " " ? "<span>" + el + "</span>" : ""))
					.join(" + ");

	const commandsToString = (commands) => {
		return commands
			.map((command) => command.replace(/Arrow|Key|Digit|^ | $/g, ""))
			.map((command) => command.replace(/\+/, " + "))
			.reduce(
				(acc, command) =>
					!acc.includes(command) && isAscii(command)
						? acc.concat(command)
						: acc,
				[]
			)
			.map(wrapKeys)
			.join("<br>");
	};

	const container = this.stx.container.closest("cq-context");
	const extensionAvailable = (name) =>
		container.hasAttribute(name.toLowerCase() + "-active");
	const hotkeys = ((config.hotkeyConfig && config.hotkeyConfig.hotkeys) || [])
		.map(({ label, action, commands, extension }) => {
			if (extension && !extensionAvailable(extension)) {
				return "";
			}
			return `<div class="ciq-shortcut"><div>${
				label || action
			}</div><div>${commandsToString(commands)}</div></div>`;
		})
		.join("");

	return `
		<div class="ciq-shortcut-container">
			<div>
				<div><b>Drawing tools shortcuts</b></div>
				<div>${drawingToolShortcuts}</div>
			</div>
			<hr>
			<div>
				<div><b>Hotkeys</b></div>
				<div>${hotkeys}</div>
			</div>
		</div>
	`;
};

/**
 * Opens and closes the floating window that contains the keyboard shortcuts legend.
 *
 * @param {boolean} [value] If true, the window is opened. If false, the window is closed.
 * 		If not provided, the window state is toggled. That is, the window is opened if it is
 * 		currently closed; closed, if it is currently open.
 *
 * @memberof CIQ.Shortcuts#
 * @alias toggle
 * @since 8.2.0
 */
CIQ.Shortcuts.prototype.toggle = function (value) {
	this.stx.dispatch("floatingWindow", {
		type: "shortcut",
		title: "Shortcuts",
		content: this.content,
		container: this.enclosingContainer,
		onClose: () => (this.closed = true),
		width: this.width,
		status: value,
		tag: this.windowForEachChart ? undefined : "shortcut"
	});
};

};


let __js_addons_standard_tableView_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Creates an overlay that displays the visible chart data segment as a table.
 *
 * The overlay includes controls that enable users to copy the table data to the clipboard or
 * download the data as a character-separated values (CSV) file. See
 * {@link TableViewBuilder.dataToCsv} for the default separator character.
 *
 * The table view can be opened using the Alt+K keystroke combination and closed using the Escape
 * key (see the `tableView` action in `hotkeyConfig.hotkeys` in *js/defaultConfiguration.js*).
 *
 * Requires *addOns.js*.
 *
 * @param {object} params Configuration parameters.
 * @param {CIQ.ChartEngine} params.stx A reference to the chart engine that contains the chart for
 * 		which the table view is created.
 * @param {string} [params.minColumnWidth="84px"] The minimum width (including units) of the
 * 		table columns. **Note:** The units can be any CSS unit acceptable by the CSS `calc`
 * 		function.
 * @param {number} [params.coverUIMaxWidth=400] The chart width (in pixels) below which the table
 * 		view covers the entire chart, including user interface elements (symbol input field,
 * 		menus, etc.). For example, if the value of this parameter is 1000, the table view covers
 * 		the entire chart area if the chart width is <= 999 pixels.
 * @param {string} [params.coverContainer] A CSS selector used to obtain the DOM element that
 * 		ultimately contains the table view; for example, ".chartContainer".
 * @param {boolean} [params.usePreviousCloseForChange=true] Indicates whether the closing price of
 * 		the previous data point should be used instead of the opening price of the current data
 * 		point to determine the amount of change for the current data point; that is,
 * 		(current close - previous close) or (current close - current open).
 *
 * @constructor
 * @name CIQ.TableView
 * @since 8.1.0
 *
 * @example
 * new CIQ.TableView({ stx: stxx });
 */
CIQ.TableView =
	CIQ.TableView ||
	function ({
		stx,
		minColumnWidth = "84px",
		coverUIMaxWidth = 400,
		coverContainer,
		usePreviousCloseForChange = true
	} = {}) {
		if (!stx) {
			console.warn("The TableView addon requires an stx parameter");
			return;
		}

		/**
		 * The chart engine instance that contains the chart for which the table view is created.
		 *
		 * @type CIQ.ChartEngine
		 * @memberof CIQ.TableView#
		 * @alias stx
		 * @since 8.1.0
		 */
		this.stx = stx;
		/**
		 * Toggle to display and hide additional table view columns, such as % Change and Volume.
		 *
		 * **Note:** Data in the additional columns might not be present in the chart view because
		 * the data is calculated (for example, % Change) or is not part of the standard chart
		 * display (for example, Volume &mdash; which can be displayed with the
		 * [Volume Chart]{@link CIQ.Studies.createVolumeChart} study).
		 *
		 * @type boolean
		 * @memberof CIQ.TableView#
		 * @alias viewAdditionalColumns
		 * @since 8.1.0
		 */
		this.viewAdditionalColumns = false;
		/**
		 * Minimum width of the table view columns, including units. The units can be any CSS
		 * unit acceptable by the CSS `calc` function.
		 *
		 * @type string
		 * @memberof CIQ.TableView#
		 * @alias minColumnWidth
		 * @since 8.1.0
		 */
		this.minColumnWidth = minColumnWidth;
		/**
		 * The chart width in pixels below which the table view covers the entire chart, including
		 * user interface elements, such as the menus and footer.
		 *
		 * @type number
		 * @memberof CIQ.TableView#
		 * @alias coverUIMaxWidth
		 * @since 8.1.0
		 */
		this.coverUIMaxWidth = coverUIMaxWidth;
		/**
		 * A CSS selector used to obtain the DOM element that hosts the table view.
		 *
		 * @type string
		 * @memberof CIQ.TableView#
		 * @alias coverContainer
		 * @since 8.1.0
		 */
		this.coverContainer = coverContainer;
		/**
		 * If true, the closing price of the previous data point is used instead of the opening
		 * price of the current data point to determine the amount of change for the current data
		 * point.
		 *
		 * @type boolean
		 * @memberof CIQ.TableView#
		 * @alias usePreviousCloseForChange
		 * @since 8.1.0
		 */
		this.usePreviousCloseForChange = usePreviousCloseForChange;
		/**
		 * A reference to the {@link TableViewBuilder} namespace for access to the namespace
		 * static methods.
		 *
		 * @type TableViewBuilder
		 * @memberof CIQ.TableView#
		 * @alias builder
		 * @since 8.1.0
		 */
		this.builder = TableViewBuilder;

		this.listeners = [];

		stx.tableView = this;
		this.cssRequired = true;

		if (CIQ.UI) {
			CIQ.UI.observeProperty("uiContext", stx, ({ value: uiContext }) => {
				if (!uiContext) return;

				setTimeout(() => {
					this.subscribeToChanges(uiContext);

					// Updated hotkey alias if available to action
					const tableViewKeyEntry = CIQ.getFromNS(
						uiContext.config,
						"hotkeyConfig.hotkeys",
						[]
					).find(({ action }) => action === "tableView");
					if (tableViewKeyEntry) {
						tableViewKeyEntry.action = () => {
							const { tableView } = document.body.keystrokeHub.context.stx;
							if (tableView) {
								tableView.toggle();
								return true;
							}
						};
					}
				});
			});
		}
	};

/**
 * Displays the table view.
 *
 * @param {object} [params] Configuration parameters.
 * @param {object} [params.config] Table column information.
 * @param {function} [params.onClose] Callback function to execute on closing the table view. The
 * 		callback enables synchronization of state in the application when the table view is
 * 		closed.
 *
 * @memberof CIQ.TableView#
 * @alias open
 * @since 8.1.0
 */
CIQ.TableView.prototype.open = function (params) {
	if (params) {
		this.params = params;
	}
	const { config = {}, onClose } = this.params || {};
	if (this.view) {
		this.close(false);
	}
	config.minColumnWidth = this.minColumnWidth;
	config.coverUIMaxWidth = this.coverUIMaxWidth;
	config.coverContainer = this.coverContainer;
	this.onClose = onClose;
	this.view = this.builder.createTable(this.stx, config);
	if (!this.view) return;
	const { stx } = this;
	const close = this.close.bind(this);

	setTimeout(() => (this.removeCloseListener = getCloseListener(this)));

	function getCloseListener(self) {
		const contextNode = stx.uiContext.topNode;
		const withinTable = (el) => el.closest(".ciq-data-table-container");

		const closeHandler = ({ target }) => !withinTable(target) && close();
		contextNode.addEventListener("click", closeHandler);
		const handleKeydown = (e) => {
			if (e.code === "Escape") {
				const { tableView } = document.body.keystrokeHub.context.stx;
				if (tableView) {
					tableView.close();
					e.preventDefault();
				}
			}
		};
		document.body.addEventListener("keydown", handleKeydown);

		// Use modal functionality available in menu
		const uiManager = CIQ.getFn("UI.getUIManager")();
		if (uiManager) {
			// Menu item requires show and hide providing no-op functions
			self.view.show = self.view.hide = function () {};
			uiManager.openMenu(self.view, {});
		}
		return () => {
			contextNode.removeEventListener("click", closeHandler);
			document.body.removeEventListener("keydown", handleKeydown);
			if (uiManager) uiManager.closeMenu(self.view);
		};
	}
};

/**
 * Closes the table view.
 *
 * @param {boolean} [notify=true] Indicates whether the `onClose` callback function is set (see
 * 		[open]{@link CIQ.TableView#open}).
 *
 * @memberof CIQ.TableView#
 * @alias close
 * @since 8.1.0
 */
CIQ.TableView.prototype.close = function (notify = true) {
	if (this.view) {
		this.view.remove();
		this.view = null;
	}
	if (notify && this.onClose) {
		this.onClose();
	}

	if (this.removeCloseListener) {
		this.removeCloseListener();
		this.removeCloseListener = null;
	}
};

/**
 * Opens the table view if it is closed. Closes the table view if it is open.
 *
 * @memberof CIQ.TableView#
 * @alias toggle
 * @since 8.1.0
 */
CIQ.TableView.prototype.toggle = function () {
	this[this.view ? "close" : "open"]();
};

/**
 * Subscribes to changes in the table view component communication channel, which enables other
 * components to open and close the table view.
 *
 * @param {CIQ.UI.Context} uiContext The user interface context of the table view. Provides the
 * 		communication channel path that identifies the table view channel.
 * @param {string} [channelPath] Specifies the channel path if the path is not available in the
 * 		context configuration provided by `uiContext`.
 *
 * @memberof CIQ.TableView#
 * @alias subscribeToChanges
 * @since 8.1.0
 */
CIQ.TableView.prototype.subscribeToChanges = function (
	uiContext,
	channelPath = "channels.tableView"
) {
	const { channelSubscribe, channelWrite } = CIQ.UI.BaseComponent.prototype;
	const { channels: { tableView = channelPath } = {} } = uiContext.config || {};
	const { stx } = this;

	channelSubscribe(
		tableView,
		(value) => {
			if (value) {
				stx.tableView.open({
					onClose: () => {
						channelWrite(tableView, false, stx);
					}
				});
			} else {
				stx.tableView.close();
			}
		},
		stx
	);
};

/**
 * Namespace for {@link CIQ.TableView} creation&ndash;related properties and functions.
 *
 * @namespace
 * @name TableViewBuilder
 * @since 8.1.0
 */
function TableViewBuilder() {}

/**
 * The column header configuration for the table view.
 *
 * Can be used for rearranging the column order, removing columns, and updating labels.
 *
 * **Note:** Adding new columns has no effect.
 *
 * @type Object.<string, {label: string, cls: string|undefined}>
 * @memberof TableViewBuilder
 * @since 8.1.0
 */
TableViewBuilder.colHeaders = {
	date: { label: "Date/Time" },
	open: { label: "Open" },
	high: { label: "High" },
	low: { label: "Low" },
	close: { label: "Close" },
	pctChange: { label: "% Change", cls: "ciq-extra" },
	pctChangeVsAvg: { label: "% Change vs Average", cls: "ciq-extra" },
	volume: { label: "Volume", cls: "ciq-extra" }
};

/**
 * Number of decimal places to display for percent formatted columns
 *
 * @type number
 * @memberof TableViewBuilder
 * @since 8.1.0
 */
TableViewBuilder.percentDecimalPlaces = 2;

/**
 * Creates a table view as an HTMLElement overlay over a chart container. The table view displays
 * a snapshot of the visible chart data segment.
 *
 * The overlay contains buttons for copying and saving the table data and for displaying
 * additional table columns.
 *
 * @param {CIQ.ChartEngine} stx A reference to the chart engine that contains the chart for which
 * 		the table view is created.
 * @param {object} [config] Configuration parameters.
 * @param {function} [config.dateFormatter] Formats table date fields.
 * @param {function} [config.valueFormatter] Formats table values.
 * @param {function} [config.volumeFormatter] Formats the table volume field.
 * @param {function} [config.fileNameFormatter] Formats the name of the file that contains the
 * 		downloaded table data.
 * @param {string} [config.minColumnWidth="84px"] The minimum width (including units) of the
 * 		table columns. **Note:** The units can be any CSS unit acceptable by the CSS `calc`
 * 		function.
 * @return {HTMLElement}
 *
 * @memberof TableViewBuilder
 * @since 8.1.0
 */
TableViewBuilder.createTable = function (stx, config = {}) {
	if (!stx.chart || !stx.chart.dataSegment) return;

	const { builder } = stx.tableView;
	const {
		getChartData,
		dataToHtml,
		dataToCsv,
		downloadCsv,
		getDateFormatter,
		getValueFormatter,
		getVolumeFormatter,
		getFilenameFormatter,
		getSeriesDataNames,
		getStudyDataNames,
		getChartCover
	} = builder;

	const colHeaders = Object.assign({}, this.colHeaders);

	if (!stx.chart.highLowBars) {
		delete colHeaders.open;
		delete colHeaders.high;
		delete colHeaders.low;
	}

	if (!stx.tableView.viewAdditionalColumns) {
		for (let key in colHeaders) {
			if (colHeaders[key].cls) {
				delete colHeaders[key];
			}
		}
	}

	const labels = Object.values(colHeaders).map((item) => item.label);

	const seriesNames = getSeriesDataNames(stx);
	seriesNames.forEach((item) => (colHeaders[item] = { label: item }));

	const studyNames = getStudyDataNames(stx);
	studyNames.forEach((item) => {
		if (!labels.includes(item)) colHeaders[item] = { label: item };
	});

	const additionalDataFields = seriesNames.concat(studyNames);

	const {
		dateFormatter = getDateFormatter(stx),
		valueFormatter = getValueFormatter(stx),
		percentFormatter = getValueFormatter(stx, this.percentDecimalPlaces),
		volumeFormatter = getVolumeFormatter(stx),
		fileNameFormatter = getFilenameFormatter(stx),
		minColumnWidth = "84px"
	} = config;

	const arr = getChartData(stx, {
		dateFormatter,
		valueFormatter,
		percentFormatter,
		volumeFormatter,
		additionalDataFields
	});

	const cover = getChartCover(stx, config);
	const { symbolDisplay, symbol } = stx.chart;

	const toolbar = builder.getCoverToolbar({
		symbol: symbolDisplay || symbol,
		viewAdditionalColumns: stx.tableView.viewAdditionalColumns,
		copyFn,
		downloadFn,
		toggleAdditionalColumnsFn: () => {
			const { tableView } = stx;
			tableView.viewAdditionalColumns = !tableView.viewAdditionalColumns;
			tableView.open();
		},
		closeFn: () => stx.tableView.close()
	});
	cover.appendChild(toolbar);

	setTimeout(() => {
		const htmlTable = dataToHtml(arr, { colHeaders, minColumnWidth });
		cover.appendChild(htmlTable);
		const scrollbarStyling = CIQ.getFromNS(
			stx,
			"uiContext.config.scrollbarStyling"
		);
		if (scrollbarStyling) {
			scrollbarStyling.refresh(cover.querySelector("tbody"));
			scrollbarStyling.refresh(cover.querySelector(".ciq-data-table-wrapper"), {
				suppressScrollY: true
			});
		}
		if (CIQ.I18N && CIQ.I18N.localized) CIQ.I18N.translateUI(null, cover);
		cover.classList.remove("loading");
	});

	return cover;

	function copyFn() {
		const contentEl = document.createElement("textArea");
		document.body.appendChild(contentEl);
		contentEl.textContent = dataToCsv(arr, { colHeaders });
		contentEl.select();
		document.execCommand("copy");
		contentEl.remove();
		stx.dispatch("notification", "copytoclipboard");
	}

	function downloadFn() {
		const csvData = dataToCsv(arr, { colHeaders });
		const fileName = fileNameFormatter(csvData);
		downloadCsv(csvData, fileName);
	}
};

/**
 * Creates an HTML table containing the chart data and column headers (see
 * {@link TableViewBuilder.colHeaders}).
 *
 * @param {object[]} data The chart data.
 * @param {object} params Configuration parameters.
 * @param {Object.<string, {label: string, cls: string|undefined}>} params.colHeaders The column
 * 		headers as defined in {@link TableViewBuilder.colHeaders}.
 * @param {string} [params.minColumnWidth] The minimum width of the table columns, including units.
 * 		**Note:** The units can be any CSS unit acceptable by the CSS `calc` function.
 * @return {HTMLElement} A table containing the chart data and column headers.
 *
 * @memberof TableViewBuilder
 * @since 8.1.0
 */
TableViewBuilder.dataToHtml = function (data, { colHeaders, minColumnWidth }) {
	const keyLength = Object.keys(colHeaders).length;
	const colWidth = `calc((100% - ${10 + keyLength * 4}px ) / ${keyLength})`;
	const tableHeader = Object.entries(colHeaders).map(([, { label }], index) => {
		return `<th
			scope="col"
			style="width: ${colWidth};"
			>${label.replace("(", "  (")}</th>`;
	});

	const tableRows = data.map((row) => {
		const htmlRow = Object.keys(colHeaders)
			.map((key, index) => {
				const value = row[key];
				return index === 0
					? `<th scope="row"
								style="width: ${colWidth}"
								>${value}</th>`
					: `<td style="width: ${colWidth}">${value}</td>`;
			})
			.join("");
		return `<tr>${htmlRow}</tr>`;
	});

	const tableWrapper = document.createElement("div");
	tableWrapper.classList.add("ciq-data-table-wrapper");
	const minWidth = minColumnWidth
		? `calc(${keyLength} * ${minColumnWidth})`
		: "";
	tableWrapper.innerHTML = `
		<table class="header-fixed"	${minWidth ? `style="min-width: ${minWidth}"` : ""}>
		<thead>${tableHeader.join("")}</thead>
		<tbody>${tableRows.join("")}</tbody>
		</table>`;
	return tableWrapper;
};

/**
 * Transforms the chart data into a character-separated values (CSV) file, including column headers.
 *
 * @param {object[]} data The chart data.
 * @param {object} params Configuration parameters.
 * @param {Object.<string, {label: string, cls: string|undefined}>} params.colHeaders The column
 * 		headers as defined in {@link TableViewBuilder.colHeaders}.
 * @param {string} params.colSeparator="\t" The column separator for the CSV format.
 * @return {string} The column headers and chart data as a CSV file.
 *
 * @memberof TableViewBuilder
 * @since 8.1.0
 */
TableViewBuilder.dataToCsv = function (
	data,
	{ colHeaders, colSeparator = "\t" }
) {
	const tableHeader = Object.entries(colHeaders)
		.map(([, { label }]) => `"${label}"`)
		.join(colSeparator);

	const tableRows = data.map((row) => {
		return Object.keys(colHeaders)
			.map((key) => `"${row[key]}"`)
			.join(colSeparator);
	});

	return `${tableHeader}\n${tableRows.join("\n")}`;
};

/**
 * Downloads the table view as a character-separated values (CSV) file.
 *
 * @param {string} csvString The table view in the form of character-separated data.
 * @param {string} filename The name given to the download file.
 *
 * @memberof TableViewBuilder
 * @since 8.1.0
 */
TableViewBuilder.downloadCsv = function (csvString, filename = "filename") {
	const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });

	const a = document.createElement("a");
	a.href = window.URL.createObjectURL(blob, { type: "text/plain" });
	a.download = `${filename}.csv`;
	a.style.display = "none";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
};

/**
 * Extracts OHLC (open, high, low, close) data from the chart.
 *
 * @param {CIQ.ChartEngine} stx A reference to the chart engine that contains the chart from which
 * 		the data is extracted.
 * @param {object} params Configuration parameters.
 * @param {function} [params.dateFormatter] Formats date fields.
 * @param {function} [params.valueFormatter] Formats OHLC and other values.
 * @param {function} [params.percentFormatter] Formats percent fields.
 * @param {function} [params.volumeFormatter] Formats the volume field.
 * @param {string[]} [params.additionalDataFields] An array of additional data field names for
 * 		comparison series and study data.
 * @return {object[]} The formatted chart data.
 *
 * @memberof TableViewBuilder
 * @since 8.1.0
 */
TableViewBuilder.getChartData = function (
	stx,
	{
		dateFormatter,
		valueFormatter,
		percentFormatter,
		volumeFormatter,
		additionalDataFields
	}
) {
	const data = stx.chart.dataSegment.filter((item) => item !== null);
	const { usePreviousCloseForChange } = stx.tableView;
	let out = [];
	let length = 0;
	const avgPctChange =
		data.reduce((acc, { Close, iqPrevClose, Open }) => {
			const Base = usePreviousCloseForChange ? iqPrevClose : Open;
			if (
				typeof Close === "undefined" ||
				Number.isNaN(Close) ||
				typeof Base === "undefined" ||
				Number.isNaN(Base)
			) {
				return acc;
			}
			length++;
			return acc + (Close - Base) / Base;
		}, 0) / length;
	data.forEach((item, index) => {
		const {
			DT,
			displayDate,
			High,
			Low,
			Open,
			Close,
			iqPrevClose,
			Volume
		} = item;
		const Base = usePreviousCloseForChange ? iqPrevClose : Open;
		const pctChange = (Close - Base) / Base;
		const date =
			displayDate ||
			(stx.displayZone
				? CIQ.convertTimeZone(DT, stx.dataZone, stx.displayZone)
				: DT);
		const obj = {
			DT,
			date: dateFormatter(date),
			open: valueFormatter(Open),
			close: valueFormatter(Close),
			change: valueFormatter(Close - Base),
			pctChange: percentFormatter(pctChange * 100),
			pctChangeVsAvg: percentFormatter((pctChange - avgPctChange) * 100),
			high: valueFormatter(High),
			low: valueFormatter(Low),
			volume: volumeFormatter(Volume)
		};
		additionalDataFields.forEach((fieldName) => {
			let value = item[fieldName];
			if (value == null) {
				obj[fieldName] = "";
				return;
			}
			if (typeof value === "object") {
				value = value.Close;
			}
			obj[fieldName] = valueFormatter(value);
		});

		out.push(obj);
	});
	out.sort((a, b) => b.DT - a.DT);
	return out;
};

/**
 * Creates a function that formats table view date fields.
 *
 * @param {CIQ.ChartEngine} stx A reference to the chart engine that contains the chart for which
 * 		the date fields are formatted.
 * @return {function} A date formatter.
 *
 * @memberof TableViewBuilder
 * @since 8.1.0
 */
TableViewBuilder.getDateFormatter = function (stx) {
	return (dt, panel) => {
		if (!dt) return "";

		return CIQ.displayableDate(stx, stx.chart, dt, true);
	};
};

/**
 * Creates a function that formats table view value fields.
 *
 * @param {CIQ.ChartEngine} stx A reference to the chart engine that contains the chart for which
 * 		the value fields are formatted.
 * @param {number} [decimalPlaces] Number of decimal places to use, overrides any auto-detection of decimal places in data.
 * @return {function} A value formatter.
 *
 * @memberof TableViewBuilder
 * @since 8.1.0
 */
TableViewBuilder.getValueFormatter = function (stx, decimalPlaces) {
	const {
		chart: { panel, yAxis },
		layout: { chartScale }
	} = stx;
	let formatValue;

	if (yAxis.originalPriceFormatter && yAxis.originalPriceFormatter.func) {
		formatValue = (value) =>
			yAxis.originalPriceFormatter.func(stx, panel, value, decimalPlaces);
	} else if (
		yAxis.priceFormatter &&
		chartScale != "percent" &&
		chartScale != "relative"
	) {
		formatValue = (value) =>
			yAxis.priceFormatter(stx, panel, value, decimalPlaces);
	} else {
		formatValue = (value) => stx.formatYAxisPrice(value, panel, decimalPlaces);
	}

	return (value) => formatValue(value).replace(/^-*0\.0*$/, "0"); // display 0.00 as 0
};

/**
 * Creates a function that formats the table view volume field.
 *
 * @param {CIQ.ChartEngine} stx A reference to the chart engine that contains the chart for which
 * 		the volume field is formatted.
 * @return {function} A volume field formatter.
 *
 * @memberof TableViewBuilder
 * @since 8.1.0
 */
TableViewBuilder.getVolumeFormatter = function (stx) {
	return (num) => {
		if (num == null) return "";

		if (stx.internationalizer) {
			return stx.internationalizer.priceFormatters[0].format(num);
		}

		const num_parts = num.toString().split(".");
		num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		return num_parts[0];
	};
};

/**
 * Creates a function that creates and formats a file name from the chart symbol and table view
 * data.
 *
 * @param {CIQ.ChartEngine} stx A reference to the chart engine that contains the chart whose
 * 		symbol and data is included in the file name.
 * @return {function} A function that creates and formats a file name.
 *
 * @memberof TableViewBuilder
 * @since 8.1.0
 */
TableViewBuilder.getFilenameFormatter = function (stx) {
	return (csvData) => {
		const symbol = stx.chart.symbolDisplay || stx.chart.symbol;
		let firstDate, lastDate;
		if (csvData) {
			const rows = csvData.split("\n");
			if (rows.length > 1) {
				[, firstDate = ""] = rows[1].match(/^"([^"]*)"/) || [];
				[, lastDate = ""] = rows[rows.length - 1].match(/^"([^"]*)"/) || [];
				firstDate = firstDate.replace(/:/g, ".").replace(/\//g, "-");
				lastDate = lastDate.replace(/:/g, ".").replace(/\//g, "-");
			}
		}
		return `${symbol}${firstDate ? ` (${firstDate} _ ${lastDate})` : ""}`;
	};
};

/**
 * Creates and attaches an HTML container element to the DOM. The element covers the chart and
 * contains the table view.
 *
 * @param {CIQ.ChartEngine} stx A reference to the chart engine that contains the chart over which
 * 		the cover is placed.
 * @param {object} params Configuration parameters.
 * @param {number} [params.coverUIMaxWidth] The width of the chart (in pixels) below which the
 * 		cover element overlays the entire chart, including user interface elements.
 * @param {string} [params.coverContainer] A CSS selector used to obtain the DOM element that
 * 		serves as the parent element of the cover element; for example, ".chartContainer".
 * @return {HTMLElement} The cover element.
 *
 * @memberof TableViewBuilder
 * @since 8.1.0
 */
TableViewBuilder.getChartCover = function (
	stx,
	{ coverUIMaxWidth, coverContainer }
) {
	const parentElement =
		(coverContainer && document.querySelector(coverContainer)) ||
		(stx.uiContext && stx.container.offsetWidth < coverUIMaxWidth
			? stx.uiContext.topNode
			: stx.container.parentElement.parentElement);

	const cover = document.createElement("div");
	Object.assign(cover.style, { top: 0, left: 0, right: 0, bottom: 0 });

	cover.classList.add("ciq-data-table-container", "loading");

	const spinner = document.createElement("div");
	spinner.classList.add("ciq-spinner-wrapper");
	spinner.innerHTML = `<span class="ciq-spinner"></span>`;

	cover.appendChild(spinner);

	parentElement.appendChild(cover);
	return cover;
};

/**
 * Creates a toolbar containing the table title and controls used to copy and download the table
 * data and add additional table columns.
 *
 * @param {object} params Function parameters.
 * @param {string} params.symbol An instrument symbol, which is used as the table title in the
 * 		toolbar. Should be the symbol of the chart main series.
 * @param {boolean} params.viewAdditionalColumns Toggle that specifies whether the label for the
 * 		additional columns button should indicate that additional columns will be shown or hidden.
 * 		If this parameter is true, the label indicates additional table columns will be shown; if
 * 		false, hidden.
 * @param {function} [params.copyFn] Event handler for selection of the copy control.
 * @param {function} [params.downloadFn] Event handler for selection of the download control.
 * @param {function} [params.toggleAdditionalColumnsFn] Event handler for selection of the
 * 		additional column control.
 * @param {function} [params.closeFn] Event handler for selection of the table view close (X)
 * 		control.
 * @return {HTMLElement} The toolbar, containing title and controls.
 *
 * @memberof TableViewBuilder
 * @since 8.1.0
 */
TableViewBuilder.getCoverToolbar = function ({
	symbol,
	viewAdditionalColumns,
	copyFn,
	downloadFn,
	toggleAdditionalColumnsFn,
	closeFn
}) {
	const toolBar = document.createElement("div");
	toolBar.classList.add("ciq-data-table-toolbar");
	toolBar.innerHTML = `
		<div class="ciq-data-table-title"></div>
		<button class="ciq-data-table-copy">${this.copyLabel}</button>
		<button class="ciq-data-table-download">${this.downloadLabel}</button>
		<button class="ciq-data-table-additionalColumns">${this.getAdditionalColumnLabel(
			viewAdditionalColumns
		)}</button>
		<cq-close />
	`;
	const titleEl = toolBar.querySelector(".ciq-data-table-title");
	titleEl.textContent = symbol;

	const btnCopy = toolBar.querySelector(".ciq-data-table-copy");
	if (copyFn) {
		btnCopy.addEventListener("click", copyFn);
	} else {
		btnCopy.style.display = "none";
	}

	const btnDownload = toolBar.querySelector(".ciq-data-table-download");
	if (downloadFn) {
		btnDownload.addEventListener("click", function () {
			btnDownload.blur();
			downloadFn();
		});
	} else {
		btnDownload.style.display = "none";
	}

	const btnAdditionalColumns = toolBar.querySelector(
		".ciq-data-table-additionalColumns"
	);
	if (toggleAdditionalColumnsFn) {
		btnAdditionalColumns.addEventListener("click", toggleAdditionalColumnsFn);
	} else {
		btnAdditionalColumns.style.display = "none";
	}

	toolBar.close = closeFn;

	return toolBar;
};

/**
 * Label for the copy button on the table view toolbar.
 *
 * @type string
 * @memberof TableViewBuilder
 * @since 8.1.0
 */
TableViewBuilder.copyLabel = "Copy";

/**
 * Label for the download button on the table view toolbar.
 *
 * @type string
 * @memberof TableViewBuilder
 * @since 8.1.0
 */
TableViewBuilder.downloadLabel = "Download";

/**
 * Gets the label of the additional columns button on the table view toolbar.
 *
 * @param {boolean} viewingAdditionalColumns If this parameter is true, the label should indicate
 * 		additional table columns will be shown; if false, hidden.
 * @return {string} The button label.
 *
 * @memberof TableViewBuilder
 * @since 8.1.0
 */
TableViewBuilder.getAdditionalColumnLabel = function (
	viewingAdditionalColumns
) {
	return `<span>${
		viewingAdditionalColumns ? "- " : "+ "
	}</span>Additional columns`;
};

/**
 * Obtains the names of all studies that have data in the chart's visible data segment.
 *
 * @param {CIQ.ChartEngine} stx A reference to the chart engine that contains the chart studies.
 * @return {string[]} The names of all studies that are in the visible portion of the chart.
 *
 * @memberof TableViewBuilder
 * @since 8.1.0
 */
TableViewBuilder.getStudyDataNames = function (stx) {
	return Object.values(stx.layout.studies || {})
		.map(getDataNames)
		.reduce((acc, item) => acc.concat(item), []);

	function getDataNames(study) {
		return Object.keys(study.outputMap).filter(hasData);
	}

	function hasData(name) {
		return stx.chart.dataSegment.some((data) => data && data[name]);
	}
};

/**
 * Obtains the symbols of all comparison series that have data in the chart's visible data
 * segment.
 *
 * @param {CIQ.ChartEngine} stx A reference to the chart engine that contains the comparison
 * 		series.
 * @return {string[]} The names (symbols) of all comparison series that are in the visible
 * 		portion of the chart.
 *
 * @memberof TableViewBuilder
 * @since 8.1.0
 */
TableViewBuilder.getSeriesDataNames = function (stx) {
	return Object.values(stx.chart.seriesRenderers || {})
		.filter((item) => item.params.name !== "_main_series")
		.map((item) => {
			return item.seriesParams.map(({ symbol }) => symbol);
		})
		.reduce((acc, item) => acc.concat(item), []);
};

/**
 * CIQ.UI.Context interface placeholder to be augmented in *componentUI.js* with properties.
 *
 * @tsinterface CIQ.UI~Context
 */

};


let __js_addons_standard_tooltip_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */


var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

if (!CIQ.Marker) {
	console.error("tooltip addon requires first activating markers feature.");
} else {
	/**
	 * Add-on that creates a detailed tooltip as the user's mouse hovers over data points on the
	 * chart. The tooltip contains information such as the open, high, low, and close prices of
	 * stock quotes.
	 *
	 * Tooltip example:
	 * <iframe width="800" height="500" scrolling="no" seamless="seamless" align="top"
	 *         style="float:top"
	 *         src="https://jsfiddle.net/chartiq/5kux6j8p/embedded/result,js,html/"
	 *         allowfullscreen="allowfullscreen" frameborder="1">
	 * </iframe>
	 *
	 * **Note:** Prior to version 8.2.0, the tooltip was directly linked to the crosshairs. The
	 * crosshairs had to be active for the tooltip to be displayed.
	 *
	 * Requires *addOns.js* and *markers.js*, or the bundle *standard.js*.
	 *
	 * There can be only one `CIQ.Tooltip` per chart.
	 *
	 * Color and layout can be customized by overriding the CSS rule-sets defined for the
	 * `stx-hu-tooltip` and related type selectors in *stx-chart.css*. Do not modify
	 * *stx-chart.css*; create a separate style sheet file that overrides *stx-chart.css* in the
	 * CSS cascade. See the example below.
	 *
	 * `CIQ.Tooltip` automatically creates its own HTML inside the chart container. Here is an
	 * example of the structure (there will be one field tag per displayed element):
	 * ```
	 * <stx-hu-tooltip>
	 *     <stx-hu-tooltip-field>
	 *         <stx-hu-tooltip-field-name></stx-hu-tooltip-field-name>
	 *         <stx-hu-tooltip-field-value></stx-hu-tooltip-field-value>
	 *     </stx-hu-tooltip-field>
	 * </stx-hu-tooltip>
	 * ```
	 * By default, the `stx-hu-tooltip-field` elements are inserted in the following order:
	 * - DT
	 * - Open
	 * - High
	 * - Low
	 * - Close
	 * - Volume
	 * - series
	 * - studies
	 *
	 * But the default layout can be changed. You can override the order of fields or change the
	 * labels by manually inserting the HTML that the tooltip would otherwise have created for
	 * that field. If no override HTML is found for a particular field, the default is used.
	 * **Note:** This HTML must be placed inside the chart container.
	 *
	 * All of the code is provided in *addOns.js* and can be fully customized by copying the
	 * source code from the library and overriding the functions with your changes. Be sure to
	 * never modify a library file, as this will hinder upgrades.
	 *
	 * For example, concatenating the field name (e.g., "Jaw") with the study name (e.g.,
	 * "Alligator" ) is the default behavior of the tooltip for displaying the value title. Feel
	 * free to override this behavior by creating your own custom version of the `renderFunction()`
	 * for the `CIQ.Tooltip`. To do this, copy the entire `CIQ.Tooltip` code (found in *addOns.js*)
	 * and make the changes to your custom version. Load your custom version instead. Specifically,
	 * look for the following code in the `renderFunction()` that pushes out the text for each
	 * study field:
	 * ```
	 * let newFieldName = document.createElement("stx-hu-tooltip-field-name");
	 * newFieldName.innerHTML = this.translateIf(fieldName);
	 * newField.appendChild(newFieldName);
	 * ```
	 * Replace `fieldName` with anything you want to use as the field title and push that instead.
	 *
	 * Visual Reference:<br>
	 * ![stx-hu-tooltip](stx-hu-tooltip.png "stx-hu-tooltip")
	 *
	 * @param {object} tooltipParams The constructor parameters.
	 * @param {CIQ.ChartEngine} [tooltipParams.stx] The chart object.
	 * @param {boolean} [tooltipParams.ohl] Set to true to show OHL data (Close is always shown).
	 * @param {boolean} [tooltipParams.volume] Set to true to show Volume.
	 * @param {boolean} [tooltipParams.series] Set to true to show value of series.
	 * @param {boolean} [tooltipParams.studies] Set to true to show value of studies.
	 * @param {boolean} [tooltipParams.showOverBarOnly] Set to true to show the tooltip only when
	 * 		the mouse is over the primary line/bars.
	 * @param {boolean} [tooltipParams.change] Set to true to show the change in daily value
	 * 		when the internal chart periodicity is a daily interval (see
	 * 		{@link CIQ.ChartEngine.isDailyInterval}).
	 * @param {boolean} [tooltipParams.interpolation] Set to true to show the estimated value when
	 * 		there is no data between bars. **Note:** A value of `null` is not considered missing
	 * 		data.
	 * @param {boolean} [tooltipParams.useDataZone] Set to true to show the date in the `dataZone`
	 * 		time zone; false, to use the `displayZone` time zone (see
	 * 		{@link CIQ.ChartEngine#setTimeZone}).
	 * @param {boolean} [tooltipParams.showBarHighlight=true] Specifies whether the bar (data
	 * 		point) the mouse is hovering over is highlighted. Applies to the floating tooltip only
	 * 		(the dynamic tooltip points to the bar). If the crosshairs are active, this parameter
	 * 		is ignored.
	 *
	 * @constructor
	 * @name CIQ.Tooltip
	 * @since
	 * - 09-2016-19
	 * - 5.0.0 Now `tooltipParams.showOverBarOnly` is available to show tooltip only when over the
	 * 		primary line/bars.
	 * - 5.1.1 `tooltipParams.change` set to true to show the change in daily value when
	 * 		displaying a daily interval.
	 * - 6.2.5 New `tooltipParams.interpolation` flag to show estimated value for missing series
	 * 		data points.
	 * - 7.0.0 New `tooltipParams.useDataZone` flag to show the date in either the `dataZone` or
	 * 		`displayZone` date/time.
	 * - 8.2.0 Decoupled `CIQ.Tooltip` from the crosshairs and added highlighting of the data
	 * 		point (or bar) the mouse is hovering over. The new `tooltipParams.showBarHighlight`
	 * 		parameter enables or disables the highlighting.
	 *
	 * @example <caption>Add a tooltip to a chart:</caption>
	 * // First declare your chart engine.
	 * const stxx = new CIQ.ChartEngine({ container: document.querySelector(".chartContainer")[0] });
	 *
	 * // Then link the tooltip to that chart.
	 * // Note how we've enabled OHL, Volume, Series and Studies.
	 * new CIQ.Tooltip({ stx: stxx, ohl: true, volume: true, series: true, studies: true });
	 *
	 * @example <caption>Customize the order, layout, or text in tooltip labels:</caption>
	 * // In this example, we've rearranged the HTML to display the Close field first, then the DT.
	 * // We are also labeling the DT 'Date/Time' and the Close 'Last'.
	 * // The rest of the fields are displayed in their default order.
	 *
	 * <stx-hu-tooltip>
	 *     <stx-hu-tooltip-field field="Close">
	 *         <stx-hu-tooltip-field-name>Last</stx-hu-tooltip-field-name>
	 *         <stx-hu-tooltip-field-value></stx-hu-tooltip-field-value>
	 *     </stx-hu-tooltip-field>
	 *     <stx-hu-tooltip-field field="DT">
	 *         <stx-hu-tooltip-field-name>Date/Time</stx-hu-tooltip-field-name>
	 *         <stx-hu-tooltip-field-value></stx-hu-tooltip-field-value>
	 *     </stx-hu-tooltip-field>
	 * </stx-hu-tooltip>
	 *
	 * @example <caption>Customize the CSS for the tooltip (see <i>stx-chart.css</i>):</caption>
	 * stx-hu-tooltip {
	 *     position: absolute;
	 *     left: -50000px;
	 *     z-index: 30;
	 *     white-space: nowrap;
	 *     padding: 6px;
	 *     border: 1px solid gray;
	 *     background-color: rgba(42,81,208,.5);
	 *     color: white;
	 * }
	 *
	 * stx-hu-tooltip-field {
	 *     display:table-row;
	 * }
	 *
	 * stx-hu-tooltip-field-name {
	 *     display:table-cell;
	 *     font-weight:bold;
	 *     padding-right:5px;
	 * }
	 *
	 * stx-hu-tooltip-field-name:after {
	 *     content:':';
	 * }
	 *
	 * stx-hu-tooltip-field-value {
	 *     display:table-cell;
	 *     text-align:right;
	 * }
	 */
	CIQ.Tooltip =
		CIQ.Tooltip ||
		function (tooltipParams) {
			if (!CIQ.Marker) {
				console.warn(
					"CIQ.Tooltip addon requires CIQ.Marker module to be enabled."
				);
				return;
			}

			this.cssRequired = true;

			const {
				stx,
				ohl: showOhl,
				change: showChange,
				volume: showVolume,
				series: showSeries,
				studies: showStudies,
				interpolation: showInterpolation,
				showOverBarOnly,
				showBarHighlight = true,
				useDataZone
			} = tooltipParams;
			const { container } = stx.chart;

			let node = container.querySelector("stx-hu-tooltip");
			if (!node) {
				node = document.createElement("stx-hu-tooltip");
				container.appendChild(node);
			}

			let highlightEl = container.querySelector(".stx-hu-tooltip-highlight");
			if (!highlightEl) {
				highlightEl = document.createElement("div");
				highlightEl.classList.add("stx-hu-tooltip-highlight");
				container.appendChild(highlightEl);
			}

			CIQ.Marker.Tooltip = function (params) {
				if (!this.className) this.className = "CIQ.Marker.Tooltip";
				this.highlightEl = highlightEl;
				params.label = "tooltip";
				CIQ.Marker.call(this, params);
			};

			CIQ.inheritsFrom(CIQ.Marker.Tooltip, CIQ.Marker, false);

			CIQ.Marker.Tooltip.sameBar = function (bar1, bar2) {
				if (!bar1 || !bar2) return false;
				if (+bar1.DT != +bar2.DT) return false;
				if (bar1.Close != bar2.Close) return false;
				if (bar1.Open != bar2.Open) return false;
				if (bar1.Volume != bar2.Volume) return false;
				return true;
			};

			CIQ.Marker.Tooltip.placementFunction = function (params) {
				if (hideIfDisabled()) return;
				var offset = 30;
				var stx = params.stx;
				for (var i = 0; i < params.arr.length; i++) {
					var marker = params.arr[i];
					var bar = stx.barFromPixel(stx.cx);
					var quote = stx.chart.dataSegment[bar];
					var goodBar;
					var overBar = true;
					var highPx, lowPx;

					if (quote != "undefined" && quote && quote.DT) {
						goodBar = true;
						if (quote.High) highPx = stx.pixelFromPrice(quote.High);
						if (quote.Low) lowPx = stx.pixelFromPrice(quote.Low);
						if (!stx.chart.highLowBars) {
							if (quote.Close) {
								highPx = stx.pixelFromPrice(quote.Close) - 15;
								lowPx = stx.pixelFromPrice(quote.Close) + 15;
							}
						}
						if (showOverBarOnly && !(stx.cy >= highPx && stx.cy <= lowPx))
							overBar = false;
					}

					if (
						!(
							stx.insideChart &&
							!stx.openDialog &&
							!stx.activeDrawing &&
							!stx.grabbingScreen &&
							goodBar &&
							overBar
						)
					) {
						highlightEl.style.display = "none";
						marker.node.style.left = "-50000px";
						marker.node.style.right = "auto";
						marker.lastBar = {};
						return;
					}
					if (
						CIQ.Marker.Tooltip.sameBar(
							stx.chart.dataSegment[bar],
							marker.lastBar
						) &&
						bar != stx.chart.dataSegment.length - 1
					) {
						return;
					}

					marker.lastBar = stx.chart.dataSegment[bar];
					var cw = marker.lastBar.candleWidth || stx.layout.candleWidth;
					if (
						parseInt(getComputedStyle(marker.node).width, 10) +
							stx.chart.panel.left +
							offset +
							cw <
						stx.backOutX(CIQ.ChartEngine.crosshairX)
					) {
						marker.node.style.left = "auto";
						marker.node.style.right =
							Math.round(
								container.clientWidth - stx.pixelFromBar(bar) + offset
							) + "px";
					} else {
						marker.node.style.left =
							Math.round(stx.pixelFromBar(bar) + offset) + "px";
						marker.node.style.right = "auto";
					}
					var height = parseInt(getComputedStyle(marker.node).height, 10);
					var top = Math.round(
						CIQ.ChartEngine.crosshairY - stx.top - height / 2
					);
					if (top + height > stx.height) top = stx.height - height;
					if (top < 0) top = 0;
					marker.node.style.top = top + "px";

					if (showBarHighlight && !stx.layout.crosshair) {
						const candleWidth =
							marker.lastBar.candleWidth || stx.layout.candleWidth;
						const left = stx.pixelFromBar(bar) - candleWidth / 2;
						let width = candleWidth;

						if (left + width > stx.chart.width) {
							// adjust width of last bar so it does not highlight past the edge of the chart into the y axis
							width = stx.chart.width - left;
						}

						highlightEl.style.display = "block";
						highlightEl.style.left = left + "px";
						highlightEl.style.width = width + "px";
					} else {
						highlightEl.style.display = "none";
					}
				}
				// backwards compatibility
				// temporarily disable overXAxis, overYAxis so the crosshairs don't hide if touch device and over Y axis (this can happen
				// due to the offset which we apply)
				if (stx.layout.crosshair) {
					var overXAxis = stx.overXAxis,
						overYAxis = stx.overYAxis;
					stx.overXAxis = stx.overYAxis = false;
					stx.doDisplayCrosshairs();
					stx.overXAxis = overXAxis;
					stx.overYAxis = overYAxis;
				}
			};

			function hideIfDisabled() {
				const { headsUp, crosshair } = stx.layout;
				const isFloating =
					(headsUp && headsUp.floating) || headsUp === "floating";

				const crosshairsOn =
					crosshair &&
					stx.displayCrosshairs &&
					["static", null, undefined].includes(headsUp); // backwards compatibility

				if (stx.huTooltip && !isFloating && !crosshairsOn) {
					hideTooltip();
					return true;
				}

				return false;
			}

			function hideTooltip() {
				const { huTooltip } = stx;
				const { node } = huTooltip;
				if (!node) return;
				node.style.left = "-50000px";
				node.style.right = "auto";
				huTooltip.lastBar = {};
				if (huTooltip.highlightEl) huTooltip.highlightEl.style.display = "none";
			}

			function renderFunction() {
				// the tooltip has not been initialized with this chart.
				if (hideIfDisabled()) return;

				var bar = this.barFromPixel(this.cx),
					data = this.chart.dataSegment[bar];
				if (!data) {
					hideTooltip();
					return;
				}
				if (
					CIQ.Marker.Tooltip.sameBar(data, this.huTooltip.lastBar) &&
					bar != this.chart.dataSegment.length - 1
				) {
					return;
				}
				var node = this.huTooltip.node;
				Array.from(node.parentElement.querySelectorAll("[auto]")).forEach(
					function (i) {
						i.remove();
					}
				);
				Array.from(
					node.parentElement.querySelectorAll("stx-hu-tooltip-field-value")
				).forEach(function (i) {
					i.innerHTML = "";
				});

				var panel = this.chart.panel;
				var yAxis = panel.yAxis;
				var dupMap = {};
				var fields = [];
				fields.push({
					member: "DT",
					display: "DT",
					panel: panel,
					yAxis: yAxis
				});
				fields.push({
					member: "Close",
					display: "Close",
					panel: panel,
					yAxis: yAxis
				});
				dupMap.DT = dupMap.Close = 1;
				if (
					showChange &&
					CIQ.ChartEngine.isDailyInterval(this.layout.interval)
				) {
					fields.push({
						member: "Change",
						display: "Change",
						panel: panel,
						yAxis: yAxis
					});
				}
				if (showOhl) {
					fields.push({
						member: "Open",
						display: "Open",
						panel: panel,
						yAxis: yAxis
					});
					fields.push({
						member: "High",
						display: "High",
						panel: panel,
						yAxis: yAxis
					});
					fields.push({
						member: "Low",
						display: "Low",
						panel: panel,
						yAxis: yAxis
					});
					dupMap.Open = dupMap.High = dupMap.Low = 1;
				}
				if (showVolume) {
					fields.push({
						member: "Volume",
						display: "Volume",
						panel: null,
						yAxis: null
					}); // null yAxis use raw value
					dupMap.Volume = 1;
				}
				if (showSeries) {
					var renderers = this.chart.seriesRenderers;
					for (var renderer in renderers) {
						var rendererToDisplay = renderers[renderer];
						if (rendererToDisplay === this.mainSeriesRenderer) continue;
						panel = this.panels[rendererToDisplay.params.panel];
						yAxis = rendererToDisplay.params.yAxis;
						if (!yAxis && rendererToDisplay.params.shareYAxis)
							yAxis = panel.yAxis;
						for (var id = 0; id < rendererToDisplay.seriesParams.length; id++) {
							var seriesParams = rendererToDisplay.seriesParams[id];
							// if a series has a symbol and a field then it maybe a object chain
							var sKey = seriesParams.symbol;
							var subField = seriesParams.field;
							if (!sKey) sKey = subField;
							else if (subField && sKey != subField)
								sKey = CIQ.createObjectChainNames(sKey, subField)[0];
							var display =
								seriesParams.display ||
								seriesParams.symbol ||
								seriesParams.field;
							if (sKey && !dupMap[display]) {
								fields.push({
									member: sKey,
									display: display,
									panel: panel,
									yAxis: yAxis,
									isSeries: true
								});
								dupMap[display] = 1;
							}
						}
					}
				}
				if (showStudies) {
					for (var study in this.layout.studies) {
						var sd = this.layout.studies[study];
						panel = this.panels[sd.panel];
						yAxis = panel && sd.getYAxis(this);
						for (var output in this.layout.studies[study].outputMap) {
							if (output && !dupMap[output]) {
								fields.push({
									member: output,
									display: output,
									panel: panel,
									yAxis: yAxis
								});
								dupMap[output] = 1;
							}
						}
						if (!dupMap[study + "_hist"]) {
							fields.push({
								member: study + "_hist",
								display: study + "_hist",
								panel: panel,
								yAxis: yAxis
							});
							fields.push({
								member: study + "_hist1",
								display: study + "_hist1",
								panel: panel,
								yAxis: yAxis
							});
							fields.push({
								member: study + "_hist2",
								display: study + "_hist2",
								panel: panel,
								yAxis: yAxis
							});
							dupMap[study + "_hist"] = 1;
						}
					}
				}
				for (var f = 0; f < fields.length; f++) {
					var obj = fields[f];
					var name = obj.member;
					var displayName = obj.display;
					var isRecordDate = name == "DT";
					if (
						isRecordDate &&
						!useDataZone &&
						!CIQ.ChartEngine.isDailyInterval(stx.layout.interval)
					)
						name = "displayDate"; // display date is timezone adjusted
					panel = obj.panel;
					yAxis = obj.yAxis;
					var labelDecimalPlaces = null;
					if (yAxis) {
						if (!panel || panel !== panel.chart.panel) {
							// If a study panel, use yAxis settings to determine decimal places
							if (yAxis.decimalPlaces || yAxis.decimalPlaces === 0)
								labelDecimalPlaces = yAxis.decimalPlaces;
							else if (yAxis.maxDecimalPlaces || yAxis.maxDecimalPlaces === 0)
								labelDecimalPlaces = yAxis.maxDecimalPlaces;
						} else {
							// If a chart panel, then always display at least the number of decimal places as calculated by masterData (panel.chart.decimalPlaces)
							// but if we are zoomed to high granularity then expand all the way out to the y-axis significant digits (panel.yAxis.printDecimalPlaces)
							labelDecimalPlaces = Math.max(
								yAxis.printDecimalPlaces,
								panel.chart.decimalPlaces
							);
							//	... and never display more decimal places than the symbol is supposed to be quoting at
							if (yAxis.maxDecimalPlaces || yAxis.maxDecimalPlaces === 0)
								labelDecimalPlaces = Math.min(
									labelDecimalPlaces,
									yAxis.maxDecimalPlaces
								);
						}
					}
					var dsField = null;
					// account for object chains
					var tuple = CIQ.existsInObjectChain(data, name);
					if (tuple) dsField = tuple.obj[tuple.member];
					else if (name == "Change") dsField = data.Close - data.iqPrevClose;

					var fieldName = displayName.replace(/^(Result )(.*)/, "$2");

					if (
						showInterpolation &&
						fields[f].isSeries &&
						(dsField === null || typeof dsField == "undefined")
					) {
						// do this only for additional series and not the main series
						var seriesPrice = this.valueFromInterpolation(
							bar,
							fieldName,
							"Close",
							panel,
							yAxis
						);
						if (seriesPrice === null) break;
						dsField = seriesPrice;
					}
					if (
						(dsField || dsField === 0) &&
						(isRecordDate ||
							typeof dsField !== "object" ||
							dsField.Close ||
							dsField.Close === 0)
					) {
						var fieldValue = "";
						if (dsField.Close || dsField.Close === 0) dsField = dsField.Close;
						if (dsField.constructor == Number) {
							if (!yAxis) {
								// raw value
								fieldValue = dsField;
								var intl = this.internationalizer;
								if (intl) {
									var l = intl.priceFormatters.length;
									var decimalPlaces = CIQ.countDecimals(fieldValue);
									if (decimalPlaces >= l) decimalPlaces = l - 1;
									fieldValue = intl.priceFormatters[decimalPlaces].format(
										fieldValue
									);
								}
							} else if (
								yAxis.originalPriceFormatter &&
								yAxis.originalPriceFormatter.func
							) {
								// in comparison mode with custom formatter
								fieldValue = yAxis.originalPriceFormatter.func(
									this,
									panel,
									dsField,
									labelDecimalPlaces
								);
							} else if (
								yAxis.priceFormatter &&
								yAxis.priceFormatter != CIQ.Comparison.priceFormat
							) {
								// using custom formatter
								fieldValue = yAxis.priceFormatter(
									this,
									panel,
									dsField,
									labelDecimalPlaces
								);
							} else {
								fieldValue = this.formatYAxisPrice(
									dsField,
									panel,
									labelDecimalPlaces,
									yAxis
								);
							}
						} else if (dsField.constructor == Date) {
							if (
								isRecordDate &&
								this.controls.floatDate &&
								this.controls.floatDate.innerHTML
							) {
								if (this.chart.xAxis.noDraw) fieldValue = "N/A";
								else
									fieldValue = CIQ.displayableDate(this, panel.chart, dsField);
							} else {
								fieldValue = CIQ.yyyymmdd(dsField);
								if (!CIQ.ChartEngine.isDailyInterval(this.layout.interval)) {
									fieldValue += " " + dsField.toTimeString().substr(0, 8);
								}
							}
						} else {
							fieldValue = dsField;
						}
						var dedicatedField = node.querySelector(
							'stx-hu-tooltip-field[field="' + fieldName + '"]'
						);

						if (dedicatedField) {
							dedicatedField.querySelector(
								"stx-hu-tooltip-field-value"
							).innerHTML = fieldValue;
							var fieldNameField = dedicatedField.querySelector(
								"stx-hu-tooltip-field-name"
							);
							if (fieldNameField.innerHTML === "") {
								fieldNameField.innerHTML = fieldName;
								if (CIQ.I18N && CIQ.I18N.localized)
									CIQ.I18N.translateUI(null, fieldNameField);
							}
						} else {
							var newField = document.createElement("stx-hu-tooltip-field");
							newField.setAttribute("auto", true);
							var newFieldName = document.createElement(
								"stx-hu-tooltip-field-name"
							);
							newFieldName.innerHTML = this.translateIf(fieldName);
							newField.appendChild(newFieldName);
							var newFieldValue = document.createElement(
								"stx-hu-tooltip-field-value"
							);
							newFieldValue.innerHTML = fieldValue;
							newField.appendChild(newFieldValue);
							node.appendChild(newField);
						}
					} else {
						var naField = node.querySelector(
							'stx-hu-tooltip-field[field="' + fieldName + '"]'
						);
						if (naField) {
							var naFieldNameField = naField.querySelector(
								"stx-hu-tooltip-field-name"
							);
							if (naFieldNameField.innerHTML !== "")
								naField.querySelector("stx-hu-tooltip-field-value").innerHTML =
									"n/a";
						}
					}
				}
				this.huTooltip.render();
			}

			container.addEventListener("mouseout", hideTooltip);

			stx.append("deleteHighlighted", function () {
				this.huTooltip.lastBar = {};
				this.headsUpHR();
			});
			stx.append("headsUpHR", renderFunction);
			stx.append("createDataSegment", renderFunction);
			stx.huTooltip = new CIQ.Marker.Tooltip({
				stx: stx,
				xPositioner: "bar",
				chartContainer: true,
				node: node
			});
		};
}

};


let __js_addons_advanced_animation_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Add-On that animates the chart.
 *
 * Requires *addOns.js*.
 *
 * The chart is animated in three ways:
 * 1.  The current price pulsates
 * 2.  The current price appears to move smoothly from the previous price
 * 3.  The chart's y-axis smoothly expands/contracts when a new high or low is reached
 *
 * The following chart types are supported: line, mountain, baseline_delta.
 *
 * Chart aggregations such as Kagi, Renko, Range Bars, etc. are not supported.
 *
 * **Animation displays more gracefully when updates are sent into the chart one at a time using {@link CIQ.ChartEngine#updateChartData}
 * instead of in batches using a [QuoteFeed]{@link CIQ.ChartEngine#attachQuoteFeed}. Sending data in batches will produce a ‘jumping’ effect.**
 *
 * By default, there will be a flashing beacon created using a canvas circle. If instead you want to use a custom animation beacon, you will be able to extend the functionality yourself as follows:
 * - In js/addOns.js, at the bottom of the CIQ.Animation function, there is an stx.append("draw") function.
 * - Make a copy of this function so you can override the behavior.
 * - In there you will see it determine var x and y, which are the coordinates for the center of the beacon.
 * - At the bottom of this append function, we draw the beacon by using the Canvas arc() function to draw a circle and then fill() to make the circle solid.
 * - You can replace  the canvas circle with an image using [CanvasRenderingContext2D.drawImage()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D#Drawing_images) .
 * - Example:
 *
 *   ```
 *   var image = document.getElementById('beacon'); // include a hidden image on your HTML
 *   context.drawImage(image, x-10, y-10, 20, 20); // add the image on the canvas. Offset the x and y values by the radius of the beacon.
 *   ```
 *
 * Animation Example <iframe width="800" height="500" scrolling="no" seamless="seamless" align="top" style="float:top" src="https://jsfiddle.net/chartiq/6fqw652z/embedded/result,js,html/" allowfullscreen="allowfullscreen" frameborder="1"></iframe>
 *
 * You can disable animation after each different [chart type is activated]{@link CIQ.ChartEngine#setChartType} by calling:
 * ```
 * stxx.mainSeriesRenderer.supportsAnimation=false;
 * ```
 * Keep in mind that changing to a different chart type, may once again enable animation. You can override this by [adding an event listener]{@link CIQ.ChartEngine#addEventListener} on [layout changes]{@link CIQ.ChartEngine~layoutEventListener}.
 *
 * @param {object} config The constructor parameters
 * @param {CIQ.ChartEngine} config.stx The chart object
 * @param {object} [config.animationParameters] Configuration parameters
 * @param {boolean} [config.animationParameters.stayPut=false] Set to true for last tick to stay in position it was scrolled and have rest of the chart move backwards as new ticks are added instead of having new ticks advance forward and leave the rest of the chart in place.
 * @param {number} [config.animationParameters.ticksFromEdgeOfScreen=5] Number of ticks from the right edge the chart should stop moving forward so the last tick never goes off screen (only applicable if stayPut=false)
 * @param {number} [config.animationParameters.granularity=1000000] Set to a value that will give enough granularity for the animation.  The larger the number the smaller the price jump between frames, which is good for charts that need a very slow smooth animation either because the price jumps between ticks are very small, or because the animation was set up to run over a large number of frames when instantiating the CIQ.EaseMachine.
 * @param {number} [config.animationParameters.tension=null] Splining tension for smooth curves around data points (range 0-1).
 * @param {CIQ.EaseMachine} config.easeMachine Override the default easeMachine.  Default is `new CIQ.EaseMachine(Math.easeOutCubic, 1000);`
 * @constructor
 * @name  CIQ.Animation
 * @since
 * - 3.0.0 Now part of *addOns.js*. Previously provided as a standalone *animation.js* file.
 * - 4.0.0 Beacon only flashes for line charts. On candles or bars, it is suppressed as it produces an unnatural effect.
 * - 7.0.2 Now takes one configuration object as its constructor. Must have a reference to a chart engine.
 * @example
 * 	new CIQ.Animation({stx: stxx, animationParameters: {tension:0.3}});  //Default animation with splining tension of 0.3
 *
 */
CIQ.Animation =
	CIQ.Animation ||
	function (config) {
		if (!config) throw new Error("Invalid constructor arguments.");
		var stx, animationParameters, easeMachine;
		if (config instanceof CIQ.ChartEngine) {
			// legacy constructor
			stx = arguments[0];
			animationParameters = arguments[1];
			easeMachine = arguments[2];
		} else {
			stx = config.stx;
			animationParameters = config.animationParameters;
			easeMachine = config.easeMachine;
		}
		if (!stx)
			return console.warn(
				"No CIQ.ChartEngine provided. Cannot properly create CIQ.Animation instance"
			);
		var params = {
			stayPut: false,
			ticksFromEdgeOfScreen: 5,
			granularity: 1000000
		};
		animationParameters = CIQ.extend(params, animationParameters);

		if (params.tension) stx.chart.tension = animationParameters.tension;
		stx.tickAnimator =
			easeMachine || new CIQ.EaseMachine(Math.easeOutCubic, 1000);
		var scrollAnimator = new CIQ.EaseMachine(Math.easeInOutCubic, 1000);

		var flashingColors = ["#0298d3", "#19bcfc", "#5dcffc", "#9ee3ff"];
		var flashingColorIndex = 0;
		var flashingColorThrottle = 20;
		var flashingColorThrottleCounter = 0;

		var filterSession = false;
		var nextBoundary = null;

		function initMarketSessionFlags() {
			filterSession = false;
			nextBoundary = null;
		}

		stx.addEventListener(["symbolChange", "layout"], function (obj) {
			initMarketSessionFlags();
		});

		stx.prepend(
			"updateCurrentMarketData",
			function (data, chart, symbol, params) {
				if (!chart) chart = this.chart;
				if (params && params.fromTrade && chart.closePendingAnimation) {
					params.finalClose = chart.closePendingAnimation.Close;
				}
			}
		);

		stx.prepend("updateChartData", function (appendQuotes, chart, params) {
			var self = this;
			if (!chart) {
				chart = self.chart;
			}
			if (
				!chart ||
				!chart.defaultChartStyleConfig ||
				chart.defaultChartStyleConfig == "none"
			)
				return;

			if (params !== undefined) {
				if (params.animationEntry || params.secondarySeries) return;
			}

			if (!chart.dataSegment) return;

			function completeLastBar(record) {
				if (!chart.masterData) return;
				for (var md = chart.masterData.length - 1; md >= 0; md--) {
					var bar = chart.masterData[md];
					if (bar.Close || bar.Close === 0) {
						bar.Close = record.Close;
						if (record.LastSize) bar.LastSize = record.LastSize;
						if (record.LastTime) bar.LastTime = record.LastTime;

						// Reset properties to close if Open, High and Low have been added and changed during animation process
						if (record.Open === undefined && bar.Open !== undefined)
							bar.Open = record.Close;
						if (record.High === undefined && bar.High !== undefined)
							bar.High = record.Close;
						if (record.Low === undefined && bar.Low !== undefined)
							bar.Low = record.Close;

						self.updateCurrentMarketData({
							Close: bar.Close,
							DT: bar.DT,
							LastSize: bar.LastSize,
							LastTime: bar.LastTime
						});
						self.createDataSet(null, null, { appending: true });
						return;
					}
				}
			}
			function unanimateScroll() {
				if (chart.animatingHorizontalScroll) {
					chart.animatingHorizontalScroll = false;
					self.micropixels = self.nextMicroPixels = self.previousMicroPixels; // <-- Reset self.nextMicroPixels here
					chart.lastTickOffset = 0;
				}
				if (chart.closePendingAnimation) {
					completeLastBar(chart.closePendingAnimation);
					chart.closePendingAnimation = null;
				}
			}
			var tickAnimator = self.tickAnimator;
			// These chart types are the only types supported by animation
			var supportedChartType =
				this.mainSeriesRenderer && this.mainSeriesRenderer.supportsAnimation;
			if (supportedChartType) {
				if (!tickAnimator) {
					console.warn(
						"Animation plug-in can not run because the tickAnimator has not been declared. See instructions in animation.js"
					);
					return;
				}

				// If symbol changes then reset all of our variables
				if (this.prevSymbol != chart.symbol) {
					this.prevQuote = 0;
					chart.closePendingAnimation = null;
					this.prevSymbol = chart.symbol;
				}
				unanimateScroll();
				tickAnimator.stop();

				if (appendQuotes.length > 1) {
					// Only the last quote can be be animated. First add all except the last without animation
					var quotesExceptLastOne = appendQuotes.splice(
						0,
						appendQuotes.length - 1
					);
					var firstSetParams = CIQ.clone(params);

					firstSetParams.animationEntry = true;
					firstSetParams.bypassGovernor = true;
					firstSetParams.noCreateDataSet = false;
					firstSetParams.appending = true;
					self.updateChartData(quotesExceptLastOne, chart, firstSetParams);
				}
			}
			var newParams = CIQ.clone(params);
			if (!newParams) newParams = {};
			newParams.animationEntry = true;
			newParams.bypassGovernor = true;
			newParams.noCreateDataSet = false;
			newParams.appending = true;
			//newParams.allowReplaceOHL = true;
			newParams.firstLoop = true;
			var symbol = this.chart.symbol;
			var period = this.layout.periodicity;
			var interval = this.layout.interval;
			var timeUnit = this.layout.timeUnit;

			function cb(quote, prevQuote, chartJustAdvanced) {
				return function (newData) {
					var newClose = newData.Close;
					if (
						!chart.dataSet.length ||
						symbol != chart.symbol ||
						period != self.layout.periodicity ||
						interval != self.layout.interval ||
						timeUnit != self.layout.timeUnit
					) {
						//console.log ("---- STOP animating: Old",symbol,' New : ',chart.symbol, Date())
						tickAnimator.stop();
						unanimateScroll();
						return; // changed symbols mid animation
					}
					var q = CIQ.clone(quote);
					q.Adj_Close = null; // Don't use this, it will mess up our calculated close
					q.Close =
						Math.round(newClose * animationParameters.granularity) /
						animationParameters.granularity; //<<------ IMPORTANT! Use 1000000 for small price increments, otherwise animation will be in increments of .0001
					if (chart.animatingHorizontalScroll) {
						self.micropixels = newData.micropixels;
						chart.lastTickOffset = newData.lineOffset;
					}
					newParams.updateDataSegmentInPlace = !tickAnimator.hasCompleted;
					//console.log("animating: Old",symbol,' New : ',chart.symbol);
					var updateQuotes = [q];
					// Don't include previous quote if tick mode. It will append, duplicating the quote
					if (chartJustAdvanced && self.layout.interval !== "tick")
						updateQuotes.unshift(prevQuote);
					self.updateChartData(updateQuotes, chart, newParams);
					newParams.firstLoop = false;
					if (tickAnimator.hasCompleted) {
						//console.log( 'animator has completed') ;
						//self.pendingScrollAdvance=false;
						//var possibleYAxisChange = chart.animatingHorizontalScroll;
						unanimateScroll();
						/*if (possibleYAxisChange) { // <---- Logic no longer necessary
						 // After completion, one more draw for good measure in case our
						 // displayed high and low have changed, which would trigger
						 // the y-axis animation
						 setTimeout(function(){
						 self.draw();
						 }, 0);
						 }*/
					}
				};
			}
			if (supportedChartType) {
				var quote = appendQuotes[appendQuotes.length - 1];
				this.prevQuote = this.currentQuote("Close"); // <---- prevQuote logic has been changed to prevent forward/back jitter when more than one tick comes in between animations
				var chartJustAdvanced = false; // When advancing, we need special logic to deal with the open
				var dontScroll = false;
				if (!self.isHome()) {
					dontScroll = true;
				}
				if (!quote || !quote.Close || !this.prevQuote || !this.prevQuote.Close)
					return false;

				if (this.extendedHours && chart.market.market_def) {
					// Filter out unwanted sessions
					var dtToFilter = quote.DT;
					if (CIQ.ChartEngine.isDailyInterval(interval)) {
						filterSession = !chart.market.isMarketDate(dtToFilter);
					} else {
						if (!nextBoundary || nextBoundary <= dtToFilter) {
							var session = chart.market.getSession(dtToFilter);
							filterSession =
								session !== "" &&
								(!this.layout.marketSessions ||
									!this.layout.marketSessions[session]);
							nextBoundary = chart.market[
								filterSession ? "getNextOpen" : "getNextClose"
							](dtToFilter);
						}
					}
					if (filterSession) {
						this.draw();
						return false;
					}
				}

				var barSpan = period;
				if (interval == "second" || timeUnit == "second") barSpan *= 1000;
				else if (interval == "minute" || timeUnit == "minute") barSpan *= 60000;
				if (!isNaN(interval)) barSpan *= interval;
				if (interval == "day" || timeUnit == "day")
					chartJustAdvanced = quote.DT.getDate() != this.prevQuote.DT.getDate();
				else if (interval == "week" || timeUnit == "week")
					chartJustAdvanced =
						quote.DT.getDate() >= this.prevQuote.DT.getDate() + 7;
				else if (interval == "month" || timeUnit == "month")
					chartJustAdvanced =
						quote.DT.getMonth() != this.prevQuote.DT.getMonth();
				else
					chartJustAdvanced =
						quote.DT.getTime() >= this.prevQuote.DT.getTime() + barSpan;

				var linearChart =
					!this.mainSeriesRenderer || !this.mainSeriesRenderer.standaloneBars;

				var beginningOffset = 0;
				if (chartJustAdvanced) {
					if (this.animations.zoom.hasCompleted) {
						var candleWidth = this.layout.candleWidth;
						if (chart.scroll <= chart.maxTicks) {
							while (this.micropixels > 0) {
								// If micropixels is larger than a candle then scroll back further
								chart.scroll++;
								this.micropixels -= candleWidth;
							}
						}
						beginningOffset = candleWidth * -1;
						if (chart.scroll <= chart.maxTicks) {
							this.previousMicroPixels = this.micropixels;
							this.nextMicroPixels = this.micropixels + candleWidth;
							if (
								chart.dataSegment.length <
									chart.maxTicks - animationParameters.ticksFromEdgeOfScreen &&
								!animationParameters.stayPut
							) {
								this.nextMicroPixels = this.micropixels;
								chart.scroll++;
							}
							chart.animatingHorizontalScroll = linearChart; // When the chart advances we also animate the horizontal scroll by incrementing micropixels
							chart.previousDataSetLength = chart.dataSet.length;
						} else {
							if (!dontScroll) chart.scroll++;
						}
					} else {
						return false;
					}
				}
				chart.closePendingAnimation = {
					Close: quote.Close,
					Open: quote.Open,
					High: quote.High,
					Low: quote.Low
				};

				var start =
					chartJustAdvanced && !linearChart ? quote.Open : this.prevQuote.Close;
				tickAnimator.run(
					cb(quote, CIQ.clone(this.prevQuote), chartJustAdvanced),
					{
						Close: start,
						micropixels: this.nextMicroPixels,
						lineOffset: beginningOffset
					},
					{ Close: quote.Close, micropixels: this.micropixels, lineOffset: 0 }
				);
				return true; // bypass default behavior in favor of animation
			}
		});

		stx.prepend("renderYAxis", function (chart) {
			if (this.grabbingScreen || !this.isHome()) return;
			// When display style doesn't support animation
			var supportedChartType =
				this.mainSeriesRenderer && this.mainSeriesRenderer.supportsAnimation;
			if (!supportedChartType) return;

			var panel = chart.panel;
			var yAxis = panel.yAxis;
			if (CIQ.Comparison && yAxis.priceFormatter == CIQ.Comparison.priceFormat)
				return; // too difficult to animate y-axis change when it changes on every tick due to percentage axis on comparison

			function closure(self) {
				return function (values) {
					chart.animatedLow = values.low;
					chart.animatedHigh = values.high;
					self.draw();
				};
			}
			// initialize prev values
			if (!chart.prevLowValue && chart.prevLowValue !== 0) {
				chart.prevLowValue = chart.animatedLow = chart.lowValue;
			}
			if (!chart.prevHighValue && chart.prevHighValue !== 0) {
				chart.prevHighValue = chart.animatedHigh = chart.highValue;
			}

			// check for a change, if so we will spin off an animation
			if (!scrollAnimator.running) chart.animatingVerticalScroll = false;
			if (
				chart.prevLowValue >= chart.lowValue &&
				chart.prevHighValue <= chart.highValue
			) {
				if (chart.animatingVerticalScroll) {
					yAxis.highValue = chart.animatedHigh;
					yAxis.lowValue = chart.animatedLow;
				}
				return;
			}
			if (scrollAnimator.running) scrollAnimator.stop();
			if (!chart.lowValue && !chart.highValue) return; // chart just reset, don't animate yet
			var prevLow = chart.prevLowValue,
				prevHigh = chart.prevHighValue;
			chart.prevLowValue = chart.lowValue;
			chart.prevHighValue = chart.highValue;
			chart.animatingVerticalScroll = true;
			scrollAnimator.run(
				closure(this),
				{ low: prevLow, high: prevHigh },
				{ low: chart.lowValue, high: chart.highValue }
			);

			yAxis.lowValue = chart.animatedLow;
			yAxis.highValue = chart.animatedHigh;
		});

		/*stx.prepend("draw", function() {
			if(this.chart.animatingVerticalScroll) {
				this.renderYAxis(this.chart);
				return true;
			}
		});*/

		stx.append("draw", function () {
			if (filterSession) return;
			if (
				this.chart.dataSet &&
				this.chart.dataSet.length &&
				this.mainSeriesRenderer &&
				this.mainSeriesRenderer.supportsAnimation
			) {
				if (flashingColorThrottleCounter % flashingColorThrottle === 0) {
					flashingColorIndex++;
					flashingColorThrottleCounter = 0;
				}
				flashingColorThrottleCounter++;

				var context = this.chart.context;
				var panel = this.chart.panel;
				var currentQuote = this.currentQuote("Close");
				if (!currentQuote) return;
				var price = currentQuote.Close;
				var x = this.pixelFromTick(currentQuote.tick, this.chart);
				if (this.chart.lastTickOffset) x = x + this.chart.lastTickOffset;
				var y = this.pixelFromPrice(price, panel);
				if (
					this.chart.yAxis.left > x &&
					this.chart.yAxis.top <= y &&
					this.chart.yAxis.bottom >= y
				) {
					if (flashingColorIndex >= flashingColors.length)
						flashingColorIndex = 0;
					context.beginPath();
					context.moveTo(x, y);
					context.arc(
						x,
						y,
						2 + flashingColorIndex * 1.07,
						0,
						Math.PI * 2,
						false
					);
					context.fillStyle = flashingColors[flashingColorIndex];
					context.fill();
				}
			}
		});
	};

/**
 * CIQ.EaseMachine interface placeholder to be augmented in *standard.js* with properties.
 *
 * @tsinterface CIQ~EaseMachine
 */

};


let __js_addons_advanced_continuousZoom_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Add-on that responds to the chart zoom action, changing periodicities as the number of ticks and/or candle width
 * hits a set boundary.
 *
 * Although this feature is available for all chart styles, it shows best on continuous renderings
 * such as lines and mountains vs. candles and bars. This is because some users may find the
 * changes in candle width that take place as the same range is displayed in a different
 * periodicity, inappropriate. The effect can be mitigated by increasing the number of boundaries
 * so periodicities change more often, preventing large candle width changes, and by using the
 * periodicity roll up feature instead of fetching new data from a quote feed. See examples.
 *
 * See {@link CIQ.ChartEngine#setPeriodicity} and {@link CIQ.ChartEngine#createDataSet}
 *
 * Requires *addOns.js*.
 *
 * The feature will not work without supplying at least one element within the periodicities array
 * and at least one property within the boundaries object.
 *
 * @param {object} params Configuration parameters.
 * @param {CIQ.ChartEngine} params.stx The chart object.
 * @param {array} params.periodicities Set this array with eligible periodicities in any order.
 * 		These will be the periodicities which will be used by the continuous zooming once a
 * 		boundary is hit. The periodicities are objects with `period`, `interval`, and optional
 * 		`timeUnit` properties (see {@link CIQ.ChartEngine#setPeriodicity}).
 * @param {object} params.boundaries Optional boundary cases to trigger the periodicity change.
 * 		Hitting a maximum boundary switches to the next larger periodicity; hitting a minimum
 * 		boundary switches to the next smaller periodicity.
 * @param {number} [params.boundaries.maxCandleWidth] Largest size of candle in pixels to display
 * 		before switching periodicity.
 * @param {number} [params.boundaries.minCandleWidth] Smallest size of candle in pixels to display
 * 		before switching periodicity.
 * @param {number} [params.boundaries.maxTicks] Most number of ticks to display before switching
 * 		periodicity.
 * @param {number} [params.boundaries.minTicks] Least number of ticks to display before switching
 * 		periodicity.
 *
 * @constructor
 * @name CIQ.ContinuousZoom
 * @since 7.0.0
 *
 * @example
 * new CIQ.ContinuousZoom({
 *     stx: stxx,
 *     periodicities: [
 *         { period:1, interval:"month" },
 *         { period:1, interval:"day" },
 *         { period:2, interval:30 },
 *         { period:1, interval:5 },
 *         { period:15, interval:1, timeUnit:"second" },
 *         { period:1, interval:1, timeUnit:"second" }
 *     ],
 *     boundaries: {
 *         maxCandleWidth: 100,
 *         minCandleWidth: 3,
 *         maxTicks: 500,
 *         minTicks: 10
 *     }
 * });
 *
 * @example
 * // Smother periodicity change by rolling daily into weekly and monthly.
 * // Also try reusing the same interval data and have the chart roll it instead of fetching new data.
 * stxx.dontRoll = false;
 * new CIQ.ContinuousZoom({
 *     stx: stxx,
 *     periodicities: [
 *         // Daily interval data
 *         {period:1, interval:"month"},
 *         {period:2, interval:"week"},
 *         {period:1, interval:"week"},
 *         {period:3, interval:"day"},
 *         {period:1, interval:"day"},
 *         // 30 minute interval data
 *         {period:16, interval:30},
 *         {period:8, interval:30},
 *         {period:4, interval:30},
 *         {period:2, interval:30},
 *         // one minute interval data
 *         {period:30, interval:1},
 *         {period:15, interval:1},
 *         {period:10, interval:1},
 *         {period:5, interval:1},
 *         {period:2, interval:1},
 *         {period:1, interval:1},
 *         // One second interval data
 *         {period:30,interval:1, timeUnit:"second"},
 *         {period:15,interval:1, timeUnit:"second"},
 *         {period:5, interval:1, timeUnit:"second"},
 *         {period:2, interval:1, timeUnit:"second"},
 *         {period:1, interval:1, timeUnit:"second"},
 *     ],
 *     boundaries: {
 *         maxCandleWidth: 15,
 *         minCandleWidth: 3
 *    }
 * });
 */
CIQ.ContinuousZoom =
	CIQ.ContinuousZoom ||
	function (params) {
		this.cssRequired = true;
		this.update(params);
		this.stx.continuousZoom = this;

		//Attaches SmartZoom button to HTML DOM inside .chartSize element
		this.addSmartZoomButton = function () {
			// Don't add a button if one already exists
			var smartZoomButton =
				this.stx.registerChartControl &&
				this.stx.registerChartControl(
					"stx-smart-zoom",
					"SmartZoom (Alt + 0)",
					(function (self) {
						return function (e) {
							self.smartZoomToggle(e);
							e.stopPropagation();
						};
					})(this)
				);
			if (smartZoomButton) {
				// Listen for a layout changed event and refresh the toggle state of the button
				this.stx.addEventListener("layout", function (event) {
					if (event.stx.layout.smartzoom === true) {
						smartZoomButton.classList.add("active");
					} else {
						smartZoomButton.classList.remove("active");
					}
				});
				// Piggyback off of symbolImport event to detect smartzoom set to false from layout import
				this.stx.addEventListener("symbolImport", function (event) {
					if (event.stx.layout.smartzoom === false)
						smartZoomButton.classList.remove("active");
				});
			}
		};

		//Click event handler for the Smart Zoom button. Sets smartzoom property of layout to its inverse
		this.smartZoomToggle = function (e) {
			this.smartZoomEnable(!this.stx.layout.smartzoom);
		};

		//Sets smartzoom property of layout and notifies attached ChartEngine of change
		this.smartZoomEnable = function (state) {
			this.stx.layout.smartzoom = state;
			this.stx.changeOccurred("layout");
		};

		// Add the SmartZoom button to chartControls
		this.addSmartZoomButton();
		// Enable SmartZoom by default
		this.smartZoomEnable(true);
	};

/**
 * Updates continuous zoom parameters
 * @param  {object} params Configuration parameters.  See constructor for details
 * @memberof CIQ.ContinuousZoom
 * @since 7.0.0
 * @private
 */
CIQ.ContinuousZoom.prototype.update = function (params) {
	if (!params) params = {};
	this.stx = params.stx;
	this.periodicities = params.periodicities;
	this.boundaries = params.boundaries;
};

/**
 * Potentially performs a continuous zoom after a zoom event
 * @param  {boolean} [zoomOut] True for a zoomOut operation, otherwise zoomIn
 * @memberof CIQ.ContinuousZoom
 * @since 7.0.0
 * @private
 */
CIQ.ContinuousZoom.prototype.execute = function (zoomOut) {
	// assign a weight to a periodicity setting, the higher the length, the higher the weight
	function valuate(periodicity) {
		var period = periodicity.period || periodicity.periodicity,
			interval = periodicity.interval,
			timeUnit = periodicity.timeUnit || "minute";
		if (isNaN(interval)) {
			timeUnit = interval;
			interval = 1;
		}
		switch (timeUnit) {
			case "month":
				interval *= 4.35; /* falls through */
			case "week":
				interval *= 7; /* falls through */
			case "day":
				interval *= 1440; /* falls through */
			case "minute":
				interval *= 60; /* falls through */
			case "second":
				break;
			case "millisecond":
				interval /= 1000;
				break;
			default:
				return null;
		}
		return period * interval;
	}
	if (!this.stx || !this.stx.layout.smartzoom) return;
	var periodicities = this.periodicities,
		boundaries = this.boundaries,
		stx = this.stx,
		layout = stx.layout,
		chart = stx.chart;
	if (!periodicities || !boundaries) return;

	if (
		(!zoomOut &&
			boundaries.maxCandleWidth &&
			layout.candleWidth > boundaries.maxCandleWidth) ||
		(zoomOut &&
			boundaries.minCandleWidth &&
			layout.candleWidth < boundaries.minCandleWidth) ||
		(!zoomOut && boundaries.minTicks && chart.maxTicks < boundaries.minTicks) ||
		(zoomOut && boundaries.maxTicks && chart.maxTicks > boundaries.maxTicks)
	) {
		var next = { value: zoomOut ? Number.MAX_VALUE : 0 };
		var myValue = valuate(layout);
		for (var p = 0; p < periodicities.length; p++) {
			var value = valuate(periodicities[p]);
			if (
				(value > myValue && value < next.value && zoomOut) ||
				(value < myValue && value > next.value && !zoomOut)
			) {
				next = { value: value, periodicity: periodicities[p] };
			}
		}
		var newPeriodicity = next.periodicity;
		if (newPeriodicity) {
			stx.setRange({
				dtLeft: chart.xaxis[0].DT,
				dtRight: chart.xaxis[chart.xaxis.length - 1].DT,
				dontSaveRangeToLayout: true,
				periodicity: newPeriodicity
			});
		}
	}
};

};


let __js_addons_advanced_outliers_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Creates the outliers add-on which scales the y-axis to the main trend, hiding outlier
 * values. Markers are placed at the location of the outlier values enabling the user to
 * restore the full extent of the y-axis by selecting the markers.
 *
 *  Outliers show/hide can be toggled using the Ctrl+Alt+O keystroke combination (see the
 * `outliers` action in `hotkeyConfig.hotkeys` in *js/defaultConfiguration.js*).
 *
 * Requires *addOns.js*.
 *
 * ![Chart with hidden outliers](./img-Chart-with-Hidden-Outliers.png "Chart with hidden outliers")
 *
 * @param {object} params Configuration parameters.
 * @param {CIQ.ChartEngine} [params.stx] A reference to the chart object.
 * @param {number} [params.multiplier=3] Sets the threshold for outliers by multiplying the
 * 		normal data range. The default value hides only extreme outliers.
 * @param {array} [params.altColors] An array of hexadecimal color values used to style
 * 		outlier markers when multiple y-axes share the same panel. Markers for the first
 * 		additional y-axis are styled with the value at index 0; markers for the second
 * 		additional y-axis, the value at index 1; and so forth. If not provided, a default
 * 		array of colors is assigned.
 * @param {string} [params.menuContextClass] A CSS class name used to query the menu DOM element
 * 		that contains the UI control for the outliers add-on. In a multi-chart document, the
 * 		add-on is available only on charts that have a menu DOM element with the value for
 * 		`menuContextClass` as a class attribute.
 *
 * @constructor
 * @name CIQ.Outliers
 * @since
 * - 7.5.0
 * - 8.0.0 Added `params.altColors` and `params.menuContextClass`.
 *
 * @example
 * new CIQ.Outliers({ stx: stxx });
 */
CIQ.Outliers =
	CIQ.Outliers ||
	function (params) {
		if (!params) params = {};
		if (!params.stx) {
			console.warn("The Outliers addon requires an stx parameter");
			return;
		}
		// Set default marker colors
		if (!Array.isArray(params.altColors)) {
			params.altColors = [
				"#323390",
				"#66308f",
				"#0073ba",
				"#f4932f",
				"#0056a4",
				"#00a99c",
				"#00a553",
				"#ea1d2c",
				"#e9088c",
				"#fff126",
				"#912a8e",
				"#ee652e",
				"#00afed",
				"#8ec648"
			];
		}
		this.stx = params.stx;
		this.stx.outliers = this;
		this.cssRequired = true;

		this.multiplier = params.multiplier || 3; // Default to 3 for extreme outliers
		this.altColors = params.altColors;

		this.axisData = {};

		// Listen for a layout changed event and reset the markers
		this.stx.addEventListener("layout", function (event) {
			Object.keys(event.stx.outliers.axisData).forEach(
				function (key) {
					this.removeAllMarkers(this.axisData[key]);
					delete this.axisData[key];
				}.bind(event.stx.outliers)
			);
		});

		if (CIQ.UI) {
			CIQ.UI.KeystrokeHub.addHotKeyHandler(
				"outliers",
				() => {
					document.body.keystrokeHub.context.advertised.Layout.setOutliers();
				},
				this.stx
			);
		}

		/**
		 * Checks for outlier values in `dataSet`, and adds outlier markers (data point markers
		 * and axis markers) to `axis`.
		 *
		 * @param {array} dataSet An array of objects of the form `{value: Number, quote: Object}`.
		 * 		Each object contains a value and its associated quote. The value is checked to
		 * 		determine whether it is an outlier of the data set. When checking more than one
		 * 		value for a quote (such as an OHLC quote), each value is included in a separate
		 * 		object; for example, `[{value: open, quote: quote}, {value: high, quote: quote},
		 * 		{value: low, quote: quote}, {value: close, quote: quote}...]`.
		 * @param {object} panel The panel where `dataSet` is rendered.
		 * @param {object} axis The y-axis against which `dataSet` is rendered. **Note:** Charts
		 * 		and panels can have multiple y-axes; each y-axis has its own set of outlier
		 * 		markers based on the data rendered on the axis.
		 * @return {array} A tuple consisting of the outlier minimum and maximum &mdash; or trend
		 * 		minimum and maximum, if no outliers are found &mdash; to be handled by the
		 * 		{@link CIQ.ChartEngine#determineMinMax} method. See the return value of the
		 * 		[find]{@link CIQ.Outliers#find} function for a description of outlier and trend
		 * 		minimum and maximum.
		 *
		 * @alias processDataSet
		 * @memberOf CIQ.Outliers.prototype
		 * @since 8.0.0
		 */
		this.processDataSet = function (dataSet, panel, axis) {
			if (!dataSet.length || dataSet.length <= 1) return false;

			var result = [0, 0]; // Min/Max axis values to return

			// Create an axis reference if one does not exist
			if (!this.axisData[axis.name]) {
				var markerColor = "";
				var axisDepth = -1;
				// Check for another axis using this panel
				Object.keys(this.axisData).forEach(
					function (key) {
						if (this.axisData[key].panel.name == panel.name) {
							axisDepth++;
						}
					}.bind(this)
				);
				if (axisDepth > -1 && axisDepth < this.altColors.length)
					markerColor = this.altColors[axisDepth];

				this.axisData[axis.name] = {
					axis: axis,
					panel: panel,
					displayState: "none",
					isFlipped: false,
					originalZoom: axis.zoom,
					markerColor: markerColor,
					markers: {},
					axisMarkers: {}
				};
			}

			var currentAxis = this.axisData[axis.name];
			// Attach the min/max values to the current axis data
			Object.assign(currentAxis, this.find(dataSet));

			// Update/add necessary markers
			this.refreshMarkerArray(currentAxis);

			// Update marker display and labels
			this.refreshMarkers(currentAxis);

			// Return either trendMin or outlierMin based on the axis displayState
			if (
				(currentAxis.displayState === "low" ||
					currentAxis.displayState === "all") &&
				currentAxis.outlierMin !== null
			)
				result[0] = currentAxis.outlierMin;
			else result[0] = currentAxis.trendMin;
			// Return either trendMax or outlierMax based on the axis displayState
			if (
				(currentAxis.displayState === "high" ||
					currentAxis.displayState === "all") &&
				currentAxis.outlierMax !== null
			)
				result[1] = currentAxis.outlierMax;
			else result[1] = currentAxis.trendMax;

			return result;
		};

		/**
		 * Finds the outliers contained in `dataSet`.
		 *
		 * **Note:** This function may be overridden to provide a custom algorithm for finding
		 * outliers.
		 *
		 * @param {array} dataSet An array of objects of the form `{value: Number, quote: Object}`.
		 * 		Each object contains a value and its associated quote. The value is checked to
		 * 		determine whether it is an outlier of the data set. When checking more than one
		 * 		value for a quote (such as an OHLC quote), each value is included in a separate
		 * 		object; for example, `[{value: open, quote: quote}, {value: high, quote: quote},
		 * 		{value: low, quote: quote}, {value: close, quote: quote}...]`.
		 * @return {object} An object of the form:
		 * ```
		 * {
		 * 	// Minimum and maximum threshold values of dataSet to be considered an outlier.
		 * 	minValue: null,
		 * 	maxValue: null,
		 * 	// Mininum and maximum values of dataSet that are not considered outliers.
		 * 	// Will be the least and greatest values in dataSet if no outliers are found.
		 * 	trendMin: null,
		 * 	trendMax: null,
		 * 	// Minimum and maximum values of dataSet that are considered outliers.
		 * 	// Will remain null if no outliers are found.
		 * 	outlierMin: null,
		 * 	outlierMax: null,
		 * 	// Array of individual outlier information for marker placement, in the format {DT:DateTime, value:Number, position:String}
		 * 	// (position is either 'high' or 'low').
		 * 	activeOutliers: []
		 * }
		 * ```
		 *
		 * @alias find
		 * @memberOf CIQ.Outliers.prototype
		 * @since
		 * - 7.5.0
		 * - 8.0.0 Added return value.
		 */
		this.find = function (dataSet) {
			if (!dataSet.length || dataSet.length <= 0) return;

			var createMarkerPlaceholder = function (data, position) {
				return {
					quote: data.quote,
					DT: data.quote.DT,
					value: data.value,
					position: position
				};
			};

			// The minimum and maximum threshold values to be considered an outlier.
			var minValue = null;
			var maxValue = null;
			// min/max values of available data that are not considered outliers. Will be the least and greatest values in the available data if no outliers are found.
			var trendMin = null;
			var trendMax = null;
			// min/max values of available data that are considered outliers. Will remain null if no outlier is found.
			var outlierMin = null;
			var outlierMax = null;
			// Array of outlier information in the format
			// {DT:DateTime, value:Number, position:String}
			var activeOutliers = [];

			var dataSorted = dataSet.slice();
			dataSorted.sort(function (a, b) {
				return a.value - b.value;
			});
			var dataLength = dataSorted.length;

			// Outlier threshold values are defined as more than the interquartile range above the third quartile
			// or below the first quartile, of the sorted dataSet, multiplied by the value of the
			// stxx.outlierMultiplier property.
			var q1 = dataSorted[Math.floor(dataLength / 4)].value;
			var q3 = dataSorted[Math.floor(dataLength * (3 / 4))].value;
			var iqr = q3 - q1;

			minValue = q1 - iqr * this.multiplier;
			maxValue = q3 + iqr * this.multiplier;

			// Loop through the sorted data and find the outliers as well as the trend min/max
			for (var idx = 0; idx < dataLength; idx++) {
				// Attack the array from both ends
				var dataLow = dataSorted[idx];
				var dataHigh = dataSorted[dataLength - (idx + 1)];

				// Find and mark outliers. Existing merkers will be refreshed in setMarker.
				if (dataLow.value <= minValue)
					activeOutliers.push(createMarkerPlaceholder(dataLow, "low"));
				if (dataHigh.value >= maxValue)
					activeOutliers.push(createMarkerPlaceholder(dataHigh, "high"));

				// Find the first low value that's less than or equal to outlier threshold min
				if (outlierMin === null && dataLow.value <= minValue)
					outlierMin = dataLow.value;
				// Find the first high value that's greater than or equal to outlier threshold max
				if (outlierMax === null && dataHigh.value >= maxValue)
					outlierMax = dataHigh.value;

				// Find the first low value that's greater than the outlier threshold min
				if (trendMin === null && dataLow.value > minValue)
					trendMin = dataLow.value;
				// Find the first high value that's less than the outlier threshold max
				if (trendMax === null && dataHigh.value < maxValue)
					trendMax = dataHigh.value;

				// No need to loop through the entire array. Once the trend min/max are found we're done.
				if (trendMin !== null && trendMax !== null) break;
			}

			return {
				minValue: minValue,
				maxValue: maxValue,
				trendMin: trendMin,
				trendMax: trendMax,
				outlierMin: outlierMin,
				outlierMax: outlierMax,
				activeOutliers: activeOutliers
			};
		};

		/**
		 * Updates the freshness status of outlier markers belonging to `targetAxis`.
		 *
		 * Sets the status to fresh if the markers represent data points in the `activeOutliers`
		 * list of `targetAxis` or a marker is an axis marker for high or low outliers and high or
		 * low outliers exist. (See the return value of the [find]{@link CIQ.Outliers#find}
		 * function for a description of the `activeOutliers` list.)
		 *
		 * Adds new markers to `targetAxis` for data points in the `activeOutliers` list not
		 * already represented by a marker (see [markOutlier]{@link CIQ.Outliers#markOutlier}).
		 * Adds new axis markers if the data set rendered on `targetAxis` contains high or low
		 * outliers and the respective axis marker does not exist (see
		 * [markAxis]{@link CIQ.Outliers#markAxis}).
		 *
		 * Sets the status of all other markers belonging to `targetAxis` to stale, or unfresh
		 * (these markers are ultimately removed).
		 *
		 * @param {object} targetAxis The y-axis for which the markers are refreshed.
		 * 		**Note:** Charts and panels can have multiple y-axes, each with its own array of
		 * 		outlier markers.
		 *
		 * @alias refreshMarkerArray
		 * @memberOf CIQ.Outliers.prototype
		 * @since 8.0.0
		 */
		this.refreshMarkerArray = function (targetAxis) {
			this.deprecateMarkers(targetAxis); // If a marker isn't refreshed below, it will be deleted in the next call

			var targetMarkers = targetAxis.markers;
			targetAxis.activeOutliers.forEach(
				function (outlier) {
					var quoteTime = outlier.DT.getTime().toString();
					// Add a quote marker if there isn't one already
					if (!targetMarkers[quoteTime]) {
						targetMarkers[quoteTime] = {
							isFresh: true,
							type: "quote",
							value: outlier.value,
							marker: this.markOutlier(outlier, outlier.position, targetAxis)
						};
					}
					// Always refresh the status of the marker
					targetMarkers[quoteTime].isFresh = true;
				}.bind(this)
			);
			if (targetAxis.outlierMax !== null) {
				// Add the high axis marker if there isn't one
				if (!targetMarkers.axisHigh) {
					targetMarkers.axisHigh = {
						isFresh: true,
						type: "axis",
						value: targetAxis.outlierMax,
						marker: this.markAxis("high", targetAxis)
					};
				}
				// Always refresh the status of the marker
				targetMarkers.axisHigh.isFresh = true;
			}
			if (targetAxis.outlierMin !== null) {
				// Add the low axis marker if there isn't one
				if (!targetMarkers.axisLow) {
					targetMarkers.axisLow = {
						isFresh: true,
						type: "axis",
						value: targetAxis.outlierMin,
						marker: this.markAxis("low", targetAxis)
					};
				}
				// Always refresh the status of the marker
				targetMarkers.axisLow.isFresh = true;
			}
		};

		/**
		 * Sets the outlier display state, which determines whether to display outlier markers.
		 *
		 * @param {string} newState The intended display state; should be one of:
		 * <ul>
		 *		<li>"high" &mdash; Show high outliers; hide high outlier markers.</li>
		 *		<li>"low" &mdash; Show low outliers; hide low outlier markers.</li>
		 *		<li>"all" &mdash; Show high and low outliers; hide high and low outlier markers.</li>
		 *		<li>"none" &mdash; Hide high and low outliers; show high and low outlier markers.</li>
		 * </ul>
		 * If none of the above is provided, "none" is assumed.
		 * @param {object} targetAxis The y-axis on which the outlier state is set. **Note:** A
		 * 		chart or panel can have multiple y-axes.
		 *
		 * @alias setDisplayState
		 * @memberOf CIQ.Outliers.prototype
		 * @since
		 * - 7.5.0
		 * - 8.0.0 Added `targetAxis` parameter.
		 */
		this.setDisplayState = function (newState, targetAxis) {
			if (newState != "high" && newState != "low" && newState != "all")
				newState = "none";

			var displayState = newState;
			// Set the value of displayState to show the intended state, based on its existing state. This
			// allows the markers to toggle between states without concern for what is currently displayed.
			// For example: if the current display state is showing low outlier only, and the intent is to
			// now display high outliers as well, then the display state will change to 'all'.
			// This will toggle the high/low state off as well.
			if (targetAxis.displayState == "all" && newState == "high")
				displayState = "low";
			else if (targetAxis.displayState == "all" && newState == "low")
				displayState = "high";
			else if (targetAxis.displayState == "high" && newState == "low")
				displayState = "all";
			else if (targetAxis.displayState == "low" && newState == "high")
				displayState = "all";
			else if (targetAxis.displayState == newState) displayState = "none";

			targetAxis.displayState = displayState;
			// Reset the axis zoom state
			targetAxis.axis.zoom = targetAxis.originalZoom;

			this.refreshMarkers(targetAxis);
			this.stx.draw();
		};

		/**
		 * Removes all markers from `targetAxis` that are no longer fresh; that is, markers that
		 * do not represent data points in the current data set, or axis markers that are
		 * irrelevant because high or low outliers no longer exist. Sets the status of all
		 * remaining outlier markers to stale, or not fresh (the freshness status should
		 * subsequently be reevaluated).
		 *
		 * @param {object} targetAxis The y-axis for which the markers are deprecated. **Note:**
		 * 		A chart or panel can have multiple y-axes; each y-axis has its own outlier
		 * 		markers based on the data rendered on the axis.
		 *
		 * @alias deprecateMarkers
		 * @memberOf CIQ.Outliers.prototype
		 * @since
		 * - 7.5.0
		 * - 8.0.0 Added `targetAxis` parameter.
		 */
		this.deprecateMarkers = function (targetAxis) {
			var removeMarker = function (marker) {
				if (marker.marker && !marker.isFresh) {
					if (marker.marker.remove) marker.marker.remove();
					marker.marker = null;
				} else {
					marker.isFresh = false;
				}
			};

			// Handle the outlier markers
			Object.keys(targetAxis.markers).forEach(
				function (key) {
					removeMarker(this.markers[key]);
					// Remove the marker property if its marker has been removed
					if (!this.markers[key].marker) {
						delete this.markers[key];
					}
				}.bind(targetAxis)
			);
		};

		/**
		 * Removes all outlier markers from `targetAxis`, including data point markers and y-axis
		 * markers.
		 *
		 * @param {object} targetAxis The y-axis from which the markers are removed. **Note:**
		 * 		Charts and panels can have multiple y-axes, each with its own outlier markers.
		 *
		 * @alias removeAllMarkers
		 * @memberOf CIQ.Outliers.prototype
		 * @since
		 * - 7.5.0
		 * - 8.0.0 Added `targetAxis` parameter.
		 */
		this.removeAllMarkers = function (targetAxis) {
			Object.keys(targetAxis.markers).forEach(function (key) {
				var targetMarker = targetAxis.markers[key].marker;
				if (targetMarker) {
					if (targetMarker.remove) targetMarker.remove();
					targetMarker = null;
				}
				// Remove the marker property if its marker has been removed
				if (!targetMarker) {
					delete targetAxis.markers[key];
				}
			});
		};

		/**
		 * Shows or hides outlier markers based on the display state.
		 *
		 * See [setDisplayState]{@link CIQ.Outliers#setDisplayState}.
		 *
		 * @alias updateMarkerVisibility
		 * @memberOf CIQ.Outliers.prototype
		 * @since 7.5.0
		 */
		this.updateMarkerVisibility = function () {
			Object.keys(this.markers).forEach(
				function (key) {
					if (
						this.displayState == "all" ||
						this.markers[key].marker.node.classList.contains(this.displayState)
					)
						this.markers[key].marker.node.style.display = "none";
					else this.markers[key].marker.node.style.display = "block";
				}.bind(this)
			);
		};

		/**
		 * Updates the position of the axis outlier marker represented by `node`.
		 *
		 * @param {HTMLElement} node The axis marker to position.
		 * @param {object} targetAxis The y-axis on which the axis marker is positioned.
		 *
		 * @alias refreshAxisMarkers
		 * @memberOf CIQ.Outliers.prototype
		 * @since
		 * - 7.5.0
		 * - 8.0.0 Added `targetAxis` parameter.
		 */
		this.refreshAxisMarkers = function (node, targetAxis) {
			var isHigh = false;
			var positionClass = "low";
			if (node.classList.contains("high")) {
				isHigh = true;
				positionClass = "high";
			}
			var posTop = targetAxis.axis.top;
			// Set the low marker of reverse the value if the axis is flipped
			if (
				(!targetAxis.isFlipped && !isHigh) ||
				(targetAxis.isFlipped && isHigh)
			) {
				posTop = targetAxis.axis.bottom - 50;
			}
			// Overlap the markers in the center for nano size because it's all or nothing at that size.
			if (node.classList.contains("nano")) {
				posTop = targetAxis.axis.top + targetAxis.axis.height / 2 - 22;
			}

			var xFormLeft = Math.floor(targetAxis.axis.left).toString() + "px";
			var xFormTop = Math.floor(posTop).toString() + "px";
			// Use the vlaue property instead
			var labelPrice = isHigh ? targetAxis.outlierMax : targetAxis.outlierMin;

			// Set marker positioning relative to the y-axis
			node.style.transform = "translate(" + xFormLeft + ", " + xFormTop + ")";
			node.querySelector(
				".outlier-value"
			).innerText = this.stx.formatYAxisPrice(labelPrice);
			// Apply .right class when axis is on the left to right position child elements
			if (xFormLeft === "0px") node.classList.add("right");
			else node.classList.remove("right");
		};

		/**
		 * Updates the display styles of all outlier markers belonging to `targetAxis`, including
		 * data point markers and axis markers. Shows the markers if outliers are hidden and the
		 * marked outliers exceed the bounds of `targetAxis`. Flips the markers if `targetAxis`
		 * has been inverted (see [flipMarkers]{@link CIQ.Outliers#flipMarkers}).
		 *
		 * @param {object} targetAxis The y-axis on which the markers are refreshed. **Note:**
		 * 		Charts and panels can have multiple y-axes, each with its own outlier markers.
		 *
		 * @alias refreshMarkers
		 * @memberOf CIQ.Outliers.prototype
		 * @since 8.0.0
		 */
		this.refreshMarkers = function (targetAxis) {
			Object.keys(targetAxis.markers).forEach(
				function (targetAxis, key) {
					var targetMarker = targetAxis.markers[key].marker;
					var targetValue = targetAxis.markers[key].value;
					var targetType = targetAxis.markers[key].type;
					// Check the marker value against the actual axis min/max. This accounts for yaxis scaling
					// in addition to the outlier display state.
					if (
						(targetValue > targetAxis.trendMax &&
							targetAxis.axis.high >= targetValue) ||
						(targetValue < targetAxis.trendMin &&
							targetAxis.axis.low <= targetValue)
					) {
						if (targetType == "quote") {
							targetMarker.node.style.display = "none";
						} else if (targetType == "axis") {
							targetMarker.node.classList.add("compress");
						}
					} else {
						if (targetType == "quote") {
							targetMarker.node.style.display = "block";
						} else if (targetType == "axis") {
							targetMarker.node.classList.remove("compress");
						}
					}

					if (targetType == "axis") {
						this.refreshAxisMarkers(targetMarker.node, targetAxis);
					}

					// Update the marker responsive style
					if (targetAxis.axis.height < 100)
						targetMarker.node.classList.add("nano");
					else targetMarker.node.classList.remove("nano");

					if (targetAxis.axis.height < 250)
						targetMarker.node.classList.add("micro");
					else targetMarker.node.classList.remove("micro");
				}.bind(this, targetAxis)
			);

			// Check for a change in the flipped state of the axis
			if (targetAxis.isFlipped !== targetAxis.axis.flipped)
				this.flipMarkers(targetAxis);
		};

		/**
		 * Places markers on the y-axis when high or low outliers exist.
		 *
		 * @param {string} position The position of the marker; either "high" or "low". If the
		 * 		position is "high", the marker is placed at the top of the axis; if "low", at the
		 * 		bottom of the axis.
		 * @param {object} targetAxis The y-axis on which the markers are placed. **Note:**
		 * 		Charts and panels can have multiple y-axes, each with its own outlier markers.
		 * @return {CIQ.Marker} The axis outlier marker, which is added to the display.
		 *
		 * @alias markAxis
		 * @memberOf CIQ.Outliers.prototype
		 * @since
		 * - 7.5.0
		 * - 8.0.0 Added `position` and `targetAxis` parameters and return value.
		 */
		this.markAxis = function (position, targetAxis) {
			// Create a marker positioned on the Y axis and return it.
			var axisMarker = document.createElement("div");
			axisMarker.classList.add("outlier-sticker", "axis", "mini", position);
			axisMarker.innerHTML =
				'<div class="expansion"><div class="pill"><div class="icon"></div></div><div class="tick"></div><span class="outlier-value"></div><div class="compression"><div class="pill"><div class="icon"></div></div></div></span>';

			this.matchYAxisStyle(axisMarker);
			this.setMarkerColor(axisMarker, targetAxis.markerColor);

			var activate = this.handleMarkerClick.bind(
				this,
				position,
				targetAxis,
				axisMarker
			);
			axisMarker.addEventListener("click", activate);
			axisMarker.addEventListener("touchend", activate);

			return new CIQ.Marker({
				stx: this.stx,
				xPositioner: "none",
				yPositioner: "none",
				label: "expand",
				permanent: true,
				chartContainer: true,
				node: axisMarker
			});
		};

		/**
		 * Adds an outlier marker to a tick (data point).
		 *
		 * @param {object} data Represents the tick that is marked as an outlier. Contains the
		 * 		outlier value and its associated quote; for example,
		 * 		`{value: Number, quote: Object}`.
		 * @param {string} position The position of the marker; either "high" or "low". If the
		 * 		position is "high", the marker is placed at the top of the chart; if "low", at the
		 * 		bottom of the chart.
		 * @param {object} targetAxis The y-axis to which the marker is added. **Note:** A chart
		 * 		or panel can have multiple y-axes; each y-axis has its own outlier markers.
		 * @return {CIQ.Marker} The outlier marker, which is added to the display.
		 *
		 * @alias markOutlier
		 * @memberOf CIQ.Outliers.prototype
		 * @since
		 * - 7.5.0
		 * - 8.0.0 Added `targetAxis` parameter.
		 */
		this.markOutlier = function (data, position, targetAxis) {
			if (!data) return;
			if (!targetAxis) targetAxis = { panel: this.stx.panels.chart };
			position = position || "high";

			// Create a marker
			var outlierMarker = document.createElement("div");
			outlierMarker.classList.add("outlier-sticker", "quote", "mini", position);
			outlierMarker.innerHTML =
				'<div class="pill"><div class="icon"></div></div><span class="outlier-value">' +
				this.stx.formatYAxisPrice(data.value, targetAxis.panel) +
				"</span>";

			this.matchYAxisStyle(outlierMarker);
			this.setMarkerColor(outlierMarker, targetAxis.markerColor);

			var activate = this.handleMarkerClick.bind(
				this,
				position,
				targetAxis,
				outlierMarker
			);
			outlierMarker.addEventListener("click", activate);
			outlierMarker.addEventListener("touchend", activate);

			return new CIQ.Marker({
				stx: this.stx,
				xPositioner: "date",
				yPositioner: position == "high" ? "top" : "bottom",
				x: data.quote.DT,
				panelName: targetAxis.panel.name,
				node: outlierMarker
			});
		};

		/**
		 * Calls [setDisplayState]{@link CIQ.Outliers#setDisplayState} in response to selecting an
		 * outlier marker.
		 *
		 * @param {string} position The position of the marker; either "high" or "low".
		 * @param {object} targetAxis The y-axis that contains the selected marker. **Note:**
		 * 		Charts and panels can have multiple y-axes; each y-axis has its own outlier
		 * 		markers.
		 * @param {HTMLElement} targetNode The selected outlier marker DOM node.
		 *
		 * @alias handleMarkerClick
		 * @memberOf CIQ.Outliers.prototype
		 * @since 8.0.0
		 */
		this.handleMarkerClick = function (position, targetAxis, targetNode) {
			if (targetNode.classList.contains("nano")) position = "all"; // not concerned about differentiation between high and low at the nano size
			this.setDisplayState(position, targetAxis);
			this.stx.draw();
		};

		/**
		 * Sets the CSS style properties of the y-axis outlier marker to match the CSS styling of
		 * the y-axis itself.
		 *
		 * @param {HTMLElement} node The y-axis marker to style.
		 *
		 * @alias matchYAxisStyle
		 * @memberOf CIQ.Outliers.prototype
		 * @since 7.5.0
		 */
		this.matchYAxisStyle = function (node) {
			// Apply styles from the yAxis
			if (this.stx.styles.stx_yaxis) {
				var styles = this.stx.styles.stx_yaxis;
				node.style.fontSize = styles.fontSize;
				node.style.fontFamily = styles.fontFamily;
				node.style.color = styles.color;
				node.style.borderColor = styles.color;
			}
		};

		/**
		 * Applies a background color to an outlier data point marker.
		 *
		 * @param {HTMLElement} node The outlier marker DOM node to which the background color is
		 * 		applied.
		 * @param {string} color The hexadecimal color value set as the node background color.
		 *
		 * @alias setMarkerColor
		 * @memberOf CIQ.Outliers.prototype
		 * @since 8.0.0
		 */
		this.setMarkerColor = function (node, color) {
			if (color == "") return;
			//Set marker color
			var markerPills = node.querySelectorAll(".pill");
			for (var markerIdx = 0; markerIdx < markerPills.length; markerIdx++) {
				markerPills[markerIdx].style.backgroundColor = color;
			}
		};

		/**
		 * Repositions outlier markers from the top of the display to the bottom (or vice versa)
		 * when the associated y-axis has been flipped (inverted).
		 *
		 * @param {object} targetAxis The y-axis that has been flipped.
		 *
		 * @alias flipMarkers
		 * @memberOf CIQ.Outliers.prototype
		 * @since 8.0.0
		 */
		this.flipMarkers = function (targetAxis) {
			targetAxis.isFlipped = targetAxis.axis.flipped;

			Object.keys(targetAxis.markers).forEach(
				function (targetAxis, key) {
					var targetMarker = targetAxis.markers[key].marker;
					var targetValue = targetAxis.markers[key].value;
					var targetType = targetAxis.markers[key].type;
					// Check for flipped state and add/remove flipped class
					if (targetAxis.isFlipped) {
						targetMarker.node.classList.add("flipped");
					} else {
						targetMarker.node.classList.remove("flipped");
					}

					// Set Y positioning of quote markers
					if (targetType == "quote") {
						if (targetValue > targetAxis.trendMax) {
							// High marker
							if (targetAxis.isFlipped)
								targetMarker.params.yPositioner = "bottom";
							else targetMarker.params.yPositioner = "top";
						} else if (targetValue < targetAxis.trendMin) {
							// Low marker
							if (targetAxis.isFlipped) targetMarker.params.yPositioner = "top";
							else targetMarker.params.yPositioner = "bottom";
						}
					}
				}.bind(this, targetAxis)
			);
		};

		var originalDetermineMinMax = CIQ.ChartEngine.prototype.determineMinMax.bind(
			this.stx
		);
		/**
		 * Overrides the default `CIQ.ChartEngine.prototype.determineMinMax` function when the
		 * Outliers add-on is active. Injects the local {@link CIQ.Outliers#processDataSet}
		 * function as a data filter and passes the filter along to the original `determineMinMax`
		 * function (see below).
		 *
		 * @param {array} quotes The array of quotes (typically
		 * 		`CIQ.ChartEngine.chart.dataSegment`) to evaluate for minimum and maximum values.
		 * @param {array} fields A list of fields to compare.
		 * @param {boolean|array} [sum] If true, then compute maximum sum rather than the maximum
		 * 		single value across all fields. If an array, compute sum over just the fields in
		 * 		the array.
		 * @param {boolean} [bypassTransform] If true, bypass any transformations.
		 * @param {number} [length] Specifies how many elements of the quotes array to process.
		 * @param {boolean} [checkArray] If true, the type of the value used to determine the
		 * 		min/max is checked to ascertain whether it is an array; if so, the first element
		 * 		of the array is retrieved for use in the min/max determination.
		 * @param {CIQ.ChartEngine.Panel} [panel] A reference to the panel rendering the quotes.
		 * @param {CIQ.ChartEngine.YAxis} [axis] A reference to the y-axis rendered for the quotes.
		 * @param {array} [filters] Array of functions to process the min/max values before
		 * 	returning. Filter functions must return a valid min/max tuple or false.
		 * @return {function} A reference to the original
		 * 		`CIQ.ChartEngine.prototype.determineMinMax` library function.
		 *
		 * @memberof CIQ.ChartEngine
		 * @since
		 * - 7.5.0
		 * - 8.0.0 Allow the `sum` parameter to be an array of valid fields to sum over.
		 * 		Added the `panel`, `axis`, and `filters` parameters.
		 * @private
		 */
		CIQ.ChartEngine.prototype.determineMinMax = function (
			quotes,
			fields,
			sum,
			bypassTransform,
			length,
			checkArray,
			panel,
			axis,
			filters
		) {
			if (!filters) filters = [];
			if (panel && axis && this.layout.outliers)
				filters.push(this.outliers.processDataSet.bind(this.outliers));
			return originalDetermineMinMax(
				quotes,
				fields,
				sum,
				bypassTransform,
				length,
				checkArray,
				panel,
				axis,
				filters
			);
		};
	};

/**
 * CIQ.Marker interface placeholder to be augmented in *standard.js* with properties.
 *
 * @tsinterface CIQ~Marker
 */

};


let __js_addons_advanced_plotComplementer_ = (_exports) => {

/* global _CIQ, _timezoneJS, _SplinePlotter */

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : _exports.CIQ;

/**
 * Creates an add-on that enables a series to complement another series.
 *
 * ![Plot Complementer](./img-Data-Forecasting.png)
 *
 * The complementary series is a permanent fixture of the series which it complements. It moves
 * in tandem with the series, and gets removed with the series. In all other respects, though, it
 * behaves like its own series. It shows separately in the panel legend and plots using its own
 * renderer.
 *
 * Charts can have multiple `PlotComplementer` instances. Each instance is attached to the chart
 * engine as a member of a `PlotComplementer` collection.
 *
 * Multiple `PlotComplementer` instances can be associated with a time series. To link a
 * `PlotComplementer` to a series, specify the series instrument in the `params.filter` function.
 * See `[setQuoteFeed]{@link CIQ.PlotComplementer#setQuoteFeed}`.
 *
 * **Note:** The series created by this add-on is not exported with the layout, since it is
 * created in tandem with the series it complements. Currently, this feature works only with
 * non-comparison series.
 *
 * Requires *addOns.js*.
 *
 * @param {object} params Configuration parameters.
 * @param {CIQ.ChartEngine} params.stx The chart object.
 * @param {string} [params.id] Unique key used by the add-on to identify itself. If not supplied,
 * 		a random key is chosen.
 * @param {object} [params.quoteFeed] Attaches the quote feed to the quote driver to satisfy any
 * 		quote requests for any series created by the add-on.
 * @param {object} [params.behavior] Used as the behavior for the quote feed supplied in this
 * 		parameter list.
 * @param {function} [params.filter] Used as the filter for the quote feed supplied in this
 * 		parameter list. See `[setQuoteFeed]{@link CIQ.PlotComplementer#setQuoteFeed}`.
 * @param {object} [params.decorator] Container object for the `symbol` and `display` properties.
 * 		The `decorator` provides the label (`symbol`) for the complementary series and a short
 * 		description (`display`) that is appended to the label; for example:
 * ```
 * decorator: {symbol:"_fcst", display:" Forecast"}
 * ```
 * @param {string} [params.decorator.symbol] Adds this string onto the ID when creating the
 * 		complementary series. Otherwise, a unique ID is used.
 * @param {string} [params.decorator.display] Customizes the display value of the series.
 * @param {object} [params.renderingParameters={chartType: "line", width: 1, opacity: 0.5}] A
 * 		collection of parameters that override the default rendering parameters. The
 * 		`renderingParameters` object can be set or changed at any time. The default parameters
 * 		can be restored by calling {@link CIQ.PlotComplementer#resetRenderingParameters}.
 * 		<p>Here are a few examples of rendering parameters:</p>
 * ```
 * // Assuming a PlotComplementer declared as "forecaster":
 * forecaster.renderingParameters = {chartType:"scatterplot", opacity:0.5, field:"Certainty"}
 * forecaster.renderingParameters = {chartType:"histogram", border_color:"transparent", opacity:0.3}
 * forecaster.renderingParameters = {chartType:"channel", opacity:0.5, pattern:"dotted"}
 * forecaster.renderingParameters = {chartType:"candle", opacity:0.5, color:"blue", border_color:"blue"}
 * ```
 *
 * @constructor
 * @name CIQ.PlotComplementer
 * @since 7.3.0
 *
 * @example <caption>Forecasting</caption>
 * let forecaster = new CIQ.PlotComplementer({
 *     stx:stxx,
 *     id:"forecast",
 *     quoteFeed: fcstFeed.quoteFeedForecastSimulator,
 *     behavior: {refreshInterval:60},
 *     decorator: {symbol:"_fcst", display:" Forecast"},
 *     renderingParameters: {chartType:"channel", opacity:0.5, pattern:"dotted"}
 * });
 */
CIQ.PlotComplementer =
	CIQ.PlotComplementer ||
	function (params) {
		var stx = params.stx;
		var unique = CIQ.uniqueID();
		if (!params.decorator) params.decorator = {};
		var symbolDecorator = params.decorator.symbol || "_" + unique;
		var displayDecorator = params.decorator.display || " (addl)";
		if (!stx.plotComplementers) stx.plotComplementers = [];
		stx.plotComplementers.push(this);

		this.id = params.id || unique;

		this.defaultRenderingParameters = {
			chartType: "line",
			width: 1,
			opacity: 0.5
		};

		if (params.renderingParameters)
			this.defaultRenderingParameters = params.renderingParameters;

		var self = this;
		function addSeries(stx, symbol, parameters, id) {
			function verifyQuoteFeed(stx) {
				if (!stx.quoteDriver) return;
				if (!params.quoteFeed) return;
				for (var qf = 0; qf < stx.quoteDriver.quoteFeeds.length; qf++) {
					if (stx.quoteDriver.quoteFeeds[qf].engine == params.quoteFeed) return;
				}
				return "err";
			}
			if (verifyQuoteFeed(stx) == "err") return;
			if (!id) id = symbol;
			if (stx.isEquationChart(symbol)) return;
			if (!parameters) parameters = {};
			if (parameters.isComparison) return;
			if (id && id.indexOf(symbolDecorator) == -1) {
				var fId = id + symbolDecorator,
					fSymbol = symbol + symbolDecorator;
				var masterRenderer = stx.getRendererFromSeries(id);
				var myParms = CIQ.extend(
					{
						display: symbol + displayDecorator,
						name: fId,
						symbol: fSymbol,
						symbolObject: {
							symbol: fSymbol,
							generator: self.id,
							masterSymbol: symbol
						},
						overChart: false,
						gapDisplayStyle: true,
						permanent: true,
						panel: parameters.panel,
						yAxis: parameters.yAxis,
						shareYAxis: true,
						loadData: !!self.quoteFeed,
						dependentOf: masterRenderer
							? masterRenderer.params.name
							: stx.mainSeriesRenderer.params.name
					},
					self.renderingParameters
				);
				if (!myParms.color) myParms.color = parameters.color || "auto";
				stx.addSeries(fId, myParms, function (error, obj) {
					if (error) stx.removeSeries(fId, stx.chart);
					if (stx.chart.seriesRenderers[fId]) {
						stx.chart.seriesRenderers[fId].params.display = myParms.display;
					}
				});
			}
		}

		function removeSeries(stx, id, chart) {
			if (id && id.indexOf(symbolDecorator) == -1)
				stx.removeSeries(id + symbolDecorator, chart);
		}

		function symbolChange(obj) {
			if (obj.action == "master") {
				if (!obj.prevSymbol) obj.prevSymbol = obj.symbol;
				removeSeries(obj.stx, obj.prevSymbol, obj.stx.chart);
				addSeries(obj.stx, obj.symbol);
			} else if (obj.action == "add-series") {
				removeSeries(obj.stx, obj.id, obj.stx.chart);
				addSeries(obj.stx, obj.symbol, obj.parameters, obj.id);
			} else if (obj.action == "remove-series") {
				removeSeries(obj.stx, obj.id, obj.stx.chart);
			}
		}

		stx.addEventListener("symbolChange", symbolChange);
		stx.addEventListener("symbolImport", symbolChange);

		/**
		 * Resets the `PlotComplementer` rendering values to the default settings.
		 *
		 * Default settings can be provided in the parameters passed to the `PlotComplementer` constructor. If no settings are
		 * provided to the constructor, `PlotComplementer` uses the following defaults: `{ chartType:"line", width:1, opacity:0.5 }`.
		 *
		 * The rendering parameters may be set anytime after creating `PlotComplementer`; for example, to set an ad-hoc rendering
		 * right before adding a series.
		 *
		 * @alias resetRenderingParameters
		 * @memberof CIQ.PlotComplementer.prototype
		 * @since 7.3.0
		 */
		this.resetRenderingParameters = function () {
			this.renderingParameters = this.defaultRenderingParameters;
		};

		/**
		 * Sets a quote feed for the `PlotComplementer`.
		 *
		 * Automatically called when a quote feed is provided in the constructor argument. If a
		 * quote feed or `behavior` object is not specified in `params`, this function returns
		 * without doing anything.
		 *
		 * @param {object} params Configuration parameters.
		 * @param {object} params.quoteFeed Quote feed to attach to the quote driver to satisfy
		 * 		any quote requests for any series created by the add-on. This quote feed is like
		 * 		any time series quote feed object. See the
		 * 		[Data Integration Overview]{@tutorial DataIntegrationOverview}.
		 * @param {object} params.behavior Behavior for the quote feed supplied in this parameter
		 * 		list. This object is like any `behavior` object associated with a quote feed.
		 * 		See {@link CIQ.ChartEngine#attachQuoteFeed} for more information on `behavior`
		 * 		objects.
		 * @param {function} [params.filter] Filters the quote feed supplied in this parameter
		 * 		list. The filter function takes as an argument an object typically containing
		 * 		`symbolObject`, `symbol`, and `interval` properties. The properties associate the
		 * 		`PlotComplementer` with an instrument. If the `filter` function returns true, the
		 * 		`PlotComplementer` quote feed is used for the instrument.
		 * 		<p>This `filter` function is like the `filter` in basic quote feeds.
		 * 		See {@link CIQ.ChartEngine#attachQuoteFeed} for more information on quote feed
		 * 		`filter` functions.</p>
		 * @alias setQuoteFeed
		 * @memberof CIQ.PlotComplementer.prototype
		 * @since 7.3.0
		 */
		this.setQuoteFeed = function (params) {
			if (!params.quoteFeed || !params.behavior) return;
			var behavior = CIQ.clone(params.behavior);
			behavior.generator = this.id;
			var existingFilter = params.filter;
			var filter = function (params) {
				if (existingFilter && !existingFilter(params)) return false;
				return params.symbolObject.generator == behavior.generator;
			};
			stx.attachQuoteFeed(params.quoteFeed, behavior, filter);
			this.quoteFeed = params.quoteFeed;
		};

		this.setQuoteFeed(params);
		this.resetRenderingParameters();
	};

};


let _exports = {CIQ};
export {__js_addons_standard_extendedHours_ as extendedHours};
export {__js_addons_standard_fullScreen_ as fullScreen};
export {__js_addons_standard_inactivityTimer_ as inactivityTimer};
export {__js_addons_standard_rangeSlider_ as rangeSlider};
export {__js_addons_standard_shortcuts_ as shortcuts};
export {__js_addons_standard_tableView_ as tableView};
export {__js_addons_standard_tooltip_ as tooltip};
export {__js_addons_advanced_animation_ as animation};
export {__js_addons_advanced_continuousZoom_ as continuousZoom};
export {__js_addons_advanced_outliers_ as outliers};
export {__js_addons_advanced_plotComplementer_ as plotComplementer};

export {CIQ};

/* global __TREE_SHAKE__ */
if (typeof __TREE_SHAKE__ === "undefined" || !__TREE_SHAKE__) {
	(_exports.CIQ || CIQ).activateImports(
		__js_addons_standard_extendedHours_,
		__js_addons_standard_fullScreen_,
		__js_addons_standard_inactivityTimer_,
		__js_addons_standard_rangeSlider_,
		__js_addons_standard_shortcuts_,
		__js_addons_standard_tableView_,
		__js_addons_standard_tooltip_,
		__js_addons_advanced_animation_,
		__js_addons_advanced_continuousZoom_,
		__js_addons_advanced_outliers_,
		__js_addons_advanced_plotComplementer_,
		null
	);
}