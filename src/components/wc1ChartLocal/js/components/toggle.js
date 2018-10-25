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
	 * Toggle web component `<cq-toggle>`.
	 *
	 * UI Helper that binds a toggle to an object member, or callbacks when toggled
	 * cq-member Object member to observe. If not provided then callbacks will be used exclusively.
	 * cq-action default="class" Action to take
	 * cq-value default="active" Value for action (i.e. class name)
	 * cq-toggles A comma separated list of valid values which will be toggled through with each click. List may include "null".
	 *
	 * use registerCallback to receive a callback every time the toggle changes. When a callback is registered, any automatic
	 * class changes are bypassed
	 *
	 * @namespace WebComponents.cq-toggle
	 * @example
	 * $("cq-toggle").registerCallback(function(value){
	 *    console.log("current value is " + value);
	 *    if(value!=false) this.node.addClass("active");
	 * })
	 */
	// var Toggle = {
	// 	prototype: Object.create(CIQ.UI.ContextTag)
	// };

	class Toggle extends CIQ.UI.ContextTag {
		constructor() {
			super()
		}
	}

	Toggle.prototype.setContext=function(context){
		this.currentValue=false;
		this.params.obj=this.context.stx.layout;
		var member=this.node.attr("cq-member");
		if(member) this.params.member=member;
		var action=this.node.attr("cq-action");
		if(action) this.params.action=action;
		var value=this.node.attr("cq-value");
		if(value) this.params.value=value;
		var toggles=this.node.attr("cq-toggles");
		if(toggles) this.params.toggles=toggles.split(",");
		for(var i=0;i<this.params.toggles.length;i++){
			if(this.params.toggles[i]=="null") this.params.toggles[i]=null;
		}
		this.begin();
	};

	Toggle.prototype.connectedCallback=function(){
		if(this.attached) return;
		this.params={
			member: null,
			obj: null,
			action: "class",
			value: "active",
			toggles: [],
			callbacks: []
		};
		CIQ.UI.ContextTag.attachedCallback.apply(this);
		this.attached=true;
	};

	Toggle.prototype.registerCallback=function(fc, immediate){
		if(immediate!==false) immediate=true;
		this.params.callbacks.push(fc);
		if(immediate) fc.call(this, this.currentValue);
	};

	/**
	 * @param params
	 * @memberof WebComponents.cq-toggle
	 */
	Toggle.prototype.updateFromBinding=function(params){
		this.currentValue=params.obj[params.member];
		if(!this.params.callbacks.length){
			if(this.params.action=="class"){
				if(this.currentValue){
					this.node.addClass(this.params.value);
				}else{
					this.node.removeClass(this.params.value);
				}
			}
		}else{
			for(var i=0;i<this.params.callbacks.length;i++){
				this.params.callbacks[i].call(this, this.currentValue);
			}
		}

		if( params.member == "crosshair" && this.currentValue === false ) this.context.stx.doDisplayCrosshairs();
	};

	/**
	 * @param value
	 * @memberof WebComponents.cq-toggle
	 */
	Toggle.prototype.set=function(value){
		if(this.params.member){
			this.params.obj[this.params.member]=value;
		}else{
			this.currentValue=value;
			for(var i=0;i<this.params.callbacks.length;i++){
				this.params.callbacks[i].call(this, this.currentValue);
			}
		}
	};

	/**
	 * @memberof WebComponents.cq-toggle
	 */
	Toggle.prototype.begin=function(){
		var self=this;
		var stx=this.context.stx;
		if(this.params.member){
			CIQ.UI.observe({
				selector: this.node,
				obj: this.params.obj,
				member: this.params.member,
				action: "callback",
				value: function(params){
					self.updateFromBinding(params);
				}
			});
		}
		this.node.stxtap(function(){
			var toggles=self.params.toggles;
			var obj=self.params.obj;
			if(toggles.length>1){ // Cycle through each field in the array with each tap
				for(var i=0;i<toggles.length;i++){
					var toggle=toggles[i];
					if(self.currentValue==toggle){
						if(i<toggles.length-1)
							self.set(toggles[i+1]);
						else
							self.set(toggles[0]);
						break;
					}
				}
				if(i==toggles.length){ // default to first item in toggle
					self.set(toggles[0]);
				}
			}else{
				if(self.currentValue){
					self.set(false);
				}else{
					self.set(true);
				}
			}
			stx.draw();
			if(obj===stx.layout) stx.changeOccurred("layout");
		});
	};

	CIQ.UI.Toggle=customElements.define("cq-toggle", Toggle);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
