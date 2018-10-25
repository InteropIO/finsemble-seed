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
	 * fibonacci settings dialog web component `<cq-fib-settings-dialog>`.
	 * 
	 * @namespace WebComponents.cq-fib-settings-dialog
	 * @example
	  <cq-dialog>
	  	<cq-fib-settings-dialog>
	  		<h4 class="title">Settings</h4>
	  		<cq-scroll cq-no-maximize>
	  			<cq-fibonacci-settings>
	  				<template cq-fibonacci-setting>
	  					<cq-fibonacci-setting>
	  						<div class="ciq-heading"></div>
	  						<div class="stx-data"></div>
	  					</cq-fibonacci-setting>
	  				</template>
	  			</cq-fibonacci-settings>
	  		</cq-scroll>
	  		<div class="ciq-dialog-cntrls">
	  			<div class="ciq-btn" stxtap="close()">Done</div>
	  		</div>
	  	</cq-fib-settings-dialog>
	  </cq-dialog>
	 * @since 3.0.9
	 */

	var FibSettingsDialog = {
		prototype: Object.create(CIQ.UI.DialogContentTag)
	};

	/**
	 * Adds a custom fib level
	 * @memberOf WebComponents.cq-fib-settings-dialog
	 * @since 5.2.0
	 */
	
	FibSettingsDialog.prototype.add=function(){
		var level=$(this).find("[cq-custom-fibonacci-setting] input").val();
		if(!level) return;
		level=parseFloat(level)/100;
		if(isNaN(level)) return;
		var defaultFibs = this.context.stx.currentVectorParameters.fibonacci.fibs || [];
		var fib, newFib;
		for (var index = 0; index < defaultFibs.length; index++) {
			fib = defaultFibs[index];
			if(fib.level>level){
				newFib=CIQ.clone(fib);
				newFib.level=level;
				newFib.display=true;
				defaultFibs.splice(index,0,newFib);
				break;
			}
		}
		if(!newFib){
			if(defaultFibs.length) fib=CIQ.clone(defaultFibs[0]);
			else fib={color:"auto", parameters:{pattern:"solid", opacity:0.25, lineWidth:1}};
			newFib=CIQ.clone(fib);
			newFib.level=level;
			newFib.display=true;
			defaultFibs.push(newFib);				
		}
		this.open();
	};
	
	/**
	 * Sets up a handler to process changes to fields
	 * @param {HTMLElement} node    The input field
	 * @param {string} section The section that is being updated
	 * @param {string} name    The name of the field being updated
	 * @memberOf WebComponents.cq-fib-settings-dialog
	 * @private
	 */
	
	FibSettingsDialog.prototype.setChangeEvent=function(node, section, item){
		var self=this;
		function closure(){
			return function(){
				var vectorParameters = self.context.stx.currentVectorParameters;
				var vectorType = vectorParameters.vectorType;

				// fibonacci type
				if(vectorParameters.fibonacci && vectorType!="fibtimezone") {
					var defaultFibs = vectorParameters.fibonacci.fibs || [];
					if(this.type=="checkbox"){
						for (var index = 0; index < defaultFibs.length; index++) {
							var fib = defaultFibs[index];

							if(fib.level === item) {
								fib.display = this.checked ? true : false;
							}
						}
					}
				}
			};
		}
		node.change(closure());
	};

	/**
	 * Opens the cq-fib-settings-dialog
	 * @param  {Object} params Parameters
	 * @param {HTMLElement} params.caller used to fire a change event as the dialog closes
	 * @param {CIQ.UI.Context} params.context sent to setContext web component method
	 * @memberOf WebComponents.cq-fib-settings-dialog
	 */
	FibSettingsDialog.prototype.open=function(params){
		CIQ.UI.DialogContentTag.open.apply(this, arguments);
		if(params) this.opener = params.caller;

		var vectorParameters = this.context.stx.currentVectorParameters;
		var vectorType = vectorParameters.vectorType;
		var dialog=$(this);

		// fibonacci type
		var parameters;
		if(vectorParameters.fibonacci && vectorType!="fibtimezone") {
			dialog.find(".title").text("Fibonacci Settings");
			var defaultFibs = vectorParameters.fibonacci.fibs || [];
			parameters=dialog.find("cq-fibonacci-settings");
			parameters.emptyExceptTemplate();

			for (var index = 0; index < defaultFibs.length; index++) {
				var fib = defaultFibs[index];

				// no negative values for fibonacci arc
				if(vectorType === 'fibarc' && fib.level < 0) continue;

				var newParam=CIQ.UI.makeFromTemplate(this.node.find("template"), parameters);
				var convertPercent = fib.level * 100;
				newParam.find(".ciq-heading").text(convertPercent.toFixed(1) + '%');
				var paramInput = newParam.find("input");

				if(fib.display) {
					paramInput.prop("checked", true);
				}

				this.setChangeEvent(paramInput, "fib", fib.level);
				newParam.find(".stx-data").append(paramInput);
			}
		} 
		// settings dialog default
		else {
			dialog.find(".title").text("Settings");

			// clear the existing web components
			parameters=dialog.find("cq-fibonacci-settings");
			parameters.emptyExceptTemplate();
		}
		$(this).find("[cq-custom-fibonacci-setting] input").val("");
	};

	/**
	 * Fires a "change" event and closes the dialog.
	 *
	 * @memberOf WebComponents.cq-fib-settings-dialog
	 * @since 6.2.0
	 */
	FibSettingsDialog.prototype.close=function() {
		var event;

		if (typeof Event === 'function') {
			event = new Event('change', {
				bubbles: true,
				cancelable: true
			});
		} else {
			event = document.createEvent('Event');
			event.initEvent('change', true, true);
		}

		if(this.opener) this.opener.dispatchEvent(event);
		CIQ.UI.DialogContentTag.close.call(this);
	};

	CIQ.UI.FibSettingsDialog=document.registerElement("cq-fib-settings-dialog", FibSettingsDialog);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
