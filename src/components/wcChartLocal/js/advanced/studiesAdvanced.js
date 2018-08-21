//-------------------------------------------------------------------------------------------
// Copyright 2012-2017 by ChartIQ, Inc.
// All rights reserved
//-------------------------------------------------------------------------------------------
(function(_exports){
	var CIQ=_exports.CIQ;

	/**
	 * Calculate "val lines" study. This study does all calculations on the {studyDescriptor.chart.dataSegment}.
	 *
	 * @param {CIQ.ChartEngine} stx A chart engine instance
	 * @param {studyDescriptor} sd A study descriptor
	 * @param {Object[]} quotes the dataSegment
	 * @memberof CIQ.Studies
	 */
	CIQ.Studies.calculateValuationLines=function(stx, sd, quotes) {
		var field = sd.inputs.Field == 'field' ? 'Close' : sd.inputs.Field;
		var averageType = sd.inputs['Average Type'];
		var displayAvg = sd.inputs['Display Average'];
		var displayS1 = sd.inputs['Display 1 Standard Deviation (1\u03C3)'];
		var displayS2 = sd.inputs['Display 2 Standard Deviation (2\u03C3)'];
		var displayS3 = sd.inputs['Display 3 Standard Deviation (3\u03C3)'];
		var values = [];

		for (var i = 0; i < quotes.length; ++i) {
			if (quotes[i]) values.push(quotes[i][field]);
		}

		var average = (function(nums, type) {
			var len = nums.length;
			var numerator = 0,
				denominator = 0,
				i = 0;

			switch (type) {
			case 'mean':
				denominator = len;
				for (; i < len; ++i) {
					numerator += nums[i];
				}
				break;
			case 'harmonic':
				numerator = len;
				for (; i < len; ++i) {
					denominator += 1 / nums[i];
				}
				break;
			case 'median':
				var middle = Math.floor(len / 2);
				var sorted = nums.slice().sort(function(a, b) {
					if (a > b) return 1;
					if (a < b) return -1;
					return 0;
				});

				if (len % 1 === 0) {
					numerator = sorted[middle] + sorted[middle - 1];
					denominator = 2;
				} else {
					numerator = sorted[middle];
					denominator = 1;
				}
				break;
			}

			return numerator / denominator;
		})(values, averageType);

		// logic skips the calculation if none of the stddev lines are displaying
		var stddev = !(displayS1 || displayS2 || displayS3) || (function(nums, baseline) {
			var len = nums.length;
			var numerator = 0;

			for (var i = 0; i < len; ++i) {
				numerator += Math.pow(nums[i] - baseline, 2);
			}

			return Math.sqrt(numerator / len);
		})(values, average);

		sd.data = {
			Average: displayAvg ? [average] : null,
			'1 Standard Deviation (1\u03C3)': displayS1 ? [average + stddev, average - stddev] : null,
			'2 Standard Deviation (2\u03C3)': displayS2 ? [average + stddev * 2, average - stddev * 2] : null,
			'3 Standard Deviation (3\u03C3)': displayS3 ? [average + stddev * 3, average - stddev * 3] : null
		};

		var padding=stddev;
		if(!sd.parameters) sd.parameters={};
		if(displayS3) sd.parameters.range=[(average - stddev*3)-padding, (average + stddev*3)+padding];
		else if(displayS2) sd.parameters.range=[(average - stddev*2)-padding, (average + stddev*2)+padding];
		else if(displayS1) sd.parameters.range=[(average - stddev)-padding, (average + stddev)+padding];
		else if(displayAvg) sd.parameters.range=[average-padding, average+padding];
		if(sd.panel){
			var panel=stx.panels[sd.panel];
			var yAxis=stx.getYAxisByName(panel,sd.name);
			if(yAxis){
				yAxis.decimalPlaces=panel.chart.yAxis.printDecimalPlaces;
				var parameters={yAxis:yAxis};
				stx.calculateYAxisRange(panel, yAxis, sd.parameters.range[0], sd.parameters.range[1]);
				stx.createYAxis(panel, parameters);
				stx.drawYAxis(panel, parameters);
			}
		}
	};

	/**
	 * Display "val lines" study.
	 *
	 * It is possible to change how the lines appear with CSS styling.
	 * ** Example: **
	 * .ciq-valuation-average-line {
	 *   border-style: solid;
	 *   border-width: 1.2px;
	 *   opacity: 0.95;
	 * }
	 * .ciq-valuation-deviation-line {
	 *   border-style: dotted;
	 *   border-width: 1px;
	 *   opacity: 0.80;
	 * }
	 *
	 * These values are used to create the params argument for {CIQ.ChartEngine#plotLine}.
	 *  - "border-style" -> "pattern"
	 *  - "border-width" -> "lineWidth"
	 *  - "opacity" -> "opacity"
	 *
	 * Average line defaults to {pattern: 'solid', lineWidth: 1, opacity: 1}
	 * Deviation lines default to {pattern: 'dashed', lineWidth: 1, opacity: 1}
	 *
	 * Suggested that whitespace be set from about 60 to 90 pixels so that the labels are
	 * clearly visible in the home position.
	 *
	 * @example
	 * var stxx = new CIQ.ChartEngine({container: $$$('.chartContainer'), preferences: {whitespace: 60.5}});
	 *
	 * Alternatively, you can use yAxis labels by setting the labels parameter to "yaxis" in the studyLibrary entry.
	 *
	 * @example
	 * CIQ.Studies.studyLibrary['val lines'].parameters = {labels: 'yaxis'};
	 *
	 * @param {CIQ.ChartEngine} stx The chart object
	 * @param {studyDescriptor} sd The study descriptor
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.displayValuationLines=function(stx, sd) {
		var panel = stx.panels[sd.panel];
		var yAxis=stx.getYAxisByName(panel, sd.name);
		var context = sd.chart.context;
		var data = sd.data;
		var labels = sd.parameters.labels;
		var averageType = sd.inputs["Average Type"];
		var averageLabels = {'mean':'AVG','median':'MED','harmonic':'HAVG'};
		var averageStyle = stx.canvasStyle('ciq-valuation-average-line');
		var deviationStyle = stx.canvasStyle('ciq-valuation-deviation-line');
		var textPadding = 3; // padding top, right, and bottom
		var textHeight = stx.getCanvasFontSize('stx_yaxis') + textPadding * 2;
		var isAvg, color, value, i, price, y, text, textWidth, plotLineParams;

		for (var key in data) {
			if (!data[key]) continue;

			isAvg = key == 'Average';
			color = CIQ.Studies.determineColor(sd.outputs[key]);
			value = data[key];

			for (i = 0; i < value.length; ++i) {
				price = value[i];
				y = stx.pixelFromPrice(price, panel, yAxis);

				if (y <= panel.top || y >= panel.yAxis.bottom) continue;

				plotLineParams = isAvg ? {
					pattern: averageStyle.borderStyle != 'none' ? averageStyle.borderStyle || 'solid' : 'solid',
					lineWidth: parseFloat(averageStyle.borderWidth) || 1,
					opacity: parseFloat(averageStyle.opacity) || 1,
					yAxis: yAxis
				} : {
					pattern: deviationStyle.borderStyle != 'none' ? deviationStyle.borderStyle || 'dashed' : 'dashed',
					lineWidth: parseFloat(deviationStyle.borderWidth) || 1,
					opacity: parseFloat(deviationStyle.opacity) || 1,
					yAxis: yAxis
				};

				stx.plotLine(panel.left, panel.right, y, y, color, 'line', context, panel, plotLineParams);

				if (labels === 'yaxis') {
					stx.createYAxisLabel(panel, stx.formatYAxisPrice(price, panel), y, color, null, context, yAxis);
					continue;
				}

				// additional Y padding to prevent line from overlapping text
				y += Math.floor(plotLineParams.lineWidth / 2);

				if (y + textHeight >= panel.yAxis.bottom) continue;

				text = (isAvg ? averageLabels[averageType] + ': ' : key[0] + '\u03C3: ') + stx.formatYAxisPrice(price, panel);
				textWidth = context.measureText(text).width;
				
				var position=panel.right - textWidth - textPadding;
				if(yAxis && yAxis.position=="left") position=panel.left + textPadding;

				context.strokeText(text, position, y + textHeight / 2 + 0.5);
			}
		}
	};

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
		if(quotes.length<period+1){
			sd.error=true;
			return;
		}
		//var base=stx.chart.symbol;
		sd.compare=sd.inputs["Compare To"];
		if(!sd.compare){
			sd.compare=[];
			sd.outputs={};
			sd.outputMap={};
			for(var s in stx.chart.series){
				var series=stx.chart.series[s];
				if(series.parameters.color) {
					sd.compare.push(series.display);
					sd.outputs["Result " + series.display]=series.parameters.color;
					sd.outputMap["Result " + series.display + " " +sd.name]="Result " + series.display;
				}
			}
		}
		if(!sd.compare.length) {
			sd.error="Correlation Coefficient requires at least one comparison symbol";
			return;
		}
		for(var sym=0;sym<sd.compare.length;sym++){
			var sB=0;
			var sC=0;
			var sB2=0;
			var sC2=0;
			var sBC=0;
			var thisCompare=sd.compare[sym];
			var iters=0;
			for(var i=sd.startFrom-period;i<quotes.length;i++){  //last tick has no compare data
				if(!quotes[i]) continue;
				var comparisonQuote=quotes[i][thisCompare];
				if(comparisonQuote && typeof(comparisonQuote)=="object") comparisonQuote=comparisonQuote.Close;
				if(!comparisonQuote && comparisonQuote!==0) {
					if(i>0 && quotes[i-1] && quotes[i-1]["_temps "+sd.name].c) comparisonQuote=quotes[i-1]["_temps "+sd.name].c;
					else comparisonQuote=0;
				}
				if(comparisonQuote && typeof(comparisonQuote)=="object") comparisonQuote=comparisonQuote.Close;
				quotes[i]["_temps "+sd.name]={};
				sB+=quotes[i]["_temps "+sd.name].b=quotes[i].Close;
				sC+=quotes[i]["_temps "+sd.name].c=comparisonQuote;
				sB2+=quotes[i]["_temps "+sd.name].b2=Math.pow(quotes[i].Close,2);
				sC2+=quotes[i]["_temps "+sd.name].c2=Math.pow(comparisonQuote,2);
				sBC+=quotes[i]["_temps "+sd.name].bc=quotes[i].Close*comparisonQuote;
				if(iters>=period){
					sB-=quotes[i-period]["_temps "+sd.name].b;
					sC-=quotes[i-period]["_temps "+sd.name].c;
					sB2-=quotes[i-period]["_temps "+sd.name].b2;
					sC2-=quotes[i-period]["_temps "+sd.name].c2;
					sBC-=quotes[i-period]["_temps "+sd.name].bc;

					var vb=sB2/period-Math.pow(sB/period,2);
					var vc=sC2/period-Math.pow(sC/period,2);
					var cv=sBC/period-sB*sC/Math.pow(period,2);
					var cc=cv/Math.sqrt(vb*vc);
					quotes[i]["Result " + thisCompare + " " + sd.name] = cc;
				}
				iters++;
			}
		}
	};

	CIQ.Studies.prettify=CIQ.extend({
		"2-exponential":"dema",
		"3-exponential":"tema",
		"hull":"hma"
	},CIQ.Studies.prettify);

	CIQ.extend(CIQ.Studies.movingAverage,{
		conversions:{
			"hma":"hull",
			"dema":"2-exponential",
			"tema":"3-exponential"
		},
		translations:{
			"hull":"Hull",
			"2-exponential":"Double Exponential",
			"3-exponential":"Triple Exponential"
		},
		typeMap:{
			"hma": "Hull", "hull": "Hull",
			"dema": "DoubleExponential", "2-exponential": "DoubleExponential",
			"tema": "TripleExponential", "3-exponential": "TripleExponential"
		}
	});

	CIQ.Studies.calculateMovingAverageHull=function(stx, sd){
		var quotes=sd.chart.scrubbed;

		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";	// Handle when the default inputs are passed in

		CIQ.Studies.MA("wma", sd.days, field, 0, "_WMA1", stx, sd);
		CIQ.Studies.MA("wma", Math.ceil(sd.days/2), field, 0, "_WMA2", stx, sd);

		var i, val;
		for(i=sd.startFrom-1;i>=0;i--){
			val=quotes[i][field];
			if(val && typeof(val)=="object") val=val[sd.subField];
			if(val || val===0) break;
		}
		for(i++;i<quotes.length;i++){
			var quote=quotes[i];
			quote["_MMA "+sd.name]=2*quote["_WMA2 "+sd.name]-quote["_WMA1 "+sd.name];
		}

		var offset=parseInt(sd.inputs.Offset,10);
		if(isNaN(offset)) offset=0;

		var hmaDays=Math.floor(Math.sqrt(sd.days));
		CIQ.Studies.MA("wma", hmaDays, "_MMA "+sd.name, offset, "_HMA", stx, sd);

		var name=sd.name;
		for(var p in sd.outputs){
			name=p + " " + name;
		}
		for(i=Math.max(sd.days+hmaDays-1,sd.startFrom);i<quotes.length;i++){
			quotes[i][name]=quotes[i]["_HMA "+sd.name];
		}
	};

	CIQ.Studies.calculateMovingAverageDoubleExponential=function(stx, sd){
		var quotes=sd.chart.scrubbed;

		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";	// Handle when the default inputs are passed in

		CIQ.Studies.MA("ema", sd.days, field, 0, "_EMA1", stx, sd);
		CIQ.Studies.MA("ema", sd.days, "_EMA1 "+sd.name, 0, "_EMA2", stx, sd);

		var offset=parseInt(sd.inputs.Offset,10);
		if(isNaN(offset)) offset=0;
		var i, val;
		var offsetBack=offset;
		for(i=sd.startFrom-1;i>=0;i--){
			val=quotes[i][field];
			if(val && typeof(val)=="object") val=val[sd.subField];
			if(!val && val!==0) continue;
			if(offsetBack>0){
				offsetBack--;
				continue;
			}
			break;
		}
		var name=sd.name;
		for(var p in sd.outputs){
			name=p + " " + name;
		}
		for(i++;i<quotes.length;i++){
			if(i<2*(sd.days-1)) continue;
			var quote=quotes[i];
			if(quotes[i+offset]) quotes[i+offset][name]=2*quote["_EMA1 "+sd.name]-quote["_EMA2 "+sd.name];
		}
	};

	CIQ.Studies.calculateMovingAverageTripleExponential=function(stx, sd){
		var quotes=sd.chart.scrubbed;

		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";	// Handle when the default inputs are passed in

		CIQ.Studies.MA("ema", sd.days, field, 0, "_EMA1", stx, sd);
		CIQ.Studies.MA("ema", sd.days, "_EMA1 "+sd.name, 0, "_EMA2", stx, sd);
		CIQ.Studies.MA("ema", sd.days, "_EMA2 "+sd.name, 0, "_EMA3", stx, sd);

		var offset=parseInt(sd.inputs.Offset,10);
		if(isNaN(offset)) offset=0;
		var i, val;
		var offsetBack=offset;
		for(i=sd.startFrom-1;i>=0;i--){
			val=quotes[i][field];
			if(val && typeof(val)=="object") val=val[sd.subField];
			if(!val && val!==0) continue;
			if(offsetBack>0){
				offsetBack--;
				continue;
			}
			break;
		}
		var name=sd.name;
		for(var p in sd.outputs){
			name=p + " " + name;
		}
		for(i++;i<quotes.length;i++){
			if(i<3*(sd.days-1)) continue;
			var quote=quotes[i];
			if(quotes[i+offset]) quotes[i+offset][name]=3*quote["_EMA1 "+sd.name]-3*quote["_EMA2 "+sd.name]+quote["_EMA3 "+sd.name];
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
		CIQ.Studies.MA("simple", sd.inputs["MA Period"], "Close", 0, "_MA", stx, sd);
		CIQ.Studies.calculateGenericEnvelope(stx, sd, sd.inputs.Multiplier, "_MA "+sd.name, "ATR " + sd.name);
	};

	CIQ.Studies.calculateATRStops=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(!quotes) return;
		CIQ.Studies.calculateStudyATR(stx,sd);
		var useHighLow=sd.inputs.HighLow;
		for(var i=Math.max(sd.startFrom-1,1);i<quotes.length-1;i++){
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
		if(quotes.length<33){
			sd.error=true;
			return;
		}

		CIQ.Studies.MA("simple", 5, "hl/2", 0, "_MA5", stx, sd);
		CIQ.Studies.MA("simple", 34, "hl/2", 0, "_MA34", stx, sd);

		for(var i=Math.max(sd.startFrom,33);i<quotes.length;i++){
			if(!quotes[i]) continue;
			quotes[i][sd.name + "_hist"]=quotes[i]["_MA5 " + sd.name] - quotes[i]["_MA34 " + sd.name];
		}
	};

	CIQ.Studies.calculateRelativeVolatility=function(stx, sd){
		sd.days=Number(sd.inputs["Smoothing Period"]);
		var smoothing=Number(sd.inputs["STD Period"]);
		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days+smoothing){
			sd.error=true;
			return;
		}
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";
		function computeRVI(avgGain, avgLoss){
			if(avgGain+avgLoss===0) return 100;
			return 100*avgGain/(avgGain+avgLoss);
		}
		sd.std=new CIQ.Studies.StudyDescriptor(sd.name, "sdev", sd.panel);
		sd.std.chart=sd.chart;
		sd.std.days=smoothing;
		sd.std.startFrom=sd.startFrom;
		sd.std.inputs={"Field":field, "Standard Deviations":1, "Type":"ma"};
		sd.std.outputs={"STD":null};
		CIQ.Studies.calculateStandardDeviation(stx,sd.std);

		var avgGain=0;
		var avgLoss=0;
		if(sd.startFrom>1){
			avgGain=quotes[sd.startFrom-1]["_avgG "+sd.name];
			avgLoss=quotes[sd.startFrom-1]["_avgL "+sd.name];
		}
		for(var i=Math.max(sd.startFrom,sd.days);i<quotes.length;i++){
			var quote=quotes[i];
			if(quote[field]>quotes[i-1][field]){
				avgGain=((avgGain*(sd.days-1))+quote["STD "+sd.name])/sd.days;
				avgLoss=avgLoss*(sd.days-1)/sd.days;
			}else{
				avgLoss=((avgLoss*(sd.days-1))+quote["STD "+sd.name])/sd.days;
				avgGain=avgGain*(sd.days-1)/sd.days;
			}
			quote["Rel Vol " + sd.name]=computeRVI(avgGain, avgLoss);
			quote["_avgG " + sd.name]=avgGain;
			quote["_avgL " + sd.name]=avgLoss;
		}
		sd.zoneOutput="Rel Vol";
	};

	CIQ.Studies.calculatePMO=function(stx, sd){
		var periods={
			Smooth: Number(sd.inputs["Smoothing Period"])-1,
			Double: Number(sd.inputs["Double Smoothing Period"])-1,
			Signal: Number(sd.inputs["Signal Period"]),
		};
		var quotes=sd.chart.scrubbed;
		if(quotes.length<periods.Smooth+periods.Double){
			sd.error=true;
			return;
		}
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";
		var i;
		for(i=sd.startFrom;i<quotes.length;i++){
			if(!quotes[i]) continue;
			if(!quotes[i-1]) continue;
			var denom=quotes[i-1][field];
			if( denom ){
				quotes[i]["_ROCx10 "+sd.name]=1000*((quotes[i][field]/denom)-1);
			}
		}
		CIQ.Studies.MA("exponential", periods.Smooth, "_ROCx10 "+sd.name, 0, "_EMAx10", stx, sd);
		CIQ.Studies.MA("exponential", periods.Double, "_EMAx10 "+sd.name, 0, "PMO", stx, sd);
		CIQ.Studies.MA("exponential", periods.Signal, "PMO "+sd.name, 0, "PMOSignal", stx, sd);
		sd.zoneOutput="PMO";
	};

	CIQ.Studies.calculateElderImpulse=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var bull=sd.outputs.Bullish;
		var bear=sd.outputs.Bearish;
		var neutral=sd.outputs.Neutral;

		CIQ.Studies.MA("exponential", 13, "Close", 0, "_MA", stx, sd);
		sd.macd=new CIQ.Studies.StudyDescriptor("_"+sd.name, "macd", sd.panel);
		sd.macd.chart=sd.chart;
		sd.macd.days=sd.days;
		sd.macd.startFrom=sd.startFrom;
		sd.macd.inputs={"Fast MA Period":12,"Slow MA Period":26,"Signal Period":9};
		sd.macd.outputs={"_MACD":null, "_Signal":null};
		CIQ.Studies.calculateMACD(stx,sd.macd);

		var color;
		for(var i=sd.startFrom;i<quotes.length;i++){
			if(i===0) color=neutral;
			else if(quotes[i]["_MA "+sd.name]>quotes[i-1]["_MA "+sd.name] &&
					quotes[i]["_"+sd.name+"_hist"]>quotes[i-1]["_"+sd.name+"_hist"]) color=bull;
			else if(quotes[i]["_MA "+sd.name]<quotes[i-1]["_MA "+sd.name] &&
					quotes[i]["_"+sd.name+"_hist"]<quotes[i-1]["_"+sd.name+"_hist"]) color=bear;
			else color=neutral;
			quotes[i]["Result "+sd.name]=color;
			//if(i) quotes[i-1][sd.name+"_hist"]=null;
		}
	};

	CIQ.Studies.calculatePivotPoints=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var period="day";
		if(stx.layout.interval=="day") period="month";
		else if(CIQ.ChartEngine.isDailyInterval(stx.layout.interval)) period="year";
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
			var marketZone = isForex ? "America/New_York" : stx.chart.market.market_tz;
			var dt=new Date(localQuoteDate.getTime() + localQuoteDate.getTimezoneOffset() * 60000);
			if(!marketZone || marketZone.indexOf("UTC")==-1)
				dt=CIQ.convertTimeZone(dt,"UTC",marketZone);

			return new Date(dt.getFullYear(),dt.getMonth(),dt.getDate(),dt.getHours(),dt.getMinutes(),dt.getSeconds(),dt.getMilliseconds()).getTime()-localQuoteDate.getTime();
		}
		var pointers={
			pivotPoint:NaN,
			high:0,
			low:0,
			prevHigh:0,
			prevLow:0,
			hlSpread:0
		};
		if(sd.startFrom>1){
			pointers=CIQ.clone(quotes[sd.startFrom-1]["_pointers " + sd.name]);
		}
		function resetPivots(){
			pointers.pivotPoint=(pointers.high+pointers.low+quotes[i-1].Close)/3;
			pointers.prevHigh=pointers.high;
			pointers.prevLow=pointers.low;
			pointers.hlSpread=pointers.high-pointers.low;
			pointers.high=pointers.low=0;
		}
		for(var i=Math.max(1,sd.startFrom);i<quotes.length;i++){
			if(!quotes[i-1]) continue;
			pointers.high=Math.max(pointers.high,quotes[i-1].High);
			pointers.low=Math.min(pointers.low>0?pointers.low:quotes[i-1].Low,quotes[i-1].Low);
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
					// Forex beginning of day is 17:00 NY Time, so add 7 hours of msecs (6 for metals) to make it fall on a date boundary
					if (isForex) marketOffset += (isMetal ? 6 : 7) * 60 * 60 * 1000;
				}
				var newDate=new Date(new Date(+quotes[i].DT).setMilliseconds(quotes[i].DT.getMilliseconds()+marketOffset));
				var oldDate=new Date(new Date(+quotes[i-1].DT).setMilliseconds(quotes[i-1].DT.getMilliseconds()+marketOffset));
				if (oldDate.getDate() !== newDate.getDate() && stx.chart.market.isMarketDate(newDate)) {
					//new daily period
					marketOffset=null;
					resetPivots();
				}
			}else if(period=="15min" &&
					(quotes[i].DT.getHours()!=quotes[i-1].DT.getHours() || Math.floor(quotes[i].DT.getMinutes()/15)!=Math.floor(quotes[i-1].DT.getMinutes()/15))){
				//new 15 minute period
				resetPivots();
			}
			quotes[i]["Pivot " + sd.name]=pointers.pivotPoint;
			if(sd.inputs.Type.toLowerCase()=="fibonacci"){
				quotes[i]["Resistance 1 " + sd.name]=pointers.pivotPoint+0.382*pointers.hlSpread;
				quotes[i]["Resistance 2 " + sd.name]=pointers.pivotPoint+0.618*pointers.hlSpread;
				quotes[i]["Resistance 3 " + sd.name]=pointers.pivotPoint+pointers.hlSpread;
				quotes[i]["Support 1 " + sd.name]=pointers.pivotPoint-0.382*pointers.hlSpread;
				quotes[i]["Support 2 " + sd.name]=pointers.pivotPoint-0.618*pointers.hlSpread;
				quotes[i]["Support 3 " + sd.name]=pointers.pivotPoint-pointers.hlSpread;
			}else{
				quotes[i]["Resistance 1 " + sd.name]=2*pointers.pivotPoint-pointers.prevLow;
				quotes[i]["Resistance 2 " + sd.name]=pointers.pivotPoint+pointers.hlSpread;
				quotes[i]["Resistance 3 " + sd.name]=pointers.prevHigh+2*(pointers.pivotPoint-pointers.prevLow);
				quotes[i]["Support 1 " + sd.name]=2*pointers.pivotPoint-pointers.prevHigh;
				quotes[i]["Support 2 " + sd.name]=pointers.pivotPoint-pointers.hlSpread;
				quotes[i]["Support 3 " + sd.name]=pointers.prevLow-2*(pointers.prevHigh-pointers.pivotPoint);
			}
			quotes[i]["_pointers " + sd.name]=CIQ.clone(pointers);
		}
	};

	CIQ.Studies.calculateVWAP=function(stx, sd){
		var quotes=sd.chart.scrubbed;
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
			var marketZone = isForex ? "America/New_York" : stx.chart.market.market_tz;
			var dt=new Date(localQuoteDate.getTime() + localQuoteDate.getTimezoneOffset() * 60000);
			if(!marketZone || marketZone.indexOf("UTC")==-1)
				dt=CIQ.convertTimeZone(dt,"UTC",marketZone);

			return new Date(dt.getFullYear(),dt.getMonth(),dt.getDate(),dt.getHours(),dt.getMinutes(),dt.getSeconds(),dt.getMilliseconds()).getTime()-localQuoteDate.getTime();
		}
		if(sd.startFrom>1){
			volume=quotes[sd.startFrom-1]["_V "+sd.name];
			volume_price=quotes[sd.startFrom-1]["_VxP "+sd.name];

		}
		for(var i=sd.startFrom;i<quotes.length;i++){
			if(marketOffset===null){
				//possible new daily period
				marketOffset=getMarketOffset(quotes[i].DT);
				//Forex beginning of day is 17:00 NY Time, so add 7 hours of msecs (6 for metals) to make it fall on a date boundary
				if (isForex) marketOffset += (isMetal ? 6 : 7) * 60 * 60 * 1000;
			}
			if(quotes[i-1] && quotes[i-1].DT){
				var newDate=new Date(new Date(+quotes[i].DT).setMilliseconds(quotes[i].DT.getMilliseconds()+marketOffset));
				var oldDate=new Date(new Date(+quotes[i-1].DT).setMilliseconds(quotes[i-1].DT.getMilliseconds()+marketOffset));
				if (oldDate.getDate()!=newDate.getDate() && stx.chart.market.isMarketDate(newDate)) {
					//new daily period
					marketOffset=null;
					volume=volume_price=0;
				}
			}
			var typicalPrice=quotes[i]["hlc/3"];
			volume+=quotes[i].Volume;
			volume_price+=quotes[i].Volume*typicalPrice;
			if(!volume) continue;
			quotes[i]["VWAP "+sd.name]=volume_price/volume;
			quotes[i]["_V "+sd.name]=volume;
			quotes[i]["_VxP "+sd.name]=volume_price;
			hasThereBeenVolume=true;
		}
		if(!hasThereBeenVolume){
			sd.error="VWAP Requires Volume";
		}
	};

	CIQ.Studies.calculateMFI=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var hist, high=0;
		var factor=sd.inputs["Scale Factor"];
		if(!factor) factor=sd.study.inputs["Scale Factor"];
		var scale=Math.pow(10,Number(factor));
		if(sd.startFrom>1) high=quotes[sd.startFrom-1]["_high "+sd.name];
		var i;
		for(i=sd.startFrom;i<quotes.length;i++){
			if(!quotes[i]) continue;
			if(quotes[i].Volume) {
				quotes[i][sd.name + "_hist"]=hist=scale*(quotes[i].High-quotes[i].Low)/quotes[i].Volume;
				quotes[i]["_high " + sd.name]=high=Math.max(high,hist);
			}
		}
	};

	CIQ.Studies.calculateAlligator=function(stx, sd){
		var periods={
			J:Number(sd.inputs["Jaw Period"]),
			T:Number(sd.inputs["Teeth Period"]),
			L:Number(sd.inputs["Lips Period"])
		};
		var quotes=sd.chart.scrubbed;
		if(quotes.length<Math.max(periods.J,periods.T,periods.L)+1){
			sd.error=true;
			return;
		}

		CIQ.Studies.MA("welles wilder", periods.J, "hl/2", sd.inputs["Jaw Offset"], "Jaw", stx, sd);
		CIQ.Studies.MA("welles wilder", periods.T, "hl/2", sd.inputs["Teeth Offset"], "Teeth", stx, sd);
		CIQ.Studies.MA("welles wilder", periods.L, "hl/2", sd.inputs["Lips Offset"], "Lips", stx, sd);

		for(var i=sd.startFrom;i<quotes.length;i++){
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
		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}
		var i;
		for(i=sd.startFrom;i<quotes.length;i++){
			quotes[i]["_Change " + sd.name]=quotes[i].Close-quotes[i].Open;
			quotes[i]["_Range " + sd.name]=quotes[i].High-quotes[i].Low;
		}

		CIQ.Studies.MA("triangular", 4, "_Change "+sd.name, 0, "_Numer", stx, sd);
		CIQ.Studies.MA("triangular", 4, "_Range "+sd.name, 0, "_Denom", stx, sd);

		var nums=[];
		var dens=[];
		for(i=Math.max(sd.startFrom-sd.days,0);i<quotes.length;i++){
			nums.push(quotes[i]["_Numer "+sd.name]);
			dens.push(quotes[i]["_Denom "+sd.name]);
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
			if(i<sd.startFrom) continue;
			quotes[i]["Rel Vig "+sd.name]=sumNum/sumDen;
		}

		CIQ.Studies.MA("triangular", 4, "Rel Vig "+sd.name, 0, "RelVigSignal", stx, sd);

		for(i=sd.startFrom;i<quotes.length;i++){
			quotes[i][sd.name+"_hist"]=quotes[i]["Rel Vig "+sd.name]-quotes[i]["RelVigSignal "+sd.name];
		}
	};

	CIQ.Studies.calculateUlcerIndex=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(quotes.length<2*sd.days-1){
			sd.error=true;
			return;
		}
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
		for(i=Math.max(sd.startFrom,sd.days-1);i<quotes.length;i++){
			quotes[i]["_PD2 "+sd.name]=Math.pow(100*(quotes[i][field]/getHV(sd.days,i,field)-1),2);
		}
		CIQ.Studies.MA("simple", sd.days, "_PD2 "+sd.name, 0, "_MA", stx, sd);
		for(i=Math.max(sd.startFrom,2*(sd.days-1));i<quotes.length;i++){
			quotes[i]["Result "+sd.name]=Math.sqrt(quotes[i]["_MA "+sd.name]);
		}
	};

	CIQ.Studies.calculateChoppiness=function(stx, sd){
		CIQ.Studies.calculateStudyATR(stx,sd);

		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}

		function getLLVHHV(p,x){
			var h=Number.MAX_VALUE*-1, l=Number.MAX_VALUE;
			for(var j=x-p+1;j<=x;j++){
				if(j<0) continue;
				h=Math.max(h,quotes[j].High);
				l=Math.min(l,quotes[j].Low);
			}
			return [l,h];
		}
		for(var i=Math.max(sd.startFrom,sd.days);i<quotes.length;i++){
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
		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";

		CIQ.Studies.MA(sd.inputs["Moving Average Type"], sd.days, field, 0, "_MA", stx, sd);
		for(var i=Math.max(sd.startFrom,sd.days-1);i<quotes.length;i++){
			if(!quotes[i]) continue;
			quotes[i]["Result "+sd.name]=100*(quotes[i][field]/quotes[i]["_MA "+sd.name]-1);
		}
	};

	CIQ.Studies.calculateRainbow=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";

		function getLLVHHV(p,x){
			var h=Number.MAX_VALUE*-1, l=Number.MAX_VALUE;
			for(var j=x-p+1;j<=x;j++){
				if(j<0) continue;
				h=Math.max(h,quotes[j].Close);
				l=Math.min(l,quotes[j].Close);
			}
			return [l,h];
		}

		var f=field;
		for(var j=1;j<=10;j++) {
			CIQ.Studies.MA("simple", sd.days, f, 0, "SMA"+j, stx, sd);
			f="SMA"+j+" "+sd.name;
		}

		for(var i=Math.max(sd.startFrom,10);i<quotes.length;i++){
			if(!quotes[i]) continue;
			var accum=0,max=Number.MAX_VALUE*-1,min=Number.MAX_VALUE;
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
		if(sd.name.indexOf("Osc")>-1){
			sd.outputMap["Over "+sd.name]=sd.outputMap["Under "+sd.name]=sd.outputMap["Zero "+sd.name]=null;
		}
	};

	CIQ.Studies.calculateKST=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";
		var roc={}, smp={};
		roc[1]=Number(sd.inputs["Lightest Rate of Change Period"]);
		roc[2]=Number(sd.inputs["Light Rate of Change Period"]);
		roc[3]=Number(sd.inputs["Heavy Rate of Change Period"]);
		roc[4]=Number(sd.inputs["Heaviest Rate of Change Period"]);
		smp[1]=Number(sd.inputs["Lightest SMA Period"]);
		smp[2]=Number(sd.inputs["Light SMA Period"]);
		smp[3]=Number(sd.inputs["Heavy SMA Period"]);
		smp[4]=Number(sd.inputs["Heaviest SMA Period"]);
		var sp=Number(sd.inputs["Signal Period"]);
		var i,j;
		for(i=sd.startFrom;i<quotes.length;i++){
			if(!quotes[i]) continue;
			for(j=1;j<=4;j++){
				if(i>=roc[j] && quotes[i-roc[j]] && quotes[i-roc[j]][field]) quotes[i]["_ROC"+j+" "+sd.name]=100*((quotes[i][field]/quotes[i-roc[j]][field])-1);
			}
		}
		for(j=1;j<=4;j++) {
			CIQ.Studies.MA("simple", smp[j], "_ROC"+j+" "+sd.name, 0, "_SMA"+j, stx, sd);
		}
		for(i=sd.startFrom;i<quotes.length;i++){
			quotes[i]["KST "+sd.name]=0;
			for(j=1;j<=4;j++) quotes[i]["KST "+sd.name]+=j*quotes[i]["_SMA"+j+" "+sd.name];
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
		for(i=sd.startFrom;i<quotes.length;i++){
			if(!quotes[i]) continue;
			for(j=0;j<roc[span].length;j++){
				if(i>=roc[span][j] && quotes[i-roc[span][j]] && quotes[i-roc[span][j]][field]) quotes[i]["_ROC"+j+" "+sd.name]=100*((quotes[i][field]/quotes[i-roc[span][j]][field])-1);
			}
		}
		for(j=0;j<map[span].length;j++) {
			CIQ.Studies.MA(span=="daily"?"simple":"exponential", map[span][j], "_ROC"+j+" "+sd.name, 0, "_MA"+j, stx, sd);
		}
		for(i=sd.startFrom;i<quotes.length;i++){
			quotes[i]["Result "+sd.name]=0;
			for(j=0;j<map[span].length;j++) {
				quotes[i]["Result "+sd.name]+=((j%4)+1)*quotes[i]["_MA"+j+" "+sd.name];
			}
		}
	};

	CIQ.Studies.calculateDarvas=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var allTimeHigh=0;
		var allTimeHighPeriods=parseInt(sd.inputs["ATH Lookback Period"],10);
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
		var i;
		var lbl={};  //labels
		["Darvas","Ghost","Profit","Loss","ATH","ADV","Spike"].forEach(function(v){
			lbl[v]=v+" "+sd.name;
		});
		for(i=sd.startFrom-1;i>0;i--){
			var q=quotes[i];
			if(q[lbl.Darvas] || q[lbl.Ghost]){
				for(var l in lbl) q[l] = null;
			}else{
				allTimeHigh=q[lbl.ATH]||0;
				buy=q[lbl.Profit];
				sell=q[lbl.Loss];
				break;
			}
		}
		for(i;i<quotes.length;i++){
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
						quote[lbl.Ghost]=CIQ.clone(boxData);
						if(debug) console.log("Ghost begin:"+quote.DT);
						boxData.State=0;
						if(quotes[boxData.End]){
							quotes[boxData.End][lbl.Ghost]=CIQ.clone(boxData);
							if(debug) console.log("Ghost end:"+quotes[boxData.End].DT);
						}
						ghost={Start:boxData.Start,End:boxData.End};
						buy=boxData.High+offset;
						if(!sell || sell < boxData.Low-offset){
							sell=boxData.Low-offset;
						}
					}
				}

				quote[lbl.Profit]=buy;
				quote[lbl.Loss]=sell;
				if(quote.Close>=buy) buy=null;
				else if(sd.inputs["Exit Field"]=="high/low" && quote.High>=buy) buy=null;

				if(boxState=="none"){
					if(i==allTimeHigh+3) {
						if(!quotes[allTimeHigh+2][lbl.Darvas] &&
						   !quotes[allTimeHigh+1][lbl.Darvas] &&
						   !quotes[allTimeHigh][lbl.Darvas] &&
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
						quotes[allTimeHigh][lbl.Darvas]=CIQ.clone(boxData);
						boxState="darvas";
						if(debug) console.log("Darvas begin:"+quotes[allTimeHigh].DT);
						if(debug) console.log("Darvas established:"+quote.DT);
						if(ghost){
							if(ghost.End>i && quotes[ghost.Start]){
								quote[lbl.Ghost]=CIQ.clone(quotes[ghost.Start][lbl.Ghost]);
								quote[lbl.Ghost].End=i;
								if(quotes[ghost.End]) {
									delete quotes[ghost.End][lbl.Ghost];
									if(debug) console.log("Ghost End removed:"+quotes[ghost.End].DT);
								}
							}
							quote[lbl.Ghost].State=0;
							quotes[ghost.Start][lbl.Ghost].End=i;
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
							quotes[d][lbl.Darvas]=CIQ.clone(boxData);
						}
						boxData.State=0;
						boxData.End=i;
						quote[lbl.Darvas]=CIQ.clone(boxData);
						if(debug) console.log("Darvas end:"+quote.DT);
						quote[lbl.ATH]=allTimeHigh;
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
								quote[lbl.Ghost]=CIQ.clone(quotes[ghost.Start][lbl.Ghost]);
								quote[lbl.Ghost].End=i;
								if(quotes[ghost.End]){
									delete quotes[ghost.End][lbl.Ghost];
									if(debug) console.log("Ghost End removed:"+quotes[ghost.End].DT);
								}
							}
							quote[lbl.Ghost].State=0;
							quotes[ghost.Start][lbl.Ghost].End=i;
							if(debug) console.log("Ghost end:"+quote.DT);
							ghost=null;
						}
					}
				}
			}

			if(quote.High>=quotes[allTimeHigh].High){
				allTimeHigh=i;
				if(debug) console.log("All Time High:"+quote.DT);
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
					if(debug) console.log("All Time High:"+quote.DT);
				}
			}

			if(sd.inputs["Volume Spike"] && i>allTimeHighPeriods && i==allTimeHigh){
				if(quote[lbl.ADV]*spikePercentage < quote.Volume){
					quote[lbl.Spike]=1;
					if(debug) console.log("Volume Spike:"+quote.DT);
				}
			}
			quote[lbl.ATH]=allTimeHigh;
		}
	};

	CIQ.Studies.calculateSupertrend=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}
		CIQ.Studies.calculateStudyATR(stx,sd);
		for(var i=sd.startFrom;i<quotes.length;i++){
			var quote=quotes[i];
			if(!quote) continue;
			var median=(quote.High+quote.Low)/2;
			var factoredATR=sd.inputs.Multiplier*quote["ATR "+sd.name];
			var uptrend=median-factoredATR;
			var downtrend=median+factoredATR;
			if(i){
				if(quotes[i-1] && quotes[i-1].Close &&
					quotes[i-1].Close>quotes[i-1]["_Uptrend "+sd.name] &&
					quotes[i-1]["_Uptrend "+sd.name]>uptrend)
					uptrend=quotes[i-1]["_Uptrend "+sd.name];
				if(quotes[i-1] && quotes[i-1].Close &&
					quotes[i-1].Close<quotes[i-1]["_Downtrend "+sd.name] &&
					quotes[i-1]["_Downtrend "+sd.name]<downtrend)
					downtrend=quotes[i-1]["_Downtrend "+sd.name];
			}
			quote["_Direction "+sd.name]=1;
			if(i) {
				quote["_Direction "+sd.name]=quotes[i-1]["_Direction "+sd.name];
				if(quote.Close > quotes[i-1]["_Downtrend "+sd.name]) quote["_Direction "+sd.name]=1;
				else if(quote.Close < quotes[i-1]["_Uptrend "+sd.name]) quote["_Direction "+sd.name]=-1;
			}
			quote["_Uptrend "+sd.name]=uptrend;
			quote["_Downtrend "+sd.name]=downtrend;
			quote["Trend "+sd.name]=quote["_Direction "+sd.name] > 0 ? uptrend : downtrend;
			if(!i) continue;
		}
		sd.outputMap={};
		sd.outputMap["Trend "+sd.name]="Trend";
	};

	/**
	 * Ensures that symbols required by a study are loaded by the quotefeed.
	 * @param  {CIQ.ChartEngine} stx  The chart engine
	 * @param  {object} sd   The study descriptor
	 * @param  {array} syms An array of symbols required by the study
	 * @param {object} [params] Parameters to be sent to addSeries. See {@link CIQ.ChartEngine#addSeries}.
	 * @since  3.0.7 This was a previously private function.
	 */
	CIQ.Studies.fetchAdditionalInstruments=function(stx, sd, syms, params){

		if(!stx.quoteDriver) {
			console.log('CIQ.Studies.fetchAdditionalInstruments: No quotefeed to fetch symbol');
			return;
		}
		// sd.chart may not be initialized, so we find it the hard way
		var chart=stx.panels[sd.panel].chart;

		// We'll remember which symbols we have set so that we can delete them later
		sd.symbols=syms;

		var i, symbol, symbolObject;
		// Add entries for the symbols we need. If those symbols already exist, add the study name as a dependency
		function addSeriesCB(){
			stx.createDataSet();
			stx.draw();
		}
		for(i=0;i<syms.length;i++){
			symbol=symbolObject=syms[i];
			if(typeof symbolObject=="object"){
				symbol=symbolObject.symbol;
			}else{
				symbolObject={symbol:symbol};
			}
			var parameters={symbol:symbol, symbolObject:symbolObject, bucket:"study", studyName:sd.name, chartName: chart.name, action: "add-study"};
			CIQ.extend(parameters, params);
			var loadData=parameters.loadData;
			if(stx.currentlyImporting) parameters.loadData=false;  // do not load data if importing as periodicity will not be correct; instead let loadDependents load data
			if(!sd.series) sd.series={};
			sd.series[symbol]=stx.addSeries(null, parameters, addSeriesCB);
			sd.series[symbol].parameters.loadData=loadData;
		}
	};


	/**
	 * Initializes data for Price Relative Study by fetching the comparing symbol.
	 *
	 * @param {CIQ.ChartEngine} stx	The chart object
	 * @param {string} type Study type
	 * @param {object} inputs Study inputs
	 * @param {object} outputs Study outputs
	 * @param {object} parameters Study parameters
	 * @param {string} panel ID of the study's panel element
	 * @return {studyDescriptor} Study descriptor object
	 * @memberOf CIQ.Studies
	 * @version ChartIQ Advanced Package
	 * @since 09-2016-19
	 */
	CIQ.Studies.initPriceRelative=function(stx, type, inputs, outputs, parameters, panel){
		var sd=CIQ.Studies.initializeFN(stx, type, inputs, outputs, parameters, panel);
		var syms=[sd.inputs["Comparison Symbol"].toUpperCase()];

		CIQ.Studies.fetchAdditionalInstruments(stx, sd, syms);
		return sd;
	};

	/**
	 * Calculates data for Price Relative Study
	 *
	 * @param  {CIQ.ChartEngine} stx	The chart object
	 * @param  {object} sd	The study descriptor object
	 * @memberOf CIQ.Studies
	 * @version ChartIQ Advanced Package
	 */
	CIQ.Studies.calculatePriceRelative=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var cSym=sd.inputs["Comparison Symbol"].toUpperCase();
		if(!cSym) cSym=sd.study.inputs["Comparison Symbol"];

		var map={};
		var mainSymbol=stx.chart.symbol.replace(/=/,"");
		mainSymbol=mainSymbol.replace(/[+\-*\\%]/g,"");
		map[mainSymbol]=quotes.slice(sd.startFrom);
		if(!map[mainSymbol].length) return;
		if( mainSymbol != cSym ) map[cSym]=null;
		var results=CIQ.computeEquationChart("["+mainSymbol+"]/["+cSym+"]", map);
		var rIter=0;
		for(var i=sd.startFrom;i<quotes.length && rIter<results.length;i++){
			while(rIter<results.length && quotes[i].DT.getTime()>results[rIter].DT.getTime()) rIter++;
			if(quotes[i].DT.getTime()<results[rIter].DT.getTime()) continue;
			quotes[i]["Result "+sd.name]=results[rIter].Close;
			rIter++;
		}
	};

	CIQ.Studies.calculatePerformance=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var cSym=sd.inputs["Comparison Symbol"].toUpperCase();
		if(!cSym) cSym=sd.study.inputs["Comparison Symbol"];
		if(!sd.days) sd.days=sd.study.inputs.Period;
		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}

		CIQ.Studies.MA("ma", sd.days, "Close", 0, "_MA Base", stx, sd);
		CIQ.Studies.MA("ma", sd.days, cSym, 0, "_MA Comp", stx, sd);
		for(var i=sd.startFrom;i<quotes.length;i++){
			var cSymQ=quotes[i][cSym];
			if(cSymQ && (cSymQ.Close || cSymQ.Close===0)) cSymQ=cSymQ.Close;
			quotes[i]["Result "+sd.name]=(quotes[i].Close/cSymQ) * (quotes[i]["_MA Comp "+sd.name]/quotes[i]["_MA Base "+sd.name]);
		}
	};

	CIQ.Studies.calculateBeta=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var cSym=sd.inputs["Comparison Symbol"].toUpperCase();
		if(!cSym) cSym=sd.study.inputs["Comparison Symbol"];
		if(!sd.days) sd.days=sd.study.inputs.Period;
		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}

		for(var i=Math.max(sd.startFrom,1);i<quotes.length;i++){
			quotes[i]["_BaseChange "+sd.name]=quotes[i].Close/quotes[i-1].Close-1;
			var cSymQ=quotes[i][cSym];
			if(cSymQ && (cSymQ.Close || cSymQ.Close===0)) cSymQ=cSymQ.Close;
			var cSymQ1=quotes[i-1][cSym];
			if(cSymQ1 && (cSymQ1.Close || cSymQ1.Close===0)) cSymQ1=cSymQ1.Close;
			quotes[i]["_CompChange "+sd.name]=cSymQ/cSymQ1-1;
		}
		CIQ.Studies.MA("ma", sd.days, "_BaseChange "+sd.name, 0, "_MA Base", stx, sd);
		CIQ.Studies.MA("ma", sd.days, "_CompChange "+sd.name, 0, "_MA Comp", stx, sd);
		for(i=Math.max(sd.startFrom,sd.days);i<quotes.length;i++){
			quotes[i]["_COVARn "+sd.name]=(quotes[i]["_BaseChange "+sd.name]-quotes[i]["_MA Base "+sd.name])*(quotes[i]["_CompChange "+sd.name]-quotes[i]["_MA Comp "+sd.name]);
			quotes[i]["_VARn "+sd.name]=Math.pow(quotes[i]["_CompChange "+sd.name]-quotes[i]["_MA Comp "+sd.name],2);
		}
		CIQ.Studies.MA("ma", sd.days, "_COVARn "+sd.name, 0, "_COVAR", stx, sd);
		CIQ.Studies.MA("ma", sd.days, "_VARn "+sd.name, 0, "_VAR", stx, sd);
		for(i=Math.max(sd.startFrom,sd.days*2-1);i<quotes.length;i++){
			quotes[i]["Result "+sd.name]=quotes[i]["_COVAR "+sd.name]/quotes[i]["_VAR "+sd.name];
		}
	};

	CIQ.Studies.calculateVortex=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var period=sd.days;
		if(quotes.length<period+1){
			sd.error=true;
			return;
		}
		var total={tr:0,vmPlus:0,vmMinus:0};
		if(sd.startFrom>1){
			total=CIQ.clone(quotes[sd.startFrom-1]["_totals "+sd.name]);
		}
		for(var i=Math.max(sd.startFrom,1);i<quotes.length;i++){
			var prices=quotes[i];
			var pd=quotes[i-1];
			var vmPlus=Math.abs(prices.High-pd.Low);
			var vmMinus=Math.abs(prices.Low-pd.High);
			var trueRange=Math.max(prices.High,pd.Close)-Math.min(prices.Low,pd.Close);
			total.tr+=trueRange;
			total.vmPlus+=vmPlus;
			total.vmMinus+=vmMinus;
			if(i>period) {
				total.tr-=quotes[i-period]["_True Range " + sd.name];
				total.vmPlus-=quotes[i-period]["_VMPlus " + sd.name];
				total.vmMinus-=quotes[i-period]["_VMMinus " + sd.name];
			}
			prices["_True Range " + sd.name]=trueRange;
			prices["_VMPlus " + sd.name]=vmPlus;
			prices["_VMMinus " + sd.name]=vmMinus;
			if(i>=period) {
				prices["+VI " + sd.name]=total.vmPlus/total.tr;
				prices["-VI " + sd.name]=total.vmMinus/total.tr;
			}
			prices["_totals " + sd.name]=CIQ.clone(total);
		}
	};

	CIQ.Studies.calculateBalanceOfPower=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}
		for(var i=sd.startFrom;i<quotes.length;i++){
			var quote=quotes[i];
			quote["_Ratio " + sd.name]=quote.Close-quote.Open;
			if(quote.High-quote.Low!==0) // avoid division by zero
				quote["_Ratio " + sd.name]/=(quote.High-quote.Low);
		}
		CIQ.Studies.MA(sd.inputs["Moving Average Type"], sd.days, "_Ratio "+sd.name, 0, "Result", stx, sd);
	};

	CIQ.Studies.calculateTrendIntensity=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";

		function computeTII(gain, loss){
			if(Math.abs(loss)<0.00000001) return 100;
			return 100-(100/(1+(gain/loss)));
		}
		CIQ.Studies.MA("ma", sd.days, field, 0, "_SMA", stx, sd);
		var gain=0, loss=0, i, change, queue=[], maxLength=Math.ceil(sd.days/2);
		for(i=Math.max(0,sd.startFrom-maxLength);i<quotes.length;i++){
			if(!quotes[i]["_SMA "+sd.name] && quotes[i]["_SMA "+sd.name]!==0) continue;
			change=quotes[i][field]-quotes[i]["_SMA "+sd.name];
			if(change<0) loss+=(change*-1);
			else gain+=change;
			queue.push(change);
			if(queue.length>maxLength){
				change=queue.shift();
				if(change<0) loss-=(change*-1);
				else gain-=change;
			}
			if(i<sd.startFrom) continue;
			quotes[i]["TII "+sd.name]=computeTII(gain, loss);
		}
		CIQ.Studies.MA("ema", sd.inputs["Signal Period"], "TII "+sd.name, 0, "Signal", stx, sd);
		sd.zoneOutput="TII";
	};

	// Note: this study expects createDataSet to be called when changing the chart type!
	CIQ.Studies.calculateZigZag=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(!quotes || !quotes.length) return;
		var highLowChart=sd.highLowChart;
		function fillBetweenPoints(start,end){
			for(var i=start+1;i<end;i++){
				quotes[i]["ShadowResult "+sd.name]=(quotes[end]["Result "+sd.name]-quotes[start]["Result "+sd.name])*(i-start)/(end-start)+quotes[start]["Result "+sd.name];
				delete quotes[i]["Result "+sd.name];
			}
		}
		var ll=null, hh=null;
		var distance=sd.inputs["Distance(%)"];
		var direction=0;
		var bar=0;
		var previousBar=0;
		var zig=null, zag=null;
		var start=0;
		for(var b=Math.min(quotes.length-1,sd.startFrom);b>=0;b--){
			start=b;
			if(quotes[b]["_state "+sd.name]){
				var state=quotes[b]["_state "+sd.name];
				//[ll,hh,direction,bar,previousBar,zig,zag]
				ll=state[0];
				hh=state[1];
				direction=state[2];
				bar=state[3];
				previousBar=state[4];
				zig=state[5];
				zag=state[6];
				break;
			}
		}
		for(var i=start;i<quotes.length;i++){
			var thisHigh=quotes[i][highLowChart?"High":"Close"];
			var thisLow=quotes[i][highLowChart?"Low":"Close"];
			if(hh===null || hh<thisHigh){
				hh=thisHigh;
				if(direction<0) ll=thisLow;
				zig=(1-distance/100)*hh;
				if(direction>-1) {
					if(zag!==null && hh>zag){
						quotes[bar]["Result "+sd.name]=quotes[bar][highLowChart?"Low":"Close"];
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
						quotes[bar]["Result "+sd.name]=quotes[bar][highLowChart?"High":"Close"];
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
		quotes[bar]["Result "+sd.name]=quotes[bar][highLowChart?(direction==1?"Low":"High"):"Close"];
		quotes[bar]["_state "+sd.name]=[ll,hh,direction,bar,previousBar,zig,zag];
		fillBetweenPoints(previousBar,bar);
		quotes[quotes.length-1]["Result "+sd.name]=quotes[quotes.length-1][highLowChart?(direction==1?"High":"Low"):"Close"];
		fillBetweenPoints(bar,quotes.length-1);
	};

	CIQ.Studies.calculatePsychologicalLine=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}
		var array=[];
		var increment=100/sd.days;
		var accum=0;
		for(var i=Math.max(sd.startFrom-sd.days,1);i<quotes.length;i++){
			var up=Number(quotes[i].Close>quotes[i-1].Close);
			if(up) accum+=increment;
			array.push(up);
			if(array.length>sd.days) accum-=array.shift()*increment;
			if(i<sd.startFrom) continue;
			quotes[i]["Result " + sd.name]=accum;
		}
	};

	CIQ.Studies.calculateMADev=function(stx, sd) {
		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";
		var pts=sd.inputs["Points Or Percent"];
		if(!pts) pts="Points";
		var maType=sd.inputs["Moving Average Type"];
		if(!maType) maType="exponential";
		CIQ.Studies.MA(maType, sd.days, field, 0, "_MA", stx, sd);
		var histogram=sd.name+"_hist";
		for(var i=Math.max(sd.startFrom,sd.days-1);i<quotes.length;i++){
			var quote=quotes[i];
			var val=quote[field];
			if(val && typeof(val)=="object") val=val[sd.subField];
			if(pts=="Points") quote[histogram]=val-quote["_MA "+sd.name];
			else quote[histogram]=100*(val/quote["_MA "+sd.name]-1);
		}
	};

	CIQ.Studies.calculateShinohara=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}
		var accums={
			weakNum:0,
			weakDen:0,
			strongNum:0,
			strongDen:0
		};
		if(sd.startFrom>1){
			accums=CIQ.clone(quotes[sd.startFrom-1]["_accums "+sd.name]);
		}
		for(var i=sd.startFrom;i<quotes.length;i++){
			accums.weakNum+=quotes[i].High-quotes[i].Close;
			accums.weakDen+=quotes[i].Close-quotes[i].Low;
			if(i>0){
				accums.strongNum+=quotes[i].High-quotes[i-1].Close;
				accums.strongDen+=quotes[i-1].Close-quotes[i].Low;
			}
			if(i>=sd.days){
				accums.weakNum-=quotes[i-sd.days].High-quotes[i-sd.days].Close;
				accums.weakDen-=quotes[i-sd.days].Close-quotes[i-sd.days].Low;
				quotes[i]["Weak Ratio " + sd.name]=100*accums.weakNum/accums.weakDen;
				if(i>sd.days){
					accums.strongNum-=quotes[i-sd.days].High-quotes[i-sd.days-1].Close;
					accums.strongDen-=quotes[i-sd.days-1].Close-quotes[i-sd.days].Low;
					quotes[i]["Strong Ratio " + sd.name]=100*accums.strongNum/accums.strongDen;
				}
			}
			quotes[i]["_accums " + sd.name]=CIQ.clone(accums);
		}
	};

	CIQ.Studies.calculateIchimoku=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var periods={
			Base: Number(sd.inputs["Base Line Period"]),
			Conv: Number(sd.inputs["Conversion Line Period"]),
			LeadB: Number(sd.inputs["Leading Span B Period"]),
			Lag: Number(sd.inputs["Lagging Span Period"])
		};

		function getLLVHHV(p,x){
			var l=Number.MAX_VALUE, h=Number.MAX_VALUE*-1;
			for(var j=x-p+1;j<=x;j++){
				if(j<0) continue;
				l=Math.min(l,quotes[j].Low);
				h=Math.max(h,quotes[j].High);
			}
			return [l,h];
		}

		var i,hl;
		for(i=sd.startFrom;i<quotes.length;i++){
			if(!quotes[i]) continue;

			hl=getLLVHHV(periods.Conv,i);
			quotes[i]["Conversion Line " + sd.name]=(hl[1]+hl[0])/2;

			hl=getLLVHHV(periods.Base,i);
			quotes[i]["Base Line " + sd.name]=(hl[1]+hl[0])/2;

			if(i<periods.Lag) continue;
			quotes[i-periods.Lag]["Lagging Span " + sd.name]=quotes[i].Close;
		}
		sd.futureA=[];
		sd.futureB=[];
		for(i=Math.max(0,sd.startFrom-periods.Base);i<quotes.length;i++){
			hl=getLLVHHV(periods.LeadB,i);
			var lsa=(quotes[i]["Conversion Line " + sd.name]+quotes[i]["Base Line " + sd.name])/2;
			var lsb=(hl[1]+hl[0])/2;
			if(quotes[i+periods.Base]) {
				quotes[i+periods.Base]["Leading Span A " + sd.name]=lsa;
				quotes[i+periods.Base]["Leading Span B " + sd.name]=lsb;
			}else{
				sd.futureA.push(lsa);
				sd.futureB.push(lsb);
			}
		}
		sd.chart.whiteSpaceFutureTicks=Math.max(sd.chart.whiteSpaceFutureTicks,sd.futureA.length-1);

	};

	CIQ.Studies.displayIchimoku=function(stx, sd, quotes){
		var topBand="Leading Span A " + sd.name, bottomBand="Leading Span B " + sd.name;
		var topColor=CIQ.Studies.determineColor(sd.outputs[sd.outputMap[topBand]]);
		var bottomColor=CIQ.Studies.determineColor(sd.outputs[sd.outputMap[bottomBand]]);
		var yAxis=stx.getYAxisByName(sd.panel, sd.name);
		var parameters={
			topBand: topBand,
			bottomBand: bottomBand,
			topColor: topColor,
			bottomColor: bottomColor,
			skipTransform: stx.panels[sd.panel].name!=sd.chart.name,
			topAxis: yAxis,
			bottomAxis: yAxis
		};
		CIQ.fillIntersecting(stx, sd.panel, parameters);

		function fillFutureCloud(points, isUp){
			var fParams={
				color: isUp===false?bottomColor:isUp?topColor:"transparent",
				opacity: 0.3,
				panelName: sd.panel,
				yAxis: yAxis
			};
			CIQ.fillArea(stx,points,fParams);
			stx.endClip();
		}

		var panel = stx.panels[sd.panel];
		var xInit=stx.pixelFromBar(quotes.length-1, panel.chart);
		var ayInit=stx.pixelFromPrice(quotes[quotes.length-1][topBand], panel, yAxis);
		var byInit=stx.pixelFromPrice(quotes[quotes.length-1][bottomBand], panel, yAxis);
		var cloud=[[xInit,byInit],[xInit,ayInit]], isUpCloud=null;

		var futureA=sd.futureA, futureB=sd.futureB;
		if(sd.chart.dataSegment.length>=sd.chart.scroll){
			for(var i=0;futureA && i<futureA.length-1;i++){
				if(futureA[i]===null || isNaN(futureA[i]) || futureB[i]===null || isNaN(futureB[i])) continue;
				var x1=stx.pixelFromBar(quotes.length+i, panel.chart);
				var x2=stx.pixelFromBar(quotes.length+i+1, panel.chart);
				var ay1=stx.pixelFromPrice(futureA[i], panel, yAxis);
				var ay2=stx.pixelFromPrice(futureA[i+1], panel, yAxis);
				var by1=stx.pixelFromPrice(futureB[i], panel, yAxis);
				var by2=stx.pixelFromPrice(futureB[i+1], panel, yAxis);
				cloud.push([x1, ay1]);
				cloud.unshift([x1,by1]);
				isUpCloud=ay1<by1;
				if((isUpCloud && ay2>by2) || (!isUpCloud && ay2<by2)){
					var interX=CIQ.intersectLineLineX(x1, x2, ay1, ay2, x1, x2, by1, by2);
					var interY=CIQ.intersectLineLineY(x1, x2, ay1, ay2, x1, x2, by1, by2);
					cloud.push([interX, interY]);
					fillFutureCloud(cloud, isUpCloud);
					cloud=[[interX, interY]];
					isUpCloud=null;
				}
			}
			if(cloud.length>2) fillFutureCloud(cloud,isUpCloud);
		}
		CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);
	};

	// NOTE: Darvas will only display on the chart panel sharing the yAxis.
	CIQ.Studies.displayDarvas=function(stx, sd, quotes){
		var levelsColor=CIQ.Studies.determineColor(sd.outputs.Levels);
		if(!levelsColor || levelsColor=="auto" || CIQ.isTransparent(levelsColor)) levelsColor=stx.defaultColor;
		var darvasColor=CIQ.Studies.determineColor(sd.outputs.Darvas);
		if(!darvasColor || darvasColor=="auto" || CIQ.isTransparent(darvasColor)) darvasColor=stx.defaultColor;
		var ghostColor=CIQ.Studies.determineColor(sd.outputs.Ghost);
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
				slyh1=q["Profit "+sd.name]?Math.floor(stx.pixelFromPrice(q["Profit "+sd.name], panel)):null;
				var slyh0=q1 && q1["Profit "+sd.name]?Math.floor(stx.pixelFromPrice(q1["Profit "+sd.name], panel)):null;
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
				var q1=quotes[i-1];
				if(!q) continue;
				slyl1=q["Loss "+sd.name]?Math.floor(stx.pixelFromPrice(q["Loss "+sd.name], panel)):null;
				var slyl0=q1 && q1["Loss "+sd.name]?Math.floor(stx.pixelFromPrice(q1["Loss "+sd.name], panel)):null;
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
				var y=stx.pixelFromPrice(quotes[i].High, stx.chart.panel);
				stx.chart.context.fillText("\u25BC", stx.pixelFromBar(i)-signalWidth, y-5); // down arrow
			}

			if(quotes[i].candleWidth) myWidth=Math.floor(Math.max(1,quotes[i].candleWidth));
			if(quotes[i]["Darvas "+sd.name]){
				q=quotes[i]["Darvas "+sd.name];
				if(q.State==1 && !inDarvas){
					dx=Math.floor(stx.pixelFromBar(i, panel.chart)-myWidth/2);
					dy=Math.floor(stx.pixelFromPrice(q.High, panel));
					dh=Math.floor(stx.pixelFromPrice(q.Low, panel))-dy;
					inDarvas=true;
				}else if(q.State===0){
					dw=Math.floor(stx.pixelFromBar(i, panel.chart)+myWidth/2)-dx;
					dy=Math.floor(stx.pixelFromPrice(q.High, panel));
					dh=Math.floor(stx.pixelFromPrice(q.Low, panel))-dy;
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
					gy=Math.floor(stx.pixelFromPrice(q.High, panel));
					gw=Math.floor((q.End-q.Start+1)*stx.layout.candleWidth+myWidth/2);
					gh=Math.floor(stx.pixelFromPrice(q.Low, panel))-gy;
					inGhost=true;
				}else if(q.State===0){
					if(q.Start==q.End) gx=Math.floor(stx.pixelFromBar(i, panel.chart)-myWidth/2);
					gw=Math.floor(stx.pixelFromBar(i, panel.chart)+myWidth/2)-gx;
					gy=Math.floor(stx.pixelFromPrice(q.High, panel));
					gh=Math.floor(stx.pixelFromPrice(q.Low, panel))-gy;
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
		var yAxis=stx.getYAxisByName(panel, sd.name);
		function colorFunction(stx, quote, mode){
			if(quote && quote["_Direction "+sd.name]<0) return sd.outputs.Downtrend;
			return sd.outputs.Uptrend;
		}
		var params={skipTransform:panel.name!=sd.chart.name, skipProjections:true, label:stx.preferences.labels, yAxis:yAxis};
		var context=stx.chart.context;
		context.strokeStyle=colorFunction(stx,quotes[quotes.length-1]);
		context.lineWidth=2;
		if(sd.highlight) context.lineWidth=3;
		var trendName="Trend "+sd.name;
		for(var x=0;panel.chart.transformFunc && yAxis!=panel.chart.yAxis && x<quotes.length;x++){
			var q=quotes[x];
			if(q && q.transform) {
				q.transform[trendName]=panel.chart.transformFunc(stx,panel.chart,q[trendName]);
			}
		}
		stx.plotDataSegmentAsLine(trendName, panel, params, colorFunction);
		context.lineWidth=1;

		stx.startClip(sd.panel);
		var signalWidth=stx.chart.context.measureText("\u25B2").width/2;
		var i;
		for(i=0;i<quotes.length;i++){
			if(!quotes[i] || !quotes[i-1]) continue;
			if(quotes[i-1]["_Direction "+sd.name]>quotes[i]["_Direction "+sd.name]){
				stx.chart.context.fillStyle=sd.outputs.Downtrend;
				stx.chart.context.textBaseline="bottom";
				var yh=stx.pixelFromPrice(quotes[i].High, panel, yAxis);
				for(var d=5;d<=45;d+=10) stx.chart.context.fillText("\u25BC", stx.pixelFromBar(i)-signalWidth, yh-d); // down arrow
			}else if(quotes[i-1]["_Direction "+sd.name]<quotes[i]["_Direction "+sd.name]){
				stx.chart.context.fillStyle=sd.outputs.Uptrend;
				stx.chart.context.textBaseline="top";
				var yl=stx.pixelFromPrice(quotes[i].Low, panel, yAxis);
				for(var u=5;u<=45;u+=10) stx.chart.context.fillText("\u25B2", stx.pixelFromBar(i)-signalWidth, yl+u); // up arrow
			}
		}
		stx.endClip();
	};

	CIQ.Studies.displayVsComparisonSymbol=function(stx, sd, quotes){
		var symbol=sd.inputs["Comparison Symbol"].toUpperCase();
		if(!stx.getSeries({symbol: symbol, chart: sd.chart}).length){
			stx.watermark(sd.panel,"center","bottom",stx.translateIf(sd.study.name)+": "+stx.translateIf("Not Available"));
			return;
		}
		var params={skipTransform:stx.panels[sd.panel].name!=sd.chart.name, panelName:sd.panel, band:"Result " + sd.name, threshold:sd.study.centerline, yAxis:stx.getYAxisByName(stx.panels[sd.panel], sd.name), gapDisplayStyle:true};
		for(var c=quotes.length-1;c>=0;c--){
			if(quotes[c] && quotes[c][symbol]){
				CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);
				if(sd.study.centerline || sd.study.centerline===0){
					if(sd.outputs.Gain) CIQ.preparePeakValleyFill(stx,CIQ.extend(params,{direction:1, color:CIQ.Studies.determineColor(sd.outputs.Gain)}));
					if(sd.outputs.Loss) CIQ.preparePeakValleyFill(stx,CIQ.extend(params,{direction:-1, color:CIQ.Studies.determineColor(sd.outputs.Loss)}));
				}
				return;
			}
		}
	};

	CIQ.Studies.displayMFI=function(stx, sd, quotes){
		var panel = stx.panels[sd.panel];
		var yAxis=stx.getYAxisByName(panel,sd.name) || panel.yAxis;

		var y=yAxis.bottom;

		var myWidth=stx.layout.candleWidth-2;
		if(myWidth<2) myWidth=1;

		var green=CIQ.Studies.determineColor(sd.outputs.Green);
		var fade=CIQ.Studies.determineColor(sd.outputs.Fade);
		var fake=CIQ.Studies.determineColor(sd.outputs.Fake);
		var squat=CIQ.Studies.determineColor(sd.outputs.Squat);
		stx.canvasColor("stx_histogram");
		if(!sd.underlay) stx.chart.context.globalAlpha=1;
		stx.chart.context.fillStyle="#CCCCCC";
		stx.startClip(sd.panel);
		for(var i=0;i<quotes.length;i++){
			var quote=quotes[i], quote_1=quotes[i-1];
			if(!quote_1) quote_1=stx.getPreviousBar(stx.chart, sd.name+"_hist", i);
			if(!quote) continue;
			if(!quote_1);
			else if(quote_1[sd.name+"_hist"]<quote[sd.name+"_hist"]){
				if(quote_1.Volume<quote.Volume) stx.chart.context.fillStyle=green;
				else if(quote_1.Volume>quote.Volume) stx.chart.context.fillStyle=fake;
			}
			else if(quote_1[sd.name+"_hist"]>quote[sd.name+"_hist"]){
				if(quote_1.Volume<quote.Volume) stx.chart.context.fillStyle=squat;
				else if(quote_1.Volume>quote.Volume) stx.chart.context.fillStyle=fade;
			}
			if(quote.candleWidth) myWidth=Math.floor(Math.max(1,quote.candleWidth-2));
			stx.chart.context.fillRect(Math.floor(stx.pixelFromBar(i, panel.chart)-myWidth/2),
					Math.floor(y),
					Math.floor(myWidth),
					Math.floor(stx.pixelFromPrice(quote[sd.name+"_hist"], panel, yAxis)-y));
		}
		stx.endClip();
	};

	CIQ.Studies.displayAwesomeOscillator=function(stx, sd, quotes){
		var panel = stx.panels[sd.panel];
		var yAxis=stx.getYAxisByName(panel, sd.name);

		var y=stx.pixelFromPrice(0, panel, yAxis);

		var myWidth=stx.layout.candleWidth-2;
		if(myWidth<2) myWidth=1;

		var upColor=CIQ.Studies.determineColor(sd.outputs["Increasing Bar"]);
		var downColor=CIQ.Studies.determineColor(sd.outputs["Decreasing Bar"]);
		stx.canvasColor("stx_histogram");
		if(!sd.underlay) stx.chart.context.globalAlpha=1;
		stx.chart.context.fillStyle="#CCCCCC";
		stx.startClip(sd.panel);
		for(var i=0;i<quotes.length;i++){
			var quote=quotes[i], quote_1=quotes[i-1];
			if(!quote_1) quote_1=stx.getPreviousBar(stx.chart, sd.name+"_hist", i);
			if(!quote) continue;
			if(!quote_1);
			else if(quote_1[sd.name+"_hist"]<quote[sd.name+"_hist"]) stx.chart.context.fillStyle=upColor;
			else if(quote_1[sd.name+"_hist"]>quote[sd.name+"_hist"]) stx.chart.context.fillStyle=downColor;
			if(quote.candleWidth) myWidth=Math.floor(Math.max(1,quote.candleWidth-2));
			stx.chart.context.fillRect(Math.floor(stx.pixelFromBar(i, panel.chart)-myWidth/2),
					Math.floor(y),
					Math.floor(myWidth),
					Math.floor(stx.pixelFromPrice(quote[sd.name+"_hist"], panel, yAxis)-y));
		}
		stx.endClip();
	};

	CIQ.Studies.displayGator=function(stx, sd, quotes){
		var panel = stx.panels[sd.panel];
		var yAxis=stx.getYAxisByName(panel, sd.name);
		var y=stx.pixelFromPrice(0, panel, yAxis);

		var myWidth=stx.layout.candleWidth-2;
		if(myWidth<2) myWidth=1;

		var upColor=CIQ.Studies.determineColor(sd.outputs["Increasing Bar"]);
		var downColor=CIQ.Studies.determineColor(sd.outputs["Decreasing Bar"]);
		stx.canvasColor("stx_histogram");
		if(!sd.underlay) stx.chart.context.globalAlpha=1;
		stx.chart.context.fillStyle="#CCCCCC";
		stx.startClip(sd.panel);
		for(var i=0;i<quotes.length;i++){
			var quote=quotes[i], quote_1=quotes[i-1];
			if(!quote) continue;
			for(var j=1;j<=2;j++){
				if(!quote_1) quote_1=stx.getPreviousBar(stx.chart, sd.name+"_hist"+j, i);
				if(!quote_1) stx.chart.context.fillStyle="#CCCCCC";
				else if(Math.abs(quote_1[sd.name+"_hist"+j])<Math.abs(quote[sd.name+"_hist"+j])) stx.chart.context.fillStyle=upColor;
				else if(Math.abs(quote_1[sd.name+"_hist"+j])>Math.abs(quote[sd.name+"_hist"+j])) stx.chart.context.fillStyle=downColor;
				if(quote.candleWidth) myWidth=Math.floor(Math.max(1,quote.candleWidth-2));
				stx.chart.context.fillRect(Math.floor(stx.pixelFromBar(i, panel.chart)-myWidth/2),
						Math.floor(y),
						Math.floor(myWidth),
						Math.floor(stx.pixelFromPrice(quote[sd.name+"_hist"+j], panel, yAxis)-y));
			}
		}
		stx.endClip();
	};

	CIQ.Studies.initElderImpulse=function(stx, type, inputs, outputs, parameters, panel){
		var sd=CIQ.Studies.initializeFN(stx, type, inputs, outputs, parameters, panel);
		stx.chart.customChart={
			chartType: "colored_bar",
			colorFunction: function(stx, quote, mode){
				var color=quote["Result "+sd.name];
				if(color && typeof(color)=="object") color=color.color;
				return color;
			}
		};
		stx.setMainSeriesRenderer();
		return sd;
	};

	CIQ.Studies.displayPivotPoints=function(stx, sd, quotes){
		sd.noSlopes=!sd.inputs.Continuous;
		CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);
		if(sd.inputs.Shading) {
			var panel=stx.panels[sd.panel];
			var params={
				noSlopes: sd.noSlopes,
				opacity: sd.parameters.opacity?sd.parameters.opacity:0.2,
				skipTransform: panel.name!=sd.chart.name,
				yAxis: stx.getYAxisByName(panel, sd.name)
			};
			CIQ.prepareChannelFill(stx,CIQ.extend({panelName: sd.panel, topBand:"Resistance 3 " + sd.name, bottomBand:"Resistance 2 " + sd.name,color:CIQ.Studies.determineColor(sd.outputs["Resistance 3"])}, params));
			CIQ.prepareChannelFill(stx,CIQ.extend({panelName: sd.panel, topBand:"Resistance 2 " + sd.name, bottomBand:"Resistance 1 " + sd.name,color:CIQ.Studies.determineColor(sd.outputs["Resistance 2"])}, params));
			CIQ.prepareChannelFill(stx,CIQ.extend({panelName: sd.panel, topBand:"Resistance 1 " + sd.name, bottomBand:"Pivot " + sd.name,color:CIQ.Studies.determineColor(sd.outputs["Resistance 1"])}, params));
			CIQ.prepareChannelFill(stx,CIQ.extend({panelName: sd.panel, topBand:"Support 1 " + sd.name, bottomBand:"Pivot " + sd.name,color:CIQ.Studies.determineColor(sd.outputs["Support 1"])}, params));
			CIQ.prepareChannelFill(stx,CIQ.extend({panelName: sd.panel, topBand:"Support 2 " + sd.name, bottomBand:"Support 1 " + sd.name,color:CIQ.Studies.determineColor(sd.outputs["Support 2"])}, params));
			CIQ.prepareChannelFill(stx,CIQ.extend({panelName: sd.panel, topBand:"Support 3 " + sd.name, bottomBand:"Support 2 " + sd.name,color:CIQ.Studies.determineColor(sd.outputs["Support 3"])}, params));
		}
	};

	CIQ.Studies.displayAlligator=function(stx, sd, quotes){
		function drawFractal(highLow,index){
			//stx.canvasFont("???");
			var y;
			if(highLow=="high") {
				stx.chart.context.fillStyle=stx.defaultColor;
				stx.chart.context.textBaseline="bottom";
				y=stx.pixelFromPrice(quotes[index].High, panel, yAxis);
				stx.chart.context.fillText("\u25B2", stx.pixelFromBar(i,stx.chart)-stx.chart.context.measureText("\u25B2").width/2+1, y-5); // up arrow
			}else if (highLow=="low") {
				stx.chart.context.fillStyle=stx.defaultColor;
				stx.chart.context.textBaseline="top";
				y=stx.pixelFromPrice(quotes[index].Low, panel, yAxis);
				stx.chart.context.fillText("\u25BC",stx.pixelFromBar(i,stx.chart)-stx.chart.context.measureText("\u25BC").width/2+1, y+5); // down arrow
			}
		}
		var panel = stx.panels[sd.panel];
		var yAxis=stx.getYAxisByName(panel, sd.name);
		CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);
		if(sd.inputs["Show Fractals"]){
			stx.startClip(sd.panel);
			stx.chart.context.globalAlpha=sd.underlay?0.3:1;
			for(var i=2;i<quotes.length-2;i++){
				if( quotes[i]){
					if(quotes[i]["Fractal High "+sd.name]) drawFractal("high",i);
					if(quotes[i]["Fractal Low "+sd.name]) drawFractal("low",i);
				}
			}
			stx.endClip();
		}
	};

	CIQ.Studies.displayRainbowMA=function(stx, sd, quotes){
		var panel = stx.panels[sd.panel];
		//just need to display in reverse order from outputMap
		for(var i=10;i>0;i--){
			CIQ.Studies.displayIndividualSeriesAsLine(stx, sd, panel, "SMA"+i+" "+sd.name, quotes);
		}
	};

	CIQ.Studies.displayRainbowOsc=function(stx, sd, quotes){
		CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);
		var panel=stx.panels[sd.panel];
		var yAxis=stx.getYAxisByName(panel, sd.name);

		stx.startClip(sd.panel);
		var y=stx.pixelFromPrice(0, panel, yAxis);
		var skipTransform=panel.name!=sd.chart.name;

		var upColor=CIQ.Studies.determineColor(sd.outputs["Positive Bar"]);
		stx.chart.context.strokeStyle=upColor;
		stx.plotDataSegmentAsLine("Over "+sd.name, panel, {skipTransform:skipTransform, label:false, yAxis:yAxis});

		var upgradient=stx.chart.context.createLinearGradient(0,y,0,panel.yAxis.top);
		upgradient.addColorStop(0, stx.containerColor);
		upgradient.addColorStop(1, upColor);
		CIQ.prepareChannelFill(stx,{skipTransform:skipTransform,"color":upgradient,"opacity":1,"panelName":sd.panel,"topBand":"Over "+sd.name,"bottomBand":"Zero "+sd.name,"yAxis":yAxis});

		var downColor=CIQ.Studies.determineColor(sd.outputs["Negative Bar"]);
		stx.chart.context.strokeStyle=downColor;
		stx.plotDataSegmentAsLine("Under "+sd.name, panel, {skipTransform:skipTransform, label:false, yAxis:yAxis});

		var dngradient=stx.chart.context.createLinearGradient(0,y,0,panel.yAxis.bottom);
		dngradient.addColorStop(0, stx.containerColor);
		dngradient.addColorStop(1, downColor);
		CIQ.prepareChannelFill(stx,{skipTransform:skipTransform,"color":dngradient,"opacity":1,"panelName":sd.panel,"topBand":"Zero "+sd.name,"bottomBand":"Under "+sd.name,"yAxis":yAxis});

		var myWidth=stx.layout.candleWidth-2;
		if(myWidth<2) myWidth=1;

		stx.canvasColor("stx_histogram");
		if(!sd.underlay) stx.chart.context.globalAlpha=1;
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
					Math.floor(stx.pixelFromPrice(quote[sd.name+"_hist"], panel, yAxis)-y));
		}
		stx.endClip();
	};

	CIQ.Studies.displayZigZag=function(stx, sd, quotes){
		var highLowBars=stx.chart.highLowBars || stx.highLowBars[stx.layout.chartType];
		if(sd.highLowChart!=highLowBars){
			sd.highLowChart=highLowBars;
			sd.startFrom=0;
			sd.study.calculateFN(stx, sd);
		}
		var chart=stx.chart;
		for(var i=0;i<quotes.length;i++){
			var quote=quotes[i];
			if(quote){
				if(quote["_shadowCopy "+sd.name]) {
					delete quote["Result "+sd.name];
					delete quote["_shadowCopy "+sd.name];
				}
				if(!quote["Result "+sd.name]){
					if(quote.transform) delete quote.transform["Result "+sd.name];				
				}
			}
		}
		var q0=quotes[0],ql=quotes[quotes.length-1];
		if(q0 && q0["ShadowResult "+sd.name]) {
			q0["Result "+sd.name]=q0["ShadowResult "+sd.name];
			if(q0.transform) q0.transform["Result "+sd.name]=chart.transformFunc(stx, chart, q0["ShadowResult "+sd.name]);
			q0["_shadowCopy "+sd.name]=1;
		}
		if(ql && ql["ShadowResult "+sd.name]){
			ql["Result "+sd.name]=ql["ShadowResult "+sd.name];
			if(ql.transform) ql.transform["Result "+sd.name]=chart.transformFunc(stx, chart, ql["ShadowResult "+sd.name]);
			ql["_shadowCopy "+sd.name]=1;
		}
		CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);
	};


	/**
	 * Creates a volume profile underlay for the chart. The underlay is always 25% of the width of the chart.
	 * The color is determined by the 'sd.outputs["Bars Color"]' parameter and opacity and border colors can be controlled with the class stx_volume_profile
	 * NOTE: Volume Profile will only display on the chart panel sharing the yAxis.
	 */

	CIQ.Studies.displayVolumeProfile=function(stx, sd, quotes){
		if(!stx || !stx.chart.dataSet) return;

		var chart = stx.chart;

		var numberBars=sd.parameters.numberOfBars;
		var widthPercentage=sd.parameters.widthPercentage;
		var displayBorder=sd.parameters.displayBorder;
		var displayVolume=sd.parameters.displayVolume;
		//set defaults
		if(!numberBars || numberBars<0) numberBars = 30;
		numberBars=Math.ceil(numberBars);
		if(!widthPercentage || widthPercentage<0) widthPercentage = 0.25;
		if(displayBorder!==false) displayBorder = true;
		if(displayVolume!==true) displayVolume = false;
		//decide how many bars
		var interval = (chart.highValue-chart.lowValue)/numberBars;
		if(interval===0) return;
		var priceVolArry = [];

		// set the boundaries for the bars -- add .1 to the loop to account for possible rounding errors.
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
			var volume=prices.Volume;
			if(sd.panel==chart.name && prices.transform) prices=prices.transform;

			var bottomRange = priceVolArry[0][0];
			var topRange = 0;
			for(var x=1;x<priceVolArry.length;x++){
				topRange= priceVolArry[x][0];
				if(
					(prices.Low >= bottomRange && prices.Low <= topRange) ||
					(prices.Low < bottomRange && prices.High > topRange) ||
					(prices.High >= bottomRange && prices.High <= topRange)
				){
					priceVolArry[x][1]+=volume;
					if(priceVolArry[x][1]>volumeMax) volumeMax=priceVolArry[x][1];
				}
				bottomRange = topRange;
			}
		}
		if(volumeMax===0){
			stx.watermark("chart","center","top",stx.translateIf("Not enough data to render the Volume Profile"));
			return;
		}

		stx.setStyle("stx_volume_profile","color",CIQ.Studies.determineColor(sd.outputs["Bars Color"]));
		var context=chart.context;
		var fontstyle="stx-float-date";
		stx.canvasFont(fontstyle, context);
		var txtHeight=stx.getCanvasFontSize(fontstyle);
		var panel = chart.panel;
		var chartBottom = panel.yAxis.bottom;
		var barBottom=Math.round(chart.width)-0.5;  //bottom x coordinate for the bar  -- remember bars are sideways so the bottom is on the x axis
		var barMaxHeight=(chart.width)*widthPercentage;  // pixels for highest bar
		var borderColor=stx.canvasStyle("stx_volume_profile").borderColor;
		var bordersOn=(!CIQ.isTransparent(stx.canvasStyle("stx_volume_profile").borderColor)) && displayBorder;

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
					var barTop =Math.round(barBottom-(priceVolArry[i][1]*barMaxHeight/volumeMax))-0.5;
					var bottomRangePixel=Math.round(self.pixelFromTransformedValue(bottomRange, panel))+0.5;
					var topRangePixel = Math.round(self.pixelFromTransformedValue(priceVolArry[i][0], panel))+0.5;

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
							if ( displayVolume ) {
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
		"val lines": {
			"name": "Valuation Lines",
			"calculateFN": function() {},
			"seriesFN": function(stx, sd, quotes) {
				CIQ.Studies.calculateValuationLines(stx, sd, quotes);
				CIQ.Studies.displayValuationLines(stx, sd);
			},
			"overlay": true,
			"yAxisFN": function(){},
			"inputs": {
				"Field": "field",
				"Average Type": ["mean", "median", "harmonic"],
				"Display Average": true,
				"Display 1 Standard Deviation (1\u03C3)": false,
				"Display 2 Standard Deviation (2\u03C3)": false,
				"Display 3 Standard Deviation (3\u03C3)": false
			},
			"outputs": {
				"Average": "#00afed",
				"1 Standard Deviation (1\u03C3)": "#e1e1e1",
				"2 Standard Deviation (2\u03C3)": "#85c99e",
				"3 Standard Deviation (3\u03C3)": "#fff69e"
			}
		},
		"correl": {
			"name": "Correlation Coefficient",
			"range": "-1 to 1",
			"calculateFN":  CIQ.Studies.calculateCorrelationCoefficient,
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
			"inputs": {"Scale Factor":6},
			"outputs": {"Green":"#8bc176", "Fade":"#ab611f", "Fake":"#5f7cb8", "Squat":"#ffd0cf"}
		},
		"ATR Bands": {
			"name": "ATR Bands",
			"overlay": true,
			"seriesFN": CIQ.Studies.displayChannel,
			"calculateFN": CIQ.Studies.calculateATRBands,
			"inputs": {"Period":5, "Field":"field", "Shift": 3, "Channel Fill":true},
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
			"inputs": {"Period":21, "Multiplier":3, "Plot Type":["points","squarewave"], "HighLow":false},
			"outputs": {"Buy Stops":"#FF0000", "Sell Stops":"#00FF00"},
			"attributes":{
				Multiplier: {min:0.1,step:0.1}
			}
		},
		"Boll %b": {
			"name": "Bollinger %b",
			"calculateFN": CIQ.Studies.calculateBollinger,
			"inputs": {"Period":20, "Field":"field", "Standard Deviations": 2, "Moving Average Type":"ma"},
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
			"inputs": {"Period":20, "Field":"field", "Standard Deviations": 2, "Moving Average Type":"ma"},
			"outputs": {"Bandwidth":"auto"},
			"attributes": {
				"Standard Deviations":{min:0.1,step:0.1}
			}
		},
		"Donchian Width": {
			"name": "Donchian Width",
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
			"initializeFN": CIQ.Studies.initElderImpulse,
			"seriesFN": null,
			"customRemoval": true,
			"underlay": true,
			"inputs": {},
			"outputs": {"Bullish":"#8BC176", "Bearish":"#DD3E39", "Neutral":"#5F7CB8"},
			"removeFN": function(stx, sd){
				stx.chart.customChart=null;
				stx.setMainSeriesRenderer();
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
				"init":{opacity: 0.2}
			}
		},
		"VWAP": {
			"name": "VWAP",
			"overlay": true,
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
			"calculateFN": CIQ.Studies.calculateIchimoku,
			"seriesFN": CIQ.Studies.displayIchimoku,
			"inputs": {"Conversion Line Period":9, "Base Line Period": 26, "Leading Span B Period":52, "Lagging Span Period":26},
			"outputs": {"Conversion Line":"#0000FF", "Base Line":"#FF0000", "Leading Span A":"#00FF00", "Leading Span B":"#FF0000", "Lagging Span":"#808000"}
		},
		"P Rel": {
			"name": "Price Relative",
			"initializeFN": CIQ.Studies.initPriceRelative,
			"seriesFN": CIQ.Studies.displayVsComparisonSymbol,
			"calculateFN": CIQ.Studies.calculatePriceRelative,
			"centerline": 0,
			"inputs": {"Comparison Symbol":"SPY"},
			"deferUpdate": true
		},
		"Perf Idx": {
			"name": "Performance Index",
			"centerline": 1,
			"initializeFN": CIQ.Studies.initPriceRelative,
			"seriesFN": CIQ.Studies.displayVsComparisonSymbol,
			"calculateFN": CIQ.Studies.calculatePerformance,
			"inputs": {"Period":120, "Comparison Symbol":"SPY"},
			"outputs": {"Result":"auto", "Gain":"#00DD00", "Loss":"#FF0000"},
			"deferUpdate": true
		},
		"Beta": {
			"name": "Beta",
			"centerline": 1,
			"initializeFN": CIQ.Studies.initPriceRelative,
			"seriesFN": CIQ.Studies.displayVsComparisonSymbol,
			"calculateFN": CIQ.Studies.calculateBeta,
			"inputs": {"Period":20, "Comparison Symbol":"SPY"},
			"deferUpdate": true
		},
		"Ulcer": {
			"name": "Ulcer Index",
			"calculateFN": CIQ.Studies.calculateUlcerIndex,
			"inputs": {"Period":14, "Field":"field"}
		},
		"Bal Pwr": {
			"name": "Balance of Power",
			"range": "-1 to 1",
			"centerline": 0,
			"calculateFN": CIQ.Studies.calculateBalanceOfPower,
			"inputs": {"Period":14, "Moving Average Type":"ma"}
		},
		"Trend Int": {
			"name": "Trend Intensity Index",
			"calculateFN": CIQ.Studies.calculateTrendIntensity,
			"range": "0 to 100",
			"inputs": {"Period":14, "Field":"field", "Signal Period":9},
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
			"inputs": {"Period":14, "Field":"field", "Moving Average Type":"ma"}
		},
		"Rainbow MA": {
			"name": "Rainbow Moving Average",
			"overlay": true,
			"calculateFN": CIQ.Studies.calculateRainbow,
			"seriesFN": CIQ.Studies.displayRainbowMA,
			"inputs": {"Period":2, "Field":"field"},
			"outputs": {"SMA1":"#FF0000", "SMA2":"#FF7F00", "SMA3":"#FFFF00", "SMA4":"#7FFF00", "SMA5":"#00FF7F", "SMA6":"#00FFFF", "SMA7":"#007FFF", "SMA8":"#0000FF", "SMA9":"#7F00FF", "SMA10":"#FF00FF"}
		},
		"Rainbow Osc": {
			"name": "Rainbow Oscillator",
			"calculateFN": CIQ.Studies.calculateRainbow,
			"seriesFN": CIQ.Studies.displayRainbowOsc,
			"centerline": 0,
			"inputs": {"Period":2, "Field":"field", "HHV/LLV Lookback":10},
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
			"inputs": {"ATH Lookback Period":100, "Exit Field":["close","high/low"], "Ghost Boxes":true, "Stop Levels": false, "Level Offset":0.01, "Price Minimum": 5, "Volume Spike":false, "Volume % of Avg":400},
			"outputs": {"Darvas":"#5F7CB8", "Ghost":"#699158", "Levels":"auto"},
			"customRemoval": true,
			"attributes": {
				"Price Minimum":{min:0.01,step:0.01},
				"yaxisDisplayValue":{hidden:true},
				"panelName":{hidden:true}
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
			"underlay": true,
			"seriesFN": CIQ.Studies.displayVolumeProfile,
			"calculateFN": null,
			"inputs": {},
			"outputs": {"Bars Color":"#b64a96"},
			"customRemoval": true,
			"parameters":{
				"init": {displayBorder:true, displayVolume:false, numberOfBars:30, widthPercentage:0.25}
			},
			"attributes": {
				"yaxisDisplayValue":{hidden:true},
				"panelName":{hidden:true}
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
				"init":{label:false}
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
			"inputs": {"Period":12,"Field":"field","Moving Average Type":"ma","Points Or Percent":["Points","Percent"]},
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
})/* removeIf(umd) */(typeof window !== 'undefined' ? window : global)/* endRemoveIf(umd) */;
