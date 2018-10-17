/*!
* Copyright 2018 by ChartIQ, Inc.
* All rights reserved.
* 
*/

import "../../../../../assets/css/font-finance.css";
import './AppActionsMenu.css'
import React from  'react'
import storeActions from '../stores/StoreActions'
import {getStore} from '../stores/LauncherStore'


export default class AppActionsMenu extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			isVisible: false
		}
		// Bind context
		this.onAddToFavorite = this.onAddToFavorite.bind(this)
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
	onAddToFavorite() {
		this.toggleMenu()
	}

	onViewInfo() {
		this.toggleMenu()
	}

	onRemove() {
		this.toggleMenu()
	}

	renderList() {
		const folder = storeActions.getActiveFolder()
		const styles = {right: 0}
		return (
		<div onMouseLeave={this.state.isVisible ? this.toggleMenu : null} 
			className="actions-menu" style={styles}>
			<ul>
				<li onClick={this.onAddToFavorite} >Add Favorite</li>
				<li onClick={this.onViewInfo}>View Info</li>
				<li onClick={this.onRemove}>Remove from {folder.name}</li>
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