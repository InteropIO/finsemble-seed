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
	 * Symbol comparison component `<cq-comparison>`.
	 *
	 * Add attribute cq-marker in order to have the component insert itself as a marker on the chart
	 *
	 * @namespace WebComponents.cq-comparison
	 * @example
<cq-comparison cq-marker>
	<cq-menu class="cq-comparison-new">
		<cq-comparison-add-label>
			<cq-comparison-plus></cq-comparison-plus><span>Compare</span><span>...</span>
		</cq-comparison-add-label>
		<cq-comparison-add>
			<cq-comparison-lookup-frame>
				<cq-lookup cq-keystroke-claim>
					<cq-lookup-input cq-no-close>
						<input type="text" cq-focus spellcheck="off" autocomplete="off" autocorrect="off" autocapitalize="off" placeholder="Enter Symbol">
						<cq-lookup-icon></cq-lookup-icon>
					</cq-lookup-input>
					<cq-lookup-results>
						<cq-lookup-filters cq-no-close>
							<cq-filter class="true">ALL</cq-filter>
							<cq-filter>STOCKS</cq-filter>
							<cq-filter>FX</cq-filter>
							<cq-filter>INDEXES</cq-filter>
							<cq-filter>FUNDS</cq-filter>
							<cq-filter>FUTURES</cq-filter>
						</cq-lookup-filters>
						<cq-scroll></cq-scroll>
					</cq-lookup-results>
				</cq-lookup>
			</cq-comparison-lookup-frame>
			<cq-swatch cq-no-close></cq-swatch>
			<span><cq-accept-btn class="stx-btn">ADD</cq-accept-btn></span>
		</cq-comparison-add>
	</cq-menu>
	<cq-comparison-key>
		<template cq-comparison-item>
			<cq-comparison-item>
				<cq-comparison-swatch></cq-comparison-swatch>
				<cq-comparison-label>AAPL</cq-comparison-label>
				<!-- cq-comparison-price displays the current price with color animation -->
				<cq-comparison-price cq-animate></cq-comparison-price>
				<!-- cq-comparison-tick-price displays the price for the active crosshair item -->
				<!-- <cq-comparison-tick-price></cq-comparison-tick-price>	-->
				<cq-comparison-loader></cq-comparison-loader>
				<div class="stx-btn-ico ciq-close"></div>
			</cq-comparison-item>
		</template>
	</cq-comparison-key>
