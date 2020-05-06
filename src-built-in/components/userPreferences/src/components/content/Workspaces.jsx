import React from 'react';
import { WorkspaceManagementMenuStore, Store as UserPreferencesStore } from "../../stores/UserPreferencesStore";
import { FinsembleDnDContext, FinsembleDraggable, FinsembleDroppable } from '@chartiq/finsemble-react-controls';
import Checkbox from '../checkbox';
import async from 'async';

class WorkspaceEditor extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: props.value || "",
			finished: false
		}
		this.onKeyDown = this.onKeyDown.bind(this);
		this.onChange = this.onChange.bind(this);
		this.onBlur = this.onBlur.bind(this);
	}

	onKeyDown(e) {

		if (e.key === 'Escape') {

			this.setState({ finished: true }, () => {
				this.props.cancelHandler();
			});
		} else if (e.key === 'Enter') {
			function finish(val) {
				this.props.saveHandler(val);
			}
			//binding so we don't lose the event inside of react's crazy callback structure
			this.setState({ finished: true }, finish.bind(this, e.target.value));
		}
	}

	onChange(e) {
		this.setState({
			value: e.target.value
		})
	}

	onFocus(e) {
		e.target.select();
	}

	onBlur() {
		//console.log("ON BLUR", performance.now());
		function finish(val) {
			this.props.saveHandler(val);
		}
		//binding so we don't lose the event inside of react's crazy callback structure. Finished is set so that the component doesn't call the saveHandler again on unMount
		this.setState({ finished: true }, finish.bind(this, this.state.value));
	}

	componentWillUnmount() {
		//When focusing on a new component in the list, while renaming a workspace - onBlur doesn't fire. But unMount does.
		if (!this.state.finished) {
			this.props.saveHandler(this.state.value);
		}
	}
	render() {
		return <input onFocus={this.onFocus} onBlur={this.onBlur} autoFocus={true} value={this.state.value} className="workspace-editor" onChange={this.onChange} onKeyDown={this.onKeyDown} />
	}
}

