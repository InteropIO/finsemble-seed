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
	 * Trade From Chart web component `<cq-tfc>`.
	 *
	 * @namespace WebComponents.cq-tfc
	 * @example
	 	 <cq-tfc></cq-tfc>
	 */
	var TFC = {
		prototype: Object.create(CIQ.UI.ContextTag)
	};

	TFC.prototype.attachedCallback=function(){
		if(this.attached) return;
		CIQ.UI.ContextTag.attachedCallback.apply(this);
		this.attached=true;
	};

	TFC.prototype.setContext=function(context){
		this.initialize();
	};

	/**
	 * @alias start
	 * @memberof WebComponents.cq-tfc
	 */
	TFC.prototype.start=function(){
		$(".stx-trade-panel").appendTo($("cq-side-panel"));
		var stx=this.context.stx;

		stx.account=new CIQ.Account.Demo();
		var tfcConfig={
			stx: stx,
			account: stx.account
		};
		stx.tfc=new CIQ.TFC(tfcConfig);
		//stx.tfc.setResizeCallback(resizeScreen);

		var self=this;
		$(".stx-trade-nav .stx-trade-ticket-toggle").stxtap(function(){
			$(".stx-trade-nav").removeClass("active");
			$(".stx-trade-info").addClass("active");
			$("cq-side-panel")[0].resizeMyself();
		});
		$(".stx-trade-info .stx-trade-ticket-toggle").stxtap(function(){
			$(".stx-trade-nav").addClass("active");
			$(".stx-trade-info").removeClass("active");
			$("cq-side-panel")[0].resizeMyself();
		});

		stx.tfc.selectSymbol=function(symbol){
			symbol=symbol.toUpperCase();
			self.context.changeSymbol({symbol:symbol});
		};
	};

	TFC.prototype.initialize=function(){
		var self=this, basePath="plugins/tfc/";
		CIQ.loadWidget(basePath + "tfc", function(err) {
			if (err) return console.log(err);
			CIQ.loadScript(basePath + "tfc-demo.js", self.start.bind(self));
		});
	};

	CIQ.UI.TFC=document.registerElement("cq-tfc", TFC);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
