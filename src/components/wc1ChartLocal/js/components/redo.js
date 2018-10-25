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
	 * Redo web component `<cq-redo>`.
	 *
	 * Pairs with {@link WebComponents.cq-undo} to redo changes to a drawing.
	 * @namespace WebComponents.cq-redo
	 * @example
	 <cq-undo-section>
		 <cq-undo class="ciq-btn">Undo</cq-undo>
		 <cq-redo class="ciq-btn">Redo</cq-redo>
	 </cq-undo-section>
	 */

	// var Redo = {
	// 	prototype: Object.create(CIQ.UI.ContextTag)
	// };

	class Redo extends CIQ.UI.ContextTag {
		constructor() {
			super()
		}
	}

	Redo.prototype.connectedCallback=function(){
		if(this.attached) return;
		CIQ.UI.ContextTag.attachedCallback.apply(this);
		this.attached=true;
	};
	/**
	 * Finds {@link WebComponents.cq-undo} and pairs with it to find the last undo and reverse it.
	 * @alias pairUp
	 * @memberof WebComponents.cq-redo
	 * @example
	$("cq-redo")[0].pairUp($("cq-undo"));
	 */
	Redo.prototype.pairUp=function(undo){
		this.undo=$(undo)[0];
		this.undo.redoButton=this;
		var self=this;
		$(this).stxtap(function(){
			self.undo.redo();
		});
	};

	CIQ.UI.Redo=customElements.define("cq-redo", Redo);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