</cq-comparison>
	 */

	class Comparison extends CIQ.UI.ModalTag {
		constructor() {
			super()
			this.swatchColors=[]
		}

		connectedCallback(){
			if(this.attached) return;
			CIQ.UI.ModalTag.attachedCallback.apply(this);
			this.attached=true;
			this.swatchColors=["#8ec648", "#00afed",  "#ee652e", "#912a8e", "#fff126",
			"#e9088c", "#ea1d2c", "#00a553", "#00a99c",  "#0056a4", "#f4932f", "#0073ba", "#66308f", "#323390", ];
			this.loading=[];
		};
		/**
		 * Handles removing a series from the comparison.
		 * @param {string} symbol Name of series as a string.
		 * @param {object}  series Object containing info on series.
		 * @alias removeSeries
		 * @memberof WebComponents.cq-comparison
		 */
		removeSeries(symbol, series){
			//console.log(typeof symbol, symbol);
			//console.log(typeof series, series);
			this.context.stx.removeSeries(symbol);
		};

		/**
		 * Picks a color to display the new comparison as.
		 * Loops through preset colors and picks the next one on the list.
		 * If the all colors are taken then the last color will be repeated.
		 * @alias pickSwatchColor
		 * @memberof WebComponents.cq-comparison
		 */
		pickSwatchColor(){
			var node=$(this);
			var stx=this.context.stx;
			var swatch=node.find("cq-swatch");
			if(!swatch.length) return;
			var currentColor=swatch[0].style.backgroundColor;

			var usedColors={};
			for(var s in stx.chart.series){
				var series=stx.chart.series[s];
				if(!series.parameters.isComparison) continue;
				usedColors[series.parameters.color]=true;
			}

			if(currentColor!=="" && !usedColors[currentColor]) return; // Currently picked color not in use then allow it
			for(var i=0;i<this.swatchColors.length;i++){ // find first unused color from available colors
				if(!usedColors[this.swatchColors[i]]){
					swatch[0].style.backgroundColor=this.swatchColors[i];
					return;
				}
			}
			//Uh oh, all colors take. Last color will keep getting used.
		};

		/**
		 * The legend gets re-rendered whenever we createDataSet() (wherein the series may have changed).
		 * We re-render the entire thing each time, but we use a virtual DOM to determine whether
		 * to actually change anything on the screen (so as to avoid unnecessary flickering)
		 * @alias renderLegend
		 * @memberof WebComponents.cq-comparison
		 */
		renderLegend(){
			var node=$(this);
			var key=node.find("cq-comparison-key").cqvirtual();
			var stx=this.context.stx;
			var q=stx.currentQuote();
			for(var s in stx.chart.series){
				var series=stx.chart.series[s];
				if(!series.parameters.isComparison) continue;
				var frag=CIQ.UI.makeFromTemplate(this.template);
				var swatch=frag.find("cq-comparison-swatch");
				var label=frag.find("cq-comparison-label");
				var description=frag.find("cq-comparison-description");
				var price=frag.find("cq-comparison-price");
				var loader=frag.find("cq-comparison-loader");
				var btn=frag.find(".ciq-close");
				swatch.css({"background-color": series.parameters.color});
				label.text(stx.translateIf(series.display));
				description.text(stx.translateIf(series.description));
				frag.attr("cq-symbol", s);

				var symbol=series.parameters.symbol;
				if(price.length && q && symbol!==null){
					var qSymbol=q[symbol];
					if(typeof qSymbol==="object") qSymbol=q[symbol].Close;
					price.text(stx.padOutPrice(qSymbol));
				}

				if(this.loading[series.parameters.symbolObject.symbol]) loader.addClass("stx-show");
				else loader.removeClass("stx-show");
				if(series.parameters.error) frag.attr("cq-error", true);
				if(series.parameters.permanent) btn.hide();
				else{
					btn.stxtap(function(self, s, series){ return function(){
						self.nomore=true;
						if(!series.parameters.permanent) self.removeSeries(s, series);
						self.modalEnd(); // tricky, we miss mouseout events when we remove items from under ourselves
					};}(this, s, series));
				}
				key.append(frag);
			}
			key.cqrender();
			this.pickSwatchColor();
		};

		/**
		 * Loops thru `stxx.chart.series` to update the current price of all comparisons.
		 * @alias updatePrices
		 * @memberof WebComponents.cq-comparison
		 */
		updatePrices(){
			var key; // lazy eval this to prevent jquery work when no comparisons exist
			var stx=this.context.stx;
			var historical=stx.isHistoricalModeSet;
			var q=stx.currentQuote();
			if(q) {
				for(var s in stx.chart.series){
					if(!key) key=this.node.find("cq-comparison-key");
					var price=key.find('cq-comparison-item[cq-symbol="' + s + '"] cq-comparison-price');
					if(price.length){
						var oldPrice=parseFloat(price.text());
						var symbol=stx.chart.series[s].parameters.symbol;
						var newPrice=q[symbol];
						var field=stx.chart.series[s].parameters.field || "Close";
						if(newPrice && (newPrice[field] || newPrice[field]===0)) newPrice=newPrice[field];
						if (!newPrice && newPrice!==0 && stx.chart.series[s].lastQuote)
							newPrice=stx.chart.series[s].lastQuote[field];
						price.text(stx.padOutPrice(historical?"":newPrice));
						if(historical) return;
						if(typeof(price.attr("cq-animate"))!="undefined")
							CIQ.UI.animatePrice(price, newPrice, oldPrice);
					}
				}
			}
		};

		/**
		 * Adds an injection to the ChartEngine that tracks the price of Comparisons.
		 * @param {number} updatePrices
		 * @alias startPriceTracker
		 * @memberof WebComponents.cq-comparison
		 */
		startPriceTracker(updatePrices){
			var self=this;
			this.addInjection("append", "createDataSet", function(){
				if(updatePrices) self.updatePrices();
				if(this.chart.dataSet && this.chart.dataSet.length) self.node.attrBetter("cq-show");
				else self.node.removeAttrBetter("cq-show");
			});
		};

		position(){
			var stx=this.context.stx;
			var bar=stx.barFromPixel(stx.cx);
			this.tick=stx.tickFromPixel(stx.cx);
			var prices=stx.chart.xaxis[bar];
			var self=this;

			function printValues(){
				var key;
				self.timeout=null;
				for(var s in stx.chart.series){
					if(!key) key=self.node.find("cq-comparison-key");
					var price=key.find('cq-comparison-item[cq-symbol="' + s + '"] cq-comparison-tick-price');
					price.textBetter("");
					if(price.length && prices && prices.data){
						var symbol=stx.chart.series[s].parameters.symbol;
						price.textBetter(stx.padOutPrice(prices.data[symbol]));
						var pdSymbol=prices.data[symbol];
						if(pdSymbol!==null){
							if (typeof pdSymbol==="object")pdSymbol=pdSymbol.Close;
							price.textBetter(stx.padOutPrice(pdSymbol));
						}
					}
				}
			}
			if(this.tick!=this.prevTick){
				if(this.timeout) clearTimeout(this.timeout);
				var ms=0; // IE and FF struggle to keep up with the dynamic head's up.
				this.timeout=setTimeout(printValues, ms);
			}
			this.prevTick=this.tick; // We don't want to update the dom every pixel, just when we cross into a new candle
		};

		startTickPriceTracker(){
			this.prevTick=null;
			this.addInjection("prepend","headsUpHR", function(self){ return function(){self.position();};}(this));
		};

		setContext(context){
			var chart=this.context.stx.chart;
			this.node.attr("cq-show","true");
			// if attribute cq-marker then detach and put ourselves in the chart holder
			this.configureUI();
			var self=this;
			CIQ.UI.observe({
				obj: chart.series,
				action: "callback",
				value:function(){self.renderLegend();}
			});
			this.context.stx.append("modifySeries", function(){self.renderLegend();});
			var frag=CIQ.UI.makeFromTemplate(this.template);
			this.startPriceTracker(frag.find("cq-comparison-price").length);
			if(frag.find("cq-comparison-tick-price")){
				this.startTickPriceTracker();
			}
		};

		/**
		 * Fires whenever a new security is added as a comparison.
		 * Handles all the necessary events to update the chart with the new comparison.
		 * @param {object} context `CIQ.UI.Context` The context of the chart.
		 * @param {object} obj The object holding info on a security.
		 * @alias selectItem
		 * @memberof WebComponents.cq-comparison
		 */
		selectItem(context, obj){
			var self=this;
			function cb(err, series){
				if(err){
					series.parameters.error=true;
				}
				self.loading[series.parameters.symbolObject.symbol]=false;
				self.renderLegend();
			}
			var swatch=this.node.find("cq-swatch");
			var color="auto", pattern=null, width=1;
			if(swatch[0]){
				var style=swatch[0].style;
				color=style.backgroundColor;
				//TODO: need a UI to grab pattern and width from, for now use the existing swatch
				pattern=style.borderTopStyle;
				width=style.width || 1;
			}
			var stx=context.stx;
			this.loading[obj.symbol]=true;
			var params={
				name: "_generic_series",
				symbolObject: obj,
				isComparison: true,
				color: color,
				pattern: pattern,
				width: width || 1,
				data: {useDefaultQuoteFeed: true},
				forceData:true
			};

			// don't allow symbol if same as main chart, comparison already exists, or just white space
			var exists=stx.getSeries({symbolObject: obj});
			for(var i=0;i<exists.length;i++)
				if(exists[i].parameters.isComparison) {
					this.loading[obj.symbol]=false;
					return;
				}

			// don't allow symbol if same as main chart or just white space
			if (context.stx.chart.symbol.toLowerCase() !== obj.symbol.toLowerCase() &&
					obj.symbol.trim().length > 0) {
				stx.addSeries(obj.symbol, params, cb);
			}else{
				this.loading[obj.symbol]=false;
			}
		};

		/**
		 * Initializes all the children UI elements that make up `<cq-comparison>`.
		 * @alias configureUI
		 * @memberof WebComponents.cq-comparison
		 */
		configureUI(){
			var node=this.node;
			var addNew=node.find("cq-accept-btn");
			this.template=node.find("*[cq-comparison-item]");
			var swatchColors=node.find("cq-swatch").attr("cq-colors");
			if(swatchColors) this.swatchColors=swatchColors.split(",");
			for(var i=0;i<this.swatchColors.length;i++){
				this.swatchColors[i]=CIQ.convertToNativeColor(this.swatchColors[i]);
			}
			var lookup=node.find("cq-lookup");
			if(lookup.length) lookup[0].setCallback(function(self){return function(){self.selectItem.apply(self, arguments);};}(this));
			addNew.stxtap(function(e){
				lookup[0].forceInput();
				e.stopPropagation();
			});
			var input=node.find("input");
			input.stxtap(function(){
				this.focus();
			});
		};
	}

	CIQ.UI.Comparison=customElements.define("cq-comparison", Comparison);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
