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
	 * Drawing Context Dialog web component `<cq-drawing-context>`.
	 * Managed by an instance of {CIQ.UI.DrawingEdit}.
	 *
	 * @namespace WebComponents.cq-drawing-context
	 * @since 6.2.0
	 */
	var DrawingContext = {
		prototype: Object.create(CIQ.UI.DialogContentTag)
	};

	/**
	 * Open the context menu as a dialog.
	 *
	 * @param {Object} params
	 * @param {number} params.x used to position the dialog
	 * @param {number} params.y used to position the dialog
	 * @param {CIQ.Drawing} params.drawing sets the `drawing` instance property
	 * @param {CIQ.UI.Context} params.context passed to the components setContext method
	 * @since 6.2.0
	 */
	DrawingContext.prototype.open=function(params) {
		this.drawing = params.drawing;

		return CIQ.UI.DialogContentTag.open.call(this, params);
	};

	CIQ.UI.DrawingContext=document.registerElement("cq-drawing-context", DrawingContext);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
