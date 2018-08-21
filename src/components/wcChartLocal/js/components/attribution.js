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
	 * Attribution web component `<cq-attribution>`.
	 *
	 * This will put a node inside a panel to attribute the data.
	 * Both the main chart panel (for quotes) and a study panel can use an attribution.
	 *
	 * @namespace WebComponents.cq-attribution
	 * @since 2016-07-16
	 * @example
	 * <cq-attribution>
	 * 	<template>
	 * 		<cq-attrib-container>
	 * 			<cq-attrib-source></cq-attrib-source>
	 * 			<cq-attrib-quote-type></cq-attrib-quote-type>
	 * 		</cq-attrib-container>
	 * 	</template>
	 * </cq-attribution>
	 */
	var Attribution = {
		prototype: Object.create(CIQ.UI.ModalTag)
	};

	Attribution.prototype.insert=function(stx,panel){
		var attrib=CIQ.UI.makeFromTemplate(this.template);
		new CIQ.Marker({
			stx: stx,
			node: attrib[0],
			xPositioner: "none",
			yPositioner: "none",
			label: "attribution",
			panelName: panel
		});
		return attrib;
	};

	Attribution.prototype.attachedCallback=function(){
		if(this.attached) return;
		CIQ.UI.ModalTag.attachedCallback.apply(this);
		this.attached=true;
	};

	Attribution.prototype.setContext=function(context){
		this.template=this.node.find("template");
		var chartAttrib=this.insert(context.stx,"chart");
		var self=this;
		this.addInjection("append", "createDataSet", function(){
			var source, exchange;
			if(this.chart.attribution){
				source=self.messages.sources[this.chart.attribution.source];
				exchange=self.messages.exchanges[this.chart.attribution.exchange];
				if(!source) source="";
				if(!exchange) exchange="";
				if(source+exchange!=chartAttrib.attr("lastAttrib")){
					chartAttrib.find("cq-attrib-source").html(source);
					chartAttrib.find("cq-attrib-quote-type").html(exchange);
					CIQ.I18N.translateUI(null,chartAttrib[0]);
					chartAttrib.attr("lastAttrib",source+exchange);
				}
			}
			outer:
			for(var study in this.layout.studies){
				var type=this.layout.studies[study].type;
				if(self.messages.sources[type]){
					for(var i=0;i<this.markers.attribution.length;i++){
						if(this.markers.attribution[i].params.panelName==this.layout.studies[study].panel) continue outer;
					}
					if(!this.panels[study]) continue;
					source=self.messages.sources[type];
					exchange=self.messages.exchanges[type];
					if(!source) source="";
					if(!exchange) exchange="";
					var attrib=self.insert(this,study);
					attrib.find("cq-attrib-source").html(source);
					attrib.find("cq-attrib-quote-type").html(exchange);
					CIQ.I18N.translateUI(null,attrib[0]);
				}
			}
		});
	};

	/**
	 * Here is where the messages go.  This could be supplemented, overridden, etc. by the developer.
	 * The sources contain properties whose values which go into <cq-attrib-source>.
	 * The exchanges contain properties whose values which go into <cq-attrib-quote-type>.
	 *
	 * For quotes, the sources would match the quote source.  For a study, it would match the study type.
	 * If there is no matching property, the appropriate component will have no text.
	 * @alias messages
	 * @memberof WebComponents.cq-attribution
	 */
	Attribution.prototype.messages={
		"sources":{
			"simulator" : "Simulated data.",
			"demo": "Demo data.",
			"xignite": "<a target=\"_blank\" href=\"https://www.xignite.com\">Market Data</a> by Xignite.",
			"fis_mm": "<a target=\"_blank\" href=\"https://www.fisglobal.com/\">Market Data</a> by FIS MarketMap.",
			"Twiggs": "Formula courtesy <a target=\"_blank\" href=\"https://www.incrediblecharts.com/indicators/twiggs_money_flow.php\">IncredibleCharts</a>."
		},
		"exchanges":{
			"RANDOM": "Data is randomized.",
			"REAL-TIME": "Data is real-time.",
			"DELAYED": "Data delayed 15 min.",
			"BATS": "BATS BZX real-time.",
			"EOD": "End of day data."
		}
	};

	CIQ.UI.Attribution=document.registerElement("cq-attribution", Attribution);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
