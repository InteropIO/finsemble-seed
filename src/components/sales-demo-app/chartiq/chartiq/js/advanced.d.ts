import { CIQ } from '../js/standard.js'
export { CIQ }

/**
 * CIQ namespace extension
 */
declare module '../js/chartiq.js' {
  export namespace CIQ.Drawing {
    /**
     * Ray drawing tool. A ray is defined by two points. It travels infinitely past the second point.
     *
     * It inherits its properties from CIQ.Drawing.line.
     */
    class ray {
      /**
       * Ray drawing tool. A ray is defined by two points. It travels infinitely past the second point.
       *
       * It inherits its properties from CIQ.Drawing.line.
       */
      constructor()
    }
    /**
     * Continuous line drawing tool. Creates a series of connected line segments, each one completed with a user click.
     *
     * It inherits its properties from CIQ.Drawing.segment.
     */
    class continuous {
      /**
       * Continuous line drawing tool. Creates a series of connected line segments, each one completed with a user click.
       *
       * It inherits its properties from CIQ.Drawing.segment.
       */
      constructor()
    }
    /**
     * Ellipse drawing tool.
     *
     * It inherits its properties from CIQ.Drawing.BaseTwoPoint.
     */
    class ellipse {
      /**
       * Ellipse drawing tool.
       *
       * It inherits its properties from CIQ.Drawing.BaseTwoPoint.
       */
      constructor()
      /**
       * Reconstruct an ellipse
       * @param  stx The chart object
       * @param  [obj] A drawing descriptor
       * @param [obj.col] The border color
       * @param [obj.fc] The fill color
       * @param [obj.pnl] The panel name
       * @param [obj.ptrn] Optional pattern for line "solid","dotted","dashed". Defaults to solid.
       * @param [obj.lw] Optional line width. Defaults to 1.
       * @param [obj.v0] Value (price) for the center point
       * @param [obj.v1] Value (price) for the outside point
       * @param [obj.d0] Date (string form) for the center point
       * @param [obj.d1] Date (string form) for the outside point
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
     * Channel drawing tool. Creates a channel within 2 parallel line segments.
     *
     * It inherits its properties from CIQ.Drawing.segment.
     * @version ChartIQ Advanced Package
     */
    class channel {
      /**
       * Channel drawing tool. Creates a channel within 2 parallel line segments.
       *
       * It inherits its properties from CIQ.Drawing.segment.
       * @version ChartIQ Advanced Package
       */
      constructor()
      /**
       * Reconstruct a channel
       * @param  stx The chart object
       * @param  [obj] A drawing descriptor
       * @param [obj.col] The line color
       * @param [obj.fc] The fill color
       * @param [obj.pnl] The panel name
       * @param [obj.ptrn] Pattern for line "solid","dotted","dashed". Defaults to solid.
       * @param [obj.lw] Line width. Defaults to 1.
       * @param [obj.v0] Value (price) for the first point
       * @param [obj.v1] Value (price) for the second point
       * @param [obj.v2] Value (price) for the second point of the opposing parallel channel line
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
          v2?: number,
          d0?: number,
          d1?: number,
          tzo0?: number,
          tzo1?: number
        }
      ): void
    }
    /**
     * Andrews' Pitchfork drawing tool. A Pitchfork is defined by three parallel rays.  The center ray is equidistant from the two outer rays.
     *
     * It inherits its properties from CIQ.Drawing.channel.
     * @version ChartIQ Advanced Package
     */
    class pitchfork {
      /**
       * Andrews' Pitchfork drawing tool. A Pitchfork is defined by three parallel rays.  The center ray is equidistant from the two outer rays.
       *
       * It inherits its properties from CIQ.Drawing.channel.
       * @version ChartIQ Advanced Package
       */
      constructor()
      /**
       * Reconstruct a pitchfork
       * @param  stx The chart object
       * @param  [obj] A drawing descriptor
       * @param [obj.col] The line color
       * @param [obj.pnl] The panel name
       * @param [obj.ptrn] Pattern for line "solid","dotted","dashed". Defaults to solid.
       * @param [obj.lw] Line width. Defaults to 1.
       * @param [obj.v0] Value (price) for the first point
       * @param [obj.v1] Value (price) for the second point
       * @param [obj.v2] Value (price) for the third point
       * @param [obj.d0] Date (string form) for the first point
       * @param [obj.d1] Date (string form) for the second point
       * @param [obj.d2] Date (string form) for the third point
       * @param [obj.tzo0] Offset of UTC from d0 in minutes
       * @param [obj.tzo1] Offset of UTC from d1 in minutes
       * @param [obj.tzo2] Offset of UTC from d2 in minutes
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
          v2?: number,
          d0?: number,
          d1?: number,
          d2?: number,
          tzo0?: number,
          tzo1?: number,
          tzo2?: number
        }
      ): void
    }
    /**
     * Gartley drawing tool. Creates a series of four connected line segments, each one completed with a user click.
     * Will adhere to Gartley requirements vis-a-vis fibonacci levels etc..
     *
     * It inherits its properties from CIQ.Drawing.continuous.
     * @version ChartIQ Advanced Package
     * @since 04-2015-15
     */
    class gartley {
      /**
       * Gartley drawing tool. Creates a series of four connected line segments, each one completed with a user click.
       * Will adhere to Gartley requirements vis-a-vis fibonacci levels etc..
       *
       * It inherits its properties from CIQ.Drawing.continuous.
       * @version ChartIQ Advanced Package
       * @since 04-2015-15
       */
      constructor()
      /**
       * Reconstruct a gartley
       * @param  stx The chart object
       * @param  [obj] A drawing descriptor
       * @param [obj.col] The line color
       * @param [obj.fc] The fill color
       * @param [obj.pnl] The panel name
       * @param [obj.ptrn] Pattern for line "solid","dotted","dashed". Defaults to solid.
       * @param [obj.lw] Line width. Defaults to 1.
       * @param [obj.v0] Value (price) for the first point
       * @param [obj.v1] Value (price) for the last point
       * @param [obj.d0] Date (string form) for the first point
       * @param [obj.d1] Date (string form) for the last point
       * @param [obj.tzo0] Offset of UTC from d0 in minutes
       * @param [obj.tzo1] Offset of UTC from d1 in minutes
       * @param [obj.pts] a serialized list of dates,offsets,values for the 3 intermediate points of the gartley (should be 9 items in list)
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
          tzo1?: number,
          pts?: number
        }
      ): void
    }
    /**
     * Freeform drawing tool. Set splineTension to a value from 0 to 1 (default .3). This is a dragToDraw function
     * and automatically disables the crosshairs while enabled.
     *
     * It inherits its properties from CIQ.Drawing.segment.
     * @version ChartIQ Advanced Package
     */
    class freeform {
      /**
       * Freeform drawing tool. Set splineTension to a value from 0 to 1 (default .3). This is a dragToDraw function
       * and automatically disables the crosshairs while enabled.
       *
       * It inherits its properties from CIQ.Drawing.segment.
       * @version ChartIQ Advanced Package
       */
      constructor()
      /**
       * Reconstruct a freeform drawing. It is not recommended to do this programmatically.
       * @param  stx The chart object
       * @param  [obj] A drawing descriptor
       * @param [obj.col] The line color
       * @param [obj.pnl] The panel name
       * @param [obj.ptrn] Pattern for line "solid","dotted","dashed". Defaults to solid.
       * @param [obj.lw] Line width. Defaults to 1.
       * @param [obj.cw] Candle width from original drawing
       * @param [obj.mlt] Y-axis multiplier from original drawing
       * @param [obj.v0] Value (price) for the first point
       * @param [obj.d0] Date (string form) for the first point
       * @param [obj.int] Interval from original drawing
       * @param [obj.pd] Periodicity from original drawing
       * @param [obj.tzo0] Offset of UTC from d0 in minutes
       * @param [obj.nodes] An array of nodes in form [x0a,x0b,y0a,y0b, x1a, x1b, y1a, y1b, ....]
       */
      public reconstruct(
        stx: CIQ.ChartEngine,
        obj?: {
          col?: string,
          pnl?: string,
          ptrn?: string,
          lw?: number,
          cw?: number,
          mlt?: number,
          v0?: number,
          d0?: number,
          int?: number,
          pd?: number,
          tzo0?: number,
          nodes?: any[]
        }
      ): void
    }
    /**
     * Callout drawing tool.  This is like an annotation except it draws a stem and offers a background color and line style.
     *
     * @since 2015-11-1
     * @version ChartIQ Advanced Package
     * @see CIQ.Drawing.annotation
     */
    class callout {
      /**
       * Callout drawing tool.  This is like an annotation except it draws a stem and offers a background color and line style.
       *
       * @since 2015-11-1
       * @version ChartIQ Advanced Package
       * @see CIQ.Drawing.annotation
       */
      constructor()
    }
    /**
     * Fibonacci drawing tool.
     *
     * It inherits its properties from CIQ.Drawing.BaseTwoPoint
     */
    class fibonacci {
      /**
       * Fibonacci drawing tool.
       *
       * It inherits its properties from CIQ.Drawing.BaseTwoPoint
       */
      constructor()
      /**
       * Levels to enable by default.
       * @since 5.2.0
       */
      public recommendedLevels
      /**
       * Set the default fib settings for the type of fib tool selected.  References CIQ.Drawing.fibonacci#recommendedLevels.
       * @param stx Chart object
       * @since 5.2.0
       */
      public initializeSettings(stx: CIQ.ChartEngine): void
      /**
       * Reconstruct a fibonacci
       * @param  stx The chart object
       * @param  [obj] A drawing descriptor
       * @param [obj.col] The border color
       * @param [obj.fc] The fill color
       * @param [obj.pnl] The panel name
       * @param [obj.v0] Value (price) for the first point
       * @param [obj.v1] Value (price) for the second point
       * @param [obj.v2] Value (price) for the third point (if used)
       * @param [obj.d0] Date (string form) for the first point
       * @param [obj.d1] Date (string form) for the second point
       * @param [obj.d2] Date (string form) for the third point (if used)
       * @param [obj.tzo0] Offset of UTC from d0 in minutes
       * @param [obj.tzo1] Offset of UTC from d1 in minutes
       * @param [obj.tzo2] Offset of UTC from d2 in minutes (if used)
       * @param [obj.parameters] Configuration parameters
       * @param [obj.parameters.trend] Describes the trend line
       * @param [obj.parameters.trend.color] The color for the trend line (Defaults to "auto")
       * @param [obj.parameters.trend.parameters] Line description object (pattern, opacity, lineWidth)
       * @param [obj.parameters.fibs] A fib description object for each fib (level, color, parameters, display)
       * @param [obj.parameters.extendLeft] True to extend the fib lines to the left of the screen. Defaults to false.
       * @param [obj.parameters.printLevels] True (default) to print text for each percentage level
       * @param [obj.parameters.printValues] True to print text for each price level
       */
      public reconstruct(
        stx: CIQ.ChartEngine,
        obj?: {
          col?: string,
          fc?: string,
          pnl?: string,
          v0?: number,
          v1?: number,
          v2?: number,
          d0?: number,
          d1?: number,
          d2?: number,
          tzo0?: number,
          tzo1?: number,
          tzo2?: number,
          parameters?: {
            trend?: {
              color?: string,
              parameters?: object
            },
            fibs?: any[],
            extendLeft?: boolean,
            printLevels?: boolean,
            printValues?: boolean
          }
        }
      ): void
    }
    /**
     * Retracement drawing tool.
     *
     * It inherits its properties from CIQ.Drawing.fibonacci
     */
    class retracement {
      /**
       * Retracement drawing tool.
       *
       * It inherits its properties from CIQ.Drawing.fibonacci
       */
      constructor()
    }
    /**
     * Fibonacci projection drawing tool.
     *
     * It inherits its properties from CIQ.Drawing.fibonacci
     * @version ChartIQ Advanced Package
     * @since 5.2.0
     */
    class fibprojection {
      /**
       * Fibonacci projection drawing tool.
       *
       * It inherits its properties from CIQ.Drawing.fibonacci
       * @version ChartIQ Advanced Package
       * @since 5.2.0
       */
      constructor()
    }
    /**
     * Fibonacci Arc drawing tool.
     *
     * It inherits its properties from CIQ.Drawing.fibonacci
     * @since 2015-11-1
     * @version ChartIQ Advanced Package
     */
    class fibarc {
      /**
       * Fibonacci Arc drawing tool.
       *
       * It inherits its properties from CIQ.Drawing.fibonacci
       * @since 2015-11-1
       * @version ChartIQ Advanced Package
       */
      constructor()
    }
    /**
     * Fibonacci Fan drawing tool.
     *
     * It inherits its properties from CIQ.Drawing.fibonacci
     * @since 2015-11-1
     * @version ChartIQ Advanced Package
     */
    class fibfan {
      /**
       * Fibonacci Fan drawing tool.
       *
       * It inherits its properties from CIQ.Drawing.fibonacci
       * @since 2015-11-1
       * @version ChartIQ Advanced Package
       */
      constructor()
    }
    /**
     * Fibonacci Time Zone drawing tool.
     *
     * It inherits its properties from CIQ.Drawing.fibonacci
     * @since 2015-11-1
     * @version ChartIQ Advanced Package
     */
    class fibtimezone {
      /**
       * Fibonacci Time Zone drawing tool.
       *
       * It inherits its properties from CIQ.Drawing.fibonacci
       * @since 2015-11-1
       * @version ChartIQ Advanced Package
       */
      constructor()
    }
    /**
     * Crossline drawing tool.
     *
     * It inherits its properties from CIQ.Drawing.horizontal
     * @since 2016-09-19
     * @version ChartIQ Advanced Package
     */
    class crossline {
      /**
       * Crossline drawing tool.
       *
       * It inherits its properties from CIQ.Drawing.horizontal
       * @since 2016-09-19
       * @version ChartIQ Advanced Package
       */
      constructor()
    }
    /**
     * Speed Resistance Arc drawing tool.
     *
     * It inherits its properties from CIQ.Drawing.segment
     * @since 2016-09-19
     * @version ChartIQ Advanced Package
     */
    class speedarc {
      /**
       * Speed Resistance Arc drawing tool.
       *
       * It inherits its properties from CIQ.Drawing.segment
       * @since 2016-09-19
       * @version ChartIQ Advanced Package
       */
      constructor()
    }
    /**
     * Speed Resistance Lines drawing tool.
     *
     * It inherits its properties from CIQ.Drawing.speedarc
     * @since 2016-09-19
     * @version ChartIQ Advanced Package
     */
    class speedline {
      /**
       * Speed Resistance Lines drawing tool.
       *
       * It inherits its properties from CIQ.Drawing.speedarc
       * @since 2016-09-19
       * @version ChartIQ Advanced Package
       */
      constructor()
    }
    /**
     * Gann Fan drawing tool.
     *
     * It inherits its properties from CIQ.Drawing.speedarc
     * @since 2016-09-19
     * @version ChartIQ Advanced Package
     */
    class gannfan {
      /**
       * Gann Fan drawing tool.
       *
       * It inherits its properties from CIQ.Drawing.speedarc
       * @since 2016-09-19
       * @version ChartIQ Advanced Package
       */
      constructor()
    }
    /**
     * Time Cycle drawing tool.
     *
     * It inherits its properties from CIQ.Drawing.speedarc
     * @since 2016-09-19
     * @version ChartIQ Advanced Package
     */
    class timecycle {
      /**
       * Time Cycle drawing tool.
       *
       * It inherits its properties from CIQ.Drawing.speedarc
       * @since 2016-09-19
       * @version ChartIQ Advanced Package
       */
      constructor()
    }
    /**
     * Regression Line drawing tool.
     *
     * It inherits its properties from CIQ.Drawing.segment
     * @since 2016-09-19
     * @version ChartIQ Advanced Package
     */
    class regression {
      /**
       * Regression Line drawing tool.
       *
       * It inherits its properties from CIQ.Drawing.segment
       * @since 2016-09-19
       * @version ChartIQ Advanced Package
       */
      constructor()
    }
    /**
     * trendline is an implementation of a CIQ.Drawing.segment drawing.
     *
     * Extends CIQ.Drawing.segment and automatically renders a CIQ.Drawing.callout
     * containing trend information.
     * @since 5.1.2
     * @version ChartIQ Advanced Package
     */
    class trendline {
      /**
       * trendline is an implementation of a CIQ.Drawing.segment drawing.
       *
       * Extends CIQ.Drawing.segment and automatically renders a CIQ.Drawing.callout
       * containing trend information.
       * @since 5.1.2
       * @version ChartIQ Advanced Package
       */
      constructor()
    }
    /**
     * Average Line drawing tool.
     *
     * It inherits its properties from CIQ.Drawing.regression
     * @since 4.0.0
     * @version ChartIQ Advanced Package
     */
    class average {
      /**
       * Average Line drawing tool.
       *
       * It inherits its properties from CIQ.Drawing.regression
       * @since 4.0.0
       * @version ChartIQ Advanced Package
       */
      constructor()
    }
    /**
     * Quadrant Lines drawing tool.
     *
     * It inherits its properties from CIQ.Drawing.speedarc
     * @since 2016-09-19
     * @version ChartIQ Advanced Package
     */
    class quadrant {
      /**
       * Quadrant Lines drawing tool.
       *
       * It inherits its properties from CIQ.Drawing.speedarc
       * @since 2016-09-19
       * @version ChartIQ Advanced Package
       */
      constructor()
    }
    /**
     * Tirone Levels drawing tool.
     *
     * It inherits its properties from CIQ.Drawing.quadrant
     * @since 2016-09-19
     * @version ChartIQ Advanced Package
     */
    class tirone {
      /**
       * Tirone Levels drawing tool.
       *
       * It inherits its properties from CIQ.Drawing.quadrant
       * @since 2016-09-19
       * @version ChartIQ Advanced Package
       */
      constructor()
    }
    /**
     * Creates the Elliott Wave drawing tool.
     *
     * 		a point and the (x, y) annotation origin point.
     * 		The length of the wave is determined by the length of this array. Always starts with 0.
     * 		x-coordinate origin of the annotaion.
     * 		y-coordinate origin of the annotation.
     * 		drag-to-draw. Elliott waves are multiple-point drawings; and so, are incompatible with
     * 		dragging to draw points. See CIQ.Drawing#dragToDraw.
     * 		wave annotations. By default `undefined`.
     * 		See CIQ.Drawing.elliottwave#calculateRadius.
     *
     * @since 7.4.0
     */
    class elliottwave {
      /**
       * Creates the Elliott Wave drawing tool.
       *
       * 		a point and the (x, y) annotation origin point.
       * 		The length of the wave is determined by the length of this array. Always starts with 0.
       * 		x-coordinate origin of the annotaion.
       * 		y-coordinate origin of the annotation.
       * 		drag-to-draw. Elliott waves are multiple-point drawings; and so, are incompatible with
       * 		dragging to draw points. See CIQ.Drawing#dragToDraw.
       * 		wave annotations. By default `undefined`.
       * 		See CIQ.Drawing.elliottwave#calculateRadius.
       *
       * @since 7.4.0
       */
      constructor()
      /**
       * Calculates the width of the text enclosed in the annotation decorations. Iterates through the
       * annotation points of the wave, measures the text of each annotation, and sets
       * CIQ.Drawing.elliottwave.enclosedRadius to the width of the largest measurement.
       *
       * If you would like to customize the radius, override this function with another that sets the
       * value of `enclosedRadius`.
       *
       * @param context The rendering context, which does the calculations.
       * @since 7.4.0
       */
      public calculateRadius(context: CanvasRenderingContext2D): void
      /**
       * Ensures that each successive data point is positioned correctly in the Elliott Wave progression.
       * Called by CIQ.ChartEngine#drawingClick.
       *
       * @param tick The tick where the wave data point is to be positioned.
       * @param value The value (price) indicated by the tick where the wave data point is to be positioned.
       * @param pt Represents whether the previous line was a gain or loss wave. If equal to 1, represents
       * 		the first segment of the wave, which always results in a return value of true.
       * @return Indicates whether or not the current wave data point has been positioned correctly.
       * @since 7.4.0
       */
      public check(tick: Number, value: Number, pt: Number): Boolean
      /**
       * Renders the movement when the user moves the drawing.
       *
       * @param context The canvas context in which to render the moving drawing.
       * @param tick The tick to which the drawing is being moved.
       * @param value The value to which the drawing is being moved.
       * @since 7.4.0
       */
      public move(
        context: CanvasRenderingContext2D,
        tick: Number,
        value: Number
      ): void
      /**
       * Resets the points of the drawing when the periodicity changes or the underlying ticks change
       * (either from pagination or from moving the points).
       *
       * @since 7.4.0
       */
      public adjust(): void
      /**
       * Responds to click events on the drawing.
       *
       * @param context Canvas context in which to render the drawing.
       * @param tick The tick where the click occurred.
       * @param value The value where the click occurred.
       * @since 7.4.0
       */
      public click(
        context: CanvasRenderingContext2D,
        tick: Number,
        value: Number
      ): void
      /**
       * Renders the wave on the chart.
       *
       * @param context The context in which the drawing is rendered.
       * @since 7.4.0
       */
      public render(context: CanvasRenderingContext2D): void
      /**
       * Repositions the drawing on drag (user moves an individual point of the drawing) or move
       * (user moves the whole drawing) interactions.
       *
       * @param context The canvas context on which to render the drawing.
       * @param repositioner The object containing data on how to reposition the drawing.
       * @param tick The tick to which the drawing is repositioned.
       * @param value The value to which the drawing is repositioned.
       * @since 7.4.0
       */
      public reposition(
        context: CanvasRenderingContext2D,
        repositioner: Object,
        tick: Number,
        value: Number
      ): void
      /**
       * Detects when the wave drawing has been intersected at either a point or the segments of the wave.
       *
       * @param tick The tick under the mouse cursor.
       * @param value The value under the mouse cursor.
       * @param box A rectangular area around the mouse cursor.
       * @since 7.4.0
       */
      public intersected(tick: Number, value: Number, box: Object): void
      /**
       * Displays the following:
       * - The value at the last point in the drawing or at the drawing cursor position minus the value at the original wave point
       * - The percentage change: (value at the last point or drawing cursor position - the value at the original wave point) / value at the original wave point
       * - Number of data points included in the wave drawing
       *
       * @since 7.4.0
       */
      public measure(): void
      /**
       * Initializes the drawing. Assigns the `waveParameters` object of
       * CIQ.ChartEngine#currentVectorParameters to the current drawing instance.
       *
       * @param stx A reference to the chart engine.
       * @param panel The panel that contains the drawing.
       * @since 7.4.0
       */
      public construct(stx: CIQ.ChartEngine, panel: CIQ.ChartEngine.Panel): void
      /**
       * Serializes the drawing to an object that can be restored with
       * CIQ.Drawing.elliottwave#reconstruct. To store a drawing, convert the object returned
       * by this function to a JSON string.
       *
       * @return An object that contains the serialized state of the drawing.
       * @since 7.4.0
       */
      public serialize(): object
      /**
       * Reconstructs the drawing from an object returned from CIQ.Drawing.elliottwave#serialize.
       *
       * @param stx A reference to the chart engine.
       * @param obj The object that contains the serialized drawing.
       * @since 7.4.0
       */
      public reconstruct(stx: CIQ.ChartEngine, obj: object): void
    }
  }

