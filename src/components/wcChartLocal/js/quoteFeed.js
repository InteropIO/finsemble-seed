//-------------------------------------------------------------------------------------------
// Copyright 2012-2017 by ChartIQ, Inc.
// All rights reserved
//-------------------------------------------------------------------------------------------
(function(_exports){
	var CIQ=_exports.CIQ;

	/**
	 * See tutorial [Data Integration : Quotefeeds]{@tutorial DataIntegrationQuoteFeeds} for a complete overview and
	 * step by step source code for implementing a quotefeed
	 *
	 * Interface for classes that implement a quotefeed. You define a quotefeed object and attach it to
	 * the chart using {@link CIQ.ChartEngine#attachQuoteFeed}. Each member "fetch..." method is optional. The chart
	 * will call your member method if it exists, and will skip if it does not.
	 *
	 * Also see {@link CIQ.ChartEngine#dontRoll} if your feed aggregates weekly and monthly bars and you do not wish the chart to roll them from daily bars.
	 *
	 * @name quotefeed
	 * @namespace
	 * @property {number} maxTicks The maximum number of ticks a quoteFeed should request at a single time. This value will be overridden if the {@link CIQ.ChartEngine.Driver} has a behavior.maximumTicks set.
	 */
	function quotefeed(){}

	/**
	 * Each of your quotefeed's "fetch..."" methods must call this callback to return data results to the chart.
	 *
	 * @callback quotefeed~dataCallback
	 * @param response
	 * @param {string} [response.error]			An error message, if one occurred.
	 * @param {array} [response.quotes]			An array of Quotes in required JSON format.
	 * @param {boolean} [response.moreAvailable]	Set this to false if you know that no older data is available (to stop pagination requests).
	 * @param {object} [response.attribution]		This object will be assigned to `stx.chart.attribution`. Your UI can use this to display attribution messages. See example.
	 *
	 * @example <caption>Returning quotes in the dataCallback object</caption>
	 * cb({quotes:[--array of quote elements here--]});
	 *
	 * @example <caption>Returning an error in the dataCallback object</caption>
	 * cb({error:"Your error message here"});
	 *
	 * @example <caption>Setting attribution through the dataCallback object</caption>
	 *
	 * // Set up a callback to be called whenever fetchInitialData is called
	 *  stxx.attachQuoteFeed(yourQuoteFeed, {callback: showAttribution});
	 *
	 * // after very data call, the attribution function will be called and you can then use it to display any message regarding the quote feed
		function showAttribution(params){
			var message=params.stx.chart.attribution.message;
			// add your code here to display the message on your screen.
		}
	 *
	 * // In your quotefeed's fetchInitialData method, set the attribution object
	 * cb({quotes:[--array of quote elements here--], attribution:{message:"Data is delayed by 15 minutes"}});
	 */

	/**
	 * See [Data Integration : Quotefeeds]{@tutorial DataIntegrationQuoteFeeds}
	 *
	 * The charting engine calls this quotefeed function whenever the chart is wiped clean and created again with new data.
	 * This typically occurs when {@link CIQ.ChartEngine#newChart} is called but can also occur from other methods such as {@link CIQ.ChartEngine#setPeriodicity}
	 * or {@link CIQ.ChartEngine#importLayout}.
	 *
	 * @param {string} symbol The ticker symbol of the data being fetched
	 * @param {Date} suggestedStartDate A suggested starting date for the fetched data (based on how much can be displayed)
	 * @param {Date} suggestedEndDate A suggested starting date for the fetched data (based on how much can be displayed)
	 * @param {object} params						-Provides additional information on the data requested by the chart.
	 * @param {Boolean}	params.series 				-If true then the request is for series/comparison data (i.e. not the the main symbol)
	 * @param {CIQ.ChartEngine} params.stx 			-The chart object requesting data
	 * @param {string} [params.symbolObject] 		-The symbol to fetch in object format; if a symbolObject is initialized ( see {@link CIQ.ChartEngine#newChart}, {@link CIQ.ChartEngine#addSeries}, {@link CIQ.Comparison.add} )
	 * @param {number} params.period 				-The timeframe each returned object represents. For example, if using interval "minute", a period of 30 means your feed must return ticks (objects) with dates 30 minutes apart; where each tick represents the aggregated activity for that 30 minute period. **Note that this will not always be the same as the period set in {@link CIQ.ChartEngine#setPeriodicity}, since it represents the aggregation of the raw data to be returned by the feed server, rather than the final data to be displayed.**
	 * @param {string} params.interval 				-The type of data your feed will need to provide. Allowable values: "millisecond,"second","minute","day","week","month". (This is **not** how much data you want the chart to show on the screen; for that you can use {@link CIQ.ChartEngine#setRange} or {@link CIQ.ChartEngine#setSpan})
	 * @param {Boolean} [params.fetchMaximumBars]	-If set to true, the chart requires as much historical data as is available from the feed (params.ticks may also be set to 20,000 to set a safety max), regardless of start date. This is needed for some chart types since they aggregate data (kagi,renko, or linebreak, for example). Developers implementing fetch, should override params.tick and use a smaller number if their feed can't support that much data being sent back. The engine will then make multiple smaller calls to get enough data to fill the screen.
	 * @param {number} params.ticks 				-The suggested number of data points to return. This is calculated as twice the number of bars displayed on the chart. This can be used as an alternative to suggestedStartDate.
	 * @param {number} [params.timeout=10000]		-This may be used to set the timeout in msec of the remote server request.
	 * @param  {quotefeed~dataCallback} cb			-Call this function with the results (or error) of your data request.
	 * @since 4.1.2 Added timeout parameter.
	 * @memberOf quotefeed
	 */
	quotefeed.fetchInitialData=function(symbol, suggestedStartDate, suggestedEndDate, params, cb){};

	/**
	 * See [Data Integration : Quotefeeds]{@tutorial DataIntegrationQuoteFeeds}
	 *
	 * The charting engine calls this quotefeed function periodically (poll) to request updated data.
	 * The polling frequency is determined by the `refreshInterval` that you provided when you called {@link CIQ.ChartEngine#attachQuoteFeed}.
	 *
	 * @param {string} symbol The ticker symbol of the data being fetched
	 * @param {Date} startDate The starting date for the fetched data (based on how much can be displayed)
	 * @param {object} params						-Provides additional information on the data requested by the chart.
	 * @param {Boolean}	params.series 				-If true then the request is for series/comparison data (i.e. not the main symbol)
	 * @param {CIQ.ChartEngine} params.stx 			-The chart object requesting data
	 * @param {string} [params.symbolObject] 		-The symbol to fetch in object format; if a symbolObject is initialized ( see {@link CIQ.ChartEngine#newChart}, {@link CIQ.ChartEngine#addSeries}, {@link CIQ.Comparison.add} )
	 * @param {number} params.period 				-The timeframe each returned object represents. For example, if using interval "minute", a period of 30 means your feed must return ticks (objects) with dates 30 minutes apart; where each tick represents the aggregated activity for that 30 minute period. **Note that this will not always be the same as the period set in {@link CIQ.ChartEngine#setPeriodicity}, since it represents the aggregation of the raw data to be returned by the feed server, rather than the final data to be displayed.**
	 * @param {string} params.interval 				-The type of data your feed will need to provide. Allowable values: "millisecond,"second","minute","day","week","month". (This is **not** how much data you want the chart to show on the screen; for that you can use {@link CIQ.ChartEngine#setRange} or {@link CIQ.ChartEngine#setSpan})
	 * @param {number} [params.timeout=10000]		-This may be used to set the timeout in msec of the remote server request.
	 * @param  {quotefeed~dataCallback} cb			-Call this function with the results (or error) of your data request.
	 * @since 4.1.2 Added timeout parameter.
	 * @memberOf quotefeed
	 */
	quotefeed.fetchUpdateData=function(symbol, startDate, params, cb){};

	/**
	 * See [Data Integration : Quotefeeds]{@tutorial DataIntegrationQuoteFeeds}
	 *
	 * The charting engine calls this quotefeed function whenever the chart requires older data.
	 * Usually this is because a user has scrolled or zoomed past the end of the data.
	 * *Note: This method may be called during initial load if your fetchInitialData didn't provide enough data to fill the visible chart.*
	 *
	 * @param {string} symbol The ticker symbol of the data being fetched
	 * @param {Date} suggestedStartDate A suggested starting data for the fetched data (based on how much can be displayed)
	 * @param {Date} endDate The date of the last data point currently available in the chart. You should return data from this point and then backward in time.
	 * @param {object} params						-Provides additional information on the data requested by the chart.
	 * @param {CIQ.ChartEngine} params.stx 			-The chart object requesting data
	 * @param {string} [params.symbolObject] 		-The symbol to fetch in object format; if a symbolObject is initialized ( see {@link CIQ.ChartEngine#newChart}, {@link CIQ.ChartEngine#addSeries}, {@link CIQ.Comparison.add} )
	 * @param {number} params.period 				-The timeframe each returned object represents. For example, if using interval "minute", a period of 30 means your feed must return ticks (objects) with dates 30 minutes apart; where each tick represents the aggregated activity for that 30 minute period. **Note that this will not always be the same as the period set in {@link CIQ.ChartEngine#setPeriodicity}, since it represents the aggregation of the raw data to be returned by the feed server, rather than the final data to be displayed.**
	 * @param {string} params.interval 				-The type of data your feed will need to provide. Allowable values: "millisecond,"second","minute","day","week","month". (This is **not** how much data you want the chart to show on the screen; for that you can use {@link CIQ.ChartEngine#setRange} or {@link CIQ.ChartEngine#setSpan})
	 * @param {Boolean} [params.fetchMaximumBars]	-If set to true, the chart requires as much historical data as is available from the feed (params.ticks may also be set to 20,000 to set a safety max), regardless of start date. This is needed for some chart types since they aggregate data (kagi,renko, or linebreak, for example). Developers implementing fetch, should override params.tick and use a smaller number if their feed can't support that much data being sent back. The engine will then make multiple smaller calls to get enough data to fill the screen.
	 * @param {number} params.ticks 				-The suggested number of data points to return. This is calculated as twice the number of bars displayed on the chart. This can be used as an alternative to suggestedStartDate.
	 * @param {number} [params.timeout=10000]		-This may be used to set the timeout in msec of the remote server request.
	 * @param {Boolean} [params.future]             -If set to true, the chart is scrolling in a 'forward' direction
	 * @param  {quotefeed~dataCallback} cb			-Call this function with the results (or error) of your data request.
	 * @since 4.1.2 Added timeout parameter.
	 * @since 6.0.0 Added params.future
	 * @memberOf quotefeed
	 */
	quotefeed.fetchPaginationData=function(symbol, suggestedStartDate, endDate, params, cb){};

	/**
	 * See [Data Integration : Advanced]{@tutorial DataIntegrationAdvanced}
	 *
	* Although not a core quotefeed function, the charting engine calls this optional function each time the chart encounters a new symbol or a particular periodicity for that symbol.
	* This could happen when a user changes periodcity, changes a symbol, adds a comparison symbol, or a new study is added that requires an underlying symbol.
	*
    * Use this along with unsubscribe() to keep track of symbols on the chart.
    * Use cases include: maintaining legends, lists of securities, or adding/removing subscriptions to streaming connections.
    *
    * If using a push stream, subscribe and then have the push streamer push updates using {@link CIQ.ChartEngine#updateChartData}.
    *
	 * @param {object} params						-Provides additional information on the data requested by the chart.
	 * @param {CIQ.ChartEngine} params.stx 			-The chart object requesting data
	 * @param {string} params.symbol 				-The symbol being added
	 * @param {string} params.symbolObject 			-The symbol being added in object form
	 * @param {number} params.period 				-The timeframe each returned object represents. For example, if using interval "minute", a period of 30 means your feed must return ticks (objects) with dates 30 minutes apart; where each tick represents the aggregated activity for that 30 minute period. **Note that this will not always be the same as the period set in {@link CIQ.ChartEngine#setPeriodicity}, since it represents the aggregation of the raw data to be returned by the feed server, rather than the final data to be displayed.**
	 * @param {string} params.interval 				-The type of data your feed will need to provide. Allowable values: "millisecond,"second","minute","day","week","month". (This is **not** how much data you want the chart to show on the screen; for that you can use {@link CIQ.ChartEngine#setRange} or {@link CIQ.ChartEngine#setSpan})
	 * @memberOf quotefeed
	 * @since 4.0.0 Changes to periodicity (period/interval) will now also cause subscribe calls
	 */
	quotefeed.subscribe=function(params){};

	/**
	 * See [Data Integration : Advanced]{@tutorial DataIntegrationAdvanced}
	 *
	* Although not a core quotefeed function, the charting engine calls this optional function each time the chart no longer requires a symbol or a particular periodicity for that symbol.
	*
	 * @param {object} params						-Provides additional information on the data requested by the chart.
	 * @param {CIQ.ChartEngine} params.stx 			-The chart object requesting data
	 * @param {string} params.symbol				-The symbol being removed
	 * @param {string} params.symbolObject 			-The symbol being removed in object form
	 * @param {number} params.period 				-The timeframe each returned object represents. For example, if using interval "minute", a period of 30 means your feed must return ticks (objects) with dates 30 minutes apart; where each tick represents the aggregated activity for that 30 minute period. **Note that this will not always be the same as the period set in {@link CIQ.ChartEngine#setPeriodicity}, since it represents the aggregation of the raw data to be returned by the feed server, rather than the final data to be displayed.**
	 * @param {string} params.interval 				-The type of data your feed will need to provide. Allowable values: "millisecond,"second","minute","day","week","month". (This is **not** how much data you want the chart to show on the screen; for that you can use {@link CIQ.ChartEngine#setRange} or {@link CIQ.ChartEngine#setSpan})
	 * @memberOf quotefeed
	 * @since 4.0.0 Changes to periodicity (period/interval) will now also cause unsubscribe calls
	 */
	quotefeed.unsubscribe=function(params){};


	/**
	 * See tutorial [Data Integration : Quotefeeds]{@tutorial DataIntegrationQuoteFeeds} for a complete overview and
	 * step by step source code for implementing a quotefeed
	 *
	 * @namespace
	 * @name CIQ.QuoteFeed
	 * @deprecated
	 */
	CIQ.QuoteFeed=function(){};

	/**
	 * @private
	 * @param {object} params
	 * @param {function} cb Callback
	 * @deprecated
	 */
	CIQ.QuoteFeed.prototype.fetch=function(params, cb){
		if (!this.v2QuoteFeed) {
			console.log("You must implement CIQ.QuoteFeed.[yourfeedname].prototype.fetch()");
		}
	};

	/**
	 * Whenever an error occurs the params and dataCallback from fetch will be automatically passed to this method by the quote engine.
	 * Use this to alert the user if desired.
	 * Override this with your own alerting mechanisms.
	 * @param  {object} params The params originally passed into fetch()
	 * @param {object} dataCallback The data returned to fetch
	 * @memberOf CIQ.QuoteFeed
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
	 *	@private
	 *	@deprecated
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
	 * @memberOf CIQ.QuoteFeed
	 * @private
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
				CIQ.ChartEngine.Driver.fetchData(CIQ.QuoteFeed.SERIES, this, params, handleResponse(params, tracker, cb));
			}
		}
	};

	/**
	 * QuoteFeed for managing streaming data
	 * @constructor
	 * @private
	 */
	CIQ.QuoteFeed.Subscriptions=function(){
		this.subscriptions=[];
	};

	CIQ.QuoteFeed.Subscriptions.ciqInheritsFrom(CIQ.QuoteFeed);

	/**
	 * Used by the QuoteFeed Driver to create subscribe and unsubscribe calls as needed.
	 *
	 * @param {CIQ.ChartEngine} stx engine instance
	 * @since 4.0.0 Changes to periodicity (period/interval) will cause subscribe/unsubscribe calls
	 */
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
			need.match=false;

			if(!isNaN(need.interval)){	// normalize numeric intervals into "minute" form
				need.period=need.interval;
				need.interval=need.timeUnit;
				if(!need.interval) need.interval="minute";
			}
			delete need.periodicity; // to avoid confusion
			delete need.timeUnit; // to avoid confusion
			delete need.setSpan; // to avoid confusion

			for(s=0;s<this.subscriptions.length;s++){
				sub=this.subscriptions[s];
				if(sub.symbol==need.symbol && sub.period==need.period && sub.interval==need.interval){
					need.match=true;
					sub.match=true;
					break;
				} else if (sub.symbol != need.symbol) {
					if (need.reason != 'period') need.reason = 'symbol';
					sub.reason = 'symbol';
				} else {
					need.reason = 'period';
					sub.reason = 'period';
				}
			}
		}
		//console.log(this.subscriptions);
		//console.log(chartNeeds);

		var self=this;
		// unsubscribe to any symbols no longer matched, and remove them from subscriptions
		this.subscriptions=this.subscriptions.filter(function(c){
			if(!c.match){
				if (!c.stx) c.stx = stx;
				self.unsubscribe(c);
			}
			return c.match;
		});

		chartNeeds.forEach(function(c){
			if(!c.match){
				if (!c.stx) c.stx = stx;
				if (!c.reason) c.reason = 'initialize';
				self.subscribe(c);
				self.subscriptions.push(c);
			}
		});
	};

	/**
	 * Calls fetchFromSource and checks for subscription updates when successful.
	 *
	 * @param {Object} params
	 * @param {Function} cb
	 */
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
	 * Implement this method. Start your streaming here.
	 *
	 * @param {Object} params
	 */
	CIQ.QuoteFeed.Subscriptions.prototype.subscribe=function(params){
		console.log("subscribe",params);
	};

	/**
	 * Implement this method. End your streaming here.
	 *
	 * @param {Object} params
	 */
	CIQ.QuoteFeed.Subscriptions.prototype.unsubscribe=function(params){
		console.log("unsubscribe",params);
	};


	/**
	 * The charting engine will call this method whenever it needs data from your feed.
	 * Override this with your implementation to fetch data from your server.
	 * Uses same parameters and format as {@link CIQ.QuoteFeed#fetch}.
	 * @param {object} params
	 * @param {function} cb Callback
	 * @memberOf CIQ.QuoteFeed.Subscriptions
	 * @private
	 * @deprecated
	 */
	CIQ.QuoteFeed.Subscriptions.prototype.fetchFromSource=function(params, cb){
		console.log("Please provide implementation of fetchFromSource");
	};

	/**
	 * Return true if your quote feed should make an immediate refresh after initial load. For instance if your
	 * initial load is EOD and then you need to immediately load a real-time bar
	 * @param  {object} params The same parameters that are passed to fetch()
	 * @return {boolean}       Return true if a refresh is required immediately
	 * @memberOf CIQ.QuoteFeed
	 * @private
	 */
	CIQ.QuoteFeed.prototype.requiresImmediateRefresh=function(params){
		return false;
	};

	/**
	 * Attaches a quote feed to the charting engine. This causes the chart to pull data from the quotefeed as needed.
	 * @param  {object} [quoteFeed] your quoteFeed object.
	 * @param  {object} [behavior] Optional behavior object to initialize quotefeed
	 * @param {number} [behavior.refreshInterval] If non null, then sets the frequency for fetchUpdates (if null or zero then fetchUpdate will not be called)
	 * @param {number} [behavior.bufferSize] Set to the minimum number of undisplayed historical ticks always buffered in the masterData. Useful to prevent temporary gaps on studies while paginating. This forces fetch requests to be triggered ahead of reaching the left-most corner of the chart (default) if the number of already loaded bars is less than the required buffer size. This parameter can be reset at any time by manipulating 'stxx.quoteDriver.behavior.bufferSize'; it will then become active on the very next loading check.
	 * @param {Function} [behavior.callback] Optional callback after any fetch to enhance functionality. It will be called with the params object used with the fetch call.
	 * @param {number} [behavior.noLoadMore] If true, then the chart will not attempt to load any more data after the initial load.
	 * @param {boolean} [behavior.loadMoreReplace] If true, then when paginating, the driver will replace the masterData instead of prepending. Set this if your feed can only provide a full data set of varying historical lengths.
	 * @param {string} [behavior.adjustmentMethod] Set to override the quotefeed's default dividend/split adjustment method.  The value will depend on the particular quotefeed implementation.
	 * @param {number} [behavior.maximumTicks=20000] Limiter on maximum number of ticks to request from a quoteFeed. Setting a value in the quoteDriver's behavior will override an individual quoteFeed's maximumTicks value.
	 * @memberOf CIQ.ChartEngine
	 *
	 * @example <caption>Attach a quotefeed and have the driver call fetchUpdateData once per second</caption>
	 * stxx.attachQuoteFeed(yourQuotefeed, {refreshInterval: 1});
	 * @since
	 * <br>&bull; 2016-12-01 added
	 * <br>&bull; 5.0.0 behavior.bufferSize is now available.
	 * <br>&bull; 5.1.1 added maximumTicks to behavior
	 */
	CIQ.ChartEngine.prototype.attachQuoteFeed=function(quoteFeed, behavior){
		if(!behavior) behavior={};
		if(this.quoteDriver){
			this.quoteDriver.die();
		}
		// Legacy QuoteFeeds
		if ((typeof quoteFeed.fetchInitialData !== "function") &&
			(typeof quoteFeed.fetchUpdateData !== "function") &&
			(typeof quoteFeed.fetchPaginationData !== "function")) {
			this.quoteDriver=new CIQ.ChartEngine.Driver(this, quoteFeed, behavior);
			return;
		}

		// New "duck typed" v2 quotefeed
		if ((typeof quoteFeed.fetchPaginationData !== "function") && (typeof quoteFeed.fetchUpdateData !== "function")) {
			behavior.noLoadMore = true;
		}
		quoteFeed.v2QuoteFeed = true; // store flag in quotefeed to single new version of quotefeed
		["multiFetch","announceError","requiresImmediateRefresh"].forEach(function(prop){
			if(!quoteFeed[prop] && quoteFeed[prop]!==false) quoteFeed[prop]=CIQ.QuoteFeed.prototype[prop];  // no inheritance so add function
		});
		if (typeof quoteFeed.subscribe === "function") { // if subscription quotefeed
			quoteFeed.checkSubscriptions=CIQ.QuoteFeed.Subscriptions.prototype.checkSubscriptions; // no inheritance so add checkSubscriptions function
			quoteFeed.subscriptions=[];
		}
		this.quoteDriver=new CIQ.ChartEngine.Driver(this, quoteFeed, behavior);
	};

	/**
	 * ** Deprecated. ** Use {@link CIQ.ChartEngine#attachQuoteFeed} instead
	 * Attaches a quote feed to the charting engine. This causes the chart to pull data from the quotefeed as needed.
	 *
	 * @param  {object} [quoteFeed] your quoteFeed object.
	 * @param  {object} [behavior] Optional behavior object to initialize quotefeed
	 * @param {number} [behavior.refreshInterval] If non null, then sets the frequency for fetchUpdates (if null or zero then fetchUpdate will not be called)
	 * @param {Function} [behavior.callback] Optional callback after any fetch to enhance functionality. It will be called with the params object used with the fetch call.
	 * @param {number} [behavior.noLoadMore] If true, then the chart will not attempt to load any more data after the initial load.
	 * @param {boolean} [behavior.loadMoreReplace] If true, then when paginating, the driver will replace the masterData instead of prepending. Set this if your feed can only provide a full data set of varying historical lengths.
	 * @memberOf CIQ.ChartEngine
	 *
	 * @example <caption>Attach a quotefeed and have the driver call fetchUpdateData once per second</caption>
	 * stxx.attachEngineQuoteFeed(yourQuotefeed, {refreshInterval: 1});
	 * @since 2016-12-01
	 * @deprecated
	 *
	 */
	CIQ.ChartEngine.prototype.attachEngineQuoteFeed=function(quoteFeed, behavior){
		console.log('CIQ.ChartEngine.attachEngineQuoteFeed is now Deprecated. Use CIQ.ChartEngine.attachQuoteFeed instead');
		this.attachQuoteFeed(quoteFeed, behavior);
	};

	/**
	 * LEGACY INTERFACE
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
	 * @deprecated
	 * @private
	 */
	CIQ.ChartEngine.prototype.attachTagAlongQuoteFeed=function(feed){
		if(!feed.label){
			console.log("Attempt to attachTagAlongQuoteFeed without assigning a label");
			return;
		}
		this.quoteDriver.attachTagAlongQuoteFeed(feed);
	};

	/**
	 * LEGACY INTERFACE
	 * See {@link CIQ.ChartEngine#attachTagAlongQuoteFeed}
	 * @param {object} feed
	 * @memberOf CIQ.ChartEngine
	 * @since  04-2015
	 * @deprecated
	 * @private
	 */
	CIQ.ChartEngine.prototype.detachTagAlongQuoteFeed=function(feed){
		if(!feed.label){
			console.log("Attempt to detachTagAlongQuoteFeed without assigning a label");
			return;
		}
		this.quoteDriver.detachTagAlongQuoteFeed(feed);
	};

	/**
	 * Drives the Chart's relationship with the quotefeed object provided to the chart
	 * @param {CIQ.ChartEngine} stx A chart engine instance
	 * @param {object} quoteFeed
	 * @param {object} behavior
	 * @param {number} [behavior.refreshInterval] Defines how frequently in seconds the chart looks for an update
	 * @param {number} [behavior.buffer] A value of ticks that acts as a buffer before pagination
	 * @param {number} [behavior.maximumTicks=20000] Limiter on maximum number of ticks to request from a quoteFeed. Setting a value in the quoteDriver's behavior will override an individual quoteFeed's maximumTicks value.
	 * @property {boolean} loadingNewChart=false READ ONLY boolean telling when a new chart is loading
	 * @property {boolean} updatingChart=false READ ONLY boolean telling when a chart is updating
	 * @property {?number} intervalTimer=null intervalTimer a set interval which can be cleared to stop the update loop
	 * @constructor
	 * @name  CIQ.ChartEngine.Driver
	 * @since 5.1.1 added maximumTicks to behavior
	 */
	CIQ.ChartEngine.Driver=function(stx, quoteFeed, behavior){
		this.tagalongs={};
		this.stx=stx;
		this.quoteFeed=quoteFeed;
		if(!behavior.maximumTicks) behavior.maximumTicks=quoteFeed.maxTicks?quoteFeed.maxTicks:20000; // Historically this is the safest limit of ticks to fetch for response time
		if(!behavior.bufferSize || behavior.bufferSize<0) behavior.bufferSize=0;
		behavior.bufferSize=Math.round(behavior.bufferSize);
		this.behavior=behavior;
		this.loadingNewChart=false;	// This gets set to true when loading a new chart in order to prevent refreshes while waiting for data back from the server
		this.intervalTimer=null;	// This is the window.setInterval which can be cleared to stop the updating loop
		this.updatingChart=false;	// This gets set when the chart is being refreshed
		this.updateChartLoop();
	};

	CIQ.ChartEngine.Driver.prototype.die=function(){
		if(this.intervalTimer) {
			window.clearInterval(this.intervalTimer);
			this.intervalTimer=-1; // this means it was stopped by the die function and should not be started again in the event of an async call back from the fetch coming back after it was killed.
		}
	};

	/**
	 * Call this whenever the kernel knows that the symbols being used have changed
	 * @private
	 */
	CIQ.ChartEngine.Driver.prototype.updateSubscriptions=function(){
		if(this.quoteFeed.checkSubscriptions) this.quoteFeed.checkSubscriptions(this.stx);
	};

	/**
	 * @deprecated
	 * @private
	 */
	CIQ.ChartEngine.Driver.prototype.attachTagAlongQuoteFeed=function(feed){
		if (!feed.label) return;
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

	/**
	 * @deprecated
	 * @private
	 */
	CIQ.ChartEngine.Driver.prototype.detachTagAlongQuoteFeed=function(feed){
		if (!feed.label) return;
		var tagalong=this.tagalongs[feed.label];
		tagalong.count--;
		if(!tagalong.count) this.tagalongs[feed.label]=null;
	};

	CIQ.ChartEngine.Driver.prototype.loadDependents=function(params, cb, fetchType){
		var field;
		var syms={};
		var stx=params.stx;
		var chart=params.chart;
		var seriesList=chart.series;
		var masterData=stx.masterData;
		var series, symbolObject;
		var self=this;

		// Create a master list of all symbols we need from our various dependencies: series and studySymbols
		var allSymbols=[], ranges={};
		var isUpdate=fetchType==CIQ.QuoteFeed.UPDATE;
		var isPaginate=fetchType==CIQ.QuoteFeed.PAGINATION;
		for(field in seriesList) {
			series=seriesList[field];
			if(!params.future && !isUpdate && series.moreAvailable === false) continue;  // skip series that no longer have historical data.
			if(series.loading) continue;  // skip series that are presently loading data
			if(isUpdate || isPaginate){
				if(!series.endPoints || !Object.keys(series.endPoints).length) continue;  // skip series which have not set range in master data yet
			}
			var sp=series.parameters;
			if(sp.loadData===false) continue;  // skip series that do not load data
			if(sp.data && !sp.data.useDefaultQuoteFeed) continue; // legacy
			symbolObject=sp.symbolObject;
			if(!symbolObject.symbol) continue;  // skip series that are really just fields already loaded, like "High".
			var isUnique=true;
			if(!isUpdate) series.loading=true;
			for(var j=0;j<allSymbols.length;j++){
				if(CIQ.symbolEqual(allSymbols[j], symbolObject)) isUnique=false;
			}
			if(isUnique) {
				allSymbols.push(symbolObject);
				ranges[symbolObject.symbol]=series.endPoints;
			}
		}

		var arr=[];
		for(var k=0;k<allSymbols.length;k++){
			symbolObject=allSymbols[k];
			var seriesParam=CIQ.shallowClone(params.originalState);
			seriesParam.symbol=symbolObject.symbol;
			seriesParam.symbolObject=symbolObject;
			if(seriesParam.update || seriesParam.future) {
				if (!seriesParam.endDate) seriesParam.endDate=params.endDate;
				seriesParam.startDate=ranges[symbolObject.symbol].end;
			}else{
				if (!seriesParam.startDate) seriesParam.startDate=params.startDate;
				// for comparisons, you must fetch enough data on the new Comparison to match the beginning of the masterData until the current tick.
				// The current tick may be newer than master data last tick, so set the end Date to right now.
				seriesParam.endDate=isPaginate && !params.future?ranges[symbolObject.symbol].begin:params.endDate;
				seriesParam.ticks=params.ticks;
			}
			arr.push(seriesParam);
		}
		if(!arr.length && isUpdate){
			// we need this because in updateChart we don't create and let the dependents do it.
			stx.createDataSet(null,null,{appending:params.appending || params.originalState.update});
			if(!params.nodraw) stx.draw();
			if(cb) cb(null);
			return;
		}

		function MFclosure(isUpdate){
			return function(results){
				var earliestDate=null;
				for(var i=0;i<results.length;i++){
					var result=results[i];
					var error=result.dataCallback.error;
					if(!error && error!==0){
						var symbolObject=result.params.symbolObject;
						var dataCallback=result.dataCallback, quotes=dataCallback.quotes, moreAvailable=dataCallback.moreAvailable;
						var arr=stx.getSeries({symbolObject: symbolObject});
						var fillGaps=false;
						for(var j=0;j<arr.length;j++){
							series=arr[j];
							if (!isUpdate) {
								// only reset the moreAvailable on pagination or initial fetch, never on updates.
								if(!params.future) series.moreAvailable = moreAvailable === false ? false : (moreAvailable || quotes.length > (result.params.endDate?1:0));
								else if(stx.isHistoricalModeSet && quotes.length<2) series.mostRecentForwardAttempt = new Date();
								series.loading = false;
							}
							// Once fillGaps is set, do not unset it.
							fillGaps=series.parameters.fillGaps || fillGaps;
						}
						quotes=self.cleanup(stx,series,quotes,fetchType,params,fillGaps);
						stx.updateChartData(quotes, chart, {secondarySeries:symbolObject.symbol, noCreateDataSet:true, noCleanupDates:true, allowReplaceOHL:true});
						if(quotes && quotes.length && (!earliestDate || earliestDate>quotes[0].DT))
							earliestDate=quotes[0].DT;
					}
				}
				if(results.length){
					stx.createDataSet(null,null,{appending:params.originalState.update || params.future, appendToDate:earliestDate});
					if(!params.nodraw) stx.draw();
				}
				if(cb) cb(null);
			};
		}

		this.quoteFeed.multiFetch(arr, MFclosure(isUpdate));
	};

	/**
	 * Cleans up the dates and the gaps
	 * @memberOf CIQ.ChartEngine.Driver
	 * @private
	 * @since 5.2.0
	 */
	CIQ.ChartEngine.Driver.prototype.cleanup=function(stx,series,quotes,mode,params,fillGaps){
		stx.doCleanupDates(quotes, stx.layout.interval);
		if(!params.missingBarsCreated && quotes.length && stx.cleanupGaps && fillGaps!==false){
			var removalMethod, field;
			var chartOrSeries=params.chart;
			if(!series) field=chartOrSeries.defaultPlotField;
			else {
				chartOrSeries=series;
				field=series.parameters.symbol || series.id;
			}
			if(mode==CIQ.QuoteFeed.PAGINATION && !params.loadMoreReplace){  //add bar for end date so we can close gaps
				if(chartOrSeries.endPoints.begin && chartOrSeries.endPoints.begin>quotes[quotes.length-1].DT) {
					var endingRecord=stx.getFirstLastDataRecord(stx.masterData,field,false);
					if(series) endingRecord=endingRecord[field];
					quotes.push(endingRecord);
					removalMethod="pop";
				}
			}
			else if(mode==CIQ.QuoteFeed.UPDATE){  //add bar for begin date so we can close gaps
				if(chartOrSeries.endPoints.end && chartOrSeries.endPoints.end<quotes[0].DT) {
					var beginningRecord=stx.getFirstLastDataRecord(stx.masterData,field,true);
					if(series) beginningRecord=beginningRecord[field];
					quotes.unshift(beginningRecord);
					removalMethod="shift";
				}
			}
			quotes=stx.doCleanupGaps(quotes, params.chart, {cleanupGaps:fillGaps,  noCleanupDates:true});
			if(removalMethod) quotes[removalMethod]();
		}
		return quotes;
	};

	/**
	 * @deprecated
	 * @private
	 */
	CIQ.ChartEngine.Driver.prototype.executeTagAlongs=function(params){
		var count={
			count: CIQ.objLength(this.taglongs)
		};
		var self=this;
		function closure(qparams, tagalong, count){
			return function(dataCallback){
				count.count--;
				if(!dataCallback.error){
					var fields=qparams.fields;
					if(!fields) fields=null;
					CIQ.addMemberToMasterdata({stx: self.stx, label: tagalong.label, data: dataCallback.quotes, fields: fields, noCleanupDates: true});
				}

				if(count.count==-1) {
					self.stx.createDataSet(null, null, {appending:qparams.originalState.update});
					self.stx.draw();
				}
			};
		}
		for(var label in this.tagalongs){
			var tagalong=this.tagalongs[label];

			// behavior + params
			var qparams=CIQ.shallowClone(tagalong.behavior);
			CIQ.extend(qparams, params, true);

			CIQ.ChartEngine.Driver.fetchData(null, tagalong.quoteFeed, qparams, closure(qparams, tagalong, count)); // only legacy quotefeed supported with tagalong
		}
	};

	/**
	 * Updates the chart as part of the chart loop
	 * @memberOf CIQ.ChartEngine.Driver
	 * @private
	 */
	CIQ.ChartEngine.Driver.prototype.updateChart=function(){
		if(this.updatingChart) return;
		if(this.loadingNewChart) return;
		var howManyToGet=CIQ.objLength(this.stx.charts);
		var howManyReturned=0;
		var stx=this.stx;

		var interval=stx.layout.interval;
		var timeUnit=stx.layout.timeUnit;

		function closure(self, params, symbol){
			if(self.behavior.prefetchAction) self.behavior.prefetchAction("updateChart");
		    return function(dataCallback){
				howManyReturned++;
				var chart=params.chart, masterData=chart.masterData;
				if(symbol==chart.symbol && interval==stx.layout.interval && timeUnit==stx.layout.timeUnit && !stx.isHistoricalMode()){	// Make sure user hasn't changed symbol while we were waiting on a response
					if(!dataCallback.error){
						var quotes=dataCallback.quotes;
						quotes=self.cleanup(stx,null,quotes,CIQ.QuoteFeed.UPDATE,params);
						stx.updateChartData(quotes, chart, {noCreateDataSet:true, noCleanupDates:true});
						chart.attribution=dataCallback.attribution;
					}else{
						self.quoteFeed.announceError(params.originalState, dataCallback);
					}
				}else{
					self.updatingChart=false;
					return;
				}
				if(howManyReturned==howManyToGet){
					self.updatingChart=false;
				}
				self.executeTagAlongs(params);
				if(self.behavior.callback){
					self.behavior.callback(params);
				}
				self.loadDependents(params, null, CIQ.QuoteFeed.UPDATE); // createDataSet(),draw() will be handled in here
			};
		}
		//TODO, change this to multi-fetch?
		for(var chartName in stx.charts){
			var chart=stx.charts[chartName];
			if(!chart.symbol) continue;
			// Removed below line.  It's possible IPO has no quotes from newChart but a BATS update will return data.
			//if(!chart.masterData /*|| !chart.masterData.length*/) continue;	 // sometimes there is no data but it is not an error, and we want to let the refresh try again. If don't go in here, self.updatingChart will never be set to true and we will never refresh.
			var params=this.makeParams(chart.symbol, chart.symbolObject, chart);
			if( chart.masterData && chart.masterData.length ) {
				params.startDate=chart.endPoints.end; // if there is no data, then let the fetch treat an in initial load without start or end dates.
			}
			params.update=true;
			params.originalState=CIQ.shallowClone(params);
			this.updatingChart=true;
			var closureCB=closure(this, params, chart.symbol);
			if(stx.isEquationChart(params.symbol)){  //equation chart
				CIQ.fetchEquationChart(params, closureCB);
			}else{
				CIQ.ChartEngine.Driver.fetchData(CIQ.QuoteFeed.UPDATE, this.quoteFeed, params, closureCB);
			}
		}
	};

	CIQ.ChartEngine.Driver.prototype.updateChartLoop=function(newInterval){
		if( this.intervalTimer == -1 ) return; // the driver was killed. This was probably an async call from a feed response sent before it was killed.
		if(this.intervalTimer) window.clearInterval(this.intervalTimer);  // stop the timer
		if(this.behavior.noUpdate) return;
		function closure(self){
			return function(){
				if(self.behavior.noUpdate) return;
				self.updateChart();
			};
		}
		if(!newInterval && newInterval!==0) newInterval=this.behavior.refreshInterval;
		if(newInterval) this.intervalTimer=window.setInterval(closure(this), newInterval*1000);
	};

	/**
	 * Convenience function to change the refresh interval that was set during attachQuoteFeed.
	 * @param  {number} newInterval The new refresh interval in seconds
	 * @memberOf CIQ.ChartEngine.Driver
	 * @since 07/01/2015
	 */
	CIQ.ChartEngine.Driver.prototype.resetRefreshInterval=function(newInterval){
		this.behavior.refreshInterval=newInterval; // set to your new interval
		this.updateChartLoop();	// restart the timer in the new interval
	};

	/**
	 * Loads all available data
	 * @param {CIQ.ChartEngine.Chart} [chart] The chart to adjust. If left undefined, adjust the main symbol chart.
	 * @param {function} cb The callback function. Will be called with the error returned by the quotefeed, if any.
	 * @memberOf CIQ.ChartEngine.Driver
	 * @since 07/01/2015
	 */
	CIQ.ChartEngine.Driver.prototype.loadAll=function(chart, cb){
		var self=this;
		var count=0;
		function closure(){
			return function(response){
				if(response){  // error
					cb(response);
				}else if(!chart.moreAvailable){  // no more data
					cb(null);
				//}else if(chart.loadingMore){  // something else is loading past data, abort this
				//	cb(null);
				}else if(++count>20){  // we'll allow up to 20 fetches
					cb("error, moreAvailable not implemented correctly in QuoteFeed");
				}else{  // get some more
					chart.loadingMore=false;
					self.checkLoadMore(chart, true, true, closure(), true);
				}
			};
		}
		closure()();
	};


	/**
	 * If the quote feed has indicated there is more data available it will create and execute a fetch() call,
	 * load the data into the masterData array, and create a new dataSet. Called internally as needed to keep the chart data up to date.
	 * Finally it will re-draw the chart to display the new data
	 *
	 * @param  {CIQ.ChartEngine.Chart} [chart] The chart to adjust. Otherwise adjusts the main symbol chart.
	 * @param {boolean} forceLoadMore set to true to force a fetch() call.
	 * @param {boolean} fetchMaximumBars	set to true to request the maximum amount of data available from the feed.
	 * @param {function} cb The callback function. Will be called with the error returned by the quotefeed, if any.
	 * @param {boolean} nodraw Set to true to skip over the draw() call
	 * @memberOf CIQ.ChartEngine.Driver
	 * @private
	 */
	CIQ.ChartEngine.Driver.prototype.checkLoadMore=function(chart, forceLoadMore, fetchMaximumBars, cb, nodraw){
		var stx=this.stx, driver=this;
		var isHistoricalData = stx.isHistoricalMode();
		if(!isHistoricalData) stx.isHistoricalModeSet = false;

		if(chart.loadingMore || this.loadingNewChart){
			chart.initialScroll=chart.scroll;
			if(cb) cb(null);
			return;
		}

		var params;
		function finish(err){
			chart.loadingMore=false;
			if(cb) cb(err);
		}

		if(stx.currentlyImporting){
			if(cb) cb(null);
			return;
		}

		var dataSet=chart.dataSet;
		function needsBackFill(which){
			return (
				!which.endPoints.begin ||
				dataSet.length-chart.scroll<driver.behavior.bufferSize ||
				dataSet.length-chart.scroll-stx.tickFromDate(which.endPoints.begin,chart)<driver.behavior.bufferSize
			);
		}
		function needsFrontFill(which){
			return (
				!which.endPoints.end ||
				chart.scroll-chart.maxTicks+1<driver.behavior.bufferSize ||
				stx.tickFromDate(which.endPoints.end,chart,null,true)-dataSet.length+chart.scroll-chart.maxTicks+2<driver.behavior.bufferSize
			);
		}
		// The following var will be used to determine if it's ok to retry a forward pagination.  Without this delay, a chart which ends in the past (delisted) or a chart with data coming in slowly
		// will never exit historical mode, so we need to prevent repeated requests from the draw() loop.  So we buffer using the behavior forwardPaginationRetryInterval.
		var forwardFetchDoARetry;
		var forwardPaginationRetryIntervalMS=1000*(this.behavior.forwardPaginationRetryInterval||5);

		var seriesNeedsBackFill=false, seriesNeedsFrontFill=false;  // see if series need loading
		if (chart.dataSet.length) {
			for (var key in chart.series) {
				var series=chart.series[key];
				if(series.loading) continue;  // exclude this series
				forwardFetchDoARetry=!series.mostRecentForwardAttempt || series.mostRecentForwardAttempt.getTime()+forwardPaginationRetryIntervalMS<Date.now();

				if(series.moreAvailable!==false && needsBackFill(series)) seriesNeedsBackFill=true;
				if(forwardFetchDoARetry && needsFrontFill(series)) seriesNeedsFrontFill=true;
			}
		}
		
		forwardFetchDoARetry=!chart.mostRecentForwardAttempt || chart.mostRecentForwardAttempt.getTime()+forwardPaginationRetryIntervalMS<Date.now();
		// Now we determine which type of pagination we need
		var mainPastFetch=(needsBackFill(chart) || forceLoadMore) && chart.moreAvailable!==false;
		var mainForwardFetch=(needsFrontFill(chart) || forceLoadMore) && forwardFetchDoARetry;
		var isPastPagination=mainPastFetch || seriesNeedsBackFill;
		var isForwardPagination=stx.isHistoricalModeSet && !isPastPagination && (mainForwardFetch || seriesNeedsFrontFill);

		var interval=stx.layout.interval;
		var timeUnit=stx.layout.timeUnit;
		function closure(self, params){
			if(self.behavior.prefetchAction) self.behavior.prefetchAction("checkLoadMore");
			return function(dataCallback){
				var stx=self.stx, chart=params.chart;
				if(params.symbol==chart.symbol && interval==stx.layout.interval && timeUnit==stx.layout.timeUnit){	// Make sure user hasn't changed symbol while we were waiting on a response
					if(!params.loadMore) { params.chart.loadingMore=false; }
					if(!dataCallback.error){
						if(!dataCallback.quotes) dataCallback.quotes=[];
						var quotes=dataCallback.quotes, masterData=chart.masterData;
						quotes=self.cleanup(stx,null,quotes,CIQ.QuoteFeed.PAGINATION,params);
						if(quotes.length && chart.masterData.length){  // remove possible dup with master data's first record
							if(params.future){
								// remove possible dup with master data's first record
								var firstQuote=quotes[0];
								if(firstQuote.DT && firstQuote.DT==chart.masterData[chart.masterData.length-1].DT) masterData.pop();
							}else{
								// remove possible dup with master data's last record
								var lastQuote=quotes[quotes.length-1];
								if(lastQuote.DT && +lastQuote.DT==+chart.masterData[0].DT) masterData.shift();
							}
						}

						if(!params.future){
							// set moreAvailable before we call draw or we can create an infinite loop if the feed servers runs out of data in the middle of a draw
							// if dataCallback.moreAvailable is set to either true or false, set chart.moreAvailable to that value
							// if dataCallback.moreAvailable is not set at all (null or undefined), then set chart.moreAvailable to dataCallback.quotes.length!==0
							if(dataCallback.moreAvailable) chart.moreAvailable=true;
							else if(dataCallback.moreAvailable===false || !quotes.length) chart.moreAvailable=false; // Can't be more available if we got nothing back
							else chart.moreAvailable=true;
						}else{
							if(stx.isHistoricalModeSet && quotes.length<2) chart.mostRecentForwardAttempt=new Date();  // no quotes for future query, so timestamp this query
						}
						self.tickMultiplier= quotes.length ? 2 : self.tickMultiplier*2;

						chart.loadingMore=false; // this has to be set before draw() so we may call another pagination from it

						if(params.loadMoreReplace){
							stx.setMasterData(quotes, chart, {noCleanupDates:true});
						} else if(params.future){
							stx.updateChartData(quotes, chart, {noCreateDataSet:true, noCleanupDates:true});
						}else{
							CIQ.addMemberToMasterdata({stx:stx, chart:chart, data:quotes, fields:["*"], noCleanupDates:true});
						}
						if(quotes.length){
							if(!chart.endPoints.begin || chart.endPoints.begin>quotes[0].DT) chart.endPoints.begin=quotes[0].DT;
							if(!chart.endPoints.end || chart.endPoints.end<quotes[quotes.length-1].DT) chart.endPoints.end=quotes[quotes.length-1].DT;
						}

						stx.createDataSet(undefined, undefined, {appending: params.future});

						if(!nodraw) stx.draw();
						self.executeTagAlongs(params);
						if(self.behavior.callback){
							self.behavior.callback(params);
						}
						self.loadDependents(params,cb,CIQ.QuoteFeed.PAGINATION);
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
			if(isForwardPagination || !stx.maxDataSetSize || chart.dataSet.length<stx.maxDataSetSize){
				if(isPastPagination || isForwardPagination){
					chart.initialScroll=chart.scroll;
					chart.loadingMore=true;
					params=this.makeParams(chart.symbol, chart.symbolObject, chart);
					params.future=isForwardPagination;
					if(chart.masterData && chart.masterData.length) {
						if(isForwardPagination) params.startDate=chart.endPoints.end;
						else params.endDate=chart.endPoints.begin;
						var firstLast;
						// fallback on masterData endpoints
						if(isForwardPagination && !params.startDate){
							firstLast = stx.getFirstLastDataRecord(chart.masterData, "DT", true);
							if(firstLast) params.startDate=firstLast.DT;
						}else if(isPastPagination && !params.endDate){
							firstLast = stx.getFirstLastDataRecord(chart.masterData, "DT");
							if(firstLast) params.endDate=firstLast.DT;
						}
					} else {
						params.endDate=new Date();
					}
					params.originalState=CIQ.shallowClone(params);
					params.nodraw=nodraw;
					if((!mainPastFetch && seriesNeedsBackFill) ||
						(!mainForwardFetch && seriesNeedsFrontFill)){
						this.loadingMore=true;
						this.loadDependents(params, finish, CIQ.QuoteFeed.PAGINATION);
						if(cb) cb(null);
						return;
					}
					if(stx.fetchMaximumBars[stx.layout.aggregationType]) {
						params.fetchMaximumBars=true;
						if (!stx.maxMasterDataSize || this.behavior.maximumTicks<stx.maxMasterDataSize)params.ticks=this.behavior.maximumTicks;
						else params.ticks=stx.maxMasterDataSize;
					}
					var closureCB=closure(this, params);
					if(stx.isEquationChart(params.symbol)){  //equation chart
						CIQ.fetchEquationChart(params, closureCB);
					}else{
						if(isForwardPagination) params.appending=true;
						CIQ.ChartEngine.Driver.fetchData(CIQ.QuoteFeed.PAGINATION, this.quoteFeed, params, closureCB);
					}
					fetching=true;
				}
			}
		}
		if(!fetching && cb) cb(null);
	};

	/**
	 * Returns how many bars should be fetched. If we're fetching a series then it's simply the number
	 * of bars already in the chart. Otherwise it's twice the number of bars to fetch to fill up the screen.
	 * If we're rolling our own months or weeks from daily ticks it will return the number of daily ticks to fetch.
	 *
	 * @param  {object} params Parameters
	 * @param  {object} params.stx	  The chart object
	 * @return {number}		   Number of bars to fetch
	 * @memberOf CIQ.ChartEngine.Driver
	 * @private
	 */
	CIQ.ChartEngine.Driver.prototype.barsToFetch=function(params){
		if( !CIQ.isValidNumber(this.tickMultiplier) ) this.tickMultiplier=2;  // used to determine params.ticks
		if(params.isSeries) return params.stx.masterData.length;
		var interval=this.stx.layout.interval;
		var p=params.stx.layout.periodicity;
		// Rough calculation, this will account for 24x7 securities
		// If we're rolling our own months or weeks then adjust to daily bars
		if((interval=="month" || interval=="week") && !this.stx.dontRoll){
			p*=(interval=="week")?7:30;
		}
		var bars=params.stx.chart.maxTicks*p;
		return bars*this.tickMultiplier;
	};

	/**
	 * Calculates the suggestedStartDate for a query to a quoteFeed. Will either do a quick estimation if fetchMaximimBars is true for effiency or use a market iterator to find the exact start date.
	 * This should only be called after the correct ticks have been determined.
	 * @param {object} params
	 * @param {object} iterator
	 * @param {number} ticks
	 * @return {Date} suggestedStartDate
	 * @memberof CIQ.ChartEngine.Driver
	 * @private
	 * @since 5.1.1
	 */
	CIQ.ChartEngine.Driver.determineStartDate=function(params, iterator, ticks){
		return this.determineStartOrEndDate(params, iterator, ticks, true);
	};

	/**
	 * Calculates either the suggestedStartDate or suggestedEndDate for a query to a quoteFeed. Will either do a quick estimation if fetchMaximimBars is true for effiency or use a market iterator to find the exact end date.
	 * When passing in a truthy boolean will  calcluate the suggestedStartDate.
	 * This should only be called after the correct ticks have been determined.
	 * @param {object} params Params object used by the QuoteDriver in fetching data
	 * @param {object} iterator Market iterator to used to advance and find a date
	 * @param {number} ticks Ticks to fetch
	 * @param {boolean} direction Direction to check date from
	 * @return {Date} determinedDate (or present day)
	 * @memberof CIQ.ChartEngine.Driver
	 * @private
	 * @since 6.0.0
	 */
	CIQ.ChartEngine.Driver.determineStartOrEndDate=function(params, iterator, ticks, isStart){
		var interval=params.interval, period=params.stx.layout.periodicity,multiplier=CIQ.Market.Symbology.isForexSymbol?1.3:4;
		var determinedDate, base;
		if(interval==="millisecond" || interval==="second") base=CIQ.SECOND*period*multiplier;
		else if(interval==="minute") base=CIQ.MINUTE*period*multiplier;
		else base=CIQ.DAY * multiplier;
		if(params.fetchMaximumBars){
			var offset=ticks*base, begin=iterator.begin.getTime();
			determinedDate = isStart?new Date(begin-offset):new Date(begin+offset);
		} else if(isStart){
			determinedDate = params.startDate || iterator.previous(ticks);
		} else {
			determinedDate = params.future?iterator.next(ticks):new Date();
		}
		return determinedDate;
	};

	CIQ.ChartEngine.Driver.prototype.makeParams=function(symbol, symbolObject, chart){
		var stx=this.stx;
		var interval=stx.layout.interval;
		var ticks=this.barsToFetch({stx:stx});
		// If we're rolling our own months or weeks then we should ask for days from the quote feed
		if((interval=="month" || interval=="week") && !stx.dontRoll){
			interval="day";
		}
		var params=CIQ.shallowClone(this.behavior);

		var extended=false, sessions=chart.market.getSessionNames();
		if(stx.extendedHours){
			if(stx.extendedHours.filter) {
				extended=true;
			}
			else {
				extended=stx.layout.extended;
				// filter out unwanted sessions
				sessions=sessions.filter(function(el) {
					return el.enabled || stx.layout.marketSessions[el.name];
				});
			}
		}else{
			sessions=sessions.filter(function(el) {
				return el.enabled;
			});
		}
		for(var sess=0;sess<sessions.length;sess++){
			sessions[sess]=sessions[sess].name;  // remove "enabled" bit
		}

		CIQ.extend(params,{
			stx: stx,
			symbol: symbol,
			symbolObject: symbolObject,
			chart: chart,
			interval: interval,
			extended: extended,
			period: 1,
			ticks: ticks,
			additionalSessions: sessions
		}, true);

		if (!params.symbolObject) params.symbolObject={symbol:symbol};

		if(!isNaN(params.interval)){	// normalize numeric intervals into "minute", "second" or "millisecond" form as required by fetch()
			params.period=parseInt(params.interval,10); // in case it was a string, which is allowed in setPeriodicity.
			params.interval=stx.layout.timeUnit;
			if(!params.interval) params.interval="minute";
		}
		return params;
	};

	CIQ.ChartEngine.Driver.prototype.newChart=function(params, cb){
		var stx=this.stx;
		var symbol=params.symbol;
		var interval=stx.layout.interval;
		var timeUnit=stx.layout.timeUnit;
		var chart=params.chart;
		chart.moreAvailable=null;
		chart.loadingMore=false;
		chart.attribution=null;
		var qparams=this.makeParams(symbol, params.symbolObject, chart);
		CIQ.extend(qparams, params, true);
		// Some aggregation types potentially require a lot of data. We set the flag "fetchMaximumBars"
		// but also take a guess and say 20,000 bars should cover most situations
		if(stx.fetchMaximumBars[stx.layout.aggregationType] || params.fetchMaximumBars){
			if (!stx.maxMasterDataSize || this.behavior.maximumTicks<stx.maxMasterDataSize)qparams.ticks=this.behavior.maximumTicks;
			else qparams.ticks=stx.maxMasterDataSize;
			qparams.fetchMaximumBars=true;
		}

		function closure(self, qparams){
			if(self.behavior.prefetchAction) self.behavior.prefetchAction("newChart");
			return function(dataCallback){
				var chart=qparams.chart, quotes=dataCallback.quotes, success=false;
				self.loadingNewChart=false; // this has to be set before home() so we may call a pagination from it
				if(symbol==chart.symbol && interval==stx.layout.interval && timeUnit==stx.layout.timeUnit){	// Make sure user hasn't changed symbol while we were waiting on a response
					if(!dataCallback.error){
						quotes=self.cleanup(stx,null,quotes,CIQ.QuoteFeed.INITIAL,qparams);
						stx.setMasterData(quotes, chart, {noCleanupDates:true});
						chart.endPoints={};
						if(quotes.length){
							chart.endPoints.begin=quotes[0].DT;
							chart.endPoints.end=quotes[quotes.length-1].DT;
						}
						// Note, quotes.length==0 will not set moreAvailable to false, just in case the stock is thinly traded
						// We'll rely on checkLoadMore to make the definitive decision
						if(!quotes) chart.moreAvailable=false;
						else chart.moreAvailable=(dataCallback.moreAvailable===false)?false:true;

						chart.attribution=dataCallback.attribution;
						if(params.initializeChart) stx.initializeChart();
						stx.createDataSet();
						success=true;
					}else{
						self.quoteFeed.announceError(qparams.originalState, dataCallback);
					}
				}else{
					//console.log("orphaned request", qparams);
					if(cb) cb("orphaned");
					return;
				}

				// new data means that all series could potentially have historical data. So reset them all.
				for(var key in chart.series) {
					chart.series[key].endPoints={};
					chart.series[key].moreAvailable=null;
				}

				// We've now responded to the newChart() callback. Please note that dependents are now being loaded in parallel!
				var masterData=chart.masterData;
				if(masterData && masterData.length){
					qparams.startDate=masterData[0].DT;
					qparams.endDate=masterData[masterData.length-1].DT;
				}
				self.executeTagAlongs(qparams);
				if(self.behavior.callback){
					self.behavior.callback(qparams);
				}
				self.loadDependents(qparams,function(){
					if(success && !qparams.nodraw) self.stx.home(); // by default the white space is maintained now, so no need to include the {maintainWhitespace:true} parameter
					if(cb) cb(dataCallback.error);
					self.stx.dispatch("newChart", {stx:self.stx, symbol: self.stx.chart.symbol, symbolObject:self.stx.chart.symbolObject, moreAvailable:self.stx.chart.moreAvailable, quoteDriver:self});
					self.resetRefreshInterval(self.behavior.refreshInterval);
				},CIQ.QuoteFeed.INITIAL);

			};
		}
		this.loadingNewChart=true;
		this.updatingChart=false;

		qparams.originalState=CIQ.shallowClone(qparams);
		var closureCB=closure(this, qparams);
		if(this.stx.isEquationChart(qparams.symbol)){  //equation chart
			CIQ.fetchEquationChart(qparams, closureCB);
		}else{
			CIQ.ChartEngine.Driver.fetchData(CIQ.QuoteFeed.INITIAL, this.quoteFeed, qparams, closureCB);
		}
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Below code supports new quotefeed architecture
	///////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////

	//Quotefeed constants defining fetchData's context parameter
	CIQ.QuoteFeed.INITIAL = 1;
	CIQ.QuoteFeed.UPDATE = 2;
	CIQ.QuoteFeed.PAGINATION = 3;
	CIQ.QuoteFeed.SERIES = 4;

	// ALL quotefeed-fetch calls (old and new versions) go through this function
	CIQ.ChartEngine.Driver.fetchData=function(context, quoteFeed, params, cb){
		if (quoteFeed.v2QuoteFeed) { // if new version of quotefeed
			if (typeof quoteFeed.subscribe !== "function") { // if no subscribe function defined then this is a typical quotefeed
				CIQ.ChartEngine.Driver.fetchDataInContext(context, quoteFeed, params, cb);
			} else { // else this is a "subscription" quotefeed
				CIQ.ChartEngine.Driver.fetchDataInContext(context, quoteFeed, params, function(results){
					if(!results.error){
						quoteFeed.checkSubscriptions(params.stx);
					}
					cb(results);
				});
			}
		} else { // old version of quotefeed
			params.stx.convertToDataZone(params.startDate);
			params.stx.convertToDataZone(params.endDate);
			quoteFeed.fetch(params, cb);
		}
	};

	// if not a "subscription" quotefeed, then this function is always called for new quotefeed -- here the user's quotefeed is invoked;
	// functions not defined in quotefeed are skipped over
	CIQ.ChartEngine.Driver.fetchDataInContext=function(context, quoteFeed, params, cb){
		var iterator_parms, iterator, suggestedStartDate, suggestedEndDate;
		var stx=params.stx;
		// When dealing with a series, we need to look at the original params in order to figure out
		// what type of request we really need to make
		if(context===CIQ.QuoteFeed.SERIES){
			params.series = true;
			context=CIQ.QuoteFeed.INITIAL;
			if((params.endDate && !params.startDate) || params.future) context=CIQ.QuoteFeed.PAGINATION;
			else if(params.startDate && !params.endDate) context=CIQ.QuoteFeed.UPDATE;
		}
		var ticks=Math.min(params.ticks, stx.quoteDriver.behavior.maximumTicks);
		if(quoteFeed.maxTicks) ticks=Math.min(ticks,quoteFeed.maxTicks);
		switch(context)	{
		case CIQ.QuoteFeed.UPDATE:

			if(stx.isHistoricalModeSet) {
				stx.quoteDriver.updatingChart=false;
				return;
			}

			var startDate;
			if (params.startDate){
				startDate=params.startDate;
			}else{
				startDate=new Date(); // occurs if initial fetch returned no data
				startDate.setHours(0,0,0,0);
			}
			if (typeof quoteFeed.fetchUpdateData === "function"){
				quoteFeed.fetchUpdateData(params.symbol, stx.convertToDataZone(startDate), params, cb);
			}

			break;
		case CIQ.QuoteFeed.INITIAL:
			//Now need to calculate suggested dates
			suggestedEndDate = params.endDate || new Date();
			iterator_parms = {
				"begin": suggestedEndDate,
				"interval": params.interval =='tick' ? 1:params.interval,
				"periodicity": params.interval =='tick' ? stx.chart.xAxis.futureTicksInterval:params.period,
				"outZone": stx.dataZone
			};
			iterator=stx.chart.market.newIterator(iterator_parms);
			suggestedStartDate = CIQ.ChartEngine.Driver.determineStartDate(params, iterator, ticks);
			if(params.endDate) suggestedEndDate = params.endDate;
			if (typeof quoteFeed.fetchInitialData === "function"){
				quoteFeed.fetchInitialData(params.symbol, suggestedStartDate, stx.convertToDataZone(suggestedEndDate), params, cb);
			}
			break;
		case CIQ.QuoteFeed.PAGINATION:
			iterator_parms = {
				"begin": params.endDate||params.startDate,
				"interval": params.interval =='tick' ? 1:params.interval,
				"periodicity": params.interval =='tick' ? stx.chart.xAxis.futureTicksInterval:params.period,
				"outZone": stx.dataZone
			};
			iterator=stx.chart.market.newIterator(iterator_parms);
			var suggestedDate=CIQ.ChartEngine.Driver.determineStartOrEndDate(params, iterator, ticks, !params.future);
			suggestedStartDate=params.startDate || suggestedDate;
			suggestedEndDate=params.endDate || suggestedDate;
			if (!params.startDate)params.stx.convertToDataZone(suggestedEndDate);
			else params.stx.convertToDataZone(suggestedStartDate);

			if (typeof quoteFeed.fetchPaginationData === "function"){
				if (stx.maxMasterDataSize && stx.maxMasterDataSize <= stx.masterData.length) return;

				quoteFeed.fetchPaginationData(params.symbol, suggestedStartDate, suggestedEndDate, params, cb);
			}
			break;
		default:
			console.error("Illegal fetchData constant");
		}

	};

	return _exports;
})/* removeIf(umd) */(typeof window !== 'undefined' ? window : global)/* endRemoveIf(umd) */;
