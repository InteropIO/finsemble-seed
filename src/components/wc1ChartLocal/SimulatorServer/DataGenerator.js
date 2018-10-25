// -------------------------------------------------------------------------------------------
// Copyright 2012-2018 by ChartIQ, Inc
// -------------------------------------------------------------------------------------------
// SAMPLE QUOTEFEED IMPLEMENTATION -- Connects charts to ChartIQ Simulator
///////////////////////////////////////////////////////////////////////////////////////////////////////////

/*jshint esversion: 6 */

(function (definition) {
	"use strict";

	if (typeof exports === "object" && typeof module === "object") {
		module.exports = definition(definition);
	} else if (typeof define === "function" && define.amd) {
		define(definition);
	} else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition(global);
	} else {
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for quoteFeedSimulator.js.");
	}
})(function(exports){

	var DG = exports.DG = {
		sessionData: {},
		reqHistory: [],
		MAXHISTORY: 100,
		MAXRECORDS: 50000,
		MAXTIME: 20000,
		VALID_RETURNDATE: ['UTC', 'yyyy', 'epoch', undefined],
		VALID_INTERVALS: ['tick', 'millisecond', 'second', 'minute', 'day', 'week', 'month'],
		INVALID_SYMBOLS: ['DT', 'INVLD', 'FALSE', 'SNF', 'XXXX', '0'],
		GARBAGE_COLLECTION_INTERVAL : 8/*hrs*/ * (60 * 60 *1000), //number of milliseconds between garbage collections
		SESSION_EXPIRATION_INTERVAL : 96/*hrs*/ * (60 * 60 *1000), //number of milliseconds without communication before session expires
		DELISTED_SYMBOLS : {
			"GONE":new Date(2014,11,31,16,0,0,0),
			"DELISTED":new Date(2017,11,29,16,0,0,0)
		}
	};

	/** Creates a Gaussian random function with the given mean and stdev
	 * We use this to generate a bell curve for our random data
	 *@see http://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
	 */
	DG.gaussianGenerator = function(mean, stdev) {
		var y2;// since already have data, only update if the boundaries have changed
		var use_last = false;
		return function() {
			var y1;
			if(use_last) {
				y1 = y2;
				use_last = false;
			}
			else {
				var x1, x2, w;
				do {
					x1 = 2.0 * Math.random() - 1.0;
					x2 = 2.0 * Math.random() - 1.0;
					w  = x1 * x1 + x2 * x2;
				} while( w >= 1.0);
				w = Math.sqrt((-2.0 * Math.log(w))/w);
				y1 = x1 * w;
				y2 = x2 * w;
				use_last = true;
			}

			var retval = mean + stdev * y1;
			if(retval > 0)
				return retval;
			return -retval;
		};
	};

	DG.gaussian = DG.gaussianGenerator(50,15); // create Gaussian random generator with mean=50 and stdev=15
	DG.gaussianVol = DG.gaussianGenerator(50,10); // create Gaussian random generator with mean=50 and stdev=10

	// sets see for random generator
	DG.setRandomSeed=function(seed){
		DG.m_w = seed;
		DG.m_z = seed * 17;
	};

	// returns a random number of milliseconds for a gap between ticks (between 1 and 1000 * period)
	DG.randomPeriod=function(period){
		return Math.floor(Math.random()*1000*period);
	};

	/**
	 * Returns number between 0 (inclusive) and 1.0 (exclusive) like Math.random() but supports a "seed"
	 */
	DG.random=function ()
	{
		var mask = 0xffffffff;
		DG.m_z = (36969 * (DG.m_z & 65535) + (DG.m_z >> 16)) & mask;
		DG.m_w = (18000 * (DG.m_w & 65535) + (DG.m_w >> 16)) & mask;
		var result = ((DG.m_z << 16) + DG.m_w) & mask;
		result /= 4294967296;
		return result + 0.5;
	};

	/**
	 * Simply returns with a boolean if the requested interval is daily
	 * @return boolean
	 */
	DG.isDaily=function(interval){
		return interval=="day" || interval=="week" || interval=="month";
	};

	/**
	 * Quickly calculates the milliseconds requested by a given interval and period
	 * @return number milliseconds requested
	 */
	DG.millisecondsPerIntervalPeriod=function(interval,period) {
		var result=1;
		switch(interval) {
			case "millisecond": case "tick": result=1; break;
			case "second": result = 1000; break;
			case "minute": result = 60 * 1000; break;
			case "day": result = 7 * 60 * 60 * 1000; break; // based on estimate of open hours
			case "week": result = 5 * 7 * 60 * 60 * 1000; break;
			case "month": result = 23 * 7 * 60 * 60 * 1000;
		}
		return result * period;
	};
	/**
	 * Creates a key to be stored in DG.sessionData
	 */
	DG.generateSessionKey=function(session,symbolIdentifier) {
		var sessionKey=null;
		if (session !== null) {
			sessionKey = session + ":" + symbolIdentifier; // string to identify session for the given symbol/identifier
		}
		return sessionKey;
	};


	/**
	 * Searches the DG.sesionData for the session key and uses the response to determine the direction to iterate.
	 * If a session is found also returns the starting object containing a quote to build data from.
	 * @param string sessionKey A key constructed from DG.generateSessionKey. Corresponds to an entry in DG.sessionData
	 * @param object parms
	 * @return object guidance Object telling which direction to iterate and containing the starting time to iterate from
	 */
	DG.getSessionGuidance = function(sessionKey, params){
		var guidance = { update: false, millisecondsPerBar: DG.millisecondsPerIntervalPeriod(params.interval,params.period), firstUpdate: true };
		if (sessionKey !== null) {
			var sd = DG.sessionData[sessionKey]; // query the session data (may or may not exist)
			if (!sd || sd.interval!==params.interval || sd.period!==params.period) { // if no session data or periodicity doesn't match then generate a new set of data;
				guidance.genorder="forward";
			} else { // there is relevant session data
				guidance.firstUpdate=sd.firstUpdate; // based on whether previous query was an update
				if (DG.zeroTime(params.enddate, params.interval) <= DG.zeroTime(sd.firstBar.DT, params.interval)) {
					// the pagination case -- use first-bar data as the starting point
					guidance.genorder="backward";
					guidance.startingObject=sd.firstBar;
			} else if (DG.zeroTime(params.startdate, params.interval) >= DG.zeroTime(sd.lastBar[0].DT, params.interval)) { // looks like it will be an update
					guidance.update=true; // update case
					guidance.genorder="forward";
					for (var i=0; i<sd.lastBar.length; i++) {
						if (+DG.zeroTime(params.startdate, params.interval) == +DG.zeroTime(sd.lastBar[i].DT, params.interval)) {
							guidance.startingObject=sd.lastBar[i];
							guidance.millisecondsPerBar = Math.min(Date.now() - sd.lasttimestamp, guidance.millisecondsPerBar);
							break;
						}
					}
					if (i == sd.lastBar.length){ // if no matching date was found in the lastBar data
						guidance.update=false; // since no matching date, assume it must be a new bar
						guidance.startingObject=sd.lastBar[sd.lastBar.length-1]; // but use the last bar for reference data
					}
				} else {
					// session request in middle of data; should never occur (except for an innocuous bug in charts); treat as new request
					guidance.genorder="forward";
				}
			}


		} else { // no session key (likely running with old quotefeed) so use order guidance passed in on the HTTP request (or default)
			guidance.genorder = params.genorder;
		}
		return guidance;
	};

	DG.tracelog=function(message){
		console.log(new Date()+" "+message);
	};

	/**
	 * Simple way to parse request and generate a params object containing requesting info
	 * @param sting req the url of requested data
	 * @return object params Object containing all requested values
	 */
	DG.parseRequest = function(req){
		var r = req.split('?');
		var reqParams = r[1].split('&');
		var params = {};
		reqParams.forEach(function(p){
			var tmp = p.split('=');
			params[tmp[0]] = tmp[1];
		});

		return params;
	};

	/**
	 * Ensures defaults after parsing a request.
	 * Parses numbers and dates for later functions
	 * @param object params object of parsed query
	 * @param object params object with defaults and parsed values
	 */
	DG.ensureDefaults = function(params){
		params.basevalue?parseInt(params.basevalue,10):params.basevalue=100;
		params.seed?parseInt(params.seed,10):params.seed=1000*DG.random();
		if(!params.genorder) params.genorder='forward';
		if(!params.adjclose) params.adjclose=false;
		if(params.extended != "true" &&
			params.extended.toLowerCase() != "y" &&
			params.extended.toLowerCase() != "yes" &&
			params.extended != 1) params.extended=false;
		params.min?parseInt(params.min,10):params.min=0.01;
		params.startdate = new Date(params.startdate);
		params.enddate = new Date(params.enddate|| Date.now());
		params.variance=2; // no longer a request param, but set here
		params.period=parseInt(params.period, 10);

		return params;
	};

	/**
	 * Ensures that the requested query is valid. There are four necessary parameters, startdate, interval, identifier and returndate.
	 * Valid responses interval, and return date are in DG.VALID_RETURN and DG.VALID_INTERVAL. If no returndate then UTC is set as default
	 * All identifiers except those in DG.INVALID_IDENTIFIERS are considered valid.
	 * @param object reqParams a parsed query url from DG.parseRequest
	 * @return object tells whether query is valid and any error
	 */
	DG.validateRequest = function(reqParams) {
		var response = {legal:true};
		if (nullOrUndef(reqParams.startdate)){
			response.legal = false;
			response.error = 'startdate missing in query';
		}

		if (DG.VALID_RETURNDATE.indexOf(reqParams.returndate) == -1) {
			response.legal = false;
			response.error = 'invalid returndate in query';
		}

		if (DG.VALID_INTERVALS.indexOf(reqParams.interval) == -1){
			response.legal = false;
			response.error = 'invalid interval in query';
		}

		if (DG.INVALID_SYMBOLS.indexOf(reqParams.identifier) != -1) {
			response.legal = false;
			response.error = 'invalid symbol in query';
		}

		return response;
	};

	/**
	 * Generates a quote based on specified criteria
	 * @return object newQuote
	 */
	DG.randomQuoteWithGuidance=function(baseValue,update,firstUpdate,startingObject,timeStamp,adjclose,variance,min,millisecondsPerBar,interval,isExtended) {
		var newQuote = {};
		var Close;

		if (interval!="tick" && startingObject && update) { // if starting values and update, then create delta off starting values
			newQuote = DG.updateQuote(firstUpdate,startingObject,variance,millisecondsPerBar,adjclose,false,isExtended);
		} else {
			if (startingObject && +DG.zeroTime(startingObject.DT,interval) == +DG.zeroTime(timeStamp,interval)) { // if starting values but not an update, then use starting values for quote
				newQuote = startingObject;
			} else {
				if (startingObject) {
					Close=startingObject.Close - (DG.random()-0.5)*variance/(isExtended?10:1);
				} else {
					Close=baseValue;
				}
				newQuote = DG.newQuote(Close,timeStamp,adjclose,variance,min,millisecondsPerBar,interval=="tick",isExtended);
			}
		}

		return newQuote;
	};

	/**
	 * Generates a single new "random" OHLC quote with realistic values for equities
	 * @return object newQuote
	 */
	DG.newQuote=function(close,timeStamp,adjcloseFlag,variance,min,millisecondsPerBar,isTick,isExtended) {

		var forceUpperBound = 0.95; // used to force occasional values to top
		var forceLowerBound = 1 - forceUpperBound; // used to force occasional values to bottom
		var range = DG.gaussian()/100 * (close * 0.02); // range is based on small percentage of close and will equal "High - Low"
		if(isExtended) {
			range/=10;
			variance/=10;
		}

		var closePosition = Math.random(); // relative position of baseline in the range
		if (closePosition > forceUpperBound) closePosition = 1; // force occasional closings at high
		if (closePosition < forceLowerBound) closePosition = 0; // force occasional closings at low

		var openPosition = Math.random(); // relative position of open
		if (openPosition > forceUpperBound) openPosition = 1; // force occasional openings at high
		if (openPosition < forceLowerBound) openPosition = 0; // force occasional openings at low

		// the close value and range are used to set the remaining values
		var low = close - (range * (1 - closePosition));
		var high = close + (range * (closePosition));
		var open = low + (range * openPosition);

		var newQuote={
			Close: Math.round(close*100)/100
		};
		if(isTick){
			newQuote.Ask=Math.round(high*100)/100,
			newQuote.Bid=Math.round(low*100)/100;
		}else{
			newQuote.Open=Math.round(open*100)/100,
			newQuote.High=Math.round(high*100)/100,
			newQuote.Low=Math.round(low*100)/100;
		}

		if (adjcloseFlag) newQuote.Adj_Close=newQuote.Close;
		newQuote.Volume=DG.volume(newQuote.Close < newQuote.Open, variance, millisecondsPerBar);
		newQuote.DT= timeStamp;

		// if randomly generated numbers are not in bounds, then bound them
		if (newQuote.Open < min) { newQuote.Open = min; }
		if (newQuote.Close < min) { newQuote.Close = min; }
		if (newQuote.Adj_Close < min) { newQuote.Adj_Close = min; }
		if (newQuote.High < min) { newQuote.High = min; }
		if (newQuote.Low < min) { newQuote.Low = min; }

		return newQuote;
	};

	/**
	 * Updates a previous quote (i.e. partial bar of data is being updated)
	 */
	DG.updateQuote=function(firstUpdate,quote,variance,millisecondsPerBar,adjCloseFlag,isTick,isExtended) {
		var gm=1;
		if(isExtended) {
			gm=0.1;
			variance/=10;
		}
		quote.Close = Math.round((quote.Close - (gm*DG.gaussian()/100 * (quote.Close * 0.005) * (0.5 - Math.random()))) * 100) / 100;
		if(adjCloseFlag) quote.Adj_Close = quote.Close;
		if(isTick){
			if (quote.Close > quote.Ask) { quote.Ask = quote.Close; }
			if (quote.Close < quote.Bid) { quote.Bid = quote.Close; }
		}else{
			if (quote.Close > quote.High) { quote.High = quote.Close; }
			if (quote.Close < quote.Low) { quote.Low = quote.Close; }
		}
		if (firstUpdate) { // turns out not need but keep just in case for future tuning
			quote.Volume += DG.volume(quote.Close < quote.Open, variance, millisecondsPerBar);
		} else {
			quote.Volume += DG.volume(quote.Close < quote.Open, variance, millisecondsPerBar);
		}
		//open is left unchanged
		return quote;
	};

	/**
	 * Calculates volume base on whether the market if up/down and if this is a fractional volume value for updates
	 * @return number Volume
	 */
	DG.volume=function(upMarket, variance, millisecondsPerBar) {
		var volume=2.0; // set base value per millisecond
		if(upMarket) volume = volume / 1.1; // lower volume for green candles
		volume = Math.round(volume * DG.gaussianVol()/50 * variance/2 * millisecondsPerBar);
		return volume;
	};

	/**
	 * Format the quote-data's date based on returndate query parameter
	 */
	DG.formatDate=function(quote, returndate, interval){
		if(DG.isDaily(interval)){
			// We need this funky shifting for backwards compatibility - all daily quotes will show 10AM
			if(quote.DT.getUTCHours()>10) quote.DT.setDate(quote.DT.getDate()+1); // East of GMT, add a day to get GMT date to match market date
			quote.DT.setUTCHours(10);  // Set to 10 AM so even Hawaii time zone gets correct date
			// Note this hack will not make the Samoans/American Samoans happy!
		}
		if(returndate == "yyyy"){
			//currently unimplemented
		}else if(returndate == "epoch"){
			quote.DT = quote.DT.getTime();
		}
		return;
	};

	DG.zeroTime=function(date, interval){
		if(!DG.isDaily(interval)) return date;
		var dt=new Date(+date);
		dt.setHours(0,0,0,0);
		return dt;
	};

	/**
	 * Given a sessionKey, data, params, stores a slice of data in DG.sessionData so it can be retrieved later
	 * This is the function that allows our requests to build off of on another when making subsequent queries
	 */
	DG.storeSessionData=function(sessionKey,queryData,params,update){
		if(!queryData || !queryData.length) return;  // no results
		if (sessionKey !== null) { // if HTTP request doesn't provide session id then ignore session logic here
			var now = Date.now();
			var sd = DG.sessionData[sessionKey];
			var lastHistoryLength=10; // need to save an array of lastBar data because the startdata doesn't always match the very last bar (might be earlier)
			if (!sd || sd.interval!==params.interval || sd.period!=params.period) { // if no previous data or periodicity changed
				sd={};
				sd.firstBar = queryData[0];
				sd.lastBar = queryData.slice(queryData.length-lastHistoryLength); // keep the last bars since hard to know exactly which is the last bar in the chart
			} else { // since already have data, only update if the boundaries have changed
				var fb=DG.zeroTime(sd.firstBar.DT,params.interval);
				if (DG.zeroTime(queryData[0].DT,params.interval) < DG.zeroTime(sd.lastBar[0].DT,params.interval) || DG.zeroTime(queryData[0].DT,params.interval) > DG.zeroTime(sd.lastBar[sd.lastBar.length-1].DT,params.interval)) {
					sd.firstBar = queryData[0];
				}
				if (+DG.zeroTime(queryData[queryData.length-1].DT,params.interval) != +fb) { // equal is to handle duplicate query for series (i.e. bug in charts)
					sd.lastBar = queryData.slice(queryData.length-lastHistoryLength); // keep the last bars since hard to know exactly which is the last bar in the chart
				}
			}
			sd.firstUpdate=!update;
			sd.lasttimestamp = now; // captures the last time the session was accessed
			sd.interval = params.interval;
			sd.period = params.period;
			DG.sessionData[sessionKey] = sd;
		}
	};

	/**
	 * Responsible for creating our simulated data based upon CIQ.Market class and the params given via requested URL.
	 * This is where the magic happens and the quotes are generated based on variables set in query.
	 * @param object market a CIQ.Market class
	 * @param object params set or parameters parsed from request URL.
	 */
	DG.generateData = function(market, params){
		var quotes = [];

		if(params.trace) DG.tracelog("    generating random seed");
		DG.setRandomSeed(params.identifier.hashCode() + params.seed); // random number seed is a combination of symbol identifier and seed

		var isExtended = market.zseg_match && (market.zseg_match.name=="pre" || market.zseg_match.name=="post");
		if(params.trace) DG.tracelog("    generating session key");
		var sessionKey = DG.generateSessionKey(params.session,params.identifier);
		if(params.trace) DG.tracelog("    found session with key: ",sessionKey);
		var sGuidance=DG.getSessionGuidance(sessionKey,params);
		if(params.trace) DG.tracelog("    getting session guidance");
		var updateFlag=sGuidance.update;
		var realStartDate=new Date(params.startdate.getTime());
		var realEndDate=new Date(params.enddate.getTime());
		var delistDate=DG.DELISTED_SYMBOLS[params.identifier];
		if(delistDate && DG.zeroTime(delistDate,params.interval)<=realStartDate) return data;  // no updates
		var now=new Date();
		if(DG.isDaily(params.interval)){
			// expand our search by a day in each direction to encompass any TZ differences
			realStartDate.setDate(realStartDate.getDate()-1);
			realEndDate.setDate(realEndDate.getDate()+1);
		}
		if(realEndDate.getTime()>Date.now()) realEndDate=new Date();  // no future ticks!
		if(delistDate && delistDate<realEndDate) realEndDate=new Date(+delistDate);
		if(params.trace) DG.tracelog("    start date="+realStartDate+", end date="+realEndDate);
		var iter1, time, newQuote;
		var timer=new Date();
		if (sGuidance.genorder == "forward") {
			iter1 = market.newIterator(
				{
					"begin" : new Date(+realStartDate),
					"interval": params.interval=="tick"?"millisecond":params.interval,
					"periodicity": params.interval=="tick"?1:params.period
				}
			);
			iter1.next();
			time = new Date(iter1.previous());
			if (time.getTime() != realStartDate.getTime()) { time = new Date(iter1.next()); }
			var lastTime=new Date(time.getTime()-1); // infinite loop protection
			var prevOpen=market.getPreviousOpen(now);
			var prevClose=market.getPreviousClose(now);
			var marketIsClosed=!market._wasOpenIntraDay(now);
			var marketNotYetOpened=marketIsClosed && prevOpen!==null && prevOpen.getDate()!=now.getDate();
			while ((time <= realEndDate) && (time>lastTime)){
				if(params.trace) DG.tracelog("    time="+time+", lastTime="+lastTime);
				if(new Date().getTime()-timer>DG.MAX_TIME) break;
				lastTime=time;
				if(time.getTime()<0) {  //limit history to > epoch
					time = new Date(iter1.next());
					continue;
				}
				var msecClosed=false;  // this so we don't leak out updates for ticks due to random time between them
				if(updateFlag && marketIsClosed) {
					updateFlag=false;
					msecClosed=true;
				}
				if(params.trace) DG.tracelog("    generating new quote");
				newQuote=DG.randomQuoteWithGuidance(params.basevalue, updateFlag, sGuidance.firstUpdate, sGuidance.startingObject, new Date(+time), params.adjclose, params.variance, params.min, sGuidance.millisecondsPerBar, params.interval,isExtended);
				if(marketNotYetOpened && DG.isDaily(params.interval) && newQuote.DT>prevClose && newQuote.DT.getDate()==now.getDate()) {
					// do not include daily data from today if market not yet open
					break;
				}
				DG.formatDate(newQuote, params.returndate, params.interval);
				if(newQuote.DT>=params.startdate && DG.zeroTime(newQuote.DT,params.interval)<=params.enddate){
					if(!quotes.length || quotes[quotes.length-1].DT<newQuote.DT){
						if(params.trace) DG.tracelog("    adding new quote");
						quotes.push(newQuote);
						sGuidance.startingObject = newQuote;
						sGuidance.millisecondsPerBar = DG.millisecondsPerIntervalPeriod(params.interval,params.period);
						updateFlag=false; // update guidance only applies to the first bar
						if(quotes.length==DG.MAX_RECORDS) break;
					}
				}
				if(params.interval=="tick"){
					var msecs=msecClosed?1000:DG.randomPeriod(params.period);
					time = new Date(iter1.next(msecs));
				}else{
					time = new Date(iter1.next());
				}
			}
		} else { // then assume genorder is "backward" (plus can't be an update)
			iter1 = market.newIterator(
				{
					"begin" : new Date(+realEndDate),
					"interval": params.interval=="tick"?"millisecond":params.interval,
					"periodicity": params.interval=="tick"?1:params.period
				}
			);
			iter1.previous();
			time = new Date(iter1.next());
			if (time.getTime() != realEndDate.getTime()) { time = new Date(iter1.previous()); }
			var lastTime=new Date(time.getTime()+1);  // infinite loop protection
			while ((time >= realStartDate) && (time<lastTime)){
				if(params.trace) DG.tracelog("    time="+time+", lastTime="+lastTime);
				if(new Date().getTime()-timer>DG.MAX_TIME) break;
				lastTime=time;
				if(time.getTime()<0) break;  //limit history to > epoch
				if(params.trace) DG.tracelog("    generating new quote");
				newQuote=DG.randomQuoteWithGuidance(params.basevalue, false, false, sGuidance.startingObject, new Date(+time), params.adjclose, params.variance, params.min, sGuidance.millisecondsPerBar, params.interval,isExtended);
				DG.formatDate(newQuote, params.returndate, params.interval);
				if(newQuote.DT>=params.startdate && DG.zeroTime(newQuote.DT,params.interval)<=params.enddate){
					if(!quotes.length || quotes[quotes.length-1].DT>newQuote.DT){
						if(params.trace) DG.tracelog("    adding new quote");
						quotes.push(newQuote);
						sGuidance.startingObject = newQuote;
						if(quotes.length==DG.MAX_RECORDS) break;
					}
				}
				time = new Date(iter1.previous(params.interval=="tick"?DG.randomPeriod(params.period):1));
			}
			quotes.reverse(); // have to reverse in this case so dates will be in correct order for library
		}

		// This line prevents infinite loop of pagination requests once we hit beginning of data, since the same end date is being supplied.
		if(new Date(realStartDate).getTime()<0 && quotes.length==1) quotes=[];

		if(params.trace) DG.tracelog("    storing session data");
		DG.storeSessionData(sessionKey,quotes,params,sGuidance.update); // store session data for next request from same session

		return quotes;
	};

	/////////////
	// Helpers//
	///////////

	function nullOrUndef(field){
		return typeof(field)==="undefined" || field===null || field=="null";
	};

	String.prototype.hashCode=function() {
		var hash = 0, i, chr, len;
		if (this.length === 0) return hash;
		for (i = 0, len = this.length; i < len; i++) {
			chr   = this.charCodeAt(i);
			hash  = ((hash << 5) - hash) + chr;
			hash |= 0; // Convert to 32bit integer
		}
		return hash;
	};

	return exports;
});
