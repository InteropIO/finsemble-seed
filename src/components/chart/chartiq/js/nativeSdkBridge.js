// This file contains calls that allow a native iOS and Android application to interface the library
// without having to clutter either Swift/Objective C or Java source with unnecessary Javascript
var isAndroid = false;
var dayCss = 'ciq-day';
var nightCss = 'ciq-night';

function determineOs() {
	var userAgent = navigator.userAgent;

	if (/android/i.test(userAgent)) {
		isAndroid = true;
	} else {
		// Logging works automatically in Android native apps, so no proxyLogger necessary.
		proxyLogger();
	}
}

 /* Allow console logging in iOS */
function proxyLogger() {
	var originals = {
		log: console.log,
		warn: console.warn,
		error: console.error
	};

	console.log = function() {
		webkit.messageHandlers.logHandler.postMessage({"method": "LOG", "arguments": JSON.parse(JSON.stringify(arguments))});

		return originals.log.apply(this, arguments);
	};

	console.warn = function() {
		webkit.messageHandlers.logHandler.postMessage({"method": "WARN", "arguments": JSON.parse(JSON.stringify(arguments))});

		return originals.warn.apply(this, arguments);
	};

	console.error = function() {
		webkit.messageHandlers.logHandler.postMessage({"method": "ERROR", "arguments": JSON.parse(JSON.stringify(arguments))});

		return originals.error.apply(this, arguments);
	};
}


/* Quotefeed and data parsing functions*/
function nativeQuoteFeed(parameters, cb) {
	var id=CIQ.uniqueID();
	if (parameters.func === "pullInitialData") {
		quoteFeedCallbacks[id] = cb;

		if(isAndroid) {
			QuoteFeed.pullInitialData(parameters.symbol, parameters.period, parameters.timeUnit, parameters.start.toISOString(), parameters.end.toISOString(), parameters, id);
		} else {
	    	webkit.messageHandlers.pullInitialDataHandler.postMessage({"cb": id, "symbol": parameters.symbol, "startDate": parameters.start.toISOString(), "endDate": parameters.end.toISOString(), "interval": parameters.timeUnit, "period": parameters.period});
		}
	}

	if (parameters.func === "pullUpdate") {
		quoteFeedCallbacks[id] = cb;

		if(isAndroid) {
			QuoteFeed.pullUpdate(parameters.symbol, parameters.period, parameters.timeUnit, parameters.start.toISOString(), parameters, id);
		} else {
			webkit.messageHandlers.pullUpdateDataHandler.postMessage({"cb": id, "symbol": parameters.symbol, "startDate": parameters.start.toISOString(), "interval": parameters.timeUnit, "period": parameters.period});
		}
	}

	if (parameters.func === "pullPagination") {
		quoteFeedCallbacks[id] = cb;

		if(isAndroid) {
			QuoteFeed.pullPagination(parameters.symbol, parameters.period, parameters.timeUnit, parameters.start.toISOString(), parameters.end.toISOString(), parameters, id);
		} else {
			webkit.messageHandlers.pullPaginationDataHandler.postMessage({"cb": id, "symbol": parameters.symbol, "startDate": parameters.start.toISOString(), "endDate": parameters.end.toISOString(), "interval": parameters.timeUnit, "period": parameters.period});
		}
	}
}

function attachQuoteFeed(refreshInterval) {
	stxx.attachQuoteFeed(quoteFeedNativeBridge,{refreshInterval: refreshInterval});
}

function parseData(data, callbackId) {
	var feeddata=JSON.parse(data);
	var newQuotes=[];

	for(var i=0;i<feeddata.length;i++){
		newQuotes[i]={};
		newQuotes[i].DT=new Date(feeddata[i].DT);
		newQuotes[i].Open=feeddata[i].Open;
		newQuotes[i].High=feeddata[i].High;
		newQuotes[i].Low=feeddata[i].Low;
		newQuotes[i].Close=feeddata[i].Close;
		newQuotes[i].Volume=feeddata[i].Volume;
	}

	if(callbackId) {
		// pull method
		var quoteFeedCb = quoteFeedCallbacks[callbackId];
		quoteFeedCb({quotes:newQuotes, moreAvailable:true});
		delete quoteFeedCallbacks[callbackId];
	} else {
		// push method
		stxx.updateChartData(newQuotes);
	}
}

