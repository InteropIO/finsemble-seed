/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 *
 */

import React from "react";

import "./style.css";

/**
 * A reusable fly out component for tags and any other lists
 * This component creates a button with a customizable label
 * and an item click handler.
 * Example: <TagsMenu label="Tags" align="left" list={list} onItemClick={handler}/>
 **/
export default class TagsMenu extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isVisible: false,
		};
		// Bind context
		this.toggleMenu = this.toggleMenu.bind(this);
		this.onItemClick = this.onItemClick.bind(this);
		this.setWrapperRef = this.setWrapperRef.bind(this);
		this.handleClickOutside = this.handleClickOutside.bind(this);
	}

	componentDidMount() {
		document.addEventListener("mousedown", this.handleClickOutside);
	}

	componentWillUnmount() {
		document.removeEventListener("mousedown", this.handleClickOutside);
	}

	toggleMenu() {
		this.setState({
			isVisible: !this.state.isVisible,
		});
	}

	onItemClick(item) {
		this.setState({
			isVisible: false,
		});
		this.props.onItemClick(item);
	}

	setWrapperRef(node) {
		this.wrapperRef = node;
	}

	handleClickOutside(e) {
		if (this.wrapperRef && !this.wrapperRef.contains(e.target)) {
			this.setState({
				isVisible: false,
			});
		}
	}

	renderList() {
		const items = this.props.list;
		const styles = this.props.align === "right" ? { right: 0 } : { left: 0 };
		return (
			<div className="tags-menu" style={styles}>
				<ul>
					{" "}
					{items.sort().map((item, index) => {
						let active = this.props.active.includes(item);

						return (
							<li key={index} onClick={() => this.onItemClick(item)}>
								{active ? (
									<i className="ff-check-mark" />
								) : (
									<div className="tags-checkmark-wrapper">&nbsp;</div>
								)}
								&nbsp;&nbsp;{item}
							</li>
						);
					})}{" "}
				</ul>
			</div>
		);
	}
	render() {
		if (this.props.list.length === 0) return <div></div>;
		return (
			<div
				ref={this.setWrapperRef}
				className="tags-menu-wrapper"
				onClick={this.toggleMenu}
			>
				<span>
					{this.props.label}
					<i className="ff-chevron-down" />
				</span>
				{this.state.isVisible && this.renderList()}
			</div>
		);
	}
}
