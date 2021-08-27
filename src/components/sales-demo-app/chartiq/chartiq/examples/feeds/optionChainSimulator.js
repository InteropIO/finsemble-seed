import quoteFeedSimulator from "./quoteFeedSimulator.js";
const DEBUG = false;
const ONE_DAY = 24 * 60 * 60 * 1000;
const SECONDS_IN_TRADING_DAY = 6.5 * 60 * 60;
const HIST_DEPTH = 5;
const Market = {
    OPEN_HR: 13,
    OPEN_MIN: 30,
    CLS_HR: 20
};
let expirations = [];
let basis = 0;
let cachedData = {};

const helpers = {
    CONSTS: {
        DEBUG,
        ONE_DAY,
        SECONDS_IN_TRADING_DAY,
        HIST_DEPTH,
        Market,
    },
    isDST: (date) => {
        if (!date) date = new Date();
        const month = date.getUTCMonth();
        if (month > 2 && month < 10) return true;
        if (month === 2 && date.getUTCDate() - 7 > date.getUTCDay()) return true;
        if (month === 10 && date.getUTCDate() <= date.getUTCDay()) return true;
        return false;
    },
    adjustMarketTimes: (date) => {
        const dst = optionChainSimulator.isDST(date);
        if (Market.OPEN_HR === 13 && !dst) {
            Market.OPEN_HR = 14;
        } else if (Market.OPEN_HR === 14 && dst) {
            Market.OPEN_HR = 13;
        } else return;
        Market.CLS_HR = Market.OPEN_HR + 7;
    },
    populateExpirations: (d, b, symbol) => {
        if (!/^[A-Z]{1,4}$/.test(symbol)) return;
        let today = new Date(+d);
        today.setHours(12, 0, 0, 0);
        const pad = (i, p) => ("0".repeat(p) + i).slice(-p);
        let expDate = new Date(+d);
        adjustMarketTimes(expDate);
        expDate.setUTCHours(Market.CLS_HR, 15, 0, 0);
        expirations = [];
        if (cachedData) cachedData[symbol] = {};
        basis = b;
        let dev = 25;
        if (basis < 10) dev = 1;
        else if (basis < 25) dev = 2.5;
        else if (basis < 200) dev = 5;
        else if (basis < 1000) dev = 10;
        let start = dev * Math.round((basis * 0.5) / dev),
            end = dev * Math.round((basis * 1.5) / dev);
        const cycle = symbol[0] < "I" ? 1 : symbol[0] < "R" ? 2 : 3;
        while (expDate.getDay() !== 5) expDate.setDate(expDate.getDate() + 1);
        while (expDate.getFullYear() - 4 < today.getFullYear()) {
            const date = expDate.getDate(),
                month = expDate.getMonth();
            const formattedFullDate =
                expDate.getFullYear() + pad(month + 1, 2) + pad(date + 1, 2); // use Saturday for symbol
            const expTime = expDate.getTime(),
                todayTime = today.getTime();
            if (expTime - todayTime <= 9 * ONE_DAY) {
                // weekly
                for (let i = start; i < end; i += dev) {
                    if (i <= 0) continue;
                    expirations.push(
                        symbol + "w" + formattedFullDate + "C" + pad(i, 8),
                        symbol + "w" + formattedFullDate + "P" + pad(i, 8)
                    );
                }
            }
            if (date > 14 && date < 22) {
                // monthly
                for (let i = start; i < end; i += dev) {
                    if (i <= 0) continue;
                    if (month > 0) {
                        // not a LEAP
                        if (expTime - todayTime > 240 * ONE_DAY) continue; // no more than 7 months out
                        if (expTime - todayTime > 65 * ONE_DAY && cycle != (month + 1) % 3)
                            continue; // out of cycle
                    }
                    expirations.push(
                        symbol + formattedFullDate + "C" + pad(i, 8),
                        symbol + formattedFullDate + "P" + pad(i, 8)
                    );
                }
            }
            expDate.setDate(expDate.getDate() + 7);
        }
    },
    generateRandomInstrumentValues: (type, factor) => {
        let values = [];
        const now = new Date();
        const symbolParser = new RegExp("[A-Zw]+([0-9]{8})(C|P)(.+)");
        for (let i = 0; i < expirations.length; i++) {
            let value = 0;
            let parts = symbolParser.exec(expirations[i]);
            const isWeekly = expirations[i].indexOf("w") > -1;
            if (parts && parts.length > 3) {
                const strike = parseFloat(parts[3]);
                const expDate = new Date(
                    parseInt(parts[1].slice(0, 4), 10),
                    parseInt(parts[1].slice(4, 6), 10) - 1,
                    parseInt(parts[1].slice(6, 8), 10) - 1,
                    0,
                    0,
                    0
                );
                const timeDiff = expDate.getTime() - now.getTime();
                const monthsOut = Math.ceil(timeDiff / (30 * ONE_DAY));
                const daysOut = Math.ceil(timeDiff / ONE_DAY);
                switch (type) {
                    case "strike":
                        value = strike;
                        break;
                    case "callorput":
                        value = parts[2];
                        break;
                    case "expiration":
                        value = expDate;
                        value.setMilliseconds(0);
                        break;
                    case "price":
                        value = Math.abs(
                            Math[parts[2] === "C" ? "max" : "min"](basis - strike, 0)
                        ); // intrinsic
                        value = value * (1 - daysOut / 1500); // time value
                        value += (Math.random() - 0.5) / 2;
                        value = parseFloat(Math.max(0.01, value).toFixed(2));
                        break;
                    case "volume":
                        value = Math.round(
                            (2 * Math.random() + 1) *
                            getWeight(strike, expDate, isWeekly, now, basis) *
                            factor *
                            100
                        );
                        break;
                    case "openinterest":
                        value = Math.round(
                            (2 * Math.random() + 1) *
                            getWeight(strike, expDate, isWeekly, now, basis) *
                            //factor *
                            100
                        );
                        value = Math.round(Math.pow(Math.max(0, value), 2) / 10);
                        break;
                }
            }
            values.push(value);
        }
        return values;
    },
    randomData: ({ DT }, factor = 0) => {
        cachedData = {};
        const formatTimeStamp = (dateTime) => {
            dateTime = new Date(dateTime); // make sure dateTime is a date object
            let currentTime = new Date();
            if (dateTime.toDateString() === currentTime.toDateString()) {
                // Set initial date times to between 1 and 10 minutes in the past
                let minutesInThePast = Math.floor(Math.random() * 10) + 1;
                dateTime = new Date(currentTime - minutesInThePast * 60 * 1000);
                dateTime.setSeconds(0);
            } else {
                // If the date is historical set it to UTC midnight (but 24 hours so that the date that
                // will be interpreted as today). The chart will omit the time when displaying timestamps
                // at UTC midnight.
                dateTime.setUTCHours(24, 0, 0, 0);
            }
            return dateTime;
        };
        return {
            strike: generateRandomInstrumentValues("strike"),
            callorput: generateRandomInstrumentValues("callorput"),
            expiration: generateRandomInstrumentValues("expiration"),
            price: generateRandomInstrumentValues("price"),
            vol: generateRandomInstrumentValues("volume", factor),
            oi: generateRandomInstrumentValues("openinterest"),
            updates: [...Array(expirations.length)].map(() => formatTimeStamp(DT))
        };
    },
    formatResponse: (
        { strike, callorput, expiration, price, vol, oi, updates } = {},
        symbol
    ) => {
        if (!cachedData) cachedData = {};
        cachedData[symbol] = {
            strike,
            callorput,
            expiration,
            price,
            vol,
            oi,
            updates
        };
        let response = {};
        for (let i = 0; i < expirations.length; i++) {
            let data = {
                strike: strike[i],
                callorput: callorput[i],
                expiration: expiration[i],
                bid: Math.max(0, price[i] - 2),
                price: price[i],
                ask: price[i] + 2,
                volume: vol[i],
                openinterest: oi[i]
            };
            let fields = Object.keys(data);
            for (let j = 0; j < fields.length; j++) {
                let field = fields[j];
                data[field] = { value: data[field], timeStamp: updates[i] };
            }
            response[expirations[i]] = data;
        }
        return response;
    },
    randomChain: (quote, symbol, factor) => {
        return formatResponse(randomData(quote, factor), symbol);
    },
    getWeight: (strike, expDate, isWeekly, now, basis) => {
        const timeDiff = expDate.getTime() - now.getTime();
        const daysOut = Math.ceil(timeDiff / ONE_DAY);
        return (
            (Math.max(0, 1 - daysOut / 1100) *
                Math.max(0, 1 - (2 * Math.abs(strike - basis)) / basis) +
                Math.min(1, daysOut / 1100) * 0.01) *
            (isWeekly ? 0.2 : 1)
        );
    },
    updateData: (symbol, basis) => {
        const now = new Date();
        let { strike, callorput, expiration, price, vol, oi, updates } =
            (cachedData && cachedData[symbol]) || {};
        if (!callorput) {
            return randomData(new Date());
        }
        const updateValue = (value, isVol, isOI) => {
            let up = isVol || !!Math.round(Math.random());
            let lower = value / 1000; // 0.1% change
            let upper = value / 100; // 1% change
            let change = Math.random() * upper + lower;
            if (!up) change = -change;
            if (isVol) change = Math.round(3 * Math.random() + 1);
            if (isOI) change = Math.round(3 * Math.random() - 0.3);
            return parseFloat(Math.max(0, value + change).toFixed(2));
        };
        for (let i = 0; i < expirations.length; i++) {
            const isWeekly = expirations[i].indexOf("w") > -1;
            if (
                300 * Math.random() <
                getWeight(strike[i], expiration[i], isWeekly, now, basis)
            ) {
                price[i] = updateValue(price[i]);
                vol[i] = Math.round(updateValue(vol[i], true));
                oi[i] = Math.round(updateValue(oi[i]), null, true);
                updates[i] = new Date(+now);
            }
        }
        return { strike, callorput, expiration, price, vol, oi, updates };
    },
    randomUpdate: (symbol, basis) => {
        return formatResponse(updateData(symbol, basis), symbol);
    },
    isMarketClosed: (date) => {
        if (!date) date = new Date();
        adjustMarketTimes(date);
        return (
            date.getUTCHours() >= Market.CLS_HR ||
            date.getUTCDay() % 6 === 0 ||
            isBeforeOpen(date)
        );
    },
    isBeforeOpen: (date) => {
        if (!date) date = new Date();
        adjustMarketTimes(date);
        return (
            date.getUTCDay() % 6 > 0 &&
            (date.getUTCHours() < Market.OPEN_HR ||
                (date.getUTCHours() === Market.OPEN_HR &&
                    date.getUTCMinutes() < Market.OPEN_MIN))
        );
    },
    getFractionOfInterval: ({ interval, period }, date, isHistorical) => {
        let elapsedOfDay = SECONDS_IN_TRADING_DAY;
        if (!isHistorical) {
            if (!date) date = new Date();
            const beginOfDay = new Date(+date);
            adjustMarketTimes(beginOfDay);
            beginOfDay.setUTCHours(Market.OPEN_HR, Market.OPEN_MIN, 0);
            if (isBeforeOpen(date)) elapsedOfDay = 0;
            if (!isMarketClosed(date)) {
                elapsedOfDay = (date.getTime() - beginOfDay.getTime()) / 1000;
            }
            if (elapsedOfDay <= 0) return 0;
        }
        if (elapsedOfDay === SECONDS_IN_TRADING_DAY)
            elapsedOfDay = elapsedOfDay - 0.1;
        if (interval === "month")
            return (
                (((date.getUTCDate() - 1) * 22) / 31 + elapsedOfDay) /
                (22 * SECONDS_IN_TRADING_DAY)
            );
        if (interval === "week")
            return (date.getDay() - 1 + elapsedOfDay) / (5 * SECONDS_IN_TRADING_DAY);
        if (interval === "day") return elapsedOfDay / SECONDS_IN_TRADING_DAY;
        if (interval === "minute")
            return (elapsedOfDay % (60 * period)) / SECONDS_IN_TRADING_DAY;
        if (interval === "second")
            return (elapsedOfDay % period) / SECONDS_IN_TRADING_DAY;
        return 0;
    },

    logTables: (newQuote) => {
        const volByStrike = {};
        const chainTable = {};
        for (let i in newQuote.optionChain) {
            const option = newQuote.optionChain[i];
            const key = option.callorput.value + option.strike.value;
            if (!volByStrike[option.strike.value])
                volByStrike[option.strike.value] = { callvolume: 0, putvolume: 0 };
            volByStrike[option.strike.value][
                option.callorput.value == "C" ? "callvolume" : "putvolume"
            ] += option.volume.value;
            let strExp = i.replace(/(.*[0-9]{8})[C|P](.*)/, "$1$2");
            if (!chainTable[strExp])
                chainTable[strExp] = {
                    callopeninterest: 0,
                    callvolume: 0,
                    callprice: 0,
                    strike: option.strike.value,
                    expiration: option.expiration.value,
                    putprice: 0,
                    putvolume: 0,
                    putopeninterest: 0
                };
            if (option.callorput.value == "C") {
                chainTable[strExp].callopeninterest += option.openinterest.value;
                chainTable[strExp].callvolume += option.volume.value;
                chainTable[strExp].callprice += option.price.value;
            } else {
                chainTable[strExp].putopeninterest += option.openinterest.value;
                chainTable[strExp].putvolume += option.volume.value;
                chainTable[strExp].putprice += option.price.value;
            }
        }
        console.table(volByStrike);
        console.table(chainTable);
    },
    isDaily: ({ interval }) => {
        return interval === "day" || interval === "week" || interval === "month";
    }
}

