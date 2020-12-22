/**
 *	8.0.0
 *	Generation date: 2020-10-08T11:28:10.884Z
 *	Client name: finsemble
 *	Package Type: Technical Analysis
 *	License type: annual
 *	Expiration date: "2021/07/20"
 *	Domain lock: ["127.0.0.1","localhost","chartiq.com","finsemble.com"]
 *	iFrame lock: true
 */

/***********************************************************
 * Copyright by ChartIQ, Inc.
 * Licensed under the ChartIQ, Inc. Developer License Agreement https://www.chartiq.com/developer-license-agreement
*************************************************************/
/*************************************** DO NOT MAKE CHANGES TO THIS LIBRARY FILE!! **************************************/
/* If you wish to overwrite default functionality, create a separate file with a copy of the methods you are overwriting */
/* and load that file right after the library has been loaded, but before the chart engine is instantiated.              */
/* Directly modifying library files will prevent upgrades and the ability for ChartIQ to support your solution.          */
/*************************************************************************************************************************/
/* eslint-disable no-extra-parens */


import { CIQ } from "../../js/componentUI.js";

/**
 * The ScriptIQ web component `<cq-scriptiq-menu>`, which displays the names of all stored ScriptIQ scripts along with controls
 * used to manage the scripts.
 *
 * **Only available with the ScriptIQ module.**
 *
 * To enable the ScriptIQ plug-in in *sample-template-advanced.html*, search for "scriptiq" and uncomment the necessary sections.
 * The template can also be used as a reference to create your own UI for ScriptIQ.
 *
 * @namespace WebComponents.cq-scriptiq-menu
 * @example
	<cq-heading>ScriptIQ</cq-heading>
		<cq-item><cq-clickable cq-selector="cq-scriptiq-editor" cq-method="open">New Script</cq-clickable></cq-item>
		<cq-scriptiq-menu>
			<cq-scriptiq-content>
				<template>
					<cq-item>
						<cq-label></cq-label>
						<div>
							<span class="ciq-edit"></span>
							<span class="ciq-icon ciq-close"></span>
						</div>
					</cq-item>
				</template>
			</cq-scriptiq-content>
		</cq-scriptiq-menu>
		<cq-separator></cq-separator>
	<cq-heading>Studies</cq-heading>
 *
 * @since 6.1.0
 */
class ScriptIQMenu extends CIQ.UI.ContextTag {
	constructor() {
		super();
	}

	connectedCallback() {
		if (this.attached) return;
		super.connectedCallback();
	}

	/**
	 * Initializes the component.
	 *
	 * @param {Object} params Optional parameters to control behavior of the menu.
	 * @param {Boolean} [params.template] DOM element to attach the menu items.
	 * @memberof WebComponents.cq-scriptiq-menu
	 * @alias initialize
	 * @since 6.1.0
	 */
	initialize(params) {
		this.addDefaultMarkup();
		this.params = params || {};
		if (!this.params.template) this.params.template = "template";
		this.params.template = this.node.find(this.params.template);
		this.renderMenu();
		var self = this;

		this.context.topNode.addEventListener(
			"renderMenu",
			function (e) {
				self.renderMenu();
			},
			false
		);
	}

