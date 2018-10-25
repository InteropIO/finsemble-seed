//-------------------------------------------------------------------------------------------
// Copyright 2012-2017 by ChartIQ, Inc.
// All rights reserved
//-------------------------------------------------------------------------------------------
(function(_exports){
	var CIQ=_exports.CIQ;

	CIQ.Renderer.Aggregations=function(config){
		this.construct(config);
		var params=this.params;
		this.highLowBars=this.barsHaveWidth=this.standaloneBars=true;
		params.highlightable=false;
		if(params.name!="_main_series"){
			console.warn("Aggregations are only allowed on main series.");
			params.invalid=true;
		}
	};
	CIQ.Renderer.Aggregations.ciqInheritsFrom(CIQ.Renderer.OHLC, false);

	CIQ.Renderer.Aggregations.requestNew=function(featureList, params){
		var type=null, isHlc=false, isColored=false, isHollow=false, isVolume=false, histogram=false;
		for(var pt=0;pt<featureList.length;pt++){
			var pType=featureList[pt];
			switch(pType){
			case "kagi":
			case "pandf":
				type=pType;
				break;
			case "heikinashi":
			case "linebreak":
			case "rangebars":
			case "renko":
				type="candle";
				break;
			default:
				return null;  // invalid chartType for this renderer
			}
		}
		if(type===null) return null;

		return new CIQ.Renderer[type=="candle"?"OHLC":"Aggregations"]({
			params:CIQ.extend(params,{type:type})
		});	
	};
	
	CIQ.Renderer.Aggregations.prototype.drawIndividualSeries=function(chart, parameters){
		if(parameters.invalid) return;
		var stx=this.stx;
		var rc={colors:[]};
		if(parameters.type=="kagi"){
			stx.drawKagiSquareWave(chart.panel, "stx_kagi_up", "stx_kagi_down", parameters);
			rc.colors.push(stx.getCanvasColor("stx_kagi_up"));
			rc.colors.push(stx.getCanvasColor("stx_kagi_down"));
		}else if(parameters.type=="pandf"){
			stx.drawPointFigureChart(chart.panel, "stx_pandf_up", "X", parameters);
			rc.colors.push(stx.getCanvasColor("stx_pandf_up"));
			stx.drawPointFigureChart(chart.panel, "stx_pandf_down", "O", parameters);
			rc.colors.push(stx.getCanvasColor("stx_pandf_down"));
		}
		return rc;
	};

	
	CIQ.ChartEngine.prototype.drawKagiSquareWave=function(panel, upStyleName, downStyleName, parameters){
		var chart=panel.chart;
		this.startClip(panel.name);
		var quotes=chart.dataSegment;
		var context=chart.context;
		var upStyle=this.canvasStyle(upStyleName);
		var downStyle=this.canvasStyle(downStyleName);
		this.canvasColor(upStyleName);
		if(parameters.border_color_up) context.strokeStyle=parameters.border_color_up;
		var upColor=context.strokeStyle;
		this.canvasColor(downStyleName);
		if(parameters.border_color_down) context.strokeStyle=parameters.border_color_down;
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
		var leftTick=chart.dataSet.length - chart.scroll - 1;
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
			trend=quote.kagiTrend;
			if(quote.transform && chart.transformFunc) {
				var kagiPrevOpen=quote.kagiPrevOpen;
				quote=quote.transform;
				quote.kagiPrevOpen=chart.transformFunc(this,chart,kagiPrevOpen);
			}
			var cache=quote.cache;
			var tick=leftTick+x;
			if(tick<panel.cacheLeft || tick>panel.cacheRight || !cache.kagiOpen){
				cache.kagiOpen=(yAxis.semiLog?this.pixelFromTransformedValue(quote.Open,panel):((yAxis.high-quote.Open)*yAxis.multiplier)+yAxis.top); // inline version of pixelFromTransformedValue() for efficiency
				cache.kagiClose=(yAxis.semiLog?this.pixelFromTransformedValue(quote.Close,panel):((yAxis.high-quote.Close)*yAxis.multiplier)+yAxis.top); // inline version of pixelFromTransformedValue() for efficiency
			}
			previousOpen=(yAxis.semiLog?this.pixelFromTransformedValue(quote.kagiPrevOpen,panel):((yAxis.high-quote.kagiPrevOpen)*yAxis.multiplier)+yAxis.top);
			lastClose=cache.kagiClose;
			if(first) {
				context.moveTo(leftTick>=0?panel.left:Math.floor(xbase), cache.kagiOpen);
				context.lineTo(Math.floor(xbase), cache.kagiOpen);
				first=false;
			}
			if(trend!=-1 && cache.kagiClose<previousOpen && previousOpen<cache.kagiOpen){
				context.lineTo(Math.floor(xbase), previousOpen);
				if(!first) {
					context.stroke();
					context.beginPath();
					context.moveTo(Math.floor(xbase), previousOpen);
				}
				context.strokeStyle=upColor;
				context.lineWidth=upWidth;
			}else if(trend!=1 && cache.kagiClose>previousOpen && previousOpen>cache.kagiOpen){
				context.lineTo(Math.floor(xbase), previousOpen);
				if(!first){
					context.stroke();
					context.beginPath();
					context.moveTo(Math.floor(xbase), previousOpen);
				}
				context.strokeStyle=downColor;
				context.lineWidth=downWidth;
			}
			context.lineTo(Math.floor(xbase), cache.kagiClose);
			if(x+1<quotes.length){
				context.lineTo(Math.floor(xbase+this.layout.candleWidth), cache.kagiClose);
			}
			first=false;
		}
		context.stroke();
		this.endClip();
		context.lineWidth=1;
	};

	
	/**
	 * Draws the Point and Figure Chart. Called by {@link CIQ.ChartEngine.AdvancedInjectable#displayChart} via the Aggregations renderer
	 * 
	 * @param {CIQ.ChartEngine.Panel} panel	Panel to draw chart in.
	 * @param {string} style	Style to use for coloring. Uses `stx_pandf_down` and  `stx_pandf_up` styles for colors. See example for exact format.
	 * @param {string} condition	The condition to draw, 'X' or 'O'
	 * @param {object} params Configuration parameters for the colors (border_color_up and border_color_down)
	 * @memberof CIQ.ChartEngine
	 * @since 
	 * <br>&bull; 2015-04-24 added
	 * <br>&bull; 5.1.0 added parameters argument
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
	CIQ.ChartEngine.prototype.drawPointFigureChart=function(panel, style, condition, parameters){
		var chart=panel.chart;
		this.startClip(panel.name);
		var quotes=chart.dataSegment;
		var context=chart.context;
		this.canvasColor(style);
		if(condition=="X" && parameters.border_color_up) context.strokeStyle=parameters.border_color_up;
		else if(condition=="O" && parameters.border_color_down) context.strokeStyle=parameters.border_color_down;
		var pfstyle=this.canvasStyle(style);
		var paddingTop=parseInt(pfstyle.paddingTop,10);
		var paddingBottom=parseInt(pfstyle.paddingBottom,10);
		var paddingLeft=parseInt(pfstyle.paddingLeft,10);
		var paddingRight=parseInt(pfstyle.paddingRight,10);
		function drawX(left,right,start){
			context.moveTo(left+paddingLeft, start-paddingBottom+voffset);
			context.lineTo(right-paddingRight, start-height+paddingTop+voffset);
			context.moveTo(left+paddingLeft, start-height+paddingTop+voffset);
			context.lineTo(right-paddingRight, start-paddingBottom+voffset);			
		}
		function drawO(left,right,start){
			context.moveTo((left+right)/2, start+paddingTop-voffset);
			context.bezierCurveTo(right+paddingRight, start+paddingTop-voffset, right+paddingRight, start+height-paddingBottom-voffset, (left+right)/2, start+height-paddingBottom-voffset);
			context.bezierCurveTo(left-paddingLeft, start+height-paddingBottom-voffset, left-paddingLeft, start+paddingTop-voffset, (left+right)/2, start+paddingTop-voffset);			
		}
		if(pfstyle.width && parseInt(pfstyle.width,10)<=25){
			context.lineWidth=Math.max(1,CIQ.stripPX(pfstyle.width));
		}else{
			context.lineWidth=2;
		}
		context.beginPath();
		var box=this.chart.state.aggregation.box;
		var leftTick=chart.dataSet.length - chart.scroll - 1;
		var yAxis=panel.yAxis;
		var boxes, start;
		var height=box*yAxis.multiplier;
		var voffset=height/2;
		var candleWidth=this.layout.candleWidth;
		var xbase=panel.left-candleWidth+this.micropixels-1;
		for(var x=0;x<quotes.length;x++){
			xbase+=candleWidth;
			var quote=quotes[x];
			if(!quote) continue;
			if(quote.projection) break;
			//if(quote.candleWidth) candleWidth=quote.candleWidth;  // we're not supporting volume_candle chart type with p&f aggregation
			var open=quote.pfOpen;
			var close=quote.pfClose;
			var trend=quote.pfTrend;
			var oneStepBack=quote.pfStepBack;
			if(quote.transform && chart.transformFunc) {
				quote=quote.transform;
				open=chart.transformFunc(this,chart,open);
				close=chart.transformFunc(this,chart,close);
			}
			var cache=quote.cache;
			var tick=leftTick+x;
			if(tick<panel.cacheLeft || tick>panel.cacheRight || !cache.pfOpen){
				cache.pfOpen=((yAxis.high-open)*yAxis.multiplier)+yAxis.top; // inline version of pixelFromTransformedValue() for efficiency
				cache.pfClose=((yAxis.high-close)*yAxis.multiplier)+yAxis.top; // inline version of pixelFromTransformedValue() for efficiency
			}
			var xxl=Math.round(xbase);
			var xxr=Math.round(xbase+candleWidth);
			boxes=Math.abs(Math.round((close-open)/box));
			start=cache.pfOpen;
			if(condition==oneStepBack){
				if(oneStepBack=="X") drawX(xxl, xxr, start-height);
				else if(oneStepBack=="O") drawO(xxl, xxr, start+height);
			}
			if(condition==trend){
				for(;boxes>=0;boxes--){
					if(condition=="X"){
						drawX(xxl, xxr, start, height, voffset);
						start-=height;
					}else if(condition=="O"){
						drawO(xxl, xxr, start, height, voffset);
						start+=height;
					}
				}
			}
		}
		context.stroke();
		this.endClip();
		context.lineWidth=1;
	};

	/**
	 * Calculates Heikin-Ashi values. Takes some unaggregated data and returns aggregated data.
	 * 
	 * This method is used inside {@link CIQ.ChartEngine#createDataSet} to determine the data aggregation logic and should not be called directly.
	 * Use {@link CIQ.ChartEngine#setAggregationType} instead.
	 * 
	 * See the [Chart types](tutorial-Chart Styles and Types.html#OverridingDefaults) tutorial for details on how to override aggregation type defaults.
	 * 
	 * @param {CIQ.ChartEngine} stx   The chart object
	 * @param {array} newData The data to aggregate. Normally the dataSet.
	 * @param {array} computed Cumulative computed records from last pass through this function. Used to increase performance by reusing pre-calculated bars and only calculate missing new bars.
	 * @return {array}        The aggregated data
	 * @memberOf CIQ
	 * @since 
	 * <br>&bull; 04-2015-15 added
	 * <br>&bull; 3.0.0 computed parameter added
	 * @version ChartIQ Advanced Package
	 */

	CIQ.calculateHeikinAshi=function(stx, newData, computed){
		if(!newData.length) return newData;
		if(!computed) computed=[];

		var aggregatedData=[];

		for(var i=0;i<newData.length;i++){
			var q=newData[i];
			if(!q) continue;
			var q1=aggregatedData[aggregatedData.length-1];	// the previous data must be from an Heikin Ashi set not the unprocessed data
			if(!q1 && !i) q1=computed[computed.length-1];
			if(!q1) q1=q;
			var C=q.Close, O=q.Open, H=q.High, L=q.Low, O1=q1.Open;
			O=(O||O===0)?O:C;
			H=(H||H===0)?H:C;
			L=(L||L===0)?L:C;
			O1=(O1||O1===0)?O1:q1.Close;
			var xOpen=(O1+q1.Close)/2;
			var xClose=(O+H+L+C)/4;

			var newTick={
				DT: q.DT,
				displayDate: q.displayDate,
				Date: q.Date,
				Open: xOpen,
				Close: xClose,
				High: Math.max(H,Math.max(xOpen,xClose)),
				Low: Math.min(L,Math.min(xOpen,xClose)),
				Volume: q.Volume,
				iqPrevClose: q1.Close
			};

			// carry over pre existent fields such as server side data.
			for(var element in q){
				if ( !newTick[element] &&  newTick[element]!==0) { // if the element is not in the consolidated quote add it
					newTick[element] = q[element];
				}
			}
			aggregatedData.push(newTick);
		}
		return aggregatedData;
	};

	/**
	 * Calculates Kagi chart values. Takes some unaggregated data and returns aggregated data.
	 * 
	 * This method is used inside {@link CIQ.ChartEngine#createDataSet} to determine the data aggregation logic and should not be called directly.
	 * Use {@link CIQ.ChartEngine#setAggregationType} instead.
	 * 
	 * Kagi uses Close method only, not High/Low or ATR
	 * 
	 * See the [Chart types](tutorial-Chart Styles and Types.html#OverridingDefaults) tutorial for details on how to override aggregation type defaults.
	 * 
	 * @param {CIQ.ChartEngine} stx   The chart object
	 * @param {array} newData The data to aggregate. Normally the dataSet.
	 * @param {number} reversal The reversal percentage for the kagi lines. This is typically user configurable. Default is 4% for daily, .4% for intraday.
	 * @param {array} computed Cumulative computed records from last pass through this function. Used to increase performance by reusing pre-calculated bars and only calculate missing new bars.
	 * @return {array}        The aggregated data
	 * @memberOf CIQ
	 * @since 
	 * <br>&bull; 04-2015-15 added
	 * <br>&bull; 3.0.0 computed parameter added
	 * @version ChartIQ Advanced Package
	 */

	CIQ.calculateKagi=function(stx, newData, reversal, computed){
		if(!newData.length) return newData;
		if(!computed) computed=[];
		var layout=stx.layout;

		reversal=parseFloat(reversal);
		stx.chart.defaultChartStyleConfig.kagi=(CIQ.ChartEngine.isDailyInterval(layout.interval)?4:0.4);
		if(isNaN(reversal) || reversal<=0){
			reversal=stx.chart.defaultChartStyleConfig.kagi;
			if(CIQ.Market.Symbology.isForexSymbol(stx.chart.symbol)) reversal/=4;
			if(layout.kagi!==null){
				layout.kagi=null;
				stx.changeOccurred("layout");
			}
		}
		reversal/=100;	// it is a percentage, so transform to percentage multiplier
		var aggregatedData=[];
		var q1=computed[computed.length-1];
		var startDate=q1?q1.DT:0;
		for(var i=0;i<newData.length;i++){
			var q=newData[i];
			if(!q) continue;
			if(!q1) q1=newData[i-1];
			if(!q1) continue;

			var O1=(q1.Open||q1.Open===0)?q1.Open:q1.Close;
			//O1=(O1||O1===0)?O1:q1.Close;
			if(O1>q1.Close){
				if(q.Close>q1.Close*(1+reversal)){ //reversal up
					q.Open=q1.Close;
				}else{
					if(q1.Close>q.Close) q1.Close=q.Close;
					q1.Volume+=q.Volume;
					if(i<newData.length-1) continue;
				}
			}else if(O1<q1.Close){
				if(q.Close<q1.Close*(1-reversal)){ //reversal down
					q.Open=q1.Close;
				}else{
					if(q1.Close<q.Close) q1.Close=q.Close;
					q1.Volume+=q.Volume;
					if(i<newData.length-1) continue;
				}
			}else{
				q1.Close=q.Close;
				q1.Volume+=q.Volume;
				if(i<newData.length-1) continue;
			}

			var newTick={
				DT: q1.DT,
				displayDate: q1.displayDate,
				Date: q1.Date,
				Open: q1.Open,
				Close: q1.Close,
				High: Math.max(q1.Open,q1.Close),
				Low: Math.min(q1.Open,q1.Close),
				Volume: q1.Volume,
				iqPrevClose: q1.iqPrevClose
			};

			// carry over pre existent fields such as server side data.
			for(var element in q1){
				if ( !newTick[element] &&  newTick[element]!==0) { // if the element is not in the consolidated quote add it
					newTick[element] = q1[element];
				}
			}

			if(aggregatedData.length) newTick.kagiPrevOpen=aggregatedData[aggregatedData.length-1].Open;
			else newTick.kagiPrevOpen=newTick.Open;
			if(newTick.Close>newTick.kagiPrevOpen && newTick.kagiPrevOpen>newTick.Open) newTick.kagiTrend=1;
			else if(newTick.Close<newTick.kagiPrevOpen && newTick.kagiPrevOpen<newTick.Open) newTick.kagiTrend=-1;
			if(startDate<newTick.DT) aggregatedData.push(newTick);
			q1=q;
			stx.chart.currentQuote={Close:q.Close};
		}
		return aggregatedData;
	};

	/**
	 * Calculates Line Break chart values. Takes some unaggregated data and returns aggregated data.
	 * 
	 * This method is used inside {@link CIQ.ChartEngine#createDataSet} to determine the data aggregation logic and should not be called directly.
	 * Use {@link CIQ.ChartEngine#setAggregationType} instead.
	 * 
	 * See the [Chart types](tutorial-Chart Styles and Types.html#OverridingDefaults) tutorial for details on how to override aggregation type defaults.
	 * 
	 * @param {CIQ.ChartEngine} stx   The chart object
	 * @param {array} newData The data to aggregate. Normally the dataSet.
	 * @param {number} pricelines The number of lines to use for the line break count. This is typically user configurable. Default is 3.
	 * @param {array} computed Cumulative computed records from last pass through this function. Used to increase performance by reusing pre-calculated bars and only calculate missing new bars.
	 * @return {array}        The aggregated data
	 * @memberOf CIQ
	 * @since 
	 * <br>&bull; 04-2015-15 added
	 * <br>&bull; 3.0.0 computed parameter added
	 * @version ChartIQ Advanced Package
	 */

	CIQ.calculateLineBreak=function(stx, newData, pricelines, computed){
		if(!newData.length) return newData;
		if(!computed) computed=[];
		var layout=stx.layout;

		stx.chart.defaultChartStyleConfig.priceLines=3;
		pricelines=parseInt(pricelines,10);
		if(isNaN(pricelines) || pricelines<=0) {
			pricelines=stx.chart.defaultChartStyleConfig.priceLines;
			if(layout.priceLines!==null){
				layout.priceLines=null;
				stx.changeOccurred("layout");
			}
		}
		else if(pricelines>10) {  //arbitrary limit
			layout.priceLines=pricelines=10;
		}

		var aggregatedData=computed.slice(-pricelines);
		var toRemove=aggregatedData.length;
		var volume=0;
		outer:
		for(var i=0;i<newData.length;i++){
			var q=newData[i];
			if(!q) continue;
			volume+=q.Volume;
			var q1=aggregatedData[aggregatedData.length-1];
			if(!q1) q1={Open:q.Open,Close:q.Open,High:q.Open,Low:q.Open};
			var C1=q1.Close, H1=q1.High, L1=q1.Low, O1=q1.Open;
			H1=(H1||H1===0)?H1:C1;
			L1=(L1||L1===0)?L1:C1;
			O1=(O1||O1===0)?O1:C1;

			var newLine={
				DT: q.DT,
				displayDate: q.displayDate,
				Date: q.Date,
				Close: q.Close,
				Volume: volume,
				iqPrevClose: C1
			};
			stx.chart.currentQuote={Close:q.Close};
			var j, qx;
			if(q.Close>C1 && q1.Close>O1){ //extension up
			}else if(q.Close<C1 && q1.Close<O1){ //extension down
			}else if(q.Close>H1){  //reversal up
				for(j=2;j<=pricelines;j++){
					qx=aggregatedData[aggregatedData.length-j];
					if(qx && q.Close<=qx.High) {
						continue outer;
					}
				}
			}else if(q.Close<L1){  //reversal down
				for(j=2;j<=pricelines;j++){
					qx=aggregatedData[aggregatedData.length-j];
					if(qx && q.Close>=qx.Low) {
						continue outer;
					}
				}
			}else continue;

			if(q.Close<q1.Close) newLine.Open=Math.min(O1,C1);
			else newLine.Open=Math.max(O1,C1);

			newLine.Low=Math.min(newLine.Open,newLine.Close);
			newLine.High=Math.max(newLine.Open,newLine.Close);

			// carry over pre existent fields such as server side data.
			for(var element in q){
				if ( !newLine[element] &&  newLine[element]!==0) { // if the element is not in the consolidated quote add it
					newLine[element] = q[element];
				}
			}

			aggregatedData.push(newLine);
			volume=0;
		}
		return aggregatedData.slice(toRemove);
	};

	/**
	 * Calculates Renko bars. Takes some unaggregated data and returns aggregated data.
	 * 
	 * This method is used inside {@link CIQ.ChartEngine#createDataSet} to determine the data aggregation logic and should not be called directly.
	 * Use {@link CIQ.ChartEngine#setAggregationType} instead.
	 * 
	 * Renko bars use Close method only, not High/Low or ATR
	 * 
	 * See the [Chart types](tutorial-Chart Styles and Types.html#OverridingDefaults) tutorial for details on how to override aggregation type defaults.
	 * 
	 * @param {CIQ.ChartEngine} stx   The chart object
	 * @param {array} newData The data to aggregate. Normally the dataSet.
	 * @param {number} range The brick size for the renko bars. This is typically user configurable. Defaults to a brick size so that about 300 bars worth of time are displayed; about a year for a daily chart, about 5 hours on a minute chart.
	 * @param {array} computed Cumulative computed records from last pass through this function. Used to increase performance by reusing pre-calculated bars and only calculate missing new bars.
	 * @return {array}        The aggregated data
	 * @memberOf CIQ
	 * @since 3.0.0 computed parameter added
	 * @version ChartIQ Advanced Package
	 */

	CIQ.calculateRenkoBars=function(stx, newData, range, computed){
		if(!newData.length) return [];
		if(!computed) computed=[];
		var layout=stx.layout;

		var state=stx.chart.state.aggregation;
		if(!state) state=stx.chart.state.aggregation={};
		// If range is not specified we'll come up with a reasonable default value
		// caveman algorithm, finds a range so that ~300 bars worth of time are displayed
		// i.e. about a year for a daily chart, about 5 hours on a minute chart
		var l=Math.min(300, newData.length);
		if(!state.minMax) state.minMax=stx.determineMinMax(newData.slice(newData.length-l), ["Close","High","Low"]);
		var shadow=state.minMax[1]-state.minMax[0];
		var height=stx.panels[stx.chart.name].height;
		if(!height) return [];
		stx.chart.defaultChartStyleConfig.renko=Math.floor(10000*shadow/(height/30))/10000; // assume ideal bar size is 30 pixels high
		if(range===null || isNaN(range) || range<=0){
			range=stx.chart.defaultChartStyleConfig.renko;
			if(layout.renko!==null){
				layout.renko=null;
				stx.changeOccurred("layout");
			}
		}else{
			range=Math.max(range,shadow/height);
			if(layout.renko!==range){
				layout.renko=range;
				stx.changeOccurred("layout");
			}
		}
		var aggregatedData=[];
		var lowTarget=null, highTarget=null, startQuote=null;
		if(computed.length){
			var previousBar=computed[computed.length-1];
			lowTarget=previousBar.Low-range;
			highTarget=previousBar.High+range;
		}

		function createBar(open, close){
			// anything more than 8 decimal places is rounding error, so "fix" it to 8
			open=Number(open.toFixed(8));
			close=Number(close.toFixed(8));
			var newTick={
				DT: startQuote.DT,
				displayDate: startQuote.displayDate,
				Date: startQuote.Date,
				Open: open,
				Close: close,
				High: Math.max(open,close),
				Low: Math.min(open,close),
				Volume: 0,
				iqPrevClose: open!=close?open:null
			};

			// carry over pre existent fields such as server side data.
			for(var element in startQuote){
				if ( !newTick[element] &&  newTick[element]!==0) { // if the element is not in the consolidated quote add it
					newTick[element] = startQuote[element];
				}
			}

			aggregatedData.push(newTick);
		}

		for(var i=0;i<newData.length;i++){
			var q=newData[i];
			if(!q) continue;
			if(!lowTarget && !highTarget){
				var O=(q.Open||q.Open===0)?q.Open:q.Close;
				var start=Math.floor(O/range)*range;
				var currentPrice=(isNaN(start)?O:start);  //align it
				lowTarget=currentPrice-range;
				highTarget=currentPrice+range;
			}
			while(true){
				if(!startQuote) startQuote=q;
				if(q.Close<=lowTarget){
					createBar(lowTarget+range, lowTarget);
					highTarget=lowTarget+2*range;
					lowTarget-=range;
					startQuote=null;
				}else if(q.Close>=highTarget){
					createBar(highTarget-range, highTarget);
					lowTarget=highTarget-2*range;
					highTarget+=range;
					startQuote=null;
				}else break;
			}
			stx.chart.currentQuote=q;
		}
		// current bar
		if(lowTarget<newData[newData.length-1].Close && lowTarget+range>newData[newData.length-1].Close)
			createBar(lowTarget+range, newData[newData.length-1].Close);
		else if(highTarget>newData[newData.length-1].Close && highTarget-range<newData[newData.length-1].Close)
			createBar(highTarget-range, newData[newData.length-1].Close);

		return aggregatedData;
	};

	/**
	 * Calculates range bars. Takes some unaggregated data and returns aggregated data.
	 * 
	 * This method is used inside {@link CIQ.ChartEngine#createDataSet} to determine the data aggregation logic and should not be called directly.
	 * Use {@link CIQ.ChartEngine#setAggregationType} instead.
	 * 
	 * See the [Chart types](tutorial-Chart Styles and Types.html#OverridingDefaults) tutorial for details on how to override aggregation type defaults.
	 * 
	 * @param {CIQ.ChartEngine} stx   The chart object
	 * @param {array} newData The data to aggregate. Normally the dataSet.
	 * @param {number} range The price range for the range bars. This is typically user configurable. Defaults to a ramge size so that about 300 bars worth of time are displayed; about a year for a daily chart, about 5 hours on a minute chart.
	 * @param {array} computed Cumulative computed records from last pass through this function. Used to increase performance by reusing pre-calculated bars and only calculate missing new bars.
	 * @return {array}        The aggregated data
	 * @memberOf CIQ
	 * @since 3.0.0 computed parameter added
	 * @version ChartIQ Advanced Package
	 */

	CIQ.calculateRangeBars=function(stx, newData, range, computed){
		if(!newData.length) return newData;
		if(!computed) computed=[];
		var layout=stx.layout;

		var state=stx.chart.state.aggregation;
		if(!state) state=stx.chart.state.aggregation={};
		// If range is not specified we'll come up with a reasonable default value
		// caveman algorithm, finds a range so that ~300 bars worth of time are displayed
		// i.e. about a year for a daily chart, about 5 hours on a minute chart
		var l=Math.min(300, newData.length);
		if(!state.minMax) state.minMax=stx.determineMinMax(newData.slice(newData.length-l), ["Close","High","Low"]);
		var shadow=state.minMax[1]-state.minMax[0];
		var height=stx.panels[stx.chart.name].height;
		if(!height) return [];
		stx.chart.defaultChartStyleConfig.range=Math.floor(10000*shadow/(height/30))/10000; // assume ideal bar size is 30 pixels high
		if(range===null || isNaN(range) || range<0){
			range=stx.chart.defaultChartStyleConfig.range;
			if(layout.range!==null){
				layout.range=null;
				stx.changeOccurred("layout");
			}
		}else{
			range=Math.max(range,shadow/height);
			if(layout.range!==range){
				layout.range=range;
				stx.changeOccurred("layout");
			}
		}
		var aggregatedData=[];

		var currentPrice=null, highTarget=null, lowTarget=null, lastClose=null, startQuote=null;

		function createBar(close){
			var newTick={
				DT: startQuote.DT,
				displayDate: startQuote.displayDate,
				Date: startQuote.Date,
				Open: Number(lastClose.toFixed(8)),  // rounding
				Close: Number(close.toFixed(8)),
				High: Number(highTarget.toFixed(8)),
				Low: Number(lowTarget.toFixed(8)),
				Volume: 0
			};
			newTick.iqPrevClose=newTick.Open;

			// carry over pre existent fields such as server side data.
			for(var element in startQuote){
				if ( !newTick[element] &&  newTick[element]!==0) { // if the element is not in the consolidated quote add it
					newTick[element] = startQuote[element];
				}
			}

			aggregatedData.push(newTick);

		}
		// We translate directional movements O -> H -> L -> C -> O ...
		function processMove(q, b){
			while(1){
				if(!startQuote) startQuote=q;
				if(currentPrice<b){ // direction is upward
					currentPrice=Math.min(b,highTarget);
					lowTarget=Math.max(lowTarget, currentPrice-range);
					if(b<highTarget) break;
				}else if(currentPrice>=b){ // direction is downward
					currentPrice=Math.max(b,lowTarget);
					highTarget=Math.min(highTarget, currentPrice+range);
					if(b>lowTarget) break;
				}
				if(typeof(currentPrice)=="undefined"){
					console.log("Uh oh undefined in calculateRangeBars:processMove");
					return;
				}
				createBar(currentPrice);
				startQuote=null;
				resetTargets();
			}
		}
		function resetTargets(){
			highTarget=currentPrice+range;
			lowTarget=currentPrice-range;
			lastClose=currentPrice;
		}
		for(var i=0;i<newData.length;i++){
			var q=newData[i];
			if(!q) continue;
			var q1=newData[i-1];
			if(!i){
				if(!q1) q1=computed[computed.length-1];
				if(q1){
					currentPrice=q1.Close;
					if(currentPrice || currentPrice===0) resetTargets();
				}
			}
			if(!q1) continue;
			var C=q.Close, O=q.Open, H=q.High, L=q.Low;
			if(!C && C!==0) continue;
			O=(O||O===0)?O:C;
			H=(H||H===0)?H:C;
			L=(L||L===0)?L:C;

			if(!currentPrice && currentPrice!==0) {
				var start=Math.floor(O/range)*range;
				currentPrice=(isNaN(start)?O:start);  //align it
				resetTargets();
				processMove(q1, O);
			}

			if(i) processMove(q, O);
			// shortest distance between open and either high or low determines initial direction
			if(H-O<O-L){
				if(H) processMove(q, H);
				if(L) processMove(q, L);
			}else{
				if(L) processMove(q, L);
				if(H) processMove(q, H);
			}
			processMove(q, C);
			if(i==newData.length-1 && C!=lastClose){
				var tempHighTarget=highTarget;
				highTarget=lowTarget+range;
				lowTarget=tempHighTarget-range;
				createBar(C);
			}
		}
		return aggregatedData;
	};

	/**
	 * Calculates Point and Figure (P&F) chart values. Takes some unaggregated data and returns aggregated data.
	 * 
	 * This method is used inside {@link CIQ.ChartEngine#createDataSet} to determine the data aggregation logic and should not be called directly.
	 * Use {@link CIQ.ChartEngine#setAggregationType} instead.
	 * 
	 * See the [Chart types](tutorial-Chart Styles and Types.html#OverridingDefaults) tutorial for details on how to override aggregation type defaults.
	 * 
	 * @param {CIQ.ChartEngine} stx   The chart object
	 * @param {array} newData The data to aggregate. Normally the dataSet.
	 * @param {object} pandf The parameters for point and figure.
	 * @param {number} [pandf.box] The box size.  Default is automatically determined based on the price.
	 * @param {number} [pandf.reversal] The reversal amount, in boxes.  Default is 3.
	 * @param {array} computed Cumulative computed records from last pass through this function. Used to increase performance by reusing pre-calculated bars and only calculate missing new bars.
	 * @return {array}        The aggregated data
	 * @memberOf CIQ
	 * @since 04-2015-15 added
	 * @since 3.0.0 computed parameter added
	 * @version ChartIQ Advanced Package
	 */

	CIQ.calculatePointFigure=function(stx, newData, pandf, computed){
		if(!newData.length) return newData;
		if(!computed) computed=[];
		var state=stx.chart.state.aggregation;
		if(!state) state=stx.chart.state.aggregation={};
		var layout=stx.layout;

		function completeBar(q,newTick){
			// carry over pre existent fields such as server side data.
			for(var element in q){
				if ( !newTick[element] &&  newTick[element]!==0) { // if the element is not in the consolidated quote add it
					newTick[element] = q[element];
				}
			}
			return newTick;
		}
		function setHLCV(quote, high, low, close, volume){
			quote.High=Math.max(high,quote.High);
			quote.Low=Math.min(low,quote.Low);
			quote.Close=close;
			quote.Volume+=volume;
		}

		stx.chart.defaultChartStyleConfig.box=1;
		stx.chart.defaultChartStyleConfig.reversal=3;
		if(!pandf) pandf={};
		var box=pandf.box;
		if(!box) {
			if(layout.pandf){
				if(layout.pandf.box!==null){
					layout.pandf.box=null;
					stx.changeOccurred("layout");
				}
			}
			box=stx.chart.defaultChartStyleConfig.box;
			var lastPrice=newData[newData.length-1].Close;
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
			if(!CIQ.ChartEngine.isDailyInterval(layout.interval)) box/=10;
			if(CIQ.Market.Symbology.isForexSymbol(stx.chart.symbol)) {
				if(lastPrice){
					if(lastPrice<1) box=0.001;
					else if(lastPrice<2) box=0.002;
					else if(lastPrice<50) box=0.02;
					else if(lastPrice<200) box=0.2;
				}
				if(CIQ.ChartEngine.isDailyInterval(layout.interval)) box*=10;
			}
			stx.chart.defaultChartStyleConfig.box=box;
		}
		box=parseFloat(box);
		if(isNaN(box) || box<=0) {
			if(layout.pandf) {
				if(layout.pandf.box!==null){
					layout.pandf.box=null;
					stx.changeOccurred("layout");
				}
			}
			stx.chart.defaultChartStyleConfig.box=box=1;
		}
		var reversal=Math.ceil(parseFloat(pandf.reversal));
		if(reversal>0 && reversal>pandf.reversal){
			layout.pandf.reversal=reversal;
			stx.changeOccurred("layout");
		}else if(isNaN(reversal) || reversal<=0){
			if(layout.pandf) {
				if(layout.pandf.reversal!==null){
					layout.pandf.reversal=null;
					stx.changeOccurred("layout");
				}
			}
			reversal=stx.chart.defaultChartStyleConfig.reversal;
		}
		state.box=box;
		reversal*=box;

		var EPS=0.00000001;
		var precision=(box.toString()+".").split(".")[1].length;

		function makeNewTick(q,O,H,L,C,V,P,pfO,pfC){
			return {
				DT: q.DT,
				Date: q.Date,
				pfOpen: pfO,
				pfClose: pfC,
				Open: O,
				Close: C,
				High: H,
				Low: L,
				Volume: V,
				iqPrevClose: P
			};			
		}
		
		var aggregatedData=[];
		var volume=0;
		var newTick, q, lastRun;
		for(var i=0;i<newData.length;i++){
			q=newData[i];
			if(!q) continue;
			volume+=q.Volume;
			var C=q.Close, O=q.Open, H=q.High, L=q.Low, pfOpen, pfClose;
			O=(O||O===0)?O:C;
			H=(H||H===0)?H:C;
			L=(L||L===0)?L:C;
			if(!aggregatedData.length && !computed.length) {
				newTick=completeBar(q,makeNewTick(q,O,H,L,C,volume,H+box,
										Number((Math.ceil(L/box-EPS)*box).toFixed(precision)),
										Number((Math.floor(H/box+EPS)*box).toFixed(precision))));
				newTick.pfTrend="X";
				if(newTick.pfOpen==newTick.pfClose){ // one step back rule
					newTick.pfStepBack="-";
				}
				aggregatedData.push(newTick);
				volume=0;
				continue;
			}
			lastRun=aggregatedData[aggregatedData.length-1];
			if(!lastRun) lastRun=CIQ.clone(computed[computed.length-1]);
			if(lastRun.pfTrend=="O"){
				if(L<=lastRun.pfClose-box){  //extension
					lastRun.pfClose=Number((Math.ceil(L/box-EPS)*box).toFixed(precision));
					if(lastRun.pfStepBack=="O") lastRun.pfStepBack=null;
					setHLCV(lastRun, H, L, C, volume);
				}else if(H>=lastRun.pfClose+reversal){ //reversal
					pfOpen=lastRun.pfClose+box;
					pfClose=Number((Math.floor(H/box+EPS)*box).toFixed(precision));
					newTick=makeNewTick(q,O,H,L,C,volume,lastRun.pfClose,pfOpen,pfClose);
					if(pfOpen==pfClose){ // one step back rule
						newTick.pfStepBack="X";
					}
					if(lastRun.pfStepBack=="O"){
						lastRun.pfOpen=pfOpen;
						lastRun.pfClose=pfClose;
						lastRun.pfTrend="X";
						setHLCV(lastRun, H, L, C, volume);
					}else{
						newTick=completeBar(q,newTick);
						newTick.pfTrend="X";
						aggregatedData.push(newTick);
					}
				}else{  //stagnate
					setHLCV(lastRun, H, L, C, volume);
				}
				volume=0;
			}else if(lastRun.pfTrend=="X"){
				if(H>=lastRun.pfClose+box){  //extension
					lastRun.pfClose=Number((Math.floor(H/box+EPS)*box).toFixed(precision));
					if(lastRun.pfStepBack=="X" || lastRun.pfStepBack=="-") lastRun.pfStepBack=null;
					setHLCV(lastRun, H, L, C, volume);
				}else if(L<=lastRun.pfClose-reversal){ //reversal
					pfOpen=lastRun.pfClose-box;
					pfClose=Number((Math.ceil(L/box-EPS)*box).toFixed(precision));
					newTick=makeNewTick(q,O,H,L,C,volume,lastRun.pfClose,pfOpen,pfClose);
					if(pfOpen==pfClose){ // one step back rule
						newTick.pfStepBack="O";
					}
					if(lastRun.pfStepBack=="X" || lastRun.pfStepBack=="-"){
						lastRun.pfOpen=pfOpen;
						lastRun.pfClose=pfClose;
						lastRun.pfTrend="O";
						setHLCV(lastRun, H, L, C, volume);
						if(pfOpen!=pfClose && lastRun.pfStepBack=="-") lastRun.pfStepBack=null;
					}else{
						newTick=completeBar(q,newTick);
						newTick.pfTrend="O";
						aggregatedData.push(newTick);
					}
				}else{  //stagnate
					setHLCV(lastRun, H, L, C, volume);
				}
				volume=0;
			}
		}
		return aggregatedData;
	};

	return _exports;
})/* removeIf(umd) */(typeof window !== 'undefined' ? window : global)/* endRemoveIf(umd) */;