  export namespace CIQ.Marker {
    /**
     * Creates high performance canvas nodes that can be used with a CIQ.Marker.
     *
     * Use this class if you need to add hundreds or thousands of markers to a chart. When a
     * marker is created, this class creates a node from the built-in template but does not attach
     * the node to the DOM until you hover over the canvas drawing. Once you intersect the drawing,
     * the node is appended and you can interact with it like other markers.
     *
     * The canvas draws the marker based on the classes that you append to the template (which
     * come from `params.type` and `params.category`) being added to `stx-marker` class.
     * See CIQ.ChartEngine#calculateMarkerStyles for more information.
     *
     * This class takes the same params as CIQ.Marker.Simple so that the appended DOM
     * marker works the same. This means that you can reuse all of the default styles you've
     * created for `CIQ.Marker.Simple` with `CIQ.Marker.Performance`. **Note:** If you do not pass
     * in either a `headline` or a `story` or both, your marker will not create a pop-up display
     * when the marker is selected.
     *
     * See the {@tutorial Markers} tutorial for additional implementation instructions.
     *
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
     *
     * Other custom categories require a corresponding CSS entry. See example.
     *
     * 		the category in the marker.
     * 		marker displays an empty DOM node when clicked.
     * 		set by `params.category`.
     * 		point and not include the stem.
     * 		the left when possible.
     *
     * @since
     * - 7.1.0
     * - 7.2.0 Markers without <u>both</u> a `headline` and `story` are not interactive.
     * 		You must provide either or both properties for a node (which is the marker pop-up
     * 		display) to be appended to the DOM. Performance markers now can be positioned anywhere
     * 		that a DOM marker can be positioned (above, below, or on a candle; at a value; or at
     * 		the top or bottom of a chart).
     * - 8.0.0 Added `params.infoOnLeft`, `params.infoOffset`, and `params.invert`.
     *
     *
     * @example
     * <caption>Required CSS entry for a custom category ("trade"), not included in the default
     * CSS styles.</caption>
     *
     * .stx-marker.trade .stx-visual {
     *     background: #C950d7;
     *     width: 5px;
     *     height: 5px;
     * }
     *
     * // Corresponding code:
     *
     * new CIQ.Marker({
     *     stx: stxx,
     *     label: "trade",
     *     xPositioner: "date",
     *     x: OHLCData.DT,
     *     node: new CIQ.Marker.Performance({
     *         type: "circle",
     *         category: "trade",
     *         displayCategory: false,
     *         displayStem: false,
     *         headline: "Executed at $" + OHLCData.Close,
     *         story: "Like all ChartIQ markers, the object itself is managed by the chart."
     *     })
     * });
     */
    class Performance {
      /**
       * Creates high performance canvas nodes that can be used with a CIQ.Marker.
       *
       * Use this class if you need to add hundreds or thousands of markers to a chart. When a
       * marker is created, this class creates a node from the built-in template but does not attach
       * the node to the DOM until you hover over the canvas drawing. Once you intersect the drawing,
       * the node is appended and you can interact with it like other markers.
       *
       * The canvas draws the marker based on the classes that you append to the template (which
       * come from `params.type` and `params.category`) being added to `stx-marker` class.
       * See CIQ.ChartEngine#calculateMarkerStyles for more information.
       *
       * This class takes the same params as CIQ.Marker.Simple so that the appended DOM
       * marker works the same. This means that you can reuse all of the default styles you've
       * created for `CIQ.Marker.Simple` with `CIQ.Marker.Performance`. **Note:** If you do not pass
       * in either a `headline` or a `story` or both, your marker will not create a pop-up display
       * when the marker is selected.
       *
       * See the {@tutorial Markers} tutorial for additional implementation instructions.
       *
       * @param params Parameters to describe the marker.
       * @param params.type The marker type to be drawn.
       * Available options are:
       * - "circle"
       * - "square"
       * - "callout"
       * @param [params.headline] The headline text to pop up when clicked.
       * @param [params.category] The category class to add to your marker.
       * Available options are:
       * - "news"
       * - "earningsUp"
       * - "earningsDown"
       * - "dividend"
       * - "filing"
       * - "split"
       *
       * Other custom categories require a corresponding CSS entry. See example.
       *
       * @param [params.displayCategory=true] Set to false to not draw the first letter of
       * 		the category in the marker.
       * @param [params.story] The story to pop up when clicked. If left undefined, the
       * 		marker displays an empty DOM node when clicked.
       * @param [params.color] Background color to make your marker. Overrides any style
       * 		set by `params.category`.
       * @param [params.displayStem=true] Set to false to draw the marker at a specific
       * 		point and not include the stem.
       * @param [params.invert=false] Set to true to invert the stem and point downward.
       * @param [params.infoOnLeft] If true, the information pop-up box is positioned on
       * 		the left when possible.
       * @param [params.infoOffset] Distance to offset the information pop-up box.
       *
       * @since
       * - 7.1.0
       * - 7.2.0 Markers without <u>both</u> a `headline` and `story` are not interactive.
       * 		You must provide either or both properties for a node (which is the marker pop-up
       * 		display) to be appended to the DOM. Performance markers now can be positioned anywhere
       * 		that a DOM marker can be positioned (above, below, or on a candle; at a value; or at
       * 		the top or bottom of a chart).
       * - 8.0.0 Added `params.infoOnLeft`, `params.infoOffset`, and `params.invert`.
       *
       *
       * @example
       * <caption>Required CSS entry for a custom category ("trade"), not included in the default
       * CSS styles.</caption>
       *
       * .stx-marker.trade .stx-visual {
       *     background: #C950d7;
       *     width: 5px;
       *     height: 5px;
       * }
       *
       * // Corresponding code:
       *
       * new CIQ.Marker({
       *     stx: stxx,
       *     label: "trade",
       *     xPositioner: "date",
       *     x: OHLCData.DT,
       *     node: new CIQ.Marker.Performance({
       *         type: "circle",
       *         category: "trade",
       *         displayCategory: false,
       *         displayStem: false,
       *         headline: "Executed at $" + OHLCData.Close,
       *         story: "Like all ChartIQ markers, the object itself is managed by the chart."
       *     })
       * });
       */
      constructor(
        params: {
          type: string,
          headline?: string,
          category?: string,
          displayCategory?: boolean,
          story?: string,
          color?: string,
          displayStem?: boolean,
          invert?: boolean,
          infoOnLeft?: boolean,
          infoOffset?: number
        }
      )
      /**
       * Draws a canvas marker on the chart and positions the pop-up for the marker if necessary.
       *
       * @param marker The marker to be drawn.
       * @since 7.2.0
       */
      public drawMarker(marker: CIQ.Marker): void
      /**
       * Calculates the initial y-axis positioning when drawing a canvas marker.
       *
       * @param params
       * @param params.marker The marker for which the y-axis position is calculated.
       * @param params.panel Panel on which the marker appears.
       * @param params.tick The tick of the quote in the chart's data set.
       * @param params.height Total height of the marker as defined by marker height plus
       * 		stem height.
       * @param params.half Half the height of the marker as defined by the marker CSS
       * 		style.
       * @param params.offset Height of the marker stem offset as defined by the marker
       * 		stem CSS style height plus margin bottom.
       * @param params.inverted Indicates whether the marker stem is inverted; that is,
       * 		pointing downward.
       * @return Initial y-coordinate positioning for drawing the canvas marker.
       *
       * @since
       * - 7.2.0
       * - 8.0.0 Added `params.inverted`.
       */
      public calculateYPosition(
        params: {
          marker: CIQ.Marker,
          panel: CIQ.ChartEngine.Panel,
          tick: number,
          height: number,
          half: number,
          offset: number,
          inverted: boolean
        }
      ): number
      /**
       * Click event handler for performance markers when they are clicked in the canvas.
       * Adds or removes the marker's pop-up expand `div` to the chart, depending on whether it has already been activated.
       *
       * @param params Configuration parameters.
       * @param params.cx Client x-coordinate of click.
       * @param params.cy Client y-coordinate of click.
       * @param params.marker Marker that was clicked.
       * @param params.panel Panel where the click occurred.
       * @since 7.2.0
       */
      public click(
        params: {
          cx: number,
          cy: number,
          marker: CIQ.Marker,
          panel: CIQ.ChartEngine.Panel
        }
      ): void
    }
  }

