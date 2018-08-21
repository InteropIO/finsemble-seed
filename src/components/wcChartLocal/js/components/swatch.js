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
	 * Swatch web component `<cq-swatch>`.
	 *
	 * An interactive color swatch. Relies on the existence of a {@link CIQ.UI.ColorPicker} component.
	 * When a color is selected, setColor(color) will get called for any parent component with that method
	 * @namespace WebComponents.cq-swatch
	 * @example
		 <cq-section>
			 <cq-placeholder>Candle Color
				 <cq-theme-piece cq-piece="cu"><cq-swatch cq-overrides="Hollow"></cq-swatch></cq-theme-piece>
				 <cq-theme-piece cq-piece="cd"><cq-swatch cq-overrides="Hollow"></cq-swatch></cq-theme-piece>
			 </cq-placeholder>
			 <cq-placeholder>Candle Wick
				 <cq-theme-piece cq-piece="wu"><cq-swatch></cq-swatch></cq-theme-piece>
				 <cq-theme-piece cq-piece="wd"><cq-swatch></cq-swatch></cq-theme-piece>
			 </cq-placeholder>
			 <cq-placeholder>Candle Border
				 <cq-theme-piece cq-piece="bu"><cq-swatch cq-overrides="No Border"></cq-swatch></cq-theme-piece>
				 <cq-theme-piece cq-piece="bd"><cq-swatch cq-overrides="No Border"></cq-swatch></cq-theme-piece>
			 </cq-placeholder>
			 <cq-separator></cq-separator>
			 <cq-placeholder>Line/Bar Chart
				 <cq-theme-piece cq-piece="lc"><cq-swatch></cq-swatch></cq-theme-piece>
			 </cq-placeholder>
			 <cq-separator></cq-separator>
			 <cq-placeholder>Mountain Color
				 <cq-theme-piece cq-piece="mc"><cq-swatch></cq-swatch></cq-theme-piece>
			 </cq-placeholder>
		 </cq-section>
	 */
	var Swatch = {
		prototype: Object.create(HTMLElement.prototype)
	};

	/**
	 * Optionally set the default color for the swatch.
	 * @type {string}
	 * @memberof WebComponents.cq-swatch
	 */
	Swatch.prototype.defaultColor=null;

	Swatch.prototype.attachedCallback=function(){
		if(this.attached) return;
		this.node=$(this);
		this.node.stxtap(function(self){return function(e){
			self.launchColorPicker();
			e.stopPropagation();
		};}(this));
		this.attached=true;
	};

	/**
	 * Attempts to identify the default color for the associated chart. It does so by traversing
	 * up the parent stack and looking for any component that has a context. Or you can set
	 * the default color manually by setting member variable defaultColor;
	 * @memberof WebComponents.cq-swatch
	 */
	Swatch.prototype.getDefaultColor=function(){
		if(this.defaultColor) return this.defaultColor;
		var context=CIQ.UI.getMyContext(this);
		if(context) return context.stx.defaultColor; // some parent with a context
		return "trasparent";
	};

	/**
	 * @alias setColor
	 * @memberof WebComponents.cq-swatch
	 */
	Swatch.prototype.setColor=function(color, percolate){
		var node=$(this);
		var bgColor=CIQ.getBackgroundColor(this.parentNode);
		var hslb=CIQ.hsl(bgColor);
		if(!color) color="transparent";
		var fillColor=color;
		if(color=="auto"){
			fillColor=this.getDefaultColor();
		}
		var hslf=CIQ.hsl(fillColor);
		if((Math.abs(hslb[2] - hslf[2])<0.2) || CIQ.isTransparent(color)){
			var border=CIQ.chooseForegroundColor(bgColor);
			node.css({"border": "solid " + border + " 1px"});
		}else{
			node.css({"border": ""});
		}

		node.css({"background-color": fillColor});
		if(percolate!==false) CIQ.UI.containerExecute(this, "setColor", color);
	};

	/**
	 * @alias launchColorPicker
	 * @memberof WebComponents.cq-swatch
	 */
	Swatch.prototype.launchColorPicker=function(){
		var node=$(this);

		var colorPickers=$("cq-color-picker");
		var colorPicker=colorPickers[0];
		colorPicker.callback=function(self){return function(color){
			self.setColor(color, null);
		};}(this);
		var overrides=this.node.attr("cq-overrides");
		if(overrides) overrides=overrides.split(",");
		colorPicker.display({node:node, overrides:overrides});
		this.colorPicker=colorPicker;
	};

	CIQ.UI.Swatch=document.registerElement("cq-swatch", Swatch);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
