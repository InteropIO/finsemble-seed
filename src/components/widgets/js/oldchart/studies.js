// -------------------------------------------------------------------------------------------
// Copyright 2012-2016 by ChartIQ, Inc
// -------------------------------------------------------------------------------------------
(function (definition) {
    "use strict";

    if (typeof exports === "object" && typeof module === "object") {
        module.exports = definition(require('./core/master'));
    } else if (typeof define === "function" && define.amd) {
        define(['core/master'], definition);
    } else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition(global);
    } else {
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for studies.js.");
    }

})(function(_exports) {
	console.log("studies.js",_exports);

	var CIQ=_exports.CIQ;

	/**
	 * Namespace for functionality related to studies (aka indicators)
	 * @namespace
	 * @name  CIQ.Studies
	 */
	CIQ.Studies=function(){};

	/**
	 * Array of study outputs which should be considered valid fields in the study dialog "Field" dropdown".
	 * This is autopopulated from {@link CIQ.Studies.displayStudies}.
	 * @type {Array}
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.actualOutputs=[];

	/**
	 * Maps the names of studies to the panel that they are drawn on. For instance, a moving average may be drawn on an RSI panel
	 * @type {Object}
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.studyPanelMap={};
	CIQ.Studies.colorPickerDiv=null;

	/**
	 * A study descriptor contains all of the information necessary to instantiate a study.
	 * @param {string} name       The name of the study. This should be unique to the chart. For instance if there are two RSI panels then they should be of different periods and named accordingly. Usually this is determined automatically by the library.
	 * @param {string} type       The type of study, which can be used as a look up in the StudyLibrary
	 * @param {string} panel      The name of the panel that contains the study
	 * @param {object} inputs     Names and values of input fields
	 * @param {object} outputs    Names and values (colors) of outputs
	 * @param {object} parameters Additional parameters that are unique to the particular study
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.StudyDescriptor=function(name, type, panel, inputs, outputs, parameters){
		this.name=name;
		this.type=type;
		this.panel=panel;
		this.inputs=inputs;
		this.outputs=outputs;
		this.libraryEntry=CIQ.Studies.studyLibrary[type];
		if(this.libraryEntry){
			if(typeof(this.libraryEntry.inputs)=="undefined") this.libraryEntry.inputs={"Period":14};
			if(typeof(this.libraryEntry.outputs)=="undefined") this.libraryEntry.outputs={"Result":"auto"};
		}else{
			this.libraryEntry={};
			if(panel=="chart" || (parameters && parameters.chartName=="chart")) this.libraryEntry.overlay=true;
		}
		this.outputMap={};	// Maps dataSet label to outputs label "RSI (14)" : "RSI", for the purpose of figuring color
		this.min=null;
		this.max=null;
		this.parameters=parameters;	// Optional parameters, i.e. zones
	};

	/**
	 * Automatically generates a unique name for the study instance. If a translation callback has been associated with the chart
	 * object then the name of the study will be translated.
	 * @param  {object} stx       A chart object
	 * @param  {string} studyName Type of study
	 * @param  {object} inputs    The inputs for this study instance
	 * @param {string} [replaceID] If it matches then return the same id
	 * @return {string}           A unique name for the study
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.generateID=function(stx, studyName, inputs, replaceID){
		var translatedStudy=studyName;
		if(stx) translatedStudy=stx.translateIf(translatedStudy);
		if(CIQ.isEmpty(inputs)) return translatedStudy;
		if(CIQ.Studies.studyLibrary[studyName].customRemoval) return studyName;  //therefore only one instance can exist at a time
		var id=translatedStudy + " (";
		var first=false;
		for(var field in inputs){
			if(field=="Shading") continue;  //this does not merit being in the studyname
			var val=inputs[field];
			if(val=="field") continue; // skip default, usually means "Close"
			if(!first){
				first=true;
			}else{
				id+=",";
			}
			id+=val;
		}
		id+=")";

		//this tests if replaceID is just a warted version of id, int that case keep the old id
		if(replaceID && replaceID.indexOf(id)===0) return replaceID;

		// If the id already exists then we'll wart it by adding -N
		if(stx.layout.studies && stx.layout.studies[id]){
			for(var i=2;i<50;i++){
				var warted=id+"-"+i;
				if(!stx.layout.studies[warted]){
					id=warted;
					break;
				}
			}
		}
		return id;
	};

	
			/**
	 * Generates an object that can be used to create a dialog for creating or modifying a study.
	 * The object will then contain arrays for inputs, outputs and parameters. Each
	 * input will describe a form field that should be generated. Each output will describe a color
	 * swatch that should be generated. The results of the dialog would then be passed to {@link CIQ.Studies.addStudy}
	 * The libraryEntry, which is the object that defines the prototype for a study, may contain attributes which are used
	 * to help construct the input fields of the study dialog.  See documentation of {@link CIQ.Studies.studyLibrary}.
	 * @param  {CIQ.Studies.StudyDescriptor} params.name Name of study to add
	 * @param  {CIQ.Studies.StudyDescriptor} params.sd A study descriptor when modifying an existing study
	 * @param  {CIQ.CIQ.ChartEngine} params.stx A chart object
	 * @param  {Object} [params.inputs] Existing input parameters for the study (if modifying)
	 * @param  {Object} [params.outputs] Existing output parameters for the study (if modifying)
	 * @param  {Object} [params.parameters] Existing additional parameters for the study (if modifying)
	 * @example
	 * var helper=new CIQ.Studies.DialogHelper({sd:sd,stx:stx});
	 * console.log(helper.inputs);
	 * console.log(helper.outputs);
	 * console.log(helper.parameters);
	 */
	CIQ.Studies.DialogHelper=function(params){
		var stx=this.stx=params.stx;
		var sd=this.sd=params.sd;
		this.name=sd?sd.type:params.name;
		this.inputs=[];
		this.outputs=[];
		this.parameters=[];
		var libraryEntry=this.libraryEntry=sd?sd.libraryEntry:CIQ.Studies.studyLibrary[params.name];
		var panel=(sd && stx.panels[sd.panel]) ? stx.panels[sd.panel] : {chart:stx.chart};
		var chart=panel.chart;

		this.title=stx.translateIf(libraryEntry.name);

		this.attributes=libraryEntry.attributes;
		if(!this.attributes) this.attributes={};

		/*
		This code loops through the acceptable inputs for the study in question. The format of the input default in the studyLibrary determines what type of input
		is required. For instance a number requires an input field. A string will produce a select box, of moving averages for instance if the string is "ma".
		If the string is "field" then a select box of acceptable fields is displayed. Likewise, an array will show up as a select box.
		 */
		for(var i in libraryEntry.inputs){
			var input={};
			this.inputs.push(input);
			input.name=i;
			input.heading=stx.translateIf(i);
			var acceptedData=libraryEntry.inputs[i];
			if(sd && sd.inputs && typeof(sd.inputs[i])!="undefined" && sd.inputs[i]!==null)
				input.value=sd.inputs[i];
			else
				input.value=libraryEntry.inputs[i];				

			input.defaultInput=libraryEntry.inputs[i];
			if(!this.attributes[i]) this.attributes[i]=CIQ.Studies.inputAttributeDefaultGenerator(input.defaultInput);

			if(acceptedData.constructor==Number){
				input.type="number";
			}else if(acceptedData.constructor==String){
				var isMA=CIQ.Studies.movingAverageHelper(stx,input.defaultInput);
				if(isMA){
					input.type="select";
					input.defaultInput=isMA;
					var converted=CIQ.Studies.movingAverageHelper(stx,input.value);
					if(!converted) converted=input.value;
					input.value=converted;
					input.options=CIQ.Studies.movingAverageHelper(stx,"options");
				}else if(acceptedData=="field"){
					input.type="select";
					input.options={};
					nextField:
					for(var field in chart.dataSet[chart.dataSet.length-1]){
						if(["Open","High","Low","Close","Adj_Close","hl/2","hlc/3","hlcc/4", "ohlc/4"].indexOf(field) == -1){
							// field not an actual output but rather is just an intermediate value, so skip
							if(CIQ.Studies.actualOutputs.indexOf(field)==-1) continue;
							// can't modify study basing it on its own output data, which is changing due to the same modify (infinite loop)
							// can't modify study A basing it on another study B which uses study A data, this causes infinite loop as well
							for(var out in params.sd.outputMap){
								// here we make sure that the output, and not a warted version of it, is in the field before skipping it.
								if(field.indexOf(out)!=-1 && field.indexOf(out+"-")==-1) continue nextField;
							}
						}
						input.options[field]=stx.translateIf(field);
					}
					if(input.value=="field"){
						input.value="Close";
					}
					if(input.defaultInput=="field"){
						input.defaultInput="Close";
					}
				}else{
					input.type="text";
				}
			}else if(acceptedData.constructor==Boolean){
				input.type="checkbox";
				if(input.value===true || input.value=="true" || input.value=="on") input.value=true;
			}else if(acceptedData.constructor==Array){
				input.type="select";
				input.options={};
				for(var ii=0;ii<acceptedData.length;ii++){
					input.options[acceptedData[ii]]=stx.translateIf(acceptedData[ii]);
				}
				if(input.value.constructor==Array){
					input.value=input.value[0];
				}
				input.defaultInput=acceptedData[0];
			}
		}

		/*
		Outputs are much simpler than inputs. Outputs are simply a list of available outputs and the selected color for that output. So here
		we print a line item in the dialog for each output and attach a color picker to it. The color picker is obtained from the Context.
		 */

		for(i in libraryEntry.outputs){
			var output={
				name:i,
				heading: stx.translateIf(i)
			};
			this.outputs.push(output);

			output.color=output.defaultOutput=libraryEntry.outputs[i];
			if(sd && sd.outputs && sd.outputs[i]) output.color=sd.outputs[i];
			if(output.color=="auto") output.color=stx.defaultColor;
		}

		/* And now the parameters */
		
		if(libraryEntry.parameters && libraryEntry.parameters.template=="studyOverZones"){
			var init=libraryEntry.parameters.init;
			if(init){
				var obj;
				obj={name:"studyOverZones", heading:stx.translateIf("Show Zones"),
					defaultValue:init.studyOverZonesEnabled, value:init.studyOverZonesEnabled};
				var parameters=sd?sd.parameters:null;
				if(parameters && (parameters.studyOverZonesEnabled || parameters.studyOverZonesEnabled===false)) {
					obj.value=parameters.studyOverZonesEnabled;
				}
				this.parameters.push(obj);

				obj={name:"studyOverBought", heading:stx.translateIf("OverBought"),
					defaultValue:init.studyOverBoughtValue, value:init.studyOverBoughtValue,
					defaultColor:init.studyOverBoughtColor, color:init.studyOverBoughtColor};
				if(parameters && parameters.studyOverBoughtValue) obj.value=parameters.studyOverBoughtValue;
				if(parameters && parameters.studyOverBoughtColor) obj.color=parameters.studyOverBoughtColor;					
				if(obj.color=="auto") obj.color=stx.defaultColor;
				this.parameters.push(obj);

				obj={name:"studyOverSold", heading:stx.translateIf("OverSold"),
					defaultValue:init.studyOverSoldValue, value:init.studyOverSoldValue,
					defaultColor:init.studyOverSoldColor, color:init.studyOverSoldColor};
				if(parameters && parameters.studyOverSoldValue) obj.value=parameters.studyOverSoldValue;
				if(parameters && parameters.studyOverSoldColor) obj.color=parameters.studyOverSoldColor;					
				if(obj.color=="auto") obj.color=stx.defaultColor;
				this.parameters.push(obj);
				
				if(!this.attributes.studyOverBoughtValue) this.attributes.studyOverBoughtValue={};
				if(!this.attributes.studyOverSoldValue) this.attributes.studyOverSoldValue={};
			}
		}
	};

	/**
	 * Update (or add) the study attached to the DialogHelper.
	 * @param  {Object} updates Should contain updates
	 * @example
	 * var helper=new CIQ.Studies.DialogHelper({sd:sd, stx:stx});
	 * helper.updateStudy({inputs:{Period:60}});
	 */
	CIQ.Studies.DialogHelper.prototype.updateStudy=function(updates){
		var newParams={};
		var sd=this.sd;
		var libraryEntry=this.libraryEntry;
		newParams.inputs=CIQ.shallowClone(sd?sd.inputs:libraryEntry.inputs);
		newParams.outputs=CIQ.shallowClone(sd?sd.outputs:libraryEntry.outputs);
		newParams.parameters=CIQ.shallowClone(sd?sd.parameters:libraryEntry.parameters);
		CIQ.extend(newParams, updates);
		if(!newParams.parameters) newParams.parameters={};
		if(newParams.inputs && newParams.inputs.id){
			newParams.parameters.replaceID=newParams.inputs.id;
			delete newParams.inputs.id;
			delete newParams.inputs.display;
		}
		this.sd=CIQ.Studies.addStudy(this.stx, this.name, newParams.inputs, newParams.outputs, newParams.parameters);
	};

	/**
	 * Prepares a study descriptor for use by assigning default calculation or display functions if required and configuring the outputMap
	 * which is used internally to determine the color for each output. This method also places any overlays into the stx.overlays array for
	 * future reference. Finally it is responsible for rebuilding any derived studies when replacing an underlying study.
	 * @private
	 * @param  {object} stx   A chart object
	 * @param  {object} study The study library entry
	 * @param  {object} sd    The study descriptor for this instance
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.prepareStudy=function(stx, study, sd, parameters){
		if(typeof(study.calculateFN)=="undefined") study.useRawValues=true;
		if(typeof(study.seriesFN)=="undefined") study.seriesFN=CIQ.Studies.displaySeriesAsLine;

		if(parameters && parameters.replaceID){
			// Remove any overlays that relied on the old panel ID name, for instance a moving average on RSI(14) is no
			CIQ.Studies.rejiggerDerivedStudies(stx, parameters.replaceID, sd.inputs.id, sd.panel);
			delete parameters.replaceID;
		}

		// Unless overridden by the calculation function we assume the convention that the dataSet entries
		// will begin with the output name such as "RSI rsi (14)"
		if(CIQ.isEmpty(sd.outputMap)){
			for(var i in sd.outputs){
				if(study.useRawValues){
					sd.outputMap[i]=i;
				}else{
					sd.outputMap[i + " " + sd.name]=i;
				}
			}
		}
		if(sd.overlay){
			stx.overlays[sd.name]=sd;
		}
		if(sd.underlay){
			stx.overlays[sd.name]=sd;
		}
		if(parameters && parameters.replaceID){
			// Remove any overlays that relied on the old panel ID name, for instance a moving average on RSI(14) is no
			CIQ.Studies.rejiggerDerivedStudies(stx, parameters.replaceID, sd.inputs.id, sd.panel);
			delete parameters.replaceID;
		}
		if(study.feed ){
			stx.attachTagAlongQuoteFeed(study.feed);
		}else{
			if(sd.chart.dataSet) stx.createDataSet();
			stx.draw();
		}
	};

	/**
	 * Fixes any derived studies that were based off of a study that has just changed.
	 * For instance a moving average on another overlay, or a moving average on an RSI.
	 * The panel name needs to change and the input "Field".
	 * @param  {CIQ.ChartEngine} stx       The stx instance
	 * @param  {String} replaceID The old ID for the underlying study e.g. RSI (14)
	 * @param  {String} newID     The new ID for the underlying study
	 */
	CIQ.Studies.rejiggerDerivedStudies=function(stx, replaceID, newID, panelID){
		var studies=stx.layout.studies, overlays=stx.overlays;
		for(var s in studies){
			var st=studies[s];
			var inputs=st.inputs;
			var derivedID=inputs.id;
			if(inputs.id.indexOf(replaceID)!=-1 && inputs.id.indexOf(replaceID+"-")==-1){  //check if exact field (and not warted one) exists in input
				var newDerivedID=inputs.id.replace(replaceID, newID); // The new ID, naively accomplished with string replace
				if(inputs.Field && inputs.Field.indexOf(replaceID)!=-1){ // Yuck, we should implement actual parent
					var oldName=st.name;
					inputs.Field=inputs.Field.replace(replaceID, newID); // Adjust the field name, tricky because the field name is "output (id)" and we don't really know the outputs
					inputs.id=inputs.id.replace(replaceID, newID);
					inputs.display=inputs.display.replace(replaceID, newID);
					st.name=st.name.replace(replaceID, newID);
					st.outputMap={};
					for(var i in st.outputs){
						if(st.libraryEntry && st.libraryEntry.useRawValues){
							st.outputMap[i]=i;
						}else{
							st.outputMap[i + " " + st.name]=i;
						}
					}

					if(overlays[oldName]){
						delete overlays[oldName];
						overlays[st.name]=st;
					}
					if(st.panel!="chart") st.panel=panelID;
					delete studies[derivedID]; // Take this study out of the study
					studies[newDerivedID]=st;	// Add it back in, now it will be at the end of the object, preserving the ordering
					CIQ.Studies.rejiggerDerivedStudies(stx, derivedID, newDerivedID, panelID); // Recursively check for underlying of underlying
				}
			}
		}
	};

	/**
	 * Replaces an existing study with new inputs, outputs and parameters. When using this method
	 * a study's position in the stack will remain the same. Derived (child) studies will shift to
	 * use the new study as well
	 * @param {object} stx        The chart object
	 * @param {string} type       The name of the study (out of the studyLibrary)
	 * @param {String} id 		The id of the current study. If set, then the old study will be replaced
	 * @param {object} [inputs]     Inputs for the study instance. Default is those defined in the studyLibrary.
	 * @param {object} [outputs]    Outputs for the study instance. Default is those defined in the studyLibrary.
	 * @param {object} [parameters] additional custom parameters for this study if supported or required by that study
	 * @param {string} [panelName] Optionally specify the panel. If not specified then an attempt will be made to locate a panel based on the input id or otherwise created if required.
	 * @return {object} A study descriptor which can be used to remove or modify the study.
	 */
	CIQ.Studies.replaceStudy=function(stx, id, type, inputs, outputs, parameters, panelName){
		if(!inputs) inputs={};
		inputs.id=id;
		return CIQ.Studies.addStudy(stx, type, inputs, outputs, parameters, panelName);
	};

	/**
	 * Adds a study to the chart. A layout change event is triggered when this occurs.
	 * <P>Example: <iframe width="800" height="500" scrolling="no" seamless="seamless" align="top" style="float:top" src="http://jsfiddle.net/chartiq/5y4a0kry/embedded/result,js,html,css/" allowfullscreen="allowfullscreen" frameborder="1"></iframe>
	 *
	 * Optionally you can assign the edit callback to a function that can handle initialization of a dialog box for editing studies.
	 * If the callback is not assigned a function, the edit study buttons/functionality will not appear.
	 * The 'Study Edit' feature is standard functionality in the advanced package.
	 *
	 * Prior to version 2015-07-01, all edit functionality was handled by `stx.editCallback` and was limited to panel studies.
	 * Starting on version 2015-07-01, edit functionality is handled by `stxx.callbacks.studyPanelEdit` and `stxx.callbacks.studyOverlayEdit`; and it is available on both panel studies and overly studies.
	 * See Examples for exact function parameters and return value requirements.
	 * Please note that these callbacks must be set **before** you call importLayout. Otherwise your imported studies will not have an edit capability.
	 *
	 * @param {object} stx        The chart object
	 * @param {string} type       The name of the study (object key on the {@link CIQ.Studies.studyLibrary})
	 * @param {object} [inputs]     Inputs for the study instance. Default is those defined in the studyLibrary. Note that if you specify this objct it will not be combined with the library defaults. So even if you only want to define or override one single element (`display`, for example); you them must also send all of the additional inputs required to render the study. 
	 * @param {String} [inputs.id] The id of the current study. If set, then the old study will be replaced
	 * @param {String} [inputs.display] The display name of the current study. If not set, a name generated by {@link CIQ.Studies.prettyDisplay} will be used. Note that if the study descriptor defines a `display` name, the study descriptor name will allays override this parameter.
	 * @param {object} [outputs]    Outputs for the study instance. Default is those defined in the studyLibrary. Note that if you specify this objct it will not be combined with the library defaults. So even if you only want to override one single element; you them must also send all of the additional outputs required to render the study.
	 * @param {object} [parameters] Additional custom parameters for this study if supported or required by that study
	 * @param {string} [panelName] Optionally specify the panel. The relationship between studies and their panels is kept in {@link CIQ.Studies.studyPanelMap}. If not specified then an attempt will be made to locate a panel based on the input id or otherwise created if required. 
	 * @return {object} A study descriptor which can be used to remove or modify the study.
	 * @memberOf CIQ.Studies
	 * @example
	 * CIQ.Studies.addStudy(stxx, "vol undr", {}, {"Up Volume":"#8cc176","Down Volume":"#b82c0c"});
	 * @example
	 * // this is an example of  the expected stxx.editCallback function for version prior to version 2015-07-01
	 * stxx.editCallback=function(stx, sd){
	 *	// your code here
	 *	return $$("studyDialog"); // This is a reference to the actual HTML dialog container that can be filled by studyDialog.
	 * };
	 * @example
	 * var params={stx:stx,sd:sd,inputs:inputs,outputs:outputs, parameters:parameters};
	 * stxx.callbacks.studyPanelEdit=function(params){
	 *		// your code here
	 * };
	 * @example
	 * var params={stx:stx,sd:sd,inputs:inputs,outputs:outputs, parameters:parameters};
	 * stxx.callbacks.studyOverlayEdit=function(params){
	 *		// your code here
	 * };
	*/
	CIQ.Studies.addStudy=function(stx, type, inputs, outputs, parameters, panelName){
		var study=CIQ.Studies.studyLibrary[type];
		if(!parameters) parameters={};
		if(study && study.parameters && study.parameters.init) {
			for(var param in study.parameters.init){
				if(typeof(parameters[param])=="undefined" || parameters[param]===null){
					parameters[param]=study.parameters.init[param];
				}
			}
		}
		if(!parameters.chartName) parameters.chartName="chart";
		if(!inputs && study && study.inputs) {
			inputs=CIQ.shallowClone(study.inputs);
			for(var i in inputs){
				if(inputs[i] instanceof Array) inputs[i]=inputs[i][0];
			}
		}
		if(!inputs) inputs={"Period":14};
		if(!outputs && study && study.outputs) outputs=CIQ.shallowClone(study.outputs);
		if(!outputs) outputs={"Result":"auto"};

		if(!study) {
			study={};
			if(panelName=="chart") study.overlay=true;
		}
		if( inputs.Period < 1 ) inputs.Period = 1; // periods can't be less than one candle. This is a general safety check. Each study should have a check or add input validation.

		if(!inputs.id) inputs.id=CIQ.Studies.generateID(stx, type, inputs, parameters.replaceID);
		var sd=null;
		if(study.initializeFN){
			sd=study.initializeFN(stx, type, inputs, outputs, parameters, panelName);
		}else{
			sd=CIQ.Studies.initializeFN(stx, type, inputs, outputs, parameters, panelName);
		}
		if(!sd){
			console.log("CIQ.Studies.addStudy: initializeFN() returned null for " + type);
			return;
		}
		sd.chart=stx.charts[parameters.chartName];
		if(!stx.layout.studies) stx.layout.studies={};
		// removed following line because it causes modified studies to be re-added out of sequence causing issues if there are dependencies
		// so instead of deleting and adding to the end of the array, we just replace the data with the new sd
		//delete stx.layout.studies[sd.inputs.id]; // for good measure, in case of orphaned studies
		stx.layout.studies[sd.inputs.id]=sd;
		sd.study=study;
		sd.type=type;
		var panel=stx.panels[sd.panel];
		CIQ.Studies.prepareStudy(stx, study, sd, parameters);
		stx.changeOccurred("layout");
		var hasEditCallback=false;
		var isPanelStudy=!(sd.overlay || sd.underlay);

		if (isPanelStudy && study.horizontalCrosshairFieldFN) {
			panel.horizontalCrosshairField = study.horizontalCrosshairFieldFN(stx, sd);
		}

		if(stx.editCallback) hasEditCallback=true;
		if(stx.callbacks.studyOverlayEdit && !isPanelStudy) hasEditCallback=true;
		if(stx.callbacks.studyPanelEdit && isPanelStudy) hasEditCallback=true;


		if(hasEditCallback){
			parameters.editMode=true;
			var hasInput=false;
			for(var input in sd.inputs){
				if(input=="id") continue;
				if(input=="display") continue;
				hasInput=true;
			}
			if(!hasInput){
				for(var output in sd.outputs){
					hasInput=true;
				}
			}
			if(hasInput){
				var editFunction;
				if(sd.libraryEntry && typeof sd.libraryEntry.edit!="undefined"){
					if(sd.libraryEntry.edit){
						editFunction=(function(stx, sd, inputs, outputs){return function(){
							sd.library.edit(sd, {inputs:inputs, outputs:outputs, parameters:parameters});
						};})(stx, sd, inputs, outputs, parameters);
						stx.setPanelEdit(panel, editFunction);
						sd.editFunction=editFunction;
					}
				}else if(!isPanelStudy && stx.callbacks.studyOverlayEdit){
					editFunction=(function(stx, sd, inputs, outputs, parameters){return function(forceEdit){
						stx.dispatch("studyOverlayEdit", {stx:stx,sd:sd,inputs:inputs,outputs:outputs, parameters:parameters, forceEdit: forceEdit});
					};})(stx, sd, inputs, outputs, parameters);
					sd.editFunction=editFunction;
				}else{
					if(stx.editCallback){ // deprecated legacy support
						editFunction=(function(stx, sd, inputs, outputs){return function(){
							var dialogDiv=stx.editCallback(stx, sd);
							CIQ.Studies.studyDialog(stx, type, dialogDiv, {inputs:inputs, outputs:outputs, parameters:parameters});
						};})(stx, sd, inputs, outputs, parameters);
						if(panel.name!="chart"){
							stx.setPanelEdit(panel, editFunction);
						}
					}else{
						editFunction=(function(stx, sd, inputs, outputs, parameters){return function(){
							stx.dispatch("studyPanelEdit", {stx:stx,sd:sd,inputs:inputs,outputs:outputs, parameters:parameters});
						};})(stx, sd, inputs, outputs, parameters);
						if(panel.name!="chart"){
							stx.setPanelEdit(panel, editFunction);
							sd.editFunction=editFunction;
						}
					}
				}
			}
		}
		return sd;
	};

	/** @deprecated **/
	CIQ.Studies.quickAddStudy=CIQ.Studies.addStudy;

	/**
	 * Removes a study from the chart (and panel if applicable)
	 * @param  {object} stx A chart object
	 * @param  {object} sd  A study descriptor returned from {@link CIQ.Studies.quickAddStudy} or {@link CIQ.Studies.go}
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.removeStudy=function(stx, sd){
		if(sd.overlay || sd.underlay ){
			stx.removeOverlay(sd.name);
			stx.draw();
		}else{
			var panel=stx.panels[sd.panel];
			if(panel)
				stx.panelClose(panel);
		}
	};

	/**
	 * <span class="animation">Animation Loop</span>
	 * This method displays all of the studies for a chart. It is called from within the chart draw() loop.
	 * @param  {CIQ.ChartEngine} stx The charting object
	 * @param {CIQ.ChartEngine.Chart} chart Which chart to display studies for
	 * @param {Boolean} [underlays=false] If set to true then underlays only will be displayed, otherwise underlays will be skipped
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.displayStudies=function(stx, chart, underlays){
		var s=stx.layout.studies;
		if(!s) return;
		if(underlays) CIQ.Studies.actualOutputs=[];

		for(var n in s){
			var sd=s[n];
			var libraryEntry=sd.libraryEntry;
			if(!libraryEntry) continue;
			if(underlays){
				if(!sd.underlay && !libraryEntry.underlay) continue;
			}else{
				if(sd.underlay || libraryEntry.underlay) continue;
			}
			var panel=stx.panels[sd.panel];
			if(panel){
				if(panel.chart!=chart) continue;
				if (sd.libraryEntry.range!="bypass") panel.min=null;	// force determineminmax to calculate values, except if we are bypassing the automatic range setting
				//TODO: get rid of orphaned overlay study?
				if(panel.hidden) continue;
				if(sd.permanent){
					if(panel.closeX){
						panel.closeX.style.display="none";
					}else{
						panel.close.style.display="none";
					}
				}
			}else{
				//orphaned panel study, kill it
				delete s[n];
				continue;
			}

			var quotes=sd.chart.dataSegment;	// Find the appropriate data to drive this study

			for(var i in sd.outputMap){
				CIQ.Studies.actualOutputs.push(i);
			}

			if(!libraryEntry || typeof(libraryEntry.seriesFN)=="undefined"){	// null means don't display, undefined means display by default as a series
				CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);
			}else{
				if(libraryEntry.seriesFN){
					if(panel) libraryEntry.seriesFN(stx, sd, quotes);
				}
			}
		}
	};

	/**
	 * Convenience function for determining the min and max for a given data point
	 * @param {object} stx The chart
	 * @param {string} name The field to evaluate
	 * @param {array} quotes The array of quotes to evaluate (typically dataSet, scrubbed or dataSegment)
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.calculateMinMaxForDataPoint=function(stx, name, quotes){
		var min=Number.MAX_VALUE;
		var max=Number.MAX_VALUE*-1;
		for(var i=0;i<quotes.length;i++){
			var m=quotes[i][name];
			if(m===null || typeof m=="undefined") continue;
			if(isNaN(m)) continue;
			min=Math.min(m,min);
			max=Math.max(m,max);
		}
		return {"min":min,"max":max};
	};

	/**
	 * Method to determine the minimum and maximum points in a study panel. The studyLibrary is checked for the type of range. If the range
	 * is dynamic then the output values for the study are checked for minimum and maximum values. If a histogram is being printed then
	 * the values for the histogram (represented by sd.name+"_hist") are also checked. This method does not draw the yAxis but it does compute
	 * the high, low and shadow that the yAxis utilizes when drawn.
	 * @param  {object} stx    The chart object
	 * @param  {object} sd     The study descriptor
	 * @param  {array} quotes The set of quotes to evaluate
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.determineMinMax=function(stx, sd, quotes){
		var panel=stx.panels[sd.panel];
		if(!panel) return;
		if(!panel.min && panel.min!==0){
			if(!sd.min && sd.min!==0){
				var libraryEntry=sd.libraryEntry;
				if(libraryEntry && libraryEntry.range=="0 to 100"){
					panel.min=0; panel.max=100;
				}else if(libraryEntry && libraryEntry.range=="-1 to 1"){
					panel.min=-1; panel.max=1;
				}else if(!libraryEntry || libraryEntry.range!="bypass"){
					panel.min=Number.MAX_VALUE;
					panel.max=Number.MAX_VALUE*-1;
					for(var i=0;i<quotes.length;i++){
						var quote=quotes[i];
						if(!quote) continue;

						var m;
						for(var j in sd.outputMap){
							m=quote[j];
							if(m===null || typeof m=="undefined") continue;
							if(isNaN(m)) continue;
							panel.min=Math.min(m,panel.min);
							panel.max=Math.max(m,panel.max);
						}

						for(var h=0;h<=5;h++){
							m=quote[sd.name+"_hist"+(h?h:"")];
							if(m===null || typeof m=="undefined") continue;
							if(isNaN(m)) continue;
							panel.min=Math.min(m,panel.min);
							panel.max=Math.max(m,panel.max);
						}
					}
				}
				if(libraryEntry && libraryEntry.range=="0 to max"){
					panel.min=Math.min(0,panel.min);
				}
			}else{
				panel.min=sd.min; panel.max=sd.max;
			}
		}
		// use the panel high/low values if they were set previously, like by a renderer
		if((panel.highValue || panel.highValue===0) && panel.highValue>panel.max) panel.max=panel.highValue;
		if((panel.lowValue || panel.lowValue===0) && panel.lowValue<panel.min) panel.min=panel.lowValue;
		// If a developer hard codes the max or min for yAxis then that supercedes everything
		var yAxis=panel.yAxis;
		if(yAxis.max || yAxis.max===0) panel.max=yAxis.max;
		if(yAxis.min || yAxis.min===0) panel.min=yAxis.min;
		if(panel.max==panel.min){ // All the same values, force a straight line
			panel.max=panel.max*2;
			panel.min=0;
		}
		panel.shadow=panel.max-panel.min;
		if(panel.max>0 && panel.min<0) panel.shadow=panel.max + panel.min*-1;
		yAxis.high=panel.max;
		yAxis.low=panel.min;
		yAxis.shadow=yAxis.high-yAxis.low;
	};

	/**
	 * Creates the yAxis for a study panel. Utilizes CIQ.ChartEngine.createYAxis internally. This method is not re-entrant. panel.axisDrawn will be set
	 * to true in order to prevent the yAxis from being drawn multiple times if there are multiple studies on a panel. The first study on the panel
	 * will therefore determine the minimum and maximum bounds of the panel. If the library entry defines a yAxisFN function then it will be used
	 * to render the yaxis instead of CIQ.ChartEngine.createYAxis. If zones are enabled then CIQ.ChartEngine.createYAxis again will not be the renderer.
	 * @param  {object} stx    The chart object
	 * @param  {object} sd     The study descriptor
	 * @param  {array} quotes The set of quotes (representing dataSegment)
	 * @param  {object} panel  A reference to the panel
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.createYAxis=function(stx, sd, quotes, panel){
		if(!panel.axisDrawn){
			panel.height=panel.bottom-panel.top;
			CIQ.Studies.determineMinMax(stx, sd, quotes);
			// panel.yAxis.displayGridLines=false;	// Moved to initializeFN
			var parameters;
			var libraryEntry=sd.libraryEntry;
			if(libraryEntry && (libraryEntry.yaxis || libraryEntry.yAxisFN)){
				parameters={"dontDraw":true};
				stx.createYAxis(panel, parameters);
				stx.drawYAxis(panel, parameters);
				if(libraryEntry.yaxis) libraryEntry.yaxis(stx, sd); // backward compatibility
				if(libraryEntry.yAxisFN) libraryEntry.yAxisFN(stx, sd); // Use yAxisFN for forward compatibility
			}else{
				// If zones are enabled then we don't want to draw the yAxis
				parameters={
						"noDraw": (sd.parameters && sd.parameters.studyOverZonesEnabled)
				};
				if(libraryEntry){
					if(libraryEntry.range=="0 to 100") parameters.range=[0,100];
					else if(libraryEntry.range=="-1 to 1") parameters.range=[-1,1];
					if(libraryEntry.yAxis && libraryEntry.yAxis.ground) parameters.ground=true;
				}
				stx.createYAxis(panel, parameters);
				stx.drawYAxis(panel, parameters);
			}
			if(libraryEntry && libraryEntry.centerline){
				CIQ.Studies.drawHorizontal(stx, sd, quotes, libraryEntry.centerline);
			}else if(panel.min<0 && panel.max>0){
				CIQ.Studies.drawHorizontal(stx, sd, quotes, 0);
			}
			panel.axisDrawn=true;
		}
	};

	/**
	 * Displays a single or group of series as lines in the study panel.
	 * One series per output field declared in the study library will be displayed.
	 * It expects the 'quotes' array to have data fields for each series with keys in the outputMap format: 'output name from study library'+ " " + sd.name.
	 * Y-axis will be rendered if studyOverZones are not set and panel is not “hidden”.
	 * studyOverZones will be displayed and Peaks & Valleys will be filled if corresponding thresholds are set in the study library as follows:
	 *
	 * <code>init:{studyOverZonesEnabled:true, studyOverBoughtValue:70, studyOverBoughtColor:"auto", studyOverSoldValue:30, studyOverSoldColor:"auto"}</code>
	 *
	 * For most custom studies this function will do the work for you.
	 * @param  {object} stx    The chart object
	 * @param  {object} sd     The study descriptor
	 * @param  {array} quotes The set of quotes (dataSegment)
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.displaySeriesAsLine=function(stx, sd, quotes){
		if(!quotes.length) return;
		var panel=stx.panels[sd.panel];
		if(!panel) return;
		if(panel.hidden) return;
		if(panel.name!=sd.chart.name && !sd.underlay){
			CIQ.Studies.createYAxis(stx, sd, quotes, panel);
		}
		CIQ.Studies.drawZones(stx, sd, quotes);

		for(var i in sd.outputMap){
			CIQ.Studies.displayIndividualSeriesAsLine(stx, sd, panel, i, quotes);
		}
	};

	/**
	 * Displays a single or group of series as histogram in the study panel.
	 * It expects the 'quotes' array to have data fields for each series with keys in the outputMap format: 'output name from study library'+ " " + sd.name.
	 *
	 * It takes into account the following study input fields (see {@link CIQ.ChartEngine#drawHistogram} for details ) :
	 * - sd.inputs.HistogramType ("overlaid", "clustered", "stacked") - Default "overlaid"
	 * - sd.inputs.HeightPercentage - Default ".25"
	 * - sd.inputs.WidthFactor - Default ".5"
	 * @param  {object} stx    The chart object
	 * @param  {object} sd     The study descriptor
	 * @param  {array} quotes The set of quotes (dataSegment)
	 * @memberOf CIQ.Studies
	 * @example
	 *
		// this adds a study panel that will display the High and Low values from the masterData as a stacked histogram study
		CIQ.Studies.studyLibrary["Plot High Low"]={
		 	"seriesFN": CIQ.Studies.displaySeriesAsHistogram,
		 	inputs:{"HistogramType":"stacked"},
		    outputs:{"High":"blue","Low":"red"}
		};
		CIQ.Studies.quickAddStudy(stxx, "Plot High Low");
	 */
	CIQ.Studies.displaySeriesAsHistogram=function(stx, sd, quotes){
		if(!quotes.length) return;
		var panel=stx.panels[sd.panel];
		if(!panel) return;
		if(panel.hidden) return;

		var seriesParam=[];
		for(var i in sd.outputMap){
			var output=sd.outputs[sd.outputMap[i]];
			var series={
				field: i,
				fill_color_up: output,
				border_color_up: output,
				fill_color_down: output,
				border_color_down: output,
			};
			seriesParam.push(series);
		}

		var inputs=sd.inputs, parameters=sd.study.parameters;
		var params={
			name: sd.name,
			type: inputs.HistogramType?inputs.HistogramType:"overlaid",
			panel: sd.panel,
			heightPercentage: inputs.HeightPercentage?inputs.HeightPercentage:0.25,
			widthFactor: inputs.WidthFactor?inputs.WidthFactor:0.5,
		};

		if(!parameters || (parameters && !parameters.excludeYAxis)) {
			CIQ.Studies.createYAxis(stx, sd, sd.chart.dataSegment, stx.panels[sd.panel]);
		}
		stx.drawHistogram(params,seriesParam);
	};

	/**
	 * Displays multiple data-points as series on a panel. This is the default display function for an indicator and will
	 * work for 90% of custom indicators.
	 * It also inserts the study results into the studyPanelMap to be selected as the basis for another study.
	 * @param  {object} stx    The chart object
	 * @param  {object} sd     The study descriptor
	 * @param  {object} panel  A reference to the study panel
	 * @param  {string} name   The name of this study instance (should match field from 'quotes' needed to render this line)
	 * @param  {array} quotes The array of quotes (dataSegment)
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.displayIndividualSeriesAsLine=function(stx, sd, panel, name, quotes){
		if(!panel.height) panel.height=panel.bottom-panel.top;
		CIQ.Studies.studyPanelMap[name]=sd; //TODO, this will need to take into consideration ...?
	    var context=stx.chart.context;
		context.lineWidth=1;
		if(sd.highlight) context.lineWidth=3;
		var color=sd.outputs[sd.outputMap[name]];
		if(color=="auto") color=stx.defaultColor;	// This is calculated and set by the kernel before draw operation.
		context.strokeStyle=color;
		var labelDecimalPlaces=0;
		var libraryEntry=sd.libraryEntry, parameters=libraryEntry?libraryEntry.parameters:null, yAxis=panel.yAxis;
		if(yAxis.shadow<1000) labelDecimalPlaces=2;
		if(yAxis.shadow<5) labelDecimalPlaces=4;
		if(!libraryEntry || sd.overlay || sd.underlay) labelDecimalPlaces=null; // will end up using the same as the chart itself
		if(yAxis.decimalPlaces || yAxis.decimalPlaces===0) labelDecimalPlaces=yAxis.decimalPlaces;

		var noSlopes=parameters && parameters.noSlopes;
		var noLabels=parameters && parameters.noLabels;
	    stx.plotLineChart(panel, quotes, name, {skipTransform:stx.panels[sd.panel].name!=sd.chart.name, label: stx.preferences.labels && !noLabels, labelDecimalPlaces: labelDecimalPlaces, noSlopes: noSlopes});

		if(libraryEntry && libraryEntry.appendDisplaySeriesAsLine) libraryEntry.appendDisplaySeriesAsLine(stx, sd, quotes, name, panel);
		context.lineWidth=1;
	};

	/**
	 * Draws a horizontal line on the study.
	 * @param  {object} stx    The chart object
	 * @param  {object} sd     The study descriptor
	 * @param  {array} quotes The array of quotes (unused)
	 * @param  {number} price  The price (value) to draw the horizontal line
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.drawHorizontal=function(stx, sd, quotes, price){
		var panel = stx.panels[sd.panel];
		if(!panel) return;

		var y=stx.pixelFromPrice(price, panel);
		if(y>panel.top && y<panel.yAxis.bottom)
			stx.plotLine(panel.left, panel.right, y, y, "#DDDDDD", "segment", stx.chart.context, false, {});
	};

	/**
	 * A sample of a custom display function. This function creates the yAxis, draws **a single** histogram and then plots the series.
	 * Note that to differentiate between a regular series and the histogram series there is a convention to use sd.name+"_hist" for histogram values on a study</b> See {@link CIQ.Studies.createHistogram} for details</p>
	 * @param  {object} stx      The chart object
	 * @param  {object} sd       The study descriptor
	 * @param  {array} quotes   The quotes (dataSegment)
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.displayHistogramWithSeries=function(stx, sd, quotes) {
		var panel=stx.panels[sd.panel];
		CIQ.Studies.createYAxis(stx, sd, quotes, panel);
		CIQ.Studies.createHistogram(stx, sd, quotes, false, 0.4);
		CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);
	};

	CIQ.Studies.drawZones=function(stx,sd,quotes){
		if(!sd.parameters || !sd.parameters.studyOverZonesEnabled) return;

		var low=parseFloat(sd.parameters.studyOverSoldValue);
		var high=parseFloat(sd.parameters.studyOverBoughtValue);
		var lowColor=sd.parameters.studyOverSoldColor;
		var highColor=sd.parameters.studyOverBoughtColor;
		var output=sd.zoneOutput;
		if(!output) output="Result";
		var zoneColor=sd.outputs[output];
		if(!zoneColor || zoneColor=="auto" || CIQ.isTransparent(zoneColor)) zoneColor=stx.defaultColor;
		if(!lowColor) lowColor=zoneColor;
		if(!lowColor || lowColor=="auto" || CIQ.isTransparent(lowColor)) lowColor=stx.defaultColor;
		if(!highColor) highColor=zoneColor;
		if(!highColor || highColor=="auto" || CIQ.isTransparent(highColor)) highColor=stx.defaultColor;
		var panel=stx.panels[sd.panel];
		var drawBorders=panel.yAxis.displayBorder;
		if(stx.axisBorders===false) drawBorders=false;
		if(stx.axisBorders===true) drawBorders=true;
		var borderEdge=Math.round(panel.right)+0.5;
		var w=drawBorders?borderEdge-0.5:panel.right;
		var tickWidth=drawBorders?3:0; // pixel width of tick off edge of border

		var ctx=stx.chart.context;
		var color=ctx.fillStyle;

		stx.chart.context.globalAlpha=0.2;

		stx.startClip(panel.name, true);
		var yAxis=panel.yAxis;
		var yAxisPlotter=yAxis.yAxisPlotter=new CIQ.Plotter();
		yAxisPlotter.newSeries("border", "stroke", stx.canvasStyle("stx_grid_border"));

		ctx.beginPath();
		var ph=Math.round(stx.pixelFromPrice(high,panel))+0.5;
		ctx.strokeStyle=highColor;
		ctx.moveTo(panel.left,ph);
		ctx.lineTo(w,ph);
		ctx.stroke();
		ctx.closePath();

		stx.chart.context.beginPath();
		var pl=Math.round(stx.pixelFromPrice(low,panel))+0.5;
		ctx.strokeStyle=lowColor;
		ctx.moveTo(panel.left,pl);
		ctx.lineTo(w,pl);
		ctx.stroke();
		ctx.closePath();

		if(drawBorders){
			yAxisPlotter.moveTo("border", borderEdge-0.5, ph);
			yAxisPlotter.lineTo("border", borderEdge+tickWidth, ph);
			yAxisPlotter.moveTo("border", borderEdge-0.5, pl);
			yAxisPlotter.lineTo("border", borderEdge+tickWidth, pl);
		}

		ctx.fillStyle=color;

		CIQ.preparePeakValleyFill(stx,quotes,{panelName:sd.panel, band:output + " " + sd.name, threshold:high, direction:1, color:highColor});
		CIQ.preparePeakValleyFill(stx,quotes,{panelName:sd.panel, band:output + " " + sd.name, threshold:low, direction:-1, color:lowColor});

		ctx.globalAlpha=1;

		if(!sd.libraryEntry.yaxis){
			if(drawBorders){
				var b=Math.round(yAxis.bottom)+0.5;
				yAxisPlotter.moveTo("border", borderEdge, yAxis.top);
				yAxisPlotter.lineTo("border", borderEdge, b);
				yAxisPlotter.draw(stx.chart.context, "border");
			}

			// Draw the y-axis with high/low
			stx.canvasFont("stx_yaxis");
			stx.canvasColor("stx_yaxis");
			var ypx=panel.height/panel.shadow;
			var textX=yAxis.left + tickWidth + 3;
			ctx.fillText(high, textX, ph);
			ctx.fillText(low, textX, pl);
			panel.axisDrawn=true;
		}
		stx.endClip();
		ctx.globalAlpha=1;
	};


	/**
	 * Draws a histogram on the study.
	 * Initial bar color is defined in stx-chart.css under '.stx_histogram'. If using the default UI, refer to stx-standard.css under '.Light .stx_histogram' and '.Dark .stx_histogram' style sections.
	 * If sd.outputs["Decreasing Bar"] and sd.outputs["Increasing Bar"] are present, their corresponding colors will be used instead.
	 * <p><b>Note the convention to use sd.name+"_hist" for histogram values on a study</b></p>
	 *
	 * @param  {object} stx      The chart object
	 * @param  {object} sd       The study descriptor
	 * @param  {array} quotes   The quotes (dataSegment)
	 * @param  {boolean} centered If true then the histogram will be physically centered on the yAxis, otherwise it will be centered at the zero value on the yAxis
	 * @param  {number} [opacity=1] Optionally set the opacity
	 * @memberOf CIQ.Studies
	 */

	CIQ.Studies.createHistogram=function(stx, sd, quotes, centered, opacity){
		var panel = stx.panels[sd.panel];
		stx.startClip(panel.name);

		var myWidth=stx.layout.candleWidth-2;
		if(myWidth<2) myWidth=1;

		var y=stx.pixelFromPrice(0, panel);
		if(panel.min>0) y=stx.pixelFromPrice(panel.min, panel); // Don't draw below the bottom of the chart. If zero isn't on the chart then make it behave like a bar graph.
		if(centered){
			y=Math.floor(panel.top + panel.height/2);
		}

		var context=stx.chart.context;
		var field=sd.name+"_hist";
		if(!sd.outputs["Decreasing Bar"] && !sd.outputs["Negative Bar"])
			stx.canvasColor("stx_histogram");
		else
			context.globalAlpha=opacity?opacity:1;
		var y0,y1;
		var outputs=sd.outputs;
		for(var i=0;i<quotes.length;i++){
			var quote=quotes[i];
			if(!quote) continue;
			if(quote.candleWidth) myWidth=Math.floor(Math.max(1,quote.candleWidth-2));
			var x0=Math.floor(stx.pixelFromBar(i, panel.chart)-myWidth/2);
			var x1=Math.floor(myWidth);
			y0=y1;
			y1=stx.pixelFromPrice(quote[field], panel)-y;
			if(outputs["Decreasing Bar"] && y1>y0) context.fillStyle=outputs["Decreasing Bar"];
			else if(outputs["Increasing Bar"] && y1<y0) context.fillStyle=outputs["Increasing Bar"];
			else if(outputs["Positive Bar"] && y1<0) context.fillStyle=outputs["Positive Bar"];
			else if(outputs["Negative Bar"] && y1>0) context.fillStyle=outputs["Negative Bar"];
			context.fillRect(x0, y, x1, Math.floor(y1));
		}

		context.globalAlpha=1;
		stx.endClip();
	};

	/**
	 * Convenience function for creating a volume style chart that supports multiple colors
	 * of volume bars. If borderMap (border colors) is passed in then the chart will display in a format where bars are flush against
	 * one another so that there is no white space between bars. If however a borderMap is not specified then white space will be left
	 * between the bars.
	 * @param  {CIQ.ChartEngine} stx      The chart object
	 * @param  {object} sd       The study descriptor
	 * @param  {object} colorMap Map of colors to arrays. Each array should contain entries for each dataSegment bar mapped to that color.
	 * It should contain null values for any bar that shouldn't be drawn
	 * @param {object} borderMap Map of border colors for each color. If null then no borders will be drawn.
	 * @example
	 * var colorMap={};
	 * colorMap["#FF0000"]=[56,123,null,null,45];
	 * colorMap["#00FF00"]=[null,null,12,13,null];
	 *
	 * var borderMap={
	 *    "#FF0000": "#FFFFFF",
	 *    "#00FF00": "#FFFFDD"
	 * };
	 * CIQ.Studies.volumeChart(stx, sd, colorMap, borderMap);
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.volumeChart=function(stx, sd, colorMap, borderMap){
		// Determine min max
		var maximum=Number.MAX_VALUE*-1;
		var color,value;
		for(color in colorMap){
			for(var c=0;c<colorMap[color].length;c++){
				value=colorMap[color][c];
				if(!value) continue;
				if(value>maximum) maximum=value;
			}
		}

		// determine calculation ratios
		var panel = stx.panels[sd.panel];
		var b=Math.floor(panel.yAxis.bottom)+0.5;
		var t=Math.floor(panel.yAxis.top)+0.5;
		var h=(b-t);
		var candleWidth=stx.layout.candleWidth;
		var multiplier=panel.height/maximum;
		var borderColor=null;
		if(!sd.libraryEntry.parameters.displayBorder) borderMap = null;
		var offset=0;
		if(!borderMap) offset=(candleWidth-stx.chart.tmpWidth)/2;
		var context=stx.chart.context;
		context.lineWidth=1;
		stx.startClip(sd.panel);
		for(color in colorMap){
			if(borderMap) borderColor=borderMap[color];
			context.fillStyle=color;
			if(borderColor) context.strokeStyle=borderColor;
			context.beginPath();
			var prevTop=b+0.5;
			var farLeft=Math.floor(stx.pixelFromBar(0, panel.chart));
			var prevRight;
			for(var i=0;i<colorMap[color].length;i++){
				if(stx.chart.dataSegment[i] && stx.chart.dataSegment[i].candleWidth) {
					candleWidth=stx.chart.dataSegment[i].candleWidth;
					if(!borderMap) offset=candleWidth/4;
				}
				else{
					candleWidth=stx.layout.candleWidth;
					if(!borderMap) offset=(candleWidth-stx.chart.tmpWidth)/2;
				}
				if(i===0) {
					farLeft-=candleWidth/2;
					prevRight=farLeft;
				}
				value=colorMap[color][i];
				if(!value){
					prevTop=b;
					prevRight+=candleWidth;
					//if(borderMap) prevRight-=0.5;
					continue;
				}
				var y=value*(h/maximum);
				var top=Math.min(Math.floor((b - h) + (h - y))+0.5,b);
				var x0,x1;
				x0=Math.floor(prevRight+offset);
				x1=Math.floor(prevRight+candleWidth-offset);
				x0=Math.max(x0, farLeft);

				context.moveTo(x0, b);
				context.lineTo(x1, b);
				context.lineTo(x1, top);
				context.lineTo(x0, top);
				if(borderMap){
					if(prevTop>top || i===0) context.lineTo(x0, prevTop); // draw down to the top of the previous bar, so that we don't overlap strokes
				}else{
					context.lineTo(x0, b);
				}
				prevTop=top;
				prevRight+=candleWidth;
				//if(borderMap) prevRight-=0.5;
			}
			context.fill();
			context.strokeStyle = borderColor;
			if(borderMap && stx.layout.candleWidth>=2) context.stroke();
			context.closePath();
		}
		stx.endClip();
	};

	/**
	 * Used to reduce certain common fields to abbreviated form for display in study panel labels
	 * @type {Object}
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.prettify={
			"Close":"C",
			"Open":"O",
			"High":"H",
			"Low":"L",
			",simple":"",
			"simple":"",
			"exponential":"ema",
			"time series":"ts",
			"triangular":"tri",
			"variable":"var",
			"VIDYA":"vidya",
			"weighted":"wa",
			"welles wilder":"ww"
	};

	CIQ.Studies.prettyRE=/^.*\((.*?)\).*$/;

	/**
	 * Convert a study ID into a displayable format
	 * @param  {string} id The ID
	 * @return {string}    A pretty (shortened) ID
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.prettyDisplay=function(id){
		var match = CIQ.Studies.prettyRE.exec(id);
		if(!match) return id;
		var guts=match[1];
		if(guts){
			for(var i in CIQ.Studies.prettify){
				guts=guts.replace(i, CIQ.Studies.prettify[i]);
			}
			id=id.replace(match[1], guts);
		}
		return id;
	};

	/**
	 * The default initialize function for a study. It creates the study descriptor. It creates the panel if one is required.
	 *
	 * @param  {object} stx        The chart object
	 * @param  {string} type       The type of study (from studyLibrary)
	 * @param  {object} inputs     The inputs for the study instance
	 * @param  {object} outputs    The outputs for the study instance
	 * @param  {object} [parameters] Optional parameters if required or supported by this study
	 * @param {string} [panelName] Optional panel. If not provided then the panel will be determined dynamically.
	 * @return {object}            The newly initialized study descriptor
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.initializeFN=function(stx, type, inputs, outputs, parameters, panelName){
		function determinePanelForOverlay(inputs, parameters, panels){
			var panel=null;
			if(inputs.Field){
				var st=CIQ.Studies.studyPanelMap[inputs.Field];
				if(st) panel=st.panel;
				if(inputs.Field=="Volume") {
					if(panels.vchart) panel="vchart";
					else panel="volume";
				}
			}
			if(!panel) panel=parameters.chartName;	// If a panel isn't specified then this is an overlay on the chart itself
			return panel;
		}
		if(!inputs) inputs={
				id: type
		};
		if(!parameters) parameters={};
		if(!inputs.display) inputs.display=CIQ.Studies.prettyDisplay(inputs.id);
		var sd=new CIQ.Studies.StudyDescriptor(inputs.id, type, inputs.id, inputs, outputs, parameters);
		if(inputs.Period) sd.days=parseInt(sd.inputs.Period); // you can't have fractional day periods so convert to int
		var study=CIQ.Studies.studyLibrary[type];
		if(study && study.display) inputs.display=study.display; // override what is displayed in the label
		if(!panelName) panelName=inputs.id;
		var isOverlay=!study || study.overlay || inputs.Overlay;
		var isUnderlay=(study && study.underlay) || inputs.Underlay;
		if(isUnderlay) sd.underlay=true;
		if(isOverlay) sd.overlay=true;

		if(parameters.replaceID && (stx.panelExists(parameters.replaceID) || isOverlay || isUnderlay)){
			var oldStudy=stx.layout.studies[parameters.replaceID];
			if(isOverlay || isUnderlay){
				//sd.panel=oldStudy.panel;
				sd.panel=determinePanelForOverlay(inputs, parameters, stx.panels);
				if ( parameters.replaceID != sd.inputs.id) {	// delete the old study if using a different id (not modifying the same study )
					delete stx.layout.studies[parameters.replaceID];
					delete stx.overlays[parameters.replaceID];
					CIQ.deleteRHS(CIQ.Studies.studyPanelMap, oldStudy);
				}
			}else{
				sd.panel=panelName;
				var newPanels={};
				for(var p in stx.panels){
					if(p==parameters.replaceID){
						// swap the name/id of the old panel
						var tmp=stx.panels[p];
						tmp.name=panelName;
						tmp.display=inputs.display;
						newPanels[panelName]=tmp;
						if(parameters.replaceID!=panelName) {
							//delete stx.panels[parameters.replaceID];
							CIQ.deleteRHS(CIQ.Studies.studyPanelMap, oldStudy);
						}
						if(stx.moveMarkers) stx.moveMarkers(parameters.replaceID,panelName);
					}else{
						newPanels[p]=stx.panels[p];
					}
				}
				stx.panels=newPanels;
				// we want to preserve the order so we keep it unless the ID changed. Otherwise it will attempt to draw the depending study before the base study
				if ( parameters.replaceID != sd.inputs.id) delete stx.layout.studies[parameters.replaceID]; // delete the old study if using a different id (not modifying the same)
			}
		}else if(stx.panelExists(panelName)){
			sd.panel=panelName;
		}else if(!isOverlay && !isUnderlay){
			var panelHeight=study.panelHeight?study.panelHeight:null;
			stx.createPanel(inputs.display, inputs.id, panelHeight, parameters.chartName);
			if(!study.yAxis){
				stx.panels[inputs.id].yAxis.displayGridLines=false;
			}
		}else{
			sd.panel=determinePanelForOverlay(inputs, parameters, stx.panels);
		}
		var panel=stx.panels[sd.panel];
		if(panel && panel.chart.name!=panel.name){
			var syAxis=study?study.yAxis:null;
			var sparameters=study?study.parameters:null;
			if(syAxis){
				CIQ.extend(panel.yAxis, syAxis);
				if(syAxis.ground) panel.yAxis.initialMarginBottom=0;
				if(syAxis.ground ||
						syAxis.initialMarginTop || syAxis.initialMarginTop===0 ||
						syAxis.initialMarginBottom || syAxis.initialMarginBottom===0){
					stx.calculateYAxisMargins(panel.yAxis);
				}
			}else if(sparameters && (sparameters.zoom || sparameters.zoom===0)){ // LEGACY, instead add a yAxis to the study
				panel.yAxis.zoom=sparameters.zoom; // Optionally set the default zoom in the "parameters" in the study library
			}else{
				panel.yAxis.zoom=10;	// Default to slight zoom when adding study panels so that studies are not up on the edge
			}
		}

		return sd;
	};

	/**
	 * Plots over/under zones for indicators that support them, and when the user selects them. This method will draw its own
	 * yAxis which will not have a scale, but merely the over under points.
	 * @private
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.overZones=function(stx, sd, quotes){
		if(!quotes.length) return;
		var panel=stx.panels[sd.panel];
		if(!panel) return;
		if(panel.hidden) return;
		CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);
		var parameters=sd.parameters;
		if(parameters && parameters.studyOverZonesEnabled){
			var ctx=stx.chart.context;
			var overBought=parseFloat(parameters.studyOverBoughtValue), overSold=parseFloat(parameters.studyOverSoldValue);
			var ypx=panel.height/panel.shadow;
			var overBoughtY=panel.bottom-ypx*overBought;
			var overSoldY=panel.bottom-ypx*overSold;
			var params={
				lineWidth: 1
			};
			ctx.globalAlpha=0.2;
			stx.plotLine(panel.left,panel.right-5, overBoughtY, overBoughtY, parameters.studyOverBoughtColor, "segment", ctx, false, params);
			ctx.globalAlpha=0.2;
			stx.plotLine(panel.left,panel.right-5, overSoldY, overSoldY, parameters.studyOverSoldColor, "segment", ctx, false, params);

			if(!sd.libraryEntry.yaxis){
				// Draw the y-axis with overbought/oversold
				var fontHeight=stx.getCanvasFontSize("stx_yaxis");
				stx.canvasFont("stx_yaxis");
				stx.canvasColor("stx_yaxis");
				ctx.fillText(overBought, panel.yAxis.left, overBoughtY + (fontHeight/2));
				ctx.fillText(overSold, panel.yAxis.left, overSoldY + (fontHeight/2));
				panel.axisDrawn=true;
			}
		}
	};

	/**
	 * A sample display function for an overlay. An overlay displays in the chart area.
	 *
	 * Also note the use of clipping to ensure that the overlay doesn't print outside of the panel
	 *
	 * Finally note that when color=="auto" you can use stx.defaultColor which will automatically adjust based on the background color. This
	 * is the default for studies that use the color picker for user selection of output colors.
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.displayPSAR2=function(stx, sd, quotes){
		var panel=stx.panels[sd.panel];
		var isChart=(panel.name==panel.chart.name);
		stx.startClip(panel.name);
		var ctx=stx.chart.context;
		var squareWave=(sd.inputs["Plot Type"]=="squarewave");
		for(var output in sd.outputs){
			var field=output + " " + sd.name;
			ctx.beginPath();
			var candleWidth=stx.layout.candleWidth;
			var pointWidth=Math.max(3,Math.floor(stx.chart.tmpWidth/2));
			for(var x=0;x<quotes.length;x++){
				var quote=quotes[x];
				if(!quote || (!quote[field] && quote[field]!==0)) continue;
				if(quote.candleWidth) candleWidth=quote.candleWidth;
				if(isChart && quote.transform) quote=quote.transform;
				var x0=stx.pixelFromBar(x, panel.chart);
				if(squareWave) x0-=candleWidth/2;
				var y0=stx.pixelFromPrice(quote[field], panel);
				if(x===0 || !quotes[x-1] || (!quotes[x-1][field] && quotes[x-1][field]!==0)) {
					ctx.moveTo(x0,y0);
				}
				if(squareWave) {
					ctx.lineTo(x0,y0);
					ctx.lineTo(x0+candleWidth, y0);
					if(quotes[x+1]){
						var quote_1=quotes[x+1];
						if(isChart && quote_1.transform) quote_1=quote_1.transform;
						if(!quote_1[field] && quote_1[field]!==0){
							ctx.lineTo(x0+candleWidth, stx.pixelFromPrice(quote_1[sd.referenceOutput + " " + sd.name], stx.panels[sd.panel]));
						}
					}
				}else{
					ctx.moveTo(x0-pointWidth/2,y0);
					ctx.lineTo(x0+pointWidth/2,y0);
				}
			}
			ctx.lineWidth=1;
			if(sd.highlight) ctx.lineWidth=3;
			var color=sd.outputs[output];
			if(color=="auto") color=stx.defaultColor;	// This is calculated and set by the kernel before draw operation.
			ctx.strokeStyle=color;
			ctx.stroke();
			ctx.closePath();
			ctx.lineWidth=1;
		}
		stx.endClip();
	};

	/**
	 * A sample of a custom initialize function. It is rare that one would be required. In this case we simply customize the input display
	 * but otherwise call the default.
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.initializeStochastics=function(stx, type, inputs, outputs){
		inputs.display="Stoch (" + inputs.Period + ")";
		return CIQ.Studies.initializeFN.apply(null, arguments);
	};

	/**
	 * A simple calculation function.  Volume is already obtained, so all that is done here is setting colors.
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.calculateVolume=function(stx, sd){
		var outputs=sd.outputs;
		if(sd.name=="vchart" || sd.name=="volume"){
			stx.setStyle("stx_volume_up", "color", outputs["Up Volume"]);
			stx.setStyle("stx_volume_down", "color", outputs["Down Volume"]);
		}else{
			if(!stx || !stx.chart.dataSet) return;
			var layout=stx.layout;
			var remove=sd.parameters.removeStudy;
			var previous=layout.volumeUnderlay;
			layout.volumeUnderlay=!remove;
			if(previous!=layout.volumeUnderlay)
				stx.changeOccurred("layout");
			if(remove){
				CIQ.Studies.removeStudy(stx, sd);
			}else{
				stx.setStyle("stx_volume_underlay_up", "color", outputs["Up Volume"]);
				stx.setStyle("stx_volume_underlay_down", "color", outputs["Down Volume"]);
				if(outputs["Up Border"]) stx.setStyle("stx_volume_underlay_up", "border-left-color", outputs["Up Border"]);
				if(outputs["Down Border"]) stx.setStyle("stx_volume_underlay_down", "border-left-color", outputs["Down Border"]);
			}
		}
	};


	/**
	 * Moving Average convenience function
	 * @param  {string}   type    The type of moving average, e.g. simple, exponential, triangular, etc
	 * @param  {number}   periods Moving average period
	 * @param  {string}   field   The field in the data array to perform the moving average on
	 * @param  {number}   offset  Periods to offset the result by
	 * @param  {string}   name    String to prefix to the name of the output.  Full name of output would be name + " " + sd.name, for instance "Signal MACD"
	 * @param  {CIQ.ChartEngine} stx     Chart object
	 * @param  {object}   sd      Study Descriptor
	 * @memberOf CIQ.Studies
	 * @since 04-2015
	 */
	CIQ.Studies.MA=function(type, periods, field, offset, name, stx, sd){
		var ma=new CIQ.Studies.StudyDescriptor(name + " " + sd.name, "ma", sd.panel);
		ma.chart=sd.chart;
		ma.days=parseInt(periods,10);
		ma.inputs={};
		if(type) ma.inputs.Type=type;
		if(field) ma.inputs.Field=field;
		if(offset) ma.inputs.Offset=parseInt(offset,10);
		CIQ.Studies.calculateMovingAverage(stx, ma);
	};

	/**
	 * Does conversions for valid moving average types
	 * @param  {CIQ.ChartEngine} stx The chart object
	 * @param  {String} input String to test if a moving average type or "options" to return the list of ma options.
	 * @return {Object} The name of the moving average or a list of options
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.movingAverageHelper=function(stx,input){
		var conversions={
			"ma":"simple",
			"sma":"simple",
			"ema":"exponential",
			"tsma":"time series",
			"tma":"triangular",
			"vma":"variable",
			"vdma":"vidya",
			"wma":"weighted",
			"smma":"welles wilder"
		};
		var translations={
			"simple":stx.translateIf("Simple"),
			"exponential":stx.translateIf("Exponential"),
			"time series":stx.translateIf("Time Series"),
			"triangular":stx.translateIf("Triangular"),
			"variable":stx.translateIf("Variable"),
			"vidya":stx.translateIf("VIDYA"),
			"weighted":stx.translateIf("Weighted"),
			"welles wilder":stx.translateIf("Welles Wilder")
		};
		if(input=="options") return translations;
		else return conversions[input];
	};

	/**
	 * Creates a volume underlay for the chart. The underlay is always 25% of the height of the chart.
	 * Will use color attributes from the CSS styles `stx_volume_underlay_up` and  `stx_volume_underlay_down` unless overwritten by the calculation function ( default behavior).
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.volUnderlay=function(stx, sd, quotes){
		var seriesParam=[{
			field: "Volume",
			fill_color_up:		stx.canvasStyle("stx_volume_underlay_up").color,
			border_color_up:	stx.canvasStyle("stx_volume_underlay_up").borderLeftColor,
			opacity_up:			stx.canvasStyle("stx_volume_underlay_up").opacity,
			fill_color_down:	stx.canvasStyle("stx_volume_underlay_down").color,
			border_color_down:	stx.canvasStyle("stx_volume_underlay_down").borderLeftColor,
			opacity_down:		stx.canvasStyle("stx_volume_underlay_down").opacity
		}];
		var params={
			name: 				"Volume",
			panel:				sd.panel,
			heightPercentage:	sd.inputs.HeightPercentage?sd.inputs.HeightPercentage:sd.study.parameters.heightPercentage,
			widthFactor:		1
		};
		stx.drawHistogram(params,seriesParam);
	};


	/**
	 *
	 * Creates a volume chart. This is the one study that requires a specific panel name called "vchart".
	 * If no volume is available on the screen then the panel will be watermarked "Volume Not Available" (translated if a translate function is attached to the kernel object).
	 * Will use color attributes from the CSS styles `stx_volume_up` and  `stx_volume_down` unless overwritten by the calculation function ( default behavior).
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.createVolumeChart=function(stx, sd, quotes){
		var seriesParam=[{
			field:				"Volume",
			fill_color_up:		stx.canvasStyle("stx_volume_up").color,
			border_color_up:	"#000000",//this.canvasStyle("stx_volume_up")["borderLeftColor"],
			opacity_up:			1,
			fill_color_down:	stx.canvasStyle("stx_volume_down").color,
			border_color_down:	"#000000",//this.canvasStyle("stx_volume_down")["borderLeftColor"]
			opacity_down:		1
		}];

		var params={
			name: 				"Volume",
			panel:				sd.panel,
			widthFactor:		1,
			bindToYAxis: 		true
		};

		sd.outputMap.Volume="transparent";
		CIQ.Studies.createYAxis(stx, sd, sd.chart.dataSegment, stx.panels[sd.panel]);
		stx.drawHistogram(params,seriesParam);
	};


	/**
	 * A sample study calculation function. Note how sd.chart.scrubbed is used instead of dataSet. Also note the naming convention
	 * for the outputs.
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.calculateRSI=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		function computeRSI(avgGain, avgLoss){
			if(avgLoss===0) return 100;
			var rs=avgGain/avgLoss;
			return 100-(100/(1+rs));
		}
		if(quotes.length<sd.days+1){
			if(typeof practiceMode!="undefined" && practiceMode) return;
			stx.watermark(sd.panel,"center","bottom",stx.translateIf("Not enough quotes to compute RSI"));
			return;
		}
		var gain=0, loss=0, i, change;
		for(i=1;i<sd.days;i++){
			change=quotes[i].Close-quotes[i-1].Close;
			if(change<0) loss+=(change*-1);
			else gain+=change;
		}
		var avgGain=gain/sd.days;
		var avgLoss=loss/sd.days;
		quotes[i][sd.name]=computeRSI(avgGain, avgLoss);
		var name="RSI " + sd.name;
		for(i=sd.days;i<quotes.length;i++){
			var quote=quotes[i];
			change=quote.Close-quotes[i-1].Close;
			if(change>0){
				avgGain=((avgGain*(sd.days-1))+change)/sd.days;
				avgLoss=avgLoss*(sd.days-1)/sd.days;
			}else{
				avgLoss=((avgLoss*(sd.days-1))+(change*-1))/sd.days;
				avgGain=avgGain*(sd.days-1)/sd.days;
			}
			quote[name]=computeRSI(avgGain, avgLoss);
		}
		sd.zoneOutput="RSI";
	};
	
	/**
	 * Calculate function for MACD study
	 * @param  {CIQ.ChartEngine} stx Chart object
	 * @param  {object} sd  Study Descriptor
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.calculateMACD=function(stx, sd) {
		var quotes=sd.chart.scrubbed;
		if(!quotes) return;
		if(quotes.length<sd.days+1){
			if(typeof practiceMode!="undefined" && practiceMode) return;
			stx.watermark(sd.panel,"center","bottom",stx.translateIf("Not enough quotes to compute MACD " + sd.chart.dataSet.length));

			return;
		}
		var inputs=sd.inputs, name=sd.name;
		if(!sd.macd1Days) sd.macd1Days=parseFloat(inputs["Fast MA Period"]);
		if(!sd.macd2Days) sd.macd2Days=parseFloat(inputs["Slow MA Period"]);
		if(!sd.signalDays) sd.signalDays=parseFloat(inputs["Signal Period"]);
		if(!sd.days) sd.days=Math.max(sd.macd1Days,sd.macd2Days,sd.signalDays);

		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";

		var maType=inputs["Moving Average Type"];
		if(!maType) maType="exponential";

		CIQ.Studies.MA(maType, sd.macd1Days, field, 0, "MACD1", stx, sd);
		CIQ.Studies.MA(maType, sd.macd2Days, field, 0, "MACD2", stx, sd);

		var i, quote;
		for(i=sd.days-1;i<quotes.length;i++){
			quote=quotes[i];
			quote["MACD "+name]=quote["MACD1 "+name]-quote["MACD2 "+name];
		}
		var sigMaType=inputs["Signal MA Type"];
		if(!sigMaType) sigMaType="exponential";
		CIQ.Studies.MA(sigMaType, sd.signalDays, "MACD "+name, 0, "Signal", stx, sd);

		var histogram=name+"_hist";
		for(i=sd.days-1;i<quotes.length;i++){
			quote=quotes[i];
			var signal=quote["Signal "+name];
			if(!signal && signal!==0) continue;	// don't create histogram before the signal line is valid
			quote[histogram]=quote["MACD "+name]-quote["Signal "+name];
		}
	};

	/**
	 * Calculate function for standard deviation.
	 * @param  {CIQ.ChartEngine} stx Chart object
	 * @param  {object} sd  Study Descriptor
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.calculateStandardDeviation=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(sd.days<0) sd.days=1;
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";
		var type=sd.inputs["Moving Average Type"];
		if(!type) type=sd.inputs.Type;
		CIQ.Studies.MA(type, sd.days, field, sd.inputs.Offset, "_MA", stx, sd);

		var acc1=0;
		var acc2=0;
		var ma=0;
		var mult=sd.inputs["Standard Deviations"];
		if(mult<0) mult=2;
		var name=sd.name;
		for(var p in sd.outputs){
			name=p + " " + name;
		}
		for(var i=0;i<quotes.length;i++){
			var quote=quotes[i];
			ma=quote["_MA "+sd.name];
			var val=quote[field];
			if(isNaN(val)) val=0;
			acc1+=Math.pow(val,2);
			acc2+=val;
			if(i<sd.days-1) continue;
			if(i>=sd.days){
				var val2=quotes[i-sd.days][field];
				if(isNaN(val2)) val2=0;
				acc1-=Math.pow(val2,2);
				acc2-=val2;
			}
			quote[name]=Math.sqrt((acc1+sd.days*Math.pow(ma,2)-2*ma*acc2)/sd.days) * mult;

		}
	};

	/**
	 * Calculate function for moving averages. sd.inputs["Type"] can be used to request a specific type of moving average.
	 * @param  {CIQ.ChartEngine} stx Chart object
	 * @param  {object} sd  Study Descriptor
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.calculateMovingAverage=function(stx, sd){
		if(!sd.chart.scrubbed) return;
		var type=sd.inputs.Type;
		if(type=="ma" || !type) type="simple";	// handle when the default inputs are passed in
		var typeMap = {
			"ema": "Exponential", "exponential": "Exponential",
			"tsma": "TimeSeries", "time series": "TimeSeries",
			"tma": "Triangular", "triangular": "Triangular",
			"vma": "Variable", "variable": "Variable",
			"vdma": "Variable", "vidya": "Variable",
			"wma": "Weighted", "weighted": "Weighted",
			"smma": "Exponential", "welles wilder": "Exponential"
		};
		if (type in typeMap) {
			return CIQ.Studies["calculateMovingAverage" + typeMap[type]](stx, sd);
		} else if (type !== "simple") {
			return;
		}
		var quotes=sd.chart.scrubbed;
		if(sd.days<0) sd.days=1;
		var acc=0;
		var ma=0;
		var ii=0;
		var name=sd.name;
		for(var p in sd.outputs){
			name=p + " " + name;
		}
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";	// Handle when the default inputs are passed in
		var offset=parseInt(sd.inputs.Offset,10);
		if(isNaN(offset)) offset=0;
		var vals=[];
		for(var i=0;i<quotes.length;i++){
			var quote=quotes[i];
			var val=quote[field];
			var notOverflowing=i+offset>=0 && i+offset<quotes.length;
			var offsetQuote=notOverflowing?quotes[i+offset]:null;
			if(!val && val!==0){
				if(offsetQuote) offsetQuote[name]=null;
				continue;
			}
			acc+=val;
			vals.push(val);
			if(ii==sd.days-1){
				ma=acc/sd.days;
				if(offsetQuote) offsetQuote[name]=ma;
			}else if(ii>=sd.days){
				var val2=vals.shift();
				acc-=val2;
				ma=acc/sd.days;
				if(offsetQuote) offsetQuote[name]=ma;
			}else if(ii===0){
				ma=acc;
				if(offsetQuote) offsetQuote[name]=null;
			}else {
				ma=acc/(ii+1);
				if(offsetQuote) offsetQuote[name]=null;
			}
			ii++;
		}
	};

	/**
	 * Calculate function for exponential moving average
	 * @param  {CIQ.ChartEngine} stx Chart object
	 * @param  {object} sd  Study Descriptor
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.calculateMovingAverageExponential=function(stx, sd){
		var type=sd.inputs.Type;
		var quotes=sd.chart.scrubbed;
		var acc=0;
		var ma=0;
		var ii=0;
		var multiplier = (2/(sd.days+1));
		if(type=="welles wilder") multiplier = 1/sd.days;

		var emaPreviousDay = 0;
		var name=sd.name;
		for(var p in sd.outputs){
			name=p + " " + name;
		}

		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";	// Handle when the default inputs are passed in
		var offset=parseInt(sd.inputs.Offset,10);
		if(isNaN(offset)) offset=0;
		for(var i=0;i<quotes.length;i++){
			var quote=quotes[i];
			var val=quote[field];
			var notOverflowing=i+offset>=0 && i+offset<quotes.length;
			var offsetQuote=notOverflowing?quotes[i+offset]:null;
			if(!val && val!==0){
				if(offsetQuote) offsetQuote[name]=null;
				continue;
			}
			if(ii==sd.days-1){
				acc+=val;
				ma = acc/sd.days;
				if(offsetQuote) offsetQuote[name]=ma;
			}else if(ii>=sd.days){
				var m=multiplier;
				ma = ((val-emaPreviousDay)*m)+emaPreviousDay;
				if(offsetQuote) offsetQuote[name]=ma;
			}else if(ii===0){
				acc+=val;
				ma=acc;
				if(offsetQuote) offsetQuote[name]=null;
			}else { // 1 <= li < sd.days
				acc+=val;
				ma=acc/(ii+1);
				if(offsetQuote) offsetQuote[name]=null;
			}
			emaPreviousDay=ma;
			ii++;
		}
	};

	/**
	 * Calculate function for variable moving average and VI Dynamic MA (VIDYA)
	 * @param  {CIQ.ChartEngine} stx Chart object
	 * @param  {object} sd  Study Descriptor
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.calculateMovingAverageVariable=function(stx, sd){
		var type=sd.inputs.Type;
		var quotes=sd.chart.scrubbed;
		var alpha = (2/(sd.days+1));

		var vmaPreviousDay = 0;
		var name=sd.name;
		for(var p in sd.outputs){
			name=p + " " + name;
		}

		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";	// Handle when the default inputs are passed in

		if(type=="vidya"){
			sd.std=new CIQ.Studies.StudyDescriptor(sd.name, "sdev", sd.panel);
			sd.std.chart=sd.chart;
			sd.std.days=5;
			sd.std.inputs={"Field":field, "Standard Deviations":1, "Type":"ma"};
			sd.std.outputs={"STD":null};
			CIQ.Studies.calculateStandardDeviation(stx,sd.std);

			CIQ.Studies.MA("ma", 20, "STD "+sd.name, 0, "MASTD", stx, sd);

		}else{
			sd.cmo=new CIQ.Studies.StudyDescriptor(sd.name, "cmo", sd.panel);
			sd.cmo.chart=sd.chart;
			sd.cmo.days=9;
			sd.cmo.outputs={"CMO":null};
			CIQ.Studies.calculateChandeMomentum(stx, sd.cmo);
		}

		var offset=parseInt(sd.inputs.Offset,10);
		if(isNaN(offset)) offset=0;
		for(var i=0;i<quotes.length;i++){
			var quote=quotes[i];
			var val=quote[field];
			var notOverflowing=i+offset>=0 && i+offset<quotes.length;
			var offsetQuote=notOverflowing?quotes[i+offset]:null;
			if(!val && val!==0){
				if(offsetQuote) offsetQuote[name]=null;
				continue;
			}
			var vi;
			if(type=="vidya") {
				if(!quote["MASTD "+sd.name]) continue;
				else vi=quote["STD "+sd.name]/quote["MASTD "+sd.name];
			}
			else {
				if(!quote["CMO "+sd.name]) continue;
				else vi=Math.abs(quote["CMO "+sd.name])/100;
			}
			var vma=(alpha*vi*val)+((1-(alpha*vi))*vmaPreviousDay);
			if(offsetQuote) offsetQuote[name]=vma;
			vmaPreviousDay=vma;
		}
	};

	/**
	 * Calculate function for time series moving average
	 * @param  {CIQ.ChartEngine} stx Chart object
	 * @param  {object} sd  Study Descriptor
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.calculateMovingAverageTimeSeries=function(stx, sd){
		sd.ma=new CIQ.Studies.StudyDescriptor(sd.name, "ma", sd.panel);
		sd.ma.chart=sd.chart;
		sd.ma.days=sd.days;
		sd.ma.inputs=sd.inputs;
		CIQ.Studies.calculateLinearRegressionIndicator(stx, sd.ma);

		var name=sd.name;
		for(var p in sd.outputs){
			name=p + " " + name;
		}
		var offset=parseInt(sd.inputs.Offset,10);
		if(isNaN(offset)) offset=0;
		var quotes=sd.chart.scrubbed;
		for(var i=0;i<quotes.length;i++){
			var quote=quotes[i];
			if(i+offset>=0 && i+offset<quotes.length) quotes[i+offset][name]=quote["Forecast "+sd.name];
		}
	};

	/**
	 * Calculate function for triangular moving average
	 * @param  {CIQ.ChartEngine} stx Chart object
	 * @param  {object} sd  Study Descriptor
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.calculateMovingAverageTriangular=function(stx, sd){
		var quotes=sd.chart.scrubbed;

		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";	// Handle when the default inputs are passed in
		var days=Math.ceil(sd.days/2);
		CIQ.Studies.MA("simple", days, sd.inputs.Field, 0, "TRI1", stx, sd);
		if(sd.days%2===0) days++;
		CIQ.Studies.MA("simple", days, "TRI1 "+sd.name, 0, "TRI2", stx, sd);

		var name=sd.name;
		for(var p in sd.outputs){
			name=p + " " + name;
		}
		var offset=parseInt(sd.inputs.Offset,10);
		if(isNaN(offset)) offset=0;
		for(var i=0;i<quotes.length;i++){
			var quote=quotes[i];
			if(i+offset>=0 && i+offset<quotes.length) quotes[i+offset][name]=quote["TRI2 "+sd.name];
		}
		return;
	};

	/**
	 * Calculate function for weighted moving average
	 * @param  {CIQ.ChartEngine} stx Chart object
	 * @param  {object} sd  Study Descriptor
	 */
	CIQ.Studies.calculateMovingAverageWeighted=function(stx, sd){
		var quotes=sd.chart.scrubbed;

		var accAdd=0;
		var accSubtract=0;
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";	// Handle when the default inputs are passed in
		var divisor=sd.days*(sd.days+1)/2;

		var name=sd.name;
		for(var p in sd.outputs){
			name=p + " " + name;
		}
		var offset=parseInt(sd.inputs.Offset,10);
		if(isNaN(offset)) offset=0;
		for(var i=0;i<quotes.length;i++){
			var quote=quotes[i];
			var val=quote[field];
			var notOverflowing=i+offset>=0 && i+offset<quotes.length;
			var offsetQuote=notOverflowing?quotes[i+offset]:null;
			if(!val && val!==0){
				if(offsetQuote) offsetQuote[name]=null;
				continue;
			}
			var weight=Math.min(sd.days,i+1);
			if(i>=sd.days) {  //age out old values
				accAdd-=accSubtract;
				if(quotes[i-sd.days] && quotes[i-sd.days][field]) accSubtract-=quotes[i-sd.days][field];
			}
			accAdd+=weight*val;
			accSubtract+=val;

			if(i<sd.days-1){
				if(offsetQuote) offsetQuote[name]=null;
			}else{
				if(offsetQuote) offsetQuote[name]=accAdd/divisor;
			}
		}
		return;
	};

	/**
	 * Calculate function for klinger
	 * @param  {CIQ.ChartEngine} stx Chart object
	 * @param  {object} sd  Study Descriptor
	 * @memberOf CIQ.Studies
	 */

	CIQ.Studies.calculateKlinger=function(stx, sd){
		var quotes=sd.chart.scrubbed;

		var field=sd.name+"_hist",
			klinger="Klinger " + sd.name,
			klingerSignal="KlingerSignal " + sd.name,
			signedVolume="SV " + sd.name,
			shortEMA="EMA-S " + sd.name,
			longEMA="EMA-L " + sd.name,
			i;
		for(i=1;i<quotes.length;i++){
			var sv=quotes[i].Volume;
			if(quotes[i]["hlc/3"]<quotes[i-1]["hlc/3"]) sv*=-1;
			quotes[i][signedVolume]=sv;
		}

		CIQ.Studies.MA("exponential", Number(sd.inputs["Short Cycle"]), signedVolume, 0, "EMA-S", stx, sd);
		CIQ.Studies.MA("exponential", Number(sd.inputs["Long Cycle"]), signedVolume, 0, "EMA-L", stx, sd);

		for(i=Number(sd.inputs["Long Cycle"]);i<quotes.length;i++){
			quotes[i][klinger]=quotes[i][shortEMA]-quotes[i][longEMA];
		}

		CIQ.Studies.MA("exponential", Number(sd.inputs["Signal Periods"]), klinger, 0, "KlingerSignal", stx, sd);

		for(i=0;i<quotes.length;i++){
			quotes[i][field]=quotes[i][klinger]-quotes[i][klingerSignal];
		}
	};

	/**
	 * Calculate function for stochastics
	 * @param  {CIQ.ChartEngine} stx Chart object
	 * @param  {object} sd  Study Descriptor
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.calculateStochastics=function(stx, sd){
		sd.max=100;
		sd.min=0;
		if(!sd.smooth) sd.smooth=(sd.inputs.Smooth);
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";

		var quotes=sd.chart.scrubbed;
		if(!quotes) return;

		if(quotes.length<sd.days+1){
			if(typeof practiceMode!="undefined" && practiceMode) return;
			stx.watermark(sd.panel,"center","bottom",stx.translateIf("Not enough quotes to compute stochastics " + sd.chart.dataSet.length + ":" + sd.days));
			return;
		}

		function computeStochastics(position, field, days){
			var beg=position-days+1;
			var low=1000000, high=0;
			for(var i=beg;i<=position;i++){
				low=Math.min(low, quotes[i].Low);
				high=Math.max(high, quotes[i].High);
			}
			var k=(quotes[position][field]-low)/(high-low)*100;
			return k;
		}

		var name=sd.name;
		if(sd.smooth) name=name.substring(0,name.length-2);

		var fastPeriod=sd.inputs["%K Periods"];
		if(!fastPeriod) fastPeriod=sd.days;

		for(var i=fastPeriod;i<quotes.length;i++){
			quotes[i][name]=computeStochastics(i,field,fastPeriod);
		}

		var smoothingPeriod=sd.inputs["%K Smoothing Periods"];
		if(smoothingPeriod) sd.smooth=true;
		else if(sd.smooth) smoothingPeriod=3;
		if(sd.smooth){
			sd.smooth=new CIQ.Studies.StudyDescriptor(sd.name, "ma", sd.panel);
			sd.smooth.chart=sd.chart;
			sd.smooth.days=smoothingPeriod;
			sd.smooth.inputs={"Field":name, "Type":"simple"};
			CIQ.Studies.calculateMovingAverage(stx, sd.smooth);
		}
		sd.outputMap[sd.name]="Fast";

		var slowPeriod=sd.inputs["%D Periods"];
		if(!slowPeriod) slowPeriod=3;
		sd.ma=new CIQ.Studies.StudyDescriptor(sd.name+"_3", "ma", sd.panel);
		sd.ma.chart=sd.chart;
		sd.ma.days=slowPeriod;
		sd.ma.inputs={"Field":sd.name, "Type":"simple"};
		sd.ma.min=sd.min;
		sd.ma.max=sd.max;
		CIQ.Studies.calculateMovingAverage(stx, sd.ma);
		sd.outputMap[sd.name+"_3"]="Slow";
	};


	CIQ.Studies.calculateStudyATR=function(stx, sd){
		var quotes=sd.chart.scrubbed;
        var period=sd.days;
        var total=0;
        var name=sd.name;
	    for(var i=1;i<quotes.length;i++){
			var prices=quotes[i];
			var pd=quotes[i-1];
			var trueRange=Math.max(prices.High,pd.Close)-Math.min(prices.Low,pd.Close);
			total+=trueRange;
			if(i>period) total-=quotes[i-period]["True Range " + name];
			prices["True Range " + name]=trueRange;
			prices["Sum True Range " + name]=total;
			if(i==period) prices["ATR " + name]=total/period;
			else if(i>period) prices["ATR " + name]=(pd["ATR " + name]*(period-1)+trueRange)/period;
		}
	};

	CIQ.Studies.calculatePSAR=function(stx, sd){
		var quotes=sd.chart.scrubbed;

		var af=0;
		var ep=null;
		var lasttrend=false;
		var SAR=0;
		var step=parseFloat(sd.inputs["Minimum AF"]);
		var maxStep=parseFloat(sd.inputs["Maximum AF"]);

		function doReset(){
			af=0;
			ep=null;
			lasttrend=!lasttrend;
		}
		for(var i=0;i<quotes.length-1;i++){
			var priorSAR=SAR;
			if(lasttrend){
				if(!ep || ep<quotes[i].High){
					ep=quotes[i].High;
					af=Math.min(af+step,maxStep);
				}
				SAR=priorSAR+af*(ep-priorSAR);
				var lowestPrior2Lows=Math.min(quotes[Math.max(1,i)-1].Low,quotes[i].Low);
				if(SAR>quotes[i+1].Low){
					SAR=ep;
					doReset();
				}else if(SAR>lowestPrior2Lows){
					SAR=lowestPrior2Lows;
				}
			}else{
				if(!ep || ep>quotes[i].Low){
					ep=quotes[i].Low;
					af=Math.min(af+step,maxStep);
				}
				SAR=priorSAR+af*(ep-priorSAR);
				var highestPrior2Highs=Math.max(quotes[Math.max(1,i)-1].High,quotes[i].High);
				if(SAR<quotes[i+1].High){
					SAR=ep;
					doReset();
				}else if(SAR<highestPrior2Highs){
					SAR=highestPrior2Highs;
				}
			}
			quotes[i+1]["Result " + sd.name]=SAR;
    	}
	};

	CIQ.Studies.calculateTRIX=function(stx, sd){
		var name=sd.name;
		var fields=["Close","MA1 "+name,"MA2 "+name,"MA3 "+name];
		for(var e=0; e<fields.length-1; e++){
			CIQ.Studies.MA("exponential", sd.days, fields[e], 0, "MA"+(e+1).toString(), stx, sd);
		}
		var quotes=sd.chart.scrubbed;
		var ma3=fields[3];
	    for(var i=1;i<quotes.length;i++){
	    	var q0=quotes[i-1][ma3];
			if(!q0) continue;
			quotes[i]["Result " + name]=100*((quotes[i][ma3]/q0)-1);
	    }
	};

	CIQ.Studies.calculateMedianPrice=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var period=sd.days;
		var name=sd.name;
		for(var p in sd.outputs){
			name=p + " " + name;
		}
		var total=0;
		for(var i=0;i<quotes.length;i++){
			total+=quotes[i]["hl/2"];
			if (i>=period) {
				total-=quotes[i-period]["hl/2"];
				quotes[i][name]=total/period;
			}
		}
	};

	CIQ.Studies.calculateIntradayMomentum=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var period=sd.days;

		var totalUp=0;
		var totalDown=0;
		for(var i=0;i<quotes.length;i++){
			var diff=quotes[i].Close-quotes[i].Open;
			if(diff>0) totalUp+=diff;
			else totalDown-=diff;
			if(i>=period){
				var pDiff=quotes[i-period].Close-quotes[i-period].Open;
				if(pDiff>0) totalUp-=pDiff;
				else totalDown+=pDiff;
			}
    		quotes[i]["Result " + sd.name]=100*totalUp/(totalUp+totalDown);
		}
	};

	CIQ.Studies.calculateQStick=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var period=sd.days;

		for(var i=0;i<quotes.length;i++){
			quotes[i]["Close-Open " + sd.name]=quotes[i].Close-quotes[i].Open;
		}
		CIQ.Studies.MA(sd.inputs["Moving Average Type"], period, "Close-Open "+sd.name, 0, "Result", stx, sd);
	};

	CIQ.Studies.calculateSchaff=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var period=sd.days;
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";
		var factor=0.5;

		CIQ.Studies.MA(sd.inputs["Moving Average Type"], Number(sd.inputs["Short Cycle"]), field, 0, "MACD1", stx, sd);
		CIQ.Studies.MA(sd.inputs["Moving Average Type"], Number(sd.inputs["Long Cycle"]), field, 0, "MACD2", stx, sd);

		function getLLVHHV(p,x,n){
			var l=null, h=null;
			for(var j=x-p+1;j<=x;j++){
				var d=quotes[j][n+" "+sd.name];
				if(!d) continue;
				l=(l===null?d:Math.min(l,d));
				h=(h===null?d:Math.max(h,d));
			}
			return [l,h];
		}
		var f1=0,f2=0;
		var longCycle=Number(sd.inputs["Long Cycle"]);
		for(var i=0;i<quotes.length;i++){
			var quote=quotes[i];
			quote["Result "+sd.name]=f2;

			if(i<longCycle-1) continue;
			quote["MACD "+sd.name]=quote["MACD1 "+sd.name]-quote["MACD2 "+sd.name];

			if(i<longCycle+(period-1)) continue;
			var lh=getLLVHHV(period,i,"MACD");
			f1=(lh[1]>lh[0]?(100*(quote["MACD "+sd.name]-lh[0])/(lh[1]-lh[0])):f1);
			quote["PF "+sd.name]=( quotes[i-1]["PF "+sd.name] ? quotes[i-1]["PF "+sd.name]+factor*(f1-quotes[i-1]["PF "+sd.name]) : f1 );

			if(i<longCycle+2*(period-1)) continue;
			lh=getLLVHHV(period,i,"PF");
			f2=(lh[1]>lh[0]?(100*(quote["PF "+sd.name]-lh[0])/(lh[1]-lh[0])):f2);
			quote["Result "+sd.name]=( quotes[i-1]["Result "+sd.name] ? quotes[i-1]["Result "+sd.name]+factor*(f2-quotes[i-1]["Result "+sd.name]) : f2 );
		}
	};

	CIQ.Studies.calculateStochMomentum=function(stx, sd){
		var quotes=sd.chart.scrubbed;

		function getLLVHHV(p,x){
			var l=null, h=null;
			for(var j=x-p+1;j<=x;j++){
				l=(l===null?quotes[j].Low:Math.min(l,quotes[j].Low));
				h=(h===null?quotes[j].High:Math.max(h,quotes[j].High));
			}
			return [l,h];
		}

		var pKPeriods=Number(sd.inputs["%K Periods"]);
		var i;
		for(i=pKPeriods-1;i<quotes.length;i++){
			var quote=quotes[i];
			var lh=getLLVHHV(pKPeriods,i);
			quote["H "+sd.name]=quote.Close-(lh[0]+lh[1])/2;
			quote["DHL "+sd.name]=lh[1]-lh[0];
		}

		CIQ.Studies.MA("exponential", Number(sd.inputs["%K Smoothing Periods"]), "H "+sd.name, 0, "HS1", stx, sd);
		CIQ.Studies.MA("exponential", Number(sd.inputs["%K Double Smoothing Periods"]), "HS1 "+sd.name, 0, "HS2", stx, sd);
		CIQ.Studies.MA("exponential", Number(sd.inputs["%K Smoothing Periods"]), "DHL "+sd.name, 0, "DHL1", stx, sd);
		CIQ.Studies.MA("exponential", Number(sd.inputs["%K Double Smoothing Periods"]), "DHL1 "+sd.name, 0, "DHL2", stx, sd);

		for(i=pKPeriods-1;i<quotes.length;i++){
			quotes[i]["%K "+sd.name]=(quotes[i]["HS2 "+sd.name]/(0.5*quotes[i]["DHL2 "+sd.name]))*100;
		}

		CIQ.Studies.MA(sd.inputs["%D Moving Average Type"], Number(sd.inputs["%D Periods"]), "%K "+sd.name, 0, "%D", stx, sd);

		sd.zoneOutput="%K";
	};

	CIQ.Studies.calculateEhlerFisher=function(stx, sd){
		var quotes=sd.chart.scrubbed;

		function getLLVHHV(p,x){
			var l=null, h=null;
			for(var j=x-p+1;j<=x;j++){
				var d=(quotes[j].High+quotes[j].Low)/2;
				l=(l===null?d:Math.min(l,d));
				h=(h===null?d:Math.max(h,d));
			}
			return [l,h];
		}

		var n=0;
		for(var i=0;i<quotes.length;i++){
			var quote=quotes[i];
			if(i<sd.days-1){
				quote["EF "+sd.name]=quote["EF Trigger "+sd.name]=n;
				continue;
			}
			var lh=getLLVHHV(sd.days,i);
			n=0.33*2*((((quotes[i].High+quotes[i].Low)/2)-lh[0])/(Math.max(0.000001,lh[1]-lh[0]))-0.5)+0.67*n;
			if(n>0) n=Math.min(n,0.9999);
			else if(n<0) n=Math.max(n,-0.9999);
			quote["EF "+sd.name]=0.5*Math.log((1+n)/(1-n))+0.5*quotes[i-1]["EF "+sd.name];
			quote["EF Trigger "+sd.name]=quotes[i-1]["EF "+sd.name];
		}
	};

	CIQ.Studies.calculatePrettyGoodOscillator=function(stx, sd){
		var quotes=sd.chart.scrubbed;

		CIQ.Studies.calculateStudyATR(stx,sd);

		CIQ.Studies.MA("exponential", sd.days, "True Range "+sd.name, 0, "EMA", stx, sd);
		CIQ.Studies.MA("simple", sd.days, "Close", 0, "SMA", stx, sd);

	    for(var i=1;i<quotes.length;i++){
				if(!quotes[i]["SMA "+sd.name] || !quotes[i]["EMA "+sd.name]) continue;
			quotes[i]["Result " + sd.name]=(quotes[i].Close-quotes[i]["SMA "+sd.name])/quotes[i]["EMA "+sd.name];
	    }
	};

	CIQ.Studies.calculateUltimateOscillator=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var cycle=[sd.inputs["Cycle 1"],sd.inputs["Cycle 2"],sd.inputs["Cycle 3"]];
		var c01=cycle[0]*cycle[1];
		var c02=cycle[0]*cycle[2];
		var c12=cycle[1]*cycle[2];
		var accbp=[0,0,0];
		var acctr=[0,0,0];
		var start=Math.max(cycle[0],Math.max(cycle[1],cycle[2]));
	    for(var i=1;i<quotes.length;i++){
	    	var minLC=Math.min(quotes[i].Low,quotes[i-1].Close);
	    	var bp=quotes[i].Close-minLC;
	    	var tr=Math.max(quotes[i].High,quotes[i-1].Close)-minLC;
	    	for(var x=0;x<cycle.length;x++){
	    		accbp[x]+=bp;
	    		acctr[x]+=tr;
		    	if(i>cycle[x]){
			    	var p_minLC=Math.min(quotes[i-cycle[x]].Low,quotes[i-cycle[x]-1].Close);
			    	var p_bp=quotes[i-cycle[x]].Close-p_minLC;
			    	var p_tr=Math.max(quotes[i-cycle[x]].High,quotes[i-cycle[x]-1].Close)-p_minLC;
		    		accbp[x]-=p_bp;
		    		acctr[x]-=p_tr;
		    	}
	    	}
	    	if(i<start) continue;
	    	var numerator=c12*accbp[0]/acctr[0] + c02*accbp[1]/acctr[1] + c01*accbp[2]/acctr[2];
	    	var denominator=c12+c02+c01;
			quotes[i]["Result " + sd.name]=100*numerator/denominator;
	    }
	};

	CIQ.Studies.calculatePriceVolumeTrend=function(stx, sd){
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";

		var quotes=sd.chart.scrubbed;
		var total=0;
	    for(var i=1;i<quotes.length;i++){
				if(!quotes[i][field]) continue;
				if(!quotes[i-1][field]) continue;

	    	total+=quotes[i].Volume*(quotes[i][field]-quotes[i-1][field])/quotes[i-1][field];
    		quotes[i]["Result " + sd.name]=total;
	    }
	};

	CIQ.Studies.calculateOnBalanceVolume=function(stx, sd){
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";
		var minTick=sd.inputs["Min Tick Value"];
		var obv=false;
		if(!minTick && minTick!==0) {
			obv=true;
			minTick=0;
		}
		var quotes=sd.chart.scrubbed;
		var total=0;
		var direction=0;
	    for(var i=1;i<quotes.length;i++){
				if(!quotes[i][field]) continue;
				if(!quotes[i-1][field]) continue;

	    	if(quotes[i][field]-quotes[i-1][field]>minTick) direction=1;
	    	else if(quotes[i-1][field]-quotes[i][field]>minTick) direction=-1;
	    	else if(obv) direction=0;
	    	total+=quotes[i].Volume*direction;
    		quotes[i]["Result " + sd.name]=total;
	    }
	};

	CIQ.Studies.calculateVolumeIndex=function(stx, sd){
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";
		var quotes=sd.chart.scrubbed;
		var total=100;
	    for(var i=1;i<quotes.length;i++){
				if(!quotes[i][field]) continue;
				if(!quotes[i-1][field]) continue;
	    	if((sd.type=="Pos Vol" && quotes[i].Volume>quotes[i-1].Volume) ||
	    	   (sd.type=="Neg Vol" && quotes[i].Volume<quotes[i-1].Volume)){
	    		total*=(quotes[i][field]/quotes[i-1][field]);
	    	}
    		quotes[i]["Index " + sd.name]=total;
	    }
		CIQ.Studies.MA(sd.inputs["Moving Average Type"], sd.days, "Index "+sd.name, 0, "MA", stx, sd);
	};

	CIQ.Studies.calculateHistoricalVolatility=function(stx, sd){
		function intFactor(days){
			if(isNaN(days)) days=365;
			if(stx.layout.interval=="day") return days;
			else if(stx.layout.interval=="week") return 52;
			else if(stx.layout.interval=="month") return 12;
			else return days;
		}
		var quotes=sd.chart.scrubbed;
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";
		var mult=sd.inputs["Standard Deviations"];
		if(mult<0) mult=1;
		annualizingFactor=100*Math.sqrt(intFactor(sd.inputs["Days Per Year"]))*mult;

		var arr=[];
		var accum=0;
		for(var i=1;i<quotes.length;i++){
			var denom=quotes[i-1][field];
			if( denom) {
				var ln=Math.log(quotes[i][field]/denom);
				arr.push(ln);
				accum+=ln;
				if(i>=sd.days) {
					var d2=0;
					accum/=sd.days;
					for(var j=0;j<arr.length;j++){
						d2+=Math.pow(arr[j]-accum,2);
					}
					accum*=sd.days;
					accum-=arr.shift();
					quotes[i]["Result " + sd.name]=Math.sqrt(d2/sd.days)*annualizingFactor;
				}
			}
	    }
	};

	CIQ.Studies.calculateSwingIndex=function(stx, sd){
		var T=sd.inputs["Limit Move Value"];
		if(T===null || isNaN(T)) T=99999;
		var quotes=sd.chart.scrubbed;
		var total=0;
	    for(var i=1;i<quotes.length;i++){

	    	var A=Math.abs(quotes[i].High-quotes[i-1].Close);
	    	var B=Math.abs(quotes[i].Low-quotes[i-1].Close);
	    	var C=Math.abs(quotes[i].High-quotes[i].Low);
	    	var D=Math.abs(quotes[i-1].Close-quotes[i-1].Open);
	    	var K=Math.max(A,B);
	    	var M=Math.max(C,K);
	    	var R=M+0.25*D;
	    	if(M==A) R-=0.5*B;
	    	else if(M==B) R-=0.5*A;

	    	var swing = (50*((quotes[i].Close-quotes[i-1].Close)+0.5*(quotes[i].Close-quotes[i].Open)+0.25*(quotes[i-1].Close-quotes[i-1].Open))/R)*(K/T);
			if(R===0 || T===0) swing=0;

    		if(sd.type=="Swing") total=0;
   			total+=swing;
    		quotes[i]["Result " + sd.name]=total;
	    }
	};

	CIQ.Studies.calculateADX=function(stx, sd){
		CIQ.Studies.calculateStudyATR(stx,sd);

		var quotes=sd.chart.scrubbed;
		var period=sd.days;
		var smoothing=parseInt(sd.inputs["Smoothing Period"],10);
		if(!smoothing && smoothing!==0) smoothing=period;
		var smoothTR=0;
		var smoothPlusDM=0;
		var smoothMinusDM=0;
		var runningDX=0;
	    for(var i=1;i<quotes.length;i++){
	    	var plusDM=Math.max(0,quotes[i].High-quotes[i-1].High);
	    	var minusDM=Math.max(0,quotes[i-1].Low-quotes[i].Low);
	    	if(plusDM>minusDM) minusDM=0;
	    	else if(minusDM>plusDM) plusDM=0;
	    	else plusDM=minusDM=0;

	    	if(i<=period){
	    		smoothPlusDM+=plusDM;
	    		smoothMinusDM+=minusDM;
	    		smoothTR+=quotes[i]["True Range " + sd.name];
	    		if(i<period) continue;
	    	}else{
		    	smoothPlusDM=smoothPlusDM-smoothPlusDM/period+plusDM;
		    	smoothMinusDM=smoothMinusDM-smoothMinusDM/period+minusDM;
	    		smoothTR=smoothTR-smoothTR/period+quotes[i]["True Range " + sd.name];
	    	}

	    	var plusDI=100*smoothPlusDM/smoothTR;
	    	var minusDI=100*smoothMinusDM/smoothTR;
	    	var DX=100*Math.abs(plusDI-minusDI)/(plusDI+minusDI);

    		quotes[i]["+DI " + sd.name]=plusDI;
    		quotes[i]["-DI " + sd.name]=minusDI;
    		if(sd.inputs.Series!==false && smoothing){
	    		if(i<period+smoothing-1){
			    	runningDX+=DX;
			    }else if(i==period+smoothing-1){
			    	quotes[i]["ADX " + sd.name]=runningDX/smoothing;
			    }else{
			    	quotes[i]["ADX " + sd.name]=(quotes[i-1]["ADX " + sd.name]*(smoothing-1) + DX)/smoothing;
			    }
    		}
	    }
	    if(!sd.inputs.Histogram) return;
		var histogram=sd.name+"_hist";
		for(i=sd.days-1;i<quotes.length;i++){
			quote=quotes[i];
			if(!quote["+DI "+sd.name] && quote["+DI "+sd.name]!==0) continue;
			if(!quote["-DI "+sd.name] && quote["-DI "+sd.name]!==0) continue;
			quote[histogram]=quote["+DI "+sd.name]-quote["-DI "+sd.name];
			if(sd.inputs.Series===false){  //delete these so yAxis computes max/min correctly
				delete quote["+DI " + sd.name];
				delete quote["-DI " + sd.name];
			}
		}

	};

	CIQ.Studies.calculateRandomWalk=function(stx, sd){
		CIQ.Studies.calculateStudyATR(stx,sd);

		var quotes=sd.chart.scrubbed;
		var period=sd.days;

		for(var i=2;i<quotes.length;i++){
			var ttr=0;
			var high=quotes[i].High;
			var low=quotes[i].Low;
			var maxHigh=0;
			var maxLow=0;
			for(var j=1;j<=period;j++){
				if(i<=j) {
					maxHigh=maxLow=0;
					break;
				}
				ttr+=quotes[i-j]["True Range " + sd.name];
				var denom=((ttr/j) * Math.sqrt(j));
				if( denom ){ // skip if denominator is 0 --
					var cH=(high-quotes[i-j].Low)/denom;
					var cL=(quotes[i-j].High-low)/denom;
					maxHigh=Math.max(maxHigh,cH);
					maxLow=Math.max(maxLow,cL);
				}
			}
			quotes[i]["Random Walk High " + sd.name]=maxHigh;
			quotes[i]["Random Walk Low " + sd.name]=maxLow;
		}
	};

	CIQ.Studies.calculateChange=function(stx, sd){
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";
		var quotes=sd.chart.scrubbed;
	    for(var i=sd.days;i<quotes.length;i++){
			quotes[i]["Result " + sd.name]=quotes[i][field]-quotes[i-sd.days][field];
	    }
	};

	CIQ.Studies.calculateRateOfChange=function(stx, sd){
		var field=sd.inputs.Field;
		if(sd.name.indexOf("Vol ROC")===0) field="Volume";
		else if(!field || field=="field") field="Close";
		var name=sd.name;
		for(var p in sd.outputs){
			name=p + " " + name;
		}

		var offset=sd.inputs["Center Line"];
		if(!offset) offset=0;
		else offset=parseInt(offset,10);

		var quotes=sd.chart.scrubbed;
	    for(var i=sd.days;i<quotes.length;i++){
			if(sd.name.indexOf("Momentum")===0) quotes[i][name]=quotes[i][field]-quotes[i-sd.days][field] + offset;
			else {
				var denom=quotes[i-sd.days][field];
				if( denom ){ // skip if denominator is 0 --
					quotes[i][name]=100*((quotes[i][field]/denom)-1) + offset;
				}
			}
	    }
	};

	CIQ.Studies.calculateTypicalPrice=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var period=sd.days;
		var name=sd.name;
		for(var p in sd.outputs){
			name=p + " " + name;
		}
		var total=0;
		for(var i=0;i<quotes.length;i++){
			total+=quotes[i]["hlc/3"];
			if(i>=period) {
				total-=quotes[i-period]["hlc/3"];
				quotes[i][name]=total/period;
			}
		}
	};

	CIQ.Studies.calculateWeightedClose=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var period=sd.days;
		var name=sd.name;
		for(var p in sd.outputs){
			name=p + " " + name;
		}
		var total=0;
		for(var i=0;i<quotes.length;i++){
			total+=quotes[i]["hlcc/4"];
			if(i>=period) {
				total-=quotes[i-period]["hlcc/4"];
				quotes[i][name]=total/period;
			}
		}
	};

	CIQ.Studies.calculateElderRay=function(stx, sd){
		if (sd.days < 1 ) return;
		var quotes=sd.chart.scrubbed;
		CIQ.Studies.MA("exponential", sd.days, "Close", 0, "EMA", stx, sd);

	    for(var i=sd.days-1;i<quotes.length;i++){
			quotes[i][sd.name+"_hist1"]=quotes[i].High-quotes[i]["EMA "+sd.name];
			quotes[i][sd.name+"_hist2"]=quotes[i].Low-quotes[i]["EMA "+sd.name];
	    }
	};

	CIQ.Studies.calculateElderForce=function(stx, sd){
		var quotes=sd.chart.scrubbed;
	    for(var i=1;i<quotes.length;i++){
			quotes[i]["EF1 "+sd.name]=quotes[i].Volume*(quotes[i].Close-quotes[i-1].Close);
	    }
	    if(!sd.days) sd.days=13;
		CIQ.Studies.MA("exponential", sd.days, "EF1 "+sd.name, 0, "Result", stx, sd);
	};

	CIQ.Studies.calculateCenterOfGravity=function(stx, sd){
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";
		var quotes=sd.chart.scrubbed;
	    for(var i=sd.days-1;i<quotes.length;i++){
			var num=0,den=0;
	    	for(var j=0;j<sd.days;j++){
	    		num-=(j+1)*quotes[i-j][field];
	    		den+=quotes[i-j][field];
			}
	    	quotes[i]["Result "+sd.name]=num/den;
	    }
	};

	CIQ.Studies.calculateEaseOfMovement=function(stx, sd){
		var quotes=sd.chart.scrubbed;
	    for(var i=1;i<quotes.length;i++){
			var avgCurrent=(quotes[i].High + quotes[i].Low)/2;
			var avgPrior=(quotes[i-1].High + quotes[i-1].Low)/2;
			var dm=avgCurrent-avgPrior;
			var br=(quotes[i].Volume/100000000)/(quotes[i].High-quotes[i].Low);
	    	quotes[i]["EOM1 "+sd.name]=dm/br;
	    }
		CIQ.Studies.MA(sd.inputs["Moving Average Type"], sd.days, "EOM1 "+sd.name, 0, "Result", stx, sd);
	};

	CIQ.Studies.calculateChaikinVolatility=function(stx, sd){
		var quotes=sd.chart.scrubbed;
	    var i;
		for(i=0;i<quotes.length;i++){
	    	quotes[i]["High-Low " + sd.name]=quotes[i].High - quotes[i].Low;
	    }
		CIQ.Studies.MA(sd.inputs["Moving Average Type"], sd.days, "High-Low "+sd.name, 0, "MA", stx, sd);

		var roc=sd.inputs["Rate Of Change"];
		if(!roc) roc=sd.days;
	    for(i=roc;i<quotes.length;i++){
				if(!quotes[i-roc]["MA "+sd.name]) continue;
					quotes[i]["Result " + sd.name]=100*((quotes[i]["MA "+sd.name]/quotes[i-roc]["MA "+sd.name])-1);
	    }
	};

	CIQ.Studies.calculateChaikinMoneyFlow=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var sumMoneyFlow=0,sumVolume=0;
	    for(var i=0;i<quotes.length;i++){
	    	if(quotes[i].High==quotes[i].Low) quotes[i]["MFV " + sd.name]=0;
	    	else quotes[i]["MFV " + sd.name]=quotes[i].Volume*(2*quotes[i].Close-quotes[i].High-quotes[i].Low)/(quotes[i].High-quotes[i].Low);
		    sumMoneyFlow+=quotes[i]["MFV " + sd.name];
	    	sumVolume+=quotes[i].Volume;
	    	if(i>sd.days-1){
			    sumMoneyFlow-=quotes[i-sd.days]["MFV " + sd.name];
		    	sumVolume-=quotes[i-sd.days].Volume;
		    	if(sumVolume) quotes[i]["Result " + sd.name]=sumMoneyFlow/sumVolume;
	    	}
	    }
	};

	CIQ.Studies.calculateTwiggsMoneyFlow=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var sumMoneyFlow=0,sumVolume=0;
	    for(var i=1;i<quotes.length;i++){
	    	var trh=Math.max(quotes[i-1].Close,quotes[i].High);
	    	var trl=Math.min(quotes[i-1].Close,quotes[i].Low);
	    	quotes[i]["MFV " + sd.name]=quotes[i].Volume*(2*quotes[i].Close-trh-trl)/(trh-trl===0?999999:trh-trl);
	    	if(i>sd.days-1){
	    		sumMoneyFlow*=(sd.days-1)/sd.days;
		    	sumVolume*=(sd.days-1)/sd.days;
	    	}
		    sumMoneyFlow+=quotes[i]["MFV " + sd.name];
	    	sumVolume+=quotes[i].Volume;
	    	if(i>sd.days-1){
		    	if(sumVolume) quotes[i]["Result " + sd.name]=sumMoneyFlow/(sumVolume>0?sumVolume:999999);
	    	}
	    }
	};

	CIQ.Studies.calculateMassIndex=function(stx, sd){
		var quotes=sd.chart.scrubbed;
	    for(var i=0;i<quotes.length;i++){
	    	quotes[i]["High-Low " + sd.name]=quotes[i].High - quotes[i].Low;
	    }

		CIQ.Studies.MA("exponential", 9, "High-Low "+sd.name, 0, "EMA", stx, sd);
		CIQ.Studies.MA("exponential", 9, "EMA "+sd.name, 0, "EMA2", stx, sd);

		var total=0;
	    for(var j=17;j<quotes.length;j++){
	    	total+=quotes[j]["EMA "+sd.name]/quotes[j]["EMA2 "+sd.name];
	    	if(j>=17+sd.days-1){
	    		quotes[j]["Result " + sd.name]=total;
	    		total-=quotes[j-sd.days+1]["EMA "+sd.name]/quotes[j-sd.days+1]["EMA2 "+sd.name];
	    	}
	    }
	};

	CIQ.Studies.calculateMoneyFlowIndex=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var cumPosMF=0;
		var cumNegMF=0;
		var lastTypPrice=0;
		var directions=[];
	    for(var i=0;i<quotes.length;i++){
	    	var typPrice=(quotes[i].High + quotes[i].Low + quotes[i].Close)/3;
	    	if(i>0){
    			var rawMoneyFlow=typPrice*quotes[i].Volume;
	    		if(typPrice>lastTypPrice){
	    			directions.push([1,rawMoneyFlow]);
	    			cumPosMF+=rawMoneyFlow;
	    		}else if(typPrice<lastTypPrice){
	    			directions.push([-1,rawMoneyFlow]);
	    			cumNegMF+=rawMoneyFlow;
	    		}else{
	    			directions.push([0,0]);
	    		}
    			if(i>sd.days){
    				var old=directions.shift();
    				if(old[0]==1) cumPosMF-=old[1];
    				else if(old[0]==-1) cumNegMF-=old[1];
    				if(cumNegMF===0) quotes[i]["Result " + sd.name]=100;
    				else quotes[i]["Result " + sd.name]=100 - 100/(1 + (cumPosMF/cumNegMF));
    			}
	    	}
	    	lastTypPrice=typPrice;
	    }
	};

	CIQ.Studies.calculateChandeMomentum=function(stx, sd){
		var name=sd.name;
		for(var p in sd.outputs){
			name=p + " " + name;
		}
		var quotes=sd.chart.scrubbed;
		var sumMomentum=0,absSumMomentum=0;
		var history=[];
	    for(var i=1;i<quotes.length;i++){
	    	var diff=quotes[i].Close-quotes[i-1].Close;
	    	history.push(diff);
	    	sumMomentum+=diff;
	    	absSumMomentum+=Math.abs(diff);
	    	if(history.length==sd.days){
		    	quotes[i][name]=100*sumMomentum/absSumMomentum;
			    var old=history.shift();
		    	sumMomentum-=old;
		    	absSumMomentum-=Math.abs(old);
	    	}
	    }
	};

	CIQ.Studies.calculateChandeForecast=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";
		CIQ.Studies.MA("time series", sd.days, field, 0, "MA", stx, sd);
	    for(var i=1;i<quotes.length;i++){
		    quotes[i]["Result " + sd.name]=100*(1-(quotes[i]["MA "+sd.name]/quotes[i][field]));
	    }
	};

	CIQ.Studies.calculateDetrendedPrice=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";
		CIQ.Studies.MA(sd.inputs["Moving Average Type"], sd.days, field, 0, "MA", stx, sd);


	    for(var i=Math.floor(sd.days/2-1);i<quotes.length-Math.floor(sd.days/2+1);i++){
		    quotes[i]["Result " + sd.name]=quotes[i][field]-quotes[i+Math.floor(sd.days/2+1)]["MA "+sd.name];
	    }
	};

	CIQ.Studies.calculateAroon=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var daysSinceHigh=0,daysSinceLow=0;
		var xDayHigh=null,xDayLow=null;
		var j;
	    for(var i=0;i<quotes.length;i++){
	    	if(xDayHigh===null) xDayHigh=quotes[i].High;
	    	if(xDayLow===null) xDayLow=quotes[i].Low;
	    	xDayHigh=Math.max(xDayHigh,quotes[i].High);
	    	if(xDayHigh==quotes[i].High){
	    		daysSinceHigh=0;
	    	}else{
	    		daysSinceHigh++;
		    	if(daysSinceHigh>sd.days){
		    		xDayHigh=quotes[i].High;
		    		daysSinceHigh=0;
		    		for(j=1;j<=sd.days;j++){
		    			xDayHigh=Math.max(xDayHigh,quotes[i-j].High);
		    			if(xDayHigh==quotes[i-j].High){
		    				daysSinceHigh=j;
		    			}
		    		}
		    	}
	    	}
	    	xDayLow=Math.min(xDayLow,quotes[i].Low);
	    	if(xDayLow==quotes[i].Low){
	    		daysSinceLow=0;
	    	}else{
	    		daysSinceLow++;
		    	if(daysSinceLow>sd.days){
		    		xDayLow=quotes[i].Low;
		    		daysSinceLow=0;
		    		for(j=1;j<=sd.days;j++){
		    			xDayLow=Math.min(xDayLow,quotes[i-j].Low);
		    			if(xDayLow==quotes[i-j].Low){
		    				daysSinceLow=j;
		    			}
		    		}
		    	}
	    	}
	    	quotes[i]["Aroon Up " + sd.name]=100*(1-daysSinceHigh/sd.days);
	    	quotes[i]["Aroon Down " + sd.name]=100*(1-daysSinceLow/sd.days);
	    	quotes[i]["Aroon Oscillator " + sd.name]=quotes[i]["Aroon Up " + sd.name]-quotes[i]["Aroon Down " + sd.name];
	    }
	};

	CIQ.Studies.calculatePrimeNumber=function(stx, sd){
		var primes=[];
		function isPrime(x){
			if(x<=0) return false;
			else if(x!=Math.floor(x)) return false;
			//assume x is an int
			else if(primes[x]===true || primes[x]===false) return primes[x];
			var q = parseInt(Math.sqrt(x),10);
		    for (var i = 2; i <= q; i++){
		        if (x%i===0) {
		        	primes[x]=false;
		        	return false;
		        }
		    }
		    primes[x]=true;
		    return true;
		}
		var quotes=sd.chart.scrubbed;
	    for(var i=0;i<quotes.length;i++){
	    	var quote=quotes[i];
	    	if(!quote) continue;

	    	var high=quote.High;
	    	//high=Math.ceil(high);
	    	for(var h=0;high>0 && high<=10;h++) high*=10;
	    	if(isPrime(high)) high+=2;
	    	high=Math.ceil(high);
	    	if(high%2===0) high++;
	    	while(!isPrime(high)) high+=2;
	    	high/=Math.pow(10,h);

	    	var low=quote.Low;
	    	//low=Math.floor(low);
	    	for(var l=0;low>0 && low<=10;l++) low*=10;
	    	if(isPrime(low)) low-=2;
	    	low=Math.floor(low);
	    	if(low%2===0) low--;
	    	if(low>0){
		    	while(!isPrime(low)) low-=2;
		    	low/=Math.pow(10,l);
		    }

	        if(sd.type=="Prime Number Bands"){
	        	quote["Prime Bands Top " + sd.name]=high;
	        	quote["Prime Bands Bottom " + sd.name]=Math.max(0,low);
	        }else{
	        	var value=0;
	        	var tolerance=sd.inputs["Tolerance Percentage"]*(high-low)/100;
	        	var skew=high+low-2*quote.Close;
	        	if(skew<tolerance)
	        		value=1;
	        	else if(skew>tolerance)
	        		value=-1;
	        	if(value) quote["Result " + sd.name]=value;
	        }
	    }
	};

	CIQ.Studies.calculateVerticalHorizontalFilter=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		sd.mhml=new CIQ.Studies.StudyDescriptor(sd.name, sd.type, sd.panel);
		sd.mhml.chart=sd.chart;
		sd.mhml.days=sd.days;
		sd.mhml.inputs={};
		sd.mhml.outputs={"MHML":null};
		CIQ.Studies.calculateMaxHighMinLow(stx, sd.mhml);
	    var sumChanges=0;
	    var changes=[];
	    for(var i=1;i<quotes.length;i++){
	    	var change=Math.abs(quotes[i].Close-quotes[i-1].Close);
	    	changes.push(change);
	    	sumChanges+=change;
	    	if(i>=sd.days){
	    		quotes[i]["Result " + sd.name]=quotes[i]["MHML "+sd.name]/sumChanges;
	    		sumChanges-=changes.shift();
	    	}
	    }
	};

	CIQ.Studies.calculatePriceOscillator=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var field=sd.inputs.Field;
		var maType=sd.inputs["Moving Average Type"];
		if(!maType) maType="simple";
		if(!field || field=="field"){
			if(sd.parameters.isVolume) {
				field="Volume";
				maType="exponential";
			}
			else field="Close";
		}
		var pts=sd.inputs["Points Or Percent"];
		if(!pts) pts="Percent";

		CIQ.Studies.MA(maType, Number(sd.inputs["Short Cycle"]), field, 0, "Short MA", stx, sd);
		CIQ.Studies.MA(maType, Number(sd.inputs["Long Cycle"]), field, 0, "Long MA", stx, sd);

	    for(var i=Number(sd.inputs["Long Cycle"]);i<quotes.length;i++){
	    	var quote=quotes[i];
	    	if(!quote) continue;
	        if(pts=="Points") quote["Result " + sd.name]=quote["Short MA " + sd.name]-quote["Long MA " + sd.name];
	        else quote["Result " + sd.name]=100*((quote["Short MA " + sd.name]/quote["Long MA " + sd.name])-1);
	    }
	};

	CIQ.Studies.calculateKeltner=function(stx, sd){
		CIQ.Studies.MA(sd.inputs["Moving Average Type"], sd.days, "Close", 0, "MA", stx, sd);
		CIQ.Studies.calculateStudyATR(stx,sd);
		CIQ.Studies.calculateGenericEnvelope(stx, sd, sd.inputs.Shift, "MA "+sd.name, "ATR " + sd.name);
	};

	CIQ.Studies.calculateCoppock=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";

		var longDays=sd.inputs["Long RoC"];
		if(!longDays) longDays=14;
		var shortDays=sd.inputs["Short RoC"];
		if(!shortDays) shortDays=11;
		var period=sd.days;
		if(!period) period=10;
		if(longDays<shortDays) return;

	    for(var i=longDays;i<quotes.length;i++){
			var denom1=quotes[i-shortDays][field];
			var denom2=quotes[i-longDays][field];
			if( denom1 && denom2 ){ // skip if denominator is 0 --
				quotes[i]["Sum "+sd.name]=100*((quotes[i][field]/denom1)+(quotes[i][field]/denom2)-2);
			}
	    }

		CIQ.Studies.MA("weighted", period, "Sum "+sd.name, 0, "Result", stx, sd);
	};

	CIQ.Studies.calculateLinearRegressionIndicator=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";

		var sumWeights=sd.days*(sd.days+1)/2;
		var squaredSumWeights=Math.pow(sumWeights,2);
		var sumWeightsSquared=sumWeights*(2*sd.days+1)/3;

		var sumCloses=0;
		var sumWeightedCloses=0;
		var sumClosesSquared=0;
	    for(var i=0;i<quotes.length;i++){
	    	sumWeightedCloses+=sd.days*quotes[i][field]-sumCloses;
	    	sumCloses+=quotes[i][field];
	    	sumClosesSquared+=Math.pow(quotes[i][field],2);
	    	if(i<sd.days-1) continue;
	    	else if(i>sd.days-1) {
	    		sumCloses-=quotes[i-sd.days][field];
	    		sumClosesSquared-=Math.pow(quotes[i-sd.days][field],2);
	    	}
	    	var b=(sd.days*sumWeightedCloses-sumWeights*sumCloses)/(sd.days*sumWeightsSquared-squaredSumWeights);
			quotes[i]["Slope "+sd.name]=b;
	    	var a=(sumCloses-b*sumWeights)/sd.days;
			quotes[i]["Intercept "+sd.name]=a;
			quotes[i]["Forecast "+sd.name]=a+b*sd.days;
	    	var c=(sd.days*sumWeightsSquared-squaredSumWeights)/(sd.days*sumClosesSquared-Math.pow(sumCloses,2));
			quotes[i]["RSquared "+sd.name]=b*b*c;
	    }
	};

	// Old version of study had outputs "Bollinger Band ...", this will convert to new "Bollinger Bands ..."
	CIQ.Studies.convertOldBollinger=function(stx, type, inputs, outputs, parameters, panel){
		for(var o in outputs){
			if(o.indexOf("Bands")>0) break;  //new way already
			outputs[o.replace(/ Band /," Bands ")]=outputs[o];
			delete outputs[o];
		}
		return CIQ.Studies.initializeFN(stx, type, inputs, outputs, parameters, panel);
	};

	CIQ.Studies.calculateBollinger=function(stx, sd){
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";

		CIQ.Studies.MA(sd.inputs["Moving Average Type"], sd.days, field, 0, "MA", stx, sd);

		sd.std=new CIQ.Studies.StudyDescriptor(sd.name, "STD Dev", sd.panel);
		sd.std.chart=sd.chart;
		sd.std.days=sd.days;
		sd.std.inputs={"Field":field, "Standard Deviations":1, "Type":sd.inputs["Moving Average Type"]};
		sd.std.outputs={"STD Dev":null};
		CIQ.Studies.calculateStandardDeviation(stx,sd.std);

		CIQ.Studies.calculateGenericEnvelope(stx, sd, sd.inputs["Standard Deviations"], "MA "+sd.name, "STD Dev "+sd.name);
		if(sd.type=="Boll %b") sd.zoneOutput="%b";
	};

	CIQ.Studies.calculateMAEnvelope=function(stx, sd){
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";
		CIQ.Studies.MA(sd.inputs["Moving Average Type"], sd.days, field, 0, "MA", stx, sd);
		var shiftType=sd.inputs["Shift Type"];
		var shift=sd.inputs.Shift;
		if(!shiftType){//legacy
			shiftType="percent";
			shift=sd.inputs["Shift Percentage"];
		}
		if(shiftType=="percent"){
			CIQ.Studies.calculateGenericEnvelope(stx, sd, shift/100, "MA "+sd.name);
		}else if(shiftType=="points"){
			CIQ.Studies.calculateGenericEnvelope(stx, sd, null, "MA "+sd.name, null, Number(shift));
		}
	};

	/**
	 * Calculate function for preparing data to be used by displayChannel().
	 * Inserts the following fields in the dataSet:
	 * <code>
	 * quote[sd.type + " Top " + sd.name]=quote[centerIndex]+totalShift;<br>
	 * quote[sd.type + " Bottom " + sd.name]=quote[centerIndex]-totalShift;<br>
	 * quote[sd.type + " Median " + sd.name]=quote[centerIndex];<br>
	 * quote["Bandwidth " + sd.name]=200*totalShift/quote[centerIndex];<br>
	 * quote["%b " + sd.name]=50*((quote.Close-quote[centerIndex])/totalShift+1);<br>
	 * </code>
	 * Example: 'Prime Bands' + ' Top ' +  'Prime Number Bands (true)'.
	 * @param  {CIQ.ChartEngine} stx Chart object
	 * @param  {object} sd  Study Descriptor
	 * @param  {object} percentShift Used to calculate totalShift. Defaults to 0 (zero)
	 * @param  {object} centerIndex  Quote element to use for center series (Open, Close, High, Low). Defaults to "Close"
	 * @param  {object} offsetIndex  Quote element to use for calculating totalShift (percentShift*quote[offsetIndex]+pointShift;)
	 * @param  {object} pointShift   Used to calculate totalShift.Defaults to 0 (zero)
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.calculateGenericEnvelope=function(stx, sd, percentShift, centerIndex, offsetIndex, pointShift){
		if(!percentShift) percentShift=0;
		if(!pointShift) pointShift=0;
		if(!offsetIndex) offsetIndex="Close";
		if(!centerIndex) centerIndex="Close";
		var quotes=sd.chart.scrubbed;
	    for(var i=0;quotes && i<quotes.length;i++){
	    	var quote=quotes[i];
	    	if(!quote) continue;
			if(!quote[centerIndex]) continue;
			var totalShift=percentShift*quote[offsetIndex]+pointShift;
	        quote[sd.type + " Top " + sd.name]=quote[centerIndex]+totalShift;
	        quote[sd.type + " Bottom " + sd.name]=quote[centerIndex]-totalShift;
	        quote[sd.type + " Median " + sd.name]=quote[centerIndex];
	        quote["Bandwidth " + sd.name]=200*totalShift/quote[centerIndex];
	        quote["%b " + sd.name]=50*((quote.Close-quote[centerIndex])/totalShift+1);
	    }
	};

	CIQ.Studies.calculateMaxHighMinLow=function(stx, sd){
		var quotes=sd.chart.scrubbed;

		var low=-1,high=-1;
	    for(var i=0;i<quotes.length;i++){
	        var period=sd.days;
        	high=Math.max(high==-1?quotes[i].High:high,quotes[i].High);
	        low=Math.min(low==-1?quotes[i].Low:low,quotes[i].Low);
	        if(sd.inputs["High Period"]) period=sd.inputs["High Period"];
	        var j;
	        if(i>=period){
	        	if((quotes[i-period].High)==high){
	        		high=quotes[i].High;
	        		for(j=1;j<period;j++){
	        			high=Math.max(high,quotes[i-j].High);
	        		}
	        	}
	        }
	        if(sd.inputs["Low Period"]) period=sd.inputs["Low Period"];
		    if(i>=period){
	        	if((quotes[i-period].Low)==low){
	        		low=quotes[i].Low;
	        		for(j=1;j<period;j++){
	        			low=Math.min(low,quotes[i-j].Low);
	        		}
	        	}
	        }
	        var result=0;
	        if(sd.type=="HHV"){
	        	result=high;
	        }else if(sd.type=="LLV"){
	        	result=low;
	        }else if(sd.type=="Donchian Width"){
	        	result=high-low;
	        }else if(sd.type=="GAPO" || sd.type=="Gopala"){
	        	result=Math.log(high-low)/Math.log(period);
	        }else if(sd.type=="VT HZ Filter"){
	        	result=high-low;
		        quotes[i]["MHML "+sd.name]=result;
		        continue;
	        }else if(sd.type=="Williams %R"){
	        	result=-100*(high-quotes[i].Close)/(high-low);
		        quotes[i]["Result " + sd.name]=result;
		        continue;
	        }
	    	if(i==quotes.length-1) break;

	        if(sd.type=="Donchian Channel"){
		        quotes[i+1]["Donchian High " + sd.name]=high;
		        quotes[i+1]["Donchian Low " + sd.name]=low;
		        quotes[i+1]["Donchian Median " + sd.name]=(high+low)/2;
	        }else{  //width
		        quotes[i+1]["Result " + sd.name]=result;
	        }
	    }
	};

	CIQ.Studies.calculateAccumulationDistribution=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var total=0;
	    for(var i=1;i<quotes.length;i++){
	    	var quote=quotes[i];
	    	var yClose=quotes[i-1].Close;
	    	if(!quote) continue;
	    	var todayAD=0;
	    	if(quote.Close>yClose){
	    		todayAD=quote.Close-Math.min(quote.Low,yClose);
	    	}else if(quote.Close<yClose){
	    		todayAD=quote.Close-Math.max(quote.High,yClose);
	    	}
	    	if(sd.inputs["Use Volume"]) todayAD*=quote.Volume;
        	total+=todayAD;
        	quote["Result " + sd.name]=total;
	    }
	};

	CIQ.Studies.calculateCCI=function(stx, sd){
		var quotes=sd.chart.scrubbed;

		CIQ.Studies.MA("simple", sd.days, "hlc/3", 0, "MA", stx, sd);

	    for(var i=sd.days-1;i<quotes.length;i++){
	    	var quote=quotes[i];
	    	if(!quote) continue;
			var md=0;
			for(var j=0;j<sd.days;j++){
				md+=Math.abs(quotes[i-j]["hlc/3"] - quote["MA " + sd.name]);
			}
			md/=sd.days;
	        quote["Result " + sd.name]=(quote["hlc/3"] - quote["MA " + sd.name]) / (0.015 * md);
	    }
	};

	CIQ.Studies.calculateFractalChaos=function(stx, sd){
		var quotes=sd.chart.scrubbed;

		var fractalHigh=0;
		var fractalLow=0;
		var test=0;
	    for(var i=4;i<quotes.length;i++){
	    	quotes[i]["Result " + sd.name]=0;
	    	var j;
	    	test=0;
	    	for(j=0;j<=i;j++){
	    		if(!quotes[i-j]) break;
	    		if(quotes[i-j].High>quotes[i-2].High) break;
	    		if(j<2 && quotes[i-j].High==quotes[i-2].High) break;
	    		if(quotes[i-j].High<quotes[i-2].High) test++;
	    		if(test==4) {
	    			fractalHigh=quotes[i-2].High;
	    			break;
	    		}
	    	}
	        if(sd.type=="Fractal Chaos Bands"){
	        	quotes[i]["Fractal High " + sd.name]=fractalHigh>0?fractalHigh:null;
	        }else if(test==4){ //oscillator
	        	quotes[i]["Result " + sd.name]=1;
	        }
	        test=0;
	    	for(j=0;j<=i;j++){
	    		if(!quotes[i-j]) break;
	    		if(quotes[i-j].Low<quotes[i-2].Low) break;
	    		if(j<2 && quotes[i-j].Low==quotes[i-2].Low) break;
	    		if(quotes[i-j].Low>quotes[i-2].Low) test++;
	    		if(test==4) {
	    			fractalLow=quotes[i-2].Low;
	    			break;
	    		}
	    	}
	        if(sd.type=="Fractal Chaos Bands"){
			    quotes[i]["Fractal Low " + sd.name]=fractalLow>0?fractalLow:null;
	        }else if(test==4){ //oscillator
	        	quotes[i]["Result " + sd.name]=-1;
	        }
	    }
	};

	CIQ.Studies.displayPrettyGoodOscillator=function(stx, sd, quotes){
		CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);

		var low=-3;
		var high=3;

		var panel=stx.panels[sd.panel];
		var color=stx.chart.context.strokeStyle;

		stx.chart.context.globalAlpha=0.2;
		stx.chart.context.strokeStyle=sd.outputs.Result;

		stx.chart.context.beginPath();
		var ph=stx.pixelFromPrice(high,panel);
		stx.chart.context.moveTo(0,ph);
		stx.chart.context.lineTo(stx.chart.width,ph);

		pl=stx.pixelFromPrice(low,panel);
		stx.chart.context.moveTo(0,pl);
		stx.chart.context.lineTo(stx.chart.width,pl);
		stx.chart.context.stroke();
		stx.chart.context.closePath();

		CIQ.preparePeakValleyFill(stx,quotes,{panelName:sd.panel, band:"Result " + sd.name, threshold:high, direction:1, color:sd.outputs.Result});
		CIQ.preparePeakValleyFill(stx,quotes,{panelName:sd.panel, band:"Result " + sd.name, threshold:low, direction:-1, color:sd.outputs.Result});

		stx.chart.context.strokeStyle=color;
		stx.chart.context.globalAlpha=1;
	};
	CIQ.Studies.displayRAVI=function(stx, sd, quotes){
		var i;
		for(i=0;i<quotes.length;i++){
			if(!quotes[i]) continue;
			quotes[i][sd.name+"_hist"]=quotes[i]["Result "+sd.name];
			//delete quotes[i]["Result "+sd.name];
		}
		CIQ.Studies.determineMinMax(stx, sd, quotes);
		var panel = stx.panels[sd.panel];
		panel.yAxis.low=panel.min=Math.min(0,panel.min);
		panel.yAxis.high=panel.max=Math.max(0,panel.max);
		CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);

		var y=stx.pixelFromPrice(0, panel);

		var myWidth=stx.layout.candleWidth-2;
		if(myWidth<2) myWidth=1;

		var upColor=sd.outputs["Increasing Bar"];
		var downColor=sd.outputs["Decreasing Bar"];
		stx.canvasColor("stx_histogram");
		stx.chart.context.globalAlpha=1;
		stx.startClip(sd.panel);
		for(i=0;i<quotes.length;i++){
			var quote=quotes[i];
			if(!quote || !quotes[i-1]) continue;
			var overBought=0, overSold=0;
			if(sd.parameters && sd.parameters.studyOverZonesEnabled){
				overBought=parseFloat(sd.parameters.studyOverBoughtValue);
				overSold=parseFloat(sd.parameters.studyOverSoldValue);
			}
			if(i===0) stx.chart.context.fillStyle="#CCCCCC";
			else if(quote[sd.name+"_hist"]>overBought && quotes[i-1][sd.name+"_hist"]<quote[sd.name+"_hist"]) stx.chart.context.fillStyle=upColor;
			else if(quote[sd.name+"_hist"]<overSold && quotes[i-1][sd.name+"_hist"]>quote[sd.name+"_hist"]) stx.chart.context.fillStyle=downColor;
			else stx.chart.context.fillStyle="#CCCCCC";
			if(quote.candleWidth) myWidth=Math.floor(Math.max(1,quote.candleWidth-2));
			stx.chart.context.fillRect(Math.floor(stx.pixelFromBar(i, panel.chart)-myWidth/2),
					Math.floor(y),
					Math.floor(myWidth),
					Math.floor(stx.pixelFromPrice(quote[sd.name+"_hist"], panel)-y));
		}
		stx.endClip();
	};

	CIQ.Studies.displayElderForce=function(stx, sd, quotes){
		CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);
		CIQ.preparePeakValleyFill(stx,quotes,{panelName:sd.panel, band:"Result " + sd.name, threshold:0, direction:1, color:sd.outputs.Result});
		CIQ.preparePeakValleyFill(stx,quotes,{panelName:sd.panel, band:"Result " + sd.name, threshold:0, direction:-1, color:sd.outputs.Result});
	};

	CIQ.Studies.displayElderRay=function(stx, sd, quotes){
		CIQ.Studies.determineMinMax(stx, sd, quotes);
		var panel = stx.panels[sd.panel];
		panel.yAxis.low=panel.min=Math.min(0,panel.min);
		panel.yAxis.high=panel.max=Math.max(0,panel.max);
		CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);

		var y=stx.pixelFromPrice(0, panel);

		var myWidth=stx.layout.candleWidth-2;
		if(myWidth<2) myWidth=1;
		function drawBar(i,reduction,output,hist){
			stx.chart.context.fillStyle=sd.outputs[output];
			stx.chart.context.fillRect(Math.floor(stx.pixelFromBar(i, panel.chart)-myWidth/2+myWidth*reduction),
					Math.floor(y),
					Math.floor(myWidth*(1-2*reduction)),
					Math.floor(stx.pixelFromPrice(quote[sd.name+hist], panel)-y));
		}

		stx.canvasColor("stx_histogram");
		var fillStyle=stx.chart.context.fillStyle;
		stx.chart.context.globalAlpha=1;
		stx.startClip(sd.panel);
		for(var i=0;i<quotes.length;i++){
			var quote=quotes[i];
			if(!quote) continue;
			if(quote.candleWidth) myWidth=Math.floor(Math.max(1,quote.candleWidth-2));
			if(quote[sd.name+"_hist1"]>0) drawBar(i,0,"Elder Bull Power","_hist1");
			if(quote[sd.name+"_hist2"]<0) drawBar(i,0,"Elder Bear Power","_hist2");
			if(quote[sd.name+"_hist1"]<0) drawBar(i,0.1,"Elder Bull Power","_hist1");
			if(quote[sd.name+"_hist2"]>0) drawBar(i,0.1,"Elder Bear Power","_hist2");
		}
		stx.endClip();
		stx.chart.context.fillStyle=fillStyle;
	};

	CIQ.Studies.displayADX=function(stx, sd, quotes){
		CIQ.Studies.createYAxis(stx, sd, quotes, stx.panels[sd.panel]);
		if(sd.inputs.Series && sd.inputs.Shading){
			var parameters={
				topBand: "+DI " + sd.name,
				bottomBand: "-DI " + sd.name
			};
	        stx.chart.context.globalAlpha=0.3;
			CIQ.fillIntersecting(stx, sd, quotes, parameters);
	        stx.chart.context.globalAlpha=1;
		}
		var opacity=sd.inputs.Series?0.4:1;
		if(sd.inputs.Histogram) CIQ.Studies.createHistogram(stx, sd, quotes, false, opacity);
		if(sd.inputs.Series!==false) CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);
		else if(!sd.inputs.Series && !sd.inputs.Histogram)
			stx.watermark(sd.panel,"center","bottom",stx.translateIf("Nothing to display"));

	};

	CIQ.Studies.displayMassIndex=function(stx, sd, quotes){
		CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);

		var bulge=sd.inputs["Bulge Threshold"];

		var panel=stx.panels[sd.panel];
		var color=stx.chart.context.strokeStyle;

		stx.chart.context.globalAlpha=0.2;
		stx.chart.context.strokeStyle=sd.outputs.Result;

		stx.chart.context.beginPath();
		var p=stx.pixelFromPrice(bulge,panel);
		stx.chart.context.moveTo(0,p);
		stx.chart.context.lineTo(stx.chart.width,p);
		stx.chart.context.stroke();
		stx.chart.context.closePath();

		CIQ.preparePeakValleyFill(stx,quotes,{panelName:sd.panel, band:"Result " + sd.name, threshold:bulge, direction:1, color:sd.outputs.Result});

		stx.chart.context.strokeStyle=color;
		stx.chart.context.globalAlpha=1;
	};

	/**
	 * Rendering function for displaying a Channel study output composed of top, middle and bottom lines.
	 *
	 * Requires study library input of <code>"Channel Fill":true</code> to determine if the area within the channel is to be shaded.
	 * Shading will be done using the "xxxxx Channel" or "xxxxx Median" color defined in the outputs parameter of the study library.
	 *
	 * Requires study library outputs to have fields in the format of :
	 * - 'xxxxx Top' or 'xxxxx High' for the top band,
	 * - 'xxxxx Bottom' or 'xxxxx Low' for the bottom band and
	 * - 'xxxxx Median' or 'xxxxx Channel' for the middle line.
	 *
	 * It expects 'quotes' to have fields for each series in the channel with keys in the following format:
	 * - study-output-name ( from study library) + " " + sd.name.
	 * - Example: 'Prime Bands Top'+ ' ' +  'Prime Number Bands (true)'. Which equals : 'Prime Bands Top Prime Number Bands (true)'
	 *
	 * @param  {CIQ.ChartEngine} stx Chart object
	 * @param  {object} sd  Study Descriptor
	 * @param {array} quotes The array of quotes needed to render the channel
	 * @memberOf CIQ.Studies
	 * @example
	 * "inputs": {"Period":5, "Shift": 3, "Field":"field", "Channel Fill":true}
	 * "outputs": {"Prime Bands Top":"red", "Prime Bands Bottom":"auto", "Prime Bands Channel":"rgb(184,44,11)"}
	 */
	CIQ.Studies.displayChannel=function(stx, sd, quotes){
		CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);
		if(sd.inputs["Channel Fill"]) {
			var parameters={panelName: sd.panel};
			for(var p in sd.outputs){
				var lastWord=p.split(" ").pop();
				if(lastWord=="Top" || lastWord=="High"){
					parameters.topBand=p + " " + sd.name;
				}else if(lastWord=="Bottom" || lastWord=="Low"){
					parameters.bottomBand=p + " " + sd.name;
				}else if(lastWord=="Median" || lastWord=="Channel"){
					parameters.color=sd.outputs[p];
				}
			}
			CIQ.prepareChannelFill(stx,quotes,parameters);
		}
	};

	
	CIQ.Studies.inputAttributeDefaultGenerator=function(value){
		if(!value && value!==0) return {};
		if(value.constructor==Number){
			if(Math.floor(value)==value){ //Integer
				if(value>0) return {min:1, step:1};  //positive
				else return {step:1};   //full range
			}else{ //Decimal
				if(value>0) return {min:0, step:0.01};  //positive
				else return {step:0.01};  //full range
			}
		}
		return {};
	};
	
	/**
	 * The studyLibrary defines all of the available studies. This is used to drive the dialog boxes and creation of the studies. When you
	 * create a custom study you should add it to the studyLibrary.
	 * 
	 * You can also alter study defaults by overriding the different elements on each definition. 
	 * For example, if you wanted to change the default colors for the volume underlay,
	 * you would add the following code in your files; making sure your files are loaded **after** the library js files -- not before:
	 * ```
	 * CIQ.Studies.studyLibrary["vol undr"].outputs= {"Up Volume":"blue","Down Volume":"yellow"};
	 * ```
	 * See {@tutorial Custom Studies} for complete details
	 * @type {Object}
	 * @memberOf CIQ.Studies
	 * @example
	 * "RAVI": {
			"name": "RAVI",
			"seriesFN": CIQ.Studies.displayRAVI,
			"calculateFN": CIQ.Studies.calculatePriceOscillator,
			"inputs": {"Field":"field", "Short Cycle":7, "Long Cycle":65},
			"outputs": {"Increasing Bar":"#00DD00", "Decreasing Bar":"#FF0000"},
			"parameters": {
				template:"studyOverZones",
				init:{studyOverZonesEnabled:true, studyOverBoughtValue:3, studyOverBoughtColor:"auto", studyOverSoldValue:-3, studyOverSoldColor:"auto"}
			},
			"attributes":{"Short Cycle":{"min":1,"max":999,step:"1"}}
		},
	 */
	CIQ.Studies.studyLibrary={
		"rsi": {
			"name": "RSI",
			"inputs": {"Period":14},
			"calculateFN": CIQ.Studies.calculateRSI,
			"range": "0 to 100",
			"outputs":{"RSI":"auto"},
			"parameters": {
				template:"studyOverZones",
				init:{studyOverZonesEnabled:true, studyOverBoughtValue:80, studyOverBoughtColor:"auto", studyOverSoldValue:20, studyOverSoldColor:"auto"}
			}
		},
		"ma": {
			"name": "Moving Average",
			"overlay": true,
			"range": "bypass",
			"calculateFN": CIQ.Studies.calculateMovingAverage,
			"inputs": {"Period":50,"Field":"field","Type":"ma","Offset":0, "Underlay": false},
			"outputs": {"MA":"#FF0000"}
		},
		"macd": {
			"name": "MACD",
			"calculateFN": CIQ.Studies.calculateMACD,
			"seriesFN": CIQ.Studies.displayHistogramWithSeries,
			"inputs": {"Fast MA Period":12,"Slow MA Period":26,"Signal Period":9},
			"outputs":{"MACD":"auto", "Signal":"#FF0000", "Increasing Bar":"#00DD00", "Decreasing Bar":"#FF0000"}
		},
		"stochastics": {
			"name": "Stochastics",
			"range": "0 to 100",
			"initializeFN": CIQ.Studies.initializeStochastics,
			"calculateFN": CIQ.Studies.calculateStochastics,
			"inputs": {"Period":14,"Smooth":true},
			"outputs":{"Fast":"auto", "Slow":"#FF0000"},
			"parameters": {
				template:"studyOverZones",
				init:{studyOverZonesEnabled:true, studyOverBoughtValue:80, studyOverBoughtColor:"auto", studyOverSoldValue:20, studyOverSoldColor:"auto"}
			}
		},
		"Aroon": {
			"name": "Aroon",
			"range": "0 to 100",
			"calculateFN": CIQ.Studies.calculateAroon,
			"outputs":{"Aroon Up":"#00DD00", "Aroon Down":"#FF0000"}
		},
		"Aroon Osc": {
			"name": "Aroon Oscillator",
			"calculateFN": CIQ.Studies.calculateAroon,
			"outputs":{"Aroon Oscillator":"auto"}
		},
		"Lin R2": {
			"name": "Linear Reg R2",
			"calculateFN": CIQ.Studies.calculateLinearRegressionIndicator,
			"inputs": {"Period":14,"Field":"field"},
			"outputs":{"RSquared":"auto"}
		},
		"Lin Fcst": {
			"name": "Linear Reg Forecast",
			"overlay": true,
			"calculateFN": CIQ.Studies.calculateLinearRegressionIndicator,
			"inputs": {"Period":14,"Field":"field"},
			"outputs":{"Forecast":"auto"}
		},
		"Lin Incpt": {
			"name": "Linear Reg Intercept",
			"overlay": true,
			"calculateFN": CIQ.Studies.calculateLinearRegressionIndicator,
			"inputs": {"Period":14,"Field":"field"},
			"outputs":{"Intercept":"auto"}
		},
		"Time Fcst": {
			"name": "Time Series Forecast",
			"overlay": true,
			"calculateFN": CIQ.Studies.calculateLinearRegressionIndicator,
			"inputs": {"Period":14,"Field":"field"},
			"outputs":{"Forecast":"auto"}
		},
		"VT HZ Filter": {
			"name": "Vertical Horizontal Filter",
			"calculateFN": CIQ.Studies.calculateVerticalHorizontalFilter,
			"inputs": {"Period":28}
		},
		"TRIX": {
			"name": "TRIX",
			"calculateFN": CIQ.Studies.calculateTRIX
		},
		"STD Dev": {
			"name": "Standard Deviation",
			"calculateFN": CIQ.Studies.calculateStandardDeviation,
			"inputs": {"Period":14,"Field":"field", "Standard Deviations":2, "Moving Average Type":"ma"},
			"attributes": {
				"Standard Deviations":{min:0.1,step:0.1}
			}
		},
		"Trade Vol": {
			"name": "Trade Volume Index",
			"calculateFN": CIQ.Studies.calculateOnBalanceVolume,
			"inputs": {"Min Tick Value":0.5}
		},
		"Swing": {
			"name": "Swing Index",
			"calculateFN": CIQ.Studies.calculateSwingIndex,
			"inputs": {"Limit Move Value":0.5}
		},
		"Acc Swing": {
			"name": "Accumulative Swing Index",
			"calculateFN": CIQ.Studies.calculateSwingIndex,
			"inputs": {"Limit Move Value":0.5}
		},
		"Price ROC": {
			"name": "Price Rate of Change",
			"calculateFN": CIQ.Studies.calculateRateOfChange,
			"inputs": {"Field":"field","Period":14}
		},
		"Vol ROC": {
			"name": "Volume Rate of Change",
			"calculateFN": CIQ.Studies.calculateRateOfChange
		},
		"Momentum": {
			"name": "Momentum Indicator",
			"calculateFN": CIQ.Studies.calculateRateOfChange,
			"inputs": {"Period":14},
			"centerline": 0
		},
		"Price Vol": {
			"name": "Price Volume Trend",
			"calculateFN": CIQ.Studies.calculatePriceVolumeTrend,
			"inputs": {"Field":"field"}
		},
		"Pos Vol": {
			"name": "Positive Volume Index",
			"calculateFN": CIQ.Studies.calculateVolumeIndex,
			"inputs": {"Field":"field","Moving Average Type":"ma","Period":255},
			"outputs": {"Index":"auto","MA":"#FF0000"}
		},
		"Neg Vol": {
			"name": "Negative Volume Index",
			"calculateFN": CIQ.Studies.calculateVolumeIndex,
			"inputs": {"Field":"field","Moving Average Type":"ma","Period":255},
			"outputs": {"Index":"auto","MA":"#FF0000"}
		},
		"On Bal Vol": {
			"name": "On Balance Volume",
			"calculateFN": CIQ.Studies.calculateOnBalanceVolume,
			"inputs": {}
		},
		"Stch Mtm": {
			"name": "Stochastic Momentum Index",
			"calculateFN": CIQ.Studies.calculateStochMomentum,
			"inputs": {"%K Periods":10,"%K Smoothing Periods":3, "%K Double Smoothing Periods":3, "%D Periods":10, "%D Moving Average Type":"ema"},
			"outputs":{"%K":"auto", "%D":"#FF0000"},
			"parameters": {
				template:"studyOverZones",
				init:{studyOverZonesEnabled:true, studyOverBoughtValue:40, studyOverBoughtColor:"auto", studyOverSoldValue:-40, studyOverSoldColor:"auto"}
			}
		},
		"Hist Vol": {
			"name": "Historical Volatility",
			"calculateFN": CIQ.Studies.calculateHistoricalVolatility,
			"inputs": {"Field":"field", "Period":10, "Days Per Year":[252,365], "Standard Deviations":1},
			"attributes": {
				"Standard Deviations":{min:0.1,step:0.1}
			}
		},
		"Pretty Good": {
			"name": "Pretty Good Oscillator",
			"seriesFN": CIQ.Studies.displayPrettyGoodOscillator,
			"calculateFN": CIQ.Studies.calculatePrettyGoodOscillator
		},
		"Ultimate": {
			"name": "Ultimate Oscillator",
			"calculateFN": CIQ.Studies.calculateUltimateOscillator,
			"inputs": {"Cycle 1":7, "Cycle 2":14, "Cycle 3":28},
			"parameters": {
				template:"studyOverZones",
				init:{studyOverZonesEnabled:true, studyOverBoughtValue:70, studyOverBoughtColor:"auto", studyOverSoldValue:30, studyOverSoldColor:"auto"}
			}
		},
		"Vol Osc": {
			"name": "Volume Oscillator",
			"calculateFN": CIQ.Studies.calculatePriceOscillator,
			"inputs": {"Short Cycle":12, "Long Cycle":26, "Points Or Percent":["Points","Percent"]},
			"parameters": {
				init:{isVolume:true}
			}
		},
		"Twiggs": {
			"name": "Twiggs Money Flow",
			"calculateFN": CIQ.Studies.calculateTwiggsMoneyFlow,
			"inputs":{"Period":21}
		},
		"Chaikin MF": {
			"name": "Chaikin Money Flow",
			"calculateFN": CIQ.Studies.calculateChaikinMoneyFlow,
			"inputs":{"Period":20}
		},
		"Chaikin Vol": {
			"name": "Chaikin Volatility",
			"calculateFN": CIQ.Studies.calculateChaikinVolatility,
			"inputs": {"Period":14, "Rate Of Change":2, "Moving Average Type":"ma"}
		},
		"Price Osc": {
			"name": "Price Oscillator",
			"calculateFN": CIQ.Studies.calculatePriceOscillator,
			"inputs": {"Field":"field", "Long Cycle":26, "Short Cycle":12, "Moving Average Type":"ema", "Points Or Percent":["Points","Percent"]}
		},
		"EOM": {
			"name": "Ease of Movement",
			"calculateFN": CIQ.Studies.calculateEaseOfMovement,
			"inputs": {"Period":14, "Moving Average Type":"ma"}
		},
		"CCI": {
			"name": "Commodity Channel Index",
			"calculateFN":  CIQ.Studies.calculateCCI,
			"inputs": {"Period":20},
			"parameters": {
				template:"studyOverZones",
				init:{studyOverZonesEnabled:true, studyOverBoughtValue:100, studyOverBoughtColor:"auto", studyOverSoldValue:-100, studyOverSoldColor:"auto"}
			}
		},
		"Detrended": {
			"name": "Detrended Price Oscillator",
			"calculateFN": CIQ.Studies.calculateDetrendedPrice,
			"inputs": {"Field":"field","Period":14, "Moving Average Type":"ma"}
		},
		"True Range": {
			"name": "True Range",
			"calculateFN": CIQ.Studies.calculateStudyATR,
			"inputs": {},
			"outputs":{"True Range":"auto"}
		},
		"ATR": {
			"name": "Average True Range",
			"calculateFN": CIQ.Studies.calculateStudyATR,
			"outputs":{"ATR":"auto"}
		},
		"Ehler Fisher": {
			"name": "Ehler Fisher Transform",
			"calculateFN": CIQ.Studies.calculateEhlerFisher,
			"inputs": {"Period":10},
			"outputs":{"EF":"auto", "EF Trigger":"#FF0000"}
		},
		"Schaff": {
			"name": "Schaff Trend Cycle",
			"range": "0 to 100",
			"calculateFN": CIQ.Studies.calculateSchaff,
			"inputs": {"Field":"field","Period":10, "Short Cycle":23, "Long Cycle":50, "Moving Average Type":"ema"},
			"parameters": {
				template:"studyOverZones",
				init:{studyOverZonesEnabled:true, studyOverBoughtValue:75, studyOverBoughtColor:"auto", studyOverSoldValue:25, studyOverSoldColor:"auto"}
			}
		},
		"QStick": {
			"name": "",
			"calculateFN": CIQ.Studies.calculateQStick,
			"inputs": {"Period":8, "Moving Average Type":"ma"}
		},
		"Coppock": {
			"name": "Coppock Curve",
			"calculateFN": CIQ.Studies.calculateCoppock,
			"inputs": {"Field":"field","Short RoC":11,"Long RoC":14,"Period":10}
		},
		"Chande Mtm": {
			"name": "Chande Momentum Oscillator",
			"calculateFN": CIQ.Studies.calculateChandeMomentum,
			"inputs": {"Period":9},
			"parameters": {
				template:"studyOverZones",
				init:{studyOverZonesEnabled:true, studyOverBoughtValue:50, studyOverBoughtColor:"auto", studyOverSoldValue:-50, studyOverSoldColor:"auto"}
			}
		},
		"Chande Fcst": {
			"name": "Chande Forecast Oscillator",
			"calculateFN": CIQ.Studies.calculateChandeForecast,
			"inputs": {"Field":"field", "Period":14}
		},
		"Intraday Mtm": {
			"name": "Intraday Momentum Index",
			"calculateFN": CIQ.Studies.calculateIntradayMomentum,
			"inputs": {"Period":20},
			"parameters": {
				template:"studyOverZones",
				init:{studyOverZonesEnabled:true, studyOverBoughtValue:70, studyOverBoughtColor:"auto", studyOverSoldValue:30, studyOverSoldColor:"auto"}
			}
		},
		"RAVI": {
			"name": "RAVI",
			"seriesFN": CIQ.Studies.displayRAVI,
			"calculateFN": CIQ.Studies.calculatePriceOscillator,
			"inputs": {"Field":"field", "Moving Average Type":"vdma", "Short Cycle":7, "Long Cycle":65},
			"outputs": {"Increasing Bar":"#00DD00", "Decreasing Bar":"#FF0000"},
			"parameters": {
				template:"studyOverZones",
				init:{studyOverZonesEnabled:true, studyOverBoughtValue:3, studyOverBoughtColor:"auto", studyOverSoldValue:-3, studyOverSoldColor:"auto"}
			}
		},
		"Random Walk": {
			"name": "Random Walk Index",
			"calculateFN": CIQ.Studies.calculateRandomWalk,
			"outputs": {"Random Walk High":"#FF0000", "Random Walk Low":"#0000FF"}
		},
		"ADX": {
			"name": "ADX/DMS",
			"calculateFN": CIQ.Studies.calculateADX,
			"seriesFN": CIQ.Studies.displayADX,
			"inputs": {"Period":14, "Smoothing Period":14, "Series":true, "Shading":false, "Histogram":false},
			"outputs": {"+DI":"#00FF00", "-DI":"#FF0000", "ADX":"auto", "Positive Bar":"#00DD00", "Negative Bar":"#FF0000"}
		},
		"Directional": {
			"name": "ADX/DMS",
			"calculateFN": CIQ.Studies.calculateADX,
			"outputs": {"+DI":"#00FF00", "-DI":"#FF0000", "ADX":"auto"}
		},
		"High Low": {
			"name": "High Low Bands",
			"overlay": true,
			"seriesFN": CIQ.Studies.displayChannel,
			"calculateFN": function(stx, sd){ sd.inputs["Moving Average Type"]="triangular"; CIQ.Studies.calculateMAEnvelope(stx, sd); },
			"inputs": {"Field":"field", "Period":10, "Shift Percentage":5, "Channel Fill":true},
			"outputs": {"High Low Top":"auto", "High Low Median":"auto", "High Low Bottom":"auto"},
			"attributes":{
				"Shift Percentage":{min:0.1,step:0.1}
			}
		},
		"High-Low": {
			"name": "High Minus Low",
			"calculateFN": function(stx, sd){var quotes=sd.chart.scrubbed; for(var i=0;i<quotes.length;i++){ quotes[i]["Result " + sd.name]=quotes[i].High - quotes[i].Low; }},
			"inputs": {}
		},
		"Med Price": {
			"name": "Median Price",
			"calculateFN": CIQ.Studies.calculateMedianPrice,
			"inputs": {"Period":14,"Overlay":false}
		},
		"MA Env": {
			"name": "Moving Average Envelope",
			"overlay": true,
			"seriesFN": CIQ.Studies.displayChannel,
			"calculateFN": CIQ.Studies.calculateMAEnvelope,
			"inputs": {"Field":"field", "Period":50, "Shift Type":["percent","points"], "Shift": 5, "Moving Average Type": "ma", "Channel Fill":true},
			"outputs": {"MA Env Top":"auto", "MA Env Median":"auto", "MA Env Bottom":"auto"},
			"attributes":{
				Shift:{min:0.1,step:0.1}
			}
		},
		"Fractal Chaos Bands": {
			"name": "Fractal Chaos Bands",
			"overlay": true,
			"calculateFN": CIQ.Studies.calculateFractalChaos,
			"seriesFN": CIQ.Studies.displayChannel,
			"inputs": {"Channel Fill":true},
			"outputs": {"Fractal High":"auto", "Fractal Low":"auto", "Fractal Channel":"auto"}
		},
		"Fractal Chaos": {
			"name": "Fractal Chaos Oscillator",
			"range": "-1 to 1",
			"calculateFN": CIQ.Studies.calculateFractalChaos,
			"inputs": {},
			"centerline": 20  //so centerline is "off the chart" and not visible
		},
		"GAPO": {
			"name": "Gopalakrishnan Range Index",
			"calculateFN": CIQ.Studies.calculateMaxHighMinLow
		},
		"Gopala": {
			"name": "Gopalakrishnan Range Index",
			"calculateFN": CIQ.Studies.calculateMaxHighMinLow
		},
		"Prime Number Bands": {
			"name": "Prime Number Bands",
			"overlay": true,
			"calculateFN": CIQ.Studies.calculatePrimeNumber,
			"seriesFN": CIQ.Studies.displayChannel,
			"inputs": {"Channel Fill":true},
			"outputs": {"Prime Bands Top":"auto", "Prime Bands Bottom":"auto", "Prime Bands Channel":"auto"}
		},
		"Prime Number": {
			"name": "Prime Number Oscillator",
			"range": "-1 to 1",
			"calculateFN": CIQ.Studies.calculatePrimeNumber,
			"inputs": {"Tolerance Percentage":5},
			"attributes":{
				"Tolerance Percentage":{min:0.1,step:0.1}
			}
		},
		"Bollinger Bands": {
			"name": "Bollinger Bands",
			"overlay": true,
			"initializeFN": CIQ.Studies.convertOldBollinger,
			"calculateFN": CIQ.Studies.calculateBollinger,
			"seriesFN": CIQ.Studies.displayChannel,
			"inputs": {"Field":"field", "Period":20, "Standard Deviations": 2, "Moving Average Type":"ma", "Channel Fill": true},
			"outputs": {"Bollinger Bands Top":"auto", "Bollinger Bands Median":"auto", "Bollinger Bands Bottom":"auto"},
			"attributes": {
				"Standard Deviations":{min:0.1,step:0.1}
			}
		},
		"Donchian Channel": {
			"name": "Donchian Channel",
			"overlay": true,
			"calculateFN": CIQ.Studies.calculateMaxHighMinLow,
			"seriesFN": CIQ.Studies.displayChannel,
			"inputs": {"High Period":20, "Low Period":20, "Channel Fill":true},
			"outputs": {"Donchian High":"auto", "Donchian Median":"auto", "Donchian Low":"auto"}
		},
		"HHV": {
			"name": "Highest High Value",
			"calculateFN": CIQ.Studies.calculateMaxHighMinLow,
			"inputs": {"Period":14},
		},
		"LLV": {
			"name": "Lowest Low Value",
			"calculateFN": CIQ.Studies.calculateMaxHighMinLow,
			"inputs": {"Period":14},
		},
		"Mass Idx": {
			"name": "Mass Index",
			"seriesFN": CIQ.Studies.displayMassIndex,
			"calculateFN": CIQ.Studies.calculateMassIndex,
			"inputs": {"Period":25,"Bulge Threshold":27},
			"attributes": {
				"Bulge Threshold":{min:20,max:35,step:0.1}
			}
		},
		"Keltner": {
			"name": "Keltner Channel",
			"overlay": true,
			"seriesFN": CIQ.Studies.displayChannel,
			"calculateFN": CIQ.Studies.calculateKeltner,
			"inputs": {"Period":50, "Shift": 5, "Moving Average Type":"ema", "Channel Fill":true},
			"outputs": {"Keltner Top":"auto", "Keltner Median":"auto", "Keltner Bottom":"auto"},
			"attributes":{
				Shift:{min:0.1,step:0.1}
			}
		},
		"PSAR": {
			"name": "Parabolic SAR",
			"overlay": true,
			"calculateFN": CIQ.Studies.calculatePSAR,
			"seriesFN": CIQ.Studies.displayPSAR2,
			"inputs": {"Minimum AF":0.02,"Maximum AF":0.2}
		},
		"Klinger": {
			"name": "Klinger Volume Oscillator",
			"seriesFN": CIQ.Studies.displayHistogramWithSeries,
			"calculateFN": CIQ.Studies.calculateKlinger,
			"inputs": {"Signal Periods":13, "Short Cycle":34, "Long Cycle":55},
			"outputs": {"Klinger":"auto", "KlingerSignal":"#FF0000", "Increasing Bar":"#00DD00", "Decreasing Bar":"#FF0000"}
		},
		"Elder Ray": {
			"name": "Elder Ray Index",
			"seriesFN": CIQ.Studies.displayElderRay,
			"calculateFN": CIQ.Studies.calculateElderRay,
			"inputs": {"Period":13},
			"outputs": {"Elder Bull Power":"#00DD00", "Elder Bear Power":"#FF0000"}
		},
		"Elder Force": {
			"name": "Elder Force Index",
			"calculateFN": CIQ.Studies.calculateElderForce,
			"seriesFN": CIQ.Studies.displayElderForce,
			"inputs": {"Period":13}
		},
		"LR Slope": {
			"name": "Linear Reg Slope",
			"calculateFN": CIQ.Studies.calculateLinearRegressionIndicator,
			"inputs": {"Period":14,"Field":"field"},
			"outputs":{"Slope":"auto"}
		},
		"COG": {
			"name": "Center Of Gravity",
			"calculateFN": CIQ.Studies.calculateCenterOfGravity,
			"inputs": {"Period":10,"Field":"field"},
		},
		"Typical Price": {
			"name": "Typical Price",
			"calculateFN": CIQ.Studies.calculateTypicalPrice,
			"inputs": {"Period":14,"Overlay":false}
		},
		"Weighted Close": {
			"name": "Weighted Close",
			"calculateFN": CIQ.Studies.calculateWeightedClose,
			"inputs": {"Period":14,"Overlay":false}
		},
		"M Flow":{
			"name": "Money Flow Index",
			"range": "0 to 100",
			"calculateFN": CIQ.Studies.calculateMoneyFlowIndex,
			"inputs":{"Period":14},
			"parameters": {
				template:"studyOverZones",
				init:{studyOverZonesEnabled:true, studyOverBoughtValue:80, studyOverBoughtColor:"auto", studyOverSoldValue:20, studyOverSoldColor:"auto"}
			}
		},
		"Williams %R": {
			"name": "Williams %R",
			"calculateFN": CIQ.Studies.calculateMaxHighMinLow,
			"inputs":{"Period":14},
			"parameters": {
				template:"studyOverZones",
				init:{studyOverZonesEnabled:true, studyOverBoughtValue:-20, studyOverBoughtColor:"auto", studyOverSoldValue:-80, studyOverSoldColor:"auto"}
			}
		},
		"W Acc Dist": {
			"name": "Accumulation/Distribution",
			"calculateFN": CIQ.Studies.calculateAccumulationDistribution,
			"inputs":{"Use Volume":false}
		},
		"vchart": {
			"name": "Volume Chart",
			"display": "Volume",
		    "range": "0 to max",
		    //"yAxis": {"initialMarginBottom":10,"initialMarginTop":0}, // use this one to see the bottom value on axis.
		    "yAxis": {"ground":true,"initialMarginTop":0},
		    "seriesFN": CIQ.Studies.createVolumeChart,
		    "calculateFN": CIQ.Studies.calculateVolume,
		    "inputs": {},
		    "outputs": {"Up Volume":"#8cc176","Down Volume":"#b82c0c"},
		    "parameters": {
		    	"zoom": 0,
		    	"displayBorder": true
		    }
		},
		"volume": {
			"name": "Volume Chart",
			"display": "Volume",
		    "range": "0 to max",
		    "yAxis": {"ground":true, "initialMarginTop":0},
		    "seriesFN": CIQ.Studies.createVolumeChart,
		    "calculateFN": CIQ.Studies.calculateVolume,
		    "inputs": {},
		    "outputs": {"Up Volume":"#8cc176","Down Volume":"#b82c0c"},
		    "parameters": {
		    	"zoom": 0,
		    	"displayBorder": true
		    }
		},
		"vol undr": {
			"name": "Volume Underlay",
			"underlay": true,
		    "seriesFN": CIQ.Studies.volUnderlay,
		    "calculateFN": CIQ.Studies.calculateVolume,
		    "inputs": {},
		    "outputs": {"Up Volume":"#8cc176","Down Volume":"#b82c0c"},
			"customRemoval": true,
			"removeFN": function(stx, sd){
					stx.layout.volumeUnderlay=false;
					stx.changeOccurred("layout");
				},
		    "parameters": {
		    	"displayBorder": true,
		    	"heightPercentage": 0.25
			}
		}
	};

	return _exports;
});