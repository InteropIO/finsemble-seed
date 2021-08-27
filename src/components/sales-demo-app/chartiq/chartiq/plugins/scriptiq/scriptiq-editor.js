/* removeIf(umd) */ (function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([
			'chartiq/js/componentUI',
			'chartiq/plugins/scriptiq/scriptiq-api',
			'chartiq/plugins/scriptiq/scriptiq-menu'
		], factory);
	} else if (typeof exports === 'object') {
		module.exports = factory(require('chartiq/js/componentUI'),
		                         require('chartiq/plugins/scriptiq/scriptiq-api'),
		                         require('chartiq/plugins/scriptiq/scriptiq-menu'));
	} else {
		factory(root);
	}
})(this, function(_exports, api, menu) {
	var CIQ = _exports.CIQ;
	/* endRemoveIf(umd) */

	/**
	 * The ScriptIQ web component `<cq-scriptiq-editor>`, which enables you to create ScriptIQ scripts.
	 *
	 * **Only available with the ScriptIQ module.**
	 *
	 * To enable the ScriptIQ plug-in in *sample-template-advanced.html*, search for "scriptiq" and uncomment the necessary sections.
	 * The template can also be used as a reference to create your own UI for ScriptIQ.
	 *
	 * @name CIQ.UI.ScriptIQEditor
	 * @namespace WebComponents.cq-scriptiq-editor
	 * @example
		<cq-scriptiq-editor>
			<div class="stx-ico-handle" onmouseover="this.parentNode.modalBegin();" onmouseout="this.parentNode.modalEnd();"><span class=""></span></div>
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
	 */
	class ScriptIQEditor extends CIQ.UI.ContextTag {
		constructor () {
			super();

			/**
			 * String constants for common use.
			 *
			 * @memberof WebComponents.cq-scriptiq-editor
			 * @alias constants
			 * @since 6.1.0
			 */
			this.constants={
				storageKey: "chartiq_custom_indicators",
				deleteAction: "deleteEntry",
				saveAction: "saveEntry",
				getAction: "getEntry",
				resizeEvent: "scriptingResize",
				renderMenuEvent: "renderMenu"
			};
		}

		/**
		 * Compiles the script, and if compilation is successful, adds the script to the study library. If compilation is unsuccessful, displays an error message.
		 *
		 * @param {object} [scriptObj] An object that contains the values to save to storage.
		 * @param {object} [scriptObj.script] The ScriptIQ source from storage.
		 * @param {object} [scriptObj.siqList] Boolean flag to determine whether the script needs to be listed on the custom study menu; defaults to true.
		 * @memberof WebComponents.cq-scriptiq-editor
		 * @alias addScript
		 * @since 6.1.0
		 */
		addScript(scriptObj) {
			var self = this;
			var node=this.node;
			if(scriptObj && !scriptObj.script) scriptObj = null; // scriptObj doesn't have a valid script
			var scriptToAdd=scriptObj ? scriptObj.script : null;
			var listState=scriptObj ? scriptObj.siqList : true;
			var scriptText=scriptToAdd || node.find(".scriptiq-textarea textarea").val(); // if there is no ScriptIQ being passed along from storage then look at the scripting UI
			if(!scriptText || scriptText.length <= 0) return;
			var scriptStatus=node.find(".scriptiq-status input");
			var stx=this.context ? this.context.stx : null;
			this.currentScripts=Object.keys(CIQ.Studies.studyScriptLibrary);

			if(!this.context) {
				this.context = CIQ.UI.getMyContext(this);
			}

			function renderScriptMenu() {
				var event = new Event(self.constants.renderMenuEvent, {
					bubbles: true,
					cancelable: true
				});
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
		}

		/**
		 * Clears the scripting input boxes.
		 *
		 * @memberof WebComponents.cq-scriptiq-editor
		 * @alias clear
		 * @since 6.1.0
		 */
		clear() {
			var node=this.node;
			node.find(".scriptiq-textarea textarea").val('');
			node.find(".scriptiq-status input").val('');
		}

		/**
		 * Closes the scripting UI area.
		 *
		 * @memberof WebComponents.cq-scriptiq-editor
		 * @alias close
		 * @since 6.1.0
		 */
		close() {
			var node=this.node;
			node.removeAttr("cq-active");
			var event = new Event(this.constants.resizeEvent, {
				bubbles: true,
				cancelable: true
			});
			this.dispatchEvent(event);
			this.context.stx.resizeChart();
		}

		/**
		 * Initializes the component and loads the necessary libraries.
		 *
		 * @param {function} cb The callback to call when all the libraries have been loaded.
		 * @memberof WebComponents.cq-scriptiq-editor
		 * @alias initialize
		 * @since 6.1.0
		 */
		initialize(cb) {
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

			var cqScripting = this;
			CIQ.safeDrag(cqScripting.querySelector(".stx-ico-handle"), {
				down: function(e) {
					cqScripting.startDrag(e);
				},
				move: function(e) {
					cqScripting.drag(e);
				},
				up: function(e) {
					cqScripting.endDrag(e);
				}
			});

			if(this.context) this.context.advertiseAs(this, 'ScriptIQEditor');

			function isComplete() {
				scriptsLoaded++;
				if(scriptsLoaded === 7) self.preloadScriptIQ(self, cb);
			}

			// load all the necessary scripts for ScriptIQ
			if(!api){  // global workspace
				CIQ.loadScript("plugins/scriptiq/thirdparty/coffee-script.min.js", isComplete);
				CIQ.loadScript("plugins/scriptiq/thirdparty/esutils.js", isComplete);
				CIQ.loadScript("plugins/scriptiq/thirdparty/esprima.js", isComplete);
				CIQ.loadScript("plugins/scriptiq/thirdparty/escodegen.js", isComplete);
				CIQ.loadScript("plugins/scriptiq/thirdparty/estraverse.js", isComplete);
				CIQ.loadScript("plugins/scriptiq/scriptiq-api.js", isComplete);
				CIQ.loadScript("plugins/scriptiq/scriptiq-menu.js", isComplete);
			}else{  // module e.g. webpack
				self.preloadScriptIQ(self, cb);
			}
		}


		modalBegin(){
			if(this.context) this.context.stx.modalBegin();
		}

		modalEnd(){
			if(this.context) this.context.stx.modalEnd();
		}

		/**
		 * Opens the scripting UI area. Sets the `cq-active` attribute to true; for example, `<cq-scriptiq-editor cq-active="true">`.
		 *
		 * @param {object} [params] The object that contains the saved script which fills in the scripting input area.
		 * @param {string} [params.source] The ScriptIQ text.
		 * @memberof WebComponents.cq-scriptiq-editor
		 * @alias open
		 * @since 6.1.0
		 */
		open(params) {
			var node=this.node;
			node.attr("cq-active","true");
			this.clear();
			if(params && params.source) {
				node.find(".scriptiq-textarea textarea").val(params.source);
				node.find(".scriptiq-status input").val('');
			}

			var event = new Event(this.constants.resizeEvent, {
				bubbles: true,
				cancelable: true
			});
			this.dispatchEvent(event);
			this.context.stx.resizeChart();
		}

		preloadScriptIQ(node, cb) {
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
		}

		resizeScriptingArea() {
			var chartArea = this.qs(".ciq-chart-area", "thisChart");
			var footerHeight=this.qs(".ciq-footer", "thisChart").clientHeight;
			var chartAreaHeight;
			if(this.hasAttribute('cq-active')) {
				var scriptingHeight = this.offsetHeight;
				chartAreaHeight=CIQ.pageHeight()-scriptingHeight-footerHeight*2;
				chartArea.style.height = chartAreaHeight +'px';

				// adjust according to the ciq chart area value
				this.style.right = chartArea.style.right;
			} else {
				chartArea.style.height = "";
			}
		}

		//-------------------------------------------------------------------------------------------
		// The drag and drop functionality is to allow the user to resize the ScriptIQ editor
		//-------------------------------------------------------------------------------------------

		startDrag(e) {
			this.initialHeight=this.node[0].offsetHeight;
			CIQ.appendClassName(document.body,"resizing");

			//possibly vendor styles do not propagate?
			CIQ.appendClassName(this.node[0],"resizing");
			var els=this.node[0].getElementsByTagName("*");
			for(var d=0;d<els.length;d++){
				CIQ.appendClassName(els[d],"resizing");
			}

			CIQ.appendClassName(this.node[0].querySelector("div.panel-border"),"active");//top border
			this.context.stx.hideCrosshairs();
		}

		drag(e) {
			var self=this;
			CIQ.appendClassName(this.node[0].querySelector(".stx-ico-handle"),"stx-grab");
			function doResize(){
				self.node[0].style.height=self.height+"px";

				var event = new Event(self.constants.resizeEvent, {
					bubbles: true,
					cancelable: true
				});
				self.dispatchEvent(event);
				self.context.stx.resizeChart();

				self.busyResizing=false;
			}
			self.height=self.initialHeight-e.displacementY;
			if(this.busyResizing) return;
			this.busyResizing=true;
			setTimeout(doResize,10);
		}

		endDrag(e) {
			//this.stx.modalEnd();
			CIQ.unappendClassName(document.body,"resizing");
			CIQ.unappendClassName(this.node[0].querySelector(".stx-ico-handle"),"stx-grab");
			//possibly vendor styles do not propagate?
			CIQ.unappendClassName(this.node[0],"resizing");
			var els=this.node[0].getElementsByTagName("*");
			for(var d=0;d<els.length;d++){
				CIQ.unappendClassName(els[d],"resizing");
			}
			CIQ.unappendClassName(this.node[0].querySelector("div.panel-border"),"active");//top border
			this.context.stx.showCrosshairs();
		}
	}


	CIQ.UI.ScriptIQEditor = ScriptIQEditor;
	customElements.define("cq-scriptiq-editor", ScriptIQEditor);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
