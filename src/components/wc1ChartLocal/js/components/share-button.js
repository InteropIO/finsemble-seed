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
	 * Share Button web component `<cq-share-button>`.
	 *
	 * @namespace WebComponents.cq-share-button
	 * @example
	 <cq-share-button>
		 <div stxtap="tap();">Share</div>
	 </cq-share-button>
	 */
	// var ShareButton = {
	// 	prototype: Object.create(CIQ.UI.ContextTag)
	// };
	class ShareButton extends CIQ.UI.ContextTag {
		constructor() {
			super()
		}
	}

	/**
	 * Opens a customizable dialog that can share a chart.
	 * @alias tap
	 * @memberof WebComponents.cq-share-button
	 */
	ShareButton.prototype.tap=function(e){
		var context=this.context;
		$("cq-share-dialog").each(function(){
			this.open({context: context});
		});
	};



	CIQ.UI.ShareButton=customElements.define("cq-share-button", ShareButton);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
