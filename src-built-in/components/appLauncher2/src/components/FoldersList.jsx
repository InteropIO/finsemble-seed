import React from 'react'
import AddNewFolder from './AddNewFolder'
import FolderActionsMenu from './FolderActionsMenu'
import storeActions from '../stores/StoreActions'
import { getStore } from '../stores/LauncherStore'
import { FinsembleDraggable } from '@chartiq/finsemble-react-controls'

const MY_APPS = 'My Apps'
const DASHBOARDS = 'Dashboards'

export default class FoldersList extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			foldersList: storeActions.getFoldersList(),
			activeFolder: storeActions.getActiveFolderName(),
			renamingFolder: null,
			folderNameInput: ''
		}
		this.renameFolder = this.renameFolder.bind(this)
		this.changeFolderName = this.changeFolderName.bind(this)
		this.onFoldersListUpdate = this.onFoldersListUpdate.bind(this)
		this.keyPressed = this.keyPressed.bind(this)
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

	componentWillMount() {
		getStore().addListener({ field: 'appFolders.list' }, this.onFoldersListUpdate)
	}

	componentWillUnmount() {
		getStore().addListener({ field: 'appFolders.list' }, this.onFoldersListUpdate)
	}

	renameFolder(name) {
		this.setState({
			renamingFolder: name
		});
	}

	changeFolderName(e) {
		this.setState({
			folderNameInput: e.target.value
		});
	}

	keyPressed(e) {
		if (e.key === "Enter") {
			const input = this.state.folderNameInput.trim()
			const oldName = this.state.renamingFolder, newName = input
			// Check user input to make sure its at least 1 character
			// made of string, number or both
			if (!/^([a-zA-Z0-9\s]{1,})$/.test(input)) {
				// Do not rename
				console.warn('A valid folder name is required. /^([a-zA-Z0-9\s]{1,})$/')
				return
			}
			this.setState({
				folderNameInput: "",
				renamingFolder: null
			}, () => {
				storeActions.renameFolder(oldName, newName);
			});
		}
	}

	renderFoldersList() {
		const folders = storeActions.getFolders()
		return this.state.foldersList.map((folderName, index) => {
			const folder = folders[folderName]
			let className = 'complex-menu-section-toggle'
			if (this.state.activeFolder === folderName) {
				className += ' active-section-toggle'
			}

			let nameField = folder.icon === 'ff-folder' && this.state.renamingFolder === folderName ? 
			<input value={this.state.folderNameInput}
				onChange={this.changeFolderName}
				onKeyPress={this.keyPressed} autoFocus/> : folderName

			return <FinsembleDraggable
				draggableId={folderName}
				key={index} index={index}>
				<div onClick={(event) => this.onFolderClicked(event, folderName)}
					onDrop={(event) => this.onAppDrop(event, folderName)}
					className={className} key={index}>
					<span className='left-nav-label'>
						{folder.icon && <i className={folder.icon}></i>}
						{nameField}
					</span>
					{folder.icon === 'ff-folder' ? <FolderActionsMenu folder={folderName} renameFolder={this.renameFolder} /> : null}
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