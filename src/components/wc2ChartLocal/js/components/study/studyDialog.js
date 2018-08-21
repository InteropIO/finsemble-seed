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
	 * Study Dialogs web component `<cq-study-dialog>`.
	 *
	 * Creates and manages Study Dialogs based on the corresponding study library entry
	 * (title, inputs, outputs, parameters, etc).
	 *
	 * Optional Attributes:
	 * - `cq-study-axis`  : Displays UI to enable changing the axis position and color.
	 * - `cq-study-panel` : Displays UI to enable changing the study panel and underlay/overlay flag.
	 *
	 * @namespace WebComponents.cq-study-dialog
	 * @example
	 	<caption>
		Here is an example of how to create a study dialog.
		We set the `cq-study-axis` and `cq-study-panel` attributes to enable form fields used to control axis position, color, study panel, and underlay/overlay.
		</caption>
<cq-dialog>
	<cq-study-dialog cq-study-axis cq-study-panel>
		<h4 class="title">Study</h4>
		<cq-scroll cq-no-maximize>
			<cq-study-inputs>
				<template cq-study-input>
					<cq-study-input>
						<div class="ciq-heading"></div>
						<div class="stx-data">
							<template cq-menu>
								<cq-menu class="ciq-select">
									<cq-selected></cq-selected>
									<cq-menu-dropdown cq-lift></cq-menu-dropdown>
								</cq-menu>
							</template>
						</div>
					</cq-study-input>
				</template>
			</cq-study-inputs>
			<hr>
			<cq-study-outputs>
				<template cq-study-output>
					<cq-study-output>
						<div class="ciq-heading"></div>
						<cq-swatch cq-overrides="auto"></cq-swatch>
					</cq-study-output>
				</template>
			</cq-study-outputs>
			<hr>
			<cq-study-parameters>
				<template cq-study-parameters>
					<cq-study-parameter>
						<div class="ciq-heading"></div>
						<div class="stx-data"><cq-swatch cq-overrides="auto"></cq-swatch>
							<template cq-menu>
								<cq-menu class="ciq-select">
									<cq-selected></cq-selected>
									<cq-menu-dropdown cq-lift></cq-menu-dropdown>
								</cq-menu>
							</template>
						</div>
					</cq-study-parameter>
				</template>
			</cq-study-parameters>
		</cq-scroll>
		<div class="ciq-dialog-cntrls">
			<div class="ciq-btn" stxtap="close()">Done</div>
		</div>
	</cq-study-dialog>