  export namespace CIQ.Renderer {
    /**
     * Creates a Bars renderer, a derivation of the OHLC renderer.
     *
     * Note: by default the renderer will display bars as underlays. As such, they will appear below any other studies or drawings.
     *
     * The Bars renderer is used to create the following drawing types: bar, colored bar.
     *
     * See CIQ.Renderer#construct for parameters required by all renderers
     *
     * Common valid parameters for use by attachSeries.:
     * `border_color` - Color to use for uncolored bars.
     * `border_color_up` - Color to use for up bars.
     * `border_color_down` - Color to use for down bars.
     * `border_color_even` - Color to use for even bars.
     *
     * @since 5.1.1, creates only Bar type charts
     * @example
     // Colored bar chart
     var renderer=stxx.setSeriesRenderer(new CIQ.Renderer.Bars({params:{name:"bars", colored:true}}));
     */
    class Bars {
      /**
       * Creates a Bars renderer, a derivation of the OHLC renderer.
       *
       * Note: by default the renderer will display bars as underlays. As such, they will appear below any other studies or drawings.
       *
       * The Bars renderer is used to create the following drawing types: bar, colored bar.
       *
       * See CIQ.Renderer#construct for parameters required by all renderers
       * @param config Config for renderer
       * @param  [config.params] Parameters to control the renderer itself
       * @param  [config.params.useChartLegend=false] Set to true to use the built in canvas legend renderer. See CIQ.ChartEngine.Chart#legendRenderer;
       * @param  [config.params.style] Style name to use in lieu of defaults for the type
       * @param  [config.params.colored] For bar or hlc, specifies using a condition or colorFunction to determine color
       * @param  [config.params.colorBasis="close"] Will compute color based on whether current close is higher or lower than previous close.  Set to "open" to compute this off the open rather than yesterday's close.
       * @param  [config.params.colorFunction] Override function (or string) used to determine color of bar.  May be an actual function or a string name of the registered function (see CIQ.Renderer.registerColorFunction)
       *
       * Common valid parameters for use by attachSeries.:
       * `border_color` - Color to use for uncolored bars.
       * `border_color_up` - Color to use for up bars.
       * `border_color_down` - Color to use for down bars.
       * `border_color_even` - Color to use for even bars.
       *
       * @since 5.1.1, creates only Bar type charts
       * @example
       // Colored bar chart
       var renderer=stxx.setSeriesRenderer(new CIQ.Renderer.Bars({params:{name:"bars", colored:true}}));
       */
      constructor(
        config: {
          params?: {
            useChartLegend?: boolean,
            style?: string,
            colored?: boolean,
            colorBasis?: string,
            colorFunction?: Function
          }
        }
      )
    }
    /**
     * Creates a HLC renderer, a derivation of the Bars renderer.
     *
     * Note: by default the renderer will display bars as underlays. As such, they will appear below any other studies or drawings.
     *
     * The HLC renderer is used to create the following drawing types: hlc, colored hlc.
     *
     * See CIQ.Renderer#construct for parameters required by all renderers
     *
     * Common valid parameters for use by attachSeries.:
     * `border_color` - Color to use for uncolored bars.
     * `border_color_up` - Color to use for up bars.
     * `border_color_down` - Color to use for down bars.
     * `border_color_even` - Color to use for even bars.
     *
     * @since 5.1.1
     * @example
     // Colored hlc chart
     var renderer=stxx.setSeriesRenderer(new CIQ.Renderer.HLC({params:{name:"hlc", colored:true}}));
     */
    class HLC {
      /**
       * Creates a HLC renderer, a derivation of the Bars renderer.
       *
       * Note: by default the renderer will display bars as underlays. As such, they will appear below any other studies or drawings.
       *
       * The HLC renderer is used to create the following drawing types: hlc, colored hlc.
       *
       * See CIQ.Renderer#construct for parameters required by all renderers
       * @param config Config for renderer
       * @param  [config.params] Parameters to control the renderer itself
       * @param  [config.params.useChartLegend=false] Set to true to use the built in canvas legend renderer. See CIQ.ChartEngine.Chart#legendRenderer;
       * @param  [config.params.style] Style name to use in lieu of defaults for the type
       * @param  [config.params.colored] For bar or hlc, specifies using a condition or colorFunction to determine color
       * @param  [config.params.colorBasis="close"] Will compute color based on whether current close is higher or lower than previous close.  Set to "open" to compute this off the open rather than yesterday's close.
       * @param  [config.params.colorFunction] Override function (or string) used to determine color of bar.  May be an actual function or a string name of the registered function (see CIQ.Renderer.registerColorFunction)
       *
       * Common valid parameters for use by attachSeries.:
       * `border_color` - Color to use for uncolored bars.
       * `border_color_up` - Color to use for up bars.
       * `border_color_down` - Color to use for down bars.
       * `border_color_even` - Color to use for even bars.
       *
       * @since 5.1.1
       * @example
       // Colored hlc chart
       var renderer=stxx.setSeriesRenderer(new CIQ.Renderer.HLC({params:{name:"hlc", colored:true}}));
       */
      constructor(
        config: {
          params?: {
            useChartLegend?: boolean,
            style?: string,
            colored?: boolean,
            colorBasis?: string,
            colorFunction?: Function
          }
        }
      )
    }
    /**
     * Creates a Shading renderer
     * This is just like Lines renderer except it will allow shading between lines connected by a common y axis.
     *
     * Notes:
     * - By default the renderer will display lines as underlays. As such, they will appear below the chart ticks and any other studies or drawings.
     * - Series not linked to an explicit y axis through a custom renderer must have 'shareYAxis' set to true to use this feature.
     *
     * See CIQ.Renderer#construct for parameters required by all renderers
     *
     * Example:
     * <iframe width="100%" height="500" scrolling="no" seamless="seamless" align="top" style="float:top" src="https://jsfiddle.net/chartiq/k61mzpce/embedded/result,js,html/" allowfullscreen="allowfullscreen" frameborder="1"></iframe>
     *
     * Common valid parameters for use by attachSeries.:
     * `color` - Specify the color for the line and shading in rgba, hex or by name.
     * `pattern` - Specify the pattern as an array. For instance [5,5] would be five pixels and then five empty pixels.
     * `width` - Specify the width of the line.
     *
     * @version ChartIQ Advanced Package
     */
    class Shading {
      /**
       * Creates a Shading renderer
       * This is just like Lines renderer except it will allow shading between lines connected by a common y axis.
       *
       * Notes:
       * - By default the renderer will display lines as underlays. As such, they will appear below the chart ticks and any other studies or drawings.
       * - Series not linked to an explicit y axis through a custom renderer must have 'shareYAxis' set to true to use this feature.
       *
       * See CIQ.Renderer#construct for parameters required by all renderers
       *
       * Example:
       * <iframe width="100%" height="500" scrolling="no" seamless="seamless" align="top" style="float:top" src="https://jsfiddle.net/chartiq/k61mzpce/embedded/result,js,html/" allowfullscreen="allowfullscreen" frameborder="1"></iframe>
       * @param config Config for renderer
       * @param  [config.params] Parameters to control the renderer itself
       * @param  [config.params.width] Width of the rendered line
       *
       * Common valid parameters for use by attachSeries.:
       * `color` - Specify the color for the line and shading in rgba, hex or by name.
       * `pattern` - Specify the pattern as an array. For instance [5,5] would be five pixels and then five empty pixels.
       * `width` - Specify the width of the line.
       *
       * @version ChartIQ Advanced Package
       */
      constructor(config: {params?: {width?: number}})
      /**
       * Sets the shading scheme of the renderer. Lines must be connected by a common y axis.
       *
       * Example:
       * <iframe width="100%" height="500" scrolling="no" seamless="seamless" align="top" style="float:top" src="https://jsfiddle.net/chartiq/k61mzpce/embedded/result,js,html/" allowfullscreen="allowfullscreen" frameborder="1"></iframe>
       *
       * @param  scheme single object or array of objects denoting shading.
       * @param  [scheme.primary] left series for comparison; if omitted, use chart.dataSegment[i].Close.
       * @param  [scheme.secondary] right series for comparison; if omitted, use first series in the seriesMap.
       * @param  [scheme.color] color in hex, rgb, rgba, etc to shade between primary and secondary.
       * @param  [scheme.greater] color in hex, rgb, rgba, etc to shade between primary and secondary if primary is greater in price than secondary.
       * @param  [scheme.lesser] color in hex, rgb, rgba, etc to shade between primary and secondary if primary is lesser in price than secondary.
       * Notes:
       * - If scheme.greater _and_ scheme.lesser are omitted, scheme.color is used.
       * - If scheme.greater _or_ scheme.lesser are omitted, stx.containerColor is used for the missing color.
       * - At a bare minimum, scheme.color is required.  It is not required if scheme.greater and scheme.lesser are supplied.
       * - If scheme.primary is omitted, the shading will only occur if the series share the same axis as the chart.dataSegment[i].Close.
       * - If shading cannot occur for any reason, series lines will still be drawn.
       * @example
       * renderer.setShading([
       * 	{primary:'ibm', secondary:'ge', greater:'green', lesser:'red'}, // switches shading based on crossover of values
       * 	{primary:'aapl', secondary:'ge', greater:'orange'}, // same as above, but lesser color not specified, so shade that area the container color.
       * 	{primary:'t', secondary:'intc', color:'blue'}, // color always blue between them regardless of which is higher or lower
       * 	{secondary:'t', color:'yellow'}, // compares masterData with the named series
       * 	{color:'yellow'} // automatically shades between master and the first series
       * ]);
       * @version ChartIQ Advanced Package
       */
      public setShading(
        scheme: {
          primary?: string,
          secondary?: string,
          color?: string,
          greater?: string,
          lesser?: string
        }
      ): void
    }
    /**
     * Creates a multi-part histogram renderer where bars can be stacked one on top of the other, clustered next to each other, or overlaid over each other.
     *
     * See CIQ.Renderer#construct for parameters required by all renderers.
     *
     * See CIQ.ChartEngine#drawHistogram  for more details.
     *
     *
     * Common valid parameters for use by attachSeries.:
     * `fill_color_up` - Color to use for up histogram bars.
     * `fill_color_down` - Color to use for down histogram bars.
     * `border_color_up` - Color to use for the border of up histogram bars.
     * `border_color_down` - Color to use for the order of down histogram bars.
     *
     * 	@example
     // configure the histogram display
     var params={
     name:				"Sentiment Data",
     subtype:			"stacked",
     heightPercentage:	.7,	 // how high to go. 1 = 100%
     widthFactor:		.8	 // to control space between bars. 1 = no space in between
     };
     //legend creation callback (optional)
     function histogramLegend(colors){
     stxx.chart.legendRenderer(stxx,{legendColorMap:colors, coordinates:{x:260, y:stxx.panels["chart"].yAxis.top+30}, noBase:true});
     }
     // set the renderer
     var histRenderer=stxx.setSeriesRenderer(new CIQ.Renderer.Histogram({params: params, callback: histogramLegend}));
     // add data and attach.
     stxx.addSeries("^NIOALL", {display:"Symbol 1"}, function() {histRenderer.attachSeries("^NIOALL","#6B9CF7").ready();});
     stxx.addSeries("^NIOAFN", {display:"Symbol 2"}, function() {histRenderer.attachSeries("^NIOAFN","#95B7F6").ready();});
     stxx.addSeries("^NIOAMD", {display:"Symbol 3"}, function() {histRenderer.attachSeries("^NIOAMD","#B9D0F5").ready();});
     *
     * @example
     // this is an example on how completely remove a renderer and all associated data.
     // This should only be necessary if you are also removing the chart itself
     // Remove all series from the renderer including series data from the masterData
     renderer.removeAllSeries(true);
     // detach the series renderer from the chart.
     stxx.removeSeriesRenderer(renderer);
     // delete the renderer itself.
     delete renderer;
     * @example <caption>Set a baseline value, allowing negative bars.</caption>
     * const yax = new CIQ.ChartEngine.YAxis({
     *     baseline: 0
     * });
     * const rndr = stxx.setSeriesRenderer(
     *     new CIQ.Renderer.Histogram({
     *         params: {
     *             // Can be an overlaid or clustered histogram.
     *             subtype: 'clustered',
     *             yAxis: yax
     *         }
     *     })
     * );
     *
     * @example <caption>Render a horizontal line at the baseline value.</caption>
     * const yax = new CIQ.ChartEngine.YAxis({
     *     baseline: {
     *         value: 0,
     *         // Must provide color to render the horizontal line,
     *         // and can optionally provide pattern, lineWidth, and opacity.
     *         color: "red",
     *         pattern: "dotted",
     *         lineWidth: 2,
     *         opacity: 1
     *     }
     * });
     *
     * @version ChartIQ Advanced Package
     * @since 7.5.0 Added the ability to draw negative bars when `yAxis.baseline` is set to zero
     * 		or some other value (see examples).
     */
    class Histogram {
      /**
       * Creates a multi-part histogram renderer where bars can be stacked one on top of the other, clustered next to each other, or overlaid over each other.
       *
       * See CIQ.Renderer#construct for parameters required by all renderers.
       *
       * See CIQ.ChartEngine#drawHistogram  for more details.
       *
       * @param config Config for renderer
       * @param  [config.params] Parameters to control the renderer itself
       * @param  [config.params.defaultBorders =false] Whether to draw a border for each bar as a whole.  Can be overridden by a border set for a series.
       * @param  [config.params.widthFactor =.8] Width of each bar as a percentage of the candleWidth. Valid values are 0.00-1.00.
       * @param  [config.params.heightPercentage =.7] The amount of vertical space to use, valid values are 0.00-1.00.
       * @param  [config.params.bindToYAxis =true] Set to true to bind the rendering to the y-axis and to draw it. Automatically set if params.yAxis is present.
       * @param  [config.params.subtype="overlaid"] Subtype of rendering "stacked", "clustered", "overlaid"
       *
       * Common valid parameters for use by attachSeries.:
       * `fill_color_up` - Color to use for up histogram bars.
       * `fill_color_down` - Color to use for down histogram bars.
       * `border_color_up` - Color to use for the border of up histogram bars.
       * `border_color_down` - Color to use for the order of down histogram bars.
       *
       * 	@example
       // configure the histogram display
       var params={
       name:				"Sentiment Data",
       subtype:			"stacked",
       heightPercentage:	.7,	 // how high to go. 1 = 100%
       widthFactor:		.8	 // to control space between bars. 1 = no space in between
       };
       //legend creation callback (optional)
       function histogramLegend(colors){
       stxx.chart.legendRenderer(stxx,{legendColorMap:colors, coordinates:{x:260, y:stxx.panels["chart"].yAxis.top+30}, noBase:true});
       }
       // set the renderer
       var histRenderer=stxx.setSeriesRenderer(new CIQ.Renderer.Histogram({params: params, callback: histogramLegend}));
       // add data and attach.
       stxx.addSeries("^NIOALL", {display:"Symbol 1"}, function() {histRenderer.attachSeries("^NIOALL","#6B9CF7").ready();});
       stxx.addSeries("^NIOAFN", {display:"Symbol 2"}, function() {histRenderer.attachSeries("^NIOAFN","#95B7F6").ready();});
       stxx.addSeries("^NIOAMD", {display:"Symbol 3"}, function() {histRenderer.attachSeries("^NIOAMD","#B9D0F5").ready();});
       *
       * @example
       // this is an example on how completely remove a renderer and all associated data.
       // This should only be necessary if you are also removing the chart itself
       // Remove all series from the renderer including series data from the masterData
       renderer.removeAllSeries(true);
       // detach the series renderer from the chart.
       stxx.removeSeriesRenderer(renderer);
       // delete the renderer itself.
       delete renderer;
       * @example <caption>Set a baseline value, allowing negative bars.</caption>
       * const yax = new CIQ.ChartEngine.YAxis({
       *     baseline: 0
       * });
       * const rndr = stxx.setSeriesRenderer(
       *     new CIQ.Renderer.Histogram({
       *         params: {
       *             // Can be an overlaid or clustered histogram.
       *             subtype: 'clustered',
       *             yAxis: yax
       *         }
       *     })
       * );
       *
       * @example <caption>Render a horizontal line at the baseline value.</caption>
       * const yax = new CIQ.ChartEngine.YAxis({
       *     baseline: {
       *         value: 0,
       *         // Must provide color to render the horizontal line,
       *         // and can optionally provide pattern, lineWidth, and opacity.
       *         color: "red",
       *         pattern: "dotted",
       *         lineWidth: 2,
       *         opacity: 1
       *     }
       * });
       *
       * @version ChartIQ Advanced Package
       * @since 7.5.0 Added the ability to draw negative bars when `yAxis.baseline` is set to zero
       * 		or some other value (see examples).
       */
      constructor(
        config: {
          params?: {
            defaultBorders?: boolean,
            widthFactor?: number,
            heightPercentage?: number,
            bindToYAxis?: boolean,
            subtype?: string
          }
        }
      )
    }
    /**
     * Creates a Heatmap renderer.
     *
     * See CIQ.Renderer#construct for parameters required by all renderers.
     *
     * Each attached series will represent a stream of colors for the heatmap.
     *
     * **Note special data formatting when using [addSeries]CIQ.ChartEngine#addSeries, where the custom field that will be used for the stream of datapoints (`Bids` in our example), is an array of values.**
     *
     * Visual Reference - single color series:
     * ![img-histogram-single-color](img-histogram-single-color.png "img-histogram-single-color")
     *
     * For advanced heatmap implementations where all the data is received already with a color for each datapoint, use an injection that directly calls CIQ.ChartEngine#drawHeatmap as outlined in this example:
     * <iframe width="100%" height="500" scrolling="no" seamless="seamless" align="top" style="float:top" src="https://jsfiddle.net/chartiq/s27v0pt8/embedded/result,js,html/" allowfullscreen="allowfullscreen" frameborder="1"></iframe>
     *
     * @version ChartIQ Advanced Package
     * @example
     *  // note special data formatting, where the custom field name that will be used for the stream of datapoints, is an array of values.
     *  var renderer=stxx.setSeriesRenderer(new CIQ.Renderer.Heatmap());
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
     */
    class Heatmap {
      /**
       * Creates a Heatmap renderer.
       *
       * See CIQ.Renderer#construct for parameters required by all renderers.
       *
       * Each attached series will represent a stream of colors for the heatmap.
       *
       * **Note special data formatting when using [addSeries]CIQ.ChartEngine#addSeries, where the custom field that will be used for the stream of datapoints (`Bids` in our example), is an array of values.**
       *
       * Visual Reference - single color series:
       * ![img-histogram-single-color](img-histogram-single-color.png "img-histogram-single-color")
       *
       * For advanced heatmap implementations where all the data is received already with a color for each datapoint, use an injection that directly calls CIQ.ChartEngine#drawHeatmap as outlined in this example:
       * <iframe width="100%" height="500" scrolling="no" seamless="seamless" align="top" style="float:top" src="https://jsfiddle.net/chartiq/s27v0pt8/embedded/result,js,html/" allowfullscreen="allowfullscreen" frameborder="1"></iframe>
       *
       * @param config Config for renderer
       * @param  [config.params] Parameters to control the renderer itself
       * @param  [config.params.widthFactor=1] Width of each bar as a percentage of the candleWidth. Valid values are 0.00-1.00.
       * @param  [config.params.height] The amount of vertical space to use, in price units. For example, 2=>2 unit increments on yaxis.
       * @version ChartIQ Advanced Package
       * @example
       *  // note special data formatting, where the custom field name that will be used for the stream of datapoints, is an array of values.
       *  var renderer=stxx.setSeriesRenderer(new CIQ.Renderer.Heatmap());
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
       */
      constructor(config: {params?: {widthFactor?: number, height?: number}})
    }
    /**
     * Creates a Scatter plot renderer
     * See CIQ.Renderer#construct for parameters required by all renderers
     * @version ChartIQ Advanced Package
     */
    class Scatter {
      /**
       * Creates a Scatter plot renderer
       * See CIQ.Renderer#construct for parameters required by all renderers
       * @param config Config for renderer
       * @param  [config.params] Parameters to control the renderer itself
       * @version ChartIQ Advanced Package
       */
      constructor(config: {params?: object})
    }
  }

