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
	 * Undo web component `<cq-undo>`.
	 *
	 * @namespace WebComponents.cq-undo
	 * @example
	 <cq-undo-section>
		 <cq-undo class="ciq-btn">Undo</cq-undo>
		 <cq-redo class="ciq-btn">Redo</cq-redo>
	 </cq-undo-section>
	 */

	var Undo = {
		prototype: Object.create(CIQ.UI.ContextTag)
	};

	Undo.prototype.createdCallback=function(){
		CIQ.UI.ContextTag.createdCallback.apply(this);
		this.redoButton=null;
		this.undostack=[];
		this.redostack=[];
		this.contexts=[];
	};

	Undo.prototype.attachedCallback=function(){
		if(this.attached) return;
		CIQ.UI.ContextTag.attachedCallback.apply(this);
		this.attached=true;
		var self=this;
		$(this).stxtap(function(){
			self.undo();
		});
	};

	Undo.prototype.setContext=function(context){
		this.manageContext(this.context);

		var self=this;
		this.addInjection("append", "initializeChart", function(){
			self.undostack=[];
			self.redostack=[];
			self.clear();
		});
	};


	Undo.prototype.handleEvent=function(context, type, data){
		this.undostack.push({context: context, drawings:data.before});
		this.redostack=[];
		this.setButtonStyle();
	};

	Undo.prototype.manageContext=function(context){
		this.addClaim(this);
		var self=this;
		context.stx.addEventListener("undoStamp", function(data){
			self.handleEvent(context, "undoStamp", data);
		});
		this.contexts.push(context);
	};

	Undo.prototype.keyStroke=function(hub, key, e, keystroke){
		if(key=="z" && (keystroke.ctrl || keystroke.cmd)){ // ctrl-z
			if(keystroke.shift){
				this.redo();
			}else{
				this.undo();
			}
			return true;
		}
		if(key=="y" && (keystroke.ctrl || keystroke.cmd)){ // ctrl-y
			this.redo();
			return true;
		}
	};
	/**
	 * Reverts last drawing made.
	 * @alias undo
	 * @memberof WebComponents.cq-undo
	 */
	Undo.prototype.undo=function(){
		// If a drawing tool is in action, then pressing undo will kill the current tool
		var foundOne=false;
		for(var i=0;i<this.contexts.length;i++){
			if(this.contexts[i].stx.activeDrawing){
				this.contexts[i].stx.undo();
				foundOne=true;
			}
		}
		if(foundOne) return;

		// otherwise proceed to popping off the stack
		var state=this.undostack.pop();
		if(state){
			var context=state.context;
			this.redostack.push({context:context, drawings: CIQ.shallowClone(context.stx.drawingObjects)});
			var drawings=state.drawings;
			context.stx.drawingObjects=CIQ.shallowClone(drawings);
			context.stx.changeOccurred("vector");
			context.stx.draw();
		}
		this.setButtonStyle();
	};

	/**
	 * Reverts latest undone drawing.
	 * @alias redo
	 * @memberof WebComponents.cq-undo
	 */
	Undo.prototype.redo=function(){
		var state=this.redostack.pop();
		if(state){
			var context=state.context;
			this.undostack.push({context:context, drawings: CIQ.shallowClone(context.stx.drawingObjects)});
			var drawings=state.drawings;
			context.stx.drawingObjects=CIQ.shallowClone(drawings);
			context.stx.changeOccurred("vector");
			context.stx.draw();
		}
		this.setButtonStyle();
	};

	/**
	 * Clears the stack of all redo or undo operations for the context
	 * @param  {CIQ.UI.Context} context The context to clear
	 * @alias clear
	 * @memberof WebComponents.cq-undo
	 */
	Undo.prototype.clear=function(context){
		this.setButtonStyle();
	};

	/**
	 * @private
	 */
	Undo.prototype.setButtonStyle=function(){
		if(this.undostack.length){
			$(this).attr("cq-active","true");
		}else{
			$(this).removeAttr("cq-active");
		}
		if(this.redoButton){
			if(this.redostack.length){
				$(this.redoButton).attr("cq-active","true");
			}else{
				$(this.redoButton).removeAttr("cq-active");
			}
		}
	};

	CIQ.UI.Undo=document.registerElement("cq-undo", Undo);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
