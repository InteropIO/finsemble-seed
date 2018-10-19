import './AppDefinition.css'

import React from 'react'
import AppActionsMenu from './AppActionsMenu'
import AppTagsList from './AppTagsList'

export default class AppDefinition extends React.Component {

	constructor(props) {
		super(props)
		this.onDragToFolder = this.onDragToFolder.bind(this)
	}

	/**
	* Native HTML5 drag and drop
	**/
	onDragToFolder(event, app) {
		event.dataTransfer
			.setData('app', JSON.stringify(this.props.app))
	}

	render() {
		const app = this.props.app
		return (
			<div className="app-item" draggable="true" onDragStart={this.onDragToFolder}>
				<div className="app-item-title">{app.friendlyName}</div>
				<AppTagsList tags={app.tags} />
				<AppActionsMenu />
			</div>
		)
	}
}