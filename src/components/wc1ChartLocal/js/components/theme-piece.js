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
	 * Theme Piece web component `<cq-theme-piece>`.
	 *
	 * Manages themes in for chart layout.
	 * @namespace WebComponents.cq-theme-piece
	 * @example
		 <cq-section>
			 <cq-placeholder>Background
				 <cq-theme-piece cq-piece="bg"><cq-swatch></cq-swatch></cq-theme-piece>
			 </cq-placeholder>
			 <cq-placeholder>Grid Lines
				 <cq-theme-piece cq-piece="gl"><cq-swatch></cq-swatch></cq-theme-piece>
			 </cq-placeholder>
			 <cq-placeholder>Date Dividers
				 <cq-theme-piece cq-piece="dd"><cq-swatch></cq-swatch></cq-theme-piece>
			 </cq-placeholder>
			 <cq-placeholder>Axis Text
				 <cq-theme-piece cq-piece="at"><cq-swatch></cq-swatch></cq-theme-piece>
			 </cq-placeholder>
		 </cq-section>
	 */
	// var ThemePiece = {
	// 	prototype: Object.create(CIQ.UI.BaseComponent)
	// };

	class ThemePiece extends CIQ.UI.BaseComponent {
		constructor() {
			super()
		}
	}

	/**
	 * @alias setColor
	 * @memberof WebComponents.cq-theme-piece
	 */
	ThemePiece.prototype.setColor=function(color){
		if(color=="Hollow" || color=="No Border"){
			color="transparent";
			this.node.find("cq-swatch")[0].setColor("transparent", false);
		}
		CIQ.UI.containerExecute(this, "setValue", this.piece.obj, this.piece.field, color);
	};

	/**
	 * @alias setBoolean
	 * @memberof WebComponents.cq-theme-piece
	 */
	ThemePiece.prototype.setBoolean=function(result){
		CIQ.UI.containerExecute(this, "setValue", this.piece.obj, this.piece.field, result);
	};

	CIQ.UI.ThemePiece=customElements.define("cq-theme-piece", ThemePiece);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
