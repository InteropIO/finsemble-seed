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
		module.exports = definition(require('chartiq'));
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
	 * A sample jsfiddle illustrating how to render a stand alone Market Depth chart can be found  [here](https://jsfiddle.net/chartiq/8deyoLbt/)
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
	 * Visual Reference: 'marketdepth'<br>
	 * ![marketdepth](img-marketdepth.png "marketdepth")
	 *
	 * Visual Reference: 'marketdepth_mountain'<br>
	 * ![mountain_marketdepth](img-mountain_marketdepth.png "mountain_marketdepth")
	 *
	 * Visual Reference: 'marketdepth_mountain_volume'<br>
	 * ![mountain_volume_marketdepth](img-mountain_volume_marketdepth.png "mountain_volume_marketdepth")
	 *
	 * @param  {object} params Rendering parameters
	 * @param  {boolean} [params.mountain] True to shade beneath the bid and ask lines
	 * @param  {boolean} [params.volume] True to show volume as a histogram
	 * @param  {boolean} [params.step] True to draw the bid and ask lines as steps
	 * @param  {number} [params.tension] A numeric value between 0 and 1 to draw the bid and ask lines as splines
	 * @param  {string} [params.bidColor] Color of Bid line
	 * @param  {string} [params.askColor] Color of Ask line
	 * @param  {string} [params.bidBaseColor] Color of base of mountain below bid
	 * @param  {string} [params.askBaseColor] Color of base of mountain below ask
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
	 * @since 
	 * <br>&bull; 6.1.0
	 * <br>&bull; 6.1.1 added bidBaseColor and askBaseColor parameters to replace baseColor.
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
	 * stxx.updateCurrentMarketData(newData);
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
		var mountain=params.mountain, volume=params.volume, step=params.step, tension=params.tension, panel=params.panel, bidColor=params.bidColor, askColor=params.askColor, bidBaseColor=params.bidBaseColor, askBaseColor=params.askBaseColor, widthFactor=params.widthFactor, heightFactor=params.heightFactor, fontFamily=params.fontFamily, fontSize=params.fontSize;
		if(typeof(panel)=="string") panel=this.panels[panel];
		var chart=panel.chart, quotes=chart.dataSegment, context=chart.context, yAxis=panel.yAxis, clip=true;
		var yValueCache=new Array(quotes.length);

		var quote=chart.currentMarketData;
		if(!quote) return {};

		// Convenience function to arrange bid or ask data into a unique array of objects {price, size, amount}
		// data is assumed sorted due to sorting done in createXAxis
		// The amount is cumulative based on sum of price x size for each record.
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
		var bids=quote.BidL2?formatData(quote.BidL2.Price_Size,true):[];
		var asks=quote.AskL2?formatData(quote.AskL2.Price_Size):[];

		var width=chart.width, lowBid=bids[0] || {}, highAsk=asks[asks.length-1] || {};
		var left=params.axisData.left, right=params.axisData.right;
		var height=yAxis.height-yAxis.initialMarginTop-yAxis.initialMarginBottom, amp=Math.max(lowBid.amount || 0,highAsk.amount || 0)/heightFactor;

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
			context.fillStyle=bidColor || bidStyle.color;
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
		bidGradient.addColorStop(1, bidBaseColor || bidStyle.backgroundColor);
		context.fillStyle=bidGradient;
		context.strokeStyle=bidColor || bidStyle.borderTopColor;
		context.beginPath();

		var plotPoints=[], bidPoint, askPoint, bp, ap;
		if(tension && bidPoints.length){
			var leftmostPoint=Math.min(bidPoints[0].x,chart.left-lineWidth);
			plotPoints.push(leftmostPoint,bidPoints[0].y);
			for(bp=0;bp<bidPoints.length;bp++){
				plotPoints.push(bidPoints[bp].x,bidPoints[bp].y);
				if(step && bp<bidPoints.length-1) plotPoints.push(bidPoints[bp].x,bidPoints[bp+1].y);
			}
			plotPoints.push(bidPoints[bidPoints.length-1].x,yAxis.height+lineWidth);
			if(mountain) plotPoints.push(leftmostPoint,yAxis.height+lineWidth);
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
			context.fillStyle=askColor || askStyle.color;
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
		askGradient.addColorStop(1, askBaseColor || askStyle.backgroundColor);
		context.fillStyle=askGradient;
		context.strokeStyle=askColor || askStyle.borderTopColor;
		plotPoints=[];
		if(tension && askPoints.length){
			plotPoints.push(askPoints[0].x,yAxis.height+lineWidth);
			for(ap=0;ap<askPoints.length;ap++){
				plotPoints.push(askPoints[ap].x,askPoints[ap].y);
				if(step && ap<askPoints.length-1) plotPoints.push(askPoints[ap+1].x,askPoints[ap].y);
			}
			var rightmostPoint=Math.max(askPoints[ap-1].x,chart.right+lineWidth);
			plotPoints.push(rightmostPoint,askPoints[askPoints.length-1].y);
			if(mountain) plotPoints.push(rightmostPoint,yAxis.height+lineWidth);
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
		if(quote.Last){
			var mid=quote.Last.Price;
			if(quote.animatedLast) mid=quote.animatedLast.Price;
			if(mid || mid===0){
				context.textAlign="center";
				context.fillStyle=style.color;
				context.save();
				context.font=style.fontStyle+" "+style.fontVariant+" "+style.fontWeight+" "+style.fontSize+"/"+style.lineHeight+" "+style.fontFamily.replace(/"/g,"");
				mid=this.formatPrice(mid, panel);
				context.fillText(mid, width/2, 30);
				context.restore();
				if(bids.length && asks.length){
					for(var a=0;a<asks.length;a++) if(asks[a].size) break;
					for(var b=bids.length-1;b>=0;b--) if(bids[b].size) break;
					var spread=(asks[a].price-bids[b].price);
					spread=this.formatPrice(spread, panel);
					context.fillText(this.translateIf("Spread")+": "+spread, width/2, 60);
				}
			}
		}
		if(clip) this.endClip();
		return {};
	};

	if(CIQ.Studies){
		/**
		 * Default display function for the Depth of Market indicator.
		 * @param  {CIQ.ChartEngine} stx	The chart object
		 * @param  {studyDescriptor} sd	 The study descriptor
		 * @param  {array} quotes The set of quotes (dataSegment)
		 *
		 * **Requires [cryptoIQ]{@link CIQ.MarketDepth} plugin. See {@link CIQ.ChartEngine#updateCurrentMarketData} for data requirements**
		 * 
		 * @memberof CIQ.Studies
		 * @version ChartIQ CryptoIQ Package
		 * @since 6.2.0
		 * @private
		 * 
		 * @jscrambler ENABLE
		 */
		CIQ.Studies.displayDepthOfMarket=function(stx, sd, quotes){
			if(!stx || !stx.chart.dataSet) return;
	
			var chart = stx.chart;
			var panel = chart.panel;
	
			var numberBars=sd.inputs["Bar Count"];
			var widthPercentage=sd.inputs["Width Percentage"];
			var displayBorder=sd.parameters.displayBorder;
			var displaySize=sd.parameters.displaySize;
			//set defaults
			if(!numberBars || numberBars<0) numberBars = 30;
			numberBars=Math.ceil(numberBars);
			if(!widthPercentage || widthPercentage<0) widthPercentage = 25;
			widthPercentage/=100;
			if(displayBorder!==false) displayBorder = true;
			if(displaySize!==true) displaySize = false;
	
			if (!chart.currentMarketData || (!chart.currentMarketData.BidL2 && !chart.currentMarketData.AskL2)) {
				stx.watermark("chart","center","top",stx.translateIf("Not enough data to render the Depth of Market"));
				return;
			}
	
			var totalVolume={b:0,a:0}, tvi;
			var bids=(chart.currentMarketData.BidL2 && chart.currentMarketData.BidL2.Price_Size);
			for(tvi=0; bids && tvi<bids.length; tvi++){
				totalVolume.b+=bids[tvi][1];
			}
			var asks=(chart.currentMarketData.AskL2 && chart.currentMarketData.AskL2.Price_Size);
			for(tvi=0; asks && tvi<asks.length; tvi++){
				totalVolume.a+=asks[tvi][1];
			}
			totalVolume=Math.max(totalVolume.b,totalVolume.a);
			if(totalVolume===0){
				stx.watermark("chart","center","top",stx.translateIf("Waiting for Level 2 Data"));
				return;
			}
	
			["BidL2","AskL2"].forEach(function(p){
				var isBid=p=="BidL2";
				var priceVolArry = [];
				var prices=(chart.currentMarketData[p] && chart.currentMarketData[p].Price_Size) || [];
				var l2Info=[].concat(prices).sort(function(a, b) {
				    return (a[0] < b[0]) ? -1 : 1;
				});
				//decide how many bars
				var highValue=l2Info[l2Info.length-1][0], lowValue=l2Info[0][0];
				var interval = (highValue-lowValue)/numberBars;
				if(interval===0) return;
	
				// set the boundaries for the bars
				var j;
				if(isBid){
					for(j=highValue;priceVolArry.length<=numberBars || j>=lowValue;j-=interval){
						priceVolArry.unshift([j, 0]);
					}
				}else{
					for(j=lowValue;priceVolArry.length<=numberBars || j<highValue;j+=interval){
						priceVolArry.push([j, 0]);
					}
				}
	
				if (priceVolArry.length <2) {	// need at least 2 price data points to draw boxes
					stx.watermark("chart","center","top",stx.translateIf("Not enough range in chart to render the Depth of Market"));
					return;
				}
	
				for(var i=0;i<l2Info.length;i++){
					var price=l2Info[i][0];
					var volume=l2Info[i][1];
	
					var bottomRange = priceVolArry[0][0];
					var topRange = 0;
					for(var x=1;x<priceVolArry.length;x++){
						topRange= priceVolArry[x][0];
						if(price >= bottomRange && price < topRange){
							priceVolArry[x-(isBid?0:1)][1]+=volume;
						}else if(price == topRange && x==priceVolArry.length-1){
							priceVolArry[x-(isBid?0:1)][1]+=volume;
						}
						bottomRange = topRange;
					}
				}
				var context=chart.context;
				var fontstyle="stx-float-date";
				stx.canvasFont(fontstyle, context);
				var txtHeight=stx.getCanvasFontSize(fontstyle);
				var chartBottom = panel.yAxis.bottom;
				var barBottom=Math.round(chart.width)-0.5;  //bottom x coordinate for the bar  -- remember bars are sideways so the bottom is on the x axis
				var barMaxHeight=(chart.width)*widthPercentage;  // pixels for highest bar
	
				var self=stx;
	
				if(isBid) priceVolArry.reverse();
				var curvePoints=[];
	
				function drawBars(color, borders){
					if(!borders) barBottom-=2;
					context.fillStyle=color;
					context.globalAlpha=0.5;
					context.beginPath();
					var bottomRange = priceVolArry[0][0];
					var prevTop=barBottom;
					var accumVol=0;
					for(var i=1;i<priceVolArry.length;i++){
						if (priceVolArry[i-1][1]) {
							var barTop =Math.round(barBottom-(priceVolArry[i-1][1]*barMaxHeight/totalVolume))-0.5;
							var bottomRangePixel=Math.round(self.pixelFromPrice(bottomRange, panel))+0.5;
							var topRangePixel = Math.round(self.pixelFromPrice(priceVolArry[i][0], panel))+0.5;
	
							if(curvePoints.length) curvePoints.pop();  // remove point previously inserted 5 lines down
							curvePoints.push([barBottom-(accumVol*barMaxHeight/totalVolume),bottomRangePixel]);
							accumVol+=priceVolArry[i-1][1];
							curvePoints.push([barBottom-(accumVol*barMaxHeight/totalVolume),bottomRangePixel]);
							curvePoints.push([barBottom-(accumVol*barMaxHeight/totalVolume),topRangePixel]);
							curvePoints.push([barBottom,topRangePixel]);  // perhaps this is the last, will remove above if not
							if(!borders){
								bottomRangePixel+=isBid?0.5:-0.5;
								topRangePixel+=isBid?-0.5:0.5;
								barTop+=0.5;
							}
	
							if ( bottomRangePixel > chartBottom ) bottomRangePixel=chartBottom;
							if ( topRangePixel < chartBottom ) {
								context.moveTo(barBottom, bottomRangePixel);
								context.lineTo(barBottom, topRangePixel);
								context.lineTo(barTop, topRangePixel);
								context.lineTo(barTop,bottomRangePixel);
								if(borders){
									if(prevTop>barTop || i==1) context.lineTo(prevTop, bottomRangePixel); // draw down to the top of the previous bar, so that we don't overlap strokes
								}else{
									context.lineTo(barBottom,bottomRangePixel);
								}
								if ( displaySize ) {
									//write the volume on the bar **/
									var txt = priceVolArry[i-1][1];
									var barHeight= Math.abs(bottomRangePixel-topRangePixel);
									if( txtHeight <= barHeight-2) {
										var width;
										try{
											width=context.measureText(txt).width;
										}catch(e){ width=0;} // Firefox doesn't like this in hidden iframe
										context.textBaseline="top";
										var tmpcolor = context.fillStyle;
										context.fillStyle=stx.defaultColor;
										context.fillText(txt, barTop-width-3,(isBid?bottomRangePixel:topRangePixel)+(barHeight/2-txtHeight/2));
										context.fillStyle=tmpcolor;
									}
								}
							}
							prevTop=barTop;
						} else {
							prevTop=barBottom; // there will be a missing bar here so the border needs to once again go to the end
						}
						bottomRange = priceVolArry[i][0];
					}
					context.strokeStyle = color;
					if(!borders){
						context.fill();
						stx.startClip(panel.name);
						context.beginPath();
						context.globalAlpha=0.3;
						for(var cp=0;cp<curvePoints.length;cp++){
							var pt=curvePoints[cp];
							context[i?"lineTo":"moveTo"](pt[0],pt[1]);
						}
						context.fill();
						context.globalAlpha=0.5;
						context.stroke();
						stx.endClip();
					}else{
						context.stroke();
					}
					context.closePath();
				}
	
				drawBars(CIQ.Studies.determineColor(sd.outputs[isBid?"Bid":"Ask"]), false);
				if(displayBorder){
					drawBars(stx.defaultColor, true);
				}
				context.globalAlpha=1;
			});
		};
	}


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
	 * **Requires [cryptoIQ]{@link CIQ.MarketDepth} plugin. See {@link CIQ.ChartEngine#updateCurrentMarketData} for data requirements**
	 *
	 * See {@link CIQ.ChartEngine#drawMarketDepth} for color parameters and usage examples.
	 *
	 * A sample jsfiddle illustrating how to render a stand alone Market Depth chart can be found  [here](https://jsfiddle.net/chartiq/8deyoLbt/)
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
			bidBaseColor:parameters.bidBaseColor,
			askBaseColor:parameters.askBaseColor,
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
		if(!quote) return {};
		function sorter(a, b) {
		    return (a[0] < b[0]) ? -1 : 1;
		}
		var bidPriceSizes=(quote.BidL2 && quote.BidL2.Price_Size && quote.BidL2.Price_Size.sort(sorter)) || [[]];
		var askPriceSizes=(quote.AskL2 && quote.AskL2.Price_Size && quote.AskL2.Price_Size.sort(sorter)) || [[]];
		var lowPrice=bidPriceSizes[0][0], highPrice=askPriceSizes[askPriceSizes.length-1][0], mid=quote.Last && quote.Last.Price;
		if(!lowPrice && lowPrice!==0) lowPrice=highPrice;
		if(!highPrice && highPrice!==0) highPrice=lowPrice;
		if(!mid && mid!==0) mid=(lowPrice+highPrice)/2;
		var halfSpan=Math.max(mid-lowPrice, highPrice-mid)*this.params.widthFactor;
		var left=this.params.axisData.left=mid-halfSpan, right=this.params.axisData.right=mid+halfSpan;

		var allPrices=(bidPriceSizes.concat(askPriceSizes)).sort();
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
		var hzConstant=chart.width/(right-left), skip=0;
		for(var lbl=start;hz<chart.width;lbl+=1/divisor){
			hz=(lbl-left)*hzConstant;
			if(hz<skip) continue;
			var text=this.stx.formatPrice(lbl, chart.panel);
			var halfMeasureWidth=chart.context.measureText(text).width/2;
			if(hz-halfMeasureWidth>0 && hz+halfMeasureWidth<chart.width){
				axisRepresentation.push(new CIQ.ChartEngine.XAxisLabel(chart.left+hz,"line",text));
				skip=Math.floor(hz+halfMeasureWidth);  // no new representations until at least the right edge of the current label
			}else{
				skip=0;
			}
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
		if(!this.bidPoints || !this.askPoints) {
			stx.undisplayCrosshairs();
			return;
		}
		var cx=(epX||epX===0)?stx.backOutX(epX):stx.cx;
		var cy=(epY||epY===0)?stx.backOutY(epY):stx.cy;
		if(cx<chart.left || cx>chart.right || cy<chart.top || cy>chart.bottom){
			stx.undisplayCrosshairs();
			return;
		}
		var i,possiblePoints=[];
		var points=this.bidPoints;
		for(i=1;i<points.length;i++){
			if(cx-points[i-1].x<points[i].x-cx) break;
		}
		if(points.length) possiblePoints.push(points[i-1]);
		points=this.askPoints;
		for(i=1;i<points.length;i++){
			if(cx-points[i-1].x<points[i].x-cx) break;
		}
		if(points.length) possiblePoints.push(points[i-1]);
		var highBid=this.bidPoints[this.bidPoints.length-1],lowAsk=this.askPoints[0];
		if(possiblePoints.length){
			if(highBid!==undefined && lowAsk!==undefined){
				if((cx<=highBid.x && cx>=lowAsk.x) || (cx>highBid.x && cx<lowAsk.x)){
					// crossed market, pick closest point if within the cross zone or between curves
					if(Math.pow(cx-possiblePoints[0].x,2)+Math.pow(cy-possiblePoints[0].y,2) > Math.pow(cx-possiblePoints[1].x,2)+Math.pow(cy-possiblePoints[1].y,2))
						possiblePoints.shift();
				}else if(cx>lowAsk.x) {
					// Remove the bid possibility if we are in the ask zone
					possiblePoints.shift();
				}
			}else if((highBid===undefined && cx<lowAsk.x) || (lowAsk===undefined && cx>highBid.x)){
				// Remove the one possibility if we are beyond it (below lowest ask, above highest bid)
				possiblePoints.shift();
			}
		}
		var point=possiblePoints[0];
		if(!point) {
			stx.undisplayCrosshairs();
			return;
		}
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

	// Here we force the chart type again so the renderer will be correct as it will not be before this module loads
	for(var container=0;container<CIQ.ChartEngine.registeredContainers.length;container++){
		var stx=CIQ.ChartEngine.registeredContainers[container].stx;
		if(stx.layout.chartType.indexOf("marketdepth")>-1 && stx.mainSeriesRenderer.params.type!="marketdepth"){
			stx.setChartType(stx.layout.chartType);
			stx.draw();
		}
	}

	/**
	 * Plugin that puts a market depth plot under the chart. This type of chart shows the volumes of bids and asks .
	 *
	 * **Requires [cryptoIQ]{@link CIQ.MarketDepth} plugin. See {@link CIQ.ChartEngine#updateCurrentMarketData} for data requirements**
	 *
	 * To enable this plugin in `sample-template-advanced.html` , search for `cryptoiq` and uncomment the necessary sections.
	 * This template can also be used as reference to create your own UI for this module.
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
	 * 										To use the default orderbook in orderbook.html, set this parameter to true.
	 * @param {boolean} [parameters.record] Set to true to record the marketDepth data.  Updating currentMarketData will then also update masterData.
	 * 										This is useful when rendering historical market depth.  Note this may be memory-intensive.
	 * 										The marketDepth plugin's "recording" property will be set to this value.
	 * 										This can be turned on or off on the fly by calling stxx.marketDepth.setRecorder(true|false)
	 * @constructor
	 * @name  CIQ.MarketDepth
	 * @since 6.1.0
	 * @since 6.2.0 added record parameter
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

		this.setRecorder=function(on){
			this.recording=on;
		};
		this.display=function(on){
			ciqMarketDepth[on?"show":"hide"]();
			stx.resizeChart();
			$(window).resize();
			if(!on) return;
			self.resizeChart();
			self.initializeChart();
			self.draw();
		};
		this.setSymbol=function(symbol){
			self.chart.symbol=symbol;
			if(this.recording) self.L2History={};
			self.initializeChart();
			self.draw();
		};
		this.acceptLayoutChange=function(layout){
			if(self.layout.marketDepth!==layout.marketDepth){
				stx.marketDepth.display(layout.marketDepth);
				self.layout.marketDepth=layout.marketDepth;
				if(ciqMarketDepth.is(":visible")) self.draw();
			}
			if(this.recording) {
				if(self.layout.interval!==layout.interval)  self.L2History={};
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
		this.computeHeatMap=function(data,chart){
			if(stx.marketDepth.recording){
				var last=data.Close;
				if(!last && last!==0) return;
				if(!self.L2History) self.L2History={};
				if(!self.L2History[data.DT]) self.L2History[data.DT]={};
				var hRecord=self.L2History[data.DT];
				var BidL2=data.BidL2 || hRecord.BidL2;
				var AskL2=data.AskL2 || hRecord.AskL2;
				var j, L2TotalSize=0, combinedData=(BidL2 || []).concat(AskL2 || []);
				for(j=0;j<combinedData.length;j++){
					L2TotalSize+=combinedData[j][1];
				}
				var blockSize=Math.pow(10,1-self.chart.decimalPlaces);
				var nearestBlock,size;
				if(BidL2){
					var bidL2Mapping={};
					for(j=0;j<BidL2.length;j++){
						nearestBlock=(Math.floor((BidL2[j][0]-last)/blockSize)*blockSize+last+blockSize/2).toFixed(self.chart.decimalPlaces);
						size=BidL2[j][1];
						if(!bidL2Mapping[nearestBlock]) bidL2Mapping[nearestBlock]=0;
						bidL2Mapping[nearestBlock]+=size;
					}
					hRecord.BidL2=BidL2;
					hRecord.BidHeatmap=[];
					for(j in bidL2Mapping){
						// We multiply percentage by 3 to make the heatmap colors starker (as we'll never have a cell containing close to all the volume).  Same with ask below
						hRecord.BidHeatmap.push([Number(j),bidL2Mapping[j],Math.min(1,3*bidL2Mapping[j]/L2TotalSize)]);
					}
				}
				if(AskL2){
					var askL2Mapping={};
					for(j=0;j<AskL2.length;j++){
						nearestBlock=(Math.ceil((AskL2[j][0]-last)/blockSize)*blockSize+last-blockSize/2).toFixed(self.chart.decimalPlaces);
						size=AskL2[j][1];
						if(!askL2Mapping[nearestBlock]) askL2Mapping[nearestBlock]=0;
						askL2Mapping[nearestBlock]+=size;
					}
					hRecord.AskL2=AskL2;
					hRecord.AskHeatmap=[];
					for(j in askL2Mapping){
						hRecord.AskHeatmap.push([Number(j),askL2Mapping[j],Math.min(1,3*askL2Mapping[j]/L2TotalSize)]);
					}
				}
			}else{
				self.L2History={};
			}
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
		stx.append("updateCurrentMarketData",function(data, chart, symbol, calledFromTrade){
			if(symbol) return;  // only do this for primary symbol
			if(!this.chart.currentMarketData.animatedLast && self.L2History && self.L2History[data.DT]){
				self.L2History[data.DT]=null;  // new (& unanimated) data; invalidate cache entry
			}
			this.marketDepth.copyData(chart || this.chart);
		});
		stx.append("createDataSegment",function(theChart){
			if(this.marketDepth.recording){
				var chart=theChart || this.chart;
				for(var i=0;i<chart.dataSegment.length;i++){
					var segment=chart.dataSegment[i];
					if(!segment) continue;
					if(!self.L2History || !self.L2History[segment.DT]){
						// not in cache, compute
						this.marketDepth.computeHeatMap(segment,chart);
					}
					var computed=self.L2History[segment.DT];
					if(computed){
						segment.BidHeatmap=computed.BidHeatmap;
						segment.AskHeatmap=computed.AskHeatmap;
					}
				}
			}
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
		stx.prepend("displayChart",function(){
			if(this.layout.l2heatmap){
				var bidStyle=this.canvasStyle("stx_marketdepth_chart bid");
				var askStyle=this.canvasStyle("stx_marketdepth_chart ask");
				var opacityRange={min:0.3,max:0.9};
				//this.scatter(this.chart.panel,{field:"BidL2Mapping",color:self.mainSeriesRenderer.params.bidColor||bidStyle.color,lineWidth:1});
				//this.scatter(this.chart.panel,{field:"AskL2Mapping",color:self.mainSeriesRenderer.params.askColor||askStyle.color,lineWidth:1});
				this.drawHeatmap({height:Math.pow(10,1-self.chart.decimalPlaces), showSize:false},
						[{field:"BidHeatmap", color:self.mainSeriesRenderer.params.bidColor||bidStyle.color, opacity:opacityRange},
						 {field:"AskHeatmap", color:self.mainSeriesRenderer.params.askColor||askStyle.color, opacity:opacityRange}]);
			}
		});

		this.copyData(stx.chart);
		this.setRecorder(params.record);
	};

	return _exports;

});

