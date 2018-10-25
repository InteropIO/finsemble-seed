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
	 * Study Context Dialog web component `<cq-study-context>`.
	 *
	 *
	 * @namespace WebComponents.cq-study-context
	 * @since  4.1.0 cq-study-context is now required (cq-dialog[cq-study-context] no longer works)
	 */
	// var StudyContext = {
	// 	prototype: Object.create(CIQ.UI.DialogContentTag)
	// };

	class StudyContext extends CIQ.UI.DialogContentTag {
		constructor() {
			super()
		}
	}

	CIQ.UI.StudyContext=customElements.define("cq-study-context", StudyContext);

  /* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
