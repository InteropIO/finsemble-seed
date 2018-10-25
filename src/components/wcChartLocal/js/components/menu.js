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
	 * Menu web component `<cq-menu>`.
	 *
	 * Node that is contextually aware of its surroundings. Handles opening and closing {@link WebComponents.cq-menu-dropdown}.
	 * @namespace WebComponents.cq-menu
	 * @example
	 <cq-menu class="ciq-menu stx-markers collapse">
	 	<span>Events</span>
	 	<cq-menu-dropdown>
	 		<cq-item class="square">Simple Square <span class="ciq-radio"><span></span></span>
	 		</cq-item>
	 		<cq-item class="circle">Simple Circle <span class="ciq-radio"><span></span></span>
	 		</cq-item>
	 		<cq-item class="callouts">Callouts <span class="ciq-radio"><span></span></span>
	 		</cq-item>
	 		<cq-item class="abstract">Abstract <span class="ciq-radio"><span></span></span>
	 		</cq-item>
	 		<cq-item class="none">None <span class="ciq-radio ciq-active"><span></span></span>
	 		</cq-item>
	 	</cq-menu-dropdown>
	 </cq-menu>
	 */

	var Menu = {
		prototype: Object.create(HTMLElement.prototype)
	};

	Menu.prototype.createdCallback=function(){
		this.node=$(this);
		this.active=false;
	};

	Menu.prototype.attachedCallback=function(){
		if(this.attached) return;
		this.uiManager=$("cq-ui-manager");
		if(this.uiManager.length>0) this.uiManager=this.uiManager[0];

		this.attached=true;
		
		if(this.node.attr("readonly")) return;
		var self=this;
		function handleTap(e){
			self.tap(e);
		}
		function handleCaptureTap(e){
			self.captureTap(e);
		}
		var thisNode=this.node[0];
		this.node.stxtap(handleTap);
		thisNode.addEventListener("stxtap", handleCaptureTap, true);
	};

	Menu.prototype.open=function(params){
		var stack=this.uiManager.activeMenuStack;
		for(var i=0;i<stack.length;i++){
			if(stack[i]===this) return;
		}
		this.uiManager.openMenu(this, params);
	};

	Menu.prototype.close=function(){
		this.uiManager.closeMenu(this);
	};

	Menu.prototype.lift=function(){
		var lifts=this.lifts=this.uiManager.findLifts(this);
		for(var i=0;i<lifts.length;i++){
			this.uiManager.lift(lifts[i]);
		}
	};

	Menu.prototype.unlift=function(){
		var lifts=this.lifts;
		if(!lifts) return;
		for(var i=0;i<lifts.length;i++){
			this.uiManager.restoreLift(lifts[i]);
		}
		this.lifts=null;
	};

	Menu.prototype.show=function(params){
		if(this.active) return;
		this.active=true;
		this.node.addClass("stxMenuActive");
		this.lift();
		// For good measure, call resize on any nested scrollables to give them
		// a chance to change their height and scrollbars
		var scrolls=this.node.find("cq-scroll");
		scrolls.each(function(){
			this.resize();
		});
	};

	Menu.prototype.hide=function(){
		if(!this.active) return;
		this.unlift();
		this.node.removeClass("stxMenuActive");
		this.active=false;
		// blur any input boxes that are inside the menu we're closing, to get rid of soft keyboard
		$(this).find("input").each(function(){
			if(this==document.activeElement) this.blur();
		});
	};

	/**
	 * Captures a tap event *before* it descends down to what it is clicked on. The key thing this does is determine
	 * whether the thing clicked on was inside of a "cq-no-close" section. We do this on the way down, because the act
	 * of clicking on something may release it from the dom, making it impossible to figure out on propagation.
	 * @param {object} e Element
	 * @private
	 */
	Menu.prototype.captureTap=function(e){
		var target=$(e.target);
		var domChain=target.parents().addBack();
		// Determine if the tapped element, or any of its parents have a cq-no-close attribute
		this.noClose=domChain.filter(function(){
			var attr=$(this).attr("cq-no-close");
			return typeof attr !== typeof undefined && attr !== false;
		}).length;

		// Determine if the tapped element was inside of something untappable, like a cq-heading or cq-separator
		if(!this.noClose){
			this.noClose=domChain.filter(function(){
				return $(this).is("cq-separator,cq-heading");
			}).length;
		}
	};

	Menu.prototype.tap=function(e){
		var uiManager=this.uiManager;
		if(this.active){ // tapping on the menu if it is open will close it
			// todo, don't close if active children (cascading). Note, cascading already works for dialogs.
			e.stopPropagation();
			if(!this.noClose) uiManager.closeMenu(this);
		}else if(!this.active){ // if we've clicked on the label for the menu, then open the menu			
			e.stopPropagation();

			// If the tap came from within this menu's cq-menu-dropdown then this is probably an accidental
			// "re-open", which occurs when a click on a menu item causes an action that closes the menu, tricking
			// it into thinking it should re-open
			var target=$(e.target);
			var insideDropdown=target.parents("cq-menu-dropdown");
			if(insideDropdown.length) return;
			
			var child=false;
			var parents=this.node.parents("cq-menu,cq-dialog");
			for(var i=0;i<parents.length;i++){
				if(parents[i].active) child=true;
			}
			if(!child) uiManager.closeMenu(); // close all menus unless we're the child of an active menu (cascading)

			this.open();
		}
	};

	CIQ.UI.Menu=document.registerElement("cq-menu", Menu);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
