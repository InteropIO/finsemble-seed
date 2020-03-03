/*!
* Copyright 2017 - 2020 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";
import "../inputAndSelectionDialog.css";
import "../../../../assets/css/font-finance.css";
import "../../../../assets/css/finsemble.css";
import { FinsembleDialog, FinsembleDialogQuestion, FinsembleDialogTextInput, FinsembleDialogButton } from "@chartiq/finsemble-react-controls";
import { FinsembleDnDContext, FinsembleDraggable, FinsembleDroppable } from '@chartiq/finsemble-react-controls';


/**
 * This is our input dialog for new workspace templates. The user selection the template to use plus enters a new workspace name.
 *
 * @class InputAndSelectionDialog
 * @extends {React.Component}
 */
class InputAndSelectionDialog extends React.Component {
	constructor() {
		super();
		this.bindCorrectContext();
		this.state = {
			inputLabel: "No question.",
			affirmativeResponseLabel: "OK",
			cancelResponseLabel: "Cancel",
			templateDefinitions: {}, // all templates, indexed by template names
			componentTypeMap: {}, // index by template name to get array of component types
			currentComponents: [],
			currentDescription: "",
			focusedTemplateName: "Blank Template",
			inputWorkspaceValue: "",
			invalidWorkspace: false
		};
		document.body.addEventListener("keydown", this.handleKeydownOnBody);
	}

	bindCorrectContext() {
		this.handleKeydownOnBody = this.handleKeydownOnBody.bind(this);
		this.onShowRequested = this.onShowRequested.bind(this);
		this.setInputWorkpaceName = this.setInputWorkpaceName.bind(this);
		this.sendResponse = this.sendResponse.bind(this);
		this.componentDidMount = this.componentDidMount.bind(this);
		this.getComponentTypes = this.getComponentTypes.bind(this);
		this.refreshData = this.refreshData.bind(this);
	}

	// returns all the component types of a template definition to display to user for additional info. If multiple components with same type, then instead of listing each
	// individually, only one entry will be returned with the count in parentheses.
	getComponentTypes(templateObject) {
		FSBL.Clients.Logger.system.debug("getComponentTypes templateObject", templateObject);
		var componentType;
		var componentMap = {};
		var annotatedComponentList = [];
		for (let i = 0; i < templateObject.windows.length; i++) {
			let windowData = templateObject.windowData[i];
			FSBL.Clients.Logger.system.debug("getComponentTypes loop", windowData);
			componentType = "Unknown Component";
			if (windowData) { // current assimilation doesn't fill in windowData, so in this case use "Unknown Component" for component type
				componentType = windowData.customData.component.type;
			} else {
				componentType = "Unknown Component";
			}
			if (!componentMap[componentType]) {
				componentMap[componentType] = 1;
			} else {
				componentMap[componentType]++;
			}
		}

		var componentTypes = Object.keys(componentMap);
		for (let i = 0; i < componentTypes.length; i++) {
			let annotatedName = componentTypes[i];
			let identicalCount = componentMap[componentTypes[i]];
			if (identicalCount > 1) {
				annotatedName = annotatedName + ` (${identicalCount})`;
			}
			annotatedComponentList.push(annotatedName)
		}
		FSBL.Clients.Logger.system.debug("getComponentTypes", annotatedComponentList);
		return annotatedComponentList;
	}

	refreshData(callback) {
		var self = this;
		var componentTypeMap = {};

		FSBL.Clients.WorkspaceClient.getTemplates(function (templates) {
			self.setState({ templateDefinitions: templates })
			FSBL.Clients.Logger.debug("refreshData with templates", templates);

			let templateNames = Object.keys(templates);
			for (let i = 0; i < templateNames.length; i++) {
				let aName = templateNames[i];
				let aTemplate = templates[aName];
				componentTypeMap[aName] = self.getComponentTypes(aTemplate);
			}

			self.setState({ componentTypeMap })
			self.setFocusedTemplateInfo(self.state.focusedTemplateName);
			FSBL.Clients.Logger.debug("refreshData with componentTypeMap", componentTypeMap);
			callback && callback();
		});
	}

	// triggers after component mounted. Here config is queried to build template and components lists.
	componentDidMount() {
		this.refreshData();
	}

	/**
	 * Handles escape and enter.
	 *
	 * @param {any} e
	 * @memberof InputAndSelectionDialog
	 */
	handleKeydownOnBody(e) {
		if (e.code === "Enter" && e.shiftKey === false) {
			this.sendResponse("affirmative");
		}

		if (e.code === "Escape") {
			this.sendResponse("cancel");
		}
	}

