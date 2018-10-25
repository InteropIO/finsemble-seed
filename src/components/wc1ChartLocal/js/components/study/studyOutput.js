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
	 * Study output web component `<cq-study-output>`.
	 *
	 * Set the color of study outputs in the {@link CIQ.WebComponents.cq-study-dialog}.
	 *
	 * See example in {@link CIQ.WebComponents.cq-study-dialog}.
	 * @namespace WebComponents.cq-study-output
	 */
	// var StudyOutput = {
	// 	prototype: Object.create(CIQ.UI.BaseComponent)
	// };

	class StudyOutput extends CIQ.UI.BaseComponent {
		constructor() {
			super()
		}
	}

	StudyOutput.prototype.initialize = function(params) {
		this.params = params;
	};

	StudyOutput.prototype.setColor = function(color) {
		if (!this.params) return;
		var updates = {
			outputs: {}
		};
		updates.outputs[this.params.output] = {};
		updates.outputs[this.params.output].color = color;
		this.params.studyDialog.updateStudy(updates);
	};

	CIQ.UI.StudyOutput = customElements.define("cq-study-output", StudyOutput);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