/*** End simulator functions.  Below code supplements regular quote feed with option chain ***/
const optionChainSimulator = {};
Object.assign(optionChainSimulator, quoteFeedSimulator, helpers);

const { isDaily, isBeforeOpen, isMarketClosed, adjustMarketTimes, randomUpdate, generateRandomInstrumentValues, formatResponse, randomData, getWeight } = helpers

optionChainSimulator.fetchInitialData = function (
    symbol,
    suggestedStartDate,
    suggestedEndDate,
    params,
    cb
) {
    function callback(obj) {
        if (obj.error) return cb(obj);
        const daily = isDaily(params);
        let quotesToPopulate = [];
        for (
            let i = 0;
            i < obj.quotes.length && quotesToPopulate.length < HIST_DEPTH;
            i++
        ) {
            const recentQuote = obj.quotes[obj.quotes.length - i - 1];
            if (daily || !isMarketClosed(recentQuote.DT))
                quotesToPopulate.push(recentQuote);
        }
        while (quotesToPopulate.length) {
            const quote = quotesToPopulate.pop();
            populateExpirations(quote.DT, quote.Close, symbol);
            const factor = getFractionOfInterval(
                params,
                null,
                quotesToPopulate.length > 0
            );
            if (factor) {
                quote.optionChain = randomChain(quote, symbol, factor);
                if (DEBUG && !quotesToPopulate.length) logTables(quote);
            }
        }
        cb(obj);
    }
    quoteFeedSimulator.fetchInitialData(
        symbol,
        suggestedStartDate,
        suggestedEndDate,
        params,
        callback
    );
};
optionChainSimulator.fetchUpdateData = function (
    symbol,
    startDate,
    params,
    cb
) {
    function callback(obj) {
        if (obj.error) return cb(obj);
        if (obj.quotes.length > 1) {
            obj.quotes[0].optionChain = formatResponse(cachedData[symbol]);
        }
        const newestQuote = obj.quotes[obj.quotes.length - 1];
        if (isMarketClosed(newestQuote.DT)) {
            // prevent intraday after hours data
            // and freeze daily post-market data until next day data appears
            if (
                isDaily(params) &&
                (!isBeforeOpen() ||
                    newestQuote.DT.getUTCDate() !== new Date().getUTCDate())
            ) {
                newestQuote.optionChain = formatResponse(cachedData[symbol]);
            }
        } else {
            if (obj.quotes.length > 1) {
                populateExpirations(newestQuote.DT, newestQuote.Close, symbol);
                newestQuote.optionChain = randomChain(newestQuote, symbol);
            } else if (getFractionOfInterval(params)) {
                newestQuote.optionChain = randomUpdate(symbol, newestQuote.Close);
            }
        }
        cb(obj);
    }
    quoteFeedSimulator.fetchUpdateData(symbol, startDate, params, callback);
};

export default optionChainSimulator;
