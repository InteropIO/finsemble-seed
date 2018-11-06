/*!
* Copyright 2018 by ChartIQ, Inc.
* All rights reserved.
*
*/

import React from 'react'
import storeActions from '../stores/StoreActions'
import {default as catalogActions} from '../../../appCatalog2/src/stores/storeActions';

export default class AppActionsMenu extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			isVisible: false
		}
		// Bind context
		this.onAddToFavorite = this.onAddToFavorite.bind(this)
		this.onRemoveFromFavorite = this.onRemoveFromFavorite.bind(this);
		this.onViewInfo = this.onViewInfo.bind(this)
		this.toggleMenu = this.toggleMenu.bind(this)
		this.onRemove = this.onRemove.bind(this)
		this.setMenuRef = this.setMenuRef.bind(this)
		this.handleClickOutside = this.handleClickOutside.bind(this)
	}

	componentDidMount() {
		document.addEventListener('mousedown', this.handleClickOutside);
	}

	componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleClickOutside);
	}

	toggleMenu() {
		this.setState({
			isVisible: !this.state.isVisible
		})
	}

	//TODO: Implement handlers
	onAddToFavorite() {
		storeActions.addAppToFolder('Favorites', this.props.app)
		this.toggleMenu();
	}

	onRemoveFromFavorite() {
		storeActions.removeAppFromFolder('Favorites', this.props.app);
		this.toggleMenu()
	}

	onViewInfo() {
		this.toggleMenu();
		FSBL.Clients.LauncherClient.showWindow(
			{
				componentType: "App Catalog 2"
			},
			{
				monitor: "mine",
				staggerPixels: 0,
				spawnIfNotFound: true,
				left: "center",
				top: "center"
			}, () => {
				//TODO: Make this work. There is logic already in the catalog store for opening an apps info page. But calling it directly from here won't work.
				catalogActions.openApp(this.props.app.appId);
		});
	}

	onRemove() {
		storeActions.removeAppFromFolder(
			this.props.folder,
			this.props.app)
		this.toggleMenu()
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

	renderList() {
		const folder = this.props.folder
		console.log('folder: ', folder);
		let favoritesActionOnClick = this.props.isFavorite ? this.onRemoveFromFavorite : this.onAddToFavorite;
		let favoritesText = this.props.isFavorite ? "Remove from favorites" : "Add to favorites";
		return (
			<div className="actions-menu" style={{ right: 0 }}>
				<ul>
					<li onClick={favoritesActionOnClick}>{favoritesText}</li>
					<li onClick={this.onViewInfo}>View Info</li>
					{['My Apps', 'Favorites'].indexOf(folder.name) === -1 &&
						<li onClick={this.onRemove}>Remove from {folder.name}</li>}
				</ul>
			</div>
		)
	}
	render() {
		return (
			<div ref={this.setMenuRef} className="actions-menu-wrapper" onClick={this.toggleMenu}>
				<span><i className="ff-dots-vert" /></span>
				{this.state.isVisible && this.renderList()}
			</div>
		)
	}
}