/*!
* Copyright 2018 by ChartIQ, Inc.
* All rights reserved.
*
*/

import React from 'react'
import storeActions from '../stores/StoreActions'
import { getStore } from '../stores/LauncherStore'


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
	}

	toggleMenu() {
		this.setState({
			isVisible: !this.state.isVisible
		})
	}

	//TODO: Implement handlers
	async onAddToFavorite() {
		const favorite = await storeActions.getFavoriteFolder()
		storeActions.addAppToFolder(favorite, this.props.app)
		this.setState({
			isVisible: false
		})
	}

	onRemoveFromFavorite() {
		const favorite = storeActions.getFolders().find((folder) => {
			return folder.name === "Favorites";
		});
		storeActions.removeAppFromFolder(favorite, this.props.app);
		this.toggleMenu();
	}

	onViewInfo() {
		this.toggleMenu()
	}

	onRemove() {
		storeActions.removeAppFromFolder(
			this.props.folder,
			this.props.app)
		this.toggleMenu()
	}

	renderList() {
		const folder = this.props.folder
		let favoritesActionOnClick = this.props.isFavorite ? this.onRemoveFromFavorite : this.onAddToFavorite;
		let favoritesText = this.props.isFavorite ? "Remove from favorites" : "Add to favorites";
		return (
			<div onMouseLeave={this.state.isVisible ? this.toggleMenu : null}
				className="actions-menu" style={{ right: 0 }}>
				<ul>
					<li onClick={favoritesActionOnClick}>{favoritesText}</li>
					<li onClick={this.onViewInfo}>View Info</li>
					{folder.name !== "Favorites" &&
						<li onClick={this.onRemove}>Remove from {folder.name}</li>}
				</ul>
			</div>
		)
	}
	render() {
		return (
			<div className="actions-menu-wrapper" onClick={this.toggleMenu}>
				<span><i className="ff-dots-vert" /></span>
				{this.state.isVisible && this.renderList()}
			</div>
		)
	}
}