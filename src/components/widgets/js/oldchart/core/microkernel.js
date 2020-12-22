//-------------------------------------------------------------------------------------------
// Copyright 2012-2016 by ChartIQ, Inc.
// All rights reserved
//-------------------------------------------------------------------------------------------

(function (definition) {
	"use strict";

	if (typeof exports === "object" && typeof module === "object") {
		module.exports = definition( require('./engine') );
	} else if (typeof define === "function" && define.amd) {
		define(['core/engine'], definition);
	} else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition(global);
	} else {
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for microkernel.js.");
	}
})(function(_exports){
	console.log("microkernel.js",_exports);
	var CIQ=_exports.CIQ;
	var plotSpline=_exports.plotSpline;

	/**
	 * <span class="injection">INJECTABLE</span>
	 * <span class="animation">Animation Loop</span>
	 * Draws the x-axis. This assumes that the axisRepresentation has previously been calculated by {@link CIQ.ChartEngine.AdvancedInjectable#createXAxis}
	 *
	 * CSS Styles used:
	 * - Text = "stx_xaxis"
	 * - Grid Line = "stx_grid"
	 * - Boundary Line = "stx_grid_dark"
	 * - Border = "stx_grid_border"
	 *
	 * @param  {CIQ.ChartEngine.Chart} chart			   Chart object
	 * @param  {CIQ.ChartEngine.XAxisLabel[]} axisRepresentation Axis representation object created by createXAxis. This should be an array of axis labels.
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias drawXAxis
	 */
	CIQ.ChartEngine.prototype.drawXAxis=function(chart, axisRepresentation){
		var arguments$=[chart, axisRepresentation];
		if(this.runPrepend("drawXAxis", arguments$)) return;
		if(!axisRepresentation) return;
		var priorBoundary=null;
		var context=this.chart.context;
		this.canvasFont("stx_xaxis");
		context.textAlign="center";
		context.textBaseline="middle";

		var obj;
		var spaceWidth=context.measureText("   ").width; // add 4 spaces so they don't bump on each other and there is a reasonable visually detectable separation between tags
		for(var j=0;j<axisRepresentation.length;j++){
			obj=axisRepresentation[j];
			var w=context.measureText(obj.text).width;
			var w2=Math.max(w+spaceWidth, chart.xAxis.minimumLabelWidth);
			obj.hz=Math.floor(obj.hz+this.micropixels)+0.5;
			obj.left=obj.hz-(w2/2);
			obj.right=obj.hz+(w2/2);
			obj.unpaddedRight=obj.hz+(w/2);
		}

		var plotter=new CIQ.Plotter();
		plotter.newSeries("line","stroke", this.canvasStyle("stx_grid"));
		plotter.newSeries("boundary","stroke", this.canvasStyle("stx_grid_dark"));
		plotter.newSeries("border","stroke", this.canvasStyle("stx_grid_border"));

		var bottom = this.xAxisAsFooter === true ? this.chart.canvasHeight : chart.panel.bottom;
		var wPanel = this.whichPanel(bottom - 1); // subtract 1 because whichPanel is designed for displaying the crosshair
		if (!wPanel) return; // happens if window height increases during resize
		var yAxis = wPanel.yAxis;
		this.adjustYAxisHeightOffset(wPanel, yAxis);
		var prevRight=-1;
		var nextBoundaryLeft=Math.MAX_VALUE;
		var drawBorders=chart.xAxis.displayBorder || chart.xAxis.displayBorder===null;
		if(this.axisBorders===true) drawBorders=true;
		if(this.axisBorders===false) drawBorders=false;
		var b=drawBorders?yAxis.bottom-0.5:yAxis.bottom;
		var middle=bottom-this.xaxisHeight/2;
		if(drawBorders) middle+=3;

		for(var nb=0;nb<axisRepresentation.length;nb++){
			if(axisRepresentation[nb].grid=="boundary"){
				nextBoundaryLeft=axisRepresentation[nb].left;
				break;
			}
		}
		//var gridDistance=0, boundaryDistance=0;
		var prevHz=0;
		var count=0;
		for(var i=0;i<axisRepresentation.length;i++){
			obj=axisRepresentation[i];
			// Check for overlap
			if(i==nb){
				for(nb++;nb<axisRepresentation.length;nb++){
					if(axisRepresentation[nb].grid=="boundary"){
						nextBoundaryLeft=axisRepresentation[nb].left;
						break;
					}
				}
				if(nb>=axisRepresentation.length){ // no more boundaries
					nb=-1;
					nextBoundaryLeft=Math.MAX_VALUE;
				}
				if(prevRight>-1){
					if(obj.left<prevRight) continue;
				}
			}else{
				if(prevRight>-1){
					if(obj.left<prevRight) continue;
				}
				if(obj.right>nextBoundaryLeft) continue;
			}
			prevRight=obj.right;
			if((/*obj.hz>=0 && */Math.floor(obj.unpaddedRight)<=this.chart.right)){
				count++;
				if(chart.xAxis.displayGridLines){
					plotter.moveTo(obj.grid, obj.hz, this.xAxisAsFooter === true ? 0 : yAxis.top);
					plotter.lineTo(obj.grid, obj.hz, b);
				}
				if(drawBorders){
					plotter.moveTo("border", obj.hz, b+0.5);
					plotter.lineTo("border", obj.hz, b+6);
				}
				prevHz=obj.hz;
				this.canvasColor(obj.grid=="boundary"?"stx_xaxis_dark":"stx_xaxis");
				context.fillText(obj.text, obj.hz, middle);
			}
		}

		if(drawBorders){
			var bb=Math.round(yAxis.bottom)+0.5;
			var wb=Math.round(chart.right)+0.5;
			plotter.moveTo("border", chart.left, bb);
			plotter.lineTo("border", wb, bb);
		}

		plotter.draw(context);

		context.textAlign="left";
		this.runAppend("drawXAxis", arguments$);
	};

	/**
	 * Draws date based x-axis.
	 * It uses an algorithm to determine the best possible labeling, from milliseconds up to years, and uses "pretty" multipliers (such as 5 minutes, 15 minutes, 1 hour, etc).
	 *
	 * chart.xAxis.timeUnit and chart.xAxis.timeUnitMultiplier can be hard set to override the algorithm (See {@tutorial Custom X-axis} for additional details).
	 *
	 * This method is algorithmically designed to create an x-axis that is responsive to various degrees of user panning, zooming, and periodicity selection.
	 * It will print different versions of dates or times depending on those factors, attempting to prevent overlaps and evenly spacing labels.
	 * If a locale is set, then internationalized dates will be used.
	 *
	 * The algorithm is also market hours aware. See {@link CIQ.Market} for details on how to set market hours for the different exchanges.
	 *
	 * This method sets the CIQ.ChartEngine.chart.xaxis array which is a representation of the complete x-axis including future dates.
	 * Each array entry contains an object:<br>
	 * DT – The date/time displayed on the x-axis<br>
	 * date – yyyymmddhhmm string representation of the date<br>
	 * data – If the xaxis coordinate is in the past, then a reference to the chart data element for that date<br>
	 *
	 * @param  {object} [chart] The chart to print the xaxis
	 * @return {CIQ.ChartEngine.XAxisLabel[]}			axisRepresentation that can be passed in to {@link CIQ.ChartEngine#drawXAxis}
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.createTickXAxisWithDates=function(chart){
		if(!chart) chart=this.chart;
		chart.xaxis=[];
		//console.log("");
		// These are all the possible time intervals. Not so easy to come up with a formula since time based switches
		// from 10 to 60 to 24 to 365
		var timePossibilities, timeIntervalMap;
		if(!this.timeIntervalMap){
			this.timePossibilities=[CIQ.MILLISECOND,CIQ.SECOND,CIQ.MINUTE,CIQ.HOUR,CIQ.DAY,CIQ.MONTH,CIQ.YEAR];
			timeIntervalMap={};
			timeIntervalMap[CIQ.MILLISECOND]={
				arr: [1,2,5,10,20,50,100,250,500],
				minTimeUnit:0,
				maxTimeUnit:1000
			};
			timeIntervalMap[CIQ.SECOND]={
				arr: [1, 2, 5, 10,15,30],
				minTimeUnit: 0,
				maxTimeUnit: 60
			};
			timeIntervalMap[CIQ.MINUTE]={
				arr: [1,2,5,10,15,30],
				minTimeUnit: 0,
				maxTimeUnit: 60
			};
			timeIntervalMap[CIQ.HOUR]={
				arr: [1,2,3,4,6,12],
				minTimeUnit: 0,
				maxTimeUnit: 24
			};
			timeIntervalMap[CIQ.DAY]={
				arr: [1,2,7,14],
				minTimeUnit: 1,
				maxTimeUnit: 32
			};
			timeIntervalMap[CIQ.MONTH]={
				arr: [1,2,3,6],
				minTimeUnit:1,
				maxTimeUnit:13
			};
			timeIntervalMap[CIQ.YEAR]={
				arr: [1,2,3,5],
				minTimeUnit:1,
				maxTimeUnit:20000000
			};
			timeIntervalMap[CIQ.DECADE]={
				arr: [10],
				minTimeUnit: 0,
				maxTimeUnit: 2000000
			};
			this.timeIntervalMap=timeIntervalMap;
		}
		timeIntervalMap=this.timeIntervalMap;
		timePossibilities=this.timePossibilities;
		var daysInMonth=[31,28,31,30,31,30,31,31,30,31,30,31];

		var periodicity=this.layout.periodicity, interval=this.layout.interval;

		/* This section computes at which time interval we set the labels.*/
		var dataSegment=chart.dataSegment, xAxis=chart.xAxis;
		var idealTickSizePixels=xAxis.idealTickSizePixels?xAxis.idealTickSizePixels:xAxis.autoComputedTickSizePixels;
		var idealTicks=this.chart.width/idealTickSizePixels;
		for(var x=0;x<dataSegment.length;x++) if(dataSegment[x]) break; // find first valid bar in dataSegment
		// timeRange is the span of time in milliseconds across the dataSegment
		if(x==dataSegment.length) return [];

		var timeRange = 0;
		if (interval === parseInt(interval, 10)) {
			timeRange = interval * periodicity * 60000 * dataSegment.length;
		} else {
			timeRange=dataSegment[dataSegment.length-1].DT.getTime()-dataSegment[x].DT.getTime(); // simple calc
		}
		var self=this;
		function millisecondsPerTick(){
			// get previous open
			var iter_parms = {
				'begin': new Date(),
				'interval': "day",
				'periodicity': 1,
				'inZone': this.dataZone,
				'outZone': this.dataZone
			};
			var iter = chart.market.newIterator(iter_parms);
			iter.next();
			var dt1 = iter.previous();

			// tick forward one tick
			iter = self.standardMarketIterator(dt1, null, chart);
			var dt2 = iter.next();
			return dt2.getTime()-dt1.getTime();
		}
		if(timeRange===0){
			timeRange = millisecondsPerTick() * chart.maxTicks; // If zero or one ticks displayed
		}else{
			timeRange=(timeRange/dataSegment.length)*chart.maxTicks; // adjust timeRange in case dataSegment doesn't span entire chart (blank bars left or right of chart)
		}
		var msPerTick=timeRange/idealTicks;

		var i;
		// Find 1) the timePossibility which gives us the base time unit to iterate (for instance, SECONDS)
		// 2) Which timeIntervalMap. For instance the SECOND map allows 1,2,5,10,15,30 second increments
		for(i=0;i<timePossibilities.length;i++){
			if(timePossibilities[i]>msPerTick) break;
		}
		if(i===0){
			console.log("createTickXAxisWithDates: Assertion error. msPerTick < 1");
		}
		if(i==timePossibilities.length){ // In either of these cases, msPerTick will float through as simply timeRange/idealTicks
			i--;
		}else if(i>0){
			var prevUnit=timePossibilities[i-1];
			var prevMap=timeIntervalMap[prevUnit];
			var prevMultiplier=prevMap.arr[prevMap.arr.length-1];
			// Find the *closest* time possibility
			if(msPerTick-(prevUnit*prevMultiplier)<timePossibilities[i]-msPerTick)
				i--;
		}

		var timeUnit=timePossibilities[i];
		if(xAxis.timeUnit) timeUnit=xAxis.timeUnit;
		xAxis.activeTimeUnit=timeUnit; // for reference when drawing the floating label. So we know the precision we need to display.

		var timeInterval=CIQ.clone(timeIntervalMap[timeUnit]);

		// Now, find the right time unit multiplier
		for(i=0;i<timeInterval.arr.length;i++){
			if(timeInterval.arr[i]*timeUnit>msPerTick) break;
		}
		if(i==timeInterval.arr.length){
			i--;
		}else{
			// Find the *closest* interval
			if(msPerTick-timeInterval.arr[i-1]*timeUnit<timeInterval.arr[i]*timeUnit-msPerTick)
				i--;
		}
		var timeUnitMultiplier=timeInterval.arr[i];
		if(xAxis.timeUnitMultiplier) timeUnitMultiplier=xAxis.timeUnitMultiplier;

		//end TODO

		var axisRepresentation=[];

		for(i=0;i<=chart.maxTicks;i++){
			if(dataSegment[i]) break;
		}
		// TODO, The problem with doing this here is that for non-timebased charts, we don't yet know how much time we're displaying, so we don't know
		// relatively how far into the past we should go. It would be better to do this after we've calculated the amount of time occupied by the data
		// and then, figure out an appropriate spacing for which to count back in time (this current code merely uses the current interval)
		if(i>0 && i<chart.maxTicks){
			var iter1=this.standardMarketIterator(dataSegment[i].DT,xAxis.adjustTimeZone?this.displayZone:this.dataZone);
			for(var j=i;j>0;j--){
				var dt=iter1.previous();
				chart.xaxis.unshift({
					DT: dt,
					Date: CIQ.yyyymmddhhmmssmmm(dt) // todo, this is inefficient
				});
			}
		}

		var dtShifted=0;
		var nextTimeUnit=timeInterval.minTimeUnit;
		var previousTimeUnitLarge=-1;	// this will be used to keep track of when the next time unit up loops over
		var firstTick=true;
		var candleWidth=this.layout.candleWidth;

		var iter=null;
		for(i;i<chart.maxTicks;i++){
			if(i<dataSegment.length){
				var prices=dataSegment[i];
				if(prices.displayDate && xAxis.adjustTimeZone/* && timeUnit<CIQ.DAY*/){
					dtShifted=prices.displayDate;
				}else{
					dtShifted=prices.DT;
				}
				if(i && prices.leftOffset) candleWidth=(prices.leftOffset-prices.candleWidth/2)/i;
			}else{
				//TODO, if we were powerful programmers we would guestimate a reasonable interval
				//based on the amount of time displayed under existing bars
				if(this.layout.interval=="tick" && !xAxis.futureTicksInterval) break;
				if(!xAxis.futureTicks) break;
				if(!iter){
					iter=this.standardMarketIterator(dataSegment[dataSegment.length-1].DT,chart.adjustTimeZone?this.displayZone:this.dataZone);
				}
				dtShifted = iter.next();
			}
			var obj={
					DT: dtShifted,
					Date: CIQ.yyyymmddhhmmssmmm(dtShifted) // todo, this is inefficient
				};
			if(i<dataSegment.length) obj.data=dataSegment[i];	// xaxis should have reference to data to generate a head's up
			else obj.data=null;
			chart.xaxis.push(obj);

			var currentTimeUnit, currentTimeUnitLarge;
			if(timeUnit==CIQ.MILLISECOND){
				currentTimeUnit=dtShifted.getMilliseconds();
				currentTimeUnitLarge=dtShifted.getSeconds();
			}else if(timeUnit==CIQ.SECOND){
				currentTimeUnit=dtShifted.getSeconds();
				currentTimeUnitLarge=dtShifted.getMinutes();
			}else if(timeUnit==CIQ.MINUTE){
				currentTimeUnit=dtShifted.getMinutes();
				currentTimeUnitLarge=dtShifted.getHours();
			}else if(timeUnit==CIQ.HOUR){
				currentTimeUnit=dtShifted.getHours()+dtShifted.getMinutes()/60;
				currentTimeUnitLarge=dtShifted.getDate();
			}else if(timeUnit==CIQ.DAY){
				currentTimeUnit=dtShifted.getDate(); // TODO, get day of year
				currentTimeUnitLarge=dtShifted.getMonth()+1;
			}else if(timeUnit==CIQ.MONTH){
				currentTimeUnit=dtShifted.getMonth()+1;
				currentTimeUnitLarge=dtShifted.getFullYear();
			}else if(timeUnit==CIQ.YEAR){
				currentTimeUnit=dtShifted.getFullYear();
				currentTimeUnitLarge=dtShifted.getFullYear()+1000;
			}else{
				currentTimeUnit=dtShifted.getFullYear();
				currentTimeUnitLarge=0;
			}

			var text=null;
			var hz;
			if(previousTimeUnitLarge!=currentTimeUnitLarge){
				if(currentTimeUnit<=nextTimeUnit){ // case where we skipped ahead to the next large time unit
					nextTimeUnit=timeInterval.minTimeUnit;
				}
				// print a boundary
				hz=chart.left+(i*candleWidth)-1;
				text=null;
				if(timeUnit==CIQ.HOUR || (timeUnit==CIQ.MINUTE && previousTimeUnitLarge>currentTimeUnitLarge)){
					if(xAxis.formatter){
						text=xAxis.formatter(dtShifted, "boundary", CIQ.DAY, 1);
					}else{
						if(this.internationalizer){
							text=this.internationalizer.monthDay.format(dtShifted);
						}else{
							text=(dtShifted.getMonth()+1) + "/" + dtShifted.getDate();
						}
					}
				}else if(timeUnit==CIQ.DAY){
					if(previousTimeUnitLarge>currentTimeUnitLarge){ // year shift
						text=dtShifted.getFullYear();
					}else{
						text=CIQ.monthAsDisplay(dtShifted.getMonth(),false,this);
					}
				}else if(timeUnit==CIQ.MONTH){
					text=dtShifted.getFullYear();
				}
				if(text && previousTimeUnitLarge!=-1){
					axisRepresentation.push(new CIQ.ChartEngine.XAxisLabel(hz,"boundary",text));
				}
			}

			if(currentTimeUnit>=nextTimeUnit){ //passed the next expected axis label so let's print the label
				if(nextTimeUnit==timeInterval.minTimeUnit){
					if(currentTimeUnitLarge==previousTimeUnitLarge) continue; // we haven't looped back to zero yet
				}

				var labelDate=new Date(dtShifted);
				hz=chart.left+((2*i+1)*candleWidth)/2-1;
				var boundaryTimeUnit=Math.floor(currentTimeUnit/timeUnitMultiplier)*timeUnitMultiplier;
				if(boundaryTimeUnit<currentTimeUnit){
					if(this.layout.interval=="week") boundaryTimeUnit=currentTimeUnit;
					else hz-=candleWidth/4; // if we don't land on a label then position the label to the left of the bar; could be more accurate
				}
				// And print the boundary label rather than the actual date
				if(timeUnit==CIQ.MILLISECOND){
					labelDate.setMilliseconds(boundaryTimeUnit);
				}else if(timeUnit==CIQ.SECOND){
					labelDate.setMilliseconds(0);
					labelDate.setSeconds(boundaryTimeUnit);
				}else if(timeUnit==CIQ.MINUTE){
					labelDate.setMilliseconds(0);
					labelDate.setSeconds(0);
					labelDate.setMinutes(boundaryTimeUnit);
				}else if(timeUnit==CIQ.HOUR){
					labelDate.setMilliseconds(0);
					labelDate.setSeconds(0);
					labelDate.setMinutes(0);
					labelDate.setHours(boundaryTimeUnit);
				}else if(timeUnit==CIQ.DAY){
					labelDate.setDate(Math.max(1,boundaryTimeUnit)); //TODO, day of year
				}else if(timeUnit==CIQ.MONTH){
					labelDate.setDate(1);
					labelDate.setMonth(boundaryTimeUnit-1);
				}else if(timeUnit==CIQ.YEAR){
					labelDate.setDate(1);
					labelDate.setMonth(0);
				}else{
					labelDate.setDate(1);
					labelDate.setMonth(0);
				}
				//console.log(labelDate + " boundary=" + boundaryTimeUnit);

				// figure the next expected axis label position
				nextTimeUnit=boundaryTimeUnit+timeUnitMultiplier;
				if(timeUnit==CIQ.DAY) timeInterval.maxTimeUnit=daysInMonth[labelDate.getMonth()]+1; // DAY is the only unit with a variable max
				if(nextTimeUnit>=timeInterval.maxTimeUnit) nextTimeUnit=timeInterval.minTimeUnit;
				previousTimeUnitLarge=currentTimeUnitLarge;

				// Don't print the first tick unless it lands exactly on a boundary. Otherwise the default logic assumes
				// that the boundary was skipped.
				if(firstTick && boundaryTimeUnit<currentTimeUnit) continue;

				// format the label
				if(xAxis.formatter){
					text=xAxis.formatter(labelDate, "line", timeUnit, timeUnitMultiplier);
				}else{
					if(timeUnit==CIQ.DAY){
						text=labelDate.getDate();
					}else if(timeUnit==CIQ.MONTH){
						text=CIQ.monthAsDisplay(dtShifted.getMonth(),false,this);
					}else if(timeUnit==CIQ.YEAR || timeUnit==CIQ.DECADE){
						text=labelDate.getFullYear();
					}else{
						text=CIQ.timeAsDisplay(labelDate, this, timeUnit);
					}
				}
				axisRepresentation.push(new CIQ.ChartEngine.XAxisLabel(hz,"line",text));
			}
			firstTick=false;
		}
		return axisRepresentation;
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * <span class="animation">Animation Loop</span>
	 * Call this method to create the data that will be displayed on the Y axis (price axis). It does not actually render the Y axis; this is done by {@link CIQ.ChartEngine.AdvancedInjectable#drawYAxis}
	 *
	 * Managing Decimal Places
	 *
	 * The Y-Axis automatically manages decimal place precision. The default behavior is to set the number of decimal places based on the values set in {@link CIQ.ChartEngine.YAxis#shadowBreaks} in relation to the size of the shadow.
	 * You may override this by setting stxx.chart.panel.yAxis.decimalPlaces equal to a hard set number of decimal places.
	 * stxx.chart.panel.yAxis.minimumPriceTick can be set to specify that the y-axis vertical grid be drawn with specific ranges. eg <code>stxx.chart.panel.yAxis.minimumPriceTick=.25</code>
	 * For more configurable parameters, see the {@link CIQ.ChartEngine.YAxis}.
	 *
	 * @param  {CIQ.ChartEngine.Panel} panel			The panel to create the y-axis
	 * @param  {object} [parameters]			Parameters to drive the y-axis
	 * @param {boolean} [parameters.noDraw]		If true then make all the calculations but don't draw the y-axis. Typically used when a study is going to draw its own y-axis.
	 * @param {boolean} [parameters.semiLog]	Calculate the y-axis as a semi-log scale.
	 * @param {boolean} [parameters.ground]		Tie the bottom of the y-Axis to the bottom-most value of the plot.
	 * @param {CIQ.ChartEngine.YAxis} [yAxis] The yAxis to create. Defaults to panel.yAxis.
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias createYAxis
	 */
	CIQ.ChartEngine.prototype.createYAxis=function(panel, parameters){
		if(this.runPrepend("createYAxis", arguments)) return;
		var chart=panel.chart;
		var isAChart=(panel.name==chart.name);
		if(!parameters) parameters={};
		parameters.noChange=false;
		var yAxis=parameters.yAxis?parameters.yAxis:panel.yAxis;

		if(CIQ.ChartEngine.enableCaching && yAxis.high==panel.cacheHigh && yAxis.low==panel.cacheLow){
			var leftTick=chart.dataSet.length - chart.scroll;
			var rightTick=leftTick+chart.maxTicks;
			panel.cacheLeft=Math.min(panel.cacheLeft, leftTick);
			panel.cacheRight=Math.max(panel.cacheRight, rightTick);
			panel.cacheLeft=leftTick;
			panel.cacheRight=rightTick;
			parameters.noChange=true;
		}else{
			panel.cacheLeft=1000000;
			panel.cacheRight=-1;
			panel.cacheHigh=yAxis.high;
			panel.cacheLow=yAxis.low;
		}
		var idealX=chart.xAxis.idealTickSizePixels?chart.xAxis.idealTickSizePixels:chart.xAxis.autoComputedTickSizePixels;
		if(yAxis.goldenRatioYAxis){
			// This will happen if the x-axis widths have changed
			if(yAxis.idealTickSizePixels!=idealX/1.618)
				parameters.noChange=false;
		}
		if(!parameters.noChange){
			this.adjustYAxisHeightOffset(panel, yAxis);
			// Adjust for zoom and scroll
			var height=yAxis.height=yAxis.bottom-yAxis.top;
			var pricePerPix=(yAxis.high-yAxis.low)/(height-yAxis.zoom);
			if(parameters.ground && !yAxis.semiLog){
				yAxis.high=yAxis.high+yAxis.zoom*pricePerPix;
			}else{
				yAxis.high=yAxis.high+(yAxis.zoom/2)*pricePerPix + yAxis.scroll*pricePerPix;
				var unadjustedLow=yAxis.low;
				yAxis.low=yAxis.low-(yAxis.zoom/2)*pricePerPix + yAxis.scroll*pricePerPix;
				if(yAxis.semiLog && yAxis.low<=0) yAxis.low=unadjustedLow;
			}
			if(yAxis.min || yAxis.min===0) yAxis.low=yAxis.min;
			if(yAxis.max || yAxis.max===0) yAxis.high=yAxis.max;

			yAxis.shadow=yAxis.high-yAxis.low;
			if(yAxis.semiLog && (!this.activeDrawing || this.activeDrawing.name!="projection")){
				yAxis.logHigh=Math.log(yAxis.high)/Math.LN10;
				var semilow=Math.max(yAxis.low,0.000000001);
				yAxis.logLow=Math.log(semilow)/Math.LN10;
				if(yAxis.low<=0) yAxis.logLow=0;
				yAxis.logShadow=yAxis.logHigh - yAxis.logLow;
			}
			var fontHeight;
			if(yAxis.goldenRatioYAxis && isAChart){
				yAxis.idealTickSizePixels=idealX/1.618;
				if(yAxis.idealTickSizePixels===0){
					fontHeight=this.getCanvasFontSize("stx_yaxis");
					yAxis.idealTickSizePixels=fontHeight*5;
				}
			}else{
				if(!yAxis.idealTickSizePixels){
					fontHeight=this.getCanvasFontSize("stx_yaxis");
					if(isAChart){
						yAxis.idealTickSizePixels=fontHeight*5;
					}else{
						yAxis.idealTickSizePixels=fontHeight*2;
					}
				}
			}
			var idealTicks=Math.round(height/yAxis.idealTickSizePixels);
			var shadow=parameters.range?parameters.range[1]-parameters.range[0]:yAxis.shadow;
			yAxis.priceTick=Math.floor(shadow/idealTicks);

			// calculate the ideal price tick. First find the ideal decimal location using a loop
			var n=1;
			for(var zz=0;zz<10;zz++){
				if(yAxis.priceTick>0) break;
				n*=10;
				yAxis.priceTick=Math.floor(shadow/idealTicks*n)/n;
			}
			if(zz==10) yAxis.priceTick=0.00000001;
			// Then find the closest approximation
			yAxis.priceTick=Math.round(shadow/idealTicks*n)/n;

			var verticalTicks=Math.round(shadow/yAxis.priceTick);
			if(parameters.range && verticalTicks<shadow && !yAxis.noEvenDivisorTicks){ // if there's a set range, then by default display ticks that evenly divide into the range
				while(verticalTicks>=1){
					if(shadow%verticalTicks===0) break;
					verticalTicks--;
				}
				yAxis.priceTick=shadow/verticalTicks;
			}

			if(yAxis.minimumPriceTick){
				var yAxisPriceTick=yAxis.minimumPriceTick;
				fontHeight = this.getCanvasFontSize("stx_yaxis");
				for(var i=0;i<100;i++){
					var numberOfTicks=shadow/yAxisPriceTick;
					if(height/numberOfTicks<fontHeight*2) yAxisPriceTick+=yAxis.minimumPriceTick;
					else break;
				}
				// we give you 100 chances to try to fit it within the font size ( by using multiples of the original)...but if the developer selected a very small minimumPriceTick, we just default to the standard distance.
				if ( i < 100 ) yAxis.priceTick = yAxisPriceTick;
			}

			yAxis.multiplier=yAxis.height/yAxis.shadow;
		}
		if(!this.activeDrawing || this.activeDrawing.name!="projection"){
			yAxis.high=this.valueFromPixel(panel.top, panel, yAxis);	// Set the actual high for the panel rather than the values in the panel
			if(yAxis.semiLog){
				yAxis.logHigh=Math.log(yAxis.high)/Math.LN10;
				var semilow2=Math.max(yAxis.low,0.00000000001);
				yAxis.logLow=Math.log(semilow2)/Math.LN10;
				yAxis.logShadow=yAxis.logHigh - yAxis.logLow;
			}
			yAxis.shadow=yAxis.high-yAxis.low;
		}
		yAxis.multiplier=yAxis.height/yAxis.shadow;
		if(yAxis.multiplier==Infinity) yAxis.multiplier=0; // No data points at all
		// If the programmer has set yAxis.decimalPlaces then we will print that number of decimal places
		// otherwise we will use the number of decimalPlaces determined when masterData was set
		if(!yAxis.decimalPlaces && yAxis.decimalPlaces!==0){
			if(isAChart){
				var labelDecimalPlaces=0;
				for(var j=0;j<panel.yAxis.shadowBreaks.length;j++){
					var brk=panel.yAxis.shadowBreaks[j];
					if(panel.yAxis.shadow<brk[0]) labelDecimalPlaces=brk[1];
				}
				yAxis.printDecimalPlaces=labelDecimalPlaces;
			}
			else yAxis.printDecimalPlaces=null; // let the draw function figure out how many decimal places
		}else{
			yAxis.printDecimalPlaces=yAxis.decimalPlaces;
		}
		this.runAppend("createYAxis", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * <span class="animation">Animation Loop</span>
	 *
	 * This method draws the y-axis. It is typically called after {@link CIQ.ChartEngine.AdvancedInjectable#createYAxis}.
	 *
	 * CSS Styles used:
	 * - Text = "stx_yaxis"
	 * - Grid Line = "stx_grid"
	 * - Border = "stx_grid_border"
	 *
	 * @param  {CIQ.ChartEngine.Panel} panel	   The panel to draw the y-axis
	 * @param  {object} parameters Parameters for the y-axis (only used internally. Send {} when calling this method directly).
	 * @param {array} [parameters.range] Optionally set the range of values to display on the y-axis. For instance [0,100] would only print from zero to one hundred, regardless of the actual height of the y-axis.
	 *									 This is useful if you want to add some buffer space to the panel but don't want the y-axis to actually reveal nonsensical values.
	 * @param {CIQ.ChartEngine.YAxis} [yAxis] The yAxis to use. Defaults to panel.yAxis.
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias drawYAxis
	 */
	CIQ.ChartEngine.prototype.drawYAxis=function(panel, parameters){
		if(!parameters) parameters={};
		var yAxis=parameters.yAxis?parameters.yAxis:panel.yAxis;
		// override existing axis settings for fractional quotes
		if(yAxis.fractional){
			if(!yAxis.originalPriceFormatter) yAxis.originalPriceFormatter={
				func: yAxis.priceFormatter
			};
			if(!yAxis.fractional.resolution) yAxis.fractional.resolution=yAxis.minimumPrice;
			if(!yAxis.fractional.formatter) yAxis.fractional.formatter="'";
			if(!yAxis.priceFormatter) yAxis.priceFormatter=function(stx, panel, price){
				var whole=Math.floor(Math.round(price/yAxis.fractional.resolution)*yAxis.fractional.resolution);
				var frac=Math.round((price-whole)/yAxis.fractional.resolution);
				var _nds=Math.floor(frac);
				return whole+yAxis.fractional.formatter+(_nds<10?"0":"")+_nds+(frac-_nds>=0.5?"+":"");
			};
		}else{
			if(yAxis.originalPriceFormatter){
				yAxis.priceFormatter=yAxis.originalPriceFormatter.func;
				yAxis.originalPriceFormatter=null;
			}
		}

		if(yAxis.pretty) return this.drawYAxisPretty(panel, parameters);
		if(this.runPrepend("drawYAxis", arguments)) return;

		if(!parameters.noDraw && !yAxis.noDraw){
			var yAxisPlotter=yAxis.yAxisPlotter;
			if(!yAxisPlotter || !parameters.noChange){
				yAxisPlotter=yAxis.yAxisPlotter=new CIQ.Plotter();	// This plotted is saved as a member. We can re-use it to draw the exact same y-axis when noChange=true
				var chart=panel.chart;
				var isAChart=(panel.name==chart.name && yAxis===panel.yAxis);
				if(!yAxis.priceTick) return;
				var shadow=yAxis.shadow;
				var range=parameters.range;
				if(range){
					shadow=range[1]-range[0];
				}
				var verticalTicks=shadow/yAxis.priceTick;
				//if(isAChart)
				//	verticalTicks=Math.round(verticalTicks +.499);	// This will create one more tick's worth of vertical space at the top of charts
																	// very useful for trending stocks which will otherwise touch the top of the chart
				verticalTicks=Math.round(verticalTicks);
				var logStart,logPriceTick;
				if(yAxis.semiLog){
					logStart=Math.log(this.valueFromPixel(yAxis.bottom, panel))/Math.LN10;
					logPriceTick=(yAxis.logHigh-yAxis.logLow)/verticalTicks;
				}
				var textStyle=yAxis.textStyle?yAxis.textStyle:"stx_yaxis";
				yAxisPlotter.newSeries("grid", "stroke", this.canvasStyle("stx_grid"));
				yAxisPlotter.newSeries("text", "fill", this.colorOrStyle(textStyle));
				yAxisPlotter.newSeries("border", "stroke", this.canvasStyle("stx_grid_border"));

				var priceOffset=0;
				var high=range?range[1]:yAxis.high;
				var low=range?range[0]:yAxis.low;
				var drawBorders=(yAxis.displayBorder===null?chart.panel.yAxis.displayBorder:yAxis.displayBorder);
				// Master override
				if(this.axisBorders===false) drawBorders=false;
				if(this.axisBorders===true) drawBorders=true;
				var edgeOfAxis;

				var position=(yAxis.position===null?chart.panel.yAxis.position:yAxis.position);
				if(position=="left"){
					edgeOfAxis=yAxis.left + yAxis.width;
				}else{
					edgeOfAxis=yAxis.left;
				}
				var borderEdge=Math.round(edgeOfAxis)+0.5;
				var tickWidth=drawBorders?3:0; // pixel width of tick off edge of border
				if(position=="left") tickWidth=drawBorders?-3:0;

				if(isAChart)	// This forces the y-axis on to even values
					if ( yAxis.shadow < 1) {
						// when dealing with very small decimal ranges, we need to have a slightly different formula to compute offset and make sure we start at a more suitable price.
						// This is needed to account for floating point issues that will otherwise cause the label to be placed at a location that if rounded ( using yAxis.decimalPlaces) will confuse the user. (price may be 9.4999999998; will show 9.500, but placed at 9.499 for example)
						priceOffset=((parseInt(low/yAxis.priceTick,10)+1)*yAxis.priceTick)-low;
					} else {
						priceOffset=yAxis.priceTick-Math.round((low%yAxis.priceTick)*panel.chart.roundit)/panel.chart.roundit;
					}
				else
					priceOffset=high%yAxis.priceTick;
				var fontHeight=this.getCanvasFontSize("stx_yaxis");
				for(var i=0;i<verticalTicks;i++){
					var price;
					if(yAxis.semiLog){
						var logPrice=logStart+(i*logPriceTick);
						price=Math.pow(10, logPrice);
					}else{
						// Charts need a little extra space at the top while studies
						// want to show the high value right at the panel division line
						// so we reverse the order of our priceTicks depending on the situation
						if(isAChart)
							price=low + i*yAxis.priceTick + priceOffset;
						else
							price=high - (i*yAxis.priceTick) - priceOffset;
					}
					var y=this.pixelFromPrice(price, panel, yAxis);

					var y2=Math.round(y)+0.5;
					if((y2 + fontHeight/2) > panel.bottom) continue; // Make sure we don't stray past the bottom of the panel
					if((y2 - fontHeight/2)<panel.top) continue;	// Make sure we don't stray past the top of the panel
					if(yAxis.displayGridLines){
						yAxisPlotter.moveTo("grid", panel.left, y2);
						yAxisPlotter.lineTo("grid", panel.right, y2);
					}
					if(drawBorders){
						yAxisPlotter.moveTo("border", borderEdge-0.5, y2);
						yAxisPlotter.lineTo("border", borderEdge+tickWidth, y2);
					}
					if(yAxis.priceFormatter){
						price=yAxis.priceFormatter(this, panel, price);
					}else{
						price=this.formatYAxisPrice(price, panel,null,yAxis);
					}
					var backgroundColor=yAxis.textBackground?this.containerColor:null;

					var textXPosition=edgeOfAxis + tickWidth + 3;
					if(position=="left"){
						textXPosition=yAxis.left + 3;
						if(yAxis.justifyRight) textXPosition=yAxis.left + yAxis.width + tickWidth - 3;
					}else{
						if(yAxis.justifyRight) textXPosition=edgeOfAxis + yAxis.width;
					}
					yAxisPlotter.addText("text", price, textXPosition, y2, backgroundColor, null, fontHeight);
				}
				if(drawBorders){
					var b=Math.round(yAxis.bottom)+0.5;
					yAxisPlotter.moveTo("border", borderEdge, yAxis.top);
					yAxisPlotter.lineTo("border", borderEdge, b);
					yAxisPlotter.draw(this.chart.context, "border");
				}
			}
			this.plotYAxisGrid(panel);
		}
		this.runAppend("drawYAxis", arguments);
	};

	CIQ.ChartEngine.prototype.drawYAxisPretty=function(panel, parameters){
		if(this.runPrepend("drawYAxis", arguments)) return;
		if(!parameters) parameters={};

		var yAxis=parameters.yAxis?parameters.yAxis:panel.yAxis;

		if(!parameters.noDraw && !yAxis.noDraw){
			var yAxisPlotter=yAxis.yAxisPlotter;
			if(!yAxisPlotter || !parameters.noChange){
				yAxisPlotter=yAxis.yAxisPlotter=new CIQ.Plotter();	// This plotted is saved as a member. We can re-use it to draw the exact same y-axis when noChange=true
				var chart=panel.chart;
				var isAChart=(panel.name==chart.name && yAxis===panel.yAxis);
				if(!yAxis.priceTick) return;
				if(isNaN(yAxis.high) || isNaN(yAxis.low)) return;
				var shadow=yAxis.shadow;
				if(parameters.range){
					shadow=parameters.range[1]-parameters.range[0];
				}

				var verticalTicks=yAxis.height/yAxis.idealTickSizePixels;
				verticalTicks=Math.round(verticalTicks);

				var textStyle=yAxis.textStyle?yAxis.textStyle:"stx_yaxis";
				yAxisPlotter.newSeries("grid", "stroke", this.canvasStyle("stx_grid"));
				yAxisPlotter.newSeries("text", "fill", this.colorOrStyle(textStyle));
				yAxisPlotter.newSeries("border", "stroke", this.canvasStyle("stx_grid_border"));

				var priceOffset=0;
				var range=parameters.range;
				var high=range?range[1]:yAxis.high;
				var low=range?range[0]:yAxis.low;
				var drawBorders=(yAxis.displayBorder===null?chart.panel.yAxis.displayBorder:yAxis.displayBorder);
				// Master override
				if(this.axisBorders===false) drawBorders=false;
				if(this.axisBorders===true) drawBorders=true;
				var edgeOfAxis;

				var position=(yAxis.position===null?chart.panel.yAxis.position:yAxis.position);

				if(position=="left"){
					edgeOfAxis=yAxis.left + yAxis.width;
				}else{
					edgeOfAxis=yAxis.left;
				}
				var borderEdge=Math.round(edgeOfAxis)+0.5;
				var tickWidth=drawBorders?3:0; // pixel width of tick off edge of border
				if(position=="left") tickWidth=drawBorders?-3:0;
				var fontHeight=this.getCanvasFontSize("stx_yaxis");

				var increments=yAxis.increments;
				var l=increments.length;

				var p=0, n=1, inc=0, closest=0;
				var pow=0;
				var diff=Number.MAX_VALUE;
				for(var z=0;z<100;z++){
					inc=increments[p]*Math.pow(10,pow);

					n=Math.floor(shadow/inc);
					var newDiff=Math.abs(verticalTicks-n);
					if(newDiff>diff){
						break;
					}else{
						diff=newDiff;
					}
					if(n==verticalTicks){
						closest=inc;
						break;
					}else if(n>verticalTicks){
						p++;
						if(p>=l){
							p=0;
							pow++;
						}
					}else{
						p--;
						if(p<0){
							p=l-1;
							pow--;
						}
					}
					closest=inc;
				}

				var lowLabel=Math.ceil(low/closest)*closest;
				var lowPixelSize = yAxis.bottom - this.pixelFromPrice(lowLabel, panel, yAxis);
				var closestInc = 0;
				if (lowPixelSize > yAxis.idealTickSizePixels && yAxis.semiLog && yAxis.prettySemiLog) {
					// find lowest integer divisor above `low`.
					var divisor;
					for (divisor = Math.ceil(low); divisor < lowLabel && lowLabel % divisor !== 0; ++divisor) ;
					if (divisor < lowLabel) {
						if (lowLabel === closest) {
							closest = divisor;
							closestInc = divisor;
						}
						lowLabel = divisor;
					}
				}

				var i=0;
				for(var zz=0;zz<100;zz++){
					var price=lowLabel+i*closest;
					if(price>high) break;
					closest += closestInc;
					i++;
					var y=this.pixelFromPrice(price, panel, yAxis);

					var y2=Math.round(y)+0.5;
					if((y2 + fontHeight/2) > panel.bottom) continue; // Make sure we don't stray past the bottom of the panel
					if((y2-fontHeight/2)<panel.top) continue;	// Make sure we don't stray past the top of the panel
					if(yAxis.displayGridLines){
						yAxisPlotter.moveTo("grid", panel.left, y2);
						yAxisPlotter.lineTo("grid", panel.right, y2);
					}
					if(drawBorders){
						yAxisPlotter.moveTo("border", borderEdge-0.5, y2);
						yAxisPlotter.lineTo("border", borderEdge+tickWidth, y2);
					}
					if(yAxis.priceFormatter){
						price=yAxis.priceFormatter(this, panel, price);
					}else{
						price=this.formatYAxisPrice(price, panel,null,yAxis);
					}
					var backgroundColor=yAxis.textBackground?this.containerColor:null;

					var textXPosition=edgeOfAxis + tickWidth + 3;
					if(position=="left"){
						textXPosition=yAxis.left + 3;
						if(yAxis.justifyRight) textXPosition=yAxis.left + yAxis.width + tickWidth - 3;
					}else{
						if(yAxis.justifyRight) textXPosition=edgeOfAxis + yAxis.width;
					}
					yAxisPlotter.addText("text", price, textXPosition, y2, backgroundColor, null, fontHeight);
				}
				if(zz>=100){
					console.log("drawYAxisPretty: assertion error. zz reached 100");
				}
				if(drawBorders){
					var b=Math.round(yAxis.bottom)+0.5;
					yAxisPlotter.moveTo("border", borderEdge, yAxis.top);
					yAxisPlotter.lineTo("border", borderEdge, b);
					yAxisPlotter.draw(this.chart.context, "border");
				}
			}
			this.plotYAxisGrid(panel);
		}
		this.runAppend("drawYAxis", arguments);
	};

	/**
	 * Draws a generic histogram for the chart.
	 * The histogram can render bars representing one element each, or each bar can be stacked with multiple elements, each one representing a different part within the bar.
	 * This function should not be called directly unless the histogram is ready to be drawn immediately.
	 * Note that if negative values are present, the function will not draw bars pointing downwards;
	 * instead the baseline of the histogram will be adjusted to the minimum value detected, and all bars will rise upward from there.
	 * @param  {string} panelName The name of the panel to put the histogram on
	 * @param  {object} params Parameters to control the histogram itself
	 * @param  {string} params.name Name of the histogram. Default: 'Data'
	 * @param  {string} params.type Optional type of histogram (stacked, clustered, overlaid) default overlaid
	 * @param  {boolean} params.bindToYAxis For a study, set to true to bind the histogram to the y-axis and to draw it
	 * @param  {number} params.heightPercentage The amount of vertical space to use for the histogram, valid values are 0.00-1.00.	Ignored when bindToYAxis==true.
	 * @param  {number} params.widthFactor Width of each bar as a percentage of the candleWidth, valid values are 0.00-1.00.
	 * @param  {Array} seriesParams Parameters to control color and opacity of each part (stack) of the histogram. Each array element of seriesParams is an object having the following members:
	 * @param  {string} seriesParams.field Name of the field in the dataSet to use for the part in the stack
	 * @param  {string} seriesParams.fill_color_up Color to use to fill the part when the Close is higher than the previous (#RRGGBB format or null to not draw)
	 * @param  {string} seriesParams.border_color_up Color to use to draw the border when the Close is higher than the previous (#RRGGBB format or null to not draw)
	 * @param  {number} seriesParams.opacity_up Opacity to use to fill the part when the Close is higher than the previous (0.0-1.0)
	 * @param  {string} seriesParams.fill_color_down Color to use to fill the part when the Close is lower than the previous (#RRGGBB format or null to not draw)
	 * @param  {string} seriesParams.border_color_down Color to use to draw the border when the Close is lower than the previous (#RRGGBB format or null to not draw)
	 * @param  {number} seriesParams.opacity_down Opacity to use to fill the part when the Close is lower than the previous (0.0-1.0)
	 * @memberOf CIQ.ChartEngine
	 * @since 07/01/2015
	 */
	CIQ.ChartEngine.prototype.drawHistogram=function(params,seriesParams){
		if(!seriesParams || !seriesParams.length) return;
		var panelName=params.panel;
		if(!panelName) panelName="chart";
		var c=this.panels[panelName];
		if(!c) return;
		var yAxis=params.yAxis?params.yAxis:c.yAxis;

		var type=params.type;
		if(type=="histogram") type=params.subtype;

		var quotes=this.chart.dataSegment;
		var bordersOn=false;
		this.getDefaultColor();
		var sp;
		for(sp=0;sp<seriesParams.length;sp++){
			bordersOn|=(seriesParams[sp].border_color_up && !CIQ.isTransparent(seriesParams[sp].border_color_up));
			bordersOn|=(seriesParams[sp].border_color_down && !CIQ.isTransparent(seriesParams[sp].border_color_down));
		}
		if(!params.name) params.name="Data";

		var multiplier=yAxis.multiplier;
		if(!params.heightPercentage) params.heightPercentage=0.7;
		if(!params.widthFactor) params.widthFactor=0.8;
		var histMax=0,histMin=0;
		for(var i=0;i<this.chart.maxTicks;i++){
			var prices=quotes[i];
			if(!prices) continue;
			var total=0;
			for(sp=0;sp<seriesParams.length;sp++){
				if(prices[seriesParams[sp].field]){
					if(params.subtype=="stacked") total+=prices[seriesParams[sp].field];
					else total=prices[seriesParams[sp].field];
					if(total>histMax) histMax=total;
					if(total<histMin) histMin=total;
				}
			}
		}
		var t=Math.floor(yAxis.top)+0.5;
		var b;
		if(!params.bindToYAxis){
			b=Math.floor(yAxis.bottom)+0.5; // make it align with the samallest value on te axis instead fo the bottom
			if(histMax===0 && histMin===0){
				this.watermark(panelName,"center","bottom", this.translateIf(params.name+" Not Available"));
				return;
			}
			multiplier=(b-t)*params.heightPercentage/(histMax-histMin);
		} else {
			b= Math.floor(this.pixelFromPriceTransform(histMin, c, yAxis))+0.5;				
		}

		var offset=0.5;
		if(this.layout.candleWidth<=1 || !bordersOn) offset=0;
		this.startClip(panelName);
		var context=this.chart.context;
		var shaveOff=Math.max(0,(1-params.widthFactor)*this.layout.candleWidth/2);	//how much to take off either side of the bar
		var tops={};
		var bottoms={};
		var self=this;
		var candleWidth=1;

		function drawBars(field, color, opacity, isBorder, isUp, shift, candleWidth){

			if(!opacity) opacity=1;
			if(CIQ.isIE8) context.globalAlpha=0.5;
			else context.globalAlpha=opacity;

			context.beginPath();
			var prevTop=b+0.5;
			var farLeft=Math.floor(self.pixelFromBar(0, c.chart)-self.layout.candleWidth/2);
			var prevRight=farLeft;
			for(var i=0;i<quotes.length;i++){
				var bottom=bottoms[i];
				if(!bottom) bottom=b;
				if(i===0) prevTop=bottom;

				var quote=quotes[i];
				if(!quote || !quote[field]){
					prevTop=bottom;
					prevRight+=self.layout.candleWidth;
					continue;
				}
				var y=(quote[field]-histMin)*multiplier;
				if(isNaN(y)) continue;
				var myCandleWidth=self.layout.candleWidth;
				if(quote.candleWidth) {
					myCandleWidth=quote.candleWidth;
					if(i===0) farLeft=prevRight=Math.floor(self.pixelFromBar(0, c.chart)-quote.candleWidth/2);
				}
				var top = Math.min(Math.floor(bottom - y)+0.5,bottom);
				if (isUp){
					if(quote.Close < quote.iqPrevClose) {
						prevTop=top;
						prevRight+=myCandleWidth;
						continue;
					}
				}else{
					if(quote.Close >= quote.iqPrevClose){
						prevTop=top;
						prevRight+=myCandleWidth;
						continue;
					}
				}
				var x0,x1;
				var variableWidthRatio=myCandleWidth/self.layout.candleWidth;
				var start=prevRight + (shaveOff + shift*candleWidth)*variableWidthRatio;
				x0=Math.round(start)+(isBorder?0:offset);
				x1=Math.round(start+candleWidth*variableWidthRatio)-(isBorder?0:offset);
				if(x1-x0<2) x1=x0+1;

				// this ensures that when we draw the border, we do not do it on a round pixel value to prevent blurred lines.
				if ( isBorder ) roundPixel = 0;
				else roundPixel = 0.5;
				if(x0 % 1 == roundPixel) x0+=0.5;
				if(x1 % 1 == roundPixel) x1+=0.5;

				context.moveTo(x0, bottom);
				if(b==bottom){
					context.lineTo(x1, bottom);
				}else{
					context.moveTo(x1, bottom);
					if(isBorder && !shaveOff){
						if(bottoms[i+1]) context.moveTo(x1, Math.max(top,Math.min(bottom,bottoms[i+1])));
					}
				}
				context.lineTo(x1, top);
				context.lineTo(x0, top);
				if(isBorder && shift){
					if(tops[i]>top || i===0) context.lineTo(x0, Math.min(bottom,tops[i])); // draw down either to the top of the previous series' bar or bottom of this bar, so that we don't overlap strokes
				}else if(isBorder && !shaveOff && type=="clustered"){
					if(i>0 && tops[i-1] && tops[i-1]>top) context.lineTo(x0, Math.min(bottom,tops[i-1])); // draw down either to the top of the previous series' previous bar or bottom of this bar, so that we don't overlap strokes
				}else if(isBorder && !shaveOff){
					if(prevTop>top || i===0) context.lineTo(x0, Math.min(bottom,prevTop)); // draw down either to the top of the previous bar or bottom of this bar, so that we don't overlap strokes
				}else{
					context.lineTo(x0, bottom);
				}
				prevTop=top;
				prevRight+=myCandleWidth;
				if(type!="clustered" || isBorder) tops[i]=top;
			}
			if(!color) color="auto";

			if(isBorder){
				context.strokeStyle = color=="auto"?self.defaultColor:color;
				context.stroke();
			}else{
				context.fillStyle = color=="auto"?self.defaultColor:color;
				context.fill();
			}
			context.closePath();
		}

		for(sp=0;sp<seriesParams.length;sp++){
			var param=seriesParams[sp];
			candleWidth=this.layout.candleWidth*params.widthFactor;
			var shift=0;
			if(type=="clustered") {
				shift=sp;
				candleWidth/=seriesParams.length;
			}
			drawBars(param.field, param.fill_color_up, param.opacity_up, null, true, shift, candleWidth);
			drawBars(param.field, param.fill_color_down, param.opacity_down, null, null, shift, candleWidth);
			if(this.layout.candleWidth>=2 && bordersOn){
				drawBars(param.field, param.border_color_up, param.opacity_up, true, true, shift, candleWidth);
				drawBars(param.field, param.border_color_down, param.opacity_down, true, null, shift, candleWidth);
			}
			if(type=="stacked") bottoms=CIQ.shallowClone(tops);
		}
		context.globalAlpha=1;
		this.endClip();
	};


	CIQ.ChartEngine.prototype.drawCandlesHighPerformance=function(panel, fillColor, borderColor, condition, isHistogram){
		var chart=panel.chart;
		var quotes=chart.dataSegment;
		var context=this.chart.context;
		var t=panel.yAxis.top;
		var b=panel.yAxis.bottom;
		var top, bottom, length;

		var borderOffset=0;
		if(borderColor && !CIQ.isTransparent(borderColor)) borderOffset=0.5;

		var leftTick=chart.dataSet.length - chart.scroll;
		var rightTick=leftTick+chart.maxTicks;
		context.beginPath();
		if(CIQ.isTransparent(fillColor)) fillColor=this.containerColor;
		context.fillStyle=fillColor;
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
			if(!isHistogram && quote.Open==quote.Close) continue;	// Doji always drawn by shadow
			if(condition & CIQ.ChartEngine.CANDLEUP && quote.Open>=quote.Close) continue;
			if(condition & CIQ.ChartEngine.CANDLEDOWN && quote.Open<=quote.Close) continue;
			if(condition & CIQ.ChartEngine.CANDLEEVEN && quote.Open!=quote.Close) continue;
			if(condition & CIQ.ChartEngine.CLOSEUP && quote.Close<=quote.iqPrevClose) continue;
			if(condition & CIQ.ChartEngine.CLOSEDOWN && quote.Close>=quote.iqPrevClose) continue;
			if(condition & CIQ.ChartEngine.CLOSEEVEN && quote.Close!=quote.iqPrevClose) continue;
			if(quote.transform) quote=quote.transform;
			var Open=quote.Open, Close=quote.Close;
			var cache=quote.cache;
			var tick=leftTick+x;
			if(tick<panel.cacheLeft || tick>panel.cacheRight || !cache.open){
				var o=(yAxis.semiLog?this.pixelFromPrice(Open,panel):((yAxis.high-Open)*yAxis.multiplier)+yAxis.top); // inline version of pixelFromPrice() for efficiency
				var c=(yAxis.semiLog?this.pixelFromPrice(Close,panel):((yAxis.high-Close)*yAxis.multiplier)+yAxis.top); // inline version of pixelFromPrice() for efficiency
				top=Math.floor(Math.min(o,c))+borderOffset;
				bottom=isHistogram?yAxis.bottom:Math.max(o, c);
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
				context.moveTo(xstart, cache.open);
				context.lineTo(xend, cache.open);
				context.lineTo(xend, cache.close);
				context.lineTo(xstart, cache.close);
				context.lineTo(xstart, cache.open);
			}
		}
		context.fill();
		if(borderOffset){
			context.lineWidth=1;
			context.strokeStyle=borderColor;
			context.stroke();
		}
	};

	CIQ.ChartEngine.prototype.drawShadowsHighPerformance=function(panel, style, condition){
		var chart=panel.chart;
		var quotes=chart.dataSegment;
		var context=this.chart.context;
		context.lineWidth=1;
		var t=panel.yAxis.top;
		var b=panel.yAxis.bottom;
		var top, bottom, left;
		var leftTick=chart.dataSet.length - chart.scroll;
		var rightTick=leftTick+chart.maxTicks;
		context.beginPath();
		var yAxis=panel.yAxis;
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
			if(condition){
				if(condition & CIQ.ChartEngine.CANDLEUP && Oquote.pen>=quote.Close) continue;
				else if(condition & CIQ.ChartEngine.CANDLEDOWN && quote.Open<=quote.Close) continue;
				else if(condition & CIQ.ChartEngine.CANDLEEVEN && quote.Open!=quote.Close) continue;
				else if(condition & CIQ.ChartEngine.CLOSEUP && quote.Close<=quote.iqPrevClose) continue;
				else if(condition & CIQ.ChartEngine.CLOSEDOWN && quote.Close>=quote.iqPrevClose) continue;
				else if(condition & CIQ.ChartEngine.CLOSEEVEN && quote.Close!=quote.iqPrevClose) continue;
			}
			if(quote.transform) quote=quote.transform;
			var Open=quote.Open, Close=quote.Close;
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
			context.moveTo(xx, cache.top);
			context.lineTo(xx, cache.bottom);
			if(Open==Close){
				// Single dash for even
				var offset=this.offset;
				if(this.layout.chartType=="volume_candle"){
					offset=candleWidth/2;
				}
				var x0=xx-offset;
				var x1=xx+offset;
				var o=Math.floor(yAxis.semiLog?this.pixelFromPrice(Open,panel):((yAxis.high-Open)*yAxis.multiplier)+yAxis.top)+0.5; // inline version of pixelFromPrice() for efficiency
				if(o<=b && o>=t){
					context.moveTo(x0, o);
					context.lineTo(x1, o);
				}
			}
		}
		this.canvasColor(style);
		context.stroke();
	};


	CIQ.ChartEngine.prototype.drawBarChartHighPerformance=function(panel, style, condition){
		var chart=panel.chart;
		var quotes=chart.dataSegment;
		var context=chart.context;
		var c=this.canvasStyle(style);
		if(c.width && parseInt(c.width,10)<=25){
			context.lineWidth=Math.max(1,CIQ.stripPX(c.width));
		}else{
			context.lineWidth=1;
		}
		context.beginPath();
		var t=panel.yAxis.top;
		var b=panel.yAxis.bottom;
		var top, bottom, length;
		var leftTick=chart.dataSet.length - chart.scroll;
		var rightTick=leftTick+chart.maxTicks;
		var yAxis=panel.yAxis;
		var xbase=panel.left-0.5*this.layout.candleWidth+this.micropixels-1;
		var hlen=chart.tmpWidth/2;
		var voffset=context.lineWidth/2;
		for(var x=0;x<=quotes.length;x++){
			xbase+=this.layout.candleWidth;
			var quote=quotes[x];
			if(!quote) continue;
			if(quote.projection) break;
			if(condition){
				if(condition & CIQ.ChartEngine.CLOSEUP && quote.Close<=quote.iqPrevClose) continue;
				else if(condition & CIQ.ChartEngine.CLOSEDOWN && quote.Close>=quote.iqPrevClose) continue;
				else if(condition & CIQ.ChartEngine.CLOSEEVEN && quote.Close!=quote.iqPrevClose) continue;
			}
			if(quote.transform) quote=quote.transform;
			var Open=quote.Open, Close=quote.Close;
			var cache=quote.cache;
			var tick=leftTick+x;
			if(tick<panel.cacheLeft || tick>panel.cacheRight || !cache.top){
				top=(yAxis.semiLog?this.pixelFromPrice(quote.High, panel):((yAxis.high-quote.High)*yAxis.multiplier)+yAxis.top);
				bottom=(yAxis.semiLog?this.pixelFromPrice(quote.Low, panel):((yAxis.high-quote.Low)*yAxis.multiplier)+yAxis.top);
				length=bottom-top;
				cache.open=(yAxis.semiLog?this.pixelFromPrice(Open,panel):((yAxis.high-Open)*yAxis.multiplier)+yAxis.top); // inline version of pixelFromPrice() for efficiency
				cache.close=(yAxis.semiLog?this.pixelFromPrice(Close,panel):((yAxis.high-Close)*yAxis.multiplier)+yAxis.top); // inline version of pixelFromPrice() for efficiency
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
		}
		this.canvasColor(style);
		context.stroke();
		context.closePath();
		context.lineWidth=1;
	};


	/**
	 * Plots a line chart. This should not be called directly. It is used by {@link CIQ.ChartEngine.drawLineChart}, {@link CIQ.ChartEngine.drawMountainChart} (to draw the "edge" of the mountain), {@link CIQ.Studies.displayIndividualSeriesAsLine}, and several built in studies.
	 * @private
	 * @param  {CIQ.ChartEngine.Panel} panel	   The panel to draw the line chart
	 * @param  {Array} quotes	  The quotes to draw from (typically dataSegment)
	 * @param  {string} field	   The field to pull from quotes (typically "Close")
	 * @param  {object} [parameters] Parameters for the drawing operation
	 * @param {boolean} [parameters.skipTransform] If true then any transformations (such as comparison charting) will not be applied
	 * @param {boolean} [parameters.label] If true then the y-axis will be marked with the value of the right-hand intercept of the line
	 * @param {boolean} [parameters.noSlopes] If true then chart will resenble a step line chart with no vertical lines.
	 * @param {boolean} [parameters.labelDecimalPlaces] Optionally specify the number of decimal places to print on the label. If not set then it will match the y-axis.
	 * @param  {function} [colorFunction]	(optional) A function which accepts an CIQ.ChartEngine and quote as its arguments and returns the appropriate color for drawing that mode.
											Returning a null will skip that line segment.  If not passed as an argument, will use the color set in the calling function.
	 * @return {object} Colors used in the plot (as the keys of the object)
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.plotLineChart=function(panel, quotes, field, parameters, colorFunction){
		var skipProjections=false;
		var skipTransform=false;
		var noSlopes=false;
		var tension = 0; //used for spline chart
		var points = []; //used for spline chart
		if(parameters){
			skipProjections=parameters.skipProjections; // Internal only, stop drawing if we reach a projection
			skipTransform=parameters.skipTransform;
			noSlopes=parameters.noSlopes;
			tension = parameters.tension;
		}
		var chart=panel.chart;
		var context=this.chart.context;
		var first=true;
		var yAxis=panel.yAxis;
		var t=yAxis.top;
		var b=yAxis.bottom;
		var leftTick=chart.dataSet.length - chart.scroll;
		var lastQuote=null;
		var colors={};
		var lastXY=[0,0];
		var candleWidth=this.layout.candleWidth;
		var xbase=panel.left - (parameters.noSlopes?1:0.5)*candleWidth + this.micropixels - 1;

		this.startClip(panel.name);
		context.beginPath();
		for(var i=0;i<=quotes.length;i++){
			xbase+=candleWidth/2;  //complete previous candle
			if(parameters.noSlopes) xbase+=candleWidth/2;  //complete previous candle for noSlopes
			candleWidth=this.layout.candleWidth;
			if(!parameters.noSlopes) xbase+=candleWidth/2;  // go to center of new candle
			var quote=quotes[i];
			if(!quote) continue;
			if(skipProjections && quote.projection) break;
			if(quote.candleWidth) {
				if(!parameters.noSlopes) xbase+=(quote.candleWidth-candleWidth)/2;
				candleWidth=quote.candleWidth;
			}
			if(!skipTransform && quote.transform) quote=quote.transform;
			var x=xbase;
			var cache=quote.cache;
			var tick=leftTick+i;
			if(!quote[field] && quote[field]!==0) continue;
			if(tick<panel.cacheLeft || tick>panel.cacheRight || !cache[field]){
				cache[field]=(yAxis.semiLog?this.pixelFromPrice(quote[field],panel):((yAxis.high-quote[field])*yAxis.multiplier)+yAxis.top); // inline version of pixelFromPrice() for efficiency
			}
			if(x<=panel.right) lastQuote=quote;
			if(i==quotes.length-1){
				if(this.extendLastTick) x+=candleWidth/2;
				if(parameters.lastTickOffset) x+=parameters.lastTickOffset; // reduce or increase position of last tick. For animation, or to extend to end of canvas.
			}
			var y=cache[field];
			var pattern=null;
			if(colorFunction){
				var color=colorFunction(this,quote);
				if(!color) continue;
				if(typeof color=="object"){
					pattern=color.pattern;
					color=color.color;
				}
				if(context.strokeStyle!=color){
					if(!first){
						context.stroke();
						context.beginPath();
						context.moveTo(lastXY[0], lastXY[1]);  //reset back to last point
					}
					context.strokeStyle=color;
					colors[color]=1;
				}
			}

			if(first){
				first=false;
				if(noSlopes || leftTick<=0){
					context.moveTo(i?x:0, y);
					if (tension) {
						points.push(x, y);
					} else {
						if(pattern){
							context.dashedLineTo(0, y, x, y, pattern);
						}else{
							context.lineTo(x, y);
						}
					}

				}else if(leftTick>0){
					var baseline=chart.dataSet[leftTick];
					if(!skipTransform && baseline.transform) baseline=baseline.transform;
					var y0=baseline[field];
					if(!y0 || isNaN(y0)){
						context.moveTo(i?x:0, y);
						if (tension) {
							points.push(x, y);
						}
					}else{
						y0=(yAxis.semiLog?this.pixelFromPrice(y0,panel):((yAxis.high-y0)*yAxis.multiplier)+yAxis.top);
						var x0=x-candleWidth;
						if(pattern){
							context.dashedLineTo(x0, y0, x, y, pattern);
						}else{
							context.moveTo(x0, y0);
							if (tension) {
								points.push(x0, y0, x, y);
							} else {
								context.lineTo(x, y);
							}
						}
					}
				}
			}else{
				if(noSlopes){
					var quote1=quotes[i-1];
					if(!quote1) continue;
					if(!skipTransform && quote1.transform) quote1=quote1.transform;
					if(i){
						if(pattern){
							context.dashedLineTo(lastXY[0], lastXY[1], x, lastXY[1], pattern);
						}else{
							context.lineTo(x, lastXY[1]);
						}
						context.moveTo(x, y);
					}
					if(i==quotes.length-1){
						if(pattern){
							context.dashedLineTo(x, y, x+candleWidth, y, pattern);
						}else{
							context.lineTo(x+candleWidth, y);
						}
					}
				}else{
					if(pattern){
						context.dashedLineTo(lastXY[0], lastXY[1], x, y, pattern);
					}else{
						if (tension) {
							points.push(x, y);
						} else {
							context.lineTo(x, y);
						}
					}
				}
			}
			lastXY=[x,y];
			if (i === (quotes.length - 1) && tension) {
				points.push(x, y);
				plotSpline(points, tension, context);
			}
		}
		context.stroke();
		this.endClip();
		if(parameters.label && lastQuote){
			var txt;
			if(yAxis.priceFormatter){
				txt=yAxis.priceFormatter(this, panel, lastQuote[field], parameters.labelDecimalPlaces);
			}else{
				txt=this.formatYAxisPrice(lastQuote[field], panel, parameters.labelDecimalPlaces);
			}
			var yaxisLabelStyle=this.yaxisLabelStyle;
			if(panel.yAxis.yaxisLabelStyle) yaxisLabelStyle=panel.yAxis.yaxisLabelStyle;
			var labelcolor=yaxisLabelStyle=="noop"?context.strokeStyle:null;

			this.yAxisLabels.push({src:"plot","args":[panel, txt, lastQuote.cache[field], yaxisLabelStyle=="noop"?"#FFFFFF":context.strokeStyle, labelcolor]});
		}
		return colors;
	};

	/**
	 * Plots a mountain chart. This method does not set styles. Styles are set by {@link CIQ.ChartEngine.drawMountainChart} which calls this method.
	 * @private
	 * @param  {CIQ.ChartEngine.Panel} panel	   The panel on which to print the mountain
	 * @param  {Array} quotes	  The array of quotes (typically dataSegment)
	 * @param  {string} field	   The field to drive the mountain (typically "Close")
	 * @param  {object} [parameters] Optional parameters to drive the drawing
	 * @param {boolean} [parameters.skipTransform] If true then any transformations (such as comparison charting) will not be applied
	 * @param {boolean} [reverse] If true then an upside down mountain chart is drawn
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.plotMountainChart=function(panel, quotes, field, parameters){
		var skipProjections=false;
		var skipTransform=false;
		var reverse=false;
		var tension = 0; //used for spline chart
		var points = []; //used for spline chart
		if(parameters){
			skipProjections=parameters.skipProjections;
			skipTransform=parameters.skipTransform;
			reverse=parameters.reverse;
			tension = parameters.tension;
		}
		var chart=panel.chart;
		var context=this.chart.context;
		var first=true;
		var t=panel.yAxis.top;
		var b=panel.yAxis.bottom;
		this.startClip(panel.name);

		context.beginPath();
		var leftTick=chart.dataSet.length - chart.scroll;
		var firstX=null, firstY=null;
		var yAxis=panel.yAxis;
		var x=0, candleWidth=this.layout.candleWidth;
		for(var i=0;i<=quotes.length;i++){
			var quote=quotes[i];
			if(!quote) continue;
			if(skipProjections && quote.projection) break;
			if(!skipTransform && quote.transform) quote=quote.transform;
			var cache=quote.cache;
			var tick=leftTick+i;
			if(tick<panel.cacheLeft || tick>panel.cacheRight || !cache[field]){
				if(!quote[field] && quote[field]!==0) continue;
				cache[field]=(yAxis.semiLog?this.pixelFromPrice(quote[field],panel):((yAxis.high-quote[field])*yAxis.multiplier)+yAxis.top); // inline version of pixelFromPrice() for efficiency
			}
			x=panel.left+(i+0.5)*candleWidth + this.micropixels -1;
			if(i==quotes.length-1){
				if(this.extendLastTick) x+=candleWidth/2;
				if(parameters.lastTickOffset) x+=parameters.lastTickOffset; // reduce or increase position of last tick. For animation, or to extend to end of canvas.
			}
			if(firstX===null) firstX=leftTick>=0?0:x;
			var y=cache[field];
			if(firstY===null) firstY=y;
			if(first){
				first=false;
				if(leftTick<=0){
					context.moveTo(firstX, y);
					if (tension) {
						points.push(firstX, y);
					}
				}else{
					var baseline=chart.dataSet[leftTick];
					if(baseline.transform) baseline=baseline.transform;
					var y0=baseline[field];
					y0=(yAxis.semiLog?this.pixelFromPrice(y0,panel):((yAxis.high-y0)*yAxis.multiplier)+yAxis.top);
					firstX=x-candleWidth;
					context.moveTo(firstX, y0);
					if (tension) {
						points.push(firstX, y0, x, y);
					} else {
						context.lineTo(x, y);
					}
				}
			}else{
				if (tension) {
					points.push(x, y);
				} else {
					context.lineTo(x, y);
				}
			}
			if (i === (quotes.length - 1) && tension) {
				points.push(x, y);
				plotSpline(points, tension, context);
			}
		}

		context.lineTo(x,reverse?t:b);
		context.lineTo(firstX, reverse?t:b);
		if(reverse){
			if(firstY<t) firstY=t;
		}else{
			if(firstY>b) firstY=b;
		}
		context.lineTo(firstX, firstY);
		context.fill();
		context.closePath();
		this.endClip();
	};

	/**
	 * Draws a mountain chart. Calls {@link CIQ.ChartEngine.plotMountainChart} after setting styles.
	 *
	 * Unless a `style` is set, uses CSS `style stx_mountain_chart`, or `stx_colored_mountain_chart` to control the mountain chart display as follows:
	 *	- background-color	- Background color for mountain
	 *	- color	- Optional gradient color
	 *	- border	- Optional line color ( stx_mountain_chart only )
	 *	- width	- Optional line width
	 *
	 * The default color function for the colored mountain chart uses the following CSS styles:
	 *	- stx_line_up		- Color of the uptick portion if the line
	 *	- stx_line_down		- Color of the downtick portion if the line
	 *	- stx_line_chart		- Default line color if no up or down is defined.
	 *
	 * @param  {CIQ.ChartEngine.Panel} panel The panel on which to draw the mountain chart
	 * @param  {string} style	The style selector which contains the styling for the bar (width and color). Defaults to `stx_mountain_chart`.
	 * @param  {function} [colorFunction]	(optional) A function which accepts an CIQ.ChartEngine and quote as its arguments and returns the appropriate color for drawing that mode.
											Returning a null will skip that line segment.  If not passed as an argument, will use the color set in the calling function.
	 * @return {object} Colors used in the plot (as the keys of the object)
	 * @memberOf CIQ.ChartEngine
	 * @since  
	 * <br>15-07-01 Changed signature from `chart` to `panel`
	 * <br>05-2016-10 function now accepts a style, colorFunction argument, and returns colors used in the line plot
	 * 			
	 */
	CIQ.ChartEngine.prototype.drawMountainChart=function(panel, style, colorFunction){
		var context=this.chart.context;
		if(!style) style = "stx_mountain_chart";
		var c=this.canvasStyle(style);
		if(c.width && parseInt(c.width,10)<=25){
			context.lineWidth=Math.max(1,CIQ.stripPX(c.width));
		}else{
			context.lineWidth=1;
		}
		var top=this.pixelFromPrice(panel.chart.highValue, panel);
		if(isNaN(top)) top=0;	// 32 bit IE doesn't like large numbers
		var backgroundColor=c.backgroundColor;
		var color=c.color;
		if(color && !CIQ.isTransparent(color)){
			var gradient=context.createLinearGradient(0,top,0,panel.yAxis.bottom);
			gradient.addColorStop(0, backgroundColor);
			gradient.addColorStop(1, color);
			context.fillStyle=gradient;
		}else{
			context.fillStyle=backgroundColor;
		}

		var params={skipProjections:true};
		var chart=panel.chart, dataSegment=chart.dataSegment;
		if(chart.tension) params.tension=chart.tension;
		if(chart.lastTickOffset) params.lastTickOffset=chart.lastTickOffset;
		var padding=parseInt(c.padding,10);
		var strokeStyle=c.borderTopColor;
		var rc=null;
		if(strokeStyle && !CIQ.isTransparent(strokeStyle)){
			if(padding && !CIQ.isIE8) { // mountain chart with padding between line and shading
				var sctx=this.scratchContext;
				if(!sctx) {
					var scratchCanvas=context.canvas.cloneNode(true);
					sctx=this.scratchContext=scratchCanvas.getContext("2d");
					sctx.canvas=scratchCanvas;
				}
				sctx.canvas.height=context.canvas.height;
				sctx.canvas.width=context.canvas.width;
				sctx.drawImage(context.canvas,0,0);
				context.clearRect(0, 0, context.canvas.width, context.canvas.height);
			}
		}
		this.plotMountainChart(panel, dataSegment, "Close", params);
		if(strokeStyle && !CIQ.isTransparent(strokeStyle)){
			if(padding && !CIQ.isIE8) {
				context.save();
				context.lineWidth+=2*padding;
				context.globalCompositeOperation="destination-out";
				this.plotLineChart(panel, dataSegment, "Close", params);
				context.globalCompositeOperation="destination-over";
				context.scale(1/this.adjustedDisplayPixelRatio,1/this.adjustedDisplayPixelRatio);
				context.drawImage(this.scratchContext.canvas,0,0);
				context.restore();
			}
			context.strokeStyle=strokeStyle;
			rc=this.plotLineChart(panel, dataSegment, "Close", params, colorFunction);
		}
		context.lineWidth=1;
		return rc;
	};


	/**
	 * Core logic for handling mouse or touch movements on the chart. If this.grabbingScreen is true then drag operations are performed.
	 *
	 * This method sets several variables which can be accessed for convenience:
	 *
	 * CIQ.ChartEngine.crosshairX and CIQ.ChartEngine.crosshairY - The screen location of the crosshair
	 * CIQ.ChartEngine.insideChart - True if the cursor is inside the canvas
	 * this.cx and this.cy - The location on the canvas of the crosshair
	 * this.crosshairTick - The current location in the dataSet of the crosshair
	 * this.currentPanel - The current panel in which the crosshair is located (this.currentPanel.chart is the chart)
	 * this.grabStartX and this.grabStartY - If grabbing the chart, then the starting points of that grab
	 * this.grabStartScrollX and this.grabStartScrollY - If grabbing the chart, then the starting scroll positions of the grab
	 * this.zoom - The vertical zoom percentage
	 * this.scroll - The scroll position of the chart
	 *
	 * @param  {number} epX The X location of the cursor on the screen (relative to the viewport)
	 * @param  {number} epY The Y location of the cursor on the screen (relative to the viewport)
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.mousemoveinner=function(epX,epY){
		if(!this.chart.canvas) return;
		if(!CIQ.isAndroid && !CIQ.isIOS7or8){
			if(this.chart.canvas.height!=Math.floor(this.devicePixelRatio*this.chart.container.clientHeight) || this.chart.canvas.width!=Math.floor(this.devicePixelRatio*this.chart.container.clientWidth)){
				this.resizeChart();
				return;
			}
		}
		var value;
		if(this.runPrepend("mousemoveinner", arguments)) return;
		var rect=this.container.getBoundingClientRect();
		this.top=rect.top;
		this.left=rect.left;
		this.right=this.left+this.width;
		this.bottom=this.top+this.height;
		this.cancelLongHold=true;
		this.hasDragged=true;
		CIQ.ChartEngine.crosshairX=epX;
		CIQ.ChartEngine.crosshairY=epY;
		// TODO this.crossYActualPos is a hack to avoid changing this.cy since it
		// was previously assumed that this.cy was the Y-position of the mouse.
		var cy=this.cy=this.crossYActualPos=this.backOutY(CIQ.ChartEngine.crosshairY);
		var cx=this.cx=this.backOutX(CIQ.ChartEngine.crosshairX);
		this.currentPanel=this.whichPanel(cy);
		if(!this.currentPanel) this.currentPanel=this.chart.panel;
		if(!this.currentPanel) return;
		var chart=this.currentPanel.chart;
		if(chart.dataSet){ // Avoids errors during chart loading.
			this.crosshairTick=this.tickFromPixel(cx, chart);
			value = this.valueFromPixel(cy, this.currentPanel);
			var chField = this.currentPanel.name == "chart" ? this.preferences.horizontalCrosshairField : this.currentPanel.horizontalCrosshairField;
			if (chField && this.crosshairTick < chart.dataSet.length && this.crosshairTick > -1) {
				value = chart.dataSet[this.crosshairTick][chField];
				this.crossYActualPos = this.pixelFromPriceTransform(value, this.currentPanel);
			}
			//todo, this is a little misleading because it is the unadjusted value. Push that adjustIfNecessary down the stack
			this.crosshairValue=this.adjustIfNecessary(this.currentPanel, this.crosshairTick, value);
		}
		if(CIQ.ChartEngine.crosshairX>=this.left && CIQ.ChartEngine.crosshairX<=this.right && CIQ.ChartEngine.crosshairY>=this.top && CIQ.ChartEngine.crosshairY<=this.bottom){
			CIQ.ChartEngine.insideChart=true;
		}else{
			CIQ.ChartEngine.insideChart=false;
		}
		var bottom = this.xAxisAsFooter === true ? this.chart.canvasHeight : this.chart.panel.bottom;
		this.overXAxis=CIQ.ChartEngine.insideChart && CIQ.ChartEngine.crosshairY<=bottom+this.top &&
						CIQ.ChartEngine.crosshairY>bottom-this.xaxisHeight+this.top;
		this.overYAxis=(this.cx>=this.currentPanel.right || this.cx<=this.currentPanel.left) && CIQ.ChartEngine.insideChart;
		// Don't display crosshairs if we're outside of the chart area, or over the x-axis or y-axis
		if(this.overXAxis || this.overYAxis || (!CIQ.ChartEngine.insideChart && !this.grabbingScreen)){
			this.undisplayCrosshairs();
			if(!this.overXAxis && !this.overYAxis) return;	// If over y-axis, close crosshairs but move forward
		}
		if(!this.displayCrosshairs && !CIQ.ChartEngine.resizingPanel){
			this.undisplayCrosshairs();
			return;
		}
		if(this.repositioningBaseline){
			panel=this.panels[this.chart.panel.name];
			this.chart.baseline.userLevel=this.adjustIfNecessary(panel, this.crosshairTick, this.valueFromPixelUntransform(this.backOutY(CIQ.ChartEngine.crosshairY), panel));
			if(Date.now()-this.repositioningBaseline.lastDraw>100) {
				this.draw();
				this.repositioningBaseline.lastDraw=Date.now();
			}
			return;
		}

		if(this.grabbingScreen && !CIQ.ChartEngine.resizingPanel){
			if(this.anyHighlighted){
				CIQ.clearCanvas(this.chart.tempCanvas, this);
				this.anyHighlighted=false;
				var n;
				for(n in this.overlays){
					this.overlays[n].highlight=false;
				}
				for(n in chart.series){
					chart.series[n].highlight=false;
				}
				this.displaySticky();
			}
			if(this.preferences.magnet && this.currentVectorParameters.vectorType){
				CIQ.clearCanvas(this.chart.tempCanvas, this);
			}

			if(this.grabStartX==-1){
				this.grabStartX=CIQ.ChartEngine.crosshairX;
				this.grabStartScrollX=chart.scroll;
			}
			if(this.grabStartY==-1){
				this.grabStartY=CIQ.ChartEngine.crosshairY;
				this.grabStartScrollY=chart.panel.yAxis.scroll;
			}
			var dx=CIQ.ChartEngine.crosshairX-this.grabStartX;
			var dy=CIQ.ChartEngine.crosshairY-this.grabStartY;

			if(dx===0 && dy===0) return;
			if(Math.abs(dx) + Math.abs(dy)>5) this.grabOverrideClick=true;
			var push;
			if(this.allowZoom && this.grabMode!="pan" && (this.grabMode.indexOf("zoom")===0 || this.overXAxis || this.overYAxis)){
				// zooming
				if(this.grabMode===""){
					if(this.overXAxis) this.grabMode="zoom-x";
					else if(this.overYAxis) this.grabMode="zoom-y";
				}
				if(this.grabMode=="zoom-x") dy=0; // Don't apply any vertical if over the x-axis
				else if(this.grabMode=="zoom-y") dx=0; // Don't apply any horizontal if over the y-axis
				push=dx/25;
				var centerMe=true;
				if(chart.scroll<=chart.maxTicks)
					centerMe=false;
				var newCandleWidth=this.grabStartCandleWidth+push;
				if(newCandleWidth<this.minimumCandleWidth) newCandleWidth=this.minimumCandleWidth;
				var pct=(this.layout.candleWidth-newCandleWidth)/this.layout.candleWidth;
				if(pct>0.1){
					newCandleWidth=this.layout.candleWidth*0.9;
				}else if(pct<-0.1){
					newCandleWidth=this.layout.candleWidth*1.1;
				}
				if(push){
					if(CIQ.ipad){
						// Allow pinching to resize up, but not down below the minimum size
						if(Math.round((this.chart.width/this.layout.candleWidth)-0.499)-1<CIQ.ChartEngine.ipadMaxTicks &&
						Math.round((this.chart.width/newCandleWidth)-0.499)-1>CIQ.ChartEngine.ipadMaxTicks) return;
					}
					var newMaxTicks;
					if(this.pinchingCenter){	// deprecated, pinching is now handled directly in touchmousemove
						var x=this.backOutX(this.pinchingCenter);
						var tick1=this.tickFromPixel(x, chart);
						this.setCandleWidth(newCandleWidth, chart);
						var newTick=this.tickFromPixel(x, chart);
						chart.scroll+=Math.floor((newTick-tick1));
					}else if(centerMe){			// If mouse, and entire screen filled then we maintain the center
						newMaxTicks=Math.round((this.chart.width/newCandleWidth)+1);
						if(newMaxTicks!=chart.maxTicks){
							chart.scroll+=Math.round((newMaxTicks-chart.maxTicks)/2);
							this.setCandleWidth(newCandleWidth, chart);
						}
					}else{	// If whitespace on right hand side then we maintain same pixels of whitespace
						newMaxTicks=Math.round((this.chart.width/newCandleWidth)+1);
						if(newMaxTicks!=Math.round((this.chart.width/this.layout.candleWidth)+1)){
							var wsInTicks=Math.round(this.preferences.whitespace/newCandleWidth);
							chart.scroll=chart.maxTicks-wsInTicks;
							this.setCandleWidth(newCandleWidth, chart);
						}
					}
				}
				this.layout.span=null;

				var yAxis=this.whichYAxis(this.grabbingPanel, this.cx);
				if(this.overYAxis){
					yAxis.zoom=Math.round(this.grabStartZoom+dy);
					// Prevent zooming past the "flip" boundary
					if(this.grabStartZoom<yAxis.height){
						if(yAxis.zoom>=yAxis.height) yAxis.zoom=yAxis.height-1;
					}else{
						if(yAxis.zoom<=yAxis.height) yAxis.zoom=yAxis.height+1;
					}
				}
			}else{
				if(this.allowScroll){
					// We only allow the chart to scroll vertically if the user has moved in the Y direction by the tolerance amount
					// this reduces the amount of accidental vertical scrolling when panning left/right, since there is always some residual
					// mouse/touch movement in the Y direction while panning. Reducing the vertical scrolling not only keeps the chart aligned
					// for the user, but it also increases the cache hit frequency.
					if(Math.abs(dy)<this.yTolerance){
						if(!this.yToleranceBroken){
							dy=0;
							if(dx===0) return;
						}
					}else{
						this.yToleranceBroken=true;
					}
					this.grabMode="pan";
					push=Math.round(dx/this.layout.candleWidth);
					this.microscroll=push-(dx/this.layout.candleWidth);
					this.micropixels=this.layout.candleWidth*this.microscroll*-1;
					if(this.shift) push*=5;
					//if(Math.abs(chart.scroll-this.grabStartScrollX-push)>20) this.grossDragging=new Date();
					//else this.grossDragging=0;
					chart.scroll=this.grabStartScrollX+push;

					if(chart.scroll<1)
						chart.scroll=1;
					if(chart.scroll>=chart.maxTicks){
						this.preferences.whitespace=this.initialWhitespace;
					}else{
						this.preferences.whitespace=(chart.maxTicks-chart.scroll)*this.layout.candleWidth;
					}

					if(this.currentPanel.name==chart.name){	// if chart type
						this.chart.panel.yAxis.scroll=this.grabStartScrollY+dy;
					}
				}
				this.dispatch("move", {stx:this, panel:this.currentPanel, x:this.cx, y:this.cy, grab:this.grabbingScreen});
			}
			var clsrFunc=function(stx){
				return function(){
					stx.draw();
					stx.updateChartAccessories();
				};
			};
			if(CIQ.ChartEngine.useAnimation){
				window.requestAnimationFrame(clsrFunc(this));
			}else{
				this.draw();
				this.updateChartAccessories();
			}

			if(this.activeDrawing){
				CIQ.clearCanvas(this.chart.tempCanvas, this);
				this.activeDrawing.render(this.chart.tempCanvas.context);
				this.activeDrawing.measure();
			}
			this.undisplayCrosshairs();
			return;
		}else{
			this.grabMode="";
		}
		this.grabbingPanel=this.currentPanel;
		if(this.overXAxis || this.overYAxis) return;	// Nothing after this is applicable when over the x-axis or y-axis

		this.controls.crossX.style.left=(this.pixelFromTick(this.crosshairTick, chart)-0.5) + "px";
		this.controls.crossY.style.top=this.crossYActualPos + "px";
		this.setCrosshairColors();
		if(CIQ.ChartEngine.insideChart && !CIQ.ChartEngine.resizingPanel){
			if(!CIQ.Drawing || !CIQ.Drawing[this.currentVectorParameters.vectorType] || !(new CIQ.Drawing[this.currentVectorParameters.vectorType]()).dragToDraw){
				this.doDisplayCrosshairs();
			}
			this.updateChartAccessories();

		}else{
			this.undisplayCrosshairs();
		}

		var panel;
		if(this.repositioningDrawing){
			panel=this.panels[this.repositioningDrawing.panelName];
			value=this.adjustIfNecessary(panel, this.crosshairTick, this.valueFromPixelUntransform(this.backOutY(CIQ.ChartEngine.crosshairY), panel));
			if(this.preferences.magnet && this.magnetizedPrice && panel.name==panel.chart.name){
				value=this.adjustIfNecessary(panel, this.crosshairTick, this.magnetizedPrice);
			}
			CIQ.clearCanvas(this.chart.tempCanvas, this);
			this.repositioningDrawing.reposition(this.chart.tempCanvas.context, this.repositioningDrawing.repositioner, this.crosshairTick, value);
			if(this.repositioningDrawing.measure) this.repositioningDrawing.measure();
		}else if(CIQ.ChartEngine.drawingLine){
			if(this.activeDrawing){
				panel=this.panels[this.activeDrawing.panelName];
				value=this.adjustIfNecessary(panel, this.crosshairTick, this.valueFromPixelUntransform(this.backOutY(CIQ.ChartEngine.crosshairY), panel));
				if(this.preferences.magnet && this.magnetizedPrice && panel.name==panel.chart.name){
					value=this.adjustIfNecessary(panel, this.crosshairTick, this.magnetizedPrice);
				}
				CIQ.clearCanvas(this.chart.tempCanvas, this);
				this.activeDrawing.move(this.chart.tempCanvas.context, this.crosshairTick, value);
				if(this.activeDrawing.measure) this.activeDrawing.measure();
			}
		}else if(CIQ.ChartEngine.resizingPanel){
			this.resizePanels();
			this.drawTemporaryPanel();
		}else if(CIQ.ChartEngine.insideChart){
			this.findHighlights();
		}
		if(CIQ.ChartEngine.insideChart){
			this.dispatch("move", {stx:this, panel:this.currentPanel, x:this.cx, y:this.cy, grab:this.grabbingScreen});
			this.findHighlights();
		}
		if(this.preferences.magnet && this.currentVectorParameters.vectorType){
			if(!CIQ.ChartEngine.drawingLine && !this.anyHighlighted) CIQ.clearCanvas(this.chart.tempCanvas);
			this.magnetize();
		}
		this.runAppend("mousemoveinner", arguments);
	};


	/*
	 * confineToPanel should be the panel to confine the drawing to, unnecessary if clipping
	 */
	/**
	 * Convenience function for plotting a line on the chart.
	 * @param  {number} x0			   X starting pixel
	 * @param  {number} x1			   X ending pixel
	 * @param  {number} y0			   Y starting pixel
	 * @param  {number} y1			   Y ending pixel
	 * @param  {string} color		   Either a color or a Styles object as returned from {@link CIQ.ChartEngine#canvasStyle}
	 * @param  {string} type		   The type of line to draw ("segment","ray" or "line")
	 * @param  {external:CanvasRenderingContext2D} [context]		The canvas context. Defaults to the standard context.
	 * @param  {string} [confineToPanel] Define the panel that the line should be drawn in, and not cross through
	 * @param  {object} [parameters]	 Additional parameters to describe the line
	 * @param {string} [parameters.pattern] The pattern for the line ("solid","dashed","dotted")
	 * @param {number} [parameters.lineWidth] The width in pixels for the line
	 * @param {number} [parameters.opacity] Optional opacity for the line
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.plotLine=function(x0, x1, y0, y1, color, type, context, confineToPanel, parameters){
		if(!parameters) parameters={};
		if(parameters.pattern=="none") return;
		if(confineToPanel===true) confineToPanel=this.chart.panel;
		if(context===null || typeof(context)=="undefined") context=this.chart.context;
		if(isNaN(x0) || isNaN(x1) || isNaN(y0) || isNaN(y1)){
			return;
		}

		var edgeTop=0;
		var edgeBottom=this.chart.canvasHeight;
		var edgeLeft=0;
		var edgeRight=this.right;


		if(confineToPanel){
			edgeBottom=confineToPanel.yAxis.bottom;
			edgeTop=confineToPanel.yAxis.top;
			edgeLeft=confineToPanel.left;
			edgeRight=confineToPanel.right;
		}
		var bigX,bigY,v;
		if(type=="ray"){
			bigX=10000000;
			if(x1<x0) bigX=-10000000;
			v={
				"x0": x0,
				"x1": x1,
				"y0": y0,
				"y1": y1
			};
			bigY=CIQ.yIntersection(v, bigX);
			x1=bigX;
			y1=bigY;
		}
		if(type=="line" || type=="horizontal" || type=="vertical"){
			bigX=10000000;
			var littleX=-10000000;
			v={
				"x0": x0,
				"x1": x1,
				"y0": y0,
				"y1": y1
			};
			bigY=CIQ.yIntersection(v, bigX);
			var littleY=CIQ.yIntersection(v, littleX);
			x0=littleX;
			x1=bigX;
			y0=littleY;
			y1=bigY;
		}

		var t0 = 0.0, t1 = 1.0;
		var xdelta = x1-x0;
		var ydelta = y1-y0;
		var p,q,r;

		for(var edge=0; edge<4; edge++) {
			if (edge===0) {	 p = -xdelta;	 q = -(edgeLeft-x0);  }
			if (edge==1) {	p = xdelta;		q =	 (edgeRight-x0); }
			if (edge==2) {	p = -ydelta;	q = -(edgeTop-y0);}
			if (edge==3) {	p = ydelta;		q =	 (edgeBottom-y0);	}
			r = q/p;

			if((y1||y1===0) && p===0 && q<0){
				return false;	// Don't draw line at all. (parallel horizontal line outside)
			}

			if(p<0) {
				if(r>t1) return false;		   // Don't draw line at all.
				else if(r>t0) t0=r;			   // Line is clipped!
			} else if(p>0) {
				if(r<t0) return false;		// Don't draw line at all.
				else if(r<t1) t1=r;			// Line is clipped!
			}
		}

		var x0clip = x0 + t0*xdelta;
		var y0clip = y0 + t0*ydelta;
		var x1clip = x0 + t1*xdelta;
		var y1clip = y0 + t1*ydelta;

		if(!y1 && y1!==0 && !y0 && y0!==0){	// vertical line
			y0clip=edgeTop;
			y1clip=edgeBottom;
			x0clip=v.x0;
			x1clip=v.x0;
			if(v.x0>edgeRight) return false;
			if(v.x0<edgeLeft) return false;
		}else if(!y1 && y1!==0){	// vertical ray
			if(v.y0<v.y1) y1clip=edgeBottom;
			else y1clip=edgeTop;
			x0clip=v.x0;
			x1clip=v.x0;
			if(v.x0>edgeRight) return false;
			if(v.x0<edgeLeft) return false;
		}

		context.lineWidth=1.1;	// Use 1.1 instead of 1 to get good anti-aliasing on Android Chrome
		if(typeof(color)=="object"){
			context.strokeStyle=color.color;
			if(color.opacity) context.globalAlpha=color.opacity;
			else context.globalAlpha=1;
			context.lineWidth=parseInt(CIQ.stripPX(color.width));
		}else{
			if(!color || color=="auto" || CIQ.isTransparent(color)){
				context.strokeStyle=this.defaultColor;
			}else{
				context.strokeStyle=color;
			}
		}
		if(parameters.opacity) context.globalAlpha=parameters.opacity;
		if(parameters.lineWidth) context.lineWidth=parameters.lineWidth;
		if(type=="zig zag") context.lineWidth=5;
		//context.beginPath();	//removed, stxLine does this
		var pattern = null;
		if(parameters.pattern){
			pattern=parameters.pattern;
			if(pattern=="solid"){
				pattern=null;
			}else if(pattern=="dotted"){
				pattern=[context.lineWidth, context.lineWidth];
			}else if(pattern=="dashed"){
				pattern=[context.lineWidth*5, context.lineWidth*5];
			}
		}
		context.stxLine(x0clip, y0clip, x1clip, y1clip, context.strokeStyle, context.globalAlpha, context.lineWidth, pattern);
		context.globalAlpha=1;
		context.lineWidth=1;
	};


	/**
	 * <span class="injection">INJECTABLE</span>
	 * <span class="animation">Animation Loop</span>
	 * Draws the series renderers on the chart. The renderers are located in seriesRenderers. Each series in each seriesRenderer should
	 * be represented by the same name in the dataSet. See {@link CIQ.ChartEngine#addSeries}
	 * @param  {CIQ.ChartEngine.Chart} chart The chart object to draw the renderers upon
	 * @param {string} phase Values "overlay","underlay","calculate"
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias drawSeriesRenderers
	 */
	CIQ.ChartEngine.prototype.rendererAction=function(chart, phase){
		if(this.runPrepend("rendererAction", arguments)) return;
		for(var id in chart.seriesRenderers){
			var renderer=chart.seriesRenderers[id];
			if(renderer.params.overChart && phase=="underlay") continue;
			if(!renderer.params.overChart && phase=="overlay") continue;
			if(!this.panels[renderer.params.panel]) continue; //panel was removed
			if(this.panels[renderer.params.panel].chart!==chart) continue;
			if(phase=="calculate"){
				renderer.performCalculations();
			}else{
				renderer.draw();
				if(renderer.cb) renderer.cb(renderer.colors);
			}
		}
		this.runAppend("rendererAction", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * <span class="animation">Animation Loop</span>
	 * Draws each series from the seriesRenderer on the chart. This is called by {@link CIQ.ChartEngine#rendererAction}
	 * @param  {CIQ.ChartEngine.Chart} chart The chart object to draw the series
	 * @param  {Array} seriesArray optional The series object iterate through, defaults to chart.series
	 * @param {CIQ.ChartEngine.YAxis} [yAxis] Optional yAxis to plot against
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias drawSeries
	 */
	CIQ.ChartEngine.prototype.drawSeries=function(chart, seriesArray, yAxis){
		if(this.runPrepend("drawSeries", arguments)) return;
		var quotes=chart.dataSegment;
		var legendColorMap={};
		var series=null;
		if(!seriesArray) seriesArray=chart.series;
		for(var field in seriesArray){
			series=seriesArray[field];
			var parameters=series.parameters;
			if(!parameters.chartType) continue;
			var panel=chart.panel;
			if(parameters.panel) panel=this.panels[parameters.panel];
			if(!panel) continue;
			var yax=yAxis?yAxis:panel.yAxis;
			var minMax=[parameters.minimum, parameters.maximum];
			if((!parameters.minimum && parameters.minimum!==0) || (!parameters.maximum && parameters.maximum!==0)){
				var minMaxCalc=CIQ.minMax(quotes, field);
				if(!parameters.minimum && parameters.minimum!==0) minMax[0]=minMaxCalc[0];
				if(!parameters.maximum && parameters.maximum!==0) minMax[1]=minMaxCalc[1];
			}
			var min=minMax[0];
			var top=yax.top, bottom=yax.bottom, height=bottom-top, t=parameters.marginTop, b=parameters.marginBottom;
			if(t) top=t>1?(top+t):(top+(height*t));
			if(b) bottom=b>1?(bottom-b):(bottom-(height*b));
			var multiplier=(bottom-top)/(minMax[1]-min);

			var started=false, lastPoint=null, val=null, x=null, y=null, px=null, py=null, cw=this.layout.candleWidth,
				context=this.chart.context;
			var isStep=(parameters.type=="step" || parameters.subtype=="step");
			var color=parameters.color;
			if(!color) color=this.defaultColor;
			var width=parameters.width;
			if(!width || isNaN(width) || width<1) width=1;
			if(series.highlight || series.parameters.highlight) width*=2;
			this.startClip(panel.name);
			seriesPlotter=new CIQ.Plotter();
			seriesPlotter.newSeries("line", "stroke", color, 1, width);
			if(parameters.gaps && parameters.gaps.color) seriesPlotter.newSeries("gap", "stroke", parameters.gaps.color, 1, width);
			else seriesPlotter.newSeries("gap", "stroke", color, 1, width);

			//if(!series.yValueCache || series.yValueCache.length!=quotes.length)
				series.yValueCache=new Array(quotes.length);
			var yValueCache=series.yValueCache;
			var lastQuote=null;	// Save this for printing the y-axis label
			var gap=null;
			var points=[];

			var doTransform=series.parameters.shareYAxis && !yAxis; // only transform on the main axis
			var shareYAxis=series.parameters.shareYAxis || yAxis;					// always share when an axis is specified

			var xbase=panel.left - (isStep?1:0.5)*cw + this.micropixels - 1;
			var x0=xbase;
			for(var i=0;i<quotes.length;i++){
				xbase+=cw/2;  //complete previous candle
				if(isStep) xbase+=cw/2;  //complete previous candle for step
				cw=this.layout.candleWidth;
				if(!isStep) xbase+=cw/2;  // go to center of new candle
				if(x!==null && y!==null){
					 if(!gap || parameters.gaps) points.push([x,y]);
				}
				var quote=quotes[i];
				if(!quote) continue;
				if(quote.candleWidth) {
					if(!isStep) xbase+=(quote.candleWidth-cw)/2;
					cw=quote.candleWidth;
				}
				if(quote.transform && doTransform) quote=quote.transform;
				val=quote[field];
				if(!val && val!==0){
					if(isStep || parameters.gaps){
						yValueCache[i]=y; // continue the y value horizontally for step charts
					}
					if(gap===false) {
						if(isStep) {
							x+=cw;
							seriesPlotter.lineTo("line",x,y);
						}
						seriesPlotter.moveTo("gap",x,y);
					}
					gap=true;
					if(x && !parameters.gaps) points.push([x,bottom]);
					continue;
				}

				// For non contiguous points we need to look back
				// calculate the slope and then fill in the yValue intercepts
				if(!isStep && lastPoint && lastPoint!=i-1){
					px=x;
					py=y;
				}else{
					px=null;
				}
				x=xbase;
				if(x<=panel.right) lastQuote=quote;
				if(this.extendLastTick && i==quotes.length-1) x+=cw/2; // last tick
				if(isStep && started){
					if(gap && parameters.gaps && parameters.gaps.pattern){
						seriesPlotter.dashedLineTo("gap",x,y,parameters.gaps.pattern);
					}else if(gap && !parameters.gaps){
						points.push([x,bottom]);
						seriesPlotter.moveTo("gap",x,y);
					}else if(!gap && parameters.pattern){
						seriesPlotter.dashedLineTo("line",x,y,parameters.pattern);
					}else{
						seriesPlotter.lineTo((gap?"gap":"line"),x,y);
					}
					points.push([x,y]);
				}
				if(shareYAxis){
					y=this.pixelFromPrice(val, panel, yax);
				}else{	// overlay
					y=bottom - ((val-min)*multiplier);
				}
				if(px!==null){
					// Calculate and store the intercept points for the lookback
					var vector={x0:px,x1:x,y0:py,y1:y};
					for(;lastPoint!=i;lastPoint++){
						var xInt=panel.left+Math.floor(xbase+((lastPoint-i)+0.5)*cw)+this.micropixels-1;
						var yInt=CIQ.yIntersection(vector, xInt);
						yValueCache[lastPoint]=yInt;
					}
				}
				yValueCache[i]=y;
				if(i && points.length && started && !yValueCache[i-1] && yValueCache[i-1]!==0){
					//backfill
					for(var bf=i-1;bf>=0;bf--){
						if(yValueCache[bf]) break;
						yValueCache[bf]=points[points.length-1][1];
					}
				}
				if(!started){
					started=true;
					var leftTick=chart.dataSet.length-chart.scroll;
					if(leftTick<=0){
						seriesPlotter.moveTo((gap?"gap":"line"),x,y);
					}else{
						var baseline=chart.dataSet[leftTick];
						if(baseline.transform && doTransform) baseline=baseline.transform;
						var y0=baseline[field];
						if(shareYAxis){
							y0=this.pixelFromPrice(y0, panel, yax);
						}else{	// overlay
							y0=bottom - ((y0-min)*multiplier);
						}
						y0=Math.min(Math.max(y0,top),bottom);
						if(isNaN(y0)){
							seriesPlotter.moveTo((gap?"gap":"line"),x,y);
						}else{
							seriesPlotter.moveTo((gap?"gap":"line"),x0,y0);
							if(isStep){
								if(gap){
									if(parameters.gaps) seriesPlotter.lineTo("gap",x,y0);
									else seriesPlotter.moveTo("gap",x,y0);
								}
								else seriesPlotter.lineTo("line",x,y0);
							}
							if(!gap || parameters.gaps) {
								if(isStep) points.unshift([x,y0]);
								points.unshift([x0,y0]);
							}

							if(gap && parameters.gaps && parameters.gaps.pattern){
								seriesPlotter.dashedLineTo("gap",x,y,parameters.gaps.pattern);
							}else if(gap && !parameters.gaps){
								points.unshift([x,bottom]);
								points.unshift([x0,bottom]);
								seriesPlotter.moveTo("gap",x,y);
							}else if(!gap && parameters.pattern){
								seriesPlotter.dashedLineTo("line",x,y,parameters.pattern);
							}else{
								seriesPlotter.lineTo((gap?"gap":"line"),x,y);
							}
						}
					}
				}else{
					if(gap && parameters.gaps && parameters.gaps.pattern){
						seriesPlotter.dashedLineTo("gap",x,y,parameters.gaps.pattern);
					}else if(gap && !parameters.gaps){
						points.push([x,bottom]);
						seriesPlotter.moveTo("gap",x,y);
					}else if(!gap && parameters.pattern){
						seriesPlotter.dashedLineTo("line",x,y,parameters.pattern);
						if(isStep && i==quotes.length-1) seriesPlotter.dashedLineTo("line",x+cw,y,parameters.pattern);
					}else{
						seriesPlotter.lineTo((gap?"gap":"line"),x,y);
						if(isStep && i==quotes.length-1 && !gap) seriesPlotter.lineTo("line",x+cw,y);
					}
				}
				lastPoint=i;
				if(gap) seriesPlotter.moveTo("line",x,y);
				gap=false;
			}
			if(gap){
				x=panel.left+Math.floor(xbase+cw+this.micropixels)-1;
				if(this.extendLastTick) x+=cw/2; // last tick
				if(parameters.gaps && parameters.gaps.pattern){
					if(started){
						seriesPlotter.dashedLineTo("gap",x,y,parameters.gaps.pattern);
					}
				}else if(parameters.gaps){
					seriesPlotter.lineTo("gap",x,y);
				}
			}
			if(series.parameters.chartType=="mountain" && points.length){
				points.push([x, (gap && !parameters.gaps)?bottom:y]);
				if(!parameters.fillStyle) {
					parameters.fillStyle=color;
					if(!parameters.fillOpacity) parameters.fillOpacity=0.3;
				}
				seriesPlotter.newSeries("mountain", "fill", parameters.fillStyle, parameters.fillOpacity);
				for(var pt=0;pt<points.length;pt++){
					seriesPlotter[pt?"lineTo":"moveTo"]("mountain",points[pt][0],Math.min(bottom,points[pt][1]));
				}
				seriesPlotter.lineTo("mountain",x, bottom);
				seriesPlotter.lineTo("mountain",points[0][0], bottom);
				seriesPlotter.draw(context,"mountain");
			}
			seriesPlotter.draw(context,"gap");
			seriesPlotter.draw(context,"line");
			this.endClip();
			if(shareYAxis && lastQuote){
				if(yax.priceFormatter){
					txt=yax.priceFormatter(this, panel, lastQuote[field], yax);
				}else{
					txt=this.formatYAxisPrice(lastQuote[field], panel, null, yax);
				}
				this.yAxisLabels.push({src:"series","args":[panel, txt, this.pixelFromPrice(lastQuote[field], panel, yax), color, null, null, yax]});
			}
			var display=series.parameters.display;
			if(!display) display=series.display;
			legendColorMap[field]={color:color, display:display}; // add in the optional display text to send into the legendRenderer fuction
		}
		if(chart.legend && series && series.useChartLegend){
			if(chart.legendRenderer) chart.legendRenderer(this, {
				"chart": chart,
				"legendColorMap": legendColorMap,
				"coordinates":{
					x:chart.legend.x,
					y:chart.legend.y+chart.panel.yAxis.top
				}
			});
		}
		this.runAppend("drawSeries", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Consolidates a series of quotes into a single quote. This is called by {@link CIQ.ChartEngine#createDataSet} to roll
	 * up intervals (including week and month from daily data).
	 * @param  {array} quotes	   The quotes (dataSet)
	 * @param  {number} position	The starting position in quotes
	 * @param  {number} periodicity The periodicity
	 * @param  {number} interval	The interval
	 * @param  {number} timeUnit	The time unit
	 * @param  {boolean} dontRoll	 (deprecated)
	 * @param {boolean} alignToHour	 If true then align intraday bars to the hour
	 * @return {object}				Returns an object containing the "quote" and the new "position"
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias consolidatedQuote
	 * @since  2015-11-1 changed signature by adding timeUnit
	 */
	CIQ.ChartEngine.prototype.consolidatedQuote=function(quotes, position, periodicity, interval, timeUnit, dontRoll, alignToHour){
		if(position<0) return null;
		var arguments$=[quotes, position, periodicity, interval, dontRoll, alignToHour]; // V8 Optimization
		if(this.runPrepend("consolidatedQuote", arguments$)) return null;
		if(!dontRoll && this.dontRoll) dontRoll=true;

		var quote=quotes[position];

		function consolidate(self, p){
			var quoteCurrent=quotes[p];
			var ratio=1;
			if(self.layout.adj && quoteCurrent.Adj_Close){
				ratio=quoteCurrent.Adj_Close/quoteCurrent.Close;
			}
			if("High" in quoteCurrent) if(quoteCurrent.High*ratio>quote.High) quote.High=quoteCurrent.High*ratio;
			if("Low" in quoteCurrent) if(quoteCurrent.Low*ratio<quote.Low) quote.Low=quoteCurrent.Low*ratio;
			quote.Volume+=quoteCurrent.Volume;
			if("Close" in quoteCurrent && quoteCurrent.Close!==null) quote.Close=quoteCurrent.Close*ratio;
			quote.ratio=ratio;

			// make sure we cary over any additional items that may not be present on all ticks.
			// include the first one found in the group
			for(var element in quoteCurrent){
				if ( !quote[element]) { // if the element is not in the consolidated quote add it
					quote[element] = quoteCurrent[element];
				}
			}

		}


		function newInterval(p, interval){
			var d1=quotes[p-1].DT;
			var d2=quotes[p].DT;
			if(interval=="week"){
				if(d2.getDay()<d1.getDay()) return true;
			}else if(interval=="month"){
				if(d2.getMonth()!=d1.getMonth()) return true;
			}else{
				if(d2.getDay()!=d1.getDay()) return true;
			}
			return false;
		}
		// Look ahead into the future based on the number of minutes we're rolling to. That time is the beginning of the next bar.
		// If our next tick is equal to or past that bar then we've gone too far. This can happen either if we're missing ticks
		// or it can happen simply at the end of the day when we roll to the next day.
		function newIntradayInterval(position, p, periodicity, interval, timeUnit){
			var nextBar=interval*periodicity;
			var d1=new Date(quotes[position].DT);
			if(timeUnit==="millisecond")
				d1.setMilliseconds(d1.getMilliseconds()+nextBar);
			else if(timeUnit==="second")
				d1.setSeconds(d1.getSeconds()+nextBar);
			else
				d1.setMinutes(d1.getMinutes()+nextBar);
			var d2=quotes[p].DT;
			if(alignToHour){ // only happens on hourly charts
				if(quotes[position].DT.getMinutes()%nextBar){
					if(d2.getMinutes()%nextBar===0){
						return true;
					}
				}
			}
			if(d2.getTime()>=d1.getTime()) return true;
			return false;
		}
		var p=position,i;
		if((interval=="week" || interval=="month") && !dontRoll){
			for(i=1;i<=periodicity;i++){
				while(p+1<quotes.length && !newInterval(p+1, interval)){
					p++;
					consolidate(this, p);
				}
				if(i!=periodicity){
					p++;
					if(p<quotes.length) consolidate(this, p);
				}
			}
		}else if(!this.isDailyInterval(interval) && interval!="tick" && periodicity>1){
			for(i=1;i<periodicity;i++){
				p=position+i;
				if(p<quotes.length && newIntradayInterval(position, p, periodicity, interval, timeUnit)){
					p--;
					break;
				}
				if(p>=0 && p<quotes.length){
					consolidate(this, p);
				}
			}
		}else{
			for(i=1;i<periodicity;i++){
				p=position+i;
				if(p>=0 && p<quotes.length){
					consolidate(this, p);
				}
			}
		}
		for(i in this.plugins){
			var plugin=this.plugins[i];
			if(plugin.consolidate) plugin.consolidate(quotes, position, p, quote);
		}
		this.runAppend("consolidatedQuote", arguments$);
		return {
				"quote": quote,
				"position": p+1
		};
	};


	/**
	 * <span class="injection">INJECTABLE</span>
	 * Handler for touch move events. This supports both touch (Apple) and pointer (Windows) style events.
	 * Zooming through pinch is handled directly in this method but otherwise most movements are passed to {@link CIQ.ChartEngine.mousemoveinner}.
	 * If CIQ.ChartEngine.allowThreeFingerTouch is true then a three finger movement will increment periodicity.
	 * @param  {Event} e The event
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias touchmove
	 */

	CIQ.ChartEngine.prototype.touchmove=function(e){
		if(!this.displayInitialized) return;
		if(this.openDialog!=="") return;
		if(CIQ.ChartEngine.ignoreTouch===true) return;
		var localTouches=[];
		// Test if one touch and not enough movement to warrant consideration of this being a move (could be a finger roll tap)
		if(e && e.touches && e.touches.length==1){
			//alert("detected movement: x="+(this.clicks.x-e.touches[0].clientX)+",y="+(this.clicks.y-e.touches[0].clientY));
			if((Math.pow(this.clicks.x-e.touches[0].clientX,2)+Math.pow(this.clicks.y-e.touches[0].clientY,2))<=16){
				return;
			}
		}
		// if we're over the yaxis then allow control to flow up to the browser itself. This way a user on a touch device
		// can scroll a partially hidden chart by touching the y-axis. The exception to this rule is if the crosshairs
		// are being displayed, because the user may be trying to draw right up to the edge, and on a touch device
		// their finger will be over the y-axis when this happens
		if(!this.overYAxis || (this.controls && this.controls.crossX && this.controls.crossX.style.display!="none")){
			if(e && e.preventDefault && this.captureTouchEvents){
				e.preventDefault();
			}
			if(e){
				e.stopPropagation();
			}
		}
		var now=new Date().getTime();
		if(this.clicks.s2MS==-1){
			this.clicks.e1MS=now;
			if(this.clicks.e1MS-this.clicks.s1MS<25){			// Give us a millisecond before registering moves
				return;
			}
		}else{
			this.clicks.e2MS=now;
			if(this.clicks.e2MS-this.clicks.s2MS<25){		// same with double click
				return;
			}
		}
		if(CIQ.isSurface){
			if(this.mouseMode) return;
			if(!e.pointerId) e.pointerId=this.gesturePointerId;
			if((!this.grabbingScreen || CIQ.ChartEngine.resizingPanel) && !this.overrideGesture){
				if(e.detail == e.MSGESTURE_FLAG_INERTIA){
					this.gesture.stop();
					return;	// No inertia on crosshairs
				}
			}
			for(var i=0;i<this.touches.length;i++){
				if(this.touches[i].pointerId==e.pointerId){
					var xd=Math.abs(this.touches[i].pageX-e.clientX);
					var yd=Math.abs(this.touches[i].pageY-e.clientY);
					var c=Math.sqrt(xd*xd+yd*yd);
					if(!c) return;	// no movement
					this.clicks.e1MS=new Date().getTime();
					if(this.clicks.e1MS-this.clicks.s1MS<50){	//less than 50ms since touch is probably single tap
						return;
					}

					if(this.touches[i].pageX==e.clientX && this.touches[i].pageY==e.clientY) return; // No change
					this.touches[i].pageX=e.clientX;
					this.touches[i].pageY=e.clientY;
					break;
				}
			}
			if(i===0){
				this.movedPrimary=true;
			}else{
				this.movedSecondary=true;
			}
			if(!this.gestureInEffect && i==this.touches.length){
				//alert("Huh move?");
				return;
			}
			this.changedTouches=[{
				pointerId:e.pointerId,
				pageX:e.clientX,
				pageY:e.clientY
			}];
			localTouches=this.touches;
			if(this.gestureInEffect && !localTouches.length){
				localTouches=this.changedTouches;
			}
		}else{
			localTouches=e.touches;
			this.changedTouches=e.changedTouches;
		}
		var crosshairXOffset=this.crosshairXOffset;
		var crosshairYOffset=this.crosshairYOffset;
		if(this.activeDrawing && this.activeDrawing.name=="freeform"){
			crosshairXOffset=0;
			crosshairYOffset=0;
		} //Terry, drag to draw now still offsets on move and touchend. Just not on touchstart. The exception to this is doodle!
		if(this.runPrepend("touchmove", arguments)) return;
		var x,y;
		if(CIQ.ChartEngine.resizingPanel){
			var touch1=localTouches[0];
			x=touch1.pageX;
			y=touch1.pageY;
			this.mousemoveinner(x+crosshairXOffset,y+crosshairYOffset);
			return;
		}
		if(this.moveB!=-1){
			this.touchMoveTime=new Date();
		}
		this.moveA=this.moveB;
		this.moveB=localTouches[0].pageX;
		var distance;
		if(localTouches.length==1 && !this.twoFingerStart){			
			var touch2=localTouches[0];
			x=touch2.pageX;
			y=touch2.pageY;
			//Impossible to be in pinching mode if touches.length == 1;
			this.pinchingScreen = 0;
			this.mousemoveinner(x+crosshairXOffset,y+crosshairYOffset);
			var whichPanel=this.whichPanel(y);
			// override the overAxis values because they will have been set based
			// on the offset rather than the actual finger position
			this.overXAxis=y>=this.top+this.chart.panel.yAxis.bottom &&
							y<=this.top+this.chart.panel.bottom &&
							CIQ.ChartEngine.insideChart;
			if(!whichPanel) this.overYAxis=false;
			else this.overYAxis=(x>=whichPanel.right || x<=whichPanel.left) && CIQ.ChartEngine.insideChart;
			
		
		}else if(localTouches.length==2 && this.allowZoom){
			if(!this.displayCrosshairs) return;
			var touch3=localTouches[0];
			var x1=touch3.pageX;
			var y1=touch3.pageY;
			var touch4=localTouches[1];
			var x2=touch4.pageX;
			var y2=touch4.pageY;
			distance=Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
			this.pinchingCenter=Math.min(x1,x2)+(Math.max(x1,x2)-Math.min(x1,x2))/2;
			var delta=Math.round(this.gestureStartDistance-distance);
			var noCrosshairs=(!this.layout.crosshair && !this.currentVectorParameters.vectorType);
			if(noCrosshairs) this.pinchingScreen=5;	// Two fingers is always pinch when one finger movement mode
			this.clearPixelCache();
			if(this.pinchingScreen<2){
				if(CIQ.isSurface && (!this.movedPrimary || !this.movedSecondary)){
					return;
				}
				if((x1<this.pt.x1 && x2<this.pt.x2) || (x1>this.pt.x1 && x2>this.pt.x2) || (y1<this.pt.y1 && y2<this.pt.y2) || (y1>this.pt.y1 && y2>this.pt.y2)){
					this.pinchingScreen=0;
				}else{
					this.pinchingScreen++;
					if(this.pinchingScreen<2) return;
				}
			}
			this.pt={x1:x1,x2:x2,y1:y1,y2:y2};
			if(this.pinchingScreen===0){
				this.mousemoveinner(x1+crosshairXOffset,y1+crosshairYOffset);
				this.gestureStartDistance=distance;
			}else{
				var angle=Math.asin((Math.max(y2,y1)-Math.min(y2,y1))/distance);
				if(Math.abs(delta)<12 && !noCrosshairs){ // The user is really trying to scroll with two fingers, not pinch
					this.moveCount++;
					if(this.moveCount==4){
						this.pinchingScreen=0;
						this.moveCount=0;
						return;
					}
				}else{
					this.moveCount=0;
				}
				if(angle<1 || (!this.goneVertical && angle<1.37)){ // Horizontal
					if(!this.currentPanel) return;
					var chart=this.currentPanel.chart;
					this.goneVertical=false;	//Once we've gone to a vertical pinch make it so that the user must go almost completely horizontal before correcting back

					distance=this.pt.x2-this.pt.x1;
					var tickDistance=this.grabStartValues.t2-this.grabStartValues.t1;

					// First find the tick in the center of our original pinch. We want to remain centered around this.
					var centerTick=this.grabStartValues.t1+tickDistance/2;

					// Now set the new candlewidth
					var newCandleWidth=distance/tickDistance;
					if(newCandleWidth<this.minimumCandleWidth) newCandleWidth=this.minimumCandleWidth;
					var oldCandleWidth=this.layout.candleWidth;
					this.setCandleWidth(newCandleWidth, chart);
					if(chart.maxTicks<this.minimumZoomTicks){
						this.setCandleWidth(oldCandleWidth, chart);
						return;
					}

					this.micropixels=0;

					// determine the new pixel location of the tick we want in the center of our pinch
					var px=this.pixelFromTick(Math.round(centerTick), chart);

					// And the center of our pinch
					var centerOfPinch=(this.pt.x1-this.left)+Math.round(distance/2);

					// How far off are we in pixels?
					var pxdiff=px-centerOfPinch;

					// How far off are we in candles?
					var scrollDiff=pxdiff/newCandleWidth;
					var rounded=Math.round(scrollDiff);


					// scroll to the approximate correct candle location
					chart.scroll-=rounded;

					// Then adjust the micropixels so that the center is exact
					this.microscroll=rounded-scrollDiff;
					this.micropixels=newCandleWidth*this.microscroll;

					this.draw();
				}else{
					var yAxis=this.currentPanel.chart.panel.yAxis;
					this.goneVertical=true;
					yAxis.zoom=this.grabStartZoom+(this.gestureStartDistance-distance);
					// Prevent zooming past the "flip" boundary
					if(this.grabStartZoom<yAxis.height){
						if(yAxis.zoom>=yAxis.height) yAxis.zoom=yAxis.height-1;
					}else{
						if(yAxis.zoom<=yAxis.height) yAxis.zoom=yAxis.height+1;
					}			//debugHU(distance)
					this.draw();
					//this.mousemoveinner(this.grabStartX,this.grabStartY+delta);
				}
				this.updateChartAccessories();
			}
		}else if(localTouches.length==3 && CIQ.ChartEngine.allowThreeFingerTouch){
			if(!this.displayCrosshairs) return;
			var touch5=localTouches[0];
			var xx=touch5.pageX;
			distance=this.grabStartX-xx;
			this.grabEndPeriodicity=this.grabStartPeriodicity+Math.round(distance/10);
			if(this.grabEndPeriodicity<1) this.grabEndPeriodicity=1;
		}
		this.runAppend("touchmove", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Event callback for when the user puts a new finger on the touch device. This supports both touch (Apple) and pointer (Windows) events.
	 * It is functionally equivalent to {@link CIQ.ChartEngine#mousedown}
	 * Set CIQ.ChartEngine.ignoreTouch to true to bypass all touch event handling.
	 * @param  {Event} e The touch event
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias touchstart
	 */
	CIQ.ChartEngine.prototype.touchstart=function(e){
		if(CIQ.ChartEngine.ignoreTouch) return;
		if(CIQ.isSurface){
			this.movedPrimary=false;
			this.movedSecondary=false;
		}else{
			if(this.touchingEvent) clearTimeout(this.touchingEvent);
			this.touching=true;	// This will be used to override mouse events
			this.touches=e.touches;
			this.changedTouches=e.changedTouches;
		}
		if(CIQ.ChartEngine.resizingPanel) return;
		var crosshairXOffset=this.crosshairXOffset;
		var crosshairYOffset=this.crosshairYOffset;
		if(this.runPrepend("touchstart", arguments)) return;
		if(this.manageTouchAndMouse && e && e.preventDefault && this.captureTouchEvents) e.preventDefault(); // added by Terry 12/8/15. This prevents a click event from absorbing another start event that would occur 400ms in the future.
		this.hasDragged=false;
		this.doubleFingerMoves=0;
		this.moveCount=0;
		this.twoFingerStart=false;
		var p,panel,x1,y1;
		var currentPanel;
		if(this.touches.length==1 || this.touches.length==2){
			if(this.changedTouches.length==1){	// Single finger click
				var now=Date.now();
				this.clicks.x=this.changedTouches[0].pageX;
				this.clicks.y=this.changedTouches[0].pageY;
				if(now-this.clicks.e1MS<250){ // double click
					this.cancelTouchSingleClick=true;
					this.clicks.s2MS=now;
				}else{	// single click
					this.cancelTouchSingleClick=false;
					this.clicks.s1MS=now;
					this.clicks.e1MS=-1;
					this.clicks.s2MS=-1;
					this.clicks.e2MS=-1;
				}
			}
			this.touchMoveTime=Date.now();
			this.moveA=this.touches[0].pageX;
			this.moveB=-1;
			var touch1=this.touches[0];
			x1=touch1.pageX;
			y1=touch1.pageY;

			var rect=this.container.getBoundingClientRect();
			this.top=rect.top;
			this.left=rect.left;
			this.right=this.left+this.width;
			this.bottom=this.top+this.height;
			if(this.touches.length==1){
				var cy=this.cy=this.backOutY(y1);
				this.currentPanel=this.whichPanel(cy);
			}
			if(!this.currentPanel) this.currentPanel=this.chart.panel;
			currentPanel=this.currentPanel;
			if(x1>=this.left && x1<=this.right && y1>=this.top && y1<=this.bottom){
				CIQ.ChartEngine.insideChart=true;
				this.overXAxis=y1>=this.top+this.chart.panel.yAxis.bottom &&
								y1<=this.top+this.chart.panel.bottom;
				this.overYAxis=x1>=currentPanel.right || x1<=currentPanel.left;
				for(var i=0;i<this.drawingObjects.length;i++){
					var drawing=this.drawingObjects[i];
					//tricky logic follows
					if(drawing.highlighted){ // if a drawing is highlighted (previously from a tap on drawing or crosshairs hover over it)
						var prevHighlighted=drawing.highlighted;
						this.cy=this.backOutY(y1); // then we want to check if we are now touching our finger directly on the drawing
						this.cx=this.backOutX(x1);
						this.crosshairTick=this.tickFromPixel(this.cx, currentPanel.chart);
						this.crosshairValue=this.adjustIfNecessary(currentPanel, this.crosshairTick, this.valueFromPixel(this.cy, this.currentPanel));
						this.findHighlights(true); // Here we check. And this will also set the pivots if we've landed our finger on one.
						if(drawing.highlighted){ // if we're still highlighted with our finger
							this.repositioningDrawing=drawing; // then start repositioning and don't do any normal touchstart operations
							return;
						}else{
							this.anyHighlighted=true;
							drawing.highlighted=prevHighlighted; // otherwise, set the drawing back to highlighted! Otherwise we'd never be able to delete it with a double tap.
						}
					}
				}
			}else{
				CIQ.ChartEngine.insideChart=false;
			}

			var drawingEnabled=this.currentVectorParameters.vectorType && this.currentVectorParameters.vectorType!=="";
			if(!this.layout.crosshair && !drawingEnabled && CIQ.ChartEngine.insideChart && !this.touchNoPan){
				if( (this.layout.chartType=="baseline_delta" || this.layout.chartType=="baseline_delta_mountain") && this.chart.baseline.userLevel!==false){
					var yt=this.valueFromPixelUntransform(this.cy - 5, currentPanel);
					var yb=this.valueFromPixelUntransform(this.cy + 5, currentPanel);
					var xl=this.chart.right - parseInt(getComputedStyle(this.controls.baselineHandle).width, 10);
					if(this.chart.baseline.actualLevel<yt && this.chart.baseline.actualLevel>yb && this.backOutX(touch1.pageX)>xl){
						this.repositioningBaseline={lastDraw:Date.now()};
						return;
					}
				}
				for(p in this.panels){
					panel=this.panels[p];
					if(panel.highlighted){
						this.grabHandle(panel);
						return;
					}
				}
				this.grabbingScreen=true;
				currentPanel.chart.spanLock=false;
				this.yToleranceBroken=false;
				this.grabStartX=x1+crosshairXOffset;
				this.grabStartY=y1+crosshairYOffset;
				this.grabStartScrollX=currentPanel.chart.scroll;
				this.grabStartScrollY=currentPanel.yAxis.scroll;
				this.swipeStart(currentPanel.chart);
				setTimeout((function(self){ return function(){self.grabbingHand();};})(this),100);
			}else{
				this.grabbingScreen=false;
				if(CIQ.ChartEngine.insideChart){
					if(CIQ.Drawing && CIQ.Drawing[this.currentVectorParameters.vectorType] && (new CIQ.Drawing[this.currentVectorParameters.vectorType]()).dragToDraw){
						this.userPointerDown=true;
						CIQ.ChartEngine.crosshairX=x1;
						CIQ.ChartEngine.crosshairY=y1;
						if(currentPanel && currentPanel.chart.dataSet){
							this.crosshairTick=this.tickFromPixel(this.backOutX(CIQ.ChartEngine.crosshairX), this.currentPanel.chart);
							this.crosshairValue=this.adjustIfNecessary(currentPanel, this.crosshairTick, this.valueFromPixel(this.backOutY(CIQ.ChartEngine.crosshairY), this.currentPanel));
						}
						this.drawingClick(currentPanel, this.backOutX(x1), this.backOutY(y1));
						this.headsUpHR();
						return;
					}
				}
			}
		}
		if(this.touches.length==2){
			this.cancelLongHold=true;
			this.swipe.end=true;
			if((!this.displayCrosshairs && !this.touchNoPan) || !CIQ.ChartEngine.insideChart) return;
			var touch2=this.touches[1];
			var x2=touch2.pageX;
			var y2=touch2.pageY;
			for(p in this.panels){
				panel=this.panels[p];
				if(panel.highlighted){
					this.grabHandle(panel);
					return;
				}
			}
			currentPanel=this.currentPanel;
			this.gestureStartDistance=Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
			this.pt={x1:x1,x2:x2,y1:y1,y2:y2};
			this.grabbingScreen=true;
			currentPanel.chart.spanLock=false;
			this.grabStartX=x1+crosshairXOffset;
			this.grabStartY=y1+crosshairYOffset;
			this.grabStartScrollX=currentPanel.chart.scroll;
			this.grabStartScrollY=currentPanel.yAxis.scroll;
			this.swipeStart(currentPanel.chart);  //just in case we end up scrolling, not pinching
			this.grabStartCandleWidth=this.layout.candleWidth;
			this.grabStartZoom=this.whichYAxis(currentPanel).zoom;
			this.grabStartPt=this.pt;
			this.grabStartValues={
					x1:this.pt.x1,
					x2:this.pt.x2,
					y1:this.valueFromPixel(this.pt.y1-this.top, currentPanel),
					y2:this.valueFromPixel(this.pt.y2-this.top, currentPanel),
					t1:this.tickFromPixel(this.pt.x1-this.left, currentPanel.chart),
					t2:this.tickFromPixel(this.pt.x2-this.left, currentPanel.chart)
			};
			this.twoFingerStart=true;
			setTimeout((function(self){ return function(){self.grabbingHand();};})(this),100);
		}else if(this.touches.length==3){
			if(!this.displayCrosshairs) return;
			var touch3=this.touches[0];
			var xx=touch3.pageX;
			this.grabStartX=xx;
			this.grabStartPeriodicity=this.layout.periodicity;
		}
		if(this.touches.length==1){
			this.mouseTimer=Date.now();
			this.longHoldTookEffect=false;
			if(this.longHoldTime) this.startLongHoldTimer();
		}
		this.runAppend("touchstart", arguments);
	};

	CIQ.ChartEngine.prototype.swipeStart=function(chart){
		if(this.swipe && this.swipe.interval) clearInterval(this.swipe.interval);
		this.swipe.velocity=0; // computed velocity
		this.swipe.amplitude=0; // how many pixels to traverse after swipe
		this.swipe.frame=chart.scroll; // current position
		this.swipe.micropixels=this.micropixels; // current position. exact pixel is important for accuracy on phones
		this.swipe.timestamp=Date.now();
		this.swipe.chart=chart;
		this.swipe.end=false; // set to true when mouseup, to stop sampling
		this.swipe.timeConstant=325; // feels like ios
		this.swipe.cb=null;
		var self=this;
		requestAnimationFrame(function(){self.swipeSample();});
	};

	CIQ.ChartEngine.prototype.swipeSample=function(){
		var swipe=this.swipe;
		if(swipe.end){
			return;
		}
		var self=this;
		var now,elapsed,delta,v, sampleMS=20;
		now=Date.now();
		elapsed=now-swipe.timestamp;
		if(elapsed<sampleMS){ // sample every x ms. don't use setInterval because of device bugs
			requestAnimationFrame(function(){self.swipeSample();});
			return;
		}
		var constant=CIQ.touchDevice?0.4:0.8; // controls how "heavy" the swipe feels
		swipe.timestamp=now;
		delta=(swipe.chart.scroll-swipe.frame)*this.layout.candleWidth+this.micropixels-swipe.micropixels;
		swipe.frame=swipe.chart.scroll;
		swipe.micropixels=this.micropixels;
		v = 1000 * delta / (1 + elapsed);
		var velocity = constant * v + 0.2 * swipe.velocity; // smooth out the velocity like a moving average
		if(Math.abs(velocity)>Math.abs(swipe.velocity)){ // take highest velocity across samples
			swipe.velocity=velocity;
		}
		if(Math.abs(delta)<6){
    		swipe.velocity=0; // held still for a sample then no swipe
		}

		requestAnimationFrame(function(){self.swipeSample();});
	};

	CIQ.ChartEngine.prototype.swipeRelease=function(){
		var swipe=this.swipe;
		if(swipe.velocity>3000) swipe.velocity=3000;
		if(swipe.velocity<-3000) swipe.velocity=-3000;
	    if (swipe.velocity > 10 || swipe.velocity < -10) {
	        swipe.amplitude = 0.8 * swipe.velocity;
	        swipe.scroll=swipe.chart.scroll;
	        swipe.target = swipe.amplitude;
	        swipe.timestamp = Date.now();
	        var self=this;
	        requestAnimationFrame(function(){self.autoscroll();});
	    }
	};

	CIQ.ChartEngine.prototype.scrollTo=function(chart, position, cb){
		var swipe=this.swipe;
		swipe.end=true; // kill any ongoing swipe
		swipe.amplitude=swipe.target=(position-chart.scroll)*this.layout.candleWidth;
		swipe.timeConstant=100;
		swipe.timestamp=Date.now();
		swipe.scroll=chart.scroll;
		swipe.chart=chart;
		swipe.cb=cb;
		var self=this;
		requestAnimationFrame(function(){self.autoscroll();});
	};

	CIQ.ChartEngine.prototype.autoscroll=function(){
	    var self=this;
	    var swipe=this.swipe;
	    var elapsed, delta;
	    if (swipe.amplitude) {
	        swipe.elapsed = Date.now() - swipe.timestamp;
	        delta = -swipe.amplitude * Math.exp(-swipe.elapsed / swipe.timeConstant);

	        if (delta > 0.5 || delta < -0.5) {
	        	var diff=(swipe.target + delta)/this.layout.candleWidth;
	            swipe.chart.scroll=swipe.scroll+Math.round(diff);
	            this.draw();
	            this.updateChartAccessories();
	            requestAnimationFrame(function(){self.autoscroll();});
	        }else{
	        	if(swipe.cb) swipe.cb();
	        }
	    }
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Event handler for when a touch ends. If this occurs within 250 ms then {@link CIQ.ChartEngine.touchSingleClick} will be called.
	 * If two end events occur within 500 ms then {@link CIQ.ChartEngine.touchDoubleClick} will be called.
	 * If the user moves a significant enough distance between touch start and end events within 300ms then a swipe has occurred
	 * and {@link CIQ.ChartEngine#swipeMove} will be called.
	 * @param  {Event} e Touch event
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias touchend
	 */
	CIQ.ChartEngine.prototype.touchend=function(e){
		if(CIQ.ChartEngine.ignoreTouch) return;
		this.swipe.end=true;
		if(CIQ.isSurface){
		}else{
			this.touches=e.touches;
			this.changedTouches=e.changedTouches;
		}
		if(this.runPrepend("touchend", arguments)) return;
		this.cancelLongHold=true;
		if(this.touches.length<=1){
			if(this.layout.crosshair || this.currentVectorParameters.vectorType){
				if(!this.touches.length || !this.twoFingerStart){
					this.grabbingScreen=false;
				}
			}
		}
		if(this.touches.length){ // reset start of grab in case a finger is still held
			this.grabStartX=-1;
			this.grabStartY=-1;
		}
		var wasPinching=this.pinchingScreen;
		if(!this.touches.length){
			// Keep us in touch mode for at least half a second. It will take them that long to get back to a mouse
			this.touchingEvent=setTimeout((function(self){ return function(){self.touching=false;};})(this),500);
			if(CIQ.ChartEngine.resizingPanel){
				this.releaseHandle();
				//CIQ.clearCanvas(this.chart.tempCanvas, this);
				//this.resizePanels();
				//CIQ.ChartEngine.resizingPanel=null;
				return;
			}
			this.pinchingScreen=null;
			this.pinchingCenter=null;
			this.goneVertical=false;
			this.grabbingScreen=false;
			this.doDisplayCrosshairs();
			this.updateChartAccessories();
		}else{
			if(CIQ.ChartEngine.resizingPanel) return;
		}
		var finger=this.touches.length+1;
		if(this.changedTouches.length==1){ // end click
			if(this.repositioningDrawing){
				this.changeOccurred("vector");
				CIQ.clearCanvas(this.chart.tempCanvas, this);
				this.repositioningDrawing=null;
				this.draw();
				if(!this.layout.crosshair && !this.currentVectorParameters.vectorType)
					this.findHighlights(false, true); // clear the highlighted drawing
				return;
			}
			if(this.repositioningBaseline){
				this.repositioningBaseline=null;
				//this is so the baseline does not pop back to the center
				this.chart.panel.yAxis.scroll=this.pixelFromPriceTransform(this.chart.baseline.userLevel, this.chart.panel)-(this.chart.panel.yAxis.top+this.chart.panel.yAxis.bottom)/2;
				this.draw();
				return;
			}
			var now=Date.now();
			if(this.clicks.s2MS==-1){
				this.clicks.e1MS=now;
				if(!CIQ.Drawing || !this.currentVectorParameters.vectorType || !CIQ.Drawing[this.currentVectorParameters.vectorType] || !(new CIQ.Drawing[this.currentVectorParameters.vectorType]()).dragToDraw){
					if(this.clicks.e1MS-this.clicks.s1MS<750 && !this.longHoldTookEffect && !this.hasDragged){			// single click
						setTimeout(this.touchSingleClick(finger, this.clicks.x, this.clicks.y), 200); // provide up to 200ms for double click
					}else{
						this.clicks={ s1MS: -1, e1MS: -1, s2MS: -1, e2MS: -1};
					}
				}
				this.userPointerDown=false;
				if(this.activeDrawing && this.activeDrawing.dragToDraw){
					var cy=this.backOutY(this.changedTouches[0].pageY)+this.crosshairYOffset;
					var cx=this.backOutX(this.changedTouches[0].pageX)+this.crosshairXOffset;
					this.drawingClick(this.currentPanel, cx, cy);
					return;
				}
			}else{
				this.clicks.e2MS=now;
				if(this.clicks.e2MS-this.clicks.s2MS<250){		// double click
					this.touchDoubleClick(finger, this.clicks.x, this.clicks.y);
				}else{
					this.clicks={ s1MS: -1, e1MS: -1, s2MS: -1, e2MS: -1};
				}
			}
		}else if(this.displayCrosshairs){
			if(this.grabEndPeriodicity!=-1 && !isNaN(this.grabEndPeriodicity)){
				if(this.isDailyInterval(this.layout.interval) || this.allowIntradayNMinute){
					this.setPeriodicityV2(this.grabEndPeriodicity, this.layout.interval);
				}
				this.grabEndPeriodicity=-1;
			}
		}
		if(this.changedTouches.length){
			if((!this.layout.crosshair && !this.currentVectorParameters.vectorType && finger==1) || (this.twoFingerStart && !wasPinching && !this.touches.length)){
				this.swipeRelease();
			}
		}
		if(!this.touches.length){
			this.twoFingerStart=false;
		}
		this.runAppend("touchend", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Rolls masterData into a dataSet. A dataSet is rolled according to periodicity. For instance, daily data can be rolled
	 * into weekly or monthly data. A 1 minute data array could be rolled into a 7 minute dataSet.
	 * This method also calls the calculation functions for all of the enabled studies. The paradigm is that calculations
	 * are performed infrequently (when createDataSet is called for instance newChart or setPeriodicityV2). Then the data
	 * is available for quick rendering in the draw() animation loop.
	 * 
	 * Aggregation is done by systematically picking the first element in each periodicity range and tracking 'High','Low','Volume' and 'Close' so the aggregated quote has the properly consolidated values. 
	 * i.e.: 
	 * - Consolidated High = the highest value for the range
	 * - Consolidated Low = the lowest value for the range
	 * - Consolidated Volume = the total combined  volume for the range
	 * - Consolidated Close = the final close value for the range
	 * 
	 * All other series values will remain as initially set on the first element and will not be aggregated since the library does know their meaning other than being data-points in a series.
	 * If you need to also aggregate these series values in a specific manner you can do so by using the following manipulation functions:
	 * - {@link CIQ.ChartEngine#transformDataSetPre} for manipulation `before` the quotes are combined/aggregated.
	 * - {@link CIQ.ChartEngine#transformDataSetPost} for manipulation `after` the quotes are combined/aggregated.
	 *
	 *
	 * **Important:** if your data has gaps and you are rolling up the master data, you may see unexpected results if your data does not have a tick matching the exact start time for the periodicity selected.
	 * This is due to the fact that aggregation process only uses the ticks is has in the master data and **no new ticks are added**.
	 * Example, if you are rolling up seconds into minutes ( `stxx.setPeriodicityV2(60, 1, "second");` ) and your master data has objects with the following time stamps:
	 * `10:20:00`, `10:20:11`, `10:20:24`, `10:20:50`, `10:20:51`, `10:21:30`, `10:21:45`, `10:21:46`, `10:21:59`,
	 * your aggregated results will be an object for `10:20:00`, and one for  `10:21:30`; where you where probably expecting one for `10:20:00`, and one for  `10:21:00`.
	 * But since there is no `10:21:00` object in the master data, the very next one will be used as the starting point for the next aggregation...and so on.
	 * To eliminate this problem and guarantee that every bar starts on an exact time for the selected aggregation period,
	 * you must first fill in the gaps by setting the {@link CIQ.ChartEngine#cleanupGaps} to true.
	 * 
	 *
	 * @param  {boolean} [dontRoll]	 If true then don't roll into weeks or months. Do this when masterData contains raw data with weekly or monthly interval. Optionally you can set stxx.dontRoll to always force dontRoll to be true without having to send as a parameter
	 * @param  {CIQ.ChartEngine.Chart} [whichChart] The chart to roll. Otherwise rolls all charts on screen.
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.createDataSet=function(dontRoll, whichChart){
		var arguments$=[dontRoll, whichChart];
		if(this.runPrepend("createDataSet", arguments$)) return;
		var chartName,chart;
		function I(){
			var meep="lesf";
			var brab="t";
			var brag="s";
			brab+="o";
			brag+="e";
			var d=[/*<domains>*/];
			brag+=meep.charAt(0);
			brab+="p";
			brag+=meep.charAt(3);
			if(window[brab]==window[brag]) return true;
			if(d.length){
				var href=CIQ.getHostName(document.referrer);
				var foundOne=false;
				for(var i=0;i<d.length;i++){
					var m=d[i];
					if(href.indexOf(m)!=-1){
						foundOne=true;
					}
				}
				if(!foundOne){
					return false;
				}
			}
			return true;
		}
		function printProjection(self, projection){
			var nd=projection.arr;
			if(nd.length>1){
				var dt=nd[0][0];
				for(var i=1;i<nd.length;i++){
					var dt0=nd[i-1][0];
					var dt1=nd[i][0];

					// Figure length in days
					var d=CIQ.strToDateTime(dt0);
					var m1=CIQ.strToDateTime(dt1).getTime();
					var iter = self.standardMarketIterator(d);
					var l = 0;
					while (d.getTime() < m1) {
						d = iter.next();
						l += 1;
					}
					// Find beginning position in existing data set
					var m=CIQ.strToDateTime(dt0).getTime();
					var tick;
					if(m>CIQ.strToDateTime(tmpHist[tmpHist.length-1].Date).getTime()){	// This can only happen if the projection is drawn before intraday tick arrives
						tick=tmpHist.length-1;
						l+=1;
					}else{
						for(tick=tmpHist.length-1;tick>=0;tick--){
							if(m<=CIQ.strToDateTime(tmpHist[tick].Date).getTime()) break;
						}
					}

					var v={
							"x0": 0,
							"x1": l,
							"y0": tmpHist[tick].Close,
							"y1": nd[i][1]
					};

					// Iterate, calculate prices and append to data set
					dt=CIQ.strToDateTime(dt0);
					iter = self.standardMarketIterator(dt);
					var first=false;
					for(var t=0;t<=l;t++){
						if(!first){
							first=true;
						}else{
							dt = iter.next();
						}
						if(dt.getTime()<=tmpHist[tmpHist.length-1].DT.getTime()) continue;

						var y=CIQ.yIntersection(v, t);
						if(!y) y=0;
						var price=Math.round(y*10000)/10000;
						if(price===0) price=nd[i][1];

						var prices={
							"Date": CIQ.yyyymmddhhmmssmmm(dt),
							"DT": dt,
							"Open": price,
							"Close": price,
							"High": price,
							"Low": price,
							"Volume": 0,
							"Adj_Close": price,
							"Split_Close": price,
							"projection": true
						};
						if(self.layout.interval=="minute") if(maxTicks--<0) break;
						tmpHist[tmpHist.length]=prices;
					}
				}
			}
		}
		for(chartName in this.charts){
			if(whichChart && whichChart.name!=chartName) continue;
			chart=this.charts[chartName];
			var priorLastBarDate=null;
			if(chart.dataSet && chart.dataSet.length) priorLastBarDate=chart.dataSet[chart.dataSet.length-1].DT;
			chart.dataSet=[];
			chart.tickCache={}; // clear the tick cache. Later if we implement appendDataSet() we'll need to also clear
			var masterData=chart.masterData;
			if(!masterData) masterData=this.masterData;
			if(!masterData || !masterData.length ) {
				// it's ok to display an empty chart if that is what it is asked. Remember to call the append!!
				this.runAppend("createDataSet", arguments$);
				return;
			}
			var tmpHist=[].concat(masterData);

			if(!I()) return;	// iframe domain lock check

			// the token-lock mechanism is injected here by the license server if a token is sent
			/****INJECTED TOKEN-LOCK CODE *****/
			// end of token-lock
			
			if(this.transformDataSetPre) this.transformDataSetPre(this, tmpHist);

			var maxTicks=Math.round(chart.maxTicks*0.75);

			var i;
			if(!this.chart.hideDrawings){
				for(i=0;i<this.drawingObjects.length;i++){
					if(this.drawingObjects[i].name=="projection") printProjection(this, this.drawingObjects[i]);
				}
				if(this.activeDrawing && this.activeDrawing.name=="projection"){
					printProjection(this, this.activeDrawing);
				}
			}
			i=0;
			var max=0, min=1000000000;
			var position=0;
			var alignToHour = chart.market.isHourAligned();
			var res={};

			var advancing=0;
			var reallyDontRoll=(dontRoll || this.dontRoll);
			// for the sake of efficiency we bypass the consolidatedQuote method when possible.
			// This means we only go into that method if the periodicity is greater than one (we require rolling)
			// or there is potentially a split (we require adjustment). There is only ever a potential split
			// if we find either the Adj_Close field in our data set
			//
			var layout=this.layout;
			while(1){
				if(position>=tmpHist.length) break;

				// First clone the masterData entry. (Inline for efficiency!)
				var q={};
				for(var field in tmpHist[position]){
					q[field] = tmpHist[position][field];
				}
				tmpHist[position]=q;
				// Next determine whether there was a split adjustment
				q.ratio=1;
				if(layout.adj && q.Adj_Close){
					q.ratio=q.Adj_Close/q.Close;
				}

				// If so then adjust the prices
				if(q.ratio!=1){
					if("Open" in q) q.Open = q.Open*q.ratio;
					if("Close" in q && q.Close!==null) q.Close = q.Close*q.ratio;
					if("High" in q) q.High = q.High*q.ratio;
					if("Low" in q) q.Low = q.Low*q.ratio;
				}

				if(!reallyDontRoll && (layout.periodicity>1 || layout.interval=="week" || layout.interval=="month")){
					res=this.consolidatedQuote(tmpHist, position, layout.periodicity, layout.interval, layout.timeUnit, dontRoll, alignToHour);
					if(!res){
						CIQ.alert("error:consolidatedQuote returned negative position");
						break;
					}
					position=res.position;
					chart.dataSet[i]=res.quote;
				}else{
					chart.dataSet[i]=tmpHist[position];
					position++;
				}
				q=chart.dataSet[i];
				if(i>0) q.iqPrevClose=chart.dataSet[i-1].Close;
				else q.iqPrevClose=q.Close;
				//res.quote.cache={};
				if("High" in q && q.High>max) max=q.High;
				if("Low" in q && q.Low<min) min=q.Low;
				i++;
				
				if(priorLastBarDate && q.DT>priorLastBarDate) advancing++;
			}
			var pastEdge=chart.scroll>=chart.maxTicks+1;
			if(pastEdge){
				chart.spanLock=false; // once the chart is at or past the edge we are by definition no longer span locked
			}
			var dontAdvanceScroll=pastEdge || chart.lockScroll || chart.spanLock;
			if(dontAdvanceScroll && advancing){
				if(chart.spanLock && chart.scroll+1>=chart.maxTicks+1){
					// unlock chart if it's about to advance off the edge
					chart.spanLock=false;
				}else{
					chart.scroll+=advancing;
					this.grabStartScrollX+=advancing; // Offset the scroll position if we're panning the screen to prevent jitter
				}
			}

			var aggregationType=layout.aggregationType;
			if(aggregationType && aggregationType!="ohlc" && !CIQ.ChartEngine.prototype.drawKagiSquareWave){
				console.log("advanced/aggregation.js not loaded!");
			}else{
				if(aggregationType=="rangebars"){
					chart.dataSet=CIQ.calculateRangeBars(this, chart.dataSet, layout.range);
				}else if(aggregationType=="heikenashi" || layout.aggregationType=="heikinashi"){
					chart.dataSet=CIQ.calculateHeikinAshi(this, chart.dataSet);
				}else if(aggregationType=="kagi"){
					chart.dataSet=CIQ.calculateKagi(this, chart.dataSet, layout.kagi);
				}else if(aggregationType=="linebreak"){
					chart.dataSet=CIQ.calculateLineBreak(this, chart.dataSet, layout.priceLines);
				}else if(aggregationType=="renko"){
					chart.dataSet=CIQ.calculateRenkoBars(this, chart.dataSet, layout.renko);
				}else if(aggregationType=="pandf"){
					chart.dataSet=CIQ.calculatePointFigure(this, chart.dataSet, layout.pandf);
				}
			}
			if(this.transformDataSetPost) this.transformDataSetPost(this, chart.dataSet, min, max);
			if(this.maxDataSetSize) chart.dataSet=chart.dataSet.slice(-this.maxDataSetSize);

			this.calculateATR(chart,20);
			this.calculateMedianPrice(chart);
			this.calculateTypicalPrice(chart);
			this.calculateWeightedClose(chart);
			this.calculateOHLC4(chart);

			if(this.dataSetContainsGaps){
				chart.scrubbed=[];
				for(i=0;i<chart.dataSet.length;i++){
					var quote=chart.dataSet[i];
					if(quote.Close || quote.Close===0) chart.scrubbed.push(quote);
				}
			}else{
				chart.scrubbed=chart.dataSet;
			}
		}
		this.adjustDrawings();

		var studies=this.layout.studies;
		for(var n in studies){
			var sd=studies[n];
			if(typeof sd=="function") continue; //IE8 weirdness
			if(whichChart){
				var panel=this.panels[sd.panel];
				if(panel.chart.name!=whichChart.name) continue;	// skip studies that aren't associated with the chart we're working on
			}
			if(CIQ.Studies){
				var study=CIQ.Studies.studyLibrary[sd.type];
				if(!study) {
					study={};
					if(sd.panel=="chart") study.overlay=true;
				}
				sd.libraryEntry=study;
				if(study.calculateFN) study.calculateFN(this, sd);
			}
		}
		var p;
		for(p in this.plugins){
			var plugin=this.plugins[p];
			if(plugin.createDataSet) plugin.createDataSet(this, whichChart);
		}

		for(chartName in this.charts){
			if(whichChart && whichChart.name!=chartName) continue;
			chart=this.charts[chartName];
			for(p=0;p<chart.dataSet.length;p++){
				chart.dataSet[p].cache={};
			}
		}
		if(this.establishMarkerTicks) this.establishMarkerTicks();
		this.runAppend("createDataSet", arguments$);
	};
	
	return _exports;
});