function getHudDetails() {
	var data = {};
	var tick=stxx.barFromPixel(stxx.cx);
	var prices=stxx.chart.xaxis[tick];

	if(prices!==null){
		if(prices.data){
			data.open = stxx.formatPrice(prices.data.Open);
			data.close = stxx.formatPrice(prices.data.Close);
			data.high = stxx.formatPrice(prices.data.High);
			data.low = stxx.formatPrice(prices.data.Low);
			data.volume = CIQ.condenseInt(prices.data.Volume);
		}
	}
	if(isAndroid) {
		return data;
	}

	return JSON.stringify(data);

}

/* Chart functions */
function setPeriodicity(period, interval, timeUnit) {
	var params = {
		period: period,
		interval: interval,
		timeUnit: timeUnit
	};

	stxx.setPeriodicity(params);
}

function callNewChart(symbol, data) {
	if(!symbol) symbol = stxx.chart.symbol;
	var loader = $$$("cq-loader");
	if(loader) loader.show();

	var cb = function(){
		stxx.dataSegmentLength = stxx.chart.dataSegment.length;
		if(loader) loader.hide();
	};

	if(!isAndroid) {
		cb = function() {
			stxx.dataSegmentLength = stxx.chart.dataSegment.length;
			if(loader) loader.hide();
			webkit.messageHandlers.newSymbolCallbackHandler.postMessage(symbol);
		};
	}
	stxx.newChart(symbol, data, null, cb);
}

function setChartType(chartType) {
	stxx.layout.aggregationType = "";
	stxx.setChartType(chartType);
}

function setAggregationType(aggregationType) {
	stxx.layout.aggregationType = aggregationType;
	stxx.setChartType("candle");
}

function getSymbol() {
	return stxx.chart.symbol;
}

function enableCrosshairs(active) {
	stxx.layout.crosshair = active;
}

function getCurrentVectorParameters() {
	return stxx.currentVectorParameters;
}

function setCurrentVectorParameters(parameter, value) {
	stxx.currentVectorParameters[parameter] = value;
}

function addSeries(symbol, hexColor, isComparison) {
	var parameters = {
		color: hexColor,
		isComparison: isComparison
	};

	stxx.addSeries(symbol, parameters);
}

function removeSeries(symbol) {
	stxx.removeSeries(symbol);
}

/* valid values: day, night, none */
function setTheme(theme) {
	var context = $('cq-context');

	if(theme.toLowerCase() === 'day') {
		context.removeClass(nightCss);
		context.addClass(dayCss);
	} else if(theme.toLowerCase() === 'night') {
		context.removeClass(dayCss);
		context.addClass(nightCss);
	} else if(theme.toLowerCase() === 'none') {
		context.removeClass(nightCss);
		context.removeClass(dayCss);
	} else {
		return;
	}

	stxx.chart.container.style.backgroundColor="";
	stxx.styles={};
	stxx.draw();
}

/* Study functions */
function addStudy(studyName, inputs, outputs) {
	CIQ.Studies.addStudy(stxx, studyName, inputs, outputs);
}

function removeStudy(studyName) {
	var studyList=stxx.layout.studies;
	for(var study in studyList) {
		var sd=studyList[study];
		if (sd.name === studyName) {
			CIQ.Studies.removeStudy(stxx,sd);
		}
	}
}

function removeAllStudies() {
	var studyList=stxx.layout.studies;
	for(var study in studyList) {
		var sd=studyList[study];
		CIQ.Studies.removeStudy(stxx,sd);
	}
}

function getStudyList() {
	var result = [];

	for(var key in CIQ.Studies.studyLibrary) {
		CIQ.Studies.studyLibrary[key].shortName = key;
		result.push(CIQ.Studies.studyLibrary[key]);
	}

	return result;
}

