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
	 * Loader web component `<cq-loader>`.
	 *
	 * CSS loading icon.
	 * @namespace WebComponents.cq-loader
	 * @example
	 <cq-loader><cq-loader>
	 */
	var Loader = {
		prototype: Object.create(CIQ.UI.ContextTag)
	};

	Loader.prototype.setContext=function(context){
		this.context.setLoader(this);
	};
	/**
	 * Shows the loading icon.
	 * @alias show
	 * @memberof WebComponents.cq-loader
	 */
	Loader.prototype.show=function(){
		$(this).addClass("stx-show");
	};

	/**
	 * Hides the loading icon.
	 * @alias hide
	 * @memberof WebComponents.cq-loader
	 */
	Loader.prototype.hide=function(){
		$(this).removeClass("stx-show");
	};

	CIQ.UI.Loader=document.registerElement("cq-loader", Loader);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
