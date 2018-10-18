/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
 */
import React, { Component } from "react";

class AppCard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			highlighted: false,
			appName: this.props.title !== undefined ? this.props.title : this.props.name,
			entitled: this.props.entitled ? this.props.entitled : false
		};
		this.bindCorrectContext();
	}
	bindCorrectContext() {
		this.toggleHighlight = this.toggleHighlight.bind(this);
		this.openAppShowcase = this.openAppShowcase.bind(this);
		this.addApp = this.addApp.bind(this);
	}
	toggleHighlight() {
		this.setState({
			highlighted: !this.state.highlighted
		})
	}
	openAppShowcase() {
		this.props.openAppShowcase(this.state.appName);
	}
	addApp() {
		this.props.addApp(this.state.appName)
	}
	render() {
		let imageUrl = this.props.images !== undefined ? this.props.images[0].url : "../assets/placeholder.svg";

		let { appName: title } = this.state;

		let appTags = this.props.tags.map((tag, i) => {
			return tag[0].toUpperCase() + tag.substring(1);
		});

		let imageIconClasses = "ff-check-circle";
		if (this.state.highlighted) imageIconClasses += " highlighted"
		else imageIconClasses += " faded";

		let entitled = this.state.entitled ? " entitled" : "";

		return (
			<div className='app-card' onClick={this.openAppShowcase}>
				<div className="app-image-container">
					<i className={imageIconClasses}></i>
					<img className={'app-image' + entitled} src={imageUrl} onMouseEnter={this.toggleHighlight} onMouseLeave={this.toggleHighlight} onClick={this.addApp} />
				</div>
				<h4 className={'app-title' + entitled}>{title}</h4>
				<div className='footer'>
					<span className={"app-tags" + entitled}>
						<i className="ff-tag"></i>
						<span className='tag-names'>
							{appTags.join(", ")}
						</span>
					</span>
				</div>
			</div>
		);
	}
}

export default AppCard;