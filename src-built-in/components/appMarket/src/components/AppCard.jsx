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
			appName: this.props.title || this.props.name,
			entitled: this.props.entitled ? this.props.entitled : false
		};
		this.bindCorrectContext();
	}
	bindCorrectContext() {
		this.toggleHighlight = this.toggleHighlight.bind(this);
		this.openAppShowcase = this.openAppShowcase.bind(this);
		this.addApp = this.addApp.bind(this);
		this.removeApp = this.removeApp.bind(this);
		this.addTag = this.addTag.bind(this);
	}
	toggleHighlight() {
		this.setState({
			highlighted: !this.state.highlighted
		})
	}
	openAppShowcase() {
		this.props.openAppShowcase(this.state.appName);
	}
	addApp(e) {
		e.preventDefault();
		e.stopPropagation();
		this.props.addApp(this.state.appName)
	}
	removeApp(e) {
		e.preventDefault();
		e.stopPropagation();
		this.props.removeApp(this.state.appName);
	}
	addTag(name, e) {
		e.preventDefault();
		e.stopPropagation();
		this.props.addTag(name);
	}
	render() {
		let imageUrl = this.props.images !== undefined ? this.props.images[0].url : "../assets/placeholder.svg";

		let { appName: title } = this.state;

		let imageIconClasses = "ff-check-circle";
		if (this.state.highlighted || this.props.installed) imageIconClasses += " highlighted"
		else imageIconClasses += " faded";

		let entitled = this.state.entitled ? " entitled" : "";

		let addApp = this.props.installed ? this.removeApp : this.addApp;

		return (
			<div className='app-card' onClick={this.openAppShowcase}>
				<div className="app-image-container">
					{entitled ? null : <i className={imageIconClasses} onMouseEnter={this.toggleHighlight} onMouseLeave={this.toggleHighlight} onClick={addApp}></i>}
					<img className={'app-image' + entitled} src={imageUrl} />
				</div>
				<h4 className={'app-title' + entitled}>{title}</h4>
				<div className='footer'>
					<span className={"app-tags" + entitled}>
						<i className="ff-tag"></i>
						<span className='tag-names'>
							{this.props.tags.map((tag, i) => {
								return (
									<span key={i} className='tag-name' onClick={this.addTag.bind(this, tag)}>
										{tag[0].toUpperCase() + tag.substring(1)}{i !== this.props.tags.length - 1 ? ", " : null}
									</span>
								);
							})}
						</span>
					</span>
				</div>
			</div>
		);
	}
}

export default AppCard;