  export namespace CIQ {
    interface ChartEngine {
      /**
       * Sets the base aggregation type for the primary symbol.
       *
       * See {@tutorial Chart Styles and Types} for more details.
       * See the [Overriding Defaults Section](tutorial-Chart%20Styles%20and%20Types.html#OverridingDefaults) for details on how to override aggregation type defaults.
       * @param aggregationType The chart type
       */
      setAggregationType(aggregationType: string): void
      /**
       * Draws the Point and Figure Chart. Called by CIQ.ChartEngine#displayChart via the Aggregations renderer
       *
       * @param panel	Panel to draw chart in.
       * @param style	Style to use for coloring. Uses `stx_pandf_down` and  `stx_pandf_up` styles for colors. See example for exact format.
       * @param condition	The condition to draw, 'X' or 'O'
       * @param parameters Configuration parameters for the colors (border_color_up and border_color_down)
       * @since
       * - 2015-04-24
       * - 5.1.0 Added `params` parameter.
       * @version ChartIQ Advanced Package
       * @example
       *	.stx_pandf_down {
       *		color: #FF0000;
       *		padding: 2px 0px 2px 0px;
       *		width: 2px;
       *	}
       *	.stx_pandf_up {
       *		color: #00FF00;
       *		padding: 2px 0px 2px 0px;
       *		width: 2px;
       *	}
       */
      drawPointFigureChart(
        panel: CIQ.ChartEngine.Panel,
        style: string,
        condition: string,
        parameters: object
      ): void
      /**
       * Animation Loop
       *
       * Iterates through all [high performance canvas]CIQ.Marker.Performance markers and draws them on the canvas.
       *
       * See {@tutorial Markers} tutorials for additional implementation instructions.
       *
       * @since
       * - 7.1.0
       * - 7.2.0 Scheduled for deprecation in a future release. See CIQ.Marker.Performance.drawMarkers instead.
       */
      drawMarkers(): void
    }
    /**
     * Gets the maximum number of Renko bars that can be created per quote when using automatic brick
     * size selection.
     *
     * This method is used to adjust auto Renko brick size if the default algorithm set it too low,
     * resulting in too many bars.
     *
     * Override this function to adjust the return value based on the expected data set per symbol,
     * thereby avoiding very long processing time due to small brick size selection.
     *
     * @param [symbol] Chart symbol for which to return the maximum number of Renko
     * 		bars per quote. If not provided, a default maximum value is returned.
     * @return The maximum number of Renko bars per quote.
     *
     * @since 8.3.0
     */
    function getMaxRenkoBarsPerRecord(symbol?: string|object): number
    /**
     * Calculates Heikin-Ashi values. Takes some unaggregated data and returns aggregated data.
     *
     * This method is used inside CIQ.ChartEngine#createDataSet to determine the data aggregation logic and should not be called directly.
     * Use CIQ.ChartEngine#setAggregationType instead.
     *
     * See the [Chart types](tutorial-Chart%20Styles%20and%20Types.html#OverridingDefaults) tutorial for details on how to override aggregation type defaults.
     *
     * @param stx   The chart object
     * @param newData The data to aggregate. Normally the dataSet.
     * @param computed Cumulative computed records from last pass through this function. Used to increase performance by reusing pre-calculated bars and only calculate missing new bars.
     * @return        The aggregated data
     * @since
     * - 04-2015-15
     * - 3.0.0 Added `computed` parameter.
     * @version ChartIQ Advanced Package
     */
    function calculateHeikinAshi(stx: CIQ.ChartEngine, newData: any[], computed: any[]): any[]
    /**
     * Calculates Kagi chart values. Takes some unaggregated data and returns aggregated data.
     *
     * This method is used inside CIQ.ChartEngine#createDataSet to determine the data aggregation logic and should not be called directly.
     * Use CIQ.ChartEngine#setAggregationType instead.
     *
     * Kagi uses Close method only, not High/Low or ATR
     *
     * See the [Chart types](tutorial-Chart%20Styles%20and%20Types.html#OverridingDefaults) tutorial for details on how to override aggregation type defaults.
     *
     * @param stx   The chart object
     * @param newData The data to aggregate. Normally the dataSet.
     * @param reversal The reversal percentage for the kagi lines. This is typically user configurable. Default is 4% for daily, .4% for intraday.
     * @param computed Cumulative computed records from last pass through this function. Used to increase performance by reusing pre-calculated bars and only calculate missing new bars.
     * @return        The aggregated data
     * @since
     * - 04-2015-15
     * - 3.0.0 Added `computed` parameter.
     * @version ChartIQ Advanced Package
     */
    function calculateKagi(
      stx: CIQ.ChartEngine,
      newData: any[],
      reversal: number,
      computed: any[]
    ): any[]
    /**
     * Calculates Line Break chart values. Takes some unaggregated data and returns aggregated data.
     *
     * This method is used inside CIQ.ChartEngine#createDataSet to determine the data aggregation logic and should not be called directly.
     * Use CIQ.ChartEngine#setAggregationType instead.
     *
     * See the [Chart types](tutorial-Chart%20Styles%20and%20Types.html#OverridingDefaults) tutorial for details on how to override aggregation type defaults.
     *
     * @param stx   The chart object
     * @param newData The data to aggregate. Normally the dataSet.
     * @param pricelines The number of lines to use for the line break count. This is typically user configurable. Default is 3.
     * @param computed Cumulative computed records from last pass through this function. Used to increase performance by reusing pre-calculated bars and only calculate missing new bars.
     * @return        The aggregated data
     * @since
     * - 04-2015-15
     * - 3.0.0 Added `computed` parameter.
     * @version ChartIQ Advanced Package
     */
    function calculateLineBreak(
      stx: CIQ.ChartEngine,
      newData: any[],
      pricelines: number,
      computed: any[]
    ): any[]
    /**
     * Calculates range bars. Takes some unaggregated data and returns aggregated data.
     *
     * This method is used inside CIQ.ChartEngine#createDataSet to determine the data aggregation logic and should not be called directly.
     * Use CIQ.ChartEngine#setAggregationType instead.
     *
     * See the [Chart types](tutorial-Chart%20Styles%20and%20Types.html#OverridingDefaults) tutorial for details on how to override aggregation type defaults.
     *
     * @param stx   The chart object
     * @param newData The data to aggregate. Normally the dataSet.
     * @param range The price range for the range bars. This is typically user configurable. Defaults to a ramge size so that about 300 bars worth of time are displayed; about a year for a daily chart, about 5 hours on a minute chart.
     * @param computed Cumulative computed records from last pass through this function. Used to increase performance by reusing pre-calculated bars and only calculate missing new bars.
     * @return        The aggregated data
     * @since 3.0.0 Added `computed` parameter.
     * @version ChartIQ Advanced Package
     */
    function calculateRangeBars(
      stx: CIQ.ChartEngine,
      newData: any[],
      range: number,
      computed: any[]
    ): any[]
    /**
     * Calculates Point and Figure (P&F) chart values. Takes some unaggregated data and returns aggregated data.
     *
     * This method is used inside CIQ.ChartEngine#createDataSet to determine the data aggregation logic and should not be called directly.
     * Use CIQ.ChartEngine#setAggregationType instead.
     *
     * See the [Chart types](tutorial-Chart%20Styles%20and%20Types.html#OverridingDefaults) tutorial for details on how to override aggregation type defaults.
     *
     * @param stx   The chart object
     * @param newData The data to aggregate. Normally the dataSet.
     * @param pandf The parameters for point and figure.
     * @param [pandf.box] The box size.  Default is automatically determined based on the price.
     * @param [pandf.reversal] The reversal amount, in boxes.  Default is 3.
     * @param computed Cumulative computed records from last pass through this function. Used to increase performance by reusing pre-calculated bars and only calculate missing new bars.
     * @return        The aggregated data
     * @since
     * - 04-2015-15
     * - 3.0.0 Added `computed` parameter.
     * @version ChartIQ Advanced Package
     */
    function calculatePointFigure(
      stx: CIQ.ChartEngine,
      newData: any[],
      pandf: {
        box?: number,
        reversal?: number
      },
      computed: any[]
    ): any[]
    /**
     * Extracts symbols from an equation.  An equation can consist of symbols and the following operators: +-/*%()
     * PEMDAS order is followed.  Additionally, symbols can be enclosed in brackets [] to treat them as literal non-parseables.
     * @param equation The equation to parse (e.g. IBM+GE)
     * @return  Parsed equation, {equation: [formatted equation], symbols: [array of symbols found in the equation]}
     * @version ChartIQ Advanced Package
     */
    function formatEquation(equation: string): object
    /**
     * Extracts symbols from an equation and fetches the quotes for them.
     * @param params Parameters used for the fetch
     * @param  cb Callback function once all quotes are fetched
     * @version ChartIQ Advanced Package
     */
    function fetchEquationChart(params: object, cb: Function): void
  }