	/**
	 * When the opener requests that the dialog show itself, it also passes in initialization data. This function grabs that data, calls setState, and then fits the window to the contents of the DOM. Then we call `showDialog`, which will display the dialog on the proper monitor.
	 *
	 * @param {any} err
	 * @param {any} response
	 * @memberof InputAndSelectionDialog
	 */
	onShowRequested(err, response) {
		FSBL.Clients.Logger.system.debug("onShowRequested", response.data);

		this.refreshData();

		let data = response.data;
		this.setState({
			hideModalOnClose: typeof data.hideModalOnClose === "undefined" ? true : data.hideModalOnClose,
			inputLabel: data.inputLabel,
			templateDefinitions: data.templateDefinitions || this.state.templateDefinitions,
			showCancelButton: typeof data.showCancelButton === "undefined" ? false : data.showCancelButton
		}, this.fitAndShow);
	}
	/**
	 * Fits the contents of the DOM to the window, then calls `showDialog`, which positions the dialog on the proper monitor and toggles the visibility of the window.
	 *
	 * @memberof InputAndSelectionDialog
	 */
	fitAndShow() {
		FSBL.Clients.WindowClient.fitToDOM(null, function () {
			FSBL.Clients.DialogManager.showDialog();
		});
	}
	/**
	 * Sends user input to the opener.
	 *
	 * @param {any} response
	 * @memberof InputAndSelectionDialog
	 */
	sendResponse(response) {
		if (response === "affirmative" && this.state.inputWorkspaceValue === "") {
			this.setState({
				invalidWorkspace: true
			});
			this.refs.WorkspaceInput.focus();
			return;
		}

		FSBL.Clients.DialogManager.respondToOpener({
			value: this.state.inputWorkspaceValue,
			template: this.state.focusedTemplateName,
			choice: response,
			hideModalOnClose: this.state.hideModalOnClose
		});

		this.setState({
			inputWorkspaceValue: null,
			focusedTemplateName: null,
			invalidWorkspace: false
		});
		this.refs.WorkspaceInput.focus();
		Array.from(document.querySelectorAll("input")).forEach((el) => el.value = "");
	}
	/**
	 * onChange handler. When the user types, we keep the value up to date in the dialog's state.
	 *
	 * @param {any} e
	 * @memberof InputAndSelectionDialog
	 */
	setInputWorkpaceName(e) {
		this.setState({
			inputWorkspaceValue: e.target.value,
			invalidWorkspace: false
		});
	}

	// when a template is selected by user, update all the related state
	setFocusedTemplateInfo(focusedTemplateName, click) {
		var currentDescription = self.state.templateDefinitions[focusedTemplateName].description;
		var currentComponents = self.state.componentTypeMap[focusedTemplateName];
		if (click) {
			this.setState({
				inputWorkspaceValue: focusedTemplateName,
				invalidWorkspace: false
			});
		}
		this.setState({
			focusedTemplateName,
			currentDescription,
			currentComponents,
			focusedTemplateName
		})

		self.fitAndShow();
	}

	// truncates long template names to fit in UI
	truncatedTemplaceName(name) {
		var truncatedName = name.substring(0, 45);
		return truncatedName;
	}

	// truncates long components names to fit in UI
	truncatedComponentName(name) {
		var truncatedName = name.substring(0, 24);
		return truncatedName;
	}

	render() {
		self = this;
		let workspaceInputClasses = "workspace-input-name-wrapper";
		if (this.state.invalidWorkspace) {
			workspaceInputClasses += " invalid-workspace";
		}
		return (
			<FinsembleDialog
				userInputTimeout={1000 * 60 * 5}
				behaviorOnResponse="hide"
				onShowRequested={this.onShowRequested}
				isModal={false}>
				<div className="content-main-wrapper">
					<div className="content-section-header">Templates</div>
					<div className="content-main-row">
						<div className="content-main-column templates-column">
							<div ref="TemplateList" className="template-list">
								{Object.keys(this.state.templateDefinitions).map((templateName, i) => {
									let baseClass = "workspace-item template-item ";
									let classNames = baseClass;
									if (this.state.focusedTemplateName === templateName) {
										classNames += " focused-workspace-item";
									}

									return (
										<div className={classNames} key={i} onClick={() => this.setFocusedTemplateInfo(templateName, true)}>
											{this.truncatedTemplaceName(templateName)}
										</div>
									)

								})}
							</div>
						</div>
						<div className="content-main-column components-column">
							{this.state.currentComponents.length > 0 &&
								this.state.currentComponents.map((componentName, i) => {
									return (<div key={i} className="content-section-components-name">
										{this.truncatedComponentName(componentName)}
									</div>);
								})}
							{this.state.currentComponents.length === 0 &&
								<div className="content-section-components-name">
									No components.
								</div>}
						</div>
					</div>
					<div className="content-main-row">
						<div className="content-section-description-wrapper" title={this.state.currentDescription || "No description."}>
							<i className="ff-info"></i>{this.state.currentDescription || "No description."}
						</div>
					</div>
					<div className="content-section-header">Name</div>
					<div className="content-main-row workspace-input-row">
						<div className={workspaceInputClasses}>
							<input ref="WorkspaceInput" autoFocus={true} placeholder={"New Workspace"} maxLength="40" value={this.state.inputWorkspaceValue} onChange={this.setInputWorkpaceName} />
						</div>
						<div className="action-buttons-wrapper">
							<div className="action-button workspace-action-button" onClick={() => { this.sendResponse("cancel"); }}>
								{this.state.cancelResponseLabel}
							</div>
							<div className="action-button workspace-action-button affirmative-button" onClick={() => { this.sendResponse("affirmative"); }}>
								{this.state.affirmativeResponseLabel}
							</div>
						</div>
					</div>


				</div>
			</FinsembleDialog>
		)
	}
}

//render component when FSBL is ready.
if (window.FSBL && FSBL.addEventListener) { FSBL.addEventListener("onReady", FSBLReady); } else { window.addEventListener("FSBLReady", FSBLReady) }
function FSBLReady() {
	ReactDOM.render(
		<InputAndSelectionDialog />
		, document.getElementById("inputAndSelectionDialog-component-wrapper"));
}