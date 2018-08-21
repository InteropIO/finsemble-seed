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
	 * View Dialog web component `<cq-view-dialog>`.
	 * 
	 * See {@link CIQ.UI.ViewsMenu} for more details on menu management for this component
	 * @namespace WebComponents.cq-view-dialog
	 * @example
		 <cq-dialog>
				 <cq-view-dialog>
					<h4>Save View</h4>
					<div stxtap="close()" class="ciq-icon ciq-close"></div>
					<div style="text-align:center;margin-top:10px;">
						<i>Enter name of view:</i>
						<p>
							<input spellcheck="false" autocapitalize="off" autocorrect="off" autocomplete="off" maxlength="40" placeholder="Name"><br>
						</p>
						<span class="ciq-btn" stxtap="save()">Save</span>
				</div>
			</cq-view-dialog>
		 </cq-dialog>
	 */
	var ViewDialog = {
		prototype: Object.create(CIQ.UI.DialogContentTag)
	};

	/**
	 * Saves the new view. This updates all cq-view menus on the screen, and persists the view in the nameValueStore.
	 * @alias save
	 * @memberof WebComponents.cq-view-dialog
	 */
	ViewDialog.prototype.save=function(){
		var viewName=this.node.find("input").val();
		if(!viewName) return;

		var self=this;
		var madeChange=false;
		var layout=this.context.stx.exportLayout();
		$("cq-views").each(function(){
			var obj=this.params.viewObj;
			var view;

			for(var i=0;i<obj.views.length;i++){
				view=obj.views[i];
				if(viewName==CIQ.first(view)) break;
			}
			if(i==obj.views.length){
				view={};
				view[viewName]={};
				obj.views.push(view);
			}
			view[viewName]=layout;
			delete view[viewName].candleWidth;
			this.renderMenu();
			//this.context.stx.updateListeners("layout");
			if(!madeChange){
				// We might have a cq-view menu on multiple charts on the screen. Only persist once.
				madeChange=true;
				this.params.nameValueStore.set("stx-views", obj.views);
			}
		});
		this.close();
	};

	CIQ.UI.ViewDialog=document.registerElement("cq-view-dialog", ViewDialog);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
