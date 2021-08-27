import { CIQ } from '../js/chartiq.js'
export { CIQ }

/**
 * CIQ namespace extension
 */
declare module '../js/chartiq.js' {
  export namespace CIQ.ChartEngine {
    /**
     * Used directly by CIQ.ChartEngine#setRange or indirectly by CIQ.ChartEngine#loadChart
     *
     */
    interface RangeParameters {
      /**
       * Date to set left side of the chart
       */
      dtLeft?: Date
      /**
       * Date to set right side of the chart
       */
      dtRight?: Date
      /**
       * Whitespace padding in pixels to apply to the right side of the chart after sizing for date range.
       * @default 0
       */
      padding?: number
      /**
       * Which chart, defaults to "chart"
       */
      chart?: CIQ.ChartEngine.Chart
      /**
       * set the right side of the chart to be in the future
       * @default false
       */
      goIntoFuture?: boolean
      /**
       * set the left side of the chart to be in the past
       * @default false
       */
      goIntoPast?: boolean
      /**
       * Override a specific periodicity combination to use with the range
       */
      periodicity?: CIQ.ChartEngine.PeriodicityParameters
      /**
       * override automatic candle width calculations
       */
      pixelPerBar?: number
      /**
       * skip saving the range in the layout
       * @default false
       */
      dontSaveRangeToLayout?: boolean
      /**
       * a complete load (used by loadChart)
       * @default false
       */
      forceLoad?: boolean
    }
    /**
     * Used directly by CIQ.ChartEngine#setSpan or indirectly by CIQ.ChartEngine#loadChart
     *
     */
    interface SpanParameters {
      /**
       * span to show; valid values are "minute", "day", "week", "month", "year", "all", "ytd", or "today"
       */
      base: string
      /**
       * Number of base units to show
       */
      multiplier: number
      /**
       * do not calculate a new periodicity
       * @default false
       */
      maintainPeriodicity?: boolean
      /**
       * whitespace in pixels to apply to the right side of the chart
       * @default 0
       */
      padding?: number
      /**
       * force a complete load (used by loadChart)
       * @default false
       */
      forceLoad?: boolean
      /**
       * Which chart, defaults to "chart"
       */
      chart?: CIQ.ChartEngine.Chart
    }
    /**
     * Drives the chart's relationship with the quote feed object provided to the chart.
     *
     * @since
     * - 5.1.1 Added `maximumTicks` to `behavior` parameter.
     * - 7.3.0 Moved `intervalTimer` property into `behavior` parameter. Added `filter` parameter.
     */
    class Driver {
      /**
       * Drives the chart's relationship with the quote feed object provided to the chart.
       *
       * @param stx A chart engine instance.
       * @param quoteFeed A quote feed object.
       * @param [behavior] See CIQ.ChartEngine#attachQuoteFeed for object details.
       * @param [filter] See CIQ.ChartEngine#attachQuoteFeed for function details.
       * @since
       * - 5.1.1 Added `maximumTicks` to `behavior` parameter.
       * - 7.3.0 Moved `intervalTimer` property into `behavior` parameter. Added `filter` parameter.
       */
      constructor(
        stx: CIQ.ChartEngine,
        quoteFeed: object,
        behavior?: object,
        filter?: Function
      )
    }
    /**
     * Convenience function that uses the configuration provided in `params.config` to create the
     * chart engine, attach quote feeds, initialize add-ons, add event listeners, and load the
     * chart.
     *
     * Use this function to simplify chart creation when you have a well defined configuration object.
     * A default configuration object can be obtained from *defaultConfiguration.js* (in the *js*
     * folder of your library).
     *
     * **Note:** You can also create a chart without using this function. For example, create the chart
     * engine by instantiating CIQ.ChartEngine. Attach quote feeds with
     * CIQ.ChartEngine#attachQuoteFeed. Instantiate add-ons such as CIQ.Tooltip and
     * CIQ.InactivityTimer to add them to the chart engine. Add event listeners with
     * CIQ.ChartEngine#addEventListener. Load the chart with CIQ.ChartEngine#loadChart.
     *
     * @param [params] Function parameters.
     * @param [params.container] The HTML element in which the chart engine is
     * 		created.
     * @param [params.config] Contains configuration specifications.
     * @param [params.config.chartEngineParams] Parameters required by the
     * 		CIQ.ChartEngine constructor except for a reference to the container HTML
     * 		element, which is provided by `params.container`, for example:
     * ```
     * {
     *     layout: {
     *         "chartType": "candle",
     *         "crosshair": true,
     *         "candleWidth": 30,
     *         "periodicity": 1,
     *         "interval": 'day',
     *     },
     *     preferences: {
     *         "currentPriceLine": true,
     *         "whitespace": 100
     *     },
     *     chart: {
     *         yAxis: {
     *           position: 'left'
     *         }
     *     }
     * }
     * ```
     * @param [params.config.quoteFeeds] Array of quote feed objects to attach to the chart
     * 		engine.
     * @param [params.config.marketFactory] Market factory object. When not provided,
     * 		CIQ.Market.Symbology.factory is used if available.
     * @param [params.config.addOns] Initialization properties for add-ons.
     * @param [params.config.chartId] Identifies the chart created by the chart engine.
     * @param [params.config.onChartReady] A callback function to call when the chart has
     * 		been loaded.
     * @param [params.config.callbacks] Event listeners to add to the chart engine. Use this
     * 		parameter to replace the default listeners for
     * 		[layout]CIQ.ChartEngine~layoutEventListener,
     * 		[symbolChange]CIQ.ChartEngine~symbolChangeEventListener,
     * 		[drawing]CIQ.ChartEngine~drawingEventListener,
     * 		[preferences]CIQ.ChartEngine~preferencesEventListener, and
     * 		[newChart]CIQ.ChartEngine~newChartEventListener.
     * 		**Note:** Other event listeners can be added to the chart engine using this parameter, but
     * 		the recommended approach for listeners other than the defaults is to use
     * 		CIQ.ChartEngine#addEventListener.
     * @param [params.config.callbacks.layout] Event listener that replaces the default
     * 		implementation provided by [getSaveLayout]CIQ.ChartEngine.getSaveLayout.
     * @param [params.config.callbacks.symbolChange] Event listener that replaces the
     * 		default implementation provided by [getSaveLayout]CIQ.ChartEngine.getSaveLayout.
     * @param [params.config.callbacks.drawing] Event listener that replaces the default
     * 		implementation provided by [getSaveDrawings]CIQ.ChartEngine.getSaveDrawings.
     * @param [params.config.callbacks.preferences] Event listener that replaces the
     * 		default implementation provided by
     * 		[getSavePreferences]CIQ.ChartEngine.getSavePreferences.
     * @param [params.config.callbacks.newChart] Event listener that replaces the default
     * 		implementation provided by [getRetoggleEvents]CIQ.ChartEngine.getRetoggleEvents.
     * @param [params.config.initialData] Initial data to show on the chart.
     * @param [params.config.restore] True if storage is to be used.
     * @param [params.deferLoad] If true, the chart is created but not loaded.
     * @return A reference to a new chart engine.
     *
     * @static
     * @since
     * - 7.5.0
     * - 8.0.0 Renamed from `CIQ.UI.Chart#createChart`. Revised parameter list from
     * 		`(container, config = {})`.
     */
    function create(
      params?: {
        container?: HTMLElement,
        config?: {
          chartEngineParams?: object,
          quoteFeeds?: object,
          marketFactory?: object,
          addOns?: object,
          chartId?: string,
          onChartReady?: Function,
          callbacks?: {
            layout?: Function,
            symbolChange?: Function,
            drawing?: Function,
            preferences?: Function,
            newChart?: Function
          },
          initialData?: object,
          restore?: boolean
        },
        deferLoad?: boolean
      }
    ): CIQ.ChartEngine
    /**
     * Returns a callback function that saves chart layout information. Uses an instance of
     * CIQ.NameValueStore if one is available; otherwise, saves the layout information to
     * local storage.
     *
     * **Note:** You can also serialize the chart layout using
     * CIQ.ChartEngine#exportLayout.
     *
     * @param [config] Configuration parameters.
     * @param [config.chartId] Identifies the layout in local storage for a specific chart.
     * @param [config.restore] Indicates whether the layout is restorable. If false, the
     * 		returned callback function does not save the chart layout.
     * @return A callback function that saves the chart layout in local storage. The
     * 		returned callback function is typically added to the chart engine as a
     * 		[layoutEventListener]CIQ.ChartEngine~layoutEventListener or
     * 		[symbolChangeEventListener]CIQ.ChartEngine~symbolChangeEventListener.
     *
     * @static
     * @since
     * - 7.5.0
     * - 8.0.0 Renamed from `CIQ.UI.Chart#getSaveLayout`.
     */
    function getSaveLayout(config?: {chartId?: string, restore?: boolean}): Function
    /**
     * Restores the chart layout from CIQ.NameValueStore if an instance is available;
     * otherwise, restores the layout from local storage.
     *
     * **Note:** You can also restore the chart layout using CIQ.ChartEngine#importLayout and
     * CIQ.ChartEngine#importDrawings.
     *
     * @param stx A reference to the chart engine.
     * @param cb A callback function to be called when restoration of the layout is
     * 		complete.
     * @param id The local storage identifier for the saved chart layout. See
     * 		[getSaveLayout]CIQ.ChartEngine.getSaveLayout.
     *
     * @static
     * @since
     * - 7.5.0
     * - 8.0.0 Renamed from `CIQ.UI.Chart#restoreLayout`.
     */
    function restoreLayout(stx: CIQ.ChartEngine, cb: Function, id: string): void
    /**
     * Returns a callback function that saves the state of chart drawings. Uses an instance of
     * CIQ.NameValueStore if one is available; otherwise, saves the state of the drawings in
     * local storage.
     *
     * **Note:** You can also serialize the state of chart drawings using
     * CIQ.ChartEngine#exportDrawings.
     *
     * @param [config] Configuration parameters.
     * @param [config.chartId] Identifies the drawings in local storage for a specific chart.
     * @param [config.restore] Indicates whether the chart drawings are restorable. If
     * 		false, the returned callback function does not save the chart drawings.
     * @return A callback function that saves the state of the chart drawings. The returned
     * 		callback function is typically added to the chart engine as a
     * 		[drawingEventListener]CIQ.ChartEngine~drawingEventListener.
     *
     * @static
     * @since
     * - 7.5.0
     * - 8.0.0 Renamed from `CIQ.UI.Chart#getSaveDrawings`.
     */
    function getSaveDrawings(config?: {chartId?: string, restore?: boolean}): Function
    /**
     * Restores the chart drawings from CIQ.NameValueStore if an instance is available;
     * otherwise, restores the drawings from local storage.
     *
     * **Note:** You can also restore saved chart drawings using
     * CIQ.ChartEngine#importDrawings.
     *
     * @param stx A reference to the chart engine.
     * @param symbol The chart symbol. Used along with `id` to identify the chart drawings in
     * 		local storage.
     * @param [id] The local storage identifier for the saved drawings. See
     * 		[getSaveDrawings]CIQ.ChartEngine.getSaveDrawings.
     *
     * @static
     * @since
     * - 7.5.0
     * - 8.0.0 Renamed from `CIQ.UI.Chart#restoreDrawings`.
     */
    function restoreDrawings(stx: CIQ.ChartEngine, symbol: string, id?: string): void
    /**
     * Returns a callback function that saves the chart preferences. Uses an instance of
     * CIQ.NameValueStore if one is available; otherwise, saves the preferences in local
     * storage.
     *
     * **Note:** You can also capture chart preferences using
     * CIQ.ChartEngine#exportPreferences.
     *
     * @param [config] Configuration parameters.
     * @param [config.chartId] Identifies the preferences in local storage for a specific
     * 		chart.
     * @param [config.restore] Indicates whether the chart preferences are restorable. If
     * 		false, the returned callback function does not save the chart preferences.
     * @return A callback function that saves the chart preferences. The returned callback
     * 		function is typically added to the chart engine as a
     * 		[preferencesEventListener]CIQ.ChartEngine~preferencesEventListener.
     *
     * @static
     * @since
     * - 7.5.0
     * - 8.0.0 Renamed from `CIQ.UI.Chart#savePreferences`. Revised parameter list from `({ stx })`.
     * 		Now returns a function.
     */
    function getSavePreferences(config?: {chartId?: string, restore?: boolean}): Function
    /**
     * Restores the chart preferences from CIQ.NameValueStore if an instance is available;
     * otherwise, restores the preferences from local storage.
     *
     * **Note:** You can also restore the chart preferences using
     * CIQ.ChartEngine#importPreferences.
     *
     * @param stx A reference to the chart engine.
     * @param [id] The local storage identifier for the saved chart preferences. See
     * 		[getSavePreferences]CIQ.ChartEngine.getSavePreferences.
     *
     * @static
     * @since
     * - 7.5.0
     * - 8.0.0 Renamed from `CIQ.UI.Chart#restorePreferences`.
     */
    function restorePreferences(stx: CIQ.ChartEngine, id?: string): void
    /**
     * Returns a callback function that restores the state of the chart markers.
     *
     * @param [config] Configuration parameters.
     * @param [config.chartId] Identifies the chart for which the state of the markers is
     * 		restored.
     * @param [config.selector.markersMenuItem] A CSS selector used to obtain references to
     * 		the DOM nodes that represent the marker radio buttons in the chart user interface. The DOM
     * 		nodes can be used to invoke the radio button event listeners to turn the markers on and
     * 		off. See *js/defaultConfiguration.js* for an example of this parameter.
     * @return A callback function that restores the state of the chart markers. The
     * 		returned function is typically assigned to
     * 		[newChartEventListener]CIQ.ChartEngine~newChartEventListener.
     *
     * @static
     * @since
     * - 7.5.0
     * - 8.0.0 Renamed from `CIQ.UI.Chart#retoggleEvents`. Revised parameter list from `({ stx })`.
     * 		Now returns a function.
     */
    function getRetoggleEvents(
      config?: {
        selector: {
          markersMenuItem?: string
        },
        chartId?: string
      }
    ): Function
    /**
     * READ ONLY. Map of registered drawing tools and their constructors.  Populated via lazy eval, so it only contains tools which were used so far.
     * @static
     */
    const drawingTools: object
    /**
     * Each CIQ.ChartEngine object clones this object template and uses the copy to store the
     * settings for the active drawing tool. The default settings can be changed by overriding these
     * defaults on your own files.
     *
     * See the [Creating a custom drawing toolbar]{@tutorial Custom Drawing Toolbar} tutorial for
     * details on how to use this template to replace the standard drawing toolbar.
     *
     * This object can be extended to support additional drawing tools; for instance, note the extensive
     * customization capabilities for
     * <a href="CIQ.ChartEngine.html#.currentVectorParameters%5B%60fibonacci%60%5D">fibonacci</a>.
     *
     * @static
     */
    let currentVectorParameters: {
      /**
       * The type of drawing to activate.
       *
       * See the list of classes in CIQ.Drawing for available drawing types. Use
       * CIQ.ChartEngine#changeVectorType to activate.
       *
       */
      vectorType: string,
      /**
       *  Line pattern.
       * <B>Valid values for pattern: solid, dotted, dashed, none</B>
       * Not all parameters/values are valid on all drawings. See the specific `reconstruct` method for your desired drawing for more details(Example: CIQ.Drawing.horizontal#reconstruct)
       */
      pattern: string,
      /**
       *  Line width
       * Not all parameters/values are valid on all drawings. See the specific `reconstruct` method for your desired drawing for more details(Example: CIQ.Drawing.horizontal#reconstruct)
       */
      lineWidth: number,
      /**
       *  Fill color.
       * Not all parameters/values are valid on all drawings. See the specific `reconstruct` method for your desired drawing for more details(Example: CIQ.Drawing.horizontal#reconstruct)
       */
      fillColor: string,
      /**
       * Line color.
       * Not all parameters/values are valid on all drawings. See the specific `reconstruct` method for your desired drawing for more details(Example: CIQ.Drawing.horizontal#reconstruct)
       */
      currentColor: string,
      /**
       * Axis Label.
       * Set to 'true' to display a label on the x axis.
       * Not all parameters/values are valid on all drawings. See the specific `reconstruct` method for your desired drawing for more details(Example: CIQ.Drawing.horizontal#reconstruct)
       */
      axisLabel: string,
      /**
       * Fibonacci settings.
       * See CIQ.Drawing.fibonacci#reconstruct `parameters` object for valid options
       * @example
       * fibonacci:{
       *     trend:{color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}},
       *     fibs:[
       *         {level:-0.786, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}},
       *         {level:-0.618, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}, display: true},
       *         {level:-0.382, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}, display: true},
       *         {level:0, color:"auto", parameters:{pattern:"solid", lineWidth:1}, display: true},
       *         {level:0.382, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}, display: true},
       *         {level:0.618, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}, display: true},
       *         {level:0.786, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}},
       *         {level:0.5, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}, display: true},
       *         {level:1, color:"auto", parameters:{pattern:"solid", lineWidth:1}, display: true},
       *         {level:1.382, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}, display: true},
       *         {level:1.618, color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}, display: true}
       *     ],
       *     extendLeft: false,
       *     printLevels: true, // display the % levels to the right of the drawing
       *     printValues: false, // display the values on the y axis
       *     timezone:{color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}}
       * }
       * @since
       * - 3.0.9 Added 0.786 and -0.786 levels.
       * - 5.2.0 Added 1.272 level.
       */
      fibonacci: {
      		trend: {
      			color: "auto",
      			parameters: { pattern: "solid", opacity: 0.25, lineWidth: 1 }
      		},
      		fibs: [
      			{
      				level: -0.786,
      				color: "auto",
      				parameters: { pattern: "solid", opacity: 0.25, lineWidth: 1 }
      			},
      			{
      				level: -0.618,
      				color: "auto",
      				parameters: { pattern: "solid", opacity: 0.25, lineWidth: 1 },
      				display: true
      			},
      			{
      				level: -0.5,
      				color: "auto",
      				parameters: { pattern: "solid", opacity: 0.25, lineWidth: 1 }
      			},
      			{
      				level: -0.382,
      				color: "auto",
      				parameters: { pattern: "solid", opacity: 0.25, lineWidth: 1 },
      				display: true
      			},
      			{
      				level: -0.236,
      				color: "auto",
      				parameters: { pattern: "solid", opacity: 0.25, lineWidth: 1 }
      			},
      			{
      				level: 0,
      				color: "auto",
      				parameters: { pattern: "solid", lineWidth: 1 },
      				display: true
      			},
      			{
      				level: 0.236,
      				color: "auto",
      				parameters: { pattern: "solid", opacity: 0.25, lineWidth: 1 }
      			},
      			{
      				level: 0.382,
      				color: "auto",
      				parameters: { pattern: "solid", opacity: 0.25, lineWidth: 1 },
      				display: true
      			},
      			{
      				level: 0.5,
      				color: "auto",
      				parameters: { pattern: "solid", opacity: 0.25, lineWidth: 1 },
      				display: true
      			},
      			{
      				level: 0.618,
      				color: "auto",
      				parameters: { pattern: "solid", opacity: 0.25, lineWidth: 1 },
      				display: true
      			},
      			{
      				level: 0.786,
      				color: "auto",
      				parameters: { pattern: "solid", opacity: 0.25, lineWidth: 1 }
      			},
      			{
      				level: 1,
      				color: "auto",
      				parameters: { pattern: "solid", lineWidth: 1 },
      				display: true
      			},
      			{
      				level: 1.272,
      				color: "auto",
      				parameters: { pattern: "solid", opacity: 0.25, lineWidth: 1 }
      			},
      			{
      				level: 1.382,
      				color: "auto",
      				parameters: { pattern: "solid", opacity: 0.25, lineWidth: 1 },
      				display: true
      			},
      			{
      				level: 1.618,
      				color: "auto",
      				parameters: { pattern: "solid", opacity: 0.25, lineWidth: 1 },
      				display: true
      			},
      			{
      				level: 2.618,
      				color: "auto",
      				parameters: { pattern: "solid", opacity: 0.25, lineWidth: 1 }
      			},
      			{
      				level: 4.236,
      				color: "auto",
      				parameters: { pattern: "solid", opacity: 0.25, lineWidth: 1 }
      			}
      		],
      		extendLeft: false,
      		printLevels: true,
      		printValues: false,
      		timezone: {
      			color: "auto",
      			parameters: { pattern: "solid", opacity: 0.25, lineWidth: 1 }
      		}
      	},
      /**
       * Annotation settings.
       * @example
       *	annotation:{
       *		font:{
       *			style:null,
       *			size:null,	// override .stx_annotation default
       *			weight:null, // override .stx_annotation default
       *			family:null // override .stx_annotation default
       *		}
       *	}
       */
      annotation: {
      		font: {
      			style: null,
      			size: null, // override .stx_annotation default
      			weight: null, // override .stx_annotation default
      			family: null // override .stx_annotation default
      		}
      	}
    }
    /**
     * This code prevents the browser context menu from popping up when right-clicking on a drawing or overlay.
     *
     * See [rightClickEventListener]CIQ.ChartEngine~rightClickEventListener.
     *
     * @param [e=event] Event
     * @return
     *
     */
    function handleContextMenu(e?: object): boolean
    /**
     * Defines raw html for the chart controls.
     *
     * These controls can be overridden by manually placing HTML elements in the chart container with the same ID.
     *
     * To completely disable a chart control, programmatically set `controls[controlID]=null` where controlID is the control to disable.
     * You can also set the main `htmlControls` object to null to disable all controls at once.
     * @example
     * var stxx=new CIQ.ChartEngine({container:document.querySelector(".chartContainer"), controls: {chartControls:null}});
     * @example
     * // before calling loadChart(). Disables all controls
     * stxx.controls=null;
     * @example
     * // before calling loadChart(). Disables only the chartControls (zoom on and out buttons)
     * stxx.controls["chartControls"]=null;
     * @static
     * @since 5.2.0 Any id can be set to null to disable
     */
    let htmlControls: {
      /**
       * controlID for the Annotation Save button (class="stx-btn stx_annotation_save").
       */
      annotationSave: string,
      /**
       * controlID for the Annotation Cancel button (class="stx-btn stx_annotation_cancel").
       */
      annotationCancel: string,
      /**
       * controlID for the Trash Can button / Series delete panel (class="mSticky"). Also see CIQ.ChartEngine#displaySticky
       * @example
       * // Disable the tooltip that appears when hovering over an overlay (drawing, line study, etc.).
       * stxx.controls["mSticky"]=null;
       */
      mSticky: string,
      /**
       * Indicator that it is OK to draw average lines on this plot line
       * @since 7.0.0
       */
      drawOk: string,
      /**
       * Indicator that it is OK to move a study or series
       * @since 7.1.0
       */
      dragOk: string,
      /**
       * controlID for the Horizontal Crosshair line (class="stx_crosshair stx_crosshair_x").
       */
      crossX: string,
      /**
       * controlID for the Vertical Crosshair line (class="stx_crosshair stx_crosshair_y").
       */
      crossY: string,
      /**
       * controlID for the zoom-in and zoom-out buttons (class="stx_chart_controls").
       */
      chartControls: string,
      /**
       * controlID for the home button (class="stx_jump_today home").
       * The button goes away if you are showing the most current data. See example to manually turn it off.
       * You can call `stxx.home();` programmatically.	 See CIQ.ChartEngine#home for more details
       * @example
       * // disable the home button
       * var stxx=new CIQ.ChartEngine({container:document.querySelector(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
       * stxx.controls["home"]=null;
       */
      home: string,
      /**
       * controlID for div which floats along the X axis with the crosshair date (class="stx-float-date").
       */
      floatDate: string,
      /**
       * controlID for div which controls the handle to resize panels (class="stx-ico-handle").
       * @example
       * // example to hide the handle and prevent resizing of panels
       * .stx-ico-handle {
       *		display: none;
       * }
       */
      handleTemplate: string,
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
       */
      iconsTemplate: string,
      /**
       * controlID for grabber which sits to right of baseline so it can be moved.
       */
      baselineHandle: string,
      /**
       * Holds notifications displayed by the chart. See CIQ.ChartEngine#displayNotification.
       *
       * @since 8.0.0
       */
      notificationTray: string
    }
  }

  /**
   * Base class for interacting with a name/value store.
   *
   * This base class saves to local storage, but you can create your own function overrides for
   * remote storage as long as you maintain the same function signatures and callback requirements.
   *
   * See WebComponents.cq-views for an implementation example.
   *
   */
  export namespace CIQ.NameValueStore {
    /**
     * A function called after a retrieval operation on the name/value store has been completed.
     *
     * @param error An error object or error code if data retrieval failed; null if
     * 		data retrieval was successful.
     * @param response The data retrieved from storage or null if retrieval failed.
     *
     * @callback CIQ.NameValueStore~getCallback
     * @since 8.2.0
     */
    type getCallback = (error: object|string, response: object|string) => void
    /**
     * A function called after an update of the name/value store has been completed.
     *
     * @param error An error object or error code if the storage update failed; null
     * 		if the update was successful.
     *
     * @callback CIQ.NameValueStore~updateCallback
     * @since 8.2.0
     */
    type updateCallback = (error: object|string) => void
  }

  /**
   * See tutorial [Data Integration : Quotefeeds]{@tutorial DataIntegrationQuoteFeeds} for a complete overview and
   * step by step source code for implementing a quotefeed
   *
   * Interface for classes that implement a quotefeed. You define a quotefeed object and attach it to
   * the chart using CIQ.ChartEngine#attachQuoteFeed. Each member "fetch..." method is optional. The chart
   * will call your member method if it exists, and will skip if it does not.
   *
   * Also see CIQ.ChartEngine#dontRoll if your feed aggregates weekly and monthly bars and you do not wish the chart to roll them from daily bars.
   *
   */
  export namespace quotefeed {
    /**
     * All of your quote feed "fetch..." methods **must** call this callback function to return
     * results to the chart, even if no data is returned from your feed.
     *
     * @param response Contains the results of the quote feed function that called this
     * 		callback function.
     * @param [response.error] An error message, if one occurred.
     * @param [response.suppressAlert] Set this to true to not display errors.
     * @param [response.quotes] An array of quotes in required JSON format, if no error
     * 		occurred.
     * @param [response.moreAvailable] Set this to false to stop pagination requests if
     * 		you know that no older data is available.
     * @param [response.upToDate] Set this to true to stop forward pagination requests
     * 		if you know that no newer data is available.
     * @param [response.attribution] This object is assigned to `stx.chart.attribution`.
     * 		Your UI can use this to display attribution messages. See example below.
     *
     * @callback quotefeed~dataCallback
     *
     * @example <caption>Returning quotes in the <code>dataCallback</code> object.</caption>
     * cb({quotes:[--array of quote elements here--]});
     *
     * @example <caption>Returning an error in the <code>dataCallback</code> object.</caption>
     * cb({error:"Your error message here"});
     *
     * @example <caption>Setting <code>attribution</code> through the <code>dataCallback</code>
     * object.</caption>
     *
     * // Set up a callback function to be called whenever fetchInitialData is called.
     *  stxx.attachQuoteFeed(yourQuoteFeed, {callback: showAttribution});
     *
     * // After every data call, the attribution function is called,
     * // and you can then use it to display any message regarding the quote feed.
     *	function showAttribution(params){
     *		var message=params.stx.chart.attribution.message;
     *		// Add your code here to display the message on your screen.
     *	}
     *
     * // In your quote feed's fetchInitialData method, set the attribution object.
     * cb({quotes:[--array of quote elements here--], attribution:{message:"Data is delayed by 15 minutes"}});
     *
     * @since 8.0.0 Added the `response.upToDate` property.
     */
    type dataCallback = (response: {error?: string,suppressAlert?: string,quotes?: any[],moreAvailable?: boolean,upToDate?: boolean,attribution?: object}) => void
    /**
     * See [Data Integration : Quotefeeds]{@tutorial DataIntegrationQuoteFeeds}
     *
     * The charting engine calls this quotefeed function whenever the chart is wiped clean and created again with new data.
     * This typically occurs when CIQ.ChartEngine#loadChart is called but can also occur from other methods such as CIQ.ChartEngine#setPeriodicity
     * or CIQ.ChartEngine#importLayout.
     *
     * @param symbol The ticker symbol of the data being fetched
     * @param suggestedStartDate A suggested starting date for the fetched data (based on how much can be displayed)
     * @param suggestedEndDate A suggested starting date for the fetched data (based on how much can be displayed)
     * @param params						-Provides additional information on the data requested by the chart.
     * @param	params.series 				-If true then the request is for series/comparison data (i.e. not the the main symbol)
     * @param params.stx 			-The chart object requesting data
     * @param [params.symbolObject] 		-The symbol to fetch in object format; if a symbolObject is initialized ( see CIQ.ChartEngine#loadChart, CIQ.ChartEngine#addSeries, CIQ.Comparison.add )
     * @param params.period 				-The timeframe each returned object represents. For example, if using interval "minute", a period of 30 means your feed must return ticks (objects) with dates 30 minutes apart; where each tick represents the aggregated activity for that 30 minute period. **Note that this will not always be the same as the period set in CIQ.ChartEngine#setPeriodicity, since it represents the aggregation of the raw data to be returned by the feed server, rather than the final data to be displayed.**
     * @param params.interval 				-The type of data your feed will need to provide. Allowable values: "millisecond,"second","minute","day","week","month". (This is **not** how much data you want the chart to show on the screen; for that you can use CIQ.ChartEngine#setRange or CIQ.ChartEngine#setSpan)
     * @param [params.fetchMaximumBars]	-If set to true, the chart requires as much historical data as is available from the feed (params.ticks may also be set to 20,000 to set a safety max), regardless of start date. This is needed for some chart types since they aggregate data (kagi,renko, or linebreak, for example). Developers implementing fetch, should override params.tick and use a smaller number if their feed can't support that much data being sent back. The engine will then make multiple smaller calls to get enough data to fill the screen.
     * @param params.ticks 				-The suggested number of data points to return. This is calculated as twice the number of bars displayed on the chart. This can be used as an alternative to suggestedStartDate.
     * @param [params.timeout=10000]		-This may be used to set the timeout in msec of the remote server request.
     * @param  cb			-Call this function with the results (or error) of your data request.
     * @since 4.1.2 Added `timeout` parameter.
     */
    function fetchInitialData(
      symbol: string,
      suggestedStartDate: Date,
      suggestedEndDate: Date,
      params: {
        series: Boolean,
        stx: CIQ.ChartEngine,
        period: number,
        interval: string,
        ticks: number,
        symbolObject?: string,
        fetchMaximumBars?: Boolean,
        timeout?: number
      },
      cb: quotefeed.dataCallback
    ): void
    /**
     * See [Data Integration : Quotefeeds]{@tutorial DataIntegrationQuoteFeeds}
     *
     * The charting engine calls this quotefeed function periodically (poll) to request updated data.
     * The polling frequency is determined by the `refreshInterval` that you provided when you called CIQ.ChartEngine#attachQuoteFeed.
     *
     * @param symbol The ticker symbol of the data being fetched
     * @param startDate The starting date for the fetched data (based on how much can be displayed)
     * @param params						-Provides additional information on the data requested by the chart.
     * @param	params.series 				-If true then the request is for series/comparison data (i.e. not the main symbol)
     * @param params.stx 			-The chart object requesting data
     * @param [params.symbolObject] 		-The symbol to fetch in object format; if a symbolObject is initialized ( see CIQ.ChartEngine#loadChart, CIQ.ChartEngine#addSeries, CIQ.Comparison.add )
     * @param params.period 				-The timeframe each returned object represents. For example, if using interval "minute", a period of 30 means your feed must return ticks (objects) with dates 30 minutes apart; where each tick represents the aggregated activity for that 30 minute period. **Note that this will not always be the same as the period set in CIQ.ChartEngine#setPeriodicity, since it represents the aggregation of the raw data to be returned by the feed server, rather than the final data to be displayed.**
     * @param params.interval 				-The type of data your feed will need to provide. Allowable values: "millisecond,"second","minute","day","week","month". (This is **not** how much data you want the chart to show on the screen; for that you can use CIQ.ChartEngine#setRange or CIQ.ChartEngine#setSpan)
     * @param [params.timeout=10000]		-This may be used to set the timeout in msec of the remote server request.
     * @param  cb			-Call this function with the results (or error) of your data request.
     * @since 4.1.2 Added `timeout` parameter.
     */
    function fetchUpdateData(
      symbol: string,
      startDate: Date,
      params: {
        series: Boolean,
        stx: CIQ.ChartEngine,
        period: number,
        interval: string,
        symbolObject?: string,
        timeout?: number
      },
      cb: quotefeed.dataCallback
    ): void
    /**
     * See [Data Integration : Quotefeeds]{@tutorial DataIntegrationQuoteFeeds}
     *
     * The charting engine calls this quotefeed function whenever the chart requires older data.
     * Usually this is because a user has scrolled or zoomed past the end of the data.
     * *Note: This method may be called during initial load if your fetchInitialData didn't provide enough data to fill the visible chart.*
     *
     * @param symbol The ticker symbol of the data being fetched
     * @param suggestedStartDate A suggested starting data for the fetched data (based on how much can be displayed)
     * @param endDate The date of the last data point currently available in the chart. You should return data from this point and then backward in time.
     * @param params						-Provides additional information on the data requested by the chart.
     * @param params.stx 			-The chart object requesting data
     * @param [params.symbolObject] 		-The symbol to fetch in object format; if a symbolObject is initialized ( see CIQ.ChartEngine#loadChart, CIQ.ChartEngine#addSeries, CIQ.Comparison.add )
     * @param params.period 				-The timeframe each returned object represents. For example, if using interval "minute", a period of 30 means your feed must return ticks (objects) with dates 30 minutes apart; where each tick represents the aggregated activity for that 30 minute period. **Note that this will not always be the same as the period set in CIQ.ChartEngine#setPeriodicity, since it represents the aggregation of the raw data to be returned by the feed server, rather than the final data to be displayed.**
     * @param params.interval 				-The type of data your feed will need to provide. Allowable values: "millisecond,"second","minute","day","week","month". (This is **not** how much data you want the chart to show on the screen; for that you can use CIQ.ChartEngine#setRange or CIQ.ChartEngine#setSpan)
     * @param [params.fetchMaximumBars]	-If set to true, the chart requires as much historical data as is available from the feed (params.ticks may also be set to 20,000 to set a safety max), regardless of start date. This is needed for some chart types since they aggregate data (kagi,renko, or linebreak, for example). Developers implementing fetch, should override params.tick and use a smaller number if their feed can't support that much data being sent back. The engine will then make multiple smaller calls to get enough data to fill the screen.
     * @param params.ticks 				-The suggested number of data points to return. This is calculated as twice the number of bars displayed on the chart. This can be used as an alternative to suggestedStartDate.
     * @param [params.timeout=10000]		-This may be used to set the timeout in msec of the remote server request.
     * @param [params.future]             -If set to true, the chart is scrolling in a 'forward' direction
     * @param  cb			-Call this function with the results (or error) of your data request.
     * @since
     * - 4.1.2 Added `params.timeout`.
     * - 6.0.0 Added `params.future`.
     */
    function fetchPaginationData(
      symbol: string,
      suggestedStartDate: Date,
      endDate: Date,
      params: {
        stx: CIQ.ChartEngine,
        period: number,
        interval: string,
        ticks: number,
        symbolObject?: string,
        fetchMaximumBars?: Boolean,
        timeout?: number,
        future?: Boolean
      },
      cb: quotefeed.dataCallback
    ): void
    /**
     * See [Data Integration : Advanced]{@tutorial DataIntegrationAdvanced}
     *
     * Although not a core quotefeed function, the charting engine calls this optional function each time the chart encounters a new symbol or a particular periodicity for that symbol.
     * This could happen when a user changes periodcity, changes a symbol, adds a comparison symbol, or a new study is added that requires an underlying symbol.
     *
     * Use this along with unsubscribe() to keep track of symbols on the chart.
     * Use cases include: maintaining legends, lists of securities, or adding/removing subscriptions to streaming connections.
     *
     * If using a push stream, subscribe and then have the push streamer push updates using CIQ.ChartEngine#updateChartData.
     *
     * @param params						-Provides additional information on the data requested by the chart.
     * @param params.stx 			-The chart object requesting data
     * @param params.symbol 				-The symbol being added
     * @param params.symbolObject 			-The symbol being added in object form
     * @param params.period 				-The timeframe each returned object represents. For example, if using interval "minute", a period of 30 means your feed must return ticks (objects) with dates 30 minutes apart; where each tick represents the aggregated activity for that 30 minute period. **Note that this will not always be the same as the period set in CIQ.ChartEngine#setPeriodicity, since it represents the aggregation of the raw data to be returned by the feed server, rather than the final data to be displayed.**
     * @param params.interval 				-The type of data your feed will need to provide. Allowable values: "millisecond,"second","minute","day","week","month". (This is **not** how much data you want the chart to show on the screen; for that you can use CIQ.ChartEngine#setRange or CIQ.ChartEngine#setSpan)
     * @since 4.0.0 Changes to periodicity (period/interval) will now also cause subscribe calls.
     */
    function subscribe(
      params: {
        stx: CIQ.ChartEngine,
        symbol: string,
        symbolObject: string,
        period: number,
        interval: string
      }
    ): void
    /**
     * See [Data Integration : Advanced]{@tutorial DataIntegrationAdvanced}
     *
     * Although not a core quotefeed function, the charting engine calls this optional function each time the chart no longer requires a symbol or a particular periodicity for that symbol.
     *
     * @param params						-Provides additional information on the data requested by the chart.
     * @param params.stx 			-The chart object requesting data
     * @param params.symbol				-The symbol being removed
     * @param params.symbolObject 			-The symbol being removed in object form
     * @param params.period 				-The timeframe each returned object represents. For example, if using interval "minute", a period of 30 means your feed must return ticks (objects) with dates 30 minutes apart; where each tick represents the aggregated activity for that 30 minute period. **Note that this will not always be the same as the period set in CIQ.ChartEngine#setPeriodicity, since it represents the aggregation of the raw data to be returned by the feed server, rather than the final data to be displayed.**
     * @param params.interval 				-The type of data your feed will need to provide. Allowable values: "millisecond,"second","minute","day","week","month". (This is **not** how much data you want the chart to show on the screen; for that you can use CIQ.ChartEngine#setRange or CIQ.ChartEngine#setSpan)
     * @since 4.0.0 Changes to periodicity (period/interval) will now also cause unsubscribe calls.
     */
    function unsubscribe(
      params: {
        stx: CIQ.ChartEngine,
        symbol: string,
        symbolObject: string,
        period: number,
        interval: string
      }
    ): void
  }

  export namespace CIQ {
    /**
     * Base class for Drawing Tools. Use CIQ.inheritsFrom to build a subclass for custom drawing tools.
     * The name of the subclass should be CIQ.Drawing.yourname. Whenever CIQ.ChartEngine.currentVectorParameters.vectorType==yourname, then
     * your drawing tool will be the one that is enabled when the user begins a drawing. Capitalization of yourname
     * must be an exact match otherwise the kernel will not be able to find your drawing tool.
     *
     * Each of the CIQ.Drawing prototype functions may be overridden. To create a functioning drawing tool
     * you must override the functions below that create alerts.
     *
     * Drawing clicks are always delivered in *adjusted price*. That is, if a stock has experienced splits then
     * the drawing will not display correctly on an unadjusted price chart unless this is considered during the rendering
     * process. Follow the templates to assure correct rendering under both circumstances.
     *
     * If no color is specified when building a drawing then color will be set to "auto" and the chart will automatically display
     * white or black depending on the background.
     *
     * **Permanent drawings:**
     * To make a particular drawing permanent, set its `permanent` property to `true` once created.
     * Example:
     * ```drawingObject.permanent=true;```
     *
     * See {@tutorial Using and Customizing Drawing Tools} for more details.
     *
     */
    class Drawing {
      /**
       * Base class for Drawing Tools. Use CIQ.inheritsFrom to build a subclass for custom drawing tools.
       * The name of the subclass should be CIQ.Drawing.yourname. Whenever CIQ.ChartEngine.currentVectorParameters.vectorType==yourname, then
       * your drawing tool will be the one that is enabled when the user begins a drawing. Capitalization of yourname
       * must be an exact match otherwise the kernel will not be able to find your drawing tool.
       *
       * Each of the CIQ.Drawing prototype functions may be overridden. To create a functioning drawing tool
       * you must override the functions below that create alerts.
       *
       * Drawing clicks are always delivered in *adjusted price*. That is, if a stock has experienced splits then
       * the drawing will not display correctly on an unadjusted price chart unless this is considered during the rendering
       * process. Follow the templates to assure correct rendering under both circumstances.
       *
       * If no color is specified when building a drawing then color will be set to "auto" and the chart will automatically display
       * white or black depending on the background.
       *
       * **Permanent drawings:**
       * To make a particular drawing permanent, set its `permanent` property to `true` once created.
       * Example:
       * ```drawingObject.permanent=true;```
       *
       * See {@tutorial Using and Customizing Drawing Tools} for more details.
       *
       */
      constructor()
      /**
       * Called when a user clicks while drawing.
       *
       * @param context The canvas context.
       * @param tick The tick in the `dataSet`.
       * @param value The value (price) of the click.
       * @return True if the drawing is complete. Otherwise the kernel continues accepting
       * 		clicks.
       *
       */
      public click(context: object, tick: number, value: number): boolean
      /**
       * Called when the user attempts to reposition a drawing. The repositioner is the object provided
       * by CIQ.Drawing.intersected and can be used to determine which aspect of the drawing is
       * being repositioned. For instance, this object may indicate which point on the drawing was
       * selected by the user. It might also contain the original coordinates of the point or anything
       * else that is useful to render the drawing.
       *
       * @param  context The canvas context.
       * @param  repositioner The repositioner object.
       * @param  tick Current tick in the `dataSet` for the mouse cursor.
       * @param  value Current value in the `dataSet` for the mouse cursor.
       *
       */
      public reposition(
        context: object,
        repositioner: object,
        tick: number,
        value: number
      ): void
      /**
       * Called to determine whether the drawing is intersected by either the tick/value (pointer
       * location) or box (small box surrounding the pointer). For line-based drawings, the box should
       * be checked. For area drawings (rectangles, circles) the point should be checked.
       *
       * @param tick The tick in the `dataSet` representing the cursor point.
       * @param value The value (price) representing the cursor point.
       * @param box	x0, y0, x1, y1, r representing an area around the cursor, including radius.
       * @return An object that contains information about the intersection. This object is
       * 		passed back to CIQ.Drawing.reposition when repositioning the drawing. Return
       * 		false or null if not intersected. Simply returning true highlights the drawing.
       *
       */
      public intersected(tick: number, value: number, box: object): object
      /**
       * Instance function used to copy the relevant drawing parameters into itself.
       * It just calls the static function.
       * @param withPreferences set to true to return previously saved preferences
       * @since 3.0.0
       */
      public copyConfig(withPreferences: boolean): void
      /**
       * Used to set the user behavior for creating drawings.
       *
       * By default, a drawing is created with this sequence:
       * `move crosshair to staring point` → `click` → `move crosshair to ending point` → `click`.
       * > On a touch device this would be:
       * > `move crosshair to staring point` → `tap` → `move crosshair to ending point` → `tap`.
       *
       * Set dragToDraw to `true` to create the drawing with the following alternate sequence:
       * `move crosshair to staring point` → `mousedown` → `drag` → `mouseup`
       * > On a touch device this would be:
       * > `move crosshair to staring point` → `press` → `drag` → `release`.
       *
       *  This parameter is **not compatible** with drawings requiring more than one drag movement to complete, such as:
       *  - Channel
       *  - Continues Line
       *  - Elliott Wave
       *  - Gartley
       *  - Pitchfork
       *  - Fibonacci Projection
       *
       * Line and Ray have their own separate parameter, which also needs to be set in the same way,  if this option is desired:   `CIQ.Drawing.line.prototype.dragToDraw=true;`
       *
       * This parameter may be set for all drawings compatible with it, for a specific drawing type, or for a specific drawing instance. See examples.
       * @example
       * // set drawing instance to dragToDraw. Only this one drawing will be affected
       * drawing.dragToDraw=true;
       * // Set particular drawing prototype to dragToDraw. All drawings to type "difference" will be affected
       * CIQ.Drawing["difference"].prototype.dragToDraw=true;
       * // Set all drawings to dragToDraw
       * CIQ.Drawing.prototype.dragToDraw=true;
       */
      public dragToDraw
      /**
       * Set this to true to disable selection, repositioning and deletion by the end user.
       *
       * This parameter may be set for all drawings, for a specific drawing type, or for a specific drawing instance. See examples.
       * @example
       * // set drawing instance to permanent. Only this one drawing will be affected
       * drawing.permanent=true;
       * // Set particular drawing prototype to permanent. All drawings to type "difference" will be affected
       * CIQ.Drawing["difference"].prototype.permanent=true;
       * // Set all drawings to permanent
       * CIQ.Drawing.prototype.permanent=true;
       */
      public permanent
      /**
       * Set this to true to restrict drawing from being rendered on a study panel.
       *
       * This parameter may be set for all drawings, for a specific drawing type, or for a specific drawing instance. See examples.
       * @example
       * // set drawing instance to chartsOnly. Only this one drawing will be affected
       * drawing.chartsOnly=true;
       * // Set particular drawing prototype to chartsOnly. All drawings to type "difference" will be affected
       * CIQ.Drawing["difference"].prototype.chartsOnly=true;
       * // Set all drawings to chartsOnly
       * CIQ.Drawing.prototype.chartsOnly=true;
       */
      public chartsOnly
      /**
       * Is called to tell a drawing to abort itself. It should clean up any rendered objects such as DOM elements or toggle states. It
       * does not need to clean up anything that it drew on the canvas.
       * @param  forceClear Indicates that the user explicitly has deleted the drawing (advanced usage)
       */
      public abort(forceClear: boolean): void
      /**
       * Should call this.stx.setMeasure() with the measurements of the drawing if supported
       */
      public measure(): void
      /**
       * Initializes the drawing
       * @param  stx   The chart object
       * @param  panel The panel reference
       */
      public construct(stx: CIQ.ChartEngine, panel: CIQ.ChartEngine.Panel): void
      /**
       * Called to render the drawing
       * @param context Canvas context on which to render.
       */
      public render(context: CanvasRenderingContext2D): void
      /**
       * Called when the user moves while creating a drawing.
       * @param context Canvas context on which to render.
       * @param tick Tick in the `dataSet`.
       * @param value Value at position.
       */
      public move(
        context: CanvasRenderingContext2D,
        tick: number,
        value: number
      ): void
      /**
       * Reconstruct this drawing type from a serialization object
       * @param stx Instance of the chart engine
       * @param obj Serialized data about the drawing from which it can be reconstructed.
       */
      public reconstruct(stx: CIQ.ChartEngine, obj: object): void
      /**
       * Serialize a drawing into an object.
       */
      public serialize(): void
      /**
       * Called whenever periodicity changes so that drawings can adjust their rendering.
       */
      public adjust(): void
      /**
       * Returns true if the tick and value are inside the box
       * @param  tick  The tick
       * @param  value The value
       * @param  box   The box
       * @param  isPixels   True if tick and value are in pixels; otherwise, they assumed to be in ticks and untransformed y-axis values, respectively
       * @return       True if the tick and value are within the box
       * @since 7.0.0 Added `isPixels`.
       */
      public pointIntersection(tick: number, value: number, box: object, isPixels: boolean): boolean
      /**
       * Compute the proper color to use when rendering lines in the drawing.
       *
       * Will use the color but if set to auto or transparent, will use the container's defaultColor.
       * However, if color is set to auto and the drawing is based off a series or study plot,
       * this function will return that plot's color.
       * If drawing is highlighted will use the highlight color as defined in stx_highlight_vector style.
       * @param color Color string to check and use as a basis for setting.  If not supplied, uses this.color.
       * @return Color to use for the line drawing
       * @since 7.0.0 Replaces `setLineColor`. Will return source line's color if auto.
       * @example
       * 		var trendLineColor=this.getLineColor();
       *		this.stx.plotLine(x0, x1, y0, y1, trendLineColor, "segment", context, panel, parameters);
       */
      public getLineColor(color: string): string
    }
    /**
     * A simple device to make ease functions easy to use. Requests a cubic function that takes the
     * form `function (t, b, c, d)`, where:
     * - t = current time
     * - b = starting value
     * - c = change in value
     * - d = duration
     *
     * 		a single value.
     * 		single value.
     *
     * @example
     * let e = new CIQ.EaseMachine(Math["easeInOutCubic"], 200);
     * e.run(function(v){console.log(v)}, 100, 110);
     */
    class EaseMachine {
      /**
       * A simple device to make ease functions easy to use. Requests a cubic function that takes the
       * form `function (t, b, c, d)`, where:
       * - t = current time
       * - b = starting value
       * - c = change in value
       * - d = duration
       *
       * @param fc The cubic function.
       * @param ms Milliseconds to perform the function.
       * @param [startValues] Name/value pairs of starting values, or
       * 		a single value.
       * @param [endValues] Name/value pairs of ending values, or a
       * 		single value.
       *
       * @example
       * let e = new CIQ.EaseMachine(Math["easeInOutCubic"], 200);
       * e.run(function(v){console.log(v)}, 100, 110);
       */
      constructor(
        fc: Function,
        ms: number,
        startValues?: Record<string, number>|number,
        endValues?: Record<string, number>|number
      )
      /**
       * Resets the ease machine with a new set of values.
       *
       * @param startValues Name/value pairs of starting values, or a
       * 		single value. If null, the `endValues` become the `startValues` (allowing for resetting or
       * 		reversing of direction).
       * @param endValues Name/value pairs of ending values, or a
       * 		single value.
       *
       */
      public reset(
        startValues: Record<string, number>|number,
        endValues: Record<string, number>|number
      ): void
      /**
       * This will be false while the ease machine is completing
       */
      public hasCompleted: boolean
      /**
       * Runs the ease machine in a loop until completion by calling `next()` from within a
       * `requestAnimationFrame`.
       *
       * @param fc Function callback which receives the results of
       * 		CIQ.EaseMachine#next.
       * @param [startValues] Name/value pairs of starting values, or
       * 		a single value.
       * @param [endValues] Name/value pairs of ending values, or a
       * 		single value.
       * @param [delayFirstRun=false] Normally, the first pass of the run happens immediately.
       * 		Pass true if you want to wait for the next animation frame before beginning.
       *
       */
      public run(
        fc: Function,
        startValues?: Record<string, number>|number,
        endValues?: Record<string, number>|number,
        delayFirstRun?: boolean
      ): void
      /**
       * Stops the ease machine from running mid-animation. Returns the current state.
       *
       * @return Name/value pairs of current values, or the current value.
       *
       */
      public stop(): Record<string, number>
    }
    /**
     * Namespace for Internationalization API.
     * See {@tutorial Localization} for more details.
     */
    class I18N {
    }
    /**
     * A marker is a DOM object that is managed by the chart.
     *
     * Makers are placed in containers which are `div` elements whose placement and size correspond with a panel on the
     * chart. A container exists for each panel.
     *
     * A marker's primary purpose is to provide additional information for a data point on the chart. As such, markers
     * can be placed by date, tick, or bar to control their position on the x-axis, and by value (price) to control their
     * position on the y-axis. Additional default positioning is also available, including the ability to create custom
     * positioning logic. Once the positioning logic is established for markers, they are repositioned as needed when the
     * user scrolls or zooms the chart.
     *
     * Alternatively, a marker can also be placed at an absolute position using CSS positioning, in which case the chart
     * does not control the marker's positioning.
     *
     * The default placement function for any markers is CIQ.ChartEngine#defaultMarkerPlacement.
     *
     * See the {@tutorial Markers} tutorial for additional implementation details and information about managing
     * performance on deployments requiring a large number of markers.
     *
     * 					which the marker is associated.
     * 					If this value is not provided, the marker is set "above_candle" as long as a valid candle is selected
     * 					by `params.x`.
     * 					DOM. If an element is not provided, an empty `div` is created. You can create your own or use the provided CIQ.Marker.Simple and CIQ.Marker.Performance node creators.
     * 					chart panel.
     * Values include:
     * - "date" — `params.x` must be set to a JavaScript date object. This will be converted to the closest `masterData`
     * position if the provided date does not exactly match any existing points. Be sure the same timezone as masterData is used.
     * - "master" — `params.x` must be set to a `masterData` position.
     * - "bar" — `params.x` must be set to a `dataSegment` position.
     * - "none" — Use CSS positioning; `params.x` is not used.
     * Values include:
     * - "value" — `params.y` must be set to an exact y-axis value. If `params.y` is omitted, the y-axis position defaults
     * to "above_candle".
     * - "above_candle" — Positions the marker right above the candle or line. If more than one marker is at the same position,
     * the markers are aligned upwards from the first. The `params.y` value is not used.
     * - "below_candle" — Positions the marker right below the candle or line. If more than one marker is at the same position,
     * the markers are aligned downwards from the first. The `params.y` value is not used.
     * - "under_candle" — Deprecated; same as "below_candle".
     * - "on_candle" — Position the marker in the center of the candle or line, covering it. If more than one marker is at the
     * same position, the markers are aligned downwards from the first. The `params.y` value is not used.
     * - "top" — Position the marker at the top of the chart, right below the margin. If more than one marker is at the same
     * position, the markers are aligned downwards from the first. The `params.y` value is not used.
     * - "bottom" — Position the marker at the bottom of the chart, right above the margin. If more than one marker is at the
     * same position, the markers are aligned upwards from the first. The `params.y` value is not used.
     * - "none" — Use CSS positioning; `params.y` is not used.
     * change, call to `loadChart()` or `initializeChart()`, and so forth.
     * allows them to be deleted simultaneously.
     * at the axis edge.
     * container, or holder, node. When placing the marker directly in the chart container, the z-index setting for the marker should
     * be set in relation to the z-index of other holders in order to place the marker above or below markers inside the holders.
     * @since
     * - 15-07-01
     * - 05-2016-10 Added the following `params.yPositioner` values: "value", "above_candle",
     * 		"below_candle", "on_candle", "top", and "bottom".
     * @version ChartIQ Advanced Package
     * @example
     * new CIQ.Marker({
     *     stx: stxx,
     * 	   xPositioner: "date",
     *     yPositioner: "value",
     * 	   x: someDate,
     * 	   y: somePrice,
     * 	   label: "events",
     * 	   node: newNode
     * });
     */
    class Marker {
      /**
       * A marker is a DOM object that is managed by the chart.
       *
       * Makers are placed in containers which are `div` elements whose placement and size correspond with a panel on the
       * chart. A container exists for each panel.
       *
       * A marker's primary purpose is to provide additional information for a data point on the chart. As such, markers
       * can be placed by date, tick, or bar to control their position on the x-axis, and by value (price) to control their
       * position on the y-axis. Additional default positioning is also available, including the ability to create custom
       * positioning logic. Once the positioning logic is established for markers, they are repositioned as needed when the
       * user scrolls or zooms the chart.
       *
       * Alternatively, a marker can also be placed at an absolute position using CSS positioning, in which case the chart
       * does not control the marker's positioning.
       *
       * The default placement function for any markers is CIQ.ChartEngine#defaultMarkerPlacement.
       *
       * See the {@tutorial Markers} tutorial for additional implementation details and information about managing
       * performance on deployments requiring a large number of markers.
       *
       * @param params Parameters that describe the marker.
       * @param params.stx The chart to which the marker is attached.
       * @param params.x A valid date, tick, or bar (depending on the selected `xPositioner`) used to select a candle to
       * 					which the marker is associated.
       * @param params.y A valid value for positioning the marker on the y-axis (depending on selected `yPositioner`).
       * 					If this value is not provided, the marker is set "above_candle" as long as a valid candle is selected
       * 					by `params.x`.
       * @param [params.node] The HTML element that contains the marker. This element should be detached from the
       * 					DOM. If an element is not provided, an empty `div` is created. You can create your own or use the provided CIQ.Marker.Simple and CIQ.Marker.Performance node creators.
       * @param params.panelName="chart" The name of the panel to which the `node` is attached. Defaults to the main
       * 					chart panel.
       * @param [params.xPositioner="date"] Determines the x-axis position of the marker.
       * Values include:
       * - "date" — `params.x` must be set to a JavaScript date object. This will be converted to the closest `masterData`
       * position if the provided date does not exactly match any existing points. Be sure the same timezone as masterData is used.
       * - "master" — `params.x` must be set to a `masterData` position.
       * - "bar" — `params.x` must be set to a `dataSegment` position.
       * - "none" — Use CSS positioning; `params.x` is not used.
       * @param [params.yPositioner="value"] Determines the y-axis position of the marker.
       * Values include:
       * - "value" — `params.y` must be set to an exact y-axis value. If `params.y` is omitted, the y-axis position defaults
       * to "above_candle".
       * - "above_candle" — Positions the marker right above the candle or line. If more than one marker is at the same position,
       * the markers are aligned upwards from the first. The `params.y` value is not used.
       * - "below_candle" — Positions the marker right below the candle or line. If more than one marker is at the same position,
       * the markers are aligned downwards from the first. The `params.y` value is not used.
       * - "under_candle" — Deprecated; same as "below_candle".
       * - "on_candle" — Position the marker in the center of the candle or line, covering it. If more than one marker is at the
       * same position, the markers are aligned downwards from the first. The `params.y` value is not used.
       * - "top" — Position the marker at the top of the chart, right below the margin. If more than one marker is at the same
       * position, the markers are aligned downwards from the first. The `params.y` value is not used.
       * - "bottom" — Position the marker at the bottom of the chart, right above the margin. If more than one marker is at the
       * same position, the markers are aligned upwards from the first. The `params.y` value is not used.
       * - "none" — Use CSS positioning; `params.y` is not used.
       * @param [params.permanent=false] The marker stays on the chart even when the chart is re-initialized by a symbol
       * change, call to `loadChart()` or `initializeChart()`, and so forth.
       * @param [params.label="generic"] A label for the marker. Multiple markers can be assigned the same label, which
       * allows them to be deleted simultaneously.
       * @param [params.includeAxis=false] If true, then the marker can display on the x- or y-axis. Otherwise, it is cropped
       * at the axis edge.
       * @param [params.chartContainer] If true, then the marker is placed directly in the chart container as opposed to in a
       * container, or holder, node. When placing the marker directly in the chart container, the z-index setting for the marker should
       * be set in relation to the z-index of other holders in order to place the marker above or below markers inside the holders.
       * @since
       * - 15-07-01
       * - 05-2016-10 Added the following `params.yPositioner` values: "value", "above_candle",
       * 		"below_candle", "on_candle", "top", and "bottom".
       * @version ChartIQ Advanced Package
       * @example
       * new CIQ.Marker({
       *     stx: stxx,
       * 	   xPositioner: "date",
       *     yPositioner: "value",
       * 	   x: someDate,
       * 	   y: somePrice,
       * 	   label: "events",
       * 	   node: newNode
       * });
       */
      constructor(
        params: {
          stx: CIQ.ChartEngine,
          x: any,
          y: Number,
          panelName: string,
          node?: HTMLElement,
          xPositioner?: string,
          yPositioner?: string,
          permanent?: boolean,
          label?: string,
          includeAxis?: boolean,
          chartContainer?: Boolean
        }
      )
      /**
       * Called when a marker node is clicked. Checks to see whether the node has its own click
       * function and, if it does, calls that function, passing all arguments to it.
       *
       * @param params Configuration parameters.
       * @param params.cx The clientX coordinate of the click event.
       * @param params.cy The clientY coordinate of the click event.
       * @param params.panel Panel where the click took place.
       *
       * @since
       * - 7.2.0
       * - 8.0.0 Signature changed to accept the `params` object.
       */
      public click(
        params: {
          cx: number,
          cy: number,
          panel: CIQ.ChartEngine.Panel
        }
      ): void
      /**
       * Called when a marker node is double-clicked.
       *
       * Override this function with your own implementation. Return a truthy value to prevent
       * CIQ.ChartEngine#doubleClick from dispatching the "doubleClick" event and invoking
       * the [doubleClickEventListener]CIQ.ChartEngine~doubleClickEventListener.
       *
       * @param params Configuration parameters.
       * @param params.cx The clientX coordinate of the double-click event.
       * @param params.cy The clientY coordinate of the double-click event.
       * @param params.panel Panel where the double-click took place.
       * @return true to indicate the double-click event has been handled; otherwise,
       * 		false.
       *
       * @virtual
       * @since 8.0.0
       */
      public doubleClick(
        params: {
          cx: number,
          cy: number,
          panel: CIQ.ChartEngine.Panel
        }
      ): boolean
      /**
       * Removes the marker from the chart object
       * @since 15-07-01
       */
      public remove(): void
    }
    /**
     * The market class is what the chart uses to to manage market hours for the different exchanges.
     * It uses `Market Definitions` to decide when the market is open or closed.
     * Although you can construct many market classes with different definitions to be used in your functions, only one market definition can be attached to the chart at any given time.
     * Once a market is defined, an [iterator]CIQ.Market#newIterator can be created to traverse through time, taking into account the market hours.
     * Additionally, a variety of convenience functions can be used to check the market status, such as CIQ.Market#isOpen or CIQ.Market#isMarketDay.
     *
     * A chart will operate 24x7, unless a market definition with rules is assigned to it.
     * See CIQ.ChartEngine#setMarket and CIQ.ChartEngine#setMarketFactory for instructions on how to assign a market definition to a chart.
     *
     * The chart also provides convenience functions that allows you to traverse through time at the current chart periodicity without having to explicitly create a new iterator.
     * See CIQ.ChartEngine#getNextInterval and CIQ.ChartEngine#standardMarketIterator for details.
     *
     * **Important:**
     * - If the CIQ.ExtendedHours visualization and filtering add-on is enabled, **only data within the defined market hours will be displayed on the chart** even if more data is loaded.
     * - Once a market definition is assigned to a chart, it will be used to roll up any data requested by the [periodicity]CIQ.ChartEngine#createDataSet, which will result in any data outside the market hours to be combined with the prior candle.
     * This may at times look like data is being **filtered**, but it is just being **aggregated**. To truly filter data, you must use the above add-on.
     *
     * `Market Definitions` are JavaScript objects which must contain the following elements:
     * - `name` : A string. Name of the market for which the rules are for.
     * - `rules` : An array. The rules indicating the times the market is open or closed. `close` time **must always** be later than `open` time. Use the proper market timezone (`market_tz`) to prevent hours from spanning across days.
     * - `market_tz` : A string. Time zone in which the market operates. See CIQ.timeZoneMap to review a list of all chartIQ supported timezones and instructions on how to add more.
     * - `hour_aligned`: A boolean. If set to `true`, market opening and closing times will be forced to the exact start of the hour of time, ignoring any minutes, seconds or millisecond offsets.
     *   > You should set this to `false` if your market opening and closing times are not aligned to the beginning to each hour.
     *   > Otherwise, forcing them to do so causes the iterator to generate `previous` and `next` times that could prevent it from properly moving trough the market hours.
     * - `convertOnDaily` : A boolean. By default, daily charts are not converted for timezone. Set this to true to convert for daily charts.
     * - `beginningDayOfWeek` : Weekday number (0-6) to optionally override CIQ.Market prototype setting of same name.
     * - `normal_daily_open`: A string defining a time in `HH:mm` format. Set this to specify the normal open time for a market.
     * - `normal_daily_close`: A string defining a time in `HH:mm` format. Set this to specify the normal close time for a market.
     *
     * Example:
     * ```
     * {
     * 		name: "SAMPLE-MARKET",
     * 		market_tz: "America/Chicago",
     * 		hour_aligned: true,
     * 		beginningDayOfWeek: 0,
     *		normal_daily_open: "09:00",
     *		normal_daily_close: "17:00",
     * 		rules: [
     * 				{"dayofweek": 1, "open": "09:00", "close": "17:00"}
     * 		]
     * };
     * ```
     *
     * Instructions for creating `Market Definitions`:
     *
     * - An empty market definition ( {} ) assumes the market is always open.
     * - Once a definition has rules in it, the market will be assumed open only for those defined rules. The absence of a rule indicates the market is closed for that timeframe.
     * - Market's time rules are specified in the market's local timezone.
     * - Seconds are not considered for open or close times, but are okay for intra day data.
     * - Rules are processed top to bottom.
     * - Rules can be defined for both primary and secondary market sessions.
     * - Rules for the market's primary session do not have a `name` parameter and are enabled by default.
     * - Rules for the market's primary session are mandatory.
     * - Rules for secondary market sessions, such as pre-market or post-market trading hours sessions,  require a `name` parameter.
     * - All secondary market session are disabled by default.
     *
     * 		This is a rule for a 'pre' market session:
     * 			`{"dayofweek": 1, "open": "08:00", "close": "09:30", name: "pre"}`
     *
     * - To enable or disable secondary market session rules by session name, use CIQ.Market#enableSession and CIQ.Market#disableSession.
     *  - **Important:** Enabling/Disabling market sessions will not automatically filter-out data from the chart, but simply adjust the market iterators so the x-axis can be displayed accordingly in the absence of data for the excluded sessions.
     *  - Data filtering can be done:
     *    - Manually by requesting pertinent data from your feed and calling CIQ.ChartEngine#loadChart
     *    - Automatically by using the CIQ.ExtendedHours visualization and filtering add-on.
     * - First, the `dayofweek` wild card rules are processed. As soon as a rule is matched, processing breaks.
     *
     * 		This rule says the market is open every Monday from 9:30 to 16:00:
     * 			`{"dayofweek": 1, "open": "09:30", "close": "16:00"}`
     *
     * - After the `dayofweek` rules are processed all of the extra rules are processed.
     * - Multiple `open` and `close` times can be set for the same day of week. To indicate the market is closed during lunch, for example:
     * 	 ```
     * 	 {"dayofweek": 1, "open": "09:00", "close": "12:00"}, // mon
     *	 {"dayofweek": 1, "open": "13:00", "close": "17:00"}  // mon
     *	 ```
     *   - `close` time **must always** be later than `open` time.
     *   - Use the proper market timezone (`market_tz`) to prevent hours from spanning across days.
     *
     * - Wildcard rules should be placed first and more specific rules should be placed later.
     *
     * 		This rule is a wildcard rule for Christmas. If Christmas is on Monday, the
     * 		first set of rules will evaluate to true because the dayofweek rule for day
     * 		one will match. Then this rule will match if the date is the 25th of
     * 		December in any year.  Because open is 00:00 and close is 00:00, it will evaluate to false:
     * 			`{"date": "*-12-25", "open": "00:00", "close": "00:00"}`
     *
     * - After wildcard exceptions, any specific day and time can be matched.
     *
     * 		This rule says closed on this day only. Note that open and closed attributes
     * 		can be omitted to save typing if the market is closed the entire day:
     * 			`{"date": "2016-01-18"} //Martin Luther King day.`
     *
     * 		This rules says closed on 12-26:
     * 			`{"date": "2016-12-26"}, //Observed Christmas in 2016`
     *
     * 		This rule says partial session
     * 			`{"date": "2015-12-24", "open": "9:30", "close": "13:00"} //Christmas eve`
     *
     * See example section for a compete NYSE definition.
     *
     * Once defined, it can be used to create a new market instance.
     *
     * Example:
     * ```
     * var thisMarket = new CIQ.Market(marketDefinition);
     * ```
     *
     * If no definition is provided, the market will operate 24x7.
     *
     * Example:
     * ```
     * new CIQ.Market();
     * ```
     *
     *
     * @since
     * 04-2016-08
     * 06-2016-02 - You can now specify times for different market sessions ('pre',post', etc) to be used with the sessions visualization tools. See CIQ.ExtendedHours.
     *
     * @example
     * CIQ.Market.NYSE = {
     "name": "NYSE",
     "market_tz": "America/New_York",
     "hour_aligned": false,
     "rules": [
     //First open up the regular trading times
     //Note that sat and sun (in this example) are always closed because
     //everything is closed by default and we didn't explicitly open them.
     {"dayofweek": 1, "open": "09:30", "close": "16:00"}, //mon
     {"dayofweek": 2, "open": "09:30", "close": "16:00"},
     {"dayofweek": 3, "open": "09:30", "close": "16:00"},
     {"dayofweek": 4, "open": "09:30", "close": "16:00"},
     {"dayofweek": 5, "open": "09:30", "close": "16:00"}, //fri
     //After Hours premarket
     {"dayofweek": 1, "open": "08:00", "close": "09:30", name: "pre"}, //mon
     {"dayofweek": 2, "open": "08:00", "close": "09:30", name: "pre"},
     {"dayofweek": 3, "open": "08:00", "close": "09:30", name: "pre"},
     {"dayofweek": 4, "open": "08:00", "close": "09:30", name: "pre"},
     {"dayofweek": 5, "open": "08:00", "close": "09:30", name: "pre"}, //fri
     //After Hours post
     {"dayofweek": 1, "open": "16:00", "close": "20:00", name: "post"}, //mon
     {"dayofweek": 2, "open": "16:00", "close": "20:00", name: "post"},
     {"dayofweek": 3, "open": "16:00", "close": "20:00", name: "post"},
     {"dayofweek": 4, "open": "16:00", "close": "20:00", name: "post"},
     {"dayofweek": 5, "open": "16:00", "close": "20:00", name: "post"}, //fri
     //Now Monday thru Friday is open. Close any exceptions
     //always closed on Christmas
     {"date": "*-12-25", "open": "00:00", "close": "00:00"},
     //always closed on 4th of July
     {"date": "*-07-04", "open": "00:00", "close": "00:00"},
     //always close on new years day
     {"date": "*-01-01", "open": "00:00", "close": "00:00"},
     //Some holidays are observed on different days each year or if
     //the day falls on a weekend. Each of those rules must be specified.
     {"date": "2012-01-02", "open": "00:00", "close": "00:00"},
     //As a special case if no open and close attributes are set they
     //will be assumed "00:00" and "00:00" respectively
     {"date": "2017-01-02"},
     {"date": "2016-01-18"},
     {"date": "2016-02-15"},
     {"date": "2016-03-25"},
     {"date": "2016-05-30"},
     {"date": "2016-09-05"},
     {"date": "2016-11-24"},
     {"date": "2016-11-25", "open": "8:00", "close": "9:30", name: "pre"},
     {"date": "2016-11-25", "open": "9:30", "close": "13:00"},
     {"date": "2016-12-26"},
     {"date": "2015-01-19"},
     {"date": "2015-02-16"},
     {"date": "2015-04-03"},
     {"date": "2015-05-25"},
     {"date": "2015-07-03"},
     {"date": "2015-09-07"},
     {"date": "2015-11-26"},
     {"date": "2015-11-27", "open": "8:00", "close": "9:30", name: "pre"},
     {"date": "2015-11-27", "open": "9:30", "close": "13:00"},
     {"date": "2015-12-24", "open": "8:00", "close": "9:30", name: "pre"},
     {"date": "2015-12-24", "open": "9:30", "close": "13:00"},
     {"date": "2014-01-20"},
     {"date": "2014-02-17"},
     {"date": "2014-04-18"},
     {"date": "2014-05-26"},
     {"date": "2014-09-01"},
     {"date": "2014-11-27"},
     {"date": "2014-07-03", "open": "8:00", "close": "9:30", name: "pre"},
     {"date": "2014-07-03", "open": "9:30", "close": "13:00"},
     {"date": "2014-11-28", "open": "8:00", "close": "9:30", name: "pre"},
     {"date": "2014-11-28", "open": "9:30", "close": "13:00"},
     {"date": "2014-12-24", "open": "8:00", "close": "9:30", name: "pre"},
     {"date": "2014-12-24", "open": "9:30", "close": "13:00"},
     {"date": "2013-01-21"},
     {"date": "2013-02-18"},
     {"date": "2013-03-29"},
     {"date": "2013-05-27"},
     {"date": "2013-09-02"},
     {"date": "2013-11-28"},
     {"date": "2013-07-03", "open": "8:00", "close": "9:30", name: "pre"},
     {"date": "2013-07-03", "open": "9:30", "close": "13:00"},
     {"date": "2013-11-29", "open": "8:00", "close": "9:30", name: "pre"},
     {"date": "2013-11-29", "open": "9:30", "close": "13:00"},
     {"date": "2013-12-24", "open": "8:00", "close": "9:30", name: "pre"},
     {"date": "2013-12-24", "open": "9:30", "close": "13:00"},
     {"date": "2012-01-16"},
     {"date": "2012-02-20"},
     {"date": "2012-04-06"},
     {"date": "2012-05-28"},
     {"date": "2012-09-03"},
     {"date": "2012-10-29"},
     {"date": "2012-10-30"},
     {"date": "2012-11-22"},
     {"date": "2012-07-03", "open": "8:00", "close": "9:30", name: "pre"},
     {"date": "2012-07-03", "open": "9:30", "close": "13:00"},
     {"date": "2012-11-23", "open": "8:00", "close": "9:30", name: "pre"},
     {"date": "2012-11-23", "open": "9:30", "close": "13:00"},
     {"date": "2012-12-24", "open": "8:00", "close": "9:30", name: "pre"},
     {"date": "2012-12-24", "open": "9:30", "close": "13:00"}
     ]
     };
     */
    class Market {
      /**
       * The market class is what the chart uses to to manage market hours for the different exchanges.
       * It uses `Market Definitions` to decide when the market is open or closed.
       * Although you can construct many market classes with different definitions to be used in your functions, only one market definition can be attached to the chart at any given time.
       * Once a market is defined, an [iterator]CIQ.Market#newIterator can be created to traverse through time, taking into account the market hours.
       * Additionally, a variety of convenience functions can be used to check the market status, such as CIQ.Market#isOpen or CIQ.Market#isMarketDay.
       *
       * A chart will operate 24x7, unless a market definition with rules is assigned to it.
       * See CIQ.ChartEngine#setMarket and CIQ.ChartEngine#setMarketFactory for instructions on how to assign a market definition to a chart.
       *
       * The chart also provides convenience functions that allows you to traverse through time at the current chart periodicity without having to explicitly create a new iterator.
       * See CIQ.ChartEngine#getNextInterval and CIQ.ChartEngine#standardMarketIterator for details.
       *
       * **Important:**
       * - If the CIQ.ExtendedHours visualization and filtering add-on is enabled, **only data within the defined market hours will be displayed on the chart** even if more data is loaded.
       * - Once a market definition is assigned to a chart, it will be used to roll up any data requested by the [periodicity]CIQ.ChartEngine#createDataSet, which will result in any data outside the market hours to be combined with the prior candle.
       * This may at times look like data is being **filtered**, but it is just being **aggregated**. To truly filter data, you must use the above add-on.
       *
       * `Market Definitions` are JavaScript objects which must contain the following elements:
       * - `name` : A string. Name of the market for which the rules are for.
       * - `rules` : An array. The rules indicating the times the market is open or closed. `close` time **must always** be later than `open` time. Use the proper market timezone (`market_tz`) to prevent hours from spanning across days.
       * - `market_tz` : A string. Time zone in which the market operates. See CIQ.timeZoneMap to review a list of all chartIQ supported timezones and instructions on how to add more.
       * - `hour_aligned`: A boolean. If set to `true`, market opening and closing times will be forced to the exact start of the hour of time, ignoring any minutes, seconds or millisecond offsets.
       *   > You should set this to `false` if your market opening and closing times are not aligned to the beginning to each hour.
       *   > Otherwise, forcing them to do so causes the iterator to generate `previous` and `next` times that could prevent it from properly moving trough the market hours.
       * - `convertOnDaily` : A boolean. By default, daily charts are not converted for timezone. Set this to true to convert for daily charts.
       * - `beginningDayOfWeek` : Weekday number (0-6) to optionally override CIQ.Market prototype setting of same name.
       * - `normal_daily_open`: A string defining a time in `HH:mm` format. Set this to specify the normal open time for a market.
       * - `normal_daily_close`: A string defining a time in `HH:mm` format. Set this to specify the normal close time for a market.
       *
       * Example:
       * ```
       * {
       * 		name: "SAMPLE-MARKET",
       * 		market_tz: "America/Chicago",
       * 		hour_aligned: true,
       * 		beginningDayOfWeek: 0,
       *		normal_daily_open: "09:00",
       *		normal_daily_close: "17:00",
       * 		rules: [
       * 				{"dayofweek": 1, "open": "09:00", "close": "17:00"}
       * 		]
       * };
       * ```
       *
       * Instructions for creating `Market Definitions`:
       *
       * - An empty market definition ( {} ) assumes the market is always open.
       * - Once a definition has rules in it, the market will be assumed open only for those defined rules. The absence of a rule indicates the market is closed for that timeframe.
       * - Market's time rules are specified in the market's local timezone.
       * - Seconds are not considered for open or close times, but are okay for intra day data.
       * - Rules are processed top to bottom.
       * - Rules can be defined for both primary and secondary market sessions.
       * - Rules for the market's primary session do not have a `name` parameter and are enabled by default.
       * - Rules for the market's primary session are mandatory.
       * - Rules for secondary market sessions, such as pre-market or post-market trading hours sessions,  require a `name` parameter.
       * - All secondary market session are disabled by default.
       *
       * 		This is a rule for a 'pre' market session:
       * 			`{"dayofweek": 1, "open": "08:00", "close": "09:30", name: "pre"}`
       *
       * - To enable or disable secondary market session rules by session name, use CIQ.Market#enableSession and CIQ.Market#disableSession.
       *  - **Important:** Enabling/Disabling market sessions will not automatically filter-out data from the chart, but simply adjust the market iterators so the x-axis can be displayed accordingly in the absence of data for the excluded sessions.
       *  - Data filtering can be done:
       *    - Manually by requesting pertinent data from your feed and calling CIQ.ChartEngine#loadChart
       *    - Automatically by using the CIQ.ExtendedHours visualization and filtering add-on.
       * - First, the `dayofweek` wild card rules are processed. As soon as a rule is matched, processing breaks.
       *
       * 		This rule says the market is open every Monday from 9:30 to 16:00:
       * 			`{"dayofweek": 1, "open": "09:30", "close": "16:00"}`
       *
       * - After the `dayofweek` rules are processed all of the extra rules are processed.
       * - Multiple `open` and `close` times can be set for the same day of week. To indicate the market is closed during lunch, for example:
       * 	 ```
       * 	 {"dayofweek": 1, "open": "09:00", "close": "12:00"}, // mon
       *	 {"dayofweek": 1, "open": "13:00", "close": "17:00"}  // mon
       *	 ```
       *   - `close` time **must always** be later than `open` time.
       *   - Use the proper market timezone (`market_tz`) to prevent hours from spanning across days.
       *
       * - Wildcard rules should be placed first and more specific rules should be placed later.
       *
       * 		This rule is a wildcard rule for Christmas. If Christmas is on Monday, the
       * 		first set of rules will evaluate to true because the dayofweek rule for day
       * 		one will match. Then this rule will match if the date is the 25th of
       * 		December in any year.  Because open is 00:00 and close is 00:00, it will evaluate to false:
       * 			`{"date": "*-12-25", "open": "00:00", "close": "00:00"}`
       *
       * - After wildcard exceptions, any specific day and time can be matched.
       *
       * 		This rule says closed on this day only. Note that open and closed attributes
       * 		can be omitted to save typing if the market is closed the entire day:
       * 			`{"date": "2016-01-18"} //Martin Luther King day.`
       *
       * 		This rules says closed on 12-26:
       * 			`{"date": "2016-12-26"}, //Observed Christmas in 2016`
       *
       * 		This rule says partial session
       * 			`{"date": "2015-12-24", "open": "9:30", "close": "13:00"} //Christmas eve`
       *
       * See example section for a compete NYSE definition.
       *
       * Once defined, it can be used to create a new market instance.
       *
       * Example:
       * ```
       * var thisMarket = new CIQ.Market(marketDefinition);
       * ```
       *
       * If no definition is provided, the market will operate 24x7.
       *
       * Example:
       * ```
       * new CIQ.Market();
       * ```
       *
       * @param [market_definition] A json object that contains the rules for some market. If not defined default market is always open.
       *
       * @since
       * 04-2016-08
       * 06-2016-02 - You can now specify times for different market sessions ('pre',post', etc) to be used with the sessions visualization tools. See CIQ.ExtendedHours.
       *
       * @example
       * CIQ.Market.NYSE = {
       "name": "NYSE",
       "market_tz": "America/New_York",
       "hour_aligned": false,
       "rules": [
       //First open up the regular trading times
       //Note that sat and sun (in this example) are always closed because
       //everything is closed by default and we didn't explicitly open them.
       {"dayofweek": 1, "open": "09:30", "close": "16:00"}, //mon
       {"dayofweek": 2, "open": "09:30", "close": "16:00"},
       {"dayofweek": 3, "open": "09:30", "close": "16:00"},
       {"dayofweek": 4, "open": "09:30", "close": "16:00"},
       {"dayofweek": 5, "open": "09:30", "close": "16:00"}, //fri
       //After Hours premarket
       {"dayofweek": 1, "open": "08:00", "close": "09:30", name: "pre"}, //mon
       {"dayofweek": 2, "open": "08:00", "close": "09:30", name: "pre"},
       {"dayofweek": 3, "open": "08:00", "close": "09:30", name: "pre"},
       {"dayofweek": 4, "open": "08:00", "close": "09:30", name: "pre"},
       {"dayofweek": 5, "open": "08:00", "close": "09:30", name: "pre"}, //fri
       //After Hours post
       {"dayofweek": 1, "open": "16:00", "close": "20:00", name: "post"}, //mon
       {"dayofweek": 2, "open": "16:00", "close": "20:00", name: "post"},
       {"dayofweek": 3, "open": "16:00", "close": "20:00", name: "post"},
       {"dayofweek": 4, "open": "16:00", "close": "20:00", name: "post"},
       {"dayofweek": 5, "open": "16:00", "close": "20:00", name: "post"}, //fri
       //Now Monday thru Friday is open. Close any exceptions
       //always closed on Christmas
       {"date": "*-12-25", "open": "00:00", "close": "00:00"},
       //always closed on 4th of July
       {"date": "*-07-04", "open": "00:00", "close": "00:00"},
       //always close on new years day
       {"date": "*-01-01", "open": "00:00", "close": "00:00"},
       //Some holidays are observed on different days each year or if
       //the day falls on a weekend. Each of those rules must be specified.
       {"date": "2012-01-02", "open": "00:00", "close": "00:00"},
       //As a special case if no open and close attributes are set they
       //will be assumed "00:00" and "00:00" respectively
       {"date": "2017-01-02"},
       {"date": "2016-01-18"},
       {"date": "2016-02-15"},
       {"date": "2016-03-25"},
       {"date": "2016-05-30"},
       {"date": "2016-09-05"},
       {"date": "2016-11-24"},
       {"date": "2016-11-25", "open": "8:00", "close": "9:30", name: "pre"},
       {"date": "2016-11-25", "open": "9:30", "close": "13:00"},
       {"date": "2016-12-26"},
       {"date": "2015-01-19"},
       {"date": "2015-02-16"},
       {"date": "2015-04-03"},
       {"date": "2015-05-25"},
       {"date": "2015-07-03"},
       {"date": "2015-09-07"},
       {"date": "2015-11-26"},
       {"date": "2015-11-27", "open": "8:00", "close": "9:30", name: "pre"},
       {"date": "2015-11-27", "open": "9:30", "close": "13:00"},
       {"date": "2015-12-24", "open": "8:00", "close": "9:30", name: "pre"},
       {"date": "2015-12-24", "open": "9:30", "close": "13:00"},
       {"date": "2014-01-20"},
       {"date": "2014-02-17"},
       {"date": "2014-04-18"},
       {"date": "2014-05-26"},
       {"date": "2014-09-01"},
       {"date": "2014-11-27"},
       {"date": "2014-07-03", "open": "8:00", "close": "9:30", name: "pre"},
       {"date": "2014-07-03", "open": "9:30", "close": "13:00"},
       {"date": "2014-11-28", "open": "8:00", "close": "9:30", name: "pre"},
       {"date": "2014-11-28", "open": "9:30", "close": "13:00"},
       {"date": "2014-12-24", "open": "8:00", "close": "9:30", name: "pre"},
       {"date": "2014-12-24", "open": "9:30", "close": "13:00"},
       {"date": "2013-01-21"},
       {"date": "2013-02-18"},
       {"date": "2013-03-29"},
       {"date": "2013-05-27"},
       {"date": "2013-09-02"},
       {"date": "2013-11-28"},
       {"date": "2013-07-03", "open": "8:00", "close": "9:30", name: "pre"},
       {"date": "2013-07-03", "open": "9:30", "close": "13:00"},
       {"date": "2013-11-29", "open": "8:00", "close": "9:30", name: "pre"},
       {"date": "2013-11-29", "open": "9:30", "close": "13:00"},
       {"date": "2013-12-24", "open": "8:00", "close": "9:30", name: "pre"},
       {"date": "2013-12-24", "open": "9:30", "close": "13:00"},
       {"date": "2012-01-16"},
       {"date": "2012-02-20"},
       {"date": "2012-04-06"},
       {"date": "2012-05-28"},
       {"date": "2012-09-03"},
       {"date": "2012-10-29"},
       {"date": "2012-10-30"},
       {"date": "2012-11-22"},
       {"date": "2012-07-03", "open": "8:00", "close": "9:30", name: "pre"},
       {"date": "2012-07-03", "open": "9:30", "close": "13:00"},
       {"date": "2012-11-23", "open": "8:00", "close": "9:30", name: "pre"},
       {"date": "2012-11-23", "open": "9:30", "close": "13:00"},
       {"date": "2012-12-24", "open": "8:00", "close": "9:30", name: "pre"},
       {"date": "2012-12-24", "open": "9:30", "close": "13:00"}
       ]
       };
       */
      constructor(market_definition?: object)
      /**
       * An array of objects containing information about the current market's extended sessions.
       * Each element has a name prop (for the name of the session) and an enabled prop.
       * See CIQ.ExtendedHours for more information on extended sessions.
       * @example
       * marketSessions=stxx.chart.market.sessions
       */
      public sessions: any[]
      /**
       * The day on which to begin a week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday.
       *
       * This is a global setting, but can be overridden with a market-specific setting in the market
       * definition.
       *
       * @since 8.2.0
       *
       * @example
       * stxx.chart.market.beginningDayOfWeek = 5;  // Start week on Friday.
       */
      public beginningDayOfWeek: number
      /**
       * Returns an array of objects containing a list of sessions and whether or not they are enabled
       *
       * @return String array of market session names, and corresponding status (e.g. [{ name: 'pre', enabled: false } { name: 'post', enabled: true }])
       * @since 6.0.0
       */
      public getSessionNames(): any[]
      /**
       * Toggle on/off a market session by name.
       *
       * - **Important:** Enabling/Disabling market sessions will not automatically filter-out data from the chart, but simply adjust the market iterators so the x-axis can be displayed accordingly in the absence of data for the excluded sessions.
       * - Data filtering can be done:
       *   - Manually by requesting pertinent data from your feed and calling CIQ.ChartEngine#loadChart
       *   - Automatically by using the CIQ.ExtendedHours visualization and filtering add-on.
       *
       * @param session_name A session name matching a valid name present in the market definition.
       * @param [inverted] Any true value (`true`, non-zero value or string) passed here will enable the session, otherwise the session will be disabled.
       * @since  06-2016-02
       */
      public disableSession(session_name: string, inverted?: object): void
      /**
       * Enable a market session by name. See CIQ.Market#disableSession for full usage details.
       * @param session_name A session name
       * @since  06-2016-02
       */
      public enableSession(session_name: string): void
      /**
       * Parses the market definition for a list of market names, and enables each one-by-one, see CIQ.Market#enableSession and CIQ.Market#disableSession.
       *  - **Important:** Enabling/Disabling market sessions will not automatically filter-out data from the chart, but simply adjust the market iterators so the x-axis can be displayed accordingly in the absence of data for the excluded sessions.
       * @since 6.0.0
       */
      public enableAllAvailableSessions(): void
      /**
       * Get the close date/time for the trading day or specific session.
       * @param [date=now] date The date on which to check.
       * @param [session_name] Specific market session. If `session_name` is not passed in, the first close time of the day will be returned,
       * depending on the sessions that are enabled.  If a session name is passed in, then not only does the market session
       * need to be open on the day of `date`, but also within the time of the specified session.  Otherwise, null will be returned.
       * Pass in "" to specify only the default session when other session are also active.
       * @param [inZone] Optional datazone to translate from - If no market zone is present it will assume browser time.
       * @param [outZone] Optional datazone to translate to - If no market zone is present it will assume browser time.
       * @return Close date/time for the trading session or null if the market is
       * closed for the given date.
       * @since  05-2016-10
       */
      public getClose(
        date?: Date,
        session_name?: string,
        inZone?: string,
        outZone?: string
      ): Date
      /**
       * Get the close time for the current market session, or if the market is closed, the close time for the next market session.
       * @param [date=now] date The date on which to check.
       * @param [inZone] Optional datazone to translate from - If no market zone is present it will assume browser time.
       * @param [outZone] Optional datazone to translate to - If no market zone is present it will assume browser time.
       * @return A date set to the close time of the next open market session.
       * @since  05-2016-10
       */
      public getNextClose(date?: Date, inZone?: string, outZone?: string): Date
      /**
       * Get the next market session open time. If the requested date is the opening time for the session, then
       * it will iterate to opening time for the next market session.
       * @param [date=now] date An The date on which to check.
       * @param [inZone] Optional datazone to translate from - If no market zone is present it will assume browser time.
       * @param [outZone] Optional datazone to translate to - If no market zone is present it will assume browser time.
       * @return A date aligned to the open time of the next open session. If no rules are defined, it will return null.
       * @since  05-2016-10
       */
      public getNextOpen(date?: Date, inZone?: string, outZone?: string): Date
      /**
       * Get the open date/time for a market day or specific session.
       * @param [date=now] date The date on which to check.
       * @param [session_name] Specific market session. If `session_name` is not passed in, the first open time of the day will be returned,
       * depending on the sessions that are enabled.  If a session name is passed in, then not only does the market session
       * need to be open on the day of `date`, but also within the time of the specified session.  Otherwise, null will be returned.  Pass in "" to
       * specify only the default session when other session are also active.
       * @param [inZone] Optional datazone to translate from - If no market zone is present it will assume browser time.
       * @param [outZone] Optional datazone to translate to - If no market zone is present it will assume browser time.
       * @return A date time for the open of a session or null if the market is
       * closed for the given date or there are no market rules to check.
       * @since  05-2016-10
       */
      public getOpen(
        date?: Date,
        session_name?: string,
        inZone?: string,
        outZone?: string
      ): Date
      /**
       * Gets the normal open time for the current market; that is, the time the market typically opens.
       * In cases where there are two trading sessions, the first is used.
       *
       * @return The normal open in HH:mm format.
       * @since 8.1.0
       */
      public getNormalOpen(): string
      /**
       * Gets the normal close time for the current market; that is, the time the market typically
       * closes. In cases where there are two trading sessions, the second is used.
       *
       * @return The normal close in HH:mm format.
       * @since 8.1.0
       */
      public getNormalClose(): string
      /**
       * Get the previous session close time.
       * If the date lands exactly on the close time for a session then it will still seek to the previous market session's close.
       * @param [date=now] date The date on which to check.
       * @param [inZone] Optional datazone to translate from - If no market zone is present it will assume browser time.
       * @param [outZone] Optional datazone to translate to - If no market zone is present it will assume browser time.
       * @return A date aligned to the previous close date/time of a session. If no rules are defined, it will return null.
       * @since  05-2016-10
       */
      public getPreviousClose(date?: Date, inZone?: string, outZone?: string): Date
      /**
       * Get the previous session open time. If the date lands exactly on the open time for a session then
       * it will still seek to the previous market session's open.
       * @param [date=now] date An The date on which to check.
       * @param [inZone] Optional datazone to translate from - If no market zone is present it will assume browser time.
       * @param [outZone] Optional datazone to translate to - If no market zone is present it will assume browser time.
       * @return A date aligned to previous open date/time of a session. If no rules are defined, it will return null.
       * @since  05-2016-10
       */
      public getPreviousOpen(date?: Date, inZone?: string, outZone?: string): Date
      /**
       * @return Current time in the market zone
       * @since 04-2016-08
       */
      public marketZoneNow(): Date
      /**
       * @return `true` if this market is hour aligned.
       * @since 04-2016-08
       */
      public isHourAligned(): boolean
      /**
       * Checks if the market is currently open.
       * @return An object with the open market session's details, if the market is open right now. Or `null` if no sessions are currently open.
       * @since 04-2016-08
       */
      public isOpen(): object
      /**
       * Checks if today it is a market day.
       * @return An object with the open market session's details, if it is a market day. Or `null` if it is not a market day.
       * @since 04-2016-08
       */
      public isMarketDay(): object
      /**
       * Checks if a supplied date is a market day.  Only the date is examined; hours, minutes, seconds are ignored
       * @param date A date
       * @return An object with the open market session's details, if it is a market day. Or `null` if it is not a market day.
       * @since 04-2016-08
       */
      public isMarketDate(date: Date): object
      /**
       * Creates iterators for the associated Market to traverse through time taking into account market hours.
       * An iterator instance can go forward or backward in time any arbitrary amount.
       * However, the internal state cannot be changed once it is constructed. A new iterator should be
       * constructed whenever one of the parameters changes. For example, if the
       * `interval` changes a new iterator will need to be built. If the `displayZone`
       * or `dataZone` changes on the market, new iterators will also need to be
       * constructed.
       *
       * See CIQ.Market.Iterator for all available methods.
       *
       * See the following convenience functions: CIQ.ChartEngine#getNextInterval and  CIQ.ChartEngine#standardMarketIterator
       *
       * @param parms Parameters used to initialize the Market object.
       * @param [parms.interval] A valid interval as required by CIQ.ChartEngine#setPeriodicity. Default is 1 (minute).
       * @param [parms.periodicity] A valid periodicity as required by CIQ.ChartEngine#setPeriodicity. Default is 1.
       * @param [parms.timeUnit] A valid timeUnit as required by CIQ.ChartEngine#setPeriodicity. Default is "minute"
       * @param [parms.begin] The date to set as the start date for this iterator instance. Default is `now`. Will be assumed to be `inZone` if one set.
       * @param [parms.inZone] A valid timezone from the timeZoneData.js library. This should represent the time zone for any input dates such as `parms.begin` in this function or `parms.end` in CIQ.Market.Iterator#futureTick. Defaults to browser timezone if none set.  - If no market zone is present it will assume browser time.
       * @param [parms.outZone] A valid timezone from the timeZoneData.js library. This should represent the time zone for the returned dates. Defaults to browser timezone if none set.  - If no market zone is present it will assume browser time.
       * @return A new iterator.
       * @since 04-2016-08
       * @example
       var iter = stxx.chart.market.newIterator(
       {
       'begin': now,
       'interval': stxx.layout.interval,
       'periodicity': stxx.layout.periodicity,
       'timeUnit': stxx.layout.timeUnit,
       'inZone': stxx.dataZone,
       'outZone': stxx.displayZone
       }
       );
       */
      public newIterator(
        parms: {
          interval?: string,
          periodicity?: number,
          timeUnit?: string,
          begin?: Date,
          inZone?: string,
          outZone?: string
        }
      ): object
      /**
       * Return the session name for a date. If the name is defined and if the date
       * lands in a session that is open. Otherwise return null.
       * @param date A date object
       * @param [inZone] Timezone of incoming date - If no market zone is present it will assume browser time.
       * @return String or null
       */
      public getSession(date: Date, inZone?: string): object
      /**
       * Convenience function for unit testing.
       * @param testDate A date
       * @return True if the market was closed on the given date
       */
      public _wasClosed(testDate: Date): boolean
      /**
       * Convenience function for unit testing.
       * @param testDate A date
       * @return True if the market was open on the given date
       */
      public _wasOpen(testDate: Date): boolean
      /**
       * Get the difference in milliseconds between two time zones. May be positive or
       * negative depending on the time zones. The purpose is to shift the source
       * time zone some number of milliseconds to the target timezone. For example shifting
       * a data feed from UTC to Eastern time. Or shifting Eastern time to Mountain
       * time for display purposes. Note that it is important to pass the source
       * and the target in the correct order. The algorithm does source - target. This
       * will calculate the correct offset positive or negative.
       * @param date A date object. Could be any date object the javascript one
       * or for example the timezone.js one. Must implement getTime() and
       * getTimezoneOffset()
       * @param src_tz_str The source time zone. For example the data feed
       * @param target_tz_str The target time zone for example the market.
       * @return The number of milliseconds difference between the time
       * zones.
       */
      public _tzDifferenceMillis(date: Date, src_tz_str: string, target_tz_str: string): number
      /**
       * Converts from the given timezone into the market's native time zone
       * If no market zone is present, the date will be returned unchanged.
       * @param  dt JavaScript Date
       * @param  [tz] timezoneJS timezone, or null to indicate browser localtime/UTC (dataZone)
       * @return    A JavaScript Date offset by the timezone change
       */
      public _convertToMarketTZ(dt: Date, tz?: string): Date
      /**
       * Converts to the given timezone from the market's native time zone.
       * If no market zone is present, the date will be returned un changed.
       * @param  dt JavaScript Date
       * @param  [tz] timezoneJS timezone, or null to indicate browser localtime/UTC (displayZone)
       * @return    A JavaScript Date offset by the timezone change
       */
      public _convertFromMarketTZ(dt: Date, tz?: string): Date
    }
    /**
     * Base class for interacting with a name/value store.
     *
     * This base class saves to local storage, but you can create your own function overrides for
     * remote storage as long as you maintain the same function signatures and callback requirements.
     *
     * See WebComponents.cq-views for an implementation example.
     *
     */
    class NameValueStore {
      /**
       * Base class for interacting with a name/value store.
       *
       * This base class saves to local storage, but you can create your own function overrides for
       * remote storage as long as you maintain the same function signatures and callback requirements.
       *
       * See WebComponents.cq-views for an implementation example.
       *
       */
      constructor()
      /**
       * Retrieves a value from the name/value store.
       *
       * @param field The field for which the value is retrieved.
       * @param cb A callback function called after the retrieval
       * 		operation has been completed. Two arguments are provided to the callback function. The
       * 		first argument indicates the success or failure of the operation; the second argument is
       * 		the value returned by the operation.
       *
       * @since 8.2.0 Made `cb` a required parameter; changed its type to
       * 		CIQ.NameValueStore~getCallback.
       *
       * @example
       * nameValueStore.get("myfield", function(err, data) {
       *     if (err) {
       *         // Do something with the error.
       *     } else {
       *         // Do something with the retrieved data.
       *     }
       * });
       */
      public get(field: string, cb: CIQ.NameValueStore.getCallback): void
      /**
       * Stores a value in the name/value store.
       *
       * @param field The name under which the value is stored.
       * @param value The value to store.
       * @param [cb] A callback function called after the storage
       * 		operation has been completed. A single argument, which indicates success or failure of the
       * 		operation, is provided to the callback function.
       *
       * @since 8.2.0 Changed the type of the `cb` parameter to CIQ.NameValueStore~updateCallback.
       *
       * @example
       * nameValueStore.set("myfield", "myValue", function(err) {
       *     if (err) {
       *         // Do something with the error.
       *     } else {
       *         // Do something after the data has been stored.
       *     }
       * });
       */
      public set(
        field: string,
        value: string|object,
        cb?: CIQ.NameValueStore.updateCallback
      ): void
      /**
       * Removes a field from the name/value store.
       *
       * @param field The field to remove.
       * @param [cb] A callback function called after the storage
       * 		operation has been completed. A single argument, which indicates success or failure of the
       * 		operation, is provided to the callback function.
       *
       * @since 8.2.0 Changed the type of the `cb` parameter to CIQ.NameValueStore~updateCallback.
       *
       * @example
       * nameValueStore.remove("myfield", function(err) {
       *     if (err) {
       *         // Do something with the error.
       *     } else {
       *         // Do something after the field has been removed.
       *     }
       * });
       */
      public remove(field: string, cb?: CIQ.NameValueStore.updateCallback): void
    }
    /**
     * See tutorial [Data Integration : Quotefeeds]{@tutorial DataIntegrationQuoteFeeds} for a complete overview and
     * step by step source code for implementing a quotefeed
     *
     */
    class QuoteFeed {
    }
    /**
     * Namespace for functionality related to comparison series.
     *
     */
    class Comparison {
    }
    /**
     * Manages chart sharing and uploading.
     *
     * See the {@tutorial Chart Sharing} tutorial for more details.
     *
     */
    class Share {
      /**
       * Manages chart sharing and uploading.
       *
       * See the {@tutorial Chart Sharing} tutorial for more details.
       *
       */
      constructor()
    }
    /**
     * Namespace for functionality related to studies (aka indicators).
     *
     * See {@tutorial Using and Customizing Studies} for additional details and a general overview about studies.
     */
    class Studies {
      /**
       * Constants for when no inputs or outputs specified in studies.
       * Values can be changed but do not change keys.
       */
      public static DEFAULT_INPUTS
      /**
       * Adds extra ticks to the end of the scrubbed array, to be added later to the dataSet.
       *
       * This function can be used to add extra ticks, like offsets into the future, to the dataSet to be plotted ahead of the current bar.
       * If a DT is not supplied, one will be calculate for each tick in the array.
       *
       * Remember to call this outside of any loop that iterates through the quotes array, or you will create a never-ending loop, since this increases the array size.
       *
       * @param  stx A chart engine instance
       * @param  ticks The array of ticks to add. Each tick is an object containing whatever data to add.
       * @example
       * var futureTicks=[];
       * for(i++;i<quotes.length;i++){
       *     var quote=quotes[i];
       *     if(i+offset>=0){
       *         if(i+offset<quotes.length) quotes[i+offset][name]=quote["Forecast "+sd.name];
       *         else {
       *             var ft={};
       *             ft[name]=quote["Forecast "+sd.name];
       *             futureTicks.push(ft);
       *         }
       *     }
       * }
       * sd.appendFutureTicks(stx,futureTicks);
       *
       * @since 7.3.0
       */
      public appendFutureTicks(stx: CIQ.ChartEngine, ticks: any[]): void
    }
    /**
     * Generates an object that can be used programmatically to load new themes or to create a theme dialog to manage chart themes.
     * The initial values contain the existing values in the current chart.
     * Simply have your dialog modify these values and then call the method CIQ.ThemeHelper#update
     *
     * Note that the chart has many granular customizations beyond what this theme helper produces.
     * This helper simplifies and consolidates into a manageable set.
     * For example 'hallow candles', 'bars' and 'candles' colors are all grouped together.
     * But if you need to separate those out, just call an explicit CIQ.ChartEngine#setStyle for each CSS style right after the ThemeHelper is executed.
     *
     * For example, This will further set the color for the hollow_candle chart type:
     * ```
     * stxx.setStyle("stx_hollow_candle_down","color",'blue');
     * stxx.setStyle("stx_hollow_candle_up","color",'yellow');
     * stxx.setStyle("stx_hollow_candle_even","color",'pink');
     * stxx.draw();
     * ```
     * See {@tutorial Chart Styles and Types} for more details.
     *
     * Generally speaking, themes can be managed by simply adding or removing from the chart context the class name that groups the theme together.
     * And as long as the CSS contains an entry for that class, the chart will display the styles in the class when enabled.
     *
     * For example, assume the chart has a default theme and a second theme called 'ciq-night'.
     * Here are some examples of what CSS entries for those classes would look like:
     * ```
     * // default theme (day) styles
     * .stx_candle_shadow, .stx_bar_even {
     * 		color:#2e383b;
     *
     * }
     * .stx_candle_down, .stx_line_down {
     * 		border-left-color: #000000;
     * }
     *
     * // night theme override styles
     * .ciq-night .stx_candle_shadow, .ciq-night .stx_bar_even {
     * 		color: #ccc;
     * }
     * .ciq-night .stx_candle_down, .ciq-night .stx_line_down {
     * 		border-left-color: #e34621;
     * }
     * ```
     *
     * Then to activate a particular theme, you either remove the specific class to enable default (day):
     * ```
     * document.querySelector("cq-context").classList.remove('ciq-night');
     * // clear out the old styles to allow new ones to be cached in; and redraw.
     * stxx.styles={};stxx.draw();
     * ```
     * Or add a particular class to enable those styles:
     * ```
     * document.querySelector("cq-context").classList.add('ciq-night');
     * // clear out the old styles to allow new ones to be cached in; and redraw.
     * stxx.styles={};stxx.draw();
     * ```
     * You can use this method to set as many themes as needed. Remember that this method, requires all styles to be present in the CSS.
     * ThemeHelper, on the other hand, will programmatically set the styles internally, one at a time, regardless of pre-existng CSS classes.
     *
     * @example
     * var helper=new CIQ.ThemeHelper({stx:stx});
     * console.log(helper.settings);
     * helper.settings.chart["Grid Lines"].color="rgba(255,0,0,.5)";
     * helper.update();
     *
     * @since 6.2.0 Added support to control `Mountain.basecolor`.
     */
    class ThemeHelper {
      /**
       * Generates an object that can be used programmatically to load new themes or to create a theme dialog to manage chart themes.
       * The initial values contain the existing values in the current chart.
       * Simply have your dialog modify these values and then call the method CIQ.ThemeHelper#update
       *
       * Note that the chart has many granular customizations beyond what this theme helper produces.
       * This helper simplifies and consolidates into a manageable set.
       * For example 'hallow candles', 'bars' and 'candles' colors are all grouped together.
       * But if you need to separate those out, just call an explicit CIQ.ChartEngine#setStyle for each CSS style right after the ThemeHelper is executed.
       *
       * For example, This will further set the color for the hollow_candle chart type:
       * ```
       * stxx.setStyle("stx_hollow_candle_down","color",'blue');
       * stxx.setStyle("stx_hollow_candle_up","color",'yellow');
       * stxx.setStyle("stx_hollow_candle_even","color",'pink');
       * stxx.draw();
       * ```
       * See {@tutorial Chart Styles and Types} for more details.
       *
       * Generally speaking, themes can be managed by simply adding or removing from the chart context the class name that groups the theme together.
       * And as long as the CSS contains an entry for that class, the chart will display the styles in the class when enabled.
       *
       * For example, assume the chart has a default theme and a second theme called 'ciq-night'.
       * Here are some examples of what CSS entries for those classes would look like:
       * ```
       * // default theme (day) styles
       * .stx_candle_shadow, .stx_bar_even {
       * 		color:#2e383b;
       *
       * }
       * .stx_candle_down, .stx_line_down {
       * 		border-left-color: #000000;
       * }
       *
       * // night theme override styles
       * .ciq-night .stx_candle_shadow, .ciq-night .stx_bar_even {
       * 		color: #ccc;
       * }
       * .ciq-night .stx_candle_down, .ciq-night .stx_line_down {
       * 		border-left-color: #e34621;
       * }
       * ```
       *
       * Then to activate a particular theme, you either remove the specific class to enable default (day):
       * ```
       * document.querySelector("cq-context").classList.remove('ciq-night');
       * // clear out the old styles to allow new ones to be cached in; and redraw.
       * stxx.styles={};stxx.draw();
       * ```
       * Or add a particular class to enable those styles:
       * ```
       * document.querySelector("cq-context").classList.add('ciq-night');
       * // clear out the old styles to allow new ones to be cached in; and redraw.
       * stxx.styles={};stxx.draw();
       * ```
       * You can use this method to set as many themes as needed. Remember that this method, requires all styles to be present in the CSS.
       * ThemeHelper, on the other hand, will programmatically set the styles internally, one at a time, regardless of pre-existng CSS classes.
       *
       * @param params Parameters
       * @param params.stx A chart object
       * @example
       * var helper=new CIQ.ThemeHelper({stx:stx});
       * console.log(helper.settings);
       * helper.settings.chart["Grid Lines"].color="rgba(255,0,0,.5)";
       * helper.update();
       *
       * @since 6.2.0 Added support to control `Mountain.basecolor`.
       */
      constructor(params: {stx: CIQ.ChartEngine})
      /**
       * Current theme settings. These are the settings that are ready to be loaded, or currently loaded.
       * Modify as needed.
       * To load these settings call CIQ.ThemeHelper#update
       * @example
       * //Default settings object structure
       * 	"chart":{
       "Background":{
       "color":color1
       },
       "Grid Lines":{
       "color":color2
       },
       "Grid Dividers":{
       "color":color3
       },
       "Axis Text":{
       "color":color4
       }
       },
       "chartTypes":{
       "Candle/Bar":{ // also manages 'hollow candle', 'colored line' and 'colored baseline' chart types.
       "up":{
       "color":color5,
       "wick":color6,
       "border":color7
       },
       "down":{
       "color":color8,
       "wick":color9,
       "border":color10
       },
       "even":{		// colors used when the current close is equal to the previous close.
       "color":color11,
       "wick":color12,
       "border":color13
       }
       },
       "Line":{
       "color":color14
       },
       "Mountain":{
       "color":color15,
       "basecolor":color16
       }
       }
       */
      public settings: {
        chart: {
          Background: {
            color: any
          },
          "Grid Lines": {
            color: any
          },
          "Grid Dividers": {
            color: any
          },
          "Axis Text": {
            color: any
          }
        },
        chartTypes: {
          "Candle/Bar": {
            up: {
              color: any,
              wick: any,
              border: any
            },
            down: {
              color: any,
              wick: any,
              border: any
            },
            even: {
              color: any,
              wick: any,
              border: any
            }
          },
          Line: {
            color: any
          },
          Mountain: {
            color: any,
            basecolor: any
          }
        }
      }
      /**
       * Call this method to activate the chart theme with values set in CIQ.ThemeHelper#settings
       * @param [stx] Chart engine to apply the changes to.
       * @example
       * var helper=new CIQ.ThemeHelper({stx:stx});
       * console.log(helper.settings);
       * helper.settings=NewSettings;
       * helper.update();
       * @since
       * - 4.1.0 Added optional chart engine parameter.
       * - 6.2.0 Now setting base color and color of mountain chart with separate colors.
       * - 6.3.0 Colored Bar, Hollow Candle, Volume Candle charts now use `chartTypes["Candle/Bar"].even.color` for even bar color.
       */
      public update(stx?: CIQ.ChartEngine): void
    }
    /**
     * Creates a DOM object capable of receiving a data stream. The object changes as a result of the incoming data.
     * The constructor function takes attributes that define how and where in the HTML document the object gets created.
     * See CIQ.Visualization#setAttributes for more information on attributes.
     *
     * One useful application of this is to render an SVG graphic.
     *
     * Methods are provided to pass data into the object and to render it in the HTML document. Note that the `data` and
     * `attributes` that are passed into the prototype methods of this object become owned by it and therefore can be mutated.
     *
     * The DOM object-generating function can assign class names to subelements within the object. These class names can be used
     * to style the object using CSS. Documentation for the built-in functions explains which classes are available to be styled.
     *
     * 		and attributes as arguments *by reference* and returns an `HTMLElement` (which may have children).
     * 		a container element is created with 300 x 300 pixel dimensions.
     * 		gridlines. **Note:** Consider using CIQ.ChartEngine#embedVisualization; it automatically places the object
     * 		within the canvases.
     * 		Do not set if `renderFunction` can handle an incremental update of the object. Alternatively, `renderFunction` might set
     * 		this attribute. When attributes are updated using `setAttributes`, a complete replacement occurs.
     * @example
     * let svg=new CIQ.Visualization({ renderFunction: CIQ.SVGChart.renderPieChart });
     * svg.updateData({"Low":{name:"low", value:30}, "High":{name:"high", value:70}});
     * @since 7.4.0
     */
    class Visualization {
      /**
       * Creates a DOM object capable of receiving a data stream. The object changes as a result of the incoming data.
       * The constructor function takes attributes that define how and where in the HTML document the object gets created.
       * See CIQ.Visualization#setAttributes for more information on attributes.
       *
       * One useful application of this is to render an SVG graphic.
       *
       * Methods are provided to pass data into the object and to render it in the HTML document. Note that the `data` and
       * `attributes` that are passed into the prototype methods of this object become owned by it and therefore can be mutated.
       *
       * The DOM object-generating function can assign class names to subelements within the object. These class names can be used
       * to style the object using CSS. Documentation for the built-in functions explains which classes are available to be styled.
       *
       * @param attributes Parameters to be used when creating the object.
       * @param attributes.renderFunction DOM object-generating function. Takes data as an array (sorted by index property)
       * 		and attributes as arguments *by reference* and returns an `HTMLElement` (which may have children).
       * @param [attributes.container] Element in which to put the DOM object (or selector thereof). If omitted,
       * 		a container element is created with 300 x 300 pixel dimensions.
       * @param [attributes.useCanvasShim] Set to true to relocate the container behind the canvas but in front of the
       * 		gridlines. **Note:** Consider using CIQ.ChartEngine#embedVisualization; it automatically places the object
       * 		within the canvases.
       * @param [attributes.stx] A reference to the chart engine. Required if using the canvas shim.
       * @param [attributes.id] Optional id attribute to assign to the object.
       * @param [attributes.forceReplace] True to force a complete replacement of the DOM object when data changes.
       * 		Do not set if `renderFunction` can handle an incremental update of the object. Alternatively, `renderFunction` might set
       * 		this attribute. When attributes are updated using `setAttributes`, a complete replacement occurs.
       * @example
       * let svg=new CIQ.Visualization({ renderFunction: CIQ.SVGChart.renderPieChart });
       * svg.updateData({"Low":{name:"low", value:30}, "High":{name:"high", value:70}});
       * @since 7.4.0
       */
      constructor(
        attributes: {
          renderFunction: Function,
          container?: HTMLElement|string,
          useCanvasShim?: boolean,
          stx?: CIQ.ChartEngine,
          id?: string,
          forceReplace?: boolean,
          [renderAttributes:string]: any
        }
      )
      /**
       * Removes the DOM object. If the container was generated by this object, the container is also removed.
       *
       * @param soft True to leave properties of this object alone. Setting to false is preferable.
       * @since 7.4.0
       */
      public destroy(soft: boolean): void
      /**
       * Draws the DOM object in its container. Data must be set using CIQ.Visualization#updateData prior
       * to calling this function. Any content existing within the container is removed prior to drawing the object.
       *
       * @param forceReplace Indicates whether a full redraw is requested.
       * @since 7.4.0
       */
      public draw(forceReplace: boolean): void
      /**
       * Adds or changes the visualization object attributes, and then calls the draw function.
       *
       * The following generic attributes are available to all objects; all attributes are passed into the object-generating
       * function and may be used there:
       * - renderFunction
       * - container
       * - stx
       * - useCanvasShim
       * - id
       * - forceReplace
       *
       * Attributes are passed into `renderFunction`, the object-generating function; and so, additional attributes can be
       * added specific to the function.
       *
       * **Note:** The attributes passed into `renderFunction` can be changed by the render function when necessary. You can
       * set either one attribute by passing in a key and a value, or you can add a set of attributes by passing in an object
       * of key/value pairs.
       *
       * @param arg1 An attribute key or and object of attribute key/value pairs.
       * @param [arg2] The value of the attribute if passing in one key and value.
       * @since 7.4.0
       */
      public setAttributes(arg1: object|string, arg2?: any): void
      /**
       * Adds or changes the visualization object data, and then calls the draw function.
       *
       * @param data Provides data used to generate the DOM object. Contains at a minimum a `name`, a `value`,
       * 		and an optional `index`, which specifies sort order. The data must accommodate the update `action`.
       * @param [action] The action to take when generating the DOM object. Valid actions are "add", "update",
       * 		"delete", and "replace" (default).
       *
       * The `data` object provides each action with the required data.
       *
       * | Action | Required Data |
       * | ------ | ---- |
       * | replace | A full data object. |
       * | delete | The data records to remove. **Note:** This may affect the colors used in the chart.
       * | update | The data records to update. The existing records will have their properties replaced with the new properties, leaving all non-matching properties alone.
       * | add | The same as the "update" action except the `value` property of the existing data is augmented instead of replaced by the new value.
       *
       * See the examples below.
       *
       * **Note:** If only the `value` property is being changed, it may be passed as a raw number rather than being assigned
       * to an object property.
       *
       * @example
       * <caption>Given a CIQ.Visualization instance <code>obj</code>:</caption>
       * obj.updateData({"up",{value:1}},"add") // Adds 1 to the value property of the data record "up".
       * obj.updateData({"up":1},"add") // Also adds 1 to the value property of the data record "up".
       * obj.updateData({"up",{name:"UP"}},"update") // Updates the name property of the data record "up" to "UP".
       * obj.updateData({"down",null},"delete") // Removes the record "down".
       * obj.updateData({"down",{value:6}},"update") // Updates the value property of the data record "down" to 6.
       * obj.updateData({"down",0},"update") // Updates the value property of the data record "down" to 0.
       * obj.updateData({"up":5,"down":4},"replace") // Replaces the entire data record with the new record.
       * obj.updateData({"up":5,"down":4}) // Same as above; "replace" is the default action.
       *
       * @return This object.
       * @since 7.4.0
       */
      public updateData(data: object|any[], action?: string): CIQ.Visualization
    }
    interface ChartEngine {
      /**
       * Animation Loop
       *
       * Draws a generic histogram for the chart.
       *
       * This method should rarely if ever be called directly.  Use CIQ.Renderer.Histogram or CIQ.ChartEngine#setChartType instead.
       *
       * Any parameters from CIQ.Renderer#attachSeries or CIQ.ChartEngine#addSeries
       * will be passed on to this method and are valid when directly calling it from within a [study display function of a Custom Study]{@tutorial Using and Customizing Studies - Creating New Studies}.
       *
       * Note that if negative values are present, the function will not draw bars pointing downwards;
       * instead the baseline of the histogram will be adjusted to the minimum value detected, and all bars will rise upward from there.
       *
       * Visual Reference -stacked:
       * ![stacked](img-stacked.png "stacked")
       *
       * Visual Reference -clustered:
       * ![clustered](img-clustered.png "clustered")
       *
       * Visual Reference -overlaid:
       * ![overlaid](img-overlaid.png "overlaid")
       *
       * @param  params Parameters to control the histogram itself
       * @param  [params.name="Data"] Name of the histogram.
       * @param  [params.panel]		Panel on which to draw the bars
       * @param  [params.yAxis=panel.yAxis] Set to specify an alternate y-axis
       * @param  [params.type="overlaid"] Type of histogram (stacked, clustered, overlaid).
       * @param  [params.bindToYAxis=false] For a study, set to true to bind the histogram to the y-axis and to draw it.
       * @param  [params.heightPercentage=0.7] The amount of vertical space to use for the histogram, valid values are 0.00-1.00.	Ignored when bindToYAxis==true.
       * @param  [params.widthFactor=0.8] Width of each bar as a percentage of the candleWidth, valid values are 0.00-1.00.
       * @param  [params.borders=true] Histogram bar border overide. Set to 'false' to stop drawing borders, even if seriesParams.border_color_X are set.
       * @param  seriesParams Parameters to control color and opacity of each part (stack) of the histogram. Each stack is represented by an array element containing an object with the following members:
       * @param  seriesParams.field Name of the field in the dataSet to use for the part in the stack
       * @param  seriesParams.fill_color_up Color to use to fill the part when the Close is higher than the previous (#RRGGBB format or null to not draw)
       * @param  seriesParams.border_color_up Color to use to draw the border when the Close is higher than the previous (#RRGGBB format or null to not draw)
       * @param  seriesParams.opacity_up Opacity to use to fill the part when the Close is higher than the previous (0.0-1.0)
       * @param  seriesParams.fill_color_down Color to use to fill the part when the Close is lower than the previous (#RRGGBB format or null to not draw)
       * @param  seriesParams.border_color_down Color to use to draw the border when the Close is lower than the previous (#RRGGBB format or null to not draw)
       * @param  seriesParams.opacity_down Opacity to use to fill the part when the Close is lower than the previous (0.0-1.0)
       * @param  seriesParams.color_function configure colors for each bar (will be used instead of fill_color and border_color. Opacity will be 1).
       *
       * **Parameters:**
       * <table>
       * <tr><th>Name</th><th>Type</th><th>Description</th></tr>
       * <tr><td>quote</td><td>Object</td><td>a CIQ.ChartEngine.Chart#dataSegment element used to decide the color of that particular bar</td></tr>
       * </table>
       *
       * **Returns:**
       * - Object with the following elements:
       * <table>
       * <tr><th>Name</th><th>Type</th><th>Description</th></tr>
       * <tr><td>fill_color</td><td>String</td><td>used for fill actions, hex format (#RRGGBB)</td></tr>
       * <tr><td>border_color</td><td>String</td><td>used for line actions, hex format (#RRGGBB)</td></tr>
       * </table>
       *
       * **Example:**
       *
       * ```
       * seriesParams[0].color_function= function(quote){
       * 	if(quote.Low > 100 ) {
       * 		return {
       * 					fill_color: '#FFFFFF',
       * 					border_color: '#00ff87'
       * 				}
       * 	} else {
       * 		return {
       * 					fill_color: '#000000',
       * 					border_color: '#0000FF'
       * 				}
       * 	}
       * };
       * ```
       *
       * @example
       * var params = {
       * 	name: 'Volume',
       * 	type: 'overlaid',
       * 	heightPercentage: 0.2,
       * 	widthFactor: 0.85
       * };
       * var seriesParams = [{
       * 	field: 'Volume',
       * 	color_function: function(bar) {
       * 		var value = bar[this.field];
       * 		var colorTuple = {
       * 			fill_color: value > 500 ? '#05FF1F' : '#05054A',
       * 			border_color: '#ABABAB'
       * 		};
       * 		return colorTuple;
       * 	}
       * }];
       * // this will draw a **single frame** of the histogram.
       * stxx.drawHistogram(params, seriesParams);
       * @since
       * - 07/01/2015
       * - 3.0.0 `seriesParams.color_function` added to determine the colors of a series bar.
       * - 3.0.0 Added params.borders optional component to easily turn borders off.
       */
      drawHistogram(
        params: {
          name?: string,
          panel?: CIQ.ChartEngine.Panel,
          yAxis?: CIQ.ChartEngine.YAxis,
          type?: string,
          bindToYAxis?: boolean,
          heightPercentage?: number,
          widthFactor?: number,
          borders?: boolean
        },
        seriesParams: {
          field: string,
          fill_color_up: string,
          border_color_up: string,
          opacity_up: number,
          fill_color_down: string,
          border_color_down: string,
          opacity_down: number,
          color_function: Function
        }
      ): void
      /**
       * Given an html element, this allows the chart container to keep track of its own drawing container
       * (where appropriate)
       * @param htmlElement The html element where the chart container is for 'this' chart
       * @example
       *	var stxx=new CIQ.ChartEngine({container:document.querySelector(".chartContainer"), preferences:{labels:false, currentPriceLine:true, whitespace:0}});
       *	stxx.setDrawingContainer(document.querySelector('cq-toolbar'));
       * @since 6.0.0
       */
      setDrawingContainer(htmlElement: object): void
      /**
       * Exports (serializes) all of the drawings on the chart(s) so that they can be saved to an external database and later imported with CIQ.ChartEngine#importDrawings.
       * @see CIQ.ChartEngine#importDrawings
       * @return An array of serialized objects representing each drawing
       * @since 3.0.0 Replaces `serializeDrawings`.
       */
      exportDrawings(): any[]
      /**
       * Imports drawings from an array originally created by CIQ.ChartEngine#exportDrawings.
       * To immediately render the reconstructed drawings, you must call `draw()`.
       * See {@tutorial Using and Customizing Drawing Tools} for more details.
       *
       * **Important:**
       * Calling this function in a way that will cause it to run simultaneously with [importLayout]CIQ.ChartEngine#importLayout
       * will damage the results on the layout load. To prevent this, use the CIQ.ChartEngine#importLayout or CIQ.ChartEngine#loadChart callback listeners.
       *
       * @see CIQ.ChartEngine#exportDrawings
       * @param  arr An array of serialized drawings
       * @since 4.0.0 Replaces `reconstructDrawings`.
       * @example
       * // programmatically add a rectangle
       * stxx.importDrawings([{"name":"rectangle","pnl":"chart","col":"transparent","fc":"#7DA6F5","ptrn":"solid","lw":1.1,"d0":"20151216030000000","d1":"20151216081000000","tzo0":300,"tzo1":300,"v0":152.5508906882591,"v1":143.3385829959514}]);
       * // programmatically add a vertical line
       * stxx.importDrawings([{"name":"vertical","pnl":"chart","col":"transparent","ptrn":"solid","lw":1.1,"v0":147.45987854251013,"d0":"20151216023000000","tzo0":300,"al":true}]);
       * // now render the reconstructed drawings
       * stxx.draw();
       */
      importDrawings(arr: any[]): void
      /**
       * Clears all the drawings on the chart. (Do not call abortDrawings directly).
       * @param cantUndo Set to true to make this an "non-undoable" operation
       * @param deletePermanent Set to false to not delete permanent drawings
       * @since 6.0.0 Added `deletePermanent` parameter.
       */
      clearDrawings(cantUndo: boolean, deletePermanent: boolean): void
      /**
       * Creates a new drawing of the specified type with the specified parameters. See {@tutorial Using and Customizing Drawing Tools} for more details.
       * @param  type	   Drawing name
       * @param  parameters Parameters that describe the drawing
       * @return			A drawing object
       */
      createDrawing(type: string, parameters: object): CIQ.Drawing
      /**
       * Removes the drawing. Drawing object should be one returned from CIQ.ChartEngine#createDrawing. See {@tutorial Using and Customizing Drawing Tools} for more details.
       * @param  drawing Drawing object
       */
      removeDrawing(drawing: object): void
      /**
       * INJECTABLE
       *
       * Stops (aborts) the current drawing. See CIQ.ChartEngine#undoLast for an actual "undo" operation.
       */
      undo(): void
      /**
       * Creates an undo stamp for the chart's current drawing state and triggers a call to the [undoStampEventListener]CIQ.ChartEngine~undoStampEventListener.
       *
       * Every time a drawing is added or removed the CIQ.ChartEngine#undoStamps object is updated with a new entry containing the resulting set of drawings.
       * Using the corresponding CIQ.ChartEngine#undoLast method, you can revert back to the last state, one at a time.
       * You can also use the [undoStampEventListener]CIQ.ChartEngine~undoStampEventListener to create your own tracker to undo or redo drawings.
       * @param before The chart's array of [serialized drawingObjects]CIQ.ChartEngine#exportDrawings before being modified.
       * @param after The chart's array of [serialized drawingObjects]CIQ.ChartEngine#exportDrawings after being modified
       * @since 7.0.0 'before' and 'after' parameters must now be an array of serialized drawings instead of an array of drawingObjects. See CIQ.ChartEngine#exportDrawings.
       */
      undoStamp(before: any[], after: any[]): void
      /**
       * Reverts back to the previous drawing state change.
       * **Note: by design this method only manages drawings manually added during the current session and will not remove drawings restored from
       * a previous session.** If you wish to remove all drawings use CIQ.ChartEngine#clearDrawings.
       *
       * You can also view and interact with all drawings by traversing through the CIQ.ChartEngine#drawingObjects array which includes **all** drawings displayed
       * on the chart, regardless of session. Removing a drawing from this list, will remove the drawing from the chart after a draw() operation is executed.
       */
      undoLast(): void
      /**
       * Activate a drawing. The user can then finish the drawing.
       *
       * Note: Some drawings labeled "chartsOnly" can only be activated on the chart panel.
       * @param drawingTool The tool to activate. Send null to deactivate.
       * @param [panel] The panel where to activate the tool. Defaults to the current panel.
       * @return Returns true if the drawing was successfully activated. Returns false if unactivated or unsuccessful.
       * @since
       * - 3.0.0
       * - 7.0.0 `panel` defaults to the current panel.
       */
      activateDrawing(drawingTool: string, panel?: CIQ.ChartEngine.Panel): boolean
      /**
       * This is called to send a potential click event to an active drawing, if one is active.
       * @param  panel The panel in which the click occurred
       * @param  x	  The X pixel location of the click
       * @param  y	  The y pixel location of the click
       * @return	  Returns true if a drawing is active and received the click
       */
      drawingClick(panel: CIQ.ChartEngine.Panel, x: number, y: number): boolean
      /**
       * Dispatches a [drawingEditEventListener]CIQ.ChartEngine~drawingEditEventListener event
       * if there are any listeners. Otherwise, removes the given drawing.
       *
       * @param drawing The vector instance to edit, normally provided by deleteHighlighted.
       * @param forceEdit skip the context menu and begin editing. Used on touch devices.
       * @since 6.2.0
       */
      rightClickDrawing(drawing: CIQ.Drawing, forceEdit: boolean): void
      /**
       * INJECTABLE
       *
       * Calculates the magnet point for the current mouse cursor location. This is the nearest OHLC point. A small white
       * circle is drawn on the temporary canvas to indicate this location for the end user. If the user initiates a drawing then
       * the end point of the drawing will be tied to the magnet point.
       * This function is only used when creating a new drawing if <a href="CIQ.ChartEngine.html#preferences%5B%60magnet%60%5D">CIQ.ChartEngine.preferences.magnet</a> is true and
       * a drawing <a href="CIQ.ChartEngine.html#currentVectorParameters%5B%60vectorType%60%5D">CIQ.ChartEngine.currentVectorParameters.vectorType</a> has been enabled. It will not be used when an existing drawing is being repositioned.
       */
      magnetize(): void
      /**
       * Sets the current drawing tool as described by CIQ.ChartEngine.currentVectorParameters
       * (segment, line, etc.). Also triggers crosshairs to appear if they are relevant to the drawing.
       *
       * **Note:** The value `""` (empty string) is used for the "no tool" option, and `null` is used to
       * turn off drawing mode entirely. If the "no tool" option is set, crosshairs will not appear even
       * if crosshairs are toggled on.
       *
       * @param value The name of the drawing tool to enable.
       *
       *
       * @example
       * // Activates a drawing type described by currentVectorParameters.
       * stxx.changeVectorType("rectangle");
       *
       * // Deactivates drawing mode.
       * stxx.changeVectorType("");
       *
       * // Clears the drawings.
       * stxx.clearDrawings()
       */
      changeVectorType(value: string): void
      /**
       * Sets the current drawing parameter as described by CIQ.ChartEngine.currentVectorParameters (color, pattern, etc)
       * @param  parameter The name of the drawing parameter to change (currentColor, fillColor, lineWidth, pattern, axisLabel, fontSize, fontStyle, fontWeight, fontFamily)
       * @param  value The value of the parameter
       * @return  True if property was assigned
       * @example
       * 		this.stx.changeVectorParameter("currentColor","yellow");  // or rgb/hex
       *		this.stx.changeVectorParameter("axisLabel",false);  // or "false"
       *		this.stx.changeVectorParameter("lineWidth",5);  // or "5"
       *		this.stx.changeVectorParameter("fontSize","12");  // or 12 or "12px"
       *		this.stx.changeVectorParameter("pattern","dotted");
       *
       * @since 3.0.0
       */
      changeVectorParameter(parameter: string, value: string): boolean
      /**
       * INJECTABLE
       * <span class="animation">Animation Loop</span>
       *
       * Draws the drawings (vectors). Each drawing is iterated and asked to draw itself. Drawings are automatically
       * clipped by their containing panel.
       */
      drawVectors(): void
      /**
       * Loops through the existing drawings and asks them to adjust themselves to the chart dimensions.
       */
      adjustDrawings(): void
      /**
       * If true when the chart initially is rendered, then the CIQ.ChartEngine object will register to listen and manage touch and mouse browser events within then canvas by attaching them to the container div.
       *
       * Set to false, and all interactivity with the chart will cease; turning it into a static display and 'shedding' all HTML overlays and events required for user interaction, for a much more lightweight interface.
       * Alternatively you can selectively set any CIQ.ChartEngine.htmlControls id to null, including `CIQ.ChartEngine.htmlControls=null` to disable them all.
       *
       * See the {@tutorial Creating Static Charts} tutorial for more details.
       *
       * It is possible to re-enable the events after the chart has been rendered, but you must call stx.initializeChart(); stx.draw(); to register the events once again.
       * @example
       * // if enabling events after the chart was already rendered, you must reinitialize to re register the browser events.
       * stxx.manageTouchAndMouse = true;
       * stxx.initializeChart();
       * stxx.draw();
       */
      manageTouchAndMouse: boolean
      /**
       * Registers touch and mouse events for the chart (for dragging, clicking, zooming). The events are registered on the container div (not the canvas).
       * Set CIQ.ChartEngine#manageTouchAndMouse to false to disable the built in event handling (events will not be registered with the container).
       */
      registerTouchAndMouseEvents(): void
      /**
       * INJECTABLE
       *
       * Called when the user presses the mouse button down. This will activate dragging operations once the user moves a few pixels
       * within CIQ.ChartEngine#mousemoveinner.
       * @param  e The mouse event
       */
      mousedown(e: Event): void
      /**
       * INJECTABLE
       *
       * Handles mouse movement events. This method calls CIQ.ChartEngine#mousemoveinner which has the core logic
       * for dealing with panning and zooming. See also CIQ.ChartEngine#touchmove which is the equivalent method for touch events.
       * @param mouseEvent A mouse move event
       */
      mousemove(mouseEvent: Event): void
      /**
       * INJECTABLE
       *
       * Called whenever the user lifts the mousebutton up. This may send a click to a drawing, or cease a drag operation.
       * @param  e A mouse event
       * @since 6.3.0 baseline chart recenters itself after adjusting baseline
       */
      mouseup(e: Event): void
      /**
       * Handles all double-clicks on the chart container.
       *
       * Applies a double-click event to a CIQ.Marker and dispatches the "doubleClick" event,
       * which invokes the [doubleClickEventListener]CIQ.ChartEngine~doubleClickEventListener.
       *
       * If the return value of the marker's CIQ.Marker#doubleClick method is truthy, the
       * "doubleClick" event is not dispatched.
       *
       * @param button The button used to double-click.
       * @param x The x-coordinate of the double-click.
       * @param y The y-coordinate of the double-click.
       *
       * @since 8.0.0
       */
      doubleClick(button: number, x: number, y: number): void
      /**
       * INJECTABLE
       *
       * This is called whenever the mouse leaves the chart area. Crosshairs are disabled, stickies are hidden, dragDrawings are completed.
       * @param  e The mouseout event
       */
      handleMouseOut(e: Event): void
      /**
       * INJECTABLE
       *
       * Event handler that is called when the handle of a panel is grabbed, for resizing
       * @param  panel The panel that is being grabbed
       */
      grabHandle(panel: CIQ.ChartEngine.Panel): void
      /**
       * Turns on the grabbing hand cursor. It does this by appending the class "stx-drag-chart" to the chart container.
       * If this is a problem then just eliminate this function from the prototype.
       */
      grabbingHand(): void
      /**
       * INJECTABLE
       *
       * Event handler that is called when a panel handle is released.
       */
      releaseHandle(): void
      /**
       * Finds any objects that should be highlighted by the current crosshair position. All drawing objects have their highlight() method
       * called in order that they may draw themselves appropriately.
       * @param  isTap If true then it indicates that the user tapped the screen on a touch device, and thus a wider radius is used to determine which objects might have been highlighted.
       * @param clearOnly Set to true to clear highlights
       * @since 4.0.0 CIQ.ChartEngine#displaySticky is now called to display the 'series.symbol' if the 'series.display' is not present
       */
      findHighlights(isTap: boolean, clearOnly: boolean): void
      /**
       * INJECTABLE
       *
       * This function is called when the user right clicks on a highlighted overlay, series or drawing.
       * Calls deleteHighlighted() which calls rightClickOverlay() for studies.
       * @example
       * stxx.prepend("rightClickHighlighted", function(){
       * 	console.log('do nothing on right click');
       * 	return true;
       * });
       */
      rightClickHighlighted(): void
      /**
       * INJECTABLE
       *
       * Removes any and all highlighted overlays, series or drawings.
       *
       * @param callRightClick When true, call the right click method for the given highlight:
       * - Drawing highlight calls CIQ.ChartEngine#rightClickDrawing
       * - Overlay study highlight calls CIQ.ChartEngine#rightClickOverlay
       * @param forceEdit Skip the context menu and begin editing immediately, usually for
       * 		touch devices.
       *
       * @since
       * - 4.1.0 Removes a renderer from the chart if it has no series attached to it.
       * - 6.2.0 Calls CIQ.ChartEngine#rightClickDrawing when a drawing is
       * 		highlighted and the `callRightClick` paramenter is true.
       */
      deleteHighlighted(callRightClick: boolean, forceEdit: boolean): void
      /**
       * Displays the "ok to drag" div and the study/series which is highlighted, near the crosshairs.
       * @param [soft] True to just set the position of an already displayed div, otherwise, toggles display style based on whether long press was completed.
       * @since 7.1.0
       */
      displayDragOK(soft?: boolean): void
      /**
       * Displays the "ok to draw" icon and the field which is highlighted, near the crosshairs. Used with the [average line drawing]CIQ.Drawing.average.
       *
       * In general, any series and most studies can have an average line drawing placed on it.
       * When such a plot is highlighted, this function will show the [drawOk chart control]CIQ.ChartEngine.htmlControls and display the field being highlighted.
       * @since 7.0.0
       */
      displayDrawOK(): void
      /**
       * INJECTABLE
       *
       * Zooms (vertical swipe / mousewheel) or pans (horizontal swipe) the chart based on a mousewheel event.
       *
       * Uses for following for zooming:
       *  -  CIQ.ChartEngine#zoomIn
       *  -  CIQ.ChartEngine#zoomOut
       *
       * Uses the following for panning:
       *  -  CIQ.ChartEngine#mousemoveinner
       *
       * Circumvented if:
       * - CIQ.ChartEngine#allowZoom is set to `false`
       * - CIQ.ChartEngine#captureMouseWheelEvents is set to `false`
       * - on a vertical swipe and CIQ.ChartEngine#allowSideswipe is `false`
       *
       * See the following options:
       * - CIQ.ChartEngine#reverseMouseWheel
       * - CIQ.ChartEngine#mouseWheelAcceleration
       *
       * @param  e		  The event
       * @return			Returns false if action is taken
       */
      mouseWheel(e: Event): boolean
      /**
       * Appends additional chart controls and attaches a click event handler.
       *
       * @param controlClass CSS class to attach to the control element.
       * @param controlLabel Descriptive name for the control; appears in tooltip.
       * @param clickHandler Called when the control is selected.
       * @return Reference to the new control element.
       *
       * @since 7.3.0
       */
      registerChartControl(
        controlClass: string,
        controlLabel: string,
        clickHandler: Function
      ): Node
      /**
       * INJECTABLE
       *
       * Zooms the chart out. The chart is zoomed incrementally by the percentage indicated each time this is called.
       * @param  e The mouse click event, if it exists (from clicking on the chart control)
       * @param  pct The percentage, **in decimal equivalent**, to zoom out the chart. Default is 1/0.7 (~1.42), to reverse the 0.7 (30%) multiplier used in CIQ.ChartEngine.ChartEngine#zoomIn
       * @example
       * // 30% zoom adjustment
       * zoomOut(null, 1.3);
       * @since 4.0.0 If both CIQ.ChartEngine.Chart#allowScrollPast and CIQ.ChartEngine.Chart#allowScrollFuture are set to false, the zoom operation will stop mid animation to prevent white space from being created.
       */
      zoomOut(e: Event, pct: number): void
      /**
       * INJECTABLE
       *
       * Zooms the chart in. The chart is zoomed incrementally by the percentage indicated each time this is called.
       * @param  e The mouse click event, if it exists (from clicking on the chart control)
       * @param  pct The percentage, **in decimal equivalent**, to zoom in the chart. Default is 0.7 (30%)
       * @example
       * // 30% zoom adjustment
       * zoomIn(null, 0.7);
       */
      zoomIn(e: Event, pct: number): void
      /**
       * INJECTABLE
       * <span class="animation">Animation Loop</span>
       *
       * Registers mouse events for the crosshair elements (to prevent them from picking up events)
       */
      createCrosshairs(): void
      /**
       * INJECTABLE
       *
       * Core logic for handling mouse or touch movements on the chart.
       *
       * If CIQ.ChartEngine#grabbingScreen is `true` then drag operations are performed.
       *
       * This method sets several variables which can be accessed for convenience:
       * - CIQ.ChartEngine.crosshairX and CIQ.ChartEngine.crosshairY - The screen location of the crosshair
       * - stxx.insideChart - True if the cursor is inside the canvas
       * - stxx.cx and stxx.cy - The location on the canvas of the crosshair
       * - stxx.crosshairTick - The current location in the dataSet of the crosshair
       * - stxx.currentPanel - The current panel in which the crosshair is located (this.currentPanel.chart is the chart)
       * - stxx.grabStartX and this.grabStartY - If grabbing the chart, then the starting points of that grab
       * - stxx.grabStartScrollX and this.grabStartScrollY - If grabbing the chart, then the starting scroll positions of the grab
       * - stxx.zoom - The vertical zoom percentage
       * - stxx.scroll - The scroll position of the chart
       *
       * *Above assumes your have declared a chart engine and assigned to `var stxx`.
       *
       * @param  epX The X location of the cursor on the screen (relative to the viewport)
       * @param  epY The Y location of the cursor on the screen (relative to the viewport)
       * @jscrambler ENABLE
       */
      mousemoveinner(epX: number, epY: number): void
      /**
       * Detects whether the plot (series or study) or axis should be dragged to another panel or axis by examining the x and y pixels of the mouse
       * and seeing if it's either over a different panel than the plot or close to another panel (or the top or bottom edge of the chart),
       * or over the axis region or left or right edges of the plot (to signify an axis move).
       * If so, the plot is moved to the new panel or axis, or the axis is moved to another position.
       *
       * @param  cx X pixel to test.
       * @param  cy Y pixel to test.
       * @since
       * - 7.1.0
       * - 7.2.0 Renamed the function. Accepts `cx` coordinate for axis move. Supports combining and
       * 		splitting axes. Replaces CIQ.ChartEngine#dragPlot and
       * 		CIQ.ChartEngine#dragYAxis.
       */
      dragPlotOrAxis(cx: number, cy: number): void
      /**
       * Attaches a quote feed to the charting engine by creating an internal quote feed driver, which
       * the chart uses to pull data from the quote feed as needed.
       *
       * Multiple quote feeds may be attached to the engine by including the `filter` parameter, which
       * enables the quote feed driver to determine whether the quote feed should be used for a
       * specified instrument. If a filter is not provided, the quote feed becomes the default quote
       * feed and is used if all other attached quote feeds (which must have filters) do not match the
       * filter criteria.
       *
       * Only one unfiltered quote feed can be attached to the chart engine. If you call this function
       * without a `filter` argument when a default, unfiltered quote feed is already attached, all
       * attached quote feeds, including the default quote feed, are removed, and the object passed to
       * `quoteFeed` is attached as the new default.
       *
       * **Note:** You must attach filtered quote feeds in order of priority. The quote feeds are
       * filtered in the order in which they are attached to the engine. The first quote feed that
       * matches the filter criteria is used. If none of the filtered quote feeds match the criteria,
       * the unfiltered default quote feed is used. The default quote feed can be attached without
       * regard to priority.
       *
       * @param [quoteFeed] Your quote feed object.
       * @param [behavior] Contains initialization parameters for the quote feed.
       * @param [behavior.suppressErrors] If true, then no error is displayed when the quote
       * 		feed returns one. Instead, the new symbol is simply not loaded and the prior symbol
       * 		remains on the screen.
       * @param [behavior.refreshInterval] If not null, then sets the frequency for fetching
       * 		updates (if null or zero then `fetchUpdateData` is not called).
       * @param [behavior.forwardPaginationRetryInterval] Defaults to five seconds when set to
       * 		null. In [historical mode]{@tutorial DataIntegrationQuoteFeeds}, determines how often
       * 		(in seconds) a forward pagination attempt can be tried. Forward pagination is different
       * 		than a fetch update, in that it tries to get enough data just to fill the gap in the
       * 		visible portion of the chart rather than to request an update from the visible area to
       * 		the current candle, which depending on the visible range, could be days or months away.
       * @param [behavior.bufferSize] The minimum number of undisplayed historical ticks that
       * 		will always be buffered in `masterData`. Useful to prevent temporary gaps on studies while
       * 		paginating. This forces pagination fetch requests to be triggered ahead of reaching the
       * 		edge of the chart, if the number of already loaded bars is less than the required buffer
       * 		size. This parameter can be reset at any time by manipulating
       * 		`stxx.quoteDriver.behavior.bufferSize`; it will then become active on the very next
       * 		loading check. It is used on both left and right side pagination requests.
       * @param [behavior.callback] Optional callback after any fetch to enhance
       * 		functionality. It will be called with the params object used with the fetch call.
       * @param [behavior.noLoadMore] If true, then the chart does not attempt to load any
       * 		more data after the initial load.
       * @param [behavior.findHeadOfData] If true, then the chart attempts to load more data
       * 		(and find the most recent) if the initial load returned no data.
       * @param [behavior.loadMoreReplace] If true, then when paginating, the driver replaces
       * 		`masterData` instead of prepending. Set this if your feed can only provide a full data
       * 		set of varying historical lengths.
       * @param [behavior.adjustmentMethod] Overrides the quote feed's default dividend/split
       * 		adjustment method. The value will depend on the particular quote feed implementation.
       * @param [behavior.maximumTicks=20000] Limits the maximum number of ticks to request
       * 		from a quote feed. Setting a value in the quote driver's behavior overrides an
       * 		individual quote feed's `maxTicks` value.
       * @param [behavior.ignoreUpdateError] Indicates that an update that fails should be
       * 		treated as no data found rather than an error.
       * @param [filter] Filters the quote feed provided by the `quoteFeed` parameter. The
       * 		filter function takes an object parameter typically containing `symbolObject`, `symbol`,
       * 		and `interval` properties. The properties associate the quote feed with an instrument.
       * 		If the `filter` function returns true, the quote feed is used for the instrument.
       *
       * @since
       * - 2016-12-01
       * - 5.0.0 Added `behavior.bufferSize` parameter.
       * - 5.1.1 Added `behavior.maximumTicks` parameter.
       * - 6.0.0 Added `behavior.forwardPaginationRetryInterval` parameter.
       * - 6.2.3 Added `behavior.ignoreUpdateError` parameter.
       * - 7.2.0 Added `behavior.findHeadOfData` parameter.
       * - 7.3.0 Added `filter` parameter.
       *
       * @see Multiple Quote Feeds in the [Data Integration: Advanced]{@tutorial DataIntegrationAdvanced}
       * tutorial.
       *
       * @example <caption>Attach a quote feed and have the driver call <code>fetchUpdateData</code>
       * once per second.</caption>
       * stxx.attachQuoteFeed(
       *     yourQuotefeed,
       *     { refreshInterval:1, bufferSize:200 },
       *     function (params) {
       *         return CIQ.Market.Symbology.factory(params.symbolObject) == CIQ.Market.FOREX
       *                && params.symbol == "^USDCAD"
       *                && params.interval == "day";
       *     }
       * );
       * @since
       * - 2016-12-01
       * - 5.0.0 Added `behavior.bufferSize`.
       * - 5.1.1 Added `behavior.maximumTicks`.
       * - 6.0.0 Added `behavior.forwardPaginationRetryInterval`.
       * - 6.2.3 Added `behavior.ignoreUpdateError`.
       * - 7.2.0 Added `behavior.findHeadOfData` parameter.
       * - 7.3.0 Added `filter` parameter.
       */
      attachQuoteFeed(
        quoteFeed?: object,
        behavior?: {
          suppressErrors?: number,
          refreshInterval?: number,
          forwardPaginationRetryInterval?: number,
          bufferSize?: number,
          callback?: Function,
          noLoadMore?: number,
          findHeadOfData?: number,
          loadMoreReplace?: boolean,
          adjustmentMethod?: string,
          maximumTicks?: number,
          ignoreUpdateError?: boolean
        },
        filter?: Function
      ): void
      /**
       * INJECTABLE
       *
       * Adds a series of data to the chart.
       *
       * A series can be rendered (for instance like a comparison chart) or it can be hidden (for instance to drive a study).
       *
       * If you have a quotefeed attached to your chart, then just pass the symbol as the first parameter.
       * There is no need to pass data since the chart will automatically fetch it from your quotefeed.
       * If however you are using the "push" method to feed data to your chart then you must provide the data manually by passing it as a parameter.
       *
       * Here's how you would add a hidden series for symbol "IBM" when using a quotefeed:
       * ```
       * stxx.addSeries("IBM");
       * ```
       *
       * That series will now be available for use by studies, for example, but it will not display on the chart since no rendering details have been provided.
       *
       * If you wish to *display* your series, you must specify how you wish the series to be rendered.
       * At a minimum, you will need to indicate what color should be used to display the series. Like so:
       * ```
       * stxx.addSeries("IBM", {color:"blue"});
       * ```
       *
       * Once a series is added, it will be tracked in the CIQ.ChartEngine.Chart#series object.
       *
       * To remove a series call CIQ.ChartEngine#removeSeries
       *
       * To remove all series from a chart, simply iterate through the active series object and delete them one at a time:
       * ```
       * for(var s in stxx.chart.series){
       *    var series=stxx.chart.series[s];
       *    stxx.removeSeries(series);
       * }
       * ```
       *
       * Example 1 - manually add data to a chart and a series<iframe width="100%" height="500" scrolling="no" seamless="seamless" align="top" style="float:top" src="https://jsfiddle.net/chartiq/avem0zcx/embedded/result,js,html/" allowfullscreen="allowfullscreen" frameborder="1"></iframe>
       *
       * The above example adds a series as an overlay, but a more common use case is to display series as comparisons.
       * Comparisons are special because they change the chart from a price chart to a percentage chart.
       * All series on the chart then begin at "zero", on the left side of the chart.
       * Set isComparison=true when adding a series to make it a comparison chart.  As long as a comparison series is on a chart, the chart will display its y-axis in percent scale
       * provided CIQ.ChartEngine.Chart#forcePercentComparison is true.
       * ```
       * stxx.addSeries("IBM", {color:"blue", isComparison:true});
       * ```
       *
       * **Complex Visualizations**
       *
       * Example 2 - use a custom renderer to display a series<iframe width="100%" height="500" scrolling="no" seamless="seamless" align="top" style="float:top" src="https://jsfiddle.net/chartiq/b6pkzrad/embedded/result,js,html/" allowfullscreen="allowfullscreen" frameborder="1"></iframe>
       *
       * Behind the scenes, series are displayed by [renderers]CIQ.Renderer.
       * Renderers can plot lines, mountains, bars, candles, and other types of visualizations.
       +* When adding a series, you can specify which renderer to use and set parameters to control your visualization.
       * For instance, this will display a series as a bar chart on its own left axis:
       * ```
       * stxx.addSeries(
       * 		"SNE",
       * 		{
       * 			display:"Sony",
       * 			renderer:"Bars",
       * 			name:"test",
       * 			yAxis:{
       * 				position:"left",
       * 				textStyle:"#FFBE00"
       * 			}
       * 		}
       * );
       * ```
       * Which is the same as explicitly declaring a renderer and then attaching it to the series:
       * ```
       * stxx.addSeries(
       * 		"SNE",
       * 		{
       * 			display:"Sony"
       * 		},
       * 		function(){
       * 			// create the axis
       * 			var axis=new CIQ.ChartEngine.YAxis({position:"left", textStyle:"#FFBE00"});
       *
       * 			//create the renderer and attach
       * 			var renderer=stxx.setSeriesRenderer(
       * 				new CIQ.Renderer.Bars({params:{name:"test", yAxis:axis}})
       * 			);
       * 			renderer.attachSeries("SNE").ready();
       * 		}
       * );
       * ```
       * The above 2 calls do exactly the same thing, just using different syntax.
       *
       * All parameters specified in addSeries will be passed on to the selected renderer. As such, every parameter available for the selected renderer can be used here to further customize the series.
       * For example, to add a step line, you would select a [Lines]CIQ.Renderer.Lines renderer, and then set its `step` attribute, right trough the addSeries API call.
       * ```
       * stxx.addSeries(
       * 		"SNE",
       * 		{
       * 			renderer:"Lines",
       * 			step:true,
       * 		}
       * );
       * ```
       *
       * **Advanced Visualizations**
       *
       * Some renderers are capable of rendering *multiple series*.
       * For instance, the [Histogram]CIQ.Renderer.Histogram can display series stacked on top of one another.
       * Use `[setSeriesRenderer()]CIQ.ChartEngine#setSeriesRenderer` in this case.
       * Here is how we would create a stacked histogram from several series:
       * ```
       * var myRenderer=stxx.setSeriesRenderer(new CIQ.Renderer.Histogram({params:{subtype:"stacked"}}));
       *
       * stxx.addSeries("^NIOALL", {},
       * 		function() {myRenderer.attachSeries("^NIOALL","#6B9CF7").ready();}
       * );
       * stxx.addSeries("^NIOAFN", {},
       * 		function() {myRenderer.attachSeries("^NIOAFN","#95B7F6").ready();}
       * );
       * stxx.addSeries("^NIOAMD", {},
       * 		function() {myRenderer.attachSeries("^NIOAMD","#B9D0F5").ready();}
       * );
       * ```
       *
       * Example 3 - advanced stacked histogram renderer<iframe width="100%" height="500" scrolling="no" seamless="seamless" align="top" style="float:top" src="https://jsfiddle.net/chartiq/rb423n71/embedded/result,js,html/" allowfullscreen="allowfullscreen" frameborder="1"></iframe>
       *
       * **Using a Symbol Object**
       *
       * The above examples all assumed your chart uses "tickers" (stock symbols).
       * We refer to complex (compound) symbols as "Symbol Objects" (see CIQ.ChartEngine#loadChart).
       * Here's how to set a series with a symbol object:
       * ```
       * stxx.addSeries(null, {color:"blue", symbolObject:yourSymbolObject});
       * ```
       *
       * **Setting a separate YAxis**
       *
       * By default, series are displayed without a y-axis.
       * They are either "overlayed" on the main chart, or if they are comparisons then they share the standard y-axis.
       * But a series can also take an optional y-axis which can be displayed on the left, or the right side of the chart.
       * To do this, you must specify parameters for a [YAxis]CIQ.ChartEngine.YAxis object and pass to addSeries:
       * ```
       * stxx.addSeries("IBM", {color:"blue", yAxis:{ position:"left" }});
       * ```
       *
       * **Understanding the relationship between [setSeriesRenderer()]CIQ.ChartEngine#setSeriesRenderer and [importLayout]CIQ.ChartEngine#importLayout**
       *
       * It is important to know that a renderer explicitly created using [setSeriesRenderer()]CIQ.ChartEngine#setSeriesRenderer will **not** be stored in the layout serialization.
       * If your implementation will require the complete restoration of a chart layout, you must instead use the syntax that includes all of the renderer parameters as part of this addSeries call.
       *
       *
       * @param [id] The name of the series. If not passed then a unique ID will be assigned. (parameters.symbol and parameters.symbolObject will default to using id if they are not set explicitly *and* id is supplied.)
       * @param [parameters] Parameters to describe the series. Any valid [attachSeries parameters]CIQ.Renderer#attachSeries and [renderer parameters]CIQ.Renderer will be passed to attached renderers.
       * @param [parameters.renderer=CIQ.Renderer.Lines] <span class="injection">Rendering</span> Set to the desired [renderer]CIQ.Renderer for the series.
       * - If not set, defaults to [Lines]CIQ.Renderer.Lines when `color` is set.
       * - Not needed for hidden series.
       * @param [parameters.name] <span class="injection">Rendering</span> Set to specify renderer's name.  Otherwise id will be used.
       * @param [parameters.display=id/symbol] <span class="injection">Rendering</span> Set to the text to display on the legend. If not set, the id of the series will be used (usually symbol).  If id was not provided, will default to symbol.
       * @param [parameters.symbol=id] <span class="injection">Data Loading</span> The symbol to fetch in string format. This will be sent into the fetch() function, if no data is provided.  If no symbol is provided, series will use the `id` as the symbol. If both `symbol` and `symbolObject` are set, `symbolObject` will be used.
       * @param [parameters.symbolObject=id] <span class="injection">Data Loading</span> The symbol to fetch in object format. This will be sent into the fetch() function, if no data is provided. If no symbolObject is provided, series will use the `id` as the symbol. You can send anything you want in the symbol object, but you must always include at least a 'symbol' element. If both `symbol` and `symbolObject` are set, `symbolObject` will be used.
       * @param [parameters.field=Close/Value] <span class="injection">Data Loading</span> Specify an alternative field to draw data from (other than the Close/Value). Must be present in your pushed data objects or returned from the quoteFeed.
       * @param [parameters.isComparison=fasle] <span class="injection">Rendering</span> If set to true, shareYAxis is automatically set to true to display relative values instead of the primary symbol's price labels. CIQ.ChartEngine#setComparison is also called and set to `true`. This is only applicable when using the primary Y axis, and should only be used with internal addSeries renderers.
       * @param [parameters.shareYAxis=false] <span class="injection">Rendering</span>
       * - Set to `true` so that the series shares the primary Y-axis and renders along actual values and print its corresponding current price label on the y axis.
       * - When set to `false`, the series will not be attached to a y axis. Instead it is superimposed on the chart; taking over its entire height, and maintaining the relative shape of the line. No current price will be displayed. Superimposing the ‘shape’ of one series over a primary chart, is useful when rendering multiple series that do not share a common value range.
       * - This setting will automatically override to true if 'isComparison' is set.
       * - This setting is only applicable when using the primary Y axis and has no effect when using a renderer that has its own axis.
       * @param [parameters.marginTop=0] <span class="injection">Rendering</span> Percentage (if less than 1) or pixels (if greater than 1) from top of panel to set the top margin for the series.<BR>**Note:** this parameter is to be used on **subsequent** series rendered on the same axis. To set margins for the first series, CIQ.ChartEngine.YAxis#initialMarginTop needs to be used.<BR>**Note:** not applicable if shareYAxis is set.
       * @param [parameters.marginBottom=0] <span class="injection">Rendering</span> Percentage (if less than 1) or pixels (if greater than 1) from the bottom of panel to set the bottom margin for the series.<BR>**Note:** this parameter is to be used on **subsequent** series rendered on the same axis. To set margins for the first series, CIQ.ChartEngine.YAxis#initialMarginBottom needs to be used.<BR>**Note:** not applicable if shareYAxis is set.
       * @param [parameters.width=1] <span class="injection">Rendering</span> Width of line in pixels
       * @param [parameters.minimum] <span class="injection">Rendering</span> Minimum value for the series. Overrides CIQ.minMax result.
       * @param [parameters.maximum] <span class="injection">Rendering</span> Maximum value for the series. Overrides CIQ.minMax result.
       * @param [parameters.color] <span class="injection">Rendering</span> Color used to draw the series line. Causes the line to immediately render an overlay. Only applicable for default or single-color renderers.
       * 		<p>Must be an RGB, RGBA, or three- or six&#8209;digit hexadecimal color number or <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/color_value" target="_blank"> CSS color keyword</a>; for example, "rgb(255, 0, 0)", "rgba(255, 0, 0, 0.5)", "#f00", "#FF0000", or "red".
       * 		<p>See CIQ.Renderer#attachSeries for additional color options.
       * @param [parameters.baseColor=parameters.color] <span class="injection">Rendering</span> Color for the base of a mountain series.
       * @param [parameters.pattern='solid'] <span class="injection">Rendering</span> Pattern to draw line, array elements are pixels on and off, or a string e.g. "solid", "dotted", "dashed"
       * @param [parameters.fillGaps] <span class="injection">Data Loading</span> If CIQ.ChartEngine#cleanupGaps is enabled to clean gaps (not 'false'), you can use this parameter to override the global setting for this series.
       * - If `fillGaps` not present
       *   - No gaps will be filled for the series.
       * - If `fillGaps` is set to 'false'
       *   - No gaps will be filled for the series.
       * - If `fillGaps` is set to 'true',
       *   - Gap filling will match CIQ.ChartEngine#cleanupGaps.
       * - If `fillGaps` is set to  'carry' or 'gap'
       *   - Will use that filling method even if `cleanupGaps` is set differently.
       * @param [parameters.gapDisplayStyle=true] <span class="injection">Rendering</span> Defines how (or if) to **render** (style) connecting lines where there are gaps in the data (missing data points), or isolated datapoints.
       * - Applicable for line-like renderers only (lines, mountains, baselines, etc).
       * - Default:
       *   - `true` for standard series.
       *   - `false` for comparisons.
       * - Set to `true` to use the color and pattern defined by CIQ.ChartEngine#setGapLines for the chart.
       * - Set to `false` to always show gaps.
       * - Set to an actual color string or custom color-pattern object as formatted by CIQ.ChartEngine#setGapLines to define more custom properties.
       * - 'Dots' indicating isolated items will be shown unless a `transparent` color/style is specified.
       * - If not set, and the series is a comparison, the gaps will always be rendered transparent.
       * @param [parameters.fillStyle] <span class="injection">Rendering</span> Fill style for mountain chart (if selected). For semi-opaque use rgba(R,G,B,.1).  If not provided a gradient is created with color and baseColor.
       * @param [parameters.permanent=false] <span class="injection">Rendering</span> Set to `true` to activate. Makes series unremoveable by a user **when attached to the default renderer**. If explicitly linked to a renderer, see CIQ.Renderer#attachSeries for details on how to prevent an attached series from being removed by a user.
       * @param [parameters.data] <span class="injection">Data Loading</span> Data source for the series.
       * If this field is omitted, the library will connect to the QuoteFeed (if available) to fetch initial data ( unless `parameters.loadData` is set to `false`), and manage pagination and updates.
       * If data is sent in this field, it will be loaded into the masterData, but series will **not** be managed by the QuoteFeed (if available) for pagination or updates.
       * Items in this array *must* be ordered from earliest to latest date.
       * Accepted formats:
       * **Full OHLC:**
       * An array of properly formatted OHLC quote object(s). [See OHLC Data Format]{@tutorial InputDataFormat}.
       * ----**Price Only:**
       * An array of objects, each one with the followng elements:
       * @param [parameters.data.DT] JavaScript date object or epoch representing data point (overrides Date parameter if present)
       * @param [parameters.data.Date] string date representing data point ( only used if DT parameter is not present)
       * @param parameters.data.Value value of the data point ( As an alternative, you can send `parameters.data.Close` since your quote feed may already be returning the data using this element name)
       * @param [parameters.panel] <span class="injection">Rendering</span> The panel name on which the series should display. If the panel doesn't exist, one will be created. If `true` is passed, a new panel will also be created.
       * @param [parameters.action='add-series'] <span class="injection">Rendering</span> Overrides what action is sent in symbolChange events. Set to null to prevent a symbolChange event.
       * @param [parameters.loadData=true] <span class="injection">Data Loading</span> Include and set to false if you know the initial data is already in the masterData array or will be loaded by another method. The series will be added but no data requested. Note that if you remove this series, the data points linked to it will also be removed which may create issues if required by the chart. If that is the case, you will need to manually remove from the renderer linked to it instead of the underlying series itself.
       * @param [parameters.extendToEndOfDataSet] <span class="injection">Rendering</span> Set to true to plot any gap at the front of the chart.  Automatically done for step charts (set to false to disable) or if parameters.gapDisplayStyle are set (see CIQ.ChartEngine#addSeries)
       * @param [parameters.displayFloatingLabel=false] <span class="injection">Rendering</span> Set to false to disable the display of a Y-axis floating label for this series.
       * @param [parameters.baseline] <span class="injection">Rendering</span> If a boolean value, indicates whether the series renderer draws a baseline. If an object, must be the equivalent of CIQ.ChartEngine.Chart#baseline.
       * @param [cb] Callback function to be executed once the fetch returns data from the quoteFeed. It will be called with an error message if the fetch failed: `cb(err);`. Only applicable if no data is provided.
       * @return The series object.
       *
       * @since
       * - 04-2015 If `isComparison` is true shareYAxis is automatically set to true and setComparison(true) called. createDataSet() and draw() are automatically called to immediately render the series.
       * - 15-07-01 If `color` is defined and chartStyle is not set then it is automatically set to "line".
       * - 15-07-01 Ability to use setSeriesRenderer().
       * - 15-07-01 Ability to automatically initialize using the quoteFeed.
       * - 15-07-01 `parameters.quoteFeedCallbackRefresh` no longer used. Instead if `parameters.data.useDefaultQuoteFeed` is set to `true` the series will be initialized and refreshed using the default quote feed. (Original documentation: `{boolean} [parameters.quoteFeedCallbackRefresh]` Set to true if you want the series to use the attached quote feed (if any) to stay in sync with the main symbol as new data is fetched (only available in Advanced package).)
       * - 2015-11-1 `parameters.symbolObject` is now available.
       * - 05-2016-10 `parameters.forceData` is now available.
       * - 09-2016-19 `parameters.data.DT` can also take an epoch number.
       * - 09-2016-19 `parameters.data.useDefaultQuoteFeed` no longer used. If no `parameters.data` is provided the quotefeed will be used.
       * - 3.0.8 `parameters.forceData` no longer used, now all data sent in will be forced.
       * - 3.0.8 `parameters.loadData` added.
       * - 4.0.0 Added `parameters.symbol` (string equivalent of parameters.symboObject).
       * - 4.0.0 Multiple series can now be added for the same underlying symbol. parameters.field or parameters.symbolObject can be used to accomplish this.
       * - 4.0.0 Added `parameters.baseColor`.
       * - 5.1.0 Series data now added to masterData as an object. This allows storage of more than just one data point, facilitating OHLC series!
       * - 5.1.0 addSeries will now create a renderer unless renderer, name and color parameters are all omitted.
       * - 5.1.0 Now also dispatches a "symbolChange" event when pushing data into the chart, rather than only when using a quote feed.
       * - 5.1.1 Added `parameters.extendToEndOfDataSet`.
       * - 5.1.1 `parameters.chartType`, originally used to draw "mountain" series, has been deprecated in favor of the more flexible 'renderer' parameter. It is being maintained for backwards compatibility.
       * - 5.2.0 `parameters.gaps` has been deprecated (but maintained for backwards compatibility) and replaced with `parameters.gapDisplayStyle`.
       * - 6.0.0 `parameters.fillGaps` is now a string type and can accept either "carry" or "gap".  Setting to true will use the value of stxx.cleanupGaps.
       * - 6.2.0 No longer force 'percent'/'linear', when adding/removing comparison series, respectively, unless CIQ.ChartEngine.Chart#forcePercentComparison is true. This allows for backwards compatibility with previous UI modules.
       * - 6.3.0 If a panel name is passed into the function, a new panel will be created if one doesn't already exist.
       * - 6.3.0 Added `parameters.displayFloatingLabel`.
       * - 8.1.0 Supports custom baselines. See example.
       * - 8.2.0 Added `parameters.baseline`.
       *
       * @example <caption>Add a series overlay and display it as a dashed line.</caption>
       * stxx.addSeries(
       *		"IBM",
       *		{color:"purple", pattern:[3,3]}
       * );
       *
       * @example <caption>Add a series onto the main axis and then create a moving average study that uses it.</caption>
       * // Note, this will work for any study that accepts a "Field" parameter.
       *
       *	stxx.addSeries("ge", {color:"yellow", shareYAxis:true}, function(){
       *		let inputs = {
       *	        "Period": 20,
       *	        "Field": "ge",
       *	        "Type": "ma"
       *	    };
       *	    let outputs = {
       *	        "MA": "red"
       *	    };
       *	    CIQ.Studies.addStudy(stxx, "ma", inputs, outputs);
       *	});
       *
       * @example <caption>Add series using a symbolObject which includes the data source key.</caption>
       * // This key will be sent into the fetch 'params' for use in your quoteFeed.
       * let mySymbol = {symbol:"GE", source:"realtimedb"};
       * let mySymbol2 = {symbol:"GDP", source:"fundamentaldb"};
       *
       * stxx.addSeries(null, {color:"purple", symbolObject:mySymbol});
       * stxx.addSeries(null, {color:"green", symbolObject:mySymbol2});
       *
       * @example <caption>Set a custom field.</caption>
       * // The engine is smart enough to use the series symbol, or "Close" if the symbol doesn't exist in the returned data from your quotefeed
       * // but if you want to use any other field then you'll need to specify it like this.
       * stxx.addSeries("GE", {color:"purple", field: "Open"});
       *
       * @example <caption>Add the comparison series with a color to immediately render using default renderer (as lines) and dashes for gaps fillers.</caption>
       *	stxx.addSeries(symbol1, {display:"Description 1",isComparison:true,color:"purple", gapDisplayStyle:{pattern:[3,3]},width:4,permanent:true});
       *	stxx.addSeries(symbol2, {display:"Description 2",isComparison:true,color:"pink", gapDisplayStyle:{pattern:[3,3]},width:4});
       *	stxx.addSeries(symbol3, {display:"Description 3",isComparison:true,color:"brown", gapDisplayStyle:{pattern:[3,3]},width:4});
       *
       * @example <caption>Add the series with only default parameters (no color).</caption>
       *	// The series will not display on the chart after it is added,
       *	// but the data will be available ready to be attached to a renderer.
       *	stxx.addSeries(symbol1, {display:"Description 1"});
       *	stxx.addSeries(symbol2, {display:"Description 2"});
       *	stxx.addSeries(symbol3, {display:"Description 3"});
       *
       * @example <caption>Add a series with a color to immediately render.</caption>
       * // It also calls callbackFunct after the data is returned from the fetch.
       *	function callbackFunct(field){
       *		 return function(err) {
       *			CIQ.alert(field);
       *		}
       *	}
       *
       *	stxx.addSeries(symbol1, {display:"Description",color:"brown"}, callbackFunct(symbol1));
       *
       * @example <caption>Add a stacked historam with three series usng an external renderer.</caption>
       *
       * // Note how the addSeries callback is used to ensure the data is present before the series is displayed.
       *
       * // Configure the histogram display.
       * let params={
       *	name:				"Sentiment Data",
       *	subtype:			"stacked",
       *	heightPercentage:	.7,	 // How high to go. 1 = 100%
       *	opacity:			.7,  // Alternatively can use rgba values in histMap instead
       *	widthFactor:		.8	 // to control space between bars. 1 = no space in between
       * };
       *
       * // Legend creation callback.
       * function histogramLegend(colors){
       * 	stxx.chart.legendRenderer(stxx,{legendColorMap:colors, coordinates:{x:260, y:stxx.panels["chart"].yAxis.top+30}, noBase:true});
       * }
       *
       * let histRenderer=stxx.setSeriesRenderer(new CIQ.Renderer.Histogram({params: params, callback: histogramLegend}));
       *
       * stxx.addSeries("^NIOALL", {display:"Symbol 1"}, function() {histRenderer.attachSeries("^NIOALL","#6B9CF7").ready();});
       * stxx.addSeries("^NIOAFN", {display:"Symbol 2"}, function() {histRenderer.attachSeries("^NIOAFN","#95B7F6").ready();});
       * stxx.addSeries("^NIOAMD", {display:"Symbol 3"}, function() {histRenderer.attachSeries("^NIOAMD","#B9D0F5").ready();});
       *
       * @example <caption>Add a series overlay for data that *already exists in the chart*.</caption>
       * // By setting loadData to false, the chart will assume the data exists, and not request it from the quotefeed.
       * stxx.addSeries(
       *		"Close",
       *		{color:"purple", loadData:false}
       * );
       *
       * @example <caption>Add multiple series and attach them all to the same renderer with a custom y-axis on the left.</caption>
       *	// See this example working here: https://jsfiddle.net/chartiq/b6pkzrad.
       *
       *	// Note how the addSeries callback is used to ensure the data is present before the series is displayed.
       *
       *    stxx.addSeries(
       *    "NOK",
       *    {
       *      renderer: "Lines",              // Create a line renderer
       *      type: "mountain",               // of mountain type
       *      yAxis: {                        // and give it its own y axis
       *          position: "left",           // on the left
       *          textStyle: "#0044FF",       // with labels of color #0044FF
       *          decimalPlaces: 0,           // no decimal places on the labels
       *          maxDecimalPlaces: 0,        // and no defimal places on the last price floating label either.
       *       },
       *        name: "left_axis_renderer",   // Call the custom renderer "left_axis_renderer", so it can be referenced by other series.
       *        color: "#FFBE00",             // Set the line color to "#FFBE00"
       *        width: 4,                     // and a width of 4.
       *        display: "NOK Sample",        // Finally, use a different display name of "NOK Sample" on the tooltip.
       *      },
       *      function(){
       *       stxx.addSeries(                // Now that the first series and rederer has been set
       *          "SNE",                      // add the 2nd series using that same renderer.
       *          {
       *            name: "left_axis_renderer",
       *            color: "#FF1300",
       *            display: "Sony Sample",
       *          }
       *        );
       *      }
       *   );
       *
       * @example <caption>Add a series with a colored bar renderer using default colors.</caption>
       * stxx.addSeries("MSFT",{renderer:"Bars", colored:true});
       *
       *	@example <caption>Add a candle series for GE, and display it's Bid and Ask.</caption>
       * // Assuming Bid/Ask data is NOT part of the initial data objects and can be fetched individually using different instrument IDs.
       * stxx.addSeries('ge',{renderer:'Candles',shareYAxis:true});
       * stxx.addSeries('geBid',{display:'Ge Bid',symbol:'ge',field:'Bid',color:'yellow',renderer:'Lines',shareYAxis:true});
       * stxx.addSeries('geAsk',{display:'Ge Ask',symbol:'ge',field:'Ask',color:'blue',renderer:'Lines',shareYAxis:true});
       *
       * @example <caption>Add a series with a candle renderer using custom colors.</caption>
       * stxx.addSeries("MSFT",
       *		{
       *			renderer:"Candles",
       *			fill_color_up:"magenta",
       *			border_color_up:"purple",
       *			fill_color_down:"lightgreen",
       *			border_color_down:"green"
       *		}
       * );
       *
       *@example <caption>Add a series with Histogram renderer using default colors.</caption>
       * stxx.addSeries('ge', {renderer:"Histogram", color: 'red'});
       *
       * @example <caption>Add a series with tension to cause the lines to be curved instead of straight.</caption>
       * // The "tension" parameter is a line renderer parameter.
       * // The 'renderer:"Lines"' parameter could theoretically be omitted since it is the default renderer.
       * stxx.addSeries('GE',{renderer:"Lines", type:'mountain',color:'yellow',tension:0.3})
       *
       * @example <caption>Display an inverted chart for instrument "T" using equations as symbols</caption>
       * // Note the formatter used to change the sign of the axis values.
       * let axis2 = new CIQ.ChartEngine.YAxis(
       * 		{
       * 			position:"left",
       * 			textStyle:"#FFBE00",
       * 			priceFormatter:function(stx, panel, price, decimalPlaces){return stx.formatYAxisPrice(price, panel, decimalPlaces)*-1}
       * 		}
       * );
       *
       * stxx.addSeries("=-1*T", {display:"Test",width:4,renderer:"Lines",color:"#FFBEDD",yAxis:axis2},function(){});
       *
       * // This will display the same series in the standard scale.
       * let axis3 = new CIQ.ChartEngine.YAxis({position:"left",textStyle:"#FFBE00"});
       * stxx.addSeries("T", {display:"Test",width:4,renderer:"Lines",color:"#FFBEDD",yAxis:axis3},function(){});
       *
       * @example <caption>Add a series that will use its own custom y-axis on the left.</caption>
       * // Note that the renderer does not need to be explicitly declared;
       * // nor does the y axis, since they will only belong to this one series.
       * // The addSeries call will take the pertinent parameters and internally
       * // create the required axis and render objects that will be associated with it.
       * stxx.addSeries("T",
       * 		{
       * 				display:"Test",
       * 				renderer:"Lines",
       * 				type:'mountain',
       * 				color:"#FFBEDD",
       * 				yAxis:{position:"left", textStyle:"#FFBE00"}
       * 		},
       * 		function(){console.log('This is a callback. All done.')}
       * );
       *
       * @example <caption>Use a renderer to display heat map data points.</caption>
       *  // Each attached series will represent a stream of colors for the heat map.
       *  // Note special data formatting, where the custom field that will be used for the stream of data points,
       *  // is an array of values -- 'Bids' in this example.
       *  let renderer = stxx.setSeriesRenderer(new CIQ.Renderer.Heatmap());
       *  stxx.addSeries(
       *   	"L2",
       * 			{ data:[
       *       		{DT:"2019-01-04",Bids:[100,100.3,100.2,101]},
       *       		{DT:"2019-01-07",Bids:[101,101.5,102,103]},
       *       		{DT:"2019-01-08",Bids:[101.2,101.5,101.7,102]},
       *        		{DT:"2019-01-09",Bids:[101.3,101.7,101.9]},
       *       		{DT:"2019-01-10",Bids:[102]}]
       *   		},
       *    	function(){
       *             renderer.attachSeries("L2", {field:"Bids",color:"#FF9300"}).ready();
       *   	}
       *  );
       *
       * @example <caption>Add a series with a custom baseline.</caption>
       * stxx.addSeries("GOOG", {baseline: {defaultLevel: 105}, color: "purple"});
       */
      addSeries(
        id?: string,
        parameters?: {
          renderer?: string,
          name?: string,
          display?: string,
          symbol?: string,
          symbolObject?: object,
          field?: string,
          isComparison?: boolean,
          shareYAxis?: boolean,
          marginTop?: number,
          marginBottom?: number,
          width?: number,
          minimum?: number,
          maximum?: number,
          color?: string,
          baseColor?: string,
          pattern?: any[]|string,
          fillGaps?: boolean|string,
          gapDisplayStyle?: object|string,
          fillStyle?: string,
          permanent?: boolean,
          data?: {
            Value: number,
            DT?: Date,
            Date?: string
          },
          panel?: string|boolean,
          action?: string,
          loadData?: boolean,
          extendToEndOfDataSet?: boolean,
          displayFloatingLabel?: boolean,
          baseline?: boolean|object
        },
        cb?: Function
      ): object
      /**
       * INJECTABLE
       *
       * Modifies an existing series. Any passed parameters [extend]CIQ.extend the existing parameters.
       *
       * @param descriptor Series to modify. Accepts the series object as returned by CIQ.ChartEngine#addSeries or series ID.
       * @param [parameters] The parameters to change or add.
       * @param [noRecurseDependents] If true, the panel and y-axis changes of the modified series do not propagate to the renderers of dependent series.
       * @return  The modified series object.
       *
       * @example <caption>Remove a series for a particular symbol.</caption>
       * function replaceComparisonColor(stx, symbol, color){
       *     for (let series in stx.chart.series) {
       *         let seriesParams = stx.chart.series[series].parameters;
       *         if (seriesParams.isComparison && seriesParams.symbol == symbol) {
       *             stx.modifySeries(series, {color: color});
       *         }
       *     }
       *     stx.draw();
       * }
       *
       * @example <caption>Set a custom baseline on an existing series.</caption>
       * stxx.modifySeries('GOOG', { baseline: { defaultLevel: 100 } })
       *
       * @since
       * - 5.1.1
       * - 5.2.0 No longer accepts a callback function.
       * - 7.1.0 Returns the modified series.
       * - 7.3.0 Synchronizes panel and y-axis changes with dependent renderers unless the new parameter,
       * 		`noRecurseDependents`, is set to true.
       * - 8.1.0 Supports custom baselines. See example.
       */
      modifySeries(
        descriptor: string|Object,
        parameters?: Object,
        noRecurseDependents?: boolean
      ): Object
      /**
       * INJECTABLE
       *
       * Detaches a series added using [addSeries]CIQ.ChartEngine#addSeries from **all associated renderers** in the chart,
       * removing the actual series data from masterData.
       *
       * If the series belonged to a renderer that no longer has other series attached to it, the renderer is removed as well.
       * See CIQ.Renderer#removeSeries for more details or how to remove a series from a single renderer and without ever deleting the associated renderer or data.
       *
       * To remove all series from a chart, simply iterate through the active series object and delete them one at a time:
       * ```
       * for(var s in stxx.chart.series){
       *    var series=stxx.chart.series[s];
       *    stxx.removeSeries(series);
       * }
       * ```
       * @param  field The name of the series to remove -OR- the series object itself.
       * @param  [chart] The chart object from which to remove the series
       * @since
       * - 4.0.0 Now supports passing a series descriptor instead of a field.
       * - 4.0.0 Series data is now totally removed from masterData if no longer used by any other renderers.
       * - 4.0.0 Empty renderers are now removed when series are removed.
       */
      removeSeries(field: string|object, chart?: CIQ.ChartEngine.Chart): void
      /**
       * Turns comparison charting on or off and sets the transform.
       *
       * Should not be called directly. Either use the CIQ.ChartEngine#addSeries `isComparison` parameter or use CIQ.ChartEngine#setChartScale
       *
       * @param mode Type of comparison ("percent" or "relative").
       *  - Setting to true will enable "percent".
       *  - Setting to "relative" will allow the comparisons to be rendered in relation to any provided 'basis' value. For example, the previous market day close price.
       * @param [chart] The specific chart for comparisons
       * @param [basis] For a "relative" mode, the basis to relate to.  Can be a number or a string.  If a string, will use the first price in the datasegment for the series keyed by the string.  Sets CIQ.Comparison.initialPrice.
       * @since
       * - 04-2015 Signature has been revised.
       * - 5.1.0 Signature revised again, added basis.
       * - 5.1.0 `mode` now also supports "relative" to allow comparisons to be rendered in relation to any provided value.
       */
      setComparison(
        mode: string|boolean,
        chart?: CIQ.ChartEngine.Chart,
        basis?: number|string
      ): void
      /**
       * Sets the chart scale.
       * @param chartScale
       *  - Available options:
       * 	 - "log"
       * 		> The logarithmic scale can be helpful when the data covers a large range of values – the logarithm reduces this to a more manageable range.
       * 	 - "linear"
       * 		> This is the standard y axis scale; where actual prices are displayed in correlation to their position on the axis, without any conversions applied.
       * 	 - "percent"
       * 		> Calculations for the "percent" scale, used by comparisons, are based on the change between the first visible bar to the last visible bar.
       * 		> This is so you can always see relevant information regardless of period.
       * 		> Let's say you are looking at a chart showing a range for the current month. The change will be the difference from the beginning of the month to today.
       * 		> If you now zoom or change the range to just see this past week, then the change will reflect that change from the first day of the week to today.
       * 		> This is how most people prefer to see change, sine it is dynamically adjusted to the selected range. If you want to see today's change, just load today's range.
       * 		> Keep in mind that there is a difference between the change from the beginning of the day, and the change from the beginning of the trading day. So be careful to set the right range.
       * 	 - "relative"
       * 		> Very similar to 'percent' but the baseline value can be explicitly set.
       * 		> This is useful if you wish to baseline your comparisons on secondary series, or even a hard coded value ( ie: opening price for the day).
       * 		> See CIQ.Comparison.initialPrice for details on how to set basis for "relative" scale.
       *
       * - Setting to "percent" or "relative" will call CIQ.ChartEngine#setComparison even if no comparisons are present; which sets `stxx.chart.isComparison=true`.
       * - To check if scale is in percentage mode use `stxx.chart.isComparison` instead of using the CIQ.ChartEngine#chartScale value.
       * - See CIQ.ChartEngine.Chart#forcePercentComparison for behavior of automatic scale setting and removal for [comparisons]CIQ.ChartEngine#addSeries.
       * @since
       * - 4.1.0 Added "percent".
       * - 5.1.0 Added "relative".
       */
      setChartScale(chartScale: string): void
      /**
       * QuoteFeed required if `params.noDataLoad` is set to `false`
       *
       * Imports a layout (panels, studies, candleWidth, etc) from a previous serialization. See CIQ.ChartEngine#exportLayout.
       *
       * There are three ways to use this method:
       * 1. Preset the layout object in the chart instance, but do not load any data.
       *    - This is usually used to restore an initial 'symbol independent' general layout (chart type and studies mainly) that will then take effect when `loadChart` is subsequently called.
       *    - In this case, exportedLayout should be called using 'withSymbols=false' and the importLayout should have 'noDataLoad=true'.
       * 2. Load an entire new chart and its data, including primary symbol, additional series, studies, chart type, periodicity and range:
       *    - In this case, you should not need call loadChart, setPeriodicity setSpan or setRange, addStudy, etc. since it is all restored from the previously exported layout and loaded using the attached quoteFeed.
       *    - If you still wish to change periodicity, span or range, you must use the CB function to do so.
       *    - In this case, exportedLayout should be called  using 'withSymbols=true' and the importLayout should have 'noDataLoad=false' and 'managePeriodicity=true'.
       * 3. Reset layout on an already existing chart without changing the primary symbol or adding additional symbols:
       *    - This is used when restoring a 'view' on an already existing chart from a previous `loadChart` call. The primary symbol remains the same, no additional series are added, but periodicity, range, studies and chart type are restored from the previously serialized view.
       *    - In this case, exportedLayout should be called  using 'withSymbols=false', and importLayout should have 'noDataLoad=false', managePeriodicity=true', and 'preserveTicksAndCandleWidth=true'.
       *
       * **Important Notes:**
       * - Please note that [studyOverlayEdit]CIQ.ChartEngine~studyOverlayEditEventListener and [studyPanelEdit]CIQ.ChartEngine~studyPanelEditEventListener event listeners must be set *before* you call CIQ.ChartEngine#importLayout.
       * Otherwise your imported studies will not have edit capabilities.
       *
       * - When symbols are loaded, this function will set the primary symbol (first on the serialized symbol list) with CIQ.ChartEngine#loadChart
       * and any overlayed symbol with CIQ.ChartEngine#addSeries. You must be using a QuoteFeed to use this workflow.
       *
       * - This method will not remove any currently loaded [series]CIQ.ChartEngine#addSeries.
       * If your restored layout should not include previously loaded series, you must first iterate trough the CIQ.ChartEngine.Chart#series object, and systematically call CIQ.ChartEngine#removeSeries on each entry.
       *
       * - When allowing this method to load data, do not call [addSeries]CIQ.ChartEngine#addSeries, [importDrawings]CIQ.ChartEngine#importDrawings or [loadChart]CIQ.ChartEngine#loadChart
       * in a way that will cause them to run simultaneously with this method, or the results of the layout load will be unpredictable.
       * Instead use this method's callback to ensure data is loaded in the right order.
       *
       * - Since spans and ranges require changes in data and periodicity,
       * they are only imported if params.managePeriodicity is set to true and params.noDataLoad is set to false.
       * If both range and span are present, range takes precedence.
       *
       * @param config A serialized layout generated by CIQ.ChartEngine#exportLayout.
       * @param [params] Layout behavior parameters.
       * @param [params.noDataLoad] If true, then any automatic data loading from the quotefeed will be skipped, including setting periodicity, spans or ranges.
       * 		<p>Data can only be loaded if a quote feed is attached to the chart.
       * @param [params.managePeriodicity] If true, then the periodicity will be set from the layout, otherwise periodicity will remain as currently set.
       * 		<p>If the span/range was saved in the layout, it will be restored using the most optimal periodicity as determined by CIQ.ChartEngine#setSpan.
       * 		<p>Periodicity can only be managed if a quote feed is attached to the chart.
       * 		<p>Only applicable when noDataLoad = false.
       * 		<p>See CIQ.ChartEngine#setPeriodicity for additional details.
       * @param [params.preserveTicksAndCandleWidth] If true then the current candleWidth (horizontal zoom) and scroll (assuming same periodicity) will be maintained and any spans or ranges present in the config will be ignored. Otherwise candle width and span/ranges will be taken from the config and restored.
       * @param [params.cb] An optional callback function to be executed once the layout has been fully restored.
       * @param [params.seriesCB] An optional callback function to be executed after each series is restored (to be added to each CIQ.ChartEngine#addSeries call).
       * @since
       * - 05-2016-10 Symbols are also loaded if included on the serialization.
       * - 2016-06-21 `preserveTicksAndCandleWidth` now defaults to true.
       * - 3.0.0 Added `noDataLoad` parameter.
       * - 5.1.0 Will now also import extended hours settings.
       * - 5.1.0 Imports the range from layout if it is there to preserve between sessions.
       * - 5.2.0 spans and ranges are only executed if managePeriodicity is true and preserveTicksAndCandleWidth is false.
       */
      importLayout(
        config: object,
        params?: {
          noDataLoad?: boolean,
          managePeriodicity?: boolean,
          preserveTicksAndCandleWidth?: boolean,
          cb?: Function,
          seriesCB?: Function
        }
      ): void
      /**
       * Exports the current layout into a serialized form. The returned object can be passed into CIQ.ChartEngine#importLayout to restore the layout at a future time.
       *
       * This method will also save any programmatically activated [range]CIQ.ChartEngine#setRange or [span]CIQ.ChartEngine#setSpan setting that is still active.
       *
       * > **Note:** A set range or span that is manually modified by a user when zooming, panning, or changing periodicity will be nullified.
       * > So, if you wish to always record the current range of a chart for future restoration, you must use the following process:
       *
       * > 1- Add the following injection to save the range on every draw operation:
       * > ```
       * > stxx.append("draw", function() {
       * >    console.log('recording range');
       * >     delete stxx.layout.setSpan;
       * >     stxx.layout.range={padding: stxx.preferences.whitespace,
       * >        dtLeft: stxx.chart.dataSegment[0].DT,
       * >        dtRight: stxx.chart.dataSegment[stxx.chart.dataSegment.length - 1].DT,
       * >         periodicity: {
       * >             period: stxx.layout.periodicity,
       * >             interval: stxx.layout.interval,
       * >             timeUnit: stxx.layout.timeUnit
       * >         }
       * >     }
       * >     saveLayout({stx:stxx});
       * > });
       * > ```
       *
       * > 2- Make sure you call [importLayout]CIQ.ChartEngine#importLayout with params `preserveTicksAndCandleWidth` set to `false`
       *
       * > More on injections here: {@tutorial Using the Injection API}
       *
       * @param withSymbols If `true`, include the chart's current primary symbol and any secondary symbols from any CIQ.ChartEngine#addSeries operation, if using a quote feed. Studies will be excluded from this object. The resulting list will be in the `symbols` element of the serialized object.
       * @return The serialized form of the layout.
       * @since
       * - 05-2016-10 Added the `withSymbols` parameter.
       * - 5.0.0 `obj.symbols` is explicitly removed from the serialization when `withSymbols` is not true.
       */
      exportLayout(withSymbols: boolean): object
      /**
       * Imports a users preferences from a saved location and uses them in the ChartEngine
       * To save preferences see CIQ.ChartEngine#exportPreferences
       * @param preferences An object of CIQ.ChartEngine#preferences
       * @since 4.0.0
       */
      importPreferences(preferences: object): void
      /**
       * Exports the CIQ.ChartEngine#preferences for external storage.
       * Can then be imported again after being parsed with CIQ.ChartEngine#importPreferences
       * @returns
       * @since 4.0.0
       */
      exportPreferences(): typeof CIQ.ChartEngine.prototype.preferences
      /**
       * INJECTABLE
       *
       * This function is called when a highlighted study overlay is right clicked. If the overlay has an edit function (as many studies do), it will be called. Otherwise it will remove the overlay
       * @param  name The name (id) of the overlay
       * @param  [forceEdit] If true then force edit menu
       */
      rightClickOverlay(name: string, forceEdit?: boolean): void
      /**
       * INJECTABLE
       *
       * Registers an activated overlay study with the chart.
       *
       * This is the recommended method for registering an overlay study, rather than directly manipulating the [stxx.overlays]CIQ.ChartEngine#overlays object.
       * @param sd The study object
       * @since 5.2.0
       */
      addOverlay(sd: CIQ.Studies.StudyDescriptor): void
      /**
       * INJECTABLE
       *
       * Removes an overlay (and the associated study)
       * @param  name The name (id) of the overlay
       */
      removeOverlay(name: string): void
      /**
       * Convenience method to programmatically set a theme of the chart.
       *
       * Note that you should set any css classes on the chart context before calling this method
       *
       * @param  [settings] A CIQ.ThemeHelper#settings object, or null to reset to default settings
       * @example
       * document.querySelector("cq-context").classList.add("ciq-night");
       * stxx.setThemeSettings();  // reset to night theme
       * var settings=CIQ.clone(CIQ.ThemeHelper.prototype.settings);   // default night theme settings
       * settings.chart.Background.color="red";   // customize by changing background color
       * stxx.setThemeSettings(settings);  // execute custom setting
       *
       * @since 6.3.0
       */
      setThemeSettings(settings?: object): void
      /**
       * INJECTABLE
       *
       * This method captures a tap event (single click) on a touch device. It supports both touch and pointer events.
       * @param  finger Which finger is pressed
       * @param  x	   X location on screen of the press
       * @param  y	   Y location on screen of the press
       */
      touchSingleClick(finger: number, x: number, y: number): void
      /**
       * INJECTABLE
       *
       * Detects a double-tap on a touch device. Circumvents
       * CIQ.ChartEngine#touchSingleClick.
       *
       * @param finger The finger that double-tapped.
       * @param x The x-axis location of the double-tap event.
       * @param y The y-axis location of the double-tap event.
       *
       * @since 8.0.0 No longer deletes overlays, series, or drawings or returns the chart to home when
       * 		the user taps an axis.
       */
      touchDoubleClick(finger: number, x: number, y: number): void
      /**
       * INJECTABLE
       *
       * Handler for touch move events. This supports both touch (Apple) and pointer (Windows) style events.
       * Zooming through pinch is handled directly in this method but otherwise most movements are passed to CIQ.ChartEngine#mousemoveinner.
       * If CIQ.ChartEngine#allowThreeFingerTouch is true then a three finger movement will increment periodicity.
       * @param  e The event
       */
      touchmove(e: Event): void
      /**
       * INJECTABLE
       *
       * Event callback for when the user puts a new finger on the touch device. This supports both touch (Apple) and pointer (Windows) events.
       * It is functionally equivalent to CIQ.ChartEngine#mousedown.
       * Set CIQ.ChartEngine#ignoreTouch to true to bypass all touch event handling.
       * @param  e The touch event
       */
      touchstart(e: Event): void
      /**
       * INJECTABLE
       *
       * Event handler for when a touch ends. If this occurs within 250 ms then CIQ.ChartEngine#touchSingleClick will be called.
       * If two end events occur within 500 ms then CIQ.ChartEngine#touchDoubleClick will be called.
       * If the user moves a significant enough distance between touch start and end events within 300ms then a swipe has occurred
       * and CIQ.ChartEngine#swipeMove will be called.
       * @param  e Touch event
       */
      touchend(e: Event): void
      /**
       * Convenience function that embeds a CIQ.Visualization in the canvas area. Embedding is accomplished
       * by placing the visualization object within the chart engine's canvas shim, an area
       * behind the main canvas. Placing an object in the canvas shim creates the appearance that the chart plot is
       * on top of the  object. If using the chart background canvas (the default), the object appears on top of the
       * gridlines and axes.
       *
       * Attributes are passed into `renderFunction`, so additional attributes can be added specific to the function.
       * **Note:** If a valid `container` attribute is supplied, that container will be cloned and appended into the
       * chart's `canvasShim`.
       *
       * @param attributes Parameters to be used when creating the object.
       * @param attributes.renderFunction The function that generates the object. Takes data and attributes
       * 		as arguments and returns an object element.
       * @param [attributes.container] Element that is cloned and used to contain the object
       * 		(or selector thereof). If omitted, a container element is created with 300 x 300 pixel dimensions.
       * @param [attributes.id] Optional id attribute to assign to the object.
       * @return A handle to the object created, see CIQ.Visualization.
       *
       * @since 7.4.0
       */
      embedVisualization(
        attributes: {
          renderFunction: Function,
          container?: HTMLElement|string,
          id?: string
        }
      ): CIQ.Visualization
      /**
       * Animation Loop
       *
       * Draws a generic heatmap for the chart.
       *
       * Use CIQ.Renderer.Heatmap if the histogram is composed of multiple series, each representing a different color group.
       *
       * Any parameters from CIQ.Renderer#attachSeries or CIQ.ChartEngine#addSeries
       *  will be passed on to this method and are valid when directly calling it from within a [study display function of a Custom Study]{@tutorial Using and Customizing Studies - Creating New Studies}.
       *
       *  For advanced heatmap implementations where all the data is received already with a color for each datapoint, use an injection that directly calls CIQ.ChartEngine#drawHeatmap as outlined in this example:
       * <iframe width="100%" height="500" scrolling="no" seamless="seamless" align="top" style="float:top" src="https://jsfiddle.net/chartiq/s27v0pt8/embedded/result,js,html/" allowfullscreen="allowfullscreen" frameborder="1"></iframe>
       *
       * @param params Parameters to control the heatmap itself
       * @param params.panel The name of the panel to put the heatmap on
       * @param params.name="Data" Name of the heatmap.
       * @param params.height Height of each cell, in yaxis units.  If omitted, will use (10 ^ 1-(chart.panel.decimalPlaces||chart.decimalPlaces))
       * @param params.widthFactor Width of each call as a percentage of the candleWidth, valid values are 0.00-1.00.
       * @param params.showSize If heatmap cells are presented in array format, set to true to display the size as text within the cell.
       * @param seriesParams Parameters to control color and opacity of each cell. Each array element of seriesParams is an object having the following members:
       * @param seriesParams.field Name of the field in the dataSet to use for the part in the stack
       * @param seriesParams.border_color Color to use to draw the border (null to not draw)
       * @param seriesParams.color Color to use to fill (null to not draw)
       * @param seriesParams.opacity Opacity to use to fill (0.0-1.0) or use alpha from colors.  Set to an object of the form {min:x,max:y}
       * 							to set opacity for each cell proportionally within that range, based on its percentage.
       * 							min - lowest opacity to use
       * 							max - highest opacity to use
       * @since
       * - 2015-11-1
       * - 6.2.0 Enhanced to allow array data of [price,size,alpha] so opacity can be individually set per cell.
       * - 6.2.0 Added `params.showSize`.
       */
      drawHeatmap(
        params: {
          panel: string,
          name: string,
          height: number,
          widthFactor: number,
          showSize: boolean
        },
        seriesParams: {
          field: string,
          border_color: string,
          color: string,
          opacity: number|object
        }
      ): void
      /**
       * Animation Loop
       *
       * This method draws either hollow or solid candles on the chart.
       *
       * It is called from within CIQ.Renderer#drawIndividualSeries if a `colorFunction` is provided.
       * If there is no color function, CIQ.ChartEngine#drawBarTypeChartInner is used for maximum performance.
       *
       * It is usually called in 2 passes, one for the inner part and again for the outline (border).
       *
       * This method should rarely if ever be called directly.  Use CIQ.Renderer.Candles or CIQ.ChartEngine#setChartType instead.
       *
       * Any parameters from CIQ.Renderer#attachSeries or CIQ.ChartEngine#addSeries
       *  will be passed on to this method and are valid when directly calling it from within a [study display function of a Custom Study]{@tutorial Using and Customizing Studies - Creating New Studies}.
       *
       * @param panel Panel object on which to draw the candles
       * @param colorFunction A function which accepts an CIQ.ChartEngine,quote, and mode as its arguments and returns the appropriate color for drawing that mode.  Returning a null will skip that bar
       * @param params Configuration parameters for the candles
       * @param [params.isOutline] True will draw the borders, False to draw the inside of the candle
       * @param [params.isHistogram] True if the candles represent a histogram, with the low set to 0
       * @param [params.isVolume] Set to true to indicate a volume candle chart, which has variable candle width
       * @param [params.field] Optionally set to a series field which has OHLC data stored beneath it in the dataSegment
       * @param  [params.highlight] Set to true to indicate plot is highlighted.
       * @param [params.yAxis=panel.yAxis] Set to specify an alternate y-axis
       * @return Data generated by the plot, such as colors used if a colorFunction was passed, and the vertices of the line (points).
       * @since 5.1.0 Introduced `params` object to encompass any future flags/fields. Added return object.
       */
      drawCandles(
        panel: CIQ.ChartEngine.Panel,
        colorFunction: Function,
        params: {
          isOutline?: boolean,
          isHistogram?: boolean,
          isVolume?: boolean,
          field?: string,
          highlight?: boolean,
          yAxis?: CIQ.ChartEngine.YAxis
        }
      ): object
      /**
       * Animation Loop
       *
       * This method draws the shadows (wicks) for candles on the chart.
       *
       * It is called from within CIQ.Renderer#drawIndividualSeries if a `colorFunction` is provided.
       * If there is no color function, CIQ.ChartEngine#drawBarTypeChartInner is used for maximum performance.
       *
       * This method should rarely if ever be called directly.  Use CIQ.Renderer.Candles or CIQ.ChartEngine#setChartType instead.
       *
       *  Any parameters from CIQ.Renderer#attachSeries or CIQ.ChartEngine#addSeries
       *  will be passed on to this method and are valid when directly calling it from within a [study display function of a Custom Study]{@tutorial Using and Customizing Studies - Creating New Studies}.
       *
       * @param  panel		Panel on which to draw the wicks
       * @param  colorFunction	  A function which accepts an CIQ.ChartEngine,quote, and mode as its arguments and returns the appropriate color for drawing that mode.  Returning a null will skip that bar
       * @param params Configuration parameters for the shadows
       * @param [params.isVolume] Set to true to indicate a volume candle chart, which has variable candle width
       * @param [params.field] Optionally set to a series field which has OHLC data stored beneath it in the dataSegment
       * @param  [params.highlight] Set to true to indicate plot is highlighted.
       * @param [params.yAxis=panel.yAxis] Set to specify an alternate y-axis
       * @since 5.1.0 Introduced `params` object to encompass any future flags/fields.
       */
      drawShadows(
        panel: CIQ.ChartEngine.Panel,
        colorFunction: Function,
        params: {
          isVolume?: boolean,
          field?: string,
          highlight?: boolean,
          yAxis?: CIQ.ChartEngine.YAxis
        }
      ): void
      /**
       * Animation Loop
       *
       * This method draws bars on the chart. It is called by CIQ.ChartEngine#displayChart if a custom `colorFunction` is defined.
       *
       * This method should rarely if ever be called directly.  Use CIQ.Renderer.Bars or CIQ.ChartEngine#setChartType instead.
       *
       * Any parameters from CIQ.Renderer#attachSeries or CIQ.ChartEngine#addSeries
       *  will be passed on to this method and are valid when directly calling it from within a [study display function of a Custom Study]{@tutorial Using and Customizing Studies - Creating New Studies}.
       *
       * @param  panel		Panel on which to draw the bars
       * @param  style The canvas style
       * @param  colorFunction	  A function which accepts an CIQ.ChartEngine and quote as its arguments and returns the appropriate color for drawing that mode.	Returning a null will skip that bar
       * @param  params	 Additional parameters
       * @param  [params.type]	Set to "hlc" to return a bar chart with no open tick
       * @param  [params.field] Optionally set to a series field which has OHLC data stored beneath it in the dataSegment
       * @param  [params.highlight] Set to true to indicate plot is highlighted.
       * @param  [params.yAxis=panel.yAxis] Set to specify an alternate y-axis
       * @return Data generated by the plot, such as colors used if a colorFunction was passed, and the vertices of the line (points).
       * @since
       * - 3.0.8 Added params argument to support custom-colored_hlc bars.
       * - 5.1.0 Added `field` and `yAxis` parameters.
       */
      drawBarChart(
        panel: CIQ.ChartEngine.Panel,
        style: object,
        colorFunction: Function,
        params: {
          type?: string,
          field?: string,
          highlight?: boolean,
          yAxis?: CIQ.ChartEngine.YAxis
        }
      ): object
      /**
       * Animation Loop
       *
       * Draws a "wave" chart.
       *
       * A wave chart extrapolates intraday movement from OHLC and creates 4 data points from a single
       * candle, for instance to create a pseudo-intraday chart from daily data.
       *
       * This method should rarely if ever be called directly.  Use CIQ.Renderer.Lines or CIQ.ChartEngine#setChartType instead.
       *
       * Any parameters from CIQ.Renderer#attachSeries or CIQ.ChartEngine#addSeries
       * will be passed on to this method and are valid when directly calling it from within a [study display function of a Custom Study]{@tutorial Using and Customizing Studies - Creating New Studies}.
       *
       * @param panel The panel on the chart engine instance on which to draw the wave chart
       * @param params Additional parameters controlling the rendering
       * @param [params.yAxis=panel.yAxis] Set to specify an alternate y-axis
       * @param [params.field] Set to a symbol to indicate a series within the dataSet to plot, rather than the main series
       * @param [params.highlight] Set to true to indicate plot is highlighted.
       * @return Data generated by the plot, such as colors used if a colorFunction was passed, and the vertices of the line (points).
       * @example
       *	// call it from the chart menu provided in the sample templates
       *	<li stxToggle="stxx.setChartType('wave')">Wave</li>
       * @since 5.1.0 Added `params` object and return value.
       */
      drawWaveChart(
        panel: string,
        params: {
          yAxis?: CIQ.ChartEngine.YAxis,
          field?: string,
          highlight?: boolean
        }
      ): object
      /**
       * Animation Loop
       *
       * Draws a scatter plot on the chart.
       *
       * Use CSS style stx_scatter_chart to control the scatter chart display as follows:
       *	- color				- Optional color
       *
       * This method should rarely if ever be called directly.  Use CIQ.Renderer.Scatter or CIQ.ChartEngine#setChartType instead.
       *
       * Any parameters from CIQ.Renderer#attachSeries or CIQ.ChartEngine#addSeries
       * will be passed on to this method and are valid when directly calling it from within a [study display function of a Custom Study]{@tutorial Using and Customizing Studies - Creating New Studies}.
       *
       * @param  panel The panel on which to draw
       * @param params Additional parameters controlling the rendering
       * @param [params.yAxis=panel.yAxis] Set to specify an alternate y-axis
       * @param  [params.field] Set to override the field to be plotted.  Default is chart.defaultPlotField which defaults to "Close"
       * @param  [params.color] Set to override the color of the plot.
       * @param  [params.highlight] Set to true to indicate plot is highlighted.
       * @param  [params.lineWidth=4] Line thickness in pixels
       * @return Data generated by the plot, such as colors used if a colorFunction was passed, and the vertices of the line (points).
       * @example
       *	// call it from the chart menu provided in the sample templates
       *	<li stxToggle="stxx.setChartType('scatterplot')">Scatter Plot</li>
       * @since
       * - 5.1.0 Added `params` and return value.
       * - 6.2.0 Added `lineWidth` parameter.
       */
      scatter(
        panel: CIQ.ChartEngine.Panel,
        params: {
          yAxis?: CIQ.ChartEngine.YAxis,
          field?: string,
          color?: string,
          highlight?: boolean,
          lineWidth?: string
        }
      ): object
      /**
       * Activates or deactivates repositioning on a drawings.
       * @param  drawing The drawing to activate. null to deactivate the current drawing.
       * @since 3.0.0
       */
      activateRepositioning(drawing: CIQ.Drawing): void
      /**
       * Moves the markers from one panel to another
       * Useful when renaming panels
       * @param  fromPanelName The panel to move markers from
       * @param  toPanelName The panel to move markers to
       * @since 2016-07-16
       */
      moveMarkers(fromPanelName: string, toPanelName: string): void
      /**
       * Figures out the position of a future marker but only if it is displayed on the screen.
       * @param  marker The marker to check
       */
      futureTickIfDisplayed(marker: CIQ.Marker): void
      /**
       * INJECTABLE
       * <span class="animation">Animation Loop</span>
       *
       * Iterates through all marker handlers, calling their corresponding custom `placementFunction` or CIQ.ChartEngine#defaultMarkerPlacement if none defined.
       */
      positionMarkers(): void
      /**
       * The above_candle and below_candle y-positioner will usually use the high and low to place the marker.
       * However, some chart renderings will draw the extent of the bar either inside or outside the high/low range.
       * For those chart types, this function will return the actual high/low to be used by the marker placement function.
       * This is only valid when CIQ.Renderer#highLowBars is true.
       * Currently this function will handle p&f and histogram chart types.
       * For any other chart type, define "markerHigh" and "markerLow" for each bar in the dataSet/dataSegment
       * and these will be honored and returned.
       * Note: This function may be used with any markerPlacement function to give the lowest and highest point of the bar.
       *
       * @param quote The bar's data.  This can come from the chart.dataSet
       * @return        The high and low for the marker
       * @since
       * - 3.0.0
       * - 6.2.0 Will consider `Open` and `Close` if `High` and/or `Low` are missing from quote.
       */
      getBarBounds(quote: Object): Object
      /**
       * Placement functions are responsible for positioning markers in their holder according to each marker's settings.
       * They are called directly form the draw() function in the animation loop.
       * Each Marker placement handler must have a corresponding `placementFunction` or this method will be used.
       *
       * `firstTick` and `lastTick` can be used as a hint as to whether to display a marker or not.
       *
       * See CIQ.Marker and {@tutorial Markers} for more details
       * @param params The parameters
       * @param params.arr The array of markers
       * @param params.panel The panel to display
       * @param params.firstTick The first tick displayed on the screen
       * @param params.lastTick The last tick displayed on the screen
       * @since 2015-09-01 On prior versions you must define your own default function. Example: `CIQ.ChartEngine.prototype.defaultMarkerPlacement = yourPlacementFunction;`.
       */
      defaultMarkerPlacement(
        params: {
          arr: any[],
          panel: object,
          firstTick: number,
          lastTick: number
        }
      ): void
      /**
       * Detaches a quote feed. On removal of the last quote feed, calls `quoteDriver.die()`.
       *
       * @param [quoteFeed] Optional quote feed object to detach. Omit to detach all quote feeds.
       * @since 7.3.0
       */
      detachQuoteFeed(quoteFeed?: object): void
      /**
       * Returns an array of series that match the given filters.
       *
       * If any series is an equation chart then the equation will be searched for the matching symbol.
       *
       * @param  params Parameters
       * @param [params.symbol] Filter for only series that contain this symbol
       * @param [params.symbolObject] Filter for only series that contain this symbolObject
       * @param [params.includeMaster] If true then the masterSymbol will be checked for a match too. A blank object will be returned. You should only use this if you're just using this to look for yes/no dependency on a symbol.
       * @param [params.chart] Chart object to target
       * @return        Array of series descriptors
       * @since 4.0.0
       */
      getSeries(
        params: {
          symbol?: string,
          symbolObject?: object,
          includeMaster?: boolean,
          chart?: CIQ.ChartEngine.Chart
        }
      ): any[]
      /**
       * INJECTABLE
       *
       * Removes series data from masterData and unregisters the series from `chart.series` without removing it from any associated renderers.
       * Also updates the [quoteFeed subscriptions]quotefeed.unsubscribe.
       * **Not recommended to be called directly.**
       * Instead use CIQ.ChartEngine#removeSeries to remove a series from all associated renderers,
       * or CIQ.Renderer#removeSeries to remove a series from a specific renderer.
       * @param  field The name of the series to remove -OR- the series object itself.
       * @param  chart The chart to remove from
       * @param [params] Parameters
       * @param [params.action="remove-series"] Action to be dispatched with symbolChange event
       * @since
       * - 4.0.0 Now supports passing a series descriptor instead of a field.
       * - 4.0.0 Series data is now totally removed from masterData if no longer used by any other renderers.
       * - 4.0.0 Empty renderers are now removed when series are removed.
       * - 6.3.0 deleteSeries now calls CIQ.ChartEngine#checkForEmptyPanel.
       */
      deleteSeries(
        field: string|object,
        chart: CIQ.ChartEngine.Chart,
        params?: {
          action?: string
        }
      ): void
      /**
       * Sets a chart to the requested date range.
       *
       * By default, the **Minimum Width** for a bar is `1px`. As such, there may be times when the requested data will not all fit on the screen, even though it is available.
       * See CIQ.ChartEngine#minimumCandleWidth for instructions on how to override the default to allow more data to display.
       *
       * When a quotefeed is attached to the chart (ver 04-2015 and up), and not enough data is available in masterData to render the requested range, setRange will request more from the feed.
       * Also, if no periodicity (params.periodicity) is supplied in the parameters, **it may	 override the current periodicity** and automatically choose the best periodicity to use for the requested range using the CIQ.ChartEngine#dynamicRangePeriodicityMap when CIQ.ChartEngine#autoPickCandleWidth is enabled,
       * or the use of the CIQ.ChartEngine#staticRangePeriodicityMap object when CIQ.ChartEngine#autoPickCandleWidth is **NOT** enabled.
       * So depending on your UI, **you may need to use the callback to refresh the periodicity displayed on your menu**.
       *
       * Therefore, if you choose to let setRange set the periodicity, you should **not** call setPeriodicity before or after calling this method.
       *
       * **For details on how this method can affect the way daily data is rolled up, see CIQ.ChartEngine#createDataSet**
       *
       * **If the chart is in `tick` periodicity, the periodicity will be automatically selected even if one was provided because in `tick` periodicity we have no way to know how many ticks to get to fulfill the requested range.**
       *
       * If there is no quotefeed attached (or using a version prior to 04-2015), then setRange will use whatever data is available in the masterData. So you must ensure you have preloaded enough to display the requested range.
       *
       * This function must be called after loadChart() creates a dataSet.
       *
       * **Layout preservation and the range**
       * The selected range will be recorded in the chart CIQ.ChartEngine#layout when it is requested through CIQ.ChartEngine#loadChart, or when you call setRange directly.
       * It is then used in CIQ.ChartEngine#importLayout and CIQ.ChartEngine#loadChart to reset that range, until a new range is selected.
       *
       * @param params  Parameters for the request
       * @param [params.dtLeft] Date to set left side of chart. If no left date is specified then the right edge will be flushed, and the same interval and period will be kept causing the chart to simply scroll to the right date indicated.<BR> **Must be in the exact same time-zone as the `masterdata`.** See CIQ.ChartEngine#setTimeZone and CIQ.ChartEngine#convertToDataZone for more details. <BR> If the left date is not a valid market date/time, the next valid market period forward will be used.
       * @param [params.dtRight] Date to set right side of chart. Defaults to right now. <BR> **Must be in the exact same time-zone as the `masterdata`.** See CIQ.ChartEngine#setTimeZone and CIQ.ChartEngine#convertToDataZone for more details. <BR> If the right date is not a valid market date/time, the next valid market period backwards will be used.
       * @param [params.padding] Whitespace padding in pixels to apply to right side of chart after sizing for date range. If not present then 0 will be used.
       * @param [params.chart] Which chart, defaults to "chart"
       * @param [params.goIntoFuture] If true then the right side of the chart will be set into the future if dtRight is greater than last tick. See CIQ.ChartEngine#staticRange if you wish to make this your default behavior.
       * @param [params.goIntoPast] If true then the left side of the chart will be set into the past if dtLeft is less than first tick. See CIQ.ChartEngine#staticRange if you wish to make this your default behavior.
       * @param [params.periodicity] Override a specific periodicity combination to use with the range. Only available if a quoteFeed is attached to the chart. Note: if the chart is in tick periodicity, the periodicity will be automatically selected even if one was provided because in tick periodicity we have no way to know how many ticks to get to fulfill the requested range. If used, all 3 elements of this object must be set.
       * @param params.periodicity.period Period as used by CIQ.ChartEngine#setPeriodicity
       * @param params.periodicity.interval An interval as used by CIQ.ChartEngine#setPeriodicity
       * @param params.periodicity.timeUnit A timeUnit as used by CIQ.ChartEngine#setPeriodicity
       * @param [params.pixelsPerBar] Optionally override this value so that the auto-periodicity selected chooses different sized candles.
       * @param [params.dontSaveRangeToLayout] If true then the range won't be saved to the layout.
       * @param [params.forceLoad] Forces a complete load (used by loadChart)
       * @param [cb] Callback method. Will be called with the error returned by the quotefeed, if any.
       * @since
       * - 04-2015 Added `params.rangePeriodicityMap` and `params.periodicity` as well as automatic integration with quotefeed.
       * - 2016-05-10 Deprecated `params.rangePeriodicityMap` in favor of new automatic algorithm.
       * - m-2016-12-01 Restored logic to reference a periodicity map. Similar to previous `params.rangePeriodicityMap`. See CIQ.ChartEngine#staticRangePeriodicityMap for details.
       * - m-2016-12-01 Modified automatic periodicity algorithm. See CIQ.ChartEngine#dynamicRangePeriodicityMap and CIQ.ChartEngine#autoPickCandleWidth for details.
       * - 4.0.0 Now uses CIQ.ChartEngine#needDifferentData to determine if new data should be fetched.
       * - 4.0.0 No longer defaulting padding to current value of `preferences.whiteSpace`.
       * - 5.1.0 Added `params.dontSaveRangeToLayout`.
       * - 5.1.0 The selected range will be recorded in the chart CIQ.ChartEngine#layout when it is requested through CIQ.ChartEngine#loadChart, or when you call setRange directly.
       * - 5.2.0 `params.forceLoad` is now an option to force loading of new data.
       * @example
       * <caption>Display all of the available data in the current chart periodicity.</caption>
       * stxx.setRange({
       *     dtLeft: stxx.chart.dataSet[0].DT,
       *     dtRight: stxx.chart.dataSet[stxx.chart.dataSet.length - 1].DT,
       *     periodicity:{period:stxx.layout.periodicity,interval:stxx.layout.interval,timeUnit:stxx.layout.timeUnit}
       * });
       */
      setRange(
        params: {
          dtLeft?: Date,
          dtRight?: Date,
          padding?: number,
          chart?: CIQ.ChartEngine.Chart,
          goIntoFuture?: boolean,
          goIntoPast?: boolean,
          periodicity?: {
            period: Number,
            interval: string,
            timeUnit: string
          },
          pixelsPerBar?: Number,
          dontSaveRangeToLayout?: boolean,
          forceLoad?: boolean
        },
        cb?: Function
      ): void
      /**
       * Sets the chart to display the requested time span.
       *
       * By default, the **minimum width** for a bar is `1px`. As such, there may be times when the requested data will not all fit on the screen, even though it is available.
       * See CIQ.ChartEngine#minimumCandleWidth for instructions on how to override the default to allow more data to display.
       *
       * setSpan makes use of CIQ.ChartEngine#setRange by converting the span requested into a date range.
       * All parameters in setSpan will be sent into setRange (except if 'all' is requested), so you can pre-load things like `params.periodicity` in setSpan for setRange to use.
       *
       * Example:
       * <pre>
       * stxx.setSpan({
       * 	multiplier: 5,
       * 	base: "day",
       * 	padding: 30,
       * 	// pre load a parameter for setRange
       * 	periodicity: {
       * 		period: 1,
       * 		interval: 5,
       * 		timeUnit: 'minute'
       * 	}
       * });
       * </pre>
       *
       * Just keep in mind that if passing `periodicity.period` , `periodicity.timeUnit` and `periodicity.interval` to be used in CIQ.ChartEngine#setRange , then **DO NOT** set `maintainPeriodicity`. Otherwise, the requested periodicity will be ignored.
       *
       * If a quotefeed is attached to the chart (ver 04-2015 and up), setSpan will attempt to gather more data from the feed (IF NEEDED) to fulfill the requested range AND **may override the periodicity** to provide the most optimal chart display.
       * So depending on your UI, **you may need to use the callback to refresh the periodicity displayed on your menu**.
       * Please see CIQ.ChartEngine#setRange and CIQ.ChartEngine#displayAll for complete details on how the periodicity is calculated.
       * If there is no quotefeed attached (or using a version prior to 04-2015), then setStan will use whatever data is available in the masterData. So you must ensure you have preloaded enough to display the requested range.
       *
       * Calling CIQ.ChartEngine#setPeriodicity immediately after setting a span may cause all of the data to be re-fetched at a different periodicity than the one used by the requested span. Once you have set your initial periodicity for the chart, there is no need to manually change it when setting a new span unless you are using the `params.maintainPeriodicity` flag; in which case you want to call `setPeriodicity` **before** you set the span, so the setSpan call will use the pre-set periodicity.
       * Setting a span to `params.multiplier:7` `params.base:'days'` or `params.multiplier:1` `params.base:'week'`, for example, is really the same thing; same span of time. If what you are trying to do is tell the chart how you want the raw data to be fetched, that is done with CIQ.ChartEngine#setPeriodicity or by letting setSpan figure it out as described above.
       * Remember that by default, weekly and monthly data is calculated using daily raw ticks. If your feed returns data already rolled up in monthly or weekly ticks, you can override this behavior by setting `stxx.dontRoll` to `true` ( see CIQ.ChartEngine#dontRoll  and the {@tutorial Periodicity} tutorial)
       *
       * This function must be called **after** loadChart() completes and creates a dataSet, or together with loadChart() by setting the proper parameter values.
       * If calling separately right after loadChart(), be sure to call it in the loadChart() callback!.
       * See example in this section and CIQ.ChartEngine#loadChart for more details and compatibility with your current version.
       *
       * Be aware that CIQ.ChartEngine.Chart#allowScrollPast and CIQ.ChartEngine.Chart#allowScrollFuture must be set to true if you wish to display "white space" in cases where the range requested is larger than the available data.
       * Especially when using "today" and the base.
       *
       * **Layout preservation and the span**
       * If `maintainPeriodicity` is not set, the selected span will be recorded in the chart CIQ.ChartEngine#layout when it is requested through CIQ.ChartEngine#loadChart, or when you call setSpan directly.
       * It is then used in CIQ.ChartEngine#importLayout and CIQ.ChartEngine#loadChart to reset that span, until a new periodicity is selected.
       *
       * **Note:** versions prior to '2015-05-01' must use the legacy arguments : setSpan(multiplier, base, padding, char,useMarketTZ,cb), and related example in this section.
       *
       * @param params Parameter for the function
       * @param params.multiplier   Number of base units to show. To show 3 weeks of data, for example, set this to 3 and `params.base` to 'week'.
       * @param params.base The base span to show. "minute", "day", "week", "month", "year", "all", "ytd" or "today".
       * Except when using "today", this base will be combined with the multiplier. Example 2 days, 4 months.
       * **Spans are market hours sensitive**, so if you ask for 1 hour, for example, at the time the markets are close,
       * the span will find the last time the markets where open for the active symbol, and include the last market hour in the span.
       * It will also exclude days when the market is closed.
       * - If 'all' data is requested, CIQ.ChartEngine#displayAll is called first to ensure all quotefeed data for that particular instrument is loaded. Note that 'all' will display the data in `monthly` periodicity unless otherwise specified. Please note that "all" will attempt to load all of the data the quotefeed has available for that symbol. Use this span with caution.
       * - If 1 'day' is requested --on market days--the chart will start from the same time on the previous market day, which may be over a weekend. Example from 3:30 PM Friday to 3:30 PM Monday, if the market is closed Saturday and Sunday.
       * - If 1 'day' is requested --on weekends and holidays-- or if 2 or more days are requested, the chart will always start from market open of prior days.
       * - If 'today' is requested --during the market day -- the chart will display the current market day but, if CIQ.ChartEngine.Chart#allowScrollFuture is also enabled, extend the chart all the way to market close (as per market hours set in the active market definition - see CIQ.Market)
       * - If 'today' is requested --before the market is open --the chart will display the previous  market day.
       * - If 'today' is requested --after the current market day closes --the chart will display the current  market day.
       * @param [params.maintainPeriodicity] If set to true, it will maintain the current periodicity for the chart instead of trying to select the most optimal periodicity for the selected range. See CIQ.ChartEngine#setRange for details.
       * **Note:** if the chart is in `tick` periodicity, the periodicity will be automatically selected even if it was requested to be maintained because in `tick` periodicity we have no way to know how many ticks to get to fulfill the requested range.
       * @param [params.padding] Whitespace padding in pixels to apply to right side of chart after sizing for date range. If not set will default whitespace to 0.
       * @param [params.forceLoad] Forces a complete load (used by loadChart)
       * @param [params.chart] Which chart, defaults to "chart"
       * @param cb Optional callback
       * @example
       * // this displays 5 days. It can be called anywhere including buttons on the UI
       *	stxx.setSpan ({
       *		multiplier: 5,
       *		base: "day",
       *		padding: 30
       *	});
       * @example
       * // using embedded span requirements on a loadChart() call.
       * stxx.loadChart({symbol: newSymbol, other: 'stuff'}, {
       * 	span: {
       * 		base: 'day',
       * 		multiplier: 2
       * 	},
       * }, callbackFunction());
       * @example
       * // Calling setSpan in the loadChart() callback to ensure synchronicity.
       * stxx.loadChart({symbol: newSymbol, other: 'stuff'}, function() {
       * 	stxx.setSpan({
       * 		multiplier: 5,
       * 		base: "day",
       * 		padding: 30
       * 	});
       * });
       * @since
       * - 04-2015 Added "all", "today", "ytd" and automatic integration with quotefeed.
       * - 15-07-01 Changed `params.period` to `params.multiplier` for clarity.
       * - 15-07-01 Changed `params.interval` to `params.base` for clarity.
       * - 05-2016-10 Saves the set span in stxx.layout to be restored with the layout between sessions.
       * - 4.0.3 Saves all parameters of the requested span in stxx.layout to be restored with the layout between sessions. Previously only `multiplier` and `base` were saved.
       * - 5.0.0 When 1 'day' is requested data displayed will differ if current day is market day or the market is closed to ensure the span will have enough data.
       */
      setSpan(
        params: {
          multiplier: number,
          base: string,
          maintainPeriodicity?: boolean,
          padding?: number,
          forceLoad?: boolean,
          chart?: CIQ.ChartEngine.Chart
        },
        cb: Function
      ): void
      /**
       * Sets a chart to display all data for a security.
       *
       * If no feed is attached, it will simply display all the data loaded in the present periodicity.
       * If the chart is driven by a QuoteFeed and no periodicity is requested, it will default to 'monthly'.
       * It will then call QuoteDriver.loadAll() which makes multiple queries to ensure all data available from the quote feed is loaded.
       * Once all the data is loaded, the chart will be set to cover that range using CIQ.ChartEngine#setRange
       * @param [params] Optional parameters in same format as CIQ.ChartEngine#setSpan.
       * @param [cb] Callback, is called when chart is displayed.
       * @since  04-2015
       */
      displayAll(params?: object, cb?: Function): void
    }
    /**
     * The comprehensive list of timezones can be overwhelming. This is a reduced list that provides
     * what is necessary for the [sample UI]WebComponents.cq-theme-dialog.
     *
     * To see the current list and format, open your browser console and type `CIQ.timeZoneMap`.
     *
     * There are more timezones loaded in the the chart by default. You can get a list by running `timezoneJS.timezone.getAllZones();` from your browser console.
     * Feel free to add what you need to this map if you want users to use them.
     *
     * If you need to support other timezones, not currently loaded, a complete list can be downloaded from [here](http://download.chartiq.com/timeZones/timezoneDataObject.txt).
     *
     * This file is large, so add timezones with discretion.
     * Although we do update this file periodically ,it may not be available immediately after every timezone change.
     * As such, if you require immediate updates, you should subscribe to a notification system that alerts you of these changes, and then adjust the file as needed.
     * www.iana.org/time-zones is a good source.
     *
     * The following code snippet demonstrates how to do this. (You can also just add synonyms this way as well).
     * In order to save space, you may want to cherry pick the zones that you will need, and then add them in your initialization code.
     * ```
     *	var myAdditionalZones = {
     *	 "zones" : {
     *	  "America/Toronto": [
     *	   [ 300, "Canada", "E%sT", null ]
     *	  ]
     *	 },
     *	 "rules" : {
     *	  "Canada" : [
     *	   [ 2007, "max", "-", "Mar", "Sun>=8", [ 2, 0, 0, null ], 60, "D" ],
     *	   [ 2007, "max", "-", "Nov", "Sun>=1", [ 2, 0, 0, null ], 0, "S" ] ]
     *	 }
     *	}
     *
     * // to add all timezones "zones" and "rules" you can simply load the entire timeZoneDataObject.txt file.
     *	if(timezoneJS) timezoneJS.timezone.loadZoneDataFromObject(myAdditionalZones);
     *  ```
     * Lastly, if you want users to be able to use the new timezones from the menus, be sure to also add the title for them to the `CIQ.timeZoneMap` object to keep the list and the settings in sync:
     *  ```
     *  CIQ.timeZoneMap["(UTC-05:00) Toronto"]="America/Toronto";
     *  ```
     *
     * See CIQ.ChartEngine#setTimeZone for further instructions on how to set the different timezones on the chart.
     *
     */
    let timeZoneMap: {
      "(UTC-11:00) American Samoa, Midway Island": string,
      "(UTC-10:00) Hawaii": string,
      "(UTC-09:00) Alaska": string,
      "(UTC-08:00) Pacific Time (US and Canada), Tijuana": string,
      "(UTC-07:00) Arizona": string,
      "(UTC-07:00) Chihuahua, Mazatlan": string,
      "(UTC-07:00) Mountain Time (US and Canada)": string,
      "(UTC-06:00) Central America": string,
      "(UTC-06:00) Central Time (US and Canada)": string,
      "(UTC-06:00) Guadalajara, Mexico City, Monterrey": string,
      "(UTC-06:00) Saskatchewan": string,
      "(UTC-05:00) Bogota, Lima, Quito, Rio Branco": string,
      "(UTC-05:00) Eastern Time (US and Canada)": string,
      "(UTC-05:00) Havana": string,
      "(UTC-05:00) Port-au-Prince": string,
      "(UTC-04:00) Asuncion": string,
      "(UTC-04:00) Santiago": string,
      "(UTC-04:00) Caracas": string,
      "(UTC-04:00) Atlantic Time (Canada)": string,
      "(UTC-04:00) Georgetown, La Paz, Manaus, San Juan": string,
      "(UTC-03:30) Newfoundland and Labrador": string,
      "(UTC-03:00) Cancun, Jamaica, Panama": string,
      "(UTC-03:00) Buenos Aires": string,
      "(UTC-03:00) Punta Arenas": string,
      "(UTC-03:00) Montevideo": string,
      "(UTC-03:00) Sao Paulo": string,
      "(UTC-02:00) Mid-Atlantic": string,
      "(UTC-01:00) Azores": string,
      "(UTC-01:00) Cape Verde Islands": string,
      "(UTC) Greenwich Mean Time, Reykjavik": string,
      "(UTC) Dublin": string,
      "(UTC) Lisbon, London": string,
      "(UTC+01:00) Algiers, Tunis": string,
      "(UTC+01:00) Casablanca": string,
      "(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna": string,
      "(UTC+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague": string,
      "(UTC+01:00) Brussels, Copenhagen, Madrid, Paris": string,
      "(UTC+01:00) Sarajevo, Skopje, Warsaw, Zagreb": string,
      "(UTC+02:00) Kaliningrad": string,
      "(UTC+02:00) Athens, Bucharest": string,
      "(UTC+02:00) Cairo": string,
      "(UTC+02:00) Harare, Johannesburg": string,
      "(UTC+02:00) Helsinki, Kiev, Riga, Sofia, Tallinn, Vilnius": string,
      "(UTC+02:00) Cyprus": string,
      "(UTC+02:00) Beirut": string,
      "(UTC+02:00) Damascus": string,
      "(UTC+02:00) Jerusalem": string,
      "(UTC+02:00) Amman": string,
      "(UTC+03:00) Istanbul": string,
      "(UTC+03:00) Baghdad, Kuwait, Qatar, Riyadh": string,
      "(UTC+03:00) Minsk, Moscow, Kirov, Simferopol": string,
      "(UTC+03:00) Volgograd": string,
      "(UTC+03:00) Nairobi": string,
      "(UTC+03:30) Tehran": string,
      "(UTC+04:00) Baku": string,
      "(UTC+04:00) Dubai, Muscat": string,
      "(UTC+04:00) Astrakhan, Samara, Saratov, Ulyanovsk": string,
      "(UTC+04:30) Kabul": string,
      "(UTC+05:00) Karachi, Tashkent": string,
      "(UTC+05:00) Yekaterinburg": string,
      "(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi": string,
      "(UTC+05:45) Kathmandu": string,
      "(UTC+06:00) Almaty": string,
      "(UTC+06:00) Omsk": string,
      "(UTC+06:00) Astana, Dhaka": string,
      "(UTC+06:30) Yangon": string,
      "(UTC+07:00) Bangkok, Jakarta, Vietnam": string,
      "(UTC+07:00) Hovd": string,
      "(UTC+07:00) Krasnoyarsk": string,
      "(UTC+07:00) Novokuznetsk": string,
      "(UTC+07:00) Barnaul, Novosibirsk, Tomsk": string,
      "(UTC+08:00) Beijing, Chongqing, Hong Kong SAR": string,
      "(UTC+08:00) Brunei, Kuala Lumpur, Singapore": string,
      "(UTC+08:00) Irkutsk": string,
      "(UTC+08:00) Choibalsan, Ulaanbaatar": string,
      "(UTC+08:00) Manila, Taipei": string,
      "(UTC+08:00) Perth": string,
      "(UTC+08:45) Eucla": string,
      "(UTC+09:00) Osaka, Sapporo, Tokyo": string,
      "(UTC+09:00) Pyongyang": string,
      "(UTC+09:00) Seoul": string,
      "(UTC+09:00) Chita, Khandyga, Yakutsk": string,
      "(UTC+09:30) Adelaide": string,
      "(UTC+09:30) Darwin": string,
      "(UTC+10:00) Brisbane": string,
      "(UTC+10:00) Canberra, Melbourne, Sydney": string,
      "(UTC+10:00) Guam, Port Moresby": string,
      "(UTC+10:00) Ust-Nera, Vladivostok": string,
      "(UTC+11:00) Noumea, Solomon Islands": string,
      "(UTC+11:00) Magadan": string,
      "(UTC+11:00) Sakhalin, Srednekolymsk": string,
      "(UTC+12:00) Anadyr, Kamchatka": string,
      "(UTC+12:00) Auckland, Wellington": string,
      "(UTC+12:00) Fiji": string,
      "(UTC+12:45) Chatham": string,
      "(UTC+13:00) Tonga": string,
      "(UTC+13:00) Samoa": string,
      "(UTC+14:00) Kiritimati": string
    }
    /**
     * Computes an equation that may contain symbols and simple arithmetic operators.
     * Parentheses can be used to separate portions of the equation.
     * PEMDAS priority is observed.
     * Symbols can be optionally contained within brackets.
     * Valid examples: 3*IBM, 4+(IBM*2), (IBM-GM)/2
     * If the equation cannot be resolved an exception is thrown.
     * @param equation The equation to compute.
     * @param map A map of symbols to data
     * @return A consolidated array of equation results
     * @version ChartIQ Advanced Package
     */
    function computeEquationChart(equation: string, map: object): any[]
  }

  /**
   * Base class for Drawing Tools. Use CIQ.inheritsFrom to build a subclass for custom drawing tools.
   * The name of the subclass should be CIQ.Drawing.yourname. Whenever CIQ.ChartEngine.currentVectorParameters.vectorType==yourname, then
   * your drawing tool will be the one that is enabled when the user begins a drawing. Capitalization of yourname
   * must be an exact match otherwise the kernel will not be able to find your drawing tool.
   *
   * Each of the CIQ.Drawing prototype functions may be overridden. To create a functioning drawing tool
   * you must override the functions below that create alerts.
   *
   * Drawing clicks are always delivered in *adjusted price*. That is, if a stock has experienced splits then
   * the drawing will not display correctly on an unadjusted price chart unless this is considered during the rendering
   * process. Follow the templates to assure correct rendering under both circumstances.
   *
   * If no color is specified when building a drawing then color will be set to "auto" and the chart will automatically display
   * white or black depending on the background.
   *
   * **Permanent drawings:**
   * To make a particular drawing permanent, set its `permanent` property to `true` once created.
   * Example:
   * ```drawingObject.permanent=true;```
   *
   * See {@tutorial Using and Customizing Drawing Tools} for more details.
   *
   */
  export namespace CIQ.Drawing {
    /**
     * Base class for drawings that require two mouse clicks. Override as required.
     */
    class BaseTwoPoint {
      /**
       * Base class for drawings that require two mouse clicks. Override as required.
       */
      constructor()
      /**
       * Determine whether the tick/value lies within the theoretical box outlined by this drawing's two
       * points.
       *
       * @param tick Tick in the `dataSet`.
       * @param value Value at position.
       * @param box x0, y0, x1, y1, r representing an area around the cursor, including the
       * 		radius.
       * @return True if box intersects the drawing.
       *
       */
      public boxIntersection(tick: number, value: number, box: object): boolean
      /**
       * Returns the highlighted state. Set this.highlighted to the highlight state.
       * For simple drawings the highlighted state is just true or false. For complex drawings
       * with pivot points for instance, the highlighted state may have more than two states.
       * Whenever the highlighted state changes a draw() event will be triggered.
       * @param highlighted True to highlight the drawing, false to unhighlight
       */
      public highlight(highlighted: Boolean): void
      /**
       * Sets the internal properties of the drawing points where x is a tick or a date and y is a value.
       * @param  point    index to point to be converted (0,1)
       * @param  x    index of bar in dataSet (tick) or date of tick (string form)
       * @param  y    price
       * @param  [chart] Optional chart object
       * @since
       * - 04-2015
       * - 8.3.0 `x` tick values outside an allowable range will be replaced by values at the edge
       * 		of the range. This is to prevent performance problems when switching periodicities.
       */
      public setPoint(
        point: number,
        x: number|string,
        y: number,
        chart?: CIQ.ChartEngine.Chart
      ): void
      /**
       * Intersection is based on a hypothetical box that follows a user's mouse or finger. An
       * intersection occurs when the box crosses over the drawing. The type should be "segment", "ray"
       * or "line" depending on whether the drawing extends infinitely in any or both directions. Radius
       * determines the size of the box in pixels and is determined by the kernel depending on the user
       * interface (mouse, touch, etc.).
       *
       * @param tick Tick in the `dataSet`.
       * @param value Value at the cursor position.
       * @param box x0, y0, x1, y1, r representing an area around the cursor, including the
       * 		radius.
       * @param type Determines how the line should be treated (as segment, ray, or line) when
       * 		finding an intersection.
       * @param [p0] The x/y coordinates of the first endpoint of the line that is tested for
       * 		intersection with `box`.
       * @param [p1] The x/y coordinates of the second endpoint of the line that is tested for
       * 		intersection with `box`.
       * @param [isPixels] Indicates that box values are in pixel values.
       * @return True if the line intersects the box; otherwise, false.
       *
       */
      public lineIntersection(
        tick: number,
        value: number,
        box: object,
        type: string,
        p0?: number[],
        p1?: number[],
        isPixels?: boolean
      ): boolean
      /**
       * Any two-point drawing that results in a drawing that is less than 10 pixels
       * can safely be assumed to be an accidental click. Such drawings are so small
       * that they are difficult to highlight and delete, so we won't allow them.
       *
       * <b>Note:</b> it is very important to use pixelFromValueAdjusted() rather than pixelFromPrice(). This will
       * ensure that saved drawings always render correctly when a chart is adjusted or transformed for display
       * @param tick Tick in the `dataSet`.
       * @param value Value at position.
       */
      public accidentalClick(tick: number, value: number): void
      /**
       * Value will be the actual underlying, unadjusted value for the drawing. Any adjustments or transformations
       * are reversed out by the kernel. Internally, drawings should store their raw data (date and value) so that
       * they can be rendered on charts with different layouts, axis, etc
       * @param context Canvas context on which to render.
       * @param tick Tick in the `dataSet`.
       * @param value Value at position.
       */
      public click(
        context: CanvasRenderingContext2D,
        tick: number,
        value: number
      ): void
      /**
       * Default adjust function for BaseTwoPoint drawings
       */
      public adjust(): void
      /**
       * Default move function for BaseTwoPoint drawings
       * @param context Canvas context on which to render.
       * @param tick Tick in the `dataSet`.
       * @param value Value at position.
       */
      public move(
        context: CanvasRenderingContext2D,
        tick: number,
        value: number
      ): void
      /**
       * Default measure function for BaseTwoPoint drawings
       */
      public measure(): void
    }
    /**
     * Annotation drawing tool. An annotation is a simple text tool. It uses the class stx_annotation
     * to determine the font style and color for the annotation. Class stx_annotation_highlight_bg is used to
     * determine the background color when highlighted.
     *
     * The controls controls.annotationSave and controls.annotationCancel are used to create HTMLElements for
     * saving and canceling the annotation while editing. A textarea is created dynamically. The annotation tool
     * attempts to draw the annotations at the same size and position as the textarea so that the effect is wysiwig.
     * @see CIQ.Drawing.BaseTwoPoint
     */
    class annotation {
      /**
       * Annotation drawing tool. An annotation is a simple text tool. It uses the class stx_annotation
       * to determine the font style and color for the annotation. Class stx_annotation_highlight_bg is used to
       * determine the background color when highlighted.
       *
       * The controls controls.annotationSave and controls.annotationCancel are used to create HTMLElements for
       * saving and canceling the annotation while editing. A textarea is created dynamically. The annotation tool
       * attempts to draw the annotations at the same size and position as the textarea so that the effect is wysiwig.
       * @see CIQ.Drawing.BaseTwoPoint
       */
      constructor()
      /**
       * Reconstruct an annotation
       * @param  stx The chart object
       * @param [obj] A drawing descriptor
       * @param [obj.col] The text color for the annotation
       * @param [obj.pnl] The panel name
       * @param [obj.d0] String form date or date time
       * @param [obj.v0] The value at which to position the annotation
       * @param [obj.text] The annotation text (escaped using encodeURIComponent())
       * @param [obj.tzo0] Offset of UTC from d0 in minutes
       * @param [obj.bc] Border color
       * @param [obj.bg] Background color
       * @param [obj.lw] Line width
       * @param [obj.ptrn] Line pattern
       * @param [obj.fnt] Font
       * @param [obj.fnt.st] Font style
       * @param [obj.fnt.sz] Font size
       * @param [obj.fnt.wt] Font weight
       * @param [obj.fnt.fl] Font family
       */
      public reconstruct(
        stx: CIQ.ChartEngine,
        obj?: {
          col?: string,
          pnl?: string,
          d0?: string,
          v0?: number,
          text?: string,
          tzo0?: number,
          bc?: string,
          bg?: string,
          lw?: string,
          ptrn?: string,
          fnt?: {
            st?: object,
            sz?: object,
            wt?: object,
            fl?: object
          }
        }
      ): void
    }
    /**
     * segment is an implementation of a CIQ.Drawing.BaseTwoPoint drawing.
     */
    class segment {
      /**
       * segment is an implementation of a CIQ.Drawing.BaseTwoPoint drawing.
       */
      constructor()
      /**
       * Reconstruct a segment
       * @param  stx The chart object
       * @param  [obj] A drawing descriptor
       * @param [obj.col] The line color
       * @param [obj.pnl] The panel name
       * @param [obj.ptrn] Optional pattern for line "solid","dotted","dashed". Defaults to solid.
       * @param [obj.lw] Optional line width. Defaults to 1.
       * @param [obj.v0] Value (price) for the first point
       * @param [obj.v1] Value (price) for the second point
       * @param [obj.d0] Date (string form) for the first point
       * @param [obj.d1] Date (string form) for the second point
       * @param [obj.tzo0] Offset of UTC from d0 in minutes
       * @param [obj.tzo1] Offset of UTC from d1 in minutes
       */
      public reconstruct(
        stx: CIQ.ChartEngine,
        obj?: {
          col?: string,
          pnl?: string,
          ptrn?: string,
          lw?: number,
          v0?: number,
          v1?: number,
          d0?: number,
          d1?: number,
          tzo0?: number,
          tzo1?: number
        }
      ): void
    }
    /**
     * Line drawing tool. A line is a vector defined by two points that is infinite in both directions.
     *
     * It inherits its properties from CIQ.Drawing.segment.
     */
    class line {
      /**
       * Line drawing tool. A line is a vector defined by two points that is infinite in both directions.
       *
       * It inherits its properties from CIQ.Drawing.segment.
       */
      constructor()
      /**
       * Reconstruct a line
       * @param  stx The chart object
       * @param  [obj] A drawing descriptor
       * @param [obj.col] The line color
       * @param [obj.pnl] The panel name
       * @param [obj.ptrn] Optional pattern for line "solid","dotted","dashed". Defaults to solid.
       * @param [obj.lw] Optional line width. Defaults to 1.
       * @param [obj.v0] Value (price) for the first point
       * @param [obj.v1] Value (price) for the second point
       * @param [obj.d0] Date (string form) for the first point
       * @param [obj.d1] Date (string form) for the second point
       * @param [obj.v0B] Computed outer Value (price) for the first point if original drawing was on intraday but now displaying on daily
       * @param [obj.v1B] Computed outer Value (price) for the second point if original drawing was on intraday but now displaying on daily
       * @param [obj.d0B] Computed outer Date (string form) for the first point if original drawing was on intraday but now displaying on daily
       * @param [obj.d1B] Computed outer Date (string form) for the second point if original drawing was on intraday but now displaying on daily
       * @param [obj.tzo0] Offset of UTC from d0 in minutes
       * @param [obj.tzo1] Offset of UTC from d1 in minutes
       */
      public reconstruct(
        stx: CIQ.ChartEngine,
        obj?: {
          col?: string,
          pnl?: string,
          ptrn?: string,
          lw?: number,
          v0?: number,
          v1?: number,
          d0?: number,
          d1?: number,
          v0B?: number,
          v1B?: number,
          d0B?: number,
          d1B?: number,
          tzo0?: number,
          tzo1?: number
        }
      ): void
    }
    /**
     * Horizontal line drawing tool. The horizontal line extends infinitely in both directions.
     *
     * It inherits its properties from CIQ.Drawing.segment
     */
    class horizontal {
      /**
       * Horizontal line drawing tool. The horizontal line extends infinitely in both directions.
       *
       * It inherits its properties from CIQ.Drawing.segment
       */
      constructor()
      /**
       * Reconstruct a horizontal
       * @param  stx The chart object
       * @param  [obj] A drawing descriptor
       * @param [obj.col] The line color
       * @param [obj.pnl] The panel name
       * @param [obj.ptrn] Optional pattern for line "solid","dotted","dashed". Defaults to solid.
       * @param [obj.lw] Optional line width. Defaults to 1.
       * @param [obj.v0] Value (price) for the first point
       * @param [obj.d0] Date (string form) for the first point
       * @param [obj.al] True to include an axis label
       * @param [obj.tzo0] Offset of UTC from d0 in minutes
       */
      public reconstruct(
        stx: CIQ.ChartEngine,
        obj?: {
          col?: string,
          pnl?: string,
          ptrn?: string,
          lw?: number,
          v0?: number,
          d0?: number,
          al?: boolean,
          tzo0?: number
        }
      ): void
    }
    /**
     * Vertical line drawing tool. The vertical line extends infinitely in both directions.
     *
     * It inherits its properties from CIQ.Drawing.horizontal.
     */
    class vertical {
      /**
       * Vertical line drawing tool. The vertical line extends infinitely in both directions.
       *
       * It inherits its properties from CIQ.Drawing.horizontal.
       */
      constructor()
    }
    /**
     * Measure tool.
     * It inherits its properties from CIQ.Drawing.segment.
     */
    class measure {
      /**
       * Measure tool.
       * It inherits its properties from CIQ.Drawing.segment.
       */
      constructor()
    }
    /**
     * rectangle is an implementation of a CIQ.Drawing.BaseTwoPoint drawing
     */
    class rectangle {
      /**
       * rectangle is an implementation of a CIQ.Drawing.BaseTwoPoint drawing
       */
      constructor()
      /**
       * Reconstruct an rectangle
       * @param  stx The chart object
       * @param  [obj] A drawing descriptor
       * @param [obj.col] The border color
       * @param [obj.fc] The fill color
       * @param [obj.pnl] The panel name
       * @param [obj.ptrn] Optional pattern for line "solid","dotted","dashed". Defaults to solid.
       * @param [obj.lw] Optional line width. Defaults to 1.
       * @param [obj.v0] Value (price) for the first point
       * @param [obj.v1] Value (price) for the second point
       * @param [obj.d0] Date (string form) for the first point
       * @param [obj.d1] Date (string form) for the second point
       * @param [obj.tzo0] Offset of UTC from d0 in minutes
       * @param [obj.tzo1] Offset of UTC from d1 in minutes
       */
      public reconstruct(
        stx: CIQ.ChartEngine,
        obj?: {
          col?: string,
          fc?: string,
          pnl?: string,
          ptrn?: string,
          lw?: number,
          v0?: number,
          v1?: number,
          d0?: number,
          d1?: number,
          tzo0?: number,
          tzo1?: number
        }
      ): void
    }
    /**
     * shape is a default implementation of a CIQ.Drawing.BaseTwoPoint drawing
     * which places a "shape" on the canvas.  It can be rotated and/or stretched.
     * It is meant to be overridden with specific shape designs, such as arrows....
     * @since 2015-11-1
     * @version ChartIQ Advanced Package
     */
    class shape {
      /**
       * shape is a default implementation of a CIQ.Drawing.BaseTwoPoint drawing
       * which places a "shape" on the canvas.  It can be rotated and/or stretched.
       * It is meant to be overridden with specific shape designs, such as arrows....
       * @since 2015-11-1
       * @version ChartIQ Advanced Package
       */
      constructor()
      /**
       * If true, enables rotation when the drawing is initially drawn.
       *
       * @since 7.4.0
       */
      public setRotationOnInitialDraw: boolean
      /**
       * Reconstruct a shape
       * @param  stx The chart object
       * @param  [obj] A drawing descriptor
       * @param [obj.col] The border color
       * @param [obj.fc] The fill color
       * @param [obj.pnl] The panel name
       * @param [obj.ptrn] Pattern for line "solid","dotted","dashed". Defaults to solid.
       * @param [obj.lw] Line width. Defaults to 1.
       * @param [obj.v0] Value (price) for the center point
       * @param [obj.d0] Date (string form) for the center point
       * @param [obj.tzo0] Offset of UTC from d0 in minutes
       * @param [obj.a] Angle of the rotation in degrees
       * @param [obj.sx] Horizontal scale factor
       * @param [obj.sy] Vertical scale factor
       */
      public reconstruct(
        stx: CIQ.ChartEngine,
        obj?: {
          col?: string,
          fc?: string,
          pnl?: string,
          ptrn?: string,
          lw?: number,
          v0?: number,
          d0?: number,
          tzo0?: number,
          a?: number,
          sx?: number,
          sy?: number
        }
      ): void
    }
    /**
     * Function to determine which drawing tools are available.
     * @param  excludeList Exclusion list of tools in object form ( e.g. {"vertical":true,"annotation":true})
     * @returns Map of tool names and types
     * @since 3.0.0
     */
    function getDrawingToolList(excludeList: object): object
    /**
     * Since not all drawings have the same configuration parameters,
     * this is a helper function intended to return the relevant drawing parameters and default settings for the requested drawing type.
     *
     * For example,  you can use the returning object as your template for creating the proper UI tool box for that particular drawing.
     * Will you need a line width UI element, a fill color?, etc. Or you can use it to determine what values you should be setting if enabling
     * a particular drawing type programmatically with specific properties.
     * @param stx Chart object
     * @param drawingName Name of drawing, e.g. "ray", "segment"
     * @returns Map of parameters used in the drawing type, with their current values
     * @since 3.0.0
     */
    function getDrawingParameters(stx: CIQ.ChartEngine, drawingName: string): object
    /**
     * Static method for saving drawing parameters to preferences.
     *
     * Values are stored in `stxx.preferences.drawings` and can be saved together with the rest of the chart preferences,
     * which by default are placed in the browser's local storage under "myChartPreferences".
     * @param stx Chart object
     * @param toolName Name of drawing tool, e.g. "ray", "segment", "fibonacci"
     * @since 6.0.0
     */
    function saveConfig(stx: CIQ.ChartEngine, toolName: string): void
    /**
     * Static method for restoring default drawing parameters, and removing custom preferences.
     *
     * @param stx Chart object
     * @param toolName Name of active drawing tool, e.g. "ray", "segment", "fibonacci"
     * @param all True to restore default for all drawing objects.  Otherwise only the active drawing object's defaults are restored.
     * @since 6.0.0
     */
    function restoreDefaultConfig(stx: CIQ.ChartEngine, toolName: string, all: boolean): void
    /**
     * Static method to call optional initializeSettings instance method of the drawing whose name is passed in as an argument.
     * @param stx Chart object
     * @param drawingName Name of drawing, e.g. "ray", "segment", "fibonacci"
     * @since 5.2.0 Calls optional instance function instead of doing all the work internally.
     */
    function initializeSettings(stx: CIQ.ChartEngine, drawingName: string): void
    /**
     * Updates the drawing's field or panelName property to the passed in argument if the field of the drawing is "sourced" from the passed in name.
     *
     * This is used when moving a series or study, and there is a drawing based upon it.
     * It will be called based on the following occurrences:
     * - Panel of series changed
     * - Panel of study changed
     * - Default panel of study changed due to field change
     * - Outputs of study changed due to field change
     * - Outputs of study changed due to name change (due to field of field change)
     * @param stx Chart object
     * @param name Name of study or symbol of series to match with
     * @param newName Name of new field to use for the drawing field if a name match is found
     * @param newPanel Name of new panel to use for the drawing if a name match is found, ignored if `newName`` is set
     * @since 7.0.0
     */
    function updateSource(
      stx: CIQ.ChartEngine,
      name: string,
      newName: string,
      newPanel: string
    ): void
    /**
     * Static function used to copy the relevant drawing parameters into the drawing instance.
     * Use this when overriding the Instance function, to perform basic copy before performing custom operations.
     * @param drawingInstance to copy into
     * @param withPreferences set to true to return previously saved preferences
     * @since
     * - 3.0.0
     * - 6.0.0 Overwrites parameters with those stored in `preferences.drawings`.
     */
    function copyConfig(drawingInstance: CIQ.Drawing, withPreferences: boolean): void
  }

  /**
   * A marker is a DOM object that is managed by the chart.
   *
   * Makers are placed in containers which are `div` elements whose placement and size correspond with a panel on the
   * chart. A container exists for each panel.
   *
   * A marker's primary purpose is to provide additional information for a data point on the chart. As such, markers
   * can be placed by date, tick, or bar to control their position on the x-axis, and by value (price) to control their
   * position on the y-axis. Additional default positioning is also available, including the ability to create custom
   * positioning logic. Once the positioning logic is established for markers, they are repositioned as needed when the
   * user scrolls or zooms the chart.
   *
   * Alternatively, a marker can also be placed at an absolute position using CSS positioning, in which case the chart
   * does not control the marker's positioning.
   *
   * The default placement function for any markers is CIQ.ChartEngine#defaultMarkerPlacement.
   *
   * See the {@tutorial Markers} tutorial for additional implementation details and information about managing
   * performance on deployments requiring a large number of markers.
   *
   * 					which the marker is associated.
   * 					If this value is not provided, the marker is set "above_candle" as long as a valid candle is selected
   * 					by `params.x`.
   * 					DOM. If an element is not provided, an empty `div` is created. You can create your own or use the provided CIQ.Marker.Simple and CIQ.Marker.Performance node creators.
   * 					chart panel.
   * Values include:
   * - "date" — `params.x` must be set to a JavaScript date object. This will be converted to the closest `masterData`
   * position if the provided date does not exactly match any existing points. Be sure the same timezone as masterData is used.
   * - "master" — `params.x` must be set to a `masterData` position.
   * - "bar" — `params.x` must be set to a `dataSegment` position.
   * - "none" — Use CSS positioning; `params.x` is not used.
   * Values include:
   * - "value" — `params.y` must be set to an exact y-axis value. If `params.y` is omitted, the y-axis position defaults
   * to "above_candle".
   * - "above_candle" — Positions the marker right above the candle or line. If more than one marker is at the same position,
   * the markers are aligned upwards from the first. The `params.y` value is not used.
   * - "below_candle" — Positions the marker right below the candle or line. If more than one marker is at the same position,
   * the markers are aligned downwards from the first. The `params.y` value is not used.
   * - "under_candle" — Deprecated; same as "below_candle".
   * - "on_candle" — Position the marker in the center of the candle or line, covering it. If more than one marker is at the
   * same position, the markers are aligned downwards from the first. The `params.y` value is not used.
   * - "top" — Position the marker at the top of the chart, right below the margin. If more than one marker is at the same
   * position, the markers are aligned downwards from the first. The `params.y` value is not used.
   * - "bottom" — Position the marker at the bottom of the chart, right above the margin. If more than one marker is at the
   * same position, the markers are aligned upwards from the first. The `params.y` value is not used.
   * - "none" — Use CSS positioning; `params.y` is not used.
   * change, call to `loadChart()` or `initializeChart()`, and so forth.
   * allows them to be deleted simultaneously.
   * at the axis edge.
   * container, or holder, node. When placing the marker directly in the chart container, the z-index setting for the marker should
   * be set in relation to the z-index of other holders in order to place the marker above or below markers inside the holders.
   * @since
   * - 15-07-01
   * - 05-2016-10 Added the following `params.yPositioner` values: "value", "above_candle",
   * 		"below_candle", "on_candle", "top", and "bottom".
   * @version ChartIQ Advanced Package
   * @example
   * new CIQ.Marker({
   *     stx: stxx,
   * 	   xPositioner: "date",
   *     yPositioner: "value",
   * 	   x: someDate,
   * 	   y: somePrice,
   * 	   label: "events",
   * 	   node: newNode
   * });
   */
  export namespace CIQ.Marker {
    /**
     * Base class to create an empty marker node that can then be styled. Used by CIQ.Marker.Simple and CIQ.Marker.Performance.
     *  It is strongly recommended that you extend this class if you're building your own marker class.
     * See {@tutorial Markers} tutorials for additional implementation instructions.
     */
    class NodeCreator {
      /**
       * Base class to create an empty marker node that can then be styled. Used by CIQ.Marker.Simple and CIQ.Marker.Performance.
       *  It is strongly recommended that you extend this class if you're building your own marker class.
       * See {@tutorial Markers} tutorials for additional implementation instructions.
       */
      constructor()
    }
    /**
     * Creates simple HTML nodes that can be used with a CIQ.Marker
     *
     * See {@tutorial Markers} tutorials for additional implementation instructions.
     * Available options are:
     * - "circle"
     * - "square"
     * - "callout"
     * Available options are:
     * - "news"
     * - "earningsUp"
     * - "earningsDown"
     * - "dividend"
     * - "filing"
     * - "split"
     * @example
     * 	var datum = {
     *		type: "circle",
     *		headline: "This is a Marker for a Split",
     *		category: "split",
     *		story: "This is the story of a split"
     * };
     *
     * 	var mparams = {
     * 		stx: stxx,
     * 		label: "Sample Events",
     * 		xPositioner: "date",
     * 		x: aDate,
     * 		node: new CIQ.Marker.Simple(datum)
     * 	};
     *
     * 	var marker = new CIQ.Marker(mparams);
     */
    class Simple {
      /**
       * Creates simple HTML nodes that can be used with a CIQ.Marker
       *
       * See {@tutorial Markers} tutorials for additional implementation instructions.
       * @param params Parameters to describe the marker
       * @param params.type The marker type to be drawn.
       * Available options are:
       * - "circle"
       * - "square"
       * - "callout"
       * @param params.headline The headline text to pop-up when clicked.
       * @param [params.category] The category class to add to your marker.
       * Available options are:
       * - "news"
       * - "earningsUp"
       * - "earningsDown"
       * - "dividend"
       * - "filing"
       * - "split"
       * @param [params.story] The story to pop-up when clicked.
       * @example
       * 	var datum = {
       *		type: "circle",
       *		headline: "This is a Marker for a Split",
       *		category: "split",
       *		story: "This is the story of a split"
       * };
       *
       * 	var mparams = {
       * 		stx: stxx,
       * 		label: "Sample Events",
       * 		xPositioner: "date",
       * 		x: aDate,
       * 		node: new CIQ.Marker.Simple(datum)
       * 	};
       *
       * 	var marker = new CIQ.Marker(mparams);
       */
      constructor(
        params: {
          type: string,
          headline: string,
          category?: string,
          story?: string
        }
      )
    }
    /**
     * Initializes the scroll behavior of marker expands.
     *
     * For proper styling, the perfect scrollbar requires elements to have been mounted on the DOM
     * prior to initialization. As a result, this function should only be called on mounted nodes.
     *
     * @param node The marker that contains the expand for which scroll behavior is
     * 		initialized.
     *
     * @since 8.2.0
     */
    function initializeScrollBehavior(node: HTMLElement): void
    /**
     * Removes all markers with the specified label from the chart object
     * @param  stx   The chart object
     * @param  label The label
     * @since 15-07-01
     */
    function removeByLabel(stx: CIQ.ChartEngine, label: string): void
    /**
     *
     * Content positioner for any markers using the 'stx-marker-expand' class,
     * this will consider the marker node's location within its container and determine where to
     * place the content, be it to the left or right/top or bottom of the marker node (so it is all showing)
     * @param node The HTML element representing the marker which has content
     * @since 5.1.2
     */
    function positionContentVerticalAndHorizontal(node: HTMLElement): void
  }

  /**
   * The market class is what the chart uses to to manage market hours for the different exchanges.
   * It uses `Market Definitions` to decide when the market is open or closed.
   * Although you can construct many market classes with different definitions to be used in your functions, only one market definition can be attached to the chart at any given time.
   * Once a market is defined, an [iterator]CIQ.Market#newIterator can be created to traverse through time, taking into account the market hours.
   * Additionally, a variety of convenience functions can be used to check the market status, such as CIQ.Market#isOpen or CIQ.Market#isMarketDay.
   *
   * A chart will operate 24x7, unless a market definition with rules is assigned to it.
   * See CIQ.ChartEngine#setMarket and CIQ.ChartEngine#setMarketFactory for instructions on how to assign a market definition to a chart.
   *
   * The chart also provides convenience functions that allows you to traverse through time at the current chart periodicity without having to explicitly create a new iterator.
   * See CIQ.ChartEngine#getNextInterval and CIQ.ChartEngine#standardMarketIterator for details.
   *
   * **Important:**
   * - If the CIQ.ExtendedHours visualization and filtering add-on is enabled, **only data within the defined market hours will be displayed on the chart** even if more data is loaded.
   * - Once a market definition is assigned to a chart, it will be used to roll up any data requested by the [periodicity]CIQ.ChartEngine#createDataSet, which will result in any data outside the market hours to be combined with the prior candle.
   * This may at times look like data is being **filtered**, but it is just being **aggregated**. To truly filter data, you must use the above add-on.
   *
   * `Market Definitions` are JavaScript objects which must contain the following elements:
   * - `name` : A string. Name of the market for which the rules are for.
   * - `rules` : An array. The rules indicating the times the market is open or closed. `close` time **must always** be later than `open` time. Use the proper market timezone (`market_tz`) to prevent hours from spanning across days.
   * - `market_tz` : A string. Time zone in which the market operates. See CIQ.timeZoneMap to review a list of all chartIQ supported timezones and instructions on how to add more.
   * - `hour_aligned`: A boolean. If set to `true`, market opening and closing times will be forced to the exact start of the hour of time, ignoring any minutes, seconds or millisecond offsets.
   *   > You should set this to `false` if your market opening and closing times are not aligned to the beginning to each hour.
   *   > Otherwise, forcing them to do so causes the iterator to generate `previous` and `next` times that could prevent it from properly moving trough the market hours.
   * - `convertOnDaily` : A boolean. By default, daily charts are not converted for timezone. Set this to true to convert for daily charts.
   * - `beginningDayOfWeek` : Weekday number (0-6) to optionally override CIQ.Market prototype setting of same name.
   * - `normal_daily_open`: A string defining a time in `HH:mm` format. Set this to specify the normal open time for a market.
   * - `normal_daily_close`: A string defining a time in `HH:mm` format. Set this to specify the normal close time for a market.
   *
   * Example:
   * ```
   * {
   * 		name: "SAMPLE-MARKET",
   * 		market_tz: "America/Chicago",
   * 		hour_aligned: true,
   * 		beginningDayOfWeek: 0,
   *		normal_daily_open: "09:00",
   *		normal_daily_close: "17:00",
   * 		rules: [
   * 				{"dayofweek": 1, "open": "09:00", "close": "17:00"}
   * 		]
   * };
   * ```
   *
   * Instructions for creating `Market Definitions`:
   *
   * - An empty market definition ( {} ) assumes the market is always open.
   * - Once a definition has rules in it, the market will be assumed open only for those defined rules. The absence of a rule indicates the market is closed for that timeframe.
   * - Market's time rules are specified in the market's local timezone.
   * - Seconds are not considered for open or close times, but are okay for intra day data.
   * - Rules are processed top to bottom.
   * - Rules can be defined for both primary and secondary market sessions.
   * - Rules for the market's primary session do not have a `name` parameter and are enabled by default.
   * - Rules for the market's primary session are mandatory.
   * - Rules for secondary market sessions, such as pre-market or post-market trading hours sessions,  require a `name` parameter.
   * - All secondary market session are disabled by default.
   *
   * 		This is a rule for a 'pre' market session:
   * 			`{"dayofweek": 1, "open": "08:00", "close": "09:30", name: "pre"}`
   *
   * - To enable or disable secondary market session rules by session name, use CIQ.Market#enableSession and CIQ.Market#disableSession.
   *  - **Important:** Enabling/Disabling market sessions will not automatically filter-out data from the chart, but simply adjust the market iterators so the x-axis can be displayed accordingly in the absence of data for the excluded sessions.
   *  - Data filtering can be done:
   *    - Manually by requesting pertinent data from your feed and calling CIQ.ChartEngine#loadChart
   *    - Automatically by using the CIQ.ExtendedHours visualization and filtering add-on.
   * - First, the `dayofweek` wild card rules are processed. As soon as a rule is matched, processing breaks.
   *
   * 		This rule says the market is open every Monday from 9:30 to 16:00:
   * 			`{"dayofweek": 1, "open": "09:30", "close": "16:00"}`
   *
   * - After the `dayofweek` rules are processed all of the extra rules are processed.
   * - Multiple `open` and `close` times can be set for the same day of week. To indicate the market is closed during lunch, for example:
   * 	 ```
   * 	 {"dayofweek": 1, "open": "09:00", "close": "12:00"}, // mon
   *	 {"dayofweek": 1, "open": "13:00", "close": "17:00"}  // mon
   *	 ```
   *   - `close` time **must always** be later than `open` time.
   *   - Use the proper market timezone (`market_tz`) to prevent hours from spanning across days.
   *
   * - Wildcard rules should be placed first and more specific rules should be placed later.
   *
   * 		This rule is a wildcard rule for Christmas. If Christmas is on Monday, the
   * 		first set of rules will evaluate to true because the dayofweek rule for day
   * 		one will match. Then this rule will match if the date is the 25th of
   * 		December in any year.  Because open is 00:00 and close is 00:00, it will evaluate to false:
   * 			`{"date": "*-12-25", "open": "00:00", "close": "00:00"}`
   *
   * - After wildcard exceptions, any specific day and time can be matched.
   *
   * 		This rule says closed on this day only. Note that open and closed attributes
   * 		can be omitted to save typing if the market is closed the entire day:
   * 			`{"date": "2016-01-18"} //Martin Luther King day.`
   *
   * 		This rules says closed on 12-26:
   * 			`{"date": "2016-12-26"}, //Observed Christmas in 2016`
   *
   * 		This rule says partial session
   * 			`{"date": "2015-12-24", "open": "9:30", "close": "13:00"} //Christmas eve`
   *
   * See example section for a compete NYSE definition.
   *
   * Once defined, it can be used to create a new market instance.
   *
   * Example:
   * ```
   * var thisMarket = new CIQ.Market(marketDefinition);
   * ```
   *
   * If no definition is provided, the market will operate 24x7.
   *
   * Example:
   * ```
   * new CIQ.Market();
   * ```
   *
   *
   * @since
   * 04-2016-08
   * 06-2016-02 - You can now specify times for different market sessions ('pre',post', etc) to be used with the sessions visualization tools. See CIQ.ExtendedHours.
   *
   * @example
   * CIQ.Market.NYSE = {
   "name": "NYSE",
   "market_tz": "America/New_York",
   "hour_aligned": false,
   "rules": [
   //First open up the regular trading times
   //Note that sat and sun (in this example) are always closed because
   //everything is closed by default and we didn't explicitly open them.
   {"dayofweek": 1, "open": "09:30", "close": "16:00"}, //mon
   {"dayofweek": 2, "open": "09:30", "close": "16:00"},
   {"dayofweek": 3, "open": "09:30", "close": "16:00"},
   {"dayofweek": 4, "open": "09:30", "close": "16:00"},
   {"dayofweek": 5, "open": "09:30", "close": "16:00"}, //fri
   //After Hours premarket
   {"dayofweek": 1, "open": "08:00", "close": "09:30", name: "pre"}, //mon
   {"dayofweek": 2, "open": "08:00", "close": "09:30", name: "pre"},
   {"dayofweek": 3, "open": "08:00", "close": "09:30", name: "pre"},
   {"dayofweek": 4, "open": "08:00", "close": "09:30", name: "pre"},
   {"dayofweek": 5, "open": "08:00", "close": "09:30", name: "pre"}, //fri
   //After Hours post
   {"dayofweek": 1, "open": "16:00", "close": "20:00", name: "post"}, //mon
   {"dayofweek": 2, "open": "16:00", "close": "20:00", name: "post"},
   {"dayofweek": 3, "open": "16:00", "close": "20:00", name: "post"},
   {"dayofweek": 4, "open": "16:00", "close": "20:00", name: "post"},
   {"dayofweek": 5, "open": "16:00", "close": "20:00", name: "post"}, //fri
   //Now Monday thru Friday is open. Close any exceptions
   //always closed on Christmas
   {"date": "*-12-25", "open": "00:00", "close": "00:00"},
   //always closed on 4th of July
   {"date": "*-07-04", "open": "00:00", "close": "00:00"},
   //always close on new years day
   {"date": "*-01-01", "open": "00:00", "close": "00:00"},
   //Some holidays are observed on different days each year or if
   //the day falls on a weekend. Each of those rules must be specified.
   {"date": "2012-01-02", "open": "00:00", "close": "00:00"},
   //As a special case if no open and close attributes are set they
   //will be assumed "00:00" and "00:00" respectively
   {"date": "2017-01-02"},
   {"date": "2016-01-18"},
   {"date": "2016-02-15"},
   {"date": "2016-03-25"},
   {"date": "2016-05-30"},
   {"date": "2016-09-05"},
   {"date": "2016-11-24"},
   {"date": "2016-11-25", "open": "8:00", "close": "9:30", name: "pre"},
   {"date": "2016-11-25", "open": "9:30", "close": "13:00"},
   {"date": "2016-12-26"},
   {"date": "2015-01-19"},
   {"date": "2015-02-16"},
   {"date": "2015-04-03"},
   {"date": "2015-05-25"},
   {"date": "2015-07-03"},
   {"date": "2015-09-07"},
   {"date": "2015-11-26"},
   {"date": "2015-11-27", "open": "8:00", "close": "9:30", name: "pre"},
   {"date": "2015-11-27", "open": "9:30", "close": "13:00"},
   {"date": "2015-12-24", "open": "8:00", "close": "9:30", name: "pre"},
   {"date": "2015-12-24", "open": "9:30", "close": "13:00"},
   {"date": "2014-01-20"},
   {"date": "2014-02-17"},
   {"date": "2014-04-18"},
   {"date": "2014-05-26"},
   {"date": "2014-09-01"},
   {"date": "2014-11-27"},
   {"date": "2014-07-03", "open": "8:00", "close": "9:30", name: "pre"},
   {"date": "2014-07-03", "open": "9:30", "close": "13:00"},
   {"date": "2014-11-28", "open": "8:00", "close": "9:30", name: "pre"},
   {"date": "2014-11-28", "open": "9:30", "close": "13:00"},
   {"date": "2014-12-24", "open": "8:00", "close": "9:30", name: "pre"},
   {"date": "2014-12-24", "open": "9:30", "close": "13:00"},
   {"date": "2013-01-21"},
   {"date": "2013-02-18"},
   {"date": "2013-03-29"},
   {"date": "2013-05-27"},
   {"date": "2013-09-02"},
   {"date": "2013-11-28"},
   {"date": "2013-07-03", "open": "8:00", "close": "9:30", name: "pre"},
   {"date": "2013-07-03", "open": "9:30", "close": "13:00"},
   {"date": "2013-11-29", "open": "8:00", "close": "9:30", name: "pre"},
   {"date": "2013-11-29", "open": "9:30", "close": "13:00"},
   {"date": "2013-12-24", "open": "8:00", "close": "9:30", name: "pre"},
   {"date": "2013-12-24", "open": "9:30", "close": "13:00"},
   {"date": "2012-01-16"},
   {"date": "2012-02-20"},
   {"date": "2012-04-06"},
   {"date": "2012-05-28"},
   {"date": "2012-09-03"},
   {"date": "2012-10-29"},
   {"date": "2012-10-30"},
   {"date": "2012-11-22"},
   {"date": "2012-07-03", "open": "8:00", "close": "9:30", name: "pre"},
   {"date": "2012-07-03", "open": "9:30", "close": "13:00"},
   {"date": "2012-11-23", "open": "8:00", "close": "9:30", name: "pre"},
   {"date": "2012-11-23", "open": "9:30", "close": "13:00"},
   {"date": "2012-12-24", "open": "8:00", "close": "9:30", name: "pre"},
   {"date": "2012-12-24", "open": "9:30", "close": "13:00"}
   ]
   };
   */
  export namespace CIQ.Market {
    /**
     * Set of rules for identifying instrument's exchange and deriving a market definition from a symbol.
     * This is only required if your chart will need to know the operating hours for the different exchanges.
     * If using a 24x7 chart, this class is not needed.
     *
     * **Default implementation can be found in examples/markets/marketDefinitionsSample.js.  Please review and override the functions in there to match the symbol format of your quotefeed or results will be unpredictable.**
     *
     * @since 04-2016-08
     */
    class Symbology {
    }
    /**
     * Builds an iterator instance and returns it to the requesting market when CIQ.Market#newIterator is called. Do not call this constructor directly.
     *
     * @since 04-2016-08
     * @example
     var market24=new CIQ.Market();
     var iter_parms = {
     'begin': stxx.chart.dataSet[stxx.chart.dataSet.length-1].DT,	// last item on the dataset
     'interval': stxx.layout.interval,
     'periodicity': stxx.layout.periodicity,
     'timeUnit': stxx.layout.timeUnit,
     'inZone': stxx.dataZone,
     'outZone': stxx.dataZone
     };
     var iter = market24.newIterator(iter_parms);
     var next = iter.next();
     *
     */
    class Iterator {
      /**
       * Builds an iterator instance and returns it to the requesting market when CIQ.Market#newIterator is called. Do not call this constructor directly.
       *
       * @param parms
       * @param parms.begin A dataset element from CIQ.Chart.dataSet
       * @param parms.market An instane of CIQ.Market
       * @param parms.periodicity A valid periodicity as require by CIQ.ChartEngine#setPeriodicity
       * @param parms.interval Time interval: millisecond, second, minute, hour, day, week, or month.
       * @param parms.multiple How many jumps to make on each interval loop.
       * @param parms.inZone Datazone to translate from
       * @param parms.outZone Datazone to translate to
       * @since 04-2016-08
       * @example
       var market24=new CIQ.Market();
       var iter_parms = {
       'begin': stxx.chart.dataSet[stxx.chart.dataSet.length-1].DT,	// last item on the dataset
       'interval': stxx.layout.interval,
       'periodicity': stxx.layout.periodicity,
       'timeUnit': stxx.layout.timeUnit,
       'inZone': stxx.dataZone,
       'outZone': stxx.dataZone
       };
       var iter = market24.newIterator(iter_parms);
       var next = iter.next();
       *
       */
      constructor(
        parms: {
          begin: object,
          market: CIQ.Market,
          periodicity: object,
          interval: string,
          multiple: object,
          inZone: string,
          outZone: string
        }
      )
      /**
       * Returns the current date of the iterator without moving forwards or backwards.
       * Takes into account display zone settings.
       * @return The current date of the iterator.
       * @since 04-2016-08
       * @example
       * iteratorDate = iter.date();
       */
      public date(): Date
      /**
       * Calculate the number of ticks from begin date to end date taking into account
       * market open, close, and holidays.
       * If the end date is older than the begin date,it will work backward into the past.
       * If the end date is newer than the begin date,it will work forward into the future.
       * Note that the begin date is set when this
       * instance of the iterator is created and one should NOT call `previous` or `next`
       * before calling this function, or the 'begin' pointer will change.
       * @param parms An object containing the following properties:
       * @param parms.end An end date. Will be assumed to be `inZone` if one set.
       * @param [parms.sample_size] Default is 25. Maximum amount of time
       * (in milliseconds) taken to count ticks. If sample size is
       * reached before the number of ticks is found the number of ticks will be
       * estimated mathematically. The bigger the sample size couple with the
       * distance between begin date and end date affect how precise the return value
       * is.
       * @param [parms.sample_rate] Default is 1000. Maximum number of ticks to evaluate before checking `parms.sample_size`.
       * @return The number of ticks between begin and end.
       * @since 04-2016-08
       * @example
       * // find out how many ticks in the past a date is from the beginning of the dataSet
       * // (assumes the target date is older than the first dataSet item)
       *	var iter = this.standardMarketIterator(chart.dataSet[0].DT);
       *	var ticks=iter.futureTick({someRandomDate});
       */
      public futureTick(
        parms: {
          end: Date,
          sample_size?: number,
          sample_rate?: number
        }
      ): number
      /**
       * Checks if market is aligned and if iterator is intraday (daily intervals always align)
       * @return true if this market is hour aligned.
       * @since 04-2016-08
       */
      public isHourAligned(): boolean
      /**
       * Check and see if this Market is open now.
       * @return An object with the open market session's details, if the market is open right now. Or `null` if no sessions are currently open.
       * @since 04-2016-08
       */
      public isOpen(): object
      /**
       * Move the iterator one interval forward
       * @param [skip] Default 1. Jump forward skip * periodicity at once.
       * @return Next date in iterator `outZone`.
       * @since 04-2016-08
       * @example
       * now = iter.next();
       */
      public next(skip?: number): Date
      /**
       * Move the iterator one interval backward
       * @param skip Default is one. Move this many multiples of interval.
       * @return Previous date in iterator `outZone`.
       * @since 04-2016-08
       * @example
       * now = iter.previous();
       */
      public previous(skip: number): Date
    }
    /**
     * Static function that reads the json rules in the market definition and
     * creates in memory time segments that are used later to match market dates.
     * @param market An instance of a market.
     */
    function _createTimeSegments(market: object): void
  }

  /**
   * See tutorial [Data Integration : Quotefeeds]{@tutorial DataIntegrationQuoteFeeds} for a complete overview and
   * step by step source code for implementing a quotefeed
   *
   * Interface for classes that implement a quotefeed. You define a quotefeed object and attach it to
   * the chart using CIQ.ChartEngine#attachQuoteFeed. Each member "fetch..." method is optional. The chart
   * will call your member method if it exists, and will skip if it does not.
   *
   * Also see CIQ.ChartEngine#dontRoll if your feed aggregates weekly and monthly bars and you do not wish the chart to roll them from daily bars.
   *
   */
  export class quotefeed {
    /**
     * Whenever an error occurs the params and dataCallback from fetch will be automatically passed to this method by the quote engine.
     *
     * Use this to alert the user if desired.
     *
     * Override this with your own alerting mechanisms.
     * @param  params The params originally passed into the fetch call.
     * @param dataCallback The data returned to fetch
     * @example
     * 	quotefeed.announceError=function(params, dataCallback){
     *		if(params.startDate){
     *			// Perhaps some sort of "disconnected" message on screen
     *		}else if(params.endDate){
     *			// Perhaps something indicating the end of the chart
     *		}else{
     *			CIQ.alert("Error fetching quote:" + dataCallback.error);	// Probably a not found error?
     *		}
     *	};
     */
    public announceError(params: object, dataCallback: object): void
  }

  /**
   * Namespace for functionality related to studies (aka indicators).
   *
   * See {@tutorial Using and Customizing Studies} for additional details and a general overview about studies.
   */
  export namespace CIQ.Studies {
    /**
     * Creates a study descriptor which contains all of the information necessary to handle a study. Also
     * provides convenience methods to extract information from it.
     *
     * Do not call directly or try to manually create your own study descriptor, but rather always use the one returned by CIQ.Studies.addStudy
     *
     */
    class StudyDescriptor {
      /**
       * Creates a study descriptor which contains all of the information necessary to handle a study. Also
       * provides convenience methods to extract information from it.
       *
       * Do not call directly or try to manually create your own study descriptor, but rather always use the one returned by CIQ.Studies.addStudy
       *
       * @param name	   The name of the study. This should be unique to the chart. For instance if there are two RSI panels then they should be of different periods and named accordingly. Usually this is determined automatically by the library.
       * @param type	   The type of study, which can be used as a look up in the StudyLibrary
       * @param panel	  The name of the panel that contains the study
       * @param inputs	 Names and values of input fields
       * @param outputs	Names and values (colors) of outputs
       * @param parameters Additional parameters that are unique to the particular study
       */
      constructor(
        name: string,
        type: string,
        panel: string,
        inputs: object,
        outputs: object,
        parameters: object
      )
      /**
       * Returns the y-axis used by the study
       * @param stx CIQ.ChartEngine
       * @return Y axis
       * @since 7.1.0
       */
      public getYAxis(stx: CIQ.ChartEngine): CIQ.ChartEngine.YAxis
      /**
       * Returns the context to use for drawing the study
       * @param  stx A chart object
       * @return An HTML canvas context
       * @since 7.1.0
       */
      public getContext(stx: CIQ.ChartEngine): object
      /**
       * Returns an array of all studies which depend on a given study.
       * A dependent study is one which uses an output of another study as input.
       * @param  stx A chart object
       * @param  [followsPanel] If true, will only return those studies which are not assigned to an explicit panel
       * @return  Array of dependent studies
       * @since 7.1.0
       */
      public getDependents(stx: CIQ.ChartEngine, followsPanel?: boolean): any[]
      /**
       * Determines whether the study can be dragged to another axis or panel.
       *
       * @param stx A chart object.
       * @return true if not allowed to drag.
       * @since 7.3.0
       */
      public undraggable(stx: CIQ.ChartEngine): boolean
    }
    /**
     * A helper class for adding studies to charts, modifying studies, and creating study edit dialog
     * boxes.
     *
     * Study DialogHelpers are created from
     * [study definitions](tutorial-Using%20and%20Customizing%20Studies%20-%20Study%20objects.html#understanding_the_study_definition)
     * or
     * [study descriptors](tutorial-Using%20and%20Customizing%20Studies%20-%20Study%20objects.html#understanding_the_study_descriptor_object)
     * (see the examples below).
     *
     * A DialogHelper contains the inputs, outputs, and parameters of a study. Inputs configure the
     * study. Outputs style the lines and filled areas of the study. Parameters set chart&#8209;related
     * aspects of the study, such as the panel that contains the study or whether the study is an
     * underlay.
     *
     * For example, a DialogHelper for the Anchored VWAP study contains the following data:
     * ```
     * inputs: Array(8)
     * 0: {name: "Field", heading: "Field", value: "Close", defaultInput: "Close", type: "select", …}
     * 1: {name: "Anchor Date", heading: "Anchor Date", value: "", defaultInput: "", type: "date"}
     * 2: {name: "Anchor Time", heading: "Anchor Time", value: "", defaultInput: "", type: "time"}
     * 3: {name: "Display 1 Standard Deviation (1σ)", heading: "Display 1 Standard Deviation (1σ)", value: false,
     *     defaultInput: false, type: "checkbox"}
     * 4: {name: "Display 2 Standard Deviation (2σ)", heading: "Display 2 Standard Deviation (2σ)", value: false,
     *     defaultInput: false, type: "checkbox"}
     * 5: {name: "Display 3 Standard Deviation (3σ)", heading: "Display 3 Standard Deviation (3σ)", value: false,
     *     defaultInput: false, type: "checkbox"}
     * 6: {name: "Shading", heading: "Shading", value: false, defaultInput: false, type: "checkbox"}
     * 7: {name: "Anchor Selector", heading: "Anchor Selector", value: true, defaultInput: true, type: "checkbox"}
     * outputs: Array(4)
     * 0: {name: "VWAP", heading: "VWAP", defaultOutput: "#FF0000", color: "#FF0000"}
     * 1: {name: "1 Standard Deviation (1σ)", heading: "1 Standard Deviation (1σ)", defaultOutput: "#e1e1e1", color: "#e1e1e1"}
     * 2: {name: "2 Standard Deviation (2σ)", heading: "2 Standard Deviation (2σ)", defaultOutput: "#85c99e", color: "#85c99e"}
     * 3: {name: "3 Standard Deviation (3σ)", heading: "3 Standard Deviation (3σ)", defaultOutput: "#fff69e", color: "#fff69e"}
     * parameters: Array(4)
     * 0: {name: "panelName", heading: "Panel", defaultValue: "Auto", value: "Auto", options: {…}, …}
     * 1: {name: "underlay", heading: "Show as Underlay", defaultValue: false, value: undefined, type: "checkbox"}
     * 2: {name: "yaxisDisplay", heading: "Y-Axis", defaultValue: "default", value: "shared", options: {…}, …}
     * 3: {name: "flipped", heading: "Invert Y-Axis", defaultValue: false, value: false, type: "checkbox"}
     * ```
     *
     * which corresponds to the fields of the study edit dialog box:
     *
     * <img src="./img-AVWAP-Edit-Dialog-Box.png" alt="AVWAP study edit dialog box">
     *
     * DialogHelpers also contain `attributes` which specify the formatting of dialog box input
     * fields. For example, the DialogHelper for the Anchored VWAP study contains the following:
     * ```
     * attributes:
     *     Anchor Date: {placeholder: "yyyy-mm-dd"}
     *     Anchor Time: {placeholder: "hh:mm:ss", step: 1}
     *     flippedEnabled: {hidden: true}
     * ```
     *
     * The `placeholder` property (in addition to its normal HTML function of providing placeholder
     * text) determines the input type of date and time fields. If the property value is "yyyy-mm-dd"
     * for a date field, the field in the edit dialog box is a date input type instead of a string
     * input. If the value is "hh:mm:ss" for a time field, the field is a time input type instead of a
     * string. If the `hidden` property of a field is set to true, the field is excluded from the
     * study edit dialog box.
     *
     * In the Anchored VWAP edit dialog box (see above), the Anchor Date field is formatted as a date
     * input type; Anchor Time, as a time input type. The Invert Y-Axis check box (the "flipped"
     * parameter) is hidden.
     *
     * **Note:** Actual date/time displays are browser dependent. The time is displayed in the
     * `displayZone` time zone. Time values are converted to the `dataZone` time zone before being
     * used internally so they always match the time zone of `masterData`. See
     * CIQ.ChartEngine#setTimeZone.
     *
     * For more information on DialogHelpers, see the
     * {@tutorial Using and Customizing Studies - Advanced} tutorial.
     *
     * @see CIQ.Studies.addStudy to add a study to the chart using the inputs, outputs, and
     * 		parameters of a DialogHelper.
     * @see CIQ.Studies.DialogHelper#updateStudy to add or modify a study.
     * @see CIQ.UI.StudyEdit to create a study edit dialog box using a DialogHelper.
     *
     * 		definition. Must match a name specified in the
     * 		[study library]CIQ.Studies.studyLibrary. Ignored if `params.sd` is provided.
     * 		DialogHelper is created. Takes precedence over `params.name`.
     * 		includes options for positioning the study y-axis, color settings for the y-axis, and the
     * 		Invert&nbsp;Y&#8209;Axis option.
     * 		includes the Show as Underlay option and a list of panels in which the study can be
     * 		placed.
     *
     * @since
     * - 6.3.0 Added parameters `axisSelect` and `panelSelect`. If a placeholder attribute of
     * 		`yyyy-mm-dd` or `hh:mm:ss` is set on an input field, the dialog displays a date or time
     * 		input type instead of a string input type.
     * - 7.1.0 It is expected that the study dialog's parameters section is refreshed whenever the
     * 		DialogHelper changes. The "signal" member should be observed to see if it has flipped.
     * - 8.2.0 Attribute property values in the study definition can now be functions. See the
     * 		[Input Validation](tutorial-Using%20and%20Customizing%20Studies%20-%20Advanced.html#InputValidation)
     * 		section of the {@tutorial Using and Customizing Studies - Advanced} tutorial.
     *
     * @example <caption>Create a DialogHelper from a study definition.</caption>
     * let helper = new CIQ.Studies.DialogHelper({ name: "ma", stx: stxx })
     *
     * @example <caption>Create a DialogHelper from a study descriptor.</caption>
     * let sd = CIQ.Studies.addStudy(stxx, "Aroon");
     * let helper = new CIQ.Studies.DialogHelper({ sd: sd, stx: stxx });
     *
     * @example <caption>Display the DialogHelper inputs, outputs, parameters, and attributes.</caption>
     * let helper = new CIQ.Studies.DialogHelper({ name: "stochastics", stx: stxx });
     * console.log("Inputs:", JSON.stringify(helper.inputs));
     * console.log("Outputs:", JSON.stringify(helper.outputs));
     * console.log("Parameters:", JSON.stringify(helper.parameters));
     * console.log("Attributes:", JSON.stringify(helper.attributes));
     */
    class DialogHelper {
      /**
       * A helper class for adding studies to charts, modifying studies, and creating study edit dialog
       * boxes.
       *
       * Study DialogHelpers are created from
       * [study definitions](tutorial-Using%20and%20Customizing%20Studies%20-%20Study%20objects.html#understanding_the_study_definition)
       * or
       * [study descriptors](tutorial-Using%20and%20Customizing%20Studies%20-%20Study%20objects.html#understanding_the_study_descriptor_object)
       * (see the examples below).
       *
       * A DialogHelper contains the inputs, outputs, and parameters of a study. Inputs configure the
       * study. Outputs style the lines and filled areas of the study. Parameters set chart&#8209;related
       * aspects of the study, such as the panel that contains the study or whether the study is an
       * underlay.
       *
       * For example, a DialogHelper for the Anchored VWAP study contains the following data:
       * ```
       * inputs: Array(8)
       * 0: {name: "Field", heading: "Field", value: "Close", defaultInput: "Close", type: "select", …}
       * 1: {name: "Anchor Date", heading: "Anchor Date", value: "", defaultInput: "", type: "date"}
       * 2: {name: "Anchor Time", heading: "Anchor Time", value: "", defaultInput: "", type: "time"}
       * 3: {name: "Display 1 Standard Deviation (1σ)", heading: "Display 1 Standard Deviation (1σ)", value: false,
       *     defaultInput: false, type: "checkbox"}
       * 4: {name: "Display 2 Standard Deviation (2σ)", heading: "Display 2 Standard Deviation (2σ)", value: false,
       *     defaultInput: false, type: "checkbox"}
       * 5: {name: "Display 3 Standard Deviation (3σ)", heading: "Display 3 Standard Deviation (3σ)", value: false,
       *     defaultInput: false, type: "checkbox"}
       * 6: {name: "Shading", heading: "Shading", value: false, defaultInput: false, type: "checkbox"}
       * 7: {name: "Anchor Selector", heading: "Anchor Selector", value: true, defaultInput: true, type: "checkbox"}
       * outputs: Array(4)
       * 0: {name: "VWAP", heading: "VWAP", defaultOutput: "#FF0000", color: "#FF0000"}
       * 1: {name: "1 Standard Deviation (1σ)", heading: "1 Standard Deviation (1σ)", defaultOutput: "#e1e1e1", color: "#e1e1e1"}
       * 2: {name: "2 Standard Deviation (2σ)", heading: "2 Standard Deviation (2σ)", defaultOutput: "#85c99e", color: "#85c99e"}
       * 3: {name: "3 Standard Deviation (3σ)", heading: "3 Standard Deviation (3σ)", defaultOutput: "#fff69e", color: "#fff69e"}
       * parameters: Array(4)
       * 0: {name: "panelName", heading: "Panel", defaultValue: "Auto", value: "Auto", options: {…}, …}
       * 1: {name: "underlay", heading: "Show as Underlay", defaultValue: false, value: undefined, type: "checkbox"}
       * 2: {name: "yaxisDisplay", heading: "Y-Axis", defaultValue: "default", value: "shared", options: {…}, …}
       * 3: {name: "flipped", heading: "Invert Y-Axis", defaultValue: false, value: false, type: "checkbox"}
       * ```
       *
       * which corresponds to the fields of the study edit dialog box:
       *
       * <img src="./img-AVWAP-Edit-Dialog-Box.png" alt="AVWAP study edit dialog box">
       *
       * DialogHelpers also contain `attributes` which specify the formatting of dialog box input
       * fields. For example, the DialogHelper for the Anchored VWAP study contains the following:
       * ```
       * attributes:
       *     Anchor Date: {placeholder: "yyyy-mm-dd"}
       *     Anchor Time: {placeholder: "hh:mm:ss", step: 1}
       *     flippedEnabled: {hidden: true}
       * ```
       *
       * The `placeholder` property (in addition to its normal HTML function of providing placeholder
       * text) determines the input type of date and time fields. If the property value is "yyyy-mm-dd"
       * for a date field, the field in the edit dialog box is a date input type instead of a string
       * input. If the value is "hh:mm:ss" for a time field, the field is a time input type instead of a
       * string. If the `hidden` property of a field is set to true, the field is excluded from the
       * study edit dialog box.
       *
       * In the Anchored VWAP edit dialog box (see above), the Anchor Date field is formatted as a date
       * input type; Anchor Time, as a time input type. The Invert Y-Axis check box (the "flipped"
       * parameter) is hidden.
       *
       * **Note:** Actual date/time displays are browser dependent. The time is displayed in the
       * `displayZone` time zone. Time values are converted to the `dataZone` time zone before being
       * used internally so they always match the time zone of `masterData`. See
       * CIQ.ChartEngine#setTimeZone.
       *
       * For more information on DialogHelpers, see the
       * {@tutorial Using and Customizing Studies - Advanced} tutorial.
       *
       * @see CIQ.Studies.addStudy to add a study to the chart using the inputs, outputs, and
       * 		parameters of a DialogHelper.
       * @see CIQ.Studies.DialogHelper#updateStudy to add or modify a study.
       * @see CIQ.UI.StudyEdit to create a study edit dialog box using a DialogHelper.
       *
       * @param params Constructor parameters.
       * @param [params.name] The name of a study. The DialogHelper is created from the study's
       * 		definition. Must match a name specified in the
       * 		[study library]CIQ.Studies.studyLibrary. Ignored if `params.sd` is provided.
       * @param [params.sd] A study descriptor from which the
       * 		DialogHelper is created. Takes precedence over `params.name`.
       * @param [params.axisSelect] If true, the parameters property of the DialogHelper
       * 		includes options for positioning the study y-axis, color settings for the y-axis, and the
       * 		Invert&nbsp;Y&#8209;Axis option.
       * @param [params.panelSelect] If true, the parameters property of the DialogHelper
       * 		includes the Show as Underlay option and a list of panels in which the study can be
       * 		placed.
       * @param params.stx The chart object associated with the DialogHelper.
       *
       * @since
       * - 6.3.0 Added parameters `axisSelect` and `panelSelect`. If a placeholder attribute of
       * 		`yyyy-mm-dd` or `hh:mm:ss` is set on an input field, the dialog displays a date or time
       * 		input type instead of a string input type.
       * - 7.1.0 It is expected that the study dialog's parameters section is refreshed whenever the
       * 		DialogHelper changes. The "signal" member should be observed to see if it has flipped.
       * - 8.2.0 Attribute property values in the study definition can now be functions. See the
       * 		[Input Validation](tutorial-Using%20and%20Customizing%20Studies%20-%20Advanced.html#InputValidation)
       * 		section of the {@tutorial Using and Customizing Studies - Advanced} tutorial.
       *
       * @example <caption>Create a DialogHelper from a study definition.</caption>
       * let helper = new CIQ.Studies.DialogHelper({ name: "ma", stx: stxx })
       *
       * @example <caption>Create a DialogHelper from a study descriptor.</caption>
       * let sd = CIQ.Studies.addStudy(stxx, "Aroon");
       * let helper = new CIQ.Studies.DialogHelper({ sd: sd, stx: stxx });
       *
       * @example <caption>Display the DialogHelper inputs, outputs, parameters, and attributes.</caption>
       * let helper = new CIQ.Studies.DialogHelper({ name: "stochastics", stx: stxx });
       * console.log("Inputs:", JSON.stringify(helper.inputs));
       * console.log("Outputs:", JSON.stringify(helper.outputs));
       * console.log("Parameters:", JSON.stringify(helper.parameters));
       * console.log("Attributes:", JSON.stringify(helper.attributes));
       */
      constructor(
        params: {
          stx: CIQ.ChartEngine,
          name?: string,
          sd?: CIQ.Studies.StudyDescriptor,
          axisSelect?: boolean,
          panelSelect?: boolean
        }
      )
      /**
       * Updates or adds the study represented by the DialogHelper.
       *
       * When a study has been added using this function, a study descriptor is stored in the `sd`
       * property of the DialogHelper.
       *
       * When a study has been updated using this function, all DialogHelper properties, including `sd`,
       * are updated to reflect the changes. However, other DialogHelper instances of the same study
       * type are not updated. For example, the inputs, outputs, and parameters of a DialogHelper will
       * not contain any new values as a result of another DialogHelper's update.
       *
       * @param updates Contains values for the `inputs`, `outputs`, and `parameters`
       * 		properties of the DialogHelper.
       *
       *
       * @example <caption>Add and update a study.</caption>
       * // Add the study.
       * let aroonSd = CIQ.Studies.addStudy(stxx, "Aroon");
       *
       * // Create a DialogHelper.
       * let dialogHelper = new CIQ.Studies.DialogHelper({ stx: stxx, sd: aroonSd });
       *
       * // Move the study to the chart panel.
       * dialogHelper.updateStudy({ parameters: { panelName: "chart" } });
       *
       * // Move the study back to its own panel.
       * dialogHelper.updateStudy({ parameters: { panelName: "New panel" } });
       *
       * @example <caption>Add a customized study.</caption>
       * let helper = new CIQ.Studies.DialogHelper({ stx: stxx, name: "AVWAP" });
       * helper.updateStudy({ inputs: { Field: "High" },
       *                      outputs: { VWAP: "#ff0" },
       *                      parameters: { panelName: "New Panel" }
       * });
       *
       * @example <caption>Update a study and get the updated study descriptor.</caption>
       * let helper = new CIQ.Studies.DialogHelper({ stx: stxx, name: "Aroon" });
       * helper.updateStudy({ inputs: { Period: 60 } });
       * let updatedSd = helper.sd;
       *
       * @since 6.3.0 This DialogHelper instance is refreshed after an update; recreating it is no
       * 		longer necessary.
       */
      public updateStudy(updates: object): void
      /**
       * Adjust all date and time fields in the DialogHelper to use the display zone.
       *
       * This function can adjust both to and from the display zone depending on the presence of the second argument.
       * When creating the DialogHelper, the second argument is null, and any date and time in the study descriptor's inputs is converted to display zone when stored in the DialogHelper's `inputs` property.
       * When updating the DialogHelper, the second argument contains any changed fields.  If a date or time has been changed, it is converted back from display zone so it can be stored correctly in the study descriptor.  It is assumed that the updated date and time are in display zone already.
       * The function adjusts the time by changing the `updates` object if it is passed, or the `inputs` property if it is not.
       *
       * In the example below, it is assumed that there are input fields named "Anchor Date" and "Anchor Time".  Whenever you want to set up an input field with date and time, use this convention:
       * Name both fields the same name and add " Date" to one and " Time" to the other.
       *
       * @param  [updates] If updating, it should contain an object with updates to the `inputs` object used in CIQ.Studies.addStudy.
       * @example
       * var helper=new CIQ.Studies.DialogHelper({sd:sd, stx:stx});
       * var updates={inputs:{"Anchor Time":"06:00"}};
       * helper.adjustInputTimesForDisplayZone(updates});
       *
       * @since 6.3.0
       */
      public adjustInputTimesForDisplayZone(updates?: Object): void
    }
    /**
     * Automatically generates a unique name for the study instance.
     *
     * If a translation callback has been associated with the chart object then the name of the study will be translated.
     * @param  stx A chart engine instance
     * @param  studyName Type of study
     * @param  inputs The inputs for this study instance
     * @param [replaceID] If it matches then return the same id
     * @param [customName] If this is supplied, use it to form the full study name. Otherwise `studyName` will be used. ie: if custom name is 'SAMPLE', the unique name returned would resemble "SAMPLE(paam1,param2,param3,...)-X".
     * @return A unique name for the study
     * @since 5.1.1 Added `customName` argument; if supplied, use it to form the full study name. Otherwise `studyName` will be used.
     */
    function generateID(
      stx: CIQ.ChartEngine,
      studyName: string,
      inputs: object,
      replaceID?: string,
      customName?: string
    ): string
    /**
     * Removes any series that the study is referencing.
     *
     * @param sd Study descriptor.
     * @param stx The chart engine.
     *
     * @since
     * - 3.0.0
     * - 3.0.7 Changed `name` argument to take a study descriptor.
     * - 3.0.7 Added required `stx` argument.
     */
    function removeStudySymbols(sd: object, stx: CIQ.ChartEngine): void
    /**
     * Replaces an existing study with new inputs, outputs and parameters.
     *
     * When using this method a study's position in the stack will remain the same. Derived (child) studies will shift to use the new study as well
     * @param stx		The chart object
     * @param id 		The id of the current study. If set, then the old study will be replaced
     * @param type	   The name of the study (out of the studyLibrary)
     * @param [inputs]	 Inputs for the study instance. Default is those defined in the studyLibrary.
     * @param [outputs]	Outputs for the study instance. Default is those defined in the studyLibrary.
     * @param [parameters] additional custom parameters for this study if supported or required by that study
     * @param [panelName] Optionally specify the panel. If not specified then an attempt will be made to locate a panel based on the input id or otherwise created if required.
     * @param [study] Optionally supply a study definition, overriding what may be found in the study library
     * @return A study descriptor which can be used to remove or modify the study.
     * @since 3.0.0 Added `study` parameter.
     */
    function replaceStudy(
      stx: CIQ.ChartEngine,
      id: string,
      type: string,
      inputs?: object,
      outputs?: object,
      parameters?: object,
      panelName?: string,
      study?: object
    ): object
    /**
     * Adds or replaces a study on the chart.
     *
     * A [layout change event]CIQ.ChartEngine~layoutEventListener is triggered when this occurs.
     *
     * See {@tutorial Using and Customizing Studies} for more details.
     *
     * <P>Example: <iframe width="100%" height="500" scrolling="no" seamless="seamless" align="top" style="float:top" src="https://jsfiddle.net/chartiq/5y4a0kry/embedded/result,js,html,css/" allowfullscreen="allowfullscreen" frameborder="1"></iframe>
     *
     * Optionally you can [define an edit event listeners]CIQ.ChartEngine#addEventListener to call a custom function that can handle initialization of a dialog box for editing studies.
     * - Use [studyPanelEditEventListener]CIQ.ChartEngine~studyPanelEditEventListener to link the cog wheel on study panels to your desired edit menu/functionality.
     * - Use [studyOverlayEditEventListener]CIQ.ChartEngine~studyOverlayEditEventListener to link the right click on study overlays to your desired edit menu/functionality.
     * - All studies will use the same function set by the event listeners.
     * - If there are no event listeners set, the edit study buttons/functionality will not appear.
     * - The 'Study Edit' feature is standard functionality in the advanced sample template.
     * - See `Examples` section for exact function parameters and return value requirements.
     * - Please note that these listeners must be set **before** you call importLayout. Otherwise your imported studies will not have an edit capability.
     *
     * Use the CIQ.Tooltip addOn if you wish to display values on mouse hover.
     * Alternatively, you can create your own Heads-Up-Display (HUD) using this tutorial: {@tutorial Custom Heads-Up-Display (HUD)}
     *
     * @param stx		The chart object
     * @param type	   The name of the study (object key on the CIQ.Studies.studyLibrary)
     * @param [inputs]	 Inputs for the study instance. Default is those defined in the studyLibrary. Note that if you specify this object, it will be combined with (override) the library defaults. To bypass a library default, set that field to null.
     * @param [inputs.id] The id of the current study. If set, then the old study will be replaced
     * @param [inputs.display] The display name of the current study. If not set, a name generated by CIQ.Studies.prettyDisplay will be used. Note that if the study descriptor defines a `display` name, the study descriptor name will allays override this parameter.
     * @param [outputs]	Outputs for the study instance. Default is those defined in the studyLibrary. Values specified here will override those in the studyLibrary.
     * @param [parameters] Additional custom parameters for this study if supported or required by that study. Default is those defined in the CIQ.Studies.studyLibrary.
     * @param [parameters.replaceID] If `inputs.id` is specified, this value can be used to set the new ID for the modified study( will display as the study name on the study panel). If omitted the existing ID will be preserved.
     * @param [parameters.display] If this is supplied, use it to form the full study name. Otherwise `studyName` will be used. Is both `inputs.display` and `parameters.display` are set, `inputs.display` will always take precedence.ie: if custom name is 'SAMPLE', the unique name returned would resemble "SAMPLE(param1,param2,param3,...)-X".
     * @param [parameters.calculateOnly] Only setup the study for calculations and not display.  If this is supplied, UI elements will not be added.
     * @param [panelName] Optionally specify the panel. This must be an existing panel (see example). If set to "New panel" a new panel will be created for the study. If not specified or an invalid panel name is provided, then an attempt will be made to locate a panel based on the input id or otherwise created if required. Multiple studies can be overlaid on any panel.
     * @param [study] Study definition, overriding what may be found in the study library
     * @return A study descriptor which can be used to remove or modify the study.
     * @since
     * - 3.0.0 Added `study` parameter.
     * - 5.1.1 Added `parameters.display`. If this parameter is supplied, use it to form the full study name.
     * - 5.2.0 Multiple studies can be overlaid on any panel using the `panelName` parameter.
     * - 6.3.0 `panelName` argument is deprecated but maintained for backwards compatibility. Use `parameters.panelName` instead.
     * - 7.1.0 Changed specification for a new panel in `panelName` from "Own panel" to "New panel".
     * @example <caption>Add a volume underlay study with custom colors:</caption>
     * CIQ.Studies.addStudy(stxx, "vol undr", {}, {"Up Volume":"#8cc176","Down Volume":"#b82c0c"});
     * @example <caption>Define the edit function for study Panels:</caption>
     * var params={stx:stx,sd:sd,inputs:inputs,outputs:outputs, parameters:parameters};
     * stxx.addEventListener("studyPanelEdit", function(studyData){
     *		// your code here
     * });
     * @example <caption>Define the edit function for study overlays:</caption>
     * stxx.addEventListener("studyOverlayEdit", function(studyData){
     *	  CIQ.alert(studyData.sd.name);
     *	  var helper=new CIQ.Studies.DialogHelper({name:studyData.sd.type,stx:studyData.stx});
     *	  console.log('Inputs:',JSON.stringify(helper.inputs));
     *	  console.log('Outputs:',JSON.stringify(helper.outputs));
     *	  console.log('Parameters:',JSON.stringify(helper.parameters));
     *	  // call your menu here with the  data returned in helper
     *	  // modify parameters as needed and call addStudy or replaceStudy
     * });
     * @example <caption>Add an Aroon study with a custom display name:</caption>
     * CIQ.Studies.addStudy(stxx, "Aroon",null,null,{display:'Custom Name'});
     *
     * @example <caption>Add multiple studies to the same panel.</caption>
     * // create your panel
     * stxx.createPanel('New Panel', 'new_panel')
     * // add your studies to it.
     * CIQ.Studies.addStudy(stxx, "ma", null, null, {panelName:'new_panel'});
     * CIQ.Studies.addStudy(stxx, "Aroon", null, null, {panelName:'new_panel'});
     */
    function addStudy(
      stx: CIQ.ChartEngine,
      type: string,
      inputs?: {
        id?: string,
        display?: string
      },
      outputs?: object,
      parameters?: {
        replaceID?: object,
        display?: object,
        calculateOnly?: object
      },
      panelName?: string,
      study?: object
    ): CIQ.Studies.StudyDescriptor
    /**
     * Returns the panel which the study's Field input value references.
     *
     * For example, a ma (Moving Average) study with a Field of Volume may return the Volume panel, since that is the panel
     * where the Field input value may be found..
     * @param  stx The charting object
     * @param  sd	 The study descriptor
     * @return Name of panel containing the output field corresponding to the Field input value, null if not found
     * @since 6.3.0
     */
    function getPanelFromFieldName(stx: CIQ.ChartEngine, sd: CIQ.Studies.StudyDescriptor): string
    /**
     * Computes a hash of the study library keys. The hash can be assigned to a property so that `studyLibrary` changes can be observed.
     * This function is automatically called in the draw loop.
     *
     * @return A hash of `studyLibrary` keys.
     * @since 7.2.0
     */
    function createLibraryHash(): string
    /**
     * Animation Loop
     *
     * This method displays all of the studies for a chart. It is called from within the chart draw() loop.
     * @param  stx The charting object
     * @param chart Which chart to display studies for
     * @param [underlays=false] If set to true then underlays only will be displayed, otherwise underlays will be skipped
     */
    function displayStudies(
      stx: CIQ.ChartEngine,
      chart: CIQ.ChartEngine.Chart,
      underlays?: Boolean
    ): void
    /**
     * Displays a watermark on a panel for a study with `sd.error set`.
     *
     * The `sd.error` property can be set to true, which will display the default message "Not enough data to compute XXX",
     * or it can be set to a custom string which will be displayed as supplied.
     *
     * @param stx The charting object.
     * @param sd The study descriptor.
     * @param [params]	Additional options to customize the watermark.
     * @param [params.panel] Name of the panel on which to display the error, defaults to `sd.panel`.
     * @param [params.h] Watermark horizontal position.
     * @param [params.v] Watermark vertical position.
     * @since
     * - 3.0.0
     * - 4.0.0 Displays one error per panel. Added `params` object.
     * - 7.3.0 Errors without `params` or in center bottom, use
     * 		CIQ.ChartEngine#displayErrorAsWatermark instead of
     * 		CIQ.ChartEngine#watermark, which stacks errors vertically to prevent errors
     * 		overlaying other errors. Any other positioning is deprecated and results in multiple
     * 		errors at that location getting stacked on the z-axis.
     */
    function displayError(
      stx: CIQ.ChartEngine,
      sd: CIQ.Studies.StudyDescriptor,
      params?: {
        panel?: string,
        h?: string,
        v?: string
      }
    ): void
    /**
     * Convenience function for determining the min and max for a given data point.
     *
     * @param stx The chart
     * @param name The field to evaluate
     * @param quotes The array of quotes to evaluate (typically dataSet, scrubbed or dataSegment)
     * @return Object containing the min and max data point values
     */
    function calculateMinMaxForDataPoint(stx: CIQ.ChartEngine, name: string, quotes: any[]): object
    /**
     * Retrieves parameters to be used to draw the Y Axis, retrieved from the study library.
     *
     * If a range is set in the study library, the yAxis high and low properties are set.
     * Invoked by CIQ.ChartEngine.renderYAxis before createYAxis
     * @param  stx	The chart object
     * @param  yAxis	 The axis to act upon
     * @return y-axis parameters such as noDraw, range, and ground
     * @since 5.2.0
     */
    function getYAxisParameters(stx: CIQ.ChartEngine, yAxis: CIQ.ChartEngine.YAxis): object
    /**
     * studyOverZones will be displayed and Peaks & Valleys will be filled if corresponding thresholds are set in the study library as follows:
     * ```
     * "parameters": {
     *	init:{studyOverZonesEnabled:true, studyOverBoughtValue:80, studyOverBoughtColor:"auto", studyOverSoldValue:20, studyOverSoldColor:"auto"}
     * }
     * ```
     * Invoked by CIQ.ChartEngine.renderYAxis after createYAxis
     * @param  stx	The chart object
     * @param  yAxis	 The axis to draw upon
     * @since 5.2.0
     */
    function doPostDrawYAxis(stx: CIQ.ChartEngine, yAxis: CIQ.ChartEngine.YAxis): void
    /**
     * Displays a single or group of series as lines in the study panel using CIQ.Studies.displayIndividualSeriesAsLine
     *
     * One series per output field declared in the study library will be displayed.
     * It expects the 'quotes' array to have data fields for each series with keys in the outputMap format:
     * ```
     * 'output name from study library'+ " " + sd.name
     * ```
     * For most custom studies this function will do the work for you.
     * @param  stx	The chart object
     * @param  sd	 The study descriptor. See CIQ.Studies.displayIndividualSeriesAsLine for accepted `sd`  parameters.
     * @param  quotes The set of quotes (dataSegment)
     * @example
     * var study = {
     * 		overlay: true,
     * 		yAxis: {},
     * 		parameters: {
     * 			plotType: 'step',
     * 		},
     * 		seriesFN: function(stx, sd, quotes){
     * 			sd.extendToEnd=false;
     * 			sd.gaplines=false,
     * 			CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);
     * 		}
     * 	};
     * 	CIQ.Studies.addStudy(stxx, "Vol", {}, {"Volume": "green"}, null, null, study);
     */
    function displaySeriesAsLine(
      stx: CIQ.ChartEngine,
      sd: CIQ.Studies.StudyDescriptor,
      quotes: any[]
    ): void
    /**
     * Displays a single or group of series as histogram in the study panel.
     *
     * It expects the 'quotes' array to have data fields for each series with keys in the outputMap
     * format:
     * ```
     * 'output name from study library'+ " " + sd.name
     * ```
     *
     * It takes into account the following study fields (see CIQ.ChartEngine#drawHistogram
     * for details):
     * - `sd.inputs.HistogramType` — "overlaid", "clustered", or "stacked". Default "overlaid".
     * - `sd.outputs` — Can contain a color string or an object containing `{color, opacity}`.
     *    Default opacity ".3".
     * - `sd.parameters.widthFactor` — Default ".5".
     *
     * @param stx The chart object.
     * @param sd The study descriptor.
     * @param quotes The set of quotes (`dataSegment`).
     *
     * @since 7.0.0 No longer supports `sd.inputs.HeightPercentage`.
     * 		Use CIQ.ChartEngine.YAxis#heightFactor instead.
     *
     * @example
     * <caption>Adds a study panel that will display the High and Low values from the masterData as a
     * clustered histogram study.</caption>
     * CIQ.Studies.studyLibrary["Plot High Low"]={
     *     "seriesFN": CIQ.Studies.displaySeriesAsHistogram,
     *     inputs:{"HistogramType":["clustered","stacked","overlaid"]},
     *     outputs:{"High":"blue","Low":{color:"red",opacity:0.7},
     *     parameters:{"widthFactor":0.5},
     *     range: "0 to max",
     *     yAxis:{"ground":true,"initialMarginTop":0,"zoom":0, "heightFactor":0.5}
     * };
     * CIQ.Studies.addStudy(stxx, "Plot High Low");
     */
    function displaySeriesAsHistogram(
      stx: CIQ.ChartEngine,
      sd: CIQ.Studies.StudyDescriptor,
      quotes: any[]
    ): void
    /**
     * Displays multiple data-points as series on a panel.
     *
     * This is the default display function for an indicator and will work for 90% of custom indicators.
     * @param  stx	The chart object
     * @param  sd	 The study descriptor.
     *
     * Set the following elements to customize behavior (see example):
     * - `sd.highlight` Set to true to highlight the line.
     * - `sd.gaplines` Follows the same rules as `params.gapDisplayStyle` in CIQ.ChartEngine#drawLineChart
     *
     * 	Set the flowing `parameters` to customize behavior (see example):
     * - `plotType` Set to "step" to draw a step line. See {@tutorial Chart Styles and Types} for more details.
     * - `noSlopes` Follows the same rules as `params.noSlopes` in CIQ.ChartEngine#drawLineChart
     * - extendToEnd=true
     *
     * @param  panel  A reference to the study panel
     * @param  name   The name of this output field (should match field from 'quotes' needed to render this line)
     * @param  quotes The array of quotes (dataSegment)
     * @since 5.2.0 The number of decimal places for the y-axis is determined by the distance between ticks as opposed to shadow.
     * @example
     * var study = {
     * 		overlay: true,
     * 		yAxis: {},
     * 		parameters: {
     * 			plotType: 'step',
     * 		},
     * 		seriesFN: function(stx, sd, quotes){
     * 			sd.extendToEnd=false;
     * 			sd.gaplines=false,
     * 			CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);
     * 		}
     * 	};
     * 	CIQ.Studies.addStudy(stxx, "Vol", {}, {"Volume": "green"}, null, null, study);
     */
    function displayIndividualSeriesAsLine(
      stx: CIQ.ChartEngine,
      sd: CIQ.Studies.StudyDescriptor,
      panel: CIQ.ChartEngine.Panel,
      name: string,
      quotes: any[]
    ): void
    /**
     * Draws a horizontal line on the study.
     *
     * @param  stx	The chart object
     * @param  sd	 The study descriptor
     * @param  quotes The array of quotes (unused)
     * @param  price  The price (value) to draw the horizontal line
     * @param  yAxis  The axis to use when drawing the line
     * @param  color  Optional color to use when drawing line.  Can be a string or an object like {color:#334455, opacity:0.5}
     * @since 5.2.0 Added `yAxis` and `color` parameters.
     */
    function drawHorizontal(
      stx: CIQ.ChartEngine,
      sd: CIQ.Studies.StudyDescriptor,
      quotes: any[],
      price: number,
      yAxis: CIQ.ChartEngine.YAxis,
      color: object
    ): void
    /**
     * Method used to display series together with a histogram centered at the zero value.
     *
     * Used in studies such as on the "MACD" and "Klinger Volume Oscillator".
     *
     * This function creates the yAxis, draws **a single** histogram and then plots series, multiple if needed.
     *
     * Note that to differentiate between a regular series and the histogram series there is a convention to use sd.name+"_hist" for histogram values on a study.
     * See CIQ.Studies.createHistogram for details and examples.
     * @param  stx	  The chart object
     * @param  sd	   The study descriptor
     * @param  quotes   The quotes (dataSegment)
     */
    function displayHistogramWithSeries(
      stx: CIQ.ChartEngine,
      sd: CIQ.Studies.StudyDescriptor,
      quotes: any[]
    ): void
    /**
     * Plots over/under zones for indicators that support them, and when the user selects them.
     *
     * This method will draw its own yAxis which will not have a scale, but merely the over under points.
     * Shading will be performed between the zone lines and the study plot.
     * @param  stx	  The chart object
     * @param  sd	   The study descriptor
     * @param  quotes   unused
     */
    function drawZones(
      stx: CIQ.ChartEngine,
      sd: CIQ.Studies.StudyDescriptor,
      quotes: any[]
    ): void
    /**
     * Method used to display a histogram, which can be centered at the zero value.
     *
     * Used in studies such as on the "MACD" and "Klinger Volume Oscillator".
     *
     * Initial bar color is defined in stx-chart.css under '.stx_histogram'.
     * If using the default UI, refer to provided css files under '.stx_histogram' and '.ciq-night .stx_histogram' style sections.
     * If sd.outputs["Decreasing Bar"], sd.outputs["Negative Bar"], sd.outputs["Increasing Bar"] and sd.outputs["Positive Bar"] are present, their corresponding colors will be used instead.
     * <p><b>Note the convention to use sd.name+"_hist" for histogram values on a study</b></p>
     *
     * @param  stx	  The chart object
     * @param  sd	   The study descriptor
     * @param  quotes   The quotes (dataSegment)
     * @param  centered If true then the histogram will be physically centered on the yAxis, otherwise it will be centered at the zero value on the yAxis
     * @param  [opacity=1] Optionally set the opacity
     * @example <caption> Draws a histogram with alternating bid and ask records. Bids are positive, asks are negative.</caption>
     * CIQ.Studies.calculateBidAsk=function(stx, sd) {
     *		var quotes=sd.chart.scrubbed;
     *		var name=sd.name;
     *
     *		var histogram=name+"_hist";
     *		for(i=0;i<quotes.length;i++){
     *			quote=quotes[i];
     *			i % 2 ? quote[histogram]= quote.Bid : quote[histogram]= quote.Ask*-1;
     *		}
     *	};
     *
     *	CIQ.Studies.studyLibrary["Plot BidAsk"] = {
     *		seriesFN: CIQ.Studies.createHistogram,
     *		calculateFN: CIQ.Studies.calculateBidAsk,
     *		outputs: { "Negative Bar": "red", "Positive Bar": "green" },
     *	};
     *
     *	CIQ.Studies.addStudy(stxx, "Plot BidAsk");
     */
    function createHistogram(
      stx: CIQ.ChartEngine,
      sd: CIQ.Studies.StudyDescriptor,
      quotes: any[],
      centered: boolean,
      opacity?: number
    ): void
    /**
     * Used to reduce certain common fields to abbreviated form for display in study panel labels
     *
     */
    let prettify: Object
    /**
     * Convert a study ID into a displayable format
     *
     * @param  id The ID
     * @return	A pretty (shortened) ID
     */
    function prettyDisplay(id: string): string
    /**
     * Returns an array of input field names which are used  to specify the field for the study.
     *
     * In most cases, this field is called "Field", but it does not have to be, nor does there need to be only one.
     *
     * @param  sd	   The study descriptor
     * @return		   Input fields used to specify the field
     * @since 3.0.0
     */
    function getFieldInputs(sd: CIQ.Studies.StudyDescriptor): any[]
    /**
     * The default initialize function for a study. It creates the study descriptor. It creates the panel if one is required.
     *
     * @param  stx		The chart object
     * @param  type	   The type of study (from studyLibrary)
     * @param  inputs	 The inputs for the study instance
     * @param  outputs	The outputs for the study instance
     * @param  [parameters] Additional parameters if required or supported by this study
     * @param [panelName] Deprecated. Panel name.  Use parameters.panelName instead.
     * @param [study]	Study definition to use in lieu of the study library entry
     * @return		The newly initialized study descriptor
     * @since
     * - 3.0.0 Added `study` parameter.
     * - 6.3.0 `panelName` argument is deprecated; use `parameters.panelName` instead. If neither are valid, will automatically determine default panel.
     */
    function initializeFN(
      stx: CIQ.ChartEngine,
      type: string,
      inputs: object,
      outputs: object,
      parameters?: object,
      panelName?: string,
      study?: object
    ): CIQ.Studies.StudyDescriptor
    /**
     * Manages the panel for a study when a new panel is requested.
     *
     * @param stx A chart engine instance.
     * @param inputs The study inputs.
     * @param panelName Name of the panel where the study will lie. **Note:** This panel's name may be changed in this function.
     * @param replaceID Name of the original study.
     * @param toNewPanel `true` if request to move to a new panel.
     * @return The panel to which the study was moved; null if a new panel needs to be created.
     * @since
     * - 7.1.0
     * - 7.2.0 Added the `toNewPanel` argument.
     */
    function smartMovePanel(
      stx: CIQ.ChartEngine,
      inputs: object,
      panelName: string,
      replaceID: string,
      toNewPanel: boolean
    ): CIQ.ChartEngine.Panel
    /**
     * Manages yAxis for a study when a new position is requested.
     *
     * @param stx A chart engine instance
     * @param panel The panel where the yAxis is
     * @param name The study whose axis to manage
     * @param [newPosition] New position (left/right/none,default/shared, or specific axis name)
     * @param [defaultAxis] Axis defaults to use when creating new axis
     * @return The yAxis to use
     * @since 7.1.0
     */
    function smartCreateYAxis(
      stx: CIQ.ChartEngine,
      panel: CIQ.ChartEngine.Panel,
      name: string,
      newPosition?: string,
      defaultAxis?: object
    ): CIQ.ChartEngine.YAxis
    /**
     * Moving Average convenience function.
     *
     * @param    type	The type of moving average, e.g. simple, exponential, triangular, etc. Valid options can be seen by inspecting the keys on the `CIQ.Studies.movingAverage.typeMap` object.
     * @param    periods Moving average period
     * @param    field   The field in the data array to perform the moving average on
     * @param    offset  Periods to offset the result by
     * @param    name	String to prefix to the name of the output. Full name of output would be name + " " + sd.name. For instance, sending 'Signal' on a 'macd' study will result in an output field called "Signal &zwnj;macd&zwnj; (12,26,9)"
     * @param  stx	 Chart object
     * @param    sd	  Study Descriptor
     * @param    subField	  Subfield within field to perform moving average on, if applicable.  For example, IBM.Close: field:"IBM", subField:"Close"
     * @since 04-2015
     */
    function MA(
      type: string,
      periods: number,
      field: string,
      offset: number,
      name: string,
      stx: CIQ.ChartEngine,
      sd: object,
      subField: string
    ): void
    /**
     * Does conversions for valid moving average types
     *
     * @param  stx The chart object
     * @param  input String to test if a moving average type or "options" to return the list of ma options.
     * @return The name of the moving average or a list of options
     */
    function movingAverageHelper(stx: CIQ.ChartEngine, input: string): Object
    /**
     * Creates a volume chart.
     *
     * If no volume is available on the screen then the panel will be watermarked "Volume Not Available" (translated if a translate function is attached to the kernel object).
     *
     * Uses CIQ.ChartEngine#drawHistogram and any "parameters" in the study definition will send into its 'params' object to control the histogram look and feel.
     * Example:
     * ```
     * CIQ.extend(CIQ.Studies.studyLibrary["vol undr"],{
     * 		"parameters": {
     * 			"widthFactor":0.5
     * 		}
     * });
     * ```
     *
     * Uses CSS style :
     *  - `stx_volume_underlay` if "sd.underlay" is true
     *  - `stx_volume` if "sd.underlay" is NOT true
     *
     * See CIQ.ChartEngine#colorByCandleDirection to base colors on difference between open and close vs. difference between previous close and close.
     *
     * @param stx A chart engine instance
     * @param sd A study descriptor
     * @param quotes Array of quotes
     * @example
     * // default volume study library entry with required parameters
     * "volume": {
     *     "name": "Volume Chart",
     *     "range": "0 to max",
     *     "yAxis": {"ground":true, "initialMarginTop":0, "zoom":0},
     *     "seriesFN": CIQ.Studies.createVolumeChart,
     *     "calculateFN": CIQ.Studies.calculateVolume,
     *     "inputs": {},
     *     "outputs": {"Up Volume":"#8cc176","Down Volume":"#b82c0c"}
     * }
     * @example
     * // default volume underlay library entry with required parameters
     * "vol undr": {
     *     "name": "Volume Underlay",
     *     "underlay": true,
     *     "range": "0 to max",
     *     "yAxis": {"ground":true, "initialMarginTop":0, "position":"none", "zoom": 0, "heightFactor": 0.25},
     *     "seriesFN": CIQ.Studies.createVolumeChart,
     *     "calculateFN": CIQ.Studies.calculateVolume,
     *     "inputs": {},
     *     "outputs": {"Up Volume":"#8cc176","Down Volume":"#b82c0c"},
     *     "customRemoval": true,
     *     "removeFN": function(stx, sd){
     *         stx.layout.volumeUnderlay=false;
     *         stx.changeOccurred("layout");
     *     },
     *     "attributes":{
     *         "panelName":{hidden:true}
     *     }
     * }
     */
    function createVolumeChart(
      stx: CIQ.ChartEngine,
      sd: CIQ.Studies.StudyDescriptor,
      quotes: any[]
    ): void
    /**
     * Gets the difference between the local browser time and the market time.
     *
     * @param params Function parameters.
     * @param params.stx A reference to the chart object.
     * @param params.localQuoteDate A Date object that contains the market date and time.
     * @param params.shiftToDateBoundary Indicates whether the offset for FOREX symbols
     * 		should be adjusted such that the beginning of the trading day (17:00 New York time) falls
     * 		on a date boundary; if so, adds seven hours to the date/time (six for metals). **Note:**
     * 		This parameter applies to FOREX symbols only. No additional time offset is added to
     * 		non-FOREX symbols, regardless of the value of this parameter.
     * @return The local browser date/time minus the market date/time in milliseconds.
     *
     * @since
     * - 8.0.0
     * - 8.1.0 Removed `isForex` parameter. Added `shiftToDateBoundary` parameter. Added `params`
     * 		parameter and made all other parameters properties of `params`.
     */
    function getMarketOffset(
      params: {
        stx: CIQ.ChartEngine,
        localQuoteDate: object,
        shiftToDateBoundary: boolean
      }
    ): number
    /**
     * Function to determine which studies are available.
     * @param  excludeList Exclusion list of studies in object form ( e.g. {"rsi":true,"macd":true})
     * @returns Map of available entries from CIQ.Studies.studyLibrary.
     * @since 3.0.0
     */
    function getStudyList(excludeList: object): object
    /**
     * A helper function that will find the color value in the output.
     * @param output Color string value or object that has the color value
     * @return	Color value
     * @since 4.0.0
     */
    function determineColor(output: string|object): string
    /**
     * Initializes an anchor handle element on a study and adds the anchor element to the chart
     * controls. If the anchor element and study already exist but the study object has changed, the
     * existing anchor element is added to the new study object. **Note:** A study object may change
     * without its unique ID changing.
     *
     * @param stx A reference to the chart object.
     * @param sd Specifies a study object.
     *
     * @since 8.1.0
     */
    function initAnchorHandle(stx: CIQ.ChartEngine, sd: CIQ.Studies.StudyDescriptor): void
    /**
     * Removes an anchor handle element from the specified study.
     *
     * @param stx A reference to the chart object.
     * @param sd Specifies a study object.
     *
     * @since 8.1.0
     */
    function removeAnchorHandle(stx: CIQ.ChartEngine, sd: CIQ.Studies.StudyDescriptor): void
    /**
     * Repositions the anchor for a study to the tick where the anchor element has been dragged. This
     * causes the study to be recalculated. If there is no hover location (the anchor has not been
     * dragged), the study is recalcuated without changing the anchor.
     *
     * @param stx A reference to the chart object.
     * @param sd Specifies a study object.
     *
     * @since 8.1.0
     */
    function repositionAnchor(stx: CIQ.ChartEngine, sd: CIQ.Studies.StudyDescriptor): void
    /**
     * Displays the anchor element at its current location and a line depicting the hover location of
     * the anchor as it is being dragged. Called as part of the draw loop.
     *
     * @param stx A reference to the chart object.
     * @param sd Specifies a study object.
     * @param quotes The quotes (`dataSegment`) array.
     *
     * @since 8.1.0
     */
    function displayAnchorHandleAndLine(
      stx: CIQ.ChartEngine,
      sd: CIQ.Studies.StudyDescriptor,
      quotes: any[]
    ): void
    /**
     * The `studyLibrary` defines all of the available studies.
     *
     * This is used to drive the dialog boxes and creation of the studies. When you
     * create a custom study you should add it to the studyLibrary.
     *
     * You can also alter study defaults by overriding the different elements on each definition.
     * For example, if you wanted to change the default colors for the volume underlay,
     * you would add the following code in your files; making sure your files are loaded **after** the library js files -- not before:
     * ```
     * CIQ.Studies.studyLibrary["vol undr"].outputs= {"Up Volume":"blue","Down Volume":"yellow"};
     * ```
     * See {@tutorial Using and Customizing Studies} for complete details.
     * @example
     * "RAVI": {
     *     "name": "RAVI",
     *     "seriesFN": CIQ.Studies.displayRAVI,
     *     "calculateFN": CIQ.Studies.calculatePriceOscillator,
     *     "inputs": {"Field":"field", "Short Cycle":7, "Long Cycle":65},
     *     "outputs": {"Increasing Bar":"#00DD00", "Decreasing Bar":"#FF0000"},
     *     "parameters": {
     *         init:{studyOverZonesEnabled:true, studyOverBoughtValue:3, studyOverBoughtColor:"auto", studyOverSoldValue:-3, studyOverSoldColor:"auto"}
     *     },
     *     "attributes":{
     *         "studyOverBoughtValue":{"min":0,"step":"0.1"},
     *         "studyOverSoldValue":{"max":0,"step":"0.1"}
     *     }
     * }
     */
    let studyLibrary: Object
    /**
     * Calculate function for Typical Price studies. Median Price, Typical Price and Weighted Close.
     *
     * The resulting values will be added to the dataSet using the field name provided by the `sd.outputMap` entry.
     *
     * **Notes:**
     * - This function calculates a single value, so it expects `sd.outputMap` to contain a single mapping.
     * - If no `outputs` object is defined in the library entry, the study will default to a single output named `Result`, which will then be used in lieu of `sd.outputs` to build the field name.
     * - The study name may contain the unprintable character `&zwnj;`, see studyDescriptor documentation.
     *
     * @param  stx Chart object
     * @param  sd  Study Descriptor
     */
    function calculateTypicalPrice(stx: CIQ.ChartEngine, sd: CIQ.Studies.StudyDescriptor): void
    /**
     * Calculate function for Rate Of Change related studies. Price ROC, Volume ROC and Momentum.
     *
     * The resulting values will be added to the dataSet using the field name provided by the `sd.outputMap` entry.
     *
     * **Notes:**
     * - This function calculates a single value, so it expects `sd.outputMap` to contain a single mapping.
     * - If no `outputs` object is defined in the library entry, the study will default to a single output named `Result`, which will then be used in lieu of `sd.outputs` to build the field name.
     * - The study name may contain the unprintable character `&zwnj;`, see studyDescriptor documentation.
     *
     * @param  stx Chart object
     * @param  sd  Study Descriptor
     */
    function calculateRateOfChange(stx: CIQ.ChartEngine, sd: CIQ.Studies.StudyDescriptor): void
    /**
     * Initializes data for Price Relative Study by fetching the comparing symbol.
     *
     * @param stx	The chart object
     * @param type Study type
     * @param inputs Study inputs
     * @param outputs Study outputs
     * @param parameters Study parameters
     * @param panel ID of the study's panel element
     * @return Study descriptor object
     * @since 09-2016-19
     */
    function initPriceRelative(
      stx: CIQ.ChartEngine,
      type: string,
      inputs: object,
      outputs: object,
      parameters: object,
      panel: string
    ): CIQ.Studies.StudyDescriptor
    /**
     * Calculates data for Price Relative Study
     *
     * @param  stx	The chart object
     * @param  sd	The study descriptor object
     */
    function calculatePriceRelative(stx: CIQ.ChartEngine, sd: object): void
    /**
     * Ensures that symbols required by a study are loaded and maintained by the quotefeed.
     * @param  stx  The chart engine
     * @param  sd   The study descriptor
     * @param  syms An array of 'symbol strings' or 'symbol objects' required by the study. If using symbol objets, in addition to our desired identifier elements, you must `always` include the `symbol` element in it (ie: `symbolObject[i]={ symbol : mySymbol , otherStuff1 : xx , moreStuff : yy}`.
     * @param [params] Parameters to be sent to addSeries. See CIQ.ChartEngine#addSeries.
     * @since 3.0.7 This was a previously private function.
     */
    function fetchAdditionalInstruments(
      stx: CIQ.ChartEngine,
      sd: object,
      syms: any[],
      params?: object
    ): void
    /**
     * Calculate function for VWAP.
     *
     * Cumulative values are calculated on a daily basis.
     * The start of the day is calculated based on the particular market start time.
     * As such, you may need to review your market definitions and symbology for this study to properly work with your data as the default assumptions may not totally match.
     * More information on setting market hours and symbology rules can be found here: CIQ.Market
     *
     * In our calculations, the beginning of the Forex day is 17:00 NY Time.
     * The chart will be adjusted as needed to reflect this time in the browser time zone (or any specificaly set display zone).
     *
     * @param  stx Chart object
     * @param  sd  Study Descriptor
     * @since 7.0.0 Used for AVWAP calculation as well.
     */
    function calculateVWAP(stx: CIQ.ChartEngine, sd: object): void
    /**
     * Removes a study from the chart (and panel if applicable)
     *
     * @param  stx A chart object
     * @param  sd  A study descriptor returned from CIQ.Studies.addStudy
     */
    function removeStudy(stx: CIQ.ChartEngine, sd: CIQ.Studies.StudyDescriptor): void
    /**
     * Default Volume calculation function.
     *
     * Volume is already obtained, so all that is done here is setting colors.
     * @param stx A chart engine instance
     * @param sd Study to calculate volume for
     */
    function calculateVolume(stx: CIQ.ChartEngine, sd: CIQ.Studies.StudyDescriptor): void
    /**
     * Calculate function for standard deviation.
     *
     * The resulting values will be added to the dataSet using the field name provided by the `sd.outputMap` entry.
     *
     * **Notes:**
     * - If no `outputs` object is defined in the library entry, the study will default to a single output named `Result`, which will then be used in lieu of `sd.outputs` to build the `sd.outputMap`.
     * - The study name may contain the unprintable character `&zwnj;`, see CIQ.Studies.StudyDescriptor documentation
     *
     * @param  stx Chart object
     * @param  sd  Study Descriptor
     */
    function calculateStandardDeviation(stx: CIQ.ChartEngine, sd: CIQ.Studies.StudyDescriptor): void
    /**
     * Calculate function for moving averages.
     *
     * sd.inputs["Type"] can be used to request a specific type of moving average. Valid options can be seen by inspecting the keys on the `CIQ.Studies.movingAverage.typeMap` object.
     *
     * The resulting values will be added to the dataSet using the field name provided by the `sd.outputMap` entry.
     *
     * **Notes:**
     * - This function calculates a single value, so it expects `sd.outputMap` to contain a single mapping.
     * - To leverage as part of a larger study calculation, use CIQ.Studies.MA instead.
     * - If no `outputs` object is defined in the library entry, the study will default to a single output named `Result`, which will then be used in lieu of `sd.outputs` to build the field name.
     * - The study name may contain the unprintable character `&zwnj;`, see CIQ.Studies.StudyDescriptor documentation.
     *
     *
     * @param stx A chart engine instance
     * @param sd A study descriptor
     */
    function calculateMovingAverage(stx: CIQ.ChartEngine, sd: CIQ.Studies.StudyDescriptor): void
    /**
     * Default display function used on 'ATR Trailing Stop' and 'Parabolic SAR' studies to display a series of 'dots' at the required price-date coordinates.
     *
     * Visual Reference:
     * ![displayPSAR2](img-displayPSAR2.png "displayPSAR2")
     *
     * @param stx A chart engine instance
     * @param sd
     * @param quotes Array of quotes
     */
    function displayPSAR2(
      stx: CIQ.ChartEngine,
      sd: CIQ.Studies.StudyDescriptor,
      quotes: any[]
    ): void
    /**
     * Calculate function for preparing data to be used by displayChannel().
     *
     * Inserts the following fields in the dataSet:
     * ```
     * quote[sd.type + " Top " + sd.name]=quote[centerIndex]+totalShift;
     * quote[sd.type + " Bottom " + sd.name]=quote[centerIndex]-totalShift;
     * quote[sd.type + " Median " + sd.name]=quote[centerIndex];
     * quote["Bandwidth " + sd.name]=200*totalShift/quote[centerIndex];
     * quote["%b " + sd.name]=50*((quote.Close-quote[centerIndex])/totalShift+1);
     * ```
     * Example: 'Prime Bands' + ' Top ' +  'Prime Number Bands (true)'.
     * @param  stx Chart object
     * @param  sd  Study Descriptor
     * @param  percentShift Used to calculate totalShift. Defaults to 0 (zero)
     * @param  [centerIndex=Close]  Quote element to use for center series (Open, Close, High, Low). Defaults to "Close"
     * @param  [offsetIndex=centerIndex]  Quote element to use for calculating totalShift (percentShift*quote[offsetIndex]+pointShift;)
     * @param  [pointShift=0]   Used to calculate totalShift.Defaults to 0 (zero)
     */
    function calculateGenericEnvelope(
      stx: CIQ.ChartEngine,
      sd: CIQ.Studies.StudyDescriptor,
      percentShift: object,
      centerIndex?: object,
      offsetIndex?: object,
      pointShift?: object
    ): void
    /**
     * Rendering function for displaying a Channel study output composed of top, middle and bottom lines.
     *
     * Requires study library input of `"Channel Fill":true` to determine if the area within the channel is to be shaded.
     * Shading will be done using the "xxxxx Channel" or "xxxxx Median" color defined in the outputs parameter of the study library.
     *
     * Requires study library outputs to have fields in the format of :
     * - 'xxxxx Top' or 'xxxxx High' for the top band,
     * - 'xxxxx Bottom' or 'xxxxx Low' for the bottom band and
     * - 'xxxxx Median' or 'xxxxx Channel' for the middle line.
     *
     * It expects 'quotes' to have fields for each series in the channel with keys in the following format:
     * - study-output-name ( from study library) + " " + sd.name.
     * - Example: 'Prime Bands Top'+ ' ' +  'Prime Number Bands (true)'. Which equals : 'Prime Bands Top Prime Number Bands (true)'
     *
     * @param  stx Chart object
     * @param sd  Study Descriptor
     * @param quotes The array of quotes needed to render the channel
     * @example
     * "inputs": {"Period":5, "Shift": 3, "Field":"field", "Channel Fill":true}
     * "outputs": {"Prime Bands Top":"red", "Prime Bands Bottom":"auto", "Prime Bands Channel":"rgb(184,44,11)"}
     * @example
     * // full definition example including opacity
     "Bollinger Bands": {
     "name": "Bollinger Bands",
     "overlay": true,
     "calculateFN": CIQ.Studies.calculateBollinger,
     "seriesFN": CIQ.Studies.displayChannel,
     "inputs": {"Field":"field", "Period":20, "Standard Deviations": 2, "Moving Average Type":"ma", "Channel Fill": true},
     "outputs": {"Bollinger Bands Top":"auto", "Bollinger Bands Median":"auto", "Bollinger Bands Bottom":"auto"},
     "attributes": {
     "Standard Deviations":{min:0.1,step:0.1}
     },
     "parameters": {
     "init":{opacity: 0.2}
     }
     }
     * @since
     * - 4.1.0 Now also uses `sd.parameters.opacity` if one defined.
     * - 4.1.0 Now shading is rendered under the channel lines instead of over.
     */
    function displayChannel(
      stx: CIQ.ChartEngine,
      sd: CIQ.Studies.StudyDescriptor,
      quotes: any[]
    ): void
  }

  /**
   * Drives the chart's relationship with the quote feed object provided to the chart.
   *
   * @since
   * - 5.1.1 Added `maximumTicks` to `behavior` parameter.
   * - 7.3.0 Moved `intervalTimer` property into `behavior` parameter. Added `filter` parameter.
   */
  export namespace CIQ.ChartEngine.Driver {
    /**
     * Base class that drives the chart symbol lookup functionality.
     *
     * Provides back-end search fuctionality for the [cq-lookup]WebComponents.cq-lookup
     * web component.
     *
     * You should derive your own lookup driver that interacts with your data feed (see the
     * example below; also see the "Data Integration" section of the
     * <a href="tutorial-Web%20Component%20Interface.html" target="_blank">Web Component Interface</a>
     * tutorial).
     *
     * 		the exchanges for symbols that match the text entered in the
     * 		[cq-lookup]WebComponents.cq-lookup web component's input field.
     * 		<p>**Note:** This parameter is overridden by the `cq-exchanges` attribute of
     * 		[cq-lookup]WebComponents.cq-lookup.
     *
     * @since 6.0.0
     *
     * @see CIQ.UI.Context#setLookupDriver
     * @see WebComponents.cq-lookup#setDriver
     * @see CIQ.UI.Chart#initLookup
     *
     * @example <caption>Custom Implementation (See also the example in the
     * 		[acceptText]CIQ.ChartEngine.Driver.Lookup#acceptText method.)</caption>
     * CIQ.ChartEngine.Driver.Lookup.ChartIQ = function(exchanges) {
     *     this.exchanges = exchanges;
     *     if (!this.exchanges) this.exchanges = ["XNYS","XASE","XNAS","XASX","INDCBSX","INDXASE","INDXNAS","IND_DJI","ARCX","INDARCX","forex"];
     *     this.url = "https://symbols.chartiq.com/chiq.symbolserver.SymbolLookup.service";
     *     this.requestCounter = 0;  // Invalidate old requests.
     * };
     *
     * // Inherit all of the base lookup driver's properties.
     * CIQ.inheritsFrom(CIQ.ChartEngine.Driver.Lookup.ChartIQ, CIQ.ChartEngine.Driver.Lookup);
     */
    class Lookup {
      /**
       * Base class that drives the chart symbol lookup functionality.
       *
       * Provides back-end search fuctionality for the [cq-lookup]WebComponents.cq-lookup
       * web component.
       *
       * You should derive your own lookup driver that interacts with your data feed (see the
       * example below; also see the "Data Integration" section of the
       * <a href="tutorial-Web%20Component%20Interface.html" target="_blank">Web Component Interface</a>
       * tutorial).
       *
       * @param exchanges Array of financial exchange names. The lookup driver searches
       * 		the exchanges for symbols that match the text entered in the
       * 		[cq-lookup]WebComponents.cq-lookup web component's input field.
       * 		<p>**Note:** This parameter is overridden by the `cq-exchanges` attribute of
       * 		[cq-lookup]WebComponents.cq-lookup.
       *
       * @since 6.0.0
       *
       * @see CIQ.UI.Context#setLookupDriver
       * @see WebComponents.cq-lookup#setDriver
       * @see CIQ.UI.Chart#initLookup
       *
       * @example <caption>Custom Implementation (See also the example in the
       * 		[acceptText]CIQ.ChartEngine.Driver.Lookup#acceptText method.)</caption>
       * CIQ.ChartEngine.Driver.Lookup.ChartIQ = function(exchanges) {
       *     this.exchanges = exchanges;
       *     if (!this.exchanges) this.exchanges = ["XNYS","XASE","XNAS","XASX","INDCBSX","INDXASE","INDXNAS","IND_DJI","ARCX","INDARCX","forex"];
       *     this.url = "https://symbols.chartiq.com/chiq.symbolserver.SymbolLookup.service";
       *     this.requestCounter = 0;  // Invalidate old requests.
       * };
       *
       * // Inherit all of the base lookup driver's properties.
       * CIQ.inheritsFrom(CIQ.ChartEngine.Driver.Lookup.ChartIQ, CIQ.ChartEngine.Driver.Lookup);
       */
      constructor(exchanges: string[])
      /**
       * Accepts text entered by the user, searches financial exchanges for symbols that match the
       * text, and returns an array of objects containing data that describes the matched symbols.
       *
       * You must implement this abstract method to fetch results from the exchanges you support and
       * return the results by calling `cb(results_array)`. (See the example implementation below.)
       *
       * Elements in the results array should be in the following format:
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
       * (See the example results array below.)
       *
       * @param text The text entered in the lookup component's input field.
       * @param [filter] The innerHTML of the selected cq-filter element of the
       * 		[cq-lookup]WebComponents.cq-lookup web component connected to the lookup
       * 		driver. Indicates which of the available exchanges should be searched for symbols that
       * 		match the input text.
       * @param maxResults Maximum number of results to return from the server.
       * @param cb Callback function to call when the search has returned results. The
       * 		results are passed to the callback function in an array (see the examples below).
       *
       * @abstract
       * @since 6.0.0
       *
       * @example <caption>Method Implementation (See also the example in
       * 		CIQ.ChartEngine.Driver.Lookup.)</caption>
       * CIQ.ChartEngine.Driver.Lookup.ChartIQ.prototype.acceptText = function(text, filter, maxResults, cb) {
       *     if (filter == "FX") filter = "FOREX";
       *     if (isNaN(parseInt(maxResults, 10))) maxResults = 100;
       *     const url = this.url + "?t=" + encodeURIComponent(text) + "&m="+maxResults+"&x=[";
       *     if (this.exchanges){
       *         url += this.exchanges.join(",");
       *     }
       *     url += "]";
       *     if (filter && filter.toUpperCase()! = "ALL") {
       *         url += "&e=" + filter;
       *     }
       *
       *     let counter = ++this.requestCounter;
       *     const self = this;
       *     function handleResponse(status, response){
       *         if (counter < self.requestCounter) return;
       *         if (status != 200) return;
       *         try {
       *             response = JSON.parse(response);
       *             let symbols = response.payload.symbols;
       *
       *             let results = [];
       *             for (let i = 0; i < symbols.length; i++) {
       *                 let fields = symbols[i].split('|');
       *                 let item = {
       *                     symbol: fields[0],
       *                     name: fields[1],
       *                     exchDisp: fields[2]
       *                 };
       *                 results.push({
       *                     display:[item.symbol, item.name, item.exchDisp],
       *                     data:item
       *                 });
       *             }
       *             cb(results);
       *         } catch(e) {}
       *     }
       *     CIQ.postAjax({url: url, cb: handleResponse});
       * };
       *
       * @example <caption>Sample Results Array</caption>
       * [
       *     { "display": ["A", "Agilent Technologies Inc", "NYSE"], "data": { "symbol": "A", "name": "Agilent Technologies Inc", "exchDisp": "NYSE" } },
       *     { "display": ["AA", "Alcoa Corp", "NYSE"], "data": { "symbol": "AA", "name": "Alcoa Corp", "exchDisp": "NYSE" } }
       * ];
       */
      public acceptText(
        text: string,
        filter: string | undefined,
        maxResults: number,
        cb: Function
      ): void
    }
  }

  /**
   * Namespace for Internationalization API.
   * See {@tutorial Localization} for more details.
   */
  export namespace CIQ.I18N {
    /**
     * The local language.
     *
     */
    let language: string
    /**
     * The list of languages that don't support shortening the local representation of the month
     * portion of the date.
     *
     * Customize this property by redefining the list of languages. See the example below.
     *
     *
     * @example
     * CIQ.I18N.longMonths = {
     *     "zh-CN": true
     * };
     */
    let longMonths: {
      zh: boolean
    }
    /**
     * The list of locales used by CIQ.I18N.setLocale to determine whether the up/down colors
     * of candles should be reversed.
     *
     * Customize this property by redefining the list of locales. See the example below.
     *
     * @since 4.0.0
     *
     * @example
     * CIQ.I18N.reverseColorsByLocale = {
     *     "zh": true,
     *     "ja": true,
     *     "fr": true,
     *     "de": true,
     *     "hu": true,
     *     "it": true,
     *     "pt": true
     * };
     */
    let reverseColorsByLocale: {
      zh: boolean,
      ja: boolean
    }
    /**
     *  nodes that contain that word. This can then be used for translation.
     *  Text nodes and placeholders which are found in the document tree will be wrapped by this function
     *  within a <translate> tag for easy translation back and forth.
     * @param  [root] root for the TreeWalker.  If omitted, document.body assumed.
     * @return      A word list containing unique words.
     */
    function findAllTextNodes(root?: HTMLElement): object
    /**
     * CIQ.I18N.missingWordList will scan the UI by walking all the text elements. It will determine which
     * text elements have not been translated for the given language and return those as a JSON object.
     * @param [language] The language to search for missing words. Defaults to whatever language CIQ.I18N.language has set.
     * @return Words that are undefined with values set to empty strings
     * @since 4.0.0 Iterates over the studyLibrary entry name, inputs, and outputs.
     */
    function missingWordList(language?: string): object
    /**
     * A convenience function for creating a JSON object containing words from
     * CIQ.I18N.missingWordList.
     *
     * @param [language=CIQ.I18N.language] The language for which words in
     * CIQ.I18N.missingWordList are included in the JSON object.
     * @return The list of of missing words.
     *
     */
    function printableMissingWordList(language?: string): string
    /**
     * Passes through the UI (DOM elements) and translates all of the text for the given language.
     *
     * It is important to note that if you are dynamically creating UI content and adding it to the
     * DOM after you have set the language, you must either call this function again after the new
     * content is added or ensure your code explicitly translates the new content using
     * CIQ.translatableTextNode or CIQ.ChartEngine#translateIf.
     *
     * @param [language=CIQ.I18N.language] The language into which the UI text is
     * 		translated.
     * @param [root=document.body] Root node for the DOM tree walker to prevent the
     * 		entire page from being translated.
     *
     * @since 4.0.0 Language code for Portuguese is now "pt" (formerly "pu", which is supported for
     * 		backward compatibility).
     */
    function translateUI(language?: string, root?: HTMLElement): void
    /**
     * Translates an individual word for a given language using CIQ.I18N.wordLists.
     *
     * Set `stxx.translationCallback` to this function to automatically translate all textual elements
     * on the chart.
     *
     * @param word The word to translate. To be translated, the word must be a property of
     * 		the object in CIQ.I18N.wordLists specified by `language` (see the example below).
     * @param [language=CIQ.I18N.language] The language to which the word is
     * 		translated. Identifies a property in CIQ.I18N.wordLists.
     * @return The translation of `word`, or the value of `word` if no translation is found.
     *
     *
     * @example <caption>Translate to Spanish</caption>
     * CIQ.I18N.wordLists = {
     *     "es": {
     *         "1 D": "1 D",
     *         "1 Hour": "1 Hora",
     *         "1 Min": "1 Min",
     *         "1 Mo": "1 Mes",
     *         "1 W": "1 S",
     *         "1 hour": "1 hora",
     *         "1d": "1d",
     *         "1m": "1m",
     *         "1y": "1a",
     *         "3m": "3m"
     *     }
     * };
     * CIQ.I18N.translate("1 Hour", "es"); // "1 Hora"
     */
    function translate(word: string, language?: string): string
    /**
     * Translates a phrase which may have untranslatable parts (like a study id).
     * The translatable pieces are delimited left and right with a non-printable character Zero-Width-Non_Joiner.
     * @param word The word to translate
     * @param [languageWordList] Map of words and translations in the desired language
     * @return Translation of the given phrase
     * @since 4.0.0
     */
    function translateSections(word: string, languageWordList?: object): string
    /**
     * Converts a 'CSV formatted' string of translations into the required JSON format and set to CIQ.I18N.wordLists
     * You can output CIQ.I18N.wordLists to the console and paste back in if desired.
     * @param [csv] Translation spreadsheet in csv format **as a single long string**.
     * Make sure there are no leading tabs, trailing commas or spaces.
     * Assumes that the header row of the CSV is the language codes and that the first column is the key language (English).
     * Assumes non-quoted words, data is comma delimited and lines separated by '\n'. Default is CIQ.I18N.csv
     * @example
     var csv="en,ar,fr,de,hu,it,pt,ru,es,zh,ja\nChart,الرسم البياني,Graphique,Darstellung,Diagram,Grafico,Gráfico,График,Gráfica,图表,チャート\nChart Style,أسلوب الرسم البياني,Style de graphique,Darstellungsstil,Diagram stílusa,Stile grafico,Estilo do gráfico,Тип графика,Estilo de gráfica,图表类型,チャート形式\nCandle,الشموع,Bougie,Kerze,Gyertya,Candela,Vela,Свеча,Vela,蜡烛,ローソク足\nShape,شكل,Forme,Form,Alak,Forma,Forma,Форма,Forma,形状,パターン";
     CIQ.I18N.convertCSV(csv);
     */
    function convertCSV(csv?: string): void
    /**
     * Convenience function to set up translation services for a chart and its surrounding GUI.
     * Automatically sets CIQ.I18N.language, loads all translations, and translates the chart.
     *
     * Uses/sets (in execution order):
     *  - CIQ.I18N.convertCSV
     *  - CIQ.I18N.language
     *  - CIQ.I18N.translateUI
     *  - CIQ.I18N.translate
     *
     * Feel free to create your own convenience function if required to explicitly set
     * CIQ.I18N.wordLists instead of using the `CIQ.I18N.hereDoc` copy/paste spreadsheet in
     * *translationSample.js*.
     *
     * It is important to note that if you are dynamically creating UI content and adding it to the
     * DOM after you have set the language, you must either call CIQ.I18N.translateUI after
     * the new content is added, or ensure your code explicitly translates the new content using
     * CIQ.translatableTextNode or CIQ.ChartEngine#translateIf.
     *
     * @param stx A chart object.
     * @param language A language in your csv file. For instance "en" from
     * 		`CIQ.I18N.csv` in *translationSample.js*.
     * @param [translationCallback] Function to perform canvas built-in word translations.
     * 		Default is CIQ.I18N.translate.
     * @param [csv] Translation spreadsheet in csv format **as a single long string**. Make
     * 		sure the string contains no leading tabs, trailing commas, or spaces. Default is
     * 		`CIQ.I18N.csv` in *translationSample.js*. See CIQ.I18N.convertCSV for a format
     * 		sample.
     * @param [root] Root element from which to start translating. If the parameter is
     * 		omitted, the chart UI context is checked for its top node before defaulting to
     * 		`document.body`.
     *
     * @since
     * - 04-2015
     * - 3.0.0 Added `root` parameter.
     * - 4.0.0 Language code for Portuguese is "pt" (formerly "pu"; maintained for backwards
     * 		compatibility).
     * - 8.2.0 If no `root` parameter, the chart UI context is checked for its top node before
     * 		defaulting to `document.body`.
     */
    function setLanguage(
      stx: CIQ.ChartEngine,
      language: string,
      translationCallback?: string,
      csv?: string,
      root?: HTMLElement
    ): void
    /**
     * This method will set the chart locale and check to see if candle colors should be reversed.
     *
     * If set, display prices and dates will be displayed in localized format.
     * The locale should be a valid [IANA locale](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl).
     * For instance `de-AT` represents German as used in Austria.
     *
     * CIQ.I18N.reverseColorsByLocale  is used to determine if the candle colors should be reversed.
     *
     * Localization in the library is supported through the `Intl object` which is a [W3 standard](https://www.w3.org/International/articles/language-tags/)  supported by all modern browsers.
     *
     * Once a locale is set, `stxx.internationalizer` will be an object that will contain several Intl formatters.
     *
     * These are the default date and time formats:
     * - stxx.internationalizer.hourMinute=new Intl.DateTimeFormat(this.locale, {hour:"numeric", minute:"numeric", hourCycle:"h23"});
     * - stxx.internationalizer.hourMinuteSecond=new Intl.DateTimeFormat(this.locale, {hour:"numeric", minute:"numeric", second:"numeric", hourCycle:"h23"});
     * - stxx.internationalizer.mdhm=new Intl.DateTimeFormat(this.locale, {year:"2-digit", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit"});
     * - stxx.internationalizer.monthDay=new Intl.DateTimeFormat(this.locale, {month:"numeric", day:"numeric"});
     * - stxx.internationalizer.yearMonthDay=new Intl.DateTimeFormat(this.locale, {year:"numeric", month:"numeric", day:"numeric"});
     * - stxx.internationalizer.yearMonth=new Intl.DateTimeFormat(this.locale, {year:"numeric", month:"numeric"});
     * - stxx.internationalizer.month=new Intl.DateTimeFormat(this.locale, {month:"short"});
     *
     * These can be overridden manually if the specified format is not acceptable. See example.
     * Also see [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat) for formatting alternatives
     *
     * @param stx A chart object
     * @param locale A valid [IANA locale](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl), for instance en-IN
     * @param [cb] Callback when locale has been loaded. This function will be passed an error message if it cannot be loaded.
     * @param [url] url where to fetch the locale data. Defaults to "locale-data/jsonp". Only used if not natively supported by the browser.
     * @param [maxDecimals] maximum number of decimal places to allow on number conversions. Defaults to 5. See CIQ.ChartEngine#setLocale for more details.
     * @since 3.0.0 Added `maxDecimals` parameter.
     * @example
     * CIQ.I18N.setLocale(stxx, "zh");	// set localization services -- before any UI or chart initialization is done
     * // override time formatting to enable 12 hour clock (hour12:true)
     * stxx.internationalizer.hourMinute=new Intl.DateTimeFormat(this.locale, {hour:"numeric", minute:"numeric", hour12:true});
     * stxx.internationalizer.hourMinuteSecond=new Intl.DateTimeFormat(this.locale, {hour:"numeric", minute:"numeric", second:"numeric", hour12:true});
     */
    function setLocale(
      stx: CIQ.ChartEngine,
      locale: string,
      cb?: Function,
      url?: string,
      maxDecimals?: number
    ): void
    /**
     * Extract the name of the month from the locale. We do this by creating a
     * localized date for the first date of each month. Then we extract the alphabetic characters.
     * MonthLetters then becomes the first letter of the month. The arrays are stored in stx.monthAbv and stx.monthLetters which
     * will then override the global arrays CIQ.monthAbv and CIQ.monthLetters.
     * @param  stx       Chart object
     * @param  formatter An Intl compatible date formatter
     * @param  locale    A valid Intl locale, such as en-IN
     */
    function createMonthArrays(stx: CIQ.ChartEngine, formatter: object, locale: string): void
    /**
     * A convenience function that sets locale and language at once. Each of these grouped functions are called with default arguments.
     * If you require custom parameters you will need to call each separately.
     *
     * It is important to note that if you are dynamically creating UI content and adding it to the DOM after you have set the language,
     * you must either call CIQ.I18N.translateUI after the new content is added,
     * or ensure your code explicitly translates the new content using CIQ.translatableTextNode or CIQ.ChartEngine#translateIf.
     *
     * Functions are called in the following order:
     * - CIQ.I18N.setLocale
     * - CIQ.I18N.setLanguage
     * - CIQ.I18N.reverseCandles - Called only if colors need to be reversed.
     *
     * @param stx Chart object
     * @param  locale    A valid Intl locale, such as en-IN
     * @since 4.0.0
     * @example
     * CIQ.I18N.localize(stxx, "zh");	// set translation and localization services -- before any UI or chart initialization is done
     * // override time formatting to enable 12 hour clock (hour12:true)
     * stxx.internationalizer.hourMinute=new Intl.DateTimeFormat(this.locale, {hour:"numeric", minute:"numeric", hour12:true});
     * stxx.internationalizer.hourMinuteSecond=new Intl.DateTimeFormat(this.locale, {hour:"numeric", minute:"numeric", second:"numeric", hour12:true});
     */
    function localize(stx: CIQ.ChartEngine, locale: string): void
    /**
     * Reverses the up/down candle colors, as preferred by some locales.
     *
     * Reverses the colors without changing the CSS.
     *
     * @param stx A reference to the chart engine.
     *
     * @since 4.0.0
     */
    function reverseCandles(stx: CIQ.ChartEngine): void
    /**
     * A list of word translations for one or more languages.
     *
     * CIQ.I18N.convertCSV assigns an object to this property based on a CSV-formatted string.
     * You can also set a value explicitly without using CIQ.I18N.convertCSV or
     * CIQ.I18N.setLanguage (see the example below).
     *
     *
     * @example <caption>Word translations for Arabic and Spanish.</caption>
     * // Setting explicitly without using CIQ.I18N.convertCSV or CIQ.I18N.setLanguage.
     * CIQ.I18N.wordLists = {
     *     "ar": {
     *         "1 D": "1ي",
     *         "1 Hour": "1 ساعة",
     *         "1 Min": "1د",
     *         "1 Mo": "1ش",
     *         "1 W": "أ1",
     *         "1 hour": "ساعة واحدة",
     *         "1d": "1يوم",
     *         "1m": "1شهر",
     *         "1y": "1عام",
     *         "3m": "3أشهر"
     *     },
     *     "es": {
     *         "1 D": "1 D",
     *         "1 Hour": "1 Hora",
     *         "1 Min": "1 Min",
     *         "1 Mo": "1 Mes",
     *         "1 W": "1 S",
     *         "1 hour": "1 hora",
     *         "1d": "1d",
     *         "1m": "1m",
     *         "1y": "1a",
     *         "3m": "3m"
     *     }
     * }
     */
    let wordLists: {
      en: {}
    }
    /**
     * A map of language codes to edonyms (language names in the mapped language). Can be used as a
     * data source for UI components, such as a language picker.
     *
     * The following languages are predefined:
     * - en: "English"
     *
     * The following additional languages are supported in the
     * *examples/translations/translationSample.js* file:
     * - "en-US": "English",
     * - "ar-EG": "عربى",
     * - "fr-FR": "Français",
     * - "de-DE": "Deutsche",
     * - "hu-HU": "Magyar",
     * - "it-IT": "Italiano",
     * - "pt-PT": "Português",
     * - "ru-RU": "русский",
     * - "es-ES": "Español",
     * - "zh-CN": "中文",
     * - "ja-JP": "日本語"
     *
     * You can add language mappings as follows:
     * ```
     * CIQ.I18N.languages.ko = "한국어";
     * ```
     *
     * You can remove unsupported languages by deleting the mappings from this object or by redefining
     * the object with only the languages you choose to support.
     *
     */
    let languages: {
      en: string
    }
    /**
     * A map of language codes to language-region codes for backward compatibility.
     *
     * The following locale / language-region codes are supported in the
     * *examples/translations/translationSample.js* file:
     * - en: "en-US"
     * - ar: "ar-EG"
     * - fr: "fr-FR"
     * - de: "de-DE"
     * - hu: "hu-HU"
     * - it: "it-IT"
     * - pt: "pt-PT"
     * - ru: "ru-RU"
     * - es: "es-ES"
     * - zh: "zh-CN"
     * - ja: "ja-JP"
     *
     * You can add code mappings as follows:
     * ```
     * CIQ.I18N.langConversionMap.ko = "ko-KR";
     * ```
     *
     * You can remove unsupported codes by deleting the mappings from this object or by redefining the
     * object with only the languages and regions you choose to support.
     *
     * @since 8.3.0
     */
    let langConversionMap: object
  }

  /**
   * Set of rules for identifying instrument's exchange and deriving a market definition from a symbol.
   * This is only required if your chart will need to know the operating hours for the different exchanges.
   * If using a 24x7 chart, this class is not needed.
   *
   * **Default implementation can be found in examples/markets/marketDefinitionsSample.js.  Please review and override the functions in there to match the symbol format of your quotefeed or results will be unpredictable.**
   *
   * @since 04-2016-08
   */
  export namespace CIQ.Market.Symbology {
    /**
     * Returns true if the instrument is foreign.
     *
     * **This is dependent on the market data feed and should be overridden accordingly.**
     *
     * @param   symbol The symbol
     * @return        True if it's a foreign symbol
     * @since 04-2016-08
     * @example
     * CIQ.Market.Symbology.isForeignSymbol=function(symbol){
     *	if(!symbol) return false;
     *	return symbol.indexOf(".")!=-1;
     * };
     */
    function isForeignSymbol(symbol: string): boolean
    /**
     * Returns true if the instrument is a future.
     *
     * **This is dependent on the market data feed and should be overridden accordingly.**
     *
     * @param   symbol The symbol
     * @return        True if it's a futures symbol
     * @since 04-2016-08
     * @example
     * CIQ.Market.Symbology.isFuturesSymbol=function(symbol){
     *	if(!symbol) return false;
     *	if(symbol.indexOf("/")!==0 || symbol=="/") return false;
     *	return true;
     * };
     */
    function isFuturesSymbol(symbol: string): boolean
    /**
     * Determines whether an instrument is a rate.
     *
     * **Note:** This function is dependent on the market data feed and should be overridden accordingly.
     *
     * @param   symbol The symbol.
     * @return        By default, false. Override this function to return true if the symbol
     * 					is a rate family or rate.
     * @since 7.4.0
     * @example
     * CIQ.Market.Symbology.isRateSymbol=function(symbol){
     *	if(!symbol) return false;
     *	if(symbol.indexOf("%")!==0 || symbol=="%") return false;
     *	return true;
     * };
     */
    function isRateSymbol(symbol: string): boolean
    /**
     * Returns true if the instrument is a forex symbol.
     *
     * **This is dependent on the market data feed and should be overridden accordingly.**
     *
     * @param   symbol The symbol
     * @return        True if it's a forex symbol
     * @since 04-2016-08
     * @example
     * CIQ.Market.Symbology.isForexSymbol=function(symbol){
     *	if(!symbol) return false;
     *  if(CIQ.Market.Symbology.isForeignSymbol(symbol)) return false;
     *  if(CIQ.Market.Symbology.isFuturesSymbol(symbol)) return false;
     *	if(symbol.length<6 || symbol.length>7) return false;
     *	if(symbol.length==6 && symbol[5]=="X") return false;  // This is a fund of some sort
     *	if(/\^?[A-Za-z]{6}/.test(symbol)) return true;
     *	return false;
     * };
     */
    function isForexSymbol(symbol: string): boolean
    /**
     * Returns true if the symbol is a metal/currency or currency/metal pair
     *
     * **This is dependent on the market data feed and should be overridden accordingly.**
     *
     * @param    symbol The symbol
     * @param   inverse Set to true to test specifically for a currency/metal pair (e.g. EURXAU, but not XAUEUR).
     * @return  True if it's a metal symbol
     * @since 04-2016-08
     * @example
     * CIQ.Market.Symbology.isForexMetal=function(symbol,inverse){
     *	var metalsSupported={
     *		"XAU":true, "XAG":true, "XPT":true, "XPD":true
     *	};
     *	if(!symbol) return false;
     *  if(!CIQ.Market.Symbology.isForexSymbol(symbol)) return false;
     *	if(symbol.charAt(0)!="^") symbol="^"+symbol;
     *	if(!metalsSupported[symbol.substring(1,4)] && metalsSupported[symbol.substring(4,7)]) return true;
     *	else if(!inverse && metalsSupported[symbol.substring(1,4)] && !metalsSupported[symbol.substring(4,7)]) return true;
     *	return false;
     * };
     */
    function isForexMetal(symbol: string, inverse: boolean): boolean
    /**
     * Returns true if the symbol is a forex or a future
     *
     * @param  symbol The symbol
     * @return True if the symbol is a forex or a future
     * @since 04-2016-08
     */
    function isForexFuturesSymbol(symbol: string): boolean
    /**
     * This is a function that takes a symbolObject of form accepted by CIQ.ChartEngine#loadChart, and returns a market definition.
     * When loading it with CIQ.ChartEngine#setMarketFactory, it will be used by the chart to dynamically change market definitions when a new instrument is activated.
     *
     * **Very important:**
     * Default implementation can be found in examples/markets/marketDefinitionsSample.js.  Please review and override the functions in there to match the symbol format of your quotefeed or results will be unpredictable.
     *
     * See CIQ.Market for instruction on how to create a market definition.
     * @param  symbolObject Symbol object of form accepted by CIQ.ChartEngine#loadChart
     * @return A market definition. See CIQ.Market for instructions.
     * @since 04-2016-08
     * @example
     * // default implementation
     * var factory=function(symbolObject){
     * 	var symbol=symbolObject.symbol;
     *	if(CIQ.Market.Symbology.isForeignSymbol(symbol)) return null; // 24 hour market definition
     *	if(CIQ.Market.Symbology.isFuturesSymbol(symbol)) return CIQ.Market.GLOBEX;
     *	if(CIQ.Market.Symbology.isForexMetal(symbol)) return CIQ.Market.METALS;
     *	if(CIQ.Market.Symbology.isForexSymbol(symbol)) return CIQ.Market.FOREX;
     *	return CIQ.Market.NYSE;
     * };
     */
    function factory(symbolObject: object): object
    /**
     * Encodes the string identifier for a specific instrument in a term structure chart. This
     * function is called when a time series chart is opened for a term structure instrument.
     * See CIQ.UI.CurveEdit.launchTimeSeries.
     *
     * Typically, the implementation of this function concatenates the term structure entity with
     * the instrument name to fully identify the instrument on the time series chart (see example).
     *
     * Override this function to specify whatever encoding you need for your use case.
     *
     * @param entity The symbol/entity for the curve; for example, "US-T BENCHMARK".
     * @param instrument An individual instrument; for example, "20 YR".
     * @return The symbol for the individual instrument; for example, "US-T BENCHMARK 20 YR".
     *
     * @since 7.4.0
     *
     * @example
     * CIQ.Market.Symbology.encodeTermStructureInstrumentSymbol = function(entity, instrument) {
     *     // Remove leading % sign.
     *     if (entity[0] === "%") entity = entity.slice(1);
     *     return entity + " " + instrument;
     * };
     */
    function encodeTermStructureInstrumentSymbol(entity: string, instrument: string): string
  }

  /**
   * Namespace for functionality related to comparison series.
   *
   */
  export namespace CIQ.Comparison {
    /**
     * For relative comparisons, this is the starting (baseline) point.
     *
     * Valid options are:
     * - A number to specify an absolute amount to be used as the starting value for all percentage changes.
     * - A string containing the symbol of an existing series to be used as the starting value for the comparisons (for instance "IBM"). Computations will then be based on the change from the first visible bar value for the selected symbol.
     * - An empty string will compare against the baseline value of the main series (same as in "percent" scale).
     *
     * See CIQ.ChartEngine#setChartScale for more details.
     * @since 5.1.0
     */
    let initialPrice: number | string
    /**
     * Transform function for percent comparison charting
     * @param  stx	  The charting object
     * @param  chart	The specific chart
     * @param  price The price to transform
     * @return			The transformed price (into percentage)
     */
    function priceToPercent(
      stx: CIQ.ChartEngine,
      chart: CIQ.ChartEngine.Chart,
      price: number
    ): number
    /**
     * Untransform function for percent comparison charting
     * @param  stx	  The charting object
     * @param  chart	The specific chart
     * @param  percent The price to untransform
     * @return			The untransformed price
     */
    function percentToPrice(
      stx: CIQ.ChartEngine,
      chart: CIQ.ChartEngine.Chart,
      percent: number
    ): number
    /**
     * Transform function for relative comparison charting
     * @param  stx	  The charting object
     * @param  chart	The specific chart
     * @param  price The price to transform
     * @return			The transformed price (relative to CIQ.Comparison.initialPrice)
     * @since 5.1.0
     */
    function priceToRelative(
      stx: CIQ.ChartEngine,
      chart: CIQ.ChartEngine.Chart,
      price: number
    ): number
    /**
     * Untransform function for relative comparison charting
     * @param  stx	  The charting object
     * @param  chart	The specific chart
     * @param  relative The price to untransform
     * @return			The untransformed price
     * @since 5.1.0
     */
    function relativeToPrice(
      stx: CIQ.ChartEngine,
      chart: CIQ.ChartEngine.Chart,
      relative: number
    ): number
    /**
     * Formats the percentage values on the comparison chart
     * @param  stx	The chart object
     * @param  panel The panel
     * @param  price The raw percentage as a decimal
     * @return		  The percentage formatted as a percent (possibly using localization if set in stx)
     */
    function priceFormat(
      stx: CIQ.ChartEngine,
      panel: CIQ.ChartEngine.Panel,
      price: number
    ): string
  }

  /**
   * Manages chart sharing and uploading.
   *
   * See the {@tutorial Chart Sharing} tutorial for more details.
   *
   */
  export namespace CIQ.Share {
    /**
     * Convenience function that serves as a wrapper for createImage and uploadImage.
     * It will create an image using the default parameters. If you wish to customize the image you must use CIQ.Share.createImage separately and then call CIQ.Share.uploadImage.
     * @param	stx Chart Object
     * @param  [override] Parameters that overwrite the default hosting location from https://share.chartiq.com to a custom location.
     * @param	[override.host]
     * @param	[override.path]
     * @param	cb Callback when the image is uploaded.
     * @since 2015-11-01
     * @example
     *  // here is the exact code this convenience function is using
     CIQ.Share.createImage(stx, {}, function(imgData){
     var id=CIQ.uniqueID();
     var host="https://share.chartiq.com";
     var url= host + "/upload/" + id;
     if(override){
     if(override.host) host=override.host;
     if(override.path) url=host+override.path+"/"+id;
     }
     var startOffset=stx.getStartDateOffset();
     var metaData={
     "layout": stx.exportLayout(),
     "drawings": stx.exportDrawings(),
     "xOffset": startOffset,
     "startDate": stx.chart.dataSegment[startOffset].Date,
     "endDate": stx.chart.dataSegment[stx.chart.dataSegment.length-1].Date,
     "id": id,
     "symbol": stx.chart.symbol
     };
     var payload={"id": id, "image": imgData, "config": metaData};
     CIQ.Share.uploadImage(imgData, url, payload, function(err, response){
     if(err!==null){
     CIQ.alert("error sharing chart: ",err);
     }else{
     cb(host+response);
     }
     });
     // end sample code to upload image to a server
     });
     *
     */
    function shareChart(
      stx: object,
      override: {host?:object,path?:object} | undefined,
      cb: Function
    ): void
    /**
     * Creates a png image of the current chart and everything inside the container associated with the chart when it was instantiated; including HTML.
     * Elements outside the chart container will **NOT** be included.
     *
     * If widthPX and heightPX are passed in then the image will be scaled to the requested dimensions.
     *
     * It will dynamically try to load `js/thirdparty/html2canvas.min.js` if not already loaded.
     *
     * This function is asynchronous and requires a callback function.
     * The callback will be passed a data object or canvas which can be sent to a server or converted to an image.
     *
     * Important Notes:
     * - **This method will rely on Promises. If your browser does not implement Promises, be sure to include a polyfill.**
     *
     * - **This method does not always work with React or Safari**
     *
     * - **Canvases can only be exported if all the contents including CSS images come from the same domain,
     * or all images have cross origin set properly and come from a server that supports CORS; which may or may not be possible with CSS images.**
     *
     * - **When using the charts from `file:///`, make sure to include `html2canvas` statically instead of allowing this method to load it dynamically.**
     * Example:
     * `<script src="js/thirdparty/html2canvas.min.js"></script>`
     *
     * @param    stx           Chart object
     * @param			[params]			Parameters to describe the image.
     * @param    [params.widthPX]       Width of image to create. If passed then params.heightPX  will adjust to maintain ratio.
     * @param    [params.heightPX]      Height of image to create. If passed then params.widthPX will adjust to maintain ratio.
     * @param    [params.imageType]   Specifies the file format your image will be output in. The dfault is PNG and the format must be suported by your browswer.
     * @param 	[params.hide] Array of strings; array of the CSS selectors of the DOM elements to hide, before creating a PNG
     * @param  cb            Callback when image is available fc(data) where data is the serialized image object
     * @since
     * - 3.0.0 Function signature changed to take parameters.
     * - 4.0.0 Addition of `parameters.hide`.
     * @version ChartIQ Advanced Package plug-in
     */
    function createImage(
      stx: object,
      params: {widthPX?:number,heightPX?:number,imageType?:string,hide?:any[]} | undefined,
      cb: Function
    ): void
    /**
     * Uploads an image to a server. The callback will take two parameters. The first parameter is an error
     * condition (server status), or null if there is no error. The second parameter (if no error) will contain
     * the response from the server.
     * 'payload' is an optional object that contains meta-data for the server. If payload exists then the image will be added as a member of the payload object, otherwise an object will be created
     * 'dataImage' should be a data representation of an image created by the call canvas.toDataURL such as is returned by CIQ.Share.createImage
     * If you are getting a status of zero back then you are probably encountering a cross-domain ajax issue. Check your access-control-allow-origin header on the server side
     * @param    dataImage Serialized data for image
     * @param    url       URL to send the image
     * @param    [payload]   Any additional data to send to the server should be sent as an object.
     * @param  cb        Callback when image is uploaded
     * @version ChartIQ Advanced Package plug-in
     */
    function uploadImage(
      dataImage: string,
      url: string,
      payload: object | undefined,
      cb: Function
    ): void
  }

  /**
   * Creates a DOM object capable of receiving a data stream. The object changes as a result of the incoming data.
   * The constructor function takes attributes that define how and where in the HTML document the object gets created.
   * See CIQ.Visualization#setAttributes for more information on attributes.
   *
   * One useful application of this is to render an SVG graphic.
   *
   * Methods are provided to pass data into the object and to render it in the HTML document. Note that the `data` and
   * `attributes` that are passed into the prototype methods of this object become owned by it and therefore can be mutated.
   *
   * The DOM object-generating function can assign class names to subelements within the object. These class names can be used
   * to style the object using CSS. Documentation for the built-in functions explains which classes are available to be styled.
   *
   * 		and attributes as arguments *by reference* and returns an `HTMLElement` (which may have children).
   * 		a container element is created with 300 x 300 pixel dimensions.
   * 		gridlines. **Note:** Consider using CIQ.ChartEngine#embedVisualization; it automatically places the object
   * 		within the canvases.
   * 		Do not set if `renderFunction` can handle an incremental update of the object. Alternatively, `renderFunction` might set
   * 		this attribute. When attributes are updated using `setAttributes`, a complete replacement occurs.
   * @example
   * let svg=new CIQ.Visualization({ renderFunction: CIQ.SVGChart.renderPieChart });
   * svg.updateData({"Low":{name:"low", value:30}, "High":{name:"high", value:70}});
   * @since 7.4.0
   */
  export namespace CIQ.Visualization {
    /**
     * READ ONLY. The DOM container that hosts the DOM object.
     *
     * @since 7.4.0
     */
    const container: HTMLElement
    /**
     * READ ONLY. The attributes used to render the DOM object. See the [function description]CIQ.Visualization
     * for details. Do not change this property directly; instead, use CIQ.Visualization#setAttributes.
     * @since 7.4.0
     */
    const attributes: object
    /**
     * READ ONLY. The data used to render the DOM object. See the [function description]CIQ.Visualization
     * for details. Do not change this property directly; instead, use CIQ.Visualization#updateData.
     * @since 7.4.0
     */
    const data: object
    /**
     * READ ONLY. The DOM object created by the rendering function.
     *
     * @since 7.4.0
     */
    const object: HTMLElement
  }
}
export function createEngine(_export): void
export function customCharts(_export): void
export function drawing(_export): void
export function easeMachine(_export): void
export function equations(_export): void
export function i18n(_export): void
export function interaction(_export): void
export function markers(_export): void
export function market(_export): void
export function movement(_export): void
export function nameValueStore(_export): void
export function quoteFeed(_export): void
export function series(_export): void
export function share(_export): void
export function span(_export): void
export function storage(_export): void
export function studies(_export): void
export function symbolLookupBase(_export): void
export function theme(_export): void
export function timezone(_export): void
export function touch(_export): void
export function visualization(_export): void
export function medianPrice(_export): void
export function momentum(_export): void
export function priceRelative(_export): void
export function vwap(_export): void
export function zigzag(_export): void