/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
 */
import React, { Component } from "react";

// const AppShowcase = props => {
// 	let iconUrl = props.app.icons[0].url !== undefined ? props.app.icons[0].url : "../assets/placeholder.svg";

// 	let name = props.app.title !== undefined ? props.app.title : props.app.name;

// 	let installed = props.app.installed !== undefined ? props.app.installed : false;

// 	let images = [];


// 	return (
// 		<div className="app-showcase">
// 			<div className="header">
// 				<img className="header-icon" src={iconUrl} />
// 				<h3 className="appName">{name}</h3>
// 				<button className="action-button">
// 					{installed ? (
// 						<span className="action-button-label">Open</span>
// 					) : (
// 						<span className="action-button-label">
// 							<i className="ff-plus"></i>
// 							"My Apps"
// 						</span>
// 					)}
// 				</button>
// 			</div>
// 			<div className="image-carousel">
// 				<div className="paginate_carat_left" onClick={} />

// 				<div className="paginate_carat_right" onClick={} />
// 			</div>
// 		</div>
// 	);
// }

class AppShowcase extends Component {
	constructor(props) {
		super(props);
		this.state = {
			name: this.props.app.title !== undefined ? this.props.app.title : this.props.app.name,
			installed: this.props.app.installed !== undefined ? this.props.app.installed : false,
			iconUrl: this.props.app.icons !== undefined && this.props.app.icons[0].url !== undefined ? this.props.app.icons[0].url : "../assets/placeholder.svg",
			imageIndex: 0
		};
		this.bindCorrectContext();
	}
	bindCorrectContext() {
		this.nextImage = this.nextImage.bind(this);
		this.previousImage = this.previousImage.bind(this);
		this.openSite = this.openSite.bind(this);
	}
	nextImage() {
		let index = this.state.imageIndex;
		if (index + 1 > this.props.app.images.length - 1) {
			index = 0;
		} else {
			index++;
		}

		this.setState({
			imageIndex: index
		});
	}
	previousImage() {
		let index = this.state.imageIndex;

		if (index - 1 < 0) {
			index = this.props.app.images.length;
		} else {
			index--;
		}

		this.setState({
			imageIndex: index
		});
	}
	openSite() {
		console.log('open the developers site');
	}
	render() {
		let { name, installed, iconUrl, imageIndex:index } = this.state;

		let images = [this.props.app.images[index].url];
		for (let i = 0; i < 3; i++) {
			let newIndex = index + i;

			if (newIndex > this.props.app.images.length - 1) {
				images.push(this.props.app.images[i].url !== undefined ? this.props.app.images[i].url : "../assets/placeholder.svg");
			} else {
				images.push(this.props.app.images[newIndex].url !== undefined ? this.props.app.images[newIndex].url : "../assets/placeholder.svg");
			}
		}

		return (
			<div className="app-showcase">
				<div className="header">
					<img className="header-icon" src={iconUrl} />
					<h3 className="appName">{name}</h3>
					<button className="action-button">
						{installed ? (
							<span className="action-button-label">Open</span>
						) : (
							<span className="action-button-label">
								<i className="ff-plus"></i>
								"My Apps"
							</span>
						)}
					</button>
				</div>
				<div className="image-carousel-container">
					<div className="paginate_carat_left" onClick={this.previousImage} />
					<div className="image-carousel">
						{images.map((imageUrl) => {
							return (
								<img className='image-carousel-image' src={imageUrl} />
							);
						})}
					</div>
					<div className="paginate_carat_right" onClick={this.nextImage} />
				</div>
				<div className="app-notes description">
					<span className="showcase-label">Description</span>
					<div className="description-content">
						<p>{this.props.app.description}</p>
					</div>
				</div>
				<div className="app-notes release-notes">
					<span className="showcase-label">Release Notes</span>
					<div className="release-notes-content">
						<p>{this.props.app.releaseNotes}</p>
					</div>
				</div>
				<div className="app-notes developer">
					<span className="showcase-label">Developer</span>
					<div className="developer-content">
						<p>{this.props.app.publisher} - <a href="#" onClick={this.openSite} >{this.props.app.contactEmail}</a></p>
					</div>
				</div>
				<div className="dev-notes version-update">
					<div className="version-content">
						<span className="showcase-label">Version</span>
						<div className="version">
							{this.props.app.version}
						</div>
					</div>
					<div className="updated-content">
						<span className="showcase-label">Last Updated</span>
						<div className="updated">
							Not available
						</div>
					</div>
				</div>
				<div className="dev-notes support">
					<div className="support-content">
						<span className="showcase-label">Support</span>
						<div className="support">
							{this.props.app.supportEmail}
						</div>
					</div>
					<div className="tags-content">
						<span className="showcase-label">Tags</span>
						<div className="tags">
							{this.props.app.tags.map((tag) => {
								let tagName = tag[0].toUpperCase() + tag.substring(1);

								return (
									<div className="tag-label">
										<span className="label-content">{tagName}</span>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default AppShowcase;