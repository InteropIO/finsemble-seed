(function(definition) {
    "use strict";

    if (typeof exports === "object" && typeof module === "object") {
        module.exports = definition(require('https://cdn.jsdelivr.net/crypto-js/3.1.2/rollups/md5.js'));
    } else if (typeof define === "function" && define.amd) {
        define(['https://cdn.jsdelivr.net/crypto-js/3.1.2/rollups/md5.js'], definition);
    } else if (typeof window !== "undefined" || typeof self !== "undefined") {
        var global = typeof window !== "undefined" ? window : self;
        definition(global);
    } else {
        throw new Error("Only CommonJS, RequireJS, and <script> tags supported for quoteFeedXignite.js.");
    }
})(function(_exports) {
    // var CIQ = _exports.CIQ;
    CIQ.QuoteFeed.wfgQuoteFeed = function() {}

    CIQ.QuoteFeed.wfgQuoteFeed.ciqInheritsFrom(CIQ.QuoteFeed)

    var quotes = []

    /////// CONVIENCE FUNCTIONS ///////

    function xmlToDom(data) {
        if (window.DOMParser) {
            parser = new DOMParser();
            xmlDoc = parser.parseFromString(data, "text/xml");
        } else // Internet Explorer
        {
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = false;
            xmlDoc.loadXML(data);
        }
        return xmlDoc;
    };

    function generateMD5() {

        var today = new Date;

        var hash = "chart_iq" + today.toISOString().slice(0, 10) + "fegot461";

        return CryptoJS.MD5(hash).toString()
    };

    function formatDate(date) {
        // debugger
        var d = new Date(date);
        console.log(d);
        d.setMonth(d.getMonth() - 3);
        console.log(d);
        return d
    };


    function inspectInLog(params) {
        console.log("Inspecting Params:");
        console.log('Start Date:' + params.startDate);
        console.log('End Date:' + params.endDate);
        console.log('Interval:' + params.interval);
        console.log('Period:' + params.periodicity);
        console.log('layout:' + params.stx.layout);
    }

    ///////////////////////////////////


    CIQ.QuoteFeed.wfgQuoteFeed = function(params) {
        console.log(params)
        this.baseUrl = 'http://services.chartiq.com/wfg/?chart_data_feed=1&username=chart_iq&key=' + generateMD5() + '&ticker='
            // return this.url= url
        if (params === undefined) {
            console.log("I should be empty the first time I'm called")
        } else {
            console.log("Now I should have been invoked with the container which you should see above.");
        }
    };

    CIQ.QuoteFeed.wfgQuoteFeed.prototype.fetch = function(params, cb) {

        this.confirmAttributes(params)
        var query = this.baseUrl + params.symbol
        var custom = "&charting_time_period=custom"

        /** Below block will set the frequency of the data pulled back from the API. This needs to happen before the other 'query evals' to ensure that we get back the data in the right format. */
        if (params.interval === 'minute') {
            query += "&charting_freq=1_minute&chart_time_period="+ 13 + "_day"
        } else if (params.interval === 'day') {
            query += "&charting_freq=1_day"
                ////////////////////////////////////////////

            // debugger

            if (params.startDate && params.endDate) {
                console.log("I shouldn't be called the first time but every subsequent time.");
                inspectInLog(params)
                query += custom + "&from_date=" + CIQ.yyyymmdd(params.startDate) + "&to_date=" + CIQ.yyyymmdd(params.endDate)

            } else if (params.startDate) {
                console.log("I should be updating daily progress! I'm like a messenger from the future.");
                this.datesFromTicks(params)
                query += custom + "&from_date=" + CIQ.yyyymmdd(params.startDate) + "&to_date=" + CIQ.yyyymmdd(params.endDate)


            } else if (params.endDate) {
                console.log("I'm actually paginating. I should be like a Delorean going back in time.");
                this.datesFromTicks(params)
                query += "&from_date=" + CIQ.yyyymmdd(params.startDate) + "&to_date=" + CIQ.yyyymmdd(params.endDate)
            }


            /** Check based off of ticks instead for the initial run of data */
            else {
                console.log("I should be getting called on the initial load");
                this.datesFromTicks(params)
                query += custom + "&from_date=" + CIQ.yyyymmdd(params.startDate) + "&to_date=" + CIQ.yyyymmdd(params.endDate)

                console.log(params.interval)
                console.log(query);
            }
        };

        // inspectInLog(params)
        this.getData(query, cb)

        return
    };



    CIQ.QuoteFeed.wfgQuoteFeed.prototype.datesFromTicks = function(params) {
        // debugger

        var d = new Date();
        if (params.endDate) {
            console.log("I go with pagination");
            var newDate = new Date(params.endDate)
            params.startDate = newDate
            params.startDate.setDate(newDate.getDate() - (params.ticks * 2));
            inspectInLog(params)
        } else if (params.startDate) {
            console.log("I go with updating");
            var newDate = new Date(params.startDate)
            params.endDate = newDate
            params.endDate.setDate(newDate.getDate() - (params.ticks * 2))
        } else {
            params.newDate = new Date()
            console.log("I'm run on the initial load");
            params.newDate.setDate(d.getDate() - (params.ticks * 2));
            console.log(params.newDate);
            params.startDate = params.newDate
            params.endDate = d
        }
        inspectInLog(params)
        return params
    }

    CIQ.QuoteFeed.wfgQuoteFeed.prototype.parseResponse = function(response) {

    };

    CIQ.QuoteFeed.wfgQuoteFeed.prototype.getData = function(params, cb) {
        console.log(params);
        CIQ.postAjax({
            url: params,
            cb: function(status, response) {
                console.log("Now fetching more data")
                var quotes = []
                if (status != 200) {
                    // something went wrong, use callback function to return your error
                    return cb({
                        error: "Woops something went wrong retrieving your data!"
                    })
                }
                if (response === "Invalid Key. You don't have permission to access this resource") {
                    console.log("Your password isn't working check the md5 generator")
                }

                var rawQuotes = xmlToDom(response).getElementsByTagName("data")
                for (var i = 0; i < rawQuotes.length; i++) {
                    var x = rawQuotes[i].childNodes
                    var y = parseFloat(x[5].innerHTML)
                    if (y != 0.00) {
                        quotes1 = {}
                        quotes1.Close = y
                        quotes1.Date = x[1].innerHTML
                        quotes1.Volume = x[7].innerHTML
                        quotes.push(quotes1)
                    }
                }
                /**
                 Due to the limitations of the WFG quoteFeed some unusual decisions have been made about when to end 'cb:moreAvailable'. Currently the API only provides intraday data for the last 13 days, because of this for intraday charts we've made the decision to always query 13 days in 1 minute intervals and terminate the fetch call.

                 For the daily intervals the quoteFeed will always return Price=0 on days which it has no data for. Since we stripped out all 0.00's while creating the quotes array this will leave us with an quotes.length === 1, our original date. This creates a uniquely safe scenario where it is ok to terminate the moreAvailable.
                */
                if (/13_day/.exec(params)) {
                  var more=false
                } else if (quotes.length===1){
                  var more=false
                } else {
                  var more=true
                }

                console.log("The size of the quotes array:" + quotes.length);

                return cb({
                    quotes: quotes,
                    moreAvailable: more
                });
            }

        });
        return
    }

    CIQ.QuoteFeed.wfgQuoteFeed.prototype.announceError = function() {
        console.log("Bad news everybody! Something went terribly wrong")
    }

    CIQ.QuoteFeed.wfgQuoteFeed.prototype.updateChart = function(query, cb, params) {
        console.log("Check me out, updating and stuff")

        inspectInLog(params);

        this.getData(query, cb);
    };

    CIQ.QuoteFeed.wfgQuoteFeed.prototype.update = function() {
        console.log("no check me out! I'm the OTHER update function ");
    };

    CIQ.QuoteFeed.wfgQuoteFeed.prototype.loadMore = function() {
        console.log("hey I should be doing stuff!!!!!");
    };

    CIQ.QuoteFeed.wfgQuoteFeed.prototype.confirmAttributes = function(params) {
        console.log("I'm confirming what attributes the chart should be getting");
        inspectInLog(params)

    };


    var behavior = {
        // QuoteFeed.fetch() will be called every 5 seconds with startDate set to the last tick on the chart
        refreshInterval: 1
    }
})
