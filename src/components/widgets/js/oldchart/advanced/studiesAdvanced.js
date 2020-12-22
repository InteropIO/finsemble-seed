(function (definition) {
	"use strict";

	if (typeof exports === "object" && typeof module === "object") {
		module.exports = definition( require('../studies') );
	} else if (typeof define === "function" && define.amd) {
		define(["studies"], definition);
	} else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition(global);
	} else {
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for studiesAdvanced.js.");
	}
})(function(_exports){
	console.log("studiesAdvanced.js",_exports);
	var CIQ=_exports.CIQ;

	/**
	 * Calculate function for correlation coefficient
	 * @param  {CIQ.ChartEngine} stx Chart object
	 * @param  {object} sd  Study Descriptor
	 * @memberOf CIQ.Studies
	 * @version ChartIQ Advanced Package
	 */
	CIQ.Studies.calculateCorrelationCoefficient=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var period=sd.days;
		//var base=stx.chart.symbol;
		sd.compare=sd.inputs["Compare To"];
		if(!sd.compare){
			sd.compare=[];
			sd.outputs={};
			sd.outputMap={};
			for(var s in stx.chart.series){
				var series=stx.chart.series[s];
				//if(series.parameters.isComparison) {
					sd.compare.push(series.display);
					sd.outputs["Result " + series.display]=series.parameters.color;
					sd.outputMap["Result " + series.display + " " +sd.name]="Result " + series.display;
				//}	
			}
		}
		for(var sym=0;sym<sd.compare.length;sym++){
			var sB=0;
			var sC=0;
			var sB2=0;
			var sC2=0;
			var sBC=0;
			var thisCompare=sd.compare[sym];
			for(var i=0;i<quotes.length-1;i++){  //last tick has no compare data
				if(!quotes[i]) continue;
				var comparisonQuote=quotes[i][thisCompare];
				if(!comparisonQuote) {
					if(i>0 && quotes[i-1] && quotes[i-1]._.c) comparisonQuote=quotes[i-1]._.c;
					else comparisonQuote=0;
				}
				quotes[i]._={};
				sB+=quotes[i]._.b=quotes[i].Close;
				sC+=quotes[i]._.c=comparisonQuote;
				sB2+=quotes[i]._.b2=Math.pow(quotes[i].Close,2);
				sC2+=quotes[i]._.c2=Math.pow(comparisonQuote,2);
				sBC+=quotes[i]._.bc=quotes[i].Close*comparisonQuote;
				if(i>=period){
					sB-=quotes[i-period]._.b;
					sC-=quotes[i-period]._.c;
					sB2-=quotes[i-period]._.b2;
					sC2-=quotes[i-period]._.c2;
					sBC-=quotes[i-period]._.bc;
					quotes[i-period]._=null;

					var vb=sB2/period-Math.pow(sB/period,2);
					var vc=sC2/period-Math.pow(sC/period,2);
					var cv=sBC/period-sB*sC/Math.pow(period,2);
					var cc=cv/Math.sqrt(vb*vc);
					quotes[i]["Result " + thisCompare + " " + sd.name] = cc;
				}
			}
			for(var j=quotes.length-period;j<quotes.length;j++){
				delete quotes[j]._;
			}
		}
	};
	
	CIQ.Studies.displayCorrelationCoefficient=function(stx, sd, quotes){
		if(!sd.compare.length) {
			stx.watermark(sd.panel,"center","bottom",stx.translateIf("Correlation Coefficient requires at least one comparison symbol"));
			return;
		}
		CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);
	};

	CIQ.Studies.prettify=CIQ.extend({
		"double exponential":"dema",
		"triple exponential":"tema"
	},CIQ.Studies.prettify);

	var basicMovingAverageHelper=CIQ.Studies.movingAverageHelper;
	CIQ.Studies.movingAverageHelper=function(stx,input){
		var conversions={
			"hma":"hull",
			"dema":"double exponential",
			"tema":"triple exponential"
		};
		if(input=="options") {
			var basics=basicMovingAverageHelper(stx,"options");
			var advanceds={};
			for(var b in basics){
				advanceds[b]=basics[b];
				if(b=="exponential") {
					advanceds["double exponential"]=stx.translateIf("Double Exponential");
					advanceds["triple exponential"]=stx.translateIf("Triple Exponential");
					advanceds.hull=stx.translateIf("Hull");
				}
			}
			return advanceds;
		}
		else conversion=conversions[input];
		if(!conversion) conversion=basicMovingAverageHelper(stx,input);
		return conversion;
	};

	var calculateMovingAverage=CIQ.Studies.calculateMovingAverage;
	CIQ.Studies.calculateMovingAverage=function(stx, sd){
		if(!sd.chart.scrubbed) return;
		var type=sd.inputs.Type;
		var typeMap = {
			"hma": "Hull", "hull": "Hull",
			"dema": "DoubleExponential", "double exponential": "DoubleExponential",
			"tema": "TripleExponential", "triple exponential": "TripleExponential"
		};
		if (type in typeMap) return CIQ.Studies["calculateMovingAverage" + typeMap[type]](stx, sd);
		else return calculateMovingAverage(stx, sd);
	};
	CIQ.Studies.studyLibrary.ma.calculateFN=CIQ.Studies.calculateMovingAverage;

	CIQ.Studies.calculateMovingAverageHull=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(sd.days<0) sd.days=1;

		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";	// Handle when the default inputs are passed in

		CIQ.Studies.MA("wma", sd.days, field, 0, "WMA1", stx, sd);
		CIQ.Studies.MA("wma", Math.ceil(sd.days/2), field, 0, "WMA2", stx, sd);
		for(var i=0;i<quotes.length;i++){
			var quote=quotes[i];
			quote["MMA "+sd.name]=2*quote["WMA2 "+sd.name]-quote["WMA1 "+sd.name];
		}

		var offset=parseInt(sd.inputs.Offset,10);
		if(isNaN(offset)) offset=0;

		CIQ.Studies.MA("wma", Math.sqrt(sd.days), "MMA "+sd.name, offset, "MA", stx, sd);
	};

	CIQ.Studies.calculateMovingAverageDoubleExponential=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(sd.days<0) sd.days=1;

		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";	// Handle when the default inputs are passed in

		CIQ.Studies.MA("ema", sd.days, field, 0, "EMA1", stx, sd);
		CIQ.Studies.MA("ema", sd.days, "EMA1 "+sd.name, 0, "EMA2", stx, sd);

		var offset=parseInt(sd.inputs.Offset,10);
		if(isNaN(offset)) offset=0;
		for(var i=0;i<quotes.length;i++){
			var quote=quotes[i];
			if(quotes[i+offset]) quotes[i+offset]["MA "+sd.name]=2*quote["EMA1 "+sd.name]-quote["EMA2 "+sd.name];
		}
	};

	CIQ.Studies.calculateMovingAverageTripleExponential=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(sd.days<0) sd.days=1;

		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";	// Handle when the default inputs are passed in

		CIQ.Studies.MA("ema", sd.days, field, 0, "EMA1", stx, sd);
		CIQ.Studies.MA("ema", sd.days, "EMA1 "+sd.name, 0, "EMA2", stx, sd);
		CIQ.Studies.MA("ema", sd.days, "EMA2 "+sd.name, 0, "EMA3", stx, sd);

		var offset=parseInt(sd.inputs.Offset,10);
		if(isNaN(offset)) offset=0;
		for(var i=0;i<quotes.length;i++){
			var quote=quotes[i];
			if(quotes[i+offset]) quotes[i+offset]["MA "+sd.name]=3*quote["EMA1 "+sd.name]-3*quote["EMA2 "+sd.name]+quote["EMA3 "+sd.name];
		}
	};

	CIQ.Studies.calculateATRBands=function(stx, sd){
		CIQ.Studies.calculateStudyATR(stx,sd);
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";
		CIQ.Studies.calculateGenericEnvelope(stx, sd, sd.inputs.Shift, field, "ATR " + sd.name);
	};

	CIQ.Studies.calculateSTARCBands=function(stx, sd){
		CIQ.Studies.calculateStudyATR(stx,sd);
		CIQ.Studies.MA("simple", sd.inputs["MA Period"], "Close", 0, "MA", stx, sd);
		CIQ.Studies.calculateGenericEnvelope(stx, sd, sd.inputs.Multiplier, "MA "+sd.name, "ATR " + sd.name);
	};

	CIQ.Studies.calculateATRStops=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(!quotes) return;
		CIQ.Studies.calculateStudyATR(stx,sd);
		var useHighLow=sd.inputs.HighLow;
	    for(var i=1;i<quotes.length-1;i++){
			var prices=quotes[i];
			var pd=quotes[i-1];
			var prev=prices["Buy Stops " + sd.name];
			if(!prev) prev=prices["Sell Stops " + sd.name];
			if(!prev) prev=0;
			if(!prices || !pd) continue;
			var base=prices.Close;
			var result=base;
	        var offset=prices["ATR " + sd.name]*sd.inputs.Multiplier;
			if(prices.Close>prev && pd.Close>prev){
				if(useHighLow) base=prices.High;
				result=Math.max(prev,base-offset);
			}else if(prices.Close<=prev && pd.Close<=prev){
				if(useHighLow) base=prices.Low;
				result=Math.min(prev,base+offset);
			}else if(prices.Close>prev){
				if(useHighLow) base=prices.High;
				result=base-offset;
			}else if(prices.Close<=prev){
				if(useHighLow) base=prices.Low;
				result=base+offset;
			}
			if(base<=result){
				quotes[i+1]["Buy Stops " + sd.name]=result;
				delete quotes[i+1]["Sell Stops " + sd.name];
			}else if(base>result){
				quotes[i+1]["Sell Stops " + sd.name]=result;
				delete quotes[i+1]["Buy Stops " + sd.name];
			}
			quotes[i+1]["All Stops " + sd.name]=result;
			sd.referenceOutput="All Stops";  //so PSAR2 can draw a square wave
		}
	};

	CIQ.Studies.calculateAwesomeOscillator=function(stx, sd){
		var quotes=sd.chart.scrubbed;

		CIQ.Studies.MA("simple", 5, "hl/2", 0, "MA5", stx, sd);
		CIQ.Studies.MA("simple", 34, "hl/2", 0, "MA34", stx, sd);

		for(var i=33;i<quotes.length;i++){
			if(!quotes[i]) continue;
			quotes[i][sd.name + "_hist"]=quotes[i]["MA5 " + sd.name] - quotes[i]["MA34 " + sd.name];
		}
	};

	CIQ.Studies.calculateRelativeVolatility=function(stx, sd){
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";
		sd.days=sd.inputs["Smoothing Period"];
		var quotes=sd.chart.scrubbed;
		function computeRVI(avgGain, avgLoss){
			if(avgGain+avgLoss===0) return 100;
			return 100*avgGain/(avgGain+avgLoss);
		}
		sd.std=new CIQ.Studies.StudyDescriptor(sd.name, "sdev", sd.panel);
		sd.std.chart=sd.chart;
		sd.std.days=sd.inputs["STD Period"];
		sd.std.inputs={"Field":field, "Standard Deviations":1, "Type":"ma"};
		sd.std.outputs={"STD":null};
		CIQ.Studies.calculateStandardDeviation(stx,sd.std);

		var avgGain=0;
		var avgLoss=0;
		for(var i=sd.days;i<quotes.length;i++){
			var quote=quotes[i];
			if(quote[field]>quotes[i-1][field]){
				avgGain=((avgGain*(sd.days-1))+quote["STD "+sd.name])/sd.days;
				avgLoss=avgLoss*(sd.days-1)/sd.days;
			}else{
				avgLoss=((avgLoss*(sd.days-1))+quote["STD "+sd.name])/sd.days;
				avgGain=avgGain*(sd.days-1)/sd.days;
			}
			quote["Rel Vol " + sd.name]=computeRVI(avgGain, avgLoss);
		}
		sd.zoneOutput="Rel Vol";
	};

	CIQ.Studies.calculatePMO=function(stx, sd){
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";

		var quotes=sd.chart.scrubbed;
	    var i;
	    for(i=0;i<quotes.length;i++){
	    	if(!quotes[i]) continue;
	    	if(!quotes[i-1]) continue;
	    	var denom=quotes[i-1][field];
	    	if( denom ){
	    		quotes[i]["ROCx10 "+sd.name]=1000*((quotes[i][field]/denom)-1);
	    	}
	    }
	    CIQ.Studies.MA("exponential", sd.inputs["Smoothing Period"]-1, "ROCx10 "+sd.name, 0, "EMAx10", stx, sd);
	    CIQ.Studies.MA("exponential", sd.inputs["Double Smoothing Period"]-1, "EMAx10 "+sd.name, 0, "PMO", stx, sd);
	    CIQ.Studies.MA("exponential", sd.inputs["Signal Period"], "PMO "+sd.name, 0, "PMOSignal", stx, sd);
	    sd.zoneOutput="PMO";
	};

	CIQ.Studies.calculateElderImpulse=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var bull=sd.outputs.Bullish;
		var bear=sd.outputs.Bearish;
		var neutral=sd.outputs.Neutral;

		CIQ.Studies.MA("exponential", 13, "Close", 0, "MA", stx, sd);
		sd.macd=new CIQ.Studies.StudyDescriptor(sd.name, "macd", sd.panel);
		sd.macd.chart=sd.chart;
		sd.macd.days=sd.days;
		sd.macd.inputs={"Fast MA Period":12,"Slow MA Period":26,"Signal Period":9};
		sd.macd.outputs={"MACD":null, "Signal":null};
		CIQ.Studies.calculateMACD(stx,sd.macd);

		for(i=0;i<quotes.length;i++){
			if(i===0) color=neutral;
			else if(quotes[i]["MA "+sd.name]>quotes[i-1]["MA "+sd.name] &&
					quotes[i][sd.name+"_hist"]>quotes[i-1][sd.name+"_hist"]) color=bull;
			else if(quotes[i]["MA "+sd.name]<quotes[i-1]["MA "+sd.name] &&
					quotes[i][sd.name+"_hist"]<quotes[i-1][sd.name+"_hist"]) color=bear;
			else color=neutral;
		    quotes[i]["Result "+sd.name]=color;
		    if(i) quotes[i-1][sd.name+"_hist"]=null;
	    }
	};

	CIQ.Studies.calculatePivotPoints=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var period="day";
		if(stx.layout.interval=="day") period="month";
		else if(stx.isDailyInterval(stx.layout.interval)) period="year";
		else if(stx.layout.interval=="second" ||
				stx.layout.interval=="millisecond" ||
				stx.layout.timeUnit=="second" ||
				stx.layout.timeUnit=="millisecond") period="15min";
		else{
			var interval=stx.layout.periodicity;
			if(stx.layout.interval!="minute"){
				interval*=stx.layout.interval;
			}
			if(interval>=30) period="week";
		}

		var isForex=CIQ.Market.Symbology.isForexSymbol(stx.chart.symbol);
		var isMetal=CIQ.Market.Symbology.isForexMetal(stx.chart.symbol);
		var marketOffset=null;

		function getMarketOffset(localQuoteDate){
	    	var marketZone="America/New_York";
	    	if(!isForex){
	    		if(stx.chart.market){
	    			marketZone=stx.chart.market.market_tz;
	    		}else{
					//get the exchange from the symbol (whatever is after the period)
			    	var foreignExchange=CIQ.Market.Symbology.isForeignSymbol(stx.chart.symbol) && stx.chart.symbol.split(".").pop();
			    	if(CIQ && CIQ.realTimeDataSource){
		    			marketZone=new CIQ.QuoteFeed[CIQ.realTimeDataSource]().exchangeZones[foreignExchange];
		    		}else{
		    			marketZone=CIQ.QuoteFeed.Xignite.Utility.timeZone[foreignExchange];
		    		}
	    		}
	    	}
	    	var dt=new Date(localQuoteDate.getTime() + localQuoteDate.getTimezoneOffset() * 60000);
	    	if(!marketZone || marketZone.indexOf("UTC")==-1)
	    		dt=CIQ.convertTimeZone(dt,"UTC",marketZone);

			return new Date(dt.getFullYear(),dt.getMonth(),dt.getDate(),dt.getHours(),dt.getMinutes(),dt.getSeconds(),dt.getMilliseconds()).getTime()-localQuoteDate.getTime();
	    }
	    var pivotPoint=0;
	    var high=0;
	    var low=0;
	    var prevHigh=0;
	    var prevLow=0;
	    var hlSpread=0;
	    function resetPivots(){
    		pivotPoint=(high+low+quotes[i-1].Close)/3;
    		prevHigh=high;
    		prevLow=low;
    		hlSpread=high-low;
    		high=low=0;
	    }
	    for(var i=1;i<quotes.length;i++){
	    	if(!quotes[i-1]) continue;
	    	high=Math.max(high,quotes[i-1].High);
	    	low=Math.min(low>0?low:quotes[i-1].Low,quotes[i-1].Low);
	    	if(sd.inputs.Continuous) resetPivots();
	    	else if(period=="year" && quotes[i].DT.getYear()!=quotes[i-1].DT.getYear()){
	    		//new yearly period
	    		resetPivots();
	    	}else if(period=="month" && quotes[i].DT.getMonth()!=quotes[i-1].DT.getMonth()){
	    		//new monthly period
	    		resetPivots();
	    	}else if(period=="week" && quotes[i].DT.getDay()<quotes[i-1].DT.getDay()){
	    		//new weekly period
	    		resetPivots();
	    	}else if(period=="day"){
	    		if(marketOffset===null){
	    			//possible new daily period
	    			marketOffset=getMarketOffset(quotes[i].DT);
		    		if(isForex){
		    			//Forex beginning of day is 17:00 NY Time, so add 7 hours of msecs (6 for metals) to make it fall on a date boundary
		    			if(isMetal) marketOffset+=6*60*60*1000;
		    			else marketOffset+=7*60*60*1000;
		    		}
	    		}
	    		var newDate=new Date(new Date(quotes[i].DT).setMilliseconds(quotes[i].DT.getMilliseconds()+marketOffset));
	    		var oldDate=new Date(new Date(quotes[i-1].DT).setMilliseconds(quotes[i-1].DT.getMilliseconds()+marketOffset));
	    		if(oldDate.getDate()!=newDate.getDate() && newDate.getDay()!==0 && newDate.getDay()!=6){
		    		//new daily period
		    		marketOffset=null;
		    		resetPivots();
		    	}
	    	}else if(period=="15min" &&
	    			(quotes[i].DT.getHours()!=quotes[i-1].DT.getHours() || Math.floor(quotes[i].DT.getMinutes()/15)!=Math.floor(quotes[i-1].DT.getMinutes()/15))){
	    		//new 15 minute period
	    		resetPivots();
	    	}
        	quotes[i]["Pivot " + sd.name]=pivotPoint;
        	if(sd.inputs.Type.toLowerCase()=="fibonacci"){
	        	quotes[i]["Resistance 1 " + sd.name]=pivotPoint+0.382*hlSpread;
	        	quotes[i]["Resistance 2 " + sd.name]=pivotPoint+0.618*hlSpread;
	        	quotes[i]["Resistance 3 " + sd.name]=pivotPoint+hlSpread;
	        	quotes[i]["Support 1 " + sd.name]=pivotPoint-0.382*hlSpread;
	        	quotes[i]["Support 2 " + sd.name]=pivotPoint-0.618*hlSpread;
	        	quotes[i]["Support 3 " + sd.name]=pivotPoint-hlSpread;
        	}else{
	        	quotes[i]["Resistance 1 " + sd.name]=2*pivotPoint-prevLow;
	        	quotes[i]["Resistance 2 " + sd.name]=pivotPoint+hlSpread;
	        	quotes[i]["Resistance 3 " + sd.name]=pivotPoint+2*hlSpread;
	        	quotes[i]["Support 1 " + sd.name]=2*pivotPoint-prevHigh;
	        	quotes[i]["Support 2 " + sd.name]=pivotPoint-hlSpread;
	        	quotes[i]["Support 3 " + sd.name]=pivotPoint-2*hlSpread;
        	}
	    }
	};

	CIQ.Studies.calculateVWAP=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		sd.error=null;
		if(CIQ.ChartEngine.isDailyInterval(stx.layout.interval)){
			sd.error="VWAP is Intraday Only";
			return;
		}
		var isForex=CIQ.Market.Symbology.isForexSymbol(stx.chart.symbol);
		var isMetal=CIQ.Market.Symbology.isForexMetal(stx.chart.symbol);
		var marketOffset=null;
	    var volume=0;
	    var volume_price=0;
	    var hasThereBeenVolume=false;
		function getMarketOffset(localQuoteDate){
	    	var marketZone="America/New_York";
	    	if(!isForex){
	    		if(stx.chart.market){
	    			marketZone=stx.chart.market.market_tz;
	    		}else{
					//get the exchange from the symbol (whatever is after the period)
			    	var foreignExchange=CIQ.Market.Symbology.isForeignSymbol(stx.chart.symbol) && stx.chart.symbol.split(".").pop();
			    	if(CIQ && CIQ.realTimeDataSource){
		    			marketZone=new CIQ.QuoteFeed[CIQ.realTimeDataSource]().exchangeZones[foreignExchange];
		    		}else{
		    			marketZone=CIQ.QuoteFeed.Xignite.Utility.timeZone[foreignExchange];
		    		}
	    		}
	    	}
	    	var dt=new Date(localQuoteDate.getTime() + localQuoteDate.getTimezoneOffset() * 60000);
	    	if(!marketZone || marketZone.indexOf("UTC")==-1)
	    		dt=CIQ.convertTimeZone(dt,"UTC",marketZone);

			return new Date(dt.getFullYear(),dt.getMonth(),dt.getDate(),dt.getHours(),dt.getMinutes(),dt.getSeconds(),dt.getMilliseconds()).getTime()-localQuoteDate.getTime();
	    }
	    for(var i=0;i<quotes.length;i++){
    		if(marketOffset===null){
    			//possible new daily period
    			marketOffset=getMarketOffset(quotes[i].DT);
	    		if(isForex){
	    			//Forex beginning of day is 17:00 NY Time, so add 7 hours of msecs (6 for metals) to make it fall on a date boundary
	    			if(isMetal) marketOffset+=6*60*60*1000;
	    			else marketOffset+=7*60*60*1000;
	    		}
    		}
    		if(quotes[i-1] && quotes[i-1].DT){
    			var newDate=new Date(new Date(quotes[i].DT).setMilliseconds(quotes[i].DT.getMilliseconds()+marketOffset));
    			var oldDate=new Date(new Date(quotes[i-1].DT).setMilliseconds(quotes[i-1].DT.getMilliseconds()+marketOffset));
    			if(oldDate.getDate()!=newDate.getDate() && newDate.getDay()!==0 && newDate.getDay()!=6){
    				//new daily period
		    		marketOffset=null;
		    		volume=volume_price=0;
    			}
    		}
	    	typicalPrice=(quotes[i].Close+quotes[i].High+quotes[i].Low)/3;
	    	volume+=quotes[i].Volume;
	    	volume_price+=quotes[i].Volume*typicalPrice;
	    	if(!volume) continue;
	    	quotes[i]["VWAP "+sd.name]=volume_price/volume;
	    	hasThereBeenVolume=true;
	    }
		if(!hasThereBeenVolume){
			sd.error="VWAP Requires Volume";
		}
	};

	CIQ.Studies.calculateMFI=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var high=0;
		var i;
		for(i=0;i<quotes.length;i++){
	    	if(!quotes[i]) continue;
	    	if(quotes[i].Volume) {
	    		quotes[i][sd.name + "_hist"]=(quotes[i].High-quotes[i].Low)/quotes[i].Volume;
	    		high=Math.max(high,quotes[i][sd.name + "_hist"]);
	    	}
	    }
		var range=1;
		if(high>0){
			while(high*range<1) {
				range*=10;
			}
		}
		for(i=0;i<quotes.length;i++){
	    	if(!quotes[i]) continue;
	    	quotes[i][sd.name + "_hist"]*=range;
	    }
	};

	CIQ.Studies.calculateAlligator=function(stx, sd){
		var quotes=sd.chart.scrubbed;

		CIQ.Studies.MA("welles wilder", Number(sd.inputs["Jaw Period"]), "hl/2", sd.inputs["Jaw Offset"], "Jaw", stx, sd);
		CIQ.Studies.MA("welles wilder", Number(sd.inputs["Teeth Period"]), "hl/2", sd.inputs["Teeth Offset"], "Teeth", stx, sd);
		CIQ.Studies.MA("welles wilder", Number(sd.inputs["Lips Period"]), "hl/2", sd.inputs["Lips Offset"], "Lips", stx, sd);

		for(var i=0;i<quotes.length;i++){
			if(!quotes[i]) continue;
			if(sd.type=="Gator"){
				quotes[i][sd.name + "_hist1"]=Math.abs(quotes[i]["Jaw " + sd.name] - quotes[i]["Teeth " + sd.name]);
				quotes[i][sd.name + "_hist2"]=-Math.abs(quotes[i]["Teeth " + sd.name] - quotes[i]["Lips " + sd.name]);
			}
			if(sd.inputs["Show Fractals"]){
				if(!quotes[i-2] || !quotes[i-1] || !quotes[i] || !quotes[i+1] || !quotes[i+2]) continue;
				if(quotes[i-2].High && quotes[i-1].High && quotes[i].High && quotes[i+1].High && quotes[i+2].High){
					if(quotes[i].High>quotes[i-1].High && quotes[i].High>quotes[i-2].High &&
						quotes[i].High>quotes[i+1].High && quotes[i].High>quotes[i+2].High){
						quotes[i]["Fractal High "+sd.name]=1;
					}
				}
				if(quotes[i-2].Low && quotes[i-1].Low && quotes[i].Low && quotes[i+1].Low && quotes[i+2].Low){
					if(quotes[i].Low<quotes[i-1].Low && quotes[i].Low<quotes[i-2].Low &&
						quotes[i].Low<quotes[i+1].Low && quotes[i].Low<quotes[i+2].Low){
						quotes[i]["Fractal Low "+sd.name]=1;
					}
				}
			}
		}

	};

	CIQ.Studies.calculateRelativeVigor=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var i;
		for(i=0;i<quotes.length;i++){
			if(!quotes[i]) continue;
			quotes[i]["Change " + sd.name]=quotes[i].Close-quotes[i].Open;
			quotes[i]["Range " + sd.name]=quotes[i].High-quotes[i].Low;
		}

		CIQ.Studies.MA("triangular", 4, "Change "+sd.name, 0, "Numer", stx, sd);
		CIQ.Studies.MA("triangular", 4, "Range "+sd.name, 0, "Denom", stx, sd);

		var nums=[];
		var dens=[];
		for(i=0;i<quotes.length;i++){
			if(!quotes[i]) continue;
			nums.push(quotes[i]["Numer "+sd.name]);
			dens.push(quotes[i]["Denom "+sd.name]);
			if(nums.length>sd.days){
				nums.shift();
				dens.shift();
			}
			var sumNum=0;
			var sumDen=0;
			var it;
			for(it=0;it<nums.length;it++){sumNum+=nums[it];}
			for(it=0;it<dens.length;it++){sumDen+=dens[it];}
			if(sumDen===0) sumDen=0.00000001;
			quotes[i]["Rel Vig "+sd.name]=sumNum/sumDen;
		}

		CIQ.Studies.MA("triangular", 4, "Rel Vig "+sd.name, 0, "RelVigSignal", stx, sd);

		for(i=0;i<quotes.length;i++){
			if(!quotes[i]) continue;
			quotes[i][sd.name+"_hist"]=quotes[i]["Rel Vig "+sd.name]-quotes[i]["RelVigSignal "+sd.name];
		}
	};

	CIQ.Studies.calculateUlcerIndex=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";

		function getHV(p,x,f){
			var h=null;
			for(var j=x-p+1;j<=x;j++){
				if(j<0) continue;
				h=(h===null?quotes[j][f]:Math.max(h,quotes[j][f]));
			}
			return h;
		}
	    var i;
	    for(i=sd.days-1;i<quotes.length;i++){
	    	if(!quotes[i]) continue;
	    	quotes[i]["PD2 "+sd.name]=Math.pow(100*(quotes[i][field]/getHV(sd.days,i,field)-1),2);
	    }
	    CIQ.Studies.MA("simple", sd.days, "PD2 "+sd.name, 0, "MA", stx, sd);
	    for(i=2*(sd.days-1);i<quotes.length;i++){
	    	quotes[i]["Result "+sd.name]=Math.sqrt(quotes[i]["MA "+sd.name]);
	    }
	};

	CIQ.Studies.calculateChoppiness=function(stx, sd){
		CIQ.Studies.calculateStudyATR(stx,sd);

		var quotes=sd.chart.scrubbed;

		function getLLVHHV(p,x){
			var h=null, l=null;
			for(var j=x-p+1;j<=x;j++){
				if(j<0) continue;
				h=(h===null?quotes[j].High:Math.max(h,quotes[j].High));
				l=(l===null?quotes[j].Low:Math.min(l,quotes[j].Low));
			}
			return [l,h];
		}
	    for(var i=sd.days;i<quotes.length;i++){
	    	if(!quotes[i]) continue;
	    	var lh=getLLVHHV(sd.days,i);
	    	if(quotes[i]["Sum True Range "+sd.name]){
	    		quotes[i]["Result "+sd.name]=100*(Math.log(quotes[i]["Sum True Range "+sd.name]/(Math.max(0.000001,lh[1]-lh[0]))))/Math.log(sd.days);
	    	}else{
	    		quotes[i]["Result "+sd.name]=0;
	    	}
	    }
	};

	CIQ.Studies.calculateDisparity=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";

	    CIQ.Studies.MA(sd.inputs["Moving Average Type"], sd.days, field, 0, "MA", stx, sd);
	    for(var i=sd.days-1;i<quotes.length;i++){
	    	if(!quotes[i]) continue;
	    	quotes[i]["Result "+sd.name]=100*(quotes[i][field]/quotes[i]["MA "+sd.name]-1);
	    }
	};

	CIQ.Studies.calculateRainbow=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";

		function getLLVHHV(p,x){
			var h=null, l=null;
			for(var j=x-p+1;j<=x;j++){
				if(j<0) continue;
				h=(h===null?quotes[j].Close:Math.max(h,quotes[j].Close));
				l=(l===null?quotes[j].Close:Math.min(l,quotes[j].Close));
			}
			return [l,h];
		}

		var f=field;
		for(var j=1;j<=10;j++) {
			CIQ.Studies.MA("simple", sd.days, f, 0, "SMA"+j, stx, sd);
			f="SMA"+j+" "+sd.name;
		}

	    for(var i=10;i<quotes.length;i++){
	    	if(!quotes[i]) continue;
	    	var accum=0,max=0,min=Number.MAX_VALUE;
	    	for(j=1;j<=10;j++) {
	    		var q=quotes[i]["SMA"+j+" "+sd.name];
	    		accum+=q;
	    		max=Math.max(max,q);
	    		min=Math.min(min,q);
	    	}
	    	if(sd.name.indexOf("Osc")>-1) {
	    		var lh=getLLVHHV(sd.inputs["HHV/LLV Lookback"],i);
	    		quotes[i][sd.name+"_hist"]=100*(quotes[i][field]-accum/10)/Math.max(0.000001,lh[1]-lh[0]);
	    		quotes[i]["Over "+sd.name]=100*(max-min)/Math.max(0.000001,lh[1]-lh[0]);
	    		quotes[i]["Under "+sd.name]=-quotes[i]["Over "+sd.name];
	    		quotes[i]["Zero "+sd.name]=0;
	    	}
	    }
	};

	CIQ.Studies.calculateKST=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";
		var roc={}; smp={};
		roc[1]=sd.inputs["Lightest Rate of Change Period"];
		roc[2]=sd.inputs["Light Rate of Change Period"];
		roc[3]=sd.inputs["Heavy Rate of Change Period"];
		roc[4]=sd.inputs["Heaviest Rate of Change Period"];
		smp[1]=sd.inputs["Lightest SMA Period"];
		smp[2]=sd.inputs["Light SMA Period"];
		smp[3]=sd.inputs["Heavy SMA Period"];
		smp[4]=sd.inputs["Heaviest SMA Period"];
		var sp=sd.inputs["Signal Period"];
	    var i,j;
	    for(i=0;i<quotes.length;i++){
    		if(!quotes[i]) continue;
	    	for(j=1;j<=4;j++){
	    		if(i>=roc[j] && quotes[i-roc[j]] && quotes[i-roc[j]][field]) quotes[i]["ROC"+j+" "+sd.name]=100*((quotes[i][field]/quotes[i-roc[j]][field])-1);
	    	}
	    }
		for(j=1;j<=4;j++) {
			CIQ.Studies.MA("simple", smp[j], "ROC"+j+" "+sd.name, 0, "SMA"+j, stx, sd);
		}
		for(i=0;i<quotes.length;i++){
		    quotes[i]["KST "+sd.name]=0;
			for(j=1;j<=4;j++) quotes[i]["KST "+sd.name]+=j*quotes[i]["SMA"+j+" "+sd.name];
	    }
		CIQ.Studies.MA("simple", sp, "KST "+sd.name, 0, "KSTSignal", stx, sd);
	};

	CIQ.Studies.calculateSpecialK=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";
		var span=sd.inputs.Interval;
		if(!span) span="daily";
		var roc={
			daily: [10,15,20,30,50,65,75,100,195,265,390,530],
			weekly: [4,5,6,8,10,13,15,20,39,52,78,104]
		};
		var map={
			daily: [10,10,10,15,50,65,75,100,130,130,130,195],
			weekly: [4,5,6,8,10,13,15,20,26,26,26,39]
		};
	    var i,j;
	    for(i=0;i<quotes.length;i++){
    		if(!quotes[i]) continue;
	    	for(j=0;j<roc[span].length;j++){
	    		if(i>=roc[span][j] && quotes[i-roc[span][j]] && quotes[i-roc[span][j]][field]) quotes[i]["ROC"+j+" "+sd.name]=100*((quotes[i][field]/quotes[i-roc[span][j]][field])-1);
	    	}
	    }
		for(j=0;j<map[span].length;j++) {
			CIQ.Studies.MA(span=="daily"?"simple":"exponential", map[span][j], "ROC"+j+" "+sd.name, 0, "MA"+j, stx, sd);
		}
		for(i=0;i<quotes.length;i++){
		    quotes[i]["Result "+sd.name]=0;
			for(j=0;j<map[span].length;j++) {
				quotes[i]["Result "+sd.name]+=((j%4)+1)*quotes[i]["MA"+j+" "+sd.name];
			}
	    }
	};

	CIQ.Studies.calculateDarvas=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var state=0;
		var allTimeHigh=0;
		var allTimeHighPeriods=parseInt(sd.inputs["All-Time High Lookback Period"],10);
		if(sd.inputs["Volume Spike"]){
			CIQ.Studies.MA("simple", allTimeHighPeriods, "Volume", 0, "ADV", stx, sd);
		}
		var spikePercentage=parseFloat(sd.inputs["Volume % of Avg"])/100;
		var boxState="none";
		var boxData={};
		var ghost=null;
		var buy=null, sell=null;
		var offset=parseFloat(sd.inputs["Level Offset"]);
		var debug=false;
		if(debug) console.log("*****************");
		for(var i=0;i<quotes.length;i++){
			var quote=quotes[i];
			if(!quote) continue;

			if(parseFloat(sd.inputs["Price Minimum"])<=quotes[allTimeHigh].Close){

				if(ghost && (!ghost.End || i==ghost.End+1)){
					if(quotes[i-1].Close>boxData.High){
						boxData={State:1,High:2*boxData.High-boxData.Low,Low:boxData.High,Start:i,End:2*boxData.End-boxData.Start+1};
					}else{
						ghost=null;
						//boxData={State:1,High:boxData.High,Low:boxData.Low,Start:i,End:2*boxData.End-boxData.Start+1};
					}
					if(ghost){
						quote["Ghost "+sd.name]=CIQ.clone(boxData);
						if(debug) console.log("Ghost begin:"+quote.DT);
						boxData.State=0;
						if(quotes[boxData.End]){
							quotes[boxData.End]["Ghost "+sd.name]=CIQ.clone(boxData);
							if(debug) console.log("Ghost end:"+quotes[boxData.End].DT);
						}
						ghost={Start:boxData.Start,End:boxData.End};
						buy=boxData.High+offset;
						if(!sell || sell < boxData.Low-offset){
							sell=boxData.Low-offset;
						}
					}
				}

				quote["Profit "+sd.name]=buy;
				quote["Loss "+sd.name]=sell;
				if(quote.Close>=buy) buy=null;
				else if(sd.inputs["Exit Field"]=="high/low" && quote.High>=buy) buy=null;

				if(boxState=="none"){
					if(i==allTimeHigh+3) {
						if(!quotes[allTimeHigh+2]["Darvas "+sd.name] &&
						   !quotes[allTimeHigh+1]["Darvas "+sd.name] &&
						   !quotes[allTimeHigh]["Darvas "+sd.name] &&
						   quotes[allTimeHigh].High>quote.High) {
							boxState="high";
							//if(sell) buy=Math.max(buy,quotes[allTimeHigh].High+offset);
						}
					}
				}

				if(boxState=="high"){
					if(quote.High>quotes[allTimeHigh].High){
						boxState="none";
					}else if(quotes[i-3].Low<quotes[i-2].Low && quotes[i-3].Low<quotes[i-1].Low && quotes[i-3].Low<quote.Low){
						boxData={State:1,High:quotes[allTimeHigh].High,Low:quotes[i-3].Low,Start:allTimeHigh};
						quotes[allTimeHigh]["Darvas "+sd.name]=CIQ.clone(boxData);
						boxState="darvas";
						if(debug) console.log("Darvas begin:"+quotes[allTimeHigh].DT);
						if(debug) console.log("Darvas established:"+quote.DT);
						if(ghost){
							if(ghost.End>i && quotes[ghost.Start]){
								quote["Ghost "+sd.name]=CIQ.clone(quotes[ghost.Start]["Ghost "+sd.name]);
								quote["Ghost "+sd.name].End=i;
								if(quotes[ghost.End]) {
									delete quotes[ghost.End]["Ghost "+sd.name];
									if(debug) console.log("Ghost End removed:"+quotes[ghost.End].DT);
								}
							}
							quote["Ghost "+sd.name].State=0;
							quotes[ghost.Start]["Ghost "+sd.name].End=i;
							if(debug) console.log("Ghost end:"+quote.DT);
							ghost=null;
						}
						buy=boxData.High+offset;
						if(!sell || sell < boxData.Low-offset){
							sell=boxData.Low-offset;
						}
					}
				}

				if(boxState=="darvas"){
					if(quote.Close>boxData.High) ghost={};
					else if(sd.inputs["Exit Field"]=="high/low" && quote.High>boxData.High) ghost={};
					else if(quote.Close<boxData.Low) boxState="none";
					else if(sd.inputs["Exit Field"]=="high/low" && quote.Low<boxData.Low) boxState="none";
					if(ghost) boxState="none";
					else if(boxState=="none"){
						buy=null;
						sell=null;
					}
					if(!sd.inputs["Ghost Boxes"]) ghost=null;
					if(boxState=="none"){
						for(var d=boxData.Start+1;d<i;d++){
							quotes[d]["Darvas "+sd.name]=CIQ.clone(boxData);
						}
						boxData.State=0;
						boxData.End=i;
						quote["Darvas "+sd.name]=CIQ.clone(boxData);
						if(debug) console.log("Darvas end:"+quote.DT);
						continue;
					}
				}

				if(sell){
					if(quote.Close<boxData.Low ||
					  (sd.inputs["Exit Field"]=="high/low" && quote.Low<boxData.Low)){
						if(boxState=="darvas") boxState="none";
						if(quote.Close<sell || (sd.inputs["Exit Field"]=="high/low" && quote.Low<sell)){
							buy=null;
							sell=null;
						}
						if(ghost){
							if(ghost.End>i && quotes[ghost.Start]){
								quote["Ghost "+sd.name]=CIQ.clone(quotes[ghost.Start]["Ghost "+sd.name]);
								quote["Ghost "+sd.name].End=i;
								if(quotes[ghost.End]){
									delete quotes[ghost.End]["Ghost "+sd.name];
									if(debug) console.log("Ghost End removed:"+quotes[ghost.End].DT);
								}
							}
							quote["Ghost "+sd.name].State=0;
							quotes[ghost.Start]["Ghost "+sd.name].End=i;
							if(debug) console.log("Ghost end:"+quote.DT);
							ghost=null;
						}
					}
				}
			}

			if(quote.High>=quotes[allTimeHigh].High){
				allTimeHigh=i;
			}

			if(i<3 || (quote.High>=quotes[i-1].High && quote.High>=quotes[i-2].High && quote.High>=quotes[i-3].High)){
				if(i-allTimeHigh>=allTimeHighPeriods){
					allTimeHigh=i;
					for(var j=0;j<allTimeHighPeriods;j++){
						if(i-j<0) break;
						if(quotes[i-j].High>quotes[allTimeHigh].High){
							allTimeHigh=i-j;
						}
					}
				}
			}

			if(sd.inputs["Volume Spike"] && i>allTimeHighPeriods && i==allTimeHigh){
				if(quote["ADV "+sd.name]*spikePercentage < quote.Volume){
					quote["Spike "+sd.name]=1;
					if(debug) console.log("Volume Spike:"+quote.DT);
				}
			}

		}
	};

	CIQ.Studies.calculateSupertrend=function(stx, sd){
		CIQ.Studies.calculateStudyATR(stx,sd);
		var quotes=sd.chart.scrubbed;
		for(var i=0;i<quotes.length;i++){
			var quote=quotes[i];
			if(!quote) continue;
			var median=(quote.High+quote.Low)/2;
			var factoredATR=sd.inputs.Multiplier*quote["ATR "+sd.name];
			var uptrend=median-factoredATR;
			var downtrend=median+factoredATR;
			if(i){
				if(quotes[i-1] && quotes[i-1].Close &&
					quotes[i-1].Close>quotes[i-1]["Uptrend "+sd.name] &&
					quotes[i-1]["Uptrend "+sd.name]>uptrend)
					uptrend=quotes[i-1]["Uptrend "+sd.name];
				if(quotes[i-1] && quotes[i-1].Close &&
					quotes[i-1].Close<quotes[i-1]["Downtrend "+sd.name] &&
					quotes[i-1]["Downtrend "+sd.name]<downtrend)
					downtrend=quotes[i-1]["Downtrend "+sd.name];
			}
			quote["Direction "+sd.name]=1;
			if(i) {
				quote["Direction "+sd.name]=quotes[i-1]["Direction "+sd.name];
				if(quote.Close > quotes[i-1]["Downtrend "+sd.name]) quote["Direction "+sd.name]=1;
				else if(quote.Close < quotes[i-1]["Uptrend "+sd.name]) quote["Direction "+sd.name]=-1;
			}
			quote["Uptrend "+sd.name]=uptrend;
			quote["Downtrend "+sd.name]=downtrend;
			quote["Trend "+sd.name]=quote["Direction "+sd.name] > 0 ? uptrend : downtrend;
			if(!i) continue;
			if(quotes[i-1]["Direction "+sd.name] > 0) quotes[i-1]["Downtrend "+sd.name]=null; else quotes[i-1]["Uptrend "+sd.name]=null;
		}
	};

	CIQ.Studies.fetchComparisonQuote=function(stx, sd, symbol){
		var Status={
			INIT:0,
			BUSY:1,
			DONE:2
		};
		
		stx.panels[sd.panel].studyQuotes={};

		var cSym=symbol;
		if(!cSym || cSym==stx.chart.symbol) {
			stx.panels[sd.panel].studyQuotes=null;
			return;
		}
		stx.panels[sd.panel].studyQuotes[cSym]=true;

		var quotes=sd.chart.scrubbed;
		if(sd.loadedInitialData===Status.DONE && quotes[0].DT<sd.compareBegin){
			sd.loadedInitialData=Status.INIT;
		}

		function handleResponse(dataCallback){
			if(dataCallback.error){
				sd.loadedInitialData=Status.INIT;//allow a retry
			}else{
				CIQ.addMemberToMasterdata(stx, params.symbol, dataCallback.quotes);
				stx.createDataSet();
				stx.draw();  //need this due to async nature of this function
				sd.loadedInitialData=Status.DONE;
			}
			stx.completeAsyncAction();
		}

		if(!sd.loadedInitialData){  //check to see if we've loaded the initial data
			sd.loadedInitialData=Status.BUSY;
			var params={
                stx: stx,
                chart: stx.panels[sd.panel].chart,
			    symbol: cSym,
			    symbolObject: sd.symbolObject,
                interval: stx.layout.interval,
                period: 1,
                extended: stx.layout.extended,
				adj: stx.layout.adj,
				startDate: quotes[0].DT,
				endDate: quotes[quotes.length-1].DT,
			    feed: "delayed",
			    //noBats: true,
			    //noUpdate: true,
			    nocache: true
            };
			sd.compareBegin=quotes[0].DT;
			if(!isNaN(params.interval)){	// normalize numeric intervals into "minute" form
				params.period=params.interval;
				params.interval="minute";
			}

			if(stx.quoteDriver){
				stx.startAsyncAction();
				if(stx.isEquationChart(params.symbol)){  //equation chart
					CIQ.fetchEquationChart(params, handleResponse);
				}else{
					stx.quoteDriver.quoteFeed.fetch(params, handleResponse);
				}
			}else{
				//this will go away one day
				if(cSym.indexOf(":")>-1 || stx.chart.symbol.indexOf(":")>-1) return;
				if(cSym.indexOf("=")===0 || stx.chart.symbol.indexOf("=")===0) return;
				stx.startAsyncAction();
				CIQ.Quotes.fetch(params,function(error,data){
					if(error){
						sd.loadedInitialData=Status.INIT;//allow a retry
					}else{
						CIQ.addMemberToMasterdata(stx,params.symbol,data);
						stx.createDataSet();
						stx.draw();  //need this due to async nature of this function
						sd.loadedInitialData=Status.DONE;
					}
					stx.completeAsyncAction();
				});
			}
			return 0;
		}
		quotes=stx.chart.dataSet; //operating on dataset is probably faster than recreating and scrubbing it
		return quotes;
	};

	/**
	 * Calculates data for Price Relative Study
	 * 
	 * If using a `symbolObject`, add your code here to create the `sd.symbolObject` 
	 * as needed by your feed using any additional logic or input fields you have included in the study dialog.
	 * <br>`sd.symbolObject` must have at lease a `symbol` element. 
	 * <br>Example: `sd.symbolObject={symbol:sd.inputs["Comparison Symbol"].toUpperCase()}`
	 * @param  {object} stx    The chart object
	 * @param  {object} sd    The study descriptor object
	 * @memberOf CIQ.Studies
	 * @version ChartIQ Advanced Package
	 * @since TBD `symbolObject` capability added
	 */
	CIQ.Studies.calculatePriceRelative=function(stx, sd){
		var cSym=sd.inputs["Comparison Symbol"].toUpperCase();
		// if using a symbolObject, add your code here to create the sd.symbolObject 
		// as needed by your feed using any additional logic or input fields you have included in the study dialog.
		// sd.symbolObject must have at lease a `symbol` element. 
		// Example: sd.symbolObject={symbol:sd.inputs["Comparison Symbol"].toUpperCase()}
		sd.symbolObject={symbol:sd.inputs["Comparison Symbol"].toUpperCase()};
		var quotes=CIQ.Studies.fetchComparisonQuote(stx, sd, cSym);
		if(!quotes) return;
		var map={};
		var mainSymbol=stx.chart.symbol.replace(/=/,"");
		mainSymbol=mainSymbol.replace(/[\+\-\*\\\%]/g,"");
		map[mainSymbol]=[].concat(quotes);
		map[cSym]=null;
		var results=CIQ.computeEquationChart("["+mainSymbol+"]/["+cSym+"]", map);
		var rIter=0;
		for(var i=0;i<quotes.length && rIter<results.length;i++){
			while(rIter<results.length && quotes[i].DT.getTime()>results[rIter].DT.getTime()) rIter++;
			if(quotes[i].DT.getTime()<results[rIter].DT.getTime()) continue;
			quotes[i]["Result "+sd.name]=results[rIter].Close;
			rIter++;
		}
	};
	
	CIQ.Studies.calculatePerformance=function(stx, sd){
		var cSym=sd.inputs["Comparison Symbol"].toUpperCase();
		if(!cSym) cSym=sd.libraryEntry.inputs["Comparison Symbol"];
		if(!sd.days) sd.days=sd.libraryEntry.inputs.Period;
		var quotes=CIQ.Studies.fetchComparisonQuote(stx, sd, cSym);
		if(!quotes) return;
		CIQ.Studies.MA("ma", sd.days, "Close", 0, "MA Base", stx, sd);
		CIQ.Studies.MA("ma", sd.days, cSym, 0, "MA Comp", stx, sd);
		for(var i=0;i<quotes.length;i++){
			quotes[i]["Result "+sd.name]=(quotes[i].Close/quotes[i][cSym]) * (quotes[i]["MA Comp "+sd.name]/quotes[i]["MA Base "+sd.name]);
		}
	};

	CIQ.Studies.calculateBeta=function(stx, sd){
		var cSym=sd.inputs["Comparison Symbol"].toUpperCase();
		if(!cSym) cSym=sd.libraryEntry.inputs["Comparison Symbol"];
		if(!sd.days) sd.days=sd.libraryEntry.inputs.Period;
		var quotes=CIQ.Studies.fetchComparisonQuote(stx, sd, cSym);
		if(!quotes) return;
		for(var i=1;i<quotes.length;i++){
			quotes[i]["BaseChange "+sd.name]=quotes[i].Close/quotes[i-1].Close-1;
			quotes[i]["CompChange "+sd.name]=quotes[i][cSym]/quotes[i-1][cSym]-1;
		}
		CIQ.Studies.MA("ma", sd.days, "BaseChange "+sd.name, 0, "MA Base", stx, sd);
		CIQ.Studies.MA("ma", sd.days, "CompChange "+sd.name, 0, "MA Comp", stx, sd);
		for(i=sd.days;i<quotes.length;i++){
			quotes[i]["COVARn "+sd.name]=(quotes[i]["BaseChange "+sd.name]-quotes[i]["MA Base "+sd.name])*(quotes[i]["CompChange "+sd.name]-quotes[i]["MA Comp "+sd.name]);
			quotes[i]["VARn "+sd.name]=Math.pow(quotes[i]["CompChange "+sd.name]-quotes[i]["MA Comp "+sd.name],2);
		}
		CIQ.Studies.MA("ma", sd.days, "COVARn "+sd.name, 0, "COVAR", stx, sd);
		CIQ.Studies.MA("ma", sd.days, "VARn "+sd.name, 0, "VAR", stx, sd);
		for(i=sd.days*2-1;i<quotes.length;i++){
			quotes[i]["Result "+sd.name]=quotes[i]["COVAR "+sd.name]/quotes[i]["VAR "+sd.name];
		}
	};

	CIQ.Studies.calculateVortex=function(stx, sd){
		var quotes=sd.chart.scrubbed;
        var period=sd.days;
        var total={tr:0,vmPlus:0,vmMinus:0};
	    for(var i=1;i<quotes.length;i++){
			var prices=quotes[i];
			var pd=quotes[i-1];
			var vmPlus=Math.abs(prices.High-pd.Low);
			var vmMinus=Math.abs(prices.Low-pd.High);
			var trueRange=Math.max(prices.High,pd.Close)-Math.min(prices.Low,pd.Close);
			total.tr+=trueRange;
			total.vmPlus+=vmPlus;
			total.vmMinus+=vmMinus;
			if(i>period) {
				total.tr-=quotes[i-period]["True Range " + sd.name];
				total.vmPlus-=quotes[i-period]["VMPlus " + sd.name];
				total.vmMinus-=quotes[i-period]["VMMinus " + sd.name];
			}
			prices["True Range " + sd.name]=trueRange;
			prices["VMPlus " + sd.name]=vmPlus;
			prices["VMMinus " + sd.name]=vmMinus;
			if(i>=period) {
				prices["+VI " + sd.name]=total.vmPlus/total.tr;
				prices["-VI " + sd.name]=total.vmMinus/total.tr;
			}
		}
	};

	CIQ.Studies.calculateBalanceOfPower=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var period=sd.days;

		for(var i=0;i<quotes.length;i++){
			quotes[i]["Ratio " + sd.name]=(quotes[i].Close-quotes[i].Open)/(quotes[i].High-quotes[i].Low);
		}
		CIQ.Studies.MA(sd.inputs["Moving Average Type"], period, "Ratio "+sd.name, 0, "Result", stx, sd);
	};
	
	CIQ.Studies.calculateTrendIntensity=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";

		function computeTII(gain, loss){
			if(loss===0) return 100;
			return 100-(100/(1+(gain/loss)));
		}
		CIQ.Studies.MA("ma", sd.days, field, 0, "SMA", stx, sd);
		var gain=0, loss=0, i, change, queue=[];
		for(i=0;i<quotes.length;i++){
			if(!quotes[i]["SMA "+sd.name] && quotes[i]["SMA "+sd.name]!==0) continue;
			change=quotes[i][field]-quotes[i]["SMA "+sd.name];
			if(change<0) loss+=(change*-1);
			else gain+=change;
			queue.push(change);
			if(queue.length>Math.ceil(sd.days/2)){
				change=queue.shift();
				if(change<0) loss-=(change*-1);
				else gain-=change;					
			}
			quotes[i]["TII "+sd.name]=computeTII(gain, loss);
		}
		CIQ.Studies.MA("ema", sd.inputs["Signal Period"], "TII "+sd.name, 0, "Signal", stx, sd);
		sd.zoneOutput="TII";
	};

	// Note: this study expects createDataSet to be called when changing the chart type!
	CIQ.Studies.calculateZigZag=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		function getValue(high_low,chartType){  //TODO: make part of CIQ.ChartEngine?
			if(chartType=="line" || chartType=="colored_line") return "Close";
			else if(chartType.indexOf("baseline")>-1 || chartType.indexOf("mountain")>-1) return "Close";
			else return high_low;
		}
		function fillBetweenPoints(start,end){
			for(var i=start+1;i<end;i++){
				quotes[i]["ShadowResult "+sd.name]=(quotes[end]["Result "+sd.name]-quotes[start]["Result "+sd.name])*(i-start)/(end-start)+quotes[start]["Result "+sd.name];
			}
		}
		var ll=null, hh=null;
		var distance=sd.inputs["Distance(%)"];
		var direction=0;
		var bar=0;
		var previousBar=0;
		var zig=null, zag=null;
		for(var i=0;i<quotes.length;i++){
			var thisHigh=quotes[i][getValue("High",stx.layout.chartType)];
			var thisLow=quotes[i][getValue("Low",stx.layout.chartType)];
			if(hh===null || hh<thisHigh){
				hh=thisHigh;
				if(direction<0) ll=thisLow;
				zig=(1-distance/100)*hh;
				if(direction>-1) {
					if(zag!==null && hh>zag){
						quotes[bar]["Result "+sd.name]=quotes[bar][getValue("Low",stx.layout.chartType)];
						fillBetweenPoints(previousBar,bar);
						direction=-1;
						ll=thisLow;
						previousBar=bar;
						bar=i;
						continue;
					}
				}else{
					bar=i;
				}
			}
			if(ll===null || ll>thisLow) {
				ll=thisLow;
				if(direction>0) hh=thisHigh;
				zag=(1+distance/100)*ll;
				if(direction<1){
					if(zig!==null && ll<zig){
						quotes[bar]["Result "+sd.name]=quotes[bar][getValue("High",stx.layout.chartType)];
						fillBetweenPoints(previousBar,bar);
						direction=1;
						hh=thisHigh;
						previousBar=bar;
						bar=i;
						continue;
					}
				}else{
					bar=i;
				}
			}
		}
		quotes[bar]["Result "+sd.name]=quotes[bar][getValue((direction==1?"Low":"High"),stx.layout.chartType)];
		fillBetweenPoints(previousBar,bar);
		quotes[quotes.length-1]["Result "+sd.name]=quotes[quotes.length-1][getValue((direction==1?"High":"Low"),stx.layout.chartType)];
		fillBetweenPoints(bar,quotes.length-1);
	};

	CIQ.Studies.calculatePsychologicalLine=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var array=[];
		var increment=100/sd.days;
		var accum=0;
	    for(var i=1;i<quotes.length;i++){
	    	var up=Number(quotes[i].Close>quotes[i-1].Close);
			if(up) accum+=increment;
			array.push(up);
			if(array.length>sd.days) accum-=array.shift()*increment;
		    quotes[i]["Result " + sd.name]=accum;
	    }
	};

	CIQ.Studies.calculateMADev=function(stx, sd) {
		var quotes=sd.chart.scrubbed;
		if(!quotes) return;
		if(quotes.length<sd.days+1){
			stx.watermark(sd.panel,"center","bottom",stx.translateIf("Not enough quotes to compute MA Dev " + sd.chart.dataSet.length));
			return;
		}
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";
		var pts=sd.inputs["Points Or Percent"];
		if(!pts) pts="Points";
		var maType=sd.inputs["Moving Average Type"];
		if(!maType) maType="exponential";
		CIQ.Studies.MA(maType, sd.days, field, 0, "MA", stx, sd);
		var histogram=sd.name+"_hist";
		for(i=sd.days-1;i<quotes.length;i++){
			var quote=quotes[i];
	        if(pts=="Points")quote[histogram]=quote[field]-quote["MA "+sd.name];
	        else quote[histogram]=100*(quote[field]/quote["MA "+sd.name]-1);
		}
	};

	CIQ.Studies.calculateShinohara=function(stx, sd){
		var quotes=sd.chart.scrubbed;
    	var weakNum=0;
    	var weakDen=0;
    	var strongNum=0;
    	var strongDen=0;
	    for(var i=0;i<quotes.length;i++){
	    	weakNum+=quotes[i].High-quotes[i].Close;
	    	weakDen+=quotes[i].Close-quotes[i].Low;
	    	if(i>0){
	    		strongNum+=quotes[i].High-quotes[i-1].Close;
	    		strongDen+=quotes[i-1].Close-quotes[i].Low;
	    	}
	    	if(i>=sd.days){
		    	weakNum-=quotes[i-sd.days].High-quotes[i-sd.days].Close;
		    	weakDen-=quotes[i-sd.days].Close-quotes[i-sd.days].Low;
		    	quotes[i]["Weak Ratio " + sd.name]=100*weakNum/weakDen;
		    	if(i>sd.days){
		    		strongNum-=quotes[i-sd.days].High-quotes[i-sd.days-1].Close;
		    		strongDen-=quotes[i-sd.days-1].Close-quotes[i-sd.days].Low;
			    	quotes[i]["Strong Ratio " + sd.name]=100*strongNum/strongDen;
		    	}
	    	}
	    }
	};

	CIQ.Studies.calculateIchimoku=function(stx, sd){
		var quotes=sd.chart.scrubbed;

		function getLLVHHV(p,x){
			var l=null, h=null;
			for(var j=x-p+1;j<=x;j++){
				if(j<0) continue;
				l=(l===null?quotes[j].Low:Math.min(l,quotes[j].Low));
				h=(h===null?quotes[j].High:Math.max(h,quotes[j].High));
			}
			return [l,h];
		}

		var i,hl;
		for(i=0;i<quotes.length;i++){
			if(!quotes[i]) continue;

			hl=getLLVHHV(sd.inputs["Conversion Line Period"],i);
			quotes[i]["Conversion Line " + sd.name]=(hl[1]+hl[0])/2;

			hl=getLLVHHV(sd.inputs["Base Line Period"],i);
			quotes[i]["Base Line " + sd.name]=(hl[1]+hl[0])/2;

			if(i<sd.inputs["Lagging Span Period"]) continue;
			quotes[i-Number(sd.inputs["Lagging Span Period"])]["Lagging Span " + sd.name]=quotes[i].Close;
		}
		sd.futureA=[];
		sd.futureB=[];
		for(i=0;i<quotes.length;i++){
			hl=getLLVHHV(sd.inputs["Leading Span B Period"],i);
			var blp=Number(sd.inputs["Base Line Period"]);
			if(!quotes[i+blp]) {
				sd.futureA.push((quotes[i]["Conversion Line " + sd.name]+quotes[i]["Base Line " + sd.name])/2);
				sd.futureB.push((hl[1]+hl[0])/2);
			}else{
				quotes[i+blp]["Leading Span A " + sd.name]=(quotes[i]["Conversion Line " + sd.name]+quotes[i]["Base Line " + sd.name])/2;
				quotes[i+blp]["Leading Span B " + sd.name]=(hl[1]+hl[0])/2;

			}
		}
	};

	CIQ.Studies.displayIchimoku=function(stx, sd, quotes){
		var parameters={
			topBand: "Leading Span A " + sd.name,
			bottomBand: "Leading Span B " + sd.name,
			fillFuture: true
		};
        stx.chart.context.globalAlpha=0.3;
		CIQ.fillIntersecting(stx, sd, quotes, parameters);
        stx.chart.context.globalAlpha=1;
	    CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);
	};

	CIQ.Studies.displayDarvas=function(stx, sd, quotes){
		var levelsColor=sd.outputs.Levels;
		if(!levelsColor || levelsColor=="auto" || CIQ.isTransparent(levelsColor)) levelsColor=stx.defaultColor;
		var darvasColor=sd.outputs.Darvas;
		if(!darvasColor || darvasColor=="auto" || CIQ.isTransparent(darvasColor)) darvasColor=stx.defaultColor;
		var ghostColor=sd.outputs.Ghost;
		if(!ghostColor || ghostColor=="auto" || CIQ.isTransparent(ghostColor)) ghostColor=stx.defaultColor;

		var panel = stx.panels[sd.panel];
		var i,q;
		var slyh1, slyl1;
		var myWidth=stx.layout.candleWidth-2;
		if(myWidth<2) myWidth=1;
		stx.startClip(sd.panel);
		if(sd.inputs["Stop Levels"]){
			if(stx.chart.context.setLineDash){
				stx.chart.context.setLineDash([2,2]);
			}
			stx.chart.context.lineWidth=2;
			stx.chart.context.strokeStyle=levelsColor;
			/*  Don't display the take profit levels
			stx.chart.context.beginPath();
			for(i=0;i<quotes.length;i++){
				q=quotes[i];
				q1=quotes[i-1];
				if(!q) continue;
				slyh1=q["Profit "+sd.name]?Math.floor(stx.pixelFromPriceTransform(q["Profit "+sd.name], panel)):null;
				var slyh0=q1 && q1["Profit "+sd.name]?Math.floor(stx.pixelFromPriceTransform(q1["Profit "+sd.name], panel)):null;
				if(slyh1){
					if(q.candleWidth) myWidth=Math.floor(Math.max(1,q.candleWidth));
					var slxh1=Math.floor(stx.pixelFromBar(i, panel.chart)+myWidth/2);
					var slxh0=Math.floor(stx.pixelFromBar(i, panel.chart)-myWidth/2);
					if(slyh0) stx.chart.context.lineTo(slxh0,slyh1);
					else if(i===0) stx.chart.context.moveTo(stx.chart.left,slyh1);
					else stx.chart.context.moveTo(slxh0,slyh1);
					stx.chart.context.lineTo(slxh1,slyh1);
				}
			}
			stx.chart.context.stroke();
			*/
			stx.chart.context.beginPath();
			for(i=0;i<quotes.length;i++){
				q=quotes[i];
				q1=quotes[i-1];
				if(!q) continue;
				slyl1=q["Loss "+sd.name]?Math.floor(stx.pixelFromPriceTransform(q["Loss "+sd.name], panel)):null;
				var slyl0=q1 && q1["Loss "+sd.name]?Math.floor(stx.pixelFromPriceTransform(q1["Loss "+sd.name], panel)):null;
				if(slyl1){
					if(q.candleWidth) myWidth=Math.floor(Math.max(1,q.candleWidth));
					var slxl1=Math.floor(stx.pixelFromBar(i, panel.chart)+myWidth/2);
					var slxl0=Math.floor(stx.pixelFromBar(i, panel.chart)-myWidth/2);
					if(slyl0 && slyl0>=slyl1) stx.chart.context.lineTo(slxl0,slyl1);
					else if(i===0) stx.chart.context.moveTo(stx.chart.left,slyl1);
					else stx.chart.context.moveTo(slxl0,slyl1);
					stx.chart.context.lineTo(slxl1,slyl1);
				}
			}
			stx.chart.context.stroke();
			if(stx.chart.context.setLineDash) {
				stx.chart.context.setLineDash([]);
			}
			stx.chart.context.lineWidth=1;
		}
		var dx=-10,dy,dw=0,dh,gx=-10,gy,gw=0,gh;
		var inDarvas=false, inGhost=false;
		var signalWidth=stx.chart.context.measureText("\u25B2").width/2;
		for(i=0;i<quotes.length;i++){
			if(!quotes[i]) continue;
			if(quotes[i]["Spike "+sd.name]){
				stx.chart.context.fillStyle=darvasColor;
				stx.chart.context.textBaseline="bottom";
				var y=stx.pixelFromPriceTransform(quotes[i].High, stx.chart.panel);
				stx.chart.context.fillText("\u25BC", stx.pixelFromBar(i)-signalWidth, y-5); // down arrow
			}

			if(quotes[i].candleWidth) myWidth=Math.floor(Math.max(1,quotes[i].candleWidth));
			if(quotes[i]["Darvas "+sd.name]){
				q=quotes[i]["Darvas "+sd.name];
				if(q.State==1 && !inDarvas){
					dx=Math.floor(stx.pixelFromBar(i, panel.chart)-myWidth/2);
					dy=Math.floor(stx.pixelFromPriceTransform(q.High, panel));
					dh=Math.floor(stx.pixelFromPriceTransform(q.Low, panel))-dy;
					inDarvas=true;
				}else if(q.State===0){
					dw=Math.floor(stx.pixelFromBar(i, panel.chart)+myWidth/2)-dx;
					dy=Math.floor(stx.pixelFromPriceTransform(q.High, panel));
					dh=Math.floor(stx.pixelFromPriceTransform(q.Low, panel))-dy;
					stx.chart.context.strokeStyle=darvasColor;
					stx.chart.context.fillStyle=darvasColor;
					if(!sd.inputs["Stop Levels"]) {
						stx.chart.context.strokeRect(dx,dy,dw,dh);
						stx.chart.context.globalAlpha=0.2;
					}else{
						stx.chart.context.globalAlpha=0.3;
					}
					stx.chart.context.fillRect(dx,dy,dw,dh);
					stx.chart.context.globalAlpha=1;
					inDarvas=false;
				}
			}
			if(quotes[i]["Ghost "+sd.name] && sd.inputs["Ghost Boxes"]){
				q=quotes[i]["Ghost "+sd.name];
				if(q.State==1 && !inGhost){
					gx=Math.floor(stx.pixelFromBar(i, panel.chart)-myWidth/2);
					gy=Math.floor(stx.pixelFromPriceTransform(q.High, panel));
					gw=Math.floor((q.End-q.Start+1)*stx.layout.candleWidth+myWidth/2);
					gh=Math.floor(stx.pixelFromPriceTransform(q.Low, panel))-gy;
					inGhost=true;
				}else if(q.State===0){
					if(q.Start==q.End) gx=Math.floor(stx.pixelFromBar(i, panel.chart)-myWidth/2);
					gw=Math.floor(stx.pixelFromBar(i, panel.chart)+myWidth/2)-gx;
					gy=Math.floor(stx.pixelFromPriceTransform(q.High, panel));
					gh=Math.floor(stx.pixelFromPriceTransform(q.Low, panel))-gy;
					stx.chart.context.strokeStyle=ghostColor;
					stx.chart.context.fillStyle=ghostColor;
					if(!sd.inputs["Stop Levels"]){
						stx.chart.context.strokeRect(gx,gy,gw,gh);
						stx.chart.context.globalAlpha=0.2;
					}else{
						stx.chart.context.globalAlpha=0.3;
					}
					stx.chart.context.fillRect(gx,gy,gw,gh);
					stx.chart.context.globalAlpha=1;
					inGhost=false;
				}
			}
		}
		if(inDarvas){
			dw=Math.floor(stx.pixelFromBar(i, panel.chart)+myWidth/2)-dx;
			stx.chart.context.strokeStyle=darvasColor;
			stx.chart.context.fillStyle=darvasColor;
			if(!sd.inputs["Stop Levels"]){
				stx.chart.context.beginPath();
				stx.chart.context.moveTo(dx+2*dw,dy);
				stx.chart.context.lineTo(dx,dy);
				stx.chart.context.lineTo(dx,dy+dh);
				stx.chart.context.lineTo(dx+2*dw,dy+dh);
				stx.chart.context.stroke();
				stx.chart.context.globalAlpha=0.2;
			}else{
				stx.chart.context.globalAlpha=0.3;
			}
			stx.chart.context.fillRect(dx,dy,2*dw,dh);
			stx.chart.context.globalAlpha=1;
		}
		if(inGhost){
			stx.chart.context.strokeStyle=ghostColor;
			stx.chart.context.fillStyle=ghostColor;
			if(!sd.inputs["Stop Levels"]){
				stx.chart.context.strokeRect(gx,gy,gw,gh);
				stx.chart.context.globalAlpha=0.2;
			}else{
				stx.chart.context.globalAlpha=0.3;
			}
			stx.chart.context.fillRect(gx,gy,gw,gh);
			stx.chart.context.globalAlpha=1;
		}
		if(inDarvas || inGhost){
			if(sd.inputs["Stop Levels"]){
				if(stx.chart.context.setLineDash){
					stx.chart.context.setLineDash([2,2]);
				}
				stx.chart.context.lineWidth=2;
				stx.chart.context.strokeStyle=levelsColor;
				var x=Math.floor(stx.pixelFromBar(i-1, panel.chart)+myWidth/2);
				if(slyh1){
					stx.chart.context.beginPath();
					stx.chart.context.moveTo(x,slyh1);
					stx.chart.context.lineTo(inDarvas?dx+2*dw:gx+gw,slyh1);
					stx.chart.context.stroke();
				}
				if(slyl1){
					stx.chart.context.beginPath();
					stx.chart.context.moveTo(x,slyl1);
					stx.chart.context.lineTo(inDarvas?dx+2*dw:gx+gw,slyl1);
					stx.chart.context.stroke();
				}
				if(stx.chart.context.setLineDash) {
					stx.chart.context.setLineDash([]);
				}
				stx.chart.context.lineWidth=1;
			}
			inDarvas=false;
			inGhost=false;
		}
		stx.endClip();
	};

	CIQ.Studies.displaySupertrend=function(stx, sd, quotes){
		var panel=stx.panels[sd.panel];
		function colorFunction(stx, quote, mode){
			if(quote["Direction "+sd.name]<0) return sd.outputs.Downtrend;
			else return sd.outputs.Uptrend;
		}
		var params={skipProjections:true, label:stx.preferences.labels};
	    var context=stx.chart.context;
	    context.strokeStyle=colorFunction(stx,quotes[quotes.length-1]);
		context.lineWidth=2;
		if(sd.highlight) context.lineWidth=3;
		stx.plotLineChart(panel, quotes, "Trend "+sd.name, params, colorFunction);
		context.lineWidth=1;

		stx.startClip(sd.panel);
		var signalWidth=stx.chart.context.measureText("\u25B2").width/2;
		for(i=0;i<quotes.length;i++){
			if(!quotes[i] || !quotes[i-1]) continue;
			if(quotes[i-1]["Direction "+sd.name]>quotes[i]["Direction "+sd.name]){
				stx.chart.context.fillStyle=sd.outputs.Downtrend;
				stx.chart.context.textBaseline="bottom";
				var yh=stx.pixelFromPriceTransform(quotes[i].High, stx.chart.panel);
				for(var d=5;d<=45;d+=10) stx.chart.context.fillText("\u25BC", stx.pixelFromBar(i)-signalWidth, yh-d); // down arrow
			}else if(quotes[i-1]["Direction "+sd.name]<quotes[i]["Direction "+sd.name]){
				stx.chart.context.fillStyle=sd.outputs.Uptrend;
				stx.chart.context.textBaseline="top";
				var yl=stx.pixelFromPriceTransform(quotes[i].Low, stx.chart.panel);
				for(var u=5;u<=45;u+=10) stx.chart.context.fillText("\u25B2", stx.pixelFromBar(i)-signalWidth, yl+u); // up arrow
			}
		}
		stx.endClip();
	};

	CIQ.Studies.displayVWAP=function(stx, sd, quotes){
		if(sd.error) {
			stx.watermark(sd.panel,{h:"center",v:"top",text:stx.translateIf(sd.error),vOffset:50});
		}else{
			CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);
		}
	};

	CIQ.Studies.displayVsComparisonSymbol=function(stx, sd, quotes){
		if(!stx.panels[sd.panel].studyQuotes) {
			stx.watermark(sd.panel,"center","bottom",stx.translateIf(sd.libraryEntry.name+" Not Available"));
			return;
		}
		for(var c=quotes.length-1;c>=0;c--){
			if(quotes[c] && quotes[c][sd.inputs["Comparison Symbol"].toUpperCase()]){
				if(sd.libraryEntry.centerline || sd.libraryEntry.centerline===0){
					if(sd.outputs.Gain) CIQ.preparePeakValleyFill(stx,quotes,{panelName:sd.panel, band:"Result " + sd.name, threshold:sd.libraryEntry.centerline, direction:1, color:sd.outputs.Gain});
					if(sd.outputs.Loss) CIQ.preparePeakValleyFill(stx,quotes,{panelName:sd.panel, band:"Result " + sd.name, threshold:sd.libraryEntry.centerline, direction:-1, color:sd.outputs.Loss});
				}
				CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);
				return;
			}
		}
	};

	CIQ.Studies.displayMFI=function(stx, sd, quotes){
		var panel = stx.panels[sd.panel];
		panel.yAxis.min=0;
		//CIQ.Studies.determineMinMax(stx, sd, quotes);
		CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);

		var y=panel.yAxis.bottom;

		var myWidth=stx.layout.candleWidth-2;
		if(myWidth<2) myWidth=1;

		var green=sd.outputs.Green;
		var fade=sd.outputs.Fade;
		var fake=sd.outputs.Fake;
		var squat=sd.outputs.Squat;
		stx.canvasColor("stx_histogram");
		stx.chart.context.globalAlpha=1;
		stx.chart.context.fillStyle="#CCCCCC";
		stx.startClip(sd.panel);
		for(var i=0;i<quotes.length;i++){
			var quote=quotes[i];
			if(!quote || !quotes[i-1]) continue;
			if(i===0);
			else if(quotes[i-1][sd.name+"_hist"]<quote[sd.name+"_hist"]){
				if(quotes[i-1].Volume<quote.Volume) stx.chart.context.fillStyle=green;
				else if(quotes[i-1].Volume>quote.Volume) stx.chart.context.fillStyle=fake;
			}
			else if(quotes[i-1][sd.name+"_hist"]>quote[sd.name+"_hist"]){
				if(quotes[i-1].Volume<quote.Volume) stx.chart.context.fillStyle=squat;
				else if(quotes[i-1].Volume>quote.Volume) stx.chart.context.fillStyle=fade;
			}
			if(quote.candleWidth) myWidth=Math.floor(Math.max(1,quote.candleWidth-2));
			stx.chart.context.fillRect(Math.floor(stx.pixelFromBar(i, panel.chart)-myWidth/2),
					Math.floor(y),
					Math.floor(myWidth),
					Math.floor(stx.pixelFromPrice(quote[sd.name+"_hist"], panel)-y));
		}
		stx.endClip();
	};

	CIQ.Studies.displayAwesomeOscillator=function(stx, sd, quotes){
		CIQ.Studies.determineMinMax(stx, sd, quotes);
		var panel = stx.panels[sd.panel];
		panel.yAxis.low=panel.min=Math.min(0,panel.min);
		panel.yAxis.high=panel.max=Math.max(0,panel.max);
		CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);

		var y=stx.pixelFromPrice(0, panel);

		var myWidth=stx.layout.candleWidth-2;
		if(myWidth<2) myWidth=1;

		var upColor=sd.outputs["Increasing Bar"];
		var downColor=sd.outputs["Decreasing Bar"];
		stx.canvasColor("stx_histogram");
		stx.chart.context.globalAlpha=1;
		stx.chart.context.fillStyle="#CCCCCC";
		stx.startClip(sd.panel);
		for(var i=0;i<quotes.length;i++){
			var quote=quotes[i];
			if(!quote || !quotes[i-1]) continue;
			if(i===0);
			else if(quotes[i-1][sd.name+"_hist"]<quote[sd.name+"_hist"]) stx.chart.context.fillStyle=upColor;
			else if(quotes[i-1][sd.name+"_hist"]>quote[sd.name+"_hist"]) stx.chart.context.fillStyle=downColor;
			if(quote.candleWidth) myWidth=Math.floor(Math.max(1,quote.candleWidth-2));
			stx.chart.context.fillRect(Math.floor(stx.pixelFromBar(i, panel.chart)-myWidth/2),
					Math.floor(y),
					Math.floor(myWidth),
					Math.floor(stx.pixelFromPrice(quote[sd.name+"_hist"], panel)-y));
		}
		stx.endClip();
	};

	CIQ.Studies.displayGator=function(stx, sd, quotes){
		CIQ.Studies.determineMinMax(stx, sd, quotes);
		var panel = stx.panels[sd.panel];
		panel.yAxis.low=panel.min=Math.min(0,panel.min);
		panel.yAxis.high=panel.max=Math.max(0,panel.max);
		CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);

		var y=stx.pixelFromPrice(0, panel);

		var myWidth=stx.layout.candleWidth-2;
		if(myWidth<2) myWidth=1;

		var upColor=sd.outputs["Increasing Bar"];
		var downColor=sd.outputs["Decreasing Bar"];
		stx.canvasColor("stx_histogram");
		stx.chart.context.globalAlpha=1;
		stx.chart.context.fillStyle="#CCCCCC";
		stx.startClip(sd.panel);
		for(var i=1;i<quotes.length;i++){
			var quote=quotes[i];
			if(!quote || !quotes[i-1]) continue;
			for(var j=1;j<=2;j++){
				if(Math.abs(quotes[i-1][sd.name+"_hist"+j])<Math.abs(quote[sd.name+"_hist"+j])) stx.chart.context.fillStyle=upColor;
				else if(Math.abs(quotes[i-1][sd.name+"_hist"+j])>Math.abs(quote[sd.name+"_hist"+j])) stx.chart.context.fillStyle=downColor;
				if(quote.candleWidth) myWidth=Math.floor(Math.max(1,quote.candleWidth-2));
				stx.chart.context.fillRect(Math.floor(stx.pixelFromBar(i, panel.chart)-myWidth/2),
						Math.floor(y),
						Math.floor(myWidth),
						Math.floor(stx.pixelFromPrice(quote[sd.name+"_hist"+j], panel)-y));
			}
		}
		stx.endClip();
	};

	CIQ.Studies.displayElderImpulse=function(stx, sd, quotes){
		stx.chart.customChart={
			chartType: "colored_bar",
			colorFunction: function(stx, quote, mode){
				return quote["Result "+sd.name];
			}
		};
	};

	CIQ.Studies.displayPivotPoints=function(stx, sd, quotes){
		sd.libraryEntry.parameters.noSlopes=!sd.inputs.Continuous;
		CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);
		if(sd.inputs.Shading) {
			var params=CIQ.clone(sd.libraryEntry.parameters);
			CIQ.prepareChannelFill(stx,quotes,CIQ.extend(params,{panelName: sd.panel, topBand:"Resistance 3 " + sd.name, bottomBand:"Resistance 2 " + sd.name,color:sd.outputs["Resistance 3"]}));
			CIQ.prepareChannelFill(stx,quotes,CIQ.extend(params,{panelName: sd.panel, topBand:"Resistance 2 " + sd.name, bottomBand:"Resistance 1 " + sd.name,color:sd.outputs["Resistance 2"]}));
			CIQ.prepareChannelFill(stx,quotes,CIQ.extend(params,{panelName: sd.panel, topBand:"Resistance 1 " + sd.name, bottomBand:"Pivot " + sd.name,color:sd.outputs["Resistance 1"]}));
			CIQ.prepareChannelFill(stx,quotes,CIQ.extend(params,{panelName: sd.panel, topBand:"Support 1 " + sd.name, bottomBand:"Pivot " + sd.name,color:sd.outputs["Support 1"]}));
			CIQ.prepareChannelFill(stx,quotes,CIQ.extend(params,{panelName: sd.panel, topBand:"Support 2 " + sd.name, bottomBand:"Support 1 " + sd.name,color:sd.outputs["Support 2"]}));
			CIQ.prepareChannelFill(stx,quotes,CIQ.extend(params,{panelName: sd.panel, topBand:"Support 3 " + sd.name, bottomBand:"Support 2 " + sd.name,color:sd.outputs["Support 3"]}));
		}
	};

	CIQ.Studies.displayAlligator=function(stx, sd, quotes){
		function drawFractal(highLow,index){
			//stx.canvasFont("???");
			var y;
			if(highLow=="high") {
				stx.chart.context.fillStyle=stx.defaultColor;
				stx.chart.context.textBaseline="bottom";
				y=stx.pixelFromPriceTransform(quotes[index].High, stx.chart.panel);
				stx.chart.context.fillText("\u25B2", stx.pixelFromBar(i,stx.chart)-stx.chart.context.measureText("\u25B2").width/2+1, y-5); // up arrow
			}else if (highLow=="low") {
				stx.chart.context.fillStyle=stx.defaultColor;
				stx.chart.context.textBaseline="top";
				y=stx.pixelFromPriceTransform(quotes[index].Low, stx.chart.panel);
				stx.chart.context.fillText("\u25BC",stx.pixelFromBar(i,stx.chart)-stx.chart.context.measureText("\u25BC").width/2+1, y+5); // down arrow
			}
		}
		var panel = stx.panels[sd.panel];
		stx.startClip(sd.panel);
		CIQ.Studies.displayIndividualSeriesAsLine(stx, sd, panel, "Jaw "+sd.name, quotes);
		CIQ.Studies.displayIndividualSeriesAsLine(stx, sd, panel, "Lips "+sd.name, quotes);
		CIQ.Studies.displayIndividualSeriesAsLine(stx, sd, panel, "Teeth "+sd.name, quotes);
		if(sd.inputs["Show Fractals"]){
			for(var i=2;i<quotes.length-2;i++){
				if( quotes[i]){	
					if(quotes[i]["Fractal High "+sd.name]) drawFractal("high",i);
					if(quotes[i]["Fractal Low "+sd.name]) drawFractal("low",i);
				}
			}
		}
		stx.endClip();
	};

	CIQ.Studies.displayRainbowMA=function(stx, sd, quotes){
		var panel = stx.panels[sd.panel];
		stx.startClip(sd.panel);
		//just need to display in reverse order from outputMap
		for(var i=10;i>0;i--){
			CIQ.Studies.displayIndividualSeriesAsLine(stx, sd, panel, "SMA"+i+" "+sd.name, quotes);
		}
		stx.endClip();
	};

	CIQ.Studies.displayRainbowOsc=function(stx, sd, quotes){
		//CIQ.Studies.determineMinMax(stx, sd, quotes);
		var panel = stx.panels[sd.panel];
		panel.min=-100;
		panel.max=100;
		panel.yAxis.low=panel.min=Math.min(0,panel.min);
		panel.yAxis.high=panel.max=Math.max(0,panel.max);
		stx.startClip(sd.panel);
		CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);

		var y=stx.pixelFromPrice(0, panel);
		stx.chart.context.strokeStyle="transparent";
		stx.plotLineChart(panel, quotes, "Zero "+sd.name, {skipTransform:true, label:false});

		var upColor=sd.outputs["Positive Bar"];
		stx.chart.context.strokeStyle=upColor;
		stx.plotLineChart(panel, quotes, "Over "+sd.name, {skipTransform:true, label:false});

		var upgradient=stx.chart.context.createLinearGradient(0,y,0,panel.yAxis.top);
		upgradient.addColorStop(0, stx.containerColor);
		upgradient.addColorStop(1, upColor);
		CIQ.prepareChannelFill(stx,quotes,{"color":upgradient,"opacity":1,"panelName":sd.name,"topBand":"Over "+sd.name,"bottomBand":"Zero "+sd.name});

		var downColor=sd.outputs["Negative Bar"];
		stx.chart.context.strokeStyle=downColor;
	    stx.plotLineChart(panel, quotes, "Under "+sd.name, {skipTransform:true, label:false});

	    var dngradient=stx.chart.context.createLinearGradient(0,y,0,panel.yAxis.bottom);
		dngradient.addColorStop(0, stx.containerColor);
		dngradient.addColorStop(1, downColor);
		CIQ.prepareChannelFill(stx,quotes,{"color":dngradient,"opacity":1,"panelName":sd.name,"topBand":"Zero "+sd.name,"bottomBand":"Under "+sd.name});

		var myWidth=stx.layout.candleWidth-2;
		if(myWidth<2) myWidth=1;

		stx.canvasColor("stx_histogram");
	    stx.chart.context.globalAlpha=1;
		stx.chart.context.fillStyle="#CCCCCC";
		for(var i=0;i<quotes.length;i++){
			var quote=quotes[i];
			if(!quote) continue;
			if(quote[sd.name+"_hist"]>0) stx.chart.context.fillStyle=upColor;
			else if(quote[sd.name+"_hist"]<0) stx.chart.context.fillStyle=downColor;
			if(quote.candleWidth) myWidth=Math.floor(Math.max(1,quote.candleWidth-2));
			stx.chart.context.fillRect(Math.floor(stx.pixelFromBar(i, panel.chart)-myWidth/2),
					Math.floor(y),
					Math.floor(myWidth),
					Math.floor(stx.pixelFromPrice(quote[sd.name+"_hist"], panel)-y));
		}
		stx.endClip();
	};
	
	CIQ.Studies.displayZigZag=function(stx, sd, quotes){
		if(quotes[0] && quotes[0]["ShadowResult "+sd.name]) quotes[0]["Result "+sd.name]=quotes[0]["ShadowResult "+sd.name];
		if(quotes[quotes.length-1] && quotes[quotes.length-1]["ShadowResult "+sd.name]) quotes[quotes.length-1]["Result "+sd.name]=quotes[quotes.length-1]["ShadowResult "+sd.name];
		CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);
		if(quotes[0] && quotes[0]["ShadowResult "+sd.name]) delete quotes[0]["Result "+sd.name];
		if(quotes[quotes.length-1] && quotes[quotes.length-1]["ShadowResult "+sd.name]) delete quotes[quotes.length-1]["Result "+sd.name];
	};


	/**
	 * Creates a volume profile underlay for the chart. The underlay is always 25% of the width of the chart.
	 * The color is determined by the 'sd.outputs["Bars Color"]' parameter and opacity and border colors can be controlled with the class stx_volume_profile
	 */

	CIQ.Studies.displayVolumeProfile=function(stx, sd, quotes){
		if(!stx || !stx.chart.dataSet) return;

		var chart = stx.chart;

		//decide how many bars
		if(!sd.study.parameters.numberOfBars) sd.study.parameters.numberOfBars = 30;
		var interval = (chart.highValue-chart.lowValue)/sd.study.parameters.numberOfBars;
		if(interval===0) return;
		var priceVolArry = [];

		// set the boundries for the bars -- add .1 to the loop to account for possible roundig errors.
		for(var j=chart.lowValue;j<chart.highValue+0.1;j+=interval){
			priceVolArry.push([j, 0]);
		}

		if (priceVolArry.length <2) {	// need at least 2 price data points to draw boxes
			stx.watermark("chart","center","top",stx.translateIf("Not enough data to render the Volume Profile"));
			return;
		}

		var volumeMax=0; 	// this is the maximum volume after we group them by the bars we will draw
		for(var i=0;i<quotes.length;i++){
			var prices=quotes[i];
			if(!prices) continue;
			var bottomRange = priceVolArry[0][0];
			var topRange = 0;
			for(var x=1;x<priceVolArry.length;x++){
				topRange= priceVolArry[x][0];
				if(
					(prices.Low >= bottomRange && prices.Low <= topRange) ||
					(prices.Low < bottomRange && prices.High > topRange) ||
					(prices.High >= bottomRange && prices.High <= topRange)
				){
					priceVolArry[x][1]+=prices.Volume;
					if(priceVolArry[x][1]>volumeMax) volumeMax=priceVolArry[x][1];
				}
				bottomRange = topRange;
			}
		}
		if(volumeMax===0){
			stx.watermark("chart","center","top",stx.translateIf("Not enough data to render the Volume Profile"));
			return;
		}


		stx.setStyle("stx_volume_profile","color",sd.outputs["Bars Color"]);
		var context=chart.context;
		var fontstyle="stx-float-date";
		stx.canvasFont(fontstyle, context);
		var txtHeight=stx.getCanvasFontSize(fontstyle);
		var panel = chart.panel;
		var chartBottom = panel.yAxis.bottom;
		var barBottom=Math.round(chart.width)-0.5;  //bottom x coordinate for the bar  -- remember bars are sideways so the bottom is on the x axis
		var bartop=0; // x axis location for the top of the bar
		var barMaxHeight=(chart.width)*sd.study.parameters.widthPercentage;  // pixels for highest bar
		var borderColor=stx.canvasStyle("stx_volume_profile").borderColor;
		var bordersOn=(!CIQ.isTransparent(stx.canvasStyle("stx_volume_profile").borderColor)) && sd.study.parameters.displayBorder;

		var self=stx;

		function drawBars(volumeProfileClass, borders){
			if(!borders) barBottom-=2;
		    self.canvasColor(volumeProfileClass);
		    if(CIQ.isIE8) context.globalAlpha=0.5;
			context.beginPath();
			var bottomRange = priceVolArry[0][0];
			var prevTop=barBottom;
			for(var i=1;i<priceVolArry.length;i++){
				if (priceVolArry[i][1]) {
					barTop =Math.round(barBottom-(priceVolArry[i][1]*barMaxHeight/volumeMax))-0.5;
					bottomRangePixel=Math.round(self.pixelFromPrice(bottomRange, panel))+0.5;
					topRangePixel = Math.round(self.pixelFromPrice(priceVolArry[i][0], panel))+0.5;

					if(!borders){
						bottomRangePixel-=0.5;
						topRangePixel+=0.5;
						barTop+=0.5;
					}

					if ( bottomRangePixel > chartBottom ) bottomRangePixel=chartBottom;
					if ( topRangePixel < chartBottom ) {
						context.moveTo(barBottom, bottomRangePixel);
						context.lineTo(barBottom, topRangePixel);
						context.lineTo(barTop, topRangePixel);
						context.lineTo(barTop,bottomRangePixel);
						if(borders){
							if(prevTop>barTop || i==1) context.lineTo(prevTop, bottomRangePixel); // draw down to the top of the previous bar, so that we don't overlap strokes
						}else{
							context.lineTo(barBottom,bottomRangePixel);
							if ( sd.study.parameters.displayVolume ) {
								//write the volume on the bar **/
								var txt = CIQ.condenseInt(priceVolArry[i][1]);
								var barHeight= bottomRangePixel-topRangePixel;
								if( txtHeight <= barHeight-2) {
									var width;
									try{
										width=context.measureText(txt).width;
									}catch(e){ width=0;} // Firefox doesn't like this in hidden iframe
									context.textBaseline="top";
									var tmpcolor = context.fillStyle;
									context.fillStyle=borderColor;
									context.fillText(txt, barTop-width-3,topRangePixel+(barHeight/2-txtHeight/2));
									context.fillStyle=tmpcolor;
								}
							}
						}
					}
					prevTop=barTop;
				} else {
					prevTop=barBottom; // there will be a missing bar here so the border needs to once again go to the end
				}
				bottomRange = priceVolArry[i][0];
			}
			if(!borders) context.fill();
			context.strokeStyle = borderColor;
			if(borders) context.stroke();
			context.closePath();
		}

	    drawBars("stx_volume_profile", false);
	    if(bordersOn){
		    drawBars("stx_volume_profile", true);
		}

		context.globalAlpha=1;
	};

	CIQ.Studies.studyLibrary=CIQ.extend(CIQ.Studies.studyLibrary,{
		"correl": {
			"name": "Correlation Coefficient",
			"range": "-1 to 1",
			"calculateFN":  CIQ.Studies.calculateCorrelationCoefficient,
			"seriesFN":  CIQ.Studies.displayCorrelationCoefficient,
			"outputs": {}
		},
		"PMO": {
			"name": "Price Momentum Oscillator",
			"calculateFN": CIQ.Studies.calculatePMO,
			"inputs": {"Field":"field","Smoothing Period":35,"Double Smoothing Period":20,"Signal Period":10},
			"outputs": {"PMO":"auto","PMOSignal":"#FF0000"},
			"parameters": {
				template:"studyOverZones",
				init:{studyOverZonesEnabled:true, studyOverBoughtValue:2.5, studyOverBoughtColor:"auto", studyOverSoldValue:-2.5, studyOverSoldColor:"auto"}
			},
			"attributes":{
				studyOverBoughtValue:{"min":0,"step":"0.05"},
				studyOverSoldValue:{"max":0,"step":"0.05"}
			}
		},
		"Rel Vol": {
			"name": "Relative Volatility",
			"range": "0 to 100",
			"calculateFN": CIQ.Studies.calculateRelativeVolatility,
			"inputs": {"Field":"field", "STD Period":10, "Smoothing Period":14},
			"outputs":{"Rel Vol":"auto"},
			"centerline": 50,
			"parameters": {
				template:"studyOverZones",
				init:{studyOverZonesEnabled:true, studyOverBoughtValue:70, studyOverBoughtColor:"auto", studyOverSoldValue:30, studyOverSoldColor:"auto"}
			}
		},
		"Awesome": {
			"name": "Awesome Oscillator",
			"seriesFN": CIQ.Studies.displayAwesomeOscillator,
			"calculateFN": CIQ.Studies.calculateAwesomeOscillator,
			"inputs": {},
			"outputs": {"Increasing Bar":"#00DD00", "Decreasing Bar":"#FF0000"}
		},
		"W MFI": {
			"name": "Market Facilitation Index",
			"seriesFN": CIQ.Studies.displayMFI,
			"calculateFN": CIQ.Studies.calculateMFI,
			"yAxis": {"ground":true},
			"range": "0 to max",
			"inputs": {},
			"outputs": {"Green":"#8bc176", "Fade":"#ab611f", "Fake":"#5f7cb8", "Squat":"#ffd0cf"}
		},
		"ATR Bands": {
			"name": "ATR Bands",
			"overlay": true,
			"seriesFN": CIQ.Studies.displayChannel,
			"calculateFN": CIQ.Studies.calculateATRBands,
			"inputs": {"Period":5, "Shift": 3, "Field":"field", "Channel Fill":true},
			"outputs": {"ATR Bands Top":"auto", "ATR Bands Bottom":"auto", "ATR Bands Channel":"auto"},
			"attributes":{
				Shift:{min:0.1,step:0.1}
			}
		},
		"STARC Bands": {
			"name": "STARC Bands",
			"overlay": true,
			"seriesFN": CIQ.Studies.displayChannel,
			"calculateFN": CIQ.Studies.calculateSTARCBands,
			"inputs": {"Period":15, "MA Period":5, "Multiplier": 1.3, "Channel Fill":true},
			"outputs": {"STARC Bands Top":"auto", "STARC Bands Median":"auto", "STARC Bands Bottom":"auto"},
			"attributes":{
				Multiplier: {min:0.1,step:0.1}
			}
		},
		"ATR Trailing Stop": {
			"name": "ATR Trailing Stops",
			"overlay": true,
			"seriesFN": CIQ.Studies.displayPSAR2,
			"calculateFN": CIQ.Studies.calculateATRStops,
			"inputs": {"Multiplier":3, "Period":21, "Plot Type":["points","squarewave"], "HighLow":false},
			"outputs": {"Buy Stops":"#FF0000", "Sell Stops":"#00FF00"},
			"attributes":{
				Multiplier: {min:0.1,step:0.1}
			}
		},
		"Boll %b": {
			"name": "Bollinger %b",
			"calculateFN": CIQ.Studies.calculateBollinger,
			"inputs": {"Field":"field", "Period":20, "Standard Deviations": 2, "Moving Average Type":"ma"},
			"outputs": {"%b":"auto"},
			"parameters": {
				template:"studyOverZones",
				init:{studyOverZonesEnabled:true, studyOverBoughtValue:100, studyOverBoughtColor:"auto", studyOverSoldValue:0, studyOverSoldColor:"auto"}
			},
			"attributes": {
				"Standard Deviations":{min:0.1,step:0.1}
			}
		},
		"Boll BW": {
			"name": "Bollinger Bandwidth",
			"calculateFN": CIQ.Studies.calculateBollinger,
			"inputs": {"Field":"field", "Period":20, "Standard Deviations": 2, "Moving Average Type":"ma"},
			"outputs": {"Bandwidth":"auto"},
			"attributes": {
				"Standard Deviations":{min:0.1,step:0.1}
			}
		},
		"Donchian Width": {
			"name": "",
			"calculateFN": CIQ.Studies.calculateMaxHighMinLow,
			"inputs": {"High Period":20, "Low Period":20},
		},
		"Rel Vig": {
			"name": "Relative Vigor Index",
			"seriesFN": CIQ.Studies.displayHistogramWithSeries,
			"calculateFN": CIQ.Studies.calculateRelativeVigor,
			"inputs": {"Period":10},
			"outputs": {"Rel Vig":"auto", "RelVigSignal":"#FF0000", "Increasing Bar":"#00DD00", "Decreasing Bar":"#FF0000"}
		},
		"Elder Impulse": {
			"name": "Elder Impulse System",
			"calculateFN": CIQ.Studies.calculateElderImpulse,
			"seriesFN": CIQ.Studies.displayElderImpulse,
			"customRemoval": true,
			"underlay": true,
			"inputs": {},
			"outputs": {"Bullish":"#8BC176", "Bearish":"#DD3E39", "Neutral":"#5F7CB8"},
			"removeFN": function(stx, sd){
				stx.chart.customChart=null;
			}
		},
		"Pivot Points": {
			"name": "Pivot Points",
			"overlay": true,
			"seriesFN": CIQ.Studies.displayPivotPoints,
			"calculateFN": CIQ.Studies.calculatePivotPoints,
			"inputs": {"Type":["standard","fibonacci"], "Continuous":false, "Shading":false},
			"outputs":{"Pivot":"auto","Resistance 1":"rgb(184,44,11)","Support 1":"rgb(105,145,88)","Resistance 2":"rgb(227,100,96)","Support 2":"rgb(179,217,135)","Resistance 3":"rgb(255,208,207)","Support 3":"rgb(211,232,174)"},
			"parameters": {
				noSlopes: true,
				opacity: 0.2
			}
		},
		"VWAP": {
			"name": "VWAP",
			"overlay": true,
			"seriesFN": CIQ.Studies.displayVWAP,
			"calculateFN": CIQ.Studies.calculateVWAP,
			"inputs": {},
			"outputs": {"VWAP":"#FF0000"}
		},
		"Alligator": {
			"name": "Alligator",
		    "overlay": true,
			"seriesFN": CIQ.Studies.displayAlligator,
			"calculateFN": CIQ.Studies.calculateAlligator,
			"inputs":{"Jaw Period":13, "Jaw Offset":8, "Teeth Period":8, "Teeth Offset":5, "Lips Period":5, "Lips Offset":3, "Show Fractals":false},
			"outputs":{"Jaw":"#0000FF", "Teeth":"#FF0000", "Lips":"#00DD00"}

		},
		"Gator": {
			"name": "Gator Oscillator",
			"seriesFN": CIQ.Studies.displayGator,
			"calculateFN": CIQ.Studies.calculateAlligator,
			"inputs":{"Jaw Period":13, "Jaw Offset":8, "Teeth Period":8, "Teeth Offset":5, "Lips Period":5, "Lips Offset":3},
			"outputs": {"Increasing Bar":"#00DD00", "Decreasing Bar":"#FF0000"},
			"centerline": 0
		},
		"Ichimoku Clouds": {
			"name": "Ichimoku Clouds",
		    "overlay": true,
		    "range": "bypass",
		    "calculateFN": CIQ.Studies.calculateIchimoku,
		    "seriesFN": CIQ.Studies.displayIchimoku,
		    "inputs": {"Conversion Line Period":9, "Base Line Period": 26, "Leading Span B Period":52, "Lagging Span Period":26},
		    "outputs": {"Conversion Line":"#0000FF", "Base Line":"#FF0000", "Leading Span A":"#00FF00", "Leading Span B":"#FF0000", "Lagging Span":"#808000"}
		},
		"P Rel": {
			"name": "Price Relative",
		    "seriesFN": CIQ.Studies.displayVsComparisonSymbol,
		    "calculateFN": CIQ.Studies.calculatePriceRelative,
		    "inputs": {"Comparison Symbol":"SPY"},
		    "deferUpdate": true
		},
		"Perf Idx": {
			"name": "Performance Index",
			"centerline": 1,
		    "seriesFN": CIQ.Studies.displayVsComparisonSymbol,
			"calculateFN": CIQ.Studies.calculatePerformance,
			"inputs": {"Period":120, "Comparison Symbol":"SPY"},
			"outputs": {"Result":"auto", "Gain":"#00DD00", "Loss":"#FF0000"},
		    "deferUpdate": true
		},
		"Beta": {
			"name": "Beta",
			"centerline": 1,
		    "seriesFN": CIQ.Studies.displayVsComparisonSymbol,
			"calculateFN": CIQ.Studies.calculateBeta,
			"inputs": {"Period":20, "Comparison Symbol":"SPY"},
		    "deferUpdate": true
		},
		"Ulcer": {
			"name": "Ulcer Index",
		    "calculateFN": CIQ.Studies.calculateUlcerIndex,
		    "inputs": {"Field":"field", "Period":14}
		},
		"Bal Pwr": {
			"name": "Balance of Power",
			"range": "-1 to 1",
			"calculateFN": CIQ.Studies.calculateBalanceOfPower,
			"inputs": {"Period":14, "Moving Average Type":"ma"}
		},
		"Trend Int": {
			"name": "Trend Intensity Index",
		    "calculateFN": CIQ.Studies.calculateTrendIntensity,
		    "range": "0 to 100",
			"inputs": {"Field":"field", "Period":14, "Signal Period":9},
			"outputs":{"TII":"auto", "Signal":"#FF0000"},
			"parameters": {
				template:"studyOverZones",
				init:{studyOverZonesEnabled:true, studyOverBoughtValue:80, studyOverBoughtColor:"auto", studyOverSoldValue:20, studyOverSoldColor:"auto"}
			}
		},
		"Choppiness": {
			"name": "Choppiness Index",
		    "calculateFN": CIQ.Studies.calculateChoppiness,
		    "centerline": 50,
			"parameters": {
				template:"studyOverZones",
				init:{studyOverZonesEnabled:true, studyOverBoughtValue:61.8, studyOverBoughtColor:"auto", studyOverSoldValue:38.2, studyOverSoldColor:"auto"}
			},
			"attributes":{
				studyOverBoughtValue:{"min":50,"step":"0.1"},
				studyOverSoldValue:{"max":50,"step":"0.1"}
			}
		},
		"Disparity": {
			"name": "Disparity Index",
		    "calculateFN": CIQ.Studies.calculateDisparity,
		    "inputs": {"Field":"field", "Period":14, "Moving Average Type":"ma"}
		},
		"Rainbow MA": {
			"name": "Rainbow Moving Average",
			"overlay": true,
		    "calculateFN": CIQ.Studies.calculateRainbow,
		    "seriesFN": CIQ.Studies.displayRainbowMA,
		    "inputs": {"Field":"field", "Period":2, "Underlay": false},
			"outputs": {"SMA1":"#FF0000", "SMA2":"#FF7F00", "SMA3":"#FFFF00", "SMA4":"#7FFF00", "SMA5":"#00FF7F", "SMA6":"#00FFFF", "SMA7":"#007FFF", "SMA8":"#0000FF", "SMA9":"#7F00FF", "SMA10":"#FF00FF"}
		},
		"Rainbow Osc": {
			"name": "Rainbow Oscillator",
		    "calculateFN": CIQ.Studies.calculateRainbow,
		    "seriesFN": CIQ.Studies.displayRainbowOsc,
		    "inputs": {"Field":"field", "Period":2, "HHV/LLV Lookback":10},
			"outputs": {"Positive Bar":"#00DD00", "Negative Bar":"#FF0000"}
		},
		"Pring KST": {
			"name": "Pring's Know Sure Thing",
		    "calculateFN": CIQ.Studies.calculateKST,
		    "inputs": {"Field":"field", "Lightest Rate of Change Period":10, "Lightest SMA Period":10, "Light Rate of Change Period":15, "Light SMA Period":10, "Heavy Rate of Change Period":20, "Heavy SMA Period":10, "Heaviest Rate of Change Period":30, "Heaviest SMA Period":15, "Signal Period":9},
			"outputs": {"KST":"#00DD00", "KSTSignal":"#FF0000"}
		},
		"Pring Sp-K": {
			"name": "Pring's Special K",
		    "calculateFN": CIQ.Studies.calculateSpecialK,
		    "inputs": {"Field":"field", "Interval":["daily","weekly"]}
		},
		"Darvas": {
			"name": "Darvas Box",
			"underlay": true,
			"calculateFN": CIQ.Studies.calculateDarvas,
			"seriesFN": CIQ.Studies.displayDarvas,
			"inputs": {"All-Time High Lookback Period":100, "Exit Field":["close","high/low"], "Ghost Boxes":true, "Stop Levels": false, "Level Offset":0.01, "Price Minimum": 5, "Volume Spike":false, "Volume % of Avg":400},
			"outputs": {"Darvas":"#5F7CB8", "Ghost":"#699158", "Levels":"auto"},
			"customRemoval": true,
			"attributes": {
				"Price Minimum":{min:0.01,step:0.01}
			}
		},
		"Supertrend": {
			"name": "Supertrend",
			"overlay": true,
			"seriesFN": CIQ.Studies.displaySupertrend,
			"calculateFN": CIQ.Studies.calculateSupertrend,
			"inputs": {"Period":7, "Multiplier": 3},
			"outputs": {"Uptrend":"#8cc176", "Downtrend":"#b82c0c"},
			"attributes":{
				Multiplier: {min:0.1,step:0.1}
			}
		},
		"vol profile": {
			"name": "Volume Profile",
			"overlay": true,
		    "seriesFN": CIQ.Studies.displayVolumeProfile,
		    "calculateFN": null,
		    "inputs": {},
		    "outputs": {"Bars Color":"#b64a96"},
			"customRemoval": true,
		    "parameters": {
		    	"displayBorder": true,
		    	"displayVolume" : false,
		    	"numberOfBars" : 30,
		    	"widthPercentage": 0.25
			}
		},
		"Vortex": {
			"name": "Vortex Indicator",
			"calculateFN": CIQ.Studies.calculateVortex,
			"centerline":1,
			"outputs": {"+VI":"#00FF00", "-VI":"#FF0000"},
			"parameters": {
				template:"studyOverZones",
				init:{studyOverZonesEnabled:true, studyOverBoughtValue:1.1, studyOverBoughtColor:"auto", studyOverSoldValue:0.9, studyOverSoldColor:"auto"}
			},
			"attributes":{
				studyOverBoughtValue:{"min":1,"step":"0.01"},
				studyOverSoldValue:{"max":1,"step":"0.01"}
			}
		},
		"ZigZag": {
			"name": "ZigZag",
			"overlay": true,
			"seriesFN": CIQ.Studies.displayZigZag,
			"calculateFN": CIQ.Studies.calculateZigZag,
			"inputs": {"Distance(%)": 10},
			"parameters":{
				noLabels:true
			},
			"attributes":{
				"Distance(%)": {min:0.1,step:0.1}
			}
		},
		"PSY": {
			"name": "Psychological Line",
			"range": "0 to 100",
			"calculateFN": CIQ.Studies.calculatePsychologicalLine,
			"inputs": {"Period": 20},

		},
		"MA Dev": {
			"name": "Moving Average Deviation",
			"calculateFN": CIQ.Studies.calculateMADev,
			"seriesFN": CIQ.Studies.displayHistogramWithSeries,
			"inputs": {"Field":"field","Period":12,"Moving Average Type":"ma","Points Or Percent":["Points","Percent"]},
			"outputs":{"Increasing Bar":"#00DD00", "Decreasing Bar":"#FF0000"}
		},
		"Shinohara": {
			"name": "Shinohara Intensity Ratio",
			"calculateFN": CIQ.Studies.calculateShinohara,
			"inputs": {"Period":26},
			"outputs":{"Strong Ratio":"#E99B54", "Weak Ratio":"#5F7CB8"}
		}
	});

	return _exports;
});