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
	 * Side Panel web component `<cq-side-panel>`.
	 *
	 * @namespace WebComponents.cq-side-panel
	 * @example
	 	 <cq-side-panel><cq-side-panel>
	 */
	var SidePanel = {
		prototype: Object.create(CIQ.UI.ContextTag)
	};

	SidePanel.prototype.createdCallback=function(){
		CIQ.UI.ContextTag.createdCallback.apply(this,arguments);
		this.callbacks=[];
		window.addEventListener("resize", function(self){
			var cb=self.resizeMyself.bind(self);
			return function(){
				setTimeout(cb,0);
			};
		}(this));
	};

	SidePanel.prototype.registerCallback=function(fc){
		this.callbacks.push(fc);
	};

	/**
	 * Opens a side panel to show more options in mobile.
	 * @param  {Object} params Parameters
	 * @param {string} params.selector The selector for which child to enable
	 * @param {string} [params.className] The class name to add to turn on the panel
	 * @param {string} [params.attribute] The attribute to add to turn on the panel
	 * @alias open
	 * @memberof WebComponents.cq-side-panel
	 */
	SidePanel.prototype.open=function(params){
		this.close();
		var children=this.node.find(params.selector);
		if(params.className){
			children.addClass(params.className);
			children.each(function(){
				this.sidePanelActiveClass=params.className; // store the class name used to turn it on
			});
		}else{
			children.attr(params.attribute, "true");
			children.each(function(){
				this.sidePanelActiveAttribute=params.attribute; // store the attribute name used to turn it on
			});
		}
		this.node.attr("cq-active","true");
		var self=this;
		setTimeout(function(){
			self.resizeMyself();
		},0);
	};

	SidePanel.prototype.close=function(){
		this.node.removeAttr("cq-active");
		var children=this.node.children();
		children.each(function(){
			if(this.sidePanelActiveClass)
				$(this).removeClass(this.sidePanelActiveClass); // turn off a child by removing the class name added to it
			else
				$(this).removeAttr(this.sidePanelActiveAttribute); // turn off a child by removing the attribute name added to it
		});
		var self=this;
		setTimeout(function(){
			self.resizeMyself();
		},0);
	};

	/**
	 * Use this method to get the width instead of querying the node directly because the side panel may be animated.
	 * @return {number} The width
	 */
	SidePanel.prototype.nonAnimatedWidth=function(){
		var width=0;
		this.node.children().width(function(i,w){width+=w;}); // accumulate width of all children
		return width;
	};

	SidePanel.prototype.resizeMyself=function(){
		var width=0;
		this.node.children().width(function(i,w){width+=w;}); // accumulate width of all children
		this.node.css({"width": width + "px"}); // expand the side panel
		for(var i=0;i<this.callbacks.length;i++) // let any callbacks know that we've been resized
			this.callbacks[i].call(this, width);
	};

	/**
	 * A side panel contains children that should be enabled by calling open({selector:selector}).
	 */
	CIQ.UI.SidePanel=document.registerElement("cq-side-panel", SidePanel);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
