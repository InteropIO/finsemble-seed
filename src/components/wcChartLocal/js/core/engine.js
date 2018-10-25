//-------------------------------------------------------------------------------------------
// Copyright 2012-2017 by ChartIQ, Inc.
// All rights reserved
//-------------------------------------------------------------------------------------------
(function(_exports, market){

	var CIQ=_exports.CIQ,
		$$=_exports.$$,
		$$$=_exports.$$$,
		splinePlotter=_exports.SplinePlotter,
		timezoneJS=_exports.timezoneJS;

		/**
		 * Previously `STXChart`.
		 * This is the constructor that creates a chart engine, instantiates its basic chart object and links it to its DOM container.
		 * Before any chart operations can be performed, this constructor must be called.
		 *
		 * Multiple CIQ.ChartEngine (stx) objects can exist on an HTML document.
		 *
		 * Once instantiated, the chart engine will never need to be constructed again, unless it is [destroyed]{@link CIQ.ChartEngine#destroy}.
		 * To load or change symbols on the chart, simply call {@link {@link CIQ.ChartEngine#newChart}.
		 *
		 * @constructor
		 * @param {object} config Configuration object. Any field or object within the config parameter will be preset or added to the CIQ.ChartEngine object itself.
		 * Generally you will want to at least include {container: <your div element>}.
		 * @name  CIQ.ChartEngine
		 * @example
		 * // declare a chart
		 * var stxx=new CIQ.ChartEngine({container: $$$(".chartContainer")});
		 * // override defaults after a chart object is declared (this can be done at any time. If the chart has already been rendered, you will need to call `stx.draw();` to immediately see your changes )
		 * stxx.yaxisLabelStyle="roundRectArrow";
		 * stxx.layout.chartType="bar";
		 * @example
		 * // declare a chart and preset defaults
		 * var stxx=new CIQ.ChartEngine({container: $$$(".chartContainer"),layout:{"chartType": "candle","candleWidth": 16}});
		 * @since
		 * <br>&bull; 15-07-01 deprecated CIQ.ChartEngine#underlayPercentage
		 * <br>&bull; m-2016-12-01 deprecated renamed `CIQ.ChartEngine` from `STXChart`
		 */
		CIQ.ChartEngine=function(config){
			if(!config){
				config={
					container: null
				};
			}else if(config.constructor==HTMLDivElement){ // legacy versions accepted the chart container as the first parameters rather than a config object
				var newConfig={
					container: config
				};
				config=newConfig;
			}
		    /**
		     * READ ONLY. A map of marker objects, sorted by label.
		     * @type object
		     * @alias markers
		     * @memberof CIQ.ChartEngine.prototype
		     */
			this.markers={};
		    /**
		     * READ ONLY. An array of currently enabled panels
		     * @type object
		     * @alias panels
		     * @memberof CIQ.ChartEngine.prototype
		     */
			this.panels={};
		    /**
		     * READ ONLY. An array of currently enabled overlay studies
		     * @type object
		     * @alias overlays
		     * @memberof CIQ.ChartEngine.prototype
		     */
			this.overlays={};
		    /**
		     * READ ONLY. The charts on the screen. Will contain at least one item, "chart"
		     * @type object
		     * @alias charts
		     * @memberof CIQ.ChartEngine.prototype
		     */
		    this.charts={};
		    /**
		     * READ ONLY. Array of event listeners currently attached to the engine.
		     * These listeners will be killed when {@link CIQ.ChartEngine#destroy} is called.
		     *
		     * See {@link CIQ.ChartEngine#addEventListener} and {@link CIQ.ChartEngine#removeEventListener}
		     * @type array
		     * @alias eventListeners
		     * @memberof CIQ.ChartEngine.prototype
		     */
		    this.eventListeners=[];

			/**
			 * Animations. These can be overridden with customized EaseMachines
			 * To disable an animation replace with an EaseMchine with one ms as the second parameter.
			 * @type {object}
		     * @alias animations
		     * @memberof CIQ.ChartEngine.prototype
			 * @example
			 * stxx.animations.zoom=new CIQ.EaseMachine(Math.easeOutCubic,1);
			 */
			this.animations={
				zoom: new CIQ.EaseMachine(Math.easeOutCubic, 400)
			};
			/**
			 * Specify a callback by assigning a function to the event. Once the event triggers the callback will be executed.
			 *
			 * ** Note: All callbacks have been deprecated in favor of {@link CIQ.ChartEngine#addEventListener}**
			 *
		     * @type object
		     * @alias callbacks
		     * @memberof CIQ.ChartEngine#
			 * @example
			 * // using event listener
			 * stxx.addEventListener("callbackNameHere", function(callBackParametersHere){
			 * 	CIQ.alert('triggered!');
			 * });
			 * @example
			 * // using callback function
			 * stxx.callbacks.callbackNameHere=function(callBackPatamerersHere){
			 * 	CIQ.alert('triggered!');
			 * };
			 * @deprecated 4.0.0
			 */
			this.callbacks={
			    /**
			     * Called when a user right clicks on an overlay study. If `forceEdit==true` then a user has clicked
			     * on an edit button (cog wheel) so pull up an edit dialog. Otherwise they have simply right clicked so
			     * give them a context menu.
			     *
			     * ***Please note that this callback must be set *before* you call {@link CIQ.ChartEngine#importLayout}.
			     * Otherwise your imported studies will not have an edit capability***
			     *
			     * Format:<br>
			     * studyOverlayEdit({stx:stx,sd:sd,inputs:inputs,outputs:outputs, parameters:parameters, forceEdit: forceEdit});
			     *
			     * The following CSS entry must also be present to enable the `Right click to Manage` text on the mouse-over context menu (div class="mSticky" generated by {@link CIQ.ChartEngine.htmlControls}):
			     * ```
			     * .rightclick_study .mouseManageText {
			     * display: inline; }
			     * ```
			     * See {@link CIQ.Studies.addStudy} for more details.
			     *
			     * @type function
				 * @alias callbacks[`studyOverlayEdit`]
				 * @memberof! CIQ.ChartEngine#
			     */
			    studyOverlayEdit: null,
			    /**
			     * Called when a user clicks the edit button on a study panel.
			     *
			     * ***Please note that this callback should be set *before* you call {@link CIQ.ChartEngine#importLayout}.
			     * Otherwise your imported studies will not have an edit capability***
			     *
			     * Format:<br>
			     * studyPanelEdit({stx:stx,sd:sd,inputs:inputs,outputs:outputs, parameters:parameters});
			     *
			     * See {@link CIQ.Studies.addStudy} for more details.
			     *
			     * @type function
				 * @alias callbacks[`studyPanelEdit`]
				 * @memberof! CIQ.ChartEngine#
			     */
				studyPanelEdit: null,
			    /**
			     * Called when a user clicks or taps on the chart. Not called if a drawing tool is active!
			     *
			     * Format:<br>
			     * callback({stx:CIQ.ChartEngine, panel:CIQ.ChartEngine.Panel, x:this.cx, y:this.cy})
			     * @type function
				 * @alias callbacks[`tap`]
				 * @memberof! CIQ.ChartEngine#
				 * @example
				 * // using event listener
				 * stxx.addEventListener("tap", function(tapObject){
				 * 	CIQ.alert('tap event at x: ' + tapObject.x + ' y: '+ tapObject.y);
				 * });
				 * @example
				 * // using callback
				 * // this example  uses barFromPixel() to get the actual bar from the pixel location
				 * stxx.callbacks.tap= function(tapObject){
				 *	var msg= 'tap event at x: ' + tapObject.x + ' y: '+ tapObject.y;
				 *	var bar=this.barFromPixel(this.cx);
				 *  if(this.chart.dataSegment[bar]) {
				 * 	  msg+=' Date:' + this.chart.dataSegment[bar].DT;
				 * 	  msg+=' Close:' + this.chart.dataSegment[bar].Close;
				 *  }
				 *  alert (msg);
				 * };
				 */
				tap: null,
			    /**
			     * Called when a user clicks or right clicks on the chart. Not called if the user right clicks on a drawing or study
			     * when [stxx.bypassRightClick]{@link CIQ.ChartEngine#bypassRightClick}=true
			     *
			     * Format:<br>
			     * callback({stx:CIQ.ChartEngine, panel:CIQ.ChartEngine.Panel, x:this.cx, y:this.cy})
			     * @type function
				 * @alias callbacks[`rightClick`]
				 * @memberof! CIQ.ChartEngine#
				 * @example
				 * // using event listener
				 * stxx.addEventListener("rightClick", function(rcObject){
				 * 	alert('right click event at x: ' + rcObject.x + ' y: '+ rcObject.y);
				 * });
				 * @since  09-2016-19
			     */
				rightClick: null,
			    /**
			     * Called when a user "long holds" on the chart. By default this is set to 1000 milliseconds.
			     * Optionally change the value of stxx.longHoldTime to a different setting, or set to zero to disable.
			     *
			     * Format:<br>
			     * callback({stx:CIQ.ChartEngine, panel:CIQ.ChartEngine.Panel, x:this.cx, y:this.cy})
			     * @type function
				 * @alias callbacks[`longhold`]
				 * @memberof! CIQ.ChartEngine#
				 * @example
				 * // using event listener
				 * stxx.longHoldTime=... // Optionally override default value of 1000ms
				 * stxx.addEventListener("longhold", function(lhObject){
				 * 	CIQ.alert('longhold event at x: ' + lhObject.x + ' y: '+ lhObject.y);
				 * });
				 * @example
				 * // using callback function
				 * stxx.longHoldTime=... // Optionally override default value of 1000ms
				 * stxx.callbacks.longhold=function(lhObject){
				 * 	CIQ.alert('longhold event at x: ' + lhObject.x + ' y: '+ lhObject.y);
				 * });
				 * @memberof! CIQ.ChartEngine#
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
			     * @type function
				 * @alias callbacks[`move`]
				 * @memberof! CIQ.ChartEngine#
			     */
				move:null,

				/**
				 * Called when the layout changes
				 *
				 * Format:<br>
				 * callback({stx:CIQ.ChartEngine, chart:CIQ.ChartEngine.Chart, symbol: String, symbolObject:Object, layout: Object})
				 * @type function
				 * @alias callbacks[`layout`]
				 * @memberof! CIQ.ChartEngine#
				 */
				layout: null,
				/**
				 * Called when a drawing is added or deleted (all the drawings are returned, not just the new one)
				 *
				 * Format:<br>
				 * callback({stx:CIQ.ChartEngine, symbol: String, symbolObject:Object, drawings: Object})
				 * @type function
				 * @alias callbacks[`drawing`]
				 * @memberof! CIQ.ChartEngine#
				 */
				drawing: null,
				/**
				 * Called when a right-click id detected on a highlighted drawing.
				 *
				 * Format:<br>
				 * callback({stx:CIQ.ChartEngine, drawing:CIQ.Drawing})
				 * @type function
				 * @alias callbacks[`drawingEdit`]
				 * @memberof! CIQ.ChartEngine#
				 * @since 6.2.0
				 * @private
				 */
				drawingEdit: null,
				/**
				 * Called when preferences are changed
				 * calback({stx:CIQ.ChartEngine})
				 * @type function
				 * @alias callbacks[`preferences`]
				 * @memberof! CIQ.ChartEngine#
				 */
				preferences: null,
				/**
				 * Called when a theme is changed
				 *
				 * Format:<br>
				 * callback({stx:CIQ.ChartEngine})
				 * @type function
				 * @alias callbacks[`theme`]
				 * @memberof! CIQ.ChartEngine#
				 */
				theme: null,
				/**
				 * Called when the symbol is changed (when newChart is called), added (addSeries, addStudy) or removed (removeSeries, removeStudy). Note
				 * that this is not called if the symbol change occurs during an importLayout
				 *
				 * Format:<br>
				 * callback({stx:CIQ.ChartEngine, symbol: String, symbolObject:Object, action:["master"|"add-series"|"remove-series"})
				 * @type function
				 * @alias callbacks[`symbolChange`]
				 * @memberof! CIQ.ChartEngine#
				 * @since 06-2016-21
				 */
				symbolChange: null,
				/**
				 * Called when the symbol is first imported into the layout.
				 *
				 * Format:<br>
				 * callback({stx:CIQ.ChartEngine, symbol: String, symbolObject:Object, action:"master"})
				 * @type function
				 * @alias callbacks[`symbolImport`]
				 * @memberof! CIQ.ChartEngine#
				 * @since 4.0.0
				 */
				symbolImport: null,
				/**
				 * Called to determine how many decimal places the stock trades in. This is used for head's up display
				 * and also for the current price pointer label.
				 *
				 * Format:<br>
				 * callback({stx:CIQ.ChartEngine, chart:CIQ.ChartEngine.Chart, symbol: String, symbolObject:Object})
				 * @type function
				 * @alias callbacks[`calculateTradingDecimalPlaces`]
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
		     * @memberof CIQ.ChartEngine.prototype
		     */
		    this.controls={};								// contains the HTML controls for the chart (zoom, home, etc)
			this.goneVertical=false;						// Used internally for pinching algorithm
		    /**
		     * READ ONLY.. Toggles to true when the screen is being pinched
		     * @type boolean
		     * @default
		     * @alias pinchingScreen
		     * @memberof CIQ.ChartEngine.prototype
		     */
			this.pinchingScreen=false;
		    /**
		     * READ ONLY.. Toggles to true when the screen is being panned
		     * @type boolean
		     * @default
		     * @alias grabbingScreen
		     * @memberof CIQ.ChartEngine.prototype
		     */
			this.grabbingScreen=false;
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
		     * @memberof CIQ.ChartEngine.prototype
		     * @example
		     * //This will disable the tolerance, so panning will immediately follow the user actions without maintaining a locked vertical location when panning left or right.
		     * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
		     * stxx.yTolerance=0;
		     */
			this.yTolerance=100;

			/**
			 * Number of bars to always keep in view when the user pans forwards or backwards.
			 * If this is set to less than 1, it will be possible to have a blank chart.
			 *
			 * See {@link CIQ.ChartEngine.Chart#allowScrollPast} and {@link CIQ.ChartEngine.Chart#allowScrollFuture} for instructions on how to prevent users from scrolling past the last bar on the chart in either direction; which may supersede this setting.
			 * @type number
			 * @default
			 * @alias minimumLeftBars
			 * @memberof CIQ.ChartEngine.prototype
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
		     * @memberof CIQ.ChartEngine.prototype
		     */
			this.reverseMouseWheel=false;
		    /**
		     * Set to false to turn off mousewheel acceleration
		     * @type boolean
		     * @default
		     * @alias mouseWheelAcceleration
		     * @since 2015-11-1
		     * @memberof CIQ.ChartEngine.prototype
		     */
			this.mouseWheelAcceleration=true;
		    /**
		     * Minimum candleWidth (in pixels) allowed when zooming out. This will determine the maximum number of ticks to display on the chart.
		     * Anything smaller than **0.5 pixels** may cause performance issues when zooming out.
		     * @type number
		     * @default
		     * @alias minimumCandleWidth
		     * @memberof CIQ.ChartEngine.prototype
		     */
			this.minimumCandleWidth=1;
		    /**
		     * Minimum number of ticks to display when zooming in.
		     * @type number
		     * @default
		     * @alias minimumZoomTicks
		     * @memberof CIQ.ChartEngine.prototype
		     * @since 07-2016-16.6
		     */
			this.minimumZoomTicks=9;
		    /**
		     * Set to false to disable any user zooming on the chart
		     * @type boolean
		     * @default
		     * @alias allowZoom
		     * @memberof CIQ.ChartEngine.prototype
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
		     * @memberof CIQ.ChartEngine.prototype
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
		     * @memberof CIQ.ChartEngine.prototype
		     * @since 2015-12-08
		     */
			this.allowSideswipe=true;
		    /**
		     * If set to true then a three finger movement will increment periodicity.
		     * @type boolean
		     * @default
		     * @alias allowThreeFingerTouch
		     * @memberof CIQ.ChartEngine.prototype
		     */
			this.allowThreeFingerTouch=false;
			/**
			 * Set to `true` to bypass right clicks on **all** overlay types.
			 * Or define independent settings for series, studies, and drawings by using an object instead.
		     * Also see:
		     * - <a href="CIQ.ChartEngine.html#callbacks%5B%60rightClick%60%5D">CIQ.ChartEngine#callbacks.rightClick</a>
		     * - {@link CIQ.ChartEngine.AdvancedInjectable#rightClickHighlighted}

		     * @type object
		     * @default
		     * @alias bypassRightClick
		     * @memberof CIQ.ChartEngine.prototype
		     * @since 2016-07-16
		     * <br>&bull;  5.1.0: An object containing booleans to separate series, studies, and drawings.
		     * @example
			 * this.bypassRightClick={
			 *	series: false,
			 *	study: false,
			 *	drawing: false
			 * };
		     */
			this.bypassRightClick={
				series: false,
				study: false,
				drawing: false
			};

			this.anyHighlighted=false;						// READ ONLY. Toggles to true if any drawing or overlay is highlighted for deletion
			this.accessoryTimer=null;						// Used internally to control drawing performance
			this.lastAccessoryUpdate=new Date().getTime();	// "
			this.displayCrosshairs=true;						// READ ONLY. Use doDisplayCrosshairs() or undisplayCrosshairs()
			this.hrPanel=null;								// READ ONLY. Current panel that mouse is hovering over
			this.editingAnnotation=false;					// READ ONLY. True if an annotation is open for editing
			this.openDialog="";								// Set this to non-blank to disable chart touch and mouse events use CIQ.ChartEngine.prototype.modalBegin() and CIQ.ChartEngine.prototype.modalEnd

		    /**
		     * Set these to false to not display the up and down arrows in the panel management component. See {@link CIQ.ChartEngine#controls} for alternate methods and more details.
		     * @type boolean
		     * @default
		     * @alias displayIconsUpDown
		     * @memberof CIQ.ChartEngine.prototype
		     * @example
		     * stxx.displayIconsUpDown=false;
		     */
			this.displayIconsUpDown=true;
		    /**
		     * Set these to false to not display this panel management component. See {@link CIQ.ChartEngine#controls} for alternate methods and more details.
		     * @type boolean
		     * @default
		     * @alias displayIconsSolo
		     * @memberof CIQ.ChartEngine.prototype
		     * @example
		     * stxx.displayIconsSolo=false;
		     */
			this.displayIconsSolo=true;
		    /**
		     * Set these to false to not display this panel management component. See {@link CIQ.ChartEngine#controls} for alternate methods and more details.
		     * @type boolean
		     * @default
		     * @alias displayIconsClose
		     * @memberof CIQ.ChartEngine.prototype
		     * @since 3.0.7
		     * @example
		     * stxx.displayIconsClose=false;
		     */
			this.displayIconsClose=true;
		    /**
		     * Set these to false to not display this panel management component. See {@link CIQ.ChartEngine#controls} for alternate methods and more details.
		     * @type boolean
		     * @default
		     * @alias displayPanelResize
		     * @memberof CIQ.ChartEngine.prototype
		     * @example
		     * stxx.displayPanelResize=false;
		     */
			this.displayPanelResize=true;
		    /**
		     * Set this to true to hide even the chart panel when soloing a non-chart panel.  Normally chart panels are not hidden when soloing.
		     * @type boolean
		     * @default
		     * @alias soloPanelToFullScreen
		     * @memberof CIQ.ChartEngine.prototype
		     * @since 3.0.7
		     * @example
		     * stxx.soloPanelToFullScreen=true;
		     */
			this.soloPanelToFullScreen=false;
		    /**
		     * Only reposition markers this many milliseconds. Set to zero or null for no visible delay. (lower numbers are more CPU intensive).
		     * See {@tutorial Markers} for more details on adding markers to your charts
		     * @type number
		     * @default
		     * @alias markerDelay
		     * @memberof CIQ.ChartEngine.prototype
		     * @example
		     * stxx.markerDelay=25;
		     */
			this.markerDelay=0;
		    /**
		     * When set to true, the backing store for the canvas is used.
		     * This results in crisper display but with a noticeable performance penalty in some browsers.
		     * The default is true.
		     * If improved performance is necessary, set the variable as shown in the example.
		     * The example allows mobile devices (android/ipad/iphone) to continue using the backing store while being bypassed in others (desktop browsers).
		     *
		     * @type boolean
		     * @default
		     * @alias useBackingStore
		     * @memberof CIQ.ChartEngine.prototype
		     * @since 3.0.0
		     * @example
		     * stxx.useBackingStore=CIQ.isMobile;
		     */
			this.useBackingStore=true;

			/**
			 * On touch devices, when set to true, the backing store will be turned off while a user is panning or zooming the chart. This increases performance during the operation by reducing
			 * resolution. Resolution is restored once the user lifts their finger. Generally, you'll want to enable this dynamically when you know that a particular device has poor canvas performance.
			 * This defaults to true but can be disabled by setting to false.
			 * @type boolean
			 * @default
			 * @alias disableBackingStoreDuringTouch
			 * @memberOf  CIQ.ChartEngine.prototype
			 * @since  4.0.0
			 */
			this.disableBackingStoreDuringTouch=CIQ.isMobile || (CIQ.isSurface && CIQ.isFF);
		    /**
		     * If true when the chart initially is rendered, then the CIQ.ChartEngine object will register to listen and manage touch and mouse browser events within then canvas by attaching them to the container div.
		     *
		     * Set to false, and all interactivity with the chart will cease; turning it into a static display and 'shedding' all HTML overlays and events required for user interaction, for a much more lightweight interface.
		     * Alternatively you can selectively set any {@link CIQ.ChartEngine#htmlControls} id to null, including `CIQ.ChartEngine.htmlControls=null` to disable them all.
		     * See {@tutorial Creating Static Charts} for more details on creating static charts.
		     *
		     * It is possible to re-enable the events after the chart has been rendered, but you must call stx.initializeChart(); stx.draw(); to register the events once again.
		     * @type boolean
		     * @default
		     * @alias manageTouchAndMouse
		     * @memberof CIQ.ChartEngine.prototype
		     * @example
		     * // if enabling events after the chart was already rendered, you must reinitialize to re register the browser events.
		     * stxx.manageTouchAndMouse = true;
		     * stxx.initializeChart();
		     * stxx.draw();
		     */
			this.manageTouchAndMouse=true;
		    /**
		     * Primarily intended for mobile devices, if set to `false` it will allow up/down swiping to pass through the chart container so the main page can manage it.
		     * This allows a user swiping up and down to swipe trough the chart instead of having the chart capture the event and prevent the page from continue moving.
		     * It therefore produces a more natural up/down swiping motion throughout the page.
		     * @type boolean
		     * @default
		     * @alias captureTouchEvents
		     * @memberof CIQ.ChartEngine.prototype
		     * @since 12-2015-08
		     */
			this.captureTouchEvents=true;
		    /**
		     * If set to `false` it will allow up/down mouseWheel / touchPad swiping to pass trough the chart container so the main page can manage it.
		     * This allows a user swiping up and down to swipe trough the chart instead of having the chart capture the event and prevent the page from continue moving.
		     * It therefore produces a more natural up/down sliding of the page.
		     * @type boolean
		     * @default
		     * @alias captureMouseWheelEvents
		     * @memberof CIQ.ChartEngine.prototype
		     * @since m-2016-12-01.4
		     */
			this.captureMouseWheelEvents=true;
			this.touches=[];					// Used internally for touch
			this.changedTouches=[];				// Used internally for touch
		    /**
		     * The value (price) representing the crosshair cursor point
		     * @type number
		     * @alias crosshairTick
		     * @memberof CIQ.ChartEngine.prototype
		     */
			this.crosshairTick=null;
		    /**
		     * READ ONLY.. The value (price) representing the crosshair cursor point
		     * @type number
		     * @alias crosshairValue
		     * @memberof CIQ.ChartEngine.prototype
		     */
			this.crosshairValue=null;
		    /**
		     * Shape of the floating y axis label.
		     *
		     * Available options:
		     *  - ["roundRectArrow"]{@link CIQ.roundRectArrow}
		     *  - ["semiRoundRect"]{@link CIQ.semiRoundRect}
		     *  - ["roundRect"]{@link CIQ.roundRect}
		     *  - ["tickedRect"]{@link CIQ.tickedRect}
		     *  - ["rect"]{@link CIQ.rect}
		     *  - ["noop"]{@link CIQ.noop}
		     * @type string
		     * @default
		     * @alias yaxisLabelStyle
		     * @memberof CIQ.ChartEngine.prototype
		     * @example
		     * var stxx=new CIQ.ChartEngine({container: $$$(".chartContainer")});
		     * stxx.yaxisLabelStyle="roundRectArrow";
		     */
			this.yaxisLabelStyle="roundRectArrow";
		    /**
		     * Set to false if you don't want the axis borders drawn. This will override individual settings on yaxis and xaxis.
		     * @type boolean
		     * @default
		     * @alias axisBorders
		     * @memberof CIQ.ChartEngine.prototype
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
			this.touchPointerType="";						// "
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
		     * @memberof CIQ.ChartEngine.prototype
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
			 * Set to true to have drawings highlight only the last applied drawing if more than one is intersected at a time.
			 * @type boolean
			 * @default
			 * @since 5.0.0
			 * @alias singleDrawingHighlight
			 * @memberof CIQ.ChartEngine.prototype
			 */
			this.singleDrawingHighlight=true;
		    /**
		     * X axis offset for touch devices so that finger isn't blocking crosshair
		     * @type number
		     * @default
		     * @alias crosshairXOffset
		     * @memberof CIQ.ChartEngine.prototype
		     */
			this.crosshairXOffset=-40;
		    /**
		     * Y axis Offset for touch devices so that finger isn't blocking crosshair
		     * @type number
		     * @default
		     * @alias crosshairYOffset
		     * @memberof CIQ.ChartEngine.prototype
		     */
			this.crosshairYOffset=-40;
		    /**
		     * READ ONLY. This gets set to true when the chart display has been initialized.
		     * @type boolean
		     * @default
		     * @alias displayInitialized
		     * @memberof CIQ.ChartEngine.prototype
		     */
			this.displayInitialized=false;
		    /**
		     * READ ONLY. Mouse pointer X pixel location in reference to the chart canvas. where cx=0 and cy=0 is the upper left corner of the chart.
		     * @type number
		     * @alias cx
		     * @memberof CIQ.ChartEngine.prototype
		     */
			this.cx=null;
		    /**
		     * READ ONLY. Mouse pointer Y pixel location in reference to the chart canvas. where cx=0 and cy=0 is the upper left corner of the chart.
		     * @type number
		     * @alias cy
		     * @memberof CIQ.ChartEngine.prototype
		     */
			this.cy=null;

		    /**
		     * When set to true, line and mountain charts are extended slightly in order to reduce whitespace at the right edge of the chart
		     * @type boolean
		     * @default
		     * @alias extendLastTick
		     * @memberof CIQ.ChartEngine.prototype
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
		     * Contains the current chart layout.
		     *
		     * Layout parameters can be directly **pre-set** on a chart at the time the engine is instantiated.<br>
		     * The following is an example for setting some of the available layout parameters:
		     * ```
		     * var stxx=new CIQ.ChartEngine({container: $$$(".chartContainer"),layout:{"crosshair":true,"interval":"day","periodicity":1,"chartType": "candle","candleWidth": 16}});
		     * ```
		     * These parameters will then be activated when [newChart()]{@link CIQ.ChartEngine#newChart} is called to render the chart.<br>
		     * Once a chart is rendered, most of these parameters become READ ONLY,and must be modified using their corresponding methods, as indicated in the documentation, to ensure chart integrity.
		     *
		     * See [importLayout]{@link CIQ.ChartEngine#importLayout} and [exportLayout]{@link CIQ.ChartEngine#exportLayout} for methods to serialize a layout and restore previously saved settings.
		     *
		     * @type object
		     * @alias layout
		     * @memberof CIQ.ChartEngine#
		     */
			this.layout={
			    /**
			     * READ ONLY. Chart interval.
			     *
			     * Note that internal interval format will differ from API parameters used in {@link CIQ.ChartEngine#setPeriodicity}
			     *
			     * Available options are:
			     *  - [number] representing minutes
			     *  - "day"
			     *  - "week"
			     *  - "month"
			     *
			     * See the [Periodicity and Quote feed]{@tutorial Periodicity} tutorial.
			     * @type string
			     * @default
			     * @alias layout[`interval`]
			     * @memberof! CIQ.ChartEngine#
			     */
				interval: "day",
			    /**
			     * READ ONLY. Number of periods per interval/timeUnit
			     *
			     * See the [Periodicity and Quote feed]{@tutorial Periodicity} tutorial.
			     * @type number
			     * @default
			     * @alias layout[`periodicity`]
			     * @memberof! CIQ.ChartEngine#
			     */
				periodicity: 1,
				/**
				 * READ ONLY. Time unit for the interval.
				 *
				 * Note that internal timeUnit format will differ from API parameters used in {@link CIQ.ChartEngine#setPeriodicity}
				 *
			     * See the [Periodicity and Quote feed]{@tutorial Periodicity} tutorial.

				 * Available options are:
				 *  - "millisecond"
				 *  - "second"
				 *  - "minute"
				 *  - null for "day", "week", "month" periodicity
				 * @type string
				 * @default
			     * @alias layout[`timeUnit`]
			     * @memberof! CIQ.ChartEngine#
				 */
				timeUnit: null,
			    /**
			     * READ ONLY. Candle Width In pixels ( see {@tutorial Understanding Chart Range} )
			     * @type number
			     * @default
			     * @alias layout[`candleWidth`]
			     * @memberof! CIQ.ChartEngine#
			     */
				candleWidth: 8,
				volumeUnderlay: false,
			    /**
			     * Whether adjusted or nominal prices are being displayed.
			     * If true then the chart will look for "Adj_Close" in the masterData as an alternative to "Close".
			     * @type boolean
			     * @default
			     * @alias layout[`adj`]
			     * @memberof! CIQ.ChartEngine#
			     * @instance
			     */
				adj: true,
			    /**
			     * Set to `true` to enable crosshairs in the active layout.
			     *
			     * Also see {@link CIQ.ChartEngine.AdvancedInjectable#doDisplayCrosshairs} for more details on crosshairs behavior.
			     *
			     * @example
			     * // enable crosshair (usually called from a UI button/toggle)
			     * stx.layout.crosshair=true;
			     * // add this if you want the crosshair to display right away instead of when the user starts moving the mouse over the chart
			     * stx.doDisplayCrosshairs();
			     * // add this if you want to trigger a layout change event; maybe to save the layout.
			     * stx.dispatch("layout", {stx:stx, symbol: stx.chart.symbol, symbolObject:stx.chart.symbolObject, layout:stx.layout, drawings:stx.drawingObjects});
			     *
			     * @type boolean
			     * @default
			     * @alias layout[`crosshair`]
			     * @memberof! CIQ.ChartEngine#
			     * @instance
			     */
				crosshair: false,
			    /**
			     * READ ONLY. The primary chart type.
			     *
			     * Available options are:
			     *  - "none"
			     *  - "line"
			     *  - "step"
			     *  - "mountain"
			     *  - "baseline_delta"
			     *  - "candle"
			     *  - "bar"
			     *  - "hlc"
			     *  - "hlc_box" **Requires "js/extras/hlcbox.js"**
			     *  - "hlc_shaded_box" **Requires "js/extras/hlcbox.js"**
			     *  - "wave"
			     *  - "scatterplot"
			     *  - "histogram"
			     *  - "rangechannel"
			     *  - "marketdepth" **Requires [cryptoIQ]{@link CIQ.MarketDepth} pugin. See {@link CIQ.ChartEngine#updateCurrentMarketData} for data requirements**
			     *
			     * Variations of these types are available by prepending terms to the options as follows:
			     *  - "step_" - add to mountain, baseline_delta, marketdepth e.g. step_mountain, baseline_delta_step, step_volume_marketdepth
			     *  - "vertex_" - add to line, step, mountain, baseline_delta
			     *  - "hollow_" - add to candle
			     *  - "volume_" - add to candle, marketdepth e.g. mountain_volume_marketdepth (Adding volume to marketdepth also creates a volume histogram in the same panel)
			     *  - "colored_" - add to line, mountain, step, bar, hlc
			     *  - "mountain_" - add to baseline_delta, marketdepth e.g. mountain_volume_marketdepth
			     *
			     * Other options are available provided a renderer is created with a `requestNew` function which will support the option, see {@link CIQ.Renderer.Lines#requestNew} and {@link CIQ.Renderer.OHLC#requestNew}
			     *
			     * Use {@link CIQ.ChartEngine#setChartType} to set this value.
			     *
			     * See {@tutorial Chart Styles and Types} for more details.
			     *
			     * @type string
			     * @default
			     * @alias layout[`chartType`]
			     * @memberof! CIQ.ChartEngine#
			     * @since
			     * <br>&bull; 05-2016-10.1 "baseline_delta_mountain" and  "colored_mountain" are now available
			     * <br>&bull; 3.0.0 "histogram" and  "step" are now available
			     * <br>&bull; 3.0.7 "hlc" now available
			     * <br>&bull; 4.0.0 "colored_step", "colored_hlc" is now available
			     * <br>&bull; 5.1.0 More chart types available using combinations of terms
			     * <br>&bull; 6.1.0 "marketdepth" is now available
			     */
				chartType: "candle",
			    /**
			     * READ ONLY. Flag for extended hours time-frames.
			     *
			     * The chart includes the 'extended' parameter in the `params` object sent into the `fetch()` call.
			     * Your quote feed must be able to provide extended hours data when requested (`extended:true`) for any extended hours functionality to work.
			     *
			     * See {@link CIQ.ExtendedHours} and {@link CIQ.Market} for more details on how extended hours are set and used.
			     * @type boolean
			     * @default
			     * @alias layout[`extended`]
			     * @memberof! CIQ.ChartEngine#
			     */
				extended: false,
				/**
				 * READ ONLY. Tracks the extended market sessions to display on the chart.
				 *
				 * See {@link CIQ.ExtendedHours} and {@link CIQ.Market} for more details on how extended hours are set and used.
			     * @type object
			     * @default
			     * @alias layout[`marketSessions`]
			     * @memberof! CIQ.ChartEngine#
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
			     * READ ONLY. Active aggregation for the chart.
			     *
			     * Available options are:
			     *  - "rangebars"
			     *  - "ohlc"
			     *  - "kagi"
			     *  - "pandf"
			     *  - "heikinashi"
			     *  - "linebreak"
			     *  - "renko"
			     *
			     * Use {@link CIQ.ChartEngine#setAggregationType} to set this value.
			     *
			     * See {@tutorial Chart Styles and Types} for more details.
			     * @type string
			     * @default
			     * @alias layout[`aggregationType`]
			     * @memberof! CIQ.ChartEngine#
			     */
				aggregationType: "ohlc",
			    /**
			     * READ ONLY. Active scale for the chart.
			     *
			     * See {@link CIQ.ChartEngine#setChartScale}
			     *
			     * **Replaces CIQ.ChartEngine.layout.semiLog**
			     *
			     * @type string
			     * @default
			     * @alias layout[`chartScale`]
			     * @memberof! CIQ.ChartEngine#
			     */
				chartScale:  "linear",
			    /**
			     * READ ONLY. List of [study descriptors]{@link studyDescriptor} for the active studies on the chart.
			     *
			     * ** Please note: ** To facilitate study name translations, study names use zero-width non-joiner (unprintable) characters to delimit the general study name from the specific study parameters.
			     * Example: "\u200c"+Aroon+"\u200c"+(14).
			     * At translation time, the library will split the text into pieces using the ZWNJ characters, parentheses and commas to just translate the required part of a study name.
			     * For more information on ZWNJ characters see: [Zero-width_non-joiner](https://en.wikipedia.org/wiki/Zero-width_non-joiner).
			     * Please be aware of these ZWNJ characters, which will now be present in all study names and corresponding panel names; including the `layout.studies` study keys.
			     * Affected fields in the study descriptors could be `id	`, `display`, `name` and `panel`.
			     * <br>To prevent issues, always use the names returned in the **study descriptor**. This will ensure compatibility between versions.
			     * >Example:
			     * ><br>Correct reference:
			     * ><br>	`stxx.layout.studies["\u200c"+Aroon+"\u200c"+(14)];`
			     * ><br>Incorrect reference:
			     * ><br>	`stxx.layout.studies["Aroon (14)"];`
			     *
			     * See {@link CIQ.Studies.addStudy} for more details
			     *
			     * @type object
			     * @default
			     * @alias layout[`studies`]
			     * @memberof! CIQ.ChartEngine#
			     */
				studies: {},
				panels: {},
				setSpan: {}
			};
		    /**
		     * Contains the chart preferences.
		     *
		     * Preferences parameters, unless otherwise indicated, can be set at any time and only require a [draw()]{@link CIQ.ChartEngine#draw} call to activate.
		     *
		     * See [importPreferences]{@link CIQ.ChartEngine#importPreferences} and [exportPreferences]{@link CIQ.ChartEngine#exportPreferences} for methods to serialize and restore previously saved preferences.

		     * @type object
		     * @alias preferences
		     * @memberof CIQ.ChartEngine#
		     */
			this.preferences={
				/**
				* Pixel radius for the invisible intersection box around the cursor used to determine if it has intersected with an element to be highlighted.
				* This value is used primarily for non-touch cursor events (mouse, touchpad).  Used on items removed with a right click such as series and drawings.
				*
				* Only applicable if the user has **not** tapped on the screen to set the location of the cross-hair.
				*
				* @type number
				* @default
				* @alias preferences[`highlightsRadius`]
				* @memberof! CIQ.ChartEngine#
				* @since 3.0.0
				*/
				highlightsRadius: 10,
				/**
				* For touch events on the chart canvas.  Pixel radius for the invisible intersection box around the cursor used to determine if it has intersected
				* with an element to be highlighted. The larger highlight radius is more suitable for the less precise input from touch events.  Used on
				* items removed with a right click such as series and drawings.
				*
				* ** Only applicable for touch events while the cursor is not controlling the crosshair tool. Otherwise, highlightsRadius is used. **
				*
				* @type number
				* @default
				* @alias preferences[`highlightsTapRadius`]
				* @memberof! CIQ.ChartEngine#
				* @since 3.0.0
				*/
				highlightsTapRadius: 30,
				/**
				* Draw a horizontal line at the current price.
				* Only drawn if the most recent tick is visible.
				*
				* See {@link CIQ.ChartEngine.AdvancedInjectable#drawCurrentHR}
				*
				* @type boolean
				* @default
				* @alias preferences[`currentPriceLine`]
				* @memberof! CIQ.ChartEngine#
				* @since 05-2016-10
				*/
				currentPriceLine: false,
			    /**
			     * When using drawing tools, this will become an object when user saves the drawing parameters.
			     * A sub-object is created for each drawing tool.
			     * These preferences are used whenever the user selects that drawing object, and overrides the default stxx.currentVectorParameters.
			     * Use {@link CIQ.Drawing.saveConfig} to save the parameters to this object.
			     * @type object
			     * @default
			     * @alias preferences[`drawings`]
			     * @memberof! CIQ.ChartEngine#
			     * @since 6.0.0
			     */
				drawings: null,
			    /**
			     * Magnetizes the crosshairs to datapoints during drawing operations to improve initial placement accuracy.
			     * <br>It will not be used when an existing drawing is being repositioned.<br>
			     * See {@link CIQ.ChartEngine.AdvancedInjectable#magnetize} for more details.
			     * @type boolean
			     * @default
			     * @alias preferences[`magnet`]
			     * @memberof! CIQ.ChartEngine#
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
				 * @alias preferences[`horizontalCrosshairField`]
				 * @memberof! CIQ.ChartEngine#
				 * @since 04-2016-08
				 */
				horizontalCrosshairField: null,
			    /**
			     * Set to true to display labels on y-axis for line based studies using {@link CIQ.Studies.displayIndividualSeriesAsLine} or {@link CIQ.Studies.displaySeriesAsLine} (this is overridden by the particular y-axis setting of {@link CIQ.ChartEngine.YAxis#drawPriceLabels}).
			     * This flag is checked inside these 2 functions to decide if a label should be set, as such if you do not wish to have a label on a particular study line, you can set this flag to `false`, before calling the function, and then back to `true`.
			     * @type boolean
			     * @default
			     * @alias preferences[`labels`]
			     * @memberof! CIQ.ChartEngine#
			     * @example
					//do not display the price labels for this study
					stxx.preferences.labels=false;
					CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);

					//restore price labels to default value
					stxx.preferences.labels=true;
			     */
				labels: true,
				/**
				 * Stores preferred language for the chart.
				 *
				 * It can be individually restored using {@link CIQ.I18N.setLanguage} and activated by {@link CIQ.I18N.translateUI}
				 * @type {string}
				 * @alias preferences[`language`]
				 * @memberof! CIQ.ChartEngine#
				 * @since 4.0.0
				 */
				language: null,
				/**
				 * Stores the preferred timezone for the display of the x axis labels.
				 *
				 * It is automatically set and can be individually restored by {@link CIQ.ChartEngine#setTimeZone}.
				 * @type {string}
				 * @alias preferences[`timezone`]
				 * @memberof! CIQ.ChartEngine#
				 * @since 4.0.0
				 */
				timeZone: null,
			    /**
			     * Initial whitespace on right of the screen in pixels.
			     * @type number
			     * @default
			     * @alias preferences[`whitespace`]
			     * @memberof! CIQ.ChartEngine#
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
			     * @alias preferences[`zoomInSpeed`]
			     * @memberof! CIQ.ChartEngine#
			     * @example
			     * stxx.preferences.zoomInSpeed=.91;
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
			     * @alias preferences[`zoomOutSpeed`]
			     * @memberof! CIQ.ChartEngine#
			     * @example
			     * stxx.preferences.zoomOutSpeed=1.1;
			     * @example
			     * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), preferences:{"zoomOutSpeed": 1}});
			     * @since 07/01/2015
			     */
				zoomOutSpeed: null,
				/**
				 * If set to 'true', the mouse wheel zooming is centered by the mouse position.
				 *
				 * @type boolean
				 * @default
				 * @alias preferences[`zoomAtCurrentMousePosition`]
				 * @memberof! CIQ.ChartEngine#
				 * @since 4.0.0
				 */
				zoomAtCurrentMousePosition: false,
			};
		    /**
		     * Used to control the behavior and throttling of real time updates in [updateChartData()]{@link CIQ.ChartEngine#updateChartData} to prevent overloading the chart engine
		     * @type object
		     * @alias streamParameters
		     * @memberof CIQ.ChartEngine#
		     */
			this.streamParameters={
				count: 0,
			    /**
			     * ms to wait before allowing update to occur (if this condition is met, the update will occur and all pending ticks will be loaded - exclusive of maxTicks)
			     * @type number
			     * @default
			     * @alias streamParameters[`maxWait`]
			     * @memberof! CIQ.ChartEngine#
			     */
				maxWait: 1000,
			    /**
			     * ticks to wait before allowing update to occur (if this condition is met, the update will occur and all pending ticks will be loaded - exclusive of maxWait)
			     * @type number
			     * @default
			     * @alias streamParameters[`maxTicks`]
			     * @memberof! CIQ.ChartEngine#
			     */
				maxTicks: 100,
				timeout: -1,
			    /**
			     * If true then {@link CIQ.ChartEngine#doCleanupGaps} is called so long as {@link CIQ.ChartEngine#cleanupGaps} is also set.
			     * This will ensure gaps will be filled in the master data from the last tick in the chart to the date of the trade.
			     *
			     * **Only applicable when using streamTrade()**.<BR> Reminder: `tick` does not fill any gaps as it is not a predictable interval.
			     *
			     * @type boolean
			     * @default
			     * @alias streamParameters[`fillGaps`]
			     * @memberof! CIQ.ChartEngine#
			     * @since 2016-03-11
			     * @deprecated See deprecation of {@link CIQ.ChartEngine#streamTrade}. Use {@link CIQ.ChartEngine#updateChartData} instead,
			     * with params.fillGaps=true or rely on cleanupGaps as default behavior.
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
			 * @memberof CIQ.ChartEngine.prototype
			 */
			this.translationCallback=null;
			this.locale=null;								// set by setLocale()
		  /**
		   * READ ONLY. Timezone of the masterData, set by {@link CIQ.ChartEngine#setTimeZone}.
			 * @type {string}
		   * @alias dataZone
		   * @memberof CIQ.ChartEngine.prototype
			 */
			this.dataZone=null;
			/**
		   * READ ONLY. Timezone to display on the chart, set by {@link CIQ.ChartEngine#setTimeZone}.
			 * @type {string}
		   * @alias displayZone
		   * @memberof CIQ.ChartEngine.prototype
		   */
			this.displayZone=null;
			this.timeZoneOffset=0;							// use setTimeZone() to compute this value
		  /**
			 * This is the callback function used to react to {@link CIQ.ChartEngine#changeOccurred}.
			 *
			 * This function has been deprecated.
			 * Please use {@link CIQ.ChartEngine#addEventListener} instead.
			 *
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
			 * @memberof CIQ.ChartEngine.prototype
			 * @deprecated
			 * @since 4.0.0 - Deprecated
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
			 * @memberof CIQ.ChartEngine.prototype
			 * @example
			 * stxx.transformDataSetPre=function(stxx, dataSet){
			 *		for(var i=0;i < dataSet.length;i++){
			 *			// do something to the dataset here
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
		     * @memberof CIQ.ChartEngine.prototype
		     * @example
			 * stxx.transformDataSetPost=function(self, dataSet, min, max){
			 *		for(var i=0;i < dataSet.length;i++){
			 *			// do something to the dataset here
			 *		}
			 * }
			*/
			this.transformDataSetPost=null;
		    /**
		     * This is the callback function used by {@link CIQ.ChartEngine#setPeriodicity} when no quotefeed has been attached to the chart.
		     * Called if the masterData does not have the interval requested.
		     *
		     * Do not initialize if you are using a quotefeed ( {@link CIQ.QuoteFeed } )
		     *
			 * @type {function}
		     * @alias dataCallback
		     * @memberof CIQ.ChartEngine.prototype
		     * @example
		     * stxx.dataCallback=function(){
			 *		// put code here to get the new data in the correct periodicity.
			 *		// use layout.interval and layout.periodicity to determine what you need.
			 *		// finally call stxx.newChart(symbol,data) to load the data and render the chart.
			 * }
		     */
			this.dataCallback=null;
		    /**
		     * Set this to `true` if your server returns data in  week or monthly ticks, and doesn't require rolling computation from daily.
		     *
		     * If set to `false`:
		     * - 'weekly' bars will be aligned to the first open market day of the week according to the active [market definitions]{@link CIQ.Market} (Weeks start Sunday).
		     * - 'monthly' bar will be aligned to the first market day of the month according to the active [market definitions]{@link CIQ.Market}.
		     *
		     * @type boolean
		     * @default
		     * @alias dontRoll
		     * @memberof CIQ.ChartEngine.prototype
		     */
			this.dontRoll=false;
		    /**
		     * Set to true to allow an equation to be entered into the symbol input.  For example, =2*IBM-GM
		     * NOTE: the equation needs to be preceded by an equals sign (=) in order for it to be parsed as an equation.
		     * See {@link CIQ.formatEquation} and {@link CIQ.computeEquationChart} for more details on allowed syntax.
		     * @type boolean
		     * @default
		     * @alias allowEquations
		     * @memberof CIQ.ChartEngine.prototype
		     */
			this.allowEquations=true;
		    /**
		     * Stores a list of active drawing object on the chart. Serialized renditions of drawings can be added using {@link CIQ.ChartEngine#createDrawing} and removed using {@link CIQ.ChartEngine#removeDrawing}
		     * @type array
		     * @default
		     * @alias drawingObjects
		     * @memberof CIQ.ChartEngine.prototype
		     */
			this.drawingObjects=[];
			this.undoStamps=[];
		    /**
		     * If set, {@link CIQ.ChartEngine#doCleanupGaps} will be automatically called
		     * on intra-day or daily interval charts to create missing data points during market hours/days for stocks that may have missing bars.
		     *
		     * <br>`carry` will cause the closing price to be carried forward, resulting in dashes on a candle/bar chart or continuous line on a line or mountain chart.
		     * <br>`gap` will cause physical breaks to occur on the chart in the gapped position.
		     *
		     * **Note:** the clean up process leverages the current periodicity and the active market definition, if any.
		     * So you must first set those to ensure proper clean up.
		     * If no market definition is enabled, the clean up will assume gaps need to be added during the entire 24 hours period, every day.
		     * See "{@link CIQ.Market}" for details on how to properly configure the library to your market hours requirements.
		     * <br>No gaps will be cleaned for `tick` since by nature it is no a predictable interval.
		     *
		     * **Important information to prevent inaccurate 'gapping'**
		     * The cleanup process leverages the current market iterator which traverses along the timeline on the exact minute/second/millisecond mark for intro-day data.
		     * As such, you must ensure your time stamps match this requirement.
		     * If your data does not comply, you must round your timestamps before sending the data into the chart.
		     * <br>For example, if in minute periodicity, seconds and milliseconds should not be present or be set to zero.
		     *
		     * @type string
		     * @default
		     * @alias cleanupGaps
		     * @memberof CIQ.ChartEngine.prototype
			 *
			 * @example  <caption>If using a quoteFeed, just set the parameter will automatically call {@link CIQ.ChartEngine#doCleanupGaps} </caption>
			 * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer")});
			 * stxx.attachQuoteFeed(yourFeed,{refreshInterval:1});
			 * stxx.setMarketFactory(CIQ.Market.Symbology.factory);
			 * stxx.cleanupGaps='carry';
			 * stxx.setPeriodicity({period:1, interval:5, timeUnit:"minute"});
			 * stxx.newChart("SPY");
			 *
		     * @since
		     * <br>&bull; 15-07-01 gaps are automatically cleaned up unless this flag is set to false
		     * <br>&bull; 2015-11-1, gaps are not automatically cleaned unless this flag is set to true
		     * <br>&bull; m-2016-12-01.4 "carry" and "gap" values now supported. Setting to non-false will default to "carry" for backward compatibility with prior versions.
		     */
			this.cleanupGaps=false;
		    /**
			 * When set to true, the requested range will be visually preserved even if the data required to fill the left and/or right side of the x axis if not present.
			 * This behavior is similar to setting `goIntoPast` and `goIntoFuture` when calling [setRange]{@link CIQ.ChartEngine#setRange}/[setSpan]{@link CIQ.ChartEngine#setSpan} explicitly, but will persist between symbol changes or when a layout is imported.
		     * @type boolean
		     * @default
		     * @alias staticRange
		     * @memberof CIQ.ChartEngine.prototype
		     * @since 5.1.2
		     */
			this.staticRange=false;
		    /**
			 * Set a maximum size for the dataSet to prevent it from growing excessively large.
			 * Older data will be sliced off of the end (historical) of the dataSet array as new bars arrive.
			 * Set to 0 to let it grow forever.
		     * @type number
		     * @default
		     * @alias maxDataSetSize
		     * @memberof CIQ.ChartEngine.prototype
		     */
			this.maxDataSetSize=20000;
			/**
			 * Set a maximum size for masterData to prevent it from growing excessively large.
			 * Older data will be sliced off of the end of masterData array as new bars arrive.
			 * By default (set to 0) masterData is unlimited and will grow forever.
			 * Note: when rolling up data due to periodicity, you should anticipate large enough masterData to accomodate the desired chart length.
			 *
			 * @type {number}
			 * @default false
			 * @alias maxMasterDataSize
			 * @memberof CIQ.ChartEngine.prototype
			 * @since 3.0.0
			 */
			this.maxMasterDataSize=0;
			/**
		     * Set to zero to avoid resize checking loop. See {@link CIQ.ChartEngine#setResizeTimer} for more details
		     * @type number
		     * @default
		     * @alias resizeDetectMS
		     * @memberof CIQ.ChartEngine.prototype
		     */
			this.resizeDetectMS=1000;
			/**
			 * Set to true to display the xAxis below all panels.
			 * By default, the x axis will be rendered right under the main chart panel.
			 * @type boolean
			 * @default
			 * @alias xAxisAsFooter
			 * @memberof CIQ.ChartEngine.prototype
			 * @since
			 * <br>&bull; 05-2016-10
			 * <br>&bull; 4.1.0 now defaults to true
			 * <br>&bull; 5.2.0 vertical grid lines in study panels no longer dependent on this property and will be always displayed.
			 */
			this.xAxisAsFooter = true;
			/**
			 * Sets the x axis height in pixels.
			 * @type boolean
			 * @default
			 * @alias xaxisHeight
			 * @memberof CIQ.ChartEngine.prototype
			 * @since 4.1.0 Now defaults to 30 px
			 */
			this.xaxisHeight = 30;
			/**
			 * Set to true to display horizontal grid lines on studies.
			 * This parameter is only used when a custom y axis is **not** defined for the study.
			 * @type boolean
			 * @default false
			 * @alias displayGridLinesInStudies
			 * @memberof 	CIQ.ChartEngine.prototype
			 * @since 3.0.0
			 */
			this.displayGridLinesInStudies=false;
			/**
			 * When true serialize methods may escape their values with encodeURIComponent.
			 * @type boolean
			 * @default
			 * @alias escapeOnSerialize
			 * @memberof CIQ.ChartEngine.prototype
			 * @since 4.1.0
			 */
			this.escapeOnSerialize=true;
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
		     * @memberof CIQ.ChartEngine.prototype
		     */
			this.candleWidthPercent=0.65;
		    /**
		     * Color a colored bar or a volume bar based on difference between open and close, rather than difference between previous close and close.
		     * @type boolean
		     * @default
		     * @alias colorByCandleDirection
		     * @memberof CIQ.ChartEngine.prototype
		     * @since 4.0.0
		     */
			this.colorByCandleDirection=false;
		    /**
		     * chart types which do not draw wicks on candles
		     * @type object
		     * @default
		     * @alias noWicksOnCandles
		     * @memberof CIQ.ChartEngine.prototype
		     */
			this.noWicksOnCandles={"renko":true,"linebreak":true};
		    /**
		     * chart types which require fetching as many bars as possible (since they aggregate data)
		     * @type object
		     * @default
		     * @alias fetchMaximumBars
		     * @memberof CIQ.ChartEngine.prototype
		     */
			this.fetchMaximumBars={"rangebars":true,"kagi":true,"renko":true,"linebreak":true,"pandf":true};
		    /**
		     * READ ONLY. Access the renderer controlling the main series.
		     * @type CIQ.Renderer
		     * @default
		     * @alias mainSeriesRenderer
		     * @memberof CIQ.ChartEngine
		     */
			this.mainSeriesRenderer=null;
		    /**
		     * Chart types which plot more than one data field (OHLC charts).
		     * Putting a chart type here will disable the use of {@link CIQ.ChartEngine.Chart#defaultPlotField}.
		     * @type object
		     * @default
		     * @alias highLowBars
		     * @deprecated, access property in chart instead (stxx.chart.highLowBars)
		     * @memberof CIQ.ChartEngine.prototype
		     * @since 4.0.0
		     */
			this.highLowBars={"bar":true,"colored_bar":true,"candle":true,"hollow_candle":true,"volume_candle":true,"hlc":true,"colored_hlc":true,"hlc_box":true,"hlc_shaded_box":true,"wave":true,"rangechannel":true,"none":true};
		    /**
		     * Chart types whose bars represent a stand-alone entity as opposed to a vertex in a line-type chart.
		     * This is important when the engine tries to render the data points right off the chart; in a stand-alone bar,
		     * the points right off the chart need not be considered.
		     * @type object
		     * @default
		     * @alias standaloneBars
		     * @deprecated, access property in chart instead (stxx.chart.standaloneBars)
		     * @memberof CIQ.ChartEngine.prototype
		     * @since 4.0.0
		     */
			this.standaloneBars={"bar":true,"colored_bar":true,"candle":true,"hollow_candle":true,"volume_candle":true,"hlc":true,"colored_hlc":true,"hlc_box":true,"hlc_shaded_box":true,"histogram":true,"scatterplot":true};
		    /**
		     * Chart types whose bars have width, as opposed to a line-type chart whose "bars" are just a point on the chart.
		     * This is useful when the engine adjusts the chart for smooth scrolling and homing.
		     * @type object
		     * @default
		     * @alias barsHaveWidth
		     * @deprecated, access property in chart instead (stxx.chart.barsHaveWidth)
		     * @memberof CIQ.ChartEngine.prototype
		     * @since 4.0.0
		     */
			this.barsHaveWidth={"bar":true,"colored_bar":true,"candle":true,"hollow_candle":true,"volume_candle":true,"hlc":true,"colored_hlc":true,"hlc_box":true,"hlc_shaded_box":true,"histogram":true,"scatterplot":true,"wave":true};
			/**
		     * Allow the candle width to be determined dynamically when using {@link CIQ.ChartEngine#setRange}.
		     * This will require a valid {@link CIQ.ChartEngine#dynamicRangePeriodicityMap}
		     * @type object
		     * @default
		     * @alias autoPickCandleWidth
		     * @memberof CIQ.ChartEngine.prototype
		     * @example
				autoPickCandleWidth:{
					turnOn: true,
					candleWidth: 5
				}
		     * @since m-2016-12-01
		     */
			this.autoPickCandleWidth={
					/**
				     * Turn to 'true' if you want the periodicity to be determined dynamically when using {@link CIQ.ChartEngine#setRange}.
				     * This will require a valid {@link CIQ.ChartEngine#dynamicRangePeriodicityMap}
				     * @type boolean
				     * @default
				     * @alias autoPickCandleWidth[`turnOn`]
				     * @memberof! CIQ.ChartEngine#
				     */
					turnOn: false,

					/**
				     * Set if you want to set a specific candle width when using {@link CIQ.ChartEngine#setRange}.
				     * This will require a valid {@link CIQ.ChartEngine#dynamicRangePeriodicityMap}.
				     * Set to '0' if you want the candle width to be determined according to chart type
				     * @type number
				     * @default
				     * @alias autoPickCandleWidth[`candleWidth`]
				     * @memberof! CIQ.ChartEngine#
				     */
					candleWidth: 5
			};

			/**
		     * Map of default values to be used to statically set periodicity (candle width) upon range selection when using {@link CIQ.ChartEngine#setRange}
		     *
		     * **Default Value:**
		     * ```
				[
					{
						rangeInMS : CIQ.WEEK,	// Any range less than a week, load 5 minute bars
						periodicity : 1,
						interval : 5,
						timeUnit : 'minute'
					},
					{
						rangeInMS : CIQ.MONTH,	// Any range less than a month, load 30 minute bars
						periodicity : 1,
						interval : 30,
						timeUnit : 'minute'
					},
					{
						rangeInMS : CIQ.YEAR,	// Any range less than a year, load day bars
						periodicity : 1,
						interval : "day"
					},
					{
						rangeInMS : CIQ.DECADE,	// Any range less than 10 years, load weekly bars
						periodicity : 1,
						interval : "week"
					},
					{
						rangeInMS : CIQ.DECADE * 10,	// Any range less than a century, load monthly bars
						periodicity : 1,
						interval : "month"
					},
					{
						rangeInMS : Number.MAX_VALUE,	// Anything greater than a century, load yearly bars
						periodicity : 12,
						interval : "month"
					}
				]
		     * ```
		     * @type array
		     * @alias staticRangePeriodicityMap
		     * @memberof CIQ.ChartEngine.prototype
		     * @since m-2016-12-01
		     */
			this.staticRangePeriodicityMap=[
				{
					rangeInMS : CIQ.WEEK,	// Any range less than a week, load 5 minute bars
					periodicity : 1,
					interval : 5,
					timeUnit : 'minute'
				},
				{
					rangeInMS : CIQ.MONTH,	// Any range less than a month, load 30 minute bars
					periodicity : 1,
					interval : 30,
					timeUnit : 'minute'
				},
				{
					rangeInMS : CIQ.YEAR,	// Any range less than a year, load day bars
					periodicity : 1,
					interval : "day"
				},
				{
					rangeInMS : CIQ.DECADE,	// Any range less than 10 years, load weekly bars
					periodicity : 1,
					interval : "week"
				},
				{
					rangeInMS : CIQ.DECADE * 10,	// Any range less than a century, load monthly bars
					periodicity : 1,
					interval : "month"
				},
				{
					rangeInMS : Number.MAX_VALUE,	// Anything greater than a century, load yearly bars
					periodicity : 12,
					interval : "month"
				}
			];

			/**
		     * Map of multiples to be used to dynamically determine periodicity (candle width) upon range selection when using {@link CIQ.ChartEngine#setRange}
		     * Used when {@link CIQ.ChartEngine#autoPickCandleWidth} is enabled
		     *
		     * **Default Value:**
		     * ```
				[
					{
						interval : 1,
						rangeInMS : CIQ.MINUTE
					},
					{
						interval : 5,
						rangeInMS : CIQ.MINUTE * 5
					},
					{
						interval : 30,
						rangeInMS : CIQ.MINUTE * 30
					},
					{
						interval : 60,
						rangeInMS : CIQ.MINUTE * 60
					},
					{
						interval : "day",
						rangeInMS : CIQ.DAY
					},
					{
						interval : "month",
						rangeInMS : CIQ.MONTH
					},
					{
						interval : "year",
						rangeInMS : CIQ.YEAR
					}
				]
		     * ```

		     * @type array
		     * @alias dynamicRangePeriodicityMap
		     * @memberof CIQ.ChartEngine.prototype
		     * @since 11-2016-29
		     */
			this.dynamicRangePeriodicityMap=[ {
				interval : 1,
				timeUnit : 'minute',
				rangeInMS : CIQ.MINUTE
			}, {
				interval : 5,
				timeUnit : 'minute',
				rangeInMS : CIQ.MINUTE * 5
			}, {
				interval : 30,
				timeUnit : 'minute',
				rangeInMS : CIQ.MINUTE * 30
			}, {
				interval : 60,
				timeUnit : 'minute',
				rangeInMS : CIQ.MINUTE * 60
			}, {
				interval : "day",
				rangeInMS : CIQ.DAY
			}, {
				interval : "month",
				rangeInMS : CIQ.MONTH
			}, {
				interval : "year",
				rangeInMS : CIQ.YEAR
			} ];

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
					var wheelListener;
					if(CIQ.isIE){
						wheelListener = function(e){
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
						};
					}else{
						wheelListener = function(e){
							if (CIQ.ChartEngine.insideChart) e.preventDefault();
						};
					}
					this.addDomEventListener(document.body, "wheel", wheelListener);
					CIQ.FireFoxWheelWorkaround=true;
				}
			}
			this.construct();

		};


	    /**
	     * READ ONLY. Toggles to true when a drawing is initiated
	     * @type boolean
	     * @default
	     * @alias drawingLine
	     * @memberof CIQ.ChartEngine
	     */
		CIQ.ChartEngine.drawingLine=false;
	    /**
	     * READ ONLY. Toggles to true when a panel is being resized
	     * @type boolean
	     * @default
	     * @alias resizingPanel
	     * @memberof CIQ.ChartEngine
	     */
		CIQ.ChartEngine.resizingPanel=null;
		CIQ.ChartEngine.vectorType="";		// @deprecated
	    /**
	     * READ ONLY. Current X screen coordinate of the crosshair.
	     * @type number
	     * @default
	     * @alias crosshairX
	     * @memberof CIQ.ChartEngine
	     */
		CIQ.ChartEngine.crosshairX=0;
	    /**
	     * READ ONLY. Current Y screen coordinate of the crosshair.
	     * @type number
	     * @default
	     * @alias crosshairY
	     * @memberof CIQ.ChartEngine
	     */
		CIQ.ChartEngine.crosshairY=0;
	    /**
	     * READ ONLY. Toggles to true whenever the mouse cursor is within the chart (canvas)
	     * @type boolean
	     * @default
	     * @alias insideChart
	     * @memberof CIQ.ChartEngine
	     */
		CIQ.ChartEngine.insideChart=false;
	    /**
	     * READ ONLY. Toggles to true if the mouse cursor is over the X Axis.
	     * @type boolean
	     * @default
	     * @alias overXAxis
	     * @memberof CIQ.ChartEngine
	     */
		CIQ.ChartEngine.overXAxis=false;
	    /**
	     * READ ONLY. Toggles to true if the mouse cursor is over the Y Axis.
	     * @type boolean
	     * @default
	     * @alias overYAxis
	     * @memberof CIQ.ChartEngine
	     */
		CIQ.ChartEngine.overYAxis=false;
		CIQ.ChartEngine.currentColor="auto";	// @deprecated Currently selected color for drawing tools. This may be changed by developing a menu with a color picker.
		CIQ.ChartEngine.drawingTools={};
	    /**
	     * [Browser animation API](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) is on by default.
	     * @type boolean
	     * @default
	     * @alias useAnimation
	     * @memberof CIQ.ChartEngine
	     */
		CIQ.ChartEngine.useAnimation=true;
	    /**
	     * This setting limits the maximum number of bars to be drawn on an iOS device to help address performance limitations on that OS.
	     * @type number
	     * @default
	     * @alias ipadMaxTicks
	     * @memberof CIQ.ChartEngine
	     */
		CIQ.ChartEngine.ipadMaxTicks=1500;
		CIQ.ChartEngine.enableCaching=false;
	    /**
	     * Set to true to true to bypass all touch event handling.
	     * @type number
	     * @default
	     * @alias ignoreTouch
	     * @memberof CIQ.ChartEngine
	     */
		CIQ.ChartEngine.ignoreTouch=false;
		CIQ.ChartEngine.useOldAndroidClear=true;	// Turn this off to boost native android browser performance, but at risk of "double candle" display errors on some devices
		/**
		 * Each CIQ.ChartEngine object will clone a copy of this object template and use it to store the settings for the active drawing tool.
		 * The default settings can be changed by overriding these defaults on your own files.
		 * See {@tutorial Custom Drawing Toolbar} for details on how to use this template to replace the standard drawing toolbar.
		 * <br>This object can be extended to support additional drawing tools (for instance note the extensive customization capabilities for fibonacci)
		 * @type {object}
	     * @alias currentVectorParameters
		 * @memberof! CIQ.ChartEngine#
		 */
		CIQ.ChartEngine.currentVectorParameters={
			/**
			 *  Drawing to activate.
		     * <br>See 'Classes' in {@link CIQ.Drawing} for available drawings.
		     * Use {@link CIQ.ChartEngine#changeVectorType} to activate.
		     * @type string
		     * @alias currentVectorParameters[`vectorType`]
		     * @memberof! CIQ.ChartEngine#
		     */
			vectorType: null,
			/**
			 *  Line pattern.
			 * <br><B>Valid values for pattern: solid, dotted, dashed, none</B>
			 * <br>Not all parameters/values are valid on all drawings. See the specific `reconstruct` method for your desired drawing for more details(Example: {@link CIQ.Drawing.horizontal#reconstruct})
		     * @type string
		     * @default
		     * @alias currentVectorParameters[`pattern`]
		     * @memberof! CIQ.ChartEngine
		     */
			pattern:"solid",
			/**
			 *  Line width
			 * <br>Not all parameters/values are valid on all drawings. See the specific `reconstruct` method for your desired drawing for more details(Example: {@link CIQ.Drawing.horizontal#reconstruct})
		     * @type number
		     * @default
		     * @alias currentVectorParameters[`lineWidth`]
		     * @memberof! CIQ.ChartEngine#
		     */
			lineWidth:1,
			/**
			 *  Fill color.
			 * <br>Not all parameters/values are valid on all drawings. See the specific `reconstruct` method for your desired drawing for more details(Example: {@link CIQ.Drawing.horizontal#reconstruct})
		     * @type string
		     * @default
		     * @alias currentVectorParameters[`fillColor`]
		     * @memberof! CIQ.ChartEngine#
		     */
			fillColor:"#7DA6F5",
			/**
			 * Line color.
			 * <br>Not all parameters/values are valid on all drawings. See the specific `reconstruct` method for your desired drawing for more details(Example: {@link CIQ.Drawing.horizontal#reconstruct})
		     * @type string
		     * @default
		     * @alias currentVectorParameters[`currentColor`]
		     * @memberof! CIQ.ChartEngine#
		     */
			currentColor: "auto",
			/**
			 * Axis Label.
			 * Set to 'true' to display a label on the x axis.
			 * <br>Not all parameters/values are valid on all drawings. See the specific `reconstruct` method for your desired drawing for more details(Example: {@link CIQ.Drawing.horizontal#reconstruct})
		     * @type string
		     * @default
		     * @alias currentVectorParameters[`axisLabel`]
		     * @memberof! CIQ.ChartEngine#
		     */
			axisLabel:true,
			/**
			 * Fibonacci settings.
			 * See {@link CIQ.Drawing.fibonacci#reconstruct} `parameters` object for valid options
		     * @type object
		     * @alias currentVectorParameters[`fibonacci`]
		     * @memberof! CIQ.ChartEngine#
		     * @example
				fibonacci:{
					trend:{color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}},
					fibs:[
						  {level:-0.786, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}},
					      {level:-0.618, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}, display: true},
					      {level:-0.382, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}, display: true},
					      {level:0, color:"auto", parameters:{pattern:"solid", lineWidth:1}, display: true},
					      {level:0.382, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}, display: true},
					      {level:0.618, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}, display: true},
					      {level:0.786, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}},
					      {level:0.5, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}, display: true},
					      {level:1, color:"auto", parameters:{pattern:"solid", lineWidth:1}, display: true},
					      {level:1.382, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}, display: true},
					      {level:1.618, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}, display: true}
					      ],
					extendLeft: false,
					printLevels: true, // display the % levels to the right of the drawing
					printValues: false, // display the values on the y axis
					timezone:{color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}}
				}
			 * @since
			 * <br>&bull; 3.0.9 '0.786' and '-0.786' levels added
			 * <br>&bull; 5.2.0 '1.272' level added
		     */
			fibonacci:{
				trend:{color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}},
				fibs:[
					{level:-0.786, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}},
					{level:-0.618, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}, display: true},
					{level:-0.5, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}},
					{level:-0.382, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}, display: true},
					{level:-0.236, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}},
					{level:0, color:"auto", parameters:{pattern:"solid", lineWidth:1}, display: true},
					{level:0.236, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}},
					{level:0.382, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}, display: true},
					{level:0.5, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}, display: true},
					{level:0.618, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}, display: true},
					{level:0.786, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}},
					{level:1, color:"auto", parameters:{pattern:"solid", lineWidth:1}, display: true},
					{level:1.272, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}},
					{level:1.382, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}, display: true},
					{level:1.618, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}, display: true},
					{level:2.618, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}},
					{level:4.236, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}}
				],
				extendLeft: false,
				printLevels: true,
				printValues: false,
				timezone:{color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}}
			},
			/**
			 * Annotation settings.
		     * @type object
		     * @alias currentVectorParameters[`annotation`]
		     * @memberof! CIQ.ChartEngine#
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
		 * Defines an object used for rendering a chart and is automatically created by the {@link CIQ.ChartEngine}.
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
			this.state={};
			this.endPoints={};
			this.defaultChartStyleConfig={};
			this.baseline=CIQ.clone(this.baseline);  // copy from prototype
		};


		/**
		 * Defines an object used for rendering the Y-axis on a panel.
		 * Each panel object will automatically include a YAxis object, which can be adjusted immediately after declaring your `new CIQ.ChartEngine();`
		 * Any adjustments to the Y-axis members after it has been rendered and will require a draw() call to apply the changes ( initializeChart() may be required as well depending on the setting being changed).
		 *
		 * See {@tutorial Gridlines and axis labels}, {@link CIQ.ChartEngine.AdvancedInjectable#createYAxis} and {@link CIQ.ChartEngine.AdvancedInjectable#drawYAxis} for additional customization instructions.
		 *
		 * Example: stxx.panels['chart'].yAxis
		 *
		 * Example: stxx.chart.yAxis (convenience shortcut for accessing the main panel object - same as above)
		 *
		 * Example: stxx.panels['Aroon (14)'].yAxis
		 *
		 * **Note:** If modifying a y-axis placement setting (widht, margins, position left/right, etc) after the axis has been rendered, you will need to call
		 * {@link CIQ.ChartEngine#calculateYAxisMargins} or {@link CIQ.ChartEngine#calculateYAxisPositions} followed by {@link CIQ.ChartEngine#draw} to activate the change.
		 *
		 * @constructor
		 * @name  CIQ.ChartEngine.YAxis
		 * @param {object} init Object containing custom values for Y-axis members
		 * @example
		 * // here is an example on how to override the default top and bottom margins after the initial axis has already been rendered
		 * stxx.newChart(symbol, yourData, null, function () {    // call new chart to render your data
		 *    	// callback - your code to be executed after the chart is loaded
		 * 		stxx.chart.yAxis.initialMarginTop=50;
		 * 		stxx.chart.yAxis.initialMarginBottom=50;
		 * 		stxx.calculateYAxisMargins(stxx.chart.panel.yAxis); // must recalculate the margins after they are changed.
		 * 		stxx.draw();
		 * });
		 * @example
		 * // here is an example on how to override the default top and bottom margins before the initial axis has been rendered
		 * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
		 * stxx.setPeriodicity({period:1, interval:1, timeUnit:"minute"}); 			// set your default periodicity to match your data. In this case one minute.
		 * stx.chart.yAxis.initialMarginTop=50;		// set default margins so they do not bump on to the legend
		 * stx.chart.yAxis.initialMarginBottom=50;
		 * stx.newChart("SPY", yourData);
		 * @example
		 * // here is an example on how to turn off the last price label (main chart panel) before the initial axis has already been rendered
		 * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
		 * stxx.chart.panel.yAxis.drawCurrentPriceLabel=false;
		 *
		 * @since 5.1.0 created a name member which is used to determine if the yAxis is the same as another.
		 */
		CIQ.ChartEngine.YAxis=function(init){
			for(var field in init) this[field]=init[field];
			if(!this.name) this.name=CIQ.uniqueID();
		};

		/**
		 * Defines an object used for rendering the X-axis on the chart, which can be adjusted immediately after declaring your `new CIQ.ChartEngine();`
		 * The CIQ.ChartEngine.XAxis object is created by and part of the {@link CIQ.ChartEngine.Chart} object and is used on the main chart pannel only.
		 * There is only one x axis per chart container.
		 *
		 * Colors and fonts for the x axis can be controlled by manipulating the CSS.
		 * You can override the `stx_xaxis` class to change the font or colors.
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
		 * @param {object} init Object containing custom values for X-axis members
		 * @example
		 * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
		 * stxx.chart.xAxis.formatter=formatFunction;
		 */
		CIQ.ChartEngine.XAxis=function(init){
			for(var field in init) this[field]=init[field];
		};

		/**
		 * Defines a Panel object.
		 * Every chart or study is rendered in a panel.
		 *
		 * Example: stxx.panels['chart']
		 *
		 * Example: stxx.panels['Aroon (14)']

		 * @param {string} name The name of the panel.
		 * @param {CIQ.ChartEngine.YAxis} [yAxis] Y axis ({@link CIQ.ChartEngine.YAxis}) object for the panel.
		 * @constructor
		 * @name  CIQ.ChartEngine.Panel
		 */
		CIQ.ChartEngine.Panel=function(name, yAxis){
			if(yAxis) this.yAxis=yAxis;
			else this.yAxis=new CIQ.ChartEngine.YAxis();
			this.name=name;
			this.state = {}; // drawing state of the panel, can be studies, drawings, or any panel-scoped object
		};

		CIQ.extend(CIQ.ChartEngine.YAxis.prototype, {
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
		}, true);

		/**
		 * Controls maximum number of decimal places to ever display on a y-axis floating price label.
		 *
		 * Set to the maximum decimal places from 0 to 10, or leave null and the chart will choose automatically based on {@link CIQ.ChartEngine.YAxis#shadowBreaks}.
		 * - See {@link CIQ.ChartEngine.YAxis#decimalPlaces} for controlling decimal places on the axis itself.
		 * - See {@link CIQ.ChartEngine.YAxis#width} and {@link CIQ.ChartEngine.Chart#dynamicYAxis} to manage the width of the y axis.
		 * @type number
		 * @default
		 * @memberof CIQ.ChartEngine.YAxis
		 * @since 5.2.1 default is changed to null
		 */
		CIQ.ChartEngine.YAxis.prototype.maxDecimalPlaces = null;

		/**
		 * Optionally hard set the high (top value) of the yAxis (for instance when plotting 0 - 100% charts)
		 * @type number
		 * @default
		 * @memberof CIQ.ChartEngine.YAxis
		 */
		CIQ.ChartEngine.YAxis.prototype.max = null;

		/**
		 * Optionally hard set the low (bottom value) of the yAxis (for instance when plotting 0 - 100% charts)
		 * @type number
		 * @default
		 * @memberof CIQ.ChartEngine.YAxis
		 */
		CIQ.ChartEngine.YAxis.prototype.min = null;

		/**
		 * Controls the number of decimal places on the y axis labels.
		 *
		 * Set to the preferred number of decimal places from 0 to 10, or leave null and the chart will choose automatically based on {@link CIQ.ChartEngine.YAxis#shadowBreaks}
		 * - **Note:**  study panel axis will be condensed if over 999 by the use of {@link condenseInt}.
		 *
		 * - See {@link CIQ.ChartEngine.YAxis#maxDecimalPlaces} for further controlling decimal places on floating labels.<br>
		 * - See {@link CIQ.ChartEngine.YAxis#width} and {@link CIQ.ChartEngine.Chart#dynamicYAxis} to manage the width of the y axis.
		 * - See {@link CIQ.ChartEngine.YAxis#shadowBreaks} to override how many decimal places to print based on the size of the shadow (the difference between chart high and chart low).
		 *
		 * @type number
		 * @default
		 * @memberof CIQ.ChartEngine.YAxis
		 * @since 5.2.0 default is changed to null
		 */
		CIQ.ChartEngine.YAxis.prototype.decimalPlaces= null;

		/**
		 * Ideal size between y-axis values in pixels. Leave null to automatically calculate.
		 * See {@tutorial Gridlines and  axis labels} for additional details.
		 * @type number
		 * @default
		 * @memberof CIQ.ChartEngine.YAxis
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
		 * **Note that this parameter will be ignored if {@link CIQ.ChartEngine.YAxis#pretty} is set to `true`. If you require specific price intervals, please set {@link CIQ.ChartEngine.YAxis#pretty} to 'false' before setting `minimumPriceTick` **
		 *
		 * Visual Reference:<br>
		 * ![yAxis.minimumPriceTick](yAxis.minimumPriceTick.png "yAxis.minimumPriceTick")
		 *
		 * @type number
		 * @default
		 * @memberof CIQ.ChartEngine.YAxis
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
		 * To disable the formatting you must reset both the yAxis.priceFormatter and this fractional object to 'null'.
		 * <br>Example:
		 * ```
		 * stxx.chart.yAxis.priceFormatter=stxx.chart.yAxis.fractional=null;
     	 * ```
		 *
		 * @type object
		 * @default
		 * @memberof CIQ.ChartEngine.YAxis
		 * @example
		 * // Declare a CIQ.ChartEngine object. This is the main object for drawing charts
		 * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
		 * // set axis to display in 1/32nds; for example, 100 5/32 will display as 100'05.  If there is a price midway between
		 * // two ticks (for example, 11/64), a plus (+) will follow the price; for example 100 11/64 will display as 100'11+.
		 * stxx.chart.yAxis.fractional={
				formatter: "'",				// This is the character used to separate he whole number portion from the numerator (' default)
				resolution: 1/32			// Set to smallest increment for the quoted amounts
			}
		 */
		CIQ.ChartEngine.YAxis.prototype.fractional= null;

		/**
		 * Set to `true` to draw tick marks and a vertical border line at the edge of the y-axis  (use with CIQ.ChartEngine#yaxisPaddingRight and CIQ.ChartEngine#yaxisPaddingLeft)
		 * @type boolean
		 * @default
		 * @memberof CIQ.ChartEngine.YAxis
		 */
		CIQ.ChartEngine.YAxis.prototype.displayBorder= true;

		/**
		 * Set to `false` to hide grid lines. See {@tutorial Gridlines and  axis labels} for additional details.
		 * @type boolean
		 * @default
		 * @memberof CIQ.ChartEngine.YAxis
		 */
		CIQ.ChartEngine.YAxis.prototype.displayGridLines= true;

		/**
		 * Switch to 'temporarily' hide the y-axis. Set to `true' to activate. 
		 * Will not modify the location of the axis; to do that use {@link CIQ.ChartEngine#setYAxisPosition} instead.
		 * @type boolean
		 * @default
		 * @memberof CIQ.ChartEngine.YAxis
		 */
		CIQ.ChartEngine.YAxis.prototype.noDraw= null;

		/**
		 * Set to `false` to hide the current price label <b>in the main panel's y-axis</b>.
		 *
		 * See {@link CIQ.ChartEngine.AdvancedInjectable#drawCurrentHR}
		 *
		 * Visual Reference:<br>
		 * ![yAxis.drawCurrentPriceLabel](drawCurrentPriceLabel.png "yAxis.drawCurrentPriceLabel")
		 * @type boolean
		 * @default
		 * @memberof CIQ.ChartEngine.YAxis
		 * @since  04-2015
		 */
		CIQ.ChartEngine.YAxis.prototype.drawCurrentPriceLabel=true;

		/**
		 * Set to `false` to hide the series price labels <b>in the main panel's y-axis</b>.
		 *
		 * @type boolean
		 * @default
		 * @memberof CIQ.ChartEngine.YAxis
		 * @since  3.0.0
		 */
		CIQ.ChartEngine.YAxis.prototype.drawSeriesPriceLabels=true;

		/**
		 * Set to false to hide **all** price labels on the particular y axis.
		 * <br>See {@link CIQ.ChartEngine.YAxis#drawCurrentPriceLabel} to disable just the current price label on the main chart panel.
		 * <br>See <a href="CIQ.ChartEngine.html#preferences%5B%60labels%60%5D">CIQ.ChartEngine.preferences.labels</a> to disable just the last value label on studies.
		 * @type boolean
		 * @default
		 * @memberof CIQ.ChartEngine.YAxis
		 * @since  04-2015
		 */
		CIQ.ChartEngine.YAxis.prototype.drawPriceLabels=true;


		/**
		 * When `true`, will attempt to create grid lines that approximate a `golden ratio` between x and y axis by basing grid on {@link CIQ.ChartEngine.YAxis#idealTickSizePixels}.
		 * This creates an "airy" modern looking chart.
		 * If set to false, each axis will be adjusted separately and may create long and narrow rectangular greeds depending on date or price range.
		 * @type boolean
		 * @default
		 * @memberof CIQ.ChartEngine.YAxis
		 * @since
		 * <br>&bull; 04-2015
		 * <br>&bull; 4.0.0 Now defaults to true.
		 */
		CIQ.ChartEngine.YAxis.prototype.goldenRatioYAxis=true;


		/**
		 * Shape of the floating y axis label.
		 *
		 * Available options:
		 *  - ["roundRectArrow"]{@link CIQ.roundRectArrow}
		 *  - ["semiRoundRect"]{@link CIQ.semiRoundRect}
		 *  - ["roundRect"]{@link CIQ.roundRect}
		 *  - ["tickedRect"]{@link CIQ.tickedRect}
		 *  - ["rect"]{@link CIQ.rect}
		 *  - ["noop"]{@link CIQ.noop}
		 *
		 * It will default to {@link CIQ.ChartEngine#yaxisLabelStyle}.
		 * This could be set independently on each panel if desired.
		 * @type string
		 * @default
		 * @memberof CIQ.ChartEngine.YAxis
		 * @since  04-2015
		 * @example
		 * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
		 * stxx.chart.yAxis.yaxisLabelStyle="rect"
		 */
		CIQ.ChartEngine.YAxis.prototype.yaxisLabelStyle=null;

		/**
		 * Set to `true` to right justify the yaxis labels
		 * Set to `false` to force-left justify the labels, even when the axis is on the left.
		 * Set to null to have the justification automatically adjusted based on the axis position. Right axis will justify left, and left axis will justify right.

		 *
		 * This setting does not control the floating last price. See {@link CIQ.ChartEngine.AdvancedInjectable#drawCurrentHR} and {@link CIQ.ChartEngine#createYAxisLabel}
		 * @type boolean
		 * @default
		 * @memberof CIQ.ChartEngine.YAxis
		 * @since  
		 * <br>&bull; 15-07-01
		 * <br>&bull; 6.2.0 Formalized distinction between null and false values
		 */
		CIQ.ChartEngine.YAxis.prototype.justifyRight=null;

		/**
		 * Set to true to put a rectangle behind the yaxis text (use with CIQ.ChartEngine#yaxisPaddingRight and CIQ.ChartEngine#yaxisPaddingLeft)
		 * @type boolean
		 * @default
		 * @memberof CIQ.ChartEngine.YAxis
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
		 * 		stx           - {@link CIQ.ChartEngine}       - The chart object
		 *		panel         - {@link CIQ.ChartEngine.Panel} - The panel
		 *		price         - number                - The price to format
		 *		decimalPlaces - number                - Optional - Number of decimal places to use
		 *													(may not always be present)
		 *
		 * Returns:
		 *
		 *		text - Formated text label for the price
		 *
		 * @type function
		 * @example
		 * stxx.chart.yAxis.priceFormatter=function(stx, panel, price, decimalPlaces){
		 * 	var convertedPrice;
		 * 	  // add our logic here to convert 'price' to 'convertedPrice'
		 *    return convertedPrice; // string
		 * }
		 * @default
		 * @memberof CIQ.ChartEngine.YAxis
		 */
		CIQ.ChartEngine.YAxis.prototype.priceFormatter= null;

		/**
		 * Sets the y-axis bottom on any panel.
		 * Rendering will start this number of pixels above the panel's bottom.
		 * Note that {@link CIQ.ChartEngine#adjustPanelPositions} and {@link CIQ.ChartEngine#draw} will need to be called to immediately activate this setting after the axis has already been drawn.
		 *
		 * Visual Reference:<br>
		 * ![yAxis.width](yAxis.bottomOffset.png "yAxis.bottomOffset")
		 * ![yAxis.width](yAxis.bottomTopOffset.png "yAxis.bottomTopOffset")
		 * @type number
		 * @default
		 * @memberof CIQ.ChartEngine.YAxis
		 * @example
		 * // The list of current panels can be found in "stxx.panels".
		 * stxx.panels[panelName].yAxis.bottomOffset=20;
		 * stxx.panels[panelName].yAxis.topOffset=60;
		 * stxx.adjustPanelPositions();	// !!!! must recalculate the margins after they are changed. !!!!
		 * stxx.draw();
		 */
		CIQ.ChartEngine.YAxis.prototype.bottomOffset= 0;

		/**
		 * Sets y-axis top on Study panels.
		 * Rendering will start this number of pixels below the panel's top.
		 * Note that {@link CIQ.ChartEngine#adjustPanelPositions} and {@link CIQ.ChartEngine#draw} will need to be called to immediately activate this setting after the axis has already been drawn.
		 *
		 * Visual Reference:<br>
		 * ![yAxis.width](yAxis.bottomTopOffset.png "yAxis.bottomTopOffset")
		 * @type number
		 * @default
		 * @memberof CIQ.ChartEngine.YAxis
		 * @example
		 * // The list of current panels can be found in "stxx.panels".
		 * stxx.panels[panelName].yAxis.bottomOffset=20;
		 * stxx.panels[panelName].yAxis.topOffset=60;
		 * stxx.adjustPanelPositions();	// !!!! must recalculate the margins after they are changed. !!!!
		 * stxx.draw();
		 */
		CIQ.ChartEngine.YAxis.prototype.topOffset= 0;

		/**
		 * Set this to automatically compress and offset the y-axis so that this many pixels of white space is above the display.
		 * Note that {@link CIQ.ChartEngine#calculateYAxisMargins} and {@link CIQ.ChartEngine#draw} will need to be called to immediately activate this setting after the axis has already been drawn.
		 *
		 * Visual Reference:<br>
		 * ![yAxis.width](yAxis.initialMarginTop.png "yAxis.initialMarginTop")
		 * @type number
		 * @default
		 * @memberof CIQ.ChartEngine.YAxis
		 * @example
		 * // Here is an example on how to override the default top and bottom margins **before** the initial axis has been rendered
		 * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
		 * stxx.setPeriodicity({period:1, interval:1, timeUnit:"minute"});				// set your default periodicity to match your data. In this case one minute.
		 * stxx.chart.yAxis.initialMarginTop=50;		// set default margins so they do not bump on to the legend
		 * stxx.chart.yAxis.initialMarginBottom=50;
		 * stxx.newChart("SPY", yourData);
		 * @example
		 * // Here is an example on how to override the default top and bottom margins **after** the initial axis has already been rendered
		 * stxx.newChart(symbol, yourData, null, function () {    // call new chart to render your data
		 *    	// callback - your code to be executed after the chart is loaded
		 * 		stxx.chart.yAxis.initialMarginTop=50;
		 * 		stxx.chart.yAxis.initialMarginBottom=50;
		 * 		stxx.calculateYAxisMargins(stxx.chart.panel.yAxis); // !!!! must recalculate the margins after they are changed. !!!!
		 * 		stxx.draw();
		 * });
		 * @example
		 * // Here is an example on how to override the default top and bottom margins for a specific panel **after** the initial axis has already been rendered
		 * // The list of current panels can be found in "stxx.panels".
		 * stxx.panels[panelName].yAxis.initialMarginTop=100;
		 * stxx.panels[panelName].yAxis.initialMarginBottom=100;
		 * stxx.calculateYAxisMargins(stxx.panels[panelName].panel.yAxis); // !!!! must recalculate the margins after they are changed. !!!!
		 * stxx.draw();
		 */
		CIQ.ChartEngine.YAxis.prototype.initialMarginTop= 10;

		/**
		 * set this to automatically compress and offset the y-axis to that this many pixels of white space is below the display
		 * Note that {@link CIQ.ChartEngine#calculateYAxisMargins} and {@link CIQ.ChartEngine#draw} will need to be called to immediately activate this setting after the axis has already been drawn.
		 *
		 * Visual Reference:<br>
		 * ![yAxis.width](yAxis.initialMarginTop.png "yAxis.initialMarginTop")
		 * @type number
		 * @default
		 * @memberof CIQ.ChartEngine.YAxis
		 * @example
		 * // here is an example on how to override the default top and bottom margins **before** the initial axis has been rendered
		 * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
		 * stxx.setPeriodicity({period:1, interval:1, timeUnit:"minute"});				// set your default periodicity to match your data. In this case one minute.
		 * stxx.chart.yAxis.initialMarginTop=50;		// set default margins so they do not bump on to the legend
		 * stxx.chart.yAxis.initialMarginBottom=50;
		 * stxx.newChart("SPY", yourData);
		 * @example
		 * // here is an example on how to override the default top and bottom margins **after** the initial axis has already been rendered
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
		 * @type number
		 * @default
		 * @memberof CIQ.ChartEngine.YAxis
		 */
		CIQ.ChartEngine.YAxis.prototype.zoom= 0;

		/**
		 * set this to the number of pixels to offset the y-axis, positive or negative.
		 * @type number
		 * @default
		 * @memberof CIQ.ChartEngine.YAxis
		 */
		CIQ.ChartEngine.YAxis.prototype.scroll= 0;

		// get/set width to allow {@link CIQ.ChartEngine.Chart#dynamicYAxis} feature
		// to set _dynamicWidth instead of _width. This allows user widths to be
		// restored easily when the feature is not needed.
		Object.defineProperty(CIQ.ChartEngine.YAxis.prototype, 'width', {
			configurable: true,
			enumerable: true,
			get: function() {
				// _dynamicWidth is set by {@link CIQ.ChartEngine#drawYAxis} and
				// cleared by {@link CIQ.ChartEngine.Chart#resetDynamicYAxis}
				return this._dynamicWidth || this._width;
			},
			set: function(value) {
				this._width = value;
				// the calculated width is less than user value, getter should return the user value
				if (this._dynamicWidth < value) this._dynamicWidth = NaN;
			}
		});

		/**
		 * The width in pixels.
		 *
		 * See {@link CIQ.ChartEngine.Chart#dynamicYAxis} to set automatically.
		 *
		 * Visual Reference:<br>
		 * ![yAxis.width](yAxis.width.png "yAxis.width")
		 * @type number
		 * @default
		 * @memberof CIQ.ChartEngine.YAxis
		 * @example
		 * stxx.chart.yAxis.width=50;
		 * //must call the following 2 lines to activate if the axis is already drawn.
		 * stxx.calculateYAxisPositions();
		 * stxx.draw();
		 * @example
		 * // reset width to default
		 * stxx.chart.yAxis.width = CIQ.ChartEngine.YAxis.prototype.width;
		 */
		CIQ.ChartEngine.YAxis.prototype.width = 50;

		/**
		 * Override the default stx_yaxis style for text by setting this to the desired CSS style. This would typically be used to set a secondary axis to a particular color.
		 * @type string
		 * @default
		 * @memberof CIQ.ChartEngine.YAxis
		 * @since  15-07-01
		 */
		CIQ.ChartEngine.YAxis.prototype.textStyle = null;

		/**
		 * Set to "left" or "right" to **initialize** the y-axis location. 
		 * 
		 * By default y-axis are drawn on the right side of the chart.
		 * The main y-axis for any study panel will follow the main chart axis as long as this is set to null.
		 * 
		 * Do not use this method to change the location of an existing y-axis.
		 * Once initialized, y axis location can be changed at any time by calling {@link CIQ.ChartEngine#setYAxisPosition}
		 * 
		 * @type string
		 * @default
		 * @memberof CIQ.ChartEngine.YAxis
		 * @example  <caption>Pre-set the main y-axis for the chart on the left; **before it is initially rendered**.</caption>
		 * stxx.chart.yAxis.position = 'left';
		 * @example  <caption>Re-set the main y-axis for the chart on the right; **after it is initially rendered**.</caption>
		 * stxx.setYAxisPosition(stxx.chart.yAxis,'right');
		 * @since  15-07-01
		 */
		CIQ.ChartEngine.YAxis.prototype.position = null;

		/**
		 * Default setting for the array that determines how many decimal places to print based on the size of the shadow (the difference between chart high and chart low).
		 * The array consists of tuples in descending order. If the shadow is less than n1 then n2 decimal places will be printed.
		 * See {@link CIQ.ChartEngine.YAxis#shadowBreaks}
		 * @type array
		 * @memberof CIQ.ChartEngine.YAxis
		 * @since
		 * <br>&bull; 2015-11-1
		 * <br>&bull; 5.2.0 additioonal break added
		 * @default
		 */
		CIQ.ChartEngine.YAxis.defaultShadowBreaks=[[1000,2],[5,4],[0.001,8]];

		/**
		 * Alternative setting (for small charts)  array that determines how many decimal places to print based on the size of the shadow (the difference between chart high and chart low).
		 * The array consists of tuples in descending order. If the shadow is less than n1 then n2 decimal places will be printed.
		 * See {@link CIQ.ChartEngine.YAxis#shadowBreaks}
		 * @type array
		 * @memberof CIQ.ChartEngine.YAxis
		 * @since  2015-11-1
		 * @default
		 */
		CIQ.ChartEngine.YAxis.smallChartShadowBreaks=[[10,2],[1,4]];

		/**
		 * If true then uses the "pretty" algorithm instead of the "best fit" algorithm. The pretty algorithm
		 * uses the values specified in {@link CIQ.ChartEngine.YAxis#increments} to set axis label locations.
		 *
		 * **Note that this algorithm will override the {@link CIQ.ChartEngine.YAxis#minimumPriceTick}. If you require specific price intervals, please set this parameter to 'false' before setting `minimumPriceTick` **
		 *
		 * @memberof CIQ.ChartEngine.YAxis
		 * @since 2015-11-1
		 * @type boolean
		 * @default
		 */
		CIQ.ChartEngine.YAxis.prototype.pretty=true;

		/**
		 * Values used by the {@link CIQ.ChartEngine.YAxis#pretty} algorithm to set axis label locations.
		 * @memberof CIQ.ChartEngine.YAxis
		 * @since 2015-11-1
		 * @type array
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
		 * @type boolean
		 * @default
		 */
		CIQ.ChartEngine.YAxis.prototype.prettySemiLog=true;

		/**
		 * A matrix used to determine how many decimal places to print on y axis labels based on the size of the shadow (the difference between chart high and chart low).
		 * The array consists of tuples in descending order. If the shadow is less than n1 then n2 decimal places will be printed.
		 * See {@link CIQ.ChartEngine.YAxis.defaultShadowBreaks} and {@link CIQ.ChartEngine.YAxis.smallChartShadowBreaks} for default settings.
		 *
		 * This can be overridden, however, by setting{@link CIQ.ChartEngine.YAxis#decimalPlaces}.
		 * If you wish to further configure the current price label floating over the y axis to display less decimal places than the axis labels, set {@link CIQ.ChartEngine.YAxis#maxDecimalPlaces}.
		 * Also see {@link CIQ.ChartEngine.Chart#dynamicYAxis} to allow the y axis to automatically determine its width based on the text length of quotes in a dataSet.
		 *
		 * @type array
		 * @memberof CIQ.ChartEngine.YAxis
		 * @since  2015-11-1
		 * @example
		 * stxx.chart.yAxis.shadowBreaks=CIQ.ChartEngine.YAxis.defaultShadowBreaks;
		 * @example
		 * stxx.chart.yAxis.shadowBreaks=CIQ.ChartEngine.YAxis.smallChartShadowBreaks;
		 */
		CIQ.ChartEngine.YAxis.prototype.shadowBreaks=CIQ.ChartEngine.YAxis.defaultShadowBreaks;

		CIQ.extend(CIQ.ChartEngine.Panel.prototype, {
				name: null,								// Name of panel
				display: null,							// Display text of panel
				chart: null,							// The chart from which this panel derives its data
				yAxis: null,							// Y axis object for this panel, this is the same object as chart.yAxis on chart panels
				shareChartXAxis: null,					// Set to false to indicate panel does not share x axis with its chart
				top: null,								// Y location of top of chart
				bottom: null,							// Y location of bottom of chart
				height: null,							// height of chart in pixels
				percent: null							// percent of overall window this panel takes up
		}, true);

		CIQ.extend(CIQ.ChartEngine.XAxis.prototype, {
		    /**
		     * Optional function to format dates on x-axis.
		     * If defined, will be used to completely control x-axis formatting, including the floating HUD date of the crosshair.
		     *
		     * This function **should not** be used to alter the timezone of the displayed date/time. For time zone conversions use {@link CIQ.ChartEngine#setTimeZone}
		     *
			 * **Expected format:**
			 *
			 * - `function(labelDate, gridType, timeUnit, timeUnitMultiplier);`
			 *
			 * **Parameters:**
			 * <table>
			 * <tr><th>Name</th><th>Type</th><th>Description</th></tr>
			 * <tr><td>labelDate</td><td>Date</td><td>javaScript date to format</td></tr>
			 * <tr><td>gridType</td><td>String</td><td>"boundary" or "line" for the axis labels<br>absent for the floating crosshair label</td></tr>
			 * <tr><td>timeUnit</td><td>Enumerated type</td><td>CIQ.MILLISECOND <br>CIQ.SECOND <br>CIQ.MINUTE <br>CIQ.HOUR <br>CIQ.DAY <br>CIQ.MONTH <br>CIQ.YEAR <br>CIQ.DECADE <br>absent for the floating crosshair label</td></tr>
			 * <tr><td>timeUnitMultiplier</td><td>Number</td><td>how many timeUnits <br>absent for the floating crosshair label</td></tr>
			 * </table>
			 *
			 * **Returns:**
			 * - Formatted text label for the particular date passed in
			 *
		     * @type function
		     * @memberof CIQ.ChartEngine.XAxis#
		     * @example
		     * stxx.chart.xAxis.formatter = function(labelDate, gridType, timeUnit, timeUnitMultiplier){
		     * 		// your code here to format your string
		     * 		// Example: always return HH:MM regardless of gridType,
		     * 		// even if gridType is a 'boundary' that normally would display a date in intro-day periodicity
		     * 		// or a month in daily periodicity
		     *
		     * 		var stringDate = labelDate.getHours() + ':' + labelDate.getMinutes();
		     * 		return stringDate;
		     * }
		     * @since 3.0.0 Using x axis formatter now is available for year and month boundaries.
			 */
			formatter: null,
		    /**
		     * If true, the user selected (default browser if none selected) timezone will be used on the x axis.
		     * If not set to true, the data timezone will be used even if a user timezone was set.
		     * @type boolean
		     * @default
		     * @memberof CIQ.ChartEngine.XAxis#
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
		     * @memberof CIQ.ChartEngine.XAxis#
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
		     * Visual Reference for sample code below (draw a label every 5 seconds using 1 second periodicity ) :<br>
		     * ![xAxis.timeUnit](xAxis.timeUnit.png "xAxis.timeUnit")
		     * @type number
		     * @default
		     * @memberof CIQ.ChartEngine.XAxis#
		     * @example
		     * // The following will cause the default implementation of createTickXAxisWithDates to print labels in seconds every 5 seconds.
		     * // masterData is in 1 second intervals for this particular example.
				 * stxx.chart.xAxis.timeUnit = CIQ.SECOND;
				 * stxx.chart.xAxis.timeUnitMultiplier = 5;
		     */
			timeUnit: null,
			/**
			 * Overrides default used in {@link CIQ.ChartEngine#createTickXAxisWithDates}
			 * @type number
			 * @default
			 * @memberof CIQ.ChartEngine.XAxis#
			 * @example
			 * // The following will cause the default implementation of createTickXAxisWithDates to print labels in seconds every 5 seconds.
			 * // masterData is in 1 second intervals for this particular example.
			 * stxx.chart.xAxis.timeUnit = CIQ.SECOND;
			 * stxx.chart.xAxis.timeUnitMultiplier = 5;
			 */
			timeUnitMultiplier: null,
		    /**
		     * Set to true to draw a line above the x-axis.
		     * @type boolean
		     * @default
		     * @memberof CIQ.ChartEngine.XAxis#
		     */
			displayBorder: true,
		    /**
		     * Set to false to suppress grid lines
		     * @type boolean
		     * @default
		     * @memberof CIQ.ChartEngine.XAxis#
		     */
			displayGridLines: true,
		    /**
		     * Switch to temporarily hide the x-axis. Set to `true' to activate.
		     * @type boolean
		     * @default
		     * @memberof CIQ.ChartEngine.XAxis#
		     * @since 3.0.0
		     */
			noDraw: null,
		    /**
		     * Minimum size for label. This ensures adequate padding so that labels don't collide with one another.
		     * Please note that this setting is used during the rendering process, not during the label spacing calculation process and will be overwritten if too small to prevent labels from covering each other.
		     * To modify at what interval labels will be placed, please see {@tutorial Custom X-axis} for more details
		     * @type number
		     * @default
		     * @memberof CIQ.ChartEngine.XAxis#
		     */
			minimumLabelWidth: 50,
		    /**
		     * Set to false to hide axis markings in the future.
		     * @type boolean
		     * @default
		     * @memberof CIQ.ChartEngine.XAxis#
		     */
			futureTicks: true,
		    /**
		     * Set to the number of minutes ticks will move by when iterating in "tick" interval.
		     * <P>
		     * Since 'tick' is not a time based display, there is no way to predict what the time between ticks will be.
		     * Ticks can come a second later, a minute later or even more depending on how active a particular instrument may be.
		     * As such, if iterating through the market day in 'tick' periodicity, the library uses a pre-defined number of minutes to move around.
		     * This will be primarily used when deciding where to put x axis labels when going into the future in 'tick' mode.
		     *
		     * @type number
		     * @default
		     * @memberof CIQ.ChartEngine.XAxis#
		     * @example
		     * //You can override this behavior as follows:
			 * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
			 * stxx.chart.xAxis.futureTicksInterval=1; // to set to 1 minute, for example
			 * @since 3.0.0 default changed from 10 to 1.
		     */
			futureTicksInterval: 1
		}, true);

		CIQ.extend(CIQ.ChartEngine.Chart.prototype, {
				/**
				 * The current symbol for the chart
				 * @type string
			     * @memberof CIQ.ChartEngine.Chart#
				 */
				symbol: null,
				/**
				 * The current symbolObject for the chart. Generally this is simply `{symbol: symbol}`.
				 * This is initialized by {@link CIQ.ChartEngine#newChart}.
				 * @type {object}
			     * @memberof CIQ.ChartEngine.Chart#
				 */
				symbolObject : {symbol: null },
			    /**
			     * Set this to presnet an alternate name for the symbol on the chart label and comparison legend.
			     * You can set  `stxx.chart.symbolDisplay='yourName'; ` right before calling `newChart()`.
			     * Alternatively, a good place to set it is in your fetch() function, if using {@link CIQ.QuoteFeed}. See example.
			     * @type string
			     * @default
			     * @memberof CIQ.ChartEngine.Chart#
			     * @example
				 * // on your fetch initial load add the following
				 * params.stx.chart.symbolDisplay='yourName for '+params.symbol;
			     */
				symbolDisplay: null,
				/**
				 * Contains information about the series that are associated with the chart.
				 * Series are additional data sets, such as used for comparison charts.
				 * Note that a series may have a different y-axis calculation than the price chart.
				 * See the "parameters" section of {@link CIQ.ChartEngine#addSeries} for details
				 * @type {object}
			     * @memberof CIQ.ChartEngine.Chart#
				 */
			    series: {},
			    /**
			     * Contains "renderers" that are used to create the visualizations for series.
			     * @type {object}
			     * @memberof CIQ.ChartEngine.Chart#
			     */
			    seriesRenderers: {},
			    /**
			     * Current number of ticks scrolled in from the end of the chart.
			     * Setting to zero would theoretically cause the chart to be scrolled completely to the left showing an empty canvas.
			     * Setting to 10 would display the last 10 candles on the chart.
			     * Setting to `maxTicks` would display a full screen on the chart (assuming enough data is available).
			     *
			     * To immediately activate, call [draw()]{@link CIQ.ChartEngine#draw}
			     * @type number
			     * @default
			     * @memberof CIQ.ChartEngine.Chart#
			     * @example <caption> Scroll to the most current (beginning) position in the chart.</caption>
			     * stxx.chart.scroll=0;
			     * @example <caption> Scroll to the end of the chart.</caption>
			     * stxx.chart.scroll=stxx.chart.dataSet.length;
			     */
				scroll: 0,
				isComparison: false,					// Used internally, indicates if chart is in comparison mode
			    /**
			     * If true, [comparisons]{@link CIQ.ChartEngine#addSeries} force a 'percent' chart scale every time a new series is added, 
			     * and once the last comparison series is removed, the chart will be forced to 'linear' scale. 
			     * In between adding series, the scale can be changed at any time by programmatically calling calling {@link CIQ.ChartEngine#setChartScale}
			     * 
			     * If false, the chart will not change scale when a comparison series is added or removed and {@link CIQ.ChartEngine#setChartScale} must be explicitly called to set the desired scale. 
			     * This allows for more flexibility in case 'linear' and 'percent' are not the preferred default scales, or the UI is requires to manage the scale separately. 
				 *
			     * Note this will only take effect on the main chart panel's main axis.
			     * 
			     * @type boolean
			     * @default
			     * @memberof CIQ.ChartEngine.Chart#
			     * @since 6.2.0
			     */
				forcePercentComparison: true,
				/**
				 * Will contain the maximum number of bars that can be displayed on the chart.
				 * This number is auto-computed by the ChartEngine when the user zooms or the size of the chart changes.
				 * Since charts can pan slightly off the edge of the screen, this number is width/candleWidth + 2 in order allow partial candles to be displayed on both edges.
				 * @type number
			     * @memberof CIQ.ChartEngine.Chart#
				 */
				maxTicks: 0,							// Horizontal number of chart ticks that currently fit in the canvas, based on candlewidth and spacing. This is generally one greater than the actual size of the canvas due to candle clipping.
			    /**
			     * Set to a value between 0 and 1 to soften the curves on a line or mountain chart.
			     *
			     * This only affects the primary chart series. For setting tension on additional series see {@link CIQ.ChartEngine#addSeries}
			     * @type number
			     * @memberof CIQ.ChartEngine.Chart#
			     */
				tension: null,
			    /**
			     * READ ONLY. A "snapshot" of the market for the active instrument.
			     * This data is ephemeral in nature and not used to produce a time series chart.
			     * But rather used on our peripheral plugins that require more details on the current market, such as [TFC]{@link CIQ.TFC} and [cryptoIQ]{@link CIQ.MarketDepth}.
			     * This data is programmatically collated from the incoming data and is updated with the most recent information so it should not be altered manually.
			     *
			     * The `currentMarketData` object contains the following information:
			     *  - Last Bid
			     *  - Last Ask
			     *  - Last Price
			     *  - Last Size
			     *  - Lastest Level 2 information
			     *
			     * For more details see {@link CIQ.ChartEngine#updateCurrentMarketData}
			     * @type object
			     * @memberof CIQ.ChartEngine.Chart#
			     * @since 6.1.0
			     */
				currentMarketData: {},
			    /**
			     * The master data for this chart. This data is never modified by the chart engine itself and should not be altered directly. Use {@link CIQ.ChartEngine#setMasterData} , {@link CIQ.ChartEngine#updateChartData} to manipulate this object. See the [Data Integration]{@tutorial DataIntegrationOverview} tutorial for details.
			     * @type array
			     * @memberof CIQ.ChartEngine.Chart#
			     */
				masterData: null,
			    /**
			     * Contains the current complete data set created by {@link CIQ.ChartEngine#createDataSet}, adjusted for periodicity and with calculated studies. See the [Data Integration]{@tutorial DataIntegrationOverview} tutorial for details.
			     * @type array
			     * @memberof CIQ.ChartEngine.Chart#
			     */
				dataSet: null,
				/**
				 * Contains a copy of the dataSet, scrubbed for null entries (gap dates).
				 * This is used by studies to avoid gaps being interpreted as "zero" values and throwing off calculations.
				 * @type array
			     * @memberof CIQ.ChartEngine.Chart#
				 */
				scrubbed: null,
			    /**
			     * Contains the segment of the data set that is displayed on the screen (view-window). See the [Data Integration]{@tutorial DataIntegrationOverview} tutorial for details.
			     * @type array
			     * @memberof CIQ.ChartEngine.Chart#
			     */
				dataSegment: null,
			    /**
			     * Contains data pertaining to variable width candles, used to determine location of bars on the screen
			     * @type array
			     * @memberof CIQ.ChartEngine.Chart#
			     */
				segmentImage: null,
				/**
				 * Parameters used to control the baseline in baseline_delta charts
				 * @type object
				 * @alias baseline
				 * @inner
				 * @memberof! CIQ.ChartEngine.Chart#
				 */
			    baseline:{
					/**
					 * includeInDataSegment - If set to true, forces a line chart (usually a baseline chart) to begin inside the chart,
				     *                        whereas normally the first point in a line chart is off the left edge of the screen.
				     * @type boolean
				     * @default
						 * @inner
				     * @alias baseline[`includeInDataSegment`]
				     * @memberof! CIQ.ChartEngine.Chart#
					 */
			    	includeInDataSegment: false,
				    /**
				     * defaultLevel - If set to a value, overrides the default behavior of baseline chart
				     *                which is to set baseline to leftmost point visible on the chart.
				     * @type number
				     * @default
						 * @inner
						 * @alias baseline[`defaultLevel`]
				     * @memberof! CIQ.ChartEngine.Chart#
				     */
			    	defaultLevel: null,
				    /**
				     * userLevel - Value of the user-set baseline level.  To prevent user from adjusting the baseline,
				     *             set this property to false.
				     * @type boolean|number
				     * @default
						 * @alias baseline[`userLevel`]
				     * @memberof! CIQ.ChartEngine.Chart#
				     */
			    	userLevel: null,
				    /**
				     * actualLevel - This is computed automatically.  Do not set.
				     * @type number
				     * @default
				     * @alias baseline[`actualLevel`]
				     * @memberof! CIQ.ChartEngine.Chart#
				     */
					actualLevel: null
			    },
			    /**
			     * Contains the {@CIQ.ChartEngine.XAxis} object for the chart.
			     * @type CIQ.ChartEngine.XAxis
			     * @memberof CIQ.ChartEngine.Chart#
			     */
				xAxis: null,							// x Axis for the chart
				/**
				 * Contains data entries for the full xaxis, including entries for "future" bars that are displayed on the chart.
				 * floatDate and headsUp use these values for display to the user.
				 * It is a superset of dataSegment.
				 * @type {array}
			     * @memberof CIQ.ChartEngine.Chart#
				 */
			    xaxis:[],
			    /**
			     * Determines at which zoom level interior axis points are displayed. Value in pixels.
			     * @type number
			     * @default
			     * @memberof CIQ.ChartEngine.Chart#
			     */
				xaxisFactor: 30,
				/**
				 * Maximum number of decimal places in data set. Computed automatically by calculateTradingDecimalPlaces
				 * @type number
			     * @memberof CIQ.ChartEngine.Chart#
				 */
				decimalPlaces: 2,
				/**
				 * If set to `true` the y-axes width will be automatically set based on the length of the displayed prices. Otherwise {@link CIQ.ChartEngine.YAxis#width} will be used.
				 *
				 * Works on all axis attached to a chart.
				 * @type boolean
				 * @memberof CIQ.ChartEngine.Chart#
				 * @since 5.1.1
				 */
				dynamicYAxis: false,
				roundit: 100,							// Computed automatically to round y-axis display
			    /**
			     * Function used to render the Legend when multiple series are being displayed on the main chart panel.
			     * Update your prototype or a specific chart instance, if you want to use a different rendering method for legend.
			     * 
			     * To activate the legend, you must first define the location in `stx.chart.legend`. 
			     * This is done by providing the x and y coordinates for the first element in the legend as follows:
			     * ```
			     * stxx.chart.legend={
			     * 		x: yourXlocation,
			     * 		y: yourYlocation
			     * };
			     * ```
			     * 
			     * Once set, a legend item for each series you add will be added as defined by this function.
			     * 
			     * Defaults to {@link CIQ.drawLegend}, which uses {@link CIQ.drawLegendItem}
			     * @type function
			     * @default
			     * @memberof CIQ.ChartEngine.Chart#
			     * @example 
			     * // define yuur legend renderer
			     * stxx.chart.legendRenderer = yourFunction; // must follow the function signature of {@link CIQ.drawLegend};
			     * // actiate the legend
			     * stxx.chart.legend={
			     * 		x: 50,
			     * 		y: 50
			     * };
			     * @example
			     * // sample series legend function
				 	stxx.chart.legendRenderer = function(stx, params){
						var coordinates=params.coordinates;
						var context=stx.chart.context;
						context.textBaseline="top";
						var rememberFont=context.font;
						stx.canvasFont("stx-legend",context);
	
						var chart=params.chart;
						if(!coordinates) coordinates=chart.legend;
						var xy=[coordinates.x, coordinates.y];
						var lineColor=stx.defaultColor;
	
						for(var i=0;i<2;i++){ // loop twice, first for the base then again for the series
							for(var field in params.legendColorMap){
								var legendItem=params.legendColorMap[field];
								if(legendItem.isBase && (i || params.noBase)) continue;
								if(!legendItem.isBase && !i) continue;
								var c;
								if(legendItem.color instanceof Array){
									var colors=legendItem.color;
									for(c=colors.length-1;c>=0;c--){
										if(CIQ.isTransparent(colors[c])) colors.splice(c,1);
									}
									if(colors.length>1){
										var grd=context.createLinearGradient(xy[0],xy[1],xy[0]+10,xy[1]);
										for(c=0;c<colors.length;c++){
											grd.addColorStop(c/(colors.length-1),colors[c]);
										}
										lineColor=grd;
									}else if(colors.length>0){
										lineColor=colors[0];
									}else{
										lineColor=stx.getCanvasColor("stx_line_chart");
									}
								}else{
									lineColor=null;
								}
								if(lineColor) {
									var display = field;
									if (legendItem.display){
										display = legendItem.display;
									}
									if(!display){
										if(chart.symbolDisplay){
											display=chart.symbolDisplay;
										}else{
											display=chart.symbol;
										}
									}
									if(xy[0]+context.measureText(display).width>chart.panel.right){
										xy=[coordinates.x, coordinates.y+context.measureText("M").width+6];  // M is squarish, with width roughly equaling height: https://stackoverflow.com/questions/1134586/how-can-you-find-the-height-of-text-on-an-html-canvas
									}
									xy=CIQ.drawLegendItem(stx, xy, display, lineColor, legendItem.opacity);
								}
							}
						}
						context.font=rememberFont;
					};			          
			     * @since 07/01/2015
			     */
				legendRenderer: CIQ.drawLegend,
			    /**
			     * This structure is used to temporarily override the layout.chartType.  It can also be used to override the coloring function used when drawing
			     * bars, candles, etc.
				 *
				 * Expected format :
				 *
				 * 		customChart={chartType:myChartType, colorFunction: myColorFunction}
				 *
				 * 		myChartType is any valid chartType
				 * 		myColorFunction needs to support the following parameters: stx, quote, mode
				 * 		Example: myColorFunction(stx,quote,mode)
				 *
				 * 		Parameters:
				 *
				 *		{@link CIQ.ChartEngine} stx	- A chart object
				 *		{object} quote	- A properly formatted OHLC object.
				 *		{string} mode	- Applicable on 'candle', 'hollow_candle' and 'volume_candle' charts only. Allowed values: "shadow", "outline", and "solid".
				 *							`shadow`- indicates the function is asking for the candle wick color
				 *							`outline` indicates the function is asking for the candle border color
				 *							`solid` indicates the function is asking for the candle fill color
				 *										(Inside of candle. Not applicable on 'hollow_candle' or 'volume_candle')
				 *
				 * 		Returns:
				 *
				 *		{string|object} Color to use for the bar, candle or line segment component. Set to null to skip bar or line segment.
				 *		For colored line charts a color/pattern combination can be returned in an object of the follwing format: `{pattern:[3,3],color:"red"}`
				 *
				 * You may omit either of the properties to default to existing settings.
				 * Note: After setting the chartType property, it is necessary to call stx.setMainSeriesRenderer() to change the chart rendering.
				 *
				 * To restore the original chart settings, set this object to null (and call setMainSeriesRenderer() if necessary)
				 *
				 * See {@tutorial Chart Styles and Types} for more details.
			     * @type object
			     * @default
			     * @alias customChart
			     * @memberof! CIQ.ChartEngine.Chart#
			     * @example
				 * stxx.chart.customChart={colorFunction: function(stx, quote, mode){
				 *		if(mode=="shadow" || mode=="outline") return "black";  //draw black wicks and borders
				 *		else{
				 *			if(quote.Close>100) return "green";
				 * 			else if(quote.DT.getHours()<12) return "yellow";
				 *			else return "orange";
				 *		}
				 *		return null;
				 *	  }
				 * 	};
			     */
				customChart: null,
			    /**
			     * How much padding to leave for the right y-axis. Default is enough for the axis. Set to zero to overlap y-axis onto chart.
			     * @type number
			     * @default
			     * @memberof CIQ.ChartEngine.Chart#
			     * @since 07/01/2015
			     * @example
			     * stxx.chart.yaxisPaddingRight=0;
			     * stxx.chart.yAxis.displayBorder=false; // hide the vertical axis line.
			     * //must call the following 2 lines to activate if the axis is already drawn.
			     * stxx.calculateYAxisPositions();
			     * stxx.draw();
			     */
			    yaxisPaddingRight:null,
			    /**
			     * How much padding to leave for the left y-axis. Default is enough for the axis. Set to zero to overlap y-axis onto chart.
			     * @type number
			     * @default
			     * @memberof CIQ.ChartEngine.Chart#
			     * @since 07/01/2015
			     * @example
			     * stxx.chart.yaxisPaddingLeft=0;
			     * stxx.chart.yAxis.displayBorder=false; // hide the vertical axis line.
			     * //must call the following 2 lines to activate if the axis is already drawn.
			     * stxx.calculateYAxisPositions();
			     * stxx.draw();
			     */
			    yaxisPaddingLeft:null,
			    tickCache: {}, // private
				/**
			     * If set to false, during zooming and panning operations the chart will be anchored on left side preventing white space to be created past the oldest tick.
			     * If both {@link CIQ.ChartEngine.Chart#allowScrollPast} and {@link CIQ.ChartEngine.Chart#allowScrollFuture} are set to false, allowScrollFuture will take precedence if the candle is manually set to create space ({@link CIQ.ChartEngine#setCandleWidth}), but automated zoom operations ({@link CIQ.ChartEngine#zoomOut}) will maintain both scroll restrictions.
			     *
			     * The amount of white space allowed on the right will be limited by {@link CIQ.ChartEngine#minimumLeftBars}
			     * @type boolean
			     * @default
				 * @memberof CIQ.ChartEngine.Chart#
			     */
				allowScrollPast:true,
				/**
			     * If set to false, during zooming and panning operations the chart will be anchored on right side preventing white space to be created beyond the newest tick.
			     * If both {@link CIQ.ChartEngine.Chart#allowScrollPast} and {@link CIQ.ChartEngine.Chart#allowScrollFuture} are set to false, allowScrollFuture will take precedence if the candle is manually set to create space ({@link CIQ.ChartEngine#setCandleWidth}), but automated zoom operations ({@link CIQ.ChartEngine#zoomOut}) will maintain both scroll restrictions.
				 * When viewing a specified date range on the chart, if this flag is set to false, any portion of the range beyond the last quote will not be displayed.
			     * @type boolean
			     * @default
				 * @memberof CIQ.ChartEngine.Chart#
				 * @since 6.1.0 Also respects studies that render into the future, such as the Ichimoku cloud.
			     */
				allowScrollFuture:true,
			    /**
			     * READ ONLY. Tracks the number of ticks to display as "whitespace" beyond the rightmost area of the chart
			     * when {@link CIQ.ChartEngine.Chart#allowScrollFuture} is set to false.
			     * @type number
			     * @default
			     * @alias whiteSpaceFutureTicks
			     * @memberof CIQ.ChartEngine.prototype
			     * @private
			     * @since 6.1.0
			     */
				whiteSpaceFutureTicks:0,
			    /**
			     * Set to true to temporarily hide drawings
			     * @type boolean
			     * @default
				 * @memberof CIQ.ChartEngine.Chart#
			     */
				hideDrawings:false,
				/**
				 * For line and mountain type charts set this to a value other than "Close" to have those chart types plot a different field.
				 *
				 * @type {string}
				 * @default
				 * @memberof CIQ.ChartEngine.Chart#
				 * @since 3.0.0
				 */
				defaultPlotField:"Close",
				/**
				 * For chart types which have configuration settings (such as the aggregate charts renko, kagi, etc) contains those default settings.
				 * This object holds the settings for the current chart type only.
				 * @type {object}
				 * @default
				 * @memberof CIQ.ChartEngine.Chart#
				 * @since 3.0.0
				 */
				defaultChartStyleConfig:{},
				/**
				 * Set this to true to turn off auto-scrolling when fresh data comes in. By default, the chart will scroll backward
				 * whenever a new bar comes in, so as to maintain the chart's forward position on the screen. If lockScroll is
				 * true then fresh bars with advance the chart forward (and eventually off the right edge of the screen)
				 *
				 * Note that setSpan({base:"today"}) will set an internal variable that accomplishes the same thing. This is a unique case.
				 * @type {boolean}
				 * @default
				 * @memberof CIQ.ChartEngine.Chart#
				 * @since 05-2016-10
				 */
				lockScroll:false,
				/**
				 * Set this to true to include the chart overlay/study values in the calculation to determine the high and low values for the chart.
				 * This may cause the chart to shrink vertically to ensure all study/overlay data is in view.
				 * Setting it to false, will maintain the current candle's height, but some of the study/overlay data may be out of the display range.
				 * @type {boolean}
				 * @default
				 * @memberof CIQ.ChartEngine.Chart#
				 * @since
				 * <br>&bull; 2016-12-01.4.13
				 * <br>&bull; 3.0.10 switched default to true
				 */
				includeOverlaysInMinMax:true,
				/**
				 * READ ONLY. Gap filling style for the primary chart (line/mountain chart types only).
				 * By default gaps on lines and mountain charts will not be connected.
				 * Modify by using {@link CIQ.ChartEngine#setGapLines}.
				 * @type {object}
				 * @default
				 * @memberof CIQ.ChartEngine.Chart#
				 * @since 4.0.0
				 */
				gaplines:null,
				/**
				 * READ ONLY. Style for the main series renderer.
				 * Set by using {@link CIQ.ChartEngine#setLineStyle}.
				 * @type {object}
				 * @default
				 * @memberof CIQ.ChartEngine.Chart#
				 * @since 4.0.0
				 */
				lineStyle:null,
				/**
				 * When candleWidth<1, setting to true will create approximation of a line chart to improve rendering performance.
				 *
				 * Must allow for smaller candle sizes by lowering {@link CIQ.ChartEngine#minimumCandleWidth}
				 * and allow for larger dataset by increasing {@link CIQ.ChartEngine#maxDataSetSize} or setting it to 0.
				 * @type {boolean}
				 * @default
				 * @memberof CIQ.ChartEngine.Chart#
				 * @since 4.1.0
				 */
				lineApproximation: true,
			    /**
			     * Whether chart's main renderer's bars plot more than one data field (OHLC charts).
			     * When this is true, will disable the use of {@link CIQ.ChartEngine.Chart#defaultPlotField}.
			     * @type boolean
			     * @default
			     * @memberof CIQ.ChartEngine.Chart#
			     * @since 5.1.0
			     */
				highLowBars:false,
			    /**
			     * Whether chart's main renderer's bars represent a stand-alone entity as opposed to a vertex in a line-type chart.
			     * This is important when the engine tries to render the data points right off the chart; in a stand-alone bar,
			     * the points right off the chart need not be considered.
			     * @type boolean
			     * @default
			     * @memberof CIQ.ChartEngine.Chart#
			     * @since 5.1.0
			     */
				standaloneBars:false,
			    /**
			     * Whether chart's main renderer's bars have width, as opposed to a line-type chart whose "bars" are just a point on the chart.
			     * This is useful when the engine adjusts the chart for smooth scrolling and homing.
			     * @type boolean
			     * @default
			     * @memberof CIQ.ChartEngine.Chart#
			     * @since 5.1.0
			     */
				barsHaveWidth:false
		}, true);

		/**
		 * Given an html element, this allows the chart container to keep track of its own drawing container
		 * (where appropriate)
		 * @param {object} htmlElement The html element where the chart container is for 'this' chart
		 * @memberof CIQ.ChartEngine
		 * @example
		 *	var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), preferences:{labels:false, currentPriceLine:true, whitespace:0}});
		 *	stxx.setDrawingContainer($$$('cq-toolbar'));
		 * @since 6.0.0
		 */
		CIQ.ChartEngine.prototype.setDrawingContainer=function(htmlElement){
			this.drawingContainer=htmlElement;
		};


		/**
		 * Based on the standardMarketIterator and the last entry of masterData, determines whether the chart contains data up till the current iterators next tick.
		 *
		 * For efficiency once {@link CIQ.ChartEngine.isHistoricalMode} is set to false, this will always return false.
		 * @return {boolean} True if viewing historical mode
		 * @since 6.0.0
		 * @private
		 */
		CIQ.ChartEngine.prototype.isHistoricalMode = function () {
			var dateNow = new Date(),
				historic = true,
				masterData = this.masterData;
			if (!this.isHistoricalModeSet) {
				return false;
			}
			if (masterData.length) {
				var lastDate = this.getFirstLastDataRecord(masterData, "DT", true);
				var iter = this.standardMarketIterator(lastDate.DT);
				historic = iter.next() <= dateNow;

				// special case: daily chart, market has not opened yet today
				// historic would always be set even though we have all the data
				if(historic && CIQ.ChartEngine.isDailyInterval(iter.interval)){
					var open=this.chart.market.getOpen();
					if(open && dateNow<open){
						dateNow.setHours(0,0,0,0);
						if(+dateNow==+iter.begin) historic=false;
					}
				}
			}
			return historic;
		};

		/**
		 * Given a browser time it will return the date in dataZone time. See {@link CIQ.ChartEngine#setTimeZone} for more details.
		 * If no dataZone is set, it will return the original date passed in.
		 * @param {date} browserDate Date in browser time - as in 'new Date();'
		 * @return {date} Date converted to dataZone
		 * @memberof CIQ.ChartEngine
		 * @since 07-2016-16.6
		 */
		CIQ.ChartEngine.prototype.convertToDataZone=function(browserDate){
			if((browserDate || browserDate===0) && this.dataZone){
				// convert the current time to the dataZone
				var tzNow = CIQ.convertTimeZone(browserDate, null, this.dataZone);
				// remember the the masterData is in local time but really representing the dataZone time.
				// now build a browser timezone time using the dataZone time so it will match the offset of the existing data in masterData.
				browserDate = new Date(tzNow.getFullYear(), tzNow.getMonth(), tzNow.getDate(), tzNow.getHours(), tzNow.getMinutes(), tzNow.getSeconds(), tzNow.getMilliseconds());
			}
			return browserDate;
		};

		/**
		 * Returns true if the internal chart periodicity is based off of a daily interval ("day","week" or "month")
		 *
		 * **Please note:** This function is intended to be used on the internal periodicity as stored in the {@link CIQ.ChartEngine#layout}.
		 * See:
		 *  - <a href="CIQ.ChartEngine.html#layout%5B%60periodicity%60%5D">CIQ.ChartEngine.layout.periodicity</a>.
		 *  - <a href="CIQ.ChartEngine.html#layout%5B%60interval%60%5D">CIQ.ChartEngine.layout.interval</a>.
		 *  - <a href="CIQ.ChartEngine.html#layout%5B%60timeUnit%60%5D">CIQ.ChartEngine.layout.timeUnit</a>.
		 * @param  {string}  interval The interval
		 * @return {boolean}          True if it's a daily interval
		 * @memberof CIQ.ChartEngine
		 */
		CIQ.ChartEngine.isDailyInterval=function(interval){
			if(interval=="day") return true;
			if(interval=="week") return true;
			if(interval=="month") return true;
			return false;
		};

		/**
		 * Returns true if the chart needs new data to conform with the new periodicity.
		 * @param {object} newPeriodicity			newPeriodicity. See {@link CIQ.ChartEngine#setPeriodicity}
		 * @param {number} newPeriodicity.period 	`period` as required by {@link CIQ.ChartEngine#setPeriodicity}
		 * @param {string} newPeriodicity.interval 	`interval` as required by {@link CIQ.ChartEngine#setPeriodicity}
		 * @param {string} newPeriodicity.timeUnit 	`timeUnit` as required by {@link CIQ.ChartEngine#setPeriodicity}
		 * @return {boolean} True if the cart needs data in a new periodicity
		 * @memberof CIQ.ChartEngine
		 * @since 4.0.0
		 */
		CIQ.ChartEngine.prototype.needDifferentData=function(newPeriodicity){

			var layout = this.layout;
			var isDaily=CIQ.ChartEngine.isDailyInterval(newPeriodicity.interval), wasDaily=CIQ.ChartEngine.isDailyInterval(layout.interval);
			var getDifferentData=false;

			if( this.dontRoll || !wasDaily ) {
				// we are not rolling so monthly and weekly are not the same as daily or any of the intraday... so simply check for different interval.
				if(layout.interval!=newPeriodicity.interval) getDifferentData=true;
			} else {
				//we are rolling weeekly and monthly and wasn't intraday mode...so check to see if we an still use daily data for the new periodicity
				if(isDaily!=wasDaily ) getDifferentData=true;
			}

			// safety check to deal with defaults.
			if(!isDaily && !newPeriodicity.timeUnit) newPeriodicity.timeUnit = 'minute';
			if(!wasDaily && !layout.timeUnit) layout.timeUnit = 'minute';

			if(newPeriodicity.timeUnit!=layout.timeUnit) getDifferentData=true; // !!! Do not change to !==

			return getDifferentData;
		};

		/**
		 * Returns true if the chartType displays OHL data.
		 * @param  {string} chartType The chart type (layout.chartType)
		 * @return {boolean} True if the chart type only displays close values
		 * @memberof CIQ.ChartEngine
		 * @since 05-2016-10.1 "baseline_delta_mountain" and  "colored_mountain" are also available
		 * @deprecated
		 */
		CIQ.ChartEngine.chartShowsHighs=function(chartType){
			console.warn('CIQ.ChartEngine.chartShowsHighs() has been deprecated. Please check one of the appropriate renderer properties instead: stxx.chart.highLowBars, stxx.chart.standaloneBars, or stxx.chart.barsHaveWidth.');
			if({
				"line":1,
				"colored_line":1,
				"mountain":1,
				"colored_mountain":1,
				"baseline_delta":1,
				"baseline_delta_mountain":1,
				"histogram":1,
				"scatterplot":1,
				"step":1,
				"colored_step":1
			}[chartType]==1) return false;
			return true;
		};

		/**
		 * This method does nothing. It is just a known location to put a break point for debugging the kernel.
		 * @private
		 */
		CIQ.ChartEngine.prototype.debug=function(){

		};

		/**
		 * Measures frames per second. Use this from the console.
		 * @param {number} [seconds = 5] Polling interval length
		 * @param {function} cb Callback to invoke when done polling
		 * @private
		 */
		CIQ.ChartEngine.prototype.fps=function(seconds, cb){
		    seconds = seconds || 5;
		    var start = new Date().getTime();
		    var frames = 0;
		    var self=this;
		    console.log("Running fps() for " + seconds + " seconds");

		    function render() {
		        var duration=(new Date().getTime() - start) / 1000;
		        if (duration > seconds) {
		        	var fps=frames / duration;
		            console.log("FPS=" + fps);
		            if(cb) cb(fps);
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
		 * @memberOf  CIQ.ChartEngine
		 */
		CIQ.ChartEngine.DrawingDescriptor={
				"name": "",
				"render": null, 				/// function(vector, color, context, highlight (boolean), temporary (boolean), stx)
				"intersected": null,			/// function(vector, x, y) returns whether coordinates intersect the object
				"click": null,					/// function(vector, clickNumber) called when mouse click or tap. Return true to end drawing. False to accept more clicks.
				"abort": null					/// called when user has aborted drawing action (esc key for instance)
		};

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
		 * See the {@tutorial Using the Injection API} and [Customization Basics](tutorial-Customization%20Basics.html#injections) tutorials for additional guidance and examples.
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
		 * Prepends custom developer functionality to an internal chart member. See [“Injection API"]{@tutorial Using the Injection API}.
		 * @param  {string} o Signature of member
		 * @param  {function} n Callback function, will be called with "apply"
		 * @memberof CIQ.ChartEngine
		 * @since
		 * <br>&bull; 04-2015 You can append either to an {@link CIQ.ChartEngine} instance, or to the prototype. The first will affect only a single
		 * chart while the latter will affect any chart (if you have multiple on the screen).
		 * <br>&bull; 15-07-01 function returns a descriptor which can be passed in to [removeInjection()]{@link CIQ.ChartEngine#removeInjection} to remove it later on.
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
		 * Appends custom developer functionality to an internal chart member. See [“Injection API"]{@tutorial Using the Injection API}.
		 * @param  {string} o Signature of member
		 * @param  {function} n Callback function, will be called with "apply"
		 * @memberof CIQ.ChartEngine
		 * @since
		 * <br>&bull; 04-2015 You can append either to an {@link CIQ.ChartEngine} instance, or to the prototype. The first will affect only a single
		 * chart while the latter will affect any chart (if you have multiple on the screen)
		 * <br>&bull; 15-07-01 function returns a descriptor which can be passed in to [removeInjection()]{@link CIQ.ChartEngine#removeInjection} to remove it later on.
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
		 * @param  {object} id The injection descriptor returned from {@link CIQ.ChartEngine#prepend} or {@link CIQ.ChartEngine#append}
		 * @since 07/01/2015
		 * @memberof CIQ.ChartEngine
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
		 * Removes any and all prepend and append injections from a specified CIQ.ChartEngine function.
		 * If called as an instance method, will remove the instance injections.
		 * If called as a prototype method, will remove the prototype injections.
		 * @example
		 * stxx.remove("displayChart");  // removes instance injections
		 * CIQ.ChartEngine.prototpye.remove("displayChart");  // removes prototype injections
		 * @param  {string} o Signature of function which has injections to remove
		 * @memberof CIQ.ChartEngine
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
		 * This code prevents the browser context menu from popping up when right-clicking on a drawing or overlay
		 * @param {object} [e=event] Event
		 * @return {boolean}
		 * @memberOf  CIQ.ChartEngine
		 * @deprecated Use CIQ.ScrollManager.attachRightClick
		 */
		CIQ.ChartEngine.handleContextMenu=function(e){
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

	/**
	 * Placeholder for plugin data sets. This array will register each plug in object, complete with their functions.
	 * See our Plug-in {@tutorial Markers} tutorial for complete details and examples on registering and implementing a plug-in.
	 *
	 * If defined, Plug-in instances will be called by their corresponding native functions for the following:
	 * - consolidate ( called by {@link CIQ.ChartEngine#consolidatedQuote})
	 * - drawUnder (called by draw before rendering underlays)
	 * - drawOver (called by draw after rendering overlays)
	 * - {@link CIQ.ChartEngine#setMasterData}
	 * - {@link CIQ.ChartEngine#updateChartData}
	 * - {@link CIQ.ChartEngine#initializeChart}
	 * - {@link CIQ.ChartEngine#createDataSet}
	 * @type array
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.plugins={};

	/*
	 * remove the items from chart and into stx
	 */

	/**
	 * Defines raw html for the chart controls.
	 *
	 * These controls can be overridden by manually placing HTML elements in the chart container with the same ID.
	 *
	 * To completely disable a chart control, programmatically set `controls[controlID]=null` where controlID is the control to disable.
	 * You can also set the main `htmlControls` object to null to disable all controls at once.
	 * @example
	 * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), controls: {chartControls:null}});
	 * @example
	 * // before calling newChart(). Disables all controls
	 * stxx.controls=null;
	 * @example
	 * // before calling newChart(). Disables only the chartControls (zoom on and out buttons)
	 * stxx.controls["chartControls"]=null;
	 * @type {object}
	 * @alias htmlControls
	 * @memberof! CIQ.ChartEngine#
	 * @since 5.2.0 Any id can be set to null to disable
	 */
	CIQ.ChartEngine.htmlControls={
			/**
			 * controlID for the Annotation Save button (class="stx-btn stx_annotation_save").
			 * @alias htmlControls[`annotationSave`]
			 * @memberof! CIQ.ChartEngine#
			 */
			"annotationSave":'<span class="stx-btn stx_annotation_save" style="display: none;">save</span>',
			/**
			 * controlID for the Annotation Cancel button (class="stx-btn stx_annotation_cancel").
			 * @alias htmlControls[`annotationCancel`]
			 * @memberof! CIQ.ChartEngine#
			 */
			"annotationCancel":'<span class="stx-btn stx_annotation_cancel" style="display: none; margin-left:10px;">cancel</span>',
			/**
			 * controlID for the Trash Can button / Series delete panel (class="mSticky"). Also see {@link CIQ.ChartEngine#displaySticky}
			 * @alias htmlControls[`mSticky`]
			 * @memberof! CIQ.ChartEngine#
			 * @example
			 * // disable the tool tip that appears when hovering over an overlay ( drawing, line study, etc.)
			 * stxx.controls["mSticky"]=null;
			 */
			"mSticky":'<div class="stx_sticky"> <span class="mStickyInterior"></span> <span class="mStickyRightClick"><span class="overlayEdit stx-btn" style="display:none"><span>&nbsp;</span></span> <span class="overlayTrashCan stx-btn" style="display:none"><span>&nbsp;</span></span> <span class="mouseDeleteInstructions"><span>(</span><span class="mouseDeleteText">right-click to delete</span><span class="mouseManageText">right-click to manage</span><span>)</span></span></span></div>',
			/**
			 * controlID for the Horizontal Crosshair line (class="stx_crosshair stx_crosshair_x").
			 * @alias htmlControls[`crossX`]
			 * @memberof! CIQ.ChartEngine#
			 */
			"crossX":'<div class="stx_crosshair stx_crosshair_x" style="display: none;"></div>',
			/**
			 * controlID for the Vertical Crosshair line (class="stx_crosshair stx_crosshair_y").
			 * @alias htmlControls[`crossY`]
			 * @memberof! CIQ.ChartEngine#
			 */
			"crossY":'<div class="stx_crosshair stx_crosshair_y" style="display: none;"></div>',
			/**
			 * controlID for the zoom-in and zoom-out buttons (class="stx_chart_controls").
			 * @alias htmlControls[`chartControls`]
			 * @memberof! CIQ.ChartEngine#
			 */
			"chartControls":'<div class="stx_chart_controls" style="display: none; bottom: 22px;"><div class="chartSize"><span class="stx-zoom-out"></span><span class="stx-zoom-in"></span></div></div>',
			/**
			 * controlID for the home button (class="stx_jump_today home").
			 * The button goes away if you are showing the most current data. See example to manually turn it off.
			 * You can call `stxx.home();` programmatically.	 See {@link CIQ.ChartEngine#home} for more details
			 * @alias htmlControls[`home`]
			 * @memberof! CIQ.ChartEngine#
			 * @example
			 * // disable the home button
			 * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
			 * stxx.controls["home"]=null;
			 */
			"home":'<div class="stx_jump_today" style="display:none"><span></span></div>',
			/**
			 * controlID for div which floats along the X axis with the crosshair date (class="stx-float-date").
			 * @alias htmlControls[`floatDate`]
			 * @memberof! CIQ.ChartEngine#
			 */
			"floatDate":'<div class="stx-float-date" style="visibility: hidden;"></div>',
			/**
			 * controlID for div which controls the handle to resize panels (class="stx-ico-handle").
			 * @alias htmlControls[`handleTemplate`]
			 * @memberof! CIQ.ChartEngine#
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
			 * @alias htmlControls[`iconsTemplate`]
			 * @memberof! CIQ.ChartEngine#
			 */
			"iconsTemplate":'<div class="stx-panel-control"><div class="stx-panel-title"></div><div class="stx-btn-panel"><span class="stx-ico-up"></span></div><div class="stx-btn-panel"><span class="stx-ico-focus"></span></div><div class="stx-btn-panel"><span class="stx-ico-down"></span></div><div class="stx-btn-panel"><span class="stx-ico-edit"></span></div><div class="stx-btn-panel"><span class="stx-ico-close"></span></div></div>',
			/**
			 * controlID for grabber which sits to right of baseline so it can be moved.
			 * @alias htmlControls[`baselineHandle`]
			 * @memberof! CIQ.ChartEngine#
			 */
			"baselineHandle":'<div class="stx-baseline-handle" style="display: none;"></div>',

	};

	/**
	 * Registers the Chart controls and attaches event handlers to the zoom and home controls.
	 * @private
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.registerHTMLElements=function(){
		var c=this.chart.container;
		for(var control in CIQ.ChartEngine.htmlControls){
			if(typeof this.chart[control]=="undefined" && typeof this.controls[control]=="undefined"){
				if(!this.allowZoom && control=="chartControls") continue;
				var el=$$$("." + control, c);
				if(el){
					this.chart[control]=el;
					this.controls[control]=el;
				}else{
					var rawHTML=CIQ.ChartEngine.htmlControls[control];
					if(!rawHTML) continue;
					var div=document.createElement("DIV");
					div.innerHTML=rawHTML;
					el=div.firstChild;
					c.appendChild(el);
					this.chart[control]=el;
					this.controls[control]=el;
					CIQ.appendClassName(el,control);
				}
			}
		}
		var chartControls=this.controls.chartControls, home=this.controls.home;
		if(chartControls){
			var zoomIn=$$$(".stx-zoom-in", chartControls);
			var zoomOut=$$$(".stx-zoom-out", chartControls);

			CIQ.safeClickTouch(zoomIn,(function(self){return function(e){ if(self.allowZoom) self.zoomIn(e); e.stopPropagation(); };})(this));
			CIQ.safeClickTouch(zoomOut,(function(self){return function(e){ if(self.allowZoom) self.zoomOut(e); e.stopPropagation(); };})(this));
			if(!CIQ.touchDevice){
				this.makeModal(zoomIn);
				this.makeModal(zoomOut);
			}
		}
		if(home){
			CIQ.safeClickTouch(home, (function(self){
				return function(e) {
					e.stopPropagation();
					// If we are not in historical mode then scroll home
					if (!self.isHistoricalMode()){
						self.home({ animate: true });
						return;
					}
					// If in historical mode delete any range the chart might have to prevent setting it again and call newChart
					// This will be fast than scrolling and paginating forward as the chart progresses towards the current day
					delete self.layout.range;
					self.newChart(self.chart.symbol, null, null, function() { self.home({ animate: false }); }, null);
				};
			})(this));
			if(!CIQ.touchDevice){
				this.makeModal(home);
			}
		}
	};

	/**
	 * Convenience function to attach a modal on mouse events
	 * @param {HTMLElement} Element to attach the modal to
	 * @private
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.makeModal=function(element){
		var self=this;
		element.onmouseover=function(event){ self.modalBegin();};
		element.onmouseout=function(event){ self.modalEnd();};
	};
	/**
	 * Clones a style from a style object (obtained from getComputedStyle). Any styles are converted to camel case. This method automatically
	 * converts from browsers that store styles as numeric arrays rather than as property objects.
	 * @param  {object} styleObject A style object derived from getComputedStyle
	 * @return {object}	A new style object that will match properties
	 * @memberof CIQ.ChartEngine
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
	 * @memberof CIQ.ChartEngine
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
	 * @return {object}		Either the color or a class object
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.colorOrStyle=function(str){
		if(str.indexOf("#")!=-1) return str;
		if(str.indexOf("(")!=-1) return str; // rgb() or rgba()
		if(str=="transparent") return str;
		return this.canvasStyle(str);
	};

	/**
		Call this to remove all of the loaded canvas styles, for instance after loading a new css file
		@memberof CIQ.ChartEngine
	*/
	CIQ.ChartEngine.prototype.clearStyles=function(){
		this.styles={};
	};

	/**
	* Convenience method to programmatically set or change a style on the chart.
	*
	* To see immediate results, call {@link CIQ.ChartEngine#draw} once this method is used.
	*
	* Primarily used in the {@link CIQ.ThemeHelper} to programmatically override defaults CSS colors to create custom themes.
	*
	* For more details on customizing colors in the chart see {@tutorial Chart Styles and Types}.
	* @param  {string} obj The object whose style you wish to change (stx_grid, stx_xaxis, etc)
	* @param  {string} attribute The style name of the object you wish to change. It will accept hyphenated or camel case formats.
	* @param  {string} value The value to assign to the attribute
	* @example
	* stxx.setStyle("stx_candle_up","borderLeftColor","green");
	* stxx.setStyle("stx_candle_down","borderLeftColor","red");
	* stxx.draw();
	* @memberof CIQ.ChartEngine
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
	 * @memberof CIQ.ChartEngine
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
	 * @memberof CIQ.ChartEngine
	 * @since 4.0.0 Allow color:"transparent" to pass through and not use defaultColor.  Instead, use defaultColor if there is no style.color.
	 */
	CIQ.ChartEngine.prototype.canvasColor=function(className,ctx){
		if(!ctx) ctx=this.chart.context;
		var style=this.canvasStyle(className);
		if(!style) return;
		var color=style.color;
		if(!color) color=this.defaultColor;
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
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.getCanvasFontSize=function(className){
		var s=this.canvasStyle(className);
		var fs=s.fontSize;
		if(!fs) fs="12";
		return parseInt(CIQ.stripPX(fs),10);
	};

	/**
	 * Returns the canvas color specified in the class name
	 * @param  {string} className The class name
	 * @return {string}			  The color specified (May be undefined if none specified)
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.getCanvasColor=function(className){
		var s=this.canvasStyle(className);
		return s.color;
	};

	/**
	 * **Deprecated.**  Use {@link CIQ.ChartEngine.XAxis#noDraw} and {@link CIQ.ChartEngine.YAxis#noDraw} instead.
	 *
	 * Override this function to hide the date which floats along the X axis when crosshairs are enabled. Return `true` to hide the date or `false` to display.
	 * @memberof CIQ.ChartEngine
	 * @deprecated as of 6.0.0 no longer used in library.
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
	 * @memberof CIQ.ChartEngine
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
	 * @memberof CIQ.ChartEngine
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
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.registerDrawingTool=function(name, func){
		CIQ.ChartEngine.drawingTools[name]=func;
	};

	/**
	 * @memberOf  CIQ.ChartEngine
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
	 * Legacy method used to internally dispatch a registered event whenever a change to layout, drawings or theme occurs.
	 * Events must be registered using {@link CIQ.ChartEngine#addDomEventListener} for "layout", "drawing", "theme" and "preferences".
	 *
	 * This is simply a proxy method that calls the corresponding {@link CIQ.ChartEngine#dispatch} method.
	 *
	 * Developers creating their own custom functionality should call {@link CIQ.ChartEngine#dispatch} instead.
	 *
	 * @param  {string} change Type of change that occurred. Any string that {@link CIQ.ChartEngine#changeCallback} has been programmed to handle is valid.
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.changeOccurred=function(change){
		if(this.currentlyImporting) return;	// changes actually occurring because of an import, not user activity
		if(this.changeCallback) {
			console.warn('CIQ.ChartEngine.changeCallback has been deprecated. Please use addEventListener()');
			this.changeCallback(this, change);
		}
		var obj={stx:this, symbol: this.chart.symbol, symbolObject:this.chart.symbolObject, layout:this.layout, drawings:this.drawingObjects};
		if(change=="layout"){
			this.dispatch("layout", obj);
		}else if(change=="vector"){
			this.dispatch("drawing", obj);
		}else if(change=="theme"){
			this.dispatch("theme", obj);
		}else if (change=="preferences") {
			this.dispatch("preferences", obj);
		}
	};

	/**
	 * Sets the base chart type for the primary symbol.
	 * @param {string} chartType The chart type. See <a href="CIQ.ChartEngine.html#layout%5B%60chartType%60%5D">CIQ.ChartEngine.layout.chartType</a> for valid options.
	 *
	 * See {@tutorial Chart Styles and Types} for more details.
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.setChartType=function(chartType){
		var layout=this.layout, chart=this.chart;
		if(layout.aggregationType!="ohlc"){
			layout.aggregationType="ohlc";
			if(chart.canvas) this.createDataSet();
		}
		layout.chartType=chartType;
		this.setMainSeriesRenderer(true);
		chart.defaultChartStyleConfig={ type: chartType };
		if(this.displayInitialized) this.draw();
		this.changeOccurred("layout");
	};

	/**
	 * Sets the base aggregation type for the primary symbol.
	 * @param {string} chartType The chart type. See <a href="CIQ.ChartEngine.html#layout%5B%60aggregationType%60%5D">CIQ.ChartEngine.layout.aggregationType</a> for valid options.
	 *
	 * See {@tutorial Chart Styles and Types} for more details.
	 * See the [Overriding Defaults Section](tutorial-Chart Styles and Types.html#OverridingDefaults) for details on how to override aggregation type defaults.
	 * @param {string} aggregationType The chart type
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.setAggregationType=function(aggregationType){
		this.layout.chartType = 'candle';
		var chart=this.chart;
		if(chart.baseline.userLevel!==false) {
			chart.baseline.userLevel=chart.baseline.defaultLevel;
			chart.panel.yAxis.scroll=CIQ.ChartEngine.YAxis.prototype.scroll;
		}
		this.layout.aggregationType=aggregationType;
		this.setMainSeriesRenderer();
		if(chart.canvas){
			this.createDataSet();
			this.draw();
		}
		this.changeOccurred("layout");
	};

	/**
	 * Sets the chart scale.
	 * @param {string} chartScale "log", "linear", "percent", "relative".
	 *  - Setting to "percent" or "relative" will call {@link CIQ.ChartEngine#setComparison} even if no comparisons are present; which sets `stxx.chart.isComparison=true`.
	 *    - To check if scale is in percentage mode use `stxx.chart.isComparison` instead of using the {@link CIQ.ChartEngine#chartScale} value.
	 *  - See {@link CIQ.Comparison.initialPrice} for details on how to set basis for "relative" scale.
	 * @memberof CIQ.ChartEngine
	 * @since 4.1.0 added "percent"
	 * @since 5.1.0 added "relative"
	 */
	CIQ.ChartEngine.prototype.setChartScale=function(chartScale){
		var chart=this.chart;
		var needsTransform={
			"percent":true,
			"relative":true
		};
		if(!chartScale) chartScale="linear";
		if(needsTransform[chartScale]){
			this.setComparison(chartScale, chart, CIQ.Comparison.initialPrice);
		}else if(needsTransform[this.layout.chartScale]){
			this.setComparison(false, chart);
		}
		this.layout.chartScale=chartScale;
		if(chart.canvas) this.draw();
		this.changeOccurred("layout");
	};

	/**
	 * Sets the charts to adjusted values rather than standard values. Adjusted values are calculated outside of the chart engine (and may be splits, dividends or both).
	 * When charts are using adjusted values, a computed ratio for each tick is used for price to pixel calculations which keeps drawings accurate
	 * @param {boolean} data True to use adjusted values (Adj_Close), false to use Close values
	 * @memberof CIQ.ChartEngine
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
	 * @memberof CIQ.ChartEngine
	 * @deprecated
	 */
	CIQ.ChartEngine.prototype.setVolumeUnderlay=function(data){
		this.layout.volumeUnderlay=data;
		if(this.chart.canvas) this.draw();
		this.changeOccurred("layout");
	};

	/**
	 * Exports all of the drawings on the chart(s) so that they can be saved to an external database and later reconstructed.
	 *
	 * Note: This function has been renamed {@link CIQ.ChartEngine#exportDrawings}.
	 *
	 * @see {@link CIQ.ChartEngine#exportDrawings}
	 * @see {@link CIQ.ChartEngine#importDrawings}
	 * @return {array} An array of objects representing each drawing
	 * @memberof CIQ.ChartEngine
	 * @deprecated since 3.0.0
	 */
	CIQ.ChartEngine.prototype.serializeDrawings=function(){
		console.warn('CIQ.ChartEngine.serializeDrawings() has been deprecated. Please use exportDrawings()');
		return this.exportDrawings();
	};

	/**
	 * Exports all of the drawings on the chart(s) so that they can be saved to an external database and later imported with {@link CIQ.ChartEngine#importDrawings}.
	 * @see {@link CIQ.ChartEngine#importDrawings}
	 * @return {array} An array of objects representing each drawing
	 * @memberof CIQ.ChartEngine
	 * @since 3.0.0 Replaces serializeDrawings
	 */
	CIQ.ChartEngine.prototype.exportDrawings=function(){
		var arr=[];
		for(var i=0;i<this.drawingObjects.length;i++){
			arr.push(this.drawingObjects[i].serialize());
		}
		return arr;
	};

	/**
	 * Causes all drawings to delete themselves. External access should be made through @see CIQ.ChartEngine.prototype.clearDrawings
	 * @param {boolean} deletePermanent Set to false to not delete permanent drawings
	 * @private
	 * @memberof CIQ.ChartEngine
	 * @since 6.0.0 deletePermanent argument added
	 */
	CIQ.ChartEngine.prototype.abortDrawings=function(deletePermanent){
		if(deletePermanent!==false) deletePermanent=true;
		for(var i=this.drawingObjects.length-1;i>=0;i--){
			var drawing=this.drawingObjects[i];
			drawing.abort(true);
			if(deletePermanent || !drawing.permanent) this.drawingObjects.splice(i,1);
		}
	};


	/**
	 * Imports drawings from an array originally created by {@link CIQ.ChartEngine#serializeDrawings}.
	 *
	 * Note: This function and serializeDrawings have been renamed {@link CIQ.ChartEngine#importDrawings} and {@link CIQ.ChartEngine#exportDrawings} respectively.
	 *
	 * To immediately render the reconstructed drawings, you must call `draw()`.
	 * See {@tutorial Using and Customizing Drawing Tools} for more details.
	 * @see {@link CIQ.ChartEngine#exportDrawings}
	 * @see {@link CIQ.ChartEngine#importDrawings}
	 * @param  {array} arr An array of serialized drawings
	 * @memberof CIQ.ChartEngine
	 * @deprecated since 4.0.0
	*/
	CIQ.ChartEngine.prototype.reconstructDrawings=function(arr){
		console.warn('CIQ.ChartEngine.reconstructDrawings() has been deprecated. Please use importDrawings()');
		this.importDrawings(arr);
	};

	/**
	 * Imports drawings from an array originally created by {@link CIQ.ChartEngine#exportDrawings}.
	 * To immediately render the reconstructed drawings, you must call `draw()`.
	 * See {@tutorial Using and Customizing Drawing Tools} for more details.
	 *
	 * **Important:**
	 * Calling this function in a way that will cause it to run simultaneously with [importLayout]{@link CIQ.ChartEngine#importLayout}
	 * will damage the results on the layout load. To prevent this, use the {@link CIQ.ChartEngine#importLayout} or {@link CIQ.ChartEngine#newChart} callbacks.
	 *
	 * @see {@link CIQ.ChartEngine#exportDrawings}
	 * @param  {array} arr An array of serialized drawings
	 * @memberof CIQ.ChartEngine
	 * @since 4.0.0 Replaces reconstructDrawings
	 * @example
	 * // programmatically add a rectangle
	 * stxx.importDrawings([{"name":"rectangle","pnl":"chart","col":"transparent","fc":"#7DA6F5","ptrn":"solid","lw":1.1,"d0":"20151216030000000","d1":"20151216081000000","tzo0":300,"tzo1":300,"v0":152.5508906882591,"v1":143.3385829959514}]);
	 * // programmatically add a vertical line
	 * stxx.importDrawings([{"name":"vertical","pnl":"chart","col":"transparent","ptrn":"solid","lw":1.1,"v0":147.45987854251013,"d0":"20151216023000000","tzo0":300,"al":true}]);
	 * // now render the reconstructed drawings
	 * stxx.draw();
	 */
	CIQ.ChartEngine.prototype.importDrawings=function(arr){
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
	 * @param {boolean} deletePermanent Set to false to not delete permanent drawings
	 * @memberof CIQ.ChartEngine
	 * @since 6.0.0 deletePermanent argument added
	 */
	CIQ.ChartEngine.prototype.clearDrawings=function(cantUndo, deletePermanent){
		if(deletePermanent!==false) deletePermanent=true;
		var before=CIQ.shallowClone(this.drawingObjects);
		this.abortDrawings(deletePermanent);
		if(cantUndo){
			this.undoStamps=[];
		}else{
			this.undoStamp(before, CIQ.shallowClone(this.drawingObjects));
		}
		this.changeOccurred("vector");
		//this.createDataSet();
		//this.deleteHighlighted(); // this will remove any stickies and also call draw()
		// deleteHighlighted was doing too much, so next we call 'just' what we need.
		this.cancelTouchSingleClick=true;
		CIQ.clearCanvas(this.chart.tempCanvas, this);
		this.draw();
		var mSticky=this.controls.mSticky;
		if(mSticky){
			mSticky.style.display="none";
			mSticky.children[0].innerHTML="";
		}
	};

	/**
	 * Creates a new drawing of the specified type with the specified parameters. See {@tutorial Using and Customizing Drawing Tools} for more details.
	 * @param  {string} type	   Drawing name
	 * @param  {object} parameters Parameters that describe the drawing
	 * @return {CIQ.Drawing}			A drawing object
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.createDrawing=function(type, parameters){
		if(!CIQ.Drawing) return;
		var drawing=new CIQ.Drawing[type]();
		drawing.reconstruct(this, parameters);
		//set default configs if not provided
		var config=new CIQ.Drawing[type]();
		config.stx=this;
		config.copyConfig();
		for(var prop in config) {
			drawing[prop] = drawing[prop] || config[prop];
		}
		this.drawingObjects.push(drawing);
		this.draw();
		return drawing;
	};

	/**
	 * Removes the drawing. Drawing object should be one returned from {@link CIQ.ChartEngine#createDrawing}. See {@tutorial Using and Customizing Drawing Tools} for more details.
	 * @param  {object} drawing Drawing object
	 * @memberof CIQ.ChartEngine
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
	 * Returns a date (in yyyymmddhhmm form) given a tick (location in the dataSet).
	 * If the tick lies outside of the dataSet then the date will be arrived at algorithmically by calculating into the past or future.
	 * @param  {number} tick  Location in the dataSet
	 * @param  {CIQ.ChartEngine.Chart} [chart] A chart object
	 * @param  {boolean} [nativeDate] True to return as date object otherwise returns in yyyymmddhhmm form
	 * @return {string}		  The date form dictated by native param
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.dateFromTick=function(tick, chart, nativeDate) {
		if(!chart) chart = this.chart;
		var data_len = chart.dataSet.length;
		var dt;
		var iter;
		var result;
		var addedTempDate = false;

		// if empty chart then add current date so this function supports initializing an empty chart in quotefeed
		if (data_len === 0){
			chart.dataSet[0]={};
			chart.dataSet[0].DT=new Date();
			data_len = chart.dataSet.length;
			addedTempDate = true;
		}

		if (tick < 0) {
			iter = this.standardMarketIterator(chart.dataSet[0].DT);
			dt = iter.previous(Math.abs(tick));
		} else if (tick >= data_len) {
			iter = this.standardMarketIterator(chart.dataSet[data_len - 1].DT);
			dt = iter.next(tick-(data_len-1));
		} else {
			dt = chart.dataSet[tick].DT;
		}

		if (nativeDate) {
			result =  new Date(dt.getTime());
		} else {
			result = CIQ.yyyymmddhhmm(dt);
		}

		if (addedTempDate) {
			delete chart.dataSet[0].DT;
		}
		return result;
	};

	/**
	 * Calculates and sets the value of zoom and scroll for y-axis based on yAxis.initialMarginTop and yAxis.initialMarginBottom.
	 * This method will automatically translate those into starting scroll and zoom factors.
	 * If the combined initial values are greater than the y-axis height, then both zoom and scroll will be reset to 0;
	 * @param {CIQ.ChartEngine.YAxis} yAxis The yAxis to reset
	 * @memberof CIQ.ChartEngine
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
	 * Returns the minimum spacing required between the latest tick on the chart and the price label.
	 * @param  {CIQ.ChartEngine} stx	  The charting object
	 * @param  {CIQ.ChartEngine.Chart} chart	The specific chart
	 * @param  {string} chartType	The chart rendering type (candle, line, etc)
	 * @returns  {number} pixels to offset
	 * @memberof CIQ.ChartEngine
	 * @since 4.0.0
	 * @since 5.1.0 removed stx param
	 */
	CIQ.ChartEngine.prototype.getLabelOffsetInPixels=function(chart, chartType){
		var isLineType=(!this.mainSeriesRenderer || !this.mainSeriesRenderer.standaloneBars) && !this.standaloneBars[chartType];
		if(this.yaxisLabelStyle=="roundRectArrow" && !(isLineType && this.extendLastTick && chart.yaxisPaddingRight!==0)){
			// Special case when we have a pointy arrow we want the current tick to be right
			// at the arrow point, not buried underneath it
			// unless the developer set the flags to extend the line/mountain to the very edge of the chart.
			// or unless the y-axis is overlaying the chart
			var margin=3; // should be the same from createYAxisLabel
			var height=this.getCanvasFontSize("stx_yaxis")+margin*2;
			return height*0.66;
		}
		return 0;
	};

	/**
	 * Returns the chart to the home position, where the most recent tick is on the right side of the screen.
	 *
	 * By default the home() behavior is to maintain the white space currently on the right side of the chart.
	 * To align the chart to the right edge instead, set the white space to 0  by calling: `stxx.home({whitespace:0});` or `stxx.home({maintainWhitespace:false});`
	 *
	 * @param {object} params Object containing the following keys:
	 * @param {boolean} [params.animate = false] Set to true to animate a smooth scroll to the home position.
	 * @param {boolean} [params.maintainWhitespace = true] Set to `true` to maintain the currently visible white space on the right of the chart, or to `false` to align to the right edge.
	 * @param {number} [params.whitespace = 0] Override to force a specific amount of whitespace on the right of the chart.
	 *		This will take precedence over `params.maintainWhitespace`
	 * @param {CIQ.ChartEngine.Chart} [params.chart] Chart to scroll home. If not defined, all chart objects will be returned to the home position.
	 * @memberof CIQ.ChartEngine
	 * @example
	 * stxx.home({maintainWhitespace:false});
	 */
	CIQ.ChartEngine.prototype.home=function(params){
		this.swipe.amplitude=0;
		var layout=this.layout;
		if(typeof params != "object"){
			// backward compatibility
			params={
				maintainWhitespace: params
			};
		}

		function resetPanelZooms(stx){
			for(var p in stx.panels){
				var yAxes=stx.panels[p].yaxisLHS.concat(stx.panels[p].yaxisRHS);
				for (var a=0;a<yAxes.length;a++) stx.calculateYAxisMargins(yAxes[a]);
			}
		}
		function scrollToCallback(self, chart, exactScroll){
			return function(){
				resetPanelZooms(self);
				chart.scroll=exactScroll;
				self.draw();
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
		var barsDisplayedOnScreen=Math.floor(this.chart.width/layout.candleWidth);
		for(var chartName in this.charts){
			var chart=this.charts[chartName];
			if(params.chart && params.chart!=chart) continue;

			var whitespace=0;
			if(params.maintainWhitespace && this.preferences.whitespace>=0) whitespace=this.preferences.whitespace;
			if(params.whitespace || params.whitespace===0) whitespace=params.whitespace;
			var leftMargin=this.getLabelOffsetInPixels(chart,layout.chartType);
			if(leftMargin>whitespace) whitespace=leftMargin;

			var exactScroll=Math.min(barsDisplayedOnScreen,chart.dataSet.length); // the scroll must be the number of bars you want to see.
			if(this.chart.allowScrollPast) exactScroll=barsDisplayedOnScreen; // If whitespace allowed on left of screen
			this.micropixels=this.chart.width-(exactScroll*layout.candleWidth)-whitespace;
			this.preferences.whitespace=whitespace;
			while(this.micropixels>layout.candleWidth){ // If micropixels is larger than a candle then scroll back further
				exactScroll++;
				this.micropixels-=layout.candleWidth;
			}
			while(this.micropixels<0){
				exactScroll--;
				this.micropixels+=layout.candleWidth;
			}
			this.micropixels-=layout.candleWidth;
			exactScroll++;
			if((!this.mainSeriesRenderer || !this.mainSeriesRenderer.standaloneBars) && !this.standaloneBars[layout.chartType])
				this.micropixels+=layout.candleWidth/2; // bar charts display at beginning of candle

			if(params.animate){
				var self=this;
				this.scrollTo(chart, exactScroll,scrollToCallback(self, chart, exactScroll));
			}else{
				chart.scroll=exactScroll;
				resetPanelZooms(this);
			}
		}
		this.draw();
	};

	/**
	 * Whether the chart is scrolled to a home position.
	 *
	 * @returns {boolean} true when the scroll position shows the last tick of the dataSet
	 * @memberof CIQ.ChartEngine
	 * @since 2016-06-21
	 */
	CIQ.ChartEngine.prototype.isHome=function() {
		var chart=this.chart, dataSet=chart.dataSet, animating=chart.animatingHorizontalScroll;
		return this.pixelFromTick(dataSet.length-(animating?2:1),chart)<chart.width+chart.panel.left;
		//return ((this.chart.scroll-1)*this.layout.candleWidth)+this.micropixels<=this.chart.width+1;
	};

	/**
	 * Returns the tick (position in dataSet) given the requested date.
	 *
	 * The date does not need to match exactly. If the date lies between ticks then the earlier will be returned by default.
	 *
	 * @param  {string} dt	  Date in string format
	 * @param  {CIQ.ChartEngine.Chart} [chart] Chart object
	 * @param  {number} [adj] Timezone adjustment in minutes to apply to date before getting tick
	 * @param  {boolean} [forward] Switch to return the next tick as opposed to the previous, in case an exact match is not found
	 * @return {number}		  The tick location
	 * @memberof CIQ.ChartEngine
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
			return total+(forward?1:0);
		}

		var firstDate=chart.dataSet[0].DT;
		var lastDate=chart.dataSet[chart.dataSet.length-1].DT;
		if(target>=firstDate && target<=lastDate){
			var begin=0,end=chart.dataSet.length,attempts=0;
			while(++attempts<100){
				var i=Math.floor((end+begin)/2);
				var d=chart.dataSet[i].DT;
				if(+d==+target){
					chart.tickCache[ms]=i;
					return i;
				}
				if(d<target){
					begin=i;
 				}
				if(d>target){
					if(chart.dataSet[i-1].DT<target){
						chart.tickCache[ms]=i-1;
						return chart.tickCache[ms]+(forward?1:0);
					}
					if(+chart.dataSet[i-1].DT==+target){  // efficiency
						chart.tickCache[ms]=i-1;
						return i-1;
					}
					end=i;
				}
			}
			if(attempts>=100){
				console.log("!!!Warning: tickFromDate() did not find match.");
				return chart.dataSet.length;
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
	 * This is the object stored in CIQ.ChartEngine.chart.xaxis array which contains information regarding an x-axis tick.
	 * See {@link CIQ.ChartEngine.AdvancedInjectable#createXAxis} for more detail.
	 * @constructor
	 * @param {number} hz Horizontal position of center of label in pixels. Any elements with negative positions will be off the edge of the screen, and are only maintained to help produce a more predictable display as the chart is zoomed and paned.
	 * @param {string} grid Either "line" or "boundary" depending on whether the label should be a date/time boundary or just a grid line
	 * @param {string} text The text to display in the label
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
	 * Call this method to create the X axis (date axis). Uses {@link CIQ.ChartEngine#createTickXAxisWithDates}.
	 *
	 * Use css styles `stx_xaxis` to control colors and fonts for the dates. <br>
	 * Use css styles `stx_xaxis_dark` to control **color only** for the divider dates. <br>
	 * Use css styles `stx_grid_border`, `stx_grid` and `stx_grid_dark` to control the grid line colors. <br>
	 * The dark styles are used for dividers; when the grid changes to a major point such as the start of a new day on an intraday chart, or a new month on a daily chart.
	 *
	 * See {@tutorial Custom X-axis} and {@tutorial CSS Overview} for additional details.
	 *
	 * @param  {CIQ.ChartEngine.Chart} chart	The chart to create an x-axis for
	 * @return {CIQ.ChartEngine.XAxisLabel[]}			axisRepresentation that can be passed in to {@link CIQ.ChartEngine#drawXAxis}
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias createXAxis
	 *
	 */
	CIQ.ChartEngine.prototype.createXAxis=function(chart){
		//TODO caching of xaxis probably in this function.
		if(chart.dataSegment.length<=0) return null;
		if(chart.xAxis.noDraw) return null;
		var arguments$=[chart];
		var axisRepresentation=this.runPrepend("createXAxis", arguments$);
		if(axisRepresentation) return axisRepresentation;
		if(this.mainSeriesRenderer && this.mainSeriesRenderer.createXAxis){
			axisRepresentation = this.mainSeriesRenderer.createXAxis(chart);
		}else{
			axisRepresentation = this.createTickXAxisWithDates(chart);
		}
		this.headsUpHR();
		this.runAppend("createXAxis", arguments$);
		return axisRepresentation;
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Resets the YAxis width to the last known user value (or default).
	 * <br>Called internally whenever the YAxis label width might change.
	 *
	 * @param {Object} [params]
	 * @param {boolean} [params.noRecalculate=false] when true {@link CIQ.ChartEngine#calculateYAxisPositions} will never be called
	 * @param {string} [params.chartName] only reset dynamic values for YAxis of the given chart.
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias resetDynamicYAxis
	 * @see {@link CIQ.ChartEngine.Chart#dynamicYAxis} the flag to enable this feature.
	 * @since 6.0.0
	 */
	CIQ.ChartEngine.prototype.resetDynamicYAxis=function(params) {
		if (this.runPrepend("resetDynamicYAxis", arguments)) return;

		var resetting = false;

		for (var panelName in this.panels) {
			var panel = this.panels[panelName];

			if (params && params.chartName && panel.chart.name !== params.chartName) continue;
			if (!panel.yaxisLHS || !panel.yaxisRHS) continue;

			var yaxis = panel.yaxisLHS.concat(panel.yaxisRHS);

			for (var i = 0; i < yaxis.length; i++) {
				if (yaxis[i]._dynamicWidth) {
					// NaN is falsy, see the {@link CIQ.ChartEngine.YAxis#width} getter for context
					yaxis[i]._dynamicWidth = NaN;
					resetting = true;
				}
			}
		}

		if (resetting && (!params || !params.noRecalculate)) {
			this.calculateYAxisPositions();
		}

		this.runAppend("resetDynamicYAxis", arguments);
	};

	/**
	 * Change the yAxis.top and yAxis.bottom to create drawing space
	 * for the xAxis.
	 *
	 * @param {CIQ.ChartEngine.Panel} panel	Panel to adjust, used to check location
	 * @param {CIQ.ChartEngine.YAxis} yAxis	yAxis to adjust
	 * @private
	 */
	CIQ.ChartEngine.prototype.adjustYAxisHeightOffset = function(panel, yAxis) {
		var topOffset=yAxis.topOffset, bottomOffset=yAxis.bottomOffset;
		//If the sum of bottomOffset and topOffset is larger than the panel height reset them
		if(topOffset+bottomOffset>panel.height){
			console.log("The sum of yAxis.topOffset and yAxis.bottomOffset cannot be greater than the panel height. Both values will be reset to 0.");
			yAxis.bottomOffset=0;
			yAxis.topOffset=0;
		}

		if(!this.xaxisHeight && this.xaxisHeight!==0){
			this.xaxisHeight=this.getCanvasFontSize("stx_xaxis")+4;
			if(this.chart.xAxis.displayBorder || this.axisBorders) this.xaxisHeight+=3;
		}
		var panelHasTheAxis=((this.xAxisAsFooter && (panel.bottom > this.chart.canvasHeight-this.xaxisHeight)) ||
								(!this.xAxisAsFooter && (panel == this.chart.panel)));
		if (panelHasTheAxis) bottomOffset += this.xaxisHeight;

		yAxis.top = panel.top + topOffset;
		yAxis.bottom = panel.bottom - bottomOffset;
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * <span class="animation">Animation Loop</span>
	 *
	 * Draws the grid for the y-axis.
	 * @param  {CIQ.ChartEngine.Panel} panel The panel for the y-axis
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias plotYAxisGrid
	 */
	CIQ.ChartEngine.prototype.plotYAxisGrid=function(panel){
		if(this.runPrepend("plotYAxisGrid", arguments)) return;
		var context=this.chart.context;
		if(panel.yAxis.yAxisPlotter) {
			panel.yAxis.yAxisPlotter.draw(context, "grid");
		}
		this.runAppend("plotYAxisGrid", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * <span class="animation">Animation Loop</span>
	 *
	 * Plots the text on the y-axis.
	 * @param  {CIQ.ChartEngine.Panel} panel The panel for the y-axis
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias plotYAxisText
	 */
	CIQ.ChartEngine.prototype.plotYAxisText=function(panel){
		if(this.runPrepend("plotYAxisText", arguments)) return;
		this.canvasFont("stx_yaxis");
		this.canvasColor("stx_yaxis");
		var context=this.chart.context;
		context.textBaseline="middle";
		function drawText(yAxis){
			if(!yAxis.yAxisPlotter) return;
			if(yAxis.noDraw || !yAxis.width) return;
			if(yAxis.justifyRight) context.textAlign="right";
			else if(yAxis.justifyRight===false) context.textAlign="left";
			yAxis.yAxisPlotter.draw(context, "text");
			context.textBaseline="alphabetic";
			context.textAlign="left";
		}
		var arr=panel.yaxisLHS, i;
		context.textAlign="right";
		for(i=0;i<arr.length;i++) drawText(arr[i]);
		arr=panel.yaxisRHS;
		context.textAlign="left";
		for(i=0;i<arr.length;i++) drawText(arr[i]);

		this.runAppend("plotYAxisText", arguments);
	};

	/**
	 * Returns the appropriate number of decimal points to show for a given priceTick (distance between two ticks)
	 * @param  {number} priceTick The distance between two ticks
	 * @return {number}		  The number of decimal places appropriate to show
	 * @memberof CIQ.ChartEngine
	 * @since 5.2.0
	 */
	CIQ.ChartEngine.prototype.decimalPlacesFromPriceTick=function(priceTick){
		if(priceTick<0.0001) return 8;
		if(priceTick<0.01) return 4;
		if(priceTick<0.1) return 2;
		if(priceTick<1) return 1;
		return 0;
	};

	/**
	 * Formats prices for the Y-axis.
	 *
	 * Intelligently computes the decimal places based on the size of the y-axis ticks.

	 * If the panel is a study panel, then prices will be condensed by {@link CIQ.condenseInt} if equal or over 1000.
	 * This can be overridden by manually setting {@link CIQ.ChartEngine.YAxis#decimalPlaces}.

	 * You can call this method to ensure that any prices that you are using outside of the chart are formatted the same as the prices on the y-axis.
	 * @param  {number} price The price to be formatted
	 * @param  {CIQ.ChartEngine.Panel} panel The panel for the y-axis.
	 * @param {number} [requestedDecimalPlaces] Number of decimal places, otherwise it will be determined by the yaxis setting, or if not set, determined automatically
	 * @param {CIQ.ChartEngine.YAxis} [yAxis] yAxis. If not present, the panel's y-axis will be used.
	 * @param  {boolean} internationalize Normally this function will return an internationalized result.  Set this param to false to bypass.
	 * @return {number}		  The formatted price
	 * @memberof CIQ.ChartEngine
	 * @since
	 * <br>&bull; 4.0.0 CondenseInt will be called only if equal or over 1000 rather than 100.
	 * <br>&bull; 5.2.0 All axes will be condensed to some degree to allow for more uniform decimal precision
	 * <br>&bull; 6.1.0 Added internationalize argument
	 */
	CIQ.ChartEngine.prototype.formatYAxisPrice=function(price, panel, requestedDecimalPlaces, yAxis, internationalize){
		if(price===null || typeof price=="undefined" || isNaN(price) ) return "";
		var yax=yAxis?yAxis:panel.yAxis;
		var decimalPlaces=requestedDecimalPlaces;
		if(!decimalPlaces && decimalPlaces!==0) decimalPlaces=yax.printDecimalPlaces;
		if(!decimalPlaces && decimalPlaces!==0){
			decimalPlaces=this.decimalPlacesFromPriceTick(yax.priceTick);
		}
		var minCondense=yax==panel.chart.yAxis?20000:1000;
		if(yax.priceTick>=minCondense){	// k or m for thousands or millions
			return CIQ.condenseInt(price);
		}

		var internationalizer=this.internationalizer;
		if(internationalizer && internationalize!==false){
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
	 * @param  {number} price A price
	 * @param  {number} [determinant] Value to determine the decimal places. For
	 * instance, if you want to determine the number of decimals for today's change based on the actual price
	 * @return {string}       A price padded for decimal places
	 * @memberOf  CIQ.ChartEngine
	 * @since 2016-07-16
	 */
	CIQ.ChartEngine.prototype.padOutPrice=function(price, determinant){
		if(price!==0 && (!price || typeof price!="number")) return "";
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
	 * @return {string}		  The formatted price
	 * @memberof CIQ.ChartEngine
	 * @since 6.2.0 Return value will always be a string
	 */
	CIQ.ChartEngine.prototype.formatPrice=function(price, panel){
		if(price!==0 && (!price || typeof price=="undefined")) return "";
		if(!panel) panel=this.currentPanel;
		if(!panel) panel=this.chart.panel;
		if(!panel) return price.toString();
		var decimalPlaces=panel.decimalPlaces;
		if(!decimalPlaces && decimalPlaces!==0){
			decimalPlaces=panel.chart.decimalPlaces;
		}
		if(!decimalPlaces && decimalPlaces!==0){
			return price.toString();
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
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias createCrosshairs
	 */
	CIQ.ChartEngine.prototype.createCrosshairs=function(){
		if(this.runPrepend("createCrosshairs", arguments)) return;
		if(!this.manageTouchAndMouse) return;

		var crossX=this.controls.crossX, crossY=this.controls.crossY;
		if(crossX){
			if(!crossX.onmousedown) {
				crossX.onmousedown=function(e){
					if(!e) e=event;
					if(e.preventDefault) e.preventDefault();
					return false;
				};
			}
		}

		if(crossY){
			if(!crossY.onmousedown) {
				crossY.onmousedown=function(e){
					if(!e) e=event;
					if(e.preventDefault) e.preventDefault();
					return false;
				};
			}
		}

		this.runAppend("createCrosshairs", arguments);
	};

	/**
	 * This method determines the high and low values for the data set. It requires an array of fields to check. For instance
	 * the array might contain ["Close","Series1","Series2"] which would return the max and min of all of those values for each
	 * quote.
	 *
	 * @param  {array} quotes The array of quotes to evaluate for min and max (typically CIQ.ChartEngine.chart.dataSegment)
	 * @param  {array} fields A list of fields to compare
	 * @param {boolean} [sum] If true then compute maximum sum rather than the maximum single value
	 * @param {boolean} [bypassTransform] If true then bypass any transformations
	 * @param {number} [length] Specifies how much of the quotes to process
	 * @return {array}		  A tuple, min and max values
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.determineMinMax=function(quotes, fields, sum, bypassTransform, length){
		var highValue=Number.MAX_VALUE*-1;
		var lowValue=Number.MAX_VALUE;
		var isTransform=false;
		var l=quotes.length;
		if(length) l=length;

		for(var i=0;i<=l+1;i++){
			var quote;
			//if(i==l && lowValue!=Number.MAX_VALUE && lowValue!=highValue) break;  // no need to examine off-chart values
			// Here only the first field in the fields array is checked.  A different approach might be to check all the fields.
			if(fields.length){
				if(i==l) {
					//if(leftmostQuoteExists) continue;  // no need to fetch bar to left of dataSegment
					quote=this.getPreviousBar(this.chart, fields[0], 0);
				}
				else if(i==l+1) {
					//if(rightmostQuoteExists) continue;  // no need to fetch bar to right of dataSegment
					quote=this.getNextBar(this.chart, fields[0], l-1);
				}
				else quote=quotes[i];
			}
			if(!quote) continue;
			if(!bypassTransform){
				if(quote.transform) {
					isTransform=true;
					quote=quote.transform;
				}else if(isTransform) continue;	 //don't include points without transforms if we have been including points with transforms
			}
			var acc=0;
			for(var j=0;j<fields.length;j++){
				var tuple=CIQ.existsInObjectChain(quote,fields[j]);
				if(!tuple) continue;
				var f=tuple.obj[tuple.member];
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
						//if(i===0) leftmostQuoteExists=true;
						//if(i==l-1) rightmostQuoteExists=true;
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
	 * @param {number} [low] The low value for the axis
	 * @param {number} [high] The high value for the axis
	 * @since 5.2.0 when y axis is zoomed in, there will be no limitation on vertical panning
	 */
	CIQ.ChartEngine.prototype.calculateYAxisRange=function(panel, yAxis, low, high){
		if(low==Number.MAX_VALUE){
			low=0;
			high=0;
		}
		var cheight=panel.height, newHigh=null, newLow=null;
		this.adjustYAxisHeightOffset(panel, yAxis);
		yAxis.height=yAxis.bottom-yAxis.top;
		// Ensure the user hasn't scrolled off the top or the bottom of the chart when the chart is not zoomed in
		var verticalPad=Math.round(Math.abs(cheight/5));
		if(yAxis.zoom >= 0 && cheight-Math.abs(yAxis.scroll)<verticalPad){
			yAxis.scroll=(cheight-verticalPad)*(yAxis.scroll<0?-1:1);
		}

		if(low || low===0){
			if(high-low===0){	// A stock that has no movement, so we create some padding so that a straight line will appear
				var padding=Math.pow(10,-(low.toString()+".").split(".")[1].length);
				if(padding==1) padding=100;  // For whole number prices, widen the shadow
				newHigh=low+padding;
				newLow=low-padding;
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
		if(panel.chart.name===panel.name && panel.yAxis.name===yAxis.name){ // For the main yaxis on the main chart only check for semilog
			var isLogScale=(this.layout.semiLog || this.layout.chartScale=="log");
			if(panel.chart.isComparison || this.layout.aggregationType=="pandf") isLogScale=false;
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
	 * This method creates and draws all y-axes for all panels
	 *
	 * yAxis.high - The highest value on the y-axis
	 * yAxis.low - The lowest value on the y-axis
	 *
	 * @param  {CIQ.ChartEngine.Chart} chart The chart to create y-axis
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias renderYAxis
	 * @since  15-07-01
	 */
	CIQ.ChartEngine.prototype.renderYAxis=function(chart){
		if(this.runPrepend("renderYAxis", arguments)) return;

		this.rendererAction(chart,"yAxis");

		for(var p in this.panels){
			var panel=this.panels[p];
			if(panel.chart!=chart) continue;

			var arr=panel.yaxisRHS.concat(panel.yaxisLHS);

			// Iterate through all the yaxis for the panel and set all the necessary calculations
			// For the primary yaxis (panel.yAxis) we will set the low and high values based on the range
			// of values in the chart itself
			var i, yAxis, parameters={};
			for(i=0;i<arr.length;i++){
				yAxis=arr[i];
				this.calculateYAxisRange(panel, yAxis, yAxis.lowValue, yAxis.highValue);
				if(CIQ.Studies) parameters=CIQ.Studies.getYAxisParameters(this, yAxis);
				parameters.yAxis=yAxis;
				this.createYAxis(panel, parameters);
				this.drawYAxis(panel, parameters);
				if(CIQ.Studies) CIQ.Studies.doPostDrawYAxis(this, yAxis);
			}
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
	 *
	 * chart.highValue - The highest value on the chart
	 * chart.lowValue - The lowest value on the chart
	 *
	 * @param  {CIQ.ChartEngine.Chart} chart The chart to initialize
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias initializeDisplay
	 * @since 5.2.0. It now also calculates the minimum and maximum points in all study panels. This calculation was previously done using {@link CIQ.Studies.determineMinMax}, now deprecated.
	 */
	CIQ.ChartEngine.prototype.initializeDisplay=function(chart){
		if(this.runPrepend("initializeDisplay", arguments)) return;
		var fields=[];
		var self=this;
		function setYAxisFields(yAxis, panel){
			// first see if this is an axis for a study; if so, get the fields
			var isStudyAxis=false;
			var sd=self.layout && self.layout.studies && self.layout.studies[yAxis.name];
			if(sd){
				for(var j in sd.outputMap) fields.push(j);
				if(sd.study && sd.study.renderer) {  // if there is a study renderer, just assume it requires OHLC regardless of the renderer type
					fields=fields.concat(CIQ.createObjectChainNames(j,["Close", "Open", "High", "Low"]));
				}
				for(var h=0;h<=2;h++) fields.push(sd.name+"_hist"+(h?h:""));
				isStudyAxis=true;
			}
			if(!panel) return;  //to end recursion from includeOverlaysInMinMax below

			// then check renderers and add fields for each series in the renderer using this yaxis
			var baseFields=[];
			for(var id in chart.seriesRenderers){
				var renderer=chart.seriesRenderers[id], params=renderer.params, panelName=params.panel;
				if((params.yAxis || !self.panels[panelName] || self.panels[panelName].yAxis)!=yAxis) continue;
				if(renderer.highLowBars) baseFields=["Close", "Open", "High", "Low"];
				else baseFields=[chart.defaultPlotField || "Close"];
				for(var id2=0; id2<renderer.seriesParams.length; id2++){	// Find any series that share the Y axis
					var seriesParams=renderer.seriesParams[id2];
					if(seriesParams.subField){
						fields=fields.concat(CIQ.createObjectChainNames(seriesParams.symbol,[seriesParams.subField])).concat(seriesParams.symbol);
					}else if(seriesParams.symbol){
						fields=fields.concat(CIQ.createObjectChainNames(seriesParams.symbol,baseFields)).concat(seriesParams.symbol);
					}else if(seriesParams.field){
						fields.push(seriesParams.field);
					}else if(yAxis==chart.panel.yAxis){ // only if the main chart panel's yAxis include baseFields
						fields=fields.concat(baseFields);
					}
				}
			}
			// Finally add any fields used by overlay studies
			if(chart.includeOverlaysInMinMax){
				for(var overlay in self.overlays){
					var o=self.overlays[overlay];
					if(o.panel!=panel.name) continue;
					if(o.name==yAxis.name) continue; // don't loop thru the same axis twice and create duplicates
					var oAxis=self.getYAxisByName(o.panel, o.name) || panel.yAxis;
					if(oAxis!=yAxis) continue;
					setYAxisFields({name:o.name});
				}
			}
		}
		var minMax;
		var length=null;

		// We often have an extra tick hanging off the edge of the screen. We don't want this
		// tick to affect the high and low calculation though. That causes jumpiness when
		// zooming because the chart is alternately including and excluding that tick
		var ticksOnScreen=Math.floor((chart.width-this.micropixels)/this.layout.candleWidth);
		if(chart.scroll>chart.maxTicks && chart.maxTicks>ticksOnScreen+1) length=chart.dataSegment.length-1;

		var arr=[];
		for(var p in this.panels){
			var myPanel=this.panels[p];
			arr=myPanel.yaxisLHS.concat(myPanel.yaxisRHS);
			for(var y=0;y<arr.length;y++){
				var yAxis=arr[y];
				fields=[];
				var doTransform=chart.transformFunc && yAxis==chart.panel.yAxis;
				setYAxisFields(yAxis, myPanel);
				if(this.mainSeriesRenderer && this.mainSeriesRenderer.determineMax){
					minMax=this.mainSeriesRenderer.determineMax(chart.dataSegment, fields, null, !doTransform, length);
				}else{
					minMax=this.determineMinMax(chart.dataSegment, fields, null, !doTransform, length);
				}
				if(this.mainSeriesRenderer && chart.yAxis==yAxis){
					if(!this.mainSeriesRenderer.highLowBars || !this.highLowBars[this.layout.chartType]){	// line charts shouldn't take into account high and low values, just close
						var mainSeriesRenderer=this.mainSeriesRenderer || {};
						if(chart.panel==myPanel && mainSeriesRenderer.params && mainSeriesRenderer.params.baseline && mainSeriesRenderer.params.type!="mountain"){
							var base=chart.baseline.actualLevel;
							if(base || base===0){
								if(doTransform) base=chart.transformFunc(this,chart,base);
								var diff=Math.max(base-minMax[0],minMax[1]-base);
								if(this.repositioningBaseline){
									minMax=[chart.lowValue,chart.highValue];
								}else{
									minMax[0]=base-diff;
									minMax[1]=base+diff;
								}
							}
						}
					}
				}
				yAxis.lowValue=minMax[0];
				yAxis.highValue=minMax[1];
				if(yAxis==chart.panel.yAxis) {
					chart.lowValue=yAxis.lowValue;
					chart.highValue=yAxis.highValue;
				}
			}
		}
		var aggregation=chart.state.aggregation;
		if(aggregation && aggregation.box){
			// Make room for X and O rendering since half of it lies beyond the high/low
			chart.lowValue-=aggregation.box/2;
			chart.highValue+=aggregation.box/2;
		}
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
	 * Example 1 <iframe width="100%" height="500" scrolling="no" seamless="seamless" align="top" style="float:top" src="https://jsfiddle.net/chartiq/b6pkzrad/embedded/result,js,html/" allowfullscreen="allowfullscreen" frameborder="1"></iframe>
	 *
	 * Example 2 <iframe width="100%" height="500" scrolling="no" seamless="seamless" align="top" style="float:top" src="https://jsfiddle.net/chartiq/rb423n71/embedded/result,js,html/" allowfullscreen="allowfullscreen" frameborder="1"></iframe>
	 *
	 * You must manage the persistency of a renderer, and remove individual series ({@link CIQ.Renderer#removeSeries} ) , remove all series ({@link CIQ.Renderer#removeAllSeries}) or even delete the renderer ({@link CIQ.ChartEngine#removeSeriesRenderer}) as needed by your application
	 *
	 * Note: once a renderer is set for a chart it will remain loaded with all its series definitions and y axis (if one used) even if a new symbol is loaded.
	 * Calling setSeriesRenderer again with the same renderer name, will just return the previously created renderer.
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
	 * @returns {CIQ.Renderer} This seriesRenderer
	 * @memberof CIQ.ChartEngine
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
		if(this.chart.seriesRenderers[params.name]) return this.chart.seriesRenderers[params.name]; // renderer already created

		if(params.yAxis){
			params.yAxis=this.addYAxis(this.panels[params.panel], params.yAxis);
		}
		renderer.stx=this;

		this.chart.seriesRenderers[params.name]=renderer;
		return renderer;
	};

	/** Sets a renderer for the main chart.  This is done by parsing the layout.chartType and layout.aggregationType and creating the renderer which will support those settings.
	 * @param {boolean} eraseData Set to true to erase any existing series data
	 * @memberOf  CIQ.ChartEngine
	 * @since 5.1.0
	 */
	CIQ.ChartEngine.prototype.setMainSeriesRenderer=function(eraseData){
		var chartType=this.layout.chartType, aggregationType=this.layout.aggregationType, custom=this.chart.customChart;
		var r=this.mainSeriesRenderer;
		if(r) {
			r.removeAllSeries(eraseData);
			this.removeSeriesRenderer(r);
			r=this.mainSeriesRenderer=null;
		}
		var params={panel:this.chart.panel.name, name:"_main_series", highlightable:false, useChartLegend:true};
		if(custom && custom.chartType) chartType=custom.chartType;
		if(chartType=="none") return;  // no renderer and no default lines renderer
		if(aggregationType && aggregationType!="ohlc") chartType=aggregationType;
		var renderer=CIQ.Renderer.produce(chartType, params);
		if(renderer){
			this.setSeriesRenderer(renderer).attachSeries(null,{display:this.chart.symbol});
			this.mainSeriesRenderer=renderer;
		}
		// Convenience access
		["highLowBars","standaloneBars","barsHaveWidth"].forEach(function(p){
			this.chart[p]=this.mainSeriesRenderer && this.mainSeriesRenderer[p];
		}.bind(this));
	};

	/**
	 * Sets the market definition on the chart.
	 *
	 * Once set, the definition will not change until it is explicitly set to something else by calling this method again.
	 *
	 * A new definition for a chart should only be set once, right before a new instrument is loaded with the {@link CIQ.ChartEngine#newChart} call.
	 * Loading or modifying a market definition after a chart has loaded its data will result in unpredictable results.
	 *
	 * If a dynamic model is desired, where a new definition is loaded as different instruments are activated, see {@link CIQ.ChartEngine#setMarketFactory}.
	 *
	 * See {@link CIQ.Market} for market definition rules and examples.
	 *
	 * This is only required if your chart will need to know the operating hours for the different exchanges.
	 *
	 * If using a 24x7 chart, a market does not need to be set.
	 * @param {object} marketDefinition A market definition as required by {@link CIQ.Market}
	 * @param {CIQ.ChartEngine.Chart} chart An instance of {@link CIQ.ChartEngine.Chart}
	 * @memberof CIQ.ChartEngine
	 * @since 04-2016-08
	 * @example
	 * stxx.setMarket({
	 *   name: 'My_Market',
	 *   market_tz: 'My_Timezone', // Note you must specify the time zone for the market!
	 *   rules: [
	 *     { 'dayofweek': 1, 'open': '08:00', 'close': '14:30' },
	 *     { 'dayofweek': 2, 'open': '08:00', 'close': '14:30' },
	 *     { 'dayofweek': 3, 'open': '08:00', 'close': '14:30' },
	 *     { 'dayofweek': 4, 'open': '08:00', 'close': '14:30' },
	 *     { 'dayofweek': 5, 'open': '08:00', 'close': '14:30' },
	 *   ],
	 * });
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
	 *
	 * Please note that if using the default sample templates, this method is set to use the {@link CIQ.Market.Symbology} functions, which must be reviewed and adjust to comply with your quote feed and symbology format before they can be used.
	 * @param {function} factory A function that takes a symbolObject and returns a market definition. See {@link CIQ.Market} for instruction on how to create a market definition. See {@link CIQ.Market.Symbology.factory} for working example of a factory function.
	 * @memberof CIQ.ChartEngine
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
	 * var stxx=new CIQ.ChartEngine({container:$("#chartContainer")[0], preferences:{labels:false, currentPriceLine:true, whitespace:0}});
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
	 * @memberof CIQ.ChartEngine
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
	 * @return {object} the matching series renderer if found
	 * @memberof CIQ.ChartEngine
	 * @since 07/01/2015
	 */
	CIQ.ChartEngine.prototype.getSeriesRenderer=function(name){
		return this.chart.seriesRenderers[name];
	};




	/**
	 * Initializes boundary clipping on the requested panel. Use this when you are drawing on the canvas and wish for the
	 * drawing to be contained within the panel. You must call {@link CIQ.ChartEngine#endClip} when your drawing functions are complete.
	 * @param  {string} [panelName] The name of the panel. Defaults to the chart itself.
	 * @param {boolean} [allowYAxis=false] If true then the clipping region will include the y-axis. By default the clipping region ends at the y-axis.
	 * @memberof CIQ.ChartEngine
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
		}else if(panel.yaxisLHS && panel.yaxisLHS.length){
			left++;
			width--;
		}
		this.chart.context.rect(left, yAxis.top, width, yAxis.height);
		this.chart.context.clip();
	};

	/**
	 * Completes a bounded clipping operation. See {@link CIQ.ChartEngine#startClip}.
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.endClip=function(){
		this.chart.context.restore();
	};

	/**
	 * Sets the line style for the main chart.  Works for Lines renderer only.
	 * @param  {object} [obj]	Parameter object
	 * @param {string} [obj.color] A color on the canvas palette to use for line plot. Alternatively, obj may be set to the color string directly if no other parameters are needed.  This is ignored for a mountain chart.
	 * @param {array} [obj.pattern] Pattern to use as alternative to solid line for line plot, in array format, e.g. [1,2,3,2] or string format, e.g. "solid", "dashed", "dotted"
	 * @param {number} [obj.width] Width of the line plot
	 * @param  {object} [target=this.chart] Target to attach line style to.  Supported objects are CIQ.ChartEngine.Chart or CIQ.Studies.StudyDescriptor instances
	 * @memberof CIQ.ChartEngine
	 * @since 4.0.0
	 * @example
	 *   stxx.setLineStyle({color:"rgb(127,127,127)",pattern:"dashed",width:3});
	 * @example
	 *   stxx.setLineStyle("blue");
	 */
	CIQ.ChartEngine.prototype.setLineStyle=function(obj, target){
		var res={};
		if(obj && typeof(obj)=="object"){
			res=obj;
		}else{
			res.color=obj;
		}
		if(!res.color && !res.pattern && !res.width) res=null;
		if(!target) target=this.chart;
		var width=1;
		if(res && res.width) width=res.width;
		if(res && res.pattern) res.pattern=CIQ.borderPatternToArray(width, res.pattern);
		target.lineStyle=res;
	};

	/**
	 * Creates a gap filling style object for lines which can be used with any API call requiring a gap object.
	 * The gap object, called `gaplines` will be attached to the `target` passed in, or will set the the primary chart's gap style if to target is provided.
	 *
	 * A gap is an area on a line type rendering ( mountain, baseline, step, etc) where the value for the plotted field is null, undefined, or missing.
	 * @param  {object} [obj]	Parameter object
	 * @param {string} [obj.color] A color on the canvas palette to use for gap plot. Alternatively, obj may be set to the color string directly if no other parameters are needed.
	 * @param {array} [obj.pattern] Pattern to use as alternative to solid line for gap plot, in array format, e.g. [1,2,3,2].
	 * @param {number} [obj.width] Line width for gap plot, in pixels
	 * @param {boolean} [obj.fillMountain] Set to true to fill the gaps in a mountain chart with the gap color.  Otherwise the mountain chart is filled in with its default color.
	 * @param  {object} [target=this.chart] Target to attach `gaplines` object to.  If none provided it defaults to CIQ.ChartEngine.Chart.
	 * @memberof CIQ.ChartEngine
	 * @since 4.0.0
	 * @example
	 * // shorthand if just setting the color for the main chart
	 * stxx.setGapLines("blue");
	 * @example
	 * // the following will set stxx.chart.gaplines
	 * stxx.setGapLines({color:"transparent",pattern:[1,2],width:3,fillMountain:true});
	 * @example
	 * // the following will set objectTarget.gaplines
	 * stxx.setGapLines({color:"transparent",pattern:[1,2],width:3,fillMountain:true,target:objectTarget});
	 *
	 */
	CIQ.ChartEngine.prototype.setGapLines=function(obj, target){
		var res={};
		if(obj && typeof(obj)=="object"){
			res=obj;
		}else{
			res.color=obj;
		}
		if(!res.color && !res.pattern && !res.fillMountain) res=null;
		if(!target) target=this.chart;
		if(res && res.pattern) res.pattern=CIQ.borderPatternToArray(res.pattern);
		if(res && res.width<=0) res.width=null;
		target.gaplines=res;
	};

	/**
	 * Generates a function used to return the color and pattern of a line chart over a gap area.
	 * A gap is an area where the value for the plotted field is null, undefined, or missing.
	 *
	 * See {@link CIQ.ChartEngine#setGapLines}.
	 *
	 * @param  {string} [symbol] Symbol of the series
	 * @param  {string} [field]	Field to plot, usually Close
	 * @param {object} [normal] Normal definition object containing color, pattern and width.  If only color is required, this may be set directly to the color string.
	 * @param {string} [normal.color] A color on the canvas palette to use for normal, non-gap plot
	 * @param {array} [normal.pattern] Pattern to use as alternative to solid line for normal, non-gap plot, in array format, e.g. [1,2,3,2]
	 * @param {number} [normal.width] Line with for normal plot, in pixels
	 * @param {object} [gaps] Gaps definition object containing color, pattern and width.  If only color is required, this may be set directly to the color string. If no gaps should be filled, leave out or set to false.
	 * @param {string} [gaps.color] A color on the canvas palette to use for gap plot
	 * @param {array} [gaps.pattern] Pattern to use as alternative to solid line for gap plot, in array format, e.g. [1,2,3,2]
	 * @param {number} [gaps.width] Line with for gap plot, in pixels
	 * @param {function} [colorFunction] Function to apply to plot to determine colors, for normal, non-gap portion
	 * @return {function} A function for generating color and pattern for the entire chart.
	 * @memberof CIQ.ChartEngine
	 * @private
	 * @since 5.1.0 changed signature, added width support
	 */
	CIQ.ChartEngine.prototype.getGapColorFunction=function(symbol, field, normal, gaps, colorFunction){
		if(typeof(normal)!="object") normal={color:normal};
		return function(stx, quote, isGap){
			var myColor=colorFunction?colorFunction(stx, quote, isGap):normal;
			if(myColor.color) myColor=myColor.color;  // in case the colorFunction returns an object
			var q=quote[symbol];
			if(!q && q!==0) q=quote[field];
			if(!isGap && (q || q===0)){
				return {
					color: myColor,
					pattern: normal.pattern,
					width: normal.width
				};
			}
			if(!gaps) return null; // no color is returned if no gaps are needed.
			if(typeof(gaps)!="object"){
				if(typeof gaps=="string") gaps={color:gaps};
				else gaps={};
			}
			return {
				color: gaps.color || myColor,
				pattern: gaps.pattern || normal.pattern,
				width: gaps.width || normal.width
			};
		};
	};

	/**
	 * Draws a line chart.
	 *
	 * This method should rarely if ever be called directly.  Use {@link CIQ.Renderer.Lines} or {@link CIQ.ChartEngine#setChartType} instead.
	 *
	 * Uses CSS style `stx_line_chart` to control width and color of line charts, unless `params` are set.
	 *
	 * The default color function for the colored line chart uses the following CSS styles:
	 * - `stx_line_up`		- Color of the uptick portion of the line
	 * - `stx_line_down`	- Color of the downtick portion of the line
	 *
	 * @param  {CIQ.ChartEngine.Panel} panel The panel on which to draw the line chart
	 * @param  {string} style	The style selector which contains the styling for the bar (width and color)
	 * @param  {function} [colorFunction]	A function which accepts an CIQ.ChartEngine and quote as its arguments and returns the appropriate color for drawing that mode.
											Returning a null will skip that bar.  If not passed as an argument, will use a default color.
	 * @param  {object} [params]	Listing of parameters to use when plotting the line chart.
	 * @param {boolean} [params.skipTransform] If true then any transformations (such as comparison charting) will not be applied
	 * @param {boolean} [params.label] If true then the y-axis will be marked with the value of the right-hand intercept of the line
	 * @param {boolean} [params.noSlopes] If set then chart will draw horizontal bars with no vertical lines.
	 * @param {boolean} [params.step] If set then chart will resemble a step chart.  Horizontal lines will begin at the center of the bar.
	 * @param {number} [params.tension] Tension for splining. Requires "js/thirdparty/splines.js"
	 * @param {boolean} [params.highlight] If set then line will be twice as wide.
	 * @param {string} [params.color] The color for the line. Defaults to CSS style
	 * @param {string} [params.pattern] The pattern for the line ("solid","dashed","dotted"). Defaults to CSS style
	 * @param {number} [params.width] The width in pixels for the line. Defaults to CSS style
	 * @param {object} [params.gapDisplayStyle] Gap object as set by See {@link CIQ.ChartEngine#setGapLines}. If not set `chart.gaplines` will be used.  Set to false to force gap lines to not be drawn, regardless of chart setting.
	 * @param {boolean} [params.labelDecimalPlaces] Specifies the number of decimal places to print on the label. If not set then it will match the y-axis.
	 * @return {object} Data generated by the plot, such as colors used if a colorFunction was passed, and the vertices of the line (points).
	 * @memberof CIQ.ChartEngine
	 * @since
	 * <br>&bull; 15-07-01 Changed signature from `chart` to `panel`
	 * <br>&bull; 3.0.0 added params argument
	 * <br>&bull; 5.2.0 `params.gaps` has been deprecated and replaced with `params.gapDisplayStyle`
	 * <br>&bull; 6.0.0 `params.gapDisplayStyle` can be set to false to suppress all gap drawing
	 */
	CIQ.ChartEngine.prototype.drawLineChart=function(panel, style, colorFunction, params){
		var chart=this.chart, context=chart.context, lineStyle=chart.lineStyle || {};
		var c=this.canvasStyle(style);
		if(!params) params={};
		this.startClip(panel.name);
		var width=params.width || lineStyle.width || c.width;
		if(width && parseInt(width,10)<=25){
			context.lineWidth=Math.max(1,CIQ.stripPX(width));
		}else{
			context.lineWidth=1;
		}
		params.pattern=params.pattern || lineStyle.pattern || c.borderTopStyle;
		params.pattern=CIQ.borderPatternToArray(context.lineWidth,params.pattern);
		this.canvasColor(style);
		var color=params.color || lineStyle.color;
		if(color) context.strokeStyle=color;
		params.skipProjections=true;
		var field=params.field || chart.defaultPlotField;  // usually the series
		var plotField=params.subField || chart.defaultPlotField || "Close";  // usually the field within the series
		var gaps=params.gapDisplayStyle;
		if(!gaps && gaps!==false) gaps=params.gaps;
		if(!gaps && gaps!==false) gaps=chart.gaplines;
		if(!gaps) gaps="transparent";
		var myColorFunction=this.getGapColorFunction(field, plotField, {color:context.strokeStyle, pattern:params.pattern, width:context.lineWidth}, gaps, colorFunction);
		if(panel.chart.tension) params.tension=panel.chart.tension;
		var rc=this.plotDataSegmentAsLine(field, panel, params, myColorFunction);
		if(!rc.colors.length) rc.colors.push(context.strokeStyle);
		context.lineWidth=1;
		this.endClip();

		return params.returnObject?rc:rc.colors;
	};

	/**
	 * Finds the previous element before dataSegment[bar] in the dataSet which has data for field
	 * @param {CIQ.ChartEngine.Chart} chart An instance of {@link CIQ.ChartEngine.Chart}
	 * @param {string} field The field to check for data
	 * @param {number} bar The index into the dataSegment
	 * @return {object} dataSet element which has data
	 * @memberof CIQ.ChartEngine
	 * @since 4.0.0
	 */
	CIQ.ChartEngine.prototype.getPreviousBar=function(chart, field, bar){
		return this.getNextBarInternal(chart, field, bar, -1);
	};

	/**
	 * Finds the next element after dataSegment[bar] in the dataSet which has data for field
	 * @param {CIQ.ChartEngine.Chart} chart An instance of {@link CIQ.ChartEngine.Chart}
	 * @param {string} field The field to check for data
	 * @param {number} bar The index into the dataSegment
	 * @return {object} dataSet element which has data
	 * @memberof CIQ.ChartEngine
	 * @since 4.0.0
	 */
	CIQ.ChartEngine.prototype.getNextBar=function(chart, field, bar){
		return this.getNextBarInternal(chart, field, bar, 1);
	};

	/**
	 * @param {CIQ.ChartEngine.Chart} chart An instance of {@link CIQ.ChartEngine.Chart}
	 * @param {string} field The field to check for data
	 * @param {number} bar The index into the dataSegment
	 * @param {number} direction 1 or -1, for next or previous
	 * @return {object} dataSet element which has data
	 * @memberof CIQ.ChartEngine
	 * @since 4.0.0
	 * @private
	 */
	CIQ.ChartEngine.prototype.getNextBarInternal=function(chart, field, bar, direction){
		var seg=chart.dataSegment && chart.dataSegment[bar];
		if(seg){
			var tick=seg.tick;
			while(tick>0 && tick<chart.dataSet.length){
				tick=tick+direction;
				var ds=chart.dataSet[tick];
				if(ds){
					var tuple=CIQ.existsInObjectChain(ds,field);
					if(tuple && tuple.obj[tuple.member]) return ds;
				}
			}
		}
		return null;
	};

	/**
	 * Returns the first or last record in a quotes array (e.g. masterData, dataSet) containing the requested field.
	 * If no record is found, will return null
	 * @param  {CIQ.ChartEngine} [stx] Chart engine object
	 * @param  {array} data	  quotes array in which to search
	 * @param  {string} field	  field to search for
	 * @param  {boolean} [last] Switch to reverse direction; default is to find the first record.  Set to true to find the last record.
	 * @return {object} The found record, or null if not found
	 * @memberof CIQ.ChartEngine
	 * @since 5.2.0
	 */
	CIQ.ChartEngine.prototype.getFirstLastDataRecord=function(data, field, last){
		var c=last?data.length-1:0;
		while(c>=0 && c<data.length){
			if(data[c] && typeof data[c][field] != "undefined"){
				return data[c];
			}
			if(last) c--; else c++;
		}
		return null;
	};

	/**
	 * Redraws the floating price label(s) for the crosshairs tool on the y axis using {@link CIQ.ChartEngine#createYAxisLabel} and sets the width of the y crosshair line to match pannel width.
	 *
	 * Label style: `stx-float-price` ( for price colors ) and `stx_crosshair_y` ( for cross hair line )
	 *
	 * @param  {CIQ.ChartEngine.Panel} panel	The panel on which to print the label(s)
	 * @memberof CIQ.ChartEngine
	 * @example
	 * // controls primary default color scheme
	 * .stx-float-price { color:#fff; background-color: yellow;}
	 * @since 5.2.0 decimalPlaces for label determined by distance between ticks as opposed to shadow
	 */

	CIQ.ChartEngine.prototype.updateFloatHRLabel = function (panel) {
		var arr=panel.yaxisLHS.concat(panel.yaxisRHS);
		var cy = this.crossYActualPos ? this.crossYActualPos : this.cy;
		if(this.floatCanvas.isDirty) CIQ.clearCanvas(this.floatCanvas, this);
		if(this.controls.crossX && this.controls.crossX.style.display=="none") return;
		if(this.controls.crossY){
			var crosshairWidth=panel.width;
			if(this.yaxisLabelStyle=="roundRectArrow") crosshairWidth-=7;
			this.controls.crossY.style.left=panel.left + "px";
			this.controls.crossY.style.width=crosshairWidth + "px";
		}
		for(var i=0;i<arr.length;i++){
			var yAxis=arr[i];
			var price=this.transformedPriceFromPixel(cy, panel, yAxis);
			if(isNaN(price)) continue;
			if((yAxis.min || yAxis.min===0) && price<yAxis.min) continue;
			if((yAxis.max || yAxis.max===0) && price>yAxis.max) continue;
			var labelDecimalPlaces=null;
			if(yAxis!==panel.chart.yAxis){ // If a study panel, this logic allows the cursor to print more decimal places than the yaxis default for panels
				labelDecimalPlaces=this.decimalPlacesFromPriceTick(yAxis.priceTick);
				if(yAxis.decimalPlaces || yAxis.decimalPlaces===0) labelDecimalPlaces=yAxis.decimalPlaces;
			}
			if(yAxis.priceFormatter){
				price=yAxis.priceFormatter(this, panel, price, labelDecimalPlaces);
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
	 * It uses {@link CIQ.displayableDate} to format the floating label over the x axis, which can be overwritten as needed to achieve the desired results.
	 *
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias headsUpHR
	 * @since 09-2016-19 only year and month will be displayed in monthly periodicity
	 */
	CIQ.ChartEngine.prototype.headsUpHR=function(){
		if(this.runPrepend("headsUpHR", arguments)) return;
		var panel=this.currentPanel;
		if(!panel) return;
		var chart=panel.chart;

		this.updateFloatHRLabel(panel);
		var floatDate=this.controls.floatDate;
		function setFloatDate(val){
			CIQ.efficientDOMUpdate(floatDate, "innerHTML", val);
		}

		if(floatDate && !chart.xAxis.noDraw){
			var bar=this.barFromPixel(this.cx);
			var prices=chart.xaxis[bar];
			if(prices && prices.DT){
				setFloatDate(CIQ.displayableDate(this,chart,prices.DT));
			}else if(prices && prices.index){
				setFloatDate(prices.index);
			} else {
				setFloatDate("");		// there is no date to display
			}
		}

		this.runAppend("headsUpHR", arguments);
	};

	// TODO, deprecated
	CIQ.ChartEngine.prototype.setCrosshairColors=function(){

	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Calculates the magnet point for the current mouse cursor location. This is the nearest OHLC point. A small white
	 * circle is drawn on the temporary canvas to indicate this location for the end user. If the user initiates a drawing then
	 * the end point of the drawing will be tied to the magnet point.
	 * This function is only used when creating a new drawing if preferences.magnet is true and
	 * a drawing type (CIQ.ChartEngine#currentVectorParameters.vectorType) has been enabled. It will not be used when an existing drawing is being repositioned.
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias magnetize
	 */
	CIQ.ChartEngine.prototype.magnetize=function(){
		this.magnetizedPrice=null;
		if(this.runPrepend("magnetize", arguments)) return;
		if(this.repositioningDrawing) return;  // Don't magnetize
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
			var highLowBars=(this.mainSeriesRenderer && this.mainSeriesRenderer.highLowBars) || this.highLowBars[this.layout.chartType];
			if(highLowBars){
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
			var radius=Math.max(this.layout.candleWidth, 12)/3;
			// Limit the radius size to 8 to prevent a large arc
			// when zooming in and increasing the candle width.
			ctx.arc(x, y, Math.min(radius,8), 0, (2*Math.PI), false);
			ctx.fillStyle="#FFFFFF";
			ctx.strokeStyle="#000000";
			ctx.fill();
			ctx.stroke();
			ctx.closePath();
			this.chart.tempCanvas.style.display="block";
		}
		this.runAppend("magnetize", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Positions the crosshairs at the last known mouse/finger pointer position. This ensures
	 * on touch devices that the crosshairs are at a known position. It is called by the DrawingToolbar.
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias positionCrosshairsAtPointer
	 */
	CIQ.ChartEngine.prototype.positionCrosshairsAtPointer=function(){
		var currentPanel=this.currentPanel;
		if(!currentPanel) return;
		if(!this.manageTouchAndMouse) return;
		if(this.runPrepend("positionCrosshairsAtPointer", arguments)) return;
		var chart=currentPanel.chart;
		var rect=this.container.getBoundingClientRect();
		this.top=rect.top;
		this.left=rect.left;
		this.right=this.left+this.width;
		this.bottom=this.top+this.height;
		this.cy=this.crossYActualPos=this.backOutY(CIQ.ChartEngine.crosshairY);
		this.cx=this.backOutX(CIQ.ChartEngine.crosshairX);
		var crosshairTick=this.crosshairTick=this.tickFromPixel(this.cx, chart);
		var position=(this.pixelFromTick(crosshairTick, chart)-1);
		if(this.controls.crossX) this.controls.crossX.style.left=position + "px";
		if(position>=currentPanel.right || position<=currentPanel.left){
			this.undisplayCrosshairs();
			return;
		}
		var chField = currentPanel.name == "chart" ? this.preferences.horizontalCrosshairField : currentPanel.horizontalCrosshairField;
		var dataSet=chart.dataSet;
		if (chField && dataSet && crosshairTick < dataSet.length && crosshairTick > -1) {
			this.crossYActualPos = this.pixelFromPrice(dataSet[crosshairTick][chField], currentPanel);
		}
		if(this.controls.crossY) this.controls.crossY.style.top=this.crossYActualPos + "px";
		this.runAppend("positionCrosshairsAtPointer", arguments);
	};
	/**
	 * <span class="injection">INJECTABLE</span>
	 *
	 * This is an internal method that makes the crosshair visible based on where the user's mouse pointer is located. It should not be called directly.
	 *
	 * - Crosshairs will only be made visible if enabled, unless a drawing tool is active;
	 * in which case they will be displayed automatically regardless of state.
	 * - When the user moves the mouse out of the chart, or over a modal, the crosshairs are automatically made invisible using {@link CIQ.ChartEngine.AdvancedInjectable#undisplayCrosshairs}
	 * - To temporarily hide/show an enabled crosshair for other reasons use {@link CIQ.ChartEngine#showCrosshairs} and {@link CIQ.ChartEngine#hideCrosshairs}
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias doDisplayCrosshairs
	 * @since 5.0.0 no longer allows the crosshair to be enabled if mouse pointer is outside the chart.
	 */
	CIQ.ChartEngine.prototype.doDisplayCrosshairs=function(){
		if(this.runPrepend("doDisplayCrosshairs", arguments)) return;
		if(this.displayInitialized){
			var floatCanvas=this.floatCanvas;
			var drawingTool=this.currentVectorParameters.vectorType;
			if(!this.layout.crosshair && (drawingTool==="" || !drawingTool)){
				this.undisplayCrosshairs();
			}else if(CIQ.Drawing && CIQ.Drawing[drawingTool] && (new CIQ.Drawing[drawingTool]()).dragToDraw){
				this.undisplayCrosshairs();
			}else if(this.overXAxis || this.overYAxis || (!CIQ.ChartEngine.insideChart && !this.grabbingScreen)){
				this.undisplayCrosshairs();
			}else if(this.openDialog!==""){
				this.undisplayCrosshairs();
			}else{
				var controls=this.controls, crossX=controls.crossX, crossY=controls.crossY;
				if(crossX && crossX.style.display!==""){
					crossX.style.display="";
					if(crossY) crossY.style.display="";
					if(this.preferences.magnet && drawingTool){
						CIQ.unappendClassName(this.container, "stx-crosshair-on");
						this.chart.tempCanvas.style.display="block";
					}else{
						CIQ.appendClassName(this.container, "stx-crosshair-on");
					}
				}
				if(controls.floatDate && !this.chart.xAxis.noDraw){
					controls.floatDate.style.visibility="";
					if(this.currentPanel) this.updateFloatHRLabel(this.currentPanel);
				}
				if(floatCanvas){
					floatCanvas.style.display="block";
				}
			}
		}
		this.runAppend("doDisplayCrosshairs", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 *
	 * This is an internal method that makes the crosshairs invisible when the user mouses out of the chart or over a chart control.
	 * It should not be called drectly.
	 *
	 * See {@link CIQ.ChartEngine.AdvancedInjectable#doDisplayCrosshairs} for more details.
	 *
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias undisplayCrosshairs
	 */
	CIQ.ChartEngine.prototype.undisplayCrosshairs=function(){
		if(this.runPrepend("undisplayCrosshairs", arguments)) return;
		var controls=this.controls, crossX=controls.crossX, crossY=controls.crossY;
		if(crossX){
			if(crossX.style.display!="none"){
				crossX.style.display="none";
				if(crossY) crossY.style.display="none";
			}
		}
		if(this.displayInitialized && controls.floatDate){
			controls.floatDate.style.visibility="hidden";
		}
		CIQ.unappendClassName(this.container, "stx-crosshair-on");
		var floatCanvas=this.floatCanvas;
		if(floatCanvas && floatCanvas.isDirty){
			CIQ.clearCanvas(floatCanvas, this);
			if(floatCanvas.style.display!="none") floatCanvas.style.display="none";
		}
		if(!this.activeDrawing && !this.repositioningDrawing && !this.editingAnnotation){
			var tempCanvas=this.chart.tempCanvas;
			if(tempCanvas && tempCanvas.style.display!="none") tempCanvas.style.display="none";
		}
		this.runAppend("undisplayCrosshairs", arguments);
	};

	/**
	 * Sets the chart into a modal mode. Crosshairs are hidden and the chart will not respond to click or mouse events. Call this
	 * for instance if you are enabling a dialog box and don't want errant mouse activity to affect the chart.
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.modalBegin=function(){
		this.openDialog="modal";
		this.undisplayCrosshairs();
	};

	/**
	 * Ends modal mode. See {@link CIQ.ChartEngine#modalBegin}
	 * @memberof CIQ.ChartEngine
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
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
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
				var halfLabelWidth=(floatDate.offsetWidth/2)-0.5;
				var l=(this.pixelFromTick(this.crosshairTick, chart)-halfLabelWidth);
				if(l<0) l=0;
				else if(l>this.width-2*halfLabelWidth-1) l=this.width-2*halfLabelWidth-1;
				CIQ.efficientDOMUpdate(floatDate.style, "left", l+"px");
				CIQ.efficientDOMUpdate(floatDate.style, "bottom",bottom + "px");
			}
		}
		this.headsUpHR();
		this.runAppend("updateChartAccessories", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Handles mouse movement events. This method calls {@link CIQ.ChartEngine#mousemoveinner} which has the core logic
	 * for dealing with panning and zooming. See also {@link CIQ.ChartEngine.AdvancedInjectable#touchmove} which is the equivalent method for touch events.
	 * @param {Event} mouseEvent A mouse move event
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias mousemove
	 */
	CIQ.ChartEngine.prototype.mousemove=function(mouseEvent){
		var e= mouseEvent ? mouseEvent : event;
		/* use e.client instead of e.page since we need the value to be relative to the viewport instead of the overall document size.
		if(!e.pageX){
			e.pageX=e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			e.pageY=e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}
		*/
		CIQ.ChartEngine.crosshairX=e.clientX;	// These are used by the UI so make sure they are set even if no chart is set
		CIQ.ChartEngine.crosshairY=e.clientY;
		if(e.type.toLowerCase().indexOf("enter")>-1) {
			this.positionCrosshairsAtPointer();
			return;
		}
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
	 * @memberof CIQ.ChartEngine
	 */

	CIQ.ChartEngine.prototype.setResizeTimer=function(ms){
		this.resizeDetectMS=ms;
		function closure(self){
			return function(){
				if(!self.chart.canvas) return;
				if(!CIQ.isAndroid){
					if(self.chart.canvas.height!=Math.floor(self.devicePixelRatio*self.chart.container.clientHeight) || self.chart.canvas.width!=Math.floor(self.devicePixelRatio*self.chart.container.clientWidth)){
						self.resizeChart();

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
	 * @param  {number} [x]		The X location. Defaults to CIQ.ChartEngine#cx
	 * @return {CIQ.ChartEngine.YAxis}		  The yAxis that the crosshair is over
	 * @memberOf  CIQ.ChartEngine
	 * @since  15-07-01
	 * @since 6.1.0 returns null when no yAxis found
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
		return null;
	};

	/**
	 * Finds any objects that should be highlighted by the current crosshair position. All drawing objects have their highlight() method
	 * called in order that they may draw themselves appropriately.
	 * @param  {boolean} isTap If true then it indicates that the user tapped the screen on a touch device, and thus a wider radius is used to determine which objects might have been highlighted.
	 * @param {boolean} clearOnly Set to true to clear highlights
	 * @memberof CIQ.ChartEngine
	 * @since 4.0.0 {@link CIQ.ChartEngine#displaySticky} is now called to display the 'series.symbol' if the 'series.display' is not present
	 */
	CIQ.ChartEngine.prototype.findHighlights=function(isTap, clearOnly){
		var radius=this.preferences[isTap?"highlightsTapRadius":"highlightsRadius"]; // 30:10
		this.highlightViaTap=isTap;  // internal use state var
		var cy=this.cy;
		var cx=this.cx;
		this.anyHighlighted=false;
		if(!this.currentPanel) return;
		if(this.preferences.magnet && !this.activeDrawing && !this.repositioningDrawing){
			CIQ.clearCanvas(this.chart.tempCanvas, this);
		}
		if(this.activeDrawing) clearOnly=true;
		var somethingChanged=false;
		var drawingToMeasure=null;
		var stickyArgs=clearOnly?{}:{forceShow:true, type:"drawing"};

		var chart=this.currentPanel.chart;
		var box={
				x0:this.tickFromPixel(cx - radius, chart),
				x1:this.tickFromPixel(cx + radius, chart),
				y0:this.valueFromPixel(cy - radius, this.currentPanel),
				y1:this.valueFromPixel(cy + radius, this.currentPanel),
				r:radius
		};
		if(this.repositioningDrawing && box.x1-box.x0<2){
			box.x1++;
			box.x0--;
		}else if(box.x1==box.x0){
			box.x0-=0.5;
			box.x1+=0.5;
		}
		/* begin test code
		// show the box
		this.chart.canvas.context.strokeStyle="red";
		this.chart.canvas.context.strokeRect(this.pixelFromTick(box.x0,chart),cy-radius,this.pixelFromTick(box.x1,chart)-this.pixelFromTick(box.x0,chart),2*radius);
		this.chart.canvas.context.strokeStyle="blue";
		this.chart.canvas.context.strokeRect(cx-radius,cy-radius,2*radius,2*radius);
		  end test code */

		if (!chart.hideDrawings) {
			for(var i=this.drawingObjects.length-1;i>=0;i--){
				var drawing=this.drawingObjects[i];
				if(!this.panels[drawing.panelName]) continue;
				if(this.repositioningDrawing && this.repositioningDrawing!=drawing) continue;

				var prevHighlight=drawing.highlighted;
				var highlightMe=(drawing.panelName==this.currentPanel.name);
				drawing.repositioner=drawing.intersected(this.crosshairTick, this.crosshairValue, box);
				highlightMe=highlightMe && drawing.repositioner;

				if(!clearOnly && highlightMe){
					if(prevHighlight){
						drawingToMeasure=drawing;
						if(this.anyHighlighted && this.singleDrawingHighlight) drawing.highlighted=false;
					}else if(prevHighlight!=drawing.highlight(true)){
						if(!drawingToMeasure) drawingToMeasure=drawing;
						if(this.anyHighlighted && this.singleDrawingHighlight) drawing.highlighted=false;
						somethingChanged=true;
					}
					this.anyHighlighted=true;
				}else{
					if(prevHighlight!=drawing.highlight(false)){
						somethingChanged=true;
					}
				}
				if(drawing.highlighted) stickyArgs.noDelete=drawing.permanent;
			}
		}

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

		// Function to detect if a "box" drawn around the cursor position is intersected by the overlay.
		// Up to two overlay segments may be tested:
		// The segment endpointed by the previous dataSet element containing that field and the current dataSet element behind the cursor,
		// and the current dataSet element behind the cursor and the next dataSet element containing that field.
		// In case there are gaps in the data, one of these segments may not exist.
		// This routine is designed to also handle comparison overlays which cause the dataSet to be transformed.
		// The argument "fullField" represents the series symbol and the subField, separated by a period (e.g. GOOG.High).
		// If there is no subField, a subField of Close is presumed.
		function isOverlayIntersecting(refBar, box, fullField, yAxis, cache){
			var chart=this.chart, currentPanel=this.currentPanel;
			if(!yAxis) yAxis=currentPanel.yAxis;
			var parts=fullField.split("-->");
			var field=parts[0];
			var subField=parts[1];
			if(!subField) subField="Close";
			function getVal(quote){
				if(!quote) return null;
				var theVal=quote[field];
				if(theVal && (theVal[subField] || theVal[subField]===0)){  // TODO: allow OHLC range, right now need to hover over imaginary line connecting closes
					theVal=theVal[subField];
				}
				if(!chart.transformFunc || yAxis!=chart.yAxis) return theVal;
				else if(quote.transform && (field in quote.transform)) {
					theVal=quote.transform[field];
					if(theVal && (theVal[subField] || theVal[subField]===0)){  // TODO: allow OHLC range, right now need to hover over imaginary line connecting closes
						theVal=theVal[subField];
					}
					return theVal;
				}
				return chart.transformFunc(this,chart,theVal);
			}
			var quote=chart.dataSegment[bar], quotePrev, quoteNext;
			var val, valPrev, valNext, tick=null, tickPrev=null, tickNext=null;
			var usedCache=new Array(3);
			if(quote && cache){
				val=cache[bar];
				tick=quote.tick;
				if(val || val===0) usedCache[0]=1;
				var ci;
				for(ci=bar-1; ci>=0;ci--){
					if(cache[ci] || cache[ci]===0) {
						valPrev=cache[ci];
						tickPrev=tick-(bar-ci);
						usedCache[1]=1;
						break;
					}
				}
				for(ci=bar+1; ci<chart.dataSegment.length;ci++){
					if(cache[ci] || cache[ci]===0) {
						valNext=cache[ci];
						tickNext=tick-(bar-ci);
						usedCache[2]=1;
						break;
					}
				}
			}
			if(tickPrev===null) {
				quotePrev=this.getPreviousBar.call(this, chart, fullField, bar);
				if(quotePrev) {
					tickPrev=quotePrev.tick;
					valPrev=getVal(quotePrev);
				}
			}
			if(tickNext===null) {
				quoteNext=this.getNextBar.call(this, chart, fullField, bar);  // Terry, getNextBar is failing when opening debugger. Not sure why.
				if(quoteNext) {
					tickNext=quoteNext.tick;
					valNext=getVal(quoteNext);
				}
			}
			if(tickPrev===null && tickNext===null) return false;

			if(!cache){
				val=getVal(quote);
				valPrev=getVal(quotePrev);
				valNext=getVal(quoteNext);
				tick=quote.tick;
				if(quotePrev) tickPrev=quotePrev.tick;
				if(quoteNext) tickNext=quoteNext.tick;
			}

			if(!valPrev && valPrev!==0){
				valPrev=0;
				tickPrev=0;
			}
			if(!valNext && valNext!==0){
				if((val || val===0)){
					valNext=val;
					usedCache[2]=usedCache[0];
				}else{
					valNext=valPrev;
					usedCache[2]=usedCache[1];
				}
				tickNext=chart.dataSet.length-1;
			}
			if(!val && val!==0){
				val=valNext;
				tick=tickNext;
				usedCache[0]=usedCache[2];
				if(valPrev===0 && tickPrev===0){
					valPrev=val;
					tickPrev=tick;
					usedCache[1]=usedCache[0];
				}
			}

			// The following code will get the pixel value of the price from either the renderer's series cache or the computation.
			// Then it will convert the pixel value back to the price value for the current panel's axis.
			// Using the cache is the only way to go for an overlay.  There is a shortcoming for the overlay though, in that
			// if valPrev or valNext were off the screen, they wouldn't be in the cache and so their y axis value would be inaccurate.

			var pftv=this.pixelFromTransformedValue.bind(this), vfp=this.valueFromPixel.bind(this);
			val=vfp(usedCache[0]?val:pftv(val,currentPanel,yAxis),currentPanel);
			valPrev=vfp(usedCache[1]?valPrev:pftv(valPrev,currentPanel,yAxis),currentPanel);
			valNext=vfp(usedCache[2]?valNext:pftv(valNext,currentPanel,yAxis),currentPanel);

			var pixelBox=CIQ.convertBoxToPixels(this,currentPanel.name,box);
			var pixelPoint1=CIQ.convertBoxToPixels(this,currentPanel.name,{x0:tickPrev, y0:valPrev, x1:tick, y1:val});
			var pixelPoint2=CIQ.convertBoxToPixels(this,currentPanel.name,{x0:tick, y0:val, x1:tickNext, y1:valNext});
			if(CIQ.boxIntersects(pixelBox.x0, pixelBox.y0, pixelBox.x1, pixelBox.y1, pixelPoint1.x0, pixelPoint1.y0, pixelPoint1.x1, pixelPoint1.y1, "segment") ||
			   CIQ.boxIntersects(pixelBox.x0, pixelBox.y0, pixelBox.x1, pixelBox.y1, pixelPoint2.x0, pixelPoint2.y0, pixelPoint2.x1, pixelPoint2.y1, "segment")) {
				return true;
			}
			return false;
		}

		if(!clearOnly){
			var bar=this.barFromPixel(cx);
			if(bar>=0 && bar<chart.dataSegment.length){
				var y;
				for(n in this.overlays){
					o=this.overlays[n];
					if(o.panel!=this.currentPanel.name) continue;

					//custom highlight detection
					if(o.study.isHighlighted===false) continue;
					else if(typeof o.study.isHighlighted=="function"){
						if(o.study.isHighlighted(this,cx,cy)){
							o.highlight=true;
							this.anyHighlighted=true;
						}
						continue;
					}

					var quote=chart.dataSegment[bar];
					if(!quote) continue;

					for(var out in o.outputMap){
						if(!o.outputMap[out]) continue;
						if(isOverlayIntersecting.call(this, bar, box, out, this.getYAxisByName(o.panel, o.name))){
							o.highlight=true;
							this.anyHighlighted=true;
							break;
						}
					}
					if(o.highlight) break; // only allow one overlay to be highlighted at a time
				}
				for(n in chart.seriesRenderers){
					var renderer=chart.seriesRenderers[n];
					var rendererPanel=renderer.params.panel;
					if(!renderer.params.highlightable) continue;
					if(rendererPanel!=this.currentPanel.name) continue;
					for(var m=0;m<renderer.seriesParams.length;m++){
						series=renderer.seriesParams[m];
						var fullField=series.field;
						if(series.symbol && series.subField) fullField+="-->"+series.subField;
						var yAxis=renderer.params.yAxis;
						if(!yAxis && rendererPanel) yAxis=this.panels[rendererPanel].yAxis;
						if(renderer.params.step && bar>0){
							// In a step series we also need to check for intersection with
							// the vertical bar (the step) that connects two points
							if(!renderer.caches[series.id]) continue;
							y=renderer.caches[series.id][bar];
							if(!y && y!==0) continue;
							var py=renderer.caches[series.id][bar-1];
							if((py || py===0) && (cy+radius>=y && cy-radius<=py) || (cy-radius<=y && cy+radius>=py)){
								series.highlight=true;
								this.anyHighlighted=true;
							}
						}else if(isOverlayIntersecting.call(this, bar, box, fullField, yAxis, renderer.caches[series.id])){
							series.highlight=true;
							this.anyHighlighted=true;
						}
					}
				}
			}
		}
		for(n in this.overlays){
			o=this.overlays[n];
			if(o.highlight) {
				this.anyHighlighted=true;
				var display = o.inputs.display || o.name;
				display = this.translateIf(display);
				stickyArgs={message:display, noDelete:o.permanent, type:"study"};
				drawingToMeasure=null;
			}
			if(o.prev!=o.highlight) somethingChanged=true;
		}
		for(n in chart.seriesRenderers){
			var r2=chart.seriesRenderers[n];
			if(!r2.params.highlightable) continue;  //might not be necessary to check this here
			var bColor=r2.params.yAxis?r2.params.yAxis.textStyle:null;
			for(var m2=0;m2<r2.seriesParams.length;m2++){
				series=r2.seriesParams[m2];
				if(series.highlight) {
					this.anyHighlighted=true;
					stickyArgs={message: series.display||series.symbol, backgroundColor: series.color||bColor, noDelete: series.permanent, type: "series"};
					drawingToMeasure=null;
				}
				if(series.prev!=series.highlight) somethingChanged=true;
			}
		}

		if(somethingChanged){
			this.draw();
			this.displaySticky(this.anyHighlighted?stickyArgs:{});
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
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.positionSticky=function(m){
		var top=Math.max(this.cy-m.offsetHeight-60,0);
		var right=Math.min(this.chart.canvasWidth-(this.cx-50),this.chart.canvasWidth-m.offsetWidth);
		m.style.top=top+"px";
		m.style.right=right+"px";
	};

	/**
	 * Displays the "sticky" (tooltip element). The sticky should be in `CIQ.ChartEngine.controls.mSticky`. To disable stickies, set that element to null. See {@link CIQ.ChartEngine.htmlControls}
	 * @param  {object} params			optional arguments to pass into function
	 * @param  {string} [params.message]			The message to display in the sticky
	 * @param  {string} [params.backgroundColor] The background color to set the sticky (the foreground color will be picked automatically)
	 * @param  {boolean} [params.forceShow] If true, will always show the sticky (as opposed to only on hover)
	 * @param  {boolean} [params.noDelete] If true, will hide the delete instructions/button
	 * @param  {string} [params.type]		 "study","drawing","series", or whatever is causing the sticky to be displayed.
	 * @memberof CIQ.ChartEngine
	 * @since 6.0.0 consolidated arguments into a params object
	 */

	CIQ.ChartEngine.prototype.displaySticky=function(params){
		var m=this.controls.mSticky;
		if(!m) return;
		var mi=$$$(".mStickyInterior", m);
		if(!mi) return;
		var overlayTrashCan=$$$(".overlayTrashCan", m);
		var overlayEdit=$$$(".overlayEdit", m);
		var mouseDeleteInstructions=$$$(".mouseDeleteInstructions", m);
		// backwards compatibility:
		if(!params || typeof(params)!="object") params={
			message: arguments[0],
			backgroundColor: arguments[1],
			forceShow: arguments[2],
			noDelete: arguments[3],
			type: arguments[4]
		};
		var message=params.message, backgroundColor=params.backgroundColor, forceShow=params.forceShow, noDelete=params.noDelete, type=params.type;
		if(!forceShow && !message){
			mi.innerHTML="";
			m.style.display="none";
			if(overlayTrashCan) overlayTrashCan.style.display="none";
			if(overlayEdit) overlayEdit.style.display="none";
			if(mouseDeleteInstructions) mouseDeleteInstructions.style.display="none";
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
			var rtClick=$$$(".mStickyRightClick", m);
			rtClick.className="mStickyRightClick";  //reset
			if(type) CIQ.appendClassName(rtClick,"rightclick_"+type);
			rtClick.style.display="";
			m.style.display="inline-block";
			this.positionSticky(m);
			if(noDelete || this.bypassRightClick===true || this.bypassRightClick[type]){
				rtClick.style.display="none";
			}else if(this.highlightViaTap || this.touches.length){
				if(overlayTrashCan) overlayTrashCan.style.display="inline-block";
				if(overlayEdit) overlayEdit.style.display="inline-block";
				if(mouseDeleteInstructions) mouseDeleteInstructions.style.display="none";
				CIQ[(message===""?"":"un")+"appendClassName"](m, "hide");
			}else{
				if(mouseDeleteInstructions) mouseDeleteInstructions.style.display="block";
			}
		}
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Sets the innerHTML value of the `.mMeasure` HTML DOM Node to contain a measurement (price differential and bars/line distance), usually when a user hovers over a drawing.
	 * It is also used to display measurement as a drawing is being created or when using the 'Measure' tool.
	 *
	 * It also sets `this.controls.mSticky` with the measurement and displays it on `mSticky` on hover.
	 *
	 * Example: <B>23.83 (-12%) 11 Bars</B>
	 *
	 * It requires the UI to include the following div: ```<div class="currentMeasure"><span class="mMeasure"></span></div>```
	 *
	 * It can be styled via CSS. See example.
	 *
	 * @param {number} price1 Beginning price of the drawing
	 * @param {number|boolean} price2 Ending price of the drawing, pass <code>false</code> if you want to skip price and percentage display
	 * @param {number} tick1  Beginning tick of the drawing
	 * @param {number|boolean} tick2  Ending tick of the drawing, pass <code>false</code> if you want to skip tick count display
	 * @param {boolean} hover  True to turn on the measurement, false to turn it off
	 * @param {string} [name]  Name of drawing, not used by default but passed into injection
	 * @memberof CIQ.ChartEngine
	 * @since
	 * <br>&bull; 4.0.0 added name argument
	 * <br>&bull; 6.0.0 allow price2 and tick2 to be false, skipping the respective display
	 * @example
	 * // Measuring tool styling CSS sample
		.currentMeasure {
			text-align: left;
			display: inline-block;
			margin: 4px 0 0 20px;
			height: 20px;
			line-height: 20px;
		}

		.mMeasure {
			display: inline-block;
			margin: 0 0 0 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			width:140px;
		}
		@example
		// This is an example of the framework to use for writing a prepend to further manipulate/display the measurements
		CIQ.ChartEngine.prototype.prepend("setMeasure",function(){

			var m=$$$(".mMeasure");

			if(!m) return; // cant show a measurement if the div is not present.

		 	// add your logic to manage the display of the measurements (price1, price2, tick1, tick2)
		 	//*****************************************
		 	var message = 'blah measurement';
		 	//*****************************************

			m.innerHTML=message;

			if(this.activeDrawing) return;		// Don't show measurement Sticky when in the process of drawing

			m=this.controls.mSticky;
			if (m) {
				var mStickyInterior=m.children[0];
				if(hover){
					m.style.display="inline-block";
					mStickyInterior.style.display="inline-block";
					if(price1){
						mStickyInterior.innerHTML=message;
					}
					this.positionSticky(m);
				}else{
					m.style.display="none";
					mStickyInterior.innerHTML="";
				}
			}

		 //return true; //if you don't want to continue into the regular function
		 //return false; //if you want to run through the standard function once you are done with your custom code.
		});
	 */
	CIQ.ChartEngine.prototype.setMeasure=function(price1, price2, tick1, tick2, hover){
		if(this.runPrepend("setMeasure", arguments)) return;
		var m=$$$('.mMeasure', this.chart.drawingContainer);
		var message="";
		if(!price1){
			if(!this.anyHighlighted && this.currentVectorParameters.vectorType==="") this.clearMeasure();
		}else{
			if (price2 !== false) {
				var distance=Math.round(Math.abs(price1-price2)*this.chart.roundit)/this.chart.roundit;
				distance = distance.toFixed(this.chart.yAxis.printDecimalPlaces);
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
				message+=" (" + pct + ")";
			}
			if (tick2 !== false) {
				var ticks=Math.abs(tick2-tick1);
				ticks=Math.round(ticks)+1;
				var barsStr=this.translateIf("Bars");
				message+=" " + ticks + " " + barsStr;
			}

			if(m) m.innerHTML=message;
		}

		if(this.activeDrawing) return;		// Don't show measurement Sticky when in the process of drawing
		m=this.controls.mSticky;
		if (m) {
			var mStickyInterior=m.children[0];
			if(hover){
				m.style.display="inline-block";
				mStickyInterior.style.display="inline-block";
				if(price1){
					mStickyInterior.innerHTML=message;
				}
				CIQ[(message===""?"":"un")+"appendClassName"](m, "hide");
				this.positionSticky(m);
			}else{
				m.style.display="none";
				mStickyInterior.innerHTML="";
			}
		}
		this.runAppend("setMeasure", arguments);
	};

	/**
	 * Clears the innerHTML value of the `.mMeasure` HTML DOM Node.
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.clearMeasure=function(){
		var m=$$$('.mMeasure', this.chart.drawingContainer);
		if(m) m.innerHTML="";
	};

	/**
	 * Returns the X pixel give the location of a bar (dataSegment) on the chart.
	 * @param  {number} bar The bar (position on the chart which is also the position in the dataSegment)
	 * @param {CIQ.ChartEngine.Chart} [chart] Which chart to use. Defaults to this.chart.
	 * @return {number}		The X pixel on the chart
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.pixelFromBar=function(bar, chart){
		if(!chart) chart=this.chart;
		var x=0, segmentImage=this.chart.segmentImage;
		if(segmentImage && segmentImage[bar] && segmentImage[bar].leftOffset){
			x=segmentImage[bar].leftOffset;
		}else{
			x=(bar+0.5)*this.layout.candleWidth;
		}
		x=chart.panel.left+Math.floor(x+this.micropixels)-1;
		return x;
	};

	/**
	 * Returns the position (array index) of the first **dataSegment** element encountered given the X pixel.
	 * Do not reference this into dataSegment without checking bounds, because the return value may be negative or greater than the dataSegment array length.
	 *
	 * See {@link CIQ.ChartEngine#tickFromPixel} if you wish to locate the dataSet position.
	 *
	 * @param  {number} x An X pixel location on the chart
	 * @param {CIQ.ChartEngine.Chart} [chart] Which chart to use. Defaults to this.chart.
	 * @return {number}	  The bar that lies on the X pixel (may be negative/before or after the chart)
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.barFromPixel=function(x, chart){
		if(!chart) chart=this.chart;
		var segmentImage=this.chart.segmentImage, mp=this.micropixels, cw=this.layout.candleWidth;
		if(segmentImage){
			//binary search
			var pixel=x-chart.panel.left-mp, mult=2, quote;
			var length=segmentImage.length;
			var bar=Math.round(length/mult);
			var leftOffset,halfCandleWidth;
			var rightofLastTick=segmentImage[length-1].leftOffset+segmentImage[length-1].candleWidth/2;
			if(pixel>rightofLastTick){
				//beyond the rightmost tick
				return length + Math.floor((x-rightofLastTick-chart.panel.left-mp)/cw);
			}
			for(var i=1;i<length;i++){
				mult*=2;
				quote=segmentImage[bar];
				if(!quote) break;
				leftOffset=quote.leftOffset;
				halfCandleWidth=quote.candleWidth/2;
				var left=leftOffset-halfCandleWidth;
				var right=leftOffset+halfCandleWidth;
				if(bar===0 || (pixel>=left && pixel<right)) break;
				else if(pixel<left) bar-=Math.max(1,Math.round(length/mult));
				else bar+=Math.max(1,Math.round(length/mult));
				bar=Math.max(0,Math.min(length-1,bar));
			}
			if(!segmentImage[bar]){
				//sucks, we need to iterate through
				for(i=0;i<length;i++){
					quote=segmentImage[i];
					if(!quote) continue;
					leftOffset=quote.leftOffset;
					halfCandleWidth=quote.candleWidth/2;
					if(pixel<leftOffset-halfCandleWidth)
						return Math.max(0,i-1);
					else if(pixel<leftOffset+halfCandleWidth)
						return i;
					else if(pixel>=leftOffset+halfCandleWidth)
						return i+1;
				}
			}

			return bar;
		}
		return Math.floor((x-chart.panel.left-mp)/cw);

	};

	/**
	 * Returns the position (array index) of the first **dataSet** element encountered given the X pixel.
	 *
	 * See {@link CIQ.ChartEngine#barFromPixel} if you wish to locate the dataSegment position.
	 *
	 * @param  {number} x	  X pixel location
	 * @param  {CIQ.ChartEngine.Chart} [chart] A chart object
	 * @return {number}		  The tick (position in the dataSet)
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.tickFromPixel=function(x, chart){
		if(!chart) chart=this.chart;
		var tick=chart.dataSet.length-chart.scroll;

		if(chart.segmentImage){
			tick+=this.barFromPixel(x,chart);
		}else{
			tick+=Math.floor((x-chart.panel.left-this.micropixels)/this.layout.candleWidth);
		}
		return tick;
	};

	/**
	 * Returns an X pixel for the given tick. The X pixel will be the center of the tick location.
	 * Note that the pixel may be off of the visual canvas and that it might overlap the Y axis.
	 * @param  {number} tick  The tick (position in the dataSet array)
	 * @param  {CIQ.ChartEngine.Chart} [chart] A chart object
	 * @return {number}		  The X position in pixels (may be negative or may be greater than dataSet.length)
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.pixelFromTick=function(tick, chart){
		if(!chart) chart=this.chart;
		var dataSegment=chart.dataSegment, dataSet=chart.dataSet, segmentImage=chart.segmentImage, mp=this.micropixels, length=dataSegment?dataSegment.length:0;
		var panel=chart.panel, scroll=chart.scroll;
		var bar=tick-dataSet.length+scroll, quote=length?dataSegment[bar]:null;

		if(segmentImage) quote=segmentImage[bar];
		if(quote && quote.leftOffset){
			return panel.left+Math.floor(quote.leftOffset+mp); //in here for volume candle
		}
		//in here for other chart types, or volume candle if bar lies outside of the actual quote data
		var rightOffset=0, dsTicks=0;
		quote=length?dataSegment[length-1]:null;
		if(segmentImage) quote=segmentImage[length-1];
		if(quote && quote.leftOffset){
			//volume candle
			if(length<tick-dataSet.length+scroll){
				//in the "whitespace" area on the right of the chart
				rightOffset=quote.leftOffset-quote.candleWidth/2;
				dsTicks=length;
			}
		}
		return rightOffset + panel.left+Math.floor((tick-dsTicks-dataSet.length+scroll+0.5)*this.layout.candleWidth+mp);

	};

	/**
	 * Returns the X pixel position for a tick of a given date.
	 *
	 * The date does not need to match exactly. If the date lies between ticks then the earlier will be returned.
	 *
	 * **Warning: this can be an expensive operation if the date is not in the dataSet.**
	 *
	 * @param  {string} date  String form date
	 * @param  {CIQ.ChartEngine.Chart} chart The chart to look in
	 * @param  {number} [adj] Timezone adjustment in minutes to apply to date before getting tick
	 * @param  {boolean} [forward] Switch to return the next tick as opposed to the previous, in case an exact match is not found
	 * @return {number}		  The pixel location for the date
	 * @todo  Use Date object instead of string form date
	 * @memberof CIQ.ChartEngine
	 * @since added adj and forward arguments
	 */
	CIQ.ChartEngine.prototype.pixelFromDate=function(date, chart, adj, forward){
		return this.pixelFromTick(this.tickFromDate(date, chart, adj, forward), chart);
	};

	/**
	 * A version of {@link CIQ.ChartEngine#priceFromPixel} that will return the y-axis value given a Y pixel
	 * @param  {number} y	  The Y pixel location
	 * @param  {CIQ.ChartEngine.Panel} [panel] The panel (defaults to the chart)
	 * @param {CIQ.ChartEngine.YAxis} [yAxis] The yAxis to use
	 * @return {number}		  The Y axis value
	 * @memberof CIQ.ChartEngine
	 * @since 4.0.0
	 */
	CIQ.ChartEngine.prototype.transformedPriceFromPixel=function(y, panel, yAxis){
		if(!panel) panel=this.chart.panel;
		var yax=yAxis?yAxis:panel.yAxis;
		y=yax.bottom-y;
		var price;
		if(yax.semiLog){
			var logPrice=yax.logLow+y*yax.logShadow/yax.height;
			price=Math.pow(10,logPrice);
		}else{
			if( !yax.multiplier ) return null;
			price=yax.low+(y/yax.multiplier);
		}

		return price;
	};

	/**
	 * Returns the actual value of the chart given a pixel regardless of any transformation such as a comparison chart.
	 * @param  {number} y	  The Y pixel location
	 * @param  {CIQ.ChartEngine.Panel} [panel] The panel to look. Defaults to the chart itself if not passed in.
	 * @param {CIQ.ChartEngine.YAxis} [yAxis] The yAxis to use. Defaults to panel.yAxis.
	 * @return {number}		  The Y location. This may be off of the visible canvas.
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.priceFromPixel=function(y, panel, yAxis){
		if(!panel) panel=this.chart.panel;
		var price=this.transformedPriceFromPixel(y, panel, yAxis);
		if(this.charts[panel.name] && panel.chart.untransformFunc) {
			if(!yAxis || yAxis==panel.yAxis){
				price=panel.chart.untransformFunc(this, panel.chart, price, yAxis);
			}
		}
		return price;
	};

	/**
	 * Returns the value (price) given a Y-axis pixel. The value is relative to the panel or the canvas.
	 * @param  {number} y	  The y pixel position
	 * @param  {CIQ.ChartEngine.Panel} [panel] A panel object. If passed then the value will be relative to that panel. If not passed then the value will be relative to the panel that is in the actual Y location.
	 * @param  {CIQ.ChartEngine.YAxis} [yAxis] Which yAxis. Defaults to panel.yAxis.
	 * @return {number}		  The value relative to the panel
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.valueFromPixel=function(y, panel, yAxis){
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
		return this.priceFromPixel(y, panel, yAxis);
	};

	/**
	 * A version of {@link CIQ.ChartEngine#valueFromPixel} that will untransform a transformation such as a comparison chart.
	 * @param  {number} y	  The y pixel location
	 * @param  {CIQ.ChartEngine.Panel} panel A panel object. It is strongly recommended to pass the panel! (see {@link CIQ.ChartEngine#valueFromPixel})
	 * @param {CIQ.ChartEngine.YAxis} [yAxis] The yaxis to use. Defaults to panel.yAxis.
	 * @return {number}		  The price or value
	 * @memberof CIQ.ChartEngine
	 * @deprecated Use {@link CIQ.ChartEngine#valueFromPixel} instead
	 */
	CIQ.ChartEngine.prototype.valueFromPixelUntransform=function(y, panel, yAxis){
		return this.valueFromPixel(y, panel, yAxis);
	};

	/**
	 * A version of {@link CIQ.ChartEngine#pixelFromPrice} that will apply a transformation such as a comparison chart.
	 * @param  {number} price	  The price or value
	 * @param  {CIQ.ChartEngine.Panel} panel A panel object (see {@link CIQ.ChartEngine#pixelFromPrice})
	 * @param {CIQ.ChartEngine.YAxis} [yAxis] The yaxis to use
	 * @return {number}		  The y axis pixel location
	 * @memberof CIQ.ChartEngine
	 * @deprecated Use {@link CIQ.ChartEngine#pixelFromPrice} instead
	 */
	CIQ.ChartEngine.prototype.pixelFromPriceTransform=function(price, panel, yAxis){
		return this.pixelFromPrice(price, panel, yAxis);
	};

	/**
	 * A version of {@link CIQ.ChartEngine#pixelFromPrice} that will return the Y pixel from a given price (or value)
	 * @param  {number} price The price
	 * @param  {CIQ.ChartEngine.Panel} [panel] The panel (defaults to the chart)
	 * @param {CIQ.ChartEngine.YAxis} [yAxis] The yAxis to use
	 * @return {number}		  The Y pixel value
	 * @memberof CIQ.ChartEngine
	 * @since 4.0.0
	 */
	CIQ.ChartEngine.prototype.pixelFromTransformedValue=function(price, panel, yAxis){
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
	 * Returns the Y pixel from a transformation such as a comparison chart or from the actual value otherwise.
	 * @param  {number} price	  The price or value
	 * @param  {CIQ.ChartEngine.Panel} panel A panel object (see {@link CIQ.ChartEngine#pixelFromPrice})
	 * @param {CIQ.ChartEngine.YAxis} [yAxis] The yaxis to use
	 * @return {number}		  The y axis pixel location
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.pixelFromPrice=function(price, panel, yAxis){
		if(!panel) panel=this.chart.panel;
		if(this.charts[panel.name] && panel.chart.transformFunc) {
			if(!yAxis || yAxis==panel.yAxis){
				price=panel.chart.transformFunc(this, panel.chart, price, yAxis);	// transform should move to panel
			}
		}
		return this.pixelFromTransformedValue(price, panel, yAxis);
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
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.pixelFromValueAdjusted=function(panel, tick, value, yAxis){
		// If we're not showing unadjusted quotes, or if the panel isn't a chart then bypass
		if(this.layout.adj || !this.charts[panel.name]) return this.pixelFromPrice(value, panel, yAxis);
		var a=Math.round(tick); // Not sure why we're rounding this. Possible legacy code.
		// Adjust if there's a ratio attached to the tick
		var ratio;
		if(a>0 && a<panel.chart.dataSet.length && (ratio=panel.chart.dataSet[a].ratio)){
			return this.pixelFromPrice(value*ratio, panel, yAxis);
		}
		// Otherwise pass through
		return this.pixelFromPrice(value, panel, yAxis);
	};

	/**
	 * Returns the unadjusted value for a given value, if an adjustment (split) had been applied. This can return a value
	 * relative to the original closing price.
	 * @param  {CIQ.ChartEngine.Panel} panel The panel to check
	 * @param  {number} tick  The location in the dataset
	 * @param  {number} value The value to adjust
	 * @return {number}		  The adjusted value
	 * @memberof CIQ.ChartEngine
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
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.setTransform=function(chart, transformFunction, untransformFunction){
		chart.transformFunc=transformFunction;
		chart.untransformFunc=untransformFunction;
	};

	/**
	 * Removes a transformation/untransformation pair
	 * @param  {CIQ.ChartEngine.Chart} chart The chart to remove transformations from
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.unsetTransform=function(chart){
		delete chart.transformFunc;
		delete chart.untransformFunc;
		for(var i=0;chart.dataSet && i<chart.dataSet.length;i++){
			chart.dataSet[i].transform=null;
		}
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Stops (aborts) the current drawing. See {@link CIQ.ChartEngine#undoLast} for an actual "undo" operation.
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias undo
	 */
	CIQ.ChartEngine.prototype.undo=function(){
		if(this.runPrepend("undo", arguments)) return;
		if(this.activeDrawing){
			this.activeDrawing.abort();
			this.activateDrawing(null);
			CIQ.clearCanvas(this.chart.tempCanvas, this);
			this.draw();
			CIQ.swapClassName(this.controls.crossX, "stx_crosshair", "stx_crosshair_drawing");
			CIQ.swapClassName(this.controls.crossY, "stx_crosshair", "stx_crosshair_drawing");
			CIQ.ChartEngine.drawingLine=false;
		}
		this.runAppend("undo", arguments);
	};

	/**
	 * Creates an undo stamp for the chart's current drawing state and triggers a call to the {@link undoStampEventListener}.
	 *
	 * Every time a drawing is added or removed the {@link CIQ.ChartEngine#undoStamps} object is updated with a new entry containing the resulting set of drawings.
	 * Using the corresponding {@link CIQ.ChartEngine#undoLast} method, you can revert back to the last state, one at a time.
	 * You can also use the {@link undoStampEventListener} to create your own tracker to undo or redo drawings.
	 * @memberof CIQ.ChartEngine
	 * @param {array} before The chart's array of drawingObjects before being modified
	 * @param {array} after The chart's array of drawingObjects after being modified
	 */
	CIQ.ChartEngine.prototype.undoStamp=function(before, after){
		this.undoStamps.push(before);
		this.dispatch("undoStamp", {
			before: before,
			after: after,
			stx: this
		});
	};

	/**
	 * Revers back to the previous drawing state change.
	 * **Note: by design this method only manages drawings manually added during the current session and will not remove drawings restored from
	 * a previous session. ** If you wish to remove all drawings use {@link CIQ.ChartEngine#clearDrawings}.
	 *
	 * You can also view and interact with all drawings by traversing through the {@link CIQ.ChartEngine#drawingObjects} array which includes **all** drawings displayed
	 * on the chart, regardless of session. Removing a drawing from this list, will remove the drawing from the chart after a draw() operation is executed.
	 * @memberof CIQ.ChartEngine
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
	 * Programmatically add a drawing
	 * @param {object} drawing The drawing definition
	 * @todo  Document drawing JSON format
	 * @memberof CIQ.ChartEngine
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
	 * @param {number} [parameters.opacity] Opacity for the line
	 * @memberof CIQ.ChartEngine
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
			context.lineWidth=parseInt(CIQ.stripPX(color.width),10);
		}else{
			if(!color || color=="auto" || CIQ.isTransparent(color)){
				context.strokeStyle=this.defaultColor;
			}else{
				context.strokeStyle=color;
			}
		}
		if(parameters.opacity) context.globalAlpha=parameters.opacity;
		if(parameters.lineWidth) context.lineWidth=parameters.lineWidth;
		var pattern = CIQ.borderPatternToArray(context.lineWidth,parameters.pattern);
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
				if(pattern && pattern.length){
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
	 * Draws a series of points and splines (smooths the curve) those points.
	 *
	 * This is uses for drawings, not series.
	 * @param  {array} points		  A series of points in the pattern x0,y0,x1,y1
	 * @param {number} tension Spline tension (0-1). Set to negative to not spline. Requires "js/thirdparty/splines.js"
	 * @param  {string} color		   Either a color or a Styles object as returned from {@link CIQ.ChartEngine#canvasStyle}
	 * @param  {string} type		   The type of line to draw ("segment","ray" or "line")
	 * @param  {external:CanvasRenderingContext2D} [context]		The canvas context. Defaults to the standard context.
	 * @param  {string} [confineToPanel] Not currently implemented
	 * @param  {object} [parameters]	 Additional parameters to describe the line
	 * @param {string} [parameters.pattern] The pattern for the line ("solid","dashed","dotted")
	 * @param {number} [parameters.width] The width in pixels for the line
	 * @param {number} [parameters.opacity] Opacity for the line
	 * @memberof CIQ.ChartEngine
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
			context.lineWidth=parseInt(CIQ.stripPX(color.width),10);
		}else{
			if(!color || color=="auto" || CIQ.isTransparent(color)){
				context.strokeStyle=this.defaultColor;
			}else{
				context.strokeStyle=color;
			}
		}
		if(parameters.opacity) context.globalAlpha=parameters.opacity;
		if(parameters.lineWidth) context.lineWidth=parameters.lineWidth;
		var pattern = CIQ.borderPatternToArray(context.lineWidth,parameters.pattern);
		if(parameters.pattern && context.setLineDash){
			context.setLineDash(pattern);
			context.lineDashOffset=0;  //start point in array
		}

		//stxThirdParty
		context.beginPath();
		splinePlotter.plotSpline(points,tension,context);
		context.stroke();
		context.closePath();

		context.restore();
	};

	/**
	 * Repositions a drawing onto the temporary canvas. Called when a user moves a drawing.
	 * @param  {CIQ.Drawing} drawing The drawing to reposition
	 * @param  {boolean} activating True when first activating "reposition", so the drawing simply gets re-rendered in the same spot but on the tempCanvas.
	 * (Otherwise it would jump immediately to the location of the next click/touch).
	 * @since  3.0.0
	 * @since 5.0.0 Added activating parameter
	 * @private
	 */
	CIQ.ChartEngine.prototype.repositionDrawing=function(drawing, activating){
		var panel=this.panels[drawing.panelName];
		var value=this.adjustIfNecessary(panel, this.crosshairTick, this.valueFromPixel(this.backOutY(CIQ.ChartEngine.crosshairY), panel));
		var tempCanvas=this.chart.tempCanvas;
		CIQ.clearCanvas(tempCanvas, this);
		if(activating){
			drawing.render(tempCanvas.context);
		}else{
			drawing.reposition(tempCanvas.context, drawing.repositioner, this.crosshairTick, value);
		}
		if(drawing.measure) drawing.measure();
	};

	/**
	 * Activates or deactivates repositioning on a drawings.
	 * @param  {CIQ.Drawing} drawing The drawing to activate. null to deactivate the current drawing.
	 * @memberOf  CIQ.ChartEngine
	 * @since  3.0.0
	 */
	CIQ.ChartEngine.prototype.activateRepositioning=function(drawing){
		var repositioningDrawing=this.repositioningDrawing=drawing;
		if(drawing){ // Take the drawing off the main canvas and put it on the tempCanvas
			this.draw();
			this.repositionDrawing(drawing, true);
		}
		this.chart.tempCanvas.style.display=drawing?"block":"none";
	};

	/**
	 * Activate a drawing. The user can then finish the drawing.
	 *
	 * Note: Some drawings labeled "chartsOnly" can only be activated on the chart panel.
	 * @param {string} drawingTool The tool to activate. Send null to deactivate.
	 * @param {CIQ.ChartEngine.Panel} [panel] The panel where to activate the tool. Defaults to the chart panel.
	 * @return {boolean} Returns true if the drawing was successfully activated. Returns false if unactivated or unsuccessful.
	 * @memberof CIQ.ChartEngine
	 * @since  3.0.0
	 */
	CIQ.ChartEngine.prototype.activateDrawing=function(drawingTool, panel){
		if(!drawingTool){
			this.activeDrawing=null;
			this.chart.tempCanvas.style.display="none";
			return false;
		}
		if(!panel) panel=this.chart.panel;
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
					return false;
				}
			}
		}
		this.chart.tempCanvas.style.display="block";
		return true;
	};

	/**
	 * This is called to send a potential click event to an active drawing, if one is active.
	 * @param  {CIQ.ChartEngine.Panel} panel The panel in which the click occurred
	 * @param  {number} x	  The X pixel location of the click
	 * @param  {number} y	  The y pixel location of the click
	 * @return {boolean}	  Returns true if a drawing is active and received the click
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.drawingClick=function(panel, x, y){
		if(!CIQ.Drawing) return;
		if(!panel) return; // can be true if panel was closed in the middle of a drawing
		if(this.openDialog!=="") return; // don't register a drawing click if in modal mode
		if(!this.activeDrawing){
			if(!this.activateDrawing(this.currentVectorParameters.vectorType, panel)) return;
		}
		if(this.activeDrawing){
			if(this.userPointerDown && !this.activeDrawing.dragToDraw){
				if(!CIQ.ChartEngine.drawingLine) this.activateDrawing(null);
				return;
			}

			var tick=this.tickFromPixel(x, panel.chart);
			var dpanel=this.panels[this.activeDrawing.panelName];
			var value=this.adjustIfNecessary(dpanel, tick, this.valueFromPixel(y,dpanel));
			if(this.preferences.magnet && this.magnetizedPrice){
				value=this.adjustIfNecessary(dpanel, tick, this.magnetizedPrice);
			}
			if(this.activeDrawing.click(this.chart.tempCanvas.context, tick, value)){
				if(this.activeDrawing){	// Just in case the drawing aborted itself, such as measure
					CIQ.ChartEngine.drawingLine=false;
					CIQ.clearCanvas(this.chart.tempCanvas, this);
					this.addDrawing(this.activeDrawing);	// Save drawing
					this.activateDrawing(null);
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
	 * @memberof CIQ.ChartEngine
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
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
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
				this.activateRepositioning(null);
				this.adjustDrawings(); // added missing adjusts when repositioning a Drawing  --gus
				this.draw();
				return;
			}
			this.activateRepositioning(null);
		}
		if(this.repositioningBaseline){
			this.repositioningBaseline=null;
			var mainSeriesRenderer=this.mainSeriesRenderer || {};
			if(mainSeriesRenderer.params && mainSeriesRenderer.params.baseline && mainSeriesRenderer.params.type!="mountain"){
				//this is so the baseline does not pop back to the center
				this.chart.panel.yAxis.scroll=this.pixelFromPrice(this.chart.baseline.userLevel, this.chart.panel)-(this.chart.panel.yAxis.top+this.chart.panel.yAxis.bottom)/2;
			}
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
			if(!this.overXAxis && !this.overYAxis) this.swipeRelease();
			CIQ.unappendClassName(this.container, "stx-drag-chart");
			this.grabOverrideClick=false;
			this.doDisplayCrosshairs();
			this.updateChartAccessories();
			return;
		}
		//if(!this.displayCrosshairs) return;
		if(CIQ.ChartEngine.insideChart) CIQ.unappendClassName(this.container, "stx-drag-chart");
		if(CIQ.ChartEngine.resizingPanel){
			this.releaseHandle();
			//CIQ.clearCanvas(this.chart.tempCanvas, this);
			//this.resizePanels();
			//CIQ.ChartEngine.resizingPanel=null;
			return;
		}
		if(!e) e=event;	//IE8
		var cy=this.backOutY(e.clientY);
		var cx=this.backOutX(e.clientX);
		if((e.which && e.which>=2) || (e.button && e.button>=2) || e.ctrlKey){
			if(this.anyHighlighted && this.bypassRightClick!==true){
				this.rightClickHighlighted();
				if(e.preventDefault && this.captureTouchEvents) e.preventDefault();
				e.stopPropagation();
				return false;
			}
			this.dispatch("rightClick", {stx:this, panel:this.currentPanel, x:cx, y:cy});
			return true;
		}
		if(e.clientX<this.left || e.clientX>this.right) return;
		if(e.clientY<this.top || e.clientY>this.bottom) return;

		if(wasMouseDown && (!this.longHoldTookEffect || this.activeDrawing)){  //only completes drawing if you if don't leave chart and let go of mouse button
			this.drawingClick(this.currentPanel, cx, cy);
		}
		if(!this.activeDrawing && !this.longHoldTookEffect){
			this.dispatch("tap", {stx:this, panel:this.currentPanel, x:cx, y:cy});
		}

		this.runAppend("mouseup", arguments);
	};

	/**
	 * Turns on the grabbing hand cursor. It does this by appending the class "stx-drag-chart" to the chart container.
	 * If this is a problem then just eliminate this function from the prototype.
	 * @memberof CIQ.ChartEngine
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
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias mousedown
	 */
	CIQ.ChartEngine.prototype.mousedown=function(e){
		if(this.runPrepend("mousedown", arguments)) return;
		this.grabOverrideClick=false;
		//if(this.openDialog!=="") return;
		if(!this.displayInitialized) return;	// No chart displayed yet
		if(!this.displayCrosshairs) return;
		if(this.repositioningDrawing) return; // if mouse went off screen this might happen
		if(this.editingAnnotation) return;
		if(!e) e=event;	//IE8
		if((e.which && e.which>=2) || (e.button && e.button>=2)){	// Added 9/19/13 to prevent mFinance bug where right click wouldn't eliminate drawing
			return;
		}
		var rect=this.container.getBoundingClientRect();
		this.top=rect.top;
		this.left=rect.left;
		this.right=this.left+this.width;
		this.bottom=this.top+this.height;
		if(e.clientX>=this.left && e.clientX<=this.right && e.clientY>=this.top && e.clientY<=this.bottom){
			CIQ.ChartEngine.insideChart=true;
		}else{
			CIQ.ChartEngine.insideChart=false;
			return;
		}
		if(!this.currentPanel) return;
		if(this.manageTouchAndMouse && e && e.preventDefault && this.captureTouchEvents) e.preventDefault();	// Added 9/19/13 to prevent IE from going into highlight mode when you mouseout of the container
		this.mouseTimer=Date.now();
		this.longHoldTookEffect=false;
		this.hasDragged=false;
		this.userPointerDown=true;
		var chart=this.currentPanel.chart;
		for(var i=0;i<this.drawingObjects.length;i++){
			var drawing=this.drawingObjects[i];
			if(drawing.highlighted && !drawing.permanent){
				if(this.cloneDrawing){ // clone a drawing if flag set
					var Factory=CIQ.ChartEngine.drawingTools[drawing.name];
					var clonedDrawing=new Factory();
					clonedDrawing.reconstruct(this, drawing.serialize());
					this.drawingObjects.push(clonedDrawing);
					this.activateRepositioning(clonedDrawing);
					clonedDrawing.repositioner=drawing.repositioner;
					return;
				}
				var drawingTool=this.currentVectorParameters.vectorType;
				// do not allow repositioning if the drawing tool has dragToDraw (like the freeform)
				if(!CIQ.Drawing || !drawingTool || !CIQ.Drawing[drawingTool] || !(new CIQ.Drawing[drawingTool]()).dragToDraw){
					this.activateRepositioning(drawing);
					return;
				}
			}
		}
		var mainSeriesRenderer=this.mainSeriesRenderer || {};
		if(mainSeriesRenderer.params && mainSeriesRenderer.params.baseline && chart.baseline.userLevel!==false && this.controls.baselineHandle){
			var y0=this.valueFromPixel(this.cy - 5, this.currentPanel);
			var y1=this.valueFromPixel(this.cy + 5, this.currentPanel);
			var x0=this.chart.right - parseInt(getComputedStyle(this.controls.baselineHandle).width, 10);
			if(chart.baseline.actualLevel<y0 && chart.baseline.actualLevel>y1 && this.cx>x0){
				this.repositioningBaseline={lastDraw:Date.now()};
				return;
			}
		}
		this.drawingClick(this.currentPanel, this.cx, this.cy);
		if(this.activeDrawing && this.activeDrawing.dragToDraw) return;

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
		this.grabStartMicropixels=this.micropixels;
		this.grabStartScrollX=chart.scroll;
		this.grabStartScrollY=this.currentPanel.yAxis.scroll;
		this.grabStartCandleWidth=this.layout.candleWidth;
		this.grabStartYAxis=this.whichYAxis(this.currentPanel);
		this.grabStartZoom=this.grabStartYAxis?this.grabStartYAxis.zoom:0;
		this.grabStartPanel=this.currentPanel;

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
	 * Sets the current drawing tool as described by {@link CIQ.ChartEngine#currentVectorParameters} (segment, line, etc)
	 * @param  {string} value The name of the drawing tool to enable
	 * @memberof CIQ.ChartEngine
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
		CIQ.Drawing.initializeSettings(this, value);
		//if(value==""){  //need to always undo here to allow release of last drawing tool
			if(CIQ.ChartEngine.drawingLine) this.undo();
		//}
		this.setCrosshairColors();
		if(CIQ.ChartEngine.insideChart)
			this.doDisplayCrosshairs();
	};

	/**
	 * Sets the current drawing parameter as described by {@link CIQ.ChartEngine#currentVectorParameters} (color, pattern, etc)
	 * @param  {string} value The name of the drawing parameter to change (currentColor, fillColor, lineWidth, pattern, axisLabel, fontSize, fontStyle, fontWeight, fontFamily)
	 * @param  {string} value The value of the parameter
	 * @return  {boolean} True if property was assigned
	 * @memberof CIQ.ChartEngine
	 * @example
	 * 		this.stx.changeVectorParameter("currentColor","yellow");  // or rgb/hex
	 *		this.stx.changeVectorParameter("axisLabel",false);  // or "false"
	 *		this.stx.changeVectorParameter("lineWidth",5);  // or "5"
	 *		this.stx.changeVectorParameter("fontSize","12");  // or 12 or "12px"
	 *		this.stx.changeVectorParameter("pattern","dotted");
	 *
	 * @since 3.0.0
	 */
	CIQ.ChartEngine.prototype.changeVectorParameter=function(parameter, value){
		if(parameter=="axisLabel") value=(value.toString()==="true" || Number(value));
		else if(parameter=="lineWidth") value=Number(value);
		else if(parameter=="fontSize") value=parseInt(value,10)+"px";
		var currentVectorParams=this.currentVectorParameters;
		if(typeof(currentVectorParams[parameter])!=="undefined"){
			currentVectorParams[parameter]=value;
			return true;
		}else if(parameter.substr(0,4)=="font"){
			parameter=parameter.substr(4).toLowerCase();
			if(parameter=="family" && value.toLowerCase()=="default") value=null;
			currentVectorParams=currentVectorParams.annotation.font;
			if(typeof(currentVectorParams[parameter])!=="undefined"){
				currentVectorParams[parameter]=value;
				return true;
			}
		}
		return false;
	};

	/**
	 * Dispatch a {@link drawingEditEventListener} event if there are any listeners. Otherwise, remove the given drawing.
	 *
	 * @param {CIQ.Drawing} drawing The vector instance to edit, normally provided by deleteHighlighted.
	 * @param {boolean} forceEdit skip the context menu and begin editing. Used on touch devices.
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias rightClickDrawing
	 * @since 6.2.0
	 */
	CIQ.ChartEngine.prototype.rightClickDrawing=function(drawing, forceEdit) {
		if (this.runPrepend("rightClickDrawing", arguments)) return;
		if (drawing.permanent) return;

		if (typeof this.callbacks.drawingEdit === 'function' || this.callbackListeners.drawingEdit.length) {
			this.dispatch('drawingEdit', {
				stx: this,
				drawing: drawing,
				forceEdit: forceEdit
			});
		} else {
			var dontDeleteMe = drawing.abort();

			if (!dontDeleteMe) {
				var before = CIQ.shallowClone(this.drawingObjects);
				this.removeDrawing(drawing);
				this.undoStamp(before, CIQ.shallowClone(this.drawingObjects));
			}

			this.changeOccurred("vector");
		}

		this.runAppend("rightClickDrawing", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * This function is called when a highlighted study overly is right clicked. If the overlay has an edit function (as many studies do), it will be called. Otherwise it will remove the overlay
	 * @param  {string} name The name (id) of the overlay
	 * @param  {boolean} [forceEdit] If true then force edit menu
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
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
	 * Registers an activated overlay study with the chart.
	 *
	 * This is the recommended method for registering an overlay study, rather than directly manipulating the [stxx.overlays]{@link CIQ.ChartEngine#overlays} object.
	 * @param {object} data.sd The study object studyDescriptor
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias addOverlay
	 * @since 5.2.0
	 */
	CIQ.ChartEngine.prototype.addOverlay=function(sd){
		if(this.runPrepend("addOverlay", arguments)) return;
		this.overlays[sd.name]=sd;
		this.runAppend("addOverlay", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Removes an overlay (and the associated study)
	 * @param  {string} name The name (id) of the overlay
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias removeOverlay
	 */
	CIQ.ChartEngine.prototype.removeOverlay=function(name){
		if(this.runPrepend("removeOverlay", arguments)) return;
		var mySD=this.overlays[name];
		for(var o in this.overlays){
			var sd=this.overlays[o];
			var fieldInputs=["Field"];
			if(CIQ.Studies) fieldInputs=CIQ.Studies.getFieldInputs(sd);
			for(var f=0;f<fieldInputs.length;f++){
				// Study sd is reliant on an output from the about-to-be-deleted overlay
				if(mySD.outputMap[sd.inputs[fieldInputs[f]]]){ // Yucky, we should move to explicit parent nodes
					this.removeOverlay(sd.name);
				}
			}
		}
		if(CIQ.Studies){
			var study=this.layout.studies[name];
			CIQ.deleteRHS(CIQ.Studies.studyPanelMap, study);
			if(mySD) this.cleanupRemovedStudy(mySD);
		}
		if(mySD){
			var panel=this.panels[mySD.panel];
			delete this.overlays[name];
			this.deleteYAxisIfUnused(panel, this.getYAxisByName(panel, name));
		}

		if(!this.currentlyImporting) { // silent mode while importing
			this.displaySticky();
			this.createDataSet();
			this.changeOccurred("layout");
		}
		this.resetDynamicYAxis();
		this.runAppend("removeOverlay", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Adds a series of data to the chart. A series can be displayed (for instance like a comparison chart) or it can be hidden (for instance to drive a study).
	 *
	 * If you have a quotefeed attached to your chart, then just pass the symbol as the first parameter. There is no need to pass data since the chart will automatically fetch it from your quotefeed.
	 * If however you are using the "push" method to feed data to your chart then you must provide the data manually by passing it as a parameter.
	 *
	 * Here's how you would add a hidden series for symbol "IBM" when using a quotefeed:
	 * ```
	 * stxx.addSeries("IBM");
	 * ```
	 *
	 * That series will now be available for use by studies. If you wish to *display* your series you must specify how you wish the series to be renderered. The most basic case is when you want to display a series as a line.
	 * Simply specify a color for your line:
	 * ```
	 * stxx.addSeries("IBM", {color:"blue"});
	 * ```
	 * 
	 * Example 1 - manually add data to a chart and a series<iframe width="100%" height="500" scrolling="no" seamless="seamless" align="top" style="float:top" src="https://jsfiddle.net/chartiq/avem0zcx/embedded/result,js,html/" allowfullscreen="allowfullscreen" frameborder="1"></iframe>
	 *
	 * That example adds a series as an overlay, but more often you'll want to display series as comparisons.
	 * Comparisons are special because they change the chart from a price chart to a percentage chart.
	 * All series on the chart then begin at "zero", on the left side of the chart.
	 * Set isComparison=true when adding a series to make it a comparison chart.  As long as a comparison series is on a chart, the chart will display its y-axis in percent scale
	 * provided {@link CIQ.ChartEngine.Chart#forcePercentComparison} is true.
	 * ```
	 * stxx.addSeries("IBM", {color:"blue", isComparison:true});
	 * ```
	 *
	 * ** Complex Visualizations **
	 * 
	 * Example 2 - use a custom renderer to display a series<iframe width="100%" height="500" scrolling="no" seamless="seamless" align="top" style="float:top" src="https://jsfiddle.net/chartiq/b6pkzrad/embedded/result,js,html/" allowfullscreen="allowfullscreen" frameborder="1"></iframe>
	 *
	 *
	 * Behind the scenes, series are displayed by [renderers]{@link CIQ.Renderer}.
	 * Renderers can plot lines, mountains, bars, candles, and other types of visualizations.
	 * When adding a series, you can specify which renderer to use and set parameters to control your visual.
	 * For instance, this will display a series as a bar chart on its own left axis:
	 * ```
	 * stxx.addSeries("SNE", {display:"Sony",renderer:"Bars",name:"test", yAxis:new CIQ.ChartEngine.YAxis({position:"left", textStyle:"#FFBE00"})});
	 * ```
	 * Which is the same as explicitly declaring a renderer and then attaching it to the series:
	 * ```
	 * stxx.addSeries("SNE", {display:"Sony"},function(){
	 * 	// create the axis
	 * 	var axis=new CIQ.ChartEngine.YAxis();
	 * 	axis.position="left";
	 * 	axis.textStyle="#FFBE00";
	 *
	 * 	//create the renderer and attach
	 * 	var renderer=stxx.setSeriesRenderer(new CIQ.Renderer.Bars({params:{name:"test", yAxis:axis}}));
	 * 	renderer.attachSeries("SNE").ready();
	 * });
	 * ```
	 *
	 * ** Using a Symbol Object **
	 *
	 * The previous examples all assumed your chart uses "tickers" (stock symbols).
	 * We refer to complex (compound) symbols as "Symbol Objects" (see {@link CIQ.ChartEngine#newChart}).
	 * Here's how to set a series with a symbol object:
	 * ```
	 * stxx.addSeries(null, {color:"blue", symbolObject:yourSymbolObject});
	 * ```
	 *
	 * ** Advanced Visualizations **
	 *
	 * Some renderers are capable of rendering *multiple series*.
	 * For instance, the [Histogram]{@link CIQ.Renderer.Histogram} can display series stacked on top of one another.
	 * Use `[setSeriesRenderer()]{@link CIQ.ChartEngine#setSeriesRenderer}` in this case.
	 * Here is how we would create a stacked histogram from several series:
	 * ```
	 * var myRenderer=stxx.setSeriesRenderer(new CIQ.Renderer.Histogram({type:"histogram", subtype:"stacked"}));
	 *
	 * stxx.addSeries("^NIOALL", {}, function() {myRenderer.attachSeries("^NIOALL","#6B9CF7").ready();});
	 * stxx.addSeries("^NIOAFN", {}, function() {myRenderer.attachSeries("^NIOAFN","#95B7F6").ready();});
	 * stxx.addSeries("^NIOAMD", {}, function() {myRenderer.attachSeries("^NIOAMD","#B9D0F5").ready();});
	 * ```
	 * 
	 * Example 3 - advanced stacked histogram renderer<iframe width="100%" height="500" scrolling="no" seamless="seamless" align="top" style="float:top" src="https://jsfiddle.net/chartiq/rb423n71/embedded/result,js,html/" allowfullscreen="allowfullscreen" frameborder="1"></iframe>
	 *
	 * ** Setting a Left YAxis **
	 *
	 * By default, series are displayed without a y-axis.
	 * They are either "overlayed" on the main chart, or if they are comparisons then they share the standard y-axis.
	 * A series can take an optional y-axis which can be displayed on the left (or can be stacked up on the right side).
	 * To do this, you must specify parameters for a [YAxis]{@link CIQ.ChartEngine.YAxis} object and pass to addSeries:
	 * ```
	 * stxx.addSeries("IBM", {color:"blue", yAxis:{ position:"left" }});
	 * ```
	 *
	 * @param {string} [id] The name of the series. If not passed then a unique ID will be assigned. (parameters.symbol and parameters.symbolObject will default to using id if they are not set explicitly *and* id is supplied.)
	 * @param {object} [parameters] Parameters to describe the series. Any valid [attachSeries parameters]{@link CIQ.Renderer#attachSeries} and [renderer parameters]{@link CIQ.Renderer} will be passed to attached renderers.
	 * @param {string} [parameters.renderer] <span class="injection">Rendering</span> Set to the desired [renderer]{@link CIQ.Renderer} for the series. Will cause the series to display on the screen. If not set, then the series will be hidden.
	 * - Defaults to [Lines]{@link CIQ.Renderer.Lines} if `color` is set.
	 * @param {string} [parameters.display] <span class="injection">Rendering</span> Set to the text to display on the legend. If not set, the id of the series will be used (usually symbol).  If id was not provided, will default to symbol.
	 * @param {string} [parameters.symbol] <span class="injection">Data Loading</span> The symbol to fetch in string format. This will be sent into the fetch() function, if no data is provided.  If no symbol is provided, series will use the `id` as the symbol. If both `symbol` and `symbolObject` are set, `symbolObject` will be used.
	 * @param {object} [parameters.symbolObject] <span class="injection">Data Loading</span> The symbol to fetch in object format. This will be sent into the fetch() function, if no data is provided. If no symbolObject is provided, series will use the `id` as the symbol. You can send anything you want in the symbol object, but you must always include at least a 'symbol' element. If both `symbol` and `symbolObject` are set, `symbolObject` will be used.
	 * @param {string} [parameters.field] <span class="injection">Data Loading</span> Specify an alternative field to draw data from (other than the Close/Value). Must be present in your pushed data objects or returned from the quoteFeed.
	 * @param {boolean} [parameters.isComparison] <span class="injection">Rendering</span> If set to true, shareYAxis is automatically set to true to display relative values instead of the primary symbol's price labels. {@link CIQ.ChartEngine#setComparison} is also called and set to `true`. This is only applicable when using the primary Y axis, and should only be used with internal addSeries renderers.
	 * @param {boolean} [parameters.shareYAxis] <span class="injection">Rendering</span> Set to `true` so that the series shares the Y-axis and renders along actual values and print its corresponding current price label on the y axis. When set to `false` the series is superimposed on the chart maintaining the relative shape of the line but not on the actual y axes values and no current price will be displayed(used when rendering multiple series that do not share a common value range). Will automatically override to true if 'isComparison' is set. This is only applicable when using the primary Y axis.
	 * @param {number} [parameters.marginTop] <span class="injection">Rendering</span> Percentage (if less than 1) or pixels (if greater than 1) from top of panel to set the top margin for the series.<BR>**Note:** this parameter is to be used on **subsequent** series rendered on the same axis. To set margins for the first series, {@link CIQ.ChartEngine.YAxis#initialMarginTop} needs to be used.<BR>**Note:** not applicable if shareYAxis is set.
	 * @param {number} [parameters.marginBottom] <span class="injection">Rendering</span> Percentage (if less than 1) or pixels (if greater than 1) from the bottom of panel to set the bottom margin for the series.<BR>**Note:** this parameter is to be used on **subsequent** series rendered on the same axis. To set margins for the first series, {@link CIQ.ChartEngine.YAxis#initialMarginBottom} needs to be used.<BR>**Note:** not applicable if shareYAxis is set.
	 * @param {number} [parameters.width] <span class="injection">Rendering</span> Width of line
	 * @param {number} [parameters.minimum]	 <span class="injection">Rendering</span> Minimum value for the series. Overrides CIQ.minMax result.
	 * @param {number} [parameters.maximum]	 <span class="injection">Rendering</span> Maximum value for the series. Overrides CIQ.minMax result.
	 * @param {string} [parameters.color] <span class="injection">Rendering</span> Color to draw line. Will cause the line to immediately render an overlay. Only applicable for default/'Lines' renderer. See {@link CIQ.Renderer#attachSeries} for additional color options.
	 * @param {string} [parameters.baseColor] <span class="injection">Rendering</span> Color for the base of a mountain series. Defaults to `parameters.color`.
	 * @param {array|string} [parameters.pattern] <span class="injection">Rendering</span> Pattern to draw line, array elements are pixels on and off, or a string e.g. "solid", "dotted", "dashed"
	 * @param {boolean|string} [parameters.fillGaps] <span class="injection">Data Loading</span> If {@link CIQ.ChartEngine#cleanupGaps} is enabled to clean gaps (not 'false'), you can use this parameter to override the global setting for this series.
	 * - If `fillGaps` not present
	 *  - No gaps will be filled for the series.
	 * - If `fillGaps` is set to 'false'
	 *  - No gaps will be filled for the series.
	 * - If `fillGaps` is set to 'true',
	 *  - Gap filling will match {@link CIQ.ChartEngine#cleanupGaps}.
	 * - If `fillGaps` is set to  'carry' or 'gaps'
	 *  - Will use that filling method even if `cleanupGaps` is set differently.
	 * @param {object} [parameters.gapDisplayStyle] <span class="injection">Rendering</span> Defines how to **render** (style) gaps in the data (missing data points).  If undefined, and the series is a comparison, the gaps will be rendered transparent.
	 *                                   	Set to `true` to use the same color and pattern as the main line, or define a color-pattern object if different.
	 * @param {string} [parameters.gapDisplayStyle.color] Color to draw line where data points are missing
	 * @param {array|string} [parameters.gapDisplayStyle.pattern] Pattern to draw line where data points are missing, array elements are pixels on and off, or a string e.g. "solid", "dotted", "dashed"
	 * @param {string} [parameters.fillStyle] <span class="injection">Rendering</span> Fill style for mountain chart (if selected). For semi-opaque use rgba(R,G,B,.1).  If not provided a gradient is created with color and baseColor.
	 * @param {boolean} [parameters.permanent] <span class="injection">Rendering</span> Set to `true` to activate. Makes series unremoveable by a user **when attached to the default renderer**. If explicitly linked to a renderer, see {@link CIQ.Renderer#attachSeries} for details on how to prevent an attached series from being removed by a user.
	 * @param {object} [parameters.data] <span class="injection">Data Loading</span> Data source for the series.
	 * <P>&bull; If this field is omitted, the library will connect to the QuoteFeed (if available) to fetch initial data ( unless `parameters.loadData` is set to `false`), and manage pagination and updates.
	 * <P>&bull; If data is sent in this field, it will be loaded into the masterData, but series will **not** be managed by the QuoteFeed (if available) for pagination or updates.
	 * <P>&bull; Items in this array *must* be ordered from earliest to latest date.<br>
	 * <P>&bull; Accepted formats:
	 * <br><br><br>**Full OHLC:**<br>
	 * An array of properly formatted OHLC quote object(s). [See OHLC Data Format]{@tutorial InputDataFormat}.<br>
	 * <br>----<br><br>**Close Price Only:**<br>
	 * An array of of objects, each one with the followng elements:<br>
	 * @param {date}   [parameters.data.DT] JavaScript date object or epoch representing data point (overrides Date parameter if present)
	 * @param {string} [parameters.data.Date] string date representing data point ( only used if DT parameter is not present)
	 * @param {number} parameters.data.Value value of the data point ( As an alternative, you can send `parameters.data.Close` since your quote feed may already be returning the data using this element name)
	 * @param {string} [parameters.panel] <span class="injection">Rendering</span> the panel name on which the series should display
	 * @param {string} [parameters.action="add-series"] <span class="injection">Rendering</span> Overrides what action is sent in symbolChange events. Set to null to prevent a symbolChange event.
	 * @param {boolean} [parameters.loadData=true] <span class="injection">Data Loading</span> Include and set to false if you know the initial data is already in the masterData array or will be loaded by another method. The series will be added but no data requested. Note that if you remove this series, the data points linked to it will also be removed which may create issues if required by the chart. If that is the case, you will need to manually remove from the renderer linked to it instead of the underlying series itself.
	 * @param {boolean} [parameters.extendToEndOfDataSet] <span class="injection">Rendering</span> Set to true to plot any gap at the front of the chart.  Automatically done for step charts or if parameters.gapDisplayStyle are set (see {@link CIQ.ChartEngine#addSeries})
	 * @param {function} [cb] Callback function to be executed once the fetch returns data from the quoteFeed. It will be called with an error message if the fetch failed: `cb(err);`. Only applicable if no data is provided.
	 *
	 * @return {object} The series object
	 * @memberof CIQ.ChartEngine
	 *
	 *
	 * @example
	 * // add a series overlay and display it as a dashed line.
	 * stxx.addSeries(
	 *		"IBM",
	 *		{color:"purple", pattern:[3,3]}
	 * );
	 *
	 * @example
	 * // Add a series onto the main axis and then create a moving average study that uses it.
	 * // Note, this will work for any study that accepts a *"Field"* parameter.
	 *
	 *	stxx.addSeries("ge", {color:"yellow", shareYAxis:true}, function(){
	 *		var inputs = {
	 *	        "Period": 20,
	 *	        "Field": "ge",
	 *	        "Type": "ma"
	 *	    };
	 *	    var outputs = {
	 *	        "MA": "red"
	 *	    };
	 *	    CIQ.Studies.addStudy(stxx, "ma", inputs, outputs);
	 *	});
	 *
	 * @example
	 * // add series using a symbolObject which includes the data source key.
	 * // This key will be sent into the fetch 'params' for use in your quoteFeed.
	 * var mySymbol={symbol:"GE", source:"realtimedb"};
	 * var mySymbol2={symbol:"GDP", source:"fundamentaldb"};
	 *
	 * stxx.addSeries(null, {color:"purple", symbolObject:mySymbol});
	 * stxx.addSeries(null, {color:"green", symbolObject:mySymbol2});
	 *
	 * @example
	 * // The engine is smart enough to use the series symbol, or "Close" if the symbol doesn't exist in the returned data from your quotefeed
	 * // but if you want to use any other field then you'll need to specify it like this.
	 * stxx.addSeries("GE", {color:"purple", field: "Open"});
	 *
	 * @example
	 * // add the comparison series with a color to immediately render using default renderer (as lines) and dashes for gaps fillers
	 *	stxx.addSeries(symbol1, {display:"Description 1",isComparison:true,color:"purple", gapDisplayStyle:{pattern:[3,3]},width:4,permanent:true});
	 *	stxx.addSeries(symbol2, {display:"Description 2",isComparison:true,color:"pink", gapDisplayStyle:{pattern:[3,3]},width:4});
	 *	stxx.addSeries(symbol3, {display:"Description 3",isComparison:true,color:"brown", gapDisplayStyle:{pattern:[3,3]},width:4});
	 *
	 * @example
	 *	// add the series with only default parameters (no color).
	 *	// The series will not display on the chart after it is added,
	 *	// but the data will be available ready to be attached to a renderer.
	 *	stxx.addSeries(symbol1, {display:"Description 1"});
	 *	stxx.addSeries(symbol2, {display:"Description 2"});
	 *	stxx.addSeries(symbol3, {display:"Description 3"});
	 *
	 * @example
	 *	// add a series with a color to immediately render. It also calls callbackFunct after the data is returned from the fetch.
	 *	function callbackFunct(field){
	 *		 return function(err) {
	 *			CIQ.alert(field);
	 *		}
	 *	}
	 *
	 *	stxx.addSeries(symbol1, {display:"Description",color:"brown"}, callbackFunct(symbol1));
	 *
	 * @example
	 * // add a stacked historam with 3 series usng an external renderer.
	 *
	 *	// note how the addSeries callback is used to ensure the data is present before the series  is displayed
	 *
	 * // configure the histogram display
	 * var params={
	 *	name:				"Sentiment Data",
	 *	type:				"histogram",
	 *	subtype:			"stacked",
	 *	heightPercentage:	.7,	 // how high to go. 1 = 100%
	 *	opacity:			.7,  // only needed if supporting IE8, otherwise can use rgba values in histMap instead
	 *	widthFactor:		.8	 // to control space between bars. 1 = no space in between
	 * };
	 *
	 * //legend creation callback
	 * function histogramLegend(colors){
	 * 	stxx.chart.legendRenderer(stxx,{legendColorMap:colors, coordinates:{x:260, y:stxx.panels["chart"].yAxis.top+30}, noBase:true});
	 * }
	 *
	 * var histRenderer=stxx.setSeriesRenderer(new CIQ.Renderer.Histogram({params: params, callback: histogramLegend}));
	 *
	 * stxx.addSeries("^NIOALL", {display:"Symbol 1"}, function() {histRenderer.attachSeries("^NIOALL","#6B9CF7").ready();});
	 * stxx.addSeries("^NIOAFN", {display:"Symbol 2"}, function() {histRenderer.attachSeries("^NIOAFN","#95B7F6").ready();});
	 * stxx.addSeries("^NIOAMD", {display:"Symbol 3"}, function() {histRenderer.attachSeries("^NIOAMD","#B9D0F5").ready();});
	 *
	 * @example
	 * // add a series overlay for data that *already exists in the chart*.
	 * By setting loadData to false, the chart will assume the data exists, and not request it from the quotefeed.
	 * stxx.addSeries(
	 *		"Close",
	 *		{color:"purple", loadData:false}
	 * );
	 *
	 * @example
	 *	// add multiple series and attach to a custom y-axis on the left.
	 *	// See this example working here : https://jsfiddle.net/chartiq/b6pkzrad
	 *
	 *	// note how the addSeries callback is used to ensure the data is present before the series is displayed
	 *
	 *	//create the custom axis
	 *	var axis=new CIQ.ChartEngine.YAxis();
	 *	axis.position="left";
	 *	axis.textStyle="#FFBE00";
	 *	axis.decimalPlaces=0;			// no decimal places on the axis labels
	 *	axis.maxDecimalPlaces=0;		// no decimal places on the last price pointer
	 *
	 *	//create the renderer
	 *	var renderer=stxx.setSeriesRenderer(new CIQ.Renderer.Lines({params:{name:"lines", type:"mountain", yAxis:axis}}));
	 *
	 *	// create your series and attach them to the chart when the data is loaded.
	 *	stxx.addSeries("NOK", {display:"NOK",width:4},function(){
	 *		renderer.attachSeries("NOK", "#FFBE00").ready();
	 *	});
	 *
	 *	stxx.addSeries("SNE", {display:"Sony",width:4},function(){
	 *		renderer.attachSeries("SNE", "#FF9300").ready();
	 *	});
	 *
	 * @example
	 * // add a series with a colored bar renderer; usng default colors
	 * stxx.addSeries("MSFT",{renderer:"Bars", colored:true});
	 *
	 * @example
	 * // add a series with a candle renderer; using custom colors
	 *stxx.addSeries("MSFT",{renderer:"Candles", fill_color_up:"magenta", border_color_up:"purple", fill_color_down:"lightgreen", border_color_down:"green"});
	 *
	 *@example
	 * // add a series with Histrogram renderer; using default colors
	 * stxx.addSeries('ge', {renderer:"Histogram", color: 'red'});
	 *
	 * @example
	 * // add a series with tension to cause the lines to be curved instead of straight
	 * // 'tension' is a line renderer parameter.
	 * // the renderer:"Lines" parameter could theoretically be omitted since it is the default renderer.
	 * stxx.addSeries('GE',{renderer:"Lines", type:'mountain',color:'yellow',tension:0.3})
	 *
	 * @example
	 * // using equations as symbols, this will display an inverted chart for instrument 'T'
	 * // note the formatter used to change the sign of the axis values
	 * var axis2=new CIQ.ChartEngine.YAxis({position:"left",textStyle:"#FFBE00",priceFormatter:function(stx, panel, price, decimalPlaces){return stx.formatYAxisPrice(price, panel, decimalPlaces)*-1}});
	 * stxx.addSeries("=-1*T", {display:"Test",width:4,renderer:"Lines",color:"#FFBEDD",yAxis:axis2},function(){});
	 *
	 * //this will display the same series in the standard scale.
	 * var axis3=new CIQ.ChartEngine.YAxis({position:"left",textStyle:"#FFBE00"});
	 * stxx.addSeries("T", {display:"Test",width:4,renderer:"Lines",color:"#FFBEDD",yAxis:axis3},function(){});
	 *
	 * @since
	 * <br>&bull; 04-2015 if `isComparison` is true shareYAxis is automatically set to true and setComparison(true) called. createDataSet() and draw() are automatically called to immediately render the series.
	 * <br>&bull; 15-07-01 if `color` is defined and chartStyle is not set then it is automatically set to "line".
	 * <br>&bull; 15-07-01 ability to use setSeriesRenderer().
	 * <br>&bull; 15-07-01 ability to automatically initialize using the quoteFeed.
	 * <br>&bull; 15-07-01 `parameters.quoteFeedCallbackRefresh` no longer used. Instead if `parameters.data.useDefaultQuoteFeed` is set to `true` the series will be initialized and refreshed using the default quote feed. ( Original documentation:  {boolean} [parameters.quoteFeedCallbackRefresh] Set to true if you want the series to use the attached quote feed (if any) to stay in sync with the main symbol as new data is fetched (only available in Advanced package). )
	 * <br>&bull; 2015-11-1 `parameters.symbolObject` is now available
	 * <br>&bull; 05-2016-10  `parameters.forceData` is now available.
	 * <br>&bull; 09-2016-19  `parameters.data.DT` can also take an epoch number.
	 * <br>&bull; 09-2016-19  `parameters.data.useDefaultQuoteFeed` no longer used. If no `parameters.data` is provided the quotefeed will be used.
	 * <br>&bull; 3.0.8  `parameters.forceData` no longer used, now all data sent in will be forced.
	 * <br>&bull; 3.0.8 parameters.loadData added.
	 * <br>&bull; 4.0.0 Added parameters.symbol (string equivalent of parameters.symboObject)
	 * <br>&bull; 4.0.0 Multiple series can now be added for the same underlying symbol. parameters.field or parameters.symbolObject can be used to accomplish this.
	 * <br>&bull; 4.0.0 Added `parameters.baseColor`.
	 * <br>&bull; 5.1.0 Series data now added to masterData as an object.  This allows storage of more than just one data point, facilitating OHLC series!
	 * <br>&bull; 5.1.0 addSeries will now create a renderer unless renderer, name and color parameters are all omitted
	 * <br>&bull; 5.1.0 Now also dispatches a "symbolChange" event when pushing data into the chart, rather than only when using a quote feed.
	 * <br>&bull; 5.1.1 Added `parameters.extendToEndOfDataSet`.
	 * <br>&bull; 5.1.1 `parameters.chartType`, originally used to draw "mountain" series, has been deprecated in favor of the more flexible 'renderer' parameter. It is being maintained for backwards compatibility
	 * <br>&bull; 5.2.0 `parameters.gaps` has been deprecated (but maintained for backwards compatibility) and replaced with `parameters.gapDisplayStyle`
	 * <br>&bull; 6.0.0 `parameters.fillGaps` is now a string type and can accept either "carry" or "gap".  Setting to true will use the value of stxx.cleanupGaps.
	 * <br>&bull; 6.2.0 No longer force 'percent'/'linear', when adding/removing comparison series, respectively, unless {@link CIQ.ChartEngine.Chart#forcePercentComparison} is true. This allows for backwards compatibility with previous UI modules.
	 */
	CIQ.ChartEngine.prototype.addSeries=function(id, parameters, cb){
		var injectionResult=this.runPrepend("addSeries", arguments);
		if(injectionResult) return injectionResult;
		var display=id?id:null; // if id is passed then we default display to the same value (we can always override with parameters.display)
		var symbol=id;
		if(!id) id=CIQ.uniqueID();
		var obj={
			parameters: parameters?CIQ.clone(parameters):{},
			yValueCache: [],
			display: display,
			id: id,
			loading: parameters ? parameters.loadData!==false : true
		 };
		parameters=obj.parameters;
		if(parameters.symbol) symbol=parameters.symbol;
		if(parameters.yAxis) parameters.yAxis=new CIQ.ChartEngine.YAxis(parameters.yAxis);  // in case it gets passed as a plain object

		CIQ.ensureDefaults(parameters, {
			chartName: this.chart.name,
			symbolObject: {symbol:symbol},
			panel: this.chart.panel.name,
			fillGaps: false,
			action: "add-series"
		});
		if("display" in parameters) obj.display=parameters.display;
		if(parameters.isComparison) parameters.shareYAxis=true;
		var chart=this.charts[parameters.chartName];
		var symbolObject=parameters.symbolObject;
		symbol=parameters.symbol=symbolObject.symbol;
		if(!obj.display) obj.display=symbol || parameters.field; // If after all this time, we still don't have a display, then resort to the reasonable alternative of using the symbol or field
		obj.endPoints={};

		// backwards compatability for pre 4.0
		if(!parameters.gapDisplayStyle && parameters.gapDisplayStyle!==false) parameters.gapDisplayStyle=parameters.gaps;
		if(parameters.isComparison) {
			// if gapDisplayStyle parameters isn't defined the gaps will be rendered transparent
			if(parameters.gapDisplayStyle===undefined) parameters.gapDisplayStyle="transparent";
		}

		var existsAlready=this.getSeries({symbolObject: symbolObject, chart:chart, includeMaster: true});

		chart.series[id]=obj;
		var self = this;

		function setUpRenderer(stx,obj){
			var renderer=parameters.renderer || "Lines";
			var name=parameters.name || CIQ.uniqueID();
			if(!parameters.renderer && !parameters.name && !parameters.color && !parameters.chartType) return;  // if no renderer, name, color, nor chartType set, assume will be set later on manual call to attachSeries.
			var r=stx.getSeriesRenderer(name);
			if(!r){
				var params={name:name, overChart:true, useChartLegend:true};
				if(parameters.chartType){
					params=CIQ.extend({panel:parameters.panel, yAxis:parameters.yAxis},params);
					r=CIQ.Renderer.produce(parameters.chartType, params);
				}else{
					CIQ.ensureDefaults(parameters, {
						name: params.name,
						overChart: true,
						useChartLegend: true
					});
					r=new CIQ.Renderer[renderer]({params:parameters});
				}
				if(!r) return;
				stx.setSeriesRenderer(r);
			}
			r.attachSeries(id, parameters);
			if(parameters.loadData!==false) r.ready();
		}

		function handleResponse(params){
			return function(dataCallback){
				if(!dataCallback.error){
					var qts=dataCallback.quotes, fillGaps=parameters.fillGaps;
					if(!self.cleanupGaps) fillGaps=false;  // disable override
					qts=self.doCleanupGaps(qts, self.chart, {cleanupGaps:fillGaps});
					self.updateChartData(qts, self.chart, {secondarySeries:symbol, noCreateDataSet:true, noCleanupDates:true, allowReplaceOHL:true});
					obj.loading=false;
					setUpRenderer(self, obj);
				}
				if(parameters.action!==null && !existsAlready.length) self.dispatch((self.currentlyImporting?"symbolImport":"symbolChange"), {stx:self, symbol: params.symbol, symbolObject:params.symbolObject, action:parameters.action});
				if(cb) cb.call(self, dataCallback.error, obj);
			};
		}

		if(parameters.isComparison && chart.forcePercentComparison && parameters.panel==chart.panel.name && (!parameters.yAxis || parameters.yAxis==chart.yAxis))
			this.setChartScale("percent");
		
		var masterData=chart.masterData;
		if(!masterData) masterData=chart.masterData=this.masterData=[];
		var masterLength=masterData.length;

		if(parameters.data && !parameters.data.useDefaultQuoteFeed /* legacy */) {
			var parms={symbol: symbol, symbolObject:symbolObject, action:parameters.action};
			handleResponse(parms)({quotes:parameters.data});
		}else if(existsAlready.length){
			// This symbol is already in the series
			obj.endPoints=existsAlready[0].endPoints;
			setUpRenderer(this, obj);
			if(cb){
				setTimeout(function(){
					cb.call(self, null, obj);
				},0);
			}
		}else if(this.quoteDriver && parameters.loadData!==false){
			// if we have a quote feed, go and fetch it.
			var driver=this.quoteDriver;
			var fetchParams=driver.makeParams(symbol, symbolObject, chart);
			// for comparisons, you must fetch enough data on the new Comparison to match the beginning of the masterData until the current tick.
			// The current tick may be newer than master data last tick, so set the end Date to right now.
			// If the chart is empty, then don't send any dates and allow the fetch to do an initial load
			if( masterLength ) {
				fetchParams.startDate = masterData[0].DT;
				fetchParams.endDate = this.isHistoricalMode()?masterData[masterData.length-1].DT:new Date();
			}
			if(fetchParams.stx.isEquationChart(fetchParams.symbol)){  //equation chart
				CIQ.fetchEquationChart(fetchParams, handleResponse(fetchParams));
			}else{
				CIQ.ChartEngine.Driver.fetchData(CIQ.QuoteFeed.SERIES, driver.quoteFeed, fetchParams, handleResponse(fetchParams));
			}
		}else{
			// It might get in here if we depend on loadDependents to initialize the series, such as from importLayout
			setUpRenderer(this, obj);
			if(cb) cb.call(this, null, obj);
		}

		this.runAppend("addSeries", arguments);

		return obj;
	};

	/**
	 * Returns an array of series that match the given filters.
	 *
	 * If any series is an equation chart then the equation will be searched for the matching symbol.
	 *
	 * @param  {object} params Parameters
	 * @param {string} [params.symbol] Filter for only series that contain this symbol
	 * @param {object} [params.symbolObject] Filter for only series that contain this symbolObject
	 * @param {boolean} [params.includeMaster] If true then the masterSymbol will be checked for a match too. A blank object will be returned. You should only use this if you're just using this to look for yes/no dependency on a symbol.
	 * @param {CIQ.ChartEngine.Chart} [params.chart] Chart object to target
	 * @return {array}        Array of series descriptors
	 * @memberOf  CIQ.ChartEngine
	 * @since 4.0.0
	 */
	CIQ.ChartEngine.prototype.getSeries=function(params){
		var chart=params.chart?params.chart:this.chart;
		var series=chart.series;
		var symbolObject=params.symbolObject;
		if(!symbolObject) symbolObject={symbol:params.symbol};
		var arr=[];
		for(var id in series){
			var sd=series[id];
			if(CIQ.symbolEqual(symbolObject, sd.parameters.symbolObject)) arr.push(sd);
		}
		if(params.includeMaster){
			if(CIQ.symbolEqual(symbolObject, chart.symbolObject)) arr.push({});
		}
		return arr;
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Modify an existing series. Any passed parameters will extend the existing parameters.
	 *
	 * @param {string|Object} descriptor the series or series id which to modify
	 * @param {Object} [parameters] use this to override any option to addSeries
	 * @memberof CIQ.ChartEngine
	 * @since
	 * <br>&bull; 5.1.1
	 * <br>&bull; 5.2.0 no longer accepts a callback
	 */
	CIQ.ChartEngine.prototype.modifySeries=function(descriptor, parameters) {
		if (this.runPrepend('modifySeries', arguments)) return;
		if (!parameters) return;

		var series;
		var id;
		var chart;

		if (typeof descriptor === 'string') {
			chart = parameters.chartName ? this.charts[parameters.chartName] : this.chart;
			id = descriptor;
			series = chart.series[id];
		} else {
			series = descriptor;
			id = series.id;
			chart = this.charts[series.parameters.chartName];
		}
		if (!series) return;

		CIQ.extend(series.parameters, parameters);

		for (var key in chart.seriesRenderers) {
			var renderer = chart.seriesRenderers[key];
			var seriesParams = renderer.seriesParams;
			for (var i = 0; i < seriesParams.length; ++i) {
				if (seriesParams[i].id === series.id) {
					renderer.attachSeries(id, series.parameters);
					break;
				}
			}
		}

		this.changeOccurred('layout');
		this.runAppend('modifySeries', arguments);
	};

	CIQ.ChartEngine.prototype.isEquationChart=function(symbol){
		if(!this.allowEquations || !CIQ.computeEquationChart) return false;
		if(symbol && symbol[0]=="=") return true;
		return false;
	};

	/**
	 * Returns all the valid data fields in masterData. A valid data field is one
	 * that is in use by a series or one that is in use by the main chart
	 * @param {CIQ.ChartEngine.Chart} [chart] The chart to look in
	 * @return {array} An array of valid price fields
	 * @private
	 * @since 4.0.0
	 */
	CIQ.ChartEngine.prototype.getDataFields=function(chart){
		if(!chart) chart=this.chart;
		var plotField=chart.defaultPlotField || "Close";
		var fields=["Open","High","Low"];
		fields.push(plotField);
		for(var field in chart.series){
			var parameters=chart.series[field].parameters;
			fields.push(parameters.symbol);
		}
		return fields;
	};
	/**
	 * Cleans up the masterData after a series has been removed. This method will remove
	 * the series field from the masterData, only if no other series are dependent on the field.
	 * Once the field is removed, any empty/null masterData points will be removed. Finally,
	 * doCleanGaps will be run again to set masterData back to its original state. createDataSet
	 * is not run from this method
	 * @param  {object} symbolObject A symbol object
	 * @param {CIQ.ChartEngine.Chart} chart The chart to clean
	 * @private
	 * @since 4.0.0
	 */
	CIQ.ChartEngine.prototype.cleanMasterData=function(symbolObject, chart){
		var symbol=symbolObject.symbol;
		var masterData=chart.masterData;

		if(!masterData || !masterData.length) return;

		var fields=this.getDataFields(chart);

		// Returns true is the quote doesn't have any valid data fields
		function empty(quote,fields){
			for(var i=0;i<fields.length;i++){
				var val=quote[fields[i]];
				if(typeof val!="undefined") return false;
			}
			return true;
		}
		// Clean out "zombie" masterData entries. These would be entries that no longer have
		// any valid data. This can happen whenever series have non-overlapping dates.
		var i=0;
		do{
			var quote=masterData[i];
			delete quote[symbol];
			if(empty.call(this, quote, fields)){
				masterData.splice(i,1);
				continue;
			}
			i++;
		}while(i<masterData.length);
		masterData=this.doCleanupGaps(masterData, chart, {noCleanupDates:true}); // todo, remove once setMasterData cleans gaps
		this.setMasterData(masterData, chart, {noCleanupDates:true});
		this.clearCurrentMarketData(chart,symbol);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Removes series data from masterData and unregisters the series from `chart.series` without removing it from any associated renderers.
	 * Also updates the [quoteFeed subscriptions]{@link quotefeed.unsubscribe}.
	 * **Not recommended to be called directly.**
	 * Instead use {@link CIQ.ChartEngine#removeSeries} to remove a series from all associated renderers,
	 * or {@link CIQ.Renderer#removeSeries} to remove a series from a specific renderer.
	 * @param  {string|object} field The name of the series to remove -OR- the series object itself.
	 * @param  {CIQ.ChartEngine.Chart} chart The chart to remove from
	 * @param {object} [params] Parameters
	 * @param {string} [params.action="remove-series"] Action to be dispatched with symbolChange event
	 * @memberOf  CIQ.ChartEngine
	 * @since
	 * <br>&bull; 4.0.0 Now supports passing a series descriptor instead of a field
	 * <br>&bull; 4.0.0 Series data is now totally removed from masterData if no longer used by any other renderers.
	 * <br>&bull; 4.0.0 Empty renderers are now removed when series are removed
	 */
	CIQ.ChartEngine.prototype.deleteSeries=function(field, chart, params){
		if(this.runPrepend("deleteSeries", arguments)) return;
		params=params?params:{};
		var action=params.action?params.action:"remove-series";
		var toRemove;
		if (typeof field === 'object') {
			toRemove = field.id;
			chart = chart || this.charts[field.parameters.chartName];
		} else {
			toRemove = field;
			chart = chart || this.chart;
		}
		var theSeries=chart.series[toRemove];
		if(!theSeries) return; // prevent js error if removing a series that doesn't exist
		var loadedData=theSeries.parameters.loadData;
		var symbolObject=theSeries.parameters.symbolObject;
		delete chart.series[toRemove];

		// If no more dependencies, then remove the symbol from the actual masterData
		var dependencies=this.getSeries({symbolObject: symbolObject, includeMaster: true});
		if(loadedData===false) dependencies.push(toRemove);
		if(!dependencies.length) this.cleanMasterData(symbolObject, chart);

		this.createDataSet();
		if(!dependencies.length) this.dispatch((this.currentlyImporting?"symbolImport":"symbolChange"), {stx:this, symbol:symbolObject.symbol, symbolObject:symbolObject, action:action});
		if(this.quoteDriver) this.quoteDriver.updateSubscriptions();
		this.runAppend("deleteSeries", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Removes a series from all associated renderers in the chart, also removing the actual series data from masterData.
	 * If the series was belonged to a renderer that has no other series attached to it, the renderer is removed.
	 * See {@link CIQ.ChartEngine#deleteSeries} for more details.
	 * <span class="injection">INJECTABLE</span>
	 * @param  {string|object} field The name of the series to remove -OR- the series object itself.
	 * @param  {CIQ.ChartEngine.Chart} [chart] The chart object from which to remove the series
	 * @memberof CIQ.ChartEngine
	 * @since
	 * <br>&bull; 4.0.0 Now supports passing a series descriptor instead of a field
	 * <br>&bull; 4.0.0 Series data is now totally removed from masterData if no longer used by any other renderers.
	 * <br>&bull; 4.0.0 Empty renderers are now removed when series are removed
	 */
	CIQ.ChartEngine.prototype.removeSeries=function(field, chart){
		if(this.runPrepend("removeSeries", arguments)) return;

		var toRemove;
		var deleted = false;

		if (typeof field === 'object') {
			toRemove = field.id;
			chart = chart || this.charts[field.parameters.chartName];
		} else {
			toRemove = field;
			chart = chart || this.chart;
		}

		for(var r in chart.seriesRenderers){
			var renderer=chart.seriesRenderers[r];
			for(var sp=renderer.seriesParams.length-1;sp>=0;sp--){
				var series=renderer.seriesParams[sp];
				if(series.id===toRemove) {
					renderer.removeSeries(toRemove);
					if(renderer.seriesParams.length<1) this.removeSeriesRenderer(renderer);
					deleted=true;
				}
			}
		}
		if(!deleted) this.deleteSeries(toRemove, chart); // just in case the renderer didn't...
		this.resetDynamicYAxis();
		this.draw();
		this.runAppend("removeSeries", arguments);
	};


	//@deprecated, use static version
	CIQ.ChartEngine.prototype.isDailyInterval=function(interval){
		console.warn( 'CIQ.ChartEngine.prototype.isDailyInterval has been deprecated. Use use static version insted');
		return CIQ.ChartEngine.isDailyInterval(interval);

	};


	/**
	 * <span class="injection">INJECTABLE</span>
	 * Sets the data granularity (periodicity) and displays the resulting chart.
	 *
	 * If a quoteFeed has been attached to the chart (see {@link CIQ.ChartEngine#attachQuoteFeed} ) , it will be called to get the new data, otherwise this.dataCallback will
	 * be called in an effort to fetch new data. See {@link CIQ.ChartEngine#dataCallback}. If neither one is set and new data is needed, the function will fail.
	 *
	 * This function can be called together with newChart() by setting the proper parameter values. See example in this section and {@link CIQ.ChartEngine#newChart} for more details and compatibility with your current version.
	 *
	 * The kernel is capable of deriving weekly and monthly charts by rolling-up daily data. Set {@link CIQ.ChartEngine#dontRoll} to true to bypass this
	 * functionality if you have raw week and month data in the masterData.
	 *
	 * It is important to note that by default the weekly roll-ups start on Sunday unless a market definition exists to indicate Sunday is not a market day,
	 * then they are shifted to the next market day. Instructions to set a market for the chart can be found here: {@link CIQ.Market}
	 *
	 * A full tutorial on periodicity and roll-up can be found [here]{@tutorial Periodicity}.
	 *
	 * **See {@link CIQ.ChartEngine#createDataSet} for additional details on the roll-up process including important notes on rolling-up data with gaps.**
	 *
	 * This function will not set how much data you want the chart to show on the screen; for that you can use {@link CIQ.ChartEngine#setRange} or {@link CIQ.ChartEngine#setSpan}.
	 *
	 * **Note on 'tick' timeUnit:**<BR>
	 * When using 'tick', please note that this is not a time based display, as such, there is no way to predict what the time for the next tick will be.
	 * It can come a second later, a minute later or even more depending on how active a particular instrument may be.
	 * If using the future tick functionality ( {@link CIQ.ChartEngine.XAxis#futureTicks} ) when in 'tick' mode, the library uses a pre-defined number (  {@link CIQ.ChartEngine.XAxis#futureTicksInterval} )for deciding what time interval to use for future ticks.
	 * See below example on how to override this default.
	 *
	 * @example
	 * // each bar on the screen will represent 15 minutes (combining 15 1-minute bars from your server)
	 * stxx.setPeriodicity({period:15, timeUnit:"minute"}, function(err){});
	 *
	 * @example
	 * // each bar on the screen will represent 15 minutes (a single 15 minute bar from your server)
	 * stxx.setPeriodicity({period:1, timeUnit:"minute", interval:15}, function(err){});
	 *
	 * @example
	 * // each bar on the screen will represent 30 minutes formed by combining two 15-minute bars; each masterData element represening 15 minutes.
	 * stxx.setPeriodicity({period:2, timeUnit:"minute", interval:15}, function(err){});
	 *
	 * @example
	 * // each bar on the screen will represent 1 tick and no particular grouping will be done.
	 * stxx.setPeriodicity({period:1, timeUnit:"tick"}, function(err){});
	 *
	 * @example
	 * // each bar on the screen will represent 1 day. MasterData elements will represent one day each.
	 * stxx.setPeriodicity({period:1, timeUnit:"day"}, function(err){});
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
	 * 			span:{base:'day', multiplier:2},		// this parameter will cause newChart to call setSpan with these parameters
	 * 			periodicity:{period:1, timeUnit:"minute", interval:5}	// this parameter will cause newChart to call setPeriodicity with these parameters
	 * 		}
	 * );
	 *
	 * @example
	 * //How to override stxx.chart.xAxis.futureTicksInterval when in 'tick' mode:
	 * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
	 * stxx.chart.xAxis.futureTicksInterval=1; // to set to 1 minute, for example
	 *
	 * @param {object} params periodicity arguments
	 * @param {number} params.period The number of elements from masterData to roll-up together into one data point on the chart (candle,bar, etc). If set to 30 in a candle chart, for example, each candle will represent 30 raw elements of `interval/timeUnit` type.
	 * @param {string} [params.timeUnit] Type of data requested. Valid values are "millisecond","second","minute","day","week", "month" or 'tick'. If not set, will default to "minute". ** "hour" is NOT a valid timeUnit. Use `timeUnit:"minute", interval:60` instead**
	 * @param {string} [params.interval] Further qualifies pre-rolled details of intra-day `timeUnits` ("millisecond","second","minute") and will be converted to “1” if used with "day","week" or  "month" 'timeUnit'. Some feeds provide data that is already rolled up. For example, there may be a feed that provides 5 minute bars. To let the chart know you want that 5-minute bar from your feed instead of having the chart get individual 1 minute bars and roll them up, you would set the `interval` to '5' and `timeUnit` to 'minute'
	 * @param {function} [cb] Callback after periodicity is changed. First parameter of callback will be null unless there was an error.
	 * @memberof CIQ.ChartEngine
	 * @since
	 * <br>&bull; 3.0.0 replaces {@link CIQ.ChartEngine#setPeriodicityV2}.
	 * <br>&bull; 4.0.0 now uses {@link CIQ.ChartEngine#needDifferentData} to determine if new data should be fetched.
	 */
	CIQ.ChartEngine.prototype.setPeriodicity=function(params, cb){
		if(this.runPrepend("setPeriodicity", arguments)) return;

		var period, interval, timeUnit=null;
		if(params && typeof(params)=="object"){
			period=params.period;
			interval=params.interval;
			timeUnit=params.timeUnit;
		}else{
			period=params;
			interval=cb;
			cb=arguments[arguments.length-1];
			if(arguments.length>3) timeUnit=arguments[2];
		}
		if(typeof(cb)!=="function") cb=null;

		var internalPeriodicity = CIQ.cleanPeriodicity(period,interval,timeUnit);
		period=internalPeriodicity.period;
		interval=internalPeriodicity.interval;
		timeUnit=internalPeriodicity.timeUnit;

		var layout=this.layout, cw=layout.candleWidth;
		var switchInterval=false;

		layout.setSpan = {}; // No longer in a span if we've set a specific periodicity
		layout.range = {}; // No longer in a range if we've set a specific periodicity

		this.chart.inflectionPoint=null;  // reset where the consolidation occurs from
		var getDifferentData=false;

		if(this.chart.symbol){
			getDifferentData=this.needDifferentData({period:period,interval:interval,timeUnit:timeUnit});
		}

		layout.periodicity=period;
		layout.interval=interval;
		layout.timeUnit=timeUnit;

		if(getDifferentData){
			this.changeOccurred("layout");
			this.clearCurrentMarketData();
			if(this.quoteDriver){
				for(var c in this.charts){
					var thisChart=this.charts[c];
					if(thisChart.symbol){
						if(this.displayInitialized){
							this.quoteDriver.newChart({symbol:thisChart.symbol, symbolObject: thisChart.symbolObject, chart:thisChart}, cb);
						}else{
							this.newChart(thisChart.symbol,null,thisChart,cb);
						}
					}
				}
			} else if(this.dataCallback){
				this.dataCallback();
				if(cb) cb(null);
			} else {
				console.log("cannot change periodicity because neither dataCallback or quoteDriver are set");
			}
			this.home();
			return;
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
							chart.scroll=(dataSetLength-1-i)+pos;
							break;
						}
					}
				}
			}else if(!rightAligned){
				var wsInTicks=Math.round(this.preferences.whitespace/cw);
				chart.scroll=maxTicks-wsInTicks-1;			// Maintain the same amount of left alignment
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
		this.home();
		if(cb) cb(null);
		this.runAppend("setPeriodicity", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * **Legacy** function to set the periodicity and interval for the chart.
	 *
	 * **Replaced by {@link CIQ.ChartEngine#setPeriodicity}, but maintained for backwards comparibility. Uses same function signature.**
	 *
	 * @param {number} period The number of elements from masterData to roll-up together into one data point on the chart (one candle, for example). If set to 30 in a candle chart, for example, each candle will represent 30 raw elements of `interval` type.
	 * @param {string} interval The type of data to base the `period` on. This can be a numeric value representing minutes, seconds or millisecond as inicated by `timeUnit`, "day","week", "month" or 'tick' for variable time x-axis. ** "hour" is NOT a valid interval.** (This is not how much data you want the chart to show on the screen; for that you can use {@link CIQ.ChartEngine#setRange} or {@link CIQ.ChartEngine#setSpan})
	 * @param {string} [timeUnit] Time unit to further qualify the specified numeric interval. Valid values are "millisecond","second","minute",null. If not set, will default to "minute". ** only applicable and used on numeric intervals**
	 * @param {function} [cb] Callback after periodicity is changed. First parameter of callback will be null unless there was an error.
	 * @memberof CIQ.ChartEngine
	 * @since
	 * <br>&bull; 2015-11-1 `second` and `millisecond` periodicities are now supported by setting the `timeUnit` parameter.
	 * <br>&bull; 3.0.0 Replaced by {@link CIQ.ChartEngine#setPeriodicity}, but maintained for backwards comparibility.
	 * @private
	 */
	CIQ.ChartEngine.prototype.setPeriodicityV2=function(period, interval, timeUnit, cb){
		if(typeof timeUnit==="function"){
			cb=timeUnit; // backward compatibility
			timeUnit=null;
		}
		if(this.runPrepend("setPeriodicityV2", arguments)) return;
		this.setPeriodicity(period, interval, timeUnit, cb);
		this.runAppend("setPeriodicityV2", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * <span class="animation">Animation Loop</span>
	 * Draws the drawings (vectors). Each drawing is iterated and asked to draw itself. Drawings are automatically
	 * clipped by their containing panel.
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias drawVectors
	 */
	CIQ.ChartEngine.prototype.drawVectors=function(){
		if(this.vectorsShowing) return;
		if(this.runPrepend("drawVectors", arguments)) return;
		this.vectorsShowing=true;
		if(!this.chart.hideDrawings){
			var tmpPanels={};
			// First find all the existing panels in the given set of drawings (excluding those that aren't displayed)
			var panelName,i;
			for(i=0;i<this.drawingObjects.length;i++){
				var drawing=this.drawingObjects[i];
				if(this.repositioningDrawing===drawing) continue; // don't display a drawing that is currently being repositioned because it will show on the tempCanvas
				panelName=drawing.panelName;
				if(!this.panels[drawing.panelName] || this.panels[drawing.panelName].hidden) continue;	// drawing from a panel that is not enabled
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
	 * Displays the chart by calling the appropriate rendering functions based on the <a href="CIQ.ChartEngine.html#layout%5B%60chartType%60%5D">CIQ.ChartEngine.layout.chartType</a>.
	 *
	 * @param  {CIQ.ChartEngine.Chart} chart The chart to render
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias displayChart
	 * @since 4.0.0 if no Open price is available, a candle will draw as a dash at the Close price.
	 * @since 5.1.0 reduced to injections only for backwards compatibility, main chart is drawn with renderers now
	 */
	CIQ.ChartEngine.prototype.displayChart=function(chart){
		if(this.runPrepend("displayChart", arguments)) return;
		this.rendererAction(chart, "main");
		this.runAppend("displayChart", arguments);
	};

	/**
	 * Calculates the ATR (Average True Range) for the dataSet
	 * @private
	 * @param  {CIQ.ChartEngine.Chart} chart The chart to calculate
	 * @param  {number} period The number of periods
	 * @param  {array} data The data to process, if omitted, uses chart.dataSet
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.calculateATR=function(chart,period,data){
		if(!data) data=chart.dataSet;
		var state=chart.state.calculations.atr;
		if(!state) state=chart.state.calculations.atr={};
		if(!period) period=20;
		var accum=[];
		if(state.accum) accum=state.accum;
		var q1;
		for(var i=0;i<data.length;i++){
			var q=data[i];
			q1=i?data[i-1]:state.q1;
			if(!q1) continue;

			var trueRange=Math.max(
				q.High-q.Low,
				Math.abs(q.High-q1.Close),
				Math.abs(q.Low-q1.Close)
			);
			if(accum.length<period){
				if(accum.push(trueRange)==period) {
					var total=0;
					for(var j=0;j<accum.length;j++) total+=accum[j];
					q.atr=total/period;
				}
			}else{
				q.atr=(q1.atr*(period-1)+trueRange)/period;
			}
			q.trueRange=trueRange;
		}
		chart.state.calculations.atr={
			accum:accum,
			q1:q1
		};
	};

	/**
	 * Calculates the Median Price for the dataSet.
	 * @private
	 * @param {CIQ.ChartEngine.Chart} chart The chart to update.
	 * @param {array} data The data to process, if omitted, uses chart.dataSet
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.calculateMedianPrice = function(chart,data) {
		if(!data) data=chart.dataSet;
		var d;
		for (var i = 0; i < data.length; ++i) {
			d = data[i];
			d["hl/2"] = (d.High + d.Low) / 2;
		}
	};

	/**
	 * Calculates the Typical Price for the dataSet.
	 * @private
	 * @param {CIQ.ChartEngine.Chart} chart The chart to update.
	 * @param {array} data The data to process, if omitted, uses chart.dataSet
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.calculateTypicalPrice = function(chart,data) {
		if(!data) data=chart.dataSet;
		var d;
		for (var i = 0; i < data.length; ++i) {
			d = data[i];
			d["hlc/3"] = (d.High + d.Low + d.Close) / 3;
		}
	};

	/**
	 * Calculates the Weighted Close for the dataSet.
	 * @private
	 * @param {CIQ.ChartEngine.Chart} chart The chart to update.
	 * @param {array} data The data to process, if omitted, uses chart.dataSet
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.calculateWeightedClose = function(chart,data) {
		if(!data) data=chart.dataSet;
		var d;
		for (var i = 0; i < data.length; ++i) {
			d = data[i];
			d["hlcc/4"] = (d.High + d.Low + 2 * d.Close) / 4;
		}
	};

	/**
	 * Calculates the (Open + High + Low + Close) / 4 for the dataSet.
	 * @private
	 * @param {CIQ.ChartEngine.Chart} chart The chart to update.
	 * @param {array} data The data to process, if omitted, uses chart.dataSet
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.calculateOHLC4 = function(chart,data) {
		if(!data) data=chart.dataSet;
		var d;
		for (var i = 0; i < data.length; ++i) {
			d = data[i];
			d["ohlc/4"] = (d.Open + d.High + d.Low + d.Close) / 4;
		}
	};

	/**
	 * Returns the current quote (the final element in the dataSet).
	 * @return {object} The most recent quote
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.currentQuote=function(){
		if(!this.chart.dataSet) return null;
		for(var i=this.chart.dataSet.length-1;i>=0;i--)
			if(this.chart.dataSet[i])
				return this.chart.dataSet[i];
		return null;
	};

	/**
	 * Returns the last valid Close found in the dataSet.
	 * This would be any numeric value
	 * @param {string} field Optional object to check Close within, such as with a series
	 * @return {number} The most recent close
	 * @memberof CIQ.ChartEngine
	 * @since 6.1.0
	 */
	CIQ.ChartEngine.prototype.mostRecentClose=function(field){
		if(!this.chart.dataSet) return null;
		for(var i=this.chart.dataSet.length-1;i>=0;i--){
			var ret=this.chart.dataSet[i];
			if(!ret) continue;
			if(field){
				ret=ret[field];
				if(!ret && ret!==0) continue;
			}
			var iqPrevClose=ret.iqPrevClose;
			if(typeof(ret)=="object") ret=ret.Close;
			if(typeof(ret)=="number") return ret;
			if(typeof(iqPrevClose)=="number") return iqPrevClose;
		}
		return null;
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * <span class="animation">Animation Loop</span>
	 * This method ensures that the chart is not scrolled off of either of the vertical edges.
	 * See {@link CIQ.ChartEngine#minimumLeftBars}, {@link CIQ.ChartEngine.Chart#allowScrollPast}, and {@link CIQ.ChartEngine.Chart#allowScrollFuture} for adjustments to defaults.
	 * @param  {CIQ.ChartEngine.Chart} theChart The chart to check
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias correctIfOffEdge
	 */
	CIQ.ChartEngine.prototype.correctIfOffEdge=function(theChart){
		if(this.runPrepend("correctIfOffEdge", arguments)) return;
		for(var chartName in this.charts){
			var chart=this.charts[chartName], dataSet=chart.dataSet, maxTicks=chart.maxTicks, layout=this.layout;

			var minimumLeftBars = this.minimumLeftBars;
			if((!this.mainSeriesRenderer || !this.mainSeriesRenderer.standaloneBars) && !this.standaloneBars[layout.chartType]) {
				//[Gus]
				//since lines display at the middle of the bar insted of the edge, we deduct one to allow for the 1/2 bar to still be considered or it will try to flush incorrectly.
				//this logic may need to change if we modify home() to use the same logic for micropixel as the manual drag.
				//drag sets one more scroll with a negative micropixel to offset the right edge, but home() uses the actual scroll with a positive micropixel.
				minimumLeftBars--;
			}

			var leftPad= Math.min( minimumLeftBars,maxTicks);  // in case the minimumLeftBars is larger than what we can display
			if(chart.allowScrollPast){	// allow scrolling from left to right, creating white space on either side
				var rightPad=maxTicks-leftPad;
				if(leftPad>dataSet.length){
					rightPad=maxTicks-dataSet.length;
				}
				if(chart.scroll-rightPad>=dataSet.length){
					chart.scroll=dataSet.length+rightPad-1;
					this.micropixels=0;
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
			if(chart.allowScrollFuture===false){
				var whitespace=this.getLabelOffsetInPixels(chart,layout.chartType)+layout.candleWidth*chart.whiteSpaceFutureTicks;
				var barsOnScreen=maxTicks-Math.round(whitespace/layout.candleWidth)-1;
				var scroll= (this.micropixels < 0 ? chart.scroll-1 : chart.scroll);
				if(scroll<barsOnScreen){
					chart.scroll= barsOnScreen;
					this.micropixels=0;
				}
			}
			if(this.manageTouchAndMouse) {
				if(this.controls.chartControls) this.controls.chartControls.style.display="block";
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
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias createDataSegment
	 */
	CIQ.ChartEngine.prototype.createDataSegment=function(theChart){
		if(this.runPrepend("createDataSegment", arguments)) return;
		var chart;
		for(var chartName in this.charts){
			chart=this.charts[chartName];
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
			var dataSegmentStartsOneBack=baseline.includeInDataSegment && (!this.mainSeriesRenderer || !this.mainSeriesRenderer.standaloneBars) && !this.standaloneBars[layout.chartType];
			var quote;
			var dataSegment=chart.dataSegment=[];
			var position=(dataSet.length-1) - scroll - 1; // One more to deal with -1 case
			var prevField=chart.defaultPlotField;
			for(var i=-1;i<scroll && i<maxTicks;i++){
				position++;
				if(i==-1 && !dataSegmentStartsOneBack) continue;
				if(position<dataSet.length && position>=0){
					quote=dataSet[position];
					quote.candleWidth=null;
					dataSegment.push(quote);
					if(baseline.actualLevel===null && i>=0){
						if(prevField && prevField!="Close"){
							var q1=dataSet[position-1];
							if(q1 && (q1[prevField] || q1[prevField]===0))
								baseline.actualLevel=q1[prevField];
						}else{
							if(quote.iqPrevClose || quote.iqPrevClose===0)
								baseline.actualLevel=quote.iqPrevClose;
						}
					}
				}else if(position<0){
					dataSegment.push(null);
				}
			}
			chart.segmentImage=null;
			var mainSeriesRenderer=this.mainSeriesRenderer || {};
			if(mainSeriesRenderer.params && mainSeriesRenderer.params.volume){
				var totalVolume=0;
				var workingWidth=chart.width - (maxTicks-dataSegment.length-1)*layout.candleWidth;
				for(var v=0;v<dataSegment.length;v++){
					quote=dataSegment[v];
					if(quote) totalVolume+=quote.Volume;
				}
				var accumOffset=0;
				chart.segmentImage=[];
				for(var w=0;w<dataSegment.length;w++){
					quote=dataSegment[w];
					chart.segmentImage[w]={};
					var leftOffset=null;
					if(quote){
						if(quote.Volume){
							quote.candleWidth=workingWidth*quote.Volume/totalVolume;
							leftOffset=accumOffset+quote.candleWidth/2;
							accumOffset+=quote.candleWidth;
						}else{
							quote.candleWidth=cw;
							leftOffset=accumOffset+cw/2;
							accumOffset+=cw;
						}
						chart.segmentImage[w]={
							tick: quote.tick,
							candleWidth: quote.candleWidth,
							leftOffset: leftOffset
						};
					}else{
						accumOffset+=cw;
					}
				}
			}
			if(theChart) break;
		}
		if(chart && chart.isComparison) this.clearPixelCache();
		this.positionCrosshairsAtPointer();
		this.runAppend("createDataSegment", arguments);
	};

	/**
	 * Returns the visible portion of the dataSegment.  A bar is considered visible if its midpoint is within the chart window.
	 * This is different than chart.dataSegment which includes any partially visible candles.
	 * @param  {CIQ.ChartEngine.Chart} [chart] Chart from which to return the dataSegment
	 * @returns {array} The visible bars of the dataSegment
	 * @memberof CIQ.ChartEngine
	 * @since 5.2.0
	 */
	CIQ.ChartEngine.prototype.getDataSegment=function(chart){
		if(!chart) chart=this.chart;
		var dataSegment=chart.dataSegment;
		if(!dataSegment || !dataSegment.length) return [];
		var left=0;right=dataSegment.length;
		if(this.pixelFromBar(left,chart)<chart.panel.left) left++;
		if(this.pixelFromBar(right-1,chart)>chart.panel.right) right--;
		return dataSegment.slice(left,right);
	};

	/**
	 * Returns the tick position of the leftmost position on the chart.
	 * @return {number} The tick for the leftmost position
	 * @memberof CIQ.ChartEngine
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
	 * @memberof CIQ.ChartEngine
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
	 * Scrolls the chart so that the leftmost tick is the requested date.
	 * The date must be an exact match and data for that bar must already be loaded in the chart.
	 * There is no effect if the date is not found an the engine will not attempt to fetch more data.
	 * @param {date} dt The requested date
	 * @memberof CIQ.ChartEngine
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
	 * Creates a floating label on the y-axis unless {@link CIQ.ChartEngine.YAxis#drawPriceLabels} is false.
	 * This can be used for any panel and called multiple times to add multiple labels
	 *
	 * Style: stx_yaxis ( font only )
	 *
	 * @param  {CIQ.ChartEngine.Panel} panel			The panel on which to print the label
	 * @param  {string} txt				The text for the label
	 * @param  {number} y				The Y position on the canvas for the label. This method will ensure that it remains on the requested panel.
	 * @param  {string} backgroundColor The background color for the label.
	 * @param  {string} color			The text color for the label. If none provided then white is used, unless the background is white in which case black is used.
	 * @param  {external:CanvasRenderingContext2D} [ctx]		 The canvas context to use, defaults to the chart
	 * @param {CIQ.ChartEngine.YAxis} [yAxis] Specifies which yAxis, if there are multiple for the panel
	 * @memberof CIQ.ChartEngine
	 * @since 3.0.0 - Moved text rendering to {@link CIQ.createLabel}
	 */
	CIQ.ChartEngine.prototype.createYAxisLabel=function(panel, txt, y, backgroundColor, color, ctx, yAxis){
		if( panel.yAxis.drawPriceLabels === false || panel.yAxis.noDraw) return;
		var yax=yAxis?yAxis:panel.yAxis;
		if(yax.noDraw || !yax.width) return;
		var context=ctx?ctx:this.chart.context;
		var margin=3;
		var height=this.getCanvasFontSize("stx_yaxis")+margin*2;
		this.canvasFont("stx_yaxis", context);
		var drawBorders=yax.displayBorder;
		var tickWidth=this.drawBorders?3:0; // pixel width of tick off edge of border
		var width;
		try{
			width=context.measureText(txt).width+tickWidth+margin*2;
		}catch(e){ width=yax.width;} // Firefox doesn't like this in hidden iframe

		var x=yax.left-margin + 3;
		if( yax.width < 0 ) x+=(yax.width-width);
		var textx=x+margin+tickWidth;
		var radius=3;
		var position=(yax.position===null?panel.chart.yAxis.position:yax.position);
		if(position==="left"){
			x=yax.left + yax.width + margin - 3;
			width=width*-1;
			if( yax.width < 0 ) x-=(yax.width+width);
			textx=x-margin-tickWidth;
			radius=-3;
			context.textAlign="right";
		}
		if(y+(height/2)>yax.bottom) y=yax.bottom-(height/2);
		if(y-(height/2)<yax.top) y=yax.top+(height/2);

		if(typeof(CIQ[this.yaxisLabelStyle]) == 'undefined') {
			this.yaxisLabelStyle="roundRectArrow";	// in case of user error, set a default.
		}
		var yaxisLabelStyle=this.yaxisLabelStyle;
		if(yax.yaxisLabelStyle) yaxisLabelStyle=yax.yaxisLabelStyle;
		var params = {
			ctx:context,
			x:x,
			y:y,
			top:y-(height/2),
			width:width,
			height:height,
			radius:radius,
			backgroundColor:backgroundColor,
			fill:true,
			stroke:false,
			margin:{left:textx-x,top:1},
			txt:txt,
			color:color
		};
		CIQ[yaxisLabelStyle](params);

	};

	/**
	 * Creates a label on the x-axis. Generally used for drawing labels.
	 *
	 * Note: **This is not used for the floating crosshair date label which is styled using `stx-float-date` ** See {@link CIQ.ChartEngine.AdvancedInjectable#updateChartAccessories} and {@link CIQ.ChartEngine.AdvancedInjectable#headsUpHR} for more details
	 *
	 * Label style: `stx-float-date` ( font only )
	 *
	 * @param  {CIQ.ChartEngine.Panel} panel			The panel on which to print the label
	 * @param  {string} txt				The text for the label
	 * @param  {number} x				The X position on the canvas for the label. This method will ensure that it remains on the requested panel.
	 * @param  {string} backgroundColor The background color for the label.
	 * @param  {string} color			The foreground color for the label. If none provided then white is used, unless the background is white in which case black is used.
	 * @param  {boolean} pointed		True to put an arrow above the label
	 * @memberof CIQ.ChartEngine
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
		CIQ.roundRect({ctx:context, x:x-(width/2), top:y, width:width, height:height, radius:3, fill:true});
		var arrowHeight=panel.bottom-panel.yAxis.bottom-height;
		context.beginPath();
		if(pointed){
			context.moveTo(x - arrowHeight, y);
			context.lineTo(x, y - arrowHeight - 1);
			context.lineTo(x + arrowHeight, y);
			context.closePath();
			context.fill();
		}else{
			context.moveTo(x , y);
			context.lineTo(x, y - arrowHeight);
			context.strokeStyle=backgroundColor;
			context.stroke();
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
	 * Draws a label for the last price <b>in the main chart panel's y-axis</b> using {@link CIQ.ChartEngine#createYAxisLabel}
	 *
 	 * It will also draw a horizontal price line if <a href="CIQ.ChartEngine.html#preferences%5B%60currentPriceLine%60%5D">CIQ.ChartEngine.preferences.currentPriceLine</a> is true.
	 *
	 * It will not draw a line or a label if {@link CIQ.ChartEngine.YAxis#drawCurrentPriceLabel} is false for that particular axis.
	 *
	 * Label style: `stx_current_hr_down` and `stx_current_hr_up`
	 *
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias drawCurrentHR
	 */
	CIQ.ChartEngine.prototype.drawCurrentHR=function(){
		if(this.runPrepend("drawCurrentHR", arguments)) return;
		var backgroundColor, color;
		var mainSeriesRenderer=this.mainSeriesRenderer || {};
		if(mainSeriesRenderer.noCurrentHR) return;
		var highLowBars=mainSeriesRenderer.highLowBars || this.highLowBars[this.layout.chartType];
		for(var chartName in this.charts){
			var chart=this.charts[chartName];
			var panel=chart.panel;
			var yAxis=panel.yAxis;
			if(panel.hidden) continue;
			if(yAxis.drawCurrentPriceLabel===false || yAxis.noDraw) continue;
			if(!mainSeriesRenderer.params) continue;
			var whichSet=yAxis.whichSet;
			if(!whichSet) whichSet="dataSet";
			if(this.isHistoricalModeSet && whichSet!=="dataSegment") continue;
			var l=chart[whichSet].length, cw=this.layout.candleWidth;
			if(whichSet=="dataSegment") {
				//this crazy equation just to find the last bar displaying at least 50% on the screen
				while(l>(chart.width-this.micropixels+(cw)/2+1)/cw) l--;
			}
			if(l && chart[whichSet][l-1]){
				var field=chart.defaultPlotField;
				if(!field || highLowBars) field="Close";
				var prevClose, currentClose;
				do{
					prevClose=chart[whichSet][--l][field];
					currentClose=prevClose;
					if(l===0) break;
				}while(currentClose===null);
				if(whichSet=="dataSet" && chart.currentQuote){
					currentClose=chart.currentQuote[field];
				}else if(chart[whichSet].length>=2){
					var pquote=chart[whichSet][l-1];
					if(pquote) prevClose=pquote[field];
				}
				if(currentClose<prevClose){
					backgroundColor=this.canvasStyle("stx_current_hr_down").backgroundColor;
					color=this.canvasStyle("stx_current_hr_down").color;
				}else{
					backgroundColor=this.canvasStyle("stx_current_hr_up").backgroundColor;
					color=this.canvasStyle("stx_current_hr_up").color;
				}
				if(chart.transformFunc) currentClose=chart.transformFunc(this,chart,currentClose);
				var txt;
				// If a chart panel, then always display at least the number of decimal places as calculated by masterData (panel.chart.decimalPlaces)
				// but if we are zoomed to high granularity then expand all the way out to the y-axis significant digits (panel.yAxis.printDecimalPlaces)
				var labelDecimalPlaces=Math.max(panel.yAxis.printDecimalPlaces, panel.chart.decimalPlaces);
				//	... and never display more decimal places than the symbol is supposed to be quoting at
				if(yAxis.maxDecimalPlaces || yAxis.maxDecimalPlaces===0) labelDecimalPlaces=Math.min(labelDecimalPlaces, yAxis.maxDecimalPlaces);
				if(yAxis.priceFormatter){
					txt=yAxis.priceFormatter(this, panel, currentClose, labelDecimalPlaces);
				}else{
					txt=this.formatYAxisPrice(currentClose, panel, labelDecimalPlaces);
				}

				var y=this.pixelFromTransformedValue(currentClose, panel);
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
	 * @memberof CIQ.ChartEngine
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
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.startAsyncAction=function(){
		if(!this.pendingAsyncs) this.pendingAsyncs=[];
		this.pendingAsyncs.push(true);
	};

	/**
	 * Registers a callback for when the chart has been drawn
	 * @param  {function} fc The function to call
	 * @return {object} An object that can be passed in to {@link CIQ.ChartEngine#unregisterChartDrawnCallback}
	 * @memberof CIQ.ChartEngine
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
	 * @param  {object} fc An object from {@link CIQ.ChartEngine#registerDrawnCallback}
	 * @memberof CIQ.ChartEngine
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
	 * @memberof CIQ.ChartEngine
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
	 * @memberof CIQ.ChartEngine
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
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.draw=function(){
		this.debug();
		if(!this.chart.canvas) return;
		if(!this.chart.dataSet) return;
		if(!this.chart.canvasHeight) return;
		//if(!this.useAnimation && new Date()-this.grossDragging<500) return;

		this.offset=this.layout.candleWidth*this.candleWidthPercent/2;
		CIQ.clearCanvas(this.chart.canvas, this);
		if(!this.masterData) return;
		if(!this.masterData.length && !this.chart.currentMarketData.touched) return;

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
			this.drawXAxis(chart, axisRepresentation);
			try {
				this.renderYAxis(chart);
			} catch (e) {
				if (e && e.message === 'reboot draw') {
					return this.draw();
				}

				throw e;
			}

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

			if(this.chart.legend) this.chart.legend.colorMap=null;
			if(this.controls.baselineHandle) this.controls.baselineHandle.style.display="none";

			this.rendererAction(chart, "underlay");
			if(CIQ.Studies) CIQ.Studies.displayStudies(this, chart, true);
			this.displayChart(chart);
			if(CIQ.Studies) CIQ.Studies.displayStudies(this, chart, false);
			this.rendererAction(chart, "overlay");

			if(chart.legend && chart.legend.colorMap && chart.legendRenderer ){
				chart.legendRenderer(this, {
					"chart": chart,
					"legendColorMap": chart.legend.colorMap,
					"coordinates":{
						x:chart.legend.x,
						y:chart.legend.y+chart.panel.yAxis.top
					}
				});
			}
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
			var labelParams=this.yAxisLabels[yLbl];
			if(labelParams.src=="series" && labelParams.args[6] && labelParams.args[6].drawSeriesPriceLabels===false) continue;
			this.createYAxisLabel.apply(this,labelParams.args);
		}
		this.createCrosshairs();	//todo, move out of animation loop
		this.drawVectors();
		this.drawCurrentHR();
		this.displayInitialized=true;
		if(this.controls.home){
			this.controls.home.style.display="none";
			if(this.manageTouchAndMouse && !this.isHome())
				this.controls.home.style.display="block";
		}
		this.positionMarkers();
		for(chartName in this.charts){
			chart=this.charts[chartName];
			if(this.quoteDriver && !this.animations.zoom.running){
				this.quoteDriver.checkLoadMore(chart);
			}
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
	 * @memberof CIQ.ChartEngine
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

		if(!this.useBackingStore){
			this.devicePixelRatio=this.adjustedDisplayPixelRatio=1;
			return;
		}
		if (!CIQ.isAndroid || CIQ.is_chrome || CIQ.isFF) {
			var oldWidth = canvas.width;
			var oldHeight = canvas.height;

			canvas.width = oldWidth * ratio;
			canvas.height = oldHeight * ratio;

			canvas.style.width = oldWidth + 'px';
			canvas.style.height = oldHeight + 'px';

			context.scale(ratio, ratio);
			this.adjustedDisplayPixelRatio=ratio;
			this.backing={
				ratio: ratio,
				width: canvas.width,
				height: canvas.height,
				styleWidth: oldWidth,
				styleHeight: oldHeight
			};
		}
	};

	CIQ.ChartEngine.prototype.reconstituteBackingStore=function(){
		if(!this.useBackingStore) return;
		var canvas=this.chart.canvas;
		if(canvas.width==this.backing.width) return;

		canvas.width = this.backing.width;
		canvas.height = this.backing.height;

		canvas.context.scale(this.backing.ratio, this.backing.ratio);
		this.adjustedDisplayPixelRatio=this.backing.ratio;
		this.draw();
	};

	CIQ.ChartEngine.prototype.disableBackingStore=function(){
		if(!this.useBackingStore) return;
		var canvas=this.chart.canvas;
		if(canvas.width==this.backing.styleWidth) return;

		canvas.width = this.backing.styleWidth;
		canvas.height = this.backing.styleHeight;

		canvas.context.scale(1, 1);
		this.adjustedDisplayPixelRatio=1;
		this.draw();
	};

	/**
	 * This method resizes the canvas to the dimensions of the containing div. This is called primarily
	 * by {@link CIQ.ChartEngine#resizeChart} and also when the chart is initialized (via newChart).
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.resizeCanvas=function(){
		var canvas=this.chart.canvas;
		var context=this.chart.context;
		if(canvas && context){
			this.floatCanvas.height=this.chart.tempCanvas.height=canvas.height=this.chart.container.clientHeight;
			this.floatCanvas.width=this.chart.tempCanvas.width=canvas.width=this.chart.container.clientWidth;
			this.adjustBackingStore(canvas, context);
			this.adjustBackingStore(this.chart.tempCanvas, this.chart.tempCanvas.context);
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

			this.setCandleWidth(candleWidth, chart);
			if(chart.scroll<chart.width/candleWidth){
				chart.scroll=Math.floor(chart.width/candleWidth);
				var wsInTicks=Math.round(this.preferences.whitespace/this.layout.candleWidth);
				chart.scroll-=wsInTicks;
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
	 * @memberof CIQ.ChartEngine
	 * @example
	 * stxx.setCandleWidth(10);
	 * stxx.home();	// home() is preferred over draw() in this case to ensure the chart is properly aligned to the right most edge.

	 */
	CIQ.ChartEngine.prototype.setCandleWidth=function(newCandleWidth, chart){
		if(!chart) chart=this.chart;
		if(newCandleWidth<this.minimumCandleWidth) newCandleWidth=this.minimumCandleWidth;
		this.layout.candleWidth=newCandleWidth;
		//chart.maxTicks=Math.ceil(this.chart.width/newCandleWidth+0.5); // we add half of a candle back in because lines and mountains only draw to the middle of the bar
		chart.maxTicks=Math.round(chart.width/newCandleWidth)+1;
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Resizes the chart and adjusts the panels. The chart is resized to the size of the container div by calling
	 * {@link CIQ.ChartEngine#resizeCanvas}. This method is called automatically if a screen resize event occurs. The charting
	 * engine also attempts to detect size changes whenever the mouse is moved. Ideally, if you know the chart is being
	 * resized, perhaps because of a dynamic change to the layout of your screen, you should call this method manually.
	 * @param {boolean} [maintainScroll=true] By default the scroll position will remain pegged on the right side of the chart. Set this to false to override.
	 * @memberof CIQ.ChartEngine
	 * @since  2015-11-1 resizeChart now automatically retains scroll position
	 * @since  09-2016-19 resizeChart now also manages the resizing of the crosshairs.
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
	 * This is the method that should be called every time a new chart needs to be drawn for a different instrument and
	 * there is no need to destroy the chart to change the data on it. Simply call this method again.
	 *
	 * Note that before using this method you must first instantiate the chart and assign it to a DOM container using [`stxx=new CIQ.ChartEngine({container: $$$(".chartContainer")});`]{@link CIQ.ChartEngine}
	 *
	 * @param  {string|object}			symbol			The symbol or equation for the new chart - a symbol string, equation or an object representing the symbol can be used.
	 * 													<br>After the new chart is initialized, it will contain both a symbol string (stxx.chart.symbol) and a symbol object (stxx.chart.symbolObject).
	 * 													<br>You can send anything you want in the symbol object, but you must always include at least a 'symbol' element. Both these variables will be available for use wherever the {@link CIQ.ChartEngine.Chart} object is present. For example, if using the [fetch()]{@link CIQ.QuoteFeed#fetch} method for gathering data, params.stx.chart.symbolObject will contain your symbol object.
	 * 													<br>To allow equations to be used on a chart, the {@link CIQ.ChartEngine#allowEquations} parameter must be set to `true` and the equation needs to be preceded by an equals sign (=) in order for it to be parsed as an equation.
	 * 													<br>See {@link CIQ.formatEquation} and {@link CIQ.computeEquationChart} for more details on allowed equations syntax.
	 * @param  {array}					[masterData]	An array of [properly formated OHLC objects](index.html#data-format) to create a chart. Each element should at a minimum contain a "Close" field (capitalized).
	 *													If the charting engine has been configured to use a [QuoteFeed]{@link CIQ.ChartEngine#attachQuoteFeed}
	 *													then masterData does not need to be passed in. The quote feed will be queried instead.
	 * @param  {CIQ.ChartEngine.Chart}	chart]			Which chart to create. Defaults to the default chart.
	 * @param {function}				[cb]			Callback when newChart is loaded. See {@tutorial Adding additional content on chart} for a tutorial on how to use this callback function.
	 * @param {object} 					[params] 		Parameters to dictate initial rendering behavior
	 * @param {Object} 					[params.range]	Default range to be used upon initial rendering. If both `range` and `span` parameters are passed in, range takes precedence. If periodicity is not set, the range will be displayed at the most optimal periodicity. See {@link CIQ.ChartEngine#setRange} for complete list of parameters this object will accept.
	 * @param {object} 					[params.span]	Default span to display upon initial rendering. If both `range` and `span` parameters are passed in, range takes precedence. If periodicity is not set, the span will be displayed at the most optimal periodicity. See {@link CIQ.ChartEngine#setSpan} for complete list of parameters this object will accept.
	 * @param {object} 					[params.periodicity]	Default periodicity to be used upon initial rendering. See {@link CIQ.ChartEngine#setPeriodicity} for complete list of parameters this object will accept.
	 * @param {boolean} 				[params.stretchToFillScreen] Increase the candleWidth to fill the left-side gap created by a small dataSet. Respects <a href="CIQ.ChartEngine.html#preferences%5B%60whitespace%60%5D">CIQ.ChartEngine.preferences.whitespace</a>. Ignored when params `span` or `range` are used.
	 * @memberof CIQ.ChartEngine
	 * @example
	 	// using a symbol object and embedded span and periodicity requirements
	 	stxx.newChart(
		 	{symbol:newSymbol,other:'stuff'},
		 	null,
		 	null,
		 	callbackFunction(stxx.chart.symbol, newSymbol),
		 	{
		 		span:{base:'day',multiplier:2},
		 		periodicity:{period:1,interval:5,timeUnit:'minute'},
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
	 * @example
	 	// using an equation string
	 	stxx.newChart(
		 	"=2*IBM-GM",
		 	null,
		 	null,
		 	callbackFunction(stxx.chart.symbol, newSymbol)
	 	);
	 *
	 * @since
	 * <br> 2015-11-1 newChart is capable of setting periodicity and span via `params` settings
	 * <br> 04-2016-08 `params.stretchToFillScreen` is available
	 * <br> 5.1.0 newChart is capable of setting range via `params` settings
	 * <br> 6.0.0 statically provided data will be gap-filled if that functionality is enabled
	 */
	CIQ.ChartEngine.prototype.newChart=function(symbol, masterData, chart, cb, params){
		//if (!symbol) return; // can't build a chart without a symbol
		if(!chart) chart=this.chart;
		if(!params) params={};

		var layout=this.layout, periodicity=params.periodicity;
		if (periodicity) {
			var internalPeriodicity = CIQ.cleanPeriodicity(
					periodicity.period?periodicity.period:periodicity.periodicity,
					periodicity.interval,
					periodicity.timeUnit
				);
			layout.interval=internalPeriodicity.interval;
			layout.periodicity=internalPeriodicity.period;
			layout.timeUnit=internalPeriodicity.timeUnit;
		}

		var prevSymbol=chart.symbol;
		var prevSymbolObject=CIQ.clone(chart.symbolObject);
		var prevMarket=chart.market;
		var prevDataSet=chart.dataSet;
		var prevMoreAvailable=chart.moreAvailable;
		chart.dataSet=[];
		chart.moreAvailable=null;
		if(!symbol){
			chart.symbol = null;
			chart.symbolObject = { symbol: null };
		}else if(typeof symbol == 'object') {
			// an object was sent in, so initialize the string from the object
			chart.symbol = symbol.symbol;
			chart.symbolObject = symbol;
		} else {
			// a string was sent in so initialize the object from the string
			chart.symbol=symbol;
			chart.symbolObject.symbol = symbol;
		}

		chart.inflectionPoint=null;  // reset where the consolidation occurs from

		if(this.marketFactory){
			var marketDef=this.marketFactory(chart.symbolObject);
			this.setMarket(marketDef, chart);
		}

		this.setMainSeriesRenderer(true);

		var setSpan=params.span;
		var range=params.range;
		// no range or span passed into params, check layout
		if(!range && !setSpan && layout) {
			setSpan = !layout.range ? layout.setSpan : {};
			range = layout.range || {};
		}
		// both passed into params, range takes precedence
		else if(range && setSpan) {
			setSpan = {};
		}

		this.clearCurrentMarketData(chart);

		var self=this;
		if(!masterData && this.quoteDriver){
			var callback = function(err){
				if(err && err!="orphaned") { // orphaned means that another newChart request came in, overriding this one
					chart.symbol=prevSymbol; // revert the symbol back to what it was if there is an error
					chart.symbolObject=prevSymbolObject; // revert the symbol object back to what it was if there is an error
					chart.market=prevMarket;
					chart.dataSet=prevDataSet;
					chart.moreAvailable=prevMoreAvailable;
				}
				self.dispatch((self.currentlyImporting?"symbolImport":"symbolChange"), {stx:self, symbol: self.chart.symbol, symbolObject:self.chart.symbolObject, action:"master"});
				if(cb) cb.call(self, err);
			};

			if(range && Object.keys(range).length) { // check for empty object
				delete params.span;         // range and span are mutually exclusive
				delete layout.setSpan;
				this.chart.masterData=null;
				this.displayInitialized=false;
				if (periodicity) {
					range.periodicity = periodicity;
				}
				range.forceLoad=true;
				this.setRange(range, callback);
			}
			else if(setSpan && setSpan.base) {
				setSpan.multiplier=setSpan.multiplier || 1;
				// force a new chart to be initialized and new data fetched before calling setSpan to conform with the expectations and purpose of newChart,
				// and not use existing data and symbol names.
				this.chart.masterData=null;
				this.displayInitialized=false;
				// periodicity will be kept if sent as a parameter.
				if( periodicity ) setSpan.maintainPeriodicity = true;
				setSpan.forceLoad=true;
				this.setSpan(setSpan,callback);
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
			if (!chart.symbol) chart.symbol="";	// if we are ready to draw but the symbol is missing, it will crash
			this.initializeChart();
			masterData=this.doCleanupGaps(masterData, chart);
			this.setMasterData(masterData, chart, {noCleanupDates:true});
			chart.endPoints={};
			if(masterData && masterData.length){
				chart.endPoints={
						begin: masterData[0].DT,
						end: masterData[masterData.length-1].DT
				};
			}
			this.createDataSet();

			if(range && Object.keys(range).length){
				this.setRange(range);
			} else if(setSpan && setSpan.multiplier && setSpan.base) {
				this.setSpan({maintainPeriodicity:true,multiplier: setSpan.multiplier,base: setSpan.base});
			} else if (params.stretchToFillScreen) {
				this.fillScreen();
			} else if(masterData && masterData.length) {
				this.draw();
			} else {
				this.clear();
			}
			this.adjustPanelPositions();  // to ensure holders are adjusted for current yaxis height
			self.dispatch((self.currentlyImporting?"symbolImport":"symbolChange"), {stx:self, symbol: self.chart.symbol, symbolObject:self.chart.symbolObject, action:"master"});
			if(cb) cb.call(self);
		}
	};

	/**
	 * Removes any studies from the chart, and hides the chart controls.
	 * The chart becomes uninitialized, disabling any interaction with it.
	 * The canvas is not cleared; {@link CIQ.clearCanvas} can do that.
	 * 
	 * Useful when a chart is loaded with no data due to a quoteFeed error. Automatically called by {@link CIQ.ChartEngine#newChart}
	 * 
	 * @memberof CIQ.ChartEngine
	 * @since 2016-12-01
	 */
	CIQ.ChartEngine.prototype.clear=function() {
		this.displayInitialized = false;

		for(var id in this.layout.studies){
			var sd=this.layout.studies[id];
			CIQ.Studies.removeStudy(this, sd);
		}

		if(this.controls.chartControls) this.controls.chartControls.style.display="none";

		this.chart.panel.title.innerHTML="";
		this.chart.panel.title.appendChild(document.createTextNode(this.chart.panel.display));

	};

	/**
	 * Adjusts the candleWidth to eliminate left-side gaps on the chart if not enough bars are loaded.
	 * @memberof CIQ.ChartEngine
	 * @since 4.0.0 this function in now public
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

		// line-type charts go center-to-center in the data point space, so we end up which 1/2 a candle empty on the left and the right..
		//so if we remove a candle from the calculations, we go edge to edge.
		if((!this.mainSeriesRenderer || !this.mainSeriesRenderer.standaloneBars) && !this.standaloneBars[this.layout.chartType]) count--;

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
	 * @param {object} params Parameters object
	 * @param {boolean} [params.noCleanupDates]		If true then dates have been cleaned up already by calling {@link CIQ.ChartEngine#doCleanupDates}, so do not do so in here.
	 * @memberof CIQ.ChartEngine
	 * @since 5.2.0 added params and params.noCleanupDates.
	 */
	CIQ.ChartEngine.prototype.setMasterData=function(masterData, chart, params){
		if(!chart) chart=this.chart;
		if(this.marketFactory){
			var marketDef=this.marketFactory(chart.symbolObject);
			this.setMarket(marketDef, chart);
		}

		if(!params) params={};

		if(!params.noCleanupDates) this.doCleanupDates(masterData,this.layout.interval);

		chart.masterData=masterData;
		if(chart.name=="chart") this.masterData=masterData;
		//chart.decimalPlaces=2;
		var i;
		for(i=0;masterData && i<masterData.length;i++){
			var quotes=masterData[i];
			if(quotes.DT){
				if( Object.prototype.toString.call(quotes.DT) != '[object Date]' ) quotes.DT=new Date(quotes.DT); // if already a date object; nothing to do
				if(!quotes.Date || quotes.Date.length!=17) quotes.Date=CIQ.yyyymmddhhmmssmmm(quotes.DT);
			}
			else if(quotes.Date) quotes.DT=CIQ.strToDateTime(quotes.Date);
			else console.log ('setMasterData : Missing DT and Date on masterData object');
			if(quotes.Volume && typeof quotes.Volume !== "number") quotes.Volume=parseInt(quotes.Volume,10);
			//if(typeof quotes.Close != 'number' && !quotes.Close && quotes.Close!==null){
			//	console.log ('setMasterData : Close is missing or not a number. Use parseFloat() if your data server provides strings. MasterData Index= ' + i +' Value = ' + quotes.Close);
			//}
			if(masterData.length-i<50){
				// only check last 50 records
				this.updateCurrentMarketData(quotes, chart, null, {fromTrade:true});
			}
		}
		chart.decimalPlaces=this.callbacks.calculateTradingDecimalPlaces({
			stx:this,
			chart:chart,
			symbol: chart.symbolObject.symbol,
			symbolObject:chart.symbolObject
		});

		this.setDisplayDates(masterData);
		chart.roundit=Math.pow(10, chart.decimalPlaces);

		for(i in this.plugins){
			var plugin=this.plugins[i];
			if(plugin.display){
				if(plugin.setMasterData) plugin.setMasterData(this, chart);
			}
		}
	};

	/**
	 * Sets the master data for the chart, creates the data set, and renders the chart.
	 *
	 * @param	{string}			symbol			Ticker symbol for the chart.
	 * @param	{array}				masterData		An array of quotes. Each quote should at a minimum contain a "Close" field (capitalized) and a Date field which is a string form of the date.
	 *												This method will set DT to be a JavaScript Date object derived from the string form.
	 * @param	{CIQ.ChartEngine.Chart}	[chart]			The chart to put the masterData. Defaults to the default chart.
	 * @memberof CIQ.ChartEngine
	 * @since 3.0.0
	 */
	CIQ.ChartEngine.prototype.setMasterDataRender=function(symbol, masterData, chart){
		if(!chart) chart=this.chart;
		if (!chart.symbol) chart.symbol="";
		this.setMasterData(masterData, chart);
		if(masterData){
			chart.endPoints={};
			if(masterData.length){
				chart.endPoints={
						begin:masterData[0].DT,
						end:masterData[masterData.length-1].DT
				};
				chart.symbol=symbol;
			}
		}
		this.createDataSet();
		this.initializeChart();
		this.draw();
		if(!masterData || !masterData.length){
			chart.symbol=null;
			this.clear();
		}
		this.adjustPanelPositions();
	};

	/**
	 * Returns an array of all symbols currently required to be loaded by the quoteFeed.
	 * The returned array contains an object for each symbol containing:
	 * symbol, symbolObject, interval, periodicity
	 * @param {object} params Control parameters
	 * @param {boolean} [params.include-parameters] Set to true to put the series parameters in the return object
	 * @param {boolean} [params.exclude-studies] Set to true to not include study symbols
	 * @param {boolean} [params.breakout-equations] Set to true to return component symbols of equations
	 *
	 * @return {array} The array of symbol objects required
	 * @memberof CIQ.ChartEngine
	 * @since  2016-03-11
	 * @since 6.2.0 params.breakout-equations added
	 */
	CIQ.ChartEngine.prototype.getSymbols=function(params){
		if(!params) params={};
		var a=[], obj, layout=this.layout, symbol, symbolObject;
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
			if(chart.symbolObject && chart.symbolObject.symbol)
				a.push(makeObj(chart.symbol, chart.symbolObject, layout));
			for(var field in chart.series){
				var series=chart.series[field], parameters=series.parameters;
				if(parameters.data && !parameters.data.useDefaultQuoteFeed) continue; // legacy
				symbolObject=parameters.symbolObject;
				symbol=parameters.symbol;
				obj=makeObj(symbol, symbolObject, layout);
				obj.id=field;
				if(params["include-parameters"]) obj.parameters = parameters;
				if(params["exclude-studies"] && parameters.bucket=="study") continue;
				a.push(obj);
			}
		}
		if(params["breakout-equations"]){
			// replace the equations with their component symbols
			var components={};  // use to eliminate duplicates
			for(var s=0;s<a.length;s++){
				symbol=a[s].symbol;
				if(this.isEquationChart(symbol)){
					var res=CIQ.formatEquation(symbol);
					if(res){
						var symbols=res.symbols;
						for(var sym=0;sym<symbols.length;sym++){
							components[symbols[sym]]=makeObj(symbols[sym], a[s].symbolObject, a[s]);
						}
					}
				}else{
					components[symbol]=makeObj(symbol, a[s].symbolObject, a[s]);
				}
			}
			a=[];
			for(var component in components) a.push(components[component]);
		}
		return a;
	};

	/**
	 * Sets the displayDate for the data element in masterData. The displayDate is the timezone adjusted date.
	 * @param {object} quote The quote element to check
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.setDisplayDate=function(quote){
		if(CIQ.ChartEngine.isDailyInterval(this.layout.interval)) return;
		var dt=quote.DT;
		var milli=dt.getSeconds()*1000+dt.getMilliseconds();
		var newDT;
		if(this.displayZone){
			newDT=new timezoneJS.Date(dt.getTime(), this.displayZone);
			dt=new Date(newDT.getFullYear(), newDT.getMonth(), newDT.getDate(), newDT.getHours(), newDT.getMinutes());
			dt=new Date(dt.getTime()+milli);
		}
		quote.displayDate=dt;
	};

	/**
	 * Calls {@link CIQ.ChartEngine#setDisplayDate} for each element in masterData
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.setDisplayDates=function(masterData){
		if(!masterData) return;
		if(CIQ.ChartEngine.isDailyInterval(this.layout.interval)) return;
		for(var i=0;i<masterData.length;i++){
			var quote=masterData[i];
			if(quote.DT) this.setDisplayDate(quote);
		}
	};

	/**
	 * Streams "last sale" prices into the chart.
	 *
	 *
	 * >**This function has been deprecated in favor of {@link CIQ.ChartEngine#updateChartData}.
	 * This also means that {@link CIQ.ChartEngine#streamParameters.fillGaps} is deprecated.
	 * Developers should instead call {@link CIQ.ChartEngine#updateChartData} with `params.fillGaps=true` or rely on cleanupGaps as default behavior.**
	 *
	 * >`streamTrade` to `updateChartData` migration examples:
	 *
	 * >Note that updateChartData follows the 'OHLC' format.
	 * So `V`olume (upper case) is used rather than `v`olume (lower case).
	 * Similarly `L`ast (upper case) is used rather than `l`ast (lower case).
	 *
	 * >Example 1: streaming a secondary series:
	 *
	 * >`streamTrade({"last":102.05}, null, "IBM");`
	 * <br>Translates to : <br>
	 * `updateChartData({"Last":102.05}, null, {fillGaps: true, secondarySeries: "IBM"});`
	 *
	 * >Example 2: streaming a primary series:
	 *
	 * >`streamTrade({"last":102.05, "volume":100});`
	 * <br>Translates to : <br>
	 * `updateChartData({"Last": 102.05,"Volume":100}, null, {fillGaps: true});`
	 *
	 * This method is designed to append ticks to the master data while maintaining the existing periodicity, appending to the last tick or creating new ticks as needed.
	 * It will also fill in gaps if there are missing bars in a particular interval.
	 * If a trade has a date older than the beginning of the next bar, the last bar will be updated even if the trade belongs to a prior bar; this could happen if a trade is sent in after hours at a time when the market is closed, or if it is received out of order.
	 * When in 'tick' interval, each trade will be added to a new bar and no aggregation to previous bars will be done.
	 * If the optional timestamp [now] is sent in, and it is older than the next period to be rendered, the last tick on the dataset will be updated instead of creating a new tick.
	 *
	 * ** It is crucial that you ensure the date/time of the trade is in line with your `masterData` and `dataZone` ** See `now` parameter for more details.
	 *
	 * This method leverages {@link CIQ.ChartEngine#updateChartData} for the actual data insertion into masterData. Please see  {@link CIQ.ChartEngine#updateChartData} for additional details and performance throttle settings.
	 *
	 * See the [Streaming]{@tutorial DataIntegrationStreaming} tutorial for more the details.
	 *
	 * **Note: ** versions prior to 15-07-01 must use the legacy arguments : streamTrade(price, volume, now, symbol)
	 *
	 * @param  {object}		data			Price & Volume Data, may include any or all of the following:
	 * @param  {number}		data.last 		Last sale price
	 * @param  {number}		[data.volume] 	Trade volume
	 * @param  {number}		[data.bid] 		Bid price
	 * @param  {number}		[data.ask] 		Offer/Ask price
	 * @param  {date}		[now]			Date of trade. It must be a java script date [new Date().getTime()]. **If omitted, defaults to "right now" in the set `dataZone`** (see {@link CIQ.ChartEngine#setTimeZone}); or if no `dataZone` is set, it will default to the browser's timezone (not recommended for international client-base since different users will see different times). It is important to note that this value must be in the same timezone as the rest of the masterData already sent into the charting engine to prevent tick gaps or overlaps.
	 * @param  {string}		[symbol]		trade symbol for series streaming ONLY. Leave out or set to `null` when streaming the primary chart symbol.
	 * @param {object} 		[params] 		Params to be passed to {@link CIQ.ChartEngine#updateChartData}
	 * @memberof CIQ.ChartEngine
	 * @example
	 * // streaming last sale for the primary chart symbol
	 * stxx.streamTrade({"last":102.05, "volume":100});
	 * @example
	 * // streaming last sale for an additional series on the chart
	 * stxx.streamTrade({"last":102.05, "volume":100}, null, "IBM");
	 * @deprecated Please use {@link CIQ.ChartEngine#updateChartData} for streaming last ticket.
	 * @since  4.0.0 Deprecated this function. This also means that streamParameters.fillGaps is deprecated. Developers should
	 * call {@link CIQ.ChartEngine#updateChartData} with params.fillGaps=true or rely on cleanupGaps as default behavior.
	 */
	CIQ.ChartEngine.prototype.streamTrade=function(priceData, now, symbol, params){
		var chart=this.chart;
		if(!params) params={};
		if(params.chart) chart=params.chart;
		params.fillGaps=this.streamParameters.fillGaps;
		var newArgs=(typeof priceData=="object");

		var price=newArgs?priceData.last:arguments[0],
			volume=newArgs?priceData.volume:arguments[1],
			bid=newArgs?priceData.bid:null,
			ask=newArgs?priceData.ask:null;

		if(!newArgs){
			now=arguments[2];
			symbol=arguments[3];
		}

		if(symbol){  //series element
			params.secondarySeries=symbol;
		}

		var data={
			DT: now,
			Last: price,
			Volume: volume,
			Bid: bid,
			Ask: ask
		};

		this.updateChartData(data, chart, params);

	};

	/**
	 * As of version 5.1, his method has been **deprecated** in favor of {@link CIQ.ChartEngine#updateChartData} which provides improved functionality.
	 *
	 * The following parameters are only applicable for legacy versions (pre 5.1):
	 * @deprecated Please use {@link CIQ.ChartEngine#updateChartData}
	 * @param  {array/object} appendQuotes		An array of properly formatted OHLC quote object(s). [See Data Format]{@tutorial InputDataFormat} and {@link CIQ.ChartEngine#setMasterData}.<br>
	 * 											Or a last sale object with the following elements:
	 * @param  {number}	appendQuotes.Last 		Last sale price
	 * @param  {number}	[appendQuotes.Volume]	Trade volume
	 * @param  {number}	[appendQuotes.Bid] 		Bid price
	 * @param  {number}	[appendQuotes.Ask] 		Offer/Ask price
	 * @param  {number}	[appendQuotes.DT] 		Date of trade.
	 * It must be a java script date [new Date().getTime()].
	 * **If omitted, defaults to "right now" in the set `dataZone`** (see {@link CIQ.ChartEngine#setTimeZone});
	 * or if no `dataZone` is set, it will default to the browser's timezone (not recommended for international client-base since different users
	 * will see different times). It is important to note that this value must be in the same timezone as the rest of the masterData already
	 * sent into the charting engine to prevent tick gaps or overlaps.
	 * @param  {CIQ.ChartEngine.Chart}			[chart]				The chart to append the quotes. Defaults to the default chart.
	 * @param {object} [params] Parameters to dictate behavior
	 * @param {boolean} [params.noCreateDataSet] If true then do not create the data set automatically, just add the data to the masterData
	 * @param {boolean} [params.allowReplaceOHL] Set to true to bypass internal logic that maintains OHL
	 * @param {boolean} [params.bypassGovernor] If true then masterdata will be immediately updated regardless of {@link CIQ.ChartEngine#streamParameters}
	 * @param {boolean} [params.fillGaps] If true then {@link CIQ.ChartEngine#doCleanupGaps} is called using the {@link CIQ.ChartEngine#cleanupGaps} setting. This will ensure gaps will be filled in the master data from the last tick in the chart to the date of the trade.<BR> Reminder: `tick` does not fill any gaps as it is not a predictable interval.
	 * @param {boolean} [params.secondarySeries] Set to the name of the element ( valid comparison symbol, for example) to load data as a secondary series.
	 * @param {boolean} [params.useAsLastSale] If not using a 'last sale' formatted object in `appendQuotes`,
	 * you can simply set this parameter to `true` to force the data as a last sale price; or further define it by creating an object including other settings as needed.
	 * This option is available in cases when a feed may always return OHLC formatted objects or a 'Close' field instead of a 'Last' field,
	 * even for last sale streaming updates.
	 * By definition a 'last' sale can only be a single record indicating the very 'last' sale price. As such, even if multiple records are sent in the `appendQuotes` array when this flag is enabled,
	 * only the last record's data will be used. Specifically the 'Close' and 'Volume' fields will be streamed.
	 * @param {boolean} [params.useAsLastSale.aggregatedVolume] If your last sale updates send current volume for the bar instead of just the trade volume, set this parameter to 'true' in the `params.useAsLastSale` object. The sent in volume will be used as is instead of being added to the existing bar's volume.
	 *
	 * @memberof CIQ.ChartEngine
	 * @since
	 * <br>&bull; 2015-11-1 params.bypassGovernor added, allowReplaceOHL added
	 * <br>&bull; 2015-11-1 params.force deprecated. Every call will update the tick to maintain the proper volume and createDataSet is now controlled by sp.maxTicks, sp.timeout or params.bypassGovernor
	 * <br>&bull; 3.0.0 `appendQuotes` now also takes last sale data to allow streaming capabilities. This can now be used instead of streamTrade.
	 * <br>&bull; 3.0.0 new params.fillGaps, params.secondarySeries, params.useAsLastSale
	 * <br>&bull; 4.0.0 last sale streaming will now update a bar in the past to comply with the date sent in; instead of just updating the current tick.
	 * <br>&bull; 4.0.3 params.useAsLastSale.aggregatedVolume is now available.
	 * <br>&bull; 5.0.1 now calls doCleanupDates in case is is being called directly when not using a quoteFeed, to update an entire candle.
	 */
	CIQ.ChartEngine.prototype.appendMasterData=function(appendQuotes, chart, params){
		this.updateChartData(appendQuotes, chart, params);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Use this method to add new `OHLC` bars to the end of the chart, insert new bars into the middle of the chart, replace existing bars, delete bars, or stream individual `LAST SALE` data tick by tick as they are received from a streaming feed.
	 *
	 * **The following rules apply when adding or updating full [`OHLC`]{@tutorial InputDataFormat} bars:**
	 *
	 * - Follow proper OHLC format as outlined on the [OHLC format tutorial]{@tutorial InputDataFormat}.
	 * - If a bar is not present it will be added, if it is present it will be updated so the OHLC and volume integrity is preserved. If `allowReplaceOHL` is not set, the 'Open' is preserved from the existing candle; new 'High' and 'Low' values are calculated, and the 'Close' and 'Volume' values are replaced with the new ones.
	 * - Although gaps can be present, dates in the appendQuotes array **must maintain the correct periodicity and order** (older to newer) to prevent out of sequence bars.
	 * - If set, gaps will be filled past the currently existing bar. No gaps will be filled when inserting bars in between existing data.
	 *
	 * **The following rules apply when streaming individual `LAST SALE` data, tick by tick, as they are received from a streaming feed: **
	 *
	 * - Follow proper LAST SALE format as outlined on the parameters section under the `appendQuotes` field.
	 * - This method is designed to update the chart while maintaining the existing periodicity, finding and augmenting an existing bar for an instrument or creating new bars as needed.
	 * - It is important to note that a market iterator will be used to find the proper bar to update, and if no bar is found on that date, one will be created even in the past; so always be sure your historical data follows the rules of the market definitions when setting the dates for each bar. Remember that by default, weeks start on Sunday unless a market definition exists to indicate Sunday is not a market day, in which case the next market day will be used as the beginning of the week. Instructions to set a market for the chart can be found here: {@link CIQ.Market}
	 * - When in 'tick' interval, each trade will be added to a new bar and no aggregation to previous bars will be done.
	 *
	 * ** Performance: **
	 *
	 * - To maintain system performance you can throttle inbound ticks. See {@link CIQ.ChartEngine#streamParameters } and [Streaming tutorial](@tutorial DataIntegrationStreaming) for more details.
	 * - It is important to note that although the data will always be added to masterData, `createDataSet()` and `draw()` will **not** be called if data is received quicker than the throttle (governor) wait periods. As such, you will not see any changes until the throttle wait periods are met.
	 *
	 * ** Additional Notes: **
	 *
	 * - ** It is crucial that you ensure the date/time of the records being loaded are in line with your `masterData` and `dataZone`; and in the case of a last trade streaming, that your market definition will produce dates that will be in sync witht her rest of your already loaded records.** See `DT` parameter for more details.
	 * - This method is **not** intended to be used as a way to load initial chart data, or data changes triggered by periodicity changes.
	 *
	 * See the [Data Integration]{@tutorial DataIntegrationOverview} tutorial for more detail on how to load initial data.
	 *
	 * See the [Streaming]{@tutorial DataIntegrationStreaming} tutorial for more the details.
	 *
	 * @param  {array|object} appendQuotes		**OHLC format requirements**<br>
	 * 											An array of properly formatted OHLC quote object(s). [See OHLC Data Format]{@tutorial InputDataFormat}. Items in this array *must* be ordered from earliest to latest date.<br>
	 * 											<br>----<br><br>**LAST SALE  format requirements**<br>
	 * 											A last sale object with the following elements:
	 * @param  {number}	[appendQuotes.Last] 	Last sale price
	 * @param  {number}	[appendQuotes.Volume]	Trade volume (used on primary series only)
	 * @param  {number}	[appendQuotes.Bid] 		Bid price (used on primary series only)
	 * @param  {number}	[appendQuotes.Ask] 		Offer/Ask price (used on primary series only)
	 * @param  {array}	[appendQuotes.BidL2]	Level 2 Bid, expressed as an array of [price,size] pairs.  For example, BidL2: [[10.05,15],[10.06,10],...]
	 * @param  {array}	[appendQuotes.AskL2]	Level 2 Offer/Ask expressed as an array of [price,size] pairs.  For example, AskL2: [[11.05,12],[11.06,8],...]
	 * @param  {number}	[appendQuotes.DT] 		Date of trade. It must be a java script date [new Date()]. If omitted, defaults to "right now".
	 * If you are using the 'Date' string field with a `dataZone` for your historical data and wish to also use it for streaming updates,
	 * you must instead submit a properly formatted OHLC array. For example:
	 * ```
	 * stxx.updateChartData(
	 *  [
	 *   {"Date":"2015-04-16 16:00","Close":152.11,"Volume":4505569}
	 *  ],
	 *  null,
	 *  {useAsLastSale:true}
	 * );
	 * ```
	 * @param  {CIQ.ChartEngine.Chart}			[chart]				The chart to append the quotes. Defaults to the default chart.
	 * @param {object} [params] Parameters to dictate behavior
	 * @param {boolean} [params.noCreateDataSet] If true then do not create the data set automatically, just add the data to the masterData
	 * @param {boolean} [params.noCleanupDates] If true then do not clean up the dates using {@link CIQ.ChartEngine.doCleanupDates}.  Usually set if dates were already cleaned up.
	 * @param {boolean} [params.allowReplaceOHL] Set to true to bypass internal logic that maintains OHL so they are instead replaced with the new data instead of updated.
	 * @param {boolean} [params.bypassGovernor] If true then masterdata will be immediately updated regardless of {@link CIQ.ChartEngine#streamParameters}. Not applicable if `noCreateDataSet` is true.
	 * @param {boolean} [params.fillGaps] If true and {@link CIQ.ChartEngine#cleanupGaps} is also set, {@link CIQ.ChartEngine#doCleanupGaps} will be called to fill gaps for any newly added bars past the currently existing bar. It will not fill gaps for bars added to the middle of the masterData, or created by deleting a bar. <BR> Reminder: `tick` does not fill any gaps as it is not a predictable interval.
	 * @param {boolean} [params.secondarySeries] Set to the name of the element (valid comparison symbol, for example) to load data as a secondary series. When left out, the data will be automatically added to the primary series. <Br>**Note:** You should never set `secondarySeries` to the primary symbol. If you are unsure of what the current primary series is, you can always query the chart engine by checking `stxx.chart.symbol`.
	 * @param {boolean} [params.deleteItems] Set to true to completely delete the masterData records matching the dates in appendQuotes.
	 * @param {boolean} [params.useAsLastSale] Set to true if not using a 'last sale' formatted object in `appendQuotes`.
	 * This option is available in cases when a feed may always return OHLC formatted objects or a 'Close' field instead of a 'Last' field,
	 * even for last sale streaming updates.
	 * By definition a 'last sale' can only be a single record indicating the very 'last' sale price.
	 * As such, even if multiple records are sent in the `appendQuotes` array when this flag is enabled,
	 * only the last record's data will be used. Specifically the 'Close' and 'Volume' fields will be streamed.
	 * @param {boolean} [params.useAsLastSale.aggregatedVolume] If your last sale updates send current volume for the bar instead of just the trade volume, set this parameter to 'true' in the `params.useAsLastSale` object. The sent in volume will be used as is instead of being added to the existing bar's volume. Not applicable when loading data for a secondary series.
	 * @memberof CIQ.ChartEngine
	 * @example
	 * // this example will stream the last price on to the appropriate bar and add 90 to the bar's volume.
	  stxx.updateChartData(
		  {
			  Last: 50.94,
			  Volume: 90
		  }
	  );
	 * @example
	 * // this example will stream the last price on to the appropriate bar and set the volume for that bar to 90.
	  stxx.updateChartData(
		  {
			  Last: 50.94,
			  Volume: 90
		  },
		  null,
		  {useAsLastSale: {aggregatedVolume:true}}
	  );
	 * @example
	 * // this example will stream the last price to the appropriate bar  **for a secondary series**.
	  stxx.updateChartData(
		  {
			  Last: 50.94
		  },
		  null,
		  {secondarySeries:secondarySymbol}
	  );
	 * @example
	 * // this example will add or replce a complete OHLC bar.
	  stxx.updateChartData(
		  [
		  	{"Date":"2015-04-16 16:00","Open":152.13,"High":152.19,"Low":152.08,"Close":152.11,"Volume":4505569},
		  	{"Date":"2015-04-17 09:30","Open":151.76,"High":151.83,"Low":151.65,"Close":151.79,"Volume":2799990},
		  	{"Date":"2015-04-17 09:35","Open":151.79,"High":151.8,"Low":151.6,"Close":151.75,"Volume":1817706}
		  ]
	  );
	 * @since
	 * <br>&bull; 5.1.0 New function replacing and enhancing legacy method `appendMasterData`.
	 * <br>&bull; 5.1.0 Added ability to delete or insert items anywhere in the masterData. `deleteItems` parameter added.
	 * <br>&bull; 5.2.0 `overwrite` param added
	 * <br>&bull; 5.2.0 For main series data, if Close=null is set, and not streaming, then Open, High, Low and Volume also set to null.
	 * <br>&bull; 5.2.0 For main series data, if Volume=0/null is set, and not streaming, then Volume is reset to 0.
	 * <br>&bull; 5.2.0 Added params.noCleanupDates, params.fillGaps applicable now for secondary series as well
	 * <br>&bull; 6.0.0 `overwrite` param removed
	 * <br>&bull; 6.1.0 Added BidL2 and AskL2 to appendQuotes object
	 */

	CIQ.ChartEngine.prototype.updateChartData=function(appendQuotes, chart, params){
		if(!params) params={};
		if(!chart) chart=this.chart;

		var lastSale=false, aggregatedVolume=false, masterData=chart.masterData, layout=this.layout, dataZone=this.dataZone;
		var self=this, secondary=params.secondarySeries, field, symbol;

		// If we are not a tick interval, we want to adjust the DT property of the appendQuotes so it matches the periodicity/interval of the existing chart data.
		function adjustDatesToInterval(){
			// On intraday intervals we use a 24 hour market because we don't want our bars to artificially stop
			// at the end of a market session. If we get extended hours, or bad ticks we still
			// want to print them on the chart. Trust the data.
			var marketDef={
				"market_tz": chart.market.market_def.market_tz || null
			};
			var mktInterval = layout.interval;

			if(mktInterval=="month" || mktInterval=="week"){
				// if we are rolling day bars into week or month we have to iterate day by day to find the right bar.
				if(!self.dontRoll) mktInterval="day";
				// on week and month we need to know when the week/month starts to find the right day for the candles.
				marketDef= self.chart.market.market_def;
			}

			var theMarket=new CIQ.Market(marketDef);
			var iter_parms = {
				'begin': (masterData && masterData.length)?masterData[masterData.length-1].DT:appendQuotes.DT,
				'interval': mktInterval,
				'periodicity': 1,
				'timeUnit': layout.timeUnit
			};

			var iter = theMarket.newIterator(iter_parms);
			var next = iter.next();
			var max, actualTime;
			if(!masterData){ // there are some use cases where you might prefer to stream data onto masterData without using a quotefeed or loading data first.
				appendQuotes.DT = new Date(+iter.previous());
			} else if(appendQuotes.DT<next){
				// update current tick or some tick in the past.
				max=0; // safety catch so we don't go on forever.
				var previous=iter.previous();
				actualTime=appendQuotes.DT;
				params.appending=true;
				while(actualTime<previous && max<1000) {
					params.appending=false;
					previous=iter.previous();
					max++;
				}
				appendQuotes.DT=previous;
				params.updating=!params.appending;
			} else if(appendQuotes.DT>=next){
				// create new tick. If the date matches, that's it, otherwise fast forward to find the right bar to add.
				max=0; // safety catch so we don't go on forever.
				actualTime=appendQuotes.DT;
				while(actualTime>next && max < 1000) {
					appendQuotes.DT=next;
					next=iter.next();
					max++;
				}
				params.appending=true;
			}
		}

		// Takes the Last Sale data from the appendQuote and converts it to OHLC data
		function formatFromLastSaleData(){
			// self is last sale streaming so format accordingly
			lastSale=true;

			if( params.useAsLastSale && params.useAsLastSale.aggregatedVolume ) aggregatedVolume=true;


			if( appendQuotes.constructor === Array) {
				// is streaming an array of OHLC, do some clean up to extract last and volume
				var lastBar = appendQuotes[appendQuotes.length-1];
				appendQuotes = {};

				// doCleanupDates will make sure this has a valid 'DT' field in the right timeZone,
				// no need to check or convert from 'Date'
				appendQuotes.DT=lastBar.DT;

				appendQuotes.Close=lastBar.Close;
				appendQuotes.Volume=lastBar.Volume;
			} else if(appendQuotes.Last) {
				appendQuotes.Close=appendQuotes.Last;
				delete appendQuotes.Last;
			}

			if(appendQuotes.DT && Object.prototype.toString.call(appendQuotes.DT) != '[object Date]' ) appendQuotes.DT = new Date(appendQuotes.DT); // epoch or ISO string
			if (!appendQuotes.DT || appendQuotes.DT == 'Invalid Date') {
				// if no date is sent in, use the current time and adjust to the dataZone
				appendQuotes.DT = new Date();
			}

			// find the right candle
			if( layout.interval!="tick"){
				adjustDatesToInterval();
			}

			appendQuotes.Open=appendQuotes.Close;
			appendQuotes.High=appendQuotes.Close;
			appendQuotes.Low=appendQuotes.Close;
		}

		// Fills the gaps from the most recent master data record to the new data
		function fillGapsFromMasterDataHead(){
			var lastRecordForThis=self.getFirstLastDataRecord(masterData, secondary || chart.defaultPlotField, true);
			var fg=0;  // this is used to store the index of the first record in appendQuotes we should be using to fill gaps.
						// we'll adjust this below by looking for the starting point from masterData
			if(lastRecordForThis){
				if(appendQuotes[appendQuotes.length-1].DT<=lastRecordForThis.DT) return;  // no gap to fill
				for(;fg<appendQuotes.length;fg++){
					if(+appendQuotes[fg].DT==+lastRecordForThis.DT) {
						// if the appendQuote is the same as the lastRecordForThis, check to see which is the "correct" record
						if(self.getFirstLastDataRecord([appendQuotes[fg]], secondary || chart.defaultPlotField))
							lastRecordForThis=null;  // use appendQuote record
						break;
					}
					else if(appendQuotes[fg].DT>lastRecordForThis.DT) break;
				}
			}
			// now fg represents the index of the first element in appendQuotes which appears after the last current element for that security.
			var gapQuotes=appendQuotes.slice(fg);
			if(lastRecordForThis) gapQuotes.unshift(secondary?lastRecordForThis[secondary]:lastRecordForThis);    // add previous bar so we can close gaps
			gapQuotes=self.doCleanupGaps(gapQuotes, chart);
			if(lastRecordForThis) gapQuotes.shift();    // remove previous bar
			appendQuotes=appendQuotes.slice(0,fg).concat(gapQuotes);
		}

		// Deletes an item from masterData at index i and date dt
		function deleteThisItem(i, dt){
			var replace;
			if(secondary){
				delete masterData[i][secondary];
				if(self.cleanupGaps){
					replace={DT:dt, Close:null};
					if(self.cleanupGaps!="gap" && masterData[i-1] && masterData[i-1][secondary]){
						replace.Close=masterData[i-1][secondary].Close;
						replace.High=replace.Low=replace.Open=replace.Close;
						replace.Volume=0;
					}
					masterData[i][secondary]=replace;
				}
			}else{
				var spliced=masterData.splice(i,1)[0]; //deleting from masterData here, but will reinsert if find any series data
				replace={DT:spliced.DT, Close:null, needed:false};
				for(field in chart.series){
					symbol=chart.series[field].parameters.symbolObject.symbol;
					if(typeof spliced[symbol] !="undefined") {
						replace[symbol]=spliced[symbol];
						delete replace.needed;
					}
				}
				if(self.cleanupGaps && self.cleanupGaps!="gap"){
					delete replace.needed;
					if(self.cleanupGaps!="gap" && masterData[i-1]){
						replace.Close=masterData[i-1].Close;
						replace.High=replace.Low=replace.Open=replace.Close;
						replace.Volume=0;
					}
				}
				if(replace.needed!==false) {
					masterData.splice(i,0,replace);
				}
			}
		}

		// Takes a quote q and merges it into masterData at index i
		function mergeNewDataIntoMasterData(i, q){
			// If we're replacing the last bar then we want to save any series and study data, otherwise comparisons will [briefly] disappear during refreshes
			//Preserve any relevant data from prior fetched quote for this bar.
			//Here we are assuming that the data being appended to masterData is a data update, perhaps from only one exchange, while
			//the existing masterData is a consolidated quote. We trust the quote we had in masterData to have the more accurate
			//volume and open, and use the high/low from there in combination with the updated data's to determine the daily high/low.
			var master=masterData[i];
			if(secondary) master=master[secondary] || {};

			if(q.Close===null){
				if(master.Open!==undefined) q.Open=null;
				if(master.High!==undefined) q.High=null;
				if(master.Low!==undefined) q.Low=null;
				if(master.Volume!==undefined) q.Volume=null;
				// This code will set the OHLC data for carry gap filling if applicable,
				// but it's disabled because if a Close:null is sent in, then just use it.
				// I suppose if a gap is really to be filled in, the record should be deleted.
				/*if(this.cleanupGaps && this.cleanupGaps!="gap" && masterData[i-1]){
					if(!secondary || masterData[i-1][secondary]){
						q.Close=secondary?masterData[i-1][secondary].Close:masterData[i-1].Close;
						q.High=q.Low=q.Open=q.Close;
						q.Volume=0;
					}
				}*/
			}else{
				if(lastSale){
					if(q.Volume){
						q.Volume=parseInt(q.Volume,10);
					}
					if( !aggregatedVolume ) q.Volume+=master.Volume;
				}else{
					if(!CIQ.isValidNumber(q.Volume) && master.Volume){
						q.Volume=master.Volume;
					}
				}
				if(!params.allowReplaceOHL){
					if(CIQ.isValidNumber(master.Open)){
						q.Open=master.Open;
					}
					if(CIQ.isValidNumber(master.High) && CIQ.isValidNumber(q.High)){
						if(master.High>q.High) q.High=master.High;
					}
					if(CIQ.isValidNumber(master.Low) && CIQ.isValidNumber(q.Low)){
						if(master.Low<q.Low) q.Low=master.Low;
					}
				}
				// if new data is invalid, revert to old data
				if(!CIQ.isValidNumber(q.Close)) q.Close=master.Close;
				if(!CIQ.isValidNumber(q.Open)) q.Open=master.Open;
				if(!CIQ.isValidNumber(q.High)) q.High=master.High;
				if(!CIQ.isValidNumber(q.Low)) q.Low=master.Low;
				if(!CIQ.isValidNumber(q.Bid)) q.Bid=master.Bid;
				if(!CIQ.isValidNumber(q.Ask)) q.Ask=master.Ask;

				for(field in chart.series){
					symbol=chart.series[field].parameters.symbolObject.symbol;
					if(typeof q[symbol]=="undefined" && typeof master[symbol] !="undefined") q[symbol]=master[symbol];
				}
			}
		}

		if(!params.noCleanupDates) this.doCleanupDates(appendQuotes,layout.interval);

		if( params.useAsLastSale ||
			(appendQuotes.constructor==Object && (appendQuotes.Last || appendQuotes.Last===0 ))){
			formatFromLastSaleData();
		}

		if(appendQuotes && appendQuotes.constructor==Object) appendQuotes=[appendQuotes]; // When developer mistakenly sends an object instead of an array of objects
		if(!appendQuotes || !appendQuotes.length) return;
		if(this.runPrepend("appendMasterData", [appendQuotes, chart, params])) return;
		if(this.runPrepend("updateChartData", [appendQuotes, chart, params])) return;

		if(!masterData) masterData=[];

		var i=masterData.length-1, placedFirstQuote=false;

		// fill gaps only if there is master data already
		// we only fill from the end of the current data, not before
		if(params.fillGaps && masterData.length) fillGapsFromMasterDataHead();
		if(!appendQuotes.length) return;  // can happen within fillGapsFromMasterDataHead

		for(var j=0;j<appendQuotes.length;j++){
			var quote=appendQuotes[j];
			var dt=quote.DT, date=quote.Date;
			if(dt && Object.prototype.toString.call(dt) != '[object Date]' ) quote.DT=dt=new Date(dt); // if already a date object; nothing to do
			if(dt) {
				if(!date || date.length!=17) quote.Date=CIQ.yyyymmddhhmmssmmm(quote.DT);
			}
			if(!dt) dt=quote.DT=CIQ.strToDateTime(date);

			while(i>=0 && i<masterData.length){
				var dt2=masterData[i].DT;
				if(!dt2) dt2=CIQ.strToDateTime(masterData[i].Date);
				if(dt2.getTime()<=dt.getTime()){
					placedFirstQuote=true;
					var plusOne=0;	// If time is the same then replace last bar
					if(dt2.getTime()<dt.getTime()) {
						if(i<masterData.length-1){
							var dtf=masterData[i+1].DT || CIQ.strToDateTime(masterData[i+1].Date);
							if(dtf.getTime()<=dt.getTime()) {
								i++;
								continue;
							}
						}
						plusOne=1;	// Otherwise append bar
					}
					if(params.deleteItems){
						if(!plusOne) deleteThisItem(i, dt);
						break;
					}else{
						if(!plusOne) mergeNewDataIntoMasterData(i, quote);

						// Here we rectify any missing/malformatted data and set any new high/low
						// If we don't set this here, the study calculations will fail
						if(CIQ.isValidNumber(quote.Close)){
							if(!CIQ.isValidNumber(quote.Open)) quote.Open=quote.Close;

							var high=Math.max(quote.Open, quote.Close), low=Math.min(quote.Open, quote.Close);
							if(!CIQ.isValidNumber(quote.High) || quote.High<high) quote.High=high;
							if(!CIQ.isValidNumber(quote.Low) || quote.Low>low) quote.Low=low;
						}
						if(quote.Volume && !CIQ.isValidNumber(quote.Volume)) quote.Volume=parseInt(quote.Volume,10);
						this.setDisplayDate(quote);
						i+=plusOne;

						// Insert into masterData here
						if(secondary){
							if(appendQuotes.length-j<50){
								// only check last 50 records
								this.updateCurrentMarketData(quote, chart, secondary, {fromTrade:true});
							}
							if(layout.interval!="tick" || quote.Close!==undefined){
								if(plusOne) masterData.splice(i,0,{DT:quote.DT});
								masterData[i][secondary]=quote;
							}
						}else{
							if(appendQuotes.length-j<50){
								// only check last 50 records
								this.updateCurrentMarketData(quote, chart, null, {fromTrade:true});
							}
							if(layout.interval!="tick" || quote.Close!==undefined) masterData.splice(i,plusOne?0:1,quote); //inserting into masterData happens here
						}
					}
					break;
				}
				i+=placedFirstQuote?1:-1;
			}
			if(i<0){
				// we have at least one point which needs to be prepended to masterData
				// this code will prepend the first of these points, then everything else will fall in line
				if(secondary){
					this.updateCurrentMarketData(quote, chart, secondary, {fromTrade:true});
					if(layout.interval!="tick" || quote.Close!==undefined){
						masterData.splice(0,0,{DT:quote.DT});
						masterData[0][secondary]=quote;
					}
				}else{
					this.updateCurrentMarketData(quote, chart, null, {fromTrade:true});
					if(layout.interval!="tick" || quote.Close!==undefined) masterData.splice(0,0,quote);
				}
				placedFirstQuote=true;
				i=0;
			}
		}
		if(masterData.length) this.masterData=chart.masterData=masterData;
		if (this.maxMasterDataSize) masterData=chart.masterData=this.masterData=masterData.slice(-this.maxMasterDataSize);

		var series=secondary?this.getSeries({symbol:secondary, chart:chart}):[chart];
		for(var s=0;s<series.length;s++){
			var handle=series[s];
			if(!handle.endPoints.begin || handle.endPoints.begin>appendQuotes[0].DT) handle.endPoints.begin=appendQuotes[0].DT;
			if(!handle.endPoints.end || handle.endPoints.end<appendQuotes[appendQuotes.length-1].DT) handle.endPoints.end=appendQuotes[appendQuotes.length-1].DT;
		}
		for(var pl in this.plugins){
			var plugin=this.plugins[pl];
			if(plugin.display){
				if(plugin.appendMasterData) plugin.appendMasterData(this, appendQuotes, chart);
			}
		}
		if(!this.masterData || !this.masterData.length)
			this.masterData=masterData;

		if(!params.noCreateDataSet){
			var sp=this.streamParameters;
			if(++sp.count>sp.maxTicks || params.bypassGovernor){
				clearTimeout(sp.timeout);
				this.createDataSet(null,null,params);
				this.draw();
				this.updateChartAccessories();
				sp.count=0;
				sp.timeout=-1;
			}else{
				if(sp.timeout==-1){
					sp.timeout=setTimeout(function(){
							self.createDataSet(null,null,params);
							self.draw();
							self.updateChartAccessories();
							self.streamParameters.count=0;
							self.streamParameters.timeout=-1;
						},sp.maxWait);
				}
			}
		}
		this.runAppend("appendMasterData", arguments);
		this.runAppend("updateChartData", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Loads or updates detailed current market information, such as L2 data, into the [chart.currentMarketData]{@link CIQ.ChartEngine.Chart#currentMarketData} object
	 * or an equally laid out object for a secondary series (symbol), if one provided.
	 *
	 * **[draw()]{@link CIQ.ChartEngine#draw} must be called immediately after this method to see the updates.**
	 *
	 * A single ‘snapshot’ object per symbol is loaded and only the most current updates maintained.
	 * This method is not intended to track historical or time-series information.
	 *
	 * This market ‘snapshot’ information can then be used to render specialty charts such as {@link CIQ.MarketDepth}, which is not a time series chart.
	 *
	 * When using as part of a chart engine that also display a time-series chart, this method is automatically called with that same time-series data every time new data is load into the chart, thereby maintaing all charts in sync.
	 * And only needs to be explicitly called when needing to update the L2 'snapshot' at a faster refresh rate than the rest of the time-series data, or if the time-series data does not provide this information.
	 * <br>If using the {@link CIQ.MarketDepth} standalone, without a standard time series chart, you must call this method explicitly to load and refresh the data.
	 *
	 * Data Format:
	 *
	 * | Field | Required | Type | Description | Used for cryptoIQ | Used for TFC |
	 * | ----------- | -------- | ---------------------------------------- |
	 * | DT | Yes | A JavaScript Date() object | Timestamp for the data update provided | Yes | Yes |
	 * | Bid | Maybe | number | The current bid price.<br>Required unless already loaded as part of time-series update  | No | Yes |
	 * | Ask | Maybe | number | The current ask price.<br>Required unless already loaded as part of time-series update | No | Yes |
	 * | Last | Maybe | number | The last (current) price.<br>Required unless already loaded as part of time-series update | Yes | Yes |
	 * | BidSize | No | number | The bid size  | No | No |
	 * | AskSize | No | number | The ask size | No | No |
	 * | LastSize | No | number | The last (current) price size. | No | No |
	 * | BidL2 | No | array | Level 2 Bid, expressed as an array of [price,size] pairs.<br>For example, BidL2: [[10.05,15],[10.06,10],...] | Yes | No |
	 * | AskL2 | No | array | Level 2 Ask, expressed as an array of [price,size] pairs.<br>For example, AskL2: [[10.05,15],[10.06,10],...] | Yes | No |
	 *
	 * Since not all of the data will need to be updated at the same time, this method allows you to send only the data that needs to be changed. Any values not provided will simply be skipped and not updated on the object.
	 *
	 * Example data format for a marketDepth chart:
	 * ```
	 * {
	 * 	DT:new Date("2018-07-30T04:00:00.000Z"),
	 * 	Last:24.2589,
	 * 	BidL2:
	 * 	[
	 * 		[93.54,5],[93.65,2],[93.95,7],[95.36,2],
	 * 		[95.97,9],[96.58,1], [96.68, 8], [96.98, 4],
	 * 		[97.08, 5], [97.18, 5], [97.28, 3], [97.38, 5],
	 * 		[97.48, 6], [97.69, 26], [98.29, 5], [98.39, 33],
	 * 		[98.49, 13], [98.6, 42], [98.8, 13], [98.9, 1]
	 * 	],
	 *
	 * 	AskL2:
	 * 	[
	 * 		[101.22,226],[101.32,31],[101.42,13],[101.53,188],
	 * 		[101.63,8],[101.73,5],[101.83,16],[101.93,130],
	 * 		[102.03,9],[102.13,122],[102.23,5],[102.33,5],
	 * 		[102.43,7],[102.54,9],[102.84,3],[102.94,92],
	 * 		[103.04,7],[103.24,4],[103.34,7],[103.44,6]
	 * 	]
	 * }
	 * ```
	 *
	 * @param {object} data Data to load as per required format.
	 * @param  {CIQ.ChartEngine.Chart} chart The chart whose market data to update. Defaults to the instance chart.
	 * @param {string} symbol Symbol if passing secondary series information
	 * @param {object} params  Additional parameters
	 * @param {boolean} [params.fromTrade] This function can be called directly or as a result of a trade update, such as from {@link CIQ.ChartEngine.Chart#updateChartData}.
	 * 										Set this param to `true` to indicate the incoming data is a master data record.
	 * 										Otherwise the function will attempt to adjust the record date to align with the last bar.
	 * @memberof CIQ.ChartEngine
	 * @since 
	 * <br>&bull; 6.1.0
	 * <br>&bull; 6.1.1 Added params.fromTrade
	*/
	CIQ.ChartEngine.prototype.updateCurrentMarketData=function(data, chart, symbol, params){
		if(!data || !data.DT) return;
		if(!chart) chart=this.chart;
		var calledFromTrade=params && params.fromTrade;
		// find the right bar for the data, if not found already
		var timestamp=data.DT;
		if(!calledFromTrade && this.layout.interval!="tick"){
			if(chart.market.market_def &&  chart.market.getSession(data.DT)===null) return;   // outside of market hours, disregard
			var smi=this.standardMarketIterator(data.DT);
			if(this.extendedHours && this.extendedHours.filter) smi.market.enableAllAvailableSessions();
			smi.next();
			data.DT=smi.previous();
		}

		if(this.runPrepend("updateCurrentMarketData", arguments)) return;
		var currentMarketData=chart.currentMarketData;
		if(symbol){
			if(!currentMarketData[symbol]) currentMarketData[symbol]={};
			currentMarketData=currentMarketData[symbol];
		}
		["Last","Bid","Ask"].forEach(function(i){
			if(data[i] && typeof(data[i])=="number"){
				if(!currentMarketData[i] || !currentMarketData[i].DT || currentMarketData[i].DT<=data.DT){
					currentMarketData[i]={DT:data.DT, Price:data[i], Size:data[i+"Size"], Timestamp:timestamp};
				}
			}
		});
		["BidL2","AskL2"].forEach(function(i){
			if(data[i] && (data[i] instanceof Array)){
				if(!currentMarketData[i] || !currentMarketData[i].DT || currentMarketData[i].DT<=data.DT){
					currentMarketData[i]={DT:data.DT, Price_Size:data[i], Timestamp:timestamp};
				}
			}
		});
		if(data.Close && (!currentMarketData.Last || currentMarketData.Last.DT<=data.DT)){
			if(!currentMarketData.animatedLast) {  // if this is set elsewhere (animation) then don't worry, Last is also set
				currentMarketData.Last={};
				currentMarketData.Last.DT=data.DT;
				currentMarketData.Last.Price=data.Close;
				currentMarketData.Last.Size=data.LastSize;
				if(data.LastSize===undefined && this.layout.interval=="tick") currentMarketData.Last.Size=data.Volume;
				currentMarketData.Last.Timestamp=data.LastTime || timestamp;
			}
		}
		currentMarketData.touched=new Date();  // so we can observe it

		if(!calledFromTrade) delete data.Last;  //  can cause problems in injections if left

		this.runAppend("updateCurrentMarketData", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Clears the [chart.currentMarketData]{@link CIQ.ChartEngine.Chart#currentMarketData} object or the one linked to a secondary series, if one provided.
	 * @param  {CIQ.ChartEngine.Chart} chart The chart to clear. If omitted, will clear all charts.
	 * @param {string} symbol Symbol to clear this symbol's secondary series information
	 * @memberof CIQ.ChartEngine
	 * @since 6.1.0
	*/
	CIQ.ChartEngine.prototype.clearCurrentMarketData=function(chart, symbol){
		if(this.runPrepend("clearCurrentMarketData", arguments)) return;
		var ch, charts=[];
		if(!chart) {
			for(ch in this.charts){
				charts.push(this.charts[ch]);
			}
		}else{
			charts.push(chart);
		}
		for(ch=0;ch<charts.length;ch++){
			var md=charts[ch].currentMarketData;
			if(symbol){
				delete md[symbol];
			}else{
				// preserve original object as it's being observed
				for(var d in md){
					delete md[d];
				}
			}
		}
		this.runAppend("clearCurrentMarketData", arguments);
	};

	/**
	 * Sets the maximimum number of ticks to the requested number. This is effected by changing the candleWidth.
	 * See also {@link CIQ.ChartEngine#setCandleWidth}.
	 *
	 * **Note**: if calling `setMaxTicks()` before `newChart()`, and the chart will result in a candle width less than `minimumCandleWidth`, `newChart()` will reset the candle size to the default candle size (8 pixels).
	 *
	 * @param {number} ticks The number of ticks wide to set the chart.
	 * @param {object} [params] Parameters to use with this function.
	 * @param {number} params.padding Whitespace in pixels to add to the right of the chart.
	 * 									Setting this field will home the chart to the most recent tick.
	 * 									To home the chart without padding the right side with whitespace, set padding to 0.
	 * 									Omitting the padding field will keep the chart scrolled to the same position.
	 * @since 2015-11-1 - params added
	 * @memberof CIQ.ChartEngine
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
	 * @memberof CIQ.ChartEngine
	 * @since 07/01/2015
	 */
	CIQ.ChartEngine.prototype.construct=function(){
		this.stackPanel("chart", "chart", 1);
		this.adjustPanelPositions();
		this.chart.panel=this.panels[this.chart.name];
		this.cx=0;
		this.cy=0;
		this.micropixels=0;
		if(this.controls.home) this.chart.panel.subholder.appendChild(this.controls.home);
		this.callbackListeners={
			/**
			 * Called on {@link CIQ.ChartEngine.AdvancedInjectable#touchDoubleClick} when the chart is quickly tapped twice.
			 * @callback doubleTapEventListener
			 * @param {object} data Data relevant to the "tap" event
			 * @param {CIQ.ChartEngine} data.stx The chart engine instance
			 * @param {number} data.finger Which finger double tapped
			 * @param {number} data.x The crosshair x position
			 * @param {number} data.y The crosshair y position
			 * @since 4.0.0
			 */
			doubleTap: [],
			/**
			 * Called when a drawing is added, removed or modified.
			 * Such as calling {@link CIQ.ChartEngine#clearDrawings}, {@link CIQ.ChartEngine#removeDrawing}, {@link CIQ.ChartEngine#undoLast}, {@link CIQ.ChartEngine#drawingClick}
			 * @callback drawingEventListener
			 * @param {object} data Data relevant to the "drawing" event
			 * @param {CIQ.ChartEngine} data.stx The chart engine instance
			 * @param {string} data.symbol The current chart symbol
			 * @param {object} data.symbolObject The symbol's value and display label (CIQ.ChartEngine.chart.symbolObject)
			 * @param {object} data.layout The chart's layout object (CIQ.ChartEngine.layout)
			 * @param {array} data.drawings The chart's current drawings (CIQ.Drawing)
			 */
			drawing: [],
			/**
			 * A right-click on a highlighted drawing.
			 *
			 * @callback drawingEditEventListener
			 * @param {object} data Data relevant to the "drawingEdit" event
			 * @param {CIQ.ChartEngine} data.stx The chart engine instance
			 * @param {CIQ.Drawing} data.drawing The highlighted drawing instance
			 */
			drawingEdit: [],
			/**
			 * Called when a change occurs in the chart layout.
			 * Such as calling {@link CIQ.ChartEngine#setChartType}, {@link CIQ.ChartEngine#setAggregationType}, {@link CIQ.ChartEngine#setChartScale}, {@link CIQ.ChartEngine#setAdjusted},
			 * {@link WebComponents.cq-toggle}, using the {@link WebComponents.cq-toolbar} to disable the current active drawing tool or toggling the crosshair,
			 * using the {@link WebComponents.cq-views} to activate a serialized layout, [modifying a series]{@link CIQ.ChartEngine#modifySeries},
			 * setting a new [periodicity]{@link CIQ.ChartEngine#setPeriodicity}, adding or removing a [study overlay]{@link CIQ.ChartEngine.AdvancedInjectable#removeOverlay},
			 * adding or removing any new panels (and they corresponding studies), [zooming in]{@link CIQ.ChartEngine#zoomIn} or [zooming out]{@link CIQ.ChartEngine#zoomOut},
			 * setting ranges with {@link CIQ.ChartEngine#setSpan} or {@link CIQ.ChartEngine#setRange}, nullifying a programmatically set Span or Range by user panning,
			 * enabling or disabling [Extended Hours]{@linkCIQ.ExtendedHours} or toggling the [range slider]{@link CIQ.RangeSlider}.
			 *
			 * **Note that scrolling and panning changes are not considered a layout change but rather a shift of the view window in the same layout.
			 * To detect those you can register to listen for [`move` events]{@link moveEventListener} **
			 *
			 * @callback layoutEventListener
			 * @param {object} data Data relevant to the "layout" event
			 * @param {CIQ.ChartEngine} data.stx The chart engine instance
			 * @param {string} data.symbol The current chart symbol
			 * @param {object} data.symbolObject The symbol's value and display label (CIQ.ChartEngine.chart.symbolObject)
			 * @param {object} data.layout The chart's layout object (CIQ.ChartEngine.layout)
			 * @param {array} data.drawings The chart's current drawings (CIQ.Drawing)
			 */
			layout: [],
			/**
			 * Called when the mouse is clicked on the chart and held down.
			 * @callback longholdEventListener
			 * @param {object} data Data relevant to the "longhold" event
			 * @param {CIQ.ChartEngine} data.stx The chart engine instance
			 * @param {string} data.panel The panel being tapped
			 * @param {number} data.x The crosshair x position
			 * @param {number} data.y The crosshair y position
			 */
			longhold: [],
			/**
			 * Called when the mouse is moved inside the chart; without scrolling.
			 * @callback moveEventListener
			 * @param {object} data Data relevant to the "move" event
			 * @param {CIQ.ChartEngine} data.stx The chart engine instance
			 * @param {string} data.panel The panel where the mouse is active
			 * @param {number} data.x The crosshair x position
			 * @param {number} data.y The crosshair y position
			 * @param {boolean} data.grabbingScreen True if the screen is being touched or clicked
			 */
			move: [],
			/**
			 * Called when the quoteFeed fetches a new primary series (symbol change).
			 * @callback newChartEventListener
			 * @param {object} data Data relevant to the "newChart" event
			 * @param {CIQ.ChartEngine} data.stx The chart engine instance
			 * @param {string} data.symbol The current chart symbol
			 * @param {object} data.symbolObject The symbol's value and display label (CIQ.ChartEngine.chart.symbolObject)
			 * @param {boolean} data.moreAvailable True if {@link quotefeed~dataCallback} reports that more data is available
			 * @param {object} data.quoteDriver The quoteFeed driver
			 */
			newChart: [],
			/**
			 * Called when preferences are changed. Such as {@link CIQ.ChartEngine#setTimeZone}, {@link CIQ.ChartEngine#importPreferences},
			 * {@link CIQ.Drawing.saveConfig}, {@link CIQ.Drawing.restoreDefaultConfig} or language changes using the {@link WebComponents.cq-language-dialog}.
			 * @callback preferencesEventListener
			 * @param {object} data Data relevant to the "preferences" event
			 * @param {CIQ.ChartEngine} data.stx The chart engine instance
			 * @param {string} data.symbol The current chart symbol
			 * @param {object} data.symbolObject The symbol's value and display label (CIQ.ChartEngine.chart.symbolObject)
			 * @param {object} data.layout The chart's layout object (CIQ.ChartEngine.layout)
			 * @param {array} data.drawingObjects The chart's current drawings (CIQ.ChartEngine.drawingObjects)
			 */
			preferences: [],
			/**
			 * Called on "mouseup" after the chart is right-clicked.
			 * @callback rightClickEventListener
			 * @param {object} data Data relevant to the "rightClick" event
			 * @param {CIQ.ChartEngine} data.stx The chart engine instance
			 * @param {string} panel The panel that was clicked on
			 * @param {number} data.x The crosshair x position
			 * @param {number} data.y The crosshair y position
			 */
			rightClick: [],
			/**
			 * Called when an overlay-type study is right clicked.
			 * @callback studyOverlayEditEventListener
			 * @param {object} data Data relevant to the "studyOverlayEdit" event
			 * @param {CIQ.ChartEngine} data.stx The chart engine instance
			 * @param {object} data.sd The study object studyDescriptor
			 * @param {object} data.inputs The inputs from the studyDescriptor
			 * @param {object} data.outputs The outputs from the studyDescriptor
			 * @param {object} data.parameters The parameters from the studyDescriptor
			 * @example
			 * stxx.addEventListener("studyOverlayEdit", function(studyData){
			 *	  CIQ.alert(studyData.sd.name);
			 *	  var helper=new CIQ.Studies.DialogHelper({name:studyData.sd.type,stx:studyData.stx});
			 *	  console.log('Inputs:',JSON.stringify(helper.inputs));
			 *	  console.log('Outputs:',JSON.stringify(helper.outputs));
			 *	  console.log('Parameters:',JSON.stringify(helper.parameters));
			 *	  // call your menu here with the  data returned in helper
			 *	  // modify parameters as needed and call addStudy or replaceStudy
			 * });
			 */
			studyOverlayEdit: [],
			/**
			 * Called when a panel-type study is edited
			 * @callback studyPanelEditEventListener
			 * @param {object} data Data relevant to the "studyPanelEdit" event
			 * @param {CIQ.ChartEngine} data.stx The chart engine instance
			 * @param {object} data.sd The study object studyDescriptor
			 * @param {object} data.inputs The inputs from the studyDescriptor
			 * @param {object} data.outputs The outputs from the studyDescriptor
			 * @param {object} data.parameters The parameters from the studyDescriptor
			 */
			studyPanelEdit: [],
			/**
			 * Called when the chart's symbols change. Including secondary series and underlying symbols for studies ( ie. price relative study)
			 * @callback symbolChangeEventListener
			 * @param {object} data Data relevant to the "symbolChange" event
			 * @param {CIQ.ChartEngine} data.stx The chart engine instance
			 * @param {string} data.symbol The new chart symbol
			 * @param {object} data.symbolObject The symbol's value and display label (CIQ.ChartEngine.chart.symbolObject)
			 * @param {string} data.action An action type being performed on the symbol. Possible options:
			 *	- `add-series` - A series was added
			 *	- `master` - The master symbol was changed
			 *	- `remove-series` - A series was removed
			 */
			symbolChange: [],
			/**
			 * Called when a symbol is imported into the layout. Including secondary series and underlying symbols for studies ( ie. price relative study)
			 * It is not called by other types of symbol changes.
			 * See {@link CIQ.Drawing#importLayout}
			 * @callback symbolImportEventListener
			 * @param {object} data Data relevant to the "symbolImport" event
			 * @param {CIQ.ChartEngine} data.stx The chart engine instance
			 * @param {string} data.symbol The new chart symbol
			 * @param {object} data.symbolObject The symbol's value and display label (CIQ.ChartEngine.chart.symbolObject)
			 * @param {string} data.action An action type being performed on the symbol. Possible options:
			 *   - `add-series` - A series was added
			 *   - `master` - The master symbol was changed
			 *   - `remove-series` - A series was removed
			 */
			symbolImport: [],
			/**
			 * Called on ["mouseup"]{@link CIQ.ChartEngine#touchSingleClick} when the chart is tapped.
			 * @callback tapEventListener
			 * @param {object} data Data relevant to the "tap" event
			 * @param {CIQ.ChartEngine} data.stx The chart engine instance
			 * @param {string} data.panel The panel being tapped
			 * @param {number} data.x The crosshair x position
			 * @param {number} data.y The crosshair y position
			 */
			tap: [],
			/**
			 * Called when a new theme is activated on the chart. Such as theme changes using the {@link WebComponents.cq-theme-dialog} or {@link WebComponents.cq-themes} initialization.
			 * @callback themeEventListener
			 * @param {object} data Data relevant to the "theme" event
			 * @param {CIQ.ChartEngine} data.stx The chart engine instance
			 * @param {string} data.symbol The current chart symbol
			 * @param {object} data.symbolObject The symbol's value and display label (CIQ.ChartEngine.chart.symbolObject)
			 * @param {object} data.layout The chart's layout object (CIQ.ChartEngine.layout)
			 * @param {array} data.drawingObjects The chart's current drawings (CIQ.ChartEngine.drawingObjects)
			 */
			theme: [],
			/**
			 * Called when an undo stamp is created for drawing events. See {@link CIQ.ChartEngine#undoStamp}
			 * @callback undoStampEventListener
			 * @param {object} data Data relevant to the "undoStamp" event
			 * @param {CIQ.ChartEngine} data.stx The chart engine instance
			 * @param {array} data.before The chart's array of drawingObjects before the change
			 * @param {array} data.after The chart's array of drawingsObjects after the change
			 */
			undoStamp: []
		};
		this.longHoldTime=1000;
	};

	/**
	 * Add a DOM element's event listener and index it so that it will be removed when invoking CIQ.ChartEngine.destroy().
	 * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
	 * @param {element} element DOM element to listen for changes on
	 * @param {string} event The event type to listen for. Possible values: https://developer.mozilla.org/en-US/docs/Web/Events
	 * @param {function} listener The callback to invoke when the event happens.
	 * @param {*} Either a boolean or object. See addEventListener options.
	 * @see {@link CIQ.ChartEngine#destroy}
	 * @private
	 * @since 3.0.0
	 */
	CIQ.ChartEngine.prototype.addDomEventListener=function(element, event, listener, options) {
		element.addEventListener(event, listener, options);
		this.eventListeners.push({
			element: element,
			event: event,
			'function': listener,
			options: options
		});
	};

	/**
	 * Register a listener to a chart event in the chart engine instance.
	 * Events are tracked in the `CIQ.ChartEngine.callbackListeners` object; which is READ ONLY, and should never be manually altered.
	 * Valid listeners:
	 *   - `*`: Passing in this value will register the listener to every event type below.
     *   - `doubleTap`: {@link doubleTapEventListener}
	 *   - `drawing`: {@link drawingEventListener}
	 *   - `layout`: {@link layoutEventListener}
	 *   - `longhold`: {@link longholdEventListener}
	 *   - `move`: {@link moveEventListener}
	 *   - `newChart`: {@link newChartEventListener}
	 *   - `rightClick`: {@link rightClickEventListener}
	 *   - `studyOverlayEdit`: {@link studyOverlayEditEventListener}
	 *   - `studyPanelEdit`: {@link studyPanelEditEventListener}
	 *   - `symbolChange`: {@link symbolChangeEventListener}
	 *   - `symbolImport`: {@link symbolImportEventListener}
	 *   - `tap`: {@link tapEventListener}
	 *   - `theme`: {@link themeEventListener}
	 *   - `undoStamp`: {@link undoStampEventListener}
	 * @param {string|array} type The event to listen for.
	 *		(See the description above for valid options.)
	 * @param {function} callback The listener to call when the event is triggered.
	 * @return {object} An object containing the `type` and `cb`. It can be passed to {@link CIQ.ChartEngine#removeEventListener} later to remove the event.
	 * @memberof CIQ.ChartEngine
	 * @since
	 * <br>&bull; 04-2016-08
	 * <br>&bull; 4.0.0 'doubleTap' is now available
	 * <br>&bull; 4.0.0 type can be an array of event options
	 * @example
	 * stxx.longHoldTime=... // Optionally override default value of 1000ms
	 * stxx.addEventListener("longhold", function(lhObject){
	 * 	CIQ.alert('longhold event at x: ' + lhObject.x + ' y: '+ lhObject.y);
	 * });
	 */
	CIQ.ChartEngine.prototype.addEventListener=function(type, callback){
		if (type === "*") {
			for (var key in this.callbackListeners) {
				this.callbackListeners[key].push(callback);
			}
		} else if (type instanceof Array) {
			for (var i=0; i<type.length; i++) {
				this.callbackListeners[type[i]].push(callback);
			}
		} else {
			var arr = this.callbackListeners[type];
			if (!arr) {
				throw new Error("Attempted to add an invalid listener.");
			}
			arr.push(callback);
		}
		return { type: type, cb: callback };
	};

	/**
	 * Remove a listener for an emitted chart event.
	 * Events are tracked in the {@link CIQ.ChartEngine.callbackListeners} object.
	 * @param {object} obj Object from {@link CIQ.ChartEngine#addEventListener}
	 * @memberof CIQ.ChartEngine
	 * @since 04-2016-08
	 */
	CIQ.ChartEngine.prototype.removeEventListener=function(obj, cb){
		if(!obj || typeof obj != "object") {
			// User likely passed in one argument into this function with the callback as the first parameter
			// This is accounted for because it is consistent with the argument schema of "addEventListener"
			obj = {
				type: obj,
				cb: cb
			};
		}

		var spliceEvent = function(arr, cb) {
			for(var i=0; i<arr.length; i++){
				if (arr[i] === cb) {
					arr.splice(i, 1);
					return;
				}
			}
		};
		var callbackListeners = this.callbackListeners;

		if (obj.type === "*") {
			for (var key in callbackListeners) {
				spliceEvent(callbackListeners[key], obj.cb);
			}
			return;
		}

		if (!callbackListeners[obj.type]) {
			throw new Error("Attempted to remove an invalid listener.");
		}

		spliceEvent(callbackListeners[obj.type], obj.cb);
	};

	/**
	 * Dispatches an event
	 *
	 * Returns false by default unless a developer explicitly returns a boolean value which can be used to bypass core functionality in the same manner as the Injection API
	 * ***Above, return logic currently only implemented with doubleTapEventListener but can be updated in the future to work with more.***
	 *
	 * @memberof CIQ.ChartEngine
	 * @param {string} type The callbackListener to call
	 * @param {object} data A collection of parameters to provide to the callback
	 * @return {boolean} Will always be false unless a developer purposely returns a true value from their callback
	 * @private
	 */
	CIQ.ChartEngine.prototype.dispatch=function(type, data){
		if(this.callbacks[type]) this.callbacks[type].call(this, data);
		var arr=this.callbackListeners[type];
		var rv;
		if(arr){
			for(var i=0;i<arr.length;i++)
				rv=arr[i].call(this, data);
				if(rv) return rv;
		}
		arr=this.callbackListeners["*"];
		if(arr){
			for(var j=0;j<arr.length;j++)
				rv=arr[j].call(this, data);
				if(rv) return rv;
		}
		return false;
	};

	/**
	 * Retrieves a Y-Axis based on its name property
	 * @param  {CIQ.ChartEngine.Panel} panel The panel
	 * @param  {string} name The name of the axis
	 * @return {CIQ.ChartEngine.YAxis} matching YAxis or undefined if none exists
	 * @memberof CIQ.ChartEngine
	 * @since 5.2.0
	 */
	CIQ.ChartEngine.prototype.getYAxisByName=function(panel, name){
		if(!panel) return undefined;
		if(typeof(panel)=="string") panel=this.panels[panel];
		if(name===panel.yAxis.name) return panel.yAxis;
		var i;
		for(i=0;panel.yaxisLHS && i<panel.yaxisLHS.length;i++){
			if(panel.yaxisLHS[i].name===name) return panel.yaxisLHS[i];
		}
		for(i=0;panel.yaxisRHS && i<panel.yaxisRHS.length;i++){
			if(panel.yaxisRHS[i].name===name) return panel.yaxisRHS[i];
		}
		return undefined;
	};

	/**
	 * Removes the yAxis from the panel if it is not being used by any current renderers. This could be the case
	 * if a renderer has been removed. It could also be the case if a renderer is not attached to any series.
	 * @param  {CIQ.ChartEngine.Panel} panel The panel
	 * @param  {CIQ.ChartEngine.YAxis} yAxis The axis to be removed
	 * @memberof CIQ.ChartEngine
	 * @since 07/01/2015
	 */
	CIQ.ChartEngine.prototype.deleteYAxisIfUnused=function(panel, yAxis){
		if(!yAxis || yAxis.name===panel.yAxis.name) return;
		for(var r in this.chart.seriesRenderers){
			var renderer=this.chart.seriesRenderers[r];
			if(renderer.params.yAxis && renderer.params.yAxis.name===yAxis.name){
				if(renderer.seriesParams.length!==0) return;
			}
		}
		var i;
		for(i=0;i<panel.yaxisLHS.length;i++){
			if(panel.yaxisLHS[i]===yAxis) panel.yaxisLHS.splice(i,1);
		}
		for(i=0;i<panel.yaxisRHS.length;i++){
			if(panel.yaxisRHS[i]===yAxis) panel.yaxisRHS.splice(i,1);
		}
		this.preAdjustScroll();
		this.resizeCanvas();
		this.adjustPanelPositions();
		this.postAdjustScroll();
	};

	/**
	 * Adds a yAxis to the specified panel. If the yAxis already exists then it is assigned its match from the panel.
	 * @param {CIQ.ChartEngine.Panel} panel The panel to add (i.e. stxx.chart.panel)
	 * @param {CIQ.ChartEngine.YAxis} yAxis The YAxis to add (create with new CIQ.ChartEngine.YAxis)
	 * @return {CIQ.ChartEngine.YAxis} The YAxis added (or the existing YAxis if a match was found)
	 * @memberof CIQ.ChartEngine
	 * @since 5.1.0 added return value
	 */
	CIQ.ChartEngine.prototype.addYAxis=function(panel, yAxis){
		if(!yAxis) return;
		if(!panel.yaxisLHS){ // initialize the arrays of y-axis. This will only happen once.
			panel.yaxisLHS=[];
			panel.yaxisRHS=[];
			// Our default y-axis goes into the array
			if(panel.yAxis.position=="left") panel.yaxisLHS.push(panel.yAxis);
			else panel.yaxisRHS.push(panel.yAxis);
		}
		var i, arr=panel.yaxisLHS;
		for(i=arr.length-1;i>=0;i--){
			if(arr[i].name===yAxis.name){
				if(yAxis.position=="left") return arr[i];
				arr.splice(i,1);
			}
		}
		arr=panel.yaxisRHS;
		for(i=arr.length-1;i>=0;i--){
			if(arr[i].name===yAxis.name){
				if(yAxis.position!="left") return arr[i];
				arr.splice(i,1);
			}
		}
		if(yAxis.position==="left"){
			panel.yaxisLHS.unshift(yAxis);
		}else{
			if(!yAxis.position) yAxis.position="right";
			panel.yaxisRHS.push(yAxis);
		}
		yAxis.height=panel.yAxis.height;

		this.preAdjustScroll();
		this.resizeCanvas();
		this.adjustPanelPositions();
		this.calculateYAxisMargins(yAxis);
		this.postAdjustScroll();
		return yAxis;
	};
	/**
	 * This method calculates the left and width members of each y-axis.
	 *
	 * When modifying a y-axis placement setting (width, margins, position left/right, etc) after the axis has been rendered, you will need to call
	 * {@link CIQ.ChartEngine#calculateYAxisMargins} or this function, followed by {@link CIQ.ChartEngine#draw} to activate the change.
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.calculateYAxisPositions=function(){
		// We push all the charts to the fore because panel widths will depend on what is calculated for their chart
		var panelsInOrder=[], chart=this.chart;
		for(var chartName in this.charts){
			if(this.charts[chartName].hidden) continue;
			panelsInOrder.push(chartName);
		}
		for(var panelName in this.panels){
			var p=this.panels[panelName];
			if(p.name===p.chart.name || p.hidden) continue;
			panelsInOrder.push(panelName);
		}

		var tickWidth=this.drawBorders?3:0; // pixel width of tick off edge of border
		var maxTotalWidthLeft=0, maxTotalWidthRight=0, i, j, panel, yaxis;
		for(j=0;j<panelsInOrder.length;j++){
			panel=this.panels[panelsInOrder[j]];
			if(!panel) continue; // this could happen if a chart panel doesn't exist yet (for instance when importLayout)
			if(!panel.yaxisLHS){ // initialize the arrays of y-axis. This will only happen once.
				panel.yaxisLHS=[];
				panel.yaxisRHS=[];
			}
			// Our default y-axis goes into the array
			var position=panel.yAxis.position; // get default position of the yaxis for the chart
			if(!position) position=panel.chart.panel.yAxis.position; // Unless specified, the y-axis position for panels will follow the chart default
			for(i=0;i<panel.yaxisLHS.length;i++){
				if(panel.yaxisLHS[i].name==panel.yAxis.name) {
					panel.yaxisLHS.splice(i,1); break;
				}
			}
			for(i=0;i<panel.yaxisRHS.length;i++){
				if(panel.yaxisRHS[i].name==panel.yAxis.name) {
					panel.yaxisRHS.splice(i,1); break;
				}
			}
			if(position=="left"){
				panel.yaxisLHS.push(panel.yAxis);
			}else{
				panel.yaxisRHS.unshift(panel.yAxis);
			}
			if(!panel.yAxis.width && panel.yAxis.width!==0) panel.yAxis.width=this.yaxisWidth; // legacy default for main axis

			// Calculate the total amount of space to be allocated to the yaxis
			panel.yaxisTotalWidthRight=0;
			panel.yaxisTotalWidthLeft=0;
			var arr=panel.yaxisLHS.concat(panel.yaxisRHS);
			for(i=0;i<arr.length;i++){
				yaxis=arr[i];
				if(yaxis.noDraw || !yaxis.width) continue;
				if(yaxis.position=="left" || (position=="left" && !yaxis.position)){
					panel.yaxisTotalWidthLeft+=yaxis.width;
				}else{
					panel.yaxisTotalWidthRight+=yaxis.width;
				}
			}
			if(panel.yaxisTotalWidthLeft>maxTotalWidthLeft) maxTotalWidthLeft=panel.yaxisTotalWidthLeft;
			if(panel.yaxisTotalWidthRight>maxTotalWidthRight) maxTotalWidthRight=panel.yaxisTotalWidthRight;
		}
		for(j=0;j<panelsInOrder.length;j++){
			panel=this.panels[panelsInOrder[j]];
			if(!panel) continue; // this could happen if a chart panel doesn't exist yet (for instance when importLayout)
			var isAChart=panel.name===panel.chart.name;

			// Now calculate the position of each axis within the canvas
			var x=maxTotalWidthLeft;
			for(i=panel.yaxisLHS.length-1;i>=0;i--){
				yaxis=panel.yaxisLHS[i];
				if(yaxis.noDraw) continue;
				x-=yaxis.width;
				yaxis.left=x;
			}
			x=this.width-maxTotalWidthRight;
			for(i=0;i<panel.yaxisRHS.length;i++){
				yaxis=panel.yaxisRHS[i];
				if(yaxis.noDraw) continue;
				yaxis.left=x;
				x+=yaxis.width;
			}

			if(typeof this.yaxisLeft!="undefined") panel.chart.yaxisPaddingRight=this.yaxisLeft; // support legacy use of yaxisLeft
			// Calculate the padding. This is enough space for the y-axis' unless overridden by the developer.
			panel.yaxisCalculatedPaddingRight=maxTotalWidthRight;
			if(panel.chart.yaxisPaddingRight || panel.chart.yaxisPaddingRight===0) panel.yaxisCalculatedPaddingRight=panel.chart.yaxisPaddingRight;
			panel.yaxisCalculatedPaddingLeft=maxTotalWidthLeft;
			if(panel.chart.yaxisPaddingLeft || panel.chart.yaxisPaddingLeft===0) panel.yaxisCalculatedPaddingLeft=panel.chart.yaxisPaddingLeft;

			if(isAChart){
				panel.left=panel.yaxisCalculatedPaddingLeft;
				panel.right=this.width-panel.yaxisCalculatedPaddingRight;
			}else{
				panel.left=panel.chart.panel.left;
				panel.right=panel.chart.panel.right;
			}
			panel.width=panel.right-panel.left;
			if(panel.handle) {
				panel.handle.style.left=panel.left+"px";
				panel.handle.style.width=panel.width+"px";
			}

			if(isAChart){
				// Store this in the chart too
				panel.chart.left=panel.left;
				panel.chart.right=panel.right;
				panel.chart.width=Math.max(panel.right-panel.left,0); // negative chart.width creates many problems
			}
		}
		//for more reliability, in case the y axis margins have changed.
		this.setCandleWidth(this.layout.candleWidth);
		this.adjustPanelPositions();  // fixes the subholder dimensions in light of possible axis position changes
	};

 	/**
	 * This method determines and returns the existing position of a y-axis, as set by {@link CIQ.ChartEngine.YAxis#position} or {@link CIQ.ChartEngine#setYAxisPosition}.
	 * 
	 * @param {CIQ.ChartEngine.YAxis} yAxis The YAxis whose position is to be found
	 * @param  {CIQ.ChartEngine.Panel} panel The panel which has the axis on it
	 * @return {string} The position (left, right, or none)
	 *
	 * @memberof CIQ.ChartEngine
	 * @since 6.2.0
	 */
	CIQ.ChartEngine.prototype.getYAxisCurrentPosition=function(yAxis, panel){
		if(!yAxis.width) return "none";
		var arr=panel.yaxisLHS;
		for(var i=0;i<arr.length;i++){
			if(arr[i].name==yAxis.name) return "left";
		}
		return "right";
	};

 	/**
	 * Sets the y-axis position and recalculates the positions.
	 * 
	 * Always use this method on existent y-axis rather than changing {@link CIQ.ChartEngine.YAxis#position}
	 * @param {CIQ.ChartEngine.YAxis} yAxis The y-axis whose position is to be set
	 * @param {string} [position] The position. Valid options:"left", "right", "none", or null. 
	 * @memberof CIQ.ChartEngine
	 * @since 6.2.0
	 */
	CIQ.ChartEngine.prototype.setYAxisPosition=function(yAxis, position){
		yAxis.position=position;
		yAxis.width=position=="none"?0:CIQ.ChartEngine.YAxis.prototype.width;
		this.calculateYAxisPositions();
		this.draw();
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * This method initializes the chart container events, such as window `resize` events,
	 * and the [resizeTimer]{@link CIQ.ChartEngine#setResizeTimer} to ensure the chart adjusts as its container size changes.
	 * It also initializes various internal variables, the canvas and creates the chart panel.
	 *
	 * This is called by {@link CIQ.ChartEngine#newChart} and should rarely be called directly.
	 *
	 * Note that the candle width will be reset to 8px if larger than 50px. Even if the value comes from a layout import.
	 * This is done to ensure a reasonable candle size is available across devices that may have different screen size.
	 *
	 * @memberof CIQ.ChartEngine
	 *
	 */
	CIQ.ChartEngine.prototype.initializeChart=function(container){
		if(this.runPrepend("initializeChart", arguments)) return;
		if (!this.chart.symbolObject.symbol) this.chart.symbolObject.symbol = this.chart.symbol;	// for backwards compatibility so the symbol object is always initialized in case we don't use newChart()
		if(this.locale) this.setLocale(this.locale);
		if(!this.displayZone && CIQ.ChartEngine.defaultDisplayTimeZone){
			this.setTimeZone(null, CIQ.ChartEngine.defaultDisplayTimeZone);
		}
		this.resetDynamicYAxis({noRecalculate: true});
		this.calculateYAxisPositions();
		this.micropixels=0;

		if(container) this.chart.container=container;
		else container=this.chart.container;
		container.stx=this;
		if(!container.CIQRegistered){
			container.CIQRegistered=true;
			CIQ.ChartEngine.registeredContainers.push(container);
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
			canvas=this.chart.canvas=$$$(".ie8canvas",container);
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
			tempCanvas=this.chart.tempCanvas=$$$(".ie8canvasTemp",container);
			if(!tempCanvas.getContext){	//IE8, didn't initialize canvas yet, we will do manually
				if(window.G_vmlCanvasManager) G_vmlCanvasManager.initElement(tempCanvas);
			}
		}else{
			container.appendChild(tempCanvas);
		}

		tempCanvas.style.position="absolute";
		tempCanvas.style.left="0px";
		tempCanvas.context=this.chart.tempCanvas.getContext("2d");
		tempCanvas.context.lineWidth=1;
		tempCanvas.style.display="none";

		if(!this.floatCanvas) floatCanvas=this.floatCanvas=document.createElement("canvas");
		if(!this.floatCanvas.getContext){
			floatCanvas=this.floatCanvas=$$$(".ie8canvasFloat",container);
			if(!floatCanvas.getContext){  //IE8, didn't initialize canvas yet, we will do manually
				if(window.G_vmlCanvasManager) G_vmlCanvasManager.initElement(floatCanvas);
			}
		}else{
			container.appendChild(floatCanvas);
		}

		floatCanvas.style.position="absolute";
		floatCanvas.style.left="0px";
		floatCanvas.context=floatCanvas.getContext("2d");
		floatCanvas.context.lineWidth=1;
		floatCanvas.style.display="none";

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
		chart.panel.display=chart.symbol;
		if(chart.symbolDisplay) chart.panel.display=chart.symbolDisplay;
		this.adjustPanelPositions();
		this.chart.panel=panels[chart.name];

		for(var p in panels){
			var yAxes=panels[p].yaxisLHS.concat(panels[p].yaxisRHS);
			for (var a=0;a<yAxes.length;a++) {
				yAxes[a].height=panels[p].yAxis.height;  // set the [overlay] yAxis height to the panel's main yAxis height...
				this.calculateYAxisMargins(yAxes[a]);	// ...so this will work
			}
		}

		this.initialWhitespace=this.preferences.whitespace;
		if(chart.dataSet && chart.dataSet.length>0){
			chart.scroll=Math.floor(chart.width/this.layout.candleWidth);//this.chart.maxTicks;
			var wsInTicks=Math.round(this.preferences.whitespace/this.layout.candleWidth);
			chart.scroll-=wsInTicks;
		}
		if(CIQ.touchDevice){
			var overlayEdit=$$$(".overlayEdit", container);
			var overlayTrashCan=$$$(".overlayTrashCan", container);
			var vectorTrashCan=$$$(".vectorTrashCan", container);
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
			if(this.controls.chartControls){
				this.controls.chartControls.style.display="block";
			}
		}
		container.onmouseout=(function(self){return function(e){self.handleMouseOut(e);};})(this);

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
			var self = this;
			this.resizeListenerInitialized=true;
			var resizeListener = function(){
				return function(e){
					self.resizeChart();
				};
			};
			this.addDomEventListener(window, "resize", resizeListener(), true);
		}
		if(chart.baseline.userLevel) chart.baseline.userLevel=null;
		// This sets the interval timer which checks fore resize condition every X milliseconds (if non zero)
		this.setResizeTimer(this.resizeDetectMS);
		this.runAppend("initializeChart", arguments);
	};

	/**
	 * Clears out a chart engine instantiated with [new CIQ.ChartEngine();]{@link CIQ.ChartEngine},
	 * eliminating all references including the resizeTimer, quoteDriver, styles and eventListeners.
	 *
	 * It's still up to the developer to set the declared pointer for the instance to null so that the garbage collector can remove it.
	 *
	 * This method should only be used when you no longer need the chart engine and **never** be used in between {@link CIQ.ChartEngine#newChart} calls to load or change symbols.
	 * @memberof CIQ.ChartEngine
	 * @example
	 * // create
	 * var stxx=new CIQ.ChartEngine({container: $$$(".chartContainer")});
	 * 
	 * //destroy
	 * stxx.destroy();
	 *
	 * //remove
	 * stxx = null;
	 */
	CIQ.ChartEngine.prototype.destroy=function(){
		this.setResizeTimer(0);
		if(this.quoteDriver) this.quoteDriver.die();
		this.styles={}; // Get rid of any external style references that could cause us to hang around
		for(var i=0;i<this.eventListeners.length;i++){
			var listener=this.eventListeners[i];
			listener.element.removeEventListener(listener.event, listener["function"], listener.options);
		}
		if( this.streamParameters.timeout ) clearTimeout(this.streamParameters.timeout);

		// remove chart container from registeredContainers
		var registeredContainers=CIQ.ChartEngine.registeredContainers;
		var chartIndex = registeredContainers.indexOf(this.chart.container);
		if(chartIndex > -1) {
			registeredContainers.splice(chartIndex,1);
		}

		// remove matching range slider
		if(this.slider){
			var sliderIndex = registeredContainers.indexOf(this.slider.slider.chart.container);
			if(sliderIndex > -1) {
				registeredContainers.splice(sliderIndex,1);
			}
		}
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * This is called whenever the mouse leaves the chart area. Crosshairs are disabled, stickies are hidden, dragDrawings are completed.
	 * @param  {Event} e The mouseout event
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
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
			this.findHighlights(false,true);
			this.runAppend("handleMouseOut", arguments);
		}
	};

	/**
	 * Registers touch and mouse events for the chart (for dragging, clicking, zooming). The events are registered on the container div (not the canvas).
	 * Set {@link CIQ.ChartEngine#manageTouchAndMouse} to false to disable the built in event handling (events will not be registered with the container).
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.registerTouchAndMouseEvents=function(){
		if(this.touchAndMouseEventsRegistered) return;
		this.touchAndMouseEventsRegistered=true;
		var zoomInEl=$$$(".stx-zoom-in", this.controls.chartControls);
		var zoomOutEl=$$$(".stx-zoom-out", this.controls.chartControls);
		var containerElement = this.chart.container;
		var self = this;
		var addListener = function(event, listener) {
			self.addDomEventListener(containerElement, event, listener);
		};
		if(!CIQ.touchDevice){
			addListener("mousemove", function(e){ self.mousemove(e); });
			addListener("mouseenter", function(e){ self.mousemove(e); });
			addListener("mousedown", function(e){ self.mousedown(e); });
			addListener("mouseup", function(e){self.mouseup(e);});
		}else{
			if(CIQ.isSurface){
				addListener("mousemove", function(e){ self.msMouseMoveProxy(e);});
				addListener("mouseenter", function(e){ self.msMouseMoveProxy(e); });
				addListener("mousedown", function(e){ self.msMouseDownProxy(e);});
				addListener("mouseup", function(e){ self.msMouseUpProxy(e);});

				addListener("pointerdown", function(e){ return self.startProxy(e); });
				addListener("pointermove",  function(e){ self.moveProxy(e); });
				addListener("pointerenter", function(e){ return self.moveProxy(e); });
				addListener("pointerup", function(e){ return self.endProxy(e); });

			}else{
				// We need mouse events for all-in-one computers that accept both mouse and touch commands
				// Actually, only for Firefox and Chrome browsers. IE10 sends pointers which are managed by the isSurface section
				if(!CIQ.isAndroid && !CIQ.ipad && !CIQ.iphone){
					addListener("mousemove", function(e){ self.iosMouseMoveProxy(e); });
					addListener("mouseenter", function(e){ self.iosMouseMoveProxy(e); });
					addListener("mousedown", function(e){ self.iosMouseDownProxy(e); });
					addListener("mouseup", function(e){ self.iosMouseUpProxy(e); });
				}

				addListener("touchstart", function(e){ self.touchstart(e); });
				addListener("touchmove", function(e){ self.touchmove(e); });
				addListener("touchend", function(e){ self.touchend(e); });

				// capture a "pen" device, so we can treat it as a mouse
				addListener("pointerdown", function(e){ self.touchPointerType=e.pointerType; });

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

		var wheelEvent = CIQ.wheelEvent;

		if(this.captureMouseWheelEvents) {
			this.addDomEventListener(
				containerElement,
				wheelEvent,
				function(e){ self.mouseWheel(e); }
			);
		}

	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * This function is called when the user right clicks on a highlighted overlay, series or drawing.<br>
	 * Calls deleteHighlighted() which calls rightClickOverlay() for studies.
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias rightClickHighlighted
	 * @example
	 * stxx.prepend("rightClickHighlighted", function(){
	 * 	console.log('do nothing on right click');
	 * 	return true;
	 * });
	 */
	CIQ.ChartEngine.prototype.rightClickHighlighted=function(){
		if(this.runPrepend("rightClickHighlighted", arguments)) return;
		this.deleteHighlighted(true);
		this.runAppend("rightClickHighlighted", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Removes any and all highlighted overlays, series or drawings.
	 * @param {boolean} callRightClick when true, call the right click method for the given highlight
	 * <br>&bull; drawing highlight calls {CIQ.ChartEngine#rightClickDrawing}
	 * <br>&bull; overlay study highlight calls {CIQ.ChartEngine#rightClickOverlay}
	 * @param {boolean} forceEdit skip the context menu and begin editing immediately, usually for touch devices
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias deleteHighlighted
	 * @since
	 * <br>&bull; 4.1.0 Removes a renderer from the chart if it has no series attached to it.
	 * <br>&bull; 6.2.0 Calls {CIQ.ChartEngine#rightClickDrawing} when a drawing is highlighted and the `callRightClick` argument is true.
	 */
	CIQ.ChartEngine.prototype.deleteHighlighted=function(callRightClick, forceEdit){
		if(this.runPrepend("deleteHighlighted", arguments)) return;
		this.cancelTouchSingleClick=true;
		CIQ.clearCanvas(this.chart.tempCanvas, this);
		var canDeleteAll=this.bypassRightClick===false;
		if(canDeleteAll || !this.bypassRightClick.drawing) {
			for(var i=this.drawingObjects.length-1;i>=0;i--){
				var drawing=this.drawingObjects[i];

				if (!drawing.highlighted) continue;

				if (callRightClick) {
					this.rightClickDrawing(drawing, forceEdit);
				} else if (!drawing.permanent) {
					var dontDeleteMe=drawing.abort();
					if(!dontDeleteMe){
						var before=CIQ.shallowClone(this.drawingObjects);
						this.drawingObjects.splice(i,1);
						this.undoStamp(before, CIQ.shallowClone(this.drawingObjects));
					}
					this.changeOccurred("vector");
				}
			}
		}
		if(canDeleteAll || !this.bypassRightClick.study) {
			for(var name in this.overlays){
				var o=this.overlays[name];
				if(o.highlight && !o.permanent){
					if(callRightClick || forceEdit) this.rightClickOverlay(name, forceEdit);
					else this.removeOverlay(name);
				}
			}
		}

		var chart=this.currentPanel.chart;
		if(canDeleteAll || !this.bypassRightClick.series) {
			for(var r in chart.seriesRenderers){
				var renderer=chart.seriesRenderers[r];
				for(var sp=renderer.seriesParams.length-1;sp>=0;sp--){
					var series=renderer.seriesParams[sp];
					if(series.highlight && !series.permanent) {
						renderer.removeSeries(series.id);
						if(renderer.seriesParams.length<1) this.removeSeriesRenderer(renderer);
					}
				}
			}
		}

		this.draw();
		this.clearMeasure();
		var mSticky=this.controls.mSticky;
		if(mSticky){
			mSticky.style.display="none";
			mSticky.children[0].innerHTML="";
		}
		this.runAppend("deleteHighlighted", arguments);
	};

	/**
	 * Returns true if the panel exists
	 * @param  {string} name Name of panel to search for
	 * @return {boolean}	  True if the panel exists
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.panelExists=function(name){
		for(var p in this.panels){
			var panel=this.panels[p];
			if(panel.name==name) return true;
		}
		return false;
	};

	/**
	 * Use this method to temporarily hide an enabled crosshair.
	 * Usually as part of a custom drawing or overlay to prevent the crosshair to display together with the custom rendering.
	 *
	 * See <a href="CIQ.ChartEngine.html#layout%5B%60crosshair%60%5D">CIQ.ChartEngine.layout.crosshair</a> to enable/disable the crosshair.
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.hideCrosshairs=function(){
		this.displayCrosshairs=false;
	};

	/**
	 * Re-displays a crosshair temporarily hidden by {@link CIQ.ChartEngine#hideCrosshairs}
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.showCrosshairs=function(){
		this.displayCrosshairs=true;
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Event handler that is called when the handle of a panel is grabbed, for resizing
	 * @param  {Event} e	 The mousedown or touchdown event
	 * @param  {CIQ.ChartEngine.Panel} panel The panel that is being grabbed
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias grabHandle
	 */
	CIQ.ChartEngine.prototype.grabHandle=function(panel){
		if(this.runPrepend("grabHandle", arguments)) return ;
		//if(e.preventDefault) e.preventDefault();
		if(!panel) return;
		CIQ.ChartEngine.crosshairY=panel.top+this.top;
		CIQ.ChartEngine.resizingPanel=panel;
		CIQ.appendClassName(panel.handle, "stx-grab");
		this.runAppend("grabHandle", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Event handler that is called when a panel handle is released.
	 * @param  {Event} e The mouseup or touchup event
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias releaseHandle
	 */
	CIQ.ChartEngine.prototype.releaseHandle=function(){
		if(this.runPrepend("releaseHandle", arguments)) return true;
		//if(e.preventDefault) e.preventDefault();
		CIQ.clearCanvas(this.chart.tempCanvas, this);
		this.resizePanels();
		if(CIQ.ChartEngine.resizingPanel) CIQ.unappendClassName(CIQ.ChartEngine.resizingPanel.handle, "stx-grab");
		CIQ.ChartEngine.resizingPanel=null;
		this.runAppend("releaseHandle", arguments);
	};

	/**
	 * Takes the existing panels and stores them in the layout.
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.storePanels=function(){
		if(!this.layout) this.layout={};
		var view=this.layout;
		view.panels={};
		for(var p in this.panels){
			var panel=this.panels[p];
			view.panels[panel.name]={
				"percent": panel.percent,
				"display": panel.display,
				"yAxis": panel.yAxis
			};
		}
	};

	/**
	 * Saves the panel state in the layout. Called whenever there is a change to panel layout (resizing, opening, closing).
	 * @param  {boolean} saveLayout If false then a change event will not be called. See (@link CIQ.ChartEngine#changeOccurred)
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.savePanels=function(saveLayout){
		this.storePanels();
		if(saveLayout!==false) this.changeOccurred("layout");
	};

	/**
	 * Returns the absolute screen position given a Y pixel on the canvas
	 * @param  {number} y Y pixel on the canvas
	 * @return {number}	  Absolute Y screen position
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.resolveY=function(y){
		return this.top + y;
	};

	/**
	 * Returns the absolute screen position given a X pixel on the canvas
	 * @param  {number} x X pixel on the canvas
	 * @return {number}	  Absolute X screen position
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.resolveX=function(x){
		return this.left + x;
	};

	/**
	 * Returns the relative canvas position given an absolute Y position on the screen
	 * @param  {number} y Y pixel on the screen
	 * @return {number}	  Relative Y position on canvas
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.backOutY=function(y){
		return y - this.top;
	};

	/**
	 * Returns the relative canvas position given an absolute X position on the screen
	 * @param  {number} x X pixel on the screen
	 * @return {number}	  Relative X position on canvas
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.backOutX=function(x){
		return x - this.left;
	};

	/**
	 * Cleans up a removed study. called by {@link CIQ.ChartEngine#privateDeletePanel} or {@link CIQ.ChartEngine#removeOverlay}
	 * Calls removeFN, and plugins associated with study.
	 * Finally, removes study from layout.
	 * @param  {CIQ.ChartEngine} stx A chart object
	 * @param  {object} sd  A study descriptor
	 * @memberof CIQ.ChartEngine
	 * @private
	 * @since 2015-11-1
	 */
	CIQ.ChartEngine.prototype.cleanupRemovedStudy=function(sd){
		if(sd.study.removeFN) sd.study.removeFN(this,sd);
		// delete any plugins associated with this study
		for(var p in this.plugins){
			if(p.indexOf("{"+sd.id+"}")>-1) delete this.plugins[p];
		}
		if(this.layout.studies) delete this.layout.studies[sd.name];
		delete this.overlays[sd.name];
		CIQ.Studies.removeStudySymbols(sd, this);
		if(this.quoteDriver) this.quoteDriver.updateSubscriptions();
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
				this.cleanupRemovedStudy(this.layout.studies[series]);
				delete this.overlays[series];
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
		if(panel.handle) panel.handle.parentNode.removeChild(panel.handle);
		//if(drawingDeleted) this.changeOccurred("vector");
		this.currentPanel=null;
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Closes the panel opened with {@link CIQ.ChartEngine.AdvancedInjectable#createPanel}.
	 * This is called when a chart panel is closed manually or programmatically.
	 * For example, after removing a study panel with the {@link CIQ.Studies.removeStudy} function, or when a user clicks on the "X" for a panel.
	 * @param  {CIQ.ChartEngine.Panel} panel The panel to close
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
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
		if(!this.currentlyImporting) { // silent mode while importing
			this.showCrosshairs();
			this.createDataSet();
			this.resetDynamicYAxis({noRecalculate: true});
			this.calculateYAxisPositions();
			this.draw();
			this.savePanels();
		}
		// IE11 on Win7 hack. We do this in case the mouseup is lost when we removed the panel.close from the DOM
		this.userPointerDown=this.grabbingScreen=false;
		if(this.openDialog) this.openDialog="";
		this.runAppend("panelClose", arguments);
	};

	/**
	 * Deletes all of the panels (except for the default chart panel)
	 * @memberof CIQ.ChartEngine
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
	 * @memberof CIQ.ChartEngine
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
	 * @memberof CIQ.ChartEngine
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
	 * Note if {@link CIQ.ChartEngine#soloPanelToFullScreen} is set than even the chart panel may be hidden
	 * @param  {CIQ.ChartEngine.Panel} panel The panel to be soloed.
	 * @memberof CIQ.ChartEngine
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
			if(panel.name!="chart" && !this.soloPanelToFullScreen){
				this.chart.panel.percent=this.chart.panel.oldPercent;
			}
			if(this.soloPanelToFullScreen){
				this.xAxisAsFooter=this.chart.panel.oldXAxisAsFooter;
				if(this.controls.home) this.chart.panel.subholder.appendChild(this.controls.home);
			}
		}else{
			panel.soloing=true;
			CIQ.appendClassName(panel.solo,"stx_solo_lit");
			panel.oldPercent=panel.percent;
			this.chart.panel.oldXAxisAsFooter=this.xAxisAsFooter;
			if(panel.name!="chart"){
				if(this.soloPanelToFullScreen){
					this.xAxisAsFooter=true;
					if(this.controls.home) panel.subholder.appendChild(this.controls.home);
				}else{
					this.chart.panel.oldPercent=this.chart.panel.percent;
					panel.percent=1-this.chart.panel.percent;
				}
			}
		}
		for(var p in this.panels){
			this.panels[p].hidden=hideOrNot;
		}
		if(!this.soloPanelToFullScreen) this.chart.panel.hidden=false;
		panel.hidden=false;
		this.resetDynamicYAxis({noRecalculate: true});
		this.calculateYAxisPositions();
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
	 * @memberof CIQ.ChartEngine
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
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias adjustPanelPositions
	 */
	CIQ.ChartEngine.prototype.adjustPanelPositions=function(){
		if(this.chart.tempCanvas) CIQ.clearCanvas(this.chart.tempCanvas, this); // clear any drawing in progress
		if(!this.chart.symbol) return;
		if(this.runPrepend("adjustPanelPositions", arguments)) return;
		var lastBottom=0;
		var h=this.chart.canvasHeight;
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
			if(this.manageTouchAndMouse){
				if(panel.up){
					if(!first){
						first=true;
						CIQ.unappendClassName(panel.up, "stx-show");
					}else{
						if(this.displayIconsUpDown) CIQ.appendClassName(panel.up, "stx-show");
					}
				}
				if(panel.solo){
					if(activeSolo){
						if(panel.soloing){
							if(this.displayIconsSolo) CIQ.appendClassName(panel.solo, "stx-show");
						}else{
							CIQ.unappendClassName(panel.solo, "stx-show");
						}
					}else if(n==1){
						CIQ.unappendClassName(panel.solo, "stx-show");
					}else if(n==2 && !this.soloPanelToFullScreen){
						CIQ.unappendClassName(panel.solo, "stx-show");
					}else{
						if(this.displayIconsSolo) CIQ.appendClassName(panel.solo, "stx-show");
					}
				}
				if(panel.down){
					if(n==1){
						CIQ.unappendClassName(panel.down, "stx-show");
					}else{
						if(this.displayIconsUpDown) CIQ.appendClassName(panel.down, "stx-show");
					}
				}
				if(panel.edit){
					if(panel.editFunction) CIQ.appendClassName(panel.edit, "stx-show");
					else CIQ.unappendClassName(panel.edit, "stx-show");
				}
				if(panel.close){
					if(this.displayIconsClose) CIQ.appendClassName(panel.close, "stx-show");
					else CIQ.unappendClassName(panel.close, "stx-show");
				}
			}

			panel.percent=panel.percent/acc;
			panel.top=lastBottom;
			panel.bottom=panel.top+(h*panel.percent);
			panel.height=panel.bottom-panel.top;
			if(panel.chart.name==panel.name){
				panel.chart.top=panel.top;
				panel.chart.bottom=panel.bottom;
				panel.chart.height=panel.height;
			}

			lastBottom=panel.bottom;

			var arr=panel.yaxisLHS.concat(panel.yaxisRHS);
			for(var yax=0;yax<arr.length;yax++){
				var yAxis=arr[yax];

				if(yAxis.zoom && yAxis.height>0){
					zoomRatio=yAxis.zoom/yAxis.height;
				}
				this.adjustYAxisHeightOffset(panel,yAxis);
				yAxis.height=yAxis.bottom-yAxis.top;
				if(zoomRatio){
					yAxis.zoom=zoomRatio*yAxis.height;
					if(yAxis.zoom>yAxis.height) {
						//console.log('adjustPanelPositions adjusted zoom and scroll to 0',yAxis.zoom,yAxis.height);
						yAxis.zoom=0; // If the zoom is greater than the height then we'll have an upside down y-axis
						yAxis.scroll=0;
					}
				}

				if(!yAxis.high && yAxis.high!==0){	// panels without values will use percentages to position drawings
					yAxis.high=100;
					yAxis.low=0;
					yAxis.shadow=100;
				}
				yAxis.multiplier=yAxis.height/yAxis.shadow;
			}

			if(panel.holder){
				panel.holder.style.right="0px";
				panel.holder.style.top=panel.top+"px";
				panel.holder.style.left="0px";
				panel.holder.style.height=panel.height+"px";

				panel.subholder.style.left=panel.left+"px";
				panel.subholder.style.width=panel.width+"px";
				panel.subholder.style.top="0px";
				if(panel.yAxis.height>=0) panel.subholder.style.height=panel.yAxis.height+"px";
			}
		}
		if(x && this.panels[x].down) CIQ.unappendClassName(this.panels[x].down,"stx-show");
		if(this.manageTouchAndMouse && n==2 && !activeSolo && this.chart.panel.solo){
			CIQ.appendClassName(this.chart.panel.solo, "stx-show");
		}
		if(this.controls.chartControls && this.chart.panel){
			var bottom;
			if(activeSolo && this.soloPanelToFullScreen){
				bottom=this.chart.canvasHeight-panel.yAxis.bottom+12;
			}else{
				bottom=this.chart.canvasHeight-this.chart.panel.yAxis.bottom+12;
			}
			this.controls.chartControls.style.bottom=bottom+"px";
		}
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
	 * Create a new panel and make room for it by squeezing all the existing panels.
	 * To remove a panel manually call {@link CIQ.ChartEngine.AdvancedInjectable#panelClose}.
	 * @param  {string} display	  The display name for the panel
	 * @param  {string} name	  The name of the panel (usually the study ID)
	 * @param  {number} [height]	Requested height of panel in pixels. Defaults to 1/5 of the screen size.
	 * @param  {string} [chartName] The chart to associate with this panel. Defaults to "chart".
	 * @param {CIQ.ChartEngine.YAxis} [yAxis] {@link CIQ.ChartEngine.YAxis} object. If not present, the existing panel's axis will be used.
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias createPanel
	 * @since 5.2.0 added argument yAxis
	 */
	CIQ.ChartEngine.prototype.createPanel=function(display, name, height, chartName, yAxis){
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
		this.stackPanel(display, name, percent, chartName, yAxis);
		this.adjustPanelPositions();
		this.savePanels(false);
		this.runAppend("createPanel", arguments);
	};

	/**
	 * Configures the panel controls
	 * @param  {CIQ.ChartEngine.Panel} panel The panel
	 * @private
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.configurePanelControls=function(panel){
		if(!panel.icons) return;
		var isChart=(panel.name==panel.chart.name);

		CIQ.appendClassName(panel.icons, "stx-show");

		panel.title=$$$(".stx-panel-title", panel.icons);
		panel.up=$$$(".stx-ico-up", panel.icons); if(panel.up) panel.up=panel.up.parentNode;
		panel.solo=$$$(".stx-ico-focus", panel.icons); if(panel.solo) panel.solo=panel.solo.parentNode;
		panel.down=$$$(".stx-ico-down", panel.icons); if(panel.down) panel.down=panel.down.parentNode;
		panel.edit=$$$(".stx-ico-edit", panel.icons); if(panel.edit) panel.edit=panel.edit.parentNode;
		panel.close=$$$(".stx-ico-close", panel.icons); if(panel.close) panel.close=panel.close.parentNode;

		if(panel.title){
			panel.title.innerHTML="";
			if( panel.display) panel.title.appendChild(document.createTextNode(panel.display));
			if(isChart){
				CIQ.appendClassName(panel.title,"chart-title");
				CIQ.appendClassName(panel.icons,"stx-chart-panel");
			}
		}

		if(!CIQ.touchDevice || CIQ.isSurface) this.makeModal(panel.icons);

		if(panel.handle){
			if(!CIQ.touchDevice || CIQ.isSurface) panel.handle.onmouseover=(function(self){ return function(){self.hideCrosshairs();};})(this);
			if(!CIQ.touchDevice || CIQ.isSurface) panel.handle.onmouseout=(function(self){ return function(){self.showCrosshairs();};})(this);
			var panelGrab=function(stx,panel){
				return function(e){
					if(CIQ.ChartEngine.resizingPanel) return;
					stx.grabHandle(panel);
				};
			};
			// stxx.releaseHandle is called by the chart's touchend and mouseup handlers
			if(CIQ.isSurface){
				panel.handle.onpointerdown=panelGrab(this, panel);
			}else{
				panel.handle.onmousedown=panelGrab(this, panel);
			}
			if(CIQ.touchDevice) panel.handle.ontouchstart=panelGrab(this, panel);
		}
		if(panel.close) {
			CIQ.safeClickTouch(panel.close,(function(stx, panel){return function(){ stx.panelClose(panel);};})(this, panel));
			if(panel.name=="chart") panel.close.style.display="none"; // never close primary chart
		}
		if(panel.up) CIQ.safeClickTouch(panel.up,(function(stx, panel){return function(){ stx.panelUp(panel);};})(this, panel));
		if(panel.down) CIQ.safeClickTouch(panel.down,(function(stx, panel){return function(){ stx.panelDown(panel);};})(this, panel));
		if(panel.solo) CIQ.safeClickTouch(panel.solo,(function(stx, panel){return function(){ stx.panelSolo(panel);};})(this, panel));

	};
	/**
	 * <span class="injection">INJECTABLE</span>
	 * Adds a panel with a prespecified percentage. This should be called iteratively when rebuilding a set
	 * of panels from a previous layout. Use {@link CIQ.ChartEngine#createPanel} when creating a new panel for an existing chart layout.
	 * @param  {string} display	  The display name for the panel
	 * @param  {string} name	  The name of the panel (usually the study ID)
	 * @param  {number} percent	  The percentage of chart to use
	 * @param  {string} [chartName] The chart to associate with this panel. Defaults to "chart".
	 * @param {CIQ.ChartEngine.YAxis} [yAxis] {@link CIQ.ChartEngine.YAxis} object. If not present, the existing panel's axis will be used.
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias stackPanel
	 * @since 5.2.0 added argument yAxis
	 */
	CIQ.ChartEngine.prototype.stackPanel=function(display, name, percent, chartName, yAxis){
		if(this.runPrepend("stackPanel", arguments)) return;
		if(!chartName) chartName="chart";
		var chart=this.charts[chartName];
		var isChart=(name==chartName);
		if(isChart){
			display=chart.symbol;
			if(chart.symbolDisplay) display=chart.symbolDisplay;
			if(!yAxis) yAxis=chart.yAxis;
		}
		var panel=this.panels[name]=new CIQ.ChartEngine.Panel(name, yAxis);
		if(!isChart && chart.yAxis && panel.yAxis.position==chart.yAxis.position){
			panel.yAxis.width=chart.yAxis.width;// make it match the width of the main panel so the y axis align
		}
		if(isChart && !chart.panel) chart.panel=panel;

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

		if(this.controls.handleTemplate && this.manageTouchAndMouse){
			panel.handle=this.controls.handleTemplate.cloneNode(true);
			this.container.appendChild(panel.handle);
			//panel.handle.style.display=""; // let the drawPanels manage this otherwise if we set to "" here but the developer wants a picture (png) handle using CSS, the hande will flicker on on initial load on the top of the screen
			panel.handle.panel=panel;
		}

		if(this.controls.iconsTemplate){
			panel.icons=this.controls.iconsTemplate.cloneNode(true);
			panel.subholder.appendChild(panel.icons);
			this.configurePanelControls(panel);
		}

		this.resizeCanvas();

		this.runAppend("stackPanel", arguments);
	};

	CIQ.ChartEngine.prototype.setPanelEdit=function(panel, editFunction){
		panel.editFunction=editFunction;
		if(panel.edit) CIQ.safeClickTouch(panel.edit, editFunction);
		this.adjustPanelPositions();
	};
	/**
	 * <span class="injection">INJECTABLE</span>
	 * <span class="animation">Animation Loop</span>
	 * Draws the panels for the chart and chart studies. CSS style stx_panel_border can be modified to change the color
	 * or width of the panel dividers.
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias drawPanels
	 */
	CIQ.ChartEngine.prototype.drawPanels=function(){
		if(this.runPrepend("drawPanels", arguments)) return;
		var first=false;
		for(var p in this.panels){
			var panel=this.panels[p];
			panel.state = {}; // reset the drawing state

			var textToDisplay=this.translateIf(panel.display);
			if(panel.title && panel.title.textContent!=textToDisplay){
				panel.title.innerHTML="";
				panel.title.appendChild(document.createTextNode(textToDisplay));
			}
			CIQ.appendClassName(panel.icons, "stx-show");
			if(panel.hidden){
				CIQ.unappendClassName(panel.icons,"stx-show");
				if(panel.handle) panel.handle.style.display="none";
				panel.holder.style.display="none";
				continue;
			}else{
				var manageTouchAndMouse=this.manageTouchAndMouse;
				if(panel.up) panel.up.style.display=(this.displayIconsUpDown && manageTouchAndMouse)?"":"none";
				if(panel.down) panel.down.style.display=(this.displayIconsUpDown && manageTouchAndMouse)?"":"none";
				if(panel.solo) panel.solo.style.display=(this.displayIconsSolo && manageTouchAndMouse)?"":"none";
				if(panel.close) panel.close.style.display=(this.displayIconsClose && manageTouchAndMouse)?"":"none";

				if(panel.edit) panel.edit.style.display=(panel.editFunction && manageTouchAndMouse)?"":"none";
				panel.holder.style.display="block";
			}
			if(!first){
				if(panel.handle) panel.handle.style.display="none";
				first=true;
				continue;
			}
			var y=panel.top;
			y=Math.round(y)+0.5;
			this.plotLine(panel.left, panel.right, y, y, this.canvasStyle("stx_panel_border"), "segment", this.chart.context, false, {});
			if(panel.handle){
				if(!this.displayPanelResize){
					panel.handle.style.display="none";
				}else{
					panel.handle.style.display="";
				}
				panel.handle.style.top=(y - panel.handle.offsetHeight/2) + "px";
				//panel.handle.style.left=panel.left+ "px";
			}
		}
		this.runAppend("drawPanels", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * This method captures a tap event (single click) on a touch device. It supports both touch and pointer events.
	 * @param  {number} finger Which finger is pressed
	 * @param  {number} x	   X location on screen of the press
	 * @param  {number} y	   Y location on screen of the press
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
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
					var drawingTool=this.currentVectorParameters.vectorType;
					if(!CIQ.Drawing || !drawingTool || !CIQ.Drawing[drawingTool] || !(new CIQ.Drawing[drawingTool]()).dragToDraw){
						if(!this.drawingClick(this.currentPanel, cx, cy)){
							if(!this.layout.crosshair){
								//clear existing highlights?
								CIQ.ChartEngine.crosshairY=0;
								CIQ.ChartEngine.crosshairX=0;
								this.cx=this.backOutX(CIQ.ChartEngine.crosshairX);
								this.cy=this.backOutY(CIQ.ChartEngine.crosshairY);
								this.findHighlights(null, true);
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
	 * @param  {number} y	   Y location on screen of tap
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias touchDoubleClick
	 */
	CIQ.ChartEngine.prototype.touchDoubleClick=function(finger, x, y){
		if(this.runPrepend("touchDoubleClick", arguments)) return;
		if(this.dispatch("doubleTap",{stx:this,finger:finger,x:x,y:y})) return;
		if(x<this.left || x>this.right || y<this.chart.panel.top || y>this.chart.panel.bottom) return;
		if(this.editingAnnotation) return;
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
		this.touchPointerType=e.pointerType;
		if(this.touchPointerType!="touch"){
			this.mouseMode=true;
			return;
		}
		this.mouseMode=false;
		this.touches[this.touches.length]={
				pointerId:e.pointerId,
				pageX:e.clientX,
				pageY:e.clientY,
				clientX:e.clientX,
				clientY:e.clientY
		};
		this.changedTouches=[{
				pointerId:e.pointerId,
				pageX:e.clientX,
				pageY:e.clientY,
				clientX:e.clientX,
				clientY:e.clientY
		}];
		if(this.touches.length==1){
			this.gesturePointerId=e.pointerId;
		}
		this.touchstart(e);
	};

	// Proxy for dealing with MS pointer move events
	CIQ.ChartEngine.prototype.moveProxy=function(e){
		if(e.pointerType && e.pointerType!="touch"){
			this.mouseMode=true;
			return;
		}
		this.mouseMode=false;
		this.touchmove(e);
	};

	// Proxy for dealing with MS pointer end events
	CIQ.ChartEngine.prototype.endProxy=function(e){
		if(this.touchPointerType!="touch"){
			this.mouseMode=true;
			return;
		}
		this.mouseMode=false;
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
			pageY:e.clientY,
			clientX:e.clientX,
			clientY:e.clientY
		}];
		this.touchend(e);
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
	 *
	 * **Note** that the watermark will not persist unless called from within the animation loop (study display function, for example).
	 * As such, it may be necessary to use a `prepend` to the `draw` function to create persistence. See example section.
	 * @param  {external:CanvasRenderingContext2D} context [description]
	 * @param  {number} x		X position on canvas
	 * @param  {number} y		Y position on canvas
	 * @param  {string} text	The text to watermark
	 * @memberof CIQ.ChartEngine
	 * @example
		CIQ.ChartEngine.prototype.prepend("draw",function(){
	       // create persistence by forcing it  be called in every animation frame.
	       rawWatermark(stxx.chart.context,20,30,stxx.chart.symbol);
		});
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
	 * **Note** that the watermark will not persist unless called from within the animation loop (study display function, for example).
	 * As such, it may be necessary to use a `prepend` to the `draw` function to create persistence. See example section.
	 * @param  {string} panel The name of the panel
	 * @param  {object} [config] Parameters for the request
	 * @param  {string} [config.h]			"left", "right", "center" to place the watermark
	 * @param  {string} [config.v]			"top", "bottom", "middle" to place the watermark
	 * @param  {string} [config.text]		The text to watermark
	 * @param  {string} [config.hOffset]	offset in pixels of upper left corner from left or right margin
	 * @param  {string} [config.vOffset]	offset in pixels of upper left corner from top or bottom margin
	 * @memberof CIQ.ChartEngine
	 * @example
		CIQ.ChartEngine.prototype.prepend("draw",function(){
	       // create persistence by forcing it  be called in every animation frame.
	       stxx.watermark("chart",{h:"center",v:"middle",text:stxx.chart.symbol});
		});	 */
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
	 * @param  {CIQ.ChartEngine.Chart} [chart] The chart to adjust. Otherwise adjusts the main symbol chart.
	 * @memberof CIQ.ChartEngine
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
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.postAdjustScroll=function(){
		if(!this.previousAdjust) return;
		var chart=this.previousAdjust.chart;
		chart.scroll=this.previousAdjust.scroll+(chart.maxTicks-this.previousAdjust.maxTicks);
		if(this.displayInitialized) this.draw();
	};
	/**
	 * Loops through the existing drawings and asks them to adjust themselves to the chart dimensions.
	 * @memberof CIQ.ChartEngine
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
	 * For 'tick' intervals, since there is no predictable periodicity, the next interval will be determined by {@link CIQ.ChartEngine.XAxis#futureTicksInterval}
	 * @param  {date}		DT			A JavaScript Date representing the base time for the request in {@link CIQ.ChartEngine#dataZone} timezone.
	 * @param {number}		[period]		The number of periods to jump. Defaults to 1. Can be negative to go back in time.
	 * @param {boolean}		[useDataZone=true] By default the next interval will be returned in {@link CIQ.ChartEngine#dataZone}. Set to false to receive a date in {@link CIQ.ChartEngine#displayZone} instead.
	 * @return {date}	 The next interval date
	 * @memberof CIQ.ChartEngine
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
	 * For 'tick' intervals, since there is no predictable periodicity, the iterator interval will be determined by {@link CIQ.ChartEngine.XAxis#futureTicksInterval}
	 * See {@link CIQ.Market} and {@link CIQ.Market.Iterator} for more details.
	 * @param {date}		begin A JavaScript Date representing the iterator begin date in {@link CIQ.ChartEngine#dataZone} timezone. See {@link CIQ.Market#newIterator} for details.
	 * @param {string} 		[outZone] A valid timezone from the timeZoneData.js library. This should represent the time zone for the returned date. Defaults {@link CIQ.ChartEngine#dataZone}. See {@link CIQ.Market#newIterator} for details.
	 * @param {CIQ.ChartEngine.Chart} 	[chart] The chart object.
	 * @return {object} A new iterator.
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.standardMarketIterator=function(begin, outZone, chart){
		var cht=chart?chart: this.chart;
		var iter_parms = {
			'begin': begin,
			'interval': this.layout.interval,
			'periodicity': this.layout.interval =='tick' ? this.chart.xAxis.futureTicksInterval:this.layout.periodicity,
			'timeUnit': this.layout.timeUnit,
			'outZone': outZone
		};
		return cht.market.newIterator(iter_parms);
	};

	/**
	 * Effects a zoom from either zoomIn() or zoomOut(). Called from an EaseMachine
	 * @param  {number} candleWidth  The new candleWidth
	 * @param  {CIQ.ChartEngine.Chart} chart        The chart to center
	 * @memberof CIQ.ChartEngine
	 * @since 4.0.0 will maintain tick position near the cursor if <a href="CIQ.ChartEngine.html#preferences%5B%60zoomAtCurrentMousePosition%60%5D">CIQ.ChartEngine.preferences.zoomAtCurrentMousePosition</a> is `true`
	 * @since 4.1.0 will keep left edge stable and zoom to the right when white space is present on the left.
	 */
	CIQ.ChartEngine.prototype.zoomSet=function(candleWidth, chart){
		var mainSeriesRenderer=this.mainSeriesRenderer || {};
		if(!mainSeriesRenderer.params || !mainSeriesRenderer.params.volume){
			var maintainTick;
			if (this.preferences.zoomAtCurrentMousePosition && this.zoomInitiatedByMouseWheel && this.crosshairTick < chart.dataSet.length) {
				// keep the bar near the cursor stable
				// at chart load it is possible for this.crosshairTick to be null (refresh while cursor is in the xAxis margin)
				maintainTick = this.crosshairTick || this.tickFromPixel(this.cx, chart);
			} else if (this.isHome()) {
				// keep right edge stable and zoom to the left
				maintainTick=chart.dataSet.length-1;
			} else if (	this.chart.scroll > this.chart.dataSet.length) {
				// keep left edge stable and zoom to the right
				maintainTick=0;
			} else if (	this.grabMode=="zoom-x") {
				// keep right edge stable and zoom to the left
				maintainTick=this.tickFromPixel(this.chart.width, chart);
			} else {
				// keep the center bar in the center and zoom equally left and right
				maintainTick=this.tickFromPixel(this.chart.width/2, chart);
			}
			if (this.animations.zoom.hasCompleted) {
				this.zoomInitiatedByMouseWheel = false;
			}
			// this is the code that keeps the chart's position stable.
			// Bypassing this code will cause the chart's left position to remain stable
			// which is really the only way to get a smooth zoom for variable width candles (because the act of scrolling inherently changes the number of candles that fit on the screen)
			var distanceFromFront=chart.dataSet.length-1-maintainTick;
			var oldScroll=chart.scroll;
			chart.scroll=Math.floor((this.pixelFromTick(maintainTick, chart)-chart.left)/candleWidth)+1+distanceFromFront;
			this.micropixels+=((oldScroll-distanceFromFront)*this.layout.candleWidth) -
								((chart.scroll-distanceFromFront)*candleWidth);
		}
		this.setCandleWidth(candleWidth);
		chart.spanLock=false;
		this.draw();
		this.doDisplayCrosshairs();
		this.updateChartAccessories();
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Zooms the chart out. The chart is zoomed incrementally by they percentage indicated (pct) each time this is called.
	 * @param  {Event} e The mouse click event, if it exists (from clicking on the chart control)
	 * @param  {number} pct The percentage to zoom out the chart (default = 30%)
	 * @memberof CIQ.ChartEngine
	 * @since 4.0.0 If both {@link CIQ.ChartEngine.Chart#allowScrollPast} and {@link CIQ.ChartEngine.Chart#allowScrollFuture} are set to false, the zoom operation will stop mid animation to prevent white space from being created.
	 */
	CIQ.ChartEngine.prototype.zoomOut=function(e, pct){
		if(this.runPrepend("zoomOut", arguments)) return;
		if ( this.preferences.zoomOutSpeed) pct= this.preferences.zoomOutSpeed;
		else if(!pct) pct=1.3;
		if(e && e.preventDefault) e.preventDefault();
		this.cancelTouchSingleClick=true;

		var self=this;
		function closure(chart){
			return function(candleWidth){
				self.zoomSet(candleWidth, chart);
				if (self.animations.zoom.hasCompleted) {
					if(self.runAppend("zoomOut", arguments)) return;
					self.changeOccurred("layout");
				}
			};
		}

		for(var chartName in this.charts){
			var chart=this.charts[chartName];
			if(CIQ.ipad && chart.maxTicks>CIQ.ChartEngine.ipadMaxTicks){
				return;
			}
			var newTicks=Math.floor(chart.maxTicks*pct);	// 10% more ticks with each click
			if(chart.allowScrollFuture===false && chart.allowScrollPast===false && newTicks > chart.dataSet.length) {
				// make sure we keep candles big enough to show all data so no white space is created on either side.
				newTicks = chart.dataSet.length;
			}
			var newCandleWidth=this.chart.width/newTicks;
			if(newCandleWidth<this.minimumCandleWidth) newCandleWidth=this.minimumCandleWidth;
			this.layout.setSpan=null;
			this.layout.range=null;
			this.animations.zoom.run(closure(chart), this.layout.candleWidth, newCandleWidth);
		}
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Zooms (vertical swipe / mousewheel) or pans (horizontal swipe) the chart based on a mousewheel event. A built in timeout prevents the mousewheel from zooming too quickly.
	 * @param  {Event} e		  The event
	 * @return {boolean}			Returns false if action is taken
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias mouseWheel
	 */

	CIQ.ChartEngine.prototype.mouseWheel=function(e){
		if(this.runPrepend("mouseWheel", arguments)) return;
		if(!e) e=event;	//IE8
		if(e.preventDefault) e.preventDefault();
		var deltaX=e.deltaX, deltaY=e.deltaY;

		/*
		// OSX trackpad is very sensitive since it accommodates diagonal
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

		if(this.allowSideswipe && deltaX!==0){
			this.lastMove="horizontal";
			var delta=deltaX;
			if(delta>50) delta=50;
			if(delta<-50) delta=-50;
			this.grabbingScreen=true;
			if(!this.currentPanel) this.currentPanel=this.chart.panel;
			this.grabStartX=CIQ.ChartEngine.crosshairX;
			this.grabStartY=CIQ.ChartEngine.crosshairY;
			this.grabStartScrollX=this.chart.scroll;
			this.grabStartScrollY=this.currentPanel.yAxis.scroll;
			this.grabStartMicropixels=this.micropixels;
			this.grabStartPanel=this.currentPanel;
			this.mousemoveinner(CIQ.ChartEngine.crosshairX-delta,CIQ.ChartEngine.crosshairY);
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
		if(!deltaY){
			if ( CIQ.wheelEvent == "onmousewheel" ) {
				deltaY = - 1/40 * e.wheelDelta;
				if(e.wheelDeltaX) deltaX = - 1/40 * e.wheelDeltaX;
			} else {
				deltaY = e.detail;
			}
		}
		if(typeof e.deltaMode=="undefined") e.deltaMode = (e.type == "MozMousePixelScroll" ? 0 : 1);

		//var distance=e.deltaX;
		//if(!distance) distance=e.deltaY;
		var distance=-deltaY;
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

		this.zoomInitiatedByMouseWheel = true;

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
	 * @param  {number} pct The percentage to zoom out the chart (default = 30%)
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.zoomIn=function(e, pct){
		if(this.runPrepend("zoomIn", arguments)) return;
		if ( this.preferences.zoomInSpeed) pct= this.preferences.zoomInSpeed;
		else if(!pct) pct=0.7;
		if(e && e.preventDefault) e.preventDefault();
		this.cancelTouchSingleClick=true;

		var self=this;
		function closure(chart){
			return function(candleWidth){
				self.zoomSet(candleWidth, chart);
				if (self.animations.zoom.hasCompleted) {
					if(self.runAppend("zoomIn", arguments)) return;
					self.changeOccurred("layout");
				}
			};
		}

		for(var chartName in this.charts){
			var chart=this.charts[chartName];

			var newTicks=Math.floor(chart.maxTicks*pct);	// 10% fewer ticks displayed when zooming in
			// At some point the zoom percentage compared to the bar size may be too small, we get stuck at the same candle width.
			// (because we ceil() and 0.5 candle when we set the maxTicks in setCandleWidth()).
			// So we want to force a candle when this happens.
			if (chart.maxTicks-newTicks < 1) newTicks=chart.maxTicks-1;
			if(newTicks<this.minimumZoomTicks) newTicks=this.minimumZoomTicks;
			var newCandleWidth=this.chart.width/newTicks;
			this.layout.setSpan=null;
			this.layout.range=null;
			this.animations.zoom.run(closure(chart), this.layout.candleWidth, newCandleWidth);
		}
	};

	/**
	 * Translates the requested word to the active language if this.translationCallback callback function is set.
	 *
	 * Use {@link CIQ.translatableTextNode} if you are adding the element to the DOM and wish the translations services to automatically change to other languages as they are set.
	 * @param  {string} english The word to translate
	 * @return {string}			The translated word, or the word itself if no callback is set.
	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.translateIf=function(english){
		if(this.translationCallback) return this.translationCallback(english);
		return english;
	};

	/**
	 * Sets the data timezone (`dataZone`) and display timezone (`displayZone`) on an intraday chart.
	 *
	 * >**Important:**
	 * >- The `dataZone` property on this method must be set **before** any data is loaded so the engine knows how to convert the incoming records.
	 * >- The `displayZone`` property on this method can be set at any time and will only affect what is displayed on the x axis.
	 * >- This method should only be used for dates that are not timeZone aware. If using the 'DT' fields in your data input records,
	 * >**DO NOT** use this function to set the `dataZone` as it will result in a double conversion.
	 *
	 * - Once set, 'Date' fields containing a time portion, will be converted to the {@link CIQ.ChartEngine#dataZone}
	 * (or the browser timezone if no dataZone is specified) before added into the `masterData`. Its corresponding 'DT' fields will be set to match.
	 * The {@link CIQ.ChartEngine#displayZone} is then created and used to translate dates based on either the local browser's timezone,
	 * or the timezone selected by the end user.
	 *
	 * - If the date ('DT' or 'Date') does not include a time offset, such as 'yyyy-mm-dd',
	 * no time zone conversion will be performed. Use this option if you prefer to display the same date on all timezones.
	 * This applies to daily, weekly and monthly periodicities only.
	 * For a list of all supported date formats see the [Input format Tutorial]{@tutorial InputDataFormat}
	 *
	 * ** Time zone and the {@link quotefeed}:**<br>
	 * On a fetch call, if your quote server sends and receives string dates loaded in the 'Date' field,
	 * you can convert the provided start and end dates back to strings using {@link CIQ.yyyymmddhhmmssmmm}
	 * Example:
	 * ```
	 * var strStart =  CIQ.yyyymmddhhmmssmmm(suggestedStartDate) ;
	 * var strEnd = CIQ.yyyymmddhhmmssmmm(endDate);
	 * ```
	 * These dates will be in the same time zone you sent them in. So they will match your quote feed.
	 *
	 * For more details on how time zones work in the chart see the {@tutorial Dates and Timezones} tutorial.
	 *
	 * **See {@link CIQ.timeZoneMap} to review a list of all chatIQ supported timezones and instructions on how to add more!**
	 *
	 * @param {string} dataZone	   A chatIQ supported timezone. This should represent the time zone that the master data comes from, or set to 'null' if your dates are already time zone aware.
	 * @param {string} displayZone A chatIQ supported timezone. This should represent the time zone that the user wishes displayed, or set to null to use the browser time zone.
	 * @memberof CIQ.ChartEngine
	 * @since 5.2 also used to convert daily, weekly and monthly periodicities.
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
			this.setDisplayDates(chart.masterData);
		}
		this.preferences.timeZone=displayZone;
		this.changeOccurred("preferences");
		this.createDataSet();
	};

	/**
	 * Sets the locale for the charts.
	 *
	 * Do not call this method directly. Instead use {@link CIQ.I18N.setLocale} or {@link CIQ.I18N.localize}
	 *
	 * If set, display prices and dates will be displayed in localized format.
	 * The locale should be a valid IANA locale. For instance de-AT represents German as used in Austria. Localization
	 * is supported through the Intl object which is a W3 standard, however not all browsers support Intl natively. The
	 * Intl.js polyfill is included through the inclusion of stxThirdParty.js. To enable localization, the locale-data/jsonp
	 * directory should be included and the JSONP loaded. This is done automatically by calling {@link CIQ.I18N.setLocale}
	 * rather than calling this method directly.
	 *
	 * Once a locale is set, `stxx.internationalizer` will be an object that will contain several Intl formatters.
	 *
	 * These are the default date and time formates:
	 * - stxx.internationalizer.hourMinute=new Intl.DateTimeFormat(this.locale, {hour:"numeric", minute:"numeric", hour12:false});
	 * - stxx.internationalizer.hourMinuteSecond=new Intl.DateTimeFormat(this.locale, {hour:"numeric", minute:"numeric", second:"numeric", hour12:false});
	 * - stxx.internationalizer.mdhm=new Intl.DateTimeFormat(this.locale, {year:"2-digit", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit"});
	 * - stxx.internationalizer.monthDay=new Intl.DateTimeFormat(this.locale, {month:"numeric", day:"numeric"});
	 * - stxx.internationalizer.yearMonthDay=new Intl.DateTimeFormat(this.locale, {year:"numeric", month:"numeric", day:"numeric"});
	 * - stxx.internationalizer.yearMonth=new Intl.DateTimeFormat(this.locale, {year:"numeric", month:"numeric"});
	 * - stxx.internationalizer.month=new Intl.DateTimeFormat(this.locale, {month:"short"});
	 *
	 * These can be overridden manually if the specified format is not acceptable. See example.
	 * Also see [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat) for formatting alternatives
	 *
	 * @param {string} locale A valid IANA locale
	 * @param {number} [maxDecimals] maximum number of decimal places to allow on number conversions. Defaults to 5. Please note that this will supersede any defaults set in {@link CIQ.ChartEngine.YAxis#maxDecimalPlaces} or {@link CIQ.ChartEngine.YAxis#decimalPlaces}
	 * @memberof CIQ.ChartEngine
	 * @since 3.0.0 maxDecimals was added to the signature
	 * @example
	 * // override time formatting to enable 12 hour clock (hour12:true)
	 * CIQ.I18N.setLocale(stxx, "en");
	 * stxx.internationalizer.hourMinute=new Intl.DateTimeFormat(this.locale, {hour:"numeric", minute:"numeric", hour12:true});
	 * stxx.internationalizer.hourMinuteSecond=new Intl.DateTimeFormat(this.locale, {hour:"numeric", minute:"numeric", second:"numeric", hour12:true});
	 * @example
	 * // override formatting to dislay 'Sep 15' insted of '9/15' on x axis labels.
	 * CIQ.I18N.setLocale(stxx, "en");
	 * stxx.internationalizer.monthDay=new Intl.DateTimeFormat(this.locale, {month:"short", day:"numeric"});
	 */
	CIQ.ChartEngine.prototype.setLocale=function(locale,maxDecimals){
		if(typeof Intl=="undefined") return;
		if(this.locale!=locale){
			this.locale=locale;
		}else{
			return;
		}
		var i, internationalizer=this.internationalizer={};
		internationalizer.hourMinute=new Intl.DateTimeFormat(this.locale, {hour:"numeric", minute:"numeric", hour12:false});
		internationalizer.hourMinuteSecond=new Intl.DateTimeFormat(this.locale, {hour:"numeric", minute:"numeric", second:"numeric", hour12:false});
		internationalizer.mdhm=new Intl.DateTimeFormat(this.locale, {year:"2-digit", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit"});
		internationalizer.monthDay=new Intl.DateTimeFormat(this.locale, {month:"numeric", day:"numeric"});
		internationalizer.yearMonthDay=new Intl.DateTimeFormat(this.locale, {year:"numeric", month:"numeric", day:"numeric"});
		internationalizer.yearMonth=new Intl.DateTimeFormat(this.locale, {year:"numeric", month:"numeric"});
		internationalizer.month=new Intl.DateTimeFormat(this.locale, {month:"short"});
		internationalizer.numbers=new Intl.NumberFormat(this.locale);
		internationalizer.priceFormatters=[];
		if (!maxDecimals ) maxDecimals=8;
		for(i=0;i<maxDecimals+1;i++){
			internationalizer.priceFormatters.push(new Intl.NumberFormat(this.locale,{maximumFractionDigits:i,minimumFractionDigits:i}));
		}
		// minification efficient generation of...
		// internationalizer.percent=new Intl.NumberFormat(this.locale, {style:"percent", minimumFractionDigits:2, maximumFractionDigits:2})
		// internationalizer.percent1=new Intl.NumberFormat(this.locale, {style:"percent", minimumFractionDigits:1, maximumFractionDigits:1})
		// ...
		for(i=0;i<5;i++){
			var c=i,j=i;
			if(!i){ c="";j=2;}
			internationalizer["percent" + c]=new Intl.NumberFormat(this.locale, {style:"percent", minimumFractionDigits:j, maximumFractionDigits:j});
		}

		if(CIQ.I18N.createMonthArrays) CIQ.I18N.createMonthArrays(this, internationalizer.month, this.locale);
	};

	/**
	 * <span class="quotefeed">QuoteFeed required</span> if `params.noDataLoad` is set to `false`
	 *
	 * Imports a layout (panels, studies, candleWidth, etc) from a previous serialization. See {@link CIQ.ChartEngine#exportLayout}.
	 *
	 * There are 3 ways to use the this method:
	 * 1. Preset the layout object in the chart instance, but do not load any data.
	 *  - This is usually used to restore an initial 'symbol independent' general layout (chart type and studies mainly) that will then take effect when `newChart` is subsequently called.
	 *  - In this case, exportedLayout should be called using 'withSymbols=false' and the importLayout should have 'noDataLoad=true'.
	 * 2. Load an entire new chart and its data, including primary symbol, additional series, studies, chart type, periodicity and range:
	 *  - In this case, you should not need call newChart, setPeriodicity setSpan or setRange, addStudy, etc. since it is all restored from the previously exported layout and loaded using the attached quoteFeed.
	 *  - If you still wish to change periodicity, span or range, you must use the CB function to do so.
	 *  - In this case, exportedLayout should be called  using 'withSymbols=true' and the importLayout should have 'noDataLoad=false' and 'managePeriodicity=true'.
	 * 3. Reset layout on an already existing chart without changing the primary symbol or adding additional symbols:
	 *  - This is used when restoring a 'view' on an already existing chart from a previous `newChart` call. The primary symbol remains the same, no additional series are added, but periodicity, range, studies and chart type are restored from the previously serialized view.
	 *  - In this case, exportedLayout should be called  using 'withSymbols=false', and importLayout should have 'noDataLoad=false', managePeriodicity=true', and 'preserveTicksAndCandleWidth=true'.
	 *
	 * **Important Notes: **
	 * - Please note that `stxx.callbacks.studyOverlayEdit` and `stxx.callbacks.studyPanelEdit` must be set *before* you call {@link CIQ.ChartEngine#importLayout}.
	 * Otherwise your imported studies will not have an edit capability
	 *
	 * - When symbols are loaded, this function will set the primary symbol (first on the serialized symbol list) with {@link CIQ.ChartEngine#newChart}
	 * and any overlayed symbol with {@link CIQ.ChartEngine#addSeries}. You must be using a QuoteFeed to use this workflow.
	 *
	 * - When allowing this method to load data, do not call [addSeries]{@link CIQ.ChartEngine#addSeries}, [importDrawings]{@link CIQ.ChartEngine#importDrawings} or [newChart]{@link CIQ.ChartEngine#newChart} in a way that will cause them to run simultaneously with this method,
	 * or the results of the layout load will be unpredictable.
	 * Instead use this method's callback to ensure data is loaded in the right order.
	 *
	 * - Since spans and ranges require changes in data and periodicity,
	 * they are only imported if params.managePeriodicity is set to true and params.noDataLoad is set to false.
	 * If both range and span are present, range takes precedence.
	 *
	 * @param  {object} config						A serialized layout generated by {@link CIQ.ChartEngine#exportLayout}
	 * @param  {object} params						Parameters to dictate layout behavior
	 * @param  {boolean} [params.noDataLoad=false] If true, then any automatic data loading from the quotefeed will be skipped, including setting periodicity, spans or ranges.<br>
	 * Data can only be loaded if a quote feed is attached to the chart. <br>
	 * @param  {boolean} [params.managePeriodicity]	If true then the periodicity will be set from the layout, otherwise periodicity will remain as currently set.<br>
	 * If the span/range was saved in the layout, it will be restored using the most optimal periodicity as determined by {@link CIQ.ChartEngine#setSpan}.<br>
	 * Periodicity can only be managed if a quote feed is attached to the chart. <br>
	 * Only applicable when noDataLoad=false.<br>
	 * See {@link CIQ.ChartEngine#setPeriodicity} for additional details
	 * @param  {boolean} [params.preserveTicksAndCandleWidth] If true then the current candleWidth (horizontal zoom) and scroll (assuming same periodicity) will be maintained and any spans or ranges present in the config will be ignored. Otherwise candle width and span/ranges will be taken from the config and restored.
	 * @param  {function} [params.cb] An optional callback function to be executed once the layout has been fully restored.
	 * @param  {function} [params.seriesCB] An optional callback function to be executed after each series is restored (to be aded to each {@link CIQ.ChartEngine#addSeries} call).
	 * @memberof CIQ.ChartEngine
	 * @since
	 * <br>&bull; 05-2016-10 Symbols are also loaded if included on the serialization.
	 * <br>&bull; 2016-06-21 preserveTicksAndCandleWidth now defaults to true
	 * <br>&bull; 3.0.0 added noDataLoad parameter
	 * <br>&bull; 5.1.0 Will now also import extended hours settings.
	 * <br>&bull; 5.1.0 Imports the range from layout if it is there to preserve between sessions.
	 * <br>&bull; 5.2.0 spans and ranges are only executed if managePeriodicity is true and preserveTicksAndCandleWidth is false.
	 */
	CIQ.ChartEngine.prototype.importLayout=function(config, params){

		if(!config) {
			// if no config to restore, nothing to do.
			if(params.cb) params.cb();
			return;
		}

		if (typeof params !== "object") {
			// backwards compatibility hack, this function used to accept three named arguments
			params = {
				managePeriodicity: arguments[1],
				preserveTicksAndCandleWidth: arguments[2]
			};
		}
		var layout=this.layout, originalLayout=CIQ.shallowClone(layout);
		var managePeriodicity=params.managePeriodicity, cb=params.cb, seriesCB=params.seriesCB, noDataLoad=params.noDataLoad, minimumCandleWidth=this.minimumCandleWidth;
		var preserveTicksAndCandleWidth=params.preserveTicksAndCandleWidth;

		var exportedDrawings=this.exportDrawings();
		this.abortDrawings();

		this.currentlyImporting=true;
		// must remove studies before cleaning the overlays, or the remove function will be lost.
		if(CIQ.Studies){
			for(var s in layout.studies){
				var sd=layout.studies[s];
				CIQ.Studies.removeStudy(this, sd);
			}
		}
		this.overlays={};

		// Keep a copy of the prior panels. We'll need these in order to transfer the holders
		var priorPanels=CIQ.shallowClone(this.panels);
		this.panels={};

		// clone into view to prevent corrupting the original config object.
		var view= CIQ.clone(config);
		// copy all settings to the chart layout, but maintain the original periodcity,
		// wich is handled later on depending on managePeriodicity and noDataLoad settings.
		CIQ.dataBindSafeAssignment(layout, CIQ.clone(view));
		layout.periodicity=originalLayout.periodicity;
		layout.interval=originalLayout.interval;
		layout.timeUnit=originalLayout.timeUnit;
		layout.setSpan=originalLayout.setSpan;
		layout.range=originalLayout.range;

		// must restore candleWidth before you draw any charts or series, including study charts. The config does not always provide the candleWidth
		if(preserveTicksAndCandleWidth){
			layout.candleWidth=originalLayout.candleWidth;
		}else{
			if(!layout.candleWidth) layout.candleWidth=8;
		}

		// Just make sure the candleWidth is sane so we end up with a reasonable number of maxticks to fetch.
		if(layout.candleWidth<minimumCandleWidth) layout.candleWidth=minimumCandleWidth;
		this.setCandleWidth(layout.candleWidth);

		var panels=view.panels;		// make a copy of the panels
		var insertAt;
		var orderedPanels = [];
		var p;
		var panel;
		for (p in panels) {
			if (!('top' in panels[p])) break; // unable to sort
			panel = panels[p];
			panel.name = p;
			// iterate one before insertion point; do so in reverse so that no iteration is done for sorted input
			for (insertAt = orderedPanels.length - 1; insertAt >= 0 && orderedPanels[insertAt].top > panel.top; --insertAt) ;
			orderedPanels.splice(insertAt + 1, 0, panel);
		}
		layout.panels={};		// erase the panels
		if (orderedPanels.length > 0) {	// rebuild the panels
			for (var i = 0; i < orderedPanels.length; ++i) {	// explicit order
				panel = orderedPanels[i];
				this.stackPanel(panel.display, panel.name, panel.percent, panel.chartName);
			}
		} else {
			for (p in panels) {	// object implied order
				panel = panels[p];
				yAxis=panel.yAxis?new CIQ.ChartEngine.YAxis(panel.yAxis):null;
				this.stackPanel(panel.display, p, panel.percent, panel.chartName, yAxis);
			}
		}
		if(CIQ.isEmpty(panels)){
			this.stackPanel("chart","chart",1,"chart");
		}

		// Transfer the holders and DOM element references to panels that were retained when the config switched
		// Delete panels that weren't
		for(var panelName in priorPanels){
			var oldPanel=priorPanels[panelName];
			var newPanel=this.panels[panelName];
			if(newPanel){
				this.container.removeChild(newPanel.holder);
				if(oldPanel.handle) this.container.removeChild(oldPanel.handle);
				var copyFields={"holder":true,"subholder":true,"display":true, "icons":true};
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
			var studies=CIQ.clone(layout.studies);
			delete layout.studies;
			for(var ss in studies){
				var study=studies[ss];
				CIQ.Studies.addStudy(this, study.type, study.inputs, study.outputs, study.parameters, study.panel);
			}
		}

		if(this.extendedHours) this.extendedHours.prepare(layout.extended, layout.marketSessions);

		if(typeof(layout.chartType)=="undefined") layout.chartType="line";
		this.setMainSeriesRenderer();

		this.adjustPanelPositions();

		var self=this;
		function postLayoutChange(){
			self.importDrawings(exportedDrawings);
			self.currentlyImporting=false;
			self.draw();
			self.updateListeners("layout"); // tells listening objects that layout has changed
		}

		if(!noDataLoad){

			// Now we execute the data loading functions.

			if(view.symbols && view.symbols.length){
				// load symbols; primary and additional series. Also adjust ranges and periodicity at the same time

				var params2={};
				if(!preserveTicksAndCandleWidth && managePeriodicity && view.range && Object.keys(view.range).length) {
					// spans and ranges are only executed if managePeriodicity is true and preserveTicksAndCandleWidth is false.
					params2.range=view.range;
				} else if(!preserveTicksAndCandleWidth && managePeriodicity && view.setSpan && Object.keys(view.setSpan).length){
					// see above
					params2.span=view.setSpan;
				} else if(managePeriodicity && view.interval){
					// otherwise, import periodicity if available
					params2.periodicity={
						interval: view.interval,
						period: view.periodicity,
						timeUnit: view.timeUnit
					};
				} else {
					// otherwise, maintian prior periodicity
					params2.periodicity={
						interval: originalLayout.interval,
						period: originalLayout.periodicity,
						timeUnit: originalLayout.timeUnit
					};
				}

				var symbolObject=view.symbols[0].symbolObject || view.symbols[0].symbol;

				this.newChart(symbolObject, null, this.chart, function(err){
					if(!err){
						for (var smbl, i = 1; i < view.symbols.length; ++i) {
							smbl = view.symbols[i];
							if(!smbl.parameters) smbl.parameters={};
							var parameters=CIQ.clone(smbl.parameters);
							parameters.action=null; // prevent symbolChange event
							self.addSeries(smbl.id, parameters, seriesCB);
						}
						if(view.chartScale) self.setComparison(view.chartScale);

					}
					postLayoutChange();
					if(cb) cb.apply(null, arguments);
				}, params2);
				return;
			}

			// Otherwise, if only data ranges or periodicity are required, load them now

			if(managePeriodicity) {
				if(!preserveTicksAndCandleWidth) {
					// spans and ranges are only executed if managePeriodicity is true and preserveTicksAndCandleWidth is false.
					var range=view.range;
					if(range && Object.keys(range).length && this.chart.symbol) {
						this.setRange(range, function(){
							postLayoutChange();
							if(cb) cb();
						});
						return;
					} else if(view.setSpan && Object.keys(view.setSpan).length && this.chart.symbol){
						this.setSpan(view.setSpan, function(){
							postLayoutChange();
							if(cb) cb();
						});
						return;
					}
				}

				var interval=view.interval;
				var periodicity=view.periodicity;
				var timeUnit=view.timeUnit;
				if(isNaN(periodicity)) periodicity=1;
				if(!interval) interval="day";
				// this will get new data or roll up existing, createDataSet() and draw()
				this.setPeriodicity({period:periodicity, interval:interval, timeUnit:timeUnit}, function(){
					postLayoutChange();
					if(cb) cb();
				});
				return;
			}
		}

		// if we got here, no data loading was requested.
		if(managePeriodicity){
			layout.periodicity=view.periodicity;
			layout.interval=view.interval;
			layout.timeUnit=view.timeUnit;
			layout.setSpan=view.setSpan;
		}

		this.createDataSet();
		if(!preserveTicksAndCandleWidth) this.home();
		postLayoutChange();
		if(cb) cb();
	};

	/**
	 * Exports the current layout into a serialized form. The returned object can be passed into
	 * {@link CIQ.ChartEngine#importLayout} to restore the layout at a future time.
	 *
	 * This methods will also save any programatically activated [range]{@link CIQ.ChartEngine#setRange} or [span]]{@link CIQ.ChartEngine#setSpan} setting that is still active. It is importantnot note, that a set range or span that is manually modfied by a usser when zoomngor panning will be nullified.
	 * So if you wish to allways record the current range or a chanrt for future restiration, you must use a 'move' event listener to capture that interactin and then call setRange withthe current vue window.
	 *
	 * @param {boolean} withSymbols  If set to `true`, include the chart's current primary symbol and any secondary symbols from any {@link CIQ.ChartEngine#addSeries} operation; if using a quoteFeed. Studies will be excluded from this object. The resulting list will be in the `symbols` element of the serialized object.
	 * @return {object} The serialized form of the layout.
	 * @memberof CIQ.ChartEngine
	 * @since
	 * <br>&bull; 05-2016-10 `withSymbols` parameter is available
	 * <br>&bull; 5.0.0 obj.symbols will be explicitly removed from the serialization if `withSymbols` is not true.
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
			panel.top=p.top;
			if(p.yAxis.position) panel.yAxis={position:p.yAxis.position};
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
			obj.symbols = this.getSymbols({"include-parameters":true,"exclude-studies":true});
		} else {
			delete obj.symbols;
		}

		return obj;
	};

	/**
	 * This method is used to prepare date fields for internal use. It will:
	 * - convert dates to a JS Date in the timeZone set by [setTimeZone(dataZone)]{@link CIQ.ChartEngine#setTimeZone}.
	 * - subsequently strip off the time portion on daily, weekly and monthly intervals.
	 *
	 * - If the date ('DT' or 'Date') does not include a time offset, such as 'yyyy-mm-dd',
	 * no time zone conversion will be performed. Use this option if you prefer to display the same date on all timezones.
	 * This applies to daily, weekly and monthly periodicities only.
	 *
	 * @param  {array} quotes The quote array to be converted
	 * @param  {string} interval Interval of the quotes ("day", "week", etc).
	 * @memberof CIQ.ChartEngine
	 * @since
	 * <br>&bull; 4.0.0
	 * <br>&bull; 5.2.0 used on intraday and daily quotes to also convert dates to the indicated `dataZone` as set by [setTimeZone(dataZone)]{@link CIQ.ChartEngine#setTimeZone}.
	 */
	CIQ.ChartEngine.prototype.doCleanupDates=function(quotes, interval) {
		if (!quotes || !quotes.length) return;
		for(var i=0;i<quotes.length;i++){
			var quote=quotes[i], date=quote.DT;
			if(!date && !quote.Date) continue;
			if( quote.DT && Object.prototype.toString.call(date) == '[object String]' && date.length<=10){
				// only date portion provided on DT field, no conversion
				date=new Date(date);
				date.setMinutes(date.getMinutes()+date.getTimezoneOffset());
			}else{
				var useDataZone=true;
				if(!quote.DT) {
					date=CIQ.strToDateTime(quote.Date);
					if(quote.Date.length<=10) useDataZone=false;
				}
				if( Object.prototype.toString.call(date) != '[object Date]' ) date=new Date(date); // if already a date object; nothing to do
				if(this.dataZone && useDataZone){ // convert dates before setting a quotes canonical DT object
					var newDT=new timezoneJS.Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), this.dataZone);
					var milli=date.getSeconds()*1000+date.getMilliseconds();
					date=new Date(newDT.getTime()+milli);
				}
				if(CIQ.ChartEngine.isDailyInterval(interval)) date.setHours(0,0,0,0);
			}
			if(!quote.DT) quote.Date=CIQ.yyyymmddhhmmssmmm(date);  // Set the Date to the adjusted date but only if there was no DT provided
			quote.DT=date;
		}
	};

	/**
	 * If {@link CIQ.ChartEngine#cleanupGaps} is set, this method will insert bars in an array of quotes for those periods missing a record according to the market hours and the current periodicity.
	 * See "{@link CIQ.Market}" for details on how to properly configure the library to your market hours requirements.
	 *
	 * This method will not be called for `tick` since by nature it is no a predictable interval.
	 *
	 * This method is automatically called if you are using a quoteFeed and have {@link CIQ.ChartEngine#cleanupGaps} set, but can be manually called if pushing or streaming data into the chart.
	 *
	 * This method will affect intraday and **underlying daily**  periods **only**. If the feed is already returning weekly and monthly data rolled up, the clean up will not be done ( see {@link CIQ.ChartEngine#dontRoll} ).
	 *
	 * See {@link CIQ.ChartEngine#cleanupGaps}, for more details.
	 *
	 * @param  {array} quotes The quote array to be gap-filled
	 * @param  {CIQ.ChartEngine.Chart} [chart] Chart object to target.
	 * @param {object} [params] Parameters
	 * @param {string} [params.cleanupGaps] Pass this in to override the {@link CIQ.ChartEngine#cleanupGaps} value.
	 * @param {boolean} [params.noCleanupDates]		If true then dates have been cleaned up already by calling {@link CIQ.ChartEngine#doCleanupDates}, so do not do so in here.
	 * @param {string} [params.field]		Set to a field to fill gaps, or leave out to use chart.defaultPlotField.
	 * @return {array} The quote array with gaps filled in.
	 * @memberof CIQ.ChartEngine
	 * @since
	 * <br>&bull; 07/01/2015 it now supports cleanups for daily intervals and foreign exchanges instead of just intraday equities.
	 * <br>&bull; 3.0.7 added params.cleanupGaps to allow developers to use this function standalone
	 * <br>&bull; 5.2.0 added parameter noCleanupDates
	 * <br>&bull; 6.0.0 added parameter field
	 * <br>&bull; 6.0.0 if params.cleanupGaps is true, use the value of stxx.cleanupGaps.  If that's not set, then cleanupGaps is like carry.
	 */
	CIQ.ChartEngine.prototype.doCleanupGaps=function(quotes, chart, params) {
		if(!quotes || !quotes.length) return quotes;
		var interval = this.layout.interval;
		params=params?params:{};
		if(!chart) chart=this.chart;
		if(!params.noCleanupDates) this.doCleanupDates(quotes,interval);

		var cleanupGaps=params.cleanupGaps;
		if(cleanupGaps===false) return quotes;
		if(!cleanupGaps || cleanupGaps===true) cleanupGaps=this.cleanupGaps || cleanupGaps;
		var makeGaps=(cleanupGaps=="gap"); // "carry" or any other non-false will cause the closing price to carry, otherwise a null will be injected

		if(!cleanupGaps) return quotes;
		if(interval=="tick") return quotes;

		// doCleanupGaps works on the raw masterData, so if we're rolling up month or week then be sure to actually
		// cleanup gaps on the masterData which will be "day"
		if(interval=="month" || interval=="week"){
			if(this.dontRoll) return quotes; // We won't try to fill gaps on raw month or week data
			interval="day";
		}

		var _make_date = function (_quote) {
			if(_quote.DT ){
				if(Object.prototype.toString.call(_quote.DT) != '[object Date]' ) return new Date(_quote.DT); // epoch or ISO string
				return new Date(+_quote.DT);
			}
			return CIQ.strToDateTime(_quote.Date);
		};

		var new_quotes = [];
		var currentQuote=quotes[0];
		new_quotes.push(currentQuote);

		var iter_parms = {
			'begin': _make_date(currentQuote),
			'interval': interval,
			'periodicity': 1,
			'timeUnit': this.layout.timeUnit
		};
		var market = new CIQ.Market(chart.market.market_def);
		var iter = market.newIterator(iter_parms);
		if(this.extendedHours && this.extendedHours.filter) iter.market.enableAllAvailableSessions();

		var field=chart.defaultPlotField;
		var mdt;

		function fillGapsBetween(dt1, dt2){
			var paramField=params.field;
			var cQuote=paramField ? currentQuote[paramField] : currentQuote;
			if(cQuote===undefined) cQuote={};
			var close=makeGaps ? null : cQuote[field];
			var adjClose=makeGaps ? null : cQuote.Adj_Close;
			// Loop through the iterator adding a dummy quote for every missing market date between currentQuote and nextQuote
			while (+dt1 < +dt2){
				var newQuote={DT: dt1};
				if(paramField){
				}else{
					new_quotes.push(newQuote);
					CIQ.extend(newQuote,{
						Open: close,
						High: close,
						Low: close,
						Close: close,
						Volume: 0,
						Adj_Close: adjClose
					});
				}
				dt1 = iter.next();
			}
		}

		function copyForward(currentQuote, nextQuote){
			var paramField=params.field;
			if(paramField){
				if(typeof currentQuote[paramField]!="undefined" && typeof nextQuote[paramField]=="undefined"){
					nextQuote[paramField]=makeGaps?null:currentQuote[paramField];
				}
				return;
			}
			if(makeGaps) return;
			var close=currentQuote[field];
			var nextClose=nextQuote[field];
			if(typeof close!="undefined" && typeof nextClose=="undefined"){
				CIQ.ensureDefaults(nextQuote, {
					Close: close,
					Open: close,
					High: close,
					Low: close,
					Volume: 0,
					Adj_Close: currentQuote.Adj_Close
				});
			}
		}

		for(var i=1;i<quotes.length;i++) {
			var nextQuote=quotes[i];
			mdt = iter.next(); // market date
			var qdt = _make_date(nextQuote); // quote date

			fillGapsBetween(mdt, qdt);
			while (qdt < mdt) {
				if(++i==quotes.length) return new_quotes;
				copyForward(currentQuote, nextQuote);
				new_quotes.push(nextQuote);
				currentQuote=nextQuote;
				nextQuote=quotes[i];
				qdt = _make_date(nextQuote);
			}
			if (mdt < qdt) {
				i--;
				mdt = iter.previous();
			}else{
				copyForward(currentQuote, nextQuote);
				new_quotes.push(nextQuote);
				currentQuote=nextQuote;
			}
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
	 * For relative comparisons, this is the starting point.  It can be a number to specify an absolute amount,
	 * or a string to specify to use the baseline value (the first value in dataSegment) for a specific series (for instance "IBM").
	 * An empty string will compare against the baseline value of the main series.
	 *
	 * See {@link CIQ.ChartEngine#setChartScale} for more details.
	 * @type number|string
	 * @memberof CIQ.Comparison
	 * @since 5.1.0
	 */
	CIQ.Comparison.initialPrice=100;

	/**
	 * Used to compute the initial price when it is supplied as a string
	 * @param  {CIQ.ChartEngine.Chart} chart	The specific chart
	 * @return {number}			The initial price as a number
	 * @memberof CIQ.Comparison
	 * @since 5.1.0
	 * @private
	 */
	CIQ.Comparison.getInitialPrice=function(chart){
		if(chart.initialComparisonPrice) return chart.initialComparisonPrice;
		chart.initialComparisonPrice=100;
		var symbol=CIQ.Comparison.initialPrice;
		if(typeof(symbol)=="number") chart.initialComparisonPrice=symbol;  // absolute amount
		if(typeof(symbol)=="string"){
			if(chart.series[symbol] || symbol===""){
				var priceField="Close";
				if(chart.defaultPlotField){
					if(!chart.highLowBars) priceField=chart.defaultPlotField;
				}
				for(var i=chart.dataSet.length-chart.scroll;i<chart.dataSet.length;i++){
					var bar=chart.dataSet[i];
					if(bar){
						if(bar[symbol] && bar[symbol][priceField]){
							chart.initialComparisonPrice=bar[symbol][priceField];
							break;
						}else if(symbol==="" && bar[priceField]){
							chart.initialComparisonPrice=bar[priceField];
							break;
						}
					}
				}
			}
		}
		return chart.initialComparisonPrice;
	};

	/**
	 * Transform function for percent comparison charting
	 * @param  {CIQ.ChartEngine} stx	  The charting object
	 * @param  {CIQ.ChartEngine.Chart} chart	The specific chart
	 * @param  {number} price The price to transform
	 * @return {number}			The transformed price (into percentage)
	 * @memberof CIQ.Comparison
	 */
	CIQ.Comparison.priceToPercent=function(stx, chart, price){
		var baseline=CIQ.Comparison.baseline || price;
		return Math.round(((price-baseline)/baseline*100)*10000)/10000;
	};

	/**
	 * Untransform function for percent comparison charting
	 * @param  {CIQ.ChartEngine} stx	  The charting object
	 * @param  {CIQ.ChartEngine.Chart} chart	The specific chart
	 * @param  {number} percent The price to untransform
	 * @return {number}			The untransformed price
	 * @memberof CIQ.Comparison
	 */
	CIQ.Comparison.percentToPrice=function(stx, chart, percent){
		var baseline=CIQ.Comparison.baseline || 1;
		return baseline*(1+(percent/100));
	};

	/**
	 * Transform function for relative comparison charting
	 * @param  {CIQ.ChartEngine} stx	  The charting object
	 * @param  {CIQ.ChartEngine.Chart} chart	The specific chart
	 * @param  {number} price The price to transform
	 * @return {number}			The transformed price (relative to {@link CIQ.Comparison.initialPrice})
	 * @memberof CIQ.Comparison
	 * @since 5.1.0
	 */
	CIQ.Comparison.priceToRelative=function(stx, chart, price){
		var baseline=CIQ.Comparison.baseline || price;
		var initialPrice=CIQ.Comparison.getInitialPrice(chart);
		return initialPrice*price/baseline;
	};

	/**
	 * Untransform function for relative comparison charting
	 * @param  {CIQ.ChartEngine} stx	  The charting object
	 * @param  {CIQ.ChartEngine.Chart} chart	The specific chart
	 * @param  {number} relative The price to untransform
	 * @return {number}			The untransformed price
	 * @memberof CIQ.Comparison
	 * @since 5.1.0
	 */
	CIQ.Comparison.relativeToPrice=function(stx, chart, relative){
		var baseline=CIQ.Comparison.baseline || 1;
		var initialPrice=CIQ.Comparison.getInitialPrice(chart);
		return baseline*relative/initialPrice;
	};


	CIQ.Comparison.createComparisonSegmentInner=function(stx, chart){
		// create an array of the fields that we're going to compare
		var fields=[];
		var field, panel, yAxis;
		for(field in chart.series){
			var parameters=chart.series[field].parameters;
			if(parameters.isComparison){
				fields.push(parameters.symbol);
			}
		}
		var priceFields=["Close","Open","High","Low","iqPrevClose"];
		var highLowBars=stx.chart.highLowBars || stx.highLowBars[stx.layout.chartType];
		if(chart.defaultPlotField && !highLowBars) priceFields.unshift(chart.defaultPlotField);
		var baselineField=priceFields[0];
		var s=stx.layout.studies;
		if(s){
			for(var n in s){
				var sd=s[n];
				panel=stx.panels[sd.panel];
				yAxis=stx.getYAxisByName(panel, sd.name) || panel.yAxis;
				if(!panel || panel.yAxis!=yAxis) continue;
				for(field in sd.outputMap) priceFields.push(field);
				for(var h=0;h<=2;h++) priceFields.push(sd.name+"_hist"+(h?h:""));
				if(sd.referenceOutput) priceFields.push(sd.referenceOutput + " " + sd.name);
			}
		}
		for(var p in stx.plugins){
			var plugin=stx.plugins[p];
			if(!plugin.transformOutputs) continue;
			for(field in plugin.transformOutputs){
				priceFields.push(field);
			}
		}

		chart.initialComparisonPrice=null;
		chart.dataSegment=[];
		var firstQuote=null;
		var firstTick=chart.dataSet.length - chart.scroll;
		if(stx.micropixels+stx.layout.candleWidth/2<0) firstTick++;  // don't baseline comparison with a bar off the left edge
		var transformsToProcess=chart.maxTicks+3;  //make sure we have transformed enough data points that we plot the y-axis intercept correctly

		for(var i=0;i<=transformsToProcess;i++){
			if(i==transformsToProcess) i=-1;  //go back and revisit the tick before the first
			var position=firstTick + i;
			if(position<chart.dataSet.length && position>=0){
				var quote=chart.dataSet[position];
				var closingPrice=quote[baselineField];

				if(!firstQuote){
					if( closingPrice === 0 || closingPrice === null ) {
						if(i<0)
							break;	//if we still can't get a single tick to do this and we try to revisit, we are out, or we go into infinite loop
						else
							continue; // can't calculate the percentage gain/loss if the close is 0 or null.
					}
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
				if(!CIQ.Comparison.baseline && closingPrice) firstQuote = CIQ.clone(quote);
				CIQ.Comparison.baseline=firstQuote[baselineField];

				var j;
				for(j=0;j<priceFields.length;j++){
					field=priceFields[j];
					if(quote[field] || quote[field]===0)
						//quote.transform[field]=Math.round(((quote[field]-CIQ.Comparison.baseline)/CIQ.Comparison.baseline*100)*10000)/10000;	// first compute the close pct, our baseline
						quote.transform[field]=chart.transformFunc(stx, chart, quote[field]);
				}

				// Transform the series
				for(j=0;j<fields.length;j++){
					field=fields[j];
					var compSymbol=chart.series[field];
					if(i==-1 && compSymbol && compSymbol.parameters.isComparison){
						delete quote.transform[field];
						continue;
					}
					var seriesData=quote[field];
					for(var k=0;seriesData && k<priceFields.length;k++){
						var seriesPrice=seriesData[priceFields[k]];
						if(seriesPrice || seriesPrice===0){	// Skip blanks
							var baseline=firstQuote[field] && firstQuote[field][priceFields[0]];
							if(!baseline && baseline!==0){	// This takes care of a series that starts part way through the chart
															// The baseline is then computed looking back to what it would have been with a 0% change
								if(!firstQuote[field]) firstQuote[field]={};
								firstQuote[field][priceFields[k]]=baseline=seriesPrice*CIQ.Comparison.baseline/quote[baselineField];
							}
							if( baseline!==0){
								var masterBaseline=CIQ.Comparison.baseline || 1;
								var rationalizedPrice=seriesPrice*(masterBaseline/baseline);
								if(!quote.transform[field]) quote.transform[field]={};
								quote.transform[field][priceFields[k]]=chart.transformFunc(stx, chart, rationalizedPrice);
							}
						}
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
	 * @param  {number} price The raw percentage as a decimal
	 * @return {string}		  The percentage formatted as a percent (possibly using localization if set in stx)
	 * @memberof CIQ.Comparison
	 */
	CIQ.Comparison.priceFormat=function(stx, panel, price){
		if(price===null || typeof price=="undefined" || isNaN(price)) return "";
		var priceTick=panel.yAxis.priceTick;
		var internationalizer=stx.internationalizer;
		if(internationalizer){
			if(priceTick>=5) price=internationalizer.percent.format(price/100);
			else if(priceTick>=0.5) price=internationalizer.percent1.format(price/100);
			else if(priceTick>=0.05) price=internationalizer.percent2.format(price/100);
			else if(priceTick>=0.005) price=internationalizer.percent3.format(price/100);
			else price=internationalizer.percent4.format(price/100);

		}else{
			if(priceTick>=5) price=price.toFixed(0) + "%";
			else if(priceTick>=0.5) price=price.toFixed(1) + "%";
			else if(priceTick>=0.05) price=price.toFixed(2) + "%";
			else if(priceTick>=0.005) price=price.toFixed(3) + "%";
			else price=price.toFixed(4) + "%";
		}
		if(parseFloat(price)===0 && price.charAt(0)=="-"){	// remove minus sign from -0%, -0.0%, etc
			price=price.substring(1);
		}
		return price;
	};

	/**
	 * Turns comparison charting on or off and sets the transform.
	 *
	 * Should not be called directly. Either use the {@link CIQ.ChartEngine#addSeries} `isComparison` parameter or use {@link CIQ.ChartEngine#setChartScale}

	 * @param {string|boolean} mode Type of comparison ("percent" or "relative").
	 *  - Setting to true will enable "percent".
	 *  - Setting to "relative" will allow the comparisons to be rendered in relation to any provided 'basis' value. For example, the previous market day close price.
	 * @param {CIQ.ChartEngine.Chart} [chart] The specific chart for comparisons
	 * @param {*} [basis] For a "relative" mode, the basis to relate to.  Can be a number or a string.  If a string, will use the first price in the datasegment for the series keyed by the string.  Sets {@link CIQ.Comparison.initialPrice}.
	 * @memberof CIQ.ChartEngine
	 * @since  04-2015 Signature has been revised
	 * @since 5.1.0 Signature revised again, added basis
	 * @since 5.1.0 `mode` now also supports "relative" to allow comparisons to be rendered in relation to any provided value.
	 */
	CIQ.ChartEngine.prototype.setComparison=function(mode, chart, basis){
		if(!chart) chart=this.chart;
		if(typeof chart=="string") chart=this.charts[chart];
		if(basis || basis==="") CIQ.Comparison.initialPrice=basis;
		if(mode===true){ // backward compatibility, older versions uses a true/false switch because they did not support the developer setting arbitrary baseline values
			if(chart.isComparison) return; // Do nothing if it's already turned on
			mode="percent";
		}
		this.resetDynamicYAxis();
		var yAxis=chart.panel.yAxis;
		var wasComparison=(yAxis.priceFormatter == CIQ.Comparison.priceFormat);  // tests if the current formatter is a comparison formatter
																				 // this is like testing if the previous mode was "percent"
		switch(mode){
		case "relative":
			this.setTransform(chart, CIQ.Comparison.priceToRelative, CIQ.Comparison.relativeToPrice);
			if(wasComparison){
				yAxis.priceFormatter = yAxis.originalPriceFormatter?yAxis.originalPriceFormatter.func:null;
				yAxis.originalPriceFormatter = null;
			}
			yAxis.whichSet="dataSegment";
			chart.isComparison=true;
			break;
		case "percent":
			this.setTransform(chart, CIQ.Comparison.priceToPercent, CIQ.Comparison.percentToPrice);
			if(!wasComparison){
				yAxis.originalPriceFormatter = {func: yAxis.priceFormatter};
				yAxis.priceFormatter = CIQ.Comparison.priceFormat;
			}
			yAxis.whichSet="dataSegment";
			chart.isComparison=true;
			break;
		default:
			this.unsetTransform(chart);
			if(wasComparison){
				yAxis.priceFormatter=yAxis.originalPriceFormatter?yAxis.originalPriceFormatter.func:null;
				yAxis.originalPriceFormatter = null;
			}
			yAxis.whichSet="dataSet";
			chart.isComparison=false;
			break;
		}
	};

	/**
	 * Imports a users preferences from a saved location and uses them in the ChartEngine
	 * To save preferences see {@link CIQ.ChartEngine#exportPreferences}
	 * @param {object} preferences An object of {@link CIQ.ChartEngine#preferences}
	 * @memberof CIQ.ChartEngine
	 * @since 4.0.0
	 */
	CIQ.ChartEngine.prototype.importPreferences=function(preferences){
		CIQ.extend(this.preferences, preferences);
		if (preferences.timeZone) this.setTimeZone(this.dataZone, preferences.timeZone);
		if (preferences.language && CIQ.I18N){
			CIQ.I18N.localize(this, preferences.language);
		}
		this.changeOccurred("preferences");
	};

	/**
	 * Exports the {@link CIQ.ChartEngine#preferences} for external storage.
	 * Can then be imported again after being parsed with {@link CIQ.ChartEngine#importPreferences}
	 * @memberof CIQ.ChartEngine
	 * @returns {CIQ.ChartEngine#preferences}
	 * @since 4.0.0
	 */
	CIQ.ChartEngine.prototype.exportPreferences=function(){
		return this.preferences;
	};

	if(typeof document!="undefined") document.addEventListener("contextmenu", CIQ.ChartEngine.handleContextMenu);

	return _exports;
})/* removeIf(umd) */(typeof window !== 'undefined' ? window : global)/* endRemoveIf(umd) */;

