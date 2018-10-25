/* removeIf(umd) */ ;(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['componentUI'], factory);
	} else if (typeof exports === 'object') {
		module.exports = factory(require('./componentUI'));
	} else {
		factory(root);
	}
})(this, function(_exports) {
	var CIQ = _exports.CIQ;
	/* endRemoveIf(umd) */

	/**
	 * Chart Title web component `<cq-chart-title>`.
	 *
	 * Note, if the `cq-marker` is added to the element, and it is placed within the
	 * chartArea, the element will sit above the chart bars.
	 *
	 * `<cq-symbol></cq-symbol>` will display the raw symbol for the chart (`chart.symbol`).<br>
	 * `<cq-symbol-description></cq-symbol-description>` will display the `chart.symbolDisplay`. See {@link CIQ.ChartEngine.Chart#symbolDisplay} for details on how to set this value.
	 *
	 * Set attribute "cq-browser-tab" to true in order to get the stock symbol and latest price to update in the browser tab.
	 *
	 * Set member previousClose to the prior day's closing price in order to calculate and display change.
	 * If previousClose is not set, then iqPrevClose from the dataSet will be the default
	 *
	 * @namespace WebComponents.cq-chart-title
	 * @since 06-15-16
	 * @example
	 * <cq-chart-title>
	 * 	<cq-symbol></cq-symbol>
	 * 	<cq-chart-price>
	 * 		<cq-current-price></cq-current-price>
	 * 		<cq-change>
	 * 			<div class="ico"></div> <cq-todays-change></cq-todays-change> (<cq-todays-change-pct></cq-todays-change-pct>)
	 * 		</cq-change>
	 * 	</cq-chart-price>
	 * </cq-chart-title>
	 *
	 * @example
	 * //You can set a more descriptive name by using http://documentation.chartiq.com/CIQ.ChartEngine.Chart.html#symbolDisplay
	 * // and then enabling that on the tile.
	 *
	 * //In your HTML file look for:
	 * <cq-symbol></cq-symbol>
	 * //and replace it with :
	 * <cq-symbol-description></cq-symbol-description>
	 *
	 * //In your quote feed add the following line:
	 * params.stx.chart.symbolDisplay=response.fullName;
	 *
	 * //Like so:
	 * quotefeed.fetchInitialData=function (symbol, suggestedStartDate, suggestedEndDate, params, cb) {
	 *  var queryUrl = this.url; // using filter:true for after hours
	 *
	 *  CIQ.postAjax(queryUrl, null, function(status, response){
	 *   // process the HTTP response from the datafeed
	 *   if(status==200){ // if successful response from datafeed
	 *    params.stx.chart.symbolDisplay=response.fullName; //<<<<<<<<<<<<<<<================
	 *    var newQuotes = quotefeed.formatChartData(response);
	 *    cb({quotes:newQuotes, moreAvailable:true, attribution:{source:"simulator", exchange:"RANDOM"}}); // return the fetched data; init moreAvailable to enable pagination
	 *   } else { // else error response from datafeed
	 *    cb({error:(response?response:status)});	// specify error in callback
	 *   }
	 *  });
	 * };
	 * @since  4.0.0
	 * Browser tab now updates with stock symbol and latest price using cq-browser-tab attribute
	 */
	class ChartTitle extends CIQ.UI.ModalTag {
		constructor() {
			super()
			this.attached=null
			this.previousClose=null;
		}

	connectedCallback(){
		if(this.attached) return;
		CIQ.UI.ModalTag.attachedCallback.apply(this);
		this.attached=true;
	};

	setContext(context){
		var self = this;
		CIQ.UI.observe({
			obj:self.context.stx.chart,
			member: "symbolObject",
			action:"callback",
			value:function(){
				if(self.context.stx.currentQuote()) self.previousClose = self.context.stx.currentQuote().iqPrevClose;
			}
		});
		this.initialize();
	};


	/**
	 * Begins the Title helper. This observes the chart and updates the title elements as necessary.
	 * @alias begin
	 * @memberof WebComponents.cq-chart-title
	 */
	begin(){
		var self=this;
		this.addInjection("append", "createDataSet", function(){
			self.update();
		});
		this.update();
	};

	initialize(params){
		this.params=params?params:{};
		if(typeof this.params.autoStart=="undefined") this.params.autoStart=true;
		this.marker=null;

		if(this.params.autoStart) this.begin();
	};

	/**
	 * Keep this value up to date in order to calculate change from yesterday's close
	 * @type {Float}
	 * @alias previousClose
	 * @memberof WebComponents.cq-chart-title
	 */


	/**
	 * Updates the values in the node
	 * @alias update
	 * @memberof WebComponents.cq-chart-title
	 */
	update(){
		var stx=this.context.stx;

		var node=$(this);
		if(stx.chart.dataSet && stx.chart.dataSet.length) node.addClass("stx-show");
		else node.removeClass("stx-show");
		var symbolDiv=node.find("cq-symbol");
		var symbolDescriptionDiv=node.find("cq-symbol-description");
		var currentPriceDiv=node.find("cq-current-price");
		var todaysChangeDiv=node.find("cq-todays-change");
		var todaysChangePctDiv=node.find("cq-todays-change-pct");
		var chartPriceDiv=node.find("cq-chart-price");
		var changeDiv=node.find("cq-change");
		var doUpdateBrowserTab=this.node.truthyAttr("cq-browser-tab");
		var doUpdatePrice=chartPriceDiv.length;
		var symbol=stx.chart.symbol, symbolDisplay=stx.chart.symbolDisplay;
		var internationalizer=stx.internationalizer;
		var priceChanged=false;

		symbolDiv.textBetter(symbol);

		if(stx.isHistoricalModeSet){
			currentPriceDiv.textBetter("");
			changeDiv.css({"display":"none"});
			// only change the display so that you don't wreck the line spacing and parens
			return;
		}

		var todaysChange="", todaysChangePct=0, todaysChangeDisplay="", currentPrice="";
		var currentQuote=stx.currentQuote();
		currentPrice=currentQuote?currentQuote.Close:"";
		if(currentPrice && doUpdatePrice){
			var oldPrice=parseFloat(currentPriceDiv.text());
			if(currentPriceDiv.textBetter(stx.formatYAxisPrice(currentPrice, stx.chart.panel))){
				priceChanged=true;
				if(typeof(currentPriceDiv.attr("cq-animate"))!="undefined"){
					CIQ.UI.animatePrice(currentPriceDiv, currentPrice, oldPrice);
				}
			}
		}

		symbolDescriptionDiv.textBetter(symbolDisplay?symbolDisplay:symbol);

		if((doUpdatePrice || doUpdateBrowserTab) && symbol && priceChanged){
			// Default to iqPrevClose if the developer hasn't set this.previousClose
			var previousClose = this.previousClose?this.previousClose: (currentQuote ? currentQuote.iqPrevClose : null);

			if(currentQuote && previousClose){
				todaysChange=CIQ.fixPrice(currentQuote.Close-previousClose);
				todaysChangePct=todaysChange/previousClose*100;
				if(internationalizer){
					todaysChangeDisplay=internationalizer.percent2.format(todaysChangePct/100);
				}else{
					todaysChangeDisplay=todaysChangePct.toFixed(2) + "%";
				}
				changeDiv.css({"display":"block"});
			}else{
				changeDiv.css({"display":"none"});
			}
			var todaysChangeAbs=Math.abs(todaysChange);
			if(todaysChangeAbs){
				todaysChangeDiv.textBetter(stx.formatYAxisPrice(todaysChangeAbs, stx.chart.panel));
			}
			todaysChangePctDiv.textBetter(todaysChangeDisplay);
			if(todaysChangeDisplay!=="" && todaysChangePct>0){
				chartPriceDiv.removeClass("stx-down").addClass("stx-up");
			}else if(todaysChangeDisplay!=="" && todaysChangePct<0){
				chartPriceDiv.removeClass("stx-up").addClass("stx-down");
			}else{
				chartPriceDiv.removeClass("stx-down").removeClass("stx-up");
			}

			// These strange characters create some spacing so that the title appears
			// correctly in a browser tab
			this.title=symbol + " \u200b \u200b " + currentPrice + " \u200b \u200b \u200b ";
			if(todaysChangePct>0){
				this.title+="\u25b2 " + todaysChangeAbs;
			}else if(todaysChangePct<0){
				this.title+="\u25bc " + todaysChangeAbs;
			}
			if(doUpdateBrowserTab){
				document.title=this.title;
			}
		}
	};
}

	CIQ.UI.ChartTitle=customElements.define("cq-chart-title", ChartTitle);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
