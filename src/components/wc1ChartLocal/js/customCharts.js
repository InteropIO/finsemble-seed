//-------------------------------------------------------------------------------------------
// Copyright 2012-2017 by ChartIQ, Inc.
// All rights reserved
//-------------------------------------------------------------------------------------------
(function(_exports){
	var CIQ=_exports.CIQ;

	/**
	 * Draws a generic heatmap for the chart.
	 * This function should not be called directly use {@link CIQ.Renderer.Heatmap} instead.
	 * @private
	 * @param {object} params Parameters to control the heatmap itself
	 * @param {string} params.panel The name of the panel to put the heatmap on
	 * @param {string} params.name="Data" Name of the heatmap.
	 * @param {number} params.height Height of each cell, in yaxis units.
	 * @param {number} params.widthFactor Width of each call as a percentage of the candleWidth, valid values are 0.00-1.00.
	 * @param {array} seriesParams Parameters to control color and opacity of each cell. Each array element of seriesParams is an object having the following members:
	 * @param {string} field Name of the field in the dataSet to use for the part in the stack
	 * @param {string} border_color Color to use to draw the border (null to not draw)
	 * @param {string} color Color to use to fill (null to not draw)
	 * @param {number} opacity Opacity to use to fill (0.0-1.0) or use alpha from colors
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
				if(self.chart.transformFunc && quote.transform) quote=quote.transform;
				var cellValues=quote[field];
				if(!cellValues) continue;
				if(typeof cellValues=="number") cellValues=[cellValues];
				for(var i=0;i<cellValues.length;i++){
					//var v=cellCache[cellValues[i]];
					//if(!v && v!==0) {
					var	v=self.pixelFromTransformedValue(cellValues[i], c, yAxis);
					//	cellCache[cellValues[i]]=v;
					//}
					if(!lineWidth){
						var v1=self.pixelFromTransformedValue(cellValues[i]-params.height, c, yAxis);
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
	 * This method draws either hollow or solid candles on the chart.  
	 * It is usually called in 2 passes, one for the inner part and again for the outline (border).
	 * It is highly tuned for performance.
	 * This method should rarely if ever be called directly.  
	 * Instead see {@link CIQ.ChartEngine.AdvancedInjectable#displayChart} and {@link CIQ.ChartEngine#draw}
	 * @private
	 * 
	 * @param {CIQ.ChartEngine.Panel} panel Panel object on which to draw the candles
	 * @param {function} colorFunction A function which accepts an CIQ.ChartEngine,quote, and mode as its arguments and returns the appropriate color for drawing that mode.  Returning a null will skip that bar
	 * @param {object} params Configuration parameters for the candles
	 * @param {boolean} [params.isOutline] True will draw the borders, False to draw the inside of the candle
	 * @param {boolean} [params.isHistogram] True if the candles represent a histogram, with the low set to 0
	 * @param {boolean} [params.isVolume] Set to true to indicate a volume candle chart, which has variable candle width
	 * @param {string} [params.field] Optionally set to a series field which has OHLC data stored beneath it in the dataSegment
	 * @param {CIQ.ChartEngine.YAxis} [params.yAxis=panel.yAxis] Set to specify an alternate y-axis
	 * @return {object} Data generated by the plot, such as colors used if a colorFunction was passed, and the vertices of the line (points).
	 * @memberOf CIQ.ChartEngine
	 * @since 5.1.0 introduced params argument to encompass any future flags/fields, added return object
	 */
	CIQ.ChartEngine.prototype.drawCandles=function(panel, colorFunction, params){
		var chart=panel.chart;
		if(!chart){ // backward compatibility
			chart=panel;
			panel=panel.chart;
		}
		var isOutline=false, isHistogram=false, field=null, yAxis=panel.yAxis, overlayScaling=null;
		if(params && typeof(params)=="object"){
			isOutline=params.isOutline;
			isHistogram=params.isHistogram;
			field=params.field;
			yAxis=params.yAxis;
			overlayScaling=params.overlayScaling;
		}else{
			isOutline=params;
			isHistogram=arguments[3];
		}
		var quotes=chart.dataSegment;
		var context=chart.context;
		var t=yAxis.top;
		var b=yAxis.bottom;
		var top, bottom, length;
		var yValueCache=new Array(quotes.length);

		var borderColor="transparent";
		var fillColor="transparent";
		var borderOffset=0;

		var leftTick=chart.dataSet.length - chart.scroll - 1;
		var colors={};
		var defaultWhitespace=chart.tmpWidth/2;  //for each side of the candle
		var candleWidth=this.layout.candleWidth;
		var xbase=panel.left-0.5*candleWidth+this.micropixels-1;
		for(var x=0;x<=quotes.length;x++){
			var whitespace=defaultWhitespace;
			xbase+=candleWidth/2;  //complete previous candle
			candleWidth=this.layout.candleWidth;
			xbase+=candleWidth/2;  // go to center of new candle
			var quote=quotes[x];
			if(!quote) continue;
			if(quote.projection) continue;
			if(quote.candleWidth) {
				xbase+=(quote.candleWidth-candleWidth)/2;
				candleWidth=quote.candleWidth;
				if(params.isVolume || candleWidth<chart.tmpWidth) whitespace=candleWidth/2;
			}
			if(chart.transformFunc  && yAxis==chart.panel.yAxis && quote.transform) quote=quote.transform;
			if(quote && field) quote=quote[field];
			if(!quote && quote!==0) continue;
			var Close=quote.Close, Open=quote.Open===undefined?Close:quote.Open;
			if(isHistogram && chart.defaultPlotField) Close=quote[chart.defaultPlotField];
			if(!Close && Close!==0) continue;
			if(!isHistogram && (Open==Close || Open===null) ) continue;	// Doji always drawn by shadow
			var myColor=colorFunction(this,quote,isOutline?"outline":"solid");
			if(!myColor) continue;
			if(isOutline) borderColor=myColor;
			else fillColor=myColor;
			colors[fillColor]=1;
			if(!CIQ.isTransparent(borderColor)) borderOffset=0.5;
			context.beginPath();
			context.fillStyle=fillColor;
			if(!quote.cache) quote.cache={};
			var cache=quote.cache;
			var tick=leftTick+x;
			if(tick<panel.cacheLeft || tick>panel.cacheRight || !cache.open){
				var o,c;
				if(overlayScaling){
					o=overlayScaling.bottom - ((Open-overlayScaling.min)*overlayScaling.multiplier);
					c=overlayScaling.bottom - ((Close-overlayScaling.min)*overlayScaling.multiplier);
				}else{
					o=(yAxis.semiLog?this.pixelFromTransformedValue(Open,panel,yAxis):((yAxis.high-Open)*yAxis.multiplier)+yAxis.top); // inline version of pixelFromTransformedValue() for efficiency
					c=(yAxis.semiLog?this.pixelFromTransformedValue(Close,panel,yAxis):((yAxis.high-Close)*yAxis.multiplier)+yAxis.top); // inline version of pixelFromTransformedValue() for efficiency
				}
				yValueCache[x]=c;

				top=Math.floor(isHistogram?c:Math.min(o,c))+borderOffset;
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
			var flr_xbase=Math.floor(xbase)+0.5;
			var xstart=Math.floor(flr_xbase-whitespace)+borderOffset;
			var xend=Math.round(flr_xbase+whitespace)-borderOffset;
			if(cache.open!=cache.close){
				context.rect(xstart, cache.open, Math.max(1,xend-xstart), Math.max(1,cache.close-cache.open));
			}
			if(fillColor!="transparent") context.fill();
			if(borderOffset){
				context.lineWidth=1;
				if(params.highlight) context.lineWidth*=2;
				context.strokeStyle=borderColor;
				context.stroke();
			}
		}
		var rc={
			colors: [],
			cache: yValueCache
		};
		for(var col in colors) {
			if(!params.hollow || !CIQ.equals(col,this.containerColor)){
				rc.colors.push(col);
			}
		}
		return rc;
	};


	/**
	 * This method draws the shadows (wicks) for candles on the chart.
	 * It is highly tuned for performance.
	 * This method should rarely if ever be called directly. Instead see {@link CIQ.ChartEngine.AdvancedInjectable#displayChart} and {@link CIQ.ChartEngine#draw}
	 * @private
	 * 
	 * @param  {CIQ.ChartEngine.Panel} panel		Panel on which to draw the wicks
	 * @param  {function} colorFunction	  A function which accepts an CIQ.ChartEngine,quote, and mode as its arguments and returns the appropriate color for drawing that mode.  Returning a null will skip that bar
	 * @param {object} params Configuration parameters for the shadows
	 * @param {boolean} [params.isVolume] Set to true to indicate a volume candle chart, which has variable candle width
	 * @param {string} [params.field] Optionally set to a series field which has OHLC data stored beneath it in the dataSegment
	 * @param {CIQ.ChartEngine.YAxis} [params.yAxis=panel.yAxis] Set to specify an alternate y-axis
	 * @memberOf CIQ.ChartEngine
	 * @since 5.1.0 introduced params argument to encompass any future flags/fields
	 */
	CIQ.ChartEngine.prototype.drawShadows=function(panel, colorFunction, params){
		var chart=panel.chart;
		if(!chart){ // backward compatibility
			chart=panel;
			panel=panel.chart;
		}
		var quotes=chart.dataSegment;
		var context=this.chart.context;
		context.lineWidth=1;
		if(params.highlight) context.lineWidth*=2;
		var field=params.field;
		var yAxis=params.yAxis || panel.yAxis;
		var overlayScaling=params.overlayScaling;
		var t=yAxis.top;
		var b=yAxis.bottom;
		var top, bottom;
		var leftTick=chart.dataSet.length - chart.scroll - 1;
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
			if(chart.transformFunc && yAxis==chart.panel.yAxis && quote.transform) quote=quote.transform;
			if(quote && field) quote=quote[field];
			if(!quote && quote!==0) continue;
			var Close=quote.Close, Open=quote.Open===undefined?Close:quote.Open, High=quote.High===undefined?Math.max(Close,Open):quote.High, Low=quote.Low===undefined?Math.min(Close,Open):quote.Low;
			if(!Close && Close!==0) continue;
			if(!quote.cache) quote.cache={};
			var cache=quote.cache;
			var tick=leftTick+x;
			if(tick<panel.cacheLeft || tick>panel.cacheRight || !cache.top){
				if(overlayScaling){
					top=overlayScaling.bottom - ((High-overlayScaling.min)*overlayScaling.multiplier);
					bottom=overlayScaling.bottom - ((Low-overlayScaling.min)*overlayScaling.multiplier);
				}else{
					top=(yAxis.semiLog?this.pixelFromTransformedValue(High,panel,yAxis):((yAxis.high-High)*yAxis.multiplier)+yAxis.top); // inline version of pixelFromTransformedValue() for efficiency
					bottom=(yAxis.semiLog?this.pixelFromTransformedValue(Low,panel,yAxis):((yAxis.high-Low)*yAxis.multiplier)+yAxis.top); // inline version of pixelFromTransformedValue() for efficiency
				}
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
			if(Close==Open){ // doji
				// Single dash for even
				var offset=this.offset;
				if(params.isVolume){
					offset=candleWidth/2;
				}
				var x0=xx-offset;
				var x1=xx+offset;
				var o;
				if(overlayScaling){
					o=overlayScaling.bottom - ((Close-overlayScaling.min)*overlayScaling.multiplier);
				}else{
					o=Math.floor((yAxis.semiLog?this.pixelFromTransformedValue(Close,panel,yAxis):((yAxis.high-Close)*yAxis.multiplier)+yAxis.top))+0.5; // inline version of pixelFromTransformedValue() for efficiency
				}
				if(o<=b && o>=t){
					context.moveTo(x0, o);
					context.lineTo(x1, o);
				}
			}
			if(High!=Low){
				context.moveTo(xx, cache.top);
				context.lineTo(xx, cache.bottom);
			}
			context.strokeStyle=color;
			context.stroke();
		}
	};


	/**
	 * This method draws bars on the chart. It is called by {@link CIQ.ChartEngine.AdvancedInjectable#displayChart} if a custom `colorFunction` is defined. 
	 * This method should rarely if ever be called directly. Instead see {@link CIQ.ChartEngine.AdvancedInjectable#displayChart} and {@link CIQ.ChartEngine#draw}
	 * @private
	 * 
	 * @param  {CIQ.ChartEngine.Panel} panel		Panel on which to draw the bars
	 * @param  {object} style The canvas style
	 * @param  {function} colorFunction	  A function which accepts an CIQ.ChartEngine and quote as its arguments and returns the appropriate color for drawing that mode.	Returning a null will skip that bar
	 * @param  {object} params	 Additional parameters
	 * @param  {string} [params.type]	Set to "hlc" to return a bar chart with no open tick
	 * @param {string} [params.field] Optionally set to a series field which has OHLC data stored beneath it in the dataSegment
	 * @param {CIQ.ChartEngine.YAxis} [params.yAxis=panel.yAxis] Set to specify an alternate y-axis
	 * @return {object} Data generated by the plot, such as colors used if a colorFunction was passed, and the vertices of the line (points).
	 * @memberOf CIQ.ChartEngine
	 * @since 
	 * <br>&bull; 3.0.8 Added params argument to support custom-colored_hlc bars
	 * <br>&bull; 5.1.0 Added `field` and `yAxis` params
	 */
	CIQ.ChartEngine.prototype.drawBarChart=function(panel, style, colorFunction, params){
		var chart=panel.chart;
		if(!chart){ // backward compatibility
			chart=panel;
			panel=panel.chart;
		}
		var quotes=chart.dataSegment;
		var yValueCache=new Array(quotes.length);
		var context=chart.context;
		var c=this.canvasStyle(style);
		if(c.width && parseInt(c.width,10)<=25){
			context.lineWidth=Math.max(1,CIQ.stripPX(c.width));
		}else{
			context.lineWidth=1;
		}
		if(params.highlight) context.lineWidth*=2;

		var field=params.field;
		var yAxis=params.yAxis || panel.yAxis;
		var overlayScaling=params.overlayScaling;
		var t=yAxis.top;
		var b=yAxis.bottom;
		var top, bottom, length;
		var leftTick=chart.dataSet.length - chart.scroll - 1;
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
			if(chart.transformFunc && yAxis==chart.panel.yAxis && quote.transform) quote=quote.transform;
			if(quote && field) quote=quote[field];
			if(!quote && quote!==0) continue;
			var Close=quote.Close, Open=quote.Open===undefined?Close:quote.Open, High=quote.High===undefined?Math.max(Close,Open):quote.High, Low=quote.Low===undefined?Math.min(Close,Open):quote.Low;
			if(!Close && Close!==0) continue;
			if(!quote.cache) quote.cache={};
			var cache=quote.cache;
			var tick=leftTick+x;
			if(tick<panel.cacheLeft || tick>panel.cacheRight || !cache.top){
				if(overlayScaling){
					var mult=overlayScaling.multiplier;
					var base=overlayScaling.bottom + overlayScaling.min*mult;
					top=base - High*mult;
					bottom=base - Low*mult;
					cache.open=base - Open*mult;
					cache.close=base - Close*mult;
				}else{
					top=this.pixelFromTransformedValue(High, panel, yAxis);
					bottom=this.pixelFromTransformedValue(Low, panel, yAxis);
					cache.open=(yAxis.semiLog?this.pixelFromTransformedValue(Open,panel,yAxis):((yAxis.high-Open)*yAxis.multiplier)+yAxis.top); // inline version of pixelFromTransformedValue() for efficiency
					cache.close=(yAxis.semiLog?this.pixelFromTransformedValue(Close,panel,yAxis):((yAxis.high-Close)*yAxis.multiplier)+yAxis.top); // inline version of pixelFromTransformedValue() for efficiency
				}
				yValueCache[x]=cache.close;
				length=bottom-top;
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
				cache.bottom=top+length;
			}
			var xx=Math.floor(xbase)+0.5;
			if(cache.top<b && cache.bottom>t && quote.High!=quote.Low){
				context.moveTo(xx, cache.top-voffset);
				context.lineTo(xx, cache.bottom+voffset);
			}

			if(params.type!="hlc" && cache.open>t && cache.open<b){
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

		var rc={
			colors: [],
			cache: yValueCache
		};
		for(var col in colors) {
			if(!CIQ.equals(col,this.containerColor)) rc.colors.push(col);
		}
		return rc;
	};


	/**
	 * Draws a "wave" chart. A wave chart extrapolates intraday movement from OHLC and creates 4 data points from a single
	 * candle, for instance to create a pseudo-intraday chart from daily data.
	 * This method should rarely if ever be called directly.  Use {@link CIQ.Renderer.Lines} or {@link CIQ.ChartEngine#setChartType} instead.
	 * 
	 * @param {string} panel The panel on the chart engine instance on which to draw the wave chart
	 * @param {object} params Additional parameters controlling the rendering
	 * @param {CIQ.ChartEngine.YAxis} [params.yAxis=panel.yAxis] Set to specify an alternate y-axis
	 * @param {string} [params.field] Set to a symbol to indicate a series within the dataSet to plot, rather than the main series
	 * @return {object} Data generated by the plot, such as colors used if a colorFunction was passed, and the vertices of the line (points).
	 * @memberOf CIQ.ChartEngine
	 * @example
	 *	// call it from the chart menu provided in the sample templates
	 *	<li stxToggle="stxx.setChartType('wave')">Wave</li>
	 * @since 5.1.0 added params argument, return value
	 */
	CIQ.ChartEngine.prototype.drawWaveChart=function(panel,params){
		var chart=panel.chart;
		var quotes=chart.dataSegment;
		var yValueCache=new Array(quotes.length);
		var context=chart.context;
		if(!params) params={};
		var yAxis=params.yAxis || panel.yAxis;
		var overlayScaling=params.overlayScaling;
		this.startClip(panel.name);
		context.beginPath();
		var first=false;
		var reset=false;
		var t=panel.yAxis.top;
		var b=panel.yAxis.bottom;
		var xbase=panel.left+Math.floor(-0.5*this.layout.candleWidth+this.micropixels);
		var self=this;
		function getYPixel(field){
			if(overlayScaling){
				return overlayScaling.bottom - ((field-overlayScaling.min)*overlayScaling.multiplier);				
			}
			return self.pixelFromTransformedValue(field, panel, yAxis);
		}
		for(var i=0;i<=quotes.length;i++){
			xbase+=this.layout.candleWidth;
			var quote=quotes[i];
			if(!quote) continue;
			if(quote.projection) break;
			if(chart.transformFunc && yAxis==chart.panel.yAxis && quote.transform) quote=quote.transform;
			if(quote && params.field) quote=quote[params.field];
			if(!quote && quote!==0) continue;
			var Close=quote.Close, Open=quote.Open===undefined?Close:quote.Open, High=quote.High===undefined?Math.max(Close,Open):quote.High, Low=quote.Low===undefined?Math.min(Close,Open):quote.Low;
			if(!Close && Close!==0) continue;
			var x=xbase-3*this.layout.candleWidth/8;
			var y=getYPixel(Open);
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
				var leftTick=chart.dataSet.length-chart.scroll-1;
				if(leftTick<0){
					context.moveTo(x, y);
				}else if(leftTick>=0){
					var baseline=chart.dataSet[leftTick];
					if(baseline.transform) baseline=baseline.transform;
					var y0=baseline.Close;
					y0=getYPixel(y0);
					y0=Math.min(Math.max(y0,t),b);
					context.moveTo(panel.left+(i-1)*this.layout.candleWidth + this.micropixels, y0);
					context.lineTo(x, y);
				}
				context.moveTo(x, y);
			}else{
				context.lineTo(x, y);
			}

			x+=this.layout.candleWidth/4;
			if(Open<Close){
				y=getYPixel(Low);
				if(y<t) y=t;
				if(y>b) y=b;
				context.lineTo(x, y);
				x+=this.layout.candleWidth/4;
				y=getYPixel(High);
				if(y<t) y=t;
				if(y>b) y=b;
				context.lineTo(x, y);
			}else{
				y=getYPixel(High);
				if(y<t) y=t;
				if(y>b) y=b;
				context.lineTo(x, y);
				x+=this.layout.candleWidth/4;
				y=getYPixel(Low);
				if(y<t) y=t;
				if(y>b) y=b;
				context.lineTo(x, y);
			}

			x+=this.layout.candleWidth/4;
			y=getYPixel(Close);
			yValueCache[i]=y;
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
		if(params.highlight) context.lineWidth*=2;
		this.canvasColor("stx_line_chart");
		if(params.color) context.strokeStyle=params.color;
		context.stroke();
		context.closePath();
		var rc={
			colors: [context.strokeStyle],
			cache: yValueCache
		};
		this.endClip();
		context.lineWidth=1;

		return rc;
	};


	/**
	 * Draws a scatter plot on the chart.
	 *
	 * Use CSS style stx_scatter_chart to control the scatter chart display as follows:
	 *	- color				- Optional color
	 * This method should rarely if ever be called directly.  Use {@link CIQ.Renderer.Scatter} or {@link CIQ.ChartEngine#setChartType} instead.
	 *
	 * @param  {CIQ.ChartEngine.Panel} panel The panel on which to draw
	 * @param {object} params Additional parameters controlling the rendering
	 * @param {CIQ.ChartEngine.YAxis} [params.yAxis=panel.yAxis] Set to specify an alternate y-axis
	 * @param  {string} [params.field] Set to override the field to be plotted.  Default is chart.defaultPlotField which defaults to "Close"
	 * @param  {string} [params.color] Set to override the color of the plot.
	 * @return {object} Data generated by the plot, such as colors used if a colorFunction was passed, and the vertices of the line (points).
	 * @memberOf CIQ.ChartEngine
	 * @example
	 *	// call it from the chart menu provided in the sample templates
	 *	<li stxToggle="stxx.setChartType('scatterplot')">Scatter Plot</li>
	 * @since 5.1.0 added params argument, return value
	 */
	CIQ.ChartEngine.prototype.scatter=function(panel,params){
		var chart=panel.chart;
		var quotes=chart.dataSegment;
		var yValueCache=new Array(quotes.length);
		var context=this.chart.context;
		if(!params) params={};
		var field=params.field || chart.defaultPlotField;
		var yAxis=params.yAxis || panel.yAxis;
		var overlayScaling=params.overlayScaling;
		var defaultPlotField=params.subField || chart.defaultPlotField || "Close";
		this.startClip(panel.name);
		context.beginPath();
		context.lineWidth=4;
		if(params.highlight) context.lineWidth*=2;
		var t=yAxis.top;
		var b=yAxis.bottom;
		var xbase=panel.left-0.5*this.layout.candleWidth+this.micropixels-1;
		for(var x=0;x<=quotes.length;x++){
			xbase+=this.layout.candleWidth;
			var quote=quotes[x];
			if(!quote) continue;
			if(!quote.projection){
				if(chart.transformFunc && yAxis==chart.panel.yAxis && quote.transform) quote=quote.transform;
				var scatter=quote[field];
				if(scatter && scatter[defaultPlotField]!==undefined) scatter=scatter[defaultPlotField];
				scatter=[scatter];
				if("Scatter" in quote) scatter=quote.Scatter;
				for(var i=0;i<scatter.length;i++){
					if(!scatter[i] && scatter[i]!==0) continue;
					var top;
					if(overlayScaling){
						top=overlayScaling.bottom - ((scatter[i]-overlayScaling.min)*overlayScaling.multiplier);
					}else{
						top=(yAxis.semiLog ?
								this.pixelFromTransformedValue(scatter[i],panel,yAxis) :
								((yAxis.high-scatter[i])*yAxis.multiplier)+t); // inline version of pixelFromTransformedValue() for efficiency
					}
					if(top<t) continue;
					if(top>b) continue;
					context.moveTo(xbase-2, top);
					context.lineTo(xbase+2, top);
					yValueCache[x]=top;
				}
			}
		}
		this.canvasColor("stx_scatter_chart");
		if(params.color) context.strokeStyle=params.color;
		context.stroke();
		context.closePath();
		var rc={
			colors: [context.strokeStyle],
			cache: yValueCache
		};
		this.endClip();
		context.lineWidth=1;

		return rc;
	};

	return _exports;
})/* removeIf(umd) */(typeof window !== 'undefined' ? window : global)/* endRemoveIf(umd) */;
