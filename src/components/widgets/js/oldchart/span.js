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
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for span.js.");
	}
})(function(_exports){
	var CIQ=_exports.CIQ;
	console.log("span.js",_exports);

	/**
	 * Sets a chart to the requested date range.
	 *
	 * When a quotefeed is attached to the chart (ver 04-2015 and up), and not enough data is available in masterData to render the requested range, setRange will request more from the feed.
	 * Also, if no periodicity (params.periodicity) is supplied in the parameters, **it may	 override the current periodicity** and automatically choose the best periodicity to use for the requested range. 
	 * So depending on your UI, **you may need to use the callback to refresh the periodicity displayed on your menu**.
	 * 
	 * Therefore, if you choose to let setRange set the periodicity, you should **not** call setPeriodicityV2 before or after calling this method.
	 * 
	 * **Note:** if the chart is in `tick` periodicity, the periodicity will be automatically selected even if one was provided because in `tick` periodicity we have no way to know how many ticks to get to fulfill the requested range.
	 *
	 * If there is no quotefeed attached (or using a version prior to 04-2015), then setRange will use whatever data is available in the masterData. So you must ensure you have preloaded enough to display the requested range.
	 *
	 * This function must be called after newChart() creates a datSet.
	 *
	 * **Note: ** versions prior to '2014-12-02' must use the legacy arguments : setRange(dtLeft, dtRight, padding, char, cb())
	 *
	 * @param {object} params  Parameters for the request
	 * @param {Date} [params.dtLeft] Date to set left side of chart. If no left date is specified then the right edge will be flushed, and the same interval and period will be kept causing the chart to simply scroll to the right date indicated. Must be in 'dataZone' time if one set. See {@link CIQ.ChartEngine#setTimeZone} and {@link CIQ.ChartEngine#convertToDataZone} for more details.
	 * @param {Date} [params.dtRight] Date to set right side of chart. Defaults to right now. Must be in 'dataZone' time if one set. See {@link CIQ.ChartEngine#setTimeZone} and {@link CIQ.ChartEngine#convertToDataZone} for more details.
	 * @param {number} [params.padding] Whitespace padding in pixels to apply to right side of chart after sizing for date range. If not present the current whiteSpace will be preserved. Set to 0 to remove whiteSpace.
	 * @param {CIQ.ChartEngine.Chart} [params.chart] Which chart, defaults to "chart"
	 * @param {boolean} [params.goIntoFuture] If true then the right side of the chart will be set into the future if dtRight is greater than last tick
	 * @param {boolean} [params.goIntoPast] If true then the left side of the chart will be set into the future if dtLeft is less than first tick
	 * @param {object} [params.periodicity] Override a specific periodicity combination to use with the range. Only available if a quoteFeed is attached to the chart. **Note:** if the chart is in `tick` periodicity, the periodicity will be automatically selected even if one was provided because in `tick` periodicity we have no way to know how many ticks to get to fulfill the requested range.
	 * @param {Number} [params.periodicity.period] Period as used by {@link CIQ.ChartEngine#setPeriodicityV2}
	 * @param {string} [params.periodicity.interval] An interval as used by {@link CIQ.ChartEngine#setPeriodicityV2}
	 * @param {string} [params.periodicity.timeUnit] A timeUnit as used by {@link CIQ.ChartEngine#setPeriodicityV2}
	 * @param {Number} [params.pixelsPerBar] Optionally override this value so that the auto-periodicity selected chooses different sized candles.
	 * @param {Function} [cb] Callback method. Will be called with the error retuned by the quotefeed, if any.
	 * @memberOf CIQ.ChartEngine
	 * @since 04-2015 params.rangePeriodicityMap and params.periodicity added as well as automatic integration with {@link CIQ.QuoteFeed}
	 * @since  TBC params.rangePeriodicityMap deprecated in favor of new automatic algorithm
	 * @example
	 * // this will display all of the available data in the current chart periodicity
    	stxx.setRange({
	        dtLeft: stxx.chart.dataSet[0].DT,
	        dtRight: stxx.chart.dataSet[stxx.chart.dataSet.length - 1].DT,
	        periodicity:{period:stxx.layout.periodicity,interval:stxx.layout.interval}
	    });
	 */
	CIQ.ChartEngine.prototype.setRange=function(params, cb){
		if(CIQ.isEmpty(params)){	// Handle legacy argument list implementation
			params={
					dtLeft: arguments[0],
					dtRight: arguments[1],
					padding: arguments[2],
					chart: arguments[3],
					goIntoFuture: false
			};
			cb = arguments[4];
		}
		
		if(!params.chart) params.chart=this.chart;
		if (typeof params.padding =="undefined") {
			// if no whitespace sent in , maintain exising ( different than sending 0 which will set to no whitespace )
			params.padding=this.preferences.whitespace;
		}
		var dontChangePeriodicity=false;
		var chart=params.chart;
		var lt=params.dtLeft;
		var rt= this.convertToDataZone(new Date());
		if(params.dtRight) rt=params.dtRight;
		if(!lt){ // If no left date then we want to just flush the right edge, and keep the same interval,period
			var iter=this.standardMarketIterator(rt, null, chart);
			lt=iter.previous(chart.maxTicks);
			if(!params.periodicity) dontChangePeriodicity=true;
		}

		var self=this;
		function showTheRange(err){
			if(typeof err=="undefined")	err= null;
			if(!chart.dataSet || chart.dataSet.length===0){
				if(cb) cb(err);
				return;
			}

			var l=0, r=0;
			var todaysDate = new Date();
			// range is day and interval is day
			if(params.base === 'day' && (params.periodicity && params.periodicity.interval === 'day')){
				// left bar is how many days the range is, or beginning of dataset
				var leftBar = chart.dataSet.length < params.multiplier ? 0 : chart.dataSet.length-params.multiplier;
				l=leftBar;
				r=chart.dataSet.length-1;
			}
			// if intraday range and last day in dataSet doesn't equal current day then show yesterday's data
			else if(params.base === 'today' && chart.dataSet[chart.dataSet.length - 1].DT.getDate() != todaysDate.getDate()){
				var leftDT = new Date(chart.dataSet[chart.dataSet.length - 1].DT.getTime());
				var rightDT = new Date(leftDT.getTime());

				for (var d = chart.dataSet.length-1; d>=0; d--) {
					if (chart.dataSet[d] && chart.dataSet[d].DT.getDate()!=leftDT.getDate()) {
						leftDT = new Date(chart.dataSet[d+1].DT);
						break;
					}
				}
				if (rightDT.getTime() == leftDT.getTime()) {
					leftDT = new Date(chart.dataSet[0].DT);
                }
				
				l=self.tickFromDate(leftDT, chart, null, true);
				r=self.tickFromDate(rightDT, chart);
			} 
			else{
				if(lt.getTime()>=chart.dataSet[0].DT.getTime() || params.goIntoPast){
					l=self.tickFromDate(lt, chart, null, true);
				}else{
					l=0;
				}
				if(rt.getTime()<=chart.dataSet[chart.dataSet.length-1].DT.getTime() || params.goIntoFuture){
					r=self.tickFromDate(rt, chart);
				}else{
					r=chart.dataSet.length-1;
				}
			}
			var ticks=r-l+1;

			if(ticks<1){
				if(cb) cb(err);
				return;
			}


			self.setCandleWidth((self.chart.width-params.padding)/ticks, chart);
			chart.scroll=(chart.dataSet.length-l+1);
			self.micropixels=0;
			//if(self.preferences.whitespace) self.preferences.whitespace=(chart.maxTicks-chart.scroll)*self.layout.candleWidth;
			self.draw();
			self.changeOccurred("layout");
			if(cb) cb(err);
		}

		var loadMoreCount=0; // safety valve to eliminate infinite loop
		function loadTheRange(err){
			if(err && loadMoreCount === 0){
				// change the periodicity, scroll and candle width back to original chart values
				// if our inital fetch from the quotefriver failed.
				self.chart.scroll = previousScroll;
				self.setCandleWidth(previousCandleWidth);
				self.layout.interval =  previousInterval;
				self.layout.periodicity = previousPeriodicity;
				self.layout.timeUnit= previousTimeUnit;
				if(cb) cb(err);
				return;
			}
			loadMoreCount++;
			if(loadMoreCount>10){
				console.log("CIQ.ChartEngine.setRange(): Too many loads (10) from server. Stopping. Check periodicity logic.");
				showTheRange();
				return;
			}
			if(chart.moreAvailable && chart.masterData[0].DT>lt){
				self.quoteDriver.checkLoadMore(chart, true, false, function(err){
					if(!err)
						loadTheRange();
					else 
						showTheRange(err); // if there was an error on a subsequent fetch, then show as much as we awere able to get.
				});
			}else{
				showTheRange();
			}
		}

		function estimateMaxTicks(rtMS, ltMS, interval,period, dontRoll){
			// how many ticks do we need at the requested periodicity to fill the screen
			var ticks=0;
			var ms=rtMS-ltMS;
			if(CIQ.ChartEngine.isDailyInterval(interval)){
				if(interval=="month"){
					ticks=(ms/CIQ.MONTH)/period;
				} else if(interval=="week"){
					ticks=(ms/CIQ.WEEK)/period;
				} else {
					ticks=(ms/CIQ.DAY)/period;
				}
			}else{
				if(!isNaN(interval)) ticks=(ms/(CIQ.MINUTE*interval))/period;
				else{
					if(interval=="millisecond") ticks=ms/period;
					else if(interval=="second") ticks=(ms/CIQ.SECOND)/period;
					else if(interval=="hour") ticks=(ms/CIQ.HOUR)/period;
					else ticks=(ms/CIQ.MINUTE)/period;
				}
			}
			return Math.round(ticks); // rough estimation...
		}

		if(this.quoteDriver){
			var intervalToUse, periodToUse, timeUnitToUse;
			if(dontChangePeriodicity){
				intervalToUse=this.layout.interval;
				timeUnitToUse=this.layout.timeUnit;
				periodToUse=this.layout.period;
			}else if(params.periodicity){
				// If the caller specifies the periodicity then we use that
				intervalToUse=params.periodicity.interval;
				timeUnitToUse=params.periodicity.timeUnit;
				periodToUse=params.periodicity.period;
			}else{
				// @deprecating rangePeriodicityMap but keeping here for backward compatibility
				// Users can accomplish the same thing by specifying their periodicity explicitly
				// Otherwise, accept a periodicity map to determine which periodicity & interval should be loaded for anything *up to* the given range of data
				// These should be ordered from smallest to largest.
				var rangeInMS=rt.getTime()-lt.getTime();
				if (params.rangePeriodicityMap) {
					var periodicityMap=params.rangePeriodicityMap;
					
					var entryToUse=null;
					// Cycle through the periodicity map looking for the closest fit
					for(var i=0;i<periodicityMap.length;i++){
						var mapEntry=periodicityMap[i];
						if(rangeInMS<=mapEntry.range){
							entryToUse=mapEntry;
							break;
						}
					}
					intervalToUse=entryToUse.interval;
					periodToUse=entryToUse.periodicity;
					timeUnitToUse=entryToUse.timeUnit;
				// Or use the default algorithm
				} else {
					var pixelsPerBar = 2;
					switch (this.layout.chartType) {
						case "line":
						case "colored_line":
						case "mountain":
						case "colored_mountain":
						case "baseline_delta":
						case "baseline_delta_mountain":
						case "wave":
							pixelsPerBar = 2;
							break;
						case "candle":
						case "bar":
						case "colored_bar":
						case "hollow_candle":
						case "volume_candle":
						case "scatterplot":
							pixelsPerBar = 5;
							break;
					}
					if(params.pixelsPerBar) pixelsPerBar=params.pixelsPerBar;
					
					var numBars = chart.width/pixelsPerBar;
					
					var possibleIntervals = [
						{ interval:1, ms: CIQ.MINUTE },
						{ interval:5, ms: CIQ.MINUTE*5 },
						{ interval:30, ms: CIQ.MINUTE*30 },
						{ interval:"day", ms: CIQ.DAY },
						{ interval:"month", ms: CIQ.MONTH },
						{ interval:"year", ms: Number.MAX_VALUE }
					];
				
					// default
					intervalToUse = possibleIntervals[0].interval;
					periodToUse = 1;

					var numBarsLastInterval;
					for (var j=0; j<possibleIntervals.length; j++) {
						var numBarsThisInterval = rangeInMS/possibleIntervals[j].ms;
						if (numBarsThisInterval<numBars) {
							if (possibleIntervals[j-1]) {
								intervalToUse = possibleIntervals[j-1].interval;
								periodToUse = Math.ceil(numBarsLastInterval/numBars);
								
							} else {
								intervalToUse = possibleIntervals[j].interval;
								periodToUse = 1;
							}
							break;
						}
						numBarsLastInterval = numBarsThisInterval;		
					}
				}
									
			}

			// maintain the previous values just in case an error is thrown when getting new data
			var previousScroll = this.chart.scroll;
			var previousCandleWidth = this.layout.candleWidth;
			var previousInterval = this.layout.interval;
			var previousPeriodicity= this.layout.periodicity;
			var previousTimeUnit = this.layout.timeUnit;
	
			// to prevent multiple fetches trying to get enough ticks for the selected range;
			// maxticks,scroll and  candleWidth are used in CIQ.ChartEngine.Driver.barsToFetch and checkLoadMore() to deduce the number of ticks to fill the screen.
			// So we need to set it here to prevent us from using the pre-setRange  values wich are not going to be right.
			// these are estimated, for the fetch, but will be properly recalculated by showTheRange();
			this.chart.scroll= this.chart.maxTicks= estimateMaxTicks(rt.getTime(),lt.getTime(), intervalToUse,periodToUse,this.dontRoll);
			this.layout.candleWidth = this.chart.width/this.chart.maxTicks;

			// logic to determine whether we have the right interval for what is needed
			var needDifferentData=this.layout.timeUnit!=timeUnitToUse && (timeUnitToUse=="seconds" || timeUnitToUse=="milliseconds");
			if(!needDifferentData && (CIQ.ChartEngine.isDailyInterval(this.layout.interval) !== CIQ.ChartEngine.isDailyInterval(intervalToUse))) needDifferentData=true;
			else if(!CIQ.ChartEngine.isDailyInterval(this.layout.interval) && this.layout.interval!=intervalToUse) needDifferentData=true;

			if(!this.chart.masterData || needDifferentData){
				this.layout.interval=intervalToUse;
				this.layout.periodicity=periodToUse;
				this.layout.timeUnit=timeUnitToUse;
				if(!this.layout.timeUnit){
					if(CIQ.ChartEngine.isDailyInterval(this.layout.interval)) this.layout.timeUnit=null;
					else if(this.layout.interval=="second") this.layout.timeUnit="second"; // backward compatibility with heatmap
					else if ( this.layout.interval!="tick") this.layout.timeUnit="minute";
				}
				var qparams={
					symbol:chart.symbol,
					symbolObject: chart.symbolObject,
					chart:chart,
					nodraw:true
				};
				if(this.layout.interval=="tick"){
					// for 'tick' periodcity we have to request a specific range instead of # of ticks,
					//since we can never be sure how many ticks will be in a particular range.
					qparams.startDate=lt;
					qparams.endDate=rt;
				}
				
				if ( !this .displayInitialized) qparams.initializeChart=true; //TODO, this is confusing to developers. They think it means newChart()
				this.quoteDriver.newChart(qparams, loadTheRange);
			}else{
				if(this.layout.interval!=intervalToUse || this.layout.periodicity!=periodToUse){
					this.layout.interval=intervalToUse;
					this.layout.periodicity=periodToUse;
					this.createDataSet();
				}
				loadTheRange();
			}
		}else{
			showTheRange();
		}
	};


	/**
	 * Sets the chart to display the requested span.
	 *
	 * setSpan makes use of {@link CIQ.ChartEngine#setRange} by converting the span requested into a date range.
	 * All parameters in setSpan will be sent into setRange (except if 'all' is requested), so you can pre-load things like `params.rangePeriodicityMap` in setSpan for setRange to use.
	 * Just keep in mind that if passing `periodicity.interval` and `periodicity.period` to be used in {@link CIQ.ChartEngine#setRange} , then **DO NOT** set `maintainPeriodicity` or it will not pass the requested periodicity.
	 *
	 * If a quotefeed is attached to the chart (ver 04-2015 and up), setSpan will attempt to gather more data from the feed (IF NEEDED) to fulfill the requested range AND **may override the periodicity** to provide the most optimal chart display. So depending on your UI, **you may need to use the callback to refresh the periodicity displayed on your menu**.
	 * Please see {@link CIQ.ChartEngine#setRange}	 and {@link CIQ.ChartEngine#displayAll} for complete details on how the periodicity is calculated.
	 * If 'all' data is requested {@link CIQ.ChartEngine#displayAll} is called first to ensure all quotefeed data for that particular instrument is loaded. Note that 'all' will display the data in `monthly` periodicity.
	 * Calling setPeriodicityV2 immediately after setting a span may cause all of the data to be re-fetched at a different periodicity than the one used by the requested span. Once you have set your initial periodicity for the chart, there is not need to manually change it when setting a new span unless you are using the `params.maintainPeriodicity` flag; in which case you want to call `setPeriodicityV2` **before** you set the span, so the setSpan call will use the pre-set periodicity.
	 * Setting a span to `params.multiplier:168` `params.span:'days'` or `params.multiplier:1` `params.span:'week'`, for example, is really the same thing; same span of time. If what you are trying to do is tell the chart how you want the raw data to be fetched, that is done with {@link stxChart.setPeriodicityV2} or by letting setSpan figure it out as described above.
	 * Remember that by default weekly and monthly data is calculated using daily raw ticks. If your feed returns data already rolled up in monthly or weekly ticks, you can override this behavior by setting `stxx.dontRoll` to `true` ( see {@link CIQ.ChartEngine#dontRoll}  and the **'Periodicity and your masterData'** section in the {@tutorial Data Loading} tutorial)
	 *
	 * **Note:** if the chart is in `tick` periodicity, the periodicity will be automatically selected even if it was requested to be maintained because in `tick` periodicity we have no way to know how many ticks to get to fulfill the requested range.
	 *
	 * If there is no quotefeed attached (or using a version prior to 04-2015), then setStan will use whatever data is available in the masterData. So you must ensure you have preloaded enough to display the requested range.
	 *
	 * This function must be called after newChart() creates a datSet, or together with newChart() by setting the proper parameter values. See example in this section and {@link CIQ.ChartEngine#newChart} for more details and compatibility with your current version.
	 *
	 * Setting `params.span` to "today" will cause the chart to display a market day but extend the chart all the way to market close (as per market hours set in the active market definition - see {@link CIQ.Market})
	 *
	 * **Note: ** versions prior to '2015-05-01' must use the legacy arguments : setSpan(multiplier, span, padding, char,useMarketTZ,cb), and related example in this section.
	 *
	 * @param {object} params Parameter for the function
	 * @param {number} params.multiplier   (params.period in legacy versions) Number of spans to show. To show 3 weeks of data, for example, set this to 3 and `params.span` to 'week'.
	 * @param {string} params.base (params.interval in legacy versions) The base span to show. "minute","hour","day","week","month","year","all", "ytd" or "today". ** These spans are market hours sensitive **, so if you ask for 1 hour, for example, at the time the markets are close, the span will find the last time the markets where open for the active symbol, and include the last market hour in the span. It will also exclude days when the market is closed. This span will be combined with the multiplier. Example 2 days, 4 months. Please note that "all" will attempt to load all of the data the quotefeed has available for that symbol. Use this span with caution.
	 * @param {string} params.span (backward compatibility synonym with base)
	 * @param {boolean} [params.maintainPeriodicity] If set to true, it will maintain the current periodicity for the chart instead of trying to select the most optimal periodicity for the selected range. See {@link CIQ.ChartEngine#setRange} for default rangePeriodicityMap. **Note:** if the chart is in `tick` periodicity, the periodicity will be automatically selected even if it was requested to be maintained because in `tick` periodicity we have no way to know how many ticks to get to fulfill the requested range.
	 * @param {number} [params.padding] Whitespace padding in pixels to apply to right side of chart after sizing for date range. If not set will default whitespace to 0.
	 * @param {boolean} [params.forceLoad] Forces a complete load (used by newChart)
	 * @param {CIQ.ChartEngine.Chart} [params.chart] Which chart, defaults to "chart"
	 * @param {Function} cb Optional callback
	 * @memberOf CIQ.ChartEngine
	 * @example
	 * // this displays 5 days. It can be called anywhere including buttons on the UI
	 *	stxx.setSpan ({
	 *		multiplier: 5,
	 *		span: "day",
	 *		padding: 30
	 *	});
	 * @example
	 * // this displays 2 days as the initial range when newChart is called
	 * stxx.newChart(
	 * 		newSymbol,
	 * 		null,
	 * 		null,
	 * 		finishedLoadingNewChart(
	 * 			stxx.chart.symbol,
	 * 			newSymbol
	 * 		),
	 * 		{
	 * 			span:{base:'day',multiplier:2},		// this parameter will cause newChart to call setSpan with these parameters
	 * 			periodicity:{period:1,interval:5}	// this parameter will cause newChart to call setPeriodicityV2 with these parameters
	 * 		}
	 * );
	 * @since
	 * <br>- 04-2015: added "all", "today", "ytd" and automatic integration with {@link CIQ.QuoteFeed}
	 * <br>- 15-07-01: params.period changed to params.multiplier for clarity
	 * <br>- 15-07-01: params.interval changed to params.span for clarity
	 * <br>- 05-2016-10: save the desired span in stxx.layout to be restored with the layout between sessions
	 */
	CIQ.ChartEngine.prototype.setSpan=function(params, cb) {
		var period = arguments[0];
		var interval = arguments[1];
		var padding = arguments[2];
		var chart = arguments[3];

		if(typeof params == "object"){
			period = params.period ? params.period : (params.multiplier ? params.multiplier : 1);
			interval = params.interval ? params.interval : (params.base ? params.base : (params.span ? params.span : params.period));
			padding = params.padding;
			chart = params.chart;
		}else{
			params = {
				period: period,
				interval: interval,
				padding: padding,
				chart: chart,
			};
			cb = arguments[5];
		}
		if(!params.padding) params.padding=0;

		if(!chart) chart=this.chart;

		interval=interval.toLowerCase();
		if(interval=="all") {
			this.displayAll(params, cb);
			return;
		}
		var iterInterval=interval;
		var iterPeriod=1;
		if(interval=="today"){
			iterInterval="day";
		}else if(interval=="year"){
			iterInterval="month";
			iterPeriod=12;
		}

		var parms_copy = CIQ.shallowClone(params);
		parms_copy.goIntoFuture = false;

		var iter_parms = {
			'begin': new Date(),
			'interval': iterInterval,
			'period': iterPeriod,
			//'inZone': this.dataZone, default to browser timezone since we are just setting 'begin' in new Date()
			'outZone': this.dataZone
		};
		var iter = chart.market.newIterator(iter_parms);
		var leftDT = this.convertToDataZone(new Date());

		function zeroDT(dt){
			dt.setHours(0);
			dt.setMinutes(0);
			dt.setSeconds(0);
			dt.setMilliseconds(0);
			return dt;
		}
		if (interval === 'ytd') {
			leftDT=zeroDT(leftDT);
			leftDT.setMonth(0);
			leftDT.setDate(1);
		} else if(interval=== "today"){
			// forward and then back will land us on the most current valid market day
			iter.next();
			leftDT = iter.previous();
		} else if(interval === "month") {
			leftDT=zeroDT(new Date());
			leftDT.setMonth(leftDT.getMonth()-period);
		} else if(interval === "year") {
			leftDT=zeroDT(new Date());
			leftDT.setFullYear(leftDT.getFullYear()-period);
		} else if(interval === "week") {
			leftDT=zeroDT(new Date());
			leftDT.setDate(leftDT.getDate()-(period*7));
		} else if(interval === "day" && period==1) {
			// Special case, 1 "day" will start from same time on previous market close
			// 2 or more days will always start from market open of prior days (next else)
			var h=leftDT.getHours();
			var m=leftDT.getMinutes();
			var s=leftDT.getSeconds();
			var mm=leftDT.getMilliseconds();
			leftDT = iter.previous();
			leftDT.setHours(h);
			leftDT.setMinutes(m);
			leftDT.setSeconds(s);
			leftDT.setMilliseconds(mm);
		} else {
			leftDT = iter.previous(period-1);
		}
		parms_copy.dtLeft = leftDT;
		if (interval === 'today') {
			parms_copy.goIntoFuture = true;
			parms_copy.dtRight = new Date(leftDT);
			var closeHour=iter.market.zclose_hour;
			var closeMinute=iter.market.zclose_minute;
			parms_copy.dtRight.setHours(closeHour?closeHour:23);
			parms_copy.dtRight.setMinutes(closeHour?closeMinute:59); // not a typo!!!
			parms_copy.dtRight.setSeconds(0);
			parms_copy.dtRight = chart.market._convertFromMarketTZ(parms_copy.dtRight, this.dataZone);

			parms_copy.dtLeft.setHours(iter.market.zopen_hour);
			parms_copy.dtLeft.setMinutes(iter.market.zopen_minute);
			parms_copy.dtLeft.setSeconds(0);
			parms_copy.dtLeft = chart.market._convertFromMarketTZ(parms_copy.dtLeft, this.dataZone);
		}
		if (parms_copy.maintainPeriodicity) {
			parms_copy.periodicity = {};
			parms_copy.periodicity.interval = this.layout.interval;
			parms_copy.periodicity.period = this.layout.periodicity;
		}
		chart.spanLock=false; // unlock left edge
		var self=this;
		this.setRange(parms_copy, function(err){
			if(!params.maintainPeriodicity){
				self.layout.setSpan={base:params.base, multiplier:params.multiplier};
				self.changeOccurred("layout");
			}
			if(interval=="today"){
				chart.spanLock=true; // lock left edge of screen, in callback after we have fetched!
			}
			if(cb) cb(err);
		});
	};

	//@private
	CIQ.ChartEngine.prototype.getSpanCandleWidth=function(span){
		var arr=span.split(",");
		if(arr.length<2) return;
		var num=parseFloat(arr[0]);
		var now=new Date();
		var prev=new Date();
		if(arr[1]=="year"){
			prev.setFullYear(prev.getFullYear() - num);
		}else if(arr[1]=="month"){
			prev.setMonth(prev.getMonth() - num);
		}else if(arr[1]=="day"){
			prev.setDate(prev.getDate() - num);
		}else if(arr[1]=="week"){
			prev.setDate(prev.getDate() - (7*num));
		}
		var diff=(now.getTime() - prev.getTime())/1000/60/60/24;
		diff=diff*5/7;
		var candleWidth=this.chart.width/diff;
		return candleWidth;
	};

	/**
	 * Sets a chart to display all data for a security. If the chart is driven by a QuoteFeed then it will first
	 * set the periodicity to a `daily` interval if not already set (`monthly` if the {@link CIQ.ChartEngine#dontRoll} flag is set) .
	 * It will then call QuoteDriver.loadAll() which makes multiple queries to ensure all data availabe from the quote feed is loaded.
	 * Once all the data is loaded, the chart will be set to cover that range using {@link CIQ.ChartEngine#setRange}
	 * @param {object} [params] Optional parameters in same format as {@link CIQ.ChartEngine#setSpan}.
	 * @param {Function} [cb] Callback, is called when chart is displayed.
	 * @since  04-2015
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.displayAll=function(params, cb){
		var chart=this.chart;
		if(params && params.chart) chart=params.chart;
		var self=this;
		function displayTheResults(){
			if( !chart.masterData || !chart.masterData.length) return;
			var p=CIQ.clone(params);
			p.dtLeft=chart.masterData[0].DT;
			p.dtRight=chart.masterData[chart.masterData.length - 1].DT;
			if (params.maintainPeriodicity) {
				p.periodicity = {};
				p.periodicity.interval = self.layout.interval;
				p.periodicity.period = self.layout.periodicity;
			}else if(params.periodicity){
				p.periodicity=params.periodicity;
			}
			self.setRange(p,function(err){
				if(!params.maintainPeriodicity){
					self.layout.setSpan={base:params.base, multiplier:params.multiplier};
					self.changeOccurred("layout");
				}
				self.home({whitespace:0});
				if(cb) cb(err);
			});
		}
		function loadAllTheData(){
			self.quoteDriver.loadAll(chart, displayTheResults);
		}

		// Case 1: push style quotes
		if(!this.quoteDriver){
			displayTheResults();
			return;
		}

		var previousDaily=CIQ.ChartEngine.isDailyInterval(this.layout.interval);

		var periodicity=params.maintainPeriodicity?{periodicity:this.layout.periodicity, interval:this.layout.interval}:{periodicity:1,interval:"month"};
		periodicity=params.periodicity?params.periodicity:periodicity;
		if(periodicity.period) periodicity.periodicity=periodicity.period; // setSpan,setRange unfortunately use period instead of periodicity
		this.layout.periodicity=periodicity.periodicity;
		this.layout.interval=periodicity.interval;
		this.layout.timeUnit=null;

		var nowDaily=CIQ.ChartEngine.isDailyInterval(this.layout.interval);

		// Case 2: new symbol
		if(params.forceLoad || nowDaily!=previousDaily){
			this.quoteDriver.newChart({noDraw:true, symbol:this.chart.symbol, symbolObject: this.chart.symbolObject, chart:this.chart, fetchMaximumBars: true}, loadAllTheData);
		}else{
			// Case 3, a daily interval is set but we don't have all the data
			if(chart.moreAvailable){
				loadAllTheData();
			}else{
				// Case 4, a daily interval is set and we have all the data
				this.createDataSet(); // Just in case the interval changed from month to day or vice versa
				displayTheResults();
			}
		}
	};

	return _exports;
});