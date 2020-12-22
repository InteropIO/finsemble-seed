(function (definition) {
	"use strict";
	if (typeof exports === "object" && typeof module === "object") {
		module.exports = definition(
			require("chartiq/js/componentUI"),
			require("chartiq/examples/feeds/quoteFeedSimulator"),
			require("chartiq/examples/feeds/quoteFeedForecastSimulator")
		);
	} else if (typeof define === "function" && define.amd) {
		define([
			"chartiq/js/componentUI",
			"chartiq/examples/feeds/quoteFeedSimulator",
			"chartiq/examples/feeds/quoteFeedForecastSimulator",
		], definition);
	} else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition(global, global, global);
	} else {
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for sample-config.js.");
	}
})(function(_exports, quotefeed, forecastQuoteFeed){
	var CIQ = _exports.CIQ;
	function getDefaultConfig() {
		return {
			// Symbol can be string or 
			// or an object containing property symbol of string type along with other properties
			initialSymbol: "AAPL",
			onNewSymbolLoad: {
				// if available called for each series in chart to test if it needs to be removed
				// when new primary symbol is loaded
				removeSeries(series) { 
					return series.parameters.bucket !== "study"; // keeps only studies
				},
				// handle symbol load error
				loadError(error, uiContext) {
				}
			},
			// save and restore layout, preferences and drawings
			restore: true,
			// language: "de", // Optionally set a language for the UI, after it has been initialized, and translate.
			// default lookup driver is defined in examples/feeds/symbolLookupChartIQ.js, it needs to be loaded to be available
			LookupDriver: CIQ.ChartEngine.Driver.Lookup.ChartIQ,
			// Optionally set a market factory to the chart to make it market hours aware. Otherwise it will operate in 24x7 mode.
			// This is required for the simulator, or if you intend to also enable Extended hours trading zones.
			// Please note that, this method is set to use the CIQ.Market.Symbology functions by default,
			// which must be reviewed and adjust to comply with your quote feed and symbology format before they can be used.
			// Sample default setting requires resources loaded from
			// chartiq/examples/markets/marketDefinitionsSample and
			// chartiq/examples/markets/marketSymbologySample
			marketFactory: CIQ.Market.Symbology.factory, 
			// All configuration parametrs for chart engine except for container property
			// Only few are configured here. View available in https://documentation.chartiq.com/CIQ.ChartEngine.html
			chartEngineParams: { 
				preferences: {
					labels: false, 
					currentPriceLine: true, 
					whitespace: 0
				}
			},
			// Array of objects containing properties to attach automated quote feeds
			// to the chart to handle initial load, pagination and updates at preset intervals.
			// Property detail - {@link CIQ.ChartEngine#attachQuoteFeed}
			quoteFeeds: [
				{
					quoteFeed: quotefeed.quoteFeedSimulator,
					behavior: { refreshInterval: 1, bufferSize: 200 },
					// filter: () => {}
				}
			],
			selector: {
				sideNav: ".ciq-sidenav",
				sidePanel: "cq-side-panel",
				lookupComponent: ".ciq-search cq-lookup",
				studyLegend: "cq-study-legend",
				timeSpanEvent: ".stx-markers cq-item.span-event",
				markersMenuItem: ".stx-markers cq-item",
				themesMenuItem: "cq-themes",
				tfcTradePanel: ".stx-trade-panel",
				tfcToggle: ".stx-trade",
			},
			themes: {
				builtInThemes: { "ciq-day": "Day", "ciq-night": "Night" },
				defaultTheme: "ciq-night",
				nameValueStore: new CIQ.NameValueStore()
			},
			// menu items
			menuPeriodicity: [
				{ type: "item", label: "1 D", cmd: "Layout.setPeriodicity(1,1,'day')" },
				{ type: "item", label: "1 W", cmd: "Layout.setPeriodicity(1,1,'week')" },
				{ type: "item", label: "1 Mo", cmd: "Layout.setPeriodicity(1,1,'month')" },
				{ type: "separator", },
				{ type: "item", label: "1 Min", cmd: "Layout.setPeriodicity(1,1,'minute')" },
				{ type: "item", label: "5 Min", cmd: "Layout.setPeriodicity(1,5,'minute')" },
				{ type: "item", label: "10 Min", cmd: "Layout.setPeriodicity(1,10,'minute')" },
				{ type: "item", label: "15 Min", cmd: "Layout.setPeriodicity(3,5,'minute')" },
				{ type: "item", label: "30 Min", cmd: "Layout.setPeriodicity(1,30,'minute')" },
				{ type: "item", label: "1 Hour", cmd: "Layout.setPeriodicity(2,30,'minute')" },
				{ type: "item", label: "4 Hour", cmd: "Layout.setPeriodicity(8,30,'minute')" },
				{ type: "separator", },
				{ type: "item", label: "1 Sec", cmd: "Layout.setPeriodicity(1,1,'second')" },
				{ type: "item", label: "10 Sec", cmd: "Layout.setPeriodicity(1,10,'second')" },
				{ type: "item", label: "30 Sec", cmd: "Layout.setPeriodicity(1,30,'second')" },
				{ type: "separator", },
				{ type: "item", label: "250 MSec", cmd: "Layout.setPeriodicity(1,250,'millisecond')" }
			],
			menuChartStyle: [
				{ type: "radio", label: "Candle", cmd: "Layout.ChartType('candle')" },
				{ type: "radio", label: "Bar", cmd: "Layout.ChartType('bar')" },
				{ type: "radio", label: "Colored Bar", cmd: "Layout.ChartType('colored_bar')" },
				{ type: "radio", label: "Line", cmd: "Layout.ChartType('line')" },
				{ type: "radio", label: "Vertex Line", cmd: "Layout.ChartType('vertex_line')" },
				{ type: "radio", label: "Step", cmd: "Layout.ChartType('step')" },
				{ type: "radio", label: "Mountain", cmd: "Layout.ChartType('mountain')" },
				{ type: "radio", label: "Baseline", cmd: "Layout.ChartType('baseline_delta')" },
				{ type: "radio", label: "Hollow Candle", cmd: "Layout.ChartType('hollow_candle')" },
				{ type: "radio", label: "Volume Candle", cmd: "Layout.ChartType('volume_candle')" },
				{ type: "radio", label: "Colored HLC Bar", cmd: "Layout.ChartType('colored_hlc')" },
				{ type: "radio", label: "Scatterplot", cmd: "Layout.ChartType('scatterplot')" },
				{ type: "radio", label: "Histogram", cmd: "Layout.ChartType('histogram')" },
				{ type: "separator" }
			],
			menuChartAggregates: [
				{ type: "radio", label: "Heikin Ashi", cmd: "Layout.ChartType('heikinashi')" },
				{ type: "radioOptions", label: "Kagi", cmd: "Layout.ChartType('kagi')", options: "Layout.showAggregationEdit('kagi')" },
				{ type: "radioOptions", label: "Line Break", cmd: "Layout.ChartType('linebreak')", options: "Layout.showAggregationEdit('linebreak')" },
				{ type: "radioOptions", label: "Renko", cmd: "Layout.ChartType('renko')", options: "Layout.showAggregationEdit('renko')" },
				{ type: "radioOptions", label: "Range Bars", cmd: "Layout.ChartType('rangebars')", options: "Layout.showAggregationEdit('rangebars')" },
				{ type: "radioOptions", label: "Point & Figure", cmd: "Layout.ChartType('pandf')", options: "Layout.showAggregationEdit('pandf')" },
				{ type: "separator" }
			],
			menuChartPreferences: [
				{ type: "checkbox", label: "Log Scale", cmd: "Layout.ChartScale('log')" },
				{ type: "checkbox", label: "Invert Y-Axis", cmd: "Layout.FlippedChart()" },
				{ type: 'checkbox', label: 'Hide Outliers', cmd: "Layout.Outliers()" },
				{ type: 'checkbox', label: 'Extended Hours', cmd: "Layout.ExtendedHours()" },
				{ type: 'checkbox', label: 'Range Selector', cmd: "Layout.RangeSlider()" },
				{ type: 'checkbox', label: 'Market Depth', cmd: "Layout.MarketDepth()", cls: 'cryptoiq-ui' },
				{ type: 'checkbox', label: 'L2 Heat Map', cmd: "Layout.L2Heatmap()", cls: 'cryptoiq-ui' },
			],
			menuViewConfig: {
				// configure view menu options
			},
			menuStudiesConfig: { 	// All studies available are by default included in the  studies menu
				excludedStudies: { // List studies that should be excluded from this menu
					// Following studies are included in library for legacy use. Alternative versions are available in the included study list
					Directional: true,
					Gopala: true,
					vchart: true,
				},
				// dialogBeforeAddingStudy: { ma: true },
				alwaysDisplayDialog: { ma: true, AVWAP: true },
			},
			rangeMenu: [
				{ type: "range", label: "1D", cmd: "set(1,'today')" },
				{ type: "range", label: "5D", cmd: "set(5,'day',30,2,'minute')" },
				{ type: "range", label: "1M", cmd: "set(1,'month',30,8,'minute')" },
				{ type: "range", label: "3M", cmd: "set(3,'month')", cls: "hide-sm" },
				{ type: "range", label: "6M", cmd: "set(6,'month')", cls: "hide-sm" },
				{ type: "range", label: "YTD", cmd: "set(1,'YTD')", cls: "hide-sm" },
				{ type: "range", label: "1Y", cmd: "set(1,'year')" },
				{ type: "range", label: "5Y", cmd: "set(5,'year',1,1,'week')", cls: 'hide-sm' },
				{ type: "range", label: "All", cmd: "set(1,'all')", cls: "hide-sm"  },
			],
			drawingTools: [
				{ type: "dt", tool: "annotation", group: "text", label: "Annotation", shortcut: "t" },
				{ type: "dt", tool: "arrow", group: "markings", label: "Arrow", shortcut: "a" },
				{ type: "dt", tool: "line", group: "lines", label: "Line", shortcut: "l" },
				{ type: "dt", tool: "horizontal", group: "lines", label: "Horizontal", shortcut: "h" },
				{ type: "dt", tool: "vertical", group: "lines", label: "Vertical", shortcut: "v" },
				{ type: "dt", tool: "rectangle", group: "markings", label: "Rectangle", shortcut: "r" },
				{ type: "dt", tool: "segment", group: "lines", label: "Segment" },
				{ type: "dt", tool: "callout", group: "text", label: "Callout" },
				{ type: "dt", tool: "average", group: "statistics", label: "Average Line" },
				{ type: "dt", tool: "channel", group: "lines", label: "Channel" },
				{ type: "dt", tool: "continuous", group: "lines", label: "Continuous" },
				{ type: "dt", tool: "crossline", group: "lines", label: "Crossline" },
				{ type: "dt", tool: "freeform", group: "lines", label: "Doodle" }, 
				{ type: "dt", tool: "elliottwave", group: "technicals", label: "Elliott Wave"},
				{ type: "dt", tool: "ellipse", group: "markings", label: "Ellipse", shortcut: "e" },
				{ type: "dt", tool: "retracement", group: "fibonacci", label: "Fib Retracement" },
				{ type: "dt", tool: "fibprojection", group: "fibonacci", label: "Fib Projection" },
				{ type: "dt", tool: "fibarc", group: "fibonacci", label: "Fib Arc" },
				{ type: "dt", tool: "fibfan", group: "fibonacci", label: "Fib Fan" },
				{ type: "dt", tool: "fibtimezone", group: "fibonacci", label: "Fib Time Zone" },
				{ type: "dt", tool: "gannfan", group: "technicals", label: "Gann Fan" },
				{ type: "dt", tool: "gartley", group: "technicals", label: "Gartley" },
				{ type: "dt", tool: "pitchfork", group: "technicals", label: "Pitchfork" },
				{ type: "dt", tool: "quadrant", group: "statistics", label: "Quadrant Lines" },
				{ type: "dt", tool: "ray", group: "lines", label: "Ray" },
				{ type: "dt", tool: "regression", group: "statistics", label: "Regression Line" },
				{ type: "dt", tool: "check", group: "markings", label: "Check" },
				{ type: "dt", tool: "xcross", group: "markings", label: "Cross" },
				{ type: "dt", tool: "focusarrow", group: "markings", label: "Focus" },
				{ type: "dt", tool: "heart", group: "markings", label: "Heart" },
				{ type: "dt", tool: "star", group: "markings", label: "Star" },
				{ type: "dt", tool: "speedarc", group: "technicals", label: "Speed Resistance Arc" },
				{ type: "dt", tool: "speedline", group: "technicals", label: "Speed Resistance Line" },
				{ type: "dt", tool: "timecycle", group: "technicals", label: "Time Cycle" },
				{ type: "dt", tool: "tirone", group: "statistics", label: "Tirone Levels" },
				{ type: "dt", tool: "trendline", group: "text", label: "Trend Line" },
			],
			drawingToolGrouping: [
				"All",
				"Favorites",
				"Text",
				"Statistics",
				"Technicals",
				"Fibonacci",
				"Markings",
				"Lines"
			],
			menuRendering: {
				separator: () => `
					<cq-separator></cq-separator>`,
				item: ({ label, cmd }) => `
					<cq-item stxtap="${cmd}">${label}</cq-item>`,
				radio: ({ label, cmd, cls }) => `
					<cq-item 
						${cls ? `class="${cls}"` : ""} 
						stxsetget="${cmd}">${label}<span class="ciq-radio"><span></span></span>
					</cq-item>`,
				checkbox: ({ label, cmd, cls }) => `
					<cq-item 
						${cls ? `class="${cls}"` : ""} 
						stxsetget="${cmd}">${label}<span class="ciq-checkbox ciq-active"><span></span></span>
					</cq-item>`,
				radioOptions: ({ label, cmd, options, cls }) => `
					<cq-item ${cls ? `class="${cls}"` : ""}>
						<span class="ciq-edit" stxtap="${options}"></span>
						<div stxsetget="${cmd}">${label}<span class="ciq-radio"><span></span></span></div>
					</cq-item>`,
				range: ({ label, cmd, cls }) => `
					<div ${cls ? `class="${cls}"` : ""} stxtap="${cmd}">${label}</div>
				`,
				dt: ({ tool, group, label, shortcut }) => `
					<cq-item 
						class="ciq-tool" 
						cq-tool="${tool}" 
						${shortcut ? `cq-tool-shortcut="${shortcut}"` : ""}
						cq-tool-group="${group}" 
						stxtap="tool('${tool}')"
					>
						<span class="icon ${tool}"></span>
						<label>${label}</label>
					</cq-item>
				`
			},
			getMenu(name, sort) {
				let menu = this[name];
				if (!menu) return;
				if (sort === true) sort = (a, b) => (a.label > b.label ? 1 : -1);
				if (typeof sort === "function") menu = menu.sort(sort);
				return this[name].map((options) => this.menuRendering[options.type](options));
			}, 
			addOns: {
				// Floating tooltip on mousehover
				// This should be used as an *alternative* to the HeadsUp (HUD).
				tooltip: {
					ohl:true,
					volume:true,
					series:true,
					studies:true
				},
				// Inactivity timer
				inactivityTimer: { minutes: 30 },
				// Animation (using tension requires splines.js)
				animation: { animationParameters: { tension: 0.3 } },
				// Range Slider
				rangeSlider: {},
				// Enables Full Screen mode toggle button in chart controls
				fullScreen: {},
				// Extended hours trading zones 
				extendedHours: { filter: true },
				// Continuous Zoom will also enable the SmartZoom button in your chart zoom controls
				// which allows the end-user to toggle the feature on and off.
				continuousZoom: {
					periodicities: [
						// daily interval data
						{period: 1,   interval: "month"},
						{period: 1,   interval: "week"},
						{period: 1,   interval: "day"},
						// 30 minute interval data
						{period: 8,   interval: 30},
						{period: 1,   interval: 30},
						// 1 minute interval data
						{period: 5,   interval: 1},
						{period: 1,   interval: 1},
						// one second interval data
						{period: 10,  interval: 1, timeUnit:"second"},
						{period: 1,   interval: 1, timeUnit:"second"},
					],
					boundaries: {
						maxCandleWidth: 15,
						minCandleWidth: 3
					}
				},
				// Forecasting
				plotComplementer: {
					id: "forecast",
					decorator: { symbol: "_fcst", display: " Forecast" },
					renderingParameters: { chartType: "channel", opacity: 0.5, pattern: "dotted" },
					quoteFeed: forecastQuoteFeed.quoteFeedForecastSimulator,
					behavior: {refreshInterval:60}
				},
				//Outliers
				outliers: {}
			},
			plugins: {
				timeSpanEventPanel: {
					menuItemSelector: ".stx-markers cq-item.span-event",
					loadSample: true
				},
				// Enable the cryptoIQ Market Depth panel
				marketDepth: {
					volume: true, 
					mountain: true, 
					step: true, 
					record: true, 
					height:"50%", 
					orderbook: true
				},
				// Trade From Chart (TFC)
				// set account key to your custom account class, or leave as null to automatically 
				// load the Demo class (CIQ.Account.Demo) when loading from loaded from script tag
				tfc: {
					moduleName: "TFC"
					// account: undefined
				},
				termStructure: {
					pointFreshnessTimeout: 1, // pointFreshnessTimeout 1 min for demo purposes
					postInstall({ uiContext, extension }) { 
						if (CIQ.UI.CurveEdit) {
							new CIQ.UI.CurveEdit(null, uiContext);
						}
						// Connect datepicker change to termstructure callback
						const datepicker = uiContext.topNode.querySelector("cq-datepicker");
						if (datepicker) {
							datepicker.registerCallback(date => extension.setCurveDate(date));
						}
					}
				},
				visualEarnings: {
					menuContainer: ".ciq-dropdowns"
				},
			},
			// path of component communication channels
			// layout properties are persisted between reloads
			channels: {
				crosshair: "layout.crosshair",
				headsUp: "layout.headsUp",
				sidenav: "layout.sidenav",
				drawing: "channel.drawing",
				drawingPalettes: "channel.drawingPalettes",
				breakpoint: "channel.breakpoint",
				containerSize: "channel.containerSize",
				sidenavSize: "channel.sidenavSize",
				sidepanelSize: "channel.sidepanelSize",
				pluginPanelHeight: "channel.pluginPanelHeight",
				tfc: "channel.tfc",
				tc: "channel.tc",
				recognia: "channel.recognia",
				dialog: "channel.dialog"
			},
			// dialogs
			dialogs: {
				view: { tag: "cq-view-dialog" },
				aggregation: { tag: "cq-aggregation-dialog" },
				timezone: { tag: "cq-timezone-dialog" },
				language: { tag: "cq-language-dialog" },
				theme: { tag: "cq-theme-dialog" },
				study: {
					tag: "cq-study-dialog",
					attributes: { 
						"cq-study-axis": true,
						"cq-study-panel": "alias"
					}
				},
				fibSettings: { tag: "cq-fib-settings-dialog" },
				share: { tag: "cq-share-dialog" }
			},
			// Simulate L2 data
			// In your implementation, you must instead load L2 data 
			// using https://documentation.chartiq.com/CIQ.ChartEngine.html#updateCurrentMarketData
			simulateL2: (stx) => {
				if (!CIQ.simulateL2){
					if(CIQ.MarketDepth) console.warn("Enable L2_simulator.js to simulate L2 bid/ask data");
					return;
				}
				CIQ.simulateL2({ stx, onInterval: 1000, onTrade: true });
			}
		};
	}
	CIQ.getDefaultConfig = getDefaultConfig;
	return _exports.CIQ;
});
