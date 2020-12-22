// -------------------------------------------------------------------------------------------
// Copyright 2012-2016 by ChartIQ, Inc
// -------------------------------------------------------------------------------------------
(function (definition) {
    "use strict";
    // This file will function properly as a <script> tag, or a module
    // using CommonJS and NodeJS or RequireJS module formats.

    if (typeof exports === "object" && typeof module === "object") {
        module.exports = definition(require('./core'));
    } else if (typeof define === "function" && define.amd) {
        define(['core/core'], definition);
    } else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition(global);
    } else {
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for market.js.");
    }

})(function(_exports) {
	console.log("market.js",_exports);

	/**
	 * The market class is what the chart uses to to manage market hours for the different exchanges.
	 * It uses `Market Definitions` to decide when the market is open or closed.
	 * Although you can construct many market classes with different definitions to be used in your functions, only one market definition can be attached to the chart at any given time. 
	 * Once a market is defined, an [iterator]{@link CIQ.Market#newIterator} can be created to traverse trough time, taking into account the market hours. 
	 * Additionally a variety of convenience functions can be used to check the market status, such as {@link CIQ.Market#isOpen} or {@link CIQ.Market#isMarketDay}.
	 *
	 * A chart will operate 24x7, unless a market definition is assigned to it. 
	 * See {@link CIQ.ChartEngine#setMarket} and {@link CIQ.ChartEngine#setMarketFactory} for instructions on how to assign a market definition to a chart.
	 * The chart also provides convenience functions that allows you to traverse trough time at the current chart periodicity without having to explicitly create a new iterator. 
	 * See {@link CIQ.ChartEngine#getNextInterval} and {@link CIQ.ChartEngine#standardMarketIterator} for details.
	 *
	 * `Market Definitions` are JavaScript objects which must contain the following elements:
	 * - `name` : A string. Name of the market for which the rules are for. 
	 * - `rules` : An array. The rules indicating the times the market is open or closed.
	 * - `market_tz` : A string. Time zone in which the market operates. A valid timezone from the timeZoneData.js library.
	 * - `hour_aligned`: A boolean. If set to true, market opening and closing times will be set to the exact start of the hour of time, ignoring any minutes, seconds or millisecond offsets.
	 * - `convertOnDaily` : A boolean. By default, daily charts are not converted for timezone. Set this to true to convert for daily charts.
	 *
	 * Example:
	 * ```
	 * 	{
	 * 		name: "SAMPLE-MARKET",
	 * 		market_tz: "America/Chicago",
	 * 		hour_aligned: true,
	 * 		rules: [
	 * 				{"dayofweek": 1, "open": "09:00", "close": "17:00"}
	 * 		]
	 *	};
	 * ```
	 *
	 * Instructions for creating `Market Definitions`:
	 *
	 * - By default a market assumes that it is always open unless otherwise defined.
	 * - Seconds are not considered for open or close times, but are okay for intra day data.
	 * - Rules are processed top to bottom.
	 * - All non-default market rules are disabled by default.  Non-default market rules will have a `name` parameter included.
	 *  
	 * 		This is a rule for a 'pre' market session: 
	 * 			`{"dayofweek": 1, "open": "08:00", "close": "09:30", name: "pre"}`
	 *  
	 * - First the `dayofweek` wild card rules are processed. As soon as a rule is matched processing breaks.
	 *
	 * 		This rule says the market is open every Monday from 9:30 to 16:00:
	 * 			`{"dayofweek": 1, "open": "09:30", "close": "16:00"}`
	 *
	 * - After the `dayofweek` rules are processed all of the extra rules are processed.
	 * - Wildcard rules should be placed first and more specific rules should be placed later.
	 *
	 * 		This rule is a wildcard rule for Christmas. If Christmas is on Mon the
	 * 		first set of rules will evaluate to true because the dayofweek rule for day
	 * 		one will match. Then this rule will match if the date is the 25th of
	 * 		December in any year and because open is 00:00 and close is 00:00 it will evaluate to false:
	 * 			`{"date": "*-12-25", "open": "00:00", "close": "00:00"}`
	 *
	 * - After wildcard exceptions any specific day and time can be matched.
	 *
	 * 		This rule says closed on this day only. Note that open and closed attributes
	 * 		can be omitted to save typing if the market is closed the entire day:
	 * 			`{"date": "2016-01-18"} //Martin Luther King day.`
	 *
	 * 		This rules says closed on 12-26:
	 * 			`{"date": "2016-12-26"}, //Observed Christmas in 2016`
	 *
	 * 		This rule says partial session
	 * 			`{"date": "2015-12-24", "open": "9:30", "close": "13:00"} //Christmas eve`
	 *
	 * See example section for a compete NYSE definition.
	 * 
	 * Once defined, it can be used to create a new market instnce.
	 * 
	 * Example:
	 * 
	 * ```
	 *	var thisMarket = new CIQ.Market(marketDefinition);
	 * ```
	 *
	 * If no definition is provded, the market will operate 24x7.
	 * 
	 * Example:
	 * ```
	 * new CIQ.Market();
	 * ```
	 * 
	 * @param {Object} [market_definition] A json object that contains the rules for some market. If not defined default market is always open.
	 *
	 * @constructor
	 * @name  CIQ.Market
	 * @since 
	 * <br>04-2016-08
	 * <br>06-2016-02 - You can now specify times for different market sessions ('pre',post', etc) to be used with the sessions visualization tools. See {@link CIQ.ExtendedHours}
	 * 
	 * @example
	 * CIQ.Market.NYSE = {
			"name": "NYSE",
			"market_tz": "America/New_York",
			"hour_aligned": false,
			"rules": [
				//First open up the regular trading times
				//Note that sat and sun (in this example) are always closed because
				//everything is closed by default and we didn't explicitly open
				//them.
				{"dayofweek": 1, "open": "09:30", "close": "16:00"}, //mon
				{"dayofweek": 2, "open": "09:30", "close": "16:00"},
				{"dayofweek": 3, "open": "09:30", "close": "16:00"},
				{"dayofweek": 4, "open": "09:30", "close": "16:00"},
				{"dayofweek": 5, "open": "09:30", "close": "16:00"}, //fri
	
				//After Hours premarket
				{"dayofweek": 1, "open": "08:00", "close": "09:30", name: "pre"}, //mon
				{"dayofweek": 2, "open": "08:00", "close": "09:30", name: "pre"},
				{"dayofweek": 3, "open": "08:00", "close": "09:30", name: "pre"},
				{"dayofweek": 4, "open": "08:00", "close": "09:30", name: "pre"},
				{"dayofweek": 5, "open": "08:00", "close": "09:30", name: "pre"}, //fri

				//After Hours post
				{"dayofweek": 1, "open": "16:00", "close": "20:00", name: "post"}, //mon
				{"dayofweek": 2, "open": "16:00", "close": "20:00", name: "post"},
				{"dayofweek": 3, "open": "16:00", "close": "20:00", name: "post"},
				{"dayofweek": 4, "open": "16:00", "close": "20:00", name: "post"},
				{"dayofweek": 5, "open": "16:00", "close": "20:00", name: "post"}, //fri

				//Now mon thru friday is open. Close any exceptions
	
				//always closed on Christmas
				{"date": "*-12-25", "open": "00:00", "close": "00:00"},
	
				//always closed on 4th of July
				{"date": "*-07-04", "open": "00:00", "close": "00:00"},
	
				//always close on new years day
				{"date": "*-01-01", "open": "00:00", "close": "00:00"},
	
				//Some holidays are observed on different days each year or if
				//the day falls on a weekend. Each of those rules must be specified.
				{"date": "2012-01-02", "open": "00:00", "close": "00:00"},
	
				//As a special case if no open and close attributes are set they
				//will be assumed "00:00" and "00:00" respectively
				{"date": "2017-01-02"},
	
				{"date": "2016-01-18"},
				{"date": "2016-02-15"},
				{"date": "2016-03-25"},
				{"date": "2016-05-30"},
				{"date": "2016-09-05"},
				{"date": "2016-11-24"},
				{"date": "2016-11-25", "open": "8:00", "close": "9:30", name: "pre"},
				{"date": "2016-11-25", "open": "9:30", "close": "13:00"},
				{"date": "2016-12-26"},
	
				{"date": "2015-01-19"},
				{"date": "2015-02-16"},
				{"date": "2015-04-03"},
				{"date": "2015-05-25"},
				{"date": "2015-07-03"},
				{"date": "2015-09-07"},
				{"date": "2015-11-26"},
				{"date": "2015-11-27", "open": "8:00", "close": "9:30", name: "pre"},
				{"date": "2015-11-27", "open": "9:30", "close": "13:00"},
				{"date": "2015-12-24", "open": "8:00", "close": "9:30", name: "pre"},
				{"date": "2015-12-24", "open": "9:30", "close": "13:00"},
	
				{"date": "2014-01-20"},
				{"date": "2014-02-17"},
				{"date": "2014-04-18"},
				{"date": "2014-05-26"},
				{"date": "2014-09-01"},
				{"date": "2014-11-27"},
				{"date": "2014-07-03", "open": "8:00", "close": "9:30", name: "pre"},
				{"date": "2014-07-03", "open": "9:30", "close": "13:00"},
				{"date": "2014-11-28", "open": "8:00", "close": "9:30", name: "pre"},
				{"date": "2014-11-28", "open": "9:30", "close": "13:00"},
				{"date": "2014-12-24", "open": "8:00", "close": "9:30", name: "pre"},
				{"date": "2014-12-24", "open": "9:30", "close": "13:00"},
	
				{"date": "2013-01-21"},
				{"date": "2013-02-18"},
				{"date": "2013-03-29"},
				{"date": "2013-05-27"},
				{"date": "2013-09-02"},
				{"date": "2013-11-28"},
				{"date": "2013-07-03", "open": "8:00", "close": "9:30", name: "pre"},
				{"date": "2013-07-03", "open": "9:30", "close": "13:00"},
				{"date": "2013-11-29", "open": "8:00", "close": "9:30", name: "pre"},
				{"date": "2013-11-29", "open": "9:30", "close": "13:00"},
				{"date": "2013-12-24", "open": "8:00", "close": "9:30", name: "pre"},
				{"date": "2013-12-24", "open": "9:30", "close": "13:00"},
	
				{"date": "2012-01-16"},
				{"date": "2012-02-20"},
				{"date": "2012-04-06"},
				{"date": "2012-05-28"},
				{"date": "2012-09-03"},
				{"date": "2012-10-29"},
				{"date": "2012-10-30"},
				{"date": "2012-11-22"},
				{"date": "2012-07-03", "open": "8:00", "close": "9:30", name: "pre"},
				{"date": "2012-07-03", "open": "9:30", "close": "13:00"},
				{"date": "2012-11-23", "open": "8:00", "close": "9:30", name: "pre"},
				{"date": "2012-11-23", "open": "9:30", "close": "13:00"},
				{"date": "2012-12-24", "open": "8:00", "close": "9:30", name: "pre"},
				{"date": "2012-12-24", "open": "9:30", "close": "13:00"}
			]
		};
	 */
	var CIQ=_exports.CIQ;

	CIQ.Market = function(market_definition) {
	    this.market_def = false;
	    this.rules = false;
	    this.normalHours = [];
	    this.extraHours = [];
	    this.class_name = 'Market';
		if (typeof timezoneJS === 'undefined') {
			this.tz_lib = Date; //needed to run unit tests
		} else {
		    this.tz_lib = timezoneJS.Date;
		}
	    this.market_tz = '';
	    this.hour_aligned = false;
	    this.convertOnDaily=false;
	    this.enabled_by_default = false;
	    
	    //needed to run unit tests otherwise should do nothing
	    if ( typeof market_definition != 'undefined' && market_definition && market_definition != {}) {
	    	if (market_definition.market_definition) {
		    	market_definition = market_definition.market_definition;
	    	}
	        if (market_definition.rules) {
	            this.rules = market_definition.rules;
	        }
	        if (market_definition.market_tz) {
	            this.market_tz = market_definition.market_tz;
	        }
	        if (market_definition.convertOnDaily) {
	            this.convertOnDaily = market_definition.convertOnDaily;
	        }
	        if (typeof market_definition.hour_aligned) {
	            this.hour_aligned = market_definition.hour_aligned;
	        }
	        if (typeof market_definition.enabled_by_default !== 'undefined') {
	        	if (market_definition.enabled_by_default instanceof Array) {
		        	this.enabled_by_default = market_definition.enabled_by_default;
	        	}
	        }
	        
	        this.market_def = market_definition;
	        if (this.market_def.name === undefined) {
	            this.market_def.name = "no market name specified";
	        }
	    } else {
	        return;
	    }
	
	    CIQ.Market._createTimeSegments(this);
	};
	
	//String constants used with market iterators
	CIQ.Market.MILLISECOND = 'millisecond';
	CIQ.Market.SECOND = 'second';
	CIQ.Market.MINUTE = 'minute';
	CIQ.Market.HOUR = 'hour';
	CIQ.Market.DAY = 'day';
	CIQ.Market.WEEK = 'week';
	CIQ.Market.MONTH = 'month';
	
	// TODO, holidays for futures,forex,metals
	CIQ.Market.GLOBEX = {
		name: "GLOBEX",
		market_tz: "America/Chicago",
		hour_aligned: true,
		rules: [
				{"dayofweek": 0, "open": "15:00", "close": "24:00"}, //sun
				{"dayofweek": 1, "open": "00:00", "close": "24:00"},
				{"dayofweek": 2, "open": "00:00", "close": "24:00"},
				{"dayofweek": 3, "open": "00:00", "close": "24:00"},
				{"dayofweek": 4, "open": "00:00", "close": "24:00"},
				{"dayofweek": 5, "open": "00:00", "close": "18:00"},
		]
	};
	
	CIQ.Market.FOREX = {
		name: "FOREX",
		market_tz: "America/New_York",
		hour_aligned: true,
		rules: [
				{"dayofweek": 0, "open": "15:00", "close": "24:00"}, //  9AM NZ time in the winter and 7AM NZ time in the summer.
				{"dayofweek": 1, "open": "00:00", "close": "17:00"},
				{"dayofweek": 1, "open": "17:00", "close": "24:00"},
				{"dayofweek": 2, "open": "00:00", "close": "17:00"},
				{"dayofweek": 2, "open": "17:00", "close": "24:00"},
				{"dayofweek": 3, "open": "00:00", "close": "17:00"},
				{"dayofweek": 3, "open": "17:00", "close": "24:00"},
				{"dayofweek": 4, "open": "00:00", "close": "17:00"},
				{"dayofweek": 4, "open": "17:00", "close": "24:00"},
				{"dayofweek": 5, "open": "00:00", "close": "17:00"}
		]
	};
	
	CIQ.Market.METALS = {
		name: "METALS",
		market_tz: "America/New_York",
		hour_aligned: true,
		rules: [
				{"dayofweek": 0, "open": "18:00", "close": "24:00"},
				{"dayofweek": 1, "open": "00:00", "close": "17:15"},
				{"dayofweek": 1, "open": "18:00", "close": "24:00"},
				{"dayofweek": 2, "open": "00:00", "close": "17:15"},
				{"dayofweek": 2, "open": "18:00", "close": "24:00"},
				{"dayofweek": 3, "open": "00:00", "close": "17:15"},
				{"dayofweek": 3, "open": "18:00", "close": "24:00"},
				{"dayofweek": 4, "open": "00:00", "close": "17:15"},
				{"dayofweek": 4, "open": "18:00", "close": "24:00"},
				{"dayofweek": 5, "open": "00:00", "close": "17:15"}
		]
	};
	
	CIQ.Market.NYSE = {
			"name": "NYSE",
			"market_tz": "America/New_York",
			"hour_aligned": false,
			"rules": [
				//First open up the regular trading times
				//Note that sat and sun (in this example) are always closed because
				//everything is closed by default and we didn't explicitly open
				//them.
				{"dayofweek": 1, "open": "09:30", "close": "16:00"}, //mon
				{"dayofweek": 2, "open": "09:30", "close": "16:00"},
				{"dayofweek": 3, "open": "09:30", "close": "16:00"},
				{"dayofweek": 4, "open": "09:30", "close": "16:00"},
				{"dayofweek": 5, "open": "09:30", "close": "16:00"}, //fri
	
				//After Hours premarket
				{"dayofweek": 1, "open": "04:00", "close": "09:30", name: "pre"}, //mon
				{"dayofweek": 2, "open": "04:00", "close": "09:30", name: "pre"},
				{"dayofweek": 3, "open": "04:00", "close": "09:30", name: "pre"},
				{"dayofweek": 4, "open": "04:00", "close": "09:30", name: "pre"},
				{"dayofweek": 5, "open": "04:00", "close": "09:30", name: "pre"}, //fri

				//After Hours post
				{"dayofweek": 1, "open": "16:00", "close": "20:00", name: "post"}, //mon
				{"dayofweek": 2, "open": "16:00", "close": "20:00", name: "post"},
				{"dayofweek": 3, "open": "16:00", "close": "20:00", name: "post"},
				{"dayofweek": 4, "open": "16:00", "close": "20:00", name: "post"},
				{"dayofweek": 5, "open": "16:00", "close": "20:00", name: "post"}, //fri

				//Now mon thru friday is open. Close any exceptions
	
				//always closed on Christmas
				{"date": "*-12-25", "open": "00:00", "close": "00:00"},
	
				//always closed on 4th of July
				{"date": "*-07-04", "open": "00:00", "close": "00:00"},
	
				//always close on new years day
				{"date": "*-01-01", "open": "00:00", "close": "00:00"},
	
				//Some holidays are observed on different days each year or if
				//the day falls on a weekend. Each of those rules must be specified.
				{"date": "2012-01-02", "open": "00:00", "close": "00:00"},
	
				//As a special case if no open and close attributes are set they
				//will be assumed "00:00" and "00:00" respectively
				{"date": "2017-01-02"},
				{"date": "2017-01-16"},
				{"date": "2017-02-20"},
				{"date": "2017-04-14"},
				{"date": "2017-05-29"},
				{"date": "2017-07-03", "open": "4:00", "close": "9:30", name: "pre"},
				{"date": "2017-07-03", "open": "9:30", "close": "13:00"},
				{"date": "2017-09-04"},
				{"date": "2017-11-23"},
				{"date": "2017-11-24", "open": "4:00", "close": "9:30", name: "pre"},
				{"date": "2017-11-24", "open": "9:30", "close": "13:00"},
				{"date": "2017-12-26"},
	
				{"date": "2016-01-18"},
				{"date": "2016-02-15"},
				{"date": "2016-03-25"},
				{"date": "2016-05-30"},
				{"date": "2016-09-05"},
				{"date": "2016-11-24"},
				{"date": "2016-11-25", "open": "4:00", "close": "9:30", name: "pre"},
				{"date": "2016-11-25", "open": "9:30", "close": "13:00"},
				{"date": "2016-12-26"},
	
				{"date": "2015-01-19"},
				{"date": "2015-02-16"},
				{"date": "2015-04-03"},
				{"date": "2015-05-25"},
				{"date": "2015-07-03"},
				{"date": "2015-09-07"},
				{"date": "2015-11-26"},
				{"date": "2015-11-27", "open": "4:00", "close": "9:30", name: "pre"},
				{"date": "2015-11-27", "open": "9:30", "close": "13:00"},
				{"date": "2015-12-24", "open": "4:00", "close": "9:30", name: "pre"},
				{"date": "2015-12-24", "open": "9:30", "close": "13:00"},
	
				{"date": "2014-01-20"},
				{"date": "2014-02-17"},
				{"date": "2014-04-18"},
				{"date": "2014-05-26"},
				{"date": "2014-09-01"},
				{"date": "2014-11-27"},
				{"date": "2014-07-03", "open": "4:00", "close": "9:30", name: "pre"},
				{"date": "2014-07-03", "open": "9:30", "close": "13:00"},
				{"date": "2014-11-28", "open": "4:00", "close": "9:30", name: "pre"},
				{"date": "2014-11-28", "open": "9:30", "close": "13:00"},
				{"date": "2014-12-24", "open": "4:00", "close": "9:30", name: "pre"},
				{"date": "2014-12-24", "open": "9:30", "close": "13:00"},
	
				{"date": "2013-01-21"},
				{"date": "2013-02-18"},
				{"date": "2013-03-29"},
				{"date": "2013-05-27"},
				{"date": "2013-09-02"},
				{"date": "2013-11-28"},
				{"date": "2013-07-03", "open": "4:00", "close": "9:30", name: "pre"},
				{"date": "2013-07-03", "open": "9:30", "close": "13:00"},
				{"date": "2013-11-29", "open": "4:00", "close": "9:30", name: "pre"},
				{"date": "2013-11-29", "open": "9:30", "close": "13:00"},
				{"date": "2013-12-24", "open": "4:00", "close": "9:30", name: "pre"},
				{"date": "2013-12-24", "open": "9:30", "close": "13:00"},
	
				{"date": "2012-01-16"},
				{"date": "2012-02-20"},
				{"date": "2012-04-06"},
				{"date": "2012-05-28"},
				{"date": "2012-09-03"},
				{"date": "2012-10-29"},
				{"date": "2012-10-30"},
				{"date": "2012-11-22"},
				{"date": "2012-07-03", "open": "4:00", "close": "9:30", name: "pre"},
				{"date": "2012-07-03", "open": "9:30", "close": "13:00"},
				{"date": "2012-11-23", "open": "4:00", "close": "9:30", name: "pre"},
				{"date": "2012-11-23", "open": "9:30", "close": "13:00"},
				{"date": "2012-12-24", "open": "4:00", "close": "9:30", name: "pre"},
				{"date": "2012-12-24", "open": "9:30", "close": "13:00"}
			]
		};
	
	/**
	 * Set of rules for identifying instrument's exchange and deriving a market definition from a symbol.
	 * This is only required if your chart will need to know the operating hours for the different exchanges. 
	 * If using a 24x7 chart, this class is not needed.
	 * 
	 * By default these rules are assigned to functions using ChartIQ symbology to identify the exchange.
	 * 
	 * **Before using, they must be reviewed and if necessary assigned to functions containing logic to match symbology rules for your quote data.**
	 * @namespace
	 * @name  CIQ.Market.Symbology
	 * @since 04-2016-08
	 */
	CIQ.Market.Symbology=function(){};
	
	/**
	 * Returns true if the instrument is foreign. 
	 * This is dependent on the market data feed and should be overridden accordingly.
	 * Currently if the instrument contains a period (.) it will be considered foreign (non US). (e.g. .XXXX)
	 * @param  {string}  symbol The symbol
	 * @return {Boolean}        True if it's a foreign symbol
	 * @memberOf CIQ.Market.Symbology
	 * @since 04-2016-08
	 */
	CIQ.Market.Symbology.isForeignSymbol=function(symbol){
		if(!symbol) return false;
		return symbol.indexOf(".")!=-1;
	};
	
	/**
	 * Returns true if the instrument is a futures. 
	 * This is dependent on the market data feed and should be overridden accordingly.
	 * Currently if the symbol begins with `/` it will be considered a future. (e.g. /C)
	 * @param  {string}  symbol The symbol
	 * @return {Boolean}        True if it's a futures symbol
	 * @memberOf CIQ.Market.Symbology
	 * @since 04-2016-08
	 */
	CIQ.Market.Symbology.isFuturesSymbol=function(symbol){
		if(!symbol) return false;
		if(symbol.indexOf("/")!==0 || symbol=="/") return false;
		return true;
	};
	
	/**
	 * Returns true if the instrument is a forex symbol. 
	 * This is dependent on the market data feed and should be overridden accordingly.
	 * Currently if the symbol begins with `^` and is followed by 6 alpha caracters, or just 6 alpha characters long without a '^', it will be considered forex.(e.g. ^EURUSD)
	 * @param  {string}  symbol The symbol
	 * @return {Boolean}        True if it's a forex symbol
	 * @memberOf CIQ.Market.Symbology
	 * @since 04-2016-08
	 */
	CIQ.Market.Symbology.isForexSymbol=function(symbol){
		if(!symbol) return false;
	    if(CIQ.Market.Symbology.isForeignSymbol(symbol)) return false;
	    if(CIQ.Market.Symbology.isFuturesSymbol(symbol)) return false;
		if(symbol.length<6 || symbol.length>7) return false;
		if(symbol.length==6 && symbol[5]=="X") return false;
		if(/\^?[A-Za-z]{6}/.test(symbol)) return true;
		return false;
	};
	
	/**
	 * Returns true if the symbol is a metal/currency or currency/metal pair 
	 * This is dependent on the market data feed and should be overridden accordingly.
	 * Currently it must be a [forex]{@link CIQ.Market.Symbology.isForexSymbol} for a precious metal. (e.g. ^XAUUSD - looks for XAU,XPD,XPT,XAG only) 
	 * @param  {string}   symbol The symbol
	 * @param  {boolean}  inverse Set to true to test specifically for a currency/metal pair.
	 * @return {Boolean}        True if it's a metal symbol
	 * @memberOf CIQ.Market.Symbology
	 * @since 04-2016-08
	 */
	CIQ.Market.Symbology.isForexMetal=function(symbol,inverse){
		if(!symbol) return false;
	    if(!CIQ.Market.Symbology.isForexSymbol(symbol)) return false;
		if(symbol.charAt(0)!="^") symbol="^"+symbol;
		if(",XAU,XPD,XPT,XAG,".indexOf(","+symbol.substr(4,3)+",")!=-1) return true;
		else if(!inverse && ",XAU,XPD,XPT,XAG,".indexOf(","+symbol.substr(1,3)+",")!=-1) return true;
		return false;
	};
	
	/**
	 * Returns true if the symbol is a forex or a future
	 * This is dependent on the market data feed and should be overridden accordingly.
	 * @param  {string}   symbol The symbol
	 * @return {Boolean}        True if the symbol is a forex or a future
	 * @memberOf CIQ.Market.Symbology
	 * @since 04-2016-08
	 */
	CIQ.Market.Symbology.isForexFuturesSymbol=function(symbol){
	    if(CIQ.Market.Symbology.isForexSymbol(symbol)) return true;
	    if(CIQ.Market.Symbology.isFuturesSymbol(symbol)) return true;
		return false;
	};
	
	/**
	 * This is a function that takes a symbolObject of form accepted by {@link CIQ.ChartEngine#newChart}, and returns a market definition. 
	 * When loading it with {@link CIQ.ChartEngine#setMarketFactory}, it will be used by the chart to dynamically change market definitions when a new instrument is activated.
	 * See {@link CIQ.Market} for instruction on how to create a market definition. 
	 * @param  {Object} symbolObject Symbol object of form accepted by {@link CIQ.ChartEngine#newChart}
	 * @return {Object} A market definition. See {@link CIQ.Market} for instructions.
	 * @memberOf CIQ.Market.Symbology
	 * @since 04-2016-08
	 */
	CIQ.Market.Symbology.factory=function(symbolObject){
		var symbol=symbolObject.symbol;
	    if(CIQ.Market.Symbology.isForeignSymbol(symbol)) return null; // 24 hour market definition
	    if(CIQ.Market.Symbology.isFuturesSymbol(symbol)) return CIQ.Market.GLOBEX;
	    if(CIQ.Market.Symbology.isForexMetal(symbol)) return CIQ.Market.METALS;
	    if(CIQ.Market.Symbology.isForexSymbol(symbol)) return CIQ.Market.FOREX;
		return CIQ.Market.NYSE;
	};
	
	/**
	 * Primitive to find the next matching time segement taking into account
	 * rules for adjacent sessions.
	 * @param {Date} date A start date time.
	 * @param {Boolean} open True if looking for an open time
	 * @return A date that falls somewhere in a matching time segment. Probably 1 before close. Or null if no rules are defined
	 * @memberOf  CIQ.Market
	 * @since  05-2016-10
	 * @private
	 */
	CIQ.Market.prototype._find_next_segment = function(date, open) {
		if (! this.market_def) return null; // special case
		if (! this.rules) return null; //special case
		var d = new Date(date);
		var iter = this.newIterator({
			'begin': d,
			'interval': 1,
		});
		if (this._wasOpenIntraDay(d)) {
			var hours = this.zseg_match.close_parts.hours;
			var minutes = this.zseg_match.close_parts.minutes;
			d.setHours(hours);
			d.setMinutes(minutes);
			iter = this.newIterator({
				'begin': d,
				'interval': 1,
			});
		}
		return iter.next();
	};
	
	/**
	 * Primitive to find the previous matching time segement taking into account
	 * rules for adjacent sessions.
	 * @param {Date} date A start date time.
	 * @param {Boolean} open True if looking for an open time
	 * @return A date that falls somewhere in a matching time segment. Probably 1 before close. Or null of no rules are defined.
	 * @memberOf  CIQ.Market
	 * @since  05-2016-10
	 * @private
	 */
	CIQ.Market.prototype._find_prev_segment = function(date, open) {
		if (! this.market_def) return null; // special case
		if (! this.rules) return null; //special case
		var d = new Date(date);
		var iter = this.newIterator({
			'begin': d,
			'interval': 1,
		});
		if (this._wasOpenIntraDay(d)) {
			var hours = this.zseg_match.open_parts.hours;
			var minutes = this.zseg_match.open_parts.minutes;
			d.setHours(hours);
			d.setMinutes(minutes);
			iter = this.newIterator({
				'begin': d,
				'interval': 1,
			});
			d = iter.previous();
			
			if (this.zseg_match.close_parts.hours === hours) {
				if (this.zseg_match.close_parts.minutes === minutes) {
					// segments are adjacent use the previous
					if (open) {
						return iter.next();
					}
					return d;
				}
			}
			if (this.zseg_match.adjacent_child) {
				// segments are adjacent use the previous
				return d;
			}
			if (open) {
				// segments are not adjacent go back
				return iter.next();
			}
			return d;
		}
		return iter.previous();
	};
	
	/**
	 * Toggle on/off a market session by name.
	 * @param {String} session_name A session name matching a valid name present in the market definition.
	 * @param {Object} [inverted] Any true value (`true`, non-zero value or string) passed here will enable the session, otherwise the session will be disabled.
	 * @memberOf  CIQ.Market
	 * @since  06-2016-02
	 */
	CIQ.Market.prototype.disableSession = function(session_name, inverted) {
		var inverted_ = false;
		if (typeof inverted !== 'undefined' && inverted) {
			inverted_ = true;
		}
		if (session_name) {
			for (var i = 0;i < this.normalHours.length; i++) {
				if (this.normalHours[i].name === session_name) {
					this.normalHours[i].enabled = inverted_;
				}
			}
			for (i = 0;i < this.extraHours.length; i++) {
				if (this.extraHours[i].name === session_name) {
					this.extraHours[i].enabled = inverted_;
				}
			}
		}
	};
	
	/**
	 * Enable a market session by name. See {@link CIQ.Market#disableSession}
	 * @param {String} session_name A session name
	 * @memberOf  CIQ.Market
	 * @since  06-2016-02
	 */
	CIQ.Market.prototype.enableSession = function(session_name) {
		this.disableSession(session_name, 'enable_instead');
	};
	
	/**
	 * Get the close date/time for the trading session.
	 * @param [Date=now] date The date on which to check.
	 * @param {String} [session_name] Specific market session. If a session name is passed in, then not only does the market
	 * need to be open on the day in question but also within the time specified, otherwise null will be returned.
	 * @param [inZone] Optional datazone to translate from - If no market zone is present it will not be converted.
	 * @param [outZone] Optional datazone to translate to - If no market zone is present it will not be converted.
	 * @return {Date} Close date/time for the trading session or null if the market is
	 * closed for the given date.
	 * @memberOf  CIQ.Market
	 * @since  05-2016-10
	 */
	CIQ.Market.prototype.getClose = function(date, session_name, inZone, outZone) {
		var d = date?date:new Date();
		d = this._convertToMarketTZ(d, inZone);

		if (typeof session_name !== 'undefined') {
			if (this._wasOpenIntraDay(d)) {
				if (this.zseg_match.name === session_name) {
					d.setHours(this.zseg_match.close_parts.hours);
					d.setMinutes(this.zseg_match.close_parts.minutes);
					d.setSeconds(0);
					d.setMilliseconds(0);
					d=this._convertFromMarketTZ(d, outZone);
					return d;
				}
			}
		} else {
			if (this._wasOpenDaily(d)) {
				var zseg_match = this.zseg_match;
				
				//find the last session of the day
				while (zseg_match.child_) {
					zseg_match = zseg_match.child_;
				}
				
				//find the last enabled session ... maybe back where we started
				while (! zseg_match.enabled) {
					zseg_match = zseg_match.parent_;
				}
				
				d.setHours(zseg_match.close_parts.hours);
				d.setMinutes(zseg_match.close_parts.minutes);
				d.setSeconds(0);
				d.setMilliseconds(0);
				d=this._convertFromMarketTZ(d, outZone);
				return d;
			}
		}
		return null;
	};
	
	/**
	 * Get the close time for the current market session, or if the market is closed, the close time for the next market session.
	 * @param [Date=now] date The date on which to check.
	 * @param [inZone] Optional datazone to translate from - If no market zone is present it will not be converted.
	 * @param [outZone] Optional datazone to translate to - If no market zone is present it will not be converted.
	 * @return {Date} A date set to the close time of the next open market session.
	 * @memberOf  CIQ.Market
	 * @since  05-2016-10
	 */
	CIQ.Market.prototype.getNextClose = function(date, inZone, outZone) {
		var d = date?date:new Date();
		d = this._convertToMarketTZ(d, inZone);
		if (! this._wasOpenIntraDay(d)) {
			var iter = this.newIterator({
				'begin': d,
				'interval': 1
			});
			d = iter.next();
		}
		var date_ = d.getDate();
		var zseg_match = this.zseg_match;
		while (zseg_match.adjacent_child) {
			zseg_match = zseg_match.adjacent_child;
			date_ += 1;
		}
		d.setDate(date_);
		d.setHours(zseg_match.close_parts.hours);
		d.setMinutes(zseg_match.close_parts.minutes);
		d.setSeconds(0);
		d.setMilliseconds(0);
		d=this._convertFromMarketTZ(d, outZone);
		return d;
		
	};
	
	/**
	 * Get the next market session open time. If the requested date is the opening time for the session, then
	 * it will iterate to opening time for the next market session.
	 * @param [Date=now] date An The date on which to check.
	 * @param [inZone] Optional datazone to translate from - If no market zone is present it will not be converted.
	 * @param [outZone] Optional datazone to translate to - If no market zone is present it will not be converted.
	 * @return {Date} A date aligned to the open time of the next open session. If no rules are defined, it will return null.
	 * @memberOf  CIQ.Market
	 * @since  05-2016-10
	 */
	CIQ.Market.prototype.getNextOpen = function(date, inZone, outZone) {
		if (! this.market_def) return null; // special case
		if (! this.rules) return null; //special case
		var d = date?date:new Date();
		d = this._convertToMarketTZ(d, inZone);
		d = this._find_next_segment(d);
		if (this.zseg_match.adjacent_parent) {
			d=this.getNextOpen(d);
			d=this._convertFromMarketTZ(d, outZone);
			return d;
		}
		d.setHours(this.zseg_match.open_parts.hours);
		d.setMinutes(this.zseg_match.open_parts.minutes);
		d=this._convertFromMarketTZ(d, outZone);
		return d;
	};
	
	/**
	 * Get the open date/time for a market session. The market session must be
	 * enabled.
	 * @param [Date=now] date The date on which to check.
	 * @param [inZone] Optional datazone to translate from - If no market zone is present it will not be converted.
	 * @param [outZone] Optional datazone to translate to - If no market zone is present it will not be converted.
	 * @param {String} [session_name] Specific market session. If a session name is passed in, then not only does the market
	 * need to be open on the day in question but also within the time specified, otherwise null will be returned.
	 * @return {Date} A date time for the open of a session or null if the market is
	 * closed for the given date or there are no rules to check.
	 * @memberOf  CIQ.Market
	 * @since  05-2016-10
	 */
	CIQ.Market.prototype.getOpen = function(date, session_name, inZone, outZone) {
		if (! this.market_def) return null; // special case
		if (! this.rules) return null; //special case
		var d = date?date:new Date();
		d = this._convertToMarketTZ(d, inZone);
		if (typeof session_name !== 'undefined') {
			if (this._wasOpenIntraDay(d)) {
				if (this.zseg_match.name == session_name) {
					d.setHours(this.zseg_match.open_parts.hours);
					d.setMinutes(this.zseg_match.open_parts.minutes);
					d.setSeconds(0);
					d.setMilliseconds(0);
					d=this._convertFromMarketTZ(d, outZone);
					return d;
				}
			}
		} else {
			if (this._wasOpenDaily(d)) {
				var zseg_match = this.zseg_match;
				
				//find all of the parents if any
				while (zseg_match.parent_) {
					zseg_match = zseg_match.parent_;
				}
				
				//find the first enabled child ... might end up back where we started
				while (! zseg_match.enabled) {
					zseg_match = zseg_match.child_;
				}
				
				d.setHours(zseg_match.open_parts.hours);
				d.setMinutes(zseg_match.open_parts.minutes);
				d.setSeconds(0);
				d.setMilliseconds(0);
				d=this._convertFromMarketTZ(d, outZone);
				return d;
			}
		}
		return null;
	};
	
	/**
	 * Get the previous session close time. If the date lands exactly on the close time for a session then
	 * it will still seek to the previous market session's close.
	 * @param [Date=now] date The date on which to check.
	 * @param [inZone] Optional datazone to translate from - If no market zone is present it will not be converted.
	 * @param [outZone] Optional datazone to translate to - If no market zone is present it will not be converted.
	 * @return {Date} A date aligned to the previous close date/time of a session. If no rules are defined, it will return null.
	 * @memberOf  CIQ.Market
	 * @since  05-2016-10
	 */
	CIQ.Market.prototype.getPreviousClose = function(date, inZone, outZone) {
		if (! this.market_def) return null; // special case
		if (! this.rules) return null; //special case
		var d = date?date:new Date();
		d = this._convertToMarketTZ(d, inZone);
		d = this._find_prev_segment(d, false);
		if (this.zseg_match.adjacent_child) {
			return this.getPreviousClose(d);
		}
		d.setHours(this.zseg_match.close_parts.hours);
		d.setMinutes(this.zseg_match.close_parts.minutes);
		d=this._convertFromMarketTZ(d, outZone);
		return d;
	};
	
	/**
	 * Get the previous session open time. If the date lands exactly on the open time for a session then
	 * it will still seek to the previous market session's open.
	 * @param [Date=now] date An The date on which to check.
	 * @param [inZone] Optional datazone to translate from - If no market zone is present it will not be converted.
	 * @param [outZone] Optional datazone to translate to - If no market zone is present it will not be converted.
	 * @return {Date} A date aligned to previous open date/time of a session. If no rules are defined, it will return null.
	 * @memberOf  CIQ.Market
	 * @since  05-2016-10
	 */
	CIQ.Market.prototype.getPreviousOpen = function(date, inZone, outZone) {
		if (! this.market_def) return null; // special case
		if (! this.rules) return null; //special case
		var d = date?date:new Date();
		d = this._convertToMarketTZ(d, inZone);
		d = this._find_prev_segment(d, true);
		if (this.zseg_match.adjacent_parent) {
			return this.getPreviousOpen(d);
		}
		d.setHours(this.zseg_match.open_parts.hours);
		d.setMinutes(this.zseg_match.open_parts.minutes);
		d=this._convertFromMarketTZ(d, outZone);
		return d;
	};
	
	/**
	 * Return the session name for a date. If the name is defined and if the date
	 * lands in a session that is open. Otherwise return null.
	 * @param {Date} date A date object
	 * @param {String} [inZone] Timezone of incoming date - If no market zone is present it will not be converted.
	 * @return {Object} String or null
	 */
	CIQ.Market.prototype.getSession = function(date, inZone) {
		date = this._convertToMarketTZ(date, inZone);
		if (this._wasOpenIntraDay(date) && this.zseg_match) {
			return this.zseg_match.name;
		}
		return null;
	};
	
	/**
	 * @return {Date} Current time in the market zone
	 * @memberOf  CIQ.Market
	 * @since 04-2016-08
	 */
	CIQ.Market.prototype.marketZoneNow = function() {
		return this._convertToMarketTZ(new Date());
	};
	
	/**
	 * @return {Boolean} `true` if this market is hour aligned.
	 * @memberOf  CIQ.Market
	 * @since 04-2016-08
	 */
	CIQ.Market.prototype.isHourAligned = function() {
		return this.hour_aligned;
	};
	
	/**
	 * Checks if the market is currently open.
	 * @return {Boolean} `true` if the market is open right now.
	 * @memberOf  CIQ.Market
	 * @since 04-2016-08
	 */
	CIQ.Market.prototype.isOpen = function() {
		var now = new Date();
		if (this.market_tz) {
			now = new this.tz_lib(now.getTime(), this.market_tz);
		}
		return this._wasOpenIntraDay(now);
	};
	
	/**
	 * Checks if today it is a market day.
	 * @return {Boolean} `true` if it is a market day.
	 * @memberOf  CIQ.Market
	 * @since 04-2016-08
	 */
	CIQ.Market.prototype.isMarketDay = function() {
	    var now = new Date();
	    if (this.market_tz) {
	        now = new this.tz_lib(now.getTime(), this.market_tz);
	    }
	    return this._wasOpenDaily(now);
	};		
	
	/**
	 * Creates iterators for the associated Market to traverse trough time taking into account market hours. 
	 * An iterator instance can go forward or backward in time any arbitrary amount.
	 * However, the internal state cannot be changed once it is constructed. A new iterator should be
	 * constructed whenever one of the parameters changes. For example if the
	 * `interval` changes a new iterator will need to be built. If the `displayZone`
	 * or `dataZone` changes on the market new iterators will also need to be
	 * constructed.
	 * 
	 * See {@link CIQ.Market.Iterator} for all available methods.
	 * 
	 * See the following convenience functions: {@link CIQ.ChartEngine#getNextInterval} and  {@link CIQ.ChartEngine#standardMarketIterator}
	 *
	 * @param {Object} parms Parameters used to initialize the Market object.
	 * @param {string} [parms.interval] A valid interval as required by {@link CIQ.ChartEngine#setPeriodicityV2}. Default is 1 (minute).
	 * @param {Integer} [parms.periodicity] A valid periodicity as required by {@link CIQ.ChartEngine#setPeriodicityV2}. Default is 1.
	 * @param {String} [parms.timeUnit] A valid timeUnit as required by {@link CIQ.ChartEngine#setPeriodicityV2}. Default is "minute"
	 * @param {Date} [parms.begin] The date to set as the start date for this iterator instance. Default is `now`. Will be assumed to be `inZone` if one set.
	 * @param {String} [parms.inZone] A valid timezone from the timeZoneData.js library. This should represent the time zone for any input dates such as `parms.begin` in this function or `parms.end` in {@link CIQ.Market.Iterator#futureTick}. Defaults to browser timezone if none set.  - If no market zone is present it will not be converted.
	 * @param {String} [parms.outZone] A valid timezone from the timeZoneData.js library. This should represent the time zone for the returned dates. Defaults to browser timezone if none set.  - If no market zone is present it will not be converted.
	 * @return {Object} A new iterator.
	 * @memberOf  CIQ.Market
	 * @since 04-2016-08
	 * @example
	    var iter = stxx.market.newIterator(
				{
					'begin': now,
	                'interval': stxx.layout.interval,
	                'periodicity': stxx.layout.periodicity,
	                'timeUnit': stxx.layout.timeUnit,
	                'inZone': stxx.dataZone,
	                'outZone': stxx.displayZone
				}
		);
	 */
	CIQ.Market.prototype.newIterator = function(parms) {
		var _multiple = false;
		if (parms.periodicity) {
			_multiple = parms.periodicity;
		} else if (parms.multiple) {
			_multiple = parms.multiple;
		}
		var _interval = parms.interval;
		if (!_interval) {
			_interval = CIQ.Market.MINUTE;
		}
		if (!_multiple) {
			_multiple = 1;
		}
		if (!parms.begin) {
			parms.begin = new Date();
		}
	    if (_interval === parseInt(_interval, 10)) {
			_multiple = _multiple * _interval;
			_interval = 'minute';
	    }
	    if (parms.timeUnit) {
	    	if (parms.timeUnit === CIQ.Market.MILLISECOND) {
	    		_interval = parms.timeUnit;
	    	} else if (parms.timeUnit === CIQ.Market.SECOND) {
	    		_interval = parms.timeUnit;
	    	}
	    }
		parms.interval = _interval;
		parms.multiple = _multiple;
		parms.market = this;
		return new CIQ.Market.Iterator(parms);
	};
	
	/**
	 * Calculate whether this market was open on some date. This will depend on
	 * the data used when creating this market. This function does not take into
	 * account intra day data. It simply checks the date to see if the market was
	 * open at all on that day. Hours, minutes, seconds are ignored.
	 * @param {Date} historical_date Javascript date object with timezone in the market time zone.
	 * @return {Boolean} true if the market was open.
	 * @memberOf  CIQ.Market
	 * @since 04-2016-08
	 * @private
	 */
	CIQ.Market.prototype._wasOpenDaily = function(historical_date) {
		return this._was_open(historical_date, false);
	};
	
	/**
	 * Calculate whether this market was open on some date. This will depend on
	 * The data used when creating this market. This function will take into
	 * account intra day date that is minutes and seconds. Not only does a market
	 * need to be open on the day in question but also within the time specified.
	 * @param {Date} historical_date Javascript date object with timezone in the market time zone.
	 * @return {Boolean} true if the market was open.
	 * @memberOf  CIQ.Market
	 * @since 04-2016-08
	 * @private
	 */
	CIQ.Market.prototype._wasOpenIntraDay = function(historical_date) {
		return this._was_open(historical_date, true);
	};
	
	/**
	 * Given some javascript date object calculate whether this market was open.
	 * Use _wasOpenDaily or _wasOpenIntraDay instead. As a special case if
	 * no market json has been defined this function will always return true.
	 * @param {Date} historical a valid Javascript date object with timezone in the market time zone.
	 * @param {Boolean}
	 * @return {Boolean} true if open else false
	 * @private
	 */
	CIQ.Market.prototype._was_open = function(historical, intra_day) {
		this.zopen_hour = 0;
		this.zopen_minute = 0;
		this.zclose_hour = 0;
		this.zclose_minute = 0;
		this.zmatch_open = false;
		if (! this.market_def) return true; // special case
		if (! this.rules) return true; //special case
		var normally_open = false;
		var extra_open = false;
		var year = historical.getFullYear();
		var month = historical.getMonth() + 1;
		var day = historical.getDay();
		var date = historical.getDate();
		var hour = historical.getHours();
		var minutes = historical.getMinutes();
		var seconds = historical.getSeconds();
		var segment;
		var midnight_secs = (hour * 60 * 60) + (minutes * 60) + seconds;
	
		if (typeof intra_day === 'undefined') {
			intra_day = true;
		}
	
		var i;
		for (i = 0; i < this.normalHours.length; i++) {
			segment = this.normalHours[i];
			if (! segment.enabled) {
				continue;
			}
			normally_open = (segment.dayofweek === day);
			if (normally_open && intra_day) {
				normally_open = midnight_secs >= segment.open &&
					midnight_secs < segment.close;
			}
			if (normally_open) {
				this.zopen_hour = segment.open_parts.hours;
				this.zopen_minute = segment.open_parts.minutes;
				this.zclose_hour = segment.close_parts.hours;
				this.zclose_minute = segment.close_parts.minutes;
				this.zmatch_open = (midnight_secs === segment.open);
				this.zseg_match = segment;
				break;
			}
		}
	
		for (i = 0; i < this.extraHours.length; i++) {
			segment = this.extraHours[i];
			if (! segment.enabled) {
				continue;
			}
			if ('*' === segment.year || year === segment.year) {
				if (month === segment.month && date === segment.day) {
					extra_open =
						(midnight_secs >= segment.open) &&
							(midnight_secs < segment.close);
					if (! extra_open && normally_open) {
						normally_open = false;
					}
					if (extra_open) {
						this.zopen_hour = segment.open_parts.hours;
						this.zopen_minute = segment.open_parts.minutes;
						this.zclose_hour = segment.close_parts.hours;
						this.zclose_minute = segment.close_parts.minutes;
						this.zmatch_open = (midnight_secs === segment.open);
						this.zseg_match = segment;
						break;
					}
				}
			}
		}
	
		return normally_open || extra_open;
	};

	/**
	 * Convenience function for unit testing.
	 */
	CIQ.Market.prototype._wasClosed = function(test_date) {
		return !this._was_open(test_date, true);
	};
	
	/**
	 * Convenience function for unit testing.
	 */
	CIQ.Market.prototype._wasOpen = function(test_date) {
		return this._was_open(test_date, true);
	};
	
	/**
	 * Get the difference in millis between two time zones. May be positive or
	 * negative depending on the time zones. The purpose is to shift the source
	 * time zone some number of millis to the target timezone. For example shifting
	 * a data feed from UTC to Eastern time. Or shifting Eastern time to Mountain
	 * time for display purposes. Note that it is important to pass the source
	 * and the target in the correct order. The algorithm does source - target. This
	 * will calculate the correct offset positive or negative.
	 * @param {Date} A date object. Could be any date object the javascript one
	 * or for example the timezone.js one. Must implement getTime() and
	 * getTimezoneOffset()
	 * @param {String} src_tz_str The source time zone. For example the data feed
	 * @param {String} target_tz_str The target time zone for example the market.
	 * @return {Integer} The number of milliseconds difference between the time
	 * zones.
	 */
	CIQ.Market.prototype._tzDifferenceMillis = function(
		date, src_tz_str, target_tz_str) {
		var millis = 0;
		var src_date = date;
		var target_date = date;
		var minutes =
			src_date.getTimezoneOffset() - target_date.getTimezoneOffset();
		millis = minutes * 60 * 1000;
		return millis;
	};
	
	/**
	 * Static function that reads the json rules in the market definition and
	 * creates in memory time segments that are used later to match market dates.
	 * @param {Object} market An instance of a market.
	 */
	CIQ.Market._createTimeSegments = function(market) {
		var link_adjacent = function(r0_, r1_) {
			if (r0_.close_parts.hours === 24 && r1_.open_parts.hours === 0) {
				if (r1_.open_parts.minutes === 0) {
					if (p_rule.dayofweek === rd.dayofweek - 1) {
						return true;
					}
					if (p_rule.dayofweek === 6 && rd.dayofweek === 0) {
						return true;
					}
				}
			}
			return false;
		};
		var p_rule;
		for (var i = 0; i < market.rules.length; i++) {
			var rule = JSON.parse(JSON.stringify(market.rules[i]));
			if (typeof rule.open === 'undefined' &&
				typeof rule.close === 'undefined') {
				rule.open = '00:00';
				rule.close = '00:00';
			}
			if (! rule.hasOwnProperty('name')) {
				rule.name = null;
			}
			try {
				var rd;
				if (typeof rule.dayofweek !== 'undefined') {
					rule.year = "*";
					rd = _TimeSegmentS._createDayOfWeekSegment(market, rule);
					if (p_rule) {
						if (p_rule.dayofweek === rd.dayofweek) {
							//These links are used for finding open and close times
							//On the same day in multiple sessions
							p_rule.child_ = rd;
							rd.parent_ = p_rule;
						} else {
							if (link_adjacent(p_rule, rd)) {
								//These links are used for finding open and close
								//times for sessions that span days
								p_rule.adjacent_child = rd;
								rd.adjacent_parent = p_rule;
							}
						}
					}
					p_rule = rd;
				} else if (typeof rule.date !== 'undefined') {
					rule.isDayOfWeek = false;
					rule.dayofweek = -1;
					rd = _TimeSegmentS._createDateTimeSegement(market, rule);
				} else {
					console.log('Error, unknown rule type ' + rule);
				}
				if (market.enabled_by_default) {
					for (var x = 0; x < market.enabled_by_default.length; x++) {
						var n = market.enabled_by_default[x];
						if (rd.name === n) {
							rd.enabled = true;
							break;
						}
					}
				} else {
					//always enabled if no defaults are defined
					//rd.enabled = true;
				}
			} catch (err) {
				console.log('Error, creating market rules ' + err);
			}
		}
	};

	/**
	 * Internal static utility methods used to create market time segments.
	 */
	CIQ.Market._timeSegment = {};
	var _TimeSegmentS = CIQ.Market._timeSegment;
	
	_TimeSegmentS.re_wild_card_iso = /^(\*)-(\d\d)-(\d\d)$/;
	_TimeSegmentS.re_regular_iso = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
	_TimeSegmentS.re_split_hours_minutes = /^(\d\d):(\d\d)$/;
	_TimeSegmentS.re_split_hour_minutes = /^(\d):(\d\d)$/;
	
	/**
	 * Create a hash code for a string. We may move this to 3rd party later if
	 * we find a wider need for it. This came from Stackoverflow and claims to be
	 * the same implementation used by Java.
	 * @param {String} str A string.
	 * @return {Integer} A number suitable for
	 */
	_TimeSegmentS._hashCode = function(str) {
		var hash = 0, i, chr, len;
		if (str.length === 0) return hash;
		for (i = 0, len = str.length; i < len; i++) {
			chr   = str.charCodeAt(i);
			hash  = ((hash << 5) - hash) + chr;
			hash |= 0; // Convert to 32bit integer
		}
		return hash;
	};
	
	/**
	 * Split the hours and minutes from a json time segment rule.
	 * @param {String} str \d\d:\d\d or \d:\d\d
	 * @return {Object} {minutes:int, hours:int}
	 */
	_TimeSegmentS._splitHoursMinutes = function(str) {
		var parts = _TimeSegmentS.re_split_hour_minutes.exec(str);
		var ret_val = {'hours': NaN, 'minutes': NaN};
		if (parts === null) {
			parts = _TimeSegmentS.re_split_hours_minutes.exec(str);
			if (parts === null) {
				return ret_val;
			}
		}
		ret_val.hours = parseInt(parts[1], 10);
		ret_val.minutes = parseInt(parts[2], 10);
		return ret_val;
	};
	
	/**
	 * Create a time segment for some day of the week. This creates a wildcard
	 * segment that matches the same weekday in any month and any year.
	 * @param {object} market The instance of this market
	 * @param {object} rule Represents the data from one rule in the JSON
	 * configuration.
	 */
	_TimeSegmentS._createDayOfWeekSegment = function(market, rule) {
		var data = {
			'name': rule.name,
			'isDayOfWeek': true,
			'dayofweek': rule.dayofweek,
			'date_str': '*',
			'open_parts': _TimeSegmentS._splitHoursMinutes(rule.open),
			'close_parts': _TimeSegmentS._splitHoursMinutes(rule.close),
			'open': _TimeSegmentS._secSinceMidnight(market, rule.open, true),
			'close': _TimeSegmentS._secSinceMidnight(market, rule.close, false),
			'child_': false,
			'parent_': false,
			'adjacent_child': false,
			'adjacent_parent': false,
			'enabled': false
		};
		if (data.name === null) {
			data.enabled = true;
		}
		data.hash_code = this._hashCode((data.open + data.close).toString());
		market.normalHours.push(data);
		return data;
	};
	
	/**
	 * Create a time segement for a specific date and time. This can also create
	 * a wild card segement that matches any year with a specific day and specific
	 * month. For example *-12-25 to match all Christmas days. It can also build
	 * any specific year month day open close time that will only match that
	 * specific range.
	 * @param {Object} market an instance of a market
	 * @param {Object} rule a single rule from a market definition
	 * @return Nothing this function works on the market object.
	 */
	_TimeSegmentS._createDateTimeSegement = function(market, rule) {
		var pieces = this.re_regular_iso.exec(rule.date);
		var year;
		if (pieces === null) {
			pieces = this.re_wild_card_iso.exec(rule.date);
			if (pieces === null) {
				console.log('Warning: invalid date format on rule -> ' + rule.date);
				return;
			}
			year = '*'; //all years
		} else {
			year = parseInt(pieces[1], 10);
		}
		var data = {
			'name': rule.name,
			'isDayOfWeek': false,
			'dayofweek': -1,
			'year': year,
			'month': parseInt(pieces[2], 10),
			'day': parseInt(pieces[3], 10),
			'date_str': rule.date,
			'open_parts': _TimeSegmentS._splitHoursMinutes(rule.open),
			'close_parts': _TimeSegmentS._splitHoursMinutes(rule.close),
			'open': _TimeSegmentS._secSinceMidnight(market, rule.open, true),
			'close': _TimeSegmentS._secSinceMidnight(market, rule.close, false),
			'enabled': false
		};
		if (data.name === null) {
			data.enabled = true;
		}
		data.hash_key = this._hashCode(data.date_str + data.open + data.close);
		market.extraHours.push(data);
		return data;
	};
	
	/**
	 * Calculate the seconds since midnight for some time string. These time strings
	 * come from the market definition. These are intended to be open and close
	 * times.
	 * @param {Object} market An instance of a market
	 * @param {string} time_str A time string like this "\d\d:\d\d"
	 * @param {Boolean} open_time If true the time is used for opening a market
	 * otherwise the time is used for closing a market. This is so that we can
	 * handle 00:00 and 24:00.
	 */
	_TimeSegmentS._secSinceMidnight = function(market, time_str, open_time) {
		var parts = time_str.split(':');
		var hours = parseInt(parts[0], 10);
		var minutes = parseInt(parts[1], 10);
		var seconds = (hours * 60 * 60) + (minutes * 60);
		
		if (! open_time) {
			if (hours === 24) {
				seconds = (hours * 60 * 60) + 1;
			}
		}
		return seconds;
	};
	
	/**
	 * Converts from the given timezone into the market's native time zone
	 * If no market zone is present, the date will be returned un changed.
	 * @param  {Date} dt JavaScript Date
	 * @param  {String} [tz] timezoneJS timezone, or null to indicate browser localtime/UTC (dataZone)
	 * @return {Date}    A JavaScript Date offset by the timezone change
	 */
	CIQ.Market.prototype._convertToMarketTZ = function(dt, tz){
		if(!this.market_tz) return dt;
		var tzdt;
		if(tz){
			tzdt=new this.tz_lib(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds(), dt.getMilliseconds(), tz);
		}else{
			tzdt=new this.tz_lib(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds(), dt.getMilliseconds());
		}
		if(tzdt.setTimezone) tzdt.setTimezone(this.market_tz);
		return new Date(tzdt.getFullYear(), tzdt.getMonth(), tzdt.getDate(), tzdt.getHours(), tzdt.getMinutes(), tzdt.getSeconds(), tzdt.getMilliseconds());
	};
	
	/**
	 * Converts to the given timezone from the market's native time zone.
	 * If no market zone is present, the date will be returned un changed.
	 * @param  {Date} dt JavaScript Date
	 * @param  {String} [tz] timezoneJS timezone, or null to indicate browser localtime/UTC (displayZone)
	 * @return {Date}    A JavaScript Date offset by the timezone change
	 */
	CIQ.Market.prototype._convertFromMarketTZ = function(dt, tz){
		if(!this.market_tz) return dt;
		var tzdt=new this.tz_lib(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds(), dt.getMilliseconds(), this.market_tz);
		if(tz){
			if(tzdt.setTimezone) tzdt.setTimezone(tz);
		}else{
			return new Date(tzdt.getTime());
		}
		return new Date(tzdt.getFullYear(), tzdt.getMonth(), tzdt.getDate(), tzdt.getHours(), tzdt.getMinutes(), tzdt.getSeconds(), tzdt.getMilliseconds());
	};
	
	/**
	 * Builds an iterator instance and returns it to the requesting market when {@link CIQ.Market#newIterator} is called. Do not call this constructor directly.
	 * 
	 * @name CIQ.Market.Iterator
	 * @constructor
	 * @since 04-2016-08
	 * @example
	    var market24=new CIQ.Market();
	    var iter_parms = {
	        'begin': stxx.chart.dataSet[stxx.chart.dataSet.length-1],	// last item on the dataset
	        'interval': stxx.layout.interval,
	        'periodicity': stxx.layout.periodicity,
	        'timeUnit': stxx.layout.timeUnit,
	        'inZone': stxx.dataZone,
	        'outZone': stxx.dataZone
	    };
	    var iter = market24.newIterator(iter_parms);
	    var next = iter.next();
	 * 
	 */
	CIQ.Market.Iterator = function(parms) {
		this.market = parms.market;
		this.begin = parms.begin;
		this.interval = parms.interval;
		this.multiple = parms.multiple;
		this.inZone = parms.inZone;
		this.outZone = parms.outZone;
		this.clock = new CIQ.Market.Iterator._Clock(
			parms.market, parms.interval, parms.multiple);
	    this.intraDay = this.clock.intra_day;
	    if(this.intraday) this.begin=this.market._convertToMarketTZ(this.begin, parms.inZone);
		this.clock._setStart(this.begin);
		this.clock.minutes_aligned = false;
	};
	
	/**
	 * Returns the current date of the iterator without moving forwards or backwards.
	 * Takes into account display zone settings.
	 * @return {Date} The current date of the iterator.
	 * @memberOf CIQ.Market.Iterator
	 * @since 04-2016-08
	 * @example
	 * iteratorDate = iter.date();
	 */
	CIQ.Market.Iterator.prototype.date = function() {
		return this.clock._date();
	};
	
	/**
	 * Calculate the number of ticks from begin date to end date taking into account
	 * market open, close, and holidays. 
	 * If the end date is older than the begin date,it will work backward into the past. 
	 * If the end date is newer than the begin date,it will work forward into the future. 
	 * Note that the begin date is set when this
	 * instance of the iterator is created and one should NOT call `previous` or `next`
	 * before calling this function, or the 'begin' pointer will change.
	 * @param {Date} parms.end An end date. Will be assumed to be `inZone` if one set.
	 * @param {Integer} [parms.sample_size] Default is 25. Maximum amount of time 
	 * (in milliseconds) taken to count ticks. If sample size is
	 * reached before the number of ticks is found the number of ticks will be
	 * estimated mathematically. The bigger the sample size couple with the
	 * distance between begin date and end date affect how precise the return value
	 * is.
	 * @param {Integer} [parms.sample_rate] Default is 1000. Maximum number of ticks to evaluate before checking `parms.sample_size`.
	 * @return {Integer} The number of ticks between begin and end.
	 * @memberOf CIQ.Market.Iterator
	 * @since 04-2016-08
	 * @example
	 * // find out how many ticks in the past a date is from the beginning of the dataSet 
	 * // (assumes the target date is older than the first dataSet item)
	 *	var iter = this.standardMarketIterator(chart.dataSet[0].DT);
	 *	var ticks=iter.futureTick({someRandomDate});
	 */
	CIQ.Market.Iterator.prototype.futureTick = function(parms) {
		this.clock.skip = 1;
		var ticks = 0;
		var end;
		if(this.intraday) end = this.market._convertToMarketTZ(parms.end, this.inZone).getTime();
		else end = parms.end.getTime();
		var begin = this.clock.ctime;
		if (end === begin) {
			return ticks;
		}
		var sample_size = 2; //milliseconds // May not be necessary at all. Looks accurate whenever past 1,000 ticks into future
		var sample_rate = 1000; //iterations
		var sample_ctr = 0;
		if (parms.sample_size) {
			sample_size = parms.sample_size;
		}
		var start = new Date().getTime();
		var now;
		var ave;
		if (end > begin) {
			this.clock.forward = true;
			while (this.clock.ctime < end) {
				ticks += 1;
				sample_ctr += 1;
				this.clock._findNext();
				if (sample_ctr === sample_rate) {
					sample_ctr = 0;
					now = new Date().getTime();
					if ((now - start) >= sample_size) {
						ave = (this.clock.ctime - begin) / ticks;
						ticks = Math.floor((end - begin) / ave);
						break;
					}
				}
			}
		} else {
			this.clock.forward = false;
			while (this.clock.ctime > end) {
				ticks += 1;
				sample_ctr += 1;
				this.clock._findPrevious();
				if (sample_ctr === sample_rate) {
					sample_ctr = 0;
					now = new Date().getTime();
					if ((now - start) >= sample_size) {
						ave = (begin - this.clock.ctime) / ticks;
						ticks = Math.floor((begin - end) / ave);
						break;
					}
				}
			}
		}
		return ticks;
	};
	
	/**
	 * As a convenience exposed on an instance of an iterator.
	 * @return {Boolean} true if this market is hour aligned.
	 * @memberOf CIQ.Market.Iterator
	 * @since 04-2016-08
	 */
	CIQ.Market.Iterator.prototype.isHourAligned = function() {
		return this.market.isHourAligned();
	};
	
	/**
	 * Check and see if this Market is open now.
	 * @return {Boolean} true or false
	 * @memberOf CIQ.Market.Iterator
	 * @since 04-2016-08
	 */
	CIQ.Market.Iterator.prototype.isOpen = function() {
		return this.market.isOpen();
	};
	
	/**
	 * Move the iterator one interval forward
	 * @param {Integer} [skip] Default 1. Jump forward skip * periodicity at once.
	 * @return {Date} Next date in iterator `outZone`.
	 * @alias next
	 * @memberOf CIQ.Market.Iterator
	 * @since 04-2016-08
	 * @example
	 * now = iter.next();
	 */
	CIQ.Market.Iterator.prototype.next = function(skip) {
		this.clock.skip = 1;
		if (skip) {
			this.clock.skip = skip;
		}
		this.clock.forward = true;
		for(var i=0;i<this.clock.skip;i++)
			this.begin = this.clock._findNext();
	    if(this.intraDay || this.market.convertOnDaily){
			return this.market._convertFromMarketTZ(
				this.clock.display_date, this.outZone);
		}else{
			return this.clock.display_date;
		}
	};
	
	/**
	 * Does not move the iterator. Takes into account display zone settings.
	 * Note. This is a convenience function for debugging or whatever else, but
	 * should not be called in the draw loop in production.
	 * @return {String} The current date of the iterator as a string.
	 * @memberOf CIQ.Market.Iterator
	 * @since 04-2016-08
	 * @private
	 */
	CIQ.Market.Iterator.prototype.peek = function() {
		return this.clock._peek();
	};
	
	/**
	 * Move the iterator one interval backward
	 * @param {Integer} skip Default is one. Move this many multiples of interval.
	 * @return {Date} Previous date in iterator `outZone`.
	 * @alias previous
	 * @memberOf CIQ.Market.Iterator
	 * @since 04-2016-08
	 * @example
	 * now = iter.previous();
	 */
	CIQ.Market.Iterator.prototype.previous = function(skip) {
		this.clock.skip = 1;
		if (skip) {
			this.clock.skip = skip;
		}
		this.clock.forward = false;
		for(var i=0;i<this.clock.skip;i++)
			this.begin = this.clock._findPrevious();
	    if (this.intraDay || this.market.convertOnDaily) {
			return this.market._convertFromMarketTZ(
				this.clock.display_date, this.outZone);
		} else {
			return this.clock.display_date;
		}
	};
	
	/**
	 * Internal object that simulates a clock that ticks forward and backwards
	 * at different intervals. Used internally by the iterator and not intended
	 * to be used outside of the context of a Market.
	 * @param {Object} market An instance of market.
	 * @param {string} interval minute, hour, day, week or month
	 * @param {Integer} multiple Move in mulitple of intervals.
	 */
	CIQ.Market.Iterator._Clock = function(market, interval, multiple) {
		this.market = market;
		this.interval = interval;
		this.multiple = multiple;
		this.intra_day = false;
		this.intervals = [];
		this.max_iters = 10080; //max minutes to check for rules. (one week);
		this.MINUTE_MILLIS = 1000 * 60;
		this.HOUR_MILLIS = this.MINUTE_MILLIS * 60;
		this.DAY_MILLIS = this.HOUR_MILLIS * 24;
		if (interval === 'today') {
			interval = CIQ.Market.DAY;
		}
		if (interval === CIQ.Market.MILLISECOND || interval === 'milliseconds') {
			this._findNext = this._millisImpl;
			this._findPrevious = this._millisImpl;
			this.intra_day = true;
			this.tick_time = 1 * this.multiple; //small as we can go
		} else if (interval === CIQ.Market.SECOND || interval === 'seconds') {
			this._findNext = this._secondImpl;
			this._findPrevious = this._secondImpl;
			this.intra_day = true;
			this.tick_time = 1000 * this.multiple;
		} else if (interval === CIQ.Market.MINUTE || interval === 'minutes') {
			this._findNext = this._minuteImpl;
			this._findPrevious = this._minuteImpl;
			this.intra_day = true;
			this.tick_time = this.MINUTE_MILLIS * this.multiple;
		} else if (interval === CIQ.Market.HOUR || interval === 'hours') {
			this._findNext = this._hourImpl;
			this._findPrevious = this._hourImpl;
			this.intra_day = true;
			this.tick_time = this.HOUR_MILLIS * this.multiple;
		} else if (interval === CIQ.Market.DAY || interval === 'days') {
			this._findNext = this._dayImpl;
			this._findPrevious = this._dayImpl;
			this.tick_time = this.DAY_MILLIS * this.multiple;
		} else if (interval === CIQ.Market.WEEK || interval === 'weeks') {
			this._findNext = this._weekImpl;
			this._findPrevious = this._weekImpl;
			this.tick_time = (this.DAY_MILLIS * 7) * this.multiple;
		} else if (interval === CIQ.Market.MONTH || interval === 'months') {
			this._findNext = this._monthImpl;
			this._findPrevious = this._monthImpl;
			this.tick_time = (this.DAY_MILLIS * 30) * this.multiple;
		} else {
			console.log('Periodicity ERROR: "'+interval+'" is not a valid interval. Please see setperiodcityV2() for details.' );
		}
	};
	
	//Save me some carpal tunnel please.
	var _ClockP = CIQ.Market.Iterator._Clock.prototype;
	
	/**
	 * Calculate how many minutes in some time span. Assumes hours are 24 hour
	 * format.
	 * 
	 * NOTE! Does not know how to jump a 24 hour period, assumes that
	 * o_hour is always less then c_hour on the same day.
	 * 
	 * This could be done with two dates instead and remove the limitations. Not
	 * sure if that is necessary at this point. We don't actually have two date
	 * objects at the point that we need this number. It would take some doin to
	 * figure out the date objects that would be needed.
	 */
	_ClockP._total_minutes = function(o_hour, o_min, c_hour, c_min) {
		//the parens are important in this case
		return (((c_hour - o_hour) * 60) - o_min) + c_min;
	};
	
	
	/**
	 * Create an array of minutes from the open minute to the close minute at
	 * some periodictiy. This array will run the entire time of the last segment
	 * time segment matched.
	 */
	_ClockP._alignMinutes = function() {
		//TODO maybe need some caching here.
		if (this.market.zopen_minute === undefined) {
			return [];
		}
		var o_min = this.market.zopen_minute;
		var total_minutes = this._total_minutes(this.market.zopen_hour, o_min,
			this.market.zclose_hour, this.market.zclose_minute);
		var periods = [];
		var next_minute = 0;
		while (next_minute < total_minutes) {
			periods.push(o_min + next_minute);
			next_minute += this.multiple;
		}
		return periods;
	};
	
	/**
	 * Create an array of second boundaries. This only needs to be done once
	 * per clock instance.
	 * @param {Integer} The high end of the range before wrapping back to zero.
	 * Example for seconds this would be 60.
	 */
	_ClockP._alignBaseZero = function(max) {
		var base = 0;
		var periods = [base];
		while (true) {
			base += this.multiple;
			if (base >= max) {
				break;
			}
			periods.push(base);
		}
		return periods;
	};
	
	/**
	 * Turn this instance of the clock into a date object at the current
	 * date time.
	 * @return {Date} A new Date object.
	 */
	_ClockP._date = function() {
		var current_date = new Date(this.ctime);
	
		if (this.intra_day) {
			this.display_date = new Date(this.ctime + this.shift_millis);
		} else {
			this.display_date = current_date;
		}
	
		return current_date;
	};
	
	/**
	 * Find the boundary for minutes, seconds or milliseconds.
	 * @param {Array} periods A pre calculated list of boundaries.
	 * @param {Integer} search_for Any number to align.
	 * @return {Integer} one of the boundaries in the array.
	 */
	_ClockP._alignToBoundary = function(periods, search_for) {
		var low = 0;
		var high = 0;
		var result = search_for;
	
		for (var ctr = 0; ctr < periods.length - 1; ctr++) {
			low = periods[ctr];
			high = periods[ctr + 1];
			if (search_for === low || search_for === high) {
				break; //already aligned;
			}
			if (search_for > low && search_for < high) {
				result = low;
				break;
			} else if (ctr + 1 === periods.length - 1) { //wrap around gap
				result = high;
			}
		}
		return result;
	};
	
	/**
	 * Convenience for debugging.
	 */
	_ClockP._peek = function() {
		return this._date().toString();
	};
	
	/**
	 * When searching for open days look in hour increments.
	 * Inverted.
	 */
	_ClockP._seekHr = function() {
		if (this.forward) {
			this.ctime -= this.HOUR_MILLIS;
		} else {
			this.ctime += this.HOUR_MILLIS;
		}
	};
	
	/**
	 * Set this instance of the iterator clock to some date. Calls to next or
	 * previous will move the clock some interval from this point in time.
	 * @param {Date} date Any javascript date.
	 */
	_ClockP._setStart = function(date) {
		var millis = this.market._tzDifferenceMillis(
	        date);
		var shift_date = new Date(date.getTime() + millis);
		this.shift_millis = millis;
		this.ctime = shift_date.getTime();
		// Terry override timezone shift
		this.shift_millis = 0;
		this.ctime = date.getTime();
	};
	
	/**
	 * Regular clock move
	 */
	_ClockP._tickTock = function() {
		if (this.forward) {
			//this.ctime += (this.tick_time * this.skip);
			this.ctime += this.tick_time;
		} else {
			//this.ctime -= (this.tick_time * this.skip);
			this.ctime -= this.tick_time;
		}
	};
	
	/**
	 * Inverted clock move
	 */
	_ClockP._tockTick = function() {
		if (this.forward) {
			//this.ctime -= (this.tick_time * this.skip);
			this.ctime -= this.tick_time;
		} else {
			//this.ctime += (this.tick_time * this.skip);
			this.ctime += this.tick_time;
		}
	};
	
	/**
	 * Move a day at a time. Useful for finding the first open day
	 * of a week or month. Always moves forward.
	 */
	_ClockP._tickTock24 = function() {
		this.ctime += this.DAY_MILLIS;
	};
	
	/**
	 * Move a day at a time inverted. Useful for finding Sunday when
	 * moving by weeks. Always moves backwards.
	 */
	_ClockP._tockTick24 = function() {
		this.ctime -= this.DAY_MILLIS;
	};
	
	/**
	 * Wind the clock to the next open market time. If the market is already open
	 * then don't move. Break out of the loop after max_iters regardless.
	 * @param was_open Function. Intraday or daily function to see if the market
	 * was open.
	 * @param wind Function. _tockTick (inverted) or _tickTock (regular)
	 */
	_ClockP._windMaybe = function(was_open, wind) {
		var max = 0;
		var working_date = new Date(this.ctime);
		var moved = false;
		while (!was_open.call(this.market, working_date)) {
			wind.call(this);
			moved = true;
			working_date = new Date(this.ctime);
			max += 1;
			if (max > this.max_iters) {
				var m = 'Warning! max iterations (' + this.max_iters;
				m += ') reached with no rule match.';
				console.log(m);
				break;
			}
		}
		return moved;
	};
	
	/**
	 * Move the clock some number of milliseconds
	 */
	_ClockP._millisImpl = function() {
		if (!this.mperiods_aligned) {
			var periods = this._alignBaseZero(1000);
			var current_date = new Date(this.ctime);
			var current_millis = current_date.getMilliseconds();
			current_millis = this._alignToBoundary(periods, current_millis);
			current_date.setMilliseconds(current_millis);
			this.ctime = current_date.getTime();
			this.mperiods_aligned = true;
		}
		this._tickTock();
		return this._date();
	};
	
	/**
	 * Move the clock some number of seconds
	 */
	_ClockP._secondImpl = function() {
		if (!this.speriod_aligned) {
			var periods = this._alignBaseZero(60);
			var current_date = new Date(this.ctime);
			var current_second = current_date.getSeconds();
			current_second = this._alignToBoundary(periods, current_second);
			current_date.setSeconds(current_second);
			current_date.setMilliseconds(0);
			this.ctime = current_date.getTime();
			this.speriod_aligned = true;
		}
		this._tickTock();
		return this._date();
	};
	
	/**
	 * Move the clock some number of minutes. Takes into account market start time
	 * and could change alignment each time it is called.
	 * @return {Date}
	 */
	_ClockP._minuteImpl = function() {
		var closed = this._windMaybe(this.market._wasOpenIntraDay, this._tockTick);
		var current_date = new Date(this.ctime);
		var current_minute = current_date.getMinutes();
		var current_hour = current_date.getHours();
		var periods = this._alignMinutes(); //takes into account market start time
		var boundary_min = this._total_minutes(
			this.market.zopen_hour, this.market.zopen_minute,
			current_hour, current_minute) + this.market.zopen_minute;
		if (closed) {
			if (this.forward) {
				boundary_min = periods[periods.length - 1];
			} else {
				boundary_min = periods[0];
			}
		} else {
			boundary_min = this._alignToBoundary(periods, boundary_min);
		}
		current_hour = Math.floor(boundary_min / 60) + this.market.zopen_hour;
		current_date.setHours(current_hour);
		current_date.setMinutes(boundary_min % 60);
		current_date.setSeconds(0);
		current_date.setMilliseconds(0);
		this.ctime = current_date.getTime(); //boundary aligned
		this._tickTock(); //move once
		if (this._windMaybe(this.market._wasOpenIntraDay, this._tickTock)) {
			if (this.forward) {
				current_date = new Date(this.ctime);
				current_date.setMinutes(this.market.zopen_minute);
				current_date.setHours(this.market.zopen_hour);
				this.ctime = current_date.getTime();
			} else {
				current_date = new Date(this.ctime);
				periods = this._alignMinutes();
				var last_boundary = periods[periods.length - 1];
				current_date.setMinutes(last_boundary % 60);
				current_date.setHours(
					Math.floor(last_boundary / 60) + this.market.zopen_hour);
				this.ctime = current_date.getTime();
			}
		}
		return this._date();
	};
	
	/**
	 * Move the clock some number of hours.
	 * @return {Date}
	 */
	_ClockP._hourImpl = function() {
		this._windMaybe(this.market._wasOpenIntraDay, this._tockTick);
		var current_time = new Date(this.ctime);
		if (this.market.isHourAligned()) {
			current_time.setMinutes(0);
		} else {
			current_time.setMinutes(this.market.zopen_minute);
		}
		current_time.setSeconds(0);
		current_time.setMilliseconds(0);
		this.ctime = current_time.getTime(); //boundary aligned
		this._tickTock(); //move once
		this._windMaybe(this.market._wasOpenIntraDay, this._tickTock);
		return this._date();
	};
	
	/**
	 * Move the clock some number of days.
	 * @return {Date}
	 */
	_ClockP._dayImpl = function() {
		this._windMaybe(this.market._wasOpenDaily, this._seekHr);
		var current_date = new Date(this.ctime); //closest open day
	    current_date.setHours(current_date.getHours()+2); //DST adjust
		current_date.setHours(0);
		current_date.setMinutes(0);
		current_date.setSeconds(0);
		current_date.setMilliseconds(0);
		this.ctime = current_date.getTime(); //boundary aligned
		var ctr = 0;
		while (ctr < this.multiple) {
			if (this.forward) {
				this._tickTock24();
			} else {
				this._tockTick24();
			}
			var dstOffset = this._date().getHours()*60 + this._date().getMinutes();
			this.ctime -= dstOffset*60000;
			if(dstOffset>720) this.ctime += this.DAY_MILLIS;
			if (!this.market._wasOpenDaily(this._date())) {
				continue;
			}
			ctr += 1;
		}
		return this._date();
	};
	
	/**
	 * Move the clock some number of weeks.
	 * @return {Date}
	 */
	_ClockP._weekImpl = function() {
		this._tickTock(); // move once
	
		//Move to Sunday
		var current_date = new Date(this.ctime);
		while (current_date.getDay() !== 0) {
			this._tockTick24();
			current_date = new Date(this.ctime);
		}
	
		//now align to first open day of week.
		this._windMaybe(this.market._wasOpenDaily, this._tickTock24);
		current_date = new Date(this.ctime);
		current_date.setHours(0);
		current_date.setMinutes(0);
		current_date.setSeconds(0);
		current_date.setMilliseconds(0);
		this.ctime = current_date.getTime(); //boundary aligned;
		return this._date();
	};
	
	/**
	 * Move the clock some number of months
	 * @return {Date}
	 */
	_ClockP._monthImpl = function() {
	
		//Allow some room to account for different lengths of months.
		var current_date = new Date(this.ctime);
		current_date.setDate(15);
		this.ctime = current_date.getTime();
	
		this._tickTock(); // move once
		current_date = new Date(this.ctime);
	
		//Now re align back to the first day of the month
		current_date.setDate(1);
		this.ctime = current_date.getTime();
	
		//Now find the first open day of month
		this._windMaybe(this.market._wasOpenDaily, this._tickTock24);
		current_date = new Date(this.ctime);
		current_date.setHours(0);
		current_date.setMinutes(0);
		current_date.setSeconds(0);
		current_date.setMilliseconds(0);
		this.ctime = current_date.getTime(); //boundary aligned;
		return this._date();
	};
	
	/**
	 * Search forward for the next market open
	 * @param {Date} date Some begin date.
	 * @param {Integer} skip The number of intervals to move. Defaults
	 * to one.
	 * @return {Date} A new date that has been set to the previous open of the
	 * market.
	 */
	_ClockP._findNext = null;
	
	/**
	 * Search backward for the next market open
	 * @param {Date} date Some begin date.
	 * @param {Integer} skip The number of intervals to move. Defaults
	 * to one.
	 * @return {Date} A new date that has been set to the previous open of the
	 * market.
	 */
	_ClockP._findPrevious = null;

	return _exports;

});