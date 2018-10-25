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
	 * Aggregation Dialog web component `<cq-aggregation-dialog>`.
	 *
	 * @namespace WebComponents.cq-aggregation-dialog
	 */
	// var AggregationDialog = {
	// 	prototype: Object.create(CIQ.UI.DialogContentTag)
	// };

	class AggregationDialog extends CIQ.UI.DialogContentTag {
		constructor() {
			super()
		}
	}

	/**
	 * Opens the nearest {@link WebComponents.cq-dialog} to display your dialog.
	 * @alias open
	 * @memberof WebComponents.cq-aggregation-dialog
	 */
	AggregationDialog.prototype.open=function(params){
		CIQ.UI.DialogContentTag.open.apply(this, arguments);
		var stx=this.context.stx;
		var aggregationType=params.aggregationType;
		var map={
			kagi:{
				title:"Set Reversal Percentage"
			},
			renko:{
				title:"Set Range"
			},
			linebreak:{
				title:"Set Price Lines"
			},
			rangebars:{
				title:"Set Range"
			},
			pandf:{
				title:"Set Point & Figure Parameters"
			}
		};
		if(stx.layout.aggregationType!=aggregationType)
			stx.setAggregationType(aggregationType);

		var entry=map[aggregationType];
		var node=this.node;
		node.find(".title").text(stx.translateIf(entry.title));

		for(var type in map){
			node.find(".ciq" + type).css(aggregationType===type?{display:""}:{display:"none"});
		}
		node.find(".ciq" + aggregationType + " input").each(function(){
			var name=this.name;
			if(name=="box" || name=="reversal") name="pandf."+name;
			var tuple=CIQ.deriveFromObjectChain(stx.layout, name);
			if(tuple && !tuple.obj[tuple.member] && stx.chart.defaultChartStyleConfig[this.name])
				$(this).val(stx.chart.defaultChartStyleConfig[this.name]);
		});

	};

	CIQ.UI.AggregationDialog=customElements.define("cq-aggregation-dialog", AggregationDialog);

  /* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
