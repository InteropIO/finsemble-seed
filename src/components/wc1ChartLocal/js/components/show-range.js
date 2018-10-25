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
	 * Show Range web component `<cq-show-range>`.
	 *
	 * @namespace WebComponents.cq-show-range
	 * @example
	 	 <cq-show-range>
 			<div stxtap="set(1,'today');">1d</div>
 			<div stxtap="set(5,'day',30,2,'minute');">5d</div>
 			<div stxtap="set(1,'month',30,8,'minute');">1m</div>
 			<div class="hide-sm" stxtap="set(3,'month');">3m</div>
 			<div class="hide-sm" stxtap="set(6,'month');">6m</div>
 			<div class="hide-sm" stxtap="set(1,'YTD');">YTD</div>
 			<div stxtap="set(1,'year');">1y</div>
 			<div class="hide-sm" stxtap="set(5,'year',1,1,'week');">5y</div>
 			<div class="hide-sm" stxtap="set(1,'all',1,1,'month');">All</div>
 	   </cq-show-range>
	 */
	// var ShowRange = {
	// 	prototype: Object.create(CIQ.UI.ContextTag)
	// };

	class ShowRange extends CIQ.UI.ContextTag {
		constructor() {
			super()
		}
	}
	/**
	 * Proxies UI requests for span changes to the kernel
	 * @param {Object} activator Activation information
	 * @param {Number} multiplier   The period that will be passed to {@link CIQ.ChartEngine#setSpan}
	 * @param {Number} base The interval that will be passed to {@link CIQ.ChartEngine#setSpan}
	 * @param {Number} [interval] Chart interval to use (leave empty for autodetect)
	 * @param {Number} [period] Chart period to use (leave empty for autodetect)
	 * @param {Number} [timeUnit] Chart timeUnit to use (leave empty for autodetect)
	 * @alias set
	 * @memberof WebComponents.cq-show-range
	 * @since 5.1.1 timeUnit added
	 */
	ShowRange.prototype.set=function(activator, multiplier, base, interval, period, timeUnit){
		var self=this;
		if(self.context.loader) self.context.loader.show();
		var params={
			multiplier:multiplier,
			base:base
		};
		if(interval){
			params.periodicity={
				interval: interval,
				period: period?period:1,
				timeUnit: timeUnit
			};
		}
		self.context.stx.setSpan(params, function(){
			if(self.context.loader) self.context.loader.hide();
		});
	};

	CIQ.UI.ShowRange=customElements.define("cq-show-range", ShowRange);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