	/**
	 * Creates the menu.
	 *
	 * @memberof WebComponents.cq-scriptiq-menu
	 * @alias renderMenu
	 * @since 6.1.0
	 */
	renderMenu() {
		var stx = this.context.stx;
		var menu = $(this.node);
		var alphabetizedCustom = [];
		var sd;

		var tapFn = function (studyName, context) {
			return function (e) {
				CIQ.Studies.addStudy(
					stx,
					studyName,
					null,
					null,
					null,
					null,
					CIQ.Studies.studyLibrary[studyName]
				);
			};
		};

		// open and populate the scripting text input
		function editScript(self, scriptName) {
			return function (e) {
				var sd = CIQ.Studies.studyScriptLibrary[scriptName];
				e.stopPropagation();
				self.uiManager.closeMenu();

				var event = new Event("openScriptUi", {
					bubbles: true,
					cancelable: true
				});
				self.dispatchEvent(event);

				var scriptEdit = self.context.getAdvertised("ScriptIQEditor");
				var params = { source: sd.source };
				scriptEdit.open(params);
			};
		}

		// delete the script entry from the menu
		function deleteScript(self, sd) {
			return function (e) {
				e.stopPropagation();
				var scriptEdit = self.context.getAdvertised("ScriptIQEditor");
				var nameValueStore = scriptEdit.nameValueStore;
				var scriptName = sd.name;

				// delete or modify ScriptIQ entry in storage
				function deleteOrModify(scripts, scriptName, deleteFromStorage) {
					if (deleteFromStorage) {
						delete scripts[scriptName];
					} else {
						// study on the chart, make sure it isn't listed in the ScriptIQ menu
						var scriptObj = scripts[scriptName];
						scriptObj.siqList = false;
						scripts[scriptName] = scriptObj;
					}

					return scripts;
				}

				// two paths for ScriptIQ storage deletion
				// 1. ScriptIQ is displayed on the chart: ScriptIQ entry is modified in storage and the study menu item is deleted
				// 2. ScriptIQ isn't displayed on the chart: ScriptIQ entry is deleted from storage forever
				nameValueStore.get(scriptEdit.constants.storageKey, function (
					err,
					scripts
				) {
					if (!err) {
						if (!scripts) scripts = {};
						var currentStudies = self.context.stx.layout.studies;
						var deleteFromStorage = true;
						if (currentStudies) {
							for (var name in currentStudies) {
								// Check to see if study is currently displayed on the chart
								var studyType = currentStudies[name]
									? currentStudies[name].type
									: "";
								if (studyType !== scriptName) continue;
								deleteFromStorage = false;
								break;
							}
						}

						scripts = deleteOrModify(scripts, scriptName, deleteFromStorage);
						nameValueStore.set(scriptEdit.constants.storageKey, scripts);
					}
				});

				delete CIQ.Studies.studyScriptLibrary[scriptName];
				self.renderMenu();
			};
		}

		for (var field in CIQ.Studies.studyScriptLibrary) {
			sd = CIQ.Studies.studyScriptLibrary[field];
			if (!sd.siqList) continue;
			if (!sd.name) sd.name = field; // Make sure there's always a name
			alphabetizedCustom.push(field);
		}

		// sort A-Z
		alphabetizedCustom.sort(function (lhs, rhs) {
			var lsd = CIQ.Studies.studyScriptLibrary[lhs];
			var rsd = CIQ.Studies.studyScriptLibrary[rhs];
			return String.prototype.localeCompare.call(lsd.name, rsd.name);
		});

		// remove all current custom scripts so menu display is properly sorted
		var contentNode = menu.find("cq-scriptiq-content");
		while (contentNode.length > 0 && contentNode[0].firstChild) {
			contentNode[0].removeChild(contentNode[0].firstChild);
		}

		for (var i = 0; i < alphabetizedCustom.length; i++) {
			var menuItem = CIQ.UI.makeFromTemplate(this.params.template);
			sd = CIQ.Studies.studyScriptLibrary[alphabetizedCustom[i]];
			menuItem.find("cq-label").append(CIQ.translatableTextNode(stx, sd.name));
			menuItem.selectFC = tapFn(alphabetizedCustom[i], this.context);
			menuItem.stxtap(menuItem.selectFC);
			var edit = menuItem.find(".ciq-edit");
			edit.stxtap(editScript(this, sd.name));
			menu.find("cq-scriptiq-content").append(menuItem);
			var scriptToDelete = menuItem.find(".ciq-close");
			scriptToDelete.stxtap(deleteScript(this, sd));
		}
	}

	setContext() {
		this.initialize();
	}
}

ScriptIQMenu.markup = `
		<cq-scriptiq-content>
			<template>
				<cq-item>
					<cq-label></cq-label>
					<div>
						<span class="ciq-edit"></span>
						<span class="ciq-icon ciq-close"></span>
					</div>
				</cq-item>
			</template>
		</cq-scriptiq-content>
	`;
customElements.define("cq-scriptiq-menu", ScriptIQMenu);
