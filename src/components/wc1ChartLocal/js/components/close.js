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

	// var Close = {
	// 	prototype: Object.create(CIQ.UI.BaseComponent)
	// };
	/**
	 * Close web component `<cq-close>`.
	 *
	 * cq-close web component will close it's containing (parent or up) component
	 * by calling its close() method
	 * @namespace WebComponents.cq-close
	 * @example
	 * <cq-item>
	 * 		<cq-label></cq-label>
	 * 		<cq-close></cq-close>
	 * </cq-item>
	 *
	 */

	class Close extends CIQ.UI.BaseComponent {
		constructor() {
			super()
		}
	}

	Close.prototype.createdCallback=function(){
		if(this.attached) return;
		var self=this;
		function closure(){
			self.tap();
		}
		$(this).stxtap(closure);
		CIQ.UI.BaseComponent.attachedCallback.apply(this);
		this.attached=true;
	};
	/**
	 * @alias tap
	 * @memberof WebComponents.cq-close
   */
	Close.prototype.tap=function(){
		CIQ.UI.containerExecute(this, "close");
	};

	CIQ.UI.Close=customElements.define("cq-close", Close);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
