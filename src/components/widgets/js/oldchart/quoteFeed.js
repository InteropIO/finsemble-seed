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
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for quoteFeed.js.");
	}
})(function(_exports){
	console.log("quoteFeed.js",_exports);
	var CIQ=_exports.CIQ;

	/**
	 * Base class for Quotes infrastructure. Many of the built in UI capabilities such as comparison charts and mult-symbol studies expect
	 * to follow this infrastructure. You should define your own classes that follow this pattern
	 * in order to adapt your quote feed to make the most use of the built in componentry.
	 * <P>See {@link CIQ.ChartEngine#attachQuoteFeed} for details on how to attach a QuoteFeed to your chart.</P>
	 * <P>See {@tutorial Data Loading} for a complete tutorial on how to load data into your charts.</P>
	 * <P>**Note:** please review the following tutorial about data accessibility before attempting to request data from the browser : {@tutorial Integrating Third Party Data Feeds}<P>

	 * @name  CIQ.QuoteFeed
	 * @constructor
	 */
	CIQ.QuoteFeed=function(){};

	/**
	 * This function MUST be used with the fetch method to return any results back to the chart (errors, or the data used to update the chart) -- this is a requirement.
	 * Failure to use this callback will affect the chart's ability to autorefresh and properly render.
	 *
	 * @callback CIQ.QuoteFeed~dataCallback
	 * @param response
	 * @param {string} response.error			Null if no error, otherwise an error message.
	 * @param {array} response.quotes			An array of Quotes in required JSON format if no error.
	 * @param {boolean} [response.moreAvailable]	Set this to `true` to enable pagination when user scrolls off the left of the chart if more data will be available from the quote feed. Set to `false` if the quote feed has exhausted the historical data for the instrument requested. Not relevant on current quote update requests.
	 * @param {object} [response.attribution]		This object will be assigned to `stx.chart.attribution` and can be used by your UI to display market source and mode. See example.
	 * @memberOf  CIQ.QuoteFeed
	 * @example
	 * cb({quotes:[--array of quote elements here--], moreAvailable:true, attribution:{source:"delayed", exchange:"NYSE"}});
	 * @example
	 * cb({error:"Your error message here"});
	 * @example
	 * // have your quotefeed callback call the attribution function.
		var quoteBehavior={
		  refreshInterval: 1,
		  callback: function(params){
			  showAttribution(params.stx);
		  }
		};
	 * // after very data call, the attribution function will be called and you can then use it to display any message regarding the quote feed
		function showAttribution(stx){
			var source=stx.chart.attribution.source;
			var exchange= stx.chart.attribution.exchange;
			var message = exchange + " quotes are "+ source;
			// add your code here to display the message on your screen.
		}
	 */

	/**
	 * The charting engine will call this method whenever it needs data from your feed.
	 * Override this with your implementation to fetch data from your server.
	 * <br>See full implementation outline and demo engine example in stx.js and a fully functinal jsfiddle at {@link http://jsfiddle.net/chartiq/qp33kna7}.
	 * <br>See {@tutorial Data Loading} tutorial for complete usage details and examples.
	 *
	 * **Important:** All data returned in the array must be sorted in ascending order. yourData[0] must be the oldest and yourData[length] must be the newest element in the dataset.
	 *
	 * @param  {object}   params					-Describes the data requested by the chart. You must return exactly what is requested.
	 * @param {CIQ.ChartEngine} params.stx 				-The chart object requesting data
	 * @param {string} params.symbol 				-The symbol to fetch.
	 * @param {string} [params.symbolObject] 		-The symbol to fetch in object format; if a symbolObject is initalized ( see {@link CIQ.ChartEngine#newChart}, {@link CIQ.ChartEngine#addSeries}, {@link CIQ.Comparison.add} )
	 * @param {number} params.period 				-The timeframe each returned object represents. For example, if using interval "minute", a period of 30 means your feed must return ticks (objects) with dates 30 minutes apart; where each tick represents the aggregated activity for that 30 minute period. **Note that this will not always be the same as the period set in {@link CIQ.ChartEngine#setPeriodicityV2}, since it represents the aggregation of the raw data to be returned by the feed server, rather than the final data to be displayed.**
	 * @param {string} params.interval 				-The type of data your feed will need to provide. Allowable values: "millisecond,"second","minute","day","week","month". (This is **not** how much data you want the chart to show on the screen; for that you can use {@link CIQ.ChartEngine#setRange} or {@link CIQ.ChartEngine#setSpan})
	 * @param {Date} [params.startDate] 			-The starting datetime. This will be sent when the chart requires an update to add more data at the right side of the chart. Your feed should return any new ticks it has starting from this date. This is also used in combination with endDate when the chart needs a specific date range of data for comparisons. Your feed should return the entire range specified, regardless of ticks. If no start or end dates are sent, your feed should return the number of  most current bars requested in `ticks`. If using {@link CIQ.ChartEngine#setTimeZone}, please be sure to interpret the date appropriately.
	 * @param {Date} [params.endDate] 				-The ending datetime. This will be sent when the chart is executing a "loadMore" pagination operation. Your feed should return the requested number of historical ticks with the most current date not newer than this date. This is also used in combination with startDate when the chart needs a specific date range of data for comparisons. Your feed should return the entire range specified, regardless of ticks. If no start or end dates are sent, your feed should return the number of  most current bars requested in `ticks`. If using {@link CIQ.ChartEngine#setTimeZone}, please be sure to interpret the date appropriately.
	 * @param {Boolean} [params.update]				-This will be true when the chart requires a refresh. params.startDate will also be set.
	 * @param {Boolean} [params.fetchMaximumBars]	-If set to true, the chart requires as much historical data as is available from the feed (params.ticks may also be set to 20,000 to set a safety max), regardless of start date. This is needed for some chart types since they aggregate data (kagi,renko, or linebreak, for example). Developers implementing fetch, should override params.tick and use a smaller number if their feed can't support that much data being sent back. The engine will then make multiple smaller calls to get enough data to fill the screen.
	 * @param {number} params.ticks 				-The number of ticks required to fill the chart screen. It is suggested to return 3 times this amount to prevent excessive quote feed requests when user paginates. This can be used to determine how much data to fetch when a date range is not requested (initial load) . Less ticks can be returned if your feed can not support the requested amount, and the engine will make additional calls to try to get the rest of the data. If a date range is requested, you must return the entire range regardless of ticks. If an `update` is requested (strtDate only) you can ignore the number of `ticks` and return the most current data you have.
	 * @param  {CIQ.QuoteFeed~dataCallback} cb		-Call this function with the results (or error) of your data request, and an indicator back to the engine indicating if there is more historical data available. ** !!!! This is a mandatory parameter that can not be omitted !!! **
	 * @abstract
	 * @memberOf  CIQ.QuoteFeed
	 * @since
	 * <br> 04-2015 -- must take into account the scenario where a date range is sent in the params (params.startDate && params.endDate) to fill in a gap in the masterData array. Usually used for series or studies.
	 * <br>- 2015-11-1 `params.symbolObject` is now available
	 */
	CIQ.QuoteFeed.prototype.fetch=function(params, cb){
		console.log("You must implement CIQ.QuoteFeed.[yourfeedname].prototype.fetch()");
	};

	/**
	 * Whenever an error occurs the params and dataCallback from fetch will be automatically passed to this method by the quote engine.
	 * Use this to alert the user if desired.
	 * Override this with your own alerting mechanisms.
	 * @param  {object} params The params originally passed into fetch()
	 * @param {object} dataCallback The data returned to fetch
	 * @memberOf  CIQ.QuoteFeed
	 * @example
	 * 	CIQ.MyQuoteFeed.prototype.announceError=function(params, dataCallback){
	 *		if(params.startDate){
	 *			// Perhaps some sort of "disconnected" message on screen
	 *		}else if(params.endDate){
	 *			// Perhaps something indicating the end of the chart
	 *		}else{
	 *			CIQ.alert("Error fetching quote:" + dataCallback.error);	// Probably a not found error?
	 *		}
	 *	};
	 */
	CIQ.QuoteFeed.prototype.announceError=function(params, dataCallback){
		if(params.suppressErrors || dataCallback.suppressAlert) return;
		if(params.startDate){
			// Perhaps some sort of "disconnected" message on screen
		}else if(params.endDate){
			// Perhaps something indicating the end of the chart
		}else if(dataCallback.error){
			CIQ.alert("Error fetching quote:" + dataCallback.error);
		}else{
			//CIQ.alert("Error fetching quote:" + params.symbol);	// Probably a not found error?
		}
	};

	/**
	 * Fetches multiple quotes asynchronously, possibly from various data sources. This method is used to update a chart with multiple symbols
	 * such as a comparison chart.
	 * @param  {array}   arr Array of stock symbols
	 * @param  {Function} cb  Function to callback when quotes are fetched. Will be passed an array of results. Each result is an object {dataCallback, params}.
	 * @memberOf  CIQ.QuoteFeed
	 */
	CIQ.QuoteFeed.prototype.multiFetch=function(arr, cb){
		if(arr.length===0) cb([]);

		var tracker={
			counter:0,
			finished: arr.length,
			results: []
		};

		function handleResponse(params, tracker, cb){
			return function(dataCallback){
				tracker.results.push({dataCallback:dataCallback, params: params});
				tracker.counter++;
				if(tracker.counter>=tracker.finished){
					var results=tracker.results;
					tracker.results=[];
					cb(results);
				}
			};
		}
		for(var i=0;i<arr.length;i++){
			var params=arr[i];
			if(params.stx.isEquationChart(params.symbol)){  //equation chart
				CIQ.fetchEquationChart(params, handleResponse(params, tracker, cb));
			}else{
				this.fetch(params, handleResponse(params, tracker, cb));
			}
		}
	};


	/**
	 * A QuoteFeed that maintains a list of subscribed symbols and provides
	 * callbacks for when to subscribe or unsubscribe as instruments are added or removed from the chart. 
	 * These could be additional symbols needed for a study, series added programatically or even comparisons added by the user via the UI.
	 *
	 * A subscription is uniquely defined by a `params` object accepted by {@link CIQ.QuoteFeed#fetch}:
	 * `{
	 * 	symbolObject:
	 * 	period:
	 * 	interval:
	 * }`
	 * @name  CIQ.QuoteFeed.Subscriptions
	 * @constructor
	 * @example
		//Copy and paste CIQ.QuoteFeed.CopyAndPasteMe. Change "CopyAndPasteMe" to the name
		//of your quote service. Then implement the fetch() method based on the included comments

		CIQ.QuoteFeed.CopyAndPasteMe=function(){};

		CIQ.QuoteFeed.CopyAndPasteMe.ciqInheritsFrom(CIQ.QuoteFeed.Subscriptions);

		CIQ.QuoteFeed.CopyAndPasteMe.prototype.fetchFromSource=function(params, cb){

			// This is an outline for how to implement fetch in your custom feed. Cut and paste
			// this code and then implement. Leave any portion blank that you cannot support.
			// 
			// Most quote feeds will support startDate and endDate. This will be enough to implement
			// charts. It is also possible to implement charts with quote feeds that support other
			// request parameters but you may need to do some manipulation within this code to
			// accomplish this.
			// 
			// See CIQ.QuoteFeed.Demo or CIQ.QuoteFeed.EndOfDay below for actual implementations.

			if(params.startDate && params.endDate){
				// If you receive both a startDate and endDate then the chart is asking for a
				// specific data range. This usually happens when a comparison symbol has been
				// added to the chart. You'll want the comparison symbol to show up on all the same
				// bars on the screen.
				// 
				// You should return data for the entire range, otherwise you could get a gap of data on the screen.
			} else if(params.startDate){
				// This means the chart is asking for a refresh of most recent data.
				// (This is streaming by "polling". For actual push based streaming see {@link CIQ.ChartEngine#streamTrade} and {@link CIQ.ChartEngine.appendMasterData}.
				// 
				// The chart will call this every X seconds based on what you have specified in behavior.refreshInterval
				// when you initially attached the quote feed to stxx (attachQuoteFeed).
				// 
				// If you don't support polling then just do nothing and return.
				// Otherwise fetch your data, probably using Ajax, and call the cb method with your data.
				// 
				// Please note that you may need to return more than 1 bar of data. If the chart has moved
				// forward then the requested startDate will be the previous bar (to finalized the bar) and
				// you should return that bar as well as the current (new) bar. To simplify, always return
				// all of the bars starting with startDate and ending with the most recent bar.
			}else if(params.endDate){
				// If you only receive an endDate, it means the user has scrolled past the end of
				// the chart. The chart needs older data, if it's available.
				// If you don't support pagination just return and do nothing.
				// 
				// Note: If your server requires a startDate then you'll need to calculate one here. A simple method
				// would be to take the endDate and then, using JavaScript Date math, create a date that is far enough
				// in the past based on params.period, params.interval and params.ticks. @todo, provide a convenience method
				// 
				// Otherwise fetch your data, probably using Ajax, and call the call with cb method with your data.
			}else{
				// The chart needs an initial load.
				// 
				// params.tick provides an suggested number of bars to retrieve to fill up the chart
				// and provide some bars off the left edge of the screen. It's good to provide more initial
				// data than just the size of the chart because many users will immediately zoom out. If you
				// have extra data off the left edge of the chart, then the zoom will be instantaneous. There
				// is very little downside to sending extra data.
				// 
				// You do not need to retrieve exactly params.tick number of bars. This is a suggestion.
				// You can return as many as you want. Fetching 1,000 bars is another good approach. This will
				// cover the immediate zooming and panning needs of 95% of users.
				//
				// Note: If your server requires startDate and endDate then use Date.now() for the endDate
				// and calculate a startDate using JavaScript Date math. params.period, params.interval and params.ticks
				// provide all the variables necessary to do the math. @todo, provide a convenience method
				// 
				// Fetch your data, probably using Ajax, and call the cb method with yourdata. This
				// is where you'll need to reformat your data into the format required by the chart.
				// 
				//  Put your code here to format the response according to the specs and return it in the callback.
				//
				//	Example code:
				//	
				// CIQ.postAjax(url, null, function(status, response){
				//	if(status!=200){
				//		cb({error:status});	// something went wrong, use the callback function to return your error
				//		return;
				//	}
				//	
				//	var quotes=formatQuotes(response);
				//	var newQuotes=[];
				//	for(var i=0;i<quotes.length;i++){
				//		newQuotes[i]={};
				//		newQuotes[i].Date=quotes[i][0]; // Or set newQuotes[i].DT if you have a JS Date
				//		newQuotes[i].Open=quotes[i][1];
				//		newQuotes[i].High=quotes[i][2];
				//		newQuotes[i].Low=quotes[i][3];
				//		newQuotes[i].Close=quotes[i][4];
				//		newQuotes[i].Volume=quotes[i][5];
				//		newQuotes[i].Adj_Close=quotes[i][6];
				//	}
				//  cb({quotes:newQuotes, moreAvailable:false}); // set moreAvailable to true or false if your server supports fetching older data, and you know that older data is available.
				// });
				// 
			}
		};

		CIQ.QuoteFeed.CopyAndPasteMe.prototype.subscribe=function(params){
			// This will get called each time the chart encounters a new symbol. This
			// could happen from a user changing symbol, a user adding a comparison symbol,
			// a new study that requires a new symbol.
			// 
			// You can use this along with unsubscribe() to keep track for the purpose
			// of maintaining legends, lists of securities, or to open or close streaming
			// connections.
			// 
			// If using a push streamer, subscribe to this security and then have the push
			// streamer push updates using {@link CIQ.ChartEngine#streamTrade} if you have
			// a "last trade" stream or {@link CIQ.ChartEngine@appendMasterData} if you have an "OHLC" stream.
			// 
			// Use params.interval, params.period, params.symbolObject to inform your streamer
			// what it needs to send
		};

		CIQ.QuoteFeed.CopyAndPasteMe.prototype.unsubscribe=function(params){
			// When a chart no longer needs to keep track of a symbol it will call
			// unsubscribe(). You can use this to tell your streamer it no longer
			// needs to send updates.
		};

	 */
	CIQ.QuoteFeed.Subscriptions=function(){
		this.subscriptions=[];
	};

	CIQ.QuoteFeed.Subscriptions.ciqInheritsFrom(CIQ.QuoteFeed);

	CIQ.QuoteFeed.Subscriptions.prototype.checkSubscriptions=function(stx){
		var sub, need;
		var chartNeeds=stx.getSymbols();

		// reset subscription match status
		for(var s=0;s<this.subscriptions.length;s++){
			this.subscriptions[s].match=false;
		}

		for(var i=0;i<chartNeeds.length;i++){
		// Convert kernel periodicity/interval/timeUnit to feed format
			need=chartNeeds[i];
			var interval=need.interval;
			// If we're rolling our own months or weeks then we should ask for days from the quote feed
			if((interval=="month" || interval=="week") && !stx.dontRoll){
				interval="day";
			}

			need.interval=interval;
			need.period=1;
			delete need.periodicity; // to avoid confusion
			delete need.timeUnit; // to avoid confusion
			delete need.setSpan; // to avoid confusion
			need.match=false;

			if(!isNaN(need.interval)){	// normalize numeric intervals into "minute" form
				need.period=need.interval;
				need.interval=need.timeUnit;
				if(!need.interval) need.interval="minute";
			}
			need.timeUnit=null;

			for(s=0;s<this.subscriptions.length;s++){
				sub=this.subscriptions[s];
				if(CIQ.equals(sub, need, {match:true})){
					need.match=true;
					sub.match=true;
					break;
				}
			}
		}
		//console.log(this.subscriptions);
		//console.log(chartNeeds);

		var self=this;
		// unsubscribe to any symbols no longer matched, and remove them from subscriptions
		this.subscriptions=this.subscriptions.filter(function(c){
			if(!c.match){
				self.unsubscribe(c);
			}
			return c.match;
		});

		chartNeeds.forEach(function(c){
			if(!c.match){
				self.subscribe(c);
				self.subscriptions.push(c);
			}
		});
	};

	CIQ.QuoteFeed.Subscriptions.prototype.fetch=function(params, cb){
		var self=this;
		this.fetchFromSource(params, function(results){
			if(!results.error){
				self.checkSubscriptions(params.stx);
			}
			cb(results);
		});
	};

	/**
	 * This callback will be called when a new instrument is added to the chart.
	 * Put your code here to subscribe to your feed.
	 * @param  {object}   params			-Describes the symbol and periodicity for the new instrument.
	 * @param {string} params.symbol 				-The new symbol to subscribe. See {@link CIQ.QuoteFeed} for details.
	 * @param {string} [params.symbolObject] 		-The new symbol to subscribe in object format. See {@link CIQ.QuoteFeed} for details.
	 * @param {number} params.period 				-The timeframe each returned object represents. See {@link CIQ.QuoteFeed} for details.
	 * @param {string} params.interval 				-The type of data your feed will need to provide. See {@link CIQ.QuoteFeed} for details.
	 * @memberOf  CIQ.QuoteFeed.Subscriptions
	 */
	CIQ.QuoteFeed.Subscriptions.prototype.subscribe=function(params){
		console.log("subscribe",params);
	};

	/**
	 * This callback will be called when an existing instrument is removed from the chart.
	 * Put your code here to UN-subscribe from your feed.
	 * @param  {object}   params			-Describes the symbol and periodicity for the currently subscribed instrument.
	 * @param {string} params.symbol 				-The symbol to remove. See {@link CIQ.QuoteFeed} for details.
	 * @param {string} [params.symbolObject] 		-The  symbol to remove in object format. See {@link CIQ.QuoteFeed} for details.
	 * @param {number} params.period 				-The timeframe each current object represents. See {@link CIQ.QuoteFeed} for details.
	 * @param {string} params.interval 				-The type of data your feed is currently providing. See {@link CIQ.QuoteFeed} for details.
	 * @memberOf  CIQ.QuoteFeed.Subscriptions
	 */
	CIQ.QuoteFeed.Subscriptions.prototype.unsubscribe=function(params){
		console.log("unsubscribe",params);
	};


	/**
	 * The charting engine will call this method whenever it needs data from your feed.
	 * Override this with your implementation to fetch data from your server.		 
	 * Uses same parameters and format as {@link CIQ.QuoteFeed#fetch}.
	 * @memberOf  CIQ.QuoteFeed.Subscriptions
	 */
	CIQ.QuoteFeed.Subscriptions.prototype.fetchFromSource=function(params, cb){
		console.log("Please provide implementation of fetchFromSource");
	};
		
	/**
	 * Return true if your quote feed should make an immediate refresh after initial load. For instance if your
	 * initial load is EOD and then you need to immediately load a real-time bar
	 * @param  {object} params The same parameters that are passed to fetch()
	 * @return {boolean}       Return true if a refresh is required immediately
	 * @memberOf  CIQ.QuoteFeed
	 * @private
	 */
	CIQ.QuoteFeed.prototype.requiresImmediateRefresh=function(params){
		return false;
	};
		
	/**
	 * Attaches a quote feed to the chart. This causes the chart to behave in event driven mode, requesting
	 * data from the quote feed when necessary.
	 * @param  {CIQ.QuoteFeed} quoteFeed A QuoteFeed object.
	 * @param  {object} [behavior]	  Parameters that describe the desired charting behavior
	 * @param {number} [behavior.refreshInterval] If non null, then the chart will poll for updated data that frequently
	 * @param {Function} [behavior.callback] Function callback after any quote fetch, use this to fetch additional data for instance. It will be called with the same parameters used on the {@link CIQ.QuoteFeed#fetch} call.
	 * @param {number} [behavior.noLoadMore] If true, then the chart will not attempt to load any more data after the initial load. Not even the current quote request that automatically takes place right after an initial load.
	 * @param {boolean} [behavior.loadMoreReplace] If true, then when loading more the feed should actually reload everything (no end_date)
	 * @param {boolean} [behavior.noBats] If true, then the chart will not attempt to load data a real time update from BATS
	 * @memberOf CIQ.ChartEngine
	 * @example
	 * var quoteBehavior={
	 *	   refreshInterval: 1,
	 *	   callback: CIQ.quoteFeedCallback
	 * };
	 * stxx.attachQuoteFeed(new CIQ.QuoteFeed.Demo(),quoteBehavior);
	 * @since 2016-03-11 behavior.loadMoreReplace was added.
	 */
	CIQ.ChartEngine.prototype.attachQuoteFeed=function(quoteFeed, behavior){
		if(!behavior) behavior={};
		if(this.quoteDriver){
			this.quoteDriver.die();
		}
		this.quoteDriver=new CIQ.ChartEngine.Driver(this, quoteFeed, behavior);
	};

	/**
	 * Attaches an additional {@link CIQ.QuoteFeed}. fetch() will be called on this quote feed after
	 * every fetch on the primary quote feed. This allows additional content to be loaded (for instance a
	 * custom study that fetches pre-computed data). See {@link CIQ.ChartEngine#detachTagAlongQuoteFeed}
	 *
	 * The data from a tagAlong will be added to the masterData in an object under the label name.
	 *
	 * @param  {object} feed Feed descriptor
	 * @param {CIQ.QuoteFeed} feed.quoteFeed The quote feed object
	 * @param {Object} [feed.behavior] Optional behavior object. This will behave like the primary behavior object except that the refreshInterval will not be respected.
	 * @param {string} feed.label Multiple copies of the same physical QuoteFeed can be used with independent labels. If multiple copies are
	 * attached with the same label then a count will be kept to prevent early detachment.
	 * @memberOf CIQ.ChartEngine
	 * @since  04-2015
	 */
	CIQ.ChartEngine.prototype.attachTagAlongQuoteFeed=function(feed){
		if(!feed.label){
			console.log("Attempt to attachTagAlongQuoteFeed without assigning a label");
			return;
		}
		this.quoteDriver.attachTagAlongQuoteFeed(feed);
	};

	/**
	 * See {@link CIQ.ChartEngine#attachTagAlongQuoteFeed}
	 * @memberOf CIQ.ChartEngine
	 * @since  04-2015
	 */
	CIQ.ChartEngine.prototype.detachTagAlongQuoteFeed=function(feed){
		this.quoteDriver.detachTagAlongQuoteFeed(feed);
	};


	/**
	 * Drives the Chart's relationship with QuoteFeed
	 * @constructor
	 * @private
	 * @name  CIQ.ChartEngine.Driver
	 */
	CIQ.ChartEngine.Driver=function(stx, quoteFeed, behavior){
		this.tagalongs={};
		this.stx=stx;
		this.quoteFeed=quoteFeed;
		this.behavior=behavior;
		this.loadingNewChart=false;	// This gets set to true when loading a new chart in order to prevent refreshes while waiting for data back from the server
		this.intervalTimer=null;	// This is the window.setInterval which can be cleared to stop the updating loop
		this.updatingChart=false;	// This gets set when the chart is being refreshed
		this.updateChartLoop();
	};

	CIQ.ChartEngine.Driver.prototype.die=function(){
		if(this.intervalTimer) window.clearInterval(this.intervalTimer);
	};

	/**
	 * Call this whenever the kernel knows that the symbols being used have changed
	 * @private
	 */
	CIQ.ChartEngine.Driver.prototype.updateSubscriptions=function(){
		if(this.quoteFeed.checkSubscriptions) this.quoteFeed.checkSubscriptions(this.stx);
	};

	CIQ.ChartEngine.Driver.prototype.attachTagAlongQuoteFeed=function(feed){
		if(!this.tagalongs[feed.label]){
			this.tagalongs[feed.label]={
				label: feed.label,
				quoteFeed: feed.quoteFeed,
				behavior: feed.behavior?feed.behavior:{},
				count: 0
			};
		}
		this.tagalongs[feed.label].count++;
	};

	CIQ.ChartEngine.Driver.prototype.detachTagAlongQuoteFeed=function(feed){
		var tagalong=this.tagalongs[feed.label];
		tagalong.count--;
		if(!tagalong.count) this.tagalongs[feed.label]=null;
	};

	CIQ.ChartEngine.Driver.prototype.loadDependents=function(params){
		var field;
		var syms={};
		var stx=params.stx;
		var series=stx.chart.series;

		function getStartDate(symbol){
			for(var c=stx.masterData.length-1;c>=0;c--){
				if(stx.masterData[c] && typeof stx.masterData[c][symbol] != "undefined"){
					return CIQ.strToDateTime(stx.masterData[c].Date);
				}
			}
			return params.startDate;
		}



		for(field in series) {
			if(!series[field].parameters.data || !series[field].parameters.data.useDefaultQuoteFeed) continue;
			syms[field]=true;
		}
		for(var p in stx.panels){
			if(stx.panels[p].studyQuotes){
				for(var sq in stx.panels[p].studyQuotes) syms[sq]=true;
			}
		}
		var arr=[];
		for(field in syms){
			var seriesParam=CIQ.shallowClone(params.originalState);
			seriesParam.symbol=field;
			if(series[field] && series[field].parameters.symbolObject) seriesParam.symbolObject=series[field].parameters.symbolObject;
			if(seriesParam.update) {
				seriesParam.startDate=getStartDate(field);
			} else {
				// since we support comparisons between instruments that may have different trading hours,
				// we can't depend on the params.ticks to keep them in sync.
				// Instead , when appending data, we must explicitly send exact ranges to load.
				// Using ticks may cause to load different ranges for instruments with different trading hours.
				if (!seriesParam.startDate && stx.masterData[0]) seriesParam.startDate = stx.masterData[0].DT;
				if (!seriesParam.endDate && stx.masterData[stx.masterData.length-1]) seriesParam.endDate = stx.masterData[stx.masterData.length-1].DT;
			}
			arr.push(seriesParam);
		}
		if(!arr.length){ // Terry, why do we need to create a dataSet?
			stx.createDataSet();
			if(!params.nodraw) stx.draw();
			return;
		}
		this.quoteFeed.multiFetch(arr, function(results){
			for(var i=0;i<results.length;i++){
				var result=results[i];
				if(!result.dataCallback.error && result.dataCallback.error!==0){
					var field=null;
					if(stx.chart.series[result.params.symbol]){
						field=stx.chart.series[result.params.symbol].parameters.field;
					}
					CIQ.addMemberToMasterdata(stx, result.params.symbol, result.dataCallback.quotes, null, null, field);
				}
			}
			stx.createDataSet();
			stx.draw();
		});
	};

	CIQ.ChartEngine.Driver.prototype.executeTagAlongs=function(params){
		var count={
			count: CIQ.objLength(this.taglongs)
		};
		var self=this;
		function closure(qparams, tagalong, count){
			return function(dataCallback){
				count.count--;
				if(!dataCallback.error && dataCallback.error!==0){
					var fields=qparams.fields;
					if(!fields) fields=null;
					CIQ.addMemberToMasterdata(self.stx, tagalong.label, dataCallback.quotes, fields);
				}

				if(count.count==-1) self.render();
			};
		}
		for(var label in this.tagalongs){
			var tagalong=this.tagalongs[label];

			// behavior + params
			var qparams=CIQ.shallowClone(tagalong.behavior);
			CIQ.extend(qparams, params, true);

			tagalong.quoteFeed.fetch(qparams, closure(qparams, tagalong, count));
		}
	};

	CIQ.ChartEngine.Driver.prototype.render=function(){
		this.stx.createDataSet();
		this.stx.draw();
	};

	/**
	 * Updates the chart as part of the chart loop
	 * @memberOf CIQ.ChartEngine.Driver
	 */
	CIQ.ChartEngine.Driver.prototype.updateChart=function(){
		if(this.updatingChart) return;
		if(this.loadingNewChart) return;
		var howManyToGet=CIQ.objLength(this.stx.charts);
		var howManyReturned=0;

		var interval=this.stx.layout.interval;
		var timeUnit=this.stx.layout.timeUnit;

		function closure(self, params, symbol){
			if(self.behavior.prefetchAction) self.behavior.prefetchAction("updateChart");
		    return function(dataCallback){
				howManyReturned++;
				if(symbol==params.chart.symbol && interval==self.stx.layout.interval && timeUnit==self.stx.layout.timeUnit){	// Make sure user hasn't changed symbol while we were waiting on a response
					if(!dataCallback.error && dataCallback.error!==0){
						var lastBarAdded=false;
						if(!params.missingBarsCreated){
							if(params.chart.masterData && params.chart.masterData.length && dataCallback.quotes && dataCallback.quotes.length>0) {
								var lastRecord=params.chart.masterData[params.chart.masterData.length-1];
								if((dataCallback.quotes[0].DT && lastRecord.DT<dataCallback.quotes[0].DT) ||
										(dataCallback.quotes[0].Date && lastRecord.Date<dataCallback.quotes[0].Date)){
									dataCallback.quotes.unshift(lastRecord);  //add previous bar so we can close gaps
									lastBarAdded=true;	//there is no overlap; possible gap
								}
							}
							dataCallback.quotes=self.stx.doCleanupGaps(dataCallback.quotes, params.chart);
							if(lastBarAdded) dataCallback.quotes.shift();
						}
						self.stx.appendMasterData(dataCallback.quotes, params.chart, {noCreateDataSet:true});
						params.chart.attribution=dataCallback.attribution;
					}else{
						self.quoteFeed.announceError(params.originalState, dataCallback);
					}
				}else{
					//console.log("orphaned update",params);
					return;
				}
				if(howManyReturned==howManyToGet){
					self.updatingChart=false;
				}
				self.executeTagAlongs(params);
				if(self.behavior.callback){
					self.behavior.callback(params);
				}
				self.loadDependents(params); // createDataSet(),draw() will be handled in here
			};
		}

		//TODO, change this to multi-fetch?
		for(var chartName in this.stx.charts){
			var chart=this.stx.charts[chartName];
			if(!chart.symbol) continue;
			// Removed below line.  It's possible IPO has no quotes from newChart but a BATS update will return data.
			//if(!chart.masterData /*|| !chart.masterData.length*/) continue;	 // sometimes there is no data but it is not an error, and we want to let the refresh try again. If don't go in here, self.updatingChart will never be set to true and we will never refresh.
			var params=this.makeParams(chart.symbol, chart.symbolObject, chart);
			if( chart.masterData && chart.masterData.length ) params.startDate=chart.masterData[chart.masterData.length-1].DT; // if there is no data, then let the fetch treat an in initial load without start or end dates.
			params.update=true;
			params.originalState=CIQ.shallowClone(params);
			this.updatingChart=true;
			var closureCB=closure(this, params, chart.symbol);
			if(this.stx.isEquationChart(params.symbol)){  //equation chart
				CIQ.fetchEquationChart(params, closureCB);
			}else{
				this.quoteFeed.fetch(params, closureCB);
			}
		}
	};

	CIQ.ChartEngine.Driver.prototype.updateChartLoop=function(){
		if(this.behavior.noUpdate) return;
		function closure(self){
			return function(){
				if(self.behavior.noUpdate) return;
				self.updateChart();
			};
		}
		if(this.behavior.refreshInterval)
			this.intervalTimer=window.setInterval(closure(this), this.behavior.refreshInterval*1000);

	};

	/**
	 * Convenience function to change the quoteFeed refresh interval.
	 * @param  {number} newInterval The new refresh interval in seconds
	 * @memberOf CIQ.ChartEngine.Driver
	 * @since 07/01/2015
	 */
	CIQ.ChartEngine.Driver.prototype.resetRefreshInterval=function(newInterval){
		if(this.intervalTimer) window.clearInterval(this.intervalTimer);  // stop the timer
		this.behavior.refreshInterval= newInterval; // set to your new interval
		this.updateChartLoop();	// restart the timer in the new interval
	};

	CIQ.ChartEngine.Driver.prototype.loadAll=function(chart, cb){
		var self=this;
		var count=0;
		function closure(){
			return function(response){
				if(response) cb(response);
				else if(!chart.moreAvailable){
					cb(null);
				}else if(count++>20){
					cb("error, moreAvailable not implemented correctly in QuoteFeed");
				}else{
					self.checkLoadMore(chart, true, true, closure());
				}
			};
		}
		this.checkLoadMore(chart, true, true, closure());
	};

	/**
	 * If the quote feed has indicated there is more data available it will create and execute a fetch() call,
	 * load the data into the masterData array, and create a new dataSet. Called internally as needed to keep the chart data up to date.
	 * Finally it will re-draw the chart to display the new data
	 * @param  {CIQ.ChartEngine.Chart} [whichChart] The chart to adjust. Otherwise adjusts the main symbol chart.
	 * @param forceLoadMore set to true to force a fetch() call.
	 * @param fetchMaximumBars	set to true to request the maximum amount of data available from the feed.
	 * @param cb The callback function. Will be called with the error retuned by the quotefeed, if any.
	 * @memberOf CIQ.ChartEngine.Driver
	 */
	CIQ.ChartEngine.Driver.prototype.checkLoadMore=function(chart, forceLoadMore, fetchMaximumBars, cb, nodraw){
		if(!chart.moreAvailable){
			if(cb) cb();
			return;
		}
		var interval=this.stx.layout.interval;
		var timeUnit=this.stx.layout.timeUnit;
		function closure(self, params){
			if(self.behavior.prefetchAction) self.behavior.prefetchAction("checkLoadMore");
			return function(dataCallback){
				if(params.symbol==params.chart.symbol && interval==self.stx.layout.interval && timeUnit==self.stx.layout.timeUnit){	// Make sure user hasn't changed symbol while we were waiting on a response
					if(!params.loadMore) params.chart.loadingMore=false;
					if(!dataCallback.error && dataCallback.error!==0){
						if(!dataCallback.quotes) dataCallback.quotes=[];
						if(!params.missingBarsCreated){
							dataCallback.quotes.push(params.chart.masterData[0]);  //add bar for end date so we can close gaps
							dataCallback.quotes=self.stx.doCleanupGaps(dataCallback.quotes, params.chart);
							dataCallback.quotes.pop();	//remove end date bar
						}
						params.chart.moreAvailable=dataCallback.moreAvailable; // set this before we call draw or we can create an infinite loop if the feed servers runs out of data in the middle of a draw
						var fullMasterData=params.loadMoreReplace ? dataCallback.quotes : dataCallback.quotes.concat(params.chart.masterData);
						self.stx.setMasterData(fullMasterData, params.chart);
						self.stx.createDataSet();
						if(!nodraw) self.stx.draw();
						params.startDate=params.chart.masterData[0].DT;
						self.executeTagAlongs(params);
						if(self.behavior.callback){
							self.behavior.callback(params);
						}
						self.loadDependents(params);
						params.chart.loadingMore=false;
						if(cb) cb();
					}else{
						self.quoteFeed.announceError(params.originalState, dataCallback);
						params.chart.loadingMore=false;
						if(cb) cb(dataCallback.error);
					}
				}else{
					//console.log("orphaned loadMore",params);
					return;
				}
			};
		}
		var fetching=false;
		if(!this.behavior.noLoadMore){
			if(!this.stx.maxDataSetSize || chart.dataSet.length<this.stx.maxDataSetSize){
				if((chart.dataSet.length>0 && chart.scroll>=chart.dataSet.length) || forceLoadMore ){
					if(!chart.loadingMore){
						chart.initialScroll=chart.scroll;
						chart.loadingMore=true;
						var params=this.makeParams(chart.symbol, chart.symbolObject, chart);
						if(chart.masterData.length)
							params.endDate=chart.masterData[0].DT;
						else
							params.endDate=this.convertToDataZone(new Date());
						params.originalState=CIQ.shallowClone(params);
						params.nodraw=nodraw;
						if(this.stx.fetchMaximumBars[this.stx.layout.aggregationType]) fetchMaximumBars=true;
						if(fetchMaximumBars) {
							params.fetchMaximumBars=true;
							params.ticks=Math.max(20000, params.ticks);
						}
						var closureCB=closure(this, params);
						if(this.stx.isEquationChart(params.symbol)){  //equation chart
							CIQ.fetchEquationChart(params, closureCB);
						}else{
							this.quoteFeed.fetch(params, closureCB);
						}
						fetching=true;
					}
				}
			}
		}
		if(chart.loadingMore){
			chart.initialScroll=chart.scroll;
		}
		if(!fetching && cb) cb(null);
	};

	/**
	 * Returns how many bars should be fetched. If we're fetching a series then it's simply the number
	 * of bars already in the chart. Otherwise it's the number of bars to fetch to fill up the screen.
	 * If we're rolling our own months or weeks from daily ticks it will return the number of daily ticks to fetch.
	 * @param  {object} params Parameters
	 * @param  {object} params.stx	  The chart object
	 * @return {number}		   Number of bars to fetch
	 * @memberOf CIQ.ChartEngine.Driver
	 */
	CIQ.ChartEngine.Driver.prototype.barsToFetch=function(params){
		if(params.isSeries) return params.stx.masterData.length;
		var interval=this.stx.layout.interval;
		var p=params.stx.layout.periodicity;
		// Rough calculation, this will account for 24x7 securities
		// If we're rolling our own months or weeks then adjust to daily bars
		if((interval=="month" || interval=="week") && !this.stx.dontRoll){
			p*=(interval=="week")?7:30;
		}
		var bars=params.stx.chart.maxTicks*p;
		return bars;
	};

	CIQ.ChartEngine.Driver.prototype.makeParams=function(symbol, symbolObject, chart){
		var interval=this.stx.layout.interval;
		var ticks=this.barsToFetch({stx:this.stx});
		// If we're rolling our own months or weeks then we should ask for days from the quote feed
		if((interval=="month" || interval=="week") && !this.stx.dontRoll){
			interval="day";
		}
		var params=CIQ.shallowClone(this.behavior);

		CIQ.extend(params,{
			stx: this.stx,
			symbol: symbol,
			symbolObject: symbolObject,
			chart: chart,
			interval: interval,
			extended: this.stx.layout.extended,
			period: 1,
			feed: "delayed",
			ticks: ticks
		}, true);

		if (!params.symbolObject) params.symbolObject={symbol:symbol};

		if(!isNaN(params.interval)){	// normalize numeric intervals into "minute" form
			params.period=params.interval;
			params.interval=this.stx.layout.timeUnit;
			if(!params.interval) params.interval="minute";
		}
		if(params.pts) params.ticks=Math.max(params.ticks,1000);
		return params;
	};

	CIQ.ChartEngine.Driver.prototype.newChart=function(params, cb){
		var stx=this.stx;
		var symbol=params.symbol;
		var interval=stx.layout.interval;
		var timeUnit=stx.layout.timeUnit;
		var chart=params.chart;
		chart.moreAvailable=false;
		chart.attribution=null;
		var qparams=this.makeParams(symbol, params.symbolObject, chart);
		CIQ.extend(qparams, params, true);
		// Some aggregation types potentially require a lot of data. We set the flag "fetchMaximumBars"
		// but also take a guess and say 20,000 bars should cover most situations
		if(stx.fetchMaximumBars[stx.layout.aggregationType] || params.fetchMaximumBars){
			qparams.ticks=Math.max(20000, qparams.ticks);
			qparams.fetchMaximumBars=true;
		}

		function closure(self, qparams){
			if(self.behavior.prefetchAction) self.behavior.prefetchAction("newChart");
			return function(dataCallback){
				if(symbol==qparams.chart.symbol && interval==stx.layout.interval && timeUnit==stx.layout.timeUnit){	// Make sure user hasn't changed symbol while we were waiting on a response
					if(!dataCallback.error && dataCallback.error!==0 /*&& dataCallback.quotes && dataCallback.quotes.length>0*/){
						if(!qparams.missingBarsCreated) dataCallback.quotes=stx.doCleanupGaps(dataCallback.quotes, params.chart);
						stx.setMasterData(dataCallback.quotes, qparams.chart);
						qparams.chart.moreAvailable=dataCallback.moreAvailable;
						qparams.chart.attribution=dataCallback.attribution;
						//self.loadingNewChart=false;	 //need to set early
						stx.createDataSet();
						if(params.initializeChart) stx.initializeChart();
						if(!qparams.nodraw) stx.home(); // by default the white space is maintained now, so no need to include the {maintainWhitespace:true} parameter
						//if(!qparams.noUpdate) self.updateChart();
					}else{
						self.quoteFeed.announceError(qparams.originalState, dataCallback);
					}
				}else{
					//console.log("orphaned request", qparams);
					if(cb) cb("orphaned");
					return;
				}
				self.loadingNewChart=false;
				if(cb){
					cb(dataCallback.error);
				}
				if(qparams.chart.masterData && qparams.chart.masterData.length)
					qparams.startDate=qparams.chart.masterData[0].DT;
				self.executeTagAlongs(qparams);
				if(self.behavior.callback){
					self.behavior.callback(qparams);
				}
				self.loadDependents(qparams);

				self.resetRefreshInterval(self.behavior.refreshInterval);
			};
		}
		this.loadingNewChart=true;
		this.updatingChart=false;

		qparams.originalState=CIQ.shallowClone(qparams);
		var closureCB=closure(this, qparams);
		if(this.stx.isEquationChart(qparams.symbol)){  //equation chart
			CIQ.fetchEquationChart(qparams, closureCB);
		}else{
			this.quoteFeed.fetch(qparams, closureCB);
		}
	};

	return _exports;
});