/*!
* Copyright 2018 by ChartIQ, Inc.
* All rights reserved.
*
*/

import React from "react";
import storeActions from "../stores/StoreActions";
import { default as catalogActions } from "../../../appCatalog2/src/stores/storeActions";

const MY_APPS = "My Apps";
const FAVORITES = "Favorites";
const FDC3 = "FDC3";

/**
 * Displays a list of actions like 'View info', 'Add to favorite'
 * etc on each app in the list
 */
export default class AppActionsMenu extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			isVisible: false
		};
		// Bind correct context
		this.onAddToFavorite = this.onAddToFavorite.bind(this);
		this.onRemoveFromFavorite = this.onRemoveFromFavorite.bind(this);
		this.onViewInfo = this.onViewInfo.bind(this);
		this.toggleMenu = this.toggleMenu.bind(this);
		this.onRemove = this.onRemove.bind(this);
		this.setMenuRef = this.setMenuRef.bind(this);
		this.deleteApp = this.deleteApp.bind(this);
		this.handleClickOutside = this.handleClickOutside.bind(this);
	}

	componentDidMount() {
		document.addEventListener("mousedown", this.handleClickOutside);
	}

	componentWillUnmount() {
		document.removeEventListener("mousedown", this.handleClickOutside);
	}

	toggleMenu(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
		this.setState({
			isVisible: !this.state.isVisible
		});
	}

	/**
	 * Adds app to Favorites folder, then adds pin and hides the menu
	 */
	onAddToFavorite() {
		storeActions.addAppToFolder(FAVORITES, this.props.app);
		storeActions.addPin(this.props.app);
		this.toggleMenu();
	}
	/**
	 * Removes app from Favorites folder, then removes pin and hides the menu
	 */
	onRemoveFromFavorite() {
		storeActions.removeAppFromFolder(FAVORITES, this.props.app);
		storeActions.removePin(this.props.app);
		this.toggleMenu();
	}
	/**
	 * Opens app catalog and switches to the page when you see all
	 * the details about the app
	 */
	onViewInfo() {
		this.toggleMenu();
		FSBL.Clients.LauncherClient.showWindow(
			{
				componentType: "App Catalog"
			},
			{
				monitor: "mine",
				staggerPixels: 0,
				spawnIfNotFound: true,
				left: "center",
				top: "center"
			}, (error) => {
				// Publish this event so that catalog knows
				// what app we want to view


				//NOTE: While not ideal, without a small delay (when having to launch the app catalog) the app catalog wont recieve the message as it will still be initializing
				setTimeout(() => {
					FSBL.Clients.RouterClient.transmit("viewApp", {
						app: this.props.app
					});
				}, 250);
			});
	}
	/**
	 * Calls the storeActions.removeAppFromFolder to remove
	 * an app from the currently selected folder
	 */
	onRemove() {
		storeActions.removeAppFromFolder(
			this.props.folder.name,
			this.props.app);
		this.toggleMenu();
	}

	setMenuRef(node) {
		this.menuRef = node;
	}

	handleClickOutside(e) {
		if (this.menuRef && !this.menuRef.contains(e.target)) {
			this.setState({
				isVisible: false
			});
		}
	}

	/**
	 * Calls storeActions.deleteApp() to delete an app
	 * from all folders and from apps list
	 */
	deleteApp() {
		storeActions.deleteApp(this.props.app.appID);
	}

	renderList() {
		// The 'View info' action is only visible on apps
		// that have the source property and with a value of FDC3
		const apps = storeActions.getAllApps();
		const app = apps[this.props.app.appID];
		const folder = this.props.folder;
		let favoritesActionOnClick = this.props.isFavorite ? this.onRemoveFromFavorite : this.onAddToFavorite;
		let favoritesText = this.props.isFavorite ? "Remove from Favorites" : "Add to Favorites";
		return (
			<div className="actions-menu" style={{ right: 0 }}>
				<ul>
					<li onClick={favoritesActionOnClick}>{favoritesText}</li>
					{app.source && app.source === FDC3 && <li onClick={this.onViewInfo}>View Info</li>}
					{!app.source && <li onClick={this.deleteApp}>Delete App</li>}
					{[MY_APPS, FAVORITES].indexOf(folder.name) === -1 &&
						<li onClick={this.onRemove}>Remove from {folder.name}</li>}
				</ul>
			</div>
		);
	}
	render() {
		return (
			<div ref={this.setMenuRef} className="actions-menu-wrapper" onClick={this.toggleMenu}>
				<span><i className="ff-dots-vert" /></span>
				{this.state.isVisible && this.renderList()}
			</div>
		);
	}
}