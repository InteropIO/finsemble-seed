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
			checkShown: false,
			checkHighlighted: false,
			titleUnderlined: false,
			appName: this.props.title || this.props.name,
			entitled: this.props.entitled ? this.props.entitled : false
		};
		this.bindCorrectContext();
	}
	bindCorrectContext() {
		this.toggleHighlight = this.toggleHighlight.bind(this);
		this.toggleTitleUnderline = this.toggleTitleUnderline.bind(this);
		this.showCheck = this.showCheck.bind(this);
		this.hideCheck = this.hideCheck.bind(this);
		this.openAppShowcase = this.openAppShowcase.bind(this);
		this.addApp = this.addApp.bind(this);
		this.removeApp = this.removeApp.bind(this);
		this.addTag = this.addTag.bind(this);
	}
	toggleHighlight() {
		this.setState({
			checkHighlighted: !this.state.checkHighlighted
		})
	}
	toggleTitleUnderline() {
		this.setState({
			titleUnderlined: !this.state.titleUnderlined
		});
	}
	showCheck() {
		this.setState({
			checkShown: true
		});
	}
	hideCheck() {
		this.setState({
			checkShown: false
		});
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

		let { appName: title, checkShown:showCheck } = this.state;

		let imageIconClasses = "ff-check-circle";
		if (this.state.checkHighlighted || this.props.installed) imageIconClasses += " highlighted"
		else imageIconClasses += " faded";

		let titleClass = this.state.titleUnderlined ? "app-title highlighted" : "app-title";

		let entitled = this.state.entitled ? " entitled" : "";

		let addApp = this.props.installed ? this.removeApp : this.addApp;

		return (
			<div className='app-card' onClick={this.openAppShowcase} onMouseEnter={this.showCheck} onMouseLeave={this.hideCheck}>
				<div className="app-image-container">
					{entitled || !showCheck ? null : <i className={imageIconClasses} onMouseEnter={this.toggleHighlight} onMouseLeave={this.toggleHighlight} onClick={addApp}></i>}
					<img className={'app-image' + entitled} src={imageUrl} />
				</div>
				<div className={titleClass} onMouseEnter={this.toggleTitleUnderline} onMouseLeave={this.toggleTitleUnderline}>{title}</div>
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