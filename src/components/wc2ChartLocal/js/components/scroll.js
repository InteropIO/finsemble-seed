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
	 * Scroll web component `<cq-scroll>`.
	 *
	 * cq-scroll web component creates an scrollable container. This will resize
	 * itself when the screen is resized. If perfect-scrollbar
	 * is supported then it will be used to replace the native scrollbar
	 *
	 * Attributes:
	 * cq-no-claim - Do not apply any keystroke capturing.
	 * cq-no-maximize - Do not automatically maximize the height (but keep it showing on screen)
	 * cq-no-resize - Do not apply any sizing logic.
	 *
	 * Use this.dataPortion to dynamically inject items into the list
	 * @namespace WebComponents.cq-scroll
	 * @example
	 <cq-lookup-results>
		 <cq-lookup-filters cq-no-close>
			 <cq-filter class="true">ALL</cq-filter>
			 <cq-filter>STOCKS</cq-filter>
			 <cq-filter>FX</cq-filter>
			 <cq-filter>INDEXES</cq-filter>
			 <cq-filter>FUNDS</cq-filter>
			 <cq-filter>FUTURES</cq-filter>
		 </cq-lookup-filters>
		 <cq-scroll></cq-scroll>
	 * @since 6.1.0 added cq-no-claim attribute
	 */

	var Scroll = {
		prototype: Object.create(CIQ.UI.BaseComponent)
	};

	/**
	 * Scroll back to top
	 */
	Scroll.prototype.top=function(){
		this.scrollTop=0;
		if(this.node.perfectScrollbar) this.node.perfectScrollbar("update");
	};

	/**
	 * Scroll to the element.
	 * @param  {HtmlElement} item The element to scroll to. Must be a child.
	 * @alias scrollToElement
	 * @memberof WebComponents.cq-scroll
	 */
	Scroll.prototype.scrollToElement=function(item){
		var bottom=this.clientHeight, scrolled=this.scrollTop;
		var itemBottom=item.offsetTop+item.clientHeight;
		if(item.offsetTop>scrolled && itemBottom<bottom+scrolled) return;
		this.scrollTop=Math.max(itemBottom-bottom,0);
		if(this.node.perfectScrollbar) this.node.perfectScrollbar("update");
	};

	Scroll.prototype.resize=function(){
		var node=this.node;
		if(node.parents(".sharing").length) return;  /*share.js appends this class to the body.
												Do not attempt unnecessary resize of scroll
												for a chart about to become a shared image.
												Besides, jquery will choke on offset() below.*/
		if(typeof(node.attr("cq-no-resize"))!="undefined") return;
		if(typeof(node.attr("cq-no-maximize"))!="undefined") this.noMaximize=true;
		var position=node[0].getBoundingClientRect();
		var reduceMenuHeight=node.prop("reduceMenuHeight") || 45; // defaulted to 45 to take into account 15px of padding on menus and then an extra 5px for aesthetics
		var winHeight=$(window).height();
		if(!winHeight) return;
		var height=winHeight-position.top - reduceMenuHeight;
		var holders=node.parents(".stx-holder,.stx-subholder,.chartContainer");
		if(holders.length){
			holders.each(function(){
				var h=$(this);
				var holderBottom=h[0].getBoundingClientRect().top+h.height();
				height=Math.min(height, holderBottom - position.top - 5); // inside a holder we ignore reduceMenuHeight, but take off 5 pixels just for aesthetics
			});
		}

		// If there are subsequent siblings that have a fixed height then make room for them
		var nextAll=node.nextAll();
		for(var i=0;i<nextAll.length;i++){
			var sibling=$(nextAll[i]);
			if(!sibling.is(":visible")) continue; // skip hidden siblings
			height-=sibling.height();
		}
		if(!this.noMaximize) node.css({"height": height + "px"});
		node.css({"max-height": height + "px"});
		if(node.perfectScrollbar) node.perfectScrollbar("update");
	};

	Scroll.prototype.createdCallback=function(){
		CIQ.UI.BaseComponent.createdCallback.apply(this);
		this.node=$(this);
		this.node.css({"overflow-y":"auto"});
	};

	Scroll.prototype.attachedCallback=function(){
		if(this.attached) return;
		CIQ.UI.BaseComponent.attachedCallback.apply(this);
		this.uiManager=$("cq-ui-manager");
		if(this.uiManager.length>0) this.uiManager=this.uiManager[0];

		var node=this.node;
		if(node.perfectScrollbar) node.perfectScrollbar({suppressScrollX:true});
		if(typeof(node.attr("cq-no-claim"))=="undefined") this.addClaim(this);

		// prevent mousewheel event from propagating up to parents, such as when embedded in a chart
		this.addEventListener(CIQ.wheelEvent, function(e){
			e.stopPropagation();
		});

		var self=this;
		CIQ.addResizeListener(this, function(){
			self.resize();
		});
		this.resize();
		this.attached=true;
	};

	/**
	 * Scroll components can handle up and down enter keystrokes.
	 * They do not register for claims directly. Another section of code must
	 * establish the claim on their behalf or proxy the keystroke.
	 *
	 * Up and down arrows will iterate through cq-item tags. The attribute
	 * cq-focused will be added to the currently focused tag. This can then be
	 * queried later, such as when a user hits enter.
	 *
	 * space bar or enter will call the selectFC callback on the cq-item if it exists
	 * @param {undefined} hub Unused parameter
	 * @param {string} key Key that was stroked
	 * @param {object} e The event object
	 * @return {boolean}
	 */
	Scroll.prototype.keyStroke=function(hub, key, e){
		var node=this.node;

		if(!node.is(":trulyvisible")) return false;
		switch(key){
		case "ArrowUp":
		case "ArrowDown":
		case "Enter":
		case " ":
		case "Up":
		case "Down":
		case "Spacebar":
			break;
		default:
			return false;
		}
		var items=node.find("cq-item");
		if(!items.length) return;
		var focused=node.find("cq-item[cq-focused]");

		if(key==" " || key=="Spacebar" || key=="Enter"){
			if(focused.length && focused[0].selectFC){
				focused[0].selectFC.call(focused, e);
				return true;
			}
			return false;
		}
		if(!focused.length){
			$(items[0]).attr("cq-focused","true");
			this.scrollToElement(items[0]);
			return true;
		}
		items.removeAttr("cq-focused");

		// locate our location in the list of items
		for(var i=0;i<items.length;i++)
			if(items[i]===focused[0]) break;

		if(key=="ArrowUp" || key=="Up"){
			i--;
			if(i<0) i=0;
		}
		if(key=="ArrowDown" || key=="Down"){
			i++;
			if(i>=items.length) i=items.length-1;
		}
		$(items[i]).attr("cq-focused","true");
		this.scrollToElement(items[i]);
		return true;
	};

	/**
	 * Returns the focused element or null. An item is focused if it has
	 * attribute cq-focused.
	 * @return {HTMLElement} The element or null
	 * @alias focused
	 * @memberof WebComponents.cq-scroll
	 */
	Scroll.prototype.focused=function(){
		var focused=this.node.find("cq-item[cq-focused]");
		if(focused.length) return focused[0];
		return null;
	};

	CIQ.UI.Scroll=document.registerElement("cq-scroll", Scroll);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
