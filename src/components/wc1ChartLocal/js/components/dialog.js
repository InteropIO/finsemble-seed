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
	 * Dialog web component `<cq-dialog>`.
	 *
	 * Manages general dialog interaction such as display, hide, location, size, tap interaction, etc
	 *
	 * @namespace WebComponents.cq-dialog
	 * @example
<cq-dialog cq-timezone-dialog>
	<cq-timezone-dialog>
		<h4 class="title">Choose Timezone</h4>
		<cq-close></cq-close>

		<p>To set your timezone use the location button below, or scroll through the following list...</p>
		<p class="currentUserTimeZone"></p>
    <div class="detect">
    <div class="ciq-btn" stxtap="Layout.removeTimezone()">Use My Current Location</div>
    </div>
    <div class="timezoneDialogWrapper" style="max-height:360px; overflow: auto;">
	        <ul>
	          <li class="timezoneTemplate" style="display:none;cursor:pointer;"></li>
	        </ul>
        </div>
    <div class="instruct">(Scroll for more options)</div>
	</cq-timezone-dialog>
</cq-dialog>
	 */

	class Dialog extends CIQ.UI.BaseComponent {
		constructor() {
			super()
			this.activeAttributes={};
		}
	}

	/**
	 * The attributes that are added to a cq-dialog when it is opened (and removed when closed).
	 * Contains "cq-active" by default.
	 * @memberof WebComponents.cq-dialog
	 * @type {Object}
	 */
	// Dialog.prototype.activeAttributes=null;

	// Dialog.prototype.createdCallback=function(){
	// 	CIQ.UI.BaseComponent.createdCallback.apply(this);
	// 	this.activeAttributes={};
	// };

	Dialog.prototype.connectedCallback=function(){
		if(this.attached) return;
		this.isDialog=true;
		CIQ.UI.BaseComponent.attachedCallback.apply(this);
		var self=this;
		function handleTap(e){
			self.tap(e);
		}
		this.node.stxtap(handleTap);

		var uiManager=$("cq-ui-manager");
		uiManager.each(function(){
			this.registerForResize(self);
			self.uiManager=this;
		});
	};

	Dialog.prototype.disconnectedCallback=function(){
		var self=this;
		var uiManager=$("cq-ui-manager");
		uiManager.each(function(){
			this.unregisterForResize(self);
		});
	};

	/**
	 * Creates a new attribute to be activated when the dialog is open. Use
	 * this to style the dialog. This is automatically set by any component
	 * that is derived from DialogContentTag
	 * @param {string} attribute The attribute to add or remove
	 * @memberof WebComponents.cq-dialog
	 * @since  4.1.0
	 * @example
	 * <style> cq-dialog[cq-study-context]{ padding:0; } </style>
	 * <cq-dialog cq-study-context></cq-dialog>
	 */
	Dialog.prototype.addActiveAttribute=function(attribute){
		this.activeAttributes[attribute]=true;
	};

	Dialog.prototype.tap=function(e){
		var topMenu=this.uiManager.topMenu();
		if(topMenu===this){
			e.stopPropagation(); // prevent a tap inside the dialog from closing itself
			return;
		}
		if(!e.currentTarget.active){
			e.stopPropagation(); // If the dialog we tapped on is closed, then we must have closed it manually. Don't allow a body tap otherwise we'll close two dialogs!
		}
	};

	Dialog.prototype.resize=function(){
		if(this.params && this.params.x){
			this.stxContextMenu();
		}else{
			this.center();
		}
		var scrollers=$(this.node).find("cq-scroll");
		scrollers.each(function(){
			this.resize();
		});
	};

	Dialog.prototype.stxContextMenu=function(){
		var parent=this.node.parent();
		if(parent[0].tagName=="BODY") parent=$(window);
		var w=parent.guaranteedWidth();
		var h=parent.guaranteedHeight();
		var cw=this.node.outerWidth();
		var ch=this.node.outerHeight();
		var left=this.params.x;
		var top=this.params.y;
		if(left+cw>w) left=w-cw;
		if(top+ch>h) top=top-ch;
		if(top<0) top=0;
		this.node.css({"top":top+"px", "left": left + "px"});
	};

	Dialog.prototype.center=function(){
		var parent=this.node.parent();
		if(parent[0].tagName=="BODY") parent=$(window);
		var w=parent.guaranteedWidth();
		var h=parent.guaranteedHeight();
		var cw=this.node.outerWidth();
		var ch=this.node.outerHeight();
		var left=w/2-cw/2;
		var top=h/2-ch/2;
		if(left<0) left=0;
		if(h>ch*2 && top+(ch/2)>h/3){
			top=h/3-ch/2; // Position 1/3 down the screen on large screens
		}
		if(top<0) top=0;
		this.node.css({"top":top+"px", "left": left + "px"});
	};

	Dialog.prototype.open=function(params){
		this.uiManager.openMenu(this, params);
	};

	Dialog.prototype.close=function(){
		this.uiManager.closeMenu(this);
	};


	Dialog.prototype.hide=function(){
		if($(this).find(":invalid").length) return;
		// Call the "hide()" function for any immediate children. This will allow nested
		// components to clean themselves up when a dialog is removed from outside of their scope.
		this.node.children().each(function(){
			if(typeof this.hide=="function")
				this.hide();
		});
		this.active=false;
		if(this.uiManager.overlay) this.uiManager.overlay.removeAttrBetter("cq-active");
		//this.uiManager.overlay=null;
		for(var attribute in this.activeAttributes){
			this.node.removeAttrBetter(attribute);
		}
		this.activeAttributes={};

		// blur any input boxes that are inside the dialog we're closing, to get rid of soft keyboard
		$(this).find("input").each(function(){
			if(this==document.activeElement) this.blur();
		});
	};

	/**
	 * Show the dialog. Use X,Y *screen location* (pageX, pageY from an event) for where to display context menus. If the context menu cannot fit on the screen then it will be adjusted leftward and upward
	 * by enough pixels so that it shows.
	 * @param {object} [params] Parameters
	 * @param  {Boolean} [params.bypassOverlay=false] If true will not display the scrim overlay
	 * @param {Number} [params.x] X location of top left corner. Use for context menus, otherwise dialog will be centered.
	 * @param {Number} [params.y] Y location of top left corner. Use for context menus, otherwise dialog will be centered.
	 * @alias show
	 * @memberof WebComponents.cq-dialog
	 */
	Dialog.prototype.show=function(params){
		this.params=params;
		if(!params) params=this.params={};
		var self=this;
		if(!this.uiManager.overlay && !params.bypassOverlay){
			this.uiManager.overlay=$("<cq-dialog-overlay></cq-dialog-overlay>");
			var context = params.context || CIQ.UI.getMyContext(this);
			if(context) context.node.append(this.uiManager.overlay);
		}
		setTimeout(function(){ // to get the opacity transition effect
			if(self.uiManager.overlay && !params.bypassOverlay) self.uiManager.overlay.attrBetter("cq-active");
			self.activeAttributes["cq-active"]=true; // cq-active is what css uses to display the dialog
			for(var attribute in self.activeAttributes){
				self.node.attrBetter(attribute);
			}
			self.resize();
			self.active=true;
		});
	};

	CIQ.UI.Dialog=Dialog
	customElements.define("cq-dialog", Dialog);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
