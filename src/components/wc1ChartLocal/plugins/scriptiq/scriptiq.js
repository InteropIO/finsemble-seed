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
	 * ScriptIQ web component `<cq-scriptiq>`.
	 * 
	 * **Only available if subscribing to the scriptIQ module.**
	 *
	 * @namespace WebComponents.cq-scriptiq
	 * @example
	 	 <cq-scriptiq></cq-scriptiq>
	 */
	var ScriptIQ = {
		prototype: Object.create(CIQ.UI.ContextTag)
	};

	ScriptIQ.prototype.attachedCallback=function(){
		if(this.attached) return;
		CIQ.UI.ContextTag.attachedCallback.apply(this);
		this.attached=true;
	};

	ScriptIQ.prototype.setContext=function(context){
		this.initialize();
	};

	ScriptIQ.prototype.initialize=function(){
		var self=this;
		function widgetLoaded(err){
			if(err){
				console.log(err);
			}else{
				var editor=self.editor=document.querySelector('cq-scriptiq-editor');
				editor.parentNode.removeChild(editor);
				self.appendChild(editor);
				editor.initialize();
				self.context.stx.prepend("resizeChart",self.resize.bind(self));
			}
		}
		CIQ.loadWidget("plugins/scriptiq/scriptiq-editor", this, widgetLoaded);
	};

	ScriptIQ.prototype.resize=function(){
		if(this.editor) this.editor.resizeScriptingArea();
	};

	CIQ.UI.ScriptIQ=document.registerElement("cq-scriptiq", ScriptIQ);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
