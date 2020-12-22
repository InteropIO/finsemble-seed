//-------------------------------------------------------------------------------------------
// Copyright 2012-2016 by ChartIQ, Inc.
// All rights reserved
//-------------------------------------------------------------------------------------------

(function (definition) {
	"use strict";

	if (typeof exports === "object" && typeof module === "object") {
		module.exports = definition( require('./core/master') );
	} else if (typeof define === "function" && define.amd) {
		define(["core/master"], definition);
	} else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition(global);
	} else {
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for customCharts.js.");
	}
})(function(_exports){
	console.log("customCharts.js",_exports);
	var CIQ=_exports.CIQ;

	/**
	 * Draws a generic heatmap for the chart.
	 * This function should not be called directly unless the heatmap is ready to be drawn immediately.
	 * @param  {string} panelName The name of the panel to put the heatmap on
	 * @param  {object} params Parameters to control the heatmap itself
	 * @param  {string} params.name Name of the heatmap. Default: 'Data'
	 * @param  {number} params.height Height of each cell, in yaxis units.
	 * @param  {number} params.widthFactor Width of each call as a percentage of the candleWidth, valid values are 0.00-1.00.
	 * @param  {Array} seriesParams Parameters to control color and opacity of each cell. Each array element of seriesParams is an object having the following members:
	 * @param  {string} field Name of the field in the dataSet to use for the part in the stack
	 * @param  {string} border_color Color to use to draw the border (null to not draw)
	 * @param  {string} color Color to use to fill (null to not draw)
	 * @param  {number} opacity Opacity to use to fill (0.0-1.0) or use alpha from colors
	 * @memberOf CIQ.ChartEngine
	 * @since 2015-11-1
	 */
	CIQ.ChartEngine.prototype.drawHeatmap=function(params,seriesParams){
		if(!seriesParams || !seriesParams.length) return;
		var panelName=params.panel;
		if(!panelName) panelName="chart";
		var c=this.panels[panelName];
		if(!c) return;
		var yAxis=params.yAxis?params.yAxis:c.yAxis;
		var b=Math.floor(yAxis.bottom)+0.5;
		var t=Math.floor(yAxis.top)+0.5;

		var quotes=this.chart.dataSegment;
		this.getDefaultColor();
		if(!params.name) params.name="Data";
		if(!params.widthFactor) params.widthFactor=1;

		var offset=0.5;
		if(c.chart.tmpWidth<=1) offset=0;
		var height=null,halfHeight=null;
		var self=this;
		var lineWidth=null;
		//var cellCache={};

		function drawCells(field, color, isBorder, widthFactor, myoffset){
			context.beginPath();
			context.fillStyle=color;
			context.strokeStyle=color;
			var t=yAxis.top;
			var b=yAxis.bottom;
			var myCandleWidth=self.layout.candleWidth*widthFactor;
			var xc=Math.floor(self.pixelFromBar(0, c.chart)-self.layout.candleWidth);
			var x0,x1;
			for(var x=0;x<quotes.length;x++){
				var quote=quotes[x];
				if(!quote) continue;
				if(quote.candleWidth) {
					if(x===0) {
						xc+=self.layout.candleWidth;
					}else{
						xc+=(quote.candleWidth+myCandleWidth/widthFactor)/2;
					}
					myCandleWidth=quote.candleWidth*widthFactor;
				}else{
					xc+=self.layout.candleWidth;
				}
				x0=xc - myCandleWidth/2 + myoffset;
				x1=xc + myCandleWidth/2 - myoffset;

				if(x1-x0<2) x1=x0+1;
				if(quote.transform) quote=quote.transform;
				var cellValues=quote[field];
				if(!cellValues) continue;
				if(typeof cellValues=="number") cellValues=[cellValues];
				for(var i=0;i<cellValues.length;i++){
					//var v=cellCache[cellValues[i]];
					//if(!v && v!==0) {
					var	v=self.pixelFromPrice(cellValues[i], c, yAxis);
					//	cellCache[cellValues[i]]=v;
					//}
					if(!lineWidth){
						var v1=self.pixelFromPrice(cellValues[i]-params.height, c, yAxis);
						context.lineWidth=1;
						height=v1-v;
						halfHeight=height/2;
						lineWidth=context.lineWidth;
					}
					if(isBorder){
						var tc=v+halfHeight;
						var bc=v-halfHeight;
						context.moveTo(x0, tc);
						context.lineTo(x0, bc);
						context.lineTo(x1, bc);
						context.lineTo(x1, tc);
						context.lineTo(x0, tc);
					}else{
						context.fillRect(x0,v-halfHeight,x1-x0,height);
					}
				}
			}
			if(isBorder) context.stroke();
			context.closePath();
		}

		this.startClip(panelName);
		var context=this.chart.context;
		context.globalAlpha=params.opacity;

		for(var sp=0;sp<seriesParams.length;sp++){
			var param=seriesParams[sp];
			drawCells(param.field, param.color, null, params.widthFactor, param.border_color?offset:-offset/4);
			if(param.border_color && this.layout.candleWidth>=2){
				drawCells(param.field, param.border_color, true, params.widthFactor, offset);
			}
		}

		context.lineWidth=1;
		context.globalAlpha=1;
		this.endClip();
	};

	/**
	 * This method draws either hollow or solid candles on the chart.  It is usually called in 2 passes, one for the inner part and again for the outline (border).
	 * It is highly tuned for performance.
	 * This method should rarely if ever be called directly.
	 * @private
	 * @param  {CIQ.ChartEngine.Panel} panel		Panel object on which to draw the candles
	 * @param  {function} colorFunction	  A function which accepts an CIQ.ChartEngine,quote, and mode as its arguments and returns the appropriate color for drawing that mode.  Returning a null will skip that bar
	 * @param  {boolean} isOutline	 True will draw the borders, False to draw the inside of the candle
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.drawCandles=function(panel, colorFunction, isOutline, isHistogram){
		var chart=panel.chart;
		if(!chart){ // backward compatibility
			chart=panel;
			panel=panel.chart;
		}
		var quotes=chart.dataSegment;
		var context=this.chart.context;
		var t=panel.yAxis.top;
		var b=panel.yAxis.bottom;
		var top, bottom, length;

		var borderColor="transparent";
		var fillColor="transparent";
		var borderOffset=0;
		if(!CIQ.isTransparent(borderColor)) borderOffset=0.5;

		var leftTick=chart.dataSet.length - chart.scroll;
		var rightTick=leftTick+chart.maxTicks;
		var yAxis=panel.yAxis;
		var whitespace=chart.tmpWidth/2;  //for each side of the candle
		var candleWidth=this.layout.candleWidth;
		var xbase=panel.left-0.5*candleWidth+this.micropixels-1;
		for(var x=0;x<=quotes.length;x++){
			xbase+=candleWidth/2;  //complete previous candle
			candleWidth=this.layout.candleWidth;
			xbase+=candleWidth/2;  // go to center of new candle
			var quote=quotes[x];
			if(!quote) continue;
			if(quote.projection) continue;
			if(quote.candleWidth) {
				xbase+=(quote.candleWidth-candleWidth)/2;
				candleWidth=quote.candleWidth;
				if(this.layout.chartType=="volume_candle") whitespace=candleWidth/2;
			}
			if(!quote.Open && quote.Open!==0) continue; //null or undefined open can't draw candle
			if(!isHistogram && quote.Open==quote.Close) continue;	// Doji always drawn by shadow
			var myColor=colorFunction(this,quote,isOutline?"outline":"solid");
			if(!myColor) continue;
			if(isOutline) borderColor=myColor;
			else fillColor=myColor;
			context.beginPath();
			context.fillStyle=fillColor;
			if(quote.transform) quote=quote.transform;
			var cache=quote.cache;
			var tick=leftTick+x;
			if(tick<panel.cacheLeft || tick>panel.cacheRight || !cache.open){
				var o=(yAxis.semiLog?this.pixelFromPrice(quote.Open,panel):((yAxis.high-quote.Open)*yAxis.multiplier)+yAxis.top); // inline version of pixelFromPrice() for efficiency
				var c=(yAxis.semiLog?this.pixelFromPrice(quote.Close,panel):((yAxis.high-quote.Close)*yAxis.multiplier)+yAxis.top); // inline version of pixelFromPrice() for efficiency
				top=Math.floor(Math.min(o,c))+borderOffset;
				bottom=(isHistogram?yAxis.bottom:Math.max(o, c));
				length=Math.floor(bottom-top);
				if(top<t){
					if(top+length<t){
						cache.open=top;
						cache.close=top;
						continue;
					}
					length-=t-top;
					top=t;
				}
				if(top+length>b){
					length-=(top+length-b);
				}
				length=Math.max(length,2);
				cache.open=top;
				cache.close=cache.open+length;
			}
			if(cache.open>=b) continue;
			if(cache.close<=t) continue;
			// To avoid fuzziness, without candle borders we want to land on an even number
			// With candle borders we want to land on .5 so we add the borderOffset
			// But with candle borders the borderOffset makes it slightly wider so we make the width 1 pixel less
			flr_xbase=Math.floor(xbase)+0.5;
			var xstart=Math.floor(flr_xbase-whitespace)+borderOffset;
			var xend=Math.round(flr_xbase+whitespace)-borderOffset;
			if(cache.open!=cache.close){
				context.moveTo(xstart, cache.open);
				context.lineTo(xend, cache.open);
				context.lineTo(xend, cache.close);
				context.lineTo(xstart, cache.close);
				context.lineTo(xstart, cache.open);
			}
			if(fillColor!="transparent") context.fill();
			if(borderOffset){
				context.lineWidth=1;
				context.strokeStyle=borderColor;
				context.stroke();
			}
		}
	};


	/**
	 * This method draws the shadows (wicks) for candles on the chart.
	 * It is highly tuned for performance.
	 * This method should rarely if ever be called directly.
	 * @private
	 * @param  {CIQ.ChartEngine.Panel} panel		Panel on which to draw the wicks
	 * @param  {function} colorFunction	  A function which accepts an CIQ.ChartEngine,quote, and mode as its arguments and returns the appropriate color for drawing that mode.  Returning a null will skip that bar
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.drawShadows=function(panel, colorFunction){
		var chart=panel.chart;
		if(!chart){ // backward compatibility
			chart=panel;
			panel=panel.chart;
		}
		var quotes=chart.dataSegment;
		var context=this.chart.context;
		context.lineWidth=1;
		var t=panel.yAxis.top;
		var b=panel.yAxis.bottom;
		var top, bottom, left;
		var leftTick=chart.dataSet.length - chart.scroll;
		var rightTick=leftTick+chart.maxTicks;
		var yAxis=panel.yAxis;
		//var centerOffset=chart.tmpWidth/2;
		var candleWidth=this.layout.candleWidth;
		var xbase=panel.left-0.5*candleWidth+this.micropixels-1;
		for(var x=0;x<=quotes.length;x++){
			xbase+=candleWidth/2;  //complete previous candle
			candleWidth=this.layout.candleWidth;
			xbase+=candleWidth/2;  // go to center of new candle
			var quote=quotes[x];
			if(!quote) continue;
			if(quote.projection) continue;
			if(quote.candleWidth) {
				xbase+=(quote.candleWidth-candleWidth)/2;
				candleWidth=quote.candleWidth;
			}
			var color=colorFunction(this,quote,"shadow");
			if(!color) continue;
			if(quote.transform) quote=quote.transform;
			var cache=quote.cache;
			var tick=leftTick+x;
			if(tick<panel.cacheLeft || tick>panel.cacheRight || !cache.top){
				top=(yAxis.semiLog?this.pixelFromPrice(quote.High,panel):((yAxis.high-quote.High)*yAxis.multiplier)+yAxis.top); // inline version of pixelFromPrice() for efficiency
				bottom=(yAxis.semiLog?this.pixelFromPrice(quote.Low,panel):((yAxis.high-quote.Low)*yAxis.multiplier)+yAxis.top); // inline version of pixelFromPrice() for efficiency
				var length=bottom-top;
				if(top<t){
					if(top+length<t){
						cache.top=top;
						cache.bottom=top;
						continue;
					}
					length-=t-top;
					top=t;
				}
				if(top+length>b){
					length-=(top+length-b);
				}
				cache.top=top;
				cache.bottom=cache.top+length;
			}

			if(cache.top>=b) continue;
			if(cache.bottom<=t) continue;
			var xx=Math.floor(xbase)+0.5;
			context.beginPath();
			context.moveTo(xx, cache.top);
			context.lineTo(xx, cache.bottom);
			if(quote.Open==quote.Close || (!quote.Open && quote.Open!==0)){ // doji, or null value for open
				// Single dash for even
				var offset=this.offset;
				if(this.layout.chartType=="volume_candle"){
					offset=candleWidth/2;
				}
				var x0=xx-offset;
				var x1=xx+offset;
				var o=Math.floor((yAxis.semiLog?this.pixelFromPrice(quote.Close,panel):((yAxis.high-quote.Close)*yAxis.multiplier)+yAxis.top))+0.5; // inline version of pixelFromPrice() for efficiency
				if(o<=b && o>=t){
					context.moveTo(x0, o);
					context.lineTo(x1, o);
				}
			}
			context.strokeStyle=color;
			context.stroke();
		}
	};


	/**
	 * This method draws bars on the chart.
	 * It is highly tuned for performance.
	 * This method should rarely if ever be called directly.
	 * @private
	 * @param  {CIQ.ChartEngine.Panel} panel		Panel on which to draw the bars
	 * @param  {function} colorFunction	  A function which accepts an CIQ.ChartEngine and quote as its arguments and returns the appropriate color for drawing that mode.	Returning a null will skip that bar
	 * @return {object} Colors used in the plot (as the keys of the object)
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.drawBarChart=function(panel, style, colorFunction){
		var chart=panel.chart;
		if(!chart){ // backward compatibility
			chart=panel;
			panel=panel.chart;
		}			var quotes=chart.dataSegment;
		var context=chart.context;
		var c=this.canvasStyle(style);
		if(c.width && parseInt(c.width,10)<=25){
			context.lineWidth=Math.max(1,CIQ.stripPX(c.width));
		}else{
			context.lineWidth=1;
		}
		var t=panel.yAxis.top;
		var b=panel.yAxis.bottom;
		var top, bottom, length;
		var leftTick=chart.dataSet.length - chart.scroll;
		var rightTick=leftTick+chart.maxTicks;
		var yAxis=panel.yAxis;
		var colors={};
		var hlen=chart.tmpWidth/2;
		var voffset=context.lineWidth/2;
		var candleWidth=this.layout.candleWidth;
		var xbase=panel.left-0.5*candleWidth+this.micropixels-1;
		for(var x=0;x<=quotes.length;x++){
			xbase+=candleWidth/2;  //complete previous candle
			candleWidth=this.layout.candleWidth;
			xbase+=candleWidth/2;  // go to center of new candle
			var quote=quotes[x];
			if(!quote) continue;
			if(quote.projection) break;
			if(quote.candleWidth) {
				xbase+=(quote.candleWidth-candleWidth)/2;
				candleWidth=quote.candleWidth;
			}
			var color=colorFunction(this,quote);
			if(!color) continue;
			colors[color]=1;
			context.strokeStyle=color;
			context.beginPath();
			if(quote.transform) quote=quote.transform;
			var cache=quote.cache;
			var tick=leftTick+x;
			if(tick<panel.cacheLeft || tick>panel.cacheRight || !cache.top){
				top=this.pixelFromPrice(quote.High, panel);
				bottom=this.pixelFromPrice(quote.Low, panel);
				length=bottom-top;
				cache.open=(yAxis.semiLog?this.pixelFromPrice(quote.Open,panel):((yAxis.high-quote.Open)*yAxis.multiplier)+yAxis.top); // inline version of pixelFromPrice() for efficiency
				cache.close=(yAxis.semiLog?this.pixelFromPrice(quote.Close,panel):((yAxis.high-quote.Close)*yAxis.multiplier)+yAxis.top); // inline version of pixelFromPrice() for efficiency
				//cache.open=this.pixelFromPrice(quote.Open, panel);
				//cache.close=this.pixelFromPrice(quote.Close, panel);
				if(top<t){
					if(top+length<t){
						cache.top=top;
						cache.bottom=top;
						continue;
					}
					length-=t-top;
					top=t;
				}
				if(top+length>b){
					length-=(top+length-b);
				}
				//length=Math.max(length,2);
				cache.top=top;
				cache.bottom=top+length;
			}
			var xx=Math.floor(xbase)+0.5;
			if(cache.top<b && cache.bottom>t){
				context.moveTo(xx, cache.top-voffset);
				context.lineTo(xx, cache.bottom+voffset);
			}

			if(cache.open>t && cache.open<b){
				context.moveTo(xx, cache.open);
				context.lineTo(xx-hlen, cache.open);
			}
			if(cache.close>t && cache.close<b){
				context.moveTo(xx, cache.close);
				context.lineTo(xx+hlen, cache.close);
			}
			context.stroke();
		}
		context.lineWidth=1;
		return colors;
	};


	/**
	 * Draws a "wave" chart. A wave chart extrapolates intraday movement from OHLC and creates 4 data points from a single
	 * candle, for instance to create a pseudo-intraday chart from daily data.
	 * @param  {CIQ.ChartEngine.Chart} chart The chart on which to draw the wave chart
	 * @memberOf CIQ.ChartEngine
	 * @example
	 *	// call it from the chart menu provided in the sampe templates
	 *	<li stxToggle="stxx.setChartType('wave')">Wave</li>
	 */
	CIQ.ChartEngine.prototype.drawWaveChart=function(panel){
		var chart=panel.chart;
		var quotes=chart.dataSegment;
		var context=this.chart.context;
		this.startClip(panel.name);
		context.beginPath();
		var first=false;
		var reset=false;
		var t=panel.yAxis.top;
		var b=panel.yAxis.bottom;
		var xbase=panel.left+Math.floor(-0.5*this.layout.candleWidth+this.micropixels);
		for(var i=0;i<=quotes.length;i++){
			xbase+=this.layout.candleWidth;
			var quote=quotes[i];
			if(!quote) continue;
			if(quote.projection) break;
			if(quote.transform) quote=quote.transform;
			var x=xbase-3*this.layout.candleWidth/8;
			var y=this.pixelFromPrice(quote.Open, panel);
			if(y<t){
				y=t;
				if(reset){
					context.moveTo(x,y);
					continue;
				}
				reset=true;
			}else if(y>b){
				y=b;
				if(reset){
					context.moveTo(x,y);
					continue;
				}
				reset=true;
			}else{
				reset=false;
			}
			if(!first){
				first=true;
				var leftTick=chart.dataSet.length-chart.scroll;
				if(leftTick<=0){
					context.moveTo(x, y);
				}else if(leftTick>0){
					var baseline=chart.dataSet[leftTick-1];
					if(baseline.transform) baseline=baseline.transform;
					var y0=baseline.Close;
					y0=(panel.yAxis.semiLog?this.pixelFromPrice(y0,panel):((panel.yAxis.high-y0)*panel.yAxis.multiplier)+t);
					y0=Math.min(Math.max(y0,t),b);
					context.moveTo(panel.left+(i-1)*this.layout.candleWidth + this.micropixels, y0);
					context.lineTo(x, y);
				}
				context.moveTo(x, y);
			}else{
				context.lineTo(x, y);
			}

			x+=this.layout.candleWidth/4;
			if(quote.Open<quote.Close){
				y=this.pixelFromPrice(quote.Low, panel);
				if(y<t) y=t;
				if(y>b) y=b;
				context.lineTo(x, y);
				x+=this.layout.candleWidth/4;
				y=this.pixelFromPrice(quote.High, panel);
				if(y<t) y=t;
				if(y>b) y=b;
				context.lineTo(x, y);
			}else{
				y=this.pixelFromPrice(quote.High, panel);
				if(y<t) y=t;
				if(y>b) y=b;
				context.lineTo(x, y);
				x+=this.layout.candleWidth/4;
				y=this.pixelFromPrice(quote.Low, panel);
				if(y<t) y=t;
				if(y>b) y=b;
				context.lineTo(x, y);
			}

			x+=this.layout.candleWidth/4;
			y=this.pixelFromPrice(quote.Close, panel);
			if(y<t) y=t;
			if(y>b) y=b;
			context.lineTo(x, y);
		}
		var c=this.canvasStyle("stx_line_chart");
		if(c.width && parseInt(c.width,10)<=25){
			context.lineWidth=Math.max(1,CIQ.stripPX(c.width));
		}else{
			context.lineWidth=1;
		}
		this.canvasColor("stx_line_chart");
		context.stroke();
		context.closePath();
		this.endClip();
		context.lineWidth=1;
	};


	/**
	 * Draws a scatter plot on the chart.
	 *
	 * Use CSS style stx_scatter_chart to control the scatter chart display as follows:
	 *	- color				- Optional color
	 *
	 * @private
	 * @param  {CIQ.ChartEngine.Panel} panel The panel on which to draw
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.scatter=function(panel){
		var chart=panel.chart;
		var quotes=chart.dataSegment;
		var context=this.chart.context;
		context.beginPath();
		context.lineWidth=4;
		var t=panel.yAxis.top;
		var b=panel.yAxis.bottom;
		var xbase=panel.left-0.5*this.layout.candleWidth+this.micropixels-1;
		for(var x=0;x<=quotes.length;x++){
			xbase+=this.layout.candleWidth;
			var quote=quotes[x];
			if(!quote) continue;
			if(!quote.projection){
				if(quote.transform) quote=quote.transform;
				var scatter=[quote.Close];
				if("Scatter" in quote) scatter=quote.Scatter;
				for(var i=0;i<scatter.length;i++){
					var top=this.pixelFromPrice(scatter[i], panel);
					if(top<t) continue;
					if(top>b) continue;
					context.moveTo(xbase-2, top);
					context.lineTo(xbase+2, top);
				}
			}
		}
		this.canvasColor("stx_scatter_chart");
		context.stroke();
		context.closePath();
		context.lineWidth=1;
	};

	return _exports;
});