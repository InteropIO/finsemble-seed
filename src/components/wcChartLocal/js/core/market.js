//-------------------------------------------------------------------------------------------
// Copyright 2012-2017 by ChartIQ, Inc.
// All rights reserved
//-------------------------------------------------------------------------------------------
(function(_exports) {
	if(!_exports) _exports={};

	/**
	 * The market class is what the chart uses to to manage market hours for the different exchanges.
	 * It uses `Market Definitions` to decide when the market is open or closed.
	 * Although you can construct many market classes with different definitions to be used in your functions, only one market definition can be attached to the chart at any given time.
	 * Once a market is defined, an [iterator]{@link CIQ.Market#newIterator} can be created to traverse through time, taking into account the market hours.
	 * Additionally, a variety of convenience functions can be used to check the market status, such as {@link CIQ.Market#isOpen} or {@link CIQ.Market#isMarketDay}.
	 *
	 * A chart will operate 24x7, unless a market definition is assigned to it.
	 * See {@link CIQ.ChartEngine#setMarket} and {@link CIQ.ChartEngine#setMarketFactory} for instructions on how to assign a market definition to a chart.
	 * The chart also provides convenience functions that allows you to traverse through time at the current chart periodicity without having to explicitly create a new iterator.
	 * See {@link CIQ.ChartEngine#getNextInterval} and {@link CIQ.ChartEngine#standardMarketIterator} for details.
	 *
	 * It is also important to note that if the {@link CIQ.ExtendedHours} visualization and filtering add-on is enabled, **only data within the defined market hours will be displayed on the chart** even if more data is loaded.
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
	 * - Market rule times are specified in the market's local timezone.
	 * - Seconds are not considered for open or close times, but are okay for intra day data.
	 * - Rules are processed top to bottom.
	 * - Default market rules do not have a `name` parameter and are enabled by default.
	 * - Default market rules are mandatory, and used to define the primary market session.
	 * - Non-default market rules require a `name` parameter included.
	 * - All non-default market rules are disabled by default.
	 * 
	 * 		This is a rule for a 'pre' market session:
	 * 			`{"dayofweek": 1, "open": "08:00", "close": "09:30", name: "pre"}`
	 * 
	 * - To enable or disable non-default market rules by session name, use {@link CIQ.Market#enableSession} and {@link CIQ.Market#disableSession}.
	 *  - **Important:** Enabling/Disabling market sessions will not automatically filter-out data from the chart, but simply adjust the market iterators so the x-axis can be displayed accordingly in the absence of data for the excluded sessions.
	 *  - Data filtering can be done: 
	 *    - Manually by requesting pertinent data from your feed and calling {@link CIQ.ChartEngine#newChart}
	 *    - Automatically by using the {@link CIQ.ExtendedHours} visualization and filtering add-on.
	 * - First, the `dayofweek` wild card rules are processed. As soon as a rule is matched, processing breaks.
	 *
	 * 		This rule says the market is open every Monday from 9:30 to 16:00:
	 * 			`{"dayofweek": 1, "open": "09:30", "close": "16:00"}`
	 *
	 * - After the `dayofweek` rules are processed all of the extra rules are processed.
	 * - Multiple `open` and `close` times can be set for the same day of week. To indicate the market is closed during lunch, for example.
	 *
	 * 			```
	 * 			{"dayofweek": 1, "open": "09:00", "close": "12:00"}, // mon
	 *			{"dayofweek": 1, "open": "13:00", "close": "17:00"}  // mon
	 *			```
	 *
	 * - Wildcard rules should be placed first and more specific rules should be placed later.
	 *
	 * 		This rule is a wildcard rule for Christmas. If Christmas is on Monday, the
	 * 		first set of rules will evaluate to true because the dayofweek rule for day
	 * 		one will match. Then this rule will match if the date is the 25th of
	 * 		December in any year.  Because open is 00:00 and close is 00:00, it will evaluate to false:
	 * 			`{"date": "*-12-25", "open": "00:00", "close": "00:00"}`
	 *
	 * - After wildcard exceptions, any specific day and time can be matched.
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
	 * Once defined, it can be used to create a new market instance.
	 *
	 * Example:
	 *
	 * ```
	 *	var thisMarket = new CIQ.Market(marketDefinition);
	 * ```
	 *
	 * If no definition is provided, the market will operate 24x7.
	 *
	 * Example:
	 * ```
	 * new CIQ.Market();
	 * ```
	 *
	 * @param {object} [market_definition] A json object that contains the rules for some market. If not defined default market is always open.
	 *
	 * @constructor
	 * @name  CIQ.Market
	 * @since
	 * <br>04-2016-08
	 * <br>06-2016-02 - You can now specify times for different market sessions ('pre',post', etc) to be used with the sessions visualization tools. See {@link CIQ.ExtendedHours}.
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

				//Now Monday thru Friday is open. Close any exceptions

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
	var CIQ=_exports.CIQ, timezoneJS=_exports.timezoneJS;
	if(!CIQ) {
		CIQ = function(){};
		_exports.CIQ = CIQ;
	}
	var HOUR_MILLIS = 60000 * 60;
	var DAY_MILLIS = HOUR_MILLIS * 24;

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
		this.getSessionNames();
	};

	/**
	 * An array of objects containing information about the current market's extended sessions.
	 * Each element has a name prop (for the name of the session) and an enabled prop.
	 * See {@link CIQ.ExtendedHours} for more information on extended sessions.
	 * @type array
	 * @default
	 * @alias sessions
	 * @memberof CIQ.Market
	 * @example
	 * marketSessions=stxx.chart.market.sessions
	 */
	CIQ.Market.prototype.sessions=null;

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
			{"date": "2018-01-15"},
			{"date": "2018-02-19"},
			{"date": "2018-03-30"},
			{"date": "2018-05-28"},
			{"date": "2018-07-03", "open": "4:00", "close": "9:30", name: "pre"},
			{"date": "2018-07-03", "open": "9:30", "close": "13:00"},
			{"date": "2018-09-03"},
			{"date": "2018-11-22"},
			{"date": "2018-11-23", "open": "4:00", "close": "9:30", name: "pre"},
			{"date": "2018-11-23", "open": "9:30", "close": "13:00"},
			{"date": "2018-12-24", "open": "4:00", "close": "9:30", name: "pre"},
			{"date": "2018-12-24", "open": "9:30", "close": "13:00"},

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

	CIQ.Market.LSE = {
		"name": "London",
		"market_tz": "Europe/London",
		"hour_aligned": false,
		"rules": [
			//First open up the regular trading times
			//Note that sat and sun (in this example) are always closed because
			//everything is closed by default and we didn't explicitly open
			//them.
			{"dayofweek": 1, "open": "08:00", "close": "17:00"}, //mon
			{"dayofweek": 2, "open": "08:00", "close": "17:00"},
			{"dayofweek": 3, "open": "08:00", "close": "17:00"},
			{"dayofweek": 4, "open": "08:00", "close": "17:00"},
			{"dayofweek": 5, "open": "08:00", "close": "17:00"}, //fri

			//Now mon thru friday is open. Close any exceptions

			//always closed on Christmas and boxing day
			{"date": "*-12-25", "open": "00:00", "close": "00:00"},
			{"date": "*-12-26", "open": "00:00", "close": "00:00"},

			//always close on new years day
			{"date": "*-01-01", "open": "00:00", "close": "00:00"},

			//Some holidays are observed on different days each year or if
			//the day falls on a weekend. Each of those rules must be specified.
			{"date": "2012-01-02", "open": "00:00", "close": "00:00"},

			//As a special case if no open and close attributes are set they
			//will be assumed "00:00" and "00:00" respectively
			{"date": "2018-03-30"},
			{"date": "2018-04-02"},
			{"date": "2018-05-07"},
			{"date": "2018-05-28"},
			{"date": "2018-08-27"},
			{"date": "2018-12-24", "open": "8:00", "close": "12:30"},
			{"date": "2018-12-31", "open": "8:00", "close": "12:30"},

			{"date": "2017-01-02"},
			{"date": "2017-04-14"},
			{"date": "2017-04-17"},
			{"date": "2017-05-01"},
			{"date": "2017-05-29"},
			{"date": "2017-08-28"},
			{"date": "2017-12-22", "open": "8:00", "close": "12:30"},
			{"date": "2017-12-29", "open": "8:00", "close": "12:30"},

			{"date": "2016-03-25"},
			{"date": "2016-03-28"},
			{"date": "2016-05-02"},
			{"date": "2016-05-30"},
			{"date": "2016-08-29"},
			{"date": "2016-12-23", "open": "8:00", "close": "12:30"},
			{"date": "2016-12-27"},
			{"date": "2016-12-30", "open": "8:00", "close": "12:30"},

			{"date": "2015-04-03"},
			{"date": "2015-04-06"},
			{"date": "2015-05-04"},
			{"date": "2015-05-25"},
			{"date": "2015-08-31"},
			{"date": "2015-12-24", "open": "8:00", "close": "12:30"},
			{"date": "2015-12-28"},
			{"date": "2015-12-31", "open": "8:00", "close": "12:30"},

			{"date": "2014-04-18"},
			{"date": "2014-04-21"},
			{"date": "2014-05-05"},
			{"date": "2014-05-26"},
			{"date": "2014-08-25"},
			{"date": "2014-12-24", "open": "8:00", "close": "12:30"},
			{"date": "2014-12-31", "open": "8:00", "close": "12:30"},

			{"date": "2013-03-29"},
			{"date": "2013-04-01"},
			{"date": "2013-05-06"},
			{"date": "2013-05-27"},
			{"date": "2013-08-26"},
			{"date": "2013-12-24", "open": "8:00", "close": "12:30"},
			{"date": "2013-12-31", "open": "8:00", "close": "12:30"},

			{"date": "2012-01-02"},
			{"date": "2012-04-06"},
			{"date": "2012-04-09"},
			{"date": "2012-05-07"},
			{"date": "2012-06-04"},
			{"date": "2012-06-05"},
			{"date": "2012-08-27"},
			{"date": "2012-12-24", "open": "8:00", "close": "12:30"},
			{"date": "2012-12-31", "open": "8:00", "close": "12:30"},
		]
	};
	
	/**
	 * Set of rules for identifying instrument's exchange and deriving a market definition from a symbol.
	 * This is only required if your chart will need to know the operating hours for the different exchanges.
	 * If using a 24x7 chart, this class is not needed.
	 *
	 * **Before using, please review and override every {@link CIQ.Market.Symbology} function to match the symbol format of your quote Feed or results will be unpredictable. **
	 *
	 * @namespace
	 * @name  CIQ.Market.Symbology
	 * @since 04-2016-08
	 */
	CIQ.Market.Symbology=function(){};

	/**
	 * Returns true if the instrument is foreign.
	 * 
	 * **This is dependent on the market data feed and should be overridden accordingly.**
	 * 
	 * Currently if the instrument contains a period (.) it will be considered foreign (non US). (e.g. .XXXX)
	 * @param  {string}  symbol The symbol
	 * @return {boolean}        True if it's a foreign symbol
	 * @memberof CIQ.Market.Symbology
	 * @since 04-2016-08
	 * @example
	 * CIQ.Market.Symbology.isForeignSymbol=function(symbol){
	 *	if(!symbol) return false;
	 *	return symbol.indexOf(".")!=-1;
	 * };
	 */
	CIQ.Market.Symbology.isForeignSymbol=function(symbol){
		if(!symbol) return false;
		return symbol.indexOf(".")!=-1;
	};

	/**
	 * Returns true if the instrument is a futures.
	 * 
	 * **This is dependent on the market data feed and should be overridden accordingly.**
	 * 
	 * Currently if the symbol begins with `/` it will be considered a future. (e.g. /C)
	 * @param  {string}  symbol The symbol
	 * @return {boolean}        True if it's a futures symbol
	 * @memberof CIQ.Market.Symbology
	 * @since 04-2016-08
	 * @example
	 * CIQ.Market.Symbology.isFuturesSymbol=function(symbol){
	 *	if(!symbol) return false;
	 *	if(symbol.indexOf("/")!==0 || symbol=="/") return false;
	 *	return true;
	 * };
	 */
	CIQ.Market.Symbology.isFuturesSymbol=function(symbol){
		if(!symbol) return false;
		if(symbol.indexOf("/")!==0 || symbol=="/") return false;
		return true;
	};

	/**
	 * Returns true if the instrument is a forex symbol.
	 * 
	 * **This is dependent on the market data feed and should be overridden accordingly.**
	 * 
	 * Currently if the symbol begins with `^` and is followed by 6 alpha characters, or just 6 alpha characters long without a '^', it will be considered forex.(e.g. ^EURUSD)
	 * @param  {string}  symbol The symbol
	 * @return {boolean}        True if it's a forex symbol
	 * @memberof CIQ.Market.Symbology
	 * @since 04-2016-08
	 * @example
	 * CIQ.Market.Symbology.isForexSymbol=function(symbol){
	 *	if(!symbol) return false;
	 *  if(CIQ.Market.Symbology.isForeignSymbol(symbol)) return false;
	 *  if(CIQ.Market.Symbology.isFuturesSymbol(symbol)) return false;
	 *	if(symbol.length<6 || symbol.length>7) return false;
	 *	if(symbol.length==6 && symbol[5]=="X") return false;
	 *	if(/\^?[A-Za-z]{6}/.test(symbol)) return true;
	 *	return false;
	 * };
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
	 * 
	 * **This is dependent on the market data feed and should be overridden accordingly.**
	 * 
	 * Currently it must be a [forex]{@link CIQ.Market.Symbology.isForexSymbol} for a precious metal. (e.g. ^XAUUSD - looks for XAU,XPD,XPT,XAG only)
	 * @param  {string}   symbol The symbol
	 * @param  {boolean}  inverse Set to true to test specifically for a currency/metal pair.
	 * @return {boolean}  True if it's a metal symbol
	 * @memberof CIQ.Market.Symbology
	 * @since 04-2016-08
	 * @example
	 * CIQ.Market.Symbology.isForexMetal=function(symbol,inverse){
	 *	if(!symbol) return false;
	 *	if(!CIQ.Market.Symbology.isForexSymbol(symbol)) return false;
	 *	if(symbol.charAt(0)!="^") symbol="^"+symbol;
	 *	if(",XAU,XPD,XPT,XAG,".indexOf(","+symbol.substr(4,3)+",")!=-1) return true;
	 *	else if(!inverse && ",XAU,XPD,XPT,XAG,".indexOf(","+symbol.substr(1,3)+",")!=-1) return true;
	 *	return false;
	 * };
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
	 * 
	 * **This is dependent on the market data feed and should be overridden accordingly.**
	 * 
	 * @param  {string} symbol The symbol
	 * @return {boolean} True if the symbol is a forex or a future
	 * @memberof CIQ.Market.Symbology
	 * @since 04-2016-08
	 * @example
	 * CIQ.Market.Symbology.isForexFuturesSymbol=function(symbol){
	 *	if(CIQ.Market.Symbology.isForexSymbol(symbol)) return true;
	 *	if(CIQ.Market.Symbology.isFuturesSymbol(symbol)) return true;
	 *	return false;
	 * };
	 */
	CIQ.Market.Symbology.isForexFuturesSymbol=function(symbol){
	    if(CIQ.Market.Symbology.isForexSymbol(symbol)) return true;
	    if(CIQ.Market.Symbology.isFuturesSymbol(symbol)) return true;
		return false;
	};

	/**
	 * This is a function that takes a symbolObject of form accepted by {@link CIQ.ChartEngine#newChart}, and returns a market definition.
	 * When loading it with {@link CIQ.ChartEngine#setMarketFactory}, it will be used by the chart to dynamically change market definitions when a new instrument is activated.
	 * 
	 * ** Very important:**<br>
	 * This default implementation leverages the use of the {@link CIQ.Market.Symbology} checks (isForeignSymbol, isForexFuturesSymbol, isForexMetal, isForexSymbol, isFuturesSymbol), 
	 * which are used to determine the market for the symbol being loaded. 
	 * As such it is crucial you review and override every {@link CIQ.Market.Symbology} function to match the symbol format of your quote Feed or results will be unpredictable. 
	 * 
	 * See {@link CIQ.Market} for instruction on how to create a market definition.
	 * @param  {object} symbolObject Symbol object of form accepted by {@link CIQ.ChartEngine#newChart}
	 * @return {object} A market definition. See {@link CIQ.Market} for instructions.
	 * @memberof CIQ.Market.Symbology
	 * @since 04-2016-08
	 * @example
	 * // default implementation
	 * var factory=function(symbolObject){
	 * 	var symbol=symbolObject.symbol;
	 *	if(CIQ.Market.Symbology.isForeignSymbol(symbol)) return null; // 24 hour market definition
	 *	if(CIQ.Market.Symbology.isFuturesSymbol(symbol)) return CIQ.Market.GLOBEX;
	 *	if(CIQ.Market.Symbology.isForexMetal(symbol)) return CIQ.Market.METALS;
	 *	if(CIQ.Market.Symbology.isForexSymbol(symbol)) return CIQ.Market.FOREX;
	 *	return CIQ.Market.NYSE;
	 * };
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
	 * Returns an array of objects containing a list of sessions and wether or not they are enabled
	 * 
	 * @return {object} String array of market session names, and corresponding status (e.g. [{ name: 'pre', enabled: false } { name: 'post', enabled: true }])
	 * @since 6.0.0
	 */
	CIQ.Market.prototype.getSessionNames=function(){
		if (!this.rules){
			//Its a safe assumption this is a 24 hour chart, and that it has no sessions
			this.sessions = [];
		}else if(!this.sessions){
			var names = [];
			var marketSessions=[];

			this.rules.map(function(rule){
				if (rule.name && names.indexOf(rule.name) === -1){
					names.push(rule.name);

					marketSessions.push({
						name: rule.name,
						enabled: rule.enabled ? rule.enabled : false
					});
				}
			});

			this.sessions = marketSessions;
		}
		return this.sessions.slice();
	};

	/**
	 * Primitive to find the next matching time segment taking into account rules for adjacent sessions.
	 * If the date lands exactly on the open or close time for a session, then it will still seek to the next market session.
	 * @param {date} date A start date time in the market_tz timezone.
	 * @param {boolean} open True if looking for an open time
	 * @return {date} A date in the market_tz timezone that falls somewhere in a matching time segment. Probably 1 before close. Or null if no rules are defined
	 * @memberof CIQ.Market
	 * @since  05-2016-10
	 * @private
	 */
	CIQ.Market.prototype._find_next_segment = function(date, open) {
		if (! this.market_def) return null; // special case
		if (! this.rules) return null; //special case
		var d = new Date(+date);
		var iter = this.newIterator({
			'begin': d,
			'interval': 1,
            'inZone': this.market_tz,
            'outZone': this.market_tz
		});
		if (this._wasOpenIntraDay(d)) {
			var hours = this.zseg_match.close_parts.hours;
			var minutes = this.zseg_match.close_parts.minutes;
			d.setHours(hours);
			d.setMinutes(minutes);
			iter = this.newIterator({
				'begin': d,
				'interval': 1,
                'inZone': this.market_tz,
                'outZone': this.market_tz

			});
		}
		return iter.next();
	};

	/**
	 * Primitive to find the previous matching time segment taking into account rules for adjacent sessions.
	 * If the date lands exactly on the open or close time for a session, then it will still seek to the previous market session.
	 * @param {date} date A start date time in the market_tz timezone.
	 * @param {boolean} open True if looking for an open time
	 * @return {date} A date in the market_tz timezone that falls somewhere in a matching time segment. Probably 1 before close. Or null of no rules are defined.
	 * @memberof CIQ.Market
	 * @since  05-2016-10
	 * @private
	 */
	CIQ.Market.prototype._find_prev_segment = function(date, open) {
		if (! this.market_def) return null; // special case
		if (! this.rules) return null; //special case
		var d = new Date(+date);
		var iter = this.newIterator({
			'begin': d,
			'interval': 1,
            'inZone': this.market_tz,
            'outZone': this.market_tz

		});

		var wasOpenIntraDay = this._wasOpenIntraDay(d);

		// adjust edge cases to force a previous instance
		// if we are at the exact open or close time, go back one tick to force a previous session
		if( wasOpenIntraDay === null ){
			// move back one minute... not in the market clock.
			d = new Date(d - 60000);
			// then see if there was a session a minute ago... if so, then we were at the exact open or close time
			wasOpenIntraDay = this._wasOpenIntraDay(d);
		} else {
			if(
				(open && d.getHours() === this.zseg_match.open_parts.hours &&  d.getMinutes() === this.zseg_match.open_parts.minutes ) ||
				(!open && d.getHours() === this.zseg_match.close_parts.hours &&  d.getMinutes() === this.zseg_match.close_parts.minutes )
			){
				d= iter.previous();
			}
		}

		if (wasOpenIntraDay) {
			var hours = this.zseg_match.open_parts.hours;
			var minutes = this.zseg_match.open_parts.minutes;
			d.setHours(hours);
			d.setMinutes(minutes);
			iter = this.newIterator({
				'begin': d,
				'interval': 1,
                'inZone': this.market_tz,
                'outZone': this.market_tz
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
	 * 
	 * - **Important:** Enabling/Disabling market sessions will not automatically filter-out data from the chart, but simply adjust the market iterators so the x-axis can be displayed accordingly in the absence of data for the excluded sessions.
	 * - Data filtering can be done: 
	 *   - Manually by requesting pertinent data from your feed and calling {@link CIQ.ChartEngine#newChart}
	 *   - Automatically by using the {@link CIQ.ExtendedHours} visualization and filtering add-on.
	 * 
	 * @param {string} session_name A session name matching a valid name present in the market definition.
	 * @param {object} [inverted] Any true value (`true`, non-zero value or string) passed here will enable the session, otherwise the session will be disabled.
	 * @memberof CIQ.Market
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
	 * Enable a market session by name. See {@link CIQ.Market#disableSession} for full usage details.
	 * @param {string} session_name A session name
	 * @memberof CIQ.Market
	 * @since  06-2016-02
	 */
	CIQ.Market.prototype.enableSession = function(session_name) {
		this.disableSession(session_name, 'enable_instead');
	};

	/**
	 * Parses the market definition for a list of market names, and enables each one-by-one, see {@link CIQ.Market#enableSession} and {@link CIQ.Market#disableSession}.
	 *  - **Important:** Enabling/Disabling market sessions will not automatically filter-out data from the chart, but simply adjust the market iterators so the x-axis can be displayed accordingly in the absence of data for the excluded sessions.
	 * @memberof CIQ.Market
	 * @since 6.0.0
	 */
	CIQ.Market.prototype.enableAllAvailableSessions=function(){
		var marketSessions = this.getSessionNames();
		for (var i = 0; i < marketSessions.length; i++){
			this.enableSession(marketSessions[i].name);
		}
	};

	/**
	 * Get the close date/time for the trading day or specific session.
	 * @param {date} [date=now] date The date on which to check.
	 * @param {string} [session_name] Specific market session. If `session_name` is not passed in, the first close time of the day will be returned,
	 * depending on the sessions that are enabled.  If a session name is passed in, then not only does the market session
	 * need to be open on the day of `date`, but also within the time of the specified session.  Otherwise, null will be returned.
	 * Pass in "" to specify only the default session when other session are also active.
	 * @param {string} [inZone] Optional datazone to translate from - If no market zone is present it will assume browser time.
	 * @param {string} [outZone] Optional datazone to translate to - If no market zone is present it will assume browser time.
	 * @return {date} Close date/time for the trading session or null if the market is
	 * closed for the given date.
	 * @memberof CIQ.Market
	 * @since  05-2016-10
	 */
	CIQ.Market.prototype.getClose = function(date, session_name, inZone, outZone) {
		if (! this.market_def) return null; // special case
		if (! this.rules) return null; //special case
		var d = date;
		if( !date ) {
			d=new Date();
			inZone = null; // if they don't send the date we set one up in browser time, so need to remove the inZone
		}
		d = this._convertToMarketTZ(d, inZone);

		if (typeof session_name !== 'undefined') {
			if (this._wasOpenIntraDay(d)) {
				if (this.zseg_match.name === session_name) {
					d.setHours(this.zseg_match.close_parts.hours,
								this.zseg_match.close_parts.minutes, 0, 0);
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

				d.setHours(zseg_match.close_parts.hours, zseg_match.close_parts.minutes, 0, 0);
				d=this._convertFromMarketTZ(d, outZone);
				return d;
			}
		}
		return null;
	};

	/**
	 * Get the close time for the current market session, or if the market is closed, the close time for the next market session.
	 * @param {date} [date=now] date The date on which to check.
	 * @param {string} [inZone] Optional datazone to translate from - If no market zone is present it will assume browser time.
	 * @param {string} [outZone] Optional datazone to translate to - If no market zone is present it will assume browser time.
	 * @return {date} A date set to the close time of the next open market session.
	 * @memberof CIQ.Market
	 * @since  05-2016-10
	 */
	CIQ.Market.prototype.getNextClose = function(date, inZone, outZone) {
		if (! this.market_def) return null; // special case
		if (! this.rules) return null; //special case

		var d = date;
		if( !date ) {
			d=new Date();
			inZone = null; // if they don't send the date we set one up in browser time, so need to remove the inZone
		}
		d = this._convertToMarketTZ(d, inZone);
		if (! this._wasOpenIntraDay(d)) {
			var iter = this.newIterator({
				'begin': d,
				'interval': 1,
                'inZone': this.market_tz,
                'outZone': this.market_tz
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
		d.setHours(zseg_match.close_parts.hours, zseg_match.close_parts.minutes, 0, 0);
		d=this._convertFromMarketTZ(d, outZone);
		return d;

	};

	/**
	 * Get the next market session open time. If the requested date is the opening time for the session, then
	 * it will iterate to opening time for the next market session.
	 * @param {date} [date=now] date An The date on which to check.
	 * @param {string} [inZone] Optional datazone to translate from - If no market zone is present it will assume browser time.
	 * @param {string} [outZone] Optional datazone to translate to - If no market zone is present it will assume browser time.
	 * @return {date} A date aligned to the open time of the next open session. If no rules are defined, it will return null.
	 * @memberof CIQ.Market
	 * @since  05-2016-10
	 */
	CIQ.Market.prototype.getNextOpen = function(date, inZone, outZone) {
		if (! this.market_def) return null; // special case
		if (! this.rules) return null; //special case
		var d = date;
		if( !date ) {
			d=new Date();
			inZone = null; // if they don't send the date we set one up in browser time, so need to remove the inZone
		}
		d = this._convertToMarketTZ(d, inZone);
		d = this._find_next_segment(d);
		if (this.zseg_match.adjacent_parent) {
			d=this.getNextOpen(d,this.market_tz,this.market_tz);
			d=this._convertFromMarketTZ(d, outZone);
			return d;
		}
		d.setHours(this.zseg_match.open_parts.hours);
		d.setMinutes(this.zseg_match.open_parts.minutes);
		d=this._convertFromMarketTZ(d, outZone);
		return d;
	};

	/**
	 * Get the open date/time for a market day or specific session.
	 * @param {date} [date=now] date The date on which to check.
	 * @param {string} [session_name] Specific market session. If `session_name` is not passed in, the first open time of the day will be returned,
	 * depending on the sessions that are enabled.  If a session name is passed in, then not only does the market session
	 * need to be open on the day of `date`, but also within the time of the specified session.  Otherwise, null will be returned.  Pass in "" to
	 * specify only the default session when other session are also active.
	 * @param {string} [inZone] Optional datazone to translate from - If no market zone is present it will assume browser time.
	 * @param {string} [outZone] Optional datazone to translate to - If no market zone is present it will assume browser time.
	 * @return {date} A date time for the open of a session or null if the market is
	 * closed for the given date or there are no market rules to check.
	 * @memberof CIQ.Market
	 * @since  05-2016-10
	 */
	CIQ.Market.prototype.getOpen = function(date, session_name, inZone, outZone) {
		if (! this.market_def) return null; // special case
		if (! this.rules) return null; //special case
		var d = date;
		if( !date ) {
			d=new Date();
			inZone = null; // if they don't send the date we set one up in browser time, so need to remove the inZone
		}
		d = this._convertToMarketTZ(d, inZone);
		if (typeof session_name !== 'undefined') {
			if (this._wasOpenIntraDay(d)) {
				if (this.zseg_match.name == session_name) {
					d.setHours(this.zseg_match.open_parts.hours,
								this.zseg_match.open_parts.minutes,0,0);
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

				d.setHours(zseg_match.open_parts.hours, zseg_match.open_parts.minutes, 0, 0);
				d=this._convertFromMarketTZ(d, outZone);
				return d;
			}
		}
		return null;
	};

	/**
	 * Get the previous session close time.
	 * If the date lands exactly on the close time for a session then it will still seek to the previous market session's close.
	 * @param {date} [date=now] date The date on which to check.
	 * @param {string} [inZone] Optional datazone to translate from - If no market zone is present it will assume browser time.
	 * @param {string} [outZone] Optional datazone to translate to - If no market zone is present it will assume browser time.
	 * @return {date} A date aligned to the previous close date/time of a session. If no rules are defined, it will return null.
	 * @memberof CIQ.Market
	 * @since  05-2016-10
	 */
	CIQ.Market.prototype.getPreviousClose = function(date, inZone, outZone) {
		if (! this.market_def) return null; // special case
		if (! this.rules) return null; //special case
		var d = date;
		if( !date ) {
			d=new Date();
			inZone = null; // if they don't send the date we set one up in browser time, so need to remove the inZone
		}
		d = this._convertToMarketTZ(d, inZone);
		d = this._find_prev_segment(d, false);
		if (this.zseg_match.adjacent_child) {
			return this.getPreviousClose(d,this.market_tz,this.market_tz);
		}
		d.setHours(this.zseg_match.close_parts.hours);
		d.setMinutes(this.zseg_match.close_parts.minutes);
		d=this._convertFromMarketTZ(d, outZone);
		return d;
	};

	/**
	 * Get the previous session open time. If the date lands exactly on the open time for a session then
	 * it will still seek to the previous market session's open.
	 * @param {date} [date=now] date An The date on which to check.
	 * @param {string} [inZone] Optional datazone to translate from - If no market zone is present it will assume browser time.
	 * @param {string} [outZone] Optional datazone to translate to - If no market zone is present it will assume browser time.
	 * @return {date} A date aligned to previous open date/time of a session. If no rules are defined, it will return null.
	 * @memberof CIQ.Market
	 * @since  05-2016-10
	 */
	CIQ.Market.prototype.getPreviousOpen = function(date, inZone, outZone) {
		if (! this.market_def) return null; // special case
		if (! this.rules) return null; //special case
		var d = date;
		if( !date ) {
			d=new Date();
			inZone = null; // if they don't send the date we set one up in browser time, so need to remove the inZone
		}
		d = this._convertToMarketTZ(d, inZone);
		d = this._find_prev_segment(d, true);
		if (this.zseg_match.adjacent_parent) {
			return this.getPreviousOpen(d,this.market_tz,this.market_tz);
		}
		d.setHours(this.zseg_match.open_parts.hours);
		d.setMinutes(this.zseg_match.open_parts.minutes);
		d=this._convertFromMarketTZ(d, outZone);
		return d;
	};

	/**
	 * Return the session name for a date. If the name is defined and if the date
	 * lands in a session that is open. Otherwise return null.
	 * @param {date} date A date object
	 * @param {string} [inZone] Timezone of incoming date - If no market zone is present it will assume browser time.
	 * @return {object} String or null
	 * @memberOf  CIQ.Market
	 */
	CIQ.Market.prototype.getSession = function(date, inZone) {
		date = this._convertToMarketTZ(date, inZone);
		if (this._wasOpenIntraDay(date) && this.zseg_match) {
			return this.zseg_match.name;
		}
		return null;
	};

	/**
	 * @return {date} Current time in the market zone
	 * @memberof CIQ.Market
	 * @since 04-2016-08
	 */
	CIQ.Market.prototype.marketZoneNow = function() {
		return this._convertToMarketTZ(new Date());
	};

	/**
	 * @return {boolean} `true` if this market is hour aligned.
	 * @memberof CIQ.Market
	 * @since 04-2016-08
	 */
	CIQ.Market.prototype.isHourAligned = function() {
		return this.hour_aligned;
	};

	/**
	 * Checks if the market is currently open.
	 * @return {object} An object with the open market session's details, if the market is open right now. Or `null` if no sessions are currently open.
	 * @memberof CIQ.Market
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
	 * @return {object} An object with the open market session's details, if it is a market day. Or `null` if it is not a market day.
	 * @memberof CIQ.Market
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
	 * Checks if a supplied date is a market day.  Only the date is examined; hours, minutes, seconds are ignored
	 * @param {date} date A date
	 * @return {object} An object with the open market session's details, if it is a market day. Or `null` if it is not a market day.
	 * @memberof CIQ.Market
	 * @since 04-2016-08
	 */
	CIQ.Market.prototype.isMarketDate = function(date) {
	    return this._wasOpenDaily(date);
	};

	/**
	 * Creates iterators for the associated Market to traverse through time taking into account market hours.
	 * An iterator instance can go forward or backward in time any arbitrary amount.
	 * However, the internal state cannot be changed once it is constructed. A new iterator should be
	 * constructed whenever one of the parameters changes. For example, if the
	 * `interval` changes a new iterator will need to be built. If the `displayZone`
	 * or `dataZone` changes on the market, new iterators will also need to be
	 * constructed.
	 *
	 * See {@link CIQ.Market.Iterator} for all available methods.
	 *
	 * See the following convenience functions: {@link CIQ.ChartEngine#getNextInterval} and  {@link CIQ.ChartEngine#standardMarketIterator}
	 *
	 * @param {object} parms Parameters used to initialize the Market object.
	 * @param {string} [parms.interval] A valid interval as required by {@link CIQ.ChartEngine#setPeriodicity}. Default is 1 (minute).
	 * @param {number} [parms.periodicity] A valid periodicity as required by {@link CIQ.ChartEngine#setPeriodicity}. Default is 1.
	 * @param {string} [parms.timeUnit] A valid timeUnit as required by {@link CIQ.ChartEngine#setPeriodicity}. Default is "minute"
	 * @param {date} [parms.begin] The date to set as the start date for this iterator instance. Default is `now`. Will be assumed to be `inZone` if one set.
	 * @param {string} [parms.inZone] A valid timezone from the timeZoneData.js library. This should represent the time zone for any input dates such as `parms.begin` in this function or `parms.end` in {@link CIQ.Market.Iterator#futureTick}. Defaults to browser timezone if none set.  - If no market zone is present it will assume browser time.
	 * @param {string} [parms.outZone] A valid timezone from the timeZoneData.js library. This should represent the time zone for the returned dates. Defaults to browser timezone if none set.  - If no market zone is present it will assume browser time.
	 * @return {object} A new iterator.
	 * @memberof CIQ.Market
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
			_interval = "minute";
		}
		if(_interval=="hour") _interval=60;
		if (!_multiple) {
			_multiple = 1;
		}
		if (!parms.begin) {
			parms.begin = new Date();
			parms.inZone=null;
		}
	    if (_interval == parseInt(_interval, 10)) {
	    	_interval = parseInt(_interval, 10); // in case it was a string, which is allowed in setPeriodicity.

			// if the periodicity<1 then the x-axis might be in seconds (<1/60, msec)
			if(parms.periodicity < 1/60){
				_multiple = _multiple * _interval * 60000;
				_interval = 'millisecond';
			}else if(parms.periodicity < 1){
				_multiple = _multiple * _interval * 60;
				_interval = 'second';
			} else {
				_multiple = _multiple * _interval;
				_interval = 'minute';
			}

	    }
	    if (parms.timeUnit) {
	    	if (parms.timeUnit === "millisecond") {
	    		_interval = parms.timeUnit;
	    	} else if (parms.timeUnit === "second") {
	    		_interval = parms.timeUnit;
	    	} else if (parms.timeUnit === "tick") {
	    		_interval = "second";
	    	}
	    }
		if(_interval=="tick") _interval="second";
		parms.interval = _interval;
		parms.multiple = _multiple;
		parms.market = this;
		return new CIQ.Market.Iterator(parms);
	};

	/**
	 * Calculate whether this market was open on some date. This will depend on
	 * the data used when creating this market. This function does not take into
	 * account intraday data. It simply checks the date to see if the market was
	 * open at all on that day. Hours, minutes, seconds are ignored.
	 * @param {date} historical_date Javascript date object with timezone in the market time zone.
	 * @return {boolean} true if the market was open.
	 * @memberof CIQ.Market
	 * @since 04-2016-08
	 * @private
	 */
	CIQ.Market.prototype._wasOpenDaily = function(historical_date) {
		return this._was_open(historical_date, false);
	};

	/**
	 * Calculate whether this market was open on some date. This will depend on
	 * The data used when creating this market. This function will take into
	 * account intraday date that is minutes and seconds. Not only does a market
	 * need to be open on the day in question but also within the time specified.
	 * @param {date} historical_date Javascript date object with timezone in the market time zone.
	 * @return {boolean} true if the market was open.
	 * @memberof CIQ.Market
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
	 * @param {date} historical a valid Javascript date object with timezone in the market time zone.
	 * @param {boolean} intra_day true if intraday (will check between open and close times)
	 * @return {object} matching segment if any, or null if not
	 * @private
	 */
	CIQ.Market.prototype._was_open = function(historical, intra_day) {
		this.zopen_hour = 0;
		this.zopen_minute = 0;
		this.zclose_hour = 0;
		this.zclose_minute = 0;
		this.zmatch_open = false;
		this.zseg_match = null;
		if (!this.market_def || !this.rules){ // special case, 24h security
			this.zclose_hour = 24;
			return true;
		}
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
				if(!intra_day && this.zseg_match){
					if(segment.open_parts.hours>this.zopen_hour ||
						(segment.open_parts.hours==this.zopen_hour && segment.open_parts.minutes>this.zopen_minute)){
						continue;
					}
				}
				this.zopen_hour = segment.open_parts.hours;
				this.zopen_minute = segment.open_parts.minutes;
				this.zclose_hour = segment.close_parts.hours;
				this.zclose_minute = segment.close_parts.minutes;
				this.zmatch_open = (midnight_secs === segment.open);
				this.zseg_match = segment;
				if(intra_day) break;
			}
		}

		for (i = 0; i < this.extraHours.length; i++) {
			segment = this.extraHours[i];
			if (! segment.enabled) {
				continue;
			}
			if ('*' === segment.year || year === segment.year) {
				if (month === segment.month && date === segment.day) {
					extra_open = (!intra_day && segment.open) ||
						((midnight_secs >= segment.open) &&
							(midnight_secs < segment.close));
					if (!extra_open && this.zseg_match) {
						normally_open = false;
						this.zopen_hour = 0;
						this.zopen_minute = 0;
						this.zclose_hour = 0;
						this.zclose_minute = 0;
						this.zmatch_open = false;
						this.zseg_match = null;
					}
					if (extra_open) {
						if(!intra_day && this.zseg_match){
							if(segment.open_parts.hours>this.zopen_hour ||
								(segment.open_parts.hours==this.zopen_hour && segment.open_parts.minutes>this.zopen_minute)){
								continue;
							}
						}
						this.zopen_hour = segment.open_parts.hours;
						this.zopen_minute = segment.open_parts.minutes;
						this.zclose_hour = segment.close_parts.hours;
						this.zclose_minute = segment.close_parts.minutes;
						this.zmatch_open = (midnight_secs === segment.open);
						this.zseg_match = segment;
						if(intra_day) break;
					}
				}
			}
		}

		return this.zseg_match;
	};

	/**
	 * Convenience function for unit testing.
	 * @param {date} testDate A date
	 * @return {boolean} True if the market was closed on the given date
	 * @memberOf  CIQ.Market
	 */
	CIQ.Market.prototype._wasClosed = function(testDate) {
		return !this._was_open(testDate, true);
	};

	/**
	 * Convenience function for unit testing.
	 * @param {date} testDate A date
	 * @return {boolean} True if the market was open on the given date
	 * @memberOf  CIQ.Market
	 */
	CIQ.Market.prototype._wasOpen = function(testDate) {
		return this._was_open(testDate, true);
	};

	/**
	 * Get the difference in milliseconds between two time zones. May be positive or
	 * negative depending on the time zones. The purpose is to shift the source
	 * time zone some number of milliseconds to the target timezone. For example shifting
	 * a data feed from UTC to Eastern time. Or shifting Eastern time to Mountain
	 * time for display purposes. Note that it is important to pass the source
	 * and the target in the correct order. The algorithm does source - target. This
	 * will calculate the correct offset positive or negative.
	 * @param {date} date A date object. Could be any date object the javascript one
	 * or for example the timezone.js one. Must implement getTime() and
	 * getTimezoneOffset()
	 * @param {string} src_tz_str The source time zone. For example the data feed
	 * @param {string} target_tz_str The target time zone for example the market.
	 * @return {number} The number of milliseconds difference between the time
	 * zones.
	 * @memberOf  CIQ.Market
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
	 * @param {object} market An instance of a market.
	 * @memberOf  CIQ.Market
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
				rule.name = "";
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
					rd = _TimeSegmentS._createDateTimeSegment(market, rule);
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
	 * @private
	 */
	CIQ.Market._timeSegment = {};
	var _TimeSegmentS = CIQ.Market._timeSegment;

	_TimeSegmentS.re_wild_card_iso = /^(\*)-(\d\d)-(\d\d)$/;
	_TimeSegmentS.re_regular_iso = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
	_TimeSegmentS.re_split_hours_minutes = /^(\d\d):(\d\d)$/;
	_TimeSegmentS.re_split_hour_minutes = /^(\d):(\d\d)$/;

	/**
	 * Create a hash code for a string. We may move this to 3rd party later if
	 * we find a wider need for it. This came from StackOverflow and claims to be
	 * the same implementation used by Java.
	 * @param {string} str A string.
	 * @return {number} A number suitable for
	 * @private
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
	 * @param {string} str \d\d:\d\d or \d:\d\d
	 * @return {object} {minutes:int, hours:int}
	 * @private
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
	 * @return {object}
	 * configuration.
	 * @private
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
		if (data.name === "") {
			data.enabled = true;
		}
		data.hash_code = this._hashCode((data.open + data.close).toString());
		market.normalHours.push(data);
		return data;
	};

	/**
	 * Create a time segment for a specific date and time. This can also create
	 * a wild card segment that matches any year with a specific day and specific
	 * month. For example *-12-25 to match all Christmas days. It can also build
	 * any specific year month day open close time that will only match that
	 * specific range.
	 * @param {object} market an instance of a market
	 * @param {object} rule a single rule from a market definition
	 * @return {object|undefined} Undefined if this function works on the market object.
	 * @private
	 */
	_TimeSegmentS._createDateTimeSegment = function(market, rule) {
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
		if (data.name === "") {
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
	 * @param {object} market An instance of a market
	 * @param {string} time_str A time string like this "\d\d:\d\d"
	 * @param {boolean} open_time If true the time is used for opening a market
	 * @return {number} Seconds since midnight
	 * otherwise the time is used for closing a market. This is so that we can
	 * handle 00:00 and 24:00.
	 * @private
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
	 * If no market zone is present, the date will be returned unchanged.
	 * @param  {date} dt JavaScript Date
	 * @param  {string} [tz] timezoneJS timezone, or null to indicate browser localtime/UTC (dataZone)
	 * @return {date}    A JavaScript Date offset by the timezone change
	 * @memberOf  CIQ.Market
	 */
	CIQ.Market.prototype._convertToMarketTZ = function(dt, tz){
		//if(!this.market_tz) return dt;
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
	 * @param  {date} dt JavaScript Date
	 * @param  {string} [tz] timezoneJS timezone, or null to indicate browser localtime/UTC (displayZone)
	 * @return {date}    A JavaScript Date offset by the timezone change
	 * @memberOf  CIQ.Market
	 */
	CIQ.Market.prototype._convertFromMarketTZ = function(dt, tz){
		//if(!this.market_tz) return dt;
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
	 * @param {object} parms
	 * @param {object} parms.begin A dataset element from {@link CIQ.Chart.dataSet}
	 * @param {CIQ.Market} parms.market An instane of {@link CIQ.Market}
	 * @param {object} parms.periodicity A valid periodicity as require by {@link CIQ.ChartEngine#setPeriodicity}
	 * @param {string} parms.interval Time interval: millisecond, second, minute, hour, day, week, or month.
	 * @param {object} parms.multiple How many jumps to make on each interval loop.
	 * @param {string} parms.inZone Datazone to translate from
	 * @param {string} parms.outZone Datazone to translate to
	 * @constructor
	 * @since 04-2016-08
	 * @example
	    var market24=new CIQ.Market();
	    var iter_parms = {
	        'begin': stxx.chart.dataSet[stxx.chart.dataSet.length-1].DT,	// last item on the dataset
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
	    if(this.intraDay) this.begin=this.market._convertToMarketTZ(this.begin, parms.inZone);
		this.clock._setStart(this.begin);
		this.clock.minutes_aligned = false;
	};

	/**
	 * Returns the current date of the iterator without moving forwards or backwards.
	 * Takes into account display zone settings.
	 * @return {date} The current date of the iterator.
	 * @memberof CIQ.Market.Iterator
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
	 * @param {object} parms An object containing the following properties:
	 * @param {date} parms.end An end date. Will be assumed to be `inZone` if one set.
	 * @param {number} [parms.sample_size] Default is 25. Maximum amount of time
	 * (in milliseconds) taken to count ticks. If sample size is
	 * reached before the number of ticks is found the number of ticks will be
	 * estimated mathematically. The bigger the sample size couple with the
	 * distance between begin date and end date affect how precise the return value
	 * is.
	 * @param {number} [parms.sample_rate] Default is 1000. Maximum number of ticks to evaluate before checking `parms.sample_size`.
	 * @return {number} The number of ticks between begin and end.
	 * @memberof CIQ.Market.Iterator
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
		if(this.intraDay) end = this.market._convertToMarketTZ(parms.end, this.inZone).getTime();
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
			if( this.clock.ctime > end ) {
				// if not an exact match, we are one tick too far in the future by now. 
				// Go back one to return the tick that contains this time in its range. Rather than the next tick.
				ticks--;
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
	 * Checks if market is aligned and if iterator is intraday (daily intervals always align)
	 * @return {boolean} true if this market is hour aligned.
	 * @memberof CIQ.Market.Iterator
	 * @since 04-2016-08
	 */
	CIQ.Market.Iterator.prototype.isHourAligned = function() {
		return !this.intraDay || this.market.isHourAligned();
	};

	/**
	 * Check and see if this Market is open now.
	 * @return {object} An object with the open market session's details, if the market is open right now. Or `null` if no sessions are currently open.
	 * @memberof CIQ.Market.Iterator
	 * @since 04-2016-08
	 */
	CIQ.Market.Iterator.prototype.isOpen = function() {
		return this.market.isOpen();
	};

	/**
	 * Move the iterator one interval forward
	 * @param {number} [skip] Default 1. Jump forward skip * periodicity at once.
	 * @return {date} Next date in iterator `outZone`.
	 * @alias next
	 * @memberof CIQ.Market.Iterator
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
			}
		return this.clock.display_date;
	};

	/**
	 * Does not move the iterator. Takes into account display zone settings.
	 * Note. This is a convenience function for debugging or whatever else, but
	 * should not be called in the draw loop in production.
	 * @return {string} The current date of the iterator as a string.
	 * @memberof CIQ.Market.Iterator
	 * @since 04-2016-08
	 * @private
	 */
	CIQ.Market.Iterator.prototype.peek = function() {
		return this.clock._peek();
	};

	/**
	 * Move the iterator one interval backward
	 * @param {number} skip Default is one. Move this many multiples of interval.
	 * @return {date} Previous date in iterator `outZone`.
	 * @alias previous
	 * @memberof CIQ.Market.Iterator
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
		}
		return this.clock.display_date;
	};

	/**
	 * Internal object that simulates a clock that ticks forward and backwards
	 * at different intervals. Used internally by the iterator and not intended
	 * to be used outside of the context of a Market.
	 * @param {object} market An instance of market.
	 * @param {string} interval millisecond, second, minute, hour, day, week or month
	 * @param {number} multiple Move in multiple of intervals.
	 * @private
	 */
	CIQ.Market.Iterator._Clock = function(market, interval, multiple) {
		// rationalize rolled up intervals for better performance
		if(multiple%60===0 && interval==="second"){
			interval="minute";
			multiple=multiple/60;
		}

		this.market = market;
		this.interval = interval;
		this.multiple = multiple;
		this.intra_day = false;
		this.intervals = [];
		this.max_iters = 10080; //max minutes to check for rules. (one week);

		var tick_time = DAY_MILLIS, findNext=this._dayImpl;
		if(interval === "millisecond") {
			findNext = this._millisImpl;
			tick_time = 1;
		} else if (interval === "second") {
			findNext = this._secondImpl;
			tick_time = 1000;
		} else if (interval === "minute") {
			findNext = this._minuteImpl;
			tick_time = 60000;
		} else if (interval === "hour") {
			findNext = this._hourImpl;
			tick_time = HOUR_MILLIS;
		} else if (interval === "day") {
			findNext = this._dayImpl;
			tick_time = DAY_MILLIS;
		} else if (interval === "week") {
			findNext = this._weekImpl;
			tick_time = (DAY_MILLIS * 7);
		} else if (interval === "month") {
			findNext = this._monthImpl;
			tick_time = (DAY_MILLIS * 30);
		} else {
			console.log('Periodicity ERROR: "'+interval+'" is not a valid interval. Please see setPeriodicity() for details.' );
		}
		this.tick_time = tick_time * multiple;
		this.intra_day=(this.tick_time<DAY_MILLIS);
		this._findPrevious = this._findNext = findNext;
	};

	//Save me some carpal tunnel please.
	var _ClockP = CIQ.Market.Iterator._Clock.prototype;

	/**
	 * Calculate the amount of minutes in a given time span.
	 * This assumes hours are 24 hour format.
	 *
	 * NOTE! Does not know how to jump a 24 hour period, assumes that
	 * oHour is always less than cHour on the same day.
	 *
	 * This could be done with two dates instead and remove the limitations. Not
	 * sure if that is necessary at this point. We don't actually have two date
	 * objects at the point that we need this number. It would take some doing to
	 * figure out the date objects that would be needed.
	 * @param {number} oHour The opening hour
	 * @param {number} oMin The opening minute
	 * @param {number} cHour The closing hour
	 * @param {number} cMin The closing minute
	 * @return {number} Amount of minutes in a given time span.
	 * @private
	 */
	_ClockP._total_minutes = function(oHour, oMin, cHour, cMin) {
		//the parens are important in this case
		return (((cHour - oHour) * 60) - oMin) + cMin;
	};


	/**
	 * Create an array of minutes from the open minute to the close minute at
	 * some periodicity. This array will run the entire time of the last segment
	 * time segment matched.
	 * @return {array} Periods
	 * @private
	 */
	_ClockP._alignMinutes = function() {
		//TODO maybe need some caching here.
		if (this.market.zopen_minute === undefined) {
			return [];
		}
		var o_min = this.market.zopen_minute;
		if (this.market.isHourAligned() && this.multiple % 60 === 0) o_min=0;
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
	 * @param {number} max The high end of the range before wrapping back to zero.
	 * @return {array} Periods
	 * Example for seconds this would be 60.
	 * @private
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
	 * @return {date} A new Date object.
	 * @private
	 */
	_ClockP._date = function() {
		var t = Math.round(this.ctime);
		var current_date = new Date(t);

		if (this.intra_day) {
			this.display_date = new Date(t + this.shift_millis);
		} else {
			this.display_date = current_date;
		}

		return current_date;
	};

	/**
	 * Find the boundary for minutes, seconds or milliseconds.
	 * @param {array} periods A pre-calculated list of boundaries.
	 * @param {number} search_for Any number to align.
	 * @return {number} one of the boundaries in the array.
	 * @private
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
	 * @return {string} Current market date as a string
	 * @private
	 */
	_ClockP._peek = function() {
		return this._date().toString();
	};

	/**
	 * When searching for open days look in hour increments.
	 * Inverted.
	 * @private
	 */
	_ClockP._seekHr = function() {
		if (this.forward) {
			this.ctime -= HOUR_MILLIS;
		} else {
			this.ctime += HOUR_MILLIS;
		}
	};

	/**
	 * Set this instance of the iterator clock to some date. Calls to next or
	 * previous will move the clock some interval from this point in time.
	 * @param {date} date Any javascript date.
	 * @private
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
	 * @private
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
	 * @private
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
	 * @private
	 */
	_ClockP._tickTock24 = function() {
		this.ctime += DAY_MILLIS;
	};

	/**
	 * Move a day at a time inverted. Useful for finding Sunday when
	 * moving by weeks. Always moves backwards.
	 * @private
	 */
	_ClockP._tockTick24 = function() {
		this.ctime -= DAY_MILLIS;
	};

	/**
	 * Wind the clock to the next open market time. If the market is already open
	 * then don't move. Break out of the loop after max_iters regardless.
	 * @param {function} was_open Intraday or daily function to see if the market
	 * was open.
	 * @param {function} wind _tockTick (inverted) or _tickTock (regular)
	 * @return {boolean} True if the clock was moved
	 * @private
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
	 * @return {date} Current market date
	 * @private
	 */
	_ClockP._millisImpl = function() {
		var justAligned = false;
		if (!this.mperiods_aligned) {
			var periods = this._alignBaseZero(1000);
			var current_date = new Date(this.ctime);
			var current_millis = current_date.getMilliseconds();
			current_millis = this._alignToBoundary(periods, current_millis);
			current_date.setMilliseconds(0);
			this.ctime = current_date.getTime()+current_millis;  // this allows for fractional millis
			this.mperiods_aligned = true;
			justAligned = true;
		}
		// handle market closes
		var oldMinute=this._date().getMinutes();
		this._tickTock();
		var newMinute=this._date().getMinutes();
		if((justAligned || oldMinute!=newMinute) && !this.market._wasOpenIntraDay(this._date())) {
			var tickTime=this.tick_time;
			this.tick_time=60000;
			var multiple=this.multiple;
			this.multiple=1;
			this._minuteImpl();
			this.tick_time=tickTime;
			this.multiple=multiple;
		}
		return this._date();
	};

	/**
	 * Move the clock some number of seconds
	 * @return {date} Current market date
	 * @private
	 */
	_ClockP._secondImpl = function() {
		var justAligned = false;
		if (!this.speriod_aligned) {
			var periods = this._alignBaseZero(60);
			var current_date = new Date(this.ctime);
			var current_second = current_date.getSeconds();
			current_second = this._alignToBoundary(periods, current_second);
			current_date.setSeconds(current_second);
			current_date.setMilliseconds(0);
			this.ctime = current_date.getTime();
			this.speriod_aligned = true;
			justAligned = true;
		}
		// handle market closes
		var oldMinute=this._date().getMinutes();
		this._tickTock();
		var newMinute=this._date().getMinutes();
		if((justAligned || oldMinute!=newMinute) && !this.market._wasOpenIntraDay(this._date())) {
			var tickTime=this.tick_time;
			this.tick_time=60000;
			var multiple=this.multiple;
			this.multiple=1;
			this._minuteImpl();
			this.tick_time=tickTime;
			this.multiple=multiple;
		}
		return this._date();
	};

	/**
	 * Move the clock some number of minutes. Takes into account market start time
	 * and could change alignment each time it is called.
	 * @return {date}
	 * @private
	 */
	_ClockP._minuteImpl = function() {
		var closed = this._windMaybe(this.market._wasOpenIntraDay, this._tockTick);
		var current_date = new Date(this.ctime);
		var tzOffset = current_date.getTimezoneOffset();
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
		current_date.setHours(current_hour, boundary_min % 60, 0, 0);
		var offsetDiff = current_date.getTimezoneOffset() - tzOffset;
		if((this.forward && offsetDiff < 0) || (!this.forward && offsetDiff > 0)) {  //crossed a fallback timezone boundary
			current_date.setTime(current_date.getTime()-offsetDiff*60000);
		}
		this.ctime = current_date.getTime(); //boundary aligned
		this._tickTock(); //move once
		var current_segment = this.market.zseg_match;
		var alignToHour=(this.market.hour_aligned && this.multiple % 60 === 0);
		if (this._windMaybe(this.market._wasOpenIntraDay, this._tickTock) ||
				(!alignToHour && current_segment != this.market.zseg_match)) {
			current_date = new Date(this.ctime);
			if (this.forward) {
				current_date.setMinutes(this.market.zopen_minute);
				current_date.setHours(this.market.zopen_hour);
			} else {
				periods = this._alignMinutes();
				var last_boundary = periods[periods.length - 1];
				current_date.setMinutes(last_boundary % 60);
				current_date.setHours(
					Math.floor(last_boundary / 60) + this.market.zopen_hour);
			}
			this.ctime = current_date.getTime();
		}
		return this._date();
	};

	/**
	 * Move the clock some number of hours.
	 * @return {date}
	 * @private
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
		var current_segment = this.market.zseg_match;
		if (this._windMaybe(this.market._wasOpenIntraDay, this._tickTock) ||
				(!this.market.hour_aligned && current_segment != this.market.zseg_match)) {
			current_date = new Date(this.ctime);
			if (this.forward) {
				current_date.setMinutes(this.market.zopen_minute);
				current_date.setHours(this.market.zopen_hour);
			} else {
				periods = this._alignMinutes();
				var last_boundary = periods[periods.length - 1];
				current_date.setMinutes(last_boundary % 60);
				current_date.setHours(
					Math.floor(last_boundary / 60) + this.market.zopen_hour);
			}
			this.ctime = current_date.getTime();
		}
		return this._date();
	};

	/**
	 * Move the clock some number of days.
	 * @return {date}
	 * @private
	 */
	_ClockP._dayImpl = function() {
		this._windMaybe(this.market._wasOpenDaily, this._seekHr);
		var current_date = new Date(this.ctime); //closest open day
		current_date.setHours(12,0,0,0);
		this.ctime = current_date.getTime(); //boundary aligned
		var ctr = 0;
		while (ctr < this.multiple) {
			if (this.forward) {
				this._tickTock24();
			} else {
				this._tockTick24();
			}
			if (!this.market._wasOpenDaily(this._date())) {
				continue;
			}
			ctr += 1;
		}
		current_date = new Date(this.ctime);
		current_date.setHours(0);
		this.ctime = current_date.getTime(); //boundary aligned
		return this._date();
	};

	/**
	 * Move the clock some number of weeks.
	 * @return {date}
	 * @private
	 */
	_ClockP._weekImpl = function() {
		var current_date = new Date(this.ctime);
		current_date.setHours(12);  // Stay away from DST danger zone, so we know we only go back one date each tocktick
		this.ctime = current_date.getTime();
		this._tickTock(); // move once

		//Move to Sunday
		current_date = new Date(this.ctime);
		while (current_date.getDay() !== 0) {
			this._tockTick24();
			current_date = new Date(this.ctime);
		}

		//now align to first open day of week.
		this._windMaybe(this.market._wasOpenDaily, this._tickTock24);
		current_date = new Date(this.ctime);
		current_date.setHours(0,0,0,0);
		this.ctime = current_date.getTime(); //boundary aligned;
		return this._date();
	};

	/**
	 * Move the clock some number of months
	 * @return {date}
	 * @private
	 */
	_ClockP._monthImpl = function() {

		//Allow some room to account for different lengths of months.
		var current_date = new Date(this.ctime);
		current_date.setDate(15);  // Stay away from month boundaries so DST doesn't foil us
		this.ctime = current_date.getTime();

		this._tickTock(); // move once
		current_date = new Date(this.ctime);
		//Now re align back to the first day of the month
		current_date.setDate(1);
		current_date.setHours(12);  // Stay away from DST danger zone
		this.ctime = current_date.getTime();

		//Now find the first open day of month
		this._windMaybe(this.market._wasOpenDaily, this._tickTock24);
		current_date = new Date(this.ctime);
		current_date.setHours(0,0,0,0);
		this.ctime = current_date.getTime(); //boundary aligned;
		return this._date();
	};

	/**
	 * Search forward for the next market open
	 * @param {date} date Some begin date.
	 * @param {number} skip The number of intervals to move. Defaults
	 * to one.
	 * @return {date} A new date that has been set to the previous open of the
	 * market.
	 * @private
	 */
	_ClockP._findNext = null;

	/**
	 * Search backward for the next market open
	 * @param {date} date Some begin date.
	 * @param {number} skip The number of intervals to move. Defaults
	 * to one.
	 * @return {date} A new date that has been set to the previous open of the
	 * market.
	 * @private
	 */
	_ClockP._findPrevious = null;

	return _exports;

})/* removeIf(umd) */(typeof window !== 'undefined' ? window : global)/* endRemoveIf(umd) */;
