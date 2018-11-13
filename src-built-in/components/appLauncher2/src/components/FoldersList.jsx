import React from 'react'
import AddNewFolder from './AddNewFolder'
import storeActions from '../stores/StoreActions'
import { getStore } from '../stores/LauncherStore'
import { FinsembleDraggable, FinsembleDialog } from '@chartiq/finsemble-react-controls'

const MY_APPS = 'My Apps'
const DASHBOARDS = 'Dashboards'
const FAVORITES = 'Favorites'

export default class FoldersList extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			foldersList: storeActions.getFoldersList(),
			activeFolder: storeActions.getActiveFolderName(),
			renamingFolder: null,
			folderNameInput: '',
			isNameError: false
		}
		this.renameFolder = this.renameFolder.bind(this)
		this.changeFolderName = this.changeFolderName.bind(this)
		this.onFoldersListUpdate = this.onFoldersListUpdate.bind(this)
		this.keyPressed = this.keyPressed.bind(this)
		this.deleteFolder = this.deleteFolder.bind(this)
		this.onFocusRemove = this.onFocusRemove.bind(this)
	}

	onAppDrop(event, folder) {
		event.preventDefault()
		const app = JSON.parse(event.dataTransfer.getData('app'))
		//TODO: When adding to favorite do more stuff?
		if (folder.name === 'Favorites') {
			console.info('Dropped app in favorites.')
		}
		// Do not do anything if its my apps or dashboards folder
		[MY_APPS, DASHBOARDS].indexOf(folder) < 0 && storeActions.addAppToFolder(folder, app)
	}

	onFoldersListUpdate(error, data) {
		this.setState({
			foldersList: data.value
		})
	}

	onFolderClicked(event, folder) {
		getStore().setValue({
			field: 'activeFolder',
			value: folder
		}, (error, data) => {
			this.setState({
				activeFolder: folder
			})
		})
	}

	onFocusRemove(event) {
		// We don't want to hide the input if user clicked on it
		// We only hide when the click is anywhere else in the document
		if(event.target.id === 'rename') {
			return
		}
		// If focus removed and nothing was type, then just hide
		// and consider it a rename cancel
		if(!this.state.folderNameInput) {
			// Cancel rename
			this.setState({
				renamingFolder: null
			})
			this.removeClickListener()
			return
		}
		//Finally, all good and so we can rename the folder
		this.attempRename()
	}

	componentWillMount() {
		getStore().addListener({ field: 'appFolders.list' }, this.onFoldersListUpdate)
	}

	componentWillUnmount() {
		getStore().addListener({ field: 'appFolders.list' }, this.onFoldersListUpdate)
	}

	renameFolder(name, e) {
		e.preventDefault();
		e.stopPropagation();
		this.setState({
			renamingFolder: name
		})
		this.addClickListener()
	}

	changeFolderName(e) {
		this.setState({
			folderNameInput: e.target.value
		});
	}

	deleteFolder(name, e) {
		e.stopPropagation();
		e.preventDefault();
		// Do not attemp to delete if user is renaming a folder
		!this.state.renamingFolder && storeActions.deleteFolder(name)
	}

	keyPressed(e) {
		if (e.key === "Enter") {
			this.attempRename()
		}
	}

	addClickListener() {
		document.addEventListener('click', this.onFocusRemove)
	}

	removeClickListener() {
		document.removeEventListener('click', this.onFocusRemove)
	}
	/**
	 * To be called when user press Enter or when focus is removed
	 */
	attempRename() {
		const folders = storeActions.getFolders()
		const input = this.state.folderNameInput.trim()
		const oldName = this.state.renamingFolder, newName = input
		// Check user input to make sure its at least 1 character
		// made of string, number or both
		if (!/^([a-zA-Z0-9\s]{1,})$/.test(input)) {
			// Do not rename
			console.warn('A valid folder name is required. /^([a-zA-Z0-9\s]{1,})$/')
			return
		}
		// Names must be unique, folders cant share same names
		if (folders[newName]) {
			this.setState({
				isNameError: true
			}, () => {
				let dialogParams = {
					question: "Folder name already exists. A (1) will be appended.",
					showNegativeButton: false
				};
				const userInput = (err, res) => {
					if (res.choice === "affirmative") {
						storeActions.renameFolder(oldName, newName + "(1)");
						this.setState({
							folderNameInput: '',
							renamingFolder: null,
							isNameError: false
						}, this.removeClickListener);
					}
				}
				FSBL.Clients.DialogManager.open('yesNo', dialogParams, userInput);
			});
		} else {
			this.setState({
				folderNameInput: "",
				renamingFolder: null,
				isNameError: false
			}, () => {
				storeActions.renameFolder(oldName, newName)
				// No need for the click listener any more
				this.removeClickListener()
			})
		}
	}

	renderFoldersList() {
		const dragDisabled = [MY_APPS, DASHBOARDS, FAVORITES]
		const folders = storeActions.getFolders()
		return this.state.foldersList.map((folderName, index) => {
			const folder = folders[folderName]
			let className = 'complex-menu-section-toggle'
			if (this.state.activeFolder === folderName) {
				className += ' active-section-toggle'
			}

			let nameField = folder.icon === 'ff-folder' && this.state.renamingFolder === folderName ?
				<input id="rename" className={this.state.isNameError ? 'error' : ''} value={this.state.folderNameInput}
					onChange={this.changeFolderName}
					onKeyPress={this.keyPressed} autoFocus /> : folderName

			return <FinsembleDraggable isDragDisabled={dragDisabled.indexOf(folderName) > -1} 
				draggableId={folderName}
				key={index} index={index}>
				<div onClick={(event) => this.onFolderClicked(event, folderName)}
					onDrop={(event) => this.onAppDrop(event, folderName)}
					className={className} key={index}>
					<div className='left-nav-label'>
						{folder.icon && <i className={folder.icon}></i>}
						<div className="folder-name">{nameField}</div>
					</div>
					{folder.icon === 'ff-folder' && <span className='folder-action-icons'>
						<i className='ff-edit' onClick={this.renameFolder.bind(this, folderName)}></i>
						<i className='ff-delete' onClick={this.deleteFolder.bind(this, folderName)}></i>
					</span>}

				</div>
			</FinsembleDraggable>
		})
	}

	render() {
		return (
			<div className="top">
				<div className='folder-list'>
					{this.renderFoldersList()}
				</div>
				<AddNewFolder />
			</div>
		)
	}
}