</cq-dialog>
	 * @since 5.2.0 Optional Attributes `cq-study-axis` and `cq-study-panel` are now available. 
	 */

	var StudyDialog = {
		prototype: Object.create(CIQ.UI.DialogContentTag)
	};

	StudyDialog.prototype.setContext=function(context){
		CIQ.UI.DialogContentTag.setContext.call(this, context);
		context.advertiseAs(this, 'StudyDialog');
	};

	StudyDialog.prototype.attachedCallback=function(){
		if(this.attached) return;
		CIQ.UI.DialogContentTag.attachedCallback.apply(this);
		var dialog=$(this);
		this.inputTemplate=dialog.find("template[cq-study-input]");
		this.outputTemplate=dialog.find("template[cq-study-output]");
		this.parameterTemplate=dialog.find("template[cq-study-parameters]");
		this.attached=true;
		this.queuedUpdates={};
	};

	StudyDialog.prototype.hide=function(){
		if(!CIQ.isEmpty(this.queuedUpdates)){
			this.helper.updateStudy(this.queuedUpdates);
			this.queuedUpdates={};
		}
		this.node.find("cq-menu").each(function(){
			if(this.unlift) this.unlift();
		});
		this.node.find("cq-swatch").each(function(){
			if(this.colorPicker) this.colorPicker.close();
		});
	};

	/**
	 * Sets up a handler to process changes to input fields
	 * @param {HTMLElement} node    The input field
	 * @param {string} section The section that is being updated, "inputs","outputs","parameters"
	 * @param {string} name    The name of the field being updated
	 * @memberof! WebComponents.cq-study-dialog
	 * @private
	 */
	StudyDialog.prototype.setChangeEvent=function(node, section, name){
		var self=this;
		function closure(){
			return function(){
				var updates={};
				updates[section]={};
				updates[section][name]=this.value;
				if(this.type=="checkbox" || this.type=="radio"){
					updates[section][name]=this.checked;
				}
				self.updateStudy(updates);
			};
		}
		node.change(closure());
	};

	StudyDialog.prototype.updateStudy=function(updates){
		if($(this).find(":invalid").length) return;
		if(this.helper.libraryEntry.deferUpdate){
			CIQ.extend(this.queuedUpdates, {inputs:updates.inputs});
			this.helper.updateStudy({outputs:updates.outputs, parameters:updates.parameters});
		}else{
			this.helper.updateStudy(updates);
		}
	};

	/**
	 * Accepts new menu (select box) selections
	 * @param {object} activator
	 * @param {string} section within the dialog ("inputs", "outputs", "parameters")
	 * @memberof! WebComponents.cq-study-dialog
	 * @since 5.2.0 added section argument
	 */
	StudyDialog.prototype.setSelectOption=function(activator, section){
		var node = $(activator.node);
		var name = node.attr('name');
		var value = node.attr('value');
		var newInput=$(node[0].cqMenuWrapper);
		var inputValue=newInput.find("cq-selected");
		inputValue.text(this.helper.stx.translateIf(value));
		newInput[0].fieldValue=value;
		if(!section) section="inputs";
		var updates={};
		updates[section]={};
		updates[section][name]=value;
		this.updateStudy(updates);
	};
	
	/**
	 * Adds fields to the study parameters, applicable to all studies, based on component attribute settings
	 * @param {object} sd  Study descriptor
	 * @memberof! WebComponents.cq-study-dialog
	 * @since 5.2.0
	 */
	StudyDialog.prototype.setGenericParameters=function(sd){
		sd.parameters.yaxisDisplay=sd.parameters.yaxisDisplayValue;
		if(this.hasAttribute("cq-study-panel")) {
			if(!sd.parameters) sd.parameters={};
			sd.parameters.panelName="panel";
			sd.parameters.underlayEnabled=false;
		}
		if(this.hasAttribute("cq-study-axis")) {
			if(!sd.parameters) sd.parameters={};
			sd.parameters.yaxisDisplay=["right","left","none","shared"];
		}
	};

	StudyDialog.prototype.open=function(params){
		CIQ.UI.DialogContentTag.open.apply(this, arguments);

		if(params && params.sd) this.setGenericParameters(params.sd);
		// Generate a "helper" which tells us how to create a dialog
		this.helper=new CIQ.Studies.DialogHelper(params);
		var dialog=$(this);

		dialog.find(".title").text(this.helper.title);

		var self=this;
		function makeMenu(name, currentValue, fields, section){
			var menu=CIQ.UI.makeFromTemplate(self.menuTemplate);
			var cqMenu=menu.find("cq-menu-dropdown"); // scrollable in menu.
			for(var field in fields){
				var item=$("<cq-item></cq-item>");
				item.text(fields[field]);
				item.attr("stxtap","StudyDialog.setSelectOption('"+section+"')"); // must call StudyDialog because the item is "lifted" and so doesn't know it's parent
				cqMenu.append(item);
				item[0].cqMenuWrapper=cqMenu.parents("cq-menu")[0];
				item.attr("name", name);
				item.attr("value", field);
				item[0].context=self.context;
			}
			var inputValue=menu.find("cq-selected");
			inputValue.text(self.helper.stx.translateIf(currentValue));
			return menu;
		}

		// Create form elements for all of the inputs
		var attributes;
		var inputs=dialog.find("cq-study-inputs");
		var i;
		inputs.empty();
		for (i = 0; i < this.helper.inputs.length; i++) {
			var input=this.helper.inputs[i];
			var newInput=CIQ.UI.makeFromTemplate(this.inputTemplate, inputs);
			this.menuTemplate=newInput.find("template[cq-menu]");
			newInput.find(".ciq-heading").text(input.heading);
			newInput[0].fieldName=input.name;
			var formField=null;

			var iAttr;
			attributes=this.helper.attributes[input.name];
			if(input.type=="number"){
				formField=$("<input>");
				formField.attr("type", "number");
				formField.val(input.value);
				this.setChangeEvent(formField, "inputs", input.name);
				for(iAttr in attributes) {
					var iAttrVal=attributes[iAttr];
					// poor IE/Edge can't perform decimal step validation properly, so we need to change step to any and give up the neat step effect
					if((CIQ.isIE || CIQ.isEdge) && iAttr=="step" && Math.floor(iAttrVal)!=iAttrVal) iAttrVal="any";
					formField.attr(iAttr,iAttrVal);
				}
			}else if(input.type=="text"){
				formField=$("<input>");
				formField.attr("type", "text");
				formField.val(input.value);
				this.setChangeEvent(formField, "inputs", input.name);
				for(iAttr in attributes) formField.attr(iAttr,attributes[iAttr]);
			}else if(input.type=="select"){
				formField=makeMenu(input.name, input.value, input.options, "inputs");
				if(attributes && attributes.readonly) formField.attr("readonly",attributes.readonly);
			}else if(input.type=="checkbox"){
				formField=$("<input>");
				formField.attr("type","checkbox");
				if(input.value) formField.prop("checked", true);
				this.setChangeEvent(formField, "inputs", input.name);
				for(iAttr in attributes) formField.attr(iAttr,attributes[iAttr]);
			}
			if(attributes && attributes.hidden) newInput.hide();
			if(formField) newInput.find(".stx-data").append(formField);
		}
		var swatch;
		var outputs=dialog.find("cq-study-outputs");
		outputs.empty();
		for (i = 0; i < this.helper.outputs.length; i++) {
			var output=this.helper.outputs[i];
			var newOutput=CIQ.UI.makeFromTemplate(this.outputTemplate, outputs);
			newOutput[0].initialize({studyDialog:this, output:output.name, params: params});
			newOutput.find(".ciq-heading").text(output.heading);
			newOutput.find(".ciq-heading")[0].fieldName=output.name;

			swatch=newOutput.find("cq-swatch");
			var color = output.color;
			if(typeof color === 'object') {
				color = color.color;
			}
			swatch[0].setColor(color, false); // don't percolate
		}

		var parameters=dialog.find("cq-study-parameters");
		parameters.empty();
		for (i = 0; i < this.helper.parameters.length; i++) {
			var parameter=this.helper.parameters[i];
			var newParam=CIQ.UI.makeFromTemplate(this.parameterTemplate, parameters);
			this.menuTemplate=newParam.find("template[cq-menu]");
			if(!this.menuTemplate.length && parameter.options) {
				newParam.remove();
				continue;
			}
			newParam.find(".ciq-heading").text(parameter.heading);
			swatch=newParam.find("cq-swatch");
			var paramInput=$("<input>");
			var pAttr;
			attributes={};
			if(parameter.defaultValue.constructor==Boolean){
				paramInput.attr("type", "checkbox");
				if(parameter.value) paramInput.prop("checked", true);
				this.setChangeEvent(paramInput, "parameters", parameter.name+"Enabled");
				swatch.remove();

				attributes=this.helper.attributes[parameter.name+"Enabled"];
				for(pAttr in attributes) paramInput.attr(pAttr,attributes[pAttr]);
			}else if(parameter.defaultValue.constructor==String){
				var paramName=parameter.name;
				if(parameter.defaultColor){
					newParam[0].initialize({studyDialog:this, parameter:parameter.name+"Color", params: params});
					swatch[0].setColor(parameter.color, false); // don't percolate
					paramName=paramName+"Value";
				}else{
					swatch.remove();
				}
				if(parameter.options){
					paramInput=makeMenu(paramName, parameter.value, parameter.options, "parameters");
				}else{
					paramInput.val(parameter.value);
				}
				attributes=this.helper.attributes[paramName];
				for(pAttr in attributes) paramInput.attr(pAttr,attributes[pAttr]);
			}else if(parameter.defaultValue.constructor==Number){
				paramInput.attr("type", "number");
				paramInput.val(parameter.value);
				this.setChangeEvent(paramInput, "parameters", parameter.name+"Value");
				newParam[0].initialize({studyDialog:this, parameter:parameter.name+"Color", params: params});
				swatch[0].setColor(parameter.color, false); // don't percolate

				attributes=this.helper.attributes[parameter.name+"Value"];
				for(pAttr in attributes) {
					var pAttrVal=attributes[pAttr];
					// poor IE/Edge can't perform decimal step validation properly, so we need to change step to any and give up the neat step effect
					if((CIQ.isIE || CIQ.isEdge) && pAttr=="step" && Math.floor(pAttrVal)!=pAttrVal) pAttrVal="any";
					paramInput.attr(pAttr,pAttrVal);
				}
			}else continue;

			if(attributes && attributes.hidden) newParam.hide();
			newParam.find(".stx-data").append(paramInput);
		}
	};

	CIQ.UI.StudyDialog=document.registerElement("cq-study-dialog", StudyDialog);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
