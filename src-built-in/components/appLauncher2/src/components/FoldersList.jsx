import React from 'react'
import AddNewFolder from './AddNewFolder'
import FolderActionsMenu from './FolderActionsMenu'
import storeActions from '../stores/StoreActions'
import { getStore } from '../stores/LauncherStore'
import { FinsembleDraggable } from '@chartiq/finsemble-react-controls'

export default class FoldersList extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			folders: [],
			activeFolder: 'My Apps'
		}
		this.setStateValues()
		this.renameFolder = this.renameFolder.bind(this)
		this.changeFolderName = this.changeFolderName.bind(this)
		this.onAppFoldersUpdate = this.onAppFoldersUpdate.bind(this)
		this.keyPressed = this.keyPressed.bind(this)
	}

	async setStateValues() {
		this.setState({
			folders: await storeActions.getFolders(),
			activeFolder: 'My Apps',
			renamingFolder: null,
			folderNameInput: ""
		});
	}

	onAppDrop(event, folder) {
		event.preventDefault()
		const app = JSON.parse(event.dataTransfer.getData('app'))
		//TODO: When adding to favorite do more stuff?
		if (folder.name === 'Favorites') {
			console.info('Dropped app in favorites.')
		}
		// Do not do anything if its my apps folder
		folder.name !== 'My Apps' && storeActions.addAppToFolder(folder, app)
	}


	onAppFoldersUpdate(error, data) {
		this.setState({
			folders: data.value
		})
	}

	onFolderClicked(folder) {
		getStore().setValue({
			field: 'activeFolder',
			value: folder.name
		}, () => {
			this.setState({
				activeFolder: folder.name
			})
		})
	}

	componentWillMount() {
		getStore().addListener({ field: 'folders' }, this.onAppFoldersUpdate)
	}

	componentWillUnmount() {
		getStore().removeListener({ field: 'folders' }, this.onAppFoldersUpdate)
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

		return this.state.folders.map((folder, index) => {

			let className = 'complex-menu-section-toggle'
			if (this.state.activeFolder === folder.name) {
				className += ' active-section-toggle'
			}

			let nameField = folder.icon === 'ff-folder' && this.state.renamingFolder === folder.name ? 
			<input value={this.state.folderNameInput}
				onChange={this.changeFolderName}
				onKeyPress={this.keyPressed} autoFocus/> : folder.name

			return <FinsembleDraggable
				draggableId={folder.name}
				key={index} index={index}>
				<div onClick={() => this.onFolderClicked(folder)}
					onDrop={(event) => this.onAppDrop(event, folder)}
					className={className} key={index}>
					<span className='left-nav-label'>
						{folder.icon && <i className={folder.icon}></i>}
						{nameField}
					</span>
					{folder.icon === 'ff-folder' ? <FolderActionsMenu folder={folder} renameFolder={this.renameFolder} /> : null}
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