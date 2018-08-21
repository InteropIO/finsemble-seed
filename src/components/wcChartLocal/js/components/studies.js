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
	 * Studies List web component `<cq-studies>`.
	 *
	 * This web component lists all available studies from the study library CIQ.Studies.studyLibrary.	
	 *
	 * @namespace WebComponents.cq-studies
	 * @since 5.2.0
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
			</cq-menu>
	 */
	var Studies = {};

	Studies.prototype = Object.create(CIQ.UI.ContextTag);

	Studies.prototype.attachedCallback=function(){
		if(this.attached) return;
		CIQ.UI.ContextTag.attachedCallback.apply(this);
		this.attached=true;
	};

	/**
	 * Initialize the Studies list.
	 *
	 * @param {Object} [params] Parameters to control behavior of the menu
	 * @param {Object} [params.excludedStudies] A map of study names that should not be put in the menu.
	 * @param {Boolean} [params.alwaysDisplayDialog=false] If set to true then, the study will automatically be added to the chart, but a dialog will also always be displayed to allow the end user to pick their study parameters. Otherwise the study will be created automatically with defaults. Can optionally be an object containing a map of which studys to always display the dialog for.
	 * @param {Boolean} [params.dialogBeforeAddingStudy=false] If set to true then a dialog will be displayed before the study is added to the chart. This can optionally be a map of which studies require a dialog before adding.
	 * @memberof WebComponents.cq-studies
	 * @since 5.2.0 CIQ.UI.StudyMenu helper has been deprecated. Please call $("cq-studies")[0].initialize() now.
	 * @example
	var params={
		excludedStudies: {
			"Directional": true,
			"Gopala":true,
			"vchart":true
		},
		alwaysDisplayDialog: {"ma":true}, 		// this is how to always show a dialog before adding the study
		dialogBeforeAddingStudy: {"rsi": true} 	// this is how to always show a dialog before adding the study
	};
	$("cq-studies").each(function(){
		this.initialize(params);
	});
	 */
	Studies.prototype.initialize=function(params){
		this.params=params||{};
		this.alwaysDisplayDialog=this.params.alwaysDisplayDialog||false;
		this.excludedStudies=this.params.excludedStudies||[];
		if(!this.params.template) this.params.template="template";
		this.params.template=this.node.find(this.params.template);
		this.params.template.detach();
		this.renderMenu();

		var self = this;

		CIQ.UI.observe({
			obj:CIQ.Studies.studyLibrary,
			action:"callback",
			value:function(){self.renderMenu();}
		});
	};


	/**
	 * Creates the menu. You have the option of coding a hardcoded HTML menu and just using
	 * CIQ.UI.Studies for processing stxtap attributes, or you can call renderMenu() to automatically
	 * generate the menu.
	 * @memberof WebComponents.cq-studies
	 */
	Studies.prototype.renderMenu=function(){

		var stx=this.context.stx;
		var alphabetized=[];
		var sd;

		for(var field in CIQ.Studies.studyLibrary){
			sd=CIQ.Studies.studyLibrary[field];
			if(!sd || this.excludedStudies[field] || this.excludedStudies[sd.name] || sd.siqList !== undefined) continue; // siqList = ScriptIQ entry
			if(!sd.name) sd.name=field; // Make sure there's always a name
			alphabetized.push(field);
		}
		alphabetized.sort(function(lhs, rhs){
			var lsd=CIQ.Studies.studyLibrary[lhs];
			var rsd=CIQ.Studies.studyLibrary[rhs];
			if(lsd.name<rsd.name) return -1;
			if(lsd.name>rsd.name) return 1;
			return 0;
		});
		var menu=$(this.node);
		var self=this;
		var tapFn=function(studyName, context){
			return function(e){
				pickStudy(e.target, studyName);
				menu.resize();
			};
		};

		var contentNode = menu.find("cq-studies-content");
		while (contentNode.length > 0 && contentNode[0].firstChild) {
			contentNode[0].removeChild(contentNode[0].firstChild);
		}

		for(var i=0;i<alphabetized.length;i++){
			var menuItem=CIQ.UI.makeFromTemplate(this.params.template);
			sd=CIQ.Studies.studyLibrary[alphabetized[i]];
			menuItem.append(CIQ.translatableTextNode(stx,sd.name));
			this.makeTap(menuItem[0], tapFn(alphabetized[i], this.context));
			menu.find("cq-studies-content").append(menuItem);
		}

		function studyDialog(params) {
			params.context=self.context;
			$("cq-study-dialog").each(function(){
				this.open(params);
			});
		}

		function pickStudy(node, studyName) {
			var stx=self.context.stx;

			function handleSpecialCase(flag, params){
				if(flag===true){
					studyDialog(params);
					return true;
				}else if(typeof flag==="object"){
					for(var i in flag){
						if(i==studyName && flag[i]){
							studyDialog(params);
							return true;
						}
					}
				}
			}

			if(handleSpecialCase(self.params.dialogBeforeAddingStudy, {stx: stx, name: studyName})) return;
			var sd=CIQ.Studies.addStudy(stx, studyName);
			handleSpecialCase(self.alwaysDisplayDialog, {sd: sd, stx: stx});
		}
	};

	CIQ.UI.StudyMenu=function() {
		throw new Error("The CIQ.UI.StudyMenu helper function has been replaced by a <cq-studies> webcomponent.");
	};

	CIQ.UI.StudiesComponent=document.registerElement("cq-studies", Studies);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
