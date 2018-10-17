import React from  'react'
import storeActions from '../stores/StoreActions'
import {getStore} from '../stores/LauncherStore'
import {FinsembleDraggable} from '@chartiq/finsemble-react-controls'

export default class FoldersList extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			folders: storeActions.getFolders(),
			activeFolder: 'My Apps'
		}

	}
	
	onAppFoldersUpdate() {
		this.setState({
			folders: storeActions.getFolders()
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
		getStore().addListener({field: 'appFolders'}, this.onAppFoldersUpdate.bind(this))
	}

	componentWillUnmount() {
		getStore().removeListener({field: 'appFolders'}, this.onAppFoldersUpdate.bind(this))
	}

	renderFoldersList() {
		return 	this.state.folders.map((folder, index) => {

			let className = 'complex-menu-section-toggle'
			if (this.state.activeFolder === folder.name) {
				className += ' active-section-toggle'
			}
			return <FinsembleDraggable 
			draggableId={folder.name} 
			key={index} index={index}>
				<div onClick={() => this.onFolderClicked(folder)} 
				className={className} key={index}>{folder.name}</div>
			</FinsembleDraggable>
		})
	}

	render() {
		return (
			<div className="top">
				{this.renderFoldersList()}
			</div>
			)
	}
}