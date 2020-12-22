// -------------------------------------------------------------------------------------------
// Copyright 2012-2016 by ChartIQ, Inc
// -------------------------------------------------------------------------------------------
(function (definition) {
    "use strict";

    if (typeof exports === "object" && typeof module === "object") {
        module.exports = definition(require('./core/master'));
    } else if (typeof define === "function" && define.amd) {
        define(['core/master'], definition);
    } else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition(global);
    } else {
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for drawing.js.");
    }

})(function(_exports) {
	console.log("drawings.js",_exports);
	var CIQ=_exports.CIQ;

	/**
	 * Base class for Drawing Tools. Use ciqInheritsFrom() to build a subclass for custom drawing tools.
	 * The name of the subclass should be CIQ.Drawing.yourname. Whenever CIQ.ChartEngine.vectorType==yourname, then
	 * your drawing tool will be the one that is enabled when the user begins a drawing. Capitalization of yourname
	 * must be an exact match otherwise ther kernel will not be able to find your drawing tool.
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
	 * **Permanent drawings:**<br>
	 * To make a drawing permanent set its `permanent` property to `true` once created.
	 * <br>Example: <br>
	 * ```drawingObject.permanent=true;```
	 * 
	 * See {@tutorial Custom Drawing Tools} for more details.
	 *
	 * @name  CIQ.Drawing
	 * @constructor
	 */
	CIQ.Drawing=function (){
		this.chartsOnly=false;	// Set this to true to restrict drawing to panels containing charts (as opposed to studies)
		this.penDown=false;   // Set to true when in the midst of creating the object
	};

	/**
	 * Set to true when need to hold mouse down to draw; set to false for click on/off draw
	 * @memberOf CIQ.Drawing
	 * @example
	 * CIQ.Drawing.prototype.dragToDraw=true;
	 */
	CIQ.Drawing.prototype.dragToDraw=false;

	/**
	 * Is called to tell a drawing to abort itself. It should clean up any rendered objects such as DOM elements or toggle states. It
	 * does not need to clean up anything that it drew on the canvas.
	 * @param  {boolean} forceClear Indicates that the user explicitly has deleted the drawing (advanced usage)
	 * @memberOf CIQ.Drawing
	 */
	CIQ.Drawing.prototype.abort=function(forceClear){};

	/**
	 * Should call this.stx.setMeasure() with the measurements of the drawing if supported
	 * @memberOf CIQ.Drawing
	 */
	CIQ.Drawing.prototype.measure=function(){};

	/**
	 * Initializes the drawing
	 * @param  {object} stx   The chart object
	 * @param  {object} panel The panel reference
	 * @memberOf CIQ.Drawing
	 */
	CIQ.Drawing.prototype.construct=function(stx, panel){
		this.stx=stx;
		this.panelName=panel.name;
	};

	/**
	 * Called to render the drawing
	 * @memberOf CIQ.Drawing
	 */
	CIQ.Drawing.prototype.render=function(context)					{alert("must implement render function!");};

	/**
	 * Called when a user clicks while drawing.
	 * @param  {object} context               The canvas context
	 * @param  {number} tick                  The tick in the dataSet
	 * @param  {number} value - The value (price) of the click
	 * @return {boolean}                       Return true if the drawing is complete. Otherwise the kernel will continue accepting clicks.
	 * @memberOf CIQ.Drawing
	 */
	CIQ.Drawing.prototype.click=function(context, tick, value)		{alert("must implement click function!");};

	/**
	 * Called when the user moves while creating a drawing.
	 * @memberOf CIQ.Drawing
	 */
	CIQ.Drawing.prototype.move=function(context, tick, value)		{alert("must implement move function!");};

	/**
	 * Called when the user attempts to reposition a drawing. The repositioner is the latest provided by {@link CIQ.Drawing.intersected}
	 * and can be used to determine which aspect of the drawing is being repositioned. For instance, this object may indicate
	 * which point on the drawing was selected by the user. It might also contain the original coordinates of the point or anything else
	 * that is useful to render the drawing.
	 * @param  {object} context      The canvas context
	 * @param  {object} repositioner The repositioner object
	 * @param  {number} tick         Current tick in the dataSet for the mouse cursor
	 * @param  {number} value        Current value in the datSet for the mouse cursor
	 * @memberOf CIQ.Drawing
	 */
	CIQ.Drawing.prototype.reposition=function(context, repositioner, tick, value){};
	/**
	 * Called to determine whether the drawing is intersected by either the tick/value (pointer location) or box (small box surrounding the pointer).
	 * For line based drawings, box should be checked. For area drawings (rectangles, circles) the point should be checked
	 * @param  {number} tick               The tick in the dataSet representing the cursor point
	 * @param  {number} value              The value (price) representing the cursor point
	 * @param  {object} box)	x0,y0,x1,y1 representing an area around the cursor
	 * @return {object}                    An object that contains information about the intersection.
	 *                                     This object is passed back to {@link CIQ.Drawing.reposition} when repositioning the drawing.
	 *                                     Return false or null if not intersected. Simply returning true will highlight the drawing.
	 * @memberOf CIQ.Drawing
	 */
	CIQ.Drawing.prototype.intersected=function(tick, value, box)	{alert("must implement intersected function!");};

	/**
	 * Reconstruct this drawing type from a serialization object
	 * @memberOf CIQ.Drawing
	 */
	CIQ.Drawing.prototype.reconstruct=function(stx, obj)				{alert("must implement reconstruct function!");};

	/**
	 * Serialize a drawing into an object.
	 * @memberOf CIQ.Drawing
	 */
	CIQ.Drawing.prototype.serialize=function()						{alert("must implement serialize function!");};

	/**
	 * Called whenever periodicity changes so that drawings can adjust their rendering.
	 * @memberOf CIQ.Drawing
	 */
	CIQ.Drawing.prototype.adjust=function()							{alert("must implement adjust function!");};

	/**
	 * Returns the highlighted state. Set this.highlighted to the highlight state.
	 * For simple drawings the highlighted state is just true or false. For complex drawings
	 * with pivot points for instance, the highlighted state may have more than two states.
	 * Whenever the highlighted state changes a draw() event will be triggered.
	 * @param {Boolean} highlighted True to highlight the drawing, false to unhighlight
	 * @memberOf CIQ.Drawing.BaseTwoPoint
	 */
	CIQ.Drawing.prototype.highlight=function(highlighted){
		if(highlighted && !this.highlighted){
			this.highlighted=highlighted;
		}else if(!highlighted && this.highlighted){
			this.highlighted=highlighted;
		}
		return this.highlighted;
	};

	CIQ.Drawing.prototype.littleCircleRadius=function(){
		var radius=6;  //Math.max(12, this.layout.candleWidth)/2;
		return radius;
	};

	CIQ.Drawing.prototype.littleCircle=function(ctx, x, y, fill){
		var strokeColor=this.stx.defaultColor;
		var fillColor=CIQ.chooseForegroundColor(strokeColor);
		ctx.beginPath();
		ctx.lineWidth=1;
		ctx.arc(x, y, this.littleCircleRadius(), 0, 2*Math.PI, false);
		if(fill) ctx.fillStyle=strokeColor;
		else ctx.fillStyle=fillColor;
		ctx.strokeStyle=strokeColor;
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
	};

	CIQ.Drawing.prototype.rotator=function(ctx, x, y, on){
		var circleSize=this.littleCircleRadius();
		var strokeColor=this.stx.defaultColor;
		ctx.beginPath();
		ctx.lineWidth=2;
		if(!on) ctx.globalAlpha=0.5;
		var radius=4+circleSize;
		ctx.arc(x, y, radius, 0, 3*Math.PI/2, false);
		ctx.moveTo(x+2+radius,y+2);
		ctx.lineTo(x+radius,y);
		ctx.lineTo(x-2+radius,y+2);
		ctx.moveTo(x-2,y+2-radius);
		ctx.lineTo(x,y-radius);
		ctx.lineTo(x-2,y-2-radius);
		ctx.strokeStyle=strokeColor;
		ctx.stroke();
		ctx.closePath();
		ctx.globalAlpha=1;
	};

	CIQ.Drawing.prototype.mover=function(ctx, x, y, on){
		var circleSize=this.littleCircleRadius();
		var strokeColor=this.stx.defaultColor;
		var length=5;
		var start=circleSize+1;
		ctx.save();
		ctx.lineWidth=2;
		ctx.strokeStyle=strokeColor;
		ctx.translate(x,y);
		if(!on) ctx.globalAlpha=0.5;
		for(var i=0;i<4;i++){
			ctx.rotate(Math.PI/2);
			ctx.beginPath();
			ctx.moveTo(0,start);
			ctx.lineTo(0,start+length);
			ctx.moveTo(-2,start+length-2);
			ctx.lineTo(0,start+length);
			ctx.lineTo(2,start+length-2);
			ctx.closePath();
			ctx.stroke();
		}
		ctx.globalAlpha=1;
		ctx.restore();
	};

	CIQ.Drawing.prototype.resizer=function(ctx, x, y, on){
		var circleSize=this.littleCircleRadius();
		var strokeColor=this.stx.defaultColor;
		var length=5*Math.sqrt(2);
		var start=circleSize+1;
		ctx.save();
		ctx.lineWidth=2;
		ctx.strokeStyle=strokeColor;
		ctx.translate(x,y);
		ctx.rotate(-Math.PI/4);
		if(!on) ctx.globalAlpha=0.5;
		for(var i=0;i<2;i++){
			ctx.rotate(Math.PI);
			ctx.beginPath();
			ctx.moveTo(0,start);
			ctx.lineTo(0,start+length);
			ctx.moveTo(-2,start+length-2);
			ctx.lineTo(0,start+length);
			ctx.lineTo(2,start+length-2);
			ctx.closePath();
			ctx.stroke();
		}
		ctx.globalAlpha=1;
		ctx.restore();
	};

	/**
	 * Returns true if the tick and value are inside the box
	 * @param  {number} tick  The tick
	 * @param  {number} value The value
	 * @param  {object} box   The box
	 * @return {boolean}       True if the tick and value are within the box
	 * @memberOf CIQ.Drawing
	 */
	CIQ.Drawing.prototype.pointIntersection=function(tick, value, box){
		var panel=this.stx.panels[this.panelName];
		if(!panel) return false;
		if(tick >= box.x0 && tick<=box.x1 && value>=box.y1 && value<=box.y0) return true;
		return false;
	};

	/**
	 * Sets the internal properties of the drawing points where x is a tick or a date and y is a value.
	 * @param  {number} point    index to point to be converted (0,1)
	 * @param  {number|string} x    index of bar in dataSet (tick) or date of tick (string form)
	 * @param  {number} y    price
	 * @param  {CIQ.Chart} [chart] Optional chart object
	 * @memberOf CIQ.Drawing.BaseTwoPoint
	 * @since 04-2015
	 */
	CIQ.Drawing.prototype.setPoint=function(point, x, y, chart){
		var tick=null;
		var date=null;
		if(typeof x == "number") tick=x;
		else if(x.length>=8) date=x;
		else tick=Number(x);

		if(y || y===0) this["v"+point]=y;
		var d;
		if(tick!==null) {
			d=this.stx.dateFromTick(tick, chart, true);
			this["tzo"+point]=d.getTimezoneOffset();
			this["d"+point]=CIQ.yyyymmddhhmmssmmm(d);
			this["p"+point]=[tick,y];
		}else if(date!==null){
			d=CIQ.strToDateTime(date);
			if(!this["tzo"+point] && this["tzo"+point]!==0) this["tzo"+point]=d.getTimezoneOffset();
			this["d"+point]=date;
			var adj=this["tzo"+point]-d.getTimezoneOffset();
			d.setMinutes(d.getMinutes()+adj);
			this["p"+point]=[this.stx.tickFromDate(CIQ.yyyymmddhhmmssmmm(d), chart), y];
		}
	};

	/**
	 * Base class for drawings that require two mouse clicks. Override as required.
	 * @constructor
	 * @name  CIQ.Drawing.BaseTwoPoint
	 */
	CIQ.Drawing.BaseTwoPoint=function(){
		this.p0=null;
		this.p1=null;
		this.color="";
	};

	CIQ.Drawing.BaseTwoPoint.ciqInheritsFrom(CIQ.Drawing);

	/**
	 * Override this function to copy all of the config necessary to render your drawing
	 * @memberOf CIQ.Drawing.BaseTwoPoint
	 */
	CIQ.Drawing.BaseTwoPoint.prototype.copyConfig=function(){
		this.color=this.stx.currentVectorParameters.currentColor;
	};

	/**
	 * Intersection is based on a hypothetical box that follows a user's mouse or finger around
	 * An intersection occurs when either the box crosses over the drawing.The type should be "segment", "ray" or "line" depending on whether
	 * the drawing extends infinitely in any or both directions. radius determines the size of the box in pixels and is
	 * determined by the kernel depending on the user interface (mouse, touch, etc)
	 * @memberOf CIQ.Drawing.BaseTwoPoint
	 */


	CIQ.Drawing.BaseTwoPoint.prototype.lineIntersection=function(tick, value, box, type){
		if(!this.p0 || !this.p1) return false;
		if(this.stx.layout.semiLog || this.stx.layout.chartScale=="log"){
			return CIQ.boxIntersects(box.x0, CIQ.log10(box.y0), box.x1, CIQ.log10(box.y1), this.p0[0], CIQ.log10(this.p0[1]), this.p1[0], CIQ.log10(this.p1[1]), type);
		}else{
			return CIQ.boxIntersects(box.x0, box.y0, box.x1, box.y1, this.p0[0], this.p0[1], this.p1[0], this.p1[1], type);
		}
	};

	/**
	 * Determine whether the tick/value lie within the theoretical box outlined by this drawing's two points
	 * @memberOf CIQ.Drawing.BaseTwoPoint
	 */
	CIQ.Drawing.BaseTwoPoint.prototype.boxIntersection=function(tick, value){
		if(!this.p0 || !this.p1) return false;
		if(tick>Math.max(this.p0[0], this.p1[0]) || tick<Math.min(this.p0[0], this.p1[0])) return false;
		if(value>Math.max(this.p0[1], this.p1[1]) || value<Math.min(this.p0[1], this.p1[1])) return false;
		return true;
	};

	/**
	 * Any two-point drawing that results in a drawing that is less than 10 pixels
	 * can safely be assumed to be an accidental click. Such drawings are so small
	 * that they are difficult to highlight and delete, so we won't allow them.
	 *
	 * <b>Note:</b> it is very important to use pixelFromValueAdjusted() rather than pixelFromPrice(). This will
	 * ensure that saved drawings always render correctly when a chart is adjusted or transformed for display
	 * @memberOf CIQ.Drawing.BaseTwoPoint
	 */
	CIQ.Drawing.BaseTwoPoint.prototype.accidentalClick=function(tick, value){
		var panel=this.stx.panels[this.panelName];
		var x0=this.stx.pixelFromTick(this.p0[0], panel.chart);
		var x1=this.stx.pixelFromTick(tick, panel.chart);
		var y0=this.stx.pixelFromValueAdjusted(panel, this.p0[0], this.p0[1]);
		var y1=this.stx.pixelFromValueAdjusted(panel, tick, value);
		var h=Math.abs(x1-x0);
		var v=Math.abs(y1-y0);
		var length=Math.sqrt(h*h+v*v);
		if(length<10) {
			this.penDown=false;
			if(this.dragToDraw) this.stx.undo();
			return true;
		}
	};


	/**
	 * Value will be the actual underlying, unadjusted value for the drawing. Any adjustments or transformations
	 * are reversed out by the kernel. Internally, drawings should store their raw data (date and value) so that
	 * they can be rendered on charts with different layouts, axis, etc
	 * @memberOf CIQ.Drawing.BaseTwoPoint
	 */
	CIQ.Drawing.BaseTwoPoint.prototype.click=function(context, tick, value){
		this.copyConfig();
		var panel=this.stx.panels[this.panelName];
		if(!this.penDown){
			this.setPoint(0, tick, value, panel.chart);
			this.penDown=true;
			return false;
		}
		if(this.accidentalClick(tick, value)) return this.dragToDraw;

		this.setPoint(1, tick, value, panel.chart);
		this.penDown=false;
		return true;	// kernel will call render after this
	};

	/**
	 * Default adjust function for BaseTwoPoint drawings
	 * @memberOf CIQ.Drawing.BaseTwoPoint
	 */
	CIQ.Drawing.BaseTwoPoint.prototype.adjust=function(){
		// If the drawing's panel doesn't exist then we'll check to see
		// whether the panel has been added. If not then there's no way to adjust
		var panel=this.stx.panels[this.panelName];
		if(!panel) return;
		this.setPoint(0, this.d0, this.v0, panel.chart);
		this.setPoint(1, this.d1, this.v1, panel.chart);
	};

	/**
	 * Default move function for BaseTwoPoint drawings
	 * @memberOf CIQ.Drawing.BaseTwoPoint
	 */
	CIQ.Drawing.BaseTwoPoint.prototype.move=function(context, tick, value){
		if(!this.penDown) return;

		this.copyConfig();
		this.p1=[tick,value];
		this.render(context);
	};

	/**
	 * Default measure function for BaseTwoPoint drawings
	 * @memberOf CIQ.Drawing.BaseTwoPoint
	 */
	CIQ.Drawing.BaseTwoPoint.prototype.measure=function(){
		this.stx.setMeasure(this.p0[1], this.p1[1], this.p0[0], this.p1[0], true);
	};

	CIQ.Drawing.BaseTwoPoint.prototype.reposition=function(context, repositioner, tick, value){
		if(!repositioner) return;
		var panel=this.stx.panels[this.panelName];
		var tickDiff=repositioner.tick-tick;
		var valueDiff=repositioner.value-value;
		if(repositioner.action=="move"){
			this.setPoint(0, repositioner.p0[0]-tickDiff, repositioner.p0[1]-valueDiff, panel.chart);
			this.setPoint(1, repositioner.p1[0]-tickDiff, repositioner.p1[1]-valueDiff, panel.chart);
			this.render(context);
		}else if(repositioner.action=="drag"){
			this[repositioner.point]=[tick, value];
			this.setPoint(0, this.p0[0], this.p0[1], panel.chart);
			this.setPoint(1, this.p1[0], this.p1[1], panel.chart);
			this.render(context);
		}
	};
	/**
	 * Annotation drawing tool. An annotation is a simple text tool. It uses the class stx_annotation
	 * to determine the font style and color for the annotation. Class stx_annotation_highlight_bg is used to
	 * determine the background color when highlighted.
	 *
	 * The controls controls.annotationSave and controls.annotationCancel are used to create HTMLElements for
	 * saving and canceling the annotation while editing. A textarea is created dynamically. The annotation tool
	 * attempts to draw the annotations at the same size and position as the textarea so that the effect is wysiwig.
	 * @constructor
	 * @name  CIQ.Drawing.annotation
	 * @see {@link CIQ.Drawing.BaseTwoPoint}
	 */
	CIQ.Drawing.annotation=function(){
		this.name="annotation";
		this.arr=[];
		this.w=0;
		this.h=0;
		this.padding=4;
		this.text="";
		this.ta=null;
		this.fontSize=0;
		this.font={};
	};
	CIQ.Drawing.annotation.ciqInheritsFrom(CIQ.Drawing.BaseTwoPoint);

	CIQ.Drawing.annotation.prototype.getFontString=function(){
		this.fontDef={
			style:null,
			weight:null,
			size:"12px",
			family:null
		};
		var css=this.stx.canvasStyle("stx_annotation");
		if(css){
			if(css.fontStyle) this.fontDef.style=css.fontStyle;
			if(css.fontWeight) this.fontDef.weight=css.fontWeight;
			if(css.fontSize) this.fontDef.size=css.fontSize;
			if(css.fontFamily) this.fontDef.family=css.fontFamily;
		}
		if(this.font.style) this.fontDef.style=this.font.style;
		if(this.font.weight) this.fontDef.weight=this.font.weight;
		if(this.font.size) this.fontDef.size=this.font.size;
		if(this.font.family) this.fontDef.family=this.font.family;
		this.fontString="";
		var first=false;
		for(var n in this.fontDef){
			if(this.fontDef[n]){
				if(!first){
					this.fontString+=" ";
				}else{
					first=true;
				}
				this.fontString+=this.fontDef[n];
			}
		}
	};

	CIQ.Drawing.annotation.prototype.copyConfig=function(){
		this.color=this.stx.currentVectorParameters.currentColor;
		this.font=CIQ.clone(this.stx.currentVectorParameters.annotation.font);
	};

	CIQ.Drawing.annotation.prototype.measure=function(){};

	CIQ.Drawing.annotation.prototype.render=function(context){
		var panel=this.stx.panels[this.panelName];
		if(!panel) return;
		var x0=this.stx.pixelFromTick(this.p0[0], panel.chart);
		var y0=this.stx.pixelFromValueAdjusted(panel, this.p0[0], this.p0[1]);

		context.font=this.fontString;
		context.textBaseline="top";
		var x=x0;
		var y=y0;
		var w=this.w;
		var h=this.h;
		var color=this.color;
		if(color=="auto" || CIQ.isTransparent(color)) color=this.stx.defaultColor;
		if(this.highlighted) color=this.stx.getCanvasColor("stx_highlight_vector");
		if(this.stem){
			var sx0, sx1, sy0, sy1;
			if(this.stem.d){	// absolute positioning of stem
				sx0=this.stx.pixelFromTick(this.stem.t);	// bottom of stem
				sy0=this.stx.pixelFromValueAdjusted(panel, this.stem.t, this.stem.v);
				sx1=x+w/2;	// center of text
				sy1=y+h/2;
			}else if(this.stem.x){	// stem with relative offset positioning
				sx0=x;
				sy0=y;
				x+=this.stem.x;
				y+=this.stem.y;
				sx1=x+w/2;
				sy1=y+h/2;
			}

			context.beginPath();
			if(this.borderColor) context.strokeStyle=this.borderColor;
			else context.strokeStyle=color;
			context.moveTo(sx0, sy0);
			context.lineTo(sx1, sy1);
			context.stroke();
		}
		if(this.highlighted){
			this.stx.canvasColor("stx_annotation_highlight_bg", context);
			context.fillRect(x, y, w, h);
		}else{
			if(this.backgroundColor){
				context.fillStyle=this.backgroundColor;
				context.fillRect(x, y, w, h);
			}else if(this.stem){	// If there's a stem then use the container color otherwise the stem will show through
				context.fillStyle=this.stx.containerColor;
				context.fillRect(x, y, w, h);
			}
		}
		if(this.borderColor){
			context.beginPath();
			context.strokeStyle=this.borderColor;
			context.rect(x, y, w, h);
			context.stroke();
		}
		//this.stx.canvasFont("stx_annotation");
		if(this.highlighted){
			this.stx.canvasColor("stx_annotation_highlight", context);
		}else{
			context.fillStyle=color;
		}
		y+=this.padding;
		for(var i=0;i<this.arr.length;i++){
			context.fillText(this.arr[i], x+this.padding, y);
			y+=this.fontSize;
		}
		context.textBaseline="alphabetic";
	};

	CIQ.Drawing.annotation.prototype.onChange=function(e){
		//no operation. Override if you want to capture the change.
	};

	CIQ.Drawing.annotation.prototype.edit=function(context){
		var panel=this.stx.panels[this.panelName];
		if(!panel) return;
		// When mouse events are attached to the container then any dom objects on top
		// of the container will intercept those events. In particular, the textarea for
		// annotations gets in the way, so here we capture the mouseup that fires on the textarea
		// and pass it along to the kernel if necessary
		function handleTAMouseUp(stx){
			return function(e){
				if(stx.manageTouchAndMouse && CIQ.ChartEngine.drawingLine){
					stx.mouseup(e);
				}
			};
		}

		function cancelAnnotation(self){
			return function(){
				self.stx.undo();
				self.stx.cancelTouchSingleClick=true;
			};
		}
		function saveAnnotation(self){
			return function(){
				if(self.ta.value==="") return;
				self.text=self.ta.value;
				self.adjust();

				self.stx.addDrawing(self);
				self.stx.changeOccurred("vector");
				self.stx.undo();
				self.stx.cancelTouchSingleClick=true;
			};
		}

		function resizeAnnotation(self){
			return function(e){
				if(e){
					var key = (window.event) ? event.keyCode : e.keyCode;
					switch(key){
						case 27:
							self.stx.undo();
							return;
					}
				}
				var stx=self.stx;
				var ta=self.ta;
				var save=stx.controls.annotationSave;
				var cancel=stx.controls.annotationCancel;
				var arr=ta.value.split('\n');
				var w=0;
				//stx.canvasFont("stx_annotation");
				stx.chart.context.font=self.fontString;
				for(var i=0;i<arr.length;i++){
					var m=stx.chart.context.measureText(arr[i]).width;
					if(m>w) w=m;
				}
				h=(arr.length+1)*(self.fontSize+3);
				if(w<50) w=50;
				ta.style.width=(w+30) + "px";	// Leave room for scroll bar
				ta.style.height=h+"px";
				var y=parseInt(CIQ.stripPX(ta.style.top));
				var x=CIQ.stripPX(ta.style.left);
				w=ta.clientWidth;
				h=ta.clientHeight;
				if(x+w+100<self.stx.chart.canvasWidth){
					save.style.top=y+"px";
					cancel.style.top=y+"px";
					save.style.left=(x+w + 10) + "px";
					cancel.style.left=(x+w + 60) + "px";
				}else if(y+h+30<self.stx.chart.canvasHeight){
					save.style.top=(y+h+10) + "px";
					cancel.style.top=(y+h+10) + "px";
					save.style.left=x + "px";
					cancel.style.left=(x+50) + "px";
				}else{
					save.style.top=(y-35) + "px";
					cancel.style.top=(y-35) + "px";
					save.style.left=x + "px";
					cancel.style.left=(x+50) + "px";
				}
			};
		}

		this.stx.undisplayCrosshairs();
		this.stx.editingAnnotation=true;
		this.stx.openDialog="annotation";
		if(!this.ta){
			this.ta=document.createElement("TEXTAREA");
			this.ta.className="stx_annotation";
			this.ta.onkeyup=resizeAnnotation(this);
			this.ta.onmouseup=handleTAMouseUp(this.stx);
			this.ta.setAttribute("wrap","hard");
			if(CIQ.isIOS7or8) this.ta.setAttribute("placeholder","Enter Text");
			this.stx.chart.container.appendChild(this.ta);
			this.ta.style.position="absolute";
			this.ta.style.width="100px";
			this.ta.style.height="20px";
			if(CIQ.ipad){
				this.ta.ontouchstart=function(e){
					e.stopPropagation();
				};
				/*var ta=this.ta;
				CIQ.safeClickTouch(this.ta, function(e){
					if(document.activeElement===ta){
							window.focus();
							CIQ.focus(ta, true);
					}
				});*/
			}
		}
		var self=this;
		this.ta.oninput=function(e){
			self.onChange(e);
		};
		this.ta.style.font=this.fontString;
		if(this.color){
			if(this.color=="transparent" || this.color=="auto"){
				var styles=getComputedStyle(this.ta);
				if(styles && CIQ.isTransparent(styles.backgroundColor)){
					this.ta.style.color=this.stx.defaultColor;
				}else{
					this.ta.style.color="#000"; // text area always has white background
				}
			}else{
				this.ta.style.color=this.color;
			}
		}
		var x0=this.stx.pixelFromTick(this.p0[0], panel.chart);
		var y0=this.stx.pixelFromValueAdjusted(panel, this.p0[0], this.p0[1]);

		this.ta.style.left=x0+"px";
		this.ta.style.top=y0+"px";
		if(this.name=="callout"){
			this.ta.style.left=x0-(!isNaN(this.w)?this.w/2:this.defaultWidth)+"px";
			this.ta.style.top=y0-(!isNaN(this.h)?this.h/2:this.defaultHeight)+"px";
		}

		this.stx.controls.annotationSave.style.display="inline-block";
		this.stx.controls.annotationCancel.style.display="inline-block";
		CIQ.safeClickTouch(this.stx.controls.annotationSave, saveAnnotation(this));
		CIQ.safeClickTouch(this.stx.controls.annotationCancel, cancelAnnotation(this));
		resizeAnnotation(this)();

		/*var timeout=0;
		if(CIQ.ipad) timeout=400;
		if(!CIQ.isIOS7or8){
			CIQ.focus(this.ta,timeout);
		}*/
		this.ta.focus();

		if(CIQ.isAndroid){
			// Android soft keyboard will cover up the lower half of the browser so if our
			// annotation is in that area we temporarily scroll the chart container upwards
			// The style.bottom of the chart container is reset in abort()
			this.priorBottom=this.stx.chart.container.style.bottom;
			var keyboardHeight=400; // hard coded. We could get this by measuring the change in innerHeight but timing is awkward because the keyboard scrolls
			var screenLocation=this.stx.resolveY(y0)+100; // figure 100 pixels of height for text
			if(screenLocation>CIQ.pageHeight()-keyboardHeight){
				var pixelsFromBottomOfScreen=CIQ.pageHeight()-screenLocation;
				var scrolledBottom=keyboardHeight-pixelsFromBottomOfScreen;
				this.stx.chart.container.style.bottom=scrolledBottom+"px";
			}
		}
	};

	CIQ.Drawing.annotation.prototype.click=function(context, tick, value){
		var panel=this.stx.panels[this.panelName];
		this.copyConfig();
		this.getFontString();
		this.setPoint(0, tick, value, panel.chart);
		this.adjust();

		this.edit(context);
		return false;
	};

	CIQ.Drawing.annotation.prototype.reposition=function(context, repositioner, tick, value){
		var panel=this.stx.panels[this.panelName];
		var tickDiff=repositioner.tick-tick;
		var valueDiff=repositioner.value-value;
		this.setPoint(0, repositioner.p0[0]-tickDiff, repositioner.p0[1]-valueDiff, panel.chart);
		this.render(context);
	};

	CIQ.Drawing.annotation.prototype.intersected=function(tick, value, box){
		var panel=this.stx.panels[this.panelName];
		if(!this.p0) return null; // in case invalid drawing (such as from panel that no longer exists)
		var x0=this.stx.pixelFromTick(this.p0[0], panel.chart);
		var y0=this.stx.pixelFromValueAdjusted(panel, this.p0[0], this.p0[1]);
		var x1=x0+this.w;
		var y1=y0+this.h;
		if(this.stem && this.stem.x){
			x0+=this.stem.x;
			x1+=this.stem.x;
			y0+=this.stem.y;
			y1+=this.stem.y;
		}
		var x=this.stx.pixelFromTick(tick, panel.chart);
		var y=this.stx.pixelFromPrice(value, panel);

		if(x>=x0 && x<=x1 && y>=y0 && y<=y1) return {
			p0: CIQ.clone(this.p0),
			tick: tick,
			value: value
		};
		return false;
		//return this.boxIntersection(tick, value);
	};

	CIQ.Drawing.annotation.prototype.abort=function(){
		this.stx.controls.annotationSave.style.display="none";
		this.stx.controls.annotationCancel.style.display="none";
		if(this.ta) this.stx.chart.container.removeChild(this.ta);
		this.ta=null;
		this.stx.openDialog="";
		this.stx.showCrosshairs();
		document.body.style.cursor="crosshair";
		this.stx.editingAnnotation=false;
		CIQ.clearCanvas(this.stx.chart.tempCanvas, this);
		if(CIQ.isAndroid){
			this.stx.chart.container.style.bottom=this.priorBottom;
		}
		CIQ.fixScreen();
	};

	/**
	 * Reconstruct an annotation
	 * @param  {CIQ.ChartEngine} stx The chart object
	 * @param  {object}[obj] A drawing descriptor
	 * @param {string} [obj.col] The text color for the annotation
	 * @param {string} [obj.pnl] The panel name
	 * @param {string} [obj.d0] String form date or date time
	 * @param {number} [obj.v0] The value at which to position the annotation
	 * @param {string} [obj.text] The annotation text (escaped using escape())
	 * @param {number} [obj.tzo0] Offset of UTC from d0 in minutes
	 * @param {string} [obj.bc] Border color
	 * @param {string} [obj.bg] Background color
	 * @param {string} [obj.lw] Line width
	 * @param {string} [obj.ptrn] Line pattern
	 * @param {object} [obj.fnt] Font
	 * @param {object} [obj.fnt.st] Font style
	 * @param {object} [obj.fnt.sz] Font size
	 * @param {object} [obj.fnt.wt] Font weight
	 * @param {object} [obj.fnt.fl] Font family
	 * @memberOf CIQ.Drawing.annotation
	 */
	CIQ.Drawing.annotation.prototype.reconstruct=function(stx, obj){
		this.stx=stx;
		this.color=obj.col;
		this.panelName=obj.pnl;
		this.d0=obj.d0;
		this.tzo0=obj.tzo0;
		this.v0=obj.v0;
		this.text=unescape(obj.text);
		this.stem=obj.stem;
		this.borderColor=obj.bc;
		this.backgroundColor=obj.bg;
		this.lineWidth=obj.lw;
		this.pattern=obj.ptrn;
		this.font=CIQ.replaceFields(obj.fnt, {"st":"style","sz":"size","wt":"weight","fl":"family"});
		if(!this.font) this.font={};
		this.adjust();
	};

	CIQ.Drawing.annotation.prototype.serialize=function(){
		var obj={
			name:this.name,
			pnl: this.panelName,
			col:this.color,
			d0:this.d0,
			tzo0:this.tzo0,
			v0:this.v0,
			text:escape(this.text)
		};
		if(this.font){
			var fnt=CIQ.removeNullValues(CIQ.replaceFields(this.font, {"style":"st","size":"sz","weight":"wt","family":"fl"}));
			if(!CIQ.isEmpty(fnt)) obj.fnt=fnt;
		}
		if(this.stem){
			obj.stem={
				"d": this.stem.d,
				"v": this.stem.v,
				"x": this.stem.x,
				"y": this.stem.y
			};
		}
		if(this.borderColor) obj.bc=this.borderColor;
		if(this.backgroundColor) obj.bg=this.backgroundColor;
		if(this.lineWidth) obj.lw=this.lineWidth;
		if(this.pattern) obj.ptrn=this.pattern;

		return obj;
	};

	CIQ.Drawing.annotation.prototype.adjust=function(){
		this.getFontString();
		var panel=this.stx.panels[this.panelName];
		if(!panel) return;
		this.setPoint(0, this.d0, this.v0, panel.chart);
		this.arr=this.text.split('\n');
		var w=0;
		this.stx.chart.context.font=this.fontString;
		//this.stx.canvasFont("stx_annotation");
		for(var i=0;i<this.arr.length;i++){
			var m=this.stx.chart.context.measureText(this.arr[i]).width;
			if(m>w) w=m;
		}
		if(w===0) w=2*this.defaultWidth;
		//this.fontSize=this.stx.getCanvasFontSize("stx_annotation");
		this.fontSize=CIQ.stripPX(this.fontDef.size);
		h=this.arr.length*this.fontSize;
		if(CIQ.touchDevice) h+=5;
		this.w=w+(this.padding*2);
		this.h=h+(this.padding*2);
		var x1=this.stx.pixelFromTick(this.p0[0], panel.chart)+w;
		var y1=this.stx.pixelFromPrice(this.p0[1], panel)+h;
		this.p1=[this.stx.tickFromPixel(x1, panel.chart), this.stx.valueFromPixel(y1, panel)];
		if(this.stem && this.stem.d){
			this.stem.t=this.stx.tickFromDate(this.stem.d, panel.chart);
		}
	};

	/**
	 * segment is an implementation of a {@link CIQ.Drawing.BaseTwoPoint} drawing.
	 * @name CIQ.Drawing.segment
	 * @constructor
	 */
	CIQ.Drawing.segment=function(){
		this.name="segment";
	};

	CIQ.Drawing.segment.ciqInheritsFrom(CIQ.Drawing.BaseTwoPoint);

	CIQ.Drawing.segment.prototype.render=function(context){
		var panel=this.stx.panels[this.panelName];
		if(!panel) return;
		var x0=this.stx.pixelFromTick(this.p0[0], panel.chart);
		var x1=this.stx.pixelFromTick(this.p1[0], panel.chart);
		var y0=this.stx.pixelFromValueAdjusted(panel, this.p0[0], this.p0[1]);
		var y1=this.stx.pixelFromValueAdjusted(panel, this.p1[0], this.p1[1]);

		var color=this.color;
		if(color=="auto" || CIQ.isTransparent(color)) color=this.stx.defaultColor;
		var width=this.lineWidth;
		if(this.highlighted){
			color=this.stx.getCanvasColor("stx_highlight_vector");
		}

		var parameters={
				pattern: this.pattern,
				lineWidth: width
		};
		this.stx.plotLine(x0, x1, y0, y1, color, this.name, context, panel, parameters);

		if(this.axisLabel && !this.highlighted){
			if(this.name=="horizontal") {
				this.stx.endClip();
				var txt=this.p0[1];
				if(panel.chart.transformFunc) txt=panel.chart.transformFunc(this.stx, panel.chart, txt);
				if(panel.yAxis.priceFormatter)
					txt=panel.yAxis.priceFormatter(this.stx, panel, txt);
				else
					txt=this.stx.formatYAxisPrice(txt, panel);
				this.stx.createYAxisLabel(panel, txt, y0, color);
				this.stx.startClip(panel.name);
			}else if(this.name=="vertical" && !CIQ.ChartEngine.hideDates()) {
				var dt, newDT;
				dt=this.stx.dateFromTick(this.p0[0], panel.chart, true);
				var milli=dt.getSeconds()*1000+dt.getMilliseconds();
				if(this.stx.dataZone){ 	// this creates a date in the right quote feed date
					newDT=new timezoneJS.Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), this.stx.dataZone);
					dt=new Date(newDT.getTime()+milli);
				}
				if(this.stx.displayZone){ // this converts from the quote feed timezone to the chart specified time zone
					newDT=new timezoneJS.Date(dt.getTime(), this.stx.displayZone);
					dt=new Date(newDT.getFullYear(), newDT.getMonth(), newDT.getDate(), newDT.getHours(), newDT.getMinutes());
					dt=new Date(dt.getTime()+milli);
				}
				
				var myDate=CIQ.mmddhhmm(CIQ.yyyymmddhhmm(dt));
				
				if(panel.chart.xAxis.formatter){
					myDate=panel.chart.xAxis.formatter(dt);
				}else if(this.stx.internationalizer){
					var str=this.stx.internationalizer.monthDay.format(dt);
					if(dt.getHours()!==0 || dt.getMinutes()!==0)
						str+=" " + this.stx.internationalizer.hourMinute.format(dt);
					myDate=str;
				}
				
				this.stx.endClip();
				this.stx.createXAxisLabel(panel, myDate, x0, color, null, true);
				this.stx.startClip(panel.name);
			}
		}
		if(this.highlighted && this.name!="horizontal" && this.name!="vertical"){
			var p0Fill=this.whichPoint=="p0"?true:false;
			var p1Fill=this.whichPoint=="p1"?true:false;
			this.littleCircle(context, x0, y0, p0Fill);
			this.littleCircle(context, x1, y1, p1Fill);
		}

	};

	CIQ.Drawing.segment.prototype.abort=function(){
		this.stx.setMeasure(null,null,null,null,false);
	};

	CIQ.Drawing.segment.prototype.intersected=function(tick, value, box){
		this.whichPoint=null;
		if(!this.p0 || !this.p1) return null; // in case invalid drawing (such as from panel that no longer exists)
		if(this.name!="horizontal" && this.name!="vertical" && this.name!="gartley"){
			if(this.pointIntersection(this.p0[0], this.p0[1], box)){
				this.whichPoint="p0";
				this.highlighted="p0";
				return {
					action: "drag",
					point: "p0"
				};
			}else if(this.pointIntersection(this.p1[0], this.p1[1], box)){
				this.highlighted="p1";
				this.whichPoint="p1";
				return {
					action: "drag",
					point: "p1"
				};
			}
		}
		var isIntersected=this.lineIntersection(tick, value, box, this.name);
		if(isIntersected){
			this.highlighted=true;
			// This object will be used for repositioning
			return {
				action: "move",
				p0: CIQ.clone(this.p0),
				p1: CIQ.clone(this.p1),
				tick: tick, // save original tick
				value: value // save original value
			};
		}else{
			return null;
		}
	};

	CIQ.Drawing.segment.prototype.copyConfig=function(){
		this.color=this.stx.currentVectorParameters.currentColor;
		this.lineWidth=this.stx.currentVectorParameters.lineWidth;
		this.pattern=this.stx.currentVectorParameters.pattern;
		if(this.pattern=="none") this.pattern="solid";
	};

	/**
	 * Reconstruct a segment
	 * @memberOf  CIQ.Drawing.segment
	 * @param  {CIQ.ChartEngine} stx The chart object
	 * @param  {object} [obj] A drawing descriptor
	 * @param {string} [obj.col] The line color
	 * @param {string} [obj.pnl] The panel name
	 * @param {string} [obj.ptrn] Optional pattern for line "solid","dotted","dashed". Defaults to solid.
	 * @param {number} [obj.lw] Optional line width. Defaults to 1.
	 * @param {number} [obj.v0] Value (price) for the first point
	 * @param {number} [obj.v1] Value (price) for the second point
	 * @param {number} [obj.d0] Date (string form) for the first point
	 * @param {number} [obj.d1] Date (string form) for the second point
	 * @param {number} [obj.tzo0] Offset of UTC from d0 in minutes
	 * @param {number} [obj.tzo1] Offset of UTC from d1 in minutes
	 */
	CIQ.Drawing.segment.prototype.reconstruct=function(stx, obj){
		this.stx=stx;
		this.color=obj.col;
		this.panelName=obj.pnl;
		this.pattern=obj.ptrn;
		this.lineWidth=obj.lw;
		this.d0=obj.d0;
		this.d1=obj.d1;
		this.tzo0=obj.tzo0;
		this.tzo1=obj.tzo1;
		this.v0=obj.v0;
		this.v1=obj.v1;
		this.adjust();
	};

	CIQ.Drawing.segment.prototype.serialize=function(){
		return {
			name:this.name,
			pnl: this.panelName,
			col:this.color,
			ptrn:this.pattern,
			lw:this.lineWidth,
			d0:this.d0,
			d1:this.d1,
			tzo0: this.tzo0,
			tzo1: this.tzo1,
			v0:this.v0,
			v1:this.v1
		};
	};


	/**
	 * Continuous line drawing tool. Creates a series of connected line segments, each one completed with a user click.
	 *
	 * It inherits its properties from {@link CIQ.Drawing.segment}.
	 * @constructor
	 * @name  CIQ.Drawing.continuous
	 */
	CIQ.Drawing.continuous=function(){
		this.name="continuous";
		this.dragToDraw=false;
		this.maxSegments=null;
	};

	CIQ.Drawing.continuous.ciqInheritsFrom(CIQ.Drawing.segment);

	CIQ.Drawing.continuous.prototype.click=function(context, tick, value){
		var panel=this.stx.panels[this.panelName];
		if(!panel) return;
		this.copyConfig();
		if(!this.penDown){
			this.setPoint(0, tick, value, panel.chart);
			this.penDown=true;
			return false;
		}
		if(this.accidentalClick(tick, value)) {
			this.stx.undo();//abort
			return true;
		}

		this.setPoint(1, tick, value, panel.chart);

		// render a segment
		var Segment=CIQ.Drawing.segment;
		var segment=new Segment();
		var obj=this.serialize(this.stx);
		segment.reconstruct(this.stx, obj);
		this.stx.addDrawing(segment);
		this.stx.changeOccurred("vector");
		this.stx.draw();
		this.segment++;

		if(this.maxSegments && this.segment>this.maxSegments) return true;
		this.setPoint(0, tick, value, panel.chart);  // reset initial point for next segment, copy by value
		return false;
	};


	/**
	 * Line drawing tool. A line is a vector defined by two points that is infinite in both directions.
	 *
	 * It inherits its properties from {@link CIQ.Drawing.segment}.
	 * @constructor
	 * @name  CIQ.Drawing.line
	 */
	CIQ.Drawing.line=function(){
		this.name="line";
	};

	CIQ.Drawing.line.prototype.dragToDraw=false;

	CIQ.Drawing.line.ciqInheritsFrom(CIQ.Drawing.segment);

	CIQ.Drawing.line.prototype.calculateOuterSet=function(panel){
		if(this.p0[0]==this.p1[0] || this.p0[1]==this.p1[1] || this.stx.isDailyInterval(this.stx.layout.interval)){
			return;
		}

		var vector={
				x0:this.p0[0],
				y0:this.p0[1],
				x1:this.p1[0],
				y1:this.p1[1]
		};
		if(vector.x0>vector.x1){
			vector={
					x0:this.p1[0],
					y0:this.p1[1],
					x1:this.p0[0],
					y1:this.p0[1]
			};
		}

		var earlier=vector.x0-1000;
		var later=vector.x1+1000;

		this.v0B=CIQ.yIntersection(vector, earlier);
		this.v1B=CIQ.yIntersection(vector, later);
		this.d0B=this.stx.dateFromTick(earlier, panel.chart);
		this.d1B=this.stx.dateFromTick(later, panel.chart);
	};

	CIQ.Drawing.line.prototype.click=function(context, tick, value){
		var panel=this.stx.panels[this.panelName];
		if(!panel) return;
		this.copyConfig();
		if(!this.penDown){
			this.setPoint(0, tick, value, panel.chart);
			this.penDown=true;
			return false;
		}
		this.setPoint(1, tick, value, panel.chart);
		this.calculateOuterSet(panel);
		this.penDown=false;
		return true;	// kernel will call render after this
	};

	/**
	 * Reconstruct a line
	 * @param  {CIQ.ChartEngine} stx The chart object
	 * @param  {object} [obj] A drawing descriptor
	 * @param {string} [obj.col] The line color
	 * @param {string} [obj.pnl] The panel name
	 * @param {string} [obj.ptrn] Optional pattern for line "solid","dotted","dashed". Defaults to solid.
	 * @param {number} [obj.lw] Optional line width. Defaults to 1.
	 * @param {number} [obj.v0] Value (price) for the first point
	 * @param {number} [obj.v1] Value (price) for the second point
	 * @param {number} [obj.d0] Date (string form) for the first point
	 * @param {number} [obj.d1] Date (string form) for the second point
	 * @param {number} [obj.v0B] Computed outer Value (price) for the first point if original drawing was on intraday but now displaying on daily
	 * @param {number} [obj.v1B] Computed outer Value (price) for the second point if original drawing was on intraday but now displaying on daily
	 * @param {number} [obj.d0B] Computed outer Date (string form) for the first point if original drawing was on intraday but now displaying on daily
	 * @param {number} [obj.d1B] Computed outer Date (string form) for the second point if original drawing was on intraday but now displaying on daily
	 * @param {number} [obj.tzo0] Offset of UTC from d0 in minutes
	 * @param {number} [obj.tzo1] Offset of UTC from d1 in minutes
	 * @memberOf CIQ.Drawing.line
	 */
	CIQ.Drawing.line.prototype.reconstruct=function(stx, obj){
		this.stx=stx;
		this.color=obj.col;
		this.panelName=obj.pnl;
		this.pattern=obj.ptrn;
		this.lineWidth=obj.lw;
		this.v0=obj.v0;
		this.v1=obj.v1;
		this.d0=obj.d0;
		this.d1=obj.d1;
		this.tzo0=obj.tzo0;
		this.tzo1=obj.tzo1;
		if(obj.d0B){
			this.d0B=obj.d0B;
			this.d1B=obj.d1B;
			this.v0B=obj.v0B;
			this.v1B=obj.v1B;
		}
		this.adjust();
	};

	CIQ.Drawing.line.prototype.serialize=function(){
		var obj={
			name:this.name,
			pnl: this.panelName,
			col:this.color,
			ptrn:this.pattern,
			lw:this.lineWidth,
			d0:this.d0,
			d1:this.d1,
			tzo0: this.tzo0,
			tzo1: this.tzo1,
			v0:this.v0,
			v1:this.v1
		};
		if(this.d0B){
			obj.d0B=this.d0B;
			obj.d1B=this.d1B;
			obj.v0B=this.v0B;
			obj.v1B=this.v1B;
		}
		return obj;
	};

	CIQ.Drawing.line.prototype.adjust=function(){
		var panel=this.stx.panels[this.panelName];
		if(!panel) return;
		this.setPoint(0, this.d0, this.v0, panel.chart);
		this.setPoint(1, this.d1, this.v1, panel.chart);
		// Use outer set if original drawing was on intraday but now displaying on daily
		if(this.stx.isDailyInterval(this.stx.layout.interval) && this.d0B){
			this.setPoint(0, this.d0B, this.v0B, panel.chart);
			this.setPoint(1, this.d1B, this.v1B, panel.chart);
		}
	};

	/**
	 * Ray drawing tool. A ray is defined by two points. It travels infinitely past the second point.
	 *
	 * It inherits its properties from {@link CIQ.Drawing.line}.
	 * @constructor
	 * @name  CIQ.Drawing.ray
	 */
	CIQ.Drawing.ray=function(){
		this.name="ray";
	};

	CIQ.Drawing.ray.ciqInheritsFrom(CIQ.Drawing.line);

	CIQ.Drawing.ray.prototype.calculateOuterSet=function(panel){
		if(this.p0[0]==this.p1[0] || this.p0[1]==this.p1[1] || this.stx.isDailyInterval(this.stx.layout.interval)){
			return;
		}

		var vector={
				x0:this.p0[0],
				y0:this.p0[1],
				x1:this.p1[0],
				y1:this.p1[1]
		};

		var endOfRay=vector.x1+1000;
		if(vector.x0>vector.x1){
			endOfRay=vector.x1-1000;
		}


		this.v0B=this.v0;
		this.v1B=CIQ.yIntersection(vector, endOfRay);
		this.d0B=this.d0;
		this.d1B=this.stx.dateFromTick(endOfRay, panel.chart);
	};

	CIQ.Drawing.ray.prototype.adjust=function(){
		var panel=this.stx.panels[this.panelName];
		if(!panel) return;
		this.setPoint(0, this.d0, this.v0, panel.chart);
		this.setPoint(1, this.d1, this.v1, panel.chart);
		// Use outer set if original drawing was on intraday but now displaying on daily
		if(this.stx.isDailyInterval(this.stx.layout.interval) && this.d0B){
			this.setPoint(1, this.d1B, this.v1B, panel.chart);
		}
	};


	/**
	 * Horizontal line drawing tool. The horizontal line extends infinitely in both directions.
	 *
	 * It inherits its properties from {@link CIQ.Drawing.segment}
	 * @constructor
	 * @name  CIQ.Drawing.horizontal
	 */
	CIQ.Drawing.horizontal=function(){
		this.name="horizontal";
	};

	CIQ.Drawing.horizontal.prototype.dragToDraw=false;

	CIQ.Drawing.horizontal.ciqInheritsFrom(CIQ.Drawing.segment);
	CIQ.Drawing.horizontal.prototype.measure=function(){};

	CIQ.Drawing.horizontal.prototype.click=function(context, tick, value){
		var panel=this.stx.panels[this.panelName];
		if(!panel) return;
		this.copyConfig();
		this.setPoint(0, tick, value, panel.chart);
		return true;	// kernel will call render after this
	};


	/**
	 * Reconstruct a horizontal
	 * @param  {CIQ.ChartEngine} stx The chart object
	 * @param  {object} [obj] A drawing descriptor
	 * @param {string} [obj.col] The line color
	 * @param {string} [obj.pnl] The panel name
	 * @param {string} [obj.ptrn] Optional pattern for line "solid","dotted","dashed". Defaults to solid.
	 * @param {number} [obj.lw] Optional line width. Defaults to 1.
	 * @param {number} [obj.v0] Value (price) for the first point
	 * @param {number} [obj.d0] Date (string form) for the first point
	 * @param {boolean} [obj.al] True to include an axis label
	 * @param {number} [obj.tzo0] Offset of UTC from d0 in minutes
	 * @memberOf CIQ.Drawing.horizontal
	 */
	CIQ.Drawing.horizontal.prototype.reconstruct=function(stx, obj){
		this.stx=stx;
		this.color=obj.col;
		this.panelName=obj.pnl;
		this.pattern=obj.ptrn;
		this.lineWidth=obj.lw;
		this.v0=obj.v0;
		this.d0=obj.d0;
		this.tzo0=obj.tzo0;
		this.axisLabel=obj.al;
		this.adjust();
	};

	CIQ.Drawing.horizontal.prototype.serialize=function(){
		var obj={
			name:this.name,
			pnl: this.panelName,
			col:this.color,
			ptrn:this.pattern,
			lw:this.lineWidth,
			v0:this.v0,
			d0:this.d0,
			tzo0:this.tzo0,
			al:this.axisLabel
		};

		return obj;
	};

	CIQ.Drawing.horizontal.prototype.adjust=function(){
		var panel=this.stx.panels[this.panelName];
		if(!panel) return;
		this.setPoint(0, this.d0, this.v0, panel.chart);
		this.p1=[this.p0[0]+100, this.p0[1]];
	};

	CIQ.Drawing.horizontal.prototype.copyConfig=function(){
		this.color=this.stx.currentVectorParameters.currentColor;
		this.lineWidth=this.stx.currentVectorParameters.lineWidth;
		this.pattern=this.stx.currentVectorParameters.pattern;
		this.axisLabel=this.stx.currentVectorParameters.axisLabel;
	};

	/**
	 * Vertical line drawing tool. The vertical line extends infinitely in both directions.
	 *
	 * It inherits its properties from {@link CIQ.Drawing.horizontal}.
	 * @constructor
	 * @name  CIQ.Drawing.vertical
	 */
	CIQ.Drawing.vertical=function(){
		this.name="vertical";
	};

	CIQ.Drawing.vertical.ciqInheritsFrom(CIQ.Drawing.horizontal);
	CIQ.Drawing.vertical.prototype.measure=function(){};

	CIQ.Drawing.vertical.prototype.adjust=function(){
		var panel=this.stx.panels[this.panelName];
		if(!panel) return;
		this.setPoint(0, this.d0, this.v0, panel.chart);
		this.p1=[this.p0[0], this.p0[1]+1];
	};



	/**
	 * Measure tool.
	 * It inherits its properties from {@link CIQ.Drawing.segment}.
	 * @constructor
	 * @name  CIQ.Drawing.measure
	 */
	CIQ.Drawing.measure=function(){
		this.name="measure";
	};

	CIQ.Drawing.measure.ciqInheritsFrom(CIQ.Drawing.segment);

	CIQ.Drawing.measure.prototype.click=function(context, tick, value){
		this.copyConfig();
		if(!this.penDown){
			this.p0=[tick,value];
			this.penDown=true;

			return false;
		}
		this.stx.undo();
		this.penDown=false;
		return true;
	};

	/**
	 * rectangle is an implementation of a {@link CIQ.Drawing.BaseTwoPoint} drawing
	 * @constructor
	 * @name  CIQ.Drawing.rectangle
	 */
	CIQ.Drawing.rectangle=function(){
		this.name="rectangle";
	};

	CIQ.Drawing.rectangle.ciqInheritsFrom(CIQ.Drawing.BaseTwoPoint);

	CIQ.Drawing.rectangle.prototype.render=function(context){
		var panel=this.stx.panels[this.panelName];
		if(!panel) return;
		var x0=this.stx.pixelFromTick(this.p0[0], panel.chart);
		var x1=this.stx.pixelFromTick(this.p1[0], panel.chart);
		var y0=this.stx.pixelFromValueAdjusted(panel, this.p0[0], this.p0[1]);
		var y1=this.stx.pixelFromValueAdjusted(panel, this.p1[0], this.p1[1]);

		var x=Math.round(Math.min(x0, x1))+0.5;
		var y=Math.min(y0, y1);
		var width=Math.max(x0,x1)-x;
		var height=Math.max(y0, y1)-y;
		var edgeColor=this.color;
		if(this.highlighted){
			edgeColor=this.stx.getCanvasColor("stx_highlight_vector");
		}

		var fillColor=this.fillColor;
		if(fillColor && !CIQ.isTransparent(fillColor) && fillColor!="auto"){
			context.beginPath();
			context.rect(x, y, width, height);
			context.fillStyle=fillColor;
			context.globalAlpha=0.2;
			context.fill();
			context.closePath();
			context.globalAlpha=1;
		}

		var parameters={
				pattern: this.pattern,
				lineWidth: this.lineWidth
		};
		if(this.highlighted && parameters.pattern=="none"){
			parameters.pattern="solid";
			if(parameters.lineWidth==0.1) parameters.lineWidth=1;
		}

		// We extend the vertical lines by .5 to account for displacement of the horizontal lines
		// HTML5 Canvas exists *between* pixels, not on pixels, so draw on .5 to get crisp lines
		this.stx.plotLine(x0, x1, y0, y0, edgeColor, "segment", context, panel, parameters);
		this.stx.plotLine(x1, x1, y0-0.5, y1+0.5, edgeColor, "segment", context, panel, parameters);
		this.stx.plotLine(x1, x0, y1, y1, edgeColor, "segment", context, panel, parameters);
		this.stx.plotLine(x0, x0, y1+0.5, y0-0.5, edgeColor, "segment", context, panel, parameters);
		if(this.highlighted){
			var p0Fill=this.whichPoint=="p0"?true:false;
			var p1Fill=this.whichPoint=="p1"?true:false;
			this.littleCircle(context, x0, y0, p0Fill);
			this.littleCircle(context, x1, y1, p1Fill);
		}
	};

	CIQ.Drawing.rectangle.prototype.intersected=function(tick, value, box){
		this.whichPoint=null;
		if(!this.p0 || !this.p1) return null; // in case invalid drawing (such as from panel that no longer exists)
		if(this.pointIntersection(this.p0[0], this.p0[1], box)){
			this.highlighted="p0";
			this.whichPoint="p0";
			return {
				action: "drag",
				point: "p0"
			};
		}else if(this.pointIntersection(this.p1[0], this.p1[1], box)){
			this.highlighted="p1";
			this.whichPoint="p1";
			return {
				action: "drag",
				point: "p1"
			};
		}
		if(this.boxIntersection(tick, value)){
			this.highlighted=true;
			return {
				action: "move",
				p0: CIQ.clone(this.p0),
				p1: CIQ.clone(this.p1),
				tick: tick,
				value: value
			};
		}
		return null;
	};

	CIQ.Drawing.rectangle.prototype.copyConfig=function(){
		this.color=this.stx.currentVectorParameters.currentColor;
		this.fillColor=this.stx.currentVectorParameters.fillColor;
		this.lineWidth=this.stx.currentVectorParameters.lineWidth;
		this.pattern=this.stx.currentVectorParameters.pattern;
	};

	/**
	 * Reconstruct an rectangle
	 * @param  {CIQ.ChartEngine} stx The chart object
	 * @param  {object} [obj] A drawing descriptor
	 * @param {string} [obj.col] The border color
	 * @param {string} [obj.fc] The fill color
	 * @param {string} [obj.pnl] The panel name
	 * @param {string} [obj.ptrn] Optional pattern for line "solid","dotted","dashed". Defaults to solid.
	 * @param {number} [obj.lw] Optional line width. Defaults to 1.
	 * @param {number} [obj.v0] Value (price) for the first point
	 * @param {number} [obj.v1] Value (price) for the second point
	 * @param {number} [obj.d0] Date (string form) for the first point
	 * @param {number} [obj.d1] Date (string form) for the second point
	 * @param {number} [obj.tzo0] Offset of UTC from d0 in minutes
	 * @param {number} [obj.tzo1] Offset of UTC from d1 in minutes
	 * @memberOf CIQ.Drawing.rectangle
	 */
	CIQ.Drawing.rectangle.prototype.reconstruct=function(stx, obj){
		this.stx=stx;
		this.color=obj.col;
		this.fillColor=obj.fc;
		this.panelName=obj.pnl;
		this.pattern=obj.ptrn;
		this.lineWidth=obj.lw;
		this.d0=obj.d0;
		this.d1=obj.d1;
		this.tzo0=obj.tzo0;
		this.tzo1=obj.tzo1;
		this.v0=obj.v0;
		this.v1=obj.v1;
		this.adjust();
	};

	CIQ.Drawing.rectangle.prototype.serialize=function(){
		return {
			name:this.name,
			pnl: this.panelName,
			col:this.color,
			fc:this.fillColor,
			ptrn:this.pattern,
			lw:this.lineWidth,
			d0:this.d0,
			d1:this.d1,
			tzo0: this.tzo0,
			tzo1: this.tzo1,
			v0:this.v0,
			v1:this.v1
		};
	};

	/**
	 * Ellipse drawing tool.
	 *
	 * It inherits its properties from {@link CIQ.Drawing.BaseTwoPoint}.
	 * @constructor
	 * @name  CIQ.Drawing.ellipse
	 */
	CIQ.Drawing.ellipse=function(){
		this.name="ellipse";
	};

	CIQ.Drawing.ellipse.ciqInheritsFrom(CIQ.Drawing.BaseTwoPoint);

	CIQ.Drawing.ellipse.prototype.render=function(context){
		var panel=this.stx.panels[this.panelName];
		if(!panel) return;
		var x0=this.stx.pixelFromTick(this.p0[0], panel.chart);
		var x1=this.stx.pixelFromTick(this.p1[0], panel.chart);
		var y0=this.stx.pixelFromValueAdjusted(panel, this.p0[0], this.p0[1]);
		var y1=this.stx.pixelFromValueAdjusted(panel, this.p1[0], this.p1[1]);


		var left=x0-(x1-x0);
		var right=x1;
		var middle=y0;
		var bottom=y1;
		var top=y0-(y1-y0);
		var weight=(bottom-top)/6;
		var lineWidth=this.lineWidth;
		if(!lineWidth) lineWidth=1.1;
		var edgeColor=this.color;
		if(edgeColor=="auto" || CIQ.isTransparent(edgeColor)) edgeColor=this.stx.defaultColor;
		if(this.highlighted){
			edgeColor=this.stx.getCanvasColor("stx_highlight_vector");
			if(lineWidth==0.1) lineWidth=1.1;
		}

		var fillColor=this.fillColor;
		
		context.beginPath();
		context.moveTo(left, middle);
		context.bezierCurveTo(left, bottom+weight, right, bottom+weight, right, middle);
		context.bezierCurveTo(right, top-weight, left, top-weight, left, middle);

		if(fillColor && !CIQ.isTransparent(fillColor) && fillColor!="auto"){
			context.fillStyle=fillColor;
			context.globalAlpha=0.2;
			context.fill();
			context.globalAlpha=1;
		}

		if(edgeColor && this.pattern!="none"){
			context.strokeStyle=edgeColor;
			context.lineWidth=lineWidth;
			if(context.setLineDash){
				var lineDashArray=[];  //array of dash, space, dash, space, etc
				if(this.pattern=="dotted") lineDashArray=[lineWidth, lineWidth];
				else if(this.pattern=="dashed") lineDashArray=[lineWidth*5, lineWidth*5];
				context.setLineDash(lineDashArray);
				context.lineDashOffset=0;  //start point in array
			}
			context.stroke();
		}
		context.closePath();
		if(this.highlighted){
			var p1Fill=this.whichPoint=="p1"?true:false;
			this.littleCircle(context, x1, y1, p1Fill);
		}
	};


	CIQ.Drawing.ellipse.prototype.intersected=function(tick, value, box){
		this.whichPoint=null;
		if(!this.p0 || !this.p1) return null; // in case invalid drawing (such as from panel that no longer exists)
		if(this.pointIntersection(this.p1[0], this.p1[1], box)){
			this.highlighted="p1";
			this.whichPoint="p1";
			return {
				action: "drag",
				point: "p1"
			};
		}
		var left=this.p0[0]-(this.p1[0]-this.p0[0]);
		var right=this.p1[0];
		var bottom=this.p1[1];
		var top=this.p0[1]-(this.p1[1]-this.p0[1]);

		if(tick>Math.max(left, right) || tick<Math.min(left, right)) return false;
		if(value>Math.max(top, bottom) || value<Math.min(top, bottom)) return false;
		this.highlighted=true;
		return {
			action: "move",
			p0: CIQ.clone(this.p0),
			p1: CIQ.clone(this.p1),
			tick: tick,
			value: value
		};
	};

	CIQ.Drawing.ellipse.prototype.copyConfig=function(){
		this.color=this.stx.currentVectorParameters.currentColor;
		this.fillColor=this.stx.currentVectorParameters.fillColor;
		this.lineWidth=this.stx.currentVectorParameters.lineWidth;
		this.pattern=this.stx.currentVectorParameters.pattern;
	};

	/**
	 * Reconstruct an ellipse
	 * @param  {CIQ.ChartEngine} stx The chart object
	 * @param  {object} [obj] A drawing descriptor
	 * @param {string} [obj.col] The border color
	 * @param {string} [obj.fc] The fill color
	 * @param {string} [obj.pnl] The panel name
	 * @param {string} [obj.ptrn] Optional pattern for line "solid","dotted","dashed". Defaults to solid.
	 * @param {number} [obj.lw] Optional line width. Defaults to 1.
	 * @param {number} [obj.v0] Value (price) for the center point
	 * @param {number} [obj.v1] Value (price) for the outside point
	 * @param {number} [obj.d0] Date (string form) for the center point
	 * @param {number} [obj.d1] Date (string form) for the outside point
	 * @param {number} [obj.tzo0] Offset of UTC from d0 in minutes
	 * @param {number} [obj.tzo1] Offset of UTC from d1 in minutes
	 * @memberOf CIQ.Drawing.ellipse
	 */
	CIQ.Drawing.ellipse.prototype.reconstruct=function(stx, obj){
		this.stx=stx;
		this.color=obj.col;
		this.fillColor=obj.fc;
		this.panelName=obj.pnl;
		this.pattern=obj.ptrn;
		this.lineWidth=obj.lw;
		this.d0=obj.d0;
		this.d1=obj.d1;
		this.tzo0=obj.tzo0;
		this.tzo1=obj.tzo1;
		this.v0=obj.v0;
		this.v1=obj.v1;
		this.adjust();
	};

	CIQ.Drawing.ellipse.prototype.serialize=function(){
		return {
			name:this.name,
			pnl: this.panelName,
			col:this.color,
			fc:this.fillColor,
			ptrn:this.pattern,
			lw:this.lineWidth,
			d0:this.d0,
			d1:this.d1,
			tzo0: this.tzo0,
			tzo1: this.tzo1,
			v0:this.v0,
			v1:this.v1
		};
	};

	/**
	 * Fibonacci drawing tool.
	 *
	 * It inherits its properties from {@link CIQ.Drawing.BaseTwoPoint}
	 * @constructor
	 * @name  CIQ.Drawing.fibonacci
	 */
	CIQ.Drawing.fibonacci=function(){
		this.name="fibonacci";
		this.configurator="fibonacci";
	};

	CIQ.Drawing.fibonacci.ciqInheritsFrom(CIQ.Drawing.BaseTwoPoint);

	CIQ.Drawing.fibonacci.mapping={
			"trend":"t",
			"color":"c",
			"parameters":"p",
			"pattern":"pt",
			"opacity":"o",
			"lineWidth":"lw",
			"level":"l",
			"extendLeft":"e",
			"printLevels":"pl",
			"printValues":"pv",
			"timezone":"tz"
	};

	CIQ.Drawing.fibonacci.prototype.copyConfig=function(){
		this.color=this.stx.currentVectorParameters.currentColor;
		this.fillColor=this.stx.currentVectorParameters.fillColor;
		this.lineWidth=this.stx.currentVectorParameters.lineWidth;
		this.parameters=this.stx.currentVectorParameters.fibonacci;
	};
	/*
	 * Calculate the outer points of the fib series, which are used to detect highlighting
	 */
	CIQ.Drawing.fibonacci.prototype.setOuter=function(){
		this.outer={
				p0: CIQ.clone(this.p0),
				p1: CIQ.clone(this.p1)
		};
		var y0=this.p0[1];
		var y1=this.p1[1];
		var x0=this.p0[0];
		var x1=this.p1[0];
		var top=Math.min(y1, y0);
		var bottom=Math.max(y1, y0);
		var height=bottom-top;
		var isUpTrend=(y1-y0)/(x1-x0)>0;

		var min=0;
		var max=1;
		for(var i=0;i<this.parameters.fibs.length;i++){
			var fib=this.parameters.fibs[i];
			if(fib.level>=min && fib.level<=max) continue;
			var val=isUpTrend?bottom-height*fib.level:top+height*fib.level;
			var x=CIQ.xIntersection({x0:x0,x1:x1,y0:y0,y1:y1}, val);
			if(fib.level<min){
				min=fib.level;
				if(isUpTrend){
					this.outer.p0[1]=val;
					this.outer.p0[0]=x;
				}else{
					this.outer.p1[1]=val;
					this.outer.p1[0]=x;
				}
			}else if(fib.level>max){
				max=fib.level;
				if(isUpTrend){
					this.outer.p1[1]=val;
					this.outer.p1[0]=x;
				}else{
					this.outer.p0[1]=val;
					this.outer.p0[0]=x;
				}
			}
		}
	};

	CIQ.Drawing.fibonacci.prototype.click=function(context, tick, value){
		var panel=this.stx.panels[this.panelName];
		if(!panel) return;
		this.copyConfig();
		if(!this.penDown){
			this.setPoint(0, tick, value, panel.chart);
			this.penDown=true;
			return false;
		}
		if(this.accidentalClick(tick, value)) return this.dragToDraw;

		this.setPoint(1, tick, value, panel.chart);
		this.setOuter();
		this.parameters=CIQ.clone(this.parameters);	// separate from the global object
		this.penDown=false;

		return true;	// kernel will call render after this
	};

	CIQ.Drawing.fibonacci.prototype.render=function(context){
		var panel=this.stx.panels[this.panelName];
		if(!panel) return;
		var yAxis=panel.yAxis;
		if(!this.p1) return;
		var max=Math.max(this.p0[1],this.p1[1]);
		var min=Math.min(this.p0[1],this.p1[1]);
		var dist=max-min;
		var x0=this.stx.pixelFromTick(this.p0[0], panel.chart);
		var x1=this.stx.pixelFromTick(this.p1[0], panel.chart);
		var y0=this.stx.pixelFromValueAdjusted(panel, this.p0[0], this.p0[1]);
		var y1=this.stx.pixelFromValueAdjusted(panel, this.p1[0], this.p1[1]);
		var top=Math.min(y1, y0);
		var bottom=Math.max(y1, y0);
		var height=bottom-top;
		var isUpTrend=(y1-y0)/(x1-x0)>0;

		var trendLineColor=this.parameters.trend.color;
		if(trendLineColor=="auto" || CIQ.isTransparent(trendLineColor)) trendLineColor=this.stx.defaultColor;
		if(this.highlighted){
			trendLineColor=this.stx.getCanvasColor("stx_highlight_vector");
		}
		context.textBaseline="middle";
		this.stx.canvasFont("stx_yaxis", context); // match font from y axis so it looks cohesive
		var w=context.measureText("161.8%").width+10;// give it extra space so it does not overlap with the price labels.
		var minX=Number.MAX_VALUE, minY=Number.MAX_VALUE, maxX=Number.MAX_VALUE*-1, maxY=Number.MAX_VALUE*-1;
		var txtColor=this.color;
		if(txtColor=="auto" || CIQ.isTransparent(txtColor)) txtColor=this.stx.defaultColor;
		for(var i=0;i<this.parameters.fibs.length;i++){
			context.textAlign="left";
			context.fillStyle=txtColor;
			var fib=this.parameters.fibs[i];
			//var y=isUpTrend?bottom-height*fib.level:top+height*fib.level;
			var y=this.stx.pixelFromValueAdjusted(panel, this.p0[0], (y1<y0)?max-dist*fib.level:min+dist*fib.level);
			var x=CIQ.xIntersection({x0:x0,x1:x1,y0:y0,y1:y1}, y);
			var nearX=this.parameters.extendLeft?0:x;
			var farX=this.stx.chart.left+this.stx.chart.width;
			if(this.parameters.printLevels){
				var txt=Math.round(fib.level*1000)/10+"%";
				farX-=w;
				if(this.parameters.printValues) {
					context.fillStyle=txtColor; // the price labels screw up the color and font size...so reset before rendering the text
					this.stx.canvasFont("stx_yaxis", context); // use the same context as the y axis so they match.
				}
				if(farX<nearX) context.textAlign="right";
				context.fillText(txt, farX, y);
				if(farX<nearX) farX+=5;
				else  farX-=5;
			}
			if(this.parameters.printValues){
				if(x<this.stx.chart.width){
					// just use the actual price that segment will render on regardless of 'isUpTrend' since the values must match the prices on the y axis, and can not be reversed.
					var price = this.stx.valueFromPixel(y,panel);
					if(yAxis.priceFormatter){
						price=yAxis.priceFormatter(this.stx, panel, price);
					}else{
						price=this.stx.formatYAxisPrice(price, panel);
					}
					if(context==this.stx.chart.context) this.stx.endClip();
					this.stx.createYAxisLabel(panel, price, y, txtColor, null, context);
					if(context==this.stx.chart.context) this.stx.startClip(panel.name);
				}
			}
			var fibColor=fib.color;
			if(fibColor=="auto" || CIQ.isTransparent(fibColor)) fibColor=this.color;
			if(fibColor=="auto" || CIQ.isTransparent(fibColor)) fibColor=this.stx.defaultColor;
			var fillColor=fib.color;
			if(fillColor=="auto" || CIQ.isTransparent(fillColor)) fillColor=this.fillColor;
			if(fillColor=="auto" || CIQ.isTransparent(fillColor)) fillColor=this.stx.defaultColor;
			context.fillStyle=fillColor;
			this.stx.plotLine(nearX, farX, y, y, fibColor, "segment", context, panel, fib.parameters);
			context.globalAlpha=0.05;
			context.beginPath();
			context.moveTo(farX,y);
			context.lineTo(nearX,y);
			if(nearX) context.lineTo(Math.max(x0,x1),isUpTrend?bottom:top);
			else context.lineTo(nearX,isUpTrend?bottom:top);
			context.lineTo(farX,isUpTrend?bottom:top);
			if( typeof fillColor!="undefined" ) context.fill(); // so legacy fibs continue to have no fill color.
			context.globalAlpha=1;
			if(y<minY){
				minX=x;
				minY=y;
			}
			if(y>maxY){
				maxX=x;
				maxY=y;
			}
		}
		// ensure we at least draw trend line from zero to 100
		for(var level in {0:0, 1:1}){
			var yy=isUpTrend?bottom-height*level:top+height*level;
			yy=Math.round(yy);
			if(yy<minY){
				minX=CIQ.xIntersection({x0:x0,x1:x1,y0:y0,y1:y1}, yy);
				minY=yy;
			}
			if(yy>maxY){
				maxX=CIQ.xIntersection({x0:x0,x1:x1,y0:y0,y1:y1}, yy);
				maxY=yy;
			}
		}
		this.stx.plotLine(minX, maxX, minY, maxY, trendLineColor, "segment", context, panel, this.parameters.trend.parameters);
		if(this.highlighted){
			var p0Fill=this.whichPoint=="p0"?true:false;
			var p1Fill=this.whichPoint=="p1"?true:false;
			this.littleCircle(context, x0, y0, p0Fill);
			this.littleCircle(context, x1, y1, p1Fill);
		}
	};

	CIQ.Drawing.fibonacci.prototype.reposition=function(context, repositioner, tick, value){
		CIQ.Drawing.BaseTwoPoint.prototype.reposition.apply(this, arguments);
		this.adjust();
	};

	CIQ.Drawing.fibonacci.prototype.intersected=function(tick, value, box){
		//TODO, find some efficient way to allow an intersection across the entire trend line, not just between the two clicked points
		if(!this.p0 || !this.p1) return null; // in case invalid drawing (such as from panel that no longer exists)
		if(CIQ.boxIntersects(box.x0, box.y0, box.x1, box.y1, this.outer.p0[0], this.outer.p0[1], this.outer.p1[0], this.outer.p1[1], "segment")){
			if(this.pointIntersection(this.p0[0], this.p0[1], box)){
				this.highlighted="p0";
				this.whichPoint="p0";
				return {
					action: "drag",
					point: "p0"
				};
			}else if(this.pointIntersection(this.p1[0], this.p1[1], box)){
				this.highlighted="p1";
				this.whichPoint="p1";
				return {
					action: "drag",
					point: "p1"
				};
			}
			// This object will be used for repositioning
			this.highlighted=true;
			return {
				action: "move",
				p0: CIQ.clone(this.p0),
				p1: CIQ.clone(this.p1),
				tick: tick, // save original tick
				value: value // save original value
			};
		}
		return null;
	};

	/**
	 * Reconstruct a fibonacci
	 * @param  {CIQ.ChartEngine} stx The chart object
	 * @param  {object} [obj] A drawing descriptor
	 * @param {string} [obj.col] The border color
	 * @param {string} [obj.fc] The fill color
	 * @param {string} [obj.pnl] The panel name
	 * @param {number} [obj.v0] Value (price) for the first point
	 * @param {number} [obj.v1] Value (price) for the second point
	 * @param {number} [obj.d0] Date (string form) for the first point
	 * @param {number} [obj.d1] Date (string form) for the second point
	 * @param {number} [obj.tzo0] Offset of UTC from d0 in minutes
	 * @param {number} [obj.tzo1] Offset of UTC from d1 in minutes
	 * @param {object} [obj.parameters] Configuration parameters
	 * @param {object} [obj.parameters.trend] Describes the trend line
	 * @param {string} [obj.parameters.trend.color] The color for the trend line (Defaults to "auto")
	 * @param {object} [obj.parameters.trend.parameters] Line description object (pattern, opacity, lineWidth)
	 * @param {array} [obj.parameters.fibs] A fib description object for each fib (level, color, parameters)
	 * @param {boolean} [obj.parameters.extendLeft] True to extend the fib lines to the left of the screen. Defaults to false.
	 * @param {boolean} [obj.parameters.printLevels] True (default) to print text for each percentage level
	 * @param {boolean} [obj.parameters.printValues] True to print text for each price level
	 * @memberOf CIQ.Drawing.fibonacci
	 */
	CIQ.Drawing.fibonacci.prototype.reconstruct=function(stx, obj){
		obj=CIQ.replaceFields(obj, CIQ.reverseObject(CIQ.Drawing.fibonacci.mapping));
		this.stx=stx;
		this.parameters=obj.parameters;
		if(!this.parameters) this.parameters=CIQ.clone(this.stx.currentVectorParameters.fibonacci);	// For legacy fibs that didn't include parameters
		this.color=obj.col;
		this.fillColor=obj.fc;
		this.panelName=obj.pnl;
		this.d0=obj.d0;
		this.d1=obj.d1;
		this.tzo0=obj.tzo0;
		this.tzo1=obj.tzo1;
		this.v0=obj.v0;
		this.v1=obj.v1;
		this.adjust();
	};

	CIQ.Drawing.fibonacci.prototype.adjust=function(){
		var panel=this.stx.panels[this.panelName];
		if(!panel) return;
		this.setPoint(0, this.d0, this.v0, panel.chart);
		this.setPoint(1, this.d1, this.v1, panel.chart);
		this.setOuter();
	};

	CIQ.Drawing.fibonacci.prototype.serialize=function(){
		var obj={
			name:this.name,
			parameters:this.parameters,
			pnl: this.panelName,
			col:this.color,
			fc:this.fillColor,
			d0:this.d0,
			d1:this.d1,
			tzo0: this.tzo0,
			tzo1: this.tzo1,
			v0:this.v0,
			v1:this.v1
		};
		return CIQ.replaceFields(obj, CIQ.Drawing.fibonacci.mapping);
	};


	/**
	 * Retracement drawing tool.
	 *
	 * It inherits its properties from {@link CIQ.Drawing.fibonacci}
	 * @constructor
	 * @name  CIQ.Drawing.retracement
	 */
	CIQ.Drawing.retracement=function(){
		this.name="retracement";
	};

	CIQ.Drawing.retracement.ciqInheritsFrom(CIQ.Drawing.fibonacci);

	return _exports;
});
