//-------------------------------------------------------------------------------------------
// Copyright 2012-2017 by ChartIQ, Inc.
// All rights reserved
//-------------------------------------------------------------------------------------------
(function(_exports){
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
	 *
	 * Common valid parameters for use by attachSeries.:<br>
	 * `color` - Specify the color for the line and shading in rgba, hex or by name.<br>
	 * `pattern` - Specify the pattern as an array. For instance [5,5] would be five pixels and then five empty pixels.<br>
	 * `width` - Specify the width of the line.<br>
	 *
	 * @constructor
	 * @name  CIQ.Renderer.Shading
	 * @version ChartIQ Advanced Package
	 */
	CIQ.Renderer.Shading=function(config){
		this.construct(config);
		this.beenSetup=false;
		this.errTimeout=null;
		this.params.useChartLegend=false;
		this.shading=[];
		if(this.params.type=="rangechannel") this.highLowBars=true;
	};
	CIQ.Renderer.Shading.ciqInheritsFrom(CIQ.Renderer.Lines, false);

	/**
	 * Returns a new Shading renderer if the featureList calls for it
	 * FeatureList should contain "rangechannel" (draws high and low plots and shades between)
	 * Called by {@link CIQ.Renderer.produce} to create a renderer for the main series
	 * @param {array} featureList List of rendering terms requested by the user, parsed from the chartType
	 * @param {object} [config.params] Parameters used for the series to be created, used to create the renderer
	 * @return {CIQ.Renderer.Shading} A new instance of the Shading renderer, if the featureList matches
	 * @memberof CIQ.Renderer.Shading
	 * @since 5.1.0
	 */
	CIQ.Renderer.Shading.requestNew=function(featureList, params){
		var type=null;
		for(var pt=0;pt<featureList.length;pt++){
			var pType=featureList[pt];
			if(pType=="rangechannel") type="rangechannel";
		}
		if(type===null) return null;
		
		return new CIQ.Renderer.Shading({
			params:CIQ.extend(params,{type:type})
		});
	};
	
	/**
	 * Sets the shading scheme of the renderer
	 * @param  {array} scheme single object or array of objects denoting shading
	 * @param  {string} [scheme.primary] left series for comparison; if omitted, use chart.dataSegment[i].Close
	 * @param  {string} [scheme.secondary] right series for comparison; if omitted, use first series in the seriesMap
	 * @param  {string} [scheme.color] color in hex, rgb, rgba, etc to shade between primary and secondary
	 * @param  {string} [scheme.greater] color in hex, rgb, rgba, etc to shade between primary and secondary if primary is greater in price than secondary
	 * @param  {string} [scheme.lesser] color in hex, rgb, rgba, etc to shade between primary and secondary if primary is lesser in price than secondary
	 * Note: if scheme.greater or scheme.lesser are omitted, scheme.color is used.
	 * At a bare minimum, scheme.color is required.  It is not required if scheme.greater and scheme.lesser are supplied.
	 * If scheme.primary is omitted, the shading will only occur if the series share the same axis as the chart.dataSegment[i].Close.
	 * If shading cannot occur for any reason, series lines will still be drawn.
	 * @memberOf CIQ.Renderer.Shading
	 * @example
	 * renderer.setShading([
	 * 	{primary:'ibm', secondary:'ge', greater:'green', lesser:'red'}, // switches shading based on crossover of values
	 * 	{primary:'t', secondary:'intc', color:'blue'}, // color always blue between them regardless of which is higher or lower
	 * 	{secondary:'t', color:'yellow'}, // compares masterData with the named series
	 * 	{color:'yellow'} // automatically shades between master and the first series
	 * ]);
	 * @version ChartIQ Advanced Package
	 */
	CIQ.Renderer.Shading.prototype.setShading=function(scheme){
		if(scheme.constructor!=Array){
			scheme=[scheme];
		}
		this.shading=scheme;
	};

	CIQ.Renderer.Shading.prototype.draw=function(){
		var stx=this.stx, chart=stx.panels[this.params.panel].chart;
		if(this.params.type=="rangechannel"){
			if(this.beenSetup){
				if(this.seriesParams.length>2) this.removeSeries(this.seriesParams[2].id);
			}else{
				this.beenSetup=true;
				this.params.display=this.seriesParams[0].display;
				this.params.yAxis=this.seriesParams[0].yAxis;
				var shadeColor=this.seriesParams[0].color || "auto";
				var symbol=this.seriesParams[0].symbol, prefix="";
				if(symbol) prefix=symbol+".";
				this.removeAllSeries(true);
				var name=this.params.name;
				stx.addSeries(null, {symbol:symbol, loadData:!!symbol, field:"High", renderer:"Shading", name:name, style:"stx_line_up", display:this.params.display});
				stx.addSeries(null, {symbol:symbol, loadData:!!symbol, field:"Low", renderer:"Shading", name:name, style:"stx_line_down", display:this.params.display});
				this.setShading({primary:this.seriesParams[0].id,secondary:this.seriesParams[1].id,color:shadeColor});
			}
		}
		if(!this.shading) {
			if(!this.errTimeout){
				console.log("Warning: no shading scheme set.  Use myRenderer.setShading(scheme) to set.");
				var self=this;
				this.errTimeout=setTimeout(function(){self.errTimeout=null;},10000);
			}
		}
		var seriesMap={};
		var s;
		for(s=0;s<this.seriesParams.length;s++){
			var defaultParams={};
			if(chart.series[this.seriesParams[s].id] ) { // make sure the series is still there.
				defaultParams=CIQ.clone(chart.series[this.seriesParams[s].id].parameters);
			}
			seriesMap[this.seriesParams[s].id]={
				parameters: CIQ.extend(CIQ.extend(defaultParams,this.params),this.seriesParams[s]),
				yValueCache: this.caches[this.seriesParams[s].id]
			};
		}
		stx.drawSeries(chart, seriesMap, this.params.yAxis, this);
		
		if( chart.legend && this.params.type=="rangechannel" ) {
			if (!chart.legend.colorMap) chart.legend.colorMap={};
			var display=this.params.display;
			var colors=[stx.getCanvasColor("stx_line_up"),stx.getCanvasColor("stx_line_down")];
			chart.legend.colorMap[display]={color:colors, display:display, isBase:this==stx.mainSeriesRenderer}; // add in the optional display text to send into the legendRenderer function
		}
		
		for(s in seriesMap){
			this.caches[s]=seriesMap[s].yValueCache;
		}
		
		function joinFields(series){
			var map=seriesMap[series];
			if(map){
				var fld=map.parameters.field;
				var subFld=map.parameters.subField;
				return fld+(subFld?"."+subFld:"");
			}
			return series;
		}

		for(s=0;s<this.shading.length;s++){
			var scheme=this.shading[s];
			var color=scheme.color;
			if(scheme.color=="auto") color=stx.defaultColor;
			if(!scheme.primary) scheme.primary="Close";
			if(!scheme.secondary) scheme.secondary=this.seriesParams[0].field;

			if(!scheme.secondary || !color) continue;
			else if(!seriesMap[scheme.primary] && scheme.primary!="Close") continue;
			else if(!seriesMap[scheme.secondary]) continue;
			else if(scheme.primary=="Close" && this.params.yAxis!=chart.yAxis) continue;  //don't allow shading across axes

			var topFields=joinFields(scheme.primary).split(".");
			var bottomFields=joinFields(scheme.secondary).split(".");
			var parameters={
				"topBand":topFields[0],
				"topSubBand":topFields[1],
				"topColor":scheme.greater || color,
				"topAxis":this.params.yAxis,
				"bottomBand":bottomFields[0],
				"bottomSubBand":bottomFields[1],
				"bottomColor":scheme.lesser || color,
				"bottomAxis":scheme.primary=="Close"?null:this.params.yAxis,
				"tension": this.params.tension || chart.tension,
				"opacity": 0.1
			};
			CIQ.fillIntersecting(stx, this.params.panel, parameters);
		}
	};

	/**
	 * Creates a multi-part histogram renderer where bars can be stacked one on top of the other, clustered next to each other, or overlaid over each other.
	 * 
	 * See {@link CIQ.Renderer#construct} for parameters required by all renderers
	 * @param {Object} config Config for renderer
	 * @param  {object} [config.params] Parameters to control the renderer itself
	 * @param  {boolean} [config.params.defaultBorders =false] Whether to draw a border for each bar as a whole.  Can be overridden by a border set for a series.
	 * @param  {number} [config.params.widthFactor =.8] Width of each bar as a percentage of the candleWidth. Valid values are 0.00-1.00.
	 * @param  {number} [config.params.heightPercentage =.7] The amount of vertical space to use, valid values are 0.00-1.00.
	 * @param  {boolean} [config.params.bindToYAxis =true] Set to true to bind the rendering to the y-axis and to draw it. Automatically set if params.yAxis is present.
	 * @param  {string} [config.params.subtype="overlaid"] Subtype of rendering "stacked", "clustered", "overlaid"
	 *
	 * Common valid parameters for use by attachSeries.:<br>
	 * `fill_color_up` - Color to use for up histogram bars.<br>
	 * `fill_color_down` - Color to use for down histogram bars.<br>
	 * `border_color_up` - Color to use for the border of up histogram bars.<br>
	 * `border_color_down` - Color to use for the order of down histogram bars.<br>
	 *
	 * @constructor
	 * @name  CIQ.Renderer.Histogram
	 * 	@example
		// configure the histogram display
		var params={
			name:				"Sentiment Data",
			type:				"histogram",
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
  		
	 * @version ChartIQ Advanced Package
	 */
	CIQ.Renderer.Histogram=function(config){
		this.construct(config);
		this.params.type="histogram";
		this.params.highlightable=false;
		this.barsHaveWidth=this.standaloneBars=true;
		if(this.params.yAxis) this.params.bindToYAxis=true;
	};

	CIQ.Renderer.Histogram.ciqInheritsFrom(CIQ.Renderer, false);

	CIQ.Renderer.Histogram.prototype.adjustYAxis=function(){
		if(!this.params.yAxis) return;
		this.params.yAxis.min=0;
		this.params.yAxis.highValue/=(this.params.heightPercentage || 1);
	};

	CIQ.Renderer.Histogram.prototype.draw=function(){
		this.stx.drawHistogram(CIQ.clone(this.params), this.seriesParams);
	};


	/**
	 * Creates a Heatmap renderer
	 * See {@link CIQ.Renderer#construct} for parameters required by all renderers
	 * @param {Object} config Config for renderer
	 * @param  {object} [config.params] Parameters to control the renderer itself
	 * @param  {number} [config.params.widthFactor=1] Width of each bar as a percentage of the candleWidth. Valid values are 0.00-1.00.
	 * @param  {number} [config.params.height] The amount of vertical space to use, in price units. For example, 2=>2 unit increments on yaxis.
	 * @constructor
	 * @name  CIQ.Renderer.Heatmap
	 * @version ChartIQ Advanced Package
	 */
	CIQ.Renderer.Heatmap=function(config){
		this.construct(config);
		this.params.type="heatmap";
		this.params.highlightable=false;
		this.barsHaveWidth=this.standaloneBars=true;
	};

	CIQ.Renderer.Heatmap.ciqInheritsFrom(CIQ.Renderer, false);

	CIQ.Renderer.Heatmap.prototype.draw=function(){
		this.stx.drawHeatmap(CIQ.clone(this.params), this.seriesParams);
	};

	/**
	 * Creates a Scatter plot renderer
	 * See {@link CIQ.Renderer#construct} for parameters required by all renderers
	 * @param {Object} config Config for renderer
	 * @param  {object} [config.params] Parameters to control the renderer itself
	 * @constructor
	 * @name  CIQ.Renderer.Scatter
	 * @version ChartIQ Advanced Package
	 */
	CIQ.Renderer.Scatter=function(config){
		this.construct(config);
		this.standaloneBars=this.barsHaveWidth=true;
	};

	CIQ.Renderer.Scatter.ciqInheritsFrom(CIQ.Renderer.Lines, false);

	/**
	 * Returns a new Scatter renderer if the featureList calls for it
	 * FeatureList should contain "scatter"
	 * Called by {@link CIQ.Renderer.produce} to create a renderer for the main series
	 * @param {array} featureList List of rendering terms requested by the user, parsed from the chartType
	 * @param {object} [config.params] Parameters used for the series to be created, used to create the renderer
	 * @return {CIQ.Renderer.Scatter} A new instance of the Scatter renderer, if the featureList matches
	 * @memberof CIQ.Renderer.Scatter
	 * @since 5.1.0
	 */
	CIQ.Renderer.Scatter.requestNew=function(featureList, params){
		var type=null;
		for(var pt=0;pt<featureList.length;pt++){
			var pType=featureList[pt];
			if(pType=="scatterplot") type="scatter";
		}
		if(type===null) return null;
		
		return new CIQ.Renderer.Scatter({
			params:CIQ.extend(params,{type:type})
		});	
	};

	CIQ.Renderer.Scatter.prototype.drawIndividualSeries=function(chart, parameters){
		panel=this.stx.panels[parameters.panel] || chart.panel;
		var rc={colors:[]};
		if(this.stx.scatter) rc=this.stx.scatter(panel, parameters);
		else console.warn("Error, Scatter renderer requires customChart.js");
		return rc;
	};

	return _exports;
})/* removeIf(umd) */(typeof window !== 'undefined' ? window : global)/* endRemoveIf(umd) */;
