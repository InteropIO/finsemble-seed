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
	 * Views web component `<cq-views>`.
	 *
	 * This web component has two functions. The first is displaying available views in a menu.
	 * The second is providing a views dialog for entering a new view.
	 *
	 * @namespace WebComponents.cq-views
	 * @example
			<cq-menu class="ciq-menu ciq-views collapse">
				<span>Views</span>
				<cq-menu-dropdown>
					<cq-views>
						<cq-heading>Saved Views</cq-heading>
						<cq-views-content>
							<template cq-view>
								<cq-item>
									<cq-label></cq-label>
									<div class="ciq-icon ciq-close"></div>
								</cq-item>
							</template>
						</cq-views-content>
						<cq-separator cq-partial></cq-separator>
						<cq-view-save>
							<cq-item><cq-plus></cq-plus>Save View</cq-item>
						</cq-view-save>
					</cq-views>
				</cq-menu-dropdown>
			</cq-menu>
	 */
	var Views = {
		prototype: Object.create(CIQ.UI.ContextTag)
	};

	Views.prototype.attachedCallback=function(){
		if(this.attached) return;
		CIQ.UI.ContextTag.attachedCallback.apply(this);
		this.attached=true;
	};

	/**
	 * Initialize a views menu
	 *
	 * @param {Object} [params] Parameters to control behavior of the menu
	 * @param {Object} [params.viewObj={views:[]}] Specify the object which contains the "views" objects.  If omitted, will create one.
	 * @param {CIQ.NameValueStore} [params.nameValueStore=CIQ.NameValueStore] Specify the storage class.  If omitted, will use  {@link CIQ.NameValueStore}. See example for storage class function signatures and CB requirements.
	 * @param {Object} [params.renderCB=null] callback executed on menu after rendering.  Takes the menu as argument.
	 * @param {Object} [params.cb] Get a callback when the nameValueStore has retrieved the data.
	 * @memberof WebComponents.cq-views
	 * @example
	 * 	//
		// To have the views web component menus use a different storage function, 
		// just add it to the 'parameters.nameValueStore' like so:
		
		$("cq-views").each(function(){
			this.initialize({nameValueStore: new MyNameValueStore()});
		});
		
		//And make sure you create your own MyNameValueStore functions in the following format:
		
		 MyNameValueStore=function(){
		 };
		
		 MyNameValueStore.prototype.set=function(field, value, cb){
		   // Add code here to send the view object ('value') to your repository and store under a key of 'field'
		  if(cb) cb(errorCode);
		 };

		 MyNameValueStore.prototype.get=function(field, cb){
		  // Add code here to get the views object for key 'field' from your repository and rerun it in the callback.
		  if(cb) cb(errorCode, yourViewObject);
		 };
				
		 MyNameValueStore.prototype.remove=function(field, cb){
		  // Add code here to remove the view object under the key 'field' from your repository
		  if(cb) cb(errorCode);
		 };
	 * 
	 * @since 3.0.7 params.cb added to signature.
	 * @since TBC ViewMenu helper has been deprecated. Please call $("cq-views")[0].initialize() now.
	 * 
	 */
	Views.prototype.initialize=function(params){
		this.params=params?params:{};
		if(!this.params.viewObj) this.params.viewObj={views:[]};
		if(!this.params.nameValueStore) this.params.nameValueStore=new CIQ.NameValueStore();
		if(!this.params.template) this.params.template="template[cq-view]";
		this.params.template=this.node.find(this.params.template);
		this.params.template.detach();
		var self=this;
		this.params.nameValueStore.get("stx-views", function(err,obj){
			if(!err && obj) self.params.viewObj.views=obj;
			if(self.params.cb) self.params.cb.call(self);
			self.renderMenu();
		});
	};


	/**
	 * Creates the menu. You have the option of coding a hardcoded HTML menu and just using
	 * CIQ.UI.ViewsMenu for processing stxtap attributes, or you can call renderMenu() to automatically
	 * generate the menu.
	 * @memberof WebComponents.cq-views
	 */
	Views.prototype.renderMenu=function(){
		var menu=$(this.node);
		var self=this;
		var stx=self.context.stx;

		function remove(i){
			return function(e){
				e.stopPropagation();
				var saved=false;
				$("cq-views").each(function(){
					this.params.viewObj.views.splice(i,1);
					if(!saved){
						this.params.nameValueStore.set("stx-views",self.params.viewObj.views);
						saved=true;
					}
					this.renderMenu();
				});
			};
		}

		function enable(i){
			return function(e){
				e.stopPropagation();
				self.uiManager.closeMenu();
				if(self.context.loader) self.context.loader.show();
				var layout=CIQ.first(self.params.viewObj.views[i]);
				function importLayout(){
					var finishImportLayout = function(){
						stx.changeOccurred("layout");
						if(self.context.loader) self.context.loader.hide();
					};
					stx.importLayout(self.params.viewObj.views[i][layout], {managePeriodicity: true,preserveTicksAndCandleWidth: true,cb:finishImportLayout});
				}
				setTimeout(importLayout,10);
			};
		}

		menu.find("cq-views-content cq-item").remove();
		for(var v=0;v<this.params.viewObj.views.length;v++){
			var view=CIQ.first(self.params.viewObj.views[v]);
			if(view=="recent") continue;
			var item=CIQ.UI.makeFromTemplate(this.params.template);
			var label=item.find("cq-label");
			var removeView=item.find("div");

			if(label.length) {
				label.addClass("view-name-"+view);
				label.prepend(view);  //don't use text(); it wipes out anything else embedded in the item
			}
			if(removeView.length) removeView.stxtap(remove(v));
			this.makeTap(item[0],enable(v));
			menu.find("cq-views-content").append(item);
		}

		var addNew=menu.find("cq-view-save");
		if(addNew){
			var context=this.context;
			this.makeTap(addNew.find("cq-item")[0],function(e){
				$("cq-view-dialog").each(function(){
					$(this).find("input").val("");
					this.open({context:context});
				});
			});
		}
		if(this.params.renderCB) this.params.renderCB(menu);
	};

	CIQ.UI.Views=document.registerElement("cq-views", Views);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
