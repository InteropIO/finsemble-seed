import React from 'react'
import AppActionsMenu from './AppActionsMenu'
import AppTagsList from './AppTagsList'
import storeActions from '../stores/StoreActions'

/**
 * Used to make sure that a user is not waiting for component
 * to spawn after a double click, helps us prevent multiple
 * spawns for the same app.
 */
let pendingSpawn = false

export default class AppDefinition extends React.Component {

	constructor(props) {
		super(props)
		this.onDragToFolder = this.onDragToFolder.bind(this)
		this.onDoubleClick = this.onDoubleClick.bind(this)
	}

	/**
	* Native HTML5 drag and drop
	**/
	onDragToFolder(event, app) {
		event.dataTransfer
			.setData('app', JSON.stringify(this.props.app))
	}
	/**
	 * Spawn a component on double click
	 */
	onDoubleClick(app) {
		if (pendingSpawn) return
		pendingSpawn = true
		FSBL.Clients.LauncherClient.spawn(app.name, {}, (error, data) => {
			pendingSpawn = false
		})
	}

	isFavorite() {
		return storeActions
		.getFavoriteFolder().appDefinitions
		.find(app => app.name === this.props.app.name)
	}

	render() {
		const app = this.props.app
		return (
			<div onDoubleClick={() => this.onDoubleClick(app)} className="app-item" draggable="true" onDragStart={this.onDragToFolder}>
				<span className="app-item-title">
					{app.icon !== undefined ? <i className={app.icon}></i> : null}
					{app.friendlyName} {this.isFavorite() && <i className='ff-favorite'></i>}
				</span>
				<AppTagsList tags={app.tags} />
				<AppActionsMenu app={app}/>
			</div>
		)
	}
}