  /**
   * Creates high performance canvas nodes that can be used with a CIQ.Marker.
   *
   * Use this class if you need to add hundreds or thousands of markers to a chart. When a
   * marker is created, this class creates a node from the built-in template but does not attach
   * the node to the DOM until you hover over the canvas drawing. Once you intersect the drawing,
   * the node is appended and you can interact with it like other markers.
   *
   * The canvas draws the marker based on the classes that you append to the template (which
   * come from `params.type` and `params.category`) being added to `stx-marker` class.
   * See CIQ.ChartEngine#calculateMarkerStyles for more information.
   *
   * This class takes the same params as CIQ.Marker.Simple so that the appended DOM
   * marker works the same. This means that you can reuse all of the default styles you've
   * created for `CIQ.Marker.Simple` with `CIQ.Marker.Performance`. **Note:** If you do not pass
   * in either a `headline` or a `story` or both, your marker will not create a pop-up display
   * when the marker is selected.
   *
   * See the {@tutorial Markers} tutorial for additional implementation instructions.
   *
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
   *
   * Other custom categories require a corresponding CSS entry. See example.
   *
   * 		the category in the marker.
   * 		marker displays an empty DOM node when clicked.
   * 		set by `params.category`.
   * 		point and not include the stem.
   * 		the left when possible.
   *
   * @since
   * - 7.1.0
   * - 7.2.0 Markers without <u>both</u> a `headline` and `story` are not interactive.
   * 		You must provide either or both properties for a node (which is the marker pop-up
   * 		display) to be appended to the DOM. Performance markers now can be positioned anywhere
   * 		that a DOM marker can be positioned (above, below, or on a candle; at a value; or at
   * 		the top or bottom of a chart).
   * - 8.0.0 Added `params.infoOnLeft`, `params.infoOffset`, and `params.invert`.
   *
   *
   * @example
   * <caption>Required CSS entry for a custom category ("trade"), not included in the default
   * CSS styles.</caption>
   *
   * .stx-marker.trade .stx-visual {
   *     background: #C950d7;
   *     width: 5px;
   *     height: 5px;
   * }
   *
   * // Corresponding code:
   *
   * new CIQ.Marker({
   *     stx: stxx,
   *     label: "trade",
   *     xPositioner: "date",
   *     x: OHLCData.DT,
   *     node: new CIQ.Marker.Performance({
   *         type: "circle",
   *         category: "trade",
   *         displayCategory: false,
   *         displayStem: false,
   *         headline: "Executed at $" + OHLCData.Close,
   *         story: "Like all ChartIQ markers, the object itself is managed by the chart."
   *     })
   * });
   */
  export namespace CIQ.Marker.Performance {
    /**
     * Animation Loop
     *
     * Iterates through all [high performance canvas]CIQ.Marker.Performance markers and
     * draws them on the canvas.
     *
     * See {@tutorial Markers} tutorials for additional implementation instructions.
     *
     * @param stx A reference to the chart object.
     *
     * @static
     * @since 7.2.0 Replaces CIQ.ChartEngine#drawMarkers.
     */
    function drawMarkers(stx: CIQ.ChartEngine): void
  }

