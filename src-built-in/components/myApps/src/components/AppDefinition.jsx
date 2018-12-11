import React from "react";
import AppActionsMenu from "./AppActionsMenu";
import AppTagsList from "./AppTagsList";
import storeActions from "../stores/StoreActions";

/**
 * Used to make sure that a user is not waiting for component
 * to spawn after a double click, helps us prevent multiple
 * spawns for the same app.
 */
let pendingSpawn = false;

export default class AppDefinition extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			favorites: []
		};
		this.onDragToFolder = this.onDragToFolder.bind(this);
		this.onItemClick = this.onItemClick.bind(this);
	}

	/**
	* Native HTML5 drag and drop
	**/
	onDragToFolder(event, app) {
		event.dataTransfer
			.setData("app", JSON.stringify(this.props.app));
	}

	/**
	 * Spawns a component on click
	 * @param {object} e The Synthetic React event
	 * 
	 */
	onItemClick() {
		if (pendingSpawn) { return; }
		pendingSpawn = true;
		FSBL.Clients.LauncherClient.spawn(this.props.app.name, null, (err, data) => {
			console.log("pending spawn complete");
			pendingSpawn = false;
		});
	}

	isFavorite() {
		let favorites = Object.keys(storeActions.getSingleFolder("Favorites").apps);
		return favorites.indexOf(this.props.app.appID.toString()) > -1;
	}

	render() {
		const app = this.props.app;
		return (
			<div onClick={this.onItemClick} className="app-item link" draggable="true" onDragStart={this.onDragToFolder}>
				<span className="app-item-title">
					{app.icon !== undefined ? <i className={app.icon}></i> : null}
					<span >{app.name}</span> {this.isFavorite() && <i className='ff-favorite'></i>}
				</span>
				<AppTagsList tags={app.tags} />
				<AppActionsMenu app={app} folder={this.props.folder} isFavorite={this.isFavorite()} />
			</div>
		);
	}
}