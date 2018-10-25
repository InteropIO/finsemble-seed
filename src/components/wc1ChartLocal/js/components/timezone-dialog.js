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
	 * Timezone Dialog web component `<cq-timezone-dialog>`.
	 * @namespace WebComponents.cq-timezone-dialog
	 */
	// var TimezoneDialog = {
	// 	prototype: Object.create(CIQ.UI.DialogContentTag)
	// };

	class TimezoneDialog extends CIQ.UI.DialogContentTag {
		constructor() {
			super()
		}
	}

	/**
	 * @memberof WebComponents.cq-timezone-dialog
	 */
	TimezoneDialog.prototype.removeTimezone=function(){
		CIQ.ChartEngine.defaultDisplayTimeZone=null;
		var stx=this.context.stx;
		stx.displayZone=null;
		stx.setTimeZone();

		if(stx.displayInitialized) stx.draw();

		CIQ.UI.DialogContentTag.close.apply(this);
	};

	/**
	 * @memberof WebComponents.cq-theme-dialog
	 */
	TimezoneDialog.prototype.open=function(params){
		CIQ.UI.DialogContentTag.open.apply(this, arguments);
		var node=this.node;
		var self=this;

		this.context=params.context;
		var stx=this.context.stx;

		var ul=node.find("ul");
		var button = node.find(".ciq-btn");
		if(!this.template){
			this.template=ul.find("li.timezoneTemplate")[0].cloneNode(true);
		}

		ul.empty();
		for(var key in CIQ.timeZoneMap){
			var zone=key;
			var display=stx.translateIf(zone);
			var li=this.template.cloneNode(true);
			li.style.display="block";
			li.innerHTML=display;
			CIQ.safeClickTouch(li,setTimezone(zone));
			ul.append(li);
		}
		var currentUserTimeZone=node.find(".currentUserTimeZone");
		if( stx.displayZone ) {
			var fullZone = stx.displayZone;
			for(var tz in CIQ.timeZoneMap){
				if( CIQ.timeZoneMap[tz] === stx.displayZone ) fullZone = tz;
			}
			currentUserTimeZone.text(stx.translateIf('Current TimeZone is') + ' ' + stx.translateIf(fullZone));
			button.show();
		} else {
			currentUserTimeZone.text(stx.translateIf('Your timezone is your current location'));
			button.hide();
		}

		function setTimezone(zone){
			return function(e){
				CIQ.UI.DialogContentTag.close.apply(self);
				var translatedZone=CIQ.timeZoneMap[zone];
				CIQ.ChartEngine.defaultDisplayTimeZone=translatedZone;
				stx.setTimeZone(stx.dataZone, translatedZone);
				if(stx.chart.symbol) stx.draw();
			};
		}
	};

	CIQ.UI.TimezoneDialog=customElements.define("cq-timezone-dialog", TimezoneDialog);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
