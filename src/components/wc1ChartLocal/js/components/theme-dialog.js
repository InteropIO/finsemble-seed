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
	 * Theme Dialog web component `<cq-theme-dialog>`.
	 *
	 * Manages themes in for chart layout.
	 * @namespace WebComponents.cq-theme-dialog
	 * @example
		 <cq-dialog>
			<cq-theme-dialog>
				<h4 class="title">Create Custom Theme</h4>
				<cq-close></cq-close>
				<cq-scroll cq-no-maximize>
					<cq-section>
					...
					</cq-scroll>
				</cq-theme-dialog>
			</cq-dialog>
	 */
	// var ThemeDialog = {
	// 	prototype: Object.create(CIQ.UI.DialogContentTag)
	// };

	class ThemeDialog extends CIQ.UI.DialogContentTag {
		constructor() {
			super()
		}
	}
	/**
	 * Applies changes to all charts on the screen
	 * @memberof WebComponents.cq-theme-dialog
	 * @private
	 */
	ThemeDialog.prototype.applyChanges=function(){
		var stx=this.context.stx;
		this.helper.update(stx);
		stx.changeOccurred("theme");
	};

	/**
	 * @alias setValue
	 * @memberof WebComponents.cq-theme-dialog
	 */
	ThemeDialog.prototype.setValue=function(obj, field, value){
		obj[field]=value;
		this.applyChanges();
	};

	/**
	 * @alias close
	 * @memberof WebComponents.cq-theme-dialog
	 */
	ThemeDialog.prototype.close=function(){
		this.helper.settings=this.revert;
		this.applyChanges();
		//CIQ.UI.containerExecute(this, "close");
		CIQ.UI.DialogContentTag.close.apply(this);
	};

	/**
	 * @alias save
	 * @memberof WebComponents.cq-theme-dialog
	 */
	ThemeDialog.prototype.save=function(){
		var themeName=this.node.find("cq-action input").val();
		var theme={
			settings:CIQ.clone(this.helper.settings),
			name: themeName,
			builtIn:null
		};
		CIQ.UI.contextsForEach(function(){
			this.stx.updateListeners("theme");
		});
		var self=this;
		$("cq-themes").each(function(){
			theme.builtIn=this.currentLoadedBuiltIn;
			this.addCustom(theme, self.initiatingMenu);
		});
		CIQ.UI.DialogContentTag.close.apply(this);
	};

	/**
	 * @alias configure
	 * @memberof WebComponents.cq-theme-dialog
	 */
	ThemeDialog.prototype.open=function(params){
		CIQ.UI.DialogContentTag.open.apply(this, arguments);
		var themeName=params.themeName;

		this.initiatingMenu=params.initiatingMenu;
		this.context=params.context;
		this.helper=new CIQ.ThemeHelper({stx: this.context.stx});
		this.revert=CIQ.clone(this.helper.settings);

		var self=this;
		function configurePiece(name, obj, field, type){
			var cu=self.node.find('cq-theme-piece[cq-piece="' + name + '"]');

			cu[0].piece={obj:obj, field:field};
			if(type=="color"){
				cu.find("cq-swatch")[0].setColor(obj[field], false);
			}
		}
		var settings=this.helper.settings;
		configurePiece("cu", settings.chartTypes["Candle/Bar"].up, "color", "color");
		configurePiece("cd", settings.chartTypes["Candle/Bar"].down, "color", "color");
		configurePiece("wu", settings.chartTypes["Candle/Bar"].up, "wick", "color");
		configurePiece("wd", settings.chartTypes["Candle/Bar"].down, "wick", "color");
		configurePiece("bu", settings.chartTypes["Candle/Bar"].up, "border", "color");
		configurePiece("bd", settings.chartTypes["Candle/Bar"].down, "border", "color");
		configurePiece("lc", settings.chartTypes.Line, "color", "color");
		configurePiece("mc", settings.chartTypes.Mountain, "color", "color");
		configurePiece("bg", settings.chart.Background, "color", "color");
		configurePiece("gl", settings.chart["Grid Lines"], "color", "color");
		configurePiece("dd", settings.chart["Grid Dividers"], "color", "color");
		configurePiece("at", settings.chart["Axis Text"], "color", "color");

		if(!themeName) themeName="My Theme";
		this.node.find("cq-action input").val(themeName);
	};

	CIQ.UI.ThemeDialog=customElements.define("cq-theme-dialog", ThemeDialog);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
