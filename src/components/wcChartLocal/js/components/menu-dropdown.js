/* removeIf(umd) */ ;(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['componentUI', 'components/scroll'], factory);
	} else if (typeof exports === 'object') {
		module.exports = factory(require('./componentUI'), require('./components/scroll'));
	} else {
		factory(root, root);
	}
})(this, function(_exports, _scroll) {
	var CIQ = _exports.CIQ;
	/* endRemoveIf(umd) */

	/**
	 * Menu DropDown web component `<cq-menu-dropdown>`.
	 *
	 * Menu DropDown handles holding the items that go inside a custom menu component.
	 * @namespace WebComponents.cq-menu-dropdown
	 * @example
	 <cq-menu class="ciq-menu ciq-studies collapse">
		 <span>Studies</span>
		 <cq-menu-dropdown cq-no-scroll>
			 <cq-study-legend cq-no-close>
				 <cq-section-dynamic>
					 <cq-heading>Current Studies</cq-heading>
					 <cq-study-legend-content>
						 <template>
							 <cq-item>
								 <cq-label class="click-to-edit"></cq-label>
								 <div class="ciq-icon ciq-close"></div>
							 </cq-item>
						 </template>
					 </cq-study-legend-content>
					 <cq-placeholder>
						 <div stxtap="Layout.clearStudies()" class="ciq-btn sm">Clear All</div>
					 </cq-placeholder>
				 </cq-section-dynamic>
			 </cq-study-legend>
			 <cq-scroll>
				 <cq-studies>
				 	 <cq-studies-content>
						<template>
							<cq-item>
								<cq-label></cq-label>
							</cq-item>
						</template>
					 </cq-studies-content>
				 </cq-studies>
			 </cq-scroll>
		 </cq-menu-dropdown>
	 */

	var MenuDropDown = {
		prototype: Object.create(CIQ.UI.BaseComponent)
	};

	// Whoa, double inheritance! Yes, we need this web component to inherit from both
	// CIQ.UI.Scroll as well as CIQ.UI.BaseComponent.
	CIQ.UI.addInheritance(MenuDropDown, CIQ.UI.Scroll);

	MenuDropDown.prototype.createdCallback=function(){
		if (this.ownerDocument !== document) return;  //https://bugs.chromium.org/p/chromium/issues/detail?id=430578
		var node=$(this);
		CIQ.UI.BaseComponent.createdCallback.call(this);
		if(typeof(node.attr("cq-no-scroll"))=="undefined")
			CIQ.UI.Scroll.prototype.createdCallback.call(this);
	};

	MenuDropDown.prototype.attachedCallback=function(){
		if(this.attached) return;
		var node=$(this);
		this.noMaximize=true;
		CIQ.UI.BaseComponent.attachedCallback.call(this);
		this.attached=false; // double inheritance!
		if(typeof(node.attr("cq-no-scroll"))=="undefined")
			CIQ.UI.Scroll.prototype.attachedCallback.call(this);
		this.attached=true;
	};



	CIQ.UI.MenuDropDown=document.registerElement("cq-menu-dropdown", MenuDropDown);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
