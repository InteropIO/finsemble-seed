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
	class Loader extends CIQ.UI.ContextTag {
		constructor() {
			super()
		}

		setContext(context){
			this.context.setLoader(this);
		};
		/**
		 * Shows the loading icon.
		 * @alias show
		 * @memberof WebComponents.cq-loader
		 */
		show(){
			$(this).addClass("stx-show");
		};

		/**
		 * Hides the loading icon.
		 * @alias hide
		 * @memberof WebComponents.cq-loader
		 */
		hide(){
			$(this).removeClass("stx-show");
		};
	}

	CIQ.UI.Loader=customElements.define("cq-loader", Loader);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