export default class Workspaces extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			adding: false,
			editing: false,
			workspaceList: [],
			focusedWorkspace: '',
			//todo, get the workspaceToLoadOnStart from preferences.
			workspaceToLoadOnStart: null,
			templateName: '',
			workspaceBeingEdited: '',
			focusedWorkspaceComponentList: [],
			initialAlwaysOnTop: finsembleWindow.windowOptions.alwaysOnTop,
			alwaysOnTop: finsembleWindow.windowOptions.alwaysOnTop
		};
		this.bindCorrectContext();
		this.addListeners();
	}
	resetState() {
		this.setState({
			adding: false,
			editing: false,
			focusedWorkspace: '',
			templateName: '',
			workspaceBeingEdited: ''
		});
	}
	bindCorrectContext() {
		let methods = ["deleteWorkspace", "addListeners", "setWorkspaceList", "onDragEnd", "startEditingWorkspace", "renameWorkspace", "cancelEdit", "setWorkspaceToLoadOnStart", "setPreferences", "exportWorkspace", "handleButtonClicks", "getFocusedWorkspaceComponentList", "changePreferencesAlwaysOnTop", "openFileDialog", "preferencesFocused"];
		methods.forEach((method) => {
			this[method] = this[method].bind(this);
		});
		window.importWorkspace = this.importWorkspace.bind(this);
	}

	setWorkspaceList(err, data) {
		console.log("Set workspacelist", data);
		if (!data) return;
		this.setState({
			workspaceList: data.value
		});
	}

	addListeners() {
		UserPreferencesStore.addListener({ field: 'WorkspaceList' }, this.setWorkspaceList)
	}

	// listens for change events on the file-input element
	addUploadChangeListener() {
		let inputElement = document.getElementById("file-input");
		inputElement.addEventListener("change", importWorkspace, false);
	}

	/**
	 * Sets the windowOptions.alwaysOnTop to the value supplied. The preferences component should
	 * not be always on top when a file dialog is open.
	 * @param {boolean} alwaysOnTop The value to set finsembleWindow.options.alwaysOnTop
	 */
	changePreferencesAlwaysOnTop(alwaysOnTop) {
		//The initialAlwaysOnTop check is to prevent making a component be alwaysOnTop when the
		//client may have set it to alwaysOnTop:false in the config. If that's the case, it should
		//never set its alwaysOnTop to true and should always remain unchanged
		if (this.state.initialAlwaysOnTop && FSBL.System.container === "Electron") {
			FSBL.Clients.WindowClient.setAlwaysOnTop(alwaysOnTop, () => {
				this.setState({
					alwaysOnTop: alwaysOnTop
				});
			});
		}
	}

	onDragEnd(changeEvent) {
		if (!changeEvent.destination) return;
		let workspaces = JSON.parse(JSON.stringify(this.state.workspaceList));
		let workspaceToMove = JSON.parse(JSON.stringify(workspaces[changeEvent.source.index]));
		workspaces.splice(changeEvent.source.index, 1);
		workspaces.splice(changeEvent.destination.index, 0, workspaceToMove);
		this.setState({
			workspaceList: workspaces
		})
		WorkspaceManagementMenuStore.Dispatcher.dispatch({ actionType: "reorderWorkspace", data: changeEvent });
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
				componentType = windowData.componentType || windowData.customData.component.type;
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

	setFocusedWorkspace(workspace) {
		this.setState({
			focusedWorkspace: workspace
		}, () => {
			this.getFocusedWorkspaceComponentList();
		});
	}

	cancelEdit() {
		if (this.state.adding) {
			let workspaceList = this.state.workspaceList;
			workspaceList.pop();
			this.setFocusedWorkspace("");
			this.setState({
				workspaceList: workspaceList
			});
		}
		this.setState({
			editing: false,
			adding: false,
			workspaceBeingEdited: ''
		});
	}

	renameWorkspace(newName) {
		let oldName = this.state.workspaceBeingEdited;
		if (oldName === "") {
			return this.cancelEdit();
		}

		if (newName === oldName || newName.trim() === "") return this.cancelEdit();
		let updatedWorkspaceList = this.state.workspaceList;
		let index = updatedWorkspaceList.findIndex((el) => el.name === oldName);
		//Set state locally so that the text doesn't change when the input field unmounts.
		if (index) {
			updatedWorkspaceList[index].name = newName;
			this.setState({
				workspaceList: updatedWorkspaceList
			});
		}
		WorkspaceManagementMenuStore.Dispatcher.dispatch({
			actionType: "renameWorkspace",
			data: {
				oldName: oldName,
				newName: newName
			}
		});
		if (this.state.workspaceToLoadOnStart === oldName) {
			this.setState({
				focusedWorkspace: newName
			}, () => {
				this.setWorkspaceToLoadOnStart(() => {
					this.cancelEdit();
				});
			});

		} else {
			this.cancelEdit();
		}
	}

	startEditingWorkspace(workspaceName = this.state.focusedWorkspace) {
		this.setState({
			editing: true,
			workspaceBeingEdited: workspaceName
		});
	}

	startExportingTemplate() {
		WorkspaceManagementMenuStore.Dispatcher.dispatch({
			actionType: "exportWorkspace",
			data: {
				name: this.state.focusedWorkspace
			}
		})
	}

	startImportingTemplate() {
		WorkspaceManagementMenuStore.Dispatcher.dispatch({
			actionType: "importTemplate",
			data: {
				name: this.state.templateName
			}
		})
	}

	deleteWorkspace(workspaceName = this.state.focusedWorkspace) {
		let workspaceToRemove = workspaceName;
		this.resetState();

		WorkspaceManagementMenuStore.Dispatcher.dispatch({
			actionType: "removeWorkspace",
			data: {
				name: workspaceToRemove,
				hideModalOnClose: false
			}
		});
	}
	setPreferences(err, data) {
		if (!data && !data.value) return;
		console.log("Set preferences", data.value);
		this.setState({
			workspaceToLoadOnStart: data.value['finsemble.initialWorkspace'],
			focusedWorkspace: data.value['finsemble.initialWorkspace']
		});
	}

	componentDidMount() {
		UserPreferencesStore.addListener({ field: 'preferences' }, this.setPreferences);
		FSBL.Clients.ConfigClient.getPreferences((err, data) => {
			this.setPreferences(err, { value: data })
		});
		this.addUploadChangeListener()
		UserPreferencesStore.getValue({ field: "WorkspaceList" }, (err, data) => {
			if (data && data.length) {
				this.setState({
					workspaceList: data
				});
			}
		})
	}

	componentWillUnmount() {
		UserPreferencesStore.removeListener({ field: 'preferences' }, this.setPreferences)
	}

	setWorkspaceToLoadOnStart(cb = Function.prototype) {
		let self = this;
		if (!this.state.focusedWorkspace) return;
		function setPreference() {
			FSBL.Clients.ConfigClient.setPreference({ field: "finsemble.initialWorkspace", value: self.state.workspaceToLoadOnStart }, (err, data) => {
				if (err) {
					console.error(err);
				}
				if (typeof cb === "function") {
					cb();
				}
			});
		}
		if (this.state.focusedWorkspace === this.state.workspaceToLoadOnStart) {
			this.setState({ workspaceToLoadOnStart: null }, setPreference);
		} else {
			self.setState({
				workspaceToLoadOnStart: self.state.focusedWorkspace
			}, setPreference);
		}
	}

	openFileDialog() {
		//Set alwaysOnTop to false and add an event listener on the window. When focus is regained
		//then reset always on top
		this.changePreferencesAlwaysOnTop(false);
		finsembleWindow.addEventListener('focused', this.preferencesFocused);
		let inputElement = document.getElementById("file-input");
		inputElement.click()
	}

	/**
	 * If the event is being listened to, when the preferences component is focused
	 * it will set always on top to true, and remove the event listener
	 *
	 * This is to handle bringing alwaysOnTop back to true when file dialogs are closed
	 * without changes (also handles bringing back to front after exporting)
	 */
	preferencesFocused() {
		finsembleWindow.removeEventListener('focused', this.preferencesFocused);
		this.changePreferencesAlwaysOnTop(true);
	}

	importWorkspace(evt) {
		let inputElement = document.getElementById("file-input");
		inputElement.removeEventListener("change", importWorkspace);
		var files = evt.target.files; // FileList object

		function loadFile(file, done) {
			let reader = new FileReader();
			let fileName = evt.target.value;
			// When the file info is loaded, we get into here..
			reader.onload = function (e) {
				fileName = fileName.split("\\");
				fileName = fileName[fileName.length - 1].replace(".json", "");
				let workspaceTemplateDefinition = JSON.parse(e.target.result);
				let templateName = Object.keys(workspaceTemplateDefinition.workspaceTemplates)[0];
				if (fileName !== templateName) {
					//We want the file name to overwrite the name of the workspace that was saved as the template..
					workspaceTemplateDefinition.workspaceTemplates[fileName] = workspaceTemplateDefinition.workspaceTemplates[templateName];
					delete workspaceTemplateDefinition.workspaceTemplates[templateName];
				}
				workspaceTemplateDefinition.workspaceTemplates[fileName].name = fileName;
				FSBL.Clients.WorkspaceClient.addWorkspaceDefinition({ workspaceJSONDefinition: workspaceTemplateDefinition.workspaceTemplates, force: false }, function (err) {
					if (err) {
						FSBL.Clients.Logger.info("addWorkspaceTemplateDefinition error", err);
					}
					done();
				});
			};

			// Read in the image file as a data URL.
			reader.readAsText(file);
		};

		async.each(files, loadFile, () => {
			//Clear out files. so if the user imports the same  file back-to-back, the event will fire.
			inputElement.value = "";
			this.addUploadChangeListener()
			FSBL.Clients.Logger.info("Workspaces imported");
		});
	}
	exportWorkspace() {
		if (this.state.focusedWorkspace === '') return;
		var self = this;
		function doExport() {
			FSBL.Clients.WorkspaceClient.getWorkspaceDefinition({ workspaceName: self.state.focusedWorkspace }, (err, workspaceDefinition) => {
				if (err) {
					FSBL.Clients.Logger.error("getWorkspaceDefinition error", err);
				} else {
					//We're saving using a routine initially created for templates. The outcome is the same and it probably should have just been "Save to file". This bool is to allow it to save.
					FSBL.ConfigUtils.promptAndSaveJSONToLocalFile(self.state.focusedWorkspace, { workspaceTemplates: workspaceDefinition });
				}
			});
		}

		//Set alwaysOnTop to false and add an event listener on the window. When focus is regained
		//then reset always on top
		self.changePreferencesAlwaysOnTop(false);
		finsembleWindow.addEventListener('focused', this.preferencesFocused);
		//If we're autosaving, autosave, then export.
		//@todo, put into store. consider moving autosave into workspaceClient.
		FSBL.Clients.ConfigClient.getValue({ field: "finsemble.preferences.workspaceService.promptUserOnDirtyWorkspace" }, (err, data) => {
			//default to false.
			let PROMPT_ON_SAVE = data === null ? false : data;
			if (!PROMPT_ON_SAVE) {
				let activeName = FSBL.Clients.WorkspaceClient.activeWorkspace.name;
				return FSBL.Clients.WorkspaceClient.saveAs({
					name: activeName,
					force: true
				}, (err, response) => {
					doExport();
				});
			}
			doExport();
		});
	}
	handleButtonClicks(e) {
		if (this.state.adding || this.state.editing) {
			e.preventDefault();
		}
	}

	getFocusedWorkspaceComponentList() {
		let { workspaceList, focusedWorkspace } = this.state;
		if (focusedWorkspace === "") return [];
		let workspace = workspaceList.filter(wSpace => wSpace.name === focusedWorkspace)[0];

		FSBL.Clients.WorkspaceClient.getWorkspaceDefinition({ workspaceName: focusedWorkspace }, (err, workspaceDefinition) => {
			let componentTypes = this.getComponentTypes(workspaceDefinition[focusedWorkspace]);
			this.setState({
				focusedWorkspaceComponentList: componentTypes
			});
		});
	}
	render() {
		let deleteButtonClasses = "individual-workspace-action delete-workspace",
			exportButtonClasses = "action-button workspace-action-button",
			renameButtonClasses = "individual-workspace-action",
			addButtonClasses = "positive-action-button action-button workspace-action-button",
			importButtonClasses = "action-button workspace-action-button",
			allowAdd = true,
			allowDelete = true,
			allowExport = true,
			allowRename = true,
			allowImport = true,
			deleteTooltip = "Delete";

		if (this.state.focusedWorkspace === FSBL.Clients.WorkspaceClient.activeWorkspace.name) {
			deleteButtonClasses += " disabled-individual-workspace-action";
		}

		if (this.state.focusedWorkspace === '') {
			exportButtonClasses += " disabled-button";
			renameButtonClasses += " disabled-individual-workspace-action";
			deleteButtonClasses += " disabled-individual-workspace-action";
			deleteTooltip = "No workspace selected";
			allowRename = false;
			allowExport = false;
			allowDelete = false;
		}

		if (this.state.adding || this.state.editing) {
			renameButtonClasses += " disabled-button";
			addButtonClasses += " disabled-button";
			exportButtonClasses += " disabled-button";
			importButtonClasses += " disabled-button";
			deleteButtonClasses += " disabled-button";
			allowAdd = false;
			allowDelete = false;
			allowExport = false;
			allowRename = false;
			allowImport = false;
		}

		let addTooltip = "Add new workspace",
			importTooltip = "Import workspace from file",
			exportTooltip = allowExport ? "Export selected workspace" : "No workspace selected",
			renameTooltip = allowRename ? "Rename" : "Cannot Edit";

		return <div>
			<input style={{ display: 'none' }} type="file" id="file-input" />
			<div className="complex-menu-content-row">
				<div className="workspace-list-header-row">
					<div className="content-section-header workspace-list-header"></div>
				</div>
				<div className="content-section-wrapper">
					<div ref="WorkspaceList" className="workspace-list">
						<FinsembleDnDContext onDragEnd={this.onDragEnd}>
							<FinsembleDroppable direction="vertical" droppableId="workspace-list">
								{this.state.workspaceList.map((workspace, i) => {
									let baseClass = "workspace-item";
									let classNames = baseClass;
									if (FSBL.Clients.WorkspaceClient.activeWorkspace.name === workspace.name) {
										classNames += " active-workspace";
									}

									if (this.state.workspaceToLoadOnStart === workspace.name) {
										classNames += " auto-start-workspace-item";
									}

									if (this.state.focusedWorkspace === workspace.name) {

										classNames += " focused-workspace-item";
										if (i === 0) {
											classNames += " no-top-border";
										}
										if (this.state.editing || this.state.adding) {
											classNames += " workspace-item-editing";
											return (<div key={i} className={classNames}>
												<WorkspaceEditor alue={workspace.name}
													saveHandler={this.state.editing ? this.renameWorkspace : this.addWorkspace}
													cancelHandler={this.cancelEdit}
												/>
											</div>);
										}
									}
									return (
										<FinsembleDraggable onClick={() => this.setFocusedWorkspace(workspace.name)} wrapperClass={classNames} draggableId={workspace.name} key={i} index={i}>
											<div className="ff-adp-hamburger"></div>
											<div className="workspace-name" title={workspace.name}>
												{workspace.name}
											</div>
											<div className="individual-workspace-actions">
												{workspace.name !== FSBL.Clients.WorkspaceClient.activeWorkspace.name &&
												<div title={renameTooltip} className={renameButtonClasses} onMouseDown={this.handleButtonClicks} onClick={
													allowRename ? () => { this.startEditingWorkspace(workspace.name) } : Function.prototype}><i className="ff-adp-edit"></i></div>}
												{workspace.name !== FSBL.Clients.WorkspaceClient.activeWorkspace.name &&
													<div title={deleteTooltip} className={deleteButtonClasses} onMouseDown={this.handleButtonClicks} onClick={
														allowDelete ? () => { this.deleteWorkspace(workspace.name); } : Function.prototype}><i className="ff-adp-trash-outline"></i></div>}
											</div>
										</FinsembleDraggable>
									)
								})}
							</FinsembleDroppable>
						</FinsembleDnDContext>
					</div>
					<div className="workspace-extras">
						<div className="workspace-component-list">
							{this.state.focusedWorkspaceComponentList.length > 0 &&
								this.state.focusedWorkspaceComponentList.map((cmp, i) => {
									return <div key={i} className="workspace-component">{cmp}</div>
								})}
							{this.state.focusedWorkspaceComponentList.length === 0 &&
								"No components."}
						</div>
						{/* <div className="workspace-action-buttons">
							<div title={importTooltip} className={importButtonClasses} onMouseDown={this.handleButtonClicks} onClick={allowImport ? this.openFileDialog : Function.prototype}>
								<i className="workspace-action-button-icon ff-import"></i>
								<div>Import</div>
							</div>
							<div title={exportTooltip} className={exportButtonClasses} onMouseDown={this.handleButtonClicks} onClick={allowExport ? this.exportWorkspace : Function.prototype}>
								<i className="workspace-action-button-icon ff-export"></i>
								<div>Export</div>
							</div>

						</div> */}
					</div>
				</div>
				<Checkbox
					disabled={!this.state.focusedWorkspace}
					onClick={this.setWorkspaceToLoadOnStart}
					checked={this.state.focusedWorkspace === this.state.workspaceToLoadOnStart}
					label="Load this workspace on startup." />
			</div>
		</div>

	}
}