function getActiveStudies() {
	var result = [];

	for(var key in stxx.layout.studies) {
		stxx.layout.studies[key].shortName = key;
		result.push(stxx.layout.studies[key]);
	}

	if(isAndroid) {
		return result;
	}

	var seen = [];
	return JSON.stringify(result, function(key, val) {
		if (val !== null && typeof val === "object") {
			if (seen.indexOf(val) >= 0) {
				return;
			}
			seen.push(val);
		}
		return val;
	});
}

// temporary iOS helper function
function getAddedStudies() {
	var list = [];
	var s=stxx.layout.studies;
	var seen1 = [];
	var seen2 = [];

	function isUnique(arr){
		return function(key, value){
			if (typeof value === 'object' && value !== null) {
				if (arr.indexOf(value) !== -1) {
					// Circular reference found, discard key
					return;
				}
				// Store value in our collection
				arr.push(value);
			}
			return value;
		};
	}

	for(var n in s) {
		var sd=s[n];
		var inputs = JSON.stringify(sd.inputs, isUnique(seen1));
		var outputs = JSON.stringify(sd.outputs, isUnique(seen2));
		list.push(sd.name + "___" + inputs + "___" + JSON.stringify(outputs));
	}

	var joinedList = list.join("|||");
	return joinedList;
}

function setStudy(name, key, value) {
	var s=stxx.layout.studies;
	var selectedSd = {};
	for(var n in s){
		var sd=s[n];
		if (sd.name === name) { selectedSd = sd; }
	}

	var helper = new CIQ.Studies.DialogHelper({sd:selectedSd,stx:stxx});
	var isFound = false;
	var newInputParameters = {};
	var newOutputParameters = {};

	for (var x in helper.inputs) {
		var input = helper.inputs[x];
		if (input.name === key) {
			isFound = true;
			if (input.type === "text" || input.type === "select") {
				newInputParameters[key] = value;
			} else if (input.type === "number") {
				newInputParameters[key] = parseInt(value);
			} else if (input.type === "checkbox") {
				newInputParameters[parameter] = (value == "false" ? false : true);
			}
		}
	}
	if (isFound === false) {
		for (x in helper.outputs) {
			var output = helper.outputs[x];
			if (output.name === key) {
				newOutputParameters[key] = value;
			}
		}
	}
	isFound = false;
	helper.updateStudy({inputs:newInputParameters, outputs:newOutputParameters});
}

/* returns default parameters if the study is not present, or actual parameters for an existing study */
function getStudyParameters(studyName, isInput) {
	var params = {stx:stxx};
	if( stxx.layout.studies && stxx.layout.studies[studyName] ) params.sd=stxx.layout.studies[studyName];
	else params.name = studyName;
	var helper = new CIQ.Studies.DialogHelper(params);
	var parameters = helper.outputs;

	if(isInput) {
		parameters = helper.inputs;
	}

	if(isAndroid) {
		return parameters;
	}

	return JSON.stringify(parameters);
}

function setStudyParameter(studyName, key, value, isInput) {
	var helper = new CIQ.Studies.DialogHelper({sd:stxx.layout.studies[studyName], stx:stxx});

	if(isInput) {
		helper.updateStudy({inputs:{
			key: value
		}, outputs:{}});
	} else {
		helper.updateStudy({inputs:{}, outputs:{
			key: value
		}});
	}
}

/* Chart event listeners */
function addDrawingListener() {
	stxx.addEventListener("drawing", function(drawingObject){
		var s = drawingObject.drawings;
		var drawings = [];

		for(var n in s) {
			var drawing=s[n];
			drawings.push(drawing.serialize());
		}

		if(!isAndroid) {
			webkit.messageHandlers.drawingHandler.postMessage(JSON.stringify(drawings));
		}
	});
}

function addLayoutListener() {
	stxx.addEventListener("layout", function(layoutObject) {
		if(!isAndroid) {
			var seen = [];
			webkit.messageHandlers.layoutHandler.postMessage(JSON.stringify(layoutObject.layout, function(key, val){
				if (val !== null && typeof val == "object") {
					if (seen.indexOf(val) >= 0) {
						return;
					}
					seen.push(val);
				}
				return val;
			}));
		}
	});
}
