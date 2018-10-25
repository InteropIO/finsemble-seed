//-------------------------------------------------------------------------------------------
// Copyright 2012-2017 by ChartIQ, Inc.
// All rights reserved
//-------------------------------------------------------------------------------------------
(function(_exports) {

	//
	// Type definitions
	//

	/**
	 * @typedef {object} minMax
	 * @property {number} min The minimum data point
	 * @property {number} max The maximum data point
	 */

	/**
	 * @typedef {object} studyDescriptor
	 * @property {string} name The study's id
	 * @property {object} inputs Keys for each possible study input with descriptors for the set and default values
	 * @property {number} min The minimum data point
	 * @property {number} max The maximum data point
	 * @property {object} outputs Keys for each possible study output option
	 * @property {string} panel ID of the panel element the study is attached to
	 * @property {parameters} parameters Keys for each of the study's possible plot parameters
	 * @property {string} type The study type
	 */

	//
	// (end definitions)
	//

	var CIQ=_exports.CIQ;

	/**
	 * Namespace for functionality related to studies (aka indicators). See {@tutorial Using and Customizing Studies} for additional details and a general overview about studies.
	 * @namespace
	 * @name  CIQ.Studies
	 */
	CIQ.Studies=function(){};

	/**
	 * Constants for when no inputs or outputs specified in studies.
	 * Values can be changed but do not change keys.
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.DEFAULT_INPUTS={"Period":14};
	CIQ.Studies.DEFAULT_OUTPUTS={"Result":"auto"};

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
	 * A study descriptor contains all of the information necessary to handle a study. READ ONLY.
	 *
	 * Do not try to manually create your own study descriptor, but rather always use the one returned by {@link CIQ.Studies.addStudy}
	 *
	 * @param {string} name	   The name of the study. This should be unique to the chart. For instance if there are two RSI panels then they should be of different periods and named accordingly. Usually this is determined automatically by the library.
	 * @param {string} type	   The type of study, which can be used as a look up in the StudyLibrary
	 * @param {string} panel	  The name of the panel that contains the study
	 * @param {object} inputs	 Names and values of input fields
	 * @param {object} outputs	Names and values (colors) of outputs
	 * @param {object} parameters Additional parameters that are unique to the particular study
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.StudyDescriptor=function(name, type, panel, inputs, outputs, parameters){
		this.name=name;
		this.type=type;
		this.panel=panel;
		this.inputs=inputs;
		this.outputs=outputs;
		this.parameters=parameters;	// Optional parameters, i.e. zones
		this.outputMap={};	// Maps dataSet label to outputs label "RSI (14)" : "RSI", for the purpose of figuring color
		this.min=null;
		this.max=null;
		this.startFrom=0;
		this.subField="Close";  // In case study is off a series
		var libraryEntry=CIQ.Studies.studyLibrary[type];
		if(!libraryEntry){
			libraryEntry={};
			if(panel=="chart" || (!panel && parameters && parameters.chartName=="chart")) this.overlay=true;
		}
		if(typeof(libraryEntry.inputs)=="undefined") libraryEntry.inputs=CIQ.clone(CIQ.Studies.DEFAULT_INPUTS);
		if(typeof(libraryEntry.outputs)=="undefined") libraryEntry.outputs=CIQ.clone(CIQ.Studies.DEFAULT_OUTPUTS);

		this.study=libraryEntry;
		this.libraryEntry=libraryEntry;  // deprecated, backwards compatibility
	};

	/**
	 * Automatically generates a unique name for the study instance. If a translation callback has been associated with the chart
	 * object then the name of the study will be translated.
	 * @param  {CIQ.ChartEngine} stx A chart engine instance
	 * @param  {string} studyName Type of study
	 * @param  {object} inputs The inputs for this study instance
	 * @param {string} [replaceID] If it matches then return the same id
	 * @param {string} [customName] If this is supplied, use it to form the full study name. Otherwise `studyName` will be used. <br>ie: if custom name is 'SAMPLE', the unique name returned would resemble "SAMPLE(paam1,param2,param3,...)-X".
	 * @return {string} A unique name for the study
	 * @memberOf CIQ.Studies
	 * @since 5.1.1 added customName argument, if supplied, use it to form the full study name. Otherwise `studyName` will be used.
	 */
	CIQ.Studies.generateID=function(stx, studyName, inputs, replaceID, customName){
		var libraryEntry=CIQ.Studies.studyLibrary[studyName];
		var translationPiece="\u200c"+(customName||studyName)+"\u200c";  // zero-width non-joiner (unprintable) to delimit translatable phrase
		var id=translationPiece;
		if(libraryEntry){
			// only one instance can exist at a time if custom removal, so return study name
			if(libraryEntry.customRemoval) return id;
		}
		if(!CIQ.isEmpty(inputs)){
			id+=" (";
			var first=false;
			for(var field in inputs){
				if(field=="id" || field=="display") continue;  //skip these!
				if(field=="Shading") continue;  //this does not merit being in the studyname
				var val=inputs[field];
				if(val=="field") continue; // skip default, usually means "Close"
				val=val.toString();
				if(CIQ.Studies.prettify[val]!==undefined) val=CIQ.Studies.prettify[val];
				if(!first){
					first=true;
				}else{
					if(val) id+=",";
				}
				id+=val;
			}
			id+=")";
		}

		//this tests if replaceID is just a warted version of id, in that case keep the old id
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
	 * swatch that should be generated. The results of the dialog would then be passed to {@link CIQ.Studies.addStudy}.
	 * @param {object} params Object containing the following:
	 * @param  {string} [params.name] The libraryEntry key for the study to add.
	 * The [libraryEntry]{@link CIQ.Studies.studyLibrary} is the object that defines the prototype for a study.
	 * May contain attributes which are used to help construct the input fields of the study dialog.
	 * See documentation of {@link CIQ.Studies.studyLibrary} and [DialogHelper Object](tutorial-Using and Customizing Studies.html#DialogHelper).
	 * Not needed if `params.sd` is present.
	 * @param  {CIQ.Studies.StudyDescriptor} [params.sd] A study descriptor when modifying an existing study. If present, takes precedence over `params.name`
	 * @param  {CIQ.CIQ.ChartEngine} params.stx A chart object
	 * @param  {Object} [params.inputs] Existing input parameters for the study (if modifying)
	 * @param  {Object} [params.outputs] Existing output parameters for the study (if modifying)
	 * @param  {Object} [params.parameters] Existing additional parameters for the study (if modifying)
	 * @name  CIQ.Studies.DialogHelper
	 * @constructor
	 * @example
	 * var helper=new CIQ.Studies.DialogHelper({name:"stochastics",stx:stxx});
	 * console.log('Inputs:',JSON.stringify(helper.inputs));
	 * console.log('Outputs:',JSON.stringify(helper.outputs));
	 * console.log('Parameters:',JSON.stringify(helper.parameters));
	 */
	CIQ.Studies.DialogHelper=function(params){
		var stx=this.stx=params.stx;
		var sd=this.sd=params.sd;
		this.name=sd?sd.type:params.name;
		this.inputs=[];
		this.outputs=[];
		this.parameters=[];
		var libraryEntry=this.libraryEntry=sd?sd.study:CIQ.Studies.studyLibrary[params.name];
		if(typeof(libraryEntry.inputs)=="undefined") libraryEntry.inputs=CIQ.clone(CIQ.Studies.DEFAULT_INPUTS);
		if(typeof(libraryEntry.outputs)=="undefined") libraryEntry.outputs=CIQ.clone(CIQ.Studies.DEFAULT_OUTPUTS);
		var panel=(sd && stx.panels[sd.panel]) ? stx.panels[sd.panel] : {chart:stx.chart};
		var chart=panel.chart;

		this.title=stx.translateIf(libraryEntry.name);

		this.attributes=libraryEntry.attributes;
		if(!this.attributes) this.attributes={};

		function hideTheField(fieldName, condition){
			if(!this.attributes[fieldName]) this.attributes[fieldName]={};
			if(condition) this.attributes[fieldName].hidden=true;
		}
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
						if(["Open","High","Low","Close","Adj_Close","hl/2","hlc/3","hlcc/4","ohlc/4",chart.defaultPlotField].indexOf(field) == -1){
							// field not an actual output but rather is just an intermediate value, so skip
							if(CIQ.Studies.actualOutputs.indexOf(field)==-1) continue;
							// can't modify study basing it on its own output data, which is changing due to the same modify (infinite loop)
							// can't modify study A basing it on another study B which uses study A data, this causes infinite loop as well
							if(params.sd){
								for(var out in params.sd.outputMap){
									// here we make sure that the output, and not a warted version of it, is in the field before skipping it.
									if(field.indexOf(out)!=-1 && field.indexOf(out+"-")==-1) continue nextField;
								}
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

			if (!stx.defaultColor) stx.getDefaultColor();

			output.color=output.defaultOutput=libraryEntry.outputs[i];
			if(sd && sd.outputs && sd.outputs[i]) output.color=sd.outputs[i];
			if(output.color=="auto") output.color=stx.defaultColor;
			this.outputs.push(output);
		}

		/* And now the parameters */

		var obj;
		var parameters=sd?sd.parameters:null;
		if(parameters){
			var myAxis=stx.getYAxisByName(panel,sd.name);
			var panelParameters={
				"Panel Name":{panelName: parameters.panelName, value: (sd.overlay||sd.underlay)?sd.panel:"Own panel"},
				"Underlay":{underlay: parameters.underlayEnabled, value: sd.underlay},
				"Y-Axis":{yaxisDisplay: parameters.yaxisDisplay, value: (myAxis&&myAxis.position)||((sd.overlay||sd.underlay)?"shared":(panel.yAxis.position||"default")), color:myAxis&&myAxis.textStyle?myAxis.textStyle:null}
			};
			for(var label in panelParameters){
				for(var name in panelParameters[label]){
					if(name=="value" || name=="color") continue;
					var defaults=panelParameters[label][name];
					if(defaults=="panel"){
						defaults=[];
						for(var pnl in stx.panels) {
							if(pnl!=sd.name) defaults.push(pnl);
						}
						defaults.push("Own panel");
					}
					if(defaults && defaults.constructor==Array){
						var options={};
						for(var pp=0;pp<defaults.length;pp++){
							options[defaults[pp]]=stx.translateIf(defaults[pp]);
						}
						obj={name:name, heading:stx.translateIf(label), defaultValue:defaults[0], value:panelParameters[label].value, options:options};
						if(panelParameters[label].color!==undefined){
							obj.defaultColor=stx.defaultColor;
							obj.color=panelParameters[label].color;
							parameters[name+"Value"]=obj.value;
							parameters[name+"Color"]=obj.color;
						}else{
							parameters[name]=obj.value;
						}
						obj.type='select';
						this.parameters.push(obj);
					}else if((defaults||defaults===false) && defaults.constructor==Boolean){
						obj={name:name, heading:stx.translateIf(label), defaultValue:false, value:panelParameters[label].value};
						parameters[name+"Enabled"]=obj.value;
						obj.type='checkbox';
						this.parameters.push(obj);
					}
				}
			}

			hideTheField.call(this, "underlayEnabled", libraryEntry.underlay);
			hideTheField.call(this, "panelName", libraryEntry.seriesFN===null);
			hideTheField.call(this, "yaxisDisplayValue", libraryEntry.seriesFN===null || (libraryEntry.yAxis && libraryEntry.yAxis.noDraw));

		}
		if(libraryEntry.parameters){
			var init=libraryEntry.parameters.init;
			if(init){
				var libParameters=[];
				if(libraryEntry.parameters.template=="studyOverZones"){
					obj={name:"studyOverZones", heading:stx.translateIf("Show Zones"),
						defaultValue:init.studyOverZonesEnabled, value:init.studyOverZonesEnabled};
					if(parameters && (parameters.studyOverZonesEnabled || parameters.studyOverZonesEnabled===false)) {
						obj.value=parameters.studyOverZonesEnabled;
					}
					obj.type='checkbox';
					libParameters.push(obj);

					obj={name:"studyOverBought", heading:stx.translateIf("OverBought"),
						defaultValue:init.studyOverBoughtValue, value:init.studyOverBoughtValue,
						defaultColor:init.studyOverBoughtColor, color:init.studyOverBoughtColor};
					if(parameters && parameters.studyOverBoughtValue) obj.value=parameters.studyOverBoughtValue;
					if(parameters && parameters.studyOverBoughtColor) obj.color=parameters.studyOverBoughtColor;
					if(obj.color=="auto") obj.color=stx.defaultColor;
					obj.type='text';
					libParameters.push(obj);

					obj={name:"studyOverSold", heading:stx.translateIf("OverSold"),
						defaultValue:init.studyOverSoldValue, value:init.studyOverSoldValue,
						defaultColor:init.studyOverSoldColor, color:init.studyOverSoldColor};
					if(parameters && parameters.studyOverSoldValue) obj.value=parameters.studyOverSoldValue;
					if(parameters && parameters.studyOverSoldColor) obj.color=parameters.studyOverSoldColor;
					if(obj.color=="auto") obj.color=stx.defaultColor;
					obj.type='text';
					libParameters.push(obj);

					if(!this.attributes.studyOverBoughtValue) this.attributes.studyOverBoughtValue={};
					if(!this.attributes.studyOverSoldValue) this.attributes.studyOverSoldValue={};
					
					this.parameters=libParameters.concat(this.parameters);  // lib parameters come first
				}
			}
		}
	};

	/**
	 * Update (or add) the study attached to the DialogHelper.
	 * @param  {Object} updates If updating, it should contain an object with updates to the `inputs`, `outputs` and `parameters` object used in {@link CIQ.Studies.addStudy}.  A new study ID will be created using the default format or parameters.replaceID, if provided.
	 * @memberOf CIQ.Studies.DialogHelper
	 * @example
	 * var helper=new CIQ.Studies.DialogHelper({sd:sd, stx:stx});
	 * helper.updateStudy({inputs:{Period:60}});
	 */
	CIQ.Studies.DialogHelper.prototype.updateStudy=function(updates){
		var newParams={};
		var sd=this.sd;
		var libraryEntry=this.libraryEntry;
		if(!libraryEntry) libraryEntry={};
		if(!sd) sd=libraryEntry;
		newParams.inputs=CIQ.shallowClone(sd.inputs);
		newParams.outputs=CIQ.clone(sd.outputs);
		newParams.parameters=CIQ.shallowClone(sd.parameters);
		CIQ.extend(newParams, updates);
		if(!newParams.parameters) newParams.parameters={};
		if(newParams.inputs && newParams.inputs.id){
			this.sd=CIQ.Studies.replaceStudy(this.stx, newParams.inputs.id, this.name, newParams.inputs, newParams.outputs, newParams.parameters, null, sd.study);
		}else{
			this.sd=CIQ.Studies.addStudy(this.stx, this.name, newParams.inputs, newParams.outputs, newParams.parameters, null, sd.study);
		}
	};

	/**
	 * Prepares a study descriptor for use by assigning default calculation or display functions if required and configuring the outputMap
	 * which is used internally to determine the color for each output. This method also places any overlays into the stx.overlays array for
	 * future reference. Finally it is responsible for rebuilding any derived studies when replacing an underlying study.
	 * @private
	 * @param  {CIQ.ChartEngine} stx A chart object
	 * @param  {object} study The study library entry
	 * @param  {studyDescriptor} sd The study descriptor being prepared
	 * @param  {object} [parameters] Object containing any of the following options:
	 * @param  {boolean} [parameters.replaceID] Remove any overlays that relies on the old panel ID name
	 * @param  {boolean} [parameters.calculateOnly] If true, do not draw the study, just calculate its values
	 * @memberOf CIQ.Studies
	 * @since 6.1.2 added calculateOnly parameter
	 */
	CIQ.Studies.prepareStudy=function(stx, study, sd, parameters){
		if(typeof(study.calculateFN)=="undefined") study.useRawValues=true;
		//if(typeof(study.seriesFN)=="undefined") study.seriesFN=CIQ.Studies.displaySeriesAsLine;

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
		if(sd.overlay || sd.underlay){
			stx.addOverlay(sd);
		}
		if(!stx.currentlyImporting && !(parameters && parameters.calculateOnly)) { // silent mode while importing
			if(sd.chart.dataSet) stx.createDataSet();
			stx.draw();
		}
	};

	/**
	 * Fixes any derived studies that were based off of a study that has just changed.
	 * For instance a moving average on another overlay, or a moving average on an RSI.
	 * The panel name needs to change and the input "Field".
	 * @param  {CIQ.ChartEngine} stx	   The stx instance
	 * @param  {string} replaceID The old ID for the underlying study e.g. RSI (14)
	 * @param  {string} newID	 The new ID for the underlying study
	 * @since 5.2.0 removed panelID argument
	 */
	CIQ.Studies.rejiggerDerivedStudies=function(stx, replaceID, newID){
		var studies=stx.layout.studies;
		for(var s in studies){
			var st=studies[s];
			if(st.panel==replaceID) st.panel=newID;
			var inputs=st.inputs;
			var derivedID=inputs.id;
			if(inputs.id.indexOf(replaceID)!=-1 && inputs.id.indexOf(replaceID+"-")==-1){  //check if exact field (and not warted one) exists in input
				var newDerivedID=inputs.id.replace(replaceID, newID); // The new ID, naively accomplished with string replace
				var stNeedsReplacement=false;
				var fieldInputs=CIQ.Studies.getFieldInputs(st);
				for(var f=0;f<fieldInputs.length;f++){
					if(inputs[fieldInputs[f]].indexOf(replaceID)!=-1){ // Yuck, we should implement actual parent
						var oldName=st.name;
						inputs[fieldInputs[f]]=inputs[fieldInputs[f]].replace(replaceID, newID); // Adjust the field name, tricky because the field name is "output (id)" and we don't really know the outputs
						inputs.id=inputs.id.replace(replaceID, newID);
						inputs.display=inputs.display.replace(replaceID, newID);
						st.name=st.name.replace(replaceID, newID);
						st.outputMap={};
						for(var i in st.outputs){
							if(st.study.useRawValues){
								st.outputMap[i]=i;
							}else{
								st.outputMap[i + " " + st.name]=i;
							}
						}
						stNeedsReplacement=true;
					}
				}
				if(stNeedsReplacement) CIQ.Studies.replaceStudy(stx, derivedID, st.type, st.inputs, st.outputs, st.parameters);
			}
		}
	};

	/**
	 * Removes any series that the study is referencing
	 * @param {object} sd 			Study descriptor
	 * @param {CIQ.ChartEngine} stx The chart engine
	 * @memberOf CIQ.Studies
	 * @since 3.0.0
	 * @since  3.0.7 changed "name" argument to take a study descriptor
	 * @since  3.0.7 added required stx argument
	 */
	CIQ.Studies.removeStudySymbols=function(sd, stx){
		if(sd.series) {
			for(var s in sd.series){
				stx.deleteSeries(sd.series[s], null, {action:"remove-study"});
			}
		}
		//stx.draw();
	};

	/**
	 * Replaces an existing study with new inputs, outputs and parameters. When using this method
	 * a study's position in the stack will remain the same. Derived (child) studies will shift to
	 * use the new study as well
	 * @param {CIQ.ChartEngine} stx		The chart object
	 * @param {string} id 		The id of the current study. If set, then the old study will be replaced
	 * @param {string} type	   The name of the study (out of the studyLibrary)
	 * @param {object} [inputs]	 Inputs for the study instance. Default is those defined in the studyLibrary.
	 * @param {object} [outputs]	Outputs for the study instance. Default is those defined in the studyLibrary.
	 * @param {object} [parameters] additional custom parameters for this study if supported or required by that study
	 * @param {string} [panelName] Optionally specify the panel. If not specified then an attempt will be made to locate a panel based on the input id or otherwise created if required.
	 * @param {object} [study] Optionally supply a study definition, overriding what may be found in the study library
	 * @return {object} A study descriptor which can be used to remove or modify the study.
	 * @since 3.0.0 added study argument
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.replaceStudy=function(stx, id, type, inputs, outputs, parameters, panelName, study){
		if(!parameters) parameters={};
		if(id) parameters.replaceID=id;
		if(inputs.id==inputs.display) delete inputs.display;
		delete inputs.id;
		var sd=stx.layout.studies[parameters.replaceID];
		CIQ.Studies.removeStudySymbols(sd, stx);
		if(stx.quoteDriver) stx.quoteDriver.updateSubscriptions();
		return CIQ.Studies.addStudy(stx, type, inputs, outputs, parameters, panelName, study);
	};

	/**
	 * Adds or replace a study on the chart. A layout change event is triggered when this occurs. See {@tutorial Using and Customizing Studies} for more details.
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
	 * @param {CIQ.ChartEngine} stx		The chart object
	 * @param {string} type	   The name of the study (object key on the {@link CIQ.Studies.studyLibrary})
	 * @param {object} [inputs]	 Inputs for the study instance. Default is those defined in the studyLibrary. Note that if you specify this object, it will be combined with (override) the library defaults. To bypass a library default, set that field to null.
	 * @param {string} [inputs.id] The id of the current study. If set, then the old study will be replaced
	 * @param {string} [inputs.display] The display name of the current study. If not set, a name generated by {@link CIQ.Studies.prettyDisplay} will be used. Note that if the study descriptor defines a `display` name, the study descriptor name will allays override this parameter.
	 * @param {object} [outputs]	Outputs for the study instance. Default is those defined in the studyLibrary. Values specified here will override those in the studyLibrary.
	 * @param {object} [parameters] Additional custom parameters for this study if supported or required by that study. Default is those defined in the {@link CIQ.Studies.studyLibrary}.
	 * @param {object} [parameters.replaceID] If `inputs.id` is specified, this value can be used to set the new ID for the modified study( will display as the study name on the study panel). If omitted the existing ID will be preserved.
	 * @param {object} [parameters.display] If this is supplied, use it to form the full study name. Otherwise `studyName` will be used. Is both `inputs.display` and `parameters.display` are set, `inputs.display` will always take precedence.<br>ie: if custom name is 'SAMPLE', the unique name returned would resemble "SAMPLE(param1,param2,param3,...)-X".
	 * @param {string} [panelName] Optionally specify the panel. The relationship between studies and their panels is kept in {@link CIQ.Studies.studyPanelMap}. If not specified then an attempt will be made to locate a panel based on the input id or otherwise created if required. Multiple studies can be overlayed on any panel.
	 * @param {object} [study] Optionally supply a study definition, overriding what may be found in the study library
	 * @return {object} A study descriptor which can be used to remove or modify the study.
	 * @since
	 * <br>&bull; 3.0.0 added study argument
	 * <br>&bull; 5.1.1 `parameters.display` added. If this is supplied, use it to form the full study name.
	 * <br>&bull; 5.2.0 multiple studies can be overlayed on any panel using the `panelName` parameter.
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
	CIQ.Studies.addStudy=function(stx, type, inputs, outputs, parameters, panelName, study){
		var libraryEntry=study?study:CIQ.Studies.studyLibrary[type];

		if(!parameters) parameters={};
		if(libraryEntry){
			if(libraryEntry.inputs){
				// Default to the library inputs
				var libraryInputs=CIQ.shallowClone(libraryEntry.inputs);
				for(var i in libraryInputs){
					// But set any arrays to the default (the first item in the array)
					if(libraryInputs[i] instanceof Array) libraryInputs[i]=libraryInputs[i][0];
				}
				// Now override the library inputs with anything the user passed in
				inputs=CIQ.extend(libraryInputs, inputs);
			}
			if(libraryEntry.outputs){
				outputs=CIQ.extend(CIQ.clone(libraryEntry.outputs), outputs);
			}
			var libraryParameters=libraryEntry.parameters;
			if(libraryParameters && libraryParameters.init) {
				parameters=CIQ.extend(CIQ.shallowClone(libraryParameters.init), parameters);
			}

			if (libraryParameters && !parameters.display) {
				parameters.display=libraryParameters.display;
			}
		}


		if(!inputs) inputs=CIQ.clone(CIQ.Studies.DEFAULT_INPUTS);
		if(!outputs) outputs=CIQ.clone(CIQ.Studies.DEFAULT_OUTPUTS);
		if(!parameters.chartName) parameters.chartName="chart";

		if( inputs.Period < 1 ) inputs.Period = 1; // periods can't be less than one candle. This is a general safety check. Each study should have a check or add input validation.

		if(!inputs.id){
			inputs.id=CIQ.Studies.generateID(stx, type, inputs, parameters.replaceID, parameters.display);
		}
		var sd=null;
		if(libraryEntry && libraryEntry.initializeFN){
			sd=libraryEntry.initializeFN(stx, type, inputs, outputs, parameters, panelName, study);
		}else{
			sd=CIQ.Studies.initializeFN(stx, type, inputs, outputs, parameters, panelName, study);
		}
		if(!sd){
			console.log("CIQ.Studies.addStudy: initializeFN() returned null for " + type);
			return;
		}
		study=sd.study;
		sd.chart=stx.charts[parameters.chartName];
		if(!stx.layout.studies) stx.layout.studies={};
		// removed following line because it causes modified studies to be re-added out of sequence causing issues if there are dependencies
		// so instead of deleting and adding to the end of the array, we just replace the data with the new sd
		//delete stx.layout.studies[sd.inputs.id]; // for good measure, in case of orphaned studies
		stx.layout.studies[sd.inputs.id]=sd;
		sd.type=type;
		sd.permanent=study.permanent;
		sd.customLegend=study.customLegend;
		var panel=stx.panels[sd.panel];
		CIQ.Studies.prepareStudy(stx, study, sd, parameters);
		//if(!stx.currentlyImporting) CIQ.Studies.checkSymbolChanged(stx, sd, "add-study");
		if(stx.quoteDriver) stx.quoteDriver.updateSubscriptions();
		stx.changeOccurred("layout");
		var hasEditCallback=false;
		var isPanelStudy=!(sd.overlay || sd.underlay);

		if (isPanelStudy && study.horizontalCrosshairFieldFN) {
			panel.horizontalCrosshairField = study.horizontalCrosshairFieldFN(stx, sd);
		}

		if(stx.editCallback){
			hasEditCallback=true;
		}else if(isPanelStudy){
			if(stx.callbacks.studyPanelEdit ||
				(stx.callbackListeners.studyPanelEdit && stx.callbackListeners.studyPanelEdit.length))
					hasEditCallback=true;
		}else{
			if(stx.callbacks.studyOverlayEdit ||
				(stx.callbackListeners.studyOverlayEdit && stx.callbackListeners.studyOverlayEdit.length))
					hasEditCallback=true;
		}

		if(hasEditCallback){
			parameters.editMode=true;
			var hasInput=false;
			for(var input in sd.inputs){
				if(input=="id") continue;
				if(input=="display") continue;
				hasInput=true;
				break;
			}
			if(!hasInput){
				for(var output in sd.outputs){
					hasInput=true;
					break;
				}
			}
			if(hasInput){
				var editFunction;
				if(typeof sd.study.edit!="undefined"){
					if(sd.study.edit){
						editFunction=(function(stx, sd, inputs, outputs){return function(){
							CIQ.clearCanvas(stx.chart.tempCanvas, stx); // clear any drawing in progress
							sd.study.edit(sd, {stx:stx, inputs:inputs, outputs:outputs, parameters:parameters});
						};})(stx, sd, inputs, outputs, parameters);
						stx.setPanelEdit(panel, editFunction);
						sd.editFunction=editFunction;
					}
				}else if(!isPanelStudy){
					editFunction=(function(stx, sd, inputs, outputs, parameters){return function(forceEdit){
						CIQ.clearCanvas(stx.chart.tempCanvas, stx); // clear any drawing in progress
						stx.dispatch("studyOverlayEdit", {stx:stx,sd:sd,inputs:inputs,outputs:outputs, parameters:parameters, forceEdit: forceEdit});
					};})(stx, sd, inputs, outputs, parameters);
					sd.editFunction=editFunction;
				}else{
					if(stx.editCallback){ // deprecated legacy support
						editFunction=(function(stx, sd, inputs, outputs){return function(){
							var dialogDiv=stx.editCallback(stx, sd);
							CIQ.clearCanvas(stx.chart.tempCanvas, stx); // clear any drawing in progress
							CIQ.Studies.studyDialog(stx, type, dialogDiv, {inputs:inputs, outputs:outputs, parameters:parameters});
						};})(stx, sd, inputs, outputs, parameters);
						if(panel.name!="chart"){
							stx.setPanelEdit(panel, editFunction);
						}
					}else{
						editFunction=(function(stx, sd, inputs, outputs, parameters){return function(){
							CIQ.clearCanvas(stx.chart.tempCanvas, stx); // clear any drawing in progress
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
		stx.draw();  // we put this extra draw here in case of study parameters which affect the appearance of the y-axis, since adding a y-axis calls draw() but before the layout has changed.
		return sd;
	};

	/** @deprecated **/
	CIQ.Studies.quickAddStudy=CIQ.Studies.addStudy;

	/**
	 * Removes a study from the chart (and panel if applicable)
	 * @param  {CIQ.ChartEngine} stx A chart object
	 * @param  {studyDescriptor} sd  A study descriptor returned from {@link CIQ.Studies.addStudy}
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.removeStudy=function(stx, sd){
		if(sd.overlay || sd.underlay){
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
		var permanentPanel={};  // local map of permanent panels
		permanentPanel[chart.name]=true;   // no X on chart panel
		for(var n in s){
			var sd=s[n];
			var study=sd.study;
			if(!study) continue;
			if(underlays){
				if(!sd.underlay) continue;
			}else{
				if(sd.underlay) continue;
			}
			var rendererConfigs=CIQ.clone(study.renderer);
			if(rendererConfigs && !(rendererConfigs instanceof Array)) rendererConfigs=[rendererConfigs];
			var panel=stx.panels[sd.panel];
			if(panel){
				if(panel.chart!=chart) continue;
				//TODO: get rid of orphaned overlay study?
				if(panel.hidden) continue;
				if(!permanentPanel[panel.name]){
					var permanent=sd.permanent || !stx.manageTouchAndMouse;
					if(panel.closeX){
						if(permanent) panel.closeX.style.display="none";
					}else if(panel.close){
						if(permanent) panel.close.style.display="none";
					}
					if(panel.edit){
						if(permanent) panel.edit.style.display="none";
					}
					permanentPanel[panel.name]=permanent;
				}
			}else{
				//orphaned panel study, kill it
				delete s[n];
				continue;
			}

			var quotes=sd.chart.dataSegment;	// Find the appropriate data to drive this study

			for(var i in sd.outputMap){
				CIQ.Studies.actualOutputs.push(i);
				CIQ.Studies.studyPanelMap[i]=sd;
			}

			// change the panel if it's an overlay and the underlying field has changed
			var fieldInputs=CIQ.Studies.getFieldInputs(sd);
			if(sd.panel==sd.parameters.chartName && (!sd.parameters || !sd.parameters.panelName)) {
				for(var f=0;f<fieldInputs.length;f++){
					if(sd.inputs[fieldInputs[f]]) {
						var mapEntry=CIQ.Studies.studyPanelMap[sd.inputs[fieldInputs[f]]];
						if(mapEntry) {
							sd.panel=mapEntry.panel;
							break;
						}
					}
				}
			}
			if(typeof(study.seriesFN)=="undefined"){	// null means don't display, undefined means display by default as a series
				if(rendererConfigs){
					if(!sd.overlay) CIQ.Studies.createYAxis(stx, sd, quotes, panel);
					for(var r=0;r<rendererConfigs.length;r++){
						var params=rendererConfigs[r];
						// Get the input-specific output name from the outputMap.  At this point params.field is just the output name,
						// without any inputs. For example, "RSI" vs "RSI (14)".  Here we set it to the actual name used in dataSegment.
						for(var om in sd.outputMap){
							if(sd.outputMap[om]==params.field) params.field=om;
						}
						if(!params.field) continue;
						params.panel=sd.panel;
						var binding=params.binding;
						// Binding is the ability to attach the color chosen by the user to a particular renderer property.
						if(binding){
							for(var m in binding){
								var color=CIQ.Studies.determineColor(sd.outputs[binding[m]]);
								if(color && color!="auto") params[m]=color;
								/*For future implementation
								if(typeof(sd.outputs[binding[m]])=="object"){
									params.pattern=sd.outputs[binding[m]].pattern;
									params.width=sd.outputs[binding[m]].width;
								}*/
							}
						}
						params.yAxis=null; // not allowed to specify y axis in these renderers
						var renderer=CIQ.Renderer.produce(params.type, params);
						renderer.stx=stx;
						renderer.attachSeries(null, params).draw();
					}
				}else{
					CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);
				}
				if(panel) CIQ.Studies.displayError(stx, sd);
			}else{
				if(study.seriesFN){
					if(panel) {
						study.seriesFN(stx, sd, quotes);
						CIQ.Studies.displayError(stx, sd);
					}
				}
			}
		}
	};

	/**
	 * This method displays a watermark on a panel for a study with sd.error set.
	 * The sd.error property can be set to true, which will display the default message "Not enough data to compute XXX"
	 * or it can be set to a custom string which will be displayed as supplied.
	 * @param  {CIQ.ChartEngine} stx The charting object
	 * @param  {studyDescriptor} sd	 The study descriptor
	 * @param  {Object} [params]	additional options to customize the watermark
	 * @param  {string} [params.panel]	name of the panel on which to display the error, defaults to sd.panel
	 * @param  {string} [params.h]	watermark horizontal position
	 * @param  {string} [params.v]	watermark vertical position
	 * @memberOf CIQ.Studies
	 * @since
	 * <br>&bull; 3.0.0
	 * <br>&bull; 4.0.0 Displays one error per panel, added params argument
	 */
	CIQ.Studies.displayError=function(stx, sd, params) {
		var panel = params && params.panel ? params.panel : sd.panel,
			state = stx.panels[panel].state;

		if (state.studyError || !sd.error || (typeof practiceMode !== 'undefined' && practiceMode)) return;

		params = params || {h: 'center', v: 'bottom'};

		params.text = state.studyError = sd.error === true ?
			stx.translateIf('Not enough data to compute ') + stx.translateIf(sd.study.name) :
			stx.translateIf(sd.error);

		stx.watermark(panel, params);
	};

	/**
	 * Convenience function for determining the min and max for a given data point
	 * @param {CIQ.ChartEngine} stx The chart
	 * @param {string} name The field to evaluate
	 * @param {array} quotes The array of quotes to evaluate (typically dataSet, scrubbed or dataSegment)
	 * @memberOf CIQ.Studies
	 * @return {minMax} Object containing the min and max data point values
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
	 * Method to determine the minimum and maximum points in a study panel.
	 * @param  {CIQ.ChartEngine} stx	The chart object
	 * @param  {studyDescriptor} sd	 The study descriptor
	 * @param  {array} quotes The set of quotes to evaluate
	 * @memberOf CIQ.Studies
	 * @deprecated Since 5.2.0. This calculation is done in {@link CIQ.ChartEngine.AdvancedInjectable#initializeDisplay} and is no longer a separate function.
	 */
	CIQ.Studies.determineMinMax=function(stx, sd, quotes){};

	/**
	 * Retrieves parameters to be used to draw the Y Axis, retrieved from the study library.
	 * If a range is set in the study library, the yAxis high and low properties are set.
	 * Invoked by {@link CIQ.ChartEngine.renderYAxis} before createYAxis
	 * @param  {CIQ.ChartEngine} stx	The chart object
	 * @param  {CIQ.ChartEngine.YAxis} yAxis	 The axis to act upon
	 * @return {object} y-axis parameters such as noDraw, range, and ground
	 * @memberOf CIQ.Studies
	 * @since 5.2.0
	 *
	 */
	CIQ.Studies.getYAxisParameters=function(stx, yAxis){
		var parameters={};
		var sd=stx.layout.studies && stx.layout.studies[yAxis.name];
		if(sd){
			var study=sd.study;
			if(study.yaxis || study.yAxisFN){
				parameters.noDraw=true;
			}else{
				// If zones are enabled then we don't want to draw the yAxis
				if(study.parameters && study.parameters.excludeYAxis) parameters.noDraw=true;
				parameters.ground=study.yAxis && study.yAxis.ground;
				if(yAxis){
					if(study.range!="bypass"){
						if(study.range=="0 to 100") parameters.range=[0,100];
						else if(study.range=="-1 to 1") parameters.range=[-1,1];
						else{
							if(study.range=="0 to max") {
								parameters.range=[0,Math.max(0,yAxis.high)];
							}else if(study.centerline || study.centerline===0) {
								parameters.range=[Math.min(study.centerline,yAxis.low),Math.max(study.centerline,yAxis.high)];
							}
						}
					}
					if(parameters.range){
						yAxis.low=parameters.range[0];
						yAxis.high=parameters.range[1];
					}
					if(sd.min) yAxis.min=sd.min;
					if(sd.max) yAxis.max=sd.max;
					if(sd.parameters && sd.parameters.studyOverZonesEnabled) parameters.noDraw=true;
				}
			}
		}
		return parameters;
	};

	 // <code>init:{studyOverZonesEnabled:true, studyOverBoughtValue:70, studyOverBoughtColor:"auto", studyOverSoldValue:30, studyOverSoldColor:"auto"}</code>
	 //
	/**
	 * studyOverZones will be displayed and Peaks & Valleys will be filled if corresponding thresholds are set in the study library as follows:
	 * Invoked by {@link CIQ.ChartEngine.renderYAxis} after createYAxis
	 * @param  {CIQ.ChartEngine} stx	The chart object
	 * @param  {CIQ.ChartEngine.YAxis} yAxis	 The axis to draw upon
	 * @memberOf CIQ.Studies
	 * @since 5.2.0
	 *
	 */
	CIQ.Studies.doPostDrawYAxis=function(stx, yAxis){
		for(var s in stx.layout.studies){
			var sd=stx.layout.studies[s];
			var panel=stx.panels[sd.panel];
			if(!panel || panel.hidden) continue;
			var studyAxis=stx.getYAxisByName(sd.panel,sd.name) || panel.yAxis;
			if(studyAxis!=yAxis) continue;
			var study=sd.study;
			if(yAxis.name==sd.name){
				// only draw the custom yAxis for a panel study, not an overlay
				if(study.yaxis) study.yaxis(stx, sd); // backward compatibility
				if(study.yAxisFN) study.yAxisFN(stx, sd); // Use yAxisFN for forward compatibility
			}
			CIQ.Studies.drawZones(stx, sd);

			if(!sd.error){
				var centerline=study.centerline;
				if(centerline || centerline===0 || (centerline!==null && yAxis.highValue>0 && yAxis.lowValue<0)) {
					CIQ.Studies.drawHorizontal(stx, sd, null, centerline || 0, yAxis);
				}
			}
		}
	};

	/**
	 * Creates the yAxis for a study panel.
	 * @param  {CIQ.ChartEngine} stx	The chart object
	 * @param  {studyDescriptor} sd	 The study descriptor
	 * @param  {array} quotes The set of quotes (representing dataSegment)
	 * @param  {CIQ.ChartEngine.Panel} panel  A reference to the panel
	 * @memberOf CIQ.Studies
	 * @deprecated Since 5.2.0. yAxis is now created automatically via {@link CIQ.ChartEngine#renderYAxis}
	 */
	CIQ.Studies.createYAxis=function(stx, sd, quotes, panel){};

	/**
	 * Displays a single or group of series as lines in the study panel.
	 * One series per output field declared in the study library will be displayed.
	 * It expects the 'quotes' array to have data fields for each series with keys in the outputMap format: 'output name from study library'+ " " + sd.name.
	 * For most custom studies this function will do the work for you.
	 * @param  {CIQ.ChartEngine} stx	The chart object
	 * @param  {studyDescriptor} sd	 The study descriptor
	 * @param  {array} quotes The set of quotes (dataSegment)
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.displaySeriesAsLine=function(stx, sd, quotes){
		if(!quotes.length) return;
		var panel=stx.panels[sd.panel];
		if(!panel || panel.hidden) return;

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
	 * @param  {CIQ.ChartEngine} stx	The chart object
	 * @param  {studyDescriptor} sd	 The study descriptor
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
		CIQ.Studies.addStudy(stxx, "Plot High Low");
	 */
	CIQ.Studies.displaySeriesAsHistogram=function(stx, sd, quotes){
		if(!quotes.length) return;
		var panel=stx.panels[sd.panel];
		if(!panel) return;
		if(panel.hidden) return;

		var seriesParam=[];
		for(var i in sd.outputMap){
			var output=sd.outputs[sd.outputMap[i]];
			if(!output) continue;
			var opacity=0.3;
			if(typeof(output)=="object") {
				opacity=output.opacity;
				output=output.color;
			}
			var series={
				field: i,
				fill_color_up: output,
				border_color_up: output,
				fill_color_down: output,
				border_color_down: output
			};
			if(sd.underlay){
				series.opacity_up=series.opacity_down=opacity || 0.3;
			}
			seriesParam.push(series);
		}

		var inputs=sd.inputs;
		var yAxis=stx.getYAxisByName(panel,sd.name);
		var params={
			name: sd.name,
			type: inputs.HistogramType?inputs.HistogramType:"overlaid",
			panel: sd.panel,
			yAxis: yAxis,
			heightPercentage: inputs.HeightPercentage?inputs.HeightPercentage:yAxis?1:0.25,
			widthFactor: inputs.WidthFactor?inputs.WidthFactor:0.5,
			bindToYAxis: yAxis.position!="none"
		};

		stx.drawHistogram(params, seriesParam);
	};

	/**
	 * Displays multiple data-points as series on a panel. This is the default display function for an indicator and will
	 * work for 90% of custom indicators.
	 * It also inserts the study results into the studyPanelMap to be selected as the basis for another study.
	 * @param  {CIQ.ChartEngine} stx	The chart object
	 * @param  {studyDescriptor} sd	 The study descriptor
	 * @param  {CIQ.ChartEngine.Panel} panel  A reference to the study panel
	 * @param  {string} name   The name of this study instance (should match field from 'quotes' needed to render this line)
	 * @param  {array} quotes The array of quotes (dataSegment)
	 * @memberOf CIQ.Studies
	 * @since 5.2.0 decimalPlaces for y axis determined by distance between ticks as opposed to shadow
	 */
	CIQ.Studies.displayIndividualSeriesAsLine=function(stx, sd, panel, name, quotes){
		if(!panel.height) panel.height=panel.bottom-panel.top;

		var context=stx.chart.context;
		var output = sd.outputs[sd.outputMap[name]];
		if(!output) return;

		// save the original context settings
		stx.chart.context.save();

		// backwards compatibility if the output is just a color string
		if(typeof output === 'string') {
			output = {
					color: output,
					width: 1
			};
		}

		var lineWidth=output.width || 1;
		context.lineWidth = sd.highlight ? lineWidth + 2 : lineWidth;

		var color=output.color;
		if(color=="auto") color=stx.defaultColor;	// This is calculated and set by the kernel before draw operation.
		context.strokeStyle=color;

		var pattern = output.pattern;

		context.setLineDash(CIQ.borderPatternToArray(context.lineWidth,pattern));
		context.lineDashOffset=0;


		var labelDecimalPlaces=0;
		var study=sd.study, yAxis=stx.getYAxisByName(panel,sd.name) || panel.yAxis;
		labelDecimalPlaces=stx.decimalPlacesFromPriceTick(yAxis.priceTick);
		if(sd.overlay || sd.underlay) labelDecimalPlaces=null; // will end up using the same as the chart itself
		if(yAxis.decimalPlaces || yAxis.decimalPlaces===0) labelDecimalPlaces=yAxis.decimalPlaces;
		var label=null;
		if(sd.parameters) label=sd.parameters.label;
		var libParams=study.parameters;
		if(!libParams) libParams={};
		var step=libParams.plotType=="step";
		if(sd.series){  // not even sure why this is here but leaving for "backward compatibility"
			for(var s in sd.series){
				var ser=sd.series[s].parameters.type;
				if(ser) step=(ser=="step");
			}
		}
		// backwards compatibility
		if(libParams.noLabels) label=false;
		if(!sd.noSlopes && sd.noSlopes!==false) sd.noSlopes=libParams.noSlopes;
		if(!sd.extendToEnd && sd.extendToEnd!==false) sd.extendToEnd=libParams.extendToEnd;
		var showLabel=label || (stx.preferences.labels && label!==false);

		var gaplines=sd.gaplines;
		if(gaplines===false) gaplines="transparent";
		var symbol=sd.inputs.Symbol;
		var colorFunction=gaplines?stx.getGapColorFunction(symbol, name, output, gaplines):null;

		stx.plotDataSegmentAsLine(name, panel, {
			yAxis: yAxis,
			skipTransform: stx.panels[sd.panel].name!=sd.chart.name,
			label: showLabel,
			labelDecimalPlaces: labelDecimalPlaces,
			noSlopes: sd.noSlopes,
			step: step,
			extendToEndOfDataSet: sd.extendToEnd,
			gapDisplayStyle: gaplines
		}, colorFunction);

		if(study.appendDisplaySeriesAsLine) study.appendDisplaySeriesAsLine(stx, sd, quotes, name, panel);

		// restore the original context settings
		stx.chart.context.restore();
	};

	/**
	 * Draws a horizontal line on the study.
	 * @param  {CIQ.ChartEngine} stx	The chart object
	 * @param  {studyDescriptor} sd	 The study descriptor
	 * @param  {array} quotes The array of quotes (unused)
	 * @param  {number} price  The price (value) to draw the horizontal line
	 * @param  {CIQ.ChartEngine.YAxis} yAxis  The axis to use when drawing the line
	 * @param  {object} color  Optional color to use when drawing line.  Can be a string or an object like {color:#334455, opacity:0.5}
	 * @memberOf CIQ.Studies
	 * @since 5.2.0 Added yAxis and color parameters
	 */
	CIQ.Studies.drawHorizontal=function(stx, sd, quotes, price, yAxis, color){
		var panel = stx.panels[sd.panel];
		if(!panel) return;
		if(!color) color=yAxis.textStyle;

		var y=stx.pixelFromPrice(price, panel, yAxis);
		if(y>yAxis.top && y<yAxis.bottom)
			stx.plotLine(panel.left, panel.right, y, y, color, "segment", stx.chart.context, false, {opacity:(color && color.opacity)?color.opacity:0.5});
	};

	/**
	 * A sample of a custom display function. This function creates the yAxis, draws **a single** histogram and then plots the series.
	 * Note that to differentiate between a regular series and the histogram series there is a convention to use sd.name+"_hist" for histogram values on a study</b> See {@link CIQ.Studies.createHistogram} for details</p>
	 * @param  {CIQ.ChartEngine} stx	  The chart object
	 * @param  {studyDescriptor} sd	   The study descriptor
	 * @param  {array} quotes   The quotes (dataSegment)
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.displayHistogramWithSeries=function(stx, sd, quotes) {
		var panel=stx.panels[sd.panel];
		var opacity=0.5;
		if(sd.underlay) opacity=0.3;
		CIQ.Studies.createHistogram(stx, sd, quotes, false, opacity);
		CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);
	};

	/**
	 * Plots over/under zones for indicators that support them, and when the user selects them. This method will draw its own
	 * yAxis which will not have a scale, but merely the over under points.
	 * Shading will be performed between the zone lines and the study plot.
	 * @param  {CIQ.ChartEngine} stx	  The chart object
	 * @param  {studyDescriptor} sd	   The study descriptor
	 * @param  {array} quotes   unused
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.drawZones=function(stx,sd,quotes){
		if(!sd.parameters || !sd.parameters.studyOverZonesEnabled) return;

		var low=parseFloat(sd.parameters.studyOverSoldValue);
		var high=parseFloat(sd.parameters.studyOverBoughtValue);
		var lowColor=sd.parameters.studyOverSoldColor;
		var highColor=sd.parameters.studyOverBoughtColor;
		var output=sd.zoneOutput;
		if(!output) output="Result";
		var zoneColor=CIQ.Studies.determineColor(sd.outputs[output]);
		if(!zoneColor || zoneColor=="auto" || CIQ.isTransparent(zoneColor)) zoneColor=stx.defaultColor;
		if(!lowColor) lowColor=zoneColor;
		if(!lowColor || lowColor=="auto" || CIQ.isTransparent(lowColor)) lowColor=stx.defaultColor;
		if(!highColor) highColor=zoneColor;
		if(!highColor || highColor=="auto" || CIQ.isTransparent(highColor)) highColor=stx.defaultColor;
		var panel=stx.panels[sd.panel];
		var yAxis=stx.getYAxisByName(panel, sd.name) || panel.yAxis;
		var drawBorders=yAxis.displayBorder;
		if(stx.axisBorders===false) drawBorders=false;
		if(stx.axisBorders===true) drawBorders=true;
		if(yAxis.width===0) drawBorders=false;
		var yaxisPosition=stx.getYAxisCurrentPosition(yAxis,panel);
		var leftAxis=yaxisPosition=="left", rightJustify=yAxis.justifyRight;
		if(!rightJustify && rightJustify!==false){
			if(stx.chart.yAxis.justifyRight || stx.chart.yAxis.justifyRight===false) {
				rightJustify=stx.chart.yAxis.justifyRight;
			}else rightJustify=leftAxis;
		}
		var borderEdge=Math.round(yAxis.left+(leftAxis?yAxis.width:0))+0.5;
		var tickWidth=drawBorders?3:0; // pixel width of tick off edge of border

		var ctx=stx.chart.context;
		var color=ctx.fillStyle;

		stx.chart.context.globalAlpha=0.2;

		stx.startClip(panel.name, true);

		ctx.beginPath();
		var ph=Math.round(stx.pixelFromPrice(high,panel,yAxis))+0.5;
		ctx.strokeStyle=highColor;
		ctx.moveTo(panel.left,ph);
		ctx.lineTo(panel.right,ph);
		ctx.stroke();
		ctx.closePath();

		stx.chart.context.beginPath();
		var pl=Math.round(stx.pixelFromPrice(low,panel,yAxis))+0.5;
		ctx.strokeStyle=lowColor;
		ctx.moveTo(panel.left,pl);
		ctx.lineTo(panel.right,pl);
		ctx.stroke();
		ctx.closePath();

		var yAxisPlotter=new CIQ.Plotter();
		yAxisPlotter.newSeries("border", "stroke", stx.canvasStyle("stx_grid_border"));
		if(drawBorders){
			var tickLeft=leftAxis?borderEdge-tickWidth:borderEdge-0.5;
			var tickRight=leftAxis?borderEdge+0.5:borderEdge+tickWidth;
			yAxisPlotter.moveTo("border", tickLeft, ph);
			yAxisPlotter.lineTo("border", tickRight, ph);
			yAxisPlotter.moveTo("border", tickLeft, pl);
			yAxisPlotter.lineTo("border", tickRight, pl);
		}

		ctx.fillStyle=color;

		var params={skipTransform:stx.panels[sd.panel].name!=sd.chart.name, panelName:sd.panel, band:output + " " + sd.name, yAxis:yAxis};
		CIQ.preparePeakValleyFill(stx,CIQ.extend(params,{threshold:high, direction:1, color:highColor}));
		CIQ.preparePeakValleyFill(stx,CIQ.extend(params,{threshold:low, direction:-1, color:lowColor}));

		ctx.globalAlpha=1;

		if(!sd.study || !sd.study.yaxis){
			if(drawBorders){
				var b=Math.round(yAxis.bottom)+0.5;
				yAxisPlotter.moveTo("border", borderEdge, yAxis.top);
				yAxisPlotter.lineTo("border", borderEdge, b);
				yAxisPlotter.draw(stx.chart.context, "border");
			}

			if(yAxis.width!==0){
				// Draw the y-axis with high/low
				stx.canvasFont("stx_yaxis");
				stx.canvasColor("stx_yaxis");
				ctx.textAlign=rightJustify?"right":"left";
				if(leftAxis){
					textX=yAxis.left + 3;
					if(rightJustify) textX=yAxis.left + yAxis.width - tickWidth - 3;
				}else{
					textX=yAxis.left + tickWidth + 3;
					if(rightJustify) textX=yAxis.left + yAxis.width;
				}
				ctx.fillStyle=highColor;
				ctx.fillText(high, textX, ph);
				ctx.fillStyle=lowColor;
				ctx.fillText(low, textX, pl);
				ctx.fillStyle=color;
			}
		}
		stx.endClip();
		ctx.globalAlpha=1;

		if(yAxis.name==sd.name) yAxis.yAxisPlotter=new CIQ.Plotter();
	};


	/**
	 * Draws a histogram on the study.
	 * Initial bar color is defined in stx-chart.css under '.stx_histogram'. If using the default UI, refer to provided css files under '.stx_histogram' and '.ciq-night .stx_histogram' style sections.
	 * If sd.outputs["Decreasing Bar"] and sd.outputs["Increasing Bar"] are present, their corresponding colors will be used instead.
	 * <p><b>Note the convention to use sd.name+"_hist" for histogram values on a study</b></p>
	 *
	 * @param  {CIQ.ChartEngine} stx	  The chart object
	 * @param  {studyDescriptor} sd	   The study descriptor
	 * @param  {array} quotes   The quotes (dataSegment)
	 * @param  {boolean} centered If true then the histogram will be physically centered on the yAxis, otherwise it will be centered at the zero value on the yAxis
	 * @param  {number} [opacity=1] Optionally set the opacity
	 * @memberOf CIQ.Studies
	 */

	CIQ.Studies.createHistogram=function(stx, sd, quotes, centered, opacity){
		var panel = stx.panels[sd.panel];
		var yAxis=stx.getYAxisByName(panel,sd.name), myAxis=yAxis||panel.yAxis;
		stx.startClip(panel.name);

		var myWidth=stx.layout.candleWidth-2;
		if(myWidth<2) myWidth=1;

		var y=stx.pixelFromPrice(0, panel, yAxis);
		if(myAxis.min>0) y=stx.pixelFromPrice(myAxis.min, panel, yAxis); // Don't draw below the bottom of the chart. If zero isn't on the chart then make it behave like a bar graph.
		if(centered){
			y=Math.floor(panel.top + panel.height/2);
		}

		var context=stx.chart.context;
		var field=sd.name+"_hist";
		if(!sd.outputs["Decreasing Bar"] && !sd.outputs["Negative Bar"])
			stx.canvasColor("stx_histogram");
		else
			context.globalAlpha=opacity?opacity:1;
		var y0=null,y1=null;
		var outputs=sd.outputs;
		for(var i=0;i<quotes.length;i++){
			var quote=quotes[i];
			if(!quote) continue;
			if(quote.candleWidth) myWidth=Math.floor(Math.max(1,quote.candleWidth-2));
			var x0=Math.floor(stx.pixelFromBar(i, panel.chart)-myWidth/2);
			var x1=Math.floor(myWidth);
			if(y0===null){
				var tick=stx.tickFromPixel(x0,panel.chart)-1;
				if(tick<0) y0=y1;
				else y0=stx.pixelFromPrice(stx.chart.dataSet[tick][field], panel, yAxis)-y;
			}else{
				y0=y1;
			}
			y1=stx.pixelFromPrice(quote[field], panel, yAxis)-y;

			var decreasingBarColor = CIQ.Studies.determineColor(outputs["Decreasing Bar"]);
			var increasingBarColor = CIQ.Studies.determineColor(outputs["Increasing Bar"]);
			var positiveBarColor = CIQ.Studies.determineColor(outputs["Positive Bar"]);
			var negativeBarColor = CIQ.Studies.determineColor(outputs["Negative Bar"]);

			if(decreasingBarColor && y1>y0) context.fillStyle=decreasingBarColor;
			else if(increasingBarColor && y1<y0) context.fillStyle=increasingBarColor;
			else if(positiveBarColor && y1<0) context.fillStyle=positiveBarColor;
			else if(negativeBarColor && y1>0) context.fillStyle=negativeBarColor;
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
	 * @param  {CIQ.ChartEngine} stx	  The chart object
	 * @param  {studyDescriptor} sd	   The study descriptor
	 * @param  {object} colorMap Map of colors to arrays. Each array should contain entries for each dataSegment bar mapped to that color.
	 * It should contain null values for any bar that shouldn't be drawn
	 * @param {object} borderMap Map of border colors for each color. If null then no borders will be drawn.
	 * @example
	 * var colorMap={};
	 * colorMap["#FF0000"]=[56,123,null,null,45];
	 * colorMap["#00FF00"]=[null,null,12,13,null];
	 *
	 * var borderMap={
	 *	"#FF0000": "#FFFFFF",
	 *	"#00FF00": "#FFFFDD"
	 * };
	 * CIQ.Studies.volumeChart(stx, sd, colorMap, borderMap);
	 * @memberOf CIQ.Studies
	 * @deprecated since 6.0.0 Use {@link CIQ.ChartEngine#drawHistogram} instead. 
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
		var borderColor=null;
		if(!sd.parameters || !sd.parameters.displayBorder) borderMap = null;
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
			"simple":"ma",
			"exponential":"ema",
			"time series":"tsma",
			"triangular":"tma",
			"variable":"vma",
			"VIDYA":"vdma",
			"weighted":"wma",
			"welles wilder":"smma",
			"true":"y",
			"false":"n"
	};

	CIQ.Studies.prettyRE=/^.*\((.*?)\).*$/;

	/**
	 * Convert a study ID into a displayable format
	 * @param  {string} id The ID
	 * @return {string}	A pretty (shortened) ID
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
	 * Returns an array of input field names which are used  to specify the field for the study.
	 * In most cases, this field is called "Field", but it does not have to be, nor does there need to be only one.
	 *
	 * @param  {studyDescriptor} sd	   The study descriptor
	 * @return {array}		   Input fields used to specify the field
	 * @since 3.0.0
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.getFieldInputs=function(sd){
		var res=[];
		var defaultInputs=sd.study.inputs;
		for(var input in defaultInputs){
			if(defaultInputs[input]=="field") res.push(input);
		}
		return res;
	};

	/**
	 * The default initialize function for a study. It creates the study descriptor. It creates the panel if one is required.
	 *
	 * @param  {CIQ.ChartEngine} stx		The chart object
	 * @param  {string} type	   The type of study (from studyLibrary)
	 * @param  {object} inputs	 The inputs for the study instance
	 * @param  {object} outputs	The outputs for the study instance
	 * @param  {object} [parameters] Optional parameters if required or supported by this study
	 * @param {string} [panelName] Optional panel. If not provided then the panel will be determined dynamically.
	 * @param {object} [study]	Optionally supply a study definition to use in lieu of the study library entry
	 * @return {object}			The newly initialized study descriptor
	 * @since 3.0.0 added study argument
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.initializeFN=function(stx, type, inputs, outputs, parameters, panelName, study){
		function determinePanelForOverlay(inputs, parameters, panels){
			var panel=null;
			var fieldInputs=CIQ.Studies.getFieldInputs(sd);
			var highLowBars=stx.chart.highLowBars || stx.highLowBars[stx.layout.chartType];
			for(var f=0;f<fieldInputs.length;f++){
				var st=CIQ.Studies.studyPanelMap[inputs[fieldInputs[f]]];
				if(st) {
					panel=st.panel;
					break;
				}
			}
			if(!panel) panel=parameters.chartName;	// If a panel isn't specified then this is an overlay on the chart itself
			return panel;
		}
		if(!inputs) inputs={
			id: type
		};
		if(!parameters) parameters={};
		if(!inputs.display) inputs.display=inputs.id;
		var sd=new CIQ.Studies.StudyDescriptor(inputs.id, type, inputs.id, inputs, outputs, parameters);
		if(inputs.Period) sd.days=Math.max(1,parseInt(sd.inputs.Period,10)); // you can't have fractional or non-positive day periods
		if(study) {
			if(!study.inputs) study.inputs=sd.study.inputs;
			if(!study.outputs) study.outputs=sd.study.outputs;
			sd.study=study;
		}
		else study=sd.study;
		if(study.display) inputs.display=study.display; // override what is displayed in the label
		if(!panelName) panelName=inputs.id;
		var isOverlay=false, isUnderlay=false;
		if(parameters.panelName=="Own panel"){
			sd.underlay=sd.overlay=false;
		}else{
			isOverlay=sd.overlay || study.overlay || inputs.Overlay || !!parameters.panelName;
			isUnderlay=sd.underlay || study.underlay || inputs.Underlay || (parameters.panelName && parameters.underlayEnabled);
			if(isUnderlay) sd.underlay=true;
			if(isOverlay) sd.overlay=true;
		}

		var oldStudy=parameters.replaceID?stx.layout.studies[parameters.replaceID]:null;
		if(oldStudy && (stx.panelExists(parameters.replaceID) || isOverlay || isUnderlay)){
			if(isOverlay || isUnderlay){
				if (parameters.replaceID != sd.inputs.id) {	// delete the old study if using a different id (not modifying the same study )
					delete stx.layout.studies[parameters.replaceID];
					delete stx.overlays[parameters.replaceID];
				}
				CIQ.deleteRHS(CIQ.Studies.studyPanelMap, oldStudy);
				if(stx.panelExists(parameters.replaceID)) {
					// Note this also removes any overlays on the removed panel
					stx.panelClose(stx.panels[parameters.replaceID]); // This can happen if oldStudy was a panel
				}
				if(stx.panels[parameters.panelName]) sd.panel=parameters.panelName;
				else sd.panel=determinePanelForOverlay(inputs, parameters, stx.panels);
			}else{
				sd.panel=panelName;
				var newPanels={};
				for(var p in stx.panels){
					if(p==parameters.replaceID){
						// swap the name/id of the old panel
						var tmp=stx.panels[p];
						tmp.name=panelName;
						if(tmp.yAxis) tmp.yAxis.name=panelName;
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
			if(!isOverlay && !isUnderlay) stx.panels[panelName].yAxis.name=sd.name;
			if(!sd.underlay && sd.panel==stx.chart.name) isOverlay=sd.overlay=true;  //set to overlay if the panel name is "chart"
		}else if(!isOverlay && !isUnderlay){
			var panelHeight=study.panelHeight?study.panelHeight:null;
			var yAxis=new CIQ.ChartEngine.YAxis(study.yAxis);
			yAxis.name=sd.name;
			if (oldStudy){	// This can happen if oldStudy was an overlay
				if(parameters.replaceID != sd.inputs.id) {
					CIQ.Studies.removeStudy(stx, oldStudy);
				}else{
					delete stx.overlays[parameters.replaceID];
				}
			}
			stx.createPanel(inputs.display, inputs.id, panelHeight, parameters.chartName, yAxis);
		}else{
			sd.panel=determinePanelForOverlay(inputs, parameters, stx.panels);
		}
		var panel=stx.panels[sd.panel];
		var needsNewYAxis=true;
		if(oldStudy){
			var oldPanel=stx.panels[oldStudy.panel];
			var oldYAxis=stx.getYAxisByName(oldPanel, oldStudy.name);
			if(oldPanel && oldYAxis){
				oldYAxis.name=sd.name;
				needsNewYAxis=(oldPanel!=panel || oldYAxis.position!=parameters.yaxisDisplayValue);
				if(needsNewYAxis) stx.deleteYAxisIfUnused(oldPanel, oldYAxis);
				else if(!parameters.yaxisDisplayColor || parameters.yaxisDisplayColor=="auto") delete oldYAxis.textStyle;
				else oldYAxis.textStyle=CIQ.colorToHex(parameters.yaxisDisplayColor);
			}
		}
		if(needsNewYAxis){
			var syAxis=study?CIQ.clone(study.yAxis):null;
			if(syAxis) CIQ.extend(syAxis,parameters.yAxis);
			else syAxis=parameters.yAxis;
			if(isOverlay || isUnderlay){
				if((syAxis || parameters.yaxisDisplayValue) && parameters.yaxisDisplayValue!="shared"){
					var yAxisParams={name:sd.name, position:parameters.yaxisDisplayValue=="default"?"":parameters.yaxisDisplayValue};
					if(syAxis) yAxisParams=CIQ.extend(syAxis,yAxisParams);
					var proposedYAxis=new CIQ.ChartEngine.YAxis(yAxisParams);
					if(proposedYAxis.position=="none") proposedYAxis.width=0;  // nasty trick to bind study to a hidden axis
					var newYAxis=stx.addYAxis(panel, proposedYAxis);
					if(proposedYAxis.position=="none") newYAxis.width=0;  // just in case axis existed already
					newYAxis.displayGridLines=false;
					if(parameters.yaxisDisplayColor && parameters.yaxisDisplayColor!="auto") newYAxis.textStyle=CIQ.colorToHex(parameters.yaxisDisplayColor);
				}
			}else{
				if(syAxis){
					syAxis=CIQ.extend(panel.yAxis, syAxis);
					if(syAxis.ground) syAxis.initialMarginBottom=0;
					if(syAxis.ground ||
							syAxis.initialMarginTop || syAxis.initialMarginTop===0 ||
							syAxis.initialMarginBottom || syAxis.initialMarginBottom===0){
						stx.calculateYAxisMargins(syAxis);
					}
				}else{
					var sparameters=study?study.parameters:null;
					if(sparameters && (sparameters.zoom || sparameters.zoom===0)){ // LEGACY, instead add a yAxis to the study
						panel.yAxis.zoom=sparameters.zoom; // Optionally set the default zoom in the "parameters" in the study library
					}else if(!panel.yAxis.zoom){
						panel.yAxis.zoom=10;	// Default to slight zoom when adding study panels so that studies are not up on the edge
					}
				}
				if(parameters.yaxisDisplayValue &&
					parameters.yaxisDisplayValue!="shared"){
					panel.yAxis.position=parameters.yaxisDisplayValue=="default"?"":parameters.yaxisDisplayValue;
					panel.yAxis.width=parameters.yaxisDisplayValue=="none"?0:CIQ.ChartEngine.YAxis.prototype.width;
					panel.yAxis.justifyRight=null;
					if(!parameters.yaxisDisplayColor || parameters.yaxisDisplayColor=="auto") delete panel.yAxis.textStyle;
					else panel.yAxis.textStyle=CIQ.colorToHex(parameters.yaxisDisplayColor);
					stx.calculateYAxisPositions();
				}else if(syAxis && syAxis.position){
					stx.calculateYAxisPositions();
				}
			}
		}
		if(!study.yAxis && stx.panels[inputs.id]){
			stx.panels[inputs.id].yAxis.displayGridLines=stx.displayGridLinesInStudies;
		}

		return sd;
	};

	/**
	 * @deprecated Since 5.2.0. Use {@link CIQ.Studies.drawZones} instead.
	 */
	CIQ.Studies.overZones=CIQ.Studies.drawZones;

	/**
	 * A sample display function for an overlay. An overlay displays in the chart area.
	 *
	 * Also note the use of clipping to ensure that the overlay doesn't print outside of the panel
	 *
	 * Finally note that when color=="auto" you can use stx.defaultColor which will automatically adjust based on the background color. This
	 * is the default for studies that use the color picker for user selection of output colors.
	 * @param {CIQ.ChartEngine} stx A chart engine instance
	 * @param {studyDescriptor} sd
	 * @param {array} quotes Array of quotes
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.displayPSAR2=function(stx, sd, quotes){
		var panel=stx.panels[sd.panel];
		var yAxis=stx.getYAxisByName(panel,sd.name);
		var sharingChartAxis=(panel.name==panel.chart.name && !yAxis);
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
				if(sharingChartAxis && quote.transform) quote=quote.transform;
				var x0=stx.pixelFromBar(x, panel.chart);
				if(squareWave) x0-=candleWidth/2;
				var y0=stx.pixelFromTransformedValue(quote[field], panel, yAxis);
				if(x===0 || !quotes[x-1] || (!quotes[x-1][field] && quotes[x-1][field]!==0)) {
					ctx.moveTo(x0,y0);
				}
				if(squareWave) {
					ctx.lineTo(x0,y0);
					ctx.lineTo(x0+candleWidth, y0);
					if(quotes[x+1]){
						var quote_1=quotes[x+1];
						if(sharingChartAxis && quote_1.transform) quote_1=quote_1.transform;
						if(!quote_1[field] && quote_1[field]!==0){
							ctx.lineTo(x0+candleWidth, stx.pixelFromTransformedValue(quote_1[sd.referenceOutput + " " + sd.name], stx.panels[sd.panel], yAxis));
						}
					}
				}else{
					ctx.moveTo(x0-pointWidth/2,y0);
					ctx.lineTo(x0+pointWidth/2,y0);
				}
			}
			ctx.lineWidth=1;
			if(sd.highlight) ctx.lineWidth=3;
			var color=CIQ.Studies.determineColor(sd.outputs[output]);
			if(color=="auto") color=stx.defaultColor;	// This is calculated and set by the kernel before draw operation.
			ctx.strokeStyle=color;
			ctx.stroke();
			ctx.closePath();
			ctx.lineWidth=1;
		}
		stx.endClip();
	};

	/**
	 * A sample of a custom initialization function. It is rare that one would be required. In this case we simply customize the input display
	 * but otherwise call the default.
	 * @param {CIQ.ChartEngine} stx A chart engine instance
	 * @param {*} type Type to pass to initialization function
	 * @param {object} inputs Study inputs
	 * @param {object} outputs Study ouptuts
	 * @return {*} Initialization callback's data
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.initializeStochastics=function(stx, type, inputs, outputs){
		inputs.display=stx.translateIf("Stoch") +" (" + inputs.Period + ")";
		return CIQ.Studies.initializeFN.apply(null, arguments);
	};

	/**
	 * A simple calculation function. Volume is already obtained, so all that is done here is setting colors.
	 * @param {CIQ.ChartEngine} stx A chart engine instance
	 * @param {studyDescriptor} sd Study to calculate volume for
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.calculateVolume=function(stx, sd){
		var outputs=sd.outputs;
		var colorUp = CIQ.Studies.determineColor(outputs["Up Volume"]);
		var colorDown = CIQ.Studies.determineColor(outputs["Down Volume"]);
		if(sd.type!="vol undr"){
			stx.setStyle("stx_volume_up", "color", colorUp);
			stx.setStyle("stx_volume_down", "color", colorDown);
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
				stx.setStyle("stx_volume_underlay_up", "color", colorUp);
				stx.setStyle("stx_volume_underlay_down", "color", colorDown);
				// use css for border so it can be configured.
				//if(colorUp) stx.setStyle("stx_volume_underlay_up", "border-left-color", colorUp);
				//if(colorDown) stx.setStyle("stx_volume_underlay_down", "border-left-color", colorDown);
			}
		}
	};


	/**
	 * Moving Average convenience function
	 * @param  {string}   type	The type of moving average, e.g. simple, exponential, triangular, etc
	 * @param  {number}   periods Moving average period
	 * @param  {string}   field   The field in the data array to perform the moving average on
	 * @param  {number}   offset  Periods to offset the result by
	 * @param  {string}   name	String to prefix to the name of the output.  Full name of output would be name + " " + sd.name, for instance "Signal MACD"
	 * @param  {CIQ.ChartEngine} stx	 Chart object
	 * @param  {object}   sd	  Study Descriptor
	 * @param  {string}   subField	  Subfield within field to perform moving average on, if applicable.  For example, IBM.Close: field:"IBM", subField:"Close"
	 * @memberOf CIQ.Studies
	 * @since 04-2015
	 */
	CIQ.Studies.MA=function(type, periods, field, offset, name, stx, sd, subField){
		var ma=new CIQ.Studies.StudyDescriptor(name + " " + sd.name, "ma", sd.panel);
		ma.chart=sd.chart;
		ma.days=parseInt(periods,10);
		ma.startFrom=sd.startFrom;
		if(subField) ma.subField=subField;
		ma.inputs={};
		if(type) ma.inputs.Type=type;
		if(field) ma.inputs.Field=field;
		if(offset) ma.inputs.Offset=parseInt(offset,10);
		CIQ.Studies.calculateMovingAverage(stx, ma);
	};

	// Moving average data; add to it if adding moving average functionality
	CIQ.Studies.movingAverage={
		//conversions: mapping of study type to moving average type name
		conversions:{
			"ma":"simple",
			"sma":"simple",
			"ema":"exponential",
			"tsma":"time series",
			"tma":"triangular",
			"vma":"variable",
			"vdma":"vidya",
			"wma":"weighted",
			"smma":"welles wilder"
		},
		//translations: mapping of moving average type name to display name
		translations:{
			"simple":"Simple",
			"exponential":"Exponential",
			"time series":"Time Series",
			"triangular":"Triangular",
			"variable":"Variable",
			"vidya":"VIDYA",
			"weighted":"Weighted",
			"welles wilder":"Welles Wilder"
		},
		//typeMap: mapping of both study type and type name to calculation function suffix
		//i.e., calculateMovingAverageXXX
		typeMap:{
			"ema": "Exponential", "exponential": "Exponential",
			"tsma": "TimeSeries", "time series": "TimeSeries",
			"tma": "Triangular", "triangular": "Triangular",
			"vma": "Variable", "variable": "Variable",
			"vdma": "VIDYA", "vidya": "VIDYA",
			"wma": "Weighted", "weighted": "Weighted",
			"smma": "Exponential", "welles wilder": "Exponential"
		}
	};
	/**
	 * Does conversions for valid moving average types
	 * @param  {CIQ.ChartEngine} stx The chart object
	 * @param  {string} input String to test if a moving average type or "options" to return the list of ma options.
	 * @return {Object} The name of the moving average or a list of options
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.movingAverageHelper=function(stx,input){
		if(input=="options"){
			var translations={};
			for(var t in CIQ.Studies.movingAverage.translations){
				translations[t]=stx.translateIf(CIQ.Studies.movingAverage.translations[t]);
			}
			return translations;
		}
		return CIQ.Studies.movingAverage.conversions[input];
	};

	/**
	 * Creates a volume underlay for the chart.
	 * The underlay height is a % of the chart height as determined by the `HeightPercentage` study parameter.
	 * Each bar width will be determined by `widthFactor` study parameter.
	 * @param {CIQ.ChartEngine} stx A chart engine instance
	 * @param {studyDescriptor} sd A study descriptor
	 * @param {array} quotes Array of quotes
	 * @memberOf CIQ.Studies
	 * @deprecated use {@link CIQ.Studies.createVolumeChart}
	 * @example
	 *  // default study library entry with required parameters
		"vol undr": {
			"name": "Volume Underlay",
			"underlay": true,
			"seriesFN": CIQ.Studies.createVolumeChart,
			"calculateFN": CIQ.Studies.calculateVolume,
			"inputs": {},
			"outputs": {"Up Volume":"#8cc176","Down Volume":"#b82c0c"},
			"customRemoval": true,
			"removeFN": function(stx, sd){
					stx.layout.volumeUnderlay=false;
					stx.changeOccurred("layout");
				},
			"parameters": {
				"init":{heightPercentage: 0.25},
				"widthFactor":1
			}
		}
	 */
	CIQ.Studies.volUnderlay=function(stx, sd, quotes){
		CIQ.Studies.createVolumeChart(stx, sd, quotes);
	};

	/**
	 *
	 * Creates a volume chart.
	 * If no volume is available on the screen then the panel will be watermarked "Volume Not Available" (translated if a translate function is attached to the kernel object).
	 * Each bar width will be determined by `widthFactor` study parameter.
	 * @param {CIQ.ChartEngine} stx A chart engine instance
	 * @param {studyDescriptor} sd A study descriptor
	 * @param {array} quotes Array of quotes
	 * @memberOf CIQ.Studies
	 * @example
	 *  // default study library entry with required parameters
		"volume": {
			"name": "Volume Chart",
			"range": "0 to max",
			"yAxis": {"ground":true, "initialMarginTop":0},
			"seriesFN": CIQ.Studies.createVolumeChart,
			"calculateFN": CIQ.Studies.calculateVolume,
			"inputs": {},
			"outputs": {"Up Volume":"#8cc176","Down Volume":"#b82c0c"},
			"parameters": {
				"zoom": 0,
				"widthFactor":1
			}
		}
	 */
	CIQ.Studies.createVolumeChart=function(stx, sd, quotes){
		var panel=sd.panel, inputs=sd.inputs, underlay=sd.underlay,overlay=sd.overlay;
		var inAnotherPanel = underlay || overlay;
		var style=underlay?"stx_volume_underlay":"stx_volume";
		var seriesParam=[{
			field:				"Volume",
			fill_color_up:		stx.canvasStyle(style+"_up").color,
			border_color_up:	stx.canvasStyle(style+"_up").borderLeftColor,
			opacity_up:			stx.canvasStyle(style+"_up").opacity,
			fill_color_down:	stx.canvasStyle(style+"_down").color,
			border_color_down:	stx.canvasStyle(style+"_down").borderLeftColor,
			opacity_down:		stx.canvasStyle(style+"_down").opacity
		}];

		var seriesParam0=seriesParam[0];
		// Major backward compatibility hack. If the border color is the same as our standard color
		// then most likely the customer is missing border: #000000 style on stx_volume_up and stx_volume_down
		if(!underlay && seriesParam0.border_color_down==="rgb(184, 44, 12)"){
			seriesParam0.border_color_down="#000000";
			seriesParam0.border_color_up="#000000";
		}

		var yAxis=stx.getYAxisByName(panel,sd.name);
		var params={
			name: 				"Volume",
			panel:				panel,
			yAxis:				yAxis,
			heightPercentage:	inputs.HeightPercentage?inputs.HeightPercentage:inAnotherPanel?0.25:null,
			widthFactor:		1,
			bindToYAxis: 		!yAxis || yAxis.position!="none"
		};
		CIQ.extend(params, sd.study.parameters);
		CIQ.extend(params, sd.parameters);

		if(stx.colorByCandleDirection){
			seriesParam0.color_function=function(quote){
				var O=quote.Open,C=quote.Close;
				//if((!O && O!==0) || (!C && C!==0) || O===C) return stx.defaultColor;

				return {
					fill_color: O>C ? seriesParam0.fill_color_down : seriesParam0.fill_color_up,
					border_color: O>C ? seriesParam0.border_color_down : seriesParam0.border_color_up,
					opacity: O>C ? seriesParam0.opacity_down : seriesParam0.opacity_up
				};
			};
		}
		sd.outputMap.Volume=null;

		stx.drawHistogram(params, seriesParam);
	};

	/**
	 * A sample study calculation function. Note how sd.chart.scrubbed is used instead of dataSet. Also note the naming convention
	 * for the outputs.
	 * @param {CIQ.ChartEngine} stx A chart engine instance
	 * @param {studyDescriptor} sd A study descriptor
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
			sd.error=true;
			return;
		}
		for(var i=sd.startFrom;i<quotes.length;i++){
			if(!i) continue;
			var quote=quotes[i];
			var quote1=quotes[i-1];
			var change=quote.Close-quote1.Close;
			var num=Math.min(i,sd.days);

			var avgGain=quote1["_avgG "+sd.name];
			if(!avgGain) avgGain=0;
			avgGain-=avgGain/num;

			var avgLoss=quote1["_avgL "+sd.name];
			if(!avgLoss) avgLoss=0;
			avgLoss-=avgLoss/num;

			if(change>0){
				avgGain+=change/num;
			}else{
				avgLoss-=change/num;
			}
			if(i>=sd.days) quote["RSI "+sd.name]=computeRSI(avgGain, avgLoss);
			//intermediates
			quote["_avgG "+sd.name]=avgGain;
			quote["_avgL "+sd.name]=avgLoss;
		}
		sd.zoneOutput="RSI";
	};

	/**
	 * Calculate function for MACD study
	 * @param  {CIQ.ChartEngine} stx Chart object
	 * @param  {studyDescriptor} sd  Study Descriptor
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.calculateMACD=function(stx, sd) {
		var quotes=sd.chart.scrubbed;
		var inputs=sd.inputs, name=sd.name;
		if(!sd.macd1Days) sd.macd1Days=parseFloat(inputs["Fast MA Period"]);
		if(!sd.macd2Days) sd.macd2Days=parseFloat(inputs["Slow MA Period"]);
		if(!sd.signalDays) sd.signalDays=parseFloat(inputs["Signal Period"]);
		if(!sd.days) sd.days=Math.max(sd.macd1Days,sd.macd2Days,sd.signalDays);
		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}

		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";

		var maType=inputs["Moving Average Type"];
		if(!maType) maType="exponential";

		CIQ.Studies.MA(maType, sd.macd1Days, field, 0, "_MACD1", stx, sd);
		CIQ.Studies.MA(maType, sd.macd2Days, field, 0, "_MACD2", stx, sd);

		var i, quote, start=Math.max(sd.startFrom,sd.days-1);
		for(i=start;i<quotes.length;i++){
			quote=quotes[i];
			quote["MACD "+name]=quote["_MACD1 "+name]-quote["_MACD2 "+name];
		}
		var sigMaType=inputs["Signal MA Type"];
		if(!sigMaType) sigMaType="exponential";
		CIQ.Studies.MA(sigMaType, sd.signalDays, "MACD "+name, 0, "Signal", stx, sd);

		var histogram=name+"_hist";
		for(i=start;i<quotes.length;i++){
			quote=quotes[i];
			var signal=quote["Signal "+name];
			if(!signal && signal!==0) continue;	// don't create histogram before the signal line is valid
			quote[histogram]=quote["MACD "+name]-quote["Signal "+name];
		}
	};

	/**
	 * Calculate function for standard deviation.
	 * @param  {CIQ.ChartEngine} stx Chart object
	 * @param  {studyDescriptor} sd  Study Descriptor
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.calculateStandardDeviation=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";
		var type=sd.inputs["Moving Average Type"];
		if(!type) type=sd.inputs.Type;
		CIQ.Studies.MA(type, sd.days, field, sd.inputs.Offset, "_MA", stx, sd);

		var acc1=0;
		var acc2=0;
		var ma=0;
		var mult=Number(sd.inputs["Standard Deviations"]);
		if(mult<0) mult=2;
		var name=sd.name;
		for(var p in sd.outputs){
			name=p + " " + name;
		}
		var i, val, its;
		for(i=sd.startFrom-1, its=0; i>=0 && its<sd.days; i--, its++){
			val=quotes[i][field];
			if(val && typeof(val)=="object") val=val[sd.subField];
			if(isNaN(val)) val=0;
			acc1+=Math.pow(val,2);
			acc2+=val;
		}
		for(i=sd.startFrom;i<quotes.length;i++){
			var quote=quotes[i];
			val=quote[field];
			if(val && typeof(val)=="object") val=val[sd.subField];
			if(isNaN(val)) val=0;
			acc1+=Math.pow(val,2);
			acc2+=val;
			if(i<sd.days-1) continue;
			if(i>=sd.days){
				var val2=quotes[i-sd.days][field];
				if(val2 && typeof(val2)=="object") val2=val2[sd.subField];
				if(isNaN(val2)) val2=0;
				acc1-=Math.pow(val2,2);
				acc2-=val2;
			}
			ma=quote["_MA "+sd.name];
			quote[name]=Math.sqrt((acc1+sd.days*Math.pow(ma,2)-2*ma*acc2)/sd.days) * mult;
		}
	};

	/**
	 * Calculate function for moving averages. sd.inputs["Type"] can be used to request a specific type of moving average.
	 * @param {CIQ.ChartEngine} stx A chart engine instance
	 * @param {studyDescriptor} sd A study descriptor
	 * @return {undefined}
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.calculateMovingAverage=function(stx, sd){
		if(!sd.chart.scrubbed) return;
		var type=sd.inputs.Type;
		if(type=="ma" || type=="sma" || !type) type="simple";	// handle when the default inputs are passed in
		var typeMap=CIQ.Studies.movingAverage.typeMap;
		if (type in typeMap) {
			return CIQ.Studies["calculateMovingAverage" + typeMap[type]](stx, sd);
		}else if (type !== "simple") {
			return;
		}
		var quotes=sd.chart.scrubbed;
		var acc=0;
		var vals=[];
		var name=sd.name;
		for(var p in sd.outputs){
			name=p + " " + name;
		}
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";	// Handle when the default inputs are passed in
		var offset=parseInt(sd.inputs.Offset,10);
		if(isNaN(offset)) offset=0;
		var i, val, start=sd.startFrom;
		// backload the past data into the array
		var offsetBack=offset;
		for(i=sd.startFrom-1;i>=0;i--){
			val=quotes[i][field];
			if(val && typeof(val)=="object") val=val[sd.subField];
			if(!val && val!==0) continue;
			if(offsetBack>0){
				offsetBack--;
				start=i;
				continue;
			}
			if(vals.length==sd.days-1) break;
			acc+=val;
			vals.unshift(val);
		}
		if(vals.length<sd.days-1) {
			vals=[];
			start=0;  // not enough records to continue where left off
		}
		for(i=start;i<quotes.length;i++){
			var quote=quotes[i];
			val=quote[field];
			if(val && typeof(val)=="object") val=val[sd.subField];
			var notOverflowing=i+offset>=0 && i+offset<quotes.length;
			var offsetQuote=notOverflowing?quotes[i+offset]:null;
			if(!val && val!==0){
				if(offsetQuote) offsetQuote[name]=null;
				continue;
			}
			acc+=val;
			vals.push(val);
			if(vals.length>sd.days) acc-=vals.shift();
			if(offsetQuote) offsetQuote[name]=(vals.length==sd.days) ? acc/sd.days : null;
		}
	};

	/**
	 * Calculate function for exponential moving average
	 * @param  {CIQ.ChartEngine} stx Chart object
	 * @param  {studyDescriptor} sd  Study Descriptor
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.calculateMovingAverageExponential=function(stx, sd){
		var type=sd.inputs.Type;
		var quotes=sd.chart.scrubbed;
		var acc=0;
		var ma=0;
		var ii=0;
		var multiplier = (2/(sd.days+1));
		if (type === "welles wilder" || type === "smma") multiplier = 1 / sd.days;

		var emaPreviousDay = null;
		var name=sd.name;
		for(var p in sd.outputs){
			name=p + " " + name;
		}

		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";	// Handle when the default inputs are passed in
		var offset=parseInt(sd.inputs.Offset,10);
		if(isNaN(offset)) offset=0;
		var i, val;
		var start=sd.startFrom;
		// find emaPreviousDay
		var offsetBack=offset;
		for(i=sd.startFrom-1;i>=0;i--){
			val=quotes[i][name];
			if(!val && val!==0) continue;
			if(emaPreviousDay===null) emaPreviousDay=val;
			ii=sd.days;
			if(offsetBack<=0) break;
			offsetBack--;
			start=i;
		}
		if(emaPreviousDay===null) {
			emaPreviousDay=start=0;
		}
		for(i=start;i<quotes.length;i++){
			var quote=quotes[i];
			val=quote[field];
			if(val && typeof(val)=="object") val=val[sd.subField];
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
			}else if(ii<sd.days-1) {
				acc+=val;
				ma=acc/(ii+1);
				if(offsetQuote) offsetQuote[name]=null;
			}else if(ii===0){
				acc+=val;
				ma=acc;
				if(offsetQuote) offsetQuote[name]=null;
			}else if(emaPreviousDay || emaPreviousDay===0){
				ma = ((val-emaPreviousDay)*multiplier)+emaPreviousDay;
				if(offsetQuote) offsetQuote[name]=ma;
			}
			emaPreviousDay=ma;
			ii++;
		}
	};

	/**
	 * Calculate function for variable moving average
	 * @param  {CIQ.ChartEngine} stx Chart object
	 * @param  {studyDescriptor} sd  Study Descriptor
	 * @memberOf CIQ.Studies
	 * @since 5.2.1 moved VIYDA to calculateMovingAverageVIDYA
	 */
	CIQ.Studies.calculateMovingAverageVariable=function(stx, sd){
		var type=sd.inputs.Type;
		var quotes=sd.chart.scrubbed;
		var alpha = (2/(sd.days+1));

		var vmaPreviousDay = null;
		var name=sd.name;
		for(var p in sd.outputs){
			name=p + " " + name;
		}

		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";	// Handle when the default inputs are passed in

		sd.cmo=new CIQ.Studies.StudyDescriptor(sd.name, "cmo", sd.panel);
		sd.cmo.chart=sd.chart;
		sd.cmo.days=9;
		sd.cmo.inputs={"Field":field};
		sd.cmo.startFrom=sd.startFrom;
		sd.cmo.outputs={"_CMO":null};
		CIQ.Studies.calculateChandeMomentum(stx, sd.cmo);

		var offset=parseInt(sd.inputs.Offset,10);
		if(isNaN(offset)) offset=0;

		var i, val;
		var start=sd.startFrom;
		// find vmaPreviousDay
		var offsetBack=offset;
		for(i=sd.startFrom-1;i>=0;i--){
			val=quotes[i][name];
			if(!val && val!==0) continue;
			if(vmaPreviousDay===null) vmaPreviousDay=val;
			if(offsetBack<=0) break;
			offsetBack--;
			start=i;
		}
		if(vmaPreviousDay===null) {
			vmaPreviousDay=start=0;
		}

		for(i=start;i<quotes.length;i++){
			var quote=quotes[i];
			val=quote[field];
			if(val && typeof(val)=="object") val=val[sd.subField];
			var notOverflowing=i+offset>=0 && i+offset<quotes.length;
			var offsetQuote=notOverflowing?quotes[i+offset]:null;
			if(!val && val!==0){
				if(offsetQuote) offsetQuote[name]=null;
				continue;
			}
			if(!quote["_CMO "+sd.name] && quote["_CMO "+sd.name]!==0) continue;
			var vi=Math.abs(quote["_CMO "+sd.name])/100;
			var vma=(alpha*vi*val)+((1-(alpha*vi))*vmaPreviousDay);
			vmaPreviousDay=vma;
			if(i<sd.days) vma=null;
			if(offsetQuote) offsetQuote[name]=vma;
		}
	};

	/**
	 * Calculate function for VI Dynamic MA (VIDYA)
	 * @param  {CIQ.ChartEngine} stx Chart object
	 * @param  {studyDescriptor} sd  Study Descriptor
	 * @memberOf CIQ.Studies
	 * @since 5.2.1
	 */
	CIQ.Studies.calculateMovingAverageVIDYA=function(stx, sd){
		var type=sd.inputs.Type;
		var quotes=sd.chart.scrubbed;
		var alpha = (2/(sd.days+1));

		var vmaPreviousDay = null;
		var name=sd.name;
		for(var p in sd.outputs){
			name=p + " " + name;
		}

		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";	// Handle when the default inputs are passed in

		sd.std=new CIQ.Studies.StudyDescriptor(sd.name, "sdev", sd.panel);
		sd.std.chart=sd.chart;
		sd.std.days=5;
		sd.std.startFrom=sd.startFrom;
		sd.std.inputs={"Field":field, "Standard Deviations":1, "Type":"ma"};
		sd.std.outputs={"_STD":null};
		CIQ.Studies.calculateStandardDeviation(stx,sd.std);

		CIQ.Studies.MA("ma", 20, "_STD "+sd.name, 0, "_MASTD", stx, sd);

		var offset=parseInt(sd.inputs.Offset,10);
		if(isNaN(offset)) offset=0;

		var i, val;
		var start=sd.startFrom;
		// find vmaPreviousDay
		var offsetBack=offset;
		for(i=sd.startFrom-1;i>=0;i--){
			val=quotes[i][name];
			if(!val && val!==0) continue;
			if(vmaPreviousDay===null) vmaPreviousDay=val;
			if(offsetBack<=0) break;
			offsetBack--;
			start=i;
		}
		if(vmaPreviousDay===null) {
			vmaPreviousDay=start=0;
		}

		for(i=start;i<quotes.length;i++){
			var quote=quotes[i];
			val=quote[field];
			if(val && typeof(val)=="object") val=val[sd.subField];
			var notOverflowing=i+offset>=0 && i+offset<quotes.length;
			var offsetQuote=notOverflowing?quotes[i+offset]:null;
			if(!val && val!==0){
				if(offsetQuote) offsetQuote[name]=null;
				continue;
			}
			if(!quote["_MASTD "+sd.name] && quote["_MASTD "+sd.name]!==0) continue;
			var vi=quote["_STD "+sd.name]/quote["_MASTD "+sd.name];
			var vma=(alpha*vi*val)+((1-(alpha*vi))*vmaPreviousDay);
			vmaPreviousDay=vma;
			if(i<sd.days) vma=null;
			if(offsetQuote) offsetQuote[name]=vma;
		}
	};

	/**
	 * Calculate function for time series moving average
	 * @param  {CIQ.ChartEngine} stx Chart object
	 * @param  {studyDescriptor} sd  Study Descriptor
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.calculateMovingAverageTimeSeries=function(stx, sd){
		sd.ma=new CIQ.Studies.StudyDescriptor(sd.name, "ma", sd.panel);
		sd.ma.chart=sd.chart;
		sd.ma.days=sd.days;
		sd.ma.startFrom=sd.startFrom;
		sd.ma.inputs=sd.inputs;
		CIQ.Studies.calculateLinearRegressionIndicator(stx, sd.ma);

		var name=sd.name;
		for(var p in sd.outputs){
			name=p + " " + name;
		}
		var offset=parseInt(sd.inputs.Offset,10);
		if(isNaN(offset)) offset=0;
		var quotes=sd.chart.scrubbed;
		// find start
		var offsetBack=offset;
		for(var i=sd.startFrom-1;i>=0;i--){
			var val=quotes[i][name];
			if(!val && val!==0) continue;
			if(offsetBack>0){
				offsetBack--;
				continue;
			}
			break;
		}
		for(i++;i<quotes.length;i++){
			var quote=quotes[i];
			if(i+offset>=0 && i+offset<quotes.length) quotes[i+offset][name]=quote["Forecast "+sd.name];
		}
	};

	/**
	 * Calculate function for triangular moving average
	 * @param  {CIQ.ChartEngine} stx Chart object
	 * @param  {studyDescriptor} sd  Study Descriptor
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.calculateMovingAverageTriangular=function(stx, sd){
		var quotes=sd.chart.scrubbed;

		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";	// Handle when the default inputs are passed in
		var days=Math.ceil(sd.days/2);
		CIQ.Studies.MA("simple", days, field, 0, "TRI1", stx, sd);
		if(sd.days%2===0) days++;
		CIQ.Studies.MA("simple", days, "TRI1 "+sd.name, 0, "TRI2", stx, sd);

		var name=sd.name;
		for(var p in sd.outputs){
			name=p + " " + name;
		}
		var offset=parseInt(sd.inputs.Offset,10);
		if(isNaN(offset)) offset=0;

		// find start
		var offsetBack=offset;
		for(var i=sd.startFrom-1;i>=0;i--){
			var val=quotes[i][name];
			if(!val && val!==0) continue;
			if(offsetBack>0){
				offsetBack--;
				continue;
			}
			break;
		}
		for(i++;i<quotes.length;i++){
			if(i+offset>=0 && i+offset<quotes.length) quotes[i+offset][name]=quotes[i]["TRI2 "+sd.name];
		}
		return;
	};

	/**
	 * Calculate function for weighted moving average
	 * @param  {CIQ.ChartEngine} stx Chart object
	 * @param  {studyDescriptor} sd  Study Descriptor
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
		var i, val;
		var vals=[];
		var start=sd.startFrom;
		// backload the past data into the array
		var offsetBack=offset;
		for(i=sd.startFrom-1;i>=0;i--){
			val=quotes[i][field];
			if(val && typeof(val)=="object") val=val[sd.subField];
			if(!val && val!==0) continue;
			if(offsetBack>0){
				offsetBack--;
				start=i;
				continue;
			}
			if(vals.length==sd.days-1) break;
			vals.unshift(val);
		}
		if(vals.length<sd.days-1) {
			vals=[];
			start=0;  // not enough records to continue where left off
		}
		for(i=0;i<vals.length;i++){
			accAdd+=(i+1)*vals[i];
			accSubtract+=vals[i];
		}
		for(i=start;i<quotes.length;i++){
			var quote=quotes[i];
			val=quote[field];
			if(val && typeof(val)=="object") val=val[sd.subField];
			var notOverflowing=i+offset>=0 && i+offset<quotes.length;
			var offsetQuote=notOverflowing?quotes[i+offset]:null;
			if(!val && val!==0){
				if(offsetQuote) offsetQuote[name]=null;
				continue;
			}
			vals.push(val);
			if(vals.length>sd.days) {
				accAdd-=accSubtract;
				accSubtract-=vals.shift();
			}
			accAdd+=vals.length*val;
			accSubtract+=val;

			if(i<sd.days-1){
				if(offsetQuote) offsetQuote[name]=null;
			}else{
				if(offsetQuote) offsetQuote[name]=accAdd/divisor;
			}
		}
	};

	/**
	 * Calculate function for klinger
	 * @param  {CIQ.ChartEngine} stx Chart object
	 * @param  {studyDescriptor} sd  Study Descriptor
	 * @memberOf CIQ.Studies
	 */

	CIQ.Studies.calculateKlinger=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var shortCycle=Number(sd.inputs["Short Cycle"]);
		var longCycle=Number(sd.inputs["Long Cycle"]);
		if(quotes.length<Math.max(shortCycle,longCycle)+1){
			sd.error=true;
			return;
		}

		var field=sd.name+"_hist",
			klinger="Klinger " + sd.name,
			klingerSignal="KlingerSignal " + sd.name,
			signedVolume="_SV " + sd.name,
			shortEMA="_EMA-S " + sd.name,
			longEMA="_EMA-L " + sd.name,
			i;
		for(i=Math.max(1,sd.startFrom);i<quotes.length;i++){
			var sv=quotes[i].Volume;
			if(quotes[i]["hlc/3"]<quotes[i-1]["hlc/3"]) sv*=-1;
			quotes[i][signedVolume]=sv;
		}

		CIQ.Studies.MA("exponential", shortCycle, signedVolume, 0, "_EMA-S", stx, sd);
		CIQ.Studies.MA("exponential", longCycle, signedVolume, 0, "_EMA-L", stx, sd);

		for(i=Math.max(longCycle,sd.startFrom);i<quotes.length;i++){
			quotes[i][klinger]=quotes[i][shortEMA]-quotes[i][longEMA];
		}

		CIQ.Studies.MA("exponential", Number(sd.inputs["Signal Periods"]), klinger, 0, "KlingerSignal", stx, sd);

		for(i=sd.startFrom;i<quotes.length;i++){
			quotes[i][field]=quotes[i][klinger]-quotes[i][klingerSignal];
		}
	};

	/**
	 * Calculate function for stochastics
	 * @param  {CIQ.ChartEngine} stx Chart object
	 * @param  {studyDescriptor} sd  Study Descriptor
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.calculateStochastics=function(stx, sd){
		if(!sd.smooth) sd.smooth=(sd.inputs.Smooth);
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";

		var fastPeriod=sd.inputs["%K Periods"];
		if(!fastPeriod) fastPeriod=sd.days;

		var quotes=sd.chart.scrubbed;
		if(quotes.length<Math.max(fastPeriod,sd.days)+1){
			sd.error=true;
			return;
		}

		var smoothingPeriod=sd.inputs["%K Smoothing Periods"];
		if(smoothingPeriod) sd.smooth=true;
		else if(sd.smooth) smoothingPeriod=3;

		var slowPeriod=sd.inputs["%D Periods"];
		if(!slowPeriod) slowPeriod=3;

		function computeStochastics(position, field, days){
			var beg=position-days+1;
			var high=Number.MAX_VALUE*-1, low=Number.MAX_VALUE;
			for(var i=beg;i<=position;i++){
				low=Math.min(low, quotes[i].Low);
				high=Math.max(high, quotes[i].High);
			}
			var k= high==low ? 0 : (quotes[position][field]-low)/(high-low)*100;
			return k;
		}

		sd.outputMap={};
		sd.outputMap["%K "+sd.name]="Fast";
		sd.outputMap["%D "+sd.name]="Slow";

		for(var i=Math.max(fastPeriod, sd.startFrom);i<quotes.length;i++){
			quotes[i][sd.name]=computeStochastics(i,field,fastPeriod);
		}

		CIQ.Studies.MA("simple", sd.smooth?smoothingPeriod:1, sd.name, 0, "%K", stx, sd);
		CIQ.Studies.MA("simple", slowPeriod, "%K "+sd.name, 0, "%D", stx, sd);
	};


	CIQ.Studies.calculateStudyATR=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var period=sd.days;
		if(quotes.length<period+1){
			sd.error=true;
			return;
		}
		var total=0;
		var name=sd.name;
		for(var i=Math.max(sd.startFrom,1);i<quotes.length;i++){
			var prices=quotes[i];
			var pd=quotes[i-1];
			var trueRange=prices.trueRange;
			if(pd["Sum True Range " + name]) total=pd["Sum True Range " + name];
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
		if(sd.startFrom>0){
			SAR=quotes[sd.startFrom-1]["Result " + sd.name];
			var state=quotes[sd.startFrom-1]["_state " + sd.name];
			if(state && state.length==3){
				af=state[0];
				ep=state[1];
				lasttrend=state[2];
			}
		}
		for(var i=sd.startFrom-1;i<quotes.length-1;i++){
			if(i<0) continue;
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
			quotes[i+1]["_state " + sd.name]=[af,ep,lasttrend];
		}
	};

	CIQ.Studies.calculateTRIX=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}
		var name=sd.name;
		var fields=["Close","_MA1 "+name,"_MA2 "+name,"_MA3 "+name];
		for(var e=0; e<fields.length-1; e++){
			CIQ.Studies.MA("exponential", sd.days, fields[e], 0, "_MA"+(e+1).toString(), stx, sd);
		}

		var ma3=fields[3];
		for(var i=Math.max(1,sd.startFrom);i<quotes.length;i++){
			var q0=quotes[i-1][ma3];
			if(!q0) continue;
			quotes[i]["Result " + name]=100*((quotes[i][ma3]/q0)-1);
		}
	};

	CIQ.Studies.calculateIntradayMomentum=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var period=sd.days;
		if(quotes.length<period+1){
			sd.error=true;
			return;
		}

		var totalUp=0;
		var totalDown=0;
		if(sd.startFrom>1){
			totalUp=quotes[sd.startFrom-1]["_totUp " + sd.name];
			totalDown=quotes[sd.startFrom-1]["_totDn " + sd.name];
		}
		for(var i=sd.startFrom;i<quotes.length;i++){
			var diff=quotes[i].Close-quotes[i].Open;
			if(diff>0) totalUp+=diff;
			else totalDown-=diff;
			if(i>=period){
				var pDiff=quotes[i-period].Close-quotes[i-period].Open;
				if(pDiff>0) totalUp-=pDiff;
				else totalDown+=pDiff;
			}
			quotes[i]["Result " + sd.name]=100*totalUp/(totalUp+totalDown);
			quotes[i]["_totUp " + sd.name]=totalUp;
			quotes[i]["_totDn " + sd.name]=totalDown;
		}
	};

	CIQ.Studies.calculateQStick=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}
		for(var i=sd.startFrom;i<quotes.length;i++){
			quotes[i]["_Close-Open " + sd.name]=quotes[i].Close-quotes[i].Open;
		}
		CIQ.Studies.MA(sd.inputs["Moving Average Type"], sd.days, "_Close-Open "+sd.name, 0, "Result", stx, sd);
	};

	CIQ.Studies.calculateSchaff=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var period=sd.days;
		var shortCycle=Number(sd.inputs["Short Cycle"]);
		var longCycle=Number(sd.inputs["Long Cycle"]);
		if(quotes.length<Math.max(period,shortCycle,longCycle)+1){
			sd.error=true;
			return;
		}
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";
		var factor=0.5;

		CIQ.Studies.MA(sd.inputs["Moving Average Type"], shortCycle, field, 0, "_MACD1", stx, sd);
		CIQ.Studies.MA(sd.inputs["Moving Average Type"], longCycle, field, 0, "_MACD2", stx, sd);

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
		for(var i=sd.startFrom;i<quotes.length;i++){
			var quote=quotes[i];
			quote["Result "+sd.name]=f2;

			if(i<longCycle-1) continue;
			quote["_MACD "+sd.name]=quote["_MACD1 "+sd.name]-quote["_MACD2 "+sd.name];

			if(i<longCycle+(period-1)) continue;
			var lh=getLLVHHV(period,i,"_MACD");
			f1=(lh[1]>lh[0]?(100*(quote["_MACD "+sd.name]-lh[0])/(lh[1]-lh[0])):f1);
			quote["_PF "+sd.name]=( quotes[i-1]["_PF "+sd.name] ? quotes[i-1]["_PF "+sd.name]+factor*(f1-quotes[i-1]["_PF "+sd.name]) : f1 );

			if(i<longCycle+2*(period-1)) continue;
			lh=getLLVHHV(period,i,"_PF");
			f2=(lh[1]>lh[0]?(100*(quote["_PF "+sd.name]-lh[0])/(lh[1]-lh[0])):f2);
			quote["Result "+sd.name]=( quotes[i-1]["Result "+sd.name] ? quotes[i-1]["Result "+sd.name]+factor*(f2-quotes[i-1]["Result "+sd.name]) : f2 );
		}
	};

	CIQ.Studies.calculateStochMomentum=function(stx, sd){
		var pKPeriods=Number(sd.inputs["%K Periods"]);
		var pKSmoothPeriods=Number(sd.inputs["%K Smoothing Periods"]);
		var pK2SmoothPeriods=Number(sd.inputs["%K Double Smoothing Periods"]);
		var pDPeriods=Number(sd.inputs["%D Periods"]);

		var quotes=sd.chart.scrubbed;
		if(quotes.length<pKPeriods+pKSmoothPeriods+pK2SmoothPeriods-1 || quotes.length<pDPeriods){
			sd.error=true;
			return;
		}

		function getLLVHHV(p,x){
			var l=null, h=null;
			for(var j=x-p+1;j<=x;j++){
				l=(l===null?quotes[j].Low:Math.min(l,quotes[j].Low));
				h=(h===null?quotes[j].High:Math.max(h,quotes[j].High));
			}
			return [l,h];
		}

		var i;
		for(i=Math.max(pKPeriods, sd.startFrom)-1;i<quotes.length;i++){
			var quote=quotes[i];
			var lh=getLLVHHV(pKPeriods,i);
			quote["_H "+sd.name]=quote.Close-(lh[0]+lh[1])/2;
			quote["_DHL "+sd.name]=lh[1]-lh[0];
		}

		CIQ.Studies.MA("exponential", pKSmoothPeriods, "_H "+sd.name, 0, "_HS1", stx, sd);
		CIQ.Studies.MA("exponential", pK2SmoothPeriods, "_HS1 "+sd.name, 0, "_HS2", stx, sd);
		CIQ.Studies.MA("exponential", pKSmoothPeriods, "_DHL "+sd.name, 0, "_DHL1", stx, sd);
		CIQ.Studies.MA("exponential", pK2SmoothPeriods, "_DHL1 "+sd.name, 0, "_DHL2", stx, sd);

		for(i=pKPeriods-1;i<quotes.length;i++){
			quotes[i]["%K "+sd.name]=(quotes[i]["_HS2 "+sd.name]/(0.5*quotes[i]["_DHL2 "+sd.name]))*100;
		}

		CIQ.Studies.MA(sd.inputs["%D Moving Average Type"], pDPeriods, "%K "+sd.name, 0, "%D", stx, sd);

		sd.zoneOutput="%K";
	};

	CIQ.Studies.calculateEhlerFisher=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}

		function getLLVHHV(p,x){
			var l=Number.MAX_VALUE, h=Number.MAX_VALUE*-1;
			for(var j=x-p+1;j<=x;j++){
				var d=(quotes[j].High+quotes[j].Low)/2;
				l=Math.min(l,d);
				h=Math.max(h,d);
			}
			return [l,h];
		}

		var n=0;
		if(sd.startFrom>1) n=quotes[sd.startFrom-1]["_n "+sd.name];
		for(var i=sd.startFrom;i<quotes.length;i++){
			var quote=quotes[i];
			if(i<sd.days-1){
				quote["EF "+sd.name]=quote["EF Trigger "+sd.name]=n;
				continue;
			}
			var lh=getLLVHHV(sd.days,i);
			n=0.33*2*((((quotes[i].High+quotes[i].Low)/2)-lh[0])/(Math.max(0.000001,lh[1]-lh[0]))-0.5)+0.67*n;
			if(n>0) n=Math.min(n,0.9999);
			else if(n<0) n=Math.max(n,-0.9999);
			var previous=i?quotes[i-1]["EF "+sd.name]:0;
			quote["EF "+sd.name]=0.5*Math.log((1+n)/(1-n))+0.5*previous;
			quote["EF Trigger "+sd.name]=previous;
			quote["_n "+sd.name]=n;
		}
	};

	CIQ.Studies.calculatePrettyGoodOscillator=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}

		CIQ.Studies.MA("exponential", sd.days, "trueRange", 0, "_EMA", stx, sd);
		CIQ.Studies.MA("simple", sd.days, "Close", 0, "_SMA", stx, sd);

		for(var i=Math.max(1,sd.startFrom);i<quotes.length;i++){
			if(!quotes[i]["_SMA "+sd.name] || !quotes[i]["_EMA "+sd.name]) continue;
			quotes[i]["Result " + sd.name]=(quotes[i].Close-quotes[i]["_SMA "+sd.name])/quotes[i]["_EMA "+sd.name];
		}
	};

	CIQ.Studies.calculateUltimateOscillator=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var cycle=[sd.inputs["Cycle 1"],sd.inputs["Cycle 2"],sd.inputs["Cycle 3"]];
		var start=Math.max(cycle[0],cycle[1],cycle[2]);
		if(quotes.length<start+1){
			sd.error=true;
			return;
		}
		var c01=cycle[0]*cycle[1];
		var c02=cycle[0]*cycle[2];
		var c12=cycle[1]*cycle[2];
		var accbp=[0,0,0];
		var acctr=[0,0,0];
		if(sd.startFrom){
			if(quotes[sd.startFrom-1]["_accbp " + sd.name]) accbp=quotes[sd.startFrom-1]["_accbp " + sd.name].slice();
			if(quotes[sd.startFrom-1]["_acctr " + sd.name]) acctr=quotes[sd.startFrom-1]["_acctr " + sd.name].slice();
		}
		for(var i=Math.max(1,sd.startFrom);i<quotes.length;i++){
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
			quotes[i]["_accbp " + sd.name]=accbp.slice();
			quotes[i]["_acctr " + sd.name]=acctr.slice();
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
		if(sd.startFrom>1){
			total=quotes[sd.startFrom-1]["Result "+sd.name];
		}
		for(var i=Math.max(1,sd.startFrom);i<quotes.length;i++){
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
		var quotes=sd.chart.scrubbed, direction=0;
		var quote, quote1;
		for(var i=sd.startFrom;i<quotes.length;i++){
			quote=quotes[i];
			if(!i || !quote[field]) continue;
			if(quotes[i-1][field]) quote1=quotes[i-1];
			if(!quote1) continue;

			if(quote[field]-quote1[field]>minTick) direction=1;
			else if(quote1[field]-quote[field]>minTick) direction=-1;
			else if(obv) direction=0;

			var total=quote1["Result " + sd.name];
			if(!total) total=0;
			total+=quote.Volume*direction;
			quote["Result " + sd.name]=total;
		}
	};

	CIQ.Studies.calculateVolumeIndex=function(stx, sd){
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";
		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}
		var total=100;
		if(sd.startFrom>1) total=quotes[sd.startFrom-1]["Index " + sd.name];
		for(var i=Math.max(1,sd.startFrom);i<quotes.length;i++){
			var val=quotes[i][field], vol=quotes[i].Volume;
			if(val && typeof(val)=="object") {
				vol=val.Volume;
				val=val[sd.subField];
			}
			var val1=quotes[i-1][field], vol1=quotes[i-1].Volume;
			if(val1 && typeof(val1)=="object") {
				vol1=val1.Volume;
				val1=val1[sd.subField];
			}
			if(!val) continue;
			if(!val1) continue;
			if((sd.type=="Pos Vol" && vol>vol1) ||
			   (sd.type=="Neg Vol" && vol<vol1)){
				total*=(val/val1);
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
			return days;
		}
		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";
		var mult=sd.inputs["Standard Deviations"];
		if(mult<0) mult=1;
		var annualizingFactor=100*Math.sqrt(intFactor(sd.inputs["Days Per Year"]))*mult;

		var arr=[];
		var accum=0;
		if(sd.startFrom>1){
			accum=quotes[sd.startFrom-1]["_state " + sd.name][0];
			arr=quotes[sd.startFrom-1]["_state " + sd.name][1].slice();
		}
		for(var i=Math.max(1,sd.startFrom);i<quotes.length;i++){
			var denom=quotes[i-1][field];
			if(denom) {
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
			quotes[i]["_state " + sd.name]=[accum,arr.slice()];
		}
	};

	CIQ.Studies.calculateSwingIndex=function(stx, sd){
		var T=sd.inputs["Limit Move Value"];
		if(T===null || isNaN(T)) T=99999;
		var quotes=sd.chart.scrubbed;
		var total=0;
		if(sd.startFrom>1) total=quotes[sd.startFrom-1]["Result " + sd.name];
		for(var i=Math.max(1,sd.startFrom);i<quotes.length;i++){

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

		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}

		var smoothTR=0;
		var smoothPlusDM=0;
		var smoothMinusDM=0;
		var runningDX=0;
		var quote;
		for(var i=Math.max(1,sd.startFrom);i<quotes.length;i++){
			quote=quotes[i];
			var plusDM=Math.max(0,quote.High-quotes[i-1].High);
			var minusDM=Math.max(0,quotes[i-1].Low-quote.Low);
			if(plusDM>minusDM) minusDM=0;
			else if(minusDM>plusDM) plusDM=0;
			else plusDM=minusDM=0;

			if(i<=period){
				smoothPlusDM+=plusDM;
				smoothMinusDM+=minusDM;
				smoothTR+=quote["True Range " + sd.name];
			}else{
				smoothPlusDM=quotes[i-1]["_sm+DM "+sd.name]*(period-1)/period+plusDM;
				smoothMinusDM=quotes[i-1]["_sm-DM "+sd.name]*(period-1)/period+minusDM;
				smoothTR=quotes[i-1]["_smTR "+sd.name]*(period-1)/period+quote["True Range " + sd.name];
			}
			quote["_sm+DM "+sd.name]=smoothPlusDM;
			quote["_sm-DM "+sd.name]=smoothMinusDM;
			quote["_smTR "+sd.name]=smoothTR;

			if(i<period) continue;

			var plusDI=100*smoothPlusDM/smoothTR;
			var minusDI=100*smoothMinusDM/smoothTR;
			var DX=100*Math.abs(plusDI-minusDI)/(plusDI+minusDI);

			quote["+DI " + sd.name]=plusDI;
			quote["-DI " + sd.name]=minusDI;
			if(sd.inputs.Series!==false && smoothing){
				if(i<period+smoothing-1){
					if(i==sd.startFrom){
						for(var j=period;j<sd.startFrom;j++){
							runningDX+=100*Math.abs(quotes[j]["+DI " + sd.name]-quotes[j]["-DI " + sd.name])/(quotes[j]["+DI " + sd.name]+quotes[j]["-DI " + sd.name]);
						}
					}
					runningDX+=DX;
				}else if(i==period+smoothing-1){
					quote["ADX " + sd.name]=runningDX/smoothing;
				}else{
					quote["ADX " + sd.name]=(quotes[i-1]["ADX " + sd.name]*(smoothing-1) + DX)/smoothing;
				}
			}
			if(sd.inputs.Histogram){
				var histogram=sd.name+"_hist";
				if(!quote["+DI "+sd.name] && quote["+DI "+sd.name]!==0) continue;
				if(!quote["-DI "+sd.name] && quote["-DI "+sd.name]!==0) continue;
				quote[histogram]=quote["+DI "+sd.name]-quote["-DI "+sd.name];
				if(sd.inputs.Series===false){  //delete these so yAxis computes max/min correctly
					quote["+DI " + sd.name]=null;
					quote["-DI " + sd.name]=null;
				}
			}
		}
	};

	CIQ.Studies.calculateRandomWalk=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}

		for(var i=Math.max(2,sd.startFrom);i<quotes.length;i++){
			var ttr=0;
			var high=quotes[i].High;
			var low=quotes[i].Low;
			var maxHigh=0;
			var maxLow=0;
			for(var j=1;j<=sd.days;j++){
				if(i<=j) {
					maxHigh=maxLow=0;
					break;
				}
				ttr+=quotes[i-j].trueRange;
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

	CIQ.Studies.calculateRateOfChange=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";
		if(sd.parameters.isVolume) field="Volume";
		var name=sd.name;
		for(var p in sd.outputs){
			name=p + " " + name;
		}

		var offset=sd.inputs["Center Line"];
		if(!offset) offset=0;
		else offset=parseInt(offset,10);

		for(var i=Math.max(sd.startFrom,sd.days);i<quotes.length;i++){
			var currentVal=quotes[i][field];
			if(currentVal && typeof(currentVal)=="object") currentVal=currentVal[sd.subField];
			var pastVal=quotes[i-sd.days][field];
			if(pastVal && typeof(pastVal)=="object") pastVal=pastVal[sd.subField];
			if(sd.type=="Momentum") quotes[i][name]=currentVal-pastVal + offset;
			else {
				var denom=pastVal;
				if( denom ){ // skip if denominator is 0 --
					quotes[i][name]=100*((currentVal/denom)-1) + offset;
				}
			}
		}
	};

	CIQ.Studies.calculateTypicalPrice=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var period=sd.days;
		if(quotes.length<period+1){
			if(!sd.overlay) sd.error=true;
			return;
		}
		var name=sd.name;
		for(var p in sd.outputs){
			name=p + " " + name;
		}
		var field="hlc/3";
		if(sd.type=="Med Price") field="hl/2";
		else if(sd.type=="Weighted Close") field="hlcc/4";

		var total=0;
		if(sd.startFrom<=period) sd.startFrom=0;
		for(var i=sd.startFrom;i<quotes.length;i++){
			if(i && quotes[i-1][name]) total=quotes[i-1][name]*period;
			total+=quotes[i][field];
			if(i>=period){
				total-=quotes[i-period][field];
				quotes[i][name]=total/period;
			}
		}
	};

	CIQ.Studies.calculateElderRay=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days){
			sd.error=true;
			return;
		}
		CIQ.Studies.MA("exponential", sd.days, "Close", 0, "_EMA", stx, sd);

		for(var i=Math.max(sd.startFrom,sd.days-1);i<quotes.length;i++){
			quotes[i][sd.name+"_hist1"]=quotes[i].High-quotes[i]["_EMA "+sd.name];
			quotes[i][sd.name+"_hist2"]=quotes[i].Low-quotes[i]["_EMA "+sd.name];
		}
	};

	CIQ.Studies.calculateElderForce=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days){
			sd.error=true;
			return;
		}
		for(var i=Math.max(1,sd.startFrom);i<quotes.length;i++){
			quotes[i]["_EF1 "+sd.name]=quotes[i].Volume*(quotes[i].Close-quotes[i-1].Close);
		}
		CIQ.Studies.MA("exponential", sd.days, "_EF1 "+sd.name, 0, "Result", stx, sd);
	};

	CIQ.Studies.calculateCenterOfGravity=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days){
			sd.error=true;
			return;
		}
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";
		for(var i=Math.max(sd.startFrom,sd.days-1);i<quotes.length;i++){
			var num=0,den=0;
			for(var j=0;j<sd.days;j++){
				num-=(j+1)*quotes[i-j][field];
				den+=quotes[i-j][field];
			}
			if(den) quotes[i]["Result "+sd.name]=num/den;
		}
	};

	CIQ.Studies.calculateEaseOfMovement=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days){
			sd.error=true;
			return;
		}
		for(var i=Math.max(1,sd.startFrom);i<quotes.length;i++){
			var avgCurrent=(quotes[i].High + quotes[i].Low)/2;
			var avgPrior=(quotes[i-1].High + quotes[i-1].Low)/2;
			var dm=avgCurrent-avgPrior;
			var br=(quotes[i].Volume/100000000)/(quotes[i].High-quotes[i].Low);
			var result = dm/br;
			if (!isFinite(result)) quotes[i]["_EOM1 "+sd.name]=NaN;	//With NaN, the study plotter will plot from the previous point
															//directly to the next point after the current tick. Infinity was making the
															//study not plot in the panel at all while the data point was in dataSegement.
			else quotes[i]["_EOM1 "+sd.name]=result;
		}
		CIQ.Studies.MA(sd.inputs["Moving Average Type"], sd.days, "_EOM1 "+sd.name, 0, "Result", stx, sd);
	};

	CIQ.Studies.calculateChaikinVolatility=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days){
			sd.error=true;
			return;
		}
		var i;
		for(i=sd.startFrom;i<quotes.length;i++){
			quotes[i]["_High-Low " + sd.name]=quotes[i].High - quotes[i].Low;
		}
		CIQ.Studies.MA(sd.inputs["Moving Average Type"], sd.days, "_High-Low "+sd.name, 0, "_MA", stx, sd);

		var roc=sd.inputs["Rate Of Change"];
		if(!roc) roc=sd.days;
		for(i=Math.max(sd.startFrom,roc);i<quotes.length;i++){
				if(!quotes[i-roc]["_MA "+sd.name]) continue;
					quotes[i]["Result " + sd.name]=100*((quotes[i]["_MA "+sd.name]/quotes[i-roc]["_MA "+sd.name])-1);
		}
	};

	CIQ.Studies.calculateChaikinMoneyFlow=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days){
			sd.error=true;
			return;
		}
		var sumMoneyFlow=0,sumVolume=0;
		var startQuote=quotes[sd.startFrom-1];
		if(startQuote){
			if(startQuote["_sumMF " + sd.name]) sumMoneyFlow=startQuote["_sumMF " + sd.name];
			if(startQuote["_sumV " + sd.name]) sumVolume=startQuote["_sumV " + sd.name];
		}
		for(var i=sd.startFrom;i<quotes.length;i++){
			if(quotes[i].High==quotes[i].Low) quotes[i]["_MFV " + sd.name]=0;
			else quotes[i]["_MFV " + sd.name]=quotes[i].Volume*(2*quotes[i].Close-quotes[i].High-quotes[i].Low)/(quotes[i].High-quotes[i].Low);
			sumMoneyFlow+=quotes[i]["_MFV " + sd.name];
			sumVolume+=quotes[i].Volume;
			if(i>sd.days-1){
				sumMoneyFlow-=quotes[i-sd.days]["_MFV " + sd.name];
				sumVolume-=quotes[i-sd.days].Volume;
				if(sumVolume) quotes[i]["Result " + sd.name]=sumMoneyFlow/sumVolume;
			}
			quotes[i]["_sumMF " + sd.name]=sumMoneyFlow;
			quotes[i]["_sumV " + sd.name]=sumVolume;
		}
	};

	CIQ.Studies.calculateTwiggsMoneyFlow=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days){
			sd.error=true;
			return;
		}
		var sumMoneyFlow=0,sumVolume=0;
		var startQuote=quotes[sd.startFrom-1];
		if(startQuote){
			if(startQuote["_sumMF " + sd.name]) sumMoneyFlow=startQuote["_sumMF " + sd.name];
			if(startQuote["_sumV " + sd.name]) sumVolume=startQuote["_sumV " + sd.name];
		}
		for(var i=Math.max(1,sd.startFrom);i<quotes.length;i++){
			var trh=Math.max(quotes[i-1].Close,quotes[i].High);
			var trl=Math.min(quotes[i-1].Close,quotes[i].Low);
			quotes[i]["_MFV " + sd.name]=quotes[i].Volume*(2*quotes[i].Close-trh-trl)/(trh-trl===0?999999:trh-trl);
			if(i>sd.days-1){
				sumMoneyFlow*=(sd.days-1)/sd.days;
				sumVolume*=(sd.days-1)/sd.days;
			}
			sumMoneyFlow+=quotes[i]["_MFV " + sd.name];
			sumVolume+=quotes[i].Volume;
			if(i>sd.days-1){
				if(sumVolume) quotes[i]["Result " + sd.name]=sumMoneyFlow/(sumVolume>0?sumVolume:999999);
			}
			quotes[i]["_sumMF " + sd.name]=sumMoneyFlow;
			quotes[i]["_sumV " + sd.name]=sumVolume;
		}
	};

	CIQ.Studies.calculateMassIndex=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(quotes.length<Math.max(9,sd.days+1)){
			sd.error=true;
			return;
		}
		for(var i=sd.startFrom;i<quotes.length;i++){
			quotes[i]["_High-Low " + sd.name]=quotes[i].High - quotes[i].Low;
		}

		CIQ.Studies.MA("exponential", 9, "_High-Low "+sd.name, 0, "_EMA", stx, sd);
		CIQ.Studies.MA("exponential", 9, "_EMA "+sd.name, 0, "_EMA2", stx, sd);

		var total=0;
		if(quotes[sd.startFrom-1] && quotes[sd.startFrom-1]["_total " + sd.name])
			total=quotes[sd.startFrom-1]["_total " + sd.name];
		for(var j=Math.max(17,sd.startFrom);j<quotes.length;j++){
			total+=quotes[j]["_EMA "+sd.name]/quotes[j]["_EMA2 "+sd.name];
			if(j>=17+sd.days-1){
				quotes[j]["Result " + sd.name]=total;
				total-=quotes[j-sd.days+1]["_EMA "+sd.name]/quotes[j-sd.days+1]["_EMA2 "+sd.name];
			}
			quotes[j]["_total " + sd.name]=total;
		}
	};

	CIQ.Studies.calculateMoneyFlowIndex=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}
		var cumPosMF=0, cumNegMF=0;
		var startQuote=quotes[sd.startFrom-1];
		var rawMFLbl="_rawMF " + sd.name;
		var cumMFLbl="_cumMF " + sd.name;
		var resultLbl="Result " + sd.name;
		if(startQuote && startQuote[cumMFLbl]){
			cumPosMF=startQuote[cumMFLbl][0];
			cumNegMF=startQuote[cumMFLbl][1];
		}
		for(var i=sd.startFrom;i<quotes.length;i++){
			var typPrice=quotes[i]["hlc/3"];
			if(i>0){
				var lastTypPrice=quotes[i-1]["hlc/3"];
				var rawMoneyFlow=typPrice*quotes[i].Volume;
				if(typPrice>lastTypPrice){
					cumPosMF+=rawMoneyFlow;
				}else if(typPrice<lastTypPrice){
					rawMoneyFlow*=-1;
					cumNegMF-=rawMoneyFlow;
				}else{
					rawMoneyFlow=0;
				}
				if(i>sd.days){
					var old=quotes[i-sd.days][rawMFLbl];
					if(old>0) cumPosMF-=old;
					else cumNegMF+=old;
					if(cumNegMF===0) quotes[i][resultLbl]=100;
					else quotes[i][resultLbl]=100 - 100/(1 + (cumPosMF/cumNegMF));
				}
				quotes[i][rawMFLbl]=rawMoneyFlow;
				quotes[i][cumMFLbl]=[cumPosMF, cumNegMF];
			}
		}
	};

	CIQ.Studies.calculateChandeMomentum=function(stx, sd){
		var name=sd.name;
		for(var p in sd.outputs){
			name=p + " " + name;
		}
		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}

		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";  // only used when called from VMA

		var sumMomentum=0,absSumMomentum=0;
		var history=[];
		for(var i=sd.startFrom-sd.days+1;i<quotes.length;i++){
			if(i<1) continue;
			var q=quotes[i][field],q1=quotes[i-1][field];
			if(q && typeof(q)=="object") q=q.Close;
			if(q1 && typeof(q1)=="object") q1=q1.Close;
			if(q1===undefined) continue;  // the field is not defined yet

			var diff=q-q1;
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
		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";
		CIQ.Studies.MA("time series", sd.days, field, 0, "MA", stx, sd);
		for(var i=Math.max(1,sd.startFrom);i<quotes.length;i++){
			var val=quotes[i][field];
	   		if(val && typeof(val)=="object") val=val[sd.subField];
			quotes[i]["Result " + sd.name]=100*(1-(quotes[i]["MA "+sd.name]/val));
		}
	};

	CIQ.Studies.calculateDetrendedPrice=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";
		var offset=Math.floor(sd.days/2+1);
		CIQ.Studies.MA(sd.inputs["Moving Average Type"], sd.days, field, -offset, "MA", stx, sd);

		for(var i=Math.max(sd.days-offset-1,sd.startFrom-offset); i<quotes.length-offset; i++){
			var val=quotes[i][field];
			if(val && typeof(val)=="object") val=val[sd.subField];
			quotes[i]["Result " + sd.name]=val-quotes[i]["MA "+sd.name];
		}
	};

	CIQ.Studies.calculateAroon=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}
		var daysSinceHigh=0,daysSinceLow=0;
		var xDayHigh=null,xDayLow=null;
		if(sd.startFrom>0){
			var state=quotes[sd.startFrom-1]["_state "+sd.name];
			if(state){
				daysSinceHigh=state[0];
				daysSinceLow=state[1];
				xDayHigh=state[2];
				xDayLow=state[3];
			}
		}
		var j;
		for(var i=sd.startFrom;i<quotes.length;i++){
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
			quotes[i]["_state "+sd.name]=[daysSinceHigh,daysSinceLow,xDayHigh,xDayLow];
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
		for(var i=sd.startFrom;i<quotes.length;i++){
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
		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}
		sd.mhml=new CIQ.Studies.StudyDescriptor(sd.name, sd.type, sd.panel);
		sd.mhml.chart=sd.chart;
		sd.mhml.days=sd.days;
		sd.mhml.startFrom=sd.startFrom;
		sd.mhml.inputs={};
		sd.mhml.outputs={"_MHML":null};
		CIQ.Studies.calculateMaxHighMinLow(stx, sd.mhml);
		var sumChanges=0;
		var changes=[];
		for(var i=Math.max(1,sd.startFrom-sd.days);i<quotes.length;i++){
			var change=Math.abs(quotes[i].Close-quotes[i-1].Close);
			changes.push(change);
			sumChanges+=change;
			if(changes.length==sd.days){
				quotes[i]["Result " + sd.name]=quotes[i]["_MHML "+sd.name]/sumChanges;
				sumChanges-=changes.shift();
			}
		}
	};

	CIQ.Studies.calculatePriceOscillator=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var short=Number(sd.inputs["Short Cycle"]);
		var long=Number(sd.inputs["Long Cycle"]);
		if(quotes.length<Math.max(short,long)+1){
			sd.error=true;
			return;
		}
		var field=sd.inputs.Field;
		var maType=sd.inputs["Moving Average Type"];
		if(!maType) maType="simple";
		if(!field || field=="field") field="Close";
		if(sd.parameters.isVolume) {
			field="Volume";
			maType="exponential";
		}
		var pts=sd.inputs["Points Or Percent"];
		if(!pts) pts="Percent";

		CIQ.Studies.MA(maType, short, field, 0, "_Short MA", stx, sd);
		CIQ.Studies.MA(maType, long, field, 0, "_Long MA", stx, sd);

		for(var i=Math.max(long,sd.startFrom);i<quotes.length;i++){
			var quote=quotes[i];
			if(!quote) continue;
			if(pts=="Points") quote["Result " + sd.name]=quote["_Short MA " + sd.name]-quote["_Long MA " + sd.name];
			else quote["Result " + sd.name]=100*((quote["_Short MA " + sd.name]/quote["_Long MA " + sd.name])-1);
			if(sd.outputs["Increasing Bar"]) quote[sd.name+"_hist"]=quote["Result "+sd.name];
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

		var longDays=parseInt(sd.inputs["Long RoC"],10);
		if(!longDays) longDays=14;
		var shortDays=parseInt(sd.inputs["Short RoC"],10);
		if(!shortDays) shortDays=11;
		var period=sd.days;
		if(!period) period=10;
		if(longDays<shortDays) return;

		if(quotes.length<Math.max(shortDays,longDays,period)+1){
			sd.error=true;
			return;
		}
		for(var i=Math.max(sd.startFrom,longDays);i<quotes.length;i++){
			var denom1=quotes[i-shortDays][field];
			var denom2=quotes[i-longDays][field];
			if( denom1 && denom2 ){ // skip if denominator is 0 --
				quotes[i]["_Sum "+sd.name]=100*((quotes[i][field]/denom1)+(quotes[i][field]/denom2)-2);
			}
		}

		CIQ.Studies.MA("weighted", period, "_Sum "+sd.name, 0, "Result", stx, sd);
	};

	CIQ.Studies.calculateLinearRegressionIndicator=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";

		var sumWeights=sd.days*(sd.days+1)/2;
		var squaredSumWeights=Math.pow(sumWeights,2);
		var sumWeightsSquared=sumWeights*(2*sd.days+1)/3;

		var sumCloses=0;
		var sumWeightedCloses=0;
		var sumClosesSquared=0;
		if(sd.startFrom){
			var sums=quotes[sd.startFrom-1]["_sums "+sd.name];
			if(sums){
				sumWeightedCloses=sums[0];
				sumCloses=sums[1];
				sumClosesSquared=sums[2];
			}
		}
		for(var i=sd.startFrom;i<quotes.length;i++){
			var currentQuote=quotes[i][field];
			if(currentQuote && typeof(currentQuote)=="object") currentQuote=currentQuote[sd.subField];
			if(!currentQuote && currentQuote!==0) continue;
			sumWeightedCloses+=sd.days*currentQuote-sumCloses;
			sumCloses+=currentQuote;
			sumClosesSquared+=Math.pow(currentQuote,2);
			if(i<sd.days-1) continue;
			else if(i>sd.days-1) {
				var daysAgoQuote=quotes[i-sd.days][field];
				if(daysAgoQuote && typeof(daysAgoQuote)=="object") daysAgoQuote=daysAgoQuote[sd.subField];
				if(!daysAgoQuote && daysAgoQuote!==0) continue;
				sumCloses-=daysAgoQuote;
				sumClosesSquared-=Math.pow(daysAgoQuote,2);
			}
			var b=(sd.days*sumWeightedCloses-sumWeights*sumCloses)/(sd.days*sumWeightsSquared-squaredSumWeights);
			quotes[i]["Slope "+sd.name]=b;
			var a=(sumCloses-b*sumWeights)/sd.days;
			quotes[i]["Intercept "+sd.name]=a;
			quotes[i]["Forecast "+sd.name]=a+b*sd.days;
			var c=(sd.days*sumWeightsSquared-squaredSumWeights)/(sd.days*sumClosesSquared-Math.pow(sumCloses,2));
			quotes[i]["RSquared "+sd.name]=b*b*c;
			quotes[i]["_sums "+sd.name]=[sumWeightedCloses,sumCloses,sumClosesSquared];
		}
	};

	CIQ.Studies.calculateBollinger=function(stx, sd){
		var field=sd.inputs.Field;
		if(!field || field=="field") field="Close";

		CIQ.Studies.MA(sd.inputs["Moving Average Type"], sd.days, field, 0, "_MA", stx, sd);

		sd.std=new CIQ.Studies.StudyDescriptor(sd.name, "STD Dev", sd.panel);
		sd.std.chart=sd.chart;
		sd.std.startFrom=sd.startFrom;
		sd.std.days=sd.days;
		sd.std.inputs={"Field":field, "Standard Deviations":1, "Type":sd.inputs["Moving Average Type"]};
		sd.std.outputs={"_STD Dev":null};
		CIQ.Studies.calculateStandardDeviation(stx,sd.std);

		CIQ.Studies.calculateGenericEnvelope(stx, sd, sd.inputs["Standard Deviations"], "_MA "+sd.name, "_STD Dev "+sd.name);
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
	 * @param  {studyDescriptor} sd  Study Descriptor
	 * @param  {object} percentShift Used to calculate totalShift. Defaults to 0 (zero)
	 * @param  {object} [centerIndex=Close]  Quote element to use for center series (Open, Close, High, Low). Defaults to "Close"
	 * @param  {object} [offsetIndex=centerIndex]  Quote element to use for calculating totalShift (percentShift*quote[offsetIndex]+pointShift;)
	 * @param  {object} pointShift   Used to calculate totalShift.Defaults to 0 (zero)
	 * @memberOf CIQ.Studies
	 */
	CIQ.Studies.calculateGenericEnvelope=function(stx, sd, percentShift, centerIndex, offsetIndex, pointShift){
		if(!percentShift) percentShift=0;
		if(!pointShift) pointShift=0;
		if(!centerIndex || centerIndex=="field") centerIndex="Close";
		if(!offsetIndex) offsetIndex=centerIndex;
		var quotes=sd.chart.scrubbed;
		var field = sd.inputs.Field;
		if (!field || field === "field") field = "Close";
		for(var i=sd.startFrom;quotes && i<quotes.length;i++){
			var quote=quotes[i];
			if(!quote) continue;
			if(!quote[centerIndex]) continue;
			var closeValue=quote[field];
			if(closeValue && typeof(closeValue)=="object") closeValue=closeValue.Close;
			var centerValue=quote[centerIndex];
			if(centerValue && typeof(centerValue)=="object") centerValue=centerValue[sd.subField];
			var offsetValue=quote[offsetIndex];
			if(offsetValue && typeof(offsetValue)=="object") offsetValue=offsetValue[sd.subField];
			var totalShift=percentShift*offsetValue+pointShift;
			quote[sd.type + " Top " + sd.name]=centerValue+totalShift;
			quote[sd.type + " Bottom " + sd.name]=centerValue-totalShift;
			quote[sd.type + " Median " + sd.name]=centerValue;
			quote["Bandwidth " + sd.name]=centerValue?200*totalShift/centerValue:0;
			quote["%b " + sd.name]=50*((closeValue-centerValue)/totalShift+1);
		}
	};

	CIQ.Studies.calculateMaxHighMinLow=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		var highPeriod=sd.days, lowPeriod=sd.days;
		if(sd.inputs["High Period"]) highPeriod=sd.inputs["High Period"];
		if(sd.inputs["Low Period"]) lowPeriod=sd.inputs["Low Period"];
		if(quotes.length<Math.max(highPeriod,lowPeriod)+1){
			sd.error=true;
			return;
		}

		var low=Number.MAX_VALUE,high=Number.MAX_VALUE*-1;
		var j;
		if(sd.startFrom>1){
			for(j=1;j<highPeriod;j++){
				high=Math.max(high,quotes[sd.startFrom-j].High);
			}
			for(j=1;j<lowPeriod;j++){
				low=Math.min(low,quotes[sd.startFrom-j].Low);
			}
		}
		for(var i=Math.max(0,sd.startFrom-1);i<quotes.length;i++){
			high=Math.max(high,quotes[i].High);
			low=Math.min(low,quotes[i].Low);
			if(i>=highPeriod){
				if((quotes[i-highPeriod].High)==high){
					high=quotes[i].High;
					for(j=1;j<highPeriod;j++){
						high=Math.max(high,quotes[i-j].High);
					}
				}
			}
			if(i>=lowPeriod){
				if((quotes[i-lowPeriod].Low)==low){
					low=quotes[i].Low;
					for(j=1;j<lowPeriod;j++){
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
				result=Math.log(high-low)/Math.log(lowPeriod);
			}else if(sd.type=="VT HZ Filter"){
				result=high-low;
				quotes[i]["_MHML "+sd.name]=result;
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
		for(var i=sd.startFrom;i<quotes.length;i++){
			if(!i) continue;
			var quote=quotes[i];
			var quote1=quotes[i-1];
			var todayAD=0;
			if(quote.Close>quote1.Close){
				todayAD=quote.Close-Math.min(quote.Low,quote1.Close);
			}else if(quote.Close<quote1.Close){
				todayAD=quote.Close-Math.max(quote.High,quote1.Close);
			}
			if(sd.inputs["Use Volume"]) todayAD*=quote.Volume;

			var total=quote1["Result " + sd.name];
			if(!total) total=0;
			total+=todayAD;
			quote["Result " + sd.name]=total;
		}
	};

	CIQ.Studies.calculateCCI=function(stx, sd){
		var quotes=sd.chart.scrubbed;
		if(quotes.length<sd.days+1){
			sd.error=true;
			return;
		}

		CIQ.Studies.MA("simple", sd.days, "hlc/3", 0, "MA", stx, sd);

		for(var i=Math.max(sd.startFrom,sd.days-1);i<quotes.length;i++){
			var quote=quotes[i];
			if(!quote) continue;
			var md=0;
			for(var j=0;j<sd.days;j++){
				md+=Math.abs(quotes[i-j]["hlc/3"] - quote["MA " + sd.name]);
			}
			md/=sd.days;
			if(Math.abs(md)<0.00000001) quote["Result " + sd.name]=0;
			else quote["Result " + sd.name]=(quote["hlc/3"] - quote["MA " + sd.name]) / (0.015 * md);
		}
	};

	CIQ.Studies.calculateFractalChaos=function(stx, sd){
		var quotes=sd.chart.scrubbed;

		var fractalHigh=0;
		var fractalLow=0;
		var test=0;
		if(sd.startFrom && sd.type=="Fractal Chaos Bands"){
		   	fractalHigh=quotes[sd.startFrom-1]["Fractal High " + sd.name];
		   	fractalLow=quotes[sd.startFrom-1]["Fractal Low " + sd.name];
		}
		for(var i=Math.max(4,sd.startFrom);i<quotes.length;i++){
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

	CIQ.Studies.displayRAVI=function(stx, sd, quotes){
		var panel = stx.panels[sd.panel];
		var yAxis = stx.getYAxisByName(panel, sd.name);

		var y=stx.pixelFromPrice(0, panel, yAxis);

		var myWidth=stx.layout.candleWidth-2;
		if(myWidth<2) myWidth=1;

		var upColor=CIQ.Studies.determineColor(sd.outputs["Increasing Bar"]);
		var downColor=CIQ.Studies.determineColor(sd.outputs["Decreasing Bar"]);
		stx.startClip(sd.panel);
		stx.canvasColor("stx_histogram");
		if(!sd.underlay) stx.chart.context.globalAlpha=1;
		for(var i=0;i<quotes.length;i++){
			var quote=quotes[i], quote_1=quotes[i-1];
			if(!quote_1) quote_1=stx.getPreviousBar(stx.chart, sd.name+"_hist", i);
			if(!quote) continue;
			var overBought=0, overSold=0;
			if(sd.parameters && sd.parameters.studyOverZonesEnabled){
				overBought=parseFloat(sd.parameters.studyOverBoughtValue);
				overSold=parseFloat(sd.parameters.studyOverSoldValue);
			}
			if(!quote_1) stx.chart.context.fillStyle="#CCCCCC";
			else if(quote[sd.name+"_hist"]>overBought && quote_1[sd.name+"_hist"]<quote[sd.name+"_hist"]) stx.chart.context.fillStyle=upColor;
			else if(quote[sd.name+"_hist"]<overSold && quote_1[sd.name+"_hist"]>quote[sd.name+"_hist"]) stx.chart.context.fillStyle=downColor;
			else stx.chart.context.fillStyle="#CCCCCC";
			if(quote.candleWidth) myWidth=Math.floor(Math.max(1,quote.candleWidth-2));
			stx.chart.context.fillRect(Math.floor(stx.pixelFromBar(i, panel.chart)-myWidth/2),
					Math.floor(y),
					Math.floor(myWidth),
					Math.floor(stx.pixelFromPrice(quote[sd.name+"_hist"], panel, yAxis)-y));
		}
		stx.endClip();
	};

	CIQ.Studies.displayElderForce=function(stx, sd, quotes){
		CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);
		var color=CIQ.Studies.determineColor(sd.outputs.Result);
		var panel=stx.panels[sd.panel];
		var yAxis=stx.getYAxisByName(panel, sd.name);
		var params={skipTransform:panel.name!=sd.chart.name, panelName:sd.panel, band:"Result " + sd.name, threshold:0, color:color, yAxis:yAxis};
		params.direction=1;
		CIQ.preparePeakValleyFill(stx,params);
		params.direction=-1;
		CIQ.preparePeakValleyFill(stx,params);
	};

	CIQ.Studies.displayElderRay=function(stx, sd, quotes){
		var panel=stx.panels[sd.panel];
		var yAxis=stx.getYAxisByName(panel, sd.name);
		var y=stx.pixelFromPrice(0, panel, yAxis);

		var myWidth=stx.layout.candleWidth-2;
		if(myWidth<2) myWidth=1;
		function drawBar(i,reduction,output,hist){
			stx.chart.context.fillStyle=CIQ.Studies.determineColor(sd.outputs[output]);
			stx.chart.context.fillRect(Math.floor(stx.pixelFromBar(i, panel.chart)-myWidth/2+myWidth*reduction),
					Math.floor(y),
					Math.floor(myWidth*(1-2*reduction)),
					Math.floor(stx.pixelFromPrice(quote[sd.name+hist], panel, yAxis)-y));
		}

		stx.canvasColor("stx_histogram");
		var fillStyle=stx.chart.context.fillStyle;
		if(!sd.underlay) stx.chart.context.globalAlpha=1;
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
		var opacity=sd.underlay?0.3:sd.inputs.Series?0.4:1;
		if(sd.inputs.Series && sd.inputs.Shading){
			var topBand="+DI " + sd.name, bottomBand="-DI " + sd.name;
			var topColor=CIQ.Studies.determineColor(sd.outputs[sd.outputMap[topBand]]), bottomColor=CIQ.Studies.determineColor(sd.outputs[sd.outputMap[bottomBand]]);
			var yAxis=stx.getYAxisByName(sd.panel, sd.name);
			var parameters={
				topBand: topBand,
				bottomBand: bottomBand,
				topColor: topColor,
				bottomColor: bottomColor,
				skipTransform: stx.panels[sd.panel].name!=sd.chart.name,
				topAxis: yAxis,
				bottomAxis: yAxis
			};
			CIQ.fillIntersecting(stx, sd.panel, parameters);
		}
		if(sd.inputs.Histogram) CIQ.Studies.createHistogram(stx, sd, quotes, false, opacity);
		if(sd.inputs.Series!==false) CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);
		else if(!sd.inputs.Series && !sd.inputs.Histogram)
			stx.watermark(sd.panel,"center","bottom",stx.translateIf(sd.name)+": "+stx.translateIf("Nothing to display"));

	};

	CIQ.Studies.displayMassIndex=function(stx, sd, quotes){
		CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);

		var bulge=sd.inputs["Bulge Threshold"];

		var panel=stx.panels[sd.panel];
		var yAxis=stx.getYAxisByName(panel, sd.name);
		var color=CIQ.Studies.determineColor(sd.outputs.Result);

		CIQ.preparePeakValleyFill(stx,{skipTransform:stx.panels[sd.panel].name!=sd.chart.name, panelName:sd.panel, band:"Result " + sd.name, threshold:bulge, direction:1, color:color, yAxis: yAxis});
		CIQ.Studies.drawHorizontal(stx, sd, null, bulge, yAxis, color);
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
	 * @param  {studyDescriptor} sd  Study Descriptor
	 * @param {array} quotes The array of quotes needed to render the channel
	 * @memberOf CIQ.Studies
	 * @example
	 * "inputs": {"Period":5, "Shift": 3, "Field":"field", "Channel Fill":true}
	 * "outputs": {"Prime Bands Top":"red", "Prime Bands Bottom":"auto", "Prime Bands Channel":"rgb(184,44,11)"}
	 * @example
	 * // full definition example including opacity
		"Bollinger Bands": {
			"name": "Bollinger Bands",
			"overlay": true,
			"calculateFN": CIQ.Studies.calculateBollinger,
			"seriesFN": CIQ.Studies.displayChannel,
			"inputs": {"Field":"field", "Period":20, "Standard Deviations": 2, "Moving Average Type":"ma", "Channel Fill": true},
			"outputs": {"Bollinger Bands Top":"auto", "Bollinger Bands Median":"auto", "Bollinger Bands Bottom":"auto"},
			"attributes": {
				"Standard Deviations":{min:0.1,step:0.1}
			},
			"parameters": {
				"init":{opacity: 0.2}
			}
		}
	 * @since 4.1.0 now also uses sd.parameters.opacity if one defined.
	 * @since 4.1.0 now shading is rendered under the channel lines instead of over.
	 */
	CIQ.Studies.displayChannel=function(stx, sd, quotes){
		if(sd.inputs["Channel Fill"]) {
			var parameters={panelName: sd.panel};
			for(var p in sd.outputs){
				var lastWord=p.split(" ").pop();
				if(lastWord=="Top" || lastWord=="High"){
					parameters.topBand=p + " " + sd.name;
				}else if(lastWord=="Bottom" || lastWord=="Low"){
					parameters.bottomBand=p + " " + sd.name;
				}else if(lastWord=="Median" || lastWord=="Channel"){
					parameters.color=CIQ.Studies.determineColor(sd.outputs[p]);
				}
			}
			if( sd.parameters && sd.parameters.opacity) {
				parameters.opacity=sd.parameters.opacity;
			}
			var panel=stx.panels[sd.panel];
			parameters.skipTransform=panel.name!=sd.chart.name;
			parameters.yAxis=stx.getYAxisByName(panel, sd.name);
			CIQ.prepareChannelFill(stx,parameters);
		}
		CIQ.Studies.displaySeriesAsLine(stx, sd, quotes);
	};


	CIQ.Studies.inputAttributeDefaultGenerator=function(value){
		if(!value && value!==0) return {};
		if(value.constructor==Number){
			if(Math.floor(value)==value){ // Integer
				if(value>0) return {min:1, step:1};  // positive
				return {step:1};   // full range
			}
			// Decimal
			if(value>0) return {min:0, step:0.01};  // positive
			return {step:0.01};  // full range
		}
		return {};
	};

	/**
	 * Function to determine which studies are available.
	 * @param  {object} excludeList Exclusion list of studies in object form ( e.g. {"rsi":true,"macd":true})
	 * @returns {object} Map of available entries from {@link CIQ.Studies.studyLibrary}.
	 * @memberof CIQ.Studies
	 * @since 3.0.0
	 */
	CIQ.Studies.getStudyList=function(excludeList){
		var map={};
		var excludedStudies={
			"Directional": true,
			"Gopala":true,
			"vchart":true
		};
		CIQ.extend(excludedStudies, excludeList);
		for(var libraryEntry in CIQ.Studies.studyLibrary){
			if(!excludedStudies[libraryEntry])
				map[CIQ.Studies.studyLibrary[libraryEntry].name]=libraryEntry;
		}
		return map;
	};

	/**
	 * A helper function that will find the color value in the output.
	 * @param {String/Object} output Color string value or object that has the color value
	 * @return {String}	Color value
	 * @since 4.0.0
	 */
	CIQ.Studies.determineColor=function(output){
		if(!output){
			return null;
		}
		else if(typeof output === 'object') {
			return output.color;
		}

		return output;
	};
	
	// object to keep track of the custom scripts
	CIQ.Studies.studyScriptLibrary={};

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
	 * See {@tutorial Using and Customizing Studies} for complete details
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
			"attributes":{
				"studyOverBoughtValue":{"min":0,"step":"0.1"},
				"studyOverSoldValue":{"max":0,"step":"0.1"}
			}
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
			"calculateFN": CIQ.Studies.calculateMovingAverage,
			"inputs": {"Period":50,"Field":"field","Type":"ma","Offset":0},
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
			"inputs": {"Period":14,"Field":"field"}
		},
		"Vol ROC": {
			"name": "Volume Rate of Change",
			"calculateFN": CIQ.Studies.calculateRateOfChange,
			"parameters": {
				init:{isVolume:true}
			}
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
			"inputs": {"Period":255,"Field":"field","Moving Average Type":"ma",},
			"outputs": {"Index":"auto","MA":"#FF0000"}
		},
		"Neg Vol": {
			"name": "Negative Volume Index",
			"calculateFN": CIQ.Studies.calculateVolumeIndex,
			"inputs": {"Period":255,"Field":"field","Moving Average Type":"ma"},
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
			"inputs": {"Period":10, "Field":"field", "Days Per Year":[252,365], "Standard Deviations":1},
			"attributes": {
				"Standard Deviations":{min:0.1,step:0.1}
			}
		},
		"Pretty Good": {
			"name": "Pretty Good Oscillator",
			"calculateFN": CIQ.Studies.calculatePrettyGoodOscillator,
			"parameters": {
				template:"studyOverZones",
				init:{studyOverZonesEnabled:true, studyOverBoughtValue:3, studyOverBoughtColor:"auto", studyOverSoldValue:-3, studyOverSoldColor:"auto"}
			},
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
			"inputs": {"Field":"field", "Short Cycle":12, "Long Cycle":26, "Moving Average Type":"ema", "Points Or Percent":["Points","Percent"]}
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
			},
			"attributes": {
				"Period":{min:2}
			}
		},
		"Detrended": {
			"name": "Detrended Price Oscillator",
			"calculateFN": CIQ.Studies.calculateDetrendedPrice,
			"inputs": {"Period":14, "Field":"field","Moving Average Type":"ma"}
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
			"inputs": {"Period":10, "Field":"field","Short Cycle":23, "Long Cycle":50, "Moving Average Type":"ema"},
			"parameters": {
				template:"studyOverZones",
				init:{studyOverZonesEnabled:true, studyOverBoughtValue:75, studyOverBoughtColor:"auto", studyOverSoldValue:25, studyOverSoldColor:"auto"}
			}
		},
		"QStick": {
			"name": "QStick",
			"calculateFN": CIQ.Studies.calculateQStick,
			"inputs": {"Period":8, "Moving Average Type":"ma"}
		},
		"Coppock": {
			"name": "Coppock Curve",
			"calculateFN": CIQ.Studies.calculateCoppock,
			"inputs": {"Period":10,"Field":"field","Short RoC":11,"Long RoC":14}
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
			"inputs": {"Period":14, "Field":"field"}
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
			"centerline": 0,
			"parameters": {
				template:"studyOverZones",
				init:{studyOverZonesEnabled:true, studyOverBoughtValue:3, studyOverBoughtColor:"auto", studyOverSoldValue:-3, studyOverSoldColor:"auto"}
			},
			"attributes":{
				"studyOverBoughtValue":{"min":0,"step":"0.1"},
				"studyOverSoldValue":{"max":0,"step":"0.1"}
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
		"High Low": {
			"name": "High Low Bands",
			"overlay": true,
			"seriesFN": CIQ.Studies.displayChannel,
			"calculateFN": function(stx, sd){ sd.inputs["Moving Average Type"]="triangular"; CIQ.Studies.calculateMAEnvelope(stx, sd); },
			"inputs": {"Period":10, "Field":"field", "Shift Percentage":5, "Channel Fill":true},
			"outputs": {"High Low Top":"auto", "High Low Median":"auto", "High Low Bottom":"auto"},
			"attributes":{
				"Shift Percentage":{min:0.1,step:0.1}
			}
		},
		"High-Low": {
			"name": "High Minus Low",
			"calculateFN": function(stx, sd){var quotes=sd.chart.scrubbed; for(var i=sd.startFrom;i<quotes.length;i++){ quotes[i]["Result " + sd.name]=quotes[i].High - quotes[i].Low; }},
			"inputs": {}
		},
		"Med Price": {
			"name": "Median Price",
			"calculateFN": CIQ.Studies.calculateTypicalPrice,
			"inputs": {"Period":14}
		},
		"MA Env": {
			"name": "Moving Average Envelope",
			"overlay": true,
			"seriesFN": CIQ.Studies.displayChannel,
			"calculateFN": CIQ.Studies.calculateMAEnvelope,
			"inputs": {"Period":50, "Field":"field", "Shift Type":["percent","points"], "Shift": 5, "Moving Average Type": "ma", "Channel Fill":true},
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
			"centerline": null  // so centerline is drawn but not included in the range calculation
		},
		"GAPO": {
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
			"centerline": 0,
			"inputs": {"Tolerance Percentage":5},
			"attributes":{
				"Tolerance Percentage":{min:0.1,step:0.1}
			}
		},
		"Bollinger Bands": {
			"name": "Bollinger Bands",
			"overlay": true,
			"calculateFN": CIQ.Studies.calculateBollinger,
			"seriesFN": CIQ.Studies.displayChannel,
			"inputs": {"Period":20, "Field":"field", "Standard Deviations": 2, "Moving Average Type":"ma", "Channel Fill": true},
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
			"centerline": 0,
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
			"inputs": {"Period":14}
		},
		"Weighted Close": {
			"name": "Weighted Close",
			"calculateFN": CIQ.Studies.calculateTypicalPrice,
			"inputs": {"Period":14}
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
		"volume": {
			"name": "Volume Chart",
			"range": "0 to max",
			"yAxis": {"ground":true, "initialMarginTop":0},
			"seriesFN": CIQ.Studies.createVolumeChart,
			"calculateFN": CIQ.Studies.calculateVolume,
			"inputs": {},
			"outputs": {"Up Volume":"#8cc176","Down Volume":"#b82c0c"},
			"parameters": {
				"zoom": 0,
				"widthFactor":1
			}
		},
		"vol undr": {
			"name": "Volume Underlay",
			"underlay": true,
			"range": "0 to max",
			"yAxis": {"ground":true, "initialMarginTop":0, "position":"none"},
			"seriesFN": CIQ.Studies.createVolumeChart,
			"calculateFN": CIQ.Studies.calculateVolume,
			"inputs": {},
			"outputs": {"Up Volume":"#8cc176","Down Volume":"#b82c0c"},
			"customRemoval": true,
			"removeFN": function(stx, sd){
				stx.layout.volumeUnderlay=false;
				stx.changeOccurred("layout");
			},
			"parameters": {
				"zoom": 0,
				"widthFactor":1
			}
		}
	};

	return _exports;
})/* removeIf(umd) */(typeof window !== 'undefined' ? window : global)/* endRemoveIf(umd) */;
