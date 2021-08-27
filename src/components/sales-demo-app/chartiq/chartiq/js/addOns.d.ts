import { CIQ } from '../js/chartiq.js'
export { CIQ }

/**
 * CIQ namespace extension
 */
declare module '../js/chartiq.js' {
  export namespace CIQ.UI {
    /**
     * CIQ.UI.Context interface placeholder to be augmented in *componentUI.js* with properties.
     *
     */
    interface Context {
    }
  }

  export namespace CIQ {
    /**
     * CIQ.EaseMachine interface placeholder to be augmented in *standard.js* with properties.
     *
     */
    interface EaseMachine {
    }
    /**
     * CIQ.Marker interface placeholder to be augmented in *standard.js* with properties.
     *
     */
    interface Marker {
    }
    /**
     * Use this constructor to initialize filtering and visualization styles of extended hours by the use of shading and delimitation lines.
     *
     *  Extended hours can be toggled using the Ctrl+Alt+X keystroke combination (see the
     * `extendedHours` action in `hotkeyConfig.hotkeys` in *js/defaultConfiguration.js*).
     *
     * Requires *addOns.js*.
     *
     * This visualization will only work if data for the corresponding sessions is provided from your quote feed and the market definitions have the corresponding entries.
     * See CIQ.Market for details on how to define extended (non-default) hours.
     *
     * By default all extended hour sessions are disabled unless explicitly enabled using CIQ.ExtendedHours.prepare or CIQ.ExtendedHours.set.
     *
     * All possible market sessions needed to be shaded at any given time should be enabled at once with this method.
     *
     * Your fetch should load the required data based on the `params.stx.layout.extended` and `params.stx.layout.marketSessions` settings.
     *
     * Remember that when `params.filter` is set to true, this module performs a filter of already loaded masterData when CIQ.ExtendedHours.set is invoked,
     * rather than calling CIQ.ChartEngine#loadChart to reload the data from the server every time you enable or disable this feature.
     * So you must always return all requested sessions on your fetch responses if this flag is set.
     *
     * CSS info:
     * - The styles for the shading of each session is determined by the corresponding CSS class in the form of "stx_market_session."+session_name (Example: `stx_market_session.pre`)
     * - The divider line is determined by the CSS class "stx_market_session.divider".
     *
     * **Important:** This module must be initialized before CIQ.ChartEngine#importLayout or the sessions will not be able to be restored.
     *
     * Example:
     * <iframe width="800" height="500" scrolling="no" seamless="seamless" align="top"
     *         style="float:top"
     *         src="https://jsfiddle.net/chartiq/g2vvww67/embedded/result,js,html/"
     *         allowfullscreen="allowfullscreen" frameborder="1">
     * </iframe>
     *
     * 		CIQ.ExtendedHours.set is invoked, rather than calling
     * 		CIQ.ChartEngine#loadChart to reload the data from the server.
     * 		element that contains the UI control for the extended hours add-on. In a multi-chart
     * 		document, the add-on is available only on charts that have a menu DOM element with
     * 		the value for `menuContextClass` as a class attribute.
     *
     * @since
     * - 06-2016-02
     * - 3.0.0 Changed argument to an object to support `filter`.
     * - 3.0.0 No longer necessary to explicitly call new Chart to reload data. Instead call CIQ.ExtendedHours.set function.
     * - 5.0.0 No longer necessary to explicitly set `stx.layout.marketSessions` or `1stx.layout.extended` to manage sessions; instead call CIQ.ExtendedHours.prepare or CIQ.ExtendedHours.set.
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
    class ExtendedHours {
      /**
       * Use this constructor to initialize filtering and visualization styles of extended hours by the use of shading and delimitation lines.
       *
       *  Extended hours can be toggled using the Ctrl+Alt+X keystroke combination (see the
       * `extendedHours` action in `hotkeyConfig.hotkeys` in *js/defaultConfiguration.js*).
       *
       * Requires *addOns.js*.
       *
       * This visualization will only work if data for the corresponding sessions is provided from your quote feed and the market definitions have the corresponding entries.
       * See CIQ.Market for details on how to define extended (non-default) hours.
       *
       * By default all extended hour sessions are disabled unless explicitly enabled using CIQ.ExtendedHours.prepare or CIQ.ExtendedHours.set.
       *
       * All possible market sessions needed to be shaded at any given time should be enabled at once with this method.
       *
       * Your fetch should load the required data based on the `params.stx.layout.extended` and `params.stx.layout.marketSessions` settings.
       *
       * Remember that when `params.filter` is set to true, this module performs a filter of already loaded masterData when CIQ.ExtendedHours.set is invoked,
       * rather than calling CIQ.ChartEngine#loadChart to reload the data from the server every time you enable or disable this feature.
       * So you must always return all requested sessions on your fetch responses if this flag is set.
       *
       * CSS info:
       * - The styles for the shading of each session is determined by the corresponding CSS class in the form of "stx_market_session."+session_name (Example: `stx_market_session.pre`)
       * - The divider line is determined by the CSS class "stx_market_session.divider".
       *
       * **Important:** This module must be initialized before CIQ.ChartEngine#importLayout or the sessions will not be able to be restored.
       *
       * Example:
       * <iframe width="800" height="500" scrolling="no" seamless="seamless" align="top"
       *         style="float:top"
       *         src="https://jsfiddle.net/chartiq/g2vvww67/embedded/result,js,html/"
       *         allowfullscreen="allowfullscreen" frameborder="1">
       * </iframe>
       *
       * @param params The constructor parameters.
       * @param [params.stx] The chart object.
       * @param [params.filter] Setting to true performs a filter of masterData when
       * 		CIQ.ExtendedHours.set is invoked, rather than calling
       * 		CIQ.ChartEngine#loadChart to reload the data from the server.
       * @param [params.menuContextClass] A CSS class name used to query the menu DOM
       * 		element that contains the UI control for the extended hours add-on. In a multi-chart
       * 		document, the add-on is available only on charts that have a menu DOM element with
       * 		the value for `menuContextClass` as a class attribute.
       *
       * @since
       * - 06-2016-02
       * - 3.0.0 Changed argument to an object to support `filter`.
       * - 3.0.0 No longer necessary to explicitly call new Chart to reload data. Instead call CIQ.ExtendedHours.set function.
       * - 5.0.0 No longer necessary to explicitly set `stx.layout.marketSessions` or `1stx.layout.extended` to manage sessions; instead call CIQ.ExtendedHours.prepare or CIQ.ExtendedHours.set.
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
      constructor(
        params: {
          stx?: CIQ.ChartEngine,
          filter?: boolean,
          menuContextClass?: string
        }
      )
      /**
       * Prepares the extended hours settings and classes for the session names enumerated in the arguments without actually displaying or loading the data.
       *
       * This method can be used to force a particular session to load by default by calling it before CIQ.ChartEngine#loadChart.
       * Otherwise the chart will be loaded with all sessions disabled until CIQ.ExtendedHours.set is invoked.
       *
       * CIQ.ChartEngine#importLayout will also call this method to ensure the sessions are restored as previously saved.
       *
       * @param  enable Set to turn on/off the extended-hours visualization.
       * @param  sessions The sessions to visualize when enable is true.  Any sessions previously visualized will be disabled.  If set to null, will default to ["pre","post"].
       * @since 5.0.0
       */
      public prepare(enable: boolean, sessions: any[]): void
      /**
       * Turns on or off extended hours for the session names enumerated in the arguments.
       * @param  enable Set to turn on/off the extended-hours visualization.
       * @param  sessions The sessions to visualize when enable is true.  Any sessions previously visualized will be disabled.  If set to null, will default to ["pre","post"].
       * @param  cb Optional callback function to be invoked once chart is reloaded with extended hours data.
       */
      public set(enable: boolean, sessions: any[], cb: Function): void
    }
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
     *
     * @since 7.3.0
     *
     * @example
     * new CIQ.FullScreen({ stx: stxx });
     */
    class FullScreen {
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
       * @param params Configuration parameters.
       * @param [params.stx] The chart object.
       *
       * @since 7.3.0
       *
       * @example
       * new CIQ.FullScreen({ stx: stxx });
       */
      constructor(params: {stx?: CIQ.ChartEngine})
    }
    /**
     * Add-On that puts the chart into "sleep mode" after a period of inactivity.
     *
     * Requires *addOns.js*.
     *
     * In sleep mode, a class "ciq-sleeping" will be added to the body.  This will dim out the chart.
     * Sleep mode is ended when interaction with the chart is detected.
     *
     * 									Set to non-zero positive number or defaults to 60.
     * @since 3.0.0
     * @example
     * 	new CIQ.InactivityTimer({stx:stxx, minutes:30, interval:15});  //30 minutes of inactivity will put chart into sleep mode, updating every 15 seconds
     *
     */
    class InactivityTimer {
      /**
       * Add-On that puts the chart into "sleep mode" after a period of inactivity.
       *
       * Requires *addOns.js*.
       *
       * In sleep mode, a class "ciq-sleeping" will be added to the body.  This will dim out the chart.
       * Sleep mode is ended when interaction with the chart is detected.
       *
       * @param params Configuration parameters
       * @param [params.stx] The chart object
       * @param [params.minutes] Inactivity period in _minutes_.  Set to 0 to disable the sleep mode.
       * @param [params.interval] Sleeping quote update interval in _seconds_.  During sleep mode, this is used for the update loop.
       * 									Set to non-zero positive number or defaults to 60.
       * @param [params.wakeCB] Optional callback function after waking
       * @param [params.sleepCB] Optional callback function after sleeping
       * @since 3.0.0
       * @example
       * 	new CIQ.InactivityTimer({stx:stxx, minutes:30, interval:15});  //30 minutes of inactivity will put chart into sleep mode, updating every 15 seconds
       *
       */
      constructor(
        params: {
          stx?: CIQ.ChartEngine,
          minutes?: number,
          interval?: number,
          wakeCB?: Function,
          sleepCB?: Function
        }
      )
    }
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
     * parameter of the primary chart's [layout object]CIQ.ChartEngine#layout and then issuing
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
     * 		unit, such as "px".
     * 		`stxx.container`.
     * 		that contains the UI control for the range slider add-on. In a multi-chart document, the
     * 		add-on is available only on charts that have a menu DOM element with the value for
     * 		`menuContextClass` as a class attribute.
     *
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
    class RangeSlider {
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
       * parameter of the primary chart's [layout object]CIQ.ChartEngine#layout and then issuing
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
       * @param params Configuration parameters.
       * @param [params.stx] The chart object.
       * @param [params.height="95px"] Height of the range slider panel. Must include a CSS
       * 		unit, such as "px".
       * @param [params.yAxis] Y-axis parameters.
       * @param [params.chartContainer] Handle to the main chart container. Defaults to
       * 		`stxx.container`.
       * @param [params.menuContextClass] A CSS class name used to query the menu DOM element
       * 		that contains the UI control for the range slider add-on. In a multi-chart document, the
       * 		add-on is available only on charts that have a menu DOM element with the value for
       * 		`menuContextClass` as a class attribute.
       *
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
      constructor(
        params: {
          stx?: CIQ.ChartEngine,
          height?: number,
          yAxis?: object,
          chartContainer?: number,
          menuContextClass?: string
        }
      )
      /**
       * Dynamically updates the styling of the range slider.
       *
       * This method can be used to update CSS styles if you are injecting stylesheets using
       * JavaScript.
       *
       * @param obj The CSS selector for which a style property is changed.
       * @param attribute The style property changed in the CSS selector rule-set.
       * @param value The value to apply to the CSS property.
       *
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
      public updateStyles(obj: string, attribute: string, value: string): void
    }
    /**
     * Displays a legend of keyboard shortcuts and the actions the shortcuts perform.
     *
     * Delegates display of the legend to the
     * [cq-floating-window]WebComponents.cq-floating-window web component by dispatching a
     * "floatingWindow" event (see
     * [floatingWindowEventListener]CIQ.ChartEngine~floatingWindowEventListener).
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
     * 		legend is created.
     * 		and drawing tool keyboard shortcuts. Typically, this object is the chart configuration
     * 		object. See the {@tutorial Chart Configuration} tutorial for the data format for keyboard
     * 		shortcuts.
     * 		keyboard shortcuts legend.
     * 		instance in a multi-chart document has its own keyboard shortcuts legend. If false, all
     * 		charts share the same legend.
     *
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
    class Shortcuts {
      /**
       * Displays a legend of keyboard shortcuts and the actions the shortcuts perform.
       *
       * Delegates display of the legend to the
       * [cq-floating-window]WebComponents.cq-floating-window web component by dispatching a
       * "floatingWindow" event (see
       * [floatingWindowEventListener]CIQ.ChartEngine~floatingWindowEventListener).
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
       * @param params The constructor parameters.
       * @param params.stx The chart engine instance for which the keyboard shortcuts
       * 		legend is created.
       * @param params.config A configuration object that includes specifications for hot keys
       * 		and drawing tool keyboard shortcuts. Typically, this object is the chart configuration
       * 		object. See the {@tutorial Chart Configuration} tutorial for the data format for keyboard
       * 		shortcuts.
       * @param [params.width="580"] The width of the floating window that contains the
       * 		keyboard shortcuts legend.
       * @param [params.windowForEachChart=true] A flag that indicates whether each chart
       * 		instance in a multi-chart document has its own keyboard shortcuts legend. If false, all
       * 		charts share the same legend.
       *
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
      constructor(
        params: {
          stx: CIQ.ChartEngine,
          config: object,
          width?: number,
          windowForEachChart?: boolean
        }
      )
      /**
       * The chart engine instance for which the keyboard shortcuts legend is created.
       *
       * @since 8.2.0
       */
      public stx: CIQ.ChartEngine
      /**
       * Width of the floating window that contains the keyboard shortcuts legend.
       *
       * @since 8.2.0
       */
      public width: number
      /**
       * In a multi-chart document, indicates whether each chart has its own keyboard shortcuts
       * legend. If false, all charts share the same legend.
       *
       * @since 8.2.0
       */
      public windowForEachChart: boolean
      /**
       * Enables the keyboard shortcuts legend user interface.
       *
       * Adds a `showShortCuts` function to the CIQ.UI.Layout helper. The `showShortCuts`
       * function calls this class's [toggle]CIQ.Shortcuts#toggle function to show and hide the
       * keyboard shortcuts legend. Call `showShortCuts` in your application's user interface (see
       * example).
       *
       * This function is called when the add-on is instantiated.
       *
       * @param stx The chart engine that provides the UI context for the keyboard
       * 		shortcuts legend.
       *
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
      public enableUI(stx: CIQ.ChartEngine): void
      /**
       * Ensures that an instance of the [cq-floating-window]WebComponents.cq-floating-window
       * web component is available to handle event messaging and create the shortcuts legend floating
       * window.
       *
       * This function is called when the add-on is instantiated.
       *
       * @param stx The chart engine that provides the UI context, which contains the
       * [cq-floating-window]WebComponents.cq-floating-window web component.
       *
       * @since 8.2.0
       */
      public ensureMessagingAvailable(stx: CIQ.ChartEngine): void
      /**
       * Creates the contents of the keyboard shortcuts legend based on specifications contained in a
       * configuration object. The contents are displayed in a
       * [cq-floating-window]WebComponents.cq-floating-window web component.
       *
       * This function is called when the add-on is instantiated.
       *
       * @param config A configuration object that includes specifications for drawing tool
       * 		keyboard shortcuts and hot keys. Typically, this object is the chart configuration object
       * 		(see the {@tutorial Chart Configuration} tutorial).
       * @return The keyboard shortcuts legend as HTML.
       *
       * @since 8.2.0
       */
      public getShortcutContent(config: object): string
      /**
       * Opens and closes the floating window that contains the keyboard shortcuts legend.
       *
       * @param [value] If true, the window is opened. If false, the window is closed.
       * 		If not provided, the window state is toggled. That is, the window is opened if it is
       * 		currently closed; closed, if it is currently open.
       *
       * @since 8.2.0
       */
      public toggle(value?: boolean): void
    }
    /**
     * Creates an overlay that displays the visible chart data segment as a table.
     *
     * The overlay includes controls that enable users to copy the table data to the clipboard or
     * download the data as a character-separated values (CSV) file. See
     * TableViewBuilder.dataToCsv for the default separator character.
     *
     * The table view can be opened using the Alt+K keystroke combination and closed using the Escape
     * key (see the `tableView` action in `hotkeyConfig.hotkeys` in *js/defaultConfiguration.js*).
     *
     * Requires *addOns.js*.
     *
     * 		which the table view is created.
     * 		table columns. **Note:** The units can be any CSS unit acceptable by the CSS `calc`
     * 		function.
     * 		view covers the entire chart, including user interface elements (symbol input field,
     * 		menus, etc.). For example, if the value of this parameter is 1000, the table view covers
     * 		the entire chart area if the chart width is <= 999 pixels.
     * 		ultimately contains the table view; for example, ".chartContainer".
     * 		the previous data point should be used instead of the opening price of the current data
     * 		point to determine the amount of change for the current data point; that is,
     * 		(current close - previous close) or (current close - current open).
     *
     * @since 8.1.0
     *
     * @example
     * new CIQ.TableView({ stx: stxx });
     */
    class TableView {
      /**
       * Creates an overlay that displays the visible chart data segment as a table.
       *
       * The overlay includes controls that enable users to copy the table data to the clipboard or
       * download the data as a character-separated values (CSV) file. See
       * TableViewBuilder.dataToCsv for the default separator character.
       *
       * The table view can be opened using the Alt+K keystroke combination and closed using the Escape
       * key (see the `tableView` action in `hotkeyConfig.hotkeys` in *js/defaultConfiguration.js*).
       *
       * Requires *addOns.js*.
       *
       * @param params Configuration parameters.
       * @param params.stx A reference to the chart engine that contains the chart for
       * 		which the table view is created.
       * @param [params.minColumnWidth="84px"] The minimum width (including units) of the
       * 		table columns. **Note:** The units can be any CSS unit acceptable by the CSS `calc`
       * 		function.
       * @param [params.coverUIMaxWidth=400] The chart width (in pixels) below which the table
       * 		view covers the entire chart, including user interface elements (symbol input field,
       * 		menus, etc.). For example, if the value of this parameter is 1000, the table view covers
       * 		the entire chart area if the chart width is <= 999 pixels.
       * @param [params.coverContainer] A CSS selector used to obtain the DOM element that
       * 		ultimately contains the table view; for example, ".chartContainer".
       * @param [params.usePreviousCloseForChange=true] Indicates whether the closing price of
       * 		the previous data point should be used instead of the opening price of the current data
       * 		point to determine the amount of change for the current data point; that is,
       * 		(current close - previous close) or (current close - current open).
       *
       * @since 8.1.0
       *
       * @example
       * new CIQ.TableView({ stx: stxx });
       */
      constructor(
        params: {
          stx: CIQ.ChartEngine,
          minColumnWidth?: string,
          coverUIMaxWidth?: number,
          coverContainer?: string,
          usePreviousCloseForChange?: boolean
        }
      )
      /**
       * The chart engine instance that contains the chart for which the table view is created.
       *
       * @since 8.1.0
       */
      public stx: CIQ.ChartEngine
      /**
       * Toggle to display and hide additional table view columns, such as % Change and Volume.
       *
       * **Note:** Data in the additional columns might not be present in the chart view because
       * the data is calculated (for example, % Change) or is not part of the standard chart
       * display (for example, Volume — which can be displayed with the
       * [Volume Chart]CIQ.Studies.createVolumeChart study).
       *
       * @since 8.1.0
       */
      public viewAdditionalColumns: boolean
      /**
       * Minimum width of the table view columns, including units. The units can be any CSS
       * unit acceptable by the CSS `calc` function.
       *
       * @since 8.1.0
       */
      public minColumnWidth: string
      /**
       * The chart width in pixels below which the table view covers the entire chart, including
       * user interface elements, such as the menus and footer.
       *
       * @since 8.1.0
       */
      public coverUIMaxWidth: number
      /**
       * A CSS selector used to obtain the DOM element that hosts the table view.
       *
       * @since 8.1.0
       */
      public coverContainer: string
      /**
       * If true, the closing price of the previous data point is used instead of the opening
       * price of the current data point to determine the amount of change for the current data
       * point.
       *
       * @since 8.1.0
       */
      public usePreviousCloseForChange: boolean
      /**
       * A reference to the TableViewBuilder namespace for access to the namespace
       * static methods.
       *
       * @since 8.1.0
       */
      public builder: TableViewBuilder
      /**
       * Displays the table view.
       *
       * @param [params] Configuration parameters.
       * @param [params.config] Table column information.
       * @param [params.onClose] Callback function to execute on closing the table view. The
       * 		callback enables synchronization of state in the application when the table view is
       * 		closed.
       *
       * @since 8.1.0
       */
      public open(params?: {config?: object, onClose?: Function}): void
      /**
       * Closes the table view.
       *
       * @param [notify=true] Indicates whether the `onClose` callback function is set (see
       * 		[open]CIQ.TableView#open).
       *
       * @since 8.1.0
       */
      public close(notify?: boolean): void
      /**
       * Opens the table view if it is closed. Closes the table view if it is open.
       *
       * @since 8.1.0
       */
      public toggle(): void
      /**
       * Subscribes to changes in the table view component communication channel, which enables other
       * components to open and close the table view.
       *
       * @param uiContext The user interface context of the table view. Provides the
       * 		communication channel path that identifies the table view channel.
       * @param [channelPath] Specifies the channel path if the path is not available in the
       * 		context configuration provided by `uiContext`.
       *
       * @since 8.1.0
       */
      public subscribeToChanges(uiContext: CIQ.UI.Context, channelPath?: string): void
    }
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
     * Visual Reference:
     * ![stx-hu-tooltip](stx-hu-tooltip.png "stx-hu-tooltip")
     *
     * 		the mouse is over the primary line/bars.
     * 		when the internal chart periodicity is a daily interval (see
     * 		CIQ.ChartEngine.isDailyInterval).
     * 		there is no data between bars. **Note:** A value of `null` is not considered missing
     * 		data.
     * 		time zone; false, to use the `displayZone` time zone (see
     * 		CIQ.ChartEngine#setTimeZone).
     * 		point) the mouse is hovering over is highlighted. Applies to the floating tooltip only
     * 		(the dynamic tooltip points to the bar). If the crosshairs are active, this parameter
     * 		is ignored.
     *
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
    class Tooltip {
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
       * Visual Reference:
       * ![stx-hu-tooltip](stx-hu-tooltip.png "stx-hu-tooltip")
       *
       * @param tooltipParams The constructor parameters.
       * @param [tooltipParams.stx] The chart object.
       * @param [tooltipParams.ohl] Set to true to show OHL data (Close is always shown).
       * @param [tooltipParams.volume] Set to true to show Volume.
       * @param [tooltipParams.series] Set to true to show value of series.
       * @param [tooltipParams.studies] Set to true to show value of studies.
       * @param [tooltipParams.showOverBarOnly] Set to true to show the tooltip only when
       * 		the mouse is over the primary line/bars.
       * @param [tooltipParams.change] Set to true to show the change in daily value
       * 		when the internal chart periodicity is a daily interval (see
       * 		CIQ.ChartEngine.isDailyInterval).
       * @param [tooltipParams.interpolation] Set to true to show the estimated value when
       * 		there is no data between bars. **Note:** A value of `null` is not considered missing
       * 		data.
       * @param [tooltipParams.useDataZone] Set to true to show the date in the `dataZone`
       * 		time zone; false, to use the `displayZone` time zone (see
       * 		CIQ.ChartEngine#setTimeZone).
       * @param [tooltipParams.showBarHighlight=true] Specifies whether the bar (data
       * 		point) the mouse is hovering over is highlighted. Applies to the floating tooltip only
       * 		(the dynamic tooltip points to the bar). If the crosshairs are active, this parameter
       * 		is ignored.
       *
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
      constructor(
        tooltipParams: {
          stx?: CIQ.ChartEngine,
          ohl?: boolean,
          volume?: boolean,
          series?: boolean,
          studies?: boolean,
          showOverBarOnly?: boolean,
          change?: boolean,
          interpolation?: boolean,
          useDataZone?: boolean,
          showBarHighlight?: boolean
        }
      )
    }
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
     * **Animation displays more gracefully when updates are sent into the chart one at a time using CIQ.ChartEngine#updateChartData
     * instead of in batches using a [QuoteFeed]CIQ.ChartEngine#attachQuoteFeed. Sending data in batches will produce a ‘jumping’ effect.**
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
     * You can disable animation after each different [chart type is activated]CIQ.ChartEngine#setChartType by calling:
     * ```
     * stxx.mainSeriesRenderer.supportsAnimation=false;
     * ```
     * Keep in mind that changing to a different chart type, may once again enable animation. You can override this by [adding an event listener]CIQ.ChartEngine#addEventListener on [layout changes]CIQ.ChartEngine~layoutEventListener.
     *
     * @since
     * - 3.0.0 Now part of *addOns.js*. Previously provided as a standalone *animation.js* file.
     * - 4.0.0 Beacon only flashes for line charts. On candles or bars, it is suppressed as it produces an unnatural effect.
     * - 7.0.2 Now takes one configuration object as its constructor. Must have a reference to a chart engine.
     * @example
     * 	new CIQ.Animation({stx: stxx, animationParameters: {tension:0.3}});  //Default animation with splining tension of 0.3
     *
     */
    class Animation {
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
       * **Animation displays more gracefully when updates are sent into the chart one at a time using CIQ.ChartEngine#updateChartData
       * instead of in batches using a [QuoteFeed]CIQ.ChartEngine#attachQuoteFeed. Sending data in batches will produce a ‘jumping’ effect.**
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
       * You can disable animation after each different [chart type is activated]CIQ.ChartEngine#setChartType by calling:
       * ```
       * stxx.mainSeriesRenderer.supportsAnimation=false;
       * ```
       * Keep in mind that changing to a different chart type, may once again enable animation. You can override this by [adding an event listener]CIQ.ChartEngine#addEventListener on [layout changes]CIQ.ChartEngine~layoutEventListener.
       *
       * @param config The constructor parameters
       * @param config.stx The chart object
       * @param [config.animationParameters] Configuration parameters
       * @param [config.animationParameters.stayPut=false] Set to true for last tick to stay in position it was scrolled and have rest of the chart move backwards as new ticks are added instead of having new ticks advance forward and leave the rest of the chart in place.
       * @param [config.animationParameters.ticksFromEdgeOfScreen=5] Number of ticks from the right edge the chart should stop moving forward so the last tick never goes off screen (only applicable if stayPut=false)
       * @param [config.animationParameters.granularity=1000000] Set to a value that will give enough granularity for the animation.  The larger the number the smaller the price jump between frames, which is good for charts that need a very slow smooth animation either because the price jumps between ticks are very small, or because the animation was set up to run over a large number of frames when instantiating the CIQ.EaseMachine.
       * @param [config.animationParameters.tension=null] Splining tension for smooth curves around data points (range 0-1).
       * @param config.easeMachine Override the default easeMachine.  Default is `new CIQ.EaseMachine(Math.easeOutCubic, 1000);`
       * @since
       * - 3.0.0 Now part of *addOns.js*. Previously provided as a standalone *animation.js* file.
       * - 4.0.0 Beacon only flashes for line charts. On candles or bars, it is suppressed as it produces an unnatural effect.
       * - 7.0.2 Now takes one configuration object as its constructor. Must have a reference to a chart engine.
       * @example
       * 	new CIQ.Animation({stx: stxx, animationParameters: {tension:0.3}});  //Default animation with splining tension of 0.3
       *
       */
      constructor(
        config: {
          stx: CIQ.ChartEngine,
          easeMachine: CIQ.EaseMachine,
          animationParameters?: {
            stayPut?: boolean,
            ticksFromEdgeOfScreen?: number,
            granularity?: number,
            tension?: number
          }
        }
      )
    }
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
     * See CIQ.ChartEngine#setPeriodicity and CIQ.ChartEngine#createDataSet
     *
     * Requires *addOns.js*.
     *
     * The feature will not work without supplying at least one element within the periodicities array
     * and at least one property within the boundaries object.
     *
     * 		These will be the periodicities which will be used by the continuous zooming once a
     * 		boundary is hit. The periodicities are objects with `period`, `interval`, and optional
     * 		`timeUnit` properties (see CIQ.ChartEngine#setPeriodicity).
     * 		Hitting a maximum boundary switches to the next larger periodicity; hitting a minimum
     * 		boundary switches to the next smaller periodicity.
     * 		before switching periodicity.
     * 		before switching periodicity.
     * 		periodicity.
     * 		periodicity.
     *
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
    class ContinuousZoom {
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
       * See CIQ.ChartEngine#setPeriodicity and CIQ.ChartEngine#createDataSet
       *
       * Requires *addOns.js*.
       *
       * The feature will not work without supplying at least one element within the periodicities array
       * and at least one property within the boundaries object.
       *
       * @param params Configuration parameters.
       * @param params.stx The chart object.
       * @param params.periodicities Set this array with eligible periodicities in any order.
       * 		These will be the periodicities which will be used by the continuous zooming once a
       * 		boundary is hit. The periodicities are objects with `period`, `interval`, and optional
       * 		`timeUnit` properties (see CIQ.ChartEngine#setPeriodicity).
       * @param params.boundaries Optional boundary cases to trigger the periodicity change.
       * 		Hitting a maximum boundary switches to the next larger periodicity; hitting a minimum
       * 		boundary switches to the next smaller periodicity.
       * @param [params.boundaries.maxCandleWidth] Largest size of candle in pixels to display
       * 		before switching periodicity.
       * @param [params.boundaries.minCandleWidth] Smallest size of candle in pixels to display
       * 		before switching periodicity.
       * @param [params.boundaries.maxTicks] Most number of ticks to display before switching
       * 		periodicity.
       * @param [params.boundaries.minTicks] Least number of ticks to display before switching
       * 		periodicity.
       *
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
      constructor(
        params: {
          stx: CIQ.ChartEngine,
          periodicities: any[],
          boundaries: {
            maxCandleWidth?: number,
            minCandleWidth?: number,
            maxTicks?: number,
            minTicks?: number
          }
        }
      )
    }
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
     * 		normal data range. The default value hides only extreme outliers.
     * 		outlier markers when multiple y-axes share the same panel. Markers for the first
     * 		additional y-axis are styled with the value at index 0; markers for the second
     * 		additional y-axis, the value at index 1; and so forth. If not provided, a default
     * 		array of colors is assigned.
     * 		that contains the UI control for the outliers add-on. In a multi-chart document, the
     * 		add-on is available only on charts that have a menu DOM element with the value for
     * 		`menuContextClass` as a class attribute.
     *
     * @since
     * - 7.5.0
     * - 8.0.0 Added `params.altColors` and `params.menuContextClass`.
     *
     * @example
     * new CIQ.Outliers({ stx: stxx });
     */
    class Outliers {
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
       * @param params Configuration parameters.
       * @param [params.stx] A reference to the chart object.
       * @param [params.multiplier=3] Sets the threshold for outliers by multiplying the
       * 		normal data range. The default value hides only extreme outliers.
       * @param [params.altColors] An array of hexadecimal color values used to style
       * 		outlier markers when multiple y-axes share the same panel. Markers for the first
       * 		additional y-axis are styled with the value at index 0; markers for the second
       * 		additional y-axis, the value at index 1; and so forth. If not provided, a default
       * 		array of colors is assigned.
       * @param [params.menuContextClass] A CSS class name used to query the menu DOM element
       * 		that contains the UI control for the outliers add-on. In a multi-chart document, the
       * 		add-on is available only on charts that have a menu DOM element with the value for
       * 		`menuContextClass` as a class attribute.
       *
       * @since
       * - 7.5.0
       * - 8.0.0 Added `params.altColors` and `params.menuContextClass`.
       *
       * @example
       * new CIQ.Outliers({ stx: stxx });
       */
      constructor(
        params: {
          stx?: CIQ.ChartEngine,
          multiplier?: number,
          altColors?: any[],
          menuContextClass?: string
        }
      )
      /**
       * Checks for outlier values in `dataSet`, and adds outlier markers (data point markers
       * and axis markers) to `axis`.
       *
       * @param dataSet An array of objects of the form `{value: Number, quote: Object}`.
       * 		Each object contains a value and its associated quote. The value is checked to
       * 		determine whether it is an outlier of the data set. When checking more than one
       * 		value for a quote (such as an OHLC quote), each value is included in a separate
       * 		object; for example, `[{value: open, quote: quote}, {value: high, quote: quote},
       * 		{value: low, quote: quote}, {value: close, quote: quote}...]`.
       * @param panel The panel where `dataSet` is rendered.
       * @param axis The y-axis against which `dataSet` is rendered. **Note:** Charts
       * 		and panels can have multiple y-axes; each y-axis has its own set of outlier
       * 		markers based on the data rendered on the axis.
       * @return A tuple consisting of the outlier minimum and maximum — or trend
       * 		minimum and maximum, if no outliers are found — to be handled by the
       * 		CIQ.ChartEngine#determineMinMax method. See the return value of the
       * 		[find]CIQ.Outliers#find function for a description of outlier and trend
       * 		minimum and maximum.
       *
       * @since 8.0.0
       */
      public processDataSet(dataSet: any[], panel: object, axis: object): any[]
      /**
       * Finds the outliers contained in `dataSet`.
       *
       * **Note:** This function may be overridden to provide a custom algorithm for finding
       * outliers.
       *
       * @param dataSet An array of objects of the form `{value: Number, quote: Object}`.
       * 		Each object contains a value and its associated quote. The value is checked to
       * 		determine whether it is an outlier of the data set. When checking more than one
       * 		value for a quote (such as an OHLC quote), each value is included in a separate
       * 		object; for example, `[{value: open, quote: quote}, {value: high, quote: quote},
       * 		{value: low, quote: quote}, {value: close, quote: quote}...]`.
       * @return An object of the form:
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
       * @since
       * - 7.5.0
       * - 8.0.0 Added return value.
       */
      public find(dataSet: any[]): object
      /**
       * Updates the freshness status of outlier markers belonging to `targetAxis`.
       *
       * Sets the status to fresh if the markers represent data points in the `activeOutliers`
       * list of `targetAxis` or a marker is an axis marker for high or low outliers and high or
       * low outliers exist. (See the return value of the [find]CIQ.Outliers#find
       * function for a description of the `activeOutliers` list.)
       *
       * Adds new markers to `targetAxis` for data points in the `activeOutliers` list not
       * already represented by a marker (see [markOutlier]CIQ.Outliers#markOutlier).
       * Adds new axis markers if the data set rendered on `targetAxis` contains high or low
       * outliers and the respective axis marker does not exist (see
       * [markAxis]CIQ.Outliers#markAxis).
       *
       * Sets the status of all other markers belonging to `targetAxis` to stale, or unfresh
       * (these markers are ultimately removed).
       *
       * @param targetAxis The y-axis for which the markers are refreshed.
       * 		**Note:** Charts and panels can have multiple y-axes, each with its own array of
       * 		outlier markers.
       *
       * @since 8.0.0
       */
      public refreshMarkerArray(targetAxis: object): void
      /**
       * Sets the outlier display state, which determines whether to display outlier markers.
       *
       * @param newState The intended display state; should be one of:
       * <ul>
       *		<li>"high" — Show high outliers; hide high outlier markers.</li>
       *		<li>"low" — Show low outliers; hide low outlier markers.</li>
       *		<li>"all" — Show high and low outliers; hide high and low outlier markers.</li>
       *		<li>"none" — Hide high and low outliers; show high and low outlier markers.</li>
       * </ul>
       * If none of the above is provided, "none" is assumed.
       * @param targetAxis The y-axis on which the outlier state is set. **Note:** A
       * 		chart or panel can have multiple y-axes.
       *
       * @since
       * - 7.5.0
       * - 8.0.0 Added `targetAxis` parameter.
       */
      public setDisplayState(newState: string, targetAxis: object): void
      /**
       * Removes all markers from `targetAxis` that are no longer fresh; that is, markers that
       * do not represent data points in the current data set, or axis markers that are
       * irrelevant because high or low outliers no longer exist. Sets the status of all
       * remaining outlier markers to stale, or not fresh (the freshness status should
       * subsequently be reevaluated).
       *
       * @param targetAxis The y-axis for which the markers are deprecated. **Note:**
       * 		A chart or panel can have multiple y-axes; each y-axis has its own outlier
       * 		markers based on the data rendered on the axis.
       *
       * @since
       * - 7.5.0
       * - 8.0.0 Added `targetAxis` parameter.
       */
      public deprecateMarkers(targetAxis: object): void
      /**
       * Removes all outlier markers from `targetAxis`, including data point markers and y-axis
       * markers.
       *
       * @param targetAxis The y-axis from which the markers are removed. **Note:**
       * 		Charts and panels can have multiple y-axes, each with its own outlier markers.
       *
       * @since
       * - 7.5.0
       * - 8.0.0 Added `targetAxis` parameter.
       */
      public removeAllMarkers(targetAxis: object): void
      /**
       * Shows or hides outlier markers based on the display state.
       *
       * See [setDisplayState]CIQ.Outliers#setDisplayState.
       *
       * @since 7.5.0
       */
      public updateMarkerVisibility(): void
      /**
       * Updates the position of the axis outlier marker represented by `node`.
       *
       * @param node The axis marker to position.
       * @param targetAxis The y-axis on which the axis marker is positioned.
       *
       * @since
       * - 7.5.0
       * - 8.0.0 Added `targetAxis` parameter.
       */
      public refreshAxisMarkers(node: HTMLElement, targetAxis: object): void
      /**
       * Updates the display styles of all outlier markers belonging to `targetAxis`, including
       * data point markers and axis markers. Shows the markers if outliers are hidden and the
       * marked outliers exceed the bounds of `targetAxis`. Flips the markers if `targetAxis`
       * has been inverted (see [flipMarkers]CIQ.Outliers#flipMarkers).
       *
       * @param targetAxis The y-axis on which the markers are refreshed. **Note:**
       * 		Charts and panels can have multiple y-axes, each with its own outlier markers.
       *
       * @since 8.0.0
       */
      public refreshMarkers(targetAxis: object): void
      /**
       * Places markers on the y-axis when high or low outliers exist.
       *
       * @param position The position of the marker; either "high" or "low". If the
       * 		position is "high", the marker is placed at the top of the axis; if "low", at the
       * 		bottom of the axis.
       * @param targetAxis The y-axis on which the markers are placed. **Note:**
       * 		Charts and panels can have multiple y-axes, each with its own outlier markers.
       * @return The axis outlier marker, which is added to the display.
       *
       * @since
       * - 7.5.0
       * - 8.0.0 Added `position` and `targetAxis` parameters and return value.
       */
      public markAxis(position: string, targetAxis: object): CIQ.Marker
      /**
       * Adds an outlier marker to a tick (data point).
       *
       * @param data Represents the tick that is marked as an outlier. Contains the
       * 		outlier value and its associated quote; for example,
       * 		`{value: Number, quote: Object}`.
       * @param position The position of the marker; either "high" or "low". If the
       * 		position is "high", the marker is placed at the top of the chart; if "low", at the
       * 		bottom of the chart.
       * @param targetAxis The y-axis to which the marker is added. **Note:** A chart
       * 		or panel can have multiple y-axes; each y-axis has its own outlier markers.
       * @return The outlier marker, which is added to the display.
       *
       * @since
       * - 7.5.0
       * - 8.0.0 Added `targetAxis` parameter.
       */
      public markOutlier(data: object, position: string, targetAxis: object): CIQ.Marker
      /**
       * Calls [setDisplayState]CIQ.Outliers#setDisplayState in response to selecting an
       * outlier marker.
       *
       * @param position The position of the marker; either "high" or "low".
       * @param targetAxis The y-axis that contains the selected marker. **Note:**
       * 		Charts and panels can have multiple y-axes; each y-axis has its own outlier
       * 		markers.
       * @param targetNode The selected outlier marker DOM node.
       *
       * @since 8.0.0
       */
      public handleMarkerClick(position: string, targetAxis: object, targetNode: HTMLElement): void
      /**
       * Sets the CSS style properties of the y-axis outlier marker to match the CSS styling of
       * the y-axis itself.
       *
       * @param node The y-axis marker to style.
       *
       * @since 7.5.0
       */
      public matchYAxisStyle(node: HTMLElement): void
      /**
       * Applies a background color to an outlier data point marker.
       *
       * @param node The outlier marker DOM node to which the background color is
       * 		applied.
       * @param color The hexadecimal color value set as the node background color.
       *
       * @since 8.0.0
       */
      public setMarkerColor(node: HTMLElement, color: string): void
      /**
       * Repositions outlier markers from the top of the display to the bottom (or vice versa)
       * when the associated y-axis has been flipped (inverted).
       *
       * @param targetAxis The y-axis that has been flipped.
       *
       * @since 8.0.0
       */
      public flipMarkers(targetAxis: object): void
    }
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
     * See `[setQuoteFeed]CIQ.PlotComplementer#setQuoteFeed`.
     *
     * **Note:** The series created by this add-on is not exported with the layout, since it is
     * created in tandem with the series it complements. Currently, this feature works only with
     * non-comparison series.
     *
     * Requires *addOns.js*.
     *
     * 		a random key is chosen.
     * 		quote requests for any series created by the add-on.
     * 		parameter list.
     * 		parameter list. See `[setQuoteFeed]CIQ.PlotComplementer#setQuoteFeed`.
     * 		The `decorator` provides the label (`symbol`) for the complementary series and a short
     * 		description (`display`) that is appended to the label; for example:
     * ```
     * decorator: {symbol:"_fcst", display:" Forecast"}
     * ```
     * 		complementary series. Otherwise, a unique ID is used.
     * 		collection of parameters that override the default rendering parameters. The
     * 		`renderingParameters` object can be set or changed at any time. The default parameters
     * 		can be restored by calling CIQ.PlotComplementer#resetRenderingParameters.
     * 		<p>Here are a few examples of rendering parameters:</p>
     * ```
     * // Assuming a PlotComplementer declared as "forecaster":
     * forecaster.renderingParameters = {chartType:"scatterplot", opacity:0.5, field:"Certainty"}
     * forecaster.renderingParameters = {chartType:"histogram", border_color:"transparent", opacity:0.3}
     * forecaster.renderingParameters = {chartType:"channel", opacity:0.5, pattern:"dotted"}
     * forecaster.renderingParameters = {chartType:"candle", opacity:0.5, color:"blue", border_color:"blue"}
     * ```
     *
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
    class PlotComplementer {
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
       * See `[setQuoteFeed]CIQ.PlotComplementer#setQuoteFeed`.
       *
       * **Note:** The series created by this add-on is not exported with the layout, since it is
       * created in tandem with the series it complements. Currently, this feature works only with
       * non-comparison series.
       *
       * Requires *addOns.js*.
       *
       * @param params Configuration parameters.
       * @param params.stx The chart object.
       * @param [params.id] Unique key used by the add-on to identify itself. If not supplied,
       * 		a random key is chosen.
       * @param [params.quoteFeed] Attaches the quote feed to the quote driver to satisfy any
       * 		quote requests for any series created by the add-on.
       * @param [params.behavior] Used as the behavior for the quote feed supplied in this
       * 		parameter list.
       * @param [params.filter] Used as the filter for the quote feed supplied in this
       * 		parameter list. See `[setQuoteFeed]CIQ.PlotComplementer#setQuoteFeed`.
       * @param [params.decorator] Container object for the `symbol` and `display` properties.
       * 		The `decorator` provides the label (`symbol`) for the complementary series and a short
       * 		description (`display`) that is appended to the label; for example:
       * ```
       * decorator: {symbol:"_fcst", display:" Forecast"}
       * ```
       * @param [params.decorator.symbol] Adds this string onto the ID when creating the
       * 		complementary series. Otherwise, a unique ID is used.
       * @param [params.decorator.display] Customizes the display value of the series.
       * @param [params.renderingParameters={chartType: "line", width: 1, opacity: 0.5}] A
       * 		collection of parameters that override the default rendering parameters. The
       * 		`renderingParameters` object can be set or changed at any time. The default parameters
       * 		can be restored by calling CIQ.PlotComplementer#resetRenderingParameters.
       * 		<p>Here are a few examples of rendering parameters:</p>
       * ```
       * // Assuming a PlotComplementer declared as "forecaster":
       * forecaster.renderingParameters = {chartType:"scatterplot", opacity:0.5, field:"Certainty"}
       * forecaster.renderingParameters = {chartType:"histogram", border_color:"transparent", opacity:0.3}
       * forecaster.renderingParameters = {chartType:"channel", opacity:0.5, pattern:"dotted"}
       * forecaster.renderingParameters = {chartType:"candle", opacity:0.5, color:"blue", border_color:"blue"}
       * ```
       *
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
      constructor(
        params: {
          stx: CIQ.ChartEngine,
          id?: string,
          quoteFeed?: object,
          behavior?: object,
          filter?: Function,
          decorator?: {
            symbol?: string,
            display?: string
          },
          renderingParameters?: object
        }
      )
      /**
       * Resets the `PlotComplementer` rendering values to the default settings.
       *
       * Default settings can be provided in the parameters passed to the `PlotComplementer` constructor. If no settings are
       * provided to the constructor, `PlotComplementer` uses the following defaults: `{ chartType:"line", width:1, opacity:0.5 }`.
       *
       * The rendering parameters may be set anytime after creating `PlotComplementer`; for example, to set an ad-hoc rendering
       * right before adding a series.
       *
       * @since 7.3.0
       */
      public resetRenderingParameters(): void
      /**
       * Sets a quote feed for the `PlotComplementer`.
       *
       * Automatically called when a quote feed is provided in the constructor argument. If a
       * quote feed or `behavior` object is not specified in `params`, this function returns
       * without doing anything.
       *
       * @param params Configuration parameters.
       * @param params.quoteFeed Quote feed to attach to the quote driver to satisfy
       * 		any quote requests for any series created by the add-on. This quote feed is like
       * 		any time series quote feed object. See the
       * 		[Data Integration Overview]{@tutorial DataIntegrationOverview}.
       * @param params.behavior Behavior for the quote feed supplied in this parameter
       * 		list. This object is like any `behavior` object associated with a quote feed.
       * 		See CIQ.ChartEngine#attachQuoteFeed for more information on `behavior`
       * 		objects.
       * @param [params.filter] Filters the quote feed supplied in this parameter
       * 		list. The filter function takes as an argument an object typically containing
       * 		`symbolObject`, `symbol`, and `interval` properties. The properties associate the
       * 		`PlotComplementer` with an instrument. If the `filter` function returns true, the
       * 		`PlotComplementer` quote feed is used for the instrument.
       * 		<p>This `filter` function is like the `filter` in basic quote feeds.
       * 		See CIQ.ChartEngine#attachQuoteFeed for more information on quote feed
       * 		`filter` functions.</p>
       * @since 7.3.0
       */
      public setQuoteFeed(
        params: {
          quoteFeed: object,
          behavior: object,
          filter?: Function
        }
      ): void
    }
  }

  /**
   * Namespace for CIQ.TableView creation–related properties and functions.
   *
   * @since 8.1.0
   */
  export class TableViewBuilder {
  }

  /**
   * Namespace for CIQ.TableView creation–related properties and functions.
   *
   * @since 8.1.0
   */
  export namespace TableViewBuilder {
    /**
     * The column header configuration for the table view.
     *
     * Can be used for rearranging the column order, removing columns, and updating labels.
     *
     * **Note:** Adding new columns has no effect.
     *
     * @since 8.1.0
     */
    let colHeaders: Record<string, {label: string, cls: string|undefined}>
    /**
     * Number of decimal places to display for percent formatted columns
     *
     * @since 8.1.0
     */
    let percentDecimalPlaces: number
    /**
     * Creates a table view as an HTMLElement overlay over a chart container. The table view displays
     * a snapshot of the visible chart data segment.
     *
     * The overlay contains buttons for copying and saving the table data and for displaying
     * additional table columns.
     *
     * @param stx A reference to the chart engine that contains the chart for which
     * 		the table view is created.
     * @param [config] Configuration parameters.
     * @param [config.dateFormatter] Formats table date fields.
     * @param [config.valueFormatter] Formats table values.
     * @param [config.volumeFormatter] Formats the table volume field.
     * @param [config.fileNameFormatter] Formats the name of the file that contains the
     * 		downloaded table data.
     * @param [config.minColumnWidth="84px"] The minimum width (including units) of the
     * 		table columns. **Note:** The units can be any CSS unit acceptable by the CSS `calc`
     * 		function.
     * @return
     *
     * @since 8.1.0
     */
    function createTable(
      stx: CIQ.ChartEngine,
      config?: {
        dateFormatter?: Function,
        valueFormatter?: Function,
        volumeFormatter?: Function,
        fileNameFormatter?: Function,
        minColumnWidth?: string
      }
    ): HTMLElement
    /**
     * Creates an HTML table containing the chart data and column headers (see
     * TableViewBuilder.colHeaders).
     *
     * @param data The chart data.
     * @param params Configuration parameters.
     * @param>} params.colHeaders The column
     * 		headers as defined in TableViewBuilder.colHeaders.
     * @param [params.minColumnWidth] The minimum width of the table columns, including units.
     * 		**Note:** The units can be any CSS unit acceptable by the CSS `calc` function.
     * @return A table containing the chart data and column headers.
     *
     * @since 8.1.0
     */
    function dataToHtml(
      data: object[],
      params: {
        colHeaders: Record<string, {label: string, cls: string|undefined}>,
        minColumnWidth?: string
      }
    ): HTMLElement
    /**
     * Transforms the chart data into a character-separated values (CSV) file, including column headers.
     *
     * @param data The chart data.
     * @param params Configuration parameters.
     * @param>} params.colHeaders The column
     * 		headers as defined in TableViewBuilder.colHeaders.
     * @param params.colSeparator="\t" The column separator for the CSV format.
     * @return The column headers and chart data as a CSV file.
     *
     * @since 8.1.0
     */
    function dataToCsv(
      data: object[],
      params: {
        colHeaders: Record<string, {label: string, cls: string|undefined}>,
        colSeparator: string
      }
    ): string
    /**
     * Downloads the table view as a character-separated values (CSV) file.
     *
     * @param csvString The table view in the form of character-separated data.
     * @param filename The name given to the download file.
     *
     * @since 8.1.0
     */
    function downloadCsv(csvString: string, filename: string): void
    /**
     * Extracts OHLC (open, high, low, close) data from the chart.
     *
     * @param stx A reference to the chart engine that contains the chart from which
     * 		the data is extracted.
     * @param params Configuration parameters.
     * @param [params.dateFormatter] Formats date fields.
     * @param [params.valueFormatter] Formats OHLC and other values.
     * @param [params.percentFormatter] Formats percent fields.
     * @param [params.volumeFormatter] Formats the volume field.
     * @param [params.additionalDataFields] An array of additional data field names for
     * 		comparison series and study data.
     * @return The formatted chart data.
     *
     * @since 8.1.0
     */
    function getChartData(
      stx: CIQ.ChartEngine,
      params: {
        dateFormatter?: Function,
        valueFormatter?: Function,
        percentFormatter?: Function,
        volumeFormatter?: Function,
        additionalDataFields?: string[]
      }
    ): object[]
    /**
     * Creates a function that formats table view date fields.
     *
     * @param stx A reference to the chart engine that contains the chart for which
     * 		the date fields are formatted.
     * @return A date formatter.
     *
     * @since 8.1.0
     */
    function getDateFormatter(stx: CIQ.ChartEngine): Function
    /**
     * Creates a function that formats table view value fields.
     *
     * @param stx A reference to the chart engine that contains the chart for which
     * 		the value fields are formatted.
     * @param [decimalPlaces] Number of decimal places to use, overrides any auto-detection of decimal places in data.
     * @return A value formatter.
     *
     * @since 8.1.0
     */
    function getValueFormatter(stx: CIQ.ChartEngine, decimalPlaces?: number): Function
    /**
     * Creates a function that formats the table view volume field.
     *
     * @param stx A reference to the chart engine that contains the chart for which
     * 		the volume field is formatted.
     * @return A volume field formatter.
     *
     * @since 8.1.0
     */
    function getVolumeFormatter(stx: CIQ.ChartEngine): Function
    /**
     * Creates a function that creates and formats a file name from the chart symbol and table view
     * data.
     *
     * @param stx A reference to the chart engine that contains the chart whose
     * 		symbol and data is included in the file name.
     * @return A function that creates and formats a file name.
     *
     * @since 8.1.0
     */
    function getFilenameFormatter(stx: CIQ.ChartEngine): Function
    /**
     * Creates and attaches an HTML container element to the DOM. The element covers the chart and
     * contains the table view.
     *
     * @param stx A reference to the chart engine that contains the chart over which
     * 		the cover is placed.
     * @param params Configuration parameters.
     * @param [params.coverUIMaxWidth] The width of the chart (in pixels) below which the
     * 		cover element overlays the entire chart, including user interface elements.
     * @param [params.coverContainer] A CSS selector used to obtain the DOM element that
     * 		serves as the parent element of the cover element; for example, ".chartContainer".
     * @return The cover element.
     *
     * @since 8.1.0
     */
    function getChartCover(
      stx: CIQ.ChartEngine,
      params: {
        coverUIMaxWidth?: number,
        coverContainer?: string
      }
    ): HTMLElement
    /**
     * Creates a toolbar containing the table title and controls used to copy and download the table
     * data and add additional table columns.
     *
     * @param params Function parameters.
     * @param params.symbol An instrument symbol, which is used as the table title in the
     * 		toolbar. Should be the symbol of the chart main series.
     * @param params.viewAdditionalColumns Toggle that specifies whether the label for the
     * 		additional columns button should indicate that additional columns will be shown or hidden.
     * 		If this parameter is true, the label indicates additional table columns will be shown; if
     * 		false, hidden.
     * @param [params.copyFn] Event handler for selection of the copy control.
     * @param [params.downloadFn] Event handler for selection of the download control.
     * @param [params.toggleAdditionalColumnsFn] Event handler for selection of the
     * 		additional column control.
     * @param [params.closeFn] Event handler for selection of the table view close (X)
     * 		control.
     * @return The toolbar, containing title and controls.
     *
     * @since 8.1.0
     */
    function getCoverToolbar(
      params: {
        symbol: string,
        viewAdditionalColumns: boolean,
        copyFn?: Function,
        downloadFn?: Function,
        toggleAdditionalColumnsFn?: Function,
        closeFn?: Function
      }
    ): HTMLElement
    /**
     * Label for the copy button on the table view toolbar.
     *
     * @since 8.1.0
     */
    let copyLabel: string
    /**
     * Label for the download button on the table view toolbar.
     *
     * @since 8.1.0
     */
    let downloadLabel: string
    /**
     * Gets the label of the additional columns button on the table view toolbar.
     *
     * @param viewingAdditionalColumns If this parameter is true, the label should indicate
     * 		additional table columns will be shown; if false, hidden.
     * @return The button label.
     *
     * @since 8.1.0
     */
    function getAdditionalColumnLabel(viewingAdditionalColumns: boolean): string
    /**
     * Obtains the names of all studies that have data in the chart's visible data segment.
     *
     * @param stx A reference to the chart engine that contains the chart studies.
     * @return The names of all studies that are in the visible portion of the chart.
     *
     * @since 8.1.0
     */
    function getStudyDataNames(stx: CIQ.ChartEngine): string[]
    /**
     * Obtains the symbols of all comparison series that have data in the chart's visible data
     * segment.
     *
     * @param stx A reference to the chart engine that contains the comparison
     * 		series.
     * @return The names (symbols) of all comparison series that are in the visible
     * 		portion of the chart.
     *
     * @since 8.1.0
     */
    function getSeriesDataNames(stx: CIQ.ChartEngine): string[]
  }
}
export function extendedHours(_export): void
export function fullScreen(_export): void
export function inactivityTimer(_export): void
export function rangeSlider(_export): void
export function shortcuts(_export): void
export function tableView(_export): void
export function tooltip(_export): void
export function animation(_export): void
export function continuousZoom(_export): void
export function outliers(_export): void
export function plotComplementer(_export): void