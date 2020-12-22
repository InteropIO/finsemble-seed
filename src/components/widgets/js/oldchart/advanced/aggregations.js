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
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for aggregations.js.");
	}
})(function(_exports){
	console.log("aggregation.js",_exports);
	var CIQ=_exports.CIQ;

	CIQ.ChartEngine.prototype.drawKagiSquareWave=function(panel, upStyleName, downStyleName){
		var chart=panel.chart;
		this.startClip(panel.name);
		var quotes=chart.dataSegment;
		var context=chart.context;
		var upStyle=this.canvasStyle(upStyleName);
		var downStyle=this.canvasStyle(downStyleName);
		this.canvasColor(upStyleName);
		var upColor=context.strokeStyle;
		this.canvasColor(downStyleName);
		var downColor=context.strokeStyle;
		var upWidth=1;
		if(upStyle.width && parseInt(upStyle.width,10)<=25){
			upWidth=Math.max(1,CIQ.stripPX(upStyle.width));
		}
		var downWidth=1;
		if(downStyle.width && parseInt(downStyle.width,10)<=25){
			downWidth=Math.max(1,CIQ.stripPX(downStyle.width));
		}
		context.beginPath();
		var leftTick=chart.dataSet.length - chart.scroll;
		var yAxis=panel.yAxis;
		var first=true;
		var previousOpen=null;
		var lastClose=null;
		var trend=null;
		var xbase=panel.left-0.5*this.layout.candleWidth+this.micropixels-1;
		for(var x=0;x<=quotes.length;x++){
			xbase+=this.layout.candleWidth;
			var quote=quotes[x];
			if(!quote) continue;
			if(quote.projection) break;
			if(quote.transform) quote=quote.transform;
			var cache=quote.cache;
			var tick=leftTick+x;
			if(tick<panel.cacheLeft || tick>panel.cacheRight || !cache.open){
				cache.open=(yAxis.semiLog?this.pixelFromPrice(quote.Open,panel):((yAxis.high-quote.Open)*yAxis.multiplier)+yAxis.top); // inline version of pixelFromPrice() for efficiency
				cache.close=(yAxis.semiLog?this.pixelFromPrice(quote.Close,panel):((yAxis.high-quote.Close)*yAxis.multiplier)+yAxis.top); // inline version of pixelFromPrice() for efficiency
			}
			lastClose=cache.close;
			if(first) {
				context.moveTo(Math.floor(xbase), cache.open);
				previousOpen=cache.open;
				if(cache.close>cache.open) trend=1;
				else trend=-1;
				first=false;
			}
			if(trend!=-1 && cache.close<previousOpen && previousOpen<cache.open){
				context.lineTo(Math.floor(xbase), previousOpen);
				context.strokeStyle=downColor;
				context.lineWidth=downWidth;
				context.stroke();
				context.closePath();
				context.beginPath();
				trend=-1;
				context.moveTo(Math.floor(xbase), previousOpen);
			}else if(trend!=1 && cache.close>previousOpen && previousOpen>cache.open){
				context.lineTo(Math.floor(xbase), previousOpen);
				context.strokeStyle=upColor;
				context.lineWidth=upWidth;
				context.stroke();
				context.closePath();
				context.beginPath();
				trend=1;
				context.moveTo(Math.floor(xbase), previousOpen);
			}
			context.lineTo(Math.floor(xbase), cache.close);
			if(x+1<quotes.length){
				context.lineTo(Math.floor(xbase+this.layout.candleWidth), cache.close);
				previousOpen=cache.open;
			}
		}
		if(trend==-1 || (trend===null && lastClose<previousOpen)){
			context.strokeStyle=upColor;
			context.lineWidth=upWidth;
		}else{
			context.strokeStyle=downColor;
			context.lineWidth=downWidth;
		}
		context.stroke();
		context.closePath();
		this.endClip();
		context.lineWidth=1;
	};

	CIQ.ChartEngine.prototype.drawPointFigureChart=function(panel, style, condition){
		var chart=panel.chart;
		this.startClip(panel.name);
		var quotes=chart.dataSegment;
		var context=chart.context;
		this.canvasColor(style);
		var pfstyle=this.canvasStyle(style);
		var paddingTop=parseInt(pfstyle.paddingTop,10);
		var paddingBottom=parseInt(pfstyle.paddingBottom,10);
		var paddingLeft=parseInt(pfstyle.paddingLeft,10);
		var paddingRight=parseInt(pfstyle.paddingRight,10);
		if(pfstyle.width && parseInt(pfstyle.width,10)<=25){
			context.lineWidth=Math.max(1,CIQ.stripPX(pfstyle.width));
		}else{
			context.lineWidth=2;
		}
		context.beginPath();
		if(!this.chart.pandf) this.chart.pandf={"box":1,"reversal":3};
		var box=this.chart.pandf.box;
		var leftTick=chart.dataSet.length - chart.scroll;
		var yAxis=panel.yAxis;
		var boxes, height, start;
		var candleWidth=this.layout.candleWidth;
		var xbase=panel.left-candleWidth+this.micropixels-1;
		for(var x=0;x<quotes.length;x++){
			xbase+=candleWidth;
			var quote=quotes[x];
			if(!quote) continue;
			if(quote.projection) break;
			if(quote.candleWidth) candleWidth=quote.candleWidth;
			if(quote.transform) quote=quote.transform;
			if(condition=="X" && quote.Open>quote.Close) continue;
			else if(condition=="O" && quote.Open<quote.Close) continue;
			var cache=quote.cache;
			var tick=leftTick+x;
			if(tick<panel.cacheLeft || tick>panel.cacheRight || !cache.open){
				cache.open=(yAxis.semiLog?this.pixelFromPrice(quote.Open,panel):((yAxis.high-quote.Open)*yAxis.multiplier)+yAxis.top); // inline version of pixelFromPrice() for efficiency
				cache.close=(yAxis.semiLog?this.pixelFromPrice(quote.Close,panel):((yAxis.high-quote.Close)*yAxis.multiplier)+yAxis.top); // inline version of pixelFromPrice() for efficiency
			}
			var xxl=Math.round(xbase);
			var xxr=Math.round(xbase+candleWidth);
			boxes=Math.abs(Math.round((quote.Close-quote.Open)/box));
			height=Math.abs((cache.open-cache.close)/boxes);
			var voffset=height/2;
			start=cache.open;
			for(;boxes>=0;boxes--){
				if(condition=="X"){
					context.moveTo(xxl+paddingLeft, start-paddingBottom+voffset);
					context.lineTo(xxr-paddingRight, start-height+paddingTop+voffset);
					context.moveTo(xxl+paddingLeft, start-height+paddingTop+voffset);
					context.lineTo(xxr-paddingRight, start-paddingBottom+voffset);
					start-=height;
				}else if(condition=="O"){
					context.moveTo((xxl+xxr)/2, start+paddingTop-voffset);
					context.bezierCurveTo(xxr+paddingRight, start+paddingTop-voffset, xxr+paddingRight, start+height-paddingBottom-voffset, (xxl+xxr)/2, start+height-paddingBottom-voffset);
					context.bezierCurveTo(xxl-paddingLeft, start+height-paddingBottom-voffset, xxl-paddingLeft, start+paddingTop-voffset, (xxl+xxr)/2, start+paddingTop-voffset);
					start+=height;
				}
			}
		}
		context.stroke();
		this.endClip();
		context.lineWidth=1;
	};

	/**
	 * Calculates Heikin-Ashi values. Takes a dataSet and returns a replacement dataSet.
	 * This method is used inside {@link CIQ.ChartEngine#createDataSet} to determine the data aggregation logic and should not be called directly.
	 * Use {@link CIQ.ChartEngine#setAggregationType} instead.
	 * @param {CIQ.ChartEngine} stx   The chart object
	 * @param {array} dataSet The dataSet to modify
	 * @return {array}        The replacement dataSet
	 * @memberOf CIQ
	 * @since 04-2015-15
	 * @version ChartIQ Advanced Package
	 */

	CIQ.calculateHeikinAshi=function(stx, dataSet){
		if(!dataSet.length) return dataSet;

		var newDataSet=[];

		for(var i=0;i<dataSet.length;i++){
			var q=dataSet[i];
			if(!q) continue;
			var q1=newDataSet[newDataSet.length-1];	// the previous data must be from an Heikin Ashi set not the unprocessed dataSet
			if(!q1) q1=q;
			var xOpen=(q1.Open+q1.Close)/2;
			var xClose=(q.Open+q.High+q.Low+q.Close)/4;
			newDataSet.push({
				DT: q.DT,
				displayDate: q.displayDate,
				Date: q.Date,
				Open: xOpen,
				Close: xClose,
				High: Math.max(q.High,Math.max(xOpen,xClose)),
				Low: Math.min(q.Low,Math.min(xOpen,xClose)),
				Volume: q.Volume,
				iqPrevClose: q1.Close
			});
		}
		return newDataSet;
	};

	/**
	 * Calculates Kagi chart values. Takes a dataSet and returns a replacement dataSet.
	 * This method is used inside {@link CIQ.ChartEngine#createDataSet} to determine the data aggregation logic and should not be called directly.
	 * Use {@link CIQ.ChartEngine#setAggregationType} instead.
	 * @param {CIQ.ChartEngine} stx   The chart object
	 * @param {array} dataSet The dataSet to modify
	 * @param {number} reversal The reversal percentage for the kagi lines. This is typically user configurable. Default is 4% for daily, .4% for intraday.
	 * @return {array}        The replacement dataSet
	 * @memberOf CIQ
	 * @since 04-2015-15
	 * @version ChartIQ Advanced Package
	 */

	CIQ.calculateKagi=function(stx, dataSet, reversal){
		if(!dataSet.length) return dataSet;
		if(!reversal){
			if(stx.isDailyInterval(stx.layout.interval)) reversal=0.04;
			else reversal=0.004;
			if(CIQ.Market.Symbology.isForexSymbol(stx.chart.symbol)) reversal/=4;
		}else{
			if(reversal>=1) reversal/=100;	// it is a percentage, so if sent as a hole number, transform to percentage multiplier
		}
		var newDataSet=[];
		var q1=null;
		for(var i=0;i<dataSet.length;i++){
			var q=dataSet[i];
			if(!q) continue;
			if(!q1) {
				q1=q;
				continue;
			}
			if(q1.Open>q1.Close){
				if(q.Close>q1.Close*(1+reversal)){ //reversal up
					q.Open=q1.Close;
				}else{
					if(q1.Close>q.Close) q1.Close=q.Close;
					q1.Volume+=q.Volume;
					if(i<dataSet.length-1) continue;
				}
			}else if(q1.Open<q1.Close){
				if(q.Close<q1.Close*(1-reversal)){ //reversal down
					q.Open=q1.Close;
				}else{
					if(q1.Close<q.Close) q1.Close=q.Close;
					q1.Volume+=q.Volume;
					if(i<dataSet.length-1) continue;
				}
			}else{
				q1.Close=q.Close;
				q1.Volume+=q.Volume;
				if(i<dataSet.length-1) continue;
			}
			newDataSet.push({
				DT: q1.DT,
				displayDate: q1.displayDate,
				Date: q1.Date,
				Open: q1.Open,
				Close: q1.Close,
				High: Math.max(q1.Open,q1.Close),
				Low: Math.min(q1.Open,q1.Close),
				Volume: q1.Volume,
				iqPrevClose: q1.iqPrevClose
			});
			q1=q;
		}
		return newDataSet;
	};

	/**
	 * Calculates Line Break chart values. Takes a dataSet and returns a replacement dataSet.
	 * This method is used inside {@link CIQ.ChartEngine#createDataSet} to determine the data aggregation logic and should not be called directly.
	 * Use {@link CIQ.ChartEngine#setAggregationType} instead.
	 * @param {CIQ.ChartEngine} stx   The chart object
	 * @param {array} dataSet The dataSet to modify
	 * @param {number} pricelines The number of lines to use for the line break count. This is typically user configurable. Default is 3.
	 * @return {array}        The replacement dataSet
	 * @memberOf CIQ
	 * @since 04-2015-15
	 * @version ChartIQ Advanced Package
	 */

	CIQ.calculateLineBreak=function(stx, dataSet, pricelines){
		if(!dataSet.length) return dataSet;
		if(!pricelines) pricelines=3;

		var newDataSet=[];
		var volume=0;
		for(var i=0;i<dataSet.length;i++){
			var q=dataSet[i];
			if(!q) continue;
			volume+=q.Volume;
			var q1=newDataSet[newDataSet.length-1];
			if(!q1) q1={Open:q.Open,Close:q.Open};
			var newLine={
				DT: q.DT,
				displayDate: q.displayDate,
				Date: q.Date,
				Close: q.Close,
				High: Math.max(q.Close,Math.min(q1.Open,q1.Close)),
				Low: Math.min(q.Close,Math.max(q1.Open,q1.Close)),
				Volume: volume,
				iqPrevClose: q1.Close
			};
			for(var j=0;j<pricelines;j++){
				var qx=newDataSet[newDataSet.length-1-j];
				if(qx){
					if(qx.Open>=q.Close && q.Close>=qx.Close) {
						newLine=null;
						break;
					}
					else if(qx.Open<=q.Close && q.Close<=qx.Close) {
						newLine=null;
						break;
					}
				}
			}
			if(newLine) {
				if(newLine.Close<q1.Close) newLine.Open=Math.min(q1.Open,q1.Close);
				else newLine.Open=Math.max(q1.Open,q1.Close);
				newDataSet.push(newLine);
				volume=0;
			}
		}
		return newDataSet;
	};

	/**
	 * Calculates Renko bars. Takes a dataSet and returns a replacement dataSet.
	 * This method is used inside {@link CIQ.ChartEngine#createDataSet} to determine the data aggregation logic and should not be called directly.
	 * Use {@link CIQ.ChartEngine#setAggregationType} instead.
	 * @param {CIQ.ChartEngine} stx   The chart object
	 * @param {array} dataSet The dataSet to modify
	 * @param {number} range The price range for the renko bars. This is typically user configurable. Defaults to 300 bars; about a year for a daily chart, about 5 hours on a minute chart.
	 * @return {array}        The replacement dataSet
	 * @memberOf CIQ
	 * @version ChartIQ Advanced Package
	 */

	CIQ.calculateRenkoBars=function(stx, dataSet, range){
		if(!dataSet.length) return dataSet;
		// If range is not specified we'll come up with a reasonable default value
		// caveman algorithm, finds a range so that ~300 bars worth of time are displayed
		// i.e. about a year for a daily chart, about 5 hours on a minute chart
		var l=Math.min(300, dataSet.length);
		var minMax=stx.determineMinMax(dataSet.slice(dataSet.length-l), ["Close","High","Low"]);
		var shadow=minMax[1]-minMax[0];
		var height=stx.panels[stx.chart.name].height;
		if(!range){
			range=shadow/(height/30); // assume ideal bar size is 30 pixels high
		}else{
			range=Math.max(range,shadow/height);
		}
		var newDataSet=[];

		var currentPrice=null, lowTarget=null, highTarget=null;

		function createBar(q, open, close){
			newDataSet.push({
				DT: q.DT,
				displayDate: q.displayDate,
				Date: q.Date,
				Open: open,
				Close: close,
				High: Math.max(open,close),
				Low: Math.min(open,close),
				Volume: 0,
				iqPrevClose: open
			});
		}

		for(var i=0;i<dataSet.length;i++){
			var q=dataSet[i];
			if(!q) continue;
			if(currentPrice===null) {
				var start=Math.floor(q.Open/range)*range;
				currentPrice=(isNaN(start)?q.Open:start);  //align it
				lowTarget=currentPrice-range;
				highTarget=currentPrice+range;
			}
			while(true){
				if(q.Close<=lowTarget){
					currentPrice=lowTarget;
					createBar(q, lowTarget+range, currentPrice);
					highTarget=lowTarget+2*range;
					lowTarget=lowTarget-range;
				}else if(q.Close>=highTarget){
					currentPrice=highTarget;
					createBar(q, highTarget-range, currentPrice);
					lowTarget=highTarget-2*range;
					highTarget=highTarget+range;
				}else break;
			}
		}
		/* current bar - leave out for now
		if(lowTarget<dataSet[dataSet.length-1].Close && lowTarget+range>dataSet[dataSet.length-1].Close)
			createBar(dataSet[dataSet.length-1], lowTarget+range, dataSet[dataSet.length-1].Close);
		else if(highTarget<dataSet[dataSet.length-1].Close && highTarget-range<dataSet[dataSet.length-1].Close)
			createBar(dataSet[dataSet.length-1], highTarget-range, dataSet[dataSet.length-1].Close);
		 */
		return newDataSet;
	};

	/**
	 * Calculates range bars. Takes a dataSet and returns a replacement dataSet.
	 * This method is used inside {@link CIQ.ChartEngine#createDataSet} to determine the data aggregation logic and should not be called directly.
	 * Use {@link CIQ.ChartEngine#setAggregationType} instead.
	 * @param {CIQ.ChartEngine} stx   The chart object
	 * @param {array} dataSet The dataSet to modify
	 * @param {number} range The price range for the range bars. This is typically user configurable. Defaults to 300 bars; about a year for a daily chart, about 5 hours on a minute chart.
	 * @return {array}        The replacement dataSet
	 * @memberOf CIQ
	 * @version ChartIQ Advanced Package
	 */

	CIQ.calculateRangeBars=function(stx, dataSet, range){
		if(!dataSet.length) return dataSet;
		// If range is not specified we'll come up with a reasonable default value
		// caveman algorithm, finds a range so that ~300 bars worth of time are displayed
		// i.e. about a year for a daily chart, about 5 hours on a minute chart
		var l=Math.min(300, dataSet.length);
		var minMax=stx.determineMinMax(dataSet.slice(dataSet.length-l), ["Close","High","Low"]);
		var shadow=minMax[1]-minMax[0];
		var height=stx.panels[stx.chart.name].height;
		if(!range){
			range=shadow/(height/30); // assume ideal bar size is 30 pixels high
		}else{
			range=Math.max(range,shadow/height);
		}
		var newDataSet=[];

		var currentPrice=null, targetPrice;

		function createBar(q, open, close){
			newDataSet.push({
				DT: q.DT,
				displayDate: q.displayDate,
				Date: q.Date,
				Open: open,
				Close: close,
				High: Math.max(open,close),
				Low: Math.min(open, close),
				Volume: 0,
				iqPrevClose: open
			});
		}
		// We translate directional movements O -> H -> L -> C -> O ...
		function processMove(q, b, isFinal){
			while(1){
				if(currentPrice<b){ // direction is upward
					targetPrice=currentPrice+range;
					if(b<targetPrice){
						if(isFinal) createBar(q, currentPrice, b); // print partial bar for current price
						return;
					}
				}else{ // direction is downward
					targetPrice=currentPrice-range;
					if(b>targetPrice){
						if(isFinal) createBar(q, currentPrice, b); // print partial bar for current price
						return;
					}
				}
				createBar(q, currentPrice, targetPrice);
				if(typeof(targetPrice)=="undefined" || typeof(currentPrice)=="undefined"){
					console.log("Uh oh undefined in calculateRangeBars:processMove");
					return;
				}
				currentPrice=targetPrice;
			}
		}
		for(var i=0;i<dataSet.length;i++){
			var q=dataSet[i];
			if(!q) continue;
			var C=q.Close, O=q.Open, H=q.High, L=q.Low;
			if(!O) O=C;

			if(currentPrice===null) {
				var start=Math.floor(O/range)*range;
				currentPrice=(isNaN(start)?O:start);  //align it
			}
			else processMove(dataSet[i-1], O);

			// shortest distance between open and either high or low determines initial direction
			if(H-O<O-L){
				if(H) processMove(q, H);
				if(L) processMove(q, L);
				processMove(q, C, i==dataSet.length-1);
			}else{
				if(L) processMove(q, L);
				if(H) processMove(q, H);
				processMove(q, C, i==dataSet.length-1);
			}
		}
		return newDataSet;
	};

	/**
	 * Calculates Point and Figure (P&F) chart values. Takes a dataSet and returns a replacement dataSet.
	 * This method is used inside {@link CIQ.ChartEngine#createDataSet} to determine the data aggregation logic and should not be called directly.
	 * Use {@link CIQ.ChartEngine#setAggregationType} instead.
	 * @param {CIQ.ChartEngine} stx   The chart object
	 * @param {array} dataSet The dataSet to modify
	 * @param {object} pandf The parameters for point and figure.
	 * @param {number} [pandf.box] The box size.  Default is automatically determined based on the price.
	 * @param {number} [pandf.reversal] The reversal amount, in boxes.  Default is 3.
	 * @return {array}        The replacement dataSet
	 * @memberOf CIQ
	 * @since 04-2015-15
	 * @version ChartIQ Advanced Package
	 */

	CIQ.calculatePointFigure=function(stx, dataSet, pandf){
		if(!dataSet.length) return dataSet;
		if(!pandf) pandf={};
		var box=pandf.box;
		if(!box) {
			box=1;
			var lastPrice=dataSet[dataSet.length-1].Close;
			if(lastPrice){
				if(lastPrice<0.25) box=0.0625;
				else if(lastPrice<1) box=0.125;
				else if(lastPrice<5) box=0.25;
				else if(lastPrice<20) box=0.5;
				else if(lastPrice<100) box=1;
				else if(lastPrice<200) box=2;
				else if(lastPrice<500) box=4;
				else if(lastPrice<1000) box=5;
				else if(lastPrice<25000) box=50;
				else box=500;
			}
			if(!stx.isDailyInterval(stx.layout.interval)) box/=10;
			if(CIQ.Market.Symbology.isForexSymbol(stx.chart.symbol)) {
				if(lastPrice){
					if(lastPrice<1) box=0.001;
					else if(lastPrice<2) box=0.002;
					else if(lastPrice<50) box=0.02;
					else if(lastPrice<200) box=0.2;
				}
				if(stx.isDailyInterval(stx.layout.interval)) box*=10;

			}
		}
		var reversal=pandf.reversal;
		if(!reversal) reversal=3;
		stx.chart.pandf={"box":box,"reversal":reversal};
		reversal*=box;

		var newDataSet=[];
		var volume=0;
		for(var i=0;i<dataSet.length;i++){
			var q=dataSet[i];
			if(!q) continue;
			volume+=q.Volume;
			if(!newDataSet.length) {
				newDataSet.push({
					DT: q.DT,
					displayDate: q.displayDate,
					Date: q.Date,
					Open: Math.floor(q.High/box)*box,
					Close: Math.ceil(q.Low/box)*box,
					High: q.High,
					Low: q.Low,
					Volume: volume,
					iqPrevClose: q.High+box
				});
				volume=0;
				continue;
			}
			var lastRun=newDataSet[newDataSet.length-1];
			if(lastRun.iqPrevClose>lastRun.Close){  //O
				if(q.Low<=lastRun.Close-box){ //extend
					lastRun.Close=Math.ceil(q.Low/box)*box;
					lastRun.High=Math.max(q.High,lastRun.High);
					lastRun.Low=Math.min(q.Low,lastRun.Low);
					lastRun.Volume+=volume;
				}else if(q.High>=lastRun.Close+reversal){ //reverse
					newDataSet.push({
						DT: q.DT,
						Date: q.Date,
						Open: lastRun.Close+box,
						Close: Math.floor(q.High/box)*box,
						High: q.High,
						Low: q.Low,
						Volume: volume,
						iqPrevClose: lastRun.Close
					});
				}else{
					lastRun.High=Math.max(q.High,lastRun.High);
					lastRun.Low=Math.min(q.Low,lastRun.Low);
					lastRun.Volume+=volume;
				}
				volume=0;
			}else if(lastRun.iqPrevClose<lastRun.Close){  //X
				if(q.High>=lastRun.Close+box){ //extend
					lastRun.Close=Math.floor(q.High/box)*box;
					lastRun.High=Math.max(q.High,lastRun.High);
					lastRun.Low=Math.min(q.Low,lastRun.Low);
					lastRun.Volume+=volume;
				}else if(q.Low<=lastRun.Close-reversal){ //reverse
					newDataSet.push({
						DT: q.DT,
						Date: q.Date,
						Open: lastRun.Close-box,
						Close: Math.ceil(q.Low/box)*box,
						High: q.High,
						Low: q.Low,
						Volume: volume,
						iqPrevClose: lastRun.Close
					});
				}else{
					lastRun.High=Math.max(q.High,lastRun.High);
					lastRun.Low=Math.min(q.Low,lastRun.Low);
					lastRun.Volume+=volume;
				}
				volume=0;
			}
		}
		return newDataSet;
	};

	return _exports;
});