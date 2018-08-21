//-------------------------------------------------------------------------------------------
// Copyright 2012-2018 by ChartIQ, Inc.
// All rights reserved
//-------------------------------------------------------------------------------------------
// @jscrambler DEFINE

/*
	Market Depth
	===============
	Supports the Market Depth renderer as well as the market depth add on.
*/

(function (definition) {
	"use strict";

	if (typeof exports === "object" && typeof module === "object") {
		module.exports = definition(require('./chartiq'));
	} else if (typeof define === "function" && define.amd) {
		define(['chartiq'], definition);
	} else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition(global);
	} else {
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for cryptoiq/marketdepth.js.");
	}
})(function(_exports){
	var CIQ=_exports.CIQ;
	var splinePlotter=_exports.SplinePlotter;

	/**
	 * Draws a market depth chart.
	 * 
	 * This method should rarely if ever be called directly.  Use {@link CIQ.Renderer.MarketDepth} or {@link CIQ.ChartEngine#setChartType} instead.
	 * 
	 * **Requires [cryptoIQ]{@link CIQ.MarketDepth} pugin. See {@link CIQ.ChartEngine#updateCurrentMarketData} for data requirements**
	 * 
	 * Default colors for this renderer, when used as a basic chart type, are set by CSS style `stx_marketdepth_chart`.
	 * Example:
	 * ```
	 *	.stx_marketdepth_chart {
	 *		border-top-style: solid;  <-- mountain peak pattern
	 *		color: inherit;  <-- mid price color
	 *		font: bold 28px Roboto, Helvetica, sans-serif;  <-- mid price font
	 *		width: 3px;  <-- mountain peak width
	 *	}
	 *	.stx_marketdepth_chart.bid {
	 *		background-color: #8cc176;  <--  base of mountain
	 *		border-top-color: #8cc176;  <--  peak of mountain
	 *		border-bottom-color: transparent;  <--  border of volume bars
	 *		color: #8cc176;  <--  fill of volume bars
	 *	}
	 *	.stx_marketdepth_chart.ask {
	 *		background-color: #b82c0c;  <--  base of mountain
	 *		border-top-color: #b82c0c;  <-- peak of mountain
	 *		border-bottom-color: transparent;  <--  border of volume bars
	 *		color: #b82c0c;  <--  fill of volume bars
	 *	}
	 *
	 *```
	 * where xxx is the bottom (base) of the gradient fill, yyy is the bid color, and zzz is the ask color.
	 * 
	 * Visual Reference: Default<br>
	 * ![marketdepth](img-marketdepth.png "marketdepth")
	 *
	 * Visual Reference: mountain<br>
	 * ![mountain_marketdepth](img-mountain_marketdepth.png "mountain_marketdepth")
	 *
	 * Visual Reference: mountain_volume<br>
	 * ![mountain_volume_marketdepth](img-mountain_volume_marketdepth.png "mountain_volume_marketdepth")
	 *
	 * @param  {object} params Rendering parameters
	 * @param  {boolean} [params.mountain] True to shade beneath the bid and ask lines
	 * @param  {boolean} [params.volume] True to show volume as a histogram
	 * @param  {boolean} [params.step] True to draw the bid and ask lines as steps
	 * @param  {number} [params.tension] A numeric value between 0 and 1 to draw the bid and ask lines as splines
	 * @param  {string} [params.bidColor] Color of Bid line
	 * @param  {string} [params.askColor] Color of Ask line
	 * @param  {string} [params.baseColor] Color of base of mountain below bid/ask
	 * @param  {CIQ.ChartEngine.Panel} [params.panel] Panel to render upon
	 * @param  {number} [width] Width of bid/ask line, in pixels
	 * @param  {number} [pattern] Pattern of bid/ask line, "solid", "dashed" or "dotted"
	 * @param  {number} [params.widthFactor] If set, will use as the percentage of the width of the chart to be used to represent the range of data.
	 * @param  {number} [params.heightFactor] If set, will use as the percentage of the height of the chart to be used to represent the range of data.
	 * @param  {string} [params.fontFamily] Font name for price drawn on screen
	 * @param  {number} [params.fontSize] Font size for price drawn on screen
	 * @return {object} Empty object
	 * @memberOf CIQ.ChartEngine
	 * @version ChartIQ CryptoIQ Package
	 * @since 6.1.0
	 *
	 * @example
	 * // create a standalone marketdepth chart
	 * var stxx=new CIQ.ChartEngine({container:$$$(".chartContainer")});
	 * stxx.setChartType("step_marketdepth");
	 * stxx.chart.tension=0.5;
	 * stxx.manageTouchAndMouse=false;
	 * stxx.newChart("SPY", data, null,null,{periodicity:{interval:'tick'}});
	 * 
	 * //To update the data call 
	 * stxx.updateSnapshotData(newData);
	 * stxx.draw();
	 * 
	 * @example
	 * stxx.setChartType("marketdepth");
	 * stxx.setChartType("mountain_marketdepth");
	 * stxx.setChartType("mountain_volume_marketdepth");
	 * 
	 * @jscrambler ENABLE
	 */
	CIQ.ChartEngine.prototype.drawMarketDepth=function(params){
		var mountain=params.mountain, volume=params.volume, step=params.step, tension=params.tension, panel=params.panel, bidColor=params.bidColor, askColor=params.askColor, baseColor=params.baseColor, widthFactor=params.widthFactor, heightFactor=params.heightFactor, fontFamily=params.fontFamily, fontSize=params.fontSize;
		if(typeof(panel)=="string") panel=this.panels[panel];
		var chart=panel.chart, quotes=chart.dataSegment, context=chart.context, yAxis=panel.yAxis, clip=true;
		var yValueCache=new Array(quotes.length);

		// Collates and sorts bid or ask data into a array formatted for convenient display
		// The amounts are accumulated based on sum of price x size for each record.
		function formatData(data, isBid){
			var combined=[], k;
			for (var j=0; j<data.length; j++) {
				if(combined.length && data[j][0]===combined[combined.length-1].price){
					combined[combined.length-1].size+=data[j][1];
					combined[combined.length-1].amount+=data[j][0]*data[j][1];					
				}else{
					combined.push({'price': data[j][0], 'size': data[j][1], 'amount': data[j][0]*data[j][1]});
				}
			}
			combined.sort(function(a, b) {
			    return (a.price < b.price) ? -1 : 1;
			});
			if(isBid){
				for (k=combined.length-2; k>=0; k--) {
					combined[k].amount+=combined[k+1].amount;
				}
			}else{
				for (k=1; k<combined.length; k++) {
					combined[k].amount+=combined[k-1].amount;
				}
			}
			return combined;
		}
		var quote=chart.currentMarketData;
		if(!quote || !quote.BidL2 || !quote.AskL2 || !quote.Last) return {};
		var bids=formatData(quote.BidL2.Price_Size,true);
		var asks=formatData(quote.AskL2.Price_Size);

		var width=chart.width, lowBid=bids[0], highAsk=asks[asks.length-1], mid=quote.Last.Price;
		if(mid===null) return {};  // if no last price don't show any chart
		var left=params.axisData.left, right=params.axisData.right;
		var height=yAxis.height-yAxis.initialMarginTop-yAxis.initialMarginBottom, amp=Math.max(lowBid.amount,highAsk.amount)/heightFactor;
		
		var maxVol=0,barWidth=width/(bids.length+asks.length);
		// Function to further process the bid/ask data into array of pixel coordinates for display on the screen
		// The price and size are included in the array to aid in generating the x-axis label text
		function computePoints(arr){
			var points=[];
			for(var i=0;i<arr.length;i++){
				points.push({
					x: chart.left+width*(arr[i].price-left)/(right-left),
					y: chart.panel.top+yAxis.initialMarginTop+height*(1-arr[i].amount/amp),
					price: arr[i].price,
					vol: arr[i].size
				});
				maxVol=Math.max(maxVol,arr[i].size);
			}
			return points;
		}
		var bidPoints=this.mainSeriesRenderer.bidPoints=computePoints(bids);
		var askPoints=this.mainSeriesRenderer.askPoints=computePoints(asks);

		var style=this.canvasStyle("stx_marketdepth_chart");
		var bidStyle=this.canvasStyle("stx_marketdepth_chart bid");
		var askStyle=this.canvasStyle("stx_marketdepth_chart ask");

		var lineStyle=chart.lineStyle || {};
		var lineWidth=params.width || style.width || lineStyle.width;
		if(lineWidth && parseInt(lineWidth,10)<=25){
			context.lineWidth=Math.max(1,CIQ.stripPX(lineWidth));
		}else{
			context.lineWidth=5;
		}
		lineWidth=context.lineWidth;
		var pattern=CIQ.borderPatternToArray(lineWidth, params.pattern || style.borderTopStyle || lineStyle.pattern);
		context.setLineDash(pattern || []);
		context.lineDashOffset=0;

		if(params.clip===false) clip=false;
		if(clip) this.startClip(panel.name);

		// At last data is in order, we are ready to plot.
		// First for the bid data, we plot the volume bars if configured,
		// Then the plot itself, and then fill in the "mountain" if configured.
		var topOffset;
		if(volume){
			context.save();
			context.lineWidth=1;
			context.globalAlpha=0.5;
			context.strokeStyle=bidStyle.borderBottomColor;
			context.fillStyle=bidStyle.color;
			for(bp=0;bp<bidPoints.length;bp++){
				bidPoint=bidPoints[bp];
				topOffset=(1-(bidPoint.vol*0.5/maxVol))*height+panel.top+yAxis.initialMarginTop;
				if(!CIQ.isTransparent(context.fillStyle)) context.fillRect(bidPoint.x-barWidth/4,topOffset,barWidth/2,panel.top+yAxis.height-topOffset);
				if(!CIQ.isTransparent(context.strokeStyle)) context.strokeRect(bidPoint.x-barWidth/4,topOffset,barWidth/2,panel.top+yAxis.height-topOffset);
			}
			context.restore();
		}

		var bidGradient=context.createLinearGradient(0,yAxis.top,0,yAxis.bottom);
		bidGradient.addColorStop(0, bidColor || bidStyle.borderTopColor);
		bidGradient.addColorStop(1, baseColor || bidStyle.backgroundColor);
		context.fillStyle=bidGradient;
		context.strokeStyle=bidColor || bidStyle.borderTopColor;
		context.beginPath();
		
		var plotPoints=[], bidPoint, askPoint, bp, ap;
		if(tension){
			plotPoints.push(chart.left-lineWidth,bidPoints[0].y);
			for(bp=0;bp<bidPoints.length;bp++){
				plotPoints.push(bidPoints[bp].x,bidPoints[bp].y);
				if(step && bp<bidPoints.length-1) plotPoints.push(bidPoints[bp].x,bidPoints[bp+1].y);
			}
			plotPoints.push(bidPoints[bidPoints.length-1].x,yAxis.height+lineWidth);
			if(mountain) plotPoints.push(chart.left-lineWidth,yAxis.height+lineWidth);
			splinePlotter.plotSpline(plotPoints, tension, context);
		}else{
			for(bp=0;bp<bidPoints.length;bp++){
				bidPoint=bidPoints[bp];
				if(bp===0) context.moveTo(chart.left-lineWidth,bidPoint.y);
				context.lineTo(bidPoint.x,bidPoint.y);
				if(bp<bidPoints.length-1){
					if(step) context.lineTo(bidPoint.x,bidPoints[bp+1].y);
				}else{
					context.lineTo(bidPoint.x,yAxis.height+lineWidth);
					if(mountain) context.lineTo(chart.left-lineWidth,yAxis.height+lineWidth);
				}
			}
		}
		context.stroke();
		if(mountain){
			context.save();
			context.globalAlpha=0.5;
			context.fill();
			context.restore();
		}
		
		// We do the same for the ask data
		if(volume){
			context.save();
			context.lineWidth=1;
			context.globalAlpha=0.5;
			context.strokeStyle=askStyle.borderBottomColor;
			context.fillStyle=askStyle.color;
			for(ap=0;ap<askPoints.length;ap++){
				askPoint=askPoints[ap];
				topOffset=(1-(askPoint.vol*0.5/maxVol))*height+panel.top+yAxis.initialMarginTop;
				if(!CIQ.isTransparent(context.fillStyle)) context.fillRect(askPoint.x-barWidth/4,topOffset,barWidth/2,panel.top+yAxis.height-topOffset);
				if(!CIQ.isTransparent(context.strokeStyle)) context.strokeRect(askPoint.x-barWidth/4,topOffset,barWidth/2,panel.top+yAxis.height-topOffset);
			}
			context.restore();
		}

		context.lineWidth=lineWidth;
		context.beginPath();
		var askGradient=context.createLinearGradient(0,yAxis.top,0,yAxis.bottom);
		askGradient.addColorStop(0, askColor || askStyle.borderTopColor);
		askGradient.addColorStop(1, baseColor || askStyle.backgroundColor);
		context.fillStyle=askGradient;
		context.strokeStyle=askColor || askStyle.borderTopColor;
		plotPoints=[];
		if(tension){
			plotPoints.push(askPoints[0].x,yAxis.height+lineWidth);
			for(ap=0;ap<askPoints.length;ap++){
				plotPoints.push(askPoints[ap].x,askPoints[ap].y);
				if(step && ap<askPoints.length-1) plotPoints.push(askPoints[ap+1].x,askPoints[ap].y);
			}
			plotPoints.push(chart.right+lineWidth,askPoints[askPoints.length-1].y);
			if(mountain) plotPoints.push(chart.right+lineWidth,yAxis.height+lineWidth);
			splinePlotter.plotSpline(plotPoints, tension, context);
		}else{
			for(ap=0;ap<askPoints.length;ap++){
				askPoint=askPoints[ap];
				if(ap===0) context.moveTo(askPoint.x,yAxis.height+lineWidth);
				context.lineTo(askPoint.x,askPoint.y);
				if(ap<askPoints.length-1){
					if(step) context.lineTo(askPoints[ap+1].x,askPoint.y);
				}else{
					context.lineTo(chart.right+lineWidth,askPoint.y);
					if(mountain) context.lineTo(chart.right+lineWidth,yAxis.height+lineWidth);
				}
			}
		}
		context.stroke();
		if(mountain){
			context.save();
			context.globalAlpha=0.5;
			context.fill();
			context.restore();
		}		
		context.lineWidth=1;
		
		// Finally we draw the last price (mid) onto the canvas, along with the spread.
		if(mid || mid===0){
			context.textAlign="center";
			context.fillStyle=style.color;
			context.save();
			context.font=style.fontStyle+" "+style.fontVariant+" "+style.fontWeight+" "+style.fontSize+"/"+style.lineHeight+" "+style.fontFamily.replace(/"/g,"");
			mid=this.formatPrice(mid, panel);
			context.fillText(mid, width/2, 30);
			context.restore();
			for(var a=0;a<asks.length;a++) if(asks[a].size) break;
			for(var b=bids.length-1;b>=0;b--) if(bids[b].size) break;
			var spread=(asks[a].price-bids[b].price);
			spread=this.formatPrice(spread, panel);
			context.fillText(this.translateIf("Spread")+": "+spread, width/2, 60);
		}
		if(clip) this.endClip();
		return {};
	};

	/**
	 * Creates a market depth renderer.
	 * 
	 * See {@link CIQ.Renderer#construct} for parameters required by all renderers
	 * 
	 * This renderer has three unique config options: step, mountain, and volume, all of which are independent of each other.
	 * step - will draw the connections between the data points as steps rather than straight lines
	 * mountain - will shade in the area under the plots
	 * volume - will draw a histogram at each data point for which there is volume
	 * 
	 * **Requires [cryptoIQ]{@link CIQ.MarketDepth} pugin. See {@link CIQ.ChartEngine#updateCurrentMarketData} for data requirements**
	 * 
	 * See {@link CIQ.ChartEngine#drawMarketDepth} for color parameters.
	 * @constructor
	 * @name  CIQ.Renderer.MarketDepth
	 * @version ChartIQ CryptoIQ Package
	 * @param {object} config Configuration parameters
	 * @since 6.1.0
	 */
	CIQ.Renderer.MarketDepth=function(config){
		this.construct(config);
		var params=this.params;
		this.params.axisData={};
		this.noCurrentHR=true;
	};
	CIQ.Renderer.MarketDepth.ciqInheritsFrom(CIQ.Renderer.Lines, false);

	CIQ.Renderer.MarketDepth.requestNew=function(featureList, params){
		var isMountain=false, isVolume=false, isStep=false, isMe=false;
		for(var pt=0;pt<featureList.length;pt++){
			var pType=featureList[pt];
			if(pType=="mountain") isMountain=true;
			else if(pType=="volume") isVolume=true;
			else if(pType=="step") isStep=true;
			else if(pType=="marketdepth") isMe=true;
			else return null;  // invalid chartType for this renderer
		}
		if(!isMe) return null;

		CIQ.ensureDefaults(params, {
			widthFactor: 1.1,
			heightFactor: 0.75
		});

		return new CIQ.Renderer.MarketDepth({
			params:CIQ.extend(params,{type:"marketdepth", mountain:isMountain, volume:isVolume, step:isStep})
		});	
	};

	CIQ.Renderer.MarketDepth.prototype.drawIndividualSeries=function(chart, parameters){
		var stx=this.stx, panel=stx.panels[parameters.panel]||chart.panel;
		this.startCrosshairHandler();
		return this.stx.drawMarketDepth({
			panel:panel,
			bidColor:parameters.bidColor,
			askColor:parameters.askColor,
			baseColor:parameters.baseColor,
			width:parameters.width,
			pattern:parameters.pattern,
			mountain:parameters.mountain,
			volume:parameters.volume,
			step:parameters.step,
			tension:parameters.tension || chart.tension,
			widthFactor:parameters.widthFactor,
			heightFactor:parameters.heightFactor,
			axisData:parameters.axisData
		});
	};
	
	// Called by CIQ.ChartEngine.prototype.initializeChart
	CIQ.Renderer.MarketDepth.prototype.determineMax=function(data){
		var chart=this.stx.chart;
		var q=chart.currentMarketData;
		if(!q) return {};
		
		var sumBid=0, sumAsk=0;
		for(var i=0;q.BidL2 && i<q.BidL2.Price_Size.length; i++){
			sumBid+=q.BidL2.Price_Size[i][0]*q.BidL2.Price_Size[i][1];
		}
		for(var j=0;q.AskL2 && j<q.AskL2.Price_Size.length; j++){
			sumAsk+=q.AskL2.Price_Size[j][0]*q.AskL2.Price_Size[j][1];
		}
		return [0,Math.max(sumBid,sumAsk)/this.params.heightFactor];
	};

	CIQ.Renderer.MarketDepth.prototype.createXAxis=function(chart){
		var quote=chart.currentMarketData;
		if(!quote || !quote.BidL2 || !quote.AskL2 || !quote.Last) return {};
		var lowPrice=quote.BidL2.Price_Size[0][0], highPrice=quote.AskL2.Price_Size[quote.AskL2.Price_Size.length-1][0], mid=quote.Last.Price;
		var halfSpan=Math.max(mid-lowPrice, highPrice-mid)*this.params.widthFactor;
		var left=this.params.axisData.left=mid-halfSpan, right=this.params.axisData.right=mid+halfSpan;
		
		var allPrices=(quote.BidL2.Price_Size.concat(quote.AskL2.Price_Size)).sort();
		var decimalPlaces=0;
		for(var i=0;i<allPrices.length;i++){
			decimalPlaces=Math.max(decimalPlaces,CIQ.countDecimals(allPrices[i][0]));
		}
		chart.decimalPlaces=decimalPlaces;
		var axisRepresentation=[];
		var hz=0;
		var divisor=Math.pow(10,decimalPlaces-1);
		var start=Math.floor(lowPrice*divisor)/divisor;
		while(start>left) start-=1/divisor;
		for(var lbl=start;hz<chart.right;lbl+=1/divisor){
			hz=chart.left+chart.width*(lbl-left)/(right-left);
			var text=this.stx.formatPrice(lbl, chart.panel);
			var halfMeasureWidth=chart.context.measureText(text).width/2;
			if(hz-halfMeasureWidth>chart.left && hz+halfMeasureWidth<chart.right)
				axisRepresentation.push(new CIQ.ChartEngine.XAxisLabel(hz,"line",text));
		}
		return axisRepresentation;
	};

	CIQ.Renderer.MarketDepth.prototype.startCrosshairHandler=function(){
		var stx=this.stx, self=this;
		if(self.mouseEventRegistered) return;
		var subholder=stx.chart.panel.subholder;
		function listener(e){
			if(stx.mainSeriesRenderer.params.type!="marketdepth") {//unregister me
				subholder.removeEventListener("mousemove", listener);
				subholder.removeEventListener("pointermove", listener);
				subholder.removeEventListener("touchmove", listener);
				return;
			}
			var x=e.clientX, y=e.clientY;
			if(e.touches && e.touches.length){
				x=e.touches[0].clientX;
				y=e.touches[0].clientY;
			}
			self.updateCrosshairs(x,y);
		}
		function updater(){
			if(stx.mainSeriesRenderer.params.type!="marketdepth") {//unregister me
				stx.removeInjection(self.drawInjectionId);
				return;
			}
			if(stx.controls.crossX && stx.controls.crossX.style.display!="none"){
				stx.mainSeriesRenderer.updateCrosshairs();
			}
		}
		subholder.addEventListener("mousemove", listener);
		subholder.addEventListener("pointermove", listener);
		subholder.addEventListener("touchmove", listener);
		this.drawInjectionId=stx.append("draw",updater);
		self.mouseEventRegistered=true;
	};

	CIQ.Renderer.MarketDepth.prototype.updateCrosshairs=function(epX, epY){
		var stx=this.stx, chart=stx.chart, controls=stx.controls;
		if(!stx.layout.crosshair) return;
		if(!this.bidPoints || !this.askPoints) return;
		var cx=(epX||epX===0)?stx.backOutX(epX):stx.cx;
		var cy=(epY||epY===0)?stx.backOutY(epY):stx.cy;
		if(cx<chart.left || cx>chart.right || cy<chart.top || cy>chart.bottom){
			stx.undisplayCrosshairs();
			return;
		}
		var points=this.bidPoints.concat(this.askPoints);
		for(var i=1;i<points.length;i++){
			if(cx-points[i-1].x<points[i].x-cx) break;
		}
		var point=points[i-1];
		stx.cx=point.x;
		stx.cy=point.y;
		
		if(controls){
			if(controls.crossX){
				controls.crossX.style.left=point.x + "px";
				controls.crossX.style.display="";
			}
			if(controls.crossY){
				controls.crossY.style.top=point.y + "px";
				controls.crossY.style.display="";
			}				
			stx.floatCanvas.style.display="block";
			if(controls.floatDate){
				controls.floatDate.style.visibility="";
				var bottom = stx.xAxisAsFooter === true ? 0 : stx.chart.canvasHeight - stx.chart.panel.chart.bottom;
				var halfLabelWidth=(controls.floatDate.offsetWidth/2)-0.5;
				var l=point.x-halfLabelWidth;
				if(l<0) l=0;
				else if(l>stx.width-2*halfLabelWidth-1) l=stx.width-2*halfLabelWidth-1;
				CIQ.efficientDOMUpdate(controls.floatDate.style, "left", l+"px");
				CIQ.efficientDOMUpdate(controls.floatDate.style, "bottom",bottom + "px");
				CIQ.efficientDOMUpdate(controls.floatDate.style, "width","auto");
				controls.floatDate.innerHTML=point.price+(this.params.volume?"<br>"+point.vol:"");
				stx.updateFloatHRLabel(stx.chart.panel);
			}
		}
		CIQ.clearCanvas(stx.chart.tempCanvas, stx);
		var ctx=stx.chart.tempCanvas.context;
		ctx.beginPath();
		ctx.lineWidth=1;
		ctx.arc(point.x, point.y, 3, 0, (2*Math.PI), false);
		ctx.fillStyle=stx.containerColor;
		ctx.strokeStyle=stx.defaultColor;
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
		stx.chart.tempCanvas.style.display="block";
	};

	/**
	 * Plugin that puts a market depth plot under the chart. This type of chart shows the volumes of bids and asks .
	 *
	 * **Requires [cryptoIQ]{@link CIQ.MarketDepth} pugin. See {@link CIQ.ChartEngine#updateCurrentMarketData} for data requirements**
	 *
	 * To enable this plugin in `sample-template-advanced.html` , search for `cryptoiq` and uncomment the necessary sections. 
	 * This template can alos be used as reference to create your oun UI for this module.
	 * 
	 * Once instantiated, use the `display(true/false)` function to add it or remove it from the chart. See example.
	 *
	 * If using ChartIQ webComponents, it needs to be created before the UI manager (startUI) is called for custom themes to apply.
	 *
	 * Visual Reference:<br>
	 * ![img-marketDepth-plugin](img-marketDepth-plugin.png "img-marketDepth-plugin")
	 *
	 * @param {object} params Configuration parameters
	 * @param {CIQ.ChartEngine} [params.stx] The chart object
	 * @param {boolean} [parameters.volume] Set to true to include volume bars on the chart
	 * @param {boolean} [parameters.mountain] Set to true to allow shading of the chart
	 * @param {number} [parameters.tension=null] Splining tension for smooth curves around data points (range 0-1).  Must include splines.js for this to be effective.
	 * @param {string} [params.height=150px] Height of market depth panel
	 * @param {object} [params.yAxis] optional yAxis parameters
	 * @param {object} [params.precedingContainer] Set to the htmlElement after which to insert the market depth chart.  Defaults to last chart container's parent.
	 * @param {object} [parameters.orderbook] Set to the htmlElement which is the orderbook container, to make the orderbook appear within the marketdepth area.  For example, $$$("cq-orderbook")
	 * 											To use the default orderbook in orderbook.html, set this parameter to true.
	 * @constructor
	 * @name  CIQ.MarketDepth
	 * @since 6.1.0
	 * @example
	 *  // instantiate a Market Depth plot with default params
	 * 	new CIQ.MarketDepth({stx:stxx});
	 *
	 *  // display the marketDepth
	 * 	stxx.marketDepth.display(true);
	 *
	 *  // hide the marketDepth
	 * 	stxx.marketDepth.display(false);
	 */
	CIQ.MarketDepth=function(params){
		function initOrderbook(){
			self.orderbookSwitch=$('<cq-toggle class="cq-orderbook-toggle"><cq-tooltip>Orderbook</cq-tooltip></cq-toggle>');
			marketDepthContainer.append(self.orderbookSwitch);
			function cb(){
				self.orderbookSwitch[0].registerCallback(function(){
					self.orderbook[0].open();
				}, false);
			}
			setTimeout(cb,0);  //  allow attachCallback to complete
		}
		if(!params || !params.stx) return;
		var stx=params.stx;
		stx.marketDepth=this;
		var panelHeight=params.height?params.height:"150px";
		var chartContainer=$(params.stx.container);
		var precedingContainer=params.precedingContainer?$(params.precedingContainer):$(chartContainer).parent().siblings().find(".chartContainer").last().parent();
		var ciqMarketDepth=$('<div class="ciq-chart"></div>');
		var marketDepthContainer=$('<div class="chartContainer"></div>');
		ciqMarketDepth.insertAfter(precedingContainer).append(marketDepthContainer);
		ciqMarketDepth.css("height",panelHeight).css("padding-top","5px").hide();
		marketDepthContainer.css('height', '100%');
		marketDepthContainer.prop("dimensionlessCanvas",true);
		var self=this.marketDepth=new CIQ.ChartEngine({container:marketDepthContainer[0], preferences:{labels:false, whitespace:0}});
		self.xaxisHeight=30;
		self.manageTouchAndMouse=false;
		self.setChartType("marketdepth");
		CIQ.extend(self.mainSeriesRenderer.params, params);
		self.container.style.cursor="crosshair";
		self.layout.crosshair=true;
		CIQ.appendClassName(self.container, "stx-crosshair-on");
		self.chart.tension=params.tension;
		self.chart.panel.yAxis.initialMarginBottom=0;
		CIQ.extend(self.chart.panel.yAxis, params.yAxis);
		var book=params.orderbook;
		if(book) {
			if(book===true){
				CIQ.loadUI("plugins/cryptoiq/orderbook.html", marketDepthContainer[0], function(err){
					if(!err) {
						self.orderbook=marketDepthContainer.find("cq-orderbook");
						initOrderbook();
					}
				});
			}else{
				self.orderbook=$(book);
				marketDepthContainer.append(self.orderbook);
				initOrderbook();
			}
		}
		self.initializeChart();
		var subholder=self.chart.panel.subholder;

		this.display=function(on){
			ciqMarketDepth[on?"show":"hide"]();
			stx.resizeChart();
			if(!on) return;
			self.resizeChart();
			self.initializeChart();
			self.draw();
		};
		this.setSymbol=function(symbol){
			self.chart.symbol=symbol;
			self.initializeChart();
			self.draw();
		};
		this.acceptLayoutChange=function(layout){
			if(self.layout.marketDepth!==layout.marketDepth){
				stx.marketDepth.display(layout.marketDepth);
				self.layout.marketDepth=layout.marketDepth;
				if(ciqMarketDepth.is(":visible")) self.draw();
			}
		};
		this.copyData=function(chart){
			//if(!ciqMarketDepth.is(":visible")) return;
			if(!chart.dataSet) return;
			var myChart=self.chart;
			myChart.masterData=self.masterData=chart.masterData;
			myChart.currentMarketData=chart.currentMarketData;
			myChart.dataSet=chart.dataSet;
			myChart.tickCache=chart.tickCache;
			if(!myChart.symbol){
				myChart.symbol=symbol;
				self.initializeChart();
			}
			self.draw();
		};
		stx.addEventListener("layout",function(obj){
			obj.stx.marketDepth.acceptLayoutChange(obj.stx.layout);
		});
		stx.addEventListener("preferences",function(obj){
			var language=obj.stx.preferences.language;
			if(CIQ.I18N && self.preferences.language!=language){
				CIQ.I18N.localize(self, language);
			}
			self.preferences.language=language;
			self.draw();
		});
		stx.addEventListener("symbolChange",function(obj){
			if(obj.action=="master") obj.stx.marketDepth.setSymbol(obj.symbol);
		});
		stx.addEventListener("symbolImport",function(obj){
			if(obj.action=="master") obj.stx.marketDepth.setSymbol(obj.symbol);
			obj.stx.marketDepth.acceptLayoutChange(obj.stx.layout);
		});
		stx.addEventListener("theme",function(obj){
			self.clearPixelCache();
			self.styles={};
			self.chart.container.style.backgroundColor="";
			var helper=new CIQ.ThemeHelper({stx:obj.stx});
			helper.params.stx=self;
			helper.update();
		});
		stx.append("createDataSet",function(){
			this.marketDepth.copyData(this.chart);
		});
		stx.append("updateCurrentMarketData",function(){
			this.marketDepth.copyData(this.chart);
		});
		stx.prepend("resizeChart",function(){
			var ciqChart=chartContainer.parent(), chartArea=ciqChart.parent();
			var heightOffset=ciqChart.height()-chartContainer.height();
			var totalHeightOfContainers=chartArea.height();
			chartArea.find(".chartContainer").each(function(){
				if(this!==chartContainer[0] && $(this).is(":visible")) totalHeightOfContainers-=$(this).parent().outerHeight(true);
			});
			ciqChart.height(totalHeightOfContainers);
			chartContainer.height(ciqChart.height()-heightOffset);
			if(this.layout.marketDepth){
				ciqMarketDepth.show();
				self.resizeChart();
				self.initializeChart();
				self.draw();
			}else{
				ciqMarketDepth.hide();
			}
		});

		this.copyData(stx.chart);
	};

	return _exports;

});

