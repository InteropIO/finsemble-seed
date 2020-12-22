//-------------------------------------------------------------------------------------------
// Copyright 2012-2016 by ChartIQ, Inc.
// All rights reserved
//-------------------------------------------------------------------------------------------

(function (definition) {
	"use strict";

	if (typeof exports === "object" && typeof module === "object") {
		module.exports = definition( require('../core/master') );
	} else if (typeof define === "function" && define.amd) {
		define(["core/master"], definition);
	} else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition(global);
	} else {
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for renderers.js.");
	}
})(function(_exports){
	var CIQ=_exports.CIQ;

	/**
	 * Creates a Shading renderer
	 * This is just like Lines renderer except it will allow shading between lines.
	 * Note: by default the renderer will display lines as underlays. As such, they will appear below the chart ticks and any other studies or drawings.
	 *
	 * See {@link CIQ.Renderer#construct} for parameters required by all renderers
	 * @param {Object} config Config for renderer
	 * @param  {object} [config.params] Parameters to control the renderer itself
	 * @param  {number} [config.params.width] Width of the rendered line
	 * @constructor
	 * @name  CIQ.Renderer.Shading
	 */
	CIQ.Renderer.Shading=function(config){
		this.construct(config);
		this.shading=null;
		this.errTimeout=null;
	};
	CIQ.Renderer.Shading.ciqInheritsFrom(CIQ.Renderer.Lines, false);

	/**
	 * Sets the shading scheme of the renderer
	 * @param  {array} scheme single object or array of objects denoting shading
	 * @param  {String} [scheme.primary] left series for comparison; if omitted, use chart.dataSegment[i].Close
	 * @param  {String} [scheme.secondary] right series for comparison; if omitted, use first series in the seriesMap
	 * @param  {String} [scheme.color] color in hex, rgb, rgba, etc to shade between primary and secondary
	 * @param  {String} [scheme.greater] color in hex, rgb, rgba, etc to shade between primary and secondary if primary is greater in price than secondary
	 * @param  {String} [scheme.lesser] color in hex, rgb, rgba, etc to shade between primary and secondary if primary is lesser in price than secondary
	 * Note: if scheme.greater or scheme.lesser are omitted, scheme.color is used.
	 * At a bare minimum, scheme.color is required.  It is not required if scheme.greater and scheme.lesser are supplied.
	 * If scheme.primary is omitted, the shading will only occur if the series share the same axis as the chart.dataSegment[i].Close.
	 * If shading cannot occur for any reason, series lines will still be drawn.
	 * @memberOf  CIQ.Renderer.Shading
	 * @example
	 * renderer.setShading([
	 * 	{primary:'ibm', secondary:'ge', greater:'green', lesser:'red'}, // switches shading based on crossover of values
	 * 	{primary:'t', secondary:'intc', color:'blue'}, // color always blue between them regardless of which is higher or lower
	 * 	{secondary:'t', color:'yellow'}, // compares masterData with the named series
	 * 	{color:'yellow'} // automatically shades between master and the first series
	 * ]);
	 */
	CIQ.Renderer.Shading.prototype.setShading=function(scheme){
		if(scheme.constructor!=Array){
			scheme=[scheme];
		}
		this.shading=scheme;
	};

	CIQ.Renderer.Shading.prototype.draw=function(){
		if(!this.shading) {
			if(!this.errTimeout){
				console.log("Warning: no shading scheme set.  Use myRenderer.setShading(scheme) to set.");
				var self=this;
				this.errTimeout=setTimeout(function(){self.errTimeout=null;},10000);
			}
		}
		var chart=this.stx.panels[this.params.panel].chart;
		var seriesMap={};
		var s;
		for(s=0;s<this.seriesParams.length;s++){
			if(chart.series[this.seriesParams[s].field] ) { // make sure the series is still there.
				var defaultParams=CIQ.clone(chart.series[this.seriesParams[s].field].parameters);
				seriesMap[this.seriesParams[s].field]={
						parameters: CIQ.extend(CIQ.extend(defaultParams,this.params),this.seriesParams[s]),
						yValueCache: this.caches[this.seriesParams[s].field],
						useChartLegend: false
				};
			}
		}
		this.stx.drawSeries(chart,seriesMap, this.params.yAxis);
		for(s in seriesMap){
			this.caches[s]=seriesMap[s].yValueCache;
		}
		for(s=0;s<this.shading.length;s++){
			var scheme=this.shading[s];
			if(!scheme.greater) scheme.greater=scheme.color;
			if(!scheme.lesser) scheme.lesser=scheme.color;
			if(!scheme.primary) scheme.primary="Close";
			if(!scheme.secondary) scheme.secondary=this.seriesParams[0].field;
			
			if(!scheme.secondary || !scheme.greater || !scheme.lesser) continue;
			else if(!seriesMap[scheme.primary] && scheme.primary!="Close") continue;
			else if(!seriesMap[scheme.secondary]) continue;
			else if(scheme.primary=="Close" && this.params.yAxis!=chart.yAxis) continue;  //don't allow shading across axes
			
			var sd={
				panel:this.params.panel,
				outputs:{"topBand":scheme.greater,"bottomBand":scheme.lesser},				
				outputMap:{}
			};
			sd.outputMap[scheme.primary]="topBand";
			sd.outputMap[scheme.secondary]="bottomBand";
			var parameters={
				"topBand":scheme.primary,
				"topAxis":this.params.yAxis,
				"bottomBand":scheme.secondary,
				"bottomAxis":scheme.primary=="Close"?null:this.params.yAxis
			};
			CIQ.fillIntersecting(this.stx, sd, chart.dataSegment, parameters);
		}
	};

	/**
	 * Creates a Histogram renderer
	 * See {@link CIQ.Renderer#construct} for parameters required by all renderers
	 * @param {Object} config Config for renderer
	 * @param  {object} [config.params] Parameters to control the renderer itself
	 * @param  {boolean} [config.params.defaultBorders] Whether to draw a border for each bar as a whole.  Can be overridden by a border set for a series.  Default: false.
	 * @param  {number} [config.params.widthFactor] Width of each bar as a percentage of the candleWidth. Valid values are 0.00-1.00. Default: .8
	 * @param  {number} [config.params.heightPercentage] The amount of vertical space to use, valid values are 0.00-1.00. Default: .7
	 * @param  {boolean} [config.params.bindToYAxis] Set to true to bind the rendering to the y-axis and to draw it. Automatically set if params.yAxis is present.
	 * @param  {string} [config.params.subtype="overlaid"] Subtype of rendering "stacked", "clustered", "overlaid"
	 * @constructor
	 * @name  CIQ.Renderer.Histogram
	 * 	@example
		    var axis2=new CIQ.ChartEngine.YAxis();
		    axis2.position="left";

			// configure the histogram display
			var params={
				yAxis: axis2,
				name:				"Sentiment Data",
				type:				"histogram",
				subtype:			"stacked",
				heightPercentage:	.7,	 // how high to go. 1 = 100%
				opacity:			.7,  // only needed if supporting IE8, otherwise can use rgba values in histMap instead
				widthFactor:		.8	 // to control space between bars. 1 = no space in between
			};

		 	//legend creation callback
			function histogramLegend(colors){
		        stxx.chart.legendRenderer(stxx,{legendColorMap:colors, coordinates:{x:260, y:stxx.panels["chart"].yAxis.top+30}, noBase:true});
		    }

				histRenderer=stxx.setSeriesRenderer(new CIQ.Renderer.Histogram({params: params, callback: histogramLegend}));

			stxx.addSeries("^NIOALL", {display:"Symbol 1",data:{useDefaultQuoteFeed:true}});
			stxx.addSeries("^NIOAFN", {display:"Symbol 2",data:{useDefaultQuoteFeed:true}});
			stxx.addSeries("^NIOAMD", {display:"Symbol 3",data:{useDefaultQuoteFeed:true}});

      		histRenderer.removeAllSeries()
			.attachSeries("^NIOALL","#6B9CF7")
			.attachSeries("^NIOAFN","#95B7F6")
			.attachSeries("^NIOAMD","#B9D0F5")
			.ready();  //use ready() to immediately draw the histogram
	 *
	 * @example
		// this is an example on how completely remove a renderer and all associated data. This should only be necessary if you are also removing the chart itself
		// remove all series from the renderer including series data from the masterData
  		renderer.removeAllSeries(true);
  		// detach the series renderer from the chart.
  		stxx.removeSeriesRenderer(renderer);
  		// delete the renderer itself.
  		delete renderer;
	 */
	CIQ.Renderer.Histogram=function(config){
		this.construct(config);
		this.params.type="histogram";
		this.params.highlightable=false;
	};

	CIQ.Renderer.Histogram.ciqInheritsFrom(CIQ.Renderer, false);
	CIQ.Renderer.Histogram.prototype.performCalculations=function(){
		if(this.params.yAxis){
			var panel=this.stx.panels[this.params.panel];
			var fields=[];
			for(var i=0;i<this.seriesParams.length;i++){
				fields.push(this.seriesParams[i].field);
			}
			var minMax=this.stx.determineMinMax(this.stx.chart.dataSegment, fields, this.params.subtype=="stacked", true);
			this.stx.calculateYAxisRange(panel, this.params.yAxis, 0, minMax[1]);
			var heightPercentage=this.params.heightPercentage?this.params.heightPercentage:1;
			this.params.yAxis.high=minMax[1]/this.params.heightPercentage;
			this.params.yAxis.min=0; // So that zoom doesn't pull negative numbers in
			this.params.bindToYAxis=true;
		}
	};

	CIQ.Renderer.Histogram.prototype.draw=function(){
		this.stx.drawHistogram(CIQ.clone(this.params), this.seriesParams);
	};


	/**
	 * Creates a Heatmap renderer
	 * See {@link CIQ.Renderer#construct} for parameters required by all renderers
	 * @param {Object} config Config for renderer
	 * @param  {object} [config.params] Parameters to control the renderer itself
	 * @param  {number} [config.params.widthFactor] Width of each bar as a percentage of the candleWidth. Valid values are 0.00-1.00. Default: 1
	 * @param  {number} [config.params.height] The amount of vertical space to use, in price units. For example, 2=>2 unit increments on yaxis.
	 * @constructor
	 * @name  CIQ.Renderer.Heatmap
	 */
	CIQ.Renderer.Heatmap=function(config){
		this.construct(config);
		this.params.type="heatmap";
		this.params.highlightable=false;
	};

	CIQ.Renderer.Heatmap.ciqInheritsFrom(CIQ.Renderer, false);
	CIQ.Renderer.Heatmap.prototype.performCalculations=function(){
		var panel=this.stx.panels[this.params.panel];
		var yAxis=this.params.yAxis?this.params.yAxis:panel.yAxis;
		var fields=[];
		for(var i=0;i<this.seriesParams.length;i++){
			fields.push(this.seriesParams[i].field);
		}
		var minMax=this.stx.determineMinMax(this.stx.chart.dataSegment, fields, false, true);
		if(this.params.yAxis){
			this.stx.calculateYAxisRange(panel, yAxis, minMax[0], minMax[1]);
		}else if(this.params.panel==this.stx.chart.panel.name){
			this.stx.chart.lowValue=Math.min(this.stx.chart.lowValue, minMax[0]);
			this.stx.chart.highValue=Math.max(this.stx.chart.highValue, minMax[1]);
		}else{
			this.stx.calculateYAxisRange(panel, yAxis, minMax[0], minMax[1]);
			panel.lowValue=panel.yAxis.low;
			panel.highValue=panel.yAxis.high;
		}
	};

	CIQ.Renderer.Heatmap.prototype.draw=function(){
		this.stx.drawHeatmap(CIQ.clone(this.params), this.seriesParams);
	};

	return _exports;
});