  /**
   * Creates a Scatter plot renderer
   * See CIQ.Renderer#construct for parameters required by all renderers
   * @version ChartIQ Advanced Package
   */
  export namespace CIQ.Renderer.Scatter {
    /**
     * Returns a new Scatter renderer if the featureList calls for it
     * FeatureList should contain "scatter"
     * Called by CIQ.Renderer.produce to create a renderer for the main series
     * @param featureList List of rendering terms requested by the user, parsed from the chartType
     * @param [params] Parameters used for the series to be created, used to create the renderer
     * @return A new instance of the Scatter renderer, if the featureList matches
     * @since 5.1.0
     */
    function requestNew(featureList: any[], params?: object): CIQ.Renderer.Scatter
  }
}
export function aggregations(_export): void
export function drawingAdvanced(_export): void
export function equationsAdvanced(_export): void
export function highPerformanceMarkers(_export): void
export function renderersAdvanced(_export): void
export function accumulationDistribution(_export): void
export function adx(_export): void
export function alligator(_export): void
export function aroon(_export): void
export function atr(_export): void
export function awesomeOscillator(_export): void
export function balanceOfPower(_export): void
export function bollinger(_export): void
export function cci(_export): void
export function centerOfGravity(_export): void
export function chaikin(_export): void
export function chande(_export): void
export function choppiness(_export): void
export function comparisonStudies(_export): void
export function coppock(_export): void
export function darvasBox(_export): void
export function detrended(_export): void
export function disparity(_export): void
export function easeOfMovement(_export): void
export function ehlerFisher(_export): void
export function elder(_export): void
export function fractalChaos(_export): void
export function highLowStudies(_export): void
export function ichimoku(_export): void
export function intradayMomentum(_export): void
export function keltner(_export): void
export function klinger(_export): void
export function linearRegression(_export): void
export function macd(_export): void
export function massIndex(_export): void
export function moneyFlow(_export): void
export function movingAverages(_export): void
export function parabolicSAR(_export): void
export function pivotPoints(_export): void
export function prettyGoodOscillator(_export): void
export function priceMomentumOscillator(_export): void
export function priceVolumeOscillator(_export): void
export function primeNumber(_export): void
export function pring(_export): void
export function projectedVolume(_export): void
export function psychologicalLine(_export): void
export function qstick(_export): void
export function rainbow(_export): void
export function randomWalk(_export): void
export function relativeVigor(_export): void
export function rsi(_export): void
export function schaffTrendCycle(_export): void
export function shinohara(_export): void
export function stochastics(_export): void
export function supertrend(_export): void
export function swingIndex(_export): void
export function trendIntensity(_export): void
export function trix(_export): void
export function twiggsMoneyFlow(_export): void
export function typicalPrice(_export): void
export function ulcerIndex(_export): void
export function ultimateOscillator(_export): void
export function valuationLines(_export): void
export function volatilityIndex(_export): void
export function volumeProfile(_export): void
export function volumeStudies(_export): void
export function vortex(_export): void
export function williamsMFI(_export): void