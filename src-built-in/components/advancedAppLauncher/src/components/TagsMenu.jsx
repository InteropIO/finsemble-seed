/*!
* Copyright 2018 by ChartIQ, Inc.
* All rights reserved.
*
*/

import React from 'react'

/**
* A reusable fly out component for tags and any other lists
* This component creates a button with a customizable label
* and an item click handler.
* Example: <TagsMenu label="Tags" align="left" list={list} onItemClick={handler}/>
**/
export default class TagsMenu extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			isVisible: false
		}
		// Bind context
		this.toggleMenu = this.toggleMenu.bind(this)
		this.onItemClick = this.onItemClick.bind(this)
	}

	toggleMenu() {
		this.setState({
			isVisible: !this.state.isVisible
		})
	}

	onItemClick(item) {
		this.setState({
			isVisible: false
		})
		this.props.onItemClick(item)
	}

	renderList() {
		const items = this.props.list
		const styles = this.props.align === 'right' ? { right: 0 } : { left: 0 }
		return (
			<div onMouseLeave={this.state.isVisible ? this.toggleMenu : Function.prototype}
				className="tags-menu" style={styles}>
				<ul> {
					items.map((item, index) => {
						return <li key={index}
							onClick={() => this.onItemClick(item)}>
							{item}
						</li>
					})
				} </ul>
			</div>
		)
	}
	render() {
		return (
			<div className="tags-menu-wrapper" onClick={this.toggleMenu}>
				<span><i className="ff-tag" />{this.props.label}</span>
				{this.state.isVisible && this.renderList()}
			</div>
		)
	}
}