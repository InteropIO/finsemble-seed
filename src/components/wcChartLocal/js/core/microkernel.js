//-------------------------------------------------------------------------------------------
// Copyright 2012-2018 by ChartIQ, Inc.
// All rights reserved
//-------------------------------------------------------------------------------------------
// @jscrambler DEFINE
(function(_exports){
	var CIQ=_exports.CIQ;
	var splinePlotter=_exports.SplinePlotter;

	// remove:locking
	var PROPERTY = 'valid';
	CIQ.valid = 0;
	// endremove

	/**
	 * <span class="injection">INJECTABLE</span>
	 * <span class="animation">Animation Loop</span>
	 * Draws the x-axis. This assumes that the axisRepresentation has previously been calculated by {@link CIQ.ChartEngine.AdvancedInjectable#createXAxis}
	 *
	 * Use css styles `stx_xaxis` to control colors and fonts for the dates. <br>
	 * Use css styles `stx_xaxis_dark` to control **color only** for the divider dates. <br>
	 * Use css styles `stx_grid_border`, `stx_grid` and `stx_grid_dark` to control the grid line colors. <br>
	 * The dark styles are used for dividers; when the grid changes to a major point such as the start of a new day on an intraday chart, or a new month on a daily chart.
	 *
	 * See {@tutorial Custom X-axis} and {@tutorial CSS Overview} for additional details.
	 *
	 * @param  {CIQ.ChartEngine.Chart} chart			   Chart object
	 * @param  {CIQ.ChartEngine.XAxisLabel[]} axisRepresentation Axis representation object created by createXAxis. This should be an array of axis labels.
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias drawXAxis
	 * @since 5.2.0 axis labels are always top aligned instead of vertically centered regardless of xaxisHeight value.
	 */
	CIQ.ChartEngine.prototype.drawXAxis=function(chart, axisRepresentation){
		var arguments$=[chart, axisRepresentation];
		if(this.runPrepend("drawXAxis", arguments$)) return;
		if(!axisRepresentation) return;
		if(chart.xAxis.noDraw) return;
		var context=this.chart.context;
		this.canvasFont("stx_xaxis");
		var xh=this.getCanvasFontSize("stx_xaxis");
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

		var bottom = this.xAxisAsFooter === true ? this.chart.canvasHeight : chart.panel.bottom;
		var wPanel = this.whichPanel(bottom - 1); // subtract 1 because whichPanel is designed for displaying the crosshair
		if (!wPanel) return; // happens if window height increases during resize
		this.adjustYAxisHeightOffset(wPanel, wPanel.yAxis);
		var drawBorders=chart.xAxis.displayBorder || chart.xAxis.displayBorder===null;
		if(this.axisBorders===true) drawBorders=true;
		if(this.axisBorders===false) drawBorders=false;
		var middle=bottom-this.xaxisHeight+xh;
		if(drawBorders) middle+=3;
		var isTopPanel=true;

		for(var p in this.panels){
			var panel=this.panels[p];
			if(panel.hidden || panel.shareChartXAxis===false) continue;
			var isAxisPanel=(panel==wPanel);
			var yAxis=panel.yAxis;
			if(!yAxis) continue;
			var prevRight=-Number.MAX_VALUE;
			var nextBoundaryLeft=Number.MAX_VALUE;
			for(var nb=0;nb<axisRepresentation.length;nb++){
				if(axisRepresentation[nb].grid=="boundary"){
					nextBoundaryLeft=axisRepresentation[nb].left;
					break;
				}
			}
			context.save();
			context.beginPath();
			context.rect(panel.left, panel.top+(isTopPanel?0:1), panel.width, panel.height-1);
			context.clip();
			isTopPanel=false;

			var plotter=new CIQ.Plotter();
			plotter.newSeries("line","stroke", this.canvasStyle("stx_grid"));
			plotter.newSeries("boundary","stroke", this.canvasStyle("stx_grid_dark"));
			plotter.newSeries("border","stroke", this.canvasStyle("stx_grid_border"));

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
						nextBoundaryLeft=Number.MAX_VALUE;
					}
				}else{
					// Don't draw label if it will overlap with the next boundary label
					if(obj.right>nextBoundaryLeft) continue;
				}
				// Don't draw a label if it overlaps with prior label
				if(obj.left<prevRight) continue;

				// Don't draw any label if it's off screen and it will overlap with the next label of its kind
				if(obj.left<0){
					if(nextBoundaryLeft<obj.right) continue;
					if(nb>=axisRepresentation.length){
						if(axisRepresentation[i+1] && axisRepresentation[i+1].left<obj.right) continue;
					}
				}

				prevRight=obj.right;
				if((Math.floor(obj.left)<=panel.right)){
					if(Math.floor(obj.hz)>panel.left){
						if(chart.xAxis.displayGridLines){
							plotter.moveTo(obj.grid, obj.hz, yAxis.top);
							plotter.lineTo(obj.grid, obj.hz, yAxis.bottom);
						}
						if(isAxisPanel && drawBorders){
							// draw 5.5 pixel high vertical "tick" on the axis under the border
							plotter.moveTo("border", obj.hz, yAxis.bottom+0.5);
							plotter.lineTo("border", obj.hz, yAxis.bottom+6);
						}
					}
					if(isAxisPanel && obj.right>panel.left){
						this.canvasColor(obj.grid=="boundary"?"stx_xaxis_dark":"stx_xaxis");
						context.fillText(obj.text, obj.hz, middle);
					}
				}
			}

			if(drawBorders){
				var bb=Math.round(yAxis.bottom+yAxis.bottomOffset)+0.5;
				var wb=Math.round(panel.right)+0.5;
				plotter.moveTo("border", panel.left, bb);
				plotter.lineTo("border", wb, bb);
			}

			plotter.draw(context);
			context.restore();
		}
		context.textAlign="left";
		this.runAppend("drawXAxis", arguments$);
	};

	/**
	 * Draws date based x-axis.
	 *
	 * This method is algorithmically designed to create an x-axis that is responsive to various degrees of user panning, zooming, and periodicity selection.
	 * It will print different versions of dates or times depending on those factors, attempting to prevent overlaps and evenly spacing labels.
	 * If a locale is set, then internationalized dates will be used.
	 *
	 * The algorithm is also market hours aware. See {@link CIQ.Market} for details on how to set market hours for the different exchanges.
	 *
	 * {@link CIQ.ChartEngine.XAxis#timeUnit} and {@link CIQ.ChartEngine.XAxis#timeUnitMultiplier} can be hard set to override the algorithm (See {@tutorial Custom X-axis} for additional details).
	 *
	 * This method sets the CIQ.ChartEngine.chart.xaxis array which is a representation of the complete x-axis including future dates.
	 * Each array entry contains an object:<br>
	 * DT – The date/time displayed on the x-axis<br>
	 * date – yyyymmddhhmm string representation of the date<br>
	 * data – If the xaxis coordinate is in the past, then a reference to the chart data element for that date<br>
	 *
	 * @param  {object} [chart] The chart to print the xaxis
	 * @return {CIQ.ChartEngine.XAxisLabel[]}			axisRepresentation that can be passed in to {@link CIQ.ChartEngine#drawXAxis}
	 * @memberof CIQ.ChartEngine
	 * @since 3.0.0 Using x axis formatter now is available for year and month boundaries.
	 */
	CIQ.ChartEngine.prototype.createTickXAxisWithDates=function(chart){
		if(!chart) chart=this.chart;
		chart.xaxis=[];
		//console.log("");
		// These are all the possible time intervals. Not so easy to come up with a formula since time based switches
		// from 10 to 60 to 24 to 365
		var timeIntervalMap, context=chart.context;
		var timePossibilities=[CIQ.MILLISECOND,CIQ.SECOND,CIQ.MINUTE,CIQ.HOUR,CIQ.DAY,CIQ.MONTH,CIQ.YEAR];
		if(!this.timeIntervalMap){
			timeIntervalMap={};
			timeIntervalMap[CIQ.MILLISECOND]={
				arr: [1,2,5,10,20,50,100,250,500],
				minTimeUnit:0,
				maxTimeUnit:1000,
				approxWidth:context.measureText("10:00:00.000").width*2
			};
			timeIntervalMap[CIQ.SECOND]={
				arr: [1,2,3,4,5,6,10,12,15,20,30],
				minTimeUnit: 0,
				maxTimeUnit: 60,
				approxWidth:context.measureText("10:00:00").width*2
			};
			timeIntervalMap[CIQ.MINUTE]={
				arr: [1,2,3,4,5,6,10,12,15,20,30],
				minTimeUnit: 0,
				maxTimeUnit: 60,
				approxWidth:context.measureText("10:00").width*2
			};
			timeIntervalMap[CIQ.HOUR]={
				arr: [1,2,3,4,6,12],
				minTimeUnit: 0,
				maxTimeUnit: 24,
				approxWidth:context.measureText("10:00").width*2
			};
			timeIntervalMap[CIQ.DAY]={
				arr: [1,2,7,14],
				minTimeUnit: 1,
				maxTimeUnit: 32,
				approxWidth:context.measureText("30").width*2
			};
			timeIntervalMap[CIQ.MONTH]={
				arr: [1,2,3,6],
				minTimeUnit:1,
				maxTimeUnit:13,
				approxWidth:context.measureText("Mar").width*2
			};
			timeIntervalMap[CIQ.YEAR]={
				arr: [1,2,3,5],
				minTimeUnit:1,
				maxTimeUnit:20000000,
				approxWidth:context.measureText("2000").width*2
			};
			timeIntervalMap[CIQ.DECADE]={
				arr: [10],
				minTimeUnit: 0,
				maxTimeUnit: 2000000,
				approxWidth:context.measureText("2000").width*2
			};
			this.timeIntervalMap=timeIntervalMap;
		}
		timeIntervalMap=this.timeIntervalMap;
		var daysInMonth=[31,28,31,30,31,30,31,31,30,31,30,31];

		var periodicity=this.layout.periodicity, interval=this.layout.interval, maxTicks=chart.maxTicks;

		/* This section computes at which time interval we set the labels.*/
		var dataSegment=chart.dataSegment, xAxis=chart.xAxis, dataSegmentLength=dataSegment.length;
		var idealTickSizePixels=xAxis.idealTickSizePixels || xAxis.autoComputedTickSizePixels;

		var idealNumberGridLines=this.chart.width/idealTickSizePixels;
		for(var x=0;x<dataSegmentLength;x++) if(dataSegment[x]) break; // find first valid bar in dataSegment
		if(x==dataSegmentLength) return [];

		// timeRange is the aggregate amount of time in milliseconds across the dataSegment
		var timeRange = 0;
		var tu=this.layout.timeUnit || "minute";
		if(isNaN(interval)){
			tu=interval;
			interval=1;
		}
		var ms=0;
		switch(tu){
		case "millisecond":
			ms=1;break;
		case "second":
			ms=1000;timePossibilities.splice(0,1);break;
		case "minute":
			ms=60000;timePossibilities.splice(0,2);break;
		case "day":
			ms=86400000;timePossibilities.splice(0,4);break;
		case "week":
			ms=86400000*7;timePossibilities.splice(0,4);break;
		case "month":
			ms=86400000*30;timePossibilities.splice(0,5);break;
		}
		var aggregationType=this.layout.aggregationType;
		if (ms && (!aggregationType || aggregationType=="ohlc" || aggregationType=="heikinashi")) {
			timeRange = interval * periodicity * ms * dataSegmentLength; // computes actual amount of time taken up by dataSegment, taking into consideration market open/close gaps
		} else {
			timeRange=dataSegment[dataSegmentLength-1].DT.getTime()-dataSegment[x].DT.getTime(); // simple calc used for daily charts
		}
		var self=this;
		function millisecondsPerTick(){
			// get previous open
			var iter_parms = {
				'begin': new Date(),
				'interval': "day",
				'periodicity': 1
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
			timeRange = millisecondsPerTick() * maxTicks; // If zero or one ticks displayed
		}else{
			timeRange=(timeRange/dataSegmentLength)*maxTicks; // adjust timeRange in case dataSegment doesn't span entire chart (blank bars left or right of chart)
		}
		var msPerGridLine=timeRange/idealNumberGridLines;

		var i;
		// Find 1) the timePossibility which gives us the base time unit to iterate (for instance, SECONDS)
		// 2) Which timeIntervalMap. For instance the SECOND map allows 1,2,3,4,5,6,10,12,15,20,30 second increments
		for(i=0;i<timePossibilities.length;i++){
			if(timePossibilities[i]>msPerGridLine+0.001) break;  // add the micro amount to allow .999... to be 1
		}
		if(msPerGridLine<1){
			console.log("createTickXAxisWithDates: Assertion error. msPerGridLine < 1. Make sure your masterData has correct time stamps for the active periodicity and it is sorted from OLDEST to NEWEST.");
		}
		if(i==timePossibilities.length){ // In either of these cases, msPerGridLine will float through as simply timeRange/idealNumberGridLines
			i--;
		}else if(i>0){
			var prevUnit=timePossibilities[i-1];
			var prevArr=timeIntervalMap[prevUnit].arr;
			var prevMultiplier=prevArr[prevArr.length-1];
			// Find the *closest* time possibility
			if(msPerGridLine-(prevUnit*prevMultiplier)<timePossibilities[i]-msPerGridLine)
				i--;
		}

		var timeUnit=xAxis.timeUnit || timePossibilities[i];
		xAxis.activeTimeUnit=timeUnit; // for reference when drawing the floating label. So we know the precision we need to display.

		var timeInterval=CIQ.clone(timeIntervalMap[timeUnit]), arr=timeInterval.arr;

		// Now, find the right time unit multiplier
		for(i=0;i<arr.length;i++){
			if(arr[i]*timeUnit>msPerGridLine) break;
		}
		if(i==arr.length){
			i--;
		}else{
			// Find the *closest* interval
			if(msPerGridLine-arr[i-1]*timeUnit<arr[i]*timeUnit-msPerGridLine)
				i--;
		}

		if(timeInterval.approxWidth<this.layout.candleWidth) i=0;  // display everything
		var timeUnitMultiplier=xAxis.timeUnitMultiplier || arr[i];

		//end TODO

		var axisRepresentation=[];
		var candleWidth=this.layout.candleWidth;

		// Find first location on x-axis that contains a bar, remember that there may be nulls in dataSegment if the user has scrolled past the end of the chart
		for(i=0;i<=maxTicks;i++){
			if(dataSegment[i]) break;
		}
		// TODO, The problem with doing this here is that for non-timebased charts, we don't yet know how much time we're displaying, so we don't know
		// relatively how far into the past we should go. It would be better to do this after we've calculated the amount of time occupied by the data
		// and then, figure out an appropriate spacing for which to count back in time (this current code merely uses the current interval)
		if(i>0 && i<maxTicks){
		    var iter1=this.standardMarketIterator(dataSegment[i].DT, xAxis.adjustTimeZone?this.displayZone:null);
		    for(var j=i;j>0;j--){
		        // we insert an empty element just to preserve spacing
		        // otherwise big processing due to market class iterations
		        // as a result no dates will be shown on x axis floater for the empty section leading to chart data.
		        var axisObj={};
		        if(!(chart.lineApproximation && candleWidth<1)){
		            var dt=iter1.previous();
		            axisObj.DT=dt;
		            //axisObj.Date=CIQ.yyyymmddhhmmssmmm(dt); // Can't think of reason we need this inefficiency
		        }
		        chart.xaxis.unshift(axisObj);
		    }
		}

		var dtShifted=0;
		var nextTimeUnit=timeInterval.minTimeUnit;
		var previousTimeUnitLarge=-1;	// this will be used to keep track of when the next time unit up loops over
		var firstTick=true;

		function getCurrentTimeUnits(dtShifted){
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
			return [currentTimeUnit,currentTimeUnitLarge];
		}

		var currents=getCurrentTimeUnits(dataSegment[i].DT), last, periodsBack=0, periodsForward=0, tick=dataSegment[i].tick;
		for(periodsBack; periodsBack<tick; periodsBack++){
			last=getCurrentTimeUnits(this.chart.dataSet[tick-periodsBack].DT);
			if(last[1]!=currents[1]) break;
			currents=last;
		}
		for(periodsForward; periodsForward<this.chart.dataSet.length-tick; periodsForward++){
			last=getCurrentTimeUnits(this.chart.dataSet[tick+periodsForward].DT);
			if(last[1]!=currents[1]) break;
			currents=last;
		}

		var iter=null;
		for(i=0;i<maxTicks+periodsForward;i++){
			var mySegment=dataSegment[i];
			if(!mySegment) mySegment=chart.xaxis[i];
			else if(periodsBack) mySegment=chart.dataSet[mySegment.tick-periodsBack];

			if(i<dataSegmentLength){
				var prices=mySegment;
				if(prices.displayDate && xAxis.adjustTimeZone/* && timeUnit<CIQ.DAY*/){
					dtShifted=prices.displayDate;
				}else{
					dtShifted=prices.DT;
				}
				if(i && !periodsBack && chart.segmentImage){
					var image=chart.segmentImage[i];
					candleWidth=(image.leftOffset-image.candleWidth/2)/i;
				}
			}else{
				//TODO, if we were powerful programmers we would guestimate a reasonable interval
				//based on the amount of time displayed under existing bars
				if(this.layout.interval=="tick" && !xAxis.futureTicksInterval) break;
				if(chart.lineApproximation && candleWidth<1) break;  //otherwise big processing
				if(!xAxis.futureTicks) break;
				if(!iter){
					iter=this.standardMarketIterator(dataSegment[dataSegmentLength-1].DT,xAxis.adjustTimeZone?this.displayZone:null);
				}
				dtShifted = iter.next();
			}
			if(!dtShifted) continue;

			var text=null, hz, candles=i-periodsBack;

			var obj={
				DT: dtShifted,
				//Date: CIQ.yyyymmddhhmmssmmm(dtShifted) // Can't think of reason we need this inefficiency
			};
			if(i<dataSegmentLength) obj.data=mySegment;	// xaxis should have reference to data to generate a head's up
			else obj.data=null;
			if(periodsBack){
				periodsBack--; i--;
			}else if(!chart.xaxis[i] && i<maxTicks){
				chart.xaxis.push(obj);
			}

			currents=getCurrentTimeUnits(dtShifted);
			var currentTimeUnit=currents[0], currentTimeUnitLarge=currents[1];

			if(previousTimeUnitLarge!=currentTimeUnitLarge){
				if(currentTimeUnit<=nextTimeUnit){ // case where we skipped ahead to the next large time unit
					nextTimeUnit=timeInterval.minTimeUnit;
				}
				// print a boundary
				hz=chart.left+(candles*candleWidth)-1;
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
						if(xAxis.formatter){
							text=xAxis.formatter(dtShifted, "boundary", CIQ.YEAR, 1);
						}else{
							text=dtShifted.getFullYear();
						}
					}else{
						if(xAxis.formatter){
							text=xAxis.formatter(dtShifted, "boundary", CIQ.MONTH, 1);
						}else{
							text=CIQ.monthAsDisplay(dtShifted.getMonth(),false,this);
						}
					}
				}else if(timeUnit==CIQ.MONTH){
					if(xAxis.formatter){
						text=xAxis.formatter(dtShifted, "boundary", CIQ.YEAR, 1);
					}else{
						text=dtShifted.getFullYear();
					}
				}
				if(text && previousTimeUnitLarge!=-1){
					axisRepresentation.push(new CIQ.ChartEngine.XAxisLabel(hz,"boundary",text));
				}
			}

			if(currentTimeUnit>=nextTimeUnit){ //passed the next expected axis label so let's print the label
				if(nextTimeUnit==timeInterval.minTimeUnit){
					if(currentTimeUnitLarge==previousTimeUnitLarge) continue; // we haven't looped back to zero yet
				}

				var labelDate=new Date(+dtShifted);
				hz=chart.left+((2*candles+1)*candleWidth)/2-1;
				var boundaryTimeUnit=Math.floor(currentTimeUnit/timeUnitMultiplier)*timeUnitMultiplier;
				if(boundaryTimeUnit<currentTimeUnit){
					if(this.layout.interval=="week") boundaryTimeUnit=currentTimeUnit;
					else hz-=candleWidth/2; // if we don't land on a label then position the label to the left of the bar; could be more accurate
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

				// Don't print the first label unless it lands exactly on a boundary(left edge of the chart). Otherwise the default logic assumes
				// that the boundary was skipped.
				if(firstTick && boundaryTimeUnit<currentTimeUnit){
					firstTick=false;
					continue;
				}

				// format the label
				if(xAxis.formatter){
					text=xAxis.formatter(labelDate, "line", timeUnit, timeUnitMultiplier);
				}else{
					if(timeUnit==CIQ.DAY){
						text=labelDate.getDate();
					}else if(timeUnit==CIQ.MONTH){
						text=CIQ.monthAsDisplay(labelDate.getMonth(),false,this);
					}else if(timeUnit==CIQ.YEAR || timeUnit==CIQ.DECADE){
						text=labelDate.getFullYear();
					}else{
						text=CIQ.timeAsDisplay(labelDate, this, timeUnit);
					}
				}
				axisRepresentation.push(new CIQ.ChartEngine.XAxisLabel(hz,"line",text));
			}
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
	 * You may override this by setting stxx.chart.yAxis.decimalPlaces equal to a hard set number of decimal places.
	 * stxx.chart.panel.yAxis.minimumPriceTick can be set to specify that the y-axis vertical grid be drawn with specific ranges. eg <code>stxx.chart.panel.yAxis.minimumPriceTick=.25</code>
	 * For more configurable parameters, see the {@link CIQ.ChartEngine.YAxis}.
	 *
	 * @param  {CIQ.ChartEngine.Panel} panel			The panel to create the y-axis
	 * @param  {object} [parameters]			Parameters to drive the y-axis
	 * @param {boolean} [parameters.noDraw]		If true then make all the calculations but don't draw the y-axis. Typically used when a study is going to draw its own y-axis.
	 * @param {boolean} [parameters.semiLog]	Calculate the y-axis as a semi-log scale.
	 * @param {boolean} [parameters.ground]		Tie the bottom of the y-Axis to the bottom-most value of the plot.
	 * @param {CIQ.ChartEngine.YAxis} [parameters.yAxis] The yAxis to create. Defaults to panel.yAxis.
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
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
			var leftTick=chart.dataSet.length - chart.scroll - 1;
			var rightTick=leftTick + chart.maxTicks + 1;
			//panel.cacheLeft=Math.min(panel.cacheLeft, leftTick);
			//panel.cacheRight=Math.max(panel.cacheRight, rightTick);
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
		var shadow;
		if(!parameters.noChange){
			this.adjustYAxisHeightOffset(panel, yAxis);
			// Adjust for zoom and scroll
			var height=yAxis.height=yAxis.bottom-yAxis.top;
			var pricePerPix=(yAxis.high-yAxis.low)/(height-yAxis.zoom);
			if(!yAxis.semiLog){
				if(parameters.ground){
					yAxis.high=yAxis.high+yAxis.zoom*pricePerPix;
				}else{
					yAxis.high=yAxis.high+(yAxis.zoom/2 + yAxis.scroll)*pricePerPix;
					yAxis.low=yAxis.low-(yAxis.zoom/2 - yAxis.scroll)*pricePerPix;
				}
			}
			if(yAxis.min || yAxis.min===0) yAxis.low=yAxis.min;
			if(yAxis.max || yAxis.max===0) yAxis.high=yAxis.max;

			yAxis.shadow=yAxis.high-yAxis.low;
			if(yAxis.semiLog && (!this.activeDrawing || this.activeDrawing.name!="projection")){
				var computeLogValues=function(){
					yAxis.logHigh=Math.log(yAxis.high)/Math.LN10;
					var semilow=Math.max(yAxis.low,0.000000001);
					yAxis.logLow=Math.log(semilow)/Math.LN10;
					if(yAxis.low<=0) yAxis.logLow=0;
					yAxis.logShadow=yAxis.logHigh - yAxis.logLow;
				};
				// first compute existing values
				computeLogValues();
				// now scale them for zoom and scroll
				var scalingFactor=yAxis.height/(yAxis.height-yAxis.zoom);
				yAxis.high=this.transformedPriceFromPixel(yAxis.top - scalingFactor * (yAxis.zoom/2 + yAxis.scroll), panel, yAxis);	// Set the actual high for the panel rather than the values in the panel
				yAxis.low=this.transformedPriceFromPixel(yAxis.bottom + scalingFactor * (yAxis.zoom/2 - yAxis.scroll), panel, yAxis);	// Set the actual low for the panel rather than the values in the panel
				yAxis.shadow=yAxis.high-yAxis.low;
				computeLogValues();
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
			shadow=parameters.range?parameters.range[1]-parameters.range[0]:yAxis.shadow;
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

		}

		// cover really strange and rare cases, such as an intensely small shadow
		if (yAxis.priceTick <= 0 || yAxis.priceTick === Infinity) {
			yAxis.priceTick = 1;
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
	 * Use css styles `stx_xaxis` to control colors and fonts for the dates. <br>
	 * Use css styles `stx_xaxis_dark` to control **color only** for the divider dates. <br>
	 * Use css styles `stx_grid_border`, `stx_grid` and `stx_grid_dark` to control the grid line colors. <br>
	 * The dark styles are used for dividers; when the grid changes to a major point such as the start of a new day on an intraday chart, or a new month on a daily chart.
	 *
	 * See {@tutorial CSS Overview} for additional details.
	 *
	 * @param  {CIQ.ChartEngine.Panel} panel	   The panel to draw the y-axis
	 * @param  {object} parameters Parameters for the y-axis (only used internally. Send {} when calling this method directly).
	 * @param {array} [parameters.range] Optionally set the range of values to display on the y-axis. For instance [0,100] would only print from zero to one hundred, regardless of the actual height of the y-axis.
	 *									 This is useful if you want to add some buffer space to the panel but don't want the y-axis to actually reveal nonsensical values.
	 * @param {CIQ.ChartEngine.YAxis} [parameters.yAxis] The yAxis to use. Defaults to panel.yAxis.
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias drawYAxis
	 */
	CIQ.ChartEngine.prototype.drawYAxis=function(panel, parameters){
		if(!parameters) parameters={};
		var yAxis=parameters.yAxis?parameters.yAxis:panel.yAxis;
		if(panel.hidden || yAxis.noDraw || !yAxis.width) return;
		// override existing axis settings for fractional quotes
		if(yAxis.priceFormatter != CIQ.Comparison.priceFormat){
			if(yAxis.fractional){
				if(!yAxis.originalPriceFormatter) yAxis.originalPriceFormatter={
					func: yAxis.priceFormatter
				};
				if(!yAxis.fractional.resolution) yAxis.fractional.resolution=yAxis.minimumPrice;
				if(!yAxis.fractional.formatter) yAxis.fractional.formatter="'";
				if(!yAxis.priceFormatter) yAxis.priceFormatter=function(stx, panel, price){
					if( !yAxis.fractional ) return;
					var sign='';
					if( price < 0 ) {
						sign="-";
						price= Math.abs(price);
					}
					var whole=Math.floor(Math.round(price/yAxis.fractional.resolution)*yAxis.fractional.resolution);
					var frac=Math.round((price-whole)/yAxis.fractional.resolution);
					var _nds=Math.floor(frac);
					return sign+whole+yAxis.fractional.formatter+(_nds<10?"0":"")+_nds+(frac-_nds>=0.5?"+":"");
				};
			}else{
				if(yAxis.originalPriceFormatter){
					yAxis.priceFormatter=yAxis.originalPriceFormatter.func;
					yAxis.originalPriceFormatter=null;
				}
			}
		}

		if(yAxis.pretty) return this.drawYAxisPretty(panel, parameters);
		if(this.runPrepend("drawYAxis", arguments)) return;

		if(!parameters.noDraw && !yAxis.noDraw){
			var yAxisPlotter=yAxis.yAxisPlotter;
			if(!yAxisPlotter || !parameters.noChange){
				yAxisPlotter=yAxis.yAxisPlotter=new CIQ.Plotter();	// This plotted is saved as a member. We can re-use it to draw the exact same y-axis when noChange=true
				var chart=panel.chart;
				var isAChart=(panel.name==chart.name && yAxis.name===panel.yAxis.name);
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
				var dynamicWidth = chart.dynamicYAxis;
				var labelWidth = dynamicWidth ? yAxis.width : NaN;

				var position=this.getYAxisCurrentPosition(yAxis, panel);
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
					var y=this.pixelFromTransformedValue(price, panel, yAxis);

					var y2=Math.round(y)+0.5;
					if((y2 + fontHeight/2) > panel.bottom) continue; // Make sure we don't stray past the bottom of the panel
					if((y2 - fontHeight/2)<panel.top) continue;	// Make sure we don't stray past the top of the panel
					if(Math.abs(y2-yAxis.bottom)<1) continue; // don't draw gridline across bottom of panel
					if(yAxis.displayGridLines){
						yAxisPlotter.moveTo("grid", panel.left+1, y2);
						yAxisPlotter.lineTo("grid", panel.right-1, y2);
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
						if(yAxis.justifyRight!==false) textXPosition=yAxis.left + yAxis.width + tickWidth - 3;
					}else{
						if(yAxis.justifyRight) textXPosition=edgeOfAxis + yAxis.width;
					}
					yAxisPlotter.addText("text", price, textXPosition, y2, backgroundColor, null, fontHeight);
					if (dynamicWidth) {
						labelWidth = Math.max(labelWidth, chart.context.measureText(price).width);
					}
				}
				if(drawBorders){
					var b=Math.round(yAxis.bottom)+0.5;
					yAxisPlotter.moveTo("border", borderEdge, yAxis.top);
					yAxisPlotter.lineTo("border", borderEdge, b);
					yAxisPlotter.draw(this.chart.context, "border");
				}
				if (dynamicWidth && labelWidth > yAxis.width) {
					// the chart was initialized at an invalid width
					yAxis._dynamicWidth = labelWidth;
					this.calculateYAxisPositions(); // side effects
					throw new Error('reboot draw');
				} else if (!dynamicWidth && yAxis._dynamicWidth) {
					this.resetDynamicYAxis({chartName: chart.name});
					throw new Error('reboot draw');
				}
			}
			if(yAxis==panel.yAxis) this.plotYAxisGrid(panel);
		}
		this.runAppend("drawYAxis", arguments);
	};

	CIQ.ChartEngine.prototype.drawYAxisPretty=function(panel, parameters){
		if(this.runPrepend("drawYAxis", arguments)) return;
		if(!parameters) parameters={};

		var yAxis=parameters.yAxis?parameters.yAxis:panel.yAxis;
		if(panel.hidden || yAxis.noDraw || !yAxis.width) return;

		if(!parameters.noDraw){
			var yAxisPlotter=yAxis.yAxisPlotter;
			if(!yAxisPlotter || !parameters.noChange){
				yAxisPlotter=yAxis.yAxisPlotter=new CIQ.Plotter();	// This plotted is saved as a member. We can re-use it to draw the exact same y-axis when noChange=true
				var chart=panel.chart;
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

				var range=parameters.range;
				var high=range?range[1]:yAxis.high;
				var low=range?range[0]:yAxis.low;
				var drawBorders=(yAxis.displayBorder===null?chart.panel.yAxis.displayBorder:yAxis.displayBorder);
				// Master override
				if(this.axisBorders===false) drawBorders=false;
				if(this.axisBorders===true) drawBorders=true;
				var edgeOfAxis;
				var dynamicWidth = chart.dynamicYAxis;
				var labelWidth = dynamicWidth ? yAxis.width : NaN;

				var position=this.getYAxisCurrentPosition(yAxis, panel);

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
				var lowPixelSize = yAxis.bottom - this.pixelFromTransformedValue(lowLabel, panel, yAxis);
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

				var i=0,yOld=Number.MAX_VALUE;
				for(var zz=0;zz<100;zz++){
					var price=lowLabel+i*closest;
					if(price>high) break;
					closest += closestInc;
					i++;
					var y=this.pixelFromTransformedValue(price, panel, yAxis);
					if(yOld-y<fontHeight+1 && closestInc>0){  //overlapping labels, start over
						zz=i=0;
						yOld=Number.MAX_VALUE;
						closest=closestInc;
						closestInc*=2;
						yAxisPlotter.reset();
						continue;
					}
					yOld=y;
					var y2=Math.round(y)+0.5;
					if((y2 + fontHeight/2) > panel.bottom) continue; // Make sure we don't stray past the bottom of the panel
					if((y2-fontHeight/2)<panel.top) continue;	// Make sure we don't stray past the top of the panel
					if(Math.abs(y2-yAxis.bottom)<1) continue; // don't draw gridline across bottom of panel
					if(yAxis.displayGridLines){
						yAxisPlotter.moveTo("grid", panel.left+1, y2);
						yAxisPlotter.lineTo("grid", panel.right-1, y2);
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
						if(yAxis.justifyRight!==false) textXPosition=yAxis.left + yAxis.width + tickWidth - 3;
					}else{
						if(yAxis.justifyRight) textXPosition=edgeOfAxis + yAxis.width;
					}
					yAxisPlotter.addText("text", price, textXPosition, y2, backgroundColor, null, fontHeight);
					if (dynamicWidth) {
						labelWidth = Math.max(labelWidth, chart.context.measureText(price).width);
					}
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
				if (dynamicWidth && labelWidth > yAxis.width) {
					// the chart was initialized at an invalid width
					yAxis._dynamicWidth = labelWidth;
					this.calculateYAxisPositions(); // side effects
					throw new Error('reboot draw');
				} else if (!dynamicWidth && yAxis._dynamicWidth) {
					this.resetDynamicYAxis({chartName: chart.name});
					throw new Error('reboot draw');
				}
			}
			if(yAxis==panel.yAxis) this.plotYAxisGrid(panel);
		}
		this.runAppend("drawYAxis", arguments);
	};

	/**
	 * <span class="animation">Animation Loop</span>
	 * Draws a generic histogram for the chart.
	 *
	 * <br>This method should rarely if ever be called directly.  Use {@link CIQ.Renderer.Histogram} or {@link CIQ.ChartEngine#setChartType} instead.
	 *
	 * Note that if negative values are present, the function will not draw bars pointing downwards;
	 * instead the baseline of the histogram will be adjusted to the minimum value detected, and all bars will rise upward from there.
	 *
	 * Visual Reference -stacked:<br>
	 * ![stacked](img-stacked.png "stacked")
	 *
	 * Visual Reference -clustered:<br>
	 * ![clustered](img-clustered.png "clustered")
	 *
	 * Visual Reference -overlaid:<br>
	 * ![overlaid](img-overlaid.png "overlaid")
	 *
	 * @param  {object} params Parameters to control the histogram itself
	 * @param  {string} [params.name="Data"] Name of the histogram.
	 * @param  {CIQ.ChartEngine.Panel} [params.panel]		Panel on which to draw the bars
	 * @param  {CIQ.ChartEngine.YAxis} [params.yAxis=panel.yAxis] Set to specify an alternate y-axis
	 * @param  {string} [params.type="overlaid"] Type of histogram (stacked, clustered, overlaid).
	 * @param  {boolean} [params.bindToYAxis=false] For a study, set to true to bind the histogram to the y-axis and to draw it.
	 * @param  {number} [params.heightPercentage=0.7] The amount of vertical space to use for the histogram, valid values are 0.00-1.00.	Ignored when bindToYAxis==true.
	 * @param  {number} [params.widthFactor=0.8] Width of each bar as a percentage of the candleWidth, valid values are 0.00-1.00.
	 * @param  {boolean} [params.borders=true] Histogram bar border overide. Set to 'false' to stop drawing borders, even if seriesParams.border_color_X are set.
	 * @param  {object[]} seriesParams Parameters to control color and opacity of each part (stack) of the histogram. Each stack is represented by an array element containing an object with the following members:
	 * @param  {string} seriesParams.field Name of the field in the dataSet to use for the part in the stack
	 * @param  {string} seriesParams.fill_color_up Color to use to fill the part when the Close is higher than the previous (#RRGGBB format or null to not draw)
	 * @param  {string} seriesParams.border_color_up Color to use to draw the border when the Close is higher than the previous (#RRGGBB format or null to not draw)
	 * @param  {number} seriesParams.opacity_up Opacity to use to fill the part when the Close is higher than the previous (0.0-1.0)
	 * @param  {string} seriesParams.fill_color_down Color to use to fill the part when the Close is lower than the previous (#RRGGBB format or null to not draw)
	 * @param  {string} seriesParams.border_color_down Color to use to draw the border when the Close is lower than the previous (#RRGGBB format or null to not draw)
	 * @param  {number} seriesParams.opacity_down Opacity to use to fill the part when the Close is lower than the previous (0.0-1.0)
	 * @param  {function} seriesParams.color_function configure colors for each bar (will be used instead of fill_color and border_color. Opacity will be 1).
	 *
	 * **Parameters:**
	 * <table>
	 * <tr><th>Name</th><th>Type</th><th>Description</th></tr>
	 * <tr><td>quote</td><td>Object</td><td>a {@link CIQ.ChartEngine.Chart#dataSegment} element used to decide the color of that particular bar</td></tr>
	 * </table>
	 *
	 * **Returns:**
	 * - Object with the following elements:
	 * <table>
	 * <tr><th>Name</th><th>Type</th><th>Description</th></tr>
	 * <tr><td>fill_color</td><td>String</td><td>used for fill actions, hex format (#RRGGBB)</td></tr>
	 * <tr><td>border_color</td><td>String</td><td>used for line actions, hex format (#RRGGBB)</td></tr>
	 * </table>
	 *
	 * **Example:**
	 *
	 * ```
	 * seriesParams[0].color_function= function(quote){
	 * 	if(quote.Low > 100 ) {
	 * 		return {
	 * 					fill_color: '#FFFFFF',
	 * 					border_color: '#00ff87'
	 * 				}
	 * 	} else {
	 * 		return {
	 * 					fill_color: '#000000',
	 * 					border_color: '#0000FF'
	 * 				}
	 * 	}
	 * };
	 * ```
	 *
	 * @memberof CIQ.ChartEngine
	 * @example
	 * var params = {
	 * 	name: 'Volume',
	 * 	type: 'overlaid',
	 * 	heightPercentage: 0.2,
	 * 	widthFactor: 0.85
	 * };
	 * var seriesParams = [{
	 * 	field: 'Volume',
	 * 	color_function: function(bar) {
	 * 		var value = bar[this.field];
	 * 		var colorTuple = {
	 * 			fill_color: value > 500 ? '#05FF1F' : '#05054A',
	 * 			border_color: '#ABABAB'
	 * 		};
	 * 		return colorTuple;
	 * 	}
	 * }];
	 * // this will draw a **singe frame** of the histogram.
	 * stxx.drawHistogram(params, seriesParams);
	 * @since
	 * <br>&bull; 07/01/2015
	 * <br>&bull; 3.0.0 seriesParams.color_function added to determine the colors of a series bar
	 * <br>&bull; 3.0.0 added params.borders optional component to easily turn borders off
	 */
	CIQ.ChartEngine.prototype.drawHistogram=function(params,seriesParams){
		if(!seriesParams || !seriesParams.length) return;
		var panelName=params.panel;
		if(!panelName) panelName="chart";
		var c=this.panels[panelName];
		if(!c) return;
		var yAxis=params.yAxis?params.yAxis:c.yAxis;
		var type = params.type;
		var quotes=this.chart.dataSegment;
		var bordersOn=false;
		this.getDefaultColor();
		var subField;
		var sp;
		for(sp=0;sp<seriesParams.length;sp++){
			bordersOn|=(seriesParams[sp].border_color_up && !CIQ.isTransparent(seriesParams[sp].border_color_up));
			bordersOn|=(seriesParams[sp].border_color_down && !CIQ.isTransparent(seriesParams[sp].border_color_down));
		}
		if(params.borders===false) bordersOn=false;
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
				var price=prices[seriesParams[sp].field];
				if(price || price===0){
					subField=seriesParams[sp].subField || this.chart.defaultPlotField || "Close";
					if(typeof(price)=="object" && price[subField]) price=price[subField];
					if(type=="stacked") total+=price;
					else total=price;
					if(total>histMax) histMax=total;
					if(total<histMin) histMin=total;
				}
			}
		}
		if(histMax===0 && histMin===0){
			this.watermark(panelName,"center","bottom", this.translateIf(params.name+" Not Available"));
			return;
		}
		var t=Math.floor(yAxis.top)+0.5;
		var b;
		if(!params.bindToYAxis){
			b=Math.floor(yAxis.bottom)+0.5; // make it align with the smallest value on the axis instead fo the bottom
			multiplier=(b-t)*params.heightPercentage/(histMax-histMin);
		} else {
			b= Math.floor(this.pixelFromPrice(histMin, c, yAxis))+0.5;
		}

		this.startClip(panelName);
		var offset = this.layout.candleWidth <= 1 || !bordersOn ? 0 : 0.5;
		var context=this.chart.context;
		var shaveOff=Math.max(0,(1-params.widthFactor)*this.layout.candleWidth/2);	//how much to take off either side of the bar
		var tops=new Array(quotes.length);
		var bottoms=[];
		var self=this;
		var candleWidth=1;

		function drawBars(field, subField, color, opacity, isBorder, isUp, shift, candleWidth, positions){
			// passing a value of 0 is falsy, and will cause opacity to be 1
			if(!opacity) opacity=1;

			context.globalAlpha = CIQ.isIE8 ? 0.5 : opacity;
			context.beginPath();

			var prevTop=b+0.5;
			var farLeft=Math.floor(self.pixelFromBar(0, c.chart)-self.layout.candleWidth/2);
			var prevRight=farLeft;
			for(var i=0;i<quotes.length;i++){
				var bottom=bottoms[i] || b;
				if(i===0) prevTop=bottom;

				if(!quotes[i] || !quotes[i][field]){
					prevTop=bottom;
					prevRight+=self.layout.candleWidth;
					continue;
				}
				var quote=quotes[i];
				var value=quote[field];
				if(typeof(value)=="object" && value[subField]) value=value[subField];

				var y=(value-histMin)*multiplier;
				if(isNaN(y)) continue;
				var myCandleWidth=self.layout.candleWidth;
				if(quote.candleWidth) {
					myCandleWidth=quote.candleWidth;
					if(i===0) farLeft=prevRight=Math.floor(self.pixelFromBar(0, c.chart)-quote.candleWidth/2);
				}
				var top = Math.min(Math.floor(bottom - y)+0.5,bottom);
				// skip bars that should not be the passed color
				if ((positions && positions.indexOf(i) == -1) || // positions passed, skip any index not in the array
						(!positions && ( // positions not passed
							(isUp && quote.Close < quote.iqPrevClose) || // when isUp skip "down" bars
							(!isUp && quote.Close >= quote.iqPrevClose) // when not isUp skip "up" bars
						))) {
					prevTop = top;
					prevRight += myCandleWidth;
					continue;
				}
				var variableWidthRatio=myCandleWidth/self.layout.candleWidth;
				var start, x0, x1;
				if(shaveOff){
					start=Math.round(prevRight + (shaveOff + shift*candleWidth)*variableWidthRatio);
					x0=start+(isBorder?0:offset);
					x1=start+Math.round(candleWidth*variableWidthRatio)-(isBorder?0:offset);
				} else {
					start=prevRight + (shaveOff + shift*candleWidth)*variableWidthRatio;
					x0=Math.round(start)+(isBorder?0:offset);
					x1=Math.round(start+candleWidth*variableWidthRatio)-(isBorder?0:offset);
				}
				if(x1-x0<2) x1=x0+1;

				// this ensures that when we draw the border, we do not do it on a round pixel value to prevent blurred lines.
				var roundPixel = isBorder ? 0 : 0.5;
				if(x0 % 1 == roundPixel) x0+=0.5;
				if(x1 % 1 == roundPixel) x1+=0.5;

				//context.moveTo(x0, bottom);
				context.moveTo(x1, bottom);
				if (b != bottom && isBorder && !shaveOff && bottoms[i+1]) context.moveTo(x1, Math.max(top, Math.min(bottom,bottoms[i+1])));
				context.lineTo(x1, top);
				context.lineTo(x0, top);
				if(isBorder && shift){
					// draw down either to the top of the previous series' bar or bottom of this bar, so that we don't overlap strokes
					if(tops[i]>top || i===0) context.lineTo(x0, Math.min(bottom,tops[i]));
				}else if(isBorder && !shaveOff && type=="clustered"){
					// draw down either to the top of the previous series' previous bar or bottom of this bar, so that we don't overlap strokes
					if(i>0 && tops[i-1] && tops[i-1]>top) context.lineTo(x0, Math.min(bottom,tops[i-1]));
				}else if(isBorder && !shaveOff){
					// draw down either to the top of the previous bar or bottom of this bar, so that we don't overlap strokes
					if(prevTop>top || i===0) context.lineTo(x0, Math.min(bottom,prevTop));
				}else{
					context.lineTo(x0, bottom);
				}
				prevTop=top;
				prevRight+=myCandleWidth;
				if(type!="clustered" || isBorder) tops[i]=top;
			}

			if(isBorder){
				context.strokeStyle = !color || color == "auto" ? self.defaultColor : color;
				context.stroke();
			}else{
				context.fillStyle = !color || color == "auto" ? self.defaultColor : color;
				context.fill();
			}
			context.closePath();
		}

		for(sp=0;sp<seriesParams.length;sp++){
			var param=seriesParams[sp];
			candleWidth=this.layout.candleWidth*params.widthFactor;
			if ( shaveOff ) {
				//console.log(this.layout.candleWidth,candleWidth, this.layout.candleWidth-candleWidth);
				if( this.layout.candleWidth-candleWidth <=2 ) {
					bordersOn=false;
				}
			}
			var shift=0;
			if(type=="clustered") {
				shift=sp;
				candleWidth/=seriesParams.length;
			}
			subField=params.subField || this.chart.defaultPlotField || "Close";

			if (typeof param.color_function == 'function') {
				var colorTuple;
				var uniqueColors = {};
				var colorKey;

				for (var dataIndex = 0; dataIndex < quotes.length; dataIndex++) {
					if( quotes[dataIndex]){ // datasegment could be empty
						colorTuple = param.color_function(quotes[dataIndex]);

						if (typeof colorTuple == 'string') {
							colorTuple = {
								fill_color: colorTuple,
								border_color: colorTuple
							};
						}

						colorKey = colorTuple.fill_color + ',' + colorTuple.border_color;

						if (colorKey in uniqueColors) {
							uniqueColors[colorKey].positions.push(dataIndex);
						} else {
							colorTuple.positions = [dataIndex];
							uniqueColors[colorKey] = colorTuple;
						}
					}
				}

				for (colorKey in uniqueColors) {
					colorTuple = uniqueColors[colorKey];
					drawBars(param.field, subField, colorTuple.fill_color, colorTuple.opacity, null, null, shift, candleWidth, colorTuple.positions);
					drawBars(param.field, subField, colorTuple.border_color, colorTuple.opacity, true, null, shift, candleWidth, colorTuple.positions);
				}
			} else {
				drawBars(param.field, subField, param.fill_color_up, param.opacity_up, null, true, shift, candleWidth);
				drawBars(param.field, subField, param.fill_color_down, param.opacity_down, null, null, shift, candleWidth);
				if(this.layout.candleWidth>=2 && bordersOn){
					drawBars(param.field, subField, param.border_color_up, param.opacity_up, true, true, shift, candleWidth);
					drawBars(param.field, subField, param.border_color_down, param.opacity_down, true, null, shift, candleWidth);
				}
			}
			if(type=="stacked") bottoms=CIQ.shallowClone(tops);
		}
		context.globalAlpha=1;
		this.endClip();
	};


	/**
	 * <span class="animation">Animation Loop</span>
	 * This method draws bars on the chart when no custom `colorFunction` is defined.
	 * It is highly tuned for performance.
	 * @private
	 * @param  {CIQ.ChartEngine.Panel} params.panel		Panel on which to draw the bars
	 * @param  {object} params.style The canvas style
	 * @param  {enum} params.condition	The requested condition to be drawn. Available types are:
	 * 	- CIQ.ChartEngine.NONE	// no evaluation (black bars)
	 * if {@link CIQ.ChartEngine.prototype#colorByCandleDirection} is `false` :
	 * 	- CIQ.ChartEngine.CLOSEUP	// today's close greater than yesterday's close
	 * 	- CIQ.ChartEngine.CLOSEDOWN	// today's close less than yesterday's close
	 * 	- CIQ.ChartEngine.CLOSEEVEN	// today's close the same as yesterday's close
	 * if {@link CIQ.ChartEngine.prototype#colorByCandleDirection} is `true` :
	 * 	- CIQ.ChartEngine.CANDLEUP	// today's close greater than today's open
	 * 	- CIQ.ChartEngine.CANDLEDOWN	// today's close less than today's open
	 * 	- CIQ.ChartEngine.CANDLEEVEN	// today's close equal to today's open
	 * @memberOf CIQ.ChartEngine
	 * @since 5.1.0 Some new params properties were added, not documented
	 */
	CIQ.ChartEngine.prototype.drawBarTypeChartInner=function(params){
		var type=params.type, panel=params.panel, field=params.field, fillColor=params.fillColor, borderColor=params.borderColor, condition=params.condition, style=params.style, yAxis=params.yAxis, overlayScaling=params.overlayScaling;
		var isHistogram=(type=="histogram");
		var isCandle=isHistogram || (type=="candle");
		var isShadow=(type=="shadow");
		var isHLC=(type=="hlc");
		var isBar=(type=="bar" || isHLC);
		var chart=panel.chart;
		var quotes=chart.dataSegment;
		var context=this.chart.context;
		var t=panel.yAxis.top;
		var b=panel.yAxis.bottom;
		var yValueCache=new Array(quotes.length);

		var borderOffset=0;
		if(borderColor && !CIQ.isTransparent(borderColor)) borderOffset=0.5;

		var leftTick=chart.dataSet.length - chart.scroll - 1;
		context.beginPath();
		if(!yAxis) yAxis=panel.yAxis;
		var candleWidth=this.layout.candleWidth;
		var xbase=panel.left-0.5*candleWidth+this.micropixels-1;
		var defaultWhitespace=chart.tmpWidth/2;  //for each side of the candle
		var voffset=context.lineWidth/2;
		if(isCandle){
			if(CIQ.isTransparent(fillColor)) fillColor=this.containerColor;
			context.fillStyle=fillColor;
		}
		if(isShadow){
			context.lineWidth=1;
		}
		if(isBar){
			var styleObj=this.canvasStyle(style);
			if(styleObj.width && parseInt(styleObj.width,10)<=25){
				context.lineWidth=Math.max(1,CIQ.stripPX(styleObj.width));
			}else{
				context.lineWidth=1;
			}
		}
		var pass=chart.state.chartType.pass;
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
				if(params.volume || candleWidth<chart.tmpWidth) whitespace=candleWidth/2;
			}
			if(chart.transformFunc && yAxis==chart.panel.yAxis && quote.transform) quote=quote.transform;
			if(quote && field && field!="Close") quote=quote[field];
			if(!quote && quote!==0) continue;
			var Close=quote.Close, Open=quote.Open===undefined?Close:quote.Open;
			if(isHistogram && chart.defaultPlotField) Close=quote[chart.defaultPlotField];
			if(!Close && Close!==0) continue;
			if(isCandle && !isHistogram && ( Open==Close || Open===null )) continue;	// Doji always drawn by shadow
			if(condition){
				if(condition & CIQ.ChartEngine.CLOSEDOWN){
					pass.even|=Close==quote.iqPrevClose;
				}else if(condition & CIQ.ChartEngine.CANDLEDOWN){
					pass.even|=Close==Open;
				}
				if(condition & CIQ.ChartEngine.CANDLEUP && Open>=Close) continue;
				if(condition & CIQ.ChartEngine.CANDLEDOWN && Open<=Close) continue;
				if(condition & CIQ.ChartEngine.CANDLEEVEN && Open!=Close) continue;
				if(condition & CIQ.ChartEngine.CLOSEUP && Close<=quote.iqPrevClose) continue;
				if(condition & CIQ.ChartEngine.CLOSEDOWN && Close>=quote.iqPrevClose) continue;
				if(condition & CIQ.ChartEngine.CLOSEEVEN && Close!=quote.iqPrevClose) continue;
			}
			var tick=leftTick+x;
			var Top=Open, Bottom=Close;
			if(isShadow || isBar){
				Top=quote.High===undefined?Math.max(Close,Open):quote.High;
				Bottom=quote.Low===undefined?Math.min(Close,Open):quote.Low;
			}

			var t1, b1;
			if(overlayScaling){
				t1=overlayScaling.bottom - ((Top-overlayScaling.min)*overlayScaling.multiplier);
				b1=overlayScaling.bottom - ((Bottom-overlayScaling.min)*overlayScaling.multiplier);
			}else{
				t1=(yAxis.semiLog?this.pixelFromTransformedValue(Top,panel,yAxis):((yAxis.high-Top)*yAxis.multiplier)+yAxis.top); // inline version of pixelFromTransformedValue() for efficiency
				b1=(yAxis.semiLog?this.pixelFromTransformedValue(Bottom,panel,yAxis):((yAxis.high-Bottom)*yAxis.multiplier)+yAxis.top); // inline version of pixelFromTransformedValue() for efficiency
			}
			var pxOpen, pxClose;
			var pxTop=Math.floor(isHistogram?b1:Math.min(t1, b1))+borderOffset;
			var pxBottom=isHistogram?yAxis.bottom:Math.max(t1, b1);
			var length=Math.floor(pxBottom-pxTop);
			var pixelToCache=b1;

			if(isBar || isShadow){
				if(overlayScaling){
					pxOpen=overlayScaling.bottom - ((Open-overlayScaling.min)*overlayScaling.multiplier);
					pxClose=overlayScaling.bottom - ((Close-overlayScaling.min)*overlayScaling.multiplier);
				}else{
					pxOpen=(yAxis.semiLog?this.pixelFromTransformedValue(Open,panel,yAxis):((yAxis.high-Open)*yAxis.multiplier)+yAxis.top); // inline version of pixelFromTransformedValue() for efficiency
					pxClose=(yAxis.semiLog?this.pixelFromTransformedValue(Close,panel,yAxis):((yAxis.high-Close)*yAxis.multiplier)+yAxis.top); // inline version of pixelFromTransformedValue() for efficiency
				}
				pixelToCache=pxClose;
			}
			yValueCache[x]=pixelToCache;

			if(pxTop<t){
				if(pxTop+length<t) continue;
				length-=t-pxTop;
				pxTop=t;
			}
			if(pxTop+length>b){
				length-=(pxTop+length-b);
			}
			length=Math.max(length,2);
			pxBottom=pxTop+length;
			if(pxTop>=b) continue;
			if(pxBottom<=t) continue;
			// To avoid fuzziness, without candle borders we want to land on an even number
			// With candle borders we want to land on .5 so we add the borderOffset
			// But with candle borders the borderOffset makes it slightly wider so we make the width 1 pixel less
			var flr_xbase=Math.floor(xbase)+0.5;
			var xstart=Math.floor(flr_xbase-whitespace)+borderOffset;
			var xend=Math.round(flr_xbase+whitespace)-borderOffset;
			var extendIfAPoint=xstart==xend?whitespace:0; // in case we are about to draw a point (xstart==xend), we set an "extension" of the point so it becomes a line.
															// otherwise, context.lineTo() will not draw, since there is no change in coordinate.
															// See https://stackoverflow.com/questions/7812514/drawing-a-dot-on-html5-canvas
															// Besides, we don't want to plot a point in this method anyway, we need lines.

			if(isCandle){
				if(pxTop!=pxBottom){
					context.rect(xstart, pxTop, Math.max(1,xend-xstart), Math.max(1,pxBottom-pxTop));
				}
			}else if(isShadow){
				if(Close==Open){
					if(pxClose<=b && pxClose>=t){
						var o=Math.floor(pxClose)+0.5;
						context.moveTo(xstart-extendIfAPoint, o);
						context.lineTo(xend+extendIfAPoint, o);
					}
				}
				if(Top!=Bottom){
					context.moveTo(flr_xbase, pxTop);
					context.lineTo(flr_xbase, pxBottom);
				}
			}else if(isBar){
				if(pxTop<b && pxBottom>t && quote.High!=quote.Low){
					context.moveTo(flr_xbase, pxTop-voffset);
					context.lineTo(flr_xbase, pxBottom+voffset);
				}

				if(pxOpen>t && pxOpen<b && !isHLC){
					var o1=Math.floor(pxOpen)+0.5;
					context.moveTo(flr_xbase, o1);
					context.lineTo(flr_xbase-whitespace-extendIfAPoint, o1);
				}
				if(pxClose>t && pxClose<b){
					var c=Math.floor(pxClose)+0.5;
					context.moveTo(flr_xbase, c);
					context.lineTo(flr_xbase+whitespace+extendIfAPoint, c);
				}
			}
		}
		if(isCandle){
			context.fill();
			if(borderOffset){
				context.lineWidth=params.highlight?2:1;
				context.strokeStyle=borderColor;
				context.stroke();
			}
		}else if(isShadow || isBar){
			this.canvasColor(style);
			if(borderColor) context.strokeStyle=borderColor;
			if(params.highlight) context.lineWidth*=2;
			context.stroke();
			context.closePath();
			context.lineWidth=1;
		}
		return {cache:yValueCache};
	};

	/**
	 * <span class="animation">Animation Loop</span>
	 * Plots a line chart. This should not be called directly. It is used by {@link CIQ.ChartEngine#drawLineChart}, {@link CIQ.ChartEngine#drawMountainChart} (to draw the "edge" of the mountain), {@link CIQ.Studies.displayIndividualSeriesAsLine}, and several built in studies.
	 *
	 * Replaces plotLineChart.
	 *
	 * @param  {string} field	   The field to pull from quotes (typically "Close")
	 * @param  {CIQ.ChartEngine.Panel} panel	   The panel to draw the line upon
	 * @param  {object} [parameters] Parameters for the drawing operation
	 * @param {boolean} [parameters.skipTransform] If true then any transformations (such as comparison charting) will not be applied
	 * @param {boolean} [parameters.label] If true then the y-axis will be marked with the value of the right-hand intercept of the line
	 * @param {boolean} [parameters.noSlopes] If set then chart will draw horizontal bars with no vertical lines.
	 * @param {boolean} [parameters.step] If set then chart will resemble a step chart.  Horizontal lines will begin at the center of the bar.
	 * @param {boolean} [parameters.labelDecimalPlaces] Optionally specify the number of decimal places to print on the label. If not set then it will match the y-axis.
	 * @param {boolean} [parameters.extendOffChart=true] Set to false to not extend the plot off the left and right edge of the chart
	 * @param {boolean} [parameters.extendToEndOfDataSet] Set to true to plot any gap at the front of the chart.  Automatically done for step charts (see {@link CIQ.ChartEngine#addSeries})
	 * @param {boolean} [parameters.noDraw] Set to true to not actually draw anything but just return the object
	 * @param {number} [parameters.tension] Tension for splining. Requires "js/thirdparty/splines.js"
	 * @param {string} [parameters.pattern] The pattern for the line ("solid","dashed","dotted")
	 * @param {number} [parameters.width] The width in pixels for the line
	 * @param {object} [parameters.gapDisplayStyle] Gap object as set by See {@link CIQ.ChartEngine#setGapLines}. If `chart.gaplines` is set, it will override this parameter.  Set to false to force no gap drawing.
	 * @param {boolean} [parameters.reverse] If true, it fills from the plot line to the top of the panel for a mountain chart to create a reverse mountain.
	 * @param {CIQ.ChartEngine.YAxis} [parameters.yAxis=panel.yAxis] Set to specify an alternate y-axis
	 * @param  {function} [colorFunction]	(optional) A function which accepts an CIQ.ChartEngine, quote, and gap flag (true if the quote is a gap) as its arguments and returns the appropriate color for drawing that mode.
	 * 										<br> Example: `colorFunction(stxx,untransformedQuote,true);` //true says this is a gap.
											<br> Returning a null will skip that line segment.
											If not passed as an argument, will use the color set in the calling function.
	 * @return {object} Data generated by the plot, such as colors used if a colorFunction was passed, and the vertices of the line (points).
	 * @since
	 * <br>&bull; 4.0.0
	 * <br>&bull; 5.2.0 `parameters.gaps` has been deprecated and replaced with `parameters.gapDisplayStyle`
	 * <br>&bull; 6.0.0 `params.gapDisplayStyle` can be set to false to suppress all gap drawing

	 * @memberof CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.plotDataSegmentAsLine=function(field, panel, parameters, colorFunction){
		var skipProjections=false, skipTransform=false, noSlopes=false, step=false, extendOffChart=true, gapDisplayStyle=null, pattern=null, yAxis=null, tension = 0, noDraw=false, reverse=false, overlayScaling=null;
		var colors={}, points = [], colorPatternChanges=[], gapAreas=[], colArray=[];
		var self=this, chart=panel.chart, quotes=chart.dataSegment, context=chart.context, yValueCache=new Array(quotes.length), initialColor=context.strokeStyle;

		function setPatternAndFinishLastSegment(colorObj){
			var oldPattern=pattern;
			var color=colorObj;
			if(typeof color=="object"){
				pattern=CIQ.borderPatternToArray(context.lineWidth,color.pattern);
				color=color.color;
			}
			colors[color]=1;
			if(noDraw) return;

			var last=points.slice(-2);
			var p1=(pattern instanceof Array) && pattern.join();
			var p2=(oldPattern instanceof Array) && oldPattern.join();
			var patternChange=p1!=p2;
			var colorChange=!CIQ.colorsEqual(initialColor,color);
			var proposedNewWidth=colorObj.width*(parameters.highlight?2:1);
			var widthChange=context.lineWidth!=proposedNewWidth;
			if(colorChange || patternChange || widthChange){
				if(tension){
					colorPatternChanges.push({
						coord: last,
						color: color,
						pattern: pattern?pattern:[],
						width:proposedNewWidth
					});
				}else if(colorChange || widthChange){
					context.stroke();
					context.lineWidth=proposedNewWidth;
					context.beginPath();
					context.moveTo(last[0],last[1]);  //reset back to last point
				}
			}
			// initial color setting
			initialColor=color;
			if(!tension){
				if(!color || color=="auto"){
					context.strokeStyle=self.defaultColor;
				}else{
					context.strokeStyle=color;
				}
			}

			return last;
		}
		function plotCollated(x,y,q,os){ // ignore dashed, dotted lines when approximating
			var collatedOpen, collatedHigh, collatedLow;
			if(os) {
				var tmp=os.bottom+os.min*os.multiplier;
				collatedOpen= tmp - q.CollatedOpen*os.multiplier;
				collatedHigh= tmp - q.collatedHigh*os.multiplier;
				collatedLow = tmp - q.collatedLow*os.multiplier;
			}else{
				collatedOpen=((yAxis.semiLog ?
						self.pixelFromTransformedValue(q.CollatedOpen,panel,yAxis) :
						((yAxis.high-q.CollatedOpen)*yAxis.multiplier)+yAxis.top)); // inline version of pixelFromTransformedValue() for efficiency
				collatedHigh=((yAxis.semiLog ?
						self.pixelFromTransformedValue(q.CollatedHigh,panel,yAxis) :
						((yAxis.high-q.CollatedHigh)*yAxis.multiplier)+yAxis.top)); // inline version of pixelFromTransformedValue() for efficiency
				collatedLow=((yAxis.semiLog ?
						self.pixelFromTransformedValue(q.CollatedLow,panel,yAxis) :
						((yAxis.high-q.CollatedLow)*yAxis.multiplier)+yAxis.top)); // inline version of pixelFromTransformedValue() for efficiency
			}
			/*var method=1;
			if(method==1){*/  //keeps line endpoints at the closes
				context.lineTo(x,collatedOpen);
				context.moveTo(x,collatedHigh);
				context.lineTo(x,collatedLow);
				context.moveTo(x,y);
			/*}else{  //just draws high-low verticals in zigzag pattern
				context.lineTo(x,collatedHigh);
				context.lineTo(x,collatedLow);
			}*/
			points.push(x,collatedOpen);
		}

		if( chart.dataSet.length ) {
			this.startClip(panel.name);
			if(parameters){
				skipProjections=parameters.skipProjections; // Internal only, stop drawing if we reach a projection
				skipTransform=parameters.skipTransform;
				noSlopes=parameters.noSlopes;
				tension=parameters.tension;
				step=parameters.step;
				pattern=parameters.pattern;
				extendOffChart=parameters.extendOffChart;
				yAxis=parameters.yAxis;
				gapDisplayStyle=parameters.gapDisplayStyle;
				noDraw=parameters.noDraw;
				reverse=parameters.reverse;
				overlayScaling=parameters.overlayScaling;
				if(parameters.width) context.lineWidth=parameters.width;
			}
			if(!gapDisplayStyle && gapDisplayStyle!==false) gapDisplayStyle=parameters.gaps;
			if(!gapDisplayStyle) gapDisplayStyle={
				color:"transparent",
				fillMountain:true
			};
			if(parameters.highlight) context.lineWidth*=2;
			if(extendOffChart!==false) extendOffChart=true;
			var defaultPlotField=parameters.subField || chart.defaultPlotField || "Close";
			if(!yAxis) yAxis=panel.yAxis;
			var doTransform=chart.transformFunc && yAxis==chart.panel.yAxis;
			var lw2=context.lineWidth*2;
			var threshold=reverse?chart.top-lw2:chart.bottom+lw2;
			if(parameters.threshold || parameters.threshold===0) threshold=this.pixelFromPrice(parameters.threshold, panel, yAxis);
			var fillMountain=!tension && noDraw && gapDisplayStyle && gapDisplayStyle.fillMountain;
			var cacheField=field;
			var offScreenField=field;
			// this is where we determine if we have to actually use the defaultPlotField to access the actual data.
			// We check if the field is an object and if so, assume we need to use the defaultPlotField to get the offscreen data points.
			for(var tst=0;tst<quotes.length;tst++){
				var test=quotes[tst];
				if(test && typeof(test)=="object"){
					if(test[field] || test[field]===0){
						if(typeof(test[field])=="object"){
							offScreenField=CIQ.createObjectChainNames(field, [defaultPlotField])[0];
						}
						break;
					}
				}
			}
			var offScreen={left:null,right:null};
			var leftTick=chart.dataSet.length - chart.scroll - 1;
			if(extendOffChart){
				if(!parameters.isComparison) offScreen.left=this.getPreviousBar(chart, offScreenField, 0);
				offScreen.right=this.getNextBar(chart, offScreenField, quotes.length-1);
			}
			var first=true, gap=false, candleWidth, quoteForLabel;

			context.beginPath();
			var offScreenLeft=offScreen.left, offScreenLeftTransform=null;
			if(offScreenLeft) offScreenLeftTransform=offScreenLeft.transform;
			if(offScreenLeft){
				quoteForLabel=doTransform ? offScreenLeftTransform ? offScreenLeftTransform[field] : null : offScreenLeft[field];
				if(quoteForLabel){
					if(quoteForLabel[defaultPlotField] || quoteForLabel[defaultPlotField]===0) quoteForLabel=quoteForLabel[defaultPlotField];
					var startX=this.pixelFromTick(offScreenLeft.tick,chart);
					var startY=overlayScaling?
							overlayScaling.bottom - ((quoteForLabel-overlayScaling.min)*overlayScaling.multiplier) :
							this.pixelFromTransformedValue(quoteForLabel,panel,yAxis);
					context.moveTo(startX,startY);
					points.push(startX,startY);
					if(quotes[0].tick-offScreenLeft.tick>1) {
						gapAreas.push({start:points.slice(-2),threshold:threshold,tick:offScreenLeft});
						gap=true;
					}
					first=false;
				}
			}
			var x=panel.left + this.micropixels - 1;
			var lastQuote, gapEndQuote, currentQuote = this.currentQuote();
			var totalWidth=0, lastCollatedPixel=0, isApproximating=false;
			var tempQuote={ reset:true };
			for(var i=0;i<quotes.length;i++){
				candleWidth=this.layout.candleWidth;
				var quote=quotes[i], untransformedQuote=quotes[i];
				if(!quote) quote={};
				if(skipProjections && quote.projection) {
					offScreen.right=null;
					break;
				}
				if(quote.candleWidth) candleWidth=quote.candleWidth;
				if(doTransform&&quote.transform) quote=quote.transform;
				var quoteField=quote[field];
				if(quoteField && typeof(quoteField)=="object"){
					quoteField=quoteField[defaultPlotField];
					cacheField=field+"."+defaultPlotField;
				}
				if(chart.lineApproximation && this.layout.candleWidth<1){
					if(tempQuote.reset){
						tempQuote={
							CollatedHigh: -Number.MAX_VALUE,
							CollatedLow: Number.MAX_VALUE,
							CollatedOpen: null,
							CollatedClose: null
						};
						isApproximating=false;
					}
					var val=quoteField;
					if(val || val===0){
						tempQuote.CollatedHigh=Math.max(tempQuote.CollatedHigh,val);
						tempQuote.CollatedLow=Math.min(tempQuote.CollatedLow,val);
						tempQuote.CollatedClose=val;
						if(tempQuote.CollatedOpen===null) tempQuote.CollatedOpen=val;
						else isApproximating=true;
					}
					totalWidth+=candleWidth;
					if(totalWidth-lastCollatedPixel>=1 || i==quotes.length-1){
						lastCollatedPixel=Math.floor(totalWidth);
						tempQuote.reset=true;
						tempQuote[field]=tempQuote.CollatedClose;
						quote=tempQuote;
						quote.cache={};
					}else{
						x+=candleWidth;
						continue;
					}
				}
				if(!noSlopes) x+=candleWidth/2;
				if(!quoteField && quoteField!==0) {
					var gapStart=points.slice(-2);
					if(fillMountain && !gap && points.length) points.push(gapStart[0], threshold);
					if(!gap) gapAreas.push({start:gapStart,threshold:threshold,tick:gapEndQuote});
					gap=true;
					x+=noSlopes?candleWidth:candleWidth/2;
					if((step || noSlopes) && points.length) yValueCache[i]=points.slice(-1)[0]; // continue the y value horizontally for step charts
					continue;
				}
				lastQuote=quote;
				var cache=quote.cache, tick=leftTick+i;
				if(tick<panel.cacheLeft || tick>panel.cacheRight || !cache[field]){
					if(overlayScaling){
						cache[cacheField]=overlayScaling.bottom - ((quoteField-overlayScaling.min)*overlayScaling.multiplier);
					}else{
						cache[cacheField]=(yAxis.semiLog ?
								this.pixelFromTransformedValue(quoteField,panel,yAxis) :
								((yAxis.high-quoteField)*yAxis.multiplier)+yAxis.top); // inline version of pixelFromTransformedValue() for efficiency
					}
				}
				var y=yValueCache[i]=cache[cacheField];
				if(untransformedQuote.tick==currentQuote.tick && chart.lastTickOffset) x+=chart.lastTickOffset;

				var last=points.slice(-2);
				if(!first && colorFunction){
					if(untransformedQuote[field] && untransformedQuote[field][defaultPlotField]) untransformedQuote=untransformedQuote[field];
					var color=colorFunction(this,untransformedQuote,gap); // untransformedQuote is intended
					if(!color) {
						x+=noSlopes?candleWidth:candleWidth/2;
						continue;
					}
					last=setPatternAndFinishLastSegment(color);
				}
				if(!first && pattern && pattern.length) {
					if(step || noSlopes) {
						if(isApproximating) plotCollated(x,last[1],quote,overlayScaling);
						else context.dashedLineTo(last[0], last[1], x, last[1], pattern);
						if(noSlopes) context.moveTo(x, y);
						else if(isApproximating) plotCollated(x,y,quote,overlayScaling);
						else context.dashedLineTo(x, last[1], x, y, pattern);
						points.push(x,last[1]);
					}else{
						if(isApproximating) plotCollated(x,y,quote,overlayScaling);
						else context.dashedLineTo(last[0], last[1], x, y, pattern);
					}
				}else{
					if(first) {
						context.moveTo(x,y);
						if(tension){
							colorPatternChanges.push({
								coord: [x,y],
								color: context.strokeStyle,
								pattern: pattern?pattern:[],
								width: context.lineWidth,
							});
						}
					}
					else {
						if(step || noSlopes) {
							var yLast=points.slice(-1)[0];
							if(isApproximating) plotCollated(x,yLast,quote,overlayScaling);
							else context.lineTo(x,yLast);
							points.push(x,yLast);

						}
						if(isApproximating && !noSlopes) plotCollated(x,y,quote,overlayScaling);
						else context[noSlopes?"moveTo":"lineTo"](x,y);
					}
				}
				if(gap) {
					gapAreas.push({end:[x,y],threshold:threshold});
					gapEndQuote=untransformedQuote;
					if(fillMountain && !step && !noSlopes) points.push(x, threshold);
				}
				points.push(x,y);
				first=false;
				gap=false;
				x+=noSlopes?candleWidth:candleWidth/2;
			}
			var offScreenRight=offScreen.right, offScreenRightTransform=null;
			if(offScreenRight) offScreenRightTransform=offScreenRight.transform;
			if(!first && offScreenRight){
				quoteForLabel=doTransform ? offScreenRightTransform ? offScreenRightTransform[field] : null : offScreenRight[field];
				if(quoteForLabel && (quoteForLabel[defaultPlotField] || quoteForLabel[defaultPlotField]===0)) quoteForLabel=quoteForLabel[defaultPlotField];
				var endX=this.pixelFromTick(offScreenRight.tick,chart);
				var endY=overlayScaling?
						overlayScaling.bottom - ((quoteForLabel-overlayScaling.min)*overlayScaling.multiplier) :
						this.pixelFromTransformedValue(quoteForLabel,panel,yAxis);
					if(offScreenRight.tick-quotes[quotes.length-1].tick>1) {
						if(!gap){
							var ps2=points.slice(-2);
							if(fillMountain && points.length) points.push(ps2[0], threshold);
							gapAreas.push({start:ps2,threshold:threshold,tick:quotes[quotes.length-1]});
						}
						gap=true;
					}
				if(!first && colorFunction){
					var endColor=colorFunction(this,offScreenRight,gap);
					if(endColor) {
						var last1=setPatternAndFinishLastSegment(endColor);
						if(pattern && pattern.length) {
							if(step || noSlopes) {
								context.dashedLineTo(last1[0], last1[1], endX, last1[1], pattern);
								if(noSlopes) context.moveTo(endX, endY);
								else context.dashedLineTo(endX, last1[1], endX, endY, pattern);
								points.push(endX,last1[1]);

							}else{
								context.dashedLineTo(last1[0], last1[1], endX, endY, pattern);
							}
						}
					}
				}
				var last2=points.slice(-2);
				if(!pattern || !pattern.length) {
					if(step || noSlopes) {
						context.lineTo(endX,last2[1]);
						points.push(endX,last2[1]);
					}
					context[noSlopes?"moveTo":"lineTo"](endX,endY);
				}
				if(gap){
					gapAreas.push({end:[endX,endY],threshold:threshold});
					if(fillMountain && !step && !noSlopes) {
						//points.push(last2[0], threshold);
						points.push(endX, threshold);
					}
				}
				points.push(endX,endY);
			}
			for(var col in colors){
				colArray.push(col);
			}
			if(step || noSlopes || this.extendLastTick || parameters.extendToEndOfDataSet) {
				var last3=points.slice(-2);
				if(points.length){
					var extendX=last3[0], extendY=last3[1];
					if(step || parameters.extendToEndOfDataSet){
						extendX=this.pixelFromTick(chart.dataSet.length-1,chart);
						if(noSlopes || this.extendLastTick) extendX+=candleWidth/2;
					}
					else if(noSlopes) extendX+=candleWidth;
					else if(this.extendLastTick) extendX+=candleWidth/2;
					if(extendX>last3[0]){
						var extendColor=null;
						if(colorFunction) extendColor=colorFunction(this,{},true);
						if(extendColor) setPatternAndFinishLastSegment(extendColor);
						if(pattern && pattern.length) context.dashedLineTo(last3[0], last3[1], extendX, extendY, pattern);
						else context.lineTo(extendX,extendY);
						if(!gap || !fillMountain) points.push(extendX,extendY);
					}
				}
			}
			if(!noDraw){
				if(tension && points.length) {
					context.beginPath();
					context.setLineDash(parameters.pattern || []);
					context.lineDashOffset=0;
					splinePlotter.plotSpline(points, tension, context, colorPatternChanges);
				}
				context.stroke();
			}

			this.endClip();

			if(!noDraw && parameters.label && lastQuote){
				var txt;
				var fieldToTxt=lastQuote[field];
				if(fieldToTxt && typeof fieldToTxt=="object") fieldToTxt=fieldToTxt[defaultPlotField];
				if(yAxis.priceFormatter){
					txt=yAxis.priceFormatter(this, panel, fieldToTxt, parameters.labelDecimalPlaces);
				}else{
					txt=this.formatYAxisPrice(fieldToTxt, panel, parameters.labelDecimalPlaces);
				}
				var yaxisLabelStyle=this.yaxisLabelStyle;
				if(yAxis.yaxisLabelStyle) yaxisLabelStyle=yAxis.yaxisLabelStyle;
				var labelcolor=yaxisLabelStyle=="noop"?context.strokeStyle:null;
				var bgColor=yaxisLabelStyle=="noop"?"#FFFFFF":context.strokeStyle;
				this.yAxisLabels.push({src:"plot","args":[panel, txt, lastQuote.cache[cacheField], bgColor, labelcolor]});
			}
		}
		if(gapDisplayStyle){
			// Draw dots for isolated points surrounded by gaps
			for(var gp=0;gp<gapAreas.length;gp+=2){
				var gapstart=gapAreas[gp].start, gapend;
				if(gp) gapend=gapAreas[gp-1].end;
				if(gapend && (gapstart[0]==gapend[0] && gapstart[1]==gapend[1])){
					context.beginPath();
					var width=context.lineWidth;
					if(colorFunction) {
						var dotcolor=colorFunction(this,gapAreas[gp].tick||{},false);
						if(typeof dotcolor=="object") {
							width=dotcolor.width*(parameters.highlight?2:1);
							dotcolor=dotcolor.color;
						}
						context.strokeStyle=context.fillStyle=dotcolor;
					}
					context.lineWidth=width;
					context.arc(gapstart[0], gapstart[1], 1, 0, 2*Math.PI);
					context.stroke();
					context.fill();
				}
			}
		}
		return {
			colors: colArray,
			points: points,
			cache: yValueCache,
			gapAreas: gapAreas
		};
	};

	/**
	 * <span class="animation">Animation Loop</span>
	 * Draws a mountain chart.
	 *
	 * <br>This method should rarely if ever be called directly.  Use {@link CIQ.Renderer.Lines} or {@link CIQ.ChartEngine#setChartType} instead.
	 *
	 * Uses CSS style `style stx_mountain_chart`, or `stx_colored_mountain_chart` to control mountain colors and line width, unless `params` are set.
	 * - `background-color`	- Background color for mountain (top of the mountain, if grading in combination with 'color')
	 * - `border-top-color`	- Optional gradient color (bottom of the mountain, if grading in combination with background-color')
	 * - `border`	- Optional line color
	 * - `width`	- Optional line width
	 *
	 * Example using {@link CIQ.ChartEngine#setStyle} (alternatively, the CSS style can be directly overwritten on a CSS file):
	 * ```
	 * stxx.setStyle("stx_mountain_chart","borderTopColor","blue");
	 * stxx.setStyle("stx_mountain_chart","backgroundColor","purple");
	 * ```
	 * The default color function for the colored mountain chart uses the following CSS styles:
	 * - `stx_line_up`		- Color of the uptick portion of the line
	 * - `stx_line_down`		- Color of the downtick portion of the line
	 * - `stx_line_chart`		- Default line color if no up or down is defined.
	 *
	 * Alternatively you can use  {@link CIQ.ChartEngine#setLineStyle} to override the CSS style.
	 *
	 * @param  {CIQ.ChartEngine.Panel} panel The panel on which to draw the mountain chart
	 * @param  {object} params	Configuration parameters
	 * @param {CIQ.ChartEngine.YAxis} [params.yAxis=panel.yAxis] Set to specify an alternate y-axis
	 * @param  {string} [params.style]	The CSS style selector which contains the styling for the bar (width and color). Defaults to `stx_mountain_chart`.
	 * @param  {boolean} [params.reverse]	Set to true to draw a "reverse" mountain chart
	 * @param  {string} [params.field]	Set to override the field to be plotted.  Default is chart.defaultPlotField which defaults to "Close"
	 * @param {object} [params.gapDisplayStyle] Gap object as set by See {@link CIQ.ChartEngine#setGapLines}. If not set `chart.gaplines` will be used.  Set to false to force no drawing of gap lines.
	 * @param  {function} [colorFunction]	(optional) A function which accepts an CIQ.ChartEngine and quote as its arguments and returns the appropriate color for drawing that mode.
											Returning a null will skip that line segment.  If not passed as an argument, will use the color set in the calling function.
	 * @return {object} Data generated by the plot, such as colors used if a colorFunction was passed, and the vertices of the line (points).
	 * @memberof CIQ.ChartEngine
	 * @since
	 * <br>&bull; 15-07-01 Changed signature from `chart` to `panel`
	 * <br>&bull; 05-2016-10 function now accepts a style, colorFunction argument, and returns colors used in the line plot
	 * <br>&bull; 4.0.0 change style to an object argument called `parameters` so yAxis, field and reverse can be supported.
	 * <br>&bull; 4.0.0 return value is now an object
	 * <br>&bull; 5.2.0 `params.gaps` has been deprecated and replaced with `params.gapDisplayStyle`
	 * <br>&bull; 6.0.0 `params.gapDisplayStyle` can be set to false to suppress all gap drawing
	 *
	 */
	CIQ.ChartEngine.prototype.drawMountainChart=function(panel, params, colorFunction){
		var context=this.chart.context, style=params, reverse=false, colored=false, field=null, plotField=null, yAxis=null, tension=null, width=0, gaps=null, step=false, fillStyle=null, pattern=null, highlight=false, baseColor=null, bgColor=null, overlayScaling=null, extendToEnd=false, isComparison=false, returnObject=false;
		var chart=panel.chart, dataSegment=chart.dataSegment, lineStyle=chart.lineStyle || {};
		if(!params || typeof(params)!="object") params={ style:params/*, tension:0*/ };

		style=params.style || "stx_mountain_chart";
		field=params.field || chart.defaultPlotField || "Close";  // usually the series
		plotField=params.subField || chart.defaultPlotField || "Close";  // usually the field within the series
		gaps=params.gapDisplayStyle;
		if(!gaps && gaps!==false) gaps=params.gaps;
		if(!gaps && gaps!==false) gaps=chart.gaplines;
		if(!gaps) gaps="transparent";
		yAxis=params.yAxis || panel.yAxis;
		reverse=params.reverse;
		tension=params.tension;
		fillStyle=params.fillStyle;
		width=params.width || lineStyle.width;
		step=params.step;
		pattern=params.pattern || lineStyle.pattern;
		highlight=params.highlight;
		bgColor=params.color;
		baseColor=params.baseColor;
		colored=params.colored;
		overlayScaling=params.overlayScaling;
		extendToEnd=params.extendToEndOfDataSet;
		isComparison=params.isComparison;
		returnObject=params.returnObject;

		var c=this.canvasStyle(style);
		var top=yAxis.top;//this.pixelFromTransformedValue(panel.chart.highValue, panel, yAxis); <--highValue is only for the main axis, not a renderer's axis
		if(isNaN(top) || isNaN(top/top)) top=0;	// 32 bit IE doesn't like large numbers
												// top/top checks for Infinity
		//backgroundColor is the top of the mountain; color is the bottom
		var backgroundColor=bgColor || (style && c.backgroundColor ? c.backgroundColor : this.defaultColor);
		var color=baseColor || (style && c.color ? c.color : this.containerColor);
		if(fillStyle){
			context.fillStyle=fillStyle;
		}else if(baseColor || c.color){
			var gradient=context.createLinearGradient(0,top,0,yAxis.bottom);
			gradient.addColorStop(0, backgroundColor);
			gradient.addColorStop(1, color);
			context.fillStyle=gradient;
		}else{
			context.fillStyle=backgroundColor;
		}
		this.startClip(panel.name);
		var originalWidth=context.lineWidth;
		if(!params.symbol) plotField=null;
		params={skipProjections:true, reverse:reverse, yAxis:yAxis, gaps:gaps, step:step, highlight:highlight, extendToEndOfDataSet:extendToEnd, isComparison:isComparison};
		if(chart.tension) params.tension=chart.tension;
		if(tension || tension===0) params.tension=tension;
		var padding=parseInt(c.paddingTop,10);
		var strokeStyle=bgColor || c.borderTopColor;
		var rc=null;
		if(colored || (strokeStyle && !CIQ.isTransparent(strokeStyle))){
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

		CIQ.extend(params,{
			panelName: panel.name,
			direction: params.reverse?-1:1,
			band: field,
			subField: plotField,
			opacity: 1,
			overlayScaling: overlayScaling
		});
		CIQ.preparePeakValleyFill(this, params);

		if(colored || (strokeStyle && !CIQ.isTransparent(strokeStyle))){
			if(padding && !CIQ.isIE8) {
				context.save();
				context.lineWidth+=2*padding;
				context.globalCompositeOperation="destination-out";
				context.globalAlpha=1;
				this.plotDataSegmentAsLine(field, panel, params);
				context.globalCompositeOperation="destination-over";
				context.scale(1/this.adjustedDisplayPixelRatio,1/this.adjustedDisplayPixelRatio);
				context.drawImage(this.scratchContext.canvas,0,0);
				context.restore();
			}
		}
		context.strokeStyle=strokeStyle;
		if(width){
			context.lineWidth=width;
		}else if(c.width && parseInt(c.width,10)<=25){
			context.lineWidth=Math.max(1,CIQ.stripPX(c.width));
		}else{
			context.lineWidth=1;
		}

		if(!pattern) pattern=c.borderTopStyle;
		params.pattern=CIQ.borderPatternToArray(context.lineWidth,pattern);
		var myColorFunction=colorFunction;
		if(gaps) myColorFunction=this.getGapColorFunction(field, plotField, {color:strokeStyle, pattern:params.pattern, width:context.lineWidth}, gaps, colorFunction);
		rc=this.plotDataSegmentAsLine(field, panel, params, myColorFunction);
		context.lineWidth=originalWidth;
		this.endClip();
		if(!rc.colors.length) rc.colors.push(strokeStyle);
		return returnObject?rc:rc.colors;
	};

	/**
	 * Draws a baseline chart.
	 *
	 * This method should rarely if ever be called directly.  Use {@link CIQ.Renderer.Lines} or {@link CIQ.ChartEngine#setChartType} instead.
	 *
	 * Unless `params` are set, uses the following CSS styles for standard baselines:
	 * - `stx_baseline_up`		- Color of the portion above the baseline
	 * - `stx_baseline_down`	- Color of the portion below the baseline
	 * - `stx_baseline`			- Color of the baseline
	 *
	 * Additionally, unless `params` are set, uses CSS `stx_baseline_delta_mountain` for mountain baselines:
	 * - `background-color`	- Background color for mountain
	 * - `color`	- Optional gradient color
	 * - `width`	- Optional line width
	 * - `padding`	- Optional padding between the baseline and the mountain shading
	 *
	 * Alternatively you can use  {@link CIQ.ChartEngine#setLineStyle} to override the CSS style.
	 *
	 * @param  {CIQ.ChartEngine.Panel} panel The panel on which to draw the baseline chart
	 * @param  {object} parameters	Configuration parameters
	 * @param {CIQ.ChartEngine.YAxis} [parameters.yAxis=panel.yAxis] Set to specify an alternate y-axis
	 * @param  {string} [parameters.style]	The style selector which contains the styling for the mountain chart if mountain selected. Defaults to `stx_baseline_delta_mountain`.
	 * @param  {string} [parameters.field]	Set to override the field to be plotted.  Default is chart.defaultPlotField which defaults to "Close"
	 * @return {object} Data generated by the plot, such as colors used.
	 * @memberof CIQ.ChartEngine
	 * @since 5.1.0
	 *
	 */
	CIQ.ChartEngine.prototype.drawBaselineChart=function(panel, params){
		var chart=panel.chart, chartGaplines=chart.gaplines, baseLevel=chart.baseline.actualLevel, colors=[];
		var field=params.field || chart.defaultPlotField;  // usually the series
		var lineStyle=chart.lineStyle || {};

		if(panel.name!=chart.panel.name){
			baseLevel=null;
			var plotField=params.subField || chart.defaultPlotField || "Close";
			if(chart.dataSegment[0]) baseLevel=chart.dataSegment[0][params.field];
			else baseLevel=this.getNextBar(chart, plotField, 0);
			if(baseLevel && typeof(baseLevel)=="object") baseLevel=baseLevel[plotField];
		}
		var gaps=params.gapDisplayStyle;
		if(!gaps && gaps!==false) gaps=params.gaps;
		if(baseLevel!==null && !isNaN(baseLevel)){
			var isMountain=params.type=="mountain";
			if(isMountain){
				// do the mountain under
				colors=this.drawMountainChart(panel,{
					style:params.style,
					field:params.field,
					yAxis:params.yAxis,
					gapDisplayStyle:gaps,
					overlayScaling:params.overlayScaling,
					colored:true,
					//step:params.step  // can of worms with the verticals since we don't know if there are gaps
					tension:0
				});
			}
			var basePixel=this.pixelFromPrice(baseLevel,panel);
			if(isNaN(basePixel)) return;
			this.startClip(panel.name);
			var pattern=params.pattern || lineStyle.pattern;
			var fillUp=params.fill_color_up || this.getCanvasColor("stx_baseline_up");
			var fillDown=params.fill_color_down || this.getCanvasColor("stx_baseline_down");
			var edgeUp=params.border_color_up || this.getCanvasColor("stx_baseline_up");
			var edgeDown=params.border_color_down || this.getCanvasColor("stx_baseline_down");
			var widthUp=params.width || lineStyle.width || this.canvasStyle("stx_baseline_up").width;
			var widthDown=params.width || lineStyle.width || this.canvasStyle("stx_baseline_down").width;

			var styles={"over":{fill:fillUp,edge:edgeUp,width:widthUp},"under":{fill:fillDown,edge:edgeDown,width:widthDown}};
			var usingDefaultColorForGaps=false;
			if(!gaps && gaps!==false) gaps=chartGaplines;
			for(var s in styles){
				var width=parseInt(Math.max(1,CIQ.stripPX(styles[s].width)),10);
				if(params.highlight) width*=2;
				pattern=CIQ.borderPatternToArray(width,pattern);
				var parameters={
					panelName: panel.name,
					band: field,
					threshold: baseLevel,
					color: isMountain?"transparent":styles[s].fill,
					direction: (s=="over"?1:-1),
					edgeHighlight: styles[s].edge,
					edgeParameters: {pattern:pattern,lineWidth:width+0.1,opacity:1},
					gapDisplayStyle: gaps,
					yAxis: params.yAxis,
					overlayScaling: params.overlayScaling,
					//step: params.step  // can of worms with the verticals since we don't know if there are gaps
				};
				if(parameters.yAxis) {
					parameters.threshold=this.priceFromPixel(this.pixelFromPrice(parameters.threshold,panel),panel,parameters.yAxis);
				}
				colors.push(styles[s].edge);
				var fillColor=parameters.color;
				if(!isMountain && fillColor && fillColor!="transparent"){
					var t=panel.top, b=panel.bottom;
					var gradient=chart.context.createLinearGradient(0,(s=="over"?t:b),0,basePixel);
					gradient.addColorStop(0, CIQ.hexToRgba(CIQ.colorToHex(fillColor),60));
					gradient.addColorStop(1, CIQ.hexToRgba(CIQ.colorToHex(fillColor),10));
					parameters.color=gradient;
					parameters.opacity=1;
				}
				CIQ.preparePeakValleyFill(this,chart.dataSegment,parameters);
				if(chartGaplines){
					if(!chartGaplines.fillMountain){
						// "erase" the plot line where the gap is
						this.drawLineChart(panel, null, null, {color:"transparent", gapDisplayStyle:{color:this.containerColor,pattern:"solid",width:parameters.edgeParameters.lineWidth}});
					}
					if(!chartGaplines.color) {
						usingDefaultColorForGaps=true;
						chartGaplines.color=this.defaultColor;
					}
				}
				//this draws the gaplines, in case they weren't drawn before (fillMountain==true)
				this.drawLineChart(panel, null, null, {color:"transparent",width:parameters.edgeParameters.lineWidth});
				if(usingDefaultColorForGaps) chartGaplines.color=null;
			}

			this.plotLine(0, 1, basePixel, basePixel, this.containerColor, "line", chart.context, panel, {lineWidth:"1.1",color:"transparent"});
			this.plotLine(0, 1, basePixel, basePixel, this.getCanvasColor("stx_baseline"), "line", chart.context, panel, {pattern:"dotted",lineWidth:"2.1",opacity:0.5});
			if(this.controls.baselineHandle && this.manageTouchAndMouse){
				if(this.getSeriesRenderer(params.name)==this.mainSeriesRenderer && chart.baseline.userLevel!==false){
					this.controls.baselineHandle.style.top = basePixel - parseInt(getComputedStyle(this.controls.baselineHandle).height, 10)/2+"px";
					this.controls.baselineHandle.style.left = chart.right - parseInt(getComputedStyle(this.controls.baselineHandle).width, 10)+"px";
					this.controls.baselineHandle.style.display="block";
				}
			}
			this.endClip();
		}
		return {colors:colors};
	};

	// locking:mousemoveinner

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Core logic for handling mouse or touch movements on the chart.
	 *
	 * If {@link CIQ.ChartEngine#grabbingScreen} is `true` then drag operations are performed.
	 *
	 * This method sets several variables which can be accessed for convenience:
	 * - CIQ.ChartEngine.crosshairX and CIQ.ChartEngine.crosshairY - The screen location of the crosshair
	 * - CIQ.ChartEngine.insideChart - True if the cursor is inside the canvas
	 * - stxx.cx and stxx.cy - The location on the canvas of the crosshair
	 * - stxx.crosshairTick - The current location in the dataSet of the crosshair
	 * - stxx.currentPanel - The current panel in which the crosshair is located (this.currentPanel.chart is the chart)
	 * - stxx.grabStartX and this.grabStartY - If grabbing the chart, then the starting points of that grab
	 * - stxx.grabStartScrollX and this.grabStartScrollY - If grabbing the chart, then the starting scroll positions of the grab
	 * - stxx.zoom - The vertical zoom percentage
	 * - stxx.scroll - The scroll position of the chart
	 *
	 * *Above assumes your have declared a chart engine and assigned to `var stxx`.
	 *
	 * @param  {number} epX The X location of the cursor on the screen (relative to the viewport)
	 * @param  {number} epY The Y location of the cursor on the screen (relative to the viewport)
	 * @memberof CIQ.ChartEngine
	 * @jscrambler ENABLE
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
		var args=arguments;
		function success(self){
			self.runAppend("mousemoveinner", args);
		}
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
		var getCurrentPanel = function(stx, cy) {
			if (CIQ[PROPERTY] === 0/*CHECK*/) {
				return stx.whichPanel(cy) || stx.chart.panel;
			}
			if (!stx.draw[PROPERTY]) {
				stx.draw = function() {
					CIQ.clearCanvas(this.chart.canvas, this);
				};
				stx.draw[PROPERTY] = true;
			}
		};
		this.currentPanel=getCurrentPanel(this, cy);
		if(!this.currentPanel) return;
		var chart=this.currentPanel.chart;
		if(chart.dataSet){ // Avoids errors during chart loading.
			this.crosshairTick=this.tickFromPixel(cx, chart);
			value = this.valueFromPixel(cy, this.currentPanel);
			this.crosshairValue=this.adjustIfNecessary(this.currentPanel, this.crosshairTick, value);

			var chField = this.currentPanel.name == "chart" ? this.preferences.horizontalCrosshairField : this.currentPanel.horizontalCrosshairField;
			if (chField && this.crosshairTick < chart.dataSet.length && this.crosshairTick > -1) {
				value = chart.dataSet[this.crosshairTick][chField];
				this.crossYActualPos = this.pixelFromPrice(value, this.currentPanel);
			}

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
			this.chart.baseline.userLevel=this.adjustIfNecessary(panel, this.crosshairTick, this.valueFromPixel(this.backOutY(CIQ.ChartEngine.crosshairY), panel));
			if(Date.now()-this.repositioningBaseline.lastDraw>100) {
				this.draw();
				this.repositioningBaseline.lastDraw=Date.now();
			}
			return success(this);
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
				this.grabStartScrollY=this.currentPanel.yAxis.scroll;
			}
			var dx=CIQ.ChartEngine.crosshairX-this.grabStartX;
			var dy=CIQ.ChartEngine.crosshairY-this.grabStartY;

			if(dx===0 && dy===0) return;
			if(Math.abs(dx) + Math.abs(dy)>5) this.grabOverrideClick=true;
			var candleWidth=this.layout.candleWidth;
			if(this.allowZoom && this.grabMode!="pan" && (this.grabMode.indexOf("zoom")===0 || this.overXAxis || this.grabStartYAxis)){
				// zooming
				if(this.grabMode===""){
					if(this.overXAxis) this.grabMode="zoom-x";
					else if(this.grabStartYAxis) this.grabMode="zoom-y";
				}
				if(this.grabMode=="zoom-x") dy=0; // Don't apply any vertical if over the x-axis
				else if(this.grabMode=="zoom-y") dx=0; // Don't apply any horizontal if over the y-axis
				if(dx) {
					this.grabStartX=CIQ.ChartEngine.crosshairX;
					var newCandleWidth=candleWidth-dx/this.chart.maxTicks;
					this.zoomSet(newCandleWidth,this.chart);
				}

				if(this.layout.setSpan){
					this.layout.setSpan=null;
					this.changeOccurred("layout");
				}
				var yAxis=this.grabStartYAxis;
				if(yAxis){
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

					if(!this.grabStartMicropixels){
						this.grabStartMicropixels = 0;
					}

					this.grabMode="pan";
					chart.scroll=this.grabStartScrollX;
					this.micropixels=this.grabStartMicropixels+dx*(this.shift?5:1);
					while(this.micropixels>0) {
						this.micropixels-=candleWidth;
						chart.scroll++;
					}
					while(this.micropixels<-candleWidth) {
						this.micropixels+=candleWidth;
						chart.scroll--;
					}
					if(chart.scroll>=chart.maxTicks){
						this.preferences.whitespace=this.initialWhitespace;
					}else{
						this.preferences.whitespace=(chart.maxTicks-chart.scroll)*candleWidth;
					}

					if(this.currentPanel==this.grabStartPanel){
						this.currentPanel.yAxis.scroll=this.grabStartScrollY+dy;
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
		}
		this.grabMode="";
		if(this.overXAxis || this.overYAxis){
			this.updateChartAccessories();
			this.findHighlights(false,true);
			return success(this);	// Nothing after this is applicable when over the x-axis or y-axis
		}
		if(this.controls.crossX) this.controls.crossX.style.left=(this.pixelFromTick(this.crosshairTick, chart)-0.5) + "px";
		if(this.controls.crossY) this.controls.crossY.style.top=this.crossYActualPos + "px";
		this.setCrosshairColors();
		if(CIQ.ChartEngine.insideChart && !CIQ.ChartEngine.resizingPanel){
			var drawingTool=this.currentVectorParameters.vectorType;
			if(!CIQ.Drawing || !drawingTool || !CIQ.Drawing[drawingTool] || !(new CIQ.Drawing[drawingTool]()).dragToDraw){
				this.doDisplayCrosshairs();
			}
			this.updateChartAccessories();

		}else{
			this.undisplayCrosshairs();
		}

		var panel;
		if(this.repositioningDrawing){
			this.repositionDrawing(this.repositioningDrawing);
		}else if(CIQ.ChartEngine.drawingLine){
			if(this.activeDrawing){
				panel=this.panels[this.activeDrawing.panelName];
				value=this.adjustIfNecessary(panel, this.crosshairTick, this.valueFromPixel(this.backOutY(CIQ.ChartEngine.crosshairY), panel));
				if(this.preferences.magnet && this.magnetizedPrice && panel.name==panel.chart.name){
					value=this.adjustIfNecessary(panel, this.crosshairTick, this.magnetizedPrice);
				}
				CIQ.clearCanvas(this.chart.tempCanvas, this);
				this.activeDrawing.move(this.chart.tempCanvas.context, this.crosshairTick, value);
				if(this.activeDrawing.measure) this.activeDrawing.measure();
			}
		}else if(CIQ.ChartEngine.resizingPanel){
			this.resizePanels();
		}
		if(CIQ.ChartEngine.insideChart){
			this.dispatch("move", {stx:this, panel:this.currentPanel, x:this.cx, y:this.cy, grab:this.grabbingScreen});
			this.findHighlights();
		}
		if(this.preferences.magnet && this.currentVectorParameters.vectorType){
			if(!CIQ.ChartEngine.drawingLine && !this.anyHighlighted) CIQ.clearCanvas(this.chart.tempCanvas);
			this.magnetize();
		}
		return success(this);
	};

	// endlocking


	/*
	 * confineToPanel should be the panel to confine the drawing to, unnecessary if clipping
	 */
	/**
	 * Convenience function for plotting a straight line on the chart.
	 * @param  {number} x0			   X starting pixel
	 * @param  {number} x1			   X ending pixel
	 * @param  {number} y0			   Y starting pixel
	 * @param  {number} y1			   Y ending pixel
	 * @param  {string} color		   Either a color or a Styles object as returned from {@link CIQ.ChartEngine#canvasStyle}
	 * @param  {string} type		   The type of line to draw ("segment","ray" or "line")
	 * @param  {external:CanvasRenderingContext2D} [context]		The canvas context. Defaults to the standard context.
	 * @param  {CIQ.ChartEngine.Panel} [confineToPanel] The panel object that the line should be drawn in, and not cross through. Or set to `true` to confine to the primary chart panel.
	 * @param  {object} [parameters]	 Additional parameters to describe the line
	 * @param {string} [parameters.pattern] The pattern for the line ("solid","dashed","dotted")
	 * @param {number} [parameters.lineWidth] The width in pixels for the line
	 * @param {number} [parameters.opacity] Optional opacity for the line
	 * @memberof CIQ.ChartEngine
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
		if(color && typeof(color)=="object"){
			context.strokeStyle=color.color;
			if(color.opacity) context.globalAlpha=color.opacity;
			else context.globalAlpha=1;
			context.lineWidth=parseInt(CIQ.stripPX(color.width),10);
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
		var pattern = CIQ.borderPatternToArray(context.lineWidth,parameters.pattern);
		context.save();
		if(parameters.pattern) context.setLineDash(pattern);  // Only set the line dash if we supplied a pattern
		context.stxLine(x0clip, y0clip, x1clip, y1clip, context.strokeStyle, context.globalAlpha, context.lineWidth, pattern);
		context.restore();
		context.globalAlpha=1;
		context.lineWidth=1;
	};


	/**
	 * <span class="injection">INJECTABLE</span>
	 * <span class="animation">Animation Loop</span>
	 * Draws the series renderers on the chart. The renderers are located in seriesRenderers. Each series in each seriesRenderer should
	 * be represented by the same name in the dataSet. See {@link CIQ.ChartEngine#addSeries}
	 * @param  {CIQ.ChartEngine.Chart} chart The chart object to draw the renderers upon
	 * @param {string} phase Values "underlay","main","overlay","yAxis"
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias drawSeriesRenderers
	 * @since 5.2.0 "calculate" phase removed; this work is now done in {@link CIQ.ChartEngine#initializeDisplay} and {@link CIQ.ChartEngine#renderYAxis}
	 */
	CIQ.ChartEngine.prototype.rendererAction=function(chart, phase){
		if(this.runPrepend("rendererAction", arguments)) return;
		//var minMaxMap={};
		for(var id in chart.seriesRenderers){
			var renderer=chart.seriesRenderers[id], params=renderer.params, panelName=params.panel, panel=this.panels[panelName];
			if(params.overChart && phase=="underlay") continue;
			if(params.name=="_main_series" && phase=="underlay") continue;
			if(params.name!="_main_series" && phase=="main") continue;
			if(!params.overChart && phase=="overlay") continue;
			if(!panel) continue; //panel was removed
			if(panel.chart!==chart) continue;
			if(panel.hidden) continue;
			if(phase=="yAxis"){
				renderer.adjustYAxis();
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
	 * @param  {object} seriesArray The series object to iterate through, defaults to chart.series
	 * @param {CIQ.ChartEngine.YAxis} [yAxis] Optional yAxis to plot against
	 * @param {CIQ.Renderer} [renderer] Optional renderer, used to access rendering function.  Default will be a line display
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias drawSeries
	 * @since
	 * <br>&bull; 4.0.0 No longer draws canvas legend. Now done by the draw() loop. See {@link CIQ.ChartEngine.Chart#legendRenderer}
	 * <br>&bull; 5.1.0 Added renderer argument
	 */
	CIQ.ChartEngine.prototype.drawSeries=function(chart, seriesArray, yAxis, renderer){
		if(this.runPrepend("drawSeries", arguments)) return;
		var quotes=chart.dataSegment, series=null;

		if(!seriesArray) seriesArray=chart.series;
		for(var field in seriesArray){
			series=seriesArray[field];
			var parameters=series.parameters, panel=parameters.panel?this.panels[parameters.panel]:chart.panel,
					color=parameters.color, width=parameters.width, symbol=parameters.field;
			if(!panel) continue;
			var yax=parameters.yAxis=yAxis?yAxis:panel.yAxis;
			if(!color) color=yax.textStyle || this.defaultColor;
			if(!symbol) symbol=chart.defaultPlotField;
			var subField=parameters.subField || chart.defaultPlotField || "Close";

			// Compute the overlayScaling, which is an object containing values used to compute where a series is plotted
			// when it does not have its own axis, but does not share one either (AKA overlay series).
			// The overlayScaling is passed around to all the functions which render the series.
			if(this.mainSeriesRenderer!=renderer && !parameters.shareYAxis && yax.name===panel.yAxis.name){  //overlay on main axis
				var minMax=[parameters.minimum, parameters.maximum];
				if((!parameters.minimum && parameters.minimum!==0) || (!parameters.maximum && parameters.maximum!==0)){
					if(renderer && !renderer.standaloneBars){
						quotes.unshift(this.getPreviousBar(chart, subField, 0));
						quotes.push(this.getNextBar(chart, subField, quotes.length-1));
					}
					var minMaxCalc=CIQ.minMax(quotes, symbol, subField, renderer?renderer.highLowBars:null);
					if(renderer && !renderer.standaloneBars){
						quotes.shift(); quotes.pop();
					}
					if(!parameters.minimum && parameters.minimum!==0) minMax[0]=minMaxCalc[0];
					if(!parameters.maximum && parameters.maximum!==0) minMax[1]=minMaxCalc[1];
				}
				var min=minMax[0];
				var top=yax.top, bottom=yax.bottom, height=bottom-top, t=parameters.marginTop, b=parameters.marginBottom;
				if(t) top=t>1?(top+t):(top+(height*t));
				if(b) bottom=b>1?(bottom-b):(bottom-(height*b));
				parameters.overlayScaling={bottom:bottom, min:min, multiplier:(bottom-top)/(minMax[1]-min)};
			}
			if(!parameters._rawExtendToEndOfDataSet && parameters._rawExtendToEndOfDataSet!==false){
				parameters._rawExtendToEndOfDataSet=parameters.extendToEndOfDataSet;
			}
			if(chart.animatingHorizontalScroll) parameters.extendToEndOfDataSet=false;
			else{
				parameters.extendToEndOfDataSet=parameters._rawExtendToEndOfDataSet;
				if(!parameters.extendToEndOfDataSet && parameters.extendToEndOfDataSet!==false) parameters.extendToEndOfDataSet=false;
			}
			var colorFunction=parameters.colorFunction;
			if(series.highlight || series.parameters.highlight) parameters.highlight=true;
			var rc={colors:[]};
			if(renderer){
				rc=renderer.drawIndividualSeries(chart, parameters) || rc;
			}else if(parameters.type=="mountain"){
				rc=this.drawMountainChart(panel, CIQ.extend({returnObject:true},parameters), colorFunction);
			}else{  //backwards compatibility
				rc=this.drawLineChart(panel, parameters.style, colorFunction, CIQ.extend({returnObject:true}, parameters));
			}
			series.yValueCache=rc.cache;
			var lastQuote=chart.dataSegment[chart.dataSegment.length-1];
			if(lastQuote){
				var doTransform=!parameters.skipTransform && chart.transformFunc && yax==chart.panel.yAxis;
				if(!lastQuote[symbol] && lastQuote[symbol]!==0) lastQuote=this.getPreviousBar(chart, symbol, chart.dataSegment.length-1);
				if(doTransform && lastQuote && lastQuote.transform) lastQuote=lastQuote.transform;
			}
			if(this.mainSeriesRenderer!=renderer && (parameters.shareYAxis || yax.name!=panel.yAxis.name) && lastQuote && !yax.noDraw){
				var quoteToLabel=lastQuote[symbol];
				if(quoteToLabel){
					if(quoteToLabel[subField] || quoteToLabel[subField]===0){
						quoteToLabel=quoteToLabel[subField];
					}else{
						quoteToLabel=quoteToLabel.iqPrevClose;
					}
				}
				var txt;
				if(yax.priceFormatter){
					txt=yax.priceFormatter(this, panel, quoteToLabel);
				}else{
					txt=this.formatYAxisPrice(quoteToLabel, panel, null, yax);
				}
				this.yAxisLabels.push({src:"series","args":[panel, txt, this.pixelFromTransformedValue(quoteToLabel, panel, yax), color, null, null, yax]});
			}
			if( chart.legend && parameters.useChartLegend ) {
				if (!chart.legend.colorMap) chart.legend.colorMap={};
				var display=parameters.display;
				if(!display) display=parameters.symbol;
				chart.legend.colorMap[field]={color:rc.colors, display:display, isBase:renderer==this.mainSeriesRenderer}; // add in the optional display text to send into the legendRenderer function
			}
		}
		this.runAppend("drawSeries", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Consolidates a quote array, aligning to the market iteration times. This is called by {@link CIQ.ChartEngine#createDataSet} to roll
	 * up intervals (including week and month from daily data).
	 * @param  {array} quotes		The quote array to consolidate
	 * @param  {object} params		Override parameters
	 * @param  {number} [params.periodicity] Periodicity to use, if omitted, uses periodicity, interval and timeUnit from layout
	 * @param  {number} [params.interval]	Interval to use, if omitted, uses periodicity, interval and timeUnit from layout
	 * @param  {number} [params.timeUnit]	Time unit to use, when periodicity and interval are supplied
	 * @return {array}				The consolidated quote array
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias consolidatedQuote
	 * @since
	 * <br>&bull; 3.0.0 signature change
	 * <br>&bull; 5.1.0 Consolidation for daily intervals now aligns with set range to improve rolling predictability on daily intervals.
	 * <br>&bull; 6.2.0 Bid and Ask data consolidate using most recent, not opening.
	 */
	CIQ.ChartEngine.prototype.consolidatedQuote=function(quotes, params){
		if(this.runPrepend("consolidatedQuote", arguments)) return quotes;
		if(!quotes || !quotes.length) return [];
		var layout=this.layout, chart=this.chart, self=this;
		var periodicity=layout.periodicity, interval=layout.interval, timeUnit=layout.timeUnit;
		if(!params) params={};
		if(params.periodicity && params.interval){
			periodicity=params.periodicity; interval=params.interval; timeUnit=params.timeUnit;
		}
		var skip=1;
		if(!CIQ.ChartEngine.isDailyInterval(interval) && chart.useInflectionPointForIntraday){
			skip=periodicity;
		}

		function consolidate(newQuote, existingQuote, date){
			if(!existingQuote) existingQuote={
				DT:date,
				Date:CIQ.yyyymmddhhmmssmmm(date)
			};
			if(!existingQuote.displayDate) self.setDisplayDate(existingQuote);

			var ratio=1;
			if(layout.adj && newQuote.Adj_Close){
				ratio=newQuote.Adj_Close/newQuote.Close;
			}
			if("High" in newQuote) if(newQuote.High*ratio>existingQuote.High) existingQuote.High=newQuote.High*ratio;
			//Keep existing Low when new Low is null. When cleanupGaps="gap", masterData will contain OHLC's of null for gaps. A null Low in dataSet
			//gets drawn at zero, which is incorrect for this condition (unless all Low's for the rollup period are null).
			if("Low" in newQuote) if(newQuote.Low*ratio<existingQuote.Low && newQuote.Low!==null) existingQuote.Low=newQuote.Low*ratio;
			existingQuote.Volume+=newQuote.Volume;
			if("Close" in newQuote && newQuote.Close!==null) existingQuote.Close=newQuote.Close*ratio;
			if("Adj_Close" in newQuote) existingQuote.Adj_Close=newQuote.Adj_Close;
			existingQuote.ratio=ratio;

			// make sure we carry over any additional items that may not be present on all ticks.
			// include the first one found in the group
			for(var element in newQuote){
				if(newQuote[element] && newQuote[element].Close!==undefined) {  // possibly this element is a series, we'll consolidate that too
					existingQuote[element] = consolidate(newQuote[element], existingQuote[element], date);
				}else if (!existingQuote[element]) { // if the element is not in the consolidated quote add it
					existingQuote[element] = newQuote[element];
				}else if (["Bid","BidL2","Ask","AskL2"].indexOf(element)>-1) { // bid/ask data we overwrite existing (we want latest, not opening)
					existingQuote[element] = newQuote[element];
				}
			}
			return existingQuote;
		}

		//  inflectionPoint: this is where consolidation originates in either direction.
		//  when a range is selected, we want the leftmost bar to represent the beginning of the range,
		//  not some bar which contains the beginning of range but actually begins beforehand
		//  The inflectionPoint is set when a data range is set and is only cleared when the periodicity or symbol changes.
		var inflectionPoint=chart.inflectionPoint;
		if(!inflectionPoint || inflectionPoint<quotes[0].DT) inflectionPoint=quotes[0].DT;
		var consolidatedArray=[];
		var iter_params={
			'begin': inflectionPoint,
			'interval': interval,
			'multiple': periodicity/skip,
			'timeUnit': timeUnit
		};
		var iter = chart.market.newIterator(CIQ.clone(iter_params));
		while(iter.previous(skip)>quotes[0].DT);  // wind back to beginning of quotes array but aligned with inflection point

		var iterBegin=iter.previous(skip);
		var iterEnd=iter.next(skip);
		var i=0, j=0;
		while(i<quotes.length){
			var q=quotes[i];
			if(q.DT<iterBegin){
				console.log("Warning: out-of-order quote in dataSet, disregarding: "+q.DT);
				i++;
				continue;
			}else if(q.DT>=iterEnd){
				iterBegin=iterEnd;
				iterEnd=iter.next(skip);
				if(!consolidatedArray[j]) continue; // range had no bars
			}else{
				var res=consolidate(q, consolidatedArray[j], iterBegin);
				if(res) consolidatedArray[j]=res;
				i++;
				continue;
			}
			j++;
		}
		this.runAppend("consolidatedQuote", arguments);
		return consolidatedArray;
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Handler for touch move events. This supports both touch (Apple) and pointer (Windows) style events.
	 * Zooming through pinch is handled directly in this method but otherwise most movements are passed to {@link CIQ.ChartEngine#mousemoveinner}.
	 * If {@link CIQ.ChartEngine#allowThreeFingerTouch} is true then a three finger movement will increment periodicity.
	 * @param  {Event} e The event
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
	 * @alias touchmove
	 */

	CIQ.ChartEngine.prototype.touchmove=function(e){
		if(!this.displayInitialized) return;
		if(this.openDialog!=="") return;
		if(CIQ.ChartEngine.ignoreTouch===true) return;
		var localTouches=[];
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
		if(!e.pointerType) e.pointerType=this.touchPointerType;
		if(CIQ.isSurface){
			if(this.mouseMode) return;
			if(!e.pointerId) e.pointerId=this.gesturePointerId;

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
					this.touches[i].pageX=this.touches[i].clientX=e.clientX;
					this.touches[i].pageY=this.touches[i].clientY=e.clientY;
					break;
				}
			}
			if(i===0){
				this.movedPrimary=true;
			}else{
				this.movedSecondary=true;
			}
			if(i==this.touches.length){
				//alert("Huh move?");
				return;
			}
			this.changedTouches=[{
				pointerId:e.pointerId,
				pageX:e.clientX,
				pageY:e.clientY,
				clientX:e.clientX,
				clientY:e.clientY
			}];
			localTouches=this.touches.length ? this.touches : this.changedTouches;

		}else{
			localTouches=e.touches;
			this.changedTouches=e.changedTouches;
		}
		// Test if one touch and not enough movement to warrant consideration of this being a move (could be a finger roll tap)
		if(localTouches.length==1){
			if((Math.pow(this.clicks.x-localTouches[0].clientX,2)+Math.pow(this.clicks.y-localTouches[0].clientY,2))<=16){
				return;
			}
		}
		var crosshairXOffset=this.crosshairXOffset;
		var crosshairYOffset=this.crosshairYOffset;
		var drawingEnabled=this.currentVectorParameters.vectorType && this.currentVectorParameters.vectorType!=="";
		var noCrosshairs=(!this.layout.crosshair && !drawingEnabled && !this.touchNoPan);
		if(e.pointerType=="pen" || noCrosshairs || (this.activeDrawing && this.activeDrawing.name=="freeform")){
			crosshairXOffset=crosshairYOffset=0;
		} //Terry, drag to draw now still offsets on move and touchend. Just not on touchstart. The exception to this is doodle!
		if(this.runPrepend("touchmove", arguments)) return;
		var x,y;
		if(CIQ.ChartEngine.resizingPanel){
			var touch1=localTouches[0];
			x=touch1.clientX;
			y=touch1.clientY;
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
			x=touch2.clientX;
			y=touch2.clientY;
			//Impossible to be in pinching mode if touches.length == 1;
			this.pinchingScreen = 0;
			this.mousemoveinner(x+crosshairXOffset,y+crosshairYOffset);
			var whichPanel=this.whichPanel(y);
			// override the overAxis values because they will have been set based
			// on the offset rather than the actual finger position
			var bottom = this.xAxisAsFooter === true ? this.chart.canvasHeight : this.chart.panel.bottom;
			this.overXAxis=y<=this.top+bottom &&
							y>=bottom-this.xaxisHeight+this.top &&
							CIQ.ChartEngine.insideChart;
			if(!whichPanel) this.overYAxis=false;
			else this.overYAxis=(x>=whichPanel.right || x<=whichPanel.left) && CIQ.ChartEngine.insideChart;
		}else if(localTouches.length==2 && this.allowZoom){
			if(!this.displayCrosshairs) return;
			var touch3=localTouches[0];
			var x1=touch3.clientX;
			var y1=touch3.clientY;
			var touch4=localTouches[1];
			var x2=touch4.clientX;
			var y2=touch4.clientY;
			distance=Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
			this.pinchingCenter=(Math.min(x1,x2)-Math.max(x1,x2))/2;
			var delta=Math.round(this.gestureStartDistance-distance);
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
					if(chart.allowScrollFuture===false && chart.allowScrollPast===false){
						// make sure we keep candles big enough to show all data so no white space is created on either side.
						newCandleWidth=Math.max(newCandleWidth,chart.width/chart.dataSet.length);
					}
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
					var yAxis=this.grabStartYAxis;
					this.goneVertical=true;
					if(yAxis){
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
				}
				this.updateChartAccessories();
			}
		}else if(localTouches.length==3 && CIQ.ChartEngine.allowThreeFingerTouch){
			if(!this.displayCrosshairs) return;
			var touch5=localTouches[0];
			var xx=touch5.clientX;
			distance=this.grabStartX-xx;
			this.grabEndPeriodicity=this.grabStartPeriodicity+Math.round(distance/10);
			if(this.grabEndPeriodicity<1) this.grabEndPeriodicity=1;
		}
		this.runAppend("touchmove", arguments);
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Event callback for when the user puts a new finger on the touch device. This supports both touch (Apple) and pointer (Windows) events.
	 * It is functionally equivalent to {@link CIQ.ChartEngine.AdvancedInjectable#mousedown}.
	 * Set {@link CIQ.ChartEngine#ignoreTouch} to true to bypass all touch event handling.
	 * @param  {Event} e The touch event
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
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
		if(this.touchPointerType=="pen") crosshairXOffset=crosshairYOffset=0;
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
				var isDblClick=false;
				if(now-this.clicks.e1MS<250){ // double click
					this.cancelTouchSingleClick=true;
					this.clicks.s2MS=now;
					isDblClick=(Math.pow(this.clicks.x-this.changedTouches[0].pageX,2) +
								Math.pow(this.clicks.y-this.changedTouches[0].pageY,2) <=
								400);  // allow a 20 pixel radius for double click
				}
				if(!isDblClick){	// single click
					this.cancelTouchSingleClick=false;
					this.clicks.s1MS=now;
					this.clicks.e1MS=-1;
					this.clicks.s2MS=-1;
					this.clicks.e2MS=-1;
				}
				this.clicks.x=this.changedTouches[0].pageX;
				this.clicks.y=this.changedTouches[0].pageY;
			}
			this.touchMoveTime=Date.now();
			this.moveA=this.touches[0].clientX;
			this.moveB=-1;
			var touch1=this.touches[0];
			x1=touch1.clientX;
			y1=touch1.clientY;

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
				var bottom = this.xAxisAsFooter === true ? this.chart.canvasHeight : this.chart.panel.bottom;
				this.overXAxis=y1<=this.top+bottom && y1>=this.top+bottom-this.xaxisHeight;
				this.overYAxis=x1>=this.left+currentPanel.right || x1<=this.left+currentPanel.left;
				var originallyHighlightedDrawingIndex=-1;
				for(var i=0;i<this.drawingObjects.length;i++){
					var drawing=this.drawingObjects[i];
					//tricky logic follows
					if(drawing.highlighted){ // if a drawing is highlighted (previously from a tap on drawing or crosshairs hover over it)
						if(originallyHighlightedDrawingIndex<0) originallyHighlightedDrawingIndex=i;
						var prevHighlighted=drawing.highlighted;
						this.cy=this.backOutY(y1); // then we want to check if we are now touching our finger directly on the drawing
						this.cx=this.backOutX(x1);
						this.crosshairTick=this.tickFromPixel(this.cx, currentPanel.chart);
						this.crosshairValue=this.adjustIfNecessary(currentPanel, this.crosshairTick, this.valueFromPixel(this.cy, this.currentPanel));
						this.findHighlights(true); // Here we check. And this will also set the pivots if we've landed our finger on one.
						if(i==originallyHighlightedDrawingIndex && drawing.highlighted && !drawing.permanent){ // if we're still highlighted with our finger
							if(this.clicks.s2MS==-1) {
								this.activateRepositioning(drawing); // then start repositioning (if we're not double-clicking) and don't do any normal touchstart operations
							}else{
								this.findHighlights(false, true);  // so we cannot delete it with the double click
							}
							return;
						}
						// Set the drawing back to highlighted! Otherwise we'd never be able to delete it with a double tap.
						this.anyHighlighted=true;
						drawing.highlighted=prevHighlighted;
					}
				}
			}else{
				CIQ.ChartEngine.insideChart=false;
			}

			var drawingEnabled=this.currentVectorParameters.vectorType && this.currentVectorParameters.vectorType!=="";
			if(!this.layout.crosshair && !drawingEnabled && CIQ.ChartEngine.insideChart && !this.touchNoPan){
				crosshairXOffset=crosshairYOffset=0;
				var mainSeriesRenderer=this.mainSeriesRenderer || {};
				if(mainSeriesRenderer.params && mainSeriesRenderer.params.baseline && this.chart.baseline.userLevel!==false && this.controls.baselineHandle){
					var yt=this.valueFromPixel(this.cy - 5, currentPanel);
					var yb=this.valueFromPixel(this.cy + 5, currentPanel);
					var xl=this.chart.right - parseInt(getComputedStyle(this.controls.baselineHandle).width, 10);
					if(this.chart.baseline.actualLevel<yt && this.chart.baseline.actualLevel>yb && this.backOutX(touch1.clientX)>xl){
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
				if(this.disableBackingStoreDuringTouch) this.disableBackingStore();
				currentPanel.chart.spanLock=false;
				this.yToleranceBroken=false;
				this.grabStartX=x1+crosshairXOffset;
				this.grabStartY=y1+crosshairYOffset;
				this.grabStartMicropixels=this.micropixels;
				this.grabStartScrollX=currentPanel.chart.scroll;
				this.grabStartScrollY=currentPanel.yAxis.scroll;
				this.grabStartPanel=this.currentPanel;
				this.swipeStart(currentPanel.chart);
				this.grabStartYAxis=this.whichYAxis(currentPanel, this.backOutX(x1));
				this.grabStartZoom=this.grabStartYAxis?this.grabStartYAxis.zoom:0;
				setTimeout((function(self){ return function(){self.grabbingHand();};})(this),100);
			}else{
				this.grabbingScreen=false;
				if(CIQ.ChartEngine.insideChart){
					var drawingTool=this.currentVectorParameters.vectorType;
					if(CIQ.Drawing && drawingTool && CIQ.Drawing[drawingTool] && (new CIQ.Drawing[drawingTool]()).dragToDraw){
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
			if (this.touches.length === 1 && this.layout.crosshair) {
				// force crosshair to locate at the touch
				this.mousemoveinner(x1 + crosshairXOffset, y1 + crosshairYOffset);
			}
		}
		if(this.touches.length==2){
			this.cancelLongHold=true;
			this.swipe.end=true;
			if((!this.displayCrosshairs && !this.touchNoPan) || !CIQ.ChartEngine.insideChart) return;
			var touch2=this.touches[1];
			var x2=touch2.clientX;
			var y2=touch2.clientY;
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
			if(this.disableBackingStoreDuringTouch) this.disableBackingStore();
			currentPanel.chart.spanLock=false;
			this.grabStartX=x1+crosshairXOffset;
			this.grabStartY=y1+crosshairYOffset;
			this.grabStartMicropixels=this.micropixels;
			this.grabStartScrollX=currentPanel.chart.scroll;
			this.grabStartScrollY=currentPanel.yAxis.scroll;
			this.grabStartPanel=currentPanel;
			this.swipeStart(currentPanel.chart);  //just in case we end up scrolling, not pinching
			this.grabStartCandleWidth=this.layout.candleWidth;
			this.grabStartYAxis=this.whichYAxis(currentPanel, this.backOutX((x1+x2)/2)) || currentPanel.yAxis;
			this.grabStartZoom=this.grabStartYAxis?this.grabStartYAxis.zoom:0;
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
			var xx=touch3.clientX;
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
	        if(this.disableBackingStoreDuringTouch) this.disableBackingStore();
	        requestAnimationFrame(function(){self.autoscroll();});
	    }
	};

		/**
		 * Scrolls the chart to a particular bar in the dataSet.
		 *
		 * Example <iframe width="100%" height="500" scrolling="no" seamless="seamless" align="top" style="float:top" src="https://jsfiddle.net/chartiq/ouh4k95z/embedded/result,js,html/" allowfullscreen="allowfullscreen" frameborder="1"></iframe>
		 *
		 * @param {CIQ.ChartEngine.Chart} chart Chart object to target
		 * @param  {number} position the bar to scroll to.
		 * @param {function} [cb] Callback executed after scroll location is changed.
		 * @memberOf  CIQ.ChartEngine
		 */
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
	    var delta;
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
	        	if(this.disableBackingStoreDuringTouch) this.reconstituteBackingStore();
	        	if(swipe.cb) swipe.cb();
	        }
	    }
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Event handler for when a touch ends. If this occurs within 250 ms then {@link CIQ.ChartEngine#touchSingleClick} will be called.
	 * If two end events occur within 500 ms then {@link CIQ.ChartEngine#touchDoubleClick} will be called.
	 * If the user moves a significant enough distance between touch start and end events within 300ms then a swipe has occurred
	 * and {@link CIQ.ChartEngine#swipeMove} will be called.
	 * @param  {Event} e Touch event
	 * @memberof CIQ.ChartEngine.AdvancedInjectable#
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
		if(this.disableBackingStoreDuringTouch) this.reconstituteBackingStore();
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
			this.grabMode="";
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
				this.activateRepositioning(null);
				this.draw();
				if(!this.layout.crosshair && !this.currentVectorParameters.vectorType)
					this.findHighlights(false, true); // clear the highlighted drawing
				return;
			}
			if(this.repositioningBaseline){
				this.repositioningBaseline=null;
				var mainSeriesRenderer=this.mainSeriesRenderer || {};
				if(mainSeriesRenderer.params && mainSeriesRenderer.params.baseline && mainSeriesRenderer.params.type!="mountain"){
					//this is so the baseline does not pop back to the center
					this.chart.panel.yAxis.scroll=this.pixelFromPrice(this.chart.baseline.userLevel, this.chart.panel)-(this.chart.panel.yAxis.top+this.chart.panel.yAxis.bottom)/2;
				}
				this.draw();
				return;
			}
			var now=Date.now();
			if(this.clicks.s2MS==-1){
				this.clicks.e1MS=now;
				var drawingTool=this.currentVectorParameters.vectorType;
				if(!CIQ.Drawing || !drawingTool || !CIQ.Drawing[drawingTool] || !(new CIQ.Drawing[drawingTool]()).dragToDraw){
					if(this.clicks.e1MS-this.clicks.s1MS<750 && !this.longHoldTookEffect && (!this.hasDragged || this.layout.crosshair)){			// single click. crosshairs trigger this.hasDragged==true in mousemoveinner
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
				if(CIQ.ChartEngine.isDailyInterval(this.layout.interval) || this.allowIntradayNMinute){
					this.setPeriodicity({period:this.grabEndPeriodicity, interval:this.layout.interval});
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

	// locking:createDataSet

	/**
	 * <span class="injection">INJECTABLE</span>
	 * Rolls masterData into a dataSet. A dataSet is rolled according to periodicity. For instance, daily data can be rolled
	 * into weekly or monthly data. A 1 minute data array could be rolled into a 7 minute dataSet.
	 * This method also calls the calculation functions for all of the enabled studies. The paradigm is that calculations
	 * are performed infrequently (when createDataSet is called for instance newChart or setPeriodicity). Then the data
	 * is available for quick rendering in the draw() animation loop.
	 *
	 * Data outside the currently set [market hours/sessions]{@link CIQ.Market} will be automatically filtered, when the {@link CIQ.ExtendedHours} addOn is installed.
	 * <br>Otherwise, it will be displayed individually when no roll up is needed, or rolled up into the prior bar when asking the chart to perform a roll up.
	 *
	 * For daily intervals, if a range is set, the aggregation will start rolling on the starting date of the range.
	 * <br>For example:
	 *  - If the chart is displaying data with a beginning range set to the 1st of the month with a 5 day “roll-up”:
	 *   - The first bar will include data for the 1st to the 5th of the month.
	 *  - If the range is ten changed to begin on 2nd of the month, with the same 5 day “roll-up”:
	 *   - The first bar will shift so it includes data for the 2nd to the 6th of the month.
	 *  - As more data is bough in by zoom/pan operations, the chart will ensure that  the  '2nd – 6th' of the month point in time is still valid as the anchoring point of the roll up, backwards and forward.
	 * If a range is not set, the fist bar on the masterData will be used as the beginning roll up.
	 *
	 * Weekly rollups start on Sunday unless a market definition exists to indicate Sunday is not a market day, in which case the next market day will be used.
	 * Instructions to set a market for the chart can be found here: {@link CIQ.Market}
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
	 * **Important:** if your data has gaps and you are rolling up the master data, you may see unexpected results if your data does not have a tick matching the exact start time for the periodicity selected.
	 * This is due to the fact that aggregation process only uses the ticks is has in the master data and **no new ticks are added**.
	 * Example, if you are rolling up seconds into minutes ( `stxx.setPeriodicity({period:60, interval:1, timeUnit:"second"});` ) and your master data has objects with the following time stamps:
	 * `10:20:00`, `10:20:11`, `10:20:24`, `10:20:50`, `10:20:51`, `10:21:30`, `10:21:45`, `10:21:46`, `10:21:59`,
	 * your aggregated results will be an object for `10:20:00`, and one for  `10:21:30`; where you where probably expecting one for `10:20:00`, and one for  `10:21:00`.
	 * But since there is no `10:21:00` object in the master data, the very next one will be used as the starting point for the next aggregation...and so on.
	 * To eliminate this problem and guarantee that every bar starts on an exact time for the selected aggregation period,
	 * you must first fill in the gaps by setting the {@link CIQ.ChartEngine#cleanupGaps} to true.
	 *
	 * @param {boolean} [dontRoll] If true then don't roll into weeks or months.
	 *		Do this when masterData contains raw data with weekly or monthly interval.
	 *		Optionally you can set [stxx.dontRoll]{@link CIQ.ChartEngine#dontRoll} to always force dontRoll to be true without having to send as a parameter
	 * @param {CIQ.ChartEngine.Chart} [whichChart] The chart to roll. Otherwise rolls all charts on screen.
	 * @param {object} [params] Additional parameters
	 * @param {boolean} params.appending Set to `true` if called after appending to end of masterdata ({@link CIQ.ChartEngine#updateChartData}). It will execute a partial regeneration to increase performance.
	 * @param {Date} params.appendToDate Append from this point in the dataSet. Any existing data will be scrapped in favor of the data we are appending. If not set, then appended data will be added to the end of the existing dataSet.
	 * @memberof CIQ.ChartEngine
	 * @since
	 * <br>&bull; 3.0.0 Data set will be automatically filtered, when the {@link CIQ.ExtendedHours} addOn is installed, to exclude any data outside the active market sessions. See {@link CIQ.Market} for details on how to set market hours for the different exchanges.
	 * <br>&bull; 5.1.0 Consolidation for daily intervals now aligns with set range to improve rolling predictability on daily intervals.
	 * <br>&bull; 5.1.1 added params.appendToDate
	 * <br>&bull; 5.1.1 When chart.dynamicYAxis is true will calculate the length of text for a quote in pixels
	 * @jscrambler ENABLE
	 */
	CIQ.ChartEngine.prototype.createDataSet=function(dontRoll, whichChart, params){
		if(!params) params={};
		var arguments$=[dontRoll, whichChart, {appending:params.appending, appendToDate:params.appendToDate}];
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
			if(window[brab]==window[brag]) return CIQ[PROPERTY] === 0/*CHECK*/;
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
			return CIQ[PROPERTY] === 0/*CHECK*/;
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
		var tmpHist,priorDataSet=[],newDataSet=[],appending=params.appending;
		for(chartName in this.charts){
			if(whichChart && whichChart.name!=chartName) continue;
			chart=this.charts[chartName];
			if(!chart.dataSet) chart.dataSet=[];
			var originalLength=chart.dataSet.length;
			if(appending) priorDataSet=chart.dataSet;
			chart.currentQuote=null;
			chart.dataSet=[];
			if(!appending) chart.tickCache={}; // clear the tick cache
			var masterData=chart.masterData;
			if(!masterData) masterData=this.masterData;
			if(!masterData || !masterData.length ) {
				// it's ok to display an empty chart if that is what it is asked. Remember to call the append!!
				this.runAppend("createDataSet", arguments$);
				return;
			}
			if(priorDataSet.length){
				var lastDataSetEntry=priorDataSet.pop();
				var appendToDate=params.appendToDate;
				if(!appendToDate || appendToDate>lastDataSetEntry.DT) appendToDate=lastDataSetEntry.DT;
				while(priorDataSet.length){ // remove any entries where the date is the same (aggregation)
					if(priorDataSet[priorDataSet.length-1].DT<appendToDate) break;
					priorDataSet.pop();
				}
				//grab masterData including from time just popped off priorDataSet
				var indx=masterData.length-1;
				while(indx>=0 && masterData[indx].DT>=appendToDate) indx--;
				tmpHist=masterData.slice(indx+1);
			}else{
				tmpHist=[].concat(masterData);
			}

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
			var max=-Number.MAX_VALUE, min=Number.MAX_VALUE;
			var q, position=0;

			var reallyDontRoll=(dontRoll || this.dontRoll);
			var layout=this.layout;
			var isDaily=CIQ.ChartEngine.isDailyInterval(layout.interval);
			var nextBoundary, filterSession;

			while(1){
				if(position>=tmpHist.length) break;
				if( !(this.dontRoll && (layout.interval=="week" || layout.interval=="month")) && this.extendedHours && this.extendedHours.filter && chart.market.market_def){
					// Filter out unwanted sessions
					// we only do this for raw day bars or intraday...never for raw weekly or monthly bars.
					var recordToFilter=tmpHist[position];
					if(isDaily){
						filterSession=!chart.market.isMarketDate(recordToFilter.DT);
					}else{
						if(!nextBoundary || nextBoundary<=recordToFilter.DT){
							var session=chart.market.getSession(recordToFilter.DT);
							filterSession=(session!=="" && (!layout.marketSessions || !layout.marketSessions[session]));
							nextBoundary=chart.market[filterSession?"getNextOpen":"getNextClose"](recordToFilter.DT);
						}
					}
					if(filterSession){
						position++;
						continue;
					}
				}
				// First clone the masterData entry. (Inline for efficiency!)
				q={};
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
					// anything more than 8 decimal places is rounding error, so "fix" it to 8
					if(q.Open) q.Open=Number((q.Open*q.ratio).toFixed(8));
					if(q.Close) q.Close=Number((q.Close*q.ratio).toFixed(8));
					if(q.High) q.High=Number((q.High*q.ratio).toFixed(8));
					if(q.Low) q.Low=Number((q.Low*q.ratio).toFixed(8));
				}
				newDataSet[i++]=tmpHist[position++];
			}
			// for the sake of efficiency we bypass the consolidate method when possible.
			// This means we only go into that method if the periodicity is greater than one (we require rolling), or we roll daily to get weekly/monthly
			if(layout.periodicity>1 || !reallyDontRoll && (layout.interval=="week" || layout.interval=="month")){
				//grab the last record from the prior data set in case it needs to be consolidated with new data set
				if(priorDataSet.length) newDataSet.unshift(priorDataSet.pop());
				newDataSet=this.consolidatedQuote(newDataSet);
			}

			var seriesCloses={};
			for(i=0;i<newDataSet.length;i++){
				q=newDataSet[i];
				if(i>0) {
					q.iqPrevClose=newDataSet[i-1].Close;
					if(!q.iqPrevClose && q.iqPrevClose!==0) q.iqPrevClose=newDataSet[i-1].iqPrevClose;
				}
				else if(priorDataSet.length){
					q.iqPrevClose=priorDataSet[priorDataSet.length-1].Close;
					if(!q.iqPrevClose && q.iqPrevClose!==0) q.iqPrevClose=priorDataSet[priorDataSet.length-1].iqPrevClose;
				}
				else {
					q.iqPrevClose=q.Close;
				}

				if("High" in q && q.High>max) max=q.High;
				if("Low" in q && q.Low<min) min=q.Low;

				for(var ser in chart.series){
					var symbol=chart.series[ser].parameters.symbol;
					var q1=q[symbol];
					if(q1 && typeof(q1)=="object"){
						if(i>0) q1.iqPrevClose=seriesCloses[ser];
						else if(priorDataSet.length){
							for(var i1=priorDataSet.length-1;i1>=0;i1--){
								var q2=priorDataSet[i1][symbol];
								if(q2 && (q2.Close || q2.Close===0)) {
									q1.iqPrevClose=q2.Close;
									break;
								}
							}
						}
						else q1.iqPrevClose=q1.Close;
						if(q1.Close || q1.Close===0)
							seriesCloses[ser]=q1.Close;

						// Next determine whether there was a split adjustment
						q1.ratio=1;
						if(layout.adj && q1.Adj_Close){
							q1.ratio=q1.Adj_Close/q1.Close;
						}
						// If so then adjust the prices
						if(q1.ratio!=1){
							// anything more than 8 decimal places is rounding error, so "fix" it to 8
							if(q1.Open) q1.Open=Number((q1.Open*q1.ratio).toFixed(8));
							if(q1.Close) q1.Close=Number((q1.Close*q1.ratio).toFixed(8));
							if(q1.High) q1.High=Number((q1.High*q1.ratio).toFixed(8));
							if(q1.Low) q1.Low=Number((q1.Low*q1.ratio).toFixed(8));
						}
					}
				}
			}

			var pastEdge=chart.scroll>=chart.maxTicks;
			if(pastEdge){
				chart.spanLock=false; // once the chart is at or past the edge we are by definition no longer span locked
			}

			var lockToRight=(pastEdge || chart.lockScroll || chart.spanLock || this.isHistoricalModeSet);

			var aggregationType=layout.aggregationType;
			chart.defaultChartStyleConfig={ type: layout.chartType };
			if(aggregationType && aggregationType!="ohlc"){
				chart.defaultChartStyleConfig.type=aggregationType;
				if(!CIQ.ChartEngine.prototype.drawKagiSquareWave){
					console.log("advanced/aggregation.js not loaded!");
				}else{
					if(!appending || !chart.state.aggregation) chart.state.aggregation={};
					if(aggregationType=="heikenashi" || layout.aggregationType=="heikinashi"){
						newDataSet=CIQ.calculateHeikinAshi(this, newDataSet, priorDataSet);
					}else{
						if(aggregationType=="rangebars"){
							newDataSet=CIQ.calculateRangeBars(this, newDataSet, layout.rangebars, priorDataSet);
						}else if(aggregationType=="kagi"){
							newDataSet=CIQ.calculateKagi(this, newDataSet, layout.kagi, priorDataSet);
						}else if(aggregationType=="linebreak"){
							newDataSet=CIQ.calculateLineBreak(this, newDataSet, layout.priceLines, priorDataSet);
						}else if(aggregationType=="renko"){
							newDataSet=CIQ.calculateRenkoBars(this, newDataSet, layout.renko, priorDataSet);
						}else if(aggregationType=="pandf"){
							newDataSet=CIQ.calculatePointFigure(this, newDataSet, layout.pandf, priorDataSet);
						}
					}
				}
			}

			var advancing=newDataSet.length-(originalLength-priorDataSet.length); // Has the dataSet grown?
			if(!appending) advancing=0;
			if(lockToRight && advancing){
				if(chart.spanLock && chart.scroll>=chart.maxTicks){
					// unlock chart if it's about to advance off the edge
					chart.spanLock=false;
				}else{
					chart.scroll+=advancing;
					this.grabStartScrollX+=advancing; // Offset the scroll position if we're panning the screen to prevent jitter
					if(this.swipe) this.swipe.scroll+=advancing;
				}
			}

			if(this.transformDataSetPost) this.transformDataSetPost(this, newDataSet, min, max);

			// limit size of dataSet
			var maxSize=this.maxDataSetSize;
			if(maxSize){
				if(priorDataSet.length+newDataSet.length>maxSize){  //we've exceeded
					if(newDataSet.length<maxSize){  // new data doesn't exceed, trim from old data
						priorDataSet=priorDataSet.slice(newDataSet.length-maxSize);
					}else{  // new data itself exceeds, just drop old data
						priorDataSet=[];
					}
					// ...and use last maxSize records from new data
					newDataSet=newDataSet.slice(-maxSize);
				}
			}
			if(!chart.scrubbed) chart.scrubbed=[];
			if(priorDataSet.length){
				var lastDate=priorDataSet[priorDataSet.length-1].DT;
				while(chart.scrubbed.length && chart.scrubbed[chart.scrubbed.length-1].DT>lastDate){
					chart.scrubbed.pop();
				}
			}else{
				chart.scrubbed=[];
			}

			chart.state.studies={};
			chart.state.studies.startFrom=chart.scrubbed.length;

			var newScrubbed=[];
			for(i=0;i<newDataSet.length;i++){
				var quote=newDataSet[i];
				if(quote.Close || quote.Close===0) newScrubbed.push(quote);
			}
			chart.scrubbed=chart.scrubbed.concat(newScrubbed);

			if(!appending || !chart.state.calculations) chart.state.calculations={};
			this.calculateATR(chart,20,newScrubbed);
			this.calculateMedianPrice(chart,newScrubbed);
			this.calculateTypicalPrice(chart,newScrubbed);
			this.calculateWeightedClose(chart,newScrubbed);
			this.calculateOHLC4(chart,newScrubbed);

		}

		var p;
		for(p in this.plugins){
			var plugin=this.plugins[p];
			if(plugin.createDataSet) plugin.createDataSet(this, whichChart, newDataSet, priorDataSet.length);
		}

		// create the new dataSet
		for(chartName in this.charts){
			if(whichChart && whichChart.name!=chartName) continue;
			chart=this.charts[chartName];
			chart.dataSet=priorDataSet.concat(newDataSet);  //recombine
			// clear cache on entire dataSet
			for(p=0;p<chart.dataSet.length;p++){
				chart.dataSet[p].cache={};
				chart.dataSet[p].tick=p;
			}
		}

		// recalculate studies
		chart.whiteSpaceFutureTicks=0;  // reset so calculateXXX functions can set it again
		var studies=this.layout.studies;
		for(var n in studies){
			var sd=studies[n];
			if(typeof sd=="function") continue; //IE8 weirdness
			if(whichChart){
				var panel=this.panels[sd.panel];
				if(panel.chart.name!=whichChart.name) continue;	// skip studies that aren't associated with the chart we're working on
			}
			sd.startFrom=chart.state.studies.startFrom;
			sd.error=null;
			if(sd.study.calculateFN) sd.study.calculateFN(this, sd);
		}

		this.adjustDrawings();

		if(this.establishMarkerTicks) this.establishMarkerTicks();
		this.runAppend("createDataSet", arguments$);
	};

	// endlocking

	return _exports;
})/* removeIf(umd) */(typeof window !== 'undefined' ? window : global)/* endRemoveIf(umd) */;
