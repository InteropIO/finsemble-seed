/**
 * Previously `STXChart`.
 *
 * This is the constructor that creates a chart engine, instantiates its basic chart object and links it to its DOM container.
 *
 * Before any chart operations can be performed, this constructor must be called.
 *
 * Multiple CIQ.ChartEngine objects can exist on the same HTML document.
 * 	<iframe width="100%" height="500" scrolling="no" seamless="seamless" align="top" style="float:top" src="https://jsfiddle.net/chartiq/46whz5ag/embedded/result,js,html/" allowfullscreen="allowfullscreen" frameborder="1"></iframe>
 *
 * Once instantiated, the chart engine will never need to be constructed again, unless it is [destroyed]CIQ.ChartEngine#destroy.
 * To load or change symbols on the chart, simply call CIQ.ChartEngine#loadChart.
 *
 * CIQ.ChartEngine#container is the minimum requirement. The complete list of parameters and objects can be found in the **Members** section of this page.
 * Example:
 * 	<iframe width="100%" height="500" scrolling="no" seamless="seamless" align="top" style="float:top" src="https://jsfiddle.net/chartiq/xkm4mufy/embedded/js,result,html/" allowfullscreen="allowfullscreen" frameborder="1"></iframe>
 * @example
 * // declare a chart
 * var stxx=new CIQ.ChartEngine({container: document.querySelector(".chartContainer")});
 * // override defaults after a chart object is declared (this can be done at any time. If the chart has already been rendered, you will need to call `stx.draw();` to immediately see your changes )
 * stxx.yaxisLabelStyle="roundRectArrow";
 * stxx.layout.chartType="bar";
 * @example
 * // declare a chart and preset defaults
 * var stxx=new CIQ.ChartEngine({container: document.querySelector(".chartContainer"),layout:{"chartType": "candle","candleWidth": 16}});
 * @since
 * - 15-07-01 Deprecated `CIQ.ChartEngine#underlayPercentage`.
 * - m-2016-12-01 Deprecated; renamed `CIQ.ChartEngine` from `STXChart`.
 */
export namespace CIQ.ChartEngine {
  /**
   * OHLC Quote. This is the data format that the CIQ.ChartEngine recognizes.
   * All quotes must at least have a DT property that is a JavaScript Date in order to be valid, every other value is nullable.
   * Quotes can contain as many properties as you would like, allowing the ChartEngine to plot any value.
   *
   * @prop {number} Open The opening price of the quote.
   * @prop {number} High The highest price of the quote.
   * @prop {number} Low The lowest price of the quote.
   * @prop {number} Close The closing price of the quote.
   * @prop {number} Volume The number of shares traded.
   * @prop {!Date} DT The date and time of the quote.
   */
  interface OHLCQuote {
  }

  /**
   * CIQ.ChartEngine.RangeParameters interface placeholder to be augmented in *standard.js* with properties.
   *
   */
  interface RangeParameters {
  }

  /**
   * CIQ.ChartEngine.SpanParameters interface placeholder to be augmented in *standard.js* with properties.
   *
   */
  interface SpanParameters {
  }

  /**
   * CIQ.ChartEngine.currentVectorParameters interface placeholder to be augmented in *standard.js* with properties.
   *
   */
  interface currentVectorParameters {
  }

  /**
   * Specifies the properties that define periodicity.
   *
   * Periodicity = `period` x `interval` expressed as `timeUnit`.
   *
   * Referenced as the type of the main parameter of CIQ.ChartEngine#setPeriodicity, the
   * periodicity parameter of CIQ.ChartEngine#loadChart, and the return value of
   * CIQ.ChartEngine#getPeriodicity.
   *
   * 		into a single data point, such as a candle on a candle chart. For example, `period=2`,
   * 		`interval=5`, and `timeUnit="minute"` results in candles that represent 10-minute time
   * 		spans.
   * 		example, `interval=5` and `timeUnit="minute"` specify a periodicity of five minutes.
   * 		The interval property enables the chart to fetch quotes in a roll-up state; for
   * 		example, if the data source provides one-minute quotes, setting `interval=5` results
   * 		in the chart fetching five one-minute quotes as a single data point.
   * 		include "millisecond", "second", "minute", "day", "week", "month", and "tick".
   */
  interface PeriodicityParameters {
    /**
     * The number of elements from the data source to roll-up (aggregate)
     */
    period: number
    /**
     * The number of units of measure of the periodicity. For
     * @default 1
     */
    interval?: string|number
    /**
     * The unit of measure of the periodicity. Valid values
     * @default "minute"
     */
    timeUnit?: string|null
  }

  /**
   * An object that describes how the renderer should draw a specific part of the chart as
   * generated and returned by CIQ.ChartEngine~colorFunction.
   *
   */
  interface colorObject {
    /**
     * Any string value that can be interpreted by the canvas context.
     */
    color: string
    /**
     * Description of the pattern in an on/off value description.
     */
    pattern: any[]
    /**
     * Width in pixels in which the pattern should be drawn.
     */
    width: number
  }

  /**
   * Called by CIQ.ChartEngine#touchDoubleClick when the chart
   * is quickly tapped twice.
   *
   * @param data Data relevant to the "tap" event.
   * @param data.stx The chart engine instance.
   * @param data.finger Indicates which finger double-tapped.
   * @param data.x The crosshairs x-coordinate.
   * @param data.y The crosshairs y-coordinate.
   *
   * @callback CIQ.ChartEngine~doubleTapEventListener
   * @since 4.0.0
   *
   * @see CIQ.ChartEngine#addEventListener
   */
  type doubleTapEventListener = (data: {stx: CIQ.ChartEngine,finger: number,x: number,y: number}) => void

  /**
   * Called by CIQ.ChartEngine#doubleClick when the chart is quickly clicked or
   * tapped twice.
   *
   * @param data Data relevant to the double-click or double-tap event.
   * @param data.stx The chart engine instance.
   * @param data.button The button or finger that double-clicked or
   * 		double-tapped.
   * @param data.x The double-click or crosshairs x-coordinate.
   * @param data.y The double-click or crosshairs y-coordinate.
   *
   * @callback CIQ.ChartEngine~doubleClickEventListener
   * @since 8.0.0
   *
   * @see CIQ.ChartEngine#addEventListener
   */
  type doubleClickEventListener = (data: {stx: CIQ.ChartEngine,button: number,x: number,y: number}) => void

  /**
   * Called when a drawing is added, removed, or modified.
   *
   * Such as calling CIQ.ChartEngine#clearDrawings,
   * CIQ.ChartEngine#removeDrawing, CIQ.ChartEngine#undoLast, or
   * CIQ.ChartEngine#drawingClick.
   *
   * @param data Data relevant to the "drawing" event.
   * @param data.stx The chart engine instance.
   * @param data.symbol The current chart symbol.
   * @param data.symbolObject The symbol's value and display label
   * 		(CIQ.ChartEngine.Chart#symbolObject).
   * @param data.layout The chart's layout object (CIQ.ChartEngine#layout).
   * @param data.drawings The chart's current drawings (CIQ.Drawing).
   *
   * @callback CIQ.ChartEngine~drawingEventListener
   *
   * @see CIQ.ChartEngine#addEventListener
   */
  type drawingEventListener = (data: {stx: CIQ.ChartEngine,symbol: string,symbolObject: object,layout: object,drawings: any[]}) => void

  /**
   * A right-click on a highlighted drawing.
   *
   * @param data Data relevant to the "drawingEdit" event.
   * @param data.stx The chart engine instance.
   * @param data.drawing The highlighted drawing instance.
   *
   * @callback CIQ.ChartEngine~drawingEditEventListener
   *
   * @see CIQ.ChartEngine#addEventListener
   */
  type drawingEditEventListener = (data: {stx: CIQ.ChartEngine,drawing: CIQ.Drawing}) => void

  /**
   * Called to open a window that can be moved and resized by the user.
   *
   * For example, called by CIQ.Shortcuts to display the keyboard shortcuts legend.
   *
   * @param data Data relevant to the "floatingWindow" event.
   * @param data.type The type of floating window to open; for example, "shortcut"
   * 		for a floating window containing the keyboard shortcuts legend (see
   * 		CIQ.Shortcuts).
   * @param data.content The contents of the floating window, typically an HTML
   * 		string.
   * @param [data.container] The DOM element that visually contains the floating
   * 		window. The window is positioned on screen relative to the element (see
   * 		WebComponents.cq-floating-window.DocWindow#positionRelativeTo). Defaults
   * 		to `document.body`.
   * 		<p>**Note:** The markup of the DOM element does not need to lexically contain the
   * 		markup of the floating window.
   * @param [data.title] Text that appears in the title bar of the floating window.
   * @param [data.width] The width of the floating window in pixels.
   * @param [data.status] The floating window state: true, to open the floating
   * 		window; false, to close it. If the parameter is not provided, the floating window
   * 		is toggled (opened if closed, closed if open).
   * @param [data.tag] A label that identifies the floating window type; for
   * 		example, "shortcut", which indicates that the floating window contains the keyboard
   * 		shortcuts legend.
   * 		<p>**Note:** Use this parameter to manage floating windows in a multi-chart
   * 		document. Only one instance of a floating window is created for a given tag
   * 		regardless of how many "floatingWindow" events occur having that tag, in which
   * 		case a floating window can be shared by multiple charts. If floating windows do
   * 		not have tags, new floating windows are created for new "floatingWindow" events
   * 		even though the events may have the same `type` (see above).
   * @param [data.onClose] A callback to execute when the floating window is
   * 		closed.
   *
   * @callback CIQ.ChartEngine~floatingWindowEventListener
   * @since 8.2.0
   *
   * @see CIQ.ChartEngine#addEventListener
   */
  type floatingWindowEventListener = (data: {type: string,content: string,container?: object,title?: string,width?: number,status?: boolean,tag?: string,onClose?: Function}) => void

  /**
   * Called when a change occurs in the chart layout.
   *
   * Layout changes are caused by:
   * - Calling CIQ.ChartEngine#setChartType,
   *   CIQ.ChartEngine#setAggregationType, CIQ.ChartEngine#setChartScale, or
   *   CIQ.ChartEngine#setAdjusted
   * - Using the WebComponents.cq-toolbar to disable the current active drawing tool
   *   or toggling the crosshair
   * - Using the WebComponents.cq-views to activate a serialized layout
   * - Modifying a series (CIQ.ChartEngine#modifySeries)
   * - Setting a new periodicity (CIQ.ChartEngine#setPeriodicity)
   * - Adding or removing a study overlay
   *   (CIQ.ChartEngine#removeOverlay)
   * - Adding or removing any new panels (and their corresponding studies)
   * - Zooming in (CIQ.ChartEngine#zoomIn) or
   *   zooming out (CIQ.ChartEngine#zoomOut)
   * - Setting ranges with CIQ.ChartEngine#setSpan or
   *   CIQ.ChartEngine#setRange
   * - Nullifying a programmatically set span or range by user panning
   * - Enabling or disabling [extended hours]CIQ.ExtendedHours
   * - Toggling the [range slider]CIQ.RangeSlider
   *
   * **Note** Scrolling and panning changes are not considered a layout change but rather a
   * shift of the view window in the same layout. To detect those, register to listen for
   * ["scroll" events]CIQ.ChartEngine~scrollEventListener.
   *
   * @param data Data relevant to the "layout" event.
   * @param data.stx The chart engine instance.
   * @param data.symbol The current chart symbol.
   * @param data.symbolObject The symbol's value and display label
   * 		(CIQ.ChartEngine.Chart#symbolObject).
   * @param data.layout The chart's layout object (CIQ.ChartEngine#layout).
   * @param data.drawings The chart's current drawings (CIQ.Drawing).
   *
   * @callback CIQ.ChartEngine~layoutEventListener
   *
   * @see CIQ.ChartEngine#addEventListener
   */
  type layoutEventListener = (data: {stx: CIQ.ChartEngine,symbol: string,symbolObject: object,layout: object,drawings: any[]}) => void

  /**
   * Called when the mouse is clicked on the chart and held down.
   *
   * @param data Data relevant to the "longhold" event.
   * @param data.stx The chart engine instance.
   * @param data.panel The panel being clicked.
   * @param data.x The crosshair x-coordinate.
   * @param data.y The crosshair y-coordinate.
   *
   * @callback CIQ.ChartEngine~longholdEventListener
   *
   * @see CIQ.ChartEngine#addEventListener
   */
  type longholdEventListener = (data: {stx: CIQ.ChartEngine,panel: string,x: number,y: number}) => void

  /**
   * Called when the pointer is moved inside the chart, even on panning or horizontal
   * swiping.
   *
   * @param data Data relevant to the "move" event.
   * @param data.stx The chart engine instance.
   * @param data.panel The panel where the mouse is active.
   * @param data.x The pointer x-coordinate.
   * @param data.y The pointer y-coordinate.
   * @param data.grab True if the chart is being dragged.
   *
   * @callback CIQ.ChartEngine~moveEventListener
   *
   * @see CIQ.ChartEngine#addEventListener
   */
  type moveEventListener = (data: {stx: CIQ.ChartEngine,panel: string,x: number,y: number,grab: boolean}) => void

  /**
   * Called when the [quotefeed interface](quotefeed.html) loads a complete data set as
   * a result of:
   * - [symbol changes]CIQ.ChartEngine#loadChart or
   * - [periodicity]CIQ.ChartEngine#setPeriodicity,
   * [range]CIQ.ChartEngine#setRange, or [span]CIQ.ChartEngine#setSpan
   * changes requiring new data.
   *
   * @param data Data relevant to the "newChart" event.
   * @param data.stx The chart engine instance.
   * @param data.symbol The current chart symbol.
   * @param data.symbolObject The symbol's value and display label,
   * 		CIQ.ChartEngine.Chart#symbolObject.
   * @param data.moreAvailable True if quotefeed~dataCallback reports
   * 		that more data is available.
   * @param data.upToDate True if quotefeed~dataCallback reports that
   * 		no more future data is available.
   * @param data.quoteDriver The quote feed driver.
   *
   * @callback CIQ.ChartEngine~newChartEventListener
   * @since 8.0.0 Added the `upToDate` parameter.
   *
   * @see CIQ.ChartEngine#addEventListener
   */
  type newChartEventListener = (data: {stx: CIQ.ChartEngine,symbol: string,symbolObject: object,moreAvailable: boolean,upToDate: boolean,quoteDriver: object}) => void

  /**
   * Called when a message toaster notification event (a toast) has occurred.
   *
   * @param data Either an object containing data relevant to the
   * 		notification event or a string that identifies a property of the `systemMessages`
   * 		property of the chart configuration object. The property contained in
   * 		`systemMessages` is an object literal that specifies data relevant to the
   * 		notification event (see
   * 		<a href="tutorial-Chart%20Configuration.html#systemmessages" target="_blank">
   * 		<code class="codeLink">systemMessages</code></a> in the
   * 		<a href="tutorial-Chart%20Configuration.html" target="_blank">Chart
   * 		Configuration</a> tutorial).
   * @param data.message Text to display in the notification.
   * @param [data.position="top"] Alignment of the notification: "top" or "bottom".
   * 		Overrides the `defaultPosition` attribute of the
   * 		[`<cq-message-toaster>`]WebComponents.cq-message-toaster element.
   * @param [data.type="info"] Notification style: "info", "error", "warning", or
   * 		"confirmation".
   * @param [data.transition] Type of animation used to display and dismiss (remove)
   * 		the notification: "fade", "slide", "pop" or "drop". The default is no transition.
   * 		Overrides the `defaultTransition` attribute of the
   * 		[`<cq-message-toaster>`]WebComponents.cq-message-toaster element.
   * @param [data.displayTime=10] Number of seconds to display the notification
   * 		before automatically dismissing it. A value of 0 causes the notification to remain
   * 		on screen&nbsp;—&nbsp;preventing other notifications from
   * 		displaying&nbsp;—&nbsp;until the notification is selected by the user and
   * 		dismissed. Overrides the `defaultDisplayTime` attribute of the
   * 		[`<cq-message-toaster>`]WebComponents.cq-message-toaster element.
   * @param [data.priority=0] Priority of the notification relative to others in
   * 		the notification queue. Higher priority notifications are displayed before
   * 		notifications with lower priority. For example, a notification with
   * 		priority&nbsp;=&nbsp;4 is displayed before a notification with
   * 		priority&nbsp;=&nbsp;1. Notifications with the same priority are displayed
   * 		in the order they were created; that is, in the order they entered the
   * 		notification queue.
   * @param [data.callback] Function to call when the notification is selected
   * 		(dismissed) by the user. If the notification is dismissed automatically (see
   * 		`displayTime`), this function is not called.
   *
   * @callback CIQ.ChartEngine~notificationEventListener
   * @since 8.2.0
   *
   * @see CIQ.ChartEngine#addEventListener
   */
  type notificationEventListener = (data: {message: string,position?: string,type?: string,transition?: string,displayTime?: number,priority?: number,callback?: Function}) => void

  /**
   * Called when the periodicity is changed, for example, by
   * CIQ.ChartEngine#setPeriodicity.
   *
   * This event listener can be used instead of
   * [layoutEventListener]CIQ.ChartEngine~layoutEventListener for events that only
   * need to be triggered when the periodicity changes.
   *
   * @param data Data relevant to the "periodicity" event.
   * @param data.stx Reference to the chart engine.
   * @param data.differentData Indicates whether the chart needs new data to
   * 		conform with the new periodicity. Typically, the value for this parameter is
   * 		obtained from a call to CIQ.ChartEngine#needDifferentData.
   * @param data.prevPeriodicity The periodicity
   * 		before the periodicity change event.
   *
   * @callback CIQ.ChartEngine~periodicityEventListener
   * @since 8.1.0
   *
   * @see CIQ.ChartEngine#addEventListener
   */
  type periodicityEventListener = (data: {stx: CIQ.ChartEngine,differentData: boolean,prevPeriodicity: CIQ.ChartEngine.PeriodicityParameters}) => void

  /**
   * Called when preferences are changed.
   *
   * Such as when calling CIQ.ChartEngine#setTimeZone,
   * CIQ.ChartEngine#importPreferences, CIQ.Drawing.saveConfig, or
   * CIQ.Drawing.restoreDefaultConfig or when making language changes using the
   * WebComponents.cq-language-dialog.
   *
   * @param data Data relevant to the "preferences" event.
   * @param data.stx The chart engine instance.
   * @param data.symbol The current chart symbol.
   * @param data.symbolObject The symbol's value and display label
   * 		(CIQ.ChartEngine.Chart#symbolObject).
   * @param data.layout The chart's layout object (CIQ.ChartEngine#layout).
   * @param data.drawingObjects The chart's current drawings
   * 		(CIQ.ChartEngine#drawingObjects).
   *
   * @callback CIQ.ChartEngine~preferencesEventListener
   *
   * @see CIQ.ChartEngine#addEventListener
   */
  type preferencesEventListener = (data: {stx: CIQ.ChartEngine,symbol: string,symbolObject: object,layout: object,drawingObjects: any[]}) => void

  /**
   * Called on "mouseup" after the chart is right-clicked.
   *
   * **Note:** By default, right-clicks are only captured when mousing over chart objects
   * such as series and drawings. To enable right-click anywhere on the chart, the
   * "contextmenu" event listener must be modified as follows:
   * ```
   * document.removeEventListener("contextmenu", CIQ.ChartEngine.handleContextMenu);
   * document.addEventListener(
   *     "contextmenu",
   *     function(e) {
   *         if (!e) e = event;
   *         if (e.preventDefault) e.preventDefault();
   *         return false;
   *     }
   * );
   * ```
   *
   * @param data Data relevant to the "rightClick" event.
   * @param data.stx The chart engine instance.
   * @param panel The panel that was clicked.
   * @param data.x The click x-coordinate.
   * @param data.y The click y-coordinate.
   *
   * @callback CIQ.ChartEngine~rightClickEventListener
   *
   * @see CIQ.ChartEngine#addEventListener
   * @see CIQ.ChartEngine.handleContextMenu
   *
   * @example <caption>Trigger and provide location and details when clicking a series:</caption>
   * stxx.addEventListener("tap", function(tapObject) {
   *     if (this.anyHighlighted) {
   *         for (let n in this.chart.seriesRenderers) {
   *             const r = this.chart.seriesRenderers[n];
   *             for(let j = 0; j < r.seriesParams.length; j++) {
   *                 series = r.seriesParams[j];
   *                 if (series.highlight) {
   *                     const bar = this.barFromPixel(tapObject.x);
   *                     if (this.chart.dataSegment[bar]) {
   *                         // Replace console.log with your required logic.
   *                         console.log('Tap event at pixel x: ' + tapObject.x + ' y: '+ tapObject.y);
   *                         console.log('Price:', this.priceFromPixel(tapObject.y), ' Date: ', this.chart.dataSegment[bar].DT);
   *                         console.log('Series Details: ',JSON.stringify(series));
   *                     }
   *                 }
   *             }
   *         }
   *     }
   * });
   */
  type rightClickEventListener = (data: {stx: CIQ.ChartEngine,x: number,y: number}, panel: string) => void

  /**
   * Called when the chart is panned and scrolled in any direction or is horizontally swiped.
   *
   * @param data Data relevant to the "scroll" event.
   * @param data.stx The chart engine instance.
   * @param data.panel The panel where the mouse is active.
   * @param data.x The mouse x-coordinate.
   * @param data.y The mouse y-coordinate.
   *
   * @callback CIQ.ChartEngine~scrollEventListener
   * @since 6.3.0
   *
   * @see CIQ.ChartEngine#addEventListener
   */
  type scrollEventListener = (data: {stx: CIQ.ChartEngine,panel: string,x: number,y: number}) => void

  /**
   * Called when an overlay-type study is right-clicked.
   *
   * @param data Data relevant to the "studyOverlayEdit" event.
   * @param data.stx The chart engine instance.
   * @param data.sd The study object study descriptor.
   * @param data.inputs The inputs from the study descriptor.
   * @param data.outputs The outputs from the study descriptor.
   * @param data.parameters The parameters from the study descriptor.
   *
   * @callback CIQ.ChartEngine~studyOverlayEditEventListener
   *
   * @see CIQ.ChartEngine#addEventListener
   *
   * @example
   * stxx.addEventListener("studyOverlayEdit", function(studyData) {
   *     CIQ.alert(studyData.sd.name);
   *     const helper = new CIQ.Studies.DialogHelper({ name: studyData.sd.type, stx: studyData.stx });
   *     console.log('Inputs:',JSON.stringify(helper.inputs));
   *     console.log('Outputs:',JSON.stringify(helper.outputs));
   *     console.log('Parameters:',JSON.stringify(helper.parameters));
   *     // Call your menu here with the data returned in helper.
   *     // Modify parameters as needed and call addStudy or replaceStudy.
   * });
   */
  type studyOverlayEditEventListener = (data: {stx: CIQ.ChartEngine,sd: object,inputs: object,outputs: object,parameters: object}) => void

  /**
   * Called when a panel-type study is edited.
   *
   * @param data Data relevant to the "studyPanelEdit" event.
   * @param data.stx The chart engine instance.
   * @param data.sd The study object study descriptor.
   * @param data.inputs The inputs from the study descriptor.
   * @param data.outputs The outputs from the study descriptor.
   * @param data.parameters The parameters from the study descriptor.
   *
   * @callback CIQ.ChartEngine~studyPanelEditEventListener
   *
   * @see CIQ.ChartEngine#addEventListener
   */
  type studyPanelEditEventListener = (data: {stx: CIQ.ChartEngine,sd: object,inputs: object,outputs: object,parameters: object}) => void

  /**
   * Called when the chart's symbols change. Including secondary series and underlying
   * symbols for studies (e.g., price relative study).
   *
   * @param data Data relevant to the "symbolChange" event.
   * @param data.stx The chart engine instance.
   * @param data.symbol The new chart symbol.
   * @param data.symbolObject The symbol's value and display label
   * 		(CIQ.ChartEngine.Chart#symbolObject).
   * @param data.action An action type being performed on the symbol. Possible
   * 		options:
   * - `add-series` — A series was added
   * - `master` — The master symbol was changed
   * - `remove-series` — A series was removed
   * @callback CIQ.ChartEngine~symbolChangeEventListener
   *
   * @see CIQ.ChartEngine#addEventListener
   */
  type symbolChangeEventListener = (data: {stx: CIQ.ChartEngine,symbol: string,symbolObject: object,action: string}) => void

  /**
   * Called when a symbol is imported into the layout, including secondary series and
   * underlying symbols for studies (e.g., price relative study).
   *
   * This listener is not called by other types of symbol changes.
   *
   * @param data Data relevant to the "symbolImport" event.
   * @param data.stx The chart engine instance.
   * @param data.symbol The new chart symbol.
   * @param data.symbolObject The symbol's value and display label
   * 		(CIQ.ChartEngine.Chart#symbolObject).
   * @param data.action An action type being performed on the symbol. Possible
   * 		options:
   * - `add-series` — A series was added
   * - `master` — The master symbol was changed
   * - `remove-series` — A series was removed
   *
   * @callback CIQ.ChartEngine~symbolImportEventListener
   *
   * @see CIQ.ChartEngine#addEventListener
   * @see CIQ.ChartEngine#importLayout
   */
  type symbolImportEventListener = (data: {stx: CIQ.ChartEngine,symbol: string,symbolObject: object,action: string}) => void

  /**
   * Called on ["mouseup"]CIQ.ChartEngine#touchSingleClick when
   * the chart is tapped.
   *
   * @param data Data relevant to the "tap" event.
   * @param data.stx The chart engine instance.
   * @param data.panel The panel being tapped.
   * @param data.x The tap x-coordinate.
   * @param data.y The tap y-coordinate.
   *
   * @callback CIQ.ChartEngine~tapEventListener
   *
   * @see CIQ.ChartEngine#addEventListener
   */
  type tapEventListener = (data: {stx: CIQ.ChartEngine,panel: string,x: number,y: number}) => void

  /**
   * Called when a new theme is activated on the chart, such as by
   * WebComponents.cq-themes initialization or using the
   * WebComponents.cq-theme-dialog.
   *
   * @param data Data relevant to the "theme" event.
   * @param data.stx The chart engine instance.
   * @param data.symbol The current chart symbol.
   * @param data.symbolObject The symbol's value and display label
   * 		(CIQ.ChartEngine.Chart#symbolObject).
   * @param data.layout The chart's layout object (CIQ.ChartEngine#layout).
   * @param data.drawingObjects The chart's current drawings
   * 		(CIQ.ChartEngine#drawingObjects).
   *
   * @callback CIQ.ChartEngine~themeEventListener
   *
   * @see CIQ.ChartEngine#addEventListener
   */
  type themeEventListener = (data: {stx: CIQ.ChartEngine,symbol: string,symbolObject: object,layout: object,drawingObjects: any[]}) => void

  /**
   * Called when an undo stamp is created for drawing events.
   *
   * See CIQ.ChartEngine#undoStamp
   *
   * @param data Data relevant to the "undoStamp" event.
   * @param data.stx The chart engine instance.
   * @param data.before The chart drawing objects before the change.
   * @param data.after The chart drawings objects after the change.
   *
   * @callback CIQ.ChartEngine~undoStampEventListener
   *
   * @see CIQ.ChartEngine#addEventListener
   */
  type undoStampEventListener = (data: {stx: CIQ.ChartEngine,before: any[],after: any[]}) => void

  /**
   * A function describing the color to use for drawing a specific part of the chart.
   *
   * Should always return a CIQ.ChartEngine~colorObject describing how you would like the
   * chart to draw the quote.
   *
   * @param stx The chart engine.
   * @param quote Specific quote to be drawn with the returned color
   * 		object.
   * @param parameters Any parameters used by your color function.
   * @return A color object.
   *
   * @callback CIQ.ChartEngine~colorFunction
   */
  type colorFunction = (stx: CIQ.ChartEngine, quote: CIQ.ChartEngine.OHLCQuote, parameters: object) => CIQ.ChartEngine.colorObject

  /**
   * Defines an object used for rendering a chart and is automatically created by the CIQ.ChartEngine.
   * Chart objects contain the data and config for each chart but they don't actually exist on the screen until a panel is attached.
   * A chart object is attached to both the main chart panel and any related study panels so they can share the same chart data.
   *
   * Example: stxx.panels['chart'].chart
   *
   * Example: stxx.chart (convenience shortcut for accessing the main chart object - same as above)
   *
   * Example stxx.panels['Aroon (14)'].chart
   *
   */
  class Chart {
    /**
     * Defines an object used for rendering a chart and is automatically created by the CIQ.ChartEngine.
     * Chart objects contain the data and config for each chart but they don't actually exist on the screen until a panel is attached.
     * A chart object is attached to both the main chart panel and any related study panels so they can share the same chart data.
     *
     * Example: stxx.panels['chart'].chart
     *
     * Example: stxx.chart (convenience shortcut for accessing the main chart object - same as above)
     *
     * Example stxx.panels['Aroon (14)'].chart
     *
     */
    constructor()
    public panel: CIQ.ChartEngine.Panel
    /**
     * The current symbol for the chart
     */
    public symbol: string
    /**
     * The current symbolObject for the chart. Generally this is simply `{symbol: symbol}`.
     * This is initialized by CIQ.ChartEngine#loadChart.
     */
    public symbolObject: {
      symbol: any
    }
    /**
     * Set this to preset an alternate name for the symbol on the chart label and comparison legend.
     * You can set  `stxx.chart.symbolDisplay='yourName'; ` right before calling `loadChart()`.
     * Alternatively, a good place to set it is in your fetch function, if using quotefeed. See example.
     * @example
     * // on your initial data fetch call add the following
     * params.stx.chart.symbolDisplay='yourName for '+params.symbol;
     */
    public symbolDisplay: string
    /**
     * Contains information about the series that are associated with the chart.
     * Series are additional data sets, such as used for comparison charts.
     * Note that a series may have a different y-axis calculation than the price chart.
     * See the "parameters" section of CIQ.ChartEngine#addSeries for details
     */
    public series: object
    /**
     * Contains "renderers" that are used to create the visualizations for series.
     *
     * Renderers will be drawn in their object order, which can be altered if needed to force certain renderings to be drawn before or after others. See example.
     *
     * @example <caption> This sample code shows how to move up one place a renderer called "comparison D" </caption>
     * var rendererName = "comparison D";
     * var newRenderers = {};
     * var pos = 0;
     * var r;
     *
     * for (r in stxx.chart.seriesRenderers) {
     *     if (r == rendererName) break;
     *     pos++;
     * }
     *
     * if (pos) { // Not already at top.
     *     var i = 0;
     *     for (r in stxx.chart.seriesRenderers) {
     *         if (i == pos - 1) newRenderers[rendererName] = stxx.chart.seriesRenderers[rendererName];
     *         if (r == rendererName) continue;
     *         newRenderers[r] = stxx.chart.seriesRenderers[r];
     *         i++;
     *     }
     *     stxx.chart.seriesRenderers = newRenderers;
     * }
     */
    public seriesRenderers: object
    /**
     * Current number of ticks scrolled in from the end of the chart.
     * Setting to zero would theoretically cause the chart to be scrolled completely to the left showing an empty canvas.
     * Setting to 10 would display the last 10 candles on the chart.
     * Setting to `maxTicks` would display a full screen on the chart (assuming enough data is available).
     *
     * To immediately activate, call [draw()]CIQ.ChartEngine#draw
     * @example <caption> Scroll to the most current (beginning) position in the chart.</caption>
     * stxx.chart.scroll=0;
     * @example <caption> Scroll to the end of the chart.</caption>
     * stxx.chart.scroll=stxx.chart.dataSet.length;
     */
    public scroll: number
    /**
     * If true, [comparisons]CIQ.ChartEngine#addSeries force a 'percent' chart scale every time a new series is added,
     * and once the last comparison series is removed, the chart will be forced to 'linear' scale.
     * In between adding series, the scale can be changed at any time by programmatically calling calling CIQ.ChartEngine#setChartScale
     *
     * If false, the chart will not change scale when a comparison series is added or removed and CIQ.ChartEngine#setChartScale must be explicitly called to set the desired scale.
     * This allows for more flexibility in case 'linear' and 'percent' are not the preferred default scales, or the UI is requires to manage the scale separately.
     *
     * Note this will only take effect on the main chart panel's main axis.
     *
     * @since 6.2.0
     */
    public forcePercentComparison: boolean
    /**
     * Will contain the maximum number of bars that can be displayed on the chart.
     * This number is auto-computed by the ChartEngine when the user zooms or the size of the chart changes.
     * Since charts can pan slightly off the edge of the screen, this number is width/candleWidth + 2 in order allow partial candles to be displayed on both edges.
     */
    public maxTicks: number
    /**
     * Set to a value between 0 and 1 to soften the curves on a line or mountain chart for the primary series.
     *
     * This only affects the primary chart series. For setting tension on additional series see CIQ.ChartEngine#addSeries
     *
     * Splining is a mathematical process that rounds the connectors between segments.
     * This results in a very pleasing, smooth look.
     * Please note that technical analysts generally do not like splined charts because they obscure the actual closing prices of securities. Splining should be used only when the use case doesn't require exact values.
     */
    public tension: number
    /**
     * READ ONLY. A "snapshot" of the market for the active instrument.
     * This data is ephemeral in nature and not used to produce a time series chart.
     * But rather used on our peripheral plugins that require more details on the current market, such as [TFC]CIQ.TFC and [Active Trader]CIQ.MarketDepth.
     * This data is programmatically collated from the incoming data and is updated with the most recent information so it should not be altered manually.
     *
     * The `currentMarketData` object contains the following information:
     *  - Last Bid
     *  - Last Ask
     *  - Last Price
     *  - Last Size
     *  - Lastest Level 2 information
     *
     * For more details see CIQ.ChartEngine#updateCurrentMarketData
     * @since 6.1.0
     */
    public currentMarketData: object
    /**
     * READ ONLY. The master data for this chart.
     * This data is never modified by the chart engine itself and should not be altered directly.
     *
     * Use CIQ.ChartEngine#loadChart , CIQ.ChartEngine#updateChartData to load/update this object.
     *
     * See the [Data Integration]{@tutorial DataIntegrationOverview} tutorial for details.
     */
    public masterData: any[]
    /**
     * Contains the current complete data set created from CIQ.ChartEngine.Chart#masterData by CIQ.ChartEngine#createDataSet; adjusted for periodicity and with calculated studies.
     *
     * See the [Data Integration]{@tutorial DataIntegrationOverview} and [Studies]{@tutorial Using and Customizing Studies} tutorials for more details.
     */
    public dataSet: any[]
    /**
     * Contains a copy of the CIQ.ChartEngine.Chart#dataSet, scrubbed for null entries (gap dates).
     * This is used by studies to avoid gaps being interpreted as "zero" values and throwing off calculations.
     *
     * See the  [Studies]{@tutorial Using and Customizing Studies} tutorial for more details.
     */
    public scrubbed: any[]
    /**
     * READ ONLY. Contains the portion of the CIQ.ChartEngine.Chart#dataSet that is currently displayed on the screen (view-window).
     * It includes both full and partial bars, and may even include a bar whose visible portion is entirely off the screen.
     * As the chart is panned or zoomed, the dataSegment is updated to reflect the new position in the chart.
     *
     *  To properly access the portion of the dataSegment representing bars that are at least 50% showing on the screen, use CIQ.ChartEngine#getDataSegment.
     *
     * See the [Data Integration]{@tutorial DataIntegrationOverview} tutorial for details.
     */
    public dataSegment: any[]
    /**
     * READ ONLY. Contains data pertaining to variable width candles, such as volume candles, used to determine location of bars on the screen.
     */
    public segmentImage: any[]
    /**
     * Parameters used to control the baseline in baseline_delta charts
     */
    public baseline: {
      /**
       * includeInDataSegment - If set to true, forces a line chart (usually a baseline chart) to begin inside the chart,
       *                        whereas normally the first point in a line chart is off the left edge of the screen.
       *
       * **Note:** Only applies when set by the chart, will not work if set by a renderer.
       */
      includeInDataSegment: boolean,
      /**
       * defaultLevel - If set to a value, overrides the default behavior of baseline chart
       *                which is to set baseline to leftmost point visible on the chart.
       */
      defaultLevel: number,
      /**
       * userLevel - Value of the user-set baseline level.  To prevent user from adjusting the baseline,
       *             set this property to false.
       */
      userLevel: boolean|number,
      /**
       * actualLevel - This is computed automatically.  Do not set.
       */
      actualLevel: number
    }
    /**
     * Contains the {@CIQ.ChartEngine.XAxis} object for the chart.
     */
    public xAxis: CIQ.ChartEngine.XAxis
    /**
     * Contains data entries for the full xaxis, including entries for "future" bars that are displayed on the chart.
     * floatDate and headsUp use these values for display to the user.
     * It is a superset of dataSegment.
     */
    public xaxis: any[]
    /**
     * Determines at which zoom level interior axis points are displayed. Value in pixels.
     */
    public xaxisFactor: number
    /**
     * READ ONLY. Maximum number of decimal places in data set.
     *
     * This can be changed by setting CIQ.ChartEngine.Chart#calculateTradingDecimalPlaces to a different function.
     * See CIQ.calculateTradingDecimalPlaces for more details.
     */
    public decimalPlaces: number
    /**
     * If true, the y-axis width is based on the width of the displayed instrument prices.
     *
     * To prevent constant resizing of the y-axis, the dynamic width setting starts at the
     * initial axis width (CIQ.ChartEngine.YAxis#width) and increases to ensure all
     * digits are in view as the user zooms and pans the chart. The dynamic width setting
     * returns to the initial width only when key events happen, such as removing a study or
     * series or changing the instrument.
     *
     * Applies to all y-axes attached to a chart.
     *
     * @since 5.1.1
     *
     * @see CIQ.ChartEngine#resetDynamicYAxis.
     */
    public dynamicYAxis: boolean
    /**
     * Used to determine chart display characteristics that are dependent on chart size, such
     * as the width and font of the y-axis.
     *
     * Meant to be used in tandem with CSS responsive design breakpoints. Do not set directly;
     * instead use CIQ.ChartEngine#notifyBreakpoint, which ensures that the relevant
     * styles (which have already been calculated) are updated based on the new breakpoint.
     *
     * @since 8.2.0
     */
    public breakpoint: string
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
     * Defaults to CIQ.drawLegend, which uses CIQ.drawLegendItem
     * @example
     * // define your legend renderer
     * stxx.chart.legendRenderer = yourFunction; // must follow the function signature of CIQ.drawLegend;
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
    public legendRenderer: Function
    /**
     * This object is used to temporarily override the coloring logic used on some default chart types,
     * or to completely override the `layout.chartType` allowing you to then define a totally custom rendering.
     *
     *  The colorFunction is only available on the following chart types:
     *  - Colored Line
     *  - Colored Bar
     *  - Colored Mountain
     *  - Colored Step
     *  - Candle
     *  - Hollow Candle
     *  - Volume Candle
     *
     * Expected format :
     *```
     *chartEngine.chart.customChart={colorFunction: myColorFunction}
     *```
     *```
     *chartEngine.chart.customChart={chartType:myChartType}
     *```
     *```
     *chartEngine.chart.customChart={colorFunction: myColorFunction, chartType:myChartType}
     *```
     * Where:
     * - `myColorFunction` is the function that contains the logic for overriding default color logic for a **default** chart. Please contact us for more guidance on how to create your own chart types.
     *  - This function must support the following parameters:
     *	 - [stx]CIQ.ChartEngine	- A chart object
     *	 - quote	- A properly formatted OHLC object.
     *	 - mode	- A string applicable on 'candle', 'hollow_candle' and 'volume_candle' charts only. Allowed values:
     *	  - `shadow`- indicates the function is asking for the candle wick color
     *	  - `outline` indicates the function is asking for the candle border color
     *	  - `solid` indicates the function is asking for the candle fill color(Inside of candle. Not applicable on 'hollow_candle' or 'volume_candle')
     *   - Example: `myColorFunction(stx,quote,mode);`
     *  - This function must return a `string|object` representing the color to use for the bar, candle or line segment component.
     *  - Return `null` to skip the current datapoint and draw nothing in its place.
     *  - For colored line charts a color/pattern combination can be returned in an object of the following format: `{pattern:[3,3],color:"red"}`
     * - `myChartType` is the name of your **custom** chart. Setting this value will force "displayChart" to execute your exact code for rendering a chart. You will need to add your rendering code inside a "displayChart" API injection ( **must be an append** to be executed after the default functionality.).
     *
     * You may set to null any of the parameters to default to existing settings.
     * If you are simply setting the customChart object in-line, rather than using it as part of an AP injection into the animation loop, it may be necessary to call `setMainSeriesRenderer` to immediately display results.
     * To restore the original chart settings, set this object to null (and call setMainSeriesRenderer() if necessary).
     *
     * See {@tutorial Chart Styles and Types} for more details.
     * @example <caption> Using the customChart object in-line on your code:</caption>
     * //you may want to add a menu selection to activate a special candle chart by executing this code in response to the menu selection:
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
     * stxx.setMainSeriesRenderer();
     *
     * // to deactivate, you can execute this code:
     * stxx.chart.customChart={colorFunction: null};
     * stxx.setMainSeriesRenderer();
     * @example <caption> Using the customChart object inside an API injection: </caption>
     * CIQ.ChartEngine.prototype.prepend("displayChart", function(chart){
     *     if ( this.layout.chartType =="candle")
     *         this.chart.customChart={
     *             colorFunction:function(stx, quote, mode){
     *                 if(quote.Close>quote.iqPrevClose) return "blue";
     *                 else if(quote.Close<quote.iqPrevClose) return "yellow";
     *                 else return "gray";
     *             }
     *        }
     *    else
     *        this.chart.customChart = null;
     * });
     */
    public customChart: object
    /**
     * How much padding to leave for the right y-axis. Default is enough for the axis. Set to zero to overlap y-axis onto chart.
     * @since 07/01/2015
     * @example
     * stxx.chart.yaxisPaddingRight=0;
     * stxx.chart.yAxis.displayBorder=false; // hide the vertical axis line.
     * //must call the following 2 lines to activate if the axis is already drawn.
     * stxx.calculateYAxisPositions();
     * stxx.draw();
     */
    public yaxisPaddingRight: number
    /**
     * How much padding to leave for the left y-axis. Default is enough for the axis. Set to zero to overlap y-axis onto chart.
     * @since 07/01/2015
     * @example
     * stxx.chart.yaxisPaddingLeft=0;
     * stxx.chart.yAxis.displayBorder=false; // hide the vertical axis line.
     * //must call the following 2 lines to activate if the axis is already drawn.
     * stxx.calculateYAxisPositions();
     * stxx.draw();
     */
    public yaxisPaddingLeft: number
    /**
     * If set to false, during zooming and panning operations the chart will be anchored on left side preventing white space to be created past the oldest tick.
     * If both CIQ.ChartEngine.Chart#allowScrollPast and CIQ.ChartEngine.Chart#allowScrollFuture are set to false, allowScrollFuture will take precedence if the candle is manually set to create space (CIQ.ChartEngine#setCandleWidth), but automated zoom operations (CIQ.ChartEngine#zoomOut) will maintain both scroll restrictions.
     *
     * The amount of white space allowed on the right will be limited by CIQ.ChartEngine#minimumLeftBars
     * @example
     * stxx.chart.allowScrollPast=false;
     */
    public allowScrollPast: boolean
    /**
     * If set to false, during zooming and panning operations the chart will be anchored on right side preventing white space to be created beyond the newest tick.
     * If both CIQ.ChartEngine.Chart#allowScrollPast and CIQ.ChartEngine.Chart#allowScrollFuture are set to false, allowScrollFuture will take precedence if the candle is manually set to create space (CIQ.ChartEngine#setCandleWidth), but automated zoom operations (CIQ.ChartEngine#zoomOut) will maintain both scroll restrictions.
     * When viewing a specified date range on the chart, if this flag is set to false, any portion of the range beyond the last quote will not be displayed.
     * @example
     * stxx.chart.allowScrollFuture=false;
     * @since 6.1.0 Also respects studies that render into the future, such as the Ichimoku cloud.
     */
    public allowScrollFuture: boolean
    /**
     * Set to true to temporarily hide drawings
     */
    public hideDrawings: boolean
    /**
     * For line and mountain type charts set this to a value other than "Close" to have those chart types plot a different field.
     *
     * @since 3.0.0
     */
    public defaultPlotField: string
    /**
     * For chart types which have configuration settings (such as the aggregate charts renko, kagi, etc) contains those default settings.
     * This object holds the settings for the current chart type only.
     * @since 3.0.0
     */
    public defaultChartStyleConfig: object
    /**
     * Set this to true to turn off auto-scrolling when fresh data comes in. By default, the chart will scroll backward
     * whenever a new bar comes in, so as to maintain the chart's forward position on the screen. If lockScroll is
     * true then fresh bars with advance the chart forward (and eventually off the right edge of the screen)
     *
     * Note that setSpan({base:"today"}) will set an internal variable that accomplishes the same thing. This is a unique case.
     * @since 05-2016-10
     */
    public lockScroll: boolean
    /**
     * Set this to true to include the chart overlay/study values in the calculation to determine the high and low values for the chart.
     * This may cause the chart to shrink vertically to ensure all study/overlay data is in view.
     * Setting it to false, will maintain the current candle's height, but some of the study/overlay data may be out of the display range.
     *
     * This will affect studies such as 'Pivot Points' where all the pivot lines will be visible by “squeezing the y axis”.
     * @since
     * - 2016-12-01.4.13
     * - 3.0.10 Switched default to true.
     */
    public includeOverlaysInMinMax: boolean
    /**
     * READ ONLY. Gap filling style for the chart (line/mountain chart types only).
     * By default gaps on lines and mountain charts will not be connected.
     * Modify by using CIQ.ChartEngine#setGapLines.
     * @since 4.0.0
     */
    public gaplines: object
    /**
     * READ ONLY. Style for the main series renderer.
     * Set by using CIQ.ChartEngine#setLineStyle.
     * @since 4.0.0
     */
    public lineStyle: object
    /**
     * When candleWidth<1, setting to true will create approximation of a line chart to improve rendering performance.
     *
     * Must allow for smaller candle sizes by lowering CIQ.ChartEngine#minimumCandleWidth
     * and allow for larger dataset by increasing CIQ.ChartEngine#maxDataSetSize or setting it to 0.
     * @since 4.1.0
     */
    public lineApproximation: boolean
    /**
     * Whether chart's main renderer's bars plot more than one data field (OHLC charts).
     * When this is true, will disable the use of CIQ.ChartEngine.Chart#defaultPlotField.
     * @since 5.1.0
     */
    public highLowBars: boolean
    /**
     * Whether chart's main renderer's bars represent a stand-alone entity as opposed to a vertex in a line-type chart.
     * This is important when the engine tries to render the data points right off the chart; in a stand-alone bar,
     * the points right off the chart need not be considered.
     * @since 5.1.0
     */
    public standaloneBars: boolean
    /**
     * Whether chart's main renderer's bars have width, as opposed to a line-type chart whose "bars" are just a point on the chart.
     * This is useful when the engine adjusts the chart for smooth scrolling and homing.
     * @since 5.1.0
     */
    public barsHaveWidth: boolean
    /**
     * Called to determine the number of decimal places in which a security trades.
     *
     * The function this is called in CIQ.ChartEngine#setMasterData. The result is
     * assigned to CIQ.ChartEngine.Chart#decimalPlaces, which is used for the heads-up
     * display and for the current price pointer label.
     *
     * Format:
     * ```javascript
     * stxx.chart.calculateTradingDecimalPlaces(
     *     {
     *          stx: CIQ.ChartEngine,
     *          chart: CIQ.ChartEngine.Chart,
     *          symbol: string,
     *          symbolObject: object
     *     }
     * )
     * ```
     * @since 8.0.0 Replaces <a href="CIQ.ChartEngine.html#callbacks%5B%60calculateTradingDecimalPlaces%60%5D">CIQ.ChartEngine.callbacks[\`calculateTradingDecimalPlaces\`]</a>.
     */
    public calculateTradingDecimalPlaces: Function
  }

  /**
   * Defines a Panel object.
   * Every chart or study is rendered in a panel.
   *
   * Example: stxx.panels['chart']
   *
   * Example: stxx.panels['Aroon (14)']
   */
  class Panel {
    /**
     * Defines a Panel object.
     * Every chart or study is rendered in a panel.
     *
     * Example: stxx.panels['chart']
     *
     * Example: stxx.panels['Aroon (14)']
     * @param name The name of the panel.
     * @param [yAxis] Y axis (CIQ.ChartEngine.YAxis) object for the panel.
     */
    constructor(name: string, yAxis?: CIQ.ChartEngine.YAxis)
    /**
     * Draws a border around the panel's left and right sides for a more finished look, when no y axis is present.
     * @since 7.1.0
     */
    public displayEdgeIfPadded: boolean
    /**
     * Prevents plot and axis dragging into, out of, and within panels.
     * @since 7.2.0
     */
    public noDrag: boolean
    /**
     * Determines whether the panel is included in the CIQ.ChartEngine#exportLayout
     * return object.
     *
     * @since 8.0.0
     */
    public exportable: boolean
  }

  /**
   * Defines an object used for rendering the X-axis on the chart, which can be adjusted immediately after declaring your `new CIQ.ChartEngine();`
   * The CIQ.ChartEngine.XAxis object is created by and part of the CIQ.ChartEngine.Chart object and is used on the main chart panel only.
   * There is only one x axis per chart container.
   *
   * Colors and fonts for the x axis can be controlled by manipulating the CSS.
   * You can override the `stx_xaxis` class to change the font or colors.
   *
   * Also see:
   * - CIQ.ChartEngine#axisBorders
   * - CIQ.ChartEngine#xAxisAsFooter
   * - CIQ.ChartEngine#xaxisHeight
   *
   * For full customization instructions see:
   * - {@tutorial Custom X-axis}
   * - CIQ.ChartEngine#createXAxis
   * - CIQ.ChartEngine#createTickXAxisWithDates
   *
   * Example: stxx.chart.xAxis
   *
   * @example
   * var stxx=new CIQ.ChartEngine({container:document.querySelector(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
   * stxx.chart.xAxis.formatter=formatFunction;
   */
  class XAxis {
    /**
     * Defines an object used for rendering the X-axis on the chart, which can be adjusted immediately after declaring your `new CIQ.ChartEngine();`
     * The CIQ.ChartEngine.XAxis object is created by and part of the CIQ.ChartEngine.Chart object and is used on the main chart panel only.
     * There is only one x axis per chart container.
     *
     * Colors and fonts for the x axis can be controlled by manipulating the CSS.
     * You can override the `stx_xaxis` class to change the font or colors.
     *
     * Also see:
     * - CIQ.ChartEngine#axisBorders
     * - CIQ.ChartEngine#xAxisAsFooter
     * - CIQ.ChartEngine#xaxisHeight
     *
     * For full customization instructions see:
     * - {@tutorial Custom X-axis}
     * - CIQ.ChartEngine#createXAxis
     * - CIQ.ChartEngine#createTickXAxisWithDates
     *
     * Example: stxx.chart.xAxis
     *
     * @param init Object containing custom values for X-axis members
     * @example
     * var stxx=new CIQ.ChartEngine({container:document.querySelector(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
     * stxx.chart.xAxis.formatter=formatFunction;
     */
    constructor(init: object)
    /**
     * Optional function to format dates on x-axis.
     * If defined, will be used to completely control x-axis formatting, including the floating HUD date of the crosshair.
     *
     * This function **should not** be used to alter the timezone of the displayed date/time. For time zone conversions use CIQ.ChartEngine#setTimeZone
     *
     * **Expected format:**
     *
     * - `function(labelDate, gridType, timeUnit, timeUnitMultiplier, defaultText);`
     *
     * **Parameters:**
     * <table>
     * <tr><th>Name</th><th>Type</th><th>Description</th></tr>
     * <tr><td>labelDate</td><td>Date</td><td>javaScript date to format</td></tr>
     * <tr><td>gridType</td><td>String</td><td>"boundary", "line", or name of drawing (e.g. "vertical") for the axis labels.Absent for the floating crosshair label</td></tr>
     * <tr><td>timeUnit</td><td>Enumerated type</td><td>CIQ.MILLISECOND CIQ.SECOND CIQ.MINUTE CIQ.HOUR CIQ.DAY CIQ.MONTH CIQ.YEAR CIQ.DECADE Absent for the floating crosshair label.</td></tr>
     * <tr><td>timeUnitMultiplier</td><td>Number</td><td>How many timeUnits. Absent for the floating crosshair label.</td></tr>
     * <tr><td>defaultText</td><td>String</td><td>Contains the default date label that would be used if no formatter is defined. Simply return this value for dates where no formatting is desired.</td></tr>
     * </table>
     *
     * **Returns:**
     * - Formatted text label for the particular date passed in.
     *
     * @example
     * stxx.chart.xAxis.formatter = function(labelDate, gridType, timeUnit, timeUnitMultiplier, defaultText){
     * 		// Your code here to format your string.
     * 		// Example: always return HH:MM regardless of gridType,
     * 		// even if gridType is a 'boundary' that normally would display
     * 		// a date in intraday periodicity or a month in daily periodicity
     *
     * 		//You can always return back 'defaultText' if you do not wish to customize the particular value.
     *
     * 		var stringDate = labelDate.getHours() + ':' + labelDate.getMinutes();
     * 		return stringDate;
     * }
     * @example
     * stxx.chart.xAxis.formatter = function(labelDate, gridType, timeUnit, timeUnitMultiplier, defaultText){
     * 		// Your code here to format your string.
     * 		// Example: return HH:MM when gridType is "line" otherwise returned the default text.
     *
     *		if( gridType == "line" ) {
     * 			var stringDate = labelDate.getHours() + ':' + labelDate.getMinutes();
     * 			return stringDate;
     * 		else
     * 			return defaultText;
     * }
     * @since
     * - 3.0.0 Using x axis formatter now is available for year and month boundaries.
     * - 6.3.0 Added `defaultText` parameter.
     * - 6.3.0 Added drawing type as possible `gridType` value.
     */
    public formatter: Function
    /**
     * If true, the user selected (default browser if none selected) timezone will be used on the x axis.
     * If not set to true, the data timezone will be used even if a user timezone was set.
     */
    public adjustTimeZone: boolean
    /**
     * Ideal space between x-axis labels in pixels.
     * If null then the chart will attempt a tick size and time unit in proportion to the chart.
     * Please note that if `stxx.chart.yAxis.goldenRatioYAxis` is set to `true`, this setting will also affect the spacing between y-axis labels.
     * Please note that this setting will be overwritten at rendering time if too small to prevent labels from covering each other.
     * Not applicable if CIQ.ChartEngine.XAxis#timeUnit is manually set.
     * See {@tutorial Custom X-axis} for additional details.
     */
    public idealTickSizePixels: number
    /**
     * Overrides default used in CIQ.ChartEngine#createTickXAxisWithDates
     * Allowable values:
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
     * Visual Reference for sample code below (draw a label every 5 seconds using 1 second periodicity ) :
     * ![xAxis.timeUnit](xAxis.timeUnit.png "xAxis.timeUnit")
     * @example
     * // The following will cause the default implementation of createTickXAxisWithDates to print labels in seconds every 5 seconds.
     * // masterData is in 1 second intervals for this particular example.
     * stxx.chart.xAxis.timeUnit = CIQ.SECOND;
     * stxx.chart.xAxis.timeUnitMultiplier = 5;
     */
    public timeUnit: number
    /**
     * Overrides default used in CIQ.ChartEngine#createTickXAxisWithDates
     * @example
     * // The following will cause the default implementation of createTickXAxisWithDates to print labels in seconds every 5 seconds.
     * // masterData is in 1 second intervals for this particular example.
     * stxx.chart.xAxis.timeUnit = CIQ.SECOND;
     * stxx.chart.xAxis.timeUnitMultiplier = 5;
     */
    public timeUnitMultiplier: number
    /**
     * Set to true to draw a line above the x-axis.
     */
    public displayBorder: boolean
    /**
     * Set to false to suppress grid lines
     */
    public displayGridLines: boolean
    /**
     * Switch to temporarily hide the x-axis. Set to `true' to activate.
     *
     * Axis space will be maintained. To completely remove the x axis, including spacing use CIQ.ChartEngine#xaxisHeight
     * @since 3.0.0
     */
    public noDraw: boolean
    /**
     * Minimum size for label. This ensures adequate padding so that labels don't collide with one another.
     * Please note that this setting is used during the rendering process, not during the label spacing calculation process and will be overwritten if too small to prevent labels from covering each other.
     * To modify at what interval labels will be placed, please see {@tutorial Custom X-axis} for more details
     */
    public minimumLabelWidth: number
    /**
     * Set to false to hide axis markings in the future.
     */
    public futureTicks: boolean
    /**
     * Set to the number of minutes ticks will move by when iterating in "tick" interval.
     * <P>
     * Since 'tick' is not a time based display, there is no way to predict what the time between ticks will be.
     * Ticks can come a second later, a minute later or even more depending on how active a particular instrument may be.
     * As such, if iterating through the market day in 'tick' periodicity, the library uses a pre-defined number of minutes to move around.
     * This will be primarily used when deciding where to put x axis labels when going into the future in 'tick' mode.
     *
     * @example
     * //You can override this behavior as follows:
     * var stxx=new CIQ.ChartEngine({container:document.querySelector(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
     * stxx.chart.xAxis.futureTicksInterval=1; // to set to 1 minute, for example
     * @since 3.0.0 Default changed from 10 to 1.
     */
    public futureTicksInterval: number
  }

  /**
   * This is the object stored in CIQ.ChartEngine.chart.xaxis array which contains information regarding an x-axis tick.
   * See CIQ.ChartEngine#createXAxis for more detail.
   */
  class XAxisLabel {
    /**
     * This is the object stored in CIQ.ChartEngine.chart.xaxis array which contains information regarding an x-axis tick.
     * See CIQ.ChartEngine#createXAxis for more detail.
     * @param hz Horizontal position of center of label in pixels. Any elements with negative positions will be off the edge of the screen, and are only maintained to help produce a more predictable display as the chart is zoomed and paned.
     * @param grid Either "line" or "boundary" depending on whether the label should be a date/time boundary or just a grid line
     * @param text The text to display in the label
     */
    constructor(hz: number, grid: string, text: string)
  }

  /**
   * Defines an object used for rendering the Y-axis on a panel.
   *
   * Each panel object will **automatically** include a YAxis object, which can be adjusted immediately after declaring your `new CIQ.ChartEngine();`
   * Any adjustments to the y-axis members after it has been rendered will require a [draw()]CIQ.ChartEngine#draw call to apply the changes. A call to [initializeChart()]CIQ.ChartEngine#initializeChart may be required as well, depending on the setting being changed. See examples.
   *
   *  Also see:
   * - CIQ.ChartEngine#yaxisLabelStyle
   * - CIQ.ChartEngine#yTolerance
   * - CIQ.ChartEngine.Chart#yaxisPaddingRight
   * - CIQ.ChartEngine.Chart#yaxisPaddingLeft
   *
   * For full customization instructions see:
   *  - {@tutorial Gridlines and axis labels}
   *  - CIQ.ChartEngine#createYAxis
   *  - CIQ.ChartEngine#drawYAxis
   *
   * Example: stxx.panels['chart'].yAxis
   *
   * Example: stxx.chart.yAxis (convenience shortcut for accessing the main panel object - same as above)
   *
   * Example: stxx.panels['Aroon (14)'].yAxis
   *
   * **Note:** When modifying a y-axis placement setting (width, margins, position left/right, etc.)
   * after the axis has been rendered, you must call CIQ.ChartEngine#calculateYAxisMargins or
   * CIQ.ChartEngine#calculateYAxisPositions (as appropriate) followed by
   * CIQ.ChartEngine#draw to activate the change.
   *
   * @example
   * // here is an example on how to override the default top and bottom margins after the initial axis has already been rendered
   * stxx.loadChart(symbol, {masterData: yourData}, function () {
   * 	// callback - your code to be executed after the chart is loaded
   * 	stxx.chart.yAxis.initialMarginTop=50;
   * 	stxx.chart.yAxis.initialMarginBottom=50;
   * 	stxx.calculateYAxisMargins(stxx.chart.panel.yAxis); // must recalculate the margins after they are changed.
   * 	stxx.draw();
   * });
   * @example
   * // here is an example on how to override the default top and bottom margins before the initial axis has been rendered
   * var stxx=new CIQ.ChartEngine({container:document.querySelector(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
   * stxx.setPeriodicity({period:1, interval:1, timeUnit:"minute"}); 			// set your default periodicity to match your data. In this case one minute.
   * stxx.chart.yAxis.initialMarginTop=50;		// set default margins so they do not bump on to the legend
   * stxx.chart.yAxis.initialMarginBottom=50;
   * stxx.loadChart("SPY", {masterData: yourData});
   * @example
   * // here is an example on how to turn off the last price label (main chart panel) before the initial axis has already been rendered
   * var stxx=new CIQ.ChartEngine({container:document.querySelector(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
   * stxx.chart.panel.yAxis.drawCurrentPriceLabel=false;
   *
   * @since 5.1.0 Created a name member which is used to determine if the y-axis is the same as another.
   */
  class YAxis {
    /**
     * Defines an object used for rendering the Y-axis on a panel.
     *
     * Each panel object will **automatically** include a YAxis object, which can be adjusted immediately after declaring your `new CIQ.ChartEngine();`
     * Any adjustments to the y-axis members after it has been rendered will require a [draw()]CIQ.ChartEngine#draw call to apply the changes. A call to [initializeChart()]CIQ.ChartEngine#initializeChart may be required as well, depending on the setting being changed. See examples.
     *
     *  Also see:
     * - CIQ.ChartEngine#yaxisLabelStyle
     * - CIQ.ChartEngine#yTolerance
     * - CIQ.ChartEngine.Chart#yaxisPaddingRight
     * - CIQ.ChartEngine.Chart#yaxisPaddingLeft
     *
     * For full customization instructions see:
     *  - {@tutorial Gridlines and axis labels}
     *  - CIQ.ChartEngine#createYAxis
     *  - CIQ.ChartEngine#drawYAxis
     *
     * Example: stxx.panels['chart'].yAxis
     *
     * Example: stxx.chart.yAxis (convenience shortcut for accessing the main panel object - same as above)
     *
     * Example: stxx.panels['Aroon (14)'].yAxis
     *
     * **Note:** When modifying a y-axis placement setting (width, margins, position left/right, etc.)
     * after the axis has been rendered, you must call CIQ.ChartEngine#calculateYAxisMargins or
     * CIQ.ChartEngine#calculateYAxisPositions (as appropriate) followed by
     * CIQ.ChartEngine#draw to activate the change.
     *
     * @param init Object containing custom values for Y-axis members
     * @example
     * // here is an example on how to override the default top and bottom margins after the initial axis has already been rendered
     * stxx.loadChart(symbol, {masterData: yourData}, function () {
     * 	// callback - your code to be executed after the chart is loaded
     * 	stxx.chart.yAxis.initialMarginTop=50;
     * 	stxx.chart.yAxis.initialMarginBottom=50;
     * 	stxx.calculateYAxisMargins(stxx.chart.panel.yAxis); // must recalculate the margins after they are changed.
     * 	stxx.draw();
     * });
     * @example
     * // here is an example on how to override the default top and bottom margins before the initial axis has been rendered
     * var stxx=new CIQ.ChartEngine({container:document.querySelector(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
     * stxx.setPeriodicity({period:1, interval:1, timeUnit:"minute"}); 			// set your default periodicity to match your data. In this case one minute.
     * stxx.chart.yAxis.initialMarginTop=50;		// set default margins so they do not bump on to the legend
     * stxx.chart.yAxis.initialMarginBottom=50;
     * stxx.loadChart("SPY", {masterData: yourData});
     * @example
     * // here is an example on how to turn off the last price label (main chart panel) before the initial axis has already been rendered
     * var stxx=new CIQ.ChartEngine({container:document.querySelector(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
     * stxx.chart.panel.yAxis.drawCurrentPriceLabel=false;
     *
     * @since 5.1.0 Created a name member which is used to determine if the y-axis is the same as another.
     */
    constructor(init: object)
    /**
     * Controls maximum number of decimal places to ever display on a y-axis floating price label.
     *
     * Set to the maximum decimal places from 0 to 10, or leave null and the chart will choose automatically based on CIQ.ChartEngine.YAxis#shadowBreaks.
     * - See CIQ.ChartEngine.YAxis#decimalPlaces for controlling decimal places on the axis itself.
     * - See CIQ.ChartEngine.YAxis#width and CIQ.ChartEngine.Chart#dynamicYAxis to manage the width of the y axis.
     * @since 5.2.1 Default changed to null.
     */
    public maxDecimalPlaces: number
    /**
     * Optionally hard set the high (top value) of the yAxis (for instance when plotting 0 - 100% charts)
     */
    public max: number
    /**
     * Optionally hard set the low (bottom value) of the yAxis (for instance when plotting 0 - 100% charts)
     */
    public min: number
    /**
     * Controls the number of decimal places on the y axis labels.
     *
     * Set to the preferred number of decimal places from 0 to 10, or leave null and the chart will choose automatically based on CIQ.ChartEngine.YAxis#shadowBreaks
     *
     * Each y axis will make its own determination, so to override this value for all axes, you must adjust the y axis prototype.
     * Example: `CIQ.ChartEngine.YAxis.prototype.decimalPlaces=4;`
     *
     * **Note:** study panel axis may be condensed using CIQ.condenseInt. See CIQ.ChartEngine#formatYAxisPrice for all details.
     *
     * - See CIQ.ChartEngine.YAxis#maxDecimalPlaces for further controlling decimal places on floating labels.
     * - See CIQ.ChartEngine.YAxis#width and CIQ.ChartEngine.Chart#dynamicYAxis to manage the width of the y axis.
     * - See CIQ.ChartEngine.YAxis#shadowBreaks to override how many decimal places to print based on the size of the shadow (the difference between chart high and chart low).
     *
     * @since 5.2.0 Default changed to null.
     */
    public decimalPlaces: number
    /**
     * Ideal size between y-axis values in pixels. Leave null to automatically calculate.
     * See {@tutorial Gridlines and axis labels} for additional details.
     */
    public idealTickSizePixels: number
    /**
     * Set to specify that the y-axis vertical grid be drawn with specific intervals between ticks.
     * This amount will be overridden if it will result  in y axis crowding.
     * In which chase, multiples of the original interval will be used.
     * For example, if `.25` is selected, and that will cause labels to be on top of or too close to each other, `.50` may be used.
     * Crowding is prevented by allowing for a minimum of space equating the y-axis font height between labels.
     *
     * **This parameter is also used in the 'Trade From Chart' (TFC) module**. If set, it will force the widget to skip certain price values and instead 'snap' to your desired intervals. This will guarantee that an order is only placed at the allowed price intervals for the security in question.
     *
     * **Note that this parameter will be ignored if CIQ.ChartEngine.YAxis#pretty is set to `true`. If you require specific price intervals, please set CIQ.ChartEngine.YAxis#pretty to 'false' before setting `minimumPriceTick`**
     *
     * Visual Reference:
     * ![yAxis.minimumPriceTick](yAxis.minimumPriceTick.png "yAxis.minimumPriceTick")
     *
     * @example
     * // Declare a CIQ.ChartEngine object. This is the main object for drawing charts
     * var stxx=new CIQ.ChartEngine({container:document.querySelector(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
     * // set interval between ticks
     * stxx.chart.yAxis.minimumPriceTick=.50;
     */
    public minimumPriceTick: number
    /**
     * Set to specify that the y-axis vertical grid be drawn with fractional intervals.
     *
     * This is checked in CIQ.ChartEngine#drawYAxis and if it is not null,
     * and there is no existing [yAxis.priceFormatter]CIQ.ChartEngine.YAxis#priceFormatter, one is created to specially format the y-axis ticks.
     *
     * CIQ.ChartEngine.YAxis#decimalPlaces and CIQ.ChartEngine.YAxis#maxDecimalPlaces will not be honored in this mode.
     *
     * To disable the formatting you must reset both the yAxis.priceFormatter and this fractional object to 'null'.
     * Example:
     * ```
     * stxx.chart.yAxis.priceFormatter=stxx.chart.yAxis.fractional=null;
     * ```
     *
     * If the outlined logic is not suitable for your needs, you will need to create your own [yAxis.priceFormatter]CIQ.ChartEngine.YAxis#priceFormatter
     *
     * @example <caption> Usage example:</caption>
     * // Declare a CIQ.ChartEngine object. This is the main object for drawing charts
     * var stxx=new CIQ.ChartEngine({container:document.querySelector(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
     * // set axis to display in 1/32nds; for example, 100 5/32 will display as 100'05.  If there is a price midway between
     * // two ticks (for example, 11/64), a plus (+) will follow the price; for example 100 11/64 will display as 100'11+.
     * stxx.chart.yAxis.fractional={
     *		formatter: "'",				// This is the character used to separate he whole number portion from the numerator (' default)
     *		resolution: 1/32			// Set to smallest increment for the quoted amounts
     * }
     *
     *  @example <caption>Code used to perform the fractional formatting:</caption>
     if(!yAxis.fractional.resolution) yAxis.fractional.resolution=yAxis.minimumPrice;
     if(!yAxis.fractional.formatter) yAxis.fractional.formatter="'";
     if(!yAxis.priceFormatter) yAxis.priceFormatter=function(stx, panel, price){
     if( !yAxis.fractional ) return;
     var sign='';
     if( price < 0 ) {
     sign="-";
     price= Math.abs(price);
     }
     var whole=Math.floor(Math.round(price/yAxis.fractional.resolution)*yAxis.fractional.resolution);
     var frac=Math.round((price-whole)/yAxis.fractional.resolution);
     var _nds=Math.floor(frac);
     return sign+whole+yAxis.fractional.formatter+(_nds<10?"0":"")+_nds+(frac-_nds>=0.5?"+":"");
     };
     */
    public fractional: object
    /**
     * Set to `true` to draw tick marks and a vertical border line at the edge of the y-axis  (use with CIQ.ChartEngine.Chart#yaxisPaddingRight and CIQ.ChartEngine.Chart#yaxisPaddingLeft)
     */
    public displayBorder: boolean
    /**
     * Set to `false` to hide grid lines. See {@tutorial Gridlines and axis labels} for additional details.
     * @example <caption> On a specific panel:</caption>
     * // Be sure to get the panel name directly from the panels object as it may contain ZWNJ characters.
     * // See http://documentation.chartiq.com/CIQ.ChartEngine.html#layout%5B%60panels%60%5D
     * stxx.layout.panels[panel_name_here].yAxis.displayGridLines=false;
     * @example <caption>  On the primary chart panel:</caption>
     * stxx.chart.yAxis.displayGridLines=false;
     */
    public displayGridLines: boolean
    /**
     * Switch to 'temporarily' hide the y-axis. Set to `true' to activate.
     * Will not modify the location of the axis; to do that use CIQ.ChartEngine#setYAxisPosition instead.
     */
    public noDraw: boolean
    /**
     * Set to `false` to hide the current price label <b>in the main panel's y-axis</b>.
     *
     * Please note that the main panel's current price label will only display if there is a current price available.
     * If you have not loaded enough datapoints to overlap into the current time, as determined by the device's clock, the label will not display.
     *
     * The y-axis floating label colors are based on the difference between the most current close and the **previous** datapoint close, not the difference between the current datapoint's open and its close.
     *
     * See CIQ.ChartEngine#drawCurrentHR
     *
     * Visual Reference:
     * ![yAxis.drawCurrentPriceLabel](drawCurrentPriceLabel.png "yAxis.drawCurrentPriceLabel")
     * @since 04-2015
     */
    public drawCurrentPriceLabel: boolean
    /**
     * Set to `false` to hide the series price labels <b>in the main panel's y-axis</b>.
     *
     * @since 3.0.0
     */
    public drawSeriesPriceLabels: boolean
    /**
     * Set to false to hide **all** price labels on the particular y axis.
     * See CIQ.ChartEngine.YAxis#drawCurrentPriceLabel to disable just the current price label on the main chart panel.
     * See <a href="CIQ.ChartEngine.html#preferences%5B%60labels%60%5D">CIQ.ChartEngine.preferences.labels</a> to disable just the last value label on studies.
     * @since 04-2015
     */
    public drawPriceLabels: boolean
    /**
     * When `true`, will attempt to create grid lines that approximate a `golden ratio` between x and y axis by basing grid on CIQ.ChartEngine.YAxis#idealTickSizePixels.
     * This creates an "airy" modern looking chart.
     * If set to false, each axis will be adjusted separately and may create long and narrow rectangular grids depending on date or price range.
     * @since
     * - 04-2015
     * - 4.0.0 Now defaults to true.
     */
    public goldenRatioYAxis: boolean
    /**
     * Shape of the floating y axis label.
     *
     * Available options:
     *  - ["roundRectArrow"]CIQ.roundRectArrow
     *  - ["semiRoundRect"]CIQ.semiRoundRect
     *  - ["roundRect"]CIQ.roundRect
     *  - ["tickedRect"]CIQ.tickedRect
     *  - ["rect"]CIQ.rect
     *  - ["noop"]CIQ.noop
     *
     * It will default to CIQ.ChartEngine#yaxisLabelStyle.
     * This could be set independently on each panel if desired.
     * @since 04-2015
     * @example
     * var stxx=new CIQ.ChartEngine({container:document.querySelector(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
     * stxx.chart.yAxis.yaxisLabelStyle="rect"
     */
    public yaxisLabelStyle: string
    /**
     * Set to `true` to right justify the yaxis labels
     * Set to `false` to force-left justify the labels, even when the axis is on the left.
     * Set to null to have the justification automatically adjusted based on the axis position. Right axis will justify left, and left axis will justify right.
     *
     *
     * This setting does not control the floating last price. See CIQ.ChartEngine#drawCurrentHR and CIQ.ChartEngine#createYAxisLabel
     * @since
     * - 15-07-01
     * - 6.2.0 Formalized distinction between null and false values.
     */
    public justifyRight: boolean
    /**
     * Setting to true causes the y-axis and all linked drawings, series and studies to display inverted (flipped) from its previous state.
     * @since 6.3.0
     */
    public flipped: boolean
    /**
     * Set to true to put a rectangle behind the yaxis text (use with CIQ.ChartEngine.Chart#yaxisPaddingRight and CIQ.ChartEngine.Chart#yaxisPaddingLeft)
     * @since 15-07-01
     */
    public textBackground: boolean
    /**
     * Optional function used to override default formatting of Y-axis values, including the floating HUD value of the crosshair.
     *
     * Expected format :
     *
     * 		function(stx, panel, price, decimalPlaces)
     *
     * Parameters:
     *
     * 		stx           - CIQ.ChartEngine       - The chart object
     *		panel         - CIQ.ChartEngine.Panel - The panel
     *		price         - number                - The price to format
     *		decimalPlaces - number                - Optional - Number of decimal places to use
     *													(may not always be present)
     *
     * Returns:
     *
     *		text - Formatted text label for the price
     *
     * @example
     * stxx.chart.yAxis.priceFormatter=function(stx, panel, price, decimalPlaces){
     * 	var convertedPrice;
     * 	  // add our logic here to convert 'price' to 'convertedPrice'
     *    return convertedPrice; // string
     * }
     */
    public priceFormatter: Function
    /**
     * Sets the y-axis bottom on any panel.
     * Rendering will start this number of pixels above the panel's bottom.
     * Note that CIQ.ChartEngine#adjustPanelPositions and CIQ.ChartEngine#draw will need to be called to immediately activate this setting after the axis has already been drawn.
     *
     * Visual Reference:
     * ![yAxis.width](yAxis.bottomOffset.png "yAxis.bottomOffset")
     * ![yAxis.width](yAxis.bottomTopOffset.png "yAxis.bottomTopOffset")
     * @example
     * // The list of current panels can be found in "stxx.panels".
     * stxx.panels[panelName].yAxis.bottomOffset=20;
     * stxx.panels[panelName].yAxis.topOffset=60;
     * stxx.adjustPanelPositions();	// !!!! must recalculate the margins after they are changed. !!!!
     * stxx.draw();
     */
    public bottomOffset: number
    /**
     * Sets y-axis top on Study panels.
     * Rendering will start this number of pixels below the panel's top.
     * Note that CIQ.ChartEngine#adjustPanelPositions and CIQ.ChartEngine#draw will need to be called to immediately activate this setting after the axis has already been drawn.
     *
     * Visual Reference:
     * ![yAxis.width](yAxis.bottomTopOffset.png "yAxis.bottomTopOffset")
     * @example
     * // The list of current panels can be found in "stxx.panels".
     * stxx.panels[panelName].yAxis.bottomOffset=20;
     * stxx.panels[panelName].yAxis.topOffset=60;
     * stxx.adjustPanelPositions();	// !!!! must recalculate the margins after they are changed. !!!!
     * stxx.draw();
     */
    public topOffset: number
    /**
     * Set this to automatically compress and offset the y-axis so that this many pixels of white space are above the display.
     * Note that CIQ.ChartEngine#calculateYAxisMargins and CIQ.ChartEngine#draw will need to be called to immediately activate this setting after the axis has already been drawn.
     *
     * Visual Reference:
     * ![yAxis.width](yAxis.initialMarginTop.png "yAxis.initialMarginTop")
     *
     * @example
     * // Here is an example on how to override the default top and bottom margins before the initial axis has been rendered.
     * var stxx=new CIQ.ChartEngine({container:document.querySelector(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
     * stxx.setPeriodicity({period:1, interval:1, timeUnit:"minute"}); // Set your default periodicity to match your data; in this case, one minute.
     * stxx.chart.yAxis.initialMarginTop = 50; // Set default margins so they do not bump on to the legend.
     * stxx.chart.yAxis.initialMarginBottom = 50;
     * stxx.loadChart("SPY", {masterData: yourData});
     *
     * @example
     * // Here is an example on how to override the default top and bottom margins after the initial axis has already been rendered.
     * stxx.loadChart(symbol, {masterData: yourData}, function () {
     * 	var yAxis = stxx.chart.yAxis;
     *
     * 	yAxis.initialMarginTop = 50;
     * 	yAxis.initialMarginBottom = 50;
     *
     * 	// !! Must recalculate margins after they are changed!
     * 	stxx.calculateYAxisMargins(yAxis);
     * 	stxx.draw();
     * });
     *
     * @example
     * // Here is an example on how to override the default top and bottom margins for a specific panel after the initial axis has already been rendered.
     * // The list of current panels can be found in stxx.panels.
     * stxx.panels[panelName].yAxis.initialMarginTop = 100;
     * stxx.panels[panelName].yAxis.initialMarginBottom = 100;
     * stxx.calculateYAxisMargins(stxx.panels[panelName].yAxis); // !!!! Must recalculate the margins after they are changed. !!!!
     * stxx.draw();
     */
    public initialMarginTop: number
    /**
     * Set this to automatically compress and offset the y-axis so that this many pixels of white space are below the display.
     * Note that CIQ.ChartEngine#calculateYAxisMargins and CIQ.ChartEngine#draw will need to be called to immediately activate this setting after the axis has already been drawn.
     *
     * Visual Reference:
     * ![yAxis.width](yAxis.initialMarginTop.png "yAxis.initialMarginTop")
     *
     * @example
     * // Here is an example on how to override the default top and bottom margins before the initial axis has been rendered.
     * var stxx=new CIQ.ChartEngine({container:document.querySelector(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
     * stxx.setPeriodicity({period:1, interval:1, timeUnit:"minute"}); // Set your default periodicity to match your data; in this case, one minute.
     * stxx.chart.yAxis.initialMarginTop = 50; // Set default margins so they do not bump on to the legend.
     * stxx.chart.yAxis.initialMarginBottom = 50;
     * stxx.loadChart("SPY", {masterData: yourData});
     * @example
     * // Here is an example on how to override the default top and bottom margins after the initial axis has already been rendered.
     * stxx.loadChart(symbol, {masterData: yourData}, function() {
     * 	// Callback -- your code to be executed after the chart is loaded.
     * 	stxx.chart.yAxis.initialMarginTop = 50;
     * 	stxx.chart.yAxis.initialMarginBottom = 50;
     * 	stxx.calculateYAxisMargins(stxx.chart.panel.yAxis); // !!!! Must recalculate the margins after they are changed. !!!!
     * 	stxx.draw();
     * });
     */
    public initialMarginBottom: number
    /**
     * Sets the vertical zoom level for the y axis and all its associated series.
     *
     * It can be set programmatically or by the user as they grab the y axis and move it up or down.
     *
     * The value represents the number of pixels to zoomed in or out, and can be positive or negative.
     * The larger the number, the more it zooms out to show a wider price range.
     *
     * Please note that the zoom level will be reset as determined by CIQ.ChartEngine.YAxis#initialMarginTop and
     * CIQ.ChartEngine.YAxis#initialMarginBottom when a CIQ.ChartEngine#loadChart is rendered, the CIQ.ChartEngine#home button is pressed, or when CIQ.ChartEngine#touchDoubleClick is activated on a touch device.
     *
     * @example
     * // programmatically change the vertical zoom level for the primary chart yAxis
     * stxx.chart.yAxis.zoom=100;stxx.draw();
     */
    public zoom: number
    /**
     * set this to the number of pixels to offset the y-axis, positive or negative.
     */
    public scroll: number
    /**
     * Factor that scales the y-axis.
     *
     * The zoom value is internally adjusted based on the value of this property as follows:
     * ```
     * zoom = (1 - heightFactor) * height + initial margin settings
     * ```
     * For example, to reduce the scale of the y-axis by 20%, set `heightFactor = 0.8`.
     *
     * @since 7.0.0
     */
    public heightFactor: number
    /**
     * The y-axis width in pixels.
     *
     * ![yAxis.width](yAxis.width.png "yAxis.width")
     *
     *
     * @see CIQ.ChartEngine.Chart#dynamicYAxis to set the y-axis width dynamically.
     * @see CIQ.ChartEngine.Chart#yaxisPaddingRight and
     * CIQ.ChartEngine.Chart#yaxisPaddingLeft for information on how to overlay the y-axis onto
     * the chart.
     *
     * @example <caption>Set the y-axis width.</caption>
     * stxx.chart.yAxis.width = stxx.chart.yAxis.smallScreenWidth;
     * // Must call the following two lines to activate the update if the axis is already drawn.
     * stxx.calculateYAxisPositions();
     * stxx.draw();
     *
     * @example <caption>Reset the y-axis width to the default.</caption>
     * stxx.chart.yAxis.width = CIQ.ChartEngine.YAxis.prototype.width;
     * stxx.calculateYAxisPositions();
     * stxx.draw();
     */
    public width: number
    /**
     * The y-axis width in pixels if the screen is small (typically, smaller than the break-sm
     * breakpoint). See the CIQ.ChartEngine.Chart#breakpoint property and
     * CIQ.UI.Chart#getBreakpoint method for more information on breakpoints.
     *
     * @since 8.2.0
     */
    public smallScreenWidth: number
    /**
     * Override the default stx_yaxis style for text by setting this to the desired CSS style. This would typically be used to set a secondary axis to a particular color.
     * @since 15-07-01
     */
    public textStyle: string
    /**
     * Set to "left" or "right" to **initialize** the y-axis location.
     *
     * By default y-axis are drawn on the right side of the chart.
     * The main y-axis for any study panel will follow the main chart axis as long as this is set to null.
     *
     * Do not use this method to change the location of an existing y-axis.
     * Once initialized, y axis location can be changed at any time by calling CIQ.ChartEngine#setYAxisPosition
     *
     * @example  <caption>Pre-set the main y-axis for the chart on the left; **before it is initially rendered**.</caption>
     * stxx.chart.yAxis.position = 'left';
     * @example  <caption>Re-set the main y-axis for the chart on the right; **after it is initially rendered**.</caption>
     * stxx.setYAxisPosition(stxx.chart.yAxis,'right');
     * @since 15-07-01
     */
    public position: string
    /**
     * If true then uses the "pretty" algorithm instead of the "best fit" algorithm. The pretty algorithm
     * uses the values specified in CIQ.ChartEngine.YAxis#increments to set axis label locations.
     *
     * **Note that this algorithm will override the CIQ.ChartEngine.YAxis#minimumPriceTick. If you require specific price intervals, please set this parameter to 'false' before setting `minimumPriceTick`**
     *
     * @since 2015-11-1
     */
    public pretty: boolean
    /**
     * Values used by the CIQ.ChartEngine.YAxis#pretty algorithm to set axis label locations.
     * @since 2015-11-1
     */
    public increments: any[]
    /**
     * If true then uses an additional step in the "pretty" algorithm for the log
     * scale. This allows the algorithm to lower the grid to fill large visual gaps.
     * The "increments" are not fully respected by this approach.
     *
     * Only applicable when using *both* pretty mode and semiLog.
     * @since 2016-03-11
     */
    public prettySemiLog: boolean
    /**
     * A matrix used to determine how many decimal places to print on y axis labels based on the size of the shadow (the difference between chart high and chart low).
     * The array consists of tuples in descending order. If the shadow is less than n1 then n2 decimal places will be printed.
     * See CIQ.ChartEngine.YAxis.defaultShadowBreaks and CIQ.ChartEngine.YAxis.smallChartShadowBreaks for default settings.
     *
     * This can be overridden, however, by settingCIQ.ChartEngine.YAxis#decimalPlaces.
     * If you wish to further configure the current price label floating over the y axis to display less decimal places than the axis labels, set CIQ.ChartEngine.YAxis#maxDecimalPlaces.
     * Also see CIQ.ChartEngine.Chart#dynamicYAxis to allow the y axis to automatically determine its width based on the text length of quotes in a dataSet.
     *
     * @since 2015-11-1
     * @example
     * stxx.chart.yAxis.shadowBreaks=CIQ.ChartEngine.YAxis.defaultShadowBreaks;
     * @example
     * stxx.chart.yAxis.shadowBreaks=CIQ.ChartEngine.YAxis.smallChartShadowBreaks;
     */
    public shadowBreaks: any[]
    /**
     * Convenience function for checking whether multiple plots share this axis.
     *
     * @param stx A chart engine instance.
     * @param includeDependents Set to true to count dependent renderers among the plots sharing the axis.
     * @since
     * - 7.2.0
     * - 7.3.0 Added `stx` and `includeDependents` parameters.
     */
    public isShared(stx: CIQ.ChartEngine, includeDependents: boolean): void
    /**
     * Sets the background of the axis when hovering over it to indicate more action are available, such as zooming and dragging.
     *
     * To disable color change on hover, set to a stub function:
     * ```
     * CIQ.ChartEngine.YAxis.prototype.setBackground=function(stx, params){};
     * ```
     *
     * @param stx A chart engine instance
     * @param [params]
     * @param [params.color] background color
     * @param [params.opacity] opacity of background color
     * @since 7.1.0
     */
    public setBackground(
      stx: CIQ.ChartEngine,
      params?: {
        color?: string,
        opacity?: number
      }
    ): void
    /**
     * Sets the y-axis width based on the `breakpoint` parameter.
     *
     * @param breakpoint The responsive design breakpoint that determines the y-axis width.
     * 		See the CIQ.UI.Chart#getBreakpoint method for valid values.
     *
     * @since 8.2.0
     */
    public setBreakpointWidth(breakpoint: string): void
  }

  /**
   * READ ONLY. Toggles to true when a drawing is initiated
   * @static
   */
  const drawingLine: boolean

  /**
   * READ ONLY. Toggles to true when a panel is being resized
   * @static
   */
  const resizingPanel: boolean

  /**
   * READ ONLY. Current X screen coordinate of the crosshair.
   * @static
   */
  const crosshairX: number

  /**
   * READ ONLY. Current Y screen coordinate of the crosshair.
   * @static
   */
  const crosshairY: number

  /**
   * [Browser animation API](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) is on by default.
   * @static
   */
  let useAnimation: boolean

  /**
   * Set to true to true to bypass all touch event handling.
   * @static
   */
  let ignoreTouch: number

  /**
   * Mitigates problems clearing the canvas on old (defective) Android devices by performing additional function on the canvas, normally not needed on the newer devices.
   * Set to false to boost native android browser performance, but at risk of "double candle" display errors on some older devices.
   * @static
   */
  let useOldAndroidClear: boolean

  /**
   * If set to a valid time zone identifier, then new CIQ.ChartEngine objects will pull their display timezone from this.
   * @static
   */
  let defaultDisplayTimeZone: string

  /**
   * If set, overrides the default base path for plug-ins.
   *
   * By default, plug-ins loaded by means of a script tag check for resources inside the
   * plug-ins directory, `plugins/`. However, if the application is served from outside the
   * `chartiq` directory, or the plug-ins folder is otherwise not available at `./`, you may
   * need to specify where the plug-ins directory can be found so resources can be loaded.
   *
   * Path must end in `/`.
   *
   * @static
   * @since 8.0.0
   */
  let pluginBasePath: string

  /**
   * Determines whether the internal chart periodicity is based on a daily interval ("day", "week"
   * or "month").
   *
   * **Note:** This function is intended to be used on the internal periodicity as stored in
   * CIQ.ChartEngine#layout.
   *
   * @param interval The internal chart periodicity for which the interval is determined.
   * @return True if the internal chart periodicity is a daily interval; otherwise, false.
   *
   *
   * @see <a href="CIQ.ChartEngine.html#layout%5B%60periodicity%60%5D">CIQ.ChartEngine.layout.periodicity</a>
   * @see <a href="CIQ.ChartEngine.html#layout%5B%60interval%60%5D">CIQ.ChartEngine.layout.interval</a>
   * @see <a href="CIQ.ChartEngine.html#layout%5B%60timeUnit%60%5D">CIQ.ChartEngine.layout.timeUnit</a>
   */
  function isDailyInterval(interval: string): boolean
}
/**
 * Base namespace for CIQ library
 *
 * Previously `STX`
 */
export namespace CIQ {
  /**
   * CIQ.Drawing interface placeholder to be augmented in *standard.js* with properties.
   *
   */
  interface Drawing {
  }

  /**
   * Previously `STXChart`.
   *
   * This is the constructor that creates a chart engine, instantiates its basic chart object and links it to its DOM container.
   *
   * Before any chart operations can be performed, this constructor must be called.
   *
   * Multiple CIQ.ChartEngine objects can exist on the same HTML document.
   * 	<iframe width="100%" height="500" scrolling="no" seamless="seamless" align="top" style="float:top" src="https://jsfiddle.net/chartiq/46whz5ag/embedded/result,js,html/" allowfullscreen="allowfullscreen" frameborder="1"></iframe>
   *
   * Once instantiated, the chart engine will never need to be constructed again, unless it is [destroyed]CIQ.ChartEngine#destroy.
   * To load or change symbols on the chart, simply call CIQ.ChartEngine#loadChart.
   *
   * CIQ.ChartEngine#container is the minimum requirement. The complete list of parameters and objects can be found in the **Members** section of this page.
   * Example:
   * 	<iframe width="100%" height="500" scrolling="no" seamless="seamless" align="top" style="float:top" src="https://jsfiddle.net/chartiq/xkm4mufy/embedded/js,result,html/" allowfullscreen="allowfullscreen" frameborder="1"></iframe>
   * @example
   * // declare a chart
   * var stxx=new CIQ.ChartEngine({container: document.querySelector(".chartContainer")});
   * // override defaults after a chart object is declared (this can be done at any time. If the chart has already been rendered, you will need to call `stx.draw();` to immediately see your changes )
   * stxx.yaxisLabelStyle="roundRectArrow";
   * stxx.layout.chartType="bar";
   * @example
   * // declare a chart and preset defaults
   * var stxx=new CIQ.ChartEngine({container: document.querySelector(".chartContainer"),layout:{"chartType": "candle","candleWidth": 16}});
   * @since
   * - 15-07-01 Deprecated `CIQ.ChartEngine#underlayPercentage`.
   * - m-2016-12-01 Deprecated; renamed `CIQ.ChartEngine` from `STXChart`.
   */
  class ChartEngine {
    /**
     * Previously `STXChart`.
     *
     * This is the constructor that creates a chart engine, instantiates its basic chart object and links it to its DOM container.
     *
     * Before any chart operations can be performed, this constructor must be called.
     *
     * Multiple CIQ.ChartEngine objects can exist on the same HTML document.
     * 	<iframe width="100%" height="500" scrolling="no" seamless="seamless" align="top" style="float:top" src="https://jsfiddle.net/chartiq/46whz5ag/embedded/result,js,html/" allowfullscreen="allowfullscreen" frameborder="1"></iframe>
     *
     * Once instantiated, the chart engine will never need to be constructed again, unless it is [destroyed]CIQ.ChartEngine#destroy.
     * To load or change symbols on the chart, simply call CIQ.ChartEngine#loadChart.
     *
     * @param config Configuration object used to initialize the chart engine.
     * CIQ.ChartEngine#container is the minimum requirement. The complete list of parameters and objects can be found in the **Members** section of this page.
     * Example:
     * 	<iframe width="100%" height="500" scrolling="no" seamless="seamless" align="top" style="float:top" src="https://jsfiddle.net/chartiq/xkm4mufy/embedded/js,result,html/" allowfullscreen="allowfullscreen" frameborder="1"></iframe>
     * @example
     * // declare a chart
     * var stxx=new CIQ.ChartEngine({container: document.querySelector(".chartContainer")});
     * // override defaults after a chart object is declared (this can be done at any time. If the chart has already been rendered, you will need to call `stx.draw();` to immediately see your changes )
     * stxx.yaxisLabelStyle="roundRectArrow";
     * stxx.layout.chartType="bar";
     * @example
     * // declare a chart and preset defaults
     * var stxx=new CIQ.ChartEngine({container: document.querySelector(".chartContainer"),layout:{"chartType": "candle","candleWidth": 16}});
     * @since
     * - 15-07-01 Deprecated `CIQ.ChartEngine#underlayPercentage`.
     * - m-2016-12-01 Deprecated; renamed `CIQ.ChartEngine` from `STXChart`.
     */
    constructor(config: object)
    /**
     * The DOM container that will be running the chart engine. This is a required field when calling [new CIQ.ChartEngine]CIQ.ChartEngine
     * @instance
     * @example
     * // declare a chart
     * var stxx=new CIQ.ChartEngine({container: document.querySelector(".chartContainer")});
     */
    public container: object
    /**
     * READ ONLY. A map of marker objects, sorted by label.
     * @instance
     */
    public markers: object
    /**
     * READ ONLY. An array of currently enabled panels
     * @instance
     */
    public panels: object
    /**
     * READ ONLY. An array of currently enabled overlay studies
     * @instance
     */
    public overlays: object
    /**
     * READ ONLY. Array of event listeners currently attached to the engine.
     * These listeners will be killed when CIQ.ChartEngine#destroy is called.
     *
     * See CIQ.ChartEngine#addEventListener and CIQ.ChartEngine#removeEventListener
     * @instance
     */
    public eventListeners: any[]
    /**
     * Holds the HTML control elements managed by the chart. Usually this will be a copy of the default [htmlControls]CIQ.ChartEngine.htmlControls.
     * These are not the GUI elements around the chart, but rather the HTML elements that the library will directly interact with on the canvas
     * for things like panel resizing, study edit controls, zooming controls, etc. See CIQ.ChartEngine.htmlControls for more details.
     * @instance
     */
    public controls: object
    /**
     * READ ONLY. Toggles to true when the screen is being pinched
     * @instance
     */
    public pinchingScreen: boolean
    /**
     * READ ONLY. Toggles to true when the screen is being panned
     * @instance
     */
    public grabbingScreen: boolean
    /**
     * READ ONLY. The tick representing the crosshair cursor point
     * @instance
     */
    public crosshairTick: number
    /**
     * READ ONLY. The value (price) representing the crosshair cursor point
     * @instance
     */
    public crosshairValue: number
    /**
     * Manage drawing cloning state.
     *
     * Set to `true` to enable the ability to clone drawings.
     * Once enabled, drawings can be cloned once or multiple times.
     * A user must highlight the drawing, click on it, move the mouse to a new location and click again to set.
     * Reset to `false` when you want the cloning to end.
     *
     * This can be done based on a key stroke, button press, etc. For example, you can set to true when the `control` key is pressed and disable when it is released.
     * @instance
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
    public cloneDrawing: number
    /**
     * READ ONLY. Toggles to true whenever the mouse cursor is within the chart (canvas)
     * @instance
     */
    public insideChart: boolean
    /**
     * READ ONLY. Toggles to true if the mouse cursor is over the X Axis.
     * @instance
     */
    public overXAxis: boolean
    /**
     * READ ONLY. Toggles to true if the mouse cursor is over the Y Axis.
     * @instance
     */
    public overYAxis: boolean
    /**
     * READ ONLY. This gets set to true when the chart display has been initialized.
     * @instance
     */
    public displayInitialized: boolean
    /**
     * READ ONLY. Mouse pointer X pixel location in reference to the chart canvas. where cx=0 and cy=0 is the upper left corner of the chart.
     * @instance
     */
    public cx: number
    /**
     * READ ONLY. If `true` the chart is in 'historical mode' and no [quotefeed]{@tutorial DataIntegrationQuoteFeeds} 'update' calls will be made.
     *
     * This happens when [setSpan]CIQ.ChartEngine#setSpan or [setRange]CIQ.ChartEngine#setRange are used to 'jump' to a range in the distance past,
     * where the master data no longer extends from the end of the displayed range to the current bar.
     * @instance
     */
    public isHistoricalModeSet: boolean
    /**
     * READ ONLY. Mouse pointer Y pixel location in reference to the chart canvas. where cx=0 and cy=0 is the upper left corner of the chart.
     * @instance
     */
    public cy: number
    /**
     * READ ONLY. Timezone of the masterData, set by CIQ.ChartEngine#setTimeZone.
     * @instance
     */
    public dataZone: string
    /**
     * READ ONLY. Timezone to display on the chart, set by CIQ.ChartEngine#setTimeZone.
     * @instance
     */
    public displayZone: string
    /**
     * Register this function to transform the data set before a createDataSet() event; such as change in periodicity.
     * You can also explicitly call  <code>stxx.createDataSet(); stxx.draw();</code> to trigger this function.
     *
     * Expected Format :
     *
     * 		fc(stxChart, dataSet);
     *
     * @instance
     * @example
     * stxx.transformDataSetPre=function(stxx, dataSet){
     *		for(var i=0;i < dataSet.length;i++){
     *			// do something to the dataset here
     *		}
     * }
     */
    public transformDataSetPre: Function
    /**
     * Register this function to transform the data set after a createDataSet() event; such as change in periodicity.
     * You can also explicitly call  <code>stxx.createDataSet(); stxx.draw();</code> to trigger this function.
     *
     * Expected Format :
     *
     * 		fc(stxChart, dataSet, min low price in the dataset, max high price in the dataset);
     *
     * @instance
     * @example
     * stxx.transformDataSetPost=function(self, dataSet, min, max){
     *		for(var i=0;i < dataSet.length;i++){
     *			// do something to the dataset here
     *		}
     * }
     */
    public transformDataSetPost: Function
    /**
     * This is the callback function used by CIQ.ChartEngine#setPeriodicity when no quotefeed has been attached to the chart.
     * Called if the masterData does not have the interval requested.
     *
     * Do not initialize if you are using a quotefeed
     *
     * @instance
     * @example
     * stxx.dataCallback=function(){
     *		// put code here to get the new data in the correct periodicity.
     *		// use layout.interval and layout.periodicity to determine what you need.
     *		// finally call stxx.loadChart(symbol,data) to load the data and render the chart.
     * }
     */
    public dataCallback: Function
    /**
     * Stores a list of active drawing object on the chart. Serialized renditions of drawings can be added using CIQ.ChartEngine#createDrawing and removed using CIQ.ChartEngine#removeDrawing
     * @instance
     */
    public drawingObjects: any[]
    /**
     * READ ONLY. Flag that specifies whether the background canvas should be used to draw grid lines and axes.
     * This flag is set to true when the `canvasShim` contains child elements. The `canvasShim` is the background
     * canvas — an HTML container behind the main chart canvas.
     *
     * Check this flag to determine whether the `canvasShim` is being used to create background drawings.
     *
     * @see CIQ.Visualization
     * @see CIQ.ChartEngine#embedVisualization.
     * @instance
     * @since 7.4.0
     */
    public useBackgroundCanvas: boolean
    /**
     * READ ONLY. Access the renderer controlling the main series.
     * @instance
     */
    public mainSeriesRenderer: CIQ.Renderer
    /**
     * Object that stores the styles used by the chart.
     * @instance
     */
    public styles: object
    /**
     * Cloned copy of CIQ.ChartEngine.currentVectorParameters object template.
     * Use it to store the settings for the active drawing tool.
     * @instance
     */
    public currentVectorParameters: typeof CIQ.ChartEngine.currentVectorParameters
    /**
     * Holds CIQ.ChartEngine.Chart object
     * @instance
     */
    public chart: CIQ.ChartEngine.Chart
    /**
     * Time in MS to trigger a long hold on the chart.
     */
    public longHoldTime: number
    /**
     * Number of pixels the mouse needs to move in vertical direction to "unlock" vertical panning/scrolling.
     * Setting to a number larger than the pixels on the canvas will also disable vertical scrolling
     * @example
     * //This will disable the tolerance, so panning will immediately follow the user actions without maintaining a locked vertical location when panning left or right.
     * var stxx=new CIQ.ChartEngine({container:document.querySelector(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
     * stxx.yTolerance=0;
     */
    public yTolerance: number
    /**
     * Number of bars to always keep in view when the user pans forwards or backwards.
     * If this is set to less than 1, it will be possible to have a blank chart.
     *
     * See CIQ.ChartEngine.Chart#allowScrollPast and CIQ.ChartEngine.Chart#allowScrollFuture for instructions on how to prevent users from scrolling past the last bar on the chart in either direction; which may supersede this setting.
     * @since 05-2016-10
     */
    public minimumLeftBars: number
    /**
     * Set to true to reverse direction of mousewheel for zooming
     */
    public reverseMouseWheel: boolean
    /**
     * Set to false to turn off mousewheel acceleration effect; which depending on initial gesture speed, slowly slows down zooming as you let go of the wheel/pad.
     * @since 2015-11-1
     */
    public mouseWheelAcceleration: boolean
    /**
     * Minimum candleWidth (in pixels) allowed when zooming out. Determines the maximum number of ticks to display on the chart.
     *
     * Use CIQ.ChartEngine#minimumZoomTicks to set the minimum number of ticks that must remain on the chart during a zoom-in operation.
     *
     * When candleWidth<1 and CIQ.ChartEngine.Chart#lineApproximation true,
     * will create approximation of a line chart to improve rendering performance.
     * Regardless, anything smaller than **0.3 pixels** may cause performance issues when zooming out.
     */
    public minimumCandleWidth: number
    /**
     * Maximum candleWidth (in pixels) allowed when zooming in. Determines the minimum number of ticks to display on the chart.
     *
     * Also see CIQ.ChartEngine#minimumZoomTicks to set the minimum number of ticks that must remain on the chart during a zoom-in operation.
     *
     * @since 7.4.0
     */
    public maximumCandleWidth: number
    /**
     * Set to the number of ticks that **must** remain on the chart when zooming in.
     *
     * Use CIQ.ChartEngine#minimumCandleWidth to set the minimum number of ticks that must remain on the chart during a zoom-out operation.
     * @since 07-2016-16.6
     */
    public minimumZoomTicks: number
    /**
     * Set to false to disable any user zooming on the chart
     * @since 04-2015
     * @example
     * var stxx=new CIQ.ChartEngine({container:document.querySelector(".chartContainer"), allowZoom:false, layout:{"candleWidth": 16, "crosshair":true}});
     */
    public allowZoom: boolean
    /**
     * Set to false to disable any user scrolling of the chart
     * @since 04-2015
     * @example
     * var stxx=new CIQ.ChartEngine({container:document.querySelector(".chartContainer"), allowScroll:false, layout:{"candleWidth": 16, "crosshair":true}});
     */
    public allowScroll: boolean
    /**
     * Set to false to disable 2 finger side swipe motion for scrolling
     * @since 2015-12-08
     */
    public allowSideswipe: boolean
    /**
     * If set to true then a three finger movement will increment periodicity.
     */
    public allowThreeFingerTouch: boolean
    /**
     * Set to `true` to bypass right clicks on **all** overlay types and their hovering pop-ups.
     * Or define independent settings for series, studies, and drawings by using an object instead.
     *
     * On touch devices, it will bypass CIQ.ChartEngine#touchDoubleClick
     *
     * Also see:
     * - [rightClickEventListener]CIQ.ChartEngine~rightClickEventListener
     * - CIQ.ChartEngine#rightClickHighlighted
     *
     * @since
     * - 2016-07-16
     * - 5.1.0 An object containing booleans to separate series, studies, and drawings.
     * @example
     * this.bypassRightClick={
     *	series: false,
     *	study: false,
     *	drawing: false
     * };
     */
    public bypassRightClick: {
      series: boolean,
      study: boolean,
      drawing: boolean
    }
    /**
     * Function which can be used to modify the highlighted field to be used for an averaging-type drawing.
     * Can be customized (overridden) to adjust certain fields, while passing through others.
     * Note: if the field to be returned is a member of an object (e.g., AAPL.Close), the proper format
     * for returning this would be "AAPL-->Close".
     * @param field dataSet field
     * @return adjusted field
     * @example
     * stxx.adjustHighlightedDataSetField=function(field){
     * 	if(!field) return null;
     * 	for(var st in this.layout.studies){
     * 		var study=this.layout.studies[st];
     * 		if(study.outputMap.hasOwnProperty(field)) {
     * 			// adjust the field based on the study in which it belongs
     * 			if(study.type=="Pivot Points") return null;
     * 			...
     * 			break;
     * 		}
     * 	}
     * 	for(var sr in this.chart.series){
     * 		var series=this.chart.series[sr];
     * 		if(series.id==field.split("-->")[0]) {
     * 			// adjust the field based on the series in which it belongs
     * 			if(series.id=="AAPL") return series.id+"-->High";
     * 			...
     * 			break;
     * 		}
     * 	}
     * 	return field;
     * };
     * @since 7.0.0
     */
    public adjustHighlightedDataSetField(field: string): string
    /**
     * Set these to false to not display the up and down arrows in the panel management component. See CIQ.ChartEngine#controls for alternate methods and more details.
     * @example
     * stxx.displayIconsUpDown=false;
     */
    public displayIconsUpDown: boolean
    /**
     * Set these to false to not display this panel management component. See CIQ.ChartEngine#controls for alternate methods and more details.
     * @example
     * stxx.displayIconsSolo=false;
     */
    public displayIconsSolo: boolean
    /**
     * Set these to false to not display this panel management component. See CIQ.ChartEngine#controls for alternate methods and more details.
     * @since 3.0.7
     * @example
     * stxx.displayIconsClose=false;
     */
    public displayIconsClose: boolean
    /**
     * Set these to false to not display this panel management component. See CIQ.ChartEngine#controls for alternate methods and more details.
     * @example
     * stxx.displayPanelResize=false;
     */
    public displayPanelResize: boolean
    /**
     * Set this to true to hide even the chart panel when soloing a non-chart panel.  Normally chart panels are not hidden when soloing.
     * @since 3.0.7
     * @example
     * stxx.soloPanelToFullScreen=true;
     */
    public soloPanelToFullScreen: boolean
    /**
     * Only reposition markers this many milliseconds. Set to null for no visible delay. Set to 0 for a Zero Delay timeout. (lower numbers are more CPU intensive).
     * See {@tutorial Markers} for more details on adding markers to your charts
     * @example
     * stxx.markerDelay=25;
     */
    public markerDelay: number
    /**
     * When set to true, the backing store for the canvas is used.
     * This results in crisper display but with a noticeable performance penalty in some browsers.
     * The default is true.
     * If improved performance is necessary, set the variable as shown in the example.
     * The example allows mobile devices (android/ipad/iphone) to continue using the backing store while being bypassed in others (desktop browsers).
     *
     * @since 3.0.0
     * @example
     * stxx.useBackingStore=CIQ.isMobile;
     */
    public useBackingStore: boolean
    /**
     * Primarily intended for mobile devices, if set to `false` it will allow up/down swiping to pass through the chart container so the main page can manage it.
     * This allows a user swiping up and down to swipe through the chart instead of having the chart capture the event and prevent the page from continue moving.
     * It therefore produces a more natural up/down swiping motion throughout the page.
     * @since 12-2015-08
     */
    public captureTouchEvents: boolean
    /**
     * If set to `false` it will allow up/down [mouseWheel / touchPad swiping]CIQ.ChartEngine#mouseWheel to pass through the chart container so the main page can manage it.
     * This allows a user swiping up and down to swipe through the chart instead of having the chart capture the event and prevent the page from continue moving.
     * It therefore produces a more natural up/down sliding of the page.
     * @since m-2016-12-01.4
     */
    public captureMouseWheelEvents: boolean
    /**
     * If true (the default), requires a tap on a drawing, plot, y-axis, or other object before
     * the object is highlighted. If false, allows highlighting of objects when the mouse cursor
     * moves over the objects.
     *
     * @since 8.2.0
     */
    public tapForHighlighting: boolean
    /**
     * The maximum number of milliseconds between clicks that trigger a double-click.
     *
     * @since 8.0.0
     */
    public doubleClickTime: number
    /**
     * Shape of the floating y axis label.
     *
     * Available options:
     *  - ["roundRectArrow"]CIQ.roundRectArrow
     *  - ["semiRoundRect"]CIQ.semiRoundRect
     *  - ["roundRect"]CIQ.roundRect
     *  - ["tickedRect"]CIQ.tickedRect
     *  - ["rect"]CIQ.rect
     *  - ["noop"]CIQ.noop
     * @example
     * var stxx=new CIQ.ChartEngine({container: document.querySelector(".chartContainer")});
     * stxx.yaxisLabelStyle="roundRectArrow";
     */
    public yaxisLabelStyle: string
    /**
     * Set to false if you don't want the axis borders drawn. This will override individual settings on yaxis and xaxis.
     */
    public axisBorders: boolean
    /**
     * Set to true to have drawings highlight only the last applied drawing if more than one is intersected at a time.
     * @since 5.0.0
     */
    public singleDrawingHighlight: boolean
    /**
     * X axis offset for touch devices so that finger isn't blocking crosshair
     */
    public crosshairXOffset: number
    /**
     * Y axis Offset for touch devices so that finger isn't blocking crosshair
     */
    public crosshairYOffset: number
    /**
     * When set to true, line and mountain charts are extended slightly in order to reduce whitespace at the right edge of the chart
     * @since 05-2016-10 The line will be extended to the end of the chart (full candle width) instead of the candle border, even when using `yaxisLabelStyle` "roundRectArrow".
     */
    public extendLastTick: boolean
    /**
     * This is the callback function used to translate languages.
     * Should return a translated phrase given the English phrase. See separate translation file for list of phrases.
     *
     * Expected format :
     *
     * 		var translatedWord = fc(english);
     *
     * Defaults to CIQ.I18N.translate
     */
    public translationCallback: Function
    /**
     * Set this to `true` if your server returns data in week or monthly ticks, and doesn't require rolling computation from daily.
     *
     * If set to `false`:
     * - 'weekly' bars will be aligned to the first open market day of the week according to the active [market definitions]CIQ.Market (Weeks start Sunday).
     * - 'monthly' bar will be aligned to the first market day of the month according to the active [market definitions]CIQ.Market.
     *
     */
    public dontRoll: boolean
    /**
     * Set to true to allow an equation to be entered into the symbol input.  For example, =2*IBM-GM
     * NOTE: the equation needs to be preceded by an equals sign (=) in order for it to be parsed as an equation.
     * See CIQ.formatEquation and CIQ.computeEquationChart for more details on allowed syntax.
     */
    public allowEquations: boolean
    /**
     * If set, CIQ.ChartEngine#doCleanupGaps will be automatically called
     * on intra-day or daily interval charts to create missing data points during market hours/days for stocks that may have missing bars.
     *
     * `carry` will cause the closing price to be carried forward, resulting in dashes on a candle/bar chart or continuous line on a line or mountain chart.
     * `gap` will cause physical breaks to occur on the chart in the gapped position.
     *
     * **Note:** the clean up process uses the active periodicity and the active market definition, if any.
     * So you must first set those to ensure proper clean up.
     * If no market definition is enabled, the clean up will assume gaps need to be added during the entire 24 hours period, every day.
     * See "CIQ.Market" for details on how to properly configure the library to your market hours requirements.
     * No gaps will be cleaned for `tick` since by nature it is no a predictable interval.
     *
     * **Important information to prevent inaccurate 'gapping'**
     * - This parameter must be set **before** any data is loaded into the chart.
     * - The cleanup process leverages the current market iterator which traverses along the timeline on the exact minute/second/millisecond mark for intraday data.
     * As such, you must ensure your time stamps match this requirement.
     * If your data does not comply, you must round your timestamps before sending the data into the chart.
     * For example, if in minute periodicity, seconds and milliseconds should not be present or be set to zero.
     *
     *
     * @example  <caption>If using a quoteFeed, just set the parameter will automatically call CIQ.ChartEngine#doCleanupGaps </caption>
     * var stxx=new CIQ.ChartEngine({container:document.querySelector(".chartContainer")});
     * stxx.attachQuoteFeed(yourFeed,{refreshInterval:1});
     * stxx.setMarketFactory(CIQ.Market.Symbology.factory);
     * stxx.cleanupGaps='carry';
     * stxx.setPeriodicity({period:1, interval:5, timeUnit:"minute"});
     * stxx.loadChart("SPY");
     *
     * @since
     * - 15-07-01 Gaps are automatically cleaned up unless this flag is set to false.
     * - 2015-11-1 Gaps are not automatically cleaned unless this flag is set to true.
     * - m-2016-12-01.4 Now supports "carry" and "gap" values. Setting to non-false will default to "carry" for backward compatibility with prior versions.
     */
    public cleanupGaps: string
    /**
     * When set to `true`, the requested range will be visually preserved between [symbol changes]CIQ.ChartEngine#loadChart or when a [layout is imported]CIQ.ChartEngine#importLayout,
     * even if the data required to fill the left and/or right side of the x axis is not present.
     *
     * This behavior is similar to setting `goIntoPast` and `goIntoFuture` when calling [setRange]CIQ.ChartEngine#setRange/[setSpan]CIQ.ChartEngine#setSpan explicitly.
     *
     * Please note that at the moment, a range will not be preserved when using [addSeries]CIQ.ChartEngine#addSeries, if the new data extends further than the currently loaded data for the primary instrument.
     * For this, you will need to manually call  [setRange]CIQ.ChartEngine#setRange/[setSpan]CIQ.ChartEngine#setSpan in the [addSeries]CIQ.ChartEngine#addSeries callback.
     * @since 5.1.2
     */
    public staticRange: boolean
    /**
     * Set a maximum size for the dataSet to prevent it from growing excessively large.
     *
     * Once the max number of records have been loaded, pagination requests will be ignored
     * and older data will be dropped from the end (historical) side of the dataSet array as new bars arrive, until that number is increased.
     *
     * Set to 0 to let it grow forever.
     */
    public maxDataSetSize: number
    /**
     * Set a maximum size for masterData to prevent it from growing excessively large.
     *
     * Once the max number of records have been loaded, pagination requests will be ignored
     * and older data will be dropped from the end (historical) side of the masterData array as new bars arrive, until that number is increased.
     *
     * By default (set to 0) masterData is unlimited and will grow forever.
     *
     * Note: when rolling up data due to periodicity, you should anticipate large enough masterData to accomodate the desired chart length.
     *
     * @since 3.0.0
     */
    public maxMasterDataSize: number
    /**
     * Set to zero to avoid resize checking loop. See CIQ.ChartEngine#setResizeTimer for more details
     */
    public resizeDetectMS: number
    /**
     * Set to true to display the xAxis below all panels.
     * By default, the x axis will be rendered right under the main chart panel.
     * @since
     * - 05-2016-10
     * - 4.1.0 Now defaults to true.
     * - 5.2.0 Vertical grid lines in study panels no longer dependent on this property and will be always displayed.
     */
    public xAxisAsFooter: boolean
    /**
     * Sets the x axis height in pixels.
     *
     * - Set to null to automatically adjust to the size of the axis font.
     * - Set to 0 completely remove the x axis.
     * - Use CIQ.ChartEngine.XAxis#noDraw to temporarily hide the axis, but maintain its spacing.
     * @since 4.1.0 Now defaults to 30px.
     */
    public xaxisHeight: boolean
    /**
     * Set to true to display horizontal grid lines on studies.
     * This parameter is only used when a custom y axis is **not** defined for the study.
     *
     * To also disable zones and center lines on studies add:
     * ```CIQ.Studies.drawHorizontal=function(){};```
     * For more details see CIQ.Studies.doPostDrawYAxis
     * @since 3.0.0
     */
    public displayGridLinesInStudies: boolean
    /**
     * When true serialize methods may escape their values with encodeURIComponent.
     * @since 4.1.0
     */
    public escapeOnSerialize: boolean
    /**
     * Adjust to increase or decrease the default width of candles (see {@tutorial Understanding Chart Range}).
     */
    public candleWidthPercent: number
    /**
     * Set to `true` to color any OHLC type rendering (bar, candles) as well as the volume study,
     * based on difference between open and close, rather than difference between previous close and current close.
     *
     * Used in CIQ.Renderer.OHLC and CIQ.Studies.createVolumeChart
     * @since 4.0.0
     */
    public colorByCandleDirection: boolean
    /**
     * chart types which do not draw wicks on candles
     */
    public noWicksOnCandles: {
      renko: boolean,
      linebreak: boolean
    }
    /**
     * chart types which require fetching as many bars as possible (since they aggregate data)
     */
    public fetchMaximumBars: {
      rangebars: boolean,
      kagi: boolean,
      renko: boolean,
      linebreak: boolean,
      pandf: boolean
    }
    /**
     * Comparisons by default start at the close value of the previous bar.
     * Set this to true to start at the current bar instead.
     * @since 7.3.0
     */
    public startComparisonsAtFirstVisibleBar: boolean
    /**
     * Animations. These can be overridden with customized EaseMachines
     * To disable an animation replace with an EaseMchine with one ms as the second parameter.
     * @example
     * stxx.animations.zoom=new CIQ.EaseMachine(Math["easeOutCubic"],1);
     */
    public animations: {
      zoom: {
        isStub: boolean,
        run: Function,
        stop: Function,
        reset: Function,
        running: boolean,
        hasCompleted: boolean
      }
    }
    /**
     * Map of default values to be used to statically set periodicity (candle width) upon range selection when using CIQ.ChartEngine#setRange
     *
     * **Default Value:**
     * ```
     * [
     *     {
     *         rangeInMS : CIQ.WEEK,	// Any range less than a week, load 5 minute bars
     *         periodicity : 1,
     *         interval : 5,
     *         timeUnit : 'minute'
     *     },
     *     {
     *         rangeInMS : CIQ.MONTH,	// Any range less than a month, load 30 minute bars
     *         periodicity : 1,
     *         interval : 30,
     *         timeUnit : 'minute'
     *     },
     *     {
     *         rangeInMS : CIQ.YEAR,	// Any range less than a year, load day bars
     *         periodicity : 1,
     *         interval : "day"
     *     },
     *     {
     *         rangeInMS : CIQ.DECADE,	// Any range less than 10 years, load weekly bars
     *         periodicity : 1,
     *         interval : "week"
     *     },
     *     {
     *         rangeInMS : CIQ.DECADE * 10,	// Any range less than a century, load monthly bars
     *         periodicity : 1,
     *         interval : "month"
     *     },
     *     {
     *         rangeInMS : Number.MAX_VALUE,	// Anything greater than a century, load yearly bars
     *         periodicity : 12,
     *         interval : "month"
     *     }
     * ]
     * ```
     * @since m-2016-12-01
     */
    public staticRangePeriodicityMap: any[]
    /**
     * Map of multiples to be used to dynamically determine periodicity (candle width) upon range selection when using CIQ.ChartEngine#setRange
     * Used when CIQ.ChartEngine#autoPickCandleWidth is enabled
     *
     * **Default Value:**
     * ```
     * [
     *     {
     *         interval : 1,
     *         rangeInMS : CIQ.MINUTE
     *     },
     *     {
     *         interval : 5,
     *         rangeInMS : CIQ.MINUTE * 5
     *     },
     *     {
     *         interval : 30,
     *         rangeInMS : CIQ.MINUTE * 30
     *     },
     *     {
     *         interval : 60,
     *         rangeInMS : CIQ.MINUTE * 60
     *     },
     *     {
     *         interval : "day",
     *         rangeInMS : CIQ.DAY
     *     },
     *     {
     *         interval : "month",
     *         rangeInMS : CIQ.MONTH
     *     },
     *     {
     *         interval : "year",
     *         rangeInMS : CIQ.YEAR
     *     }
     * ]
     * ```
     *
     * @since 11-2016-29
     */
    public dynamicRangePeriodicityMap: any[]
    /**
     * Contains the current chart layout.
     *
     * Layout parameters can be directly **pre-set** on a chart at the time the engine is instantiated, by providing an object exactly matching **the internal layout  format**.
     * The following is an example for setting some of the available layout parameters:
     * ```
     * var stxx=new CIQ.ChartEngine({
     * 			container: document.querySelector(".chartContainer"),
     * 			layout:{
     * 				"crosshair":true,
     * 				"interval":"day",
     * 				"periodicity":1,
     * 				"chartType": "candle",
     * 				"candleWidth": 16
     * 			}
     * });
     * ```
     * These parameters will then be activated when [loadChart()]CIQ.ChartEngine#loadChart is called to render the chart.
     * Once a chart is rendered, most of these parameters become `READ ONLY`,and must be modified using their corresponding methods, as indicated in the documentation, to ensure chart integrity.
     *
     * **Important Note on internal periodicity format:**<BR>
     *  Internal format of the layout object **does not match the parameters** used in ​CIQ.ChartEngine#setPeriodicity or CIQ.ChartEngine#loadChart.
     *  Use CIQ.ChartEngine#getPeriodicity to extract internal periodicity into the expected external format.
     *
     * See [importLayout]CIQ.ChartEngine#importLayout and [exportLayout]CIQ.ChartEngine#exportLayout for methods to serialize a layout and restore previously saved settings.
     *
     */
    public layout: {
      /**
       * READ ONLY. Chart interval.
       *
       * Note that internal interval format will differ from API parameters used in CIQ.ChartEngine#setPeriodicity and CIQ.ChartEngine#loadChart.
       *
       * Available options are:
       *  - [number] representing minutes
       *  - "day"
       *  - "week"
       *  - "month"
       *
       * See the [Periodicity and Quote feed]{@tutorial Periodicity} tutorial.
       */
      interval: string,
      /**
       * READ ONLY. Number of periods per interval/timeUnit
       *
       * See the [Periodicity and Quote feed]{@tutorial Periodicity} tutorial.
       */
      periodicity: number,
      /**
       * READ ONLY. Time unit for the interval.
       *
       * Note that internal timeUnit format will differ from API parameters used in CIQ.ChartEngine#setPeriodicity and CIQ.ChartEngine#loadChart.
       *
       * See the [Periodicity and Quote feed]{@tutorial Periodicity} tutorial.
       * Available options are:
       *  - "millisecond"
       *  - "second"
       *  - "minute"
       *  - null for "day", "week", "month" periodicity
       */
      timeUnit: string,
      /**
       * READ ONLY. Candle Width In pixels ( see {@tutorial Understanding Chart Range} and CIQ.ChartEngine#candleWidthPercent)
       */
      candleWidth: number,
      /**
       * READ ONLY. The primary y-axis and all linked drawings, series and studies will display inverted (flipped) from its previous state when 'true'.
       *
       * Use CIQ.ChartEngine#flipChart to set.
       */
      flipped: boolean,
      /**
       * Whether adjusted or nominal prices are being displayed.
       * If true then the chart will look for "Adj_Close" in the masterData as an alternative to "Close".
       * @instance
       */
      adj: boolean,
      /**
       * Set to `true` to enable crosshairs in the active layout.
       *
       * Also see CIQ.ChartEngine#doDisplayCrosshairs for more details on crosshairs behavior.
       *
       * @example
       * // enable crosshair (usually called from a UI button/toggle)
       * stx.layout.crosshair=true;
       * // add this if you want the crosshair to display right away instead of when the user starts moving the mouse over the chart
       * stx.doDisplayCrosshairs();
       * // add this if you want to trigger a layout change event; maybe to save the layout.
       * stx.dispatch("layout", {stx:stx, symbol: stx.chart.symbol, symbolObject:stx.chart.symbolObject, layout:stx.layout, drawings:stx.drawingObjects});
       *
       * @instance
       */
      crosshair: boolean,
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
       *  - "hlc_box" — Requires *js/extras/hlcbox.js*.
       *  - "hlc_shaded_box" — Requires *js/extras/hlcbox.js*.
       *  - "wave"
       *  - "scatterplot"
       *  - "histogram"
       *  - "rangechannel"
       *  - "marketdepth" — Requires the [Active Trader]CIQ.MarketDepth plug-in. See CIQ.ChartEngine#updateCurrentMarketData for data requirements.
       *  - "crosssection" — Requires the [Cross Section]CIQ.CrossSection plug-in.
       *
       * Variations of these types are available by prepending terms to the options as follows:
       *  - "step_" - add to mountain, marketdepth e.g. step_mountain, step_volume_marketdepth
       *  - "vertex_" - add to line, step, mountain, baseline_delta
       *  - "hollow_" - add to candle
       *  - "volume_" - add to candle, marketdepth e.g. mountain_volume_marketdepth (Adding volume to marketdepth also creates a volume histogram in the same panel)
       *  - "colored_" - add to line, mountain, step, bar, hlc
       *  - "mountain_" - add to baseline_delta, marketdepth e.g. mountain_volume_marketdepth
       *
       * Other options are available provided a renderer is created with a `requestNew` function which will support the option, see CIQ.Renderer.Lines#requestNew and CIQ.Renderer.OHLC#requestNew
       *
       * Use CIQ.ChartEngine#setChartType to set this value.
       *
       * See {@tutorial Chart Styles and Types} for more details.
       *
       * @since
       * - 05-2016-10.1 Added "baseline_delta_mountain" and "colored_mountain".
       * - 3.0.0 Added "histogram" and "step".
       * - 3.0.7 Added "hlc".
       * - 4.0.0 Added "colored_step" and "colored_hlc".
       * - 5.1.0 More chart types available using combinations of terms.
       * - 6.1.0 Added "marketdepth".
       * - 7.3.0 Added "termstructure".
       * - 8.3.0 Added "crosssection". Removed "termstructure".
       */
      chartType: string,
      /**
       * READ ONLY. Flag for extended hours time-frames.
       *
       * The chart includes the 'extended' parameter in the `params` object sent into the `fetch()` call.
       * Your quote feed must be able to provide extended hours data when requested (`extended:true`) for any extended hours functionality to work.
       *
       * See CIQ.ExtendedHours and CIQ.Market for more details on how extended hours are set and used.
       */
      extended: boolean,
      /**
       * READ ONLY. Tracks the extended market sessions to display on the chart.
       *
       * See CIQ.ExtendedHours and CIQ.Market for more details on how extended hours are set and used.
       * @example
       * marketSessions = {
       *      "session1": true,
       *      "session2": true,
       *      "session3": false,
       *      "pre": true,
       *      "post": true
       * }
       * @since 06-2016-02
       */
      marketSessions: object,
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
       * Use CIQ.ChartEngine#setAggregationType to set this value.
       *
       * See {@tutorial Chart Styles and Types} for more details.
       */
      aggregationType: string,
      /**
       * READ ONLY. Active scale for the chart.
       *
       * See CIQ.ChartEngine#setChartScale
       *
       * **Replaces CIQ.ChartEngine.layout.semiLog**
       *
       */
      chartScale: string,
      /**
       * READ ONLY. List of [study descriptors]CIQ.Studies.StudyDescriptor for the active studies on the chart.
       *
       * **Please note:** To facilitate study name translations, study names use zero-width non-joiner (unprintable) characters to delimit the general study name from the specific study parameters.
       * Example: "\u200c"+"Aroon"+"\u200c"+" (14)".
       * At translation time, the library will split the text into pieces using the ZWNJ characters, parentheses and commas to just translate the required part of a study name.
       * For more information on ZWNJ characters see: [Zero-width_non-joiner](https://en.wikipedia.org/wiki/Zero-width_non-joiner).
       * Please be aware of these ZWNJ characters, which will now be present in all study names and corresponding panel names; including the `layout.studies` study keys.
       * Affected fields in the study descriptors could be `id	`, `display`, `name` and `panel`.
       * To prevent issues, always use the names returned in the **study descriptor**. This will ensure compatibility between versions.
       * >Example:
       * >Correct reference:
       * >	`stxx.layout.studies["\u200c"+"Aroon"+"\u200c"+" (14)"];`
       * >Incorrect reference:
       * >	`stxx.layout.studies["Aroon (14)"];`
       *
       * See CIQ.Studies.addStudy for more details
       *
       */
      studies: object,
      /**
       * READ ONLY. List of active chart panels. Usually correspond to a study or series.
       *
       * **Please note:** To facilitate study name translations, study names and their corresponding panels use zero-width non-joiner (unprintable) characters to delimit the general study name from the specific study parameters.
       * Example: "\u200c"+"Aroon"+"\u200c"+" (14)".
       * At translation time, the library will split the text into pieces using the ZWNJ characters, parentheses and commas to just translate the required part of a study name.
       * For more information on ZWNJ characters see: [Zero-width_non-joiner](https://en.wikipedia.org/wiki/Zero-width_non-joiner).
       * Please be aware of these ZWNJ characters, which will now be present in all study names and corresponding panel names; including the `layout.panels` study keys.
       * To prevent issues, always use the names returned in the **study descriptor**. This will ensure compatibility between versions.
       * >Example:
       * >Correct reference:
       * >	`stxx.layout.panels["\u200c"+"Aroon"+"\u200c"+" (14)"];`
       * >Incorrect reference:
       * >	`stxx.layout.panels["Aroon(14)"];`
       *
       * See CIQ.Studies.addStudy for more details
       *
       */
      panels: object,
      /**
       * READ ONLY. Specifies whether outlier detection is enabled. A value of true enables
       * detection; false disables detection.
       *
       * See CIQ.Outliers for information on how outlier detection is used.
       *
       * @since 7.5.0
       */
      outliers: boolean
    }
    /**
     * Contains the chart preferences.
     *
     * Preferences parameters, unless otherwise indicated, can be set at any time and only require a [draw()]CIQ.ChartEngine#draw call to activate.
     *
     * See [importPreferences]CIQ.ChartEngine#importPreferences and [exportPreferences]CIQ.ChartEngine#exportPreferences for methods to serialize and restore previously saved preferences.
     *
     */
    public preferences: {
      /**
       * Draw a horizontal line at the current price.
       * Only drawn if the most recent tick is visible.
       *
       * See CIQ.ChartEngine#drawCurrentHR
       *
       * @since 05-2016-10
       */
      currentPriceLine: boolean,
      /**
       * Disables dragging a plot between panels or a y-axis within a panel.
       * Separate switches are provided for dragging studies, series, or axes.
       * Alternatively, all dragging may be disabled by setting `dragging: false`.
       *
       * To also disable the highlight when hovering over the Y axis, add the following:
       *  ```
       *  CIQ.ChartEngine.YAxis.prototype.setBackground = function() {}
       *  ```
       *
       * To also disable the highlight when hovering over the Y axis, add the following:
       *  ```
       *  CIQ.ChartEngine.YAxis.prototype.setBackground = function() {}
       *  ```
       *
       * @since 7.1.0
       * @example
       * stxx.preferences.dragging.study=false;
       * @example
       * stxx.preferences.dragging=false;
       */
      dragging: {
      			series: true,
      			study: true,
      			yaxis: true
      		}|boolean,
      /**
       * When using drawing tools, this will become an object when user saves the drawing parameters.
       * A sub-object is created for each drawing tool.
       * These preferences are used whenever the user selects that drawing object, and overrides the default stxx.currentVectorParameters.
       * Use CIQ.Drawing.saveConfig to save the parameters to this object.
       * @since 6.0.0
       */
      drawings: object,
      /**
       * Pixel radius for the invisible intersection box around the cursor used to determine if it has intersected with an element to be highlighted.
       * This value is used primarily for non-touch cursor events (mouse, touchpad).  Used on items removed with a right click such as series and drawings.
       *
       * Only applicable if the user has **not** tapped on the screen to set the location of the cross-hair.
       *
       * @since 3.0.0
       */
      highlightsRadius: number,
      /**
       * For touch events on the chart canvas.  Pixel radius for the invisible intersection box around the cursor used to determine if it has intersected
       * with an element to be highlighted. The larger highlight radius is more suitable for the less precise input from touch events.  Used on
       * items removed with a right click such as series and drawings.
       *
       * **Only applicable for touch events while the cursor is not controlling the crosshair tool. Otherwise, highlightsRadius is used.**
       *
       * @since 3.0.0
       */
      highlightsTapRadius: number,
      /**
       * Magnetizes the crosshairs to data points during drawing operations to improve initial placement accuracy.
       *
       * - When `true`, the magnet is considered "strong" and will always magnetize.
       * - When a number, it is considered "weak" and will only magnetize within the area of defined. The radius of the circle is the number you set.
       *
       * **We recommend 75 as the value for the parameter when the `number` type is used.**
       *
       * It will not be used when an existing drawing is being repositioned.
       *
       * See CIQ.ChartEngine#magnetize for more details.
       *
       * @since 7.2.0 Magnets can now be applied to any series or study.
       */
      magnet: boolean | number,
      /**
       * Locks the crosshair y-coordinate to the value of the field name specified for the tick under the cursor on the primary chart.
       *
       * For studies, create a `horizontalCrosshairFieldFN` function that will be called by `CIQ.Studies.addStudy`.
       * The function must return the field name in the data set to reference. The function will not be called when the study is set to
       * overlay or underlay the chart's panel.
       *
       * @example
       * // Have the crosshairs lock to the "Close" field of the tick under the cursor.
       * stxx.preferences.horizontalCrosshairField = "Close";
       *
       * @example
       * // Have the crosshair slock to the "ATR ATR (14)" field for a ATR study with a period of 14.
       * CIQ.Studies.studyLibrary["ATR"].horizontalCrosshairFieldFN = function(stx, sd) {
       * 	// Returns the field name, which should be created by the study's "calculateFN".
       * 	return "ATR " + sd.name;
       * };
       *
       * @since 04-2016-08
       */
      horizontalCrosshairField: string,
      /**
       * Set to true to display labels on y-axis for line based studies using CIQ.Studies.displayIndividualSeriesAsLine or CIQ.Studies.displaySeriesAsLine (this is overridden by the particular y-axis setting of CIQ.ChartEngine.YAxis#drawPriceLabels).
       * This flag is checked inside these 2 functions to decide if a label should be set, as such if you do not wish to have a label on a particular study line, you can set this flag to `false`, before calling the function, and then back to `true`.
       * @example
       * //do not display the price labels for this study
       * stxx.preferences.labels=false;
       * CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);
       *
       * //restore price labels to default value
       * stxx.preferences.labels=true;
       */
      labels: boolean,
      /**
       * Stores preferred language for the chart.
       *
       * It can be individually restored using CIQ.I18N.setLanguage and activated by CIQ.I18N.translateUI
       * @since 4.0.0
       */
      language: string,
      /**
       * Stores the preferred timezone for the display of the x axis labels.
       *
       * It is automatically set and can be individually restored by CIQ.ChartEngine#setTimeZone.
       * @since 4.0.0
       */
      timeZone: string,
      /**
       * Initial whitespace on right of the screen in pixels.
       * @example
       * // override the default value at declaration time
       * var stxx=new CIQ.ChartEngine({container:document.querySelector(".chartContainer"), preferences:{"whitespace": 20}});
       */
      whitespace: number,
      /**
       * zoom-in speed for mousewheel and zoom button.
       *
       * Range: **0 -.99999**. The closer to 1 the slower the zoom.
       * @example
       * stxx.preferences.zoomInSpeed=.91;
       * @example
       * var stxx=new CIQ.ChartEngine({container:document.querySelector(".chartContainer"), preferences:{"zoomInSpeed": .98}});
       * @since 07/01/2015
       */
      zoomInSpeed: number,
      /**
       * zoom-out speed for mousewheel and zoom button.
       *
       * Range: **1-2**. The closer to 1 the slower the zoom.
       * @example
       * stxx.preferences.zoomOutSpeed=1.1;
       * @example
       * var stxx=new CIQ.ChartEngine({container:document.querySelector(".chartContainer"), preferences:{"zoomOutSpeed": 1}});
       * @since 07/01/2015
       */
      zoomOutSpeed: number,
      /**
       * If set to 'true', the mouse wheel zooming is centered by the mouse position.
       *
       * @since 4.0.0
       */
      zoomAtCurrentMousePosition: boolean
    }
    /**
     * Used to control the behavior and throttling of real time updates in [updateChartData()]CIQ.ChartEngine#updateChartData to prevent overloading the chart engine
     * @example
     * // this will cause updates to be applied to the dataSegment immediately
     * stxx.streamParameters.maxTicks=0;
     *
     * // here is how you would override all options
     * stxx.streamParameters= {"maxWait":1000,"maxTicks":100}
     */
    public streamParameters: {
      /**
       * ms to wait before allowing update to occur (if this condition is met, the update will occur and all pending ticks will be loaded - exclusive of maxTicks)
       * @example
       * // update without any time interval delay.
       * stxx.streamParameters.maxWait=0;
       */
      maxWait: number,
      /**
       * ticks to wait before allowing update to occur (if this condition is met, the update will occur and all pending ticks will be loaded - exclusive of maxWait)
       * @example
       * // update with every new tick added.
       * stxx.streamParameters.maxTicks=0;
       */
      maxTicks: number
    }
    /**
     * Allow the candle width to be determined dynamically when using CIQ.ChartEngine#setRange.
     * This will require a valid CIQ.ChartEngine#dynamicRangePeriodicityMap
     * @example
     * autoPickCandleWidth:{
     *     turnOn: true,
     *     candleWidth: 5
     * }
     * @since m-2016-12-01
     */
    public autoPickCandleWidth: {
      /**
       * Turn to 'true' if you want the periodicity to be determined dynamically when using CIQ.ChartEngine#setRange.
       * This will require a valid CIQ.ChartEngine#dynamicRangePeriodicityMap
       */
      turnOn: boolean,
      /**
       * Set if you want to set a specific candle width when using CIQ.ChartEngine#setRange.
       * This will require a valid CIQ.ChartEngine#dynamicRangePeriodicityMap.
       * Set to '0' if you want the candle width to be determined according to chart type
       */
      candleWidth: number
    }
    /**
     * Returns the chart to the home position, where the most recent tick is on the right side of the screen.
     *
     * By default the home() behavior is to maintain the white space currently on the right side of the chart.
     * To align the chart to the right edge instead, set the white space to 0  by calling: `stxx.home({whitespace:0});` or `stxx.home({maintainWhitespace:false});`
     *
     * If you want to home the chart and also do a full reset of both the x and y axis zoom levels so they revert to the initial default settings, execute this:
     * ```
     * stxx.setCandleWidth(8);stxx.home(0);
     * ```
     *
     * Keep in mind that certain floating labels, such as the `roundRectArrow` will prevent the chart from being flush to the right edge even if the white space is 0.
     * This is to prevent bars from being obstructed by the protruding portion of the label.
     *
     * See CIQ.ChartEngine#getLabelOffsetInPixels and CIQ.ChartEngine#yaxisLabelStyle for more details.
     *
     * Used by <a href="CIQ.ChartEngine.html#htmlControls%5B%60home%60%5D">CIQ.ChartEngine.htmlControls.home.</a>
     *
     * @param params Object containing the following keys:
     * @param [params.animate = false] Set to true to animate a smooth scroll to the home position.
     * @param [params.maintainWhitespace = true] Set to `true` to maintain the currently visible white space on the right of the chart, or to `false` to align to the right edge.
     * @param [params.whitespace = 0] Override to force a specific amount of whitespace on the right of the chart.
     *		This will take precedence over `params.maintainWhitespace`
     * @param [params.chart] Chart to scroll home. If not defined, all chart objects will be returned to the home position.
     * @example
     * stxx.home({maintainWhitespace:false});
     */
    public home(
      params: {
        animate?: boolean,
        maintainWhitespace?: boolean,
        whitespace?: number,
        chart?: CIQ.ChartEngine.Chart
      }
    ): void
    /**
     * INJECTABLE
     *
     * This method calls CIQ.ChartEngine#updateFloatHRLabel to draw the label that floats along the Y axis with the
     * current price for the crosshair.
     * It also fills the date in the "stxx.controls.floatDate" (Style: `stx-float-date`) div which floats along the X axis.
     * This is an appropriate place to inject an append method for drawing a heads up display if desired.
     *
     * You can use CIQ.ChartEngine.XAxis#noDraw and CIQ.ChartEngine.YAxis#noDraw to hide the floating labels and axis.
     *
     * It uses CIQ.displayableDate to format the floating label over the x axis, which can be overwritten as needed to achieve the desired results.
     *
     * @since 09-2016-19 Only year and month will be displayed in monthly periodicity.
     */
    public headsUpHR(): void
    /**
     * Sets the chart into a modal mode. Crosshairs are hidden and the chart will not respond to click or mouse events. Call this
     * for instance if you are enabling a dialog box and don't want errant mouse activity to affect the chart.
     */
    public modalBegin(): void
    /**
     * Ends modal mode. See CIQ.ChartEngine#modalBegin
     */
    public modalEnd(): void
    /**
     * INJECTABLE
     *
     * Updates the position of the stxx.controls.floatDate element ( Style: `stx-float-date` ) and calls CIQ.ChartEngine#headsUpHR to display the crosshairs labels on both x and y axis.
     * A timer is used to prevent this operation from being called more frequently than once every 100 milliseconds in order to
     * improve performance during scrolling.
     */
    public updateChartAccessories(): void
    /**
     * Positions a "sticky" (a tooltip element). It is positioned relative to the cursor but so that it is always available and never
     * accidentally tappable on a touch device.
     * @param  m The sticky
     */
    public positionSticky(m: HTMLElement): void
    /**
     * Displays the "sticky" (tooltip element). The sticky should be in `CIQ.ChartEngine.controls.mSticky`.
     *
     * To disable stickies, set that element to null. See CIQ.ChartEngine.htmlControls.
     *
     * To customize, see the [Using and Customizing Drawing Tools](tutorial-Using%20and%20Customizing%20Drawing%20Tools.html#customSticky) tutorial.
     *
     * @param  params Optional arguments to pass into the function.
     * @param  [params.message] The message to display in the sticky.
     * @param  [params.backgroundColor] The background color for the sticky (the foreground color is selected automatically).
     * @param  [params.forceShow] If true, always shows the sticky (as opposed to only on hover).
     * @param  [params.noDelete] If true, hides the delete instructions/button.
     * @param  [params.noEdit] If true, hides the edit instructions/button.
     * @param  [params.type] Set to "study","drawing","series", or whatever causes the sticky to be displayed.
     * @param  [params.positioner] Sets custom positioning behavior for the sticky. Called with `Function.prototype.call()`,
     * 		specifying the engine instance as context. Called with one argument, which is a reference to the sticky element.
     * @since
     * - 6.0.0 Consolidated arguments into the `params` object.
     * - 6.3.0 Added the `noEdit` parameter.
     * - 7.4.0 Added the `positioner` parameter.
     */
    public displaySticky(
      params: {
        message?: string,
        backgroundColor?: string,
        forceShow?: boolean,
        noDelete?: boolean,
        noEdit?: boolean,
        type?: string,
        positioner?: Function
      }
    ): void
    /**
     * Adds a message to the chart.
     *
     * Creates a `div` containing a text message. Appends the `div` to the
     * <a href="CIQ.ChartEngine.html#htmlControls%5B%60notificationTray%60%5D">
     * CIQ.ChartEngine.htmlControls.notificationTray</a>.
     *
     * Notifications can be interactive (see the `callback` and `dismissalListeners` parameters),
     * and they can be queried by their names, which are set as class names on the
     * notification `div`.
     *
     * @param name The name of the notification, which is added to the class list of the
     * 		notification `div`.
     * @param message Text to display in the notification `div`.
     * @param [params] Configuration parameters.
     * @param [params.callback] Added to the notification `div` as a listener for the
     * 		"pointer up" event.
     * @param [params.dismissalListeners] Array of event listeners added to the
     * 		notification.
     * @param params.dismissalListeners.type The listener event type. See
     * 		CIQ.ChartEngine#addEventListener.
     * @param params.dismissalListeners.callback The listener callback function.
     *
     * @since 8.0.0
     */
    public displayNotification(
      name: string,
      message: string,
      params?: {
        callback?: Function,
        dismissalListeners?: {
          type: string,
          callback: Function
        }
      }
    ): void
    /**
     * Removes a notification from the
     * <a href="CIQ.ChartEngine.html#htmlControls%5B%60notificationTray%60%5D">
     * CIQ.ChartEngine.htmlControls.notificationTray</a>.
     *
     * @param name The name of the notification that is removed.
     *
     * @since 8.0.0
     */
    public removeNotification(name: string): void
    /**
     * INJECTABLE
     *
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
     * @param price1 Beginning price of the drawing
     * @param price2 Ending price of the drawing, pass <code>false</code> if you want to skip price and percentage display
     * @param tick1  Beginning tick of the drawing
     * @param tick2  Ending tick of the drawing, pass <code>false</code> if you want to skip tick count display
     * @param hover  True to turn on the measurement, false to turn it off
     * @param [name]  Name of drawing, not used by default but passed into injection
     * @since
     * - 4.0.0 Added name argument.
     * - 6.0.0 Allow price2 and tick2 to be false, skipping the respective display.
     * @example
     * // Measuring tool styling CSS sample
     * .currentMeasure {
     *     text-align: left;
     *     display: inline-block;
     *     margin: 4px 0 0 20px;
     *     height: 20px;
     *     line-height: 20px;
     * }
     * .mMeasure {
     *     display: inline-block;
     *     margin: 0 0 0 0;
     *     overflow: hidden;
     *     text-overflow: ellipsis;
     *     white-space: nowrap;
     *     width:140px;
     * }
     * @example
     * // This is an example of the framework to use for writing a prepend to further manipulate/display the measurements
     * CIQ.ChartEngine.prototype.prepend("setMeasure",function() {
     *
     *     var m = document.querySelector(".mMeasure");
     *
     *     if (!m) return; // Can't show a measurement if the div is not present.
     *
     *     // Add your logic to manage the display of the measurements (price1, price2, tick1, tick2).
     *     //*****************************************
     *     var message = 'blah measurement';
     *     //*****************************************
     *
     *     m.innerHTML = message;
     *
     *     if (this.activeDrawing) return;  // Don't show measurement Sticky when in the process of drawing.
     *
     *     m = this.controls.mSticky;
     *     if (m) {
     *         var mStickyInterior = m.querySelector(".mStickyInterior");
     *         if (hover) {
     *             m.style.display = "inline-block";
     *             mStickyInterior.style.display = "inline-block";
     *             if(price1) {
     *                 mStickyInterior.innerHTML = message;
     *             }
     *             this.positionSticky(m);
     *         } else {
     *             m.style.display = "none";
     *             mStickyInterior.innerHTML = "";
     *         }
     *     }
     *
     *  //return true; // If you don't want to continue into the regular function.
     *  //return false; // If you want to run through the standard function once you are done with your custom code.
     * });
     */
    public setMeasure(
      price1: number,
      price2: number|boolean,
      tick1: number,
      tick2: number|boolean,
      hover: boolean,
      name?: string
    ): void
    /**
     * Clears the innerHTML value of the `.mMeasure` HTML DOM Node.
     */
    public clearMeasure(): void
    /**
     * Effects a zoom from either zoomIn() or zoomOut(). Called from an EaseMachine
     * @param  candleWidth  The new candleWidth
     * @param  chart        The chart to center
     * @since
     * - 4.0.0 Will maintain tick position near the cursor if <a href="CIQ.ChartEngine.html#preferences%5B%60zoomAtCurrentMousePosition%60%5D">CIQ.ChartEngine.preferences.zoomAtCurrentMousePosition</a> is `true`.
     * - 4.1.0 Will keep left edge stable and zoom to the right when white space is present on the left.
     */
    public zoomSet(candleWidth: number, chart: CIQ.ChartEngine.Chart): void
    /**
     * A reference to the renderer of the baseline whose handle is currently selected.
     *
     * The baseline handle can be accessed from CIQ.ChartEngine#baselineHelper.
     *
     * @since 8.2.0
     */
    public currentBaseline: CIQ.Renderer
    /**
     * Baseline helper for the chart engine.
     *
     * Maps renderers to value objects that contain data related to the baseline, including the
     * baseline handle (a reference to the DOM element that functions as the handle).
     *
     * @since 8.2.0
     */
    public baselineHelper: Map<CIQ.Renderer, object>
    /**
     * Adds an entry to CIQ.ChartEngine#baselineHelper with `renderer` as the key and a
     * dynamically created object as the value. The value object contains data related to the
     * baseline.
     *
     * If the renderer is the renderer of the main series, sets the handle property of the value
     * object to <code>CIQ.ChartEngine.htmlControls[&#96;baselineHandle&#96;]</code>; otherwise,
     * creates a baseline handle DOM element and adds a reference to the DOM element to the value
     * object and to the chart controls object, CIQ.ChartEngine.htmlControls. The handle is
     * accessed in the chart controls object by a property name that is the concatenation of the
     * renderer name and "cq-baseline-handle", for example:
     * ```
     * stxx.controls[`${renderer.params.name} cq-baseline-handle`];
     * ```
     *
     * @param renderer The renderer to register as the key of the baseline helper.
     *
     * @since 8.2.0
     */
    public registerBaselineToHelper(renderer: CIQ.Renderer): void
    /**
     * Removes a renderer from CIQ.ChartEngine#baselineHelper.
     *
     * If the renderer is not the renderer of the main series, removes the baseline handle associated
     * with the renderer from the chart controls object, CIQ.ChartEngine.htmlControls (see
     * also CIQ.ChartEngine#registerBaselineToHelper).
     *
     * @param renderer The renderer to remove from the baseline helper.
     *
     * @since 8.2.0
     */
    public removeBaselineFromHelper(renderer: CIQ.Renderer): void
    /**
     * Checks an emitted event to determine whether a baseline handle DOM element is the event target
     * or is in the
     * <a href="https://developer.mozilla.org/en-US/docs/Web/API/Event/composedPath" target="_blank">
     * composed path</a> of the event. If so, sets CIQ.ChartEngine#currentBaseline to the
     * renderer of the baseline positioned by the handle.
     *
     * @param e The event that is checked to determine whether a baseline handle is the event
     * 		target or is in the propagation path of the event.
     * @param grabStart If true (and a baseline handle is the event target or is in the
     * 		event path), baseline repositioning is initiated.
     * @return True if a baseline handle is the event target or is in the path of the event,
     * 		otherwise false.
     *
     * @since 8.2.0
     */
    public findBaselineHandle(e: Event, grabStart: boolean): boolean
    /**
     * Sets `baseline.actualLevel` for any line renderers that are attached to the chart. (See the
     * `baseline` parameter of CIQ.Renderer.Lines, which may be type
     * CIQ.ChartEngine.Chart#baseline.)
     *
     * **Note:** Does not set <a href="CIQ.ChartEngine.Chart.html#baseline%5B%60actualLevel%60%5D">
     * CIQ.ChartEngine.Chart#baseline[&#96;actualLevel&#96;]</a>; that is done in
     * CIQ.ChartEngine#createDataSegment.
     *
     * @param chart Chart for which the renderer baseline levels are set.
     * @since 8.1.0
     */
    public setBaselines(chart: CIQ.ChartEngine.Chart): void
    /**
     * Positions a baseline handle within the chart area.
     *
     * @param renderer The renderer that renders the baseline.
     *
     * @since 8.2.0
     */
    public positionBaselineHandle(renderer: CIQ.Renderer): void
    /**
     * Gets the baseline renderer associated with a y-axis.
     *
     * Since a y-axis can only have one baseline associated with it, this function searches the
     * renderers property of the axis, checking for the first renderer that matches an entry in
     * CIQ.ChartEngine#baselineHelper.
     *
     * @param yAxis The y-axis whose list of renderers is checked for a
     * 		baseline renderer.
     * @return The y-axis renderer that renders a baseline or, if a baseline
     * 		renderer is not associated with the y-axis, null.
     *
     * @since 8.2.0
     */
    public getYAxisBaselineRenderer(yAxis: CIQ.ChartEngine.YAxis): CIQ.Renderer|null
    /**
     * Gets the baseline object for a y-axis associated with a baseline.
     *
     * A y-axis can be associated with only one baseline; and so, can have only one baseline renderer
     * and one baseline object.
     *
     * @param yAxis A y-axis associated with a baseline.
     * @returns The baseline object of the y-axis baseline renderer if the y-axis has a
     * 		baseline renderer and the baseline parameter of the renderer is an object; otherwise,
     * 		the default chart baseline object, CIQ.ChartEngine.Chart#baseline.
     *
     * @since 8.2.0
     *
     * @see CIQ.ChartEngine#getYAxisBaselineRenderer
     */
    public getYAxisBaseline(yAxis: CIQ.ChartEngine.YAxis): object
    /**
     * Returns the absolute screen position given a Y pixel on the canvas
     * @param  y Y pixel on the canvas
     * @return	  Absolute Y screen position
     */
    public resolveY(y: number): number
    /**
     * Returns the absolute screen position given a X pixel on the canvas
     * @param  x X pixel on the canvas
     * @return	  Absolute X screen position
     */
    public resolveX(x: number): number
    /**
     * Returns the relative canvas position given an absolute Y position on the screen
     * @param  y Y pixel on the screen
     * @return	  Relative Y position on canvas
     */
    public backOutY(y: number): number
    /**
     * Returns the relative canvas position given an absolute X position on the screen
     * @param  x X pixel on the screen
     * @return	  Relative X position on canvas
     */
    public backOutX(x: number): number
    /**
     * Returns a date (in yyyymmddhhmm form) given a tick (location in the dataSet).
     * If the tick lies outside of the dataSet then the date will be arrived at algorithmically by calculating into the past or future.
     * @param  tick  Location in the dataSet
     * @param  [chart] A chart object
     * @param  [nativeDate] True to return as date object otherwise returns in yyyymmddhhmm form
     * @param  [tickSource] Tick array to search. Defaults to `dataSet`
     * @return		  The date form dictated by native param
     */
    public dateFromTick(
      tick: number,
      chart?: CIQ.ChartEngine.Chart,
      nativeDate?: boolean,
      tickSource?: string
    ): (string|Date)
    /**
     * Returns the tick (position in dataSet) given the requested date.
     *
     * The date does not need to match exactly. If the date lies between ticks then the earlier will be returned by default.
     *
     * @param  dt	  Date object or date in string format
     * @param  [chart] Chart object
     * @param  [adj] Timezone adjustment in minutes to apply to date before getting tick
     * @param  [forward] Switch to return the next tick as opposed to the previous, in case an exact match is not found
     * @param  [tickSource] Tick array to search. Defaults to `dataSet`
     * @return		  The tick location
     */
    public tickFromDate(
      dt: Date|string,
      chart?: CIQ.ChartEngine.Chart,
      adj?: number,
      forward?: boolean,
      tickSource?: string
    ): number
    /**
     * Returns the X pixel given the location of a bar (`dataSegment`) on the chart.
     *
     * @param bar The bar for which the X pixel is returned (position on the chart, which is
     * 		also the position in the `dataSegment`).
     * @param [chart] The chart that contains the bar. Defaults to
     * 		`this.chart`.
     * @return The X pixel on the chart.
     *
     */
    public pixelFromBar(bar: number, chart?: CIQ.ChartEngine.Chart): number
    /**
     * Returns the position (array index) of the first **dataSegment** element encountered given the X pixel.
     * Do not reference this into dataSegment without checking bounds, because the return value may be negative or greater than the dataSegment array length.
     *
     * See CIQ.ChartEngine#tickFromPixel if you wish to locate the dataSet position.
     *
     * @param  x An X pixel location on the chart
     * @param [chart] Which chart to use. Defaults to this.chart.
     * @return	  The bar that lies on the X pixel (may be negative/before or after the chart)
     */
    public barFromPixel(x: number, chart?: CIQ.ChartEngine.Chart): number
    /**
     * Returns the position (array index) of the first data set element (tick) that is plotted at a
     * pixel's x-coordinate.
     *
     * @param x X-coordinate of the pixel where the tick is represented on the chart.
     * @param [chart=this.chart] The chart object that contains the data set.
     * @return The tick (position in the data set) that is plotted at the x-coordinate of
     * 		the pixel.
     *
     *
     * @see CIQ.ChartEngine#barFromPixel to locate the data segment position
     */
    public tickFromPixel(x: number, chart?: CIQ.ChartEngine.Chart): number
    /**
     * Returns the x-coordinate (in pixels) at the location where a given tick is plotted. The
     * x-coordinate is the center of the tick location.
     *
     * **Note:** The pixel x-coordinate can be off the visual canvas, and it can overlap the y-axis.
     *
     * @param tick A position in the data set array (tick).
     * @param [chart=this.chart] The chart object that contains the data set.
     * @return The x-coordinate in pixels of the plotted tick (can be negative or can be
     * 		greater than `dataSet.length`).
     *
     */
    public pixelFromTick(tick: number, chart?: CIQ.ChartEngine.Chart): number
    /**
     * Returns the X pixel position for a tick of a given date.
     *
     * The date does not need to match exactly. If the date lies between ticks then the earlier will be returned.
     *
     * **Warning: this can be an expensive operation if the date is not in the dataSet.**
     *
     * @param  date  Date object or String form date
     * @param  chart The chart to look in
     * @param  [adj] Timezone adjustment in minutes to apply to date before getting tick
     * @param  [forward] Switch to return the next tick as opposed to the previous, in case an exact match is not found
     * @return		  The pixel location for the date
     * @since added adj and forward arguments
     */
    public pixelFromDate(
      date: Date|string,
      chart: CIQ.ChartEngine.Chart,
      adj?: number,
      forward?: boolean
    ): number
    /**
     * A version of CIQ.ChartEngine#priceFromPixel that will return the y-axis value given a Y pixel
     * @param  y	  The Y pixel location
     * @param  [panel] The panel (defaults to the chart)
     * @param [yAxis] The yAxis to use
     * @return		  The Y axis value
     * @since 4.0.0
     */
    public transformedPriceFromPixel(
      y: number,
      panel?: CIQ.ChartEngine.Panel,
      yAxis?: CIQ.ChartEngine.YAxis
    ): number
    /**
     * Returns the actual value of the chart given a pixel regardless of any transformation such as a comparison chart.
     * @param  y	  The Y pixel location
     * @param  [panel] The panel to look. Defaults to the chart itself if not passed in.
     * @param [yAxis] The yAxis to use. Defaults to panel.yAxis.
     * @return		  The Y location. This may be off of the visible canvas.
     */
    public priceFromPixel(
      y: number,
      panel?: CIQ.ChartEngine.Panel,
      yAxis?: CIQ.ChartEngine.YAxis
    ): number
    /**
     * Returns the value (price) given a Y-axis pixel. The value is relative to the panel or the canvas.
     * @param  y	  The y pixel position
     * @param  [panel] A panel object. If passed then the value will be relative to that panel. If not passed then the value will be relative to the panel that is in the actual Y location.
     * @param  [yAxis] Which yAxis. Defaults to panel.yAxis.
     * @return		  The value relative to the panel
     */
    public valueFromPixel(
      y: number,
      panel?: CIQ.ChartEngine.Panel,
      yAxis?: CIQ.ChartEngine.YAxis
    ): number
    /**
     * Calculates the value (price) of a field in a dataSegment record based on linear interpolation of its neighboring records. Whether the chart is in linear or logarithmic scale is taken into the equation.
     * @param bar	The bar position in the dataSegment
     * @param fieldName	The field to search for in the dataSegment
     * @param [subField]	The field to search for in a series within the dataSegment. Defaults to chart.defaultPlotField.
     * @param	[panel]	The panel to look. Defaults to the chart.panel.
     * @param	[yAxis]	The yAxis to use. Defaults to panel.yAxis.
     * @return	The value or price;
     * @since 6.2.5
     */
    public valueFromInterpolation(
      bar: number,
      fieldName: String,
      subField?: String,
      panel?: CIQ.ChartEngine.Panel,
      yAxis?: CIQ.ChartEngine.YAxis
    ): number
    /**
     * Returns the Y pixel from a transformed/displayed value (percentage comparison change, for example).
     *
     * To get the location of an untransformed price, use CIQ.ChartEngine#pixelFromPrice.
     * If no transformation is present, both this method and CIQ.ChartEngine#pixelFromPrice will return the same value.
     * @param  price The transformed price
     * @param  [panel] The panel (defaults to the chart)
     * @param [yAxis] The yAxis to use
     * @return		  The Y pixel value
     * @since 4.0.0
     */
    public pixelFromTransformedValue(
      price: number,
      panel?: CIQ.ChartEngine.Panel,
      yAxis?: CIQ.ChartEngine.YAxis
    ): number
    /**
     * Returns the Y pixel from a price, even if a transformation such as a percentage change comparison scale is active.
     *
     * To do this, the active transformation function will be applied to the provided price and then CIQ.ChartEngine#pixelFromTransformedValue will be called on the resulting value.
     * If no transformation is present, both this method and CIQ.ChartEngine#pixelFromTransformedValue will return the same value.
     * @param  price	  The price or value
     * @param  panel A panel object (see CIQ.ChartEngine#pixelFromPrice)
     * @param [yAxis] The yaxis to use
     * @return		  The y axis pixel location
     */
    public pixelFromPrice(
      price: number,
      panel: CIQ.ChartEngine.Panel,
      yAxis?: CIQ.ChartEngine.YAxis
    ): number
    /**
     * Returns the Y pixel location for the (split) unadjusted price rather than the displayed price.
     * This is important for drawing tools or any other device that requires the actual underlying price.
     *
     * @param  panel The panel to get the value from
     * @param  tick  The tick location (in the dataSet) to check for an adjusted value
     * @param  value The value
     * @param [yAxis] The yaxis to use
     * @return		  The pixel location
     */
    public pixelFromValueAdjusted(
      panel: CIQ.ChartEngine.Panel,
      tick: number,
      value: number,
      yAxis?: CIQ.ChartEngine.YAxis
    ): number
    /**
     * Returns the unadjusted value for a given value, if an adjustment (split) had been applied. This can return a value
     * relative to the original closing price.
     * @param  panel The panel to check
     * @param  tick  The location in the dataset
     * @param  value The value to adjust
     * @return		  The adjusted value
     */
    public adjustIfNecessary(panel: CIQ.ChartEngine.Panel, tick: number, value: number): number
    /**
     * INJECTABLE
     *
     * Positions the crosshairs at the last known mouse/finger pointer position, which ensures that
     * the crosshairs are at a known position on touch devices.
     *
     * Called by the WebComponents.cq-toolbar (drawing toolbar) web component.
     *
     */
    public positionCrosshairsAtPointer(): void
    /**
     * INJECTABLE
     *
     * Internal function that makes the crosshairs visible based on where the user's mouse pointer is
     * located. This function should not be called directly.
     *
     * Crosshairs are visible if enabled, unless a drawing tool is active, in which case they are
     * displayed automatically regardless of state.
     *
     * **Note:** The "no tool" option (
     * <a href="CIQ.ChartEngine.html#.currentVectorParameters%5B%60vectorType%60%5D">vectorType</a>
     * `""`) counts as a drawing tool and disables crosshairs. Set
     * <a href="CIQ.ChartEngine.html#.currentVectorParameters%5B%60vectorType%60%5D">vectorType</a> to
     * `null` to disable drawing mode and enable default crosshairs behavior.
     *
     * When the user's mouse moves out of the chart or over a modal, the crosshairs are
     * automatically made invisible using
     * CIQ.ChartEngine#undisplayCrosshairs.
     *
     * To temporarily show or hide enabled crosshairs, use CIQ.ChartEngine#showCrosshairs
     * and CIQ.ChartEngine#hideCrosshairs, respectively.
     *
     * **Note:** If the z-index of the crosshairs is set higher than the z-index of the subholder
     * element, the crosshairs cannot be controlled by the chart engine.
     *
     * @since
     * - 5.0.0 No longer allows the crosshairs to be enabled if the mouse pointer is outside the chart.
     * - 8.3.0 The
     * 		<a href="CIQ.ChartEngine.html#.currentVectorParameters%5B%60vectorType%60%5D">vectorType</a>
     * 		 `""` (no tool) disables crosshairs. To disable drawing mode, set
     * 		<a href="CIQ.ChartEngine.html#.currentVectorParameters%5B%60vectorType%60%5D">vectorType</a>
     * 		to `null`.
     */
    public doDisplayCrosshairs(): void
    /**
     * INJECTABLE
     *
     * Internal function that makes the crosshairs invisible when the user mouses out of the chart or
     * over a chart control. This function should not be called directly.
     *
     * See CIQ.ChartEngine#doDisplayCrosshairs for more details.
     *
     */
    public undisplayCrosshairs(): void
    /**
     * Hides enabled crosshairs.
     *
     * Usually called as part of a custom drawing or overlay to prevent the crosshairs from displaying
     * together with the custom rendering.
     *
     * See <a href="CIQ.ChartEngine.html#layout%5B%60crosshair%60%5D">CIQ.ChartEngine.layout[\`crosshair\`]</a>
     * to enable/disable the crosshairs.
     *
     */
    public hideCrosshairs(): void
    /**
     * Re-displays crosshairs hidden by CIQ.ChartEngine#hideCrosshairs.
     *
     */
    public showCrosshairs(): void
    /**
     * Loads a chart for a particular instrument from the data passed in, or fetches new data from the quotefeed; if one attached.
     *
     * Replaces CIQ.ChartEngine#newChart.
     *
     *  Note that before using this method, you must first instantiate the chart engine (once only) and assign it to a DOM container using [new CIQ.ChartEngine({container: document.querySelector(".chartContainer")});]CIQ.ChartEngine
     *  Once a chart engine is instantiated, this is the only method that should be called every time a new chart needs to be drawn for a different instrument.
     *  There is no need to destroy the chart, recreate the engine, or explicitly change the data using any other methods.
     *
     * Charts default to `1 day` periodicity **unless a different periodicity is set** in this call or by using CIQ.ChartEngine#setPeriodicity prior to this call. You data must always match the chart periodicity!!
     *
     * @param 	symbol	A symbol string, equation or object representing the primary instrument for the chart. **This is a mandatory field and must contain at least one character for the chart to display data, even is not using a primary instrument.**
     * 													After the chart is initialized with the new data, it will contain both a symbol string (stxx.chart.symbol) and a symbol object (stxx.chart.symbolObject).
     * 													You can send anything you want in the symbol object, but you must always include at least a 'symbol' element.
     * 													Both these variables will be available for use wherever the CIQ.ChartEngine.Chart object is present. For example, if using a quotefeed for gathering data, `params.stx.chart.symbolObject` will contain your symbol object.
     * 													To allow equations to be used on a chart, the CIQ.ChartEngine#allowEquations parameter must be set to `true` and the equation needs to be preceded by an equals sign (=) in order for it to be parsed as an equation.
     * 													See CIQ.formatEquation and CIQ.computeEquationChart for more details on allowed equations syntax.
     * @param 	[parameters] Data & configuration settings to initialize the chart.
     * 													The masterData array may be provided as the second argument assuming no other parameters need to be specified.
     * @param [parameters.masterData] An array of [properly formatted objects]{@tutorial InputDataFormat} to create a chart.
     * 													Each element should at a minimum contain a "Close" or "Value" field (capitalized) and a 'Date' or 'DT' field.
     *													If the charting engine has been configured to use a [QuoteFeed]CIQ.ChartEngine#attachQuoteFeed
     *													then masterData does not need to be passed in, and the quote feed will be used instead.
     * @param [parameters.chart] Which chart to load. Defaults to this.chart.
     * @param [parameters.range] Default range to be used upon initial rendering. If both `range` and `span` parameters are passed in, range takes precedence. If periodicity is not set, the range will be displayed at the most optimal periodicity. See CIQ.ChartEngine#setRange for complete list of parameters this object will accept.
     * @param [parameters.span] Default span to display upon initial rendering. If both `range` and `span` parameters are passed in, range takes precedence. If periodicity is not set, the span will be displayed at the most optimal periodicity. See CIQ.ChartEngine#setSpan for complete list of parameters this object will accept.
     * @param [parameters.periodicity] Periodicity to be used upon initial rendering. See CIQ.ChartEngine#setPeriodicity for complete list of parameters this object will accept. If no periodicity has been set, it will default to `1 day`.
     * @param [parameters.stretchToFillScreen] Increase the candleWidth to fill the left-side gap created by a small dataSet. Respects <a href="CIQ.ChartEngine.html#preferences%5B%60whitespace%60%5D">CIQ.ChartEngine.preferences.whitespace</a>. Ignored when params `span` or `range` are used.  See CIQ.ChartEngine#fillScreen
     * @param [callback] Called when loadChart is complete. See {@tutorial Adding additional content on chart} for a tutorial on how to use this callback function.
     * @example <caption>Using a symbol string</caption>
     * stxx.loadChart('IBM');
     *
     * @example <caption>Using a symbol object and embedded span and periodicity requirements</caption>
     * stxx.loadChart({symbol: newSymbol, other: 'stuff'}, {
     * 	span: {
     * 		base: 'day',
     * 		multiplier: 2
     * 	},
     * 	periodicity: {
     * 		period: 1,
     * 		interval: 5,
     * 		timeUnit: 'minute'
     * 	},
     * 	stretchToFillScreen: true
     * });
     *
     * @example <caption>Using an equation string</caption>
     * stxx.loadChart('=2*IBM-GM');
     *
     * @example <caption>Provide data as the second argument</caption>
     * stxx.loadChart('YUM', [
     * 	{Date: '2018-12-03', Close: 2.0034},
     * 	{Date: '2018-12-04', Close: 2.0067},
     * 	{Date: '2018-12-05', Close: 2.0112},
     * 	{Date: '2018-12-06', Close: 2.0091},
     * 	{Date: '2018-12-07', Close: 1.9979}
     * ]);
     *
     * @example <caption>Provide data as a parameter</caption>
     * stxx.loadChart('BGS', {
     * 	masterData: [
     * 		{DT: 1542384420000, Close: 1.00},
     * 		{DT: 1542384480000, Close: 1.01},
     * 		{DT: 1542384540000, Close: 1.04},
     * 		{DT: 1542384600000, Close: 1.02}
     * 	],
     * 	span: {
     * 		base: 'minute',
     * 		multiplier: 1
     * 	}
     * });
     *
     * @since 7.0.0 Added `loadChart`, replacing CIQ.ChartEngine#newChart. Function signature is different.
     */
    public loadChart(
      symbol: string|object,
      parameters?: {
        masterData?: any[],
        chart?: CIQ.ChartEngine.Chart,
        range?: CIQ.ChartEngine.RangeParameters,
        span?: CIQ.ChartEngine.SpanParameters,
        periodicity?: CIQ.ChartEngine.PeriodicityParameters,
        stretchToFillScreen?: boolean
      },
      callback?: Function
    ): void
    /**
     * Loads a blank chart
     *
     * @since 7.3.0
     */
    public loadBlankChart(): void
    /**
     * Returns the current quote (the final element in the dataSet).
     *
     * @param [field] Optional field. If provided, searches for the first record with that field having a value.
     * @return The most recent quote.
     * @since 7.3.0 Added the `field` argument.
     */
    public currentQuote(field?: string): object
    /**
     * Returns the last valid Close found in the dataSet.
     * This would be any numeric value
     * @param field Optional object to check Close within, such as with a series
     * @return The most recent close
     * @since 6.1.0
     */
    public mostRecentClose(field: string): number
    /**
     * INJECTABLE
     * <span class="animation">Animation Loop</span>
     *
     * Creates the dataSegment. The dataSegment is a copy of the portion of the dataSet that is observable in the
     * current chart. That is, the dataSegment is a "view" into the dataSet. chart.scroll and chart.maxTicks are the
     * primary drivers for this method.
     * @param  [theChart] If passed then a data segment will be created just for that chart, otherwise all charts
     */
    public createDataSegment(theChart?: CIQ.ChartEngine.Chart): void
    /**
     * Returns the visible portion of the dataSegment.  A bar is considered visible if its midpoint is within the chart window.
     * This is different than chart.dataSegment which includes any partially visible candles and possibly the very next data point to be displayed.
     * @param  [chart] Chart from which to return the dataSegment
     * @returns The visible bars of the dataSegment
     * @since 5.2.0
     */
    public getDataSegment(chart?: CIQ.ChartEngine.Chart): any[]
    /**
     * Sets the master data for the chart. A data set is derived from the master data by
     * CIQ.ChartEngine#createDataSet.
     *
     * **This function is intended for internal data management. Do not explicitly call this
     * function unless you are manipulating the data at a very detailed level.**
     *
     * For most implementations, simply set your data using CIQ.ChartEngine#loadChart or
     * a [quote feed interface](quotefeed.html), if a quote feed is attached.
     *
     * If a [market factory]CIQ.ChartEngine#setMarketFactory has been linked to the chart,
     * this function also updates the market on the chart to match the newly loaded instrument.
     * When no factory is present, the chart assumes that the market will never change and
     * continues to use the market initially set using CIQ.ChartEngine#setMarket.
     * If no market has been set, the chart operates in 24x7 mode.
     *
     * This function also calculates the number of decimal places for the security by checking
     * the maximum number in the data. The number of decimal places is stored in
     * CIQ.ChartEngine.Chart#decimalPlaces.
     *
     * @param masterData An array of quotes. Each quote should at a minimum contain a
     * 		"Close" or "value" field (capitalized) and a "Date" or "DT" field. This functions sets
     * 		DT to be a JavaScript `Date` object derived from the string form.
     * @param [chart] The chart to which `masterData` is applied. Defaults
     * 		to the default chart.
     * @param [params] Parameters object.
     * @param [params.noCleanupDates] If true, then dates have been cleaned up already
     * 		by calling CIQ.ChartEngine#doCleanupDates, so do not do so in this function.
     *
     * @since
     * - 5.2.0 Added the `params` and `params.noCleanupDates` parameters.
     * - 7.0.0 The `masterData` field "Value" may be treated as the primary plot device.
     * - 8.0.0 The [decimalPlaces]CIQ.ChartEngine.Chart#decimalPlaces field of the
     * 		`chart` parameter is now set from
     * 		CIQ.ChartEngine.Chart#calculateTradingDecimalPlaces.
     */
    public setMasterData(
      masterData: any[],
      chart?: CIQ.ChartEngine.Chart,
      params?: {
        noCleanupDates?: boolean
      }
    ): void
    /**
     * Sets the master data for the chart, creates the data set, and renders the chart.
     *
     * @param			symbol			Ticker symbol for the chart.
     * @param				masterData		An array of quotes. Each quote should at a minimum contain a "Close" field (capitalized) and a Date field which is a string form of the date.
     *												This method will set DT to be a JavaScript Date object derived from the string form.
     * @param	[chart]			The chart to put the masterData. Defaults to the default chart.
     * @since 3.0.0
     */
    public setMasterDataRender(
      symbol: string,
      masterData: any[],
      chart?: CIQ.ChartEngine.Chart
    ): void
    /**
     * Returns an array of all symbols currently required to be loaded by the quote feed.
     * The returned array contains an object for each symbol containing `symbol`, `symbolObject`, `interval`, and `periodicity`.
     *
     * @param params Control parameters.
     * @param [params.include-parameters] Set to true to put the series parameters in the return object.
     * @param [params.exclude-studies] Set to true to not include study symbols.
     * @param [params.breakout-equations] Set to true to return component symbols of equations.
     * @param [params.exclude-generated] Set to true to not include symbols which are generated by virtue of another symbol (e.g. `PlotComplementer`).
     *
     * @return The array of symbol objects required.
     * @since
     * - 2016-03-11
     * - 6.2.0 Added `params.breakout-equations` parameter.
     * - 7.3.0 Added `params.exclude-generated` parameter.
     */
    public getSymbols(
      params: {
        include?: boolean,
        exclude?: boolean,
        breakout?: boolean
      }
    ): any[]
    /**
     * Sets the displayDate for the data element in masterData. The displayDate is the timezone adjusted date.
     * @param quote The quote element to check
     */
    public setDisplayDate(quote: object): void
    /**
     * Calls CIQ.ChartEngine#setDisplayDate for each element in masterData
     * @param masterData Array containing the masterData for a ChartEngine.
     */
    public setDisplayDates(masterData: any[]): void
    /**
     * Sets the data timezone (`dataZone`) and display timezone (`displayZone`) on an intraday chart.
     *
     * >**Important:**
     * >- The `dataZone` property on this method must be set **before** any data is loaded so the engine knows how to convert the incoming records.
     * >- The `displayZone` property on this method can be set at any time and will only affect what is displayed on the x axis.
     * >- This method should only be used for dates that are not timeZone aware. If using the 'DT' fields in your data input records,
     * >**DO NOT** use this function to set the `dataZone` as it will result in a double conversion.
     *
     * - Once set, 'Date' fields containing a time portion, will be converted to the CIQ.ChartEngine#dataZone
     * (or the browser timezone if no dataZone is specified) before added into the `masterData`. Its corresponding 'DT' fields will be set to match.
     * The CIQ.ChartEngine#displayZone is then created and used to translate dates based on either the local browser's timezone,
     * or the timezone selected by the end user.
     *
     * - If the date ('DT' or 'Date') does not include a time offset, such as 'yyyy-mm-dd',
     * no time zone conversion will be performed. Use this option if you prefer to display the same date on all timezones.
     * This applies to daily, weekly and monthly periodicities only.
     * For a list of all supported date formats see the [Input format Tutorial]{@tutorial InputDataFormat}
     *
     * **Time zone and the quotefeed:**
     * On a fetch call, if your quote server sends and receives string dates loaded in the 'Date' field,
     * you can convert the provided start and end dates back to strings using CIQ.yyyymmddhhmmssmmm
     * Example:
     * ```
     * var strStart =  CIQ.yyyymmddhhmmssmmm(startDate);
     * var strEnd = CIQ.yyyymmddhhmmssmmm(endDate);
     * ```
     * These dates will be in the same time zone you sent them in. So they will match your quote feed.
     *
     * For more details on how time zones work in the chart see the [Dates, Times, and Time Zones]{@tutorial Dates and Time Zones} tutorial.
     *
     * **See CIQ.timeZoneMap to review a list of all chatIQ supported timezones and instructions on how to add more!**
     *
     * @param dataZone A ChartIQ supported time zone. This should represent the time zone that the master data comes from, or set to 'null' if your dates are already time zone aware.
     * @param displayZone A ChartIQ supported time zone. This should represent the time zone that the user wishes displayed, or set to null to use the browser time zone.
     * @since 5.2 Also used to convert daily, weekly and monthly periodicities.
     * @example
     * //The raw data received the chart is in Greenwich Mean Time, but we want to display in Amsterdam time.
     * stxx.setTimeZone("UTC", "Europe/Amsterdam")
     *
     *
     */
    public setTimeZone(dataZone: string, displayZone: string): void
    /**
     * INJECTABLE
     *
     * Use this method to add new `OHLC` bars to the end of the chart, insert new bars into the middle of the chart, replace existing bars, delete bars, or stream individual `LAST SALE` data tick by tick as they are received from a streaming feed.
     *
     * **The following rules apply when adding or updating full [`OHLC`]{@tutorial InputDataFormat} bars:**
     *
     * - Follow proper OHLC format as outlined on the [OHLC format tutorial]{@tutorial InputDataFormat}.
     * - If a bar is not present it will be added, if it is present it will be updated so the OHLC and volume integrity is preserved. If `allowReplaceOHL` is not set, the 'Open' is preserved from the existing candle; new 'High' and 'Low' values are calculated, and the 'Close' and 'Volume' values are replaced with the new ones.
     * - Although gaps can be present, dates in the appendQuotes array **must maintain the correct periodicity and order** (older to newer) to prevent out of sequence bars.
     * - If set, gaps will be filled past the currently existing bar. No gaps will be filled when inserting bars in between existing data.
     *
     * **The following rules apply when streaming individual `LAST SALE` data, tick by tick, as they are received from a streaming feed:**
     *
     * - Follow proper LAST SALE format as outlined on the parameters section under the `appendQuotes` field.
     * - This method is designed to update the chart while maintaining the existing periodicity, finding and augmenting an existing bar for an instrument or creating new bars as needed.
     * - It is important to note that a market iterator will be used to find the proper bar to update, and if no bar is found on that date, one will be created even in the past; so always be sure your historical data follows the rules of the market definitions when setting the dates for each bar. Remember that by default, weeks start on Sunday unless a market definition exists to indicate Sunday is not a market day, in which case the next market day will be used as the beginning of the week. Instructions to set a market for the chart can be found here: CIQ.Market
     * - When in 'tick' interval, each trade will be added to a new bar and no aggregation to previous bars will be done.
     *
     * **The following rules apply when updating `BID` and `ASK` prices separately from the primary series.**
     *
     * - Bid, Ask and Volume are reserved for the primary series only.
     * - The reasoning is that if your initial data sends a Bid-Ask together with the 'Close' (Last), your updates will as well; which is usually the norm.
     * - But if your feed sends updates for Bid and Asks separately than for the 'Last' price, then you must add this additional data as you would do any other secondary series.
     *
     * > Assuming you have this data pre-loaded on your chart already containing Bid and Ask prices:
     * > ```
     * > [
     * > 	{
     * > 		"DT": "2019-11-19T18:17:29.000Z",
     * > 		"Close": 266.12,
     * >		"Volume": 300,
     * > 		"Bid": 266.1,
     * > 		"Ask": 266.12,
     * >	},
     * >	{
     * >		"DT": "2019-11-19T18:17:29.000Z",
     * > 		"Close": 266.12,
     * > 		"Volume": 300,
     * > 		"Bid": 266.1,
     * > 		"Ask": 266.12,
     * >	}
     * > ]
     * > ```
     * > And have added this series to display the pre-loaded Bid prices:
     * > ```
     * > stxx.addSeries("Bid", {color: "green", loadData: false, shareYAxis: true, step:true});
     * > ```
     * > Use:
     * > ```
     * > stxx.updateChartData({Close:90}, null, { useAsLastSale: true, secondarySeries: "Bid" });
     * > ```
     * > or
     * > ```
     * > stxx.updateChartData({Last:90}, null, {secondarySeries: "Bid" });
     * > ```
     * > to update the bid prices.
     *
     * **Performance:**
     *
     * - To maintain system performance you can throttle inbound ticks. See CIQ.ChartEngine#streamParameters  and [Streaming tutorial]{@tutorial DataIntegrationStreaming} for more details.
     * - It is important to note that although the data will always be added to masterData, `createDataSet()` and `draw()` will **not** be called if data is received quicker than the throttle (governor) wait periods. As such, you will not see any changes until the throttle wait periods are met.
     * - **Please adjust default settings if your implementation requires immediate updates.**
     *
     * **Additional Notes:**
     *
     * - **It is crucial that you ensure the date/time of the records being loaded are in line with your `masterData` and `dataZone`; and in the case of a last trade streaming, that your market definition will produce dates that will be in sync with the rest of your already loaded records.** See `DT` parameter for more details.
     * - This method is **not** intended to be used as a way to load initial chart data, or data changes triggered by periodicity changes.
     * - Do not stream current updates into the chart using this method if you have used [setSpan]CIQ.ChartEngine#setSpan or [setRange]CIQ.ChartEngine#setRange to enter 'historical mode'.
     * When in historical mode, forward pagination is based on the date of the last loaded bar, and streaming current updates will create a data gap.
     * To check if you are in historical mode evaluate CIQ.ChartEngine#isHistoricalModeSet
     *
     * See the [Data Integration]{@tutorial DataIntegrationOverview} tutorial for more detail on how to load initial data.
     *
     * See the [Streaming]{@tutorial DataIntegrationStreaming} tutorial for more the details.
     *
     * @param  appendQuotes		**OHLC format requirements**
     * 											An **array** of properly formatted OHLC quote object(s). [See OHLC Data Format]{@tutorial InputDataFormat}.
     * 											Items in this array *must* be ordered from earliest to latest date.
     * 											As a convenience, for more generic data updates, instead of an entire OHLC record, a field of `Value` can be used as an alternative to `Close`.
     * 											Examples:
     * ```
     * {
     *	DT: stxx.masterData[i].DT,
     *	Value: 148
     *	}
     * ```
     * ```
     * {
     *	Date: '12/31/2011',
     *	Value: 148
     * }
     * ```
     * <hr>
     * **LAST SALE  format requirements**
     * An **object** with the following elements:
     * @param 	[appendQuotes.Last]		Last sale price
     * @param 	[appendQuotes.Volume]	Trade volume (**used on primary series only**)
     * @param 	[appendQuotes.Bid] 		Bid price (**used on primary series only**)
     * @param 	[appendQuotes.Ask] 		Offer/Ask price (**used on primary series only**)
     * @param 	[appendQuotes.BidL2]		Level 2 Bid, expressed as an array of [price,size,obj] pairs.  For example, BidL2: [[10.05, 15, {...}],[10.06, 10, {...}],...].
     * 											`obj` is an optional object which can contain whatever you wish.  It will be conveyed all the way into the marketdepth chart and can be displayed by using the 'headsUp' method of displaying crosshair data.
     * @param 	[appendQuotes.AskL2]		Level 2 Offer/Ask expressed as an array of [price,size,obj] pairs.  For example, AskL2: [[11.05, 12, {...}],[11.06, 8, {...}],...].
     * 											`obj` is an optional object which can contain whatever you wish.  It will be conveyed all the way into the marketdepth chart and can be displayed by using the 'headsUp' method of displaying crosshair data.
     * @param 	[appendQuotes.DT] 		Date of trade. It must be a java script date [new Date()]. If omitted, defaults to "right now".
     * 											 **Last sale format DOES NOT ALLOW THE USE OF A `Date` FIELD**.
     * 											 If you are using the 'Date' string field with a `dataZone` for your historical data and wish to also use it for streaming last sale updates,
     * 											you must instead submit a properly formatted OHLC array with `useAsLastSale` set to `true`. Like this:
     * ```
     * stxx.updateChartData(
     *  [
     *   {"Date":"2015-04-16 16:00","Close":152.11,"Volume":4505569}
     *  ],
     *  null,
     *  {useAsLastSale:true}
     * );
     * ```
     * @param 			[chart]				The chart to append the quotes. Defaults to the default chart.
     * @param [params] Parameters to dictate behavior
     * @param [params.noCreateDataSet] If true then do not create the data set automatically, just add the data to the masterData
     * @param [params.noCleanupDates] If true then do not clean up the dates using CIQ.ChartEngine.doCleanupDates.  Usually set if dates were already cleaned up.
     * @param [params.allowReplaceOHL] Set to true to bypass internal logic that maintains OHL so they are instead replaced with the new data instead of updated.
     * @param [params.bypassGovernor] If true then dataSet will be immediately updated regardless of CIQ.ChartEngine#streamParameters. Not applicable if `noCreateDataSet` is true.
     * @param [params.fillGaps] If true and CIQ.ChartEngine#cleanupGaps is also set, CIQ.ChartEngine#doCleanupGaps will be called to fill gaps for any newly added bars past the currently existing bar. It will not fill gaps for bars added to the middle of the masterData, or created by deleting a bar. <BR> Reminder: `tick` does not fill any gaps as it is not a predictable interval.
     * @param [params.secondarySeries] Set to the name of the element (valid comparison symbol, for example) to load data as a secondary series. When left out, the data will be automatically added to the primary series. <Br>**Note:** You should never set `secondarySeries` to the primary symbol. If you are unsure of what the current primary series is, you can always query the chart engine by checking `stxx.chart.symbol`.
     * @param [params.deleteItems] Set to true to completely delete the masterData records matching the dates in appendQuotes.
     * @param [params.useAsLastSale] Set to true if not using a 'last sale' formatted object in `appendQuotes`.
     * This option is available in cases when a feed may always return OHLC formatted objects or a 'Close' field instead of a 'Last' field,
     * even for last sale streaming updates.
     * By definition a 'last sale' can only be a single record indicating the very 'last' sale price.
     * As such, even if multiple records are sent in the `appendQuotes` array when this flag is enabled,
     * only the last record's data will be used. Specifically the 'Close' and 'Volume' fields will be streamed.
     * @param [params.useAsLastSale.aggregatedVolume] If your last sale updates send current volume for the bar instead of just the trade volume, set this parameter to 'true' in the `params.useAsLastSale` object. The sent in volume will be used as is instead of being added to the existing bar's volume. Not applicable when loading data for a secondary series.
     * @example
     * // this example will stream the last price on to the appropriate bar and add 90 to the bar's volume.
     * stxx.updateChartData(
     *   {
     *     Last: 50.94,
     *     Volume: 90
     *   }
     * );
     * @example
     * // this example will stream the last price on to the appropriate bar and set the volume for that bar to 90.
     * stxx.updateChartData(
     *   {
     *     Last: 50.94,
     *     Volume: 90
     *   },
     *   null,
     *   {useAsLastSale: {aggregatedVolume:true}}
     * );
     * @example
     * // this example will stream the last price to the appropriate bar  **for a secondary series**.
     * stxx.updateChartData(
     *   {
     *     Last: 50.94
     *   },
     *   null,
     *   {secondarySeries:secondarySymbol}
     * );
     * @example
     * // this example will add or replace a complete bar.
     * stxx.updateChartData(
     *   [
     *     {"Date":"2015-04-16 16:00","Open":152.13,"High":152.19,"Low":152.08,"Close":152.11,"Volume":4505569},
     *     {"Date":"2015-04-17 09:30","Open":151.76,"High":151.83,"Low":151.65,"Close":151.79,"Volume":2799990},
     *     {"Date":"2015-04-17 09:35","Open":151.79,"High":151.8,"Low":151.6,"Close":151.75,"Volume":1817706}
     *   ]
     * );
     * @example
     * // this example will add or replace a complete bar.
     * stxx.updateChartData(
     *   [
     *     {"Date":"2015-04-16 16:00","Value":152.13},
     *   ]
     * );
     * @since
     * - 5.1.0 New function replacing and enhancing legacy method `appendMasterData`.
     * - 5.1.0 Added ability to delete or insert items anywhere in the masterData. `deleteItems` parameter added.
     * - 5.2.0 Added `overwrite` parameter.
     * - 5.2.0 For main series data, if Close=null is set, and not streaming, then Open, High, Low and Volume also set to null.
     * - 5.2.0 For main series data, if Volume=0/null is set, and not streaming, then Volume is reset to 0.
     * - 5.2.0 Added `params.noCleanupDates`; `params.fillGaps` applicable now for secondary series as well.
     * - 6.0.0 Removed `overwrite` parameter.
     * - 6.1.0 Added BidL2 and AskL2 to `appendQuotes` object.
     * - 6.3.0 `appendQuotes` can now take `Value` instead of `Close`.
     * - 6.3.0 Added `obj` to BidL2 and AskL2 array elements to allow vendor specific data to be displayed on the chart tooltip.
     * - 7.2.0 Method now rolls up ticks if period is greater than 1.
     */
    public updateChartData(
      appendQuotes: {
        Last?: number,
        Volume?: number,
        Bid?: number,
        Ask?: number,
        BidL2?: any[],
        AskL2?: any[],
        DT?: number
      },
      chart?: CIQ.ChartEngine.Chart,
      params?: {
        noCreateDataSet?: boolean,
        noCleanupDates?: boolean,
        allowReplaceOHL?: boolean,
        bypassGovernor?: boolean,
        fillGaps?: boolean,
        secondarySeries?: string,
        deleteItems?: boolean,
        useAsLastSale?: {
          aggregatedVolume?: boolean
        }
      }
    ): void
    /**
     * INJECTABLE
     *
     * Loads or updates detailed current market information, such as L2 data, into the [chart.currentMarketData]CIQ.ChartEngine.Chart#currentMarketData object
     * or an equally laid out object for a secondary series (symbol), if one provided.
     *
     * **[draw()]CIQ.ChartEngine#draw must be called immediately after this method to see the updates.**
     *
     * A single ‘snapshot’ object per symbol is loaded and only the most current updates maintained.
     * This method is not intended to track historical or time-series information.
     *
     * This market ‘snapshot’ information can then be used to render specialty charts such as CIQ.MarketDepth, which is not a time series chart.
     * This data is also used to feed the Depth of Market indicator, [Trade History]WebComponents.cq-tradehistory and
     * [Order Book]WebComponents.cq-orderbook web components, part of the [Active Trader package](https://active-trader.demo.chartiq.com/).
     *
     * When using as part of a chart engine that also display a time-series chart, this method is automatically called with that same time-series data every time new data is load into the chart, thereby maintaing all charts in sync.
     * And only needs to be explicitly called when needing to update the L2 'snapshot' at a faster refresh rate than the rest of the time-series data, or if the time-series data does not provide this information.
     * If using the CIQ.MarketDepth standalone, without a standard time series chart, you must call this method explicitly to load and refresh the data.
     *
     * Data Format:
     *
     * | Field | Required | Type | Description | Used for Active Trader | Used for TFC |
     * | ----------- | -------- | ---------------- | ---------------- | ---------------- | ---------------- |
     * | DT | Yes | A JavaScript Date() object | Timestamp for the data record | Yes | Yes |
     * | Bid | No | number | The current bid price | No | Yes |
     * | Ask | No | number | The current ask price | No | Yes |
     * | Last | No | number | The last (current) price.If not present, the midpoint of the chart will be the average of the lowest bid and the highest ask.Required on [Trade History](http://jsfiddle.net/chartiq/r2k80wcu) | Yes | Yes |
     * | BidSize | No | number | The bid size  | No | No |
     * | AskSize | No | number | The ask size | No | No |
     * | LastSize | No | number | The last (current) price size.Required on [Trade History](http://jsfiddle.net/chartiq/r2k80wcu) | Yes | No |
     * | LastTime | No | A JavaScript Date() object | Timestamp for the <b>Last</b> price provided.Required on [Trade History](http://jsfiddle.net/chartiq/r2k80wcu) | Yes | No |
     * | BidL2 | No | array | Level 2 Bid, expressed as an array of [price,size] pairs.For example, BidL2: [[10.05,15],[10.06,10],...]Required on [Order Book](http://jsfiddle.net/chartiq/L30hna2s/) | Yes | No |
     * | AskL2 | No | array | Level 2 Ask, expressed as an array of [price,size] pairs.For example, AskL2: [[10.05,15],[10.06,10],...]Required on [Order Book](http://jsfiddle.net/chartiq/L30hna2s/) | Yes | No |
     *
     * Since not all of the data will need to be updated at the same time, this method allows you to send only the data that needs to be changed. Any values not provided will simply be skipped and not updated on the object.
     *
     * Example data format for a marketDepth chart:
     * ```
     * {
     * 	DT:new Date("2018-07-30T04:00:00.000Z"),
     * 	Last:100.2589,
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
     * @param data Data to load as per required format.
     * @param  chart The chart whose market data to update. Defaults to the instance chart.
     * @param symbol Symbol if passing secondary series information
     * @param params  Additional parameters
     * @param [params.fromTrade] This function can be called directly or as a result of a trade update, such as from CIQ.ChartEngine.Chart#updateChartData.
     * 										Set this param to `true` to indicate the incoming data is a master data record.
     * 										Otherwise the function will attempt to adjust the record date to align with the last bar.
     * @param [params.finalClose] If the data.Close is being manipulated (such as with animation), this param should contain the real, final Close value
     * @since
     * - 6.1.0
     * - 6.1.1 Added `params.fromTrade`.
     * - 6.2.3 Added `params.finalClose`.
     */
    public updateCurrentMarketData(
      data: object,
      chart: CIQ.ChartEngine.Chart,
      symbol: string,
      params: {
        fromTrade?: boolean,
        finalClose?: boolean
      }
    ): void
    /**
     * INJECTABLE
     *
     * Clears the [chart.currentMarketData]CIQ.ChartEngine.Chart#currentMarketData object or the one linked to a secondary series, if one provided.
     * @param  chart The chart to clear. If omitted, will clear all charts.
     * @param symbol Symbol to clear this symbol's secondary series information
     * @since 6.1.0
     */
    public clearCurrentMarketData(chart: CIQ.ChartEngine.Chart, symbol: string): void
    /**
     * Legacy method used to internally dispatch a registered event whenever a change to layout, drawings or theme occurs.
     * Events must be registered using CIQ.ChartEngine#addDomEventListener for "layout", "drawing", "theme" and "preferences".
     *
     * This is simply a proxy method that calls the corresponding CIQ.ChartEngine#dispatch method.
     *
     * Developers creating their own custom functionality should call CIQ.ChartEngine#dispatch instead.
     *
     * @param  change Type of change that occurred.
     */
    public changeOccurred(change: string): void
    /**
     * Charts may require asynchronous data to render. This creates a dilemma for any external
     * process that depends on a fully rendered chart (for instance a process to turn a chart into an image).
     * To solve this problem, external processes can register for a callback which will tell them when the chart
     * has been drawn. See CIQ.ChartEngine.registerChartDrawnCallback.
     *
     * To accommodate this requirement, studies, plugins or injections that render asynchronously should use startAsyncAction
     * and CIQ.ChartEngine#completeAsyncAction to inform the chart of their asynchronous activity.
     */
    public startAsyncAction(): void
    /**
     * Registers a callback for when the chart has been drawn
     * @param  fc The function to call
     * @return An object that can be passed in to CIQ.ChartEngine#unregisterChartDrawnCallback
     */
    public registerChartDrawnCallback(fc: Function): object
    /**
     * Removes a callback registration for when the chart has been drawn
     * @param  obj An object from CIQ.ChartEngine#registerDrawnCallback
     */
    public unregisterChartDrawnCallback(obj: object): void
    /**
     * Makes the async callbacks only if no pending async activity
     */
    public makeAsyncCallbacks(): void
    /**
     * Studies or plugins that use asynchronous data should call this when their async activities are complete.
     * See CIQ.ChartEngine#startAsyncAction
     */
    public completeAsyncAction(): void
    /**
     * Registers a listener for a chart event in the chart engine instance.
     *
     * Events are tracked in the `CIQ.ChartEngine.callbackListeners` object, which is READ ONLY and
     * should never be manually altered.
     *
     * Valid event types and listeners:
     *   - `*`: Passing in this value registers the listener to every event type below.
     *   - `doubleTap`: [doubleTapEventListener]CIQ.ChartEngine~doubleTapEventListener
     *   - `doubleClick`: [doubleClickEventListener]CIQ.ChartEngine~doubleClickEventListener
     *   - `drawing`: [drawingEventListener]CIQ.ChartEngine~drawingEventListener
     *   - `drawingEdit`: [drawingEditEventListener]CIQ.ChartEngine~drawingEditEventListener
     *   - `floatingWindow`: [floatingWindowEventListener]CIQ.ChartEngine~floatingWindowEventListener
     *   - `layout`: [layoutEventListener]CIQ.ChartEngine~layoutEventListener
     *   - `longhold`: [longholdEventListener]CIQ.ChartEngine~longholdEventListener
     *   - `move`: [moveEventListener]CIQ.ChartEngine~moveEventListener
     *   - `newChart`: [newChartEventListener]CIQ.ChartEngine~newChartEventListener
     *   - `notification`: [notificationEventListener]CIQ.ChartEngine~notificationEventListener
     *   - `periodicity`: [periodicityEventListener]CIQ.ChartEngine~periodicityEventListener
     *   - `preferences`: [preferencesEventListener]CIQ.ChartEngine~preferencesEventListener
     *   - `rightClick`: [rightClickEventListener]CIQ.ChartEngine~rightClickEventListener
     *   - `scroll`: [scrollEventListener]CIQ.ChartEngine~scrollEventListener
     *   - `studyOverlayEdit`: [studyOverlayEditEventListener]CIQ.ChartEngine~studyOverlayEditEventListener
     *   - `studyPanelEdit`: [studyPanelEditEventListener]CIQ.ChartEngine~studyPanelEditEventListener
     *   - `symbolChange`: [symbolChangeEventListener]CIQ.ChartEngine~symbolChangeEventListener
     *   - `symbolImport`: [symbolImportEventListener]CIQ.ChartEngine~symbolImportEventListener
     *   - `tap`: [tapEventListener]CIQ.ChartEngine~tapEventListener
     *   - `theme`: [themeEventListener]CIQ.ChartEngine~themeEventListener
     *   - `undoStamp`: [undoStampEventListener]CIQ.ChartEngine~undoStampEventListener
     *
     * @param type One or more event types to listen for. See the description above
     * 		for valid types.
     * @param callback The listener to call when the event or events specified by `type`
     * 		are triggered. Accepts an object argument containing properties specified in the event
     * 		listener definition.
     * @return An object containing `type` and `callback`. The object can be passed to
     * 		CIQ.ChartEngine#removeEventListener to remove the listener.
     *
     * @since
     * - 04-2016-08
     * - 4.0.0 Added "doubleTap".
     * - 4.0.0 Type can be an array of event options.
     * - 6.3.0 Added "scroll".
     * - 7.0.0 Added "preferences" and "drawingEdit".
     * - 8.1.0 Added "periodicity".
     * - 8.2.0 Added "notification" and "floatingWindow".
     *
     * @example <caption>Add a "longhold" event listener.</caption>
     * stxx.longHoldTime = ... // Optionally override default value of 700ms.
     * stxx.addEventListener("longhold", function(lhObject) {
     *     CIQ.alert("longhold event at x: " + lhObject.x + " y: " + lhObject.y);
     * });
     *
     * @example <caption>Add a "tap" listener that provides location and details when a series is clicked or tapped.</caption>
     * stxx.addEventListener("tap", function(tapObject){
     *     if (this.anyHighlighted) {
     *         for (let n in this.chart.seriesRenderers) {
     *             let r = this.chart.seriesRenderers[n];
     *             for (let j = 0; j < r.seriesParams.length; j++) {
     *                 series = r.seriesParams[j];
     *                 if (series.highlight) {
     *                     let bar = this.barFromPixel(tapObject.x);
     *                     if (this.chart.dataSegment[bar]) {
     *                         // Replace console.log with your required logic as needed.
     *                         console.log("Tap event at pixel x: " + tapObject.x + " y: " + tapObject.y);
     *                         console.log("Price:", this.priceFromPixel(tapObject.y), " Date: ", this.chart.dataSegment[bar].DT);
     *                         console.log("Series Details: ", JSON.stringify(series));
     *                     }
     *                 }
     *             }
     *         }
     *     }
     * });
     */
    public addEventListener(type: string|string[], callback: Function): object
    /**
     * Removes a listener for a chart event type.
     *
     * If the event type is "*", listeners for all event types are removed. See
     * CIQ.ChartEngine#addEventListener for valid event types.
     *
     * Events are tracked in the `CIQ.ChartEngine.callbackListeners` object.
     *
     * @param obj The object returned from adding the listener (see
     * 		CIQ.ChartEngine#addEventListener) or a string that identifies the type of event.
     * 		<p>**Note:** If this parameter is a string, the optional `cb` parameter is required.
     * @param obj.type The type of event.
     * @param obj.cb The listener to be removed.
     * @param [cb] The listener to be removed. Required if the `obj` parameter is an
     * 		string, unused otherwise.
     *
     * @since 04-2016-08
     */
    public removeEventListener(obj: {type: string, cb: Function}, cb?: Function): void
    /**
     * Dispatches an event by calling one or more
     * [event listeners]CIQ.ChartEngine#eventListeners registered for the event specified by
     * `type`. Event listeners registered for the `*` event type are also subsequently called.
     * See CIQ.ChartEngine#addEventListener.
     *
     * **Note:** If any of the called event listeners returns true, all remaining uncalled
     * listeners are bypassed.
     *
     * @param type Identifies the type of event for which the event listeners are called.
     * 		Must be one of the types listed in CIQ.ChartEngine#addEventListener excluding `*`.
     * @param data A collection of parameters to provide to the listener functions called in
     * 		response to the event. See the listener types listed in
     * 		CIQ.ChartEngine#addEventListener for relevant parameters.
     * @return False unless a called listener returns true, in which case this function
     * 		also returns true.
     *
     *
     * @example
     * // Trigger a layout change event; perhaps to save the layout.
     * stx.dispatch("layout", {
     *     stx: stx,
     *     symbol: stx.chart.symbol,
     *     symbolObject: stx.chart.symbolObject,
     *     layout: stx.layout,
     *     drawings: stx.drawingObjects
     * });
     */
    public dispatch(type: string, data: object): boolean
    /**
     * Prepends custom developer functionality to an internal chart member. See [“Injection API"]{@tutorial Using the Injection API}.
     * @param  o Signature of member
     * @param  n Callback function, will be called with "apply"
     * @since
     * - 04-2015 You can append either to an CIQ.ChartEngine instance, or to the prototype. The first will affect only a single
     * chart while the latter will affect any chart (if you have multiple on the screen).
     * - 15-07-01 Function returns a descriptor which can be passed in to [removeInjection()]CIQ.ChartEngine#removeInjection to remove it later on.
     * @return Injection descriptor which can be passed in to CIQ.ChartEngine#removeInjection to remove it later on.
     */
    public prepend(o: string, n: Function): object
    /**
     * Appends custom developer functionality to an internal chart member. See [“Injection API"]{@tutorial Using the Injection API}.
     * @param  o Signature of member
     * @param  n Callback function, will be called with "apply"
     * @since
     * - 04-2015 You can append either to an CIQ.ChartEngine instance, or to the prototype. The first will affect only a single
     * chart while the latter will affect any chart (if you have multiple on the screen)
     * - 15-07-01 Function returns a descriptor which can be passed in to [removeInjection()]CIQ.ChartEngine#removeInjection to remove it later on.
     * @return Injection descriptor which can be passed in to CIQ.ChartEngine#removeInjection to remove it later on.
     */
    public append(o: string, n: Function): object
    /**
     * Removes a specific injection.  One can remove either an instance injection or a prototype injection, depending on how the function is called.
     * @param  id The injection descriptor returned from CIQ.ChartEngine#prepend or CIQ.ChartEngine#append
     * @since 07/01/2015
     */
    public removeInjection(id: object): void
    /**
     * Removes any and all prepend and append injections from a specified CIQ.ChartEngine function.
     * If called as an instance method, will remove the instance injections.
     * If called as a prototype method, will remove the prototype injections.
     * @example
     * stxx.remove("displayChart");  // removes instance injections
     * CIQ.ChartEngine.prototpye.remove("displayChart");  // removes prototype injections
     * @param  o Signature of function which has injections to remove
     */
    public remove(o: string): void
    /**
     * Given a browser time it will return the date in dataZone time. See CIQ.ChartEngine#setTimeZone for more details.
     * If no dataZone is set, it will return the original date passed in.
     * @param browserDate Date in browser time - as in 'new Date();'
     * @return Date converted to dataZone
     * @since 07-2016-16.6
     */
    public convertToDataZone(browserDate: Date): Date
    /**
     * Sets the base chart type for the primary symbol.
     * @param chartType The chart type. See <a href="CIQ.ChartEngine.html#layout%5B%60chartType%60%5D">CIQ.ChartEngine.layout.chartType</a> for valid options.
     *
     * See {@tutorial Chart Styles and Types} for more details.
     */
    public setChartType(chartType: string): void
    /**
     * INJECTABLE
     * <span class="animation">Animation Loop</span>
     *
     * Sets the chart y-axis to linear scale if:
     * - the y-axis is currently set to log scale and
     * - the chart data set contains a value less than or equal to zero.
     *
     * @return true if log scale has been deactivated; otherwise false.
     *
     * @since 8.2.0
     */
    public checkLogScale(): boolean
    /**
     * Sets the charts to adjusted values rather than standard values. Adjusted values are calculated outside of the chart engine (and may be splits, dividends or both).
     * When charts are using adjusted values, a computed ratio for each tick is used for price to pixel calculations which keeps drawings accurate
     * @param data True to use adjusted values (Adj_Close), false to use Close values
     */
    public setAdjusted(data: boolean): void
    /**
     * Formats a price according to the decimalPlaces specified in either the panel or chart.
     * It will then format to international standards if the internationalizer is set.
     * This method *does not* condense prices.
     * @param  price The price to be formatted
     * @param  panel The panel to use to determine the number of decimal places.
     * @return		  The formatted price
     * @since 6.2.0 Return value will always be a string.
     */
    public formatPrice(price: number, panel: CIQ.ChartEngine.Panel): string
    /**
     * Determines the high and low values for the data set.
     *
     * Requires an array of fields to check.
     * For instance, the array might contain `["Close","Series1","Series2"]` which would return
     * the max and min of all of those values for each quote.
     *
     * If you wish to exclude certain fields from your calculations to prevent excessive flattening
     * of the charts, you can overwrite this method as follows:
     * ```
     * stxx.origDetermineMinMax = stxx.determineMinMax;
     * stxx.determineMinMax = function(quotes, fields, sum, bypassTransform, length, checkArray) {
     * 	// Add code here to remove anything you want from the 'fields' array.
     *	console.log('current fields', fields);
     *	return stxx.origDetermineMinMax(quotes, fields, sum, bypassTransform, length, checkArray);
     * }
     * ```
     * Also see CIQ.ChartEngine.Chart#includeOverlaysInMinMax
     *
     * @param quotes The array of quotes (typically `CIQ.ChartEngine.chart.dataSegment`)
     * 		to evaluate for minimum and maximum values.
     * @param fields A list of fields to compare.
     * @param [sum] If true, then compute maximum sum rather than the maximum
     * 		single value across all fields. If an array, compute sum over just the fields in the
     * 		array.
     * @param [bypassTransform] If true, then bypass any transformations.
     * @param [length] Specifies how much of the quotes array to process.
     * @param [checkArray] If true, the type of the value used to determine the min/max
     * 		is checked to ascertain whether it is an array; if so, the first element of the array
     * 		is retrieved for use in the min/max determination.
     * @param [panel] A reference to the panel rendering the quotes.
     * @param [axis] A reference to the y-axis rendered for the quotes.
     * @param [filters] Array of functions to process the min/max values before returning.
     * 		Filter functions must return a valid min/max tuple or false.
     * @return A tuple, min and max values.
     *
     * @since
     * - 2014-02
     * - 7.3.0 Added `checkArray` parameter.
     * - 8.0.0 Allow the `sum` parameter to be an array of valid fields to sum over. Added
     * 		the `panel`, `axis`, and `filters` parameters.
     */
    public determineMinMax(
      quotes: any[],
      fields: any[],
      sum?: boolean|string[],
      bypassTransform?: boolean,
      length?: number,
      checkArray?: boolean,
      panel?: CIQ.ChartEngine.Panel,
      axis?: CIQ.ChartEngine.YAxis,
      filters?: any[]
    ): any[]
    /**
     * INJECTABLE
     * <span class="animation">Animation Loop</span>
     *
     * This method initializes display variables for the chart.
     *
     * It is part of the animation loop and called with every [draw]CIQ.ChartEngine#draw operation.
     * The high and low values for the visible section of the primary chart are calculated and corresponding values stored as follows:
     * - `chart.highValue` - The highest value on the chart
     * - `chart.lowValue` - The lowest value on the chart
     *
     * See CIQ.ChartEngine.Chart#includeOverlaysInMinMax and  CIQ.ChartEngine#determineMinMax
     *
     * Those values are subsequently used by CIQ.ChartEngine#createYAxis which is called from within this method.
     * This method also calls CIQ.ChartEngine#createCrosshairs.
     *
     * @param  chart The chart to initialize
     * @since 5.2.0. It now also calculates the minimum and maximum points in all study panels. This calculation was previously done using CIQ.Studies.determineMinMax, now deprecated.
     */
    public initializeDisplay(chart: CIQ.ChartEngine.Chart): void
    /**
     * Sets the market definition on the chart.
     *
     * Once set, the definition will not change until it is explicitly set to something else by calling this method again.
     *
     * A new definition for a chart should only be set once, right before a new instrument is loaded with the CIQ.ChartEngine#loadChart call.
     * Loading or modifying a market definition after a chart has loaded its data will result in unpredictable results.
     *
     * If a dynamic model is desired, where a new definition is loaded as different instruments are activated, see CIQ.ChartEngine#setMarketFactory.
     *
     * See CIQ.Market for market definition rules and examples.
     *
     * This is only required if your chart will need to know the operating hours for the different exchanges.
     *
     * If using a 24x7 chart, a market does not need to be set.
     * @param marketDefinition A market definition as required by CIQ.Market
     * @param chart An instance of CIQ.ChartEngine.Chart
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
    public setMarket(marketDefinition: object, chart: CIQ.ChartEngine.Chart): void
    /**
     * Links the chart to a method that given a symbol object of form accepted by CIQ.ChartEngine#loadChart, can return a complete market definition object.
     * Once linked, the market factory it will be used by the chart to ensure the market always matches the active instrument.
     * This is only required if your chart will need to know the operating hours for the different exchanges.
     * If using a 24x7 chart, a market factory does not need to be set.
     *
     * Please note that if using the default sample templates, this method is set to use the CIQ.Market.Symbology functions, which must be reviewed and adjust to comply with your quote feed and symbology format before they can be used.
     * @param factory A function that takes a symbolObject and returns a market definition. See CIQ.Market for instruction on how to create a market definition. See CIQ.Market.Symbology.factory for working example of a factory function.
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
     * var stxx=new CIQ.ChartEngine({container:document.querySelector(".chartContainer"), preferences:{labels:false, currentPriceLine:true, whitespace:0}});
     * stxx.setMarketFactory(sampleFactory);
     */
    public setMarketFactory(factory: Function): void
    /**
     * Sets a timer to check for chart resizing.
     *
     * Normally, the chart is resized whenever the screen is resized by capturing a screen resize event.
     * However, if charts are embedded in a windowing GUI, they may not receive window resize events.
     * Ideally, `stxx.resizeChart()` should be called whenever a window is resized; however, if this is inconvenient,
     * then the resize timer can be enabled to cover all bases.
     *
     * On initialization, CIQ.ChartEngine.resizeDetectMS is checked for the default resize checking interval. The default is 1,000 milliseconds.
     * To turn off resize checking simply set CIQ.ChartEngine.resizeDetectMS=0; when you declare your CIQ.ChartEngine object.
     *
     * @param ms Number of milliseconds to poll. Zero to stop checking.
     * @since 7.2.0 For browsers that support it, a [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) is used instead of a timeout.
     */
    public setResizeTimer(ms: number): void
    /**
     * Returns an array of all the securities, series, and overlays that are drawn on the current panel.
     *
     * @returns The fields — in object-chain form — of the currently rendered objects.
     * @since 7.2.0
     */
    public getRenderedItems(): object[]
    /**
     * Sets a transformation and untransformation function. Transforms can be used to transform the Y-Axis from absolute
     * to relative values. For instance, comparison charts use a transform that adjusts from price to percentage.
     * After this is called, chart.transformFunc and chart.untransformFunc will be set to those functions.
     * @param chart			   The chart to transform
     * @param transformFunction	 A transformation callback function which takes a number and returns the transformation of that number
     * @param untransformFunction An untransformation callback function
     */
    public setTransform(
      chart: CIQ.ChartEngine.Chart,
      transformFunction: Function,
      untransformFunction: Function
    ): void
    /**
     * Removes a transformation/untransformation pair
     * @param  chart The chart to remove transformations from
     */
    public unsetTransform(chart: CIQ.ChartEngine.Chart): void
    /**
     * INJECTABLE
     * <span class="animation">Animation Loop</span>
     *
     * This method ensures that the chart is not scrolled off of either of the vertical edges.
     * See CIQ.ChartEngine#minimumLeftBars, CIQ.ChartEngine.Chart#allowScrollPast, and CIQ.ChartEngine.Chart#allowScrollFuture for adjustments to defaults.
     * @param  theChart The chart to check
     */
    public correctIfOffEdge(theChart: CIQ.ChartEngine.Chart): void
    /**
     * Returns the offset from the left side of the screen for the first element
     * on the chart screen. Most times this will be zero except when a user has scrolled
     * past the end of the chart in which case it will be a positive number. This can be used
     * to recreate a saved chart.
     * @return The offset from the left of the chart.
     */
    public getStartDateOffset(): number
    /**
     * Scrolls the chart so that the leftmost tick is the requested date.
     * The date must be an exact match and data for that bar must already be loaded in the chart.
     * There is no effect if the date is not found an the engine will not attempt to fetch more data.
     * @param dt The requested date
     */
    public setStartDate(dt: Date): void
    /**
     * Determines the appropriate canvas on which to draw background plots (gridlines and axes). If
     * CIQ.ChartEngine#useBackgroundCanvas is true, background plots are drawn on the chart
     * background canvas; if false, on the chart main canvas.
     *
     * @param chart The chart from which the canvas is obtained.
     * @return Either the chart's main canvas or background canvas, depending
     * 		on the value of CIQ.ChartEngine#useBackgroundCanvas.
     * @since 7.4.0
     */
    public getBackgroundCanvas(chart: CIQ.ChartEngine.Chart): HTMLElement
    /**
     * This method resizes the canvas to the dimensions of the containing div. This is called primarily
     * by CIQ.ChartEngine#resizeChart and also when the chart is initialized (via loadChart).
     */
    public resizeCanvas(): void
    /**
     * Sets the candleWidth for the chart. The candleWidth represents the number of horizontal pixels from the start
     * of one bar or candle to the start of the next. This also applies to line charts. It is effectively, the horizontal zoom.
     * The candleWidth can be read from layout.candleWidth.
     *
     * Method also ensures that the new candleWidth is not less than CIQ.ChartEngine.Chart#minimumCandleWidth and not more than
     * CIQ.ChartEngine.Chart#maximumCandleWidth. If either of these is the case, candleWidth will be set to whichever value is closer.
     *
     * **Note**: if calling `setCandleWidth()` before `loadChart()`, with a value less than `minimumCandleWidth`, `loadChart()` will reset the candle size to the default candle size (8 pixels).
     *
     * @param newCandleWidth The new candle width. If less than or equal to 0, it will be reset to 8
     * @param [chart]	Which chart to set the candleWidth. Defaults to the default chart.
     * @example
     * stxx.setCandleWidth(10);
     * stxx.home();	// home() is preferred over draw() in this case to ensure the chart is properly aligned to the right most edge.
     */
    public setCandleWidth(newCandleWidth: number, chart?: CIQ.ChartEngine.Chart): void
    /**
     * Ensures that a candle width value is within the limits of CIQ.ChartEngine#minimumCandleWidth
     * and CIQ.ChartEngine#maximumCandleWidth.
     *
     * @param candleWidth The candle width to be checked.
     * @return The value of `candleWidth` if `candleWidth` is between `minimumCandleWidth` and `maximumCandleWith`.
     * 		Otherwise, `minimumCandleWidth` if `candleWidth` is less than `minimumCandleWidth`. Otherwise, `maximumCandleWith`
     * 		if `candleWidth` is greater than `maximumCandleWith`.
     * @since 7.4.0
     */
    public constrainCandleWidth(candleWidth: number): number
    /**
     * INJECTABLE
     *
     * Resizes the chart and adjusts the panels. The chart is resized to the size of the container div by calling
     * CIQ.ChartEngine#resizeCanvas. This method is called automatically if a screen resize event occurs. The charting
     * engine also attempts to detect size changes whenever the mouse is moved. Ideally, if you know the chart is being
     * resized, perhaps because of a dynamic change to the layout of your screen, you should call this method manually.
     * @param [maintainScroll=true] By default the scroll position will remain pegged on the right side of the chart. Set this to false to override.
     * @since
     * - 2015-11-1 `resizeChart` now automatically retains scroll position.
     * - 09-2016-19 `resizeChart` now also manages the resizing of the crosshairs.
     */
    public resizeChart(maintainScroll?: boolean): void
    /**
     * Removes any studies from the chart, and hides the chart controls.
     * The chart becomes uninitialized, disabling any interaction with it.
     * The canvas is not cleared; CIQ.clearCanvas can do that.
     *
     * Useful when a chart is loaded with no data due to a quoteFeed error. Automatically called by CIQ.ChartEngine#loadChart
     *
     * @since 2016-12-01
     */
    public clear(): void
    /**
     * Adjusts the candleWidth to eliminate left-side gaps on the chart if not enough bars are loaded.
     *
     * Used by the `stretchToFillScreen` parameter of CIQ.ChartEngine#loadChart
     * @since 4.0.0 This function is now public.
     */
    public fillScreen(): void
    /**
     * Sets the maximimum number of ticks to the requested number. This is effected by changing the candleWidth.
     * See also CIQ.ChartEngine#setCandleWidth.
     *
     * **Note**: if calling `setMaxTicks()` before `loadChart()`, and the chart will result in a candle width less than `minimumCandleWidth`, `loadChart()` will reset the candle size to the default candle size (8 pixels).
     *
     * @param ticks The number of ticks wide to set the chart.
     * @param [params] Parameters to use with this function.
     * @param params.padding Whitespace in pixels to add to the right of the chart.
     * 									Setting this field will home the chart to the most recent tick.
     * 									To home the chart without padding the right side with whitespace, set padding to 0.
     * 									Omitting the padding field will keep the chart scrolled to the same position.
     * @since 2015-11-1 Added `params` object.
     * @example
     * stxx.setMaxTicks(300);
     * stxx.home();	// home() is preferred over draw() in this case to ensure the chart is properly aligned to the right most edge.
     */
    public setMaxTicks(ticks: number, params?: {padding: number}): void
    /**
     * INJECTABLE
     *
     * This method initializes the chart container events, such as window `resize` events,
     * and the [resizeTimer]CIQ.ChartEngine#setResizeTimer to ensure the chart adjusts as its container size changes.
     * It also initializes various internal variables, the canvas and creates the chart panel.
     *
     * This is called by CIQ.ChartEngine#loadChart and should rarely be called directly.
     *
     * Note that the candle width will be reset to 8px if larger than 50px. Even if the value comes from a layout import.
     * This is done to ensure a reasonable candle size is available across devices that may have different screen size.
     *
     * @param [container] Node that contains the chart.
     *
     */
    public initializeChart(container?: HTMLElement): void
    /**
     * Clears out a chart engine instantiated with [new CIQ.ChartEngine()]CIQ.ChartEngine,
     * eliminating all references including the resizeTimer, quoteDriver, styles and eventListeners.
     *
     * It's still up to the developer to set the declared pointer for the instance to null so that the garbage collector can remove it.
     *
     * Please note that **this method will not remove the chart container or any elements within it, even if they were created by the engine**.
     * To do that, execute `stx.container.remove();` to remove the chartContainer DOM elements,
     * and then call this method to remove the chart engine itself. See example.
     *
     *
     * This method should only be used when you no longer need the chart engine and **never** be used in between CIQ.ChartEngine#loadChart calls to load or change symbols.
     * @example
     * // create
     * var stxx=new CIQ.ChartEngine({container: document.querySelector(".chartContainer")});
     *
     * // execute this line to remove the chart container <div> and its sub elements
     * stxx.container.remove();
     *
     * //destroy engine
     * stxx.destroy();
     *
     * //remove
     * stxx = null;
     */
    public destroy(): void
    /**
     * Call this before a resizing operation in order to maintain the scroll position. See CIQ.ChartEngine#postAdjustScroll.
     * @param  [chart] The chart to adjust. Otherwise adjusts the main symbol chart.
     */
    public preAdjustScroll(chart?: CIQ.ChartEngine.Chart): void
    /**
     * Call this after a resizing operation in order to maintain the scroll position. See CIQ.ChartEngine#preAdjustScroll.
     */
    public postAdjustScroll(): void
    /**
     * Translates the requested word to the active language if this.translationCallback callback function is set.
     *
     * Use CIQ.translatableTextNode if you are adding the element to the DOM and wish the translations services to automatically change to other languages as they are set.
     * @param  english The word to translate
     * @return			The translated word, or the word itself if no callback is set.
     */
    public translateIf(english: string): string
    /**
     * This method is used to prepare date fields for internal use. It will:
     * - convert dates to a JS Date in the timeZone set by [setTimeZone(dataZone)]CIQ.ChartEngine#setTimeZone.
     * - subsequently strip off the time portion on daily, weekly and monthly intervals.
     *
     * - If the date ('DT' or 'Date') does not include a time offset, such as 'yyyy-mm-dd',
     * no time zone conversion will be performed. Use this option if you prefer to display the same date on all timezones.
     * This applies to daily, weekly and monthly periodicities only.
     *
     * @param  quotes The quote array to be converted
     * @param  interval Interval of the quotes ("day", "week", etc).
     * @since
     * - 4.0.0
     * - 5.2.0 Used on intraday and daily quotes to also convert dates to the indicated `dataZone` as set by [setTimeZone(dataZone)]CIQ.ChartEngine#setTimeZone.
     */
    public doCleanupDates(quotes: any[], interval: string): void
    /**
     * If CIQ.ChartEngine#cleanupGaps is set, this method will insert bars in an array of quotes for those periods missing a record according to the market hours and the current periodicity.
     * See "CIQ.Market" for details on how to properly configure the library to your market hours requirements.
     *
     * This method will not be called for `tick` since by nature it is no a predictable interval.
     *
     * This method is automatically called if you are using a quoteFeed and have CIQ.ChartEngine#cleanupGaps set, but can be manually called if pushing or streaming data into the chart.
     *
     * This method will affect intraday and **underlying daily**  periods **only**. If the feed is already returning weekly and monthly data rolled up, the clean up will not be done ( see CIQ.ChartEngine#dontRoll ).
     *
     * See CIQ.ChartEngine#cleanupGaps, for more details.
     *
     * @param  quotes The quote array to be gap-filled
     * @param  [chart] Chart object to target.
     * @param [params] Parameters
     * @param [params.cleanupGaps] Pass this in to override the CIQ.ChartEngine#cleanupGaps value.
     * @param [params.noCleanupDates]		If true then dates have been cleaned up already by calling CIQ.ChartEngine#doCleanupDates, so do not do so in here.
     * @param [params.field]		Set to a field to fill gaps, or leave out to use chart.defaultPlotField.
     * @return The quote array with gaps filled in.
     * @since
     * - 07/01/2015 Now supports cleanups for daily intervals and foreign exchanges instead of just intraday equities.
     * - 3.0.7 Added `params.cleanupGaps` to allow developers to use this function standalone,
     * - 5.2.0 Added `params.noCleanupDates`.
     * - 6.0.0 Added `params.field`.
     * - 6.0.0 If `params.cleanupGaps` is true, use the value of `stxx.cleanupGaps`. If that's not set, then `cleanupGaps` is like carry.
     */
    public doCleanupGaps(
      quotes: any[],
      chart?: CIQ.ChartEngine.Chart,
      params?: {
        cleanupGaps?: string,
        noCleanupDates?: boolean,
        field?: string
      }
    ): any[]
    /**
     * Returns the panel for the given Y pixel. Used for instance to determine which panel the crosshairs are in.
     * @param  y Y pixel location
     * @return	  The panel containing the Y location. Null if the Y location is outside of all panels.
     */
    public whichPanel(y: number): CIQ.ChartEngine.Panel
    /**
     * Returns true if the panel exists
     * @param  name Name of panel to search for
     * @return	  True if the panel exists
     */
    public panelExists(name: string): boolean
    /**
     * Takes the existing panels and stores them in the layout.
     */
    public storePanels(): void
    /**
     * Saves the panel state in the layout. Called whenever there is a change to panel layout (resizing, opening, closing).
     * @param  saveLayout If false then a change event will not be called. See (@link CIQ.ChartEngine#changeOccurred)
     */
    public savePanels(saveLayout: boolean): void
    /**
     * Returns an array of plots (studies and renderers) situated within a given panel, not including the main series of the chart panel.
     * @param 	panel	The panel to check
     * @return	Plots which are in the panel
     * @since 7.1.0
     */
    public plotsInPanel(panel: CIQ.ChartEngine.Panel|string): any[]
    /**
     * Determines if a panel is empty of series and studies. If the panel is empty, remove the panel.
     *
     * @param panel The panel to check.
     * @param [dryRun] True to just return if it was an empty panel without actually
     * 		deleting it.
     * @param [exclude] Disregard anything in this array when checking for plots in
     * 		this panel.
     * @return False if the panel should still be displayed, true if panel is removed.
     *
     * @since
     * - 6.3.0
     * - 7.1.0 Added the `dryRun` and `exclude` parameters.
     */
    public checkForEmptyPanel(
      panel: CIQ.ChartEngine.Panel|string,
      dryRun?: boolean,
      exclude?: string|string[]
    ): boolean
    /**
     * INJECTABLE
     *
     * Closes the panel opened with CIQ.ChartEngine#createPanel.
     * This is called when a chart panel is closed manually or programmatically.
     * For example, after removing a study panel with the CIQ.Studies.removeStudy function, or when a user clicks on the "X" for a panel.
     * @param  panel The panel to close
     *
     */
    public panelClose(panel: CIQ.ChartEngine.Panel): void
    /**
     * Deletes all of the panels (except for the default chart panel)
     */
    public deleteAllPanels(): void
    /**
     * This moves a panel up one position (when the user clicks the up arrow).
     * @param  panel The panel to move up.
     */
    public panelUp(panel: CIQ.ChartEngine.Panel): void
    /**
     * This moves a panel down one position (when the user clicks the down arrow).
     * @param  panel The panel to move down.
     */
    public panelDown(panel: CIQ.ChartEngine.Panel): void
    /**
     * This "solos" the panel (when the user clicks the solo button). All panels other than this panel and the chart
     * are temporarily hidden. If the solo panel is the chart then all other panels will be hidden.
     * Note if CIQ.ChartEngine#soloPanelToFullScreen is set than even the chart panel may be hidden
     * @param  panel The panel to be soloed.
     */
    public panelSolo(panel: CIQ.ChartEngine.Panel): void
    /**
     * Determines whether a panel precedes the main chart in the display order.
     *
     * @param panel The panel for which the display order is determined.
     * @return true, if the panel is above the chart; false, if below or not available.
     *
     * @since 8.0.0
     */
    public isPanelAboveChart(panel: CIQ.ChartEngine.Panel): boolean
    /**
     * INJECTABLE
     *
     * Adjusts the positions of all of the panels. Ensures that panel percentages add up to 100%. Sets the panel top and bottom
     * based on the percentages. Also sets the icon template icons appropriately for each panel's position. And adjusts
     * any drawings. Finally it makes some calculations that are used by the y-axis.
     */
    public adjustPanelPositions(): void
    /**
     * INJECTABLE
     *
     * Creates a new panel and makes room for it by squeezing all the existing panels.
     * To remove a panel, manually call CIQ.ChartEngine#panelClose.
     *
     * @param display The display name for the panel.
     * @param name	The name of the panel (usually the study ID).
     * @param [height] Requested height of the panel in pixels. Defaults to 1/5 of the
     * 		screen size.
     * @param [chartName="chart"] The chart to associate with this panel.
     * @param [yAxis] CIQ.ChartEngine.YAxis object. If not present,
     * 		the existing panel's axis is used.
     * @param [noExport] If true, omits the panel from the
     * 		CIQ.ChartEngine#exportLayout function.
     * @return The panel just added.
     *
     * @since
     * - 5.2.0 Added the `yAxis` parameter.
     * - 7.1.0 Added the return value.
     * - 8.0.0 Added the `noExport` parameter.
     */
    public createPanel(
      display: string,
      name: string,
      height?: number,
      chartName?: string,
      yAxis?: CIQ.ChartEngine.YAxis,
      noExport?: boolean
    ): CIQ.ChartEngine.Panel
    /**
     * Changes the name, display and primary yAxis of a panel, and adjusts all references accordingly.
     * @param panel The panel
     * @param [params]
     * @param [params.name] Panel name, if omitted, name becomes a random string
     * @param [params.display] Panel display, defaults to the name
     * @param [params.yAxis] Panel's y-axis. If omitted, will use the panel's existing y-axis
     * @since 7.1.0
     */
    public modifyPanel(
      panel: CIQ.ChartEngine.Panel|string,
      params?: {
        name?: string,
        display?: string,
        yAxis?: CIQ.ChartEngine.YAxis
      }
    ): void
    /**
     * Changes the height of a panel, adjusting other panels accordingly.
     *
     * @param panelToModify The panel whose height is changed.
     * @param requestedHeight The new height in pixels of the panel.
     *
     * @since 8.0.0
     */
    public setPanelHeight(panelToModify: CIQ.ChartEngine.Panel, requestedHeight: number): void
    /**
     * Chooses a new study or renderer to be the "owner" of a panel. This affects the name of the panel as well as the main y-axis.
     * If no new owner can be found, panel is closed. Calls `modifyPanel`.
     *
     * @param panel The panel that contains the study or renderer.
     * @param [yAxisHint] Optional y-axis from which to try to elect a new panel owner.
     * @return The new name of the panel.
     * @since
     * - 7.1.0
     * - 7.2.0 Added the `yAxisHint` argument.
     */
    public electNewPanelOwner(
      panel: CIQ.ChartEngine.Panel|string,
      yAxisHint?: CIQ.ChartEngine.YAxis
    ): string
    /**
     * INJECTABLE
     *
     * Adds a panel with a prespecified percentage. This should be called iteratively when rebuilding a set
     * of panels from a previous layout. Use CIQ.ChartEngine#createPanel when creating a new panel for an existing chart layout.
     * @param  display	  The display name for the panel
     * @param  name	  The name of the panel (usually the study ID)
     * @param  percent	  The percentage of chart to use
     * @param  [chartName] The chart to associate with this panel. Defaults to "chart".
     * @param [yAxis] CIQ.ChartEngine.YAxis object. If not present, the existing panel's axis will be used.
     * @since 5.2.0 Added `yAxis` paremeter.
     */
    public stackPanel(
      display: string,
      name: string,
      percent: number,
      chartName?: string,
      yAxis?: CIQ.ChartEngine.YAxis
    ): void
    /**
     * INJECTABLE
     * <span class="animation">Animation Loop</span>
     *
     * Draws the panels for the chart and chart studies. CSS style stx_panel_border can be modified to change the color
     * or width of the panel dividers.
     */
    public drawPanels(): void
    /**
     * INJECTABLE
     *
     * Sets the data granularity (periodicity) and displays the resulting chart.
     *
     * Dispatches a "periodicity" event.
     *
     * If a quote feed has been attached to the chart (see CIQ.ChartEngine#attachQuoteFeed), it will be called to get the new data, otherwise this.dataCallback will
     * be called in an effort to fetch new data. See CIQ.ChartEngine#dataCallback. If neither one is set and new data is needed, the function will fail.
     *
     * This function can be called together with `loadChart()` by setting the proper parameter values. See example in this section and CIQ.ChartEngine#loadChart for more details and compatibility with your current version.
     *
     * This function will not set how much data you want the chart to show on the screen; for that you can use CIQ.ChartEngine#setRange or CIQ.ChartEngine#setSpan.
     *
     * The kernel is capable of deriving weekly and monthly charts by rolling-up daily data. Set CIQ.ChartEngine#dontRoll to true to bypass this
     * functionality if you have raw week and month data in the masterData.
     *
     * It is important to note that by default the weekly roll-ups start on Sunday unless a market definition exists to indicate Sunday is not a market day,
     * then they are shifted to the next market day. Instructions to set a market for the chart can be found here: CIQ.Market
     *
     * A full tutorial on periodicity and roll-up can be found [here]{@tutorial Periodicity}.
     *
     * **See CIQ.ChartEngine#createDataSet for additional details on the roll-up process including important notes on rolling-up data with gaps.**
     *
     * **Note on 'tick' timeUnit:**<BR>
     * When using 'tick', please note that this is not a time based display, as such, there is no way to predict what the time for the next tick will be.
     * It can come a second later, a minute later or even more depending on how active a particular instrument may be.
     * If using the future tick functionality ( CIQ.ChartEngine.XAxis#futureTicks ) when in 'tick' mode, the library uses a pre-defined number (  CIQ.ChartEngine.XAxis#futureTicksInterval )for deciding what time interval to use for future ticks.
     * See below example on how to override this default.
     *
     * It is important to note that rollups for ‘ticks’ are based on **count** rather than time.
     * For example: `setPeriodicity({period:5, interval:1, timeUnit:"tick”})` will create a new bar every **5 ticks** rather than every **5 minutes**.
     *
     * Since many ticks can have the exact same timestamp, ticks never get replaced or augmented. As such, if a new tick is provided with a timestamp in the past, even if a record with the exact same date already exists, a new tick will be inserted to the masterData at the proper location rather than one replaced.
     *
     * Lastly, you cannot set an interval for `tick`; as that would not translate into a valid periodicity. If inadvertently set, the engine will "clean it up" (much the same way as if you tried `{period:1, interval:5, timeUnit:"day"}` ).
     *
     * **Note on internal periodicity storage:**<BR>
     * The provided parameters will be translated into internal format and stored in the CIQ.ChartEngine#layout object.
     * Internal format in the layout object **will not match the parameters** used in ​setPeriodicity.
     * Use CIQ.ChartEngine#getPeriodicity to extract internal periodicity into the expected external format.
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
     * // each bar on the screen will represent 5 ticks (combining 5 tick objects from your server)
     * stxx.setPeriodicity({period:5, timeUnit:"tick"}, function(err){});
     *
     * @example
     * // each bar on the screen will represent 1 day. MasterData elements will represent one day each.
     * stxx.setPeriodicity({period:1, timeUnit:"day"}, function(err){});
     *
     * @example
     * // this sets the periodicity to 5 minute bars when loadChart is called
     * stxx.loadChart(newSymbol, {
     * 	// this parameter will cause loadChart to call setSpan with these parameters
     * 	span: {base: 'day', multiplier: 2},
     * 	// this parameter will cause loadChart to call setPeriodicity with these parameters
     * 	periodicity: {period: 1, timeUnit: "minute", interval: 5}
     * }, finishedLoadingChart(stxx.chart.symbol, newSymbol));
     *
     * @example
     * //How to override stxx.chart.xAxis.futureTicksInterval when in 'tick' mode:
     * var stxx=new CIQ.ChartEngine({container:document.querySelector(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
     * stxx.chart.xAxis.futureTicksInterval=1; // to set to 1 minute, for example
     *
     * @param params periodicity arguments
     * @param params.period The number of elements from masterData to roll-up together into one data point on the chart (candle,bar, etc). If set to 30 in a candle chart, for example, each candle will represent 30 raw elements of `interval/timeUnit` type.
     * @param [params.interval] Further qualifies pre-rolled details of intra-day `timeUnits` ("millisecond","second","minute") and will be converted to “1” if used with "day", "week" or  "month" 'timeUnit'. Some feeds provide data that is already rolled up. For example, there may be a feed that provides 5 minute bars. To let the chart know you want that 5-minute bar from your feed instead of having the chart get individual 1 minute bars and roll them up, you would set the `interval` to '5' and `timeUnit` to 'minute'
     * @param [params.timeUnit] Type of data requested. Valid values are "millisecond","second","minute","day","week", "month" or 'tick'. If not set, will default to "minute". **"hour" is NOT a valid timeUnit. Use `timeUnit:"minute", interval:60` instead**
     * @param [cb] Callback after periodicity is changed. First parameter of callback will be null unless there was an error.
     * @since
     * - 3.0.0 Replaces CIQ.ChartEngine#setPeriodicityV2.
     * - 4.0.0 Now uses CIQ.ChartEngine#needDifferentData to determine if new data should be fetched.
     * - 6.3.0 Now only homes chart if new data was fetched.
     * - 8.1.0 Dispatches a "periodicity" event. See also
     * 		[periodicityEventListener]CIQ.ChartEngine~periodicityEventListener.
     */
    public setPeriodicity(
      params: {
        period: number,
        interval?: number,
        timeUnit?: string
      },
      cb?: Function
    ): void
    /**
     * Returns true if the chart needs new data to conform with the new periodicity.
     * @param newPeriodicity			newPeriodicity. See CIQ.ChartEngine#setPeriodicity
     * @param newPeriodicity.period 	`period` as required by CIQ.ChartEngine#setPeriodicity
     * @param newPeriodicity.interval 	`interval` as required by CIQ.ChartEngine#setPeriodicity
     * @param newPeriodicity.timeUnit 	`timeUnit` as required by CIQ.ChartEngine#setPeriodicity
     * @return True if the cart needs data in a new periodicity
     * @since 4.0.0
     */
    public needDifferentData(
      newPeriodicity: {
        period: number,
        interval: string,
        timeUnit: string
      }
    ): boolean
    /**
     * Returns the current periodicity of the chart in the format required by
     * CIQ.ChartEngine#setPeriodicity.
     *
     * @returns An object literal containing the properties
     * that define the periodicity: `period`, `interval`, and `timeUnit`; for example,
     * `{period: 2, interval: 5, timeUnit: "minute"}`.
     *
     * @since 7.5.0
     *
     * @see [Periodicity Tutorial]{@tutorial Periodicity}
     */
    public getPeriodicity(): CIQ.ChartEngine.PeriodicityParameters
    /**
     * Whether the chart is scrolled to a home position.
     *
     * @returns true when the scroll position shows the last tick of the dataSet
     * @since 2016-06-21
     */
    public isHome(): boolean
    /**
     * Finds the previous element before dataSegment[bar] in the dataSet which has data for field
     * @param chart An instance of CIQ.ChartEngine.Chart
     * @param field The field to check for data
     * @param bar The index into the dataSegment
     * @return dataSet element which has data
     * @since 4.0.0
     */
    public getPreviousBar(chart: CIQ.ChartEngine.Chart, field: string, bar: number): object
    /**
     * Finds the next element after dataSegment[bar] in the dataSet which has data for field
     * @param chart An instance of CIQ.ChartEngine.Chart
     * @param field The field to check for data
     * @param bar The index into the dataSegment
     * @return dataSet element which has data
     * @since 4.0.0
     */
    public getNextBar(chart: CIQ.ChartEngine.Chart, field: string, bar: number): object
    /**
     * Returns the first or last record in a quotes array (e.g. masterData, dataSet) containing the requested field.
     * If no record is found, will return null
     * @param  data	  quotes array in which to search
     * @param  field	  field to search for
     * @param  [last] Switch to reverse direction; default is to find the first record.  Set to true to find the last record.
     * @return The found record, or null if not found
     * @since 5.2.0
     */
    public getFirstLastDataRecord(data: any[], field: string, last?: boolean): object
    /**
     * Returns the tick position of the leftmost position on the chart.
     * @return The tick for the leftmost position
     */
    public leftTick(): number
    /**
     * Convenience function returns the next or previous interval from the provided date-time at the current chart's periodicity.
     * See CIQ.Market and CIQ.Market.Iterator for more details.
     *
     * For 'tick' intervals, since there is no predictable periodicity, the next interval will be determined by CIQ.ChartEngine.XAxis#futureTicksInterval
     * @param 		DT			A JavaScript Date representing the base time for the request in CIQ.ChartEngine#dataZone timezone.
     * @param		[period]		The number of periods to jump. Defaults to 1. Can be negative to go back in time.
     * @param		[useDataZone=true] By default the next interval will be returned in CIQ.ChartEngine#dataZone. Set to false to receive a date in CIQ.ChartEngine#displayZone instead.
     * @return	 The next interval date
     */
    public getNextInterval(DT: Date, period?: number, useDataZone?: boolean): Date
    /**
     * Convenience function returns a new market iterator at the current chart's periodicity.
     * For 'tick' intervals, since there is no predictable periodicity, the iterator interval will be determined by CIQ.ChartEngine.XAxis#futureTicksInterval
     * See CIQ.Market and CIQ.Market.Iterator for more details.
     * @param		begin A JavaScript Date representing the iterator begin date in CIQ.ChartEngine#dataZone timezone. See CIQ.Market#newIterator for details.
     * @param 		[outZone] A valid timezone from the timeZoneData.js library. This should represent the time zone for the returned date. Defaults CIQ.ChartEngine#dataZone. See CIQ.Market#newIterator for details.
     * @param 	[chart] The chart object.
     * @return A new iterator.
     */
    public standardMarketIterator(begin: Date, outZone?: string, chart?: CIQ.ChartEngine.Chart): object
    /**
     * INJECTABLE
     * <span class="animation">Animation Loop</span>
     *
     * This is the main rendering function in the animation loop. It draws the chart including panels, axis, and drawings.
     * This method is called continually as a user pans or zooms the chart.
     * This would be a typical place to put an injection to add behavior to the chart after a drawing operation is complete.
     */
    public draw(): void
    /**
     * Adds a series renderer to the chart. A series renderer manages a group of series that are
     * rendered on the chart in the same manner. For instance, several series which are part of the
     * same stacked histogram:
     *
     * <iframe width="100%" height="500" scrolling="no" seamless="seamless" align="top"
     *     style="float:top"
     *     src="https://jsfiddle.net/chartiq/rb423n71/embedded/result,js,html/"
     *     allowfullscreen="allowfullscreen" frameborder="1">
     * </iframe>
     *
     * You must manage the persistency of a renderer and remove individual series
     * (CIQ.Renderer#removeSeries), remove all series (CIQ.Renderer#removeAllSeries),
     * or even delete the renderer (CIQ.ChartEngine#removeSeriesRenderer) as needed by your
     * application.
     *
     * **Note:** Once a renderer is set for a chart, it remains loaded with its series definitions
     * and y-axis (if one is used) even if a new symbol is loaded. Calling `setSeriesRenderer` again
     * with the same renderer name just returns the previously created renderer. **Be careful not to
     * send a different y&#8209;axis object unless you have deleted the previous one by completely
     * removing all of its associated series** (see CIQ.Renderer#removeAllSeries). Failure to
     * do this will cause multiple axes to be displayed, causing the original one to become orphaned.
     *
     * @param renderer The series renderer to add to the chart.
     * @return The renderer added to the chart by this function or, if the chart
     * 		already has a renderer of the same name, a reference to that renderer.
     *
     * @since 07/01/2015
     *
     * @see CIQ.Renderer
     * @see CIQ.ChartEngine#removeSeriesRenderer for release functionality
     * @see CIQ.ChartEngine#addSeries for additional implementation examples
     *
     * @example
     * // Group the series together and select "line" as the rendering type to display the series.
     * const mdataRenderer = stxx
     *     .setSeriesRenderer(
     *         new CIQ.Renderer.Lines({
     *             params: {
     *                 name: "My Line Series",
     *                 type: "line",
     *                 width: 4,
     *                 callback: mdataLegend
     *             }
     *          })
     *     )
     *     .removeAllSeries()
     *     .attachSeries(symbol1, { color: "red", permanent: true })
     *     .attachSeries(symbol2, "blue")
     *     .attachSeries(symbol3, "yellow")
     *     .ready()
     */
    public setSeriesRenderer(renderer: CIQ.Renderer): CIQ.Renderer
    /**
     * Detaches a series renderer from the chart and deletes its associated y-axis if no longer used by any other renderer.
     *
     * Note: the actual series and related data are not deleted with this command and can be attached or continue to be used with other renderers.
     *
     * Note: the actual renderer (created by using new `CIQ.Renderer.xxxxx`) is not deleted but simply detached from the chart. You can re-attach it again if needed.
     * To delete the renderer use `delete myRenderer`. See example in CIQ.Renderer.Lines
     *
     * @param  renderer The actual renderer instance to be removed
     * @since 07/01/2015
     */
    public removeSeriesRenderer(renderer: object): void
    /**
     * Retrieves a series renderer from the chart
     * @param  name Handle to access the renderer (params.name)
     * @return the matching series renderer if found
     * @since 07/01/2015
     */
    public getSeriesRenderer(name: string): object
    /**
     * Returns the first renderer found that contains a series, or null if not found.
     *
     * @param seriesId ID of the series to find.
     * @return The matching series renderer if found.
     * @since 7.3.0
     */
    public getRendererFromSeries(seriesId: string): object
    /**
     * Initializes boundary clipping on the requested panel. Use this when you are drawing on the canvas and wish for the
     * drawing to be contained within the panel. You must call CIQ.ChartEngine#endClip when your drawing functions are complete.
     * @param  [panelName] The name of the panel. Defaults to the chart itself.
     * @param [allowYAxis=false] If true then the clipping region will include the y-axis. By default the clipping region ends at the y-axis.
     */
    public startClip(panelName?: string, allowYAxis?: boolean): void
    /**
     * Completes a bounded clipping operation. See CIQ.ChartEngine#startClip.
     */
    public endClip(): void
    /**
     * Sets the line style for the main chart.
     *
     * Applies to the CIQ.Renderer.Lines renderer only.
     *
     * @param [obj] Parameters object or color string (see `obj.color`).
     * @param [obj.color] A color to use for the line plot. Must be an RGB, RGBA, or three-
     * 		or six&#8209;digit hexadecimal color number or
     * 		<a href="https://developer.mozilla.org/en-US/docs/Web/CSS/color_value" target="_blank">
     * 		CSS color keyword</a>; for example, "rgb(0, 255, 0)", "rgba(0, 255, 0, 0.5)",
     * 		"#0f0", "#00FF00", or "lime". Alternatively, `obj` can be set to a color string directly
     * 		if no other parameters are needed.
     * @param [obj.pattern] Pattern to use as an alternative to a solid line for the
     * 		line plot. Valid string values are "solid", "dotted" and "dashed". Arrays specify the
     * 		sequence of drawn pixels and blank pixels as alternating elements starting at index 0; for
     * 		example, [1, 2, 3, 2] specifies a line containing one drawn pixel followed by two blank
     * 		pixels followed by three drawn pixels followed by two more blank pixels, then the pattern
     * 		repeats.
     * @param [obj.width] Width of the line plot.
     * @param [obj.baseColor] Color to use for the base of a mountain chart. Must be an RGB,
     * 		RGBA, or three- or six&#8209;digit hexadecimal color number or CSS color keyword (see
     * 		`obj.color`).
     * @param [target=this.chart] Target to which
     * 		the line style is attached.
     *
     * @since
     * - 4.0.0
     * - 8.2.0 Added `obj.baseColor` parameter.
     *
     * @example <caption>Set the line color, pattern, and width.</caption>
     * stxx.setLineStyle({ color: "rgb(127, 127, 127)", pattern: "dashed", width: 3 });
     *
     * @example <caption>Set the line color using a color keyword.</caption>
     * stxx.setLineStyle("blue");
     */
    public setLineStyle(
      obj?: {
        color?: string,
        pattern?: number[]|string,
        width?: number,
        baseColor?: string
      },
      target?: CIQ.ChartEngine.Chart|CIQ.Studies.StudyDescriptor
    ): void
    /**
     * Sets the style for 'gap-filling'.
     *
     * A gap is an area on a line type rendering ( mountain, baseline, step, etc) where the value for the plotted field is null, undefined, or missing.
     *
     * This method can be used to instruct the chart how to fill gaps created on the chart when missing data is present in series.
     * Creates a gap filling style object for lines which can be used with any API call requiring a gap object.
     * It can be used as a general style for the entire chart, as way to configure just the primary series, or when adding series with CIQ.ChartEngine#addSeries
     *
     * The gap object, called `gaplines` will be attached to the `target` passed in, or will set the the primary chart's gap style if to target is provided.
     * Valid styles include a boolean, a color string, or an object containing color and pattern information.
     *
     * When passing in a boolean value:
     * - `true` will indicate that the target object should continue to draw lines over the gaps in your chart.
     * - `false` will indicate that the target object should treat the color as transparent, and not draw lines over the gaps.
     *
     * It is important to note that this is NOT the same as filling the missing values with actual data. It merely describes how the chart displays the gaps.
     *
     * This should be used instead of setting CIQ.ChartEngine.Chart#gaplines directly.
     *
     * A gap is an area on a line type rendering ( mountain, baseline, step, etc) where the value for the plotted field is null, undefined, or missing.
     * @param  [obj|boolean|string]	Value for gap lines.
     * @param [obj.color] A color on the canvas palette to use for gap plot. Alternatively, obj may be set to the color string directly if no other parameters are needed.
     * @param [obj.pattern] Pattern to use as alternative to solid line for gap plot, in array format, e.g. [1,2,3,2].
     * @param [obj.width] Line width for gap plot, in pixels
     * @param [obj.fillMountain] Set to true to fill the gaps in a mountain chart with the gap color.  Otherwise the mountain chart is filled in with its default color.
     * @param  [target=this.chart] Target to attach `gaplines` object to.  If none provided it defaults to CIQ.ChartEngine.Chart.
     * @since
     * - 4.0.0
     * - 6.2.3 Now accepts any valid parameter of `chart.gaplines` (boolean, color string, or color object).
     * @example
     * // shorthand if just setting a color as the the default style for the chart gaps
     * stxx.setGapLines("blue");
     * @example
     * // the following will set stxx.chart.gaplines with color, pattern and width for the chart gaps
     * stxx.setGapLines({color:"transparent",pattern:[1,2],width:3,fillMountain:true});
     * @example
     * // the following will set objectTarget.gaplines
     * stxx.setGapLines({color:"transparent",pattern:[1,2],width:3,fillMountain:true,target:objectTarget});
     * @example
     * // shorthand for setting gaps to transparent
     * stxx.setGapLines(false)
     *
     * // shorthand for setting gaps to the color of your line or mountain chart
     * stxx.setGapLines(true)
     *
     */
    public setGapLines(
      obj?: {
        color?: string,
        pattern?: any[],
        width?: number,
        fillMountain?: boolean
      },
      target?: object
    ): void
    /**
     * Animation Loop
     *
     * Draws a single frame of a line chart.
     *
     * This method should rarely if ever be called directly.
     * Use CIQ.Renderer.Lines,  CIQ.ChartEngine#setChartType or CIQ.ChartEngine#addSeries instead.
     *
     * Any parameters from CIQ.Renderer#attachSeries or CIQ.ChartEngine#addSeries
     * will be passed on to this method and are valid when directly calling it from within a [study display function of a Custom Study]{@tutorial Using and Customizing Studies - Creating New Studies}.
     *
     * Uses CSS style `stx_line_chart` to control width and color of line charts, unless `params` are set.
     *
     * The default color function for the colored line chart uses the following CSS styles:
     * - `stx_line_up`		- Color of the uptick portion of the line
     * - `stx_line_down`	- Color of the downtick portion of the line
     *
     * @param  panel The panel on which to draw the line chart
     * @param  style	The style selector which contains the styling for the bar (width and color)
     * @param  [colorFunction]	A function which accepts an CIQ.ChartEngine and quote as its arguments and returns the appropriate color for drawing that mode.
     Returning a null will skip that bar.  If not passed as an argument, will use a default color.
     * @param  [params]	Listing of parameters to use when plotting the line chart.
     * @param [params.skipTransform] If true then any transformations (such as comparison charting) will not be applied
     * @param [params.label] If true then the y-axis will be marked with the value of the right-hand intercept of the line
     * @param [params.noSlopes] If set then chart will draw horizontal bars with no vertical lines.
     * @param [params.step] If set then chart will resemble a step chart.  Horizontal lines will begin at the center of the bar.
     * @param [params.tension] Tension for splining.
     * @param [params.highlight] If set then line will be twice as wide.
     * @param [params.color] The color for the line. Defaults to CSS style
     * @param [params.pattern] The pattern for the line ("solid","dashed","dotted"). Defaults to CSS style
     * @param [params.width] The width in pixels for the line. Defaults to CSS style
     * @param [params.gapDisplayStyle] Gap object as created by CIQ.ChartEngine#setGapLines. If not set `chart.gaplines` will be used.
     * @param [params.labelDecimalPlaces] Specifies the number of decimal places to print on the label. If not set then it will match the y-axis.
     * @param [params.returnObject] Set to true for return value of the function to be object as described in doc below, otherwise returns only array of colors used.
     * @return Data generated by the plot, such as colors used if a colorFunction was passed, and the vertices of the line (points).
     * @since
     * - 15-07-01 Changed signature from `chart` to `panel`.
     * - 3.0.0 Added `params`.
     * - 5.2.0 `params.gaps` has been deprecated and replaced with `params.gapDisplayStyle`.
     * - 6.0.0 `params.gapDisplayStyle` can be set to false to suppress all gap drawing.
     */
    public drawLineChart(
      panel: CIQ.ChartEngine.Panel,
      style: string,
      colorFunction?: Function,
      params?: {
        skipTransform?: boolean,
        label?: boolean,
        noSlopes?: boolean,
        step?: boolean,
        tension?: number,
        highlight?: boolean,
        color?: string,
        pattern?: string,
        width?: number,
        gapDisplayStyle?: object,
        labelDecimalPlaces?: boolean,
        returnObject?: boolean
      }
    ): object
    /**
     * Animation Loop
     *
     * Draws a channel chart, shading the areas between a high and the close and between a low and the close.
     *
     * The high, low, and close can be redefined to other fields within the parameters.
     *
     * This method should rarely if ever be called directly. Use CIQ.Renderer.Lines or CIQ.ChartEngine#setChartType instead.
     *
     * Any parameters from CIQ.Renderer#attachSeries or CIQ.ChartEngine#addSeries
     * will be passed on to this method and are valid when directly calling it from within a [study display function of a Custom Study]{@tutorial Using and Customizing Studies - Creating New Studies}.
     *
     * The high line, low line, and respective shading are controlled by the following styles, unless overridden in the `params`:
     * - `stx_channel_up` - Color of the high line and shading.
     * - `stx_channel_down`	- Color of the low line and shading.
     * The close line color as well as all of the line widths are controlled by the style `stx_line_chart`, unless `params` are set.
     *
     * @param panel The panel on which to draw the line chart.
     * @param [colorFunction] A function that accepts a `CIQ.ChartEngine` and quote as its arguments and returns the appropriate color for drawing that mode.
     * Returning a null skips that bar. If not passed as an argument, uses a default color.
     * @param [params]	Listing of parameters to use when plotting the channel chart.
     * @param [params.skipTransform] If true, any transformations (such as comparison charting) are applied.
     * @param [params.label] If true, the y-axis is marked with the value of the right-hand intercept of the line.
     * @param [params.noSlopes] If set, the chart will draw horizontal bars with no vertical lines.
     * @param [params.step] If set, the chart will resemble a step chart. Horizontal lines will begin at the center of the bar.
     * @param [params.tension] Tension for splining.
     * @param [params.highlight] If set, lines are twice as wide.
     * @param [params.color] The color for the close line. Defaults to CSS style.
     * @param [params.border_color_down] The color for the high line. Defaults to CSS style.
     * @param [params.border_color_up] The color for the low line. Defaults to CSS style.
     * @param [params.pattern] The pattern for the line ("solid","dashed","dotted"). Defaults to CSS style.
     * @param [params.width] The width in pixels for the line. Defaults to CSS style.
     * @param [params.gapDisplayStyle] Gap object as created by CIQ.ChartEngine#setGapLines. If not set `chart.gaplines` is used.
     * @param [params.labelDecimalPlaces] Specifies the number of decimal places to print on the label. If not set, it will match the y-axis.
     * @param  [params.style] The style selector, which contains the styling for the lines (width and color).
     * @param [params.returnObject] Set to true for return value of the function to be object as described below, otherwise returns only array of colors used.
     * @return Data generated by the plot, such as colors used if a `colorFunction` was passed, and the vertices of the close line (points).
     * @since 7.3.0
     */
    public drawChannelChart(
      panel: CIQ.ChartEngine.Panel,
      colorFunction?: Function,
      params?: {
        skipTransform?: boolean,
        label?: boolean,
        noSlopes?: boolean,
        step?: boolean,
        tension?: number,
        highlight?: boolean,
        color?: string,
        border_color_down?: string,
        border_color_up?: string,
        pattern?: string,
        width?: number,
        gapDisplayStyle?: object,
        labelDecimalPlaces?: boolean,
        style?: string,
        returnObject?: boolean
      }
    ): object
    /**
     * Draws a series of connected lines on the canvas. The points are in a straight array for compactness. This is used
     * for instance in the freeform (doodle) drawing tool
     * @param  points		  A series of points in the pattern x0,y0,x1,y1
     * @param  color		   Either a color or a Styles object as returned from CIQ.ChartEngine#canvasStyle
     * @param  type		   The type of line to draw ("segment","ray" or "line")
     * @param  [context]		The canvas context. Defaults to the standard context.
     * @param  [confineToPanel] Panel the line should be drawn in, and not cross through. Or set to 'true' to confine to the main chart panel.
     * @param  [parameters]	 Additional parameters to describe the line
     * @param [parameters.pattern] The pattern for the line ("solid","dashed","dotted")
     * @param [parameters.width] The width in pixels for the line
     * @param [parameters.opacity] Opacity for the line
     */
    public connectTheDots(
      points: any[],
      color: string,
      type: string,
      context?: CanvasRenderingContext2D,
      confineToPanel?: object,
      parameters?: {
        pattern?: string,
        width?: number,
        opacity?: number
      }
    ): void
    /**
     * Draws a series of points and splines (smooths the curve) those points.
     *
     * This is uses for drawings, not series.
     * @param  points		  A series of points in the pattern x0,y0,x1,y1
     * @param tension Spline tension (0-1). Set to negative to not spline.
     * @param  color		   Either a color or a Styles object as returned from CIQ.ChartEngine#canvasStyle
     * @param  type		   The type of line to draw ("segment","ray" or "line")
     * @param  [context]		The canvas context. Defaults to the standard context.
     * @param  [confineToPanel] Not currently implemented
     * @param  [parameters]	 Additional parameters to describe the line
     * @param [parameters.pattern] The pattern for the line ("solid","dashed","dotted")
     * @param [parameters.width] The width in pixels for the line
     * @param [parameters.opacity] Opacity for the line
     */
    public plotSpline(
      points: any[],
      tension: number,
      color: string,
      type: string,
      context?: CanvasRenderingContext2D,
      confineToPanel?: string,
      parameters?: {
        pattern?: string,
        width?: number,
        opacity?: number
      }
    ): void
    /**
     * Creates watermarked text on the canvas.
     *
     * See CIQ.ChartEngine#watermark to create a watermark relative to a particular panel.
     *
     * CSS style stx_watermark defines the watermark (opacity of .5 is automatically applied)
     *
     * **Note** that the watermark will not persist unless called from within the animation loop (study display function, for example).
     * As such, it may be necessary to use a `prepend` to the `draw` function to create persistence. See example section.
     * @param  context [description]
     * @param  x		X position on canvas
     * @param  y		Y position on canvas
     * @param  text	The text to watermark
     * @example
     CIQ.ChartEngine.prototype.prepend("draw",function(){
     // create persistence by forcing it  be called in every animation frame.
     rawWatermark(stxx.chart.context,20,30,stxx.chart.symbol);
     });
     */
    public rawWatermark(
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      text: string
    ): void
    /**
     * Creates watermarked text relative to a panel on the canvas.
     *
     * Uses CSS style `stx_watermark` to set the text size and color.
     *
     * **Note** The watermark does not persist unless called from within the animation loop (study display function,
     * for example). As such, it may be necessary to use a `prepend` to the `draw` function to create persistence.
     * See example section.
     *
     * @param panel The name of the panel.
     * @param [config] Parameters for the request.
     * @param [config.h] Specifies horizontal placement of the watermark — "left", "right", or "center".
     * @param [config.v] Specifies vertical placement of the watermark &mdash "top", "bottom", or "middle".
     * @param [config.text] The text of the watermark.
     * @param [config.hOffset]	Horizontal offset in pixels of the upper left corner of the watermark from the
     * 		left or right margin.
     * @param [config.vOffset]	Vertical offset in pixels of the upper left corner of the watermark from the
     * 		top or bottom margin.
     * @param [config.context] The drawing canvas context. If omitted,
     * 		`this.chart.context` is used.
     * @example
     CIQ.ChartEngine.prototype.prepend("draw",function(){
     // create persistence by forcing it  be called in every animation frame.
     stxx.watermark("chart",{h:"center",v:"middle",text:stxx.chart.symbol});
     });
     * @since 7.4.0 Added the `config.context` parameter.
     */
    public watermark(
      panel: string,
      config?: {
        h?: string,
        v?: string,
        text?: string,
        hOffset?: string,
        vOffset?: string,
        context?: CanvasRenderingContext2D
      }
    ): void
    /**
     * Displays errors on the center bottom of the canvas.
     *
     * In the event that there are multiple errors (caused by calling the method multiple times), they will get vertically stacked.
     *
     * **Note**: Because `displayErrorAsWatermark` leverages CIQ.ChartEngine#watermark to draw errors on the canvas,
     * the errors will not persist unless added from within the animation loop. See CIQ.ChartEngine#watermark for more info.
     *
     * @param panelKey The name of the panel
     * @param error The error text to draw on the canvas
     * @since 7.3.0
     */
    public displayErrorAsWatermark(panelKey: string, error: string): void
    /**
     * INJECTABLE
     * <span class="animation">Animation Loop</span>
     *
     * Displays the chart by calling the appropriate rendering functions based on the <a href="CIQ.ChartEngine.html#layout%5B%60chartType%60%5D">CIQ.ChartEngine.layout.chartType</a>.
     *
     * @param  chart The chart to render
     * @since
     * - 4.0.0 If no Open price is available, a candle will draw as a dash at the Close price.
     * - 5.1.0 Reduced to injections only for backwards compatibility, main chart is drawn with renderers now.
     */
    public displayChart(chart: CIQ.ChartEngine.Chart): void
    /**
     * Clones a style from a style object (obtained from getComputedStyle). Any styles are converted to camel case. This method automatically
     * converts from browsers that store styles as numeric arrays rather than as property objects.
     * @param  styleObject A style object derived from getComputedStyle
     * @return	A new style object that will match properties
     */
    public cloneStyle(styleObject: object): object
    /**
     * Returns an object containing the class style given a css class name (used by plotLine() for instance).
     *
     * A caching mechanism is used for performance.
     * If styles are changed dynamically then use CIQ.ChartEngine#clearStyles to reset.
     *
     * Alse see CIQ.ChartEngine#setStyle.
     *
     * @param  className The CSS class name to get the styles
     * @return			  An object containing each style, in camel case.
     */
    public canvasStyle(className: string): object
    /**
     * Detects if a string is a valid CSS color and if so returns that string.
     *
     * Otherwise it returns a style object, assuming that the string is a classname.
     * @param  str Either a color or a className
     * @return		Either the color or a class object
     */
    public colorOrStyle(str: string): object
    /**
     * Convenience method to programmatically set or change a style used by a chart **canvas** element.
     *
     * Canvas styling using this method is limited to color and font attributes.
     *
     * See CIQ.ChartEngine#canvasFont for important details on proper style setting for fonts.
     *
     * To see immediate results, call CIQ.ChartEngine#draw once this method is used.
     *
     * Primarily used in the CIQ.ThemeHelper to programmatically override defaults CSS colors to create custom themes.
     *
     * This method **will not affect HTML containers** directly referencing a CSS style; such as menu items or [chart controls]CIQ.ChartEngine.htmlControls.
     * Those will need to be managed by the CSS, or via javaScrit directly altering the container's style object.
     * For example, the crosshair y axis floating label is a canvas drawings generated by the CIQ.ChartEngine#createYAxisLabel canvas rendering function,
     * so you can do something like this:
     * - `stxx.setStyle("stx-float-price", "color", "red");`
     *
     * But the crosshair x axis floating label is an html div container part of the [chart controls]CIQ.ChartEngine.htmlControls.
     * So this will require something like this instead:
     * - `stxx.controls.floatDate.style.color='red';`
     *
     * For more details on customizing colors in the chart see {@tutorial Chart Styles and Types}. Also see  CIQ.ChartEngine#clearStyles
     *
     * @param  obj The object whose style you wish to change (stx_grid, stx_xaxis, etc)
     * @param  attribute The style name of the object you wish to change. It will accept hyphenated or camel case formats.
     * @param  value The value to assign to the attribute
     * @example
     * stxx.setStyle("stx_candle_up","borderLeftColor","green");
     * stxx.setStyle("stx_candle_down","borderLeftColor","red");
     * stxx.draw();
     * @example
     * stxx.setStyle("stx_yaxis", "fontFamily", "Arial");
     * stxx.setStyle("stx_xaxis", "fontFamily", "Arial");
     * stxx.setStyle("stx_yaxis", "fontSize", "15px");
     * stxx.setStyle("stx_xaxis", "fontSize", "15px");
     */
    public setStyle(obj: string, attribute: string, value: string): void
    /**
     * Sets font for the canvas, given a css class name.
     *
     * Call this before drawing on the canvas.
     *
     * The canvas font will be set using the CSS `font-style` + `font-weight` + `font-size` + `font-family`.
     *
     * **Note** that the canvas font will use the `font-family` CSS property, **NOT** the combined `font` CSS property.
     * Be aware of this when using CIQ.ChartEngine#setStyle
     *
     * @param  className The name of the CSS class to pull font from
     * @param  ctx		 An HTML Context
     */
    public canvasFont(className: string, ctx: CanvasRenderingContext2D): void
    /**
     * Sets color and globalAlpha (opacity) for the canvas, given a css class name.
     *
     * Call this before drawing on the canvas.
     *
     * Also see CIQ.ChartEngine#setStyle.
     *
     * @param  className A CSS style. Supports "color" and "opacity"
     * @param  [ctx]	   An HTML Context
     * @example
     * stxx.canvasColor("myStyle");
     * @since 4.0.0 Allow color:"transparent" to pass through and not use defaultColor.  Instead, use defaultColor if there is no style.color.
     */
    public canvasColor(className: string, ctx?: CanvasRenderingContext2D): void
    /**
     * Returns the font size defined by the requested class name.
     *
     * Defaults to 12 if undefined. Use this to determine vertical heights so that lettering isn't clipped.
     * @param  className Class name
     * @return			  The font size (px is stripped)
     */
    public getCanvasFontSize(className: string): number
    /**
     * Returns the canvas color specified in the class name.
     *
     * @param  className The class name
     * @return			  The color specified (May be undefined if none specified)
     */
    public getCanvasColor(className: string): string
    /**
     * Animation Loop
     *
     * Determines the default color for lines and studies drawn on the screen. This is black unless
     * the background color of the chart has a "value" greater than 65%.
     * The result is that this.defaultColor contains the default color.
     */
    public getDefaultColor(): void
    /**
     * INJECTABLE
     * <span class="animation">Animation Loop</span>
     *
     * Call this method to create the X axis (date axis). Uses CIQ.ChartEngine#createTickXAxisWithDates.
     *
     * Use css styles `stx_xaxis` to control colors and fonts for the dates.
     * Use css styles `stx_xaxis_dark` to control **color only** for the divider dates.
     * Use css styles `stx_grid_border`, `stx_grid` and `stx_grid_dark` to control the grid line colors.
     * The dark styles are used for dividers; when the grid changes to a major point such as the start of a new day on an intraday chart, or a new month on a daily chart.
     *
     * See {@tutorial Custom X-axis} and {@tutorial CSS Overview} for additional details.
     *
     * @param  chart	The chart to create an x-axis for
     * @return			axisRepresentation that can be passed in to CIQ.ChartEngine#drawXAxis
     *
     */
    public createXAxis(chart: CIQ.ChartEngine.Chart): CIQ.ChartEngine.XAxisLabel[]
    /**
     * Creates a label on the x-axis. Generally used to create x-axis labels for drawings.
     *
     * Uses the font properties of the CSS style `stx-float-date` (see *css/stx-chart.css*).
     *
     * **Note:** This function is not used for the floating crosshairs date label, which is also
     * styled using `stx-float-date`. See
     * CIQ.ChartEngine#updateChartAccessories and
     * CIQ.ChartEngine#headsUpHR for more details.
     *
     * @param params Function parameters.
     * @param params.panel The panel on which the label is created.
     * @param params.txt The text for the label.
     * @param params.x	The horizontal pixel position on the canvas for the label. **Note:**
     * 		The function ensures that the label remains on the requested panel if this value is out of
     * 		bounds.To get the pixel position for a bar/date use
     * 		CIQ.ChartEngine#pixelFromTick, CIQ.ChartEngine#pixelFromDate, or
     * 		CIQ.ChartEngine#pixelFromBar.
     * @param params.backgroundColor The background color for the label.
     * @param [params.color] The foreground color for the label. If none is provided, then
     * 		white is used, unless the background is white, in which case black is used.
     * @param [params.pointed] If true, add an upward pointing triangle to the top edge of
     * 		the label horizontally centered to form a shape similar to --^--.
     * @param [params.padding = 2] The amount of padding in pixels to add to the label text
     * 		(top, right, bottom, and left).
     *
     * @since 8.1.0 Function signature now includes the `params` object instead of a list of
     * 		individual parameters. Added the `padding` parameter for easy customization.
     */
    public createXAxisLabel(
      params: {
        panel: CIQ.ChartEngine.Panel,
        txt: string,
        x: number,
        backgroundColor: string,
        color?: string,
        pointed?: boolean,
        padding?: boolean
      }
    ): void
    /**
     * Returns the minimum spacing required between the latest tick on the chart and the price label to prevent data form colliding with the label,
     * which depending on style, may protrude into the chart area ( ie. roundRectArrow ).
     *
     * See CIQ.ChartEngine#yaxisLabelStyle to set different label styles
     * @param  chart	The specific chart
     * @param  chartType	The chart rendering type (candle, line, etc)
     * @returns  pixels to offset
     * @since
     * - 4.0.0
     * - 5.1.0 Removed `stx` parameter.
     */
    public getLabelOffsetInPixels(chart: CIQ.ChartEngine.Chart, chartType: string): number
    /**
     * Causes the primary y-axis and all linked drawings, series and studies to display inverted (flipped) from its previous state.
     *
     * Calling this method multiple times will cause a reciprocal effect.
     * So calling it on a upside-down chart will cause it to display normally and calling it on a normal chart will cause it to display upside-down.
     *
     * Sets <a href="CIQ.ChartEngine.html#layout%5B%60flipped%60%5D">CIQ.ChartEngine.layout.flipped</a> and CIQ.ChartEngine.YAxis#flipped for the main chart.
     *
     * To manage this functionality on secondary axis directly configure its CIQ.ChartEngine.YAxis#flipped property.
     * @param flip True to flip chart, false to restore it
     * @since 6.3.0
     */
    public flipChart(flip: boolean): void
    /**
     * Calculates and sets the value of zoom and scroll for a y-axis based on
     * `yAxis`.[initialMarginTop]CIQ.ChartEngine.YAxis#initialMarginTop
     * and `yAxis`.[initialMarginBottom]CIQ.ChartEngine.YAxis#initialMarginBottom. This method
     * automatically translates those values into starting scroll and zoom factors.
     *
     * If the combined initial values are greater than the y-axis height, then both zoom and scroll are
     * reset to 0.
     *
     * When modifying a y-axis margin after the axis has been rendered, call this function followed by
     * CIQ.ChartEngine#draw to activate the change.
     *
     * @param yAxis The y-axis to reset.
     *
     * @since 7.0.0 Takes into account new field
     * 		`yAxis`.[heightFactor]CIQ.ChartEngine.YAxis#heightFactor.
     */
    public calculateYAxisMargins(yAxis: CIQ.ChartEngine.YAxis): void
    /**
     * INJECTABLE
     *
     * Resets the y-axis width to the default, CIQ.ChartEngine.YAxis#width.
     *
     * Called internally whenever the y-axis label width might change. This function can also be
     * called programmatically at any time if the default behavior needs to be altered.
     *
     * @param [params] Function parameters.
     * @param [params.noRecalculate=false] When true,
     * 		CIQ.ChartEngine#calculateYAxisPositions will never be called.
     * @param [params.chartName] Identifies the chart for which the y-axis dynamic width is
     * 		reset.
     *
     * @see CIQ.ChartEngine.Chart#dynamicYAxis, the flag that enables this feature.
     * @since 6.0.0
     */
    public resetDynamicYAxis(params?: {noRecalculate?: boolean, chartName?: string}): void
    /**
     * Sets the breakpoint on the chart engine. Resets any dynamic y-axis expansion (see
     * CIQ.ChartEngine.Chart#dynamicYAxis) and returns the y-axis width to
     * CIQ.ChartEngine.YAxis#width or CIQ.ChartEngine.YAxis#smallScreenWidth,
     * depending on the breakpoint. Also clears all canvas styles so any CSS-derived values that are
     * cached for performance are recalculated.
     *
     * @param [breakpoint] The breakpoint to set; must be "break-sm", "break-md", or
     * "break-lg".
     *
     * @since 8.2.0
     */
    public notifyBreakpoint(breakpoint?: string): void
    /**
     * INJECTABLE
     * <span class="animation">Animation Loop</span>
     *
     * Draws the grid for the y-axis.
     * @param  panel The panel for the y-axis
     */
    public plotYAxisGrid(panel: CIQ.ChartEngine.Panel): void
    /**
     * INJECTABLE
     * <span class="animation">Animation Loop</span>
     *
     * Plots the text on the y-axis.
     * @param  panel The panel for the y-axis
     */
    public plotYAxisText(panel: CIQ.ChartEngine.Panel): void
    /**
     * Returns the appropriate number of decimal points to show for a given priceTick (price differential between two ticks)
     * @param  priceTick The price differential between two ticks
     * @return		  The number of decimal places appropriate to show
     * @since 5.2.0
     */
    public decimalPlacesFromPriceTick(priceTick: number): number
    /**
     * Formats prices for the Y-axis.
     *
     * Intelligently computes the decimal places based on the size of the y-axis ticks.
     *
     * If the panel is a study panel, then prices will be condensed by CIQ.condenseInt if the price differential between two ticks (priceTick) is equal or over 1000.
     * For the primary panel prices will be condensed if the price differential between two ticks is equal or over 20000.
     * This can be overridden by manually setting CIQ.ChartEngine.YAxis#decimalPlaces.
     *
     * You can call this method to ensure that any prices that you are using outside of the chart are formatted the same as the prices on the y-axis.
     * @param  price The price to be formatted
     * @param  panel The panel for the y-axis.
     * @param [requestedDecimalPlaces] Number of decimal places, otherwise it will be determined by the yaxis setting, or if not set, determined automatically
     * @param [yAxis] yAxis. If not present, the panel's y-axis will be used.
     * @param  [internationalize] Normally this function will return an internationalized result.  Set this param to false to bypass.
     * @return		  The formatted price
     * @since
     * - 4.0.0 CondenseInt will be called only if yaxis priceTick equal or over 1000 for studies and 20000 for primary axis, rather than 100.
     * - 5.2.0 All axes will be condensed to some degree to allow for more uniform decimal precision.
     * - 6.1.0 Added `internationalize` parameter.
     */
    public formatYAxisPrice(
      price: number,
      panel: CIQ.ChartEngine.Panel,
      requestedDecimalPlaces?: number,
      yAxis?: CIQ.ChartEngine.YAxis,
      internationalize?: boolean
    ): number
    /**
     * Calculates the range for the y-axis and sets appropriate member variables.
     *
     * The default behavior is to stop vertical scrolling when only 1/5 of the chart remains on
     * screen, so the primary chart never completely scrolls off the screen — unless you start
     * zooming the y-axis by grabbing it and pulling it down. Once the zoom level goes into the
     * negative range (meaning that you are shrinking the chart vertically) the vertical panning
     * limitation goes away.
     *
     * This method should seldom if ever be called directly. But you can override this behavior (so
     * that a chart is always allowed to completely scroll off the screen at any zoom level) with
     * the following code:
     * ```
     * stxx.originalcalculateYAxisRange = stxx.calculateYAxisRange;
     * CIQ.ChartEngine.prototype.calculateYAxisRange = function(panel, yAxis, low, high) {
     *     var beforeScroll = this.chart.yAxis.scroll;
     *     this.originalcalculateYAxisRange(panel, yAxis, low, high);
     *     this.chart.yAxis.scroll = beforeScroll;
     * };
     * ```
     *
     * @param panel The panel containing the y-axis.
     * @param yAxis The y-axis for which the range is calculated.
     * @param [low] The low value for the axis.
     * @param [high] The high value for the axis.
     *
     * @since 5.2.0 When the y-axis is zoomed in, there is no limitation on vertical panning.
     */
    public calculateYAxisRange(
      panel: CIQ.ChartEngine.Panel,
      yAxis: CIQ.ChartEngine.YAxis,
      low?: number,
      high?: number
    ): void
    /**
     * INJECTABLE
     * <span class="animation">Animation Loop</span>
     *
     * This method creates and draws all y-axes for all panels
     *
     * yAxis.high - The highest value on the y-axis
     * yAxis.low - The lowest value on the y-axis
     *
     * @param  chart The chart to create y-axis
     * @since 15-07-01
     */
    public renderYAxis(chart: CIQ.ChartEngine.Chart): void
    /**
     * Redraws the floating price label(s) for the crosshairs tool on the y axis using CIQ.ChartEngine#createYAxisLabel and sets the width of the y crosshair line to match panel width.
     *
     * Label style: `stx-float-price` ( for price colors ) and `stx_crosshair_y` ( for cross hair line )
     *
     * @param  panel	The panel on which to print the label(s)
     * @example
     * // controls primary default color scheme
     * .stx-float-price { color:#fff; background-color: yellow;}
     * @since 5.2.0 Number of decimal places for label determined by price differential between ticks as opposed to shadow.
     */
    public updateFloatHRLabel(panel: CIQ.ChartEngine.Panel): void
    /**
     * Determines whether the yAxis of the object matches the provided yAxis
     * @param  object Can be a study, series, or yaxis
     * @param  yAxis Axis to compare to
     * @return True if object's yAxis matches the provided yAxis
     * @since 7.1.0
     */
    public yaxisMatches(
      object: CIQ.Studies.StudyDescriptor|CIQ.Renderer|CIQ.ChartEngine.YAxis,
      yAxis: CIQ.ChartEngine.YAxis
    ): boolean
    /**
     * Creates a floating label on the y-axis unless CIQ.ChartEngine.YAxis#drawPriceLabels is false.
     * This can be used for any panel and called multiple times to add multiple labels
     *
     * Style: stx_yaxis ( font only )
     *
     * @param  panel			The panel on which to print the label
     * @param  txt				The text for the label
     * @param  y				The vertical pixel position on the canvas for the label. This method will ensure that it remains on the requested panel. To get the pixel for a value use CIQ.ChartEngine#pixelFromTransformedValue, or similar
     * @param  backgroundColor The background color for the label.
     * @param  color			The text color for the label. If none provided then white is used, unless the background is white in which case black is used.
     * @param  [ctx]		 The canvas context to use, defaults to the chart
     * @param [yAxis] Specifies which yAxis, if there are multiple for the panel
     * @since 3.0.0 Moved text rendering to CIQ.createLabel.
     * @example
     * stxx.createYAxisLabel(panel, '379600',stxx.pixelFromTransformedValue(price, panel), 'green', 'white');
     */
    public createYAxisLabel(
      panel: CIQ.ChartEngine.Panel,
      txt: string,
      y: number,
      backgroundColor: string,
      color: string,
      ctx?: CanvasRenderingContext2D,
      yAxis?: CIQ.ChartEngine.YAxis
    ): void
    /**
     * INJECTABLE
     * <span class="animation">Animation Loop</span>
     *
     * Draws a label for the last price <b>in the main chart panel's y-axis</b> using CIQ.ChartEngine#createYAxisLabel
     *
     * It will also draw a horizontal price line if <a href="CIQ.ChartEngine.html#preferences%5B%60currentPriceLine%60%5D">CIQ.ChartEngine.preferences.currentPriceLine</a> is true.
     *
     * It will only draw a line or a label if CIQ.ChartEngine.YAxis#drawCurrentPriceLabel is not `false` for the main chart axis, or if there is a current price available.
     * If you have not loaded enough datapoints to overlap into the current time, as determined by the device's clock, the label will not display.
     *
     * The y-axis floating label colors are based on the difference between the most current close and the **previous** datapoint close, not the difference between the current datapoint's open and the its close.
     *
     * Label style: `stx_current_hr_down` and `stx_current_hr_up`
     *
     */
    public drawCurrentHR(): void
    /**
     * Retrieves a Y-Axis based on its name property
     * @param  panel The panel
     * @param  name The name of the axis
     * @return matching YAxis or undefined if none exists
     * @since 5.2.0
     */
    public getYAxisByName(panel: CIQ.ChartEngine.Panel, name: string): CIQ.ChartEngine.YAxis
    /**
     * Retrieves a Y-Axis based on a field which belongs to it.
     * @param  panel The panel
     * @param  field the field to test
     * @return matching YAxis or undefined if none exists
     * @since 7.0.0
     */
    public getYAxisByField(panel: CIQ.ChartEngine.Panel, field: string): CIQ.ChartEngine.YAxis
    /**
     * Removes the yAxis from the panel if it is not being used by any current renderers. This could be the case
     * if a renderer has been removed. It could also be the case if a renderer is not attached to any series.
     * @param  panel The panel
     * @param  yAxis The axis to be removed
     * @since
     * - 07/01/2015
     * - 7.1.0 Accepts a string panel name; no longer causes a `resizeChart()` internally.
     */
    public deleteYAxisIfUnused(
      panel: CIQ.ChartEngine.Panel|string,
      yAxis: CIQ.ChartEngine.YAxis
    ): void
    /**
     * Adds a yAxis to the specified panel. If the yAxis already exists then it is assigned its match from the panel.
     * @param panel The panel to add (i.e. stxx.chart.panel)
     * @param yAxis The YAxis to add (create with new CIQ.ChartEngine.YAxis)
     * @return The YAxis added (or the existing YAxis if a match was found)
     * @since
     * - 5.1.0 Added return value.
     * - 7.1.0 Accepts `panel` as a string.
     */
    public addYAxis(
      panel: CIQ.ChartEngine.Panel|string,
      yAxis: CIQ.ChartEngine.YAxis
    ): CIQ.ChartEngine.YAxis
    /**
     * Calculates the width and left/right position of all y-axes.
     *
     * When modifying a y-axis width or left/right position setting after the axis has been rendered,
     * call this function followed by CIQ.ChartEngine#draw to activate the change.
     *
     * @since 8.3.0 Adjusts the `candleWidth`, not the `maxTicks`, when the chart width changes.
     */
    public calculateYAxisPositions(): void
    /**
     * This method determines and returns the existing position of a y-axis, as set by CIQ.ChartEngine.YAxis#position or CIQ.ChartEngine#setYAxisPosition.
     *
     * @param yAxis The YAxis whose position is to be found
     * @param  panel The panel which has the axis on it
     * @return The position (left, right, or none)
     *
     * @since 6.2.0
     */
    public getYAxisCurrentPosition(yAxis: CIQ.ChartEngine.YAxis, panel: CIQ.ChartEngine.Panel): string
    /**
     * Sets the y-axis position and recalculates the positions.
     *
     * Always use this method on existent y-axis rather than changing CIQ.ChartEngine.YAxis#position
     * @param yAxis The y-axis whose position is to be set
     * @param [position] The position. Valid options:"left", "right", "none", or null.
     * @since 6.2.0
     */
    public setYAxisPosition(yAxis: CIQ.ChartEngine.YAxis, position?: string): void
    /**
     * Chooses a new study or renderer to be the owner of a y-axis. This affects the axis name of any studies upon it as well.
     *
     * @param yAxis The y-axis owned by the new study or renderer.
     * @return The new name of the y-axis.
     * @since 7.2.0
     */
    public electNewYAxisOwner(yAxis: CIQ.ChartEngine.YAxis): string
    /**
     * INJECTABLE
     *
     * Consolidates a quote array, aligning to the market iteration times. This is called by CIQ.ChartEngine#createDataSet to roll
     * up intervals (including week and month from daily data).
     * @param  quotes		The quote array to consolidate
     * @param  params		Override parameters
     * @param  [params.periodicity] Periodicity to use, if omitted, uses periodicity, interval and timeUnit from layout
     * @param  [params.interval]	Interval to use, if omitted, uses periodicity, interval and timeUnit from layout
     * @param  [params.timeUnit]	Time unit to use, when periodicity and interval are supplied
     * @return				The consolidated quote array
     * @since
     * - 3.0.0 Signature changed.
     * - 5.1.0 Consolidation for daily intervals now aligns with set range to improve rolling predictability on daily intervals.
     * - 6.2.0 Bid and Ask data consolidate using most recent, not opening.
     * - 6.2.3 When no market, aligns on midnight GMT.
     */
    public consolidatedQuote(
      quotes: any[],
      params: {
        periodicity?: number,
        interval?: number,
        timeUnit?: number
      }
    ): any[]
    /**
     * INJECTABLE
     *
     * Rolls masterData into a dataSet. A dataSet is rolled according to periodicity. For instance, daily data can be rolled
     * into weekly or monthly data. A 1 minute data array could be rolled into a 7 minute dataSet.
     * This method also calls the calculation functions for all of the enabled studies. The paradigm is that calculations
     * are performed infrequently (when createDataSet is called for instance loadChart or setPeriodicity). Then the data
     * is available for quick rendering in the draw() animation loop.
     *
     * Data outside the currently set [market hours/sessions]CIQ.Market will be automatically filtered, when the CIQ.ExtendedHours addOn is installed.
     * Otherwise, it will be displayed individually when no roll up is needed, or rolled up into the prior bar when asking the chart to perform a roll up.
     *
     * For daily intervals, if a range is set, the aggregation will start rolling on the starting date of the range.
     * For example:
     *  - If the chart is displaying data with a beginning range set to the 1st of the month with a 5 day roll-up.
     *  - The first bar will include data for the 1st to the 5th of the month.
     *  - If the range is then changed to begin on the 2nd of the month, with the same 5 day roll-up.
     *  - The first bar will shift so it includes data for the 2nd to the 6th of the month.
     *  - As more data is brought in by zoom/pan operations, the chart will ensure that the '2nd – 6th' of the month point in time is still valid as the anchoring point of the roll up, backwards and forward.
     * If a range is not set, the fist bar on the masterData will be used as the beginning roll up.
     *
     * Weekly rollups start on Sunday unless a market definition exists to indicate Sunday is not a market day, in which case the next market day will be used.
     * Instructions to set a market for the chart can be found here: CIQ.Market
     *
     * Aggregation is done by systematically picking the first element in each periodicity range and tracking 'High', 'Low', 'Volume', and 'Close' so the aggregated quote has the properly consolidated values:
     * - Consolidated High = the highest value for the range
     * - Consolidated Low = the lowest value for the range
     * - Consolidated Volume = the total combined  volume for the range
     * - Consolidated Close = the final close value for the range
     *
     * All other series values will remain as initially set on the first element and will not be aggregated since the library does know their meaning other than being data-points in a series.
     * If you need to also aggregate these series values in a specific manner you can do so by using the following manipulation functions:
     * - CIQ.ChartEngine#transformDataSetPre for manipulation `before` the quotes are combined/aggregated.
     * - CIQ.ChartEngine#transformDataSetPost for manipulation `after` the quotes are combined/aggregated.
     *
     * **Important:** if your data has gaps and you are rolling up the master data, you may see unexpected results if your data does not have a tick matching the exact start time for the periodicity selected.
     * This is due to the fact that aggregation process only uses the ticks is has in the master data and **no new ticks are added**.
     * Example, if you are rolling up seconds into minutes ( `stxx.setPeriodicity({period:60, interval:1, timeUnit:"second"});` ) and your master data has objects with the following time stamps:
     * `10:20:00`, `10:20:11`, `10:20:24`, `10:20:50`, `10:20:51`, `10:21:30`, `10:21:45`, `10:21:46`, `10:21:59`,
     * your aggregated results will be an object for `10:20:00`, and one for  `10:21:30`; where you where probably expecting one for `10:20:00`, and one for  `10:21:00`.
     * But since there is no `10:21:00` object in the master data, the very next one will be used as the starting point for the next aggregation...and so on.
     * To eliminate this problem and guarantee that every bar starts on an exact time for the selected aggregation period,
     * you must first fill in the gaps by setting the CIQ.ChartEngine#cleanupGaps to true.
     *
     * @param [dontRoll] If true then don't roll into weeks or months.
     *		Do this when masterData contains raw data with weekly or monthly interval.
     *		Optionally you can set [stxx.dontRoll]CIQ.ChartEngine#dontRoll to always force dontRoll to be true without having to send as a parameter.
     * @param [whichChart] Deprecated, no longer in use.
     * @param [params] Additional parameters.
     * @param params.appending Set to `true` if called after appending to end of masterdata (CIQ.ChartEngine#updateChartData). It will execute a partial regeneration to increase performance.
     * @param params.appendToDate Append from this point in the dataSet. Any existing data will be scrapped in favor of the data we are appending. If not set, then appended data will be added to the end of the existing dataSet.
     * @since
     * - 3.0.0 Data set will be automatically filtered, when the CIQ.ExtendedHours add-on is installed to exclude any data outside the active market sessions. See CIQ.Market for details on how to set market hours for the different exchanges.
     * - 5.1.0 Consolidation for daily intervals now aligns with set range to improve rolling predictability on daily intervals.
     * - 5.1.1 Added the `params.appendToDate` parameter.
     * - 5.1.1 When `chart.dynamicYAxis` is true, calculates the length (in pixels) of text for a quote.
     * - 8.0.0 Deprecates the `whichChart` parameter. This function no longer iterates through the charts array.
     * @jscrambler ENABLE
     */
    public createDataSet(
      dontRoll?: boolean,
      whichChart?: CIQ.ChartEngine.Chart,
      params?: {
        appending: boolean,
        appendToDate: Date
      }
    ): void
    /**
     * Animation Loop
     *
     * Draws a single frame of a bar chart when no custom `colorFunction` is defined.
     *
     * It is highly tuned for performance.
     *
     * Any parameters from CIQ.Renderer#attachSeries or CIQ.ChartEngine#addSeries
     * will be passed on to this method and are valid when directly calling it from within a [study display function of a Custom Study]{@tutorial Using and Customizing Studies - Creating New Studies}.
     *
     * @param params Parameters object containing information about how to render the chart.
     * @param params.panel Panel on which to draw the bars.
     * @param params.style The canvas style.
     * @param params.condition	The requested condition to be drawn. Available types are:
     * 	- CIQ.ChartEngine.NONE // No evaluation (black bars).
     * 	If CIQ.ChartEngine#colorByCandleDirection is `false` :
     * 	- CIQ.ChartEngine.CLOSEUP // Today's close greater than yesterday's close.
     * 	- CIQ.ChartEngine.CLOSEDOWN // Today's close less than yesterday's close.
     * 	- CIQ.ChartEngine.CLOSEEVEN // Today's close the same as yesterday's close.
     * 	If CIQ.ChartEngine#colorByCandleDirection is `true` :
     * 	- CIQ.ChartEngine.CANDLEUP // Today's close greater than today's open.
     * 	- CIQ.ChartEngine.CANDLEDOWN // Today's close less than today's open.
     * 	- CIQ.ChartEngine.CANDLEEVEN // Today's close equal to today's open.
     *
     * @since 5.1.0 Some new params properties were added, not documented.
     */
    public drawBarTypeChartInner(
      params: {
        panel: CIQ.ChartEngine.Panel,
        style: object,
        condition: number
      }
    ): void
    /**
     * Animation Loop
     *
     * Draws a line plot on the canvas. This function should not be called directly.
     *
     * This function is used by CIQ.ChartEngine#drawLineChart, CIQ.ChartEngine#drawMountainChart
     * (to draw the "edge" of the mountain), CIQ.prepareChannelFill, CIQ.Studies.displayIndividualSeriesAsLine, and several built-in studies.
     *
     * Any parameters from CIQ.Renderer#attachSeries or CIQ.ChartEngine#addSeries
     * will be passed on to this method and are valid when directly calling it from within a [study display function of a Custom Study]{@tutorial Using and Customizing Studies - Creating New Studies}.
     *
     * Replaces `plotLineChart`.
     *
     * **Line Travel Example** — See the `lineTravelSpacing` parameter.
     * ![Term Structure with Line Travel Values](img-Term-Structure-Line-Travel.png "Term Structure with Line Travel Values")
     *
     * @param  field The field to pull from quotes (typically "Close").
     * @param  panel The panel on which to draw the line.
     * @param  [parameters] Parameters for the drawing operation.
     * @param [parameters.skipTransform] If true, any transformations (such as comparison charting) are not applied.
     * @param [parameters.label] If true, the y-axis is marked with the value of the right-hand intercept of the line.
     * @param [parameters.noSlopes] If set, the chart draws horizontal bars with no vertical lines.
     * @param [parameters.step] If set, the chart will resemble a step chart. Horizontal lines begin at the center of the bar.
     * @param [parameters.labelDecimalPlaces] Optionally specify the number of decimal places to print on the label. If not set, it matches the y-axis.
     * @param [parameters.extendOffChart=true] Set to false to not extend the plot off the left and right edge of the chart.
     * @param [parameters.extendToEndOfDataSet] Set to true to plot any gap at the front of the chart. Automatically done for step charts (see CIQ.ChartEngine#addSeries).
     * Set to false to disable.
     * @param [parameters.noDraw] Set to true to not actually draw anything but just return the object.
     * @param [parameters.tension] Tension for splining.
     * @param [parameters.pattern] The pattern for the line ("solid","dashed","dotted").
     * @param [parameters.width] The width in pixels for the line.
     * @param [parameters.gapDisplayStyle] Gap object as created by CIQ.ChartEngine#setGapLines. If `chart.gaplines` is set, it overrides this parameter.
     * Set to a `transparent` style to also eliminate 'dots' indicating isolated items.
     * @param [parameters.reverse] If true, it fills from the plot line to the top of the panel for a mountain chart to create a reverse mountain.
     * @param [parameters.highlight] If true, doubles the width of the line.
     * @param [parameters.yAxis=panel.yAxis] Set to specify an alternate y-axis.
     * @param [parameters.shiftRight] Shifts the chart line the specified number of pixels to the right. Used by the term structure plugin.
     * @param [parameters.lineTravelSpacing] If true, the chart spaces points based on a value known as line travel rather than on candle width. Line travel specifies
     * how far the succeeding point is spaced from the current point. Each data point in the data segment must include a line travel value. For example:
     * ```json
     * {_main_curve: 2.31, lineTravel: 38.380171166599986}
     * {_main_curve: 2.37, lineTravel: 38.380171166599986}
     * {_main_curve: 2.40, lineTravel: 66.47640646374124}
     * {_main_curve: 2.53, lineTravel: 94.01183559884934}
     * {_main_curve: 2.69, lineTravel: 132.95281292748248}
     * {_main_curve: 2.81, lineTravel: 132.95281292748248}
     * {_main_curve: 2.84, lineTravel: 188.0236711976987}
     * {_main_curve: 2.87, lineTravel: 188.0236711976987}
     * {_main_curve: 2.97, lineTravel: 230.2810269995999}
     * {_main_curve: 3.06, lineTravel: 420.43371017712354}
     * {_main_curve: 3.23, lineTravel: 420.43371017712354}
     * {_main_curve: 3.34, lineTravel: 0}
     * ```
     * Used by the term structure plug-in to enable non-uniform spacing of plotted points. See the example in the function description.
     * @param [parameters.alignStepToSide] If set along with `parameters.step`, aligns the step to the sides of the bar rather than the center.
     * @param [parameters.extendToEndOfLastBar] If set along with `parameters.step`, extends the line to the end of the last bar.
     * @param [colorFunction] A function that accepts a `CIQ.ChartEngine`, quote, and gap flag (true if the quote is a gap) as its arguments and returns the appropriate
     * color for drawing that mode.
     * Example: `colorFunction(stxx,untransformedQuote,true);` //true says this is a gap.
     * Returning a null will skip that line segment. If not passed as an argument, will use the color set in the calling function.
     * @return Data generated by the plot, such as colors used if a `colorFunction` was passed, and the vertices of the line (points).
     *
     * @since
     * - 4.0.0 Replaces `plotLineChart`.
     * - 5.2.0 `parameters.gaps` has been deprecated and replaced with `parameters.gapDisplayStyle`.
     * - 6.0.0 `params.gapDisplayStyle` can be set to false to suppress all gap drawing.
     * - 7.3.0 Added `parameters.shiftRight` and `parameters.lineTravelSpacing`.
     * - 8.0.0 Added `parameters.alignStepToSide` and `parameters.extendToEndOfLastBar`.
     */
    public plotDataSegmentAsLine(
      field: string,
      panel: CIQ.ChartEngine.Panel,
      parameters?: {
        skipTransform?: boolean,
        label?: boolean,
        noSlopes?: boolean,
        step?: boolean,
        labelDecimalPlaces?: boolean,
        extendOffChart?: boolean,
        extendToEndOfDataSet?: boolean,
        noDraw?: boolean,
        tension?: number,
        pattern?: string,
        width?: number,
        gapDisplayStyle?: object,
        reverse?: boolean,
        highlight?: boolean,
        yAxis?: CIQ.ChartEngine.YAxis,
        shiftRight?: number,
        lineTravelSpacing?: boolean,
        alignStepToSide?: boolean,
        extendToEndOfLastBar?: boolean
      },
      colorFunction?: Function
    ): object
    /**
     * Animation Loop
     *
     * Draws a single frame of a mountain chart.
     *
     * This method should rarely if ever be called directly.  Use CIQ.Renderer.Lines or CIQ.ChartEngine#setChartType instead.
     *
     * Any parameters from CIQ.Renderer#attachSeries or CIQ.ChartEngine#addSeries
     * will be passed on to this method and are valid when directly calling it from within a [study display function of a Custom Study]{@tutorial Using and Customizing Studies - Creating New Studies}.
     *
     * Uses CSS style `style stx_mountain_chart`, or `stx_colored_mountain_chart` to control mountain colors and line width, unless `params` are set.
     * - `background-color`	- Background color for mountain (top of the mountain, if grading in combination with 'color')
     * - `border-top-color`	- Optional gradient color (bottom of the mountain, if grading in combination with background-color')
     * - `border`	- Optional line color
     * - `width`	- Optional line width
     *
     * Example using CIQ.ChartEngine#setStyle (alternatively, the CSS style can be directly overwritten on a CSS file):
     * ```
     * stxx.setStyle("stx_mountain_chart","borderTopColor","blue");
     * stxx.setStyle("stx_mountain_chart","backgroundColor","purple");
     * ```
     * The default color function for the colored mountain chart uses the following CSS styles:
     * - `stx_line_up`		- Color of the uptick portion of the line
     * - `stx_line_down`		- Color of the downtick portion of the line
     * - `stx_line_chart`		- Default line color if no up or down is defined.
     *
     * Alternatively you can use  CIQ.ChartEngine#setLineStyle to override the CSS style.
     *
     * @param panel The panel on which to draw the mountain chart
     * @param params Configuration parameters
     * @param [params.yAxis=panel.yAxis] Set to specify an alternate y-axis
     * @param [params.style] The CSS style selector which contains the styling for the bar (width and color). Defaults to `stx_mountain_chart`.
     * @param [params.reverse] Set to true to draw a "reverse" mountain chart
     * @param [params.field] Set to override the field to be plotted. Default is chart.defaultPlotField which defaults to "Close"
     * @param [params.gapDisplayStyle] Gap object as created by CIQ.ChartEngine#setGapLines. If not set `chart.gaplines` will be used.
     * @param [params.returnObject] Set to true for return value of the function to be object as described in doc below, otherwise returns only array of colors used.
     * @param [colorFunction] A function which accepts an CIQ.ChartEngine and quote as its arguments and returns the appropriate color for drawing that mode.
     *		Returning a null will skip that line segment. If not passed as an argument, will use the color set in the calling function.
     * @return Data generated by the plot, such as colors used if a colorFunction was passed, and the vertices of the line (points).
     *
     * @since
     * - 15-07-01 Changed signature from `chart` to `panel`.
     * - 05-2016-10 Function now accepts a style, colorFunction argument, and returns colors used in the line plot.
     * - 4.0.0 Changed style to an object argument called `parameters` so yAxis, field and reverse can be supported.
     * - 4.0.0 Return value is now an object.
     * - 5.2.0 `params.gaps` has been deprecated and replaced with `params.gapDisplayStyle`.
     * - 6.0.0 `params.gapDisplayStyle` can be set to false to suppress all gap drawing.
     */
    public drawMountainChart(
      panel: CIQ.ChartEngine.Panel,
      params: {
        yAxis?: CIQ.ChartEngine.YAxis,
        style?: string,
        reverse?: boolean,
        field?: string,
        gapDisplayStyle?: object,
        returnObject?: boolean
      },
      colorFunction?: Function
    ): object
    /**
     * Animation Loop
     *
     * Draws a single frame of a baseline chart.
     *
     * This method should rarely if ever be called directly.  Use CIQ.Renderer.Lines or CIQ.ChartEngine#setChartType instead.
     *
     * Any parameters from CIQ.Renderer#attachSeries or CIQ.ChartEngine#addSeries
     * will be passed on to this method and are valid when directly calling it from within a [study display function of a Custom Study]{@tutorial Using and Customizing Studies - Creating New Studies}.
     *
     * Unless `params` are set, uses the following CSS styles for standard baselines:
     * - `stx_baseline_up`		- Color of the portion above the baseline
     * - `stx_baseline_down`	- Color of the portion below the baseline
     * - `stx_baseline`			- Color of the baseline
     *
     * Additionally, unless `params` are set, uses CSS `stx_baseline_delta_mountain` for mountain baselines:
     * - `background-color`	- Background color for mountain
     * - `color`	- Optional gradient color
     * - `width`	- Optional line width
     * - `padding`	- Optional padding between the baseline and the mountain shading
     *
     * Alternatively you can use  CIQ.ChartEngine#setLineStyle to override the CSS style.
     *
     * @param  panel The panel on which to draw the baseline chart
     * @param  params	Configuration parameters
     * @param [params.yAxis=panel.yAxis] Set to specify an alternate y-axis
     * @param  [params.style]	The style selector which contains the styling for the mountain chart if mountain selected. Defaults to `stx_baseline_delta_mountain`.
     * @param  [params.field]	Set to override the field to be plotted.  Default is chart.defaultPlotField which defaults to "Close"
     * @return Data generated by the plot, such as colors used.
     * @since 5.1.0
     *
     */
    public drawBaselineChart(
      panel: CIQ.ChartEngine.Panel,
      params: {
        yAxis?: CIQ.ChartEngine.YAxis,
        style?: string,
        field?: string
      }
    ): object
    /**
     * Convenience function for plotting a straight line on the chart.
     *
     * @param parameters Provide a description of the line.
     * @param parameters.x0 Starting x-coordinate of the line.
     * @param parameters.x1 Ending x-coordinate of the line.
     * @param parameters.y0 Starting y-coordinate of the line.
     * @param parameters.y1 Ending y-coordinate of the line.
     * @param parameters.color Either a color or a Styles object as returned from CIQ.ChartEngine#canvasStyle.
     * @param parameters.type The type of line to draw ("segment","ray", or "line"); defaults to "segment".
     * @param [parameters.context] The canvas context. Defaults to the standard context.
     * @param [parameters.confineToPanel] The panel in which to confine the drawing; unnecessary if clipping.
     * 		To confine the drawing to the primary chart panel, set to true.
     * @param [parameters.pattern] The pattern for the line ("solid","dashed","dotted")
     * @param [parameters.lineWidth] The width in pixels for the line.
     * @param [parameters.opacity] Optional opacity for the line.
     * @param [parameters.globalCompositeOperation] Sets the type of compositing to apply to new drawings.
     * 		For example, "source-over" draws new shapes over, or on top of, existing content.
     * 		See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation for a
     * 		complete list of compositing types.
     * @param [parameters.deferStroke] True to treat this line as a continuation of a previous path.  Will not stroke.
     * @since 7.4.0 Added the `globalCompositeOperation` parameter. Normalized all arguments under `parameters`.
     */
    public plotLine(
      parameters: {
        x0: number,
        x1: number,
        y0: number,
        y1: number,
        color: string,
        type: string,
        context?: CanvasRenderingContext2D,
        confineToPanel?: CIQ.ChartEngine.Panel,
        pattern?: string,
        lineWidth?: number,
        opacity?: number,
        globalCompositeOperation?: string,
        deferStroke?: boolean
      }
    ): void
    /**
     * INJECTABLE
     * <span class="animation">Animation Loop</span>
     *
     * Draws the series renderers on the chart.
     *
     * The renderers are located in seriesRenderers. Each series in each seriesRenderer should
     * be represented by the same name in the dataSet. See CIQ.ChartEngine#addSeries
     * @param  chart The chart object to draw the renderers upon
     * @param phase Values "underlay","main","overlay","yAxis"
     * @since 5.2.0 "calculate" phase removed; this work is now done in CIQ.ChartEngine#initializeDisplay and CIQ.ChartEngine#renderYAxis.
     */
    public rendererAction(chart: CIQ.ChartEngine.Chart, phase: string): void
    /**
     * INJECTABLE
     * <span class="animation">Animation Loop</span>
     *
     * Draws each series from the series renderer on the chart.
     *
     * Called by CIQ.ChartEngine#drawSeriesRenderers.
     *
     * @param chart The chart object to draw the series.
     * @param seriesArray The series object to iterate through; defaults to `chart.series`.
     * @param [yAxis] Optional y-axis to plot against.
     * @param [renderer] Optional renderer; used to access rendering function. The default is a line display.
     * @since
     * - 4.0.0 No longer draws canvas legend. Now done by the `draw()` loop. See CIQ.ChartEngine.Chart#legendRenderer.
     * - 5.1.0 Added `renderer` parameter.
     * - 6.3.0 Does not draw the y-axis price label if the series parameter `displayFloatingLabel` is false.
     * - 7.3.0 Always draws the y-axis price label of the series even if the series is a comparison or study and the y-axis of the series is combined with the y-axis of the primary series — except when the series parameter `displayFloatingLabel` is set to false.
     */
    public drawSeries(
      chart: CIQ.ChartEngine.Chart,
      seriesArray: object,
      yAxis?: CIQ.ChartEngine.YAxis,
      renderer?: CIQ.Renderer
    ): void
    /**
     * INJECTABLE
     * <span class="animation">Animation Loop</span>
     *
     * Draws the x-axis. This assumes that the axisRepresentation has previously been calculated by CIQ.ChartEngine#createXAxis
     *
     * Use css styles `stx_xaxis` to control colors and fonts for the dates.
     * Use css styles `stx_xaxis_dark` to control **color only** for the divider dates.
     * Use css styles `stx_grid_border`, `stx_grid` and `stx_grid_dark` to control the grid line colors.
     * The dark styles are used for dividers; when the grid changes to a major point such as the start of a new day on an intraday chart, or a new month on a daily chart.
     *
     * See {@tutorial Custom X-axis} and {@tutorial CSS Overview} for additional details.
     *
     * @param  chart			   Chart object
     * @param  axisRepresentation Axis representation object created by createXAxis. This should be an array of axis labels.
     * @since 5.2.0 axis labels are always top aligned instead of vertically centered regardless of xaxisHeight value.
     */
    public drawXAxis(
      chart: CIQ.ChartEngine.Chart,
      axisRepresentation: CIQ.ChartEngine.XAxisLabel[]
    ): void
    /**
     * Draws date based x-axis.
     *
     * This method is algorithmically designed to create an x-axis that is responsive to various degrees of user panning, zooming, and periodicity selection.
     * It will print different versions of dates or times depending on those factors, attempting to prevent overlaps and evenly spacing labels.
     * If a locale is set, then internationalized dates will be used.
     *
     * The algorithm is also market hours aware. See CIQ.Market for details on how to set market hours for the different exchanges.
     *
     * CIQ.ChartEngine.XAxis#timeUnit and CIQ.ChartEngine.XAxis#timeUnitMultiplier can be hard set to override the algorithm (See {@tutorial Custom X-axis} for additional details).
     *
     * This method sets the CIQ.ChartEngine.chart.xaxis array which is a representation of the complete x-axis including future dates.
     * Each array entry contains an object:
     * DT – The date/time displayed on the x-axis
     * date – yyyymmddhhmm string representation of the date
     * data – If the xaxis coordinate is in the past, then a reference to the chart data element for that date
     *
     * @param  [chart] The chart to print the xaxis
     * @return			axisRepresentation that can be passed in to CIQ.ChartEngine#drawXAxis
     * @since 3.0.0 Using x axis formatter now is available for year and month boundaries.
     */
    public createTickXAxisWithDates(chart?: object): CIQ.ChartEngine.XAxisLabel[]
    /**
     * INJECTABLE
     * <span class="animation">Animation Loop</span>
     *
     * Managing Decimal Places
     *
     * Call this method to create the data that will be displayed on the Y axis (price axis). It does not actually render the Y axis; this is done by CIQ.ChartEngine#drawYAxis
     *
     * The Y-Axis automatically manages decimal place precision. The default behavior is to set the number of decimal places based on the values set in CIQ.ChartEngine.YAxis#shadowBreaks in relation to the size of the shadow.
     * You may override this by setting CIQ.ChartEngine.YAxis#decimalPlaces equal to a hard set number of decimal places.
     * CIQ.ChartEngine.YAxis#minimumPriceTick can be set to specify that the y-axis vertical grid be drawn with specific ranges. eg <code>stxx.chart.panel.yAxis.minimumPriceTick=.25</code>
     *
     * For more configurable parameters, see the CIQ.ChartEngine.YAxis.
     *
     * @param  panel			The panel to create the y-axis
     * @param  [parameters]			Parameters to drive the y-axis
     * @param [parameters.range] Optionally set the range of values to display on the y-axis. For instance [0,100] would only print from zero to one hundred, regardless of the actual height of the y-axis.
     *									 This is useful if you want to add some buffer space to the panel but don't want the y-axis to actually reveal nonsensical values.
     * @param [parameters.ground]		Tie the bottom of the y-Axis to the bottom-most value of the plot. **Do not use this parameter** if you set "initialMarginBottom".
     * @param [parameters.yAxis] The yAxis to create. Defaults to panel.yAxis.
     */
    public createYAxis(
      panel: CIQ.ChartEngine.Panel,
      parameters?: {
        range?: any[],
        ground?: boolean,
        yAxis?: CIQ.ChartEngine.YAxis
      }
    ): void
    /**
     * INJECTABLE
     * <span class="animation">Animation Loop</span>
     *
     * This method draws the y-axis. It is typically called after CIQ.ChartEngine#createYAxis.
     *
     * Use css styles `stx_xaxis` to control colors and fonts for the dates.
     * Use css styles `stx_xaxis_dark` to control **color only** for the divider dates.
     * Use css styles `stx_grid_border`, `stx_grid` and `stx_grid_dark` to control the grid line colors.
     * The dark styles are used for dividers; when the grid changes to a major point such as the start of a new day on an intraday chart, or a new month on a daily chart.
     *
     * See {@tutorial CSS Overview} for additional details.
     *
     * @param  panel	   The panel to draw the y-axis
     * @param  parameters Parameters for the y-axis (only used internally. Send {} when calling this method directly).
     * @param [parameters.range] Optionally set the range of values to display on the y-axis. For instance [0,100] would only print from zero to one hundred, regardless of the actual height of the y-axis.
     *									 This is useful if you want to add some buffer space to the panel but don't want the y-axis to actually reveal nonsensical values.
     * @param [parameters.noDraw]		If true then make all the calculations but don't draw the y-axis. Typically used when a study is going to draw its own y-axis.
     * @param [parameters.yAxis] The yAxis to use. Defaults to panel.yAxis.
     */
    public drawYAxis(
      panel: CIQ.ChartEngine.Panel,
      parameters: {
        range?: any[],
        noDraw?: boolean,
        yAxis?: CIQ.ChartEngine.YAxis
      }
    ): void
    /**
     * On touch devices, when set to true, the backing store will be turned off while a user is panning or zooming the chart. This increases performance during the operation by reducing
     * resolution. Resolution is restored once the user lifts their finger. Generally, you'll want to enable this dynamically when you know that a particular device has poor canvas performance.
     * This defaults to true but can be disabled by setting to false.
     * @since 4.0.0
     */
    public disableBackingStoreDuringTouch: boolean
    /**
     * Pads out the decimal places given only a price.
     *
     * It will not truncate or round, but will add zeroes as follows:
     *  - Prices under $2 will be padded to 4 decimal places, or to match the number of decimal places in `determinant`; whichever is larger.
     *  - Prices over $1,000 will not be padded, or set to match the number of decimal places in `determinant`, if any.
     *  - All other prices will be padded to 2 decimal places, or to match the number of decimal places in `determinant`; whichever is larger.
     * @param  price A price
     * @param  [determinant] Sample value to determine the decimal places. For
     * instance, if you want to determine the number of decimals for today's change based on the actual price.
     * @return       A price padded for decimal places
     * @since 2016-07-16
     */
    public padOutPrice(price: number, determinant?: number): string
    /**
     * @param eraseData Set to true to erase any existing series data
     * @since 5.1.0
     */
    public setMainSeriesRenderer(eraseData: boolean): void
    /**
     * Returns the yaxis that the crosshairs (mouse) is on top of
     * @param  panel The panel
     * @param  [x]		The X location. Defaults to CIQ.ChartEngine#cx
     * @param  [y]		The Y location. Defaults to CIQ.ChartEngine#cy
     * @return		  The yAxis that the crosshair is over
     * @since
     * - 15-07-01
     * - 6.1.0 Returns null when no yAxis found.
     * - 7.1.0 Added the `y` parameter.
     */
    public whichYAxis(panel: CIQ.ChartEngine.Panel, x?: number, y?: number): CIQ.ChartEngine.YAxis
    /**
     * Scrolls the chart to a particular position in the dataSet by setting its appropriate [scroll]CIQ.ChartEngine.Chart#scroll value.
     *
     * Note that positions are tracked from **right to left**.
     * - Setting to `1` would only display the very last candle on the chart.
     * - Setting to `10` would display the last 10 candles on the chart.
     * - Setting to `stxx.chart.maxTicks-1` would display the last screenful of data.
     * - Setting to `stxx.chart.dataSet.length` would display the first few candles (oldest) on the chart.
     *
     * Example <iframe width="100%" height="500" scrolling="no" seamless="seamless" align="top" style="float:top" src="https://jsfiddle.net/chartiq/ouh4k95z/embedded/result,js,html/" allowfullscreen="allowfullscreen" frameborder="1"></iframe>
     *
     * @param chart Chart object to target
     * @param  position the [scroll]CIQ.ChartEngine.Chart#scroll position to move to.
     * @param [cb] Callback executed after scroll location is changed.
     */
    public scrollTo(chart: CIQ.ChartEngine.Chart, position: number, cb?: Function): void
  }

  /**
   * The Plotter is a device for managing complex drawing operations on the canvas. The HTML 5 canvas performs better when drawing
   * operations of the same color are batched (reducing the number of calls to the GPU). The plotter allows a developer to store those
   * operations in a normal control flow, and then have the Plotter deliver the primitives to the canvas. The plotter can also be used
   * as a caching mechanism for performing the same operations repeatedly. The y-axis of the chart uses this mechanism to boost performance.
   */
  class Plotter {
    /**
     * The Plotter is a device for managing complex drawing operations on the canvas. The HTML 5 canvas performs better when drawing
     * operations of the same color are batched (reducing the number of calls to the GPU). The plotter allows a developer to store those
     * operations in a normal control flow, and then have the Plotter deliver the primitives to the canvas. The plotter can also be used
     * as a caching mechanism for performing the same operations repeatedly. The y-axis of the chart uses this mechanism to boost performance.
     */
    constructor()
    /**
     * Define a series to plot. A series is a specific color and referenced by name
     * @param name         Name of series
     * @param strokeOrFill If true then a stroke operation, otherwise a fill operation
     * @param color        A valid canvas color
     * @param [opacity=1]      A valid opacity from 0-1
     * @param [width=1]      A valid lineWidth from 1
     * @param [pattern=solid]      A valid pattern (solid, dotted, dashed)
     * @since 4.0.0 added parameter pattern
     */
    public Series(
      name: string,
      strokeOrFill: boolean,
      color: string,
      opacity?: number,
      width?: number,
      pattern?: string
    ): void
    /**
     * Create a series. This supports either a text color or CIQ.ChartEngine.Style object
     * @see  CIQ.Plotter.Series
     * @param name Name of series
     * @param strokeOrFill If true then a stroke operation, otherwise a fill operation
     * @param colorOrStyle Color or object containing color, opacity, width, borderTopStyle (solid, dotted, dashed)
     * @param [opacity] A valid opacity from 0-1
     * @param [width=1] A valid lineWidth from 1
     */
    public newSeries(
      name: string,
      strokeOrFill: boolean,
      colorOrStyle: object|string,
      opacity?: number,
      width?: number
    ): void
    /**
     * Clear out any moves or text stored in the plotter for series "name"
     * @param name Name of series to reset.  If omitted, will reset all series in plotter.
     * @since 3.0.0
     */
    public reset(name: string): void
    /**
     * @param name Name of series
     * @param x
     * @param y
     */
    public moveTo(name: string, x: number, y: number): void
    /**
     * @param name Name of series
     * @param x
     * @param y
     */
    public lineTo(name: string, x: number, y: number): void
    /**
     * @param name Name of series
     * @param x
     * @param y
     * @param pattern A valid pattern (solid, dotted, dashed)
     */
    public dashedLineTo(name: string, x: number, y: number, pattern: string): void
    /**
     * @param name Name of series
     * @param cx0 Control point x-coord
     * @param cy0 Control point y-coord
     * @param x
     * @param y
     */
    public quadraticCurveTo(
      name: string,
      cx0: number,
      cy0: number,
      x: number,
      y: number
    ): void
    /**
     * @param name Name of series
     * @param cx0 First control point x-coord
     * @param cy0 First control point y-coord
     * @param cx1 Second control point x-coord
     * @param cy1 Second control point x-coord
     * @param x
     * @param y
     * @since 4.0.0
     */
    public bezierCurveTo(
      name: string,
      cx0: number,
      cy0: number,
      cx1: number,
      cy1: number,
      x: number,
      y: number
    ): void
    /**
     * Add text to be rendered with the drawing. Primarily used when the Plotter is used for caching since there is no
     * performance benefit from batching text operations to the GPU. If specifying a bounding box, textBaseline="middle" is assumed
     * @param name Name of series
     * @param text The raw text to render
     * @param x    X position on canvas for text
     * @param y    Y position on canvas for text
     * @param [backgroundColor] Color to use on the box underneath the text
     * @param [width]  Width of bounding box
     * @param [height] Height of bounding box
     */
    public addText(
      name: string,
      text: string,
      x: number,
      y: number,
      backgroundColor?: string,
      width?: number,
      height?: number
    ): void
    /**
     * Render the plotter. All of the stored operations are sent to the canvas. This operation stores and restores
     * global canvas parameters such as fillStyle, strokeStyle and globalAlpha.
     * @param  context A valid HTML canvas context
     * @param  [name]    Optionally render only a specific series. If null or not provided then all series will be rendered.
     */
    public draw(context: object, name?: string): void
  }

  /**
   * Base class for Renderers.
   *
   * A renderer is used to draw a complex visualization based on one or more "series" of data.
   * Renderers only need to be attached to a chart once. You can change symbols and continue using the same renderer.
   * The series associated with a renderer may change at any time, but the linked renderer itself remains the vehicle for display them.
   *
   * Series are associated with renderers by calling attachSeries().
   * More typically though, this is done automatically when CIQ.ChartEngine#addSeries is used.
   * The parameters for addSeries() are passed both to the renderer's constructor and also to attachSeries().
   *
   * To manually create a renderer use CIQ.ChartEngine#setSeriesRenderer
   *
   */
  class Renderer {
    /**
     * Base class for Renderers.
     *
     * A renderer is used to draw a complex visualization based on one or more "series" of data.
     * Renderers only need to be attached to a chart once. You can change symbols and continue using the same renderer.
     * The series associated with a renderer may change at any time, but the linked renderer itself remains the vehicle for display them.
     *
     * Series are associated with renderers by calling attachSeries().
     * More typically though, this is done automatically when CIQ.ChartEngine#addSeries is used.
     * The parameters for addSeries() are passed both to the renderer's constructor and also to attachSeries().
     *
     * To manually create a renderer use CIQ.ChartEngine#setSeriesRenderer
     *
     */
    constructor()
    /**
     * If your renderer manages a yAxis then the necessary adjustments to its properties should be made here.
     *
     * @since 5.2.0
     */
    public adjustYAxis(): void
    /**
     * Perform drawing operations here.
     */
    public draw(): void
    /**
     * Draws one series from the renderer.
     *
     * Called by CIQ.ChartEngine#drawSeries
     * @param  chart The chart object to draw the renderers upon
     * @param [parameters] Parameters used to draw the series, depends on the renderer type
     * @param [parameters.panel] Name of panel to draw the series upon
     * @since 5.1.0
     */
    public drawIndividualSeries(chart: CIQ.ChartEngine.Chart, parameters?: {panel?: string}): void
    /**
     * Default constructor for a renderer. Override this if desired.
     * @param config Configuration for the renderer.
     * @param [config.callback] Callback function to perform activity post-drawing, for example, creating a legend. It will be called with an object containing the list of instruments and corresponding colors.
     * @param [config.id] Handle to access the rendering in the future.  If not provided, one will be generated.
     * @param [config.params] Parameters to control the renderer itself
     * @param [config.params.name="Data"] Name of the renderer. This is used when displaying error message on screen
     * @param [config.params.panel="chart"] The name of the panel to put the rendering on.
     * @param [config.params.overChart=true] If set to false, will draw the rendering behind the main chart rather than over it. By default rendering will be as overlay on the main chart.
     * @param [config.params.yAxis] Y-axis object to use for the series.
     * @param [config.params.opacity=1] Opacity of the rendering as a whole.  Can be overridden by an opacity set for a series.  Valid values are 0.0-1.0. <b>Not applicable on [Lines]CIQ.Renderer.Lines with a `type` of `mountain`; use an "RGBA" color instead.</b>
     * @param [config.params.binding] Allows the use of the study output colors within the renderer. See an example in the [Using Renderers to Display Study Output](tutorial-Using%20and%20Customizing%20Studies%20-%20Creating%20New%20Studies.html#Using_Renderers) section of the Studies tutorial.
     * @since 5.2.0 `config.params.binding` parameter added.
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
     *	var renderer=stxx.setSeriesRenderer(new CIQ.Renderer.Lines({params:{name:"my-renderer", type:"mountain", yAxis:axis}}));
     *
     *	// create your series and attach them to the chart when the data is loaded.
     *	stxx.addSeries("NOK", {display:"NOK",width:4},function(){
     *		renderer.attachSeries("NOK", "#FFBE00").ready();
     *	});
     *
     *	stxx.addSeries("SNE", {display:"Sony",width:4},function(){
     *		renderer.attachSeries("SNE", "#FF9300").ready();
     *	});
     */
    public construct(
      config: {
        callback?: Function,
        id?: string,
        params?: {
          name?: string,
          panel?: string,
          overChart?: boolean,
          yAxis?: boolean,
          opacity?: number,
          binding?: object
        }
      }
    ): void
    /**
     * Attach a series to the renderer.
     *
     * This assumes that the series data *is already in the dataSet* and simply connects it to the renderer with the specified parameters.
     * See CIQ.ChartEngine#addSeries for details on how to create a series.
     *
     * Any parameters defined when attaching a series, such as colors, will supersede any defined when a series was created. This allows you to attach the same series to multiple renderers, each rendering displaying the same series data in a different color, for example.
     *
     * @param  id The name of the series.
     * @param  parameters Settings to control color and opacity of each series in the group. See CIQ.ChartEngine#addSeries for implementation examples. <P>Argument format can be:<ul><li> a `string` containing the color</li><li> or a more granular `object` having the following members:</li></ul>
     * @param  [parameters.field] The name of the field. Name of the field in the dataSet to use for the series.  If omitted, defaults to id
     * @param  [parameters.fill_color_up] Color to use to fill the part when the Close is higher than the previous (or 'transparent' to not display)
     * @param  [parameters.border_color_up] Color to use to draw the border when the Close is higher than the previous (or 'transparent' to not display)
     * @param  [parameters.opacity_up=.4] Opacity to use to fill the part when the Close is higher than the previous (0.0-1.0)
     * @param  [parameters.border_color_even] Color to use to draw the border when the Close is equal to the previous (or 'transparent' to not display)
     * @param  [parameters.fill_color_down] Color to use to fill the part when the Close is lower than the previous (or 'transparent' to not display)
     * @param  [parameters.border_color_down] Color to use to draw the border when the Close is lower than the previous (or 'transparent' to not display)
     * @param  [parameters.opacity_down=.4] Opacity to use to fill the part when the Close is lower than the previous (0.0-1.0)
     * @param  [parameters.color] Color to use to fill the series in the absence of specific up/down color.
     * @param  [parameters.border_color] Color to use to draw the border in the series in the absence of specific up/down color.
     * @param  [parameters.fillStyle] Color to use to fill the mountain chart.
     * @param  [parameters.baseColor] Color to use at the bottom of the mountain chart, will create a gradient with bgColor
     * @param  [parameters.bgColor] Color to use at the top of the mountain chart, will create a gradient if baseColor is specified.  Otherwise, will fill the mountain solid with this color unless fillStyle is specified
     * @param  [parameters.permanent] Whether the attached series can be removed by the user (lines and bars only). By default the series will not be permanent. This flag (including the default) will supersede the permanent flag of the actual series. As such, a series will not be permanent unless you set this flag to 'true', even if the series being attached was flaged set as permanent when defined. This gives the renderer most control over the rendering process.
     * @return            Returns a copy of this for chaining
     * @since 5.1.0 Added `fillStyle`, `baseColor`, and `bgColor` parameters.
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
     *	var renderer=stxx.setSeriesRenderer(new CIQ.Renderer.Lines({params:{name:"my-renderer", type:"mountain", yAxis:axis}}));
     *
     *	// create your series and attach them to the chart when the data is loaded.
     *	stxx.addSeries("NOK", {display:"NOK",width:4},function(){
     *		renderer.attachSeries("NOK", "#FFBE00").ready();
     *	});
     *
     *	stxx.addSeries("SNE", {display:"Sony",width:4},function(){
     *		renderer.attachSeries("SNE", "#FF9300").ready();
     *	});
     */
    public attachSeries(
      id: string,
      parameters: {
        field?: string,
        fill_color_up?: string,
        border_color_up?: string,
        opacity_up?: number,
        border_color_even?: string,
        fill_color_down?: string,
        border_color_down?: string,
        opacity_down?: number,
        color?: string,
        border_color?: string,
        fillStyle?: string,
        baseColor?: string,
        bgColor?: string,
        permanent?: boolean
      }
    ): CIQ.Renderer
    /**
     * Removes a series from the renderer.
     *
     * The yAxis and actual series data will also be removed if no longer used by any other renderers.
     * When the last series is removed from the renderer, the chart it is attached to will remove the renderer.
     * Will [turn off comparison mode]CIQ.ChartEngine#setComparison if there are no more comparisons on the chart if CIQ.ChartEngine.Chart#forcePercentComparison is true.
     * @param  id          The field name of the series.
     * @param  [preserveSeries=false] Set to `true` to keep the series data in the CIQ.ChartEngine objects, otherwise it iwll be deleted if no
     * @return                A copy of this for chaining
     * @since
     * - 2015-07-01 'preserveSeries' is now available.
     * - 3.0.0 Series is now removed even if series parameter `permanent` is set to true. The permanent parameter only prevents right click user interaction and not programmatically requested removals.
     * - 4.0.0 Series data is now totally removed from masterData if no longer used by any other renderers.
     * - 6.2.0 No longer force 'percent'/'linear', when adding/removing comparison series, respectively, unless CIQ.ChartEngine.Chart#forcePercentComparison is true. This allows for backwards compatibility with previous UI modules.
     */
    public removeSeries(id: string, preserveSeries?: boolean): CIQ.Renderer
    /**
     * Returns an array of all renderers that depend on a given renderer.
     *
     * A dependent renderer is one that has `params.dependentOf` set to another renderer's name.
     *
     * @param stx A chart object.
     * @return Array of dependent renderers.
     * @since 7.3.0
     */
    public getDependents(stx: CIQ.ChartEngine): any[]
    /**
     * Returns whether the renderer can be dragged to another axis or panel.
     *
     * @param  stx A chart object.
     * @return  true, if not allowed to drag.
     * @since 7.3.0
     */
    public undraggable(stx: CIQ.ChartEngine): boolean
    /**
     * Removes all series from the renderer and the yAxis from the panel if it is not being used by any current renderers.
     *
     * @param [eraseData=false] Set to true to erase the actual series data in the CIQ.ChartEngine otherwise it will be retained
     * @return A copy of this for chaining
     */
    public removeAllSeries(eraseData?: boolean): CIQ.Renderer
    /**
     * Returns the y-axis used by the renderer
     * @param stx chart engine object
     * @return Y axis
     * @since 7.1.0
     */
    public getYAxis(stx: CIQ.ChartEngine): CIQ.ChartEngine.YAxis
    /**
     * Call this to immediately render the visualization, at the end of a chain of commands.
     * @return A copy of this for chaining
     */
    public ready(): CIQ.Renderer
  }

  /**
   * Creates a template for JavaScript inheritance.
   *
   * By default the constructor (ctor) is called with no arguments.
   *
   * @param me The object to receive the inheritance.
   * @param ctor The parent class or object.
   * @param [autosuper=true] Set to false to prevent the base class constructor from being called automatically.
   * @since 7.4.0 Replaces Function#ciqInheritsFrom.
   */
  function inheritsFrom(me: object, ctor: object, autosuper?: boolean): void

  /**
   * Extends an object, similar to jquery.extend() with a deep copy
   *
   * Only does a recursive deep copy if the *source* is plain object.
   *
   * @param target Target object
   * @param  source Original object
   * @param [shallow] If true then extend will not recurse through objects
   * @return Target object after extension
   * @since
   * - 5.1.0 Undefined properties do not copy to target object.
   * - 5.2.0 Target of a deep copy may now be a class instance.
   */
  function extend(target: object, source: object, shallow?: boolean): object

  /**
   * Activates an import. Should be called to activate an import for use by the API. If an
   * import is not activated, its code is inaccessible and may be tree shaken by bundlers. Keeps
   * track of which imports have been activated already so no import gets added more than
   * once.
   *
   * Each feature, component, or add-on is considered an import. For example, studies, drawings,
   * and CIQ.RangeSlider are imports.
   *
   * See the webpack examples (*webpack.config.js* and *webpack.config.minimal.js* in the root
   * folder of the library) for detailed examples of how to import.
   *
   * **Note:** `DefinePlugin` needs to be included in the *webpack.config.js* file in order to
   * achieve tree shaking. Otherwise, all imports are automatically activated without the need
   * for the developer to explicitly call this function.
   *
   * @param imports A list of imports to add to the namespace.
   *
   * @since 8.0.0
   */
  function activateImports(...imports: object[]): void

  /**
   * READ ONLY. Will be 'true' if the chart is running on an iPad
   */
  const ipad: boolean

  /**
   * READ ONLY. Will be 'true' if the chart is running on an iPhone
   */
  const iphone: boolean

  /**
   * READ ONLY. Will be 'true' if the chart is running on an Android OS device
   */
  const isAndroid: boolean

  /**
   * READ ONLY. Will be 'true' if the chart is running on a IE browser
   */
  const isIE: boolean

  /**
   * READ ONLY. Will be 'true' if the chart is running on a Edge Legacy browser
   */
  const isEdge: boolean

  /**
   * READ ONLY. Will be 'true' if the chart is running on a Safari browser
   * @since 7.4.0
   */
  const isSafari: boolean

  /**
   * READ ONLY. Will be 'true' if the chart is running on an iOS 7 device
   */
  const isIOS7: boolean

  /**
   * READ ONLY. Will be 'true' if the chart is running on an iOS 8 device
   */
  const isIOS8: boolean

  /**
   * READ ONLY. Will be 'true' if the chart is running on an iOS 9 device
   */
  const isIOS9: boolean

  /**
   * READ ONLY. Will be 'true' if the chart is running on an iOS 10 device
   */
  const isIOS10: boolean

  /**
   * READ ONLY. Will be 'true' if the chart is running on an IOS7, IOS8, IOS9 or IOS10 device
   */
  const isIOS7or8: boolean

  /**
   * READ ONLY. Will be 'true' if the chart is running on a mobile device ( CIQ.isAndroid, CIQ.ipad, or CIQ.iphone )
   */
  const isMobile: boolean

  /**
   * READ ONLY. Will be 'true' if the chart is running on a touch capable device
   */
  const touchDevice: boolean

  /**
   * READ ONLY. Will be 'true' if the chart is running on a MS Surface like device
   */
  const isSurface: boolean

  /**
   * READ ONLY. Will be 'true' if the chart is running on a Chrome browser
   */
  const is_chrome: boolean

  /**
   * READ ONLY. Will be 'true' if the chart is running on a Firefox browser
   */
  const isFF: boolean

  /**
   * READ ONLY. Will be 'true' if the chart is running from a MS Surface application
   */
  const isSurfaceApp: boolean

  /**
   * READ ONLY. Will be 'true' if the chart supports web components
   * @since 6.1.0
   */
  const isWebComponentsSupported: boolean

  /**
   * READ ONLY. Will be 'true' if the chart is running from a device with no Keyboard ( CIQ.isMobile or CIQ.isSurfaceApp )
   */
  const noKeyboard: boolean

  /**
   * Animation Loop
   *
   * Clears the canvas. Uses the fastest known method except on the legacy Android browser which had many problems!
   * @param  canvas A valid HTML canvas object
   * @param  [stx]    A chart object, only necessary for old Android browsers on problematic devices
   */
  function clearCanvas(canvas: object, stx?: object): void

  /**
   * Sets the transparent parts of the canvas to the specified background color. Used to ensure a background when turning charts into images
   * because normally the background is the background of the DIV container and not the canvas itself.
   * @param  context An HTML canvas context
   * @param  color   The color to set the background. Any valid HTML canvas color.
   * @param  width   Width to apply color (Could be less than size of canvas)
   * @param  height  Height to apply color (Could be less than size of canvas if applying branding for instance)
   */
  function fillTransparentCanvas(
    context: object,
    color: string,
    width: number,
    height: number
  ): void

  /**
   * Converts a box represented by two corner coordinates [tick0,value0] and [tick1,value1] into pixel coordinates.
   * @param stx The chartEngine
   * @param  panelName  Panel on which the coordinates reside
   * @param  box Box to convert
   * @param  [box.x0]
   * @param  [box.y0]
   * @param  [box.x1]
   * @param  [box.y1]
   * @return  A converted box
   * @since 6.0.0
   */
  function convertBoxToPixels(
    stx: CIQ.ChartEngine,
    panelName: string,
    box: {
      x0?: number,
      y0?: number,
      x1?: number,
      y1?: number
    }
  ): object

  /**
   * Fills an area on the chart, usually created by a study.
   * @param  stx    The chart object
   * @param  points  The set of points, this is an array of chart coordinates in array form
   * 							e.g. [[x1,y1],[x2,y2]].  The points should be arranged to form a loop;
   * 							the loop need not be closed.
   * @param  params  parameters
   * @param  [params.color]  color, canvas gradient object or canvas pattern object to fill the area
   * @param  [params.opacity] opacity of fill, 0 to 1.  Defaults to 0.1
   * @param  [params.tension] Tension for splining.
   * @param  [params.panelName] Name of panel to draw on.  If omitted or invalid, area may fill over top or bottom of plot area
   * @param  [params.yAxis] The y-axis for the area (will use default axis if not specified)
   * @since
   * - 01-2015-20 Added `params.panelName`.
   * - 4.0.0 Combined arguments into `params`. Added `tension`.
   * - 5.2.0 Added `params.yAxis`.
   */
  function fillArea(
    stx: CIQ.ChartEngine,
    points: any[],
    params: {
      color?: string | object,
      opacity?: number,
      tension?: number,
      panelName?: string,
      yAxis?: CIQ.ChartEngine.YAxis
    }
  ): void

  /**
   * Fills an area on the chart delimited by non intersecting top and bottom bands (channel), usually created by a study.
   * @param stx The chart object
   * @param parameters The configuration parameters
   * @param parameters.panelName The name of the panel
   * @param parameters.noSlopes If set then chart will fill rectangles with no transition lines between levels
   * @param parameters.topBand The name of the quote field to use as the top band
   * @param parameters.bottomBand The name of the quote field to use as the bottom band
   * @param parameters.opacity The color opacity/transparency as a decimal number (1= full opacity / no transparency)
   * @param parameters.color The fill color
   * @since 4.1.2 Removed `quotes` argument; function always uses `chart.dataSegment`.
   * @example
   * CIQ.prepareChannelFill(stx,{"color":dngradient,"opacity":1,"panelName":sd.name,"topBand":"Zero "+sd.name,"bottomBand":"Under "+sd.name});
   */
  function prepareChannelFill(
    stx: CIQ.ChartEngine,
    parameters: {
      panelName: string,
      noSlopes: boolean,
      topBand: string,
      bottomBand: string,
      opacity: number,
      color: string
    }
  ): void

  /**
   * Fills an area on the chart delimited by a series line closed off by a horizontal threshold line, usually created by a study.
   *
   * Visual Reference:
   * ![Elder Force Shading](img-elder-force-shading.png "Elder Force Shading")
   *
   * @param stx The chart object
   * @param parameters The configuration parameters
   * @param [parameters.panelName] The name of the panel
   * @param [parameters.band] The name of the quote field to use as the series line
   * @param [parameters.threshold] The price where the horizontal line hits yaxis/series to enclose the fill area.  If not set will look to parameters.reverse to determine if threshold is the lowest or highest value of the plot.
   * @param [parameters.reverse] Valid only if parameters.threshold is not set.  If this parameter is set to true, threshold will be highest value of plot.  Otherwise, threshold will be lowest value of plot.
   * @param [parameters.direction] 1 to fill from the threshold upwards or -1 to fill from the threshold downwards
   * @param [parameters.edgeHighlight] Set to either a color or a Styles object as returned from CIQ.ChartEngine#canvasStyle to draw the threshold line.
   * @param [parameters.edgeParameters] The parameters to draw the threshold line as required by CIQ.ChartEngine#plotLine
   * @param [parameters.gapDisplayStyle] Gap object as set by See CIQ.ChartEngine#setGapLines.
   * @param [parameters.opacity] The color opacity/transparency as a decimal number (1= full opacity / no transparency).  Default is 0.3.
   * @param [parameters.step] True for a step chart
   * @param [parameters.tension] Tension for splining.
   * @param [parameters.color] The fill color
   * @param [parameters.roundOffEdges] Round the first and last point's X value to the previous and next integer, respectively.
   * @param [parameters.yAxis] The y-axis for the band (will use default axis if not specified)
   * @since
   * - 4.0.0 Added `parameters.reverse`, made `parameters.threshold` optional in case filling to top or bottom of panel.
   * - 4.1.2 Removed `quotes` argument; function always uses `chart.dataSegment`.
   * - 5.2.0 Added `params.yAxis`.
   * - 5.2.0 Deprecated `parameters.gaps` and replaced with `parameters.gapDisplayStyle`.
   * @example
   * if(sd.outputs.Gain) CIQ.preparePeakValleyFill(stx,{panelName:sd.panel, band:"Result " + sd.name, threshold:sd.study.centerline, direction:1, color:sd.outputs.Gain});
   * if(sd.outputs.Loss) CIQ.preparePeakValleyFill(stx,{panelName:sd.panel, band:"Result " + sd.name, threshold:sd.study.centerline, direction:-1, color:sd.outputs.Loss});
   * @example
   * // see visual reference for rendering image
   * 	CIQ.Studies.displayElderForce=function(stx, sd, quotes){
   * 		CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);
   * 		var color=CIQ.Studies.determineColor(sd.outputs.Result);
   * 		var panel=stx.panels[sd.panel];
   * 		var yAxis=sd.getYAxis(stx);
   * 		var params={skipTransform:panel.name!=sd.chart.name, panelName:sd.panel, band:"Result " + sd.name, threshold:0, color:color, yAxis:yAxis};
   * 		params.direction=1;
   * 		CIQ.preparePeakValleyFill(stx,params);
   * 		params.direction=-1;
   * 		CIQ.preparePeakValleyFill(stx,params);
   * 	};
   */
  function preparePeakValleyFill(
    stx: CIQ.ChartEngine,
    parameters: {
      panelName?: string,
      band?: string,
      threshold?: number,
      reverse?: boolean,
      direction?: number,
      edgeHighlight?: object,
      edgeParameters?: object,
      gapDisplayStyle?: object,
      opacity?: number,
      step?: boolean,
      tension?: number,
      color?: string,
      roundOffEdges?: boolean,
      yAxis?: CIQ.ChartEngine.YAxis
    }
  ): void

  /**
   * Fills an area on the chart delimited by intersecting bands.
   *
   * Bands can be anchored by different y-axis as determined by the `parameters.topAxis` and `parameters.bottomAxis` parameters.
   * @param stx The chart object
   * @param panelName The name of the panel
   * @param parameters The configuration parameters
   * @param parameters.topBand The name of the quote field to use as the top band
   * @param parameters.bottomBand The name of the quote field to use as the bottom band
   * @param [parameters.topSubBand] Name of the field within the top band to use, for example when plotting a series
   * @param [parameters.bottomSubBand] Name of the field within the bottom band to use, for example when plotting a series
   * @param parameters.topColor The color of the top band, used to fill in a cloud whose top edge is the topBand
   * @param parameters.bottomColor The color the bottom band, used to fill in a cloud whose top edge is the bottomBand
   * @param [parameters.tension] Tension for splining.
   * @param parameters.topAxis The y-axis for the top band (will use default axis if not specified)
   * @param parameters.bottomAxis The y-axis for the bottom band (will use default axis if not specified)
   * @param parameters.skipTransform If true then any transformations (such as comparison charting) will not be applied
   * @param parameters.opacity The color opacity/transparency as a decimal number (1= full opacity / no transparency).  Default is 0.3.
   * @since
   * - 4.0.0 Changed `sd` argument to `panelName` argument. Added `parameters.topColor`, `parameters.bottomColor`, `parameters.opacity` and `parameters.skipTransform`. Removed `parameters.fillFuture`.
   * - 4.1.2 Removed `quotes` argument; function always uses `chart.dataSegment`.
   * @example
   * var parameters={
   *     topBand: "Leading Span A " + sd.name,
   *     bottomBand: "Leading Span B " + sd.name,
   *     topColor: "green",
   *     bottomColor: "red"
   * };
   * CIQ.fillIntersecting(stx, sd.panel, parameters)
   */
  function fillIntersecting(
    stx: CIQ.ChartEngine,
    panelName: string,
    parameters: {
      topBand: string,
      bottomBand: string,
      topColor: string,
      bottomColor: string,
      topAxis: CIQ.ChartEngine.YAxis,
      bottomAxis: CIQ.ChartEngine.YAxis,
      skipTransform: boolean,
      opacity: number,
      topSubBand?: string,
      bottomSubBand?: string,
      tension?: number
    }
  ): void

  /**
   * Draws an item in the legend and returns the position for the next item
   * @param stx The chart object
   * @param  xy    An X,Y tuple (from chart.legend)
   * @param  label The text to print in the item
   * @param  color The color for the background of the item
   * @param  [opacity] The color for the background of the item
   * @return       A tuple containing the X,Y position for the next the item
   */
  function drawLegendItem(
    stx: CIQ.ChartEngine,
    xy: any[],
    label: string,
    color: string,
    opacity?: number
  ): any[]

  /**
   * Default function to draw a legend for the series that are displayed on the chart.
   *
   * See CIQ.ChartEngine.Chart#legendRenderer for activation and customization details.
   *
   * @param stx The chart object to draw
   * @param  params parameters for drawing the legend
   * @param  [params.chart] The chart object
   * @param  [params.legendColorMap] A map of series names to colors and display symbols ( example  IBM:{color:'red', display:'Int B M'} )
   * @param  [params.coordinates] Coordinates upon which to draw the items, in pixels relative to top left of panel ( example  {x:50, y:0} ).  If null, uses chart.legend
   * @param  [params.noBase] Set to true to not draw the base (the chart symbol's color) in the legend
   */
  function drawLegend(
    stx: CIQ.ChartEngine,
    params: {
      chart?: CIQ.ChartEngine.Chart,
      legendColorMap?: object,
      coordinates?: object,
      noBase?: boolean
    }
  ): void

  /**
   * Checks if two colors are the same.  Will compare alpha channel is provided as well.
   * @param  color1 First color, in rgb, rgba, css hex, or literal format
   * @param  color2 Second color, in rgb, rgba, css hex, or literal format
   * @return       true if equivalent
   * @example
   * var isSame=CIQ.colorsEqual("rgba (255,255,255,0.3)", "#FFFFFF");
   * 		returns false
   * var isSame=CIQ.colorsEqual("rgba (255,255,255,1)", "#FFFFFF");
   * 		returns true
   * @since 4.0.0
   */
  function colorsEqual(color1: string, color2: string): boolean

  /**
   * Converts an RGB or RGBA color or
   * <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/color_value" target="_blank"> CSS
   * color keyword</a> to a six-digit hexadecimal color number.
   *
   * @param [color=#000000] The RGB or RGBA color or CSS color keyword.
   * @return A six-digit hexadecimal color number. If the `color` parameter is not provided
   * 		or has the value "transparent", "#000000" is returned.
   *
   * @since 4.0.0 Converts three-digit hexadecimal color numbers (#FFC) to six-digit numbers
   * 		(#FFFFCC).
   *
   * @example
   * console.log(CIQ.colorToHex("rgb(255, 255, 0)")); // #ffff00
   * console.log(CIQ.colorToHex("rgba(255, 255, 0, 0.3)")); // #ffff00
   * console.log(CIQ.colorToHex("#ff0")); // #ffff00
   * console.log(CIQ.colorToHex("yellow")); // #ffff00
   */
  function colorToHex(color?: string): string

  /**
   * Converts six-digit hexadecimal color numbers and RGB and RGBA color values to RGBA color values.
   *
   * @param color A six-digit hexadecimal color number or RGB or RGBA color value; for
   * 		example, "#FF00FF", "#ff00ff", "rgb(255,0,255)", or "rgba(255,0,255,0.5)".
   * 		<p>If the argument is an RGB or RGBA color, the RGB color values remain the same, but the
   * 		opacity is set to `opacity`. If the `opacity` parameter is not provided, an RGB color is
   * 		given the default opacity; an RGBA color is returned unchanged. See examples below.
   * 		<p>**Note:** Three-digit hexadecimal color numbers and
   * 		<a href="https://developer.mozilla.org/en-US/docs/Web/CSS/color_value" target="_blank">
   * 		CSS color keywords</a> are not accepted.
   * @param [opacity=1] The alpha value of the color. Values must be greater than or equal
   * 		to 0. Values greater than 1 are divided by 100.
   * @return An RGBA color value.
   *
   *
   * @example
   * console.log(CIQ.hexToRgba("#FF00FF")); // rgba(255,0,255,1)
   * console.log(CIQ.hexToRgba("#FF00FF", 0.75)); // rgba(255,0,255,0.75)
   * console.log(CIQ.hexToRgba("#FF00FF", 2)); // rgba(255,0,255,0.02)
   * console.log(CIQ.hexToRgba("rgb(255,0,255)")); // rgba(255,0,255,1)
   * console.log(CIQ.hexToRgba("rgb(255,0,255)", 0.75)); // rgba(255,0,255,0.75)
   * console.log(CIQ.hexToRgba("rgba(255,0,255,0.5)", 0.75)); // rgba(255,0,255,0.75)
   * console.log(CIQ.hexToRgba("rgba(255,0,255,0.5)")); // rgba(255,0,255,0.5)
   * console.log(CIQ.hexToRgba("#F0F")); // CIQ.hexToRgba: invalid hex : F0F
   * console.log(CIQ.hexToRgba("fuchsia")); // CIQ.hexToRgba: invalid hex : fuchsia
   */
  function hexToRgba(color: string, opacity?: number): string

  /**
   * Converts a color to the internal format used by the browser. This allows
   * interchange of hex, rgb, rgba colors
   * @param  color A CSS color
   * @return       The native formatted color
   */
  function convertToNativeColor(color: string): string

  /**
   * Returns true if the color is transparent. In particular it checks rgba status. Note that the charting engine
   * often interprets transparent colors to mean that a color should be automatically determined based on the brightness
   * of the background.
   * @param   color The color (from CSS)
   * @return       True if transparent
   */
  function isTransparent(color: string): boolean

  /**
   * Converts a color from hex or rgb format to Hue, Saturation, Value.
   * @param  color The color (from CSS)
   * @return       [Hue, Saturation, Value], or null if invalid color.
   */
  function hsv(color: string): any[]

  /**
   * Converts an HSL color value to RGB. The conversion formula is adapted from
   * http://en.wikipedia.org/wiki/HSL_color_space.
   *
   * Assumes the values for `h`, `s`, and `l` are contained in the set [0, 1] and the returned
   * RGB values are in the set [0, 255].
   *
   * @param h Hue
   * @param s Saturation
   * @param l Lightness
   * @return The RGB representation of the color.
   *
   * @since 7.5.0
   */
  function hslToRgb(h: number, s: number, l: number): any[]

  /**
   * Chooses either a white or black foreground color depending on the "lightness" of the background color. Note that this simply
   * checks if the value is above the hue which works well but not ideally for red colors which the human eye interprets differently.
   * More complex algorithms are available but chartists rarely use red as a background color.
   * @param  backgroundColor The background color (CSS format)
   * @return                 Either #000000 (black) or #FFFFFF (white) depending on which will look best on the given background color
   */
  function chooseForegroundColor(backgroundColor: string): string

  /**
   * Convert a pattern type to an array useful for setting the context.setLineDash
   * @param [width=1] A valid lineWidth from 1
   * @param [pattern=solid] A valid pattern (solid, dotted, dashed)
   * @return The array representing pixels of draw/skip etc.  Use it as argument to context.setLineDash()
   * @since 4.0.0
   */
  function borderPatternToArray(width?: number, pattern?: string): any[]

  /**
   * Gets the background color of an element by traversing up the parent stack.
   * @param  el The element to examine
   * @return    The background color
   */
  function getBackgroundColor(el: HTMLElement): string

  /**
   * Converts a string form date into a JavaScript Date object with time. Supports various standard date formats
   * @param  dt String form of a date (such as yyyymmddhhmm, yyyy-mm-dd hh:mm, etc)
   * @return    A JavaScript Date object
   */
  function strToDateTime(dt: string): Date

  /**
   * Converts a string form date into a JavaScript object. Only use if you know that the string will not include a time, otherwise use @see CIQ.strToDateTime
   * @param  dt - Date in string format such as MM/DD/YY or YYYYMMDD or 2014-10-25T00:00:00+00:00 or 201506170635
   * @return    JavaScript date object -new Date()-
   */
  function strToDate(dt: string): Date

  /**
   * Formats a date according to an input string; for example, "YYYY:MM:dd hh:mm".
   *
   * All matching tokens in the input string are replaced by their corresponding date or time value.
   * Supported tokens and their values are as follows:
   * - YYYY = full year
   * - MM = month
   * - dd = day
   * - HH = hours (24-hour format)
   * - hh = hours (12-hour format)
   * - mm = minutes
   * - ss = seconds
   * - SSS = milliseconds
   *
   * Values are formatted with leading zeroes as necessary.
   *
   * **Note:** This function is less performant than the special-purpose format functions defined in
   * this namespace, such as CIQ.mmddyyyy and CIQ.yyyymmdd, and should be used
   * accordingly.
   *
   * @param dt The date to format.
   * @param str The format for the date.
   * @return The formatted date string.
   *
   * @since 8.1.0
   */
  function dateToStr(dt: Date, str: string): string

  /**
   * Converts a JavaScript Date or string form date to mm/dd/yyyy format
   * @param  dt Date in JavaScript Date or string format such as YYYY-MM-DD
   * @return   Date in mm/dd/yyyy format
   * @since 2016-07-16
   */
  function mmddyyyy(dt: string): string

  /**
   * Converts a JavaScript Date to yyyy-mm-dd format
   * @param  dt JavaScript Date object
   * @return    Date in yyyy-mm-dd format
   */
  function yyyymmdd(dt: Date): string

  /**
   * Converts a JavaScript `Date` object to hh:mm format.
   *
   * @param dt `Date` object to be converted.
   * @return Time of the converted `Date` object in hh:mm format.
   *
   * @since 8.0.0
   */
  function hhmm(dt: Date): string

  /**
   * Converts a JavaScript Date to hh:mm:ss format
   * @param  dt JavaScript Date object
   * @return    Time in hh:mm:ss format
   * @since 6.3.0
   */
  function hhmmss(dt: Date): string

  /**
   * Converts a date into yyyymmddhhmm format
   * @param  dt A JavaScript Date object
   * @return    Date in yyyymmddhhmm format
   */
  function yyyymmddhhmm(dt: Date): string

  /**
   * Converts a date into yyyymmddhhmmssmmm format
   * @param  dt A JavaScript Date object
   * @return    Date in yyyymmddhhmmssmmm format
   */
  function yyyymmddhhmmssmmm(dt: Date): string

  /**
   * Converts a date into yyyy/mm/dd hh:mm format
   * @param  dt A JavaScript Date object
   * @return    Date in yyyy/mm/dd hh:mm format
   */
  function friendlyDate(dt: Date): string

  /**
   * Converts a string form date into mm-dd hh:mm format
   * @param  strdt Date in string format (such as yyyymmddhhmm, yyyy-mm-dd hh:mm, etc)
   * @return       Date in mm-dd hh:mm format
   * @since 5.0.0 will output seconds and millis if present
   */
  function mmddhhmm(strdt: string): string

  /**
   * Gets the day of the year
   * @param  [dt] optional	The date to check.  If omitted, will use the current date.
   * @return 			Day of year
   */
  function getYearDay(dt?: Date): number

  /**
   * Gets the current time in Eastern Time Zone. This can be used as a convenience for determining open and closing times of US markets.
   * @return JavaScript Date representing the time in Eastern Time Zone
   */
  function getETDateTime(): Date

  /**
   * Converts a JavaScript date from Eastern Time Zone to the browser's local time zone. Daylight Savings Time is hard coded. @see CIQ.getETDateTime
   * @param  est JavaScript Date object representing a date/time in eastern time zone
   * @return     JavaScript Date object converted to browser's local time zone
   */
  function fromET(est: Date): Date

  /**
   * Convenience function for creating a displayable month name using CIQ.monthLetters and CIQ.monthAbv.
   * Please note that those arrays may not be utilized if the library is used in conjunction with Internationalization.
   * This method is used primarily to create the x-axis of a chart
   * @param  i              The numerical month (0-11)
   * @param  displayLetters - True if just the first letter should be displayed (such as a tight display)
   * @param  [stx]            The chart object, only necessary if Internationalization is in use
   * @return                String representation of the month
   */
  function monthAsDisplay(i: number, displayLetters: boolean, stx?: object): string

  /**
   * Displays a time in readable form. If Internationalization is in use then the time will be in 24 hour Intl numeric format
   * @param  dt  JavaScript Date object
   * @param  [stx] Chart object if Internationalization is in use
   * @param [precision] Precision to use. If `null` then `hh:mm`. `CIQ.SECOND` then `hh:mm:ss`. If `CIQ.MILLISECOND` then `hh:mm:ss.mmmmm`
   * @return     Human friendly time, usually hh:mm
   */
  function timeAsDisplay(dt: Date, stx?: object, precision?: number): string

  /**
   * Creates a displayable date string according to the current chart settings and periodicity.
   *
   * Formats the date using one of the following formatters or default format (in order of
   * preference):
   *
   * 1. Chart x-axis formatter
   * 2. Chart engine internationalizer
   * 3. Default format
   *    a. Daily — mm/dd/yyyy
   *    b. Intraday — mm/dd hh:mm[:ss[:ms]]
   *
   * This method is used in CIQ.ChartEngine#headsUpHR to format the
   * date label that floats over the x-axis. Overwrite this method as needed to achieve the desired
   * date format.
   *
   * @param stx The charting object.
   * @param chart	The chart to which the date applies.
   * @param dt The date to format.
   * @param [includeIntraYear] If true, include the year in the intraday dates.
   * @return The formatted date.
   *
   * @since
   * - 4.0.0
   * - 8.2.0 Added the `includeIntraYear` parameter.
   */
  function displayableDate(
    stx: CIQ.ChartEngine,
    chart: CIQ.ChartEngine.Chart,
    dt: Date,
    includeIntraYear?: boolean
  ): string

  /**
   * Converts a Date object from one time zone to another using the timezoneJS.Date library
   * @param  dt                    Original JavaScript Date object, from the original time zone
   * @param  originalTimeZone    The original time zone
   * @param  targetTimeZone      The target time zone
   * @return            The date in the target timezone. This is a timezoneJS.Date which behaves the same as a native Date.
   */
  function convertTimeZone(dt: Date, originalTimeZone: string, targetTimeZone: string): Date

  /**
   * This method converts a time from another timezone to local time on the browser
   * @param  dt               The original time
   * @param  originalTimeZone A valid timezone
   * @return                  The date converted to local time
   */
  function convertToLocalTime(dt: Date, originalTimeZone: string): Date

  /**
   * Convenience function for dynamically creating a new node and appending it into the DOM.
   * @param  div       The targeted parent node
   * @param  tagName   The type of node to be created
   * @param  [className] Optional class name to set the new node
   * @param [txt] Optional text to insert
   * @return           The new node
   */
  function newChild(
    div: object,
    tagName: string,
    className?: string,
    txt?: string
  ): object

  /**
   * Microsoft RT disallows innerHTML that contains DOM elements. Use this method to override when necessary.
   * @param  node A valid DOM element to change innerHTML
   * @param  html The html text to change
   * @example
   * CIQ.innerHTML(node, "My innerHTML contains a span and MS RT doesn't like that");
   */
  function innerHTML(node: object, html: string): void

  /**
   * Microsoft surface bug requires a timeout in order for the cursor to show up in a focused
   * text box. iPad also, sometimes, when embedded in an iframe, so set useTimeout if in an iframe!
   * @param  node       A DOM element to focus
   * @param  useTimeout Whether to apply a timeout or not. If number then the number of milliseconds.
   */
  function focus(node: object, useTimeout: number): void

  /**
   * Reliable, cross-device blur method
   * @param  [node] The element to blur. If not supplied then document.activeElement will be blurred
   */
  function blur(node?: HTMLElement): void

  /**
   * Find all nodes that match the given text. This is a recursive function so be careful not to start too high in the DOM tree.
   * @param  startNode A valid DOM element from which to start looking
   * @param  text      The text to search for
   * @return           An array of nodes that match the text
   */
  function findNodesByText(startNode: object, text: string): any[]

  /**
   * Hide nodes that match a certain text string.
   * @param  startNode A valid DOM element from which to start looking
   * @param  text      The text to match against
   *  CIQ.findNodesByText
   */
  function hideByText(startNode: object, text: string): void

  /**
   * Returns the height of the page. It is aware of iframes and so will never return a value that is greater
   * than the value of the parent
   * @return Height of page in pixels
   */
  function pageHeight(): number

  /**
   * Returns the width of the page. It is aware of iframes and so will never return a value that is greater
   * than the value of the parent
   * @return Width of page in pixels
   */
  function pageWidth(): number

  /**
   * Strips the letters "px" from a string. This is useful for converting styles into absolutes.
   * @param  text - String value with "px"
   * @return      The numeric value
   * @example
   * var leftPosition=CIQ.stripPX(node2.style.left)
   */
  function stripPX(text: string): number

  /**
   * Returns true if a point, in absolute screen position, is within an element
   * @param  node A valid DOM element to check whether the point overlaps
   * @param  x    Absolute screen X position of pointer
   * @param  y    Absolute screen Y position of pointer
   * @return      True if the point lies inside of the DOM element
   */
  function withinElement(node: object, x: number, y: number): boolean

  /**
   * Sets a property or style of a DOM element only if the property or style does not already have
   * the provided value.
   *
   * This is more efficient than needlessly updating the DOM.
   *
   * @param node The DOM element to update.
   * @param member The DOM element's property or style to update.
   * @param value The value to set.
   * @return true if the value of `member` was changed.
   *
   * @since
   * - 4.0.0
   * - 8.1.0 Added return value.
   *
   * @example
   * <caption>Set the HTML content of a DOM element.</caption>
   * CIQ.efficientDOMUpdate(node, "innerHTML", htmlString);
   *
   * @example
   * <caption>Set a style property of a DOM element.</caption>
   * CIQ.efficientDOMUpdate(controls.floatDate.style, "width", "auto");
   */
  function efficientDOMUpdate(node: HTMLElement, member: string, value: string): boolean

  /**
   * Creates a virtual DOM for an element.
   *
   * A virtual DOM is faster and more efficient than the actual DOM for manipulation of an
   * element's children.
   *
   * **Note:** Use CIQ.cqrender to render the virtual DOM on the real DOM.
   *
   * @param node The node for which the virtual DOM is created.
   * @return The virtual DOM of `node`.
   *
   * @since 8.1.0
   */
  function cqvirtual(node: HTMLElement): object

  /**
   * Removes from `node` all children that do not match `selector`. Removes all children if no
   * selector is provided.
   *
   * @param node Parent node from which child nodes are removed.
   * @param [selector] CSS selector used to select child nodes that are not removed from
   * 		`node`.
   * @return `node`, containing only those children selected by `selector`; all other
   * 		children removed.
   *
   * @since 8.1.0
   */
  function removeChildIfNot(node: HTMLElement, selector?: string): HTMLElement

  /**
   * Used in conjunction, safeMouseOut and safeMouseOver ensure just a single event when the mouse moves
   * in or out of an element. This is important because simple mouseout events will fire when the mouse
   * crosses boundaries *within* an element. Note that this function will do nothing on a touch device where
   * mouseout is not a valid operation.
   * @param  node A valid DOM element
   * @param  fc   Function to call when the mouse has moved out
   */
  function safeMouseOut(node: object, fc: Function): void

  /**
   * This method is guaranteed to only be called once when a user mouses over an object. @see CIQ.safeMouseOut
   * @param  node A valid DOM element
   * @param  fc   Function to call when mouse moves over the object
   */
  function safeMouseOver(node: object, fc: Function): void

  /**
   * Use this instead of onclick or ontouch events. This function will automatically use the quickest available
   * but also protect against being called twice.
   * By default any previous safeClickTouch listeners will be cleared (to allow re-use of the element).
   * @param div The DOM element to attach an event
   * @param fc The function to call when the object is pressed
   * @param params Parameters to drive behavior.
   * @param [params.safety] An object, generated from a CIQ.safeDrag association to prevent the click from being triggered when a drag operation is released
   * @param [params.allowMultiple=false] If set then multiple click events can be associated with the node
   * @param [params.preventUnderlayClick=true] By default prevents an underlaying element from being "clicked" on a touch device 400ms after the overlay was tapped. Set to false for input fields, or any div containing input fields (body)
   * @param [params.absorbDownEvent=true] Ensures that a mousedown, pointerdown, touchstart event doesn't get passed to the parent.
   * @since 11/01/2015 Removed timers in favor of a new algorithm. This algorithm allows only the first event to fire from a UI interaction to execute the fc function.
   */
  function safeClickTouch(
    div: object,
    fc: Function,
    params: {
      safety?: object,
      allowMultiple?: boolean,
      preventUnderlayClick?: boolean,
      absorbDownEvent?: boolean
    }
  ): void

  /**
   * Clears all safeClickTouch events from a DOM element.
   * @param  div The DOM element to clear events
   */
  function clearSafeClickTouches(div: object): void

  /**
   * Safe function to handle dragging of objects on the screen.
   *
   * This method is cross-device aware and can handle mouse or touch drags.
   * This method does not actually move the objects but provides callbacks that explain when drag operations
   * begin and cease, and what movements are made during the drag. Callbacks should be used to move the actual objects
   * (if it is desired to move objects during a drag operation). For convenience, displacementX and displacementY are added to callback events
   * to indicate the distance from the original starting point of the drag.
   * A "safety" object is returned which can optionally be passed into CIQ.safeClickTouch to prevent errant click events
   * from being triggered when a user lets go of a drag
   * @param  div    The draggable DOM element
   * @param  [eventHandlers]
   * @param  [eventHandlers.down] Callback function when a drag operation begins. Receives an event object.
   * @param  [eventHandlers.move] Callback function when a drag move occurs. Receives an event object.
   * @param  [eventHandlers.up]   Callback function when the drag operation ends. Receives an event object.
   * @return        Safety object which can be passed to CIQ.safeClickTouch
   * @since 7.0.0 change function signature to accept eventHandlers object instead of three function arguments
   */
  function safeDrag(
    div: object,
    eventHandlers?: {
      down?: Function,
      move?: Function,
      up?: Function
    }
  ): object

  /**
   * Captures enter key events. Also clears the input box on escape key.
   * @param node The DOM element to attach the event to. Should be a text input box.
   * @param cb Callback function when enter key is pressed.
   */
  function inputKeyEvents(node: object, cb: Function): void

  /**
   * Fixes screen scroll. This can occur when the keyboard opens on an ipad or iphone.
   */
  function fixScreen(): void

  /**
   * Sets the position of the cursor within a textarea box. This is used for instance to position the cursor at the
   * end of the text that is in a textarea.
   * @param ctrl A valid textarea DOM element
   * @param pos  The position in the text area to position
   */
  function setCaretPosition(ctrl: object, pos: number): void

  /**
   * Closes the keyboard on a touch device by blurring any active input elements.
   * @param [newFocus] Element to change focus to
   */
  function hideKeyboard(newFocus?: HTMLElement): void

  /**
   * Adds or removes hover classes.  This function will manage the hovers so they won't trigger when touching.
   * adapted from http://www.javascriptkit.com/dhtmltutors/sticky-hover-issue-solutions.shtml
   * We are relying on touchend being called before mouseover
   * @since 6.3.0
   */
  function smartHover(): void

  /**
   * Creates a document node which facilitates translation to other languages, if stx.translationCallback callback function is set.
   * If there is no translationCallback, a standard text node is returned.
   * @param  stx The chart object
   * @param  english The word to translate
   * @param [language] Language. Defaults to CIQ.I18N.language.
   * @return	A node in the following form if translationCallback exists:
   * 					<language original="english">translation</language>
   * 							If it does not exist, a text node is returned.
   */
  function translatableTextNode(stx: CIQ.ChartEngine, english: string, language?: string): HTMLElement

  /**
   * Gets all parent elements, including the starting element itself, in order of distance from the
   * starting element, nearest parent first.
   *
   * Use instead of jQuery `parents()`.
   *
   * @param el The starting element from which parent elements are obtained.
   * @param [selector] A CSS selector used to select the parent elements included in the
   * 		ancestor list. If no selector is provided, all parent elements are included.
   * @return Ancestry of elements filtered by `selector` from the starting element up to and
   * 		including the HTML element.
   *
   * @since 8.1.0
   */
  function climbUpDomTree(el: HTMLElement, selector?: string): any[]

  /**
   * Returns a guaranteed width and height. For instance, `cq-context` or any other wrapping tag can
   * have a width of zero; if so, we need to go up the ancestry tree parent by parent until a
   * parent element provides an actual width and height.
   *
   * @param element The starting element for which the width and height are obtained.
   * @return Width and height of `element` as properties of the returned object.
   *
   * @since 8.1.0
   */
  function guaranteedSize(element: Element): object

  /**
   * Determines the visibility of a DOM element based on the following CSS properties:
   * - opacity
   * - display
   * - visibility
   * - width
   * - height
   *
   * Replaces CIQ.UI.trulyVisible.
   *
   * @param node The node for which visibility is determined.
   * @return Whether the element is visible.
   *
   * @since 8.2.0
   */
  function trulyVisible(node: HTMLElement): boolean

  /**
   * Measures an element's styled width and height. Assumes all style units are in pixels (px), not
   * percentages or "auto".
   *
   * Use the `flags` parameter to specify whether padding, border, and margin should be included in
   * the measurement.
   *
   * @param element The element to measure.
   * @param [flags] Measurement parameters.
   * @param [flags.padding] Include padding in the measurement.
   * @param [flags.border] Include border in the measurement.
   * @param [flags.margin] Include margin in the measurement.
   * @return Width and height as properties of the returned object.
   *
   * @since 8.1.0
   */
  function elementDimensions(
    element: HTMLElement,
    flags?: {
      padding?: boolean,
      border?: boolean,
      margin?: boolean
    }
  ): object

  /**
   * Executes a listener function if the element being observed has been resized.
   * Uses the [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) API if available, otherwise uses an interval check.
   *
   * @param element The element to observe for resizing.
   * @param listener The function to be executed on a resize event.
   * @param resizeHandle A handle to the resizer, which is null the first time the function is called,
   * 		or is the return value of the function for subsequent calls.
   * @param timeout Timeout interval for browsers that need to use interval checking. Set this value
   * 		to 0 to turn off the observer.
   * @return A handle to the resizer, which can be passed again to the function to disable or reset
   * 		the handle.
   * @since 7.4.0
   */
  function resizeObserver(
    element: HTMLElement,
    listener: Function,
    resizeHandle: object,
    timeout: number
  ): object

  /**
   * Turns a portion of raw text into multi-line text that fits in a given width. This is used for autoformatting of annotations
   * @param  ctx    A valid HTML Canvas Context
   * @param  phrase The text
   * @param  l      The width in pixels to fit the text within on the canvas
   * @return        An array of individual lines that should fit within the specified width
   */
  function getLines(ctx: object, phrase: string, l: number): any[]

  /**
   * Creates a user-friendly alert.
   *
   * The charting engine uses this function instead of
   * [window.alert()]https://developer.mozilla.org/en-US/docs/Web/API/Window/alert for
   * warning and error messages. If the window object does not exist, the message is output to the
   * console log.
   *
   * Override this function to create a custom alert.
   *
   * @param text The message to be displayed.
   *
   * @since 8.0.0 Output the message to the console log if the window object does not exist.
   *
   * @example
   * // Override with a friendlier alert mechanism!
   * CIQ.alert=function(text){
   * 	doSomethingElse(text);
   * }
   */
  function alert(text: string): void

  /**
   * Set once after user is alerted that private browsing is enabled
   */
  let privateBrowsingAlert: boolean

  /**
   * Convenience function for storing a name/value pair in local storage. Detects whether private
   * browsing is enabled since local storage is inoperable under private browsing.
   *
   * @param name The name for the stored item.
   * @param value The value for the stored item.
   *
   */
  function localStorageSetItem(name: string, value: string): void

  /**
   * Converts a future month to the month index or vice versa. Month indexes begin with 1 for
   * January.
   *
   * @param x The value to convert. If numeric, converted to future month letter. If
   * 		alphabetical, converted to month index.
   * @return The converted value.
   *
   */
  function convertFutureMonth(x: string): string

  /**
   * Prints out a number in US Dollar monetary representation
   * @param  val      The amount
   * @param  [decimals=2] Number of decimal places.
   * @param  [currency] Currency designation.  If omitted, will use $.
   * @return          US Dollar monetary representation
   * // Returns $100.00
   * CIQ.money(100, 2);
   */
  function money(val: number, decimals?: number, currency?: string): string

  /**
   * Converts a currency code from ISO to char
   * @param  code      The string to convert, e.g. USD
   * @return          The converted string, e.g. $
   */
  function convertCurrencyCode(code: string): string

  /**
   * Returns a string representation of a number with commas in thousands, millions or billions places. Note that this function does
   * not handle values with more than 3 decimal places!!!
   * @param  val The value
   * @return     The result with commas
   * @example
   * // Returns 1,000,000
   * CIQ.commas(1000000);
   */
  function commas(val: number): string

  /**
   * Convenience function to convert API periodicity parameters to internal periodicity format.
   * @param  period The period value as required by CIQ.ChartEngine#setPeriodicity
   * @param  [interval] The interval value as required by CIQ.ChartEngine#setPeriodicity
   * @param  timeUnit The timeUnit value as required by CIQ.ChartEngine#setPeriodicity
   * @return object containing internally compliant periodicity,interval, timeUnit
   * @since 5.1.1
   */
  function cleanPeriodicity(period: number, interval: number, timeUnit: string)
  function cleanPeriodicity(period: number, timeUnit: string)

  /**
   * Creates a string with a periodicity that is easy to read given a chart
   * @param  stx A chart object
   * @return     A periodicity value that can be displayed to an end user
   */
  function readablePeriodicity(stx: CIQ.ChartEngine): string

  /**
   * Given a numeric price that may be a float with rounding errors, this will trim off the trailing zeroes
   * @param  price The price
   * @return       The price trimmed of trailing zeroes
   */
  function fixPrice(price: number): number

  /**
   * Condenses a number into abbreviated form by adding "k","m","b" or "t".
   * This method is used in the y-axis for example with volume studies.
   * @param  txt - A numerical value
   * @return     Condensed version of the number if over 999, otherwise returns `txt` untouched
   * @example
   * // This will return 12m
   * condenseInt(12000000);
   * @since 4.0.0 Now returns `txt` untouched if under 1000. Previously was removing all decimal places.
   */
  function condenseInt(txt: number): string

  /**
   * Determines how many decimal places the security trades.
   *
   * This is the default calculateTradingDecimalPlaces function.  It is used by CIQ.ChartEngine#setMasterData to round off the prices
   * to an appropriate number of decimal places.  The function is assigned to CIQ.ChartEngine.Chart#calculateTradingDecimalPlaces},
   * but you may set to your own logic instead.
   *
   * The default algorithm is to check the most recent 50 quotes and find the maximum number of decimal places that the stock has traded.
   * This will work for most securities but if your market data feed has rounding errors
   * or bad data then you may want to supplement this algorithm that checks the maximum value by security type.
   *
   * It defaults to a minimum of 2 decimals.
   * @param params Parameters
   * @param  params.stx    The chart object
   * @param params.chart The chart in question
   * @param  params.symbol The symbol string
   * @param  params.symbolObject The symbol object. If you create charts with just stock symbol then symbolObject.symbol will contain that symbol
   * @return        The number of decimal places
   * @example
   * //set your own logic for calculating decimal places.
   * var stxx=new CIQ.ChartEngine({container:document.querySelector(".chartContainer"), preferences:{labels:false, currentPriceLine:true, whitespace:0}});
   * stxx.chart.calculateTradingDecimalPlaces=yourCustomFunction;
   * @example
   // default code
   CIQ.calculateTradingDecimalPlaces=function(params){
   var chart=params.chart;
   var decimalPlaces=2;
   var quotesToCheck = 50; // Check up to 50 recent quotes
   var masterData=chart.masterData;
   if(masterData && masterData.length > quotesToCheck){
   // exclude the current quote by setting i=2 in case animation is enabled. Animation uses very large decimals to allow for smooth movements.
   for(var i=2;i<quotesToCheck;i++){
   var position=masterData.length-i;
   if(position<0) break;
   var quotes=masterData[position];
   if(quotes.Close && typeof quotes.Close == 'number'){
   var cs=quotes.Close.toString();
   var point=cs.indexOf('.');
   if(point!=-1){
   var dp = cs.length-point-1;
   if(dp>decimalPlaces){
   decimalPlaces=dp;
   }
   }
   }
   }
   }
   var maxDecimalPlaces=chart.yAxis.maxDecimalPlaces;
   if(decimalPlaces>maxDecimalPlaces && maxDecimalPlaces!==null) decimalPlaces=maxDecimalPlaces;
   return decimalPlaces;
   };
   */
  function calculateTradingDecimalPlaces(
    params: {
      stx: CIQ.ChartEngine,
      chart: CIQ.ChartEngine.Chart,
      symbol: string,
      symbolObject: object
    }
  ): number

  /**
   * This method will return a tuple [min,max] that contains the minimum
   * and maximum values in the series where values are `series[field]`.
   *
   * @param series The series
   * @param field The name of the series to look at
   * @param subField The name of the field within the series to look at
   * @param highLow True when comparing max High/min Low vs a specific field
   * @return Tuple containing min and max values in the series
   * @since 5.1.0 Added subField, highLow arguments
   */
  function minMax(
    series: any[],
    field: string,
    subField: string,
    highLow: boolean
  ): any[]

  /**
   * Convenience function to iterate through the charts masterData and add a data member.
   * Used to load initial data for additional series and study symbols and should normally not be called directly. Unless used inside a study initialize function; use CIQ.ChartEngine#addSeries or CIQ.ChartEngine#updateChartData instead.
   * Can be used with any array of data objects which contains at least the 'DT' (date in javascript format) and 'Close' ( close/last price ) elements of an [OHLC object]{@tutorial InputDataFormat}.
   * @param params Parameters object
   * @param [params.stx]       	A chart object
   * @param [params.data]		 			The data to add (which should align or closely align with the chart data by date)
   * @param [params.fields] 				The fields from the incoming data objects to extract and add as the new members in each masterData object. One new member will be added per field using the exact same name as in the incoming data. Example: (for each field name in the array) masterData[mIterator][fieldN]=data[dIterator][fieldN]. Takes precedence over `createObject`, `label` and `fieldForLabel` parameters.  Use fields=["*"] to copy all fields in the data object.
   * @param [params.label]     			The name of the new member to add into each masterData object. Example: masterData[mIterator][label]=data[dIterator]["Close"]. Required unless "fields" is specified.
   * @param [params.createObject] 		If truthy, then each complete incoming data object will be assigned to the new label member in each masterData object. If set to "aggregate", will consolidate the OHLV data with the new data. The data object is expected to be a properly formatted OHLC record, or at least contain a 'Close' price, otherwise this parameter will not be honored. Example: masterData[mIterator][label]=data[dIterator]. This behavior is mutually exclusive with `fields`. If the data object contains a 'Value' field, this parameter will not be honored and instead the 'Value' field will be used as follows: masterData[mIterator][label] = data[dIterator]["Value"];
   * @param [params.fieldForLabel="Close"] 	If set, this will be the field from each incoming data object that will be copied into the new label member in each masterData object. If not set, "Close" or "Value" is used, whichever exists; and if neither exists, it will attempt to copy over a field matching the `label` name. Example: masterData[mIterator][label]=data[dIterator][fieldForLabel]. This behavior is mutually exclusive with `fields` and `createObject`.
   * @param [params.fillGaps]			If true then gaps in data will be filled by carrying forward the value of from the previous bar.
   * @param [params.noCleanupDates]		If true then dates have been cleaned up already by calling CIQ.ChartEngine#doCleanupDates, so do not do so in here.
   * @param [params.chart]   The chart to update
   * @example
   * //data element format if neither fields, fieldForLabel or createObject are used
   * {DT:epoch,Date:strDate,Value:value}
   * {DT:epoch,Date:strDate,Close:value }
   * //data element format if fields is used
   * {DT:epoch,Date:strDate,Field1:value,Field2:value,Field3:value,Field4:value}
   * //data element format if createObject is used
   * {DT:epoch,Date:strDate,AnyOtherData:otherData,MoreData:otherData,...}
   * @since
   * - 04-2015
   * - 15-07-01 Added `fieldForLabel` argument.
   * - 3.0.0 All data sent in will be forced into the chart. Dates are no longer required to be exact matches (minutes, hours, seconds, milliseconds) in order to show up in comparisons.
   * - 4.0.0 Arguments are now parameterized. Backward compatibility with old signature.
   * - 4.0.0 Added ability to specify copying of all fields by setting `params.fields=["*"]`.
   * - 5.2.0 Enhanced parameter `createObject` to take a string.
   * - 5.2.0 Added parameter `noCleanupDates`.
   */
  function addMemberToMasterdata(
    params: {
      stx?: CIQ.ChartEngine,
      data?: any[],
      fields?: any[],
      label?: string,
      createObject?: string,
      fieldForLabel?: string,
      fillGaps?: boolean,
      noCleanupDates?: boolean,
      chart?: CIQ.ChartEngine.Chart
    }
  ): void

  /**
   * Convenience function to compute xor operation.
   *
   * @param a Operand.
   * @param b Operand.
   * @return true if only one of the operands is truthy.
   * @since 7.3.0
   */
  function xor(a: object, b: object): boolean

  /**
   * Convenience function to round a floating point number.
   *
   * This has better decimal accuracy than:
   * - number.toFixed(decimals)
   * - Math.round(number*decimals)/decimals
   * @param  number The number to round
   * @param  decimals The number of decimal places
   * @return  Rounded number
   * @since 7.0.0
   */
  function round(number: number, decimals: number): number

  /**
   * Convenience function to count number of decimal places in a number
   * @param  n The number to check
   * @return  Number of decimal places
   * @since
   * - 6.1.0
   * - 6.2.0 Now handles scientific notation.
   */
  function countDecimals(n: number): number

  /**
   * Convenience function to determine if a value is a valid number.
   * @param  n The number to check
   * @return True if n is a real finite number. NaN, Infinity, null, undefined, etc are not considered to be a valid number.
   * @since 5.2.2
   */
  function isValidNumber(n: number): boolean

  /**
   * Returns the log base 10 of a value
   * @param  y The value
   * @return   log10 value
   */
  function log10(y: number): number

  /**
   * Determines whether a line intersects a box. This is used within the charting engine to determine whether the cursor
   * has intersected a drawing.
   * Note this function is meant to receive bx1, by1, bx2, by2, x0, y0, x1 and y1 as pixel values and not as ticks/axis values.
   * @param  bx1
   * @param  by1
   * @param  bx2
   * @param  by2
   * @param  x0
   * @param  y0
   * @param  x1
   * @param  y1
   * @param  vtype - Either "segment", "ray" or "line".  Anything else will default to segment.
   * @return       Returns true if the line intersects the box
   * @since
   * - 4.0.0 Added `isLog` parameter.
   * - 6.0.0 Removed `isLog` parameter.
   */
  function boxIntersects(
    bx1: number,
    by1: number,
    bx2: number,
    by2: number,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    vtype: string
  ): boolean

  /**
   * Determines whether two lines intersect
   * @param  x1
   * @param  x2
   * @param  y1
   * @param  y2
   * @param  x3
   * @param  x4
   * @param  y3
   * @param  y4
   * @param  type - Either "segment", "ray" or "line"
   * @return      Returns true if the two lines intersect
   */
  function linesIntersect(
    x1: number,
    x2: number,
    y1: number,
    y2: number,
    x3: number,
    x4: number,
    y3: number,
    y4: number,
    type: string
  ): boolean

  /**
   * Determines the Y value at which point X intersects a line (vector)
   * @param  vector - Object of type {x0,x1,y0,y1}
   * @param  x      - X value
   * @return        - Y intersection point
   */
  function yIntersection(vector: object, x: number): number

  /**
   * Determines the X value at which point Y intersects a line (vector)
   * @param  vector - Object of type {x0,x1,y0,y1}
   * @param  y      - Y value
   * @return        - X intersection point
   */
  function xIntersection(vector: object, y: number): number

  /**
   * Get the X intersection point between two lines
   * @param  ax1 Initial x coordinate start point of the first box.
   * @param  ax2 Final x coordinate end point of the first box.
   * @param  ay1 Initial y coordinate start point of the first box.
   * @param  ay2 Final y coordinate end point of the fist box.
   * @param  bx1 Initial x coordinate start point of the second box.
   * @param  bx2 Final x coordinate end point of the second box.
   * @param  by1 Initial y coordinate start point of the second box.
   * @param  by2 Final y coordinate end point of the second box.
   */
  function intersectLineLineX(
    ax1: number,
    ax2: number,
    ay1: number,
    ay2: number,
    bx1: number,
    bx2: number,
    by1: number,
    by2: number
  ): void

  /**
   * Get the Y intersection point between two lines
   * @param  ax1 Initial x coordinate start point of the first box.
   * @param  ax2 Final x coordinate end point of the first box.
   * @param  ay1 Initial y coordinate start point of the first box.
   * @param  ay2 Final y coordinate end point of the fist box.
   * @param  bx1 Initial x coordinate start point of the second box.
   * @param  bx2 Final x coordinate end point of the second box.
   * @param  by1 Initial y coordinate start point of the second box.
   * @param  by2 Final y coordinate end point of the second box.
   */
  function intersectLineLineY(
    ax1: number,
    ax2: number,
    ay1: number,
    ay2: number,
    bx1: number,
    bx2: number,
    by1: number,
    by2: number
  ): void

  /**
   * Deletes the map entries for which the right hand side is the object in question.
   * @param  map    JavaScript map object
   * @param  object The actual object to be deleted from the map
   * @return        Returns true if any object actually deleted
   */
  function deleteRHS(map: object, object: object): boolean

  /**
   * Deletes (removes) nulls or undefined fields (names) from an object. This is useful when marshalling (saving) an object where you don't wish
   * null or undefined values to show up in the marshalled object (such as when converting to JSON)
   * @param  obj         The object to scrub
   * @param  [removeNulls] Whether or not to remove null values
   */
  function scrub(obj: object, removeNulls?: boolean): void

  /**
   * This method changes the target object's contents to match the contents of the source object. This is functionally equivalent
   * to `target=source` except that it preserves the existence of the target object. This is vitally important if there are data bindings
   * to the target object otherwise those data bindings would remain attached to a phantom object! The logic here is orchestrated so that you
   * will receive update, add and delete notifications for each field that changes.
   * @param target The target object
   * @param source The source object
   * @since 2015-11-1
   */
  function dataBindSafeAssignment(target: object, source: object): void

  /**
   * Clones an object. This function creates a deep (recursive) clone of an object. The object can be a primitive or an object or an array.
   * Note that cloning objects that reference DOM nodes can result in stack overflows. Use with caution.
   * @param  from The source object
   * @param  [to]   Optional existing object of same type. Can improve performance when objects are reusable.
   * @return      A deep clone of the "from" object
   */
  function clone(from: object, to?: object): object

  /**
   * Non recursive clone. This will only clone the top layer and is safe to use when objects contain DOM nodes.
   * @param  from - Object to be cloned
   * @return      A shallow clone of the "from" object
   */
  function shallowClone(from: object): object

  /**
   * Accepts a default parameters object and sets the field values for the target *only if they are missing*.
   * Note that a value of null will not be overridden. Only undefined (missing) values will be overridden.
   * @param  target The object needing potential default values
   * @param  defaults Default values
   * @return        Returns the modified target object
   * @since  3.0.0
   * @example
   * var target={"color":"red"};
   * var defaults={"color":"blue", "shape":"triangle"};
   * CIQ.ensureDefaults(target, defaults);
   * >> target==={"color":"red", "shape":"triangle"};
   */
  function ensureDefaults(target: object, defaults: object): object

  /**
   * Copies the contents of one object into another.
   * This is useful if there are pointers to the target object and you want to "replace" it with another object while preserving the pointer.
   * @param  target The object being pointed to
   * @param  source The object containing the values you want pointed at
   * @return        Returns the modified target object
   * @since  7.1.0
   * @example
   * var target={"color":"red", "pattern":"solid"};
   * var source={"color":"blue", "shape":"triangle"};
   * CIQ.transferObject(target, source);
   * >> target==={"color":"blue", "shape":"triangle"};
   * >> target!==source;
   */
  function transferObject(target: object, source: object): object

  /**
   * Returns true if the objects are an exact match
   * @param  a First object
   * @param  b Second object
   * @param  [exclude] Exclude these fields
   * @return   True if they are an exact match
   */
  function equals(a: object, b: object, exclude?: object): boolean

  /**
   * Returns true if an object has no members
   * @param   o A JavaScript object
   * @return   True if there are no members in the object
   */
  function isEmpty(o: object): boolean

  /**
   * Convenience function returns the first property in an object. Note that while this works in all known browsers
   * the EMCA spec does not guarantee that the order of members in an object remain static. This method should therefore
   * be avoided. When ordering is important use an Array!
   * @param  o A JavaSCript object
   * @return   The first element in the object or null if it is empty
   */
  function first(o: object): object

  /**
   * Convenience function for returning the last property in an object. Note that while this works in all known browsers
   * the EMCA spec does not guarantee that the order of members in an object remain static. This method should therefore
   * be avoiding. When ordering is important use an Array!
   * @param  o A JavaScript object
   * @return   The final member of the object or null if the object is empty
   */
  function last(o: object): object

  /**
   * Returns the number of members in an object
   * @param  o A valid JavaScript object
   * @return   The number of members in the object
   */
  function objLength(o: object): number

  /**
   * Given a dot notation string, we want to navigate to the location
   * in a base object, creating the path along the way
   * @param  base      Base object.
   * @param  extension String in dot notation
   * @return           A tuple containing obj and member
   * @since  2015-11-1
   * @example
   * var tuple=CIQ.deriveFromObjectChain(stx.layout, "pandf.box");
   * tuple.obj===stx.layout.pandf
   * tuble.member==="box"
   * tuple.obj[tuple.member]=3;  // stx.layout.pandf.box=3
   */
  function deriveFromObjectChain(base: object, extension: string): object

  /**
   * Create arrow notation strings (field-->property) of a given field and an array of properties
   * Used to create a set of object properties in string format for later use by CIQ.existsInObjectChain
   * Its main use is to pass field names into CIQ.ChartEngine#determineMinMax.
   * @param  field      Base object.
   * @param  properties 	Array of strings representing properties
   * @return           Array of object properties expressed in arrow notation (field-->property)
   * @since  5.1.0
   * @example
   * var fields=CIQ.createObjectChainNames("ABC.D",["High","Low"]);
   * fields===["ABC.D-->High","ABC.D-->Low"]
   */
  function createObjectChainNames(field: string, properties: any[]): any[]

  /**
   * Given an arrow notation string (a-->b-->c), we want to navigate to the location
   * in a base object, to see if it exists
   * @param  base      Base object.
   * @param  extension String in arrow notation
   * @return           A tuple containing obj and member; a null will be returned if path does not exist
   * @since  5.1.0
   * @example
   * var tuple=CIQ.existsInObjectChain(stx.dataSegment[0], "ABC.D-->High");
   * tuple.obj===stx.dataSegment[0]["ABC.D"]
   * tuple.member==="High"
   * tuple.obj[tuple.member]=28.7;  // stx.dataSegment[0]["ABC.D"].High=28.7
   */
  function existsInObjectChain(base: object, extension: string): object

  /**
   * Replacement for isPrototypeOf and instanceof so that both types of inheritance can be checked
   * @param child The object instance to check
   * @param parent Prototype
   * @return True if the object is derived from the parent
   * @since 07/01/2015
   */
  function derivedFrom(child: object, parent: object): boolean

  /**
   * This method will iterate through the object and replace all of the fields
   * using the mapping object. This would generally be used to compress an object
   * for serialization. so that for instance "lineWidth" becomes "lw". This method
   * is called recursively.
   * @param obj Object to compress
   * @param mapping Object containing name value pairs. Each name will be replaced with its corresponding value in the object.
   * @return The newly compressed object
   */
  function replaceFields(obj: object, mapping: object): object

  /**
   * Returns an object copy with any null values removed
   * @param  obj Object to remove nulls
   * @return     Object with nulls removed
   */
  function removeNullValues(obj: object): object

  /**
   * This method reverses the fields and values in an object
   * @param obj Object to reverse
   * @return The reversed object
   * @example reverseObject({ one: "a", two: "b" }) // returns { a: "one", b: "two" }
   */
  function reverseObject(obj: object): object

  /**
   * Accesses a property, method, or array in a namespace.
   *
   * Approximates optional chaining, checking whether the object at the end of `namespace` +
   * `path` exists before returning it.
   *
   * @param namespace Namespace to access.
   * @param path String in dot notation representing extension of the namespace to a
   * 		desired property, method, or array.
   * @param [defaultValue] The value returned if the requested expression does not exist.
   * 		If the requested expression is a function, set `defaultValue` to a function (usually
   * 		`function(){}`) that can be run with any required arguments. If the requested
   * 		expression is an array, set `defaultValue` to a default array, usually `[]`.
   * @return The expression sought by combining the namespace and path. If the expression
   * 		does not exist, returns `defaultValue` (if provided), otherwise returns `undefined`.
   *
   * @since 8.0.0
   *
   * @example
   * // Accesses CIQ.Studies.studyLibrary.rsi if safe to do so (if exists).
   * CIQ.getFromNS(CIQ.Studies, "studyLibrary.rsi");
   * // or
   * CIQ.getFromNS(CIQ, "Studies.studyLibrary.rsi");
   *
   * @example
   * // Accesses Math.Matrix.ScalarOperations.dotProduct(mA, mB) if safe to do so (if exists).
   * // Returns 12 if Math.Matrix.ScalarOperations.dotProduct does not exist.
   * CIQ.getFromNS(Math, "Matrix.ScalarOperations.dotProduct", (a,b)=>a*b)(3, 4);
   */
  function getFromNS(namespace: object, path: string, defaultValue?: any): any

  /**
   * Curried CIQ.getFromNS expecting a function to be returned if `obj` + `path` is not
   * found.
   *
   * @param obj Namespace to access.
   * @param path String in dot notation representing extension of the namespace to
   * 		the desired function.
   * @param [defaultValue] The value returned if the requested function does not exist.
   * @return The function sought by combining the namespace and path. If the
   * 		function does not exist, returns `function(){return defaultValue;}`.
   *
   * @since 8.0.0
   *
   * @example
   * // Invokes Math.Matrix.ScalarOperations.dotProduct with arguments (mA, mB) if safe to do so (if exists).
   * // Assigns NaN to the result if Math.Matrix.ScalarOperations.dotProduct does not exist.
   * let result=getFnFromNS(Math, "Matrix.ScalarOperations.dotProduct", NaN)(mA, mB);
   */
  function getFnFromNS(obj: object, path: string, defaultValue?: any): Function

  /**
   * Curried CIQ.getFromNS expecting the namespace to be CIQ.
   *
   * @param path String in dot notation representing extension of the CIQ
   * 		namespace to a desired property, method, or array.
   * @param [defaultValue] The value returned if the requested expression does not exist.
   * 		If the requested expression is a function, set `defaultValue` to a function (usually
   * 		`function(){}`) that can be run with any required arguments. If the requested
   * 		expression is an array, set `defaultValue` to a default array, usually `[]`.
   * @return The expression sought by combining the CIQ namespace and the path. If
   * 		the expression does not exist, returns `defaultValue` (if provided), otherwise returns
   * 		undefined.
   *
   * @since 8.0.0
   *
   * @example
   * // Accesses CIQ.Studies.studyLibrary.rsi if safe to do so (if exists).
   * CIQ.get("Studies.studyLibrary.rsi");
   * // Returns null if CIQ.Studies.studyLibrary.rsi does not exist.
   * CIQ.get("Studies.studyLibrary.rsi", null);
   */
  function get(path: string, defaultValue?: any): any

  /**
   * Curried CIQ.getFromNS expecting the namespace to be CIQ and a function to be
   * returned.
   *
   * @param path String in dot notation representing extension of the CIQ
   * 		namespace to the desired function.
   * @param [defaultValue] The value returned if the requested function does not exist.
   * @return The function sought by combining the CIQ namespace and the path.
   * 		If the function does not exist, returns `function(){return defaultValue;}`.
   *
   * @since 8.0.0
   *
   * @example
   * // Returns the function if safe to do so (if exists).
   * // Assigns "error" to the result if CIQ.Studies.removeStudy does not exist.
   * getFn("Studies.removeStudy", "error");
   */
  function getFn(path: string, defaultValue?: any): Function

  /**
   * Capitalizes the first letter of a string.
   *
   * @param string String to be capitalized.
   * @return Capitalized version of the string.
   * @since 7.4.0 Replaces String.prototype.capitalize.
   */
  function capitalize(string: string): string

  /**
   * Converts from hyphenated to camel case. Used primarily for converting css style names (which are hyphenated) to property values (which are camel case)
   * @param  name Hyphenated style name
   * @return		 Camel case style name
   */
  function makeCamelCase(name: string): string

  /**
   * Convenience function for generating a unique ID. Defaults to a short, pseudo unique ID based on the current time.
   * Radix 36 is used resulting in a compact string consisting only of letters and numerals. While not guaranteed to be
   * unique, this function has a high probability of uniqueness when it is triggered by human activity even in a large
   * user base. If called with `true` as the first argument it will instead return an RFC4122 version 4 compliant UUID.
   * @param  generateUUID If true will return a UUID.
   * @return Either a RFC4122 version 4 compliant UUID or a unique string consisting of letters and numerals
   */
  function uniqueID(generateUUID: boolean): string

  /**
   * Returns the host portion of a url
   * @param  url The url, such as document.location.href
   * @return     The host portion, including port, if the url is a valid URI
   */
  function getHostName(url: string): string

  /**
   * A parsed query string object
   * Does not support using multi-value keys (i.e. "a=1&a=2")
   * @param  [query] Query string. If not provided then the browser location's query string will be used
   * @return       An object containing the parsed values of the query string
   */
  function qs(query?: string): object

  /**
   * Convenience function for making an ajax post. If payload is non-null then the method will be set to POST, otherwise GET.
   * @param params Parameters for the post
   * @param    [params.url]         The url to send the ajax query to
   * @param    [params.payload]     An optional payload to send
   * @param  [params.cb]          Callback function when complete
   * @param    [params.contentType] Optionally override the content type
   * @param    [params.noEpoch]     By default the epoch is appended as a query string to bust caching. Set this to false to not append the epoch.
   * @param [params.method] Optionally override the HTTP method
   * @param [params.headers] Optional additional HTTP headers to send. Example: ```{"x-custom-header-1":"abc","x-custom-header-2":"123"}```
   * @param [params.responseHeaders] Optional Set to true to have callback passed the response headers from the server
   * @param [params.timeout] Optional Request timeout in msec.  If omitted, timeout is default (no timeout)
   * @param [params.ungovernable] Optional If true, request not subject to rate limiting
   * @param arg1 Payload
   * @param arg2 Callback
   * @param arg3 Ajax content type
   * @param arg4 Set to true for no epoch
   * @return True if there were no errors fetching data.
   * @since 3.0.0 Added `timeout` and `ungovernable` parameters.
   */
  function postAjax(
    params: {
      url?: string,
      payload?: string,
      cb?: CIQ.postAjax.requestCallback,
      contentType?: string,
      noEpoch?: boolean,
      method?: string,
      headers?: object,
      responseHeaders?: boolean,
      timeout?: number,
      ungovernable?: boolean
    },
    arg1: string,
    arg2: Function,
    arg3: string,
    arg4: boolean
  ): boolean

  /**
   * Dynamically load UI elements from an external HTML file. This is accomplished by rendering raw
   * HTML in an `iframe` and then cloning all of the newly created DOM elements into our main
   * document. Repeated requests for the same resource load data from the existing `iframe`.
   *
   * The title of the `iframe` is checked. External content should not have a title. By convention,
   * 404 and 500 errors have a title. And so, we can determine whether the `iframe` contains valid
   * content.
   *
   * @param url The external URL from which new UI content is fetched.
   * @param el Element to which the UI content is appended. The default is
   * 		`document.body`.
   * @param cb A callback function to call when the new UI is available.
   *
   * @since
   * - 6.1.0 Added the `el` parameter.
   * - 7.2.0 Added caching per application instance by reusing the `iframe` contents.
   */
  function loadUI(url: string, el: HTMLElement, cb: Function): void

  /**
   * Loads JavaScript dynamically. Keeps a static memory of scripts that have been loaded to
   * prevent them from being loaded twice. The callback function however is always called, even
   * if the script has already been loaded.
   *
   * @param scriptName The URL of the script to load.
   * @param [cb] Callback function to call when the script is loaded.
   * @param [isModule] If true, the script loads a module.
   *
   * @since 8.0.0 Added the `isModule` parameter.
   */
  function loadScript(scriptName: string, cb?: Function, isModule?: boolean): void

  /**
   * Loads a stylesheet.
   * @param  stylesheet Name of stylesheet file.
   * @param  cb     Function to call when the stylesheet is fully loaded
   * @since 2016-03-11
   */
  function loadStylesheet(stylesheet: string, cb: Function): void

  /**
   * Loads a feature function widget. Feature function widgets consist of a CSS file, a
   * JavaScript file, and an HTML file.
   *
   * Use this function to dynamically load content and functionality.
   *
   * @param widget Name of the widget to load. The widget's JavaScript, CSS, and HTML
   * 		files should have this name.
   * @param el Element to which to append the UI content. The default is
   * 		`document.body`.
   * @param cb Function to call when the widget is fully loaded.
   * @param isModule When true, the script loads a module.
   *
   * @since
   * - 6.1.0 Added the `el` parameter.
   * - 8.0.0 Added the `isModule` parameter.
   */
  function loadWidget(
    widget: string,
    el: HTMLElement,
    cb: Function,
    isModule: boolean
  ): void

  /**
   * Checks to see if the enabled plugins are done dynamically loading.
   * @param plugins An array of strings that define which plugins to check
   * The plugin names provided must match the following format: if cq-scriptiq is enabled, 'scriptiq' is the plugin name entered into the array
   * @param cb Function to call when all the plugins are fully loaded
   * @since 6.1.0
   */
  function waitForPlugins(plugins: any[], cb: Function): void

  /**
   * Adds style content to a document if it has not been added already.
   *
   * @param content Style content.
   * @param path Unique identifier, which prevents duplicate style inclusions.
   *
   * @since 8.0.0
   */
  function addInternalStylesheet(content: string, path: string): void

  /**
   * Adds text on the canvas for the floating label over the y axis.
   *
   * Uses native canvas functions to add the text. You can override this function if you wish to customize how the text on the floating y axis labels are displayed. See example.
   * @param   params
   * @param   params.ctx      A valid HTML Canvas Context
   * @param   params.x      Left position of drawing on canvas
   * @param   params.txt    Text for the label
   * @param   params.y      Y position of drawing on canvas
   * @param   params.margin     Margin around the text
   * @param   params.margin.left     Left margin of text
   * @param   params.margin.top     Top margin of text
   * @param   params.backgroundColor  Background color of the shape drawn under the text, if any. This is used to find the text color if there is no color specified
   * @param   params.color Text color
   * @since 3.0.0
   * @example
   * // customized version which adds a dash before the label text
   * CIQ.createLabel=function(params){
   *     // set the vertical alignment of the text
   *     params.ctx.textBaseline="middle";
   *     // set the color for the text and background color behind the text
   *     params.ctx.fillStyle=params.color?params.color:CIQ.chooseForegroundColor(params.backgroundColor);
   *     if(	params.ctx.fillStyle === params.backgroundColor){
   *         // Best effort to pick a foreground color that isn't the same as the background!
   *         if(params.backgroundColor.toUpperCase()=="#FFFFFF")
   *             params.ctx.fillStyle="#000000";
   *         else
   *             params.ctx.fillStyle="#FFFFFF";
   *     }
   *     //add the text to the canvas.
   *     // see we are adding a dash ('- ') before the text
   *     params.ctx.fillText('- '+params.txt, params.x + params.margin.left, params.y + params.margin.top);
   *     // set the horizontal alignment of the text
   *     params.ctx.textAlign="left";
   * };
   */
  function createLabel(
    params: {
      ctx: object,
      x: number,
      txt: number,
      y: number,
      margin: {
        left: object,
        top: object
      },
      backgroundColor: number,
      color: number
    }
  ): void

  /**
   * Displays a floating label over the y axis.
   *
   * Draws a rectangle on the canvas, with an arrowhead on the screen, using using CIQ.roundRect with an `edge` setting of "arrow".
   * It then calls CIQ.createLabel to print the text over this background shape; which can be customized to control the text format for these labels.
   *
   * Visual Reference:
   * ![roundRectArrow](roundRectArrow.png "roundRectArrow")
   * @param  params
   * @param  params.ctx    A valid HTML Canvas Context
   * @param  params.x      Left position of drawing on canvas
   * @param  params.top      Top position of drawing on canvas
   * @param  params.width  Width of rectangle
   * @param  params.height Height of rectangle
   * @param  params.radius Radius of rounding
   * @param  [params.fill]   Whether to fill the background, or just draw the rectangle border.
   * @param   [params.txt]    Text for the label
   * @param   [params.y]      Y position of drawing on canvas
   * @param   [params.margin]     Margin around the text
   * @param   [params.margin.left]     Left margin of text
   * @param   [params.margin.top]     Top margin of text
   * @param   [params.backgroundColor]  Background color. This is the background color of the rectangle.
   * @param   [params.color] Text color
   * @since 3.0.0 Function signature changed. This function now takes a params object instead of eight different parameters.
   */
  function roundRectArrow(
    params: {
      ctx: object,
      x: number,
      top: number,
      width: number,
      height: number,
      radius: number,
      fill?: boolean,
      txt?: number,
      y?: number,
      margin?: {
        left?: object,
        top?: object
      },
      backgroundColor?: number,
      color?: number
    }
  ): void

  /**
   * Displays a floating label over the y axis.
   *
   * Draws a rectangle on the canvas, with just the right side curved corners, using using CIQ.roundRect with an `edge` setting of "flush".
   * It then calls CIQ.createLabel to print the text over this background shape; which can be customized to control the text format for these labels.
   *
   * Visual Reference:
   * ![semiRoundRect](semiRoundRect.png "semiRoundRect")
   * @param  params
   * @param  params.ctx    A valid HTML Canvas Context
   * @param  params.x      Left position of drawing on canvas
   * @param  params.top      Top position of drawing on canvas
   * @param  params.width  Width of rectangle
   * @param  params.height Height of rectangle
   * @param  params.radius Radius of rounding
   * @param  [params.fill]   Whether to fill the background, or just draw the rectangle border.
   * @param   [params.txt]    Text for the label
   * @param   [params.y]      Y position of drawing on canvas
   * @param   [params.margin]     Margin around the text
   * @param   [params.margin.left]     Left margin of text
   * @param   [params.margin.top]     Top margin of text
   * @param   [params.backgroundColor]  Background color. This is the background color of the rectangle.
   * @param   [params.color] Text color
   * @since 3.0.0 Function signature changed. This function now takes a params object instead of eight different parameters.
   */
  function semiRoundRect(
    params: {
      ctx: object,
      x: number,
      top: number,
      width: number,
      height: number,
      radius: number,
      fill?: boolean,
      txt?: number,
      y?: number,
      margin?: {
        left?: object,
        top?: object
      },
      backgroundColor?: number,
      color?: number
    }
  ): void

  /**
   * Displays a floating label over the y axis.
   *
   * Draws a rectangle on the canvas using using CIQ.roundRect with a `radius` of 0
   * It then calls CIQ.createLabel to print the text over this background shape; which can be customized to control the text format for these labels.
   *
   * Visual Reference:
   * ![rect](rect.png "rect")
   * @param  params
   * @param  params.ctx    A valid HTML Canvas Context
   * @param  params.x      Left position of drawing on canvas
   * @param  params.top      Top position of drawing on canvas
   * @param  params.width  Width of rectangle
   * @param  params.height Height of rectangle
   * @param  [params.fill]   Whether to fill the background, or just draw the rectangle border.
   * @param   [params.txt]    Text for the label
   * @param   [params.y]      Y position of drawing on canvas
   * @param   [params.margin]     Margin around the text
   * @param   [params.margin.left]     Left margin of text
   * @param   [params.margin.top]     Top margin of text
   * @param   [params.backgroundColor]  Background color. This is the background color of the rectangle.
   * @param   [params.color] Text color
   * @since 3.0.0 Function signature changed. This function now takes a params object instead of eight different parameters.
   */
  function rect(
    params: {
      ctx: object,
      x: number,
      top: number,
      width: number,
      height: number,
      fill?: boolean,
      txt?: number,
      y?: number,
      margin?: {
        left?: object,
        top?: object
      },
      backgroundColor?: number,
      color?: number
    }
  ): void

  /**
   * Displays floating text label, without any background shapes, over the y axis.
   *
   * Calls CIQ.createLabel; which can be customized to control the text format for these labels.
   * Will draw text in the color normally used for the background shape. For example, 'green' text for the up tick and 'red' text for a down tick.
   *
   * Visual Reference:
   * ![noop](noop.png "noop")
   * @param params
   * @param params.ctx A valid HTML Canvas Context.
   * @param params.x Left position of drawing on canvas.
   * @param params.txt Text for the label.
   * @param params.y Vertical position of drawing on canvas.
   * @param params.margin Margin around the text.
   * @param params.margin.left Left margin of text.
   * @param params.margin.top Top margin of text.
   * @param params.backgroundColor Text color; since there is no background shape.
   *
   * @since
   * - 3.0.0 Function signature changed. This function now takes a params object instead of eight different parameters.
   * - 5.2.1 Will now draw text in the color normally used for the background shape. For example, 'green' text for the up tick and 'red' text for a down tick.
   */
  function noop(
    params: {
      ctx: object,
      x: number,
      txt: number,
      y: number,
      margin: {
        left: object,
        top: object
      },
      backgroundColor: number
    }
  ): void

  /**
   * Displays a floating label over the y axis.
   *
   * Draws a 'ticked' rectangle on the canvas, using using CIQ.roundRect.
   * It then calls CIQ.createLabel to print the text over this background shape; which can be customized to control the text format for these labels.
   *
   * Visual Reference:
   * ![tickedRect](tickedRect.png "tickedRect")
   * @param  params
   * @param  params.ctx    A valid HTML Canvas Context
   * @param  params.x      Left position of drawing on canvas
   * @param  params.top      Top position of drawing on canvas
   * @param  params.width  Width of rectangle
   * @param  params.height Height of rectangle
   * @param  params.radius Radius of rounding
   * @param  [params.fill]   Whether to fill the background, or just draw the rectangle border.
   * @param   [params.txt]    Text for the label
   * @param   [params.y]      Y position of drawing on canvas
   * @param   [params.margin]     Margin around the text
   * @param   [params.margin.left]     Left margin of text
   * @param   [params.margin.top]     Top margin of text
   * @param   [params.backgroundColor]  background color. This is the background color of the rectangle.
   * @param   [params.color] Text color
   * @since 3.0.0 Function signature changed. This function now takes a params object instead of eight different parameters.
   */
  function tickedRect(
    params: {
      ctx: object,
      x: number,
      top: number,
      width: number,
      height: number,
      radius: number,
      fill?: boolean,
      txt?: number,
      y?: number,
      margin?: {
        left?: object,
        top?: object
      },
      backgroundColor?: number,
      color?: number
    }
  ): void

  /**
   * Displays a floating label over the y axis.
   *
   * Draws a rectangle, with curved corners, on the canvas.
   * It then calls CIQ.createLabel to print the text over this background shape; which can be customized to control the text format for these labels.
   *
   * Visual Reference:
   * ![roundRect](roundRect.png "roundRect")
   * @param  params
   * @param  params.ctx    A valid HTML Canvas Context
   * @param  params.x      Left position of drawing on canvas
   * @param  params.top      Top position of drawing on canvas
   * @param  params.width  Width of rectangle
   * @param  params.height Height of rectangle
   * @param  params.radius Radius of rounding
   * @param  [params.fill]   Whether to fill the background, or just draw the rectangle border.
   * @param   [params.txt]    Text for the label
   * @param   [params.y]      Y position of drawing on canvas
   * @param   [params.margin]     Margin around the text
   * @param   [params.margin.left]     Left margin of text
   * @param   [params.margin.top]     Top margin of text
   * @param   [params.backgroundColor]  background color. This is the background color of the rectangle.
   * @param   [params.color] Text color
   * @param [edge] "flush","arrow"
   * @since 3.0.0 Function signature changed. This function now takes a params object and the drawing type instead of eight different parameters.
   * Also, this function will draw the label if `params.txt` is present, otherwise just the floating label outline will be drawn.
   */
  function roundRect(
    params: {
      ctx: object,
      x: number,
      top: number,
      width: number,
      height: number,
      radius: number,
      fill?: boolean,
      txt?: number,
      y?: number,
      margin?: {
        left?: object,
        top?: object
      },
      backgroundColor?: number,
      color?: number
    },
    edge?: string
  ): void

  /**
   * Copies the virtual DOM of an element to the actual DOM.
   *
   * **Note:** Use CIQ.cqvirtual to first create a virtual DOM.
   *
   * @param node The node for which the actual DOM is updated with the virtual DOM.
   * @return The actual DOM of the node.
   *
   * @since 8.1.0
   */
  function cqrender(node: HTMLElement): object

  /**
   * Converts an object to emit "stxtap" events. This uses CIQ.safeClickTouch. You should use addEventListener("tap") to receive the events.
   * @param div The element to convert
   * @param [params] Parameters to pass to CIQ.safeClickTouch
   * @param [params.stopPropagation=false] If set to true then propagation will be stopped
   * @since  04-2015
   */
  function installTapEvent(div: HTMLElement, params?: {stopPropagation?: boolean}): void

  /**
   * Sets the value of an input box only if it is not active. This prevents an input box from changing underneath
   * a user, which can be extremely frustrating on touch devices.
   * @param el    The input element
   * @param value The value to set
   */
  function setValueIfNotActive(el: HTMLElement, value: string): void

  /**
   * Returns true if two symbols match. Symbols can be strings or symbolObjects. By default, the "symbol" member is compared, and then
   * a "source" member if one exists.
   * If the objects have an "equals()" function member then that will be used for comparison.
   * You can override this with your own method if you have other requirements.
   * @param  left  Symbol object
   * @param  right Symbol object
   * @return       true if the same
   */
  function symbolEqual(left: object, right: object): boolean
}
export namespace CIQ.Studies {
  /**
   * CIQ.Studies.StudyDescriptor interface placeholder to be augmented in *standard.js* with properties.
   *
   */
  interface StudyDescriptor {
  }
}
export namespace CIQ.postAjax {
  /**
   * @callback CIQ.postAjax~requestCallback
   * @param status HTTP status
   * @param response HTTP response
   */
  type requestCallback = (status: number, response: string) => void
}
/**
 * Base class for Renderers.
 *
 * A renderer is used to draw a complex visualization based on one or more "series" of data.
 * Renderers only need to be attached to a chart once. You can change symbols and continue using the same renderer.
 * The series associated with a renderer may change at any time, but the linked renderer itself remains the vehicle for display them.
 *
 * Series are associated with renderers by calling attachSeries().
 * More typically though, this is done automatically when CIQ.ChartEngine#addSeries is used.
 * The parameters for addSeries() are passed both to the renderer's constructor and also to attachSeries().
 *
 * To manually create a renderer use CIQ.ChartEngine#setSeriesRenderer
 *
 */
export namespace CIQ.Renderer {
  /**
   * @callback CIQ.Renderer~colorFunction
   * @see CIQ.ChartEngine~colorFunctionnew
   */
  type colorFunction = () => void

  /**
   * Creates a lines renderer.
   *
   * This renderer draws lines of various color, thickness, and pattern on a chart.
   *
   * The `Lines` renderer is used to create the following chart types (including colored versions):
   * line, mountain, baseline, wave, and step chart.
   *
   * **Note:** By default, the renderer displays lines as underlays. As such, they appear below any
   * other studies or drawings.
   *
   * See CIQ.Renderer#construct for parameters required by all renderers.
   *
   * 		["wave"]CIQ.ChartEngine#drawWaveChart.
   * 		legend renderer. See CIQ.ChartEngine.Chart#legendRenderer;
   * 		via hover.
   * 		chart. If a baseline object is set, then the renderer uses those properties instead of the
   * 		chart's baseline when rendering. When true, the renderer falls back to the chart's baseline
   * 		properties for rendering.
   * 		CIQ.Renderer.registerColorFunction) to determine the color of the segment.
   * 		uses the default color (see CIQ.ChartEngine#getDefaultColor).
   * 		color of bar. May be an actual function or a string name of the registered function (see
   * 		CIQ.Renderer.registerColorFunction).
   *
   * Common valid parameters for use by CIQ.Renderer#attachSeries (see also
   * CIQ.ChartEngine#plotLine):
   * - `color` — Specify the color for the line by name or in RGBA or hexadecimal format.
   * - `pattern` — Specify the pattern as an array. For instance, [5, 5] would be five pixels
   *    and then five empty pixels.
   * - `width` — Specify the width of the line.
   * - `baseColor` — Specify the color of the base of a mountain.
   * - `fillStyle` — Specify the color to fill a mountain (other than `color`).
   *
   * @since
   * - 4.0.0 New `config.params.useChartLegend` added.
   * - 5.1.0 Removed subtype parameter, this will be determined internally from
   * 		`config.params.step=true`.
   * - 5.1.0 Added `highlightable`, `overChart`, `step`, `baseline`, `vertex`, `style`, `colored`,
   * 		and `colorFunction` parameters.
   * - 8.1.0 Added CIQ.ChartEngine.Chart#baseline type to `baseline` parameter. The new type
   * 		contains a `defaultLevel` property which can be set to the desired baseline value. See
   * 		example below.
   *
   * @example <caption>Create a renderer and set a custom baseline.</caption>
   * const baseLineRenderer = new CIQ.Renderer.Lines({
   *     params: {
   *         baseline: {defaultLevel: 45},
   *         yAxis: true
   *     }
   * });
   *
   * stxx.addSeries("GOOG");
   * stxx.setSeriesRenderer(baseLineRenderer).attachSeries("GOOG").ready();
   *
   * // or
   *
   * stxx.addSeries("GOOG", {baseline: {defaultLevel: 105}, color: "purple"});
   *
   * @example <caption>Add multiple series and attach to a custom y-axis on the left.</caption>
   * // See this example working here: https://jsfiddle.net/chartiq/b6pkzrad.
   *
   * // Note how the addSeries callback is used to ensure the data is present before the series is displayed.
   *
   * // Create the custom axis.
   * const axis = new CIQ.ChartEngine.YAxis();
   * axis.position = "left";
   * axis.textStyle = "#FFBE00";
   * axis.decimalPlaces = 0;  // No decimal places on the axis labels.
   * axis.maxDecimalPlaces = 0;  // No decimal places on the last price pointer.
   *
   * // Create the renderer.
   * const renderer = stxx.setSeriesRenderer(
   *     new CIQ.Renderer.Lines({
   *         params: {
   *             name: "my-renderer",
   *             type: "mountain",
   *             yAxis: axis
   *         }
   *     })
   * );
   *
   * // Create your series and attach them to the chart when the data is loaded.
   * stxx.addSeries("NOK", {display: "NOK", width: 4}, function() {
   *     renderer.attachSeries("NOK", "#FFBE00").ready();
   * });
   *
   * stxx.addSeries("SNE", {display: "Sony", width: 4}, function() {
   *     renderer.attachSeries("SNE", "#FF9300").ready();
   * });
   *
   * @example <caption>Remove a renderer and all associated data.</caption>
   * // This should only be necessary if you are also removing the chart itself.
   *
   * // Remove all series from the renderer, including series data from masterData.
   * renderer.removeAllSeries(true);
   *
   * // Detach the series renderer from the chart.
   * stxx.removeSeriesRenderer(renderer);
   *
   * // Delete the renderer itself.
   * renderer=null;
   *
   * @example <caption>Create a colored step baseline mountain with vertices.</caption>
   * const renderer = stxx.setSeriesRenderer(
   *     new CIQ.Renderer.Lines({
   *         params: {
   *             name: "my-renderer",
   *             type: "mountain",
   *             baseline: true,
   *             step: true,
   *             colored: true,
   *             vertex: true,
   *             yAxis: axis
   *         }
   *     })
   * );
   */
  class Lines {
    /**
     * Creates a lines renderer.
     *
     * This renderer draws lines of various color, thickness, and pattern on a chart.
     *
     * The `Lines` renderer is used to create the following chart types (including colored versions):
     * line, mountain, baseline, wave, and step chart.
     *
     * **Note:** By default, the renderer displays lines as underlays. As such, they appear below any
     * other studies or drawings.
     *
     * See CIQ.Renderer#construct for parameters required by all renderers.
     *
     * @param config Configuration object for the renderer.
     * @param [config.params] Parameters to control the renderer itself.
     * @param [config.params.width] Width of the rendered line.
     * @param [config.params.type="line"] Type of rendering; "line", "mountain", or
     * 		["wave"]CIQ.ChartEngine#drawWaveChart.
     * @param [config.params.useChartLegend=false] Set to true to use the built-in canvas
     * 		legend renderer. See CIQ.ChartEngine.Chart#legendRenderer;
     * @param [config.params.highlightable=true] Set to false to prevent selection of series
     * 		via hover.
     * @param [config.params.style] Style name to use in lieu of defaults for the type.
     * @param [config.params.step] Specifies a step chart.
     * @param [config.params.baseline] Specifies a baseline
     * 		chart. If a baseline object is set, then the renderer uses those properties instead of the
     * 		chart's baseline when rendering. When true, the renderer falls back to the chart's baseline
     * 		properties for rendering.
     * @param [config.params.colored] Specifies the use of a color function (see
     * 		CIQ.Renderer.registerColorFunction) to determine the color of the segment.
     * @param [config.params.vertex] Specifies drawing a dot on every vertex.
     * @param [config.params.vertex_color] Specifies a color for the vertices. If omitted,
     * 		uses the default color (see CIQ.ChartEngine#getDefaultColor).
     * @param [config.params.colorFunction] Override string (or function) used to determine
     * 		color of bar. May be an actual function or a string name of the registered function (see
     * 		CIQ.Renderer.registerColorFunction).
     *
     * Common valid parameters for use by CIQ.Renderer#attachSeries (see also
     * CIQ.ChartEngine#plotLine):
     * - `color` — Specify the color for the line by name or in RGBA or hexadecimal format.
     * - `pattern` — Specify the pattern as an array. For instance, [5, 5] would be five pixels
     *    and then five empty pixels.
     * - `width` — Specify the width of the line.
     * - `baseColor` — Specify the color of the base of a mountain.
     * - `fillStyle` — Specify the color to fill a mountain (other than `color`).
     *
     * @since
     * - 4.0.0 New `config.params.useChartLegend` added.
     * - 5.1.0 Removed subtype parameter, this will be determined internally from
     * 		`config.params.step=true`.
     * - 5.1.0 Added `highlightable`, `overChart`, `step`, `baseline`, `vertex`, `style`, `colored`,
     * 		and `colorFunction` parameters.
     * - 8.1.0 Added CIQ.ChartEngine.Chart#baseline type to `baseline` parameter. The new type
     * 		contains a `defaultLevel` property which can be set to the desired baseline value. See
     * 		example below.
     *
     * @example <caption>Create a renderer and set a custom baseline.</caption>
     * const baseLineRenderer = new CIQ.Renderer.Lines({
     *     params: {
     *         baseline: {defaultLevel: 45},
     *         yAxis: true
     *     }
     * });
     *
     * stxx.addSeries("GOOG");
     * stxx.setSeriesRenderer(baseLineRenderer).attachSeries("GOOG").ready();
     *
     * // or
     *
     * stxx.addSeries("GOOG", {baseline: {defaultLevel: 105}, color: "purple"});
     *
     * @example <caption>Add multiple series and attach to a custom y-axis on the left.</caption>
     * // See this example working here: https://jsfiddle.net/chartiq/b6pkzrad.
     *
     * // Note how the addSeries callback is used to ensure the data is present before the series is displayed.
     *
     * // Create the custom axis.
     * const axis = new CIQ.ChartEngine.YAxis();
     * axis.position = "left";
     * axis.textStyle = "#FFBE00";
     * axis.decimalPlaces = 0;  // No decimal places on the axis labels.
     * axis.maxDecimalPlaces = 0;  // No decimal places on the last price pointer.
     *
     * // Create the renderer.
     * const renderer = stxx.setSeriesRenderer(
     *     new CIQ.Renderer.Lines({
     *         params: {
     *             name: "my-renderer",
     *             type: "mountain",
     *             yAxis: axis
     *         }
     *     })
     * );
     *
     * // Create your series and attach them to the chart when the data is loaded.
     * stxx.addSeries("NOK", {display: "NOK", width: 4}, function() {
     *     renderer.attachSeries("NOK", "#FFBE00").ready();
     * });
     *
     * stxx.addSeries("SNE", {display: "Sony", width: 4}, function() {
     *     renderer.attachSeries("SNE", "#FF9300").ready();
     * });
     *
     * @example <caption>Remove a renderer and all associated data.</caption>
     * // This should only be necessary if you are also removing the chart itself.
     *
     * // Remove all series from the renderer, including series data from masterData.
     * renderer.removeAllSeries(true);
     *
     * // Detach the series renderer from the chart.
     * stxx.removeSeriesRenderer(renderer);
     *
     * // Delete the renderer itself.
     * renderer=null;
     *
     * @example <caption>Create a colored step baseline mountain with vertices.</caption>
     * const renderer = stxx.setSeriesRenderer(
     *     new CIQ.Renderer.Lines({
     *         params: {
     *             name: "my-renderer",
     *             type: "mountain",
     *             baseline: true,
     *             step: true,
     *             colored: true,
     *             vertex: true,
     *             yAxis: axis
     *         }
     *     })
     * );
     */
    constructor(
      config: {
        params?: {
          width?: number,
          type?: string,
          useChartLegend?: boolean,
          highlightable?: boolean,
          style?: string,
          step?: boolean,
          baseline?: boolean|typeof CIQ.ChartEngine.Chart.prototype.baseline,
          colored?: boolean,
          vertex?: boolean,
          vertex_color?: boolean,
          colorFunction?: string
        }
      }
    )
  }

  /**
   * Creates an OHLC renderer.
   *
   * Note: by default the renderer will display bars as underlays. As such, they will appear below any other studies or drawings.
   *
   * The OHLC renderer is a base class for creating the following chart types:
   * - CIQ.Renderer.HLC
   * - CIQ.Renderer.Bars
   * - CIQ.Renderer.Candles
   * - CIQ.Renderer.SimpleHistogram
   * and is normally not directly accessed.
   *
   * See CIQ.Renderer#construct for parameters required by all renderers
   * @since 5.1.0
   * @example
   // Colored hlc chart
   var renderer=stxx.setSeriesRenderer(new CIQ.Renderer.OHLC({params:{name:"bars", type:"bar", hlc:true, colored:true}}));
   *
   */
  class OHLC {
    /**
     * Creates an OHLC renderer.
     *
     * Note: by default the renderer will display bars as underlays. As such, they will appear below any other studies or drawings.
     *
     * The OHLC renderer is a base class for creating the following chart types:
     * - CIQ.Renderer.HLC
     * - CIQ.Renderer.Bars
     * - CIQ.Renderer.Candles
     * - CIQ.Renderer.SimpleHistogram
     * and is normally not directly accessed.
     *
     * See CIQ.Renderer#construct for parameters required by all renderers
     * @param config Config for renderer
     * @param  [config.params] Parameters to control the renderer itself
     * @param  [config.params.type] Type of rendering "bar", "candle". Not needed if `params.histogram` is set)
     * @param  [config.params.useChartLegend=false] Set to true to use the built in canvas legend renderer. See CIQ.ChartEngine.Chart#legendRenderer;
     * @param  [config.params.style] Style name to use in lieu of defaults for the type
     * @param  [config.params.colored] For bar or hlc, specifies using a condition or colorFunction to determine color
     * @param  [config.params.hollow] Specifies candles should be hollow candles
     * @param  [config.params.volume] Specifies candles should be volume candles
     * @param  [config.params.histogram] Specifies histogram chart (if set, `params.type` is not required). These are basic histograms that allow just one bar per tick; not to be confused with stackable histograms which require the more advanced CIQ.Renderer.Histogram
     * @param  [config.params.hlc] Specifies bar chart, with just hlc data; no open tick
     * @param  [config.params.gradient=true] Specifies histogram bars are to be drawn with a gradient; set to false to draw with solid colors
     * @param  [config.params.colorBasis="close"] For bar/hlc charts, will compute color based on whether current close is higher or lower than previous close.  Set to "open" to compute this off the open rather than yesterday's close.
     * @param  [config.params.colorFunction] Oerride function (or string) used to determine color of bar.  May be an actual function or a string name of the registered function (see CIQ.Renderer.registerColorFunction)
     * @since 5.1.0
     * @example
     // Colored hlc chart
     var renderer=stxx.setSeriesRenderer(new CIQ.Renderer.OHLC({params:{name:"bars", type:"bar", hlc:true, colored:true}}));
     *
     */
    constructor(
      config: {
        params?: {
          type?: string,
          useChartLegend?: boolean,
          style?: string,
          colored?: boolean,
          hollow?: boolean,
          volume?: boolean,
          histogram?: boolean,
          hlc?: boolean,
          gradient?: boolean,
          colorBasis?: string,
          colorFunction?: Function
        }
      }
    )
  }

  /**
   * Creates a Candles renderer, a derivation of the OHLC renderer.
   *
   * Note: by default the renderer will display candles as underlays. As such, they will appear below any other studies or drawings.
   *
   * The Candles renderer is used to create the following drawing types: candle, hollow candle, volume candle
   *
   * See CIQ.Renderer#construct for parameters required by all renderers
   *
   * Common valid parameters for use by attachSeries.:
   * `fill_color_up` - Color to use for up candles.
   * `fill_color_down` - Color to use for down candles.
   * `fill_color_even` - Color to use for even candles.
   * `border_color_up` - Color to use for the border of up candles.
   * `border_color_down` - Color to use for the order of down candles.
   * `border_color_even` - Color to use for the order of even candles.
   *
   * @since 5.1.1
   * @example
   // Hollow candle chart
   var renderer=stxx.setSeriesRenderer(new CIQ.Renderer.Candles({params:{name:"candles", hollow:true}}));
   *
   */
  class Candles {
    /**
     * Creates a Candles renderer, a derivation of the OHLC renderer.
     *
     * Note: by default the renderer will display candles as underlays. As such, they will appear below any other studies or drawings.
     *
     * The Candles renderer is used to create the following drawing types: candle, hollow candle, volume candle
     *
     * See CIQ.Renderer#construct for parameters required by all renderers
     * @param config Config for renderer
     * @param  [config.params] Parameters to control the renderer itself
     * @param  [config.params.useChartLegend=false] Set to true to use the built in canvas legend renderer. See CIQ.ChartEngine.Chart#legendRenderer;
     * @param  [config.params.style] Style name to use in lieu of defaults for the type
     * @param  [config.params.hollow] Specifies candles should be hollow candles
     * @param  [config.params.volume] Specifies candles should be volume candles
     * @param  [config.params.colorFunction] Override function (or string) used to determine color of candle.  May be an actual function or a string name of the registered function (see CIQ.Renderer.registerColorFunction)
     *
     * Common valid parameters for use by attachSeries.:
     * `fill_color_up` - Color to use for up candles.
     * `fill_color_down` - Color to use for down candles.
     * `fill_color_even` - Color to use for even candles.
     * `border_color_up` - Color to use for the border of up candles.
     * `border_color_down` - Color to use for the order of down candles.
     * `border_color_even` - Color to use for the order of even candles.
     *
     * @since 5.1.1
     * @example
     // Hollow candle chart
     var renderer=stxx.setSeriesRenderer(new CIQ.Renderer.Candles({params:{name:"candles", hollow:true}}));
     *
     */
    constructor(
      config: {
        params?: {
          useChartLegend?: boolean,
          style?: string,
          hollow?: boolean,
          volume?: boolean,
          colorFunction?: Function
        }
      }
    )
  }

  /**
   * Creates a SimpleHistogram renderer, a derivation of the Candles renderer.
   *
   * Note: by default the renderer will display histogram as underlays. As such, they will appear below any other studies or drawings.
   *
   * The SimpleHistogram renderer is used to create a histogram with the top of each bar representing the value of the field.
   * It is a much simpler form of histogram than that produced by the Histogram renderer (advanced package).
   *
   * See CIQ.Renderer#construct for parameters required by all renderers
   *
   * Valid parameters for use by attachSeries.:
   * `fill_color_up` - Color to use for up histogram bars.
   * `fill_color_down` - Color to use for down histogram bars.
   * `fill_color_even` - Color to use for even histogram bars.
   * `border_color_up` - Color to use for the border of up histogram bars.
   * `border_color_down` - Color to use for the order of down histogram bars.
   * `border_color_even` - Color to use for the order of even histogram bars.
   *
   * @since 5.1.1
   * @example
   // SimpleHistogram under the main chart plot
   var renderer=stxx.setSeriesRenderer(new CIQ.Renderer.SimpleHistogram({params:{name:"histogram", overChart:false}}));
   *
   */
  class SimpleHistogram {
    /**
     * Creates a SimpleHistogram renderer, a derivation of the Candles renderer.
     *
     * Note: by default the renderer will display histogram as underlays. As such, they will appear below any other studies or drawings.
     *
     * The SimpleHistogram renderer is used to create a histogram with the top of each bar representing the value of the field.
     * It is a much simpler form of histogram than that produced by the Histogram renderer (advanced package).
     *
     * See CIQ.Renderer#construct for parameters required by all renderers
     * @param config Config for renderer
     * @param  [config.params] Parameters to control the renderer itself
     * @param  [config.params.useChartLegend=false] Set to true to use the built in canvas legend renderer. See CIQ.ChartEngine.Chart#legendRenderer;
     * @param  [config.params.style] Style name to use in lieu of defaults for the type
     * @param  [config.params.gradient=true] Specifies histogram bars are to be drawn with a gradient; set to false to draw with solid colors
     * @param  [config.params.colorFunction] Override function (or string) used to determine color of bar.  May be an actual function or a string name of the registered function (see CIQ.Renderer.registerColorFunction)
     *
     * Valid parameters for use by attachSeries.:
     * `fill_color_up` - Color to use for up histogram bars.
     * `fill_color_down` - Color to use for down histogram bars.
     * `fill_color_even` - Color to use for even histogram bars.
     * `border_color_up` - Color to use for the border of up histogram bars.
     * `border_color_down` - Color to use for the order of down histogram bars.
     * `border_color_even` - Color to use for the order of even histogram bars.
     *
     * @since 5.1.1
     * @example
     // SimpleHistogram under the main chart plot
     var renderer=stxx.setSeriesRenderer(new CIQ.Renderer.SimpleHistogram({params:{name:"histogram", overChart:false}}));
     *
     */
    constructor(
      config: {
        params?: {
          useChartLegend?: boolean,
          style?: string,
          gradient?: boolean,
          colorFunction?: Function
        }
      }
    )
  }

  /**
   * Registers a colorFunction for use with a renderer.
   *
   * It is necessary to register a color function if you want the function to be tied back to an imported renderer.
   * @param  name The name of the registered function
   * @param  funct The function to register
   */
  function registerColorFunction(name: string, funct: Function): void

  /**
   * Unregisters a colorFunction for use with a renderer.
   *
   * @param  name The name of the registered function
   */
  function unregisterColorFunction(name: string): void
}
/**
 * Base namespace for CIQ library
 *
 * Previously `STX`
 */
export class CIQ {

}
/**
 * Shorthand for `getElementById()`.
 *
 * Equivalent to prototype style `$()`, which is faster but less powerful than jQuery style `$()`.
 *
 * 		document is searched.
 *
 * @function
 */
export class $$ {

}
/**
 * Functional equivalent of `querySelector()`.
 *
 * Functionally equivalent to jQuery `$()`. Uses `querySelectorAll` to maintain compatibility with
 * Internet Explorer 9.
 *
 * **Note:** If multiple elements match the selector, only the first is returned.
 *
 * 		searched.
 *
 * @function
 */
export class $$$ {

}
/**
 * Creates a lines renderer.
 *
 * This renderer draws lines of various color, thickness, and pattern on a chart.
 *
 * The `Lines` renderer is used to create the following chart types (including colored versions):
 * line, mountain, baseline, wave, and step chart.
 *
 * **Note:** By default, the renderer displays lines as underlays. As such, they appear below any
 * other studies or drawings.
 *
 * See CIQ.Renderer#construct for parameters required by all renderers.
 *
 * 		["wave"]CIQ.ChartEngine#drawWaveChart.
 * 		legend renderer. See CIQ.ChartEngine.Chart#legendRenderer;
 * 		via hover.
 * 		chart. If a baseline object is set, then the renderer uses those properties instead of the
 * 		chart's baseline when rendering. When true, the renderer falls back to the chart's baseline
 * 		properties for rendering.
 * 		CIQ.Renderer.registerColorFunction) to determine the color of the segment.
 * 		uses the default color (see CIQ.ChartEngine#getDefaultColor).
 * 		color of bar. May be an actual function or a string name of the registered function (see
 * 		CIQ.Renderer.registerColorFunction).
 *
 * Common valid parameters for use by CIQ.Renderer#attachSeries (see also
 * CIQ.ChartEngine#plotLine):
 * - `color` — Specify the color for the line by name or in RGBA or hexadecimal format.
 * - `pattern` — Specify the pattern as an array. For instance, [5, 5] would be five pixels
 *    and then five empty pixels.
 * - `width` — Specify the width of the line.
 * - `baseColor` — Specify the color of the base of a mountain.
 * - `fillStyle` — Specify the color to fill a mountain (other than `color`).
 *
 * @since
 * - 4.0.0 New `config.params.useChartLegend` added.
 * - 5.1.0 Removed subtype parameter, this will be determined internally from
 * 		`config.params.step=true`.
 * - 5.1.0 Added `highlightable`, `overChart`, `step`, `baseline`, `vertex`, `style`, `colored`,
 * 		and `colorFunction` parameters.
 * - 8.1.0 Added CIQ.ChartEngine.Chart#baseline type to `baseline` parameter. The new type
 * 		contains a `defaultLevel` property which can be set to the desired baseline value. See
 * 		example below.
 *
 * @example <caption>Create a renderer and set a custom baseline.</caption>
 * const baseLineRenderer = new CIQ.Renderer.Lines({
 *     params: {
 *         baseline: {defaultLevel: 45},
 *         yAxis: true
 *     }
 * });
 *
 * stxx.addSeries("GOOG");
 * stxx.setSeriesRenderer(baseLineRenderer).attachSeries("GOOG").ready();
 *
 * // or
 *
 * stxx.addSeries("GOOG", {baseline: {defaultLevel: 105}, color: "purple"});
 *
 * @example <caption>Add multiple series and attach to a custom y-axis on the left.</caption>
 * // See this example working here: https://jsfiddle.net/chartiq/b6pkzrad.
 *
 * // Note how the addSeries callback is used to ensure the data is present before the series is displayed.
 *
 * // Create the custom axis.
 * const axis = new CIQ.ChartEngine.YAxis();
 * axis.position = "left";
 * axis.textStyle = "#FFBE00";
 * axis.decimalPlaces = 0;  // No decimal places on the axis labels.
 * axis.maxDecimalPlaces = 0;  // No decimal places on the last price pointer.
 *
 * // Create the renderer.
 * const renderer = stxx.setSeriesRenderer(
 *     new CIQ.Renderer.Lines({
 *         params: {
 *             name: "my-renderer",
 *             type: "mountain",
 *             yAxis: axis
 *         }
 *     })
 * );
 *
 * // Create your series and attach them to the chart when the data is loaded.
 * stxx.addSeries("NOK", {display: "NOK", width: 4}, function() {
 *     renderer.attachSeries("NOK", "#FFBE00").ready();
 * });
 *
 * stxx.addSeries("SNE", {display: "Sony", width: 4}, function() {
 *     renderer.attachSeries("SNE", "#FF9300").ready();
 * });
 *
 * @example <caption>Remove a renderer and all associated data.</caption>
 * // This should only be necessary if you are also removing the chart itself.
 *
 * // Remove all series from the renderer, including series data from masterData.
 * renderer.removeAllSeries(true);
 *
 * // Detach the series renderer from the chart.
 * stxx.removeSeriesRenderer(renderer);
 *
 * // Delete the renderer itself.
 * renderer=null;
 *
 * @example <caption>Create a colored step baseline mountain with vertices.</caption>
 * const renderer = stxx.setSeriesRenderer(
 *     new CIQ.Renderer.Lines({
 *         params: {
 *             name: "my-renderer",
 *             type: "mountain",
 *             baseline: true,
 *             step: true,
 *             colored: true,
 *             vertex: true,
 *             yAxis: axis
 *         }
 *     })
 * );
 */
export namespace CIQ.Renderer.Lines {
  /**
   * Returns a new Lines renderer if the featureList calls for it
   * FeatureList should contain whatever features requested; valid features:
   * 	line, mountain, baseline (delta), step, vertex, colored, wave
   * Anything else is an invalid feature and will cause function to return null
   * Called by CIQ.Renderer.produce to create a renderer for the main series
   * @param featureList List of rendering terms requested by the user, parsed from the chartType
   * @param [params] Parameters used for the series to be created, used to create the renderer
   * @return A new instance of the Lines renderer, if the featureList matches
   * @since 5.1.0
   */
  function requestNew(featureList: any[], params?: object): CIQ.Renderer.Lines
}
/**
 * Creates an OHLC renderer.
 *
 * Note: by default the renderer will display bars as underlays. As such, they will appear below any other studies or drawings.
 *
 * The OHLC renderer is a base class for creating the following chart types:
 * - CIQ.Renderer.HLC
 * - CIQ.Renderer.Bars
 * - CIQ.Renderer.Candles
 * - CIQ.Renderer.SimpleHistogram
 * and is normally not directly accessed.
 *
 * See CIQ.Renderer#construct for parameters required by all renderers
 * @since 5.1.0
 * @example
 // Colored hlc chart
 var renderer=stxx.setSeriesRenderer(new CIQ.Renderer.OHLC({params:{name:"bars", type:"bar", hlc:true, colored:true}}));
 *
 */
export namespace CIQ.Renderer.OHLC {
  /**
   * Returns a new OHLC renderer if the featureList calls for it
   * FeatureList should contain whatever features requested; valid features:
   * 	bar, hlc, candle, colored, histogram, hollow, volume
   * Anything else is an invalid feature and will cause function to return null
   *
   * **Note:** If you are using the base package then the only valid features are: candle and histogram.
   *
   * Called by CIQ.Renderer.produce to create a renderer for the main series
   * @param featureList List of rendering terms requested by the user, parsed from the chartType
   * @param [params] Parameters used for the series to be created, used to create the renderer
   * @return A new instance of the OHLC renderer, if the featureList matches
   * @since 5.1.0
   */
  function requestNew(featureList: any[], params?: object): CIQ.Renderer.OHLC
}
/**
 * Defines an object used for rendering the Y-axis on a panel.
 *
 * Each panel object will **automatically** include a YAxis object, which can be adjusted immediately after declaring your `new CIQ.ChartEngine();`
 * Any adjustments to the y-axis members after it has been rendered will require a [draw()]CIQ.ChartEngine#draw call to apply the changes. A call to [initializeChart()]CIQ.ChartEngine#initializeChart may be required as well, depending on the setting being changed. See examples.
 *
 *  Also see:
 * - CIQ.ChartEngine#yaxisLabelStyle
 * - CIQ.ChartEngine#yTolerance
 * - CIQ.ChartEngine.Chart#yaxisPaddingRight
 * - CIQ.ChartEngine.Chart#yaxisPaddingLeft
 *
 * For full customization instructions see:
 *  - {@tutorial Gridlines and axis labels}
 *  - CIQ.ChartEngine#createYAxis
 *  - CIQ.ChartEngine#drawYAxis
 *
 * Example: stxx.panels['chart'].yAxis
 *
 * Example: stxx.chart.yAxis (convenience shortcut for accessing the main panel object - same as above)
 *
 * Example: stxx.panels['Aroon (14)'].yAxis
 *
 * **Note:** When modifying a y-axis placement setting (width, margins, position left/right, etc.)
 * after the axis has been rendered, you must call CIQ.ChartEngine#calculateYAxisMargins or
 * CIQ.ChartEngine#calculateYAxisPositions (as appropriate) followed by
 * CIQ.ChartEngine#draw to activate the change.
 *
 * @example
 * // here is an example on how to override the default top and bottom margins after the initial axis has already been rendered
 * stxx.loadChart(symbol, {masterData: yourData}, function () {
 * 	// callback - your code to be executed after the chart is loaded
 * 	stxx.chart.yAxis.initialMarginTop=50;
 * 	stxx.chart.yAxis.initialMarginBottom=50;
 * 	stxx.calculateYAxisMargins(stxx.chart.panel.yAxis); // must recalculate the margins after they are changed.
 * 	stxx.draw();
 * });
 * @example
 * // here is an example on how to override the default top and bottom margins before the initial axis has been rendered
 * var stxx=new CIQ.ChartEngine({container:document.querySelector(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
 * stxx.setPeriodicity({period:1, interval:1, timeUnit:"minute"}); 			// set your default periodicity to match your data. In this case one minute.
 * stxx.chart.yAxis.initialMarginTop=50;		// set default margins so they do not bump on to the legend
 * stxx.chart.yAxis.initialMarginBottom=50;
 * stxx.loadChart("SPY", {masterData: yourData});
 * @example
 * // here is an example on how to turn off the last price label (main chart panel) before the initial axis has already been rendered
 * var stxx=new CIQ.ChartEngine({container:document.querySelector(".chartContainer"), layout:{"candleWidth": 16, "crosshair":true}});
 * stxx.chart.panel.yAxis.drawCurrentPriceLabel=false;
 *
 * @since 5.1.0 Created a name member which is used to determine if the y-axis is the same as another.
 */
export namespace CIQ.ChartEngine.YAxis {
  /**
   * Default setting for the array that determines how many decimal places to print based on the size of the shadow (the difference between chart high and chart low).
   * The array consists of tuples in descending order. If the shadow is less than n1 then n2 decimal places will be printed.
   * See CIQ.ChartEngine.YAxis#shadowBreaks
   * @since
   * - 2015-11-1
   * - 5.2.0 Additional break added.
   */
  let defaultShadowBreaks: any[]

  /**
   * Alternative setting (for small charts)  array that determines how many decimal places to print based on the size of the shadow (the difference between chart high and chart low).
   * The array consists of tuples in descending order. If the shadow is less than n1 then n2 decimal places will be printed.
   * See CIQ.ChartEngine.YAxis#shadowBreaks
   * @since 2015-11-1
   */
  let smallChartShadowBreaks: any[]
}

