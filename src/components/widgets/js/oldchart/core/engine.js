//-------------------------------------------------------------------------------------------
// Copyright 2012-2016 by ChartIQ, Inc.
// All rights reserved
//-------------------------------------------------------------------------------------------

(function (definition) {
	"use strict";

	if (typeof exports === "object" && typeof module === "object") {
		module.exports = definition( require('./core'),require('./timezone'),require('./polyfills'),require('./market') );
	} else if (typeof define === "function" && define.amd) {
		define(['core/core','core/timezone','core/polyfills','core/market'], definition);
	} else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition(global,global,global,global);
	} else {
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for kernel.js.");
	}

})(function(_exports, timezone, polyfills, market){
	console.log("kernel.js",_exports);
		
	Math.easeOutCubic = function (t, b, c, d) {
		t /= d;
		t--;
		return c*(t*t*t + 1) + b;
	};
	
	var CIQ=_exports.CIQ,
		$$=_exports.$$,
		$$$=_exports.$$$,
		timezoneJS=timezone.timezoneJS;

		/* TOC()************* CIQ.CHARTENGINE CONFIGURATION ************** */
		/**
		 * This is the constructor that instantiates the basic chart object and links it to its DOM container. 
		 * Before any chart operations can be performed this constructor must be called. 
		 * 
		 * Multiple CIQ.ChartEngine (stx) objects can exist on an HTML document.
		 * `charts` is a member object that can contain multiple charts (in separate panels).
		 * For backward compatibility, there is always one chart called `stxx.chart` which points to the first chart in the `charts` object. 
		 * Users can feel free to reference this chart directly if they only ever need to support a single chart panel.
		 * `chart` contains some variables that are applicable to all of the charts on the screen (i.e. canvas, canvasWidth, canvasHeight, etc)
		 *
		 * Each "chart" contains a unique set of data. In theory each chart supports a separate scroll position but this is not implemented.
		 * @constructor
		 * @param {Object} config Configuration object. Any field or object within the config parameter will be preset or added to the CIQ.ChartEngine object itself.
		 * Generally you will want to at least include {container: <your div element>}.
		 * @name  CIQ.ChartEngine
		 * @example
		 * // declare a chart
		 * var stxx=new CIQ.ChartEngine({container: $$("chartContainer")});
		 * // override defaults after a chart object is declared (this can be done at any time. If the chart has already been rendered, you will need to call `stx.draw();` to immediately see your changes )
		 * stxx.yaxisLabelStyle="roundRectArrow";
		 * stxx.layout.chartType="bar";
		 * @example
		 * // declare a chart and preset defaults
		 * var stxx=new CIQ.ChartEngine({container: $$("chartContainer"),layout:{"chartType": "candle","candleWidth": 16}});
		 * @since  15-07-01 deprecated CIQ.ChartEngine#underlayPercentage
		 */
		CIQ.ChartEngine=function(config){
			if(!config) config={
				container: null
			};
			if(config.constructor==HTMLDivElement){ // legacy versions accepted the chart container as the first parameters rather than a config object
				var newConfig={
					container: config
				};
				config=newConfig;
			}
		    /**
		     * READ ONLY. A map of marker objects, sorted by label.
		     * @type object
		     * @alias markers
		     * @memberOf  CIQ.ChartEngine.prototype
		     */
			this.markers={};								
		    /**
		     * READ ONLY. An array of currently enabled panels
		     * @type object
		     * @alias panels
		     * @memberOf  CIQ.ChartEngine.prototype
		     */
			this.panels={};									
		    /**
		     * READ ONLY. An array of currently enabled overlay studies
		     * @type object
		     * @alias overlays
		     * @memberOf  CIQ.ChartEngine.prototype
		     */
			this.overlays={};								
		    /**
		     * READ ONLY. The charts on the screen. Will contain at least one item, "chart"
		     * @type object
		     * @alias charts
		     * @memberOf  CIQ.ChartEngine.prototype
		     */
		    this.charts={};									
		    /**
		     * READ ONLY. Array of event listeners. These listeners will be killed when {@link CIQ.ChartEngine#destroy} is called.
		     * @type array
		     * @alias eventListeners
		     * @memberOf  CIQ.ChartEngine.prototype
		     */
		    this.eventListeners=[];

			/**
			 * Animations. These can be overridden with customized EaseMachines
			 * To disable an animation replace with an EaseMchine with zero ms as the second parameter.
			 * @type {Object}
			 */
			this.animations={
				zoom: new CIQ.EaseMachine(Math.easeOutCubic, 400)
			};
			/**
			 * Specify callbacks.
			 * You can also register for a callback with {@link CIQ.ChartEngine#addEventListener}
			 * @type {object}
			 * @memberOf  @memberOf  CIQ.ChartEngine.prototype
			 */
			this.callbacks={
			    /**
			     * Called when a user right clicks on an overlay study.
			     *
			     * ***Please note that this callback must be set *before* you call {@link CIQ.ChartEngine#importLayout}.
			     * Otherwise your imported studies will not have an edit capability***
			     *
			     * Format:<br>
			     * callback({stx, sd, inputs, outputs, parameters})
			     * @type Function
				 * @alias callbacks.studyOverlayEdit
				 * @memberof!   CIQ.ChartEngine#
			     */
			    studyOverlayEdit: null,
			    /**
			     * Called when a user clicks the edit button on a study panel. If forceEdit==true then a user has clicked
			     * on an edit button (cog wheel) so pull up an edit dialog. Otherwise they have simply right clicked so
			     * give them a context menu.
			     *
			     * ***Please note that this callback should be set *before* you call {@link CIQ.ChartEngine#importLayout}.
			     * Otherwise your imported studies will not have an edit capability***
			     *
			     * Format:<br>
			     * callback({stx, sd, inputs, outputs, parameters, forceEdit})
			     * @type Function
				 * @alias callbacks.studyPanelEdit
				 * @memberof!   CIQ.ChartEngine#
			     */
				studyPanelEdit: null,
			    /**
			     * Called when a user clicks or taps on the chart. Not called if a drawing tool is active!
			     *
			     * Format:<br>
			     * callback({stx:CIQ.ChartEngine, panel:CIQ.ChartEngine.Panel, x:this.cx, y:this.cy})
			     * @type Function
				 * @alias callbacks.tap
				 * @memberof!   CIQ.ChartEngine#
				 * @example
				 * stxx.addEventListener("tap", function(tapObject){
				 * 	alert('tap event at x: ' + tapObject.x + ' y: '+ tapObject.y);
				 * });
			     */
				tap: null,
			    /**
			     * Called when a user clicks or right clicks on the chart. Not called if the user right clicks on a drawing or study
			     * unless stxx.bypassRightClick=true
			     *
			     * Format:<br>
			     * callback({stx:CIQ.ChartEngine, panel:CIQ.ChartEngine.Panel, x:this.cx, y:this.cy})
			     * @type Function
				 * @alias callbacks.tap
				 * @memberof!   CIQ.ChartEngine#
				 * @example
				 * stxx.addEventListener("rightClick", function(tapObject){
				 * 	alert('right click event at x: ' + tapObject.x + ' y: '+ tapObject.y);
				 * });
				 * @since  TBD
			     */
				rightClick: null,
			    /**
			     * Called when a user "long holds" on the chart. By default this is set to 1000 milliseconds.
			     * Optionally change the value of stxx.longHoldTime to a different setting, or set to zero to disable.
			     *
			     * Format:<br>
			     * callback({stx:CIQ.ChartEngine, panel:CIQ.ChartEngine.Panel, x:this.cx, y:this.cy})
			     * @type Function
				 * @alias callbacks.tap
				 * @memberof!   CIQ.ChartEngine#
				 * @example
				 * stxx.longHoldTime=... // Optionally override default value of 1000ms
				 * stxx.addEventListener("longhold", function(tapObject){
				 * 	alert('longhold event at x: ' + tapObject.x + ' y: '+ tapObject.y);
				 * });
				 * @memberof!   CIQ.ChartEngine#
				 * @since 2016-06-22
			     */
				longhold: null,
			    /**
			     * Called when a user moves on the chart. Not called if a drawing tool is active, panel resizing, etc
			     * grab is true if a mouse user has the mouse button down while moving. For touch users it is true
			     * if they do not have the crosshair tool enabled.
			     *
			     * Format:<br>
			     * callback({stx:CIQ.ChartEngine, panel:CIQ.ChartEngine.Panel, x:this.cx, y:this.cy, grab:boolean})
			     * @type Function
				 * @alias callbacks.move
				 * @memberof!   CIQ.ChartEngine#
			     */
				move:null,

				/**
				 * Called when the layout changes
				 * Format:<br>
				 * callback({stx:CIQ.ChartEngine, chart:CIQ.ChartEngine.Chart, symbol: String, symbolObject:Object, layout: Object})
				 * @type Function
				 * @alias callbacks.layout
				 * @memberof! CIQ.ChartEngine#
				 */
				layout: null,
				/**
				 * Called when a drawing is added or deleted (all the drawings are returned, not just the new one)
				 * Format:<br>
				 * callback({stx:CIQ.ChartEngine, symbol: String, symbolObject:Object, drawings: Object})
				 * @type Function
				 * @alias callbacks.drawing
				 * @memberof! CIQ.ChartEngine#
				 */
				drawing: null,
				/**
				 * Called when the symbol is changed (when newChart is called), added (addSeries) or removed (removeSeries). Note
				 * that this is not called if the symbol change occurs during an importLayout
				 * Format:<br>
				 * callback({stx:CIQ.ChartEngine, symbol: String, symbolObject:Object, action:["master"|"add-series"|"remove-series"})
				 * @type Function
				 * @alias callbacks.symbolChange
				 * @memberof! CIQ.ChartEngine#
				 * @since TBD
				 */
				symbolChange: null,

				/**
				 * Called to determine how many decimal places the stock trades in. This is used for head's up display
				 * and also for the current price pointer label.
				 *
				 * Format:<br>
				 * callback({stx:CIQ.ChartEngine, chart:CIQ.ChartEngine.Chart, symbol: String, symbolObject:Object})
				 * @type Function
				 * @alias callbacks.calculateTradingDecimalPlaces
				 * @memberof! CIQ.ChartEngine#
				 */
				calculateTradingDecimalPlaces: CIQ.calculateTradingDecimalPlaces

			};		     
		    /**
		     * Holds the HTML control elements managed by the chart. Usually this will be a copy of the default [htmlControls]{@link CIQ.ChartEngine#htmlControls}.
		     * These are not the GUI elements around the chart, but rather the HTML elements that the library will directly interact with on the canvas 
		     * for things like panel resizing, study edit controls, zooming controls, etc. See {@link CIQ.ChartEngine#htmlControls} for more details.
		     * @type object
		     * @alias controls
		     * @memberOf  CIQ.ChartEngine.prototype
		     */
		    this.controls={};								// contains the HTML controls for the chart (zoom, home, etc)
			this.goneVertical=false;						// Used internally for pinching algorithm
			this.pinchingScreen=false;						// "
			this.grabbingScreen=false;						// Used internally for panning. Toggles to true when the screen is being panned
			this.grabStartX=0;								// Used internally for panning
			this.grabStartY=0;								// "
			this.grabStartScrollX=0;						// "
			this.grabStartScrollY=0;						// "
			this.swipe={};									// "
		    /**
		     * Number of pixels the mouse needs to move in vertical direction to "unlock" vertical panning/scrolling.
		     * Setting to a number larger than the pixels on the canvas will also disable vertical scrolling
		     * @type number
		     * @default
		     * @alias yTolerance
		     * @memberOf  CIQ.ChartEngine.prototype
		     * @example
		     * //This will disable the tolerance, so panning will immediately follow the user actions without maintaining a locked vertical location when panning left or right.
		     * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
		     * stxx.yTolerance=0;
		     */
			this.yTolerance=100;

			/**
			 * Number of bars to always keep on the left of the screen when the user pans forward in time (moves chart from right to left). 
			 * If this is set to less than 1 then it will be possible to have a blank chart.
			 * See {@link CIQ.ChartEngine.Chart#allowScrollPast} for instructions on how to prevent users from scrolling past the oldest bar on the chart.
			 * @type number
			 * @default
			 * @alias minimumLeftBars
			 * @memberOf CIQ.ChartEngine.prototype
			 * @since 05-2016-10
			 */
			this.minimumLeftBars=1;
			this.grabStartCandleWidth=0;					// Used internally for zooming
			this.grabStartZoom=0;							// "
			this.grabOverrideClick=false;					// "
			this.grabMode="";								// Used internally. Set to either pan, zoom-x or zoom-y when grabbing screen
			this.vectorsShowing=false;						// Used internally to ensure that vectors aren't drawn more than once
			this.mouseMode=true;							// Used internally. For Windows8 devices this is set to true or false depending on whether the last touch was a mouse click or touch event. To support all-in-one computers
		    /**
		     * Set to true to reverse direction of mousewheel for zooming
		     * @type boolean
		     * @default
		     * @alias reverseMouseWheel
		     * @memberOf  CIQ.ChartEngine.prototype
		     */
			this.reverseMouseWheel=false;
		    /**
		     * Set to false to turn off mousewheel acceleration
		     * @type boolean
		     * @default
		     * @alias mouseWheelAcceleration
		     * @since 2015-11-1
		     * @memberOf  CIQ.ChartEngine.prototype
		     */
			this.mouseWheelAcceleration=true;
		    /**
		     * Minimum candleWidth (in pixels) allowed when zooming out. This will determine the maximum number of ticks to display on the chart.
		     * Anything smaller than **0.5 pixels** may cause performance issues when zooming out.
		     * @type number
		     * @default
		     * @alias minimumCandleWidth
		     * @memberOf  CIQ.ChartEngine.prototype
		     */
			this.minimumCandleWidth=1;
		    /**
		     * Minimum number of ticks to display when zooming in.
		     * @type number
		     * @default
		     * @alias minimumZoomTicks
		     * @memberOf  CIQ.ChartEngine.prototype
		     * @since 07-2016-16.6
		     */
			this.minimumZoomTicks=9;
		    /**
		     * Set to false to disable any user zooming on the chart
		     * @type boolean
		     * @default
		     * @alias allowZoom
		     * @memberOf  CIQ.ChartEngine.prototype
		     * @since 04-2015
		     * @example
		     * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), allowZoom:false, layout:{"candleWidth": 16, "crosshair":true}});
		     */
			this.allowZoom=true;
		    /**
		     * Set to false to disable any user scrolling of the chart
		     * @type boolean
		     * @default
		     * @alias allowScroll
		     * @memberOf  CIQ.ChartEngine.prototype
		     * @since 04-2015
			 * @example
		     * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), allowScroll:false, layout:{"candleWidth": 16, "crosshair":true}});
		     */
			this.allowScroll=true;
		    /**
		     * Set to false to disable 2 finger side swipe motion for scrolling
		     * @type boolean
		     * @default
		     * @alias allowSideswipe
		     * @memberOf  CIQ.ChartEngine.prototype
		     * @since 2015-12-08
		     */
			this.allowSideswipe=true;

			this.anyHighlighted=false;						// READ ONLY. Toggles to true if any drawing or overlay is highlighted for deletion
			this.accessoryTimer=null;						// Used internally to control drawing performance
			this.lastAccessoryUpdate=new Date().getTime();	// "
			this.displayCrosshairs=true;					// READ ONLY. Use doDisplayCrosshairs() or undisplayCrosshairs()
			this.hrPanel=null;								// READ ONLY. Current panel that mouse is hovering over
			this.editingAnnotation=false;					// READ ONLY. True if an annotation is open for editing
			this.openDialog="";								// Set this to non-blank to disable chart touch and mouse events use CIQ.ChartEngine.prototype.modalBegin() and CIQ.ChartEngine.prototype.modalEnd

		    /**
		     * Set these to false to not display this panel management component. See {@link CIQ.ChartEngine.controls} for alternate methods and more details.		     
		     * @type boolean
		     * @default
		     * @alias displayIconsUpDown
		     * @memberOf  CIQ.ChartEngine.prototype
		     * @example
		     * stxx.displayIconsUpDown=false;
		     */
			this.displayIconsUpDown=true;
		    /**
		     * Set these to false to not display this panel management component. See {@link CIQ.ChartEngine.controls} for alternate methods and more details.		     
		     * @type boolean
		     * @default
		     * @alias displayIconsSolo
		     * @memberOf  CIQ.ChartEngine.prototype
		     * @example
		     * stxx.displayIconsSolo=false;
		     */
			this.displayIconsSolo=true;
		    /**
		     * Set these to false to not display this panel management component. See {@link CIQ.ChartEngine.controls} for alternate methods and more details.		     
		     * @type boolean
		     * @default
		     * @alias displayIconsClose
		     * @memberOf  CIQ.ChartEngine.prototype
		     * @example
		     * stxx.displayIconsClose=false;
		     */
			this.displayIconsClose=true;
		    /**
		     * Set these to false to not display this panel management component. See {@link CIQ.ChartEngine.controls} for alternate methods and more details.		     
		     * @type boolean
		     * @default
		     * @alias displayPanelResize
		     * @memberOf  CIQ.ChartEngine.prototype
		     * @example
		     * stxx.displayPanelResize=false;
		     */
			this.displayPanelResize=true;
		    /**
		     * Only reposition markers this many milliseconds. Set to zero or null for no visible delay. (lower numbers are more CPU intensive).
		     * See {@tutorial Markers} for more details on adding markers to your charts
		     * @type number
		     * @default
		     * @alias markerDelay
		     * @memberOf  CIQ.ChartEngine.prototype
		     * @example
		     * stxx.markerDelay=25;
		     */
			this.markerDelay=0;
		    /**
		     * If true when the chart initially is rendered, then the CIQ.ChartEngine object will register to listen and manage touch and mouse browser events within then canvas by attaching them to the container div.
		     *
		     * Set to false to restrict all events registration and optionally turn into a static chart. Users will not be able to zoom or scroll.
		     *
		     * It is possible to re-enable the events after the chart has been rendered, but you must call stx.initializeChart(); stx.draw(); to register the events once again.
		     * @type boolean
		     * @default
		     * @alias manageTouchAndMouse
		     * @memberOf  CIQ.ChartEngine.prototype
		     * @example
		     * // if enabling events after the chart was already rendered, you must reinitialize to re register the browser events.
		     * stxx.manageTouchAndMouse = true;
		     * stxx.initializeChart();
		     * stxx.draw();
		     */
			this.manageTouchAndMouse=true;
		    /**
		     * Primarily intended for mobile devices, if set to false it will allow up/down swiping (don't capture events) to pass trough the chart container so the main page can manage it. 
		     * This allows a user swiping up and down to swipe trough the chart instead of having the chart capture the event and prevent the page from continue moving.
		     * It therefore produces a more natural up/down swiping motion throughout the page.
		     * @type boolean
		     * @default
		     * @alias captureTouchEvents
		     * @memberOf  CIQ.ChartEngine.prototype
		     * @since 12-2015-08
		     */
			this.captureTouchEvents=true;
			this.touches=[];					// Used internally for touch
			this.changedTouched=[];				// Used internally for touch
		    /**
		     * The value (price) representing the crosshair cursor point
		     * @type number
		     * @alias crosshairTick
		     * @memberOf  CIQ.ChartEngine.prototype
		     */
			this.crosshairTick=null;			
		    /**
		     * Read Only. The value (price) representing the crosshair cursor point
		     * @type number
		     * @alias crosshairValue
		     * @memberOf  CIQ.ChartEngine.prototype
		     */
			this.crosshairValue=null;
		    /**
		     * Set to either "roundRectArrow", "semiRoundRect", "roundRect","tickedRect","rect","noop"
		     * @type string
		     * @default
		     * @alias yaxisLabelStyle
		     * @memberOf  CIQ.ChartEngine.prototype
		     * @example
		     * var stxx=new CIQ.ChartEngine({container: $$("chartContainer")});
		     * stxx.yaxisLabelStyle="roundRectArrow";
		     */
			this.yaxisLabelStyle="roundRectArrow";
		    /**
		     * Set to false if you don't want the axis borders drawn. This will override individual settings on yaxis and xaxis.
		     * @type boolean
		     * @default
		     * @alias axisBorders
		     * @memberOf  CIQ.ChartEngine.prototype
		     */
			this.axisBorders=null;

			this.pt={
				x1:-1,
				x2:-1,
				y1:-1,
				y2:-1
			};
			this.moveA=-1;									// Used internally for touch
			this.moveB=-1;									// "
			this.touchStartTime=-1;							// "
			this.gestureStartDistance=-1; 					// "
			this.grabStartPeriodicity=1; 					// "
			this.grabEndPeriodicity=-1; 					// "
			this.scrollEvent=null; 							// "
			this.cmd=false; 								// "
			this.ctrl=false; 								// "
			this.shift=false; 								// "
			this.userPointerDown=false;  					//represents either mouse button or finger on touch device
		    /**
		     * Set to true based on a key stroke, button press, etc, when you want to enable the ability to clone a highlighted drawing. 
		     * Reset to false when you want the cloning to end. 
		     * For example, you can set to true when the `control` key is pressed and disable when it is released. 
		     * @type number
		     * @default
		     * @alias cloneDrawing
		     * @memberOf  CIQ.ChartEngine.prototype
		     * @since 07-2016-16.7
		     * @example
		     * 
				document.onkeyup=keyup;
				document.onkeydown=keydown;
				
				// disable cloning if the ctl key is released
				function keyup(e){
					var key = (window.event) ? event.keyCode : e.keyCode;
					if (key == 18 ) stxx.cloneDrawing=false;
				}
				
				// enable cloning if the ctl key is pressed
				function keydown(e){
					var key = (window.event) ? event.keyCode : e.keyCode;
					if (key == 18 ) stxx.cloneDrawing=true;
				}
		     */
			this.cloneDrawing=false;
		    /**
		     * X axis offset for touch devices so that finger isn't blocking crosshair
		     * @type number
		     * @default
		     * @alias crosshairXOffset
		     * @memberOf  CIQ.ChartEngine.prototype
		     */
			this.crosshairXOffset=-40;						
		    /**
		     * Y axis Offset for touch devices so that finger isn't blocking crosshair
		     * @type number
		     * @default
		     * @alias crosshairYOffset
		     * @memberOf  CIQ.ChartEngine.prototype
		     */
			this.crosshairYOffset=-40;					
		    /**
		     * Read only. This gets set to true when the chart display has been initialized.
		     * @type boolean
		     * @default
		     * @alias displayInitialized
		     * @memberOf  CIQ.ChartEngine.prototype
		     */
			this.displayInitialized=false; 			

		    /**
		     * When set to true, line and mountain charts are extended slightly in order to reduce whitespace at the right edge of the chart
		     * @type boolean
		     * @default
		     * @alias extendLastTick
		     * @memberOf  CIQ.ChartEngine.prototype
		     * @since 05-2016-10 The line will be extended to the end of the chart (full candle width) instead of the candle border, even when using yaxisLabelStyle "roundRectArrow"
		     */
			this.extendLastTick=false;

			this.clicks={
				s1MS: -1,
				e1MS: -1,
				s2MS: -1,
				e2MS: -1
			};

			this.cancelTouchSingleClick=false; 				// Set this to true whenever a screen item is touched so as to avoid a chart touch event
		    /**
		     * Contains the current screen layout
		     * @type object
		     * @alias layout
		     * @memberOf  CIQ.ChartEngine#
		     * @example
		     * // Layout parameters can be preset on a chart as follows:
		     * var stxx=new CIQ.ChartEngine({container: $$("chartContainer"),layout:{"interval":"day","periodicity":1,"chartType": "candle","candleWidth": 16}});
		     */
			this.layout={
			    /**
			     * Chart interval
			     * Available options are: [number] representing minutes, "day", "week", "month"
			     * See the [Periodicity and Quote feed](tutorial-Data%20Loading.html#Periodicity) tutorial.
			     * @type string
			     * @default
			     * @alias layout.interval
			     * @memberof!   CIQ.ChartEngine#
			     */
				interval: "day",
			    /**
			     * Number of periods per interval
			     * See the [Periodicity and Quote feed](tutorial-Data%20Loading.html#Periodicity) tutorial.
			     * @type number
			     * @default
			     * @alias layout.periodicity
			     * @memberof!   CIQ.ChartEngine#
			     */
				periodicity: 1,
				/**
				 * Time unit for the interval. "millisecond", "second", "minute" or null for daily charts
				 * @type string
				 * @default
				 * @memberOf! CIQ.ChartEngine#
				 */
				timeUnit: null,
			    /**
			     * Candle Width In pixels ( see {@tutorial Managing Chart Zoom and Range} )
			     * @type number
			     * @default
			     * @alias layout.candleWidth
			     * @memberof!   CIQ.ChartEngine#
			     */
				candleWidth: 8,
				volumeUnderlay: false,
			    /**
			     * Whether adjusted or nominal prices are being displayed. If true then the chart will look for "Adj_Close" in the masterData as an alternative to "Close".
			     * @type boolean
			     * @default
			     * @alias layout.adj
			     * @memberof!   CIQ.ChartEngine#
			     * @instance
			     */
				adj: true,
			    /**
			     * Whether crosshairs are being displayed
			     * @type boolean
			     * @default
			     * @alias layout.crosshair
			     * @memberof!   CIQ.ChartEngine#
			     * @instance
			     */
				crosshair: false,
			    /**
			     * Sets type of chart to render
			     * Available options are: "line", "candle", "bar", "wave", “colored_bar”, "colored_line", “hollow_candle”,”scatterplot”, "baseline_delta", "baseline_delta_mountain", "mountain","colored_mountain", "volume_candle"
			     * @type string
			     * @default
			     * @alias layout.chartType
			     * @memberof!   CIQ.ChartEngine#
			     * @since 05-2016-10.1 "baseline_delta_mountain" and  "colored_mountain" are also available
			     */
				chartType: "candle",
			    /**
			     * Flag for extended hours time-frames. 
			     * The chart includes the 'extended' parameter in the `params` object sent into the `fetch()` call. 
			     * Your quote feed must be able to provide extended hours data when requested (`extended:true`) for any extended hours functionality to work. 
			     * See {@link CIQ.ExtendedHours} and {@link CIQ.Market} for more details on how extended hours are set and used.
			     * @type boolean
			     * @default
			     * @alias layout.extended
			     * @memberof!   CIQ.ChartEngine#
			     */
				extended: false,
				/**
				 * Tracks the extended market sessions to display on the chart.  
				 * Once set, call newChart() to enable the corresponding time-frames in the x axis and load the data for these sessions.
				 * Session names must match the session names declared in {@link CIQ.Market}.
				 * See {@link CIQ.ExtendedHours} and {@link CIQ.Market} for more details on how extended hours are set and used.
			     * @type object
			     * @default
			     * @alias layout.marketSessions
			     * @memberof!   CIQ.ChartEngine#
				 * @example
				 * marketSessions = {
				 *      "session1": true,
				 *      "session2": true,
				 *      "session3": false,
				 *      "pre": true,
				 *      "post": true
				 * }
				 * @since  06-2016-02
				 */
				marketSessions: {}, //use defaults
			    /**
			     * Type of aggregation to use
			     * Available options are: "rangebars" "ohlc" "kagi" "pandf" "heikinashi" "linebreak" "renko" See {@link CIQ.ChartEngine#setAggregationType}
			     * @type string
			     * @default
			     * @alias layout.aggregationType
			     * @memberof!   CIQ.ChartEngine#
			     */
				aggregationType: "ohlc",
			    /**
			     * Type of scale to use
			     * Available options are: "log", "linear" See {@link CIQ.ChartEngine#setChartScale}
			     * @type string
			     * @default
			     * @alias layout.chartScale
			     * @memberof!   CIQ.ChartEngine#
			     */
				chartScale:  "linear",
				studies: {},
				panels: {}
			};
		    /**
		     * Contains the chart preferences
		     * @type object
		     * @alias preferences
		     * @memberOf  CIQ.ChartEngine#
		     */
			this.preferences={
				/**
				* Draw a horizontal line at the current price.
				* Only drawn if the most recent tick is visible.
				* @type boolean
				* @default
				* @alias preferences.currentPriceLine
				* @memberof! CIQ.ChartEngine#
				* @since 05-2016-10
				*/
				currentPriceLine: false,
			    /**
			     * Magnetize the crosshairs to datapoints during drawing operations to improve placement accuracy. See {@link CIQ.ChartEngine.AdvancedInjectable#magnetize} for more details
			     * @type boolean
			     * @default
			     * @alias preferences.magnet
			     * @memberof!   CIQ.ChartEngine#
			     */
				magnet: false,
					/**
					 * Locks the crosshair Y value to the value of the field name specified
					 * for the tick under the cursor on the primary chart.
					 *
					 * For studies create a horizontalCrosshairFieldFN function that will be called by
					 * CIQ.Studies.addStudy. The function must return the field name in the dataSet to
					 * reference. The function will not be called when the study is set to overly or
					 * underlay the chart's panel.
					 *
					 * @example
					 * // Have the crosshair lock to the "Close" field of the tick under the cursor
					 * stxx.preferences.horizontalCrosshairField = "Close";
					 *
					 * @example
					 * // Have the crosshair lock to the "ATR ATR (14)" field for a ATR study with a period of 14
					 * CIQ.Studies.studyLibrary["ATR"].horizontalCrosshairFieldFN = function(stx, sd) {
					 * 	// returns the field name, which should be created by the study's "calculateFN"
					 * 	return "ATR " + sd.name;
					 * };
					 *
					 * @type string
					 * @default
					 * @alias preferences.horizontalCrosshairField
					 * @memberof!   CIQ.ChartEngine#
					 * @since 04-2016-08
					 */
				horizontalCrosshairField: null,
			    /**
			     * Set to true to display labels on y-axis for line based studies using {@link CIQ.Studies.displayIndividualSeriesAsLine} or {@link CIQ.Studies.displaySeriesAsLine} (this is overridden by the particular y-axis setting of {@link CIQ.ChartEngine.YAxis#drawPriceLabels}).
			     * This flag is checked inside these 2 functions to decide if a label should be set, as such if you do not wish to have a label on a particular study line, you can set this flag to `false`, before calling the function, and then back to `true`.
			     * @type boolean
			     * @default
			     * @alias preferences.labels
			     * @memberof!   CIQ.ChartEngine#
			     * @example
					//do not display the price labels for this study
					stxx.preferences.labels=false;
					CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);

					//restore price labels to default value
					stxx.preferences.labels=true;
			     */
				labels: true,
			    /**
			     * Initial whitespace on right of the screen in pixels.
			     * @type number
			     * @default
			     * @alias preferences.whitespace
			     * @memberof!   CIQ.ChartEngine#
			     * @example
			     * // override the default value at declaration time
			     * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), preferences:{"whitespace": 20}});
			     */
				whitespace: 50,
			    /**
			     * zoom-in speed for mousewheel and zoom button.
			     *
			     * Range: **0 -.99999**. The closer to 1 the slower the zoom.
			     * @type number
			     * @default
			     * @alias preferences.zoomInSpeed
			     * @memberof!   CIQ.ChartEngine#
			     * @example
			     * stxx.preferences.zoomInSpeed=.98;
			     * @example
			     * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), preferences:{"zoomInSpeed": .98}});
			     * @since 07/01/2015
			     */
				 zoomInSpeed: null,
			    /**
			     * zoom-out speed for mousewheel and zoom button.
			     *
			     * Range: **1-2**. The closer to 1 the slower the zoom.
			     * @type number
			     * @default
			     * @alias preferences.zoomOutSpeed
			     * @memberof!   CIQ.ChartEngine#
			     * @example
			     * stxx.preferences.zoomOutSpeed=1;
			     * @example
			     * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), preferences:{"zoomOutSpeed": 1}});
			     * @since 07/01/2015
			     */
				 zoomOutSpeed: null,
			};
		    /**
		     * Used to control the behavior and  throttling of real time updates from streamTrade() or appendMasterData() to prevent overloading the chart engine
		     * @type object
		     * @alias streamParameters
		     * @memberOf  CIQ.ChartEngine#
		     */
			this.streamParameters={
				count: 0,
			//	lastDraw: (new Date()).getTime(),
			    /**
			     * ms to wait before allowing update to occur (if this condition is met, the update will occur and all pending ticks will be loaded - exclusive of maxTicks)
			     * @type number
			     * @default
			     * @alias streamParameters.maxWait
			     * @memberof!   CIQ.ChartEngine#
			     */
				maxWait: 1000,
			    /**
			     * ticks to wait before allowing update to occur (if this condition is met, the update will occur and all pending ticks will be loaded - exclusive of maxWait)
			     * @type number
			     * @default
			     * @alias streamParameters.maxTicks
			     * @memberof!   CIQ.ChartEngine#
			     */
				maxTicks: 100,
				timeout: -1,
			    /**
			     * if true, gaps will be filled in the master data from the last tick in the chart to the date of the trade. The close price from the last tick will be used to fill the gaps. This will cause charts to display a straight line instead of a gap. Only applicable when using streamTrade()
			     * @type boolean
			     * @default
			     * @alias streamParameters.fillGaps
			     * @memberof!   CIQ.ChartEngine#
			     * @since 2016-03-11
			     */
				fillGaps: true,
			};
		    /**
		     * This is the callback function used to translate languages.
		     * Should return a translated phrase given the English phrase. See separate translation file for list of phrases.
		     *
			 * Expected format :
			 *
			 * 		var translatedWord = fc(english);
			 *
			 * Defaults to {@link CIQ.I18N.translate}
			 * @type {function}
		     * @alias translationCallback
		     * @memberOf  CIQ.ChartEngine.prototype
		     */
			this.translationCallback=null;
			this.locale=null;								// set by setLocale()
		    /**
		     * Read Only. Timezone of the masterData, set by {@link CIQ.ChartEngine#setTimeZone}.
			 * @type {string}
		     * @alias dataZone
		     * @memberOf  CIQ.ChartEngine.prototype
		     */
			this.dataZone=null;
		    /**
		     * Read Only. Timezone to display on the chart, set by {@link CIQ.ChartEngine#setTimeZone}.
			 * @type {string}
		     * @alias displayZone
		     * @memberOf  CIQ.ChartEngine.prototype
		     */
			this.displayZone=null;
			this.timeZoneOffset=0;							// use setTimeZone() to compute this value
		    /**
		     * This is the callback function used to react to {@link CIQ.ChartEngine#changeOccurred}.
		     * Use this for storing chart configurations or drawings real time as users make changes.
		     *
			 * Expected format :
			 *
			 * 		fc(stxChart, eventType);
			 *
			 * Currently implemented values for  "eventType" are "layout" and "vector".
			 *
			 * You can create any additional event types and trigger them by calling 'CIQ.ChartEngine.changeOccurred(eventType)'
			 *
			 * **Note** only one changeCallback function can be registered per chart object. As such, you must program it to handle any and all possible events triggered by {@link CIQ.ChartEngine#changeOccurred}.
			 * @type {function}
		     * @alias changeCallback
		     * @memberOf  CIQ.ChartEngine.prototype
		     * @example
		     * stxx.changeCallback=function(stxx, eventType){
			 *		if(eventType=="layout") saveLayout();
			 *		if(eventType=="vector") saveDrawing();
			 * }
		     */
			this.changeCallback=null;
			this.masterData=null;							// Contains the historical quotes for the current chart
		    /**
		     * Register this function to transform the data set before a createDataSet() event; such as change in periodicity.
		     * You can also explicitly call  <code>stxx.createDataSet(); stxx.draw();</code> to trigger this function.
		     *
			 * Expected Format :
			 *
			 * 		fc(stxChart, dataSet);
			 *
			 * @type {function}
		     * @alias transformDataSetPre
		     * @memberOf  CIQ.ChartEngine.prototype
		     * @example
		     * stxx.transformDataSetPre=function(stxx, dataSet){
			 *		for(var i=0;i < dataSet.length;i++){
			 *			// do somethng to the dataset here
			 *		}
			 * }
			*/
			this.transformDataSetPre=null;
		    /**
		     * Register this function to transform the data set after a createDataSet() event; such as change in periodicity.
		     * You can also explicitly call  <code>stxx.createDataSet(); stxx.draw();</code> to trigger this function.
		     *
			 * Expected Format :
			 *
			 * 		fc(stxChart, dataSet, min low price in the dataset, max high price in the dataset);
			 *
			 * @type {function}
		     * @alias transformDataSetPost
		     * @memberOf  CIQ.ChartEngine.prototype
		     * @example
			 * stxx.transformDataSetPost=function(self, dataSet, min, max){
			 *		for(var i=0;i < dataSet.length;i++){
			 *			// do somethng to the dataset here
			 *		}
			 * }
			*/
			this.transformDataSetPost=null;
		    /**
		     * Register this function if you need [setMasterData()]{@link CIQ.ChartEngine#setMasterData} to transform each quote returned by your data feed into a properly formatted OHLC object before loading it into the chart.
		     * {@link CIQ.ChartEngine#setMasterData} is called by {@link CIQ.ChartEngine#newChart}.
		     *
		     * This is a useful function if your data is not properly formated as required by the charting library.
		     * Instead of having to iterate trough your data to re-format it, and once again within setMasterData() to load it,
		     * you can use the transform function to format it as it is being loaded, and thus preventing the dual looping.
		     *
			 * Expected Format :
			 *
			 * 		var formattedOHLCObject = fc(quote);
			 *
			 * @type {function}
		     * @alias transformMasterDataQuote
		     * @memberOf  CIQ.ChartEngine.prototype
		     * @example
			 * stxx.transformMasterDataQuote=function(quote){
			 *		var formattedOHLCObject =
			 *			{
			 *				DT:new Date(quote.DT),
			 *				Open:parseFloat(quote.Open),
			 *				Close:parseFloat(quote.Close),
			 *				High:parseFloat(quote.High),
			 *				Low:parseFloat(quote.Low),
			 *				Volume:parseInt(quote.Volume,10)
			 *			};
			 *
			 *		return formattedOHLCObject;
			 * }
			*/
			this.transformMasterDataQuote=null;
		    /**
		     * This is the callback function used by setPeriodicityV2 when no quotefeed has been attached to the chart.
		     * Called if the masterData does not have the interval requested.
		     *
		     * Do not initialize if you are using a quotefeed ( {@link CIQ.QuoteFeed } )
		     *
			 * @type {function}
		     * @alias dataCallback
		     * @memberOf  CIQ.ChartEngine.prototype
		     * @example
		     * stxx.dataCallback=function(){
			 *		// put code here to get the new data in the correct periodicity.
			 *		// use layout.interval and layout.periodicity to determine what you need.
			 *		// finally call stxx.newChart(symbol,data) to load the data and render the chart.
			 * }
		     */
			this.dataCallback=null;
		    /**
		     * Set this to true if your server returns data in  week or monthly ticks, and doesn't require rolling computation from daily
		     * @type boolean
		     * @default
		     * @alias dontRoll
		     * @memberOf  CIQ.ChartEngine.prototype
		     */
			this.dontRoll=false;
		    /**
		     * Set to true to allow an equation to be entered into the symbol input.  For example, =2*IBM-GM
		     * NOTE: the equation needs to be preceded by an equals sign (=) in order for it to be parsed as an equation.
		     * @type boolean
		     * @default
		     * @alias allowEquations
		     * @memberOf  CIQ.ChartEngine.prototype
		     */
			this.allowEquations=true;
		    /**
		     * Stores a list of active drawing object on the chart. Serialized renditions of drawings can be added using {@link CIQ.ChartEngine#createDrawing} and removed using {@link CIQ.ChartEngine#removeDrawing}
		     * @type array
		     * @default
		     * @alias drawingObjects
		     * @memberOf  CIQ.ChartEngine.prototype
		     */
			this.drawingObjects=[];
			this.undoStamps=[];
		    /**
		     * Set to true if there may be null quote gaps coming back from your feed, and need to scrub the data to remove them.
		     * If set, a new 'scrubbed' dataSet called `stx.chart.scrubbed` will be created.
		     * If disabled 'scrubbed' will still exist, but will be identical to `stx.chart.dataSet` and *will* have gaps.
		     * @type boolean
		     * @default
		     * @alias dataSetContainsGaps
		     * @memberOf  CIQ.ChartEngine.prototype
		     */
			this.dataSetContainsGaps=true;
		    /**
		     * Set to true to have the Chart create missing data points for lightly traded stocks that may have missing ticks for an introday or daily interval. See {@link CIQ.ChartEngine#doCleanupGaps}
		     * @type boolean
		     * @default
		     * @alias cleanupGaps
		     * @memberOf  CIQ.ChartEngine.prototype
		     * @since ver 15-07-01 gaps are automatically cleaned up unless this flag is set to false
		     * <br>2015-11-1, gaps are not automatically cleaned unless this flag is set to true
		     */
			this.cleanupGaps=false;
		    /**
		     * Set to maximum size of dataSet allowed (the larger, the more of a performance hit)
		     * @type number
		     * @default
		     * @alias maxDataSetSize
		     * @memberOf  CIQ.ChartEngine.prototype
		     */
			this.maxDataSetSize=20000;
			/**
		     * Set to zero to avoid resize checking loop. See {@link CIQ.ChartEngine#setResizeTimer} for more details
		     * @type number
		     * @default
		     * @alias resizeDetectMS
		     * @memberOf  CIQ.ChartEngine.prototype
		     */
			this.resizeDetectMS=1000;
			/**
			 * Display the xAxis below all panels.
			 * @type boolean
			 * @default
			 * @alias xAxisAsFooter
			 * @memberof 	CIQ.ChartEngine.prototype
			 * @since 05-2016-10
			 */
			this.xAxisAsFooter = false;
			/**
			 * Holds {@link CIQ.ChartEngine.Chart} object
			 * @type object
			 * @default
			 * @alias chart
			 * @memberof 	CIQ.ChartEngine.prototype
			 */
			this.chart=new CIQ.ChartEngine.Chart();
			this.chart.name="chart";
			this.chart.canvas=null;							// Contains the HTML5 canvas with the chart and drawings
			this.chart.tempCanvas=null;						// lays on top of the canvas and is used when creating drawings
			this.chart.container=config.container;
			this.chart.market = new CIQ.Market(); //create a default market, always open
		    /**
		     * Adjust to increase or decrease the default width of candles
		     * @type boolean
		     * @default
		     * @alias candleWidthPercent
		     * @memberOf  CIQ.ChartEngine.prototype
		     */
			this.candleWidthPercent=0.65;
		    /**
		     * chart types which do not draw wicks on candles
		     * @type object
		     * @default
		     * @alias noWicksOnCandles
		     * @memberOf  CIQ.ChartEngine.prototype
		     */
			this.noWicksOnCandles={"rangebars":1,"renko":1,"linebreak":1};
		    /**
		     * chart types which require fetching as many bars as possible (since they aggregate data)
		     * @type object
		     * @default
		     * @alias fetchMaximumBars
		     * @memberOf  CIQ.ChartEngine.prototype
		     */
			this.fetchMaximumBars={"rangebars":1,"kagi":1,"renko":1,"linebreak":1,"pandf":1};
		    /**
		     * chart types which have a non-time-based x-axis (since they aggregate data)
		     * @type object
		     * @default
		     * @alias hasNTBAxis
		     * @memberOf  CIQ.ChartEngine.prototype
		     */
			this.hasNTBAxis={"rangebars":1,"kagi":1,"renko":1,"linebreak":1,"pandf":1};

			this.charts.chart=this.chart;
			this.styles={};		// Contains CSS styles used internally to render canvas elements
			this.currentVectorParameters=CIQ.clone(CIQ.ChartEngine.currentVectorParameters); // contains the current drawing parameters for this chart
			CIQ.extend(this, config);

			if(config.container){
				this.registerHTMLElements();
				// Initialize the very basic dimensions of chart so that it is operational immediately
				this.chart.width=this.chart.container.clientWidth-this.chart.yAxis.width;
				this.setCandleWidth(this.layout.candleWidth, this.chart);
				this.chart.canvasHeight=this.chart.container.clientHeight;

				// This prevents mousewheel events from inadvertently triggering page scroll in Firefox and IE
				if(CIQ.useOldWheelLogic && !CIQ.FireFoxWheelWorkaround){
					if(CIQ.isIE){
						document.body.addEventListener("wheel", function(e){
							if(CIQ.ChartEngine.insideChart){
								e.preventDefault();
								// IE won't propagate the event so we need to manually figure out if we're inside the chart
								for(var i=0;i<CIQ.ChartEngine.registeredContainers.length;i++){
									var stx=CIQ.ChartEngine.registeredContainers[i].stx;
									if(CIQ.ChartEngine.crosshairX>=stx.left &&
										CIQ.ChartEngine.crosshairX<=stx.right &&
										CIQ.ChartEngine.crosshairY>=stx.top &&
										CIQ.ChartEngine.crosshairY<=stx.bottom){
										stx.mouseWheel(e, "onmousewheel");
									}
								}
							}
						});
					}else{
						document.body.addEventListener("wheel", function(e){if(CIQ.ChartEngine.insideChart) e.preventDefault();});
					}
					CIQ.FireFoxWheelWorkaround=true;
				}
			}
			this.construct();

		};


		CIQ.ChartEngine.drawingLine=false; // Toggles to true when a drawing is initiated
		CIQ.ChartEngine.resizingPanel=null; // Toggles to true when a panel is being resized
		CIQ.ChartEngine.vectorType="";		// @deprecated The type of drawing currently enabled "segment", "line", "ray", etc. See sample.html menu
		CIQ.ChartEngine.crosshairX=0;	// Current X screen coordinate of the crosshair
		CIQ.ChartEngine.crosshairY=0;
		CIQ.ChartEngine.insideChart=false;	// Toggles to true whenever the mouse cursor is within the chart (canvas)
		CIQ.ChartEngine.overXAxis=false;	// Toggles to true if the mouse cursor is over the X Axis.
		CIQ.ChartEngine.overYAxis=false;	// Toggles to true if the mouse cursor is over the Y Axis.
		CIQ.ChartEngine.currentColor="auto";	// @deprecated Currently selected color for drawing tools. This may be changed by developing a menu with a color picker.
		CIQ.ChartEngine.drawingTools={};
		CIQ.ChartEngine.useAnimation=!CIQ.is_chrome;		// Animation API is on by default, except for Chrome which turns out to be faster without it
		CIQ.ChartEngine.ipadMaxTicks=1500;		// performance limitation as of IOS7
		CIQ.ChartEngine.enableCaching=false;
		CIQ.ChartEngine.ignoreTouch=false;		// set this true to override the touch commands in the kernel (such as when manipulating DOM elements on screen)
		CIQ.ChartEngine.useOldAndroidClear=true;	// Turn this off to boost native android browser performance, but at risk of "double candle" display errors on some devices
		/**
		 * Each CIQ.ChartEngine object will clone a copy of this object template and use it to store the settings for the active drawing tool.
		 * The default settings can be found in `stx.js`, and they can be changed by overriding these defaults on your own files.
		 * See {@tutorial Custom Drawing Menu and Colors} for details on how to use this template to replace the standard drawing toolbar.
		 * <br>This object can be extended to support additional drawing tools (for instance note the extensive customization capabilities for fibonacci)
		 * @type {Object}
		 * @memberOf  CIQ.ChartEngine
		 */
		CIQ.ChartEngine.currentVectorParameters={
			/**
			 *  Drawing to activate.
		     * <br>See 'Classes' in {@link CIQ.Drawing} for available drawings.
		     * Use {@link CIQ.ChartEngine#changeVectorType} to activate.
		     * @type string
		     * @alias currentVectorParameters.vectorType
		     * @memberof CIQ.ChartEngine
		     */
			vectorType: null,
			/**
			 *  Line pattern.
			 * <br><B>Valid values for pattern: solid,dotted,dashed,none</B>
			 * <br>Not all parameters/values are valid on all drawings. See the specific `recontruct` method for your desired drawing for more details(Example: {@link CIQ.Drawing.horizontal#reconstruct})
		     * @type string
		     * @default
		     * @alias currentVectorParameters.pattern
		     * @memberof CIQ.ChartEngine
		     */
			pattern:"solid",
			/**
			 *  Line width
			 * <br>Not all parameters/values are valid on all drawings. See the specific `recontruct` method for your desired drawing for more details(Example: {@link CIQ.Drawing.horizontal#reconstruct})
		     * @type number
		     * @default
		     * @alias currentVectorParameters.lineWidth
		     * @memberof   CIQ.ChartEngine
		     */
			lineWidth:1,
			/**
			 *  Fill color.
			 * <br>Not all parameters/values are valid on all drawings. See the specific `recontruct` method for your desired drawing for more details(Example: {@link CIQ.Drawing.horizontal#reconstruct})
		     * @type string
		     * @default
		     * @alias currentVectorParameters.fillColor
		     * @memberof   CIQ.ChartEngine
		     */
			fillColor:"#7DA6F5",
			/**
			 * Line color.
			 * <br>Not all parameters/values are valid on all drawings. See the specific `recontruct` method for your desired drawing for more details(Example: {@link CIQ.Drawing.horizontal#reconstruct})
		     * @type string
		     * @default
		     * @alias currentVectorParameters.currentColor
		     * @memberof   CIQ.ChartEngine
		     */
			currentColor: "auto",
			/**
			 * Axis Label.
			 * Set to 'true' to display a label on the x axis.
			 * <br>Not all parameters/values are valid on all drawings. See the specific `recontruct` method for your desired drawing for more details(Example: {@link CIQ.Drawing.horizontal#reconstruct})
		     * @type string
		     * @default
		     * @alias currentVectorParameters.axisLabel
		     * @memberof   CIQ.ChartEngine
		     */
			axisLabel:true,
			/**
			 * Fibonacci settings.
			 * See {@link CIQ.Drawing.fibonacci.#reconstruct} `parameters` object for valid options
		     * @type object
		     * @alias currentVectorParameters.fibonacci
		     * @memberof   CIQ.ChartEngine
		     * @example
				fibonacci:{
					trend:{color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}},
					fibs:[
					      {level:-0.618, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}},
					      {level:-0.382, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}},
					      {level:0, color:"auto", parameters:{pattern:"solid", lineWidth:1}},
					      {level:0.382, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}},
					      {level:0.618, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}},
					      {level:0.5, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}},
					      {level:1, color:"auto", parameters:{pattern:"solid", lineWidth:1}},
					      {level:1.382, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}},
					      {level:1.618, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}}
					      ],
					extendLeft: false,
					printLevels: true,
					printValues: false,
					timezone:{color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}}
				}
		     */
			fibonacci:{
				trend:{color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}},
				fibs:[
				      {level:-0.618, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}},
				      {level:-0.382, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}},
				      {level:0, color:"auto", parameters:{pattern:"solid", lineWidth:1}},
				      {level:0.382, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}},
				      {level:0.618, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}},
				      {level:0.5, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}},
				      {level:1, color:"auto", parameters:{pattern:"solid", lineWidth:1}},
				      {level:1.382, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}},
				      {level:1.618, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}}
				      ],
				extendLeft: false,
				printLevels: true,
				printValues: false,
				timezone:{color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}}
			},
			/**
			 * Annotation settings.
		     * @type object
		     * @alias currentVectorParameters.annotation
		     * @memberof   CIQ.ChartEngine
		     * @example
				annotation:{
					font:{
						style:null,
						size:null,	// override .stx_annotation default
						weight:null, // override .stx_annotation default
						family:null // override .stx_annotation default
					}
				}
		     */
			annotation:{
				font:{
					style:null,
					size:null,	// override .stx_annotation default
					weight:null, // override .stx_annotation default
					family:null // override .stx_annotation default
				}
			}
		};

		CIQ.ChartEngine.defaultDisplayTimeZone=null;	// If set, then new CIQ.ChartEngine objects will pull their display timezone from this

		/**
		 * Defines an object used for rendering a chart.
		 * Chart objects contain the data and config for each chart but they don't actually exist on the screen until a panel is attached.
		 * A chart object is attached to both the main chart panel and any related study panels so they can share the same chart data.
		 *
		 * Example: stxx.panels['chart'].chart
		 *
		 * Example: stxx.chart (convenience shortcut for accessing the main chart object - same as above)
		 *
		 * Example stxx.panels['Aroon (14)'].chart
		 *
		 * @constructor
		 * @name  CIQ.ChartEngine.Chart
		 */
		CIQ.ChartEngine.Chart=function(){
			this.xAxis=new CIQ.ChartEngine.XAxis();
			this.yAxis=new CIQ.ChartEngine.YAxis();
			this.symbolObject={symbol : null};
			this.series={};
			this.seriesRenderers={};
			this.xaxis=[];
		};

		/**
		 * set this to true to turn off auto-scrolling when fresh data comes in. By default, the chart will scroll backward
		 * whenever a new bar comes in, so as to maintain the chart's forward position on the screen. If lockScroll is
		 * true then fresh bars with advance the chart forward (and eventually off the right edge of the screen)
		 *
		 * Note that setSpan({base:"today"}) will set an internal variable that accomplishes the same thing. This is a unique case.
		 * @type {Boolean}
		 * @default
		 * @memberOf  CIQ.ChartEngine.Chart
		 * @since 05-2016-10
		 */
		CIQ.ChartEngine.Chart.prototype.lockScroll = false;

		/**
		 * Defines an object used for rendering the Y-axis on a panel.
		 * Each panel object will include a YAxis object, which can be adjusted immediately after declaring your `new CIQ.ChartEngine();`
		 * Any adjustments to the Y-axis members after it has been rendered and will require a draw() call to apply the changes ( initializeChart() may be required as well depending on the setting being changed).
		 *
		 * See {@tutorial Gridlines and  axis labels}, {@link CIQ.ChartEngine.AdvancedInjectable#createYAxis} and {@link CIQ.ChartEngine.AdvancedInjectable#drawYAxis} for additional customization instructions.
		 *
		 * Example: stxx.panels['chart'].yAxis
		 *
		 * Example: stxx.chart.panel.yAxis (convenience shortcut for accessing the main panel object - same as above)
		 *
		 * Example: stxx.panels['Aroon (14)'].yAxis
		 *
		 * @constructor
		 * @name  CIQ.ChartEngine.YAxis
		 * @example
		 * // here is an example on how to override the default top and bottom margins after the inital axis has already been rendered
		 * stxx.newChart(symbol, yourData, null, function () {    // call new chart to render your data
         *    	// callback - your code to be executed after the chart is loaded
		 * 		stxx.chart.yAxis.initialMarginTop=50;
		 * 		stxx.chart.yAxis.initialMarginBottom=50;
		 * 		stxx.calculateYAxisMargins(stxx.chart.panel.yAxis); // must recalculate the margins after they are changed.
		 * 		stxx.draw();
		 * });
		 * @example
		 * // here is an example on how to override the default top and bottom margins before the inital axis has been rendered
		 * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
		 * stx.setPeriodicityV2(1, 1);  			// set your default periodicity to match your data. In this case one minute.
		 * stx.chart.yAxis.initialMarginTop=50;		// set default margins so they do not bump on to the legend
		 * stx.chart.yAxis.initialMarginBottom=50;
		 * stx.newChart("SPY", yourData);
		 * @example
		 * // here is an example on how to turn off the last price label (main chart panel) before the inital axis has already been rendered
		 * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
		 * stxx.chart.panel.yAxis.drawCurrentPriceLabel=false;
		 */
		CIQ.ChartEngine.YAxis=function(){};

		/**
		 * Defines an object used for rendering the X-axis on the chart, which can be adjusted immediately after declaring your `new CIQ.ChartEngine();`
		 * The CIQ.ChartEngine.XAxis object is part of the CIQ.ChartEngine.Chart object and is used on the main charts only. There is only one x axis per chart container.
		 *
		 * Colors and fonts for the x axis can be controlled by manipulating the CSS.
		 * You can override the `stx_xaxis` class in `stx-chart.css` to change the font.
		 * If you also want to control the color, you will need to override the defaults  for `.Light .stx_xaxis` and `.Dark .stx_xaxis` styles found in `stx-standard.css`
		 *
		 * For full customization instructions see:
		 * - {@tutorial Custom X-axis}
		 * - {@link CIQ.ChartEngine.AdvancedInjectable#createXAxis}
		 * - {@link CIQ.ChartEngine#createTickXAxisWithDates}
		 *
		 * Example: stxx.chart.xAxis
		 *
		 * @constructor
		 * @name  CIQ.ChartEngine.XAxis
		 * @example
		 * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
		 * stxx.chart.xAxis.axisType="numeric";
		 */
		CIQ.ChartEngine.XAxis=function(){
		};

		/**
		 * Defines a Panel object.
		 * Every chart or study is rendered in a panel.
		 *
		 * Example: stxx.panels['chart']
		 *
		 * Example: stxx.panels['Aroon (14)']

		 * @param {string} name The name of the panel.
		 * @param {CIQ.ChartEngine.YAxis} [yAxis] Pass an optional {@link CIQ.ChartEngine.YAxis} object
		 * @constructor
		 * @name  CIQ.ChartEngine.Panel
		 */
		CIQ.ChartEngine.Panel=function(name, yAxis){
			if(yAxis) this.yAxis=yAxis;
			else this.yAxis=new CIQ.ChartEngine.YAxis();
			this.name=name;
		};

		CIQ.ChartEngine.YAxis.prototype={
			high: null,									// High value on y axis (read only)
			low: null,									// Low value on y axis (read only)
			shadow: null,								// high - low (read only)
			logHigh: null,								// High log value on y axis (read only)
			logLow: null,								// Low log value on y axis (read only)
			logShadow: null,							// logHigh - logLow (read only)
			multiplier: null,							// Computed automatically. Divide pixel by this to get the price (then add to low). Or multiply price by this to get the pixel (then add to top)
			bottom: null,								// calculated automatically (panel.bottom-yAxis.bottomOffset)
			top: null,									// calculated automatically (panel.top+yAxis.topOffset;)
			height: null,								// bottom - top
			left: null,									// calculated left position on canvas to begin drawing.
			width: null,								// calculated width of y axis
		};

		/**
		 * Maximum decimal places to ever display on a price label. Leave null and the chart will compute based on the number of decimal places in the actual data.
		 * Generally you want to leave this alone, in order to display the full actual current value of the security. But if you're running out of space
		 * on the y-axis, or you have a very tightly controlled configuration, you can lower this value.
		 * See {@link CIQ.ChartEngine.YAxis#decimalPlaces} for controlling decimal places on the axis marks.
		 * @type {Number}
		 * @default
		 * @memberOf  CIQ.ChartEngine.YAxis
		 */
		CIQ.ChartEngine.YAxis.prototype.maxDecimalPlaces = 5;

		/**
		 * Optionally hard set the high (top value) of the yAxis (for instance when plotting 0 - 100% charts)
		 * @type {Number}
		 * @default
		 * @memberOf  CIQ.ChartEngine.YAxis
		 */
		CIQ.ChartEngine.YAxis.prototype.max = null;

		/**
		 * Optionally hard set the low (bottom value) of the yAxis (for instance when plotting 0 - 100% charts)
		 * @type {Number}
		 * @default
		 * @memberOf  CIQ.ChartEngine.YAxis
		 */
		CIQ.ChartEngine.YAxis.prototype.min = null;

		/**
		 * 0-4 or leave null and the chart will choose automatically. Note that this only affects the number of decimal places on the axis marks, not on the
		 * axis price labels (current price, indicators). See {@link CIQ.ChartEngine.YAxis#maxDecimalPlaces} for controlling decimal places on price labels.
		 * @type {Number}
		 * @default
		 * @memberOf  CIQ.ChartEngine.YAxis
		 */
		CIQ.ChartEngine.YAxis.prototype.decimalPlaces= null;

		/**
		 * ideal size between y-axis values in pixels. Leave null to automatically calculate.
		 * See {@tutorial Gridlines and  axis labels} for additional details.
		 * @type {Number}
		 * @default
		 * @memberOf  CIQ.ChartEngine.YAxis
		 */
		CIQ.ChartEngine.YAxis.prototype.idealTickSizePixels= null;

		/**
		 * Set to specify that the y-axis vertical grid be drawn with specific intervals between ticks.
		 * This amount will be overridden if it will result  in y axis crowding.
		 * In which chase, multiples of the original interval will be used.
		 * For example, if `.25` is selected, and that will cause labels to be on top of or too close to each other, `.50` may be used.
		 * Crowding is prevented by allowing for a minimum of space equating the y-axis font height between labels.
		 *
		 * **This parameter is also used in the 'Trade From Chart' (TFC) module**. If set, it will force the widget to skip certain price values and instead 'snap' to your desired intervals. This will guarantee that an order is only placed at the allowed price intervals for the security in question.
		 *
		 * **Note that this flag is not compatible with {@link CIQ.ChartEngine.YAxis#pretty}.**
		 *
		 * Visual Reference:<br>
		 * ![yAxis.minimumPriceTick](yAxis.minimumPriceTick.png "yAxis.minimumPriceTick")
		 *
		 * @type {Number}
		 * @default
		 * @memberOf  CIQ.ChartEngine.YAxis
		 * @example
		 * // Declare a CIQ.ChartEngine object. This is the main object for drawing charts
		 * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
		 * // set interval between ticks
		 * stxx.chart.yAxis.minimumPriceTick=.50;
		 */
		CIQ.ChartEngine.YAxis.prototype.minimumPriceTick= null;

		/**
		 * Set to specify that the y-axis vertical grid be drawn with fractional intervals.
		 * This is checked in {@link CIQ.ChartEngine.AdvancedInjectable#drawYAxis} and if it is not null,
		 * and there is no existing yAxis.priceFormatter, one is created to specially format the y-axis ticks.
		 *
		 * @type {Object}
		 * @default
		 * @memberOf  CIQ.ChartEngine.YAxis
		 * @example
		 * // Declare a CIQ.ChartEngine object. This is the main object for drawing charts
		 * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
		 * // set axis to display in 1/32nds; for example, 100 5/32 will display as 100'05.  If there is a price midway between
		 * // two ticks (for example, 11/64), a plus (+) will follow the price; for example 100 11/64 will display as 100'11+.
		 * stxx.chart.yAxis.fractional={
				formatter: "'",				// This is the character used to separate he whole number portion from the numerator (' default)
				resolution: 1/32			// Set to smallest increment for the quoted amounts
		 */
		CIQ.ChartEngine.YAxis.prototype.fractional= null;

		/**
		 * set to true to draw a line left of the y-axis and tick marks
		 * @type {boolean}
		 * @default
		 * @memberOf  CIQ.ChartEngine.YAxis
		 */
		CIQ.ChartEngine.YAxis.prototype.displayBorder= true;

		/**
		 * set to false to hide grid lines. See {@tutorial Gridlines and  axis labels} for additional details.
		 * @type {boolean}
		 * @default
		 * @memberOf  CIQ.ChartEngine.YAxis
		 */
		CIQ.ChartEngine.YAxis.prototype.displayGridLines= true;

		/**
		 * set to true to hide the yaxis
		 * @type {boolean}
		 * @default
		 * @memberOf  CIQ.ChartEngine.YAxis
		 */
		CIQ.ChartEngine.YAxis.prototype.noDraw= null;

		/**
		 * set to false to hide the current price label <b>in the main panel's y-axis<b>.
		 *
		 * Visual Reference:<br>
		 * ![yAxis.drawCurrentPriceLabel](drawCurrentPriceLabel.png "yAxis.drawCurrentPriceLabel")
		 * @type {Boolean}
		 * @default
		 * @memberOf  CIQ.ChartEngine.YAxis
		 * @since  04-2015
		 */
		CIQ.ChartEngine.YAxis.prototype.drawCurrentPriceLabel=true;

		/**
		 * Set to false to hide **all** price labels on the particular y axis.
		 * <br>See {@link CIQ.ChartEngine.YAxis#drawCurrentPriceLabel} to disable just the current price label on the main chart panel.
		 * <br>See [CIQ.ChartEngine.preferences.labels]{@link CIQ.ChartEngine#preferences}  to disable just the last value label on studies.
		 * @type {Boolean}
		 * @default
		 * @memberOf  CIQ.ChartEngine.YAxis
		 * @since  04-2015
		 */
		CIQ.ChartEngine.YAxis.prototype.drawPriceLabels=true;


		/**
		 * Set to either "roundRectArrow", "semiRoundRect", "roundRect","tickedRect","rect","noop".
		 * It will default to {@link CIQ.ChartEngine.yaxisLabelStyle}
		 * This could be set independently on each panel if desired.
		 * @type string
		 * @default
		 * @memberOf  CIQ.ChartEngine.YAxis
		 * @since  04-2015
		 * @example
		 * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
		 * stxx.chart.yAxis.yaxisLabelStyle="rect"
		 */
		CIQ.ChartEngine.YAxis.prototype.yaxisLabelStyle=null;

		/**
		 * Set to true to right justify the yaxis (use with CIQ.ChartEngine.yaxisPaddingRight)
		 * @type Boolean
		 * @default
		 * @memberOf  CIQ.ChartEngine.YAxis
		 * @since  15-07-01
		 */
		CIQ.ChartEngine.YAxis.prototype.justifyRight=null;

		/**
		 * Set to true to put a rectangle behind the yaxis text (use with CIQ.ChartEngine.yaxisPaddingRight)
		 * @type Boolean
		 * @default
		 * @memberOf  CIQ.ChartEngine.YAxis
		 * @since  15-07-01
		 */
		CIQ.ChartEngine.YAxis.prototype.textBackground=false;

		/**
		 * Optional function used to override default formatting of Y-axis values, including the floating HUD value of the crosshair.
		 *
		 * Expected format :
		 *
		 * 		function(stx, panel, price, decimalPlaces)
		 *
		 * Parameters:
		 *
		 * 		{CIQ.ChartEngine} stx			- The chart object
		 *		{CIQ.ChartEngine.Panel} panel	- The panel
		 *		{number} price			- The price to format
		 *		{number} decimalPlaces	- The number of decimal places to use
		 *
		 * Returns:
		 *
		 *		{text} Formated text label for the price
		 *
		 * @type {function}
		 * @example
		 * stxx.chart.panel.yAxis.priceFormatter=function(stx, panel, price){
		 * 	var convertedPrice;
		 * 	// add our logic here to convert 'price' to 'convertedPrice'
		 *   	return convertedPrice; // string
		 * }
		 * @default
		 * @memberOf  CIQ.ChartEngine.YAxis
		 */
		CIQ.ChartEngine.YAxis.prototype.priceFormatter= null;

		/**
		 * Sets the y-axis bottom on any panel.  Rendering will start this number of pixels above the panel's bottom
		 *
		 * Visual Reference:<br>
		 * ![yAxis.width](yAxis.bottomOffset.png "yAxis.bottomOffset")
		 * ![yAxis.width](yAxis.bottomTopOffset.png "yAxis.bottomTopOffset")
		 * @type {Number}
		 * @default
		 * @memberOf  CIQ.ChartEngine.YAxis
		 */
		CIQ.ChartEngine.YAxis.prototype.bottomOffset= 0;

		/**
		 * Sets y-axis top on Study panels, Rendering will start this number of pixels below the panel's top
		 *
		 * Visual Reference:<br>
		 * ![yAxis.width](yAxis.bottomTopOffset.png "yAxis.bottomTopOffset")
		 * @type {Number}
		 * @default
		 * @memberOf  CIQ.ChartEngine.YAxis
		 */
		CIQ.ChartEngine.YAxis.prototype.topOffset= 0;

		/**
		 * Set this to automatically compress and offset the y-axis so that this many pixels of white space is above the display.
		 * Note that {@link CIQ.ChartEngine#calculateYAxisMargins} will need to be called to immediately activate this setting after the axis has already been drawn.
		 *
		 * Visual Reference:<br>
		 * ![yAxis.width](yAxis.initialMarginTop.png "yAxis.initialMarginTop")
		 * @type {Number}
		 * @default
		 * @memberOf  CIQ.ChartEngine.YAxis
		 * @example
		 * // here is an example on how to override the default top and bottom margins **before** the inital axis has been rendered
		 * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
		 * stxx.setPeriodicityV2(1, 1);  				// set your default periodicity to match your data. In this case one minute.
		 * stxx.chart.yAxis.initialMarginTop=50;		// set default margins so they do not bump on to the legend
		 * stxx.chart.yAxis.initialMarginBottom=50;
		 * stxx.newChart("SPY", yourData);
		 * @example
		 * // here is an example on how to override the default top and bottom margins **after** the inital axis has already been rendered
		 * stxx.newChart(symbol, yourData, null, function () {    // call new chart to render your data
         *    	// callback - your code to be executed after the chart is loaded
		 * 		stxx.chart.yAxis.initialMarginTop=50;
		 * 		stxx.chart.yAxis.initialMarginBottom=50;
		 * 		stxx.calculateYAxisMargins(stxx.chart.panel.yAxis); // !!!! must recalculate the margins after they are changed. !!!!
		 * 		stxx.draw();
		 * });

		 */
		CIQ.ChartEngine.YAxis.prototype.initialMarginTop= 10;

		/**
		 * set this to automatically compress and offset the y-axis to that this many pixels of white space is below the display
		 * Note that {@link CIQ.ChartEngine#calculateYAxisMargins} will need to be called to immediately activate this setting after the axis has already been drawn.
		 *
		 * Visual Reference:<br>
		 * ![yAxis.width](yAxis.initialMarginTop.png "yAxis.initialMarginTop")
		 * @type {Number}
		 * @default
		 * @memberOf  CIQ.ChartEngine.YAxis
		 * @example
		 * // here is an example on how to override the default top and bottom margins **before** the inital axis has been rendered
		 * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
		 * stxx.setPeriodicityV2(1, 1);  				// set your default periodicity to match your data. In this case one minute.
		 * stxx.chart.yAxis.initialMarginTop=50;		// set default margins so they do not bump on to the legend
		 * stxx.chart.yAxis.initialMarginBottom=50;
		 * stxx.newChart("SPY", yourData);
		 * @example
		 * // here is an example on how to override the default top and bottom margins **after** the inital axis has already been rendered
		 * stxx.newChart(symbol, yourData, null, function () {    // call new chart to render your data
         *    	// callback - your code to be executed after the chart is loaded
		 * 		stxx.chart.yAxis.initialMarginTop=50;
		 * 		stxx.chart.yAxis.initialMarginBottom=50;
		 * 		stxx.calculateYAxisMargins(stxx.chart.panel.yAxis); // !!!! must recalculate the margins after they are changed. !!!!
		 * 		stxx.draw();
		 * });
		 *
		 *
		 */
		CIQ.ChartEngine.YAxis.prototype.initialMarginBottom= 10;

		/**
		 * Set this to the number of pixels to zoomed in or out, positive or negative.
		 * This is defined as the number of pixels to add or subtract from both top and bottom of panel for calculations.
		 *
		 * Please note that the zoom level will be reset as determined by {@link CIQ.ChartEngine.YAxis#initialMarginTop} and
		 * {@link CIQ.ChartEngine.YAxis#initialMarginBottom} when a {@link CIQ.ChartEngine#newChart} is rendered, the {@link CIQ.ChartEngine#home} button is pressed, or when {@link CIQ.ChartEngine.AdvancedInjectable#touchDoubleClick} is activated on a touch device.
		 *
		 * @type {Number}
		 * @default
		 * @memberOf  CIQ.ChartEngine.YAxis
		 */
		CIQ.ChartEngine.YAxis.prototype.zoom= 0;

		/**
		 * set this to the number of pixels to offset the y-axis, positive or negative.
		 * @type {Number}
		 * @default
		 * @memberOf  CIQ.ChartEngine.YAxis
		 */
		CIQ.ChartEngine.YAxis.prototype.scroll= 0;

		/**
		 * The width in pixels.
		 *
		 * Visual Reference:<br>
		 * ![yAxis.width](yAxis.width.png "yAxis.width")
		 * @type {Number}
		 * @default
		 * @memberOf  CIQ.ChartEngine.YAxis
		 */
		CIQ.ChartEngine.YAxis.prototype.width = 50;

		/**
		 * Override the default stx_yaxis style for text by setting this to the desired CSS style. This would typically be used to set a secondary axis to a particular color.
		 * @type {string}
		 * @default
		 * @memberOf  CIQ.ChartEngine.YAxis
		 * @since  15-07-01
		 */
		CIQ.ChartEngine.YAxis.prototype.textStyle = null;

		/**
		 * Set to "left" for the yaxis to draw on the left side of the screen. The main chart axis will default to "right". The main
		 * access for any study panel will follow the main chart axis as long as this is set to null. Note that this only applies to chart panels.
		 * @type {string}
		 * @default
		 * @memberOf  CIQ.ChartEngine.YAxis
		 * @since  15-07-01
		 */
		CIQ.ChartEngine.YAxis.prototype.position = null;

		/**
		 * Default setting for the array that determines how many decimal places to print based on the size of the shadow (the difference between chart high and chart low).
		 * The array consists of tuples in descending order. If the shadow is less than n1 then n2 decimal places will be printed.
		 * See {@link CIQ.ChartEngine.YAxis#shadowBreaks}
		 * @type {Array}
		 * @memberOf  CIQ.ChartEngine.YAxis
		 * @since  2015-11-1
		 * @default
		 */
		CIQ.ChartEngine.YAxis.defaultShadowBreaks=[[1000,2],[1,4]];

		/**
		 * Alternative setting (for small charts)  array that determines how many decimal places to print based on the size of the shadow (the difference between chart high and chart low).
		 * The array consists of tuples in descending order. If the shadow is less than n1 then n2 decimal places will be printed.
		 * See {@link CIQ.ChartEngine.YAxis#shadowBreaks}
		 * @type {Array}
		 * @memberOf  CIQ.ChartEngine.YAxis
		 * @since  2015-11-1
		 * @default
		 */
		CIQ.ChartEngine.YAxis.smallChartShadowBreaks=[[10,2],[1,4]];

		/**
		 * If true then uses the "pretty" algorithm instead of the "best fit" algorithm. The pretty algorithm
		 * uses the values specified in {@link CIQ.ChartEngine.YAxis#increments} to set axis label locations.
		 *
		 * **Note that this algorithm is not compatible with {@link CIQ.ChartEngine.YAxis#minimumPriceTick}.**
		 *
		 * @memberOf CIQ.ChartEngine.YAxis
		 * @since 2015-11-1
		 * @type {Boolean}
		 * @default
		 */
		CIQ.ChartEngine.YAxis.prototype.pretty=true;

		/**
		 * Values used by the {@link CIQ.ChartEngine.YAxis#pretty} algorithm to set axis label locations.
		 * @memberOf CIQ.ChartEngine.YAxis
		 * @since 2015-11-1
		 * @type {Array}
		 * @default
		 */
		CIQ.ChartEngine.YAxis.prototype.increments=[1,2.5,5];

		/**
		 * If true then uses an additional step in the "pretty" algorithm for the log
		 * scale. This allows the algorithm to lower the grid to fill large visual gaps.
		 * The "increments" are not fully respected by this approach.
		 *
		 * Only applicable when using *both* pretty mode and semiLog.
		 * @memberof CIQ.ChartEngine.YAxis
		 * @since 2016-03-11
		 * @type {Boolean}
		 * @default
		 */
		CIQ.ChartEngine.YAxis.prototype.prettySemiLog=true;

		/**
		 * An array that determines how many decimal places to print based on the size of the shadow (the difference between chart high and chart low).
		 * The array consists of tuples in descending order. If the shadow is less than n1 then n2 decimal places will be printed.
		 * See {@link CIQ.ChartEngine.YAxis.defaultShadowBreaks} and {@link CIQ.ChartEngine.YAxis.smallChartShadowBreaks} for default settings.
		 * @type {Array}
		 * @memberOf  CIQ.ChartEngine.YAxis
		 * @since  2015-11-1
		 */
		CIQ.ChartEngine.YAxis.prototype.shadowBreaks=CIQ.ChartEngine.YAxis.defaultShadowBreaks;

		CIQ.ChartEngine.Panel.prototype={
				name: null,								// Name of panel
				display: null,							// Display text of panel
				chart: null,							// The chart from which this panel derives its data
				yAxis: null,							// Y axis object for this panel, this is the same object as chart.yAxis on chart panels
				shareChartXAxis: null,					// Set to false to indicate panel does not share x axis with its chart
				top: null,								// Y location of top of chart
				bottom: null,							// Y location of bottom of chart
				height: null,							// height of chart in pixels
				percent: null							// percent of overall window this panel takes up
		};

		CIQ.ChartEngine.XAxis.prototype={
		    /**
		     * Optional function to format dates on x-axis. If defined, will be used to completely control x-axis formatting, including the floating HUD date of the crosshair .
		     * This is only for actual date or time formats, not boundaries, months, years.
		     *
			 * Expected format :
			 *
			 * 		function(labelDate, gridType, timeUnit, timeUnitMultiplier)
			 *
			 * Parameters:
			 *
			 * 		{Date} labelDate			- date to format in epoch (=new Date()) format
			 * 		{String} gridType			- "boundary" or "line"
			 * 		{Enumerated type} timeUnit	- CIQ.MILLISECOND, CIQ.SECOND, CIQ.MINUTE, CIQ.HOUR, CIQ.DAY, CIQ.MONTH, CIQ.YEAR, CIQ.DECADE
			 * 		{Number} timeUnitMultiplier	- how many timeUnits
			 *
			 * Returns:
			 *
			 * 		{text} Formated text label for the particular date passed in
			 *
		     * @type function
		     * @default
		     * @memberof   CIQ.ChartEngine.XAxis#
		     * @example
		     * stxx.chart.xAxis.formatter = function(labelDate, gridType, timeUnit, timeUnitMultiplier){
		     * 		//your code here to format your string
		     * 		return "formated string"
		     * }

			 */
			formatter: null,
		    /**
		     * If true, the user selected (default browser if none selected) timezone will be used on the x axis. 
		     * If not set to true, the data timezone will be used even if a user timezone was set.
		     * @type boolean
		     * @default
		     * @memberof   CIQ.ChartEngine.XAxis#
		     */
			adjustTimeZone: true,
		    /**
		     * Ideal space between x-axis labels in pixels.
		     * If null then the chart will attempt a tick size and time unit in proportion to the chart.
		     * Please note that if `stxx.chart.yAxis.goldenRatioYAxis` is set to `true`, this setting will also affect the spacing between y-axis labels.
		     * Please note that this setting will be overwritten at rendering time if too small to prevent labels from covering each other.
		     * Not applicable if {@link CIQ.ChartEngine.XAxis#timeUnit} is manually set. 
		     * See {@tutorial Custom X-axis} for additional details.
		     * @type number
		     * @default
		     * @memberof   CIQ.ChartEngine.XAxis#
		     */
			idealTickSizePixels: null,
		    /**
		     * Overrides default used in {@link CIQ.ChartEngine#createTickXAxisWithDates}
		     * <br>Allowable values:
		     * - CIQ.MILLISECOND,
		     * - CIQ.SECOND
		     * - CIQ.MINUTE
		     * - CIQ.HOUR
		     * - CIQ.DAY
		     * - CIQ.WEEK
		     * - CIQ.MONTH
		     * - CIQ.YEAR
		     * - CIQ.DECADE
		     *
		     * Visual Reference for sample code below ( draw a label every 5 seconds) :<br>
		     * ![xAxis.timeUnit](xAxis.timeUnit.png "xAxis.timeUnit")
		     * @type number
		     * @default
		     * @memberof   CIQ.ChartEngine.XAxis#
		     * @example
		     * // The following will cause the default implementation of createTickXAxisWithDates to print labels in seconds every 5 seconds.
		     * // masterData is in 1 second intervals for this particular example.
             * stxx.chart.xAxis.axisType='ntb';
             * stxx.chart.xAxis.futureTicksInterval=1/60; // 1 second grouping
             * stxx.chart.xAxis.timeUnit = CIQ.SECOND;
             * stxx.chart.xAxis.timeUnitMultiplier = 5; // 5 units (e.g. seconds) grid line
		     */
			timeUnit: null,
		    /**
		     * Overrides default used in {@link CIQ.ChartEngine#createTickXAxisWithDates}
		     * @type number
		     * @default
		     * @memberof   CIQ.ChartEngine.XAxis#
		     * @example
		     * // The following will cause the default implementation of createTickXAxisWithDates to print labels in seconds every 5 seconds.
		     * // masterData is in 1 second intervals for this particular example.
             * stxx.chart.xAxis.axisType='ntb';
             * stxx.chart.xAxis.futureTicksInterval=1/60; // 1 second grouping
             * stxx.chart.xAxis.timeUnit = CIQ.SECOND;
             * stxx.chart.xAxis.timeUnitMultiplier = 5; // 5 units (e.g. seconds) grid line
		     */
			timeUnitMultiplier: null,
		    /**
		     * Set to "ntb" for non time based rendering of the x-axis. See See {@link CIQ.ChartEngine#createTickXAxisWithDates}
		     *
		     * Set to "numeric" to render an x axis based on the "index" field instead of "Date" field to determine the label. See {@link CIQ.ChartEngine#createNumericXAxis}
		     *
		     * If not set, it will default to "ntb".
		     *
		     * @type string
		     * @default
		     * @memberof   CIQ.ChartEngine.XAxis#
		     */
			axisType: null,
		    /**
		     * Set to true to draw a line above the x-axis.
		     * @type boolean
		     * @default
		     * @memberof   CIQ.ChartEngine.XAxis#
		     */
			displayBorder: true,
		    /**
		     * Set to false to suppress grid lines
		     * @type boolean
		     * @default
		     * @memberof   CIQ.ChartEngine.XAxis#
		     */
			displayGridLines: true,
		    /**
		     * Minimum size for label. This ensures adequate padding so that labels don't collide with one another.
		     * Please note that this setting is used during the rendering process, not during the label spacing calculation process and will be overwritten if too small to prevent labels from covering each other.
		     * To modify at what interval labels will be placed, please see {@tutorial Custom X-axis} for more details
		     * @type number
		     * @default
		     * @memberof   CIQ.ChartEngine.XAxis#
		     */
			minimumLabelWidth: 50,
		    /**
		     * Set to false to hide axis markings in the future.
		     * @type boolean
		     * @default
		     * @memberof   CIQ.ChartEngine.XAxis#
		     */
			futureTicks: true,
		    /**
		     * Set to the number of minutes ticks will move by when iterating in "tick" interval.
		     * <P>
		     * Since 'tick' is not a time based display, there is no way to predict what the time between ticks will be.
		     * Ticks can come a second later, a minute later or even more depending on how active a particular instrument may be.
		     * As such, if iterating trough the market day in 'tick' periodicity, the library uses a pre-defined number of minutes to move around.
		     * This will be primarily used when deciding where to put x axis labels when going into the future in 'tick' mode.
		     *
		     * @type number
		     * @default
		     * @memberof   CIQ.ChartEngine.XAxis#
		     * @example
		     * //You can override this behavior as follows:
			 * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
			 * stxx.chart.xAxis.futureTicksInterval=1; // to set to 1 minute, for example
		     */
			futureTicksInterval: 10
		};

		CIQ.ChartEngine.Chart.prototype={
				symbol: null,							// This will be set to the current symbol
				symbolObject : {symbol: null },			// This will be set  to the current symbol and optionally include any other elements included in the object ( needed to represent the symbol or make additional data fetches). Initialized by newChart()
			    /**
			     * Set this to presnet an alternate name for the symbol on the chart label and comparison legend.
			     * You can set  `stxx.chart.symbolDisplay='yourName'; ` right before calling `newChart()`.
			     * Alternatively, a good place to set it is in your fetch() function, if using {@link CIQ.QuoteFeed}. See example.
			     * @type string
			     * @default
			     * @memberof   CIQ.ChartEngine.Chart#
			     * @example
				 * // on your fetch initial load add the following
				 * params.stx.chart.symbolDisplay='yourName for '+params.symbol;
			     */
				symbolDisplay: null,
			    series: {}, 							// Series that are drawn on chart, or for comparison. A series may have a different y-axis calculation than the price chart.
			    seriesRenderers: {}, 					// Graphs that are drawn on chart.
			    /**
			     * Current number of ticks scrolled in from the end of the chart.
			     * Setting to zero would theoretically cause the chart to be scrolled completely to the left showing an empty canvas.
			     * Setting to 10 would display the last 10 candles on the chart.
			     * Setting to `maxTicks` would display a full screen on the chart (assuming enough data is available).
			     * @type number
			     * @default
			     * @memberof   CIQ.ChartEngine.Chart#
			     */
				scroll: 0,
				standStill: 0,							// Used internally
				maxTicks: 0,							// Horizontal number of chart ticks that currently fit in the canvas, based on candlewidth and spacing. This is generally one greater than the actual size of the canvas due to candle clipping.
			    /**
			     * The master data for this chart. This data is never modified by the chart engine itself and should not be altered directly. Use {@link CIQ.ChartEngine#setMasterData} , {@link CIQ.ChartEngine#appendMasterData}, or {@link CIQ.ChartEngine#streamTrade} to manipulate this object. See {@tutorial Data Loading} for details.
			     * @type object 
			     * @memberof   CIQ.ChartEngine.Chart#
			     */
				masterData: null,			
			    /**
			     * Contains the current complete data set created by {@link CIQ.ChartEngine#createDataSet}, adjusted for periodicity and with calculated studies. See {@tutorial Data Loading} for details.
			     * @type object 
			     * @memberof   CIQ.ChartEngine.Chart#
			     */
				dataSet: null,						
				scrubbed: null,							// Contains the data set, scrubbed for null entries (gap dates) (if this.dataSetContainsGaps is set to true)
			    /**
			     * Contains the segment of the data set that is displayed on the screen (view-window). See {@tutorial Data Loading} for details.
			     * @type object 
			     * @memberof   CIQ.ChartEngine.Chart#
			     */
				dataSegment: null,				
				/**
				 * Parameters used to control the baseline in baseline_delta charts
				 * @type object
				 */
			    baseline:{
					/**
					 * includeInDataSegment - If set to true, forces a line chart (usually a baseline chart) to begin inside the chart,
				     *                        whereas normally the first point in a line chart is off the left edge of the screen.
				     * @type boolean
				     * @default
				     * @alias baseline.includeInDataSegment
				     * @memberof!   CIQ.ChartEngine.Chart#
					 */
			    	includeInDataSegment: false,
				    /**
				     * defaultLevel - If set to a value, overrides the default behavior of baseline chart
				     *                which is to set baseline to leftmost point visible on the chart.
				     * @type number
				     * @default
				     * @alias baseline.defaultLevel
				     * @memberof!   CIQ.ChartEngine.Chart#
				     */
			    	defaultLevel: null,
				    /**
				     * userLevel - Value of the user-set baseline level.  To prevent user from adjusting the baseline,
				     *             set this property to false.
				     * @type boolean/number
				     * @default
				     * @alias baseline.userLevel
				     * @memberof!   CIQ.ChartEngine.Chart#
				     */
			    	userLevel: null,
				    /**
				     * actualLevel - This is computed automatically.  Do not set.
				     * @type number
				     * @default
				     * @alias baseline.actualLevel
				     * @memberof!   CIQ.ChartEngine.Chart#
				     */
					actualLevel: null
			    },
				xAxis: null,							// x Axis for the chart
			    xaxis:[],								// Contains data entries for the full xaxis. It is a superset of dataSegment
			    /**
			     * Determines at which zoom level interior axis points are displayed. Value in pixels.
			     * @type number
			     * @default
			     * @memberof   CIQ.ChartEngine.Chart#
			     */
				xaxisFactor: 30,
				decimalPlaces: 2,						// Maximum number of decimal places in data set. Computed automatically by calculateTradingDecimalPlaces
				roundit: 100,							// Computed automatically to round y-axis display
			    /**
			     * Function used to render the Legend when multiple series are being displayed on the main chart panel.
			     * Update your prototype or a specific chart instance, if you want to use a different rendering method for legend.
			     * See {@link CIQ.drawLegend} for details and function signature.
			     * <P>
			     * Defaults to {@link CIQ.drawLegend}
			     * @type function
			     * @default
			     * @memberof   CIQ.ChartEngine.Chart#
			     * @example stxx.chart.legendRenderer = yourFunction; // must follow the function signature of {@link CIQ.drawLegend};
			     * @since 07/01/2015
			     */
				legendRenderer: CIQ.drawLegend,
			    /**
			     * This function will be called on certain chart types, before rendering each tick in the dataSegment, to determine the proper color to use on each bar, candle or line segment.
			     * Mainly used to setting colors for 'up' vs. 'down' ticks.
				 * For use with 'colored_bar', 'colored_line', "colored_mountain", 'candle', 'hollow_candle' and 'volume_candle' chart only.
				 *
				 * Expected format :
				 *
				 * 		function(stx, quote, mode)
				 *
				 * Parameters:
				 *
				 *		{object} stx	- A chart object
				 *		(object} quote	- A properly formated OHLC object.
				 *		{string} mode	- Applicable on 'candle', 'hollow_candle' and 'volume_candle' charts only. Allowed values: "shadow", "outline", and "solid".
				 *							`shadow`- indicates the function is asking for the candle wick color
				 *							`outline` indicates the function is asking for the candle border color
				 *							`solid` indicates the function is asking for the candle fill color
				 *										(Inside of candle. Not applicable on 'hollow_candle' or 'volume_candle')
				 *
				 * Returns:
				 *
				 *		{string/object} Color to use for the bar, candle or line segment component. Set to null to skip bar or line segment.
				 *		For colored line charts a color/pattern combination can be returned in an object of the follwing format: `{pattern:[3,3],color:"red"}`
				 *
				 * See {@tutorial Chart Types and Styles} for more details.
			     * @type object
			     * @default
			     * @alias customChart.colorFunction
			     * @memberof!   CIQ.ChartEngine.Chart#
			     * @example
				 * stxx.chart.customChart.colorFunction=function(stx, quote, mode){
				 *		if(mode=="shadow" || mode=="outline") return "black";  //draw black wicks and borders
				 *		else{
				 *			if(quote.Close>100) return "green";
				 * 			else if(quote.DT.getHours()<12) return "yellow";
				 *			else return "orange";
				 *		}
				 *		return null;
				 * 	};
			     */
				customChart: null,
			    /**
			     * How much padding to leave for the right y-axis. Default is enough for the axis. Set to zero to overlap y-axis onto chart.
			     * @type number
			     * @default
			     * @memberof   CIQ.ChartEngine.Chart#
			     * @since 07/01/2015
			     */
			    yaxisPaddingRight:null,
			    /**
			     * How much padding to leave for the left y-axis. Default is enough for the axis. Set to zero to overlap y-axis onto chart.
			     * @type number
			     * @default
			     * @memberof   CIQ.ChartEngine.Chart#
			     * @since 07/01/2015
			     */
			    yaxisPaddingLeft:null,
			    tickCache: {}, // private
				/**
			     * If set to false, the chart will be anchored on left side preventing white space to be created past the oldest tick; 
			     * The amount of white space allowed on the right will be limited by {@link CIQ.ChartEngine#minimumLeftBars}
			     * @type boolean
			     * @default
				 * @memberof   CIQ.ChartEngine.Chart#
			     */
				allowScrollPast:true,
			    /**
			     * Set to true to temporarily hide drawings
			     * @type boolean
			     * @default
				 * @memberof   CIQ.ChartEngine.Chart#
			     */
				hideDrawings:false,		    
		};

		
		/**
		 * Given a browser time it will return the date in dataZone time. See {@link CIQ.ChartEngine#setTimeZone} for more details.
		 * If no dataZone is set, it will return the original date passed in.
		 * @param {Date} browserDate Date in broswr time - as in 'new Date();'
		 * @return {Date} Date converted to dataZone
		 * @memberOf  CIQ.ChartEngine
		 * @since 07-2016-16.6
		 */
		CIQ.ChartEngine.prototype.convertToDataZone=function(browserDate){	
			if(this.dataZone){
				// convert the current time to the dataZone
				var tzNow = CIQ.convertTimeZone(browserDate, null, this.dataZone);
				// remember the the masterData is in local time but really representing the dataZone time.
				// now build a browser timezone time using the dataZone time so it will match the offset of the existing data in masterData.
				browserDate = new Date(tzNow.getFullYear(), tzNow.getMonth(), tzNow.getDate(), tzNow.getHours(), tzNow.getMinutes(), tzNow.getSeconds(), tzNow.getMilliseconds());
			}
			return browserDate;
		};

		/**
		 * Returns true if the interval is based off of a daily interval ("day","week" or "month")
		 * @param  {string}  interval The interval
		 * @return {Boolean}          True if it's a daily interval
		 * @memberOf CIQ.ChartEngine
		 */
		CIQ.ChartEngine.isDailyInterval=function(interval){
			if(interval=="day") return true;
			if(interval=="week") return true;
			if(interval=="month") return true;
			return false;
		};


		/**
		 * Returns true if the chartType is not a line type and therefore displays highs and lows.
		 * @param  {String}  chartType The chart type (layout.chartType)
		 * @return {Boolean}           True if the chart type only displays close values
		 * @memberOf  CIQ.ChartEngine
		 * @since 05-2016-10.1 "baseline_delta_mountain" and  "colored_mountain" are also available
		 */
		CIQ.ChartEngine.chartShowsHighs=function(chartType){
			if(chartType=="line") return false;
			if(chartType=="colored_line") return false;
			if(chartType=="mountain") return false;
			if(chartType=="colored_mountain") return false;
			if(chartType=="baseline_delta") return false;
			if(chartType=="baseline_delta_mountain") return false;
			return true;
		};

		/**
		 * This method does nothing. It is just a known location to put a break point for debugging the kernel.
		 * @private
		 */
		CIQ.ChartEngine.prototype.debug=function(){
			return;
		};

		/**
		 * Measures frames per second. Use this from the console.
		 * @private
		 */
		CIQ.ChartEngine.prototype.fps=function(){
		    var start = new Date().getTime();
		    var frames = 0;
		    var time_seconds = 5;
		    var self=this;
		    console.log("Measuring settimeout for " + time_seconds + " seconds.");
		    console.log(CIQ.ChartEngine.useAnimation?"Using requestAnimationFrame":"Using setTimeout");

		    function render() {
		        var now = new Date().getTime();
		        if (((now - start) / 1000) > time_seconds) {
		            console.log("FPS=" + (frames / time_seconds));
		            return;
		        }
		        self.draw();
		        frames++;
		        if(CIQ.ChartEngine.useAnimation){
       				requestAnimationFrame(render);
		        }else{
			        setTimeout(render,0);
			    }
		    }
		    render();
		};

		_exports.STXChart=CIQ.ChartEngine; // backward compatibility

		/**
		 * @deprecated
		 */
		CIQ.ChartEngine.DrawingDescriptor={
				"name": "",
				"render": null, 				/// function(vector, color, context, highlight (boolean), temporary (boolean), stx)
				"intersected": null,			/// function(vector, x, y) returns whether coordinates intersect the object
				"click": null,					/// function(vector, clickNumber) called when mouse click or tap. Return true to end drawing. False to accept more clicks.
				"abort": null					/// called when user has aborted drawing action (esc key for instance)
		};

		/* TOC()************* CIQ.CHARTENGINE STATIC FUNCTIONS ************** */

		/**
		 * The following is a list of ADVANCED injectable methods.
		 *
		 * **These methods should not be normally called by your code, but rather injections should be used to modify their behavior within the library Kernel.**
		 *
		 * The "Injection API" provides prepend and append functionality to any built-in method.
		 * Essentially what this means is that a developer can write code that will be run either before (prepend) or after (append) any internal {@link CIQ.ChartEngine} function (such as draw() or mouseMove()).
		 * This gives developers the ability to supplement, override or ignore any of the built in functionality.
		 *
		 * Note that you may prepend or append multiple functions. Each injected function is stacked "outward" (daisy-chained) from the core function.
		 *
		 * _prepend >> prepend >> prepend >> function << append << append << append_
		 *
		 * You may prepend/append either to CIQ.ChartEngine.prototype or directly to a CIQ.ChartEngine instance.
		 *
		 * See the {@tutorial Popular API injections} and [Customization Basics](tutorial-Customization%20Basics.html#injections) tutorials for additional guidance and examples.
		 * @namespace CIQ.ChartEngine.AdvancedInjectable
		 * @example
		 * CIQ.ChartEngine.prototype.append("method_name_goes_here", function(){
		 * 	// do something here
		 * });
		 * @example
		 * CIQ.ChartEngine.prototype.prepend("method_name_goes_here", function(){
		 * 	// do something here
		 * 	// return true; // if you want to exit the method after your injection
		 * 	// return false; // if you want the standard code to follow the prepend
		 * });
		 */

		
		/**
		 * Prepends custom developer functionality to an internal chart member. See [“Injection API"](index.html#injection-api-prepend-and-append).
		 * @param  {string} o Signature of member
		 * @param  {function} n Callback function, will be called with "apply"
		 * @memberOf  CIQ.ChartEngine
		 * @since
		 * <br>- 04-2015 You can append either to an {@link CIQ.ChartEngine} instance, or to the prototype. The first will affect only a single
		 * chart while the latter will affect any chart (if you have multiple on the screen).
		 * <br>- 15-07-01 function returns a descriptor which can be passed in to [removeInjection()]{@link CIQ.ChartEngine#removeInjection} to remove it later on.
		 * @return {object} Injection descriptor which can be passed in to {@link CIQ.ChartEngine#removeInjection} to remove it later on.
		 */
		CIQ.ChartEngine.prototype.prepend=function(o,n){
			var m="prepend"+o;
			var prepends;
			if(this instanceof CIQ.ChartEngine){
				prepends=this.hasOwnProperty(m)?this[m]:[];
				this[m]=[n].concat(prepends);
			}else{
				prepends=CIQ.ChartEngine.prototype[m] || [];
				CIQ.ChartEngine.prototype[m]=[n].concat(prepends);
			}
			return {method:m, func:n};
		};

		/**
		 * Appends custom developer functionality to an internal chart member. See [“Injection API"](index.html#injection-api-prepend-and-append).
		 * @param  {string} o Signature of member
		 * @param  {function} n Callback function, will be called with "apply"
		 * @memberOf  CIQ.ChartEngine
		 * @since
		 * <br>- 04-2015 You can append either to an {@link CIQ.ChartEngine} instance, or to the prototype. The first will affect only a single
		 * chart while the latter will affect any chart (if you have multiple on the screen)
		 * <br>- 15-07-01 function returns a descriptor which can be passed in to [removeInjection()]{@link CIQ.ChartEngine#removeInjection} to remove it later on.
		 * @return {object} Injection descriptor which can be passed in to {@link CIQ.ChartEngine#removeInjection} to remove it later on.
		 */
		CIQ.ChartEngine.prototype.append=function(o,n){
			var m="append"+o;
			var appends;
			if(this instanceof CIQ.ChartEngine){
				appends=this.hasOwnProperty(m)?this[m]:[];
				this[m]=appends.concat(n);
			}else{
				appends=CIQ.ChartEngine.prototype[m] || [];
				CIQ.ChartEngine.prototype[m]=appends.concat(n);
			}
			return {method:m, func:n};
		};

		/**
		 * Removes a specific injection.  One can remove either an instance injection or a prototype injection, depending on how the function is called.
		 * @param  {Object} id The injection descriptor returned from {@link CIQ.ChartEngine#prepend} or {@link CIQ.ChartEngine#append}
		 * @since 07/01/2015
		 * @memberOf  CIQ.ChartEngine
		 */
		CIQ.ChartEngine.prototype.removeInjection=function(id){
			var method=id.method;
			var i;
			if(this instanceof CIQ.ChartEngine){
				if(!this[method]) return;
				for(i=0;i<this[method].length;i++){
					if(this[method][i]==id.func){
						this[method].splice(i,1);
						return;
					}
				}
			}else{
				if(!CIQ.ChartEngine.prototype[method]) return;
				for(i=0;i<CIQ.ChartEngine.prototype[method].length;i++){
					if(CIQ.ChartEngine.prototype[method][i]==id.func){
						CIQ.ChartEngine.prototype[method].splice(i,1);
						return;
					}
				}
			}
		};
		/**
		 * Removes custom developer functionality from an internal chart member. Will remove any and all appends or prepends.
		 * @param  {string} o Signature of member
		 * @memberOf  CIQ.ChartEngine
		 */
		CIQ.ChartEngine.prototype.remove=function(o){
			if(this instanceof CIQ.ChartEngine){
				delete this["append"+o];
				delete this["prepend"+o];
			}else{
				delete CIQ.ChartEngine.prototype["append"+o];
				delete CIQ.ChartEngine.prototype["prepend"+o];
			}
		};

		CIQ.ChartEngine.registeredContainers=[];	// This will contain an array of all of the CIQ container objects
		// Note that if you are dynamically destroying containers in the DOM you should delete them from this array when you do so

		/**
		 * @deprecated Use CIQ.ScrollManager.attachRightClick
		 */
		CIQ.ChartEngine.handleContextMenu=function(e){ // This code prevents the browser context menu from popping up if you right click on a drawing or overlay
			if(!e) e=event;
			for(var i=0;i<CIQ.ChartEngine.registeredContainers.length;i++){
				var stx=CIQ.ChartEngine.registeredContainers[i].stx;
				if(stx){
					if(stx.anyHighlighted){
						if(e.preventDefault) e.preventDefault();
						return false;
					}
				}
			}
		};



	CIQ.ChartEngine.prototype.positionMarkers=function(){};


	/*
	 * Default implementation of plotSplinePrimitive.  Load splines.js to get real splining.
	 */
	var plotSplinePrimitive=function(points, tension, context) {
		if(!window.splineWarning) console.log("Warning: Cannot find implementation of splining.  Try loading splines.js");
		window.splineWarning=1;
		for(var i=2;i<points.length;i+=2){
			context.lineTo(points[i],points[i+1]);
		}
	};
	// If splines.js has not been included then set it with our default no-op implementation
	if(!_exports.plotSpline) _exports.plotSpline=plotSplinePrimitive;

	/**
	 * Placeholder for plugin data sets. This array will register each plug in object, complete with their functions.
	 * See our Plug-in {@tutorial Markers} tutorial for complete details and examples on registering and implementing a plug-in.
	 *
	 * If defined, Plug-in instances will be called by their corresponding native functions for the following:
	 * - consolidate ( called by {@link CIQ.ChartEngine#consolidatedQuote})
	 * - drawUnder (called by draw before {@link CIQ.ChartEngine#displayChart})
	 * - drawOver (called by draw after {@link CIQ.ChartEngine#displayChart})
	 * - {@link CIQ.ChartEngine#setMasterData}
	 * - {@link CIQ.ChartEngine#appendMasterData}
	 * - {@link CIQ.ChartEngine#initializeChart}
	 * - {@link CIQ.ChartEngine#createDataSet}
	 * @type array
	 * @memberOf  CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.plugins={};

	/*
	 * remove the items from chart and into stx
	 */

	/**
	 * Defines raw html for the chart controls. These can be overridden by manually placing HTML elements in the chart container
	 * with the same ID. To completely disable a chart control, programatically set controls[controlID]=null where controlID is the control to disable.
	 * You can also set any of these components to null in the stx object before creating a chart as outlined in the included examples.
	 * Note that only some controls can be disabled.
	 * @example
	 * var stxx=new CIQ.ChartEngine({container:$$("chartContainer"), controls: {chartControls:null}});
	 * @example
	 * // before calling newChart()
	 * stxx.controls["chartControls"]=null;
	 * @type {Object}
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.htmlControls={
			/**
			 * controlID for the Annotation Save button (class="stx-btn stx_annotation_save").
			 * @alias htmlControls.annotationSave
			 * @memberof   CIQ.ChartEngine
			 */
			"annotationSave":'<span class="stx-btn stx_annotation_save" style="display: none;">save</span>',
			/**
			 * controlID for the Annotation Cancel button (class="stx-btn stx_annotation_cancel").
			 * @alias htmlControls.annotationCancel
			 * @memberof   CIQ.ChartEngine
			 */
			"annotationCancel":'<span class="stx-btn stx_annotation_cancel" style="display: none; margin-left:10px;">cancel</span>',
			/**
			 * controlID for the Trash Can button / Series delete panel (id="mSticky"). Also see {@link CIQ.ChartEngine#displaySticky}
			 * @alias htmlControls.mSticky
			 * @memberof   CIQ.ChartEngine
			 * @example
			 * // disable the tool tip that appears when hovering over an overlay ( drawing, line study, etc)
			 * stxx.controls["mSticky"]=null;
			 */
			"mSticky":'<div id="mSticky"> <span id="mStickyInterior"></span> <span id="mStickyRightClick" class=""><span class="overlayEdit stx-btn" style="display:none"><span>&nbsp;</span></span> <span id="overlayTrashCan" class="stx-btn" style="display:none"><span>&nbsp;</span></span> <span id="mouseDeleteInstructions"><span>(</span><span id="mouseDeleteText">right-click to delete</span><span id="mouseManageText">right-click to manage</span><span>)</span></span></span></div>',
			/**
			 * controlID for the Horizontal Crosshair line (class="stx_crosshair stx_crosshair_x").
			 * @alias htmlControls.crossX
			 * @memberof   CIQ.ChartEngine
			 */
			"crossX":'<div class="stx_crosshair stx_crosshair_x" style="display: none;"></div>',
			/**
			 * controlID for the Vertical Crosshair line (class="stx_crosshair stx_crosshair_y").
			 * @alias htmlControls.crossY
			 * @memberof   CIQ.ChartEngine
			 */
			"crossY":'<div class="stx_crosshair stx_crosshair_y" style="display: none;"></div>',
			/**
			 * controlID for the zoom-in and zoom-out buttons (class="stx_chart_controls").
			 * @alias htmlControls.chartControls
			 * @memberof   CIQ.ChartEngine
			 */
			"chartControls":'<div class="stx_chart_controls" style="display: none; bottom: 22px;"><div id="chartSize"><span id="zoomOut" class="stx-zoom-out"></span><span id="zoomIn" class="stx-zoom-in"></span></div></div>',
			/**
			 * controlID for the home button (class="stx_jump_today home").
			 * The button goes away if you are showing the most current data. See example to manually turn it off.
			 * You can call `stxx.home();` programatically.	 See {@link CIQ.ChartEngine#home} for more details
			 * @alias htmlControls.home
			 * @memberof   CIQ.ChartEngine
			 * @example
			 * // disable the home button
			 * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
			 * stxx.controls["home"]=null;
			 */
			"home":'<div id="home" class="stx_jump_today home" style="display:none"><span></span></div>',
			/**
			 * controlID for div which floats along the X axis with the crosshair date (class="stx-float-date").
			 * @alias htmlControls.floatDate
			 * @memberof   CIQ.ChartEngine
			 */
			"floatDate":'<div class="stx-float-date" style="visibility: hidden;"></div>',
			/**
			 * controlID for div which controls the handle to resize panels (class="stx-ico-handle").
			 * @alias htmlControls.handleTemplate
			 * @memberof   CIQ.ChartEngine
			 * @example
			 * // example to hide the handle and prevent resizing of panels
			 * .stx-ico-handle {
			 *		display: none;
			 * }
			 */
			"handleTemplate":'<div class="stx-ico-handle" style="display: none;"><span></span></div> ',
			/**
			 * controlID for the div which hosts the panel title (symbol name, study name ) and the study control icons on the on the upper left hand corner of each panel (class="stx-panel-control")
			 * This control can not be disabled, but can be manipulated using the corresponding CSS style classes.
			 * On the main chart panel, `stx-chart-panel` is added to the class definition ( in addition to `stx-panel-title` which just controls the tile) so you can manipulate the entire chart controls section, separately from the rest of the study panel controls.
			 *
			 * @example
			 * // example to hide the chart symbol title
			 * .stx-panel-control.stx-chart-panel .stx-panel-title{
			 * 		display:none;
			 * }
			 *
			 * // for backwards compatibility, this is still supported:
			 * .chart-title{
			 *		display	: none;
			 *	}
			 *
			 * @example
			 * // example to hide all panels titles
			 * .stx-panel-control .stx-panel-title{
			 * 		display:none;
			 * }
			 *
			 * @alias htmlControls.iconsTemplate
			 * @memberof   CIQ.ChartEngine
			 */
			"iconsTemplate":'<div class="stx-panel-control"><div class="stx-panel-title"></div><div class="stx-btn-panel"><span class="stx-ico-up"></span></div><div class="stx-btn-panel"><span class="stx-ico-focus"></span></div><div class="stx-btn-panel"><span class="stx-ico-down"></span></div><div class="stx-btn-panel"><span class="stx-ico-edit"></span></div><div class="stx-btn-panel"><span class="stx-ico-close"></span></div></div>',
			/**
			 * controlID for grabber which sits to right of baseline so it can be moved.
			 * @alias htmlControls.baselineHandle
			 * @memberof   CIQ.ChartEngine
			 */
			"baselineHandle":'<div class="stx-baseline-handle fa" style="display: none;"></div>',

	};

	/**
	 * Registers the Chart controls and attaches event handlers to the zoom and home controls.
	 * @private
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.registerHTMLElements=function(){
		var c=this.chart.container;
		for(var control in CIQ.ChartEngine.htmlControls){
			if(typeof this.chart[control]=="undefined" && typeof this.controls[control]=="undefined"){
				if(!this.allowZoom && control=="chartControls") continue;
				var el=$$$("#" + control, c);
				if(el){
					this.chart[control]=el;
					this.controls[control]=el;
				}else{
					var rawHTML=CIQ.ChartEngine.htmlControls[control];
					var div=document.createElement("DIV");
					div.innerHTML=rawHTML;
					el=div.firstChild;
					c.appendChild(el);
					this.chart[control]=el;
					this.controls[control]=el;
					el.id=control;
				}
			}
		}
		if(this.controls.chartControls){
			var zoomIn=$$$("#zoomIn", this.controls.chartControls);
			var zoomOut=$$$("#zoomOut", this.controls.chartControls);

			CIQ.safeClickTouch(zoomIn,(function(self){return function(e){ self.zoomIn();e.stopPropagation();};})(this));
			CIQ.safeClickTouch(zoomOut,(function(self){return function(e){ self.zoomOut();e.stopPropagation();};})(this));
			if(!CIQ.touchDevice){
				zoomIn.onmouseover=(function(self){return function(e){ self.modalBegin();};})(this);
				zoomIn.onmouseout=(function(self){return function(e){ self.modalEnd();};})(this);
				zoomOut.onmouseover=(function(self){return function(e){ self.modalBegin();};})(this);
				zoomOut.onmouseout=(function(self){return function(e){ self.modalEnd();};})(this);
			}
		}
		if(this.controls.home){
			CIQ.safeClickTouch(this.controls.home,(function(self){return function(e){ self.home({animate:true});e.stopPropagation();};})(this));
			if(!CIQ.touchDevice){
				this.controls.home.onmouseover=(function(self){return function(e){ self.modalBegin();};})(this);
				this.controls.home.onmouseout=(function(self){return function(e){ self.modalEnd();};})(this);
			}
		}
	};

	/**
	 * Clones a style from a style object (obtained from getComputedStyle). Any styles are converted to camel case. This method automatically
	 * converts from browsers that store styles as numeric arrays rather than as property objects.
	 * @param  {object} div A style object derived from getComputedStyle
	 * @return {object}		A style object that will match properties
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.cloneStyle=function(styleObject){
		var rc={};
		var nativeCamelSupport=false;
		function capitalize(g) { return g[1].toUpperCase(); }
		for(var i in styleObject){
			var v=styleObject[i];
			// do *not* check styleObject["backgroundAttachment"]. Android browsers return bogus results.
			// instead we iterate through the object
			if(i=="backgroundAttachment") nativeCamelSupport=true;

			// modern browsers contain both camel and hyphenated. We can avoid the camelCase conversion
			// logic to save a little bit of startup time
			if(nativeCamelSupport){
				if(v && v.constructor==String && isNaN(i)){
					rc[i]=v;
				}
			}else if(!isNaN(i)){ // old android browsers fall into here
				var x=styleObject.getPropertyValue(v);
				if(x){
					//var vcc=v.replace(CIQ.camelCaseRegExp, function (g) { return g[1].toUpperCase(); })
					// much more efficient camel case conversion algorithm
					v=v.split("-");
					var ii=0, jj=v.length;
					var vcc=v[0];
					while(++ii<jj){
						vcc += v[ii].charAt(0).toUpperCase() + v[ii].slice(1);
					}
					rc[vcc]=x;
				}
			}else{ // old internet explorer falls into here
				var icc=i.replace(CIQ.camelCaseRegExp, capitalize);
				rc[icc]=v;
			}
		}
		return rc;
	};

	/**
	 * Returns an object containing the class style given a css class name (used by plotLine() for instance). A caching mechanism is used
	 * for performance. If styles are changed dynamically then use CIQ.ChartEngine.prototype.clearStyles to reset.
	 * @param  {string} className The CSS class name to get the styles
	 * @return {object}			  An object containing each style, in camel case.
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.canvasStyle=function(className){
		var s=this.styles[className];
		if(!s){
			var div=document.createElement("div");	// Create a dummy div
			div.className=className;
			this.container.appendChild(div);
			var styles=getComputedStyle(div);
			s=this.styles[className]=this.cloneStyle(styles);
			this.container.removeChild(div);
			if(!styles){	// css not initialized, possibly hidden iframe in firefox
				this.styles[className]=null;
			}
		}
		return s;
	};

	/**
	 * Detects if a string is a valid CSS color and if so returns that string. Otherwise it
	 * returns a style object, assuming that the string is a classname.
	 * @param  {string} str Either a color or a className
	 * @return {Object}		Either the color or a class object
	 * @memberOf  CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.colorOrStyle=function(str){
		if(str.indexOf("#")!=-1) return str;
		if(str.indexOf("(")!=-1) return str; // rgb() or rgba()
		if(str=="transparent") return str;
		return this.canvasStyle(str);
	};

	/**
		Call this to remove all of the loaded canvas styles, for instance after loading a new css file
		@memberOf CIQ.ChartEngine
	*/
	CIQ.ChartEngine.prototype.clearStyles=function(){
		this.styles={};
	};

	/**
	* Convenience method to set a style on the chart
	 * @param  {string} obj The object whose style you wish to change (stx_grid, stx_xaxis, etc)
	 * @param  {string} attribute The style name of the object you wish to change
	 * @param  {string} value The value to assign to the attribute
	 * @example
	 * stx.setStyle("stx_volume_up","color","green");
	 * @example
	 * stx.setStyle("stx_volume_down","color","red");
	 * @memberOf CIQ.ChartEngine
	*/
	CIQ.ChartEngine.prototype.setStyle=function(obj, attribute, value){
		if(!this.styles[obj]){
			this.canvasStyle(obj);
		}
		if(!this.styles[obj])
			this.styles[obj]={};
		this.styles[obj][CIQ.makeCamelCase(attribute)]=value;
	};

	/**
	 * Sets canvas font context given a css class name. Supports fontStyle, fontWeight, fontSize and fontFamily.
	 * @param  {string} className The name of the CSS class to pull font from
	 * @param  {external:CanvasRenderingContext2D} ctx		 An HTML Context
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.canvasFont=function(className,ctx){
		if(!ctx) ctx=this.chart.context;
		var style=this.canvasStyle(className);
		if(!style) return;

		var result=style.fontStyle +" "+style.fontWeight+" "+style.fontSize +" "+style.fontFamily;
		if(result.indexOf("undefined")==-1){
			ctx.font=result;
		}else{
			this.styles[className]=null;
			console.log("bad css style for class " + className);
		}
	};

	/**
	 * Sets color and globalAlpha (opacity) for the canvas given a css class name. Call this before drawing on the canvas.
	 * @param  {string} className A CSS style. Supports "color" and "opacity"
	 * @param  {external:CanvasRenderingContext2D} [ctx]	   An HTML Context
	 * @example
	 * stxx.canvasColor("myStyle");
	 * // draw a line using canvas primitives, will be color defined in .myStyle
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.canvasColor=function(className,ctx){
		if(!ctx) ctx=this.chart.context;
		var style=this.canvasStyle(className);
		if(!style) return;
		var color=style.color;
		if(CIQ.isTransparent(color)) color=this.defaultColor;
		ctx.globalAlpha=1;
		ctx.fillStyle=color;
		ctx.strokeStyle=color;
		var opacity=style.opacity;
		if(typeof opacity!="undefined") ctx.globalAlpha=opacity;
	};

	/**
	 * Returns the font size defined by the requested class name. Defaults to 12 if undefined. Use this to determine vertical heights so that lettering isn't clipped.
	 * @param  {string} className Class name
	 * @return {number}			  The font size (px is stripped)
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.getCanvasFontSize=function(className){
		var s=this.canvasStyle(className);
		var fs=s.fontSize;
		if(!fs) fs="12";
		return parseInt(CIQ.stripPX(fs));
	};

	/**
	 * Returns the canvas color specified in the class name
	 * @param  {string} className The class name
	 * @return {string}			  The color specified (May be undefined if none specified)
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.getCanvasColor=function(className){
		var s=this.canvasStyle(className);
		return s.color;
	};

	/**
	 * Override this function to hide the date which floats along the X axis when crosshairs are enabled. Return `true` to hide the date or `false` to display.
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.hideDates=function(){
		return false;
	};


	/**
	 * Runs the prepend injections. A prepend function that returns true will short circuit any proceeding prepend functions, and the core functionality.
	 * @private
	 * @param  {string} o	 The function name
	 * @param  {arguments} args The arguments to the function
	 * @param  {object} self The this object
	 * @return {boolean}	  Returns true if any prepend function returns true.
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.runPrepend=function(o, args, self){
		var n="prepend"+o;
		var prepends=this.hasOwnProperty(n)?this[n]:[];
		prepends=prepends.concat(CIQ.ChartEngine.prototype[n] || []);
		if(!prepends.length) return false;
		if(!self) self=this;
		for(var i=0;i<prepends.length;i++){
			var rv=prepends[i].apply(self,args);
			if(rv) return rv;
		}
		return false;
	};

	/**
	 * Runs the append injections. An append function that returns true will short circuit any proceeding append functions (but not the core functionality since that has already ocurred).
	 * @private
	 * @param  {string} o	 The function name
	 * @param  {arguments} args The arguments to the function
	 * @param  {object} self The this object
	 * @return {boolean}	  Returns true if any append function returns true.
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.runAppend=function(o, args, self){
		var n="append"+o;
		var appends=this.hasOwnProperty(n)?this[n]:[];
		appends=appends.concat(CIQ.ChartEngine.prototype[n] || []);
		if(!appends.length) return false;
		if(!self) self=this;
		for(var i=0;i<appends.length;i++){
			var rv=appends[i].apply(self,args);
			if(rv) return rv;
		}
		return false;
	};

	/**
	 * Registers a drawing tool. This is typically done using lazy eval.
	 * @private
	 * @param  {string} name Name of drawing tool
	 * @param  {function} func Constructor for drawing tool
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.registerDrawingTool=function(name, func){
		CIQ.ChartEngine.drawingTools[name]=func;
	};

	/**
	 * @deprecated
	 */
	
	CIQ.ChartEngine.prototype.createBlock=function(left, width, top, height, className, context){
		if(!context) context=this.chart.context;
		if(typeof(height)=="undefined"){
			return;
		}
		this.canvasColor(className,context);
		context.fillRect(left, top, width, height);
		context.globalAlpha=1;
	};

	/**
	 * This is called whenever a change to layout or drawings occurs. But can be used to trigger any event. If {@link CIQ.ChartEngine#changeCallback} has a function registered, then
	 * that function will be called with the type of change. The change itself is not passed in. The layout or drawings can be inspected to find the change but
	 * typically the entire set of drawings or entire layout is desired and it is mostly just necessary to know that they have changed so that they
	 * can be saved.
	 * @param  {string} change Type of change that occurred. Any string that {@link CIQ.ChartEngine#changeCallback} has been programmed to handle is valid.
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.changeOccurred=function(change){
		if(this.currentlyImporting) return;	// changes actually occurring because of an import, not user activity
		if(this.changeCallback) this.changeCallback(this, change);
		var obj={stx:this, symbol: this.chart.symbol, symbolObject:this.chart.symbolObject, layout:this.layout, drawings:this.drawingObjects};
		if(change=="layout"){
			this.dispatch("layout", obj);
		}else if(change=="vector"){
			this.dispatch("drawing", obj);
		}
	};

	/**
	 * Sets the base chart type to "line", "candle", "bar", "wave", “colored_bar”, "colored_line", “hollow_candle”,"volume_candle",”scatterplot”, "baseline_delta", "baseline_delta_mountain", "mountain", "colored_mountain"
	 * @param {string} chartType The chart type
	 * @memberOf CIQ.ChartEngine
	 * @since 05-2016-10.1 "baseline_delta_mountain" and  "colored_mountain" are also available
	 */
	CIQ.ChartEngine.prototype.setChartType=function(chartType){
		this.layout.chartType=chartType;
		if(this.displayInitialized) this.draw();
		this.changeOccurred("layout");
	};

	/**
	 * Sets the base aggregation type to "rangebars" "ohlc" "kagi" "pandf" "heikinashi" "linebreak" "renko".
	 * See the [Chart types](tutorial-Chart%20Types%20and%20Styles.html#setAggregationType) tutorial for details on how to override aggregation type defaults.
	 * @param {string} chartType The chart type
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.setAggregationType=function(aggregationType){
		this.layout.aggregationType=aggregationType;
		if(this.chart.canvas){
			this.createDataSet();
			this.draw();
		}
		this.changeOccurred("layout");
	};

	/**
	 * Sets the chart scale
	 * @param {string} chartScale "log", "linear"
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.setChartScale=function(chartScale){
		if(!chartScale) chartScale="linear";
		this.layout.chartScale=chartScale;
		if(this.chart.canvas) this.draw();
		this.changeOccurred("layout");
	};

	/**
	 * Sets the charts to adjusted values rather than standard values. Adjusted values are calculated outside of the chart engine (and may be splits, dividends or both).
	 * When charts are using adjusted values, a computed ratio for each tick is used for price to pixel calculations which keeps drawings accurate
	 * @param {boolean} data True to use adjusted values (Adj_Close), false to use Close values
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.setAdjusted=function(data){
		this.layout.adj=data;
		if(this.chart.canvas){
			this.createDataSet();
			this.draw();
		}
		this.changeOccurred("layout");
	};

	/**
	 * Turns on or off the volume underlay indicator
	 * @param {boolean} data True to turn on the underlay
	 * @memberOf CIQ.ChartEngine
	 * @deprecated
	 */
	CIQ.ChartEngine.prototype.setVolumeUnderlay=function(data){
		this.layout.volumeUnderlay=data;
		if(this.chart.canvas) this.draw();
		this.changeOccurred("layout");
	};

	/**
	 * Serializes all of the drawings on the chart(s) so that they can be saved to an external database and later reconstructed
	 * with {@link CIQ.ChartEngine#reconstructDrawings}.
	 * @return {array} An array of all of the drawing serializations
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.serializeDrawings=function(){
		var arr=[];
		for(var i=0;i<this.drawingObjects.length;i++){
			arr.push(this.drawingObjects[i].serialize());
		}
		return arr;
	};

	/**
	 * Causes all drawings to delete themselves. External access should be made through @see CIQ.ChartEngine.prototype.clearDrawings
	 * @private
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.abortDrawings=function(){
		for(var i=0;i<this.drawingObjects.length;i++){
			this.drawingObjects[i].abort(true);
		}
		this.drawingObjects=[];
	};

	/**
	 * Reconstructs drawings from an array originally created by {@link CIQ.ChartEngine#serializeDrawings}.
	 * To immediately render the reconstructed drawing, you must call `draw()`.
	 * See {@tutorial Custom Drawing Tools} for more details.
	 * @param  {array} arr An array of serialized drawings
	 * @memberOf CIQ.ChartEngine
	 * @example
	 * // programatically add a rectangle
	 * stxx.reconstructDrawings([{"name":"rectangle","pnl":"chart","col":"transparent","fc":"#7DA6F5","ptrn":"solid","lw":1.1,"d0":"20151216030000000","d1":"20151216081000000","tzo0":300,"tzo1":300,"v0":152.5508906882591,"v1":143.3385829959514}]);
	 * // programatically add a vertical line
	 * stxx.reconstructDrawings([{"name":"vertical","pnl":"chart","col":"transparent","ptrn":"solid","lw":1.1,"v0":147.45987854251013,"d0":"20151216023000000","tzo0":300,"al":true}]);
	 * // now render the reconstructed drawings
	 * stxx.draw();
	 */
	CIQ.ChartEngine.prototype.reconstructDrawings=function(arr){
		if(!CIQ.Drawing) return;
		for(var i=0;i<arr.length;i++){
			var rep=arr[i];
			if(rep.name=="fibonacci") rep.name="retracement";
			var Factory=CIQ.ChartEngine.drawingTools[rep.name];
			if(!Factory){
				if(CIQ.Drawing[rep.name]){
					Factory=CIQ.Drawing[rep.name];
					CIQ.ChartEngine.registerDrawingTool(rep.name, Factory);
				}
			}
			if(Factory){
				var drawing=new Factory();
				drawing.reconstruct(this, rep);
				this.drawingObjects.push(drawing);
			}
		}
	};

	/**
	 * Clears all the drawings on the chart. (Do not call abortDrawings directly).
	 * @param {boolean} cantUndo Set to true to make this an "non-undoable" operation
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.clearDrawings=function(cantUndo){
		var before=CIQ.shallowClone(this.drawingObjects);
		this.abortDrawings();
		if(cantUndo){
			this.undoStamps=[];
		}else{
			this.undoStamp(before, CIQ.shallowClone(this.drawingObjects));
		}
		this.changeOccurred("vector");
		this.createDataSet();
		this.deleteHighlighted(); // this will remove any stickies and also call draw()
	};

	/**
	 * Creates a new drawing of the specified type with the specified parameters. See {@tutorial Custom Drawing Tools} for more details.
	 * @param  {string} type	   Drawing name
	 * @param  {object} parameters Parameters that describe the drawing
	 * @return {CIQ.Drawing}			A drawing object
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.createDrawing=function(type, parameters){
		if(!CIQ.Drawing) return;
		var drawing=new CIQ.Drawing[type]();
		drawing.reconstruct(this, parameters);
		this.drawingObjects.push(drawing);
		this.draw();
		return drawing;
	};

	/**
	 * Removes the drawing. Drawing object should be one returned from {@link CIQ.ChartEngine#createDrawing}. See {@tutorial Custom Drawing Tools} for more details.
	 * @param  {Object} drawing Drawing object
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.removeDrawing=function(drawing){
		for(var i=0;i<this.drawingObjects.length;i++){
			if(this.drawingObjects[i]==drawing){
				this.drawingObjects.splice(i,1);
				this.changeOccurred("vector");
				this.draw();
				return;
			}
		}
	};

	/**
	 * Returns a date (in yyyymmddhhmm form) given a tick (location in the dataSet). If the tick lies outside of the dataSet then the date will
	 * be arrived at algorithmically by calculating into the past or future
	 * @param  {number} tick  Location in the dataSet (use {@link CIQ.ChartEngine#dateFromBar} for dataSegment)
	 * @param  {CIQ.Chart} [chart] An optional chart object
	 * @param  {boolean} [nativeDate] True to return as date object otherwise returns in yyyymmddhhmm form
	 * @return {string}		  The date form dictated by native param
	 * @todo  Return native date rather than string date
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.dateFromTick=function(tick, chart, nativeDate) {
		if(!chart) chart = this.chart;
		var data_len = chart.dataSet.length;
		var dt;
		var iter;
		var ctr = 0;

		if (tick < 0) {
			iter = this.standardMarketIterator(chart.dataSet[0].DT);
			while (ctr > tick) {
				dt = iter.previous();
				ctr -= 1;
			}
		} else if (tick >= data_len) {
			iter = this.standardMarketIterator(chart.dataSet[data_len - 1].DT);
			while (data_len - 1 + ctr < tick) {
				dt = iter.next();
				ctr += 1;
			}
		} else {
			dt = chart.dataSet[tick].DT;
		}

		if (nativeDate) {
			return new Date(dt.getTime());
		}
		return CIQ.yyyymmddhhmm(dt);
	};

	/**
	 * Calculates and sets the value of zoom and scroll for y-axis based on yAxis.initialMarginTop and yAxis.initialMarginBottom.
	 * This method will automatically translate those into starting scroll and zoom factors.
	 * If the combined initial values are greater than the y axis height, then both zoom and scroll will be rest to 0;
	 * @param {CIQ.ChartEngine.YAxis} yAxis The yAxis to reset
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.calculateYAxisMargins=function(yAxis){
		yAxis.zoom=yAxis.initialMarginTop+yAxis.initialMarginBottom;
		yAxis.scroll=(yAxis.initialMarginTop-yAxis.initialMarginBottom)/2;
		if(yAxis.zoom>yAxis.height) {
			//console.log('calculateYAxisMargins adjusted zoom and scroll to 0. zoom',yAxis.zoom,'  |  height=',yAxis.height);
			yAxis.zoom=0; // If the zoom is greater than the height then we'll have an upside down y-axis
			yAxis.scroll=0;
		}
	};	

	/**
	 * Returns the chart to the home position, where the most recent tick is on the right side of the screen.
	 * @param {boolean} params.animate	Set to true to animate a smooth scroll to the home position.	 
	 * @param {Object} params.maintainWhitespace Defaults to `true`. Set to `true` to maintain the currently visible white space on the left of the chart. 
	 * @param {Object} params.whitespace Override to force a spacific amount of whitespace. Will take presencece over `params.maintainWhitespace`
	 * @param { CIQ.Chart} [params.chart] Optionally which chart to scroll home
	 * @memberOf CIQ.ChartEngine
	 * @example
	 * stxx.home({maintainWhitespace:false});
	 */
	CIQ.ChartEngine.prototype.home=function(params){
		this.swipe.amplitude=0;
		this.grabbingScreen= false; //in case they were grabbing the screen and let go on top of the home button.
		if(CIQ.ChartEngine.insideChart) CIQ.unappendClassName(this.container, "stx-drag-chart"); //in case they were grabbing the screen and let go on top of the home button.
		if(typeof params != "object"){
			// backward compatibility
			params={
				maintainWhitespace: params
			};
		}

		if (typeof params.maintainWhitespace=="undefined") params.maintainWhitespace=true;  // maintain the whitespace unless set to false

		this.cancelTouchSingleClick=true;
		if(!this.chart.dataSet || !this.chart.dataSet.length) {
			// to clear out anything that may have been on the screen. Otherwise we still show stale data.
			this.draw();
			return;
		}
		this.micropixels=0;
		var barsDisplayedOnScreen=this.chart.width/this.layout.candleWidth;
		for(var chartName in this.charts){
			var chart=this.charts[chartName];
			if(params.chart && params.chart!=chart) continue;
			var whitespace=0;
			if(params.maintainWhitespace && this.preferences.whitespace>=0) whitespace=this.preferences.whitespace;
			if(params.whitespace || params.whitespace===0) whitespace=params.whitespace;
			var wsInTicks=whitespace/this.layout.candleWidth;
			var isLineType=!CIQ.ChartEngine.chartShowsHighs(this.layout.chartType);
			if(this.yaxisLabelStyle=="roundRectArrow" && !(isLineType && this.extendLastTick && this.chart.yaxisPaddingRight!==0)){
				// Special case when we have a pointy arrow we want the current tick to be right
				// at the arrow point, not buried underneath it
				// unless the developer set the flags to extend the line/mountain to the very edge of the chart.
				// or unless the y-axis is overlaying the chart
				var margin=3; // should be the same from createYAxisLabel
				var height=this.getCanvasFontSize("stx_yaxis")+margin*2;
				var leftMargin=height*0.66;
				wsInTicks+=leftMargin/this.layout.candleWidth;
				if(wsInTicks<0) wsInTicks=0;
			}
			var exactScroll=Math.min(barsDisplayedOnScreen+1,chart.dataSet.length); // the scroll must be one more than the number of bars you want to see.
			if(this.chart.allowScrollPast) exactScroll=barsDisplayedOnScreen+1; // If whitespace allowed on left of screen
			exactScroll-=wsInTicks;
			var homeScroll=Math.floor(exactScroll);
			this.micropixels=(exactScroll-homeScroll)*this.layout.candleWidth;
			if(isLineType) this.micropixels+=this.layout.candleWidth/2; // line charts display to middle of candle
			if(this.micropixels>this.layout.candleWidth){ // to deal with rounding errors
				homeScroll++;
				this.micropixels-=this.layout.candleWidth;
			}

			if(params.animate){
				var self=this;
				this.scrollTo(chart, homeScroll,function(self, chart, homeScroll){
					return function(){
						self.calculateYAxisMargins(chart.panel.yAxis);
						chart.scroll=homeScroll;
						self.draw();
					};
				}(self, chart, homeScroll));
			}else{
				chart.scroll=homeScroll;
				this.calculateYAxisMargins(chart.panel.yAxis);
			}
		}
		this.draw();
	};

	/**
	 * Whether the chart is scrolled to a home position.
	 *
	 * @returns {boolean} true when the scroll position shows the last tick of the dataSet
	 * @memberOf CIQ.ChartEngine
	 * @since 2016-06-21
	 */
	CIQ.ChartEngine.prototype.isHome=function() {
		return ((this.chart.scroll-1)*this.layout.candleWidth)+this.micropixels<=this.chart.width+1;
	};

	/**
	 * Returns the tick (position in dataSet) given the requested date. The date does not need to match exactly. If the date lies between ticks
	 * then the earlier will be returned by default. If the date lies before or after the chart then {@link CIQ.ChartEngine#futureTick} or {@link CIQ.ChartEngine#pastTick} will
	 * be used to calculate the tick location.
	 * @param  {string} dt	  Date in string format
	 * @param  {CIQ.Chart} [chart] Optional chart object
	 * @param  {number} [adj] Optional timezone adjustment in minutes to apply to date before getting tick
	 * @param  {boolean} [forward] Optional switch to return the next tick as opposed to the previous, in case an exact match is not found
	 * @return {number}		  The tick location
	 * @todo  Use native dates instead of string form dates.
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.tickFromDate=function(dt, chart, adj, forward) {
		if(!chart) chart=this.chart;
		if(!chart.dataSet || !chart.dataSet.length) return 0;
		if(!adj) adj=0;

		if(!chart) {
			chart = this.chart;
		}
		var target = dt.constructor==Date?dt:CIQ.strToDateTime(dt);

		// This line is used by drawings which are saved with a gmt offset.
		if(!CIQ.ChartEngine.isDailyInterval(this.layout.interval)) target.setMinutes(target.getMinutes()+adj);

		var ms=target.getTime();
		var total=chart.tickCache[ms];
		if(total || total===0){
			return total;
		}

		var firstDate=chart.dataSet[0].DT;
		var lastDate=chart.dataSet[chart.dataSet.length-1].DT;
		if(target>=firstDate && target<=lastDate){
			for(var i=0;i<chart.dataSet.length;i++){
				var d=chart.dataSet[i].DT;
				if(d.getTime()==target.getTime()){
					chart.tickCache[ms]=i;
					return i;
				}
				if(d>target){
					chart.tickCache[ms]=forward?i:i-1;
					return chart.tickCache[ms];
				}
			}
		}

		var intoThePast=target<firstDate; // start at beginning of chart and work backward into the past, or end of chart and into the future
		var start=intoThePast?firstDate:lastDate;
		var iter = this.standardMarketIterator(start);
		var ticks=iter.futureTick({end:target});
		total=intoThePast?ticks*-1:chart.dataSet.length-1+ticks;
		chart.tickCache[ms]=total;
		return total;
	};

	/**
	 * This is the object stored in CIQ.ChartEngine.chart.xaxis which contains information regarding an x-axis tick.
	 * See {@link CIQ.ChartEngine.AdvancedInjectable#createXAxis} for more detail.
	 * @property {number} hz Horizontal position of center of label in pixels
	 * @property {string} text The text to display in the label
	 * @property {string} grid Either "line" or "boundary" depending on whether the label should be a date/time boundary or just a grid line
	 * @class
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.XAxisLabel=function(hz, grid, text){
		this.hz=hz;
		this.grid=grid;
		this.text=text;
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * <span class="animation">Animation Loop</span>
	 * Call this method to create the X axis (date axis).
	 *
	 * See {@link CIQ.ChartEngine.XAxis#axisType} for details on setting numeric or date based axis.
	 *
	 * Use css styles `stx_xaxis` and `stx_xaxis_dark` to control colors and fonts for the dates. <br>
	 * Use css styles `stx_grid` and `stx_grid_dark` to control the grid line colors. <br>
	 * The dark styles are used when the grid changes to a major point such as the start of a new day on an intraday chart, or a new month on a daily chart.
	 *
	 * See {@tutorial Custom X-axis} for additional details.
	 *
	 * @param  {CIQ.ChartEngine.Chart} chart	The chart to create an x-axis for
	 * @return {CIQ.ChartEngine.XAxisLabel[]}			axisRepresentation that can be passed in to {@link CIQ.ChartEngine#drawXAxis}
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias createXAxis
	 *
	 */
	CIQ.ChartEngine.prototype.createXAxis=function(chart){
        //TODO caching of xaxis probably in this function.
		if(chart.dataSegment.length<=0) return null;
		if(CIQ.ChartEngine.hideDates()) return null;
		var arguments$=[chart];
		var axisRepresentation=this.runPrepend("createXAxis", arguments$);
		if(axisRepresentation) return axisRepresentation;
		var interval=this.layout.interval;
		//if(chart.xAxis.axisType=="numeric"){
		//	return this.createNumericXAxis(chart);
		//}
		axisRepresentation = this.createTickXAxisWithDates(chart);
		this.runAppend("createXAxis", arguments$);
		return axisRepresentation;
	};

	/**
	 * Draws a numeric x-axis, attempting to automatically create "nice" labels for readability.
	 * Uses the array "index" of the dataSegment instead of "Date" field to determine the label.
	 *
	 * Set `chart.xAxis.axisType=="numeric"` to activate.
	 *
	 * @param  {CIQ.ChartEngine.Chart} chart			   Chart object
	 * @return {CIQ.ChartEngine.XAxisLabel[]}			axisRepresentation that can be passed in to {@link CIQ.ChartEngine#drawXAxis}
	 * @memberOf CIQ.ChartEngine
	 */
/*	CIQ.ChartEngine.prototype.createNumericXAxis=function(chart){
		axisRepresentation=[];
		chart.xaxis=[];
		for(var i=0;i<chart.maxTicks;i++){
			if(chart.dataSegment[i]) break;
			chart.xaxis.push(null);
		}
		for(var j=i;j<chart.maxTicks;j++){
			if(!chart.dataSegment[i]) break;
		}
		var filledScreenRatio=(j-i)/chart.maxTicks;
		var idealTickSizePixels=chart.xAxis.idealTickSizePixels?chart.xAxis.idealTickSizePixels:chart.xAxis.autoComputedTickSizePixels;
		var idealTicks=Math.round((this.chart.width*filledScreenRatio)/idealTickSizePixels);
		var minMax=this.determineMinMax(chart.dataSegment, ["index"]);
		var maxPoint=minMax[1], minPoint=minMax[0];
		var range=maxPoint-minPoint;

		function niceNum(range, round) {
			var exponent; // exponent of range
			var fraction; // fractional part of range
			var niceFraction; // nice, rounded fraction

			exponent = Math.floor(Math.log10(range));
			fraction = range / Math.pow(10, exponent);

			if (round) {
			  if (fraction < 1.5)
				niceFraction = 1;
			  else if (fraction < 3)
				niceFraction = 2;
			  else if (fraction < 7)
				niceFraction = 5;
			  else
				niceFraction = 10;
			} else {
			  if (fraction <= 1)
				niceFraction = 1;
			  else if (fraction <= 2)
				niceFraction = 2;
			  else if (fraction <= 5)
				niceFraction = 5;
			  else
				niceFraction = 10;
			}

			return niceFraction * Math.pow(10, exponent);
		}

		var niceRange = niceNum(maxPoint - minPoint, false);
		var tickSpacing = niceNum(range / (idealTicks - 1), true);
		var niceMin = Math.floor(minPoint / tickSpacing) * tickSpacing;
		var niceMax = Math.ceil(maxPoint / tickSpacing) * tickSpacing;

		var nextLabel=niceMin;
		if(niceMin<minPoint) nextLabel=niceMin+tickSpacing;

		var hz;
		for(i;i<chart.maxTicks;i++){
			var prices=chart.dataSegment[i];
			if(prices){
				var obj={
					index: prices.index,
					data: prices
				};
				chart.xaxis.push(obj);
				if(prices.index<nextLabel) continue;
				if(prices.index==nextLabel){
					hz=chart.left+i*this.layout.candleWidth + this.micropixels;
				}else if(prices.index>nextLabel){
					hz=chart.left+i*this.layout.candleWidth-3 + this.micropixels;
				}
				axisRepresentation.push(new CIQ.ChartEngine.XAxisLabel(hz,"line",nextLabel));
				nextLabel+=tickSpacing;
			}else{
				//TODO, calculate forward using tickSpacing
				chart.xaxis.push(null);
			}
		}
		return axisRepresentation;
	};
*/

	/**
	 * Change the yAxis.height and yAxis.bottom to create drawing space
	 * for the xAxis.
	 *
	 * @param {CIQ.ChartEngine.Panel} panel	Panel to adjust, used to check location
	 * @param {CIQ.ChartEngine.YAxis} yAxis	yAxis to adjust
	 * @private
	 */
	CIQ.ChartEngine.prototype.adjustYAxisHeightOffset = function(panel, yAxis) {
		yAxis.bottomOffset = 0;
		if(!this.xaxisHeight && this.xaxisHeight!==0){
			this.xaxisHeight=this.getCanvasFontSize("stx_xaxis")+4;
			if(this.chart.xAxis.displayBorder || this.axisBorders) this.xaxisHeight+=3;
		}
		if (this.xAxisAsFooter === true && panel.bottom > this.chart.canvasHeight-this.xaxisHeight) {
			yAxis.bottomOffset = this.xaxisHeight;
		} else if (this.xAxisAsFooter !== true && panel.name == "chart") {
			yAxis.bottomOffset = this.xaxisHeight;
		}

		yAxis.bottom = panel.bottom - yAxis.bottomOffset;
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * <span class="animation">Animation Loop</span>
	 *
	 * Draws the grid for the y-axis.
	 * @param  {CIQ.ChartEngine.Panel} panel The panel for the y-axis
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias plotYAxisGrid
	 */
	CIQ.ChartEngine.prototype.plotYAxisGrid=function(panel){
		if(this.runPrepend("plotYAxisGrid", arguments)) return;
		var context=this.chart.context;
		panel.yAxis.yAxisPlotter.draw(context, "grid");
		this.runAppend("plotYAxisGrid", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * <span class="animation">Animation Loop</span>
	 *
	 * Plots the text on the y-axis.
	 * @param  {CIQ.ChartEngine.Panel} panel The panel for the y-axis
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias plotYAxisText
	 */
	CIQ.ChartEngine.prototype.plotYAxisText=function(panel){
		if(this.runPrepend("plotYAxisText", arguments)) return;
		var arr=panel.yaxisLHS.concat(panel.yaxisRHS);
		for(var i=0;i<arr.length;i++){
			var yAxis=arr[i];
			if(!yAxis.yAxisPlotter) continue;
			if(yAxis.noDraw) continue;
			this.canvasFont("stx_yaxis");
			this.canvasColor("stx_yaxis");
			var context=this.chart.context;
			context.textBaseline="middle";
			if(yAxis.justifyRight) context.textAlign="right";
			else context.textAlign="left";
			var fontHeight=this.getCanvasFontSize("stx_yaxis");
			yAxis.yAxisPlotter.draw(context, "text");
			context.textBaseline="alphabetic";
			context.textAlign="left";
		}
		this.runAppend("plotYAxisText", arguments);
	};

	/**
	 * Formats prices for the Y-axis. Intelligently computes the decimal places based on the size of the y-axis ticks.
	 * This can be overriden by manually setting decimalPlaces in the yAxis. You can call this method to ensure that any
	 * prices that you are using outside of the chart are formatted the same as the prices on the y-axis.
	 * @param  {number} price The price to be formatted
	 * @param  {CIQ.ChartEngine.Panel} panel The panel for the y-axis. If the panel is a study panel, then prices will be condensed by {@link condenseInt}.
	 * @param {number} [requestedDecimalPlaces] Optionally specify the number of decimal places, otherwise it will be determined by the yaxis setting, or if not set, determined automatically
	 * @param {CIQ.ChartEngine.YAxis} [yAxis] Optional yAxis
	 * @return {number}		  The formatted price
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.formatYAxisPrice=function(price, panel, requestedDecimalPlaces, yAxis){
		if(price===null || typeof price=="undefined" || isNaN(price) ) return "";
		var yax=yAxis?yAxis:panel.yAxis;
		var decimalPlaces=requestedDecimalPlaces;
		if(!decimalPlaces && decimalPlaces!==0) decimalPlaces=yax.printDecimalPlaces;
		if(!decimalPlaces && decimalPlaces!==0){
			if(yax.priceTick<0.01) decimalPlaces=4;
			else if(yax.priceTick<0.1) decimalPlaces=2;
			else if(yax.priceTick<1) decimalPlaces=1;
			else decimalPlaces=0;

		}
		if(panel.name!=panel.chart.name){	// Don't condense chart prices, but do condense study prices
			if(yax.priceTick>100){	// k or m for thousands or millions
				return CIQ.condenseInt(price);
			}
		}

		var internationalizer=this.internationalizer;
		if(internationalizer){
			var l=internationalizer.priceFormatters.length;
			if(decimalPlaces>=l) decimalPlaces=l-1;
			price=internationalizer.priceFormatters[decimalPlaces].format(price);
		}else{
			price=price.toFixed(decimalPlaces);
			// the above may be a problem at some point for datasets with very small shadows because the rounding skews the real number.
			// We should truncate the decimal places instead of rounding to preserve the accuracy,
			// but for now the above seems to work fine so we will leave it alone.
			// And also the amount of rounding being done here actually "corrects" some of differences introduced elsewhere in the yAxis price calculations. ugg!
			// Use the flowing code when ready to show truncated vs. rounded values
			//price = price.toString();
			//if(price.indexOf(".") > 0){
			//	price = price.slice(0, (price.indexOf("."))+decimalPlaces+1)
			//};
		}
		return price;
	};

	/**
	 * Pads out the decimal places given only a price. It will not truncate, but will
	 * add zeroes. Prices under 2 will be padded to 4 decimal places. Prices over 1000
	 * will not be padded. All other prices will be padded to 2 decimal places.
	 * @param  {Number} price A price
	 * @param  {Number} [determinant] The optional value to determine the decimal places. For
	 * instance, if you want to determine the number of decimals for today's change based on the actual price
	 * @return {string}       A price padded for decimal places
	 * @since 2016-07-16
	 */
	CIQ.ChartEngine.prototype.padOutPrice=function(price, determinant){
		if(price!==0 && (!price || typeof price=="undefined")) return "";
		if(!determinant && determinant!==0) determinant=price;
		var str="" + determinant;
		var decimalPlaces=str.substring(str.indexOf(".")).length-1;
		if(determinant>=1000) decimalPlaces=Math.max(decimalPlaces,0);
		else if(determinant<2) decimalPlaces=Math.max(decimalPlaces,4);
		else decimalPlaces=Math.max(decimalPlaces,2);

		var internationalizer=this.internationalizer;
		if(internationalizer){
			var l=internationalizer.priceFormatters.length;
			if(decimalPlaces>=l) decimalPlaces=l-1;
			price=internationalizer.priceFormatters[decimalPlaces].format(price);
		}else{
			price=price.toFixed(decimalPlaces);
		}
		return price;
	};

	/**
	 * Formats a price according to the decimalPlaces specified in either the panel or chart.
	 * It will then format to international standards if the internationalizer is set.
	 * This method *does not* condense prices.
	 * @param  {number} price The price to be formatted
	 * @param  {CIQ.ChartEngine.Panel} panel The panel to use to determine the number of decimal places.
	 * @return {number}		  The formatted price
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.formatPrice=function(price, panel){
		if(price!==0 && (!price || typeof price=="undefined")) return "";
		if(!panel) panel=this.currentPanel;
		if(!panel) panel=this.chart.panel;
		if(!panel) return price;
		var decimalPlaces=panel.decimalPlaces;
		if(!decimalPlaces && decimalPlaces!==0){
			decimalPlaces=panel.chart.decimalPlaces;
		}
		if(!decimalPlaces && decimalPlaces!==0){
			return price;
		}
		var internationalizer=this.internationalizer;
		if(internationalizer){
			var l=internationalizer.priceFormatters.length;
			if(decimalPlaces>=l) decimalPlaces=l-1;
			price=internationalizer.priceFormatters[decimalPlaces].format(price);
		}else{
			price=price.toFixed(decimalPlaces);
		}
		return price;
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * <span class="animation">Animation Loop</span>
	 * Registers mouse events for the crosshair elements (to prevent them from picking up events)
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias createCrosshairs
	 */
	CIQ.ChartEngine.prototype.createCrosshairs=function(){
		if(this.runPrepend("createCrosshairs", arguments)) return;
		if(this.controls.crossX.onmousedown) return;

		this.controls.crossY.onmousedown=function(e){
			if(!e) e=event;
			if(e.preventDefault) e.preventDefault();
			return false;
		};
		this.controls.crossX.onmousedown=function(e){
			if(!e) e=event;
			if(e.preventDefault) e.preventDefault();
			return false;
		};
		this.runAppend("createCrosshairs", arguments);
	};

	/**
	 * This method determines the high and low values for the data set. It requires an array of fields to check. For instance
	 * the array might contain ["Close","Series1","Series2"] which would return the max and min of all of those values for each
	 * quote.
	 *
	 * @param  {Array} quotes The array of quotes to evaluate for min and max (typically CIQ.ChartEngine.chart.dataSegment)
	 * @param  {Array} fields A list of fields to compare
	 * @param {Boolean} [sum] If true then compute maximum sum rather than the maximum single value
	 * @param {Boolean} [bypassTransform] If true then bypass any transformations
	 * @param {Number} [length] Optionally specify how much of the quotes to process
	 * @return {Array}		  A tuple, min and max values
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.determineMinMax=function(quotes, fields, sum, bypassTransform, length){
		var highValue=Number.MAX_VALUE*-1;
		var lowValue=Number.MAX_VALUE;
		var isTransform=false;
		var l=quotes.length;
		if(length) l=length;

		for(var i=0;i<l;i++){
			var quote=quotes[i];
			if(!quote) continue;
			if(!bypassTransform){
				if(quote.transform) {
					isTransform=true;
					quote=quote.transform;
				}else if(isTransform) continue;	 //don't include points without transforms if we have been including points with transforms
			}
			var acc=0;
			for(var j=0;j<fields.length;j++){
				var f=quote[fields[j]];
				if(!f) continue;
				if(typeof(f)=="number") f=[f];
				for(var v=0;v<f.length;v++){
					var val=f[v];
					if(val || val===0){
						if(sum){
							acc+=val;
							if(acc>highValue) highValue=acc;
							if(acc<lowValue) lowValue=acc;
						}else{
							if(val>highValue) highValue=val;
							if(val<lowValue) lowValue=val;
						}
					}
				}
			}
		}
		if(highValue==Number.MAX_VALUE*-1) highValue=0;
		if(lowValue==Number.MAX_VALUE) lowValue=0;
		return [lowValue, highValue];
	};

	/**
	 * Here we calculate the range for the yaxis and set appropriate member variables.
	 * @private
	 * @param  {CIQ.ChartEngine.Panel} panel The panel containing the yaxis
	 * @param  {CIQ.ChartEngine.YAxis} yAxis The yaxis to work on
	 * @param {Number} [low] The low value for the axis
	 * @param {Number} [high] The high value for the axis
	 */
	CIQ.ChartEngine.prototype.calculateYAxisRange=function(panel, yAxis, low, high){
		if(low==Number.MAX_VALUE){
			low=0;
			high=0;
		}
		var cheight=panel.height, newHigh=null, newLow=null;
		this.adjustYAxisHeightOffset(panel, yAxis);
		yAxis.top=panel.top;
		yAxis.height=yAxis.bottom-yAxis.top;
		// Ensure the user hasn't scrolled off the top or the bottom of the chart
		var verticalPad=Math.round(Math.abs(cheight/5));
		if(cheight-Math.abs(yAxis.scroll)<verticalPad){
			yAxis.scroll=(cheight-verticalPad)*(yAxis.scroll<0?-1:1);
		}

		var pricePerPix=(high-low)/yAxis.height;
		if(low || low===0){
			if(high-low===0){	// A stock that has no movement, so we create some padding so that a straight line will appear
				newHigh=high*2;
				newLow=0;
			}else{
				if((this.layout.semiLog || this.layout.chartScale=="log") && newHigh){
					// When in log scale, the yAxis high and low will be the log10 of the prices. The actual values are just for display, not for calculation.
					var logLow=Math.log(low)/Math.LN10;
					var logHigh=Math.log(high)/Math.LN10;
					newHigh=Math.pow(10, logHigh);
					newLow=Math.pow(10, logLow);
				}else{
					newHigh=high;
					newLow=low;
				}
			}
			yAxis.high=newHigh;
			yAxis.low=newLow;
		}
		if(yAxis.max || yAxis.max===0) yAxis.high=yAxis.max;
		if(yAxis.min || yAxis.min===0) yAxis.low=yAxis.min;
		yAxis.shadow=yAxis.high-yAxis.low;
		if(panel.chart.name===panel.name && panel.yAxis===yAxis){ // For the main yaxis on the main chart only check for semilog
			var isLogScale=(this.layout.semiLog || this.layout.chartScale=="log");
			if(panel.chart.isComparison) isLogScale=false;
			if(yAxis.semiLog!=isLogScale){
				this.clearPixelCache();
				yAxis.semiLog=isLogScale;
			}
		}
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * <span class="animation">Animation Loop</span>
	 *
	 * This method creates and draws the Y Axis for the chart
	 *
	 * yAxis.high - The highest value on the y-axis
	 * yAxis.low - The lowest value on the y-axis
	 *
	 * @param  {CIQ.ChartEngine.Chart} chart The chart to create y-axis
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias renderYAxis
	 * @since  15-07-01
	 */
	CIQ.ChartEngine.prototype.renderYAxis=function(chart){
		if(this.runPrepend("renderYAxis", arguments)) return;
		var panel=chart.panel;
		var arr=panel.yaxisRHS.concat(panel.yaxisLHS);

		// Iterate through all the yaxis for the panel and set all the necessary calculations
		// For the primary yaxis (panel.yAxis) we will set the low and high values based on the range
		// of values in the chart itself
		var i;
		for(i=0;i<arr.length;i++){
			var yAxis=arr[i];
			var low=null, high=null;
			if(panel.yAxis===yAxis){
				low=chart.lowValue;
				high=chart.highValue;
			}
			this.calculateYAxisRange(panel, yAxis, low, high);
		}

		var parameters={};

		for(i=0;i<arr.length;i++){
			parameters.yAxis=arr[i];
			this.createYAxis(panel, parameters);
			this.drawYAxis(panel, parameters);
		}
		this.runAppend("renderYAxis", arguments);
	};
	/**
	 * <span class="injection">INJECTABLE</span>
	 * <span class="animation">Animation Loop</span>
	 *
	 * This method initializes display variables for the chart.
	 * It is part of the animation loop and called with every draw() operation.
	 * The high and low values for the displayed chart are calculated.
	 * Those values are subsequently used by {@link CIQ.ChartEngine.AdvancedInjectable#createYAxis} which is called from within this method.
	 * This method also calls {@link CIQ.ChartEngine#createCrosshairs}.
	 * stx.displayInitialized will be set to true after this method is called.
	 *
	 * chart.highValue - The highest value on the chart
	 * chart.lowValue - The lowest value on the chart
	 *
	 * @param  {CIQ.ChartEngine.Chart} chart The chart to initialize
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias initializeDisplay
	 */
	CIQ.ChartEngine.prototype.initializeDisplay=function(chart){
		if(this.runPrepend("initializeDisplay", arguments)) return;
		var fields=[];
		for(var field in chart.series){	// Find any series that share the Y axis
			if(chart.series[field].parameters.shareYAxis) fields.push(field);
		}
		var panel=chart.panel=this.panels[chart.name];

		var minMax;
		var length=null;

		// We often have an extra tick hanging off the edge of the screen. We don't want this
		// tick to affect the high and low calculation though. That causes jumpiness when
		// zooming because the chart is alternately including and excluding that tick
		var ticksOnScreen=Math.floor((chart.width-this.micropixels)/this.layout.candleWidth);
		if(chart.scroll>chart.maxTicks && chart.maxTicks>ticksOnScreen+1) length=chart.dataSegment.length-1;

		if(!CIQ.ChartEngine.chartShowsHighs(this.layout.chartType)){	// line charts shouldn't take into account high and low values, just close
			fields.push("Close", "iqPrevClose");
			minMax=this.determineMinMax(chart.dataSegment, fields,null,null,length);
			if(this.layout.chartType=="baseline_delta" /*|| this.layout.chartType=="baseline_delta_mountain"*/){
				var base=chart.baseline.actualLevel;
				if(chart.transformFunc) base=chart.transformFunc(this,chart,base);
				var diff=Math.max(base-minMax[0],minMax[1]-base);
				if(this.repositioningBaseline){
					minMax=[chart.lowValue,chart.highValue];
				}else{
					minMax[0]=base-diff;
					minMax[1]=base+diff;
				}
			}
		}else{
			fields.push("Close", "High", "Low", "iqPrevClose");
			minMax=this.determineMinMax(chart.dataSegment, fields,null,null,length);
		}
		chart.lowValue=minMax[0]; chart.highValue=minMax[1];

		this.runAppend("initializeDisplay", arguments);
	};

	// @deprecated Use pixelFromBar
	CIQ.ChartEngine.prototype.computePosition=function(x, offset){
		if(typeof offset == "undefined") offset=0;
		var position = x*this.layout.candleWidth + offset + this.micropixels;
		return position;
	};

	// @deprecated
	CIQ.ChartEngine.prototype.computeColor=function(open, close){
		if(open<close) return "stx_candle_up";
		if(open>close) return "stx_candle_down";
		return "stx_candle_shadow";
	};

	// @deprecated
	CIQ.ChartEngine.prototype.computeLength=function(high, low){
		var h=this.pixelFromPrice(high);
		var l=this.pixelFromPrice(low);
		return l-h;

	};

	/**
	 * Adds a series renderer to the chart, or updates it.	A series renderer manages a group of series which are rendered on the chart
	 * in the same manner. For instance, several series which are part of the same stacked histogram.
	 *
	 * You must manage the persistency of a renderer, and remove individual series ({@link CIQ.Renderer#removeSeries} ) , remove all series ({@link CIQ.Renderer#removeAllSeries}) or even delete the renderer ({@link CIQ.ChartEngine#removeSeriesRenderer}) as needed by your application
	 *
	 * Note: once a renderer is set for a chart it will remain loaded with all its series definitions and y axis (if one used) even if a new symbol is loaded.
	 * Calling setSeriesRenderer again with the same renderer name, it will cause the renderer to be updated with the params of the renderer sent in.
	 * **Be careful not to send a different yAxis object unless you have deleted the previous one by completely removing all of its associated series** (see {@link CIQ.Renderer#removeAllSeries}).
	 * Failure to do this will cause multiple axis to be displayed, the original one becoming orphan.
	 *
	 * See {@link CIQ.Renderer}
	 *
	 * See {@link CIQ.ChartEngine#removeSeriesRenderer} for release functionality.
	 *
	 * See {@link CIQ.ChartEngine#addSeries} for additional implementation examples.
	 *
	 * @param {CIQ.Renderer} renderer The renderer
	 * @return {object} This seriesRenderer
	 * @memberOf CIQ.ChartEngine
	 * @since 07/01/2015
	 * @example
	 *	// group the series together and select "line" as the rendering type to display the series.
	 *	var mdataRenderer=stxx.setSeriesRenderer(new CIQ.Renderer.Lines({params:{name:"My Line Series", type:"line", width:4, callback:mdataLegend}}))
	 *			.removeAllSeries()
	 *			.attachSeries(symbol1,{color:"red",permanent:true})
	 *			.attachSeries(symbol2,"blue")
	 *			.attachSeries(symbol3,"yellow")
	 *			.ready()
	 */
	CIQ.ChartEngine.prototype.setSeriesRenderer=function(renderer){
		var params=renderer.params;
		if(this.chart.seriesRenderers[renderer.params.name]) return this.chart.seriesRenderers[renderer.params.name]; // renderer already created

		if(params.yAxis){
			this.addYAxis(this.panels[params.panel], params.yAxis);
		}
		renderer.stx=this;

		this.chart.seriesRenderers[renderer.params.name]=renderer;
		return renderer;
	};

	/**
	 * Sets the market definition on the chart.
	 * Once set, the definition will not change until it is explicitly set to something else by calling this method again.
	 * If a dynamic model is desired, where a new definition is loaded as different instruments are activated, see {@link CIQ.ChartEngine#setMarketFactory}.
	 * See {@link CIQ.Market} for market definition rules and examples.
	 * This is only required if your chart will need to know the operating hours for the different exchanges.
	 * If using a 24x7 chart, a market does not need to be set.
	 * @param {Object} marketDefinition. A market definition as required by {@link CIQ.Market}
	 * @memberOf CIQ.ChartEngine
	 * @since 04-2016-08
	 * @example
	 * stxx.setMarket(marketDefinition);
	 */
	CIQ.ChartEngine.prototype.setMarket=function(marketDefinition, chart) {
		if(!chart) chart=this.chart;
		chart.market = new CIQ.Market(marketDefinition);
		for(var session in this.layout.marketSessions){
			chart.market.disableSession(session,this.layout.marketSessions[session]);
		}
	};

	/**
	 * Links the chart to a method that given a symbol object of form accepted by {@link CIQ.ChartEngine#newChart}, can return a complete market definition object.
	 * Once linked, the market factory it will be used by the chart to ensure the market always matches the active instrument.
	 * This is only required if your chart will need to know the operating hours for the different exchanges.
	 * If using a 24x7 chart, a market factory does not need to be set.
	 * @param {Function} factory A function that takes a symbolObject and returns a market definition. See {@link CIQ.Market} for instruction on how to create a market definition. See {@link CIQ.Market.Symbology.factory} for working example of a factory function.
	 * @memberOf CIQ.ChartEngine
	 * @since 04-2016-08
	 * @example
	 * // example of a market factory that returns a different market definition based on the symbol passed in
	 * sampleFactory=function(symbolObject){
	 *		var symbol=symbolObject.symbol;
	 *		// isTypeX(symbol) is a function you would create to identify the market definition object that should be used.
	 *		if( isType1(symbol) ) return type1DefinitionObject;
	 *		if( isType2(symbol) ) return type2DefinitionObject;
	 *		if( isType3(symbol) ) return type3DefinitionObject;
	 *		return defaultDefinitionObject;
	 * };
	 *
	 * @example
	 * // link a market factory to the chart.
	 * stxx.setMarketFactory(sampleFactory);
	 */
	CIQ.ChartEngine.prototype.setMarketFactory=function(factory){
		this.marketFactory=factory;
	};

	/**
	 * Detaches a series renderer from the chart and deletes its associated y-axis if no longer used by any other renderer.
	 *
	 * Note: the actual series and related data are not deleted with this command and can be attached or continue to be used with other renderers.
	 *
	 * Note: the actual renderer (created by using new `CIQ.Renderer.xxxxx`) is not deleted but simply detached from the chart. You can re-attach it again if needed.
	 * To delete the renderer use `delete myRenderer`. See example in {@link CIQ.Renderer.Lines}
	 *
	 * @param  {object} renderer The actual renderer instance to be removed
	 * @memberOf CIQ.ChartEngine
	 * @since 07/01/2015
	 */
	CIQ.ChartEngine.prototype.removeSeriesRenderer=function(renderer){
		for(var r in this.chart.seriesRenderers){
			if(renderer.params.name===this.chart.seriesRenderers[r].params.name){
				var toDelete=this.chart.seriesRenderers[renderer.params.name];
				var yAxis=toDelete.params.yAxis;
				var panel=this.panels[toDelete.params.panel];
				delete this.chart.seriesRenderers[renderer.params.name];
				this.deleteYAxisIfUnused(panel, yAxis);
				return;
			}
		}
	};

	/**
	 * Retrieves a series renderer from the chart
	 * @param  {string} name Handle to access the renderer (params.name)
	 * return {object} the matching series renderer if found
	 * @memberOf CIQ.ChartEngine
	 * @since 07/01/2015
	 */
	CIQ.ChartEngine.prototype.getSeriesRenderer=function(name){
		return this.chart.seriesRenderers[name];
	};





	/**
	 * Initializes boundary clipping on the requested panel. Use this when you are drawing on the canvas and wish for the
	 * drawing to be contained within the panel. You must call {@link CIQ.ChartEngine#endClip} when your drawing functions are complete.
	 * @param  {string} [panelName] The name of the panel. Defaults to the chart itself.
	 * @param {Boolean} [allowYAxis=false] If true then the clipping region will include the y-axis. By default the clipping region ends at the y-axis.
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.startClip=function(panelName, allowYAxis){
		if(!panelName) panelName="chart";
		var panel=this.panels[panelName];
		var yAxis=panel.yAxis;
		this.chart.context.save();
		this.chart.context.beginPath();
		var left=panel.left;
		var width=panel.width;
		if(allowYAxis){
			left=0;
			width=this.width;
		}
		this.chart.context.rect(left, panel.top, width, yAxis.height);
		this.chart.context.clip();
	};

	/**
	 * Completes a bounded clipping operation. See {@link CIQ.ChartEngine#startClip}.
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.endClip=function(){
		this.chart.context.restore();
	};


	/**
	 * Draws a line chart. Calls {@link CIQ.ChartEngine.plotLineChart} after setting styles.
	 *
	 * Uses CSS style stx_line_chart to control width and color of line charts
	 *	- width				- Optional line width
	 *
	 * The default color function for the colored line chart uses the following CSS styles:
	 *	- stx_line_up		- Color of the uptick portion if the line
	 *	- stx_line_down		- Color of the downtick portion if the line
	 * 
	 * @param  {CIQ.ChartEngine.Panel} panel The panel on which to draw the line chart
	 * @param  {string} style	The style selector which contains the styling for the bar (width and color)
	 * @param  {function} [colorFunction]	(optional) A function which accepts an CIQ.ChartEngine and quote as its arguments and returns the appropriate color for drawing that mode.
											Returning a null will skip that bar.  If not passed as an argument, will use a default color.
	 * @return {object} Colors used in the plot (as the keys of the object)
	 * @memberOf CIQ.ChartEngine
	 * @since  15-07-01 Changed signature from `chart` to `panel`
	 */
	CIQ.ChartEngine.prototype.drawLineChart=function(panel, style, colorFunction){
		var context=this.chart.context;
		var c=this.canvasStyle(style);
		if(c.width && parseInt(c.width,10)<=25){
			context.lineWidth=Math.max(1,CIQ.stripPX(c.width));
		}else{
			context.lineWidth=1;
		}
		this.canvasColor(style);
		var params={skipProjections:true};
		if(panel.chart.tension) params.tension=panel.chart.tension;
		if(panel.chart.lastTickOffset) params.lastTickOffset=panel.chart.lastTickOffset;
		var rc=this.plotLineChart(panel, panel.chart.dataSegment, "Close", params, colorFunction);
		context.lineWidth=1;

		return rc;
	};


	/**
	 * Redraws the floating price label(s) for the crosshairs tool on the y axis using {@link CIQ.ChartEngine#createYAxisLabel} and sets the width of the y crosshair line to match pannel width.
	 *
	 * Label style: `stx-float-price` ( for price colors ) and `stx_crosshair_y` ( for cross hair line )
	 *
	 * @param  {CIQ.ChartEngine.Panel} panel	The panel on which to print the label(s)
	 * @memberOf CIQ.ChartEngine
	 * @example
	 * // controls Light color scheme
	 * .Light .stx-float-price { color:#fff; background-color: yellow;}
	 */

	CIQ.ChartEngine.prototype.updateFloatHRLabel = function (panel) {
		var arr=panel.yaxisLHS.concat(panel.yaxisRHS);
		var cy = this.crossYActualPos ? this.crossYActualPos : this.cy;
		if(this.floatCanvas.isDirty) CIQ.clearCanvas(this.floatCanvas, this);
		if(this.controls.crossX.style.display=="none") return;
		if(this.controls.crossY){
			var crosshairWidth=panel.width;
			if(this.yaxisLabelStyle=="roundRectArrow") crosshairWidth-=7;
			this.controls.crossY.style.left=panel.left + "px";
			this.controls.crossY.style.width=crosshairWidth + "px";
		}
		for(var i=0;i<arr.length;i++){
			var yAxis=arr[i];
			var price=this.valueFromPixel(cy, panel, yAxis);
			if(isNaN(price)) continue;
			if((panel.min || panel.min===0) && price<panel.min) continue;
			if((panel.max || panel.max===0) && price>panel.max) continue;
			var labelDecimalPlaces=null;
			if(yAxis!==panel.chart.yAxis){ // If a study panel, this logic allows the cursor to print more decimal places than the yaxis default for panels
				labelDecimalPlaces=0;
				if(yAxis.shadow<1000) labelDecimalPlaces=2;
				if(yAxis.shadow<5) labelDecimalPlaces=4;
				if(yAxis.decimalPlaces || yAxis.decimalPlaces===0) labelDecimalPlaces=yAxis.decimalPlaces;
			}
			if(yAxis.priceFormatter){
				price=yAxis.priceFormatter(this, panel, price, yAxis);
			}else{
				price=this.formatYAxisPrice(price, panel, labelDecimalPlaces, yAxis);
			}

			var style=this.canvasStyle("stx-float-price");
			this.createYAxisLabel(panel, price, cy, style.backgroundColor, style.color, this.floatCanvas.context, yAxis);
			this.floatCanvas.isDirty=true;
		}
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * This method calls {@link CIQ.ChartEngine#updateFloatHRLabel} to draw the label that floats along the Y axis with the
	 * current price for the crosshair.
	 * It also fills the date in the "stxx.controls.floatDate" (Style: `stx-float-date`) div which floats along the X axis.
	 * This is an appropriate place to inject an append method for drawing a head's up display if desired.
	 *
	 * You can override the {@link CIQ.ChartEngine#hideDates} method to decide if/when you want to hide the floating date.
	 *
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias headsUpHR
	 * @since TBD only year and month will be displayed in monthly periodicity
	 */
	CIQ.ChartEngine.prototype.headsUpHR=function(){
		if(this.runPrepend("headsUpHR", arguments)) return;
		var panel=this.currentPanel;
		if(!panel) return;
		var chart=panel.chart;

		this.updateFloatHRLabel(panel);

		if(this.controls.floatDate && !CIQ.ChartEngine.hideDates()){
			var bar=this.barFromPixel(this.cx);
			var prices=chart.xaxis[bar];
			if(prices && prices.DT){
				if(chart.xAxis.formatter){
					this.controls.floatDate.innerHTML=chart.xAxis.formatter(prices.DT);
				}else if(this.internationalizer){
					var str=this.internationalizer.monthDay.format(prices.DT);
					if(/*prices.DT.getHours()!==0 || prices.DT.getMinutes()!==0 || */!CIQ.ChartEngine.isDailyInterval(this.layout.interval))
						str+=" " + this.internationalizer.hourMinute.format(prices.DT);
					else {
						if( this.layout.interval == "month" ) str=this.internationalizer.yearMonth.format(prices.DT);
						else str=this.internationalizer.yearMonthDay.format(prices.DT);
					}
					this.controls.floatDate.innerHTML=str;
				}else{
					var m=prices.DT.getMonth()+1;
					if(m<10) m="0" + m;
					var d=prices.DT.getDate();
					if(d<10) d="0" + d;
					var h=prices.DT.getHours();
					if(h<10) h="0" + h;
					var mn=prices.DT.getMinutes();
					if(mn<10) mn="0" + mn;
					if(/*(h=="00" && mn=="00") || */CIQ.ChartEngine.isDailyInterval(this.layout.interval)) {
						if( this.layout.interval == "month" ) this.controls.floatDate.innerHTML=m + "-" + prices.DT.getFullYear();
						else this.controls.floatDate.innerHTML=m + "-" + d + "-" + prices.DT.getFullYear();
					} else {
						this.controls.floatDate.innerHTML=m + "-" + d + " " + h + ":" + mn;
						var isSecond=(chart.xAxis.activeTimeUnit && chart.xAxis.activeTimeUnit <=CIQ.SECOND) || this.layout.timeUnit=="second";
						var isMS=(chart.xAxis.activeTimeUnit && chart.xAxis.activeTimeUnit <=CIQ.MILLISECOND) || this.layout.timeUnit=="millisecond";
						if (isSecond || isMS){
							var sec=prices.DT.getSeconds();
							if(sec<10) sec="0" + sec;
							this.controls.floatDate.innerHTML+= (":" + sec);

							if (isMS){
								var mil=prices.DT.getMilliseconds();
								if(mil<10) mil="0" + mil;
								if(mil<100) mil="0" + mil;
								this.controls.floatDate.innerHTML+= (":" + mil);
							}
						}
					}
				}
			}else if(prices && prices.index){
				this.controls.floatDate.innerHTML=prices.index;
			} else {
				this.controls.floatDate.innerHTML="";		// there is no date to display
			}
		}

		this.runAppend("headsUpHR", arguments);
	};

	// TODO, deprecated
	CIQ.ChartEngine.prototype.setCrosshairColors=function(){
		return;
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Calculates the magnet point for the current mouse cursor location. This is the nearest OHLC point. A small white
	 * circle is drawn on the temporary canvas to indicate this location for the end user. If the user initiates a drawing then
	 * the end point of the drawing will be tied to the magnet point. This function is only entered if preferences.magnet is true and
	 * a drawing type (CIQ.ChartEngine#currentVectorParameters.vectorType) has been enabled.
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias magnetize
	 */
	CIQ.ChartEngine.prototype.magnetize=function(){
		this.magnetizedPrice=null;
		if(this.runPrepend("magnetize", arguments)) return;
		var drawingTool=this.currentVectorParameters.vectorType;
		if((drawingTool=="annotation" || drawingTool=="callout") && CIQ.ChartEngine.drawingLine) return;	// Don't magnetize the end of an annotation
		if(drawingTool=="projection") return;
		if(drawingTool=="freeform") return;
		var panel=this.currentPanel;
		if(panel.name==panel.chart.name){	// panel is chart type
			var chart=panel.chart;
			var tick=this.tickFromPixel(CIQ.ChartEngine.crosshairX-this.left, chart);
			//if(this.layout.interval!="minute") tick/=this.layout.periodicity;
			if(tick>chart.dataSet.length) return;	// Don't magnetize in the future
			var prices=chart.dataSet[tick];
			if(!prices) return;
			var price=this.valueFromPixel(this.cy, panel);
			this.magnetizedPrice=prices.Close;
			var chartType=this.layout.chartType;
			if(chartType=="bar" || chartType=="candle" || chartType=="colored_bar" || chartType=="hollow_candle" || chartType=="volume_candle"){
				var fields=["Open","High","Low","Close"];
				var closest=1000000000;
				for(var i=0;i<fields.length;i++){
					var fp=prices[fields[i]];
					if(Math.abs(price-fp)<closest){
						closest=Math.abs(price-fp);
						this.magnetizedPrice=fp;
					}
				}
			}
			var x=this.pixelFromTick(tick, chart);
			var y=this.pixelFromPrice(this.magnetizedPrice, this.currentPanel);
			var ctx=this.chart.tempCanvas.context;
			ctx.beginPath();
			ctx.lineWidth=1;
			var radius=Math.max(this.layout.candleWidth, 8)/2;
			ctx.arc(x, y, radius, 0, 2*Math.PI, false);
			ctx.fillStyle="#FFFFFF";
			ctx.strokeStyle="#000000";
			ctx.fill();
			ctx.stroke();
			ctx.closePath();
		}
		this.runAppend("magnetize", arguments);
	};

	/**
	 * Positions the crosshairs at the last known mouse/finger pointer position. This ensures
	 * on touch devices that the crosshairs are at a known position. It is called by the DrawingToolbar.
	 */
	CIQ.ChartEngine.prototype.positionCrosshairsAtPointer=function(){
		if(!this.currentPanel) return;
		var chart=this.currentPanel.chart;
		var rect=this.container.getBoundingClientRect();
		this.top=rect.top;
		this.left=rect.left;
		this.right=this.left+this.width;
		this.bottom=this.top+this.height;
		this.cy=this.crossYActualPos=this.backOutY(CIQ.ChartEngine.crosshairY);
		this.cx=this.backOutX(CIQ.ChartEngine.crosshairX);
		this.crosshairTick=this.tickFromPixel(this.cx, chart);
		this.controls.crossX.style.left=(this.pixelFromTick(this.crosshairTick, chart)-0.5) + "px";
		this.controls.crossY.style.top=this.crossYActualPos + "px";
	};
	/**
	 * <span class="injection">INJECTABLE</span>
	 * This method is called to display crosshairs *if* the user has crosshairs enabled or is in the process of drawing (a non dragToDraw) drawing tool.
	 * This is the counter method to {@link CIQ.ChartEngine.undisplayCrosshairs} which is called, for instance, when the user mouses out of the chart or mouses
	 * over a chart element.
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias doDisplayCrosshairs
	 */
	CIQ.ChartEngine.prototype.doDisplayCrosshairs=function(){
		if(this.runPrepend("doDisplayCrosshairs", arguments)) return;
		if(this.displayInitialized){
			var drawingTool=this.currentVectorParameters.vectorType;
			if(!this.layout.crosshair && (drawingTool==="" || !drawingTool)){
				this.undisplayCrosshairs();
			}else if(CIQ.Drawing && CIQ.Drawing[drawingTool] && (new CIQ.Drawing[drawingTool]()).dragToDraw){
				this.undisplayCrosshairs();
			}else{
				var controls=this.controls, crossX=controls.crossX, crossY=controls.crossY;
				if(crossX.style.display!==""){
					crossX.style.display="";
					crossY.style.display="";
					if(this.preferences.magnet && drawingTool){
						CIQ.unappendClassName(this.container, "stx-crosshair-on");
					}else{
						CIQ.appendClassName(this.container, "stx-crosshair-on");
					}
				}
				if(controls.floatDate && !CIQ.ChartEngine.hideDates()){
					controls.floatDate.style.visibility="";
					if(this.currentPanel) this.updateFloatHRLabel(this.currentPanel);
				}
			}
		}
		this.runAppend("doDisplayCrosshairs", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 *
	 * Hides the crosshairs. This is called for instance when the user mouses out of the chart or over a chart control. The crosshairs
	 * are turned back on by a call to {@link CIQ.ChartEngine.doDisplayCrosshairs}
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias undisplayCrosshairs
	 */
	CIQ.ChartEngine.prototype.undisplayCrosshairs=function(){
		if(this.runPrepend("undisplayCrosshairs", arguments)) return;
		var controls=this.controls, crossX=controls.crossX, crossY=controls.crossY;
		if(crossX){
			if(crossX.style.display!="none"){
				crossX.style.display="none";
				crossY.style.display="none";
			}
		}
		if(this.displayInitialized && controls.floatDate){
			controls.floatDate.style.visibility="hidden";
		}
		CIQ.unappendClassName(this.container, "stx-crosshair-on");
		var floatCanvas=this.floatCanvas;
		if(floatCanvas && floatCanvas.isDirty) CIQ.clearCanvas(floatCanvas, this);
		this.runAppend("undisplayCrosshairs", arguments);
	};

	/**
	 * Sets the chart into a modal mode. Crosshairs are hidden and the chart will not respond to click or mouse events. Call this
	 * for instance if you are enabling a dialog box and don't want errant mouse activity to affect the chart.
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.modalBegin=function(){
		this.openDialog="modal";
		this.undisplayCrosshairs();
	};

	/**
	 * Ends modal mode. See {@link CIQ.ChartEngine#modalBegin}
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.modalEnd=function(){
		this.cancelTouchSingleClick=true;
		this.openDialog="";
		this.doDisplayCrosshairs();
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Updates the position of the stxx.controls.floatDate element ( Style: `stx-float-date` ) and calls {@link CIQ.ChartEngine.AdvancedInjectable#headsUpHR} to display the crosshairs labels on both x and y axis.
	 * A timer is used to prevent this operation from being called more frequently than once every 100 milliseconds in order to
	 * improve performance during scrolling.
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias updateChartAccessories
	 */
	CIQ.ChartEngine.prototype.updateChartAccessories=function(){
		if(this.accessoryTimer!==null) clearTimeout(this.accessoryTimer);
		if(!CIQ.ChartEngine.drawingLine && CIQ.touchDevice){
			if(new Date().getTime()-this.lastAccessoryUpdate<100){
				this.accessoryTimer=setTimeout((function(stx){ return function(){stx.updateChartAccessories();};})(this),10);
				return;
			}
		}
		if(!this.chart.dataSet) return;
		if(this.runPrepend("updateChartAccessories", arguments)) return;
		this.positionCrosshairsAtPointer();
		this.accessoryTimer=null;
		this.lastAccessoryUpdate=new Date().getTime();
		var floatDate=this.controls.floatDate;
		if(floatDate){
			var panel=this.currentPanel;
			if(!panel) panel=this.chart.panel;
			if(panel){
				var chart=panel.chart;
				var bottom = this.xAxisAsFooter === true ? 0 : this.chart.canvasHeight - panel.chart.bottom;
				var l=(this.pixelFromTick(this.crosshairTick, chart)-(floatDate.offsetWidth/2)-0.5);
				if(l<0) l=0;
				floatDate.style.left=l+"px";
				floatDate.style.bottom=bottom + "px";
			}
		}
		this.headsUpHR();
		this.runAppend("updateChartAccessories", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Handles mouse movement events. This method calls {@link CIQ.ChartEngine#mousemoveinner} which has the core logic
	 * for dealing with panning and zooming. See also {@link CIQ.ChartEngine#touchmove} which is the equivalent method for touch events.
	 * @param  {Event} e A mouse move event
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias mousemove
	 */
	CIQ.ChartEngine.prototype.mousemove=function(e$){
		var e=e$?e$:event;
		/* use e.client insead of e.page since we need the value to be relative to the viewport instead of the overall document size.
		if(!e.pageX){
			e.pageX=e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			e.pageY=e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}
		*/
		CIQ.ChartEngine.crosshairX=e.clientX;	// These are used by the UI so make sure they are set even if no chart is set
		CIQ.ChartEngine.crosshairY=e.clientY;
		if(this.runPrepend("mousemove", arguments)) return;
		if(!this.displayInitialized) return;	// No chart displayed yet
		if(this.openDialog!=="") return;	// Don't show crosshairs when dialog is open
		this.mousemoveinner(e.clientX, e.clientY);
		this.runAppend("mousemove", arguments);
	};

	/**
	 * Set a timer to check for chart resizing. Normally the chart is resized whenever the screen is resized
	 * by capturing a screen resize event. However if charts are embedded in a windowing GUI then they may not
	 * receive such events when windows are resized. Ideally, stxx.resizeChart() should be called whenever a window
	 * is resized however if this is inconvenient then the resize timer can be enabled to cover all bases without too much effort.
	 *
	 * On initialization, CIQ.ChartEngine.resizeDetectMS is checked for the default resize checking interval. The default is 1,000 milliseconds.
	 * To turn off resize checking simply set CIQ.ChartEngine.resizeDetectMS=0; when you declare your CIQ.ChartEngine object.
	 * @param {number} ms Number of milliseconds to poll. Zero to stop checking.
	 * @memberOf CIQ.ChartEngine
	 */

	CIQ.ChartEngine.prototype.setResizeTimer=function(ms){
		this.resizeDetectMS=ms;
		function closure(self){
			return function(){
				if(!self.chart.canvas) return;
				if(!CIQ.isAndroid){
					if(self.chart.canvas.height!=Math.floor(self.devicePixelRatio*self.chart.container.clientHeight) || self.chart.canvas.width!=Math.floor(self.devicePixelRatio*self.chart.container.clientWidth)){
						self.resizeChart();
						return;
					}
				}
			};
		}
		if(ms){
			if(this.resizeTimeout) window.clearInterval(this.resizeTimeout);
			this.resizeTimeout=window.setInterval(closure(this), ms);
		}else{
			if(this.resizeTimeout) window.clearInterval(this.resizeTimeout);
			this.resizeTimeout=null;
		}
	};

	/**
	 * Returns the yaxis that the crosshairs (mouse) is on top of
	 * @param  {CIQ.ChartEngine.Panel} panel The panel
	 * @param  {Number} [x]		The X location. Defaults to CIQ.ChartEngine#cx
	 * @return {CIQ.ChartEngine.YAxis}		  The yAxis that the crosshair is over
	 * @since  15-07-01
	 */
	CIQ.ChartEngine.prototype.whichYAxis=function(panel, x){
		if(typeof x === "undefined") x=this.cx;
		if(panel){
			var arr=panel.yaxisLHS.concat(panel.yaxisRHS);
			for(var i=0;i<arr.length;i++){
				var yAxis=arr[i];
				if(yAxis.left<=x && yAxis.left+yAxis.width>=x) return yAxis;
			}
		}
		return this.chart.panel.yAxis;
	};

	/**
	 * Finds any objects that should be highlighted by the current crosshair position. All drawing objects have their highlight() method
	 * called in order that they may draw themselves appropriately.
	 * @param  {Boolean} isTap If true then it indicates that the user tapped the screen on a touch device, and thus a wider radius is used to determine which objects might have been highlighted.
	 * @param {Boolean} clearOnly Set to true to clear highlights
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.findHighlights=function(isTap, clearOnly){
		var radius=10;
		if(isTap) radius=30;
		var cy=this.cy;
		var cx=this.cx;
		if(!this.currentPanel) return;
		if(this.activeDrawing) return;
		var chart=this.currentPanel.chart;
		this.anyHighlighted=false;
		if(this.preferences.magnet && !this.activeDrawing){
			CIQ.clearCanvas(this.chart.tempCanvas, this);
		}
		var somethingChanged=false;
		var drawingToMeasure=null;
		var stickyArgs=["","",true,null,"drawing"];

		var box={
				x0:this.tickFromPixel(cx - radius, chart),
				x1:this.tickFromPixel(cx + radius, chart),
				y0:this.valueFromPixelUntransform(cy - radius, this.currentPanel),
				y1:this.valueFromPixelUntransform(cy + radius, this.currentPanel)
		};
		for(var i=0;i<this.drawingObjects.length;i++){
			var drawing=this.drawingObjects[i];
			if(drawing.permanent) continue;

			var prevHighlight=drawing.highlighted;
			var highlightMe=(drawing.panelName==this.currentPanel.name);
			drawing.repositioner=drawing.intersected(this.crosshairTick, this.crosshairValue, box);
			highlightMe=highlightMe && drawing.repositioner;

			if(!clearOnly && highlightMe){
				if(prevHighlight){
					drawingToMeasure=drawing;
				}else if(prevHighlight!=drawing.highlight(true)){
					if(!drawingToMeasure) drawingToMeasure=drawing;
					somethingChanged=true;
				}
				this.anyHighlighted=true;
			}else{
				if(prevHighlight!=drawing.highlight(false)){
					somethingChanged=true;
				}
			}
		}

		var first=false;
		var n,o,series;
		for(n in this.overlays){
			o=this.overlays[n];
			o.prev=o.highlight;
			o.highlight=false;
		}
		for(n in chart.seriesRenderers){
			var r=chart.seriesRenderers[n];
			for(var j=0;j<r.seriesParams.length;j++){
				series=r.seriesParams[j];
				series.prev=series.highlight;
				series.highlight=false;
			}
		}

		if(!clearOnly){
			var bar=this.barFromPixel(cx);
			if(bar<chart.dataSegment.length){
				var y;
				for(n in this.overlays){
					o=this.overlays[n];
					if(o.panel!=this.currentPanel.name) continue;

					//custom highlight detection
					if(o.libraryEntry.isHighlighted && o.libraryEntry.isHighlighted(this,cx,cy)){
						o.highlight=true;
						this.anyHighlighted=true;
						continue;
					}

					var quote=chart.dataSegment[bar];
					if(!quote) continue;

					for(var out in this.overlays[n].outputMap){
						var val=quote[out];
						y=0;
						if(this.currentPanel.name==chart.name){	// chart type panel
							y=this.pixelFromPriceTransform(val, this.currentPanel);
						}else{
							y=this.pixelFromPrice(val, this.currentPanel);
						}
						if(cy-radius<y && cy+radius>y){
							o.highlight=true;
							this.anyHighlighted=true;
							break;
						}
					}
					if(o.highlight) break; // only allow one overlay to be highlighted at a time
				}
				for(n in chart.seriesRenderers){
					var renderer=chart.seriesRenderers[n];
					if(!renderer.params.highlightable) continue;
					for(var m=0;m<renderer.seriesParams.length;m++){
						series=renderer.seriesParams[m];
						y=renderer.caches[series.field] && renderer.caches[series.field][bar];
						if(!y && y!==0) continue;
						if(cy-radius<y && cy+radius>y){
							series.highlight=true;
							this.anyHighlighted=true;
						}else if((renderer.params.subtype=="step" || series.type=="step") && bar>0){
							// In a step series we also need to check for intersection with
							// the vertical bar (the step) that connects two points
							var py=renderer.caches[series.field] && renderer.caches[series.field][bar-1];
							if((py || py===0) && (cy>y && cy<py) || (cy<y && cy>py)){
								series.highlight=true;
								this.anyHighlighted=true;
							}
						}
					}
				}
			}
		}
		for(n in this.overlays){
			o=this.overlays[n];
			if(o.highlight) {
				this.anyHighlighted=true;
				stickyArgs=[o.inputs.display?o.inputs.display:o.name, null, null, o.permanent, "study"];
				drawingToMeasure=null;
			}
			if(o.prev!=o.highlight) somethingChanged=true;
		}
		for(n in chart.seriesRenderers){
			var r2=chart.seriesRenderers[n];
			if(!r2.params.highlightable) continue;
			for(var m2=0;m2<r2.seriesParams.length;m2++){
				series=r2.seriesParams[m2];
				if(series.highlight) {
					this.anyHighlighted=true;
					stickyArgs=[series.display, series.color, false, series.permanent, "series"];
					drawingToMeasure=null;
				}
				if(series.prev!=series.highlight) somethingChanged=true;
			}
		}

		if(somethingChanged){
			this.draw();
			this.displaySticky.apply(this,stickyArgs);
			this.clearMeasure();
			if(drawingToMeasure) drawingToMeasure.measure();
		}

		if(!this.anyHighlighted){
			this.setMeasure();
		}
	};

	/**
	 * Positions a "sticky" (a tooltip element). It is positioned relative to the cursor but so that it is always available and never
	 * accidentally tappable on a touch device.
	 * @param  {HTMLElement} m The sticky
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.positionSticky=function(m){
		var top=Math.max(this.cy-m.offsetHeight-60,0);
		var right=Math.min(this.chart.canvasWidth-(this.cx-50),this.chart.canvasWidth-m.offsetWidth);
		m.style.top=top+"px";
		m.style.right=right+"px";
	};

	/**
	 * Displays the "sticky" (tooltip element). The sticky should be in `CIQ.ChartEngine.controls.mSticky`. To disable stickies, set that element to null. See {@link CIQ.ChartEngine.htmlControls}
	 * @param  {string} message			The message to display in the sticky
	 * @param  {string} backgroundColor The background color to set the sticky (the foreground color will be picked automatically)
	 * @param  {boolean} forceShow If true, will always show the sticky (as opposed to only on hover)
	 * @param  {boolean} noDelete If true, will hide the delete instructions/button
	 * @param  {string} type		 "study","drawing","series", or whatever is causing the sticky to be displayed.
	 * @memberOf CIQ.ChartEngine
	 */

	CIQ.ChartEngine.prototype.displaySticky=function(message, backgroundColor, forceShow, noDelete, type){
		var m=this.controls.mSticky;
		if(!m) return;
		var mi=$$$("#mStickyInterior", m);
		if(!mi) return;
		var overlayTrashCan=$$$("#overlayTrashCan", m);
		var overlayEdit=$$$(".overlayEdit", m);
		var mouseDeleteInstructions=$$$("#mouseDeleteInstructions", m);
		if(!forceShow && !message){
			mi.innerHTML="";
			m.style.display="none";
			if(CIQ.touchDevice){
				if(overlayTrashCan) overlayTrashCan.style.display="none";
				if(overlayEdit) overlayEdit.style.display="none";
			}else if(!CIQ.touchDevice){
				if(mouseDeleteInstructions) mouseDeleteInstructions.style.display="none";
			}
		}else{
			if(!message) message="";
			if(forceShow && !message){
				mi.style.backgroundColor="";
				mi.style.color="";
				mi.style.display="none";
			}else if(backgroundColor){
				mi.style.backgroundColor=backgroundColor;
				mi.style.color=CIQ.chooseForegroundColor(backgroundColor);
				mi.style.display="inline-block";
			}else{
				mi.style.backgroundColor="";
				mi.style.color="";
				mi.style.display="inline-block";
			}
			mi.innerHTML=message;
			if(type) $$$("#mStickyRightClick", m).className="rightclick_"+type;
			m.style.display="inline-block";
			this.positionSticky(m);
			if(noDelete){
				if(overlayTrashCan) overlayTrashCan.style.display="none";
				if(overlayEdit) overlayEdit.style.display="none";
				if(mouseDeleteInstructions) mouseDeleteInstructions.style.display="none";
			}else if(CIQ.touchDevice){
				if(overlayTrashCan) overlayTrashCan.style.display="inline-block";
				if(overlayEdit) overlayEdit.style.display="inline-block";
				if(mouseDeleteInstructions) mouseDeleteInstructions.style.display="none";
			}else if(!CIQ.touchDevice){
				if(mouseDeleteInstructions) mouseDeleteInstructions.style.display="block";
			}
		}
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Sets the innerHTML value of the `mMeasure` HTML DOM Node to contain a measurement (price differential and bars/line distance), usually when a user hovers over a drawing.
	 * It is also used to display measurement as a drawing is being created or when using the 'Measure' tool.
	 *
	 * Example: <B>23.83 (-12%) 11 Bars</B>
	 *
	 * It requires the UI to include the following div: ```<div class="currentMeasure"><span id="mMeasure" class="measureUnlit"></span></div>```
	 *
	 * It can be styled via CSS. See example.
	 *
	 * @param {number} price1 Beginning price of the drawing
	 * @param {number} price2 Ending price of the drawing
	 * @param {number} tick1  Beginning tick of the drawing
	 * @param {number} tick2  Ending tick of the drawing
	 * @param {boolean} hover  True to turn on the measurement, false to turn it off
	 * @memberOf CIQ.ChartEngine
	 * @example
	 * // Measuring tool styling CSS sample
		.currentMeasure {
			text-align: left;
			display: inline-block;
			margin: 4px 0 0 20px;
			height: 20px;
			line-height: 20px;
		}

		#mMeasure {
			display: inline-block;
			margin: 0 0 0 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			width:140px;
		}

		// if you suppot light color scheme
		.Light .measureUnlit {color:#666;}
		.Light .measureLit {color:#000;}

		// if you support dark color scheme
		.Dark .measureUnlit {color:#cbcccd;}
		.Dark .measureLit {color:#fff;}
		@example
		// This is an example of the framework to use for writing a prepend to further manipulate/display the measurements
		CIQ.ChartEngine.prototype.prepend("setMeasure",function(){

		 // add your logic to manage the display of the measurements (price1, price2, tick1, tick2)

		 //return true; //if you don't want to continue into the regular function
		 //return false; //if you want to run trough the standard function once you are done with your custom code.
		});
	 */
	CIQ.ChartEngine.prototype.setMeasure=function(price1, price2, tick1, tick2, hover){
		if(this.runPrepend("setMeasure", arguments)) return;
		var m=$$("mMeasure");
		var message="";
		if(!price1){
			if(m && m.className!="measureUnlit") m.className="measureUnlit";
			if(!this.anyHighlighted && this.currentVectorParameters.vectorType==="") this.clearMeasure();
		}else{
			var distance=Math.round(Math.abs(price1-price2)*this.chart.roundit)/this.chart.roundit;
			if(this.internationalizer){
				message+=this.internationalizer.numbers.format(distance);
			}else{
				message+=distance;
			}
			var pct=(price2-price1)/price1;
			if(Math.abs(pct)>0.1){
				pct=Math.round(pct*100);
			}else if(Math.abs(pct)>0.01){
				pct=Math.round(pct*1000)/10;
			}else{
				pct=Math.round(pct*10000)/100;
			}
			if(this.internationalizer){
				pct=this.internationalizer.percent.format(pct/100);
			}else{
				pct=pct+"%";
			}
			message+=" (" +	 pct + ")";
			var ticks=Math.abs(tick2-tick1);
			ticks=Math.round(ticks)+1;
			var barsStr=this.translateIf("Bars");
			message+=" " + ticks + " " + barsStr;

			if(m){
				if(m.className!="measureLit") m.className="measureLit";
				m.innerHTML=message;
			}
		}

		if(this.activeDrawing) return;		// Don't measure when in the process of drawing
		m=this.controls.mSticky;
		if (m) {
			if(hover){
				m.style.display="inline-block";
				m.children[0].style.display="inline-block";
				if(price1){
					m.children[0].innerHTML=message;
				}
				this.positionSticky(m);
			}else{
				m.style.display="none";
				m.children[0].innerHTML="";
			}
		}
		this.runAppend("setMeasure", arguments);
	};

	/**
	 * Clears the innerHTML value of the `mMeasure` HTML DOM Node.
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.clearMeasure=function(){
		var m=$$("mMeasure");
		if(m){
			if(m.className!="measureUnlit") m.className="measureUnlit";
			m.innerHTML="";
		}
	};

	/**
	 * Draws a temporary panel on the tempCanvas. This is done to speed up rendering when a user is resizing a panel.
	 * @private
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.drawTemporaryPanel=function(){
		var borderEdge=Math.round(CIQ.ChartEngine.resizingPanel.right-3)+0.5;
		CIQ.clearCanvas(this.chart.tempCanvas, this);
		var y=CIQ.ChartEngine.crosshairY-this.top;
		this.plotLine(CIQ.ChartEngine.resizingPanel.left, borderEdge, y, y, this.canvasStyle("stx_panel_drag"), "segment", this.chart.tempCanvas.context, false, {});
		CIQ.ChartEngine.resizingPanel.handle.style.top=(y-CIQ.ChartEngine.resizingPanel.handle.offsetHeight/2) + "px";
	};

	/**
	 * Enables the trashcan icon on touch devices when a drawing, overlay or series is highlighted
	 * @private
	 * @memberOf CIQ.ChartEngine
	 * @deprecated
	 */
	CIQ.ChartEngine.prototype.setTrashCan=function(){
		if(CIQ.touchDevice){
			var m=this.controls.mSticky;
			if(m){
				m.style.display="inline-block";
				m.children[0].style.display="none";
				m.children[1].style.display="inline-block";
				if(m.children[2]) m.children[2].style.display="none";
				m.style.top=(this.backOutY(CIQ.ChartEngine.crosshairY)-60)+"px";
				m.style.right=this.chart.canvasWidth-(this.backOutX(CIQ.ChartEngine.crosshairX)-50)+"px";
			}
		}
	};

	/**
	 * Returns the X pixel give the location of a bar (dataSegment) on the chart.
	 * @param  {number} bar The bar (position on the chart which is also the position in the dataSegment)
	 * @param {CIQ.ChartEngine.Chart} [chart] Which chart to use. Defaults to this.chart.
	 * @return {number}		The X pixel on the chart
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.pixelFromBar=function(bar, chart){
		if(!chart) chart=this.chart;
		var x=0;
		if(this.chart.dataSegment && this.chart.dataSegment[bar] && this.chart.dataSegment[bar].leftOffset){
			x=this.chart.dataSegment[bar].leftOffset;
		}else{
			x=(bar+0.5)*this.layout.candleWidth;
		}
		x=chart.panel.left+Math.floor(x+this.micropixels)-1;
		return x;
	};

	/**
	 * Returns which bar the pixel lies on. Do not reference this into dataSegment without checking bounds because the return value may be negative or greater than the dataSegment array length.
	 * @param  {number} x An X pixel location on the chart
	 * @param {CIQ.ChartEngine.Chart} [chart] Which chart to use. Defaults to this.chart.
	 * @return {number}	  The bar that lies on the X pixel (may be negative/before or after the chart)
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.barFromPixel=function(x, chart){
		if(!chart) chart=this.chart;
		var dataSegment=this.chart.dataSegment, mp=this.micropixels, cw=this.layout.candleWidth;
		if(this.layout.chartType=="volume_candle" && dataSegment){
			//binary search
			var pixel=x-chart.panel.left-mp, mult=2, quote;
			var length=dataSegment.length;
			var bar=Math.round(length/mult);
			var rightofLastTick=dataSegment[length-1].leftOffset+dataSegment[length-1].candleWidth/2;
			if(pixel>rightofLastTick){
				//beyond the rightmost tick
				return length + Math.floor((x-rightofLastTick-chart.panel.left-mp)/cw);
			}else{
				for(var i=1;i<length;i++){
					mult*=2;
					quote=dataSegment[bar];
					if(!quote) break;
					var leftOffset=quote.leftOffset;
					var halfCandleWidth=quote.candleWidth/2;
					var left=leftOffset-halfCandleWidth;
					var right=leftOffset+halfCandleWidth;
					if(bar===0 || (pixel>=left && pixel<right)) break;
					else if(pixel<left) bar-=Math.max(1,Math.round(length/mult));
					else bar+=Math.max(1,Math.round(length/mult));
					bar=Math.max(0,Math.min(length-1,bar));
				}
				if(!dataSegment[bar]){
					//sucks, we need to iterate through
					for(i=0;i<length;i++){
						quote=dataSegment[i];
						if(!quote) continue;
						var leftOffset=quote.leftOffset;
						var halfCandleWidth=quote.candleWidth/2;
						if(pixel<leftOffset-halfCandleWidth)
							return Math.max(0,i-1);
						else if(pixel<leftOffset+halfCandleWidth)
							return i;
						else if(pixel>=leftOffset+halfCandleWidth)
							return i+1;
					}
				}
			}
			return bar;
		}else{
			return Math.floor((x-chart.panel.left-mp)/cw);
		}
	};

	/**
	 * Returns the tick (dataSet) position given the X pixel
	 * @param  {number} x	  X pixel location
	 * @param  {CIQ.ChartEngine.Chart} [chart] A chart object
	 * @return {number}		  The tick (position in the dataSet)
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.tickFromPixel=function(x, chart){
		if(!chart) chart=this.chart;
		var tick=chart.dataSet.length-chart.scroll+1;

		if(this.layout.chartType=="volume_candle"){
			tick+=this.barFromPixel(x,chart);
		}else{
			tick+=Math.floor((x-chart.panel.left-this.micropixels)/this.layout.candleWidth);
		}
		return tick;
	};

	/**
	 * Returns an X pixel for the given tick. The X pixel will be the center of the tick location. Note that the pixel may be off of
	 * the visual canvas and that it might overlap the Y axis.
	 * @param  {number} tick  The tick (position in the dataSet array)
	 * @param  {CIQ.ChartEngine.Chart} [chart] A chart object
	 * @return {number}		  The X position in pixels (may be negative or may be greater than dataSet.length)
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.pixelFromTick=function(tick, chart){
		if(!chart) chart=this.chart;
		var dataSegment=chart.dataSegment, dataSet=chart.dataSet, mp=this.micropixels, length=dataSegment?dataSegment.length:0;
		var panel=chart.panel, scroll=chart.scroll;
		var bar=tick-dataSet.length+scroll-1, quote=length?dataSegment[bar]:null;

		if(quote && quote.leftOffset){
			return panel.left+Math.floor(quote.leftOffset+mp)-1; //in here for volume candle
		}else{
			//in here for other chart types, or volume candle if bar lies outside of the actual quote data
			var rightOffset=0, dsTicks=0;
			quote=length?dataSegment[length-1]:null;
			if(quote && quote.leftOffset){
				//volume candle
				if(length<tick-dataSet.length+scroll){
					//in the "whitespace" area on the right of the chart
					rightOffset=quote.leftOffset-quote.candleWidth/2;
					dsTicks=length;
				}
			}
			return rightOffset + panel.left+Math.floor((tick-dsTicks-dataSet.length+scroll-0.5)*this.layout.candleWidth+mp)-1;
		}
	};

	/**
	 * Returns the X pixel position for a given date. Warning: this can be an expensive operation if the date is not in the dataSet.
	 * @param  {string} date  String form date
	 * @param  {CIQ.ChartEngine.Chart} chart The chart to look in
	 * @return {number}		  The pixel location for the date
	 * @todo  Use Date object instead of string form date
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.pixelFromDate=function(date, chart){
		return this.pixelFromTick(this.tickFromDate(date, chart), chart);
	};

	/**
	 * Returns the price (or value) give a Y pixel location.
	 * @param  {number} y	  The Y pixel location
	 * @param  {CIQ.ChartEngine.Panel} [panel] The panel to look. Defaults to the chart itself if not passed in.
	 * @param {CIQ.ChartEngine.YAxis} [yAxis] The yAxis to use. Defaults to panel.yAxis.
	 * @return {number}		  The Y location. This may be off of the visible canvas.
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.priceFromPixel=function(y, panel, yAxis){
		if(!panel) panel=this.chart.panel;
		var chart=panel.chart;
		var yax=yAxis?yAxis:panel.yAxis;
		y=yax.bottom-y;
		if( !yax.multiplier ) return null;
		var price=yax.low+(y/yax.multiplier);
		/*var roundit=chart.roundit;
		if(panel.roundit) roundit=panel.roundit;
		price=Math.round(price*roundit)/roundit;*/
		if(yax.semiLog){
			var logPrice=yax.logLow+(y*yax.logShadow/yax.height);
			price=Math.pow(10,logPrice);
		}
		return price;
	};

	/**
	 * Returns the value (price) given a Y-axis pixel. The value is relative to the the panel or the canvas.
	 * @param  {number} y	  The y pixel position
	 * @param  {CIQ.ChartEngine.Panel} [panel] A panel object. If passed then the value will be relative to that panel. If not passed then the value will be relative to the panel that is in the actual Y location.
	 * @param  {CIQ.ChartEngine.YAxis} [yAxis] Which yAxis. Defaults to panel.yAxis.
	 * @return {number}		  The value relative to the panel
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.valueFromPixel=function(y, panel, yAxis){
		if(!panel) panel=this.whichPanel(y);
		var p=this.priceFromPixel(y, panel, yAxis);
		return p;
	};

	/**
	 * A version of {@link CIQ.ChartEngine#valueFromPixel} that will untransform a transformation such as a comparison chart.
	 * @param  {number} y	  The y pixel location
	 * @param  {CIQ.ChartEngine.Panel} panel A panel object. It is strongly recommended to pass the panel! (see {@link CIQ.ChartEngine#valueFromPixel})
	 * @param {CIQ.ChartEngine.YAxis} [yAxis] The yaxis to use. Defaults to panel.yAxis.
	 * @return {number}		  The price or value
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.valueFromPixelUntransform=function(y, panel, yAxis){
		if(!panel) panel=this.whichPanel(y);
		if(!panel){
			// If we're not in a current panel then we're off the screen, so choose the top or bottom panel
			// Ideally we never get in here because panel is passed in by the developer!
			if(y<=0){
				panel=this.panels[CIQ.first(this.panels)];
			}else{
				panel=this.panels[CIQ.last(this.panels)];
			}
		}
		var p=this.priceFromPixel(y, panel, yAxis);
		if(panel.chart.untransformFunc && panel.name==panel.chart.name){
			p=panel.chart.untransformFunc(this, panel.chart, p);
		}
		return p;
	};

	/**
	 * A version of {@link CIQ.ChartEngine#pixelFromPrice} that will apply a transformation such as a comparison chart.
	 * @param  {number} price	  The price or value
	 * @param  {CIQ.ChartEngine.Panel} panel A panel object (see {@link CIQ.ChartEngine#pixelFromPrice})
	 * @param {CIQ.ChartEngine.YAxis} [yAxis] The yaxis to use
	 * @return {number}		  The y axis pixel location
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.pixelFromPriceTransform=function(price, panel, yAxis){
		if(panel.chart.transformFunc) price=panel.chart.transformFunc(this, panel.chart, price, yAxis);	// transform should move to panel
		return this.pixelFromPrice(price, panel, yAxis);
	};

	/**
	 * Returns the Y pixel from a given price (or value)
	 * @param  {number} price The price
	 * @param  {CIQ.ChartEngine.Panel} [panel] The panel (defaults to the chart)
	 * @param {CIQ.ChartEngine.YAxis} [yAxis] The yAxis to use
	 * @return {number}		  The Y pixel value
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.pixelFromPrice=function(price, panel, yAxis){
		if(!panel) panel=this.chart.panel;
		var yax=yAxis?yAxis:panel.yAxis;
		var y=(yax.high-price)*yax.multiplier;
		if(yax.semiLog){
			var p=Math.max(price,0);
			var logPrice=Math.log(p)/Math.LN10;
			//if(price<=0) logPrice=0;
			var height=yax.height;
			y=height-height*(logPrice-yax.logLow)/yax.logShadow;
		}

		y+=yax.top;
		return y;
	};


	/**
	 * Returns the Y pixel location for the (split) unadjusted price rather than the displayed price.
	 * This is important for drawing tools or any other device that requires the actual underlying price.
	 *
	 * @param  {CIQ.ChartEngine.Panel} panel The panel to get the value from
	 * @param  {number} tick  The tick location (in the dataSet) to check for an adjusted value
	 * @param  {number} value The value
	 * @param {CIQ.ChartEngine.YAxis} [yAxis] The yaxis to use
	 * @return {number}		  The pixel location
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.pixelFromValueAdjusted=function(panel, tick, value, yAxis){
		// If we're not showing unadjusted quotes, or if the panel isn't a chart then bypass
		if(this.layout.adj || !this.charts[panel.name]) return this.pixelFromPriceTransform(value, panel, yAxis);
		var a=Math.round(tick); // Not sure why we're rounding this. Possible legacy code.
		// Adjust if there's a ratio attached to the tick
		var ratio;
		if(a>0 && a<panel.chart.dataSet.length && (ratio=panel.chart.dataSet[a].ratio)){
			return this.pixelFromPriceTransform(value*ratio, panel, yAxis);
		}
		// Otherwise pass through
		return this.pixelFromPriceTransform(value, panel, yAxis);
	};

	/**
	 * Returns the unadjusted value for a given value, if an adjustment (split) had been applied. This can return a value
	 * relative to the original closing price.
	 * @param  {CIQ.ChartEngine.Panel} panel The panel to check
	 * @param  {number} tick  The location in the dataset
	 * @param  {number} value The value to adjust
	 * @return {number}		  The adjusted value
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.adjustIfNecessary=function(panel, tick, value){
		if(this.layout.adj) return value;	// Already adjusted prices
		if(!panel || !this.charts[panel.name]) return value;
		var a=Math.round(tick);
		var ratio;
		if(a>0 && a<panel.chart.dataSet.length && (ratio=panel.chart.dataSet[a].ratio)){
			return value/ratio;
		}
		return value;
	};

	/**
	 * Sets a transformation and untransformation function. Transforms can be used to transform the Y-Axis from absolute
	 * to relative values. For instance, comparison charts use a transform that adjusts from price to percentage.
	 * After this is called, chart.transformFunc and chart.untransformFunc will be set to those functions.
	 * @param {CIQ.ChartEngine.Chart} chart			   The chart to transform
	 * @param {function} transformFunction	 A transformation callback function which takes a number and returns the transformation of that number
	 * @param {function} untransformFunction An untransformation callback function
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.setTransform=function(chart, transformFunction, untransformFunction){
		chart.transformFunc=transformFunction;
		chart.untransformFunc=untransformFunction;
	};

	/**
	 * Removes a transformation/untransformation pair
	 * @param  {CIQ.ChartEngine.Chart} The chart to remove transformations from
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.unsetTransform=function(chart){
		delete chart.transformFunc;
		delete chart.untransformFunc;
		for(var i=0;i<chart.dataSet.length;i++){
			chart.dataSet[i].transform=null;
		}
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Stops (aborts) the current drawing. See {@link CIQ.ChartEngine#undoLast} for an actual "undo" operation.
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias undo
	 */
	CIQ.ChartEngine.prototype.undo=function(){
		if(this.runPrepend("undo", arguments)) return;
		if(this.activeDrawing){
			this.activeDrawing.abort();
			this.activeDrawing=null;
			CIQ.clearCanvas(this.chart.tempCanvas, this);
			this.draw();
			CIQ.swapClassName(this.controls.crossX, "stx_crosshair", "stx_crosshair_drawing");
			CIQ.swapClassName(this.controls.crossY, "stx_crosshair", "stx_crosshair_drawing");
			CIQ.ChartEngine.drawingLine=false;
		}
		this.runAppend("undo", arguments);
	};

	/**
	 * Creates an undo stamp for the chart's current drawing state
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.undoStamp=function(before, after){
		this.undoStamps.push(before);
		this.dispatch("undoStamp", {before: before, after: after});
	};

	/**
	 * Undoes the previous drawing state change.
	 * **Note: by design this method only manages drawings manually added during the current session and will not remove drawings restored from
	 * a previous session. ** If you wish to remove all drawings use {@link CIQ.ChartEngine.clearDrawings}.
	 * You can also view and interact with all drawings by traversing trough the CIQ.ChartEngine.drawingObjects[] array which includes **all** drawings displayed
	 * on the chart, regardless of session. Removing a drawing from this list, will remove the drawing from the chart after a draw() operation is executed.
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.undoLast=function(){
		if(this.activeDrawing){
			this.undo();
		}else{
			if(this.undoStamps.length){
				this.drawingObjects=this.undoStamps.pop();
				this.changeOccurred("vector");
				this.draw();
			}
		}
	};

	/**
	 * Programatically add a drawing
	 * @param {object} drawing The drawing definition
	 * @todo  Document drawing JSON format
	 * @memberOf CIQ.ChartEngine
	 * @private
	 */
	CIQ.ChartEngine.prototype.addDrawing=function(drawing){
		var drawings=CIQ.shallowClone(this.drawingObjects);
		this.drawingObjects.push(drawing);
		this.undoStamp(drawings, CIQ.shallowClone(this.drawingObjects));
	};


	/**
	 * Draws a series of connected lines on the canvas. The points are in a straight array for compactness. This is used
	 * for instance in the freeform (doodle) drawing tool
	 * @param  {array} points		  A series of points in the pattern x0,y0,x1,y1
	 * @param  {string} color		   Either a color or a Styles object as returned from {@link CIQ.ChartEngine#canvasStyle}
	 * @param  {string} type		   The type of line to draw ("segment","ray" or "line")
	 * @param  {external:CanvasRenderingContext2D} [context]		The canvas context. Defaults to the standard context.
	 * @param  {object} [confineToPanel] Panel the line should be drawn in, and not cross through. Or set to 'true' to confine to the main chart panel.
	 * @param  {object} [parameters]	 Additional parameters to describe the line
	 * @param {string} [parameters.pattern] The pattern for the line ("solid","dashed","dotted")
	 * @param {number} [parameters.width] The width in pixels for the line
	 * @param {number} [parameters.opacity] Optional opacity for the line
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.connectTheDots=function(points, color, type, context, confineToPanel, parameters){
		if(!parameters) parameters={};
		if(parameters.pattern=="none") return;
		if(confineToPanel===true) confineToPanel=this.chart.panel;
		if(context===null || typeof(context)=="undefined") context=this.chart.context;
		if(points.length<4) return;

		var edgeTop=0;
		var edgeBottom=this.chart.canvasHeight;
		var edgeLeft=0;
		var edgeRight=this.chart.width;

		if(confineToPanel){
			edgeBottom=confineToPanel.yAxis.bottom;
			edgeTop=confineToPanel.yAxis.top;
		}

		context.lineWidth=1.1;	// Use 1.1 instead of 1 to get good anti-aliasing on Android Chrome
		if(typeof(color)=="object"){
			context.strokeStyle=color.color;
			if(color.opacity) context.globalAlpha=color.opacity;
			else context.globalAlpha=1;
			context.lineWidth=parseInt(CIQ.stripPX(color.width));
		}else{
			if(!color || color=="auto" || CIQ.isTransparent(color)){
				context.strokeStyle=this.defaultColor;
			}else{
				context.strokeStyle=color;
			}
		}
		if(parameters.opacity) context.globalAlpha=parameters.opacity;
		if(parameters.lineWidth) context.lineWidth=parameters.lineWidth;
		var pattern = null;
		if(parameters.pattern){
			pattern=parameters.pattern;
			if(pattern=="solid"){
				pattern=null;
			}else if(pattern=="dotted"){
				pattern=[context.lineWidth, context.lineWidth];
			}else if(pattern=="dashed"){
				pattern=[context.lineWidth*5, context.lineWidth*5];
			}
		}
		context.beginPath();

		for(var i=0;i<points.length-2;i+=2){

			var x0=points[i];
			var y0=points[i+1];
			var x1=points[i+2];
			var y1=points[i+3];
			if(isNaN(x0) || isNaN(x1) || isNaN(y0) || isNaN(y1)) return;

			var t0 = 0.0, t1 = 1.0;
				var xdelta = x1-x0;
				var ydelta = y1-y0;
				var p,q,r;

			for(var edge=0; edge<4; edge++) {
				if (edge===0) {	 p = -xdelta;	 q = -(edgeLeft-x0);  }
				if (edge==1) {	p = xdelta;		q =	 (edgeRight-x0); }
				if (edge==2) {	p = -ydelta;	q = -(edgeTop-y0);}
				if (edge==3) {	p = ydelta;		q =	 (edgeBottom-y0);	}
				r = q/p;

				if((y1||y1===0) && p===0 && q<0){
					return false;	// Don't draw line at all. (parallel horizontal line outside)
				}

				if(p<0) {
					if(r>t1) return false;		   // Don't draw line at all.
					else if(r>t0) t0=r;			   // Line is clipped!
				} else if(p>0) {
					if(r<t0) return false;		// Don't draw line at all.
					else if(r<t1) t1=r;			// Line is clipped!
				}
			}

			var x0clip = x0 + t0*xdelta;
			var y0clip = y0 + t0*ydelta;
			var x1clip = x0 + t1*xdelta;
			var y1clip = y0 + t1*ydelta;

			try{
				if(pattern){
					context.dashedLineTo(x0clip, y0clip, x1clip, y1clip, pattern);
				}else{
					context.moveTo(x0clip, y0clip);
					context.lineTo(x1clip, y1clip);
				}
			}catch(e){
				//alert(x0clip + ":" + y0clip + " " + x1clip + ":" + y1clip);
			}
		}
		context.stroke();
		context.closePath();
		context.globalAlpha=1;
		context.lineWidth=1;
	};

	// confineToPanel is not used because currently we are splining after the drawing is complete.
	// should that change we will need to implement it

	/**
	 * Draws a series of points and splines (smooths the curve) those points
	 * @param  {array} points		  A series of points in the pattern x0,y0,x1,y1
	 * @param {number} tension Spline tension (0-1). Set to negative to not spline.
	 * @param  {string} color		   Either a color or a Styles object as returned from {@link CIQ.ChartEngine#canvasStyle}
	 * @param  {string} type		   The type of line to draw ("segment","ray" or "line")
	 * @param  {external:CanvasRenderingContext2D} [context]		The canvas context. Defaults to the standard context.
	 * @param  {string} [confineToPanel] Not currently implemented
	 * @param  {object} [parameters]	 Additional parameters to describe the line
	 * @param {string} [parameters.pattern] The pattern for the line ("solid","dashed","dotted")
	 * @param {number} [parameters.width] The width in pixels for the line
	 * @param {number} [parameters.opacity] Optional opacity for the line
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.plotSpline=function(points,tension,color,type,context,confineToPanel,parameters){
		if(!parameters) parameters={};
		if(parameters.pattern=="none") return;
		if(confineToPanel===true) confineToPanel=this.chart.panel;
		if(context===null || typeof(context)=="undefined") context=this.chart.context;

		context.save();

		context.lineWidth=1.1;	// Use 1.1 instead of 1 to get good anti-aliasing on Android Chrome
		if(typeof(color)=="object"){
			context.strokeStyle=color.color;
			if(color.opacity) context.globalAlpha=color.opacity;
			else context.globalAlpha=1;
			context.lineWidth=parseInt(CIQ.stripPX(color.width));
		}else{
			if(!color || color=="auto" || CIQ.isTransparent(color)){
				context.strokeStyle=this.defaultColor;
			}else{
				context.strokeStyle=color;
			}
		}
		if(parameters.opacity) context.globalAlpha=parameters.opacity;
		if(parameters.lineWidth) context.lineWidth=parameters.lineWidth;
		var pattern = null;
		if(parameters.pattern){
			pattern=parameters.pattern;
			if(pattern=="solid"){
				pattern=null;
			}else if(pattern=="dotted"){
				pattern=[context.lineWidth, context.lineWidth];
			}else if(pattern=="dashed"){
				pattern=[context.lineWidth*5, context.lineWidth*5];
			}
		}
		if(pattern && context.setLineDash){
			context.setLineDash(pattern);
			context.lineDashOffset=0;  //start point in array
		}

		//stxThirdParty
		context.beginPath();
		context.moveTo(points[0],points[1]);
		plotSpline(points,tension,context);
		context.stroke();
		context.closePath();

		context.restore();
	};

	/**
	 * This is called to send a potential click event to an active drawing, if one is active.
	 * @param  {CIQ.ChartEngine.Panel} panel The panel in which the click occurred
	 * @param  {number} x	  The X pixel location of the click
	 * @param  {number} y	  The y pixel location of the click
	 * @return {boolean}	  Returns true if a drawing is active and received the click
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.drawingClick=function(panel, x, y){
		if(!CIQ.Drawing) return;
		if(!this.activeDrawing){
			if(!panel) return;
			var drawingTool=this.currentVectorParameters.vectorType;
			var Factory=CIQ.ChartEngine.drawingTools[drawingTool];
			if(!Factory){
				if(CIQ.Drawing[drawingTool]){
					Factory=CIQ.Drawing[drawingTool];
					CIQ.ChartEngine.registerDrawingTool(drawingTool, Factory);
				}
			}
			if(Factory){
				this.activeDrawing=new Factory();
				this.activeDrawing.construct(this, panel);
				if(!this.charts[panel.name]){
					if(this.activeDrawing.chartsOnly){
						this.activeDrawing=null;
						return;
					}
				}
			}
		}
		if(this.activeDrawing){
			if(this.userPointerDown && !this.activeDrawing.dragToDraw){
				if(!CIQ.ChartEngine.drawingLine) this.activeDrawing=null;
				return;
			}

			var tick=this.tickFromPixel(x, panel.chart);
			var dpanel=this.panels[this.activeDrawing.panelName];
			var value=this.adjustIfNecessary(dpanel, tick, this.valueFromPixelUntransform(y,dpanel));
			if(this.preferences.magnet && this.magnetizedPrice){
				value=this.adjustIfNecessary(dpanel, tick, this.magnetizedPrice);
			}
			if(this.activeDrawing.click(this.chart.tempCanvas.context, tick, value)){
				if(this.activeDrawing){	// Just in case the drawing aborted itself, such as measure
					CIQ.ChartEngine.drawingLine=false;
					CIQ.clearCanvas(this.chart.tempCanvas, this);
					this.addDrawing(this.activeDrawing);	// Save drawing
					this.activeDrawing=null;
					this.adjustDrawings(); //moved from individual drawing.click function to here --gus
					this.draw();
					this.changeOccurred("vector");
					CIQ.swapClassName(this.controls.crossX, "stx_crosshair", "stx_crosshair_drawing");
					CIQ.swapClassName(this.controls.crossY, "stx_crosshair", "stx_crosshair_drawing");
				}
			}else{
				this.changeOccurred("drawing");
				CIQ.ChartEngine.drawingLine=true;
				CIQ.swapClassName(this.controls.crossX, "stx_crosshair_drawing", "stx_crosshair");
				CIQ.swapClassName(this.controls.crossY, "stx_crosshair_drawing", "stx_crosshair");
			}
			return true;
		}
		return false;
	};

	/**
	 * Returns the panel for the given Y pixel. Used for instance to determine which panel the crosshairs are in.
	 * @param  {number} y Y pixel location
	 * @return {CIQ.ChartEngine.Panel}	  The panel containing the Y location. Null if the Y location is outside of all panels.
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.whichPanel=function(y){
		for(var p in this.panels){
			var panel=this.panels[p];
			if(panel.hidden) continue;
			if(y>panel.top && y<panel.bottom) return panel;
		}
		return null;
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Called whenever the user lifts the mousebutton up. This may send a click to a drawing, or cease a drag operation.
	 * @param  {Event} e A mouse event
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias mouseup
	 */
	CIQ.ChartEngine.prototype.mouseup=function(e){
		if(this.runPrepend("mouseup", arguments)) return;
		this.swipe.end=true;
		this.cancelLongHold=true;
		if(this.repositioningDrawing){
			// if we single click with a drawing tool enabled, then start another drawing instead of moving current one
			if(!this.currentVectorParameters.vectorType || (Date.now()-this.mouseTimer>250)){
				this.changeOccurred("vector");
				CIQ.clearCanvas(this.chart.tempCanvas, this);
				this.repositioningDrawing=null;
				this.adjustDrawings(); // added missing adjusts when repositioning a Drawing  --gus
				this.draw();
				return;
			}else{
				this.repositioningDrawing=false;
			}
		}
		if(this.repositioningBaseline){
			this.repositioningBaseline=null;
			//this is so the baseline does not pop back to the center
			this.chart.panel.yAxis.scroll=this.pixelFromPriceTransform(this.chart.baseline.userLevel, this.chart.panel)-(this.chart.panel.yAxis.top+this.chart.panel.yAxis.bottom)/2;
			this.draw();
			return;
		}
		var wasMouseDown=this.userPointerDown;
		this.userPointerDown=false;
		if(!this.displayInitialized) return;	// No chart displayed yet
		this.grabbingScreen=false;
		if(this.openDialog!=="") {
			if(CIQ.ChartEngine.insideChart) CIQ.unappendClassName(this.container, "stx-drag-chart"); //in case they were grabbing the screen and let go on top of the button.
			return;
		}
		if(this.grabOverrideClick){
			this.swipeRelease();
			CIQ.unappendClassName(this.container, "stx-drag-chart");
			this.grabOverrideClick=false;
			this.doDisplayCrosshairs();
			this.updateChartAccessories();
			return;
		}
		//if(!this.displayCrosshairs) return;
		if(CIQ.ChartEngine.insideChart) CIQ.unappendClassName(this.container, "stx-drag-chart");
		if(CIQ.ChartEngine.resizingPanel){
			this.releaseHandle({});
			//CIQ.clearCanvas(this.chart.tempCanvas, this);
			//this.resizePanels();
			//CIQ.ChartEngine.resizingPanel=null;
			return;
		}
		if(!e) e=event;	//IE8
		if((e.which && e.which>=2) || (e.button && e.button>=2) || e.ctrlKey){
			if(this.anyHighlighted && !this.bypassRightClick){
				this.rightClickHighlighted();
				if(e.preventDefault && this.captureTouchEvents) e.preventDefault();
				e.stopPropagation();
				return false;
			}else{
				this.dispatch("rightClick", {stx:this, panel:this.currentPanel, x:cx, y:cy});
				return true;
			}
		}
		if(e.clientX<this.left || e.clientX>this.right) return;
		if(e.clientY<this.top || e.clientY>this.bottom) return;

		var cy=this.backOutY(e.clientY);
		var cx=this.backOutX(e.clientX);
		if(wasMouseDown && (!this.longHoldTookEffect || this.activeDrawing)){  //only completes drawing if you if don't leave chart and let go of mouse button
			this.drawingClick(this.currentPanel, cx, cy);
		}
		if(!this.activeDrawing && !this.longHoldTookEffect){
			this.dispatch("tap", {stx:this, panel:this.currentPanel, x:cx, y:cy});
		}

		this.runAppend("mouseup", arguments);
	};

	/**
	 * Turns on the grabbing hand cursor. It does this by appending the class "grab" to the document body.
	 * If this is a problem then just eliminate this function from the prototype.
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.grabbingHand=function(){
		if(!this.allowScroll) return;
		if(!this.grabbingScreen) return;
		if(CIQ.touchDevice) return;
		CIQ.appendClassName(this.container,"stx-drag-chart");
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Called when the user presses the mouse button down. This will activate dragging operations once the user moves a few pixels
	 * within {@link CIQ.ChartEngine#mousemoveinner}.
	 * @param  {Event} e The mouse event
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias mousedown
	 */
	CIQ.ChartEngine.prototype.mousedown=function(e){
		if(this.runPrepend("mousedown", arguments)) return;
		this.grabOverrideClick=false;
		if(this.openDialog!=="") return;
		if(!this.displayInitialized) return;	// No chart displayed yet
		if(!this.displayCrosshairs) return;
		if(!CIQ.ChartEngine.insideChart) return;
		if(this.manageTouchAndMouse && e && e.preventDefault && this.captureTouchEvents) e.preventDefault();	// Added 9/19/13 to prevent IE from going into highlight mode when you mouseout of the container
		this.mouseTimer=Date.now();
		this.longHoldTookEffect=false;
		this.hasDragged=false;
		this.userPointerDown=true;
		if(!e) e=event;	//IE8
		if((e.which && e.which>=2) || (e.button && e.button>=2)){	// Added 9/19/13 to prevent mFinance bug where right click wouldn't eliminate drawing
			return;
		}
		var chart=this.currentPanel.chart;
		if(e.clientX>=this.left && e.clientX<this.right && e.clientY>=this.top && e.clientY<=this.bottom){
			if(this.repositioningDrawing) return; // if mouse went off screen this might happen
			for(var i=0;i<this.drawingObjects.length;i++){
				var drawing=this.drawingObjects[i];
				if(drawing.highlighted){
					if(this.cloneDrawing){ // clone a drawing if flag set 
						var Factory=CIQ.ChartEngine.drawingTools[drawing.name];
						var clonedDrawing=new Factory();
						clonedDrawing.reconstruct(this, drawing.serialize());
						this.drawingObjects.push(clonedDrawing);
						this.repositioningDrawing=clonedDrawing;
						clonedDrawing.repositioner=drawing.repositioner;
						return;
					}
					this.repositioningDrawing=drawing;
					return;
				}
			}
			if( (this.layout.chartType=="baseline_delta" || this.layout.chartType=="baseline_delta_mountain") && chart.baseline.userLevel!==false){
				var y0=this.valueFromPixelUntransform(this.cy - 5, this.currentPanel);
				var y1=this.valueFromPixelUntransform(this.cy + 5, this.currentPanel);
				var x0=this.chart.right - parseInt(getComputedStyle(this.controls.baselineHandle).width, 10);
				if(chart.baseline.actualLevel<y0 && chart.baseline.actualLevel>y1 && this.cx>x0){
					this.repositioningBaseline={lastDraw:Date.now()};
					return;
				}
			}
			this.drawingClick(this.currentPanel, this.cx, this.cy);
			if(this.activeDrawing && this.activeDrawing.dragToDraw) return;
		}

		this.grabbingScreen=true;
		chart.spanLock=false;
		this.yToleranceBroken=false;
		if(!e) e=event;	//IE8
		/* use e.client insead of e.page since we need the value to be relative to the viewport instead of the overall document size.
		if(!e.pageX){
			e.pageX=e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			e.pageY=e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}
		*/
		this.grabStartX=e.clientX;
		this.grabStartY=e.clientY;
		this.grabStartScrollX=chart.scroll;
		this.grabStartScrollY=chart.panel.yAxis.scroll;
		this.grabStartCandleWidth=this.layout.candleWidth;
		this.grabStartZoom=this.whichYAxis(this.currentPanel).zoom;
		setTimeout((function(self){ return function(){self.grabbingHand();};})(this),100);
		this.swipeStart(chart);
		if(this.longHoldTime) this.startLongHoldTimer();
		this.runAppend("mousedown", arguments);
	};

	CIQ.ChartEngine.prototype.startLongHoldTimer=function(){
		var stx=this;
		this.cancelLongHold=false;
		if(this.longHoldTimeout) clearTimeout(this.longHoldTimeout);
		this.longHoldTimeout=setTimeout(function(){
			if(stx.cancelLongHold) return;
			stx.dispatch("longhold", {stx:stx, panel:stx.currentPanel, x:stx.cx, y:stx.cy});
			stx.longHoldTookEffect=true;
		}, this.longHoldTime);
	};

	/**
	 * Sets the current drawing tool as described by {@link CIQ.ChartEngine.currentVectorParameters} (color, pattern, etc)
	 * @param  {string} value The name of the drawing tool to enable
	 * @memberOf CIQ.ChartEngine
	 * @example
	 * // activates a drawing type described by currentVectorParameters
	 * stxx.changeVectorType('rectangle');
	 * // deactivates drawing mode
	 * stxx.changeVectorType('');
	 * // clears the drawings
	 * stxx.clearDrawings()
	 */
	CIQ.ChartEngine.prototype.changeVectorType=function(value){
		this.currentVectorParameters.vectorType=value;
		//if(value==""){  //need to always undo here to allow release of last drawing tool
			if(CIQ.ChartEngine.drawingLine) this.undo();
		//}
		this.setCrosshairColors();
		if(CIQ.ChartEngine.insideChart)
			this.doDisplayCrosshairs();
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * This function is called when a highlighted study overly is right clicked. If the overlay has an edit function (as many studies do), it will be called. Otherwise it will remove the overlay
	 * @param  {string} name The name (id) of the overlay
	 * @param  {boolean} [forceEdit] If true then force edit menu
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias rightClickOverlay
	 */
	CIQ.ChartEngine.prototype.rightClickOverlay=function(name, forceEdit){
		if(this.runPrepend("rightClickOverlay", arguments)) return;
		var sd=this.overlays[name];
		if(sd.editFunction){
			sd.editFunction(forceEdit);
		}else{
			this.removeOverlay(name);
		}
		this.runAppend("rightClickOverlay", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Removes an overlay (and the associated study)
	 * @param  {string} name The name (id) of the overlay
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias removeOverlay
	 */
	CIQ.ChartEngine.prototype.removeOverlay=function(name){
		if(this.runPrepend("removeOverlay", arguments)) return;
		var mySD;
		for(var o in this.overlays){
			var sd=this.overlays[o];
			if(sd.inputs.Field && sd.inputs.Field.indexOf(name)!=-1){ // Yucky, we should move to explicit parent nodes
				this.removeOverlay(sd.name);
			}else if(sd.name==name){
				mySD=sd;
			}
		}
		if(CIQ.Studies){
			var study=this.layout.studies[name];
			CIQ.deleteRHS(CIQ.Studies.studyPanelMap, study);
			if(mySD) this.cleanupRemovedStudy(mySD);
		}
		delete this.overlays[name];

		this.displaySticky();
		this.createDataSet();
		this.changeOccurred("layout");
		this.runAppend("removeOverlay", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Adds a series to the chart.
	 *
	 * Example <iframe width="800" height="500" scrolling="no" seamless="seamless" align="top" style="float:top" src="http://jsfiddle.net/chartiq/b6pkzrad/embedded/result,js,html/" allowfullscreen="allowfullscreen" frameborder="1"></iframe>
	 *
	 * Series can be plotted as additional lines or mountains on the chart or you can use `[setSeriesRenderer()]{@link CIQ.ChartEngine#setSeriesRenderer}` to group multiple series and draw them together as a stacked histogram, or group of lines sharing similar properties.
	 *
	 * *Important*. There are two ways to set up a series:
	 * -  If **`parameters.color` is included**, the series will be automatically attached to the default seriesRenderer (named `_generic_series`) and immediately rendered as an **overlay** . Use this method if you don't need any of the advanced features available through [custom renderers]{@link CIQ.ChartEngine#setSeriesRenderer}.
	 * As such, there is no need to then create a renderer and attach this seres to it, unless you also want the series to be part of a different set linked together by another renderer with different settings.
	 * - If the color is not defined, the series will be set but not displayed, awaiting grouping and rendering done by a `[setSeriesRenderer()]{@link CIQ.ChartEngine#setSeriesRenderer}` call.
	 * See the 'Examples' section for code illustrations of both methods.
	 *
	 * *Important*. Unless you set the `forceData` parameter, the dates for the values to be inserted have to perfectly match the dates of the existing chart ticks.
	 * This includes hours, minutes, seconds and milliseconds, even for daily ticks. 
	 * 
	 * @param {string} field	  The name of the series. This must match a field in the dataSet items or be a valid symbol fetch() can retrieve when `parameters.data.useDefaultQuoteFeed` is set to `true`.
	 * @param {object} [parameters] Optional parameters to describe the series
	 * @param {string} [parameters.display] Set to the text to display on the legend. If not set, the name of the series will be used (usually symbol)
	 * @param {string} [parameters.symbolObject] The symbol to fetch in object format. This will be sent into the fetch() function when `parameters.data.useDefaultQuoteFeed` is set to `true`. You can send anything you want in the symbol object, but you must always include at least a 'symbol' element.
	 * @param {string} [parameters.field] Specify an alternatve (existing) field to draw data from (other than the name of the series itself)
	 * @param {boolean} [parameters.isComparison] If set to true, shareYAxis is automatically set to true to display relative values instead of the primary symbol's price labels. {@link CIQ.ChartEngine#setComparison} is also called and set to `true`. This is only applicable when using the primary Y axis.
	 * @param {string} [parameters.type] Set to "step" to create a stairstep series rather than smooth lines
	 * @param {boolean} [parameters.shareYAxis] Set to true so that the series shares the Y-axis and renders along actual values. Otherwise it is superimposed on the chart maintaining the relative shape of the line but not on the actual y axes values (used when rendering multiple series that do not share a common value range). Will automatically override to true if 'isComparison'. This is only applicable when using the primary Y axis.
	 * @param {number} [parameters.marginTop] Percentage (if less than 1) or pixels (if greater than 1) from top of panel to set the top margin for the series.<BR>**Note:** this parameter is to be used on **subsequent** series rendered on the same axis. To set margins for the first series, {@link CIQ.ChartEngine.YAxis#initialMarginTop} needs to be used.<BR>**Note:** not applicable if shareYAxis is set.
	 * @param {number} [parameters.marginBottom] Percentage (if less than 1) or pixels (if greater than 1) from the bottom of panel to set the bottom margin for the series.<BR>**Note:** this parameter is to be used on **subsequent** series rendered on the same axis. To set margins for the first series, {@link CIQ.ChartEngine.YAxis#initialMarginBottom} needs to be used.<BR>**Note:** not applicable if shareYAxis is set.
	 * @param {number} [parameters.width] Width of line
	 * @param {number} [parameters.minimum]	 Minimum value for the series. Overrides CIQ.minMax result.
	 * @param {number} [parameters.maximum]	 Maximum value for the series. Overrides CIQ.minMax result.
	 * @param {string} [parameters.color] Color to draw line. **If present, it will force the series to be immediately drawn** ( as a line if no parameters.chartType is defined ) and a default renderer named `_generic_series` will be used to display the series as an **overlay**.
	 * @param {array} [parameters.pattern] Pattern to draw line, array elements are pixels on and off
	 * @param {object} [parameters.gaps] Whether to draw a line through where data points are missing. Set to `true` to use the same color and pattern as the main line, or define a color-pattern object if different.
	 * @param {string} [parameters.gaps.color] Color to draw line where data points are missing
	 * @param {Array} [parameters.gaps.pattern] Pattern to draw line where data points are missing, array elements are pixels on and off
	 * @param {string} [parameters.chartType] Chart type "mountain" to plot mountain chart. Default is "line" chart. Only applicable when using the default renderer. See {@link CIQ.Renderer#Lines} for details on how to render mountain charts using a custom renderer.
	 * @param {string} [parameters.fillStyle] Fill style for mountain chart (if selected). For semi-opaque use rgba(R,G,B,.1)
	 * @param {boolean} [parameters.permanent] Set to `true` to activate. Makes series unremoveable by a user **when attached to the default renderer**. If explicitly linked to a renderer,	it forces it to remain loaded (not necessarily displayed) even if detached from its renderer, allowing it to be re-attach/remain attached to a another renderer without having to recreate the series. See {@link CIQ.Renderer#attachSeries} for details on how to prevent an attached series from being removed by a user.
	 * @param {boolean} [parameters.forceData] Set to `true` to activate. If active, will create a masterData entry if none exists for that DT.
	 * @param {object} [parameters.data] Data source for the series. If omitted and a QuoteFeed is available then the QuoteFeed will be used to fetch data. Otherwise, this should contain an array of objects in {DT,Date,Value} format.
	 * @param {Date}   parameters.data.DT JavaScript date object or epoch representing data point (overrides Date parameter if present)
	 * @param {string} parameters.data.Date string date representing data point ( only used if DT parameter is not present)
	 * @param {number} parameters.data.Value value of the data point ( As an alternative, you can send `parameters.data.Close` since your quote feed may already be returning the data using this element name)
	 * @param {function} [cb] Callback function to be executed once the fetch returns data from the quoteFeed. It will be called with an error message if the fetch failed: `cb(err);`. Only applicable if using "useDefaultQuoteFeed:true" in `parameters.data`.
	 *
	 * @return {object} The series object
	 * @memberOf CIQ.ChartEngine
	 *
	 * @example
	 *
	 * // add a series using data already in the masterData array
	 * stxx.addSeries(
	 * 		"Open",
	 * 		{ color: "blue"}
	 * );
	 *
	 * @example
	 * // set location of your legend, if you want one.
	 * if(!stxx.chart.legend){
	 *		stxx.chart.legend={
	 *			x: 260,
	 *			y: 10
	 *		};
	 * }
	 * @example
	 *	// add a legend relative to the y axis top
	 *	if(!stxx.chart.legend) stxx.chart.legend={ x: 260, y: stxx.panels["chart"].yAxis.top+10 };
	 * @example
	 *	// add the comparison series with a color to immediately render using default renderer (as lines) and dashes for gaps fillers
	 *	stxx.addSeries(symbol1, {display:"Description 1",isComparison:true,data:{useDefaultQuoteFeed:true},color:"purple", gaps:{pattern:[3,3]},width:4,permanent:true});
	 *	stxx.addSeries(symbol2, {display:"Description 2",isComparison:true,data:{useDefaultQuoteFeed:true},color:"pink", gaps:{pattern:[3,3]},width:4});
	 *	stxx.addSeries(symbol3, {display:"Description 3",isComparison:true,data:{useDefaultQuoteFeed:true},color:"brown", gaps:{pattern:[3,3]},width:4});
	 * @example
	 *	// add the comparison series with only default parameters ( no color). The series will not display on the chart after it is added.
	 *	stxx.addSeries(symbol1, {display:"Description 1",isComparison:true,data:{useDefaultQuoteFeed:true}});
	 *	stxx.addSeries(symbol2, {display:"Description 2",isComparison:true,data:{useDefaultQuoteFeed:true}});
	 *	stxx.addSeries(symbol3, {display:"Description 3",isComparison:true,data:{useDefaultQuoteFeed:true}});
	 *
	 *	// group the series together and select "line" as the rendering type to display the series. Also set a pattern for gaps rendering.
	 *	var mdataRenderer=stxx.setSeriesRenderer(new CIQ.Renderer.Lines({params:{name:"My Line Series", type:"line", gaps:{pattern:[3,3]}, width:4}}))
	 *			.attachSeries(symbol1,{color:"red",permanent:true})
	 *			.attachSeries(symbol2,"blue")
	 *			.attachSeries(symbol3,"yellow")
	 *			.ready();
	 * @example
		function callbackFunct(field){
			 return function(err) {
				alert(field);
			}
		}

		// set	your legend location if you want one
		if(!stxx.chart.legend){
			stxx.chart.legend={
				 x: 260,
				 y: 10
			};
		}

		// add a series with a color to immediately render - this example uses the quotefeed to get initial data and refresh. It also calls callbackFunct after the data is returned from the fetch.
		stxx.addSeries(symbol1, {display:"Description",color:"brown",data:{useDefaultQuoteFeed:true}},callbackFunct(symbol1));
	 * @example
		// set up the legend creation callback for the histogram renderer
		function histogramLegend(colors){
			stxx.chart.legendRenderer(stxx,{legendColorMap:colors, coordinates:{x:260, y:stxx.panels["chart"].yAxis.top+30}, noBase:true});
		};

		// set up the y axis for the histogram renderer
		var axis=new CIQ.ChartEngine.YAxis();
		axis.position="left";
		axis.textStyle="#FFBE00";
		axis.decimalPlaces=0;			// no decimal places on the axis labels
		axis.maxDecimalPlaces=0;		// no decimal places on the last price pointer
		
		// set up the parameters for the histogram renderer
		var params={
			name:				"My stacked histogram",
			type:				"histogram",
			subtype:			"stacked",
			heightPercentage:	.7,	 // how high to go. 1 = 100%
			opacity:			.7,	 // only needed if supporting IE8, otherwise can use rgba values in histMap instead
			widthFactor:		.8,	 // to control space between bars. 1 = no space in between
			yAxis:				axis, 
			callback: 			histogramLegend
		};


		// create your histogram renderer
		var histRenderer=stxx.setSeriesRenderer(new CIQ.Renderer.Histogram({params:params}));

		// set up the call back for your addSeries
		// in this case we will have it attach the series to the renderer once the data is loaded
		function callbackFunct(field, color,renderer){
			 return function(err) {
				if ( !err) {
					renderer.attachSeries(field,color)
					.ready();  //use ready() to immediately draw the rendering
				}
			}
		}

		// add the series data and have the callback attach it to the renderer and render
		stxx.addSeries(symbol4, {display:"Description 1",data:{useDefaultQuoteFeed:true}},callbackFunct(symbol4,'red',histRenderer));
		stxx.addSeries(symbol5, {display:"Description 2",data:{useDefaultQuoteFeed:true}},callbackFunct(symbol5,'black',histRenderer));
		stxx.addSeries(symbol6, {display:"Description 3",data:{useDefaultQuoteFeed:true}},callbackFunct(symbol6,'green',histRenderer));
	 * @example
		// add series and attach to a y axis on the left.
		// See this example working here : http://jsfiddle.net/chartiq/b6pkzrad/
		stxx.addSeries("NOK", {display:"NOK",data:{useDefaultQuoteFeed:true},width:4});
		stxx.addSeries("SNE", {display:"Sony",data:{useDefaultQuoteFeed:true},width:4});

		var axis=new CIQ.ChartEngine.YAxis();
		axis.position="left";
		axis.textStyle="#FFBE00";
		axis.decimalPlaces=0;			// no decimal places on the axis labels
		axis.maxDecimalPlaces=0;		// no decimal places on the last price pointer


		renderer=stxx.setSeriesRenderer(new CIQ.Renderer.Lines({params:{name:"lines", type:"mountain", yAxis:axis}}));

		renderer.removeAllSeries()
			.attachSeries("NOK", "#FFBE00")
			.attachSeries("SNE", "#FF9300")
			.ready();
	 *
	 * @since
	 * <br>- 04-2015 if `isComparison` is true shareYAxis is automatically set to true and setComparison(true) called. createDataSet() and draw() are automatically called to immediately render the series.
	 * <br>- 15-07-01 if `color` is defined and chartStyle is not set then it is automatically set to "line".
	 * <br>- 15-07-01 ability to use setSeriesRenderer().
	 * <br>- 15-07-01 ability to automatically initialize using the quoteFeed.
	 * <br>- 15-07-01 `parameters.quoteFeedCallbackRefresh` no lonfer used. Instead if `parameters.data.useDefaultQuoteFeed` is set to `true` the series will be initalized and refreshed using the default quote feed. ( Original documentation:  {boolean} [parameters.quoteFeedCallbackRefresh] Set to true if you want the series to use the attached quote feed (if any) to stay in sync with the main symbol as new data is fetched (only available in Advanced package). )
	 * <br>- 2015-11-1 `parameters.symbolObject` is now available
	 * <br> 05-2016-10  `parameters.forceData` is now available.
	 * <br> TBD  `parameters.data.DT` can also take an epoch number.
	 */
	CIQ.ChartEngine.prototype.addSeries=function(field, parameters, cb){
		if(this.runPrepend("addSeries", arguments)) return;
		if(!parameters) parameters={};
		if(!parameters.chartName) parameters.chartName=this.chart.name;
		if(!parameters.symbolObject) parameters.symbolObject={symbol:field};
		var obj={
			parameters: CIQ.clone(parameters),
			yValueCache: [],
			display: field
		};
		if("display" in obj.parameters) obj.display=obj.parameters.display;
		if(obj.parameters.isComparison) obj.parameters.shareYAxis=true;
		if(!obj.parameters.chartType && obj.parameters.color) obj.parameters.chartType="line";
		if(obj.parameters.chartType && obj.parameters.chartType!="mountain") obj.parameters.chartType="line";
		if(!obj.parameters.panel) obj.parameters.panel=this.chart.panel.name;
		var chart=this.charts[parameters.chartName];
		var self = this;

		function addSeriesData(stx){
			var mIterator=0,cIterator=0;
			var c,m;
			while(parameters.data && mIterator<stx.masterData.length && cIterator<parameters.data.length){
				c=parameters.data[cIterator];
				m=stx.masterData[mIterator];
				if(!c.DT || typeof c.DT=="undefined")
					c.DT=CIQ.strToDateTime(c.Date);
				else 
					c.DT=new Date(c.DT); //in case they sent in an epoch
				if(c.DT.getTime()==m.DT.getTime()){
					if (typeof c.Value!="undefined") {
						m[field]=c.Value;
					}else if (stx.layout.adj && typeof c.Adj_Close!="undefined") {
						m[field]=c.Adj_Close;
					} else {
						m[field]=c.Close;
					}
					cIterator++;
					mIterator++;
					continue;
				}
				if(c.DT<m.DT) {
					if(parameters.forceData){
						stx.masterData.splice(mIterator,0,{DT:c.DT});
						continue;
					}
					cIterator++;
				}
				else mIterator++;
			}
			if(parameters.forceData && mIterator>=stx.masterData.length){
				while(parameters.data && cIterator<parameters.data.length){
					c=parameters.data[cIterator];
					if(!c.DT || typeof c.DT=="undefined")
						c.DT=CIQ.strToDateTime(c.Date);
					m={DT:c.DT};
					if (typeof c.Value!="undefined") {
						m[field]=c.Value;
					}else if (stx.layout.adj && typeof c.Adj_Close!="undefined") {
						m[field]=c.Adj_Close;
					} else {
						m[field]=c.Close;
					}
					stx.masterData.push(m);
					cIterator++;
				}
			}
		}

		function setUpRenderer(stx,obj){
			// set up a series renderer if there is a color ( to support legacy format )
			if(obj.parameters.color){
				var r=stx.getSeriesRenderer("_generic_series");
				if(!r){
					if (!CIQ.Renderer.Lines) {
						alert("ChartIQ: stxLibrary.js is required");
					}
					r=stx.setSeriesRenderer(new CIQ.Renderer.Lines({
						params:{panel:obj.parameters.panel, type:"legacy", name:"_generic_series", overChart:true},
					}));
				}
				r.attachSeries(field,obj.parameters).ready();
			}
		}

		function handleResponse(params){
			return function(dataCallback){
				if(!dataCallback.error && dataCallback.error!==0){
					// add data from the fetch
					parameters.data=dataCallback.quotes;
					addSeriesData(self);
					setUpRenderer(self,obj);
				}
				if(!self.currentlyImporting) self.dispatch("symbolChange", {stx:self, symbol: params.symbol, symbolObject:params.symbolObject, action:"add-series"});
				if(cb) cb(dataCallback.error, obj);
				self.runAppend("addSeries", arguments);
			};
		}

		if(chart){
			chart.series[field]=obj;
		}

		if(parameters.isComparison){
			self.setComparison(true, chart);
		}

		var doneInCallback=false;

		if(parameters.data && !parameters.data.useDefaultQuoteFeed /* legacy */) {
			if(this.masterData){
				addSeriesData(this); // add array of objects sent
			}
		}else{
			if(this.quoteDriver){
				var driver=this.quoteDriver;
				var fetchParams=driver.makeParams(field, parameters.symbolObject, this.chart);
				// for comparisons, you must  fetch enough data on the new Comparison to match the masterData, from	 beginning to end ticks
				// if the chart is empty, then don;t send any dates and allow the fetch to do an inital load
				if( this.chart.masterData[0]) fetchParams.startDate = this.chart.masterData[0].DT;
				if( this.chart.masterData[this.chart.masterData.length-1]) fetchParams.endDate = this.chart.masterData[this.chart.masterData.length-1].DT;
				if(parameters.symbolObject) fetchParams.symbolObject=parameters.symbolObject;
				doneInCallback=true;
				if(fetchParams.stx.isEquationChart(fetchParams.symbol)){  //equation chart
					CIQ.fetchEquationChart(fetchParams, handleResponse(fetchParams));
				}else{
					driver.quoteFeed.fetch(fetchParams, handleResponse(fetchParams));
				}
			}else{
				obj.addSeriesData=addSeriesData;
			}
		}

		// if we are loading data we want to do this in the fetch callback not here.
		if (!doneInCallback) {
			setUpRenderer(self,obj);
			if(cb) cb(null, obj);
			this.runAppend("addSeries", arguments);
		}

		return obj;
	};

	CIQ.ChartEngine.prototype.isEquationChart=function(symbol){
		if(!this.allowEquations || !CIQ.computeEquationChart) return false;
		if(symbol && symbol[0]=="=") return true;
		return false;
	};


	/**
	 * Just deletes the series without removing it from a renderer. Use {@link CIQ.ChartEngine#removeSeries}
	 * generally.
	 * @param  {string} field Series field
	 * @param  {CIQ.ChartEngine.Chart} chart The chart to remove from
	 */
	CIQ.ChartEngine.prototype.deleteSeries=function(field, chart){
		if(this.runPrepend("deleteSeries", arguments)) return;
		if(!chart) chart=this.chart;
		delete chart.series[field];
		if(this.quoteDriver) this.quoteDriver.updateSubscriptions();
		this.runAppend("deleteSeries", arguments);
	};

	/**
	 * Removes a series from the chart
	 * <span class="injection">INJECTABLE</span>
	 * @param  {string} field The name of the series to remove
	 * @param  {CIQ.ChartEngine.Chart} [chart] The chart object from which to remove the series
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.removeSeries=function(field, chart){
		if(this.runPrepend("removeSeries", arguments)) return;
		if(!chart) chart=this.chart;
		var symbolObject;
		for(var r in chart.seriesRenderers){
			var renderer=chart.seriesRenderers[r];
			for(var sp=renderer.seriesParams.length-1;sp>=0;sp--){
				var series=renderer.seriesParams[sp];
				if(!series.permanent && series.field===field) {
					symbolObject=series.symbolObject;
					renderer.removeSeries(field);
				}
			}
		}
		this.deleteSeries(field, chart); // just in case the renderer didn't...
		var comparing=false;
		for(var s in chart.series){
			if(chart.series[s].parameters.isComparison) comparing=true;
		}
		if(!comparing) this.setComparison(false, chart);
		this.createDataSet();
		this.draw();
		this.dispatch("symbolChange", {stx:this, symbol: field, symbolObject:symbolObject, action:"remove-series"});
		this.runAppend("removeSeries", arguments);
	};



	//@deprecated, use static version
	CIQ.ChartEngine.prototype.isDailyInterval=function(interval){
		if(interval=="day") return true;
		if(interval=="week") return true;
		if(interval=="month") return true;
		return false;
	};


	/**
	 * <span class="injection">INJECTABLE</span>
	 * Sets the periodicity and interval for the chart. Interval describes the raw data interval (1, 5, 30, "day") while
	 * period describes the multiple of that interval (7 minutes, 3 days, 7 X 5 minutes). This method sets the new periodicity
	 * and creates a new dataSet. If the interval has changed then the underlying data is no longer valid.
	 * If a quoteFeed has been attached to the chart (see {@link CIQ.ChartEngine#attachQuoteFeed} ) , it will be called to get the new data, otherwise this.dataCallback will
	 * be called in an effort to fetch new data. See {@link CIQ.ChartEngine#dataCallback}. If neither one is set and new data is needed, the function will fail.
	 *
	 * This function can be called together with newChart() by setting the proper parameter values. See example in this section and {@link CIQ.ChartEngine#newChart} for more details and compatibility with your current version.
	 *
	 * Note that the kernel is capable of deriving weekly and monthly charts from daily data. Set dontRoll to true to bypass this
	 * functionality if you have raw week and month data in the masterData.
	 *
	 * **See {@link CIQ.ChartEngine#createDataSet} for important notes on rolling up data with gaps.**
	 *
	 * **Note on 'tick' interval:**<BR>
	 * When using 'tick', please note that this is not a time based display, as such, there is no way to predict what the time for the next tick will be.
	 * It can come a second later, a minute later or even more depending on how active a particular instrument may be.
	 * If using the future tick functionality ( {@link CIQ.ChartEngine.XAxis#futureTicks} ) when in 'tick' mode, the library uses a pre-defined number (  {@link CIQ.ChartEngine.XAxis#futureTicksInterval} )for deciding what interval to use for future ticks.
	 * See below example on how to override this default.
	 *
	 * @type number
	 * @default
	 * @memberof   CIQ.ChartEngine.XAxis#
	 * @example
	 * // each bar on the screen will represent 15 minutes (a single 15 minute bar from your server)
	 * stxx.setPeriodicityV2(1, 15, "minute", function(err){});
	 *
	 * @example
	 * // each bar on the screen will represent 30 minutes formed by combining two 15-minute bars; each masterData element represening 15 minutes.
	 * stxx.setPeriodicityV2(2, 15, "minute", function(err){});
	 *
	 * @example
	 * // each bar on the screen will represent 1 tick and no particular grouping will be done.
	 * stxx.setPeriodicityV2(1, "tick", null, function(err){});
	 *
	 * @example
	 * // each bar on the screen will represent 1 day. MasterData elements will represent one day each.
	 * stxx.setPeriodicityV2(1, "day", null, function(err){});
	 *
	 * @example
	 * // this sets the periodicity to 5 minute bars when newChart is called
	 * stxx.newChart(
	 * 		newSymbol,
	 * 		null,
	 * 		null,
	 * 		finishedLoadingNewChart(
	 * 			stxx.chart.symbol,
	 * 			newSymbol
	 * 		),
	 * 		{
	 * 			span:{base:'day',multiplier:2},		// this parameter will cause newChart to call setSpan with these parameters
	 * 			periodicity:{period:1,interval:5}	// this parameter will cause newChart to call setPeriodicityV2 with these parameters
	 * 		}
	 * );
	 *
	 * @example
	 * //How to override stxx.chart.xAxis.futureTicksInterval when in 'tick' mode:
	 * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
	 * stxx.chart.xAxis.futureTicksInterval=1; // to set to 1 minute, for example
	 *
	 * @param {number} period The number of elements from masterData to roll-up together into one data point on the chart (one candle, for example). If set to 30 in a candle chart, for example, each candle will represent 30 raw elements of `interval` type.
	 * @param {string} interval The type of data to base the `period` on. This can be a numeric value representing minutes, seconds or millisecond as inicated by `timeUnit`, "day","week", "month" or 'tick' for variable time x-axis. ** "hour" is NOT a valid interval.** (This is not how much data you want the chart to show on the screen; for that you can use {@link CIQ.ChartEngine#setRange} or {@link CIQ.ChartEngine#setSpan})
	 * @param {string} [timeUnit] Optional time unit to further qualify the specified numeric interval. Valid values are "millisecond","second","minute",null. If not set, will default to "minute". ** only applicable and used on numeric intervals**
	 * @param {Function} [cb] Optional callback after periodicity is changed. First parameter of callback will be null unless there was an error.
	 * @memberOf CIQ.ChartEngine
	 * @since  2015-11-1 `second` and `millisecond` periodicities are now supported by setting the `timeUnit` parameter.
	 */
	CIQ.ChartEngine.prototype.setPeriodicityV2=function(period, interval, timeUnit, cb){
		if(this.runPrepend("setPeriodicityV2", arguments)) return;
		if(typeof timeUnit==="function"){
			cb=timeUnit; // backward compatibility
			timeUnit=null;
		}
		var switchInterval=false;

		// no interval or no period, no periodicity change.
		if(!interval) return;
		if(!period) return;
		var layout=this.layout, cw=layout.candleWidth;

		delete layout.setSpan; // No longer in a span if we've set a specific periodicity
		// support year
		if(interval=="year"){
			interval = "month";
			if (!period) period = 1;
			period = period*12;
		}

		var isDaily=this.isDailyInterval(interval), wasDaily=this.isDailyInterval(layout.interval);

		// clean up timeUnite
		if(isDaily) timeUnit=null;
		else if(interval=="tick") timeUnit=null;
		else if(!timeUnit) timeUnit="minute";

		var getDifferentData=false;

		if(this.chart.symbol){
			if( this.dontRoll || !wasDaily ) {
				// we are not rolling so monthly and weekly are not the same as daily or any of the introday... so simply check for different interval.
				if(layout.interval!=interval) getDifferentData=true;					
			} else {
				//we are rolling weeekly and monthly and wasn't introday mode...so check to see if we an still use daily data for the new periodicity
				if(isDaily!=wasDaily ) getDifferentData=true;
			}
			
			if(timeUnit!=layout.timeUnit) getDifferentData=true; // !!! Do not change to !==
		}

		layout.periodicity=period;
		layout.interval=interval;
		layout.timeUnit=timeUnit;

		if(getDifferentData){
			this.changeOccurred("layout");
			if(this.quoteDriver){
				for(var c in this.charts){
					if(this.charts[c].symbol){
						if(this.displayInitialized)
							this.quoteDriver.newChart({symbol:this.charts[c].symbol, symbolObject: this.charts[c].symbolObject, chart:this.charts[c]}, cb);
						else
							this.newChart(this.charts[c].symbol,null,this.charts[c],cb);
					}
				}
				return;
			} else if(this.dataCallback){
				this.dataCallback();
				if(cb) cb(null);
				return;
			} else {
				console.log("cannot change periodicity because neither dataCallback or quoteDriver are set");
				return;
			}
		}

		var chartName, chart;
		for(chartName in this.charts){
			chart=this.charts[chartName];
			var dataSegment=chart.dataSegment, dataSet=chart.dataSet, maxTicks=chart.maxTicks, scroll=chart.scroll;
			var dataSegmentLength=dataSegment?dataSegment.length:0, dataSetLength=dataSet?dataSet.length:0;
			var dt;
			var pos=Math.round(chart.maxTicks/2);
			this.setCandleWidth(cw, chart);
			var centerMe=true, rightAligned=false;
			if(scroll<=maxTicks)	// don't attempt to center the chart if we're scrolled into the future
				centerMe=false;
			else if(dataSegment && !dataSegment[pos]){	// don't attempt to center the chart if we're scrolled into the past
				centerMe=false;
				rightAligned=scroll-dataSetLength;	// We'll use this to keep the same amount of right alignment
			}


			if(centerMe && dataSegmentLength>0){
				if(maxTicks<((Math.round((this.chart.width/cw)-0.499)-1)/2)){
					pos=dataSegmentLength-1;
				}
				if(pos>=dataSegmentLength){
					dt=dataSegment[dataSegmentLength-1].DT;
					pos=dataSegmentLength-1;
				}else{
					dt=dataSegment[pos].DT;
				}
			}

			this.createDataSet();

			if(centerMe){	// If we're scrolled somewhere into the middle of the chart then we will keep the chart centered as we increase or decrease periodicity
				if(dataSegmentLength>0){
					for(var i=dataSetLength-1;i>=0;i--){
						var nd=dataSet[i].DT;
						if(nd.getTime()<dt.getTime()){
							chart.scroll=(dataSetLength-i)+pos;
							break;
						}
					}
				}
			}else if(!rightAligned){
				var wsInTicks=Math.round(this.preferences.whitespace/cw);
				chart.scroll=maxTicks-wsInTicks;			// Maintain the same amount of left alignment
			}else{
				chart.scroll=dataSet.length+rightAligned;	// Maintain the same amount of right alignment
			}
		}


		if(this.displayInitialized) this.draw();
		this.changeOccurred("layout");

		if(this.quoteDriver){
			for(chartName in this.charts){
				chart=this.charts[chartName];
				if(chart.symbol && chart.moreAvailable){
					this.quoteDriver.checkLoadMore(chart);
				}
			}
		}
		if(cb) cb(null);
		this.runAppend("setPeriodicityV2", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * <span class="animation">Animation Loop</span>
	 * Draws the drawings (vectors). Each drawing is iterated and asked to draw itself. Drawings are automatically
	 * clipped by their containing panel.
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias drawVectors
	 */
	CIQ.ChartEngine.prototype.drawVectors=function(){
		if(this.vectorsShowing) return;
		if(this.runPrepend("drawVectors", arguments)) return;
		this.vectorsShowing=true;
		if(!this.chart.hideDrawings){
			var tmpPanels={};
			// First find all the existing panels in the given set of drawings (exluded those that aren't displayed)
			var panelName,i;
			for(i=0;i<this.drawingObjects.length;i++){
				var drawing=this.drawingObjects[i];
				panelName=drawing.panelName;
				if(!this.panels[drawing.panelName]) continue;	// drawing from a panel that is not enabled
				if(!tmpPanels[panelName]){
					tmpPanels[panelName]=[];
				}
				tmpPanels[panelName].push(drawing);
			}
			// Now render all the drawings in those panels, clipping each panel
			for(panelName in tmpPanels){
				this.startClip(panelName);
				var arr=tmpPanels[panelName];
				for(i=0;i<arr.length;i++){
					arr[i].render(this.chart.context);
				}
				this.endClip();
			}
		}
		this.runAppend("drawVectors", arguments);
	};

	// Constant bitmask for bar evaluation
	CIQ.ChartEngine.NONE=0;		// no evaluation (black bars)
	CIQ.ChartEngine.CLOSEUP=1;		// today's close greater than yesterday's close
	CIQ.ChartEngine.CLOSEDOWN=2;	// today's close less than yesterday's close
	CIQ.ChartEngine.CLOSEEVEN=4;	// today's close the same as yesterday's close
	CIQ.ChartEngine.CANDLEUP=8;	// today's close greater than today's open
	CIQ.ChartEngine.CANDLEDOWN=16;	// today's close less than today's open
	CIQ.ChartEngine.CANDLEEVEN=32;	// today's close equal to today's open


	/**
	 * <span class="injection">INJECTABLE</span>
	 * <span class="animation">Animation Loop</span>
	 * Displays the chart by calling the appropriate rendering functions based on the chart type.
	 * @param  {CIQ.ChartEngine.Chart} chart The chart to render
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias displayChart
	 * @since 05-2016-10.1 "baseline_delta_mountain" and  "colored_mountain" are also available
	 */
	CIQ.ChartEngine.prototype.displayChart=function(chart){
		var noBorders=(this.layout.candleWidth-chart.tmpWidth<2 && chart.tmpWidth<=3);
		if(this.runPrepend("displayChart", arguments)) return;

		var layout=this.layout, chartType=layout.chartType, colorFunction=null, panel=chart.panel;
		var stxLineUpColor,stxLineDownColor,stxLineColor,baseline,styleArray;
		if(chart.customChart){
			if(chart.customChart.chartType) chartType=chart.customChart.chartType;
			if(chart.customChart.colorFunction) colorFunction=chart.customChart.colorFunction;
		}
		this.controls.baselineHandle.style.display="none";
		this.chart.baseLegendColors=[];

		function getColor(stx, style, isBorder, isGradient){
			var color=style.color;
			if(isBorder){
				color=style["border-left-color"];
				if(!color) color=style.borderLeftColor;	//IE
				if(!color) return null;
			}
			if(!isGradient) return color;
			var top=stx.pixelFromPrice(panel.chart.highValue, panel);
			if(isNaN(top)) top=0;	// 32 bit IE doesn't like large numbers
			var backgroundColor=style.backgroundColor;
			if(color && !CIQ.isTransparent(color)){
				var gradient=stx.chart.context.createLinearGradient(0,top,0,2*panel.yAxis.bottom-top);
				gradient.addColorStop(0, color);
				gradient.addColorStop(1, backgroundColor);
				return gradient;
			}else{
				return backgroundColor;
			}
		}
		if(layout.aggregationType=="kagi"){
			this.drawKagiSquareWave(panel, "stx_kagi_up", "stx_kagi_down");
			this.chart.baseLegendColors.push(this.getCanvasColor("stx_kagi_up"));
			this.chart.baseLegendColors.push(this.getCanvasColor("stx_kagi_down"));
		}else if(layout.aggregationType=="pandf"){
			this.drawPointFigureChart(panel, "stx_pandf_up", "X");
			this.chart.baseLegendColors.push(this.getCanvasColor("stx_pandf_up"));
			this.drawPointFigureChart(panel, "stx_pandf_down", "O");
			this.chart.baseLegendColors.push(this.getCanvasColor("stx_pandf_down"));
		}else if(chartType=="line"){
			this.drawLineChart(panel, "stx_line_chart");
		}else if(chartType=="mountain"){
			this.startClip(panel.name);
			this.chart.baseLegendColors=null;
			this.drawMountainChart(panel);
			this.endClip();
		}else if(chartType=="colored_mountain"){
			this.startClip(panel.name);
			stxLineUpColor=this.getCanvasColor("stx_line_up");
			stxLineDownColor=this.getCanvasColor("stx_line_down");
			stxLineColor=this.getCanvasColor("stx_line_chart");
			if(!colorFunction) colorFunction=function(stx, quote, mode){
				if(quote.Close>quote.iqPrevClose) return stxLineUpColor;
				else if(quote.Close<quote.iqPrevClose) return stxLineDownColor;
				else return stxLineColor;
				return null;
			};
			var colors1=this.drawMountainChart(panel,"stx_colored_mountain_chart", colorFunction);
			for(var c1 in colors1) this.chart.baseLegendColors.push(c1);
			this.endClip();
		}else if(chartType=="wave"){
			this.drawWaveChart(panel);
		}else if(chartType=="bar"){
			this.startClip(panel.name);
			this.drawBarChartHighPerformance(panel, "stx_bar_chart");
			this.endClip();
		}else if(chartType=="colored_line"){
			this.startClip(panel.name);
			stxLineUpColor=this.getCanvasColor("stx_line_up");
			stxLineDownColor=this.getCanvasColor("stx_line_down");
			stxLineColor=this.getCanvasColor("stx_line_chart");
			if(!colorFunction) colorFunction=function(stx, quote, mode){
				if(quote.Close>quote.iqPrevClose) return stxLineUpColor;
				else if(quote.Close<quote.iqPrevClose) return stxLineDownColor;
				else return stxLineColor;
				return null;
			};
			var colors2=this.drawLineChart(panel, "stx_line_chart", colorFunction);
			for(var c2 in colors2) this.chart.baseLegendColors.push(c2);
			this.endClip();
		}else if(chartType=="colored_bar"){
			this.startClip(panel.name);
			if(colorFunction){
				var colors3=this.drawBarChart(panel, "stx_bar_chart", colorFunction);
				for(var c3 in colors3) this.chart.baseLegendColors.push(c3);
			}else{
				this.drawBarChartHighPerformance(panel, "stx_bar_up", CIQ.ChartEngine.CLOSEUP);
				this.drawBarChartHighPerformance(panel, "stx_bar_down", CIQ.ChartEngine.CLOSEDOWN);
				this.drawBarChartHighPerformance(panel, "stx_bar_even", CIQ.ChartEngine.CLOSEEVEN);
				this.chart.baseLegendColors.push(this.getCanvasColor("stx_bar_up"));
				this.chart.baseLegendColors.push(this.getCanvasColor("stx_bar_down"));
			}
			this.endClip();
		}else if(chartType=="hollow_candle" || chartType=="volume_candle"){
			this.startClip(panel.name);

			if(colorFunction){
				if(!this.noWicksOnCandles[layout.aggregationType]) this.drawShadows(panel, colorFunction);
				this.drawCandles(panel, colorFunction, false);	//all bars
				this.drawCandles(panel, colorFunction, true);	//hollow bars only get border
			}else{
				if(!this.noWicksOnCandles[layout.aggregationType]){
					this.drawShadowsHighPerformance(panel, "stx_hollow_candle_up", CIQ.ChartEngine.CLOSEUP);
					this.drawShadowsHighPerformance(panel, "stx_hollow_candle_down", CIQ.ChartEngine.CLOSEDOWN);
					this.drawShadowsHighPerformance(panel, "stx_hollow_candle_even", CIQ.ChartEngine.CLOSEEVEN);
				}
				var colorUp=this.getCanvasColor("stx_hollow_candle_up");
				var colorDown=this.getCanvasColor("stx_hollow_candle_down");
				var colorEven=this.getCanvasColor("stx_hollow_candle_even");
				this.drawCandlesHighPerformance(panel, colorUp, "transparent", CIQ.ChartEngine.CLOSEUP|CIQ.ChartEngine.CANDLEDOWN);
				this.drawCandlesHighPerformance(panel, colorDown, "transparent", CIQ.ChartEngine.CLOSEDOWN|CIQ.ChartEngine.CANDLEDOWN);
				this.drawCandlesHighPerformance(panel, colorEven, "transparent", CIQ.ChartEngine.CLOSEEVEN|CIQ.ChartEngine.CANDLEDOWN);
				this.drawCandlesHighPerformance(panel, this.containerColor, colorUp, CIQ.ChartEngine.CLOSEUP|CIQ.ChartEngine.CANDLEUP);
				this.drawCandlesHighPerformance(panel, this.containerColor, colorDown, CIQ.ChartEngine.CLOSEDOWN|CIQ.ChartEngine.CANDLEUP);
				this.drawCandlesHighPerformance(panel, this.containerColor, colorEven, CIQ.ChartEngine.CLOSEEVEN|CIQ.ChartEngine.CANDLEUP);
				this.chart.baseLegendColors.push(colorUp);
				this.chart.baseLegendColors.push(colorDown);
			}
			this.endClip();
		}else if(chartType=="candle"){
			this.startClip(panel.name);

			if(colorFunction){
				if(!this.noWicksOnCandles[layout.aggregationType]) this.drawShadows(panel, colorFunction);
				this.drawCandles(panel, colorFunction, false);	 //all candles
				if(!noBorders) this.drawCandles(panel, colorFunction, true);  //all candle borders, if candlewidth is too small then don't draw the borders
			}else{
				if(!this.noWicksOnCandles[layout.aggregationType]){
					var coloredShadowUp=this.getCanvasColor("stx_candle_shadow_up");
					var coloredShadowDown=this.getCanvasColor("stx_candle_shadow_down");
					if(coloredShadowUp!=coloredShadowDown){
						this.drawShadowsHighPerformance(panel, "stx_candle_shadow_up", CIQ.ChartEngine.CANDLEUP);
						this.drawShadowsHighPerformance(panel, "stx_candle_shadow_down", CIQ.ChartEngine.CANDLEDOWN);
						this.drawShadowsHighPerformance(panel, "stx_candle_shadow", CIQ.ChartEngine.CANDLEEVEN);
					}else{
						this.drawShadowsHighPerformance(panel, "stx_candle_shadow");
					}
				}
				styleArray=this.canvasStyle("stx_candle_up");
				this.drawCandlesHighPerformance(panel, getColor(this,styleArray,false), getColor(this,styleArray,!noBorders), CIQ.ChartEngine.CANDLEUP);
				this.chart.baseLegendColors.push(styleArray.color);

				styleArray=this.canvasStyle("stx_candle_down");
				this.drawCandlesHighPerformance(panel, getColor(this,styleArray,false), getColor(this,styleArray,!noBorders), CIQ.ChartEngine.CANDLEDOWN);
				this.chart.baseLegendColors.push(styleArray.color);
			}
			this.endClip();
		}else if(chartType=="histogram"){
			this.startClip(panel.name);

			if(colorFunction){
				this.drawCandles(panel, colorFunction, false, true);	 //all bars
				if(!noBorders) this.drawCandles(panel, colorFunction, true, true);  //all bar borders, if candlewidth is too small then don't draw the borders
			}else{
				styleArray=this.canvasStyle("stx_histogram_up");
				this.drawCandlesHighPerformance(panel, getColor(this,styleArray,false,true), getColor(this,styleArray,!noBorders,true), CIQ.ChartEngine.CANDLEUP, true);
				this.chart.baseLegendColors.push(styleArray.color);

				styleArray=this.canvasStyle("stx_histogram_down");
				this.drawCandlesHighPerformance(panel, getColor(this,styleArray,false,true), getColor(this,styleArray,!noBorders,true), CIQ.ChartEngine.CANDLEDOWN, true);
				this.chart.baseLegendColors.push(styleArray.color);

				styleArray=this.canvasStyle("stx_histogram_even");  //TODO: needs its own style
				this.drawCandlesHighPerformance(panel, getColor(this,styleArray,false,true), getColor(this,styleArray,!noBorders,true), CIQ.ChartEngine.CANDLEEVEN, true);
				this.chart.baseLegendColors.push(styleArray.color);
			}
			this.endClip();
		}else if(chartType=="baseline_delta"){
			this.startClip(panel.name);
			this.setStyle("stx_baseline_trace", "opacity", 0);
			this.drawLineChart(panel, "stx_baseline_trace");
			baseline=chart.baseline.actualLevel;
			if(baseline!==null){
				baseline=this.pixelFromPriceTransform(baseline,chart.panel);
				var styles={"over":"stx_baseline_up","under":"stx_baseline_down"};
				for(var s in styles){
					var parameters={
						panelName: "chart",
						band: "Close",
						threshold: chart.baseline.actualLevel,
						color: this.getCanvasColor(styles[s]),
						direction: (s=="over"?1:-1),
						edgeHighlight: this.getCanvasColor(styles[s]),
						edgeParameters: {pattern:"solid",lineWidth:parseInt(this.canvasStyle(styles[s]).width,10)+0.1,opacity:1}
					};
					var color=parameters.color;
					if(color && color!="transparent"){
						var gradient=chart.context.createLinearGradient(0,(s=="over"?0:2*baseline),0,baseline);
						gradient.addColorStop(0, CIQ.hexToRgba(color,60));
						gradient.addColorStop(1, CIQ.hexToRgba(color,10));
						parameters.color=gradient;
						parameters.opacity=1;
					}
					CIQ.preparePeakValleyFill(this,chart.dataSegment,parameters);
					this.chart.baseLegendColors.push(color);
				}
				this.plotLine(0, 1, baseline, baseline, this.containerColor, "line", chart.context, true, {pattern:"solid",lineWidth:"1.1",opacity:1});
				this.plotLine(0, 1, baseline, baseline, this.getCanvasColor("stx_baseline"), "line", chart.context, true, {pattern:"dotted",lineWidth:"2.1",opacity:0.5});
				if(this.chart.baseline.userLevel!==false){
					this.controls.baselineHandle.style.top = baseline - parseInt(getComputedStyle(this.controls.baselineHandle).height, 10)/2+"px";
					this.controls.baselineHandle.style.left = this.chart.right - parseInt(getComputedStyle(this.controls.baselineHandle).width, 10)+"px";
					this.controls.baselineHandle.style.display="block";
				}
			}
			this.endClip();			
		}else if(chartType=="baseline_delta_mountain"){
			baseline=chart.baseline.actualLevel;
			if(baseline!==null) {
				// do the mountain under
				this.startClip(panel.name);
				this.drawMountainChart(panel,"stx_baseline_delta_mountain");
				this.endClip();
				
				this.startClip(panel.name);
				this.setStyle("stx_baseline_trace", "opacity", 0);
				this.drawLineChart(panel, "stx_baseline_trace");
				baseline=this.pixelFromPriceTransform(baseline,chart.panel);
				var styles2={"over":"stx_baseline_up","under":"stx_baseline_down"};
				for(var s2 in styles2){
					var parameters2={
						panelName: "chart",
						band: "Close",
						threshold: chart.baseline.actualLevel,
						color: this.getCanvasColor(styles2[s2]),
						direction: (s2=="over"?1:-1),
						edgeHighlight: this.getCanvasColor(styles2[s2]),
						edgeParameters: {pattern:"solid",lineWidth:parseInt(this.canvasStyle(styles2[s2]).width,10)+0.1,opacity:1}
					};
					this.chart.baseLegendColors.push(parameters2.color);
					parameters2.color="transparent"; // dont fill Peak and Valley, just draw colored line
					CIQ.preparePeakValleyFill(this,chart.dataSegment,parameters2);
				}
				this.plotLine(0, 1, baseline, baseline, this.containerColor, "line", chart.context, true, {pattern:"solid",lineWidth:"1.1",opacity:1});
				this.plotLine(0, 1, baseline, baseline, this.getCanvasColor("stx_baseline"), "line", chart.context, true, {pattern:"dotted",lineWidth:"2.1",opacity:0.5});
				if(this.chart.baseline.userLevel!==false){
					this.controls.baselineHandle.style.top = baseline - parseInt(getComputedStyle(this.controls.baselineHandle).height, 10)/2+"px";
					this.controls.baselineHandle.style.left = this.chart.right - parseInt(getComputedStyle(this.controls.baselineHandle).width, 10)+"px";
					this.controls.baselineHandle.style.display="block";
				}
				this.endClip();
			}
		}else if(chartType=="scatterplot"){
			this.startClip(panel.name);
			this.scatter(panel);
			this.endClip();
		}else if(chartType){
			console.log('Invalid chart layout.chartType: "'+ chartType + '". Defaulting to Line Chart.');
			layout.chartType="line";
			this.drawLineChart(panel, "stx_line_chart");
		}else{
			this.chart.baseLegendColors=null;
		}

		this.runAppend("displayChart", arguments);
	};

	/**
	 * Calculates the ATR (Average True Range) for the dataSet
	 * @private
	 * @param  {CIQ.ChartEngine.Chart} chart The chart to calculate
	 * @param  {number} period The number of periods
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.calculateATR=function(chart,period){
		if(!period) period=20;
		var total=0;
		for(var i=1;i<chart.dataSet.length;i++){
			var q=chart.dataSet[i];
			var previousClose=chart.dataSet[i-1].Close;
			var trueRange=Math.max(
				q.High-q.Low,
				Math.abs(q.High-previousClose),
				Math.abs(q.Low-previousClose)
			);
			total+=trueRange;
			if(i>period) total-=chart.dataSet[i-period].trueRange;
			q.trueRange=trueRange;
			q.atr=total/period;
		}
	};

	/**
	 * Calculates the Median Price for the dataSet.
	 * @private
	 * @param {CIQ.ChartEngine.Chart} chart The chart to update.
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.calculateMedianPrice = function(chart) {
		var d;
		for (var i = 0; i < chart.dataSet.length; ++i) {
			d = chart.dataSet[i];
			d["hl/2"] = (d.High + d.Low) / 2;
		}
	};

	/**
	 * Calculates the Typical Price for the dataSet.
	 * @private
	 * @param {CIQ.ChartEngine.Chart} chart The chart to update.
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.calculateTypicalPrice = function(chart) {
		var d;
		for (var i = 0; i < chart.dataSet.length; ++i) {
			d = chart.dataSet[i];
			d["hlc/3"] = (d.High + d.Low + d.Close) / 3;
		}
	};

	/**
	 * Calculates the Weighted Close for the dataSet.
	 * @private
	 * @param {CIQ.ChartEngine.Chart} chart The chart to update.
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.calculateWeightedClose = function(chart) {
		var d;
		for (var i = 0; i < chart.dataSet.length; ++i) {
			d = chart.dataSet[i];
			d["hlcc/4"] = (d.High + d.Low + 2 * d.Close) / 4;
		}
	};

	/**
	 * Calculates the (Open + High + Low + Close) / 4 for the dataSet.
	 * @private
	 * @param {CIQ.ChartEngine.Chart} chart The chart to update.
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.calculateOHLC4 = function(chart) {
		var d;
		for (var i = 0; i < chart.dataSet.length; ++i) {
			d = chart.dataSet[i];
			d["ohlc/4"] = (d.Open + d.High + d.Low + d.Close) / 4;
		}
	};

	/**
	 * Returns the current quote (the final element in the dataSet).
	 * @return {object} The most recent quote
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.currentQuote=function(){
		var quote=null;
		if(!this.chart.dataSet) return null;
		for(var i=this.chart.dataSet.length-1;i>=0;i--)
			if(this.chart.dataSet[i])
				return this.chart.dataSet[i];
		return null;
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * <span class="animation">Animation Loop</span>
	 * This method ensures that the chart is not scrolled off of either of the horizontal edges. 
	 * See {@link CIQ.ChartEngine#minimumLeftBars} and {@link CIQ.ChartEngine.Chart#allowScrollPast} for adjustments to defaults. 
	 * @param  {CIQ.ChartEngine.Chart} theChart The chart to check
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias correctIfOffEdge
	 */
	CIQ.ChartEngine.prototype.correctIfOffEdge=function(theChart){
		if(this.runPrepend("correctIfOffEdge", arguments)) return;
		for(var chartName in this.charts){
			var chart=this.charts[chartName], dataSet=chart.dataSet, maxTicks=chart.maxTicks;

			var leftPad= Math.min( this.minimumLeftBars+1,maxTicks);  // in ase the minimumLeftBars is larger than what we can display
			if(chart.allowScrollPast){	// allow scrolling from left to right, creating white space on either side
				var rightPad=maxTicks-leftPad;
				if(maxTicks-rightPad>dataSet.length){
					rightPad=maxTicks-dataSet.length;
				}
				if(chart.scroll-rightPad>dataSet.length){
					chart.scroll=dataSet.length+rightPad;
				}
				if(chart.scroll<=leftPad){
					chart.scroll=leftPad;
					this.micropixels=0;
				}
			}else{	// earliest point in time is always anchored on left side of chart
				if(chart.scroll<leftPad){
					chart.scroll=leftPad;
				}
				if(chart.scroll>dataSet.length){
					chart.scroll=dataSet.length;
				}
			}
		}
		this.runAppend("correctIfOffEdge", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * <span class="animation">Animation Loop</span>
	 * Creates the dataSegment. The dataSegment is a copy of the portion of the dataSet that is observable in the
	 * current chart. That is, the dataSegment is a "view" into the dataSet. chart.scroll and chart.maxTicks are the
	 * primary drivers for this method.
	 * @param  {CIQ.ChartEngine.Chart} [theChart] If passed then a data segment will be created just for that chart, otherwise all charts
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias createDataSegment
	 */
	CIQ.ChartEngine.prototype.createDataSegment=function(theChart){
		if(this.runPrepend("createDataSegment", arguments)) return;
		for(var chartName in this.charts){
			var chart=this.charts[chartName];
			if(theChart) chart=theChart;

			if(chart.isComparison)
				CIQ.Comparison.createComparisonSegmentInner(this, chart);

			var dataSet=chart.dataSet, baseline=chart.baseline, scroll=chart.scroll, maxTicks=chart.maxTicks;
			var layout=this.layout, cw=layout.candleWidth;
			baseline.actualLevel=baseline.userLevel?baseline.userLevel:baseline.defaultLevel;
			/*
			chart.baseline.includeInDataSegment forces a line chart (usually a baseline chart) to begin inside the chart
			whereas normally the first point in a line chart is off the left edge of the screen.
			 */
			var dataSegmentStartsOneBack=baseline.includeInDataSegment && !CIQ.ChartEngine.chartShowsHighs(this.layout.chartType);

			var dataSegment=chart.dataSegment=[];
			var position=dataSet.length - scroll - 1; // One more to deal with -1 case
			for(var i=-1;i<scroll && i<maxTicks;i++){
				position++;
				if(i==-1 && !dataSegmentStartsOneBack) continue;
				if(position<dataSet.length && position>=0){
					quote=dataSet[position];
					if(quote.candleWidth){
						quote.candleWidth=null;
						quote.leftOffset=null;
					}
					dataSegment.push(quote);
					if(baseline.actualLevel===null && i>=0) baseline.actualLevel=quote.iqPrevClose;
				}else if(position<0){
					dataSegment.push(null);
				}
			}
			if(layout.chartType=="volume_candle"){
				var totalVolume=0;
				for(var v=0;v<dataSegment.length;v++){
					quote=dataSegment[v];
					if(quote) totalVolume+=quote.Volume;
				}
				var accumOffset=0;
				for(var w=0;w<dataSegment.length;w++){
					var quote=dataSegment[w];
					if(quote){
						if(quote.Volume){
							var workingWidth=chart.width;
							if(scroll<maxTicks) workingWidth-=this.preferences.whitespace;
							quote.candleWidth=workingWidth*quote.Volume/totalVolume;
							quote.leftOffset=accumOffset+quote.candleWidth/2;
							accumOffset+=quote.candleWidth;
						}else{
							quote.candleWidth=cw;
							quote.leftOffset=accumOffset+cw/2;
							accumOffset+=cw;
						}
					}else{
						accumOffset+=cw;
					}
				}
			}
			if(theChart) break;
		}
		if(chart.isComparison) this.clearPixelCache();
		this.runAppend("createDataSegment", arguments);
	};

	/**
	 * Returns the tick position of the leftmost position on the chart.
	 * @return {number} The tick for the leftmost position
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.leftTick=function(){
		return this.chart.dataSet.length-this.chart.scroll;
	};

	/**
	 * Returns the offset from the left side of the screen for the first element
	 * on the chart screen. Most times this will be zero except when a user has scrolled
	 * past the end of the chart in which case it will be a positive number. This can be used
	 * to recreate a saved chart.
	 * @return {number} The offset from the left of the chart.
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.getStartDateOffset=function(){
		for(var ds=0;ds<this.chart.dataSegment.length;ds++){
			if(this.chart.dataSegment[ds]){
				return ds;
			}
		}
		return 0;
	};

	/**
	 * Scrolls the chart so that the leftmost tick is the requested date. The date must be an exact match.
	 * There is no effect if the date is not found.
	 * @param {Date} dt The requested date
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.setStartDate=function(dt){
		for(var i=0;i<this.chart.dataSet.length;i++){
			var bar=this.chart.dataSet[i];
			if(bar.DT.getTime()==dt.getTime()){
				this.chart.scroll=this.chart.dataSet.length-i;
				this.draw();
				return;
			}
		}
	};

	//@private
	CIQ.ChartEngine.prototype.updateListeners=function(event){
		for(var i in this.plugins){
			var plugin=this.plugins[i];
			if(plugin.display && plugin.listener) plugin.listener(this, event);
		}
	};

	//@private
	CIQ.ChartEngine.prototype.clearPixelCache=function(){
		for(var x in this.panels){
			var panel=this.panels[x];
			panel.cacheHigh=null;
			panel.cacheLow=null;
			panel.cacheLeft=1000000;
			panel.cacheRight=-1;
		}
		for(var chartName in this.charts){
			var chart=this.charts[chartName];
			if(!chart.dataSet) continue;
			for(var i=0;i<chart.dataSet.length;i++){
				chart.dataSet[i].cache={};
			}
		}
	};

	/**
	 * Creates a label on the y-axis unless {@link CIQ.ChartEngine.YAxis#drawPriceLabels} is false.
	 * This can be used for any panel and called multiple times to add multiple labels
	 *
	 * Style: stx_yaxis ( font only )
	 *
	 * @param  {CIQ.ChartEngine.Panel} panel			The panel on which to print the label
	 * @param  {string} txt				The text for the label
	 * @param  {number} y				The Y position on the canvas for the label. This method will ensure that it remains on the requested panel.
	 * @param  {string} backgroundColor The background color for the label.
	 * @param  {string} color			The foreground color for the label. If none provided then white is used, unless the background is white in which case black is used.
	 * @param  {external:CanvasRenderingContext2D} [ctx]		 The canvas context to use, defaults to the chart
	 * @param {CIQ.ChartEngine.YAxis} [yAxis] Optionally specifiy which yAxis if there are multiple for the panel
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.createYAxisLabel=function(panel, txt, y, backgroundColor, color, ctx, yAxis){
		if( panel.yAxis.drawPriceLabels === false) return;
		var yax=yAxis?yAxis:panel.yAxis;
		var context=ctx?ctx:this.chart.context;
		var margin=3;
		var height=this.getCanvasFontSize("stx_yaxis")+margin*2;
		this.canvasFont("stx_yaxis", context);
		var drawBorders=yax.displayBorder;
		if(this.axisBorders===false) drawBorders=false;
		if(this.axisBorders===true) drawBorders=true;
		var tickWidth=drawBorders?3:0; // pixel width of tick off edge of border
		var width;
		try{
			width=context.measureText(txt).width+tickWidth+margin*2;
		}catch(e){ width=yax.width;} // Firefox doesn't like this in hidden iframe

		var x=yax.left-margin + 3;
		var textx=x+margin+tickWidth;
		var radius=3;
		var position=(yax.position===null?panel.chart.yAxis.position:yax.position);
		if(position==="left"){
			x=yax.left + yax.width + margin - 3;
			width=width*-1;
			textx=x;
			radius=-3;
			context.textAlign="right";
		}
		if(y+(height/2)>yax.bottom) y=yax.bottom-(height/2);
		if(y-(height/2)<yax.top) y=yax.top+(height/2);
		context.fillStyle=backgroundColor;
		if(typeof(CIQ[this.yaxisLabelStyle]) == 'undefined') {
			this.yaxisLabelStyle="roundRectArrow";	// in case of user error, set a default.
		}
		var yaxisLabelStyle=this.yaxisLabelStyle;
		if(yax.yaxisLabelStyle) yaxisLabelStyle=yax.yaxisLabelStyle;
		CIQ[yaxisLabelStyle](context, x, y-(height/2), width, height, radius, true, false);

		context.textBaseline="middle";
		context.fillStyle=color?color:CIQ.chooseForegroundColor(backgroundColor);
		if(context.fillStyle==backgroundColor){	// Best effort to pick a foreground color that isn't the same as the background!
			if(backgroundColor.toUpperCase()=="#FFFFFF")
				context.fillStyle="#000000";
			else
				context.fillStyle="#FFFFFF";
		}
		// offset by 1 for true vertical centering since these only contain numbers
		context.fillText(txt, textx, y + 1);
		context.textAlign="left";
	};

	/**
	 * Creates a label on the x-axis. Generally used for drawing labels.
	 *
	 * Note: **This is not used for the floating crosshair date label wich is styled using `stx-float-date` ** See {@link CIQ.ChartEngine.AdvancedInjectable#updateChartAccessories} and {@link CIQ.ChartEngine.AdvancedInjectable#headsUpHR} for more details
	 *
	 * Label style: `stx-float-date` ( font only )
	 *
	 * @param  {CIQ.ChartEngine.Panel} panel			The panel on which to print the label
	 * @param  {string} txt				The text for the label
	 * @param  {number} x				The X position on the canvas for the label. This method will ensure that it remains on the requested panel.
	 * @param  {string} backgroundColor The background color for the label.
	 * @param  {string} color			The foreground color for the label. If none provided then white is used, unless the background is white in which case black is used.
	 * @param  {boolean} pointed		True to put an arrow above the label
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.createXAxisLabel=function(panel, txt, x, backgroundColor, color, pointed){
		var context=this.chart.context;
		var margin=2;
		var fontstyle="stx-float-date";	 //or stx_xaxis
		var height=this.getCanvasFontSize(fontstyle)+margin*2;
		this.canvasFont(fontstyle, context);
		var width;
		try{
			width=context.measureText(txt).width+margin*2;
		}catch(e){ width=0;} // Firefox doesn't like this in hidden iframe
		var y=panel.top+panel.height-height;//-margin;
		if(x+(width/2)<panel.left || x-(width/2)>panel.right) return;  //hopelessly out of bounds
		if(!pointed){
			if(x+(width/2)>panel.right) x=panel.right-(width/2);
			if(x-(width/2)<panel.left) x=panel.left+(width/2);
		}
		context.fillStyle=backgroundColor;
		CIQ.roundRect(context, x-(width/2), y, width, height, 3, true, false);
		if(pointed){
			var arrowHeight=panel.bottom-panel.yAxis.bottom-height;
			context.beginPath();
			context.moveTo(x - arrowHeight, y);
			context.lineTo(x, y - arrowHeight);
			context.lineTo(x + arrowHeight, y);
			context.closePath();
			context.fill();
		}
		context.textBaseline="top";
		context.fillStyle=color?color:CIQ.chooseForegroundColor(backgroundColor);
		if(context.fillStyle==backgroundColor){	// Best effort to pick a foreground color that isn't the same as the background!
			if(backgroundColor.toUpperCase()=="#FFFFFF")
				context.fillStyle="#000000";
			else
				context.fillStyle="#FFFFFF";
		}
		context.fillText(txt, x-width/2+margin, y+margin);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * <span class="animation">Animation Loop</span>
	 * Draws a label for the last price <b>in the main chart panel's y-axis<b> using {@link CIQ.ChartEngine#createYAxisLabel}
	 *
	 * Label style: `stx_current_hr_down` and `stx_current_hr_up`
	 *
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias drawCurrentHR
	 */
	CIQ.ChartEngine.prototype.drawCurrentHR=function(){
		if(this.runPrepend("drawCurrentHR", arguments)) return;
		var backgroundColor, color;
		for(var chartName in this.charts){
			var chart=this.charts[chartName];
			var panel=chart.panel;
			var yAxis=panel.yAxis;
			if(yAxis.drawCurrentPriceLabel===false) continue;
			if(chart.customChart && chart.customChart.chartType=="none") continue;
			var whichSet=yAxis.whichSet;
			if(!whichSet) whichSet="dataSet";
			var l=chart[whichSet].length, cw=this.layout.candleWidth;
			if(whichSet=="dataSegment") {
				//this crazy equation just to find the last bar displaying at least 50% on the screen
				while(l>(chart.width-this.micropixels+(cw)/2+1)/cw) l--;
			}
			if(l && chart[whichSet][l-1]){
				var quote=chart[whichSet][l-1];
				var prevClose=quote.Close, currentClose=quote.Close;
				if(chart[whichSet].length>=2){
					var quote2=chart[whichSet][l-2];
					if(quote2) prevClose=quote2.Close;
				}
				if(currentClose<prevClose){
					backgroundColor=this.canvasStyle("stx_current_hr_down").backgroundColor;
					color=this.canvasStyle("stx_current_hr_down").color;
				}else{
					backgroundColor=this.canvasStyle("stx_current_hr_up").backgroundColor;
					color=this.canvasStyle("stx_current_hr_up").color;
				}
				if(quote.transform) quote=quote.transform;
				var txt;
				// If a chart panel, then always display at least the number of decimal places as calculated by masterData (panel.chart.decimalPlaces)
				// but if we are zoomed to high granularity then expand all the way out to the y-axis significant digits (panel.yAxis.printDecimalPlaces)
				var labelDecimalPlaces=Math.max(panel.yAxis.printDecimalPlaces, panel.chart.decimalPlaces);
				//	... and never display more decimal places than the symbol is supposed to be quoting at
				if(yAxis.maxDecimalPlaces || yAxis.maxDecimalPlaces===0) labelDecimalPlaces=Math.min(labelDecimalPlaces, yAxis.maxDecimalPlaces);
				if(yAxis.priceFormatter){
					txt=yAxis.priceFormatter(this, panel, quote.Close, labelDecimalPlaces);
				}else{
					txt=this.formatYAxisPrice(quote.Close, panel, labelDecimalPlaces);
				}

				var y=this.pixelFromPrice(quote.Close, panel);
				this.createYAxisLabel(panel, txt, y, backgroundColor, color);

				if (this.preferences.currentPriceLine === true && this.isHome()) {
					panel.chart.context.globalCompositeOperation = "destination-over";
					this.plotLine(panel.left, panel.right, y, y, backgroundColor, "line", panel.chart.context, panel, {
						pattern: "dashed",
						lineWidth: 1,
						opacity: 0.8
					});
					panel.chart.context.globalCompositeOperation = "source-over";
				}
			}
		}
		this.runAppend("drawCurrentHR", arguments);
	};

	/**
	 * <span class="animation">Animation Loop</span>
	 * Determines the default color for lines and studies drawn on the screen. This is black unless
	 * the background color of the chart has a "value" greater than 65%.
	 * The result is that this.defaultColor contains the default color.
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.getDefaultColor=function(){
		this.defaultColor="#000000";
		var bgColor=null;
		var div=this.chart.container;
		while(!bgColor || CIQ.isTransparent(bgColor)){
			var cStyle=getComputedStyle(div);
			if(!cStyle) return;
			bgColor=cStyle.backgroundColor;
			if(CIQ.isTransparent(bgColor)) bgColor="transparent";
			div=div.parentNode;
			if(!div || !div.tagName) break;
		}
		if(bgColor){
			if(bgColor=="transparent") bgColor="#FFFFFF";
			this.containerColor=bgColor;
			if(!CIQ.isTransparent(bgColor)){
				var hsv=CIQ.hsv(bgColor);
				var v=hsv[2];
				if(v>0.65) this.defaultColor="#000000";
				else this.defaultColor="#FFFFFF";
			}else{
				this.defaultColor="#000000";
			}
		}else{
			this.containerColor="#FFFFFF";
		}
	};

	/**
	 * Charts may require asynchronous data to render. This creates a dilemma for any external
	 * process that depends on a fully rendered chart (for instance a process to turn a chart into an image).
	 * To solve this problem, external processes can register for a callback which will tell them when the chart
	 * has been drawn. See {@link CIQ.ChartEngine.registerChartDrawnCallback}.
	 *
	 * To accommodate this requirement, studies, plugins or injections that render asynchronously should use startAsyncAction
	 * and {@link CIQ.ChartEngine#completeAsyncAction} to inform the chart of their asynchronous activity.
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.startAsyncAction=function(){
		if(!this.pendingAsyncs) this.pendingAsyncs=[];
		this.pendingAsyncs.push(true);
	};

	/**
	 * Registers a callback for when the chart has been drawn
	 * @param  {function} fc The function to call
	 * @return {object} An object that can be passed in to {@link CIQ.ChartEngine#unregisterChartDrawnCallback}
	 * @memberOf  CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.registerChartDrawnCallback=function(fc){
		if(!this.asyncCallbacks) this.asyncCallbacks=[];
		this.asyncCallbacks.push(fc);
		return {
			fc: fc
		};
	};

	/**
	 * Removes a callback registration for when the chart has been drawn
	 * @param  {function} fc The function to call
	 * @memberOf CIQ.ChartEngine
	 * @param  {obj} fc An object from {@link CIQ.ChartEngine#registerDrawnCallback}
	 */
	CIQ.ChartEngine.prototype.unregisterChartDrawnCallback=function(obj){
		for(var i=0;i<this.asyncCallbacks.length;i++){
			if(this.asyncCallbacks[i]==obj.fc){
				this.asyncCallbacks.splice(i, 1);
				return;
			}
		}
	};

	/**
	 * Makes the async callbacks only if no pending async activity
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.makeAsyncCallbacks=function(){
		if(!this.asyncCallbacks) return; // no callbacks to make
		if(!this.pendingAsyncs || !this.pendingAsyncs.length){ // If no pending asyncs, or the array is empty (all have been fulfilled)
			for(var i=0;i<this.asyncCallbacks.length;i++){
				(this.asyncCallbacks[i])();
			}
		}
	};
	/**
	 * Studies or plugins that use asynchronous data should call this when their async activities are complete.
	 * See {@link CIQ.ChartEngine#startAsyncAction}
	 * @memberOf  CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.completeAsyncAction=function(){
		this.pendingAsyncs.pop();
		this.makeAsyncCallbacks();
	};
	/**
	 * <span class="injection">INJECTABLE</span>
	 * <span class="animation">Animation Loop</span>
	 * This is the main rendering function in the animation loop. It draws the chart including panels, axis, and drawings.
	 * This method is called continually as a user pans or zooms the chart.
	 * This would be a typical place to put an injection to add behavior to the chart after a drawing operation is complete.
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.draw=function(){
		this.debug();
		if(!this.chart.canvas) return;
		if(!this.chart.dataSet) return;
		if(!this.chart.canvasHeight) return;
		//if(!this.useAnimation && new Date()-this.grossDragging<500) return;

		this.offset=this.layout.candleWidth*this.candleWidthPercent/2;
		CIQ.clearCanvas(this.chart.canvas, this);
		if(!this.masterData.length) return;
		if(this.runPrepend("draw", arguments)) return;
		this.getDefaultColor();	//TODO, don't call this in draw() but instead manually when background color is changed?
		this.vectorsShowing=false;

		this.drawPanels();
		this.yAxisLabels=[];
		var i,chart,chartName,plugin;
		for(chartName in this.charts){
			chart=this.charts[chartName];
			this.correctIfOffEdge();
			this.createDataSegment();
			var axisRepresentation=this.createXAxis(chart);
			this.initializeDisplay(chart);
			this.rendererAction(chart, "calculate");
			this.renderYAxis(chart);
			this.drawXAxis(chart, axisRepresentation);

			/// Calculate tmpWidth which represents the amount of width that the candle takes, slightly less than candleWidth
			chart.tmpWidth=Math.floor(this.layout.candleWidth*this.candleWidthPercent);	// So we don't need to compute it a thousand times for every candle
			if(chart.tmpWidth%2===0){	// assure that candles are always odd number of pixels wide
				chart.tmpWidth+=1;
				if(chart.tmpWidth>this.layout.candleWidth) // If there isn't space then reduce further
					chart.tmpWidth-=2;
			}
			if(chart.tmpWidth<0.5) chart.tmpWidth=0.5;


			for(i in this.plugins){
				plugin=this.plugins[i];
				if(plugin.display){
					if(plugin.drawUnder) plugin.drawUnder(this, chart);
				}
			}
			this.rendererAction(chart, "underlay");
			if(CIQ.Studies) CIQ.Studies.displayStudies(this, chart, true);
			this.displayChart(chart);
			if(CIQ.Studies) CIQ.Studies.displayStudies(this, chart, false);
			this.rendererAction(chart, "overlay");
		}

		for(chartName in this.charts){
			chart=this.charts[chartName];
			for(i in this.plugins){
				plugin=this.plugins[i];
				if(plugin.display){
					if(plugin.drawOver) plugin.drawOver(this, chart);
				}
			}
		}

		// Do this after all the drawing has taken place. That way the y-axis text sits on top of anything that
		// has been drawn underneath. For instance, if panel.yaxisCalculatedPaddingRight>0 and the y-axis sits on top of the chart
		for(var panel in this.panels){
			if ( !this.panels[panel].hidden) this.plotYAxisText(this.panels[panel]);
		}
		for(var yLbl=0;yLbl<this.yAxisLabels.length;yLbl++){
			this.createYAxisLabel.apply(this,this.yAxisLabels[yLbl].args);
		}
		this.createCrosshairs();	//todo, move out of animation loop
		this.drawVectors();
		this.drawCurrentHR();
		this.displayInitialized=true;
		if(this.controls.home){
			this.controls.home.style.display=this.isHome() ? "none" : "block";
		}
		this.positionMarkers();
		for(chartName in this.charts){
			chart=this.charts[chartName];
			if(this.quoteDriver) this.quoteDriver.checkLoadMore(chart);
		}
		this.runAppend("draw", arguments);
		this.makeAsyncCallbacks();
	};

	/**
	 * This method adjusts the canvas for the current backing store. The backing store is used on "retina" style devices
	 * to indicate the ratio of actual screen pixels to web pixels. The canvas is adjusted according to this ratio so that
	 * pixels appear at the expected size and aren't fuzzy. Note that backing store is sometimes also employed by browsers
	 * to effect changes in the size of the view.
	 * @private
	 * @param  {Canvas} canvas	An HTML5 canvas
	 * @param  {external:CanvasRenderingContext2D} context An HTML5 canvas context
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.adjustBackingStore=function(canvas, context){
		this.devicePixelRatio = window.devicePixelRatio || 1;
		//note, let's ignore DPR<1, it is not consistently implemented on all browsers between retina and nonretina displays
		if(this.devicePixelRatio<1.0) this.devicePixelRatio=1.0;
		var backingStoreRatio = context.webkitBackingStorePixelRatio ||
							context.mozBackingStorePixelRatio ||
							context.msBackingStorePixelRatio ||
							context.oBackingStorePixelRatio ||
							context.backingStorePixelRatio || 1;

		var ratio = this.devicePixelRatio / backingStoreRatio;

		if (!CIQ.isAndroid || CIQ.is_chrome) {
			var oldWidth = canvas.width;
			var oldHeight = canvas.height;

			canvas.width = oldWidth * ratio;
			canvas.height = oldHeight * ratio;

			canvas.style.width = oldWidth + 'px';
			canvas.style.height = oldHeight + 'px';

			context.scale(ratio, ratio);
			this.adjustedDisplayPixelRatio=ratio;
		}
	};

	/**
	 * This method resizes the canvas to the dimensions of the containing div. This is called primarily
	 * by {@link CIQ.ChartEngine#resizeChart} and also when the chart is initialized (via newChart).
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.resizeCanvas=function(){
		if(!this.chart.panel) this.chart.panel=this.panels.chart;
		var canvas=this.chart.canvas;
		var context=this.chart.context;
		if(canvas && context){
			this.chart.tempCanvas.height=canvas.height=this.chart.container.clientHeight;
			this.chart.tempCanvas.width=canvas.width=this.chart.container.clientWidth;
			this.adjustBackingStore(canvas, context);
			this.adjustBackingStore(this.chart.tempCanvas, this.chart.tempCanvas.context);

			this.floatCanvas.height=this.chart.container.clientHeight;
			this.floatCanvas.width=this.chart.container.clientWidth;
			this.adjustBackingStore(this.floatCanvas, this.floatCanvas.context);

		}
		var rect=this.container.getBoundingClientRect();
		this.top=rect.top;
		this.left=rect.left;
		this.canvasWidth=this.chart.canvasWidth=this.chart.container.clientWidth;
		this.right=this.left+this.canvasWidth;
		this.height=this.chart.container.clientHeight;
		this.width=this.right-this.left;
		if(this.width===0 && !this.container.dimensionlessCanvas){
			console.log("warning: zero width chart. Check CSS for chart container.");
		}
		this.bottom=this.top+this.height;
		this.calculateYAxisPositions();
		this.chart.canvasRight=this.right;
		this.chart.canvasHeight=this.height;
		var candleWidth=this.layout.candleWidth;
		if(typeof(candleWidth)=="undefined") candleWidth=8;
		for(var chartName in this.charts){
			var chart=this.charts[chartName];
			if(this.layout.span){
				this.setCandleWidth(this.getSpanCandleWidth(this.layout.span), chart);
			}else{
				this.setCandleWidth(candleWidth, chart);
				if(chart.scroll<chart.width/candleWidth){
					chart.scroll=Math.floor(chart.width/candleWidth);
					var wsInTicks=Math.round(this.preferences.whitespace/this.layout.candleWidth);
					chart.scroll-=wsInTicks;
				}
			}
			var idealNumberOfTicks=10;
			var appxLabelWidth;
			try{
				appxLabelWidth=context.measureText("10:00").width*2;
			}catch(e){
				appxLabelWidth=100;
			}
			while(idealNumberOfTicks>1){
				if(this.chart.width/appxLabelWidth>idealNumberOfTicks) break;
				idealNumberOfTicks/=1.5;
			}
			chart.xAxis.autoComputedTickSizePixels=Math.round(this.chart.width/idealNumberOfTicks);
			if(chart.xAxis.autoComputedTickSizePixels<1) chart.xAxis.autoComputedTickSizePixels=1;
		}
	};

	/**
	 * Sets the candleWidth for the chart. The candleWidth represents the number of horizontal pixels from the start
	 * of one bar or candle to the start of the next. This also applies to line charts. It is effectively, the horizontal zoom.
	 * The candleWidth can be read from layout.candleWidth.
	 *
	 * **Note**: if calling `setCandleWidth()` before `newChart()`, with a value less than `minimumCandleWidth`, `newChart()` will reset the candle size to the default candle size (8 pixels).
	 *
	 * @param {number} newCandleWidth The new candle width. If less than or equal to 0, it will be reset to 8
	 * @param {CIQ.ChartEngine.Chart} [chart]	Which chart to set the candleWidth. Defaults to the default chart.
	 * @memberOf CIQ.ChartEngine
	 * @example
	 * stxx.setCandleWidth(10);
	 * stxx.home();	// home() is preferred over draw() in this case to ensure the chart is properly aligned to the right most edge.

	 */
	CIQ.ChartEngine.prototype.setCandleWidth=function(newCandleWidth, chart){
		if(!chart) chart=this.chart;
		if(newCandleWidth<this.minimumCandleWidth) newCandleWidth=this.minimumCandleWidth;
		this.layout.candleWidth=newCandleWidth;
		//chart.maxTicks=Math.ceil(this.chart.width/newCandleWidth+0.5); // we add half of a candle back in because lines and mountains only draw to the middle of the bar
		chart.maxTicks=Math.round(this.chart.width/newCandleWidth)+1;
	};

	/**
	 * Resizes the chart and adjusts the panels. The chart is resized to the size of the container div by calling
	 * {@link CIQ.ChartEngine#resizeCanvas}. This method is called automatically if a screen resize event occcurs. The charting
	 * engine also attempts to detect size changes whenever the mouse is moved. Ideally, if you know the chart is being
	 * resized, perhaps because of a dynamic change to the layout of your screen, you should call this method manually.
	 * @param {Boolean} [dontMaintainScroll=true] By default the scroll position will remain pegged on the right side of the chart. Set this to false to override.
	 * @memberOf CIQ.ChartEngine
	 * @since  2015-11-1 resizeChart now automatically retains scroll position
	 * @since  TBD resizeChart now also manages the resizing of the crosshairs. 
	 */
	CIQ.ChartEngine.prototype.resizeChart=function(maintainScroll){
		if(this.runPrepend("resizeChart", arguments)) return;
		if(maintainScroll!==false) maintainScroll=true;
		if(maintainScroll) this.preAdjustScroll();
		var previousHeight=this.chart.canvasHeight;
		this.resizeCanvas();
		if(maintainScroll) this.postAdjustScroll();
		if(this.displayInitialized){
			this.adjustPanelPositions();
			this.draw();
		// This second case occurs if a chart was initialized hidden but now
		// has suddenly been revealed. displayInitialized hadn't been set yet
		// because draw() has never been completed
		}else if(this.chart.canvasHeight!==0 && previousHeight===0){
			this.adjustPanelPositions();
			this.draw();
		}
		
		//redraw the crosshairs to adjust to the new size of the screen.
		this.doDisplayCrosshairs();
		this.updateChartAccessories();

		this.runAppend("resizeChart", arguments);
	};

	/**
	 * Renders a chart for a particular instrument from the data passed in or fetches new data from the attached {@link CIQ.QuoteFeed}.
	 * This is the method that should be called every time a new chart needs to be drawn for a different instrument. 
	 * 
	 * Note that before using this method you must first instantiate the chart and assign it to a DOM container using [`stxx=new CIQ.ChartEngine({container: $$("chartContainer")});`]{@link CIQ.ChartEngine}
	 *
	 * @param  {string/Object}		symbol			The symbol for the new chart - a symbol string or an object representing the symbol can be used. After the new chart is initialized, it will contain both a symbol string (stxx.chart.symbol) and a symbol object (stxx.chart.symbolObject). You can send anything you want in the symbol object, but you must always include at least a 'symbol' element. Both these variables will be available for use wherever the {@link CIQ.ChartEngine.Chart} object is present. For example, if using the [fetch()]{@link CIQ.QuoteFeed#fetch} method for gathering data, params.stx.chart.symbolObject will contain your symbol object.
	 * @param  {array}				[masterData]	An array of [properly formated OHLC objects](index.html#data-format) to create a chart. Each element should at a minimum contain a "Close" field (capitalized).
	 *												If the charting engine has been configured to use a QuoteFeed (@link CIQ.ChartEngine#attachQuoteFeed)
	 *												then masterData does not need to be passed in. The quote feed will be queried instead.
	 * @param  {CIQ.ChartEngine.Chart}		[chart]			Which chart to create. Defaults to the default chart.
	 * @param {Function}			[cb]			Optional callback when newChart is loaded.
	 * @param {Object} [params] Parameters to dictate initial rendering behavior
	 * @param {Object}	[params.span]			Default span to display upon inital rendering. See {@link CIQ.ChartEngine#setSpan}
	 * @param {number} params.span.multiplier   Number of spans to show as required by {@link CIQ.ChartEngine#setSpan}. To show 3 weeks of data, for example, set this to 3 and `params.span` to 'week'.
	 * @param {string} params.span.base The base span to show as required by {@link CIQ.ChartEngine#setSpan}. "minute","hour","day","week","month","year","all", "ytd" or "today". ** These spans are market hours sensitive **, so if you ask for 1 hour, for example, at the time the markets are close, the span will find the last time the markets where open for the active symbol, and include the last market hour in the span. It will also exclude days when the market is closed. This span will be combined with the multiplier. Example 2 days, 4 months. Please note that "all" will attempt to load all of the data the quotefeed has available for that symbol. Use this span with caution.
	 * @param {Object}	[params.periodicity]			Default periodicity to be used upon inital rendering. See {@link CIQ.ChartEngine#setPeriodicityV2}
	 * @param {Number} [params.periodicity.periodicity] Period as required by {@link CIQ.ChartEngine#setPeriodicityV2}
	 * @param {string} [params.periodicity.interval] An interval as required by {@link CIQ.ChartEngine#setPeriodicityV2}
	 * @param {boolean} [params.stretchToFillScreen] Increase the candleWidth to fill the left-side gap created by a small dataSet. Respects {@link CIQ.ChartEngine#preferences.whitespace}. Ignored when params.span is used.
	 * @memberOf CIQ.ChartEngine
	 * @example
	 	// using a symbol object and embedded span and periodicity requirements
	 	stxx.newChart(
		 	{symbol:newSymbol,other:'stuff'},
		 	null,
		 	null,
		 	callbackFunction(stxx.chart.symbol, newSymbol),
		 	{
		 		span:{base:'day',multiplier:2},
		 		periodicity:{period:1,interval:5},
		 		stretchToFillScreen:true
		 	}
	 	);
	 * @example
	 	// using a symbol string
	 	stxx.newChart(
		 	"IBM",
		 	null,
		 	null,
		 	callbackFunction(stxx.chart.symbol, newSymbol)
	 	);
	 *
	 * @since  
	 * <br> 2015-11-1 newChart is capable of setting periodicity and span via `params` settings
	 * <br> 04-2016-08 `params.stretchToFillScreen` is available
	 */
	CIQ.ChartEngine.prototype.newChart=function(symbol, masterData, chart, cb, params){
		//if (!symbol) return; // can't build a chart without a symbol
		if(!chart) chart=this.chart;


		if(!params) params={};

		var layout=this.layout, periodicity=params.periodicity;
		if (periodicity) {
			if (periodicity.interval) layout.interval=periodicity.interval;
			if (periodicity.period) layout.periodicity=periodicity.period;
			if (periodicity.periodicity) layout.periodicity=periodicity.periodicity;
			layout.timeUnit=periodicity.timeUnit;
		}

		var prevSymbol=chart.symbol;
		var prevSymbolObject=CIQ.clone(chart.symbolObject);
		var prevMarket=chart.market;
		var prevDataSet=chart.dataSet;
		var prevMoreAvailable=chart.moreAvailable;
		chart.dataSet=[];
		chart.moreAvailable=true;
		if(!symbol){
			chart.symbol = null;
			chart.symbolObject = { symbol: null };
		}else if(typeof symbol == 'object') {
			// an object was sent in, so initialize the string from the object
			chart.symbol = symbol.symbol;
			chart.symbolObject = symbol;
		} else {
			// a string was sent in so initaialize the object from the string
			chart.symbol=symbol;
			chart.symbolObject.symbol = symbol;
		}

		if(this.marketFactory){
			var marketDef=this.marketFactory(chart.symbolObject);
			this.setMarket(marketDef, chart);
		}

		var self=this;
		if(!masterData && this.quoteDriver){
			var callback = function(err){
				if(err && err!="orphaned") { // orphaned means that another newChart request came in, overriding this one
					chart.symbol=prevSymbol; // revert the symbol back to what it was if there is an error
					chart.symbolObject=prevSymbolObject; // revert the symbol objectback to what it was if there is an error
					chart.market=prevMarket;
					chart.dataSet=prevDataSet;
					chart.moreAvailable=prevMoreAvailable;
				}
				if(!self.currentlyImporting) self.dispatch("symbolChange", {stx:self, symbol: self.chart.symbol, symbolObject:self.chart.symbolObject, action:"master"});
				if(cb) cb(err);
			};

			var setSpan=params.span;
			if(!setSpan && layout) setSpan=layout.setSpan;
			if(setSpan && setSpan.base) {
				var multiplier=setSpan.multiplier || 1;
				// force a new chart to be initialized and new data fetched before calling setSpan to conform with the expectations and purpose of newChart,
				// and not use existing data and symbol names.
				this.chart.masterData=null;
				this.displayInitialized=false;
				// periodicity will be kept if sent as a parameter.
				this.setSpan({maintainPeriodicity:periodicity?true:false, multiplier: multiplier, base: setSpan.base, symbol:chart.symbol, forceLoad:true},callback);
			} else {
				this.quoteDriver.newChart({symbol:chart.symbol, symbolObject:chart.symbolObject, chart:chart, initializeChart:true}, function(err){
					if(!err){
						self.adjustPanelPositions(); // to ensure holders are adjusted for current yaxis height
						self.quoteDriver.updateSubscriptions();
						if (params.stretchToFillScreen) {
							self.fillScreen();
						}
					}
					callback.apply(self, arguments);
				});
			}
		}else{
			if(!masterData){
				console.log("Warning: No masterData specified and no QuoteFeed configured");
			}
			if (!chart.symbol) chart.symbol="";	// if we are ready to draw but the symbol is mising, it will crash
			this.setMasterData(masterData, chart);
			this.createDataSet();
			this.initializeChart();
			var span=params.span;
			if( span && span.multiplier && span.base) {
				this.setSpan({maintainPeriodicity:true,multiplier: span.multiplier,base: span.base});
			} else if (params.stretchToFillScreen) {
				this.fillScreen();
			} else if(masterData.length) {
				this.draw();
			} else {
				this.clear();
			}
			this.adjustPanelPositions();  // to ensure holders are adjusted for current yaxis height
			if(cb) cb();
		}
	};
	
	CIQ.ChartEngine.prototype.clear=function() {
		this.displayInitialized = false;

		for(var id in this.layout.studies){
			var sd=this.layout.studies[id];
			CIQ.Studies.removeStudy(this, this.layout.studies[id]);
		}
		
		this.controls.chartControls.style.display="none";
	};

	/**
	 * Adjusts the candleWidth to fill a left-side gap on the chart.
	 * @private
	 */
	CIQ.ChartEngine.prototype.fillScreen = function() {
		var chart=this.chart;
		var candleWidth = this.layout.candleWidth;
		var chartWidth = chart.width - this.preferences.whitespace;
		var count = chart.dataSet.length;

		if (count * candleWidth >= chartWidth) {
			this.draw();
			return;
		}

		var newCandleWidth = chartWidth / count;
		this.setCandleWidth(newCandleWidth, chart);
		this.home({maintainWhitespace: true});
	};

	/**
	 * Sets the master data for the chart. A dataSet is derived from the master data by {@link CIQ.ChartEngine#createDataSet}.
	 *
	 * If a [marketFactory]{@link CIQ.ChartEngine#setMarketFactory} has been linked to the chart, this method will also update the market on the chart to match the newly loaded instrument.
	 * When no factory is present, the chart assumes that the market will never change and will continue to use market initially set using {@link CIQ.ChartEngine#setMarket}.
	 * If none set, then the chart will operate in 24x7 mode.
	 *
	 * This method also calculates the number of decimal places for the security by checking the maximum number
	 * in the data. This is stored in chart.decimalPlaces.
	 *
	 * @param	{array}				masterData		An array of quotes. Each quote should at a minimum contain a "Close" field (capitalized) and a Date field which is a string form of the date.
	 *												This method will set DT to be a JavaScript Date object derived from the string form.
	 * @param	{CIQ.ChartEngine.Chart}	[chart]			The chart to put the masterData. Defaults to the default chart.
	 * @memberOf CIQ.ChartEngine
	 * @since 2016-03-11 - you can now define {@link CIQ.ChartEngine#transformMasterDataQuote} to format each masterData element before inserting it into the chart.
	 */
	CIQ.ChartEngine.prototype.setMasterData=function(masterData, chart){
		if(!chart) chart=this.chart;

		if(this.marketFactory){
			var marketDef=this.marketFactory(chart.symbolObject);
			this.setMarket(marketDef, chart);
		}

		chart.masterData=masterData;
		if(chart.name=="chart") this.masterData=masterData;
		//chart.decimalPlaces=2;
		var i;
		for(i=0;masterData && i<masterData.length;i++){
			if(this.transformMasterDataQuote) masterData[i] = this.transformMasterDataQuote(masterData[i]);
			var quotes=masterData[i];
			if(quotes.DT){
				quotes.DT=new Date(quotes.DT);
				quotes.Date=CIQ.yyyymmddhhmmssmmm(quotes.DT);
			}
			else if(quotes.Date) quotes.DT=CIQ.strToDateTime(quotes.Date);
			else console.log ('setMasterData : Missing DT and Date on masterData object');
			if(quotes.Volume && typeof quotes.Volume !== "number") quotes.Volume=parseInt(quotes.Volume,10);
			if(typeof quotes.Close == 'number'){
				/*var cs=quotes.Close.toString();
				var point=cs.indexOf('.');
				if(point!=-1){
					var dp = cs.length-point-1;
					if(dp>chart.decimalPlaces){
						chart.decimalPlaces=dp;
					}
				}*/
			} else {
				console.log ('setMasterData : Close is missing or not a number. Use parseFloat() if your data server provides strings. MasterData Index= ' + i +' Value = ' + quotes.Close);
			}
			//if (typeof quotes.High != 'number') console.log ('setMasterData : High is not a number. Use parseFloat() if your data server provides strings ' + quotes.High);
			//if (typeof quotes.Low != 'number') console.log ('setMasterData : Low is not a number. Use parseFloat() if your data server provides strings ' + quotes.Low);
			//if (typeof quotes.Open != 'number') console.log ('setMasterData : Open is not a number. Use parseFloat() if your data server provides strings ' + quotes.Open);
			if(quotes.High===null) delete quotes.High;
			if(quotes.Low===null) delete quotes.Low;
			if(quotes.Open===null) delete quotes.Open;
		}
		chart.decimalPlaces=this.callbacks.calculateTradingDecimalPlaces({
			stx:this,
			chart:chart,
			symbol: chart.symbolObject.symbol,
			symbolObject:chart.symbolObject
		});

		if(!CIQ.ChartEngine.isDailyInterval(this.layout.interval)) this.setDisplayDates(masterData);
		this.chart.roundit=Math.pow(10, chart.decimalPlaces);
		for(i in this.plugins){
			var plugin=this.plugins[i];
			if(plugin.display){
				if(plugin.setMasterData) plugin.setMasterData(this, chart);
			}
		}
		for(var s in this.chart.series){
			var series=this.chart.series[s];
			if(series.addSeriesData){
				series.addSeriesData(this);
			}
		}

	};

	/**
	 * Returns an array of all symbols currently required by the chart.
	 * The returned array contains an object for each symbol containing:
	 * symbol, symbolObject, interval, periodicity
	 * @return {Array} The array of symbol objects required
	 * @since  2016-03-11
	 */
	CIQ.ChartEngine.prototype.getSymbols=function(){
		var a=[], obj, layout=this.layout;
		function makeObj(symbol, symbolObject, layout){
			return {
					symbol:symbol,
					symbolObject:symbolObject,
					periodicity:layout.periodicity,
					interval:layout.interval,
					timeUnit:layout.timeUnit,
					setSpan:layout.setSpan
				};
		}
		for(var chartName in this.charts){
			var chart=this.charts[chartName];
			a.push(makeObj(chart.symbol, chart.symbolObject, layout));
			for(var field in chart.series){
				var series=chart.series[field], parameters=series.parameters;
				if(!parameters.data || !parameters.data.useDefaultQuoteFeed) continue;
				obj=makeObj(field, series.symbolObject, layout);
				if(arguments[0] === "include-parameters") obj.parameters = parameters;
				if(!obj.symbolObject){
					obj.symbolObject=parameters.symbolObject||{symbol:field};
				}
				a.push(obj);
			}
		}
		for(var p in this.panels){
			if(this.panels[p].studyQuotes){
				for(var sq in this.panels[p].studyQuotes){
					obj=makeObj(sq, {symbol:sq}, layout);
					a.push(obj);
				}
			}
		}
		for(var s=a.length-1;s>=0;s--){
			var symbol=a[s].symbol;
			if(this.isEquationChart(symbol)){
				var res=CIQ.formatEquation(symbol);
				if(res){
					for(var sym=0;sym<res.symbols.length;sym++){
						obj=makeObj(res.symbols[sym], a[s].symbolObject, a[s]);
						a.push(obj);
					}
					a.splice(s,1);
				}
			}
		}
		return a;
	};

	/**
	 * Sets the displayDate for the data element in masterData. The displayDate is the timezone adjusted date.
	 * @param {object} quote The quote element to check
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.setDisplayDate=function(quote){
		var dt=quote.DT;
		var milli=dt.getSeconds()*1000+dt.getMilliseconds();
		var newDT;
		if(this.dataZone){
			newDT=new timezoneJS.Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), this.dataZone);
			dt=new Date(newDT.getTime()+milli);
		}
		if(this.displayZone){
			newDT=new timezoneJS.Date(dt.getTime(), this.displayZone);
			dt=new Date(newDT.getFullYear(), newDT.getMonth(), newDT.getDate(), newDT.getHours(), newDT.getMinutes());
			dt=new Date(dt.getTime()+milli);
		}
		quote.displayDate=dt;
	};

	/**
	 * Calls {@link CIQ.ChartEngine#setDisplayDate} for each element in masterData
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.setDisplayDates=function(masterData){
		if(!masterData) return;
		for(var i=0;i<masterData.length;i++){
			var quote=masterData[i];
			if(quote.DT) this.setDisplayDate(quote);
		}
	};

	/**
	 * Use this method to stream "last sale" prices into the chart. (See {@link CIQ.ChartEngine.appendMasterData} for streaming OHLC data into the chart).
	 * This method is designed to append ticks to the master data while maintaining the existing periodicity, appending to the last tick or creating new ticks as needed.
	 * It will also fill in gaps if there are missing bars in a particular interval.
	 * If a trade has a date older than the begining of the next bar, the last bar will be updated even if the trade belongs to a prior bar; this could happen if a trade is sent in after hours at a time when the market is closed, or if it is received out of order.
	 * When in 'tick' interval, each trade will be added to a new bar and no aggregation to previous bars will be done.
	 * If the optional timestamp [now] is sent in, and it is older than the next period to be rendered, the last tick on the dataset will be updated instead of creating a new tick.
	 *
	 * ** It is crucial that you ensure the date/time of the trade is in line with your `masterData` and `dataZone` ** See `now` parameter for more details.
	 *
	 * This method leverages {@link CIQ.ChartEngine.appendMasterData} for the actual data inserion into masterData. Please see  {@link CIQ.ChartEngine.appendMasterData} for additional details and performance throttle setings.
	 *
	 * **Note: ** versions prior to 15-07-01 must use the legacy arguments : streamTrade(price, volume, now, symbol)
	 *
	 * @param  {object}		data			Price & Volume Data, may include any or all of the following:
	 * @param  {number}		[data.last] 	Last sale price
	 * @param  {number}		[data.volume] 	Trade volume
	 * @param  {number}		[data.bid] 		Bid price
	 * @param  {number}		[data.ask] 		Offer/Ask price
	 * @param  {Date}		[now]			optional argument to specify date of trade. It must be a java script date [new Date().getTime()]. **If omitted, defaults to "right now" in the set `dataZone`** (see {@link CIQ.ChartEngine#setTimeZone}); or if no `dataZone` is set, it will default to the browser's timezone (not recommended for international client-base since different users will see different times). It is important to note that this value must be in the same timezone as the rest of the masterData already sent into the charting engine to prevent tick gaps or overlaps.
	 * @param  {string}		[symbol]		trade symbol for series streaming
	 * @param {Object} 		[params] 		Optional params to be passed to {@link CIQ.ChartEngine#appendMasterData}
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.streamTrade=function(priceData, now, symbol, params){
		var chart=this.chart;
		if(!params) params={};
		if(params.chart) chart=params.chart;
		var price=null, bid=null, ask=null, volume=0;

		if(typeof priceData=="object"){
			price=priceData.last;
			bid=priceData.bid;
			ask=priceData.ask;
			volume=priceData.volume;
			if ( typeof now!="undefined" ) now = new Date(now);
		}else{
			price=arguments[0];
			volume=arguments[1];
			if ( typeof now!="undefined" ) now = new Date(arguments[2]);
			symbol=arguments[3];
		}

		var md=chart.masterData;

		if (!now || now == 'Invalid Date') {
			// if no date is sent in, use the current time and adjust to the dataZone
			now = this.convertToDataZone(new Date());
		}

		var quote;
		if(!md || !md.length || this.layout.interval=="tick"){
			quote={
					Date: CIQ.yyyymmddhhmmssmmm(now),
					DT: now,
					Open:price,
					Close:price,
					High:price,
					Low:price,
					Volume:volume,
					Bid:bid,
					Ask:ask
			};
			this.appendMasterData([quote], chart, params);
		}else{
			// clone the last item in master data since we will be changing it and resending as the object to append
			quote=CIQ.clone(md[md.length-1]);

			// We use a 24 hour market because we don't want our ticks to artificially stop
			// at the end of a market session. If we get extended hours, or bad ticks we still
			// want to print them on the chart. Trust the data.
			var market24=new CIQ.Market({});
			var iter_parms = {
				'begin': quote.DT,
				'interval': this.layout.interval,
				'periodicity': 1,
				'timeUnit': this.layout.timeUnit,
				'inZone': this.dataZone,
				'outZone': this.dataZone
			};
			var iter = market24.newIterator(iter_parms);
			var next = iter.next();
			if(now<next){	// update current tick
				//var force = false;

				// series needs to be updated when symbol is passed
				if(symbol){
					if(price || price===0) {
						quote[symbol] = price;
						//force = true;
					}
				}else{
					if(price || price===0) {
						quote.Close = price;
						if(price>quote.High || quote.High===null) quote.High=price;
						if(price<quote.Low || quote.Low===null) quote.Low=price;
						if(quote.Open===null) quote.Open=price; //this could happen if we advance on a comparison symbol
					}
					if(volume) quote.Volume+=volume;
					if(bid || bid===0) quote.Bid=bid;
					if(ask || ask===0) quote.Ask=ask;
				}
				var newParams=CIQ.clone(params);
				//newParams.force=true;

				if (typeof quote.Adj_Close!="undefined" ) {
					// if there is an adjusted close on the candke, then we need to reset of bad things will happen.
					quote.Adj_Close=quote.Close;
				}

				this.appendMasterData([quote], chart, newParams);
			}else{			// create new tick
				var gaps = [];

				// Set now to an even boundary (it is likely a few milliseconds into the interval)
				var iter2_parms = {
					'begin': now,
					'interval': this.layout.interval,
					'periodicity': 1,
					'timeUnit': this.layout.timeUnit,
					'inZone': this.dataZone,
					'outZone': this.dataZone
				};
				var iter2 = market24.newIterator(iter2_parms);
				iter2.next();
				now=iter2.previous();


				while(next < now) {
					if (this.streamParameters.fillGaps) {
						var gap = {
								Date: CIQ.yyyymmddhhmmssmmm(next),
								DT: next,
								Close: quote.Close,
								Open: quote.Close,
								High: quote.Close,
								Low: quote.Close,
								Volume: 0,
								Bid: quote.Bid,
								Ask: quote.Ask
						};
						gaps.push(gap);
					}
					next = iter.next();
				}

				if(symbol){
					// If we advance forward on a symbol that is not the main symbol (a comparison series)
					// Then we need to temporarily advance the main series, but wait for the first tick which
					// will be the Open. So we take the previous close and move it forward
					var c=this.currentQuote();
					quote={
							Date: CIQ.yyyymmddhhmmssmmm(next),
							DT: next,
							Close:c.Close,
							Volume:0,
							Bid:c.Bid,
							Ask:c.Ask
					};
					quote[symbol]=price;
				}else{
					quote={
							Date: CIQ.yyyymmddhhmmssmmm(next),
							DT: next,
							Open:price,
							Close:price,
							High:price,
							Low:price,
							Volume:volume,
							Bid:bid,
							Ask:ask
					};
				}
				gaps.push(quote);
				this.appendMasterData(gaps, chart, params);
			}
		}
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Use this method to stream OHLC data into a chart. An array of quotes should be passed in (even if only appending a single quote).
	 * The quotes should be in the same form as taken by {@link CIQ.ChartEngine#setMasterData}.
	 * The method can appended new elements to the end of the master Data or replace existing elements. It will **NOT** insert new elements in the middle.
	 * This is driven by the date of the first element on the appendQuotes array.
	 * If newer than the last master Data element, the list will be appended to the end of master Data.
	 * Otherwise it will systematically replace each element on the masterData with the new elements (**NOT** filling in the date gap by pusing existng masterData elements forward, but actually replacing the existing elements) , beginning at the first matching date,
	 * and will continue this process even if new elements are required to be append at the end of the	master Data to exhaust the submitted list.
	 *
	 * Dates in the appendQuotes array **must maintain the correct periodicity and order** (older to newer) to prevent out of sequence ticks.
	 * If your wish is to augment your existing historical data with tick by tick trade data,
	 * even though your periodicity is not set to 'tick', you must do this using {@link CIQ.ChartEngine#streamTrade} instead. 
	 * StreamTrade will take each tick received by your streaming feed and properly update the last bar or create a new one as needed, ensuring the set periodicity is maintained.
	 *
	 * To maintain system performance you can throttle inbound ticks. See {@link CIQ.ChartEngine#streamParameters } and [Streaming tutorial](tutorial-Data%20Loading.html#Streaming) for more details.
	 * It is important to note that although the data will always be added to masterData, `createDataSet()` and `draw()` will **not** be called if data is received quicker than the throttle (governor) wait periods. As such, you will not see any changes until the throttle wait periods are met.
	 *
	 * Note: this method is not intended to be used as a way to load initial chart data, update individual comparison symbols, or data changes triggered by periodicity changes. 
	 * See {@tutorial Data Loading} for more detail on how to load initial data.
	 * See {@link CIQ.ChartEngine#streamTrade} for more details on how to stream comparison symbols.
	 *
	 *
	 * @param  {array}			appendQuotes		An array of properly formatted OHLC quote objects to append. [See Data Format](index.html#data-format)
	 * @param  {CIQ.ChartEngine.Chart}			[chart]				The chart to append the quotes. Defaults to the default chart.
	 * @param {Object} [params] Parameters to dictate behavior
	 * @param {boolean} [params.noCreateDataSet] If true then do not create the data set automatically, just add the data to the masterData
	 * @param {boolean} [params.allowReplaceOHL] Set to true to bypass internal logic that maintains OHL
	 * @param {boolean} 			[params.bypassGovernor] If true then masterdata will be immediatelly updated regardless of {@link CIQ.ChartEngine#streamParameters}
	 * @memberOf CIQ.ChartEngine
	 * @since
	 * <br>2015-11-1 params.bypassGovernor added, allowReplaceOHL added
	 * <br>2015-11-1 params.force deprecated. Every call will update the tick to maintain the proper volume and createDataSet is now controlled by sp.maxTicks, sp.timout or params.bypassGovernor
	 */
	CIQ.ChartEngine.prototype.appendMasterData=function(appendQuotes, chart, params){
		/* no longer support force -- now controlled by sp.maxTicks, sp.timout or params.bypassGovernor
		if(typeof params!="object"){ // backward compatibility when 3rd argument was boolean for force
			params={
				force: params
			};
		}
		*/
		if(!params) params={};
		if(!chart) chart=this.chart;
		if(appendQuotes.constructor==Object) appendQuotes=[appendQuotes]; // When developer mistakenly sends an object instead of an array of objects
		if(this.runPrepend("appendMasterData", [appendQuotes, chart, params])) return;
		if(!appendQuotes || !appendQuotes.length) return;
		var dt=appendQuotes[0].DT;
		if(!dt) dt=CIQ.strToDateTime(appendQuotes[0].Date);
		var masterData=chart.masterData;
		var i, quote, master;
		if(!masterData || !masterData.length){
			masterData=chart.masterData=CIQ.clone(appendQuotes);
			for(i=0;i<masterData.length;i++){
				quote=masterData[i];
				if(quote.DT) quote.Date=CIQ.yyyymmddhhmmssmmm(quote.DT);
				else quote.DT=CIQ.strToDateTime(quote.Date);
				if(quote.Volume && typeof quote.Volume !== "number") quote.Volume=parseInt(quote.Volume,10);
				if(!CIQ.ChartEngine.isDailyInterval(this.layout.interval)) this.setDisplayDate(quote);
			}
		}else{
			i=masterData.length-1;
			while(i>=0){
				var dt2=masterData[i].DT;
				if(!dt2) dt2=CIQ.strToDateTime(masterData[i].Date);
				if(dt2.getTime()<=dt.getTime()){
					var plusOne=0;	// If time is the same then replace last bar
					if(dt2.getTime()<dt.getTime()) plusOne=1;	// Otherwise append bar
					for(var j=0;j<appendQuotes.length;j++){
						if(!plusOne){
							// If we're replacing the last bar then we want to save any series and study data, otherwise comparisons will [briefly] disappear during refreshes
							//Preserve any relevant data from prior fetched quote for this bar.
							//Here we are assuming that the data being appended to masterData is a data update, perhaps from only one exchange, while
							//the existing masterData is a consolidated quote. We trust the quote we had in masterData to have the more accurate
							//volume and open, and use the high/low from there in combination with the updated data's to determine the daily high/low.
							quote=appendQuotes[j];
							master=(masterData.length<i+j)?masterData[i+j]:null;
							if(master){
								if(!quote.Volume && master.Volume){
									quote.Volume=master.Volume;
								}
								if(!params.allowReplaceOHL){
									if(master.Open){
										quote.Open=master.Open;
									}
									if(master.High > quote.High){
										quote.High=master.High;
									}
									if(master.Low && master.Low < quote.Low){
										quote.Low=master.Low;
									}
								}
							//}else{
							//	advancing++; // This case happens if we have an array that overlaps the existing masterData
							}
							for(var field in this.chart.series){
								if(typeof quote[field]=="undefined" && master) quote[field]=master[field];
							}
							var panels=this.panels;
							for(var p in panels){
								var panel=panels[p];
								if(panel.studyQuotes){
									for(var sq in panel.studyQuotes){
										if(!panel.studyQuotes[sq]) continue;
										if(typeof quote[sq]=="undefined" && master) quote[sq]=master[sq];
									}
								}
							}
						}
						quote=masterData[i+j+plusOne]=appendQuotes[j];
						if(quote.DT) quote.Date=CIQ.yyyymmddhhmmssmmm(quote.DT);
						else quote.DT=CIQ.strToDateTime(quote.Date);
						if(quote.Volume && typeof quote.Volume !== "number") quote.Volume=parseInt(quote.Volume,10);
						if(!CIQ.ChartEngine.isDailyInterval(this.layout.interval)) this.setDisplayDate(quote);
					}
					break;
				}
				i--;
			}
			for(i in this.plugins){
				var plugin=this.plugins[i];
				if(plugin.display){
					if(plugin.appendMasterData) plugin.appendMasterData(this, appendQuotes, chart);
				}
			}
		}
		if(!this.masterData || !this.masterData.length)
			this.masterData=masterData;
		if(!params.noCreateDataSet){
			var sp=this.streamParameters;
			if(++sp.count>sp.maxTicks || params.bypassGovernor){
				clearTimeout(sp.timeout);
				this.createDataSet();
				this.draw();
				this.updateChartAccessories();
				sp.count=0;
				sp.timeout=-1;
			//	sp.lastDraw=newDate;
			}else{
				var self=this;
				if(sp.timeout==-1){
					sp.timeout=setTimeout(function(){
							self.createDataSet();
							self.draw();
							self.updateChartAccessories();
							self.streamParameters.count=0;
							self.streamParameters.timeout=-1;
						},sp.maxWait);
				}
			}
		}
		this.runAppend("appendMasterData", arguments);
	};





	/**
	 * Sets the maximimum number of ticks to the requested number. This is effected by changing the candleWidth.
	 * See also {@link CIQ.ChartEngine#setCandleWidth}.
	 *
	 * **Note**: if calling `setMaxTicks()` before `newChart()`, and the chart will result in a candle width less than `minimumCandleWidth`, `newChart()` will reset the candle size to the default candle size (8 pixels).
	 *
	 * @param {number} ticks The number of ticks wide to set the chart.
	 * @param {object} params optional Parameters to use with this function.
	 * @param {number} params.padding Whitespace in pixels to add to the right of the chart.
	 * 									Setting this field will home the chart to the most recent tick.
	 * 									To home the chart without padding the right side with whitespace, set padding to 0.
	 * 									Omitting the padding field will keep the chart scrolled to the same position.
	 * @since 2015-11-1 - params added
	 * @memberOf CIQ.ChartEngine
	 * @example
	 * stxx.setMaxTicks(300);
	 * stxx.home();	// home() is preferred over draw() in this case to ensure the chart is properly aligned to the right most edge.
	 */
	CIQ.ChartEngine.prototype.setMaxTicks=function(ticks, params){
		if(!params) params={};
		ticks=Math.round(ticks);
		if(ticks<2) ticks=2;
		var pad=params.padding?params.padding:0;
		this.layout.candleWidth=(this.chart.width-pad)/ticks;
		if(!this.layout.candleWidth) this.layout.candleWidth=8;	// Zero candlewidth can only occur if the chart has no width. This might happen if the chart is in a hidden iframe
		this.chart.maxTicks=Math.round((this.chart.width/this.layout.candleWidth)-0.499);
		if(params.padding || params.padding===0) this.chart.scroll=ticks+1; // If padding, then by definition we're homing
	};

	/**
	 * Private construction of the chart object. This is called from the actual constructor
	 * for CIQ.ChartEngine.
	 * @private
	 * @memberOf  CIQ.ChartEngine
	 * @since 07/01/2015
	 */
	CIQ.ChartEngine.prototype.construct=function(){
		this.stackPanel("chart", "chart", 1);
		this.adjustPanelPositions();
		this.chart.panel=this.panels[this.chart.name];
		this.cx=0;
		this.cy=0;
		this.micropixels=0;
		this.chart.panel.subholder.appendChild(this.controls.home);
		this.callbackListeners={};
		this.longHoldTime=1000;
	};


	/**
	 * Add a listener for an emitted chart event. Events are tracked in the `CIQ.ChartEngine.callbackListeners` object.
	 * @param {string}   type The event to listen for
	 * @param {Function} cb   Function to call when event is called
	 * @return {Object}       Object that can be passed to {@link CIQ.ChartEngine#removeEventListener}
	 * @memberOf  CIQ.ChartEngine
	 * @since 04-2016-08
	 */
	CIQ.ChartEngine.prototype.addEventListener=function(type, cb){
		if(!type) type="*";
		var arr=this.callbackListeners[type];
		if(!arr) this.callbackListeners[type]=arr=[];
		arr.push(cb);
		return {type:type, cb:cb};
	};

	/**
	 * Remove a listener for an emitted chart event. Events are tracked in the `CIQ.ChartEngine.callbackListeners` object.
	 * @param  {Object}   obj Object from {@link CIQ.ChartEngine#addEventListener}
	 * @memberOf  CIQ.ChartEngine
	 * @since 04-2016-08
	 */
	CIQ.ChartEngine.prototype.removeEventListener=function(obj, cb){
		if(typeof obj!="object"){
			// allow the same arguments as "addEventListener"
			obj={
				type: obj,
				cb: cb
			};
		}
		if(!obj.type) obj.type="*";
		var arr=this.callbackListeners[obj.type];
		if(!arr) return;
		for(var i=0;i<arr.length;i++){
			if(arr[i]===obj.cb){
				arr.splice(i);
				if(!arr.length) obj[obj.type]=null;
				return;
			}
		}
	};

	/**
	 * Dispatches an event
	 * @memberOf  CIQ.ChartEngine
	 * @private
	 */
	CIQ.ChartEngine.prototype.dispatch=function(type, data){
		if(this.callbacks[type]) this.callbacks[type].call(this, data);
		var arr=this.callbackListeners[type];
		if(arr){
			for(var i=0;i<arr.length;i++)
				arr[i].call(this, data);
		}
		arr=this.callbackListeners["*"];
		if(arr){
			for(var j=0;j<arr.length;j++)
				arr[j].call(this, data);
		}
	};

	/**
	 * Removes the yAxis from the panel if it is not being used by any current renderers. This could be the case
	 * if a renderer has been removed. It could also be the case if a renderer is not attached to any series.
	 * @param  {CIQ.ChartEngine.Panel} panel The panel
	 * @param  {CIQ.ChartEngine.YAxis} yAxis The axis to be removed
	 * @memberOf CIQ.ChartEngine
	 * @since 07/01/2015
	 */
	CIQ.ChartEngine.prototype.deleteYAxisIfUnused=function(panel, yAxis){
		if(!yAxis) return;
		if(yAxis===panel.yAxis) return;
		for(var r in this.chart.seriesRenderers){
			var renderer=this.chart.seriesRenderers[r];
			if(renderer.params.yAxis===yAxis){
				if(renderer.seriesParams.length!==0) return;
			}
		}
		var i;
		for(i=0;i<panel.yaxisLHS.length;i++){
			if(panel.yaxisLHS[i]===yAxis) panel.yaxisLHS.splice(i,1);
		}
		for(i=1;i<panel.yaxisRHS.length;i++){
			if(panel.yaxisRHS[i]===yAxis) panel.yaxisRHS.splice(i,1);
		}
		this.resizeCanvas();
		this.adjustPanelPositions();
	};

	/**
	 * Adds a yAxis to the specified panel. If the yAxis already exists then nothing is done.
	 * @param {CIQ.ChartEngine.Panel} panel The panel to add (i.e. stxx.chart.panel)
	 * @param {CIQ.ChartEngine.YAxis} yAxis The YAxis to add (create with new CIQ.ChartEngine.YAxis)
	 * @memberOf  CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.addYAxis=function(panel, yAxis){
		if(!yAxis) return;
		if(!panel.yaxisLHS){ // initialize the arrays of y-axis. This will only happen once.
			panel.yaxisLHS=[];
			panel.yaxisRHS=[];
			// Our default y-axis goes into the array
			if(panel.yAxis.position=="right") panel.yaxisRHS.push(panel.yAxis);
			else panel.yaxisLHS.push(panel.yAxis);
		}
		var arr=panel.yaxisLHS.concat(panel.yaxisRHS);
		for(var i=0;i<arr.length;i++){
			if(arr[i]===yAxis) return;
		}
		if(yAxis.position==="left"){
			panel.yaxisLHS.unshift(yAxis);
		}else{
			yAxis.position="right";
			panel.yaxisRHS.push(yAxis);
		}
		this.preAdjustScroll();
		this.resizeCanvas();
		this.adjustPanelPositions();
		this.postAdjustScroll();
	};
	/**
	 * This method calculates the left and width members of each y-axis. Never call this directly. Instead call resizeCanvas().
	 * @private
	 * @memberOf  CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.calculateYAxisPositions=function(){
		// We push all the charts to the fore because panel widths will depend on what is calculated for their chart
		var panelsInOrder=[];
		for(var chartName in this.charts){
			panelsInOrder.push(chartName);
		}
		for(var panelName in this.panels){
			var p=this.panels[panelName];
			if(p.name===p.chart.name) continue;
			panelsInOrder.push(panelName);
		}

		for(var j=0;j<panelsInOrder.length;j++){
			var panel=this.panels[panelsInOrder[j]];
			if(!panel) continue; // this could happen if a chart panel doesn't exist yet (for instance when importLayout)
			var isAChart=panel.name===panel.chart.name;
			if(!panel.yaxisLHS){ // initialize the arrays of y-axis. This will only happen once.
				panel.yaxisLHS=[];
				panel.yaxisRHS=[];
				// Our default y-axis goes into the array
				if(panel.name===panel.chart.name || panel.yAxis.position){ // If the yaxis position is specified or if this is a chart panel
					if(panel.yAxis.position=="left") panel.yaxisLHS.push(panel.yAxis);
					else panel.yaxisRHS.push(panel.yAxis); // If a chart panel and position not specified then default to rhs
				}else{
					// Unless specified, the y-axis position for panels will follow the chart default
					var position=panel.chart.panel.yAxis.position; // get default position of the yaxis for the chart
					if(!position || position=="right") panel.yaxisRHS.push(panel.yAxis);
					else panel.yaxisLHS.push(panel.yAxis);
				}
			}
			if(!panel.yAxis.width && panel.yAxis.width!==0) panel.yAxis.width=this.yaxisWidth; // legacy default for main axis

			// Calculate the total amount of space to be allocated to the yaxis
			panel.yaxisTotalWidthRight=0;
			var i, yaxis;
			panel.yaxisTotalWidthLeft=0;
			for(i=0;i<panel.yaxisLHS.length;i++){
				yaxis=panel.yaxisLHS[i];
				panel.yaxisTotalWidthLeft+=yaxis.width;

				// justifyRight will default to however the chart panel is set. If that is null, then yes, justifyRight
				yaxis.justifyRight=(yaxis.justifyRight===null?panel.chart.yAxis.justifyRight:yaxis.justifyRight);
				if(yaxis.justifyRight===null) yaxis.justifyRight=true;
			}
			for(i=0;i<panel.yaxisRHS.length;i++){
				yaxis=panel.yaxisRHS[i];
				panel.yaxisTotalWidthRight+=yaxis.width;
			}

			// Now calculate the position of each axis within the canvas
			var x=0;
			for(i=0;i<panel.yaxisLHS.length;i++){
				yaxis=panel.yaxisLHS[i];
				yaxis.left=x;
				x+=yaxis.width;
			}
			x=this.width-panel.yaxisTotalWidthRight;
			for(i=0;i<panel.yaxisRHS.length;i++){
				yaxis=panel.yaxisRHS[i];
				yaxis.left=x;
				x+=yaxis.width;
			}


			if(typeof this.yaxisLeft!="undefined") panel.chart.yaxisPaddingRight=this.yaxisLeft; // support legacy use of yaxisLeft
			// Calculate the padding. This is enough space for the y-axis' unless overridden by the developer.
			panel.yaxisCalculatedPaddingRight=panel.yaxisTotalWidthRight;
			if(panel.chart.yaxisPaddingRight || panel.chart.yaxisPaddingRight===0) panel.yaxisCalculatedPaddingRight=panel.chart.yaxisPaddingRight;
			panel.yaxisCalculatedPaddingLeft=panel.yaxisTotalWidthLeft;
			if(panel.chart.yaxisPaddingLeft || panel.chart.yaxisPaddingLeft===0) panel.yaxisCalculatedPaddingLeft=panel.chart.yaxisPaddingLeft;

			if(isAChart){
				panel.left=panel.yaxisCalculatedPaddingLeft;
				panel.right=this.width-panel.yaxisCalculatedPaddingRight;
			}else{
				panel.left=panel.chart.panel.left;
				panel.right=panel.chart.panel.right;
			}
			panel.width=panel.right-panel.left;
			panel.handle.style.left=panel.left+"px";
			panel.handle.style.width=panel.width+"px";

			if(isAChart){
				// Store this in the chart too
				panel.chart.left=panel.left;
				panel.chart.right=panel.right;
				panel.chart.width=panel.right-panel.left;
			}
		}
	};

	/**
	 * Initializes a new chart. This is called by {@link CIQ.ChartEngine#newChart}. This method initializes the chart container events
	 * and various internal variables. It also initializes the canvas and creates the chart panel.
	 *
	 * Note that the candle width will be rest to 8px if larger than 50px. Even if the value comes from a layout import. This is done to ensure a reasonable candle size is available across devices that may have different screen size.
	 *
	 * @param  {HTMLElement} [container] The container object. Note, it is preferred to set this in the constructor for CIQ.ChartEngine.
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.initializeChart=function(container){
		if(this.runPrepend("initializeChart", arguments)) return;
		if (!this.chart.symbolObject.symbol) this.chart.symbolObject.symbol = this.chart.symbol;	// for backwards compatibility so the symbol object is allways initialized in case we don't use newChart()
		if(this.locale) this.setLocale(this.locale);
		if(!this.displayZone && CIQ.ChartEngine.defaultDisplayTimeZone){
			this.setTimeZone(null, CIQ.ChartEngine.defaultDisplayTimeZone);
		}
		this.calculateYAxisPositions();
		this.micropixels=0;

		if(container) this.chart.container=container;
		else container=this.chart.container;
		container.stx=this;
		if(!container.CIQRegistered){
			container.CIQRegistered=true;
			CIQ.ChartEngine.registeredContainers.push(container);
		}
		if(CIQ.isSurface){
			if(!this.gesture){
				this.gesture=new MSGesture();
				if(this.manageTouchAndMouse){
					this.gesture.target=container;
				}else{
					this.gesture.target=document.body;
				}
				this.gesturePointerId=null;
			}
		}
		this.registerHTMLElements();			// Sets all of the internal HTML elements to those in the container
		var canvas=this.chart.canvas, tempCanvas=this.chart.tempCanvas, floatCanvas=this.floatCanvas;
		if(canvas && document.createElement("canvas").getContext){
			if(!canvas.id){	//Don't play with canvases which have id's since you don't own them
				container.removeChild(canvas);
				this.chart.canvas=null;
			}
			if(tempCanvas && !tempCanvas.id){
				container.removeChild(tempCanvas);
				this.chart.tempCanvas=null;
			}
			if(floatCanvas && !floatCanvas.id){
				container.removeChild(floatCanvas);
				this.floatCanvas=null;
			}
		}else{
			// Just make sure the candleWidth is sane
			if(this.layout.candleWidth<this.minimumCandleWidth) this.layout.candleWidth=this.minimumCandleWidth;
			if(this.layout.candleWidth>200) this.layout.candleWidth=8;
		}

		if(!this.chart.canvas) canvas=this.chart.canvas=document.createElement("canvas");
		if(!this.chart.canvas.getContext){
			canvas=this.chart.canvas=container.querySelectorAll("#ie8canvas")[0];
			if(!canvas.getContext){	//IE8, didn't initialize canvas yet, we will do manually
				if(window.G_vmlCanvasManager) G_vmlCanvasManager.initElement(canvas);
			}
			canvas.style.display="block";
		}else{
			container.appendChild(canvas);
		}
		canvas.style.position="absolute";
		canvas.style.left="0px";
		var ctx=canvas.context=this.chart.context=canvas.getContext("2d");

		ctx.lineWidth=1;

		if(!this.chart.tempCanvas) tempCanvas=this.chart.tempCanvas=document.createElement("canvas");
		if(!this.chart.tempCanvas.getContext){
			tempCanvas=this.chart.tempCanvas=container.querySelectorAll("#ie8canvasTemp")[0];
			if(!tempCanvas.getContext){	//IE8, didn't initialize canvas yet, we will do manually
				if(window.G_vmlCanvasManager) G_vmlCanvasManager.initElement(tempCanvas);
			}
			tempCanvas.style.display="block";
		}else{
			container.appendChild(tempCanvas);
		}

		tempCanvas.style.position="absolute";
		tempCanvas.style.left="0px";
		tempCanvas.context=this.chart.tempCanvas.getContext("2d");
		tempCanvas.context.lineWidth=1;

		if(!this.floatCanvas) floatCanvas=this.floatCanvas=document.createElement("canvas");
		if(!this.floatCanvas.getContext){
			floatCanvas=this.floatCanvas=container.querySelectorAll("#ie8canvasFloat")[0];
			if(!floatCanvas.getContext){  //IE8, didn't initialize canvas yet, we will do manually
				if(window.G_vmlCanvasManager) G_vmlCanvasManager.initElement(floatCanvas);
			}
			floatCanvas.style.display="block";
		}else{
			container.appendChild(floatCanvas);
		}

		floatCanvas.style.position="absolute";
		floatCanvas.style.left="0px";
		floatCanvas.context=floatCanvas.getContext("2d");
		floatCanvas.context.lineWidth=1;

		this.resizeCanvas();

		if(CIQ.isAndroid){
			this.chart.tempCanvas.ontouchstart=function(e){
				if(e.preventDefault) e.preventDefault();
			};
			this.floatCanvas.ontouchstart=function(e){
				if(e.preventDefault) e.preventDefault();
			};
		}

		var chart=this.chart, panels=this.panels;
		panels.chart.display=chart.symbol;
		if(chart.symbolDisplay) panels.chart.display=chart.symbolDisplay;
		this.adjustPanelPositions();
		this.chart.panel=panels[chart.name];
		this.calculateYAxisMargins(chart.panel.yAxis);

		this.initialWhitespace=this.preferences.whitespace;
		if(chart.dataSet && chart.dataSet.length>0){
			chart.scroll=Math.floor(chart.width/this.layout.candleWidth);//this.chart.maxTicks;
			var wsInTicks=Math.round(this.preferences.whitespace/this.layout.candleWidth);
			chart.scroll-=wsInTicks;
		}
		if(CIQ.touchDevice){
			var overlayEdit=$$$(".overlayEdit", container);
			var overlayTrashCan=$$$("#overlayTrashCan", container);
			var vectorTrashCan=$$$("#vectorTrashCan", container);
			if(overlayEdit){
				CIQ.safeClickTouch(overlayEdit, (function(self){ return function(e){self.deleteHighlighted(true, true);};})(this));
				if(overlayTrashCan){
					CIQ.safeClickTouch(overlayTrashCan, (function(self){ return function(e){self.deleteHighlighted(false);};})(this));
				}
			}else if(overlayTrashCan){
				CIQ.safeClickTouch(overlayTrashCan, (function(self){ return function(e){self.deleteHighlighted(true);};})(this));
			}
			if(vectorTrashCan){
				CIQ.safeClickTouch(vectorTrashCan, (function(self){ return function(e){self.deleteHighlighted(true);};})(this));
			}
		}
		if(this.manageTouchAndMouse){
			this.registerTouchAndMouseEvents();
		}
		container.onmouseout=(function(self){return function(e){self.handleMouseOut(e);};})(this);

		if(this.controls.chartControls){
			this.controls.chartControls.style.display="block";
		}
		this.abortDrawings();
		this.undoStamps=[];
		for(var panelName in panels){
			var panel=panels[panelName];
			if(panel.markerHolder){
				container.removeChild(panel.markerHolder);
				panel.markerHolder=null;
			}
		}
		for(var i in this.plugins){
			var plugin=this.plugins[i];
			if(plugin.display){
				if(plugin.initializeChart) plugin.initializeChart(this);
			}
		}
		// This sets a resize listener for when the screen itself is resized.
		if(!this.resizeListenerInitialized){
			this.resizeListenerInitialized=true;
			var closure=function(self){
				return function(e){
					self.resizeChart();
				};
			};
			if(window.attachEvent){
				window.attachEvent("onresize", closure(this));
			}else{
				var c=closure(this);
				window.addEventListener("resize", c, true);
				this.eventListeners.push({"element": window, "event":"resize", "function":c});
			}
		}
		if(chart.baseline.userLevel) chart.baseline.userLevel=null;
		// This sets the interval timer which checks fore resize condition every X milliseconds (if non zero)
		this.setResizeTimer(this.resizeDetectMS);
		this.runAppend("initializeChart", arguments);
	};

	/**
	 * Clears out a chart, eliminating all references including the resizeTimer, quoteDriver, styles and eventListeners.
	 * To destroy the complete chart and related UI use {@link CIQ.destroy}
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.destroy=function(){
		this.setResizeTimer(0);
		if(this.quoteDriver) this.quoteDriver.die();
		this.styles={}; // Get rid of any external style references that could cause us to hang around
		for(var i=0;i<this.eventListeners.length;i++){
			var listener=this.eventListeners[i];
			listener.element.removeEventListener(listener.event, listener["function"]);
		}
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * This is called whenever the mouse leaves the chart area. Crosshairs are disabled, stickies are hidden, dragDrawings are completed.
	 * @param  {Event} e The mouseout event
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias handleMouseOut
	 */
	CIQ.ChartEngine.prototype.handleMouseOut=function(e){
		e = e || window.event;
		if(!CIQ.withinElement(this.chart.container, e.pageX, e.pageY)){
			if(this.runPrepend("handleMouseOut", arguments)) return;
			this.undisplayCrosshairs();
			// Added 9/19/2013 to unleash grabbing when the mouse moves out of the container
			this.grabbingScreen=false;
			this.touches=[];
			this.touching=false;
			if(this.activeDrawing && this.userPointerDown){	 //end the drawing
				this.userPointerDown=false;
				this.drawingLine=false;
				var cy=this.backOutY(e.pageY);
				var cx=this.backOutX(e.pageX);
				this.drawingClick(this.currentPanel, cx, cy);
			}
			CIQ.ChartEngine.insideChart=false;
			// Added to remove sticky when the mouse moves out of the container
			this.displaySticky();
			this.runAppend("handleMouseOut", arguments);
		}
	};

	/**
	 * Registers touch and mouse events for the chart (for dragging, clicking, zooming). The events are registered on the container div (not the canvas).
	 * Set this.manageTouchAndMouse to false to disable the built in event handling (events will not be registered with the container).
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.registerTouchAndMouseEvents=function(){
		if(this.touchAndMouseEventsRegistered) return;
		this.touchAndMouseEventsRegistered=true;
		var el=this.chart.container;
		var homeEl=$$$("#home", this.controls.chartControls);
		var zoomInEl=$$$("#zoomIn", this.controls.chartControls);
		var zoomOutEl=$$$("#zoomOut", this.controls.chartControls);
		if(!CIQ.touchDevice){
			el.addEventListener("mousemove", (function(self){return function(e){self.mousemove(e);};})(this), false);
			el.addEventListener("mousedown", (function(self){return function(e){self.mousedown(e);};})(this), false);
			el.addEventListener("mouseup", (function(self){return function(e){self.mouseup(e);};})(this), false);
		}else{
			if(CIQ.isSurface){
				el.addEventListener("mousemove", (function(self){return function(e){self.msMouseMoveProxy(e);};})(this), false);
				el.addEventListener("mousedown", (function(self){return function(e){self.msMouseDownProxy(e);};})(this), false);
				el.addEventListener("mouseup", (function(self){return function(e){self.msMouseUpProxy(e);};})(this), false);

				if(window.navigator.msPointerEnabled){
					el.addEventListener("MSPointerDown", (function(self){return function(e){return self.startProxy(e);};})(this), false);
					el.addEventListener("MSGestureStart", (function(self){return function(e){self.gestureInEffect=true;};})(this), false);
					el.addEventListener("MSGestureChange", (function(self){return function(e){return self.touchmove(e);};})(this), false);
					el.addEventListener("MSGestureEnd", (function(self){return function(e){self.gestureInEffect=false;return self.touchend(e);};})(this), false);
					el.addEventListener("MSPointerMove", (function(self){return function(e){self.moveProxy(e);};})(this), false);
					el.addEventListener("MSPointerUp", (function(self){return function(e){ return self.endProxy(e);};})(this), false);
				}else{
					el.addEventListener("pointerdown", (function(self){return function(e){return self.startProxy(e);};})(this), false);
					el.addEventListener("MSGestureStart", (function(self){return function(e){self.gestureInEffect=true;};})(this), false);
					el.addEventListener("MSGestureChange", (function(self){return function(e){return self.touchmove(e);};})(this), false);
					el.addEventListener("MSGestureEnd", (function(self){return function(e){self.gestureInEffect=false;return self.touchend(e);};})(this), false);
					el.addEventListener("pointermove", (function(self){return function(e){self.moveProxy(e);};})(this), false);
					el.addEventListener("pointerup", (function(self){return function(e){ return self.endProxy(e);};})(this), false);
				}
			}else{
				// We need mouse events for all-in-one computers that accept both mouse and touch commands
				// Actually, only for Firefox and Chrome browsers. IE10 sends pointers which are managed by the isSurface section
				if(!CIQ.isAndroid && !CIQ.ipad && !CIQ.iphone){
					el.addEventListener("mousemove", (function(self){return function(e){self.iosMouseMoveProxy(e);};})(this), false);
					el.addEventListener("mousedown", (function(self){return function(e){self.iosMouseDownProxy(e);};})(this), false);
					el.addEventListener("mouseup", (function(self){return function(e){self.iosMouseUpProxy(e);};})(this), false);
				}

				el.addEventListener("touchstart", (function(self){return function(e){self.touchstart(e);};})(this), false);
				el.addEventListener("touchmove", (function(self){return function(e){self.touchmove(e);};})(this), false);
				el.addEventListener("touchend", (function(self){return function(e){self.touchend(e);};})(this), false);

				if(zoomInEl){
					zoomInEl.removeAttribute("onMouseOver");
					zoomInEl.removeAttribute("onMouseOut");
				}
				if(zoomOutEl){
					zoomOutEl.removeAttribute("onMouseOver");
					zoomOutEl.removeAttribute("onMouseOut");
				}
			}
		}

		var wheelEvent = ("wheel" in document.createElement("div") || "onwheel" in document) ? "wheel" :
			document.onmousewheel !== undefined ? "mousewheel" :
			"DOMMouseScroll";
		if(CIQ.isIE) wheelEvent="wheel";

		el.addEventListener(wheelEvent, (function(self, wheelEvent){return function(e){self.mouseWheel(e, wheelEvent);};})(this, wheelEvent), false);

	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * This function is called when the user right clicks on a highlighted overlay, series or drawing.
	 * Calls deleteHighlighted() which calls rightClickOverlay() for studies.
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias rightClickHighlighted
	 */
	CIQ.ChartEngine.prototype.rightClickHighlighted=function(){
		if(this.runPrepend("rightClickHighlighted", arguments)) return;
		this.deleteHighlighted(true);
		this.runAppend("rightClickHighlighted", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Removes any and all highlighted overlays, series or drawings.
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias deleteHighlighted
	 */
	CIQ.ChartEngine.prototype.deleteHighlighted=function(callRightClick, forceEdit){
		if(this.runPrepend("deleteHighlighted", arguments)) return;
		this.cancelTouchSingleClick=true;
		CIQ.clearCanvas(this.chart.tempCanvas, this);
		for(var i=this.drawingObjects.length-1;i>=0;i--){
			var drawing=this.drawingObjects[i];
			if(drawing.highlighted && !drawing.permanent){
				var dontDeleteMe=drawing.abort();
				if(!dontDeleteMe){
					var before=CIQ.shallowClone(this.drawingObjects);
					this.drawingObjects.splice(i,1);
					this.undoStamp(before, CIQ.shallowClone(this.drawingObjects));
				}
				this.changeOccurred("vector");
			}
		}
		for(var name in this.overlays){
			var o=this.overlays[name];
			if(o.highlight && !o.permanent){
				if(callRightClick || forceEdit) this.rightClickOverlay(name, forceEdit);
				else this.removeOverlay(name);
			}
		}

		var chart=this.currentPanel.chart;
		for(var r in chart.seriesRenderers){
			var renderer=chart.seriesRenderers[r];
			for(var sp=renderer.seriesParams.length-1;sp>=0;sp--){
				var series=renderer.seriesParams[sp];
				if(series.highlight && !series.permanent) {
					renderer.removeSeries(series.field);
				}
			}
		}
		var comparing=false;
		for(var s in chart.series){
			if(chart.series[s].parameters.isComparison) comparing=true;
		}
		if(!comparing) this.setComparison(false, chart);

		this.draw();
		if(this.controls.mSticky){
			this.controls.mSticky.style.display="none";
			this.controls.mSticky.children[0].innerHTML="";
		}
		this.runAppend("deleteHighlighted", arguments);
	};

	/**
	 * Returns true if the panel exists
	 * @param  {string} name Name of panel to search for
	 * @return {boolean}	  True if the panel exists
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.panelExists=function(name){
		for(var p in this.panels){
			var panel=this.panels[p];
			if(panel.name==name) return true;
		}
		return false;
	};

	/**
	 * Turns crosshairs off
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.hideCrosshairs=function(){
		this.displayCrosshairs=false;
	};

	/**
	 * Turns crosshairs on
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.showCrosshairs=function(){
		this.displayCrosshairs=true;
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Event handler that is called when the handle of a panel is grabbed, for resizing
	 * @param  {Event} e	 The mousedown or touchdown event
	 * @param  {CIQ.ChartEngine.Panel} panel The panel that is being grabbed
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias grabHandle
	 */
	CIQ.ChartEngine.prototype.grabHandle=function(panel){
		if(this.runPrepend("grabHandle", arguments)) return ;
		//if(e.preventDefault) e.preventDefault();
		if(!panel) return;
		CIQ.ChartEngine.crosshairY=panel.top+this.top;
		CIQ.ChartEngine.resizingPanel=panel;
		this.drawTemporaryPanel();
		CIQ.appendClassName(panel.handle, "stx-grab");
		this.runAppend("grabHandle", arguments);
	};

	/**
	 * Event handler that is called when a panel handle is released.
	 * @param  {Event} e The mouseup or touchup event
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias releaseHandle
	 */
	CIQ.ChartEngine.prototype.releaseHandle=function(){
		if(this.runPrepend("releaseHandle", arguments)) return ;
		//if(e.preventDefault) e.preventDefault();
		CIQ.clearCanvas(this.chart.tempCanvas, this);
		this.resizePanels();
		if(CIQ.ChartEngine.resizingPanel) CIQ.unappendClassName(CIQ.ChartEngine.resizingPanel.handle, "stx-grab");
		CIQ.ChartEngine.resizingPanel=null;
		this.runAppend("releaseHandle", arguments);
	};

	/**
	 * Takes the existing panels and stores them in the layout.
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.storePanels=function(){
		if(!this.layout) this.layout={};
		var view=this.layout;
		view.panels={};
		for(var p in this.panels){
			var panel=this.panels[p];
			view.panels[panel.name]={
				"percent": panel.percent,
				"display": panel.display
			};
		}
	};

	/**
	 * Saves the panel state in the layout. Called whenever there is a change to panel layout (resizing, opening, closing).
	 * @param  {boolean} saveLayout If false then a change event will not be called. See (@link CIQ.ChartEngine#changeOccurred)
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.savePanels=function(saveLayout){
		this.storePanels();
		if(saveLayout!==false) this.changeOccurred("layout");
	};

	/**
	 * Returns the absolute screen position given a Y pixel on the canvas
	 * @param  {number} y Y pixel on the canvas
	 * @return {number}	  Absolute Y screen position
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.resolveY=function(y){
		return this.top + y;
	};

	/**
	 * Returns the absolute screen position given a X pixel on the canvas
	 * @param  {number} x X pixel on the canvas
	 * @return {number}	  Absolute X screen position
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.resolveX=function(x){
		return this.left + x;
	};

	/**
	 * Returns the relative canvas position given an absolute Y position on the screen
	 * @param  {number} y Y pixel on the screen
	 * @return {number}	  Relative Y position on canvas
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.backOutY=function(y){
		return y - this.top;
	};

	/**
	 * Returns the relative canvas position given an absolute X position on the screen
	 * @param  {number} x X pixel on the screen
	 * @return {number}	  Relative X position on canvas
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.backOutX=function(x){
		return x - this.left;
	};

	/**
	 * Cleans up a removed study. called by {@link CIQ.ChartEngine#privateDeletePanel} or {@link CIQ.ChartEngine#removeOverlay}
	 * Calls removeFN, removes tagalongquotefeed, and plugins associated with study.
	 * Finally, removes study from layout.
	 * @param  {object} stx A chart object
	 * @param  {object} sd  A study descriptor
	 * @memberOf CIQ.ChartEngine
	 * @private
	 * @since 2015-11-1
	 */
	CIQ.ChartEngine.prototype.cleanupRemovedStudy=function(sd){
		if(sd.libraryEntry){
			if(sd.libraryEntry.removeFN) sd.libraryEntry.removeFN(this,sd);
			if(sd.libraryEntry.feed && sd.libraryEntry.quoteFeed){
				this.detachTagAlongQuoteFeed(sd.libraryEntry.feed);
			}
		}
		// delete any plugins associated with this study
		for(var p in this.plugins){
			if(p.indexOf("{"+sd.id+"}")>-1) delete this.plugins[p];
		}
		if(this.layout.studies) delete this.layout.studies[sd.name];
	};

	/**
	 * Internal function for deleting a panel and its associated DOM objects
	 * Do not call directly. Always call panelClose
	 * @private
	 */
	CIQ.ChartEngine.prototype.privateDeletePanel=function(panel){
		if(this.layout.studies){
		var mySD=this.layout.studies[panel.name];
		if(mySD) this.cleanupRemovedStudy(mySD);
		}
		// If we ever want to delete any drawing objects in a panel
		/*var drawingDeleted=false;
		for(var i=0;i<this.drawingObjects.length;i++){
			var drawing=this.drawingObjects[i];
			if(this.panels[drawing.panelName]==panel){
				drawing.abort();
				this.drawingObjects.splice(i,1);
				drawingDeleted=true;
			}
		}*/
		delete this.panels[panel.name];
		if(CIQ.Studies){
			for(var spm in CIQ.Studies.studyPanelMap){
				if(CIQ.Studies.studyPanelMap[spm].panel==panel.name) delete CIQ.Studies.studyPanelMap[spm];
			}
		}
		for(var series in this.overlays){
			if(this.overlays[series].panel==panel.name){
				delete this.layout.studies[series];
				delete this.overlays[series];
				//delete CIQ.Studies.studyPanelMap[series];
			}
		}

		if(panel.holder){
			this.chart.container.removeChild(panel.holder);
			if(this.getMarkerArray){
				var arr=this.getMarkerArray("panelName", panel.name);
				for(var i=0;i<arr.length;i++){
					this.removeFromHolder(arr[i]);
				}
			}
		}
		panel.handle.parentNode.removeChild(panel.handle);
		//if(drawingDeleted) this.changeOccurred("vector");
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Closes the panel. This is called when a chart panel is closed manually or programatically.
	 * For example, after removing a study panel with the {@link CIQ.Studies.removeStudy} function, or when a user clicks on the "X" for a panel.
	 * @param  {CIQ.ChartEngine.Panel} panel The panel to close
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias panelClose
	 *
	 */
	CIQ.ChartEngine.prototype.panelClose=function(panel){
		if(!panel) return;
		if(this.runPrepend("panelClose", arguments)) return;
		this.cancelTouchSingleClick=true;
		CIQ.ChartEngine.drawingLine=false;
		if(panel.soloing) this.panelSolo(panel);

		// If we're deleting a panel with a chart in it
		if(this.charts[panel.name]){
			// Then delete all the panels that reference that chart
			for(var panelName in this.panels){
				var subPanel=this.panels[panelName];
				if(subPanel.chart.name==panel.name){
					this.privateDeletePanel(subPanel);
				}
			}
			// and delete the chart itself
			delete this.charts[panel.name];
		}else{
			// otherwise just delete the panel
			this.privateDeletePanel(panel);
		}
		this.showCrosshairs();
		this.createDataSet();
		this.adjustPanelPositions();
		this.draw();
		this.savePanels();
		this.runAppend("panelClose", arguments);
	};

	/**
	 * Deletes all of the panels (except for the default chart panel)
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.deleteAllPanels=function(){
		for(var p in this.panels){
			var panel=this.panels[p];
			this.privateDeletePanel(panel);
		}
		this.layout.panels={};
		this.panels={};
	};

	/**
	 * This moves a panel up one position (when the user clicks the up arrow).
	 * @param  {CIQ.ChartEngine.Panel} panel The panel to move up.
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.panelUp=function(panel){
		this.cancelTouchSingleClick=true;
		CIQ.ChartEngine.drawingLine=false;
		this.showCrosshairs();
		var newPanels={};
		var pos=0;
		var p;
		for(p in this.panels){
			if(p==panel.name) break;
			pos++;
		}

		if(!pos) return; //already at top

		var i=0;
		for(p in this.panels){
			if(i==pos-1) newPanels[panel.name]=panel;
			if(p==panel.name) continue;
			newPanels[p]=this.panels[p];
			i++;
		}
		this.panels=newPanels;
		this.adjustPanelPositions();
		this.draw();
		this.savePanels();
	};

	/**
	 * This moves a panel down one position (when the user clicks the down arrow).
	 * @param  {CIQ.ChartEngine.Panel} panel The panel to move down.
	 * @memberOf CIQ.ChartEngine
	 */

	CIQ.ChartEngine.prototype.panelDown=function(panel){
		this.cancelTouchSingleClick=true;
		CIQ.ChartEngine.drawingLine=false;
		this.showCrosshairs();
		var newPanels={};
		var pos=0;
		var p;
		for(p in this.panels){
			if(p==panel.name) break;
			pos++;
		}

		var length=0;
		for(p in this.panels)
			length++;
		if(pos==length-1) return; //already at bottom

		var i=0;
		for(p in this.panels){
			if(p==panel.name){
				i++;
				continue;
			}
			newPanels[p]=this.panels[p];
			if(i==pos+1) newPanels[panel.name]=panel;
			i++;
		}
		this.panels=newPanels;
		this.adjustPanelPositions();
		this.draw();
		this.savePanels();
	};

	/**
	 * This "solos" the panel (when the user clicks the solo button). All panels other than this panel and the chart
	 * are temporarily hidden. If the solo panel is the chart then all other panels will be hidden.
	 * @param  {CIQ.ChartEngine.Panel} panel The panel to be soloed.
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.panelSolo=function(panel){
		this.cancelTouchSingleClick=true;
		CIQ.ChartEngine.drawingLine=false;
		this.showCrosshairs();
		var hideOrNot=true;
		if(panel.soloing){
			hideOrNot=false;
			panel.soloing=false;
			CIQ.unappendClassName(panel.solo,"stx_solo_lit");
			panel.percent=panel.oldPercent;
			this.panels.chart.percent=this.panels.chart.oldPercent;
		}else{
			panel.soloing=true;
			CIQ.appendClassName(panel.solo,"stx_solo_lit");
			if(panel.name=="chart"){
				panel.oldPercent=panel.percent;
			}else{
				panel.oldPercent=panel.percent;
				this.panels.chart.oldPercent=this.panels.chart.percent;
				panel.percent=1-this.panels.chart.percent;

			}
		}
		for(var p in this.panels){
			this.panels[p].hidden=hideOrNot;
		}
		this.panels.chart.hidden=false;
		panel.hidden=false;
		this.adjustPanelPositions();
		this.draw();
		this.savePanels();
	};

	//@private
	CIQ.ChartEngine.prototype.calculatePanelPercent=function(panel){
		var h=panel.bottom-panel.top;
		panel.percent=h/this.chart.canvasHeight;
	};

	/**
	 * Called when the user moves a panel handle, to resize all of the panels relative to the movement.
	 * @private
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.resizePanels=function(){
		if(!CIQ.ChartEngine.resizingPanel) return;
		var up=true;
		var p,newY,priorPanel;
		if(CIQ.ChartEngine.crosshairY>this.resolveY(CIQ.ChartEngine.resizingPanel.top)) up=false;
		if(up){
			priorPanel=null;
			for(p in this.panels){
				if(this.panels[p]==CIQ.ChartEngine.resizingPanel) break;
				if(this.panels[p].hidden) continue;
				priorPanel=this.panels[p];
			}
			newY=this.backOutY(CIQ.ChartEngine.crosshairY);
			if(newY<priorPanel.top+30){
				newY=priorPanel.top+30;
				CIQ.ChartEngine.crosshairY=this.resolveY(newY);
			}
			priorPanel.bottom=newY;
			CIQ.ChartEngine.resizingPanel.top=newY;
			this.calculatePanelPercent(priorPanel);
			this.calculatePanelPercent(CIQ.ChartEngine.resizingPanel);
		}else{
			priorPanel=null;
			for(p in this.panels){
				if(this.panels[p]==CIQ.ChartEngine.resizingPanel) break;
				if(this.panels[p].hidden) continue;
				priorPanel=this.panels[p];
			}
			newY=this.backOutY(CIQ.ChartEngine.crosshairY);
			if(newY>CIQ.ChartEngine.resizingPanel.bottom-30){
				newY=CIQ.ChartEngine.resizingPanel.bottom-30;
				CIQ.ChartEngine.crosshairY=this.resolveY(newY);
			}
			priorPanel.bottom=newY;
			CIQ.ChartEngine.resizingPanel.top=newY;
			this.calculatePanelPercent(priorPanel);
			this.calculatePanelPercent(CIQ.ChartEngine.resizingPanel);
		}

		this.adjustPanelPositions();
		this.draw();
		this.savePanels();
	};

	// First, adjust the panel percentages so that they all add up to 1
	// Secondly, set the pixel top and bottom of each panel based on the percentages
	/**
	 * <span class="injection">INJECTABLE</span>
	 * Adjusts the positions of all of the panels. Ensures that panel percentages add up to 100%. Sets the panel top and bottom
	 * based on the percentages. Also sets the icon template icons appropriately for each panel's position. And adjusts
	 * any drawings. Finally it makes some calculations that are used by the y-axis.
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias adjustPanelPositions
	 */
	CIQ.ChartEngine.prototype.adjustPanelPositions=function(){
		if(!this.chart.symbol) return;
		if(this.runPrepend("adjustPanelPositions", arguments)) return;
		var lastBottom=0;
		var h=this.chart.canvasHeight;
		var pixels=0;
		var first=false;
		var acc=0;
		var n=0;
		var activeSolo=false;
		var x,panel;
		for(x in this.panels){
			panel=this.panels[x];
			if(isNaN(panel.percent) || panel.percent<=0) panel.percent=0.05;
			if(panel.hidden) continue;
			acc+=panel.percent;
			n++;
			if(panel.soloing) activeSolo=true;
		}

		for(x in this.panels){
			var zoomRatio=0;
			panel=this.panels[x];

			if(panel.hidden){
				if(panel.markerHolder){
					panel.markerHolder.style.display="none";
				}
				continue;
			}
			if(!first){
				first=true;
				panel.up.style.display="none";
			}else{
				if(this.displayIconsUpDown) panel.up.style.display="";
			}
			if(activeSolo){
				if(panel.soloing){
					if(this.displayIconsSolo) panel.solo.style.display="";
				}else{
					panel.solo.style.display="none";
				}
			}else if(n==1 || n==2){
				panel.solo.style.display="none";
			}else{
				if(this.displayIconsSolo) panel.solo.style.display="";
			}
			if(n==1){
				panel.down.style.display="none";
			}else{
				if(this.displayIconsUpDown) panel.down.style.display="";
			}
			if(panel.editFunction) panel.edit.style.display="";
			else panel.edit.style.display="none";

			panel.percent=panel.percent/acc;
			panel.top=lastBottom;
			panel.bottom=panel.top+(h*panel.percent);
			panel.height=panel.bottom-panel.top;
			if(panel.chart.name==panel.name){
				panel.chart.top=panel.top;
				panel.chart.bottom=panel.bottom;
				panel.chart.height=panel.height;
			}
			var yAxis=panel.yAxis;
			
			if(yAxis.zoom && yAxis.height>0){
				zoomRatio=yAxis.zoom/yAxis.height;
			}
			this.adjustYAxisHeightOffset(panel,yAxis);
			yAxis.top=panel.top+yAxis.topOffset;
			yAxis.bottom=panel.bottom-yAxis.bottomOffset;
			yAxis.height=yAxis.bottom-yAxis.top;
			if(zoomRatio){
				yAxis.zoom=zoomRatio*yAxis.height;
				if(yAxis.zoom>yAxis.height) {
					//console.log('adjustPanelPositions adjusted zoom and scroll to 0',yAxis.zoom,yAxis.height);
					yAxis.zoom=0; // If the zoom is greater than the height then we'll have an upside down y-axis
					yAxis.scroll=0;
				}
			}
			lastBottom=panel.bottom;

			if(!yAxis.high && yAxis.high!==0){	// panels without values will use percentages to position drawings
				yAxis.high=100;
				yAxis.low=0;
				yAxis.shadow=100;
			}
			yAxis.multiplier=yAxis.height/yAxis.shadow;

			if(panel.holder){
				panel.holder.style.right="0px";
				panel.holder.style.top=panel.top+"px";
				panel.holder.style.left="0px";
				panel.holder.style.height=panel.height+"px";

				panel.subholder.style.left=panel.left+"px";
				panel.subholder.style.width=panel.width+"px";
				panel.subholder.style.top="0px";
				if(yAxis.height>=0) panel.subholder.style.height=yAxis.height+"px";
			}
		}
		if(x) this.panels[x].down.style.display="none";
		if(n==2 && !activeSolo){
			this.panels.chart.solo.style.display="";
		}
		if(this.controls.chartControls && this.panels.chart)
			this.controls.chartControls.style.bottom=(this.chart.canvasHeight-this.panels.chart.bottom+22)+"px";
		this.clearPixelCache();

		this.adjustDrawings();

		this.runAppend("adjustPanelPositions", arguments);
	};


	//Unused
	CIQ.ChartEngine.prototype.addChart=function(name, chart){
		chart.name=name;
		this.charts[name]=chart;
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Create a new panel and make room for it by squeezing all the existing panels
	 * @param  {string} display	  The display name for the panel
	 * @param  {string} name	  The name of the panel (usually the study ID)
	 * @param  {number} [height]	Requested height of panel in pixels. Defaults to 1/5 of the screen size.
	 * @param  {string} [chartName] The chart to associate with this panel. Defaults to "chart".
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias createPanel
	 */
	CIQ.ChartEngine.prototype.createPanel=function(display, name, height, chartName){
		if(this.runPrepend("createPanel", arguments)) return;
		if(!chartName) chartName="chart";
		var h=this.chart.canvasHeight;
		if(!height){
			height=h*0.20;
		}
		var percent=height/h;
		var reduce=1-percent;
		for(var p in this.panels){
			var panel=this.panels[p];
			panel.percent*=reduce;
		}
		this.stackPanel(display, name, percent, chartName);
		this.adjustPanelPositions();
		this.savePanels(false);
		this.runAppend("createPanel", arguments);
	};

	/**
	 * Configures the panel controls
	 * @param  {CIQ.ChartEngine.Panel} panel The panel
	 * @private
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.configurePanelControls=function(panel){
		var isChart=(panel.name==panel.chart.name);

		panel.icons=$$$(".stx-panel-control", panel.holder);
		panel.close=panel.icons.children[4];
		panel.close=$$$(".stx-ico-close", panel.icons).parentNode;
		CIQ.appendClassName(panel.icons, "stx-show");

		panel.title=$$$(".stx-panel-title", panel.icons);
		panel.up=$$$(".stx-ico-up", panel.icons).parentNode;
		panel.solo=$$$(".stx-ico-focus", panel.icons).parentNode;
		panel.down=$$$(".stx-ico-down", panel.icons).parentNode;
		panel.edit=$$$(".stx-ico-edit", panel.icons).parentNode;

		if(!this.displayIconsUpDown) panel.up.style.display="none";
		if(!this.displayIconsUpDown) panel.down.style.display="none";
		if(!this.displayIconsSolo) panel.solo.style.display="none";
		if(!this.displayIconsClose){
			panel.close.style.display="none";
		}
		if(!this.displayPanelResize) panel.handle.style.display="none";

		panel.title.innerHTML="";
		panel.title.appendChild(document.createTextNode(panel.display));
		if(isChart){
			CIQ.appendClassName(panel.title,"chart-title");
			CIQ.appendClassName(panel.icons,"stx-chart-panel");
		}
		if(!CIQ.touchDevice || CIQ.isSurface) panel.icons.onmouseover=(function(self){ return function(e){self.hideCrosshairs();};})(this);
		if(!CIQ.touchDevice || CIQ.isSurface) panel.icons.onmouseout=(function(self){ return function(e){self.showCrosshairs();};})(this);

		if(!CIQ.touchDevice || CIQ.isSurface) panel.handle.onmouseover=(function(self){ return function(){self.hideCrosshairs();};})(this);
		if(!CIQ.touchDevice || CIQ.isSurface) panel.handle.onmouseout=(function(self){ return function(){self.showCrosshairs();};})(this);
		if(CIQ.touchDevice){
			panel.handle.ontouchstart=(function(stx,panel){return function(e){if(stx.resizingPanel) return; e.preventDefault(); stx.grabHandle(panel);};})(this, panel);
			panel.handle.ontouchend=(function(stx){return function(e){e.preventDefault(); stx.releaseHandle();};})(this);
		}
		panel.handle.onmousedown=(function(stx, panel){return function(e){if(!e) e=event; stx.grabHandle(panel);};})(this, panel);
		panel.handle.onmouseup=(function(stx){return function(e){if(!e) e=event; stx.releaseHandle();};})(this);
		CIQ.safeClickTouch(panel.close,(function(stx, panel){return function(){ stx.panelClose(panel);};})(this, panel));
		CIQ.safeClickTouch(panel.up,(function(stx, panel){return function(){ stx.panelUp(panel);};})(this, panel));
		CIQ.safeClickTouch(panel.down,(function(stx, panel){return function(){ stx.panelDown(panel);};})(this, panel));
		CIQ.safeClickTouch(panel.solo,(function(stx, panel){return function(){ stx.panelSolo(panel);};})(this, panel));
		if(panel.name=="chart") panel.close.style.display="none"; // never close primary chart
	};
	/**
	 * <span class="injection">INJECTABLE</span>
	 * Adds a panel with a prespecified percentage. This should be called iteratively when rebuilding a set
	 * of panels from a previous layout. Use {@link CIQ.ChartEngine#createPanel} when creating a new panel for an existing chart layout.
	 * @param  {string} display	  The display name for the panel
	 * @param  {string} name	  The name of the panel (usually the study ID)
	 * @param  {number} percent	  The percentage of chart to use
	 * @param  {string} [chartName] The chart to associate with this panel. Defaults to "chart".
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias stackPanel
	 */
	CIQ.ChartEngine.prototype.stackPanel=function(display, name, percent, chartName){
		if(this.runPrepend("stackPanel", arguments)) return;
		if(!chartName) chartName="chart";
		var chart=this.charts[chartName];
		var isChart=(name==chartName);
		var yAxis=null;
		if(isChart){
			display=chart.symbol;
			if(chart.symbolDisplay) display=chart.symbolDisplay;
			yAxis=chart.yAxis;
		}
		var panel=this.panels[name]=new CIQ.ChartEngine.Panel(name, yAxis);
		if(!isChart && chart.yAxis){
			panel.yAxis.width=chart.yAxis.width;// make it match the width of the main panel so the y axis align
		}

		panel.percent=percent;
		panel.chart=chart;
		panel.display=display;
		panel.holder=CIQ.newChild(this.container, "div", "stx-holder"); // the main holder extends to the edges of the panel
		panel.subholder=CIQ.newChild(panel.holder, "div", "stx-subholder"); // the sub holder does not include the axis area
		panel.subholder.style.zIndex=1;
		panel.holder.setAttribute("cq-panel-name", name);
		panel.subholder.setAttribute("cq-panel-name", name);
		var appendClass=isChart?"stx-panel-chart":"stx-panel-study";
		CIQ.appendClassName(panel.holder, appendClass);

		panel.subholder.appendChild(this.controls.iconsTemplate.cloneNode(true));
		panel.handle=this.controls.handleTemplate.cloneNode(true);
		this.container.appendChild(panel.handle);
		//panel.handle.style.display=""; // let the drawPanels manage this otherwise if we set to "" here but the developer wants a picture (png) handle using CSS, the hande will flicker on on initial load on the top of the screen
		panel.handle.id=null;
		panel.handle.panel=panel;

		this.configurePanelControls(panel);
		this.resizeCanvas();

		this.runAppend("stackPanel", arguments);
	};

	CIQ.ChartEngine.prototype.setPanelEdit=function(panel, editFunction){
		panel.editFunction=editFunction;
		CIQ.safeClickTouch(panel.edit, editFunction);
		this.adjustPanelPositions();
	};
	/**
	 * <span class="injection">INJECTABLE</span>
	 * <span class="animation">Animation Loop</span>
	 * Draws the panels for the chart and chart studies. CSS style stx_panel_border can be modified to change the color
	 * or width of the panel dividers.
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias drawPanels
	 */
	CIQ.ChartEngine.prototype.drawPanels=function(){
		if(this.runPrepend("drawPanels", arguments)) return;
		var first=false;
		for(var p in this.panels){
			var panel=this.panels[p];
			panel.axisDrawn=false;	// to prevent y-axis from being drawn multiple times -- a panel can have multiple studies

			if(panel.title.innerHTML!=panel.display){
				panel.title.innerHTML="";
				panel.title.appendChild(document.createTextNode(panel.display));
			}
			CIQ.appendClassName(panel.icons, "stx-show");
			if(panel.hidden){
				CIQ.unappendClassName(panel.icons,"stx-show");
				panel.handle.style.display="none";
				panel.holder.style.display="none";
				continue;
			}else{
				if(!this.displayIconsUpDown) panel.up.style.display="none";
				if(!this.displayIconsUpDown) panel.down.style.display="none";
				if(!this.displayIconsSolo) panel.solo.style.display="none";
				panel.holder.style.display="block";
			}
			if(!first){
				panel.handle.style.display="none";
				first=true;
				continue;
			}
			var y=panel.top;
			y=Math.round(y)+0.5;
			this.plotLine(panel.left, panel.right, y, y, this.canvasStyle("stx_panel_border"), "segment", this.chart.context, false, {});
			if(!this.displayPanelResize){
				panel.handle.style.display="none";
			}else{
				panel.handle.style.display="";
			}
			panel.handle.style.top=(y - panel.handle.offsetHeight/2) + "px";
			//panel.handle.style.left=panel.left+ "px";
		}
		this.runAppend("drawPanels", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * This method captures a tap event (single click) on a touch device. It supports both touch and pointer events.
	 * @param  {number} finger Which finger is pressed
	 * @param  {number} x	   X location on screen of the press
	 * @param  {number} y	   Y location on screen of the press
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias touchSingleClick
	 */
	CIQ.ChartEngine.prototype.touchSingleClick=function(finger, x, y){
		var self=this;
		var args=arguments;
		return function(){
			(function (){
				if(!this.cancelTouchSingleClick){
					if(this.runPrepend("touchSingleClick", args)) return;
					if(this.editingAnnotation) return;
					this.clicks={ s1MS: -1, e1MS: -1, s2MS: -1, e2MS: -1};
					if(!this.displayCrosshairs) return;
					if(!this.displayInitialized) return;	// No chart displayed yet
					if(this.openDialog!=="") return;
					if(x<this.left || x>this.right || y<this.top || y>this.bottom) return;
					var cy=this.backOutY(CIQ.ChartEngine.crosshairY);
					var cx=this.backOutX(CIQ.ChartEngine.crosshairX);
					this.currentPanel=this.whichPanel(cy);
					if(!CIQ.Drawing || !this.currentVectorParameters.vectorType || !CIQ.Drawing[this.currentVectorParameters.vectorType] || !(new CIQ.Drawing[this.currentVectorParameters.vectorType]()).dragToDraw){
						if(!this.drawingClick(this.currentPanel, cx, cy)){
							if(!this.layout.crosshair){
								//clear existing highlights?
								CIQ.ChartEngine.crosshairY=0;
								CIQ.ChartEngine.crosshairX=0;
								this.cx=this.backOutX(CIQ.ChartEngine.crosshairX);
								this.cy=this.backOutY(CIQ.ChartEngine.crosshairY);
								this.findHighlights();
								// find highlights for things we tapped on, exactly (not crosshair hover)
								CIQ.ChartEngine.crosshairY=y;
								CIQ.ChartEngine.crosshairX=x;
								var rect=this.container.getBoundingClientRect();
								this.top=rect.top;
								this.left=rect.left;
								this.right=this.left+this.width;
								this.bottom=this.top+this.height;
								this.cx=this.backOutX(CIQ.ChartEngine.crosshairX);
								this.cy=this.backOutY(CIQ.ChartEngine.crosshairY);
								if(this.currentPanel && this.currentPanel.chart.dataSet){
									this.crosshairTick=this.tickFromPixel(this.cx, this.currentPanel.chart);
									this.crosshairValue=this.adjustIfNecessary(this.currentPanel, this.crosshairTick, this.valueFromPixel(this.cy, this.currentPanel));
								}
								this.headsUpHR();
								this.findHighlights(true);
							}
						}
						if(!this.currentVectorParameters.vectorType){
							this.dispatch("tap", {stx:this, panel:this.currentPanel, x:cx, y:cy});
						}
					}
				}
				self.cancelTouchSingleClick=false;
				this.runAppend("touchSingleClick", args);
			}).apply(self,args);
		};
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * This method detects a double tap on a touch device. It circumvents {@link CIQ.ChartEngine#touchSingleClick}. Double taps
	 * are used to delete overlays, series or drawings on touch devices.
	 * It also resets the vertical zoom level (y axis) if tapping on an empty area of the pannel ( see {@link CIQ.ChartEngine#calculateYAxisMargins}).
	 * @param  {number} finger Which finger double tapped.
	 * @param  {number} x	   X location of screen of tap
	 * @param  {nubmer} y	   Y location on screen of tap
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias touchDoubleClick
	 */
	CIQ.ChartEngine.prototype.touchDoubleClick=function(finger, x, y){
		if(x<this.left || x>this.right || y<this.panels.chart.top || y>this.panels.chart.bottom) return;
		if(this.editingAnnotation) return;
		if(this.runPrepend("touchDoubleClick", arguments)) return;
		if(CIQ.ChartEngine.drawingLine){
			this.undo();
		}else{
			if(this.anyHighlighted){
				this.deleteHighlighted();
			}else{	// Reset vertical
				var yAxis=this.currentPanel.yAxis;
				if(yAxis.scroll==(yAxis.initialMarginTop-yAxis.initialMarginBottom)/2 &&
					yAxis.zoom==yAxis.initialMarginTop+yAxis.initialMarginBottom){
					this.home();
				}else{
					this.calculateYAxisMargins(this.currentPanel.yAxis);
					//this.currentPanel.chart.verticalScroll=0;
					//this.currentPanel.chart.zoom=0;
				}
				this.draw();
			}
		}
		this.clicks={ s1MS: -1, e1MS: -1, s2MS: -1, e2MS: -1};
		this.runAppend("touchDoubleClick", arguments);
	};

	// Proxy for handling MS pointer events, specifically to deal with all-in-one computers that
	// support both mouse and touch
	CIQ.ChartEngine.prototype.startProxy=function(e){
		if(e.pointerType==4 || e.pointerType=="mouse"){
			this.mouseMode=true;
		}else{
			this.mouseMode=false;
		}
		if(this.mouseMode) return;
		this.touches[this.touches.length]={
				pointerId:e.pointerId,
				pageX:e.clientX,
				pageY:e.clientY
		};
		this.changedTouches=[{
				pointerId:e.pointerId,
				pageX:e.clientX,
				pageY:e.clientY
		}];
		if(!this.gestureInEffect && this.touches.length==1){
			this.gesturePointerId=e.pointerId;
			this.overrideGesture=false;
			if(!this.gesture) return;
			this.gesture.addPointer(e.pointerId);
			this.touchstart(e);
		}else{
			this.gesture.stop();
			this.touchstart(e);
		}
	};

	// Proxy for dealing with MS pointer move events
	CIQ.ChartEngine.prototype.moveProxy=function(e){
		if(e.pointerType==4 || e.pointerType=="mouse"){
			this.mouseMode=true;
		}else{
			this.mouseMode=false;
		}
		if(this.mouseMode) return;
		if(!this.gestureInEffect)
			this.touchmove(e);
	};

	// Proxy for dealing with MS pointer end events
	CIQ.ChartEngine.prototype.endProxy=function(e){
		if(this.mouseMode) return;
		var hm=this.touches.length;
		for(var i=0;i<this.touches.length;i++){
			if(this.touches[i].pointerId==e.pointerId){
				this.touches.splice(i,1);
				break;
			}
		}
		if(i==hm){
			this.touches=[];
			this.grabbingScreen=false;
			this.touching=false;
			return;
		}
		this.changedTouches=[{
			pointerId:e.pointerId,
			pageX:e.clientX,
			pageY:e.clientY
		}];
		if(!this.gestureInEffect){
			this.touchend(e);
		}
	};

	// Proxy for dealing with mousemove on MS devices
	CIQ.ChartEngine.prototype.msMouseMoveProxy=function(e){
		if(this.touches.length || !this.mouseMode) return;
		//if(this.touches.length) return;
		//this.mouseMode=true;
		this.mousemove(e);
	};

	// Proxy for dealing with mousedown on MS devices
	CIQ.ChartEngine.prototype.msMouseDownProxy=function(e){
		if(!this.mouseMode) return;
		this.mousedown(e);
	};

	// Proxy for dealing with mouseup on MS devices
	CIQ.ChartEngine.prototype.msMouseUpProxy=function(e){
		if(!this.mouseMode) return;
		this.mouseup(e);
	};

	// Proxy for dealing with mousemove for ios style events on all-in-one computers (FF and Chrome)
	CIQ.ChartEngine.prototype.iosMouseMoveProxy=function(e){
		if(this.touching) return;
		this.mousemove(e);
	};

	// Proxy for dealing with mousedown for ios style events on all-in-one computers (FF and Chrome)
	CIQ.ChartEngine.prototype.iosMouseDownProxy=function(e){
		if(this.touching){
			this.mouseMode=false;
			return;
		}
		this.mouseMode=true;
		this.mousedown(e);
	};

	// Proxy for dealing with mouseup for ios style events on all-in-one computers (FF and Chrome)
	CIQ.ChartEngine.prototype.iosMouseUpProxy=function(e){
		if(this.touching) return;
		this.mouseup(e);
	};

	/**
	 * Creates watermarked text on the canvas. See {@link CIQ.ChartEngine#watermark} to create a watermark relative to a particular panel.
	 * CSS style stx_watermark defines the watermark (opacity of .5 is automatically applied)
	 * @param  {external:CanvasRenderingContext2D} context [description]
	 * @param  {number} x		X position on canvas
	 * @param  {number} y		Y position on canvas
	 * @param  {string} text	The text to watermark
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.rawWatermark=function(context, x, y, text){
		this.canvasFont("stx_watermark", context);
		context.fillStyle=this.defaultColor;
		context.globalAlpha=0.5;
		this.chart.context.textBaseline="alphabetic";
		context.fillText(text, x, y);
		context.globalAlpha=1;
	};

	/**
	 * Creates watermarked text relative to a panel on the canvas.
	 * Use CSS style stx_watermark to control the text size and color.
	 *
	 * @param  {string} panel The name of the panel
	 * @param  {object} [config] Parameters for the request
	 * @param  {string} [config.h]			"left", "right", "center" to place the watermark
	 * @param  {string} [config.v]			"top", "bottom", "middle" to place the watermark
	 * @param  {string} [config.text]		The text to watermark
	 * @param  {string} [config.hOffset]	offset in pixels of upper left corner from left or right margin
	 * @param  {string} [config.vOffset]	offset in pixels of upper left corner from top or bottom margin
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.watermark=function(panel, config){
		if(config && typeof config!="object"){	// Handle legacy argument list implementation
			config={
				h: arguments[1],
				v: arguments[2],
				text: arguments[3]
			};
		}
		config={  // set defaults
			h: config.h || "left",
			v: config.v || "bottom",
			text: config.text || "",
			hOffset: config.hOffset || 10,
			vOffset: config.vOffset || 20
		};

		if(!this.chart.context) return;
		var c=this.panels[panel];
		if(!c || c.hidden) return;

		var y=c.yAxis.bottom-config.vOffset;
		if(config.v=="top") y=c.top+config.vOffset;
		else if(config.v=="middle") y=(c.top+c.yAxis.bottom)/2;

		this.chart.context.save();
		this.canvasFont("stx_watermark");
		this.canvasColor("stx_watermark");
		this.chart.context.textBaseline="alphabetic";

		var x=c.left+config.hOffset;
		if(config.h=="right") x=c.right-config.hOffset;
		else if(config.h=="center"){
			x=(c.right + c.left - this.chart.context.measureText(config.text).width) / 2;
		}

		this.chart.context.globalAlpha=0.5;
		this.chart.context.fillText(config.text, x, y);
		this.chart.context.globalAlpha=1;
		this.chart.context.restore();
	};
	/**
	 * Call this before a resizing operation in order to maintain the scroll position. See {@link CIQ.ChartEngine#postAdjustScroll}.
	 * @param  {CIQ.ChartEngine.Chart} [whichChart] The chart to adjust. Otherwise adjusts the main symbol chart.
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.preAdjustScroll=function(chart){
		if(!chart) chart=this.chart;
		this.previousAdjust={
			chart: chart,
			scroll: chart.scroll,
			maxTicks: chart.maxTicks
		};
	};

	/**
	 * Call this after a resizing operation in order to maintain the scroll position. See {@link CIQ.ChartEngine#preAdjustScroll}.
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.postAdjustScroll=function(){
		if(!this.previousAdjust) return;
		var chart=this.previousAdjust.chart;
		chart.scroll=this.previousAdjust.scroll+(chart.maxTicks-this.previousAdjust.maxTicks);
		if(this.displayInitialized) this.draw();
	};
	/**
	 * Loops through the existing drawings and asks them to adjust themselves to the chart dimensions.
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.adjustDrawings=function(){
		for(var i=0;i<this.drawingObjects.length;i++){
			var drawing=this.drawingObjects[i];
			if(this.panels[drawing.panelName])
				drawing.adjust();
		}
	};

	/**
	 * Convenience function returns the next or previous interval from the provided date-time at the current chart's periodicity.
	 * See {@link CIQ.Market} and {@link CIQ.Market.Iterator} for more details.
	 * 
	 * For 'tick' intervals, since there is no predictable periodicity, the next interval will be determined by {@link CIQ.ChartEngine.futureTicksInterval}
	 * @param  {Date}		DT			A JavaScript Date representing the base time for the request in {@link CIQ.ChartEngine#dataZone} timezone.
	 * @param {number}		[period]		The number of periods to jump. Defaults to 1. Can be negative to go back in time.
	 * @param {Boolean}		[useDataZone=true] By default the next interval will be returned in {@link CIQ.ChartEngine#dataZone}. Set to false to receive a date in {@link CIQ.ChartEngine#displayZone} instead.
	 * @return {Date}	 The next interval date
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.getNextInterval=function(DT, period, useDataZone){
		if(!period) period=1;
		if(useDataZone!==false) useDataZone=true;

		var iter = this.standardMarketIterator(DT, useDataZone?this.dataZone:this.displayZone);
		if(period<1){
			return iter.previous(period*-1);
		}
		return iter.next(period);
	};

	/**
	 * Convenience function returns a new market iterator at the current chart's periodicity.
	 * For 'tick' intervals, since there is no predictable periodicity, the iterator interval will be determined by {@link CIQ.ChartEngine.futureTicksInterval}
	 * See {@link CIQ.Market} and {@link CIQ.Market.Iterator} for more details.
	 * @param {Date}		begin A JavaScript Date representing the iterator begin date in {@link CIQ.ChartEngine#dataZone} timezone. See {@link CIQ.Market#newIterator} for details.
	 * @param {string} 		[outZone] A valid timezone from the timeZoneData.js library. This should represent the time zone for the returned date. Defaults {@link CIQ.ChartEngine#dataZone}. See {@link CIQ.Market#newIterator} for details.
	 * @param {CIQ.ChartEngine} 	[chart] The chart object.
	 * @return {Object} A new iterator.
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.standardMarketIterator=function(begin, outZone, chart){
		var otz=outZone?outZone:this.dataZone;
		var cht=chart?chart: this.chart;
		var iter_parms = {
			'begin': begin,
			'interval': this.layout.interval =='tick' ? 1:this.layout.interval,
			'periodicity': this.layout.interval =='tick' ? this.chart.xAxis.futureTicksInterval:this.layout.periodicity,
			'timeUnit': this.layout.timeUnit,
			'inZone': this.dataZone,
			'outZone': otz
		};
		return cht.market.newIterator(iter_parms);
	};

	/**
	 * Effects a zoom from either zoomIn() or zoomOut(). Called from an EaseMachine
	 * @param  {Number} candleWidth  The new candleWidth
	 * @param  {CIQ.ChartEngine.Chart} chart        The chart to center
	 * @private
	 */
	CIQ.ChartEngine.prototype.zoomSet=function(candleWidth, chart){
		var scroll=this.chart.scroll;
		var maintainTick, distanceFromFront;
		var halfCandle=0, halfNewCandle=0;
		if(this.isHome()){
			maintainTick=chart.dataSet.length-1;
			halfCandle=this.layout.candleWidth/2;
			halfNewCandle=candleWidth/2;
		}else{
			maintainTick=this.tickFromPixel(this.chart.width/2, chart);
		}

		distanceFromFront=chart.dataSet.length-1-maintainTick;
		var initialpx=Math.floor(this.pixelFromTick(maintainTick, chart)+halfCandle);
		this.setCandleWidth(candleWidth);
		this.micropixels=0;
		this.chart.scroll=Math.floor((initialpx-halfCandle)/candleWidth)+1+distanceFromFront;
		var newpx=Math.floor(this.pixelFromTick(maintainTick, chart)+halfNewCandle);
		this.micropixels=initialpx-newpx;
		chart.spanLock=false;
		this.draw();
		this.doDisplayCrosshairs();
		this.updateChartAccessories();
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Zooms the chart out. The chart is zoomed incrementally by they percentage indicated (pct) each time this is called.
	 * @param  {Event} e The mouse click event, if it exists (from clicking on the chart control)
	 * @param  {Number} pct The percentage to zoom out the chart (default = 10%)
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias zoomOut
	 */
	CIQ.ChartEngine.prototype.zoomOut=function(e, pct){
		if(this.runPrepend("zoomOut", arguments)) return;
		this.grabbingScreen= false; //in case they were grabbing the screen and let go to zoom.
		if(CIQ.ChartEngine.insideChart) CIQ.unappendClassName(this.container, "stx-drag-chart"); //in case they were grabbing the screen and let go to zoom.
		if ( this.preferences.zoomOutSpeed) pct= this.preferences.zoomOutSpeed;
		else if(!pct) pct=1.3;
		if(e && e.preventDefault) e.preventDefault();
		this.cancelTouchSingleClick=true;
		
		var self=this;
		function closure(chart){
			return function(candleWidth){
				self.zoomSet(candleWidth, chart);
			};
		}
		
		for(var chartName in this.charts){
			var chart=this.charts[chartName];
			if(CIQ.ipad && chart.maxTicks>CIQ.ChartEngine.ipadMaxTicks){
				return;
			}
			var newTicks=Math.round(chart.maxTicks*pct);	// 10% more ticks with each click
			var newCandleWidth=this.chart.width/newTicks;
			if(newCandleWidth<this.minimumCandleWidth) newCandleWidth=this.minimumCandleWidth;
			this.layout.span=null;
			this.animations.zoom.run(closure(chart), this.layout.candleWidth, newCandleWidth);
		}
		if(this.runAppend("zoomOut", arguments)) return;
		this.draw();
		this.changeOccurred("layout");
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Zooms the chart based on a mousewheel event. A built in timeout prevents the mousewheel from zooming too quickly.
	 * @param  {Event} e		  The event
	 * @param  {string} wheelEvent The type of mousewheel event "onmousewheel","onwheel","wheel","DOMMouseScroll"
	 * @return {boolean}			Returns false if action is taken
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias mouseWheel
	 */

	CIQ.ChartEngine.prototype.mouseWheel=function(e, wheelEvent){
		if(!e) e=event;	//IE8
		e.preventDefault();
		var deltaX=e.deltaX, deltaY=e.deltaY;
		var diff=Date.now()-this.lastMouseWheelEvent;

		/*
		// OSX trackpad is very sensitive since it accomodates diagonal
		// motion which is not relevant to us. So we ignore any changes
		// in direction below the threshold time value
		var threshold=50; //ms
		if(Date.now()-this.lastMouseWheelEvent<threshold){
			if(this.lastMove=="horizontal") deltaY=0;
			else deltaX=0;
		}*/
		if(Math.abs(deltaY)>Math.abs(deltaX)) deltaX=0;
		else deltaY=0;

		this.lastMouseWheelEvent=Date.now();
		if(Math.abs(deltaX)===0 && Math.abs(deltaY)===0) return;

		if(this.allowSideswipe && deltaX!==0 && Math.abs(deltaX)>Math.abs(deltaY)){
			this.lastMove="horizontal";
			delta=deltaX*-1;
			if(delta>50) delta=50;
			if(delta<-50) delta=-50;
			this.grabbingScreen=true;
			this.grabStartX=CIQ.ChartEngine.crosshairX;
			this.grabStartY=CIQ.ChartEngine.crosshairY;
			if(!this.currentPanel) this.currentPanel=this.chart.panel;
			this.grabStartScrollX=this.currentPanel.chart.scroll;
			this.grabStartScrollY=this.currentPanel.chart.panel.yAxis.scroll;
			this.mousemoveinner(CIQ.ChartEngine.crosshairX-delta,CIQ.ChartEngine.crosshairY);
			CIQ.ChartEngine.crosshairX=this.grabStartX;
			CIQ.ChartEngine.crosshairY=this.grabStartY;
			this.updateChartAccessories();
			this.grabbingScreen=false;
			return;
		}
		this.lastMove="vertical";
		if(!this.allowZoom) return;
		if(!this.displayInitialized) return;
		/* originally added to address a magic mouse issue - removing this code because it is affecting new Macs which seem to come back for more zooming immediately causing uneven zooming.
		if(this.wheelInMotion) return;
		this.wheelInMotion=true;
		setTimeout(function(self){return function(){self.wheelInMotion=false;};}(this), 40);
		*/
		if(this.runPrepend("mouseWheel", arguments)) return;
		if(!deltaY){
			if ( wheelEvent == "onmousewheel" ) {
				deltaY = - 1/40 * e.wheelDelta;
				if(e.wheelDeltaX) deltaX = - 1/40 * e.wheelDeltaX;
			} else {
				deltaY = e.detail;
			}
		}
		if(typeof e.deltaMode=="undefined") e.deltaMode = (e.type == "MozMousePixelScroll" ? 0 : 1);

		//var distance=e.deltaX;
		//if(!distance) distance=e.deltaY;
		var distance=deltaY;
		if(e.deltaMode==1){	// 1 is line mode so we approximate the distance in pixels, arrived at through trial and error
			distance*=33;
		}

		var pctIn=null;
		var pctOut=null;
		// Calculate the percentage change to the chart. Arrived at heuristically, cube root of the mousewheel distance.
		// The multipliers are adjusted to take into consideration reversed compounding rates between a zoomin and a zoomout
		if(this.mouseWheelAcceleration){
			var multiplier=Math.max(Math.pow(Math.abs(distance),0.3),1);
			pctIn=1-0.1*multiplier;
			pctOut=1+0.2*multiplier;
		}

		if(distance>0){
			if(this.reverseMouseWheel)
				this.zoomOut(null, pctOut);
			else
				this.zoomIn(null, pctIn);
		}else if(distance<0){
			if(this.reverseMouseWheel)
				this.zoomIn(null, pctIn);
			else
				this.zoomOut(null, pctOut);
		}
		if(this.runAppend("mouseWheel", arguments)) return;
		return false;
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Zooms the chart in. The chart is zoomed incrementally by they percentage indicated (pct) each time this is called.
	 * @param  {Event} e The mouse click event, if it exists (from clicking on the chart control)
	 * @param  {Number} pct The percentage to zoom out the chart (default = 10%)
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias zoomIn
	 */
	CIQ.ChartEngine.prototype.zoomIn=function(e, pct){
		if(this.runPrepend("zoomIn", arguments)) return;
		this.grabbingScreen= false; //in case they were grabbing the screen and let go to zoom.
		if(CIQ.ChartEngine.insideChart) CIQ.unappendClassName(this.container, "stx-drag-chart"); //in case they were grabbing the screen and let go to zoom.
		if ( this.preferences.zoomInSpeed) pct= this.preferences.zoomInSpeed;
		else if(!pct) pct=0.7;
		
		var self=this;
		function closure(chart){
			return function(candleWidth){
				self.zoomSet(candleWidth, chart);
			};
		}
		
		for(var chartName in this.charts){
			var chart=this.charts[chartName];
			if(e && e.preventDefault) e.preventDefault();
			this.cancelTouchSingleClick=true;

			var newTicks=Math.round(chart.maxTicks*pct);	// 10% fewer ticks displayed when zooming in
			// At some point the zoom percentage compared to the bar size may be too small, we get stuck at the same candle width.
			// (bacause we ceil() and 0.5 candle when we set the maxTicks in setCandleWidth()).
			// So we want to for force a candle when this happens.
			if (chart.maxTicks-newTicks < 2) newTicks=chart.maxTicks-2;
			if(newTicks<this.minimumZoomTicks) newTicks=this.minimumZoomTicks;
			var newCandleWidth=this.chart.width/newTicks;
			this.layout.span=null;
			this.animations.zoom.run(closure(chart), this.layout.candleWidth, newCandleWidth);
		}
		
		if(this.runAppend("zoomIn", arguments)) return;
		this.draw();
		this.changeOccurred("layout");
	};

	/**
	 * Translates a built-in word if this.translationCallback callback function is set.
	 * @param  {string} english The word to translate
	 * @return {string}			The translated word, or the word itself if no callback is set.
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.translateIf=function(english){
		if(this.translationCallback) return this.translationCallback(english);
		return english;
	};

	/**
	 * Sets the timezone(s) for the chart.
	 * masterData dates are interpreted in reference on the {@link CIQ.ChartEngine#dataZone}. 
	 * The {@link CIQ.ChartEngine#displayZone} is then created and used to translate dates based on either the local browser's timezone, or the timezone selected by the end user.
	 * 
	 * ** {@link CIQ.ChartEngine#displayZone} is only available when in introday periodicity. No time conversions will be done in daily, weekly or monthly periodicities, wich only display a date without a time.**
	 * 
	 * ** Time zone and the {@link CIQ.QuoteFeed#fetch}:**<br>
	 * It is important to understand that if your quote feed returns a date string such as  '07/07/16 9:30' as the time-stamp for a tick, (note there is no timezone specified) , 
	 * the library will also store that in master data with no timezone specified (which really means the browser is storing it in local time on the 'DT' field).
	 * Setting the time zone using this method **does not alter the date in the master data array** but simply allows the chart to now how to deal with it. 
	 * On a fetch call, that same raw date from the master data array will be sent in on the parameters object. So if your date did not have a time zone when added, then you must assume there is no time zone for it when provided as a parameter. The easiest way to remove a timezone from a date is to take that exact date and convert it to a string using {@link CIQ.yyyymmddhhmmssmmm}, for example.
	 * <br>If you want all of this to be automatic, then set the 'DT' filed instead with a time zone aware date or use an ISO9601 date string such as'2015-01-01T09:10:00Z' in the 'Date' field. 
	 * In this case there will be no need to use this function to set the timezone for the data.
	 * 
	 * 
	 * @param {string} dataZone	   A valid timezone from the timeZoneData.js library. This should represent the time zone that the master data comes from.
	 * @param {string} displayZone A valid timezone from the timeZoneData.js library. This should represent the time zone that the user wishes displayed.
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.setTimeZone=function(dataZone, displayZone){
		if(typeof timezoneJS=="undefined"){
			this.timeZoneOffset=0;
			return;
		}

		var now=new Date();
		var myTimeZoneOffset=now.getTimezoneOffset();
		var dataTimeZoneOffset=myTimeZoneOffset;
		var displayTimeZoneOffset=myTimeZoneOffset;
		if(dataZone) this.dataZone=dataZone;
		if(this.dataZone) dataTimeZoneOffset = new timezoneJS.Date(now, this.dataZone).getTimezoneOffset();
		if(displayZone) this.displayZone=displayZone;
		if(this.displayZone) displayTimeZoneOffset = new timezoneJS.Date(now, this.displayZone).getTimezoneOffset();
		this.timeZoneOffset=(dataTimeZoneOffset - myTimeZoneOffset) - (displayTimeZoneOffset - myTimeZoneOffset);
		for(var chartName in this.charts){
			var chart=this.charts[chartName];
			if(chart.masterData && !CIQ.ChartEngine.isDailyInterval(this.layout.interval)) this.setDisplayDates(chart.masterData);
		}

		this.createDataSet();
	};

	/**
	 * Sets the locale for the charts. If set, display prices and dates will be displayed in localized format.
	 * The locale should be a valid IANA locale. For instance de-AT represents German as used in Austria. Localization
	 * is supported through the Intl object which is a W3 standard, however not all browsers support Intl natively. The
	 * Intl.js polyfill is included through the inclusion of stxThirdParty.js. To enable localization, the locale-data/jsonp
	 * directory should be included and the JSONP loaded. This is done automatically by calling {@link CIQ.I18N.setLocale}
	 * rather than calling this method directly.
	 *
	 * Once a locale is set, this.internationalizer will be an object that will contain several Intl formatters.
	 * These can be overridden manually if the specified format is not acceptable.
	 *
	 * @param {string} locale A valid IANA locale
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.setLocale=function(locale){
		if(typeof Intl=="undefined") return;
		if(this.locale!=locale){
			this.locale=locale;
		}else{
			return;
		}
		var internationalizer=this.internationalizer={};
		internationalizer.hourMinute=new Intl.DateTimeFormat(this.locale,{hour:"numeric",minute:"numeric", hour12:false});
		internationalizer.hourMinuteSecond=new Intl.DateTimeFormat(this.locale,{hour:"numeric",minute:"numeric", second:"numeric", hour12:false});
		internationalizer.mdhm=new Intl.DateTimeFormat(this.locale,{year:"2-digit", month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});
		internationalizer.monthDay=new Intl.DateTimeFormat(this.locale,{month:"numeric", day:"numeric"});
		internationalizer.yearMonthDay=new Intl.DateTimeFormat(this.locale,{year:"numeric",month:"numeric", day:"numeric"});
		internationalizer.yearMonth=new Intl.DateTimeFormat(this.locale,{year:"numeric",month:"numeric"});
		internationalizer.month=new Intl.DateTimeFormat(this.locale,{month:"short"});
		internationalizer.numbers=new Intl.NumberFormat(this.locale);
		internationalizer.priceFormatters=[];
		internationalizer.priceFormatters[0]=new Intl.NumberFormat(this.locale,{maximumFractionDigits:0,minimumFractionDigits:0});
		internationalizer.priceFormatters[1]=new Intl.NumberFormat(this.locale,{maximumFractionDigits:1,minimumFractionDigits:1});
		internationalizer.priceFormatters[2]=new Intl.NumberFormat(this.locale,{maximumFractionDigits:2,minimumFractionDigits:2});
		internationalizer.priceFormatters[3]=new Intl.NumberFormat(this.locale,{maximumFractionDigits:3,minimumFractionDigits:3});
		internationalizer.priceFormatters[4]=new Intl.NumberFormat(this.locale,{maximumFractionDigits:4,minimumFractionDigits:4});
		internationalizer.priceFormatters[5]=new Intl.NumberFormat(this.locale,{maximumFractionDigits:5,minimumFractionDigits:5});
		internationalizer.percent=new Intl.NumberFormat(this.locale, {style:"percent", minimumFractionDigits:2, maximumFractionDigits:2});
		internationalizer.percent0=new Intl.NumberFormat(this.locale, {style:"percent", minimumFractionDigits:0, maximumFractionDigits:0});
		internationalizer.percent1=new Intl.NumberFormat(this.locale, {style:"percent", minimumFractionDigits:1, maximumFractionDigits:1});
		internationalizer.percent2=new Intl.NumberFormat(this.locale, {style:"percent", minimumFractionDigits:2, maximumFractionDigits:2});
		internationalizer.percent3=new Intl.NumberFormat(this.locale, {style:"percent", minimumFractionDigits:3, maximumFractionDigits:3});
		internationalizer.percent4=new Intl.NumberFormat(this.locale, {style:"percent", minimumFractionDigits:4, maximumFractionDigits:4});

		if(CIQ.I18N.createMonthArrays) CIQ.I18N.createMonthArrays(this, internationalizer.month, this.locale);
	};

	/**
	 * Imports a layout (panels, studies, candleWidth, etc) from a previous serialization. See {@link CIQ.ChartEngine#exportLayout}.
	 *
	 * ***Please note that `stxx.callbacks.studyOverlayEdit` and `stxx.callbacks.studyPanelEdit`
	 * must be set *before* you call {@link CIQ.ChartEngine#importLayout}. Otherwise your imported studies will not have an edit capability***
	 *
	 * It will also load symbols if your {@link CIQ.ChartEngine#exportLayout} call included symbols. When symbols are included, this
	 * function will set the primary symbol ( first on the serialized symbol list) with {@link CIQ.ChartEngine#newChart} 
	 * and any overlayed symbol with {@link CIQ.ChartEngine#addSeries}.
	 * Note that you must be using a QuoteFeed to use this workflow; otherwise data updates may break.
	 *
	 * @param  {object} config						A serialized layout
	 * @param  {object} params						Parameters to dictate layout behaviour
	 * @param  {boolean} [params.managePeriodicity]			If true then the periodicity will be set from the layout, otherwise periodicity will remain as currently set. It is only possible
	 * for this to change the periodicity if this.dataCallback or this.quoteDriver has been set. See {@link CIQ.ChartEngine#setPeriodicityV2}
	 * @param  {boolean} [params.preserveTicksAndCandleWidth=true] If true then the candleWidth (horizontal zoom) will be maintained up to 50px, otherwise it will be taken from the layout. **Note that the candle width will be reset to 8px if larger than 50px. Even if the value comes from a layout import. This is done to ensure a reasonable candle size is available across devices that may have different screen size. **
	 * @param  {Function} [params.cb] An optional callback function to pass into CIQ.ChartEngine#newChart if there are symbols to load.
	 * @memberOf CIQ.ChartEngine
	 * @since 05-2016-10 Symbols are also loaded if included on the serialization. 
	 * @since  2016-06-21 preserveTicksAndCandleWidth now defaults to true
	 */
	CIQ.ChartEngine.prototype.importLayout=function(config, params){
		if (typeof params !== "object") {
			// backwards compatibility hack, this function used to accept three named arguments
			params = {
				managePeriodicity: arguments[1],
				preserveTicksAndCandleWidth: arguments[2]
			};
		}
		if(!params.preserveTicksAndCandleWidth && params.preserveTicksAndCandleWidth!==false) params.preserveTicksAndCandleWidth=true;

		var originalLayout=CIQ.shallowClone(this.layout);

		var serializedDrawings=this.serializeDrawings();
		this.abortDrawings();

		this.currentlyImporting=true;
		this.overlays={};
		var view=CIQ.clone(config);
		if(CIQ.Studies){
			for(var s in this.layout.studies){
				var sd=this.layout.studies[s];
				CIQ.Studies.removeStudy(this, sd);
			}
		}

		if(view){

			// Keep a copy of the prior panels. We'll need these in order to transfer the holders
			var priorPanels=CIQ.shallowClone(this.panels);

			this.panels={};
			var v=CIQ.clone(view);
			// these are special cases handled elsewhere
			delete v.periodicity;
			delete v.interval;
			delete v.timeUnit;
			delete v.setSpan;

			CIQ.dataBindSafeAssignment(this.layout, v);

			this.layout.periodicity=originalLayout.periodicity;
			this.layout.interval=originalLayout.interval;
			this.layout.timeUnit=originalLayout.timeUnit;
			this.layout.setSpan=originalLayout.setSpan;
			// must restore candleWidth before you draw any charts or series, including study charts. The view does not allays provide the candleWidth
			if(params.preserveTicksAndCandleWidth){
				this.layout.candleWidth=originalLayout.candleWidth;
			}else{
				if(!this.layout.candleWidth) this.layout.candleWidth=8;
			}

			// Just make sure the candleWidth is sane so we end up with a reasonable number of maxticks to fetch.
			if(this.layout.candleWidth<this.minimumCandleWidth) this.layout.candleWidth=this.minimumCandleWidth;
			this.setCandleWidth(this.layout.candleWidth);

			var panels=view.panels;		// make a copy of the panels
			this.layout.panels={};		// erase the panels
			for(var p in panels){		// rebuild the panels
				var panel=panels[p];
				this.stackPanel(panel.display, p, panel.percent, panel.chartName);
			}
			if(CIQ.isEmpty(panels)){
				this.stackPanel("chart","chart",1,"chart");
			}

			// Transfer the holders and DOM element references to panels that were retained when the view switched
			// Delete panels that weren't
			for(var panelName in priorPanels){
				var oldPanel=priorPanels[panelName];
				var newPanel=this.panels[panelName];
				if(newPanel){
					this.container.removeChild(newPanel.holder);
					this.container.removeChild(oldPanel.handle);
					var copyFields={"holder":true,"subholder":true,"display":true};
					for(var f in copyFields){
						newPanel[f]=oldPanel[f];
					}
					this.configurePanelControls(newPanel);
					if(oldPanel.chart.panel==oldPanel) oldPanel.chart.panel=newPanel; // retain reference to the actual chart panel
				}else{
					this.privateDeletePanel(oldPanel);
				}
			}

			this.adjustPanelPositions();

			this.storePanels();
			if(CIQ.Studies){
				var studies=CIQ.clone(this.layout.studies);
				delete this.layout.studies;
				for(var ss in studies){
					var study=studies[ss];
					CIQ.Studies.addStudy(this, study.type, study.inputs, study.outputs, study.parameters, study.panel);
				}
			}
		}
		if(typeof(this.layout.chartType)=="undefined") this.layout.chartType="line";

		this.adjustPanelPositions();

		var self=this;
		if(config.symbols){
			if (!this.quoteDriver || !this.quoteDriver.quoteFeed) {
				console.log("WARNING: loading a symbol through 'importLayout' without a QuoteFeed may break data updates");
			}

			var params2={};
			if(params.managePeriodicity){
				if(config.symbols[0].setSpan){
					params2.span=config.symbols[0].setSpan;
				}
				if(config.symbols[0].interval){
					params2.periodicity={
						interval: config.symbols[0].interval,
						periodicity: config.symbols[0].periodicity,
						timeUnit: config.symbols[0].timeUnit
					};
				}
			}
			var symbolObject=config.symbols[0].symbolObject || config.symbols[0].symbol;

			this.newChart(symbolObject, null, this.chart, function(err){
				if(!err){
					for (var smbl, i = 1; i < config.symbols.length; ++i) {
						smbl = config.symbols[i];
						self.addSeries(smbl.symbol, smbl.parameters);
					}
				}
				self.reconstructDrawings(serializedDrawings);
				self.draw();
				self.currentlyImporting=false;
				self.updateListeners("layout");	 // tells listening objects that layout has changed
				if(params.cb) params.cb.apply(null, arguments);
			}, params2);
			return;
		}else{
			if(view && params.managePeriodicity){
				if(view.setSpan && this.chart.symbol){
					this.setSpan(view.setSpan, function(){
						self.reconstructDrawings(serializedDrawings);
						self.draw();
						self.currentlyImporting=false;
						self.updateListeners("layout");	 // tells listening objects that layout has changed
						if(params.cb) params.cb();
					});
					return;
				}else{
					interval=view.interval;
					periodicity=view.periodicity;
					timeUnit=view.timeUnit;
					if(isNaN(periodicity)) periodicity=1;
					if(!interval) interval="day";
					if(interval!=this.layout.interval || periodicity!=this.layout.periodicity){
						this.setPeriodicityV2(periodicity, interval, timeUnit, function(){
							self.reconstructDrawings(serializedDrawings);
							self.draw();
							self.currentlyImporting=false;
							self.updateListeners("layout");	 // tells listening objects that layout has changed
							if(params.cb) params.cb();
						});	// this will get new data or roll up existing, createDataSet() and draw()
						return;
					}else{
						this.createDataSet();
					}
				}
			}else{
				this.createDataSet();
			}
		}

		this.reconstructDrawings(serializedDrawings);
		this.draw();
		if(!params.preserveTicksAndCandleWidth) this.home();
		this.currentlyImporting=false;
		this.updateListeners("layout");	 // tells listening objects that layout has changed
		if(params.cb) params.cb();
	};

	/*
	 * exportLayout - We jump through a lot of hoops here to avoid deep, circular or illegal cloning
	 */
	/**
	 * Exports the current layout into a serialized form. The returned object can be passed into
	 * {@link CIQ.ChartEngine#importLayout} to restore the layout at a future time.
	 * @param {boolean} withSymbols  If set to `true', include the chart's current symbols in the serialized object.
	 * @return {object} The serialized form of the layout.
	 * @memberOf CIQ.ChartEngine
	 * @since 05-2016-10 `withSymbols` parameter is available
	 */
	CIQ.ChartEngine.prototype.exportLayout=function(withSymbols){
		var obj={};
		// First clone all the fields, these describe the layout
		for(var field in this.layout){
			if(field!="studies" && field!="panels"){
				obj[field]=CIQ.clone(this.layout[field]);
			}else if(field=="studies"){
				obj.studies={};
			}else if(field=="panels"){
				obj.panels={};
			}
		}
		// Serialize the panels
		for(var panelName in this.panels){
			var panel=obj.panels[panelName]={};
			var p=this.panels[panelName];
			panel.percent=p.percent;
			panel.display=p.display;
			panel.chartName=p.chart.name;
		}

		// Serialize the studies
		for(var studyName in this.layout.studies){
			var study=obj.studies[studyName]={};
			var s=this.layout.studies[studyName];
			study.type=s.type;
			study.inputs=CIQ.clone(s.inputs);
			study.outputs=CIQ.clone(s.outputs);
			study.panel=s.panel;
			study.parameters=CIQ.clone(s.parameters);
		}

		if (withSymbols) {
			obj.symbols = this.getSymbols("include-parameters");
		}

		return obj;
	};

	/**
	 * Inserts bars in an array of quotes for those periods missing a record according to the logic present in {@link CIQ.ChartEngine#getNextInterval}. See the "{@tutorial Market Hours and the Charts}" tutorial for details on how to properly configure the library to your market hours requirements.
	 *
	 * The missing bars will have OHLC all set to the previous Close.
	 *
	 * This method is automatically called if you are using a quoteFeed and have {@link CIQ.ChartEngine#cleanupGaps} set to true; but can be manually called if pushing data into the chart.
	 *
	 * This method will affect intraday and **underlying daily**  periods **only**. If the feed is already returning weekly and monthly data rolled up, the clean up will not be done ( see {@link CIQ.ChartEngine#dontRoll} ).
	 *
	 * @param  {array} quotes The quote array to be gap-filled
	 * @param  {CIQ.ChartEngine.Chart} [chart] Optional chart
	 * @return {array} The quote array with gaps filled in.
	 * @memberOf CIQ.ChartEngine
	 * @since 07/01/2015 it now supports cleanups for daily intervals and foreign exchanges insted of just introday equities.
	 */
	CIQ.ChartEngine.prototype.doCleanupGaps=function(quotes, chart) {
		if(!this.cleanupGaps) return quotes;
		if(this.layout.interval=="tick") return quotes;
		if(quotes && !quotes.length) return quotes;
		if(!chart) chart=this.chart;

		var interval = this.layout.interval;
		// doCleanupGaps works on the raw masterData, so if we're rolling up month or week then be sure to actually
		// cleanup gaps on the masterData which will be "day"
		if(interval=="month" || interval=="week"){
			if(this.dontRoll) return quotes; // We won't try to fill gaps on raw month or week data
			interval="day";
		}

		var _make_date = function (_quote) {
			var _dt;
			if (_quote.DT) {
				_dt = _quote.DT;
			} else {
				_dt = CIQ.strToDateTime(_quote.Date);
			}
			return _dt;
		};

		var new_quotes = [];
		var currentQuote=quotes[0];
		new_quotes.push(quotes[0]);

		var iter_parms = {
			'begin': _make_date(currentQuote),
			'interval': interval,
			'periodicity': 1,
			'timeUnit': this.layout.timeUnit,
			'inZone': this.dataZone,
			'outZone': this.dataZone
		};
		var iter = chart.market.newIterator(iter_parms);
		for (var i = 1; i < quotes.length; i++) {
			var nextQuote=quotes[i];
			var mdt = iter.next(); // market date
			var qdt = _make_date(nextQuote); // quote date

			// Loop through the iterator adding a dummy quote for every missing market date between currentQuote and nextQuote
			while (mdt < qdt) {
				new_quotes.push({
						DT: mdt,
						Open: currentQuote.Close,
						High: currentQuote.Close,
						Low: currentQuote.Close,
						Close: currentQuote.Close,
						Volume: 0,
						Adj_Close: currentQuote.Adj_Close
				});
				mdt = iter.next();
			}
			new_quotes.push(nextQuote);
			currentQuote=nextQuote;
		}
		return new_quotes;
	};


	/**
	 * ** The UI portion if this namespace is maintained for legacy implementations only (not using web components). New implementations should use functionality included in the web components (stxUI.js) **<br>
	 * Comparison namespace
	 * @namespace
	 * @name  CIQ.Comparison
	 */
	CIQ.Comparison=function(){};	// Create namespace

	/**
	 * Transform function for comparison charting
	 * @param  {CIQ.ChartEngine} stx	  The charting object
	 * @param  {CIQ.ChartEngine.Chart} chart	The specific chart
	 * @param  {number} price The price to transform
	 * @return {number}			The transformed price (into percentage)
	 * @memberOf CIQ.Comparison
	 */
	CIQ.Comparison.priceToPercent=function(stx, chart, price){
		return Math.round(((price-CIQ.Comparison.baseline)/CIQ.Comparison.baseline*100)*10000)/10000;
	};

	/**
	 * Untransform function for comparison charting
	 * @param  {CIQ.ChartEngine} stx	  The charting object
	 * @param  {CIQ.ChartEngine.Chart} chart	The specific chart
	 * @param  {number} percent The price to untransform
	 * @return {number}			The untransformed price
	 * @memberOf CIQ.Comparison
	 */
	CIQ.Comparison.percentToPrice=function(stx, chart, percent){
		return CIQ.Comparison.baseline*(1+(percent/100));
	};

	CIQ.Comparison.stopSort=function(lhs, rhs){
		return lhs-rhs;
	};

	CIQ.Comparison.createComparisonSegmentInner=function(stx, chart){
		// create an array of the fields that we're going to compare
		var fields=[];
		var field;
		for(field in chart.series){
			if(chart.series[field].parameters.isComparison){
				fields.push(field);
			}
		}
		var priceFields=["Close","Open","High","Low","iqPrevClose"];

		chart.dataSegment=[];
		var firstQuote=null;
		var firstTick=chart.dataSet.length - chart.scroll;
		var lastTick=firstTick+chart.maxTicks;

		// Create the list of displayable comparison stops
		var stopPointer=0;
		var stops=[];
		var i;
		for(i=0;i<stx.drawingObjects.length;i++){
			var drawing=stx.drawingObjects[i];
			if(drawing.name=="comparison_stop")
				if(drawing.tick>firstTick && drawing.tick<=lastTick)
					stops.push(drawing.tick);
		}
		stops.sort(CIQ.Comparison.stopSort);
		var transformsToProcess=chart.maxTicks+3;  //make sure we have transformed enough data points that we plot the y-axis intercept correctly
		for(i=0;i<=transformsToProcess;i++){
			if(i==transformsToProcess) i=-1;  //go back and revisit the tick before the first
			position=firstTick + i;
			if(position<chart.dataSet.length && position>=0){
				var quote=chart.dataSet[position];
				if(!firstQuote){
					firstQuote=CIQ.clone(quote);
				}

				// iterate through the fields calculating the percentage gain/loss
				// We store the results in the "transform" subobject of the data set
				// Note we inline the math calculation to save overhead of JS function call
				if(!quote.transform) quote.transform={
					"cache": {},
					"DT": quote.DT,
					"Date": quote.Date
				};
				CIQ.Comparison.baseline=firstQuote.Close;
				var j;
				for(j=0;j<priceFields.length;j++){
					field=priceFields[j];
					if(quote[field] || quote[field]===0)
						quote.transform[field]=Math.round(((quote[field]-CIQ.Comparison.baseline)/CIQ.Comparison.baseline*100)*10000)/10000;	// first compute the close pct, our baseline
				}

				var s=stx.layout.studies;
				if(s){
					for(var n in s){
						var sd=s[n];
						if(!stx.panels[sd.panel] || stx.panels[sd.panel].name!=sd.chart.name) continue;
						for(field in sd.outputMap){
							if(quote[field] || quote[field]===0)
								quote.transform[field]=Math.round(((quote[field]-CIQ.Comparison.baseline)/CIQ.Comparison.baseline*100)*10000)/10000;	// first compute the close pct, our baseline
						}
						if(sd.referenceOutput && (quote[sd.referenceOutput + " " + sd.name] || quote[sd.referenceOutput + " " + sd.name]===0))
							quote.transform[sd.referenceOutput + " " + sd.name]=Math.round(((quote[sd.referenceOutput + " " + sd.name]-CIQ.Comparison.baseline)/CIQ.Comparison.baseline*100)*10000)/10000;	// first compute the close pct, our baseline
					}
				}

				for(j in stx.plugins){
					var plugin=stx.plugins[j];
					if(!plugin.transformOutputs) continue;
					for(field in plugin.transformOutputs){
						if(quote[field] || quote[field]===0)
							quote.transform[field]=Math.round(((quote[field]-CIQ.Comparison.baseline)/CIQ.Comparison.baseline*100)*10000)/10000;	// first compute the close pct, our baseline
					}
				}

				// Reset baseline for each series at each stop
				var createAStop=false;
				if(stops && stopPointer<stops.length){
					if(position===stops[stopPointer]){
						createAStop=true;
						stopPointer++;
					}
				}
				var mouseStop=null;
				if(stx.activeDrawing && stx.activeDrawing.name=="comparison_stop"){
					mouseStop=stx.activeDrawing.tick;
				}
				var current;
				if(createAStop || position==mouseStop){
					for(j=0;j<fields.length;j++){
						field=fields[j];
						current=quote[field];
						firstQuote[field]=current/(1+(quote.transform.Close/100));
					}
				}

				// Transform the series comparisons to percent
				for(j=0;j<fields.length;j++){
					field=fields[j];
					current=quote[field];
					if(current || current===0){	// Skip blanks
						var baseline=firstQuote[field];
						if(!baseline && baseline!==0){	// This takes care of a stock that starts part way through the comparison
																		// assumes the the quote.comparison.Close has already been calculated and sets us at that value
							firstQuote[field]=baseline=current/(1+(quote.transform.Close/100));
						}
						quote.transform[field]=Math.round(((current-baseline)/baseline*100)*10000)/10000;
					}
				}
				chart.dataSegment.push(quote);
			}else if(position<0){
				chart.dataSegment.push(null);
			}
			if(i<0) break;	//we revisited tick before first so we are done
		}
	};

	/**
	 * Formats the percentage values on the comparison chart
	 * @param  {CIQ.ChartEngine} stx	The chart object
	 * @param  {CIQ.ChartEngine.Panel} panel The panel
	 * @param  {number} price The percentage (whole number)
	 * @return {string}		  The percentage formatted as a percent (possibly using localization if set in stx)
	 * @memberOf CIQ.Comparison
	 */
	CIQ.Comparison.priceFormat=function(stx, panel, price){
		if(price===null || typeof price=="undefined") return "";
		var priceTick=panel.yAxis.priceTick;
		var internationalizer=stx.internationalizer;
		if(internationalizer){
			if(priceTick>=1) price=internationalizer.percent0.format(price/100);
			else if(priceTick>=0.1) price=internationalizer.percent1.format(price/100);
			else if(priceTick>=0.01) price=internationalizer.percent2.format(price/100);
			else if(priceTick>=0.001) price=internationalizer.percent3.format(price/100);
			else price=internationalizer.percent4.format(price);

		}else{
			if(priceTick>=1) price=price.toFixed(0) + "%";
			else if(priceTick>=0.1) price=price.toFixed(1) + "%";
			else if(priceTick>=0.01) price=price.toFixed(2) + "%";
			else if(priceTick>=0.001) price=price.toFixed(3) + "%";
			else price=price.toFixed(4) + "%";
		}
		if(parseFloat(price)===0 && price.charAt(0)=="-"){	// remove minus sign from -0%, -0.0%, etc
			price=price.substring(1);
		}
		return price;
	};
	/**
	 * Creates and maintains correlation coefficient panels. Called from CIQ.Comparison.add but could be called from elsewhere as well.
	 * @param {object} stx			 The chart object
	 * @param {string} symbol The symbol to correlate
	 * @private
	 */
	CIQ.Comparison.correlate=function(stx, symbol){

		if(!CIQ.Comparison.requestCorrelation || correlationPeriod<=0) return;
		var correlationPeriod=parseInt($$$(".stxCorrelate .stx-input-field").value,10);

		var corrPanel=stx.panels[CIQ.Comparison.correlationPanel+" ("+correlationPeriod+")"];
		var inputs={"id":CIQ.Comparison.correlationPanel+" ("+correlationPeriod+")", "Period": correlationPeriod, "Compare To": []};
		var outputs={};
		var panelName=null;
		if(corrPanel){
			for(var i=0;i<stx.layout.studies[corrPanel.name].inputs["Compare To"].length;i++){
				inputs["Compare To"].push(stx.layout.studies[corrPanel.name].inputs["Compare To"][i]);
			}
			for(var o in stx.layout.studies[corrPanel.name].outputs){
				outputs[o]=stx.layout.studies[corrPanel.name].outputs[o];
			}
			panelName=corrPanel.name;
		}
		inputs["Compare To"].push(symbol);
		outputs["Result "+symbol]=CIQ.Comparison.colorSelection;
		CIQ.Studies.addStudy(stx, "correl", inputs, outputs, null, panelName);

		for(var panel in stx.panels){
			if(stx.panels[panel].name.indexOf(CIQ.Comparison.correlationPanel)===0) {
				var compareArray=stx.layout.studies[stx.panels[panel].name].inputs["Compare To"];
				for(var ii=0;ii<compareArray.length;ii++){
					if(compareArray[ii]==symbol) {
						stx.layout.studies[stx.panels[panel].name].outputs["Result "+symbol]=CIQ.Comparison.colorSelection;
					}
				}
			}
		}
	};

	/**
	 * Turns on and off the checkbox for generating correlation coefficient
	 * @memberOf CIQ.Comparison
	 */
	CIQ.Comparison.toggleCorrelate=function(stx){
		CIQ.Comparison.requestCorrelation=!CIQ.Comparison.requestCorrelation;
		var display=$$$(".stxCorrelate .stx-checkbox");
		if(display) {
			CIQ.unappendClassName(display,(!CIQ.Comparison.requestCorrelation).toString());
			CIQ.appendClassName(display,CIQ.Comparison.requestCorrelation.toString());
		}
	};
	/**
	 * Turns comparison charting on or off and sets the transform
	 * @param {boolean} onOff Turn on or off
	 * @param {CIQ.ChartEngine.Chart} [chart] The specific chart for comparisons
	 * @memberOf CIQ.ChartEngine
	 * @since  04-2015 Signature has been revised
	 */
	CIQ.ChartEngine.prototype.setComparison=function(onOff, chart){
		if(!chart) chart=this.chart;
		if(typeof chart=="string") chart=this.charts[chart];
		if(!chart.isComparison && onOff){
			this.setTransform(chart, CIQ.Comparison.priceToPercent, CIQ.Comparison.percentToPrice);
			chart.panel.yAxis.priceFormatter=CIQ.Comparison.priceFormat;
			chart.panel.yAxis.whichSet="dataSegment";
		}else if(chart.isComparison && !onOff){
			this.unsetTransform(chart);
			chart.panel.yAxis.priceFormatter=null;
			chart.panel.yAxis.whichSet="dataSet";
		}
		chart.isComparison=onOff;
	};

	/**
	 * ID of the study panel to create for the correlation coefficient
	 * @memberOf CIQ.Comparison
	 * @version ChartIQ Advanced Package
	 */
	CIQ.Comparison.correlationPanel="correl";

	/**
	 * ** This function is maintained for legacy implementations only (not using web components). New implementations should use functionality included in the web components (stxUI.js) **<br>
	 * Initial value of UI input for toggling correlation coefficient
	 * @memberOf CIQ.Comparison
	 * @version ChartIQ Advanced Package
	 */
	CIQ.Comparison.requestCorrelation=false;

	if(typeof document!="undefined") document.addEventListener("contextmenu", CIQ.ChartEngine.handleContextMenu);

	return _exports;
});
