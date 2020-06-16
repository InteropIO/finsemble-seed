import React from "react";
import AppActionsMenu from "./AppActionsMenu";
import AppTagsList from "./AppTagsList";
import storeActions from "../stores/StoreActions";
import { isAppInFavorites } from "../utils/helpers";
const DEFAULT_APP_ICON = "ff-component";
const FAVORITES = "Favorites";
/**
 * Used to make sure that a user is not waiting for component
 * to spawn after a double click, helps us prevent multiple
 * spawns for the same app.
 */
export default class AppDefinition extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			favorites: [],
		};
		this.onDragToFolder = this.onDragToFolder.bind(this);
		this.onItemClick = this.onItemClick.bind(this);
		this.onAddToFavorite = this.onAddToFavorite.bind(this);
		this.onRemoveFromFavorite = this.onRemoveFromFavorite.bind(this);
	}
	/**
	 * Native HTML5 drag and drop
	 **/
	onDragToFolder(event, app) {
		event.dataTransfer.setData("app", JSON.stringify(this.props.app));
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
		const name = this.props.app.title || this.props.app.name;
		FSBL.Clients.LauncherClient.spawn(name, {
			addToWorkspace: true,
		});
	}
	/**
	 * Adds app to Favorites folder, then adds pin and hides the menu
	 */
	onAddToFavorite(e) {
		e.stopPropagation();
		storeActions.addAppToFolder(FAVORITES, this.props.app);
		storeActions.addPin(this.props.app);
	}
	/**
	 * Removes app from Favorites folder, then removes pin and hides the menu
	 */
	onRemoveFromFavorite(e) {
		e.stopPropagation();
		storeActions.removeAppFromFolder(FAVORITES, this.props.app);
		storeActions.removePin(this.props.app);
	}
	render() {
		const app = this.props.app;
		const isFavorite = isAppInFavorites(app.appID);
		if (typeof app.icon === "undefined" || app.icon === null)
			app.icon = DEFAULT_APP_ICON;
		let favoritesActionOnClick = isFavorite
			? this.onRemoveFromFavorite
			: this.onAddToFavorite;
		return (
			<div
				onClick={this.onItemClick}
				className="app-item link"
				draggable="true"
				onDragStart={this.onDragToFolder}
			>
				<span className="app-item-title">
					<i
						onClick={(e) => {
							favoritesActionOnClick(e);
						}}
						className={isFavorite ? "ff-favorite" : "ff-star-outline"}
					></i>
					<span>{app.displayName || app.name}</span>
				</span>
				{app.tags.length > 0 && <AppTagsList tags={app.tags} />}
				<AppActionsMenu
					app={app}
					folder={this.props.folder}
					isFavorite={isFavorite}
				/>
			</div>
		);
	}
}
