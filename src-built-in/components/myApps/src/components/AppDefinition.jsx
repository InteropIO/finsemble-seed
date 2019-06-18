import React from "react";
import AppActionsMenu from "./AppActionsMenu";
import AppTagsList from "./AppTagsList";
import storeActions from "../stores/StoreActions";
const DEFAULT_APP_ICON = "ff-component";
/**
 * Used to make sure that a user is not waiting for component
 * to spawn after a double click, helps us prevent multiple
 * spawns for the same app.
 */
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
		//an immediate hide when the button was clicked felt like a bug. Add a nice timeout that's a little less than human reaction time. Feels nice.
		setTimeout(() => {
			finsembleWindow.hide();
		}, 100);
		const name = this.props.app.title || this.props.app.name
		// If the app has a URL property
		// For now, this means it was manually added
		// So lets spawn from URL
		if (this.props.app.url) {
			return FSBL.Clients.LauncherClient.spawn(null, {
				url: this.props.app.url,
				addToWorkspace: true
			})
		}
		// Otherwise launch application by name
		FSBL.Clients.LauncherClient.spawn(name, {
			addToWorkspace: true
		});
	}

	isFavorite() {
		let favorites = Object.keys(storeActions.getSingleFolder("Favorites").apps);
		return favorites.indexOf(this.props.app.appID.toString()) > -1;
	}

	render() {
		const app = this.props.app;
		if (typeof (app.icon) === "undefined" || app.icon === null) app.icon = DEFAULT_APP_ICON;
		return (
			<div onClick={this.onItemClick} className="app-item link" draggable="true" onDragStart={this.onDragToFolder}>
				<span className="app-item-title">
					<i className={app.icon}></i>
					<span >{app.name}</span> {this.isFavorite() && <i className='ff-favorite'></i>}
				</span>
				{app.tags.length > 0 &&
					<AppTagsList tags={app.tags} />}
				<AppActionsMenu app={app} folder={this.props.folder} isFavorite={this.isFavorite()} />
			</div>
		);
	}
}