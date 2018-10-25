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
	 * clickable web component `<cq-clickable>`. When tapped/clicked this component can run a method on any
	 * other component. Set cq-selector attribute to a selector for the other component. Set cq-method
	 * to the method to run on that component. The parameter to the method will be an object that contains
	 * the context for this clickable (if available) and a reference to this button ("caller").
	 *
	 * @namespace WebComponents.cq-clickable
	 * @example
	 * <cq-clickable cq-selector="cq-sample-dialog" cq-method="open">Settings</span></cq-clickable>
	 * runs
	 * $("cq-sample-dialog")[0].open({context: this.context, caller: this});
	 * @since 3.0.9
	 */

	// var Clickable = {
	// 	prototype: Object.create(CIQ.UI.ContextTag)
	// };

	class Clickable extends CIQ.UI.ContextTag {
		constructor() {
			super()
			CIQ.UI.ContextTag.attachedCallback.apply(this)
		}
	}

	// Clickable.prototype.createdCallback=function(){
	// 	CIQ.UI.ContextTag.createdCallback.apply(this);
	// };

	Clickable.prototype.connectedCallback=function(){
		if(this.attached) return;
		CIQ.UI.ContextTag.attachedCallback.apply(this);
		this.attached=true;
		var self=this;

		$(this).stxtap(function() {
			self.runMethod();
		});
	};

	/**
	 * Runs the clickable
	 * @memberof WebComponents.cq-theme-dialog
	 */
	Clickable.prototype.runMethod=function() {
		var selector=this.node.attr("cq-selector");
		var method=this.node.attr("cq-method");

		var clickable=this;
		$(selector).each(function(){
			if(this[method]) this[method].call(this, {context:clickable.context, caller: clickable});
		});
	};

	CIQ.UI.Clickable=customElements.define("cq-clickable", Clickable);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
