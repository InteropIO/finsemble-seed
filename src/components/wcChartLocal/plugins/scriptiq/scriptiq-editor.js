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
	 * Studies web component `<cq-scriptiq-editor>`.
	 * 
	 * **Only available if subscribing to the scriptIQ module.**
	 *
	 * This web component allows users to enter and edit ScriptIQ entries
	 *
	 * To enable the scriptIQ plugin in `sample-template-advanced.html` , search for `scriptiq` and uncomment the necessary sections. 
	 * This template can also be used as reference to create your own UI for this module.
	 * 
	 * @name CIQ.UI.ScriptIQEditor
	 * @namespace WebComponents.cq-scriptiq-editor
	 * @since 6.1.0
	 */
	var ScriptIQEditor = {
		prototype: Object.create(CIQ.UI.ContextTag)
	};

	/**
	 * String constants for common use
	 * @memberof WebComponents.cq-scriptiq-editor
	 * @alias constants
	 * @since 6.1.0
	 */
	ScriptIQEditor.prototype.constants={
		storageKey: "chartiq_custom_indicators",
		deleteAction: "deleteEntry",
		saveAction: "saveEntry",
		getAction: "getEntry",
		resizeEvent: "scriptingResize",
		renderMenuEvent: "renderMenu"
	};

	/**
	 * Initialize the component and load the necessary libraries
	 *
	 * @param {function} cb The callback to call when all the libraries have been loaded
	 * @memberof WebComponents.cq-scriptiq-editor
	 * @alias initialize
	 * @example
	 * 	//
		<cq-scriptiq-editor>
			<div class="stx-ico-handle" onmouseover="stxx.modalBegin();" onmouseout="stxx.modalEnd();"><span class=""></span></div>
			<div class="scriptiq-toolbar">
	    		<div stxtap="addScript()" class="ciq-btn">Apply</div>
	    		<div stxtap="clear()" class="ciq-btn">Clear</div>
				<div class="stx-btn stx-ico" stxtap="close()"><span class="stx-ico-close">&nbsp;</span></div>
			</div>
			<div class="scriptiq-textarea"><textarea placeholder="Click to add script"></textarea></div>
			<div class="scriptiq-status"><input readonly placeholder="Script status"></input></div>
		</cq-scriptiq-editor>
	 *
	 * @since 6.1.0
	 *
	 */
	ScriptIQEditor.prototype.initialize=function(cb){
		var scriptsLoaded=0;
		this.currentStudy={};
		this.nameValueStore=new CIQ.NameValueStore();
		var self=this;
		
		// Listen for the event.
		this.addEventListener(this.constants.resizeEvent, function (e) {
			self.resizeScriptingArea();
		}, false);

		if(CIQ.isIE || CIQ.isIE8 || CIQ.isIE9) {
			console.warn("Your Internet Explorer version isn't supported by ScriptIQ. Please use Edge.");
			$(this).attr('is_ie', 'true');
		}

		if(this.context) this.context.advertiseAs(this, 'ScriptIQEditor');

		function isComplete() {
			scriptsLoaded++;
			if(scriptsLoaded === 6) self.preloadScriptIQ(self, cb);
		}

		// load all the necessary scripts for ScriptIQ
		CIQ.loadScript("plugins/scriptiq/thirdparty/coffee-script.min.js", isComplete);
		CIQ.loadScript("plugins/scriptiq/thirdparty/esprima.js", isComplete);
		CIQ.loadScript("plugins/scriptiq/thirdparty/escodegen.js", isComplete);
		CIQ.loadScript("plugins/scriptiq/thirdparty/estraverse.js", isComplete);
		CIQ.loadScript("plugins/scriptiq/scriptiq-api.js", isComplete);
		CIQ.loadScript("plugins/scriptiq/scriptiq-menu.js", isComplete);
	};
	
	ScriptIQEditor.prototype.preloadScriptIQ=function(node, cb) {
		var self=this;
		
		this.nameValueStore.get(this.constants.storageKey, function(err,scripts){
			if(!err) {
				if(!scripts) scripts={};
				if(Object.keys(scripts).length > 0) {
					for(var name in scripts) {
						self.addScript(scripts[name]);
					}
				}
			}
		});

		$(node.parentElement).attr('loaded', 'true');
	};
	
	ScriptIQEditor.prototype.resizeScriptingArea=function(){
		var chartArea=$(".ciq-chart-area");
		var footerHeight=$(".ciq-footer").height();
		var chartAreaHeight;
		if(this.hasAttribute('cq-active')) {
			var chartContainer=$(".chartContainer");
			var cqScripting=this;
			var scriptingHeight=cqScripting.offsetHeight;
			chartAreaHeight=CIQ.pageHeight()-scriptingHeight-footerHeight*2;
			chartArea.css({'height': chartAreaHeight +'px'});

			// adjust according to the ciq chart area value
			var rightValue = chartArea.css('right');
			if(rightValue) $(this).css({'right': rightValue});

			CIQ.safeDrag(
				$$$(".stx-ico-handle", cqScripting),
				function(self){
					return function(e){
						self.startDrag(e);
					};
				}(cqScripting),
				function(self){return function(e){ self.drag(e);};}(cqScripting),
				function(self){return function(e){ self.endDrag(e);};}(cqScripting)
			);
		} else {
			chartArea.css({'height': ''});
		}
	};

	/**
	 * Compiles and adds the script to the studyScriptLibrary if successful. If not then error message is displayed
	 * @param  {object} [scriptObj] An object that contains the values to save to storage
	 * @param  {object} [scriptObj.script] The ScriptIQ source from storage
	 * @param  {object} [scriptObj.siqList] Boolean flag to determine whether the script needs to be listed on the custom study menu, defaults to true
	 * @memberof WebComponents.cq-scriptiq-editor
	 * @alias addScript
	 * @since 6.1.0
	 */
	ScriptIQEditor.prototype.addScript=function(scriptObj){
		var self = this;
		var node=this.node;
		if(scriptObj && !scriptObj.script) scriptObj = null; // scriptObj doesn't have a valid script
		var scriptToAdd=scriptObj ? scriptObj.script : null;
		var listState=scriptObj ? scriptObj.siqList : true;
		var scriptText=scriptToAdd || node.find(".scriptiq-textarea textarea").val(); // if there is no ScriptIQ being passed along from storage then look at the scripting UI
		if(!scriptText || scriptText.length <= 0) return;
		var scriptStatus=node.find(".scriptiq-status input");
		var stx=this.context ? this.context.stx : null;
		var studyLibrary = CIQ.Studies.studyLibrary;
		this.currentScripts=Object.keys(CIQ.Studies.studyScriptLibrary);
		
		if(!this.context) {
			this.context = CIQ.UI.getMyContext(this);
		}
		
		function renderScriptMenu() {
			var event = document.createEvent('Event');
			event.initEvent(self.constants.renderMenuEvent, true, true);
			self.dispatchEvent(event);
		}
		var layoutStudy;
		function displayStudy(sd){
			renderScriptMenu();
			var currentStudy = self.currentStudy;
			if(!currentStudy[sd.name]) { // check to see if the study is in the chart layout already
				for(var name in stx.layout.studies) {
					layoutStudy = stx.layout.studies[name];
					if(layoutStudy.type === sd.name) {
						currentStudy[sd.name] = layoutStudy;
					}
				}
			}

			// same study, replace with new study descriptor
			if(currentStudy && currentStudy[sd.name] && sd.name === currentStudy[sd.name].type) {
				CIQ.Studies.removeStudy(stx, currentStudy[sd.name]);
			}
			currentStudy[sd.name] = CIQ.Studies.addStudy(stx, sd.name, null, null, null, null, sd);
		}

		var compiledScript=CIQ.Scripting.addCoffeeScriptStudyToLibrary(scriptText);
		if(compiledScript.error){
			scriptStatus.val(compiledScript.error);
			return;
		}
		
		var sd=compiledScript.sd;
		sd.siqList=!!listState; // for initial startup we need to know if the script needs to be listed in the menu
		if(scriptToAdd) { // if scriptToAdd isn't null then the script came from storage
			// apply newly compiled library entry to the layout's studies
			for(var name in stx.layout.studies) {
				layoutStudy = stx.layout.studies[name];
				if(layoutStudy.type === sd.name) {
					layoutStudy.study=layoutStudy.libraryEntry=sd;
					layoutStudy.outputMap={};
					CIQ.Studies.prepareStudy(stx, sd, layoutStudy);
				}
			}
			renderScriptMenu();
			return;
		}

		// add the script from the scripting UI
		displayStudy(sd);

		var saveObj = {
			script: scriptText,
			siqList: true	
		};
		this.nameValueStore.get(this.constants.storageKey, function(err,scripts){
			if(!err) {
				if(!scripts) scripts={};
				scripts[sd.name]=saveObj;
				self.nameValueStore.set(self.constants.storageKey,scripts);
			}
		});
		scriptStatus.val(sd.name + " indicator successfully added");
	};

	/**
	 * Clears the scripting input boxes
	 * @memberof WebComponents.cq-scriptiq-editor
	 * @alias clear
	 * @since 6.1.0
	 */
	ScriptIQEditor.prototype.clear=function(){
		var node=this.node;
		node.find(".scriptiq-textarea textarea").val('');
		node.find(".scriptiq-status input").val('');
	};

	/**
	 * Opens the scripting ui area
	 * @param  {object} [params] The object that contains the saved script to fill in the scripting input area
	 * @param  {string} [params.source] The ScriptIQ text
	 * @memberof WebComponents.cq-scriptiq-editor
	 * @alias open
	 * @since 6.1.0
	 */
	ScriptIQEditor.prototype.open=function(params){
		var node=this.node;
		node.attr("cq-active","true");
		this.clear();
		if(params && params.source) {
			node.find(".scriptiq-textarea textarea").val(params.source);
			node.find(".scriptiq-status input").val('');
		}
		
		var event = document.createEvent('Event');
		event.initEvent(this.constants.resizeEvent, true, true);
		this.dispatchEvent(event);
		this.context.stx.resizeChart();
	};

	/**
	 * Closes the scripting ui area
	 * @memberof WebComponents.cq-scriptiq-editor
	 * @alias close
	 * @since 6.1.0
	 */
	ScriptIQEditor.prototype.close=function(){
		var node=this.node;
		node.removeAttr("cq-active");
		var event = document.createEvent('Event');
		event.initEvent(this.constants.resizeEvent, true, true);
		this.dispatchEvent(event);
		this.context.stx.resizeChart();
	};

	//-------------------------------------------------------------------------------------------
	// The drag and drop functionality is to allow the user to resize the ScriptIQ editor
	//-------------------------------------------------------------------------------------------
	ScriptIQEditor.prototype.startDrag=function(e){
		this.initialHeight=this.node[0].offsetHeight;
		CIQ.appendClassName(document.body,"resizing");

		//possibly vendor styles do not propagate?
		CIQ.appendClassName(this.node[0],"resizing");
		var els=this.node[0].getElementsByTagName("*");
		for(var d=0;d<els.length;d++){
			CIQ.appendClassName(els[d],"resizing");
		}

		CIQ.appendClassName($$$("div.panel-border",this.node[0]),"active");//top border
		this.context.stx.hideCrosshairs();
	};

	ScriptIQEditor.prototype.drag=function(e){
		var self=this;
		CIQ.appendClassName($$$(".stx-ico-handle",this.node[0]),"stx-grab");
		function doResize(){
			self.node[0].style.height=self.height+"px";

			var event = document.createEvent('Event');
			event.initEvent(self.constants.resizeEvent, true, true);
			self.dispatchEvent(event);
			self.context.stx.resizeChart();

			self.busyResizing=false;
		}
		self.height=self.initialHeight-e.displacementY;
		if(this.busyResizing) return;
		this.busyResizing=true;
		setTimeout(doResize,10);
	};

	ScriptIQEditor.prototype.endDrag=function(e){
		//this.stx.modalEnd();
		CIQ.unappendClassName(document.body,"resizing");
		CIQ.unappendClassName($$$(".stx-ico-handle",this.node[0]),"stx-grab");
		//possibly vendor styles do not propagate?
		CIQ.unappendClassName(this.node[0],"resizing");
		var els=this.node[0].getElementsByTagName("*");
		for(var d=0;d<els.length;d++){
			CIQ.unappendClassName(els[d],"resizing");
		}
		CIQ.unappendClassName($$$("div.panel-border",this.node[0]),"active");//top border
		this.context.stx.showCrosshairs();
	};

	CIQ.UI.ScriptIQEditor=document.registerElement("cq-scriptiq-editor", ScriptIQEditor);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
